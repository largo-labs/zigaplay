/* ================= Arcade Ink: drawing people =================
   Heavy ink outlines, two-tone cel shading (a hard shadow on the lower right), a bright rim on the upper left and
   heroic proportions: wide shoulders, big forearms, big gloves. Everything is drawn in ring units into G, which is
   scaled up to the screen's real pixels, so lines stay crisp. */
const INK='#0e0a14',OUT=INK;
/* plain shapes (used by the rings and the map too) */
function E(x,y,rx,ry,c,rot=0){G.fillStyle=c;G.beginPath();G.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU);G.fill()}
function EO(x,y,rx,ry,c,o=1,rot=0){E(x,y,rx,ry,c,rot);G.lineWidth=o*1.6;G.strokeStyle=INK;G.beginPath();G.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU);G.stroke()}
function RC(x,y,w,h,c){G.fillStyle=c;G.fillRect(x,y,w,h)}
function RCO(x,y,w,h,c,lw=1.6){RC(x,y,w,h,c);G.lineWidth=lw;G.strokeStyle=INK;G.strokeRect(x,y,w,h)}
function PL(pts,c){G.fillStyle=c;G.beginPath();G.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)G.lineTo(pts[i],pts[i+1]);G.closePath();G.fill()}
function PLO(pts,c,lw=1.8){PL(pts,c);G.lineJoin='round';G.strokeStyle=INK;G.lineWidth=lw;G.stroke()}
function LN(x1,y1,x2,y2,w,c,cap='round'){G.strokeStyle=c;G.lineWidth=w;G.lineCap=cap;G.beginPath();G.moveTo(x1,y1);G.lineTo(x2,y2);G.stroke()}
function LNO(x1,y1,x2,y2,w,c){LN(x1,y1,x2,y2,w+2.4,INK);LN(x1,y1,x2,y2,w,c)}
function ARC(x,y,r,a0,a1,w,c){G.strokeStyle=c;G.lineWidth=w;G.lineCap='round';G.beginPath();G.arc(x,y,Math.max(.1,r),a0,a1);G.stroke()}
/* ---------- cel shading ----------
   pf(ox,oy) adds a shape's path shifted by (ox,oy). The shape is filled with its colour, a rim of light on the upper
   left (outside the shape shifted down-right), a hard shadow on the lower right (outside the shape shifted up-left),
   then outlined in ink. */
function cel(pf,col,o={}){const sx=o.sx??2.4,sy=o.sy??2.2,rw=o.rw??1.1,lw=o.lw??1.8;
  G.save();G.beginPath();pf(0,0);G.clip();G.fillStyle=col;G.fillRect(-1e4,-1e4,2e4,2e4);
  if(o.rim!==false){G.fillStyle=o.rimCol||shade(col,.42);G.beginPath();G.rect(-1e4,-1e4,2e4,2e4);pf(rw,rw);G.fill('evenodd')}
  if(sx||sy){G.fillStyle=o.shCol||shade(col,o.sh??-.3);G.beginPath();G.rect(-1e4,-1e4,2e4,2e4);pf(-sx,-sy);G.fill('evenodd')}
  if(o.inner)o.inner();
  G.restore();if(lw){G.beginPath();pf(0,0);G.lineJoin='round';G.lineWidth=lw;G.strokeStyle=INK;G.stroke()}}
const pE=(x,y,rx,ry,rot=0)=>(ox,oy)=>{G.moveTo(x+ox+Math.cos(rot)*rx,y+oy+Math.sin(rot)*rx);G.ellipse(x+ox,y+oy,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU)};
const pP=pts=>(ox,oy)=>{G.moveTo(pts[0]+ox,pts[1]+oy);for(let i=2;i<pts.length;i+=2)G.lineTo(pts[i]+ox,pts[i+1]+oy);G.closePath()};
/* a limb: a tapered capsule from a (width wa) to b (width wb) */
const pL=(ax,ay,bx_,by,wa,wb)=>(ox,oy)=>{const n=Math.atan2(by-ay,bx_-ax)+Math.PI/2,c=Math.cos(n),s=Math.sin(n),AX=ax+ox,AY=ay+oy,BX=bx_+ox,BY=by+oy;
  G.moveTo(AX+c*wa/2,AY+s*wa/2);G.lineTo(BX+c*wb/2,BY+s*wb/2);G.arc(BX,BY,wb/2,n,n-Math.PI,true);G.lineTo(AX-c*wa/2,AY-s*wa/2);G.arc(AX,AY,wa/2,n+Math.PI,n,true);G.closePath()};
/* a head: round cranium, cheekbones, a jaw and a chin */
const pHead=(x,y,r,jw=.78,ch=.42)=>(ox,oy)=>{const X=x+ox,Y=y+oy,ry=r*1.12;
  G.moveTo(X-r,Y);G.bezierCurveTo(X-r,Y-ry*1.36,X+r,Y-ry*1.36,X+r,Y);
  G.quadraticCurveTo(X+r*.99,Y+ry*.45,X+r*jw,Y+ry*.66);G.quadraticCurveTo(X+r*ch*1.25,Y+ry*1.04,X+r*ch*.45,Y+ry*1.1);
  G.lineTo(X-r*ch*.45,Y+ry*1.1);G.quadraticCurveTo(X-r*ch*1.25,Y+ry*1.04,X-r*jw,Y+ry*.66);G.quadraticCurveTo(X-r*.99,Y+ry*.45,X-r,Y);G.closePath()};
/* a bumpy ellipse (curly hair): n bumps around (x,y) */
const pBumpy=(x,y,rx,ry,n=12,b=.18,a0=0)=>(ox,oy)=>{const X=x+ox,Y=y+oy;for(let i=0;i<=n;i++){const a=a0+i*TAU/n,px=X+Math.cos(a)*rx,py=Y+Math.sin(a)*ry;
  if(!i){G.moveTo(px,py);continue}const am=a-Math.PI/n;G.quadraticCurveTo(X+Math.cos(am)*rx*(1+b*1.6),Y+Math.sin(am)*ry*(1+b*1.6),px,py)}G.closePath()};
/* the hair that sits on the head, down to a hairline */
const pCap=(x,y,r,hl=.55,pad=1.07,side=.05)=>(ox,oy)=>{const X=x+ox,Y=y+oy,R=r*pad,ry=r*1.12*pad;
  G.moveTo(X-R,Y+r*side);G.bezierCurveTo(X-R,Y-ry*1.36,X+R,Y-ry*1.36,X+R,Y+r*side);
  G.quadraticCurveTo(X+r*.86,Y-r*.32,X+r*.45,Y-r*hl);G.quadraticCurveTo(X,Y-r*(hl+.14),X-r*.45,Y-r*hl);G.quadraticCurveTo(X-r*.86,Y-r*.32,X-R,Y+r*side);G.closePath()};

/* ---------- faces ---------- */
function hairBack(p,x,y,r){const h=p.hairCol;
  if(p.hair==='bun')cel(pE(x,y-r*1.16,r*.48,r*.4),h,{sx:r*.12,sy:r*.1,lw:r*.12});
  if(p.hair==='afro')cel(pE(x,y-r*.42,r*1.52,r*1.38),h,{sx:r*.3,sy:r*.22,lw:r*.13,rw:r*.1});
  if(p.hair==='locs'){for(let i=-2;i<=2;i++)cel(pL(x+i*r*.26,y-r*.4,x+i*r*.38,y+r*1.5,r*.26,r*.22),shade(h,i%2?.08:0),{sx:r*.06,sy:0,lw:r*.09})}}
function hairTop(p,x,y,r,t){const h=p.hairCol,lw=Math.max(1.2,r*.12),hs=p.hair,X=x+t*r*.12;
  const capO={sx:r*.18,sy:r*.1,rw:r*.08,lw};
  if(hs==='curly'){G.save();G.beginPath();G.rect(x-r*3,y-r*3,r*6,r*2.62);G.clip();cel(pBumpy(X,y-r*.42,r*1.08,r*.86,14,.12,Math.PI),h,capO);G.restore();cel(pCap(X,y,r,.5,1.02),h,{...capO,lw:0,rim:false});
    G.globalAlpha=.6;for(let i=0;i<7;i++)ARC(X-r*.6+i*r*.2,y-r*.85+(i%2)*r*.18,r*.09,3.4,5.8,Math.max(.6,r*.05),shade(h,.45));G.globalAlpha=1}
  else if(hs==='afro'){cel(pCap(X,y,r,.48,1.05),h,capO)}
  else if(hs==='fade'){G.globalAlpha=.55;cel(pCap(X,y,r,.42,1.04,.2),h,{sx:0,sy:0,rim:false,lw:0});G.globalAlpha=1;cel(pCap(X,y-r*.12,r*.98,.5,1.05,-.25),h,capO)}
  else if(hs==='cornrows'){cel(pCap(X,y,r,.52,1.04),h,capO);G.save();G.beginPath();pCap(X,y,r,.52,1.04)(0,0);G.clip();for(let i=-3;i<=3;i++)LN(X+i*r*.24,y-r*.6,X+i*r*.32,y-r*1.4,Math.max(.6,r*.06),shade(h,.4));G.restore()}
  else if(hs==='mohawk'){G.globalAlpha=.35;cel(pCap(X,y,r,.5,1.02),h,{sx:0,sy:0,rim:false,lw:0});G.globalAlpha=1;
    cel(pP([X-r*.24,y-r*.55,X-r*.36,y-r*1.15,X-r*.1,y-r*1.75,X,y-r*1.32,X+r*.12,y-r*1.82,X+r*.36,y-r*1.15,X+r*.24,y-r*.55]),h,{sx:r*.1,sy:r*.06,lw})}
  else if(hs==='buzz'){G.globalAlpha=.85;cel(pCap(X,y,r,.5,1.02),h,{sx:r*.14,sy:r*.08,rw:r*.06,lw:lw*.7});G.globalAlpha=1}
  else if(hs==='bald'){E(X-r*.32,y-r*.8,r*.26,r*.11,'rgba(255,255,255,.45)')}
  else if(hs==='shaved'){G.globalAlpha=.32;cel(pCap(X,y,r,.5,1.01),h,{sx:0,sy:0,rim:false,lw:0});G.globalAlpha=1;E(X-r*.3,y-r*.82,r*.22,r*.09,'rgba(255,255,255,.4)')}
  else if(hs==='bun'||hs==='locs'){cel(pCap(X,y,r,.5,1.06),h,capO);G.globalAlpha=.5;ARC(X+r*.05,y-r*.3,r*.8,-2.7,-.6,Math.max(.6,r*.07),shade(h,.45));G.globalAlpha=1}
  else if(hs==='spiky'){for(let i=0;i<7;i++){const a=-2.95+i*.42,bx_=X+Math.cos(a)*r*.9,by=y-r*.1+Math.sin(a)*r;cel(pP([bx_-r*.24,by+r*.16,bx_+Math.cos(a)*r*.62,by+Math.sin(a)*r*.62,bx_+r*.24,by+r*.16]),h,{sx:r*.06,sy:r*.05,lw:lw*.9})}cel(pCap(X,y,r,.48,1.04),h,capO)}
  else if(hs==='slick'){cel(pCap(X,y,r,.5,1.06),h,capO);G.globalAlpha=.6;ARC(X+r*.15,y-r*.2,r*.82,-2.8,-1,Math.max(.8,r*.1),shade(h,.5));G.globalAlpha=1;if(p.streak)ARC(X-r*.12,y-r*.15,r*.9,-2.45,-1.55,Math.max(1,r*.16),p.streak)}
  if(p.bandana){G.save();G.beginPath();pHead(x,y,r*1.06)(0,0);G.clip();RC(x-r*1.3,y-r*.68,r*2.6,r*.3,p.bandana);G.restore();LN(x-r*1.06,y-r*.68,x+r*1.06,y-r*.68,lw*.6,INK);LN(x-r*1.06,y-r*.38,x+r*1.06,y-r*.38,lw*.6,INK);cel(pP([x+r*.95,y-r*.6,x+r*1.55,y-r*.32,x+r*1.3,y-r*.12]),p.bandana,{sx:r*.05,sy:r*.05,lw:lw*.8})}
  if(p.flower){for(let i=0;i<5;i++){const a=i*TAU/5;cel(pE(X+r*.72+Math.cos(a)*r*.18,y-r*.86+Math.sin(a)*r*.18,r*.16,r*.16),p.flower,{sx:r*.04,sy:r*.04,lw:lw*.6})}E(X+r*.72,y-r*.86,r*.09,r*.09,'#f2c14e')}}
function drawFace(p,x,y,r,ex='neutral',o={}){
  const t=o.turn||0,sk=p.skin,skD=shade(sk,-.3),skL=shade(sk,.25),fx=x+t*r*.34,lw=Math.max(1.2,r*.13),h=p.hairCol,jw=p.jaw||.78,ch=p.chin||.42;
  hairBack(p,x,y,r);
  for(const s of[-1,1])cel(pE(x+s*r*.98+t*r*.25,y+r*.06,r*.17,r*.27),sk,{sx:r*.05,sy:r*.04,rw:r*.04,lw:lw*.8});
  if(p.earrings)for(const s of[-1,1])EO(x+s*r*.99+t*r*.25,y+r*.42,r*.1,r*.12,'#f2c14e',.6);
  cel(pHead(x,y,r,jw,ch),sk,{sx:r*.24-t*r*.1,sy:r*.12,rw:r*.09,lw,inner(){
    if(p.stubble||p.facial==='stubble'){G.globalAlpha=.38;E(fx,y+r*.78,r*.86,r*.48,p.stubble||shade(h,.1));G.globalAlpha=1}
    if(p.old){G.globalAlpha=.5;ARC(fx-r*.62,y+r*.3,r*.3,1.2,2.4,r*.05,skD);ARC(fx+r*.62,y+r*.3,r*.3,.7,1.9,r*.05,skD);G.globalAlpha=1}
    G.globalAlpha=.55;ARC(fx-r*.42,y+r*.2,r*.32,2.2,2.9,r*.05,skD);ARC(fx+r*.42,y+r*.2,r*.32,.24,.94,r*.05,skD);G.globalAlpha=1}});
  hairTop(p,x,y,r,t);
  /* eyes */
  const ey=y-r*.03,ew=r*.36;
  const eye=(sx)=>{const xx=fx+sx*ew,w=r*.2,hg=ex==='shock'?r*.15:ex==='smug'?r*.06:ex==='angry'||ex==='guard'?r*.08:r*.1;
    if(ex==='calm'){ARC(xx,ey-r*.06,r*.17,.35,2.8,lw*.7,INK);return}
    if(ex==='hurt'||ex==='daze'){LN(xx-r*.17,ey-r*.1*sx,xx+r*.15,ey,lw*.7,INK);LN(xx-r*.17,ey+r*.1*sx,xx+r*.15,ey,lw*.7,INK);return}
    G.beginPath();G.moveTo(xx-w,ey);G.quadraticCurveTo(xx,ey-hg*2.1,xx+w,ey);G.quadraticCurveTo(xx,ey+hg*1.5,xx-w,ey);G.closePath();G.fillStyle='#fffaf0';G.fill();
    G.save();G.clip();E(xx+(o.look||0)*r*.05+sx*r*.01,ey+r*.01,r*.095,r*.11,p.eye||'#2a1a10');E(xx+(o.look||0)*r*.05,ey+r*.01,r*.045,r*.055,'#000');E(xx-r*.03,ey-r*.04,r*.03,r*.03,'#fff');G.restore();
    G.beginPath();G.moveTo(xx-w*1.12,ey+r*.01);G.quadraticCurveTo(xx,ey-hg*2.25,xx+w*1.1,ey-r*.02);G.lineWidth=lw*.75;G.strokeStyle=INK;G.lineCap='round';G.stroke()};
  eye(-1);eye(1);
  /* brows: thick wedges */
  const bc=p.hair==='bald'||p.hair==='shaved'?shade(sk,-.55):shade(h,-.25),by=y-r*.3;
  for(const sx of[-1,1]){const xx=fx+sx*ew;let a=0,up=0;if(ex==='angry'||ex==='guard')a=ex==='guard'?.2:.42;else if(ex==='hurt'||ex==='shock'||ex==='daze')a=-.32,up=r*.08;else if(ex==='smug'&&sx>0)up=r*.13;else if(ex==='grin')up=r*.05;
    const ix=xx-sx*r*.2,iy=by-up+a*r*.3,ox_=xx+sx*r*.24,oy_=by-up-a*r*.12-r*.03;PLO([ix,iy-r*.06,ox_,oy_-r*.04,ox_,oy_+r*.02,ix,iy+r*.05],bc,lw*.5)}
  if(p.glasses){G.lineWidth=lw*.55;G.strokeStyle='#c9a64a';for(const s of[-1,1]){G.beginPath();G.ellipse(fx+s*ew,ey,r*.27,r*.21,0,0,TAU);G.stroke()}LN(fx-ew+r*.27,ey,fx+ew-r*.27,ey,lw*.45,'#c9a64a')}
  if(p.scar){LN(fx+r*.16,y-r*.58,fx+r*.44,y+r*.14,lw*.75,INK);LN(fx+r*.16,y-r*.58,fx+r*.44,y+r*.14,lw*.4,'#e89a9a')}
  if(p.freckles){for(const[a,b]of[[-.5,.22],[-.62,.3],[-.4,.32],[.5,.22],[.62,.3],[.4,.32]])E(fx+a*r,y+b*r,r*.035+.25,r*.035+.25,'#b5643a')}
  /* nose */
  PL([fx+r*.02,y+r*.04,fx+r*.14,y+r*.3,fx+r*.01,y+r*.34],skD);ARC(fx+r*.02,y+r*.27,r*.1,.3,2.6,lw*.55,INK);
  /* beard and mustache */
  const fh=p.beard?'beard':p.facial,bcol=p.beard||shade(h,0);
  if(fh==='beard'){cel(pP([fx-r*jw*1.02,y+r*.48,fx-r*.5,y+r*.5,fx,y+r*.42,fx+r*.5,y+r*.5,fx+r*jw*1.02,y+r*.48,fx+r*ch*1.1,y+r*1.2,fx,y+r*1.42,fx-r*ch*1.1,y+r*1.2]),bcol,{sx:r*.14,sy:r*.08,lw:lw*.8})}
  if(fh==='goatee')cel(pP([fx-r*.24,y+r*.82,fx+r*.24,y+r*.82,fx+r*.16,y+r*1.32,fx-r*.16,y+r*1.32]),bcol,{sx:r*.05,sy:r*.05,lw:lw*.7});
  /* mouth */
  const my=y+r*.62,mw=r*.36,lip=p.lips||shade(sk,-.42),mt=lw*.7;
  if(ex==='grin'){G.beginPath();G.moveTo(fx-mw,my-r*.06);G.quadraticCurveTo(fx,my+r*.32,fx+mw,my-r*.06);G.closePath();G.fillStyle=INK;G.fill();RC(fx-mw*.75,my-r*.06,mw*1.5,r*.1,'#fffaf0');if(p.gap)RC(fx-r*.03,my-r*.06,r*.06,r*.1,INK)}
  else if(ex==='smug')LN(fx-mw*.6,my+r*.03,fx+mw*.85,my-r*.1,mt,INK);
  else if(ex==='angry'){RC(fx-mw*.8,my-r*.08,mw*1.6,r*.18,INK);RC(fx-mw*.68,my-r*.05,mw*1.36,r*.1,'#fffaf0');LN(fx-mw*.68,my,fx+mw*.68,my,r*.03,INK)}
  else if(ex==='hurt'||ex==='daze'){E(fx+r*.05,my+r*.03,r*.16,r*.13,INK);E(fx+r*.05,my+r*.08,r*.09,r*.05,'#c8434a')}
  else if(ex==='shock')E(fx,my+r*.03,r*.14,r*.19,INK);
  else if(ex==='calm')ARC(fx,my-r*.22,r*.26,.6,2.5,mt,INK);
  else if(ex==='guard'){G.beginPath();G.moveTo(fx-mw*.85,my-r*.06);G.lineTo(fx+mw*.85,my-r*.06);G.lineTo(fx+mw*.7,my+r*.1);G.lineTo(fx-mw*.7,my+r*.1);G.closePath();G.fillStyle=p.guardCol||'#3ac0e8';G.fill();G.lineWidth=mt*.8;G.strokeStyle=INK;G.stroke()}
  else LN(fx-mw*.55,my,fx+mw*.55,my,mt,INK);
  if(p.lips&&!['grin','hurt','daze','shock','angry'].includes(ex))LN(fx-mw*.45,my+r*.05,fx+mw*.45,my+r*.05,r*.07,p.lips);
  if(p.mustache||fh==='mustache'||fh==='goatee'||fh==='beard'){const mc=p.mustache||bcol;PLO([fx-r*.38,my-r*.1,fx,my-r*.24,fx+r*.38,my-r*.1,fx+r*.3,my-r*.03,fx,my-r*.13,fx-r*.3,my-r*.03],mc,lw*.5)}}

/* ---------- gloves ---------- */
function glove(x,y,r,col,cuffDir=1,front=false){
  cel(pE(x,y,r,r*.95),col,{sx:r*.32,sy:r*.28,rw:r*.14,lw:Math.max(1.4,r*.14),rimCol:shade(col,.55)});
  if(!front)cel(pE(x+r*.66,y-r*.14,r*.3,r*.42,-.3),col,{sx:r*.08,sy:r*.08,rw:r*.05,lw:Math.max(1,r*.1)});
  E(x-r*.34,y-r*.42,r*.22,r*.12,'rgba(255,255,255,.75)');
  const cy=y+r*.68*cuffDir;G.save();G.beginPath();G.ellipse(x,y,r,r*.95,0,0,TAU);G.clip();RC(x-r,cy-(cuffDir>0?0:r*.34),r*2,r*.34,'#f4efe2');G.restore();LN(x-r*.9,cy,x+r*.9,cy,Math.max(1,r*.1),INK)}

/* ---------- portraits (busts) for the story, the cards and the locker room ---------- */
function drawBust(id,x,y,s,ex='neutral',o={}){const p=PEOPLE[id],sk=p.skin,r=13*s,hy=y-r*1.62,lw=Math.max(1.4,r*.12);
  const sh=(w,col)=>cel(pP([x-w,y+r*.25,x-w*.84,y-r*.16,x-r*.5,y-r*.46,x+r*.5,y-r*.46,x+w*.84,y-r*.16,x+w,y+r*.25,x+w,y+r*3,x-w,y+r*3]),col,{sx:r*.3,sy:r*.12,rw:r*.1,lw});
  const neck=()=>cel(pP([x-r*.44,y-r*.9,x+r*.44,y-r*.9,x+r*.5,y-r*.3,x-r*.5,y-r*.3]),sk,{sx:r*.14,sy:0,lw});
  if(p.outfit==='hoodie'){cel(pE(x,y-r*.32,r*1.25,r*.58),shade(p.outCol,-.25),{lw});sh(r*2.3,p.outCol);neck();cel(pP([x-r*.6,y-r*.4,x+r*.6,y-r*.4,x+r*.3,y+r*.1,x-r*.3,y+r*.1]),shade(p.outCol,-.15),{lw:lw*.8});
    LN(x-r*.25,y+r*.1,x-r*.32,y+r*.95,lw*.6,'#efe8d6');LN(x+r*.25,y+r*.1,x+r*.32,y+r*.95,lw*.6,'#efe8d6');cel(pP([x-r*1.2,y+r*1.5,x+r*1.2,y+r*1.5,x+r*1.1,y+r*3,x-r*1.1,y+r*3]),shade(p.outCol,-.1),{lw:lw*.8})}
  else if(p.outfit==='cardigan'){sh(r*2.15,p.outCol);neck();cel(pP([x-r*.62,y-r*.42,x+r*.62,y-r*.42,x,y+r*1.1]),'#efe2c8',{sx:r*.1,lw:lw*.8});
    cel(pP([x+r*.9,y-r*.42,x+r*1.75,y-r*.2,x+r*1.55,y+r*2.6,x+r*.8,y+r*2.6]),'#f4f1ea',{sx:r*.12,lw:lw*.8,inner(){for(let i=0;i<3;i++)LN(x+r*.8,y+r*(.4+i*.5),x+r*1.7,y+r*(.4+i*.5),r*.1,'#c8423a')}})}
  else if(p.outfit==='tux'){sh(r*2.2,p.outCol);neck();cel(pP([x-r*.55,y-r*.42,x+r*.55,y-r*.42,x,y+r*1.6]),'#f4f1ea',{sx:r*.1,lw:lw*.8});cel(pP([x-r*.42,y-r*.2,x,y-r*.02,x-r*.42,y+r*.16]),'#c8263a',{sx:r*.04,lw:lw*.6});cel(pP([x+r*.42,y-r*.2,x,y-r*.02,x+r*.42,y+r*.16]),'#c8263a',{sx:r*.04,lw:lw*.6});
    cel(pE(x+r*1.45,y+r*.4,r*.3,r*.3),'#2a2a30',{lw:lw*.7});RC(x+r*1.34,y+r*.62,r*.22,r*1.4,'#3a3a42')}
  else if(p.outfit==='robe'){sh(r*2.35,p.outCol);neck();cel(pP([x-r*.5,y-r*.44,x+r*.5,y-r*.44,x+r*.16,y+r*1.4,x-r*.16,y+r*1.4]),sk,{sx:r*.1,lw:lw*.8});
    LNO(x-r*.52,y-r*.44,x-r*.12,y+r*1.5,r*.22,p.trim);LNO(x+r*.52,y-r*.44,x+r*.12,y+r*1.5,r*.22,p.trim);if(p.chain)ARC(x,y-r*.5,r*.5,.5,2.64,r*.09,'#f2c14e')}
  else{const b=p.build,w=r*2.15*b.w/27;sh(w,sk);neck();
    cel(pE(x-w*.42,y+r*.62,w*.36,r*.36),sk,{sx:r*.1,sy:r*.08,lw:lw*.8});cel(pE(x+w*.42,y+r*.62,w*.36,r*.36),sk,{sx:r*.1,sy:r*.08,lw:lw*.8});
    if(p.top)cel(pP([x-w*.78,y+r*.42,x+w*.78,y+r*.42,x+w*.72,y+r*1.25,x-w*.72,y+r*1.25]),p.top,{sx:r*.1,sy:r*.06,lw:lw*.8});
    if(p.chain)ARC(x,y-r*.5,r*.55,.5,2.64,r*.09,'#f2c14e');if(p.tattoo)for(let i=0;i<3;i++)ARC(x-w*.72+i*r*.25,y+r*.3,r*.22,3.3,6,r*.07,'#1c2a40');
    glove(x-w*.6,y+r*1.8,r*1.02,p.gloves,1);glove(x+w*.6,y+r*1.8,r*1.02,p.gloves,1)}
  drawFace(p,x,hy,r,ex,o)}

/* ---------- the opponent, facing you ----------
   pose: {x,y (body offset), lean, head:{x,y,turn,ex}, gl, gr (screen-left / screen-right glove: {x,y,z}), fall (0..1 lying down)}
   Positions are relative to the waist. A glove with z>1.15 is coming at you and is drawn later, over the player. */
const OSC=1.3;/* fighters are drawn this much bigger than their build numbers */
function drawOpp(id,pose,cx,wy){const p=PEOPLE[id],b=p.build,S=b.s*OSC,sk=p.skin;
  G.save();G.translate(cx+pose.x,wy+pose.y);if(pose.fall){G.scale(1,1-pose.fall*.68);G.rotate(-pose.fall*.08)}G.rotate(pose.lean||0);G.scale(S,S);
  const W=b.w*1.06,H=b.h,sx=W,sy=-H,o1={sx:3,sy:2,rw:1.1,lw:1.7};
  /* legs and trunks */
  for(const s of[-1,1])cel(pL(s*W*.36,14,s*W*.44,48,W*.46,W*.36),sk,o1);
  cel(pP([-W*.76,-3,W*.76,-3,W*.84,23,W*.08,25,0,19,-W*.08,25,-W*.84,23]),p.trunks,{sx:3,sy:1.5,lw:1.7,inner(){RC(-W,-4,W*2,4.5,p.trim);RC(-W*.84,8,3.2,15,p.trim);RC(W*.84-3.2,8,3.2,15,p.trim)}});
  if(p.rope){LNO(-W*.72,1,W*.72,1,1.6,'#d8c49a');LNO(W*.2,1,W*.3,14,1.2,'#d8c49a')}
  /* torso: wide lats, narrow waist, traps rising to the neck */
  const torso=pP([-sx*.98,sy+5,-sx*.82,sy+.5,-W*.32,sy-4,W*.32,sy-4,sx*.82,sy+.5,sx*.98,sy+5,sx*1.0,sy+H*.34,W*.66,-2,-W*.66,-2,-sx*1.0,sy+H*.34]);
  cel(torso,sk,{sx:4,sy:1.5,rw:1.3,lw:1.8,inner(){const sd=shade(sk,-.26);
    if(b.belly){cel(pE(0,-H*.27,W*.62,H*.31),shade(sk,.06),{sx:3,sy:3,lw:1.2})}
    else{for(let i=0;i<3;i++){LN(-W*.16,sy+H*(.54+i*.13),-W*.04,sy+H*(.54+i*.13),1.1,sd);LN(W*.04,sy+H*(.54+i*.13),W*.16,sy+H*(.54+i*.13),1.1,sd)}LN(0,sy+H*.48,0,-5,1,sd);ARC(-W*.62,sy+H*.62,W*.3,-.5,.6,1,sd);ARC(W*.62,sy+H*.62,W*.3,2.5,3.6,1,sd)}
    ARC(-W*.34,sy+H*.2,W*.36,.35,2.6,1.4,INK);ARC(W*.34,sy+H*.2,W*.36,.54,2.8,1.4,INK);
    if(p.hairy){G.globalAlpha=.45;for(let i=0;i<16;i++)E(((i*37)%17-8)*W*.06,sy+H*(.22+((i*13)%9)*.06),.6,.6,shade(sk,-.55));G.globalAlpha=1}
    if(p.tattoo)for(let i=0;i<3;i++)ARC(-sx*.82+i*3.2,sy+10,3.2,3.3,6,1.1,'#1c2a40')}});
  if(p.top)cel(pP([-W*.74,sy+H*.12,W*.74,sy+H*.12,W*.72,sy+H*.5,-W*.72,sy+H*.5]),p.top,{sx:3,sy:1.5,lw:1.6});
  if(p.chain)ARC(0,sy-5,W*.4,.4,2.74,1.4,'#f2c14e');
  /* arms: deltoid, upper arm hanging by the ribs, a big forearm up to the glove */
  const arm=(side,g)=>{const shx=side*sx*.9,shy=sy+5,gx=g.x,gy=g.y,d=clamp(Math.hypot(gx-side*W*.5,gy-(-H+9))/(W*.75),0,1);
    const ex=lerp(side*W*.95,(shx+gx)/2+side*W*.2,d),ey=lerp(-H*.32,(shy+gy)/2+5,d),wx=gx+(ex-gx)*.15,wy=gy+(ey-gy)*.15+b.gl*.3;
    cel(pL(shx,shy,ex,ey,b.arm*1.5,b.arm*1.2),sk,{sx:side>0?2.6:1,sy:1,rw:1,lw:1.6});cel(pL(ex,ey,wx,wy,b.arm*1.3,b.arm*1.05),sk,{sx:side>0?2.4:1,sy:1,rw:1,lw:1.6});
    cel(pE(shx-side*1,shy+1,W*.27,W*.23),sk,{sx:2.2,sy:1.6,rw:1.1,lw:1.6})};
  arm(-1,pose.gl);arm(1,pose.gr);
  /* neck and head */
  const hx=pose.head.x,hy=pose.head.y;cel(pP([-W*.24+hx*.3,sy-11,W*.24+hx*.3,sy-11,W*.3,sy+1,-W*.3,sy+1]),sk,{sx:2,sy:0,lw:1.5});
  drawFace(p,hx,hy,b.r,pose.head.ex||'guard',{turn:pose.head.turn||0,look:pose.head.look||0});
  const later=[];for(const k of['gl','gr']){const g=pose[k];if(g.z>1.15){later.push(g);continue}glove(g.x,g.y,b.gl*1.15*g.z,p.gloves,1)}
  G.restore();
  return later.map(g=>({x:cx+(pose.x+g.x*S),y:wy+(pose.y+g.y*S),r:b.gl*1.15*g.z*S,col:p.gloves}))}

/* ---------- you, from behind and above ----------
   pose: {x,y,rot,s, gl, gr: {x,y,r} gloves relative to the neck base, hurt (0..1)}.
   Your arms are out in front of you, so your body hides most of them: you see the gloves beside your head and a
   bit of forearm rising past your shoulders. They are drawn first, behind your back and head. */
function drawPlayer(pose,cx,ny){const p=PEOPLE.milo,sk=p.skin,skD=shade(sk,-.28),h=p.hairCol;
  G.save();G.translate(cx+pose.x,ny+pose.y);G.rotate(pose.rot||0);const s=pose.s||1;G.scale(s,s);
  for(const[k,side]of[['gl',-1],['gr',1]]){const g=pose[k],ext=clamp((13-g.r)/4.5,0,1),wx=g.x+side*g.r*.12,wy=g.y+g.r*.72;
    cel(pL(side*33,2,wx,wy,lerp(17,13,ext),Math.max(8,lerp(14,9,ext))),sk,{sx:side>0?2.6:-1,sy:1,rw:1.1,lw:1.8});
    glove(g.x,g.y,g.r*1.08,p.gloves,1,!!g.front)}
  /* the back: traps up to the neck, wide lats, the spine */
  const back=(ox,oy)=>{const q=(a,b,c,d)=>G.quadraticCurveTo(a+ox,b+oy,c+ox,d+oy);G.moveTo(-15+ox,-14+oy);q(-30,-12,-40,-4);q(-51,1,-48,15);q(-47,30,-44,40);G.lineTo(-38+ox,96+oy);G.lineTo(38+ox,96+oy);G.lineTo(44+ox,40+oy);q(47,30,48,15);q(51,1,40,-4);q(30,-12,15,-14);G.closePath()};
  cel(back,sk,{sx:5,sy:2,rw:1.4,lw:2,inner(){
    if(p.tattoo&&p.tattoo!=='none')drawTattoo(p.tattoo,0,30);
    G.globalAlpha=.85;ARC(-17,17,13,-.3,1.6,1.4,skD);ARC(17,17,13,1.54,3.44,1.4,skD);LN(0,-4,0,92,1.6,skD);ARC(-30,48,16,-1.1,.2,1.3,skD);ARC(30,48,16,2.94,4.24,1.3,skD);
    ARC(-36,8,12,-.2,2.2,1.3,skD);ARC(36,8,12,.94,3.34,1.3,skD);G.globalAlpha=1}});
  cel(pP([-41,66,41,66,42,96,-42,96]),p.trunks,{sx:3,sy:1,lw:1.8,inner(){RC(-44,66,88,6,p.trim);if(p.nick)G.save(),G.font='700 5px '+FONT_D,G.textAlign='center',G.fillStyle=INK,G.fillText(p.nick.replace(/^THE /,''),0,71.5),G.restore()}});
  /* neck and the back of the head */
  cel(pP([-10,-22,10,-22,12,-8,-12,-8]),sk,{sx:2,sy:0,lw:1.6});
  for(const sd of[-1,1])cel(pE(sd*17,-31,3.2,5.2),sk,{sx:.8,sy:.6,lw:1.3});
  cel(pE(0,-33,17.5,18.5),sk,{sx:3,sy:2,rw:1.2,lw:1.9});
  drawHairBack(p.hair,h,0,-33);
  G.restore()}
/* the back of Milo's head, for each hairstyle */
function drawHairBack(hs,h,x,y){const o={sx:2.6,sy:2,rw:1.1,lw:1.6};
  if(hs==='bald'){E(x-6,y-10,6,3,'rgba(255,255,255,.4)');return}
  if(hs==='afro'){cel(pE(x,y-6,25,23),h,{sx:4,sy:3,rw:1.6,lw:1.9});for(let i=0;i<10;i++)ARC(x-16+((i*7)%30),y-18+((i*11)%22),2.4,3.2,5.6,.9,shade(h,.4));return}
  const cap=(pad,low)=>pE(x,y-2-low,17.5*pad,18.5*pad-low);
  if(hs==='buzz'){G.globalAlpha=.85;cel(cap(1.02,2),h,o);G.globalAlpha=1;return}
  if(hs==='fade'){G.globalAlpha=.45;cel(cap(1.02,0),h,{...o,sx:0,sy:0,lw:0,rim:false});G.globalAlpha=1;cel(cap(1.04,5),h,o);return}
  cel(cap(1.05,1),h,o);
  if(hs==='curly'){cel(pBumpy(x,y-3,18.5,19,16,.1),h,{sx:3,sy:2.4,rw:1.2,lw:1.7,inner(){G.globalAlpha=.55;for(let i=0;i<14;i++){const a=i*2.4,rr_=4+((i*7)%12);ARC(x+Math.cos(a)*rr_,y-4+Math.sin(a)*rr_,2.3,3.3,5.9,.9,shade(h,.5))}G.globalAlpha=1}})}
  else if(hs==='cornrows'){G.save();G.beginPath();cap(1.05,1)(0,0);G.clip();for(let i=-3;i<=3;i++)LN(x+i*4.6,y-22,x+i*5.2,y+16,1.3,shade(h,.4));G.restore()}
  else if(hs==='mohawk'){G.globalAlpha=.5;cel(cap(1.02,0),shade(h,.1),{...o,sx:0,sy:0,lw:0,rim:false});G.globalAlpha=1;cel(pP([x-4,y-24,x+4,y-24,x+5,y+14,x-5,y+14]),h,{sx:1.2,sy:0,lw:1.3});for(let i=0;i<5;i++)cel(pP([x-4,y-20+i*7,x,y-27+i*7,x+4,y-20+i*7]),h,{sx:.6,sy:0,lw:1})}
  else if(hs==='locs'){for(let i=-3;i<=3;i++)cel(pL(x+i*4.6,y-4,x+i*5.6,y+30,4.6,3.8),shade(h,i%2?.1:0),{sx:1,sy:0,lw:1.1});cel(pE(x,y+6,6,3),'#c8962e',{lw:1})}
  else if(hs==='bun'){cel(pE(x,y-14,7,6),h,o)}
  else{G.globalAlpha=.5;for(let i=0;i<6;i++)ARC(x-10+i*4,y-10+(i%2)*4,2,3.4,5.8,.9,shade(h,.4));G.globalAlpha=1}}
/* back tattoos (drawn inside the back's clip) */
function drawTattoo(k,x,y){const c='#1a1424',w=1.4;G.save();G.globalAlpha=.8;G.strokeStyle=c;G.fillStyle=c;G.lineWidth=w;G.lineCap='round';G.lineJoin='round';
  if(k==='anchor'){LN(x,y-14,x,y+14,w*1.6,c);ARC(x,y-17,3.2,0,TAU,w,c);LN(x-8,y-8,x+8,y-8,w*1.4,c);ARC(x,y+2,13,.35,2.8,w*1.6,c);PL([x-13,y+5,x-15,y+1,x-10,y+2],c);PL([x+13,y+5,x+15,y+1,x+10,y+2],c)}
  else if(k==='bell'){G.beginPath();G.moveTo(x-11,y+10);G.quadraticCurveTo(x-10,y-12,x,y-13);G.quadraticCurveTo(x+10,y-12,x+11,y+10);G.closePath();G.stroke();LN(x-13,y+10,x+13,y+10,w*1.4,c);E(x,y+13,2.4,2.4,c);LN(x,y-13,x,y-17,w,c)}
  else if(k==='wings'){for(const s of[-1,1])for(let i=0;i<5;i++){G.beginPath();G.moveTo(x+s*4,y-6+i*2);G.quadraticCurveTo(x+s*(16+i*3),y-16+i*5,x+s*(30-i*2),y-12+i*7);G.stroke()}}
  else if(k==='tiger'){for(const s of[-1,1])for(let i=0;i<5;i++)PL([x+s*42,y-26+i*13,x+s*(22-i*2),y-22+i*13,x+s*40,y-20+i*13],c)}
  else if(k==='stars'){for(let i=0;i<5;i++){const sx=x-18+i*9,sy=y-10+(i%2)*10;G.beginPath();for(let j=0;j<10;j++){const a=-Math.PI/2+j*Math.PI/5,rr_=j%2?1.8:4.2;j?G.lineTo(sx+Math.cos(a)*rr_,sy+Math.sin(a)*rr_):G.moveTo(sx+Math.cos(a)*rr_,sy+Math.sin(a)*rr_)}G.closePath();G.fill()}}
  else if(k==='crown'){PL([x-14,y+6,x-14,y-6,x-7,y,x,y-10,x+7,y,x+14,y-6,x+14,y+6],c);G.globalAlpha=.9;E(x,y-12,2,2,'#e5bd4f')}
  else if(k==='EMBER'){G.font='700 12px '+FONT_D;G.textAlign='center';G.fillText('EMBER',x,y+4);LN(x-20,y+8,x+20,y+8,w,c)}
  G.restore()}
