/* ================= the camera, the night stages, shots and effects ================= */
const CAM={x:0,y:-60,w:420};
function camTarget(){const A=FT.filter(f=>f.st!=='ko');let x1=-100,x2=100,y1=-90,y2=0;
  if(A.length){x1=Math.min(...A.map(f=>f.x));x2=Math.max(...A.map(f=>f.x));y1=Math.min(...A.map(f=>f.y-34));y2=Math.max(...A.map(f=>f.y))}
  const asp=SW/SH;let w=PORT?Math.max(x2-x1+100,185):Math.max(x2-x1+160,270),h=Math.max(y2-y1+110,160);w=Math.max(w,h*asp);w=Math.min(w,BLAST.r-BLAST.l-30);const hh=w/asp;
  let cx=(x1+x2)/2,cy=(y1+y2)/2-12-(PORT?hh*.07:0);cx=clamp(cx,BLAST.l+w/2,BLAST.r-w/2);cy=clamp(cy,BLAST.t+hh/2,Math.max(BLAST.t+hh/2,BLAST.b-hh/2+10));return{cx,cy,w}}
function camTick(snap){const T=camTarget(),k=snap?1:.1;CAM.x+=(T.cx-CAM.x)*k;CAM.y+=(T.cy-CAM.y)*k;CAM.w+=(T.w-CAM.w)*(snap?1:.07)}
const camS=()=>SW/CAM.w;
function worldXf(){const S=camS();let sx=0,sy=0;if(SHAKE>0){sx=(rnd()-.5)*SHAKE;sy=(rnd()-.5)*SHAKE}ctx.setTransform(DPR*S,0,0,DPR*S,DPR*(SW/2-CAM.x*S+sx),DPR*(SH/2-CAM.y*S+sy))}
/* seeded random for steady skylines */
function seeded(n){let s=n*9301+49297;return()=>{s=(s*9301+49297)%233280;return s/233280}}
const BG={};
function bgFor(id){if(BG[id])return BG[id];const r=seeded(id.length*17+id.charCodeAt(0)),B={far:[],near:[],stars:[]};
  for(let i=0;i<70;i++)B.stars.push([r(),r()*.6,r()*1.2+.3,r()*6]);
  let x=-.2;while(x<1.4){const w=.04+r()*.07,h=.12+r()*.22;B.far.push({x,w,h,win:Array.from({length:14},()=>[r(),r(),r()<.35])});x+=w+r()*.01}
  x=-.3;while(x<1.6){const w=.06+r()*.09,h=.08+r()*.16;B.near.push({x,w,h,win:Array.from({length:10},()=>[r(),r(),r()<.3])});x+=w+.02+r()*.04}
  return BG[id]=B}
function drawSky(id){ctx.setTransform(DPR,0,0,DPR,0,0);const W=SW,Hh=SH,B=bgFor(id),px=-CAM.x/700,py=-CAM.y/1500;
  const pal={roof:['#070a22','#2e1c4a','#ff4fa8'],bridge:['#04081a','#18285a','#7ab8ff'],clock:['#0e0818','#2a1636','#ffd27a'],docks:['#03101a','#0a2a3a','#3affd0']}[id];
  const g=ctx.createLinearGradient(0,0,0,Hh);g.addColorStop(0,pal[0]);g.addColorStop(1,pal[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,Hh);
  for(const s of B.stars){ctx.globalAlpha=.4+.4*Math.sin(FRAME*.03+s[3]);ctx.fillStyle='#fff';ctx.fillRect(((s[0]+px*.2)%1+1)%1*W,s[1]*Hh,s[2],s[2])}ctx.globalAlpha=1;
  /* the moon */
  const mx=W*(id==='bridge'?.5:.78)+px*30*U,my=Hh*(id==='bridge'?.5:.22)+py*40,mr=Hh*(id==='bridge'?.2:.085);
  const mg=ctx.createRadialGradient(mx,my,mr*.6,mx,my,mr*3);mg.addColorStop(0,'rgba(255,240,220,.35)');mg.addColorStop(1,'rgba(255,240,220,0)');ctx.fillStyle=mg;ctx.fillRect(mx-mr*3,my-mr*3,mr*6,mr*6);
  ctx.fillStyle='#f4ecd8';ctx.beginPath();ctx.arc(mx,my,mr,0,TAU);ctx.fill();ctx.fillStyle='rgba(180,170,150,.35)';for(const[a,b,c]of[[-.3,-.2,.22],[.25,.15,.16],[-.05,.35,.12]]){ctx.beginPath();ctx.arc(mx+a*mr,my+b*mr,c*mr,0,TAU);ctx.fill()}
  if(id==='clock'){const cx=W*.32+px*60*U,cy=Hh*.42+py*60,cr=Math.min(Hh,W)*.3;ctx.fillStyle='#1c1228';ctx.beginPath();ctx.arc(cx,cy,cr*1.12,0,TAU);ctx.fill();ctx.fillStyle='#e8dcb8';ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(cx,cy,cr,0,TAU);ctx.fill();ctx.globalAlpha=1;
    ctx.strokeStyle='#2a1a2a';for(let i=0;i<12;i++){const a=i/12*TAU;ctx.lineWidth=i%3?2:4;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*cr*.82,cy+Math.sin(a)*cr*.82);ctx.lineTo(cx+Math.cos(a)*cr*.94,cy+Math.sin(a)*cr*.94);ctx.stroke()}
    const d=new Date(),hA=((d.getHours()%12)+d.getMinutes()/60)/12*TAU-Math.PI/2,mA=(d.getMinutes()+d.getSeconds()/60)/60*TAU-Math.PI/2;ctx.lineCap='round';
    ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(hA)*cr*.5,cy+Math.sin(hA)*cr*.5);ctx.stroke();ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(mA)*cr*.78,cy+Math.sin(mA)*cr*.78);ctx.stroke()}
  /* skylines */
  const base=Hh*.78+py*30;const layer=(L,col,par,winCol)=>{for(const b of L){const x=((b.x+px*par)*W),w=b.w*W,h=b.h*Hh;ctx.fillStyle=col;ctx.fillRect(x,base-h,w,h+Hh);
      ctx.fillStyle=winCol;for(const q of b.win)if(q[2]&&(Math.sin(FRAME*.01+q[0]*40)>-.9))ctx.fillRect(x+q[0]*(w-4)+1,base-h+4+q[1]*(h-8),2.2,2.6)}};
  if(id==='docks'){layer(B.far,'#08141e',.3,'rgba(255,90,90,.6)');ctx.strokeStyle='#0b1a26';ctx.lineWidth=4;for(const cx of[.2,.62,.9]){const x=(cx+px*.35)*W;ctx.beginPath();ctx.moveTo(x,base);ctx.lineTo(x,base-Hh*.42);ctx.lineTo(x+Hh*.3,base-Hh*.42);ctx.moveTo(x-Hh*.08,base-Hh*.42);ctx.lineTo(x,base-Hh*.5);ctx.stroke();ctx.fillStyle=FRAME%60<30?'#ff3a3a':'#5a1010';ctx.fillRect(x-2,base-Hh*.52,4,4)}}
  else if(id==='bridge'){ctx.strokeStyle='#0a1430';ctx.lineWidth=6;for(const tx of[.15,.85]){const x=(tx+px*.3)*W;ctx.beginPath();ctx.moveTo(x,base+Hh);ctx.lineTo(x,base-Hh*.5);ctx.stroke()}
    ctx.lineWidth=1.5;for(let i=0;i<14;i++){const a=((.15+px*.3)*W),b=((.85+px*.3)*W),x=a+(b-a)*i/13;ctx.beginPath();ctx.moveTo(x,base-4);ctx.lineTo(i<7?a:b,base-Hh*.48);ctx.stroke()}}
  else layer(B.far,id==='clock'?'#160e22':'#121432',.3,id==='clock'?'rgba(255,210,120,.5)':'rgba(255,220,140,.55)');
  if(id!=='bridge')layer(B.near,id==='docks'?'#05101a':id==='clock'?'#0c0816':'#0a0b20',.55,pal[2]);
  if(id==='bridge'||id==='docks'){const wy=base+(id==='bridge'?Hh*.04:0);const wg=ctx.createLinearGradient(0,wy,0,Hh);wg.addColorStop(0,id==='bridge'?'#14214a':'#062030');wg.addColorStop(1,'#020610');ctx.fillStyle=wg;ctx.fillRect(0,wy,W,Hh-wy);
    ctx.fillStyle='rgba(244,236,216,.25)';for(let i=0;i<10;i++){const yy=wy+6+i*i*1.6,ww=(30-i*2)*U*(1+Math.sin(FRAME*.05+i)*.2);ctx.fillRect(mx-ww/2+Math.sin(FRAME*.04+i)*6,yy,ww,1.5)}}}
function drawStage(){const M=STAGE.main,id=STAGE.id;
  const top={roof:'#34365a',bridge:'#4a5270',clock:'#5a4a5e',docks:'#3a3026'}[id],body={roof:'#1a1b34',bridge:'#22283e',clock:'#2a2030',docks:'#1e1812'}[id],edge={roof:'#ff4fa8',bridge:'#7ab8ff',clock:'#ffd27a',docks:'#3affd0'}[id];
  ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(M.x1,M.y);ctx.lineTo(M.x2,M.y);ctx.lineTo(M.x2-10,M.y+34);ctx.lineTo(M.x2*.55,M.y+64);ctx.lineTo(M.x1*.55,M.y+64);ctx.lineTo(M.x1+10,M.y+34);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=1;for(let x=M.x1+20;x<M.x2;x+=24){ctx.beginPath();ctx.moveTo(x,M.y+6);ctx.lineTo(x*.9,M.y+56);ctx.stroke()}
  if(id==='roof'){ctx.fillStyle='#262844';ctx.fillRect(M.x1+30,M.y-10,26,10);ctx.fillRect(M.x2-70,M.y-7,34,7);ctx.fillStyle='#0d0e1e';for(let i=0;i<3;i++)ctx.fillRect(M.x1+34+i*7,M.y-8,3,6)}
  if(id==='bridge'){ctx.strokeStyle='#8a94b8';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(M.x1+4,M.y-9);ctx.lineTo(M.x2-4,M.y-9);ctx.stroke();for(let x=M.x1+6;x<=M.x2-4;x+=18){ctx.beginPath();ctx.moveTo(x,M.y);ctx.lineTo(x,M.y-9);ctx.stroke()}}
  if(id==='docks'){ctx.strokeStyle='rgba(0,0,0,.35)';for(let x=M.x1+10;x<M.x2;x+=10){ctx.beginPath();ctx.moveTo(x,M.y);ctx.lineTo(x,M.y+6);ctx.stroke()}ctx.fillStyle='#2a2018';for(const x of[M.x1+16,M.x2-24])ctx.fillRect(x,M.y+6,8,60)}
  ctx.fillStyle=top;ctx.fillRect(M.x1,M.y,M.x2-M.x1,6);ctx.fillStyle=edge;ctx.globalAlpha=.85+.15*Math.sin(FRAME*.08);ctx.fillRect(M.x1,M.y-1,M.x2-M.x1,1.6);ctx.globalAlpha=1;
  for(const p of STAGE.plats){ctx.fillStyle=id==='docks'?'#5a4428':id==='clock'?'#6a4a30':'#2a2c4a';rrect(p.x1,p.y-1,p.x2-p.x1,6,2);ctx.fill();ctx.fillStyle=edge;ctx.globalAlpha=.7;ctx.fillRect(p.x1+2,p.y-1,p.x2-p.x1-4,1.2);ctx.globalAlpha=1;
    if(id==='docks'){ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1;ctx.strokeRect(p.x1+4,p.y+5,p.x2-p.x1-8,0)}}}
/* ---------- shots and effects in the world ---------- */
function glow(x,y,r,col,core='#ffffff'){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,core);g.addColorStop(.3,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
function streak(p,len,w,col,core){const l=Math.hypot(p.vx,p.vy)||1,dx=p.vx/l,dy=p.vy/l;ctx.lineCap='round';ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(p.x-dx*len,p.y-dy*len);ctx.lineTo(p.x,p.y);ctx.stroke();
  if(core){ctx.strokeStyle=core;ctx.lineWidth=w*.4;ctx.stroke()}}
function drawProj(p){const t=p.t,c=p.col;ctx.save();
  switch(p.kind){
    case'bullet':streak(p,9,1.6,'rgba(255,220,140,.8)','#fff8e0');break;
    case'tracer':streak(p,26,2,'rgba(255,240,200,.85)','#ffffff');break;
    case'shell':glow(p.x,p.y,p.r*2,'#ffb050');streak(p,8,p.r,'#ffd890','#fff');break;
    case'laser':streak(p,12,2.2,c,'#ffffff');break;
    case'energy':case'blast':glow(p.x,p.y,p.r*(p.kind==='blast'?2.4:2),c);if(t%2===0)burst(p.x,p.y,c,1,.5);break;
    case'pellet':case'flame':{const fl=p.kind==='flame';glow(p.x,p.y,p.r*(fl?3.2:1.6),fl?'#ff7a2a':'#e8e0c8',fl?'#fff0a0':'#ffffff');if(fl&&t%2===0)smoke(p.x,p.y,'#6a5a5a',1);break}
    case'orb':{glow(p.x,p.y,p.r*1.8,c);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,p.r*.8+Math.sin(t*.4),0,TAU);ctx.stroke();break}
    case'rocket':{ctx.translate(p.x,p.y);ctx.scale(sgn(p.vx)||1,1);ctx.fillStyle='#8a8f98';ctx.fillRect(-6,-1.8,10,3.6);ctx.fillStyle='#d8323f';ctx.beginPath();ctx.moveTo(4,-1.8);ctx.lineTo(7.5,0);ctx.lineTo(4,1.8);ctx.fill();
      ctx.fillStyle='#4a4f58';ctx.fillRect(-7,-3,2.4,6);glow(-8,0,4+Math.sin(t)*1.2,'#ffa040','#fff6c0');break}
    case'grenade':case'sticky':{blob(p.x,p.y,p.r*.75,p.kind==='sticky'?'#5a5a66':'#3a5a2a');ctx.fillStyle='#c8c8c8';ctx.fillRect(p.x-.6,p.y-p.r*.75-1.6,1.4,1.6);
      if(p.life<22&&t%4<2)glow(p.x,p.y,p.r*1.6,'#ff3a3a','#ffb0b0');else if(t%10<5)blob(p.x+1,p.y-1,.8,p.kind==='sticky'?'#ff3a3a':'#ffd84a',false);break}
    case'wave':{ctx.translate(p.x,p.y);ctx.scale(sgn(p.vx)||1,1);ctx.globalAlpha=.85;const g=ctx.createLinearGradient(-8,0,6,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,c);ctx.fillStyle=g;
      ctx.beginPath();ctx.moveTo(-6,-p.r*1.4);ctx.quadraticCurveTo(8,0,-6,p.r*1.4);ctx.quadraticCurveTo(2,0,-6,-p.r*1.4);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=.8;ctx.stroke();break}
    default:glow(p.x,p.y,p.r*1.8,c)}
  ctx.restore()}
function drawSpecialFx(f){const m=f.mv;if(!m)return;const s=f.c.sz,c=f.c.fx;
  if(f.st==='sp'){const t=m.t;ctx.lineCap='round';
    if(m.sp==='beam'){if(t<14){glow(f.x+f.face*16*s,f.y-27*s,3+t*.45,c)}
      else if(t<22){const x0=f.x+f.face*14*s,x1=f.x+f.face*178*s,y=f.y-27*s,w=(22-t)*1.3+3;ctx.globalAlpha=.9;ctx.strokeStyle=c;ctx.lineWidth=w*2;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=w*.7;ctx.stroke();ctx.globalAlpha=1;glow(x0,y,w*2.4,c)}}
    if(m.sp==='snipe'&&t<22){ctx.strokeStyle='rgba(255,40,40,.55)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(f.x+f.face*18*s,f.y-27*s);ctx.lineTo(f.x+f.face*380,f.y-27*s);ctx.stroke()}
    if(m.sp==='hook'&&m.hx!=null&&t>=6){ctx.strokeStyle='#c8c8d8';ctx.lineWidth=1;ctx.setLineDash([3,2]);ctx.beginPath();ctx.moveTo(f.x+f.face*6,f.y-26*s);ctx.lineTo(m.hx,m.hy);ctx.stroke();ctx.setLineDash([]);dot(m.hx,m.hy,2,c)}
    if((m.sp==='jetpack'&&t>=6&&t<34)||(m.sp==='hover'&&t%12<6&&t<36)){const fl=6+Math.sin(t*1.7)*2;ctx.globalAlpha=.9;glow(f.x-f.face*2,f.y+3,fl,'#ff9a3a','#fff4c0');ctx.globalAlpha=1}
    if(m.sp==='flameup'&&t>=5&&t<22){const g=ctx.createLinearGradient(0,f.y+30,0,f.y-40);g.addColorStop(0,'rgba(255,80,0,0)');g.addColorStop(.5,c);g.addColorStop(1,'rgba(255,240,180,.8)');ctx.fillStyle=g;ctx.globalAlpha=.75;ctx.beginPath();ctx.ellipse(f.x,f.y-6,9+Math.sin(t)*2,30,0,0,TAU);ctx.fill();ctx.globalAlpha=1}
    if(f.counter){ctx.strokeStyle='#ffffff';ctx.lineWidth=1.4;ctx.globalAlpha=.6+.4*Math.sin(t);ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+t*.1;ctx.lineTo(f.x+Math.cos(a)*22*s,f.y-20*s+Math.sin(a)*22*s)}ctx.closePath();ctx.stroke();ctx.globalAlpha=1}
    if(f.armor){ctx.strokeStyle=c;ctx.globalAlpha=.5;ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(f.x,f.y-20*s,22*s,0,TAU);ctx.stroke();ctx.globalAlpha=1}
    if(m.sp==='palm'&&t>=9&&t<14)glow(f.x+f.face*20*s,f.y-24*s,14,c)}}
function drawStatus(f){const s=f.c.sz;
  if(f.st==='shield'){const r=(10+13*f.sh/50)*s,g=ctx.createRadialGradient(f.x,f.y-19*s,r*.3,f.x,f.y-19*s,r);g.addColorStop(0,'rgba(255,255,255,.05)');g.addColorStop(1,f.c.fx);
    ctx.globalAlpha=.45;ctx.fillStyle=g;ctx.beginPath();ctx.arc(f.x,f.y-19*s,r,0,TAU);ctx.fill();ctx.globalAlpha=.85;ctx.strokeStyle=f.c.fx;ctx.lineWidth=1.1;ctx.stroke();ctx.globalAlpha=1}
  if(f.st==='dizzy'){for(let i=0;i<3;i++){const a=FRAME*.12+i/3*TAU;star(f.x+Math.cos(a)*8,f.y-46*s+Math.sin(a)*2.4,2.6,'#ffd84a')}}
  if(f.st==='spawn'){ctx.fillStyle=f.c.fx;ctx.globalAlpha=.7;ctx.beginPath();ctx.ellipse(f.x,f.y+2,16,3.4,0,0,TAU);ctx.fill();ctx.globalAlpha=1}
  if(f.st!=='ko'&&!f.hide){const y=f.y-(f.st==='ledge'?20:50)*s-4;ctx.fillStyle=f.cpu?'#7aa0ff':'#ff4a5a';ctx.beginPath();ctx.moveTo(f.x-3.4,y-5);ctx.lineTo(f.x+3.4,y-5);ctx.lineTo(f.x,y);ctx.closePath();ctx.fill()}}
function star(x,y,r,col){ctx.fillStyle=col;ctx.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU-Math.PI/2,rr=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}ctx.closePath();ctx.fill()}
function drawFx(){for(const e of FX){const k=e.life/e.max;
  if(e.k==='p'){ctx.globalAlpha=k;ctx.fillStyle=e.col;ctx.beginPath();ctx.arc(e.x,e.y,e.r*k+.4,0,TAU);ctx.fill()}
  else if(e.k==='smoke'){ctx.globalAlpha=k*.45;ctx.fillStyle=e.col;ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,TAU);ctx.fill()}
  else if(e.k==='flash'){ctx.globalAlpha=k;glow(e.x,e.y,e.r*(1.3-k*.3),e.col)}
  else if(e.k==='dust'){ctx.globalAlpha=k*.5;ctx.fillStyle='#c8c8d8';ctx.beginPath();ctx.arc(e.x,e.y,e.r*(1.5-k*.5),0,TAU);ctx.fill()}
  else if(e.k==='ring'){ctx.globalAlpha=k;ctx.strokeStyle=e.col;ctx.lineWidth=2*k+.4;ctx.beginPath();ctx.arc(e.x,e.y,e.r*(1.15-k*.6),0,TAU);ctx.stroke()}
  else if(e.k==='spark'){ctx.globalAlpha=Math.min(1,k*1.5);ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.rot);const r=e.r*(1.3-k*.5);ctx.fillStyle='#fff';ctx.beginPath();
    for(let i=0;i<16;i++){const a=i/16*TAU,rr=i%2?r*.18:r*(i%4?.55:1);ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();ctx.strokeStyle=e.col;ctx.lineWidth=1.2;ctx.stroke();ctx.restore()}
  else if(e.k==='ko'){ctx.globalAlpha=k;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.ang);const L=400*(1.2-k);ctx.fillStyle=e.col;ctx.beginPath();ctx.moveTo(0,-30*k);ctx.lineTo(L,0);ctx.lineTo(0,30*k);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(0,-12*k);ctx.lineTo(L*.8,0);ctx.lineTo(0,12*k);ctx.closePath();ctx.fill();ctx.restore()}}ctx.globalAlpha=1}
/* fighters off the screen get a bubble at the edge */
function drawOffscreen(f){if(f.st==='ko')return;const S=camS(),sx=(f.x-CAM.x)*S+SW/2,sy=(f.y-20-CAM.y)*S+SH/2,m=22*U;
  if(sx>-4&&sx<SW+4&&sy>-4&&sy<SH+4)return;const bx=clamp(sx,m,SW-m),by=clamp(sy,m,SH-m);ctx.fillStyle='rgba(10,10,24,.85)';ctx.strokeStyle=f.cpu?'#7aa0ff':'#ff4a5a';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(bx,by,15*U,0,TAU);ctx.fill();ctx.stroke();ctx.save();ctx.beginPath();ctx.arc(bx,by,14*U,0,TAU);ctx.clip();drawBust(f.c,bx,by+2*U,1.5*U,1);ctx.restore()}
