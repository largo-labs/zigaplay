/* ================= the match, the loop, saving ================= */
let MATCH={train:false,flash:0,count:0,tleft:0,ending:0,endT:0,res:null};
function startMatch(o){const S=SAVE.set;setStage(o.stage);PROJ=[];FX=[];SHAKE=0;const lvl=o.train?0:(o.lvl||S.level);
  FT=[newFighter(o.chars[0],0,false,0),newFighter(o.chars[1],1,true,lvl)];placeFighter(FT[0],-55);placeFighter(FT[1],55);
  FT.forEach((f,i)=>{f.stocks=o.stocks?o.stocks[i]:S.stocks;f.pct=o.pct?o.pct[i]:0});
  MATCH={train:!!o.train,chars:o.chars.slice(),stage:o.stage,lvl,flash:0,count:o.resume?70:100,tleft:o.tleft!=null?o.tleft:(S.time&&!o.train?S.time*3600:0),ending:0,endT:0,res:null};
  SAVE.picks=[o.chars[0],o.chars[1],o.stage];for(const k in RAW.held)RAW.held[k]=false;camTick(true);go('fight');saveNow()}
function resumeMatch(){const m=SAVE.match;if(!m)return;SEL.cur=[m.chars[0],m.chars[1]];startMatch({chars:m.chars,stage:m.stage,train:m.train,lvl:m.lvl,stocks:m.stocks,pct:m.pct,tleft:m.tleft,resume:1})}
function finishMatch(){const a=FT[0],b=FT[1];const win=a.stocks!==b.stocks?(a.stocks>b.stocks?0:1):(a.pct<=b.pct?0:1);
  const r=SAVE.rec[a.c.i]||(SAVE.rec[a.c.i]={w:0,l:0});if(win===0)r.w++;else r.l++;const T=SAVE.tot||(SAVE.tot={w:0,l:0,ko:0});if(win===0)T.w++;else T.l++;T.ko+=a.kos;
  MATCH.res={win,chars:MATCH.chars,stage:MATCH.stage,stats:[[a.kos,a.falls,Math.round(a.dmg)+'%'],[b.kos,b.falls,Math.round(b.dmg)+'%']]};
  SAVE.match=null;SFX.game();saveNow(true);go('results')}
function fightStep(){if(TAP('start')&&!MATCH.ending){SFX.back();go('pause');return}
  readPad(HUMAN);
  if(MATCH.count>0){MATCH.count--;if(MATCH.count===30)SFX.go();if(MATCH.count>30){fxTick();camTick();return}}
  if(MATCH.ending){MATCH.endT++;if(MATCH.endT===1)SFX.beep();if(MATCH.endT>110){finishMatch();return}if(MATCH.endT%2){fxTick();camTick();return}}
  for(const f of FT)if(f.cpu)aiTick(f);
  for(const f of FT)f.px0=f.x;
  for(const f of FT)tick(f);
  bodyPush();
  resolveHits();
  for(const p of PROJ)if(!p.dead)projTick(p);PROJ=PROJ.filter(p=>!p.dead);
  fxTick();if(SHAKE>0)SHAKE=Math.max(0,SHAKE-.6);if(MATCH.flash>0)MATCH.flash--;
  for(const f of FT)if(f.comboT>0&&--f.comboT===0)f.combo=0;
  camTick();
  if(MATCH.tleft>0&&!MATCH.ending){MATCH.tleft--;if(MATCH.tleft===0)MATCH.ending=1}}
const pctCol=p=>{const t=Math.min(1,p/160);return t<.5?`rgb(255,255,${Math.round(255-t*2*200)})`:`rgb(255,${Math.round(255-(t-.5)*2*200)},${Math.round(55-(t-.5)*2*40)})`};
function hud(){ctx.setTransform(DPR,0,0,DPR,0,0);
  FT.forEach((f,i)=>{const w=Math.min(118*U,SW*(PORT?.47:.4)),cx=SW*(i?(PORT?.75:.7):(PORT?.25:.3)),x=cx-w/2,y=SH-38*U;panel(x,y,w,33*U,'rgba(8,8,22,.72)',i?'#7aa0ff':'#ff4a5a');
    ctx.save();ctx.beginPath();ctx.arc(x+16*U,y+16.5*U,12*U,0,TAU);ctx.fillStyle=shade(f.c.body,-.5);ctx.fill();ctx.clip();drawBust(f.c,x+16*U,y+18*U,1.25*U);ctx.restore();
    text(f.c.name,x+32*U,y+4*U,8,i?'#7aa0ff':'#ff4a5a','left',900);
    if(MATCH.train&&i===1)text('DUMMY',x+32*U,y+19*U,7,'#a8a8c8','left',800);
    else if(f.stocks>5)text('● x'+f.stocks,x+32*U,y+19*U,8,f.c.acc,'left',900);else for(let k=0;k<f.stocks;k++){ctx.fillStyle=f.c.acc;ctx.beginPath();ctx.arc(x+36*U+k*8*U,y+24*U,2.8*U,0,TAU);ctx.fill()}
    const sh=f.hl>0&&f.st==='hit'?(rnd()-.5)*4*U:0;
    if(f.st==='ko')text('--',x+w-7*U,y+7*U,17,'#888','right',900);else{text(Math.floor(f.pct)+'%',x+w-7*U+sh,y+6*U+sh,18,pctCol(f.pct),'right',900,'#000')}});
  if(MATCH.tleft>0){const s=Math.ceil(MATCH.tleft/60);text(Math.floor(s/60)+':'+String(s%60).padStart(2,'0'),SW/2,8*U,14,s<=10?'#ff5a5a':'#fff','center',900,'#000')}
  const P=FT[0];if(P.combo>=2&&P.comboT>0){const a=Math.min(1,P.comboT/30);ctx.globalAlpha=a;text(P.combo+' HIT COMBO',14*U,10*U,13,'#ffd84a','left',900,'#000');if(MATCH.train)text(Math.round(P.comboD)+'% DAMAGE',14*U,28*U,9,'#fff','left',800,'#000');ctx.globalAlpha=1}
  if(MATCH.count>0){const ready=MATCH.count>30;const k=ready?1:MATCH.count/30;ctx.globalAlpha=k;text(ready?'READY':'GO!',SW/2,SH*.32,ready?30:44,ready?'#fff':'#ffd84a','center',900,'#1a0820');ctx.globalAlpha=1}
  if(MATCH.ending){text(MATCH.tleft===0&&!FT.some(f=>f.stocks<=0)?'TIME!':'GAME!',SW/2,SH*.3,46,'#ffffff','center',900,'#ff2a6a')}
  if(MATCH.flash>0){ctx.fillStyle=`rgba(255,255,255,${MATCH.flash/8*.3})`;ctx.fillRect(0,0,SW,SH)}}
function fightDraw(){drawSky(STAGE.id);worldXf();drawStage();for(const p of PROJ)drawProj(p);
  const order=[...FT].sort((a,b)=>a.cpu===b.cpu?0:a.cpu?-1:1);for(const f of order){drawSpecialFx(f);drawTrail(f)}for(const f of order){drawFighter(f);drawStatus(f)}drawFx();
  ctx.setTransform(DPR,0,0,DPR,0,0);for(const f of FT)drawOffscreen(f);hud()}
/* ---------- the loop ---------- */
const SCREENS={title:[titleTick,titleDraw],controls:[controlsTick,controlsDraw],settings:[settingsTick,settingsDraw],records:[recordsTick,recordsDraw],select:[selectTick,selectDraw],
  stage:[stageTick,stageDraw],fight:[fightStep,()=>fightDraw()],pause:[pauseTick,pauseDraw],moves:[movesTick,movesDraw],results:[resultsTick,resultsDraw]};
function step(){FRAME++;SCREENS[SCR][0]();if(MSG&&--MSG.t<=0)MSG=null;
  /* the right song for the screen: the stage's track in a match, the title theme everywhere else */
  if(AC&&AC.state==='running'){const want=['fight','pause','moves'].includes(SCR)||(SCR==='controls'&&BACKTO)?STAGE.id:'title';if(!MUS.on||MUS.song!==want)music(true,want)}}
function draw(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.lineCap='round';ctx.lineJoin='round';SCREENS[SCR][1]();ctx.setTransform(DPR,0,0,DPR,0,0);
  if(MSG)text(MSG.s,SW/2,SH-34*U,11,'#ffd84a','center',900,'#000')}
let last=performance.now(),acc=0;
const gameSpeed=()=>SPEEDS.includes(SAVE.set&&SAVE.set.speed)?SAVE.set.speed:85;
/* a match runs at the chosen game speed (85% by default) so the action is easier to follow; menus run at full speed */
function loop(now){requestAnimationFrame(loop);acc+=Math.min(100,now-last);last=now;let n=0;const STEP=1000/60/(SCR==='fight'?gameSpeed()/100:1);while(acc>=STEP&&n<4){acc-=STEP;n++;step();clearTaps()}if(n>=4)acc=0;draw()}
/* ---------- saving ---------- */
saveHook=()=>{if(FT.length&&['fight','pause','moves'].includes(SCR)||(SCR==='controls'&&BACKTO)){if(!MATCH.ending&&!MATCH.res)SAVE.match={chars:MATCH.chars,stage:MATCH.stage,train:MATCH.train,lvl:MATCH.lvl,stocks:FT.map(f=>f.stocks),pct:FT.map(f=>Math.round(f.pct)),tleft:MATCH.tleft}}
  SAVE.ctrl=CTRL;SAVE.mute=muted;SAVE.vib=HAP.on};
function applySave(){if(SAVE.ctrl){CTRL=Object.assign({},CTRL_DEF,SAVE.ctrl);store.set('ctrl',CTRL)}if(SAVE.mute!=null&&SAVE.mute!==muted)setMute(SAVE.mute);if(SAVE.vib!=null){HAP.on=SAVE.vib;store.set('vib',HAP.on)}
  if(SAVE.picks){SEL.cur=[SAVE.picks[0]|0,SAVE.picks[1]|0];SEL.stage=SAVE.picks[2]|0}}
applySave();loadAccount(applySave);
setInterval(()=>saveNow(),1000);
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(SCR==='fight'&&!MATCH.ending)go('pause');saveNow(true)}});
addEventListener('pagehide',()=>saveNow(true));
window.ZPCart={title:'Hammer Fall',input(b,d){rawInput(b,d)},home(){if(SCR==='fight'&&!MATCH.ending)go('pause');saveNow(true);return true}};
requestAnimationFrame(loop);
/* a test hook, only when the address asks for it */
if(/sntest/.test(location.href))window.SNT={get FT(){return FT},get MATCH(){return MATCH},get SCR(){return SCR},get SAVE(){return SAVE},get CTRL(){return CTRL},startMatch,ROSTER,STAGES,
  cpu(i,l){FT[i].cpu=true;FT[i].lvl=l;FT[i].pad=makePad()},run(n){for(let i=0;i<n;i++){step();clearTaps()}},calcKB,draw,CAM,
  scene(){drawSky(STAGE.id);worldXf();drawStage();for(const f of FT){drawSpecialFx(f);drawTrail(f);drawFighter(f)}drawFx()},spark,ringFx};
