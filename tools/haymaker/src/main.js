/* ================= the loop, saving, the console ================= */
const SCREENS={title:[titleTick,titleDraw],story:[storyTick,storyDraw],card:[cardTick,cardDraw],fight:[fightStep,fightDraw],pause:[pauseTick,pauseDraw],
  corner:[cornerTick,cornerDraw],result:[resultTick,resultDraw],circuit:[circuitTick,circuitDraw],howto:[howtoTick,howtoDraw],settings:[settingsTick,settingsDraw],
  map:[mapTick,mapScreenDraw],mappause:[mapPauseTick,mapPauseDraw],citymap:[cityTick,cityDraw],gymmenu:[gymTick,gymDraw],locker:[lockerTick,lockerDraw]};
/* the right song for the screen */
function songFor(){if(['fight','pause','card'].includes(SCR)||(SCR==='howto'&&BACKTO==='pause'))return VENUES[F?F.venue:OPP[CARD?CARD.oi:0].venue].song;
  if(SCR==='corner'||SCR==='locker')return'corner';if(SCR==='story')return'story';if(SCR==='result')return null;if(SCR==='gymmenu')return'gym';
  if(['map','mappause','citymap'].includes(SCR)||HUB==='map'&&['circuit','settings','howto'].includes(SCR))return'city';return'title'}
function step(dt){TT+=dt;const before=SCR;SCREENS[SCR][0](dt);if(MSG&&(MSG.t-=dt)<=0)MSG=null;
  if(AC&&AC.state==='running'){const want=songFor();if(want===null){if(MUS.on)music(false)}else if(!MUS.on||MUS.song!==want)music(true,want)}}
function draw(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.lineCap='round';ctx.lineJoin='round';SCREENS[SCR][1]();ctx.setTransform(DPR,0,0,DPR,0,0);
  if(MSG){const w=tw(MSG.s,10,700)+24*U;panel(SW/2-w/2,SH*.5-12*U,w,24*U,'rgba(10,8,20,.92)','#ffd84a',6);text(MSG.s,SW/2,SH*.5-6*U,10,'#ffd84a','center',null,700)}}
let last=performance.now();
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;step(dt);clearTaps();draw()}
/* ---------- saving ---------- */
saveHook=()=>{if(F&&!F.res&&['fight','pause','corner'].includes(SCR)||(F&&!F.res&&SCR==='howto'&&BACKTO==='pause')){
    SAVE.fight={oi:F.oi,story:F.story,from:F.from,rd:F.rd,tleft:Math.max(15,F.tleft),php:Math.max(25,F.php),ohp:Math.max(20,F.ohp),pkd:F.pkd,okd:F.okd,stats:F.stats}}
  SAVE.mute=muted;SAVE.vib=HAP.on};
function applySave(){applyLook();if(SAVE.mute!=null&&SAVE.mute!==muted)setMute(SAVE.mute);if(SAVE.vib!=null){HAP.on=SAVE.vib;store.set('vib',HAP.on)}}
applySave();loadAccount(applySave);
setInterval(()=>saveNow(),1000);
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(SCR==='fight')go('pause');else if(SCR==='map')go('mappause');saveNow(true)}});
addEventListener('pagehide',()=>saveNow(true));
window.ZPCart={title:'Haymaker',input(b,d){rawInput(b,d)},home(){if(SCR==='fight')go('pause');else if(SCR==='map')go('mappause');saveNow(true);return true}};
requestAnimationFrame(loop);
/* a test hook, only when the address asks for it */
if(/hmtest/.test(location.href))window.HMT={get F(){return F},get SCR(){return SCR},get SAVE(){return SAVE},OPP,STORY,newFight,go,step,draw,eff,startDefend,startCounter,fightPress,enterMap,MP,BLD,RINGS,objective,enterDoor,openLocker,LOOK_OPTS,applyLook,get DLG(){return DLG},
  run(n,dt=1/60){for(let i=0;i<n;i++){step(dt);clearTaps()}},press(b,offset=0){PRESSES.push({b,at:performance.now()-offset*1000});RAW.tap[b]=true},advanceStory};
