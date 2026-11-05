/* ================= moves =================
   Frames are 1/60 s. A hitbox is [x forward, y (up is minus), radius, damage, base knockback, knockback growth, angle].
   Angle 0 sends the target straight ahead, 90 straight up, 180 straight back, minus angles send them down (a spike). */
const WEAP={none:{reach:0,big:1},gloves:{reach:1,big:1.05},claws:{reach:3,big:1.05},dagger:{reach:6,big:1},sword:{reach:10,big:1.1},katana:{reach:12,big:1.1},
  axe:{reach:9,big:1.15,kg:1.08},hammer:{reach:9,big:1.2,kg:1.1},spear:{reach:16,big:1.05},staff:{reach:14,big:1.05},fan:{reach:7,big:1.1}};
const NM={
  jab1:{s:2,a:2,r:8,b:[[13,-19,8,2.5,8,0,30]],chain:'jab2',pose:'jab'},
  jab2:{s:2,a:2,r:8,b:[[14,-19,8,2.5,8,0,30]],chain:'jab3',pose:'jab2'},
  jab3:{s:3,a:3,r:15,b:[[16,-17,10,5,34,70,40]],pose:'kick',wpn:1},
  dash:{s:4,a:6,r:15,b:[[14,-14,11,9,36,70,55]],pose:'dashk',wpn:1,slide:1},
  side:{s:6,a:4,r:15,b:[[18,-17,11,10,30,95,38]],pose:'side',wpn:1},
  up:{s:4,a:5,r:13,b:[[4,-36,12,8,34,80,88],[10,-26,9,7,34,80,80]],pose:'upk',wpn:1},
  down:{s:4,a:3,r:9,b:[[16,-4,10,6,26,60,75]],pose:'sweep',wpn:1},
  nair:{s:3,a:9,r:10,b:[[0,-16,15,7,26,70,45]],pose:'nair',air:1,land:6,radial:1},
  fair:{s:5,a:4,r:13,b:[[15,-18,11,9,30,90,40]],pose:'fair',air:1,land:8,wpn:1},
  bair:{s:5,a:4,r:13,b:[[-15,-16,11,11,32,95,140]],pose:'bair',air:1,land:8,wpn:1},
  uair:{s:4,a:5,r:12,b:[[2,-37,12,8,30,80,85]],pose:'uair',air:1,land:6,wpn:1},
  dair:{s:7,a:5,r:16,b:[[2,2,11,11,28,80,-80]],pose:'dair',air:1,land:12,wpn:1},
  grab:{s:5,a:2,r:22,b:[[15,-16,10,0,0,0,0]],pose:'grab',grab:1}};
const THROW={f:[8,42,72,40],b:[9,44,76,140],u:[7,46,70,90]};

/* the special moves, one function per kind. m.t counts frames from 0; return true when the move is over.
   m.help = fall helpless afterwards (up specials). Helpers come from fight.js. */
const pdir=f=>{const p=f.pad;let x=p.x,y=p.up?-1:p.down?1:0;if(!x&&!y)y=-1;const l=Math.hypot(x,y);return[x/l,y/l]};
const SP={
  /* ---------- UP ---------- */
  rise(f,m){if(m.t<4){f.vx*=.6;f.vy=Math.min(f.vy,0);return}if(m.t===4){f.vy=-11.5;f.vx=f.face*1.4;SFX.special()}
    if(m.t<12&&m.t%3===1)hit(f,m,'r'+m.t,8,-24,13,2,4,0,85);if(m.t===13)hit(f,m,'rf',8,-28,15,5,50,90,80);if(m.t>=24){m.help=1;return true}},
  rocket(f,m){if(m.t<10){f.vx*=.7;f.vy=0;if(m.t%3===0)burst(f.x,f.y-4,f.c.fx,2,1.5);return}
    if(m.t===10){const d=pdir(f);m.dx=d[0];m.dy=d[1];if(d[0])f.face=sgn(d[0]);SFX.boom()}
    if(m.t<26){f.vx=m.dx*11;f.vy=m.dy*11;hit(f,m,'k',0,-16,14,8,40,70,60,{radial:1});burst(f.x-m.dx*10,f.y-12-m.dy*10,f.c.fx,1,2);return}
    f.vx*=.4;f.vy*=.4;m.help=1;return true},
  spinup(f,m){f.vy=m.t<20?-7:-3;f.vx=f.pad.x*2.6;if(m.t<24&&m.t%4===0)hit(f,m,'s'+m.t,0,-18,16,2,5,0,90);if(m.t===26)hit(f,m,'sf',0,-20,18,4,45,80,70,{radial:1});
    if(m.t>=30){m.help=1;return true}},
  warp(f,m){if(m.t<10){f.vx=0;f.vy=0;f.inv=Math.max(f.inv,4);f.hide=1;return}
    if(m.t===10){const d=pdir(f);f.x+=d[0]*90;f.y+=d[1]*90;f.hide=0;if(d[0])f.face=sgn(d[0]);ringFx(f.x,f.y-16,f.c.fx,26);SFX.special();f.vy=-2}
    if(m.t<14){f.inv=Math.max(f.inv,2);hit(f,m,'w',0,-16,14,6,30,60,70,{radial:1})}if(m.t>=20){m.help=1;return true}},
  flutter(f,m){if(m.t%10===0&&m.t<30){f.vy=-6.6;f.vx=f.pad.x*2.6;SFX.djump();burst(f.x,f.y-14,f.c.fx,4,2)}if(m.t%10<4&&m.t<30)hit(f,m,'f'+(m.t/10|0),0,-12,13,3,25,40,75);
    if(m.t>=32){f.upUsed=1;f.jumps=0;return true}},
  spring(f,m){if(m.t===0){f.vy=-13.5;f.vx=f.pad.x*2;m.sx=f.x;m.sy=f.y;SFX.djump();ringFx(f.x,f.y,f.c.fx,14)}if(m.t<6)hit(f,m,'sp',0,0,14,7,35,60,80,{abs:0});
    if(m.t>=10){f.upUsed=1;f.jumps=0;return true}},
  hook(f,m){if(m.t<6){f.vx*=.7;f.vy*=.5;return}if(m.t===6){m.hx=f.x;m.hy=f.y-20;m.dx=f.face*.64;m.dy=-.77;SFX.shot()}
    if(m.t<20&&!m.zip){m.hx+=m.dx*9;m.hy+=m.dy*9;f.vy=Math.min(f.vy,1);hit(f,m,'h',m.hx,m.hy,9,6,22,40,40,{abs:1});
      const L=ledgeNear(m.hx,m.hy,18);if(L){m.zip=L;SFX.land()}}
    if(m.zip){const tx=m.zip.x+m.zip.side*7,ty=m.zip.y+24;f.vx=(tx-f.x)*.3;f.vy=(ty-f.y)*.3;m.hx=m.zip.x;m.hy=m.zip.y;if(Math.hypot(tx-f.x,ty-f.y)<8||m.t>40){grabLedge(f,m.zip);return true}return}
    if(m.t>=20){f.vy=-6;m.help=1;return true}},
  flame(f,m){if(m.t<5){f.vx*=.6;f.vy=0;return}if(m.t===5){f.vy=-12.5;SFX.boom()}if(m.t<19){burst(f.x,f.y,f.c.fx,2,2.5);if(m.t%3===2)hit(f,m,'g'+m.t,0,-12,15,2,5,0,90)}
    if(m.t===20)hit(f,m,'gf',0,-24,17,6,50,85,85);if(m.t>=26){m.help=1;return true}},
  /* ---------- SIDE ---------- */
  dash(f,m){if(m.t===0&&!f.gr)f.sideUsed=1;if(m.t<4){f.vx*=.5;if(!f.gr)f.vy=0;return}if(m.t<18){f.vx=f.face*9;if(!f.gr)f.vy=0;hit(f,m,'d',12,-16,12,9,35,80,35);if(m.t%2)burst(f.x-f.face*8,f.y-12,f.c.fx,1,1);return}
    f.vx*=.8;if(m.t>=30)return true},
  fireball(f,m){if(m.t===8){proj(f,{x:16,y:-18,vx:f.face*4.6,vy:0,grav:.32,bounce:-4.2,r:7,d:6,kb:16,kg:40,ang:40,life:80,kind:'fire'});SFX.shot()}return m.t>=24},
  boomerang(f,m){if(m.t===8){proj(f,{x:14,y:-18,vx:f.face*7.5,vy:0,ret:.26,r:8,d:7,kb:22,kg:50,ang:40,life:80,kind:'boom',spin:1});SFX.shot()}return m.t>=24},
  charge(f,m){if(m.t===0&&!f.gr)f.sideUsed=1;f.armor=m.t<22?12:0;if(m.t<14){f.vx*=.6;if(!f.gr)f.vy=Math.min(f.vy,.5);if(m.t%3===0)burst(f.x-f.face*6,f.y-6,'#ffffff',1,1);return}
    if(m.t<30){f.vx=f.face*8;if(!f.gr)f.vy=Math.min(f.vy,1);hit(f,m,'c',12,-16,14,14,40,90,40);return}f.vx*=.7;return m.t>=40},
  whip(f,m){if(m.t<9){f.vx*=.7;return}if(m.t<13){hit(f,m,'w',62,-18,9,13,40,95,38);hit(f,m,'w',38,-18,10,10,30,80,35)}return m.t>=34},
  drill(f,m){if(m.t===0&&!f.gr)f.sideUsed=1;if(m.t<5){f.vx*=.6;return}if(m.t<30){f.vx=f.face*2.6;if(!f.gr)f.vy=Math.min(f.vy,.6);if(m.t%3===2)hit(f,m,'d'+m.t,16,-16,13,1.5,6,0,20);return}
    if(m.t===30)hit(f,m,'df',18,-16,15,6,45,85,40);f.vx*=.7;return m.t>=42},
  triple(f,m){if(m.t===7){for(const a of[-12,0,12]){const r=a*Math.PI/180;proj(f,{x:12,y:-18,vx:f.face*7*Math.cos(r),vy:7*Math.sin(r),r:5,d:3,kb:12,kg:25,ang:30,life:40,kind:'star',spin:1})}SFX.shot()}return m.t>=24},
  beam(f,m){if(m.t<14){f.vx*=.7;if(!f.gr)f.vy=Math.min(f.vy,.4);return}if(m.t===14){SFX.boom();shake(4)}
    if(m.t<20){for(let x=16;x<=170;x+=16)hit(f,m,'b',x,-18,8,11,35,85,30);if(!f.gr)f.vy=0}return m.t>=38},
  roll(f,m){if(m.t===0&&!f.gr)f.sideUsed=1;if(m.t<6){f.vx*=.5;return}if(m.t<32){f.vx=f.face*6.5;hit(f,m,'r',0,-12,13,8,30,70,45);return}f.vx*=.75;return m.t>=40},
  grab(f,m){if(m.t===0&&!f.gr)f.sideUsed=1;if(m.caught){const v=m.caught,k=m.t-m.ct;v.x=f.x+f.face*14;v.y=f.y-(k<10?k*3:30-(k-10)*4);v.vx=v.vy=0;
      if(k===18){v.st='hit';hitNow(f,v,{d:15,kb:50,kg:72,ang:50},f.face);ringFx(v.x,v.y,f.c.fx,30);shake(6);m.caught=null}return k>=26&&!m.caught?true:false}
    if(m.t<8){f.vx=f.face*5;return}if(m.t<12){hit(f,m,'g',16,-16,13,0,0,0,0,{cmd:1});return}f.vx*=.7;return m.t>=34},
  arc(f,m){if(m.t===9){proj(f,{x:10,y:-24,vx:f.face*4.2,vy:-6,grav:.35,r:8,d:0,boom:{r:24,d:12,kb:40,kg:80},life:120,kind:'ball'});SFX.shot()}return m.t>=26},
  /* ---------- DOWN ---------- */
  stomp(f,m){if(f.gr&&!m.air){if(m.t===6){hit(f,m,'s',0,-4,24,10,40,70,70,{radial:1});ringFx(f.x,f.y,f.c.fx,24);shake(4);SFX.boom()}return m.t>=26}
    m.air=1;if(m.t<6){f.vx*=.5;f.vy=-2;return}if(!m.landed){f.vy=12;f.vx*=.9;hit(f,m,'d',0,-4,14,10,30,70,-70);if(f.gr){m.landed=m.t;hit(f,m,'l',0,-6,26,6,40,60,60,{radial:1});ringFx(f.x,f.y,f.c.fx,26);shake(5);SFX.boom()}
      if(m.t>60){m.help=1;return true}return}return m.t-m.landed>=12},
  counter(f,m){f.vx*=.7;if(!f.gr)f.vy=Math.min(f.vy,1);f.counter=m.t>=4&&m.t<24&&!m.fired;if(m.fired){if(m.t-m.fired===2)hit(f,m,'c',18,-16,20,m.cd,50,90,40);return m.t-m.fired>=16}return m.t>=40},
  mine(f,m){if(m.t===10){killOwn(f,'mine');proj(f,{x:0,y:-2,vx:0,vy:0,grav:.4,stick:1,r:8,d:0,boom:{r:24,d:11,kb:45,kg:75},life:900,arm:30,trig:16,kind:'mine'});SFX.beep()}return m.t>=22},
  quake(f,m){if(!f.gr&&!m.q){f.vy=10;f.vx*=.9;return m.t>70?(m.help=1,true):false}if(!m.q){m.q=m.t;f.vx=0}const k=m.t-m.q;
    if(k===12){hit(f,m,'q',0,-8,22,12,45,80,75,{radial:1});for(const s of[-1,1])proj(f,{x:s*f.face*14,y:-6,vx:s*5,vy:0,ground:1,r:10,d:8,kb:30,kg:65,ang:65,life:30,kind:'wave'});shake(7);SFX.boom()}return k>=36},
  reflect(f,m){f.vx*=.8;if(!f.gr)f.vy=Math.min(f.vy,1);f.reflect=m.t>=3&&m.t<22;if(m.t===3)hit(f,m,'r',0,-16,16,4,30,30,45,{radial:1});return m.t>=30},
  spin(f,m){f.vx=f.pad.x*2.8;if(!f.gr)f.vy=Math.min(f.vy,1.5);if(m.t<30&&m.t%4===0)hit(f,m,'s'+m.t,0,-16,18,2,6,0,50);if(m.t===32)hit(f,m,'sf',0,-16,20,5,40,80,45,{radial:1});return m.t>=42},
  bomb(f,m){if(m.t===10){killOwn(f,'bomb');proj(f,{x:10,y:-22,vx:f.face*3,vy:-5,grav:.4,bounce:-2.5,fric:.85,r:8,d:0,boom:{r:26,d:14,kb:45,kg:85},life:70,fuse:1,kind:'bomb'});SFX.shot()}return m.t>=24},
  drain(f,m){f.vx*=.7;if(m.t>=8&&m.t<12)hit(f,m,'d',14,-16,14,8,20,40,40,{drain:6});if(m.t%4===0&&m.t<20)burst(f.x+f.face*14,f.y-16,f.c.fx,1,1.2);return m.t>=36},
  trap(f,m){if(m.t===10){killOwn(f,'trap');proj(f,{x:30,y:-4,vx:0,vy:0,grav:.4,stick:1,r:9,d:5,kb:0,kg:0,ang:0,snare:70,life:700,arm:20,trig:13,kind:'trap'});SFX.beep()}return m.t>=22}};
/* what each special kind does, for the move list */
const SPDESC={rise:'rising uppercut',rocket:'charge, then blast off any way',spinup:'spinning climb',warp:'vanish and reappear',flutter:'three flaps, can still attack',spring:'big bounce, can still attack',
  hook:'hook a ledge or a foe',flame:'erupting climb',dash:'fast dash strike',fireball:'bouncing shot',boomerang:'comes back',charge:'armored rush',whip:'long reach, strong tip',
  drill:'many hits, then launch',triple:'three shots',beam:'charged long beam',roll:'rolling attack',grab:'grab that beats shields',arc:'lobbed blast',stomp:'drop down, shockwave',
  counter:'block a hit, strike back',mine:'hidden mine',quake:'shockwaves both ways',reflect:'sends shots back',spin:'spinning hits, slows falling',bomb:'bouncing bomb',drain:'steal health',trap:'snare that holds foes'};
