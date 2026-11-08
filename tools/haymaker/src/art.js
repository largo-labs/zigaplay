/* ================= drawing people =================
   Everything is drawn with shapes into G (the low-resolution ring buffer, or a portrait buffer), with dark outlines,
   so it scales up as chunky pixels. Faces, hair and outfits come from PEOPLE. */
const OUT='#120c14';
function E(x,y,rx,ry,c,rot=0){G.fillStyle=c;G.beginPath();G.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU);G.fill()}
function EO(x,y,rx,ry,c,o=1,rot=0){E(x,y,rx+o,ry+o,OUT,rot);E(x,y,rx,ry,c,rot)}
function RC(x,y,w,h,c){G.fillStyle=c;G.fillRect(x,y,w,h)}
function PL(pts,c){G.fillStyle=c;G.beginPath();G.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)G.lineTo(pts[i],pts[i+1]);G.closePath();G.fill()}
function PLO(pts,c){G.lineJoin='round';G.strokeStyle=OUT;G.lineWidth=2;G.beginPath();G.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)G.lineTo(pts[i],pts[i+1]);G.closePath();G.stroke();PL(pts,c)}
function LN(x1,y1,x2,y2,w,c,cap='round'){G.strokeStyle=c;G.lineWidth=w;G.lineCap=cap;G.beginPath();G.moveTo(x1,y1);G.lineTo(x2,y2);G.stroke()}
function LNO(x1,y1,x2,y2,w,c){LN(x1,y1,x2,y2,w+2,OUT);LN(x1,y1,x2,y2,w,c)}
function ARC(x,y,r,a0,a1,w,c){G.strokeStyle=c;G.lineWidth=w;G.lineCap='round';G.beginPath();G.arc(x,y,Math.max(.1,r),a0,a1);G.stroke()}
/* an arm from shoulder (sx,sy) to elbow (ex,ey) to wrist (wx,wy): outlines first so the joints don't show seams,
   then the skin, a muscle on the upper arm, and shading down one side so it reads round */
function taper(ax,ay,bx_,by,wa,wb,c){const l=Math.hypot(bx_-ax,by-ay)||1,nx=-(by-ay)/l,ny=(bx_-ax)/l;PL([ax+nx*wa/2,ay+ny*wa/2,bx_+nx*wb/2,by+ny*wb/2,bx_-nx*wb/2,by-ny*wb/2,ax-nx*wa/2,ay-ny*wa/2],c);E(ax,ay,wa/2,wa/2,c);E(bx_,by,wb/2,wb/2,c)}
function arm3(sx,sy,ex,ey,wx,wy,wu,wf,sk,ls=1,we=0){we=we||wu*.9;const skD=shade(sk,-.24),skL=shade(sk,.15),ua=Math.atan2(ey-sy,ex-sx),ul=Math.hypot(ex-sx,ey-sy),mx=(sx+ex)/2,my=(sy+ey)/2;
  taper(sx,sy,ex,ey,wu+2,we+2,OUT);taper(ex,ey,wx,wy,we+2,wf+2,OUT);E(mx,my,ul*.46+1,wu*.6+1,OUT,ua);
  taper(sx,sy,ex,ey,wu,we,sk);taper(ex,ey,wx,wy,we,wf,sk);E(mx,my,ul*.46,wu*.6,sk,ua);
  const band=(ax,ay,bx_,by,w,off,c)=>{const l=Math.hypot(bx_-ax,by-ay)||1,nx=-(by-ay)/l*off,ny=(bx_-ax)/l*off;G.save();G.globalAlpha=.85;LN(ax+nx,ay+ny,bx_+nx,by+ny,w,c,'butt');G.restore()};
  band(sx,sy,ex,ey,wu*.32,wu*.3*ls,skD);band(ex,ey,wx,wy,wf*.3,wf*.3*ls,skD);
  band(sx+(ex-sx)*.2,sy+(ey-sy)*.2,ex-(ex-sx)*.2,ey-(ey-sy)*.2,wu*.2,-wu*.2*ls,skL);band(ex+(wx-ex)*.15,ey+(wy-ey)*.15,wx-(wx-ex)*.25,wy-(wy-ey)*.25,wf*.16,-wf*.2*ls,skL);
  E(ex,ey,wf*.42,wf*.42,sk)}
function clipHead(x,y,r,ry){G.save();G.beginPath();G.ellipse(x,y,r,ry,0,0,TAU);G.clip()}
/* a tapered limb: thick at a, thinner at b */
function limb(ax,ay,bx_,by,wa,wb,c){const dx=bx_-ax,dy=by-ay,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
  const p=[ax+nx*wa/2,ay+ny*wa/2,bx_+nx*wb/2,by+ny*wb/2,bx_-nx*wb/2,by-ny*wb/2,ax-nx*wa/2,ay-ny*wa/2];PLO(p,c);E(ax,ay,wa/2,wa/2,c);E(bx_,by,wb/2,wb/2,c)}

/* ---------- faces ---------- */
function hairBack(p,x,y,r){const h=p.hairCol;
  if(p.hair==='bun')EO(x,y-r*1.06,r*.46,r*.38,h);
  if(p.hair==='locs')for(let i=-2;i<=2;i++)LNO(x+i*r*.24,y-r*.3,x+i*r*.34,y+r*1.45,r*.26,shade(h,i%2?.08:0))}
function cap(x,y,r,ry,col,low=.22){clipHead(x,y,r+.6,ry+.6);E(x,y-ry*.72,r*1.25,ry*(.95-low),col);G.restore()}
function drawFace(p,x,y,r,ex='neutral',o={}){
  const t=o.turn||0,sk=p.skin,skD=shade(sk,-.2),skL=shade(sk,.16),ry=r*1.16,fx=x+t*r*.32,h=p.hairCol;
  hairBack(p,x,y,r);
  EO(x-r*.97+t*r*.25,y+r*.08,r*.17,r*.27,skD);EO(x+r*.97+t*r*.25,y+r*.08,r*.17,r*.27,skD);
  if(p.earrings){E(x-r*.99+t*r*.25,y+r*.42,r*.1,r*.12,'#f2c14e');E(x+r*.99+t*r*.25,y+r*.42,r*.1,r*.12,'#f2c14e')}
  EO(x,y,r,ry,sk);
  clipHead(x,y,r,ry);E(x+r*.78+t*r*.3,y+r*.2,r*.5,ry*1.1,skD);E(x-r*.38,y-r*.52,r*.42,r*.3,skL);
  if(p.stubble){G.globalAlpha=.4;E(fx,y+r*.62,r*.86,r*.5,p.stubble);G.globalAlpha=1}
  if(p.old){G.globalAlpha=.35;ARC(fx-r*.62,y+r*.3,r*.3,1.2,2.4,Math.max(.6,r*.05),skD);ARC(fx+r*.62,y+r*.3,r*.3,.7,1.9,Math.max(.6,r*.05),skD);G.globalAlpha=1}
  G.restore();
  /* hair on top */
  if(p.hair==='curly'){cap(x,y,r,ry,h,.32);for(let a=-3.05;a<=-.08;a+=.32)E(x+Math.cos(a)*r*.93,y-r*.18+Math.sin(a)*ry*.92,r*.24,r*.24,h);
    G.globalAlpha=.5;for(let i=0;i<5;i++)E(x-r*.5+i*r*.25,y-ry*.72+(i%2)*r*.12,r*.08,r*.06,shade(h,.3));G.globalAlpha=1}
  else if(p.hair==='bald'){E(x-r*.32,y-ry*.66,r*.28,r*.12,skL)}
  else if(p.hair==='shaved'){G.globalAlpha=.35;cap(x,y,r,ry,h,.34);G.globalAlpha=1;E(x-r*.3,y-ry*.7,r*.22,r*.09,skL)}
  else if(p.hair==='buzz'){cap(x,y,r,ry,h,.36)}
  else if(p.hair==='bun'){cap(x,y,r,ry,h,.3);G.globalAlpha=.45;ARC(x,y-ry*.2,r*.82,-2.6,-.55,Math.max(.6,r*.07),shade(h,.35));G.globalAlpha=1;
    if(p.flower){for(let i=0;i<5;i++){const a=i*TAU/5;E(x+r*.72+Math.cos(a)*r*.17,y-ry*.78+Math.sin(a)*r*.17,r*.15,r*.15,p.flower)}E(x+r*.72,y-ry*.78,r*.09,r*.09,'#f2c14e')}}
  else if(p.hair==='spiky'){cap(x,y,r,ry,h,.28);for(let i=0;i<6;i++){const a=-2.9+i*.46,bx_=x+Math.cos(a)*r*.85,by=y-r*.1+Math.sin(a)*ry*.85;PLO([bx_-r*.2,by+r*.1,bx_+Math.cos(a)*r*.55,by+Math.sin(a)*r*.55,bx_+r*.2,by+r*.1],h)}}
  else if(p.hair==='slick'){cap(x,y,r,ry,h,.3);G.globalAlpha=.55;ARC(x+r*.1,y-ry*.1,r*.75,-2.7,-.9,Math.max(.6,r*.1),shade(h,.35));G.globalAlpha=1;if(p.streak)ARC(x-r*.1,y-ry*.1,r*.86,-2.3,-1.5,Math.max(.8,r*.14),p.streak)}
  else if(p.hair==='locs'){cap(x,y,r,ry,h,.3);for(let i=-2;i<=2;i++)LN(x+i*r*.3,y-ry*.95,x+i*r*.36,y-ry*.35,Math.max(.6,r*.1),shade(h,.18))}
  if(p.bandana){clipHead(x,y,r+.6,ry+.6);RC(x-r*1.2,y-ry*.62,r*2.4,r*.3,p.bandana);G.restore();PLO([x+r*.9,y-ry*.55,x+r*1.45,y-ry*.3,x+r*1.25,y-ry*.12],p.bandana)}
  /* eyes and brows */
  const ey=y-r*.04,ew=r*.37,big=r>=13;
  const eye=(sx)=>{const xx=fx+sx*ew;
    if(ex==='calm'){ARC(xx,ey-r*.06,r*.17,.3,2.84,Math.max(.7,r*.08),OUT);return}
    if(ex==='hurt'||ex==='daze'){LN(xx-r*.16,ey-r*.1*sx,xx+r*.16,ey,Math.max(.7,r*.09),OUT);LN(xx-r*.16,ey+r*.1*sx,xx+r*.16,ey,Math.max(.7,r*.09),OUT);return}
    const wy=ex==='shock'?r*.18:ex==='smug'?r*.08:r*.13;E(xx,ey,r*.2,wy,'#fbf6ee');E(xx+(o.look||0)*r*.06,ey+(ex==='smug'?r*.02:0),r*.11,Math.min(wy,r*.11),p.eye||'#2a1a10');if(big)E(xx+(o.look||0)*r*.06,ey,r*.05,r*.05,'#000');
    if(ex==='smug'){LN(xx-r*.22,ey-r*.07,xx+r*.22,ey-r*.07,Math.max(.7,r*.07),skD)}};
  eye(-1);eye(1);
  const bw=Math.max(.9,r*.1),bc=p.hair==='bald'||p.hair==='shaved'?shade(sk,-.45):shade(h,-.1),by=y-r*.33;
  const brow=(sx)=>{const xx=fx+sx*ew;let a=0,up=0;
    if(ex==='angry')a=.38;else if(ex==='hurt'||ex==='shock'||ex==='daze')a=-.3,up=r*.08;else if(ex==='smug'&&sx>0)up=r*.12;else if(ex==='grin')up=r*.04;
    LN(xx-sx*r*.2,by-up+a*r*.3,xx+sx*r*.21,by-up-a*r*.12,bw,bc)};
  brow(-1);brow(1);
  if(p.glasses){G.lineWidth=Math.max(.7,r*.07);G.strokeStyle='#c9b26a';for(const s of[-1,1]){G.beginPath();G.ellipse(fx+s*ew,ey,r*.27,r*.22,0,0,TAU);G.stroke()}LN(fx-ew+r*.27,ey,fx+ew-r*.27,ey,Math.max(.6,r*.06),'#c9b26a')}
  if(p.scar)LN(fx+r*.18,y-r*.55,fx+r*.42,y+r*.12,Math.max(.7,r*.08),'#d98a8a');
  if(p.freckles){G.globalAlpha=.6;for(const[a,b]of[[-.5,.22],[-.62,.3],[-.4,.32],[.5,.22],[.62,.3],[.4,.32]])E(fx+a*r,y+b*r,r*.04+.3,r*.04+.3,'#b5643a');G.globalAlpha=1}
  /* nose */
  E(fx+r*.03,y+r*.24,r*.12,r*.15,skD);E(fx-r*.02,y+r*.2,r*.05,r*.07,skL);
  /* beard and mustache */
  if(p.beard){G.save();G.beginPath();G.rect(x-r*1.3,y+r*.28,r*2.6,r*2);G.clip();EO(fx,y+r*.62,r*.9,r*.62,p.beard);G.restore();E(fx,y+r*.4,r*.4,r*.12,p.beard)}
  /* mouth */
  const my=y+r*.6,mw=r*.36,lip=p.lips||shade(sk,-.35),mt=Math.max(.8,r*.08);
  if(ex==='grin'){G.fillStyle=OUT;G.beginPath();G.ellipse(fx,my-r*.04,mw,r*.2,0,0,Math.PI);G.fill();RC(fx-mw*.8,my-r*.04,mw*1.6,Math.max(1,r*.08),'#fbf6ee');if(p.gap)RC(fx-.5,my-r*.04,1,Math.max(1,r*.08),OUT)}
  else if(ex==='smug'){LN(fx-mw*.6,my+r*.02,fx+mw*.8,my-r*.08,mt,lip)}
  else if(ex==='angry'){RC(fx-mw*.75,my-r*.06,mw*1.5,r*.15,OUT);RC(fx-mw*.65,my-r*.03,mw*1.3,Math.max(1,r*.08),'#fbf6ee')}
  else if(ex==='hurt'||ex==='daze'){E(fx+r*.05,my+r*.02,r*.15,r*.12,OUT)}
  else if(ex==='shock'){E(fx,my+r*.02,r*.13,r*.17,OUT)}
  else if(ex==='calm'){ARC(fx,my-r*.2,r*.25,.6,2.5,mt,lip)}
  else if(ex==='guard'){RC(fx-mw*.7,my-r*.05,mw*1.4,Math.max(1,r*.13),'#3ac0e8');RC(fx-mw*.7,my-r*.05,mw*1.4,Math.max(.6,r*.04),OUT)}
  else LN(fx-mw*.55,my,fx+mw*.55,my,mt,lip);
  if(p.mustache)PL([fx-r*.36,my-r*.14,fx,my-r*.25,fx+r*.36,my-r*.14,fx+r*.3,my-r*.08,fx,my-r*.16,fx-r*.3,my-r*.08],p.mustache)}

/* ---------- gloves ---------- */
function glove(x,y,r,col,cuffDir=1,front=false){EO(x,y,r,r*.94,col);E(x-r*.32,y-r*.36,r*.36,r*.24,shade(col,.32));E(x+r*.25,y+r*.35,r*.42,r*.3,shade(col,-.22));
  if(!front){E(x+cuffDir*r*.62,y-r*.1,r*.32,r*.4,shade(col,.08))}
  RC(x-r*.62,y+r*.66*cuffDir,r*1.24,Math.max(1,r*.26)*cuffDir,'#f3efe4')}

/* ---------- portraits (busts) for the story and the cards ---------- */
function drawBust(id,x,y,s,ex='neutral',o={}){const p=PEOPLE[id],sk=p.skin,skD=shade(sk,-.2),r=13*s,hy=y-r*1.55;
  const sh=(w,col)=>{PLO([x-w,y+r*.3,x-w*.82,y-r*.12,x-r*.4,y-r*.42,x+r*.4,y-r*.42,x+w*.82,y-r*.12,x+w,y+r*.3,x+w,y+r*3,x-w,y+r*3],col)};
  if(p.outfit==='hoodie'){EO(x,y-r*.3,r*1.2,r*.55,shade(p.outCol,-.25));sh(r*2.25,p.outCol);RC(x-r*.42,y-r*.42,r*.84,r*.5,sk);LN(x-r*.25,y+r*.1,x-r*.3,y+r*.9,Math.max(1,r*.07),'#e8e2d0');LN(x+r*.25,y+r*.1,x+r*.3,y+r*.9,Math.max(1,r*.07),'#e8e2d0');
    PL([x-r*1.2,y+r*1.5,x+r*1.2,y+r*1.5,x+r*1.1,y+r*3,x-r*1.1,y+r*3],shade(p.outCol,-.12))}
  else if(p.outfit==='cardigan'){sh(r*2.1,p.outCol);PL([x-r*.62,y-r*.4,x+r*.62,y-r*.4,x,y+r*1.1],'#efe2c8');LN(x-r*.62,y-r*.38,x,y+r*1.1,Math.max(1,r*.12),shade(p.outCol,-.25));LN(x+r*.62,y-r*.38,x,y+r*1.1,Math.max(1,r*.12),shade(p.outCol,-.25));
    PLO([x+r*.9,y-r*.4,x+r*1.7,y-r*.2,x+r*1.5,y+r*2.5,x+r*.8,y+r*2.5],'#f4f1ea');for(let i=0;i<3;i++)LN(x+r*.88,y+r*(.4+i*.5),x+r*1.6,y+r*(.4+i*.5),Math.max(.8,r*.08),'#c8423a')}
  else if(p.outfit==='tux'){sh(r*2.15,p.outCol);PL([x-r*.55,y-r*.4,x+r*.55,y-r*.4,x,y+r*1.6],'#f4f1ea');PL([x-r*.38,y-r*.18,x,y-r*.02,x-r*.38,y+r*.14],'#c8263a');PL([x+r*.38,y-r*.18,x,y-r*.02,x+r*.38,y+r*.14],'#c8263a');E(x,y-r*.02,r*.1,r*.1,'#a01c2c');
    EO(x+r*1.4,y+r*.4,r*.28,r*.28,'#2a2a30');RC(x+r*1.3,y+r*.6,r*.2,r*1.4,'#3a3a42')}
  else if(p.outfit==='robe'){sh(r*2.3,p.outCol);PL([x-r*.5,y-r*.42,x+r*.5,y-r*.42,x+r*.15,y+r*1.4,x-r*.15,y+r*1.4],sk);LN(x-r*.5,y-r*.42,x-r*.12,y+r*1.5,Math.max(1.2,r*.22),p.trim);LN(x+r*.5,y-r*.42,x+r*.12,y+r*1.5,Math.max(1.2,r*.22),p.trim);
    if(p.chain)ARC(x,y-r*.5,r*.5,.5,2.64,Math.max(.8,r*.08),'#f2c14e')}
  else{/* fighters: bare shoulders and gloves up */const b=p.build,w=r*2*b.w/27;sh(w,sk);E(x-w*.45,y+r*.65,w*.32,r*.3,skD);E(x+w*.45,y+r*.65,w*.32,r*.3,skD);
    if(p.top)PL([x-w*.75,y+r*.45,x+w*.75,y+r*.45,x+w*.7,y+r*1.25,x-w*.7,y+r*1.25],p.top);
    if(p.chain)ARC(x,y-r*.5,r*.55,.5,2.64,Math.max(.8,r*.08),'#f2c14e');if(p.tattoo)for(let i=0;i<3;i++)ARC(x-w*.72+i*r*.25,y+r*.3,r*.22,3.3,6,Math.max(.7,r*.06),'#1c2a40');
    if(p.hairy){G.globalAlpha=.4;for(let i=0;i<8;i++)E(x+(i%4-1.5)*r*.3,y+r*(.7+(i>>2)*.3),r*.05+.3,r*.05+.3,shade(sk,-.5));G.globalAlpha=1}
    glove(x-w*.62,y+r*1.75,r*.95,p.gloves,1);glove(x+w*.62,y+r*1.75,r*.95,p.gloves,1)}
  RC(x-r*.42,y-r*.8,r*.84,r*.6,sk);RC(x+r*.05,y-r*.8,r*.37,r*.6,skD);
  drawFace(p,x,hy,r,ex,o)}

/* ---------- the opponent, facing you ----------
   pose: {x,y (body offset), lean, head:{x,y,turn,ex}, gl, gr (screen-left / screen-right glove: {x,y,z}), fall (0..1 lying down)}
   Positions are relative to the waist. A glove with z>1.15 is coming at you and is drawn later, over the player. */
const OSC=1.3;/* fighters are drawn this much bigger than their build numbers */
function drawOpp(id,pose,cx,wy){const p=PEOPLE[id],b=p.build,S=b.s*OSC,sk=p.skin,skD=shade(sk,-.2),skL=shade(sk,.12);
  G.save();G.translate(cx+pose.x,wy+pose.y);if(pose.fall){G.scale(1,1-pose.fall*.68);G.rotate(-pose.fall*.08)}G.rotate(pose.lean||0);G.scale(S,S);
  const W=b.w,H=b.h,sx=W,sy=-H,hx=pose.head.x,hy=pose.head.y;
  /* legs and trunks */
  for(const s of[-1,1]){limb(s*W*.38,14,s*W*.46,46,W*.42,W*.34,sk);E(s*W*.47,44,W*.2,4,skD)}
  PLO([-W*.74,-2,W*.74,-2,W*.8,22,W*.06,24,0,18,-W*.06,24,-W*.8,22],p.trunks);RC(-W*.74,-3,W*1.48,4,p.trim);RC(-W*.8,8,3,13,p.trim);RC(W*.8-3,8,3,13,p.trim);
  if(p.rope){LN(-W*.7,1,W*.7,1,2,'#d8c49a');LN(W*.2,1,W*.3,14,1.5,'#d8c49a')}
  /* arms behind the torso (shoulder to elbow) */
  const arm=(side,g)=>{const shx=side*sx*.9,shy=sy+5,gx=g.x,gy=g.y,d=clamp(Math.hypot(gx-side*W*.46,gy-(-H+4))/(W*.75),0,1);
    const ex=lerp(side*W*.84,(shx+gx)/2+side*W*.2,d),ey=lerp(-H*.36,(shy+gy)/2+5,d),wx=gx+(ex-gx)*.18,wy=gy+(ey-gy)*.18+b.gl*.3;
    arm3(shx,shy,ex,ey,wx,wy,b.arm*1.3,b.arm*.95,sk,side,b.arm*1.2)};
  /* torso */
  PLO([-sx,sy+4,-sx*.86,sy,-W*.25,sy-3,W*.25,sy-3,sx*.86,sy,sx,sy+4,W*.7,-2,-W*.7,-2],sk);
  E(sx*.92,sy+5,W*.24,W*.2,skL);E(-sx*.92,sy+5,W*.24,W*.2,skD);
  E(-W*.32,sy+H*.3,W*.3,H*.15,skD);E(W*.32,sy+H*.3,W*.3,H*.15,skD);E(-W*.32,sy+H*.27,W*.28,H*.12,sk);E(W*.32,sy+H*.27,W*.28,H*.12,sk);
  if(b.belly){EO(0,-H*.25,W*.62,H*.3,skL,.5);E(0,-H*.2,1.2,1.4,skD)}
  else if(b.cut||!p.top){for(let i=0;i<3;i++){LN(-W*.14,sy+H*(.5+i*.14),-W*.04,sy+H*(.5+i*.14),1,skD);LN(W*.04,sy+H*(.5+i*.14),W*.14,sy+H*(.5+i*.14),1,skD)}LN(0,sy+H*.45,0,-6,1,skD)}
  if(p.top)PLO([-W*.72,sy+H*.12,W*.72,sy+H*.12,W*.7,sy+H*.48,-W*.7,sy+H*.48],p.top);
  if(p.hairy){G.globalAlpha=.4;for(let i=0;i<14;i++)E(((i*37)%17-8)*W*.06,sy+H*(.25+((i*13)%9)*.06),.6,.6,shade(sk,-.55));G.globalAlpha=1}
  if(p.tattoo)for(let i=0;i<3;i++)ARC(-sx*.9+i*3,sy+9,3,3.3,6,1,'#1c2a40');
  if(p.chain)ARC(0,sy-6,W*.42,.4,2.74,1.2,'#f2c14e');
  arm(-1,pose.gl);arm(1,pose.gr);
  /* neck and head */
  RC(-W*.22+hx*.3,sy-9,W*.44,10,sk);RC(W*.04+hx*.3,sy-9,W*.18,10,skD);
  drawFace(p,hx,hy,b.r,pose.head.ex||'guard',{turn:pose.head.turn||0,look:pose.head.look||0});
  /* gloves (not the one coming at you) */
  const later=[];for(const[k,side]of[['gl',-1],['gr',1]]){const g=pose[k];if(g.z>1.15){later.push(g);continue}glove(g.x,g.y,b.gl*g.z,p.gloves,1)}
  G.restore();
  /* screen position of the coming glove(s), drawn by the caller after the player */
  return later.map(g=>({x:cx+(pose.x+g.x*S),y:wy+(pose.y+g.y*S),r:b.gl*g.z*S,col:p.gloves}))}

/* ---------- you, from behind and above ----------
   pose: {x,y,rot,s, gl, gr: {x,y,r} gloves relative to the neck base, hurt (0..1)} */
function drawPlayer(pose,cx,ny){const p=PEOPLE.milo,sk=p.skin,skD=shade(sk,-.22),skL=shade(sk,.12),h=p.hairCol;
  G.save();G.translate(cx+pose.x,ny+pose.y);G.rotate(pose.rot||0);const s=pose.s||1;G.scale(s,s);
  /* arms first: they rise from the shoulders up to the gloves */
  const arm=(side,g)=>{const shx=side*39,shy=3,ext=clamp((13-g.r)/5,0,1),wx=g.x+side*g.r*.15,wy=g.y+g.r*.75;
    const ex=lerp(side*45+g.x*.06,shx+(wx-shx)*.4+side*6,ext),ey=lerp(Math.max(6,g.y+44),shy+(wy-shy)*.4,ext);
    arm3(shx,shy,ex,ey,wx,wy,lerp(19,16,ext),lerp(13,8,ext),sk,-side,lerp(19,15,ext))};
  /* back */
  PLO([-45,4,-40,-4,-14,-12,14,-12,40,-4,45,4,40,90,-40,90],sk);
  E(-34,6,14,12,skD);E(34,6,14,12,skL);
  ARC(-16,16,12,-.3,1.6,1.5,skD);ARC(16,16,12,1.54,3.44,1.5,skD);LN(0,-2,0,90,1.5,skD);
  E(-30,40,9,22,skD);E(30,40,9,22,shade(sk,-.1));
  RC(-40,64,80,5,p.trim);RC(-40,69,80,30,p.trunks);
  const later=[];for(const[k,side]of[['gl',-1],['gr',1]]){const g=pose[k];if(g.front){later.push([side,g]);continue}arm(side,g)}
  /* neck and back of the head */
  RC(-9,-22,18,14,sk);RC(-9,-22,18,4,skD);
  EO(-16.5,-30,3,5,skD);EO(16.5,-30,3,5,skD);
  EO(0,-33,17,18,sk);
  clipHead(0,-33,17,18);E(0,-40,19,17,h);G.restore();
  for(let a=-.2;a<=Math.PI+.2;a+=.36)E(Math.cos(a)*15.5,-33+Math.sin(a)*-15-1,4.5,4.5,h);
  for(let i=-2;i<=2;i++)E(i*6.5,-21.5,4,3.5,h);
  G.globalAlpha=.4;for(let i=0;i<6;i++)E(-11+i*4.5,-44+(i%2)*3,1.4,1,shade(h,.4));G.globalAlpha=1;
  /* gloves in guard sit over the head's sides */
  for(const[k,side]of[['gl',-1],['gr',1]]){const g=pose[k];if(!g.front)glove(g.x,g.y,g.r,p.gloves,1)}
  for(const[side,g]of later){arm(side,g);glove(g.x,g.y,g.r,p.gloves,1,true)}
  G.restore()}
