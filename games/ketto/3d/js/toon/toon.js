// Cartoon look: banded toon shading and ink outlines (an inflated back-face shell around each part).
import * as THREE from 'three';

let _grad;
export function gradient() {
  if (_grad) return _grad;
  const d = new Uint8Array([90, 170, 255, 255]);   // three light bands, the last one wide
  _grad = new THREE.DataTexture(d, 4, 1, THREE.RedFormat);
  _grad.minFilter = _grad.magFilter = THREE.NearestFilter;
  _grad.needsUpdate = true;
  return _grad;
}

const cache = new Map();
/** toon material in a hex color (cached) */
export function toon(hex, o = {}) {
  const k = hex + JSON.stringify(o);
  if (cache.has(k)) return cache.get(k);
  const m = new THREE.MeshToonMaterial({ color: new THREE.Color(hex), gradientMap: gradient(), ...o });
  cache.set(k, m);
  return m;
}

const inkCache = new Map();
/** outline shell material: pushes the surface out along its normals and draws only the back faces */
export function ink(width = 0.012, hex = '#1a1220') {
  const k = width + hex;
  if (inkCache.has(k)) return inkCache.get(k);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { w: { value: width }, col: { value: new THREE.Color(hex) }, fogColor: { value: new THREE.Color() }, fogNear: { value: 1 }, fogFar: { value: 1000 }, fogDensity: { value: 0 } },
    vertexShader: `uniform float w;
      #include <fog_pars_vertex>
      void main(){ vec3 p = position + normalize(normal) * w;
      #ifdef USE_INSTANCING
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
      #else
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      #endif
        gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
      }`,
    fragmentShader: `uniform vec3 col;
      #include <fog_pars_fragment>
      void main(){ gl_FragColor = vec4(col, 1.0);
      #include <fog_fragment>
      }`,
    fog: true,
  });
  m.userData.ink = true;
  inkCache.set(k, m);
  return m;
}

/** a toon-shaded mesh with an ink outline as a child */
export function part(geo, hex, { outline = 0.012, ink: inkHex, shadow = true, mat } = {}) {
  const m = new THREE.Mesh(geo, mat || toon(hex));
  m.castShadow = shadow;
  m.receiveShadow = true;
  if (outline > 0) {
    const o = new THREE.Mesh(geo, ink(outline, inkHex));
    o.castShadow = false;
    o.userData.outline = true;
    m.add(o);
  }
  return m;
}

/** a lathe (surface of revolution) from [radius, height] pairs */
export function lathe(profile, seg = 24, wobble = null) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  if (wobble) {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), y = p.getY(i);
      const a = Math.atan2(z, x), k = 1 + wobble(a, y);
      p.setXYZ(i, x * k, y, z * k);
    }
    g.computeVertexNormals();
  }
  return g;
}

/** several pieces merged into one toon mesh (one draw call, plus one for its outline).
 *  pieces: [geometry, Matrix4, hex color] */
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
let _vc;
/** the one vertex-colored toon material every merged mesh shares (so static scenery can be batched by material) */
export function vcToon() { return _vc || (_vc = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: gradient() })); }
export function merged(pieces, { outline = 0.03 } = {}) {
  const geos = pieces.map(([g, m, hex]) => {
    const q = (g.index ? g.toNonIndexed() : g.clone()).applyMatrix4(m);
    for (const k of Object.keys(q.attributes)) if (!['position', 'normal'].includes(k)) q.deleteAttribute(k);
    const c = new THREE.Color(hex), n = q.attributes.position.count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3);
    q.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return q;
  });
  const g = mergeGeometries(geos);
  const m = new THREE.Mesh(g, vcToon());
  m.castShadow = true; m.receiveShadow = true;
  if (outline > 0) { const o = new THREE.Mesh(g, ink(outline)); o.userData.outline = true; m.add(o); }
  return m;
}
