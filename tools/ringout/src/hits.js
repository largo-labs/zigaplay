/* ================= hits, launches, projectiles and effects ================= */
const ov=(a,b)=>a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t;
function hurtBox(f){return{l:f.x-f.hw,r:f.x+f.hw,t:f.y-f.h,b:f.y}}
function worldBox(f,b){const x=f.x+f.face*b.x,y=f.y+b.y;return{l:x-b.w/2,r:x+b.w/2,t:y-b.h/2,b:y+b.h/2,cx:x,cy:y}}
function moveBoxes(f){const m=f.mv;if(!m)return[];const d=m.def;if(d.boxes)return d.boxes(f,m)||[];if(m.f>=d.s&&m.f<d.s+d.a)return d.hb;return[]}
const dodging=f=>(f.st==='dodge'||f.st==='adodge')&&f.inv>0;
/* knockback: grows with the target's percent (after the hit) and the hit's damage; heavier fighters fly less */
function kbSpeed(b,pct,w){return(b.kb+b.kg*pct/40*(1+b.dmg/28))*(200/(w+100))*.5}
function launch(A,B,b,dir,ranged){if(B.st==='grabbed'&&!b.thrown&&B.grabber&&B.grabber!==A){B.grabber.mv=null;B.grabber.st='air'}
  const wasHurt=B.st==='hurt'||B.st==='grabbed';if(B.mv&&B.mv.victim){const v=B.mv.victim;if(v.st==='grabbed'){v.st=v.ground?'ground':'air';v.t=0}}
  B.pct=Math.min(999,B.pct+b.dmg);if(A){A.dealt+=b.dmg}
  const v=kbSpeed(b,B.pct,B.w);let ang=b.ang;if(b.spikeAir&&B.ground)ang=60;if(ang<0&&B.ground)ang=-ang*.6;
  /* holding away from the hit nudges the angle a little (DI) */
  const di=B.hH*dir;if(di&&ang<80)ang+=di>0?-6:6;
  const r=ang*D2R;B.kx=Math.cos(r)*v*dir;B.ky=-Math.sin(r)*v*1.6*VS;B.vx=0;B.vy=0;if(B.ky<-.1)B.ground=null;
  B.hitstun=Math.round(clamp(v*8+5,8,70));B.st='hurt';B.t=0;B.tumble=v>2.6;B.mv=null;B.inv=0;
  const hl=Math.round(clamp(2+b.dmg/2.2,3,13));B.hitlag=hl;if(A&&!ranged)A.hitlag=hl;
  B.flash=8;B.upUsed=B.sideUsed=false;B.adodged=false;B.lastHit=A;
  if(A){if(wasHurt&&A.comboT>0)A.combo++;else A.combo=1;A.comboT=70;A.bestCombo=Math.max(A.bestCombo,A.combo);if(A.combo>=2)G.comboShow={f:A,n:A.combo,t:60}}
  const cx=B.x-dir*2,cy=B.y-B.h/2;spark(cx,cy,v>3.2?3:v>1.8?2:1,A?A.ch.fx:'#ffffff');SFX.hit(v>3.2?2:v>1.8?1:0);
  if(v>3.4){G.shake=Math.min(9,v*1.6);SFX.smash();G.kobeam=null}}
/* a perfectly timed dodge: the attacker is left wide open */
function perfectDodge(B,A){G.slow=18;SFX.perfect();text(B.x,B.y-B.h-8,'PERFECT DODGE!','#6af0ff');B.perfects++;
  B.st=B.ground?'ground':'air';B.t=0;B.inv=8;B.mv=null;B.adodged=false;
  A.st='stagger';A.t=0;A.stag=38;A.mv=null;A.vx*=.3;A.flash=0;burst(A.x,A.y-A.h-2,'#ffd84a',8)}
/* a counter catches the hit and strikes back */
function counterHit(B,A,inc){B.mv.done=1;B.mv.window=false;SFX.counter();text(B.x,B.y-B.h-8,'COUNTER!','#ffd84a');G.slow=10;
  if(A&&Math.abs(A.x-B.x)<60&&Math.abs(A.y-B.y)<50){B.face=sgn(A.x-B.x)||B.face;burst((A.x+B.x)/2,B.y-12,'#ffffff',12);
    launch(B,A,{dmg:Math.max(8,Math.round((inc.dmg||6)*1.3)),kb:3.3,kg:1.1,ang:38},B.face,false);B.hitlag=A.hitlag=12}}
function resolveHits(){
  for(const A of G.fighters){if(A.dead||!A.mv||A.hitlag>0)continue;const m=A.mv,d=m.def;
    for(const b of moveBoxes(A))if(hitWith(A,m,b,worldBox(A,b),d))break}
  for(const tb of G.tboxes){const A=tb.own;for(const b of tb.boxes)hitWith(A,tb,b,worldBox(A,b),null)}
  G.tboxes=G.tboxes.filter(t=>--t.life>0)}
function hitWith(A,m,b,wb,d){
  for(const B of G.fighters){if(B===A||B.dead||B.st==='respawn')continue;
    const last=m.hit.get(B);if(last!==undefined&&(!b.rehit||last===m.f))continue;if(!ov(wb,hurtBox(B)))continue;
    if(B.inv>0){if(dodging(B)&&!m.pdodged&&!b.grab&&d){m.pdodged=1;perfectDodge(B,A);return true}continue}
    if(b.grab){if(B.st==='grabbed')continue;m.hit.set(B,m.f);if(d&&d.onGrab){d.onGrab(A,m,B);B.grabber=A}return true}
    if(B.mv&&B.mv.window){m.hit.set(B,m.f);counterHit(B,A,b);return true}
    m.hit.set(B,m.f);m.connected=true;
    const dir=b.radial?(sgn(B.x-wb.cx)||A.face):b.back?-A.face:A.face;
    launch(A,B,b,dir,false);if(d&&d.onHit)d.onHit(A,m,B);return true}
  return false}
/* ---------- projectiles ---------- */
function spawnProj(own,o){const p=Object.assign({own,t:0,hit:new Map()},o);p.vx0=p.vx;G.proj.push(p);return p}
const countProj=(own,tag)=>G.proj.filter(p=>p.own===own&&p.tag===tag&&p.life>0).length;
function projBox(p){return{l:p.x-p.w/2,r:p.x+p.w/2,t:p.y-p.h/2,b:p.y+p.h/2}}
function explode(p){p.life=0;SFX.boom();G.shake=Math.max(G.shake,4);burst(p.x,p.y,'#ffd84a',14);burst(p.x,p.y,'#ff8a3a',10);
  G.blasts.push({own:p.own,x:p.x,y:p.y,r:17,life:5,b:{dmg:p.dmg,kb:p.kb,kg:p.kg,ang:p.ang},hit:new Set()})}
function updProj(p){p.t++;p.life--;
  if(p.mine){if(!p.landed){p.vy+=p.g;p.y+=p.vy;const pl=platUnder(p.x,p.y-p.vy-1);if(pl&&p.y>=pl.y-2){p.y=pl.y-2;p.landed=1;p.vy=0}}}
  else if(p.boomer){const back=p.t>26;if(!back)p.vx=p.vx0*(1-p.t/30);else{const o=p.own,dx=o.x-p.x,dy=o.y-12-p.y,l=Math.hypot(dx,dy)||1;p.vx=lerp(p.vx,dx/l*3.6,.12);p.vy=lerp(p.vy,dy/l*3.6,.12);if(l<8&&!o.dead)p.life=0}p.x+=p.vx;p.y+=p.vy}
  else{p.vy+=p.g||0;p.x+=p.vx;p.y+=p.vy;if(p.float)p.y+=Math.sin(p.t*.15)*.5;
    if(p.hug){const pl=platUnder(p.x,p.y);if(!pl||pl.y-p.y>14)p.life=0;else p.y=pl.y-5}
    else if(p.vy>0){const pl=platUnder(p.x,p.y-p.vy-1);if(pl&&p.y>=pl.y-p.h/2){if(p.explode)explode(p);else if(p.bounce&&(p.bn=(p.bn||0)+1)<3){p.y=pl.y-p.h/2;p.vy=-1.6*VS}}}}
  if(p.x<-30||p.x>W+30||p.y>H+30||p.y<-60)p.life=0;
  if(p.life<=0){if(p.explode&&!p.boom&&p.t>1&&!p.mine){p.boom=1;explode(p)}return}
  const pb=projBox(p);
  for(const B of G.fighters){if(B===p.own||B.dead||B.st==='respawn')continue;
    if(p.mine&&p.t<p.arm)continue;
    const last=p.hit.get(B);if(last!==undefined&&(!p.rehit||p.t-last<p.rehit))continue;
    if(!ov(pb,hurtBox(B)))continue;
    if(B.mv&&B.mv.def.slot==='d'&&B.mv.reflect&&!p.mine){p.own=B;p.vx=-p.vx*1.25;p.vx0=-p.vx0;p.vy=-p.vy;p.hit=new Map();p.t=Math.min(p.t,4);SFX.counter();burst(p.x,p.y,B.ch.fx,6);text(B.x,B.y-B.h-8,'REFLECT!','#bff4ff');continue}
    if(B.mv&&B.mv.window){p.life=0;counterHit(B,p.own,p);continue}
    if(B.inv>0)continue;
    p.hit.set(B,p.t);
    if(p.explode){explode(p);return}
    launch(p.own,B,p,sgn(p.vx)||p.own.face,true);
    if(!p.boomer)p.life=0;return}
  /* two projectiles from different fighters cancel out */
  for(const q of G.proj)if(q!==p&&q.life>0&&q.own!==p.own&&!q.mine&&!p.mine&&ov(pb,projBox(q))){p.life=0;q.life=0;burst((p.x+q.x)/2,(p.y+q.y)/2,'#ffffff',6);SFX.hit(0)}}
function updBlasts(){for(const x of G.blasts){x.life--;for(const B of G.fighters){if(B===x.own||B.dead||B.inv>0||x.hit.has(B)||B.st==='respawn')continue;
      if(ov({l:x.x-x.r,r:x.x+x.r,t:x.y-x.r,b:x.y+x.r},hurtBox(B))){x.hit.add(B);launch(x.own,B,x.b,sgn(B.x-x.x)||1,true)}}}
  G.blasts=G.blasts.filter(x=>x.life>0)}
function addBoxFx(own,boxes,life){G.tboxes.push({own,boxes,life,hit:new Map(),f:0})}
/* ---------- particles and words ---------- */
function fx(o){G.parts.push(Object.assign({g:0},o))}
function dust(x,y,n){for(let i=0;i<n;i++)G.parts.push({x:x+(rnd()-.5)*8,y:y-1,vx:(rnd()-.5)*1.2,vy:-rnd()*.6,life:14+rnd()*8,c:'#ffffff',s:2,g:.02})}
function puff(x,y){for(let i=0;i<6;i++){const a=i/6*Math.PI*2;G.parts.push({x,y,vx:Math.cos(a)*1.1,vy:Math.sin(a)*.5,life:12,c:'#ffffff',s:2,g:0})}}
function burst(x,y,c,n){for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,v=.6+rnd()*2;G.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:12+rnd()*12,c,s:rnd()<.3?2:1,g:.03})}}
function spark(x,y,lv,c){G.parts.push({x,y,life:6+lv*2,spark:lv,c,vx:0,vy:0,g:0});burst(x,y,c,3+lv*3)}
function text(x,y,s,c){G.texts.push({x:clamp(x,tw(s)/2+2,W-tw(s)/2-2),y,s,c,life:60})}
function updFx(){for(const p of G.parts){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g||0;if(p.ko){p.vx*=.95;p.vy*=.95}p.life--}G.parts=G.parts.filter(p=>p.life>0);
  for(const t of G.texts){t.y-=.3;t.life--}G.texts=G.texts.filter(t=>t.life>0);if(G.shake>0)G.shake-=.5;
  if(G.kobeam&&--G.kobeam.t<=0)G.kobeam=null;if(G.comboShow&&--G.comboShow.t<=0)G.comboShow=null}
