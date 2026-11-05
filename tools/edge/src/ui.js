/* ================= menus: an HTML layer over the 3D view ================= */
const UI=$('#ui');
document.head.insertAdjacentHTML('beforeend',`<style>
.st.fl{background:#4a2a08;box-shadow:inset 0 0 0 2px #ffcc4a;color:#ffe08a}
.logo{position:absolute;left:0;right:0;top:54px;text-align:center;font:900 italic 64px/.92 var(--ui);letter-spacing:.02em;color:#fff;-webkit-text-stroke:3px #10142a;paint-order:stroke fill;
  text-shadow:0 6px 0 #10142a,0 0 34px rgba(255,120,60,.75);transform:skewX(-6deg)}
.logo small{display:block;font:900 italic 15px/1 var(--ui);letter-spacing:.5em;color:var(--gold);-webkit-text-stroke:0;text-shadow:0 2px 0 #000;margin-top:10px}
.blink{animation:bl 1.1s steps(2) infinite}@keyframes bl{50%{opacity:0}}
.press{position:absolute;left:0;right:0;top:250px;text-align:center;font:900 italic 18px/1 var(--ui);letter-spacing:.12em;color:#fff;text-shadow:0 2px 0 #000,0 0 12px rgba(0,0,0,.8)}
.top{position:absolute;left:20px;top:14px}.top .sub{margin-top:4px}
.box{position:absolute;padding:10px 12px}
.ctl{display:grid;grid-template-columns:1fr auto;gap:4px 10px;font:800 12px/1.3 var(--ui);color:var(--dim)}
.ctl b{color:#fff}
.wait{position:absolute;inset:0;display:none;place-items:center;background:rgba(5,8,20,.7);font:900 italic 22px/1.3 var(--ui);text-align:center;color:#fff;text-shadow:0 2px 0 #000}
.wait.on{display:grid}
.ft{font:700 10.5px/1.35 var(--ui);color:var(--dim)}
.menu.cmp .item{height:26px;font-size:15px}
#s-controls .ctl{font-size:11px;line-height:1.1;gap:3px 8px}#s-controls .ctl .k,#s-controls .ctl .st{transform:scale(.82);margin:-1px -1px}
</style>`);
function scr(id){let el=document.getElementById('s-'+id);if(!el){el=document.createElement('div');el.className='scr';el.id='s-'+id;UI.appendChild(el)}return el}
let SCREEN='',SCR_T=0;
function show(id){for(const e of UI.children)if(e.classList.contains('scr'))e.classList.toggle('on',e.id==='s-'+id);SCREEN=id;SCR_T=0}
/* button and stick badges, always showing the player's current mapping */
const KL={a:'A',b:'B',c:'C',d:'D',select:'SEL'};
const kb=b=>b?`<span class="k ${b==='select'?'S':KL[b]}">${KL[b]}</span>`:'<span class="k X">–</span>';
const ka=a=>a==='grab'&&!MAP.grab?kb(MAP.shield)+'+'+kb(MAP.attack):kb(MAP[a]);
const ARW={r:'→',l:'←',u:'↑',d:'↓',n:'•',ud:'↕',lr:'↔',any:'✥'};
const stk=(d,fl)=>`<span class="st${fl?' fl':''}">${ARW[d]||d}</span>`;
const smashIn=d=>MAP.smash?stk(d,1)+'+'+ka('attack'):(d==='r'?'':stk(d)+'+')+ka('attack')+'+'+ka('special');
/* a list menu: up and down to choose, left and right to change a value, A to pick, B to go back */
const MENU={};
function buildMenu(id,items,{x=24,y=96,w=240,back,gap}={}){const el=scr(id);let m=el.querySelector('.menu');if(!m){m=document.createElement('div');m.className='menu';el.appendChild(m)}
  m.style.cssText=`left:${x}px;top:${y}px;width:${w}px${gap!=null?';gap:'+gap+'px':''}`;MENU[id]={items,sel:Math.min(MENU[id]?.sel||0,items.length-1),m,back};drawMenu(id)}
function drawMenu(id){const M=MENU[id];M.m.innerHTML=M.items.map((it,i)=>`<div class="item${i===M.sel?' sel':''}"><span>${typeof it.label==='function'?it.label():it.label}</span>${it.val?`<span class="val">${it.val()}</span>`:''}</div>`).join('')}
function menuTick(id){const M=MENU[id],P=HUMAN;if(!M)return;const d=menuDir();
  if(d==='up'||d==='down'){M.sel=(M.sel+(d==='up'?-1:1)+M.items.length)%M.items.length;SFX.move();drawMenu(id);M.onMove&&M.onMove()}
  const it=M.items[M.sel];
  if((d==='left'||d==='right')&&it[d]){it[d]();SFX.move();drawMenu(id)}
  if(P.menu.a||P.menu.start){if(it.act){SFX.pick();it.act()}else if(it.right){it.right();SFX.move();drawMenu(id)}}
  else if(P.menu.b&&M.back){SFX.back();M.back()}}
/* ---------- fighters shown in menus (not in a match) ---------- */
const SHOW={rigs:{},list:[]};
function showRig(ch){let R=SHOW.rigs[ch.id];if(!R){R=buildRig(ch.look);R.pose=new Float32Array(PK.length);R.tgt=new Float32Array(PK.length);SHOW.rigs[ch.id]=R}return R}
function showSet(arr){for(const s of SHOW.list)SC.remove(s.R.root);SHOW.list=arr.map(o=>{const R=showRig(o.ch);SC.add(R.root);R.root.position.set(o.x||0,0,o.z||0);R.root.rotation.set(0,o.yaw||0,0);return Object.assign({R,t:0},o)})}
function showTick(){for(const s of SHOW.list){s.t++;const R=s.R,w=!!s.ch.look.weapon;
  if(s.move){const d=s.move,len=Math.max(30,(d.s??6)+(d.a??3)+(d.r??14)+14),f=s.t%(len+20);
    if(f>=len)mixPose(R.pose,POSE[w?'stanceW':'stance'],.2,R.tgt);else sampleMove({def:d,f,len,go:f>12?12:0,fire:f>12?12:0,c:Math.min(60,f*3),air:!!d.air},R.tgt)}
  else if(s.pose)R.tgt.set(POSE[s.pose]);
  else{const k=w?'stanceW':'stance';mixPose(POSE[k],POSE[k+'2'],(Math.sin(s.t/16)+1)/2,R.tgt)}
  mixPose(R.pose,R.tgt,.35,R.pose);applyPose(R,R.pose);
  R.root.position.y=s.move&&s.move.air?Math.min(.9,s.t%200<6?0:.9):0;
  if(s.spin)R.root.rotation.y+=s.spin}}
/* a camera for menu screens; ux is where on the 640-wide layout the subject should sit */
function menuCam(o){const{tx=0,ty=1,d=5,ux=320,orbit=0,h=.4}=o,t=SCR_T;CAM.fov=30;CAM.updateProjectionMatrix();
  const px=innerWidth/2+(ux-320)*UIS,ndc=px/innerWidth*2-1,halfW=d*Math.tan(15*D2R)*CAM.aspect,off=-ndc*halfW;
  if(orbit){const a=Math.sin(t/400)*orbit;CAM.position.set(tx+Math.sin(a)*d,ty+h*d*.25,Math.cos(a)*d);CAM.lookAt(tx,ty,0)}
  else{CAM.position.set(tx+off,ty+h,d);CAM.lookAt(tx+off,ty,0)}}
/* ---------- title and main menu ---------- */
function goTitle(){G.state='menu';const def=pick(STAGES);G.stage=buildStage(def);setWorld(def,G.stage);
  const a=pick(ROSTER),b=pick(ROSTER.filter(c=>c!==a));showSet([{ch:a,x:-1.25,yaw:.9},{ch:b,x:1.25,yaw:-.9}]);
  const el=scr('title');el.innerHTML=`<div class="logo">OVER THE EDGE<small>PLATFORM FIGHTER</small></div><div class="press blink">PRESS ${kb('a')} OR START</div><div class="hint">${stk('any')} MOVE · ${kb('a')} ${kb('b')} ${kb('c')} ${kb('d')} · START PAUSE</div>`;
  show('title');CAMMODE={tx:0,ty:1.1,d:7.5,orbit:.6,h:1.2};music(SET.music,'menu')}
let CAMMODE=null;
function titleTick(){if(HUMAN.menu.a||HUMAN.menu.start){SFX.pick();goMain()}}
function goMain(){G.state='menu';const el=scr('main');if(!el.querySelector('.top'))el.innerHTML=`<div class="top"><div class="hdr">MAIN MENU</div><div class="sub">1 player against the computer</div></div><div class="hint">${kb('a')} CHOOSE · ${kb('b')} BACK</div>`;
  buildMenu('main',[{label:'FIGHT',act:()=>goSelect('vs')},{label:'TRAINING',act:()=>goSelect('training')},{label:'MOVES LIST',act:()=>goMoves(PICK.p1,'main')},
    {label:'CONTROLS',act:()=>goControls('main')},{label:'SETTINGS',act:()=>goSettings()}],{x:24,y:90,w:230,back:goTitle});
  if(!SHOW.list.length||SCREEN!=='title'){const a=ROSTER[PICK.p1],b=ROSTER[PICK.p2];showSet([{ch:a,x:-1.25,yaw:.9},{ch:b,x:1.25,yaw:-.9}])}
  show('main');CAMMODE={tx:0,ty:1.1,d:7.5,ux:440,h:.9}}
function goSettings(){const el=scr('settings');el.innerHTML=`<div class="top"><div class="hdr">SETTINGS</div><div class="sub">${stk('lr')} to change</div></div><div class="hint">${kb('b')} BACK</div>`;
  buildMenu('settings',[{label:'STOCKS',val:()=>SET.stocks,left:()=>{SET.stocks=Math.max(1,SET.stocks-1)},right:()=>{SET.stocks=Math.min(5,SET.stocks+1)}},
    {label:'CPU LEVEL',val:()=>SET.level,left:()=>{SET.level=Math.max(1,SET.level-1)},right:()=>{SET.level=Math.min(9,SET.level+1)}},
    {label:'SOUND',val:()=>muted?'OFF':'ON',left:()=>setMute(!muted),right:()=>setMute(!muted)},
    {label:'VIBRATION',val:()=>HAPTIC.on?'ON':'OFF',left:()=>setVib(!HAPTIC.on),right:()=>setVib(!HAPTIC.on)},
    {label:'MUSIC',val:()=>SET.music?'ON':'OFF',left:()=>{SET.music=!SET.music;music(SET.music,'menu')},right:()=>{SET.music=!SET.music;music(SET.music,'menu')}},
    {label:'BACK',act:()=>{saveSet();goMain()}}],{x:24,y:80,w:280,back:()=>{saveSet();goMain()}});show('settings')}
/* ---------- controls: change which button does what ---------- */
let REMAP=null,CTL_BACK='main';
const CTL_BTNS=['a','b','c','d','select',''];
function assign(act,btn){const old=MAP[act];if(old===btn)return true;const other=btn?ACTIONS.map(a=>a[0]).find(a=>a!==act&&MAP[a]===btn):null;
  if(other){if(!old&&other!=='grab')return false;MAP[other]=old||''}MAP[act]=btn;saveMap();return true}
function goControls(back){CTL_BACK=back||'main';const el=scr('controls');
  el.innerHTML=`${CTL_BACK==='pause'?'<div class="dim"></div>':''}<div class="top"><div class="hdr">CONTROLS</div><div class="sub">${kb('a')} then press a button to set it · ${stk('lr')} to cycle</div></div>
  <div class="pane box" style="left:350px;top:60px;width:276px;padding:8px 10px"><div class="ctl" id="ctlInfo"></div></div>
  <div class="hint">${kb('b')} BACK · START cancels while setting</div><div class="wait" id="ctlWait"></div>`;
  const items=ACTIONS.map(([a,nm])=>({label:nm,val:()=>a==='grab'&&!MAP.grab?kb(MAP.shield)+'+'+kb(MAP.attack):kb(MAP[a]),act:()=>{REMAP={a,nm,t:0}},
    left:()=>cyc(a,-1),right:()=>cyc(a,1)}));
  items.push({label:'TAP UP TO JUMP',val:()=>MAP.tapJump?'ON':'OFF',left:()=>{MAP.tapJump=!MAP.tapJump;saveMap()},right:()=>{MAP.tapJump=!MAP.tapJump;saveMap()}},
    {label:'FLICK FOR SMASH',val:()=>MAP.smash?'ON':'OFF',left:()=>{MAP.smash=!MAP.smash;saveMap()},right:()=>{MAP.smash=!MAP.smash;saveMap()}},
    {label:'RESET TO DEFAULT',act:()=>{MAP=Object.assign({},DEFAULT_MAP);saveMap();drawMenu('controls');ctlInfo()}},{label:'DONE',act:()=>ctlBack()});
  buildMenu('controls',items,{x:20,y:60,w:318,gap:3,back:ctlBack});MENU.controls.m.classList.add('cmp');ctlInfo();show('controls')}
function cyc(a,d){let i=CTL_BTNS.indexOf(MAP[a]);for(let n=0;n<6;n++){i=(i+d+6)%6;if(CTL_BTNS[i]===''&&a!=='grab')continue;if(assign(a,CTL_BTNS[i]))break}ctlInfo()}
function ctlBack(){REMAP=null;if(CTL_BACK==='pause')goPause();else goMain()}
function ctlInfo(){const e=$('#ctlInfo');if(!e)return;e.innerHTML=`<b>MOVE</b><span>${stk('any')} tilt to walk, push to run</span><b>JUMP</b><span>${ka('jump')}${MAP.tapJump?' or '+stk('u',1):''} · tap for a short hop</span>
  <b>ATTACK</b><span>${ka('attack')} + ${stk('any')}</span><b>SMASH</b><span>${MAP.smash?stk('r',1)+'+'+ka('attack')+' or ':''}${ka('attack')}+${ka('special')}</span><b>SPECIAL</b><span>${ka('special')} + ${stk('n')}${stk('r')}${stk('u')}${stk('d')}</span>
  <b>SHIELD</b><span>hold ${ka('shield')}</span><b>PARRY</b><span>${ka('shield')} just as a hit lands</span><b>DODGE</b><span>${ka('shield')} + ${stk('l',1)}${stk('r',1)}${stk('d',1)}</span>
  <b>AIR DODGE</b><span>${ka('shield')} in the air + ${stk('any')}</span><b>GRAB</b><span>${ka('grab')}${MAP.grab?' or '+kb(MAP.shield)+'+'+kb(MAP.attack):''} · throw ${stk('any')}</span>
  <b>FAST FALL</b><span>${stk('d',1)} in the air</span><b>DROP</b><span>${stk('d',1)} on a platform</span><b>PAUSE</b><span>START</span>`}
function controlsTick(){if(REMAP){const w=$('#ctlWait');w.classList.add('on');w.innerHTML=`<div>PRESS A BUTTON FOR<br><span style="color:var(--gold)">${REMAP.nm}</span><div class="sub" style="margin-top:8px">${kb('a')} ${kb('b')} ${kb('c')} ${kb('d')} ${kb('select')} · START to cancel</div></div>`;
    REMAP.t++;if(REMAP.t<3)return;const P=HUMAN.menu;if(P.start){REMAP=null;w.classList.remove('on');SFX.back();return}
    for(const b of['a','b','c','d','select'])if(P[b]){if(assign(REMAP.a,b))SFX.pick();else SFX.back();REMAP=null;w.classList.remove('on');drawMenu('controls');ctlInfo();return}return}
  menuTick('controls')}
/* ---------- pause ---------- */
function goPause(){G.state='pause';showSet([]);const el=scr('pause');const tr=G.mode==='training';
  el.innerHTML=`<div class="dim"></div><div class="top"><div class="hdr">PAUSED</div><div class="sub">${tr?'TRAINING':'STOCK MATCH'} · ${G.stage.name}</div></div><div class="hint">START RESUME</div>`;
  const items=[{label:'RESUME',act:resume}];
  if(tr)items.push({label:'DUMMY',val:()=>TRAIN.names[TRAIN.dummy],left:()=>dummyCyc(-1),right:()=>dummyCyc(1)},{label:'RESET POSITIONS',act:()=>{resetTraining();resume()}},{label:'SHOW HITBOXES',val:()=>G.showHB?'ON':'OFF',left:()=>{G.showHB=!G.showHB},right:()=>{G.showHB=!G.showHB}});
  items.push({label:'MOVES LIST',act:()=>goMoves(G.fighters[0].ch.idx,'pause')},{label:'CONTROLS',act:()=>goControls('pause')},{label:'QUIT MATCH',act:()=>{music(SET.music,'menu');goMain()}});
  buildMenu('pause',items,{x:24,y:84,w:270,back:resume});show('pause');music(false)}
function resume(){G.state='fight';show('hud');music(SET.music,G.stage.def.song)}
function pauseTick(){if(HUMAN.menu.start&&SCR_T>2){SFX.pick();resume();return}menuTick('pause')}
