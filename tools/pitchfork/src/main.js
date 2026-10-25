/* ---------- main: sizing, input and the loop ---------- */
const field=document.getElementById('field');
function resize(){const w=field.clientWidth,h=field.clientHeight;if(!w||!h)return;
  const nw=clamp(Math.round(H*w/h/2)*2,200,400);if(nw!==W){W=nw;cv.width=W;cv.height=H;ctx.imageSmoothingEnabled=false;nightCv=null;if(B)clampCam()}
  const s=Math.min(w/W,h/H);const cw=Math.floor(W*s),ch=Math.floor(H*s);
  const l=Math.floor((w-cw)/2),t=Math.floor((h-ch)/2);for(const e of[cv,UI]){e.style.left=l+'px';e.style.top=t+'px';e.style.width=cw+'px';e.style.height=ch+'px'}
  document.documentElement.style.setProperty('--u',(ch/H)+'px')}
addEventListener('resize',resize);if(window.ResizeObserver)new ResizeObserver(resize).observe(field);

/* input: the console's buttons, the keyboard, or on-screen buttons */
const DIRS={up:1,down:1,left:1,right:1};let repT=null;
function btn(b,down){
  if(down){AU.unlock();if(HELD[b])return;HELD[b]=1;press(b);
    if(DIRS[b]&&MODE!=='battle'){clearTimeout(repT);const rep=()=>{if(!HELD[b]||MODE==='battle')return;press(b);repT=setTimeout(rep,MODE==='deploy'?70:110)};repT=setTimeout(rep,MODE==='deploy'?220:330)}}
  else HELD[b]=0}
function press(b){try{if(SCR&&SCR.btn)SCR.btn(b)}catch(e){console.error(e)}}
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right',z:'a',Z:'a',j:'a',' ':'a',x:'b',X:'b',k:'b',Enter:'start',Escape:'start',Shift:'select',Tab:'select',l:'select'};
addEventListener('keydown',e=>{const b=KEYMAP[e.key];if(b){e.preventDefault();btn(b,true)}});
addEventListener('keyup',e=>{const b=KEYMAP[e.key];if(b){e.preventDefault();btn(b,false)}});
addEventListener('blur',()=>{for(const k in HELD)HELD[k]=0});
(()=>{let inConsole=false;try{inConsole=window.parent!==window&&!!window.parent.ZIGAPLAY}catch(e){}
  const touch='ontouchstart' in window||matchMedia('(pointer:coarse)').matches;if(inConsole||!touch)return;
  document.body.classList.add('touch');const pad=document.getElementById('pad');const active=new Map();
  const hit=(x,y)=>{const e=document.elementFromPoint(x,y);return e&&e.dataset&&e.dataset.b?e:null};
  const upd=ev=>{ev.preventDefault();const now=new Map();for(const t of ev.touches){const e=hit(t.clientX,t.clientY);if(e)now.set(e.dataset.b,e)}
    for(const[b,e]of active)if(!now.has(b)){e.classList.remove('on');btn(b,false)}for(const[b,e]of now)if(!active.has(b)){e.classList.add('on');btn(b,true)}
    active.clear();for(const[b,e]of now)active.set(b,e)};
  for(const ev of['touchstart','touchmove','touchend','touchcancel'])pad.addEventListener(ev,upd,{passive:false});setTimeout(resize,0)})();
window.ZPCart={title:'Pitchfork Rising',input(b,d){btn(b,d)},home(){return MODE==='title'||MODE==='camp'?true:'ask'}};

/* loop */
let last=performance.now(),T=0;
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
  try{if(SCR&&SCR.update)SCR.update(dt);if(SCR&&SCR.draw)SCR.draw(T)}catch(e){console.error(e)}
  requestAnimationFrame(frame)}
// test hook: lets a script drive the game without waiting for frames
window.__PF={get B(){return B},get G(){return G},set G(v){G=v},get MODE(){return MODE},get DEP(){return DEP},btn,step(dt,n=1){for(let i=0;i<n;i++){if(SCR&&SCR.update)SCR.update(dt)}},BATTLES,startDeploy,beginFight,toCamp,HELD,updateBattle,leaderInput,setOrder,applyWin,leaderStats,setScreen};
resize();titleScreen();requestAnimationFrame(frame);
