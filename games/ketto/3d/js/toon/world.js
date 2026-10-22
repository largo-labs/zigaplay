// Cartoon world kit: terrain, paths, houses, shops, trees, lanterns, torii, fences, walls, town props, water, sky,
// plus `batchStatic` which merges a finished area's static meshes into a few draw calls.
import * as THREE from 'three';
import { toon, part, lathe, ink, merged, gradient } from './toon.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const C = h => new THREE.Color(h);
export const rng = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const OL = 0.03;

function at(m, x, y, z, ry = 0, s = 1) { m.position.set(x, y, z); m.rotation.y = ry; if (Array.isArray(s)) m.scale.set(...s); else m.scale.setScalar(s); return m; }
export const MX = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));

/** a little builder for merged props: add boxes, cylinders, cones, spheres, then `mesh()` */
export function kit() {
  const P = [];
  return {
    P,
    box: (w, h, d, x, y, z, col, rx = 0, ry = 0, rz = 0) => P.push([new THREE.BoxGeometry(w, h, d), MX(x, y, z, rx, ry, rz), col]),
    cyl: (r0, r1, h, x, y, z, col, seg = 10, rx = 0, ry = 0, rz = 0) => P.push([new THREE.CylinderGeometry(r0, r1, h, seg), MX(x, y, z, rx, ry, rz), col]),
    cone: (r, h, x, y, z, col, seg = 10, rx = 0, ry = 0, rz = 0) => P.push([new THREE.ConeGeometry(r, h, seg), MX(x, y, z, rx, ry, rz), col]),
    sph: (r, x, y, z, col, sx = 1, sy = 1, sz = 1, det = 1) => P.push([new THREE.IcosahedronGeometry(r, det), MX(x, y, z, 0, 0, 0, sx, sy, sz), col]),
    rock: (r, x, y, z, col, sx = 1, sy = 1, sz = 1, ry = 0) => P.push([new THREE.DodecahedronGeometry(r, 0), MX(x, y, z, 0, ry, 0, sx, sy, sz), col]),
    geo: (g, m, col) => P.push([g, m, col]),
    mesh: (ol = OL) => merged(P, { outline: ol }),
  };
}
/** stand a prop on the ground */
export function place(G, m, x, z, ry, height, s = 1, dy = 0) { m.position.set(x, height(x, z) + dy, z); m.rotation.y = ry; m.scale.setScalar(s); G.add(m); return m; }

/** soft hills and a ground colored by patches; `height(x, z)` lets everything sit on it */
export function ground(G, { size = 120, base = '#7fb04a', dark = '#5e9238', light = '#a8c860', seed = 3, hills = 1.0, flat = [] } = {}) {
  const r = rng(seed);
  const bumps = Array.from({ length: 14 }, () => [(r() - 0.5) * size, (r() - 0.5) * size, 4 + r() * 10, (r() - 0.3) * 2.5 * hills]);
  const height = (x, z) => {
    let h = 0;
    for (const [bx, bz, rad, amp] of bumps) h += amp * Math.exp(-((x - bx) ** 2 + (z - bz) ** 2) / (rad * rad));
    for (const f of flat) { const d = Math.hypot(x - f[0], z - f[1]); if (d < f[2]) h *= Math.min(1, Math.pow(d / f[2], 3)); }
    // a rim of hills far out
    const d = Math.hypot(x, z) / (size * 0.5);
    h += Math.max(0, d - 0.75) * 18 * hills;
    return h;
  };
  const g = new THREE.PlaneGeometry(size, size, 96, 96);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, col = [];
  const cb = C(base), cd = C(dark), cl = C(light), tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    p.setY(i, height(x, z));
    const n = Math.sin(x * 0.35 + Math.sin(z * 0.2) * 2) * Math.cos(z * 0.3 + x * 0.05);
    tmp.copy(cb).lerp(n > 0 ? cl : cd, Math.abs(n) * 0.6);
    col.push(tmp.r, tmp.g, tmp.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toon('#fff').gradientMap }));
  m.receiveShadow = true;
  G.add(m);
  return height;
}

/** a ground mesh that follows height(x, z), fine inside `inner` and coarse beyond it, painted by a canvas texture
 *  that covers the rectangle `map` ({x0, z0, x1, z1}; canvas top = north) */
export function terrain(G, height, canvas, map, { outer = [-140, 140, -170, 170], inner = [-56, 56, -92, 92], step = 1, far = 5 } = {}) {
  const axis = (a0, a1, i0, i1) => { const v = []; for (let x = a0; x < i0; x += far) v.push(x); for (let x = i0; x < i1; x += step) v.push(x); for (let x = i1; x < a1; x += far) v.push(x); v.push(a1); return v; };
  const xs = axis(outer[0], outer[1], inner[0], inner[1]), zs = axis(outer[2], outer[3], inner[2], inner[3]);
  const nx = xs.length, nz = zs.length, pos = new Float32Array(nx * nz * 3), uv = new Float32Array(nx * nz * 2), idx = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i, x = xs[i], z = zs[j];
    pos[k * 3] = x; pos[k * 3 + 1] = height(x, z); pos[k * 3 + 2] = z;
    uv[k * 2] = (x - map.x0) / (map.x1 - map.x0); uv[k * 2 + 1] = 1 - (z - map.z0) / (map.z1 - map.z0);
  }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const m = new THREE.Mesh(g, new THREE.MeshToonMaterial({ map: tex, gradientMap: gradient() }));
  m.receiveShadow = true; m.userData.keep = true;
  G.add(m);
  return m;
}

/** a dirt path as a ribbon laid on the ground along points [[x,z],...] */
export function path(G, pts, height, { width = 3, col = '#d8c08a', edge = '#b89a62' } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)));
  const N = Math.max(20, pts.length * 14), verts = [], cols = [], idx = [];
  const c1 = C(col), c2 = C(edge);
  for (let i = 0; i <= N; i++) {
    const t = i / N, p = curve.getPointAt(t), tg = curve.getTangentAt(t), side = new THREE.Vector3(-tg.z, 0, tg.x).normalize();
    for (let k = 0; k <= 4; k++) {
      const u = k / 4 - 0.5, w = width * (1 + 0.15 * Math.sin(t * 40 + k));
      const q = p.clone().addScaledVector(side, u * w);
      verts.push(q.x, height(q.x, q.z) + 0.06, q.z);
      const e = Math.abs(u) * 2, c = c1.clone().lerp(c2, Math.pow(e, 3));
      cols.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < N; i++) for (let k = 0; k < 4; k++) { const a = i * 5 + k, b = a + 5; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toon('#fff').gradientMap, polygonOffset: true, polygonOffsetFactor: -2, side: THREE.DoubleSide }));
  m.receiveShadow = true;
  G.add(m);
  return curve;
}

let _lit;
const litMat = () => _lit || (_lit = new THREE.MeshToonMaterial({ color: '#fff4dc', emissive: '#ffd890', emissiveIntensity: 0.25, gradientMap: gradient() }));
/** paper windows glow brighter at night */
export function setNight(on) { litMat().emissiveIntensity = on ? 0.95 : 0.25; }

/** a Japanese house: stone base, plaster walls framed in dark wood, a deep gabled roof (one merged mesh).
 *  Options: two stories (`floors: 2`), a thatched farmhouse roof (`thatch`), a white storehouse (`kura`),
 *  a shop front with a noren curtain (`shop: color`) and paper lanterns by the door (`lanterns`). */
export function house(G, x, z, ry, height, { w = 5, d = 4, h = 2.4, wall = '#f2ead8', wood = '#5a3a26', roof = '#4a4a5a', door = true, shop = null, floors = 1, thatch = false, kura = false, lanterns = false } = {}) {
  const g = new THREE.Group(), P = [];
  const B = (bw, bh, bd, px, py, pz, col, rx = 0) => P.push([new THREE.BoxGeometry(bw, bh, bd), MX(px, py, pz, rx), col]);
  const base = kura ? 0.8 : 0.35;
  B(w + 0.3, base, d + 0.3, 0, base / 2, 0, kura ? '#3a3a40' : '#8a8478');
  B(w, h, d, 0, base + h / 2, 0, kura ? '#f6f2ea' : wall);
  if (!kura) {
    const posts = Math.round(w / 1.4);
    for (let i = 0; i <= posts; i++) for (const sz of [-1, 1]) B(0.16, h, 0.16, -w / 2 + i * (w / posts), base + h / 2, sz * (d / 2 + 0.02), wood);
    for (const sx of [-1, 1]) B(0.16, h, 0.16, sx * (w / 2 + 0.02), base + h / 2, 0, wood);
    B(w + 0.1, 0.14, d + 0.1, 0, base + h * 0.62, 0, wood);
  } else {
    B(w + 0.06, 0.5, d + 0.06, 0, base + 0.25, 0, '#2a2a30');   // dark lower band of a storehouse
    for (const s of [-1, 1]) B(0.5, 0.5, 0.08, s * w * 0.25, base + h * 0.7, d / 2 + 0.03, '#2a2a30');
  }
  B(w + 0.1, 0.16, d + 0.1, 0, base + h, 0, wood);
  if (door && !kura) B(1.0, 1.7, 0.06, 0, base + 0.85, d / 2 + 0.05, '#3a2a1e');
  if (kura) B(1.0, 1.6, 0.1, 0, base + 0.8, d / 2 + 0.05, '#4a4a52');
  let top = base + h;
  if (floors === 2) {
    // an upper floor set back a little, with its own eave below
    const w2 = w - 0.6, d2 = d - 0.8, h2 = 1.8;
    for (const s of [-1, 1]) B(w + 0.9, 0.12, 1.0, 0, top + 0.18, s * (d / 2 + 0.1), roof, s * -0.35);
    B(w2, h2, d2, 0, top + h2 / 2, 0, wall);
    const posts = Math.round(w2 / 1.2);
    for (let i = 0; i <= posts; i++) B(0.14, h2, 0.14, -w2 / 2 + i * (w2 / posts), top + h2 / 2, d2 / 2 + 0.02, wood);
    B(w2 * 0.8, 0.6, 0.05, 0, top + h2 * 0.5, d2 / 2 + 0.05, '#c8a878');   // lattice window strip
    top += h2;
  }
  const rw = (floors === 2 ? w - 0.6 : w) + 1.4, rd = (floors === 2 ? d - 0.8 : d) + 1.6, rh = thatch ? 2.2 : 1.3;
  const slope = Math.atan2(rh, rd / 2), len = Math.hypot(rh, rd / 2) + 0.1;
  const roofCol = thatch ? '#b89a5a' : roof;
  for (const s of [-1, 1]) B(rw, thatch ? 0.42 : 0.16, len, 0, top + rh / 2 + 0.05, s * rd / 4, roofCol, s * slope);
  B(rw + 0.2, thatch ? 0.4 : 0.24, thatch ? 0.5 : 0.3, 0, top + rh + 0.08, 0, thatch ? '#8a7040' : '#3a3a48');
  const tri = new THREE.Shape(), gd = floors === 2 ? d - 0.8 : d, gw = floors === 2 ? w - 0.6 : w;
  tri.moveTo(-gd / 2, 0); tri.lineTo(gd / 2, 0); tri.lineTo(0, rh); tri.closePath();
  for (const s of [-1, 1]) P.push([new THREE.ShapeGeometry(tri), MX(s * gw / 2, top, 0, 0, s * Math.PI / 2, 0), kura ? '#f6f2ea' : wall]);
  if (shop) {
    // a noren curtain over the door and a sign board
    for (let k = -1; k <= 1; k++) B(0.36, 0.7, 0.03, k * 0.38, base + 1.75, d / 2 + 0.16, shop);
    B(1.6, 0.42, 0.06, 0, base + h + 0.3, d / 2 + 0.25, '#3a2618');
    B(1.3, 0.28, 0.02, 0, base + h + 0.3, d / 2 + 0.29, '#efe2c0');
    // goods out front
    B(1.6, 0.6, 0.7, -w * 0.28, base + 0.0, d / 2 + 0.6, '#6a4a32');
    for (let k = 0; k < 3; k++) P.push([new THREE.IcosahedronGeometry(0.14, 0), MX(-w * 0.28 - 0.5 + k * 0.5, base + 0.4, d / 2 + 0.6), ['#e8a030', '#c83a2a', '#6aa040'][k]]);
  }
  g.add(merged(P, { outline: OL }));
  if (!kura) for (const s of [-1, 1]) { const win = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.05), litMat()); win.position.set(s * w * 0.3, base + h * 0.62 - 0.6, d / 2 + 0.05); g.add(win); }
  if (lanterns || shop) for (const s of [-1, 1]) { const L = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), toon('#e0402e', { emissive: '#ff5a3a', emissiveIntensity: 0.55 })); L.scale.y = 1.3; L.position.set(s * 0.85, base + 2.0, d / 2 + 0.45); g.add(L); }
  g.position.set(x, height(x, z), z); g.rotation.y = ry;
  G.add(g);
  return g;
}

/** a ridge tent (war camps, miners' camps) */
export function tent(G, x, z, ry, height, { w = 3.4, d = 4.4, col = '#d8ccb0', trim = '#8a2a2a' } = {}) {
  const K = kit(), h = 2.2, slope = Math.atan2(h, w / 2), len = Math.hypot(h, w / 2);
  for (const s of [-1, 1]) K.box(0.1, len, d, s * w / 4, h / 2, 0, col, 0, 0, -s * (Math.PI / 2 - slope));
  K.box(0.14, 0.14, d + 0.4, 0, h, 0, '#5a3a26');
  const tri = new THREE.Shape(); tri.moveTo(-w / 2, 0); tri.lineTo(w / 2, 0); tri.lineTo(0, h); tri.closePath();
  K.geo(new THREE.ShapeGeometry(tri), MX(0, 0.01, -d / 2), col);
  K.box(0.9, 1.5, 0.02, 0, 0.75, d / 2 - 0.02, '#2a1a14');
  K.box(w * 0.9, 0.3, 0.04, 0, 0.9, d / 2 + 0.01, trim);
  for (const s of [-1, 1]) K.cyl(0.05, 0.05, h + 0.4, 0, (h + 0.4) / 2, s * (d / 2 + 0.2), '#5a3a26', 6);
  return place(G, K.mesh(), x, z, ry, height);
}

/** round cartoon tree, pine, sakura, maple, snow tree, or a bamboo clump: one merged mesh each */
export function tree(G, x, z, height, kind = 'round', s = 1, seed = 1) {
  const r = rng(seed + Math.round(x * 13 + z * 7));
  const M = (px, py, pz, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(new THREE.Vector3(px, py, pz), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
  const P = [];
  if (kind === 'bamboo') {
    for (let i = 0; i < 6; i++) {
      const hh = 6 + r() * 5, ox = (r() - 0.5) * 1.2, oz = (r() - 0.5) * 1.2, tilt = (r() - 0.5) * 0.12;
      P.push([new THREE.CylinderGeometry(0.07, 0.08, hh, 6), M(ox, hh / 2, oz, 0, 0, tilt), '#6a9a3a']);
      for (let k = 1; k < hh / 1.2; k++) P.push([new THREE.CylinderGeometry(0.086, 0.086, 0.05, 6), M(ox - Math.sin(tilt) * k * 1.2, k * 1.2, oz), '#4e7a2a']);
      for (let k = 0; k < 3; k++) P.push([new THREE.IcosahedronGeometry(0.6 + r() * 0.4, 0), M(ox + (r() - 0.5), hh - k * 0.8, oz + (r() - 0.5), 0, r() * 3, 0, 1, 0.5, 1), '#5a8a32']);
    }
  } else if (kind === 'pine') {
    P.push([new THREE.CylinderGeometry(0.18, 0.28, 2.2, 8), M(0, 1.1, 0), '#5a3e2a']);
    for (let k = 0; k < 4; k++) P.push([new THREE.ConeGeometry(1.7 - k * 0.32, 1.6, 9), M(0, 1.6 + k * 0.85, 0, 0, r() * 3), k % 2 ? '#2e6a3e' : '#357a46']);
  } else {
    const leaf = { round: ['#5a9a3e', '#6aaa48'], sakura: ['#f4b0c8', '#ffc8da'], maple: ['#d8582a', '#e87a3a'], snow: ['#e8f0f8', '#ffffff'], gold: ['#e8c040', '#f4d860'] }[kind] || ['#5a9a3e', '#6aaa48'];
    P.push([new THREE.CylinderGeometry(0.16, 0.26, 2.0, 8), M(0, 1.0, 0), '#6a4a32']);
    for (let k = 0; k < 5; k++) P.push([new THREE.IcosahedronGeometry(0.9 + r() * 0.5, 1), M((r() - 0.5) * 1.6, 2.2 + r() * 1.2, (r() - 0.5) * 1.6, 0, r() * 3), leaf[k % 2]]);
  }
  const g = merged(P, { outline: kind === 'bamboo' ? 0.02 : 0.03 });
  g.position.set(x, height(x, z) - 0.05, z); g.scale.setScalar(s);
  G.add(g);
  return g;
}

/** a bare dead tree */
export function deadTree(G, x, z, height, r) {
  const K = kit(), col = '#3a3030';
  K.cyl(0.12, 0.25, 3, 0, 1.5, 0, col, 6);
  for (let k = 0; k < 4; k++) K.cyl(0.04, 0.09, 1.4, 0, 2.2 + k * 0.25, 0, col, 5, (r() - 0.5) * 1.6, r() * 6, 0.8 + r() * 0.5);
  return place(G, K.mesh(0.03), x, z, 0, height);
}

/** a wooden fence around a closed loop of corners, posts and rails following the ground (two instanced meshes) */
export function fenceLoop(G, corners, height, col = '#8a6a48', step = 1.6, closed = true) {
  const posts = [], rails = [];
  for (let i = 0; i < corners.length - (closed ? 0 : 1); i++) {
    const a = corners[i], b = corners[(i + 1) % corners.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(len / step));
    for (let k = 0; k < n; k++) {
      const t0 = k / n, t1 = (k + 1) / n;
      const x0 = a[0] + (b[0] - a[0]) * t0, z0 = a[1] + (b[1] - a[1]) * t0, x1 = a[0] + (b[0] - a[0]) * t1, z1 = a[1] + (b[1] - a[1]) * t1;
      const y0 = height(x0, z0), y1 = height(x1, z1);
      posts.push(new THREE.Matrix4().makeTranslation(x0, y0 + 0.55, z0));
      if (!closed && k === n - 1 && i === corners.length - 2) posts.push(new THREE.Matrix4().makeTranslation(x1, y1 + 0.55, z1));
      const mid = new THREE.Vector3((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), seg = Math.hypot(x1 - x0, z1 - z0, y1 - y0);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0).normalize());
      for (const h of [0.45, 0.85]) rails.push(new THREE.Matrix4().compose(mid.clone().add(new THREE.Vector3(0, h, 0)), q, new THREE.Vector3(seg, 1, 1)));
    }
  }
  const mk = (geo, list) => {
    const m = new THREE.InstancedMesh(geo, toon(col), list.length); list.forEach((M, i) => m.setMatrixAt(i, M));
    m.castShadow = true; m.receiveShadow = true; G.add(m);
    const o = new THREE.InstancedMesh(geo, ink(0.02), list.length); list.forEach((M, i) => o.setMatrixAt(i, M)); G.add(o);
  };
  mk(new THREE.CylinderGeometry(0.07, 0.08, 1.1, 6), posts);
  mk(new THREE.BoxGeometry(1, 0.08, 0.07), rails);
}

/** a long wall along a polyline: a log palisade, stone wall, hedge, bamboo fence or a line of boulders (instanced) */
export function wallLine(G, pts, height, kind = 'stone', col) {
  const items = [], r = rng(Math.round(pts[0][0] * 7 + pts[0][1] * 13) + 77);
  const spec = {
    wood: { step: 0.42, geo: new THREE.CylinderGeometry(0.2, 0.22, 3.0, 7), y: 1.4, col: '#6a4a30', jit: 0.25 },
    stone: { step: 1.6, geo: new THREE.BoxGeometry(1.62, 2.4, 1.2), y: 1.1, col: '#8a867c', jit: 0.12 },
    hedge: { step: 1.5, geo: new THREE.IcosahedronGeometry(1.0, 1), y: 0.8, col: '#3e7a3a', jit: 0.2, scale: [0.9, 0.9, 0.75] },
    bamboo: { step: 0.2, geo: new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6), y: 1.2, col: '#a8b860', jit: 0.12 },
    rock: { step: 2.2, geo: new THREE.DodecahedronGeometry(1.5, 0), y: 0.7, col: '#6a665e', jit: 0.6 },
    white: { step: 1.6, geo: new THREE.BoxGeometry(1.62, 2.2, 0.7), y: 1.0, col: '#f2ece0', jit: 0 },
  }[kind] || {};
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / spec.step)), ang = Math.atan2(bz - az, bx - ax);
    for (let k = 0; k <= n; k++) {
      const x = ax + (bx - ax) * k / n, z = az + (bz - az) * k / n;
      const sc = spec.scale ? new THREE.Vector3(...spec.scale).multiplyScalar(1 + (r() - 0.5) * spec.jit) : new THREE.Vector3(1, 1 + (r() - 0.5) * spec.jit, 1);
      items.push(new THREE.Matrix4().compose(new THREE.Vector3(x, height(x, z) + spec.y * sc.y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(kind === 'rock' ? r() : 0, -ang + (kind === 'rock' ? r() * 3 : 0), 0)), sc));
    }
  }
  const m = new THREE.InstancedMesh(spec.geo, toon(col || spec.col), items.length); items.forEach((M, i) => m.setMatrixAt(i, M));
  m.castShadow = true; m.receiveShadow = true; G.add(m);
  const o = new THREE.InstancedMesh(spec.geo, ink(kind === 'bamboo' || kind === 'wood' ? 0.015 : 0.03), items.length); items.forEach((M, i) => o.setMatrixAt(i, M)); G.add(o);
  // a coping on top of stone and white walls
  if (kind === 'stone' || kind === 'white') {
    const tops = items.map(M => { const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); M.decompose(p, q, s); p.y += 1.2 * s.y; return new THREE.Matrix4().compose(p, q, new THREE.Vector3(1, 1, 1)); });
    const tg = new THREE.BoxGeometry(1.7, 0.25, kind === 'white' ? 1.2 : 1.5);
    const t = new THREE.InstancedMesh(tg, toon(kind === 'white' ? '#3a3a48' : '#5a564e'), tops.length); tops.forEach((M, i) => t.setMatrixAt(i, M)); t.castShadow = true; G.add(t);
  }
  return m;
}

/** a big two-leaf gate set in a wall; `.open(k)` swings the leaves (k from 0 to 1) */
export function gateDoors(G, x, z, ry, height, { width = 5, h = 3.2, col = '#5a3a26', post = '#3a2a1e', roof = '#3a3a48' } = {}) {
  const g = new THREE.Group(), y = height(x, z);
  const K = kit();
  for (const s of [-1, 1]) K.box(0.5, h + 0.8, 0.5, s * (width / 2 + 0.25), (h + 0.8) / 2, 0, post);
  K.box(width + 1.6, 0.35, 0.7, 0, h + 0.8, 0, post);
  for (const s of [-1, 1]) K.box(width + 2.4, 0.14, 1.3, 0, h + 1.15, s * 0.32, roof, s * -0.45);
  g.add(K.mesh());
  const leaves = [];
  for (const s of [-1, 1]) {
    const hinge = new THREE.Group(); hinge.position.set(s * width / 2, 0, 0);
    const L = kit();
    L.box(width / 2, h, 0.2, -s * width / 4, h / 2, 0, col);
    for (const yy of [0.5, h / 2, h - 0.5]) L.box(width / 2, 0.16, 0.06, -s * width / 4, yy, 0.13, '#2a1a12');
    for (let k = 0; k < 3; k++) L.sph(0.07, -s * (0.4 + k * 0.6), h * 0.7, 0.16, '#d9a441', 1, 1, 1, 0);
    hinge.add(L.mesh(0.025)); g.add(hinge); leaves.push([hinge, s]);
  }
  g.position.set(x, y, z); g.rotation.y = ry; g.userData.keep = true;
  G.add(g);
  g.open = k => { for (const [hg, s] of leaves) hg.rotation.y = s * k * 1.75; };
  return g;
}

/** a town gate: two thick posts under a little roof, wide enough for a street */
export function townGate(G, x, z, ry, height, { width = 6, col = '#5a3a26', roof = '#3a3a48' } = {}) {
  const K = kit(), h = 3.6;
  for (const s of [-1, 1]) { K.box(0.45, h, 0.45, s * width / 2, h / 2, 0, col); K.box(0.7, 0.4, 0.7, s * width / 2, 0.2, 0, '#8a8478'); }
  K.box(width + 1.2, 0.3, 0.5, 0, h, 0, col);
  K.box(width + 0.4, 0.2, 0.35, 0, h - 0.7, 0, col);
  for (const s of [-1, 1]) K.box(width + 2.0, 0.14, 1.3, 0, h + 0.42, s * 0.3, roof, s * -0.5);
  K.box(width + 2.2, 0.18, 0.24, 0, h + 0.72, 0, '#2a2a34');
  K.box(1.6, 0.5, 0.06, 0, h - 0.35, 0.28, '#efe2c0');
  return place(G, K.mesh(), x, z, ry, height);
}

export function lantern(G, x, z, height, lights, { light = true } = {}) {
  const g = new THREE.Group(), stone = '#a8a49c';
  g.add(merged([[0.5, 0.15, 0.075], [0.16, 0.7, 0.5], [0.42, 0.1, 0.9], [0.34, 0.32, 1.11], [0.62, 0.12, 1.33]].map(([w, h, y]) => [new THREE.BoxGeometry(w, h, w), MX(0, y, 0), stone]), { outline: 0.02 }));
  const glow = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.36), new THREE.MeshBasicMaterial({ color: '#ffb860' }));
  glow.position.y = 1.11; g.add(glow);
  g.position.set(x, height(x, z), z); g.scale.setScalar(0.7);
  G.add(g);
  if (light && lights && lights.length < 6) { const L = new THREE.PointLight('#ffb35a', 4, 7, 2); L.position.set(x, height(x, z) + 1.3, z); G.add(L); lights.push(L); }
  return g;
}

export function torii(G, x, z, ry, height, s = 1, col = '#d8322a') {
  const g = new THREE.Group();
  for (const sx of [-1, 1]) g.add(at(part(new THREE.CylinderGeometry(0.2, 0.24, 4.4, 12), col, { outline: OL }), sx * 1.8, 2.2, 0));
  g.add(at(part(new THREE.BoxGeometry(5.2, 0.32, 0.5), '#1a1418', { outline: OL }), 0, 4.55, 0));
  g.add(at(part(new THREE.BoxGeometry(4.8, 0.22, 0.4), col, { outline: OL }), 0, 4.3, 0));
  g.add(at(part(new THREE.BoxGeometry(4.2, 0.2, 0.26), col, { outline: OL }), 0, 3.6, 0));
  g.position.set(x, height(x, z), z); g.rotation.y = ry; g.scale.setScalar(s);
  g.traverse(o => { if (o.isMesh && !o.userData.outline) o.castShadow = true; });
  G.add(g);
  return g;
}

export function fence(G, a, b, height, col = '#8a6a48') {
  const n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.2));
  for (let i = 0; i <= n; i++) {
    const x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n;
    G.add(at(part(new THREE.CylinderGeometry(0.06, 0.07, 1.0, 6), col, { outline: 0.02 }), x, height(x, z) + 0.5, z));
  }
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  for (const y of [0.45, 0.85]) { const rail = part(new THREE.BoxGeometry(len, 0.07, 0.07), col, { outline: 0.02 }); rail.position.set(mx, height(mx, mz) + y, mz); rail.rotation.y = -ang; G.add(rail); }
}

export function rocks(G, n, area, height, seed = 9, col = '#9a968e', avoid = () => false) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = area[0] + r() * (area[2] - area[0]), z = area[1] + r() * (area[3] - area[1]);
    if (avoid(x, z)) continue;
    const m = part(new THREE.DodecahedronGeometry(0.3 + r() * 0.6, 0), col, { outline: OL });
    m.position.set(x, height(x, z), z); m.rotation.set(r(), r() * 3, r()); m.scale.set(1, 0.6 + r() * 0.4, 1);
    m.castShadow = true; G.add(m);
  }
}

export function grass(G, n, area, height, seed = 5, col = '#4e8a32', avoid = () => false) {
  const r = rng(seed);
  const geo = new THREE.ConeGeometry(0.08, 0.45, 4); geo.translate(0, 0.2, 0);
  const im = new THREE.InstancedMesh(geo, toon(col), n * 3);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let k = 0;
  for (let i = 0; i < n; i++) {
    const x = area[0] + r() * (area[2] - area[0]), z = area[1] + r() * (area[3] - area[1]);
    if (avoid(x, z)) continue;
    for (let j = 0; j < 3; j++) {
      e.set((r() - 0.5) * 0.6, r() * 3, (r() - 0.5) * 0.6); q.setFromEuler(e);
      im.setMatrixAt(k++, m.compose(new THREE.Vector3(x + (r() - 0.5) * 0.2, height(x, z), z + (r() - 0.5) * 0.2), q, new THREE.Vector3(1, 0.6 + r(), 1)));
    }
  }
  im.count = k;
  G.add(im);
}

/** round bushes, some with flowers (two instanced meshes) */
export function bushes(G, list, height, col = '#4e8a3a', flower = '#ffd0e0') {
  const geo = new THREE.IcosahedronGeometry(0.7, 1), fg = new THREE.IcosahedronGeometry(0.11, 0);
  const im = new THREE.InstancedMesh(geo, toon(col), list.length), om = new THREE.InstancedMesh(geo, ink(0.025), list.length);
  const fl = [], m = new THREE.Matrix4(), q = new THREE.Quaternion();
  list.forEach(([x, z, s, k], i) => {
    m.compose(new THREE.Vector3(x, height(x, z) + 0.25 * s, z), q.setFromEuler(new THREE.Euler(0, k * 6, 0)), new THREE.Vector3(s * 1.2, s * 0.85, s * 1.1));
    im.setMatrixAt(i, m); om.setMatrixAt(i, m);
    if (flower && k < 0.35) for (let f = 0; f < 5; f++) { const a = f * 1.3 + k * 9, rr = 0.55 * s; fl.push(new THREE.Matrix4().makeTranslation(x + Math.cos(a) * rr, height(x, z) + 0.45 * s + (f % 2) * 0.12 * s, z + Math.sin(a) * rr)); }
  });
  im.castShadow = true; im.receiveShadow = true; G.add(im, om);
  if (fl.length) { const fm = new THREE.InstancedMesh(fg, toon(flower), fl.length); fl.forEach((M, i) => fm.setMatrixAt(i, M)); G.add(fm); }
}

export function water(G, x, z, w, d, y, col = '#4aa8d8') {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d, 1, 1), new THREE.MeshToonMaterial({ color: col, gradientMap: toon('#fff').gradientMap, transparent: true, opacity: 0.88 }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true;
  G.add(m);
  return m;
}

/* ---------- town props (each one merged mesh) ---------- */
export const props = {
  well(G, x, z, height) {
    const K = kit();
    K.cyl(0.95, 1.0, 0.85, 0, 0.42, 0, '#8a867c', 14);
    K.cyl(0.78, 0.78, 0.04, 0, 0.84, 0, '#1a2a3a', 14);
    for (const s of [-1, 1]) K.box(0.14, 2.2, 0.14, s * 0.85, 1.1, 0, '#5a3a26');
    K.box(2.1, 0.12, 0.16, 0, 2.15, 0, '#5a3a26');
    for (const s of [-1, 1]) K.box(2.4, 0.08, 0.9, 0, 2.45, s * 0.3, '#4a4a5a', s * -0.55);
    K.cyl(0.18, 0.15, 0.3, 0.35, 1.1, 0, '#7a5a3a', 8);
    return place(G, K.mesh(), x, z, 0, height);
  },
  board(G, x, z, ry, height) {
    const K = kit();
    for (const s of [-1, 1]) K.box(0.14, 2.2, 0.14, s * 1.0, 1.1, 0, '#5a3a26');
    K.box(2.2, 1.1, 0.1, 0, 1.45, 0, '#8a6a48');
    for (let k = 0; k < 4; k++) K.box(0.4, 0.5, 0.02, -0.7 + k * 0.46, 1.45 + (k % 2) * 0.12, 0.06, '#f4ecd8');
    for (const s of [-1, 1]) K.box(2.6, 0.08, 0.6, 0, 2.2, s * 0.2, '#3a3a48', s * -0.5);
    return place(G, K.mesh(), x, z, ry, height);
  },
  barrels(G, x, z, ry, height, n = 2) {
    const K = kit();
    for (let k = 0; k < n; k++) { K.cyl(0.32, 0.32, 0.8, k * 0.7 - 0.35 * (n - 1), 0.4, 0, '#8a5a32', 10); for (const y of [0.15, 0.65]) K.cyl(0.335, 0.335, 0.07, k * 0.7 - 0.35 * (n - 1), y, 0, '#3a2a1e', 10); }
    return place(G, K.mesh(), x, z, ry, height);
  },
  crates(G, x, z, ry, height) {
    const K = kit();
    K.box(0.8, 0.8, 0.8, 0, 0.4, 0, '#a8804a'); K.box(0.7, 0.7, 0.7, 0.75, 0.35, 0.1, '#9a7442', 0, 0.3); K.box(0.6, 0.6, 0.6, 0.2, 1.1, 0, '#b08a52', 0, 0.5);
    return place(G, K.mesh(), x, z, ry, height);
  },
  sacks(G, x, z, ry, height) {
    const K = kit();
    for (let k = 0; k < 3; k++) K.sph(0.36, k * 0.55 - 0.55, 0.3, (k % 2) * 0.2, '#d8c49a', 1, 0.8, 0.9, 1);
    K.sph(0.34, 0, 0.78, 0.1, '#ccb88e', 1, 0.8, 0.9, 1);
    return place(G, K.mesh(), x, z, ry, height);
  },
  bench(G, x, z, ry, height, col = '#7a5a3a') {
    const K = kit();
    K.box(1.8, 0.1, 0.5, 0, 0.45, 0, col);
    for (const s of [-1, 1]) K.box(0.1, 0.45, 0.4, s * 0.75, 0.22, 0, '#4a3424');
    return place(G, K.mesh(0.02), x, z, ry, height);
  },
  teahouse(G, x, z, ry, height) {
    // a red-felt bench under a big paper umbrella
    const K = kit();
    K.box(2.0, 0.12, 0.8, 0, 0.5, 0, '#c8322a'); for (const s of [-1, 1]) K.box(0.12, 0.5, 0.7, s * 0.85, 0.25, 0, '#4a3424');
    K.cyl(0.04, 0.04, 2.6, -1.25, 1.3, 0, '#5a3a26', 6);
    K.cone(1.6, 0.7, -1.25, 2.6, 0, '#d8402e', 16);
    K.cyl(0.18, 0.15, 0.22, 0.5, 0.67, 0, '#4a6a3a', 8);
    return place(G, K.mesh(), x, z, ry, height);
  },
  cart(G, x, z, ry, height) {
    const K = kit();
    K.box(1.4, 0.15, 2.2, 0, 0.75, 0, '#8a6a48'); for (const s of [-1, 1]) K.box(0.08, 0.35, 2.2, s * 0.66, 0.95, 0, '#7a5a3a');
    for (const s of [-1, 1]) K.cyl(0.5, 0.5, 0.1, s * 0.8, 0.5, 0.3, '#5a3a26', 12, 0, 0, Math.PI / 2);
    for (const s of [-1, 1]) K.box(0.08, 0.08, 1.8, s * 0.4, 0.7, 1.9, '#5a3a26');
    K.sph(0.4, 0.2, 1.05, -0.3, '#d8c49a', 1, 0.7, 1, 1); K.sph(0.36, -0.3, 1.0, 0.4, '#ccb88e', 1, 0.7, 1, 1);
    return place(G, K.mesh(), x, z, ry, height);
  },
  haystack(G, x, z, height, s = 1) {
    const K = kit();
    K.sph(1.0, 0, 0.7, 0, '#d8b860', 1, 0.9, 1, 1); K.cone(0.9, 0.9, 0, 1.55, 0, '#c8a850', 10);
    return place(G, K.mesh(), x, z, Math.random() * 3, height, s);
  },
  signpost(G, x, z, ry, height) {
    const K = kit();
    K.box(0.14, 2.0, 0.14, 0, 1.0, 0, '#5a3a26');
    K.box(1.1, 0.3, 0.06, 0.4, 1.7, 0, '#c8a878', 0, 0, 0.05); K.box(1.0, 0.28, 0.06, -0.35, 1.3, 0, '#c8a878', 0, 0.8, -0.04);
    return place(G, K.mesh(0.02), x, z, ry, height);
  },
  pots(G, x, z, height) {
    const K = kit();
    K.cyl(0.25, 0.2, 0.5, 0, 0.25, 0, '#8a4a32', 10); K.sph(0.3, 0, 0.6, 0, '#4a8a3a', 1, 0.8, 1, 1);
    K.cyl(0.2, 0.16, 0.4, 0.45, 0.2, 0.2, '#6a6a72', 10);
    return place(G, K.mesh(0.02), x, z, 0, height);
  },
  stall(G, x, z, ry, height, col = '#c8322a') {
    const K = kit();
    K.box(2.6, 1.0, 1.4, 0, 0.5, 0, '#7a5a3a');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) K.cyl(0.05, 0.05, 2.4, sx * 1.2, 1.2, sz * 0.6, '#5a3a26', 6);
    K.box(2.9, 0.12, 1.8, 0, 2.4, -0.1, col, 0.12);
    for (let k = 0; k < 5; k++) K.sph(0.13, -1 + k * 0.5, 1.12, 0.2, ['#e8a030', '#c83a2a', '#6aa040', '#f4e0a0', '#8a4ad0'][k], 1, 1, 1, 0);
    return place(G, K.mesh(), x, z, ry, height);
  },
  banner(G, x, z, height, col = '#c8322a', ry = 0) {
    const K = kit();
    K.cyl(0.04, 0.04, 3.4, 0, 1.7, 0, '#3a2a1e', 6); K.box(0.5, 2.0, 0.03, 0.27, 2.2, 0, col); K.box(0.6, 0.05, 0.05, 0.27, 3.2, 0, '#3a2a1e');
    return place(G, K.mesh(0.015), x, z, ry, height);
  },
  campfire(G, x, z, height) {
    const K = kit();
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; K.rock(0.2, Math.cos(a) * 0.65, 0.1, Math.sin(a) * 0.65, '#7a766e'); }
    for (let k = 0; k < 3; k++) K.cyl(0.08, 0.08, 1.0, 0, 0.15, 0, '#5a3a26', 6, Math.PI / 2, k * 1.05, 0);
    return place(G, K.mesh(0.02), x, z, 0, height);
  },
  woodpile(G, x, z, ry, height) {
    const K = kit();
    for (let row = 0; row < 3; row++) for (let k = 0; k < 4 - row; k++) K.cyl(0.18, 0.18, 2.2, (k - (3 - row) / 2) * 0.38, 0.2 + row * 0.33, 0, '#8a6a48', 8, Math.PI / 2, 0, 0);
    return place(G, K.mesh(0.02), x, z, ry, height);
  },
  stump(G, x, z, height) {
    const K = kit();
    K.cyl(0.4, 0.48, 0.5, 0, 0.25, 0, '#7a5a3a', 10); K.cyl(0.38, 0.38, 0.02, 0, 0.51, 0, '#d8b888', 10);
    K.box(0.06, 0.5, 0.06, 0.1, 0.75, 0, '#5a3a26', 0, 0, 0.3); K.box(0.3, 0.18, 0.04, 0.2, 0.95, 0, '#8a8a92', 0, 0, 0.3);
    return place(G, K.mesh(0.02), x, z, 0, height);
  },
  tower(G, x, z, height) {
    const K = kit(), h = 5;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) K.box(0.22, h, 0.22, sx * 1.1, h / 2, sz * 1.1, '#5a3a26');
    K.box(2.8, 0.18, 2.8, 0, h, 0, '#7a5a3a');
    for (const s of [-1, 1]) { K.box(2.8, 0.6, 0.08, 0, h + 0.4, s * 1.36, '#7a5a3a'); K.box(0.08, 0.6, 2.8, s * 1.36, h + 0.4, 0, '#7a5a3a'); }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) K.box(0.14, 1.6, 0.14, sx * 1.3, h + 0.8, sz * 1.3, '#5a3a26');
    K.cone(2.5, 1.2, 0, h + 2.2, 0, '#4a4a5a', 4, 0, Math.PI / 4);
    for (const s of [-1, 1]) K.box(0.08, h, 0.08, s * 0.3, h / 2, 1.5, '#6a4a30', -0.12);
    for (let k = 1; k < 9; k++) K.box(0.65, 0.06, 0.08, 0, k * 0.55, 1.5 + k * 0.066 - 0.3, '#6a4a30');
    return place(G, K.mesh(), x, z, 0, height);
  },
  hokora(G, x, z, ry, height) {
    // a little roadside shrine
    const K = kit();
    K.box(1.2, 0.5, 1.0, 0, 0.25, 0, '#8a867c'); K.box(0.9, 0.9, 0.7, 0, 0.95, 0, '#8a5a3a');
    for (const s of [-1, 1]) K.box(1.4, 0.08, 0.7, 0, 1.55, s * 0.24, '#3a3a48', s * -0.55);
    K.box(0.5, 0.5, 0.03, 0, 0.95, 0.36, '#f4ecd8');
    K.cyl(0.05, 0.05, 1.2, 0, 1.1, 0.6, '#c8b070', 6, 0, 0, Math.PI / 2);
    return place(G, K.mesh(0.02), x, z, ry, height);
  },
  tomb(G, x, z, ry, height, r) {
    const K = kit(), c = ['#8a8a90', '#7a7a80', '#9a9aa0'][Math.floor(r() * 3)];
    if (r() < 0.6) { K.box(0.7, 0.25, 0.5, 0, 0.12, 0, '#6a6a70'); K.box(0.42, 1.1, 0.32, 0, 0.8, 0, c); }
    else { K.box(0.6, 0.3, 0.6, 0, 0.15, 0, '#6a6a70'); K.sph(0.3, 0, 0.5, 0, c, 1, 0.9, 1, 0); K.cone(0.38, 0.4, 0, 0.95, 0, c, 4); }
    return place(G, K.mesh(0.02), x, z, ry + (r() - 0.5) * 0.3, height);
  },
  ruinWall(G, x, z, ry, height, r) {
    const K = kit();
    for (let k = 0; k < 4; k++) { const hh = 0.6 + r() * 2.2; K.box(1.2, hh, 0.8, (k - 1.5) * 1.22, hh / 2, 0, '#8a867c'); }
    K.rock(0.5, 2.6, 0.2, 0.8, '#7a766e', 1, 0.6, 1); K.rock(0.4, -2.4, 0.15, 1.0, '#7a766e', 1, 0.6, 1);
    return place(G, K.mesh(), x, z, ry, height);
  },
  pillar(G, x, z, height, r) {
    const K = kit(), hh = 1 + r() * 2.5;
    K.cyl(0.35, 0.4, hh, 0, hh / 2, 0, '#9a968e', 10); K.box(1.0, 0.3, 1.0, 0, 0.15, 0, '#8a867c');
    return place(G, K.mesh(), x, z, r() * 3, height);
  },
  reeds(G, x, z, height, r) {
    const K = kit();
    for (let k = 0; k < 7; k++) K.cyl(0.02, 0.03, 1 + r() * 0.8, (r() - 0.5) * 0.8, 0.6, (r() - 0.5) * 0.8, '#6a8a3a', 4, (r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3);
    return place(G, K.mesh(0.012), x, z, 0, height);
  },
  scarecrowProp(G, x, z, height) {
    const K = kit();
    K.cyl(0.04, 0.04, 1.6, 0, 0.8, 0, '#6a4a32', 6); K.cyl(0.03, 0.03, 1.1, 0, 1.25, 0, '#6a4a32', 6, 0, 0, Math.PI / 2);
    K.cone(0.4, 0.25, 0, 1.75, 0, '#c8a868', 12); K.box(0.5, 0.5, 0.2, 0, 1.25, 0, '#8a6a4a');
    return place(G, K.mesh(0.015), x, z, Math.random() * 3, height);
  },
  boat(G, x, z, ry, y) {
    const K = kit();
    K.box(2.2, 0.6, 6, 0, 0.3, 0, '#5a3a26'); K.cyl(0.08, 0.08, 5, 0, 2.8, 0, '#3a2a1e', 6); K.box(0.05, 3, 2.4, 0, 3.2, 0, '#e8dcc0');
    const m = K.mesh(); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m;
  },
  anvil(G, x, z, height) {
    const K = kit();
    K.box(0.5, 0.5, 0.4, 0, 0.25, 0, '#5a3a26'); K.box(0.9, 0.3, 0.4, 0, 0.65, 0, '#3a3a40'); K.cone(0.2, 0.4, 0.6, 0.65, 0, '#3a3a40', 6, 0, 0, -Math.PI / 2);
    return place(G, K.mesh(0.02), x, z, 0, height);
  },
  laundry(G, x, z, ry, height) {
    const K = kit();
    for (const s of [-1, 1]) K.box(0.08, 2.0, 0.08, s * 1.4, 1.0, 0, '#5a3a26');
    K.cyl(0.02, 0.02, 2.8, 0, 1.9, 0, '#c8b898', 4, 0, 0, Math.PI / 2);
    for (let k = 0; k < 3; k++) K.box(0.6, 0.8, 0.02, -0.9 + k * 0.9, 1.45, 0, ['#5a7ab0', '#f4ecd8', '#c86a5a'][k]);
    return place(G, K.mesh(0.015), x, z, ry, height);
  },
};

/* ---------- batching ---------- */
/** merge every static mesh under G into one mesh per (material, chunk). Subtrees flagged `userData.keep` are left alone. */
export function batchStatic(G, size = 32) {
  G.updateMatrixWorld(true);
  const groups = new Map(), kill = [];
  const walk = o => {
    if (o.userData.keep) return;
    for (const c of o.children.slice()) walk(c);
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || !o.geometry || !o.material || Array.isArray(o.material)) return;
    const mat = o.material;
    if (mat.transparent || (mat.isShaderMaterial && !mat.userData.ink) || mat.isMeshBasicMaterial || mat.map) return;
    const g = o.geometry; if (!g.attributes.position || !g.attributes.normal) return;
    const wp = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
    const key = mat.uuid + '|' + Math.floor(wp.x / size) + ',' + Math.floor(wp.z / size) + '|' + (o.castShadow ? 1 : 0);
    let grp = groups.get(key); if (!grp) groups.set(key, grp = { mat, shadow: o.castShadow, geos: [] });
    const q = g.index ? g.toNonIndexed() : g.clone();
    const keep = mat.vertexColors ? ['position', 'normal', 'color'] : ['position', 'normal'];
    for (const k of Object.keys(q.attributes)) if (!keep.includes(k)) q.deleteAttribute(k);
    if (mat.vertexColors && !q.attributes.color) return;
    q.applyMatrix4(o.matrixWorld);
    grp.geos.push(q); kill.push(o);
  };
  walk(G);
  const killSet = new Set(kill);
  for (const o of kill) {
    // anything under a merged mesh that isn't merged itself (a light, a sprite) moves up to the mesh's parent
    for (const c of o.children.slice()) if (!killSet.has(c)) o.parent.attach(c);
    o.removeFromParent();
  }
  let n = 0;
  for (const { mat, shadow, geos } of groups.values()) {
    const g = mergeGeometries(geos); if (!g) continue;
    const m = new THREE.Mesh(g, mat); m.castShadow = shadow && !mat.userData.ink; m.receiveShadow = !mat.userData.ink;
    G.add(m); n++;
  }
  return n;
}

/** sky dome with a gradient, sun glow and puffy cartoon clouds */
export function sky(G, { top = '#4a9ae8', hor = '#cfe8ff', sun = [0.4, 0.5, -0.6], clouds = 18, cloudCol = '#ffffff', seed = 4 } = {}) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: C(top) }, hor: { value: C(hor) }, sun: { value: new THREE.Vector3(...sun).normalize() } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }',
    fragmentShader: 'uniform vec3 top, hor, sun; varying vec3 vD; void main(){ float y = max(vD.y, 0.0); vec3 c = mix(hor, top, pow(y, 0.6)); c += vec3(1.0,0.95,0.8) * pow(max(dot(vD, sun), 0.0), 60.0) * 0.6; gl_FragColor = vec4(c,1.0);\n#include <colorspace_fragment>\n}',
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), mat);
  dome.userData.keep = true;
  G.add(dome);
  const r = rng(seed);
  for (let i = 0; i < clouds; i++) {
    const cg = new THREE.Group();
    for (let k = 0; k < 5; k++) cg.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(4 + r() * 3, 1), toon(cloudCol, { emissive: '#ffffff', emissiveIntensity: 0.2 })), k * 4 - 8, r() * 2, r() * 3, 0, [1, 0.6, 1]));
    const a = r() * Math.PI * 2, d = 150 + r() * 100;
    cg.position.set(Math.cos(a) * d, 40 + r() * 40, Math.sin(a) * d);
    cg.lookAt(0, cg.position.y, 0);
    cg.userData.keep = true;
    G.add(cg);
  }
  return dome;
}
