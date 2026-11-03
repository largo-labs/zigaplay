/* ================= the fighters in a match ================= */
const G={state:'title',frame:0,fighters:[],proj:[],blasts:[],tboxes:[],parts:[],texts:[],shake:0,slow:0,stage:null,stocks:3,level:3,menu:{},result:null,banner:null,bannerT:0};
const HURT={S:{hw:5,h:18},M:{hw:6,h:21},L:{hw:7,h:24}};
const TAP=14;          /* two taps of left/right this many frames apart start a run */
class Fighter{
  constructor(ch,slot,ctrl,cpu){this.ch=ch;this.slot=slot;this.ctrl=ctrl;this.cpu=cpu;this.N=buildNormals(ch);this.SPC=buildSpecials(ch);
    this.b=ch.b;this.w=ch.b.w;this.hw=HURT[ch.size].hw;this.h=HURT[ch.size].h;
    this.stocks=G.stocks;this.pct=0;this.kos=0;this.falls=0;this.dealt=0;this.combo=0;this.bestCombo=0;this.comboT=0;this.perfects=0;
    this.tap={left:-99,right:-99,down:-99};this.anim=rnd()*60;this.buf={};for(const k of BTN)this.buf[k]=-99;this.clock=0}
  /* a press is kept for a few frames, so one made during the freeze of a hit still counts */
  pr(k){if(this.clock-this.buf[k]<=6){this.buf[k]=-99;return true}return false}
  spawnAt(x,y,face){Object.assign(this,{x,y,vx:0,vy:0,kx:0,ky:0,face,ground:null,st:'air',t:0,mv:null,hitlag:0,hitstun:0,inv:0,flash:0,stag:0,run:0,dashReq:0,
      jumps:this.b.jumps-1,upUsed:false,sideUsed:false,adodged:false,dropT:0,dead:false,deadT:0,halo:null,tumble:false,lastHit:null});const p=platUnder(x,y);if(p&&Math.abs(p.y-y)<2)this.land(p,true)}
  sideOK(){if(this.ground)return true;if(this.sideUsed)return false;this.sideUsed=true;return true}
  upOK(){if(this.ground)return true;if(this.upUsed)return false;this.upUsed=true;return true}
  get hH(){return(this.ctrl.held.right?1:0)-(this.ctrl.held.left?1:0)}
  startMove(def){this.mv={def,f:0,hit:new Map(),connected:false};this.st=def.kind==='special'?'special':'attack';this.t=0;this.run=0;if(def.kind==='normal')SFX.swing()}
  special(h,v){/* B: up, down, side or neutral by the held direction */let k='n';if(v<0)k='u';else if(v>0)k='d';else if(h){k='s';this.face=h}
    this.startMove(this.SPC[k])}
  aerial(){const c=this.ctrl,h=this.hH;const k=c.held.up?'uair':c.held.down?'dair':h===this.face?'fair':h===-this.face?'bair':'nair';this.startMove(this.N[k])}
  endMove(){const d=this.mv&&this.mv.def;this.mv=null;this.t=0;if(this.ground)this.st='ground';else this.st=d&&d.helpless?'helpless':'air'}
  jump(full){this.vy=-this.b.jump*(full?1:.72)*VS;this.ground=null;this.st='air';this.t=0;SFX.jump();dust(this.x,this.y,4)}
  dodge(h){this.st='dodge';this.t=0;this.roll=h||0;this.dodgeLen=this.roll?24:22;this.mv=null;SFX.dodge();if(this.roll)this.face=-this.roll}
  airDodge(h){this.st='adodge';this.t=0;this.adodged=true;this.mv=null;this.vx=h*1.8;this.vy=Math.min(this.vy,.4*VS);SFX.dodge()}
  drop(){/* fall through a thin platform */this.ground=null;this.dropT=14;this.st='air';this.t=0;this.y+=1;this.vy=.5*VS}
  land(p,quiet){const was=this.st,mv=this.mv;this.ground=p;this.y=p.y;this.vy=0;this.jumps=this.b.jumps-1;this.upUsed=this.sideUsed=this.adodged=false;
    if(!quiet&&!this.dead)dust(this.x,this.y,3);
    if(was==='attack'&&mv.def.air){this.mv=null;this.st='land';this.t=0;this.lag=mv.def.land;SFX.land();return}
    if(was==='special'){const d=mv.def;if(d.landEnds){if(d.onLand)d.onLand(this,mv);this.mv=null;this.st='land';this.t=0;this.lag=d.land||8;return}return}
    if(was==='helpless'){this.st='land';this.t=0;this.lag=10;SFX.land();return}
    if(was==='adodge'){this.st='land';this.t=0;this.lag=6;return}
    if(was==='hurt'){this.kx*=.5;this.ky=0;if(this.tumble){this.st='land';this.t=0;this.lag=12;this.hitstun=0}return}
    if(was==='air'||was==='respawn'){this.st='ground';this.t=0;if(!quiet&&this.vy>=0)SFX.land()}}
  update(){if(this.dead){if(--this.deadT<=0&&this.stocks>0)respawn(this);return}
    for(const k of BTN)if(this.ctrl.pressed[k])this.buf[k]=this.clock;
    if(this.hitlag>0){this.hitlag--;return}
    this.clock++;
    this.t++;this.anim++;if(this.inv>0)this.inv--;if(this.flash>0)this.flash--;if(this.dropT>0)this.dropT--;if(this.comboT>0&&--this.comboT===0)this.combo=0;
    const c=this.ctrl,h=this.hH,F=G.frame;
    for(const k of['left','right']){if(c.pressed[k]){if(F-this.tap[k]<TAP)this.dashReq=k==='left'?-1:1;this.tap[k]=F}}
    if(!this.ground&&(this.st==='ground'||this.st==='jsq'||this.st==='climb'))this.st='air';
    switch(this.st){
    case'ground':this.ctlGround(c,h);break;
    case'jsq':if(this.pr('a')){this.startMove(this.N.utilt);break}if(this.pr('b')){this.special(0,-1);break}if(this.t>=3)this.jump(c.held.up);break;
    case'air':this.ctlAir(c,h);break;
    case'attack':this.ctlAttack(c,h);break;
    case'special':{const m=this.mv,d=m.def;m.f++;if(d.tick&&d.tick(this,m)===false){this.endMove();break}if(this.mv===m&&m.f>=(m.len||d.len))this.endMove();break}
    case'dodge':{const t=this.t;if(t<=6&&this.pr('a')){this.inv=0;this.startMove(this.N.dtilt);break}if(t<=6&&this.pr('b')){this.inv=0;this.special(0,1);break}
      if(this.ground&&this.ground.soft&&t<16&&this.pr('down')){this.drop();break}
      if(t===2)this.inv=12;if(this.roll){this.vx=t<15?this.roll*2.1:this.vx*.7}else this.vx*=.6;if(!this.ground){this.st='air';this.t=0;break}if(t>=this.dodgeLen){this.st='ground';this.t=0}break}
    case'adodge':{const t=this.t;if(t<=6&&this.pr('a')){this.inv=0;this.startMove(this.N.dair);break}if(t<=6&&this.pr('b')){this.inv=0;this.special(0,1);break}
      if(t===2)this.inv=13;this.vx*=.93;if(t>=24){this.st='air';this.t=0}break}
    case'hurt':if(--this.hitstun<=0){this.st=this.ground?'ground':'air';this.t=0;this.tumble=false}else{this.vx=lerp(this.vx,h*.5,.03)}break;
    case'helpless':this.vx=lerp(this.vx,h*this.b.air*.7,.08);break;
    case'land':if(this.ground)this.vx*=.75;if(this.t>=this.lag||!this.ground){this.st=this.ground?'ground':'air';this.t=0}break;
    case'stagger':this.vx*=.85;if(--this.stag<=0){this.st=this.ground?'ground':'air';this.t=0}break;
    case'grabbed':{const g=this.grabber;if(!g||g.dead||!g.mv||g.mv.victim!==this||this.t>80){this.st=this.ground?'ground':'air';this.t=0;this.grabber=null;break}return}
    case'climb':this.vx=0;if(this.t>=8){this.st=this.ground?'ground':'air';this.t=0}break;
    case'respawn':if(this.t>150||c.pressed.left||c.pressed.right||c.pressed.up||c.pressed.down||c.pressed.a||c.pressed.b){this.halo=null;this.ground=null;this.st='air';this.t=0;this.inv=Math.max(this.inv,60);if(c.pressed.up)this.jump(true)}else{this.vx=0;this.vy=0}break}
    this.physics()}
  ctlGround(c,h){
    if(this.pr('a')){if(this.run&&Math.abs(this.vx)>1){this.startMove(this.N.dash);return}if(h){this.face=h;this.startMove(this.N.ftilt);return}if(c.held.up){this.startMove(this.N.utilt);return}if(c.held.down){this.startMove(this.N.dtilt);return}this.startMove(this.N.jab1);return}
    if(this.pr('b')){this.special(h,c.held.up?-1:c.held.down?1:0);return}
    if(this.pr('up')){this.st='jsq';this.t=0;this.run=0;return}
    if(this.pr('down')){if(this.ground.soft&&G.frame-this.tap.down<16){this.drop()}else this.dodge(h);this.tap.down=G.frame;return}
    if(this.dashReq){this.run=this.dashReq;this.face=this.dashReq;this.dashReq=0;SFX.dash();dust(this.x,this.y,4)}
    if(h){if(this.run===h)this.vx=lerp(this.vx,h*this.b.run,.35);else{this.run=0;this.face=h;this.vx=lerp(this.vx,h*this.b.walk,.3)}}
    else{this.run=0;this.vx*=.7}}
  ctlAir(c,h){this.dashReq=0;
    if(h)this.vx=lerp(this.vx,h*this.b.air,.12);else this.vx*=.985;
    if(this.pr('a')){this.aerial();return}
    if(this.pr('b')){this.special(h,c.held.up?-1:c.held.down?1:0);return}
    if(this.jumps>0&&this.pr('up')){this.jumps--;this.vy=-this.b.jump*.92*VS;this.kx*=.3;this.ky=0;SFX.jump();puff(this.x,this.y);if(h)this.vx=h*this.b.air;return}
    if(!this.adodged&&this.pr('down'))this.airDodge(h)}
  ctlAttack(c,h){const m=this.mv,d=m.def;m.f++;
    if(this.ground){if(d.dashy&&m.f<d.s+d.a)this.vx*=.95;else this.vx*=.75}else this.vx=lerp(this.vx,h*this.b.air,.05);
    if(d.next&&m.f>=d.s+d.a&&this.pr('a')){this.startMove(this.N[d.next]);return}
    if(m.connected){/* a hit can be extended: B into any special, or jump out of an up attack or an aerial */
      if(this.pr('b')){this.special(h,c.held.up?-1:c.held.down?1:0);return}
      if(!d.next&&m.f>=d.s+d.a&&this.pr('a')){if(this.ground){if(h){this.face=h;this.startMove(this.N.ftilt)}else if(c.held.up)this.startMove(this.N.utilt);else this.startMove(this.N.jab1)}else this.aerial();return}
      if((d.air||d.id==='utilt')&&(this.ground||this.jumps>0)&&this.pr('up')){if(this.ground){this.mv=null;this.jump(true)}else{this.mv=null;this.st='air';this.jumps--;this.vy=-this.b.jump*.92*VS;SFX.jump()}return}}
    if(m.f>=d.len)this.endMove()}
  physics(){if(this.st==='grabbed')return;const b=this.b;
    let g=b.g*VS;if(this.mv)g*=(this.mv.grav??this.mv.def.grav??1);if(this.st==='adodge'&&this.t<16)g*=.4;if(this.st==='hurt'&&this.ky<0)g*=.3;if(this.st==='respawn')g=0;
    if(!this.ground){const cap=b.fall*VS;if(this.vy<cap)this.vy=Math.min(this.vy+g,cap)}
    if(this.kx||this.ky){const ny=this.ky/VS/1.6,m=Math.hypot(this.kx,ny),m2=m-.06;if(m2<=0){this.kx=this.ky=0}else{this.kx*=m2/m;this.ky*=m2/m}}
    const ox=this.x,oy=this.y;this.x+=this.vx+this.kx;this.y+=this.vy+this.ky;
    if(this.ground){const p=this.ground;
      if(this.y<p.y-.5&&(this.vy<0||this.ky<0)){this.ground=null}
      else if(this.x<p.l||this.x>p.r){if(p.halo){this.x=clamp(this.x,p.l,p.r)}else{this.ground=null;if(this.st==='ground'){this.st='air';this.t=0}this.jumps=Math.min(this.jumps,this.b.jumps-1)}}
      else{this.y=p.y;this.vy=0;if(this.ky>0)this.ky=0}}
    if(!this.ground){
      if(this.vy+this.ky>=0){let best=null;for(const p of G.stage.plats){if(p.soft&&(this.dropT>0||this.st==='hurt'&&this.ky>1.5*VS))continue;if(oy<=p.y+.01&&this.y>=p.y&&this.x>=p.l&&this.x<=p.r&&(!best||p.y<best.y))best=p}
        if(best){if(this.st==='hurt'&&this.ky>2.6*VS){/* slammed into the floor: bounce */this.y=best.y-1;this.ky=-this.ky*.45;this.kx*=.7;burst(this.x,best.y,'#ffffff',6);SFX.land()}else this.land(best)}}
      if(!this.ground)this.solid(ox,oy)}
    if(this.x<-26||this.x>W+26||this.y>H+34||this.y<-42*VS)ko(this)}
  /* the main stage is a solid block: land on top, bump your head below, and get pushed off its sides;
     reaching its edge from below the top pulls you up onto it (the ledge assist) */
  solid(ox,oy){const S=G.stage.main,top=S.y,bot=S.y+S.th*VS,reach=top+Math.max(24,S.th+12)*VS;
    const inside=this.x>S.l-this.hw&&this.x<S.r+this.hw&&this.y>top&&this.y-this.h<bot;
    const near=!inside&&this.y>top&&this.y<reach&&(this.x>S.l-this.hw-8&&this.x<=S.l-this.hw||this.x<S.r+this.hw+8&&this.x>=S.r+this.hw);
    const canGrab=['air','helpless','special','adodge'].includes(this.st)&&this.vy+this.ky>-3*VS&&!(this.mv&&this.mv.def.landEnds);
    if((inside||near)&&this.y<reach&&canGrab&&!(inside&&oy<=top)&&!(inside&&oy-this.h>=bot-1)){const left=this.x<(S.l+S.r)/2;this.mv=null;this.st='air';this.kx=this.ky=0;this.x=left?S.l+4:S.r-4;this.land(S,true);this.st='climb';this.t=0;this.inv=Math.max(this.inv,10);this.face=left?1:-1;return}
    if(!inside)return;
    if(oy-this.h>=bot-1){/* under the stage: bump your head and slide out toward the nearer edge */this.y=bot+this.h;if(this.ky<0)this.ky=-this.ky*.3;
      if(this.vy<0){const out=this.x<(S.l+S.r)/2?-1:1;this.x+=out*3.2;if(this.st!=='hurt')this.vy*=.6}return}
    const left=this.x<(S.l+S.r)/2;this.x=left?S.l-this.hw:S.r+this.hw;this.vx=0;this.kx=Math.abs(this.kx)>2?-this.kx*.3:0}
}
function platUnder(x,y){let best=null;for(const p of G.stage.plats)if(x>=p.l&&x<=p.r&&p.y>=y-1&&(!best||p.y<best.y))best=p;return best}
function respawn(f){const x=W/2,y=G.stage.spawnY;f.spawnAt(x,y,f.slot?-1:1);f.halo={l:x-12,r:x+12,y,soft:1,halo:1};f.ground=f.halo;f.st='respawn';f.t=0;f.inv=150;f.pct=0;f.dead=false}
function ko(f){if(f.dead)return;const x=clamp(f.x,6,W-6),y=clamp(f.y,10,H-10);f.dead=true;f.deadT=70;f.st='dead';f.mv=null;f.stocks--;f.falls++;
  if(f.lastHit&&f.lastHit!==f)f.lastHit.kos++;
  SFX.ko();G.shake=10;for(let i=0;i<40;i++){const a=Math.atan2(H/2-y,W/2-x)+(rnd()-.5)*1.6,v=1+rnd()*4;G.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:30+rnd()*30,c:pick([WH,'#ffd84a',f.ch.fx,f.ch.suit]),s:rnd()<.4?3:2,g:0,ko:1})}
  G.kobeam={x,y,c:f.ch.fx,t:24};
  for(const p of G.proj)if(p.own===f&&!p.mine)p.life=0;
  if(f.stocks<=0)G.matchEnd=G.matchEnd||{loser:f,t:90}}
