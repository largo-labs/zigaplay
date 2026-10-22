// The 20 story areas: one per level, themed after its stage. town.js lays each one out (a town on a street grid,
// a wild stretch with two side places, a walled landmark where the boss waits, gates south and north);
// this file builds it: houses, props, trees, water, walls, the landmark and the weather.
import * as THREE from 'three';
import { toon, part, merged } from './toon.js';
import * as W from './world.js';
import { plan, paint, minimap, MAP, BOUNDS, WALL_Z, FREE } from './town.js';

const DAY = { sky: ['#3f8fe0', '#d6ecff'], fog: ['#cfe2f0', 60, 190], hemi: ['#dceeff', '#6a7a4a', 1.3], sun: ['#fff2dc', 2.6, [14, 22, 10]] };
const DUSK = { sky: ['#5a4a9a', '#ffb07a'], fog: ['#e8a888', 50, 170], hemi: ['#ffd0b0', '#5a4a4a', 1.1], sun: ['#ffb070', 2.4, [-20, 10, -14]] };
const NIGHT = { sky: ['#0a1030', '#2a3a6a'], fog: ['#1a2448', 35, 140], hemi: ['#7a8ac0', '#1a1a2a', 0.95], sun: ['#b8c8ff', 1.3, [-10, 20, -12]], stars: true };
const SNOW = { sky: ['#8aa8c8', '#e8f0f8'], fog: ['#dfe8f2', 40, 150], hemi: ['#ffffff', '#a8b4c4', 1.4], sun: ['#ffffff', 2.0, [10, 20, 8]] };
const STORM = { sky: ['#2a3442', '#6a7888'], fog: ['#4a5664', 30, 120], hemi: ['#a8b4c8', '#2a2e34', 1.0], sun: ['#d8e4ff', 1.4, [-6, 20, 6]] };
const FIRE = { sky: ['#1a0806', '#8a2a10'], fog: ['#4a1a0e', 35, 140], hemi: ['#ff9a6a', '#2a0e08', 0.95], sun: ['#ff8a4a', 2.0, [8, 14, -10]] };
const RED = { sky: ['#1a0608', '#7a1a1e'], fog: ['#3a0e12', 35, 140], hemi: ['#d86a6a', '#1a0808', 0.95], sun: ['#ff6a5a', 1.8, [-8, 16, -12]] };
const SKY = { sky: ['#4a8ae8', '#ffffff'], fog: ['#eef4ff', 70, 220], hemi: ['#ffffff', '#c8d0e0', 1.5], sun: ['#fff8e0', 2.6, [10, 24, 6]] };

const G0 = { grass: ['#7fb04a', '#5e9238', '#a8c860'], path: ['#d8c08a', '#b89a62'] };
const DOOR = { col: '#5a3a26', post: '#3a2a1e', roof: '#3a3a48' }, RDOOR = { col: '#a8282a', post: '#3a1a14', roof: '#2a2a34' };
export const AREAS = [
  { ...DAY, ...G0, trees: [['bamboo', 40], ['round', 8]], village: 6, town: 'farm', landmark: 'shrine', particles: 'leaves', wall: 'bamboo', doors: DOOR },
  { ...DUSK, grass: ['#8aa850', '#6a8a3a', '#b0c060'], path: ['#d8b890', '#b89470'], trees: [['sakura', 26], ['round', 8]], village: 5, landmark: 'shrine', particles: 'petals', wall: 'white', doors: RDOOR, lanterns: 6 },
  { ...SNOW, grass: ['#e8eef4', '#c8d4e2', '#ffffff'], path: ['#b8c0cc', '#9aa4b2'], stone: ['#c8ccd4', '#8a94a4'], roofs: ['#eef2f8', '#dfe6ee'], trees: [['snow', 18], ['pine', 18]], village: 4, town: 'farm', landmark: 'temple', particles: 'snow', wall: 'stone', doors: DOOR, flowers: false },
  { ...DUSK, grass: ['#a8a050', '#8a7a3a', '#c8b060'], path: ['#c8a878', '#a88858'], trees: [['maple', 30], ['pine', 6]], village: 4, landmark: 'bridge', particles: 'leaves', river: true, wall: 'wood', doors: DOOR },
  { ...FIRE, grass: ['#4a4030', '#3a3024', '#5a4a34'], path: ['#6a5a48', '#4a3e30'], stone: ['#7a7068', '#4a4440'], roofs: ['#2a2026', '#3a2a2a'], wallHouse: '#c8b8a0', trees: [['pine', 14], ['dead', 8]], village: 4, landmark: 'castle', particles: 'embers', fire: true, wall: 'stone', doors: RDOOR, flowers: false },
  { ...STORM, grass: ['#5a6a4a', '#4a5a3a', '#6a7a54'], path: ['#8a8478', '#6a665e'], trees: [['pine', 22]], village: 4, landmark: 'cliff', particles: 'rain', wall: 'rock', doors: DOOR, flowers: false },
  { ...DAY, ...G0, trees: [['round', 18], ['pine', 10]], village: 7, landmark: 'dojo', particles: null, wall: 'white', doors: DOOR },
  { ...DUSK, grass: ['#6a8a4a', '#4e6a36', '#8aa058'], path: ['#c8b898', '#a89878'], trees: [['pine', 22], ['round', 8]], village: 4, landmark: 'gates', particles: 'leaves', wall: 'white', doors: RDOOR },
  { ...NIGHT, ...G0, path: ['#a89878', '#887858'], trees: [['round', 10], ['sakura', 10]], village: 8, landmark: 'square', particles: 'fireflies', lanterns: 14, wall: 'wood', doors: RDOOR },
  { ...DAY, grass: ['#8ab850', '#6a9a3e', '#a8cc66'], path: ['#d8c08a', '#b89a62'], trees: [['pine', 18], ['round', 6]], village: 4, town: 'farm', landmark: 'mountain', particles: 'petals', fuji: true, wall: 'rock', doors: DOOR },
  { ...DAY, grass: ['#9ab848', '#7a9a3a', '#b8cc5a'], path: ['#c8a878', '#a88858'], trees: [['round', 14], ['gold', 6]], village: 5, town: 'farm', landmark: 'terraces', particles: null, wall: 'hedge', doors: DOOR },
  { ...DAY, grass: ['#7aa04a', '#5a8a3a', '#9ab85a'], path: ['#e8e0cc', '#c8c0aa'], trees: [['pine', 12], ['maple', 8]], village: 4, landmark: 'garden', particles: 'leaves', wall: 'white', doors: DOOR },
  { ...DAY, grass: ['#6aa04a', '#4e8a3a', '#8ab85a'], path: ['#b8b0a0', '#98907e'], trees: [['pine', 18], ['round', 10]], village: 4, landmark: 'falls', particles: 'mist', river: true, wall: 'rock', doors: DOOR },
  { ...NIGHT, grass: ['#5a6a4a', '#3e4e34', '#6a7a54'], path: ['#8a7a62', '#6a5a46'], trees: [['pine', 12]], village: 7, landmark: 'harbor', particles: null, lanterns: 8, sea: true, wall: 'wood', doors: DOOR },
  { ...FIRE, grass: ['#3a2c26', '#2a201c', '#4a3a30'], path: ['#5a4a3e', '#3e3228'], stone: ['#6a5e54', '#3e3630'], trees: [['dead', 12]], village: 3, town: 'camp', tentCol: '#a8987a', landmark: 'crater', particles: 'embers', fire: true, wall: 'rock', doors: RDOOR, flowers: false },
  { ...NIGHT, grass: ['#4a5a4a', '#3a4a3c', '#5a6a58'], path: ['#7a7468', '#5a564c'], roofs: ['#2a2a34', '#3a3440'], trees: [['dead', 16], ['pine', 8]], village: 3, landmark: 'graves', particles: 'fireflies', mist: true, wall: 'stone', doors: DOOR, flowers: false },
  { ...DUSK, grass: ['#7a7a4a', '#5a5a36', '#9a9a5a'], path: ['#8a7a68', '#6a5a4a'], trees: [['pine', 16]], village: 6, landmark: 'forge', particles: 'embers', wall: 'stone', doors: DOOR },
  { ...RED, grass: ['#5a4a3a', '#4a3a2e', '#6a5a46'], path: ['#7a5a4a', '#5a4236'], trees: [['dead', 14]], village: 4, town: 'camp', tentCol: '#c8b898', landmark: 'battlefield', particles: 'embers', wall: 'wood', doors: RDOOR, flowers: false },
  { ...SKY, grass: ['#f4f6fb', '#dfe6f2', '#ffffff'], path: ['#e8d8a8', '#c8b888'], stone: ['#f4ead0', '#c8b888'], roofs: ['#c8a03a', '#d8b04a'], wallHouse: '#fbf6ea', trees: [['sakura', 10], ['gold', 4]], village: 4, landmark: 'skytemple', particles: 'petals', clouds: true, wall: 'white', doors: { col: '#c8a03a', post: '#8a6a2a', roof: '#c8a03a' }, flowers: false },
  { ...NIGHT, grass: ['#5a5a50', '#44443c', '#6a6a5e'], path: ['#8a8478', '#6a665e'], roofs: ['#1a1418', '#2a2430'], trees: [['pine', 14]], village: 6, landmark: 'keep', particles: 'embers', lanterns: 10, wall: 'stone', doors: RDOOR },
];

const at = (m, x, y, z, ry = 0, s = 1) => { m.position.set(x, y, z); m.rotation.y = ry; if (Array.isArray(s)) m.scale.set(...s); else m.scale.setScalar(s); return m; };
const boxC = (x, z, hw, hd, ry = 0, o = {}) => ({ box: true, x, z, hw, hd, ry, c: Math.cos(ry), s: Math.sin(ry), ...o });

/** Build area `i` into group G. `needs` says how many quest things each place must hold. */
export function buildArea(G, i, needs = {}, pois = {}) {
  const A = { ...AREAS[i], pois };
  const P = plan(i, A, needs);
  const r = W.rng(300 + i * 31);
  const h = P.height;
  const out = { colliders: [], lights: [], update: [], spots: P.spots, items: P.items, plan: P, height: h, bounds: BOUNDS, bridges: [], seals: {} };
  const col = c => out.colliders.push(c);
  W.setNight(!!A.stars || !!A.fire);
  // ground, sky
  const cv = paint(P, A);
  W.terrain(G, h, cv, MAP, A.clouds ? { outer: [-62, 62, -98, 98] } : {});
  out.minimap = minimap(P, A, cv);
  W.sky(G, { top: A.sky[0], hor: A.sky[1], clouds: A.stars ? 0 : 16, cloudCol: A.stars ? '#3a4a6a' : '#ffffff' });
  if (A.stars) stars(G);
  if (A.fuji) fuji(G);
  if (A.sea) sea(G);
  if (A.clouds) cloudFloor(G);

  /* ---------- the town ---------- */
  const wallC = A.wallHouse || (A.stars ? '#e8dcc4' : '#f2ead8');
  for (const l of P.lots) {
    if (l.tent) W.tent(G, l.x, l.z, l.ry, h, { w: l.w, d: l.d, col: l.role ? '#e8dcc0' : A.tentCol || '#d8ccb0', trim: l.role === 'shop' ? '#2a4a8a' : '#8a2a2a' });
    else W.house(G, l.x, l.z, l.ry, h, { w: l.w, d: l.d, h: 2.3 + (l.floors === 2 ? 0 : r() * 0.4), roof: l.roof, wall: wallC, floors: l.floors, thatch: l.thatch && !l.role, kura: l.kura && !l.role, shop: l.role === 'shop' ? '#2a4a8a' : l.inn ? '#a8242e' : null, lanterns: l.lanterns || l.inn });
    col(boxC(l.x, l.z, l.w / 2 + 0.3, l.d / 2 + 0.3, l.ry, { tall: true }));
    // something by the door or in the yard
    const side = [l.street[0], l.street[1]], k = r();
    const px = l.x + l.face[0] * (l.d / 2 + 0.7) + side[0] * (l.w / 2 - 0.4), pz = l.z + l.face[1] * (l.d / 2 + 0.7) + side[1] * (l.w / 2 - 0.4);
    if (P.get(px, pz) !== 1) {
      if (l.role === 'shop') { W.props.barrels(G, px, pz, l.ry, h, 2); col({ x: px, z: pz, r: 0.8 }); }
      else if (k < 0.25) { W.props.pots(G, px, pz, h); }
      else if (k < 0.45) { W.props.crates(G, px, pz, l.ry, h); col({ x: px, z: pz, r: 0.7 }); }
      else if (k < 0.6) { W.props.barrels(G, px, pz, l.ry, h, 1); col({ x: px, z: pz, r: 0.45 }); }
    }
    const bx = l.x - l.face[0] * (l.d / 2 + 2.0), bz = l.z - l.face[1] * (l.d / 2 + 2.0);
    if (P.get(bx, bz) === FREE && r() < 0.35) {
      const q = r();
      if (q < 0.4) { W.props.laundry(G, bx, bz, l.ry, h); }
      else if (q < 0.7) { W.props.woodpile(G, bx, bz, l.ry, h); col(boxC(bx, bz, 1.2, 0.5, l.ry)); }
      else { W.props.cart(G, bx, bz, l.ry + 1.2, h); col({ x: bx, z: bz, r: 1.1 }); }
    }
  }
  // the square: a well, a notice board, a tea bench, a market stall, a big old tree and lamps at the corners
  const pl = P.plaza;
  W.props.well(G, pl.x, pl.z, h); col({ x: pl.x, z: pl.z, r: 1.15 });
  W.props.board(G, pl.x - pl.w / 2 + 1.2, pl.z - 2.5, Math.PI / 2, h); col(boxC(pl.x - pl.w / 2 + 1.2, pl.z - 2.5, 0.3, 1.2, Math.PI / 2));
  W.props.teahouse(G, pl.x + pl.w / 2 - 1.8, pl.z + pl.d / 2 - 1.4, Math.PI, h); col(boxC(pl.x + pl.w / 2 - 1.8, pl.z + pl.d / 2 - 1.4, 1.2, 0.5));
  W.props.stall(G, pl.x + pl.w / 2 - 1.6, pl.z - pl.d / 2 + 1.6, Math.PI, h, A.fire ? '#8a2a1e' : '#c8322a'); col(boxC(pl.x + pl.w / 2 - 1.6, pl.z - pl.d / 2 + 1.6, 1.4, 0.8));
  const tk = A.trees.find(t => t[0] !== 'dead' && t[0] !== 'bamboo');
  W.tree(G, pl.x - pl.w / 2 + 1.6, pl.z + pl.d / 2 - 1.6, h, tk ? tk[0] : 'round', 1.5, 3); col({ x: pl.x - pl.w / 2 + 1.6, z: pl.z + pl.d / 2 - 1.6, r: 0.6 });
  for (const [sx, sz] of [[-1, -1], [1, 1]]) { const x = pl.x + sx * (pl.w / 2 - 0.6), z = pl.z + sz * (pl.d / 2 - 0.6); W.lantern(G, x, z, h, out.lights, { light: !!A.stars }); col({ x, z, r: 0.35 }); }
  for (let k = 0; k < 2; k++) W.props.bench(G, pl.x - 3 + k * 6, pl.z + pl.d / 2 - 0.8, 0, h);
  // lamps at street corners, signposts at big crossings
  const seen = new Set();
  for (const rd of P.roads.filter(x => x.kind === 'street')) for (const [x, z] of rd.raw) {
    const key = Math.round(x) + ',' + Math.round(z); if (seen.has(key) || z > 82 || z < 31) continue; seen.add(key);
    if (Math.hypot(x - pl.x, z - pl.z) < 10) continue;
    for (const [ox, oz] of [[3.3, 3.3], [-3.3, -3.3], [3.3, -3.3], [-3.3, 3.3]]) {
      const lx = x + ox, lz = z + oz;
      if (P.get(lx, lz) === FREE) { W.lantern(G, lx, lz, h, out.lights, { light: !!A.stars && out.lights.length < 4 }); col({ x: lx, z: lz, r: 0.35 }); break; }
    }
    if (r() < 0.4) { const sx = x - 3.2, sz = z + 3.2; if (P.get(sx, sz) === FREE) { W.props.signpost(G, sx, sz, r() * 3, h); col({ x: sx, z: sz, r: 0.3 }); } }
  }
  W.townGate(G, P.townGate[0], P.townGate[1], 0, h, { roof: A.roofs ? A.roofs[0] : '#3a3a48' });
  col(boxC(P.townGate[0], P.townGate[1], 4.2, 0.9, 0, { camOnly: true, cam: true }));
  for (const s of [-1, 1]) col({ x: P.townGate[0] + s * 3, z: P.townGate[1], r: 0.4 });
  if (A.fire) for (const l of P.lots.filter(l => !l.role).slice(0, 3)) flame(G, out, l.x, h(l.x, l.z) + 3.2, l.z, 1.3);

  /* ---------- the wild stretch ---------- */
  for (const k in P.pois) POI[P.pois[k].kind]?.(G, P.pois[k], h, out, r, A);
  if (P.river) river(G, P, h, out, A);
  // lanterns along the road at night
  const nl = A.lanterns || (A.stars ? 5 : 3);
  for (let k = 0; k < nl; k++) {
    const t = 0.08 + 0.84 * k / Math.max(1, nl - 1), idx = Math.floor(t * (P.road.length - 3)), p = P.road[idx], q = P.road[idx + 2];
    const tx = q[0] - p[0], tz = q[1] - p[1], tl = Math.hypot(tx, tz) || 1, s = k % 2 ? 1 : -1;
    const x = p[0] - tz / tl * 2.9 * s, z = p[1] + tx / tl * 2.9 * s;
    if (P.get(x, z) === FREE || P.get(x, z) === 1) { W.lantern(G, x, z, h, out.lights, { light: !!A.stars || A.fire }); col({ x, z, r: 0.35 }); }
  }

  /* ---------- trees, rocks, grass ---------- */
  for (const [x, z, kind, s] of P.trees) {
    if (kind === 'dead') W.deadTree(G, x, z, h, r); else W.tree(G, x, z, h, kind, s, Math.round(x * 3 + z));
    col({ x, z, r: kind === 'bamboo' ? 0.75 : 0.5 * s });
  }
  if (!A.fire) W.bushes(G, P.bushes, h, A.clouds ? '#e8eef8' : shade(A.grass[1], 0.85), A.clouds ? '#f4c8d8' : A.stars ? '#c8d8ff' : ['#ffd0e0', '#fff0a0', '#ffffff'][i % 3]);
  else W.bushes(G, P.bushes.slice(0, 120), h, '#3a3028', null);
  W.rocks(G, 40, [-46, -82, 46, 82], h, 9 + i, A.fire ? '#4a3a34' : A.clouds ? '#d8d4cc' : '#9a968e', (x, z) => P.get(x, z) !== FREE);
  if (!A.clouds) W.grass(G, A.fire ? 120 : 900, [-48, -84, 48, 84], h, 5 + i, shade(A.grass[1], 0.9), (x, z) => P.get(x, z) !== FREE);

  /* ---------- the wall, its gate, the landmark ---------- */
  const g0 = P.wall.gap[0] - 0.3, g1 = P.wall.gap[1] + 0.3;
  W.wallLine(G, [[-49.4, WALL_Z], [g0 - 0.2, WALL_Z]], h, A.wall);
  W.wallLine(G, [[g1 + 0.2, WALL_Z], [49.4, WALL_Z]], h, A.wall);
  col(boxC((-49.4 + g0) / 2, WALL_Z, (g0 + 49.4) / 2, A.wall === 'rock' ? 1.4 : 0.9, 0, { tall: true }));
  col(boxC((g1 + 49.4) / 2, WALL_Z, (49.4 - g1) / 2, A.wall === 'rock' ? 1.4 : 0.9, 0, { tall: true }));
  out.barrier = W.gateDoors(G, P.lx, WALL_Z, 0, h, { width: 5.2, ...A.doors });
  out.barrierCol = boxC(P.lx, WALL_Z, 2.7, 0.6, 0, { id: 'barrier', tall: true });
  col(out.barrierCol);
  col(boxC(P.lx, WALL_Z, 4.0, 1.0, 0, { camOnly: true, cam: true }));   // the gate's roof: the camera stays out of it
  const LG = new THREE.Group(); const o = { x: P.lx, z: P.landmark.kind === 'bridge' ? P.river.z : -50 };
  LG.position.set(o.x, 0, o.z); G.add(LG);
  const lc = [];
  const hl = (x, z) => h(o.x + x, o.z + z);
  (LANDMARKS[A.landmark] || LANDMARKS.shrine)(LG, hl, { colliders: lc, lights: out.lights, update: out.update }, r, A, P.gs, P);
  for (const c of lc) { c.x += o.x; c.z += o.z; col(c); }
  if (P.court) {
    // banners down the sides of the courtyard
    for (const s of [-1, 1]) for (const dz of [-4, 4]) { const x = P.court.x + s * (P.court.w / 2 + 0.6), z = P.court.z + dz; if (s === P.gs && Math.abs(dz) < 6 && P.get(x, z) === 1) continue; W.props.banner(G, x, z, h, A.doors.col === '#a8282a' ? '#a8242e' : '#2a2a3a', s > 0 ? Math.PI : 0); }
  }

  /* ---------- the gates south and north, and the fence around everything ---------- */
  out.gateS = W.torii(G, P.gates.S[0], P.gates.S[1], 0, h, 0.95, '#d8322a');
  out.gateN = W.torii(G, P.gates.N[0], P.gates.N[1], 0, h, 0.95, '#d8322a');
  for (const k of ['S', 'N']) {
    const [gx, gz] = P.gates[k];
    for (const s of [-1, 1]) col({ x: gx + s * 1.72, z: gz, r: 0.3 });
    col(boxC(gx, gz, 2.6, 0.6, 0, { camOnly: true, cam: true }));
    out.seals[k] = seal(G, gx, gz, h);
    out.seals[k].col = boxC(gx, gz, 1.6, 0.4, 0, { id: 'seal' + k });
    // the road keeps going beyond the gate
  }
  const fc = A.clouds ? '#e8d8a8' : A.fire ? '#4a3a30' : '#8a6a48';
  W.fenceLoop(G, [[-3.2, 85.2], [-49.2, 85.2], [-49.2, -85.2], [P.xg - 3.2, -85.2]], h, fc, 1.6, false);
  W.fenceLoop(G, [[P.xg + 3.2, -85.2], [49.2, -85.2], [49.2, 85.2], [3.2, 85.2]], h, fc, 1.6, false);
  if (A.particles) out.update.push(particles(G, A.particles, A));
  out.drawBatches = W.batchStatic(G);
  return out;
}

function shade(hex, k) { return '#' + new THREE.Color(hex).multiplyScalar(k).getHexString(); }

/** a sacred rope with paper streamers across a gate: the gate is sealed */
function seal(G, x, z, h) {
  const K = W.kit();
  K.cyl(0.11, 0.11, 3.6, 0, 3.0, 0, '#d8c070', 8, 0, 0, Math.PI / 2);
  for (let k = 0; k < 5; k++) K.box(0.16, 0.5, 0.02, -1.4 + k * 0.7, 2.6, 0.02, '#ffffff', 0, 0, (k % 2 ? 0.15 : -0.15));
  for (let k = 0; k < 3; k++) K.box(0.24, 0.62, 0.03, -0.9 + k * 0.9, 1.2 + (k % 2) * 0.3, 0.02, '#efe2c0');
  const m = K.mesh(0.015); m.position.set(x, h(x, z), z); m.userData.keep = true; G.add(m);
  return m;
}

function stars(G) {
  const n = 600, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, e = Math.random() * 1.3 + 0.1, d = 300; p[i * 3] = Math.cos(a) * Math.cos(e) * d; p[i * 3 + 1] = Math.sin(e) * d; p[i * 3 + 2] = Math.sin(a) * Math.cos(e) * d; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 1.4, sizeAttenuation: false, fog: false })); pts.userData.keep = true; G.add(pts);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(10, 24, 16), new THREE.MeshBasicMaterial({ color: '#fff6d8', fog: false }));
  moon.position.set(-120, 140, -220); moon.userData.keep = true; G.add(moon);
}
function fuji(G) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(110, 85, 40, 1, true), toon('#5a6ab0', { fog: false })); m.position.set(30, 30, -260); m.userData.keep = true; G.add(m);
  const c = new THREE.Mesh(new THREE.ConeGeometry(38, 29, 40, 1, true), toon('#f4f8ff', { fog: false })); c.position.set(30, 58.5, -260); c.userData.keep = true; G.add(c);
}
function sea(G) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(500, 200), toon('#1a3a6a', { transparent: true, opacity: 0.95 }));
  m.rotation.x = -Math.PI / 2; m.position.set(0, -0.4, -200); G.add(m);
}
function cloudFloor(G) {
  for (let k = 0; k < 70; k++) {
    const a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 90;
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(8 + Math.random() * 8, 1), toon('#ffffff', { emissive: '#ffffff', emissiveIntensity: 0.25 }));
    c.position.set(Math.cos(a) * d * 0.8, -10 - Math.random() * 8, Math.sin(a) * d * 1.2); c.scale.set(1.4, 0.5, 1.4); c.userData.keep = true; G.add(c);
  }
}

/** the river: a wavy band of water across the map, with a bridge wherever a road crosses */
function river(G, P, h, out, A) {
  const R = P.river, pts = [], wv = x => R.z + Math.sin(x * 0.12) * 1.2;
  for (let x = -64; x <= 64; x += 1) pts.push(x);
  const pos = [], idx = [];
  pts.forEach((x, k) => { pos.push(x, 0.12, wv(x) - R.w / 2 + 0.2, x, 0.12, wv(x) + R.w / 2 - 0.2); if (k) { const a = (k - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, toon('#4aa8d8', { transparent: true, opacity: 0.82, side: THREE.DoubleSide }));
  m.receiveShadow = true; G.add(m);
  out.update.push(() => { m.material.opacity = 0.78 + Math.sin(performance.now() / 600) * 0.05; });
  for (let x = -60; x <= 60; x += 3) {
    if (R.bridges.some(b => Math.abs(x - b.x) < 3.4)) continue;
    out.colliders.push(boxC(x, wv(x), 1.6, R.w / 2 - 0.4));
  }
  for (const b of R.bridges) bridge(G, b, h, out, A);
  out.river = R;
}
function bridge(G, b, h, out, A) {
  const K = W.kit(), n = Math.round(b.len), y0 = 0.05;
  const red = b.big || A.doors.col === '#a8282a' ? '#c8322a' : '#8a5a3a';
  for (let k = -n / 2; k <= n / 2; k++) { const y = y0 + b.h * Math.cos((k / (n / 2)) * Math.PI / 2); K.box(3.8, 0.22, 1.08, 0, y, k, '#8a5a3a'); }
  for (const s of [-1, 1]) {
    for (let k = -n / 2; k <= n / 2; k += 2) { const y = y0 + b.h * Math.cos((k / (n / 2)) * Math.PI / 2); K.cyl(0.08, 0.08, 1.0, s * 1.85, y + 0.55, k, red, 8); }
    for (let k = -n / 2; k < n / 2; k += 2) { const y1 = y0 + b.h * Math.cos((k / (n / 2)) * Math.PI / 2), y2 = y0 + b.h * Math.cos(((k + 2) / (n / 2)) * Math.PI / 2); K.box(0.1, 0.1, Math.hypot(2, y2 - y1), s * 1.85, (y1 + y2) / 2 + 1.0, k + 1, red, -Math.atan2(y2 - y1, 2)); }
  }
  const m = K.mesh(); m.position.set(b.x, 0, b.z); m.rotation.y = b.ang; G.add(m);
  out.bridges.push({ x: b.x, z: b.z, len: b.len, h: b.h, hw: 1.9 });
  for (const s of [-1, 1]) out.colliders.push(boxC(b.x + s * 2.05, b.z, 0.15, b.len / 2));
}

/* ---------- the side places, built around their clearing ---------- */
const ring = (p, a, d) => [p.x + Math.cos(a) * d, p.z + Math.sin(a) * d];
const back = p => (p.face > 0 ? Math.PI : 0);
const POI = {
  grove(G, p, h, out, r) {
    for (let k = 0; k < 3; k++) { const [x, z] = ring(p, back(p) + (k - 1) * 1.1, 7.6); W.props.stump(G, x, z, h); out.colliders.push({ x, z, r: 0.5 }); }
    const [x, z] = ring(p, back(p) + 2.2, 7.2); W.rocks(G, 4, [x - 1.5, z - 1.5, x + 1.5, z + 1.5], h, 3);
  },
  camp(G, p, h, out, r, A) {
    W.props.campfire(G, p.x, p.z, h); flame(G, out, p.x, h(p.x, p.z) + 0.1, p.z, 0.6); out.colliders.push({ x: p.x, z: p.z, r: 0.9 });
    for (let k = 0; k < 3; k++) { const a = back(p) + (k - 1) * 1.15, [x, z] = ring(p, a, 7.6); W.tent(G, x, z, Math.atan2(p.x - x, p.z - z), h, { col: '#8a7a5a', trim: '#3a2a2a' }); out.colliders.push({ x, z, r: 2.1 }); }
    for (const a of [back(p) + 1.9, back(p) - 1.9]) { const [x, z] = ring(p, a, 7.2); W.props.crates(G, x, z, a, h); out.colliders.push({ x, z, r: 0.8 }); }
    const [bx, bz] = ring(p, back(p) + 2.6, 6.8); W.props.banner(G, bx, bz, h, '#2a2a30');
  },
  shrine(G, p, h, out, r) {
    const [x, z] = ring(p, back(p), 7.4), ry = Math.atan2(p.x - x, p.z - z);
    W.props.hokora(G, x, z, ry, h); out.colliders.push({ x, z, r: 0.9 });
    for (const s of [-1, 1]) { const [lx, lz] = ring(p, back(p) + s * 0.45, 6.4); W.lantern(G, lx, lz, h, out.lights, { light: false }); out.colliders.push({ x: lx, z: lz, r: 0.35 }); }
    const [tx, tz] = ring(p, back(p) + Math.PI, 7.0); W.torii(G, tx, tz, ry + Math.PI / 2, h, 0.62, '#d8322a');
  },
  pond(G, p, h, out, r) {
    const wm = new THREE.Mesh(new THREE.CircleGeometry(1, 40), toon('#4aa8d8', { transparent: true, opacity: 0.88 }));
    wm.rotation.x = -Math.PI / 2; wm.scale.set(3.6, 3.0, 1); wm.position.set(p.x, h(p.x, p.z) + 0.08, p.z); G.add(wm);
    out.colliders.push({ x: p.x, z: p.z, r: 3.0 });
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, x = p.x + Math.cos(a) * 3.9, z = p.z + Math.sin(a) * 3.3; if (k % 3) W.rocks(G, 1, [x - 0.2, z - 0.2, x + 0.2, z + 0.2], h, k + 3); else W.props.reeds(G, x, z, h, r); }
    for (let k = 0; k < 5; k++) { const lp = new THREE.Mesh(new THREE.CircleGeometry(0.35, 10), toon('#5a9a3e')); lp.rotation.x = -Math.PI / 2; lp.position.set(p.x + (r() - 0.5) * 4, h(p.x, p.z) + 0.1, p.z + (r() - 0.5) * 3); G.add(lp); }
  },
  hotspring(G, p, h, out, r) {
    const wm = new THREE.Mesh(new THREE.CircleGeometry(1, 40), toon('#8ad0d8', { transparent: true, opacity: 0.85, emissive: '#4a8a90', emissiveIntensity: 0.2 }));
    wm.rotation.x = -Math.PI / 2; wm.scale.set(3.6, 3.0, 1); wm.position.set(p.x, h(p.x, p.z) + 0.08, p.z); G.add(wm);
    out.colliders.push({ x: p.x, z: p.z, r: 3.0 });
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; W.rocks(G, 1, [p.x + Math.cos(a) * 3.9 - 0.2, p.z + Math.sin(a) * 3.3 - 0.2, p.x + Math.cos(a) * 3.9 + 0.2, p.z + Math.sin(a) * 3.3 + 0.2], h, k + 11, '#8a867c'); }
    out.update.push(steam(G, p.x, h(p.x, p.z), p.z));
    const [bx, bz] = ring(p, back(p) + 1.6, 7.4); W.props.bench(G, bx, bz, Math.atan2(p.x - bx, p.z - bz), h);
  },
  ruins(G, p, h, out, r) {
    for (let k = 0; k < 3; k++) { const a = back(p) + (k - 1) * 1.2, [x, z] = ring(p, a, 7.8); W.props.ruinWall(G, x, z, a + Math.PI / 2, h, r); out.colliders.push(boxC(x, z, 2.6, 0.6, a + Math.PI / 2)); }
    for (const a of [back(p) + 2.2, back(p) - 2.2, back(p) + 0.6, back(p) - 0.6]) { const [x, z] = ring(p, a, 6.4); W.props.pillar(G, x, z, h, r); out.colliders.push({ x, z, r: 0.5 }); }
  },
  lumber(G, p, h, out, r) {
    for (let k = 0; k < 2; k++) { const a = back(p) + (k ? 0.8 : -0.8), [x, z] = ring(p, a, 7.6); W.props.woodpile(G, x, z, a + Math.PI / 2, h); out.colliders.push(boxC(x, z, 1.2, 0.6, a + Math.PI / 2)); }
    for (const a of [back(p) + 2.1, back(p) - 2.1, back(p)]) { const [x, z] = ring(p, a, 6.6); W.props.stump(G, x, z, h); out.colliders.push({ x, z, r: 0.5 }); }
    const [sx, sz] = ring(p, back(p) + 1.5, 8.6); W.house(G, sx, sz, Math.atan2(p.x - sx, p.z - sz), h, { w: 4, d: 3.4, h: 2.0, thatch: true, roof: '#5a4a3a' }); out.colliders.push({ x: sx, z: sz, r: 2.6 });
  },
  tower(G, p, h, out, r) {
    const [x, z] = ring(p, back(p), 7.0); W.props.tower(G, x, z, h); out.colliders.push(boxC(x, z, 1.5, 1.5));
    for (const a of [back(p) + 1.4, back(p) - 1.4]) { const [bx, bz] = ring(p, a, 7.0); W.props.barrels(G, bx, bz, a, h, 2); out.colliders.push({ x: bx, z: bz, r: 0.8 }); }
  },
  field(G, p, h, out, r) {
    for (let k = 0; k < 3; k++) { const [x, z] = ring(p, back(p) + (k - 1) * 1.6, 8.4); W.props.haystack(G, x, z, h, 0.9); out.colliders.push({ x, z, r: 1.0 }); }
    const [hx, hz] = ring(p, back(p) + 2.4, 9.0); W.house(G, hx, hz, Math.atan2(p.x - hx, p.z - hz), h, { w: 4.2, d: 3.6, h: 2.0, thatch: true }); out.colliders.push({ x: hx, z: hz, r: 2.6 });
  },
  cave(G, p, h, out, r) {
    const [x, z] = ring(p, back(p), 8.0), ry = Math.atan2(p.x - x, p.z - z);
    const K = W.kit();
    for (let k = 0; k < 9; k++) { const a = (k / 8 - 0.5) * 3.0; K.rock(1.6 + r() * 1.0, Math.sin(a) * 3.2, 0.6 + Math.cos(a) * 1.8, -0.4 - r() * 0.8, '#6a645c', 1, 0.9 + r() * 0.4, 1, r() * 3); }
    K.rock(2.6, 0, 3.6, -1.2, '#5e5850', 1.6, 0.8, 1.2);
    const cm = K.mesh(); W.place(G, cm, x, z, ry, h);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(1.6, 20), new THREE.MeshBasicMaterial({ color: '#0a0806' })); hole.position.set(0, 1.3, 0.35); hole.scale.y = 1.2; cm.add(hole);
    out.colliders.push({ x, z, r: 3.2 });
    for (let k = 0; k < 4; k++) { const [cx, cz] = ring(p, back(p) + (k - 1.5) * 0.9, 6.6); const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), toon('#ff6a4a', { emissive: '#ff4a2a', emissiveIntensity: 0.8 })); c.position.set(cx, h(cx, cz) + 0.3, cz); c.scale.y = 1.8; G.add(c); }
  },
  graves(G, p, h, out, r) {
    for (let k = 0; k < 14; k++) { const a = back(p) + (k / 13 - 0.5) * 4.2, d = 6.8 + (k % 3) * 0.8, [x, z] = ring(p, a, d); W.props.tomb(G, x, z, Math.atan2(p.x - x, p.z - z), h, r); out.colliders.push({ x, z, r: 0.45 }); }
    const [x, z] = ring(p, back(p), 9.6); W.deadTree(G, x, z, h, r);
  },
};

/* ---------- landmarks: built in a local frame, with the boss at (0, 0) and the building behind (-z) ---------- */
const LANDMARKS = {
  shrine(G, h, out, r, A, side) {
    W.house(G, 0, -15, 0, h, { w: 9, d: 6, h: 2.8, roof: '#3a3a4a', wall: '#f2e2c8', lanterns: true });
    out.colliders.push(boxC(0, -15, 5.0, 3.4, 0, { tall: true }));
    for (let k = 0; k < 3; k++) G.add(at(part(new THREE.BoxGeometry(4 - k * 0.6, 0.22, 0.9), '#a8a49c', { outline: 0.02 }), 0, 0.11 + k * 0.22, -10.6 - k * 0.6));
    W.torii(G, 0, -6.5, 0, h, 1.0);
    for (const s of [-1, 1]) { out.colliders.push({ x: s * 1.8, z: -6.5, r: 0.3 }); W.lantern(G, s * 3.6, -8.6, h, out.lights); out.colliders.push({ x: s * 3.6, z: -8.6, r: 0.35 }); komainu(G, s * 2.5, -10.2, h); out.colliders.push({ x: s * 2.5, z: -10.2, r: 0.5 }); }
    for (const s of [-1, 1]) { W.tree(G, s * 9, -17, h, A.trees[0][0] === 'bamboo' ? 'bamboo' : 'sakura', 1.4, 7); out.colliders.push({ x: s * 9, z: -17, r: 0.7 }); }
  },
  temple(G, h, out, r, A, side) {
    W.house(G, 0, -17, 0, h, { w: 13, d: 8, h: 3.2, roof: '#3a3a44', wall: '#e8e0d0', lanterns: true });
    out.colliders.push(boxC(0, -17, 6.8, 4.3, 0, { tall: true }));
    for (let k = 0; k < 3; k++) G.add(at(part(new THREE.BoxGeometry(6 - k, 0.3, 1.2), '#a8a49c', { outline: 0.02 }), 0, 0.15 + k * 0.3, -11.6 - k * 0.9));
    pagoda(G, -side * 9.5, -8, h, '#e8e0d0', '#3a3a44'); out.colliders.push(boxC(-side * 9.5, -8, 2.2, 2.2, 0, { tall: true }));
    for (const s of [-1, 1]) { W.lantern(G, s * 4.5, -9, h, out.lights); out.colliders.push({ x: s * 4.5, z: -9, r: 0.35 }); }
  },
  bridge(G, h, out, r, A, side) {
    // the river and the great bridge are built by river(); here, the warden's guard house and his pile of swords
    W.house(G, 0, -21, 0, h, { w: 7, d: 5, roof: '#4a3a3a', lanterns: true }); out.colliders.push(boxC(0, -21, 3.9, 2.9, 0, { tall: true }));
    const K = W.kit();
    for (let k = 0; k < 40; k++) { const a = r() * Math.PI * 2, d = r() * 1.6; K.box(0.06, 1.1, 0.02, Math.cos(a) * d, 0.4, Math.sin(a) * d, '#d8dee4', (r() - 0.5) * 0.6, r() * 3, (r() - 0.5) * 0.6); K.box(0.08, 0.3, 0.05, Math.cos(a) * d, 0.95, Math.sin(a) * d, '#2a1a14', 0, 0, 0); }
    W.place(G, K.mesh(0.012), -side * 6, -10, 0, h); out.colliders.push({ x: -side * 6, z: -10, r: 1.8 });
    for (const s of [-1, 1]) W.props.banner(G, s * 3.2, -9.5, h, '#1a1a22');
  },
  castle(G, h, out, r, A, side) { keep(G, 0, -17, h, out, r, A, 3, '#7a7268', '#2a2026', '#d8d0c0'); },
  keep(G, h, out, r, A, side) {
    keep(G, 0, -17, h, out, r, A, 3, '#5a564e', '#1a1418', '#c8c0b0');
    for (const s of [-1, 1]) { W.props.banner(G, s * 4, -7.5, h, '#1a1a22'); W.props.banner(G, s * 7, -7.5, h, '#8a1a1e'); }
  },
  cliff(G, h, out, r, A, side) {
    const K = W.kit();
    for (let k = 0; k < 16; k++) { const x = (k - 7.5) * 2.0 + (r() - 0.5), z = -14 - r() * 6; K.rock(1.6 + r() * 1.6, x, 0.8, z, '#6a665e', 1, 0.8 + r(), 1, r() * 3); }
    W.place(G, K.mesh(0.04), 0, 0, 0, h); out.colliders.push(boxC(0, -17, 16, 4.5));
    W.tree(G, -side * 5, -8, h, 'pine', 1.5, 3); out.colliders.push({ x: -side * 5, z: -8, r: 0.6 });
    W.props.hokora(G, side * -1.5, -9.5, 0, h); out.colliders.push({ x: side * -1.5, z: -9.5, r: 0.9 });
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(500, 220), toon('#2a3a52')); sea.rotation.x = -Math.PI / 2; sea.position.set(0, -16, -160); sea.userData.keep = true; G.add(sea);
    out.update.push(lightning());
  },
  dojo(G, h, out, r, A, side) {
    W.house(G, 0, -16, 0, h, { w: 14, d: 8, h: 3.0, roof: '#2a2a34', wall: '#e8dcc0', shop: '#1a1a1a', floors: 1 });
    out.colliders.push(boxC(0, -16, 7.4, 4.4, 0, { tall: true }));
    for (let k = 0; k < 4; k++) { const x = -side * (6 + (k % 2) * 2), z = -3 + Math.floor(k / 2) * 4; makiwara(G, x, z, h); out.colliders.push({ x, z, r: 0.3 }); }
    rack(G, -side * 8.5, -8.5, h); out.colliders.push(boxC(-side * 8.5, -8.5, 1.3, 0.4));
  },
  gates(G, h, out, r, A, side, P) {
    // a tunnel of red gates from the wall to the courtyard, and on along the road to the north gate
    for (let k = 0; k < 4; k++) { const z = 12.8 - k * 2.2; W.torii(G, 0, z, 0, h, 0.78, k % 2 ? '#e0382c' : '#c8281e'); for (const s of [-1, 1]) out.colliders.push({ x: s * 1.4, z, r: 0.22 }); }
    const gate = P.roads[P.roads.length - 1].pts;
    let acc = 0;
    for (let k = 4; k < gate.length - 30; k++) {
      acc += Math.hypot(gate[k][0] - gate[k - 1][0], gate[k][1] - gate[k - 1][1]); if (acc < 2.6) continue; acc = 0;
      const [x, z] = gate[k], [nx, nz] = gate[Math.min(gate.length - 1, k + 1)], ang = Math.atan2(nx - x, nz - z);
      const lx = x - P.lx, lz = z + 50;
      W.torii(G, lx, lz, ang, h, 0.75, k % 2 ? '#e0382c' : '#c8281e');
      for (const s of [-1, 1]) out.colliders.push({ x: lx + Math.cos(ang) * s * 1.35, z: lz - Math.sin(ang) * s * 1.35, r: 0.22 });
    }
    W.house(G, 0, -15, 0, h, { w: 7, d: 5, roof: '#3a3a4a', wall: '#f2e2c8', lanterns: true }); out.colliders.push(boxC(0, -15, 3.9, 2.9, 0, { tall: true }));
    for (const s of [-1, 1]) { foxStatue(G, s * 2.4, -9.5, h); out.colliders.push({ x: s * 2.4, z: -9.5, r: 0.5 }); }
  },
  square(G, h, out, r, A, side) {
    // the festival stage, stalls and strings of lanterns
    const K = W.kit();
    K.box(10, 1.0, 6, 0, 0.5, 0, '#7a5a3a'); for (const sx of [-1, 1]) for (const sz of [-1, 1]) K.box(0.3, 4, 0.3, sx * 4.7, 2.5, sz * 2.7, '#5a2a1e');
    for (const s of [-1, 1]) K.box(11.4, 0.16, 3.8, 0, 4.7, s * 1.5, '#2a2a34', s * -0.4);
    K.box(10, 0.6, 0.1, 0, 3.9, 3.0, '#c8322a');
    K.cyl(0.8, 0.8, 1.0, 2.6, 1.6, -1.2, '#8a3a2a', 16, Math.PI / 2, 0, 0);
    W.place(G, K.mesh(), 0, -15, 0, h); out.colliders.push(boxC(0, -15, 5.2, 3.2, 0, { tall: true }));
    for (let k = 0; k < 4; k++) { const x = -side * (6 + (k % 2) * 3.2), z = -4 + Math.floor(k / 2) * 5; W.props.stall(G, x, z, side > 0 ? Math.PI / 2 : -Math.PI / 2, h, ['#c8322a', '#2a5a9a', '#e0a020', '#6a3a9a'][k]); out.colliders.push(boxC(x, z, 0.9, 1.4)); }
    lanternStrings(G, h, [[-9, -7], [9, -7]], 3.6); lanternStrings(G, h, [[-9, 5], [9, 5]], 3.6);
  },
  mountain(G, h, out, r, A, side) {
    for (let k = 0; k < 4; k++) G.add(at(part(new THREE.BoxGeometry(5 - k * 0.5, 0.3, 1.6), '#9a968e', { outline: 0.02 }), 0, 0.15 + k * 0.3, -8 - k * 1.3));
    W.house(G, 0, -17, 0, h, { w: 6, d: 4.5, h: 2.2, thatch: true, roof: '#8a7040' }); out.colliders.push(boxC(0, -17, 3.4, 2.7, 0, { tall: true }));
    const K = W.kit(); K.rock(1.6, 0, 0.4, 0, '#8a8478', 1.6, 0.35, 1.3); W.place(G, K.mesh(), -side * 6, -6, 0, h); out.colliders.push({ x: -side * 6, z: -6, r: 2.2 });
    prayerFlags(G, h, [[-8, -10], [8, -10]]);
  },
  terraces(G, h, out, r, A, side) {
    for (let k = 0; k < 3; k++) for (const s of [-1, 1]) {
      const x = s * 6.5, z = -10 - k * 5;
      G.add(at(part(new THREE.BoxGeometry(7, 0.5 + k * 0.4, 4.4), '#7a6a4a', { outline: 0.03 }), x, (0.5 + k * 0.4) / 2, z));
      const w = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.8), toon('#7ab0c8', { transparent: true, opacity: 0.85 })); w.rotation.x = -Math.PI / 2; w.position.set(x, 0.52 + k * 0.4, z); G.add(w);
      out.colliders.push(boxC(x, z, 3.5, 2.2));
      W.props.scarecrowProp(G, x + (r() - 0.5) * 3, z, () => 0.5 + k * 0.4);
    }
    W.house(G, 0, -21, 0, h, { w: 5, d: 4, thatch: true }); out.colliders.push(boxC(0, -21, 2.9, 2.4, 0, { tall: true }));
  },
  garden(G, h, out, r, A, side) {
    const sand = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), toon('#ece6d6')); sand.rotation.x = -Math.PI / 2; sand.position.set(0, 0.05, -14); G.add(sand);
    for (let k = 0; k < 12; k++) { const line = new THREE.Mesh(new THREE.PlaneGeometry(20, 0.06), toon('#cfc8b6')); line.rotation.x = -Math.PI / 2; line.position.set(0, 0.06, -18.6 + k * 0.8); G.add(line); }
    for (const [x, z, s] of [[-5, -15, 1.6], [4, -16, 1.2], [6.5, -11.5, 0.9], [-7, -11, 0.8], [0.5, -12.5, 0.6]]) { const m = part(new THREE.DodecahedronGeometry(s, 0), '#7a766e', { outline: 0.04 }); m.position.set(x, s * 0.5, z); G.add(m); out.colliders.push({ x, z, r: s + 0.3 }); }
    W.house(G, 0, -22.5, 0, h, { w: 9, d: 4, roof: '#3a3a3a', wall: '#ece4d4' }); out.colliders.push(boxC(0, -22.5, 4.9, 2.4, 0, { tall: true }));
    for (const s of [-1, 1]) { W.tree(G, s * 9, -9, h, 'maple', 1.2, 5); out.colliders.push({ x: s * 9, z: -9, r: 0.6 }); }
  },
  falls(G, h, out, r, A, side) {
    G.add(at(part(new THREE.BoxGeometry(26, 16, 4), '#6a6a62', { outline: 0.05 }), 0, 8, -24));
    const fall = new THREE.Mesh(new THREE.PlaneGeometry(5, 16), toon('#cfeeff', { emissive: '#8ac8e8', emissiveIntensity: 0.3, transparent: true, opacity: 0.9 })); fall.position.set(0, 8, -21.9); G.add(fall);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(6.5, 32), toon('#4aa8d8', { transparent: true, opacity: 0.9 })); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.08, -15); G.add(pool);
    out.colliders.push(boxC(0, -24, 13, 2.2, 0, { tall: true })); out.colliders.push({ x: 0, z: -15, r: 5.8 });
    out.update.push(steam(G, 0, 0, -18, 6));
    for (const s of [-1, 1]) { const K = W.kit(); K.rock(1.6, 0, 0.8, 0, '#6a6a62', 1, 1.2, 1); W.place(G, K.mesh(), s * 8.5, -14, r() * 3, h); out.colliders.push({ x: s * 8.5, z: -14, r: 1.8 }); }
  },
  harbor(G, h, out, r, A, side) {
    const basin = new THREE.Mesh(new THREE.PlaneGeometry(26, 21), toon('#1a3a6a', { transparent: true, opacity: 0.95 })); basin.rotation.x = -Math.PI / 2; basin.position.set(0, 0.07, -17); G.add(basin);
    out.colliders.push(boxC(-side * 4, -17, 9, 10.5));
    const K = W.kit();
    for (let k = 0; k < 16; k++) K.box(3.6, 0.2, 1.1, side * 6, 0.3, -6.5 - k * 1.15, '#6a4a32');
    for (let k = 0; k < 8; k++) for (const s of [-1, 1]) K.cyl(0.12, 0.12, 1.4, side * 6 + s * 1.7, 0, -6.5 - k * 2.3, '#4a3424', 6);
    W.place(G, K.mesh(), 0, 0, 0, () => 0);
    W.props.boat(G, -side * 3, -14, 0.3, -0.1); W.props.boat(G, -side * 8, -20, -0.2, -0.1);
    const war = W.props.boat(G, -side * 2, -24, Math.PI / 2, -0.4); war.scale.setScalar(2.2);
    W.props.banner(G, side * 7.5, -7, h, '#1a1a1a');
  },
  crater(G, h, out, r, A, side) {
    const lava = new THREE.Mesh(new THREE.CircleGeometry(7, 32), new THREE.MeshBasicMaterial({ color: '#ff5a1a' })); lava.rotation.x = -Math.PI / 2; lava.position.set(0, 0.06, -15); G.add(lava);
    out.update.push(() => { lava.material.color.setHSL(0.04 + Math.sin(performance.now() / 400) * 0.01, 1, 0.5 + Math.sin(performance.now() / 300) * 0.05); });
    for (let k = 0; k < 5; k++) flame(G, out, (k - 2) * 2.8, 0.4, -15 + (k % 2) * 2.4, 1.4);
    out.colliders.push({ x: 0, z: -15, r: 7.5 });
    const K = W.kit(); for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; K.rock(1.0 + r(), Math.cos(a) * 8.6, 0.4, -15 + Math.sin(a) * 8.6, '#3a2e28', 1, 0.8, 1, r() * 3); }
    W.place(G, K.mesh(), 0, 0, 0, () => 0);
  },
  graves(G, h, out, r, A, side) {
    W.house(G, 0, -18, 0, h, { w: 8, d: 5, roof: '#2a2a34', wall: '#c8c0b0', lanterns: true }); out.colliders.push(boxC(0, -18, 4.4, 2.9, 0, { tall: true }));
    for (let k = 0; k < 18; k++) { const x = -side * (5 + (k % 3) * 1.6) + (r() - 0.5) * 0.4, z = -6 - Math.floor(k / 3) * 1.8; W.props.tomb(G, x, z, 0, h, r); out.colliders.push({ x, z, r: 0.4 }); }
    for (const s of [-1, 1]) { W.deadTree(G, s * 9, -12, h, r); out.colliders.push({ x: s * 9, z: -12, r: 0.4 }); }
  },
  forge(G, h, out, r, A, side) {
    W.house(G, 0, -16, 0, h, { w: 9, d: 6, roof: '#2a2224', wall: '#a8988a', lanterns: true }); out.colliders.push(boxC(0, -16, 4.9, 3.4, 0, { tall: true }));
    G.add(at(part(new THREE.CylinderGeometry(0.7, 0.9, 6, 10), '#5a5048', { outline: 0.03 }), side * 3, 5, -18));
    out.update.push(steam(G, side * 3, 8, -18, 1.5, '#3a3436'));
    W.props.anvil(G, -side * 2.5, -9, h); out.colliders.push({ x: -side * 2.5, z: -9, r: 0.6 });
    flame(G, out, -side * 5, 0.3, -11, 0.8);
    rack(G, -side * 8.5, -6, h); out.colliders.push(boxC(-side * 8.5, -6, 1.3, 0.4));
  },
  battlefield(G, h, out, r, A, side) {
    W.tent(G, 0, -16, 0, h, { w: 7, d: 8, col: '#3a1a1e', trim: '#d9a441' }); out.colliders.push(boxC(0, -16, 3.8, 4.3));
    for (let k = 0; k < 14; k++) { const x = (r() - 0.5) * 22, z = -4 - r() * 18; if (Math.abs(x) < 4.5 && z < -10) continue; W.props.banner(G, x, z, h, k % 2 ? '#8a1a1e' : '#1a1a22', r() * 3); }
    W.props.cart(G, -side * 7, -6, 0.8, h); out.colliders.push({ x: -side * 7, z: -6, r: 1.2 });
    const moon = new THREE.Mesh(new THREE.SphereGeometry(16, 24, 16), new THREE.MeshBasicMaterial({ color: '#ff4a3a', fog: false })); moon.position.set(40, 90, -230); moon.userData.keep = true; G.add(moon);
  },
  skytemple(G, h, out, r, A, side) {
    W.house(G, 0, -17, 0, h, { w: 12, d: 7, h: 3.4, roof: '#c8a03a', wall: '#fbf6ea', lanterns: true }); out.colliders.push(boxC(0, -17, 6.4, 3.9, 0, { tall: true }));
    W.torii(G, 0, -7, 0, h, 1.1, '#e8b830'); for (const s of [-1, 1]) out.colliders.push({ x: s * 2.0, z: -7, r: 0.3 });
    const sun = new THREE.Mesh(new THREE.CircleGeometry(4, 32), new THREE.MeshBasicMaterial({ color: '#ffe080', fog: false })); sun.position.set(0, 14, -22); sun.userData.keep = true; G.add(sun);
    pagoda(G, -side * 9, -10, h, '#fbf6ea', '#c8a03a'); out.colliders.push(boxC(-side * 9, -10, 2.2, 2.2, 0, { tall: true }));
  },
};

function keep(G, x, z, h, out, r, A, tiers, stone, roof, wall) {
  const y = h(x, z);
  G.add(at(part(new THREE.BoxGeometry(18, 3, 11), stone, { outline: 0.04 }), x, y + 1.5, z));
  let base = 3, w = 13, d = 8;
  for (let t = 0; t < tiers; t++) { W.house(G, x, z, 0, () => y + base, { w, d, h: 2.6, roof, wall, lanterns: t === 0 }); base += 3.8; w -= 3; d -= 2; }
  out.colliders.push(boxC(x, z, 9.2, 5.7, 0, { tall: true }));
  if (A.fire) for (let k = 0; k < 6; k++) flame(G, out, x + (k - 2.5) * 2.6, y + 3.2 + (k % 3) * 3.6, z + 3.5 - (k % 3), 1 + r());
}
function pagoda(G, x, z, h, wall, roof) {
  const K = W.kit();
  for (let t = 0; t < 4; t++) { const s = 3.4 - t * 0.5, y = t * 2.0; K.box(s, 1.6, s, 0, y + 0.8, 0, wall); K.box(s + 1.6, 0.18, s + 1.6, 0, y + 1.75, 0, roof); }
  K.cyl(0.08, 0.08, 2.4, 0, 9.2, 0, '#d9a441', 6);
  return W.place(G, K.mesh(), x, z, 0, h);
}
function komainu(G, x, z, h) {
  const K = W.kit(); K.box(0.7, 0.5, 0.7, 0, 0.25, 0, '#8a867c'); K.sph(0.28, 0, 0.75, 0.05, '#a8a49c', 1, 1, 1.2); K.sph(0.22, 0, 1.12, 0.18, '#a8a49c', 1, 1, 1, 1);
  return W.place(G, K.mesh(0.02), x, z, 0, h);
}
function foxStatue(G, x, z, h) {
  const K = W.kit(); K.box(0.7, 0.5, 0.7, 0, 0.25, 0, '#8a867c'); K.sph(0.24, 0, 0.75, 0, '#f4f0e8', 1, 1.3, 1); K.sph(0.18, 0, 1.15, 0.08, '#f4f0e8', 1, 1, 1.2, 1);
  for (const s of [-1, 1]) K.cone(0.06, 0.2, s * 0.09, 1.35, 0.06, '#f4f0e8', 4);
  K.box(0.24, 0.12, 0.02, 0, 0.9, 0.22, '#c8322a');
  return W.place(G, K.mesh(0.02), x, z, 0, h);
}
function makiwara(G, x, z, h) {
  const K = W.kit(); K.cyl(0.12, 0.14, 1.8, 0, 0.9, 0, '#8a6a48', 8); K.cyl(0.16, 0.16, 0.5, 0, 1.3, 0, '#d8c49a', 8);
  return W.place(G, K.mesh(0.02), x, z, 0, h);
}
function rack(G, x, z, h) {
  const K = W.kit(); for (const s of [-1, 1]) K.box(0.1, 1.4, 0.3, s * 1.1, 0.7, 0, '#5a3a26'); for (const y of [0.6, 1.1]) K.box(2.4, 0.08, 0.3, 0, y, 0, '#5a3a26');
  for (let k = 0; k < 5; k++) K.box(0.05, 1.3, 0.05, -0.8 + k * 0.4, 0.95, 0.1, '#c8a878', 0.1);
  return W.place(G, K.mesh(0.015), x, z, 0, h);
}
function lanternStrings(G, h, [[x0, z0], [x1, z1]], y) {
  const mat = [new THREE.MeshBasicMaterial({ color: '#ff6a3a' }), new THREE.MeshBasicMaterial({ color: '#ffc84a' })];
  for (let k = 0; k <= 12; k++) { const t = k / 12, L = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), mat[k % 2]); L.position.set(x0 + (x1 - x0) * t, y - Math.sin(t * Math.PI) * 0.7, z0 + (z1 - z0) * t); L.scale.y = 1.3; G.add(L); }
}
function prayerFlags(G, h, [[x0, z0], [x1, z1]]) {
  const K = W.kit(), cols = ['#3a6ad8', '#f4f4f4', '#d83a2a', '#3aa84a', '#e8c030'];
  for (let k = 0; k <= 14; k++) { const t = k / 14; K.box(0.36, 0.44, 0.02, x0 + (x1 - x0) * t, 3.2 - Math.sin(t * Math.PI) * 0.8, z0 + (z1 - z0) * t, cols[k % 5]); }
  for (const [x, z] of [[x0, z0], [x1, z1]]) K.cyl(0.05, 0.05, 3.6, x, 1.8, z, '#5a3a26', 6);
  W.place(G, K.mesh(0.01), 0, 0, 0, () => 0);
}

function steam(G, x, y, z, s = 1, col = '#ffffff') {
  const n = 40, pos = new Float32Array(n * 3), seed = [];
  for (let i = 0; i < n; i++) { seed.push(Math.random()); pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: col, size: 0.9 * s, transparent: true, opacity: 0.45, depthWrite: false })); pts.frustumCulled = false; G.add(pts);
  return () => {
    const a = g.attributes.position.array, t = performance.now() / 1000;
    for (let i = 0; i < n; i++) { const k = (t * 0.25 + seed[i]) % 1; a[i * 3] = x + Math.sin(seed[i] * 40 + t) * 1.6 * s * k + (seed[i] - 0.5) * 2 * s; a[i * 3 + 1] = y + k * 4 * s; a[i * 3 + 2] = z + Math.cos(seed[i] * 30 + t) * 1.2 * s * k; }
    g.attributes.position.needsUpdate = true;
  };
}
function lightning() {
  let t = 3 + Math.random() * 5;
  return (dt, cam, scene) => {
    t -= dt;
    if (!scene) return;
    const H = scene.userData.hemi; if (!H) return;
    if (t < 0) { t = 4 + Math.random() * 7; H.userData.flash = 0.35; }
    if (H.userData.flash > 0) { H.userData.flash -= dt; H.intensity = H.userData.base * (1 + (Math.sin(H.userData.flash * 60) > 0 ? 1.6 : 0.2)); } else H.intensity = H.userData.base;
  };
}

export function flame(G, out, x, y, z, s = 1) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { t: { value: Math.random() * 10 } },
    vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float t; varying vec2 vU;
      float n(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
      float sn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(n(i), n(i+vec2(1,0)), f.x), mix(n(i+vec2(0,1)), n(i+vec2(1,1)), f.x), f.y); }
      void main(){ vec2 u = vU; float w = 1.0 - abs(u.x - 0.5) * 2.0; float k = sn(vec2(u.x * 4.0, u.y * 3.0 - t * 3.0)) * 0.6 + sn(vec2(u.x * 9.0, u.y * 6.0 - t * 5.0)) * 0.4;
        float f = smoothstep(0.0, 0.6, w * (1.0 - u.y) * 1.6 - k * 0.6); vec3 c = mix(vec3(1.0,0.25,0.05), vec3(1.0,0.85,0.4), f);
        gl_FragColor = vec4(c * f, f); }`,
  });
  const g = new THREE.Group();
  for (let k = 0; k < 2; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4 * s, 2.4 * s), mat); m.position.y = 1.1 * s; m.rotation.y = k * Math.PI / 2; g.add(m); }
  g.position.set(x, y, z); g.userData.keep = true; G.add(g);
  out.update.push(dt => { mat.uniforms.t.value += dt; });
  if (out.lights.length < 6) { const L = new THREE.PointLight('#ff7a2a', 6 * s, 9, 2); L.position.set(x, y + 1.2, z); G.add(L); out.lights.push(L); out.update.push(() => { L.intensity = 6 * s * (0.8 + Math.random() * 0.3); }); }
  return g;
}

function particles(G, kind, A) {
  const conf = { leaves: ['#7aa04a', 0.12, 0.5], petals: ['#ffc6d8', 0.1, 0.4], snow: ['#ffffff', 0.09, 0.8], rain: ['#9ab4d8', 0.05, 12], embers: ['#ff8a3a', 0.08, -0.8], fireflies: ['#e8ff8a', 0.12, 0], mist: ['#e8f4ff', 0.25, -0.2] }[kind];
  if (!conf) return () => {};
  const n = kind === 'rain' ? 1400 : 500, box = [60, 14, 60], pos = new Float32Array(n * 3), seed = [];
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * box[0]; pos[i * 3 + 1] = Math.random() * box[1]; pos[i * 3 + 2] = (Math.random() - 0.5) * box[2]; seed.push(Math.random() * 10); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const glow = kind === 'embers' || kind === 'fireflies';
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: conf[0], size: conf[1], transparent: true, opacity: 0.85, depthWrite: false, blending: glow ? THREE.AdditiveBlending : THREE.NormalBlending }));
  pts.frustumCulled = false; G.add(pts);
  return (dt, cam) => {
    const a = g.attributes.position.array, t = performance.now() / 1000;
    for (let i = 0; i < n; i++) {
      let x = a[i * 3], y = a[i * 3 + 1], z = a[i * 3 + 2];
      if (kind === 'fireflies') { x += Math.sin(t * 0.7 + seed[i]) * dt * 0.4; y += Math.cos(t + seed[i]) * dt * 0.3; if (y > 3) y = 0.3; }
      else { y -= conf[2] * dt * (0.6 + (seed[i] % 1)); x += (Math.sin(t + seed[i]) * 0.4 + 0.3) * dt; }
      if (y < 0) y += box[1]; if (y > box[1]) y -= box[1];
      if (x < cam.position.x - box[0] / 2) x += box[0]; if (x > cam.position.x + box[0] / 2) x -= box[0];
      if (z < cam.position.z - box[2] / 2) z += box[2]; if (z > cam.position.z + box[2] / 2) z -= box[2];
      a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
    }
    g.attributes.position.needsUpdate = true;
  };
}
