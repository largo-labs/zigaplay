/* ================= moves =================
   A move runs frame by frame. Its hit boxes are given in the fighter's own space: x forward from the feet, y up
   (negative) from the feet, both in screen pixels, w/h the box size. Each box deals dmg (percent), and launches
   by kb (base knockback) + kg (growth with the target's percent) at ang degrees (0 = straight away, 90 = up,
   negative = down). */
POSES.bair={lean:-12,aF:60,aB:-60,lF:10,lB:-105,kB:1.5};
const SZ={S:.85,M:1,L:1.15};
/* the A attacks, for a medium brawler; styles and sizes adjust them */
const NORMALS={
  jab1:{pose:'jab1',s:3,a:2,r:7,hb:[{x:8,y:-13,w:11,h:7,dmg:3,kb:.7,kg:.05,ang:70}],next:'jab2'},
  jab2:{pose:'jab2',s:3,a:2,r:8,hb:[{x:8,y:-12,w:11,h:7,dmg:3,kb:.7,kg:.06,ang:70}],next:'jab3'},
  jab3:{pose:'jab3',s:4,a:3,r:15,hb:[{x:10,y:-9,w:14,h:10,dmg:5,kb:2.5,kg:.55,ang:38}]},
  ftilt:{pose:'ftilt',s:6,a:3,r:15,hb:[{x:10,y:-12,w:14,h:9,dmg:9,kb:2.6,kg:1,ang:32}]},
  utilt:{pose:'utilt',s:5,a:4,r:14,hb:[{x:3,y:-24,w:15,h:13,dmg:7,kb:2.4,kg:.85,ang:88}]},
  dtilt:{pose:'dtilt',s:5,a:3,r:11,hb:[{x:9,y:-3,w:14,h:6,dmg:6,kb:2,kg:.55,ang:24}]},
  dash:{pose:'dash',s:6,a:8,r:16,hb:[{x:7,y:-8,w:13,h:12,dmg:8,kb:2.6,kg:.8,ang:50}],dashy:1},
  nair:{pose:'nair',s:4,a:8,r:10,hb:[{x:0,y:-11,w:21,h:19,dmg:7,kb:2.2,kg:.75,ang:40,radial:1}],air:1,land:6,spin:1},
  fair:{pose:'fair',s:6,a:3,r:13,hb:[{x:10,y:-11,w:13,h:11,dmg:9,kb:2.6,kg:.95,ang:40}],air:1,land:9},
  bair:{pose:'bair',s:6,a:3,r:13,hb:[{x:-10,y:-9,w:13,h:10,dmg:10,kb:2.8,kg:1,ang:40,back:1}],air:1,land:9},
  uair:{pose:'uair',s:5,a:4,r:12,hb:[{x:1,y:-26,w:15,h:11,dmg:8,kb:2.5,kg:.9,ang:86}],air:1,land:7},
  dair:{pose:'dair',s:8,a:4,r:16,hb:[{x:1,y:1,w:11,h:10,dmg:10,kb:2.4,kg:.85,ang:-72}],air:1,land:12},
};
const STYLE={
  brawler:{dmg:1,s:0,r:1,kb:1,kg:1,reach:0,w:1,fx:'punch'},
  speed:{dmg:.78,s:-1,r:.8,kb:.92,kg:.9,reach:0,w:1,fx:'punch'},
  heavy:{dmg:1.3,s:2,r:1.25,kb:1.1,kg:1.15,reach:1,w:1.12,fx:'punch'},
  sword:{dmg:1.08,s:1,r:1,kb:1,kg:1,reach:6,w:1.2,fx:'slash'},
  magic:{dmg:.92,s:0,r:1,kb:1,kg:1,reach:1,w:1.15,fx:'spark'},
};
function buildNormals(ch){const st=STYLE[ch.style],z=SZ[ch.size],out={};
  for(const k in NORMALS){const n=NORMALS[k],m={id:k,kind:'normal',pose:n.pose,s:Math.max(2,n.s+st.s),a:n.a,r:Math.round(n.r*st.r),air:!!n.air,land:n.land||0,next:n.next,dashy:n.dashy,spin:n.spin,fx:st.fx,
      hb:n.hb.map(b=>({x:(b.x+(b.x>0?st.reach:b.x<0?-st.reach:0))*z,y:b.y*z,w:b.w*st.w*z+(Math.abs(b.x)>4?st.reach:0),h:b.h*z*(st.w>1?1.08:1),dmg:Math.max(1,Math.round(b.dmg*st.dmg)),kb:b.kb*st.kb,kg:b.kg*st.kg,ang:b.ang,radial:b.radial,back:b.back}))};
    m.len=m.s+m.a+m.r;out[k]=m}
  return out}
/* ---------- the special moves ----------
   Each kind makes a move from the fighter and the options in its roster entry. Hooks:
   tick(me,m)      runs every frame (movement, spawning things); return false to end the move early
   boxes(me,m)     the hit boxes active this frame
   grav            gravity multiplier while the move runs (default 1)
   landEnds        landing ends the move (with land frames of lag)
   helpless        when the move ends in the air, the fighter can only drift down until landing */
const SPK={};
const hold=(me)=>({h:(me.ctrl.held.right?1:0)-(me.ctrl.held.left?1:0),v:(me.ctrl.held.down?1:0)-(me.ctrl.held.up?1:0)});
const PW=(me)=>me.ch.pw||1;
/* B: projectiles */
SPK.shot=(o)=>({pose:m=>m.f<8?'charge':'cast',len:26,grav:.8,
  tick(me,m){if(m.f===9){if(countProj(me,'shot')>=(o.kind==='bubble'?1:2))return;SFX.shoot();
    spawnProj(me,{tag:'shot',kind:o.kind,x:me.x+me.face*10,y:me.y-12,vx:me.face*o.v,vy:o.kind==='fire'?-.4*VS:0,g:o.kind==='fire'?.06*VS:0,life:o.life,w:o.kind==='bubble'?9:6,h:o.kind==='bubble'?9:5,
      dmg:Math.round(o.dmg*PW(me)),kb:o.kind==='bubble'?2.4:1.4,kg:o.kind==='bubble'?.7:.45,ang:o.kind==='bubble'?60:35,float:o.float,bounce:o.kind==='fire'})}}});
SPK.charge=(o)=>({pose:m=>m.fire?'cast':'charge',len:999,grav:.5,
  tick(me,m){if(!m.fire){m.c=Math.min(60,(m.c||0)+1);if(m.c%12===1&&m.c<60)tone({f:300+m.c*12,d:.05,v:.06});
      if(!me.ctrl.held.b||m.c>=60&&me.ctrl.pressed.b||m.f>200){m.fire=m.f;const c=m.c/60;SFX.shoot();if(c>.95)SFX.boom();
        spawnProj(me,{tag:'shot',kind:'star',x:me.x+me.face*10,y:me.y-12,vx:me.face*(2.4+c*1.6),vy:0,g:0,life:70,w:5+c*8,h:5+c*8,dmg:Math.round((4+c*14)*PW(me)),kb:1.4+c*2.4,kg:.4+c*.8,ang:38})}
      else if(me.ctrl.pressed.down&&m.f>4){return false}}
    else if(m.f-m.fire>16)return false},
  aura(me,m){return m.fire?null:{r:2+m.c/10,col:me.ch.fx}}});
SPK.boomerang=(o)=>({pose:m=>m.f<7?'charge':'cast',len:24,grav:.8,
  tick(me,m){if(m.f===8&&!countProj(me,'boomer')){SFX.shoot();spawnProj(me,{tag:'boomer',kind:'boomer',x:me.x+me.face*10,y:me.y-12,vx:me.face*3.4,vy:0,g:0,life:110,w:9,h:6,dmg:Math.round(o.dmg*PW(me)),kb:1.8,kg:.6,ang:40,boomer:1,rehit:24})}}});
SPK.bomb=(o)=>({pose:m=>m.f<8?'charge':'throw',len:24,grav:.8,
  tick(me,m){if(m.f===9&&!countProj(me,'bomb')){SFX.swing();spawnProj(me,{tag:'bomb',kind:'bomb',x:me.x+me.face*8,y:me.y-16,vx:me.face*2.2,vy:-2.6*VS,g:.16*VS,life:90,w:7,h:7,dmg:Math.round(o.dmg*PW(me)),kb:3,kg:1,ang:62,explode:1})}}});
SPK.beam=(o)=>({pose:m=>m.f<8?'charge':'cast',len:30,grav:.6,
  boxes(me,m){if(m.f>=8&&m.f<18)return[{x:30,y:-13,w:44,h:7,dmg:Math.round(o.dmg*PW(me)),kb:2.2,kg:.75,ang:28,beam:1}];return[]},
  draw(me,m){if(m.f>=8&&m.f<18){const x0=me.x+me.face*8,y=me.y-13,len=52*Math.min(1,(m.f-7)/3);if(o.fire){for(let i=0;i<8;i++){const d=rnd()*len;fx({x:x0+me.face*d,y:y+(rnd()-.5)*(2+d/8),vx:me.face*rnd(),vy:-rnd()*.5,life:10,c:pick(['#ff8a3a','#ffd84a','#ff5f3a']),s:2})}}
    else{ctx.fillStyle=me.ch.fx;ctx.fillRect(Math.min(x0,x0+me.face*len),y-2,len,4);ctx.fillStyle=WH;ctx.fillRect(Math.min(x0,x0+me.face*len),y-1,len,2)}}}});
SPK.bigpunch=(o)=>({pose:m=>m.f<26?'charge':'punch',len:60,grav:.5,
  tick(me,m){if(m.f<12){const h=hold(me).h;if(h&&h!==me.face)me.face=h}if(m.f===26){SFX.swing();me.vx=me.face*2.2}if(m.f===10)tone({f:180,f2:420,d:.3,type:'sawtooth',v:.08})},
  boxes(me,m){if(m.f>=27&&m.f<32)return[{x:13,y:-12,w:20,h:13,dmg:Math.round(o.dmg*PW(me)),kb:4,kg:1.45,ang:33,heavy:1}];return[]},
  aura(me,m){return m.f<27?{r:1+m.f/6,col:me.ch.fx,front:1}:null}});
SPK.spin=(o)=>({pose:'spin',len:38,grav:.35,spin:1,
  tick(me,m){const h=hold(me).h;me.vx=lerp(me.vx,h*1.3,.15)},
  boxes(me,m){if(m.f>=4&&m.f<30&&m.f%6===4)return[{x:0,y:-11,w:26,h:16,dmg:Math.round(o.dmg*PW(me)),kb:1,kg:.1,ang:70,radial:1,rehit:1}];
    if(m.f>=30&&m.f<34)return[{x:0,y:-11,w:28,h:18,dmg:5,kb:2.9,kg:.95,ang:48,radial:1,rehit:1}];return[]}});
SPK.wave=(o)=>({pose:m=>m.f<12?'charge':'slam',len:32,grav:.8,
  tick(me,m){if(m.f===12){SFX.boom();spawnProj(me,{tag:'wave',kind:'wave',x:me.x+me.face*10,y:me.ground?me.y-5:me.y-10,vx:me.face*2.6,vy:0,g:0,life:42,w:12,h:12,dmg:Math.round(o.dmg*PW(me)),kb:2.7,kg:.85,ang:60,hug:!!me.ground})}}});
/* B + left/right */
SPK.dash=(o)=>({pose:m=>m.f<6?'charge':'dash',len:34,grav:0,
  tick(me,m){if(m.f===6){SFX.dash();m.go=me.sideOK();me.vy=0}if(m.f>=6&&m.f<18){me.vx=me.face*(m.go?4:1.6);me.vy=0}if(m.f>=18)me.vx*=.8;if(m.f===18)m.grav=1},
  boxes(me,m){if(m.f>=6&&m.f<18&&!m.stop)return[{x:6,y:-10,w:15,h:15,dmg:Math.round(o.dmg*PW(me)),kb:2.8,kg:.95,ang:36}];return[]},
  onHit(me,m){m.stop=1;me.vx=-me.face*.8}});
SPK.flipkick=(o)=>({pose:m=>m.f<5?'crouch':'kick',len:34,landEnds:1,land:8,
  tick(me,m){if(m.f===4){const go=me.sideOK();me.vx=me.face*(go?2.6:1.2);me.vy=-(go?3.6:1.6)*VS;me.ground=null;SFX.jump()}},
  boxes(me,m){if(m.f>=6&&m.f<24&&!m.stop)return[{x:7,y:-6,w:14,h:13,dmg:Math.round(o.dmg*PW(me)),kb:2.8,kg:.95,ang:45}];return[]},
  onHit(me,m){m.stop=1;me.vx=-me.face*1;me.vy=-2*VS}});
SPK.rocket=(o)=>({pose:m=>m.f<10?'charge':'dash',len:36,grav:0,rot:1,
  tick(me,m){if(m.f===10){m.go=me.sideOK();SFX.dash()}if(m.f<10){me.vx*=.8;me.vy*=.5}else if(m.f<26){me.vx=me.face*(m.go?4.2:1.8);me.vy=0;if(m.f%2)fx({x:me.x-me.face*6,y:me.y-8,vx:-me.face,vy:0,life:12,c:me.ch.fx,s:2})}else{me.vx*=.85;m.grav=1}},
  boxes(me,m){if(m.f>=10&&m.f<26&&!m.stop)return[{x:4,y:-10,w:16,h:14,dmg:Math.round(o.dmg*PW(me)),kb:3,kg:1,ang:40}];return[]},
  onHit(me,m){m.stop=1;me.vx=-me.face}});
SPK.grab=(o)=>({pose:m=>m.held?(m.f-m.held<20?'grab':'throw'):m.f<5?'charge':'grab',len:44,grav:.6,
  tick(me,m){if(!m.held){if(m.f>=5&&m.f<13)me.vx=me.face*2.2;else me.vx*=.7}
    else{const v=m.victim,d=m.f-m.held;if(v.st!=='grabbed'){return false}v.x=me.x+me.face*11;v.y=me.y;v.face=-me.face;
      if(d===8||d===16){v.pct+=2;v.flash=6;SFX.hit(0)}
      if(d===24){const h=hold(me).h;if(h&&h!==me.face)me.face=h;v.x=me.x+me.face*11;
        launch(me,v,{dmg:Math.round(o.dmg*PW(me)),kb:3.4,kg:1.15,ang:42,heavy:1},me.face,true);m.thrown=1}
      if(d>34)return false}},
  boxes(me,m){if(!m.held&&m.f>=5&&m.f<13)return[{x:9,y:-11,w:13,h:16,grab:1}];return[]},
  onGrab(me,m,v){m.held=m.f;m.victim=v;m.len=m.f+40;v.st='grabbed';v.t=0;v.mv=null;v.kx=v.ky=v.vx=v.vy=0;SFX.hit(0)}});
SPK.whip=(o)=>({pose:m=>m.f<9?'charge':'ftilt',len:32,grav:.7,
  boxes(me,m){if(m.f>=9&&m.f<15){const d=Math.round(o.dmg*PW(me));return[{x:20,y:-12,w:26,h:7,dmg:d-2,kb:2.2,kg:.8,ang:32},{x:42,y:-12,w:14,h:9,dmg:d+2,kb:2.9,kg:1.05,ang:34}]}return[]},
  draw(me,m){if(m.f>=8&&m.f<17){const len=50*Math.min(1,(m.f-7)/3),x0=me.x+me.face*7,y=me.y-12;for(let i=0;i<len;i+=2){ctx.fillStyle=i>len-12?lt(me.ch.fx):me.ch.fx;ctx.fillRect(Math.round(x0+me.face*i),Math.round(y+Math.sin(i/6+m.f)*1.5),2,2)}}}});
SPK.blink=(o)=>({pose:m=>m.f<10?'crouch':'cast',len:30,grav:0,
  tick(me,m){if(m.f===1){me.inv=Math.max(me.inv,11);m.hide=1;SFX.dodge()}if(m.f<10){me.vx=0;me.vy=0}if(m.f===10){m.hide=0;const go=me.sideOK();let d=go?46:18;/* an opponent close in front: appear just behind them */for(const o of G.fighters){const dx=(o.x-me.x)*me.face;if(o!==me&&!o.dead&&dx>0&&dx<d+6&&Math.abs(o.y-me.y)<20)d=Math.min(d,dx+9)}me.x+=me.face*d;me.vy=0;burst(me.x,me.y-10,me.ch.fx,10)}if(m.f===20)m.grav=1},
  boxes(me,m){if(m.f>=10&&m.f<14)return[{x:0,y:-11,w:28,h:22,dmg:Math.round(o.dmg*PW(me)),kb:2.6,kg:.9,ang:50,radial:1}];return[]},
  hidden:m=>m.hide});
/* B + up: getting back to the stage */
SPK.uppercut=(o)=>({pose:'rise',len:24,grav:0,helpless:1,upB:1,
  tick(me,m){if(m.f===2){me.vy=-(me.upOK()?6.2:2.5)*VS;me.ground=null;SFX.jump()}if(m.f>=2){me.vx=lerp(me.vx,me.face*.8+hold(me).h*1,.2);me.vy+=.2*VS}if(m.f%3===0)fx({x:me.x,y:me.y-4,vx:0,vy:1,life:12,c:me.ch.fx,s:2})},
  boxes(me,m){if(m.f>=2&&m.f<15&&m.f%4===2)return[{x:4,y:-14,w:16,h:20,dmg:Math.round(o.dmg*PW(me)),kb:.9,kg:.1,ang:88,rehit:1}];if(m.f>=15&&m.f<19)return[{x:3,y:-20,w:18,h:14,dmg:5,kb:3.1,kg:.9,ang:80,rehit:1}];return[]}});
SPK.rocket_up=(o)=>({pose:m=>m.f<8?'charge':'rise',len:30,grav:0,helpless:1,upB:1,
  tick(me,m){if(m.f<8){me.vx*=.8;me.vy*=.6}if(m.f===8){const h=hold(me);let a=90;if(h.h)a=h.v<0?55:25;if(h.h)me.face=h.h;m.a=a*D2R;m.dir=h.h||0;m.go=me.upOK();SFX.dash()}
    if(m.f>=8&&m.f<28){const s=m.go?5:2;me.vx=Math.cos(m.a)*s*(m.dir||0);me.vy=-Math.sin(m.a)*s*VS;if(m.f%2)fx({x:me.x,y:me.y,vx:-me.vx*.3,vy:1,life:12,c:pick(['#ffd84a','#ff8a3a']),s:2})}if(m.f===28){me.vx*=.4;me.vy*=.3}},
  boxes(me,m){if(m.f>=8&&m.f<28&&m.f%6===2)return[{x:0,y:-10,w:16,h:20,dmg:Math.round(o.dmg*PW(me)),kb:1.6,kg:.4,ang:70,radial:1,rehit:1}];return[]}});
SPK.teleport=(o)=>({pose:m=>m.f<12?'crouch':'fall',len:24,grav:0,helpless:1,upB:1,
  tick(me,m){if(m.f===1){me.inv=Math.max(me.inv,14);m.hide=1;SFX.dodge();burst(me.x,me.y-10,me.ch.fx,8)}if(m.f<12){me.vx=0;me.vy=0}
    if(m.f===12){m.hide=0;const h=hold(me);let dx=h.h,dy=h.v;if(!dx&&!dy)dy=-1;if(dy>0&&!dx)dy=-1;const l=Math.hypot(dx,dy),d=me.upOK()?60:20;me.x+=dx/l*d;me.y+=dy/l*d*VS;me.ground=null;burst(me.x,me.y-10,me.ch.fx,8)}},
  hidden:m=>m.hide});
SPK.copter=(o)=>({pose:'spin',len:42,grav:0,helpless:1,upB:1,spin:1,
  tick(me,m){if(m.f===1){m.go=me.upOK();me.ground=null;SFX.jump()}me.vy=-(m.f<36?(m.go?2.5:.6):0)*VS;me.vx=lerp(me.vx,hold(me).h*1.4,.2)},
  boxes(me,m){if(m.f>=2&&m.f<36&&m.f%5===2)return[{x:0,y:-12,w:24,h:16,dmg:Math.round(o.dmg*PW(me)),kb:.9,kg:.1,ang:80,radial:1,rehit:1}];if(m.f>=36&&m.f<40)return[{x:0,y:-12,w:26,h:18,dmg:4,kb:2.6,kg:.8,ang:72,radial:1,rehit:1}];return[]}});
SPK.superjump=(o)=>({pose:m=>m.f<5?'crouch':'rise',len:26,grav:.6,helpless:1,upB:1,
  tick(me,m){if(m.f===5){me.vy=-(me.upOK()?7.3:2.6)*VS;me.vx=hold(me).h*1.3;me.ground=null;SFX.jump();burst(me.x,me.y,'#ffffff',6)}},
  boxes(me,m){if(m.f>=5&&m.f<13)return[{x:2,y:-22,w:16,h:14,dmg:Math.round(o.dmg*PW(me)),kb:3,kg:.95,ang:82}];return[]}});
SPK.spring=(o)=>({pose:m=>m.f<14?'jump':'fall',len:20,grav:.8,upB:1,
  tick(me,m){if(m.f===1){const go=me.upOK();me.vy=-(go?6.6:2.4)*VS;me.vx=hold(me).h*1.2;me.ground=null;me.jumps=0;SFX.jump();fx({x:me.x,y:me.y,vx:0,vy:0,life:20,c:me.ch.fx,s:3,spring:1})}},
  boxes(me,m){if(m.f>=1&&m.f<7)return[{x:0,y:-2,w:16,h:10,dmg:Math.round(o.dmg*PW(me)),kb:3,kg:.9,ang:84}];return[]}});
/* B + down */
SPK.counter=(o)=>({pose:m=>m.f<4?'crouch':'guard',len:40,grav:.4,
  tick(me,m){m.window=m.f>=4&&m.f<26&&!m.done},
  aura(me,m){return m.window?{r:3+Math.sin(m.f)*1,col:'#ffffff',front:1}:null}});
SPK.pound=(o)=>({pose:m=>m.f<8?'crouch':'dair',len:120,grav:0,landEnds:1,land:14,
  tick(me,m){if(m.f===1&&me.ground){me.vy=-3*VS;me.ground=null}if(m.f<8){me.vy=me.vy*.85;me.vx*=.8}else{me.vy=7.5*VS;me.vx*=.9}
    if(m.f>=60)return false},
  boxes(me,m){if(m.f>=8)return[{x:0,y:0,w:14,h:12,dmg:Math.round(o.dmg*PW(me)),kb:2.6,kg:.9,ang:-68,spikeAir:1}];return[]},
  onLand(me,m){SFX.boom();G.shake=4;burst(me.x,me.y,'#ffffff',10);addBoxFx(me,[{x:-14,y:-5,w:18,h:10,dmg:5,kb:2.4,kg:.7,ang:65,back:1},{x:14,y:-5,w:18,h:10,dmg:5,kb:2.4,kg:.7,ang:65}],4)}});
SPK.reflect=(o)=>({pose:'guard',len:32,grav:.4,
  tick(me,m){m.reflect=m.f>=2&&m.f<26;if(m.f===2)SFX.counter()},
  boxes(me,m){if(m.f>=2&&m.f<6)return[{x:0,y:-11,w:26,h:22,dmg:3,kb:2,kg:.3,ang:45,radial:1}];return[]},
  draw(me,m){if(m.reflect){ctx.strokeStyle=me.ch.fx;ctx.globalAlpha=.6+Math.sin(m.f*.8)*.2;ctx.lineWidth=2;ctx.beginPath();ctx.arc(me.x,me.y-11,14,0,7);ctx.stroke();ctx.globalAlpha=1}}});
SPK.mine=(o)=>({pose:'crouch',len:22,grav:.8,
  tick(me,m){if(m.f===6){for(const p of G.proj)if(p.own===me&&p.tag==='mine')p.life=0;SFX.move();spawnProj(me,{tag:'mine',kind:'mine',x:me.x+me.face*6,y:me.y-3,vx:0,vy:0,g:.2*VS,life:900,w:7,h:5,dmg:Math.round(o.dmg*PW(me)),kb:3,kg:1,ang:78,mine:1,arm:30,explode:1})}}});
SPK.dspin=(o)=>({pose:'dtilt',len:34,grav:.6,spin:1,
  tick(me,m){me.vx=lerp(me.vx,hold(me).h*1,.15)},
  boxes(me,m){if(m.f>=3&&m.f<26&&m.f%6===3)return[{x:0,y:-5,w:28,h:10,dmg:Math.round(o.dmg*PW(me)),kb:1,kg:.1,ang:40,radial:1,rehit:1}];if(m.f>=26&&m.f<30)return[{x:0,y:-6,w:30,h:12,dmg:5,kb:2.8,kg:.9,ang:35,radial:1,rehit:1}];return[]}});
SPK.quake=(o)=>({pose:m=>m.f<12?'charge':'slam',len:120,grav:1,
  tick(me,m){if(!me.ground&&!m.q){me.vy=Math.max(me.vy,5*VS);if(m.f>70)return false;return}
    if(!m.q){m.q=m.f;m.len=m.f+30}
    if(m.f-m.q===10){SFX.boom();G.shake=5;const d=Math.round(o.dmg*PW(me));for(const s of[-1,1])spawnProj(me,{tag:'wave',kind:'wave',x:me.x+s*8,y:me.y-5,vx:s*2.8,vy:0,g:0,life:30,w:12,h:11,dmg:d,kb:2.8,kg:.9,ang:70,hug:1})}},
  boxes(me,m){if(m.q&&m.f-m.q>=10&&m.f-m.q<13)return[{x:0,y:-4,w:22,h:9,dmg:6,kb:2.4,kg:.7,ang:75,radial:1}];return[]}});
/* the four specials of a fighter, made once */
function buildSpecials(ch){const out={};for(const k of['n','s','u','d']){const[kind,o]=ch.sp[k];const make=SPK[k==='u'&&kind==='rocket'?'rocket_up':k==='d'&&kind==='spin'?'dspin':kind];
    const m=make(o);m.id='sp_'+k;m.kind='special';m.slot=k;m.name=o.name;out[k]=m}return out}
