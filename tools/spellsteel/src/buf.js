/* ================= pixel buffers: everything is drawn in code, pixel by pixel ================= */
const INK='#160f24';
const hx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const toHex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mix=(a,b,t)=>{const A=hx(a),B=hx(b);return toHex(A.map((v,i)=>v+(B[i]-v)*t))};
/* a colour ramp: below zero toward a cool shadow, above zero toward a warm light */
const _sh={};
const shade=(c,k)=>{if(!c)return c;const key=c+k;if(_sh[key])return _sh[key];
  return _sh[key]=k<0?mix(c,'#1c1036',Math.min(.82,-k*.24)):mix(c,'#fff8e8',Math.min(.85,k*.22))};
const dk=c=>shade(c,-1),lt=c=>shade(c,1);
class Buf{
  constructor(w,h){this.w=w;this.h=h;this.d=new Array(w*h).fill(null)}
  px(x,y,c){x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=this.w||y>=this.h)return;this.d[y*this.w+x]=c}
  get(x,y){x=Math.floor(x);y=Math.floor(y);return x<0||y<0||x>=this.w||y>=this.h?null:this.d[y*this.w+x]}
  has(x,y){return this.get(x,y)!==null}
  rect(x,y,w,h,c,clip){for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(!clip||this.has(x+i,y+j))this.px(x+i,y+j,c)}
  /* ellipse; sh shades it lit from the upper left (dark rim low right, light patch high left, a highlight) */
  ell(cx,cy,rx,ry,c,sh=1,clip=false){
    for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){
      const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry,d=nx*nx+ny*ny;if(d>1||(clip&&!this.has(x,y)))continue;let col=c;
      if(sh&&c){const l=-(nx*.6+ny*.8);if(l<-.42&&d>.32)col=shade(c,-1);else if(l>.48&&d>.08&&d<.62)col=shade(c,1);if(sh>1&&l>.7&&d>.12&&d<.4)col=shade(c,2)}
      this.px(x,y,col)}}
  poly(pts,c,clip=false){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const[x,y]of pts){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
    for(let y=Math.floor(y0);y<=Math.ceil(y1);y++)for(let x=Math.floor(x0);x<=Math.ceil(x1);x++){const px=x+.5,py=y+.5;let ins=false;
      for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>py)!==(yj>py)&&px<(xj-xi)*(py-yi)/(yj-yi)+xi)ins=!ins}
      if(ins&&(!clip||this.has(x,y)))this.px(x,y,c)}}
  tri(ax,ay,bx,by,cx,cy,c,clip){this.poly([[ax,ay],[bx,by],[cx,cy]],c,clip)}
  line(x0,y0,x1,y1,c,t=1,clip=false){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)*2));
    for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;if(t<=1){if(!clip||this.has(x,y))this.px(x,y,c)}
      else{const o=Math.floor(t/2);for(let a=0;a<t;a++)for(let b=0;b<t;b++){const X=x-o+a,Y=y-o+b;if(!clip||this.has(X,Y))this.px(X,Y,c)}}}}
  pl(pts,c,t=1,clip){for(let i=0;i<pts.length-1;i++)this.line(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],c,t,clip)}
  /* a rounded limb from one point to another */
  limb(x0,y0,x1,y1,w0,c,w1=w0){const n=Math.ceil(Math.hypot(x1-x0,y1-y0)*2)+1;for(let i=0;i<=n;i++){const t=i/n,r=Math.max(.5,(w0*(1-t)+w1*t)/2);this.ell(x0+(x1-x0)*t,y0+(y1-y0)*t,r,r,c,0)}}
  /* a tapered curve (quadratic) */
  horn(x0,y0,cx,cy,x1,y1,w0,c,w1=.8){const n=Math.ceil((Math.hypot(cx-x0,cy-y0)+Math.hypot(x1-cx,y1-cy))*2);for(let i=0;i<=n;i++){const t=i/n,u=1-t,x=u*u*x0+2*u*t*cx+t*t*x1,y=u*u*y0+2*u*t*cy+t*t*y1,r=Math.max(.5,(w0*(1-t)+w1*t)/2);this.ell(x,y,r,r,c,0)}}
  quill(x0,y0,x1,y1,w,c){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*w/2,ny=dx/L*w/2;this.poly([[x0+nx,y0+ny],[x1,y1],[x0-nx,y0-ny]],c)}
  leaf(x0,y0,x1,y1,w,c,clip=false){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,A=[],B=[],n=12;for(let i=0;i<=n;i++){const t=i/n,h=Math.sin(Math.PI*Math.pow(t,.8))*w/2,x=x0+dx*t,y=y0+dy*t;A.push([x+nx*h,y+ny*h]);B.unshift([x-nx*h,y-ny*h])}this.poly(A.concat(B),c,clip)}
  plus(x,y,c){this.px(x,y,c);this.px(x-1,y,c);this.px(x+1,y,c);this.px(x,y-1,c);this.px(x,y+1,c)}
  star(cx,cy,r,c,n=5,inner=.45,rot=-Math.PI/2){const p=[];for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,rr=i%2?r*inner:r;p.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr])}this.poly(p,c)}
  eye(x,y,r=2,col='#ffffff'){this.ell(x,y,r,r*1.2,col,0);const pr=Math.max(.9,r*.55);this.ell(x+r*.3,y+r*.2,pr,pr*1.3,INK,0);this.px(x+r*.3-pr*.4,y-r*.25,'#ffffff')}
  angry(x,y,inner=1,col='#ffe27a'){const X=i=>inner>0?x+i:x+3-i;this.px(X(0),y,col);this.px(X(1),y,col);for(let i=0;i<4;i++)this.px(X(i),y+1,col);this.px(X(2),y+1,INK);for(const[i,j]of[[-1,-1],[0,-1],[1,-1],[2,0],[3,0],[4,1]])this.px(X(i),y+j,INK)}
  fangs(x0,x1,y,dir=1,c='#f4f1ea'){for(let x=x0;x<=x1;x+=2){this.px(x,y,c);this.px(x+1,y,c);this.px(x,y+dir,c)}}
  zap(x,y,s,c,flip=false){const P=[[3,0],[0,5.5],[2.6,5.5],[1,10],[6,3.6],[3.4,3.6],[5.2,0]];this.poly(P.map(([a,b2])=>[x+(flip?6-a:a)*s,y+b2*s]),c)}
  crystal(x,y,h,w,c,cl,cd){this.poly([[x-w/2,y],[x-w/2,y-h*.7],[x,y-h],[x+w/2,y-h*.7],[x+w/2,y]],c);this.line(x-w/2+1,y-1,x-w/2+1,y-h*.7,cl,1,true);this.line(x,y-h+1,x-w/2+1,y-h*.7,cl,1,true);this.line(x+w/2-1,y-1,x+w/2-1,y-h*.65,cd,1,true)}
  /* recolour what is already there (clip), e.g. a shadow side */
  tint(fn){for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){const v=this.d[y*this.w+x];if(v!==null){const r=fn(x,y,v);if(r!==undefined)this.d[y*this.w+x]=r}}}
  outline(c=INK){const o=this.d.slice(),w=this.w;for(let y=0;y<this.h;y++)for(let x=0;x<w;x++){if(o[y*w+x]!==null)continue;
    if((x>0&&o[y*w+x-1]!==null)||(x<w-1&&o[y*w+x+1]!==null)||(y>0&&o[(y-1)*w+x]!==null)||(y<this.h-1&&o[(y+1)*w+x]!==null))this.d[y*w+x]=c}return this}
  /* outline drawn in each neighbour's own dark shade: the soft 32-bit edge */
  softline(){const o=this.d.slice(),w=this.w;for(let y=0;y<this.h;y++)for(let x=0;x<w;x++){if(o[y*w+x]!==null)continue;let n=null;
    for(const[dx,dy]of[[0,1],[-1,0],[1,0],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<this.h&&o[Y*w+X]!==null){n=o[Y*w+X];break}}
    if(n)this.d[y*w+x]=mix(n,INK,.72)}return this}
  rim(c,cols,dirs=[[0,-1],[-1,0]]){const o=this.d.slice(),w=this.w,set=cols?new Set(cols):null;for(let y=0;y<this.h;y++)for(let x=0;x<w;x++){const v=o[y*w+x];if(v===null||(set&&!set.has(v)))continue;for(const[dx,dy]of dirs){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=this.h||o[Y*w+X]===null){this.d[y*w+x]=c;break}}}return this}
  over(b,dx=0,dy=0){for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++){const v=b.d[y*b.w+x];if(v!==null)this.px(x+dx,y+dy,v)}return this}
  /* paste another buffer turned by an angle about its point (gx,gy), landing that point at (tx,ty) */
  blitRot(b,gx,gy,ang,tx,ty,flip=false){const ca=Math.cos(ang),sa=Math.sin(ang),R=Math.ceil(Math.hypot(b.w,b.h));
    for(let y=Math.floor(ty-R);y<=ty+R;y++)for(let x=Math.floor(tx-R);x<=tx+R;x++){const rx=x+.5-tx,ry=y+.5-ty;let sx=rx*ca+ry*sa,sy=-rx*sa+ry*ca;if(flip)sx=-sx;
      const u=Math.floor(sx+gx),v=Math.floor(sy+gy);if(u<0||v<0||u>=b.w||v>=b.h)continue;const c=b.d[v*b.w+u];if(c!==null)this.px(x,y,c)}return this}
  canvas(scale=1,flip=false,sil=null){const c=document.createElement('canvas');c.width=this.w*scale;c.height=this.h*scale;const x=c.getContext('2d');
    for(let y=0;y<this.h;y++)for(let i=0;i<this.w;i++){const v=this.d[y*this.w+i];if(v===null)continue;x.fillStyle=sil||v;x.fillRect((flip?this.w-1-i:i)*scale,y*scale,scale,scale)}return c}
}
/* a tiny 3x5 font for words engraved on weapons and written on covers */
const MINI=(()=>{const G={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',
  '0':'111101101101111','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001','5':'111100110001110','6':'011100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001110',
  '!':'010010010000010','?':'110001010000010','.':'000000000000010',',':'000000000010100','-':'000000111000000',"'":'010010000000000',':':'000010000010000','&':'010101010101011','+':'000010111010000','*':'101010101000000','#':'101111101111101','/':'001001010100100','<':'001010100010001','>':'100010001010100','~':'000011110000000','♥':'000101111111010','★':'010111010101000',' ':'000000000000000'};
  return G})();
function miniText(b,str,x,y,c,vertical=false){let cx=x,cy=y;for(const ch0 of String(str).toUpperCase()){const g=MINI[ch0]||MINI['?'];
    for(let r=0;r<5;r++)for(let k=0;k<3;k++)if(g[r*3+k]==='1'){if(vertical)b.px(cx+k,cy+r,c);else b.px(cx+k,cy+r,c)}
    if(vertical)cy+=6;else cx+=4}}
const miniW=s=>String(s).length*4-1;
