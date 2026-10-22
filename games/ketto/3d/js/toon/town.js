// Area layouts. Every story area is a long map, north = -z:
//   south gate (back to the previous area) → a town on a street grid with turns, crossings and a square →
//   a wild stretch with a winding road and two side places (A and B) → a wall with a barred gate →
//   the landmark courtyard where the boss waits → the north gate (on to the next area).
// `plan()` decides where everything goes, paints the ground texture and returns heights and spots.
import { rng } from './world.js';

export const BOUNDS = { x0: -48.5, x1: 48.5, z0: -84.5, z1: 84.5 };   // walkable area, inside the fence
const X0 = -56, Z0 = -92, GW = 112, GH = 184;                       // occupancy grid: 1 m cells
export const FREE = 0, ROAD = 1, BUILD = 2, WATER = 3, RES = 4, WALL = 5, TREE = 6;
export const WALL_Z = -36;                                            // the wall in front of the landmark

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** dense points along a polyline (every `step` m) */
export function dense(pts, step = 0.5) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(len / step));
    for (let k = 0; k < n; k++) out.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]);
  }
  out.push(pts[pts.length - 1]);
  return out;
}
/** a smooth curve through points (Catmull-Rom), sampled densely */
function curve(pts, step = 0.5) {
  const P = [pts[0], ...pts, pts[pts.length - 1]], out = [];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]], len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), n = Math.max(2, Math.ceil(len / step));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
/** corners of a polyline rounded off with radius `rad`, then sampled densely */
function rounded(pts, rad = 4, step = 0.5) {
  if (pts.length < 3) return dense(pts, step);
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, pz] = pts[i - 1], [cx, cz] = pts[i], [nx, nz] = pts[i + 1];
    const l1 = Math.hypot(cx - px, cz - pz), l2 = Math.hypot(nx - cx, nz - cz), d = Math.min(rad, l1 / 2, l2 / 2);
    const a = [cx + (px - cx) / l1 * d, cz + (pz - cz) / l1 * d], b = [cx + (nx - cx) / l2 * d, cz + (nz - cz) / l2 * d];
    out.push(a);
    for (let k = 1; k < 6; k++) { const t = k / 6, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * cx + t * t * b[0], u * u * a[1] + 2 * u * t * cz + t * t * b[1]]); }
    out.push(b);
  }
  out.push(pts[pts.length - 1]);
  return dense(out, step);
}

export function plan(i, A, needs = {}) {
  const r = rng(1000 + i * 7919);
  const occ = new Uint8Array(GW * GH);
  const cell = (x, z) => { const a = Math.floor(x - X0), b = Math.floor(z - Z0); return a < 0 || b < 0 || a >= GW || b >= GH ? -1 : b * GW + a; };
  const get = (x, z) => { const k = cell(x, z); return k < 0 ? 255 : occ[k]; };
  const disc = (x, z, rad, v, onlyFree = false) => {
    for (let b = Math.floor(z - rad); b <= z + rad; b++) for (let a = Math.floor(x - rad); a <= x + rad; a++) {
      if ((a + 0.5 - x) ** 2 + (b + 0.5 - z) ** 2 > rad * rad) continue;
      const k = cell(a + 0.5, b + 0.5); if (k >= 0 && (!onlyFree || occ[k] === FREE)) occ[k] = v;
    }
  };
  const rectCells = (cx, cz, hw, hd, ry, fn) => {
    const c = Math.cos(ry), s = Math.sin(ry), R = Math.hypot(hw, hd);
    for (let b = Math.floor(cz - R); b <= cz + R; b++) for (let a = Math.floor(cx - R); a <= cx + R; a++) {
      const dx = a + 0.5 - cx, dz = b + 0.5 - cz, lx = dx * c - dz * s, lz = dx * s + dz * c;
      if (Math.abs(lx) <= hw && Math.abs(lz) <= hd) { if (fn(cell(a + 0.5, b + 0.5)) === false) return false; }
    }
    return true;
  };
  const rectFree = (cx, cz, hw, hd, ry) => rectCells(cx, cz, hw, hd, ry, k => k >= 0 && occ[k] === FREE);
  const rectSet = (cx, cz, hw, hd, ry, v) => rectCells(cx, cz, hw, hd, ry, k => { if (k >= 0) occ[k] = v; });
  const markLine = (pts, rad, v) => { for (const [x, z] of pts) disc(x, z, rad, v); };

  const P = { i, roads: [], lots: [], trees: [], props: [], spots: {}, items: {}, lamps: [], signs: [] };
  P.occ = occ; P.get = get; P.cell = cell;
  const style = A.town || 'village';

  /* ---------------- the town: a street grid with turns, crossings and a square ---------------- */
  const big = (A.village || 0) >= 6, small = (A.village || 0) <= 2;
  const sp = 17.5;
  let cols = big ? [-2, -1, 0, 1, 2] : small ? [-1, 0, 1] : (r() < 0.5 ? [-2, -1, 0, 1] : [-1, 0, 1, 2]);
  cols = cols.map(c => c * sp);
  const rows = small ? [70, 51] : [72, 56, 40];
  const nodes = [];
  rows.forEach((z, j) => cols.forEach((x, k) => nodes.push({ x: x + (x ? (r() - 0.5) * 5 : (r() - 0.5) * 2), z: z + (r() - 0.5) * 3.5, j, k, deg: 0, id: nodes.length })));
  const nodeAt = (j, k) => nodes.find(n => n.j === j && n.k === k);
  const entry = nodeAt(0, cols.indexOf(0));
  const allEdges = [];
  for (const n of nodes) { const e = nodeAt(n.j, n.k + 1), s = nodeAt(n.j + 1, n.k); if (e) allEdges.push([n, e]); if (s) allEdges.push([n, s]); }
  // a random spanning tree from the entry, then a few extra streets to make loops
  const inTree = new Set([entry]), edges = [];
  while (inTree.size < nodes.length) {
    const front = allEdges.filter(([a, b]) => inTree.has(a) !== inTree.has(b));
    const e = front[Math.floor(r() * front.length)];
    edges.push(e); inTree.add(e[0]); inTree.add(e[1]);
  }
  const rest = allEdges.filter(e => !edges.includes(e));
  for (let k = 0; k < (big ? 3 : 2) && rest.length; k++) edges.push(rest.splice(Math.floor(r() * rest.length), 1)[0]);
  for (const [a, b] of edges) { a.deg++; b.deg++; }
  // the square: on a crossing near the middle of town
  const midRow = small ? 0 : 1;
  const sq = nodes.filter(n => n.j === midRow).sort((a, b) => (b.deg >= 3) - (a.deg >= 3) || Math.abs(a.x) - Math.abs(b.x))[0];
  P.plaza = { x: sq.x, z: sq.z, w: 17, d: 14 };
  // the exit north out of town
  const last = rows.length - 1;
  const exitN = nodes.filter(n => n.j === last && Math.abs(n.x) < 22 && n !== sq).sort(() => r() - 0.5)[0] || nodes.filter(n => n.j === last)[0];
  P.exitX = exitN.x;
  const streetW = 4.2;
  const streets = edges.map(([a, b]) => [[a.x, a.z], [b.x, b.z]]);
  streets.push([[0, 92], [0, 80], [entry.x, entry.z]]);                       // from the south gate
  streets.push([[exitN.x, exitN.z], [exitN.x, 30]]);                          // out of town, north
  for (const s of streets) P.roads.push({ pts: dense(s), raw: s, w: streetW, kind: 'street' });
  P.townGate = [exitN.x, 33];

  /* ---------------- the wild stretch: a winding road and two side places ---------------- */
  // the landmark sits behind the wall at x = lx; the road north ends at its gate
  const lx = Math.round((r() - 0.5) * 20);
  const s = lx < 0 ? 1 : lx > 0 ? -1 : (r() < 0.5 ? 1 : -1);
  const xg = lx + s * 25;
  P.lx = lx; P.xg = xg; P.gs = s;
  const way = [[exitN.x, 30]];
  for (const z of [18, 4, -10, -24]) { const px = way[way.length - 1][0]; let x = px + (r() - 0.5) * 30; x = Math.max(-26, Math.min(26, x)); way.push([x, z]); }
  way.push([lx, WALL_Z + 6]); way.push([lx, WALL_Z]);
  // a river crossing the wild stretch (some areas): the road crosses it straight, on a bridge
  const riverHere = A.river && A.landmark !== 'bridge';
  if (riverHere) {
    const rz = -3;
    const bx = Math.max(-20, Math.min(20, way[2][0]));
    way.splice(2, 2, [bx, rz + 7], [bx, rz - 7]);
    P.river = { z: rz, w: 6, bridges: [{ x: bx, z: rz, ang: 0, len: 10, h: 1.0 }] };
  }
  const road = curve(way, 0.5);
  P.roads.push({ pts: road, raw: way, w: 4.0, kind: 'road' });
  P.road = road;
  const roadX = z => { let best = road[0], bd = 1e9; for (const p of road) { const d = Math.abs(p[1] - z); if (d < bd) { bd = d; best = p; } } return best[0]; };
  // side places: one south-west/east, one north on the other side of the road
  const pois = {};
  const placePOI = (key, z) => {
    const rx = roadX(z), side = Math.abs(rx) < 6 ? (r() < 0.5 ? 1 : -1) : -Math.sign(rx);
    const x = side * (31 + r() * 4);
    pois[key] = { x, z, r: 9, kind: (A.pois && A.pois[key]) || 'grove', side };
    // a footpath from the road to the clearing, with a little bend
    const sx = rx + side * 2, ex = x - side * 7;
    const pth = [[sx, z + (r() - 0.5) * 3], [(sx + ex) / 2, z + (r() - 0.5) * 6], [ex, z]];
    P.roads.push({ pts: curve(pth, 0.5), raw: pth, w: 2.4, kind: 'path' });
    pois[key].entry = [ex + side * 1.5, z];
    pois[key].face = -side;    // the clearing opens toward the road
  };
  placePOI('A', 15);
  placePOI('B', -19);
  P.pois = pois;

  /* ---------------- the landmark: a wall with a barred gate, a courtyard, the boss, the north gate ---------------- */
  P.wall = { z: WALL_Z, gap: [lx - 2.6, lx + 2.6] };
  const bridgeLM = A.landmark === 'bridge';
  P.crossZ = bridgeLM ? -62 : -50;
  P.court = bridgeLM ? null : { x: lx, z: -50, w: 18, d: 12 };
  P.boss = [lx, -50];
  if (bridgeLM) {
    P.river = { z: -51, w: 7, bridges: [{ x: lx, z: -51, ang: 0, len: 14, h: 1.6, big: true }] };
    P.roads.push({ pts: dense([[lx, WALL_Z], [lx, -62]]), raw: [[lx, WALL_Z], [lx, -62]], w: 4.2, kind: 'stone' });
  } else P.roads.push({ pts: dense([[lx, WALL_Z], [lx, -45]]), raw: [[lx, WALL_Z], [lx, -45]], w: 4.2, kind: 'stone' });
  const gpath = [[lx + s * 6, P.crossZ], [xg, P.crossZ], [xg, -92]];
  P.roads.push({ pts: rounded(gpath, 5), raw: gpath, w: 3.6, kind: 'stone' });
  P.landmark = { x: lx, z: bridgeLM ? -72 : -66, kind: A.landmark };
  P.gates = { S: [0, 83.6], N: [xg, -83.6] };
  P.start = { S: [0, 74, Math.PI], N: [xg, -74, 0] };

  /* ---------------- mark everything on the grid ---------------- */
  for (const rd of P.roads) markLine(rd.pts, rd.w / 2 + (rd.kind === 'path' ? 0.4 : 0.8), ROAD);
  rectSet(P.plaza.x, P.plaza.z, P.plaza.w / 2, P.plaza.d / 2, 0, RES);
  if (P.court) rectSet(P.court.x, P.court.z, P.court.w / 2, P.court.d / 2, 0, RES);
  for (const k in pois) disc(pois[k].x, pois[k].z, pois[k].r + 1, RES);
  if (P.river) { for (let x = -60; x <= 60; x += 0.5) disc(x, P.river.z + Math.sin(x * 0.12) * 1.2, P.river.w / 2, WATER); for (const b of P.river.bridges) rectSet(b.x, b.z, 1.9, b.len / 2, b.ang, ROAD); }
  for (let x = -60; x <= 60; x += 0.5) if (x < P.wall.gap[0] || x > P.wall.gap[1]) disc(x, WALL_Z, 1.2, WALL);
  // the landmark's own ground (builders keep inside it)
  rectSet(P.landmark.x, P.landmark.z, 13, 10, 0, RES);
  // the space in front of each gate stays open
  disc(0, 80, 4, RES, true); disc(xg, -80, 4, RES, true);
  disc(P.townGate[0], P.townGate[1], 3.5, RES, true);

  /* ---------------- houses along every street ---------------- */
  const lots = P.lots;
  const roofs = A.roofs || ['#4a4a5a', '#5a4a44', '#3e4a5a'];
  for (const st of streets) {
    for (let a = 0; a < st.length - 1; a++) {
      const [ax, az] = st[a], [bx, bz] = st[a + 1], len = Math.hypot(bx - ax, bz - az);
      const dx = (bx - ax) / len, dz = (bz - az) / len, nx = -dz, nz = dx;
      for (const side of [-1, 1]) {
        let t = 3.7 + r() * 1.2;
        while (t < len - 3.7) {
          const camp = style === 'camp';
          const w = camp ? 3.6 : 4.4 + r() * 2.2, d = camp ? 4.2 : 3.3 + r() * 1.1;
          if (t + w > len - 3.4) break;
          const off = streetW / 2 + 1.35 + d / 2;
          const cx = ax + dx * (t + w / 2) + nx * side * off, cz = az + dz * (t + w / 2) + nz * side * off;
          if (cz < 33 || cz > 82 || Math.abs(cx) > 44) { t += w + 1; continue; }
          if (r() < 0.08) { t += 3 + r() * 3; continue; }    // a gap for a garden
          const fx = -nx * side, fz = -nz * side, ry = Math.atan2(fx, fz);
          if (rectFree(cx, cz, w / 2 + 0.35, d / 2 + 0.35, ry)) {
            rectSet(cx, cz, w / 2 + 0.2, d / 2 + 0.2, ry, BUILD);
            const lot = { x: cx, z: cz, w, d, ry, door: [cx + fx * (d / 2 + 1.0), cz + fz * (d / 2 + 1.0)], face: [fx, fz], street: [dx, dz],
              roof: roofs[Math.floor(r() * roofs.length)], floors: big && r() < 0.28 ? 2 : 1, kura: !camp && r() < 0.08, thatch: style === 'farm' ? r() < 0.75 : r() < 0.1, tent: camp };
            lots.push(lot);
            t += w + 0.7 + r() * 1.4;
          } else t += 0.8;
        }
      }
    }
  }
  // who lives where: the shop and the quest-givers' houses are the ones nearest the square
  const sqd = l => Math.hypot(l.door[0] - P.plaza.x, l.door[1] - P.plaza.z);
  const byNear = lots.filter(l => !l.kura).sort((a, b) => sqd(a) - sqd(b));
  if (byNear[0]) { byNear[0].role = 'shop'; byNear[0].kura = false; byNear[0].tent = false; P.spots.shop = byNear[0].door; }
  P.spots.house = byNear.slice(1, 1 + (needs.house || 4)).map(l => { l.role = 'npc'; l.lanterns = true; return l.door; });
  // an inn: the biggest house near the gate gets a second floor
  const inn = lots.filter(l => !l.role && !l.tent && l.z > 60).sort((a, b) => b.w - a.w)[0]; if (inn) { inn.floors = 2; inn.inn = true; inn.kura = false; }
  // villagers live in the other houses
  P.spots.homes = lots.filter(l => !l.role).map(l => l.door);

  /* ---------------- where people stand ---------------- */
  const pl = P.plaza;
  P.spots.plaza = [0, 1, 2, 3, 4, 5].map(k => { const a = k / 6 * Math.PI * 2 + 0.4; return [pl.x + Math.cos(a) * 5, pl.z + Math.sin(a) * 4]; });
  P.spots.exit = [P.townGate[0] + 2.4, P.townGate[1] + 1.5];
  P.spots.gate = [3, 80];
  P.spots.barrier = [lx + s * 4.2, WALL_Z + 2.4];
  P.spots.boss = P.boss;
  for (const k in pois) { const p = pois[k]; P.spots[k] = [p.entry[0], p.z + 2.8]; }
  // roadside spots on the wild road (challengers, people on the road)
  const roadSpots = [];
  for (let k = 0; k < 8; k++) { const p = road[Math.floor((0.12 + 0.76 * k / 7) * (road.length - 1))], q = road[Math.min(road.length - 1, Math.floor((0.12 + 0.76 * k / 7) * (road.length - 1)) + 2)];
    const tx = q[0] - p[0], tz = q[1] - p[1], tl = Math.hypot(tx, tz) || 1, sd = k % 2 ? 1 : -1;
    roadSpots.push([p[0] - tz / tl * 3.2 * sd, p[1] + tx / tl * 3.2 * sd]); }
  P.spots.road = roadSpots;

  /* ---------------- items and objects for quests (fixed per area, so they come back in the same place) ---------------- */
  const used = [];
  const okSpot = (x, z, gap = 6) => get(x, z) === FREE && !used.some(u => Math.hypot(u[0] - x, u[1] - z) < gap) && Math.abs(x) < 46 && z < 82 && z > -82;
  const take = (x, z) => { used.push([x, z]); disc(x, z, 1.4, RES); return [x, z]; };
  P.items.A = []; P.items.B = [];
  for (const k of ['A', 'B']) {
    const p = pois[k], n = Math.max(needs[k] || 0, 0);
    // spread over the back of the clearing, away from the path in
    const back = p.face > 0 ? Math.PI : 0;
    for (let m = 0; m < n; m++) { const a = back + (n > 1 ? (m / (n - 1) - 0.5) * 3.6 : 0), rr = 4.4 + (m % 2) * 1.3; const q = [p.x + Math.cos(a) * rr, p.z + Math.sin(a) * rr]; used.push(q); P.items[k].push(q); }
  }
  const pickAlong = (n, cand) => { const out = []; for (let tries = 0; out.length < n && tries < 4000; tries++) { const [x, z] = cand(); if (okSpot(x, z, 9)) out.push(take(x, z)); } return out; };
  // near the wild road but off it
  P.items.wild = pickAlong(needs.wild || 0, () => { const p = road[Math.floor(r() * road.length * 0.92)], a = r() * Math.PI * 2, d = 4 + r() * 5; return [p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d]; });
  P.items.road = pickAlong(needs.road || 0, () => { const t = 0.08 + r() * 0.84, k = Math.floor(t * (road.length - 3)), p = road[k], q = road[k + 2], tx = q[0] - p[0], tz = q[1] - p[1], tl = Math.hypot(tx, tz) || 1, sd = r() < 0.5 ? 1 : -1; return [p[0] - tz / tl * 3.3 * sd, p[1] + tx / tl * 3.3 * sd]; });
  const townRoads = P.roads.filter(x => x.kind === 'street');
  P.items.town = pickAlong(needs.town || 0, () => { const rd = townRoads[Math.floor(r() * townRoads.length)], k = Math.floor(r() * (rd.pts.length - 3)), p = rd.pts[k], q = rd.pts[k + 2], tx = q[0] - p[0], tz = q[1] - p[1], tl = Math.hypot(tx, tz) || 1, sd = r() < 0.5 ? 1 : -1; return [p[0] - tz / tl * 2.9 * sd, p[1] + tx / tl * 2.9 * sd]; });
  P.items.river = P.river ? pickAlong(needs.river || 0, () => { const x = (r() - 0.5) * 70, sd = r() < 0.5 ? 1 : -1; return [x, P.river.z + Math.sin(x * 0.12) * 1.2 + sd * (P.river.w / 2 + 1.6)]; }) : [];
  for (const [x, z] of [...P.items.A, ...P.items.B]) disc(x, z, 1.2, RES);

  /* ---------------- trees: woods in the wild stretch, a few in yards, a frame along the fence ---------------- */
  const noise = (x, z) => Math.sin(x * 0.11 + Math.sin(z * 0.07) * 2.2) * Math.cos(z * 0.09 - x * 0.04) * 0.5 + 0.5;
  const kinds = A.trees && A.trees.length ? A.trees : [];
  const totalW = kinds.reduce((t, k) => t + k[1], 0);
  const pickKind = () => { let v = r() * totalW; for (const [k, n] of kinds) { if ((v -= n) <= 0) return k; } return kinds[0][0]; };
  const nearFlat = (x, z, d) => { for (let b = -d; b <= d; b += 1) for (let a = -d; a <= d; a += 1) { const v = get(x + a, z + b); if (v !== FREE && v !== TREE && v !== 255) return true; } return false; };
  const want = Math.round((A.forest || 1) * 240);
  if (kinds.length) for (let tries = 0, n = 0; n < want && tries < want * 40; tries++) {
    const x = (r() - 0.5) * 96, z = (r() - 0.5) * 168;
    const inTown = z > 31, edge = Math.abs(x) > 38 || z < -78;
    const p = inTown ? 0.18 : edge ? 0.9 : noise(x, z) * 0.9;
    if (r() > p) continue;
    if (get(x, z) !== FREE || nearFlat(x, z, inTown ? 2 : 2)) continue;
    if (Math.abs(x) > 47.5 || Math.abs(z) > 83.5) continue;
    const kind = pickKind();
    P.trees.push([x, z, kind, 0.85 + r() * 0.55]); disc(x, z, kind === 'bamboo' ? 1.6 : 1.4, TREE); n++;
  }
  // a grove place is thick with trees all around its clearing
  for (const k in pois) if (pois[k].kind === 'grove' && kinds.length) {
    const p = pois[k];
    for (let m = 0; m < 16; m++) { const a = m / 16 * Math.PI * 2 + r() * 0.3, d = p.r + 0.5 + r() * 3.5, x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d;
      if (get(x, z) === FREE && Math.abs(x) < 47.5) { P.trees.push([x, z, kinds[0][0], 0.9 + r() * 0.4]); disc(x, z, 1.3, TREE); } }
  }

  // bushes and flower clumps fill the gaps (no collision, just looks)
  P.bushes = [];
  for (let tries = 0; P.bushes.length < 420 && tries < 9000; tries++) {
    const x = (r() - 0.5) * 96, z = (r() - 0.5) * 168, v = get(x, z);
    if (v !== FREE || (z > 31 && r() < 0.6)) continue;
    if (r() > 0.25 + noise(x, z) * 0.75) continue;
    P.bushes.push([x, z, 0.5 + r() * 0.7, r()]);
  }

  /* ---------------- heights: hills only where nothing is built, rising beyond the fence ---------------- */
  const dist = new Float32Array(GW * GH);
  for (let k = 0; k < occ.length; k++) dist[k] = occ[k] === FREE || occ[k] === TREE ? 1e4 : 0;
  for (let b = 0; b < GH; b++) for (let a = 0; a < GW; a++) { const k = b * GW + a; let v = dist[k]; if (a) v = Math.min(v, dist[k - 1] + 1); if (b) v = Math.min(v, dist[k - GW] + 1); if (a && b) v = Math.min(v, dist[k - GW - 1] + 1.414); if (b && a < GW - 1) v = Math.min(v, dist[k - GW + 1] + 1.414); dist[k] = v; }
  for (let b = GH - 1; b >= 0; b--) for (let a = GW - 1; a >= 0; a--) { const k = b * GW + a; let v = dist[k]; if (a < GW - 1) v = Math.min(v, dist[k + 1] + 1); if (b < GH - 1) v = Math.min(v, dist[k + GW] + 1); if (a < GW - 1 && b < GH - 1) v = Math.min(v, dist[k + GW + 1] + 1.414); if (b < GH - 1 && a) v = Math.min(v, dist[k + GW - 1] + 1.414); dist[k] = v; }
  const distAt = (x, z) => {
    const fx = x - X0 - 0.5, fz = z - Z0 - 0.5, a = Math.floor(fx), b = Math.floor(fz);
    if (a < 0 || b < 0 || a >= GW - 1 || b >= GH - 1) return 40;
    const u = fx - a, v = fz - b, k = b * GW + a;
    return (dist[k] * (1 - u) + dist[k + 1] * u) * (1 - v) + (dist[k + GW] * (1 - u) + dist[k + GW + 1] * u) * v;
  };
  const hills = A.clouds ? 0 : (A.hills ?? 1);
  const bumps = Array.from({ length: 22 }, () => [(r() - 0.5) * 110, (r() - 0.5) * 190, 6 + r() * 12, (0.5 + r()) * 2.4 * hills]);
  const height = (x, z) => {
    let h = 0;
    for (const [bx, bz, rad, amp] of bumps) { const q = ((x - bx) ** 2 + (z - bz) ** 2) / (rad * rad); if (q < 9) h += amp * Math.exp(-q); }
    let m = smooth(2.5, 12, distAt(x, z));
    if (z > 31 && z < 84) m *= 0.35;
    h *= m;
    // beyond the fence: hills, or a drop into the clouds
    const ex = Math.max(Math.abs(x) - 49.5, Math.abs(z) - 85.5, 0);
    if (ex > 0) {
      const lane = z > 0 ? Math.abs(x) : Math.abs(x - xg);
      const k = A.clouds ? 1 : smooth(4, 14, lane) * 0.85 + 0.15;
      h += (A.clouds ? -(ex * 1.4 + ex * ex * 0.2) : (ex * 0.9 + ex * ex * 0.045) * k) * (A.clouds ? 1 : Math.max(0.45, hills));
    }
    return h;
  };
  P.height = height;
  P.distAt = distAt;
  P.dist = dist;
  return P;
}

/* ---------------- painting the ground ---------------- */
export const MAP = { x0: -62, x1: 62, z0: -98, z1: 98 };
const PPM = 10;
/** paint the ground texture for plan P: grass, fields, roads, cobbles, the square, water, yards */
export function paint(P, A) {
  const W = (MAP.x1 - MAP.x0) * PPM, H = (MAP.z1 - MAP.z0) * PPM;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const r = rng(77 + P.i * 13);
  const X = x => (x - MAP.x0) * PPM, Z = z => (z - MAP.z0) * PPM;
  g.fillStyle = A.grass[0]; g.fillRect(0, 0, W, H);
  // soft patches of darker and lighter grass
  for (let k = 0; k < 340; k++) {
    const x = r() * W, y = r() * H, rad = (3 + r() * 11) * PPM, col = r() < 0.5 ? A.grass[1] : A.grass[2];
    const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, hexA(col, 0.38)); gr.addColorStop(1, hexA(col, 0));
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rad, rad * (0.6 + r() * 0.6), r() * 3, 0, Math.PI * 2); g.fill();
  }
  for (let k = 0; k < 9000; k++) { g.fillStyle = hexA(r() < 0.5 ? A.grass[1] : A.grass[2], 0.5); const s = 1 + r() * 2; g.fillRect(r() * W, r() * H, s, s); }
  if (A.flowers !== false) for (let k = 0; k < 700; k++) { g.fillStyle = ['#ffffff', '#ffd84a', '#ff9ab8', '#c8a8ff'][Math.floor(r() * 4)]; const x = r() * W, y = r() * H; g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
  // yards and contact shadows under buildings
  for (const l of P.lots) {
    g.save(); g.translate(X(l.x), Z(l.z)); g.rotate(-l.ry);
    g.fillStyle = hexA(A.path[1], 0.35); rr(g, -(l.w / 2 + 1.4) * PPM, -(l.d / 2 + 1.2) * PPM, (l.w + 2.8) * PPM, (l.d + 3.2) * PPM, 8); g.fill();
    g.fillStyle = 'rgba(20,16,10,0.42)'; rr(g, -(l.w / 2 + 0.5) * PPM, -(l.d / 2 + 0.5) * PPM, (l.w + 1) * PPM, (l.d + 1) * PPM, 6); g.fill();
    g.restore();
    // stepping stones to the door
    g.fillStyle = '#a8a294';
    for (let k = 0; k < 2; k++) { const t = 0.35 + k * 0.4, x = l.x + l.face[0] * (l.d / 2 + t), z = l.z + l.face[1] * (l.d / 2 + t); g.beginPath(); g.ellipse(X(x), Z(z), 3.2, 2.6, 0, 0, 7); g.fill(); }
  }
  // places
  for (const k in P.pois) poiGround(g, P.pois[k], X, Z, r, A);
  // water
  if (P.river) {
    const R = P.river;
    const line = w => { g.beginPath(); for (let x = MAP.x0; x <= MAP.x1; x += 0.5) { const z = R.z + Math.sin(x * 0.12) * 1.2; x === MAP.x0 ? g.moveTo(X(x), Z(z)) : g.lineTo(X(x), Z(z)); } g.lineWidth = w * PPM; g.stroke(); };
    g.lineCap = 'round'; g.strokeStyle = A.path[1]; line(R.w + 2.2); g.strokeStyle = '#2a6a8a'; line(R.w + 0.4); g.strokeStyle = '#3a8ab0'; line(R.w - 1.6);
  }
  // roads: footpaths, then dirt roads, then stone streets on top
  g.lineCap = 'round'; g.lineJoin = 'round';
  const stroke = (pts, w, col) => { g.beginPath(); pts.forEach(([x, z], k) => k ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))); g.lineWidth = w * PPM; g.strokeStyle = col; g.stroke(); };
  for (const kind of ['path', 'road', 'stone', 'street']) for (const rd of P.roads.filter(x => x.kind === kind)) {
    const stone = kind === 'street' || kind === 'stone';
    stroke(rd.pts, rd.w + (stone ? 0.7 : 1.1), stone ? (A.stone || ['#b8b0a0', '#7a7468'])[1] : A.path[1]);
    stroke(rd.pts, rd.w, stone ? (A.stone || ['#b8b0a0', '#7a7468'])[0] : A.path[0]);
  }
  // wheel ruts and pebbles on dirt roads
  for (const rd of P.roads.filter(x => x.kind === 'road')) {
    for (const off of [-0.75, 0.75]) { g.beginPath(); rd.pts.forEach(([x, z], k) => { const q = rd.pts[Math.min(rd.pts.length - 1, k + 1)], p = rd.pts[Math.max(0, k - 1)], tx = q[0] - p[0], tz = q[1] - p[1], tl = Math.hypot(tx, tz) || 1; const px = X(x - tz / tl * off), pz = Z(z + tx / tl * off); k ? g.lineTo(px, pz) : g.moveTo(px, pz); }); g.lineWidth = 0.32 * PPM; g.strokeStyle = hexA(A.path[1], 0.45); g.stroke(); }
    for (let k = 0; k < rd.pts.length; k += 2) { const [x, z] = rd.pts[k]; g.fillStyle = hexA(A.path[1], 0.7); g.fillRect(X(x + (r() - 0.5) * rd.w * 0.8), Z(z + (r() - 0.5) * rd.w * 0.8), 2 + r() * 2, 2 + r() * 2); }
  }
  // cobbles on stone streets
  const stoneCols = A.stone || ['#b8b0a0', '#7a7468'];
  for (const rd of P.roads.filter(x => x.kind === 'street' || x.kind === 'stone')) {
    let acc = 0;
    for (let k = 1; k < rd.pts.length; k++) {
      const [ax, az] = rd.pts[k - 1], [bx, bz] = rd.pts[k], seg = Math.hypot(bx - ax, bz - az); acc += seg;
      if (acc < 0.55) continue; acc = 0;
      const tx = (bx - ax) / (seg || 1), tz = (bz - az) / (seg || 1), ang = Math.atan2(tz, tx);
      for (let o = -rd.w / 2 + 0.35; o <= rd.w / 2 - 0.3; o += 0.55) {
        const x = bx - tz * o + (r() - 0.5) * 0.12, z = bz + tx * o + (r() - 0.5) * 0.12;
        g.save(); g.translate(X(x), Z(z)); g.rotate(ang + (r() - 0.5) * 0.2);
        g.fillStyle = shade(stoneCols[0], 0.86 + r() * 0.24); rr(g, -2.2, -2.2, 4.4, 4.4, 1.4); g.fill(); g.restore();
      }
    }
  }
  // the square and the courtyard: big flagstones
  for (const sq of [P.plaza, P.court].filter(Boolean)) {
    g.fillStyle = stoneCols[1]; rr(g, X(sq.x - sq.w / 2 - 0.4), Z(sq.z - sq.d / 2 - 0.4), (sq.w + 0.8) * PPM, (sq.d + 0.8) * PPM, 10); g.fill();
    for (let x = sq.x - sq.w / 2; x < sq.x + sq.w / 2 - 0.1; x += 1.4) for (let z = sq.z - sq.d / 2; z < sq.z + sq.d / 2 - 0.1; z += 1.4) {
      g.fillStyle = shade(stoneCols[0], 0.9 + r() * 0.18); g.fillRect(X(x) + 1, Z(z) + 1, Math.min(1.4, sq.x + sq.w / 2 - x) * PPM - 2, Math.min(1.4, sq.z + sq.d / 2 - z) * PPM - 2);
    }
  }
  return cv;
}

/** a small top-down map image for the minimap (4 px/m) */
export function minimap(P, A, groundCanvas) {
  const S = 4, W = (MAP.x1 - MAP.x0) * S, H = (MAP.z1 - MAP.z0) * S;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.drawImage(groundCanvas, 0, 0, W, H);
  g.fillStyle = 'rgba(10,8,14,0.18)'; g.fillRect(0, 0, W, H);
  const X = x => (x - MAP.x0) * S, Z = z => (z - MAP.z0) * S;
  g.fillStyle = 'rgba(30,60,30,0.55)';
  for (const [x, z] of P.trees) { g.beginPath(); g.arc(X(x), Z(z), 4.5, 0, 7); g.fill(); }
  for (const l of P.lots) {
    g.save(); g.translate(X(l.x), Z(l.z)); g.rotate(-l.ry);
    g.fillStyle = l.role === 'shop' ? '#c8783a' : l.role === 'npc' ? '#8a5a6a' : '#5a5060'; g.fillRect(-l.w / 2 * S, -l.d / 2 * S, l.w * S, l.d * S);
    g.strokeStyle = '#1a1220'; g.lineWidth = 2; g.strokeRect(-l.w / 2 * S, -l.d / 2 * S, l.w * S, l.d * S);
    g.restore();
  }
  // the wall in front of the landmark
  g.strokeStyle = '#2a2230'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(X(-50), Z(WALL_Z)); g.lineTo(X(P.wall.gap[0]), Z(WALL_Z)); g.moveTo(X(P.wall.gap[1]), Z(WALL_Z)); g.lineTo(X(50), Z(WALL_Z)); g.stroke();
  // the landmark itself
  g.fillStyle = '#3a2a3a'; g.fillRect(X(P.landmark.x - 9), Z(P.landmark.z - 7), 18 * S, 14 * S);
  // the fence
  g.strokeStyle = 'rgba(40,24,16,0.9)'; g.lineWidth = 3; g.strokeRect(X(-49.2), Z(-85.2), 98.4 * S, 170.4 * S);
  return cv;
}

function poiGround(g, p, X, Z, r, A) {
  const PPMr = p.r * PPM;
  const col = { camp: '#8a7458', shrine: '#cfc8b8', graves: '#4a4a40', ruins: '#9a9484', hotspring: '#a8a49a', lumber: '#b8946a', tower: '#9a845e', field: '#6a8a5a', pond: A.grass[1], grove: A.grass[1], cave: '#6a6058' }[p.kind] || A.path[1];
  const gr = g.createRadialGradient(X(p.x), Z(p.z), PPMr * 0.4, X(p.x), Z(p.z), PPMr * 1.15);
  gr.addColorStop(0, hexA(col, 0.95)); gr.addColorStop(1, hexA(col, 0));
  g.fillStyle = gr; g.beginPath(); g.arc(X(p.x), Z(p.z), PPMr * 1.15, 0, 7); g.fill();
  if (p.kind === 'shrine' || p.kind === 'ruins') for (let k = 0; k < 500; k++) { const a = r() * 7, d = Math.sqrt(r()) * p.r; g.fillStyle = hexA('#8a8478', 0.6); g.fillRect(X(p.x + Math.cos(a) * d), Z(p.z + Math.sin(a) * d), 2, 2); }
  if (p.kind === 'field') {
    // rice paddies: flooded squares with rows of seedlings
    for (let a = -2; a < 2; a++) for (let b = -2; b < 2; b++) {
      const x = p.x + a * 4.2 + 0.3, z = p.z + b * 4.2 + 0.3;
      if (Math.hypot(x + 2 - p.x, z + 2 - p.z) > p.r + 1) continue;
      g.fillStyle = '#5a8aa0'; g.fillRect(X(x), Z(z), 3.6 * PPM, 3.6 * PPM);
      g.fillStyle = '#7ab04a'; for (let u = 0; u < 6; u++) for (let v = 0; v < 6; v++) g.fillRect(X(x + 0.3 + u * 0.55), Z(z + 0.3 + v * 0.55), 2.4, 2.4);
    }
  }
  if (p.kind === 'pond' || p.kind === 'hotspring') {
    g.fillStyle = p.kind === 'hotspring' ? '#7ab8c0' : '#2a6a8a'; g.beginPath(); g.ellipse(X(p.x), Z(p.z), 3.6 * PPM, 3.0 * PPM, 0, 0, 7); g.fill();
  }
}

function rr(g, x, y, w, h, rad) { g.beginPath(); g.roundRect(x, y, w, h, rad); }
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function shade(hex, k) { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
