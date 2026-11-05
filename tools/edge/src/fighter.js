/* ================= a fighter in a match ================= */
const G={state:'boot',frame:0,fighters:[],proj:[],tboxes:[],slow:0,shake:0,stage:null,stocks:3,level:4,mode:'vs',matchEnd:null};
const DEAD=.22,BUF=6;
class Fighter{
  constructor(ch,slot,pad,cpu){this.ch=ch;this.slot=slot;this.pad=pad;this.cpu=cpu;this.b=ch.b;this.w=ch.b.w;this.N=buildNormals(ch);this.SPC=buildSpecials(ch);
    this.h=1.8*(ch.look.h||1);this.stocks=G.stocks;this.pct=0;this.kos=0;this.falls=0;this.dealt=0;this.taken=0;this.bestCombo=0;this.combo=0;this.comboT=0;this.parries=0;
    this.buf={};this.clock=0;this.shieldHP=50;this.callout=null}
  spawnAt(x,y,face){Object.assign(this,{x,y,vx:0,vy:0,kx:0,ky:0,face,ground:null,st:'air',t:0,mv:null,hitlag:0,hitstun:0,inv:0,armor:0,flash:0,jumps:1,upUsed:false,sideUsed:false,
      adodged:false,ff:false,dropT:0,dead:false,deadT:0,halo:null,tumble:false,lastHit:null,ledge:null,regrab:0,shieldStun:0,shieldAt:-99,holder:null,holding:null,chargeF:0,lag:0,runDir:0,walkPh:0,tech:-99,dizzy:0});
    const p=platUnder(x,y+.1);if(p&&Math.abs(p.y-y)<.05)this.land(p,true)}
  /* the buffered press: a button pressed in the last few frames still counts (even during a hit's freeze) */
  pr(a){if(this.clock-(this.buf[a]??-99)<=BUF){this.buf[a]=-99;return true}return false}
  peek(a){return this.clock-(this.buf[a]??-99)<=BUF}
  get sx(){return Math.abs(this.pad.x)>DEAD?this.pad.x:0}
  get sy(){return Math.abs(this.pad.y)>DEAD?this.pad.y:0}
  sideOK(){if(this.ground)return true;if(this.sideUsed)return false;this.sideUsed=true;return true}
  upOK(){if(this.ground)return true;if(this.upUsed)return false;this.upUsed=true;return true}
  projCount(tag){return G.proj.filter(p=>p.own===this&&p.tag===tag&&p.life>0).length}
  startMove(def,o={}){this.mv={def,f:0,hit:new Map(),connected:false,air:!this.ground,charge:0,len:def.len};this.st=def.kind==='special'?'special':'attack';this.t=0;this.runDir=0;
    if(def.kind==='special'){this.callout={s:def.nm,t:70}}else SFX.swing(def.smash?2:def.light?0:1);if(o.face)this.face=o.face}
  special(){const x=this.sx,y=this.sy;let k='n';if(y>.5&&Math.abs(y)>=Math.abs(x)*.8)k='u';else if(y<-.5&&Math.abs(y)>=Math.abs(x)*.8)k='d';else if(Math.abs(x)>.4){k='s';this.face=sgn(x)}
    this.startMove(this.SPC[k])}
  groundAttack(){const x=this.sx,y=this.sy,P=this.pad;
    if(this.st==='run'||this.st==='dash'){this.startMove(this.N.dash);return}
    if(MAPF(this,'smash')&&P.t-P.flickAt<=4){if(P.flickY>0||(y>.6&&Math.abs(y)>Math.abs(x)))return this.startMove(this.N.usmash);if(P.flickY<0||(y<-.6&&Math.abs(y)>Math.abs(x)))return this.startMove(this.N.dsmash);if(P.flickX){this.face=P.flickX;return this.startMove(this.N.fsmash)}}
    if(y>.45&&Math.abs(y)>=Math.abs(x))return this.startMove(this.N.utilt);
    if(y<-.45&&Math.abs(y)>=Math.abs(x))return this.startMove(this.N.dtilt);
    if(Math.abs(x)>.45){this.face=sgn(x);return this.startMove(this.N.ftilt)}
    this.startMove(this.N.jab1)}
  /* a smash attack without flicking: A and B together (or B right after A) */
  smashDir(){const x=this.sx,y=this.sy;if(y>.45&&y>=Math.abs(x))return this.startMove(this.N.usmash);if(y<-.45&&-y>=Math.abs(x))return this.startMove(this.N.dsmash);if(Math.abs(x)>.3)this.face=sgn(x);this.startMove(this.N.fsmash)}
  aerial(){const x=this.sx,y=this.sy;let k='nair';if(y>.45&&Math.abs(y)>=Math.abs(x))k='uair';else if(y<-.45&&Math.abs(y)>=Math.abs(x))k='dair';else if(Math.abs(x)>.4)k=sgn(x)===this.face?'fair':'bair';this.startMove(this.N[k])}
  endMove(){const d=this.mv&&this.mv.def;this.mv=null;this.t=0;this.armor=0;if(this.ground)this.st='stand';else this.st=d&&d.helpless?'helpless':'air'}
  jump(full){this.vy=full?this.b.jump:this.b.short;this.ground=null;this.st='air';this.t=0;this.ff=false;SFX.jump();fxDust(this,3);if(Math.abs(this.sx)>.3)this.vx=this.sx*this.b.air}
  airJump(){this.jumps--;this.vy=this.b.dj;this.ky=Math.max(0,this.ky);this.kx*=.5;this.ff=false;this.st='air';this.t=0;this.flip=24;SFX.djump();fxRing(this);this.vx=this.sx*this.b.air}
  land(p,quiet){const was=this.st,mv=this.mv;this.ground=p;this.y=p.y;this.vy=0;this.jumps=1;this.upUsed=this.sideUsed=this.adodged=false;this.ff=false;this.flip=0;this.regrab=0;
    if(!quiet&&!this.dead){fxDust(this,3);SFX.land()}
    if(was==='attack'&&mv.def.air){this.mv=null;this.st='land';this.t=0;this.lag=mv.def.land;return}
    if(was==='special'){const d=mv.def;if(d.landEnds){if(d.onLand)d.onLand(this,mv);this.mv=null;this.st='land';this.t=0;this.lag=d.land||10;return}return}
    if(was==='helpless'){this.st='land';this.t=0;this.lag=18;return}
    if(was==='adodge'){this.st='land';this.t=0;this.lag=8;return}
    if(was==='hurt'){if(this.tumble){if(this.clock-this.tech<=20){this.st='stand';this.inv=20;this.hitstun=0;this.kx*=.2;text3d(this,'TECH!','#9af0ff');SFX.dodge&&SFX.block();return}
        this.st='lie';this.t=0;this.hitstun=0;this.kx*=.3;this.ky=0;fxDust(this,6);return}this.kx*=.5;this.ky=0;return}
    if(['air','respawn','tumbleFree'].includes(was)){this.st='land';this.t=0;this.lag=2}}
  update(){const P=this.pad;
    if(this.dead){if(--this.deadT<=0&&this.stocks>0)respawn(this);return}
    for(const a of['attack','special','jump','shield','grab'])if(P.pressed[a])this.buf[a]=this.clock;
    if(P.flickY<0)this.downAt=this.clock;
    if(P.pressed.shield){this.shieldAt=this.clock;if(this.st==='hurt')this.tech=this.clock}
    if(this.hitlag>0){this.hitlag--;if(this.st==='hurt'&&this.hitlag===0)this.applyDI();return}
    this.clock++;this.t++;if(this.inv>0)this.inv--;if(this.flash>0)this.flash--;if(this.dropT>0)this.dropT--;if(this.regrab>0)this.regrab--;if(this.armor>0)this.armor--;
    if(this.comboT>0&&--this.comboT===0)this.combo=0;if(this.flip>0)this.flip--;if(this.callout&&--this.callout.t<=0)this.callout=null;
    if(this.st!=='shield'&&this.shieldHP<50)this.shieldHP=Math.min(50,this.shieldHP+.09);
    if(!this.ground&&['stand','dash','run','skid','crouch','jsq','land','shield','roll','spot','lie'].includes(this.st)){this.st='air';this.t=0}
    this[ST[this.st]||'s_none'](P);
    this.physics()}
  s_none(){}
  /* ---------- on the ground ---------- */
  s_stand(P){const x=this.sx;
    if(this.groundActions())return;
    if(this.sy<-.65){this.st='crouch';this.t=0;return}
    if(Math.abs(x)>.85&&(P.t-P.flickAt<=3||Math.abs(this.vx)>this.b.walk*.8||sgn(x)!==this.face)){this.st='dash';this.t=0;this.face=sgn(x);this.vx=this.face*this.b.run*1.1;SFX.dash();fxDust(this,3);return}
    if(Math.abs(x)>DEAD){const sp=this.b.walk*clamp((Math.abs(x)-DEAD)/.55,.25,1);this.face=sgn(x);this.vx=lerp(this.vx,sgn(x)*sp,.25)}else this.vx*=.78}
  s_dash(P){const x=this.sx;if(this.groundActions())return;
    if(this.t<10){this.vx=this.face*this.b.run*1.1;if(sgn(x)===-this.face&&Math.abs(x)>.6){this.face*=-1;this.t=0;this.vx=this.face*this.b.run*1.1;SFX.dash()}return}
    if(Math.abs(x)>.5&&sgn(x)===this.face){this.st='run';this.t=0}else{this.st='stand';this.t=0}}
  s_run(P){const x=this.sx;if(this.groundActions())return;
    if(this.sy<-.65){this.st='crouch';this.t=0;return}
    if(Math.abs(x)<.4){this.st='skid';this.t=0;this.turn=0;return}
    if(sgn(x)!==this.face){this.st='skid';this.t=0;this.turn=1;return}
    this.vx=lerp(this.vx,this.face*this.b.run,.2)}
  s_skid(P){this.vx*=.82;if(this.t>=(this.turn?8:6)){if(this.turn){this.face*=-1;this.st=Math.abs(this.sx)>.6?'run':'stand'}else this.st='stand';this.t=0;return}
    if(this.peek('jump')&&this.pr('jump')){this.st='jsq';this.t=0}}
  s_crouch(P){if(this.groundActions(1))return;this.vx*=.75;
    if(P.flickY<0&&this.ground.soft&&this.t<12){this.drop();return}
    if(this.sy>-.5){this.st='stand';this.t=0}}
  groundActions(crouch){const P=this.pad;
    if(this.pr('grab')||(this.pad.held.shield&&this.pr('attack'))){this.startMove(this.N.grab);return true}
    if(this.peek('attack')&&this.peek('special')&&this.buf.attack===this.buf.special){this.pr('attack');this.pr('special');this.smashDir();return true}
    if(this.pr('attack')){if(crouch&&!P.flickY)this.startMove(this.N.dtilt);else this.groundAttack();return true}
    if(this.pr('special')){this.special();return true}
    if(this.pr('jump')){this.st='jsq';this.t=0;return true}
    if(P.held.shield){this.st='shield';this.t=0;SFX.shield();return true}
    if(P.flickY<0&&this.ground.soft&&this.st!=='crouch'){this.drop();return true}
    return false}
  s_jsq(P){if(this.pr('attack')&&this.sy>.45){this.startMove(this.N.usmash);return}if(this.pr('special')&&this.sy>.45){this.special();return}
    if(this.t>=3)this.jump(P.held.jump||MAP.tapJump&&this.sy>.5&&P===HUMAN)}
  s_land(P){this.vx*=.8;if(this.t>=this.lag){this.st='stand';this.t=0;this.s_stand(P)}}
  s_lie(P){this.vx*=.85;if(this.t>=30||this.t>8&&(this.pr('jump')||this.pr('attack')||Math.abs(this.sx)>.6||this.pr('shield'))){this.st='getup';this.t=0;this.inv=14}}
  s_getup(P){this.vx=0;if(this.t>=16){this.st='stand';this.t=0}}
  drop(){this.ground=null;this.dropT=14;this.st='air';this.t=0;this.y-=.02;this.vy=-.04}
  /* ---------- shield, dodges ---------- */
  s_shield(P){this.vx*=.7;this.shieldHP-=.13;if(this.shieldHP<=0){this.shieldBreak();return}
    if(this.shieldStun>0){this.shieldStun--;return}
    if(this.pr('jump')){this.st='jsq';this.t=0;return}
    if(this.pr('attack')||this.pr('grab')){this.startMove(this.N.grab);return}
    if(P.flickX){this.dodge(P.flickX);return}
    if(P.flickY<0){if(this.ground.soft){this.drop();return}this.st='spot';this.t=0;SFX.swing(0);return}
    if(!P.held.shield){this.st='land';this.t=0;this.lag=6}}
  dodge(dir){this.st='roll';this.t=0;this.rollDir=dir;this.face=-dir;SFX.swing(0)}
  s_roll(P){const t=this.t;if(t>=4&&t<=16)this.inv=Math.max(this.inv,1);this.vx=t<18?this.rollDir*.15*(1-t/22):this.vx*.7;if(t>=28){this.st='stand';this.t=0}}
  s_spot(P){if(this.t>=2&&this.t<=16)this.inv=Math.max(this.inv,1);this.vx*=.6;if(this.t>=24){this.st='stand';this.t=0}}
  s_adodge(P){const t=this.t;if(t>=3&&t<=28)this.inv=Math.max(this.inv,1);if(t===3&&this.adir!=null){this.vx=Math.cos(this.adir)*.2;this.vy=Math.sin(this.adir)*.2}
    if(this.adir!=null){this.vx*=.9;this.vy*=.9}if(t>=40){this.st='air';this.t=0}}
  shieldBreak(){this.st='dizzy';this.t=0;this.dizzy=200;this.shieldHP=26;this.vy=.24;this.ground=null;SFX.shatter();text3d(this,'SHIELD BREAK!','#ff8a8a');G.slow=20}
  s_dizzy(P){this.vx*=.85;if(P.pressed.attack||P.pressed.special||P.pressed.jump||P.pressed.shield||P.flickX)this.dizzy-=8;if(--this.dizzy<=0){this.st=this.ground?'stand':'air';this.t=0}}
  /* ---------- in the air ---------- */
  s_air(P){const x=this.sx;
    if(Math.abs(x)>DEAD)this.vx=lerp(this.vx,x*this.b.air,.075);else this.vx*=.985;
    if(this.wantFF()){this.ff=true;this.vy=-this.b.ffall;fxSpark(this.x,this.y+this.h*.5,'#ffffff',.3)}
    if(this.pr('attack')){this.aerial();return}
    if(this.pr('special')){this.special();return}
    if(this.jumps>0&&this.pr('jump')){this.airJump();return}
    if(this.pr('shield')&&!this.adodged){this.adodged=true;this.st='adodge';this.t=0;const a=dir8(this);this.adir=a;if(a!=null){this.vx=0;this.vy=0}SFX.swing(0)}
    this.tryLedge()}
  /* fast fall: flick down at or after the top of a jump; a flick a little before the top still counts while you hold down */
  wantFF(){return!this.ff&&this.vy<=.02&&this.sy<-.6&&this.clock-(this.downAt??-99)<=16}
  s_helpless(P){const x=this.sx;if(Math.abs(x)>DEAD)this.vx=lerp(this.vx,x*this.b.air*.7,.06);this.tryLedge()}
  /* ---------- attacks ---------- */
  s_attack(P){const m=this.mv,d=m.def;
    if(d.smash&&m.f===d.chargeAt&&P.held.attack&&m.charge<60){m.charge++;if(m.charge===1)SFX.charge();this.chargeF=m.charge;if(this.ground)this.vx*=.8;return}
    m.f++;
    if(this.ground){if(d.dashy&&m.f<d.s+d.a)this.vx*=.94;else this.vx*=.8}else{this.vx=lerp(this.vx,this.sx*this.b.air,.04);if(this.wantFF()){this.ff=true;this.vy=-this.b.ffall}}
    if(d.light&&!d.air&&this.ground&&m.f<=3&&!m.connected&&this.pr('special')){this.smashDir();return}
    if(d.next&&m.f>=d.s+d.a&&this.pr('attack')){this.startMove(this.N[d.next]);return}
    if(m.connected&&m.f>=d.s){/* a landed A attack can be extended: B into any special, A into another attack, jump out of up attacks and aerials */
      if(this.pr('special')){this.special();return}
      if(!d.next&&!d.smash&&m.f>=d.s+d.a&&this.peek('attack')){this.pr('attack');if(this.ground)this.groundAttack();else this.aerial();return}
      if((d.air||d.id==='utilt')&&this.peek('jump')&&(this.ground||this.jumps>0)){this.pr('jump');this.mv=null;if(this.ground)this.jump(true);else this.airJump();return}}
    if(!d.air)this.tryLedge(1);
    if(m.f>=d.len)this.endMove()}
  s_special(P){const m=this.mv,d=m.def;m.f++;
    if(d.tick&&d.tick(this,m)===false){this.endMove();return}
    if(this.mv===m){if(d.helpless||d.id==='sp_u')this.tryLedge(1);if(m.f>=(m.len||d.len))this.endMove()}}
  /* ---------- hit ---------- */
  s_hurt(P){if(--this.hitstun<=0){this.st=this.ground?'stand':'air';this.t=0}}
  s_parried(P){this.vx*=.8;if(this.t>=this.lag){this.st=this.ground?'stand':'air';this.t=0}}
  s_held(P){const h=this.holder;if(!h||h.dead||h.holding!==this||h.st!=='grabbing'&&!(h.mv&&h.mv.victim===this)){this.release();return}
    if(P.pressed.attack||P.pressed.special||P.pressed.jump||P.flickX||P.flickY)this.mash=(this.mash||0)+3}
  release(){this.holder=null;this.st=this.ground?'stand':'air';this.t=0;this.inv=Math.max(this.inv,6)}
  s_grabbing(P){const v=this.holding;if(!v||v.st!=='held'){this.holding=null;this.st='stand';this.t=0;return}
    v.x=this.x+this.face*.62;v.y=this.y;v.face=-this.face;
    if(this.t>=this.holdT-(v.mash||0)){/* they break free */this.holding=null;this.st='stand';this.t=0;v.release();this.vx=-this.face*.12;v.vx=this.face*.12;return}
    if(this.pummelT>0)this.pummelT--;
    if(this.pummelT<=0&&this.pr('attack')){this.pummelT=12;v.pct+=1.3;v.flash=5;this.dealt+=1.3;SFX.hit(0);fxSpark(v.x,v.y+1.1,this.ch.fx,.4);return}
    const x=this.sx,y=this.sy;let k=null;if(this.t>4){if(y>.6&&Math.abs(y)>Math.abs(x))k='u';else if(y<-.6&&Math.abs(y)>Math.abs(x))k='d';else if(Math.abs(x)>.6)k=sgn(x)===this.face?'f':'b'}
    if(k)this.throw(k)}
  throw(k){const v=this.holding,T=THROWS[k];this.holding=null;v.holder=null;this.st='throwing';this.t=0;this.throwPose=T.anim;
    const dir=T.back?-this.face:this.face;if(T.back)this.face*=-1;v.x=this.x+this.face*.5;launch(this,v,{dmg:T.dmg,kb:T.kb,kg:T.kg,ang:T.ang},dir,true);this.hitlag=0;SFX.swing(2);this.callout={s:T.nm,t:50}}
  s_throwing(P){this.vx*=.8;if(this.t>=20){this.st='stand';this.t=0}}
  /* ---------- ledges ---------- */
  tryLedge(any){if(this.regrab>0||this.ground||this.vy>.06&&!any)return;if(this.st==='hurt')return;
    for(const L of G.stage.ledges){if(L.who&&L.who!==this&&!L.who.dead&&L.who.ledge===L)continue;
      const dx=(this.x-L.x)*L.side,top=this.y+this.h;
      if(dx>-.25&&dx<.95&&top>L.y-.2&&top<L.y+1.1&&this.y<L.y-.2){this.grabLedge(L);return}}}
  grabLedge(L){this.mv=null;this.st='ledge';this.t=0;this.ledge=L;L.who=this;this.x=L.x+L.side*.32;this.y=L.y-this.h*.86;this.vx=this.vy=this.kx=this.ky=0;this.face=-L.side;
    this.inv=Math.max(this.inv,40);this.jumps=1;this.upUsed=this.sideUsed=this.adodged=false;this.ff=false;SFX.grab()}
  s_ledge(P){const L=this.ledge;this.x=L.x+L.side*.32;this.y=L.y-this.h*.86;this.vx=this.vy=0;if(this.t<8)return;
    const toward=-L.side,x=this.sx,y=this.sy;
    if(this.pr('jump')||y>.6){this.leaveLedge();this.y=L.y-this.h*.3;this.vy=this.b.jump*1.05;this.vx=toward*.04;this.st='air';SFX.jump();return}
    if(sgn(x)===toward&&Math.abs(x)>.6||this.pr('special')){this.leaveLedge();this.st='ledgeup';this.t=0;this.inv=24;return}
    if(this.pr('attack')){this.leaveLedge();this.x=L.x+toward*.45;this.y=L.y;this.ground=G.stage.main;this.startMove(this.N.ledge);this.inv=16;return}
    if(this.pr('shield')){this.leaveLedge();this.x=L.x+toward*.45;this.y=L.y;this.ground=G.stage.main;this.dodge(toward);return}
    if(sgn(x)===L.side&&Math.abs(x)>.6||y<-.6||this.t>300){this.leaveLedge();this.st='air';this.t=0;this.regrab=30;return}}
  leaveLedge(){if(this.ledge){this.ledge.who=null;this.ledge=null}}
  s_ledgeup(P){if(this.t>=22){const L=G.stage.main;this.y=L.y;this.x=this.x+this.face*.5;this.land(L,true);this.st='stand';this.t=0}}
  s_respawn(P){if(this.t>180||Math.abs(P.x)>.5||Math.abs(P.y)>.5||P.pressed.attack||P.pressed.special||P.pressed.jump||P.pressed.shield){this.halo=null;this.ground=null;this.st='air';this.t=0;this.inv=Math.max(this.inv,90)}else{this.vx=this.vy=0}}
  applyDI(){/* holding the stick when hit bends the launch a little */const x=this.sx,y=this.sy;if(!x&&!y)return;const m=Math.hypot(this.kx,this.ky);if(m<.01)return;
    const a=Math.atan2(this.ky,this.kx),d=Math.atan2(y,x);let diff=Math.sin(d-a);const na=a+diff*.2;this.kx=Math.cos(na)*m;this.ky=Math.sin(na)*m}
  /* ---------- moving ---------- */
  physics(){if(this.st==='held'||this.st==='ledge'||this.dead)return;
    let g=this.b.g;const m=this.mv;if(m)g*=(m.grav??m.def.grav??1);if(this.st==='adodge'&&this.adir!=null&&this.t<30)g=0;if(this.st==='respawn')g=0;
    if(this.st==='attack'&&m&&m.def.smash&&m.f===m.def.chargeAt&&m.charge>0&&!this.ground)g*=.3;
    if(!this.ground){const cap=this.ff?this.b.ffall:this.b.fall;if(this.vy>-cap)this.vy=Math.max(this.vy-g,-cap);else if(this.st!=='special')this.vy=Math.max(this.vy,-cap-.2)}
    if(this.kx||this.ky){const l=Math.hypot(this.kx,this.ky),l2=l-.0064;if(l2<=0){this.kx=this.ky=0}else{this.kx*=l2/l;this.ky*=l2/l}}
    const ox=this.x,oy=this.y;this.x+=this.vx+this.kx;this.y+=this.vy+this.ky;
    if(this.ground){const p=this.ground;
      if(this.vy+this.ky>.001&&this.y>p.y+.001){this.ground=null}
      else if(this.x<p.l||this.x>p.r){if(p.halo){this.x=clamp(this.x,p.l,p.r)}else if(['stand','crouch','shield','land','skid'].includes(this.st)&&!p.soft&&Math.abs(this.vx)<this.b.walk*1.2&&this.st!=='hurt'){/* teeter: don't walk off by accident */this.x=clamp(this.x,p.l,p.r);this.vx=0}
        else{this.ground=null;if(['stand','dash','run','skid','crouch','land'].includes(this.st)){this.st='air';this.t=0}}}
      else{this.y=p.y;this.vy=0;if(this.ky<0)this.ky=0}}
    if(!this.ground){
      if(this.vy+this.ky<=0){let best=null;for(const p of G.stage.plats){if(p.soft&&(this.dropT>0||this.st==='hurt'&&this.ky<-.15))continue;if(oy>=p.y-.001&&this.y<=p.y&&this.x>=p.l&&this.x<=p.r&&(!best||p.y>best.y))best=p}
        if(best){if(this.st==='hurt'&&this.ky<-.28&&!this.tumbleLanded){this.y=best.y+.01;this.ky=-this.ky*.4;this.kx*=.7;fxDust(this,8);SFX.land();G.shake=Math.max(G.shake,.15)}else this.land(best)}}
      if(!this.ground)this.solid(ox,oy)}
    const B=G.stage.blast;if(this.x<B.l||this.x>B.r||this.y<B.b||this.y>B.t)ko(this)}
  solid(ox,oy){const S=G.stage.main;if(!S.solid)return;const top=S.y,bot=S.y-S.th,hw=.3;
    if(this.x>S.l-hw&&this.x<S.r+hw&&this.y<top&&this.y+this.h>bot){
      if(oy+this.h<=bot+.01){this.y=bot-this.h;if(this.vy>0)this.vy=0;if(this.ky>0)this.ky=-this.ky*.3;return}
      const left=this.x<(S.l+S.r)/2;this.x=left?S.l-hw:S.r+hw;if(Math.abs(this.kx)>.15)this.kx=-this.kx*.4;else this.kx=0;this.vx=0}}
}
const ST={stand:'s_stand',dash:'s_dash',run:'s_run',skid:'s_skid',crouch:'s_crouch',jsq:'s_jsq',land:'s_land',lie:'s_lie',getup:'s_getup',shield:'s_shield',roll:'s_roll',spot:'s_spot',adodge:'s_adodge',
  dizzy:'s_dizzy',air:'s_air',helpless:'s_helpless',attack:'s_attack',special:'s_special',hurt:'s_hurt',parried:'s_parried',held:'s_held',grabbing:'s_grabbing',throwing:'s_throwing',ledge:'s_ledge',ledgeup:'s_ledgeup',respawn:'s_respawn'};
function MAPF(f,k){return f.cpu?true:!!MAP[k]}
function platUnder(x,y){let best=null;for(const p of G.stage.plats)if(x>=p.l&&x<=p.r&&p.y<=y+.01&&(!best||p.y>best.y))best=p;return best}
