/* ================= drawing the fighters =================
   A realistic body seen from the side: tapered legs and arms, a shaped torso with light from the moon side,
   a small head with hair or a hat, shoes and hands, and the fighter's weapon.
   Poses are degrees: [lean, front thigh, front shin, back thigh, back shin, front arm, front forearm, back arm, back forearm, weapon].
   A limb angle of 0 points down, 90 forward, 180 up; the shin and forearm angles add to the limb above them. */
const PO={
  standC:[6,20,-26,-18,8,40,115,10,130,150],standM:[4,22,-28,-16,10,35,60,-5,80,150],standL:[2,14,-16,-12,8,60,30,30,70,90],
  squat:[10,60,-110,-30,70,40,90,10,100,140],jump:[-4,70,-120,-10,-60,120,30,-120,-30,170],fall:[0,25,-40,-25,-10,100,30,-100,-30,150],
  shield:[8,40,-70,-30,40,50,120,30,130,150],hit:[-25,40,-20,-40,30,160,40,-160,-40,200],ledge:[0,10,-10,-10,10,175,0,170,5,180],
  guardK:[6,30,-40,-24,20,120,60,110,70,160],ballK:[0,100,-150,80,-150,120,-120,100,-120,150],
  jabW:[4,20,-26,-18,8,30,110,10,130,150],jabK:[12,22,-26,-20,8,90,0,10,130,90],
  crossW:[6,20,-26,-18,8,40,115,10,130,150],crossK:[16,22,-26,-22,10,40,110,90,0,150],
  kneeW:[0,40,-60,-18,8,30,110,10,130,150],kneeK:[-6,100,-120,-14,6,40,100,-20,120,150],
  straightW:[-6,24,-30,-18,8,10,120,0,130,150],straightK:[20,40,-30,-30,14,92,0,0,130,90],
  backfistW:[6,20,-26,-18,8,60,90,10,130,150],backfistK:[-10,14,-20,-24,10,-100,10,20,120,200],
  uppercutW:[10,40,-60,-30,30,10,40,10,130,150],uppercutK:[-10,14,-14,-20,4,165,10,10,130,180],
  lowkickW:[6,40,-70,-20,10,40,110,10,130,150],lowkickK:[10,85,-5,-30,40,50,100,10,120,150],
  dashkW:[10,40,-60,-30,30,60,60,-40,60,160],dashkK:[-25,95,-5,-40,80,110,40,-60,60,80],
  nairW:[0,60,-110,-20,-80,120,30,-120,-30,160],nairK:[0,100,-5,-100,5,100,10,-100,-10,100],
  fairPW:[-10,50,-100,-20,-60,20,120,-40,60,150],fairPK:[20,60,-90,-20,-60,92,0,-40,60,90],
  bairKW:[10,50,-100,-20,-60,60,60,-40,60,150],bairKK:[-14,40,-100,-110,-5,60,60,-60,40,150],
  uairKW:[6,60,-100,-30,-60,60,60,-60,40,90],uairKK:[-14,150,-30,-20,-60,60,60,-60,40,150],
  dairKW:[0,50,-110,-30,-70,120,20,-120,-20,150],dairKK:[0,10,-4,-8,4,60,60,-60,-60,150],
  slash1W:[-6,22,-28,-16,10,140,20,-5,80,200],slash1K:[14,24,-28,-20,10,80,-10,-5,80,60],
  slash2W:[10,22,-28,-16,10,60,-20,-5,80,50],slash2K:[6,24,-28,-20,10,120,10,-5,80,170],
  thrustW:[-10,24,-30,-18,10,20,90,-5,80,100],thrustK:[22,40,-34,-30,14,92,0,-10,70,92],
  lungeW:[-10,24,-30,-18,10,0,100,-10,90,110],lungeK:[28,60,-40,-40,20,92,0,-40,40,92],
  backslashW:[6,22,-28,-16,10,120,10,-5,80,140],backslashK:[-14,18,-24,-24,12,-110,20,-5,80,250],
  upslashW:[10,40,-60,-30,30,70,0,-10,80,60],upslashK:[-10,14,-14,-20,4,170,0,-10,80,185],
  lowslashW:[10,50,-90,-30,50,120,10,-10,80,140],lowslashK:[16,60,-90,-30,50,70,10,-10,80,75],
  dashslashW:[10,40,-60,-30,30,140,10,-20,60,200],dashslashK:[-10,90,-10,-40,80,90,0,-40,40,88],
  spinslashW:[0,60,-110,-20,-80,100,0,-100,0,100],spinslashK:[0,60,-100,-20,-60,92,0,-92,0,92],
  overheadW:[-14,50,-100,-20,-60,170,0,-40,60,190],overheadK:[20,60,-90,-20,-60,70,0,-40,60,60],
  backslashAW:[10,50,-100,-20,-60,60,30,-40,60,120],backslashAK:[-14,40,-100,-60,-30,-100,20,-40,60,255],
  arcUpW:[6,60,-100,-30,-60,60,30,-60,40,70],arcUpK:[-14,60,-110,-20,-60,175,0,-60,40,190],
  stabW:[0,50,-110,-30,-70,150,0,-60,60,180],stabK:[0,20,-10,-20,10,10,0,-20,40,2],
  aimW:[2,14,-16,-12,8,70,20,30,70,90],aimK:[0,14,-16,-12,8,90,0,40,55,90],
  aimHeavyW:[-6,24,-30,-18,10,80,10,50,45,90],aimHeavyK:[-10,26,-34,-20,12,90,0,55,40,90],
  backkickW:[10,20,-26,-18,8,60,30,30,70,90],backkickK:[14,18,-24,-100,0,60,30,30,70,90],
  aimUpW:[0,14,-16,-12,8,120,10,60,60,150],aimUpK:[-6,14,-16,-12,8,170,0,90,60,175],
  aimDownW:[0,50,-100,-30,-60,60,20,30,60,60],aimDownK:[0,50,-100,-30,-60,10,0,20,20,5],
  grabW:[10,20,-26,-18,8,60,40,40,50,150],grabK:[16,24,-26,-20,8,90,0,85,0,150],
  throwW:[-10,24,-28,-18,10,-60,100,20,80,200],throwK:[14,30,-30,-24,12,110,0,30,60,120],
  castW:[-12,24,-28,-18,10,-40,100,0,90,200],castK:[14,30,-30,-24,12,90,0,70,20,100],
  riseW:[10,60,-110,-30,70,60,80,-20,90,120],riseK:[-8,10,-10,-20,-20,178,0,-30,90,180],
  hookK:[10,24,-24,-18,10,140,0,-20,90,140],spinK:[0,30,-40,-30,-20,100,0,-100,0,100]};
const SPOSE={jetpack:['jump',6],recoil:['aimDown',7],warp:['rise',10],hover:['jump',0],rocket:['aimHeavy',14],grenade:['throw',9],beam:['aim',14],shotgun:['aimHeavy',10],
  orb:['cast',10],snipe:['aim',22],burst:['aim',6],sticky:['throw',8],risestab:['upslash',4],spinup:['spin',0],leap:['upslash',0],hook:['hook',6],
  dash:['dashslash',4],wave:['slash1',10],counter:['guard',4],drill:['thrust',5],dive:['overhead',12],whirl:['spin',0],
  uppercut:['uppercut',4],flameup:['uppercut',5],helikick:['spin',0],leapup:['jump',0],rush:['straight',14],grab:['grab',8],flurry:['jab',5],flykick:['dashk',5],palm:['straight',9]};
const mixP=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const D2R=Math.PI/180;
function basePose(f){const st=f.st,S=PO['stand'+f.c.grp];
  if(st==='stand'){const sp=Math.abs(f.vx);if(sp>.6){const ph=f.anim*(.9+sp*.11),s=Math.sin(ph),k=Math.min(1,sp/3.5),g=f.c.grp;
      return[12*k,20+44*s*k,-30-35*Math.max(0,-s)*k,-16-44*s*k,10-50*Math.max(0,s)*k,g==='L'?60:30-55*s*k,g==='L'?30:90,g==='L'?30:-10+55*s*k,g==='L'?70:95,g==='M'?120:90]}
    const b=Math.sin(f.anim*.3)*2.5;return[S[0],S[1]+b,S[2]-b*2,S[3]-b,S[4]+b*2,...S.slice(5)]}
  if(st==='squat'||st==='land'||st==='down')return PO.squat;if(st==='shield')return PO.shield;if(st==='ledge')return PO.ledge;
  if(st==='hit'||st==='held'||st==='stun'||st==='dizzy')return PO.hit;if(st==='roll'||st==='dodge')return PO.ballK;
  if(f.gr)return S;return f.vy<0?mixP(PO.fall,PO.jump,clamp(-f.vy/6,0,1)):PO.fall}
function poseOf(f){const st=f.st,m=f.mv;let P=basePose(f),spin=0;
  if(st==='atk'&&m){const d=m.d,n=d.pose,W=PO[n+'W']||P,K=PO[n+'K']||P,t=m.t;
    if(t<=d.s)P=mixP(P,W,t/Math.max(1,d.s));else if(t<=d.s+d.a+1)P=K;else P=mixP(K,P,clamp((t-d.s-d.a-1)/d.r,0,1));if((n==='spinslash'||n==='nair')&&t>d.s&&t<=d.s+d.a)spin=(t-d.s)*.7}
  else if(st==='sp'&&m){const[n,s]=SPOSE[m.sp],W=PO[n+'W']||P,K=PO[n+'K']||P,t=m.t;P=t<s?mixP(P,W,s?t/s:1):K;
    if(n==='spin')spin=t*.55;if(m.sp==='flurry')P=t%6<3?PO.jabK:PO.crossK;if(m.sp==='drill')P=t%6<3?PO.thrustK:PO.thrustW;
    if(m.sp==='hover'||m.sp==='jetpack')P=mixP(PO.jump,PO.fall,.5)}
  else if(st==='hit'&&f.tumble)spin=f.t*.35;else if(st==='roll'||st==='dodge')spin=f.t*.45*(st==='roll'?f.rd*f.face:1);else if(st==='down')spin=-Math.PI/2;
  return{P,spin}}
/* joints for a pose, in the fighter's own frame (facing right, feet at 0,0) */
function rig(P,s,grounded){const a=v=>v*D2R,dv=t=>[Math.sin(t),Math.cos(t)],L=9.5*s,A1=7.2*s,A2=7*s;
  const lf1=a(P[1]),lf2=lf1+a(P[2]),lb1=a(P[3]),lb2=lb1+a(P[4]);
  const fy=Math.max(Math.cos(lf1)+Math.cos(lf2),Math.cos(lb1)+Math.cos(lb2))*L;const hipY=grounded?-fy:-17*s;
  const hip=[0,hipY],lean=a(P[0]),up=[Math.sin(lean),-Math.cos(lean)],neck=[hip[0]+up[0]*13*s,hip[1]+up[1]*13*s];
  const head=[neck[0]+up[0]*4.6*s+.6*s,neck[1]+up[1]*4.6*s],sh=[neck[0]-up[0]*1.6*s,neck[1]-up[1]*1.6*s];
  const j=(o,t1,t2,l1,l2)=>{const d1=dv(t1),k=[o[0]+d1[0]*l1,o[1]+d1[1]*l1],d2=dv(t2);return[k,[k[0]+d2[0]*l2,k[1]+d2[1]*l2],t2]};
  const af1=a(P[5]),af2=af1+a(P[6]),ab1=a(P[7]),ab2=ab1+a(P[8]);
  return{hip,neck,head,sh,up,lean,lf:j(hip,lf1,lf2,L,L),lb:j(hip,lb1,lb2,L,L),af:j(sh,af1,af2,A1,A2),ab:j(sh,ab1,ab2,A1,A2),w:a(P[9])}}
const OUT='#0a0a12';
/* a limb segment as a tapered shape with a thin dark edge */
function seg(p0,p1,w0,w1,col){const dx=p1[0]-p0[0],dy=p1[1]-p0[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
  ctx.beginPath();ctx.moveTo(p0[0]+nx*w0/2,p0[1]+ny*w0/2);ctx.lineTo(p1[0]+nx*w1/2,p1[1]+ny*w1/2);ctx.arc(p1[0],p1[1],w1/2,Math.atan2(ny,nx),Math.atan2(ny,nx)+Math.PI,true);
  ctx.lineTo(p0[0]-nx*w0/2,p0[1]-ny*w0/2);ctx.arc(p0[0],p0[1],w0/2,Math.atan2(-ny,-nx),Math.atan2(-ny,-nx)+Math.PI,true);ctx.closePath();
  ctx.fillStyle=col;ctx.fill();ctx.lineWidth=.8;ctx.strokeStyle=OUT;ctx.stroke()}
function blob(x,y,r,col,edge=true){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=col;ctx.fill();if(edge){ctx.lineWidth=.8;ctx.strokeStyle=OUT;ctx.stroke()}}
const dot=(x,y,r,col,out=true)=>blob(x,y,r,col,out);
function shoe(p,ang,s,col){ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(-ang+Math.PI/2*0);ctx.beginPath();ctx.ellipse(1.6*s,.4*s,3.2*s,1.6*s,0,0,TAU);ctx.fillStyle=col;ctx.fill();ctx.lineWidth=.8;ctx.strokeStyle=OUT;ctx.stroke();ctx.restore()}
function hand(c,p,s,back){const W=c.weapon,dark=back?-.2:0;
  if(W==='gloves'){blob(p[0],p[1],2.7*s,shade(c.acc,dark));ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(p[0]-.6*s,p[1]-.8*s,1*s,0,TAU);ctx.fill();return}
  if(W==='gauntlets'){blob(p[0],p[1],2.2*s,shade('#a8b0c0',dark));return}
  if(W==='knuckles'){blob(p[0],p[1],1.8*s,shade(c.skin,dark));ctx.fillStyle='#e8c84a';ctx.fillRect(p[0]-.4*s,p[1]-1.8*s,1.2*s,3.6*s);return}
  blob(p[0],p[1],(W==='bare'?1.9:1.6)*s,shade(c.skin,dark));
  if(W==='wraps'){ctx.strokeStyle='#f4f0e8';ctx.lineWidth=1.1*s;ctx.beginPath();ctx.arc(p[0],p[1],1.3*s,0,TAU);ctx.stroke()}}
/* ---------- weapons ---------- */
function weaponTip(c,R){const W=c.weapon,h=R.af[1],gun=c.grp==='L',a=gun?R.af[2]:R.w,len=gun?({rifle:16,cannon:13,blaster:9,pistol:6}[W]||2):({sword:18,katana:20,broadsword:19,rapier:21,greatsword:24,scimitar:18,dual:13,claws:4}[W]||0);
  return[h[0]+Math.sin(a)*len*c.sz,h[1]+Math.cos(a)*len*c.sz]}
function blade(c,h,a,len,wid,curve,guard){const s=c.sz,dx=Math.sin(a),dy=Math.cos(a),px=-dy,py=dx,P=n=>[h[0]+dx*n*s,h[1]+dy*n*s];
  const g0=P(-3),g1=P(1.2);ctx.lineCap='round';ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.6*s;ctx.beginPath();ctx.moveTo(g0[0],g0[1]);ctx.lineTo(g1[0],g1[1]);ctx.stroke();
  if(guard){const g=P(1.4);ctx.strokeStyle=c.acc;ctx.lineWidth=1.3*s;ctx.beginPath();ctx.moveTo(g[0]-px*guard*s,g[1]-py*guard*s);ctx.lineTo(g[0]+px*guard*s,g[1]+py*guard*s);ctx.stroke()}
  const b0=P(1.8),tip=P(len),mid=P(len*.55),w=wid*s/2,cv=curve*s;
  ctx.beginPath();ctx.moveTo(b0[0]+px*w,b0[1]+py*w);ctx.quadraticCurveTo(mid[0]+px*(w+cv),mid[1]+py*(w+cv),tip[0],tip[1]);ctx.quadraticCurveTo(mid[0]-px*(w-cv),mid[1]-py*(w-cv),b0[0]-px*w,b0[1]-py*w);ctx.closePath();
  const gr=ctx.createLinearGradient(b0[0]+px*w,b0[1]+py*w,b0[0]-px*w,b0[1]-py*w);gr.addColorStop(0,'#f4f8ff');gr.addColorStop(.5,'#c8d0dc');gr.addColorStop(1,'#7a8498');
  ctx.fillStyle=gr;ctx.fill();ctx.lineWidth=.6;ctx.strokeStyle='#2a2e3a';ctx.stroke()}
function drawWeapon(c,R,back){const W=c.weapon,s=c.sz;
  if(c.grp==='M'){const h=back?R.ab[1]:R.af[1],a=back?R.w-.5:R.w;
    if(W==='katana')blade(c,h,a,20,1.6,1.2,1.2);else if(W==='broadsword')blade(c,h,a,19,3,0,3.2);else if(W==='rapier')blade(c,h,a,21,.9,0,2.2);
    else if(W==='greatsword')blade(c,h,a,24,3.6,0,3.8);else if(W==='scimitar')blade(c,h,a,18,2.2,2.6,2.4);else if(W==='dual')blade(c,h,a,13,1.6,.4,1.6);else blade(c,h,a,18,2,0,2.8);return}
  if(c.grp==='C'){if(W==='claws'){const h=R.af[1],a=R.af[2],dx=Math.sin(a),dy=Math.cos(a);ctx.strokeStyle='#e8eef8';ctx.lineWidth=.8*s;for(const o of[-1.2,0,1.2]){ctx.beginPath();ctx.moveTo(h[0]-dy*o,h[1]+dx*o);ctx.lineTo(h[0]-dy*o+dx*5*s,h[1]+dx*o+dy*5*s);ctx.stroke()}}return}
  /* long range: guns point where the forearm points */
  const h=R.af[1],a=R.af[2],dx=Math.sin(a),dy=Math.cos(a),px=-dy,py=dx;ctx.save();ctx.translate(h[0],h[1]);ctx.rotate(Math.atan2(dy,dx));
  const box=(x,y,w,hh,col)=>{ctx.fillStyle=col;ctx.fillRect(x*s,y*s,w*s,hh*s);ctx.lineWidth=.6;ctx.strokeStyle=OUT;ctx.strokeRect(x*s,y*s,w*s,hh*s)};
  if(W==='pistol'){box(-1,-1.6,7,2,'#2a2a30');box(-1,0,2,3,'#5a3a24')}
  else if(W==='rifle'){box(-6,-1.4,22,2.2,'#2a2e26');box(-7,-.6,5,3.2,'#5a4024');box(4,-3.2,5,1.6,'#1a1a1a')}
  else if(W==='blaster'){box(-1,-2,10,3,'#c8ccd8');ctx.fillStyle=c.acc;ctx.fillRect(1*s,-1.2*s,6*s,1*s);box(-1,0,2,3,'#3a3a44')}
  else if(W==='cannon'){box(-4,-2.6,17,4.6,'#3a4038');ctx.fillStyle=c.acc;ctx.fillRect(9*s,-2.6*s,1.6*s,4.6*s);box(-2,1.6,3,3,'#2a2a2a')}
  else if(W==='grenade'){blob(1*s,0,1.9*s,'#3a5a2a');ctx.fillStyle='#c8c8c8';ctx.fillRect(.4*s,-2.8*s,1.2*s,1.2*s)}
  else{/* energy in the palm */const g=ctx.createRadialGradient(1.5*s,0,0,1.5*s,0,4.5*s);g.addColorStop(0,'#ffffff');g.addColorStop(.35,c.acc);g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.globalAlpha*=.8+.2*Math.sin(FRAME*.4);ctx.beginPath();ctx.arc(1.5*s,0,4.5*s,0,TAU);ctx.fill()}
  ctx.restore()}
/* ---------- the head: hair, hats and a face ---------- */
function drawHead(c,x,y,s,face=1){const r=3.7*s,H=c.head,hair=c.hair;ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.lineJoin='round';
  const E=()=>{ctx.lineWidth=.7;ctx.strokeStyle=OUT;ctx.stroke()};
  /* behind the head */
  ctx.fillStyle=hair;
  if(H==='long'){ctx.beginPath();ctx.moveTo(-1*s,-3.6*s);ctx.quadraticCurveTo(-6*s,0,-4.6*s,7*s);ctx.lineTo(-1.2*s,6*s);ctx.lineTo(0,0);ctx.closePath();ctx.fill();E()}
  if(H==='ponytail'){ctx.beginPath();ctx.ellipse(-4.6*s,.6*s,1.5*s,3.6*s,-.5,0,TAU);ctx.fill();E()}
  if(H==='afro'){blob(-.6*s,-1.6*s,5.4*s,hair)}
  if(H==='bun'||H==='topknot'){blob(H==='bun'?-3.4*s:-.6*s,H==='bun'?-2.6*s:-4.8*s,1.6*s,hair)}
  if(H==='band'||H==='bandana'||H==='mask'){ctx.strokeStyle=H==='mask'?'#c82a3a':c.acc;ctx.lineWidth=.9*s;ctx.beginPath();ctx.moveTo(-3*s,-1.2*s);ctx.quadraticCurveTo(-5.6*s,-.6*s,-6.6*s,1.6*s+Math.sin(FRAME*.2)*.6*s);ctx.stroke()}
  if(H==='hood'){ctx.beginPath();ctx.arc(-.3*s,-.2*s,r+1.3*s,0,TAU);ctx.fillStyle=c.body;ctx.fill();E()}
  /* the head itself: a skull with a jaw toward the front */
  ctx.beginPath();ctx.moveTo(-r*.9,-.8*s);ctx.arc(-.2*s,-.4*s,r,Math.PI,Math.PI*1.95);ctx.quadraticCurveTo(r+.9*s,.2*s,r*.9,1.4*s);ctx.quadraticCurveTo(r*.6,r+.4*s,.4*s,r+.2*s);
  ctx.quadraticCurveTo(-r*.7,r,-r*.9,-.8*s);ctx.closePath();const sg=ctx.createLinearGradient(-r,0,r,0);sg.addColorStop(0,shade(c.skin,-.18));sg.addColorStop(1,c.skin);ctx.fillStyle=H==='antenna'?'#b8c4d8':sg;ctx.fill();E();
  if(H!=='hood'&&H!=='antenna'&&H!=='helmet'){ctx.fillStyle=shade(c.skin,-.15);ctx.beginPath();ctx.ellipse(-1.2*s,.3*s,.9*s,1.2*s,0,0,TAU);ctx.fill()}
  /* face: brow, eye, nose, mouth */
  if(H==='hood'){ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.arc(.6*s,0,r*.9,0,TAU);ctx.fill();blob(2*s,-.4*s,.55*s,c.acc,false)}
  else if(H==='antenna'){ctx.fillStyle=c.acc;ctx.fillRect(.6*s,-1.2*s,3*s,1.1*s);ctx.strokeStyle=OUT;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-.6*s,-r);ctx.lineTo(-1.4*s,-r-3*s);ctx.stroke();blob(-1.4*s,-r-3.2*s,.8*s,c.acc)}
  else{ctx.fillStyle='#1a1418';ctx.beginPath();ctx.ellipse(2*s,-.5*s,.42*s,.6*s,0,0,TAU);ctx.fill();ctx.strokeStyle=shade(hair,-.1);ctx.lineWidth=.55*s;ctx.beginPath();ctx.moveTo(1.2*s,-1.6*s);ctx.lineTo(2.8*s,-1.4*s);ctx.stroke();
    ctx.fillStyle=shade(c.skin,-.08);ctx.beginPath();ctx.moveTo(3.3*s,-.6*s);ctx.lineTo(4.3*s,.8*s);ctx.lineTo(3.2*s,1*s);ctx.closePath();ctx.fill();
    ctx.strokeStyle=shade(c.skin,-.45);ctx.lineWidth=.4*s;ctx.beginPath();ctx.moveTo(2.2*s,2.2*s);ctx.lineTo(3.2*s,2.1*s);ctx.stroke()}
  if(H==='mask'){ctx.fillStyle='#24242e';ctx.beginPath();ctx.moveTo(-r*.9,.2*s);ctx.lineTo(r+.9*s,.2*s);ctx.lineTo(r*.6,r+.4*s);ctx.lineTo(-r*.7,r);ctx.closePath();ctx.fill()}
  if(H==='visor'){ctx.fillStyle=c.acc;ctx.fillRect(.4*s,-1.5*s,4.2*s,1.5*s);ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(.8*s,-1.4*s,1.6*s,.4*s)}
  /* on top of the head */
  const cap=(col,a0=Math.PI*.98,a1=Math.PI*2.04,lift=0)=>{ctx.beginPath();ctx.arc(-.2*s,-.4*s-lift,r+.35*s,a0,a1);ctx.quadraticCurveTo(0,-1.6*s-lift,-r,-.4*s-lift);ctx.closePath();ctx.fillStyle=col;ctx.fill();E()};
  switch(H){
    case'short':case'long':case'ponytail':case'bun':case'topknot':case'band':case'bandana':case'visor':case'crown':case'horns':case'mask':cap(H==='mask'?'#24242e':hair);break;
    case'spiky':case'flame':{ctx.beginPath();ctx.moveTo(-r,0);for(let i=0;i<5;i++){const xx=-r+i*1.8*s;ctx.lineTo(xx+.4*s,-(r+2+(i%2)*1.2+(H==='flame'?Math.sin(FRAME*.3+i):0))*1);ctx.lineTo(xx+1.6*s,-r+.6*s)}ctx.lineTo(r,-1*s);ctx.closePath();ctx.fillStyle=H==='flame'?c.acc:hair;ctx.fill();E();break}
    case'mohawk':ctx.beginPath();ctx.moveTo(-2.6*s,-2.8*s);ctx.lineTo(-1.6*s,-r-2.4*s);ctx.lineTo(1.4*s,-r-2*s);ctx.lineTo(2*s,-3*s);ctx.closePath();ctx.fillStyle=hair;ctx.fill();E();break;
    case'afro':ctx.beginPath();ctx.arc(-.6*s,-1.6*s,5.4*s,Math.PI*.95,Math.PI*2.02);ctx.fillStyle=hair;ctx.fill();break;
    case'bald':ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.ellipse(-.6*s,-2.6*s,1.2*s,.6*s,-.3,0,TAU);ctx.fill();break;
    case'cap':cap(c.acc);ctx.beginPath();ctx.ellipse(3.2*s,-1.6*s,2.8*s,.75*s,.15,0,TAU);ctx.fillStyle=shade(c.acc,-.2);ctx.fill();E();break;
    case'beanie':cap(c.acc,Math.PI*.95,Math.PI*2.05,.4*s);blob(-.4*s,-r-1.2*s,.9*s,shade(c.acc,.2));break;
    case'helmet':cap(H==='helmet'?'#8a90a0':c.acc,Math.PI*.8,Math.PI*2.18);ctx.fillStyle=c.acc;ctx.fillRect(-1*s,-r-1.4*s,1.6*s,1.4*s);break;
    case'cowboy':ctx.fillStyle='#7a4a24';ctx.beginPath();ctx.ellipse(0,-2.4*s,6.6*s,1.1*s,0,0,TAU);ctx.fill();E();ctx.beginPath();ctx.moveTo(-3*s,-2.4*s);ctx.lineTo(-2.4*s,-6.4*s);ctx.lineTo(2.6*s,-6.4*s);ctx.lineTo(3*s,-2.4*s);ctx.closePath();ctx.fill();E();break;
    case'hood':ctx.beginPath();ctx.arc(-.3*s,-.4*s,r+1.3*s,Math.PI*.62,Math.PI*1.95);ctx.lineTo(2*s,-.6*s);ctx.closePath();ctx.fillStyle=shade(c.body,.08);ctx.fill();E();break}
  if(H==='band'||H==='bandana'||H==='mask'){ctx.fillStyle=H==='mask'?'#c82a3a':c.acc;ctx.fillRect(-r,-2.4*s,2*r+.4*s,1*s)}
  if(H==='crown'){ctx.beginPath();ctx.moveTo(-2.4*s,-r+.2*s);ctx.lineTo(-2.4*s,-r-2*s);ctx.lineTo(-1.2*s,-r-.8*s);ctx.lineTo(0,-r-2.2*s);ctx.lineTo(1.2*s,-r-.8*s);ctx.lineTo(2.4*s,-r-2*s);ctx.lineTo(2.4*s,-r+.2*s);ctx.closePath();ctx.fillStyle='#ffd84a';ctx.fill();E()}
  if(H==='horns'){for(const ex of[-2,1.4]){ctx.beginPath();ctx.moveTo(ex*s,-r+.6*s);ctx.quadraticCurveTo((ex-1.4)*s,-r-2.6*s,(ex+.4)*s,-r-4*s);ctx.lineTo((ex+1.2)*s,-r+.4*s);ctx.closePath();ctx.fillStyle='#e8e0c8';ctx.fill();E()}}
  ctx.restore()}
/* a head and shoulders, for the menus */
function drawBust(c,x,y,s,face=1){ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.beginPath();ctx.moveTo(-7*s,9*s);ctx.quadraticCurveTo(-6.5*s,2.6*s,-1*s,2.4*s);ctx.lineTo(2*s,2.4*s);ctx.quadraticCurveTo(7*s,2.8*s,7*s,9*s);ctx.closePath();
  ctx.fillStyle=c.body;ctx.fill();ctx.lineWidth=.7;ctx.strokeStyle=OUT;ctx.stroke();ctx.fillStyle=c.acc;ctx.fillRect(-.6*s,2.6*s,1.4*s,6.4*s);
  ctx.fillStyle=shade(c.skin,-.1);ctx.fillRect(-.9*s,0,2.2*s,3*s);ctx.restore();drawHead(c,x+(.4*s)*face,y-3.2*s,s,face)}
/* ---------- the whole fighter at its spot in the world ---------- */
function drawFighter(f,alpha=1){if(f.st==='ko'||f.hide)return;const c=f.c,s=c.sz,{P,spin}=poseOf(f);const R=rig(P,s,!!f.gr||f.st==='ledge');
  ctx.save();ctx.translate(f.x+(f.hl>0&&f.st==='hit'?(FRAME%2?1.2:-1.2):0),f.y);
  if(f.inv>0&&(f.st==='spawn'||f.st==='ledge'||FRAME%6<3))alpha*=f.st==='roll'||f.st==='dodge'?.55:.75;ctx.globalAlpha=alpha;
  if(f.gr){const g=ctx.createRadialGradient(0,0,1,0,0,12*s);g.addColorStop(0,'rgba(0,0,0,.45)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,12*s,2.6*s,0,0,TAU);ctx.fill()}
  ctx.scale(f.face,1);if(f.st==='ledge')ctx.translate(0,-4);
  if(spin){ctx.translate(0,-20*s);ctx.rotate(spin);ctx.translate(0,20*s)}
  ctx.lineCap='round';ctx.lineJoin='round';
  const top=c.body,dk=shade(top,-.32),pants=c.pants,pdk=shade(pants,-.3),fit=c.fit,ex=c.ex,lv=(f.vx||0)*f.face,sway=-clamp(Math.abs(lv)*1.3+(f.gr?0:2),0,7)+Math.sin(FRAME*.12+c.i)*.8;
  const armF=fit==='tank'?c.skin:top,armB=fit==='tank'?shade(c.skin,-.2):dk,boot='#2a2220';
  /* behind everything: a cape, or the tail of a long coat */
  if(ex.has('cape')){const a=R.sh,h=R.hip;ctx.beginPath();ctx.moveTo(a[0]+1*s,a[1]-1*s);ctx.lineTo(a[0]-3.5*s,a[1]);ctx.quadraticCurveTo(h[0]-8*s+sway,h[1],h[0]-11*s+sway*1.6,h[1]+15*s);
    ctx.lineTo(h[0]-1*s+sway*.6,h[1]+14*s);ctx.quadraticCurveTo(h[0]-1*s,h[1],a[0]+1*s,a[1]-1*s);ctx.closePath();const cg=ctx.createLinearGradient(a[0],a[1],h[0],h[1]+14*s);cg.addColorStop(0,c.acc);cg.addColorStop(1,shade(c.acc,-.45));
    ctx.fillStyle=cg;ctx.fill();ctx.lineWidth=.7;ctx.strokeStyle=OUT;ctx.stroke()}
  if(fit==='coat'){const h=R.hip;ctx.beginPath();ctx.moveTo(h[0]-3*s,h[1]-3*s);ctx.lineTo(h[0]+1*s,h[1]-1*s);ctx.lineTo(h[0]-2*s+sway*.5,h[1]+11*s);ctx.lineTo(h[0]-7*s+sway,h[1]+10*s);ctx.closePath();ctx.fillStyle=dk;ctx.fill();ctx.lineWidth=.7;ctx.strokeStyle=OUT;ctx.stroke()}
  /* back limbs, darker */
  if(c.weapon==='dual')drawWeapon(c,R,true);
  seg(R.sh,R.ab[0],3.1*s,2.6*s,armB);seg(R.ab[0],R.ab[1],2.6*s,2.1*s,fit==='tank'||fit==='vest'?shade(c.skin,-.2):armB);hand(c,R.ab[1],s,true);
  if(ex.has('pads')){ctx.beginPath();ctx.ellipse(R.sh[0]-.5*s,R.sh[1]+.6*s,3*s,2.2*s,R.lean,0,TAU);ctx.fillStyle=shade(c.acc,-.35);ctx.fill();ctx.lineWidth=.7;ctx.strokeStyle=OUT;ctx.stroke()}
  seg(R.hip,R.lb[0],4.4*s,3.4*s,pdk);seg(R.lb[0],R.lb[1],3.3*s,2.4*s,ex.has('boots')?shade(boot,-.2):pdk);shoe(R.lb[1],R.lb[2],s*(ex.has('boots')?1.1:1),'#141418');
  /* torso: waist to chest to shoulders, lit from the front */
  const u=R.up,n=[u[1]*-1,u[0]],at=(t,w)=>[R.hip[0]+u[0]*13*s*t+n[0]*w*s,R.hip[1]+u[1]*13*s*t+n[1]*w*s];
  ctx.beginPath();const p1=at(0,-3),p2=at(.62,-3.8),p3=at(1,-2.6),p4=at(1.02,2.4),p5=at(.62,4.3),p6=at(0,3.1);
  ctx.moveTo(p1[0],p1[1]);ctx.quadraticCurveTo(p2[0],p2[1],p3[0],p3[1]);ctx.lineTo(p4[0],p4[1]);ctx.quadraticCurveTo(p5[0],p5[1],p6[0],p6[1]);ctx.closePath();
  const tg=ctx.createLinearGradient(p1[0],p1[1],p6[0],p6[1]);tg.addColorStop(0,shade(top,-.22));tg.addColorStop(.6,top);tg.addColorStop(1,shade(top,.14));ctx.fillStyle=tg;ctx.fill();ctx.lineWidth=.8;ctx.strokeStyle=OUT;ctx.stroke();
  /* the outfit's details on the torso */
  const ln=(p,q,w,col)=>{ctx.strokeStyle=col;ctx.lineWidth=w*s;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke()};
  const b1=at(.06,-3.1),b2=at(.06,3.2);ctx.lineCap='butt';ln(b1,b2,2.2,fit==='gi'||fit==='robe'?c.acc:pants);
  if(fit==='jacket'){ln(at(1,2.2),at(.1,2.7),.6,shade(top,-.4));ctx.fillStyle=shade(top,.18);const n1=at(1.02,-1),n2=at(1.02,2.6),n3=at(.84,1.8);ctx.beginPath();ctx.moveTo(n1[0],n1[1]);ctx.lineTo(n2[0],n2[1]);ctx.lineTo(n3[0],n3[1]);ctx.closePath();ctx.fill();ln(at(.45,.6),at(.45,2.4),.7,c.acc)}
  else if(fit==='coat'||fit==='suit'){const t=at(.98,1.6),m=at(.6,2.6);ln(at(.98,-.6),m,.9,shade(top,.25));ln(t,m,.9,shade(top,-.35));if(fit==='suit'){ctx.fillStyle='#f0f0f0';const a1=at(.98,1.2),a2=at(.98,2.4),a3=at(.62,2.4);ctx.beginPath();ctx.moveTo(a1[0],a1[1]);ctx.lineTo(a2[0],a2[1]);ctx.lineTo(a3[0],a3[1]);ctx.fill();ln(at(.95,2.2),at(.6,2.5),1,c.acc)}}
  else if(fit==='armor'){for(const k of[.3,.5,.7])ln(at(k,-3.4),at(k,3.6),.5,shade(top,-.35));ctx.fillStyle='rgba(255,255,255,.25)';const h1=at(.85,1.6);ctx.beginPath();ctx.ellipse(h1[0],h1[1],1.6*s,2.6*s,R.lean,0,TAU);ctx.fill();ln(at(.62,.4),at(.62,2.8),.8,c.acc)}
  else if(fit==='gi'){ctx.fillStyle=shade(c.skin,-.1);const v1=at(1.02,.4),v2=at(1.02,2.6),v3=at(.62,2.2);ctx.beginPath();ctx.moveTo(v1[0],v1[1]);ctx.lineTo(v2[0],v2[1]);ctx.lineTo(v3[0],v3[1]);ctx.closePath();ctx.fill();ln(at(1,-.2),at(.4,2.8),.7,shade(top,-.3))}
  else if(fit==='tank'){ctx.fillStyle=shade(c.skin,-.08);const v1=at(1.02,-.4),v2=at(1.02,2.6),v3=at(.78,1.6);ctx.beginPath();ctx.moveTo(v1[0],v1[1]);ctx.lineTo(v2[0],v2[1]);ctx.lineTo(v3[0],v3[1]);ctx.closePath();ctx.fill();ln(at(.55,-2),at(.55,3),.5,shade(top,-.25))}
  else if(fit==='vest'){ln(at(.95,-2.4),at(.15,-2.6),1.1,shade(top,-.35));ctx.fillStyle=shade(top,-.2);for(const k of[.35,.62]){const p=at(k,1.2);ctx.fillRect(p[0]-1.2*s,p[1]-1*s,2.4*s,2*s)}ln(at(.9,2),at(.2,2.4),.6,c.acc)}
  else if(fit==='robe'){ln(at(.98,-.4),at(.45,2.6),1,c.acc)}
  ctx.lineCap='round';
  /* neck and head */
  seg(R.neck,[R.head[0]-.4*s,R.head[1]+2*s],2.4*s,2.2*s,shade(c.skin,-.12));
  drawHead(c,R.head[0],R.head[1],s,1);
  if(f.st==='hit'||f.st==='dizzy'){ctx.strokeStyle=OUT;ctx.lineWidth=.5;const hx=R.head[0]+2*s,hy=R.head[1]-.5*s;ctx.beginPath();ctx.moveTo(hx-.7,hy-.7);ctx.lineTo(hx+.7,hy+.7);ctx.moveTo(hx+.7,hy-.7);ctx.lineTo(hx-.7,hy+.7);ctx.stroke()}
  /* a scarf: a wrap at the neck with a tail that streams behind */
  if(ex.has('scarf')){const n=R.neck,w=Math.sin(FRAME*.25+c.i)*1.2;ctx.beginPath();ctx.moveTo(n[0]-1.5*s,n[1]-1*s);ctx.quadraticCurveTo(n[0]-6*s+sway,n[1]+w*s,n[0]-10*s+sway*1.4,n[1]+3*s-w*s);
    ctx.lineTo(n[0]-9*s+sway*1.4,n[1]+4.6*s-w*s);ctx.quadraticCurveTo(n[0]-5*s+sway,n[1]+2.5*s+w*s,n[0]-1*s,n[1]+1.4*s);ctx.closePath();ctx.fillStyle=c.acc;ctx.fill();ctx.lineWidth=.6;ctx.strokeStyle=OUT;ctx.stroke();
    seg([n[0]-2*s,n[1]+.4*s],[n[0]+2*s,n[1]-.2*s],2.6*s,2.6*s,c.acc)}
  /* front leg, then the weapon and the front arm on top */
  seg(R.hip,R.lf[0],4.6*s,3.5*s,pants);seg(R.lf[0],R.lf[1],3.4*s,2.5*s,ex.has('boots')?boot:pants);shoe(R.lf[1],R.lf[2],s*(ex.has('boots')?1.1:1),'#1c1c22');
  /* a robe hangs over both thighs */
  if(fit==='robe'){const w1=at(.04,-3.4),w2=at(.04,3.6),k1=R.lb[0],k2=R.lf[0],lo=Math.max(k1[1],k2[1])+1.5*s;ctx.beginPath();ctx.moveTo(w1[0],w1[1]);ctx.lineTo(w2[0],w2[1]);
    ctx.lineTo(Math.max(k1[0],k2[0])+2.5*s,lo);ctx.lineTo(Math.min(k1[0],k2[0])-2.5*s+sway*.4,lo);ctx.closePath();const rg=ctx.createLinearGradient(w1[0],w1[1],w2[0],w2[1]);rg.addColorStop(0,shade(top,-.3));rg.addColorStop(1,shade(top,.05));
    ctx.fillStyle=rg;ctx.fill();ctx.lineWidth=.7;ctx.strokeStyle=OUT;ctx.stroke()}
  const gun=c.grp==='L';if(!gun)drawWeapon(c,R,false);
  seg(R.sh,R.af[0],3.2*s,2.7*s,armF);seg(R.af[0],R.af[1],2.7*s,2.2*s,fit==='tank'||fit==='vest'?c.skin:armF);if(gun)drawWeapon(c,R,false);hand(c,R.af[1],s,false);
  if(ex.has('pads')){ctx.beginPath();ctx.ellipse(R.sh[0]+.3*s,R.sh[1]+.4*s,3.2*s,2.4*s,R.lean,0,TAU);const pg=ctx.createLinearGradient(R.sh[0],R.sh[1]-2*s,R.sh[0],R.sh[1]+2*s);pg.addColorStop(0,shade(c.acc,.2));pg.addColorStop(1,shade(c.acc,-.3));
    ctx.fillStyle=pg;ctx.fill();ctx.lineWidth=.7;ctx.strokeStyle=OUT;ctx.stroke()}
  if(f.flash>0){ctx.globalAlpha=f.flash/10;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,-20*s,20*s,0,TAU);ctx.fill()}
  ctx.restore();
  /* the swoosh trail follows whatever reaches farthest during a strike */
  const strike=(f.st==='atk'&&f.mv&&f.mv.d.b.length&&f.mv.t>f.mv.d.s-1&&f.mv.t<=f.mv.d.s+f.mv.d.a+1)||(f.st==='sp'&&f.boxes.length);
  if(strike){const pts=[R.af[1],R.lf[1],R.lb[1],R.ab[1]];if(c.grp==='M')pts.push(weaponTip(c,R));let best=pts[0],bd=-1;
    for(const p of pts){const d=Math.hypot(p[0]-R.hip[0],p[1]-R.hip[1]);if(d>bd){bd=d;best=p}}
    const sp=spin||0,cy=-20*s,rx=best[0],ry=best[1]-cy,wx=rx*Math.cos(sp)-ry*Math.sin(sp),wy=rx*Math.sin(sp)+ry*Math.cos(sp)+cy;
    f.trail.push([f.x+wx*f.face,f.y+wy+(f.st==='ledge'?-4:0),6,c.grp==='M'])}
  for(const t of f.trail)t[2]--;f.trail=f.trail.filter(t=>t[2]>0)}
function drawTrail(f){const T=f.trail;if(T.length<2)return;ctx.lineCap='round';for(let i=1;i<T.length;i++){const a=T[i-1],b=T[i],k=b[2]/6;ctx.globalAlpha=k*.8;
  ctx.strokeStyle=b[3]?'#dfe8ff':f.c.fx;ctx.lineWidth=(b[3]?5:3.5)*k+.6;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=1.2*k;ctx.stroke()}ctx.globalAlpha=1}
