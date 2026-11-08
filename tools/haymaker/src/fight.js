/* ================= the fight =================
   The opponent throws a combo: arrows slide along the lane to the ring on the left, and each punch lands as its
   arrow reaches the ring. Press that way on the D-pad to slip it (U leans back, D ducks). Slip the whole combo and he
   is open: your punches (A, B, A+B together) slide in the same way; hit each on the ring. Miss one and he
   recovers and starts his combo again. Get hit and he resets. Three rounds of 90 seconds. */
const ROUND_T=90;
const TIMING=[{n:'EASY',w:1.4,b:1.14},{n:'NORMAL',w:1,b:1},{n:'HARD',w:.8,b:.9}];
const TIM=()=>TIMING[clamp(SAVE.timing|0,0,2)];
const DIRS={left:'L',right:'R',up:'U',down:'D'};
let F=null;
function newFight(oi,o={}){const op=OPP[oi],r=o.resume;FX.length=0;
  F={oi,op,id:op.id,venue:op.venue,story:!!o.story,from:o.from||(o.story?'map':'circuit'),rd:r?r.rd:1,tleft:r?r.tleft:ROUND_T,php:r?r.php:100,ohp:r?r.ohp:100,pkd:r?r.pkd:0,okd:r?r.okd:0,
    clk:0,ph:'intro',p0:0,toks:[],lastPat:'',next:0,until:0,sched:[],
    O:{hitT:-9,side:0,big:false,blockT:-9,sayT:-9,say:'',dazeT:-9},P:{dodge:null,punch:null,hurtT:-9},
    stats:Object.assign({taken:0,takenD:0,dealt:0,perfect:0,combos:0,dodges:0,miss:0,time:0},r?r.stats:{}),
    pops:[],msg:null,shake:0,flash:0,count:0,mash:0,need:0,upAt:0,res:null,tutor:o.story&&op.id==='gus'};
  SAVE.met[op.id]=1;startIntro()}
/* the opponent's numbers now: a mad Sable is faster; every knockdown makes anyone a little quicker */
function eff(){const o=F.op,r=o.rage&&F.okd>=2?o.rage:{},T=TIM(),q=1-.04*F.okd;
  return{beat:(r.beat||o.beat)*T.b*q,win:(r.win||o.win)*T.w,cbeat:(r.cbeat||o.cbeat)*T.b,counters:r.counters||o.counters,freeze:!!(r.freeze||o.freeze),rage:!!r.beat}}
function at(dt,fn){F.sched.push({t:F.clk+dt,fn})}
function pop(s,c='#fff'){F.pops.push({s,c,t:F.clk})}
function banner(s,d=1.2,c='#ffd84a'){F.msg={s,t:F.clk,d,c}}

/* ---------- phases ---------- */
function startIntro(){F.ph='intro';F.p0=F.clk;F.toks=[];banner('ROUND '+F.rd,1.25,'#fff');at(.25,()=>{SFX.bell(1);SFX.crowd(.12,1.6);RUMBLE.bell()});at(1.3,()=>{banner('FIGHT!',.7);SFX.crowd(.16,1)});at(2,()=>startNeutral(true))}
function startNeutral(short){F.ph='neutral';F.p0=F.clk;const[a,b]=F.op.wait;F.next=F.clk+rr(a,b)*(short?.55:1)*TIM().b*(eff().rage?.75:1);
  if(rnd()<.28&&F.clk-F.O.sayT>5){F.O.say=pick(F.op.taunts);F.O.sayT=F.clk}}
function parsePat(str,beat,t0){const out=[];let t=t0,i=0;for(const it of str.split(' ')){if(it==='.'){t+=beat;continue}const fake=it[0]==='*';out.push({k:'d',d:it.replace('*',''),t,fake,st:0,i:i++});t+=beat}return out}
function parseCombo(str,beat,t0){const out=[];let t=t0;for(const it of str.split(' ')){const sub=it.split(',');sub.forEach((s,j)=>out.push({k:'c',b:s==='A+B'?'AB':s,t:t+j*beat/2,st:0}));t+=beat}return out}
function startDefend(quick){const e=eff(),o=F.op;let str;
  if(quick)str=pick(['L','R','D']);
  else{const tier=clamp(F.rd-1+F.okd,0,o.pats.length-1);for(let k=0;k<4;k++){const pool=rnd()<.7||tier===0?o.pats[tier]:o.pats[tier-1];str=pick(pool);if(str!==F.lastPat)break}F.lastPat=str}
  const lead=quick?.8:clamp(e.beat*2.7,1.2,1.75)*TIM().b;F.toks=parsePat(str,e.beat,F.clk+lead);for(const t of F.toks){t.lead=lead;t.frz=e.freeze&&!quick}
  F.ph='defend';F.p0=F.clk;if(quick){pop('TOO GREEDY!','#ff6a5a')}}
function startCounter(){const e=eff();F.toks=parseCombo(pick(e.counters),e.cbeat,F.clk+1.1*TIM().b);for(const t of F.toks)t.lead=1.1*TIM().b;
  F.ph='counter';F.p0=F.clk;F.O.dazeT=F.clk;pop('OPEN!','#7dff9a');SFX.crowd(.08,.8)}
function startRecover(d){F.ph='recover';F.p0=F.clk;F.until=F.clk+d}
function clearToks(){for(const t of F.toks)if(t.st===0)t.st=3}

/* ---------- your presses, judged at the moment they happened ---------- */
function fightPress(btn,tp){const ph=F.ph;
  if(DIRS[btn]){const d=DIRS[btn];if(['neutral','defend','recover','stagger','block','counter'].includes(ph)){F.P.dodge={d,t:tp};SFX.whoosh()}
    if(ph==='defend')judgeDodge(d,tp);return}
  if(btn==='a'||btn==='b'){
    if(ph==='pdown'){F.mash++;SFX.blip();RUMBLE.mash();return}
    if(ph==='counter'){judgePunch(btn.toUpperCase(),tp);return}
    if(ph==='neutral'){F.P.punch={b:btn.toUpperCase(),t:tp,blocked:true};F.O.blockT=tp;SFX.block();RUMBLE.block();if(F.op.punish&&rnd()<.65)startDefend(true)}}}
function judgeDodge(d,tp){const n=F.toks.find(k=>k.k==='d'&&k.st===0);if(!n)return;const e=eff();
  if(n.fake){failD(n,'FAKED!');return}
  if(tp<n.t-e.win){failD(n,'EARLY!');return}
  if(d!==n.d){failD(n,'WRONG WAY');return}
  n.st=1;n.pt=tp;n.perf=Math.abs(tp-n.t)<e.win*.38;F.stats.dodges++;if(n.perf){F.stats.perfect++;pop('PERFECT','#7ae8ff');SFX.perfect();RUMBLE.perfect()}else{RUMBLE.dodge();pop(['SLIP!','SLIP!','DUCK!','LEAN!'][['L','R','D','U'].indexOf(n.d)],'#7dff9a');SFX.ok()}}
function failD(n,why){n.st=2;n.why=why;pop(why,'#ff5a5a');SFX.miss()}
function judgePunch(b,tp){const n=F.toks.find(k=>k.k==='c'&&k.st===0);if(!n)return;const W=.21*TIM().w;
  if(n.half){if(b!==n.half.b&&tp-n.half.t<=.15)landPunch(n,(tp+n.half.t)/2);else failC(n,'TOGETHER!');return}
  if(tp<n.t-W){failC(n,'EARLY!');return}
  if(n.b==='AB'){n.half={b,t:tp};return}
  if(b!==n.b){failC(n,'WRONG!');return}
  landPunch(n,tp)}
function landPunch(n,tp){const o=F.op;n.st=1;const perf=Math.abs(tp-n.t)<.075*TIM().w,dmg={A:5,B:6,AB:11}[n.b]*(perf?1.3:1)*o.def;
  F.ohp-=dmg;F.stats.dealt+=dmg;if(perf)F.stats.perfect++;
  F.P.punch={b:n.b,t:F.clk};F.O.hitT=F.clk;F.O.side=n.b==='A'?1:n.b==='B'?-1:0;F.O.big=n.b==='AB';
  if(n.b==='AB'){SFX.hay();F.shake=5;RUMBLE.hay()}else{(n.b==='A'?SFX.jab:SFX.cross)();(n.b==='A'?RUMBLE.jab:RUMBLE.cross)()}
  const hx=BW/2+(F.O.side*4),hy=BH-OPP_Y-(PEOPLE[F.id].build.h+PEOPLE[F.id].build.r*1.15)*PEOPLE[F.id].build.s*OSC;
  burst(hx,hy,n.b==='AB'?14:7,'#fff',n.b==='AB'?90:60);fx('splash',hx-F.O.side*4,hy,{r:n.b==='AB'?20:12,life:.32,c:n.b==='AB'?'#ffd84a':n.b==='A'?'#3ee8ff':'#ff3ea5',seed:Math.floor(F.clk*10)});
  pop(perf?'PERFECT':n.b==='AB'?'HAYMAKER!':n.b==='A'?'JAB!':'CROSS!',perf?'#7ae8ff':n.b==='AB'?'#ffd84a':'#fff');
  if(F.ohp<=0){startODown();return}
  if(F.toks.every(k=>k.k!=='c'||k.st===1)){const bonus=8*o.def;F.ohp-=bonus;F.stats.dealt+=bonus;F.stats.combos++;banner('COMBO!',.8,'#7dff9a');SFX.combo();setTimeout(RUMBLE.combo,120);SFX.crowd(.16,1.2);
    if(F.ohp<=0){startODown();return}F.ph='stagger';F.p0=F.clk;F.until=F.clk+.9}}
function failC(n,why){n.st=2;n.why=why;clearToks();pop(why,'#ff5a5a');SFX.block();RUMBLE.block();F.O.blockT=F.clk;F.stats.miss++;F.ph='block';F.p0=F.clk;F.until=F.clk+.55}
function playerHit(n){n.landed=true;const o=F.op,dmg=o.dmg*(n.fake?.6:1)*(TIM().w>1?.85:1);
  F.php-=dmg;F.stats.taken++;F.stats.takenD+=dmg;F.P.hurtT=F.clk;F.shake=7;F.flash=1;SFX.hurt();RUMBLE.hurt();
  burst(BW/2,BH-PL_Y-33,10,'#ffe0a0',80);fx('splash',BW/2,BH-PL_Y-46,{r:24,life:.34,c:'#ff3a2a',c2:'#ffd84a',seed:Math.floor(F.clk*10)});clearToks();
  if(F.php<=0){startPDown();return}
  startRecover(.85)}
/* ---------- knockdowns ---------- */
function startODown(){const o=F.op;F.okd++;clearToks();F.ph='odown';F.p0=F.clk;F.count=0;F.ohp=0;banner('DOWN!',1.2,'#ffd84a');SFX.fall();SFX.crowd(.22,2);RUMBLE.odown();
  const final=F.okd>=o.kds;F.upAt=final?99:Math.min(9,Math.floor(rr(o.up[0],o.up[1]+1))+F.okd-1);
  const tick=()=>{if(F.ph!=='odown')return;F.count++;SFX.count();RUMBLE.count();if(F.count>=F.upAt&&F.count<10){F.ph='oup';F.p0=F.clk;at(.9,()=>{F.ohp=[72,52,34][Math.min(2,F.okd-1)];if(eff().rage&&F.okd===2){banner('SABLE IS FURIOUS!',1.4,'#ff5a5a');F.O.say='Enough games!';F.O.sayT=F.clk}startNeutral()});return}
    if(F.count>=10){F.ph='ko';F.p0=F.clk;banner('K.O.!',2.4,'#ff5a5a');SFX.ko();RUMBLE.ko();SFX.crowd(.3,2.5);at(2.4,()=>finishFight(true,'KNOCKOUT'));return}at(.72,tick)};
  at(1.1,tick)}
function startPDown(){F.pkd++;clearToks();F.ph='pdown';F.p0=F.clk;F.count=0;F.php=0;F.mash=0;F.need=10+7*(F.pkd-1);banner('YOU\'RE DOWN!',1.2,'#ff5a5a');SFX.fall();RUMBLE.pdown();
  if(F.pkd>=3){at(1.6,()=>{F.ph='pko';banner('T.K.O.',2,'#ff5a5a');SFX.ko();at(2,()=>finishFight(false,'TKO'))});return}
  const tick=()=>{if(F.ph!=='pdown')return;F.count++;SFX.count();RUMBLE.count();if(F.count>=10){F.ph='pko';banner('K.O.',2,'#ff5a5a');SFX.ko();at(2,()=>finishFight(false,'KNOCKOUT'));return}at(.85,tick)};at(1.1,tick)}
/* ---------- rounds ---------- */
function endRound(){F.ph='bell';F.p0=F.clk;clearToks();SFX.bell(2);RUMBLE.bell();SFX.crowd(.14,1.4);banner(F.rd<3?'END OF ROUND '+F.rd:'FINAL BELL',1.6,'#fff');
  at(1.8,()=>{if(F.rd<3){go('corner')}else decision()})}
function decision(){const you=F.stats.dealt+30*F.okd,them=F.stats.takenD+30*F.pkd,win=you>them;banner('DECISION...',1.2,'#fff');at(1.4,()=>finishFight(win,win?'DECISION':'DECISION LOSS'))}
function nextRound(){F.rd++;F.tleft=ROUND_T;F.php=Math.min(100,F.php+28);F.ohp=Math.min(100,F.ohp+10);startIntro()}
function finishFight(win,how){const st=F.stats,stars=win?(st.taken<=1?3:st.taken<=4?2:1):0;F.res={win,how,stars,time:st.time};
  SAVE.fight=null;if(win){const b=SAVE.best[F.id]||{};SAVE.best[F.id]={stars:Math.max(b.stars||0,stars),time:Math.min(b.time||1e9,st.time),wins:(b.wins||0)+1};SAVE.beaten[F.id]=1;if(F.story)SAVE.step++}
  (win?SFX.win:SFX.lose)();(win?RUMBLE.win:RUMBLE.lose)();saveNow(true);go('result')}

/* ---------- each frame ---------- */
function fightTick(dt){const now=performance.now();F.clk+=dt;
  for(const p of PRESSES)fightPress(p.b,F.clk-(now-p.at)/1000);
  for(let i=0;i<F.sched.length;i++){const s=F.sched[i];if(F.clk>=s.t){F.sched.splice(i--,1);s.fn()}}
  const ph=F.ph,active=['neutral','defend','counter','recover','stagger','block'].includes(ph);
  if(active){F.tleft-=dt;F.stats.time+=dt}
  if(ph==='neutral'&&F.clk>=F.next){if(F.tleft<=0)endRound();else startDefend()}
  else if(ph==='defend'){const e=eff(),g=.07*TIM().w;
    for(const n of F.toks){if(n.k!=='d')continue;
      if(n.st===0&&F.clk>n.t+g){if(n.fake){n.st=1;pop('READ IT!','#7ae8ff')}else failD(n,'MISS')}
      if(n.st===2&&!n.landed&&F.clk>=n.t){playerHit(n);break}}
    if(F.ph==='defend'&&F.toks.length&&F.toks.every(n=>n.st===1)&&F.clk>F.toks[F.toks.length-1].t+.14)startCounter()}
  else if(ph==='counter'){const n=F.toks.find(k=>k.k==='c'&&k.st===0),W=.21*TIM().w;
    if(n){if(n.half&&F.clk-n.half.t>.15)failC(n,'TOGETHER!');else if(!n.half&&F.clk>n.t+W)failC(n,'MISS')}}
  else if(ph==='recover'||ph==='stagger'){if(F.clk>=F.until){if(F.tleft<=0)endRound();else startNeutral(ph==='stagger')}}
  else if(ph==='block'){if(F.clk>=F.until){if(F.tleft<=0)endRound();else startDefend()}}
  else if(ph==='pdown'&&F.mash>=F.need){F.ph='pup';F.p0=F.clk;banner('BACK UP!',.9,'#7dff9a');RUMBLE.up();SFX.crowd(.18,1.2);at(.8,()=>{F.php=[60,40][Math.min(1,F.pkd-1)];startNeutral()})}
  F.toks=F.toks.filter(n=>F.clk<n.t+.6);
  F.pops=F.pops.filter(p=>F.clk-p.t<.7);
  if(F.shake>0)F.shake=Math.max(0,F.shake-dt*30);if(F.flash>0)F.flash=Math.max(0,F.flash-dt*3);
  fxTick(dt)}

/* ---------- poses ---------- */
const mix=(a,b,k)=>({x:lerp(a.x,b.x,k),y:lerp(a.y,b.y,k),z:lerp(a.z,b.z,k)});
function punchGlove(kind,side,a,W,H,fake){const guard={x:side*W*.5,y:-H+9,z:1},tgt={x:0,y:20,z:2.3};
  const wind=kind==='hook'?{x:side*W*1.02,y:-H+2,z:.95}:kind==='str'?{x:side*W*.55,y:-H-6,z:.9}:{x:side*W*.3,y:-H*.32,z:1};
  if(a<-.34)return guard;if(a<-.12)return mix(guard,wind,ease((a+.34)/.22));
  if(fake)return a<.1?mix(wind,guard,ease((a+.12)/.22)*.4):mix(wind,guard,ease((a-.1)/.2));
  if(a<=0){const k=(a+.12)/.12;if(kind==='hook'){const c={x:side*W*1.25,y:-H*.15,z:1.4},u=1-k;return{x:u*u*wind.x+2*u*k*c.x+k*k*tgt.x,y:u*u*wind.y+2*u*k*c.y+k*k*tgt.y,z:lerp(wind.z,tgt.z,k*k)}}return mix(wind,tgt,k*k)}
  if(a<.26)return mix(tgt,guard,ease(a/.26));return guard}
function oppPose(){const p=PEOPLE[F.id],b=p.build,W=b.w,H=b.h,c=F.clk,ph=F.ph;
  const P={x:Math.sin(c*2.3)*2.5,y:Math.sin(c*4.6)*1.2,lean:0,fall:0,head:{x:0,y:-H-b.r*1.15,ex:'guard',turn:0},gl:{x:-W*.5,y:-H+9,z:1},gr:{x:W*.5,y:-H+9,z:1}};
  if(ph==='defend'){let best=null,bd=9;for(const n of F.toks){if(n.k!=='d')continue;const a=c-n.t;if(a>-.36&&a<.3&&Math.abs(a)<bd){bd=Math.abs(a);best=n}}
    if(best){const a=c-best.t,kind=best.d==='D'?'str':best.d==='U'?'up':'hook',side=best.d==='R'?-1:best.d==='L'?1:best.d==='U'?1:(best.i%2?1:-1);
      const g=punchGlove(kind,side,a,W,H,best.fake&&best.st!==2);if(side<0)P.gl=g;else P.gr=g;P.lean=a<0&&a>-.34?side*.07*ease((a+.34)/.22):0;P.head.ex=best.fake&&a>-.1?'smug':'angry';P.head.x=-side*2}}
  else if(ph==='counter'||ph==='stagger'){const k=c-F.O.hitT;P.x=Math.sin(c*3)*5;P.head.ex='daze';P.gl={x:-W*.62,y:-H*.45,z:1};P.gr={x:W*.62,y:-H*.45,z:1};P.lean=Math.sin(c*3)*.05;
    if(k<.3){const e=1-k/.3;P.head.ex='hurt';P.head.x+=F.O.side*7*e;P.head.turn=F.O.side*.9*e;P.lean+=F.O.side*.12*e;if(F.O.big){P.head.y-=7*e;P.y+=4*e}}}
  else if(ph==='block'||c-F.O.blockT<.3&&ph==='neutral'){P.gl={x:-W*.2,y:-H-b.r*.8,z:1.05};P.gr={x:W*.2,y:-H-b.r*.8,z:1.05};P.head.ex='smug'}
  else if(ph==='recover'){P.head.ex='grin';P.y+=Math.abs(Math.sin(c*9))*-2}
  else if(ph==='odown'||ph==='ko'){const k=ease((c-F.p0)/.7);P.fall=k;P.y+=12*k;P.head.ex='daze';P.gl={x:-W*.8,y:-H*.3,z:1};P.gr={x:W*.8,y:-H*.3,z:1};P.x=0}
  else if(ph==='oup'){const k=1-ease((c-F.p0)/.85);P.fall=k;P.y+=12*k;P.head.ex='hurt'}
  else if(ph==='pdown'||ph==='pko'){P.head.ex='grin';P.gl={x:-W*.7,y:-H-b.r*2,z:1};P.gr={x:W*.7,y:-H-b.r*2,z:1}}
  else if(ph==='bell'||ph==='intro'){P.head.ex=F.okd?'angry':'guard'}
  if(c-F.O.sayT<1.6&&ph==='neutral')P.head.ex='grin';
  return P}
function playerPose(){const c=F.clk,P={x:0,y:Math.sin(c*4.6+1)*1,rot:0,s:1,gl:{x:-28,y:-40,r:13},gr:{x:28,y:-40,r:13},hurt:0},ph=F.ph;
  const dg=F.P.dodge;if(dg){const a=c-dg.t;if(a>=0&&a<.42){const k=a<.06?a/.06:a<.3?1:1-(a-.3)/.12;
    if(dg.d==='L'){P.x=-36*k;P.rot=-.17*k}else if(dg.d==='R'){P.x=36*k;P.rot=.17*k}else if(dg.d==='D'){P.y+=28*k;P.gl.y+=6*k;P.gr.y+=6*k}else{P.y+=12*k;P.s=1+.08*k;P.gl.y+=10*k;P.gr.y+=10*k}}}
  const pu=F.P.punch;if(pu){const a=c-pu.t;if(a>=0&&a<.3){const b=PEOPLE[F.id].build;
      const k=a<.08?a/.08:1-(a-.08)/.22,reach=pu.blocked?.6:1,tgt={x:0,y:-(OPP_Y-PL_Y)-(b.h+b.r*.6)*b.s*OSC};
      const go=(g,side)=>{g.x=lerp(g.x,tgt.x+side*5,k*reach);g.y=lerp(g.y,tgt.y,k*reach);g.r=lerp(13,9.5,k*reach);g.front=true};
      if(pu.b==='A')go(P.gl,-1);else if(pu.b==='B')go(P.gr,1);else{go(P.gr,1);P.gr.y-=14*Math.sin(k*Math.PI);P.gr.r+=3*(1-k);P.rot=-.06*k}
      P.rot+=(pu.b==='A'?.04:-.04)*k}}
  const hk=c-F.P.hurtT;if(hk<.4){const e=1-hk/.4;P.x+=Math.sin(c*70)*3*e;P.y+=7*e;P.hurt=e;P.gl.x-=6*e;P.gr.x+=6*e}
  if(ph==='pdown'||ph==='pko'){const k=ease((c-F.p0)/.8);P.y+=130*k;P.rot=.25*k}
  else if(ph==='pup'){const k=1-ease((c-F.p0)/.8);P.y+=130*k;P.rot=.25*k}
  else if(ph==='ko'||ph==='bell'&&F.okd>F.pkd){P.gl.y-=14*Math.abs(Math.sin(c*3));P.gr.y-=14*Math.abs(Math.sin(c*3+1))}
  return P}
