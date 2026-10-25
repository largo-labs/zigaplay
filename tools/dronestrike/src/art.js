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

/* ---------- enemy units: small top-down pictures, so a tank looks like a tank ---------- */
const HOST={body:'#d0503c',dark:'#5e1a12',lite:'#ffa48a',line:'#1c0804'},DEAD={body:'#55544c',dark:'#2c2b27',lite:'#76746a',line:'#121210'};
function unitArt(g,type,s,P){
  // side-view silhouettes: x to the right, ground at y=+0.62
  const poly=(pts,c)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x*s,y*s):g.moveTo(x*s,y*s));g.closePath();g.fillStyle=c;g.fill()};
  const rect=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x*s,y*s,w*s,h*s)};
  const circ=(x,y,r,c)=>{g.beginPath();g.arc(x*s,y*s,r*s,0,7);g.fillStyle=c;g.fill()};
  const line=(x1,y1,x2,y2,w,c)=>{g.strokeStyle=c;g.lineWidth=Math.max(1.5,w*s);g.lineCap='round';g.beginPath();g.moveTo(x1*s,y1*s);g.lineTo(x2*s,y2*s);g.stroke();g.lineCap='butt'};
  const wheels=(xs,r=.17)=>xs.forEach(x=>{circ(x,.45,r+.05,P.line);circ(x,.45,r,P.dark);circ(x,.45,r*.4,P.lite)});
  const cab=(x0)=>{poly([[x0,.32],[x0,-.25],[x0+.28,-.25],[x0+.42,.0],[x0+.42,.32]],P.body);poly([[x0+.06,-.18],[x0+.26,-.18],[x0+.36,.0],[x0+.06,.0]],P.lite)};
  // a dark outline: draw everything once in the outline colour, slightly bigger, by stroking the shapes afterwards is costly, so shapes get a drop line under them
  switch(type){
    case'tank':poly([[-1,.3],[-.85,.62],[.85,.62],[1,.3]],P.line);poly([[-.95,.3],[-.82,.56],[.82,.56],[.95,.3]],P.dark);[-.6,-.3,0,.3,.6].forEach(x=>circ(x,.43,.11,P.lite));
      poly([[-.95,.3],[-.85,-.02],[.9,-.02],[.98,.3]],P.body);poly([[-.45,-.02],[-.38,-.32],[.25,-.32],[.38,-.02]],P.body);rect(-.38,-.32,.6,.08,P.lite);line(.3,-.18,1.12,-.24,.13,P.line);line(.3,-.18,1.1,-.24,.07,P.lite);break;
    case'apc':poly([[-.95,.35],[-.95,-.25],[.55,-.25],[.95,.05],[.95,.35]],P.body);rect(-.95,-.25,1.5,.1,P.lite);rect(-.2,-.42,.3,.17,P.dark);line(.1,-.35,.55,-.38,.07,P.line);wheels([-.65,-.2,.25,.65],.15);break;
    case'truck':rect(-.95,-.45,1.35,.77,P.body);rect(-.95,-.45,1.35,.1,P.lite);for(let i=0;i<3;i++)rect(-.82+i*.42,-.33,.04,.62,P.dark);cab(.45);wheels([-.65,-.25,.7]);break;
    case'fuel':g.beginPath();g.roundRect(-.95*s,-.35*s,1.35*s,.62*s,.3*s);g.fillStyle=P.lite;g.fill();rect(-.95,.15,1.35,.08,P.dark);cab(.45);wheels([-.65,-.25,.7]);break;
    case'arty':line(-.2,.3,-1,.62,.1,P.dark);poly([[-.35,.3],[-.25,-.15],[.25,-.15],[.35,.3]],P.body);line(0,-.05,.95,-.8,.16,P.line);line(0,-.05,.93,-.78,.09,P.lite);circ(0,.4,.25,P.line);circ(0,.4,.2,P.dark);circ(0,.4,.08,P.lite);break;
    case'coastal':poly([[-1,.62],[-.85,-.1],[.6,-.1],[.8,.62]],P.dark);rect(-.85,-.1,1.45,.1,P.lite);line(0,-.25,1.05,-.6,.16,P.line);line(0,-.25,1.03,-.58,.09,P.lite);poly([[-.35,-.1],[-.25,-.4],[.25,-.4],[.35,-.1]],P.body);break;
    case'mlrs':poly([[-.9,-.05],[-.75,-.6],[.35,-.25],[.25,.2]],P.body);for(let i=0;i<3;i++)for(let j=0;j<2;j++)circ(-.62+i*.28+j*.07,-.44+i*.09+j*.2,.07,P.line);rect(-.95,.05,1.4,.27,P.dark);cab(.45);wheels([-.65,-.25,.7]);break;
    case'aagun':poly([[-.8,.6],[-.6,.1],[.6,.1],[.8,.6]],P.dark);poly([[-.4,.1],[-.3,-.25],[.3,-.25],[.4,.1]],P.body);line(-.1,-.2,.55,-.95,.11,P.line);line(.12,-.2,.77,-.95,.11,P.line);line(-.1,-.2,.53,-.93,.06,P.lite);line(.12,-.2,.75,-.93,.06,P.lite);break;
    case'sam':rect(-.95,.0,1.4,.32,P.dark);cab(.45);wheels([-.65,-.25,.7]);for(const o of [0,.22]){line(-.85,.0-o*.3,.25,-.75-o,.16,P.line);line(-.83,-.01-o*.3,.22,-.74-o,.1,P.body);circ(.24,-.75-o,.07,P.lite)}break;
    case'ew':rect(-.95,-.2,1.35,.52,P.body);cab(.45);wheels([-.65,-.25,.7]);line(-.3,-.2,-.3,-.85,.06,P.line);g.beginPath();g.ellipse(-.3*s,-.75*s,.42*s,.18*s,-.4,0,7);g.fillStyle=P.lite;g.fill();g.strokeStyle=P.line;g.lineWidth=1;g.stroke();circ(-.3,-.75,.06,P.dark);break;
    case'squad':for(const x of [-.6,0,.6]){circ(x,-.45,.17,P.line);circ(x,-.45,.13,P.body);poly([[x-.15,-.3],[x+.15,-.3],[x+.13,.2],[x-.13,.2]],P.body);line(x-.07,.2,x-.12,.6,.1,P.dark);line(x+.07,.2,x+.12,.6,.1,P.dark);line(x+.05,-.15,x+.38,-.42,.06,P.line)}break;
    case'trench':rect(-1,.3,2,.32,P.dark);for(let i=0;i<6;i++){g.beginPath();g.roundRect((-1+i*.34)*s,.05*s,.32*s,.27*s,.08*s);g.fillStyle=i%2?P.body:P.lite;g.fill()}
      for(const x of [-.55,.15,.7]){circ(x,-.02,.14,P.line);circ(x,-.02,.11,P.dark)}break;
    case'depot':for(const [x,y] of [[-.9,.0],[-.35,.0],[.2,.0],[-.62,-.55],[-.07,-.55]]){rect(x-.02,y-.02,.54,.58,P.line);rect(x,y,.5,.54,P.body);line(x,y,x+.5,y+.54,.04,P.dark);line(x+.5,y,x,y+.54,.04,P.dark)}
      g.beginPath();g.roundRect(.75*s,-.1*s,.25*s,.7*s,.06*s);g.fillStyle=P.lite;g.fill();break;
    case'bridge':rect(-1.05,.35,2.1,.27,'#1c4a5e');g.beginPath();g.moveTo(-1.05*s,-.1*s);g.quadraticCurveTo(0,-.6*s,1.05*s,-.1*s);g.lineTo(1.05*s,.05*s);g.quadraticCurveTo(0,-.42*s,-1.05*s,.05*s);g.closePath();g.fillStyle=P.body;g.fill();
      rect(-1.05,-.2,2.1,.1,P.lite);for(const x of [-.6,0,.6])rect(x-.05,-.15,.1,.5,P.dark);break;
    case'cp':poly([[-.85,.6],[0,-.4],[.85,.6]],P.body);poly([[-.2,.6],[0,.15],[.2,.6]],P.dark);line(.5,.6,.5,-.95,.06,P.line);poly([[.5,-.95],[.95,-.85],[.5,-.72]],P.lite);break;
    case'hq':rect(-.95,-.4,1.9,1.02,P.line);rect(-.9,-.35,1.8,.95,P.body);rect(-.9,-.35,1.8,.12,P.lite);for(const x of [-.65,-.25,.25,.65])rect(x-.1,-.1,.2,.22,P.dark);rect(-.15,.25,.3,.35,P.dark);
      line(0,-.35,0,-1.05,.06,P.line);poly([[0,-1.05],[.5,-.93],[0,-.8]],P.lite);break;
    case'hive':rect(-.9,.2,1.8,.42,P.dark);for(const x of [-.55,0,.55]){line(x,.2,x,-.05,.06,P.line);circ(x,-.25,.08,P.lite);line(x-.25,-.25,x+.25,-.25,.06,P.body);circ(x-.25,-.25,.07,P.line);circ(x+.25,-.25,.07,P.line)}break;
    case'boat':poly([[-1,-.05],[.85,-.05],[1.05,-.3],[.9,.35],[-.85,.35]],P.body);rect(-.95,.25,1.85,.1,P.dark);poly([[-.45,-.05],[-.35,-.5],[.15,-.5],[.25,-.05]],P.lite);line(.4,-.12,.85,-.2,.07,P.line);line(-.1,-.5,-.1,-.85,.04,P.line);break;
    case'lship':poly([[-1.1,-.1],[1.0,-.1],[1.15,-.35],[1.0,.45],[-1.0,.45]],P.body);rect(-1.05,.33,2.05,.12,P.dark);poly([[-.85,-.1],[-.75,-.75],[-.2,-.75],[-.1,-.1]],P.lite);rect(-.65,-.62,.32,.12,P.dark);line(-.5,-.75,-.5,-1.05,.04,P.line);
      rect(.1,-.3,.8,.2,P.dark);break;
    default:circ(0,0,.6,P.body)}}
function unitSymbol(g,u,x,y,s,{focus=false,flash=0,t=0}={}){
  g.save();g.translate(Math.round(x),Math.round(y));
  if(u.hidden){g.strokeStyle='rgba(255,85,69,.75)';g.setLineDash([3,3]);g.lineWidth=1.5;g.beginPath();g.arc(0,0,s*.8,0,7);g.stroke();g.setLineDash([]);
    g.fillStyle='rgba(255,85,69,.9)';g.font=`${Math.round(s*1.1)}px VT323, monospace`;g.textAlign='center';g.textBaseline='middle';g.fillText('?',0,1);g.restore();return}
  // a soft shadow pad under the unit so it reads on any terrain
  g.fillStyle=u.dead?'rgba(0,0,0,.25)':'rgba(255,85,69,.12)';g.beginPath();g.arc(0,0,s*1.15,0,7);g.fill();
  const P=u.dead?DEAD:flash>0&&flash%4<2?{body:'#ffffff',dark:'#ffd0c0',lite:'#ffffff',line:'#ffffff'}:HOST;
  unitArt(g,u.type,s,P);
  if(u.dead){g.fillStyle='rgba(30,30,28,.6)';g.beginPath();g.arc(s*.1,-s*.3,s*.45,0,7);g.arc(-s*.25,-s*.55,s*.3,0,7);g.fill()}
  else{const w=s*1.9,f=Math.max(0,u.hp/u.max);g.fillStyle='rgba(0,0,0,.7)';g.fillRect(-w/2,s*1.2,w,3);g.fillStyle=f>.5?'#93e46c':f>.25?'#ffb627':'#ff5545';g.fillRect(-w/2,s*1.2,w*f,3)}
  if(u.prim&&!u.dead){g.fillStyle='#ffb627';g.font=`${Math.round(s*1.05)}px VT323, monospace`;g.textAlign='center';g.textBaseline='middle';g.fillText('★',s*1.05,-s*.95)}
  if(focus){const b=s*1.45+Math.sin(t/5)*1.5;g.strokeStyle='#ffb627';g.lineWidth=2;for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){g.beginPath();g.moveTo(sx*b,sy*b*.55);g.lineTo(sx*b,sy*b);g.lineTo(sx*b*.55,sy*b);g.stroke()}}
  g.restore()}
// a friendly drone on the map, drawn with its own silhouette and turned to its heading
const dronePics=new Map();
function droneMark(g,x,y,ang,s,type='fpv',col){const k=type+(col||'');let c=dronePics.get(k);if(!c){c=droneIcon(type,16,col);dronePics.set(k,c)}
  g.save();g.translate(x,y);g.rotate(ang+Math.PI/2);g.drawImage(c,-s,-s,s*2,s*2);g.restore()}

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
function droneIcon(d,s=16,col='#5fd8ff'){const c=mk(s,s),g=c.getContext('2d');g.strokeStyle=col;g.fillStyle=col;g.lineWidth=1;const m=s/2;
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
