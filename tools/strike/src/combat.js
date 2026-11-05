/* ================= hitting, knockback, projectiles, effects ================= */
/* register a hitbox for this frame. x is forward from the fighter (or a world spot with o.abs) */
function hit(f,m,id,x,y,r,d,kb,kg,ang,o){const s=f.c.sz,b={id,m,d,kb,kg,ang,r:r*(o&&o.abs?1:s)};if(o)Object.assign(b,o);
  if(o&&o.abs){b.x=x;b.y=y}else{b.x=f.x+f.face*x*s;b.y=f.y+y*s}f.boxes.push(b)}
function hurt(v){const s=v.c.sz;return{x1:v.x-9*s,x2:v.x+9*s,y1:v.y-31*s,y2:v.y}}
function touches(cx,cy,r,v){const h=hurt(v),nx=clamp(cx,h.x1,h.x2),ny=clamp(cy,h.y1,h.y2);return(cx-nx)**2+(cy-ny)**2<=r*r}
function resolveHits(){for(const a of FT){if(!a.boxes.length||a.hl>0)continue;const m=a.mv;if(!m)continue;
  for(const v of FT){if(v===a||v.st==='ko'||v.st==='spawn'||(v.st==='held'&&v.holder!==a))continue;
    const done=new Set();for(const b of a.boxes){const key=v.id+':'+b.id;if(m.hits.has(key)||done.has(b.id))continue;if(v.inv>0)continue;
      if(!touches(b.x,b.y,b.r,v))continue;done.add(b.id);m.hits.add(key);applyHit(a,v,b,a.face)}}}}
function calcKB(v,b,d){if(!b.kg)return b.kb;return(b.kb+v.pct*(.12+d*.012)*b.kg/100*1.9)*(200/(100+v.c.w))}
function applyHit(a,v,b,dir){
  if(b.cmd){if(v.st==='held'||v.st==='ledge')return;v.st='held';v.t=0;v.holder=a;v.mv=null;v.vx=v.vy=v.lvx=v.lvy=0;a.mv.caught=v;a.mv.ct=a.mv.t;a.mv.hitAny=true;SFX.hit(1);return}
  if(b.grab){if(v.st==='ledge')return;v.st='held';v.t=0;v.holder=a;v.mv=null;v.vx=v.vy=v.lvx=v.lvy=0;a.held=v;a.st='holding';a.t=0;a.mv=null;SFX.hit(0);return}
  if(v.counter&&!b.proj&&v.mv){v.mv.fired=v.mv.t;v.mv.cd=Math.round(Math.max(10,b.d*1.3));v.inv=26;v.face=sgn(a.x-v.x)||v.face;v.counter=false;a.hl=16;v.flash=10;
    ringFx(v.x,v.y-16,'#ffffff',30);SFX.parry();return}
  if(v.st==='shield'&&!b.unblock){
    if(v.shT<5){SFX.parry();v.flash=8;ringFx(v.x,v.y-16,'#ffffff',22);if(!b.proj&&a.st!=='ko'){a.st='stun';a.t=0;a.stunN=22;a.mv=null;a.boxes.length=0}v.inv=6;return}
    v.sh-=b.d*1.4+2;v.vx=dir*(.8+b.d*.12);const hl=Math.round(2+b.d*.25);v.hl=hl;if(!b.proj){a.hl=hl;if(a.gr)a.vx=-dir*(.6+b.d*.06)}SFX.shield();
    if(v.sh<=0)breakShield(v);if(a.mv)a.mv.hitAny=true;return}
  const d=b.d*(b.proj?1:pwr(a));const wasHit=v.st==='hit'||v.st==='down';v.pct=Math.min(999,v.pct+d);a.dmg+=d;
  if(b.drain){a.pct=Math.max(0,a.pct-b.drain);ringFx(a.x,a.y-16,'#7affa0',16)}
  if(a.mv&&!b.proj)a.mv.hitAny=true;
  if(b.snare){setSt(v,'stun');v.stunN=b.snare;v.vx=0;v.mv=null;SFX.hit(0);spark(v.x,v.y-8,a.c.fx,6);return}
  if(v.armor&&d<v.armor){v.hl=Math.round(3+d*.3);v.flash=4;SFX.hit(0);spark(v.x,v.y-16,'#ffffff',4);return}
  if(v.held){const h=v.held;h.st='air';h.holder=null;v.held=null}
  const kb=calcKB(v,b,d);let ang=b.ang;
  if(b.radial){const cx=b.cx!=null?b.cx:b.x,cy=b.cy!=null?b.cy:b.y;dir=sgn(v.x-cx)||dir;ang=Math.atan2(-((v.y-16)-cy),Math.abs(v.x-cx))*180/Math.PI;ang=clamp(ang,25,85)}
  const r=ang*Math.PI/180,L=kb*.1;v.vx=v.vy=0;v.mv=null;v.hide=0;v.ff=0;v.counter=v.reflect=false;
  if(!b.kg){/* linking hits carry the target along */v.lvx=0;v.lvy=0;v.vx=a.vx*.9;v.vy=Math.min(0,a.vy*.9);if(b.x!=null){v.x+=(b.x-v.x)*.2;v.y+=((b.y+12)-v.y)*.15}v.hs=10;v.st='hit';v.t=0;if(!v.gr)v.vy=a.vy*.9}
  else{v.lvx=Math.cos(r)*L*dir;v.lvy=-Math.sin(r)*L;
    if(v.gr&&v.lvy>0)v.lvy=-v.lvy*.6;
    if(v.gr&&v.lvy>-2.2&&kb<42){v.lvy=0}else if(v.gr){v.gr=null;v.y-=1}
    v.hs=Math.floor(kb*.42);v.st='hit';v.t=0;v.tumble=kb>62}
  const hl=Math.min(14,Math.round(3+d*.45+(kb>90?3:0)));v.hl=hl;if(!b.proj)a.hl=hl;
  v.lastHit=a;if(wasHit){a.combo++;a.comboD+=d}else{a.combo=1;a.comboD=d}a.comboT=90;
  const sx=b.x!=null?(b.x+v.x)/2:v.x,sy=b.y!=null?(b.y+v.y-16)/2:v.y-16;spark(sx,sy,a.c.fx,kb>70?12:6,kb);
  if(kb>70)shake(Math.min(10,kb*.06));SFX.hit(kb>85?2:kb>45?1:0);if(!a.cpu||!v.cpu)haptic(kb>85?35:kb>45?18:8);
  if(kb>110&&v.pct>60)MATCH.flash=6}
function hitNow(a,v,b,dir){b.x=v.x;b.y=v.y-16;applyHit(a,v,b,dir)}
/* ---------- projectiles ---------- */
function proj(f,o){const p=Object.assign({o:f,t:0,hits:new Set(),col:f.c.fx,ang:o.ang||45,kb:o.kb||0,kg:o.kg||0},o),k=pwr(f),sp=.88+f.c.spd*.05;
  p.d=(o.d||0)*k;if(o.boom)p.boom=Object.assign({},o.boom,{d:o.boom.d*k});if(!o.stick){p.vx*=sp;if(o.ret)p.ret*=sp}p.r*=f.c.sz;p.x=f.x+f.face*o.x*f.c.sz;p.y=f.y+o.y*f.c.sz;p.dir=f.face;PROJ.push(p);return p}
function killOwn(f,kind){for(const p of PROJ)if(p.o===f&&p.kind===kind)p.dead=1}
function groundAt(x,y0,y1){for(const p of PLATS)if(x>=p.x1&&x<=p.x2&&y0<=p.y+.5&&y1>=p.y)return p;return null}
function explode(p){if(p.dead)return;p.dead=1;const B=p.boom;ringFx(p.x,p.y,'#ffd84a',B.r+8);burst(p.x,p.y,'#ff8a3a',14,4);shake(6);SFX.boom();
  for(const v of FT){if(v===p.o||v.st==='ko'||v.st==='spawn'||v.inv>0)continue;const dx=v.x-p.x,dy=(v.y-14)-p.y;if(dx*dx+dy*dy<(B.r+12)**2)applyHit(p.o,v,{d:B.d,kb:B.kb,kg:B.kg,ang:60,radial:1,cx:p.x,cy:p.y,proj:1},sgn(dx)||p.dir)}}
function projTick(p){p.t++;const o=p.o;
  if(p.ret){const back=sgn(p.vx)!==p.dir;p.vx-=p.dir*p.ret;if(!back&&sgn(p.vx)!==p.dir)p.hits.clear();
    if(back){p.vy=((o.y-18)-p.y)*.08;if(Math.hypot(o.x-p.x,o.y-18-p.y)<14&&o.st!=='ko'){p.dead=1;return}}}
  if(p.grav)p.vy+=p.grav;const py=p.y;p.x+=p.vx;p.y+=p.vy;
  if(p.grav||p.stick){const g=p.vy>=0&&groundAt(p.x,py,p.y);if(g){p.y=g.y;if(p.boom&&!p.fuse&&!p.stick){explode(p);return}
      if(p.bounce){p.vy=p.bounce;if(p.fric)p.vx*=p.fric}else{p.vy=0;p.vx=0;p.grav=0;p.set=g}}}
  if(p.ground&&!PLATS.some(q=>p.x>=q.x1&&p.x<=q.x2&&Math.abs(q.y-(p.y+6))<10)){p.dead=1;burst(p.x,p.y,p.col,3,1);return}
  if(p.ground&&p.t%3===0)burst(p.x,p.y+4,p.col,1,1.5);
  if(--p.life<=0){if(p.boom)explode(p);else p.dead=1;return}
  if(p.arm&&p.t<p.arm)return;
  for(const v of FT){if(v===p.o||v.st==='ko'||v.st==='spawn'||v.st==='held')continue;
    if(p.trig){if(v.inv>0)continue;const dx=v.x-p.x,dy=v.y-p.y;if(Math.abs(dx)<p.trig+6&&dy>-30&&dy<12){if(p.boom)explode(p);else{p.dead=1;applyHit(o,v,{d:p.d,kb:0,kg:0,ang:0,snare:p.snare,proj:1},1);ringFx(p.x,p.y,p.col,18)}return}continue}
    if(!touches(p.x,p.y,p.r,v))continue;
    if(v.reflect){p.vx=-p.vx*1.15;p.vy=-Math.abs(p.vy)*.4;p.dir=-p.dir;p.o=v;p.d=Math.round(p.d*1.25);p.hits.clear();p.life=Math.max(p.life,40);ringFx(p.x,p.y,'#ffffff',16);SFX.parry();return}
    if(v.inv>0)continue;
    if(p.boom){explode(p);return}if(p.hits.has(v.id))continue;p.hits.add(v.id);
    applyHit(o,v,{d:p.d,kb:p.kb,kg:p.kg,ang:p.ang,proj:1,x:p.x,y:p.y},sgn(p.vx)||p.dir);
    if(!p.ret&&!p.ground)p.dead=1;else if(v.st==='shield')p.dead=1;if(p.dead){burst(p.x,p.y,p.col,5,2);return}}
  if(p.x<BLAST.l-40||p.x>BLAST.r+40||p.y>BLAST.b+40||p.y<BLAST.t-40)p.dead=1}
/* ---------- KOs ---------- */
function koFighter(f){if(f.st==='ko')return;const lh=f.lastHit;if(lh&&lh!==f)lh.kos++;f.falls++;if(!MATCH.train)f.stocks--;
  const x=clamp(f.x,BLAST.l+10,BLAST.r-10),y=clamp(f.y,BLAST.t+10,BLAST.b-10);FX.push({k:'ko',x,y,ang:Math.atan2(-y,-x),life:40,max:40,col:f.c.fx});
  if(f.held){f.held.st='air';f.held.holder=null;f.held=null}
  setSt(f,'ko');f.mv=null;f.vx=f.vy=f.lvx=f.lvy=0;f.gr=null;f.boxes.length=0;f.hide=0;killOwn(f,'mine');killOwn(f,'trap');
  SFX.ko();shake(12);haptic(60);MATCH.flash=8;
  if(!MATCH.train&&f.stocks<=0)MATCH.ending=1}
/* ---------- effects ---------- */
function shake(n){SHAKE=Math.max(SHAKE,n)}
function burst(x,y,col,n,sp){for(let i=0;i<n;i++){const a=rnd()*TAU,s=sp*(.4+rnd()*.8);FX.push({k:'p',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:14+rnd()*10|0,max:24,col,r:1.2+rnd()*1.6})}}
function spark(x,y,col,n,kb=30){FX.push({k:'spark',x,y,life:10,max:10,col,r:8+Math.min(22,kb*.14),rot:rnd()*TAU});burst(x,y,col,n,2+kb*.03);burst(x,y,'#ffffff',Math.ceil(n/2),2.5)}
function ringFx(x,y,col,r,w=1){FX.push({k:'ring',x,y,col,r,life:16,max:16,w})}
function dust(x,y){for(let i=0;i<4;i++)FX.push({k:'dust',x:x+(rnd()-.5)*10,y:y-2,vx:(rnd()-.5)*1.6,vy:-rnd()*.6,life:18,max:18,r:3+rnd()*2})}
function fxTick(){for(const e of FX){e.life--;if(e.vx!=null){e.x+=e.vx;e.y+=e.vy;if(e.k==='p'){e.vy+=.08;e.vx*=.96}}}FX=FX.filter(e=>e.life>0);if(FX.length>400)FX.splice(0,FX.length-400)}
