/* ===================== ART: tactical map, symbols, drone feed, portraits ===================== */
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function srng(seed){let x=(seed|0)||7;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return((x>>>0)%100000)/100000}}
const COL={ground:'#0b150b',grid:'rgba(120,170,90,.10)',contour:'rgba(140,190,100,.16)',river:'#13394a',riverHi:'#1f5a70',road:'rgba(190,170,110,.28)',forest:'rgba(70,130,60,.35)',
  town:'rgba(170,170,150,.35)',sea:'#0a2033',seaHi:'#174060',enemy:'#ff5545',friend:'#5fd8ff',amber:'#ffb627',dead:'#5c6450',text:'#d9cfa8'};

/* ---------- the terrain under a mission, drawn once per mission and size ---------- */
const terrCache=new Map();
function terrain(m,W,H){const k=m.seed+'|'+W+'x'+H;let c=terrCache.get(k);if(c)return c;c=mk(W,H);const g=c.getContext('2d');const r=srng(m.seed);
  g.fillStyle=COL.ground;g.fillRect(0,0,W,H);
  // contour rings around a few hills
  g.strokeStyle=COL.contour;g.lineWidth=1;
  for(let h=0;h<5;h++){const cx=r()*W,cy=r()*H*.85,rad=(.12+r()*.18)*W;for(let i=1;i<=4;i++){g.beginPath();for(let a=0;a<=Math.PI*2+.01;a+=.2){const wob=1+Math.sin(a*3+h)*.12+Math.sin(a*5+i)*.06;const x=cx+Math.cos(a)*rad*i/4*wob,y=cy+Math.sin(a)*rad*i/4*wob*.7;a?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}}
  // forests
  g.fillStyle=COL.forest;for(let f=0;f<6;f++){const cx=r()*W,cy=r()*H*.85;for(let i=0;i<40;i++){const a=r()*6.28,d=r()*W*.07;g.fillRect(cx+Math.cos(a)*d,cy+Math.sin(a)*d*.7,2,2)}}
  // sea down the right edge
  if(m.sea){g.fillStyle=COL.sea;g.beginPath();g.moveTo(W,0);for(let y=0;y<=H;y+=8)g.lineTo(W*(.6+Math.sin(y/37)*.03+Math.sin(y/11)*.008),y);g.lineTo(W,H);g.fill();
    g.strokeStyle=COL.seaHi;g.beginPath();for(let y=0;y<=H;y+=8)g.lineTo(W*(.6+Math.sin(y/37)*.03+Math.sin(y/11)*.008),y);g.stroke();
    g.strokeStyle='rgba(95,216,255,.08)';for(let y=10;y<H;y+=14){g.beginPath();g.moveTo(W*.68,y);g.lineTo(W*.95,y+3);g.stroke()}}
  // a river winding across
  else{g.strokeStyle=COL.river;g.lineWidth=Math.max(4,W*.022);g.beginPath();const y0=H*(.22+r()*.3);g.moveTo(-10,y0);g.bezierCurveTo(W*.3,y0+H*(r()-.5)*.4,W*.7,y0+H*(r()-.5)*.4,W+10,y0+(r()-.5)*H*.2);g.stroke();
    g.strokeStyle=COL.riverHi;g.lineWidth=1;g.stroke()}
  // roads
  g.strokeStyle=COL.road;g.lineWidth=1.5;g.setLineDash([]);for(let i=0;i<3;i++){g.beginPath();const x=W*(.15+r()*.7);g.moveTo(x,H);g.bezierCurveTo(x+(r()-.5)*W*.5,H*.6,x+(r()-.5)*W*.5,H*.3,W*(.1+r()*.8),0);g.stroke()}
  // towns
  g.fillStyle=COL.town;for(let t=0;t<4;t++){const cx=r()*W*(m.sea?.55:1),cy=H*(.08+r()*.75);for(let i=0;i<7;i++)g.fillRect(cx+(r()-.5)*W*.06,cy+(r()-.5)*W*.05,3+r()*3,3+r()*3)}
  // grid
  g.strokeStyle=COL.grid;g.lineWidth=1;for(let i=1;i<8;i++){g.beginPath();g.moveTo(W*i/8,0);g.lineTo(W*i/8,H);g.stroke()}for(let i=1;i<10;i++){g.beginPath();g.moveTo(0,H*i/10);g.lineTo(W,H*i/10);g.stroke()}
  g.fillStyle='rgba(150,190,110,.35)';g.font=`${Math.round(W*.03)}px VT323, monospace`;for(let i=0;i<8;i++)g.fillText(String.fromCharCode(65+i),W*i/8+3,W*.035);
  terrCache.set(k,c);return c}
const FRONT_Y=.74;
function frontLine(g,W,H,t){const y=x=>H*(FRONT_Y+Math.sin(x/W*9+1)*.012+Math.sin(x/W*23)*.006);
  g.lineWidth=2;g.strokeStyle='rgba(255,85,69,.75)';g.setLineDash([6,4]);g.beginPath();for(let x=0;x<=W;x+=6)g.lineTo(x,y(x)-3);g.stroke();
  g.strokeStyle='rgba(95,216,255,.75)';g.beginPath();for(let x=0;x<=W;x+=6)g.lineTo(x,y(x)+3);g.stroke();g.setLineDash([]);
  g.fillStyle='rgba(255,85,69,.06)';g.fillRect(0,0,W,H*FRONT_Y);
  g.font=`${Math.round(W*.032)}px VT323, monospace`;g.fillStyle='rgba(255,85,69,.7)';g.fillText('ENEMY',4,H*FRONT_Y-8);g.fillStyle='rgba(95,216,255,.7)';g.fillText('VARNA',4,H*FRONT_Y+16)}
function baseIcon(g,W,H){const x=W*.5,y=H*.92,s=W*.035;g.strokeStyle=COL.friend;g.lineWidth=1.5;g.strokeRect(x-s*1.6,y-s*.8,s*3.2,s*1.6);
  g.beginPath();g.moveTo(x-s,y+s*.4);g.lineTo(x,y-s*.5);g.lineTo(x+s,y+s*.4);g.stroke();g.fillStyle=COL.friend;g.font=`${Math.round(W*.032)}px VT323, monospace`;g.textAlign='center';g.fillText('LAUNCH SITE',x,y+s*1.9);g.textAlign='left'}

/* ---------- hostile unit symbol: a diamond with a sign for its kind ---------- */
function unitSymbol(g,u,x,y,s,{focus=false,flash=0,t=0}={}){
  g.save();g.translate(x,y);
  if(u.hidden){g.strokeStyle='rgba(255,85,69,.7)';g.setLineDash([3,3]);g.lineWidth=1.5;g.beginPath();g.moveTo(0,-s);g.lineTo(s,0);g.lineTo(0,s);g.lineTo(-s,0);g.closePath();g.stroke();g.setLineDash([]);
    g.fillStyle='rgba(255,85,69,.8)';g.font=`${Math.round(s*1.2)}px VT323, monospace`;g.textAlign='center';g.textBaseline='middle';g.fillText('?',0,1);g.restore();return}
  const col=u.dead?COL.dead:flash>0?'#ffffff':COL.enemy;
  g.fillStyle=u.dead?'rgba(60,60,50,.6)':'rgba(255,85,69,.16)';g.strokeStyle=col;g.lineWidth=u.prim?2:1.3;
  g.beginPath();g.moveTo(0,-s);g.lineTo(s,0);g.lineTo(0,s);g.lineTo(-s,0);g.closePath();g.fill();g.stroke();
  g.strokeStyle=col;g.fillStyle=col;g.lineWidth=1.2;const q=s*.42;
  switch(u.cat){
    case'inf':g.beginPath();g.moveTo(-q,-q);g.lineTo(q,q);g.moveTo(q,-q);g.lineTo(-q,q);g.stroke();break;
    case'armor':g.beginPath();g.ellipse(0,0,q*1.2,q*.6,0,0,7);g.stroke();break;
    case'arty':g.beginPath();g.arc(0,0,q*.45,0,7);g.fill();break;
    case'logi':g.beginPath();g.moveTo(-q,q*.2);g.lineTo(q,q*.2);g.stroke();g.beginPath();g.arc(-q*.6,q*.55,q*.3,0,7);g.arc(q*.6,q*.55,q*.3,0,7);g.fill();break;
    case'struct':g.strokeRect(-q*.8,-q*.6,q*1.6,q*1.2);g.beginPath();g.moveTo(-q*.8,-q*.6);g.lineTo(0,-q*1.1);g.lineTo(q*.8,-q*.6);g.stroke();break;
    case'aa':g.beginPath();g.arc(0,q*.4,q*.9,Math.PI,0);g.stroke();g.beginPath();g.moveTo(0,q*.4);g.lineTo(q*.5,-q*.6);g.stroke();break;
    case'ew':g.beginPath();g.moveTo(-q,q*.5);g.lineTo(-q*.3,-q*.5);g.lineTo(q*.3,q*.5);g.lineTo(q,-q*.5);g.stroke();break;
    case'naval':g.beginPath();g.moveTo(-q,-q*.1);g.lineTo(q,-q*.1);g.lineTo(q*.6,q*.5);g.lineTo(-q*.6,q*.5);g.closePath();g.stroke();break}
  if(u.dead){g.strokeStyle='#8d9878';g.lineWidth=1.5;g.beginPath();g.moveTo(-s*.8,-s*.8);g.lineTo(s*.8,s*.8);g.moveTo(s*.8,-s*.8);g.lineTo(-s*.8,s*.8);g.stroke()}
  else{const w=s*1.8,f=Math.max(0,u.hp/u.max);g.fillStyle='rgba(0,0,0,.6)';g.fillRect(-w/2,s+3,w,3);g.fillStyle=f>.5?'#93e46c':f>.25?'#ffb627':'#ff5545';g.fillRect(-w/2,s+3,w*f,3)}
  if(u.prim&&!u.dead){g.fillStyle=COL.amber;g.font=`${Math.round(s*.9)}px VT323, monospace`;g.textAlign='center';g.fillText('★',s*.95,-s*.55)}
  if(focus){const b=s*1.45+Math.sin(t/5)*1.5;g.strokeStyle=COL.amber;g.lineWidth=2;for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){g.beginPath();g.moveTo(sx*b,sy*b*.55);g.lineTo(sx*b,sy*b);g.lineTo(sx*b*.55,sy*b);g.stroke()}}
  g.restore()}
// a friendly drone on the map: a small cyan arrow
function droneMark(g,x,y,ang,s,col=COL.friend){g.save();g.translate(x,y);g.rotate(ang);g.fillStyle=col;g.beginPath();g.moveTo(s,0);g.lineTo(-s*.7,s*.6);g.lineTo(-s*.35,0);g.lineTo(-s*.7,-s*.6);g.closePath();g.fill();g.restore()}

/* ---------- the drone camera: a little thermal picture of the target ---------- */
const FW=96,FH=64;
function feedTarget(g,type,cx,cy,k,hot){const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(cx+x*k),Math.round(cy+y*k),Math.max(1,Math.round(w*k)),Math.max(1,Math.round(h*k)))};
  const H=hot,M='#b8b8b8',D='#707070';
  switch(type){
    case'tank':R(-7,-4,14,8,M);R(-6,-5,12,1,D);R(-6,4,12,1,D);R(-2,-2,5,4,H);R(3,-.5,7,1,M);R(-7,-3,2,6,H);break;
    case'apc':R(-7,-3,14,6,M);R(-7,-3,3,6,H);R(2,-2,3,4,D);break;
    case'truck':case'fuel':R(-8,-2.5,4,5,H);R(-4,-3,12,6,type==='fuel'?'#d8d8d8':M);if(type==='fuel')R(-3,-1,10,2,'#f0f0f0');break;
    case'arty':case'coastal':R(-5,-3,10,6,M);R(-1,-1,10,2,H);R(-6,-4,3,8,D);break;
    case'mlrs':R(-8,-2.5,4,5,H);R(-4,-3,12,6,M);for(let i=0;i<4;i++)R(-3+i*3,-2,2,4,D);break;
    case'aagun':R(-4,-4,8,8,M);R(0,-1,7,1,H);R(0,1,7,1,H);R(-2,-2,4,4,H);break;
    case'sam':R(-6,-4,12,8,M);for(let i=0;i<3;i++)R(-5+i*4,-3,3,6,'#d0d0d0');R(-7,-5,2,2,H);break;
    case'ew':R(-8,-2.5,4,5,H);R(-4,-3,12,6,M);g.strokeStyle=H;g.beginPath();g.arc(cx+2*k,cy,3*k,0,7);g.stroke();break;
    case'squad':for(let i=0;i<5;i++)R(-6+i*3,-1+((i*7)%3)-1,1.6,1.6,H);break;
    case'trench':for(let i=0;i<8;i++)R(-10+i*2.6,(i%2?1:-1)*1.2,2.6,1.4,D);for(let i=0;i<4;i++)R(-8+i*5,-.5,1.4,1.4,H);break;
    case'depot':case'cp':case'hq':R(-9,-6,18,12,D);R(-8,-5,16,10,M);R(-3,-2,6,4,H);if(type==='hq'){R(7,-9,1,5,H)}break;
    case'bridge':R(-12,-6,24,12,'#202020');R(-12,-2,24,4,M);R(-12,-2,24,1,'#d0d0d0');break;
    case'hive':R(-8,-5,16,10,D);for(let i=0;i<4;i++){R(-6+i*4,-1,3,1,H);R(-5+i*4,-2,1,3,H)}break;
    case'boat':R(-8,-2,14,4,M);R(6,-1,3,2,M);R(-4,-1,4,2,H);break;
    case'lship':R(-12,-4,22,8,M);R(10,-2,3,4,M);R(-10,-2,6,4,H);R(0,-3,8,6,D);break;
    default:R(-4,-4,8,8,H)}}
function drawFeed(c,type,t,seed,{boom=false,sea=false}={}){const g=c.getContext('2d');const r=srng(seed);
  // ground: dark grey noise, cooler water if at sea
  g.fillStyle=sea?'#0e0e10':'#1c1c1c';g.fillRect(0,0,FW,FH);const k=1.4+t*2.6;const ox=FW/2,oy=FH/2;
  for(let i=0;i<260;i++){const x=(r()-.5)*FW*1.5,y=(r()-.5)*FH*1.5;g.fillStyle=r()<.5?'#262626':'#141414';g.fillRect(Math.round(ox+x*k*.6),Math.round(oy+y*k*.6),Math.ceil(k),Math.ceil(k))}
  if(!sea){g.fillStyle='#2c2c2c';g.fillRect(0,Math.round(oy+6*k*.6),FW,Math.ceil(3*k))}
  const wob=(1-t)*3;feedTarget(g,type,ox+Math.sin(t*20)*wob,oy+Math.cos(t*17)*wob,k*.9,'#ffffff');
  // crosshair and frame
  g.strokeStyle='rgba(147,228,108,.9)';g.lineWidth=1;g.beginPath();g.moveTo(ox-14,oy+.5);g.lineTo(ox-5,oy+.5);g.moveTo(ox+5,oy+.5);g.lineTo(ox+14,oy+.5);g.moveTo(ox+.5,oy-12);g.lineTo(ox+.5,oy-4);g.moveTo(ox+.5,oy+4);g.lineTo(ox+.5,oy+12);g.stroke();
  for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){g.beginPath();g.moveTo(ox+sx*20,oy+sy*10);g.lineTo(ox+sx*24,oy+sy*10);g.lineTo(ox+sx*24,oy+sy*6);g.stroke()}
  if(boom){const p=Math.min(1,(t-.82)/.18);if(p>0){g.fillStyle=`rgba(255,255,255,${1-p*.4})`;g.fillRect(0,0,FW,FH);if(p>.4){for(let i=0;i<500;i++){g.fillStyle=r()<.5?'#fff':'#000';g.fillRect(r()*FW|0,r()*FH|0,2,1)}}}}
  g.fillStyle='rgba(0,0,0,.25)';for(let y=0;y<FH;y+=2)g.fillRect(0,y,FW,1)}

/* ---------- portraits of the generals: small pixel busts in green phosphor ---------- */
function portrait(look,{tint=true,w=32,h=40}={}){const c=mk(w,h),g=c.getContext('2d');const R=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww,hh)};
  R(0,0,w,h,'#0b140b');for(let y=0;y<h;y+=3)R(0,y,w,1,'#0e180e');
  const uni=shade(look.hatc,-.15);
  R(4,30,24,10,uni);R(6,29,20,2,uni);R(13,29,6,3,shade(look.skin,-.15));R(14,31,4,9,'#d8d0b8');R(15,32,2,7,'#8a2020');
  R(7,33,4,1,'#e0c050');R(21,33,4,1,'#e0c050');if(look.hat!=='beret'){R(20,35,2,2,'#c03030');R(23,35,2,2,'#3060c0');R(20,37,5,1,'#e0c050')}
  // head
  R(11,13,10,14,look.skin);R(10,15,12,10,look.skin);R(12,27,8,2,shade(look.skin,-.1));R(9,18,1,4,shade(look.skin,-.15));R(22,18,1,4,shade(look.skin,-.15));
  R(10,14,12,2,look.hair);R(10,14,1,6,look.hair);R(21,14,1,6,look.hair);
  R(12,19,3,1,'#f0f0f0');R(17,19,3,1,'#f0f0f0');R(13,19,1,1,'#101010');R(18,19,1,1,'#101010');R(12,17,3,1,shade(look.hair,-.2));R(17,17,3,1,shade(look.hair,-.2));
  R(15,20,2,3,shade(look.skin,-.12));R(14,24,4,1,'#6a3030');
  if(look.mous)R(13,23,6,1,look.hair);if(look.beard){R(11,23,10,5,look.hair);R(14,24,4,1,'#6a3030')}
  if(look.scar){R(19,16,1,6,'#e8a0a0')}
  // hats
  const H=look.hatc;
  if(look.hat==='cap'){R(9,9,14,5,H);R(8,11,16,3,H);R(10,13,13,2,'#151515');R(15,10,2,2,'#e0c050')}
  else if(look.hat==='peak'){R(10,5,12,4,H);R(8,8,16,5,H);R(9,13,14,2,'#101010');R(14,9,4,2,'#e0c050');R(8,12,16,1,'#e0c050')}
  else if(look.hat==='naval'){R(9,9,14,4,'#e8e8e8');R(9,13,14,2,H);R(10,15,12,1,'#101010');R(15,13,2,2,'#e0c050')}
  else if(look.hat==='beret'){R(9,10,14,4,H);R(7,9,8,3,H);R(10,14,12,1,shade(H,-.3));R(18,11,2,2,'#e0c050')}
  if(tint){const d=g.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const l=(d.data[i]*.3+d.data[i+1]*.59+d.data[i+2]*.11)/255;d.data[i]=Math.round(40+l*120);d.data[i+1]=Math.round(60+l*190);d.data[i+2]=Math.round(30+l*70)}g.putImageData(d,0,0)}
  return c}
function shade(c,k){const n=parseInt(c.slice(1),16);const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return'#'+[f(n>>16&255),f(n>>8&255),f(n&255)].map(v=>v.toString(16).padStart(2,'0')).join('')}
const CO_LOOK={skin:'#d8a888',hat:'beret',hatc:'#2f4a3a',mous:0,hair:'#5a3a2a',scar:0};

/* ---------- small drone icons for lists ---------- */
function droneIcon(d,s=16){const c=mk(s,s),g=c.getContext('2d');g.strokeStyle='#5fd8ff';g.fillStyle='#5fd8ff';g.lineWidth=1;const m=s/2;
  const quad=()=>{for(const [x,y] of [[3,3],[s-4,3],[3,s-4],[s-4,s-4]]){g.beginPath();g.arc(x+.5,y+.5,2.2,0,7);g.stroke()}g.beginPath();g.moveTo(3,3);g.lineTo(s-4,s-4);g.moveTo(s-4,3);g.lineTo(3,s-4);g.stroke();g.fillRect(m-2,m-2,4,4)};
  const plane=(span,len)=>{g.fillRect(m-.5,m-len,2,len*2);g.fillRect(m-span,m-1,span*2,2);g.fillRect(m-span*.45,m+len-3,span*.9,2)};
  switch(d){case'fpv':case'fiber':quad();if(d==='fiber'){g.strokeStyle='#ffb627';g.beginPath();g.moveTo(m,m);g.quadraticCurveTo(s,s*.8,s,s);g.stroke()}break;
    case'hexa':for(let i=0;i<6;i++){const a=i/6*6.28;g.beginPath();g.arc(m+Math.cos(a)*5.5,m+Math.sin(a)*5.5,1.6,0,7);g.stroke()}g.fillRect(m-2,m-2,4,4);break;
    case'recon':plane(7,4);break;case'loiter':g.beginPath();g.moveTo(m,1);g.lineTo(m+6,s-3);g.lineTo(m,s-5);g.lineTo(m-6,s-3);g.closePath();g.fill();break;
    case'decoy':g.globalAlpha=.6;plane(6,4);g.globalAlpha=1;g.strokeRect(1.5,1.5,s-3,s-3);break;
    case'intercept':g.beginPath();g.moveTo(m,1);g.lineTo(m+3,s-2);g.lineTo(m-3,s-2);g.closePath();g.fill();g.fillRect(m-6,m+1,12,2);break;
    case'hunter':plane(5,6);g.strokeStyle='#ff5545';g.beginPath();g.arc(m,2,3,0,Math.PI);g.stroke();break;
    case'longr':plane(7.5,6);break;case'naval':g.beginPath();g.moveTo(1,m);g.lineTo(s-4,m-3);g.lineTo(s-1,m);g.lineTo(s-4,m+3);g.closePath();g.fill();g.fillStyle='#e8f6ff';g.fillRect(0,m-1,2,2);break;
    case'ucav':g.beginPath();g.moveTo(m,1);g.lineTo(s-1,m+3);g.lineTo(m,m+1);g.lineTo(1,m+3);g.closePath();g.fill();g.fillRect(m-1,m,2,6);break}
  return c}
