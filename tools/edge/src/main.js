/* ================= flow and the main loop ================= */
const SET=Object.assign({stocks:3,level:4,music:true},store.get('set',{}));
const PICK=Object.assign({p1:0,p2:1,stage:0},store.get('pick',{}));
function saveSet(){store.set('set',SET);store.set('pick',PICK)}
const TRAIN={dummy:'stand',names:{stand:'STAND',walk:'WALK',jump:'JUMP',shield:'SHIELD',cpu:'FIGHT BACK'},order:['stand','walk','jump','shield','cpu']};
function dummyCyc(d){const o=TRAIN.order;TRAIN.dummy=o[(o.indexOf(TRAIN.dummy)+d+o.length)%o.length];const f=G.fighters[1];if(f)f.ai.dummy=TRAIN.dummy}
function startMatch(mode){G.mode=mode;G.stocks=mode==='training'?99:SET.stocks;const def=STAGES[PICK.stage];G.stage=buildStage(def);setWorld(def,G.stage);showSet([]);
  Object.assign(G,{proj:[],tboxes:[],texts:[],matchEnd:null,slow:0,shake:0,flash:0,comboShow:null,banner:null,frame:0,trn:{prev:0,dmg:0,n:0}});VIEW.hideF=false;
  for(const k in HUMAN.held)HUMAN.held[k]=false;
  const a=new Fighter(ROSTER[PICK.p1],0,HUMAN,false),b=new Fighter(ROSTER[PICK.p2],1,aiPad(),true);aiInit(b,SET.level,mode==='training'?TRAIN.dummy:null);
  G.fighters=[a,b];placeFighters();for(const f of G.fighters)addFighterView(f);
  hudBuild();show('hud');updateCamera(true);G.state='ready';G.readyT=0;music(SET.music,def.song)}
function placeFighters(){const M=G.stage.main,x=(M.r-M.l)*.3;G.fighters[0].spawnAt(-x,M.y,1);G.fighters[1].spawnAt(x,M.y,-1);for(const f of G.fighters){f.st='stand';f.pct=0}}
function resetTraining(){G.proj.forEach(p=>p.life=0);placeFighters();G.trn={prev:0,dmg:0,n:0}}
/* one 60th of a second of the game */
function step(){readPad(HUMAN);SCR_T++;
  switch(G.state){
  case'menu':if(SCREEN==='title')titleTick();else if(SCREEN==='main'||SCREEN==='settings')menuTick(SCREEN);else if(SCREEN==='select')selectTick();else if(SCREEN==='stages')menuTick('stages');
    else if(SCREEN==='moves')movesTick();else if(SCREEN==='controls')controlsTick();break;
  case'pause':if(SCREEN==='pause')pauseTick();else if(SCREEN==='moves')movesTick();else if(SCREEN==='controls')controlsTick();break;
  case'results':menuTick('results');break;
  case'ready':G.readyT++;for(const f of G.fighters)f.clock++;const t=G.readyT;
    if(t===1)banner('3');else if(t===45)banner('2');else if(t===90)banner('1');else if(t===135){banner('GO!','#ffcc4a');SFX.go();G.state='fight'}
    if(t%45===1&&t<135)SFX.beep();break;
  case'fight':fightStep();break;
  case'game':if(--G.endT<=0)goResults();break}
  hudStep();tickFx();clearRaw()}
function fightStep(){if(HUMAN.menu.start&&!G.matchEnd){SFX.pick();goPause();return}
  if(G.slow>0){G.slow--;if(G.slow%2){for(const f of G.fighters)for(const a of ACTS)if(f.pad.pressed[a])f.buf[a]=f.clock;return}}
  for(const f of G.fighters)if(f.cpu)aiTick(f);
  for(const f of G.fighters)f.update();
  resolveHits();
  for(const p of G.proj)if(p.life>0)updProj(p);
  for(const p of G.proj)if(p.life<=0)projGone(p);G.proj=G.proj.filter(p=>p.life>0);
  G.shake=G.shake>.01?G.shake*.86:0;G.frame++;
  if(G.mode==='training')for(const f of G.fighters)if(f.stocks<50)f.stocks=99;
  if(G.matchEnd){if(!G.matchEnd.said){G.matchEnd.said=1;G.slow=40}if(--G.matchEnd.t<=90&&G.state==='fight'){G.state='game';G.endT=110;banner('GAME!','#ffcc4a');SFX.game();music(false)}}}
function projGone(p){if(!p.views)return;for(const v of p.views){const e=VIEW.fx.find(e=>e.obj===v);if(e)e.life=0}p.views=null}
/* drawing, as often as the screen refreshes */
const MENU_SCR=['title','main','settings','select','stages','moves','controls','results'];
function draw(){const menuView=MENU_SCR.includes(SCREEN)&&(G.state==='menu'||G.state==='results'||SCREEN==='moves');
  VIEW.hideF=G.state==='results'||G.state==='menu'||SCREEN==='moves';
  if(menuView&&CAMMODE){menuCam(CAMMODE);showTick()}else if(G.fighters.length&&G.state!=='menu')updateCamera(false);
  if(SCREEN==='moves'&&G.state==='pause')showTick();
  render3D();hudTick()}
let last=performance.now(),acc=0;const STEP=1000/60;
function frame(now){requestAnimationFrame(frame);let dt=now-last;last=now;if(dt>200)dt=200;acc+=dt;let n=0;
  while(acc>=STEP&&n<5){acc-=STEP;n++;try{step()}catch(e){console.error(e);showErr(e)}}if(acc>STEP*5)acc=0;
  try{draw()}catch(e){console.error(e);showErr(e)}}
function showErr(e){if(window.EDGE_ERR)return;window.EDGE_ERR=e;const el=$('#err');el.style.display='block';el.style.top='4px';el.style.fontSize='11px';el.textContent='Error: '+(e&&e.message||e)}
/* ---------- the ZigaPlay ---------- */
window.ZPCart={title:'Over the Edge',input(b,d){unlock();rawInput(b,d)},stick(x,y){rawStick(x,y)},
  home(){return['fight','pause','ready','game'].includes(G.state)?'ask':true},snapshot(){return null}};
try{ZP&&ZP.cartReady&&ZP.cartReady(window.ZPCart)}catch(e){}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.state==='fight')goPause()});
addEventListener('pointerdown',unlock);
/* ---------- start ---------- */
fitUI();addEventListener('resize',fitUI);
setMute(muted);goTitle();
/* draw the portraits a little at a time so the menus open instantly */
(()=>{let i=0;const next=()=>{if(i>=ROSTER.length)return;portrait(ROSTER[i++],'face');setTimeout(next,40)};setTimeout(next,300)})();
window.EDGE={G,step,draw,aiPad,aiInit,VIEW,HUMAN,RAW,MAP,startMatch,PICK,SET,TRAIN,goTitle,goMain,goSelect,goMoves,goControls,goStages,show,get screen(){return SCREEN}};
requestAnimationFrame(frame);
