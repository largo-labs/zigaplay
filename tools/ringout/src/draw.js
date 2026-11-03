/* ================= the fighters' bodies: little puppets drawn in code =================
   A fighter is a head, a body, two arms and two legs, posed by angles (0 = hanging straight down, 90 = pointing
   forward, 180 = straight up, -90 = pointing back), plus ears, a hat or hair, something on the back (a tail, a cape,
   a shell) and maybe a weapon. Each frame the pose is drawn into a small canvas, outlined in dark ink, and put on
   the screen facing the right way. */
const D2R=Math.PI/180;
const SIZES={S:{r:4,bw:6,bh:5,ll:5,al:5},M:{r:5,bw:7,bh:6,ll:6,al:6},L:{r:5,bw:9,bh:8,ll:7,al:6}};
const SP=56,OX=28,OY=44;
const SPR=document.createElement('canvas');SPR.width=SPR.height=SP;const sg=SPR.getContext('2d');
const SIL=document.createElement('canvas');SIL.width=SIL.height=SP;const lg=SIL.getContext('2d');
function sp(x,y,w,h,c){sg.fillStyle=c;sg.fillRect(Math.round(OX+x),Math.round(OY+y),w,h)}
function sdisc(cx,cy,r,c){sg.fillStyle=c;for(let dy=-Math.ceil(r);dy<=Math.ceil(r);dy++){const w=Math.sqrt(Math.max(0,r*r-dy*dy));if(w<.5)continue;sg.fillRect(Math.round(OX+cx-w),Math.round(OY+cy+dy),Math.round(w*2),1)}}
function seg(x0,y0,x1,y1,th,c){sg.fillStyle=c;const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)*1.4));for(let i=0;i<=n;i++){const t=i/n;sg.fillRect(Math.round(OX+x0+(x1-x0)*t-th/2),Math.round(OY+y0+(y1-y0)*t-th/2),th,th)}}
function spoly(pts,c){sg.fillStyle=c;sg.beginPath();sg.moveTo(OX+pts[0][0],OY+pts[0][1]);for(let i=1;i<pts.length;i++)sg.lineTo(OX+pts[i][0],OY+pts[i][1]);sg.closePath();sg.fill()}
const endp=(x,y,a,l)=>[x+Math.sin(a*D2R)*l,y+Math.cos(a*D2R)*l];
/* poses: lean (degrees forward), arms aF/aB, legs lF/lB, eF (front arm reach, 1 = normal), kF (front leg reach),
   tuck (legs bent up), bob (head bob), sq (squash) */
const POSES={
  idle:{lean:0,aF:25,aB:-20,lF:6,lB:-6},
  crouch:{lean:8,aF:40,aB:-30,lF:35,lB:-35,tuck:.6,sq:.85},
  jump:{lean:-4,aF:150,aB:-150,lF:45,lB:-15,tuck:.75},
  fall:{lean:0,aF:110,aB:-110,lF:15,lB:-15},
  hurt:{lean:-22,aF:160,aB:140,lF:25,lB:-30},
  tumble:{lean:-10,aF:170,aB:-170,lF:60,lB:-60},
  dodge:{lean:10,aF:60,aB:-60,lF:40,lB:-40,tuck:.7,sq:.88},
  helpless:{lean:-8,aF:170,aB:-170,lF:10,lB:-10},
  win:{lean:0,aF:165,aB:-165,lF:10,lB:-10},
  lose:{lean:20,aF:10,aB:-10,lF:15,lB:-15,sq:.92},
  ledge:{lean:10,aF:150,aB:130,lF:20,lB:-10},
  /* attacks */
  jab1:{lean:8,aF:92,aB:-30,lF:20,lB:-15,eF:1.5},
  jab2:{lean:10,aF:40,aB:95,lF:-10,lB:25,eB:1.5},
  jab3:{lean:-6,aF:120,aB:-50,lF:95,lB:-5,kF:1.4},
  ftilt:{lean:14,aF:88,aB:-60,lF:25,lB:-25,eF:1.6},
  utilt:{lean:-6,aF:178,aB:-40,lF:10,lB:-10,eF:1.5},
  dtilt:{lean:18,aF:70,aB:-40,lF:80,lB:-40,tuck:.4,kF:1.4,sq:.85},
  dash:{lean:28,aF:100,aB:-80,lF:75,lB:-35,kF:1.4},
  nair:{lean:0,aF:100,aB:-100,lF:80,lB:-80,kF:1.3},
  fair:{lean:10,aF:80,aB:-40,lF:30,lB:-20,eF:1.6},
  uair:{lean:-14,aF:180,aB:170,lF:30,lB:-30,eF:1.5},
  dair:{lean:0,aF:150,aB:-150,lF:-4,lB:4,kF:1.4},
  cast:{lean:6,aF:90,aB:85,lF:20,lB:-20,eF:1.3,eB:1.2},
  charge:{lean:-8,aF:-50,aB:-80,lF:30,lB:-30,tuck:.5,sq:.92},
  punch:{lean:24,aF:90,aB:-90,lF:40,lB:-40,eF:1.8},
  rise:{lean:-6,aF:180,aB:-40,lF:10,lB:-20,eF:1.4},
  slam:{lean:0,aF:20,aB:-20,lF:0,lB:0},
  guard:{lean:-6,aF:130,aB:110,lF:15,lB:-15,eF:.8},
  spin:{lean:0,aF:95,aB:-95,lF:45,lB:-45,eF:1.3},
  grab:{lean:16,aF:85,aB:80,lF:20,lB:-20,eF:1.5,eB:1.4},
  throw:{lean:-14,aF:150,aB:130,lF:10,lB:-25},
  kick:{lean:-10,aF:120,aB:-60,lF:100,lB:-10,kF:1.5},
};
function walkPose(t,run){const s=Math.sin(t*(run?.5:.32)),m=run?48:28;return{lean:run?16:3,aF:-s*m*.9,aB:s*m*.9,lF:s*m,lB:-s*m,bob:Math.abs(s)<.5?-1:0}}
/* draws one fighter's sprite into SPR, then its dark silhouette into SIL */
function buildSprite(ch,P,t){const z=SIZES[ch.size],r=z.r,ll=z.ll*(P.tuck?1-P.tuck*.35:1),lean=P.lean||0;
  sg.clearRect(0,0,SP,SP);
  const hipY=-ll-0.5,neckX=Math.sin(lean*D2R)*z.bh,neckY=hipY-z.bh,hx=neckX+Math.sin(lean*D2R)*r*.6,hy=neckY-r+1+(P.bob||0);
  const skin=ch.skin,suit=ch.suit,acc=ch.acc,hair=ch.hair||ch.skin,dS=dk(skin),dU=dk(suit),dA=dk(acc);
  const back=ch.back;
  /* behind everything: tail, cape, shell, wings */
  if(back==='tail_fox'){seg(-2,hipY+1,-7,hipY-3,4,skin);seg(-7,hipY-3,-9,hipY-7,4,skin);sdisc(-9,hipY-8,2,'#fff6e8')}
  else if(back==='tail_cat'){seg(-2,hipY+1,-6,hipY,2,hair);seg(-6,hipY,-8,hipY-5+Math.sin(t*.1),2,hair)}
  else if(back==='tail_lizard'){seg(-2,hipY+1,-6,hipY+2,4,skin);seg(-6,hipY+2,-10,hipY+3,2,skin)}
  else if(back==='cape'){const w=Math.sin(t*.12)*1.5;spoly([[neckX-2,neckY+1],[neckX+1,neckY+1],[-3,hipY+5],[-8+w,hipY+4]],acc);spoly([[neckX-2,neckY+1],[-4,hipY+2],[-8+w,hipY+4]],dA)}
  else if(back==='scarf'){const w=Math.sin(t*.15)*2;seg(neckX-1,neckY+1,neckX-6,neckY+2+w*.5,2,acc);seg(neckX-6,neckY+2+w*.5,neckX-10,neckY+1+w,2,acc)}
  else if(back==='wings'){const f=Math.sin(t*.25)*2;spoly([[neckX-1,neckY+1],[neckX-9,neckY-5+f],[neckX-7,neckY+4]],acc);spoly([[neckX-1,neckY+2],[neckX-6,neckY+6+f*.5],[neckX-3,neckY+5]],dA)}
  else if(back==='shell'){sdisc(neckX*.5-3,hipY-z.bh/2,z.bw*.75,acc);sdisc(neckX*.5-3,hipY-z.bh/2,z.bw*.75-2,dA);sp(neckX*.5-5,hipY-z.bh/2-1,3,2,acc)}
  /* back arm and back leg, a shade darker */
  const lb=endp(-1,hipY,P.lB||0,ll*(P.kB||1));seg(-1,hipY,lb[0],lb[1],2,dk(acc));sp(lb[0]-1,lb[1]-1,3,2,dk(dA));
  const sY=neckY+1.5,ab=endp(neckX-1,sY,P.aB||0,z.al*(P.eB||1));seg(neckX-1,sY,ab[0],ab[1],2,dU);
  if(ch.weapon==='gloves')sdisc(ab[0],ab[1],2,dA);else sdisc(ab[0],ab[1],1.2,dS);
  /* body */
  seg(0,hipY-z.bw/2+1.5,neckX,neckY+z.bw/2-.5,z.bw,suit);
  if(ch.belly)sdisc(neckX*.5+1,hipY-z.bh/2+.5,z.bw*.42,lt(suit));
  sp(-z.bw/2+.5,hipY-1.5,z.bw,1,acc);
  /* front leg */
  const lf=endp(1,hipY,P.lF||0,ll*(P.kF||1));seg(1,hipY,lf[0],lf[1],2,acc);sp(lf[0]-1,lf[1]-1,3,2,dA);
  /* head */
  if(ch.top==='hood')sdisc(hx,hy,r+1.5,suit);
  if(ch.top==='long'){seg(hx-1,hy,hx-r-1,hy+r+3,4,hair)}
  if(ch.ears==='bunny'){seg(hx-1,hy-r+1,hx-3,hy-r-6,2,skin);seg(hx+1,hy-r+1,hx+1,hy-r-6,2,skin);sp(hx+1,hy-r-4,1,3,'#ffb0c8')}
  if(ch.ears==='cat'||ch.ears==='fox'){const e=ch.ears==='fox'?4:3;spoly([[hx-r+.5,hy-1],[hx-r+1,hy-r-e+1],[hx-1,hy-r+1]],skin);spoly([[hx+.5,hy-r+1],[hx+r-1.5,hy-r-e+1],[hx+r,hy-1]],skin);sp(hx+r-3,hy-r-e+3,1,2,'#ffb0c8')}
  if(ch.ears==='bear'||ch.ears==='mouse'){const e=ch.ears==='mouse'?2.5:1.8;sdisc(hx-r+1.5,hy-r+1.5,e,skin);sdisc(hx+r-1.5,hy-r+1.5,e,skin);sdisc(hx+r-1.5,hy-r+1.5,e*.5,dS)}
  sdisc(hx,hy,r,ch.top==='helmet'?acc:skin);
  /* face: eyes look forward */
  const ex=hx+r*.45,ey=hy-.5;
  if(ch.face==='visor'||ch.top==='helmet'){sp(hx-1,ey-1,r+1.5,3,ch.eye||'#6af0ff');sp(hx,ey-1,r,1,lt(ch.eye||'#6af0ff'))}
  else{if(ch.face==='mask')sp(hx-r+1,ey-1,r*2-1,3,ch.acc);sp(ex-1,ey-1,2,3,WH);sp(ex,ey,1,2,ch.eye||K);sp(ex+2.5,ey-1,1,3,WH);sp(ex+3,ey,1,2,ch.eye||K)}
  if(ch.face==='snout'){sp(hx+r-1,hy+.5,3,3,lt(skin));sp(hx+r+1,hy+.5,1,1,K)}
  if(ch.face==='beak')spoly([[hx+r-1,hy],[hx+r+4,hy+1.5],[hx+r-1,hy+3]],'#ffb030');
  if(ch.face==='beard')spoly([[hx-1,hy+r-2],[hx+r,hy+r-2],[hx+2,hy+r+3]],hair);
  if(ch.face==='fangs'){sp(hx+r-2,hy+2,1,2,WH);sp(hx+r-4,hy+2,1,2,WH)}
  /* hats and hair */
  const tp=ch.top;
  if(tp==='spiky'){for(let i=0;i<4;i++){const bx=hx-r+1+i*2.4;spoly([[bx-1,hy-r+3],[bx-2.5,hy-r-3+(i%2)],[bx+2,hy-r+2]],hair)}}
  else if(tp==='cap'){sp(hx-r,hy-r,r*2,r-1,acc);sp(hx,hy-2,r+3,2,dA);sp(hx-r+1,hy-r,r*2-2,1,lt(acc))}
  else if(tp==='crown'){sp(hx-3,hy-r-2,7,3,'#ffd84a');sp(hx-3,hy-r-4,1,2,'#ffd84a');sp(hx,hy-r-4,1,2,'#ffd84a');sp(hx+3,hy-r-4,1,2,'#ffd84a');sp(hx,hy-r-1,1,1,'#ff5f6a')}
  else if(tp==='witch'){spoly([[hx-r-2,hy-r+2],[hx+r+2,hy-r+2],[hx-r-3,hy-r-10]],acc);sp(hx-r-2,hy-r+1,r*2+5,2,dA);sp(hx-2,hy-r,4,1,'#ffd84a')}
  else if(tp==='bandana'){sp(hx-r,hy-3,r*2,2,acc);const w=Math.sin(t*.2);seg(hx-r,hy-2,hx-r-4,hy-1+w,1,acc);seg(hx-r,hy-2,hx-r-3,hy+1+w,1,dA)}
  else if(tp==='mohawk'){for(let i=0;i<4;i++)sp(hx-2+i*1.3,hy-r-2-(i===1||i===2?1:0),2,3,hair)}
  else if(tp==='horns'){seg(hx-1,hy-r+1,hx-4,hy-r-2,2,'#f4ecd8');seg(hx-4,hy-r-2,hx-6,hy-r-1,1,'#f4ecd8');seg(hx+2,hy-r+1,hx,hy-r-3,2,'#f4ecd8');seg(hx,hy-r-3,hx-2,hy-r-3,1,'#f4ecd8')}
  else if(tp==='antenna'){seg(hx,hy-r,hx-1,hy-r-5,1,'#9aa0b0');sdisc(hx-1,hy-r-6,1.5,ch.eye||'#ff5f6a')}
  else if(tp==='bun'){sdisc(hx-1,hy-r,r*.8,hair);sdisc(hx-3,hy-r-2,2,hair);sp(hx-r,hy-r+1,r+2,2,hair)}
  else if(tp==='long'){sdisc(hx-1,hy-r*.5,r*.85,hair);sp(hx-r,hy-r,r+3,3,hair)}
  else if(tp==='hair'){sdisc(hx-1,hy-r*.55,r*.8,hair);sp(hx-r,hy-r+1,r+3,2,hair)}
  else if(tp==='helmet'){sp(hx-r,hy-r,r*2,2,lt(acc));sp(hx-1,hy-r-2,3,2,ch.eye||'#ff5f6a')}
  else if(tp==='hood'){sp(hx-r-1,hy-r-1,r*2+1,2,suit)}
  else if(tp==='flower'){sdisc(hx-2,hy-r,2,'#ff5f9a');sdisc(hx+1,hy-r-1,2,'#ff8ac0');sp(hx-1,hy-r-1,1,1,'#ffd84a')}
  else if(tp==='leaf'){spoly([[hx-1,hy-r+1],[hx-5,hy-r-5],[hx+3,hy-r-3]],'#5cc85a');seg(hx,hy-r+1,hx-2,hy-r-3,1,'#2f8a3a')}
  /* front arm, hand and weapon */
  const af=endp(neckX+1,sY,P.aF||0,z.al*(P.eF||1));seg(neckX+1,sY,af[0],af[1],2,suit);
  const wa=(P.aF||0),wx=Math.sin(wa*D2R),wy=Math.cos(wa*D2R),wp=ch.weapon;
  if(wp==='sword'){seg(af[0],af[1],af[0]+wx*11,af[1]+wy*11,2,'#e8eef8');seg(af[0]+wx*2,af[1]+wy*2,af[0]+wx*10,af[1]+wy*10,1,WH);seg(af[0]-wy*2,af[1]+wx*2,af[0]+wy*2,af[1]-wx*2,1,'#ffd84a')}
  else if(wp==='staff'){seg(af[0]-wx*6,af[1]-wy*6,af[0]+wx*9,af[1]+wy*9,1,'#a86a34');sdisc(af[0]+wx*10,af[1]+wy*10,2,ch.fx||'#6af0ff')}
  else if(wp==='hammer'){seg(af[0],af[1],af[0]+wx*8,af[1]+wy*8,1,'#a86a34');const hx2=af[0]+wx*9,hy2=af[1]+wy*9;seg(hx2-wy*3,hy2+wx*3,hx2+wy*3,hy2-wx*3,4,'#9aa0b0')}
  else if(wp==='spear'){seg(af[0]-wx*5,af[1]-wy*5,af[0]+wx*11,af[1]+wy*11,1,'#a86a34');seg(af[0]+wx*11,af[1]+wy*11,af[0]+wx*14,af[1]+wy*14,2,'#e8eef8')}
  else if(wp==='fan'){spoly([[af[0],af[1]],[af[0]+wx*6-wy*4,af[1]+wy*6+wx*4],[af[0]+wx*6+wy*4,af[1]+wy*6-wx*4]],ch.fx||acc)}
  if(wp==='gloves')sdisc(af[0],af[1],2.2,acc);else if(wp==='claws'){sdisc(af[0],af[1],1.4,skin);seg(af[0],af[1],af[0]+wx*3,af[1]+wy*3,1,WH)}else sdisc(af[0],af[1],1.4,skin);
  /* the dark silhouette for the outline */
  lg.clearRect(0,0,SP,SP);lg.globalCompositeOperation='source-over';lg.drawImage(SPR,0,0);lg.globalCompositeOperation='source-in';lg.fillStyle=K;lg.fillRect(0,0,SP,SP);lg.globalCompositeOperation='source-over'}
/* puts the built sprite on the main canvas: feet at (x,y), facing face, optionally spinning, squashed, flashing */
function blitSprite(x,y,face,o={}){const sq=o.sq||1;ctx.save();ctx.translate(Math.round(x),Math.round(y));if(face<0)ctx.scale(-1,1);
  if(o.rot){ctx.translate(0,-10);ctx.rotate(o.rot);ctx.translate(0,10)}
  if(o.alpha!=null)ctx.globalAlpha=o.alpha;
  const dw=SP,dh=Math.round(SP*sq),dy=-OY*sq;
  for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])ctx.drawImage(SIL,-OX+a,dy+b,dw,dh);
  ctx.drawImage(SPR,-OX,dy,dw,dh);
  if(o.flash){ctx.globalAlpha=(o.alpha??1)*o.flash;ctx.drawImage(FLASHW(o.flashCol||'#ffffff'),-OX,dy,dw,dh)}
  ctx.restore()}
/* a white (or tinted) copy of the silhouette, for hit flashes */
let FLC=null,FLG=null;function FLASHW(col='#ffffff'){if(!FLC){FLC=document.createElement('canvas');FLC.width=FLC.height=SP;FLG=FLC.getContext('2d')}
  FLG.clearRect(0,0,SP,SP);FLG.drawImage(SIL,0,0);FLG.globalCompositeOperation='source-in';FLG.fillStyle=col;FLG.fillRect(0,0,SP,SP);FLG.globalCompositeOperation='source-over';return FLC}
function drawPuppet(ch,pose,x,y,face,t=0,o={}){const P=typeof pose==='string'?POSES[pose]||POSES.idle:pose;buildSprite(ch,P,t);blitSprite(x,y,face,Object.assign({sq:P.sq},o))}
/* a cached picture of each fighter standing (outline included), for the menus and the score panels */
const PORT=new Map();
function portrait(ch,pose='idle'){const key=ch.id+pose;let c=PORT.get(key);if(c)return c;buildSprite(ch,POSES[pose],0);c=document.createElement('canvas');c.width=c.height=SP;const g=c.getContext('2d');
  for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])g.drawImage(SIL,a,b);g.drawImage(SPR,0,0);PORT.set(key,c);return c}
