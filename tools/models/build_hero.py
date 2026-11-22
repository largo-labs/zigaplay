"""Builds the hero of The Tale of Wick: Hollow Wood in Blender, as separate low-poly parts in the style of a 64-bit
console adventure: a big round head with a jaw and a small nose, chunky locks of hair, a coat with a flared skirt,
a scarf, gloves and boots. Every part is modelled in the local space of the joint it hangs from in the game's rig
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
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1]
TAU = math.pi * 2

# the body atlas: name -> (x, y, w, h) in pixels of a 256 x 256 image, top-left origin (textures.py paints the same)
REG = {'coat': (0, 0, 128, 128), 'scarf': (128, 0, 64, 64), 'leather': (192, 0, 64, 64), 'boot': (128, 64, 64, 64),
       'trousers': (192, 64, 64, 64), 'skin': (0, 128, 64, 64), 'hair': (64, 128, 64, 64), 'glove': (128, 128, 64, 64),
       'brass': (192, 128, 64, 64), 'hood': (0, 192, 64, 64), 'sole': (64, 192, 64, 64)}


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


def head_shape(p, grow=0.0):
    """the head: a little narrow, taller than wide, the back of the skull round, the face flatter, the jaw narrowing to a
    firm chin, full cheeks, a brow, and a small nose that stands out"""
    d = p.normalized()
    x, y, z = d.x * HEAD_R, d.y * HEAD_R, d.z * HEAD_R
    x *= 0.95
    y *= 1.07
    if z < 0:
        z *= 1.05
    if y < 0:
        t = min(1.0, -y / 0.125)
        x *= 1 - 0.30 * t ** 1.5
        if z > 0:
            z *= 1 - 0.08 * t * t
    if z > 0.04 and -0.07 < y < 0.0:
        k = 1 - abs(y + 0.035) / 0.035
        x *= 1 + 0.035 * k
    if z > 0.075:
        z = 0.075 + (z - 0.075) * 0.7
    if z > 0.05 and abs(x) < 0.085 and abs(y - 0.045) < 0.016:
        z += 0.006 * (1 - abs(y - 0.045) / 0.016)
    dn = math.hypot(x / 0.019, (y + 0.02) / 0.03)
    if z > 0 and dn < 1:
        z += 0.022 * (1 - dn * dn)
    dc = math.hypot(x / 0.05, (y + 0.104) / 0.028)
    if z > 0 and dc < 1:
        z += 0.007 * (1 - dc * dc)
    if grow:
        n = Vector((x, y, z)).normalized()
        x, y, z = x + n.x * grow, y + n.y * grow, z + n.z * grow
    return (x, y, z)


def head_part():
    P = Part('head', tex='head', smooth_angle=80)
    bm = P.bm
    r = bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=16, radius=1.0)
    for v in r['verts']:
        v.co = Vector((v.co.x, v.co.z, -v.co.y))
    # the texture wraps round by direction, before the head is shaped: the face at u = .5
    P.faces_uv(list(bm.faces), lambda co: (math.atan2(co.x, co.z) / TAU + 0.5, 0.5 + math.asin(max(-1, min(1, co.normalized().y))) / math.pi), wrap=True)
    for v in bm.verts:
        v.co = Vector(head_shape(v.co))
    return P.finish()


def hair_part():
    """a cap of hair over the crown and down the back, and chunky locks: a fringe, locks in front of the ears, a few at
    the nape and some sticking up on top"""
    P = Part('hair', smooth_angle=40)
    bm = P.bm
    r = bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=14, radius=1.0)
    for v in r['verts']:
        v.co = Vector((v.co.x, v.co.z, -v.co.y))
    drop = []
    for f in bm.faces:
        c = f.calc_center_median().normalized()
        th = abs(math.atan2(c.x, c.z))
        if c.y < 0.5 - (th / math.pi) * 1.15:
            drop.append(f)
    bmesh.ops.delete(bm, geom=drop, context='FACES_ONLY')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    P.faces_uv(list(bm.faces), lambda co: reg_uv('hair', math.atan2(co.x, co.z) / TAU + 0.5, 0.5 + co.normalized().y * 0.5))
    for v in bm.verts:
        v.co = Vector(head_shape(v.co, grow=0.011))

    def at(th, lat, grow=0.012):
        d = Vector((math.sin(th) * math.cos(lat), math.sin(lat), math.cos(th) * math.cos(lat)))
        return Vector(head_shape(d, grow=grow))
    # the fringe: seven locks across the forehead, the middle ones shorter, all leaning out a little
    for i in range(-3, 4):
        th = i * 0.2
        base = at(th, 0.62)
        ln = 0.055 + abs(i) * 0.008
        tip = base + Vector((math.sin(th) * 0.02 + i * 0.004, -ln, 0.022))
        P.spike(base, tip, 0.024, 'hair', sides=4, flat=(1.0, 0.5))
    # in front of the ears, at the back of the neck, and up on top
    for sd in (-1, 1):
        base = at(sd * 1.15, 0.35)
        P.spike(base, base + Vector((sd * 0.012, -0.075, 0.012)), 0.026, 'hair', sides=4, flat=(1.0, 0.5))
        base = at(sd * 1.6, 0.2)
        P.spike(base, base + Vector((sd * 0.02, -0.07, -0.01)), 0.03, 'hair', sides=4, flat=(1.0, 0.55))
    for th in (math.pi - 0.45, math.pi, math.pi + 0.45):
        base = at(th, -0.1)
        P.spike(base, base + Vector((math.sin(th) * 0.01, -0.065, -0.025)), 0.032, 'hair', sides=4, flat=(1.0, 0.55))
    for th, lat in ((0.3, 1.05), (-0.4, 1.0), (2.2, 0.85), (-2.5, 0.9), (3.0, 0.7)):
        base = at(th, lat, grow=0.006)
        out = base.normalized()
        P.spike(base, base + out * 0.045 + Vector((0, 0.02, -0.02)), 0.03, 'hair', sides=4, flat=(1.0, 0.6))
    return P.finish()


def ears_part():
    P = Part('ears', smooth_angle=70)
    for sd in (-1, 1):
        P.blob((sd * 0.104, -0.008, -0.004), (0.014, 0.03, 0.022), 'skin', seg=8, ring=6)
        P.blob((sd * 0.112, -0.006, -0.002), (0.006, 0.018, 0.012), 'skin', seg=6, ring=5)
    return P.finish()


# ------------------------------------------------------------------------------------------------ the body
def torso_part():
    P = Part('torso', subsurf=1)
    P.lathe([(-0.02, 0.125, 0.1, 0), (0.06, 0.128, 0.102, 0), (0.14, 0.131, 0.106, 0.006), (0.21, 0.139, 0.111, 0.01),
             (0.255, 0.141, 0.106, 0.004), (0.285, 0.115, 0.09, 0), (0.305, 0.055, 0.045, 0)], 14, 'coat')
    return P.finish()


def neck_part():
    P = Part('neck')
    P.lathe([(0.26, 0.037, 0.035, 0.004), (0.37, 0.034, 0.033, 0.006)], 10, 'skin')
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
    """the coat's skirt, to mid-thigh, flaring out a little (hangs from the hips)"""
    P = Part('skirt', subsurf=1)
    P.lathe([(0.2, 0.18, 0.156, -0.01), (0.25, 0.175, 0.15, -0.006), (0.33, 0.16, 0.135, 0), (0.41, 0.145, 0.12, 0), (0.45, 0.133, 0.11, 0)],
            16, 'coat', cap_top=False, cap_bottom=False)
    return P.finish()


def belt_part():
    P = Part('belt')
    P.lathe([(0.392, 0.152, 0.128, 0), (0.43, 0.15, 0.126, 0)], 16, 'leather', cap_top=False, cap_bottom=False)
    P.blob((0, 0.411, 0.128), (0.024, 0.02, 0.008), 'brass', seg=6, ring=4)
    P.blob((-0.13, 0.37, 0.04), (0.03, 0.035, 0.025), 'leather', seg=6, ring=5)
    return P.finish()


def upper_arm_part():
    P = Part('uarm', subsurf=1)
    P.blob((0, 0.0, 0), (0.052, 0.05, 0.05), 'coat', seg=10, ring=7)
    P.lathe([(-0.15, 0.04, 0.038, 0), (-0.1, 0.044, 0.042, 0), (-0.03, 0.05, 0.047, 0), (0.0, 0.05, 0.048, 0)], 10, 'coat')
    return P.finish()


def forearm_part():
    P = Part('farm', subsurf=1)
    P.lathe([(-0.07, 0.04, 0.038, 0), (0.0, 0.042, 0.04, 0), (0.012, 0.04, 0.038, 0)], 10, 'coat')
    P.lathe([(-0.168, 0.034, 0.032, 0), (-0.15, 0.037, 0.035, 0), (-0.09, 0.043, 0.041, 0), (-0.055, 0.046, 0.044, 0)], 10, 'glove')
    return P.finish()


def hand_part(sd):
    """a gloved hand: a palm, the fingers together and curled a little forward, and a thumb on the inside.
    sd = -1 for the left arm (arms[0]), +1 for the right; the thumb is on the side toward the body"""
    P = Part('hand' + ('L' if sd < 0 else 'R'), smooth_angle=70)
    P.blob((0, 0.02, 0.004), (0.033, 0.04, 0.021), 'glove', seg=10, ring=7)
    P.blob((0, -0.024, 0.012), (0.031, 0.028, 0.019), 'glove', seg=10, ring=7,
           deform=lambda p: (p.x, p.y, p.z + max(0.0, -p.y) * 0.25))
    P.blob((-sd * 0.028, 0.004, 0.018), (0.011, 0.024, 0.011), 'glove', seg=6, ring=5)
    return P.finish()


def thigh_part():
    P = Part('thigh', subsurf=1)
    P.lathe([(-0.205, 0.045, 0.044, 0), (-0.19, 0.047, 0.046, 0), (-0.1, 0.055, 0.053, 0), (-0.02, 0.062, 0.06, 0), (0.02, 0.06, 0.058, 0)], 10, 'trousers')
    return P.finish()


def shin_part():
    """a boot shaft with its top turned down into a cuff (hangs from the knee)"""
    P = Part('shin', subsurf=1)
    P.lathe([(-0.158, 0.044, 0.043, 0.004), (-0.15, 0.045, 0.044, 0.004), (-0.1, 0.047, 0.046, 0.003), (-0.045, 0.05, 0.049, 0),
             (-0.04, 0.059, 0.057, 0), (-0.005, 0.061, 0.059, 0), (0.012, 0.05, 0.05, 0)], 12, 'boot')
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
    parts = [head_part(), hair_part(), ears_part(), torso_part(), neck_part(), hood_part(), scarf_part(), tail_part(), skirt_part(),
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
