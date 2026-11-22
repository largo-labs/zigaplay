/* ================= moves =================
   Frames are 1/60 s. A hitbox is [x forward, y (up is minus), radius, damage, base knockback, knockback growth, angle].
   Angle 0 sends the target straight ahead, 90 straight up, 180 straight back, minus angles send them down (a spike).
   Knockback growth 0 is a combo hit: a set, small push that keeps the target close.
   Each group has the same set of A attacks: neutral (a three-hit string), forward, back, up and down, plus five in the air. */
const SHOT={pistol:{k:'bullet',v:1,d:1,r:1},rifle:{k:'bullet',v:1.35,d:1.1,r:.9},cannon:{k:'shell',v:.85,d:1.25,r:1.5},blaster:{k:'laser',v:1.1,d:1,r:1},
  energy:{k:'energy',v:.9,d:1.05,r:1.3},grenade:{k:'pellet',v:.85,d:1.1,r:1.2}};
const NMC={
  C:{/* close range: fists and feet, the fastest strings */
    jab1:{s:2,a:2,r:7,b:[[13,-26,6,2.5,10,0,40]],chain:'jab2',pose:'jab'},
    jab2:{s:2,a:2,r:7,b:[[14,-26,6,2.5,10,0,40]],chain:'jab3',pose:'cross'},
    jab3:{s:3,a:3,r:13,b:[[15,-21,8,5,32,70,40]],pose:'knee'},
    fwd:{s:4,a:3,r:12,b:[[16,-25,7,8,30,90,38]],pose:'straight',step:1.6},
    back:{s:5,a:3,r:12,b:[[-15,-26,8,9,32,95,145]],pose:'backfist'},
    up:{s:3,a:4,r:12,b:[[7,-40,8,7,38,55,88],[11,-27,7,6,38,55,86]],pose:'uppercut',pop:1},
    down:{s:3,a:3,r:9,b:[[13,-3,7,5,26,40,78]],pose:'lowkick',pop:1},
    dash:{s:4,a:6,r:14,b:[[14,-20,9,8,34,70,50]],pose:'dashk',slide:1},
    nair:{s:3,a:8,r:9,b:[[0,-20,11,6,26,60,45]],pose:'nair',air:1,land:5,radial:1},
    fair:{s:4,a:3,r:12,b:[[15,-24,8,8,30,85,40]],pose:'fairP',air:1,land:6},
    bair:{s:5,a:3,r:13,b:[[-15,-19,8,10,32,95,145]],pose:'bairK',air:1,land:7},
    uair:{s:3,a:4,r:11,b:[[2,-44,9,7,28,72,86]],pose:'uairK',air:1,land:5},
    dair:{s:6,a:4,r:14,b:[[2,2,8,10,26,80,-75]],pose:'dairK',air:1,land:10}},
  M:{/* medium range: swords, longer reach */
    jab1:{s:3,a:2,r:8,b:[[22,-25,8,3,10,0,40]],chain:'jab2',pose:'slash1',wpn:1},
    jab2:{s:3,a:2,r:8,b:[[22,-22,8,3,10,0,40]],chain:'jab3',pose:'slash2',wpn:1},
    jab3:{s:4,a:3,r:14,b:[[27,-23,9,6,32,72,40]],pose:'thrust',wpn:1},
    fwd:{s:6,a:4,r:15,b:[[29,-24,8,10,30,95,36],[16,-24,8,8,28,85,38]],pose:'lunge',step:2.4,wpn:1},
    back:{s:6,a:4,r:14,b:[[-25,-22,10,10,30,92,145]],pose:'backslash',wpn:1},
    up:{s:5,a:5,r:14,b:[[4,-48,11,8,38,58,88],[17,-36,9,7,38,58,84]],pose:'upslash',wpn:1,pop:1},
    down:{s:4,a:3,r:11,b:[[23,-4,8,6,26,42,76]],pose:'lowslash',wpn:1,pop:1},
    dash:{s:5,a:6,r:15,b:[[21,-20,10,9,34,72,48]],pose:'dashslash',slide:1,wpn:1},
    nair:{s:4,a:8,r:10,b:[[0,-20,17,7,26,65,45]],pose:'spinslash',air:1,land:6,radial:1,wpn:1},
    fair:{s:5,a:4,r:13,b:[[23,-22,10,9,30,88,40]],pose:'overhead',air:1,land:8,wpn:1},
    bair:{s:6,a:4,r:14,b:[[-23,-20,10,11,32,95,145]],pose:'backslashA',air:1,land:8,wpn:1},
    uair:{s:4,a:5,r:12,b:[[2,-50,11,8,28,76,86]],pose:'arcUp',air:1,land:6,wpn:1},
    dair:{s:7,a:5,r:16,b:[[2,10,8,11,28,80,-78]],pose:'stab',air:1,land:12,wpn:1}},
  L:{/* long range: shots from guns and blasts of energy, kicks up close */
    jab1:{s:3,a:1,r:10,b:[],shot:{x:16,y:-27,vx:9.5,vy:0,r:2.6,d:3,kb:10,kg:22,ang:20,life:26},chain:'jab1',ca:8,pose:'aim'},
    fwd:{s:8,a:1,r:16,b:[],shot:{x:17,y:-27,vx:7,vy:0,r:5.5,d:9,kb:32,kg:80,ang:35,life:40,big:1},pose:'aimHeavy',recoil:1.6},
    back:{s:5,a:3,r:12,b:[[-14,-18,8,8,32,90,145]],pose:'backkick'},
    up:{s:5,a:1,r:12,b:[[4,-40,7,4,20,40,85]],shot:{x:3,y:-42,vx:0,vy:-8.5,r:4,d:6,kb:30,kg:70,ang:86,life:24},pose:'aimUp'},
    down:{s:4,a:3,r:10,b:[[13,-3,7,5,24,50,72]],pose:'lowkick'},
    dash:{s:4,a:6,r:15,b:[[14,-14,9,7,32,65,50]],pose:'dashk',slide:1},
    nair:{s:3,a:8,r:10,b:[[0,-20,11,6,26,60,45]],pose:'nair',air:1,land:5,radial:1},
    fair:{s:5,a:1,r:12,b:[],shot:{x:16,y:-26,vx:9,vy:0,r:3,d:5,kb:22,kg:60,ang:30,life:28},pose:'aim',air:1,land:7},
    bair:{s:5,a:3,r:13,b:[[-15,-19,8,10,32,95,145]],pose:'bairK',air:1,land:7},
    uair:{s:4,a:1,r:11,b:[],shot:{x:2,y:-44,vx:0,vy:-9,r:3.4,d:5,kb:26,kg:65,ang:88,life:24},pose:'aimUp',air:1,land:6},
    dair:{s:6,a:1,r:14,b:[],shot:{x:0,y:2,vx:0,vy:9,r:3.6,d:7,kb:26,kg:75,ang:-70,life:22},pose:'aimDown',air:1,land:9,hop:3}}};
/* small differences between weapons of one group: extra reach, bigger hitboxes, more knockback */
const WEAP={none:{reach:0,big:1},sword:{reach:0,big:1.05},katana:{reach:2,big:1},broadsword:{reach:2,big:1.1,kg:1.04},rapier:{reach:4,big:.9},dual:{reach:-2,big:1.05},
  greatsword:{reach:5,big:1.15,kg:1.08},scimitar:{reach:1,big:1.05},gloves:{reach:0,big:1.05},wraps:{reach:0,big:1},gauntlets:{reach:0,big:1.05,kg:1.05},claws:{reach:2,big:1},
  bare:{reach:0,big:1},knuckles:{reach:0,big:1,kg:1.04}};
const GRAB={s:5,a:2,r:22,b:[[13,-22,9,0,0,0,0]],pose:'grab',grab:1};
for(const g in NMC)NMC[g].grab=GRAB;
const THROW={f:[8,42,72,40],b:[9,44,76,140],u:[7,46,70,90]};

/* ---------- the special moves: one function per kind. m.t counts frames from 0; return true when the move is over.
   m.help = fall helpless afterwards. Helpers come from fight.js and combat.js. ---------- */
const pdir=f=>{const p=f.pad;let x=p.x,y=p.up?-1:p.down?1:0;if(!x&&!y)y=-1;const l=Math.hypot(x,y);return[x/l,y/l]};
const shotKind=f=>(SHOT[f.c.weapon]||SHOT.energy).k;
const SP={
  /* ===== long range: up ===== */
  jetpack(f,m){if(m.t<6){f.vx*=.7;f.vy=Math.min(f.vy,0);return}if(m.t===6)SFX.jet();
    if(m.t<34){f.vy=Math.max(f.vy-1.15,-7.2);f.vx+=clamp(f.pad.x*3.2-f.vx,-.5,.5);if(m.t%2)smoke(f.x-f.face*3,f.y+2,f.c.fx,1);if(m.t%4===0)hit(f,m,'j'+m.t,0,4,9,2,6,0,-90);return}
    m.help=1;return true},
  recoil(f,m){if(m.t<7){f.vx*=.6;f.vy=Math.min(f.vy,.5);return}if(m.t===7){f.vy=-13;f.vx=f.pad.x*2.4;boomFx(f.x,f.y+4,24);hit(f,m,'b',0,6,22,9,40,70,-60,{radial:1})}
    if(m.t>=22){m.help=1;return true}},
  warp(f,m){if(m.t<10){f.vx=0;f.vy=0;f.inv=Math.max(f.inv,4);f.hide=1;return}
    if(m.t===10){const d=pdir(f);f.x+=d[0]*92;f.y+=d[1]*92;f.hide=0;if(d[0])f.face=sgn(d[0]);ringFx(f.x,f.y-18,f.c.fx,26);SFX.special();f.vy=-2}
    if(m.t<14){f.inv=Math.max(f.inv,2);hit(f,m,'w',0,-18,14,6,30,60,70,{radial:1})}if(m.t>=20){m.help=1;return true}},
  hover(f,m){if(m.t%12===0&&m.t<36){f.vy=-7;f.vx=f.pad.x*3;SFX.jet();for(let i=0;i<4;i++)smoke(f.x,f.y+2,f.c.fx,1)}if(m.t>=38){f.upUsed=1;f.jumps=0;return true}},
  /* ===== long range: side ===== */
  rocket(f,m){if(m.t<14){f.vx*=.7;if(!f.gr)f.vy=Math.min(f.vy,.4);return}if(m.t===14){proj(f,{x:16,y:-28,vx:f.face*5,vy:0,acc:.25,max:10,r:5,d:0,boom:{r:26,d:13,kb:45,kg:85},life:80,kind:'rocket'});f.vx-=f.face*2;SFX.rocket()}return m.t>=34},
  grenade(f,m){if(m.t===9){proj(f,{x:10,y:-30,vx:f.face*4.2,vy:-6,grav:.35,bounce:-3,fric:.8,r:5,d:0,boom:{r:26,d:12,kb:42,kg:80},life:55,fuse:1,kind:'grenade'});SFX.throw()}return m.t>=24},
  beam(f,m){if(m.t<14){f.vx*=.7;if(!f.gr)f.vy=Math.min(f.vy,.4);return}if(m.t===14){SFX.beam();shake(4)}
    if(m.t<20){for(let x=18;x<=176;x+=16)hit(f,m,'b',x,-27,8,11,35,85,30);if(!f.gr)f.vy=0}return m.t>=38},
  shotgun(f,m){if(m.t<10){f.vx*=.7;return}if(m.t===10){const fire=f.c.name==='BLAZE';for(const a of[-16,-8,0,8,16]){const r=a*Math.PI/180;
      proj(f,{x:18,y:-27,vx:f.face*8*Math.cos(r),vy:8*Math.sin(r),r:3,d:3,kb:14,kg:40,ang:30,life:12,kind:fire?'flame':'pellet'})}f.vx-=f.face*2.5;SFX.shotgun();shake(3)}
    if(m.t>=10&&m.t<13)hit(f,m,'s',20,-26,12,8,38,85,35);return m.t>=30},
  orb(f,m){if(m.t===10){proj(f,{x:16,y:-26,vx:f.face*3.6,vy:0,r:9,d:4,kb:20,kg:45,ang:40,life:70,pierce:1,rehit:10,kind:'orb'});SFX.orb()}return m.t>=26},
  snipe(f,m){if(m.t<22){f.vx*=.6;if(!f.gr)f.vy=Math.min(f.vy,.3);return}if(m.t===22){proj(f,{x:20,y:-27,vx:f.face*16,vy:0,r:3,d:14,kb:40,kg:95,ang:25,life:24,kind:'tracer'});f.vx-=f.face*2;SFX.snipe();shake(3)}return m.t>=40},
  burst(f,m){if(m.t===6||m.t===10||m.t===14){proj(f,{x:16,y:-27,vx:f.face*10,vy:(rnd()-.5)*.6,r:2.6,d:4,kb:14,kg:40,ang:30,life:24,kind:shotKind(f)});SFX.shot()}return m.t>=26},
  sticky(f,m){if(m.t===8){killOwn(f,'sticky');proj(f,{x:10,y:-28,vx:f.face*5,vy:-3.5,grav:.3,r:5,d:0,stick:1,glue:1,boom:{r:24,d:12,kb:45,kg:80},life:70,fuse:1,kind:'sticky'});SFX.throw()}return m.t>=24},
  /* ===== medium range: up ===== */
  risestab(f,m){if(m.t<4){f.vx*=.6;f.vy=Math.min(f.vy,0);return}if(m.t===4){f.vy=-12;f.vx=f.face*1.5;SFX.special()}
    if(m.t<12&&m.t%3===1)hit(f,m,'r'+m.t,6,-38,13,2,5,0,85);if(m.t===13)hit(f,m,'rf',6,-44,15,6,50,85,82);if(m.t>=24){m.help=1;return true}},
  spinup(f,m){f.vy=m.t<20?-7:-3;f.vx=f.pad.x*2.6;if(m.t<24&&m.t%4===0)hit(f,m,'s'+m.t,0,-22,18,2,5,0,90);if(m.t===26)hit(f,m,'sf',0,-24,20,4,45,80,70,{radial:1});
    if(m.t>=30){m.help=1;return true}},
  leap(f,m){if(m.t===0){f.vy=-13.5;f.vx=f.pad.x*2.2;SFX.djump();ringFx(f.x,f.y,f.c.fx,14);dust(f.x,f.y)}if(m.t>=3&&m.t<10)hit(f,m,'l',8,-36,12,6,34,60,80);
    if(m.t>=12){f.upUsed=1;f.jumps=0;return true}},
  hook(f,m){if(m.t<6){f.vx*=.7;f.vy*=.5;return}if(m.t===6){m.hx=f.x;m.hy=f.y-26;m.dx=f.face*.64;m.dy=-.77;SFX.shot()}
    if(m.t<20&&!m.zip){m.hx+=m.dx*9;m.hy+=m.dy*9;f.vy=Math.min(f.vy,1);hit(f,m,'h',m.hx,m.hy,9,6,22,40,40,{abs:1});
      const L=ledgeNear(m.hx,m.hy,18);if(L){m.zip=L;SFX.land()}}
    if(m.zip){const tx=m.zip.x+m.zip.side*7,ty=m.zip.y+28;f.vx=(tx-f.x)*.3;f.vy=(ty-f.y)*.3;m.hx=m.zip.x;m.hy=m.zip.y;if(Math.hypot(tx-f.x,ty-f.y)<8||m.t>40){grabLedge(f,m.zip);return true}return}
    if(m.t>=20){f.vy=-6;m.help=1;return true}},
  /* ===== medium range: side ===== */
  dash(f,m){if(m.t<4){f.vx*=.5;if(!f.gr)f.vy=0;return}if(m.t<18){f.vx=f.face*9;if(!f.gr)f.vy=0;hit(f,m,'d',16,-22,12,9,35,80,35);if(m.t%2)burst(f.x-f.face*8,f.y-16,f.c.fx,1,1);return}
    f.vx*=.8;return m.t>=30},
  wave(f,m){if(m.t===10){proj(f,{x:18,y:-24,vx:f.face*6.5,vy:0,r:9,d:8,kb:28,kg:70,ang:35,life:34,kind:'wave'});SFX.swing()}return m.t>=28},
  counter(f,m){f.vx*=.7;if(!f.gr)f.vy=Math.min(f.vy,1);f.counter=m.t>=4&&m.t<24&&!m.fired;if(m.fired){if(m.t-m.fired===2)hit(f,m,'c',20,-22,20,m.cd,50,90,40);return m.t-m.fired>=16}return m.t>=40},
  drill(f,m){if(m.t<5){f.vx*=.6;return}if(m.t<30){f.vx=f.face*2.6;if(!f.gr)f.vy=Math.min(f.vy,.6);if(m.t%3===2)hit(f,m,'d'+m.t,20,-24,12,1.5,6,0,20);return}
    if(m.t===30)hit(f,m,'df',22,-24,15,6,45,85,40);f.vx*=.7;return m.t>=42},
  dive(f,m){if(m.t<6){f.vx*=.5;f.vy=Math.min(f.vy,0);return}if(m.t===6){f.vy=-8;f.vx=f.face*4.2;f.gr=null;SFX.djump()}
    if(!m.landed){if(m.t>12){f.vy=Math.max(f.vy,4);hit(f,m,'f',14,-10,12,9,30,70,-60)}if(f.gr&&m.t>8){m.landed=m.t;f.vx=0;hit(f,m,'l',12,-6,24,11,42,80,60,{radial:1});boomFx(f.x+f.face*12,f.y,18);shake(5);SFX.boom()}
      if(m.t>60){m.help=1;return true}return}return m.t-m.landed>=14},
  whirl(f,m){f.vx=f.face*3.4;if(!f.gr)f.vy=Math.min(f.vy,1.2);if(m.t<30&&m.t%4===0)hit(f,m,'w'+m.t,4,-20,18,2,6,0,40);if(m.t===30)hit(f,m,'wf',4,-20,20,5,40,80,45,{radial:1});
    if(m.t>30)f.vx*=.6;return m.t>=40},
  /* ===== close range: up ===== */
  uppercut(f,m){if(m.t<4){f.inv=Math.max(f.inv,2);f.vx*=.5;return}if(m.t===4){f.vy=-11.5;f.vx=f.face*2;SFX.special()}
    if(m.t<8)hit(f,m,'u',10,-30,10,12,45,85,80);else if(m.t<14)hit(f,m,'u2',6,-38,9,5,30,60,85);if(m.t>=26){m.help=1;return true}},
  flameup(f,m){if(m.t<5){f.vx*=.6;f.vy=0;return}if(m.t===5){f.vy=-12.5;SFX.boom()}if(m.t<19){burst(f.x,f.y,f.c.fx,2,2.5);if(m.t%3===2)hit(f,m,'g'+m.t,0,-16,15,2,5,0,90)}
    if(m.t===20)hit(f,m,'gf',0,-30,17,6,50,85,85);if(m.t>=26){m.help=1;return true}},
  helikick(f,m){f.vy=m.t<22?-6.5:-2;f.vx=f.pad.x*3;if(m.t<26&&m.t%4===0)hit(f,m,'k'+m.t,0,-16,17,2,5,0,85);if(m.t===27)hit(f,m,'kf',0,-18,19,5,45,80,60,{radial:1});
    if(m.t>=30){m.help=1;return true}},
  leapup(f,m){if(m.t===0){f.vy=-14;f.vx=f.pad.x*2;SFX.djump();ringFx(f.x,f.y,f.c.fx,14);dust(f.x,f.y)}if(m.t<6)hit(f,m,'l',0,-2,12,7,35,60,80);
    if(m.t>=10){f.upUsed=1;f.jumps=0;return true}},
  /* ===== close range: side ===== */
  rush(f,m){f.armor=m.t<22?12:0;if(m.t<14){f.vx*=.6;if(!f.gr)f.vy=Math.min(f.vy,.5);if(m.t%3===0)burst(f.x-f.face*6,f.y-8,'#ffffff',1,1);return}
    if(m.t<30){f.vx=f.face*8;if(!f.gr)f.vy=Math.min(f.vy,1);hit(f,m,'c',14,-22,13,14,40,90,40);return}f.vx*=.7;return m.t>=40},
  grab(f,m){if(m.caught){const v=m.caught,k=m.t-m.ct;v.x=f.x+f.face*14;v.y=f.y-(k<10?k*3:30-(k-10)*4);v.vx=v.vy=0;
      if(k===18){v.st='hit';hitNow(f,v,{d:15,kb:50,kg:72,ang:50},f.face);boomFx(v.x,v.y,20);shake(6);m.caught=null}return k>=26&&!m.caught}
    if(m.t<8){f.vx=f.face*5;return}if(m.t<12){hit(f,m,'g',16,-22,12,0,0,0,0,{cmd:1});return}f.vx*=.7;return m.t>=34},
  flurry(f,m){if(m.t<5){f.vx*=.6;return}if(m.t<30){f.vx=f.face*2.6;if(!f.gr)f.vy=Math.min(f.vy,.6);if(m.t%3===2)hit(f,m,'d'+m.t,15,-24,11,1.5,6,0,20);return}
    if(m.t===30)hit(f,m,'df',17,-24,14,6,45,85,40);f.vx*=.7;return m.t>=42},
  flykick(f,m){if(m.t<5){f.vx*=.5;return}if(m.t===5){f.vy=f.gr?-3.5:-1;f.gr=null;SFX.swing()}if(m.t<22){f.vx=f.face*7.5;hit(f,m,'k',14,-12,9,10,38,85,40);return}f.vx*=.8;return m.t>=32},
  palm(f,m){if(m.t<9){f.vx*=.6;return}if(m.t<12){hit(f,m,'p',18,-24,14,13,40,90,35);if(m.t===9){ringFx(f.x+f.face*20,f.y-24,f.c.fx,20);SFX.boom();shake(3)}}f.vx*=.8;return m.t>=32}};
const SIDE_ONCE={dash:1,rush:1,drill:1,flurry:1,flykick:1,dive:1,whirl:1,grab:1};
/* what each special kind does, for the move list */
const SPDESC={jetpack:'fly up, steer with ◀ ▶',recoil:'blast the ground to launch up',warp:'vanish and reappear (aim it)',hover:'three boosts, can still attack',
  rocket:'rocket that explodes',grenade:'bouncing grenade',beam:'charged long beam',shotgun:'close-range spray',orb:'slow orb that hits again and again',snipe:'slow aim, very long shot',burst:'three quick shots',sticky:'bomb that sticks, then blows',
  risestab:'rising sword thrust',spinup:'spinning blade climb',leap:'big leap, can still attack',hook:'grapple a ledge or a foe',
  dash:'dashing slash',wave:'sword wave that flies',counter:'block a hit, strike back',drill:'many stabs, then launch',dive:'leap and slam down',whirl:'spinning blades forward',
  uppercut:'dragon uppercut',flameup:'flaming climb',helikick:'spinning kicks upward',leapup:'big jump, can still attack',
  rush:'armored charge punch',grab:'grab that beats blocking',flurry:'a hundred fists, then launch',flykick:'flying kick',palm:'point-blank shockwave'};
