/* ================= a pixel font (5x7), so the words stay crisp everywhere ================= */
const FD={A:'01110 10001 10001 11111 10001 10001 10001',B:'11110 10001 10001 11110 10001 10001 11110',C:'01110 10001 10000 10000 10000 10001 01110',D:'11110 10001 10001 10001 10001 10001 11110',
 E:'11111 10000 10000 11110 10000 10000 11111',F:'11111 10000 10000 11110 10000 10000 10000',G:'01110 10001 10000 10111 10001 10001 01111',H:'10001 10001 10001 11111 10001 10001 10001',
 I:'01110 00100 00100 00100 00100 00100 01110',J:'00111 00010 00010 00010 00010 10010 01100',K:'10001 10010 10100 11000 10100 10010 10001',L:'10000 10000 10000 10000 10000 10000 11111',
 M:'10001 11011 10101 10101 10001 10001 10001',N:'10001 10001 11001 10101 10011 10001 10001',O:'01110 10001 10001 10001 10001 10001 01110',P:'11110 10001 10001 11110 10000 10000 10000',
 Q:'01110 10001 10001 10001 10101 10010 01101',R:'11110 10001 10001 11110 10100 10010 10001',S:'01111 10000 10000 01110 00001 00001 11110',T:'11111 00100 00100 00100 00100 00100 00100',
 U:'10001 10001 10001 10001 10001 10001 01110',V:'10001 10001 10001 10001 10001 01010 00100',W:'10001 10001 10001 10101 10101 10101 01010',X:'10001 10001 01010 00100 01010 10001 10001',
 Y:'10001 10001 01010 00100 00100 00100 00100',Z:'11111 00001 00010 00100 01000 10000 11111',
 0:'01110 10001 10011 10101 11001 10001 01110',1:'00100 01100 00100 00100 00100 00100 01110',2:'01110 10001 00001 00010 00100 01000 11111',3:'11110 00001 00001 01110 00001 00001 11110',
 4:'00010 00110 01010 10010 11111 00010 00010',5:'11111 10000 11110 00001 00001 10001 01110',6:'00110 01000 10000 11110 10001 10001 01110',7:'11111 00001 00010 00100 01000 01000 01000',
 8:'01110 10001 10001 01110 10001 10001 01110',9:'01110 10001 10001 01111 00001 00010 01100',
 '!':'00100 00100 00100 00100 00100 00000 00100','?':'01110 10001 00001 00010 00100 00000 00100','.':'00000 00000 00000 00000 00000 01100 01100',',':'00000 00000 00000 00000 01100 00100 01000',
 ':':'00000 01100 01100 00000 01100 01100 00000','-':'00000 00000 00000 11111 00000 00000 00000','+':'00000 00100 00100 11111 00100 00100 00000','*':'00000 10001 01010 00100 01010 10001 00000',
 "'":'00100 00100 01000 00000 00000 00000 00000','/':'00001 00010 00010 00100 01000 01000 10000','(':'00010 00100 01000 01000 01000 00100 00010',')':'01000 00100 00010 00010 00010 00100 01000',
 '<':'00010 00100 01000 10000 01000 00100 00010','>':'01000 00100 00010 00001 00010 00100 01000','·':'00000 00000 00000 00100 00000 00000 00000','#':'01010 11111 01010 01010 11111 01010 00000',
 '♥':'00000 01010 11111 11111 01110 00100 00000','▲':'00000 00100 01110 11111 00000 00000 00000','▼':'00000 00000 11111 01110 00100 00000 00000','◀':'00010 00110 01110 11110 01110 00110 00010','▶':'01000 01100 01110 01111 01110 01100 01000'};
const FONT={};for(const k in FD)FONT[k]=FD[k].replace(/ /g,'');
const tw=(s,sc=1)=>String(s).length*6*sc-sc;
function txt(s,x,y,col,sc=1,al='l',sh=null){s=String(s).toUpperCase();let X=al==='c'?Math.round(x-tw(s,sc)/2):al==='r'?x-tw(s,sc):x;
  if(sh){txt(s,X+sc,y+sc,sh,sc,'l')}ctx.fillStyle=col;
  for(const ch of s){const g=FONT[ch];if(g)for(let i=0;i<35;i++)if(g[i]==='1')ctx.fillRect(X+(i%5)*sc,y+Math.floor(i/5)*sc,sc,sc);X+=6*sc}}

/* ================= pixel sprites, drawn in code ================= */
class Buf{constructor(w,h){this.w=w;this.h=h;this.d=new Array(w*h).fill(null)}
  px(x,y,c){x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=this.w||y>=this.h)return;this.d[y*this.w+x]=c}
  get(x,y){return x<0||y<0||x>=this.w||y>=this.h?null:this.d[y*this.w+x]}
  rect(x,y,w,h,c){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.px(x+i,y+j,c)}
  ell(cx,cy,rx,ry,c){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry;if(nx*nx+ny*ny<=1)this.px(x,y,c)}}
  poly(pts,c){let y0=1e9,y1=-1e9,x0=1e9,x1=-1e9;for(const[x,y]of pts){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
    for(let y=Math.floor(y0);y<=Math.ceil(y1);y++)for(let x=Math.floor(x0);x<=Math.ceil(x1);x++){const px=x+.5,py=y+.5;let ins=false;
      for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>py)!==(yj>py)&&px<(xj-xi)*(py-yi)/(yj-yi)+xi)ins=!ins}if(ins)this.px(x,y,c)}}
  swap(a,b,y0=0,y1=1e9){for(let y=Math.max(0,y0);y<=Math.min(this.h-1,y1);y++)for(let x=0;x<this.w;x++)if(this.d[y*this.w+x]===a)this.d[y*this.w+x]=b}
  outline(c=K){const o=this.d.slice();for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){if(o[y*this.w+x])continue;
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<this.w&&Y<this.h&&o[Y*this.w+X]&&o[Y*this.w+X]!==c){this.d[y*this.w+x]=c;break}}}return this}
  canvas(flip=false){const c=document.createElement('canvas');c.width=this.w;c.height=this.h;const g=c.getContext('2d'),im=g.createImageData(this.w,this.h);
    for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){const v=this.d[y*this.w+(flip?this.w-1-x:x)];if(!v)continue;const i=(y*this.w+x)*4,[r,gg,bb]=hx(v);im.data[i]=r;im.data[i+1]=gg;im.data[i+2]=bb;im.data[i+3]=255}
    g.putImageData(im,0,0);return c}}
const SPR=new Map();
function spr(key,make){let s=SPR.get(key);if(!s){const b=make();s=[b.canvas(false),b.canvas(true)];SPR.set(key,s)}return s}
function mk(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;fn(g);return c}
