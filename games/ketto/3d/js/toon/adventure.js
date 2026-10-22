// Story mode's 3D world. Walk your fighter through 20 areas: talk to the townsfolk, follow each area's questline
// (fetch things, light lanterns, beat bandits), earn your way through the wall, defeat the boss, and take the
// north gate to the next area. The south gate leads back. Duels are the normal 2D game: `api.duel()` starts one
// and the game calls `resume(won)` after. Progress lives in `api.state()` and is written with `api.save()`.
import * as THREE from 'three';
import { makeChibi, villagerDef } from './chibi.js';
import { buildArea, AREAS } from './areas.js';
import { CHAPTERS, SUPPLIES, KEEPSAKES, needs as chapterNeeds } from './quests.js';
import { pickup, thing, marker, burst, glyphTex, EMOJI } from './things.js';
import { MAP, WALL_Z } from './town.js';

const CSS = `
.w3{position:absolute;inset:0;pointer-events:none;font-family:var(--f-display);color:var(--paper);z-index:5}
#world3d{position:absolute;inset:0;width:100%;height:100%;display:none}
body.w3d #world3d{display:block} body.w3d #game{visibility:hidden}
.w3 .qt{position:absolute;left:2cqw;top:2cqw;max-width:38cqw;padding:1.1cqw 3cqw 1.2cqw 1.4cqw;background:linear-gradient(90deg,rgba(18,7,9,.86),rgba(18,7,9,.62) 75%,rgba(18,7,9,0));border-left:.45cqw solid var(--gold)}
.w3 .qt .ch{font-size:1.05cqw;letter-spacing:.16em;color:var(--gold)}
.w3 .qt .goal{font-family:var(--f-body);font-size:1.8cqw;line-height:1.35;margin-top:.45cqw;text-shadow:.15cqw .15cqw 0 #000}
.w3 .qt .goal:before{content:'◆ ';color:var(--gold)}
.w3 .qt .sub{font-size:1.15cqw;letter-spacing:.08em;color:var(--paper);margin-top:.5cqw;opacity:.85}
.w3 .qt .sub:empty{display:none}
.w3 .qt.flash{animation:w3flash 1.2s}
@keyframes w3flash{0%,30%{background:linear-gradient(90deg,rgba(242,193,78,.7),rgba(242,193,78,.3) 75%,rgba(242,193,78,0))}}
.w3 .mm{position:absolute;right:2cqw;top:2cqw;width:15.5cqw;height:15.5cqw;border-radius:50%;box-shadow:0 0 0 .3cqw var(--line),0 0 0 .6cqw #000,0 .6cqw 1.4cqw rgba(0,0,0,.5);overflow:hidden;background:#1a1410}
.w3 .mm canvas{width:100%;height:100%;display:block}
.w3 .mmN{position:absolute;width:2.1cqw;height:2.1cqw;margin:-1.05cqw 0 0 -1.05cqw;border-radius:50%;background:var(--ink);box-shadow:0 0 0 .18cqw var(--line);font-size:1.05cqw;line-height:2.1cqw;text-align:center;color:var(--gold)}
.w3 .purse{position:absolute;right:2.4cqw;top:18.8cqw;font-size:1.5cqw;text-align:right;text-shadow:.15cqw .15cqw 0 #000;color:var(--gold);letter-spacing:.06em}
.w3 .purse .bf{display:flex;gap:.4cqw;justify-content:flex-end;margin-top:.4cqw;font-size:1.7cqw}
.w3 .purse .bf span{background:rgba(18,7,9,.8);box-shadow:inset 0 0 0 .15cqw var(--gold);padding:.15cqw .35cqw}
.w3 .area{position:absolute;left:0;right:0;top:27%;text-align:center;opacity:0;transition:opacity .8s;text-shadow:.35cqw .35cqw 0 #000}
.w3 .area.on{opacity:1}
.w3 .area small{display:block;font-size:1.5cqw;letter-spacing:.3em;color:var(--gold)}
.w3 .area b{display:block;font-size:4.8cqw;letter-spacing:.1em;margin-top:.6cqw}
.w3 .area i{display:block;font-style:normal;font-family:var(--f-body);font-size:1.7cqw;margin-top:1cqw;color:var(--paper);opacity:.95;padding:0 15%}
.w3 .prompt{position:absolute;left:50%;bottom:16%;transform:translateX(-50%);font-size:1.55cqw;letter-spacing:.1em;background:rgba(18,7,9,.88);padding:.8cqw 1.7cqw;box-shadow:inset 0 0 0 .22cqw var(--line);display:none;white-space:nowrap}
.w3 .prompt.warn{color:var(--muted)}
.w3 .talk{position:absolute;left:10%;right:10%;bottom:4.5%;background:rgba(18,7,9,.95);box-shadow:inset 0 0 0 .3cqw var(--line),0 .6cqw 0 rgba(0,0,0,.45);padding:2cqw 2.6cqw 2.2cqw;display:none;pointer-events:auto}
.w3 .talk .nm{position:absolute;top:-2.3cqw;left:2cqw;background:var(--gold);color:var(--ink);font-size:1.55cqw;padding:.5cqw 1.3cqw;letter-spacing:.1em}
.w3 .talk .nm small{font-size:.75em;opacity:.75;margin-left:.9cqw;letter-spacing:.06em}
.w3 .talk .tx{font-family:var(--f-body);font-size:2.2cqw;line-height:1.5;min-height:6.6cqw}
.w3 .talk .hn{position:absolute;right:2cqw;bottom:.9cqw;font-size:1.1cqw;color:var(--muted)}
.w3 .toasts{position:absolute;right:2cqw;top:24cqw;display:flex;flex-direction:column;align-items:flex-end;gap:.55cqw}
.w3 .toast{background:rgba(18,7,9,.9);box-shadow:inset 0 0 0 .2cqw var(--line);padding:.6cqw 1.2cqw;font-size:1.3cqw;letter-spacing:.05em;animation:w3in .25s ease-out;transition:opacity .5s}
.w3 .toast.gold{background:var(--gold);color:var(--ink);box-shadow:none}
.w3 .toast i{font-style:normal;font-size:1.6cqw;margin-right:.6cqw;vertical-align:-.1em}
@keyframes w3in{from{transform:translateX(3cqw);opacity:0}}
.w3 .help{position:absolute;left:2.2cqw;bottom:2cqw;font-size:1.0cqw;letter-spacing:.08em;color:var(--paper);opacity:.75;line-height:1.8;text-shadow:.15cqw .15cqw 0 #000}
.w3 .pause{position:absolute;inset:0;background:rgba(8,6,12,.75);display:none;align-items:center;justify-content:center;flex-direction:column;gap:1.6cqw;pointer-events:auto}
.w3 .pause b{font-size:4.4cqw;letter-spacing:.2em}
.w3 .pause span{font-size:1.6cqw;letter-spacing:.1em}
.w3 .fade{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .45s;pointer-events:none}
.w3 .menu{position:absolute;inset:3.5% 4%;background:rgba(14,6,8,.97);box-shadow:inset 0 0 0 .3cqw var(--line),0 0 0 .45cqw #000;display:none;pointer-events:auto;flex-direction:column}
.w3 .menu.on{display:flex}
.w3 .mtabs{display:flex;gap:.8cqw;padding:1.6cqw 2.2cqw 0;align-items:flex-end}
.w3 .mtab{font-size:1.75cqw;letter-spacing:.14em;padding:.85cqw 2cqw;color:var(--muted);background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 .18cqw #3a2a1a;cursor:pointer}
.w3 .mtab.on{color:var(--ink);background:var(--gold);box-shadow:none}
.w3 .mtab .kbd{font-size:.7em;margin-right:.5em}
.w3 .mryo{margin-left:auto;font-size:1.8cqw;color:var(--gold);letter-spacing:.06em}
.w3 .mbody{flex:1;display:flex;gap:2cqw;padding:1.8cqw 2.2cqw;min-height:0}
.w3 .mfoot{padding:1cqw 2.2cqw 1.3cqw;font-size:1.15cqw;color:var(--muted);letter-spacing:.08em;border-top:.15cqw solid #3a2a1a}
.w3 .mfoot .kbd{font-size:.9em}
.w3 .pane{background:rgba(255,255,255,.035);box-shadow:inset 0 0 0 .2cqw #3a2a1a;padding:1.6cqw 1.8cqw;overflow:hidden}
.w3 .ph{font-size:1.15cqw;letter-spacing:.18em;color:var(--gold);margin-bottom:1cqw}
.w3 .qtitle{font-size:2.5cqw;letter-spacing:.08em}
.w3 .qboss{font-family:var(--f-body);font-size:1.5cqw;color:var(--muted);margin:.3cqw 0 1.4cqw}
.w3 .qstep{display:flex;gap:1cqw;align-items:baseline;font-family:var(--f-body);font-size:1.55cqw;line-height:1.35;padding:.55cqw 0;border-bottom:.12cqw solid rgba(255,255,255,.06)}
.w3 .qstep b{font-family:var(--f-display);font-size:1.3cqw;width:2cqw;flex:none;text-align:center}
.w3 .qstep.done{color:var(--muted);text-decoration:line-through;text-decoration-color:rgba(179,154,122,.5)}
.w3 .qstep.done b{color:#7ac85a}
.w3 .qstep.cur{color:var(--paper)} .w3 .qstep.cur b{color:var(--gold)}
.w3 .qstep.cur em{display:block;font-style:normal;font-size:1.2cqw;color:var(--gold);margin-top:.2cqw}
.w3 .qstep.lock{color:#5a4a3a}
.w3 .jour{display:grid;grid-template-columns:repeat(5,1fr);gap:.5cqw}
.w3 .jc{font-size:.8cqw;letter-spacing:.04em;padding:.35cqw .2cqw;text-align:center;background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 .15cqw #3a2a1a;color:#6a5a4a;line-height:1.25;white-space:nowrap;overflow:hidden}
.w3 .jc b{display:block;font-size:1.3cqw}
.w3 .jc.done{color:var(--paper);box-shadow:inset 0 0 0 .15cqw #5a8a3a} .w3 .jc.done b{color:#7ac85a}
.w3 .jc.cur{color:var(--ink);background:var(--gold);box-shadow:none}
.w3 .side div{display:flex;justify-content:space-between;font-family:var(--f-body);font-size:1.35cqw;line-height:2}
.w3 .side span{color:var(--gold)}
.w3 .grid{display:grid;grid-template-columns:repeat(6,1fr);gap:.8cqw;align-content:start;overflow:hidden}
.w3 .sec{grid-column:1/-1;font-size:1.1cqw;color:var(--gold);letter-spacing:.18em;margin-top:.5cqw}
.w3 .slot{aspect-ratio:1;background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 .2cqw #3a2a1a;display:flex;align-items:center;justify-content:center;font-size:3.4cqw;position:relative;cursor:pointer;font-family:${'"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'}}
.w3 .slot.sel{box-shadow:inset 0 0 0 .32cqw var(--gold);background:rgba(242,193,78,.14)}
.w3 .slot.empty{cursor:default;opacity:.35}
.w3 .slot b{position:absolute;right:.45cqw;bottom:.25cqw;font-size:1.15cqw;font-family:var(--f-display);color:var(--paper);text-shadow:.12cqw .12cqw 0 #000}
.w3 .det .ic{font-size:6.5cqw;line-height:1;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif}
.w3 .det .nm{font-size:2.1cqw;letter-spacing:.06em;margin-top:1cqw}
.w3 .det .kd{font-size:1.1cqw;letter-spacing:.16em;color:var(--gold);margin-top:.4cqw}
.w3 .det .ds{font-family:var(--f-body);font-size:1.6cqw;line-height:1.5;margin-top:1.2cqw;color:var(--paper)}
.w3 .det .act{display:inline-block;margin-top:1.6cqw;font-size:1.4cqw;letter-spacing:.1em;background:var(--gold);color:var(--ink);padding:.6cqw 1.4cqw;cursor:pointer}
.w3 .det .act.off{background:#3a2a1a;color:var(--muted);cursor:default}
.w3 .mapw{flex:1;display:flex;align-items:center;justify-content:center;min-height:0}
.w3 .mapw canvas{height:100%;max-height:100%;box-shadow:0 0 0 .25cqw var(--line);image-rendering:auto}
.w3 .legend{width:20cqw;font-family:var(--f-body);font-size:1.35cqw;line-height:2.1}
.w3 .legend i{display:inline-block;width:2.2cqw;font-style:normal;text-align:center;font-family:var(--f-display)}
.w3 .shop{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:62cqw;background:rgba(14,6,8,.97);box-shadow:inset 0 0 0 .3cqw var(--line),0 0 0 .45cqw #000;display:none;pointer-events:auto;padding:2cqw 2.4cqw}
.w3 .shop.on{display:block}
.w3 .shop h3{margin:0;font-size:2.2cqw;letter-spacing:.1em;font-weight:400;display:flex}
.w3 .shop h3 span{margin-left:auto;color:var(--gold)}
.w3 .shop p{font-family:var(--f-body);font-size:1.5cqw;color:var(--muted);margin:.6cqw 0 1.4cqw}
.w3 .srow{display:flex;align-items:center;gap:1.4cqw;padding:.8cqw 1cqw;box-shadow:inset 0 0 0 .18cqw #3a2a1a;margin-bottom:.7cqw;cursor:pointer}
.w3 .srow.sel{box-shadow:inset 0 0 0 .3cqw var(--gold);background:rgba(242,193,78,.12)}
.w3 .srow .ic{font-size:3cqw;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif}
.w3 .srow .tx{flex:1} .w3 .srow .tx b{display:block;font-size:1.6cqw;font-weight:400;letter-spacing:.06em} .w3 .srow .tx span{font-family:var(--f-body);font-size:1.3cqw;color:var(--muted)}
.w3 .srow .pr{font-size:1.6cqw;color:var(--gold)} .w3 .srow .own{font-size:1.1cqw;color:var(--muted);width:6cqw;text-align:right}
.w3 .srow.poor .pr{color:#8a4a3a}
.w3 .shop .ft{font-size:1.15cqw;color:var(--muted);letter-spacing:.08em;margin-top:1.2cqw}
`;

const tmp = new THREE.Vector3();
const TAU = Math.PI * 2;
const wrap = a => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
const MERCHANTS = ['TOKU', 'MARU', 'AUNTIE SUE', 'GONBEI', 'OLD HANA', 'KICHI', 'TAMA', 'ROKU', 'FUKUME', 'SEN-SAN'];
const AFTER = ['You did it! The whole town is talking about you.', 'Peace at last. Thank you, traveler.', 'Will you stay a while? No? Then good road to you.', 'I told everyone you would win. Well, I told my cat.'];

export class Adventure {
  constructor(host, before, api) {
    this.api = api;
    if (!document.getElementById('w3css')) { const st = document.createElement('style'); st.id = 'w3css'; st.textContent = CSS; document.head.appendChild(st); }
    this.canvas = document.createElement('canvas'); this.canvas.id = 'world3d';
    host.insertBefore(this.canvas, before);
    const r = this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    r.setPixelRatio(Math.min(2, devicePixelRatio));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    this.cam = new THREE.PerspectiveCamera(46, 16 / 9, 0.1, 900);
    this.ui = document.createElement('div'); this.ui.className = 'w3';
    this.ui.innerHTML = `<div class="qt"><div class="ch"></div><div class="goal"></div><div class="sub"></div></div>
      <div class="mm"><canvas width="320" height="320"></canvas></div><div class="mmN">N</div>
      <div class="purse"><div class="ry"></div><div class="bf"></div></div>
      <div class="area"><small></small><b></b><i></i></div><div class="prompt"></div><div class="toasts"></div>
      <div class="talk"><div class="nm"></div><div class="tx"></div><div class="hn"></div></div>
      <div class="help">WASD MOVE · SHIFT RUN · SPACE JUMP · E TALK / USE<br>TAB MENU · I ITEMS · J QUESTS · DRAG TO TURN · ESC PAUSE</div>
      <div class="menu"><div class="mtabs"></div><div class="mbody"></div><div class="mfoot"></div></div>
      <div class="shop"></div>
      <div class="pause"><b>PAUSED</b><span><span class="kbd">ESC</span> BACK TO THE ROAD</span><span><span class="kbd">TAB</span> QUESTS AND ITEMS</span><span><span class="kbd">Q</span> LEAVE STORY</span></div>
      <div class="fade"></div>`;
    host.appendChild(this.ui);
    this.el = sel => this.ui.querySelector(sel);
    this.mm = this.el('.mm canvas').getContext('2d');
    this.taps = new Set();
    this.camYaw = 0; this.camPitch = 0.34; this.camDist = 8; this.camCur = 8;
    this.clock = new THREE.Clock();
    this.fx = [];
    // drag to turn the camera, wheel to zoom
    let drag = null;
    this.canvas.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY]; });
    addEventListener('pointerup', () => { drag = null; });
    addEventListener('pointermove', e => { if (!drag || !this.active) return; this.camYaw -= (e.clientX - drag[0]) * 0.006; this.camPitch = Math.min(1.1, Math.max(0.08, this.camPitch + (e.clientY - drag[1]) * 0.004)); drag = [e.clientX, e.clientY]; this.camManual = 1.5; });
    this.canvas.addEventListener('wheel', e => { if (!this.active) return; this.camDist = Math.min(13, Math.max(4.5, this.camDist + Math.sign(e.deltaY) * 0.8)); e.preventDefault(); }, { passive: false });
    // menus work with the mouse too
    this.el('.menu').addEventListener('click', e => {
      const t = e.target.closest('[data-tab]'); if (t) { this.menuTab = t.dataset.tab; this.renderMenu(); this.api.sfx('move'); return; }
      const s = e.target.closest('[data-slot]'); if (s) { this.menuSel = +s.dataset.slot; this.renderMenu(); this.api.sfx('move'); return; }
      if (e.target.closest('.act')) this.useSelected();
    });
    this.el('.shop').addEventListener('click', e => { const s = e.target.closest('[data-row]'); if (s) { const k = +s.dataset.row; if (k === this.shopSel) this.buy(); else { this.shopSel = k; this.renderShop(); } } });
    this.el('.talk').addEventListener('click', () => { if (this.talk) this.advanceTalk(); });
    new ResizeObserver(() => this.resize()).observe(host);
    this.resize();
  }

  resize() {
    const r = this.canvas.parentElement.getBoundingClientRect();
    if (!r.width) return;
    this.renderer.setSize(r.width, r.height, false);
    this.cam.aspect = r.width / r.height; this.cam.updateProjectionMatrix();
  }

  /* ================= saving ================= */
  get S() { return this.api.state(); }
  get Q() {
    const S = this.S, lv = this.level;
    if (!S.ch[lv]) {
      // a chapter beaten before the quests existed keeps its north gate open, but its questline (and its boss) are there to play
      S.ch[lv] = { step: 0, phase: 'meet', got: [], used: [], beat: [], boss: false, legacy: this.api.cleared() >= lv };
      const st = CHAPTERS[lv - 1].chain[0]; if (st && !st.npc) S.ch[lv].phase = 'task';
    }
    return S.ch[lv];
  }
  save() { this.api.save(); }

  /* ================= entering an area ================= */
  /** go to story level lv (1-20) as fighter `def`, arriving at the south gate ('S') or the north gate ('N') */
  enter(lv, def, from = 'S') {
    this.dispose();
    this.level = lv; this.def = def; this.from = from;
    const C = this.C = CHAPTERS[lv - 1], A = this.A = AREAS[lv - 1], api = this.api;
    this.story = api.story(lv);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(A.fog[0], A.fog[1], A.fog[2]);
    this.scene.background = new THREE.Color(A.fog[0]);
    this.world = new THREE.Group(); this.scene.add(this.world);
    const t0 = performance.now();
    this.L = buildArea(this.world, lv - 1, chapterNeeds(lv - 1), C.pois);
    this.buildMs = Math.round(performance.now() - t0);
    this.P = this.L.plan;
    const hemi = new THREE.HemisphereLight(A.hemi[0], A.hemi[1], A.hemi[2]); hemi.userData.base = A.hemi[2];
    this.scene.add(hemi); this.scene.userData.hemi = hemi;
    const sun = this.sun = new THREE.DirectionalLight(A.sun[0], A.sun[1]);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 100 });
    sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
    this.sunOff = new THREE.Vector3(...A.sun[2]).normalize().multiplyScalar(45);
    this.scene.add(sun, sun.target);
    this.buildColliders();
    // you
    this.pc = makeChibi(def); this.scene.add(this.pc.root);
    const [sx, sz, syaw] = this.P.start[from] || this.P.start.S;
    this.p = { x: sx, z: sz, y: this.L.height(sx, sz), vy: 0, yaw: syaw, ground: true, speed: 0, fwd: 0 };
    this.camYaw = syaw === 0 ? Math.PI : 0; this.camManual = 0; this.camCur = this.camDist;
    this.pc.root.position.set(sx, this.p.y, sz); this.pc.root.rotation.y = syaw;
    // everything that lives here
    this.actors = []; this.pickups = []; this.things = []; this.fx = [];
    this.allocate();
    this.spawnPeople();
    this.spawnThings();
    this.spawnTask();
    // the gates
    const Q = this.Q;
    this.setSeal('S', lv > 1);
    this.setSeal('N', Q.boss || Q.legacy);
    if (this.opened()) this.openBarrier(true);
    // the waypoint over whatever the quest wants next
    this.way = new THREE.Sprite(new THREE.SpriteMaterial({ map: diamondTex(), depthTest: false, transparent: true, sizeAttenuation: false }));
    this.way.scale.set(0.035, 0.05, 1); this.way.renderOrder = 20; this.scene.add(this.way);
    this.talk = null; this.paused = false; this.menuOpen = false; this.shopOpen = false; this.active = true;
    this.el('.talk').style.display = 'none'; this.el('.pause').style.display = 'none'; this.el('.menu').classList.remove('on'); this.el('.shop').classList.remove('on');
    this.ui.style.display = '';
    this.banner(this.story.name, 'CHAPTER ' + lv + ' · ' + this.story.stage, from === 'N' ? 'You walk back through the gate.' : this.story.text);
    this.objective();
    this.purse();
    document.body.classList.add('w3d');
    this.clock.getDelta();
    this.fadeIn();
  }

  dispose() {
    if (!this.scene) return;
    // free the old area's geometry and its ground texture (glyph textures and materials are shared, so they stay)
    this.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    const ground = this.world && this.world.children.find(o => o.material && o.material.map && o.material.map.isCanvasTexture);
    if (ground) { ground.material.map.dispose(); ground.material.dispose(); }
    this.renderer.renderLists.dispose();
    this.scene = null;
  }

  buildColliders() {
    this.cg = new Map(); this.stamp = 0;
    for (const c of this.L.colliders) this.addCol(c);
  }
  addCol(c) {
    c.off = false;
    if (c.box && c.c == null) { c.c = Math.cos(c.ry || 0); c.s = Math.sin(c.ry || 0); }
    const R = c.box ? Math.hypot(c.hw, c.hd) : c.r;
    for (let i = Math.floor((c.x - R) / 8); i <= Math.floor((c.x + R) / 8); i++) for (let j = Math.floor((c.z - R) / 8); j <= Math.floor((c.z + R) / 8); j++) {
      const k = i + ',' + j; let a = this.cg.get(k); if (!a) this.cg.set(k, a = []); if (!a.includes(c)) a.push(c);
    }
  }
  colsNear(x, z, rad, fn) {
    const st = ++this.stamp;
    for (let i = Math.floor((x - rad) / 8); i <= Math.floor((x + rad) / 8); i++) for (let j = Math.floor((z - rad) / 8); j <= Math.floor((z + rad) / 8); j++) {
      const a = this.cg.get(i + ',' + j); if (!a) continue;
      for (const c of a) { if (c._st === st || c.off) continue; c._st = st; fn(c); }
    }
  }

  /** where each step's things go (fixed per area, so they are always in the same place) */
  allocate() {
    const it = this.L.items, ptr = { A: 0, B: 0, wild: 0, road: 0, town: 0, river: 0 }, road = this.L.spots.road;
    const take = at => (it[at] && it[at][ptr[at]++]) || road[(ptr[at]++) % road.length];
    this.slots = this.C.chain.map(st => { const t = st.get || st.use; return t ? Array.from({ length: t.n }, () => take(t.at)) : null; });
    this.extra = { ryo: [take('wild'), take('wild'), take('wild')], chest: take('town') };
  }

  /** where a person stands */
  spotFor(at, used) {
    const sp = this.L.spots, P = this.P;
    used[at] = (used[at] || 0);
    const k = used[at]++;
    switch (at) {
      case 'house': return sp.house[k] || sp.plaza[k % 6];
      case 'plaza': return sp.plaza[(k * 2 + 1) % 6];
      case 'shop': return sp.shop || sp.plaza[0];
      case 'road': return sp.road[(k * 3 + 2) % sp.road.length];
      case 'A': case 'B': { const s = sp[at]; return [s[0], s[1] - k * 2.2]; }
      case 'barrier': return [sp.barrier[0] + k * 1.6 * P.gs, sp.barrier[1]];
      default: return sp[at] || sp.plaza[0];
    }
  }
  foeSpot(at) {
    const P = this.P, sp = this.L.spots;
    if (at === 'A' || at === 'B') { const p = P.pois[at]; return [p.x + p.face * 2.2, p.z - 1.6]; }
    if (at === 'barrier') return [P.lx - P.gs * 1.2, WALL_Z + 3.0];
    if (at === 'road') return sp.road[4];
    if (at === 'town') return [P.plaza.x + 4, P.plaza.z - 3];
    return sp[at] || sp.road[4];
  }

  spawnPeople() {
    const lv = this.level, C = this.C, api = this.api, sp = this.L.spots, used = {};
    // the quest's cast
    for (const [id, n] of Object.entries(C.npcs)) {
      const [x, z] = this.spotFor(n.at, used);
      const self = C.chain.find(s => s.npc === id && s.fight && s.fight.self);
      const def = self || n.look === 'fighter' ? api.foe(lv, id, n.name.split(' ').pop(), (self && self.fight.title) || n.title) : villagerDef(lv * 31 + id.length * 7 + id.charCodeAt(0), n.look);
      this.addActor({ kind: 'npc', id, def, x, z, name: n.name, title: n.title, npc: n, shop: n.at === 'shop' });
    }
    // the shopkeeper (unless someone in the cast keeps the shop)
    if (!Object.values(C.npcs).some(n => n.at === 'shop') && sp.shop) {
      const [x, z] = sp.shop;
      this.addActor({ kind: 'npc', id: 'merchant', def: villagerDef(lv * 13 + 5, 'merchant'), x, z, name: 'MERCHANT ' + MERCHANTS[lv % MERCHANTS.length], title: 'Shopkeeper', shop: true, npc: { idle: [] } });
    }
    // townsfolk
    const homes = sp.homes.slice().sort((a, b) => ((a[0] * 7 + a[1] * 3) % 5) - ((b[0] * 7 + b[1] * 3) % 5)).slice(0, Math.min(10, 4 + (this.A.village || 3)));
    homes.forEach(([x, z], k) => this.addActor({ kind: 'villager', def: villagerDef(lv * 17 + k, k % 5 === 4 ? 'child' : k % 7 === 3 ? 'elder' : 'villager'), x, z, lines: api.gossip(lv, k), name: 'VILLAGER', title: '' }));
    // wandering duelists on the road (optional fights for ryo)
    const Q = this.Q;
    this.story.challengers.forEach((cd, k) => {
      const id = 'duel' + k; if (Q.beat.includes(id)) return;
      const [x, z] = sp.road[k ? 6 : 1];
      this.addActor({ kind: 'duelist', id, def: cd.def, x, z, fight: cd, lines: [api.battleLine(cd.def, this.def)], name: cd.def.name, title: cd.def.title || 'Wandering duelist' });
    });
    // the boss, until beaten
    if (!Q.boss) {
      const [bx, bz] = sp.boss;
      this.boss = this.addActor({ kind: 'boss', id: 'boss', def: this.story.boss.def, x: bx, z: bz, fight: this.story.boss, lines: this.story.boss.lines, name: this.story.boss.def.name, title: 'Master of ' + C.landmark });
      this.boss.yaw = 0;
    } else this.boss = null;
  }

  /** the foe for the current step, the pickups for it, and quest objects for every step */
  spawnTask() {
    const Q = this.Q, st = this.curStep(), si = Q.step;
    // a fresh foe if this step needs one
    if (st && st.fight && !st.fight.self && !Q.beat.includes('s' + si) && !this.actors.some(a => a.id === 's' + si && !a.gone)) {
      const [x, z] = this.foeSpot(st.fight.at);
      const def = this.api.foe(this.level, 's' + si, st.fight.name, st.fight.title);
      this.addActor({ kind: 'foe', id: 's' + si, def, x, z, fight: { def, t: this.story.boss.t * 0.75 }, lines: st.fight.say || [this.api.battleLine(def, this.def)], name: st.fight.name, title: st.fight.title });
    }
    // pickups appear once you have the task
    if (st && st.get && Q.phase === 'task') {
      const ic = this.itemInfo(this.qid(st.get.item));
      this.slots[si].forEach(([x, z], k) => { const id = 's' + si + ':' + k; if (Q.got.includes(id) || this.pickups.some(p => p.id === id)) return; this.addPickup({ id, x, z, icon: ic.icon, item: this.qid(st.get.item), step: si }); });
    }
  }
  spawnThings() {
    const Q = this.Q;
    this.C.chain.forEach((st, si) => {
      if (!st.use) return;
      this.slots[si].forEach(([x, z], k) => {
        const id = 's' + si + ':' + k, t = thing(st.use.obj);
        t.id = id; t.step = si; t.verb = st.use.verb || 'USE';
        t.root.position.set(x, this.L.height(x, z), z); t.root.rotation.y = (k * 1.7) % TAU;
        this.world.add(t.root);
        if (si < Q.step || Q.used.includes(id)) t.turn(true, true);
        t.done = t.on;
        this.things.push(t);
        if (!['koi', 'flag', 'fire'].includes(st.use.obj) || !t.on) this.addColAt(t, x, z, st.use.obj);
      });
    });
    // ryo pouches and a treasure chest to find
    this.extra.ryo.forEach(([x, z], k) => { const id = 'ryo' + k; if (!Q.got.includes(id)) this.addPickup({ id, x, z, icon: '💰', ryo: 12 + ((this.level * 7 + k * 5) % 14) }); });
    { const [x, z] = this.extra.chest, t = thing('chest'); t.id = 'chest'; t.verb = 'OPEN'; t.root.position.set(x, this.L.height(x, z), z); t.root.rotation.y = this.level; this.world.add(t.root);
      if (Q.used.includes('chest')) t.turn(true, true); t.done = t.on; this.things.push(t); this.addColAt(t, x, z, 'chest'); }
    // a few lights at most (every light costs every pixel)
    let lights = this.L.lights.length;
    for (const t of this.things) t.root.traverse(o => { if (o.isPointLight) { if (lights >= 9) o.parent.remove(o); else lights++; } });
  }
  addColAt(t, x, z, kind) {
    const r = { lantern: 0.45, bell: 0.5, stone: 0.6, altar: 0.8, chest: 0.6, candle: 0.4, scarecrow: 0.3, fire: 0.7 }[kind];
    if (!r) return;
    t.col = { x, z, r }; this.addCol(t.col);
  }

  addActor(o) {
    const ch = makeChibi(o.def);
    const a = { ...o, ch, home: [o.x, o.z], yaw: Math.atan2(this.p.x - o.x, this.p.z - o.z) || 0, wander: Math.random() * 6, gone: false };
    ch.root.position.set(o.x, this.L.height(o.x, o.z), o.z);
    ch.root.rotation.y = a.yaw;
    this.scene.add(ch.root);
    this.actors.push(a);
    return a;
  }
  addPickup(o) {
    const pk = pickup(o.icon);
    pk.root.position.set(o.x, this.L.height(o.x, o.z), o.z);
    this.world.add(pk.root);
    const p = { ...o, pk };
    this.pickups.push(p);
    return p;
  }
  setMarker(a, text, color, scale = 0.5) {
    if (a.mkText === text + color) return;
    if (a.marker) { a.ch.root.remove(a.marker); a.marker = null; }
    a.mkText = text + color;
    if (!text) return;
    a.marker = marker(text, color, scale); a.marker.position.y = a.ch.height + 0.45; a.ch.root.add(a.marker);
  }

  /* ================= the quest ================= */
  curStep() { const s = this.Q.step; return s < this.C.chain.length ? this.C.chain[s] : null; }
  opened() { const Q = this.Q, ch = this.C.chain; return Q.boss || Q.step >= ch.length || ch.slice(0, Q.step).some(s => s.open); }
  qid(k) { return 'c' + this.level + '.' + k; }
  itemInfo(id) {
    if (SUPPLIES[id]) return { ...SUPPLIES[id], kind: 'supply' };
    if (id[0] === 'k') { const k = KEEPSAKES[+id.slice(1) - 1]; return { name: k[0], icon: k[1], desc: k[2], kind: 'keepsake' }; }
    const m = /^c(\d+)\.(.+)$/.exec(id);
    if (m) { const it = CHAPTERS[+m[1] - 1].items[m[2]]; if (it) return { name: it[0], icon: it[1], desc: it[2], kind: 'quest' }; }
    return { name: id, icon: '❔', desc: '', kind: 'quest' };
  }
  addItem(id, n = 1, quiet) {
    const inv = this.S.inv; inv[id] = (inv[id] || 0) + n;
    if (!quiet) { const it = this.itemInfo(id); this.toast(it.icon, '+ ' + it.name + (n > 1 ? ' ×' + n : '')); }
  }
  removeItem(id, n = 1) { const inv = this.S.inv; inv[id] = Math.max(0, (inv[id] || 0) - n); if (!inv[id]) delete inv[id]; }
  addRyo(n) { this.S.ryo = (this.S.ryo || 0) + n; this.toast('💰', '+' + n + ' RYO', true); this.purse(); }
  takeItems(t) { for (const k of [].concat(t)) { const id = this.qid(k), n = this.S.inv[id] || 0; if (n) { this.removeItem(id, n); const it = this.itemInfo(id); this.toast(it.icon, '− ' + it.name + (n > 1 ? ' ×' + n : '')); } } }

  /** what the quest wants right now: { text, sub, target: [x, z] or an actor } */
  goal() {
    const Q = this.Q, st = this.curStep(), C = this.C;
    if (Q.boss) return this.level >= 20 ? { text: 'The road is yours. Walk through the north gate.', target: this.P.gates.N } : { text: 'The north gate is open. Walk on to the next chapter.', target: this.P.gates.N };
    if (!st) return { text: 'Defeat ' + this.story.boss.def.name + ' at ' + C.landmark, target: this.boss };
    const giver = st.npc && this.actors.find(a => a.id === st.npc);
    if (Q.phase === 'meet') return { text: st.meet || 'Talk to ' + cap(C.npcs[st.npc].name), target: giver };
    if (Q.phase === 'back') return { text: st.back || 'Return to ' + cap(C.npcs[st.npc].name), target: giver };
    // the task
    if (st.get) { const left = this.pickups.filter(p => p.step === Q.step); return { text: st.goal, sub: this.count() + ' / ' + st.get.n, target: this.nearestOf(left) }; }
    if (st.use) { const left = this.things.filter(t => t.step === Q.step && !t.done); return { text: st.goal, sub: this.count() + ' / ' + st.use.n, target: this.nearestOf(left.map(t => ({ x: t.root.position.x, z: t.root.position.z, t }))) }; }
    if (st.fight) return { text: st.goal, target: st.fight.self ? giver : this.actors.find(a => a.id === 's' + Q.step && !a.gone) };
    return { text: st.goal || '' };
  }
  count() { const Q = this.Q, st = this.curStep(); if (!st) return 0; if (st.get) return Q.got.filter(id => id.startsWith('s' + Q.step + ':')).length; if (st.use) return Q.used.filter(id => id.startsWith('s' + Q.step + ':')).length; return 0; }
  nearestOf(list) { let b = null, bd = 1e9; for (const o of list) { const d = Math.hypot(o.x - this.p.x, o.z - this.p.z); if (d < bd) { bd = d; b = o; } } return b; }

  objective(flash) {
    const g = this.goal();
    this.el('.qt .ch').textContent = 'CHAPTER ' + this.level + ' · ' + this.story.name;
    this.el('.qt .goal').textContent = g.text;
    this.el('.qt .sub').textContent = g.sub || '';
    this.target = g.target || null;
    if (flash) { const q = this.el('.qt'); q.classList.remove('flash'); void q.offsetWidth; q.classList.add('flash'); }
    this.refreshMarkers();
  }
  refreshMarkers() {
    const Q = this.Q, st = this.curStep();
    for (const a of this.actors) {
      if (a.gone) continue;
      if (a.kind === 'npc') {
        const mine = st && st.npc === a.id && !Q.boss;
        if (mine && Q.phase === 'meet') this.setMarker(a, '!', '#f2c14e', 0.62);
        else if (mine && Q.phase === 'back') this.setMarker(a, '?', '#f2c14e', 0.62);
        else if (mine && st.fight && st.fight.self) this.setMarker(a, '敵', '#ff4a3a', 0.5);
        else if (a.shop) this.setMarker(a, '店', '#efe6d2', 0.42);
        else this.setMarker(a, '');
      } else if (a.kind === 'foe') this.setMarker(a, '敵', Q.phase === 'task' ? '#ff4a3a' : '#8a6a6a', 0.5);
      else if (a.kind === 'duelist') this.setMarker(a, '敵', '#ff7a5a', 0.4);
      else if (a.kind === 'boss') this.setMarker(a, '主', !st ? '#f2c14e' : '#8a7a5a', 0.55);
    }
  }

  /** talking to someone in the cast */
  talkNpc(a) {
    const Q = this.Q, st = this.curStep(), n = a.npc || {};
    if (Q.boss || !st || st.npc !== a.id) {
      if (a.shop) { this.openTalk(a, [Q.boss ? 'Back again? Stock up for the road ahead.' : 'Welcome! Supplies for the road?'], () => this.openShop(a)); return; }
      const lines = Q.boss ? [n.after || AFTER[(a.id.length + this.level) % AFTER.length]] : (n.idle && n.idle.length ? n.idle : ['Good day.']);
      this.openTalk(a, lines);
      return;
    }
    if (Q.phase === 'meet') this.openTalk(a, st.say, () => this.afterMeet(a));
    else if (Q.phase === 'back') this.openTalk(a, st.done || ['Thank you.'], () => this.completeStep());
    else if (st.fight && st.fight.self) this.openTalk(a, ['Ready? Then draw!'], () => this.startDuel(a));
    else this.openTalk(a, st.wait || ['Any luck? ' + st.goal + '.']);
  }
  afterMeet(a) {
    const Q = this.Q, st = this.curStep();
    if (st.take) this.takeItems(st.take);
    if (st.give) this.addItem(this.qid(st.give));
    if (st.get || st.use || st.fight) {
      Q.phase = 'task';
      this.spawnTask();
      this.toast('◆', 'NEW TASK', true);
      this.objective(true);
      this.save();
      if (st.fight && st.fight.self) setTimeout(() => this.startDuel(a), 350);
    } else this.completeStep();
  }
  /** the task is done: report back if there's someone to report to, else move on */
  taskDone() {
    const Q = this.Q, st = this.curStep();
    if (st.done && st.npc) { Q.phase = 'back'; this.api.sfx('ok'); this.toast('◆', 'TASK DONE', true); this.objective(true); this.save(); }
    else this.completeStep();
  }
  completeStep() {
    const Q = this.Q, st = this.curStep();
    if (!st) return;
    if (Q.phase === 'back' && !st.keep) {   // reporting back hands over what you collected
      if (st.get) this.removeItem(this.qid(st.get.item), st.get.n);
      if (st.fight && st.fight.loot) this.removeItem(this.qid(st.fight.loot), 1);
    }
    if (!st.npc && st.take) this.takeItems(st.take);
    if (st.reward) { if (st.reward.ryo) this.addRyo(st.reward.ryo); if (st.reward.item) this.addItem(SUPPLIES[st.reward.item] ? st.reward.item : this.qid(st.reward.item)); }
    if (st.after) this.banner('', 'QUEST', st.after);
    Q.step++; Q.n = 0;
    const nx = this.curStep();
    Q.phase = nx && !nx.npc ? 'task' : 'meet';
    if (st.open) this.openBarrier(false);
    this.api.sfx('win');
    if (!nx) this.toast('主', 'FACE ' + this.story.boss.def.name, true);
    else this.toast('◆', 'QUEST UPDATED', true);
    this.spawnTask();
    this.objective(true);
    this.save();
  }
  openBarrier(instant) {
    const L = this.L;
    if (L.barrierCol) L.barrierCol.off = true;
    if (instant) { L.barrier.open(1); return; }
    this.barrierAnim = 0;
    this.banner('', 'THE GATE OPENS', 'The way to ' + this.C.landmark + ' is open. ' + this.story.boss.def.name + ' is waiting.');
  }
  setSeal(k, open) {
    const s = this.L.seals[k]; if (!s) return;
    s.visible = !open;
    if (s.col) { if (!this.cgHas(s.col)) this.addCol(s.col); s.col.off = !!open; }
    const g = k === 'N' ? this.L.gateN : this.L.gateS;
    g.traverse(o => { if (o.isMesh && o.material && o.material.emissive && !o.userData.outline) { o.material = o.material.clone(); o.material.emissive.set(open ? '#ff9a40' : '#000000'); o.material.emissiveIntensity = open ? 0.35 : 0; } });
  }
  cgHas(c) { for (const a of this.cg.values()) if (a.includes(c)) return true; return false; }

  /* ================= talking ================= */
  openTalk(a, lines, done) {
    this.talk = { who: a, lines: lines.map(l => l.replace(/\{me\}/g, this.def.name)), i: 0, done };
    this.el('.help').style.display = 'none';
    this.el('.prompt').style.display = 'none';
    this.showLine();
    this.api.sfx('ok');
  }
  showLine() {
    const T = this.talk, a = T.who;
    this.el('.talk').style.display = 'block';
    this.el('.talk .nm').innerHTML = esc(a.name || 'VILLAGER') + (a.title ? '<small>' + esc(a.title.toUpperCase()) + '</small>' : '');
    this.el('.talk .tx').textContent = T.lines[T.i];
    const last = T.i >= T.lines.length - 1;
    const end = !last ? 'NEXT' : (a.kind === 'boss' || a.kind === 'foe' || a.kind === 'duelist') ? 'DRAW YOUR SWORD' : T.done ? 'OK' : 'BYE';
    this.el('.talk .hn').innerHTML = '<span class="kbd">E</span> ' + end;
  }
  advanceTalk() {
    const T = this.talk;
    if (T.i < T.lines.length - 1) { T.i++; this.showLine(); this.api.sfx('move'); return; }
    this.closeTalk();
    if (T.done) T.done();
  }
  closeTalk() { this.talk = null; this.el('.talk').style.display = 'none'; this.el('.help').style.display = ''; }

  interact(o) {
    if (o.pk) return this.takePickup(o);
    if (o.turn) return this.useThing(o);
    const a = o;
    if (a.kind === 'villager') this.openTalk(a, a.lines);
    else if (a.kind === 'npc') this.talkNpc(a);
    else if (a.kind === 'duelist') this.openTalk(a, a.lines, () => this.startDuel(a));
    else if (a.kind === 'foe') {
      if (this.Q.phase !== 'task') this.openTalk(a, ['What are you looking at? Get lost.']);
      else this.openTalk(a, a.lines, () => this.startDuel(a));
    } else if (a.kind === 'boss') {
      if (this.curStep()) this.openTalk(a, ['Not yet. Come back when the village vouches for you.']);
      else this.openTalk(a, a.lines, () => this.startDuel(a));
    }
  }
  takePickup(p) {
    const Q = this.Q;
    Q.got.push(p.id);
    this.pickups.splice(this.pickups.indexOf(p), 1);
    this.world.remove(p.pk.root);
    this.fx.push(burst(this.scene, p.x, this.L.height(p.x, p.z) + 0.8, p.z, { color: '#ffe08a' }));
    this.api.sfx('ok');
    if (p.ryo) { this.addRyo(p.ryo); this.save(); return; }
    this.addItem(p.item, 1, true);
    const st = this.curStep(), it = this.itemInfo(p.item);
    if (st && st.get && p.step === Q.step) {
      const n = this.count();
      this.toast(it.icon, it.name + '  ' + n + ' / ' + st.get.n);
      if (n >= st.get.n) this.taskDone(); else this.objective();
    } else this.toast(it.icon, '+ ' + it.name);
    this.save();
  }
  useThing(t) {
    const Q = this.Q;
    t.turn(true); t.done = true;
    Q.used.push(t.id);
    const y = this.L.height(t.root.position.x, t.root.position.z);
    this.fx.push(burst(this.scene, t.root.position.x, y + 1, t.root.position.z, t.kind === 'fire' ? { color: '#9a9aa0', up: 3, size: 0.3, life: 1.4 } : { color: '#ffe08a' }));
    if (t.col && ['koi', 'flag', 'fire'].includes(t.kind)) t.col.off = true;
    this.api.sfx(t.kind === 'bell' ? 'clash' : 'ok');
    if (t.kind === 'chest') {
      const sup = ['onigiri', 'tea', 'whetstone', 'omamori'][this.level % 4];
      this.addItem(sup); this.addRyo(20 + this.level * 2); this.save(); return;
    }
    const st = this.curStep();
    if (st && st.use && t.step === Q.step) {
      const n = this.count();
      this.toast('◆', cap(st.use.verb.split(' ')[0]) + ' ' + n + ' / ' + st.use.n);
      if (n >= st.use.n) this.taskDone(); else this.objective();
    }
    this.save();
  }

  /* ================= duels ================= */
  startDuel(a) {
    this.duelWith = a;
    this.active = false;
    document.body.classList.remove('w3d');
    this.el('.prompt').style.display = 'none';
    this.ui.style.display = 'none';
    const b = this.S.buffs || {}, buff = (b.hp || b.dmg || b.armor) ? { ...b } : null;
    this.S.buffs = {}; this.save();
    this.api.duel(a.fight || { def: a.def, t: Math.min(0.85, this.story.boss.t * 0.8) }, a.kind === 'boss', buff);
  }

  /** back from a duel */
  resume(won) {
    const a = this.duelWith; this.duelWith = null;
    this.ui.style.display = '';
    document.body.classList.add('w3d');
    this.clock.getDelta();
    this.active = true;
    this.purse();
    if (!a) return;
    const Q = this.Q;
    if (won) {
      if (a.kind === 'boss') return this.bossDown(a);
      Q.beat.push(a.id);
      if (a.kind === 'duelist') { this.banner('VICTORY', 'DUELIST DEFEATED', a.name + ' bows and pays up.'); this.addRyo(25); this.bowOut(a); }
      else if (a.kind === 'foe') {
        const st = this.curStep();
        this.banner('VICTORY', a.name + ' DEFEATED', st && st.fight.loot ? 'They dropped something.' : a.name + ' runs off.');
        if (st && st.fight.loot) this.addItem(this.qid(st.fight.loot));
        this.bowOut(a);
        if (st && st.fight && 's' + Q.step === a.id) this.taskDone();
      } else if (a.kind === 'npc') { this.banner('VICTORY', a.name + ' YIELDS', ''); this.taskDone(); }
    } else {
      this.banner('DEFEAT', a.name + ' WINS', 'Catch your breath and try again. Supplies from the shop can help.');
      const P = this.p, p = a.ch.root.position, dx = P.x - p.x, dz = P.z - p.z, d = Math.hypot(dx, dz) || 1;
      [P.x, P.z] = this.collide(p.x + dx / d * 4, p.z + dz / d * 4, 0.35);
    }
    this.save();
    this.objective();
  }
  bowOut(a) { setTimeout(() => { a.gone = true; this.scene && this.scene.remove(a.ch.root); this.fx.push(burst(this.scene, a.ch.root.position.x, a.ch.root.position.y + 0.8, a.ch.root.position.z, { color: '#e8e4dc', size: 0.22 })); }, 1400); }
  bossDown(a) {
    const Q = this.Q, lv = this.level;
    Q.boss = true; Q.step = this.C.chain.length + 1;
    const first = this.api.clear(lv);
    this.addItem('k' + lv);
    this.addRyo(100);
    this.save();
    this.banner(a.name + ' FALLS', first ? a.name + ' UNLOCKED' : 'BOSS DEFEATED', (first ? a.name + ' is now playable in every mode. ' : '') + (lv >= 20 ? 'The road ends here. Walk through the north gate.' : 'The north gate is open.'));
    // the boss falls, fades and is gone for good
    a.dying = 0;
    a.ch.root.traverse(o => { if (o.isMesh && o.material && !o.userData.outline) { o.material = o.material.clone(); o.material.transparent = true; } });
    setTimeout(() => { if (this.scene) { this.setSeal('N', true); this.toast('⛩', 'THE NORTH GATE IS OPEN', true); this.objective(true); } }, 2600);
    this.objective();
  }

  /* ================= frame ================= */
  input(pressed) { for (const k of pressed) this.taps.add(k); }

  keyDown(code) {
    if (!this.active) return;
    if (this.shopOpen) return this.shopKey(code);
    if (this.menuOpen) return this.menuKey(code);
    if (code === 'Escape') { if (this.talk) { this.closeTalk(); return; } this.paused = !this.paused; this.el('.pause').style.display = this.paused ? 'flex' : 'none'; return; }
    if (this.paused) {
      if (code === 'KeyQ') { this.paused = false; this.el('.pause').style.display = 'none'; this.leave(); this.api.quit(); }
      else if (code === 'Tab') { this.paused = false; this.el('.pause').style.display = 'none'; this.openMenu('quests'); }
      return;
    }
    if (this.talk) return;
    if (code === 'Tab' || code === 'KeyR') this.openMenu(this.menuTab || 'quests');
    else if (code === 'KeyI') this.openMenu('items');
    else if (code === 'KeyJ') this.openMenu('quests');
  }

  frame() {
    if (!this.active || !this.scene) return;
    const dt = Math.min(0.05, this.clock.getDelta()), t = this.clock.elapsedTime;
    const keys = this.api.keys, tap = k => this.taps.has(k);
    const pad = (navigator.getGamepads ? [...navigator.getGamepads()].find(g => g && g.connected) : null);
    const padA = pad && pad.buttons[0] && pad.buttons[0].pressed;
    const jumpTap = tap('Space') || (padA && !this.padA); this.padA = padA;
    const busy = this.paused || this.menuOpen || this.shopOpen || this.fading;
    if (!busy) {
      if (this.talk) { if (tap('KeyE') || tap('Space') || tap('Enter') || (padA && jumpTap)) this.advanceTalk(); }
      else this.move(dt, keys, pad, tap, jumpTap);
    }
    if (!this.paused) this.updateActors(dt, t);
    this.taps.clear();
    this.updateCamera(dt, pad);
    for (const u of this.L.update) u(dt, this.cam, this.scene);
    for (const p of this.pickups) p.pk.update(t);
    for (const th of this.things) th.update(dt, t);
    this.fx = this.fx.filter(f => f(dt) !== false);
    if (this.barrierAnim != null) { this.barrierAnim += dt; this.L.barrier.open(Math.min(1, this.barrierAnim / 1.4)); if (this.barrierAnim > 1.4) this.barrierAnim = null; }
    // the waypoint
    const tg = this.target && (this.target.ch ? (this.target.gone ? null : this.target.ch.root.position) : this.target.t ? this.target.t.root.position : Array.isArray(this.target) ? { x: this.target[0], z: this.target[1], y: this.L.height(this.target[0], this.target[1]) } : this.target.x != null ? { x: this.target.x, z: this.target.z, y: this.L.height(this.target.x, this.target.z) } : null);
    this.tgPos = tg;
    if (tg) { const d = Math.hypot(tg.x - this.p.x, tg.z - this.p.z); this.way.visible = d > 5 && !this.talk; this.way.position.set(tg.x, (tg.y || 0) + (this.target.ch ? this.target.ch.height + 1.15 : 2.0) + Math.sin(t * 3) * 0.08, tg.z); }
    else this.way.visible = false;
    this.sun.position.set(this.p.x, this.p.y, this.p.z).add(this.sunOff); this.sun.target.position.set(this.p.x, this.p.y, this.p.z);
    this.renderer.render(this.scene, this.cam);
    this.drawMinimap();
  }

  move(dt, keys, pad, tap, jumpTap) {
    let ix = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
    let iz = (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0);
    let run = keys.has('ShiftLeft') || keys.has('ShiftRight');
    if (pad) { const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0; if (Math.hypot(ax, ay) > 0.2) { ix = ax; iz = ay; } run = run || [4, 6, 10].some(b => pad.buttons[b] && (pad.buttons[b].pressed || pad.buttons[b].value > 0.3)); }
    const len = Math.hypot(ix, iz);
    const P = this.p;
    P.fwd = len > 0.1 ? -iz / len : 0;
    let want = 0;
    if (len > 0.1) {
      const cy = Math.cos(this.camYaw), sy = Math.sin(this.camYaw);
      const dx = (ix * cy + iz * sy) / Math.max(1, len), dz = (-ix * sy + iz * cy) / Math.max(1, len);
      want = (run ? 8.6 : 4.2) * Math.min(1, len);
      const ty = Math.atan2(dx, dz);
      P.yaw += wrap(ty - P.yaw) * Math.min(1, dt * 12);
      P.dx = dx; P.dz = dz;
    }
    P.running = run && len > 0.1;
    P.speed += (want - P.speed) * Math.min(1, dt * (want > P.speed ? 6 : 10));
    if (P.speed > 0.01 && P.dx != null) {
      let nx = P.x + P.dx * P.speed * dt, nz = P.z + P.dz * P.speed * dt;
      [nx, nz] = this.collide(nx, nz, 0.35);
      P.x = nx; P.z = nz;
    }
    const gy = this.groundAt(P.x, P.z);
    if (P.ground && jumpTap) { P.vy = 5.4; P.ground = false; this.api.sfx('jump'); }
    P.vy -= 14 * dt; P.y += P.vy * dt;
    if (P.y <= gy) { if (!P.ground && P.vy < -6) this.api.sfx('land'); P.y = gy; P.vy = 0; P.ground = true; }
    if (P.ground && P.y > gy + 0.02 && P.vy <= 0) P.y = gy;
    this.pc.root.position.set(P.x, P.y, P.z);
    this.pc.root.rotation.y = P.yaw;
    this.pc.animate(!P.ground ? 'jump' : P.speed > 5.6 ? 'run' : P.speed > 0.4 ? 'walk' : 'idle', dt, P.speed > 0.4 ? Math.max(0.7, P.speed / (P.speed > 5.6 ? 6.2 : 4.0)) : 1);
    // dust when sprinting
    this.dustT = (this.dustT || 0) - dt;
    if (P.running && P.ground && P.speed > 6 && this.dustT < 0) { this.dustT = 0.12; this.fx.push(burst(this.scene, P.x - P.dx * 0.3, P.y + 0.1, P.z - P.dz * 0.3, { color: '#d8c8a8', n: 5, speed: 0.6, up: 0.8, life: 0.5, size: 0.22 })); }
    // the nearest thing to talk to or use
    const near = this.nearestInteract();
    const pr = this.el('.prompt');
    if (near) { pr.className = 'prompt'; pr.style.display = 'block'; pr.innerHTML = '<span class="kbd">E</span> ' + esc(this.promptFor(near)); }
    else {
      const hint = this.gateHint();
      if (hint) { pr.className = 'prompt warn'; pr.style.display = 'block'; pr.textContent = hint; } else pr.style.display = 'none';
    }
    if (near && (tap('KeyE') || tap('Enter'))) this.interact(near);
    // walking over coins and items picks them up
    for (const p of this.pickups) if (Math.hypot(p.x - P.x, p.z - P.z) < 0.9) { this.takePickup(p); break; }
    // the gates
    const G = this.P.gates;
    if (P.z > G.S[1] - 1.4 && Math.abs(P.x - G.S[0]) < 2.4 && this.level > 1) this.goTo(this.level - 1, 'N');
    else if (P.z < G.N[1] + 1.4 && Math.abs(P.x - G.N[0]) < 2.4 && (this.Q.boss || this.Q.legacy)) { if (this.level >= 20 && this.Q.boss) this.finish(); else if (this.level < 20) this.goTo(this.level + 1, 'S'); }
  }
  gateHint() {
    const P = this.p, G = this.P.gates;
    if (this.level === 1 && P.z > G.S[1] - 4 && Math.abs(P.x - G.S[0]) < 4) return 'THE ROAD HOME. YOUR JOURNEY LIES NORTH.';
    if (!this.Q.boss && !this.Q.legacy && P.z < G.N[1] + 4 && Math.abs(P.x - G.N[0]) < 4) return 'SEALED UNTIL ' + this.story.boss.def.name + ' FALLS';
    if (!this.opened() && Math.abs(P.z - WALL_Z) < 3.4 && Math.abs(P.x - this.P.lx) < 3.6) return 'THE GATE IS BARRED. HELP THE TOWN FIRST.';
    return null;
  }
  promptFor(o) {
    if (o.pk) return 'PICK UP';
    if (o.turn) return o.verb + ' ' + (o.kind === 'koi' ? 'THE KOI' : o.kind === 'chest' ? 'THE CHEST' : o.kind === 'altar' ? 'THE ALTAR' : o.kind.toUpperCase());
    if (o.kind === 'villager') return 'TALK';
    if (o.kind === 'boss') return 'CHALLENGE ' + o.name;
    if (o.kind === 'duelist') return 'DUEL ' + o.name + ' (25 RYO)';
    if (o.kind === 'foe') return (this.Q.phase === 'task' ? 'FIGHT ' : 'TALK TO ') + o.name;
    return 'TALK TO ' + o.name;
  }
  nearestInteract() {
    let best = null, bd = 1e9;
    const P = this.p, consider = (o, x, z, r) => { const d = Math.hypot(x - P.x, z - P.z); if (d < r && d < bd) { bd = d; best = o; } };
    for (const a of this.actors) if (!a.gone && a.dying == null) consider(a, a.ch.root.position.x, a.ch.root.position.z, 2.5);
    for (const p of this.pickups) consider(p, p.x, p.z, 1.8);
    const Q = this.Q;
    for (const t of this.things) if (!t.done && (t.id === 'chest' || (t.step === Q.step && Q.phase === 'task'))) consider(t, t.root.position.x, t.root.position.z, 2.2);
    return best;
  }

  groundAt(x, z) {
    let h = this.L.height(x, z);
    for (const b of this.L.bridges) { const lz = z - b.z; if (Math.abs(x - b.x) < b.hw + 0.3 && Math.abs(lz) < b.len / 2 + 0.5) h = Math.max(h, 0.16 + b.h * Math.cos(Math.min(1, Math.abs(lz) / (b.len / 2)) * Math.PI / 2)); }
    return h;
  }

  collide(x, z, rad, self = null) {
    for (let pass = 0; pass < 2; pass++) this.colsNear(x, z, rad + 0.5, c => {
      if (c.camOnly) return;
      if (c.box) {
        const dx = x - c.x, dz = z - c.z;
        let lx = dx * c.c - dz * c.s, lz = dx * c.s + dz * c.c;
        const qx = Math.max(-c.hw, Math.min(c.hw, lx)), qz = Math.max(-c.hd, Math.min(c.hd, lz));
        const ox = lx - qx, oz = lz - qz, d = Math.hypot(ox, oz);
        if (d >= rad) return;
        if (d > 1e-5) { const k = (rad - d) / d; lx += ox * k; lz += oz * k; }
        else { const px = c.hw - Math.abs(lx), pz = c.hd - Math.abs(lz); if (px < pz) lx = Math.sign(lx || 1) * (c.hw + rad); else lz = Math.sign(lz || 1) * (c.hd + rad); }
        x = c.x + lx * c.c + lz * c.s; z = c.z - lx * c.s + lz * c.c;
      } else {
        const dx = x - c.x, dz = z - c.z, d = Math.hypot(dx, dz), m = c.r + rad;
        if (d < m && d > 1e-4) { x = c.x + dx / d * m; z = c.z + dz / d * m; }
      }
    });
    for (const a of this.actors) {
      if (a.gone || a === self) continue;
      const p = a.ch.root.position, dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz), m = 0.7;
      if (d < m && d > 1e-4) { x = p.x + dx / d * m; z = p.z + dz / d * m; }
    }
    if (self) { const P = this.p, dx = x - P.x, dz = z - P.z, d = Math.hypot(dx, dz); if (d < 0.7 && d > 1e-4) { x = P.x + dx / d * 0.7; z = P.z + dz / d * 0.7; } }
    const B = this.L.bounds;
    x = Math.min(B.x1, Math.max(B.x0, x)); z = Math.min(B.z1, Math.max(B.z0, z));
    return [x, z];
  }
  /** is a point clear of every collider? */
  clear(x, z, rad) {
    let ok = true;
    this.colsNear(x, z, rad + 0.5, c => {
      if (!ok || c.camOnly) return;
      if (c.box) { const dx = x - c.x, dz = z - c.z, lx = dx * c.c - dz * c.s, lz = dx * c.s + dz * c.c; if (Math.abs(lx) < c.hw + rad && Math.abs(lz) < c.hd + rad) ok = false; }
      else if (Math.hypot(x - c.x, z - c.z) < c.r + rad) ok = false;
    });
    return ok;
  }

  updateActors(dt, t) {
    const near = this.talk && this.talk.who;
    for (const a of this.actors) {
      if (a.gone) continue;
      const p = a.ch.root.position;
      const toP = Math.hypot(this.p.x - p.x, this.p.z - p.z);
      let state = 'idle';
      if (a.dying != null) {
        // the boss falls and fades away
        a.dying += dt;
        const k = Math.min(1, a.dying / 0.9);
        a.ch.root.rotation.x = -k * k * 1.45;
        if (a.dying > 1.1) {
          const f = Math.max(0, 1 - (a.dying - 1.1) / 1.2);
          a.ch.root.traverse(o => { if (o.isMesh) { if (o.userData.outline) o.visible = false; else if (o.material.transparent) o.material.opacity = f; } });
          if (!a.burst) { a.burst = true; this.fx.push(burst(this.scene, p.x, p.y + 0.5, p.z, { color: '#ffffff', n: 60, speed: 2.5, up: 3, life: 1.6, size: 0.2 })); this.fx.push(burst(this.scene, p.x, p.y + 0.5, p.z, { color: this.A.particles === 'petals' ? '#ffc6d8' : '#f2c14e', n: 40, speed: 3.5, up: 2, life: 1.8, size: 0.18 })); }
        }
        if (a.dying > 2.4) { a.gone = true; this.scene.remove(a.ch.root); this.boss = null; }
        continue;
      }
      if (near === a) { a.yaw = Math.atan2(this.p.x - p.x, this.p.z - p.z); state = 'talk'; }
      else if (a.kind === 'villager') {
        a.wander -= dt;
        if (a.wander < 0) {
          a.wander = 4 + Math.random() * 6;
          for (let k = 0; k < 8; k++) {
            const g = [a.home[0] + (Math.random() - 0.5) * 7, a.home[1] + (Math.random() - 0.5) * 7], v = this.P.get(g[0], g[1]);
            if ((v === 0 || v === 1 || v === 4) && this.clear(g[0], g[1], 0.5)) { a.goal = g; a.goalT = 7; break; }
          }
        }
        if (toP < 3) { a.goal = null; a.yaw = Math.atan2(this.p.x - p.x, this.p.z - p.z); }
        if (a.goal) {
          const dx = a.goal[0] - p.x, dz = a.goal[1] - p.z, d = Math.hypot(dx, dz);
          a.goalT -= dt;
          if (d > 0.35 && a.goalT > 0) {
            const [nx, nz] = this.collide(p.x + dx / d * 1.2 * dt, p.z + dz / d * 1.2 * dt, 0.3, a);
            if (Math.hypot(nx - p.x, nz - p.z) < 0.25 * 1.2 * dt) a.goal = null;
            else { p.x = nx; p.z = nz; a.yaw = Math.atan2(dx, dz); state = 'walk'; }
          } else a.goal = null;
        }
      } else if (toP < (a.kind === 'boss' ? 16 : 9)) a.yaw = Math.atan2(this.p.x - p.x, this.p.z - p.z);
      p.y = this.groundAt(p.x, p.z);
      a.ch.root.rotation.y += wrap(a.yaw - a.ch.root.rotation.y) * Math.min(1, dt * 6);
      a.ch.animate(state, dt, 0.8);
      if (a.marker) { a.marker.visible = !this.talk; a.marker.position.y = a.ch.height + 0.45 + Math.sin(t * 3 + p.x) * 0.06; }
    }
    // spirit wisps orbit their owner
    for (const root of [this.pc.root, ...this.actors.map(a => a.ch.root)]) root.children.forEach(o => { if (o.userData.wisp != null) { const k = o.userData.wisp; o.position.set(Math.cos(t * 1.6 + k * Math.PI) * 0.45, 0.95 + Math.sin(t * 2 + k) * 0.1, Math.sin(t * 1.6 + k * Math.PI) * 0.35); } });
  }

  updateCamera(dt, pad) {
    if (pad) { const rx = pad.axes[2] || 0, ry = pad.axes[3] || 0; if (Math.abs(rx) > 0.2) { this.camYaw -= rx * dt * 2.4; this.camManual = 1.5; } if (Math.abs(ry) > 0.2) this.camPitch = Math.min(1.1, Math.max(0.08, this.camPitch + ry * dt * 1.4)); }
    this.camManual = Math.max(0, (this.camManual || 0) - dt);
    const P = this.p;
    if (this.debugCam) { const d = this.debugCam; this.cam.position.set(d[0], d[1], d[2]); this.cam.lookAt(d[3], d[4], d[5]); return; }   // tests only
    if (this.talk) {
      const w = this.talk.who.ch.root.position, mx = (P.x + w.x) / 2, mz = (P.z + w.z) / 2;
      const ang = Math.atan2(w.x - P.x, w.z - P.z) + Math.PI / 2;
      tmp.set(mx + Math.sin(ang) * 3.8, P.y + 1.5, mz + Math.cos(ang) * 3.8);
      this.cam.position.lerp(tmp, Math.min(1, dt * 4));
      this.cam.lookAt(mx, P.y + 0.85, mz);
      return;
    }
    if (!this.camManual && P.speed > 0.6 && P.fwd > 0.6) this.camYaw += wrap((P.yaw + Math.PI) - this.camYaw) * Math.min(1, dt * 1.3);
    // pull in when a building is between you and the camera
    let dist = this.camDist;
    const sx = Math.sin(this.camYaw), sz = Math.cos(this.camYaw);
    for (let d = 1.2; d <= this.camDist; d += 0.4) {
      const x = P.x + sx * d * Math.cos(this.camPitch), z = P.z + sz * d * Math.cos(this.camPitch), y = P.y + 0.9 + Math.sin(this.camPitch) * d;
      let hit = false;
      if (y < 5.5) this.colsNear(x, z, 0.4, c => { if (hit || !(c.tall || c.cam)) return; if (c.cam && y < 2.6) return; const dx = x - c.x, dz = z - c.z, lx = dx * c.c - dz * c.s, lz = dx * c.s + dz * c.c; if (Math.abs(lx) < c.hw + 0.3 && Math.abs(lz) < c.hd + 0.3) hit = true; });
      if (hit) { dist = Math.max(2.2, d - 0.5); break; }
    }
    this.camCur += (dist - this.camCur) * Math.min(1, dt * (dist < this.camCur ? 10 : 2.5));
    const ch = Math.cos(this.camPitch), cd = this.camCur;
    tmp.set(P.x + sx * cd * ch, P.y + 0.9 + Math.sin(this.camPitch) * cd, P.z + sz * cd * ch);
    tmp.y = Math.max(tmp.y, this.L.height(tmp.x, tmp.z) + 0.6);
    this.cam.position.lerp(tmp, Math.min(1, dt * 8));
    const fov = 46 + (P.running && P.speed > 6 ? 5 : 0);
    if (Math.abs(this.cam.fov - fov) > 0.05) { this.cam.fov += (fov - this.cam.fov) * Math.min(1, dt * 4); this.cam.updateProjectionMatrix(); }
    this.cam.lookAt(P.x, P.y + 0.85, P.z);
  }

  /* ================= the HUD ================= */
  banner(title, small, line) {
    const el = this.el('.area');
    el.querySelector('small').textContent = small; el.querySelector('b').textContent = title; el.querySelector('i').textContent = line || '';
    el.classList.add('on'); clearTimeout(this._bt); this._bt = setTimeout(() => el.classList.remove('on'), 4200);
  }
  toast(icon, text, gold) {
    const box = this.el('.toasts'), d = document.createElement('div');
    d.className = 'toast' + (gold ? ' gold' : ''); d.innerHTML = '<i>' + esc(icon) + '</i>' + esc(text);
    box.appendChild(d);
    while (box.children.length > 5) box.firstChild.remove();
    setTimeout(() => { d.style.opacity = '0'; setTimeout(() => d.remove(), 500); }, 2600);
  }
  purse() {
    const S = this.S, b = S.buffs || {};
    this.el('.purse .ry').textContent = (S.ryo || 0) + ' RYO';
    const icons = []; if (b.hp) icons.push(b.hp >= 0.25 ? '🍵' : '🍙'); if (b.dmg) icons.push('🪨'); if (b.armor) icons.push('🧧');
    this.el('.purse .bf').innerHTML = icons.map(i => '<span>' + i + '</span>').join('');
  }
  drawMinimap() {
    const g = this.mm, W = 320, R = 160, sc = 3.0, mc = this.L.minimap;
    const P = this.p, th = this.camYaw;
    g.save(); g.clearRect(0, 0, W, W);
    g.fillStyle = '#2a2018'; g.fillRect(0, 0, W, W);
    g.translate(R, R); g.rotate(th); g.scale(sc / 4, sc / 4);
    g.drawImage(mc, -(P.x - MAP.x0) * 4, -(P.z - MAP.z0) * 4);
    g.restore();
    const toScr = (x, z) => { const dx = (x - P.x) * sc, dz = (z - P.z) * sc, c = Math.cos(th), s = Math.sin(th); return [R + dx * c - dz * s, R + dx * s + dz * c]; };
    const dot = (x, z, col, txt, rad = 9, clamp = false) => {
      let [sx, sy] = toScr(x, z); const dd = Math.hypot(sx - R, sy - R);
      if (dd > R - 14) { if (!clamp) return; sx = R + (sx - R) / dd * (R - 14); sy = R + (sy - R) / dd * (R - 14); }
      g.fillStyle = '#000'; g.beginPath(); g.arc(sx, sy, rad + 2.5, 0, TAU); g.fill();
      g.fillStyle = col; g.beginPath(); g.arc(sx, sy, rad, 0, TAU); g.fill();
      if (txt) { g.fillStyle = '#120709'; g.font = 'bold ' + Math.round(rad * 1.5) + 'px Silkscreen, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, sx, sy + 1); }
    };
    for (const k of ['S', 'N']) { const [x, z] = this.P.gates[k]; dot(x, z, (k === 'N' ? this.Q.boss || this.Q.legacy : this.level > 1) ? '#e0503a' : '#6a5a4a', '', 8); }
    for (const a of this.actors) {
      if (a.gone) continue; const p = a.ch.root.position;
      if (a.kind === 'boss') dot(p.x, p.z, '#f2c14e', '', 10);
      else if (a.kind === 'foe' || a.kind === 'duelist') dot(p.x, p.z, '#ff4a3a', '', 7);
      else if (a.kind === 'npc' && a.mkText && a.mkText[0] === '!') dot(p.x, p.z, '#f2c14e', '!', 10);
      else if (a.kind === 'npc' && a.mkText && a.mkText[0] === '?') dot(p.x, p.z, '#f2c14e', '?', 10);
      else if (a.shop) dot(p.x, p.z, '#efe6d2', '', 6);
    }
    if (this.tgPos) {
      const [sx0, sy0] = toScr(this.tgPos.x, this.tgPos.z), dd = Math.hypot(sx0 - R, sy0 - R);
      let sx = sx0, sy = sy0; if (dd > R - 16) { sx = R + (sx0 - R) / dd * (R - 16); sy = R + (sy0 - R) / dd * (R - 16); }
      g.save(); g.translate(sx, sy); g.rotate(Math.PI / 4); g.fillStyle = '#000'; g.fillRect(-11, -11, 22, 22); g.fillStyle = '#f2c14e'; g.fillRect(-8, -8, 16, 16); g.restore();
    }
    // you, pointing where you face
    g.save(); g.translate(R, R); g.rotate(th - this.p.yaw + Math.PI);
    g.fillStyle = '#000'; g.beginPath(); g.moveTo(0, -17); g.lineTo(12, 13); g.lineTo(0, 6); g.lineTo(-12, 13); g.closePath(); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(0, -12); g.lineTo(8, 9); g.lineTo(0, 4); g.lineTo(-8, 9); g.closePath(); g.fill();
    g.restore();
    // north on the rim
    const n = this.el('.mmN'), mm = this.el('.mm').getBoundingClientRect(), host = this.ui.getBoundingClientRect();
    const cx = mm.left - host.left + mm.width / 2, cy = mm.top - host.top + mm.height / 2, rr = mm.width / 2;
    n.style.left = (cx + Math.sin(th) * rr) + 'px';
    n.style.top = (cy - Math.cos(th) * rr) + 'px';
  }

  /* ================= the menu: quests, items, map ================= */
  openMenu(tab) {
    this.menuOpen = true; this.menuTab = tab || 'quests'; this.menuSel = this.menuSel || 0;
    this.el('.menu').classList.add('on'); this.el('.prompt').style.display = 'none';
    this.renderMenu(); this.api.sfx('ok');
  }
  closeMenu() { this.menuOpen = false; this.el('.menu').classList.remove('on'); this.api.sfx('back'); }
  menuKey(code) {
    const tabs = ['quests', 'items', 'map'];
    if (code === 'Escape' || code === 'KeyC' || (code === 'KeyI' && this.menuTab === 'items') || (code === 'KeyJ' && this.menuTab === 'quests') || (code === 'KeyR')) return this.closeMenu();
    if (code === 'Tab' || code === 'KeyF') { this.menuTab = tabs[(tabs.indexOf(this.menuTab) + 1) % 3]; this.api.sfx('move'); return this.renderMenu(); }
    if (code === 'Digit1' || code === 'KeyJ') { this.menuTab = 'quests'; return this.renderMenu(); }
    if (code === 'Digit2' || code === 'KeyI') { this.menuTab = 'items'; return this.renderMenu(); }
    if (code === 'Digit3') { this.menuTab = 'map'; return this.renderMenu(); }
    if (this.menuTab === 'items') {
      const n = this.itemList().length, d = { KeyA: -1, ArrowLeft: -1, KeyD: 1, ArrowRight: 1, KeyW: -6, ArrowUp: -6, KeyS: 6, ArrowDown: 6 }[code];
      if (d && n) { this.menuSel = Math.max(0, Math.min(n - 1, (this.menuSel || 0) + d)); this.api.sfx('move'); return this.renderMenu(); }
      if (code === 'KeyE' || code === 'Enter' || code === 'Space') this.useSelected();
    } else if (code === 'KeyA' || code === 'ArrowLeft' || code === 'KeyD' || code === 'ArrowRight') {
      this.menuTab = tabs[(tabs.indexOf(this.menuTab) + (code === 'KeyA' || code === 'ArrowLeft' ? 2 : 1)) % 3]; this.api.sfx('move'); this.renderMenu();
    }
  }
  itemList() {
    const inv = this.S.inv, out = [];
    for (const k of Object.keys(SUPPLIES)) if (inv[k]) out.push(k);
    for (const k of Object.keys(inv)) if (k[0] === 'c' && inv[k]) out.push(k);
    for (let i = 1; i <= 20; i++) if (inv['k' + i]) out.push('k' + i);
    return out;
  }
  useSelected() {
    const list = this.itemList(), id = list[this.menuSel || 0]; if (!id || !SUPPLIES[id]) return;
    const S = this.S, b = S.buffs = S.buffs || {}, sup = SUPPLIES[id], [k, v] = Object.entries(sup.buff)[0];
    if (b[k] >= v) { this.toast(sup.icon, 'ALREADY READY FOR YOUR NEXT DUEL'); this.api.sfx('back'); return; }
    b[k] = v; this.removeItem(id); this.save(); this.purse();
    this.toast(sup.icon, sup.name.toUpperCase() + ': READY FOR YOUR NEXT DUEL', true); this.api.sfx('ok');
    this.menuSel = Math.min(this.menuSel, Math.max(0, this.itemList().length - 1));
    this.renderMenu();
  }
  renderMenu() {
    const tab = this.menuTab, S = this.S;
    this.el('.mtabs').innerHTML = [['quests', 'QUESTS', 'J'], ['items', 'ITEMS', 'I'], ['map', 'MAP', '3']].map(([k, n, key]) => `<div class="mtab${k === tab ? ' on' : ''}" data-tab="${k}"><span class="kbd">${key}</span>${n}</div>`).join('') + `<div class="mryo">${S.ryo || 0} RYO</div>`;
    const body = this.el('.mbody'), foot = this.el('.mfoot');
    if (tab === 'quests') {
      const Q = this.Q, C = this.C, ch = C.chain;
      const rows = ch.map((st, k) => {
        const text = k < Q.step || Q.boss ? (st.goal || st.meet || 'Done') : k === Q.step ? (Q.phase === 'meet' ? (st.meet || 'Talk to ' + cap(C.npcs[st.npc].name)) : Q.phase === 'back' ? (st.back || 'Report back') : st.goal) : '???';
        const cls = k < Q.step || Q.boss ? 'done' : k === Q.step ? 'cur' : 'lock';
        const sub = k === Q.step && !Q.boss ? (this.goal().sub ? '<em>' + this.goal().sub + '</em>' : '') : '';
        return `<div class="qstep ${cls}"><b>${cls === 'done' ? '✓' : cls === 'cur' ? '◆' : '·'}</b><div>${esc(text)}${sub}</div></div>`;
      });
      rows.push(`<div class="qstep ${Q.boss ? 'done' : Q.step >= ch.length ? 'cur' : 'lock'}"><b>${Q.boss ? '✓' : Q.step >= ch.length ? '主' : '·'}</b><div>${Q.step >= ch.length || Q.boss ? 'Defeat ' + esc(this.story.boss.def.name) + ' at ' + esc(C.landmark) : '???'}</div></div>`);
      const duelBeat = Q.beat.filter(x => x.startsWith('duel')).length, nd = this.story.challengers.length;
      const ryoGot = Q.got.filter(x => x.startsWith('ryo')).length;
      const chs = this.api.chapters();
      body.innerHTML = `<div class="pane" style="flex:1.35"><div class="ph">MAIN QUEST · CHAPTER ${this.level}</div><div class="qtitle">${esc(this.story.name)}</div><div class="qboss">${esc(this.story.text)}</div>${rows.join('')}</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:1.6cqw"><div class="pane"><div class="ph">ON THE SIDE</div><div class="side"><div>Duelists on the road<span>${duelBeat} / ${nd}</span></div><div>Ryo pouches found<span>${ryoGot} / 3</span></div><div>Treasure chest<span>${Q.used.includes('chest') ? 'opened' : 'in town'}</span></div></div></div>
        <div class="pane" style="flex:1"><div class="ph">THE JOURNEY</div><div class="jour">${chs.map((c, k) => `<div class="jc${k + 1 === this.level ? ' cur' : c.done ? ' done' : ''}"><b>${c.done ? '✓' : k + 1}</b>${esc(c.boss)}</div>`).join('')}</div></div></div>`;
      foot.innerHTML = '<span class="kbd">TAB</span> NEXT TAB · <span class="kbd">ESC</span> CLOSE';
    } else if (tab === 'items') {
      const list = this.itemList(), sel = Math.min(this.menuSel || 0, Math.max(0, list.length - 1)); this.menuSel = sel;
      let html = '', idx = 0, last = '';
      const label = { supply: 'SUPPLIES · USE BEFORE A DUEL', quest: 'QUEST ITEMS', keepsake: 'KEEPSAKES FROM FALLEN MASTERS' };
      for (const id of list) { const it = this.itemInfo(id); if (it.kind !== last) { html += `<div class="sec">${label[it.kind]}</div>`; last = it.kind; } html += `<div class="slot${idx === sel ? ' sel' : ''}" data-slot="${idx}">${it.icon}${S.inv[id] > 1 ? '<b>' + S.inv[id] + '</b>' : ''}</div>`; idx++; }
      if (!list.length) html = '<div class="sec">YOUR BAG IS EMPTY</div><div class="slot empty"></div>';
      const id = list[sel], it = id && this.itemInfo(id), b = S.buffs || {};
      const ready = it && it.kind === 'supply' && b[Object.keys(SUPPLIES[id].buff)[0]] >= Object.values(SUPPLIES[id].buff)[0];
      const det = it ? `<div class="ic">${it.icon}</div><div class="nm">${esc(it.name)}${S.inv[id] > 1 ? ' ×' + S.inv[id] : ''}</div><div class="kd">${{ supply: 'SUPPLY', quest: 'QUEST ITEM', keepsake: 'KEEPSAKE' }[it.kind]}</div><div class="ds">${esc(it.desc)}</div>${it.kind === 'supply' ? `<div class="act${ready ? ' off' : ''}">${ready ? 'READY FOR YOUR NEXT DUEL' : '<span class="kbd">E</span> USE'}</div>` : ''}`
        : '<div class="ds">Quest items, supplies from the shop and keepsakes from the masters you beat end up here.</div>';
      body.innerHTML = `<div class="pane grid" style="flex:1.5">${html}</div><div class="pane det" style="flex:1">${det}</div>`;
      foot.innerHTML = '<span class="kbd">WASD</span> CHOOSE · <span class="kbd">E</span> USE · <span class="kbd">TAB</span> NEXT TAB · <span class="kbd">ESC</span> CLOSE';
    } else {
      body.innerHTML = `<div class="mapw"><canvas></canvas></div><div class="legend"><div class="ph">${esc(this.story.name)}</div><i style="color:#fff">▲</i> You<br><i style="color:#f2c14e">◆</i> Your goal<br><i style="color:#f2c14e">!</i> Someone needs you<br><i style="color:#efe6d2">●</i> Shop<br><i style="color:#ff4a3a">●</i> Fighters<br><i style="color:#f2c14e">●</i> ${esc(this.story.boss.def.name)}<br><i style="color:#e0503a">⛩</i> Gates</div>`;
      this.drawBigMap(body.querySelector('canvas'));
      foot.innerHTML = '<span class="kbd">TAB</span> NEXT TAB · <span class="kbd">ESC</span> CLOSE';
    }
  }
  drawBigMap(cv) {
    const mc = this.L.minimap, x0 = -52, x1 = 52, z0 = -90, z1 = 90, S = 4;
    cv.width = (x1 - x0) * S; cv.height = (z1 - z0) * S;
    const g = cv.getContext('2d');
    g.drawImage(mc, (x0 - MAP.x0) * S, (z0 - MAP.z0) * S, cv.width, cv.height, 0, 0, cv.width, cv.height);
    const X = x => (x - x0) * S, Z = z => (z - z0) * S;
    const dot = (x, z, col, txt, r = 9) => { g.fillStyle = '#000'; g.beginPath(); g.arc(X(x), Z(z), r + 3, 0, TAU); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(X(x), Z(z), r, 0, TAU); g.fill(); if (txt) { g.fillStyle = '#120709'; g.font = 'bold ' + Math.round(r * 1.5) + 'px Silkscreen, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, X(x), Z(z) + 1); } };
    for (const k of ['S', 'N']) { const [x, z] = this.P.gates[k]; dot(x, z, '#e0503a', '', 10); }
    for (const a of this.actors) { if (a.gone) continue; const p = a.ch.root.position;
      if (a.kind === 'boss') dot(p.x, p.z, '#f2c14e', '', 12); else if (a.kind === 'foe' || a.kind === 'duelist') dot(p.x, p.z, '#ff4a3a', '', 8);
      else if (a.kind === 'npc' && a.mkText && (a.mkText[0] === '!' || a.mkText[0] === '?')) dot(p.x, p.z, '#f2c14e', a.mkText[0], 12); else if (a.shop) dot(p.x, p.z, '#efe6d2', '', 8); }
    if (this.tgPos) { g.save(); g.translate(X(this.tgPos.x), Z(this.tgPos.z)); g.rotate(Math.PI / 4); g.fillStyle = '#000'; g.fillRect(-13, -13, 26, 26); g.fillStyle = '#f2c14e'; g.fillRect(-10, -10, 20, 20); g.restore(); }
    g.save(); g.translate(X(this.p.x), Z(this.p.z)); g.rotate(-this.p.yaw + Math.PI);
    g.fillStyle = '#000'; g.beginPath(); g.moveTo(0, -20); g.lineTo(14, 15); g.lineTo(0, 7); g.lineTo(-14, 15); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, -14); g.lineTo(9, 10); g.lineTo(0, 5); g.lineTo(-9, 10); g.closePath(); g.fill(); g.restore();
  }

  /* ================= the shop ================= */
  openShop(a) {
    this.shopOpen = true; this.shopWho = a; this.shopSel = this.shopSel || 0;
    this.el('.shop').classList.add('on'); this.el('.prompt').style.display = 'none';
    this.renderShop();
  }
  closeShop() { this.shopOpen = false; this.el('.shop').classList.remove('on'); this.api.sfx('back'); }
  shopKey(code) {
    const n = Object.keys(SUPPLIES).length;
    if (code === 'Escape' || code === 'KeyC') return this.closeShop();
    if (code === 'KeyW' || code === 'ArrowUp') { this.shopSel = (this.shopSel + n - 1) % n; this.api.sfx('move'); this.renderShop(); }
    else if (code === 'KeyS' || code === 'ArrowDown') { this.shopSel = (this.shopSel + 1) % n; this.api.sfx('move'); this.renderShop(); }
    else if (code === 'KeyE' || code === 'Enter' || code === 'Space') this.buy();
  }
  buy() {
    const id = Object.keys(SUPPLIES)[this.shopSel], it = SUPPLIES[id], S = this.S;
    if ((S.ryo || 0) < it.price) { this.toast('💰', 'NOT ENOUGH RYO'); this.api.sfx('back'); return; }
    S.ryo -= it.price; this.addItem(id); this.save(); this.purse(); this.api.sfx('ok'); this.renderShop();
  }
  renderShop() {
    const S = this.S, a = this.shopWho;
    this.el('.shop').innerHTML = `<h3>${esc(a.name)}<span>${S.ryo || 0} RYO</span></h3><p>Supplies for the road. Use them from your bag before a duel.</p>` +
      Object.entries(SUPPLIES).map(([id, it], k) => `<div class="srow${k === this.shopSel ? ' sel' : ''}${(S.ryo || 0) < it.price ? ' poor' : ''}" data-row="${k}"><div class="ic">${it.icon}</div><div class="tx"><b>${esc(it.name)}</b><span>${esc(it.desc)}</span></div><div class="own">OWN ${S.inv[id] || 0}</div><div class="pr">${it.price} RYO</div></div>`).join('') +
      `<div class="ft"><span class="kbd">W</span><span class="kbd">S</span> CHOOSE · <span class="kbd">E</span> BUY · <span class="kbd">ESC</span> LEAVE</div>`;
  }

  /* ================= leaving ================= */
  goTo(lv, from) {
    if (this.fading) return;
    this.fading = true;
    this.el('.fade').style.opacity = '1';
    this.api.sfx('ok');
    setTimeout(() => { this.fading = false; this.api.go(lv, from); }, 480);
  }
  fadeIn() { const f = this.el('.fade'); f.style.transition = 'none'; f.style.opacity = '1'; void f.offsetWidth; f.style.transition = ''; f.style.opacity = '0'; }
  finish() {
    if (this.fading) return;
    this.fading = true;
    this.banner('THE END OF THE ROAD', 'STORY COMPLETE', 'Twenty masters. One sword. Yours.');
    setTimeout(() => { this.el('.fade').style.opacity = '1'; }, 2500);
    setTimeout(() => { this.fading = false; this.leave(); this.api.next(20); }, 3200);
  }
  leave() {
    this.active = false;
    document.body.classList.remove('w3d');
    for (const s of ['.talk', '.prompt', '.pause']) this.el(s).style.display = 'none';
    this.el('.menu').classList.remove('on'); this.el('.shop').classList.remove('on');
    this.el('.fade').style.opacity = '0';
    this.menuOpen = this.shopOpen = false; this.talk = null;
  }
}

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function cap(name) { return name.split(' ').map(w => w[0] + w.slice(1).toLowerCase()).join(' '); }
let _dia;
function diamondTex() {
  if (_dia) return _dia;
  const c = document.createElement('canvas'); c.width = 64; c.height = 96; const g = c.getContext('2d');
  g.translate(32, 40); g.fillStyle = '#000'; g.beginPath(); g.moveTo(0, -36); g.lineTo(26, 0); g.lineTo(0, 36); g.lineTo(-26, 0); g.closePath(); g.fill();
  g.fillStyle = '#f2c14e'; g.beginPath(); g.moveTo(0, -28); g.lineTo(19, 0); g.lineTo(0, 28); g.lineTo(-19, 0); g.closePath(); g.fill();
  g.fillStyle = '#fff4c8'; g.beginPath(); g.moveTo(0, -28); g.lineTo(19, 0); g.lineTo(0, 0); g.closePath(); g.fill();
  return (_dia = new THREE.CanvasTexture(c));
}

let adv = null;
export function attach(host, before, api) { if (!adv) adv = new Adventure(host, before, api); else adv.api = api; return adv; }
