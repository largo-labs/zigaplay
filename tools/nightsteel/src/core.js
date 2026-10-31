/* ================= the engine: screen, input, the loop, saves ================= */
const ZP=(()=>{try{return window.parent!==window&&window.parent.ZIGAPLAY||null}catch(e){return null}})();
if(ZP)document.documentElement.classList.add('zp');
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const rnd=Math.random,ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const fmt=n=>Math.floor(n).toLocaleString('en-US');

/* ---------- the screen ---------- */
const cv=$('#cv'),ctx=cv.getContext('2d'),UI=$('#ui'),FIELD=$('#field');
let W=320;const H=180;let U=2;
function layout(){const fw=FIELD.clientWidth,fh=FIELD.clientHeight;if(!fw||!fh)return;
  W=clamp(Math.round(H*fw/fh),280,400);const k=Math.min(fw/W,fh/H);U=k;
  const cw=W*k,ch=H*k,l=(fw-cw)/2,t=(fh-ch)/2;
  cv.width=W;cv.height=H;Object.assign(cv.style,{width:cw+'px',height:ch+'px',left:l+'px',top:t+'px'});
  Object.assign(UI.style,{width:cw+'px',height:ch+'px',left:l+'px',top:t+'px'});document.documentElement.style.setProperty('--u',k+'px');ctx.imageSmoothingEnabled=false}
addEventListener('resize',layout);
/* the pointing hand, drawn once */
{const b=new Buf(10,7);b.rect(0,2,6,3,'#f4f4f8');b.rect(5,1,4,2,'#f4f4f8');b.rect(6,3,3,1,'#d8dcec');b.rect(1,5,4,1,'#c8cce0');b.outline('#1a1c3a');document.documentElement.style.setProperty('--hand',`url(${b.canvas(4).toDataURL()})`)}

/* ---------- input: the console's buttons, a keyboard, or touch ---------- */
const held=new Set();let inputHandler=null,repeatT=0;
const DIRS={up:1,down:1,left:1,right:1};
function press(b,down){if(down){if(held.has(b))return;held.add(b);SND.unlock();if(inputHandler)inputHandler(b);
    if(DIRS[b]){clearTimeout(repeatT);const go=n=>{repeatT=setTimeout(()=>{if(held.has(b)&&inputHandler&&menuRepeat()){inputHandler(b,true);go(90)}},n)};go(320)}}
  else{held.delete(b);if(inputUp)inputUp(b)}}
let inputUp=null;
const menuRepeat=()=>!!(S_SCENE&&S_SCENE.repeat);
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',z:'a',Z:'a',' ':'a',x:'b',X:'b',Escape:'b',Backspace:'b',Enter:'start',Shift:'select',c:'select',C:'select'};
addEventListener('keydown',e=>{if(TEXT_HOOK&&TEXT_HOOK(e))return;const b=KEYMAP[e.key];if(!b||e.metaKey||e.ctrlKey||e.altKey)return;e.preventDefault();if(e.repeat)return;press(b,true)});
addEventListener('keyup',e=>{const b=KEYMAP[e.key];if(b){e.preventDefault();press(b,false)}});
addEventListener('blur',()=>{for(const b of[...held])press(b,false)});
let TEXT_HOOK=null;
/* touch, when playing on its own */
if(!ZP){addEventListener('touchstart',()=>document.documentElement.classList.add('touch'),{once:true,capture:true});
  const pad=$('#tpad');let pid=null,pd=null;const padSet=d=>{if(d===pd)return;if(pd)press(pd,false);pd=d;if(d)press(d,true)};
  const padAt=e=>{const r=pad.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);if(Math.hypot(dx,dy)<12)return null;return Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')};
  pad.addEventListener('pointerdown',e=>{e.preventDefault();pid=e.pointerId;pad.setPointerCapture(pid);padSet(padAt(e))});
  pad.addEventListener('pointermove',e=>{if(e.pointerId===pid)padSet(padAt(e))});
  for(const t of['pointerup','pointercancel'])pad.addEventListener(t,e=>{if(e.pointerId===pid){pid=null;padSet(null)}});
  for(const n of $$('#touch .tb')){const b=n.dataset.b;n.addEventListener('pointerdown',e=>{e.preventDefault();n.setPointerCapture(e.pointerId);press(b,true)});for(const t of['pointerup','pointercancel'])n.addEventListener(t,()=>press(b,false))}}

/* ---------- scenes: each owns the canvas drawing and the input while it runs ---------- */
let S_SCENE=null;
function setScene(sc){if(S_SCENE&&S_SCENE.leave)S_SCENE.leave();S_SCENE=sc;inputHandler=(b,rep)=>{if(MODAL.length){MODAL[MODAL.length-1].input(b,rep);return}if(S_SCENE&&S_SCENE.input)S_SCENE.input(b,rep)};inputUp=b=>{if(!MODAL.length&&S_SCENE&&S_SCENE.up)S_SCENE.up(b)};if(sc.enter)sc.enter()}
/* menus stack over the scene */
const MODAL=[];
function pushModal(m){MODAL.push(m);if(m.open)m.open();return m}
function popModal(m){const i=MODAL.indexOf(m);if(i>=0)MODAL.splice(i,1);if(m.close)m.close();if(m.el&&m.el.remove)m.el.remove()}
let last=performance.now(),TIME=0;
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;TIME+=dt;
  try{if(S_SCENE){S_SCENE.update&&S_SCENE.update(dt);S_SCENE.draw&&S_SCENE.draw(dt)}for(const m of MODAL)m.tick&&m.tick(dt)}catch(e){console.error(e)}
  requestAnimationFrame(frame)}

/* ---------- sprites of characters, cached as canvases ---------- */
const _dollC=new Map();
function lookKey(L,w){return JSON.stringify([L,w&&[w.kind,w.parts,w.c1,w.c2,w.c3,w.c4,w.c5,w.gemC,w.engr,w.elem]])}
function heroSprite(L,w,pose,flip=false){const key=lookKey(L,w)+'|'+pose+'|'+flip;let c=_dollC.get(key);
  if(!c){const b=drawHero(L,w,pose);c=b.canvas(1,flip);_dollC.set(key,c);if(_dollC.size>500){const k0=_dollC.keys().next().value;_dollC.delete(k0)}}return c}
/* draw a character with the feet at (x, y) on the canvas */
function drawHeroAt(g,L,w,pose,x,y,flip=false,alpha=1){const c=heroSprite(L,w,pose,flip);g.globalAlpha=alpha;g.drawImage(c,Math.round(x-(flip?DOLL_W-DOLL_FX:DOLL_FX)),Math.round(y-DOLL_FY));g.globalAlpha=1}

/* ---------- saving: on this device, and (inside the ZigaPlay) in your account ---------- */
const SKEY='nightsteel-save',ZC=ZP&&ZP.cloud&&typeof ZP.cloud.save==='function'?ZP.cloud:null;
function writeSave(data){data.savedAt=Date.now();const j=JSON.stringify(data);try{localStorage.setItem(SKEY,j)}catch(e){}
  if(ZC)try{ZC.save('nightsteel',j,{lv:data.party&&data.party[0]?data.party[0].lv:1,where:data.zoneName||''})}catch(e){}}
function readLocal(){try{const j=localStorage.getItem(SKEY);return j?JSON.parse(j):null}catch(e){return null}}
async function readBest(){let best=readLocal();
  if(ZC){try{const r=await Promise.race([ZC.load('nightsteel'),sleep(6000).then(()=>null)]);if(r&&r.ok&&r.json){const c=JSON.parse(r.json);if(c&&(!best||(+c.savedAt||0)>(+best.savedAt||0)))best=c}}catch(e){}}
  return best}
function flushCloud(){if(ZC)try{return ZC.flush('nightsteel')}catch(e){}}
