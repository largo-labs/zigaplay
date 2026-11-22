"""Builds the hero of The Tale of Wick: Hollow Wood in Blender, as separate low-poly parts in the style of a 64-bit
console adventure: a big round head with a jaw and a small nose, chunky locks of hair, a green tunic with a flared skirt,
white pants and brown boots. Every part is modelled in the local space of the joint it hangs from in the game's rig
(the waist, the hips, a shoulder, an elbow, a hand, a hip joint, a knee, an ankle, the head), so the game's own
animation moves it.

    blender -b --factory-startup --python tools/models/build_hero.py -- tools/models/out/hero.json

Coordinates are the game's: x across, y up, z forward (the hero faces +z). Lengths match the rig in hollowmere.js
(mkHero): hips .40 up, thigh .20, shin .155, torso .29, shoulders at x .155 y .26, upper arm .149, forearm .161.
The textures are painted separately by tools/models/textures.py; the UVs here point into them:
  head: 'head' (512 x 256, wrapped round the head, the face at the middle)
  everything else: 'body' (a 256 x 256 atlas of cloth, leather, skin and hair swatches, see REG)
"""
import base64, json, math, struct, sys

import bmesh
import bpy
from mathutils import Matrix, Vector

OUT = sys.argv[sys.argv.index('--') + 1]
TAU = math.pi * 2

# the body atlas: name -> (x, y, w, h) in pixels of a 256 x 256 image, top-left origin (textures.py paints the same)
REG = {'coat': (0, 0, 128, 128), 'scarf': (128, 0, 64, 64), 'leather': (192, 0, 64, 64), 'boot': (128, 64, 64, 64),
       'trousers': (192, 64, 64, 64), 'skin': (0, 128, 64, 64), 'hair': (64, 128, 64, 64), 'glove': (128, 128, 64, 64),
       'brass': (192, 128, 64, 64), 'hood': (0, 192, 64, 64), 'sole': (64, 192, 64, 64), 'hair2': (128, 192, 64, 64)}


def reg_uv(name, lu, lv):
    x, y, w, h = REG[name]
    lu = min(max(lu, 0.0), 1.0)
    lv = min(max(lv, 0.0), 1.0)
    return ((x + 1 + lu * (w - 2)) / 256.0, 1.0 - (y + 1 + (1 - lv) * (h - 2)) / 256.0)


class Part:
    """one exported mesh: a bmesh we add shapes to, each shape with its own UV mapping"""

    def __init__(self, name, tex='body', smooth_angle=50, subsurf=0):
        self.name, self.tex, self.smooth_angle, self.subsurf = name, tex, smooth_angle, subsurf
        self.bm = bmesh.new()
        self.uv = self.bm.loops.layers.uv.new('UVMap')

    def faces_uv(self, faces, fn, wrap=False):
        """fn(vertex co) -> (u, v) in 0..1 of the whole texture. Faces that cross a wrap-around seam keep one u"""
        for f in faces:
            uvs = [fn(l.vert.co) for l in f.loops]
            us = [u for u, v in uvs]
            if max(us) - min(us) > 0.5:
                if wrap:
                    uvs = [(u + 1 if u < 0.5 else u, v) for u, v in uvs]
                else:
                    m = max(us)
                    uvs = [(m, v) for u, v in uvs]
            for l, uv in zip(f.loops, uvs):
                l[self.uv].uv = uv

    def lathe(self, rings, seg, region, cap_top=True, cap_bottom=True, zc=None):
        """a solid of revolution round the y axis: rings = [(y, rx, rz, z offset)], bottom to top"""
        bm = self.bm
        vs = []
        for (y, rx, rz, dz) in rings:
            row = []
            for k in range(seg):
                a = TAU * k / seg
                row.append(bm.verts.new((rx * math.sin(a), y, rz * math.cos(a) + dz)))
            vs.append(row)
        faces = []
        for j in range(len(rings) - 1):
            for k in range(seg):
                k2 = (k + 1) % seg
                faces.append(bm.faces.new((vs[j][k], vs[j][k2], vs[j + 1][k2], vs[j + 1][k])))
        y0, y1 = rings[0][0], rings[-1][0]
        if cap_bottom:
            c = bm.verts.new((0, y0 - 0.002 * (1 if y1 > y0 else -1), rings[0][3]))
            for k in range(seg):
                faces.append(bm.faces.new((vs[0][(k + 1) % seg], vs[0][k], c)))
        if cap_top:
            c = bm.verts.new((0, y1 + 0.002 * (1 if y1 > y0 else -1), rings[-1][3]))
            for k in range(seg):
                faces.append(bm.faces.new((vs[-1][k], vs[-1][(k + 1) % seg], c)))
        lo, hi = min(y0, y1), max(y0, y1)
        self.faces_uv(faces, lambda co: reg_uv(region, math.atan2(co.x, co.z) / TAU + 0.5, (co.y - lo) / ((hi - lo) or 1)))
        return faces

    def blob(self, center, radius, region, seg=10, ring=7, deform=None, rot=None):
        """a squashed sphere: radius = (rx, ry, rz)"""
        bm = self.bm
        r = bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=ring, radius=1.0)
        verts = r['verts']
        faces = list({f for v in verts for f in v.link_faces})
        for v in verts:
            x, y, z = v.co.x, v.co.z, -v.co.y          # Blender's z is our y
            p = Vector((x * radius[0], y * radius[1], z * radius[2]))
            if deform:
                p = Vector(deform(p))
            if rot:
                p = rot @ p
            v.co = p + Vector(center)
        self.faces_uv(faces, lambda co: reg_uv(region, math.atan2(co.x - center[0], co.z - center[2]) / TAU + 0.5,
                                               0.5 + (co.y - center[1]) / (2 * radius[1] + 1e-6)))
        return faces

    def spike(self, base, tip, r, region, sides=5, flat=(1.0, 1.0), up=Vector((0, 0, 1))):
        """a lock of hair or a horn: a cone from base to tip, flattened across (flat = width, depth)"""
        bm = self.bm
        base, tip = Vector(base), Vector(tip)
        d = (tip - base).normalized()
        a = up.cross(d)
        if a.length < 1e-4:
            a = Vector((1, 0, 0)).cross(d)
        a.normalize()
        b = d.cross(a).normalized()
        ring = [bm.verts.new(base + (a * math.cos(TAU * k / sides) * r * flat[0] + b * math.sin(TAU * k / sides) * r * flat[1]))
                for k in range(sides)]
        t = bm.verts.new(tip)
        faces = [bm.faces.new((ring[k], ring[(k + 1) % sides], t)) for k in range(sides)]
        faces.append(bm.faces.new(list(reversed(ring))))
        self.faces_uv(faces, lambda co: reg_uv(region, ((co - base).dot(a) / (2 * r) + 0.5), 1 - (co - base).dot(d) / ((tip - base).length or 1)))
        return faces

    def strand(self, pts, r0, r1, region, sides=5, flat=0.5, center=Vector((0, 0, 0))):
        """a lock of hair along a curve: a tube tapering from r0 to r1, flattened against the head (away from center)"""
        bm = self.bm
        pts = [Vector(p) for p in pts]
        n = len(pts)
        rings = []
        for i, p in enumerate(pts):
            t = (pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized()
            out = (p - center).normalized()
            side = t.cross(out).normalized()
            up = side.cross(t).normalized()
            r = r0 + (r1 - r0) * i / (n - 1)
            rings.append([bm.verts.new(p + side * math.cos(TAU * k / sides) * r + up * math.sin(TAU * k / sides) * r * flat) for k in range(sides)])
        faces = []
        for i in range(n - 1):
            for k in range(sides):
                faces.append(bm.faces.new((rings[i][k], rings[i][(k + 1) % sides], rings[i + 1][(k + 1) % sides], rings[i + 1][k])))
        tip = bm.verts.new(pts[-1] + (pts[-1] - pts[-2]).normalized() * r1)
        for k in range(sides):
            faces.append(bm.faces.new((rings[-1][k], rings[-1][(k + 1) % sides], tip)))
        root = bm.verts.new(pts[0] - (pts[1] - pts[0]).normalized() * r0 * 0.5)
        for k in range(sides):
            faces.append(bm.faces.new((rings[0][(k + 1) % sides], rings[0][k], root)))
        # keep the outside out: check one side face against the curve
        f = faces[0]
        f.normal_update()
        if f.normal.dot(f.calc_center_median() - (pts[0] + pts[1]) / 2) < 0:
            bmesh.ops.reverse_faces(bm, faces=faces)
        uvd = {}
        for i, ring in enumerate(rings):
            for k, v in enumerate(ring):
                uvd[v] = (k / sides, 1 - i / (n - 1))
        uvd[tip] = (0.5, 0.0)
        uvd[root] = (0.5, 1.0)
        for f in faces:
            for l in f.loops:
                u, v = uvd[l.vert]
                l[self.uv].uv = reg_uv(region, u, v)
        return faces

    def flap(self, pts, w0, thick, region, center=Vector((0, 0, 0)), tipw=0.0):
        """a chunky lock of hair the way 64-bit games built them: a flat, faceted blade with a diamond section that
        follows a curve, wide at the root and coming to a point. 'out' is away from center (the head's middle)"""
        bm = self.bm
        pts = [Vector(p) for p in pts]
        n = len(pts)
        rings = []
        for i, p in enumerate(pts):
            t = (pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized()
            out = (p - center).normalized()
            side = t.cross(out).normalized()
            f = i / (n - 1)
            w = w0 * (1 - f) + tipw * f
            th = thick * (1 - 0.55 * f)
            rings.append([bm.verts.new(p + side * w), bm.verts.new(p + out * th), bm.verts.new(p - side * w), bm.verts.new(p - out * th * 0.35)])
        faces = []
        for i in range(n - 1):
            for k in range(4):
                faces.append(bm.faces.new((rings[i][k], rings[i][(k + 1) % 4], rings[i + 1][(k + 1) % 4], rings[i + 1][k])))
        tip = bm.verts.new(pts[-1] + (pts[-1] - pts[-2]).normalized() * 0.008)
        for k in range(4):
            faces.append(bm.faces.new((rings[-1][k], rings[-1][(k + 1) % 4], tip)))
        faces.append(bm.faces.new(list(reversed(rings[0]))))
        f = faces[0]
        f.normal_update()
        if f.normal.dot(f.calc_center_median() - (pts[0] + pts[1]) / 2) < 0:
            bmesh.ops.reverse_faces(bm, faces=faces)
        for f in faces:
            for l in f.loops:
                co = l.vert.co
                l[self.uv].uv = reg_uv(region, 0.5 + (co - pts[0]).dot(Vector((1, 0, 0))) * 4, 0.5)
        return faces

    def lock(self, pts, w0, thick, region, center=Vector((0, 0, 0)), swell=0.3, under=0.35, out_dir=None):
        """a broad lock of hair the way that era built them: a ribbon with a lens-shaped section along a curve, swelling a
        little past the root and coming to a point, shaded smooth. w0 is the half-width at the root; the section's top faces
        away from center (or along out_dir). Texture: u runs across the lock, v along it (1 at the root, 0 at the tip)"""
        bm = self.bm
        pts = [Vector(p) for p in pts]
        n = len(pts)
        L = [0.0]
        for i in range(1, n):
            L.append(L[-1] + (pts[i] - pts[i - 1]).length)
        sec = ((1.0, 0.0, 1.0), (0.55, 1.0, 0.8), (-0.55, 1.0, 0.2), (-1.0, 0.0, 0.0), (-0.55, -under, 0.2), (0.55, -under, 0.8))
        m = len(sec)
        rings, uvd = [], {}
        o0 = None
        for i in range(n - 1):
            p = pts[i]
            f = L[i] / L[-1]
            t = (pts[i + 1] - pts[max(i - 1, 0)]).normalized()
            o = Vector(out_dir) if out_dir is not None else (p - Vector(center))
            o = (o - t * o.dot(t)).normalized()
            if o0 is None:
                o0 = o
            sd = t.cross(o).normalized()
            w = w0 * (1 + swell * math.sin(math.pi * min(1.0, f * 1.5))) * (1 - f) ** 0.55
            th = thick * (1 - 0.45 * f)
            ring = []
            for a, b, u in sec:
                v = bm.verts.new(p + sd * (a * w) + o * (b * th))
                uvd[v] = (u, 1 - f)
                ring.append(v)
            rings.append(ring)
        tip = bm.verts.new(pts[-1])
        uvd[tip] = (0.5, 0.0)
        root = bm.verts.new(pts[0] - (pts[1] - pts[0]).normalized() * thick * 0.4)
        uvd[root] = (0.5, 1.0)
        faces = []
        for i in range(len(rings) - 1):
            for k in range(m):
                faces.append(bm.faces.new((rings[i][k], rings[i][(k + 1) % m], rings[i + 1][(k + 1) % m], rings[i + 1][k])))
        for k in range(m):
            faces.append(bm.faces.new((rings[-1][k], rings[-1][(k + 1) % m], tip)))
            faces.append(bm.faces.new((rings[0][(k + 1) % m], rings[0][k], root)))
        # the face over the top of the section must face out
        f = faces[1]
        f.normal_update()
        if f.normal.dot(o0) < 0:
            bmesh.ops.reverse_faces(bm, faces=faces)
        for f in faces:
            for l in f.loops:
                u, v = uvd[l.vert]
                l[self.uv].uv = reg_uv(region, u, v)
        return faces

    def torus(self, center, R, r, region, seg=16, tseg=7, squash=(1.0, 1.0)):
        bm = self.bm
        vs = []
        for i in range(seg):
            u = TAU * i / seg
            row = []
            for j in range(tseg):
                v = TAU * j / tseg
                rr = R + r * math.cos(v)
                row.append(bm.verts.new((center[0] + rr * math.sin(u) * squash[0], center[1] + r * math.sin(v), center[2] + rr * math.cos(u) * squash[1])))
            vs.append(row)
        faces = []
        for i in range(seg):
            for j in range(tseg):
                faces.append(bm.faces.new((vs[i][j], vs[(i + 1) % seg][j], vs[(i + 1) % seg][(j + 1) % tseg], vs[i][(j + 1) % tseg])))
        self.faces_uv(faces, lambda co: reg_uv(region, math.atan2(co.x - center[0], co.z - center[2]) / TAU + 0.5,
                                               0.5 + (co.y - center[1]) / (2 * r + 1e-6)))
        return faces

    def finish(self):
        bm = self.bm
        # every shape here is built facing outward (spheres, lathes, spikes, tori), so the winding is kept as it is:
        # Blender's recalc_face_normals guesses wrong on the shaped head and turns it inside out
        for f in bm.faces:
            f.smooth = True
        me = bpy.data.meshes.new(self.name)
        bm.to_mesh(me)
        bm.free()
        me.use_auto_smooth = True
        me.auto_smooth_angle = math.radians(self.smooth_angle)
        ob = bpy.data.objects.new(self.name, me)
        bpy.context.collection.objects.link(ob)
        if self.subsurf:
            m = ob.modifiers.new('sub', 'SUBSURF')
            m.levels = self.subsurf
            m.render_levels = self.subsurf
        return ob


# ------------------------------------------------------------------------------------------------ the head
HEAD_R = 0.118


def _sm(a, b, v):
    """0 at a, 1 at b, smooth between"""
    t = min(1.0, max(0.0, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)


def _plane(a, b, c):
    """the plane through three points, its normal facing away from the middle of the head: (normal, distance)"""
    a, b, c = Vector(a), Vector(b), Vector(c)
    n = (b - a).cross(c - a).normalized()
    if n.dot(a) < 0:
        n = -n
    return n, n.dot(a)


# the jaw is carved by planes. The underside: from the bottom of the chin back up to where the neck goes in. Each side:
# through the angle of the jaw under the ear, the side of the chin and the cheek, so the lower face closes in to the chin
JAW_ANGLE = (0.097, -0.082, -0.01)
CHIN_SIDE = (0.024, -0.128, 0.084)
CHEEK = (0.11, -0.05, 0.04)
JAW_PLANES = [_plane((0.0, -0.13, 0.082), (1.0, -0.13, 0.082), (0.0, -0.11, -0.01)), _plane(JAW_ANGLE, CHIN_SIDE, CHEEK),
              _plane((-JAW_ANGLE[0],) + JAW_ANGLE[1:], (-CHIN_SIDE[0],) + CHIN_SIDE[1:], (-CHEEK[0],) + CHEEK[1:])]
JAW_SOFT = 0.009     # how round the jaw's edges are: a kid's jaw is soft


def head_shape(p, grow=0.0):
    """a kid's head: a little narrow, taller than wide, the back of the skull round, the face flatter, full round cheeks,
    a soft brow and a nose that stands out; below, a soft jaw that closes in from the cheeks to a small rounded chin, which
    comes forward so that in profile it stands a little in front of the eyes, and the underside of the jaw running back
    into the neck"""
    d = p.normalized()
    x, y, z = d.x * HEAD_R, d.y * HEAD_R, d.z * HEAD_R
    x *= 0.95
    y *= 1.07
    if z < 0:
        z *= 1.05
    if y < 0:
        t = min(1.0, -y / 0.125)
        # the back of the head rounds in toward the neck; the front stays full for the jaw to be cut from
        x *= 1 - (0.2 - 0.14 * _sm(-0.2, 0.3, d.z)) * t ** 1.25
        if z > 0:
            z *= 1 - 0.08 * t * t
        # the face runs on down a little at the front, to the chin
        y -= 0.012 * _sm(0.45, 0.92, -d.y) * _sm(0.05, 0.6, d.z)
    if z > 0.04 and -0.076 < y < 0.0:
        k = 1 - abs(y + 0.038) / 0.038
        x *= 1 + 0.05 * k
    if z > 0.075:
        z = 0.075 + (z - 0.075) * 0.7
    # the mouth sits a little forward, so the face between the nose and the chin isn't hollow
    if -0.1 < y < -0.02 and z > 0:
        z += 0.006 * math.exp(-((y + 0.062) / 0.018) ** 2) * math.exp(-(x / 0.04) ** 2) * _sm(0.02, 0.06, z)
    # the chin comes forward, so in profile it stands out a little in front of the eyes
    if y < -0.06 and z > 0:
        z += 0.036 * math.exp(-((y + 0.104) / 0.022) ** 2) * math.exp(-(x / 0.046) ** 2) * _sm(0.02, 0.06, z)
    # carve the jaw: along the line from the middle of the head, take the nearest of the head and the planes, softly
    pb = Vector((x, y, z))
    rb = pb.length
    u = pb / rb
    rs = [rb] + [c / n.dot(u) for n, c in JAW_PLANES if n.dot(u) > 1e-4]
    r0 = min(rs)
    r = r0 - JAW_SOFT * math.log(sum(math.exp(-(ri - r0) / JAW_SOFT) for ri in rs))
    x, y, z = u.x * r, u.y * r, u.z * r
    if z > 0.05 and abs(x) < 0.085 and abs(y - 0.045) < 0.016:
        z += 0.004 * (1 - abs(y - 0.045) / 0.016)
    dn = math.hypot(x / 0.022, (y + 0.024) / 0.03)
    if z > 0 and dn < 1:
        z += 0.027 * (1 - dn * dn)
    # a soft dip between the lower lip and the chin
    dl = math.hypot(x / 0.03, (y + 0.08) / 0.011)
    if z > 0 and dl < 1:
        z -= 0.0015 * (1 - dl * dl)
    if grow:
        n = Vector((x, y, z)).normalized()
        x, y, z = x + n.x * grow, y + n.y * grow, z + n.z * grow
    return (x, y, z)


def head_part():
    P = Part('head', tex='head', smooth_angle=80)
    bm = P.bm
    r = bmesh.ops.create_uvsphere(bm, u_segments=28, v_segments=20, radius=1.0)
    for v in r['verts']:
        v.co = Vector((v.co.x, v.co.z, -v.co.y))
    # the texture wraps round by direction, before the head is shaped: the face at u = .5
    P.faces_uv(list(bm.faces), lambda co: (math.atan2(co.x, co.z) / TAU + 0.5, 0.5 + math.asin(max(-1, min(1, co.normalized().y))) / math.pi), wrap=True)
    for v in bm.verts:
        v.co = Vector(head_shape(v.co))
    return P.finish()


HAIRLINE = [(0.0, 0.66), (0.3, 0.5), (0.6, 0.42), (0.9, 0.36), (1.3, 0.25), (1.57, 0.2), (1.85, 0.06), (2.25, -0.27), (2.7, -0.42), (math.pi, -0.46)]


def hairline(th):
    """the latitude of the hairline at azimuth th (radians, 0 = the middle of the face): the forehead, round over the
    ears, down to the nape. textures.py paints the same line a little lower, so no skin shows under the edge"""
    a = abs(th)
    for (a0, l0), (a1, l1) in zip(HAIRLINE, HAIRLINE[1:]):
        if a <= a1:
            f = (a - a0) / (a1 - a0)
            f = f * f * (3 - 2 * f)
            return l0 + (l1 - l0) * f
    return HAIRLINE[-1][1]


def dirv(th, lat):
    return Vector((math.sin(th) * math.cos(lat), math.sin(lat), math.cos(th) * math.cos(lat)))


def crom(keys, n):
    """n points along a Catmull-Rom curve through keys (Vectors of any size)"""
    K = [keys[0] * 2 - keys[1]] + list(keys) + [keys[-1] * 2 - keys[-2]]
    segs = len(keys) - 1
    out = []
    for i in range(n):
        u = i / (n - 1) * segs
        j = min(int(u), segs - 1)
        t = u - j
        p0, p1, p2, p3 = K[j], K[j + 1], K[j + 2], K[j + 3]
        out.append(0.5 * (p1 * 2 + (p2 - p0) * t + (p0 * 2 - p1 * 5 + p2 * 4 - p3) * (t * t) + (p1 * 3 - p0 - p2 * 3 + p3) * (t * t * t)))
    return out


def hair_part():
    """golden-blond hair, built the way that era did it: a smooth cap from the hairline to the crown with a defined middle
    part down the front, then a few broad, smooth locks swept from the part to each side: two layers of bangs that frame
    the forehead, a longer lock down each side of the face, one in front of each ear, layers over the sides and the back
    gathered to a leather tie at the nape, and a small full ponytail hanging from it (colours in textures.py)"""
    P = Part('hair', smooth_angle=65)
    bm = P.bm
    # the cap: rings from the hairline up to the crown, so its edge follows the hairline cleanly
    NA, NL = 24, 6
    rows = []
    for j in range(NL):
        row = []
        for i in range(NA):
            th = -math.pi + TAU * i / NA
            l0 = hairline(th)
            f = j / NL
            lat = l0 + (math.pi / 2 - l0) * (1 - (1 - f) ** 1.4)
            g = 0.004 + 0.005 * min(1.0, j / 2)
            # the middle part: a crease down the front of the crown, the hair a little fuller each side of it
            if abs(th) < 1e-6 and lat < 1.5:
                g -= 0.006 * min(1.0, (1.5 - lat) / 0.25)
            elif abs(abs(th) - TAU / NA) < 1e-6 and lat < 1.5:
                g += 0.002
            row.append((bm.verts.new(head_shape(dirv(th, lat), grow=g)), i / NA, 0.06 + 0.9 * f))
        rows.append(row)
    crown = bm.verts.new(head_shape(Vector((0, 1, 0)), grow=0.009))
    cap = []
    for j in range(NL - 1):
        for i in range(NA):
            a, b = rows[j][i], rows[j][(i + 1) % NA]
            c, d = rows[j + 1][(i + 1) % NA], rows[j + 1][i]
            ub = b[1] if i + 1 < NA else 1.0
            uc = c[1] if i + 1 < NA else 1.0
            fc = bm.faces.new((a[0], b[0], c[0], d[0]))
            cap.append((fc, [(a[1], a[2]), (ub, b[2]), (uc, c[2]), (d[1], d[2])]))
    for i in range(NA):
        a, b = rows[-1][i], rows[-1][(i + 1) % NA]
        ub = b[1] if i + 1 < NA else 1.0
        fc = bm.faces.new((a[0], b[0], crown))
        cap.append((fc, [(a[1], a[2]), (ub, b[2]), ((a[1] + ub) / 2, 0.98)]))
    for fc, uvs in cap:
        for l, (u, v) in zip(fc.loops, uvs):
            l[P.uv].uv = reg_uv('hair2', u, v)

    def path(keys, n=7):
        """keys: (azimuth, latitude, how far off the head); a smooth curve over the head through them"""
        ks = [Vector(tuple(dirv(th, lat)) + (g,)) for th, lat, g in keys]
        out = []
        for k in crom(ks, n):
            out.append(Vector(head_shape(Vector(k[:3]).normalized(), grow=k[3])))
        return out
    for sd in (-1, 1):
        # the bangs, two layers: the front one from the part over the top corner of the forehead, the one behind it
        # longer, its point at the temple beside the end of the brow. The forehead shows between them in a V
        P.lock(path([(sd * 0.03, 0.98, 0.004), (sd * 0.1, 0.8, 0.015), (sd * 0.19, 0.56, 0.019), (sd * 0.25, 0.34, 0.016)]), 0.017, 0.012, 'hair', swell=0.4)
        P.lock(path([(sd * 0.04, 1.12, 0.004), (sd * 0.24, 0.92, 0.014), (sd * 0.44, 0.6, 0.017), (sd * 0.56, 0.3, 0.015)]), 0.02, 0.012, 'hair', swell=0.4)
        P.lock(path([(sd * 0.05, 1.2, 0.004), (sd * 0.42, 0.98, 0.012), (sd * 0.68, 0.62, 0.015), (sd * 0.8, 0.26, 0.013)]), 0.02, 0.011, 'hair', swell=0.35)
        # a longer lock down each side of the face, past the eyes
        P.lock(path([(sd * 0.06, 1.28, 0.004), (sd * 0.55, 1.0, 0.012), (sd * 0.84, 0.58, 0.014), (sd * 0.97, 0.18, 0.013), (sd * 1.0, -0.1, 0.011)]),
               0.022, 0.011, 'hair')
        # in front of the ear, down to the jaw
        P.lock(path([(sd * 0.95, 0.95, 0.004), (sd * 1.13, 0.5, 0.011), (sd * 1.2, 0.05, 0.012), (sd * 1.2, -0.4, 0.01)]), 0.02, 0.011, 'hair')
        # over the side, above the ear and back toward the nape
        P.lock(path([(sd * 0.1, 1.46, 0.004), (sd * 1.3, 1.05, 0.011), (sd * 1.8, 0.5, 0.012), (sd * 2.05, 0.05, 0.011), (sd * 2.2, -0.2, 0.009)]),
               0.026, 0.011, 'hair')
        # the back, gathered down to the tie
        P.lock(path([(sd * 1.5, 1.32, 0.004), (sd * 2.2, 0.85, 0.011), (sd * 2.7, 0.2, 0.011), (sd * 2.97, -0.3, 0.007)]), 0.028, 0.011, 'hair')
        P.lock(path([(sd * 2.6, 1.32, 0.004), (sd * 2.8, 0.7, 0.011), (sd * 2.95, 0.1, 0.01), (sd * 3.05, -0.3, 0.007)]), 0.026, 0.01, 'hair')
    # the tie: a leather band round the gathered hair at the nape
    tie = Vector(head_shape(dirv(math.pi, -0.36), grow=0.006))
    ax = Vector((0, -0.62, -0.78)).normalized()
    a1 = Vector((1, 0, 0))
    a2 = ax.cross(a1).normalized()
    band = []
    for c, r in ((tie - ax * 0.004, 0.0165), (tie + ax * 0.011, 0.0155)):
        band.append([bm.verts.new(c + (a1 * math.cos(TAU * k / 8) + a2 * math.sin(TAU * k / 8)) * r) for k in range(8)])
    bf = [bm.faces.new((band[0][k], band[0][(k + 1) % 8], band[1][(k + 1) % 8], band[1][k])) for k in range(8)]
    bf.append(bm.faces.new(list(reversed(band[0]))))
    bf.append(bm.faces.new(band[1]))
    f = bf[0]
    f.normal_update()
    if f.normal.dot(f.calc_center_median() - (tie + ax * 0.0035)) < 0:
        bmesh.ops.reverse_faces(bm, faces=bf)
    P.faces_uv(bf, lambda co: reg_uv('leather', 0.5, 0.5))
    # the ponytail: small and full, hanging down the back of the neck, its end in three points
    back = Vector((0, 0.25, -1))
    T = [tie + Vector(o) for o in ((0, -0.004, -0.004), (0, -0.03, -0.028), (0, -0.064, -0.037), (0, -0.098, -0.034), (0, -0.136, -0.024))]
    P.lock(T, 0.019, 0.019, 'hair', out_dir=back, swell=0.4, under=0.85)
    for sd in (-1, 1):
        P.lock([tie + Vector(o) for o in ((0, -0.055, -0.035), (sd * 0.009, -0.09, -0.035), (sd * 0.016, -0.118, -0.028))], 0.009, 0.009, 'hair',
               out_dir=back, swell=0.2, under=0.8)
    return P.finish()


def ears_part():
    P = Part('ears', smooth_angle=70)
    for sd in (-1, 1):
        P.blob((sd * 0.104, -0.008, -0.004), (0.014, 0.03, 0.022), 'skin', seg=8, ring=6)
        P.blob((sd * 0.112, -0.006, -0.002), (0.006, 0.018, 0.012), 'skin', seg=6, ring=5)
    return P.finish()


# ------------------------------------------------------------------------------------------------ the body
def torso_part():
    """the tunic's body: a boy's chest, wider across the shoulders, closing in toward the neck"""
    P = Part('torso', subsurf=1)
    P.lathe([(-0.02, 0.126, 0.1, 0), (0.06, 0.128, 0.102, 0), (0.14, 0.13, 0.104, 0.004), (0.2, 0.14, 0.108, 0.008), (0.24, 0.15, 0.104, 0.006),
             (0.265, 0.152, 0.096, 0.003), (0.285, 0.132, 0.082, 0), (0.3, 0.09, 0.062, 0), (0.312, 0.05, 0.045, 0)], 16, 'coat')
    P.lathe([(0.292, 0.104, 0.071, 0), (0.304, 0.078, 0.058, 0)], 16, 'hood', cap_top=False, cap_bottom=False)
    return P.finish()


def neck_part():
    """a boy's neck: slim under the big head and a little wider where it meets the shoulders, long enough to show between
    the chin and the tunic's collar (the head joint sits higher for it, in the game)"""
    P = Part('neck', subsurf=1)
    P.lathe([(0.27, 0.05, 0.046, 0.0), (0.3, 0.044, 0.041, 0.002), (0.33, 0.039, 0.037, 0.004), (0.37, 0.037, 0.035, 0.006), (0.41, 0.038, 0.036, 0.006),
             (0.45, 0.038, 0.036, 0.004)], 12, 'skin')
    return P.finish()


def hood_part():
    """the hood, down: bunched on the shoulders behind the neck"""
    P = Part('hood', subsurf=1)
    P.blob((0, 0.285, -0.075), (0.11, 0.055, 0.07), 'hood', seg=10, ring=6)
    P.blob((0, 0.25, -0.1), (0.085, 0.05, 0.035), 'hood', seg=8, ring=5)
    return P.finish()


def scarf_part():
    P = Part('scarf', subsurf=1)
    P.torus((0, 0.293, 0.004), 0.072, 0.03, 'scarf', seg=14, tseg=6, squash=(1.0, 0.92))
    return P.finish()


def tail_part():
    """the end of the scarf that blows about (hangs from the tail joint)"""
    P = Part('tail', subsurf=1)
    P.lathe([(-0.25, 0.024, 0.008, 0), (-0.18, 0.027, 0.009, 0), (-0.06, 0.029, 0.01, 0), (0.0, 0.026, 0.012, 0)], 6, 'scarf')
    return P.finish()


def skirt_part():
    """the tunic's skirt, to the middle of the thigh, flaring out a little (hangs from the hips)"""
    P = Part('skirt', subsurf=1)
    P.lathe([(0.27, 0.17, 0.148, -0.008), (0.31, 0.166, 0.142, -0.004), (0.36, 0.156, 0.132, 0), (0.41, 0.145, 0.12, 0), (0.45, 0.133, 0.11, 0)],
            16, 'coat', cap_top=False, cap_bottom=False)
    return P.finish()


def belt_part():
    P = Part('belt')
    P.lathe([(0.392, 0.152, 0.128, 0), (0.43, 0.15, 0.126, 0)], 16, 'leather', cap_top=False, cap_bottom=False)
    P.blob((0, 0.411, 0.128), (0.024, 0.02, 0.008), 'brass', seg=6, ring=4)
    return P.finish()


def upper_arm_part():
    """from the shoulder joint down: the tunic's short sleeve over a rounded shoulder with a darker hem, then the bare
    upper arm. It runs on a little past the elbow and rounds off inside the forearm, so the arm bends there in one piece"""
    P = Part('uarm', subsurf=1)
    P.lathe([(-0.075, 0.047, 0.046, 0), (-0.06, 0.05, 0.049, 0), (-0.02, 0.054, 0.052, 0), (0.01, 0.052, 0.05, -0.002), (0.03, 0.038, 0.038, -0.004),
             (0.042, 0.015, 0.015, -0.004)], 12, 'coat')
    P.lathe([(-0.083, 0.047, 0.046, 0), (-0.068, 0.0505, 0.0495, 0)], 12, 'hood', cap_top=False, cap_bottom=False)
    P.lathe([(-0.178, 0.004, 0.004, 0.002), (-0.172, 0.02, 0.019, 0.002), (-0.162, 0.029, 0.028, 0.002), (-0.15, 0.031, 0.03, 0.002), (-0.13, 0.033, 0.032, 0.003),
             (-0.095, 0.036, 0.036, 0.006), (-0.06, 0.036, 0.035, 0.003), (-0.04, 0.034, 0.034, 0)], 10, 'skin', cap_bottom=False)
    return P.finish()


def forearm_part():
    """from the elbow down: the lower arm, the same thickness as the upper arm where they meet, a little fuller below the
    elbow and narrowing to the wrist. Its top rounds off inside the upper arm"""
    P = Part('farm', subsurf=1)
    P.lathe([(-0.166, 0.024, 0.022, 0.002), (-0.155, 0.026, 0.024, 0.002), (-0.12, 0.029, 0.027, 0.002), (-0.06, 0.034, 0.031, 0.003), (-0.025, 0.033, 0.031, 0.002),
             (0.0, 0.031, 0.03, 0.002), (0.012, 0.028, 0.027, 0.002), (0.02, 0.018, 0.017, 0.002), (0.025, 0.004, 0.004, 0.002)], 10, 'skin', cap_top=False)
    return P.finish()


def hand_part(sd):
    """a bare hand in one piece: the palm, with four fingers growing out of it that bend at the knuckle and again at
    each joint, curling a little toward the palm, and a thumb out of the front. Smoothed once, so it is all one surface.
    sd = -1 for the left arm (arms[0]), +1 for the right. The wrist is at y +.036 (the hand joint sits a little below
    the end of the forearm)"""
    P = Part('hand' + ('L' if sd < 0 else 'R'), smooth_angle=80, subsurf=1)
    bm = P.bm
    inward = -sd                                  # the side the palm faces
    xs = (inward * 0.012, -inward * 0.009)        # the palm's face and the back of the hand
    ys = (0.036, 0.012, -0.012)                   # wrist, half way, knuckles
    zs = (-0.025, -0.0125, 0.0, 0.0125, 0.025)    # four fingers side by side; the thumb side is +z
    g = {(yi, zi, xi): bm.verts.new((x, y, z)) for yi, y in enumerate(ys) for zi, z in enumerate(zs) for xi, x in enumerate(xs)}
    quads = []

    def q(*vs):
        quads.append(bm.faces.new(vs))
    for yi in range(2):
        for zi in range(4):
            q(g[(yi, zi, 0)], g[(yi, zi + 1, 0)], g[(yi + 1, zi + 1, 0)], g[(yi + 1, zi, 0)])
            q(g[(yi + 1, zi, 1)], g[(yi + 1, zi + 1, 1)], g[(yi, zi + 1, 1)], g[(yi, zi, 1)])
        q(g[(yi, 0, 0)], g[(yi + 1, 0, 0)], g[(yi + 1, 0, 1)], g[(yi, 0, 1)])
    q(g[(1, 4, 0)], g[(1, 4, 1)], g[(2, 4, 1)], g[(2, 4, 0)])
    for zi in range(4):
        q(g[(0, zi, 1)], g[(0, zi + 1, 1)], g[(0, zi + 1, 0)], g[(0, zi, 0)])

    def digit(root, segs):
        """grow a finger out of four root vertices: segs = [(length, bend, taper)], bending toward the palm"""
        ring = list(root)
        c0 = sum((v.co for v in ring), Vector()) / 4
        offs = [v.co - c0 for v in ring]
        c, ang = c0.copy(), 0.0
        for ln, bend, taper in segs:
            ang += bend
            rot = Matrix.Rotation(inward * ang, 3, 'Z')
            c = c + rot @ Vector((0, -ln, 0))
            new = [bm.verts.new(c + rot @ (o * taper)) for o in offs]
            for k in range(4):
                q(ring[k], ring[(k + 1) % 4], new[(k + 1) % 4], new[k])
            ring = new
        q(*ring)
    for zi, ln in ((0, 0.019), (1, 0.024), (2, 0.026), (3, 0.023)):
        root = [g[(2, zi, 0)], g[(2, zi + 1, 0)], g[(2, zi + 1, 1)], g[(2, zi, 1)]]
        digit(root, [(ln * 0.42, 0.22, 0.92), (ln * 0.33, 0.3, 0.82), (ln * 0.25, 0.3, 0.68)])
    # the thumb: out of the upper part of the front edge, forward and down
    ring = [g[(0, 4, 0)], g[(1, 4, 0)], g[(1, 4, 1)], g[(0, 4, 1)]]
    c0 = sum((v.co for v in ring), Vector()) / 4
    offs = [v.co - c0 for v in ring]
    c = c0.copy()
    for ln, d, taper in ((0.014, Vector((inward * 0.25, -0.35, 0.9)), 0.8), (0.016, Vector((inward * 0.35, -0.7, 0.6)), 0.62)):
        c = c + d.normalized() * ln
        new = [bm.verts.new(c + o * taper) for o in offs]
        for k in range(4):
            q(ring[k], ring[(k + 1) % 4], new[(k + 1) % 4], new[k])
        ring = new
    q(*ring)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    # it is closed, so its signed volume says whether it is inside out
    bm.normal_update()
    vol = sum(f.calc_center_median().dot(f.normal) * f.calc_area() for f in bm.faces)
    if vol < 0:
        bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    for f in bm.faces:
        for l in f.loops:
            l[P.uv].uv = reg_uv('skin', 0.5, 0.5)
    return P.finish()


def thigh_part():
    P = Part('thigh', subsurf=1)
    P.lathe([(-0.205, 0.045, 0.044, 0), (-0.19, 0.047, 0.046, 0), (-0.1, 0.055, 0.053, 0), (-0.02, 0.062, 0.06, 0), (0.02, 0.06, 0.058, 0)], 10, 'trousers')
    return P.finish()


def shin_part():
    """from the knee: the white pants over the knee, then a brown boot with its top turned down into a cuff"""
    P = Part('shin', subsurf=1)
    P.lathe([(-0.075, 0.046, 0.045, 0.002), (-0.03, 0.05, 0.049, 0.001), (0.0, 0.052, 0.051, 0), (0.02, 0.05, 0.05, 0)], 10, 'trousers')
    P.lathe([(-0.158, 0.044, 0.043, 0.004), (-0.15, 0.045, 0.044, 0.004), (-0.11, 0.047, 0.046, 0.003), (-0.085, 0.049, 0.048, 0.002),
             (-0.08, 0.058, 0.056, 0.001), (-0.05, 0.059, 0.057, 0), (-0.045, 0.05, 0.049, 0)], 12, 'boot')
    return P.finish()


def foot_part():
    """the boot's foot, from the ankle: a rounded toe a little turned up, a heel, and a dark sole"""
    P = Part('foot', subsurf=1)

    def toe(p):
        x, y, z = p.x, p.y, p.z
        if y < -0.03:
            y = -0.03 - (y + 0.03) * 0.25
        if z > 0.05:
            y += (z - 0.05) * 0.12
        return (x, y, z)
    P.blob((0, -0.012, 0.05), (0.05, 0.034, 0.1), 'boot', seg=12, ring=8, deform=toe)
    P.blob((0, -0.03, -0.022), (0.045, 0.02, 0.035), 'boot', seg=8, ring=5)
    P.lathe([(-0.047, 0.05, 0.12, 0.045), (-0.038, 0.052, 0.125, 0.045)], 12, 'sole')
    return P.finish()


# ------------------------------------------------------------------------------------------------ export
def export(ob):
    dg = bpy.context.evaluated_depsgraph_get()
    ev = ob.evaluated_get(dg)
    me = ev.to_mesh()
    me.calc_normals_split()
    me.calc_loop_triangles()
    uvl = me.uv_layers.active.data
    verts, idx, seen = [], [], {}
    for tri in me.loop_triangles:
        for li in tri.loops:
            l = me.loops[li]
            co = me.vertices[l.vertex_index].co
            n = l.normal
            uv = uvl[li].uv
            k = (l.vertex_index, round(n.x, 2), round(n.y, 2), round(n.z, 2), round(uv.x, 4), round(uv.y, 4))
            i = seen.get(k)
            if i is None:
                i = len(verts)
                seen[k] = i
                verts.append((co.x, co.y, co.z, n.x, n.y, n.z, uv.x, uv.y))
            idx.append(i)
    ev.to_mesh_clear()
    if len(verts) > 65535:
        raise SystemExit(f'{ob.name}: too many vertices for 16-bit indices')
    pos = struct.pack(f'<{len(verts) * 3}f', *[c for v in verts for c in v[0:3]])
    nor = struct.pack(f'<{len(verts) * 3}b', *[max(-127, min(127, round(c * 127))) for v in verts for c in v[3:6]])
    uvs = struct.pack(f'<{len(verts) * 2}H', *[max(0, min(65535, round(c * 65535))) for v in verts for c in (v[6], v[7] % 1.0000001 if v[6] <= 1.0 else v[7])])
    # u may run past 1 on the head (it wraps round); keep it below 2 by storing u/2 for the head
    return verts, idx, pos, nor, uvs


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    parts = [head_part(), hair_part(), ears_part(), torso_part(), neck_part(), skirt_part(),
             belt_part(), upper_arm_part(), forearm_part(), hand_part(-1), hand_part(1), thigh_part(), shin_part(), foot_part()]
    out, tris = {}, 0
    for ob in parts:
        verts, idx, pos, nor, _ = export(ob)
        tex = 'head' if ob.name == 'head' else 'body'
        # u on the head wraps past 1, so it is stored halved (the game doubles it back)
        if tex == 'head':
            uvs = struct.pack(f'<{len(verts) * 2}H', *[max(0, min(65535, round(c * 65535))) for v in verts for c in (v[6] / 2, v[7])])
        else:
            uvs = struct.pack(f'<{len(verts) * 2}H', *[max(0, min(65535, round(c * 65535))) for v in verts for c in (v[6], v[7])])
        out[ob.name] = {'t': tex, 'p': base64.b64encode(pos).decode(), 'n': base64.b64encode(nor).decode(), 'u': base64.b64encode(uvs).decode(),
                        'i': base64.b64encode(struct.pack(f'<{len(idx)}H', *idx)).decode(), 'uh': 1 if tex == 'head' else 0}
        tris += len(idx) // 3
        print(f'{ob.name}: {len(verts)} verts, {len(idx) // 3} tris')
    with open(OUT, 'w') as f:
        json.dump(out, f)
    print(f'hero: {len(parts)} parts, {tris} triangles -> {OUT}')


main()
