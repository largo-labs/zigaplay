/* ================= side-view fighters =================
   Each boxer is a little skeleton posed by where the hands, feet and hips go (two-bone IK for arms and legs), drawn
   in the Arcade Ink style. Local coordinates face right: x forward, y up is negative, the origin is on the ground
   between the feet. The lead arm (the jab) is the far arm; the rear arm (the cross) is the near one. */
function ik(rx,ry,tx,ty,l1,l2,bend){let dx=tx-rx,dy=ty-ry,d=Math.hypot(dx,dy)||.01;const mx=l1+l2-.05;if(d>mx){dx*=mx/d;dy*=mx/d;d=mx}d=Math.max(d,Math.abs(l1-l2)+.05);
  const a=Math.atan2(dy,dx),b=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)),e=a+bend*b;return{ex:rx+Math.cos(e)*l1,ey:ry+Math.sin(e)*l1,hx:rx+dx,hy:ry+dy}}
const rigOf=b=>({thigh:21,shin:21,torso:28+(b.h-44)*.35,neck:5,upper:14.5,fore:14,head:b.r*.86,depth:b.w*.62,gl:b.gl*.72,arm:b.arm*.95,leg:b.arm*1.25});
/* the guard every pose starts from */
const GUARD={hx:0,hy:-40,lean:.12,fx:22,fy:-68,nx:12,ny:-72,lfx:12,lfy:0,lnx:-11,lny:0,rot:0,ex:'guard',head:0,glow:null,flip:false,alpha:1};
function lerpP(a,b,k){const o=Object.assign({},a);for(const key in b){const v=b[key];o[key]=typeof v==='number'&&typeof a[key]==='number'?lerp(a[key],v,k):v}return o}
function gloveSide(x,y,r,ang,col){G.save();G.translate(x,y);G.rotate(ang);
  cel(pE(0,0,r*1.12,r*.92),col,{sx:r*.28,sy:r*.26,rw:r*.14,lw:Math.max(1.3,r*.16),rimCol:shade(col,.55)});
  cel(pE(r*.1,-r*.72,r*.5,r*.3,-.2),col,{sx:r*.08,sy:r*.06,rw:r*.05,lw:Math.max(1,r*.12)});
  E(-r*.2,-r*.42,r*.3,r*.13,'rgba(255,255,255,.7)');
  G.save();G.beginPath();G.ellipse(0,0,r*1.12,r*.92,0,0,TAU);G.clip();RC(-r*1.2,-r,r*.42,r*2,'#f4efe2');G.restore();LN(-r*.78,-r*.75,-r*.78,r*.75,Math.max(1,r*.12),INK);G.restore()}
/* a second colour scheme, for a mirror match */
const altLook=id=>Object.assign({},PEOPLE[id],{gloves:'#e9e4d6',trunks:'#2a2a32',trim:'#c8263a',top:PEOPLE[id].top?'#2a2a32':null});
function drawFighter(id,P,x,y,face,o={}){const p=o.alt?altLook(id):PEOPLE[id],b=p.build,S=b.s*.9,sk=p.skin,L=rigOf(b),far=shade(sk,-.16);
  G.save();G.translate(x,y);G.scale(face*S,S);if(o.alpha!=null)G.globalAlpha=o.alpha;
  if(P.rot){G.translate(P.hx,P.hy);G.rotate(P.rot);G.translate(-P.hx,-P.hy)}
  const ca=Math.sin(P.lean),cb=Math.cos(P.lean),hip={x:P.hx,y:P.hy},ch={x:hip.x+ca*L.torso,y:hip.y-cb*L.torso};
  const sF={x:ch.x+3,y:ch.y+4},sN={x:ch.x-4,y:ch.y+5},hF={x:hip.x+3,y:hip.y-1},hN={x:hip.x-3,y:hip.y};
  const boots=p.boots||(p.trunks==='#141018'?'#2a2a34':'#1a1620');
  const leg=(h,fx,fy,col)=>{const k=ik(h.x,h.y,fx,fy-2.5,L.thigh,L.shin,-1);cel(pL(h.x,h.y,k.ex,k.ey,L.leg*1.25,L.leg),col,{sx:1.8,sy:.6,rw:.9,lw:1.6});cel(pL(k.ex,k.ey,k.hx,k.hy,L.leg,L.leg*.7),col,{sx:1.6,sy:.4,rw:.8,lw:1.6});
    cel(pP([k.hx-4,k.hy-5,k.hx+3,k.hy-5,k.hx+10,k.hy+1,k.hx+10,k.hy+3,k.hx-5,k.hy+3]),boots,{sx:1.2,sy:1,rw:.6,lw:1.5});LN(k.hx-4.6,k.hy-3.2,k.hx+2,k.hy-3.2,1.2,'#f4efe2')};
  const arm=(s,tx,ty,col,z)=>{const k=ik(s.x,s.y,tx,ty,L.upper,L.fore,1);cel(pL(s.x,s.y,k.ex,k.ey,L.arm*1.35,L.arm*1.1),col,{sx:1.6,sy:1,rw:.9,lw:1.6});
    cel(pL(k.ex,k.ey,k.hx,k.hy,L.arm*1.15,L.arm*.95),col,{sx:1.4,sy:1,rw:.8,lw:1.6});gloveSide(k.hx+Math.cos(Math.atan2(k.hy-k.ey,k.hx-k.ex))*L.gl*.55,k.hy+Math.sin(Math.atan2(k.hy-k.ey,k.hx-k.ex))*L.gl*.55,L.gl*(z||1),Math.atan2(k.hy-k.ey,k.hx-k.ex),p.gloves)};
  leg(hF,P.lfx,P.lfy,far);
  arm(sF,P.fx,P.fy,far,P.zf);
  leg(hN,P.lnx,P.lny,sk);
  /* torso, seen from the side: a broad back, a chest that pushes forward */
  const D=L.depth,belly=b.belly?D*.42:0;
  cel(pP([ch.x-D*.48,ch.y+2,ch.x-D*.18,ch.y-3,ch.x+D*.34,ch.y-1,ch.x+D*.62,ch.y+9,ch.x+D*.5+belly,hip.y-10,hip.x+D*.42,hip.y-4,hip.x-D*.44,hip.y-4,hip.x-D*.5,hip.y-14]),sk,{sx:2.6,sy:1,rw:1.1,lw:1.8,inner(){const sd=shade(sk,-.26);
    ARC(ch.x+D*.2,ch.y+11,D*.38,.2,1.9,1.3,INK);if(!belly){for(let i=0;i<3;i++)LN(ch.x+D*.3,ch.y+20+i*5,ch.x+D*.44,ch.y+20+i*5,1,sd)}else{G.globalAlpha=.6;ARC(hip.x+D*.3,hip.y-16,D*.5,-.9,.9,1.2,sd);G.globalAlpha=1}
    ARC(ch.x-D*.2,ch.y+12,D*.32,1.9,3.6,1.1,sd);
    if(p.top)PLO([ch.x-D*.46,ch.y+8,ch.x+D*.62,ch.y+8,ch.x+D*.6,ch.y+19,ch.x-D*.44,ch.y+19],p.top,1.2);
    if(p.hairy){G.globalAlpha=.45;for(let i=0;i<10;i++)E(ch.x+D*(.1+((i*7)%5)*.08),ch.y+8+((i*11)%14),.5,.5,shade(sk,-.55));G.globalAlpha=1}
    if(p.tattoo)for(let i=0;i<3;i++)ARC(ch.x-2+i*2.6,ch.y+7,2.6,3.3,6,1,'#1c2a40');
    if(p.tattoo&&p.tattoo!=='none'&&id==='milo'){G.save();G.translate(ch.x-D*.28,ch.y+14);G.scale(.32,.32);drawTattoo(p.tattoo,0,0);G.restore()}}});
  /* trunks over the hips */
  cel(pP([hip.x-D*.56,hip.y-9,hip.x+D*.52,hip.y-9,hip.x+D*.62,hip.y+9,hip.x+2,hip.y+12,hip.x-D*.66,hip.y+10]),p.trunks,{sx:2,sy:1,rw:.8,lw:1.6,inner(){RC(hip.x-D,hip.y-10,D*2,3.2,p.trim);RC(hip.x-D*.62,hip.y-6,2.4,15,p.trim)}});
  if(p.rope){LNO(hip.x-D*.5,hip.y-7,hip.x+D*.5,hip.y-7,1.2,'#d8c49a')}
  /* neck and head, turned three-quarters toward the opponent */
  const nk={x:ch.x+ca*L.neck,y:ch.y-cb*L.neck};cel(pL(ch.x+1,ch.y+2,nk.x+1,nk.y,L.head*.9,L.head*.8),sk,{sx:1.4,sy:0,lw:1.4});
  if(p.chain)ARC(ch.x+1,ch.y+3,5,.2,2.8,1.1,'#f2c14e');
  G.save();G.translate(nk.x+2,nk.y-L.head*1.05);G.rotate((P.head||0)+P.lean*.3);drawFace(p,0,0,L.head,P.ex||'guard',{turn:.72});G.restore();
  if(P.shoulder!==false)cel(pE(sN.x,sN.y+1,L.arm*.95,L.arm*.85),sk,{sx:1.4,sy:1.2,rw:.8,lw:1.5});
  arm(sN,P.nx,P.ny,sk,P.zn);
  G.restore()}
