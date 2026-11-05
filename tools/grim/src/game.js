/* ================= the climb =================
   World y grows downward like the screen; climbing means going to smaller y. 10 pixels are a metre.
   The reaper bounces on every platform by itself; tilt steers, B slams down, A slashes. */
const GRAV=.22,JUMP=5.9,AIRSPD=2.7,SLAMV=8.2,MAXFALL=7.2;
const MON={/* hp is counted in combos: a combo (slam + four slashes) does 6 */
  wisp:{c:1,w:6,h:7,pts:100,from:0},bat:{c:1,w:8,h:5,pts:100,from:0},ghoul:{c:2,w:6,h:9,pts:250,from:60},
  wraith:{c:2,w:7,h:10,pts:250,from:250},garg:{c:3,w:9,h:8,pts:400,from:350},golem:{c:4,w:13,h:15,pts:700,from:600}};
const G={state:'title',t:0,plats:[],mons:[],items:[],fx:[],shots:[],pops:[],camY:0,top:0,maxH:0,kills:0,souls:0,best:store.get('best',0),bestCombo:0,shake:0,hitstop:0,nextMon:0,nextHeart:0,soulBank:0,menu:0};
const P={x:90,y:0,vx:0,vy:0,face:1,st:'air',hp:3,inv:0,slashT:0,slashN:0,canSlam:true,target:null,comboN:0,comboT:0,buf:{},ft:0};
const meters=y=>Math.max(0,Math.floor(-y/10));
function newGame(){Object.assign(G,{state:'play',t:0,plats:[],mons:[],items:[],fx:[],shots:[],pops:[],camY:-H+40,top:0,maxH:0,kills:0,souls:0,bestCombo:0,shake:0,hitstop:0,nextMon:-220,nextHeart:-3000,soulBank:0,deadT:0});
  Object.assign(P,{x:W/2,y:0,vx:0,vy:-JUMP,face:1,st:'air',hp:3,inv:0,slashT:0,slashN:0,canSlam:true,target:null,comboN:0,comboT:0,buf:{},ft:0});
  G.plats.push({x:W/2,y:6,w:W+40,kind:'stone',vx:0});/* the tower floor: nothing to fall off at the start */G.top=6;genUpTo(G.camY-H);music(true)}
/* ---------- building the tower upward ---------- */
function genUpTo(yTarget){while(G.top>yTarget){const m=meters(G.top),gapMax=36+Math.min(34,m*.034),gapMin=22+Math.min(14,m*.012);
    const y=G.top-(gapMin+rnd()*(gapMax-gapMin)),w=m>600?24+Math.floor(rnd()*8):28+Math.floor(rnd()*8);let x=14+w/2+rnd()*(W-28-w);
    const last=G.plats[G.plats.length-1];let kind='stone';const r=rnd();
    if(r<Math.min(.3,m/2200))kind='rune';else if(r<Math.min(.3,m/2200)+Math.min(.22,m/2600)&&last&&last.kind!=='crumble')kind='crumble';
    const p={x,y,w,kind,vx:kind==='rune'?(rnd()<.5?-1:1)*(.4+Math.min(.8,m/1500)):0};G.plats.push(p);G.top=y;
    if(kind==='stone'&&rnd()<.06&&m>20)G.items.push({t:'spring',plat:p,dx:(rnd()-.5)*(w-14),y});
    if(rnd()<.22)G.items.push({t:'soul',x:14+rnd()*(W-28),y:y-14-rnd()*10,ph:rnd()*6});
    if(y<G.nextHeart){G.nextHeart=y-3500-rnd()*1000;G.items.push({t:'heart',x:p.x,y:y-16,ph:0})}
    if(y<G.nextMon&&m>15){spawnMon(p,m);G.nextMon=y-Math.max(110,260-m*.12)-rnd()*90}}}
function spawnMon(p,m){const pool=Object.keys(MON).filter(k=>m>=MON[k].from&&k!=='golem');let t=pick(pool);
  if(m>=600&&rnd()<.14)t='golem';const d=MON[t],mon={t,w:d.w,h:d.h,hp:d.c*6,max:d.c*6,st:'live',flash:0,safe:0,ph:rnd()*6,f:0,vx:0,stun:0,shotT:90+rnd()*90};
  if(t==='ghoul'||t==='garg'||t==='golem'){if(t==='golem'){p.w=Math.max(p.w,64);p.kind='stone';p.vx=0;p.x=clamp(p.x,p.w/2+6,W-p.w/2-6)}
    mon.plat=p;mon.dx=0;mon.x=p.x;mon.y=p.y-d.h-1;mon.vx=t==='garg'?0:(rnd()<.5?-1:1)*(t==='golem'?.25:.4)}
  else{mon.bx=12+rnd()*(W-24);mon.by=p.y-26-rnd()*14;mon.x=mon.bx;mon.y=mon.by;if(t==='bat')mon.vx=(rnd()<.5?-1:1)*(.7+Math.min(.6,m/2000))}
  G.mons.push(mon)}
/* ---------- each frame ---------- */
function update(){G.t++;if(G.state==='dying'){if(--G.deadT<=0)gameOver();stepFx();return}if(G.state!=='play')return;
  if(G.hitstop>0){G.hitstop--;stepFx();return}
  if(G.shake>0)G.shake*=.85;if(G.shake<.2)G.shake=0;
  stepPlayer();stepPlats();stepMons();stepItems();stepShots();stepFx();
  /* the camera only goes up */
  const want=P.y-H*.46;if(want<G.camY)G.camY=lerp(G.camY,want,.25);genUpTo(G.camY-H);
  const cut=G.camY+H+60;G.plats=G.plats.filter(p=>p.y<cut&&!p.gone);G.mons=G.mons.filter(m=>m.y<cut+40&&m.st!=='gone');G.items=G.items.filter(i=>(i.plat?i.plat.y:i.y)<cut&&!i.got);
  const h=meters(P.y);if(h>G.maxH)G.maxH=h;
  if(P.st!=='dead'&&P.y-G.camY>H+24)die('fall')}
function pressed(b){if(P.buf[b]!=null&&G.t-P.buf[b]<=(P.st==='combo'?18:8)){P.buf[b]=null;return true}return false}
function stepPlayer(){P.ft++;if(P.inv>0)P.inv--;if(P.slashT>0)P.slashT--;
  if(P.st==='combo'){stepCombo();return}
  const steer=steerX();if(Math.abs(steer)>.08)P.face=sgn(steer);
  if(P.st==='slam'){/* a slam homes in a little on a monster right below */const mt=G.mons.find(m=>m.st==='live'&&m.y>P.y-6&&m.y<P.y+90&&Math.abs(m.x-P.x)<28);
    P.vx=mt?lerp(P.vx,clamp((mt.x-P.x)*.2,-2.4,2.4),.35):lerp(P.vx,steer*AIRSPD*.35,.2);P.vy=SLAMV;if(G.t%2===0)G.fx.push({k:'trail',x:P.x,y:P.y-8,t:10})}
  else{P.vx=lerp(P.vx,steer*AIRSPD,P.st==='hurt'?.06:.22);P.vy=Math.min(MAXFALL,P.vy+GRAV)}
  if(P.st==='hurt'&&P.inv<70)P.st='air';
  if(P.st==='air'&&P.canSlam&&pressed('b')){P.st='slam';P.vx*=.3;SFX.slam()}
  if(P.st!=='slam'&&pressed('a'))freeSlash();
  const oy=P.y;P.x+=P.vx;P.y+=P.vy;
  if(P.x<-8)P.x+=W+16;if(P.x>W+8)P.x-=W+16;
  /* landing on a platform bounces, a slam bounces higher */
  if(P.vy>0)for(const p of G.plats){if(p.gone)continue;const half=p.w/2+4;if(Math.abs(P.x-p.x)>half)continue;if(oy<=p.y+1&&P.y>=p.y){land(p);break}}
  /* monsters */
  for(const m of G.mons){if(m.st==='dying'||m.st==='gone')continue;if(!touch(m))continue;
    if(P.st==='slam'){startCombo(m);return}
    if(P.vy>1&&P.y-(m.y-m.h)<6&&m.st!=='stun'){P.vy=-JUMP*.8;P.canSlam=true;m.safe=20;SFX.jump();G.pops.push({x:m.x,y:m.y-m.h-8,s:'BOUNCE',c:'#c8b8ff',t:30});continue}
    if(m.safe<=0&&m.st==='live'&&P.inv<=0)hurt(sgn(P.x-m.x)||-P.face)}}
const touch=m=>{const r=P.st==='slam'?9:5;return Math.abs(P.x-m.x)<m.w+r&&P.y>m.y-m.h-(P.st==='slam'?4:2)&&P.y-16<m.y+m.h}
function land(p){P.y=p.y;let v=JUMP,slam=P.st==='slam';
  const sp=G.items.find(i=>i.t==='spring'&&i.plat===p&&Math.abs(P.x-(p.x+i.dx))<9);
  if(sp){v=JUMP*1.7;SFX.spring();sp.boing=12;G.pops.push({x:P.x,y:P.y-22,s:'SPRING!',c:'#e8c8ff',t:40})}
  else if(slam){v=JUMP*1.32;SFX.thud();G.shake=3;haptic(14);for(let i=0;i<10;i++)G.fx.push({k:'dust',x:P.x+(rnd()-.5)*14,y:p.y,vx:(rnd()-.5)*2,vy:-rnd()*1.2,t:22})}
  else SFX.jump();
  P.vy=-v;P.st='air';P.canSlam=true;
  if(p.kind==='crumble'){p.crumble=1;SFX.crumble();for(let i=0;i<8;i++)G.fx.push({k:'chip',x:p.x+(rnd()-.5)*p.w,y:p.y+2,vx:(rnd()-.5)*1.5,vy:rnd()*.5,t:40,c:PCOL.crumble[1]});p.gone=true}}
/* ---------- fighting ---------- */
function freeSlash(){P.slashT=12;P.slashN=0;SFX.swing(0);
  const x0=P.x+(P.face>0?-2:-24),x1=P.x+(P.face>0?24:2),y0=P.y-20,y1=P.y+2;
  for(const m of G.mons){if(m.st!=='live'&&m.st!=='stun')continue;if(m.x+m.w<x0||m.x-m.w>x1||m.y+m.h<y0||m.y-m.h>y1)continue;
    damage(m,1,0);m.safe=Math.max(m.safe,24);if(m.plat)m.dx=clamp((m.dx||0)+P.face*5,-m.plat.w/2,m.plat.w/2);else m.bx=(m.bx??m.x)+P.face*8}
  for(const s of G.shots)if(Math.abs(s.x-(x0+x1)/2)<14&&s.y>y0&&s.y<y1+4){s.life=0;spark(s.x,s.y,'#ffb04a',6)}}
function startCombo(m){P.st='combo';P.target=m;P.comboN=0;P.comboT=56;P.vx=P.vy=0;P.face=sgn(m.x-P.x)||P.face;m.st='stun';m.stun=0;
  P.x=m.x-P.face*(m.w+5);P.y=m.y+7;SFX.thud();SFX.hit(0);G.shake=4;G.hitstop=7;haptic(30);
  G.combo=1;damage(m,1,0);G.pops.push({x:m.x,y:m.y-m.h-10,s:'SLAM!',c:'#c88aff',t:36});for(let i=0;i<12;i++)G.fx.push({k:'dust',x:m.x+(rnd()-.5)*16,y:m.y+m.h,vx:(rnd()-.5)*2.5,vy:-rnd()*1.5,t:20})}
function stepCombo(){const m=P.target;if(!m||m.st==='gone'||m.st==='dying'){endCombo(true);return}
  P.x=m.x-P.face*(m.w+5);P.y=m.y+7;
  if(pressed('a')){P.comboN++;const n=P.comboN,fin=n>=4;P.slashT=fin?16:11;P.slashN=n;damage(m,fin?2:1,n);P.comboT=56;G.combo++;G.bestCombo=Math.max(G.bestCombo,G.combo);
    G.hitstop=fin?10:4;G.shake=fin?5:2;haptic(fin?40:14);if(fin)SFX.finish();else SFX.hit(n);
    if(m.st==='dying'){endCombo(true);return}
    if(fin){m.st='live';m.safe=80;if(m.plat)m.dx=clamp((m.dx||0)+P.face*10,-m.plat.w/2,m.plat.w/2);else{m.bx=(m.bx??m.x)+P.face*16;m.by=(m.by??m.y)-6}endCombo(false,true);return}}
  if(--P.comboT<=0){m.st='live';m.safe=70;endCombo(false)}}
function endCombo(killed,finished){P.st='air';P.target=null;P.canSlam=true;P.vy=-JUMP*(killed?1.2:finished?1.1:.8);P.vx=0;
  if(G.combo>=2)G.pops.push({x:P.x,y:P.y-30,s:G.combo+' HITS',c:'#ffd84a',t:45})}
function damage(m,n,k){m.hp-=n;m.flash=6;spark(m.x+(rnd()-.5)*4,m.y-(rnd()*m.h),k>=4?'#ffd84a':'#ffffff',k>=4?14:7);if(k)G.fx.push({k:'arc',x:m.x,y:m.y,n:k,f:P.face,t:9});
  if(m.hp<=0)kill(m)}
function kill(m){m.st='dying';m.dieT=26;G.kills++;const d=MON[m.t];G.pts=(G.pts||0)+d.pts;SFX.kill();haptic(30);
  G.pops.push({x:m.x,y:m.y-m.h-12,s:'+'+d.pts,c:'#ffffff',t:40});for(let i=0;i<d.c*3;i++)G.items.push({t:'soul',x:m.x+(rnd()-.5)*10,y:m.y-rnd()*m.h,ph:rnd()*6,vx:(rnd()-.5)*3,vy:-1-rnd()*2,fly:1})
  for(let i=0;i<16;i++)G.fx.push({k:'smoke',x:m.x+(rnd()-.5)*m.w*2,y:m.y-rnd()*m.h*2,vx:(rnd()-.5)*1.2,vy:-rnd()*1,t:30+rnd()*20})}
function hurt(dir){if(P.inv>0||P.st==='dead')return;P.hp--;P.inv=90;P.st='hurt';P.vy=-3.6;P.vx=dir*2.2;SFX.hurt();G.shake=5;haptic(60);
  G.pops.push({x:P.x,y:P.y-24,s:'-1',c:'#ff6a7a',t:36});if(P.hp<=0)die('hit')}
function die(why){if(P.st==='dead')return;P.st='dead';P.vx=0;G.state='dying';G.deadT=why==='fall'?50:90;SFX.die();music(false);haptic(90);
  if(why==='hit'){P.vy=-3;for(let i=0;i<20;i++)G.fx.push({k:'smoke',x:P.x+(rnd()-.5)*10,y:P.y-rnd()*16,vx:(rnd()-.5)*1.5,vy:-rnd()*1.2,t:40})}}
function gameOver(){G.state='over';G.overT=40;G.newBest=G.maxH>G.best;if(G.newBest){G.best=G.maxH;store.set('best',G.best)}}
const spark=(x,y,c,n)=>{for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,s=.6+rnd()*1.8;G.fx.push({k:'spark',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:10+rnd()*8,c})}};
/* ---------- the world moving ---------- */
function stepPlats(){for(const p of G.plats){if(!p.vx)continue;p.x+=p.vx;if(p.x<p.w/2+4||p.x>W-p.w/2-4)p.vx*=-1}}
function stepMons(){for(const m of G.mons){m.f++;if(m.flash>0)m.flash--;if(m.safe>0)m.safe--;
    if(m.st==='dying'){if(--m.dieT<=0)m.st='gone';continue}if(m.st==='stun')continue;
    const t=G.t+m.ph*60;
    if(m.plat){if(m.plat.gone){m.y+=3;continue}m.dx=(m.dx||0)+m.vx;const lim=m.plat.w/2-m.w;if(Math.abs(m.dx)>lim){m.dx=clamp(m.dx,-lim,lim);m.vx*=-1}m.x=m.plat.x+m.dx;m.y=m.plat.y-m.h-1;
      if(m.t==='garg'&&--m.shotT<=0){m.shotT=150;const dy=P.y-m.y,dx=P.x-m.x;if(dy>-40&&dy<160&&Math.abs(dx)<130){const l=Math.hypot(dx,dy)||1;G.shots.push({x:m.x,y:m.y+2,vx:dx/l*1.3,vy:dy/l*1.3,life:200});m.open=20;SFX.spit()}}
      if(m.open>0)m.open--}
    else if(m.t==='wisp'){m.x=m.bx+Math.sin(t*.025)*22;m.y=m.by+Math.sin(t*.05)*4}
    else if(m.t==='bat'){m.bx+=m.vx;if(m.bx<-10)m.bx=W+10;if(m.bx>W+10)m.bx=-10;m.x=m.bx;m.y=m.by+Math.sin(t*.08)*8}
    else if(m.t==='wraith'){const dy=P.y-10-m.by;if(Math.abs(dy)<130&&P.st!=='dead'){m.bx+=sgn(P.x-m.bx)*.32;m.by+=clamp(dy,-1,1)*.18}m.x=m.bx;m.y=m.by+Math.sin(t*.06)*3}}}
function stepItems(){for(const i of G.items){if(i.got)continue;if(i.boing>0)i.boing--;let x=i.x,y=i.y;if(i.plat){x=i.plat.x+i.dx;y=i.plat.y;if(i.plat.gone)i.got=1;continue}
    if(i.fly){i.x+=i.vx;i.y+=i.vy;i.vx*=.92;i.vy*=.92;if(Math.abs(i.vx)+Math.abs(i.vy)<.3)i.fly=0}
    if(i.t==='soul'){const dx=P.x-i.x,dy=P.y-8-i.y,d=Math.hypot(dx,dy);if(d<46&&P.st!=='dead'){i.x+=dx/d*2.4;i.y+=dy/d*2.4}if(d<8){i.got=1;G.souls++;G.soulBank++;SFX.soul();
        if(G.soulBank>=40){G.soulBank-=40;if(P.hp<5){P.hp++;SFX.heart();G.pops.push({x:P.x,y:P.y-28,s:'+1 ♥',c:'#ff8a9a',t:50})}}}}
    if(i.t==='heart'&&Math.abs(P.x-i.x)<9&&Math.abs(P.y-8-i.y)<12){i.got=1;P.hp=Math.min(5,P.hp+1);SFX.heart();G.pops.push({x:P.x,y:P.y-28,s:'+1 ♥',c:'#ff8a9a',t:50})}}}
function stepShots(){for(const s of G.shots){s.x+=s.vx;s.y+=s.vy;s.life--;if(G.t%3===0)G.fx.push({k:'ember',x:s.x,y:s.y,vx:0,vy:-.2,t:12});
    if(P.st!=='combo'&&P.st!=='dead'&&Math.abs(s.x-P.x)<6&&s.y>P.y-16&&s.y<P.y+2){s.life=0;hurt(sgn(s.vx)||1)}}
  G.shots=G.shots.filter(s=>s.life>0&&s.y<G.camY+H+20)}
function stepFx(){for(const e of G.fx){e.t--;e.x+=e.vx||0;e.y+=e.vy||0;if(e.k==='chip'||e.k==='dust')e.vy=(e.vy||0)+.08}G.fx=G.fx.filter(e=>e.t>0);
  for(const q of G.pops){q.t--;q.y-=.35}G.pops=G.pops.filter(q=>q.t>0)}
