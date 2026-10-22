// Things you can pick up or use in story mode's world: glowing pickups, and quest objects that change when you
// touch them (lanterns to light, fires to put out, bells to ring, scarecrows to stand up, koi to save...).
import * as THREE from 'three';
import { toon } from './toon.js';
import { kit } from './world.js';

const texCache = new Map();
/** a canvas texture with an emoji or a kanji on it */
export function glyphTex(text, { color = '#ffffff', stroke = '#000000', size = 128, font = 'bold 92px serif', badge = false } = {}) {
  const k = text + color + stroke + size + font + badge;
  if (texCache.has(k)) return texCache.get(k);
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  if (badge) {
    // a round cream badge with a dark rim, so the icon reads against grass, snow or night
    g.fillStyle = '#1a1220'; g.beginPath(); g.arc(size / 2, size / 2, size * 0.48, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f2c14e'; g.beginPath(); g.arc(size / 2, size / 2, size * 0.43, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff6e0'; g.beginPath(); g.arc(size / 2, size / 2, size * 0.37, 0, Math.PI * 2); g.fill();
    font = font.replace(/\d+px/, Math.round(size * 0.5) + 'px'); stroke = null;
  }
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (stroke) { g.lineWidth = size * 0.09; g.strokeStyle = stroke; g.lineJoin = 'round'; g.strokeText(text, size / 2, size / 2 + size * 0.04); }
  g.fillStyle = color; g.fillText(text, size / 2, size / 2 + size * 0.04);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(k, t);
  return t;
}
export const EMOJI = 'bold 88px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

/** a sign over someone's head: ! (quest), ? (report back), 敵 (foe), 主 (boss), 店 (shop) */
export function marker(text, color, scale = 0.5) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyphTex(text, { color, font: text.length > 1 || /[a-z!?]/i.test(text) ? 'bold 100px "Silkscreen", monospace' : 'bold 92px serif' }), depthTest: false, transparent: true }));
  sp.scale.setScalar(scale); sp.renderOrder = 10;
  return sp;
}

let ringGeo, ringMat;
/** a glowing item lying on the ground: its emoji floats and turns above a soft ring of light */
export function pickup(icon) {
  const root = new THREE.Group();
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyphTex(icon, { font: EMOJI, badge: true }), transparent: true }));
  sp.scale.setScalar(0.8); sp.position.y = 0.85; root.add(sp);
  ringGeo = ringGeo || new THREE.RingGeometry(0.28, 0.5, 28).rotateX(-Math.PI / 2);
  ringMat = ringMat || new THREE.MeshBasicMaterial({ color: '#ffe08a', transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(ringGeo, ringMat); ring.position.y = 0.05; root.add(ring);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.22, 2.4, 10, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe8a0', transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  beam.position.y = 1.2; root.add(beam);
  const off = Math.random() * 6;
  root.userData.keep = true;
  return { root, update(t) { sp.position.y = 0.85 + Math.sin(t * 2.4 + off) * 0.1; ring.scale.setScalar(1 + Math.sin(t * 3 + off) * 0.12); } };
}

/** a quest object with an off and an on state. `kind`: lantern, fire, bell, scarecrow, stone, koi, flag, candle, altar, chest */
export function thing(kind) {
  const root = new THREE.Group(); root.userData.keep = true;
  let state = false, anim = 0;
  const o = { root, kind, height: 1.4, get on() { return state; } };
  const glowM = () => new THREE.MeshBasicMaterial({ color: '#3a3028' });
  switch (kind) {
    case 'lantern': {
      const K = kit(), st = '#a8a49c';
      for (const [w, h, y] of [[0.7, 0.2, 0.1], [0.24, 1.0, 0.7], [0.6, 0.14, 1.27], [0.48, 0.44, 1.55], [0.86, 0.16, 1.85]]) K.box(w, h, w, 0, y, 0, st);
      K.cone(0.5, 0.36, 0, 2.1, 0, st, 4, 0, Math.PI / 4);
      root.add(K.mesh(0.025));
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.28, 0.5), glowM()); glow.position.y = 1.55; root.add(glow);
      const L = new THREE.PointLight('#ffb35a', 0, 7, 2); L.position.y = 1.6; root.add(L);
      o.height = 2.4;
      o.set = v => { glow.material.color.set(v ? '#ffc070' : '#3a3028'); L.intensity = v ? 3 : 0; };
      break;
    }
    case 'candle': {
      const K = kit(); K.box(0.6, 0.4, 0.6, 0, 0.2, 0, '#7a766e'); K.cyl(0.08, 0.08, 0.36, 0, 0.58, 0, '#f4ecd8', 8);
      root.add(K.mesh(0.02));
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffd070' })); f.scale.y = 1.8; f.position.y = 0.86; f.visible = false; root.add(f);
      const L = new THREE.PointLight('#8ab0ff', 0, 5, 2); L.position.y = 1; root.add(L);
      o.height = 1.2;
      o.set = v => { f.visible = v; f.material.color.set('#9ac0ff'); L.intensity = v ? 1.6 : 0; };
      o.tick = (dt, t) => { f.scale.y = 1.8 + Math.sin(t * 17) * 0.25; };
      break;
    }
    case 'fire': {
      const K = kit(); for (let k = 0; k < 4; k++) K.cyl(0.1, 0.1, 1.2, 0, 0.12, 0, '#3a2a20', 6, Math.PI / 2, k * 0.8, 0);
      root.add(K.mesh(0.02));
      const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { t: { value: Math.random() * 10 } },
        vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `uniform float t; varying vec2 vU; float n(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
          float sn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(n(i), n(i+vec2(1,0)), f.x), mix(n(i+vec2(0,1)), n(i+vec2(1,1)), f.x), f.y); }
          void main(){ vec2 u = vU; float w = 1.0 - abs(u.x - 0.5) * 2.0; float k = sn(vec2(u.x * 4.0, u.y * 3.0 - t * 3.0)) * 0.6 + sn(vec2(u.x * 9.0, u.y * 6.0 - t * 5.0)) * 0.4;
          float f = smoothstep(0.0, 0.6, w * (1.0 - u.y) * 1.6 - k * 0.6); vec3 c = mix(vec3(1.0,0.25,0.05), vec3(1.0,0.85,0.4), f); gl_FragColor = vec4(c * f, f); }`,
      });
      const fl = new THREE.Group(); for (let k = 0; k < 2; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.6), mat); m.position.y = 1.2; m.rotation.y = k * Math.PI / 2; fl.add(m); } root.add(fl);
      const L = new THREE.PointLight('#ff7a2a', 5, 8, 2); L.position.y = 1.2; root.add(L);
      o.height = 2.8;
      o.set = v => { fl.visible = !v; L.intensity = v ? 0 : 5; };       // "on" means put out
      o.tick = (dt, t) => { mat.uniforms.t.value += dt; if (!state) L.intensity = 5 * (0.8 + Math.random() * 0.3); };
      break;
    }
    case 'bell': {
      const K = kit(); for (const s of [-1, 1]) K.box(0.14, 2.4, 0.14, s * 0.7, 1.2, 0, '#5a3a26'); K.box(1.7, 0.16, 0.2, 0, 2.35, 0, '#5a3a26');
      for (const s of [-1, 1]) K.box(1.9, 0.08, 0.6, 0, 2.6, s * 0.2, '#3a3a48', s * -0.5);
      root.add(K.mesh(0.025));
      const bell = new THREE.Group(); bell.position.y = 2.25; root.add(bell);
      const B = kit(); B.cyl(0.18, 0.32, 0.6, 0, -0.38, 0, '#a8803a', 14); B.cyl(0.04, 0.04, 0.2, 0, -0.04, 0, '#3a2a1e', 6); bell.add(B.mesh(0.02));
      o.height = 3.0;
      o.set = v => { if (v) anim = 2.4; };
      o.tick = (dt, t) => { if (anim > 0) { anim -= dt; bell.rotation.z = Math.sin(anim * 9) * 0.5 * Math.min(1, anim); } };
      break;
    }
    case 'scarecrow': {
      const g = new THREE.Group(), K = kit();
      K.cyl(0.04, 0.04, 1.6, 0, 0.8, 0, '#6a4a32', 6); K.cyl(0.03, 0.03, 1.2, 0, 1.25, 0, '#6a4a32', 6, 0, 0, Math.PI / 2);
      K.cone(0.42, 0.26, 0, 1.78, 0, '#c8a868', 12); K.box(0.55, 0.55, 0.22, 0, 1.25, 0, '#8a6a4a'); K.sph(0.17, 0, 1.6, 0.02, '#e8d8b0', 1, 1, 1, 1);
      g.add(K.mesh(0.015)); root.add(g);
      g.rotation.z = Math.PI / 2 - 0.15; g.position.set(-0.75, 0.15, 0);
      o.height = 2.2;
      o.set = v => { if (v) anim = 0.6; else { g.rotation.z = Math.PI / 2 - 0.15; g.position.set(-0.75, 0.15, 0); } };
      o.tick = dt => { if (anim > 0 || (state && g.rotation.z > 0)) { anim = Math.max(0, anim - dt); const k = 1 - anim / 0.6; g.rotation.z = (Math.PI / 2 - 0.15) * (1 - k); g.position.set(-0.75 * (1 - k), 0.15 * (1 - k), 0); } };
      break;
    }
    case 'stone': {
      const K = kit(); K.rock(0.55, 0, 0.75, 0, '#7a7a72', 0.8, 1.5, 0.7); K.cyl(0.5, 0.5, 0.1, 0, 1.0, 0, '#d8c070', 10);
      for (let k = 0; k < 3; k++) K.box(0.08, 0.3, 0.02, -0.25 + k * 0.25, 0.85, 0.42, '#ffffff');
      const m = K.mesh(0.03); root.add(m);
      const glow = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.95, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffe08a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.position.y = 0.06; root.add(glow);
      o.height = 1.8;
      o.set = v => { glow.material.opacity = v ? 0.7 : 0; };
      o.tick = (dt, t) => { if (state) glow.material.opacity = 0.5 + Math.sin(t * 2) * 0.2; };
      break;
    }
    case 'koi': {
      const K = kit(); K.sph(0.22, 0, 0.16, 0, '#f4f0e8', 1.8, 0.8, 0.9, 1); K.sph(0.12, -0.12, 0.26, 0, '#e8582a', 1.2, 0.6, 0.9, 1); K.sph(0.1, 0.18, 0.24, 0.05, '#e8582a', 1, 0.6, 0.9, 1);
      K.cone(0.16, 0.26, -0.48, 0.16, 0, '#e8582a', 6, 0, 0, Math.PI / 2);
      const m = K.mesh(0.015); root.add(m);
      o.height = 0.9;
      o.set = v => { m.visible = !v; };
      o.tick = (dt, t) => { if (!state) { m.position.y = Math.abs(Math.sin(t * 6 + root.position.x)) * 0.25; m.rotation.z = Math.sin(t * 12 + root.position.z) * 0.4; } };
      break;
    }
    case 'flag': {
      const g = new THREE.Group(), K = kit();
      K.cyl(0.05, 0.05, 3.6, 0, 1.8, 0, '#2a2024', 6); K.box(0.9, 1.3, 0.03, 0.47, 2.9, 0, '#1a1a22'); K.box(0.36, 0.36, 0.035, 0.47, 2.9, 0, '#e8e4dc');
      g.add(K.mesh(0.015)); root.add(g);
      o.height = 3.8;
      o.set = v => { if (v) anim = 0.7; else { g.rotation.z = 0; g.visible = true; } };
      o.tick = (dt, t) => { if (!state) g.children[0].rotation.y = Math.sin(t * 2 + root.position.x) * 0.15; if (anim > 0) { anim -= dt; g.rotation.z = (1 - anim / 0.7) * 1.5; if (anim <= 0) g.visible = false; } };
      break;
    }
    case 'altar': {
      const K = kit(); K.box(1.2, 0.7, 0.8, 0, 0.35, 0, '#8a867c'); K.box(1.4, 0.1, 1.0, 0, 0.75, 0, '#6a665e');
      root.add(K.mesh(0.025));
      const bowl = new THREE.Group(), B = kit(); B.cyl(0.26, 0.16, 0.18, 0, 0.09, 0, '#c8322a', 14); for (let k = 0; k < 5; k++) B.sph(0.07, (k - 2) * 0.07, 0.2, (k % 2) * 0.05, '#f4f0ff', 1, 1, 1, 0);
      bowl.add(B.mesh(0.012)); bowl.position.y = 0.8; bowl.visible = false; root.add(bowl);
      const glow = new THREE.PointLight('#a8d8ff', 0, 6, 2); glow.position.y = 1.2; root.add(glow);
      o.height = 1.6;
      o.set = v => { bowl.visible = v; glow.intensity = v ? 2.2 : 0; };
      break;
    }
    case 'chest': {
      const K = kit(); K.box(1.0, 0.55, 0.7, 0, 0.28, 0, '#8a5a32'); for (const s of [-1, 1]) K.box(0.08, 0.57, 0.72, s * 0.36, 0.28, 0, '#3a2a1e'); K.box(0.16, 0.2, 0.05, 0, 0.42, 0.37, '#d9a441');
      root.add(K.mesh(0.02));
      const lid = new THREE.Group(); lid.position.set(0, 0.56, -0.35); root.add(lid);
      const L = kit(); L.box(1.0, 0.18, 0.7, 0, 0.09, 0.35, '#9a6a3a'); for (const s of [-1, 1]) L.box(0.08, 0.2, 0.72, s * 0.36, 0.09, 0.35, '#3a2a1e'); lid.add(L.mesh(0.02));
      o.height = 1.2;
      o.set = v => { if (v) anim = 0.5; else lid.rotation.x = 0; };
      o.tick = dt => { if (anim > 0 || (state && lid.rotation.x > -1.2)) { anim = Math.max(0, anim - dt); lid.rotation.x = -1.3 * (1 - anim / 0.5); } };
      break;
    }
  }
  o.turn = (v, instant) => { state = v; o.set(v); if (instant) { anim = 0; o.tick && o.tick(0, 0); if (kind === 'flag' && v) root.visible = false; if (kind === 'scarecrow' && v) { const g = root.children[0]; g.rotation.z = 0; g.position.set(0, 0, 0); } if (kind === 'chest' && v) root.children[1].rotation.x = -1.3; } };
  o.update = (dt, t) => { o.tick && o.tick(dt, t); };
  o.set(false);
  return o;
}

let _dot;
/** a soft round dot, so particles aren't squares */
export function dotTex() {
  if (_dot) return _dot;
  const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d');
  const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
  return (_dot = new THREE.CanvasTexture(c));
}
/** a puff of sparkles (or smoke) at a spot, gone in a second */
export function burst(scene, x, y, z, { color = '#ffe08a', n = 26, speed = 3, life = 0.9, size = 0.16, up = 2 } = {}) {
  const pos = new Float32Array(n * 3), vel = [];
  for (let i = 0; i < n; i++) { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; const a = Math.random() * Math.PI * 2, e = Math.random(); vel.push([Math.cos(a) * speed * (0.4 + e * 0.6), up * (0.5 + Math.random()), Math.sin(a) * speed * (0.4 + e * 0.6)]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color, size, map: dotTex(), transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts);
  let t = 0;
  return dt => {
    t += dt; const a = g.attributes.position.array;
    for (let i = 0; i < n; i++) { a[i * 3] += vel[i][0] * dt; a[i * 3 + 1] += vel[i][1] * dt; a[i * 3 + 2] += vel[i][2] * dt; vel[i][1] -= 4 * dt; vel[i][0] *= 0.97; vel[i][2] *= 0.97; }
    g.attributes.position.needsUpdate = true; m.opacity = Math.max(0, 1 - t / life);
    if (t >= life) { scene.remove(pts); g.dispose(); m.dispose(); return false; }
    return true;
  };
}
