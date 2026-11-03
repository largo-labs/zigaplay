/* ================= the CPU =================
   The computer presses the same buttons a player does, through its own pad. Level 1 to 9 sets how fast it
   reacts, how often it dodges in time, how readily it extends combos and how aggressive it is. */
function makePad(){const p={held:{},pressed:{},released:{}};for(const b of BTN){p.held[b]=false;p.pressed[b]=false;p.released[b]=false}return p}
const RANGED=['shot','charge','boomerang','bomb','beam','wave'];
class CPU{
  constructor(f,lv){this.f=f;this.lv=lv;this.pad=f.ctrl;this.t=0;this.next=0;this.taps=[];this.holdB=0;this.seenMove=null;this.dodgeAt=-1;this.wait=0;this.walkDir=0;this.rnd=rnd()}
  get react(){return Math.round(26-this.lv*2.5)}
  tap(b,delay=0){this.taps.push({b,at:this.t+delay})}
  clear(){for(const b of BTN){this.pad.pressed[b]=false;this.pad.released[b]=false}}
  hold(b,on){if(on&&!this.pad.held[b])this.pad.pressed[b]=true;if(!on&&this.pad.held[b])this.pad.released[b]=true;this.pad.held[b]=on}
  dirs(h,v){this.hold('left',h<0);this.hold('right',h>0);this.hold('up',v<0);this.hold('down',v>0)}
  think(){this.t++;const me=this.f,op=G.fighters.find(o=>o!==me);if(!op)return;
    for(const k of this.taps.filter(k=>k.at<=this.t)){this.pad.pressed[k.b]=true;this.pad.held[k.b]=true;k.done=1;k.rel=this.t+2}
    this.taps=this.taps.filter(k=>!k.done);
    if(this.holdB>0){this.holdB--;this.pad.held.b=true;if(this.holdB===0)this.hold('b',false)}else if(this.pad.held.b&&!this.pad.pressed.b)this.hold('b',false);
    if(this.pad.held.a&&!this.pad.pressed.a)this.hold('a',false);
    if(me.dead||me.hitlag>0)return;
    const S=G.stage.main,lv=this.lv,dx=op.x-me.x,dy=op.y-me.y,adx=Math.abs(dx),toward=sgn(dx)||me.face;
    if(me.st==='hurt'){this.dirs(me.x<W/2?1:-1,0);return}
    if(me.st==='grabbed'||me.st==='stagger'||me.st==='climb')return;
    if(me.st==='respawn'){if(this.t%40===0&&rnd()<.6)this.tap('down');return}
    /* off the stage: get back */
    const off=me.x<S.l-2||me.x>S.r+2;
    if(!me.ground&&(off||me.y>S.y+4)){const mid=(S.l+S.r)/2,under=!off&&me.y>S.y+2;
      /* under the stage: head for the nearer edge first, then come up around it */
      const home=under?(me.x<mid?-1:1):(me.x<mid?1:-1),edge=me.x<mid?S.l:S.r,far=Math.abs(me.x-edge);
      this.dirs(home,0);
      if(me.st==='air'){const low=me.y>S.y-12*VS;
        if(!under&&far>46&&!me.sideUsed&&['dash','rocket','blink','flipkick'].includes(me.ch.sp.s[0])&&me.y<S.y+30*VS&&lv>1){this.dirs(home,0);this.tap('b');return}
        if(low&&me.jumps>0&&me.vy>-.5*VS&&this.t%6===0&&!(under&&far<30))this.tap('up');
        else if(low&&me.jumps<=0&&!me.upUsed&&(under?far>18||me.x<S.l||me.x>S.r:true)&&(me.y>S.y+6*VS||far>34)&&(lv>2||rnd()<.5)){this.dirs(under?home:home,-1);this.tap('b')}}
      else if(me.st==='special'&&me.mv&&me.mv.def.slot==='u')this.dirs(home,-1);
      return}
    if(me.st==='helpless'||me.st==='attack'&&!me.mv.connected||me.st==='land'||me.st==='jsq')return this.combo(me,op);
    if(me.st==='special')return this.chargeCheck(me,op);
    /* a dodge, timed to the opponent's swing */
    if(op.mv&&op.mv!==this.seenMove&&(op.st==='attack'||op.st==='special')&&adx<46&&Math.abs(dy)<40){this.seenMove=op.mv;
      const d=op.mv.def,until=(d.s!=null?d.s:8)-op.mv.f;
      if(rnd()<.04+lv*.09){const err=Math.round((rnd()-.5)*(12-lv));this.dodgeAt=this.t+Math.max(0,until-3+err)}}
    if(this.dodgeAt>=0&&this.t>=this.dodgeAt){this.dodgeAt=-1;if(me.st==='ground'||me.st==='air'){this.dirs(rnd()<.4?-toward:0,0);this.tap('down');return}}
    if(op.st==='stagger'||op.st==='land'&&op.lag>8){/* punish */this.approachAndHit(me,op,dx,dy,adx,toward,1);return}
    if(this.t<this.next){this.keepMoving(me,op,toward,adx);return}
    this.next=this.t+Math.max(3,this.react+Math.round(rnd()*6));
    this.approachAndHit(me,op,dx,dy,adx,toward,0)}
  approachAndHit(me,op,dx,dy,adx,toward,punish){const lv=this.lv,ch=me.ch,S=G.stage.main,ranged=RANGED.includes(ch.sp.n[0]);
    const reach=ch.style==='sword'?24:ch.size==='L'?20:17,same=Math.abs(dy)<16*VS;
    if(op.dead||op.st==='respawn'){this.dirs(sgn(W/2-me.x)*(Math.abs(W/2-me.x)>20?1:0),0);return}
    if(adx<reach&&same){me.face=toward;this.dirs(0,0);
      const r=rnd();if(me.ground){if(r<.45)this.tap('a');else if(r<.75){this.dirs(toward,0);this.tap('a')}else if(r<.9){this.dirs(0,1);this.tap('down');this.tap('a',1)}else{const room=toward>0?S.r-me.x:me.x-S.l;if(room>70||['whip','grab'].includes(ch.sp.s[0])){this.dirs(toward,0);this.tap('b')}else this.tap('a')}}
      else this.tap('a');
      this.comboWant=rnd()<.25+lv*.08;return}
    if(adx<20&&dy<-14*VS&&dy>-60*VS){this.dirs(0,-1);this.tap('up');this.tap('a',rnd()<.5?1:6);return}
    if(!me.ground&&adx<14&&dy>8*VS){this.dirs(0,1);this.tap('a');return}
    if(ranged&&adx>40&&adx<120&&same&&rnd()<.2+lv*.03){me.face=toward;this.dirs(0,0);this.tap('b');if(ch.sp.n[0]==='charge')this.holdB=20+Math.round(rnd()*40);return}
    if(!punish&&adx<60&&rnd()<.12+lv*.015&&me.ground){/* a side special, but never one that runs off the edge */const room=toward>0?S.r-me.x:me.x-S.l;if(room>70||adx<room){this.dirs(toward,0);this.tap('b');return}}
    /* get closer: run when far, jump up to a platform the opponent stands on */
    this.walkDir=toward;
    if(dy<-20*VS&&adx<50&&me.ground&&rnd()<.5){this.tap('up');return}
    if(adx>36&&me.ground&&me.st==='ground'&&!me.run){this.dirs(0,0);this.tap(toward<0?'left':'right');this.tap(toward<0?'left':'right',3)}}
  keepMoving(me,op,toward,adx){const S=G.stage.main;
    if(me.st!=='ground'&&me.st!=='air')return;
    let h=adx>14?toward:0;if(me.ground===S&&((me.x<S.l+12&&h<0)||(me.x>S.r-12&&h>0)))h=0;
    if(!me.ground&&!(me.x<S.l||me.x>S.r))h=adx>10?toward:0;
    this.hold('left',h<0);this.hold('right',h>0);this.hold('up',false);this.hold('down',false)}
  combo(me,op){/* after a hit: keep going with A, or cancel into a special */
    const m=me.mv;if(!m)return;if(m.connected&&this.comboWant){const d=m.def,r=rnd();
      if(d.next&&r<.75){this.tap('a');return}
      if(r<.5){const h=sgn(op.x-me.x),S=G.stage.main,room=h>0?S.r-me.x:me.x-S.l;let v=rnd();if(v<.35&&room<70&&me.ch.sp.s[0]!=='whip'&&me.ch.sp.s[0]!=='grab')v=.5;if(v<.35)this.dirs(h,0);else if(v<.6)this.dirs(0,-1);else if(v<.75)this.dirs(0,1);else this.dirs(0,0);this.tap('b');this.comboWant=false}}
    else if(m.def.next&&rnd()<.3&&Math.abs(op.x-me.x)<20)this.tap('a')}
  chargeCheck(me,op){if(me.mv&&me.mv.def.slot==='u'){const S=G.stage.main;this.dirs(me.x<(S.l+S.r)/2?1:-1,-1)}}
}
