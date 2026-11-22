/* ================= buttons and controls =================
   The pad has a D-pad, A, B, START and SELECT. Four actions can be put on any of A, B, UP, DOWN or SELECT:
   ATTACK, SPECIAL (B alone blocks; B with a direction is a special), JUMP and BLOCK. The D-pad always gives
   the direction too, so with the defaults UP jumps and DOWN blocks. */
const ACTS=[['attack','ATTACK'],['special','SPECIAL / BLOCK'],['jump','JUMP'],['block','BLOCK']];
const CTRL_DEF={attack:'a',special:'b',jump:'up',block:'down'};
let CTRL=Object.assign({},CTRL_DEF,store.get('ctrl',{}));
function saveCtrl(){store.set('ctrl',CTRL);SAVE.ctrl=CTRL}
const BTN_NAMES={a:'A',b:'B',up:'UP',down:'DOWN',select:'SELECT'};
const RAW={held:{},tap:{}};
function rawInput(btn,down){unlock();if(down){if(!RAW.held[btn])RAW.tap[btn]=true;RAW.held[btn]=true}else RAW.held[btn]=false}
function clearTaps(){RAW.tap={}}
/* what the player's pad means to a fighter this frame */
function makePad(){return{x:0,up:false,down:false,pressed:{},held:{},t:0}}
const HUMAN=makePad();
function readPad(P){P.t++;P.x=(RAW.held.right?1:0)-(RAW.held.left?1:0);P.up=!!RAW.held.up;P.down=!!RAW.held.down;
  for(const[a]of ACTS){const b=CTRL[a];P.pressed[a]=!!(b&&RAW.tap[b]);P.held[a]=!!(b&&RAW.held[b])}}
/* assigning a button to an action swaps it with whatever had it */
function assign(act,btn){const old=CTRL[act];const other=ACTS.map(x=>x[0]).find(a=>a!==act&&CTRL[a]===btn);CTRL[act]=btn;if(other)CTRL[other]=old;saveCtrl()}
/* keyboard: arrows or WASD, Z/J attack, X/K special, Enter start, Shift select */
const KEYS={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right',
  z:'a',Z:'a',j:'a',J:'a',x:'b',X:'b',k:'b',K:'b',Enter:'start',Escape:'start',Shift:'select',' ':'up'};
addEventListener('keydown',e=>{const b=KEYS[e.key];if(!b)return;e.preventDefault();if(!e.repeat)rawInput(b,true)});
addEventListener('keyup',e=>{const b=KEYS[e.key];if(b)rawInput(b,false)});
addEventListener('blur',()=>{for(const k in RAW.held)RAW.held[k]=false});
/* touch pad (only outside the ZigaPlay) */
(()=>{const dp=document.getElementById('dp');const set=(e)=>{const r=dp.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,d=Math.hypot(x,y);
    const want={left:d>18&&x<-Math.abs(y)*.6,right:d>18&&x>Math.abs(y)*.6,up:d>18&&y<-Math.abs(x)*.6,down:d>18&&y>Math.abs(x)*.6};
    for(const k in want){if(want[k]!==!!RAW.held[k])rawInput(k,want[k]);dp.querySelector(`[data-d=${k}]`).classList.toggle('on',want[k])}};
  const end=()=>{for(const k of['left','right','up','down']){if(RAW.held[k])rawInput(k,false);dp.querySelector(`[data-d=${k}]`).classList.remove('on')}};
  dp.addEventListener('pointerdown',e=>{e.preventDefault();dp.setPointerCapture(e.pointerId);set(e)});dp.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')set(e)});
  dp.addEventListener('pointerup',end);dp.addEventListener('pointercancel',end);
  for(const[id,b]of[['bA','a'],['bB','b'],['bS','start']]){const el=document.getElementById(id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.classList.add('on');rawInput(b,true)});
    const up=()=>{el.classList.remove('on');rawInput(b,false)};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)}})();
/* menus: a repeat when a direction is held */
const REP={};function menuDir(){for(const d of['up','down','left','right']){if(RAW.tap[d]){REP[d]=performance.now()+300;return d}
    if(RAW.held[d]&&REP[d]&&performance.now()>REP[d]){REP[d]=performance.now()+90;return d}}return null}
