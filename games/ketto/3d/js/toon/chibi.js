// Cartoon samurai built from a fighter definition (colors, hair style, race, weapon, bulk, fem).
// About three heads tall, toon-shaded with ink outlines. Facing +Z, feet at the origin.
import * as THREE from 'three';
import { toon, part, lathe, ink, merged } from './toon.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const SKIN = '#f0c4a0', DARK = '#1a1220';
const shade = (hex, k) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();
const mix = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();

function sphere(r, ws = 20, hs = 14) { return new THREE.SphereGeometry(r, ws, hs); }
function capsule(r, len, seg = 10) { return new THREE.CapsuleGeometry(r, len, 6, seg); }
function cone(r, h, seg = 12) { return new THREE.ConeGeometry(r, h, seg); }
function cyl(r0, r1, h, seg = 16) { return new THREE.CylinderGeometry(r0, r1, h, seg); }
function box(w, h, d) { return new THREE.BoxGeometry(w, h, d); }
function at(m, x, y, z, rx = 0, ry = 0, rz = 0, s = null) {
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
  if (s) Array.isArray(s) ? m.scale.set(...s) : m.scale.setScalar(s);
  return m;
}

/**
 * def: a game fighter definition (col, style, race, weapon, bulk, fem) or a villager spec.
 * returns { root, animate(state, dt, speed), head, height }
 */
export function makeChibi(def, opts = {}) {
  const c = Object.assign({ gi: '#a8242e', giD: '#5e121a', hak: '#26222e', hakD: '#121016', acc: '#efe9dc', skin: SKIN, hair: '#1a1420',
    under: '#efe6d2', mask: '#c22a2a', armor: '#4a4f5c', armorD: '#2b2e37', hilt: '#2a1d18', tsuba: '#d9a441' }, def.col || {});
  const fem = !!(def.fem || def.body === 'f');
  const bulk = def.bulk || 0;
  const style = def.style || 'topknot';
  const race = def.race || 'human';
  const W = 1 + bulk * 0.16 - (fem ? 0.06 : 0);          // body width
  const Hb = 1 + bulk * 0.05;                             // body height
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);       // everything above the feet (bobs when walking)
  const OL = 0.009;

  // ---- hakama: a pleated bell from the waist to the ground
  const waist = 0.48 * Hb;
  const hakGeo = lathe([[0.0, 0.02], [0.205 * W, 0.0], [0.212 * W, 0.03], [0.185 * W, 0.2], [0.163 * W, waist * 0.78], [0.152 * W, waist]], 32,
    (a, y) => 0.06 * Math.max(0, Math.sin(a * 8)) * Math.max(0, 1 - y / waist) - 0.03 * Math.pow(Math.abs(Math.cos(a)), 12) * (1 - y / waist));
  const hakama = part(hakGeo, c.hak, { outline: OL });
  root.add(hakama);
  // ---- feet: white tabi in dark sandals, peeking out under the hem
  const feet = [];
  for (const s of [-1, 1]) {
    const f = new THREE.Group();
    f.add(at(part(capsule(0.038, 0.06), '#efe9de', { outline: OL * 0.8 }), 0, 0.036, 0.02, Math.PI / 2, 0, 0));
    f.add(at(part(box(0.085, 0.018, 0.15), '#3a2a1c', { outline: OL * 0.8 }), 0, 0.009, 0.02));
    f.position.set(s * 0.075 * W, 0, 0.03);
    root.add(f); feet.push(f);
  }
  // ---- torso: the kimono top, a little wider at the chest
  const tw = W * (fem ? 0.92 : 1);
  const torso = part(lathe([[0, waist - 0.02], [0.15 * tw, waist - 0.02], [0.158 * tw, waist + 0.08], [0.17 * tw, waist + 0.19], [0.162 * tw, waist + 0.27], [0.12 * tw, waist + 0.32], [0.05, waist + 0.35], [0, waist + 0.35]], 28), c.gi, { outline: OL });
  body.add(torso);
  const chestZ = 0.168 * tw;
  // the crossed collar: two bands meeting in a V over a white under-kimono
  const vee = new THREE.Shape(); vee.moveTo(-0.07, 0); vee.lineTo(0.07, 0); vee.lineTo(0, -0.17); vee.closePath();
  const veeM = new THREE.Mesh(new THREE.ShapeGeometry(vee), toon(c.under)); at(veeM, 0, waist + 0.31, chestZ - 0.012, -0.12, 0, 0); body.add(veeM);
  for (const s of [-1, 1]) {
    const band = part(box(0.034, 0.21, 0.016), c.acc, { outline: OL * 0.7 });
    at(band, s * 0.042, waist + 0.235, chestZ + 0.004, -0.12, 0, -s * 0.4);
    body.add(band);
  }
  // ---- obi with a knot at the back
  const obiCol = c.hakD;
  body.add(at(part(cyl(0.162 * W, 0.16 * W, 0.075, 28), obiCol, { outline: OL }), 0, waist + 0.005, 0));
  body.add(at(part(box(0.15, 0.06, 0.05), obiCol, { outline: OL * 0.8 }), 0, waist + 0.01, -0.165 * W));
  // ---- arms: wide sleeves hanging from the shoulders, hands at the cuff
  const arms = [];
  for (const s of [-1, 1]) {
    const a = new THREE.Group();
    a.position.set(s * 0.15 * tw, waist + 0.29, 0);
    const sl = part(box(0.13, 0.3, 0.15), c.gi, { outline: OL });
    at(sl, s * 0.035, -0.13, 0, 0, 0, s * 0.05);
    a.add(sl);
    const cuff = part(box(0.135, 0.03, 0.155), c.giD, { outline: 0 });
    at(cuff, s * 0.04, -0.27, 0); a.add(cuff);
    const hand = part(sphere(0.045, 14, 10), c.skin, { outline: OL * 0.8 });
    at(hand, s * 0.04, -0.3, 0.03); a.add(hand);
    a.rotation.z = s * 0.12;
    body.add(a); arms.push(a);
  }
  // ---- neck and head
  body.add(at(part(cyl(0.05, 0.055, 0.08), c.skin, { outline: 0 }), 0, waist + 0.36, 0));
  const head = new THREE.Group();
  head.position.set(0, waist + 0.56, 0.0);
  body.add(head);
  const HR = 0.215;
  head.add(at(part(sphere(HR, 28, 20), c.skin, { outline: OL }), 0, 0, 0, 0, 0, 0, [1, 0.97, 0.98]));
  for (const s of [-1, 1]) head.add(at(part(sphere(0.04, 12, 8), c.skin, { outline: OL * 0.7 }), s * HR * 0.97, -0.02, 0, 0, 0, 0, [0.5, 0.85, 0.65]));
  const masked = ['oni', 'kitsune', 'tengu', 'hood'].includes(style);
  if (!['oni', 'kitsune', 'tengu'].includes(style)) addFace(head, HR, c, fem, def);
  addHair(head, HR, style, c, fem, OL);
  // ---- weapon
  addWeapon(body, def.weapon || 'katana', c, W, waist, OL);
  // ---- armor for helmeted warriors
  if (style === 'helmet') addArmor(body, arms, c, W, tw, waist, OL);
  // ---- race features
  addRace(root, body, head, HR, race, c, W, waist, OL, style);
  if (def.scale) root.scale.setScalar(def.scale);

  // ---------- animation ----------
  let t = Math.random() * 10;
  const st = { walk: 0, run: 0, air: 0 };
  function animate(state, dt, speed = 1) {
    t += dt;
    const wantWalk = state === 'walk' || state === 'run' ? 1 : 0, wantRun = state === 'run' ? 1 : 0;
    st.walk += (wantWalk - st.walk) * Math.min(1, dt * 10);
    st.run += (wantRun - st.run) * Math.min(1, dt * 8);
    st.air += ((state === 'jump' ? 1 : 0) - st.air) * Math.min(1, dt * 12);
    const f = (7 + st.run * 4) * speed, ph = t * f;
    const sw = Math.sin(ph), bob = Math.abs(Math.sin(ph));
    const breathe = Math.sin(t * 2.2) * 0.008;
    body.position.y = st.walk * bob * (0.035 + st.run * 0.03) + breathe + st.air * 0.02;
    body.rotation.x = st.walk * (0.06 + st.run * 0.12);
    body.rotation.z = st.walk * sw * 0.03;
    hakama.rotation.z = st.walk * sw * 0.035;
    hakama.scale.set(1 + st.walk * bob * 0.02, 1 - st.walk * bob * 0.025 - st.air * 0.04, 1 + st.walk * bob * 0.02);
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      arms[i].rotation.x = -st.walk * s * sw * (0.45 + st.run * 0.35) - st.air * 0.6;
      arms[i].rotation.z = s * (0.12 + st.air * 0.5 + breathe * 2);
      feet[i].position.z = 0.03 + st.walk * s * sw * (0.1 + st.run * 0.06);
      feet[i].position.y = st.walk * Math.max(0, s * Math.cos(ph)) * 0.05;
    }
    head.rotation.x = -body.rotation.x * 0.5 + (state === 'talk' ? Math.sin(t * 9) * 0.04 : 0);
    head.rotation.y = state === 'idle' ? Math.sin(t * 0.5) * 0.12 : 0;
  }
  // merge each moving piece into one mesh (keeps a crowd of fighters to a few dozen draw calls)
  for (const node of [root, body, head, hakama, ...arms, ...feet]) bake(node, new Set([root, body, head, hakama, ...arms, ...feet]));
  animate('idle', 0);
  root.traverse(o => { if (o.isMesh && !o.userData.outline) o.castShadow = true; });
  return { root, animate, head, height: (waist + 0.56 + HR) * (def.scale || 1), masked };
}

function addFace(head, HR, c, fem, def) {
  const onFace = (x, y, out = 0.004) => {   // a point on the face, and the direction straight out of it
    const d = V(x, y, Math.sqrt(Math.max(0.01, 1 - x * x - y * y)));
    return { p: d.clone().multiplyScalar(HR * 0.99 + out), n: d };
  };
  const eyeCol = '#2a1a14';
  for (const s of [-1, 1]) {
    const { p, n } = onFace(s * 0.38, -0.06);
    const eye = new THREE.Mesh(sphere(1, 16, 12), new THREE.MeshBasicMaterial({ color: DARK }));
    eye.position.copy(p); eye.scale.set(0.04, fem ? 0.066 : 0.058, 0.014); eye.lookAt(p.clone().add(n)); head.add(eye);
    const iris = new THREE.Mesh(sphere(1, 12, 8), new THREE.MeshBasicMaterial({ color: eyeCol }));
    iris.position.copy(p).addScaledVector(n, 0.006).add(V(0, -0.008, 0)); iris.scale.set(0.028, fem ? 0.044 : 0.038, 0.01); iris.lookAt(p.clone().add(n)); head.add(iris);
    for (const [dx, dy, r] of [[-s * 0.012, 0.02, 0.014], [s * 0.012, -0.018, 0.007]]) {
      const hl = new THREE.Mesh(sphere(1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      hl.position.copy(p).addScaledVector(n, 0.016).add(V(dx, dy, 0)); hl.scale.setScalar(r); head.add(hl);
    }
    // brows: angled in for a determined look
    const b = onFace(s * 0.38, 0.27, 0.006);
    const brow = new THREE.Mesh(box(fem ? 0.05 : 0.06, fem ? 0.009 : 0.014, 0.01), toon(shade(c.hair, 0.8)));
    brow.position.copy(b.p); brow.lookAt(b.p.clone().add(b.n)); brow.rotateZ(s * (fem ? -0.12 : -0.3)); brow.scale.set(1.3, 1.3, 1); head.add(brow);
    if (fem) {
      const bl = onFace(s * 0.56, -0.24, 0.002);
      const blush = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), new THREE.MeshBasicMaterial({ color: '#ff8a8a', transparent: true, opacity: 0.35 }));
      blush.position.copy(bl.p); blush.lookAt(bl.p.clone().add(bl.n)); head.add(blush);
    }
  }
  const m = onFace(0, -0.5, 0.002);
  const mouth = new THREE.Mesh(box(0.032, 0.007, 0.006), toon('#6a2a26'));
  mouth.position.copy(m.p); mouth.lookAt(m.p.clone().add(m.n)); head.add(mouth);
  const nz = onFace(0, -0.2, 0.004);
  const nose = new THREE.Mesh(sphere(0.012, 8, 6), toon(shade(c.skin, 0.9)));
  nose.position.copy(nz.p); head.add(nose);
}

function hairCap(head, HR, col, OL, { front = 0.75, sides = true } = {}) {
  // a shell over the top and back of the head, leaving the face open
  const g = new THREE.SphereGeometry(HR * 1.06, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.62);
  const cap = part(g, col, { outline: OL });
  cap.rotation.x = -front;
  head.add(cap);
  // bangs: a row of soft locks across the forehead
  for (let i = -2; i <= 2; i++) {
    const lk = part(cone(0.05, 0.11, 8), col, { outline: OL * 0.7 });
    const a = i * 0.32;
    lk.position.set(Math.sin(a) * HR * 0.95, HR * 0.55, Math.cos(a) * HR * 0.78);
    lk.rotation.set(Math.PI + 0.5, a, 0);
    head.add(lk);
  }
  if (sides) for (const s of [-1, 1]) {
    const sd = part(box(0.05, 0.16, 0.12), col, { outline: OL * 0.7 });
    at(sd, s * HR * 0.98, -0.02, -0.02, 0, 0, 0); head.add(sd);
  }
  return cap;
}

function addHair(head, HR, style, c, fem, OL) {
  const col = c.hair, tie = c.acc;
  const tail = (from, pts, r0, r1, colr = col) => {
    const curve = new THREE.CatmullRomCurve3([from, ...pts]);
    const g = new THREE.TubeGeometry(curve, 20, 1, 10, false);
    const p = g.attributes.position, n = 21, rad = 11;
    for (let i = 0; i < n; i++) {
      const ctr = curve.getPointAt(i / (n - 1)), r = r0 + (r1 - r0) * (i / (n - 1));
      for (let j = 0; j < rad; j++) { const k = i * rad + j; const v = V(p.getX(k), p.getY(k), p.getZ(k)).sub(ctr).multiplyScalar(r).add(ctr); p.setXYZ(k, v.x, v.y, v.z); }
    }
    g.computeVertexNormals();
    head.add(part(g, colr, { outline: OL * 0.8 }));
  };
  switch (style) {
    case 'bald': {
      const shine = new THREE.Mesh(sphere(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5 }));
      shine.position.set(-0.06, HR * 0.86, 0.08); head.add(shine);
      break;
    }
    case 'topknot': case 'beard':
      hairCap(head, HR, col, OL);
      head.add(at(part(capsule(0.038, 0.07), col, { outline: OL }), 0, HR * 1.05, -0.06, 0.9, 0, 0));
      head.add(at(part(cyl(0.03, 0.03, 0.03), tie, { outline: OL * 0.6 }), 0, HR * 1.02, -0.035, 0.9, 0, 0));
      if (style === 'beard') {
        head.add(at(part(sphere(0.11, 16, 12), col, { outline: OL }), 0, -HR * 0.62, HR * 0.55, 0.2, 0, 0, [1, 1.1, 0.6]));
        for (const s of [-1, 1]) head.add(at(part(capsule(0.016, 0.05), col, { outline: OL * 0.6 }), s * 0.04, -HR * 0.33, HR * 0.93, 0, 0, s * 1.2));
      }
      break;
    case 'ponytail':
      hairCap(head, HR, col, OL);
      tail(V(0, 0.03, -HR * 0.95), [V(0, -0.08, -HR * 1.2), V(0, -0.25, -HR * 1.15), V(0, -0.4, -HR * 1.0)], 0.05, 0.02);
      head.add(at(part(cyl(0.035, 0.035, 0.03), tie, { outline: OL * 0.6 }), 0, 0.03, -HR * 0.98, 1.4, 0, 0));
      break;
    case 'mane': case 'oni':
      hairCap(head, HR, col, OL);
      for (let i = 0; i < 9; i++) {
        const a = (i - 4) * 0.33;
        const sp = part(cone(0.07, 0.26 + (i % 2) * 0.08, 8), col, { outline: OL * 0.8 });
        sp.position.set(Math.sin(a) * HR * 0.85, HR * 0.1 - Math.abs(i - 4) * 0.02, -Math.cos(a) * HR * 0.75);
        sp.rotation.set(-2.2, a * 0.6, 0);
        head.add(sp);
      }
      break;
    case 'braid':
      hairCap(head, HR, col, OL);
      for (let i = 0; i < 7; i++) head.add(at(part(sphere(0.045 - i * 0.003, 12, 8), col, { outline: OL * 0.7 }), 0, -0.08 - i * 0.065, -HR * 1.0 - i * 0.012));
      head.add(at(part(cyl(0.03, 0.03, 0.025), tie, { outline: OL * 0.6 }), 0, -0.53, -HR * 1.08, 0, 0, 0));
      break;
    case 'hime': case 'long': {
      hairCap(head, HR, col, OL, { sides: false });
      const len = style === 'long' ? 0.62 : 0.42;
      head.add(at(part(box(0.36, len, 0.06), col, { outline: OL }), 0, -len / 2 + 0.05, -HR * 0.92));
      for (const s of [-1, 1]) head.add(at(part(box(0.06, style === 'long' ? 0.5 : 0.24, 0.1), col, { outline: OL * 0.8 }), s * HR * 0.98, style === 'long' ? -0.2 : -0.08, 0.04));
      if (style === 'hime') head.add(at(part(box(0.3, 0.06, 0.06), col, { outline: OL * 0.7 }), 0, HR * 0.58, HR * 0.8, -0.35, 0, 0));
      break;
    }
    case 'twintails':
      hairCap(head, HR, col, OL);
      for (const s of [-1, 1]) {
        tail(V(s * HR * 0.8, 0.08, -0.08), [V(s * HR * 1.25, 0.0, -0.12), V(s * HR * 1.35, -0.2, -0.1), V(s * HR * 1.25, -0.38, -0.05)], 0.045, 0.02);
        head.add(at(part(sphere(0.03, 10, 8), tie, { outline: OL * 0.6 }), s * HR * 0.85, 0.08, -0.08));
      }
      break;
    case 'bun':
      hairCap(head, HR, col, OL);
      head.add(at(part(sphere(0.085, 16, 12), col, { outline: OL }), 0, HR * 0.95, -0.07));
      head.add(at(part(cyl(0.006, 0.006, 0.24), tie, { outline: 0 }), 0, HR * 1.0, -0.07, 0, 0, 1.2));
      break;
    case 'spiky': case 'bandana':
      hairCap(head, HR, col, OL);
      for (let i = 0; i < 11; i++) {
        const a = (i / 11) * Math.PI * 2;
        const sp = part(cone(0.055, 0.17, 7), col, { outline: OL * 0.7 });
        sp.position.set(Math.sin(a) * HR * 0.55, HR * 0.85, Math.cos(a) * HR * 0.5 - 0.04);
        sp.rotation.set(Math.cos(a) * 0.7 - 0.3, 0, -Math.sin(a) * 0.7);
        head.add(sp);
      }
      if (style === 'bandana') head.add(at(part(cyl(HR * 1.04, HR * 1.04, 0.06, 28), tie, { outline: OL }), 0, HR * 0.42, 0, -0.12, 0, 0));
      break;
    case 'helmet': {
      head.add(at(part(new THREE.SphereGeometry(HR * 1.12, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), c.armor, { outline: OL }), 0, 0.02, -0.01));
      head.add(at(part(lathe([[HR * 1.1, 0], [HR * 1.35, -0.12], [HR * 1.42, -0.16]], 28), c.armorD, { outline: OL }), 0, 0.02, -0.03));
      const crest = part(new THREE.TorusGeometry(0.17, 0.014, 6, 24, Math.PI), c.tsuba, { outline: OL * 0.6 });
      at(crest, 0, HR * 1.05, HR * 0.6, 0.3, 0, 0); head.add(crest);
      break;
    }
    case 'kasa':
      hairCap(head, HR, col, OL);
      head.add(at(part(cone(HR * 1.75, 0.2, 24), '#c8a868', { outline: OL }), 0, HR * 0.95, 0));
      break;
    case 'jingasa':
      hairCap(head, HR, col, OL);
      head.add(at(part(cone(HR * 1.35, 0.09, 24), '#1a1418', { outline: OL }), 0, HR * 1.0, 0));
      head.add(at(part(cyl(0.035, 0.035, 0.01), c.tsuba, { outline: 0 }), 0, HR * 1.0, HR * 0.6, 1.1, 0, 0));
      break;
    case 'hood': {
      // cloth wrapped over the head and the lower face, open in a band across the eyes
      const r = HR * 1.08;
      head.add(part(new THREE.SphereGeometry(r, 28, 10, 0, Math.PI * 2, 0, Math.PI * 0.455), c.giD, { outline: OL }));
      head.add(part(new THREE.SphereGeometry(r, 28, 10, 0, Math.PI * 2, Math.PI * 0.565, Math.PI * 0.435), c.giD, { outline: OL }));
      head.add(part(new THREE.SphereGeometry(r, 20, 4, Math.PI / 2 + 0.85, Math.PI * 2 - 1.7, Math.PI * 0.45, Math.PI * 0.125), c.giD, { outline: 0 }));
      break;
    }
    case 'kitsune':
      hairCap(head, HR, col, OL);
      for (let i = 0; i < 5; i++) head.add(at(part(cone(0.06, 0.24, 8), col, { outline: OL * 0.8 }), (i - 2) * 0.06, -0.02, -HR * 0.9, -2.5, 0, (i - 2) * 0.2));
      break;
    case 'tengu':
      hairCap(head, HR, col, OL);
      head.add(at(part(capsule(0.035, 0.06), col, { outline: OL }), 0, HR * 1.05, -0.06, 0.9, 0, 0));
      break;
    default:
      hairCap(head, HR, col, OL);
  }
  // masks cover the face
  if (style === 'oni' || style === 'kitsune' || style === 'tengu') {
    const mc = style === 'kitsune' ? '#f4f0e8' : style === 'tengu' ? '#c01e1e' : c.mask;
    const mask = part(new THREE.SphereGeometry(HR * 1.04, 28, 18, Math.PI * 0.08, Math.PI * 0.84, Math.PI * 0.2, Math.PI * 0.64), mc, { outline: OL });
    head.add(mask);
    const eyeM = new THREE.MeshBasicMaterial({ color: style === 'oni' ? '#ffe28a' : '#1a1220' });
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(box(0.05, 0.016, 0.01), eyeM);
      e.position.set(s * 0.075, 0.0, HR * 1.04); e.rotation.z = s * -0.35; head.add(e);
    }
    if (style === 'oni') {
      for (const s of [-1, 1]) head.add(at(part(cone(0.04, 0.2, 8), '#f0e6c8', { outline: OL * 0.8 }), s * 0.1, HR * 0.92, 0.1, -0.15, 0, -s * 0.3));
      for (const s of [-1, 1]) head.add(at(part(cone(0.012, 0.04, 6), '#ffffff', { outline: 0 }), s * 0.045, -0.12, HR * 0.98, Math.PI, 0, 0));
      head.add(at(part(box(0.11, 0.025, 0.02), '#2a0a0a', { outline: 0 }), 0, -0.1, HR * 1.0));
    } else if (style === 'kitsune') {
      head.add(at(part(cone(0.06, 0.13, 10), mc, { outline: OL * 0.7 }), 0, -0.06, HR * 1.05, Math.PI / 2, 0, 0));
      for (const s of [-1, 1]) head.add(at(part(box(0.012, 0.07, 0.006), '#d0242a', { outline: 0 }), s * 0.07, 0.07, HR * 1.0, -0.3, 0, s * 0.4));
      for (const s of [-1, 1]) head.add(at(part(cone(0.055, 0.12, 4), '#d9702a', { outline: OL * 0.7 }), s * 0.11, HR * 1.0, -0.02, 0, 0, -s * 0.35));
    } else {
      head.add(at(part(cyl(0.008, 0.03, 0.2, 10), mc, { outline: OL * 0.7 }), 0, -0.04, HR * 1.12, Math.PI / 2 + 0.15, 0, 0));
      head.add(at(part(cyl(0.05, 0.06, 0.06, 6), '#141014', { outline: OL * 0.6 }), 0, HR * 0.95, 0.07, -0.3, 0, 0));
    }
  }
}

function addWeapon(body, kind, c, W, waist, OL) {
  if (kind === 'none') return;
  const g = new THREE.Group();
  const lac = '#1a1214';
  if (kind === 'yari' || kind === 'naginata') {
    // carried across the back
    g.add(at(part(cyl(0.014, 0.014, 1.5, 8), lac, { outline: OL * 0.6 }), 0, 0, 0));
    if (kind === 'yari') g.add(at(part(cone(0.03, 0.18, 4), '#dfe6ec', { outline: OL * 0.6 }), 0, 0.84, 0));
    else g.add(at(part(box(0.04, 0.3, 0.01), '#dfe6ec', { outline: OL * 0.6 }), 0.012, 0.9, 0, 0, 0, -0.12));
    g.position.set(0, waist + 0.3, -0.2 * W); g.rotation.z = 0.7;
  } else if (kind === 'kanabo') {
    g.add(at(part(cyl(0.05, 0.025, 0.7, 8), '#3a3438', { outline: OL * 0.7 }), 0, 0, 0));
    for (let i = 0; i < 12; i++) g.add(at(new THREE.Mesh(cone(0.012, 0.03, 5), toon('#c8a050')), Math.cos(i) * 0.045, 0.05 + (i % 6) * 0.05, Math.sin(i) * 0.045, 0, 0, Math.PI / 2 * (i % 2 ? 1 : -1)));
    g.position.set(0, waist + 0.3, -0.2 * W); g.rotation.z = -0.6;
  } else {
    // a sword through the obi at the left hip, hilt forward
    const L = kind === 'nodachi' ? 0.7 : kind === 'tanto' ? 0.28 : 0.52;
    g.add(at(part(cyl(0.019, 0.016, L, 8), lac, { outline: OL * 0.6 }), 0, -L / 2, 0));
    g.add(at(part(cyl(0.035, 0.035, 0.012, 16), c.tsuba, { outline: OL * 0.5 }), 0, 0.006, 0));
    g.add(at(part(cyl(0.019, 0.019, kind === 'tanto' ? 0.09 : 0.15, 8), c.hilt, { outline: OL * 0.6 }), 0, kind === 'tanto' ? 0.05 : 0.085, 0));
    g.position.set(0.17 * W, waist + 0.02, 0.06);
    g.rotation.set(1.15, 0, -0.3);   // hilt forward and up, scabbard sweeping back
  }
  body.add(g);
}

function addArmor(body, arms, c, W, tw, waist, OL) {
  body.add(at(part(lathe([[0.0, waist + 0.02], [0.17 * tw, waist + 0.02], [0.18 * tw, waist + 0.12], [0.185 * tw, waist + 0.22], [0.15 * tw, waist + 0.28], [0, waist + 0.28]], 24,
    (a, y) => 0.012 * Math.sin((y - waist) * 90)), c.armor, { outline: OL }), 0, 0, 0));
  for (const a of arms) for (let k = 0; k < 3; k++) {
    const s = Math.sign(a.position.x);
    a.add(at(part(box(0.15, 0.05, 0.17), k % 2 ? c.armorD : c.armor, { outline: OL * 0.7 }), s * 0.04, -0.02 - k * 0.055, 0, 0, 0, s * 0.1));
  }
  // armored skirt panels over the hakama
  for (let i = 0; i < 5; i++) {
    const ang = (i - 2) * 0.62 + (i > 2 ? 0.5 : i < 2 ? -0.5 : 0);
    const p = part(box(0.13, 0.15, 0.02), i % 2 ? c.armorD : c.armor, { outline: OL * 0.7 });
    p.position.set(Math.sin(ang) * 0.19 * W, waist - 0.1, Math.cos(ang) * 0.19 * W);
    p.rotation.set(0.15, ang, 0);
    body.add(p);
  }
}

function addRace(root, body, head, HR, race, c, W, waist, OL, style) {
  const skin = c.skin;
  const tube = (pts, r0, r1, col, parent = body) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    const g = new THREE.TubeGeometry(curve, 16, 1, 8, false), p = g.attributes.position, n = 17, rad = 9;
    for (let i = 0; i < n; i++) { const ctr = curve.getPointAt(i / (n - 1)), r = r0 + (r1 - r0) * (i / (n - 1)); for (let j = 0; j < rad; j++) { const k = i * rad + j; const v = V(p.getX(k), p.getY(k), p.getZ(k)).sub(ctr).multiplyScalar(r).add(ctr); p.setXYZ(k, v.x, v.y, v.z); } }
    g.computeVertexNormals();
    parent.add(part(g, col, { outline: OL * 0.8 }));
  };
  const ears = (h, w, col) => { for (const s of [-1, 1]) head.add(at(part(cone(w, h, 4), col, { outline: OL * 0.7 }), s * 0.12, HR * 0.95, -0.03, 0, 0, -s * 0.4)); };
  const backZ = -0.17 * W, hipY = waist - 0.02;
  switch (race) {
    case 'oni':
      if (style !== 'oni') for (const s of [-1, 1]) head.add(at(part(cone(0.03, 0.13, 8), '#f0e6c8', { outline: OL * 0.7 }), s * 0.09, HR * 0.85, 0.06, -0.3, 0, -s * 0.35));
      break;
    case 'kitsune':
      if (style !== 'kitsune') ears(0.13, 0.055, '#d9702a');
      tube([V(0, hipY, backZ), V(0.08, hipY - 0.12, backZ - 0.22), V(0.18, hipY + 0.1, backZ - 0.36), V(0.12, hipY + 0.35, backZ - 0.38)], 0.05, 0.1, '#e0782e');
      tube([V(0.12, hipY + 0.33, backZ - 0.38), V(0.11, hipY + 0.42, backZ - 0.37)], 0.09, 0.02, '#f6f0e6');
      break;
    case 'neko':
      ears(0.09, 0.05, c.hair);
      for (const s of [-1, 1]) tube([V(s * 0.03, hipY, backZ), V(s * 0.1, hipY - 0.1, backZ - 0.2), V(s * 0.14, hipY + 0.15, backZ - 0.3), V(s * 0.1, hipY + 0.38, backZ - 0.24)], 0.025, 0.012, c.hair);
      break;
    case 'tanuki':
      for (const s of [-1, 1]) head.add(at(part(sphere(0.05, 10, 8), '#6a4e36', { outline: OL * 0.7 }), s * 0.12, HR * 0.9, -0.03));
      tube([V(0, hipY, backZ), V(0, hipY - 0.06, backZ - 0.14), V(0.02, hipY - 0.03, backZ - 0.26)], 0.07, 0.09, '#7a5a3e');
      break;
    case 'tengu':
      for (const s of [-1, 1]) {
        const wing = new THREE.Group();
        for (let k = 0; k < 5; k++) wing.add(at(part(box(0.06, 0.38 - k * 0.04, 0.02), '#1c1a22', { outline: OL * 0.6 }), s * (0.05 + k * 0.045), -0.1 - k * 0.02, 0, 0, 0, s * (0.5 + k * 0.18)));
        wing.position.set(s * 0.06, waist + 0.25, backZ - 0.02);
        body.add(wing);
      }
      break;
    case 'kappa':
      body.add(at(part(new THREE.SphereGeometry(0.2 * W, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), '#4a7a2e', { outline: OL }), 0, waist + 0.15, backZ + 0.02, -Math.PI / 2, 0, 0, [1, 1.25, 0.55]));
      head.add(at(part(cyl(HR * 0.7, HR * 0.7, 0.02, 20), '#9ad0e0', { outline: OL * 0.6 }), 0, HR * 0.98, -0.02));
      break;
    case 'ryujin':
      for (const s of [-1, 1]) tube([V(s * 0.08, HR * 0.8, 0.05), V(s * 0.12, HR * 1.25, -0.02), V(s * 0.14, HR * 1.5, -0.12)], 0.018, 0.006, '#e8d890', head);
      tube([V(0, hipY, backZ), V(0, hipY - 0.25, backZ - 0.25), V(0.12, 0.12, backZ - 0.55), V(0.25, 0.03, backZ - 0.75)], 0.07, 0.01, skin);
      break;
    case 'jorogumo':
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) tube([V(s * 0.06, waist + 0.2 - k * 0.07, backZ), V(s * (0.3 + k * 0.04), waist + 0.42 - k * 0.06, backZ - 0.1), V(s * (0.45 + k * 0.05), waist - 0.05 - k * 0.1, backZ - 0.06)], 0.018, 0.008, '#1c1a22');
      break;
    case 'karakuri': {
      const gear = part(new THREE.TorusGeometry(0.09, 0.02, 6, 14), '#c8a050', { outline: OL * 0.7 });
      gear.position.set(0, waist + 0.18, backZ - 0.03); body.add(gear);
      break;
    }
    case 'spirit': {
      for (let i = 0; i < 2; i++) {
        const w = new THREE.Mesh(sphere(0.045, 12, 8), new THREE.MeshBasicMaterial({ color: '#bfe8ff' }));
        w.position.set(i ? 0.38 : -0.38, waist + 0.45, -0.1); w.userData.wisp = i; root.add(w);
      }
      break;
    }
  }
}

/** a villager: random clothes from a seed, no weapon. `kind` dresses them for a role:
 *  elder, monk, child, guard, soldier, farmer, miko, nun, smith, merchant, fox, sailor, fisher, servant, cook, noble, ninja, fighter */
export function villagerDef(seed, kind = 'villager') {
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pick = a => a[Math.floor(rnd() * a.length)];
  let fem = rnd() < 0.45;
  if (kind === 'miko' || kind === 'nun') fem = true;
  if (kind === 'monk' || kind === 'smith' || kind === 'soldier' || kind === 'guard' || kind === 'sailor') fem = rnd() < 0.2;
  const plain = ['#7a6a52', '#5a6a7a', '#8a5a4a', '#4a5a4a', '#a8885a', '#6a5a7a', '#c8b898', '#3a4a6a', '#9a4a3a'];
  const d = {
    fem, bulk: rnd() < 0.2 ? 1 : 0, style: fem ? pick(['bun', 'ponytail', 'hime', 'braid']) : pick(['topknot', 'topknot', 'bald', 'beard', 'kasa']),
    race: 'human', weapon: 'none',
    col: { gi: pick(plain), giD: '#3a3028', hak: pick(['#3a3430', '#4a4038', '#2a2a32', '#5a4a3a']), hakD: '#2a2420', acc: pick(['#efe6d2', '#d8c8a8', '#c8b088']),
      skin: pick(['#f0c4a0', '#e8b890', '#d8a078', '#f4d0b0']), hair: pick(['#1a1420', '#2a1e18', '#3a2a20', '#8a8a90', '#d8d4cc']) },
  };
  const c = d.col, gray = pick(['#d8d4cc', '#b8b8c0', '#e8e4dc']);
  switch (kind) {
    case 'elder': c.hair = gray; d.style = fem ? 'bun' : pick(['bald', 'beard']); c.gi = pick(['#6a5a4a', '#5a5a6a', '#7a6a5a']); d.bulk = 0; break;
    case 'monk': d.style = 'bald'; c.gi = pick(['#d8822a', '#c86a20', '#3a3a44']); c.hak = '#3a3a44'; c.acc = '#efe6d2'; c.hakD = '#d8822a'; break;
    case 'child': d.scale = 0.74; d.style = fem ? pick(['twintails', 'bun']) : pick(['spiky', 'topknot']); c.gi = pick(['#e0603a', '#3a8ad8', '#e0b030', '#6ab04a', '#d85a8a']); c.hair = pick(['#1a1420', '#3a2a20']); d.bulk = 0; break;
    case 'fox': d.scale = 0.74; d.race = 'kitsune'; d.style = 'spiky'; c.hair = '#e0782e'; c.gi = '#f4efe2'; c.hak = '#c8322a'; d.bulk = 0; break;
    case 'guard': d.style = 'jingasa'; d.weapon = 'yari'; c.gi = pick(['#3a4a6a', '#4a3a3a']); c.hak = '#2a2a32'; c.tsuba = '#d9a441'; break;
    case 'soldier': d.style = 'helmet'; d.weapon = 'katana'; c.gi = pick(['#7a2a2a', '#2a3a5a']); c.armor = '#3a3a44'; c.armorD = '#22222a'; c.tsuba = '#d9a441'; break;
    case 'farmer': d.style = 'kasa'; c.gi = pick(['#8a7a52', '#6a7a5a', '#8a6a4a']); c.hak = '#4a4038'; break;
    case 'miko': d.style = pick(['hime', 'long']); c.gi = '#f6f2ea'; c.giD = '#d8d0c0'; c.hak = '#c8282e'; c.hakD = '#8a1a1e'; c.acc = '#c8282e'; c.hair = '#1a1420'; break;
    case 'nun': d.style = 'hood'; c.gi = '#3a3a44'; c.giD = '#efe6d2'; c.hak = '#2a2a32'; break;
    case 'smith': d.bulk = 1; d.style = 'bandana'; c.gi = '#5a4a3a'; c.hak = '#3a3028'; c.acc = '#8a6a48'; break;
    case 'merchant': d.bulk = 1; d.style = fem ? 'bun' : 'topknot'; c.gi = pick(['#2a4a8a', '#6a3a7a', '#2a6a5a']); c.acc = '#e8c060'; break;
    case 'sailor': d.style = 'bandana'; c.gi = '#2a4a7a'; c.acc = '#efe6d2'; c.hak = '#efe6d2'; c.hakD = '#2a4a7a'; break;
    case 'fisher': d.style = pick(['kasa', 'bandana']); c.gi = pick(['#4a6a7a', '#3a5a6a']); c.hak = '#3a3430'; break;
    case 'servant': d.style = fem ? 'bun' : 'topknot'; c.gi = '#2a2a2e'; c.hak = '#2a2a2e'; c.acc = '#efe6d2'; break;
    case 'cook': d.bulk = 1; d.style = 'bandana'; c.gi = '#efe6d2'; c.giD = '#c8c0b0'; c.hak = '#4a4038'; break;
    case 'noble': d.style = 'topknot'; c.gi = '#5a2a6a'; c.giD = '#3a1a4a'; c.hak = '#2a2a3a'; c.acc = '#e8c060'; break;
    case 'ninja': d.style = 'hood'; c.gi = '#2a2a34'; c.giD = '#1a1a22'; c.hak = '#2a2a34'; break;
    case 'fighter': d.weapon = 'katana'; d.style = fem ? 'ponytail' : 'topknot'; c.gi = pick(['#a8242e', '#2a4a8a', '#2a6a4a']); c.hak = '#26222e'; break;
  }
  return d;
}

/** merge the opaque toon meshes under `node` (stopping at other moving nodes) into one mesh with an outline */
function bake(node, moving) {
  const pieces = [], kill = [];
  node.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(node.matrixWorld).invert();
  const walk = (o) => {
    for (const c of o.children) {
      if (moving.has(c)) continue;
      if (c.isMesh && !c.userData.outline && c.material && c.material.isMeshToonMaterial && !c.material.transparent && c.geometry.attributes.normal) {
        pieces.push([c.geometry, new THREE.Matrix4().multiplyMatrices(inv, c.matrixWorld), '#' + c.material.color.getHexString()]);
        kill.push(c);
      }
      if (!c.isMesh || c.children.length) walk(c);
    }
  };
  // the node itself may be a mesh (the hakama)
  if (node.isMesh && node.material && node.material.isMeshToonMaterial) {
    pieces.push([node.geometry, new THREE.Matrix4(), '#' + node.material.color.getHexString()]);
  }
  walk(node);
  if (pieces.length < 2) return;
  const m = merged(pieces, { outline: 0.009 });
  for (const c of kill) { const keep = c.children.filter(k => !k.userData.outline && (k.isMesh || k.isGroup || k.isSprite)); c.removeFromParent(); keep.forEach(k => { /* nested non-mergeable bits stay put */ }); }
  if (node.isMesh) {
    // swap the node's own geometry for the merged one
    node.geometry = m.geometry; node.material = m.material;
    node.children.filter(k => k.userData.outline).forEach(k => node.remove(k));
    m.children.forEach(k => node.add(k));
  } else node.add(m);
}
