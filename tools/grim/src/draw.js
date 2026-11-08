/* ================= drawing ================= */
const sy=y=>Math.round(y-G.camY);
/* a crisp pixel line, for the sword */
function pline(x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy2=y0<y1?1:-1;let e=dx+dy;ctx.fillStyle=c;
  for(let i=0;i<64;i++){ctx.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy2}}}
function drawSword(hx,hy,ang,len=10){const c=Math.cos(ang),s=Math.sin(ang);
  pline(hx-c*2,hy-s*2,hx,hy,'#6a4a2a');pline(hx-s*2,hy+c*2,hx+s*2,hy-c*2,'#c8a040');
  pline(hx+c,hy+s,hx+c*len,hy+s*len,'#d8e2ee');ctx.fillStyle='#ffffff';ctx.fillRect(Math.round(hx+c*len),Math.round(hy+s*len),1,1)}
/* where the sword points: resting low, and the arc of each slash in a combo */
const SWING=[[-1.3,1.1],[-.9,.6],[.9,-.7],[-1.6,1.4],[-2.6,3.6]];
function swordAngle(){if(P.st==='slam')return Math.PI/2;if(P.st==='dead')return .2;
  if(P.slashT>0){const[a,b]=SWING[Math.min(4,P.slashN)],dur=P.slashN>=4?16:P.slashN?11:12,t=1-P.slashT/dur,e=1-(1-t)*(1-t);return a+(b-a)*e}
  return P.vy<0?1.2:.7}
function drawReaper(){if(P.inv>0&&P.st!=='dead'&&Math.floor(P.inv/4)%2)return;
  const pose=P.st==='dead'?'dead':P.st==='slam'?'slam':P.st==='hurt'?'hurt':P.slashT>0||P.st==='combo'?'hit':P.vy<0?'up':'fall';
  const im=reaperSpr(pose)[P.face<0?1:0],x=Math.round(P.x-8),y=sy(P.y)-20;ctx.drawImage(im,x,y);
  if(P.st==='dead')return;
  const h=HAND[pose]||HAND.up,hx=x+(P.face>0?h[0]:15-h[0]),hy=y+h[1];let a=swordAngle();if(P.face<0)a=Math.PI-a;
  /* a swoosh behind the blade while it swings */
  if(P.slashT>0){const[a0,a1]=SWING[Math.min(4,P.slashN)];let s0=a0,s1=swordAngle();if(P.face<0){s0=Math.PI-s0;s1=Math.PI-s1}
    ctx.strokeStyle=P.slashN>=4?'rgba(255,216,74,.85)':'rgba(170,240,255,.75)';ctx.lineWidth=P.slashN>=4?3:2;ctx.beginPath();ctx.arc(hx,hy,P.slashN>=4?14:11,Math.min(s0,s1),Math.max(s0,s1));ctx.stroke()}
  drawSword(hx,hy,a,P.slashN>=4&&P.slashT>0?13:10)}
function drawMon(m){const t=m.t,fr=t==='garg'?(m.open>0?1:0):Math.floor((m.f+m.ph*10)/12)%2;let im=monSpr(t,fr)[(m.plat?m.vx<0:P.x<m.x)?1:0];
  if(m.flash>0||m.st==='dying'&&m.dieT%4<2)im=flashOf(im);
  const x=Math.round(m.x-im.width/2),y=sy(m.y+m.h)-im.height;if(m.st==='dying')ctx.globalAlpha=Math.max(0,m.dieT/26);ctx.drawImage(im,x,y);ctx.globalAlpha=1;
  if(m.st==='dying')return;
  if(m.st==='stun'){for(let i=0;i<3;i++){const a=G.t*.12+i*2.1;ctx.fillStyle='#ffd84a';ctx.fillRect(Math.round(m.x+Math.cos(a)*7),y-3+Math.round(Math.sin(a)*2),1,1)}}
  /* how many combos it still takes: one red pip each; the bar is what is left of the current one */
  const left=Math.ceil(m.hp/6),part=(m.hp%6||6)/6,pw=left*4-1,px=Math.round(m.x-pw/2),py=y-5;
  for(let i=0;i<left;i++){ctx.fillStyle=K;ctx.fillRect(px+i*4-1,py-1,5,5);ctx.fillStyle=i===left-1?'#ff3a4a':'#a01828';ctx.fillRect(px+i*4,py,3,3)}
  if(m.hp<m.max){ctx.fillStyle=K;ctx.fillRect(px-1,py+4,pw+2,3);ctx.fillStyle='#ffd84a';ctx.fillRect(px,py+5,Math.max(1,Math.round(pw*part)),1)}}
function drawWorld(){const m=meters(G.camY+H/2),z=zoneAt(m),zi=ZONES.indexOf(z);ctx.drawImage(skyCanvas(z),0,0);
  if(zi>0&&m<z.at+60){ctx.globalAlpha=1-(m-z.at)/60;ctx.drawImage(skyCanvas(ZONES[zi-1]),0,0);ctx.globalAlpha=1}
  const sc=silCanvas(z),off=((-G.camY*.3)%200+200)%200;for(let y=off-200;y<H;y+=200)ctx.drawImage(sc,0,Math.round(y));
  const fg=ctx.createLinearGradient(0,H-70,0,H);fg.addColorStop(0,'rgba(0,0,0,0)');fg.addColorStop(1,z.fog+'66');ctx.fillStyle=fg;ctx.fillRect(0,H-70,W,70);
  /* the best height so far, as a dashed line across the tower */
  if(G.best>0){const by=sy(-G.best*10);if(by>-4&&by<H){ctx.fillStyle='rgba(255,216,74,.5)';for(let x=0;x<W;x+=6)ctx.fillRect(x,by,3,1);txt('BEST',2,by-8,'#ffd84a',1,'l',K)}}
  for(const p of G.plats){const c=platCanvas(p.kind,p.w),y=sy(p.y);if(y<-10||y>H+10)continue;ctx.drawImage(c,Math.round(p.x-p.w/2-1),y-1)}
  for(const i of G.items){if(i.got)continue;if(i.t==='spring'){const y=sy(i.plat.y)-7-(i.boing>0?2:0);ctx.drawImage(SPRING(),Math.round(i.plat.x+i.dx-6),y);continue}
    const b=Math.round(Math.sin(G.t*.08+i.ph)*1.5),y=sy(i.y);if(y<-10||y>H+10)continue;ctx.drawImage(i.t==='soul'?SOUL():HEART(),Math.round(i.x-(i.t==='soul'?3:4)),y-4+b)}
  for(const m of G.mons)drawMon(m);
  for(const s of G.shots){const x=Math.round(s.x),y=sy(s.y);ctx.fillStyle='rgba(255,120,40,.4)';ctx.fillRect(x-3,y-3,7,7);ctx.fillStyle='#ffb04a';ctx.fillRect(x-2,y-2,5,5);ctx.fillStyle='#fff0c0';ctx.fillRect(x-1,y-1,3,3)}
  drawReaper();
  for(const e of G.fx){const x=Math.round(e.x),y=sy(e.y);
    if(e.k==='spark'){ctx.fillStyle=e.c;ctx.fillRect(x,y,1,1)}
    else if(e.k==='dust'||e.k==='smoke'){ctx.fillStyle=e.k==='smoke'?'rgba(150,130,190,'+(e.t/50).toFixed(2)+')':'rgba(200,190,220,'+(e.t/24).toFixed(2)+')';ctx.fillRect(x,y,2,2)}
    else if(e.k==='chip'){ctx.fillStyle=e.c;ctx.fillRect(x,y,2,2)}
    else if(e.k==='ember'){ctx.fillStyle='rgba(255,140,40,'+(e.t/12).toFixed(2)+')';ctx.fillRect(x,y,1,1)}
    else if(e.k==='trail'){ctx.fillStyle='rgba(120,90,200,'+(e.t/14).toFixed(2)+')';ctx.fillRect(x-4,y-6,9,10)}}
  for(const q of G.pops)txt(q.s,Math.round(q.x),sy(q.y),q.c,1,'c',K)}
function hearts(x,y){for(let i=0;i<5;i++){if(i>=P.hp&&i>=3)continue;const im=HEART();if(i<P.hp)ctx.drawImage(im,x-i*10,y);else{ctx.globalAlpha=.25;ctx.drawImage(im,x-i*10,y);ctx.globalAlpha=1}}}
function drawHUD(){ctx.fillStyle='rgba(7,5,12,.55)';ctx.fillRect(0,0,W,13);txt(meters(P.y)+'M',3,3,'#ffffff',1,'l',K);
  ctx.drawImage(SOUL(),52,2);txt(G.souls,61,3,'#a8dcff',1,'l',K);hearts(W-11,2);
  /* in a combo: one pip per slash, and the time left to press A */
  if(P.st==='combo'){const cx=W/2,y=H-22;ctx.fillStyle='rgba(7,5,12,.7)';ctx.fillRect(cx-34,y-2,68,16);
    for(let i=0;i<4;i++){ctx.fillStyle=i<P.comboN?'#ffd84a':'#3a2c52';ctx.fillRect(cx-28+i*14,y+1,10,6)}txt(P.comboN<4?'A':'',cx+30,y,'#ff6a7a',1,'c');
    ctx.fillStyle='#c88aff';ctx.fillRect(cx-32,y+10,Math.round(64*P.comboT/56),2)}
  if(steerMode()==='pad'&&!TOUCH.side&&G.t<300&&G.state==='play'&&P.st!=='combo')txt('HOLD A SIDE OR ◀ ▶',W/2,H-12,'#c8b8ff',1,'c',K)}
/* ---------- the screens ---------- */
function panel(x,y,w,h){ctx.fillStyle='rgba(7,5,12,.82)';ctx.fillRect(x,y,w,h);ctx.fillStyle='#463463';ctx.fillRect(x,y,w,1);ctx.fillRect(x,y+h-1,w,1);ctx.fillRect(x,y,1,h);ctx.fillRect(x+w-1,y,1,h)}
function menuList(items,sel,y){items.forEach((s,i)=>{const on=i===sel;txt((on?'▶ ':'  ')+s,W/2-50,y+i*12,on?'#ffd84a':'#c8c0e0',1,'l',K)})}
function drawTitle(){const z=ZONES[0];ctx.drawImage(skyCanvas(z),0,0);ctx.drawImage(silCanvas(z),0,H-200);
  ctx.drawImage(platCanvas('stone',44),W/2-22,H-40);const by=H-40-Math.abs(Math.sin(G.t*.06))*36;const sv=P.y;P.x=W/2;P.y=by+G.camY;P.face=1;P.st='air';P.vy=Math.cos(G.t*.06)>0?-1:1;P.slashT=0;P.inv=0;drawReaper();P.y=sv;
  txt('GRIM',W/2,22,'#eee8d4',3,'c','#463463');txt('ASCENT',W/2,46,'#c88aff',2,'c',K);
  const it=titleItems(),dy=(it.length-3)*12;menuList(it.map(x=>x[1]),G.menu,76);
  if(G.best)txt('BEST '+G.best+'M',W/2,118+dy,'#ffd84a',1,'c',K);
  tiltLine().split('\n').forEach((l,i)=>txt(l,W/2,132+dy+i*10,tiltOK()?'#7af0ff':'#ff9aaa',1,'c',K))}
const HOWTO=['TILT YOUR PHONE LEFT AND','RIGHT TO STEER (OR HOLD A','SIDE OF THE SCREEN).','YOU BOUNCE ON PLATFORMS','BY YOURSELF. GO UP!','','B: SLAM DOWN. SLAM INTO','A MONSTER TO START A','COMBO, THEN PRESS A 4X.','RED PIPS = COMBOS TO KILL.','','A ALONE: A QUICK SLASH.','SLAM A PLATFORM TO','BOUNCE HIGHER.','FALL OFF OR LOSE YOUR','HEARTS AND YOU DIE.','SELECT: CENTER TILT.'];
function drawHow(){drawTitleBack();panel(6,10,W-12,H-20);txt('HOW TO PLAY',W/2,16,'#c88aff',1,'c');HOWTO.forEach((s,i)=>txt(s,W/2,28+i*10,s.startsWith('B:')||s.startsWith('A ')?'#ffd84a':'#e8e4ff',1,'c'));txt('B BACK',W/2,H-18,'#8a80b0',1,'c')}
function drawTitleBack(){ctx.drawImage(skyCanvas(ZONES[0]),0,0);ctx.drawImage(silCanvas(ZONES[0]),0,H-200)}
function optItems(){return['STEER: '+{auto:'AUTO',tilt:'TILT',pad:'D-PAD'}[OPT.steer],'TILT: '+['LOW','MEDIUM','HIGH'][OPT.sens],'CENTER TILT','SOUND: '+(muted?'OFF':'ON'),'VIBRATION: '+(HAP.on?'ON':'OFF'),'BACK']}
function drawOpts(){drawTitleBack();panel(6,20,W-12,150);txt('OPTIONS',W/2,26,'#c88aff',1,'c');menuList(optItems(),G.menu,44);
  tiltLine().split('\n').forEach((l,i)=>txt(l,W/2,118+i*9,tiltOK()?'#7af0ff':'#ff9aaa',1,'c'));const g=TILT.raw;if(TILT.live)txt('TILT '+(g>0?'+':'')+Math.round(g)+'°',W/2,138,'#8a80b0',1,'c');txt('◀ ▶ CHANGE · B BACK',W/2,152,'#8a80b0',1,'c')}
function drawPause(){panel(14,50,W-28,118);txt('PAUSED',W/2,58,'#c88aff',1,'c');menuList(['RESUME','CENTER TILT','OPTIONS','QUIT'],G.menu,78);txt(meters(P.y)+'M · '+G.kills+' KILLS',W/2,140,'#e8e4ff',1,'c')}
function drawOver(){panel(10,40,W-20,150);txt('YOU DIED',W/2,50,'#ff3a4a',2,'c',K);
  const rows=[['HEIGHT',G.maxH+'M'],['BEST',G.best+'M'],['KILLS',G.kills],['SOULS',G.souls],['BEST COMBO',G.bestCombo+' HITS']];
  rows.forEach(([a,b],i)=>{txt(a,24,76+i*13,'#c8c0e0');txt(b,W-24,76+i*13,'#ffffff',1,'r')});if(G.newBest&&G.t%40<28)txt('NEW BEST!',W/2,144,'#ffd84a',1,'c',K);
  if(G.overT<=0)txt('A CLIMB · B MENU',W/2,170,'#ffd84a',1,'c',K)}
function render(){ctx.save();if(G.shake>0)ctx.translate(Math.round((rnd()-.5)*G.shake),Math.round((rnd()-.5)*G.shake));
  if(G.state==='title')drawTitle();else if(G.state==='how')drawHow();else if(G.state==='opts')drawOpts();
  else{drawWorld();drawHUD();if(G.state==='pause')drawPause();if(G.state==='over')drawOver()}
  ctx.restore()}
