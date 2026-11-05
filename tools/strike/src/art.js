/* ================= drawing the fighters =================
   A small rig: hip, torso, a big round head, two-part arms and legs. Poses are degrees:
   [lean, front thigh, front shin, back thigh, back shin, front arm, front forearm, back arm, back forearm, weapon].
   A limb angle of 0 points down, 90 forward, 180 up; the shin and forearm angles add to the limb above them. */
const PO={stand:[0,18,-24,-14,10,30,95,-10,100,150],squat:[12,60,-110,-30,70,40,80,0,90,140],jump:[-4,70,-120,-10,-60,150,20,-150,-20,170],
  fall:[0,25,-40,-25,-10,110,30,-110,-30,150],shield:[8,40,-70,-30,40,60,100,40,100,120],hit:[-25,40,-20,-40,30,160,40,-160,-40,200],
  ledge:[0,10,-10,-10,10,175,0,170,5,180],guard:[6,30,-40,-24,20,120,60,110,70,160],
  jabW:[-5,20,-24,-14,10,0,140,-10,100,140],jabK:[12,24,-24,-18,10,90,0,-20,90,90],
  jab2W:[-5,20,-24,-14,10,30,95,-40,140,150],jab2K:[14,24,-24,-18,10,10,90,90,0,120],
  kickW:[-10,70,-110,-14,10,40,90,-30,90,170],kickK:[-18,95,0,-20,10,60,60,-60,60,70],
  dashkW:[10,50,-80,-30,40,60,60,-40,60,160],dashkK:[-25,100,-5,-40,90,110,40,-60,60,80],
  sideW:[-12,25,-30,-25,15,-60,120,-20,100,220],sideK:[22,45,-40,-30,20,95,-5,-50,60,60],
  upkW:[8,40,-70,-30,40,40,80,-20,90,70],upkK:[-14,10,-10,-30,10,175,0,-40,60,190],
  sweepW:[10,60,-120,-40,70,40,70,-30,80,120],sweepK:[16,100,0,-40,80,80,30,-60,40,85],
  nairW:[0,60,-110,-20,-80,120,30,-120,-30,160],nairK:[0,100,-5,-100,5,100,10,-100,-10,100],
  fairW:[-14,50,-100,-20,-60,190,-20,-40,60,210],fairK:[24,80,-50,-20,-60,70,10,-60,40,50],
  bairW:[10,50,-100,-20,-60,60,60,-40,60,140],bairK:[-14,40,-100,-110,-5,60,60,-90,0,250],
  uairW:[6,60,-100,-30,-60,60,60,-60,40,90],uairK:[-14,60,-110,-20,-60,178,0,-150,0,185],
  dairW:[0,50,-110,-30,-70,150,0,-150,0,190],dairK:[0,8,-4,-8,4,20,10,-20,-10,10],
  grabW:[10,20,-24,-14,10,60,40,-60,40,150],grabK:[18,24,-24,-18,10,90,0,85,0,150],
  castW:[-12,24,-28,-18,10,-40,100,0,90,200],castK:[14,30,-30,-24,12,90,0,40,50,100],
  riseW:[10,60,-110,-30,70,60,80,-20,90,120],riseK:[-8,10,-10,-20,-20,178,0,-30,90,180],
  dashpW:[-10,40,-60,-30,30,40,80,-30,90,160],dashpK:[30,60,-40,-40,40,100,0,-80,0,90],
  stompW:[0,70,-120,-20,-80,150,0,-150,0,170],stompK:[0,10,-4,-10,4,40,40,-40,-40,30],
  hookK:[10,24,-24,-18,10,140,0,-20,90,140],flapK:[0,30,-40,-30,-20,95,0,-95,0,120],spinK:[0,30,-40,-30,-20,100,0,-100,0,100],
  ballK:[0,100,-150,80,-150,120,-120,100,-120,150]};
const NPOSE={jab1:'jab',jab2:'jab2',jab3:'kick',dash:'dashk',side:'side',up:'upk',down:'sweep',nair:'nair',fair:'fair',bair:'bair',uair:'uair',dair:'dair',grab:'grab'};
const SPOSE={rise:['rise',4],rocket:['rise',10],spinup:['spin',0],warp:['rise',10],flutter:['flap',0],spring:['rise',0],hook:['hook',6],flame:['rise',5],
  dash:['dashp',4],fireball:['cast',8],boomerang:['cast',8],charge:['dashp',14],whip:['side',9],drill:['jab',5],triple:['cast',7],beam:['cast',14],roll:['ball',6],grab:['grab',8],arc:['cast',9],
  stomp:['stomp',6],counter:['guard',4],mine:['sweep',10],quake:['stomp',12],reflect:['guard',3],spin:['spin',0],bomb:['cast',10],drain:['grab',8],trap:['cast',10]};
const HAIRS=['#2a1a14','#5a3420','#e8c860','#c8401c','#141420','#eeeef4','#7a4ab8','#3a7ad8','#e86aa0','#3a2a1a'];
const mixP=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const D2R=Math.PI/180;
function basePose(f){const st=f.st;
  if(st==='stand'){const sp=Math.abs(f.vx);if(sp>.6){const ph=f.anim*(1.1+sp*.12),s=Math.sin(ph),k=Math.min(1,sp/3.5);
      return[14*k,18+42*s*k,-30-25*Math.max(0,-s)*k,-14-42*s*k,10-40*Math.max(0,s)*k,30-60*s*k,95,-10+60*s*k,100,150]}
    const b=Math.sin(f.anim*.35)*3;return[PO.stand[0],PO.stand[1]+b,PO.stand[2]-b*2,PO.stand[3]-b,PO.stand[4]+b*2,...PO.stand.slice(5)]}
  if(st==='squat'||st==='land'||st==='down')return PO.squat;if(st==='shield')return PO.shield;if(st==='ledge')return PO.ledge;
  if(st==='hit'||st==='held'||st==='stun'||st==='dizzy')return PO.hit;if(st==='roll'||st==='dodge')return PO.ballK;
  if(f.gr)return PO.stand;return f.vy<0?mixP(PO.fall,PO.jump,clamp(-f.vy/6,0,1)):PO.fall}
function poseOf(f){const st=f.st,m=f.mv;let P=basePose(f),spin=0;
  if(st==='atk'&&m){const d=m.d,n=NPOSE[m.k],W=PO[n+'W'],K=PO[n+'K'],t=m.t;
    if(t<=d.s)P=mixP(P,W,t/d.s);else if(t<=d.s+d.a)P=K;else P=mixP(K,P,clamp((t-d.s-d.a)/d.r,0,1));if(m.k==='nair'&&t>d.s)spin=0}
  else if(st==='sp'&&m){const[n,s]=SPOSE[m.sp],W=PO[n+'W']||P,K=PO[n+'K'],t=m.t;P=t<s?mixP(P,W,s?t/s:1):K;
    if(n==='spin'||m.sp==='spinup')spin=t*.55*f.face;if(m.sp==='flutter')P=mixP(P,PO.flapK,.5+.5*Math.sin(t*.6));if(m.sp==='drill')P=t%6<3?PO.jabK:PO.jab2K;
    if(m.sp==='roll'&&t>=s)spin=t*.5*f.face;if(m.sp==='rocket'&&m.dx!=null)spin=Math.atan2(m.dx,-m.dy)*.9}
  else if(st==='hit'&&f.tumble)spin=f.t*.35*f.face;else if(st==='roll'||st==='dodge')spin=f.t*.45*(st==='roll'?f.rd:f.face);else if(st==='down')spin=-Math.PI/2*f.face;
  return{P,spin}}
/* joints for a pose, in the fighter's own frame (facing right, feet at 0,0) */
function rig(P,s,grounded){const a=v=>v*D2R,dirv=(t)=>[Math.sin(t),Math.cos(t)],L=7*s,A=6*s;
  const lf1=a(P[1]),lf2=lf1+a(P[2]),lb1=a(P[3]),lb2=lb1+a(P[4]);
  const fy=Math.max(Math.cos(lf1)+Math.cos(lf2),Math.cos(lb1)+Math.cos(lb2))*L;const hipY=grounded?-fy:-13*s;
  const hip=[0,hipY],lean=a(P[0]),neck=[hip[0]+Math.sin(lean)*11*s,hip[1]-Math.cos(lean)*11*s];
  const head=[neck[0]+Math.sin(lean)*7*s,neck[1]-Math.cos(lean)*7*s],sh=[neck[0]-Math.sin(lean)*1.5*s,neck[1]+2*s];
  const j=(o,t1,t2,l)=>{const d1=dirv(t1),k=[o[0]+d1[0]*l,o[1]+d1[1]*l],d2=dirv(t2);return[k,[k[0]+d2[0]*l,k[1]+d2[1]*l]]};
  const af1=a(P[5]),af2=af1+a(P[6]),ab1=a(P[7]),ab2=ab1+a(P[8]);
  return{hip,neck,head,sh,lf:j(hip,lf1,lf2,L),lb:j(hip,lb1,lb2,L),af:j(sh,af1,af2,A),ab:j(sh,ab1,ab2,A),w:a(P[9])}}
const OUT='#07070f';
function limb(p0,k,p1,w,col){ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(k[0],k[1]);ctx.lineTo(p1[0],p1[1]);ctx.lineWidth=w+2.2;ctx.strokeStyle=OUT;ctx.stroke();ctx.lineWidth=w;ctx.strokeStyle=col;ctx.stroke()}
function dot(x,y,r,col,out=true){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(out){ctx.lineWidth=2;ctx.strokeStyle=OUT;ctx.stroke()}ctx.fillStyle=col;ctx.fill()}
function weaponTip(c,R){const W=c.weapon,hand=R.af[1],len={sword:20,katana:23,dagger:10,axe:18,hammer:18,spear:26,staff:24,fan:9,claws:7}[W]||0;
  return[hand[0]+Math.sin(R.w)*len*c.sz,hand[1]+Math.cos(R.w)*len*c.sz]}
function drawWeapon(c,R){const W=c.weapon,s=c.sz,h=R.af[1],t=R.w,dx=Math.sin(t),dy=Math.cos(t),px=-dy,py=dx;
  const L=(n)=>[h[0]+dx*n*s,h[1]+dy*n*s],line=(a,b,w,col)=>{ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineWidth=w+2;ctx.strokeStyle=OUT;ctx.stroke();ctx.lineWidth=w;ctx.strokeStyle=col;ctx.stroke()};
  ctx.lineCap='round';
  if(W==='sword'||W==='katana'||W==='dagger'){const n=W==='katana'?23:W==='dagger'?10:20;line(L(-3),L(1),2.6,'#3a2a1a');
    if(W!=='katana'){const g=L(1.5);line([g[0]-px*4,g[1]-py*4],[g[0]+px*4,g[1]+py*4],2,c.acc)}
    const b0=L(2),b1=L(n);ctx.beginPath();ctx.moveTo(b0[0]+px*1.6,b0[1]+py*1.6);ctx.lineTo(b1[0],b1[1]);ctx.lineTo(b0[0]-px*1.6,b0[1]-py*1.6);ctx.closePath();
    ctx.lineWidth=1.6;ctx.strokeStyle=OUT;ctx.stroke();ctx.fillStyle=W==='katana'?'#e8f0ff':'#d8dce8';ctx.fill();return}
  if(W==='axe'||W==='hammer'){line(L(-4),L(18),2.4,'#6a4a2a');const e=L(15);ctx.save();ctx.translate(e[0],e[1]);ctx.rotate(-t);
    ctx.beginPath();if(W==='axe'){ctx.moveTo(0,-4);ctx.quadraticCurveTo(9,-2,9,6);ctx.lineTo(0,3)}else{ctx.rect(-6,-4,12,9)}ctx.closePath();ctx.lineWidth=2;ctx.strokeStyle=OUT;ctx.stroke();ctx.fillStyle=W==='axe'?'#c8ccd8':c.acc;ctx.fill();ctx.restore();return}
  if(W==='spear'||W==='staff'){line(L(-10),L(W==='spear'?24:22),2.2,W==='spear'?'#7a5a3a':'#8a6a4a');const e=L(W==='spear'?24:23);
    if(W==='spear'){ctx.beginPath();ctx.moveTo(e[0]+dx*6,e[1]+dy*6);ctx.lineTo(e[0]+px*2.6,e[1]+py*2.6);ctx.lineTo(e[0]-px*2.6,e[1]-py*2.6);ctx.closePath();ctx.lineWidth=1.6;ctx.strokeStyle=OUT;ctx.stroke();ctx.fillStyle='#d8dce8';ctx.fill()}
    else dot(e[0],e[1],3.4,c.acc);return}
  if(W==='fan'){ctx.beginPath();ctx.moveTo(h[0],h[1]);ctx.arc(h[0],h[1],10*s,-t+Math.PI/2-.7,-t+Math.PI/2+.7);ctx.closePath();ctx.lineWidth=1.8;ctx.strokeStyle=OUT;ctx.stroke();ctx.fillStyle=c.acc;ctx.fill();return}
  if(W==='claws'){for(const o of[-2,0,2]){const a=[h[0]+px*o,h[1]+py*o];line(a,[a[0]+dx*7*s,a[1]+dy*7*s],1.2,'#e8e8f0')}}}
function drawHead(c,x,y,s,face=1,look=0){const r=8.6*s,hair=HAIRS[(c.i*3)%HAIRS.length],H=c.head;ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.lineJoin='round';
  const back=()=>{ctx.fillStyle=hair;ctx.strokeStyle=OUT;ctx.lineWidth=2;
    if(H==='long'){ctx.beginPath();ctx.ellipse(-3*s,4*s,8*s,10*s,0,0,TAU);ctx.stroke();ctx.fill()}
    if(H==='ponytail'){ctx.beginPath();ctx.ellipse(-10*s,1*s,4*s,7*s,-.6,0,TAU);ctx.stroke();ctx.fill()}
    if(H==='afro'){ctx.beginPath();ctx.arc(-1*s,-3*s,12*s,0,TAU);ctx.stroke();ctx.fill()}
    if(H==='bun'){for(const bx of[-7,5]){ctx.beginPath();ctx.arc(bx*s,-7*s,3.6*s,0,TAU);ctx.stroke();ctx.fill()}}
    if(H==='mask'||H==='bandana'||H==='band'){ctx.strokeStyle=H==='mask'?'#c82a3a':c.acc;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-7*s,-2*s);ctx.quadraticCurveTo(-13*s,0,-15*s,4*s+Math.sin(FRAME*.2)*2);ctx.stroke()}};
  back();dot(0,0,r,c.skin);
  /* hair / hats */
  ctx.fillStyle=hair;ctx.strokeStyle=OUT;ctx.lineWidth=1.8;const cap=(col,a0=Math.PI*1.05,a1=Math.PI*1.95,dy=0)=>{ctx.beginPath();ctx.arc(0,dy,r+.6,a0,a1);ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.stroke()};
  const hairCap=()=>{ctx.beginPath();ctx.arc(0,0,r+.8,Math.PI*.95,Math.PI*2.02);ctx.quadraticCurveTo(2*s,-3*s,-6*s,-1*s);ctx.closePath();ctx.fillStyle=hair;ctx.fill();ctx.stroke()};
  switch(H){
    case'flame':{const t=FRAME*.3;ctx.beginPath();ctx.moveTo(-9*s,-1*s);for(let i=0;i<5;i++){const xx=-8*s+i*4*s;ctx.lineTo(xx+1*s,-(13+Math.sin(t+i)*2+(i===2?4:0))*s);ctx.lineTo(xx+3*s,-6*s)}ctx.lineTo(9*s,-1*s);ctx.closePath();ctx.fillStyle=c.acc;ctx.fill();ctx.stroke();break}
    case'knight':cap(c.body,Math.PI*.7,Math.PI*2.3);ctx.fillStyle=OUT;ctx.fillRect(1*s,-2.5*s,8*s,2.4*s);ctx.fillStyle=c.acc;ctx.beginPath();ctx.ellipse(-2*s,-11*s,2.4*s,6*s,-.5,0,TAU);ctx.fill();ctx.stroke();break;
    case'mohawk':ctx.beginPath();ctx.moveTo(-8*s,-4*s);ctx.lineTo(-5*s,-14*s);ctx.lineTo(-1*s,-9*s);ctx.lineTo(2*s,-15*s);ctx.lineTo(5*s,-8*s);ctx.closePath();ctx.fillStyle=c.acc;ctx.fill();ctx.stroke();break;
    case'ponytail':case'long':case'band':case'bun':case'cat':case'horns':case'crown':case'visor':case'bandana':hairCap();break;
    case'bald':ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(-2*s,-5*s,2.4*s,1.4*s,-.4,0,TAU);ctx.fill();break;
    case'helmet':cap(c.acc,Math.PI*.95,Math.PI*2.05,-.5);ctx.fillStyle=c.body;ctx.beginPath();ctx.ellipse(-1*s,-10*s,6*s,2.6*s,0,0,TAU);ctx.fill();ctx.stroke();break;
    case'antenna':cap(c.body);ctx.strokeStyle=OUT;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-1*s,-8*s);ctx.lineTo(-3*s,-15*s);ctx.stroke();dot(-3*s,-15.5*s,2*s,c.acc);break;
    case'wizard':ctx.beginPath();ctx.moveTo(-12*s,-4*s);ctx.lineTo(11*s,-4*s);ctx.lineTo(1*s,-8*s);ctx.lineTo(-8*s,-24*s);ctx.lineTo(-5*s,-7*s);ctx.closePath();ctx.fillStyle=c.body;ctx.fill();ctx.stroke();ctx.fillStyle=c.acc;ctx.fillRect(-6*s,-8*s,8*s,2*s);break;
    case'cap':case'beanie':cap(c.acc,Math.PI*.98,Math.PI*2.02,-1);if(H==='cap'){ctx.beginPath();ctx.ellipse(8*s,-3*s,6*s,1.8*s,.1,0,TAU);ctx.fillStyle=c.acc;ctx.fill();ctx.stroke()}else dot(0,-10*s,2.4*s,'#ffffff');break;
    case'hood':ctx.beginPath();ctx.arc(0,-.5,r+2.2,Math.PI*.55,Math.PI*2.35);ctx.lineTo(4*s,6*s);ctx.closePath();ctx.fillStyle=c.body;ctx.fill();ctx.stroke();break;
    case'topknot':hairCap();dot(-1*s,-11*s,3*s,hair);break;
    case'afro':ctx.beginPath();ctx.arc(-1*s,-4*s,10*s,Math.PI*.9,Math.PI*2.1);ctx.fillStyle=hair;ctx.fill();break;
    case'cowboy':ctx.beginPath();ctx.ellipse(0,-5*s,14*s,2.6*s,0,0,TAU);ctx.fillStyle='#8a5a2a';ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-7*s,-5*s);ctx.lineTo(-6*s,-13*s);ctx.lineTo(6*s,-13*s);ctx.lineTo(7*s,-5*s);ctx.closePath();ctx.fill();ctx.stroke();break;
    case'spiky':ctx.beginPath();ctx.moveTo(-10*s,0);for(let i=0;i<6;i++){ctx.lineTo((-11+i*4)*s,(-13-(i%2)*3)*s);ctx.lineTo((-8+i*4)*s,-6*s)}ctx.lineTo(9*s,-2*s);ctx.closePath();ctx.fillStyle=hair;ctx.fill();ctx.stroke();break;
    case'mask':hairCap();break}
  if(H==='band'||H==='bandana'||H==='mask'){ctx.fillStyle=H==='mask'?'#c82a3a':c.acc;ctx.fillRect(-r,-5*s,2*r,2.6*s)}
  if(H==='cat'){for(const ex of[-5,2]){ctx.beginPath();ctx.moveTo(ex*s,-6*s);ctx.lineTo((ex+1.5)*s,-14*s);ctx.lineTo((ex+5)*s,-7*s);ctx.closePath();ctx.fillStyle=hair;ctx.fill();ctx.stroke()}}
  if(H==='horns'){for(const ex of[-6,4]){ctx.beginPath();ctx.moveTo(ex*s,-6*s);ctx.quadraticCurveTo((ex-3)*s,-13*s,(ex+1)*s,-16*s);ctx.lineTo((ex+3)*s,-7*s);ctx.closePath();ctx.fillStyle='#e8e0c8';ctx.fill();ctx.stroke()}}
  if(H==='crown'){ctx.beginPath();ctx.moveTo(-6*s,-6*s);ctx.lineTo(-6*s,-13*s);ctx.lineTo(-3*s,-9*s);ctx.lineTo(0,-14*s);ctx.lineTo(3*s,-9*s);ctx.lineTo(6*s,-13*s);ctx.lineTo(6*s,-6*s);ctx.closePath();ctx.fillStyle='#ffd84a';ctx.fill();ctx.stroke()}
  /* face */
  const hood=H==='hood',ex=2.4*s+look,ey=-.5*s;
  if(hood){ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.arc(1*s,0,r-1.2,0,TAU);ctx.fill();for(const e of[0,4])dot(ex+e*s,ey,1.3*s,c.acc,false)}
  else if(H==='visor'){ctx.fillStyle=c.acc;rrect(-1*s,-3.4*s,10*s,4*s,2*s);ctx.fill();ctx.lineWidth=1.4;ctx.strokeStyle=OUT;ctx.stroke()}
  else{for(const e of[0,4.2]){ctx.fillStyle=OUT;ctx.beginPath();ctx.ellipse(ex+e*s,ey,1.1*s,1.9*s,0,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(ex+e*s-.2*s,ey-1.4*s,.8*s,.8*s)}
    if(H==='mask'){ctx.fillStyle='#24242e';ctx.beginPath();ctx.arc(0,0,r,Math.PI*-.05,Math.PI*.75);ctx.closePath();ctx.fill()}
    else{ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(3.5*s,3.4*s);ctx.lineTo(6*s,3.2*s);ctx.stroke()}}
  ctx.restore()}
/* the whole fighter at its spot in the world */
function drawFighter(f,alpha=1){if(f.st==='ko'||f.hide)return;const c=f.c,s=c.sz,{P,spin}=poseOf(f);const R=rig(P,s,!!f.gr||f.st==='ledge');
  ctx.save();ctx.translate(f.x+(f.hl>0&&f.st==='hit'?(FRAME%2?1.5:-1.5):0),f.y);
  if(f.inv>0&&(f.st==='spawn'||f.st==='ledge'||FRAME%6<3))alpha*=f.st==='roll'||f.st==='dodge'?.55:.75;ctx.globalAlpha=alpha;
  /* shadow */
  if(f.gr){ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,0,11*s,2.4*s,0,0,TAU);ctx.fill()}
  ctx.scale(f.face,1);if(f.st==='ledge')ctx.translate(0,-6);
  if(spin){ctx.translate(0,-16*s);ctx.rotate(spin*f.face);ctx.translate(0,16*s)}
  ctx.lineCap='round';ctx.lineJoin='round';
  const dark=shade(c.body,-.35),skin=c.skin,glove=c.weapon==='gloves'?c.acc:skin;
  limb(R.sh,R.ab[0],R.ab[1],3.8*s,dark);dot(R.ab[1][0],R.ab[1][1],2.4*s,glove==='skin'?skin:shade(glove,-.2));
  limb(R.hip,R.lb[0],R.lb[1],4.6*s,dark);dot(R.lb[1][0]+1,R.lb[1][1],2.6*s,'#1a1a24');
  /* torso */
  ctx.beginPath();ctx.moveTo(R.hip[0],R.hip[1]);ctx.lineTo(R.neck[0],R.neck[1]);ctx.lineWidth=11*s+2.2;ctx.strokeStyle=OUT;ctx.stroke();ctx.lineWidth=11*s;ctx.strokeStyle=c.body;ctx.stroke();
  ctx.beginPath();const mx=(R.hip[0]*.75+R.neck[0]*.25),my=(R.hip[1]*.75+R.neck[1]*.25);ctx.moveTo(mx-5*s,my);ctx.lineTo(mx+5*s,my);ctx.lineWidth=2.4*s;ctx.strokeStyle=c.acc;ctx.stroke();
  limb(R.hip,R.lf[0],R.lf[1],4.6*s,c.body);dot(R.lf[1][0]+1,R.lf[1][1],2.6*s,'#1a1a24');
  drawHead(c,R.head[0],R.head[1],s,1,f.st==='hit'?-1:0);
  if(f.st==='hit'||f.st==='dizzy'){ctx.strokeStyle=OUT;ctx.lineWidth=1.2;const hx=R.head[0]+2.6*s,hy=R.head[1];for(const e of[0,4.2]){ctx.beginPath();ctx.moveTo(hx+e*s-1.4,hy-2);ctx.lineTo(hx+e*s+1.4,hy+1);ctx.moveTo(hx+e*s+1.4,hy-2);ctx.lineTo(hx+e*s-1.4,hy+1);ctx.stroke()}}
  if(c.weapon!=='none'&&c.weapon!=='gloves')drawWeapon(c,R);
  limb(R.sh,R.af[0],R.af[1],3.8*s,c.body);dot(R.af[1][0],R.af[1][1],(c.weapon==='gloves'?3.4:2.4)*s,glove);
  if(f.flash>0){ctx.globalAlpha=f.flash/10;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,-16*s,18*s,0,TAU);ctx.fill()}
  ctx.restore();
  /* where the strike is: remember the tip for a swoosh trail */
  const strike=(f.st==='atk'&&f.mv&&f.mv.t>f.mv.d.s-1&&f.mv.t<=f.mv.d.s+f.mv.d.a+1)||(f.st==='sp'&&f.boxes.length);
  if(strike){const pts=[R.af[1],R.lf[1],R.lb[1]];if(c.weapon!=='none'&&c.weapon!=='gloves')pts.push(weaponTip(c,R));let best=pts[0],bd=-1;
    for(const p of pts){const d=Math.hypot(p[0]-R.hip[0],p[1]-R.hip[1]);if(d>bd){bd=d;best=p}}
    const sp=spin?spin*f.face:0,cx=0,cy=-16*s,rx=best[0]-cx,ry=best[1]-cy,wx=rx*Math.cos(sp)-ry*Math.sin(sp)+cx,wy=rx*Math.sin(sp)+ry*Math.cos(sp)+cy;
    f.trail.push([f.x+wx*f.face,f.y+wy,6])}
  for(const t of f.trail)t[2]--;f.trail=f.trail.filter(t=>t[2]>0)}
function drawTrail(f){const T=f.trail;if(T.length<2)return;ctx.lineCap='round';for(let i=1;i<T.length;i++){const a=T[i-1],b=T[i];ctx.globalAlpha=b[2]/6*.85;ctx.strokeStyle=f.c.fx;ctx.lineWidth=5*b[2]/6+1;
  ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=1.6*b[2]/6;ctx.stroke()}ctx.globalAlpha=1}
