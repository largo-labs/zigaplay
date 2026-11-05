/* ================= the computer player =================
   It plays through a pad just like a person: a stick and the five actions. Levels 1 to 9 change how fast it
   reacts, how often it shields, techs and punishes, and how well it gets back to the stage. */
function aiPad(){const p=makePad();p.cpu=1;return p}
function aiInit(f,lvl,dummy){f.ai={lvl,plan:[],think:0,hx:0,hy:0,seen:null,wait:0,mashT:0,dummy:dummy||null,shT:0,lastProj:null}}
const AIL=l=>({react:Math.max(2,Math.round(27-l*2.7)),acc:.2+l*.085,shield:.04+l*.085,tech:(l-1)*.11,di:l>=3,edge:l>=5,parry:l>=7?(l-6)*.12:0,punish:l*.1,aggro:.25+l*.07});
const ACTS=['attack','special','jump','shield','grab'];
function aiTick(f){const P=f.pad,A=f.ai;P.t++;const was={};for(const a of ACTS){was[a]=P.held[a];P.pressed[a]=false;P.released[a]=false;P.held[a]=false}P.flickX=P.flickY=0;
  if(G.state!=='fight'||f.dead){P.x=P.y=0;A.plan.length=0;finish();return}
  const o=G.fighters.find(g=>g!==f),L=AIL(A.lvl);
  if(A.dummy&&A.dummy!=='cpu')dummyTick(f,o,P,A);
  else{const emergency=aiEmergency(f,o,P,A,L);if(emergency)A.plan.length=0;else if(A.plan.length)runPlan(f,o,P,A);else aiNeutral(f,o,P,A,L)}
  finish();
  function finish(){for(const a of ACTS)if(was[a]&&!P.held[a])P.released[a]=true}}
function press(P,a){P.pressed[a]=true;P.held[a]=true}
/* a plan is a short list of steps: what the stick does, which button is pressed or held, and for how long */
function runPlan(f,o,P,A){const s=A.plan[0];if(s.n==null)s.n=0;
  const v=k=>typeof s[k]==='function'?s[k](f,o):s[k];
  P.x=v('x')??0;P.y=v('y')??0;
  if(s.n===0){if(s.p)press(P,s.p);if(s.fx){P.flickX=s.fx;P.flickAt=P.t}if(s.fy){P.flickY=s.fy;P.flickAt=P.t}}
  if(s.h)for(const a of s.h)P.held[a]=true;
  /* never run off the stage by accident */
  const S=G.stage.main;if(f.ground===S&&P.x&&!s.edgeOK){const ahead=f.x+sgn(P.x)*(Math.abs(f.vx)*12+.5);if(ahead<S.l+.2||ahead>S.r-.2){P.x=0;A.plan.length=0;return}}
  s.n++;if(s.n>=(v('f')??1)||(s.until&&s.until(f,o)))A.plan.shift()}
/* ---------- things that can't wait: being hit, held, hanging, off the stage ---------- */
function aiEmergency(f,o,P,A,L){const S=G.stage.main;
  if(f.st==='held'){if(A.lvl>=2&&++A.mashT%Math.max(3,9-A.lvl)===0){press(P,pick(['attack','jump','special']));P.x=pick([-1,1])}return true}
  if(f.st==='dizzy'){if(++A.mashT%4===0)press(P,pick(['attack','jump']));P.x=Math.sin(A.mashT)*1;return true}
  if(f.st==='hurt'){/* lean against the launch, and tech the landing */
    if(L.di){const cx=(S.l+S.r)/2;P.x=sgn(cx-f.x)*.8;P.y=.55}else{P.x=P.y=0}
    if(f.tumble&&f.hitstun<30){const pl=platUnder(f.x,f.y);if(pl&&f.y-pl.y<1.4&&f.vy+f.ky<0&&!A.techTry){A.techTry=1;if(rnd()<L.tech)press(P,'shield')}}
    return true}
  A.techTry=0;
  if(f.st==='lie'){if(!A.wait)A.wait=8+Math.floor(rnd()*(30-A.lvl*2));if(--A.wait<=0){A.wait=0;const r=rnd();if(r<.35)press(P,'attack');else if(r<.7){P.x=pick([-1,1])}else press(P,'jump')}return true}
  if(f.st==='respawn'){if(!A.wait)A.wait=20+Math.floor(rnd()*60);if(--A.wait<=0){A.wait=0;P.x=sgn(o.x-f.x)*.6}return true}
  if(f.st==='ledge'){if(!A.wait)A.wait=10+Math.floor(rnd()*(46-A.lvl*4));if(--A.wait>0)return true;A.wait=0;
    const L0=f.ledge,toward=-L0.side,r=rnd(),near=Math.abs(o.x-L0.x)<2.2&&!o.dead;
    if(near&&r<.4)press(P,'jump');else if(near&&r<.65)press(P,'shield');else if(r<.8)press(P,'attack');else P.x=toward;return true}
  if(f.st==='ledgeup'||f.st==='getup')return true;
  /* off the stage: head back */
  const off=!f.ground&&(f.x<S.l-.15||f.x>S.r+.15||f.y<S.y-.3);
  if(off&&f.st!=='attack')return recover(f,o,P,A,L)||true;
  if(f.st==='helpless'){const pl=platUnder(f.x,f.y);if(!pl){P.x=sgn((S.l+S.r)/2-f.x)}return true}
  return false}
function recover(f,o,P,A,L){const S=G.stage.main,side=f.x<(S.l+S.r)/2?-1:1,Lx=side<0?S.l:S.r,Ly=S.y,below=Ly-f.y,dx=Lx-f.x,under=f.x>S.l-.15&&f.x<S.r+.15;
  P.x=under?side:-side;P.y=0;
  const kind=f.SPC.u.opts&&f.ch.sp.u[0];
  if(f.st==='special'){/* steer while the up special runs */
    if(f.mv&&f.mv.def.id==='sp_u'){if(kind==='teleport'){const tx=Lx-side*.3,ty=Ly+.4,a=Math.atan2(ty-f.y,tx-f.x);P.x=Math.cos(a);P.y=Math.sin(a)}else P.x=under?side:-side*.9}
    return true}
  if(f.st!=='air')return true;
  if(A.lvl<=2&&rnd()<.01)return true;
  const far=Math.abs(dx)>(f.jumps>0?6:3.4);
  if(f.jumps>0&&(below>.9&&f.vy<.03||below>3.2||far&&f.vy<0)){press(P,'jump');return true}
  if(f.jumps===0&&!f.upUsed&&(below>.35&&f.vy<0||below>2.2||Math.abs(dx)>3&&f.vy<-.05)){
    if(far&&!f.sideUsed&&['lunge','spinkick','teleStrike'].includes(f.ch.sp.s[0])&&below<1.6){P.x=-side;P.y=0;press(P,'special');return true}
    if(kind==='teleport'){const a=Math.atan2(Ly+.4-f.y,Lx-side*.3-f.x);P.x=Math.cos(a);P.y=Math.sin(a)}else{P.x=-side*.35;P.y=.95}
    press(P,'special');return true}
  return true}
/* ---------- will this attack reach them, if they keep moving as they are? ---------- */
function willHit(f,def,o,face,lead=0){const HBs=f.HB&&f.HB[def.id]||def.hb;if(!HBs||!HBs.length)return false;const s=(def.s??6)+lead,ox=o.x+(o.vx+o.kx)*s*.8,oy=o.ground?o.y:o.y+(o.vy+o.ky)*s*.6;
  const low=o.st==='crouch'||o.st==='lie'?.62:1,c={x:ox,y0:oy+.25,y1:Math.max(oy+.3,oy+o.h*low-.25),r:.34};
  const mx=f.x+(f.ground?f.vx*s*.3:f.vx*s*.8),my=f.ground?f.y:f.y+f.vy*s*.5;
  for(const b of HBs)if(circCap(mx+face*b.x,my+b.y,b.r+.04,c))return true;return false}
function threat(f,o){if(o.dead)return null;const m=o.mv;
  if(m&&(o.st==='attack'||o.st==='special')){const d=m.def,s=d.s??8,left=s-m.f;if(left<-1)return null;
    if(d.hb&&d.hb.length){const fake={...d,s:Math.max(0,left)};if(willHit(o,fake,f,o.face))return{t:Math.max(0,left),grab:d.hb[0].grab}}
    else if(Math.hypot(o.x-f.x,o.y-f.y)<2.6)return{t:Math.max(0,left)}}
  for(const p of G.proj)if(p.own!==f&&p.life>0&&!p.mine){const dx=f.x-p.x;if(sgn(dx)===sgn(p.vx)&&Math.abs(dx)<3.2&&Math.abs(p.y-(f.y+.9))<1.2){return{t:Math.floor(Math.abs(dx)/Math.max(.05,Math.abs(p.vx))),proj:p}}}
  return null}
/* ---------- the main game: space, attack, defend, punish ---------- */
function aiNeutral(f,o,P,A,L){const S=G.stage.main,dx=o.x-f.x,adx=Math.abs(dx),dy=o.y-f.y,face=sgn(dx)||f.face;
  if(o.dead||o.st==='respawn'){P.x=Math.abs(f.x)>2&&f.ground?-sgn(f.x)*.6:0;P.y=0;return}
  /* defence first */
  const th=threat(f,o),key=th&&(th.proj||o.mv);
  if(th&&key!==A.seen){A.seen=key;
    if(rnd()<L.shield&&(th.t>=6||rnd()<L.parry)){
      if(th.proj&&['palm'].includes(f.ch.sp.d[0])&&rnd()<.5){A.plan=[{p:'special',y:-1,f:1},{f:20,until:f=>f.st!=='special'}];return}
      if(th.proj&&f.ch.sp.n[1].reflect&&rnd()<.5){A.plan=[{p:'special',f:1},{f:24,until:f=>f.st!=='special'}];return}
      if(!th.proj&&f.ch.sp.d[0]==='counter'&&A.lvl>=4&&rnd()<.3&&th.t>=3){A.plan=[{p:'special',y:-1,f:1},{f:40,until:f=>f.st!=='special'}];return}
      if(!f.ground){if(th.t<=4){A.plan=[{p:'shield',f:1},{f:20,until:f=>f.st!=='adodge'}];return}}
      else if(th.grab){A.plan=[{p:'jump',h:['jump'],f:4,x:-face*.5},{f:16,x:-face*.6}];return}
      else{const wait=th.parry?0:Math.max(0,th.t-(rnd()<L.parry?3:7));const r=rnd();
        if(r<.7){A.plan=[{f:wait},{p:'shield',h:['shield'],f:14+Math.floor(rnd()*10),until:(f,o)=>!o.mv&&!th.proj&&f.t>8}];A.oos=1;return}
        if(r<.85){A.plan=[{f:wait},{p:'shield',h:['shield'],f:1},{h:['shield'],fy:-1,y:-1,f:1},{f:24,until:f=>f.st!=='spot'}];return}
        A.plan=[{f:wait},{p:'shield',h:['shield'],f:1},{h:['shield'],fx:-face,x:-face,f:1},{f:28,until:f=>f.st!=='roll'}];return}}}
  /* out of shield: punish a move that ended next to us */
  if(f.st==='shield'&&A.oos){if(o.mv&&o.mv.f>(o.mv.def.s??6)+(o.mv.def.a??3)&&adx<1.5&&rnd()<L.punish){A.oos=0;A.plan=rnd()<.6?[{h:['shield'],p:'attack',f:1}]:[{p:'jump',f:1},{f:3},{p:'attack',f:1},{f:30,until:f=>f.ground}];return}
    if(!o.mv){A.oos=0}}
  if(A.think>0){A.think--;P.x=A.hx;P.y=A.hy;if(f.ground===S&&P.x){const ahead=f.x+sgn(P.x)*(Math.abs(f.vx)*12+.5);if(ahead<S.l+.2||ahead>S.r-.2)P.x=A.hx=0}return}
  A.think=Math.round(L.react*(.5+rnd()*.8));A.hx=0;A.hy=0;
  if(rnd()>L.acc+.25){A.hx=rnd()<.5?face*.5:0;if(rnd()<.1&&f.ground)A.plan=[{p:'jump',h:['jump'],f:4}];return}
  const opp=o.ground===null&&(o.x<S.l-.2||o.x>S.r+.2);
  if(f.ground)return aiGround(f,o,P,A,L,{dx,adx,dy,face,opp});
  return aiAir(f,o,P,A,L,{dx,adx,dy,face,opp})}
function aiGround(f,o,P,A,L,c){const{dx,adx,dy,face,opp}=c,S=G.stage.main,N=f.N,stunned=['hurt','lie','getup','land','dizzy','parried','throwing'].includes(o.st)||o.st==='attack'&&o.mv&&o.mv.f>(o.mv.def.s??6)+(o.mv.def.a??3)+2,kill=o.pct>95;
  /* edge-guarding: wait at the edge, hit them as they come back */
  if(opp&&A.lvl>=3){const ex=o.x<S.l?S.l+.7:S.r-.7;if(Math.abs(f.x-ex)>.5){A.hx=sgn(ex-f.x)*.7;return}
    if(L.edge&&adx<2.4&&dy>-2.6&&dy<1&&f.jumps>0&&rnd()<.35){const k=dy<-1.2?'dair':'fair';A.plan=[{p:'jump',h:['jump'],f:4,edgeOK:1,x:face*.4},{f:14,x:face*.8,edgeOK:1,until:(f,o)=>Math.abs(o.x-f.x)<1.3&&Math.abs(o.y-f.y)<1.6},{p:'attack',x:k==='fair'?face:0,y:k==='dair'?-1:0,f:1,edgeOK:1},{f:6}];return}
    if(adx<1.6&&dy>-1.4&&dy<.8&&o.st!=='ledge'&&rnd()<.5){A.plan=[{p:'attack',fy:-1,y:-1,f:1},{f:30,until:f=>f.st!=='attack'}];return}
    return}
  if(o.st==='ledge'){const ex=o.x<0?S.l+1.4:S.r-1.4;A.hx=Math.abs(f.x-ex)>.4?sgn(ex-f.x)*.6:0;if(rnd()<.15)A.plan=[{p:'shield',h:['shield'],f:12}];return}
  /* attacks that will land from here */
  const cand=[];const add=(k,w,steps)=>cand.push({k,w,steps});
  const atk=(extra={})=>({p:'attack',f:1,...extra}),endA=[{f:40,until:f=>f.st!=='attack'}];
  if(o.st==='shield'&&willHit(f,N.grab,o,face))add('grab',3,[{p:'grab',f:1,x:0},...endA]);
  if(willHit(f,N.jab1,o,face))add('jab',2,[atk(),{f:4},atk(),{f:4},atk(),...endA]);
  if(willHit(f,N.ftilt,o,face))add('ftilt',2,[atk({x:face*.7}),...endA]);
  if(willHit(f,N.utilt,o,face)&&dy>.3)add('utilt',2.5,[atk({y:.7}),...endA]);
  if(willHit(f,N.dtilt,o,face))add('dtilt',1.5,[atk({y:-.7}),...endA]);
  if(willHit(f,N.grab,o,face)&&!o.ground===false)add('grab',1.3,[{p:'grab',f:1},...endA]);
  const smashW=(kill?4:.6)*(stunned?2:1);
  if(willHit(f,N.fsmash,o,face,4))add('fsmash',smashW,[{p:'attack',h:['attack'],fx:face,x:face,f:1},{h:['attack'],f:Math.floor(rnd()*14)},...endA]);
  if(willHit(f,N.usmash,o,face,2)&&dy>.2)add('usmash',smashW*1.2,[{p:'attack',h:['attack'],fy:1,y:1,f:1},{h:['attack'],f:Math.floor(rnd()*10)},...endA]);
  if(willHit(f,N.dsmash,o,face,2)||willHit(f,N.dsmash,o,-face,2))add('dsmash',smashW*.8,[{p:'attack',h:['attack'],fy:-1,y:-1,f:1},{h:['attack'],f:Math.floor(rnd()*10)},...endA]);
  /* specials by distance */
  const sp=f.ch.sp,sk=sp.s[0],nk=sp.n[0],dk=sp.d[0],uk=sp.u[0],endS=[{f:70,until:f=>f.st!=='special'}];
  const spS=[{p:'special',x:face,f:1},...endS],spN=[{p:'special',f:1},...endS],spD=[{p:'special',y:-1,f:1},...endS],spU=[{p:'special',y:1,f:1},...endS];
  if(['shot','chargeshot'].includes(nk)&&adx>3.2&&Math.abs(dy)<1.4&&f.projCount('shot')<1)add('shot',1.2,nk==='chargeshot'?[{p:'special',h:['special'],f:10+Math.floor(rnd()*40)},...endS]:spN);
  if(nk==='chargeblow'&&adx<2.2&&Math.abs(dy)<1&&(stunned||rnd()<.2))add('charge',stunned?2.5:.6,[{p:'special',h:['special'],f:12+Math.floor(rnd()*(stunned?8:20))},...endS]);
  if((nk==='spin'||nk==='flurry')&&adx<1.5&&Math.abs(dy)<1.4)add('spinN',1.2,spN);
  if(sk==='lunge'&&adx>1.6&&adx<4.2&&Math.abs(dy)<1)add('lunge',1.1,spS);
  if(sk==='teleStrike'&&adx>2&&adx<7&&Math.abs(dy)<1.5)add('tele',.9,spS);
  if(sk==='cgrab'&&adx>1&&adx<3.4&&Math.abs(dy)<.6)add('cgrab',o.st==='shield'?3:.9,spS);
  if(sk==='whip'&&adx>1.3&&adx<2.9&&Math.abs(dy)<.8)add('whip',1.4,spS);
  if(sk==='spinkick'&&adx>1&&adx<3)add('spinkick',.8,spS);
  if(['quake','axe','slide','pound'].includes(dk)&&adx<2.4&&Math.abs(dy)<1)add('down',.8,spD);
  if(dk==='mine'&&adx>3&&f.projCount('mine')<1)add('mine',.5,spD);
  if(['uppercut','leap','copter'].includes(uk)&&adx<1.1&&dy>.8&&dy<3)add('upB',kill?1.2:.5,spU);
  if(cand.length&&rnd()<L.aggro+(stunned?.3:0)){let t=0;for(const x of cand)t+=x.w;let r=rnd()*t;for(const x of cand){r-=x.w;if(r<=0){if(face!==f.face&&!['dsmash'].includes(x.k))A.plan=[{x:face*.3,f:1},...x.steps];else A.plan=x.steps.slice();break}}return}
  /* close the distance */
  if(dy>1.8&&adx<3){A.plan=[{p:'jump',h:['jump'],f:4,x:face*.4},{f:20,x:face*.5,until:(f,o)=>Math.abs(o.x-f.x)<1&&o.y-f.y<2.3&&o.y>f.y},{p:'attack',y:1,f:1},{f:30,until:f=>f.ground}];return}
  if(adx>1.4&&adx<3.4&&rnd()<.35){const full=dy>.8||rnd()<.4,k=dy>1.2?'uair':rnd()<.5?'fair':'nair';
    A.plan=[{p:'jump',h:full?['jump']:[],f:full?4:1,x:face*.6},{f:28,x:face*.9,until:(f,o)=>Math.abs(o.x-f.x)<(k==='nair'?1:1.5)&&Math.abs(o.y+o.h*.5-f.y-1)<1.3},{p:'attack',x:k==='fair'?face:0,y:k==='uair'?1:0,f:1},{f:4},{f:30,fy:-1,y:-.2,until:f=>f.ground}];return}
  if(adx>2.4&&adx<4&&rnd()<.25){A.plan=[{fx:face,x:face,f:1},{x:face,f:5},{p:'attack',x:face,f:1},...endA];return}
  if(adx>4.5){A.plan=[{fx:face,x:face,f:1},{x:face,f:Math.floor(6+rnd()*14),until:(f,o)=>Math.abs(o.x-f.x)<2.6}];return}
  A.hx=adx>1.2?face*(.4+rnd()*.5):(rnd()<.3?-face*.6:0);
  if(rnd()<.06)A.plan=[{p:'shield',h:['shield'],f:10}]}
function aiAir(f,o,P,A,L,c){const{dx,adx,dy,face}=c,N=f.N;
  A.hx=face*(adx>.5?.9:.2);
  const ks=[['nair',0,0],['fair',f.face===face?f.face:0,0],['bair',f.face!==face?-f.face:0,0],['uair',0,1],['dair',0,-1]];
  for(const[k,x,y]of ks){if(k==='fair'&&f.face!==face||k==='bair'&&f.face===face)continue;const fc=k==='bair'?f.face:f.face;
    if(willHit(f,N[k],o,fc)&&rnd()<L.acc+.2){A.plan=[{p:'attack',x:k==='fair'?f.face:k==='bair'?-f.face:0,y,f:1},{f:4},{f:30,fy:o.y<f.y-.5?0:-1,y:-.2,until:f=>f.ground}];return}}
  if(f.jumps>0&&dy>1.4&&adx<2.5&&rnd()<.3){A.plan=[{p:'jump',f:1,x:face*.6}];return}
  if(f.vy<.02&&dy<-.6&&!f.ff&&rnd()<.5){A.plan=[{fy:-1,y:-1,f:1,x:face*.5}];return}}
/* the training dummy */
function dummyTick(f,o,P,A){const d=A.dummy,S=G.stage.main;P.x=0;P.y=0;
  if(f.st==='held'||f.st==='hurt'||f.st==='lie')return;
  const off=!f.ground&&(f.x<S.l-.15||f.x>S.r+.15||f.y<S.y-.3);if(off||f.st==='ledge'){aiEmergency(f,o,P,A,AIL(5));return}
  if(d==='shield')P.held.shield=true,f.ground&&!f.st.startsWith('sh')&&press(P,'shield');
  else if(d==='jump'){if(f.ground&&f.st==='stand'&&P.t%50===0)press(P,'jump'),P.held.jump=true}
  else if(d==='walk'){A.wd=A.wd||1;if(f.x>S.r-1.5)A.wd=-1;if(f.x<S.l+1.5)A.wd=1;P.x=A.wd*.6}}
