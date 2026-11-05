/* ================= hits, shields, grabs, projectiles, knockouts ================= */
/* the body that can be hit: a capsule up the fighter, lower when crouching or lying down */
function hurtCap(f){const low=f.st==='crouch'||f.st==='lie'?.62:f.st==='roll'||f.st==='spot'?.8:1,top=f.y+f.h*low;return{x:f.x,y0:f.y+.25,y1:Math.max(f.y+.3,top-.25),r:.32*(f.ch.look.h||1)}}
function circCap(cx,cy,r,c){const dy=clamp(cy,c.y0,c.y1);return Math.hypot(cx-c.x,cy-dy)<=r+c.r}
function moveBoxes(f){const m=f.mv;if(!m)return[];const d=m.def;if(d.boxes)return d.boxes(f,m)||[];if(m.f>=d.s&&m.f<d.s+d.a)return d.hb||[];return[]}
/* knockback, the classic formula: grows with the percent after the hit and with the hit's damage; heavier fighters fly less */
function kbOf(b,pct,w){return((pct/10+pct*b.dmg/20)*200/(w+100)*1.4+18)*b.kg/100+b.kb}
function launch(A,B,b,dir,ranged){
  const wasHurt=B.st==='hurt';
  if(B.holding){const v=B.holding;B.holding=null;v.release()}if(B.st==='held'){B.holder&&(B.holder.holding=null);B.holder=null}
  B.leaveLedge();B.pct=Math.min(999,B.pct+b.dmg);B.taken+=b.dmg;if(A)A.dealt+=b.dmg;
  const KB=kbOf(b,B.pct,B.w);
  if(B.armor>0&&KB<130&&!b.grab){B.flash=6;SFX.block();fxSpark(B.x,B.y+B.h*.6,'#ffffff',.6);return}
  let ang=b.ang;if(b.spikeAir&&B.ground)ang=60;if(ang<0&&B.ground)ang=-ang*.7;
  const v=KB*.00375,r=ang*D2R;B.kx=Math.cos(r)*v*dir;B.ky=Math.sin(r)*v;B.vx=0;B.vy=0;if(B.ky>.001)B.ground=null;
  B.hitstun=Math.floor(KB*.4);B.st='hurt';B.t=0;B.tumble=KB>80;B.mv=null;B.inv=0;B.ff=false;B.flip=0;B.lastHit=A;B.upUsed=B.sideUsed=B.adodged=false;
  const hl=Math.min(20,Math.floor(b.dmg*.38+5)*(b.heavy?1.4:1));B.hitlag=hl;if(A&&!ranged)A.hitlag=hl;B.flash=Math.min(12,hl);
  if(A){if(wasHurt&&A.comboT>0)A.combo++;else A.combo=1;A.comboT=60;A.bestCombo=Math.max(A.bestCombo,A.combo);if(A.combo>=2)G.comboShow={f:A,n:A.combo,t:70}}
  const p=KB>110?2:KB>55?1:0,col=A?A.ch.fx:'#ffffff';
  fxHit(B.x-dir*.05,B.y+B.h*.55,col,p,dir);
  if(A&&A.mv&&A.mv.def.weaponFx||b.cut)SFX.cut(p);else SFX.hit(p);
  if(KB>120){G.shake=Math.max(G.shake,Math.min(.6,KB/400));G.slow=Math.max(G.slow,KB>170?16:6);if(KB>170){G.flash=.45;SFX.crowd(.8)}}}
function parry(B,A){SFX.parry();text3d(B,'PARRY!','#9af0ff');B.parries++;G.slow=14;G.flash=.25;B.shieldStun=0;
  if(A){A.mv=null;A.st='parried';A.t=0;A.lag=28;A.vx*=.2;fxSpark(A.x,A.y+A.h*.6,'#9af0ff',.9)}}
function block(B,A,b,dir){B.shieldHP-=b.dmg*1.19+2;B.shieldStun=Math.floor(b.dmg*.65+3);B.kx=dir*Math.min(.12,b.dmg*.008);SFX.block();fxSpark(B.x+dir*.3,B.y+B.h*.6,'#9af0ff',.5);
  if(A&&!b.ranged){A.kx=-dir*Math.min(.1,b.dmg*.006);A.hitlag=Math.floor(b.dmg*.3+3);B.hitlag=A.hitlag}if(B.shieldHP<=0)B.shieldBreak()}
function counterHit(B,A,inc){B.mv.done=1;B.mv.window=false;SFX.parry();text3d(B,'COUNTER!','#ffd84a');G.slow=12;G.flash=.3;
  if(A&&Math.abs(A.x-B.x)<3&&Math.abs(A.y-B.y)<2.5){B.face=sgn(A.x-B.x)||B.face;B.mv.def=B.mv.def;B.st='attack';B.mv={def:COUNTER_STRIKE,f:0,hit:new Map(),connected:false,len:COUNTER_STRIKE.len};
    launch(B,A,{dmg:Math.max(8,Math.round((inc.dmg||6)*1.25)),kb:55,kg:95,ang:38},B.face,false);B.hitlag=A.hitlag=14}}
const COUNTER_STRIKE={id:'cstrike',kind:'normal',nm:'COUNTER',s:1,a:1,r:22,len:24,hb:[],anim:{wind:'counter',hit:'punch'}};
function holdVictim(me,v){v.leaveLedge();v.mv=null;v.st='held';v.t=0;v.holder=me;v.mash=0;v.kx=v.ky=v.vx=v.vy=0;me.holding=v;SFX.grab()}
function resolveHits(){
  for(const A of G.fighters){if(A.dead||!A.mv||A.hitlag>0)continue;const m=A.mv,d=m.def;
    /* a charged smash hits up to 40% harder */
    for(const b of moveBoxes(A)){const bb=m.charge>0&&!b.grab?Object.assign({},b,{dmg:Math.round(b.dmg*(1+m.charge/150))}):b;if(hitWith(A,m,bb,d))break}}
  for(const tb of G.tboxes){for(const b of tb.boxes)hitWith(tb.own,tb,b,null)}
  G.tboxes=G.tboxes.filter(t=>--t.life>0)}
function hitWith(A,m,b,d){const cx=A.x+A.face*b.x,cy=A.y+b.y;
  for(const B of G.fighters){if(B===A||B.dead||B.st==='respawn'||B.st==='held'&&B.holder===A)continue;
    const last=m.hit.get(B);if(last!==undefined&&(!b.rehit||last===m.f))continue;
    if(!circCap(cx,cy,b.r,hurtCap(B)))continue;
    if(b.grab){if(B.inv>0||!B.ground&&B.st!=='shield'||B.st==='ledge'||B.st==='held')continue;m.hit.set(B,m.f);
      if(d&&d.onGrab){d.onGrab(A,m,B)}else{A.mv=null;A.st='grabbing';A.t=0;A.holdT=Math.round(70+B.pct*.6);A.pummelT=0;holdVictim(A,B);B.face=-A.face}return true}
    if(B.inv>0)continue;
    m.hit.set(B,m.f);
    const dir=b.radial?(sgn(B.x-cx)||A.face):b.back?-A.face:A.face;
    if(B.mv&&B.mv.window){counterHit(B,A,b);return true}
    if(B.st==='shield'){if(B.clock-B.shieldAt<=5)parry(B,A);else block(B,A,b,dir);m.connected=true;return true}
    m.connected=true;launch(A,B,b,dir,false);if(d&&d.onHit)d.onHit(A,m,B);return true}
  return false}
function addBoxFx(own,boxes,life){G.tboxes.push({own,boxes,life,hit:new Map(),f:0})}
/* ---------- projectiles ---------- */
function spawnProj(own,o){const p=Object.assign({own,t:0,hit:new Map(),g:0,r:.2},o);G.proj.push(p);fxProj(p);return p}
function explode(p){p.life=0;SFX.boom();G.shake=Math.max(G.shake,.25);fxBoom(p.x,p.y,p.col);
  for(const B of G.fighters){if(B===p.own||B.dead||B.inv>0)continue;const c=hurtCap(B);if(circCap(p.x,p.y,1.1,c)){if(B.st==='shield'){block(B,null,{dmg:p.dmg,ranged:1},sgn(B.x-p.x)||1);continue}launch(p.own,B,{dmg:p.dmg,kb:p.kb,kg:p.kg,ang:p.ang},sgn(B.x-p.x)||1,true)}}}
function updProj(p){p.t++;p.life--;
  if(p.mine){if(!p.landed){p.vy-=p.g;p.y+=p.vy;const pl=platUnder(p.x,p.y-p.vy);if(pl&&p.y<=pl.y+.12){p.y=pl.y+.12;p.landed=1;p.vy=0}}}
  else{p.vy-=p.g;p.x+=p.vx;p.y+=p.vy;
    if(p.hug){const pl=platUnder(p.x,p.y);if(!pl||p.y-pl.y>.8)p.life=0;else p.y=pl.y+.35}}
  const B0=G.stage.blast;if(p.x<B0.l||p.x>B0.r||p.y<B0.b||p.y>B0.t)p.life=0;
  if(p.life<=0){if(p.explode&&!p.boom&&!p.mine){p.boom=1;explode(p)}return}
  for(const B of G.fighters){if(B===p.own||B.dead||B.st==='respawn')continue;
    if(p.mine&&p.t<p.arm)continue;
    const last=p.hit.get(B);if(last!==undefined)continue;
    if(!circCap(p.x,p.y,p.r,hurtCap(B)))continue;
    const m=B.mv;if(m&&!p.mine&&(m.reflect||m.def.reflect&&m.f>2&&m.f<34)){p.own=B;p.vx=-p.vx*1.2;p.vy=-p.vy;p.hit=new Map();p.col=B.ch.fx;SFX.parry();text3d(B,'REFLECT!','#9af0ff');fxSpark(p.x,p.y,B.ch.fx,.5);continue}
    if(m&&m.window){p.life=0;counterHit(B,p.own,p);continue}
    if(B.inv>0)continue;
    p.hit.set(B,p.t);
    if(p.explode){explode(p);return}
    if(B.st==='shield'){if(B.clock-B.shieldAt<=5){parry(B,null)}else block(B,null,{dmg:p.dmg,ranged:1},sgn(p.vx)||1);p.life=0;return}
    launch(p.own,B,p,sgn(p.vx)||p.own.face,true);p.life=0;return}
  for(const q of G.proj)if(q!==p&&q.life>0&&q.own!==p.own&&!q.mine&&!p.mine&&Math.hypot(p.x-q.x,p.y-q.y)<p.r+q.r){p.life=0;q.life=0;fxSpark((p.x+q.x)/2,(p.y+q.y)/2,'#ffffff',.6);SFX.block()}}
/* ---------- knockouts ---------- */
function ko(f){if(f.dead)return;f.leaveLedge();if(f.holding){f.holding.release();f.holding=null}
  f.dead=true;f.deadT=90;f.st='dead';f.mv=null;f.stocks--;f.falls++;if(f.lastHit&&f.lastHit!==f)f.lastHit.kos++;
  SFX.ko();G.shake=.9;G.flash=.35;fxKO(f);
  for(const p of G.proj)if(p.own===f&&!p.mine)p.life=0;
  if(f.stocks<=0&&!G.matchEnd)G.matchEnd={loser:f,t:150}}
function respawn(f){const s=G.stage;f.spawnAt(s.spawn.x,s.spawn.y,f.slot?-1:1);f.halo={l:f.x-.6,r:f.x+.6,y:s.spawn.y,soft:1,halo:1};f.ground=f.halo;f.st='respawn';f.t=0;f.inv=150;f.pct=0;f.dead=false;f.shieldHP=50}
