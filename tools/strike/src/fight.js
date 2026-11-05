/* ================= stages, fighters and their state machine ================= */
const STAGES=[
  {id:'roof',name:'ROOFTOP',main:{x1:-150,x2:150,y:0},plats:[{x1:-112,x2:-42,y:-62},{x1:42,x2:112,y:-62},{x1:-35,x2:35,y:-120}]},
  {id:'bridge',name:'MOON BRIDGE',main:{x1:-185,x2:185,y:0},plats:[]},
  {id:'clock',name:'CLOCK TOWER',main:{x1:-132,x2:132,y:0},plats:[{x1:-104,x2:-34,y:-56},{x1:34,x2:104,y:-56},{x1:-30,x2:30,y:-112}]},
  {id:'docks',name:'NEON DOCKS',main:{x1:-148,x2:148,y:0},plats:[{x1:-122,x2:-52,y:-52},{x1:12,x2:92,y:-92}]}];
const BLAST={l:-345,r:345,t:-265,b:195};
let STAGE=STAGES[0],PLATS=[],FT=[],PROJ=[],FX=[],SHAKE=0,UID=0,FRAME=0;
function setStage(i){STAGE=STAGES[i];const M=STAGE.main;PLATS=[{x1:M.x1,x2:M.x2,y:M.y,solid:1},...STAGE.plats.map(p=>Object.assign({soft:1},p))]}
function newFighter(ci,id,cpu,lvl){const c=ROSTER[ci];return{c,id,cpu,lvl,x:0,y:0,vx:0,vy:0,lvx:0,lvy:0,face:1,gr:null,jumps:1,st:'air',t:0,mv:null,pct:0,stocks:3,
  hs:0,hl:0,inv:0,sh:50,shT:0,pad:cpu?makePad():HUMAN,buf:{},boxes:[],ai:{t:0},combo:0,comboD:0,dmg:0,kos:0,falls:0,ledgeCD:0,upUsed:0,sideUsed:0,dodged:0,airT:0,
  anim:0,trail:[],prevX:0,prevDown:0,downT:-99,drop:0,landN:0,stunN:0,armor:0,counter:false,reflect:false,hide:0,ff:0,holder:null,held:null,lastHit:null,flash:0}}
function placeFighter(f,x){f.x=x;f.y=0;f.vx=f.vy=f.lvx=f.lvy=0;f.gr=PLATS[0];f.st='stand';f.t=0;f.mv=null;f.face=x<0?1:-1;f.jumps=1;f.hs=f.hl=0}
const pwr=f=>.85+f.c.pow*.06;
const H=f=>32*f.c.sz;
function setSt(f,s){f.st=s;f.t=0}
/* ---------- starting things ---------- */
function startAtk(f){const P=f.pad;let k;
  if(f.gr){if(f.st==='shield')k='grab';else if(P.down)k='down';else if(P.up||f.st==='squat')k='up';
    else if(P.x){f.face=P.x;k=Math.abs(f.vx)>f.c.run*.72&&f.st==='stand'?'dash':'side'}else k='jab1'}
  else k=P.up?'uair':P.down?'dair':P.x===f.face?'fair':P.x===-f.face?'bair':'nair';
  doMove(f,k);return true}
function doMove(f,k){f.st='atk';f.t=0;f.mv={k,d:NM[k],t:0,uid:++UID,hits:new Set(),hitAny:false};if(f.gr&&!NM[k].slide)f.vx*=.35}
const SIDE_ONCE={dash:1,charge:1,drill:1,roll:1,grab:1};
function startSp(f,dir){const s=f.c[dir];if(!f.gr&&dir==='up'&&f.upUsed)return false;if(!f.gr&&dir==='side'&&f.sideUsed&&SIDE_ONCE[s.kind])return false;
  f.st='sp';f.t=0;f.mv={sp:s.kind,dir,t:0,uid:++UID,hits:new Set(),hitAny:false};f.ff=0;if(dir==='up')f.upUsed=1;SFX.special();return true}
function toShield(f){if(f.st!=='shield'){f.st='shield';f.t=0;f.shT=0}f.vx*=.3}
function airDodge(f){if(f.dodged)return false;f.dodged=1;setSt(f,'dodge');const P=f.pad,x=P.x,y=P.up?-1:P.down?1:0;
  if(x||y){const l=Math.hypot(x,y);f.vx=x/l*6;f.vy=y/l*6;f.dd=1}else{f.vy*=.3;f.dd=0}f.ff=0;return true}
function doubleJump(f){f.jumps--;f.vy=-f.c.jump*.95;f.vx=f.pad.x*f.c.air;f.ff=0;setSt(f,'air');SFX.djump();ringFx(f.x,f.y,'#ffffff',10,.5);return true}
/* try what the buttons ask for; true when something started */
function act(f,ground){const P=f.pad;
  if(f.buf.special){f.buf.special=0;if(P.up)return startSp(f,'up');if(P.down)return startSp(f,'down');if(P.x){f.face=P.x;return startSp(f,'side')}
    if(f.gr){toShield(f);return true}return airDodge(f)}
  if(f.buf.attack){f.buf.attack=0;return startAtk(f)}
  if(f.buf.jump){if(f.gr){f.buf.jump=0;setSt(f,'squat');return true}if(f.jumps>0){f.buf.jump=0;return doubleJump(f)}}
  return false}
/* ---------- one frame of one fighter ---------- */
function tick(f){f.boxes.length=0;const P=f.pad,c=f.c;
  for(const a of['attack','special','jump']){if(P.pressed[a])f.buf[a]=7;else if(f.buf[a])f.buf[a]--}
  const dTap=P.down&&!f.prevDown,xTap=P.x&&P.x!==f.prevX;f.prevDown=P.down;f.prevX=P.x;
  if(dTap){if(FRAME-f.downT<16&&f.gr&&f.gr.soft&&['stand','shield'].includes(f.st)){f.gr=null;f.y+=3;f.drop=12;setSt(f,'air');f.buf.special=0}f.downT=FRAME}
  if(f.flash>0)f.flash--;
  if(f.hl>0){f.hl--;return}
  if(f.inv>0)f.inv--;if(f.ledgeCD>0)f.ledgeCD--;if(f.drop>0)f.drop--;f.t++;f.anim+=.25;
  if(!f.gr)f.airT++;if(f.st!=='shield')f.sh=Math.min(50,f.sh+.12);
  f.counter=false;f.reflect=false;f.armor=0;
  switch(f.st){
  case'stand':{if(act(f))break;if(P.held.block){toShield(f);break}
    const tx=P.x*c.run;f.vx+=clamp(tx-f.vx,-(P.x?1:.7),P.x?1:.7);if(P.x)f.face=P.x;break}
  case'squat':{f.vx*=.9;if(P.up&&f.buf.special){f.buf.special=0;startSp(f,'up');break}if(P.up&&f.buf.attack){f.buf.attack=0;doMove(f,'up');break}
    if(f.t>=3){const full=P.held.jump;f.vy=-c.jump*(full?1:.66);f.vx=clamp(f.vx+P.x*.6,-c.air*1.15,c.air*1.15);f.gr=null;f.y-=1;setSt(f,'air');f.buf.jump=0;SFX.jump();dust(f.x,f.y)}break}
  case'air':{if(act(f))break;const tx=P.x*c.air;if(P.x)f.vx+=clamp(tx-f.vx,-.38,.38);else f.vx*=.97;if(dTap&&f.vy>-2.5&&!f.ff){f.ff=1;f.vy=Math.max(f.vy,4)}break}
  case'land':{f.vx*=.8;if(f.t>=f.landN){setSt(f,f.gr?'stand':'air');act(f)}break}
  case'shield':{f.shT++;f.sh-=.16;f.vx*=.8;if(f.sh<=0){breakShield(f);break}
    if(!(P.held.block||P.held.special)){setSt(f,'land');f.landN=4;break}
    if(f.buf.attack){f.buf.attack=0;doMove(f,'grab');break}
    if(f.buf.special&&(P.up||P.down||P.x)){act(f);break}f.buf.special=0;
    if(f.buf.jump){f.buf.jump=0;setSt(f,'squat');break}
    if(xTap){setSt(f,'roll');f.rd=P.x;break}break}
  case'roll':{f.inv=f.t>=3&&f.t<15?2:f.inv;f.vx=f.t<16?f.rd*4.4:f.vx*.6;if(f.t>=22){f.face=-f.rd;setSt(f,'stand')}break}
  case'dodge':{f.inv=f.t>=3&&f.t<19?2:f.inv;if(f.dd){f.vx*=.9;f.vy*=.9}if(f.t>=26)setSt(f,'air');break}
  case'atk':{const m=f.mv,d=m.d;m.t++;const T=m.t;
    if(T>d.s&&T<=d.s+d.a){if(T===d.s+1){SFX.swing();if(d.slide)f.vx=f.face*Math.max(Math.abs(f.vx),c.run*1.1)}
      const W=WEAP[c.weapon]||WEAP.none,ext=d.wpn?W.reach:0,big=d.wpn?W.big:1;
      d.b.forEach((b,i)=>hit(f,m,'n'+i,b[0]+sgn(b[0])*ext,b[1],b[2]*big,b[3],b[4],b[5]*(d.wpn&&W.kg||1),b[6],d.radial?{radial:1}:d.grab?{grab:1}:null))}
    if(f.gr){f.vx*=d.slide?.94:.82}else{const tx=P.x*c.air;if(P.x)f.vx+=clamp(tx-f.vx,-.2,.2);if(dTap&&f.vy>-2.5)f.ff=1}
    if(d.chain&&T>=d.s+d.a&&f.buf.attack&&!P.x&&!P.down&&!P.up){f.buf.attack=0;doMove(f,d.chain);break}
    if(m.hitAny&&T>d.s+d.a&&act(f))break;
    if(T>=d.s+d.a+d.r){setSt(f,f.gr?'stand':'air')}break}
  case'sp':{const m=f.mv;const done=SP[m.sp](f,m);m.t++;if(f.gr&&!m.keep)f.vx*=.86;
    if(done){f.hide=0;if(m.help&&!f.gr){setSt(f,'help')}else setSt(f,f.gr?'stand':'air')}break}
  case'help':{const tx=P.x*c.air*.65;if(P.x)f.vx+=clamp(tx-f.vx,-.2,.2);break}
  case'hit':{if(--f.hs<=0){setSt(f,f.gr?'stand':'air');f.tumble=0}break}
  case'down':{f.vx*=.8;f.inv=2;if(f.t>=22){setSt(f,'stand');f.inv=8}break}
  case'stun':{f.vx*=.8;if(f.t>=f.stunN)setSt(f,f.gr?'stand':'air');break}
  case'dizzy':{f.vx*=.85;if(f.t>=140){setSt(f,'stand');f.sh=30}break}
  case'holding':{const v=f.held;if(!v||v.st!=='held'){f.held=null;setSt(f,'stand');break}v.x=f.x+f.face*15;v.y=f.y;
    if(f.t>=10){const k=P.x===-f.face?'b':P.up?'u':'f',T=THROW[k];v.st='hit';v.holder=null;f.held=null;hitNow(f,v,{d:T[0],kb:T[1],kg:T[2],ang:T[3]},f.face);setSt(f,'land');f.landN=14}break}
  case'held':{if(!f.holder||!['holding','sp'].includes(f.holder.st)){f.holder=null;setSt(f,'air')}break}
  case'ledge':{const L=f.lx;f.vx=f.vy=0;f.x=L.x+L.side*7;f.y=L.y+24;
    const toward=P.x===-L.side;
    if(f.buf.jump||(P.up&&f.t>6)){f.buf.jump=0;climb(f,L);f.gr=null;f.y=L.y-2;f.vy=-c.jump;setSt(f,'air');SFX.jump()}
    else if(f.buf.attack){f.buf.attack=0;climb(f,L);doMove(f,'jab3');f.inv=8}
    else if(toward&&f.t>6){climb(f,L);setSt(f,'land');f.landN=6;f.inv=10}
    else if(P.x===L.side||P.down||f.t>150){f.st='air';f.t=0;f.vy=1;f.ledgeCD=30}
    else if(f.buf.special){f.st='air';f.ledgeCD=20;act(f)}break}
  case'spawn':{f.vx=f.vy=0;f.inv=Math.max(f.inv,2);if(f.t>150||P.x||P.down||f.buf.jump||f.buf.attack||f.buf.special){setSt(f,'air');f.inv=90}break}
  case'ko':{if(f.t>=70&&(f.stocks>0||MATCH.train))respawn(f);break}}
  physics(f)}
function climb(f,L){f.x=L.x-L.side*10;f.y=L.y;f.gr=PLATS[0];f.vx=0;f.vy=0}
function grabLedge(f,L){f.st='ledge';f.t=0;f.lx=L;f.mv=null;f.hide=0;f.x=L.x+L.side*7;f.y=L.y+24;f.vx=f.vy=f.lvx=f.lvy=0;f.face=-L.side;f.jumps=1;f.upUsed=f.sideUsed=f.dodged=0;f.ff=0;f.inv=Math.max(f.inv,30);f.airT=0}
function ledgeNear(x,y,r){const M=STAGE.main;for(const s of[-1,1]){const ex=s<0?M.x1:M.x2;if(Math.hypot(x-ex,y-M.y)<r)return{x:ex,y:M.y,side:s}}return null}
function breakShield(f){setSt(f,'dizzy');f.sh=0;f.vy=-7;f.gr=null;f.mv=null;SFX.brk();shake(6);burst(f.x,f.y-16,'#9ad8ff',14,4)}
function respawn(f){f.x=0;f.y=-150;f.vx=f.vy=f.lvx=f.lvy=0;f.pct=0;f.gr=null;f.st='spawn';f.t=0;f.inv=150;f.jumps=1;f.upUsed=f.sideUsed=f.dodged=0;f.mv=null;f.sh=50;f.hide=0;f.face=1}
function land(f,p){f.gr=p;f.y=p.y;f.vy=0;f.lvy=0;f.jumps=1;f.ff=0;f.upUsed=f.sideUsed=f.dodged=0;const air=f.airT;f.airT=0;
  switch(f.st){case'air':setSt(f,'land');f.landN=2;if(air>8){SFX.land();dust(f.x,f.y)}break;
    case'atk':if(f.mv.d.air){const n=f.mv.d.land;setSt(f,'land');f.landN=f.mv.hitAny?Math.ceil(n/2):n;SFX.land()}break;
    case'help':setSt(f,'land');f.landN=12;SFX.land();dust(f.x,f.y);break;
    case'dodge':setSt(f,'land');f.landN=6;break;
    case'hit':if(f.lvy>4.5){f.gr=null;f.y=p.y-1;f.lvy=-f.lvy*.5;f.vy=0;dust(f.x,f.y);SFX.land()}else if(f.hs>6){setSt(f,'down');f.lvx*=.4;f.lvy=0;dust(f.x,f.y)}else{setSt(f,'stand')}break;
    case'dizzy':break;case'spawn':break}}
const GROUND_HOLD={atk:1,shield:1,land:1,roll:1,squat:1,stun:1,dizzy:1,down:1,holding:1};
function physics(f){if(f.st==='held'||f.st==='ko'||f.st==='ledge'||f.st==='spawn')return;const c=f.c;
  if(!f.gr&&!(f.st==='hit'&&f.hs>0&&(f.lvx||f.lvy))){const g=f.st==='sp'&&f.mv&&f.mv.nograv?0:c.grav;f.vy+=g;const mf=f.ff&&f.st!=='hit'?11:7.6;if(f.vy>mf)f.vy=Math.max(mf,f.vy-1)}
  if(f.lvx||f.lvy){const L=Math.hypot(f.lvx,f.lvy),n=Math.max(0,L-.12)/L;f.lvx*=n;f.lvy*=n;if(Math.abs(f.lvx)<.01&&Math.abs(f.lvy)<.01)f.lvx=f.lvy=0}
  const px=f.x,py=f.y;f.x+=f.vx+f.lvx;f.y+=f.vy+f.lvy;
  if(f.gr){const p=f.gr;if(f.x<p.x1||f.x>p.x2){if(GROUND_HOLD[f.st]){f.x=clamp(f.x,p.x1,p.x2);f.vx=0;f.lvx=0}else{f.gr=null;if(f.st==='stand')setSt(f,'air');f.airT=0}}
    if(f.gr){f.y=p.y;if(f.st==='hit'&&f.lvy<-.5){f.gr=null}}}
  if(!f.gr&&f.vy+f.lvy>=0){for(const p of PLATS){if(p.soft&&(f.drop>0||(f.pad.down&&f.st!=='hit'&&f.st!=='help'&&f.ff)))continue;
      if(py<=p.y+.5&&f.y>=p.y&&f.x>=p.x1-1&&f.x<=p.x2+1){land(f,p);break}}}
  /* the main stage is solid at its sides and bottom */
  const M=STAGE.main,top=M.y,bot=M.y+64;
  if(!f.gr&&f.y>top+1&&f.y-H(f)<bot&&f.x>M.x1-8&&f.x<M.x2+8){
    if(px<=M.x1-8){f.x=M.x1-8;if(f.st==='hit'&&Math.abs(f.lvx)>3){f.lvx*=-.5;dust(f.x,f.y-10)}else{f.vx=Math.min(0,f.vx);f.lvx=Math.min(0,f.lvx)}}
    else if(px>=M.x2+8){f.x=M.x2+8;if(f.st==='hit'&&Math.abs(f.lvx)>3){f.lvx*=-.5;dust(f.x,f.y-10)}else{f.vx=Math.max(0,f.vx);f.lvx=Math.max(0,f.lvx)}}
    else if(py-H(f)>=bot-2){f.y=bot+H(f);f.vy=Math.max(0,f.vy);f.lvy=Math.max(0,f.lvy)}
    else{f.y=top;land(f,PLATS[0])}}
  /* catching the ledge on the way back */
  if(!f.gr&&f.ledgeCD===0&&(f.st==='air'||f.st==='help'||(f.st==='sp'&&f.mv&&f.mv.dir==='up'&&f.mv.t>6))&&f.vy>-4&&f.y>top+4&&f.y<top+42){
    for(const s of[-1,1]){const ex=s<0?M.x1:M.x2,d=(f.x-ex)*s;if(d>=-3&&d<=22&&(f.airT>18||f.face===-s)&&!FT.some(o=>o!==f&&o.st==='ledge'&&o.lx&&o.lx.side===s)){grabLedge(f,{x:ex,y:top,side:s});break}}}
  /* off the screen */
  if(f.x<BLAST.l||f.x>BLAST.r||f.y>BLAST.b||f.y<BLAST.t)koFighter(f)}
