/* ================= moves =================
   Units are metres and frames (60 a second). Hit circles are placed from the fighter's feet: x forward, y up, r the
   radius. dmg is percent; kb is base knockback and kg knockback growth, in the classic platform-fighter formula;
   ang is the launch angle in degrees (0 = straight away, 90 = straight up, negative = down). */
const N0={
  jab1:{nm:'JAB',s:3,a:2,r:10,anim:{wind:'jabW',hit:'jab1'},hb:[{x:.55,y:1.28,r:.3,dmg:2.5,kb:22,kg:25,ang:75}],next:'jab2',light:1},
  jab2:{nm:'JAB',s:3,a:2,r:12,anim:{wind:'jab1',hit:'jab2'},hb:[{x:.6,y:1.22,r:.3,dmg:2.5,kb:22,kg:25,ang:75}],next:'jab3',light:1},
  jab3:{nm:'JAB FINISH',s:5,a:3,r:20,anim:{wind:'jab3W',hit:'jab3'},hb:[{x:.78,y:1.02,r:.38,dmg:5,kb:48,kg:85,ang:40}],light:1},
  ftilt:{nm:'SIDE ATTACK',s:6,a:3,r:19,anim:{wind:'ftiltW',hit:'ftilt'},hb:[{x:.88,y:1.12,r:.4,dmg:9,kb:30,kg:95,ang:35}],light:1},
  utilt:{nm:'UP ATTACK',s:5,a:5,r:18,anim:{wind:'utiltW',hit:'utilt'},hb:[{x:.25,y:2.0,r:.48,dmg:7,kb:36,kg:112,ang:88}],light:1},
  dtilt:{nm:'LOW SWEEP',s:5,a:3,r:15,anim:{wind:'dtiltW',hit:'dtilt'},hb:[{x:.85,y:.25,r:.38,dmg:6,kb:22,kg:62,ang:80}],light:1},
  dash:{nm:'DASH ATTACK',s:6,a:8,r:22,anim:{wind:'dashA',hit:'dashA'},hb:[{x:.65,y:.95,r:.48,dmg:9,kb:46,kg:80,ang:50}],dashy:1},
  fsmash:{nm:'SIDE SMASH',s:15,a:3,r:32,anim:{wind:'fsmashW',hit:'fsmash'},hb:[{x:1.0,y:1.12,r:.5,dmg:15,kb:36,kg:104,ang:38}],smash:1,chargeAt:9},
  usmash:{nm:'UP SMASH',s:11,a:5,r:32,anim:{wind:'usmashW',hit:'usmash'},hb:[{x:.15,y:2.25,r:.58,dmg:14,kb:38,kg:100,ang:88}],smash:1,chargeAt:6},
  dsmash:{nm:'DOWN SMASH',s:9,a:4,r:32,anim:{wind:'dsmashW',hit:'dsmash'},hb:[{x:.85,y:.3,r:.46,dmg:13,kb:32,kg:98,ang:30},{x:-.85,y:.3,r:.46,dmg:13,kb:32,kg:98,ang:30,back:1}],smash:1,chargeAt:5},
  nair:{nm:'NEUTRAL AIR',s:4,a:10,r:14,anim:{wind:'nair',hit:'nair'},hb:[{x:.1,y:1.0,r:.72,dmg:8,kb:22,kg:90,ang:45,radial:1}],air:1,land:7},
  fair:{nm:'FORWARD AIR',s:8,a:3,r:18,anim:{wind:'fairW',hit:'fair'},hb:[{x:.88,y:.92,r:.44,dmg:11,kb:30,kg:95,ang:40}],air:1,land:10},
  bair:{nm:'BACK AIR',s:7,a:3,r:16,anim:{wind:'fairW',hit:'bair'},hb:[{x:-.92,y:.95,r:.44,dmg:12,kb:30,kg:100,ang:36,back:1}],air:1,land:10},
  uair:{nm:'UP AIR',s:5,a:4,r:15,anim:{wind:'uairW',hit:'uair'},hb:[{x:.1,y:2.1,r:.52,dmg:8,kb:30,kg:100,ang:86}],air:1,land:7},
  dair:{nm:'DOWN AIR',s:10,a:4,r:20,anim:{wind:'dairW',hit:'dair'},hb:[{x:.1,y:-.05,r:.46,dmg:12,kb:26,kg:85,ang:-72}],air:1,land:14},
  grab:{nm:'GRAB',s:6,a:2,r:24,anim:{wind:'grab',hit:'grab'},hb:[{x:.62,y:1.05,r:.42,grab:1}]},
  ledge:{nm:'LEDGE ATTACK',s:12,a:4,r:20,anim:{wind:'climb',hit:'ftilt'},hb:[{x:.7,y:.8,r:.55,dmg:8,kb:60,kg:20,ang:40}]},
};
const THROWS={
  f:{nm:'FORWARD THROW',dmg:8,kb:62,kg:70,ang:40,anim:'throwF'},
  b:{nm:'BACK THROW',dmg:10,kb:60,kg:78,ang:40,back:1,anim:'throwB'},
  u:{nm:'UP THROW',dmg:7,kb:72,kg:80,ang:90,anim:'throwU'},
  d:{nm:'DOWN THROW',dmg:6,kb:72,kg:40,ang:76,anim:'throwD'}};
/* fighting styles change the A attacks: weapon fighters swing their blade or staff, heavy fighters hit harder and
   later, quick ones hit lighter and sooner */
const WEAPON_ANIM={ftilt:{wind:'slashW',hit:'slash'},fsmash:{wind:'slashW',hit:'thrust'},utilt:{wind:'utiltW',hit:'upslash'},usmash:{wind:'usmashW',hit:'upslash'},
  dtilt:{wind:'dtiltW',hit:'lowslash'},fair:{wind:'slashW',hit:'slash'},dash:{wind:'slashW',hit:'thrust'},jab3:{wind:'slashW',hit:'slash'}};
const STY={
  martial:{dmg:1,s:0,r:1,kb:1,kg:1,reach:0},
  quick:{dmg:.82,s:-1,r:.82,kb:.95,kg:.92,reach:-.02},
  heavy:{dmg:1.24,s:2,r:1.2,kb:1.06,kg:1.0,reach:.08},
  sword:{dmg:1.08,s:1,r:1.05,kb:1,kg:1,reach:.5,weapon:1},
  staff:{dmg:1,s:1,r:1,kb:1,kg:1,reach:.55,weapon:1},
  boxer:{dmg:1.05,s:-1,r:.9,kb:1,kg:1,reach:.05}};
function buildNormals(ch){const st=STY[ch.style],out={},z=ch.look.h||1;
  for(const k in N0){const n=N0[k],weapon=st.weapon&&WEAPON_ANIM[k];
    const m={id:k,kind:'normal',nm:n.nm,s:Math.max(2,n.s+st.s),a:n.a,r:Math.round(n.r*st.r),air:!!n.air,land:n.land||0,next:n.next,dashy:n.dashy,smash:n.smash,chargeAt:n.chargeAt,light:n.light,
      anim:weapon?WEAPON_ANIM[k]:(ch.style==='boxer'&&(k==='jab3'||k==='dtilt'||k==='fair')?{wind:'ftiltW',hit:k==='dtilt'?'palm':'ftilt'}:n.anim),weaponFx:!!weapon,
      hb:n.hb.map(b=>b.grab?Object.assign({},b):Object.assign({},b,{x:(b.x+(Math.abs(b.x)>.3?sgn(b.x)*(weapon?st.reach:st.reach*.3):0))*z,y:b.y*z,r:b.r*(weapon?1.1:1)*(st.reach>.05&&!weapon?1.06:1),
        dmg:Math.round(b.dmg*st.dmg*2)/2,kb:b.kb*st.kb,kg:b.kg*st.kg}))};
    m.len=m.s+m.a+m.r;out[k]=m}
  if(ch.normals)for(const k in ch.normals)Object.assign(out[k],ch.normals[k]);
  return out}
/* ---------- special moves ----------
   Each kind makes a move from the options in the roster. Hooks (all optional):
   tick(me,m)   every frame: movement, spawning; return false to end the move
   boxes(me,m)  the hit circles this frame        grav: gravity multiplier while it runs
   landEnds     landing ends it (with land frames of lag)   helpless: ends in a helpless fall (B + up)
   anim         {wind,hit,end} over s/a/len, or fn(m,out) for its own motion */
const SP={};
const PWR=me=>me.ch.pw||1;
const D=(o,k,v)=>o[k]!=null?o[k]:v;
function dir8(me){const x=me.pad.x,y=me.pad.y;if(Math.hypot(x,y)<.35)return null;return Math.atan2(y,x)}
/* B: projectiles and the like */
SP.shot=o=>({s:12,a:2,len:32,grav:.6,anim:{wind:'castW',hit:'cast'},
  tick(me,m){if(m.f===12){if(me.projCount('shot')>=D(o,'max',2))return;SFX.shoot();
    for(let i=0;i<D(o,'n',1);i++)spawnProj(me,{tag:'shot',kind:o.kind||'ki',x:me.x+me.face*.7,y:me.y+1.15+(i-(D(o,'n',1)-1)/2)*.18,vx:me.face*D(o,'v',.24)*(1-i*.04),vy:(i-(D(o,'n',1)-1)/2)*.012,life:D(o,'life',70),r:D(o,'r',.24),dmg:o.dmg,kb:D(o,'kb',20),kg:D(o,'kg',40),ang:D(o,'ang',35),col:o.col||me.ch.fx})}}});
SP.chargeshot=o=>({len:999,grav:.5,anim:{fn:(m,out)=>mixPose(POSE.castW,POSE.cast,m.fire?1:0,out)},
  tick(me,m){if(!m.fire){m.c=Math.min(60,(m.c||0)+1);if(m.c===1)SFX.charge();if(!me.pad.held.special||m.c>=60||m.f>150){m.fire=m.f;const c=m.c/60;SFX.shoot();if(c>.9)SFX.boom();
        spawnProj(me,{tag:'shot',kind:'ki',x:me.x+me.face*.75,y:me.y+1.15,vx:me.face*(.18+c*.12),vy:0,life:90,r:.18+c*.32,dmg:Math.round(4+c*16),kb:20+c*30,kg:40+c*50,ang:36,col:o.col||me.ch.fx})}}
    else if(m.f-m.fire>18)return false},
  aura(me,m){return m.fire?null:{r:.12+(m.c||0)/60*.3}}});
/* a charged blow: hold B to wind up longer (up to 1 second) for a stronger hit */
SP.chargeblow=o=>({len:999,grav:.5,anim:{fn:(m,out)=>m.go?mixPose(POSE[o.wind||'chargeW'],POSE[o.hit||'punch'],clamp((m.f-m.go)/4,0,1),out):mixPose(POSE.stance,POSE[o.wind||'chargeW'],clamp(m.f/8,0,1),out)},
  tick(me,m){if(!m.go){m.c=Math.min(60,(m.c||0)+1);if(m.c===8)SFX.charge();if(m.f<10&&me.pad.x*me.face<-.5)me.face*=-1;if((!me.pad.held.special&&m.f>=12)||m.c>=60){m.go=m.f;SFX.swing(2);me.vx=me.face*D(o,'lunge',.1)}}
    else{me.vx*=.9;if(m.f-m.go>D(o,'rec',30))return false}},
  boxes(me,m){if(m.go&&m.f-m.go>=2&&m.f-m.go<7){const c=(m.c||0)/60;return[{x:D(o,'x',1.0),y:D(o,'y',1.12),r:D(o,'r',.55),dmg:Math.round(o.dmg*(1+c*.4)*PWR(me)),kb:D(o,'kb',40)*(1+c*.25),kg:D(o,'kg',100),ang:D(o,'ang',36),heavy:1}]}return[]},
  aura(me,m){return m.go?null:{r:.1+(m.c||0)/60*.25,front:1}}});
SP.spin=o=>({len:D(o,'len',40),grav:.3,spin:1,anim:{wind:o.pose||'nair',hit:o.pose||'nair'},s:2,a:36,
  tick(me,m){me.vx=lerp(me.vx,me.pad.x*D(o,'drift',.07),.15);if(!me.ground&&me.vy<-.02)me.vy*=.9;if(m.f%8===1)SFX.swing(0)},
  boxes(me,m){if(m.f>=3&&m.f<32&&m.f%5===3)return[{x:0,y:1.0,r:D(o,'r',.85),dmg:o.dmg,kb:12,kg:8,ang:78,radial:1,rehit:1}];if(m.f>=32&&m.f<36)return[{x:0,y:1.0,r:D(o,'r',.85)+.1,dmg:D(o,'fin',5),kb:46,kg:95,ang:42,radial:1,rehit:1}];return[]},
  reflect:o.reflect});
/* B + side */
SP.lunge=o=>({s:D(o,'s',8),a:D(o,'a',12),len:D(o,'len',38),grav:0,anim:{wind:o.wind||'chargeW',hit:o.pose||'thrust'},
  tick(me,m){const s=D(o,'s',8),a=D(o,'a',12);if(m.f===s){m.go=me.sideOK();SFX.dash();if(o.armor)me.armor=a}if(m.f>=s&&m.f<s+a&&!m.stop){me.vx=me.face*(m.go?D(o,'v',.26):.08);me.vy=0}else if(m.f>=s+a){me.vx*=.85;m.grav=1}else{me.vx*=.8;me.vy*=.6}
    if(m.f>=s&&m.f%3===0)fxTrail(me)},
  boxes(me,m){const s=D(o,'s',8),a=D(o,'a',12);if(m.f>=s&&m.f<s+a&&!m.stop)return[{x:D(o,'x',.75),y:D(o,'y',1.05),r:D(o,'r',.5),dmg:Math.round(o.dmg*PWR(me)),kb:D(o,'kb',40),kg:D(o,'kg',90),ang:D(o,'ang',38)}];return[]},
  onHit(me,m){if(!o.through){m.stop=1;me.vx=-me.face*.04}}});
SP.spinkick=o=>({len:44,grav:.15,spin:1,anim:{wind:'spinkick',hit:'spinkick'},s:4,a:30,
  tick(me,m){if(m.f===4){m.go=me.sideOK();if(!me.ground&&m.go)me.vy=.05}if(m.f>=4&&m.f<34)me.vx=me.face*(m.go?.14:.05);else me.vx*=.85;if(m.f%7===4)SFX.swing(1)},
  boxes(me,m){if(m.f>=4&&m.f<30&&m.f%6===4)return[{x:.2,y:1.05,r:.75,dmg:o.dmg,kb:16,kg:10,ang:60,radial:1,rehit:1}];if(m.f>=30&&m.f<34)return[{x:.2,y:1.05,r:.8,dmg:D(o,'fin',6),kb:48,kg:92,ang:40,radial:1,rehit:1}];return[]}});
SP.cgrab=o=>({len:44,grav:.6,anim:{fn:(m,out)=>mixPose(POSE.grab,m.thrown?POSE[o.throwPose||'throwB']:m.held?POSE.hold:POSE.grab,m.thrown?1:.5,out)},
  tick(me,m){if(!m.held){if(m.f>=6&&m.f<16)me.vx=me.face*D(o,'v',.2);else me.vx*=.75}
    else{const v=m.victim,d=m.f-m.held;if(!v||v.st!=='held'||v.holder!==me)return false;v.x=me.x+me.face*.7;v.y=me.y+(d>14?.6:.2);
      if(d===8||d===16){v.pct+=2;v.flash=6;SFX.hit(0)}
      if(d===24){m.thrown=1;const back=o.back!==false;if(back)me.face*=-1;v.x=me.x+me.face*.6;launch(me,v,{dmg:Math.round(o.dmg*PWR(me)),kb:46,kg:80,ang:42},me.face,true);SFX.boom();G.shake=.25}
      if(d>40)return false}},
  boxes(me,m){if(!m.held&&m.f>=6&&m.f<16)return[{x:.7,y:1.05,r:.5,grab:1}];return[]},
  onGrab(me,m,v){m.held=m.f;m.victim=v;m.len=m.f+44;holdVictim(me,v)}});
SP.teleStrike=o=>({len:34,grav:0,anim:{wind:'crouch',hit:o.pose||'ftilt'},s:10,a:4,
  tick(me,m){if(m.f===1){me.inv=Math.max(me.inv,12);m.hide=1;SFX.dash();fxPoof(me)}if(m.f<10){me.vx=0;me.vy=0}
    if(m.f===10){m.hide=0;const go=me.sideOK();let d=go?3.2:1.2;for(const f of G.fighters){const dx=(f.x-me.x)*me.face;if(f!==me&&!f.dead&&dx>0&&dx<d+.6&&Math.abs(f.y-me.y)<1.6)d=Math.min(d,dx+.75)}
      me.x+=me.face*d;me.face*=-1;fxPoof(me)}if(m.f===22)m.grav=1},
  boxes(me,m){if(m.f>=10&&m.f<14)return[{x:.55,y:1.1,r:.6,dmg:Math.round(o.dmg*PWR(me)),kb:42,kg:88,ang:45}];return[]},hidden:m=>m.hide});
SP.whip=o=>({s:11,a:5,len:36,grav:.5,anim:{wind:'castW',hit:'thrust'},
  boxes(me,m){if(m.f>=11&&m.f<16){const d=Math.round(o.dmg*PWR(me));return[{x:1.1,y:1.12,r:.32,dmg:d-2,kb:30,kg:80,ang:34},{x:1.9,y:1.12,r:.32,dmg:d-1,kb:32,kg:85,ang:34},{x:2.65,y:1.12,r:.38,dmg:d+2,kb:40,kg:100,ang:36}]}return[]},
  draw(me,m){return m.f>=9&&m.f<18?{beam:2.8*Math.min(1,(m.f-8)/3)}:null}});
SP.flurry=o=>({len:46,grav:.5,anim:{fn:(m,out)=>mixPose(POSE.jab1,POSE.jab2,(Math.floor(m.f/3)%2),out)},
  tick(me,m){me.vx*=.8;if(m.f%3===0&&m.f<30)SFX.swing(0)},
  boxes(me,m){if(m.f>=4&&m.f<30&&m.f%4===0)return[{x:.7,y:1.2,r:.42,dmg:1.5,kb:10,kg:6,ang:20,rehit:1}];if(m.f>=32&&m.f<36)return[{x:.8,y:1.15,r:.5,dmg:Math.round(o.dmg*PWR(me)),kb:52,kg:95,ang:40,rehit:1}];return[]}});
/* B + up: the way back to the stage */
SP.uppercut=o=>({len:36,grav:0,helpless:1,anim:{wind:'utiltW',hit:'rise'},s:3,a:20,
  tick(me,m){if(m.f===3){m.go=me.upOK();me.vy=m.go?D(o,'v',.36):.12;me.ground=null;SFX.jump();me.vx=me.face*.03+me.pad.x*.03}
    if(m.f>3){me.vy-=.016;me.vx=lerp(me.vx,me.pad.x*.06,.08)}if(m.f%3===0)fxTrail(me)},
  boxes(me,m){if(m.f>=3&&m.f<6)return[{x:.35,y:1.3,r:.5,dmg:Math.round(D(o,'sweet',12)*PWR(me)),kb:40,kg:90,ang:80}];if(m.f>=6&&m.f<18&&m.f%4===2)return[{x:.25,y:1.6,r:.5,dmg:2,kb:14,kg:10,ang:85,rehit:1}];return[]}});
SP.copter=o=>({len:48,grav:0,helpless:1,spin:1,anim:{wind:o.pose||'nair',hit:o.pose||'nair'},s:2,a:40,
  tick(me,m){if(m.f===1){m.go=me.upOK();me.ground=null;SFX.jump()}me.vy=m.f<40?(m.go?D(o,'v',.12):.03):me.vy;me.vx=lerp(me.vx,me.pad.x*.09,.15);if(m.f%6===1)SFX.swing(1)},
  boxes(me,m){if(m.f>=2&&m.f<38&&m.f%6===2)return[{x:0,y:1.1,r:.85,dmg:o.dmg,kb:14,kg:8,ang:82,radial:1,rehit:1}];if(m.f>=38&&m.f<42)return[{x:0,y:1.2,r:.9,dmg:6,kb:46,kg:88,ang:72,radial:1,rehit:1}];return[]}});
SP.teleport=o=>({len:30,grav:0,helpless:1,anim:{wind:'crouch',hit:'fall'},s:14,a:2,
  tick(me,m){if(m.f===1){me.inv=Math.max(me.inv,16);m.hide=1;SFX.dash();fxPoof(me);m.go=me.upOK()}if(m.f<14){me.vx=0;me.vy=0}
    if(m.f===14){m.hide=0;let a=dir8(me);if(a==null||a<-.2&&a>-Math.PI+.2)a=Math.PI/2;const d=m.go?D(o,'d',4.4):1.2;me.x+=Math.cos(a)*d;me.y+=Math.sin(a)*d;me.ground=null;fxPoof(me);me.vy=.02}},
  hidden:m=>m.hide});
SP.leap=o=>({len:40,grav:.7,helpless:1,anim:{wind:'jsq',hit:o.pose||'usmash'},s:6,a:10,
  tick(me,m){if(m.f===6){m.go=me.upOK();me.vy=m.go?D(o,'v',.42):.14;me.vx=me.pad.x*.08;me.ground=null;SFX.djump();fxDust(me,6)}},
  boxes(me,m){if(m.f>=6&&m.f<14)return[{x:.1,y:2.0,r:.6,dmg:Math.round(o.dmg*PWR(me)),kb:44,kg:92,ang:84}];return[]}});
SP.handspring=o=>({len:34,grav:.6,anim:{wind:'jsq',hit:'flipkick'},s:3,a:16,rot:1,
  tick(me,m){if(m.f===3){m.go=me.upOK();me.vy=m.go?D(o,'v',.36):.12;me.vx=me.face*.05+me.pad.x*.04;me.ground=null;SFX.djump();me.jumps=0}},
  boxes(me,m){if(m.f>=3&&m.f<16&&m.f%4===3)return[{x:.3,y:1.2,r:.6,dmg:o.dmg,kb:24,kg:30,ang:80,rehit:1}];if(m.f>=16&&m.f<20)return[{x:.3,y:1.4,r:.62,dmg:5,kb:44,kg:90,ang:75,rehit:1}];return[]}});
/* B + down */
SP.counter=o=>({len:46,grav:.4,anim:{wind:'counter',hit:'counter'},s:2,a:30,
  tick(me,m){m.window=m.f>=4&&m.f<26&&!m.done},glow(me,m){return m.window}});
SP.pound=o=>({len:120,grav:0,landEnds:1,land:16,anim:{wind:o.wind||'dairW',hit:o.pose||'dair'},s:10,a:100,
  tick(me,m){if(m.f===1&&me.ground){me.vy=.16;me.ground=null}if(m.f<10){me.vy*=.85;me.vx*=.8}else{me.vy=-D(o,'v',.42);me.vx*=.9}if(m.f>=80)return false},
  boxes(me,m){if(m.f>=10)return[{x:0,y:.2,r:.55,dmg:Math.round(o.dmg*PWR(me)),kb:30,kg:85,ang:-70,spikeAir:1}];return[]},
  onLand(me,m){SFX.boom();G.shake=.3;fxShock(me.x,me.y,me.ch.fx);addBoxFx(me,[{x:-.9,y:.3,r:.6,dmg:6,kb:46,kg:60,ang:65,back:1},{x:.9,y:.3,r:.6,dmg:6,kb:46,kg:60,ang:65}],4)}});
SP.quake=o=>({len:120,grav:1,anim:{wind:'chargeW',hit:'slam'},s:14,a:4,
  tick(me,m){if(!me.ground&&!m.q){me.vy=Math.min(me.vy,-.3);if(m.f>70)return false;m.f=Math.min(m.f,10);return}
    if(!m.q){m.q=m.f;m.len=m.f+34}
    if(m.f-m.q===10){SFX.boom();G.shake=.35;fxShock(me.x,me.y,me.ch.fx);for(const s of[-1,1])spawnProj(me,{tag:'wave',kind:'wave',x:me.x+s*.6,y:me.y+.35,vx:s*.2,vy:0,life:34,r:.42,dmg:Math.round(o.dmg*PWR(me)),kb:44,kg:85,ang:70,hug:1,col:me.ch.fx})}},
  boxes(me,m){if(m.q&&m.f-m.q>=10&&m.f-m.q<13)return[{x:0,y:.3,r:1.0,dmg:7,kb:40,kg:60,ang:75,radial:1}];return[]}});
SP.slide=o=>({s:6,a:16,len:40,grav:1,anim:{wind:'crouch',hit:'dtilt'},
  tick(me,m){if(m.f===6){SFX.dash();me.vx=me.face*(me.ground?.24:.1)}if(m.f>6)me.vx*=me.ground?.95:.98;if(m.f%3===0&&me.ground)fxDust(me,1)},
  boxes(me,m){if(m.f>=6&&m.f<22)return[{x:.7,y:.25,r:.48,dmg:Math.round(o.dmg*PWR(me)),kb:44,kg:70,ang:80}];return[]}});
SP.mine=o=>({len:26,grav:.8,anim:{wind:'crouch',hit:'crouch'},
  tick(me,m){if(m.f===8){for(const p of G.proj)if(p.own===me&&p.tag==='mine')p.life=0;SFX.move();spawnProj(me,{tag:'mine',kind:'mine',x:me.x+me.face*.45,y:me.y+.12,vx:0,vy:0,g:.012,life:900,r:.22,dmg:Math.round(o.dmg*PWR(me)),kb:50,kg:90,ang:80,mine:1,arm:30,explode:1,col:me.ch.fx})}}});
SP.palm=o=>({s:5,a:16,len:34,grav:.4,anim:{wind:'castW',hit:'palm'},
  tick(me,m){m.reflect=m.f>=4&&m.f<22;if(m.f===5)SFX.swing(1)},
  boxes(me,m){if(m.f>=5&&m.f<9)return[{x:.8,y:1.15,r:.55,dmg:Math.round(o.dmg*PWR(me)),kb:52,kg:70,ang:30}];return[]},glow(me,m){return m.reflect}});
SP.axe=o=>({s:13,a:4,len:40,grav:.6,anim:{wind:'utilt',hit:'dsmash'},
  tick(me,m){if(m.f===4&&me.ground){me.vy=.08;me.ground=null}},
  boxes(me,m){if(m.f>=13&&m.f<17)return[{x:.7,y:.7,r:.55,dmg:Math.round(o.dmg*PWR(me)),kb:34,kg:90,ang:-60,spikeAir:1}];return[]}});
/* the four specials of a fighter, made once; each knows its name and how to describe it in the moves list */
function buildSpecials(ch){const out={};for(const k of['n','s','u','d']){const[kind,o]=ch.sp[k];const m=SP[kind](o);m.id='sp_'+k;m.kind='special';m.slot=k;m.nm=o.name;m.desc=o.desc;m.len=m.len||40;m.opts=o;out[k]=m}return out}
