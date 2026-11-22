/* ================= poses and the side-view stage =================
   poseOf turns a fighter's state into hand, foot and hip targets for drawFighter (fighter.js); each step the drawn
   pose eases toward it. The stage is the venue's backdrop (scene.js), raised and sliding a little with the camera,
   then a side view of the ring: far ropes, the canvas, the apron, and one near rope in front. */
const groundY=()=>Math.round(clamp(BH*.62,150,BH-44));
function idlePose(t,i=0){const b=Math.sin((t+i*40)*.11),P=Object.assign({},GUARD);P.hy+=b*1.1;P.fy+=b*1.6;P.ny+=b*1.4;return P}
function poseOf(f){const st=f.st,t=f.t,T=M?M.t:0;let P=idlePose(T,f.i);
  const walk=(ph,s)=>{P.lfx=12+Math.sin(ph)*7*s;P.lfy=-Math.max(0,Math.cos(ph))*3;P.lnx=-11-Math.sin(ph)*7*s;P.lny=-Math.max(0,-Math.cos(ph))*3};
  const blockP={fx:15,fy:-82,nx:11,ny:-80,lean:-.04,ex:'angry'};
  if(st==='lunge'){const k=t/f.W;walk(f.wph,1);P.lean=.18+k*.12;P.ex='angry';if(k>.78)P=lerpP(P,{fx:46,fy:-70,lean:.26},Math.min(1,(k-.78)/.15))}
  else if(st==='back'){walk(f.wph,.8);P.lean=0}
  else if(st==='jabbed')P=lerpP(P,{fx:38,fy:-70,lean:.2,ex:'grin'},.7);
  else if(st==='guard'||st==='block')Object.assign(P,blockP,st==='block'?{hx:-4,lean:-.12}:{});
  else if(st==='hit')Object.assign(P,{lean:-.3,fx:8,fy:-60,nx:2,ny:-62,hx:-3,ex:'hurt',head:-.35});
  else if(st==='reel'){const n=f.hitN;Object.assign(P,n===3?{lean:.45,fx:14,fy:-52,nx:8,ny:-50,hy:-36,ex:'hurt',head:.2}:n===4?{lean:-.5,fx:4,fy:-58,nx:-4,ny:-60,hx:-8,ex:'daze',head:-.5}:
    {lean:n===2?-.22:-.32,fx:8,fy:-60,nx:2,ny:-62,hx:n===2?2:-3,ex:'hurt',head:n===2?.3:-.35})}
  else if(st==='combo'){P.ex='angry';if(f.punchT>0){const k=Math.min(1,(10-f.punchT)/3);
      P=lerpP(P,[{nx:49,ny:-66,lean:.36,hx:5},{fx:40,fy:-76,lean:.32,hx:4},{nx:44,ny:-44,lean:.5,hy:-34},{nx:28,ny:-108,lean:-.12,hy:-44}][f.punchN-1],k)}else P=lerpP(P,{fx:24,fy:-72,nx:18,ny:-74,lean:.2},.6)}
  else if(st==='stun'){P.lean=Math.sin(t*.09)*.22;P.fx=16;P.fy=-46;P.nx=8;P.ny=-48;P.ex='daze';P.hx=Math.sin(t*.09)*3}
  else if(st==='air')Object.assign(P,{rot:-.7-Math.min(1,t*.05)*.4,fx:20,fy:-96,nx:-10,ny:-90,lfx:16,lfy:-6,lnx:-8,lny:-14,ex:'hurt'});
  else if(st==='launched')Object.assign(P,{rot:f.spin||0,fx:20,fy:-96,nx:-10,ny:-90,ex:'daze'});
  else if(st==='down')Object.assign(P,{rot:-1.48,hy:-10,fx:10,fy:-62,nx:0,ny:-60,lfx:16,lfy:-2,lnx:4,lny:-1,ex:'daze'});
  else if(st==='dizzy'){P.lean=Math.sin(t*.09)*.22;P.fx=16;P.fy=-46;P.nx=8;P.ny=-48;P.ex='daze';P.hx=Math.sin(t*.09)*3}
  else if(st==='fin'){P=lerpP(lerpP(P,{nx:-10,ny:-30,lean:.4,hy:-30},Math.min(1,t/16)),{nx:34,ny:-116,lean:-.2,hy:-48},t>16?ease((t-16)/8):0);P.ex='angry';P.glow='#ffd84a'}
  if(f.cool>0&&st==='idle'){P.lean=-.06;P.fy+=6;P.ny+=6}
  if(M&&(M.ph==='over'||M.ph==='done'||M.fin&&t>40)&&M.roundWinner===f.i&&(st==='idle'||st==='back'||st==='fin'&&t>60))Object.assign(P,{fx:8,fy:-108,nx:-4,ny:-106,lean:-.05,ex:'grin'});
  return P}
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
/* stars over a stunned or dizzy head, and how long the stun has left */
function drawStatus(){for(const f of M.F){if(f.st!=='stun'&&f.st!=='dizzy'&&!(f.stunT>0))continue;const top=f.y-f.H-8;
  for(let i=0;i<3;i++){const a=TT*7+i*2.1;cel(pE(f.x+Math.cos(a)*13,top+Math.sin(a)*3,2.4,2.4),'#ffd84a',{sx:.5,sy:.5,lw:1})}
  if(f.stunT>0){const w=34*f.stunT/TIME.stun;RC(f.x-18,top-10,36,4,'#0e0a14');RC(f.x-17,top-9,w,2,'#ff5a5a')}}}
function drawStage(venue,list,o={}){G=bx;bx.setTransform(R,0,0,R,0,0);const v=VENUES[venue],z=o.z||1,sh=o.shake||0,gy=o.gy||groundY(),cam=o.cam||0;
  RC(0,0,BW,BH,v.top);G.save();G.translate(BW/2,0);G.scale(1.3,1.3);G.translate(-BW/2-cam*.22,(gy-26)/1.3-(BH-138));drawVenue(venue,TT);G.restore();
  if(o.cine){G.globalAlpha=.55;RC(0,0,BW,BH,'#05030c');G.globalAlpha=1}
  G.save();G.translate(BW/2+(sh?(rnd()-.5)*sh:0),gy+(sh?(rnd()-.5)*sh:0));G.scale(z,z);G.translate(-cam,o.anchor?0:50*(1-1/z));
  drawSideRing(venue,(BH-gy)/z+60);
  if(o.under)o.under();
  for(const f of list){const a=clamp(1+f.y/120,.2,1);G.globalAlpha=.3*a;E(f.x,1,16*a,3.5*a,'#000');G.globalAlpha=1}
  const order=[...list].sort((a,b)=>(a.st==='atk'?1:0)-(b.st==='atk'?1:0));
  for(const f of order){const P=f.P;if(P.glow){G.globalAlpha=.22+.1*Math.sin(TT*30);E(f.x,f.y-46,26,48,P.glow);G.globalAlpha=1}
    const jx=f.flash>0?(f.flash%2?1.5:-1.5):0;
    drawFighter(f.id,P,f.x+jx,f.y,f.face*(P.flip?-1:1),{alpha:P.alpha,alt:f.alt});
    if(f.frz){G.globalAlpha=.45;cel(pE(f.x,f.y-46,22,48),'#bfeeff',{sx:3,sy:3,lw:1.6});G.globalAlpha=1}
}
  if(o.over)o.over();
  drawNearRing(venue);G.restore();
  if(venue==='roof')rain(TT);
  if(o.dim){G.fillStyle=`rgba(5,4,12,${o.dim})`;G.fillRect(0,0,BW,BH)}}
function drawMatch(o={}){drawStage(M.venue,M.F,Object.assign({cam:CAMV.x,z:M.zoom,shake:M.shake,cine:!!(M.fin&&M.fin.t<60),over(){drawFxRing();drawStatus()}},o))}
