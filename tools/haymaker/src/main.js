/* ================= the loop, saving, the console ================= */
const SCREENS={title:[titleTick,titleDraw],select:[selectTick,selectDraw],ladder:[ladderTick,ladderDraw],vsintro:[vsTick,vsDraw],fight:[fightTick,fightDraw],
  pause:[pauseTick,pauseDraw],result:[resultTick,resultDraw],champ:[champTick,champDraw],moves:[movesTick,movesDraw],settings:[settingsTick,settingsDraw],locker:[lockerTick,lockerDraw]};
/* the right song for the screen: the venue's own in a fight */
function songFor(){if(['fight','pause','vsintro'].includes(SCR)||SCR==='moves'&&MV.back==='pause')return M?VENUES[M.venue].song:'title';
  if(SCR==='result')return null;if(SCR==='champ')return'crown';if(['select','ladder','locker'].includes(SCR))return'corner';return'title'}
function step(dt){TT+=dt;SCREENS[SCR][0](dt);if(MSG&&(MSG.t-=dt)<=0)MSG=null;
  if(AC&&AC.state==='running'){const want=songFor();if(want===null){if(MUS.on)music(false)}else if(!MUS.on||MUS.song!==want)music(true,want)}}
function draw(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.lineCap='round';ctx.lineJoin='round';SCREENS[SCR][1]();ctx.setTransform(DPR,0,0,DPR,0,0);
  if(MSG){const w=tw(MSG.s,10,700)+24*U;panel(SW/2-w/2,SH*.5-12*U,w,24*U,'rgba(10,8,20,.92)','#ffd84a',6);text(MSG.s,SW/2,SH*.5-6*U,10,'#ffd84a','center',null,700)}}
let last=performance.now();
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;step(dt);clearTaps();draw()}
/* ---------- saving: every second, and on hide, pagehide and the power switch ---------- */
const DEF={cpu:3,rounds:3,time:60,beaten:{},wins:0,losses:0,tower:null,match:null,cleared:{}};
for(const k in DEF)if(SAVE[k]===undefined)SAVE[k]=DEF[k];
delete SAVE.fight;delete SAVE.step;delete SAVE.pos;
const inMatch=()=>M&&!M.res&&M.ph!=='done'&&(['fight','pause','vsintro'].includes(SCR)||SCR==='moves'&&MV.back==='pause');
saveHook=()=>{if(inMatch()){
    SAVE.match={mode:M.mode,p1:M.p1,p2:M.p2,venue:M.venue,lvl:M.lvl,bestOf:M.bestOf,rw:M.rw.slice(),rd:M.rd,hp:M.ph==='fight'?M.F.map(f=>Math.max(f.max*.2,Math.round(f.hp))):null}}
  else if(M&&M.res)SAVE.match=null;
  SAVE.mute=muted;SAVE.vib=HAP.on};
function applySave(){applyLook();PC.clear();for(const k in DEF)if(SAVE[k]===undefined)SAVE[k]=DEF[k];if(SAVE.mute!=null&&SAVE.mute!==muted)setMute(SAVE.mute);if(SAVE.vib!=null){HAP.on=SAVE.vib;store.set('vib',HAP.on)}}
applySave();loadAccount(applySave);
setInterval(()=>saveNow(),1000);
function hold(){if(SCR==='fight')go('pause');saveNow(true)}
document.addEventListener('visibilitychange',()=>{if(document.hidden)hold()});
addEventListener('pagehide',()=>saveNow(true));
window.ZPCart={title:'Haymaker',input(b,d){rawInput(b,d)},home(){hold();return true}};
requestAnimationFrame(loop);
/* a test hook, only when the address asks for it */
if(/hmtest/.test(location.href))window.HMT={get M(){return M},get SCR(){return SCR},get SAVE(){return SAVE},get SEL(){return SEL},get RES(){return RES},ROSTER,MOVES,SPK,newMatch,startMatch,go,step,draw,matchStep,startMove,
  openSelect,newTower,startTowerFight,openLocker,openMoves,poseOf,RAW,PT,
  run(n,dt=1/60){for(let i=0;i<n;i++){step(dt);clearTaps()}},press(b){rawInput(b,true);rawInput(b,false)},hold(b,d){rawInput(b,d)}};
