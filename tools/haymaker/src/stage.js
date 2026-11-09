/* ================= poses and the side-view stage =================
   poseOf turns a fighter's state into hand, foot and hip targets for drawFighter (fighter.js); each step the drawn
   pose eases toward it. The stage is the venue's backdrop (scene.js), raised and sliding a little with the camera,
   then a side view of the ring: far ropes, the canvas, the apron, and one near rope in front. */
const groundY=()=>Math.round(clamp(BH*.62,150,BH-44));
function idlePose(t,i=0){const b=Math.sin((t+i*40)*.11),P=Object.assign({},GUARD);P.hy+=b*1.1;P.fy+=b*1.6;P.ny+=b*1.4;return P}
function poseOf(f){const st=f.st,t=f.t,T=M?M.t:0;let P=idlePose(T,f.i);
  const crouchP={hy:-25,lean:.34,fx:20,fy:-48,nx:12,ny:-50,lfx:15,lnx:-13};
  if(st==='walk'){const ph=f.wph;P.lfx=12+Math.sin(ph)*7;P.lfy=-Math.max(0,Math.cos(ph))*3;P.lnx=-11-Math.sin(ph)*7;P.lny=-Math.max(0,-Math.cos(ph))*3;
    if(f.pad.held[backK(f)]){P.fx=15;P.fy=-80;P.nx=11;P.ny=-78}}
  else if(st==='crouch')Object.assign(P,crouchP);
  else if(st==='jump')Object.assign(P,{hy:-46,lfx:9,lfy:-14,lnx:-7,lny:-9,fx:18,fy:-76,nx:10,ny:-78});
  else if(st==='block'){if(f.low)Object.assign(P,crouchP,{fx:16,fy:-60,nx:12,ny:-58,ex:'angry'});else Object.assign(P,{fx:15,fy:-82,nx:11,ny:-80,lean:-.04,ex:'angry'})}
  else if(st==='atk'&&f.mv){const m=f.mv,s=m.s||1,a=m.a||1,r=m.r||1,mf=f.mf,k=mf<s?ease(mf/s):mf<=s+a?1:1-ease((mf-s-a)/r);
    if(m.crouch)Object.assign(P,crouchP);if(m.air||f.y<-4)Object.assign(P,{hy:-46,lfx:9,lfy:-14,lnx:-7,lny:-9});
    if(m.wind&&mf<s)P=lerpP(P,m.wind,ease(mf/s));else P=lerpP(P,m.to,k);
    if(m.roll&&mf>s&&mf<=s+a)P.rot=(mf-s)/a*TAU;
    if(m.hits&&m.sp&&(m.sp.k==='flurry'||m.sp.k==='barrage')&&mf>s&&mf<=s+a)P=lerpP(P,Math.floor((mf-s)/4)%2?{fx:46,fy:-70,nx:16,ny:-72}:{nx:46,ny:-66,fx:20,fy:-70},1);
    if(m.sp&&m.sp.k==='multi'&&mf>s&&mf<=s+a)P.flip=Math.floor((mf-s)/5)%2===1;
    if(m.sp&&m.sp.k==='tele')P.alpha=mf<s?1-mf/s:Math.min(1,(mf-s)/6);
    if(m.counter&&mf>s&&mf<=s+a)P.glow=m.sp.c;if(m.armor&&f.armor)P.glow='#ffd84a';if(m.fatal)P.glow=f.ch.sp[0].c;if(m.sp&&mf<s+2&&!P.glow)P.glow=m.sp.c;
    P.ex=m.to.ex||'angry'}
  else if(st==='hit'){if(f.hitHigh)Object.assign(P,{lean:-.3,fx:8,fy:-60,nx:2,ny:-62,hx:-3,ex:'hurt',head:-.35});else Object.assign(P,{lean:.45,fx:14,fy:-52,nx:8,ny:-50,hy:-36,ex:'hurt',head:.2})}
  else if(st==='air'||st==='thrown')Object.assign(P,{rot:-.7-Math.min(1,t*.05)*.4,fx:20,fy:-96,nx:-10,ny:-90,lfx:16,lfy:-6,lnx:-8,lny:-14,ex:'hurt'});
  else if(st==='launched')Object.assign(P,{rot:f.spin||0,fx:20,fy:-96,nx:-10,ny:-90,ex:'daze'});
  else if(st==='down')Object.assign(P,{rot:-1.48,hy:-10,fx:10,fy:-62,nx:0,ny:-60,lfx:16,lfy:-2,lnx:4,lny:-1,ex:'daze'});
  else if(st==='getup')P=lerpP(Object.assign({},P,{rot:-1.48,hy:-10,ex:'hurt'}),P,ease(t/16));
  else if(st==='dizzy'){P.lean=Math.sin(t*.09)*.22;P.fx=16;P.fy=-46;P.nx=8;P.ny=-48;P.ex='daze';P.hx=Math.sin(t*.09)*3}
  else if(st==='throwing')P=lerpP(P,{fx:30,fy:-86,nx:26,ny:-90,lean:-.2,ex:'angry'},Math.min(1,t/14));
  else if(st==='cine'){const ct=M.cin?M.cin.t:0,ph=ct<30?0:ct<60?1:2,k=ease(((ct-[4,32,64][ph])%30)/12);
    P=lerpP(P,[{fx:48,fy:-70,lean:.3},{nx:46,ny:-54,lean:.5,hy:-34},{nx:30,ny:-110,lean:-.15,hy:-46}][ph],Math.min(1,k));P.ex='angry';P.glow=f.ch.sp[0].c}
  else if(st==='fin'){P=lerpP(lerpP(P,{nx:-10,ny:-30,lean:.4,hy:-30},Math.min(1,t/16)),{nx:34,ny:-116,lean:-.2,hy:-48},t>16?ease((t-16)/8):0);P.ex='angry';P.glow='#ffd84a'}
  if(M&&(M.ph==='over'||M.ph==='done'||M.fin&&t>40)&&M.roundWinner===f.i&&(st==='idle'||st==='fin'&&t>60))Object.assign(P,{fx:8,fy:-108,nx:-4,ny:-106,lean:-.05,ex:'grin'});
  return P}

/* ---------- the stage ---------- */
function drawSideRing(id,bottom){const v=VENUES[id],S=STAGE,FX0=S+30,NX=S+44;
  RC(-1200,-26,2400,bottom+30,shade(v.apron,-.5));
  for(const s of[-1,1]){const x=s*FX0;cel(pP([x-3.5,-74,x+3.5,-74,x+3.5,-24,x-3.5,-24]),v.post,{sx:2,sy:0,lw:1.8});RCO(x-5,-72,10,6,v.rope[0],1.2)}
  for(let k=0;k<3;k++){const y=-38-k*12,c=v.rope[k];LN(-FX0,y,FX0,y,4.4,INK);LN(-FX0,y,FX0,y,2.6,c);LN(-FX0,y-.7,FX0,y-.7,.9,shade(c,.45))}
  PL([-FX0,-26,FX0,-26,NX,22,-NX,22],v.canvas);
  G.globalAlpha=.12;for(let i=1;i<5;i++){const y=-26+i*i*3;LN(-FX0-i*3,y,FX0+i*3,y,1,'#000')}G.globalAlpha=1;
  G.globalAlpha=.18;E(0,-2,62,9,shade(v.canvas,-.3));G.globalAlpha=1;
  LN(-FX0,-26,FX0,-26,1.6,INK);
  PL([-NX,22,NX,22,NX,50,-NX,50],v.apron);LN(-NX,22,NX,22,2,INK);LN(-NX,50,NX,50,2,INK);
  G.globalAlpha=.25;for(let x=-NX+10;x<NX;x+=36)RC(x,28,18,16,shade(v.apron,.3));G.globalAlpha=1;
  for(const s of[-1,1])for(let k=0;k<3;k++){const h=12+k*12;LN(s*FX0,-26-h,s*NX,22-h,3.4,INK);LN(s*FX0,-26-h,s*NX,22-h,1.8,v.rope[k])}}
function drawNearRing(id){const v=VENUES[id],NX=STAGE+44;
  G.globalAlpha=.8;LN(-NX,12,NX,12,5,INK);LN(-NX,12,NX,12,3.2,v.rope[0]);LN(-NX,11,NX,11,1,shade(v.rope[0],.5));G.globalAlpha=1;
  for(const s of[-1,1]){const x=s*NX;cel(pP([x-4,-28,x+4,-28,x+4,24,x-4,24]),v.post,{sx:2,sy:0,lw:1.8});RCO(x-6,-26,12,8,v.rope[1],1.3)}}
function drawProjs(){for(const p of M.proj){const s=Object.assign({},p.sp),c=s.c;
  if(p.rain){G.globalAlpha=.35+.2*Math.sin(p.t*.6);E(p.x,1,12,3,c);G.globalAlpha=1}
  if(p.pull){s.shape='hook';const hx=p.o.x+16*p.o.face*p.o.RF,hy=p.o.y-66*p.o.VS;LN(hx,hy,p.x,p.y,3,INK);LN(hx,hy,p.x,p.y,1.6,c)}
  G.save();G.translate(p.x,p.y);if(p.vx<0)G.scale(-1,1);
  if(s.shape==='egg')cel(pE(0,0,6,4.6,p.t*.3),'#f4f0d8',{sx:1.4,sy:1.2,lw:1.4});
  else if(s.shape==='shard'){cel(pP([-10,0,0,-5,12,0,0,5]),c,{sx:1.4,sy:1,lw:1.4});G.globalAlpha=.5;LN(-22,0,-10,0,3,c);G.globalAlpha=1}
  else if(s.shape==='fire'){G.globalAlpha=.6;for(let i=3;i>0;i--)E(-i*6,Math.sin(p.t*.6+i)*1.5,8-i*1.6,6-i*1.2,i%2?'#ffd84a':c);G.globalAlpha=1;cel(pE(0,0,8,6.5),c,{sx:1.4,sy:1.2,lw:1.5});E(1.5,-.5,4.2,3.4,'#ffe680');E(2.6,-1.2,1.8,1.4,'#fff')}
  else if(s.shape==='star'){G.rotate(p.t*.25);cel(pP([0,-8,2.4,-2.6,8,-2.4,3.6,1.6,5,8,0,4.4,-5,8,-3.6,1.6,-8,-2.4,-2.4,-2.6]),c,{sx:1,sy:1,lw:1.4})}
  else if(s.shape==='card'){G.rotate(p.t*.4);cel(pP([-3.5,-5,3.5,-5,3.5,5,-3.5,5]),'#f4f1ea',{sx:.8,sy:.8,lw:1.2});E(0,0,1.6,1.6,'#c8263a')}
  else if(s.shape==='orb'){const r=p.r+Math.sin(p.t*.4)*1.5;G.globalAlpha=.35;E(0,0,r*1.6,r*1.6,c);G.globalAlpha=1;cel(pE(0,0,r,r),c,{sx:1.5,sy:1.5,lw:1.5});E(-r*.3,-r*.3,r*.35,r*.3,'#fff')}
  else if(s.shape==='disc'){G.rotate(p.t*.5);cel(pE(0,0,7,7),c,{sx:1,sy:1,lw:1.4});LN(6,0,13,0,3,'#5a3a22')}
  else if(s.shape==='ball'){const r=p.r;G.rotate(p.t*.2);cel(pE(0,0,r,r),c,{sx:r*.25,sy:r*.25,lw:1.6});G.globalAlpha=.4;E(-r*.3,r*.2,r*.28,r*.22,'#000');E(r*.35,-r*.1,r*.2,r*.16,'#000');G.globalAlpha=1}
  else if(s.shape==='note'){cel(pE(0,3,4.5,3.4,-.3),c,{sx:.8,sy:.8,lw:1.3});LN(4,2,4,-9,1.8,INK);LN(4,-9,9,-6,2.2,INK);G.globalAlpha=.5;ARC(-8,0,8,-1,1,1.5,c);G.globalAlpha=1}
  else if(s.shape==='bolt'){cel(pP([-3,-12,4,-12,0,-2,5,-2,-4,12,-1,1,-5,1]),c,{sx:1,sy:1,lw:1.3})}
  else if(s.shape==='hook'){cel(pP([-4,-3,4,-3,6,0,4,3,-4,3]),'#c8c8d8',{sx:.6,sy:.6,lw:1.2});ARC(6,3,4,-1.6,1.4,2,'#c8c8d8')}
  else if(s.shape==='coin')cel(pE(0,0,5*Math.abs(Math.cos(p.t*.3))+1,5),'#f2c14e',{sx:1,sy:1,lw:1.4});
  else if(s.shape==='wave'){G.globalAlpha=.9;for(let i=0;i<3;i++){ARC(-i*6,0,12-i*2,-1.1,1.1,5-i,INK);ARC(-i*6,0,12-i*2,-1.1,1.1,3.4-i,c)}G.globalAlpha=1}
  else{const r=8+Math.sin(p.t*.5)*2;ARC(0,0,r,0,TAU,3.4,INK);ARC(0,0,r,0,TAU,2,c);ARC(-8,0,6,-1,1,2,c)}
  G.restore()}}
/* list: [{id,P,x,y,face,alt,frz,dizzy,flash,t}] in ring units, x from the ring's centre, y up from the canvas (negative) */
function drawTraps(){for(const t of M.traps){const c=t.sp.c,armed=t.t>20,bl=armed&&(t.t>>3)%2;G.save();G.translate(t.x,0);
  if(t.sp.shape==='tnt'){for(let k=-1;k<=1;k++)cel(pP([k*4-2,-12,k*4+2,-12,k*4+2,0,k*4-2,0]),'#c8263a',{sx:.6,sy:.4,lw:1.1});LN(0,-12,2,-17,1,INK);if(bl)E(2,-17,1.8,1.8,'#ffd84a')}
  else if(t.sp.shape==='rune'){G.globalAlpha=.5+.3*Math.sin(t.t*.2);EO(0,-1,12,3.4,c,1.4);EO(0,-1,7,2,c,1);G.globalAlpha=1}
  else{cel(pE(0,-2,9,3),'#5a5a62',{sx:.6,sy:.6,lw:1.2});for(let k=-3;k<=3;k++)LN(k*2.6,-3,k*2.6,-8,1.1,'#c8c8d8');E(0,-3,1.6,1.4,bl?'#ff3a3a':'#5a1a1a')}
  G.restore()}}
function drawBeams(){for(const f of M.F){const m=f.mv;if(f.st!=='atk'||!m||!m.beam||f.mf<=m.s||f.mf>m.s+m.a+3)continue;const c=m.sp.c,x0=f.x+18*f.face,x1=f.x+175*f.face,y=f.y-66*f.VS,k=1-(f.mf-m.s)/(m.a+4);
  G.globalAlpha=.5*k+.2;LN(x0,y,x1,y,9*k+3,c);G.globalAlpha=1;
  if(m.sp.jag){G.beginPath();G.moveTo(x0,y);for(let i=1;i<=12;i++)G.lineTo(x0+(x1-x0)*i/12,y+(hash(i+M.t)-.5)*10);G.lineWidth=2.4;G.strokeStyle='#fff';G.stroke()}else LN(x0,y,x1,y,2.4,'#fff')}}
function drawAuras(f){if(f.shield>0){G.globalAlpha=.22+.06*Math.sin(TT*12);E(f.x,f.y-f.H*.5,f.HW+12,f.H*.6,'#9ae8ff');G.globalAlpha=.6;EO(f.x,f.y-f.H*.5,f.HW+12,f.H*.6,'#e8faff',1.4);G.globalAlpha=1}
  if(f.buff>0&&(f.buff>60||(f.buff>>2)%2)){G.globalAlpha=.25;for(let k=0;k<3;k++){const a=TT*6+k*2.1;E(f.x+Math.cos(a)*(f.HW+4),f.y-f.H*.5+Math.sin(a*1.3)*f.H*.35,4,6,f.ch.sp.find(s=>s.k==='buff').c)}G.globalAlpha=1}}
/* the training room's view of hurtboxes (green), fists (red) and projectiles (yellow) */
function drawBoxes(){G.lineWidth=1;for(const f of M.F){const h=hurt(f);G.strokeStyle='rgba(80,255,120,.9)';G.strokeRect(h.x0,h.y0,h.x1-h.x0,h.y1-h.y0);const b=hitbox(f);if(b){G.fillStyle='rgba(255,60,60,.35)';G.fillRect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0);G.strokeStyle='#ff4a4a';G.strokeRect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0)}}
  for(const p of M.proj){G.strokeStyle='#ffd84a';G.strokeRect(p.x-p.r,p.y-p.r,p.r*2,p.r*2)}}
function drawStage(venue,list,o={}){G=bx;bx.setTransform(R,0,0,R,0,0);const v=VENUES[venue],z=o.z||1,sh=o.shake||0,gy=o.gy||groundY(),cam=o.cam||0;
  RC(0,0,BW,BH,v.top);G.save();G.translate(BW/2,0);G.scale(1.3,1.3);G.translate(-BW/2-cam*.22,(gy-26)/1.3-(BH-138));drawVenue(venue,TT);G.restore();
  if(o.cine){G.globalAlpha=.55;RC(0,0,BW,BH,'#05030c');G.globalAlpha=1}
  G.save();G.translate(BW/2+(sh?(rnd()-.5)*sh:0),gy+(sh?(rnd()-.5)*sh:0));G.scale(z,z);G.translate(-cam,o.anchor?0:50*(1-1/z));
  drawSideRing(venue,(BH-gy)/z+60);
  if(o.under)o.under();
  for(const f of list){const a=clamp(1+f.y/120,.2,1);G.globalAlpha=.3*a;E(f.x,1,16*a,3.5*a,'#000');G.globalAlpha=1}
  const order=[...list].sort((a,b)=>(a.st==='atk'?1:0)-(b.st==='atk'?1:0));
  for(const f of order){const P=f.P;if(f.H&&M)drawAuras(f);if(P.glow){G.globalAlpha=.22+.1*Math.sin(TT*30);E(f.x,f.y-46,26,48,P.glow);G.globalAlpha=1}
    const jx=f.flash>0?(f.flash%2?1.5:-1.5):0;
    drawFighter(f.id,P,f.x+jx,f.y,f.face*(P.flip?-1:1),{alpha:P.alpha,alt:f.alt});
    if(f.frz){G.globalAlpha=.45;cel(pE(f.x,f.y-46,22,48),'#bfeeff',{sx:3,sy:3,lw:1.6});G.globalAlpha=1}
    if(f.st==='dizzy')for(let i=0;i<3;i++){const a2=TT*7+i*2.1;cel(pE(f.x+Math.cos(a2)*13,f.y-100+Math.sin(a2)*3,2.4,2.4),'#ffd84a',{sx:.5,sy:.5,lw:1})}}
  if(o.over)o.over();
  drawNearRing(venue);G.restore();
  if(venue==='roof')rain(TT);
  if(o.dim){G.fillStyle=`rgba(5,4,12,${o.dim})`;G.fillRect(0,0,BW,BH)}}
function drawMatch(o={}){drawStage(M.venue,M.F,Object.assign({cam:CAMV.x,z:M.zoom,shake:M.shake,cine:!!(M.cin||M.fin&&M.fin.t<60),under(){drawTraps()},over(){drawBeams();drawProjs();drawFxRing();if(M.tr&&M.tr.boxes)drawBoxes()}},o))}
