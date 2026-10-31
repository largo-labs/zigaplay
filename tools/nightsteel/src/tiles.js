/* ================= the classic Strike at Night art, top-down: tiles, people, props and beasts, all drawn in code =================
   Kept in its own scope; the rest of the game reaches it through TD. */
const TD=(()=>{
/* ===================== ART: tiles, people, monsters, effects — all drawn in code ===================== */
const TS=16;
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function rng(seed){let x=(seed|0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return((x>>>0)%100000)/100000}}
function hex(c){c=c.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');const n=parseInt(c,16);return[n>>16&255,n>>8&255,n&255]}
function shade(c,k){const [r,g,b]=hex(c);const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return'#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}
function mix(a,b,t){const A=hex(a),B=hex(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
const ART={};

/* ---------- tiles ---------- */
const TILE={}; // char -> {paint(g,frame,tide,x,y), solid(tide,ctx)}
function P(g,x,y,c){g.fillStyle=c;g.fillRect(x,y,1,1)}
function RF(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
function speck(g,seed,n,cols,box=[0,0,16,16]){const r=rng(seed);for(let i=0;i<n;i++){P(g,box[0]+(r()*box[2]|0),box[1]+(r()*box[3]|0),cols[i%cols.length])}}
const C={
  deep:'#1d3f8e',deep2:'#17337a',deepHi:'#4277c9',shal:'#2f7cc6',shal2:'#2a6db3',shalHi:'#7fc0f0',foam:'#e8f6ff',
  wet:'#a8916a',wet2:'#8f7a55',wetHi:'#c2ab80',pud:'#4f7fa3',pudHi:'#9cc6e0',
  sand:'#e6d39d',sand2:'#d1bb80',sandHi:'#f5e7bd',grass:'#5aa042',grass2:'#468530',grassHi:'#7bc35a',grass3:'#3c7a2c',grassHi2:'#98d468',
  dirt:'#b99460',dirt2:'#9d7a48',stone:'#868c9a',stone2:'#6e7482',stoneHi:'#a3a9b6',
  wall:'#5b6372',wall2:'#3b414d',wallHi:'#7e889a',wood:'#a8743f',wood2:'#7e5530',woodHi:'#c48d55',
  plank:'#c99a5b',plank2:'#946a38',ol:'#16101e'
};
/* 16-bit tiles: every surface has a light side and a shadow side, dithered where they meet */
const DITH=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const dth=(x,y,t)=>DITH[(y&3)*4+(x&3)]<t;
function water(g,f,deep){const b=deep?C.deep:C.shal,dk=deep?C.deep2:C.shal2,hi=deep?C.deepHi:C.shalHi;
  RF(g,0,0,16,16,b);for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=Math.sin((x+f*1.5)*.55+y*.35)+Math.cos((y-f)*.7+x*.2);if(v<-1.2&&dth(x,y,8))P(g,x,y,dk)}
  const r=rng(deep?7:11);
  for(let i=0;i<5;i++){const y=(r()*16|0),x0=(r()*16|0),l=3+(r()*3|0),dx=[0,1,2,1][(f+i)%4];
    for(let k=0;k<l;k++){P(g,(x0+dx+k)%16,y,hi);if(k>0&&k<l-1)P(g,(x0+dx+k)%16,(y+1)%16,dk)}}
  const sp=[[3,4],[11,9],[7,13],[13,2]][f%4];P(g,sp[0],sp[1],'#ffffff')}
function wet(g,seed=3){RF(g,0,0,16,16,C.wet);for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(Math.sin(x*.6+seed)+Math.cos(y*.5+seed*2)>1.1&&dth(x,y,7))P(g,x,y,C.wet2);
  speck(g,seed,16,[C.wet2,C.wet2,C.wetHi]);
  const r=rng(seed*7+1);if(r()<.7){const x=1+(r()*10|0),y=2+(r()*10|0),w=3+(r()*3|0);RF(g,x,y,w,2,C.pud);RF(g,x+1,y-1,w-2,1,C.pud);P(g,x+1,y,C.pudHi);P(g,x+2,y,C.pudHi)}
  if(r()<.4){const x=(r()*14|0),y=(r()*14|0);P(g,x,y,'#f3e4d0');P(g,x+1,y,'#e2c9b0')}}
function grass(g,seed=1){RF(g,0,0,16,16,C.grass);const r=rng(seed),o=seed*3.1;
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=Math.sin(x*.55+o)+Math.cos(y*.6+o*.7);
    if(v>1.15&&dth(x,y,6))P(g,x,y,C.grassHi);else if(v<-1.15&&dth(x,y,7))P(g,x,y,C.grass3)}
  for(let i=0;i<6;i++){const x=1+(r()*13|0),y=3+(r()*12|0);P(g,x-1,y,C.grass2);P(g,x,y-1,C.grass2);P(g,x,y,C.grass2);P(g,x+1,y-2,C.grassHi2);P(g,x+2,y-1,C.grass2);P(g,x+2,y,C.grass3)}
  speck(g,seed+9,4,[C.grassHi2,C.grassHi])}
function sand(g,seed=2){RF(g,0,0,16,16,C.sand);
  for(let y=1;y<16;y+=5)for(let x=0;x<16;x++){const yy=y+Math.round(Math.sin(x*.5+seed)*1.2);if(Math.sin(x*.9+y+seed)>-.2){P(g,x,yy,C.sand2);if(yy>0)P(g,x,yy-1,C.sandHi)}}
  speck(g,seed,8,[C.sand2,C.sandHi,'#c9b072'])}
function dirt(g,seed=4){RF(g,0,0,16,16,C.dirt);const r=rng(seed);
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=Math.sin(x*.7+seed)+Math.cos(y*.8+seed*1.3);if(v>1.2&&dth(x,y,6))P(g,x,y,'#cdaa74');else if(v<-1.2&&dth(x,y,6))P(g,x,y,C.dirt2)}
  for(let i=0;i<10;i++)P(g,r()*16|0,r()*16|0,i%2?C.dirt2:'#d4b582');
  for(let i=0;i<3;i++){const x=1+(r()*12|0),y=1+(r()*12|0);RF(g,x,y,2,2,'#8e6c40');P(g,x,y,'#e0c494');P(g,x+1,y+1,'#6a4e2c')}}
function stoneFloor(g,seed=5,base=C.stone,b2=C.stone2,hi=C.stoneHi){RF(g,0,0,16,16,base);RF(g,0,15,16,1,b2);RF(g,15,0,1,16,b2);RF(g,0,0,16,1,hi);RF(g,0,0,1,16,hi);
  RF(g,8,0,1,7,b2);RF(g,0,7,16,1,b2);RF(g,4,8,1,7,b2);RF(g,12,8,1,7,b2);speck(g,seed,6,[b2,hi])}
function bricks(g,base=C.wall,dk=C.wall2,hi=C.wallHi){RF(g,0,0,16,16,base);
  for(let r=0;r<4;r++){const y=r*4;RF(g,0,y+3,16,1,dk);RF(g,0,y,16,1,hi);const off=r%2?0:4;for(let x=off;x<16;x+=8){RF(g,x,y,1,3,dk)}}}
function planks(g,base=C.wood,dk=C.wood2,hi=C.woodHi,vert=false){RF(g,0,0,16,16,base);
  for(let i=0;i<4;i++){if(vert){RF(g,i*4+3,0,1,16,dk);RF(g,i*4,0,1,16,hi)}else{RF(g,0,i*4+3,16,1,dk);RF(g,0,i*4,16,1,hi);RF(g,(i*7+3)%14,i*4,1,3,dk)}}}
function blob(g,cx,cy,r,cols,ol){ // shaded round blob: cols dark->light
  for(let y=-r-1;y<=r+1;y++)for(let x=-r-1;x<=r+1;x++){const d=Math.hypot(x+.5,y+.5);
    if(d<=r+.6&&d>r-.4&&ol)P(g,cx+x,cy+y,ol)
    else if(d<=r-.4){const l=(-(x+.5)*.6-(y+.5)*.8)/r;P(g,cx+x,cy+y,l>.45?cols[3]:l>.05?cols[2]:l>-.45?cols[1]:cols[0])}}}
function blobN(g,cx,cy,rx,ry,cols,ol){const n=cols.length;
  for(let y=-ry-1;y<=ry+1;y++)for(let x=-rx-1;x<=rx+1;x++){const d=Math.hypot((x+.5)/rx,(y+.5)/ry);
    if(d<=1.12&&d>1-.6/Math.min(rx,ry)&&ol){P(g,cx+x,cy+y,ol);continue}
    if(d<=1-.6/Math.min(rx,ry)){let l=(-(x+.5)/rx*.62-(y+.5)/ry*.78)*.9+.5;l=l*n+(DITH[((cy+y)&3)*4+((cx+x)&3)]/16-.5)*.9;P(g,cx+x,cy+y,cols[Math.max(0,Math.min(n-1,Math.floor(l)))])}}}
function tree(g){grass(g,21);
  for(let y=11;y<16;y++)for(let x=2;x<15;x++)if(((x-8.5)/6.2)**2+((y-14)/2.2)**2<1&&dth(x,y,9))P(g,x,y,'#2e6a22');
  RF(g,7,10,3,5,'#5a3a1f');RF(g,7,10,1,5,'#8a6038');P(g,9,11,'#3a2412');P(g,9,13,'#3a2412');RF(g,6,14,5,1,'#3a2412');
  blobN(g,8,6,7,6,['#123a1c','#1f5226','#2e6c2c','#418a36','#62aa48','#8ccc64'],'#0e1a12');
  const r=rng(27);for(let i=0;i<9;i++){const x=3+(r()*10|0),y=2+(r()*8|0);P(g,x,y,i%3?'#2e6c2c':'#9ad86e')}}
function birch(g,seed=0){grass(g,21+seed);
  for(let y=11;y<16;y++)for(let x=2;x<15;x++)if(((x-8.5)/6.2)**2+((y-14)/2.2)**2<1&&dth(x,y,9))P(g,x,y,'#2e6a22');
  RF(g,7,9,3,6,'#e8e8f0');RF(g,7,9,1,6,'#ffffff');RF(g,9,9,1,6,'#a8a8b8');P(g,8,11,'#3a3a48');P(g,7,13,'#3a3a48');P(g,9,12,'#5a5a6a');RF(g,6,14,5,1,'#4a4a58');
  blobN(g,8,6,7,6,['#2a4a3a','#3f6a50','#5a8a68','#80ac88','#a8ccac','#d6eed8'],'#16241c');
  const r=rng(57+seed);for(let i=0;i<9;i++){const x=3+(r()*10|0),y=2+(r()*8|0);P(g,x,y,i%3?'#5a8a68':'#eefff0')}}
function fairyRing(g,f){grass(g,61);
  for(let y=2;y<15;y++)for(let x=1;x<16;x++){const d=Math.hypot(x-8,(y-8)*1.15);if(d<5.6&&dth(x,y,f%2?7:5))P(g,x,y,d<3?'#c8f0c0':'#9ad888')}
  const pts=[[3,4],[7,2],[11,3],[13,7],[12,11],[8,13],[4,12],[2,8]];
  pts.forEach(([x,y],i)=>{P(g,x,y+1,'#b8b0a0');P(g,x+1,y+1,'#9a9080');RF(g,x-1,y-1,3,2,(i+f)%3?'#ffffff':'#e8f8ff');P(g,x-1,y,'#d0ccd8');P(g,x+1,y,'#c0bcc8');P(g,x,y-1,'#ffffff')});
  P(g,8,7,f%2?'#ffffff':'#e0fcff');P(g,7,8,'#e8fff0');P(g,9,8,'#e8fff0')}
function well(g){stoneFloor(g,71);const rim=['#4a4756','#6c6978','#918e9c','#c0bdc8'];
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=x-7.5,dy=y-8,d=Math.hypot(dx,dy*1.1);
    if(d<6.9&&d>=6.2)P(g,x,y,C.ol);else if(d<6.2&&d>=3.9){const l=(-dx*.6-dy*.8)/d;P(g,x,y,l>.5?rim[3]:l>0?rim[2]:l>-.5?rim[1]:rim[0]);if((Math.round(Math.atan2(dy,dx)*3)&1)&&d<4.6)P(g,x,y,rim[0])}
    else if(d<3.9)P(g,x,y,d<3.1?(dy<-1&&dx<0?'#4a7ab0':'#1e3a66'):'#0e1a30')}
  P(g,6,6,'#9cc6e0');P(g,7,6,'#c8e4f4')}
function reeds(g,seed=0){grass(g,71+seed);RF(g,0,10,16,6,'#4a7a8a');RF(g,0,10,16,1,'#7ab0c0');const r=rng(73+seed);
  for(let i=0;i<9;i++){const x=1+(r()*14|0),h=6+(r()*7|0);RF(g,x,15-h,1,h,i%2?'#5a8a3a':'#3e6a2a');P(g,x,15-h,'#c8b070');if(r()<.5){RF(g,x,15-h-2,1,2,'#7a5a3a')}}}
function steppingStone(g,f){water(g,f,0);blobN(g,8,9,6,4,['#4a4756','#6c6978','#918e9c','#c0bdc8'],C.ol);RF(g,4,13,8,1,'#2a5a8a')}
function signpost(g){grass(g,63);RF(g,7,7,2,8,'#6b4426');RF(g,7,7,1,8,'#8a5a32');RF(g,2,2,12,7,'#3a2412');RF(g,3,3,10,5,'#a8743f');RF(g,3,3,10,1,'#c48d55');
  RF(g,4,5,8,1,'#6b4426');RF(g,4,7,6,1,'#7e5530');RF(g,6,14,4,1,'#3a2412')}
function palm(g){sand(g,23);const t=['#7a5230','#5a3a1f'];for(let i=0;i<9;i++){P(g,8+(i>5?1:0),6+i,t[i%2]);P(g,9+(i>5?1:0),6+i,t[0])}
  const fr=['#2f7a2c','#4ea23a'];[[-6,-1],[-5,2],[6,-1],[5,2],[0,-5],[-3,-4],[3,-4]].forEach(([dx,dy])=>{for(let k=0;k<6;k++){P(g,8+Math.round(dx*k/6),6+Math.round(dy*k/6)+(k>3?1:0),fr[k%2]);P(g,8+Math.round(dx*k/6),7+Math.round(dy*k/6)+(k>3?1:0),'#1f5a22')}});
  P(g,8,6,'#6b4426');P(g,9,7,'#6b4426')}
function rock(g,base){(base||grass)(g,31);const cols=['#4a4756','#6c6978','#918e9c','#c0bdc8'];
  for(let y=2;y<15;y++){const w=Math.round((y-2)*0.62)+2;for(let x=8-w;x<8+w;x++){const l=(x-8)/w*-1+(y<7?.4:0);P(g,x,y,l>.6?cols[3]:l>.1?cols[2]:l>-.4?cols[1]:cols[0])}}
  for(let y=2;y<15;y++){const w=Math.round((y-2)*0.62)+2;P(g,8-w-1,y,C.ol);P(g,8+w,y,C.ol)}RF(g,7,1,2,1,C.ol);RF(g,1,15,14,1,C.ol)}
function foamEdges(g,n,f){ // n = [up,right,down,left] land neighbours
  const fc=C.foam,fc2='#bfe3fb';const o=f%2;
  if(n[0])for(let x=0;x<16;x++)P(g,x,(x+o)%3===0?1:0,(x+o)%2?fc:fc2);
  if(n[2])for(let x=0;x<16;x++)P(g,x,(x+o)%3===0?14:15,(x+o)%2?fc:fc2);
  if(n[3])for(let y=0;y<16;y++)P(g,(y+o)%3===0?1:0,y,(y+o)%2?fc:fc2);
  if(n[1])for(let y=0;y<16;y++)P(g,(y+o)%3===0?14:15,y,(y+o)%2?fc:fc2)}
function house(g,col,x0,y0){RF(g,x0,y0+3,6,4,'#d8b27a');RF(g,x0,y0+6,6,1,'#946a38');RF(g,x0+2,y0+4,2,3,'#5a3518');
  for(let i=0;i<4;i++)RF(g,x0-1+i,y0+3-i,8-2*i,1,i?col:shade(col,-.35));P(g,x0+3,y0-1,shade(col,.3))}
function bell(g){stoneFloor(g,8);RF(g,3,1,10,2,'#6b4426');RF(g,3,1,1,14,'#6b4426');RF(g,12,1,1,14,'#6b4426');RF(g,4,1,8,1,'#8a5a32');
  const b=['#7a4f1c','#b07a2a','#d9a441','#ffe08a'];for(let y=4;y<12;y++){const w=y<6?2:y<9?3:4;for(let x=8-w;x<8+w;x++)P(g,x,y,x<8-w+1?b[0]:x>8+w-2?b[1]:y<7?b[3]:b[2])}
  RF(g,3,12,10,1,'#7a4f1c');P(g,7,12,'#3a2410');P(g,8,12,'#3a2410')}
function coral(g){RF(g,0,0,16,16,'#5a2a4a');const r=rng(41),cs=['#e86f8f','#ff9eb0','#c94f74','#ffb36a'];
  for(let i=0;i<10;i++){const x=r()*15|0,y=r()*15|0,c=cs[i%4];P(g,x,y,c);P(g,x+1,y,c);P(g,x,y+1,shade(c,-.3));P(g,x+1,y-1,shade(c,.3))}
  for(let i=0;i<5;i++)P(g,r()*16|0,r()*16|0,'#3a1830')}
function seabed(g,seed=51){RF(g,0,0,16,16,'#6f7d6c');speck(g,seed,18,['#5c6a5a','#869483','#5c6a5a'])}
function kelp(g,f){seabed(g,53);const sw=[0,1,1,0][f%4];for(const kx of [3,8,12]){for(let y=4;y<16;y++){const x=kx+((y+sw+(kx%3))%4<2?0:1);P(g,x,y,y%3?'#3f8a45':'#2c6a33');if(y%4===1)P(g,x+1,y,'#5fb05a')}}}
function ruinFloor(g,seed=61){stoneFloor(g,seed,'#5f7488','#46596b','#7690a6');speck(g,seed+3,5,['#4f8a6a','#5fa07a'])}
function ruinWall(g){bricks(g,'#4a5f74','#2b3a4a','#6a86a0');speck(g,63,7,['#4f8a6a','#3d7055'])}
function pillar(g){ruinFloor(g,65);RF(g,4,1,8,14,'#8aa0b6');RF(g,4,1,2,14,'#b0c4d8');RF(g,10,1,2,14,'#5f7488');RF(g,3,0,10,2,'#9db3c8');RF(g,3,14,10,2,'#5f7488');RF(g,3,0,10,1,C.ol);speck(g,66,4,['#4f8a6a'],[4,3,8,10])}
function moonFloor(g,f){RF(g,0,0,16,16,'#b9c3d8');speck(g,71,10,['#9aa4bc','#d8e2f2']);const gl=['#e6f0ff','#ffffff','#e6f0ff','#cfdcf2'][f%4];P(g,5,6,gl);P(g,11,11,gl);P(g,12,3,'#dfe9fb');RF(g,0,15,16,1,'#9aa4bc')}
function moonWall(g,f){bricks(g,'#6f7a98','#454e68','#9aa6c6');const gl=['#bfe6ff','#e8f8ff','#ffffff','#e8f8ff'][f%4];for(let y=2;y<14;y++)P(g,5+((y*3)%5),y,gl)}
function stairs(g,down){RF(g,0,0,16,16,C.wall2);for(let i=0;i<4;i++){const y=down?i*4:12-i*4;RF(g,1,y,14,3,shade('#6e7482',down?-i*.18:-(3-i)*.18));RF(g,1,y,14,1,shade('#a3a9b6',down?-i*.2:-(3-i)*.2))}}
function altar(g,f){stoneFloor(g,73);RF(g,2,5,12,9,'#5b6372');RF(g,2,5,12,1,'#a3a9b6');RF(g,3,13,10,2,'#3b414d');const gl=['#bfe6ff','#ffffff','#dff2ff','#ffffff'][f%4];RF(g,6,2,4,4,gl);P(g,7,1,gl);P(g,8,1,gl);RF(g,4,8,8,1,'#8fb0d8')}

const LAND_DEFAULT=grass;
function defTiles(){
  const T=(ch,o)=>{TILE[ch]=o};
  // anim: number of frames, tideDep: looks differ by tide
  T('~',{paint:(g,f)=>water(g,f,1),anim:4,water:true,deep:true});
  T(',',{paint:(g,f,t)=>t==='ebb'?wet(g,3):water(g,f,0),anim:4,tideDep:1,shallow:true});
  T('z',{paint:(g,f,t)=>{if(t==='ebb'){wet(g,9);}else water(g,f,0);const r=rng(77);for(let i=0;i<4;i++){const x=1+(r()*12|0),y=1+(r()*12|0);RF(g,x,y,3,2,'#5d5a68');RF(g,x,y,2,1,'#8d8a98');if(t!=='ebb'){P(g,x-1,y+1,C.foam);P(g,x+3,y+1,C.foam)}}},anim:4,tideDep:1,reef:true});
  T('.',{paint:g=>sand(g)});
  T('"',{paint:g=>grass(g)});
  T('p',{paint:g=>dirt(g)});
  T('T',{paint:tree,solid:1});
  T('Y',{paint:palm,solid:1});
  T('^',{paint:g=>rock(g),solid:1});
  T('A',{paint:g=>rock(g,sand),solid:1});
  T('o',{paint:g=>{dirt(g,6);blob(g,8,9,5,['#4a4756','#6c6978','#918e9c','#c0bdc8'],C.ol)},solid:1});
  T('f',{paint:(g,f)=>{dirt(g,44);RF(g,3,12,10,3,'#3a2414');RF(g,4,11,8,1,'#5a3a1f');const fl=[['#ffe8a0','#ffb040','#ff6a1a','#c8300e'],['#fff2c0','#ffc050','#ff7a20','#d03a12']][f%2];
    const H=[[5,9,7,11],[4,11,6,9],[6,8,8,10],[5,10,7,12]][f%4];for(let i=0;i<4;i++){const x=4+i*2,hh=H[i];for(let y=0;y<hh;y++){const c=y<hh*.3?fl[0]:y<hh*.6?fl[1]:y<hh*.85?fl[2]:fl[3];P(g,x,12-hh+y+((y+f)%3===0?0:0),c);if(y>1)P(g,x+1,12-hh+y,c)}}
    P(g,5+(f%3),2,'#ffb040');P(g,10-(f%2),3,'#ff6a1a')},anim:4,solid:1,fire:1});
  T('O',{paint:g=>{ruinFloor(g);blob(g,8,9,5,['#4a4756','#6c6978','#918e9c','#c0bdc8'],C.ol)},solid:1});
  T('#',{paint:g=>bricks(g),solid:1});
  T('_',{paint:g=>stoneFloor(g)});
  T('=',{paint:g=>planks(g)});
  T('W',{paint:g=>{planks(g,C.plank,C.plank2,'#e0b678',true);RF(g,0,15,16,1,'#5a3a1e')},solid:1});
  T('+',{paint:(g,f)=>{planks(g,C.plank,C.plank2,'#e0b678',true);RF(g,0,15,16,1,'#5a3a1e');RF(g,4,4,8,7,'#5a3a1e');RF(g,5,5,6,5,f%4<3?'#ffd77a':'#ffe9a8');RF(g,8,5,1,5,'#5a3a1e');RF(g,5,7,6,1,'#5a3a1e')},anim:4,solid:1});
  T('D',{paint:g=>{planks(g,C.plank,C.plank2,'#e0b678',true);RF(g,3,3,10,13,'#5a3518');RF(g,4,4,8,12,'#7a4a24');RF(g,7,4,1,12,'#5a3518');P(g,10,10,'#ffd77a');RF(g,4,3,8,1,'#3a2210')}});
  T('R',{paint:g=>{RF(g,0,0,16,16,'#b44a3a');for(let r=0;r<4;r++){const y=r*4;RF(g,0,y+3,16,1,'#7e2e24');for(let x=(r%2)*2;x<16;x+=4)RF(g,x,y,1,3,'#8a3329');RF(g,0,y,16,1,'#d56a55')}},solid:1});
  T('r',{paint:g=>{RF(g,0,0,16,16,'#3f5fa8');for(let r=0;r<4;r++){const y=r*4;RF(g,0,y+3,16,1,'#22386e');for(let x=(r%2)*2;x<16;x+=4)RF(g,x,y,1,3,'#2c437c');RF(g,0,y,16,1,'#6283c8')}},solid:1});
  T('d',{paint:(g,f)=>{water(g,f,0);planks(g,'#9a6b3d','#6b4423','#b9844f',true);RF(g,0,0,1,16,C.ol);RF(g,15,0,1,16,C.ol)},anim:4});
  T('|',{paint:g=>{grass(g,13);RF(g,0,6,16,2,'#8a5a32');RF(g,0,11,16,2,'#8a5a32');RF(g,0,6,16,1,'#b07a48');for(const x of [2,13]){RF(g,x,4,2,11,'#6b4426');RF(g,x,4,1,11,'#9a6b3d')}},solid:1});
  T('*',{paint:g=>{grass(g,17);const r=rng(19),cs=['#ff8fb0','#fff3a0','#ffffff','#b0a0ff'];for(let i=0;i<6;i++){const x=1+(r()*13|0),y=1+(r()*13|0);P(g,x,y,cs[i%4]);P(g,x+1,y+1,'#3f8530')}}});
  T('L',{paint:(g,f)=>{dirt(g,27);RF(g,7,5,2,10,'#3a3440');RF(g,5,14,6,2,'#3a3440');RF(g,5,1,6,5,'#3a3440');RF(g,6,2,4,3,['#ffe08a','#fff2c0','#ffe08a','#ffd060'][f%4])},anim:4,solid:1});
  T('B',{paint:bell,solid:1});
  T('c',{paint:g=>{planks(g);RF(g,0,2,16,9,'#7e5530');RF(g,0,2,16,2,'#c48d55');RF(g,0,10,16,1,C.ol)},solid:1});
  T('b',{paint:g=>{planks(g);RF(g,2,1,12,14,'#e8e0d0');RF(g,2,1,12,4,'#ffffff');RF(g,2,6,12,9,'#5a7ac0');RF(g,2,6,12,1,'#7a9ae0');RF(g,1,0,14,1,C.ol);RF(g,1,15,14,1,C.ol)},solid:1});
  T('h',{paint:g=>{planks(g);RF(g,1,3,14,12,'#6b4426');RF(g,1,3,14,2,'#9a6b3d');for(let i=0;i<4;i++){RF(g,2+i*3,6,2,7,['#c94f4f','#4f7ac9','#5fa04f','#d9a441'][i])}},solid:1});
  T('C',{paint:coral,solid:1});
  T('k',{paint:kelp,anim:4});
  T('s',{paint:g=>seabed(g)});
  T('q',{paint:g=>ruinFloor(g)});
  T('J',{paint:ruinWall,solid:1});
  T('Q',{paint:pillar,solid:1});
  T('P',{paint:(g,f,t)=>{if(t==='ebb'){stoneFloor(g,81,'#77808f','#5f6877','#8f98a6');RF(g,5,6,5,3,C.pud);P(g,6,6,C.pudHi)}else{RF(g,0,0,16,16,C.shal);water(g,f,0);RF(g,0,0,16,1,'#5f6877');RF(g,0,15,16,1,'#a3a9b6')}},anim:4,tideDep:1,pool:true});
  T('F',{paint:(g,f,t)=>{if(t==='ebb'){RF(g,0,0,16,16,'#0b0d18');RF(g,0,0,16,2,'#2a2e3c');RF(g,2,11,12,3,'#3a2818');RF(g,2,11,12,1,'#5a3e24')}else{water(g,f,0);const b=f%2;RF(g,1,5+b,14,6,'#7a5230');RF(g,1,5+b,14,1,'#a8743f');RF(g,1,10+b,14,1,'#4a2e18');RF(g,0,6+b,1,4,'#4a2e18');RF(g,15,6+b,1,4,'#4a2e18');P(g,5,7+b,'#5a3a1f');P(g,10,8+b,'#5a3a1f')}},anim:4,tideDep:1,drift:true});
  T('X',{paint:(g,f)=>{RF(g,0,0,16,16,'#0c1a3a');const r=rng(91);for(let i=0;i<3;i++){const y=r()*16|0,x=(r()*14|0)+[0,1,2,1][(f+i)%4];RF(g,x%14,y,3,1,'#1f3466')}},anim:4,solid:1});
  T('m',{paint:moonFloor,anim:4});
  T('M',{paint:moonWall,anim:4,solid:1});
  T('S',{paint:g=>stairs(g,1)});
  T('U',{paint:g=>stairs(g,0)});
  T('a',{paint:altar,anim:4,solid:1});
  T('v',{paint:g=>{grass(g,95);house(g,'#b44a3a',1,5);house(g,'#3f5fa8',8,8)}});
  T('V',{paint:g=>{grass(g,97);RF(g,1,6,14,9,'#8c8f9c');RF(g,1,6,14,1,'#c0c4cf');for(let x=1;x<15;x+=3)RF(g,x,4,2,2,'#8c8f9c');RF(g,6,9,4,6,'#3a2a20');RF(g,2,1,3,6,'#a0a4b0');RF(g,11,1,3,6,'#a0a4b0');RF(g,2,0,3,1,'#3f5fa8');RF(g,11,0,3,1,'#3f5fa8')}});
  T('n',{paint:g=>{rock(g);RF(g,5,9,6,6,'#0a0810');RF(g,6,8,4,1,'#0a0810')},solid:0});
  T('i',{paint:(g,f)=>{water(g,f,0);const cs=['#8a2f55','#e86f8f','#ff9eb0'];for(let y=1;y<16;y++){const w=Math.max(1,Math.round(y/3));RF(g,8-w,y,w*2,1,cs[1]);P(g,8-w,y,cs[0]);P(g,8+w-1,y,cs[2])}P(g,8,0,'#fff');RF(g,7,8,2,3,'#3a1830')},anim:4});
  T('u',{paint:(g,f,t)=>{if(t==='ebb'){wet(g,5);RF(g,2,3,3,12,'#7690a6');RF(g,11,3,3,12,'#7690a6');RF(g,2,2,12,3,'#8aa0b6');RF(g,5,5,6,10,'#101826');RF(g,7,7,2,2,['#bfe6ff','#ffffff'][f%2]);RF(g,2,2,12,1,C.ol)}else{water(g,f,0);RF(g,3,5,10,8,'#2a6aa8');RF(g,5,7,6,6,'#235d96')}},anim:4,tideDep:1});
  T('l',{paint:(g,f)=>{rock(g);RF(g,6,3,4,12,'#f2f2f2');RF(g,6,6,4,2,'#c94f4f');RF(g,6,11,4,2,'#c94f4f');RF(g,6,3,1,12,'#ffffff');RF(g,9,3,1,12,'#b8b8c8');RF(g,5,1,6,2,'#3a3440');P(g,7,0,['#ffe08a','#3a3440'][f%2]);P(g,8,0,['#ffe08a','#3a3440'][f%2])},anim:4});
  T('w',{paint:(g,f)=>{water(g,f,1);for(let a=0;a<28;a++){const ang=a*.42+f*.6,rad=a*.24;const x=8+Math.cos(ang)*rad,y=8+Math.sin(ang)*rad*.8;P(g,x|0,y|0,a%3?'#9ccff2':'#e8f6ff')}RF(g,7,7,2,2,'#081430')},anim:4});
  T('K',{paint:g=>RF(g,0,0,16,16,'#000'),solid:1});
  T('t',{paint:g=>birch(g),solid:1});
  T('x',{paint:(g,f)=>fairyRing(g,f),anim:2});
  T('N',{paint:g=>grass(g,1),solid:1});
  T('Z',{paint:g=>signpost(g),solid:1});
  T('e',{paint:g=>reeds(g)});
  T('E',{paint:(g,f)=>steppingStone(g,f),anim:4});
  T('y',{paint:g=>well(g),solid:1});
  T('j',{paint:g=>{sand(g,99);RF(g,2,5,12,7,'#7a5230');RF(g,2,5,12,1,'#a8743f');RF(g,4,2,2,4,'#6b4426');RF(g,10,2,2,4,'#6b4426');RF(g,3,1,10,2,'#e8e0d0')}});// beached boat
}
defTiles();
const tileCache=new Map();
function tileImg(ch,frame,tide){const t=TILE[ch]||TILE['"'];const f=t.anim?frame%t.anim:0,td=t.tideDep?tide:'';
  const key=ch+f+td;let c=tileCache.get(key);if(!c){c=mk(16,16);t.paint(c.getContext('2d'),f,tide);tileCache.set(key,c)}return c}

/* ---------- people: 16x24, shaded in four tones with outlines tinted to what they wrap ----------
   Codes: O outline · H hair, I hair light, h hair shade, j hair deep · S skin, s skin shade, n mouth · e eye
   T top, U top light, t top shade, u top deep · A accessory, a its shade · B bottom, V bottom light, b bottom shade
   K boots, k boot shade. Light comes from the upper left. */
const SPR={
down:[
"................",
".....OOOOOO.....",
"...OOIIHHHHOO...",
"..OIIHHHHHHHhO..",
".OIHHHHHHHHHHhO.",
".OHHHHHHHHHHHhO.",
".OHHHHHHHHHHhhO.",
".OHhSSSSSSSShhO.",
".OhSSSSSSSSSShO.",
".OhSSeSSSSeSShO.",
".OhSSeSSSSeSshO.",
"..OSSSSSSSSSsO..",
"...OsSSnnSSsO...",
"....OOssssOO....",
"...OUTTAATTtO...",
"..OUUTTAATTttO..",
".OUUTTTTTTTttuO.",
".OUTTTTTTTTTtuO.",
".OSSAAAAAAAAasO.",
"..OOBVBBBBBbOO..",
"...OBVBBBBbbO...",
"...OVBbOOBBbO...",
"...OKKkOOKKkO...",
"...OOOO..OOOO..."],
up:[
"................",
".....OOOOOO.....",
"...OOHHIIHHOO...",
"..OHHHIIHHHHhO..",
".OHHHHHHHHHHHhO.",
".OHHHHHHHHHHHhO.",
".OHHHHHHHHHHHhO.",
".OHHHHHHHHHHhhO.",
".OhHHHHHHHHHhhO.",
".OhHHHHHHHHhhjO.",
".OhhHHHHHHhhhjO.",
"..OhhhHHHHhhjO..",
"...OjhhhhhhjO...",
"....OOssssOO....",
"...OUTTTTTTtO...",
"..OUUTTTTTTttO..",
".OUUTTTTTTTttuO.",
".OUTTTTTTTTTtuO.",
".OSSAAAAAAAAasO.",
"..OOBVBBBBBbOO..",
"...OBVBBBBbbO...",
"...OVBbOOBBbO...",
"...OKKkOOKKkO...",
"...OOOO..OOOO..."],
left:[
"................",
"....OOOOOO......",
"..OOIIHHHHOO....",
".OIIHHHHHHHhO...",
".OIHHHHHHHHHhO..",
".OHHHHHHHHHHhhO.",
".OSSHHHHHHHHhhO.",
".OSSSShHHHHHhhO.",
"OSSSSSSHHHHHhhO.",
".OeSSSSSHHHHhjO.",
".OSSSSSSHHHHhjO.",
".OnSSSSsHHHhjO..",
"..OsSSssOhhjO...",
"...OOssOOOO.....",
"....OUTTTtO.....",
"...OUUTTTttO....",
"...OUTUUTttO....",
"...OUTUUTttO....",
"...OAASSAaaO....",
"....OVBBBbO.....",
"....OVBBBbO.....",
"....OVBbBbO.....",
"....OKKOKkO.....",
"....OOOOOOO....."]};
const LEGS={
down:[["..OOBVBBBBBbOO..","...OBVbOOBBbO...","...OKKkOOBBbO...","...OOOO.OKKkO...","........OOOO...."],
      ["..OOBVBBBBBbOO..","...OBVbOOBBbO...","...OBVbOOKKkO...","...OKKkO.OOOO...","...OOOO........."]],
up:[["..OOBVBBBBBbOO..","...OBVbOOBBbO...","...OKKkOOBBbO...","...OOOO.OKKkO...","........OOOO...."],
    ["..OOBVBBBBBbOO..","...OBVbOOBBbO...","...OBVbOOKKkO...","...OKKkO.OOOO...","...OOOO........."]],
left:[["....OVBBBbO.....","...OVBbOBBbO....","..OKKkO.OBBbO...","..OOOO..OKKkO...","........OOOO...."],
      ["....OVBBBbO.....","...OVBbOBBbO....","...OVBbO.OKKkO..","...OKKkO.OOOO...","...OOOO........."]]};
function setc(g,x,y,ch){if(y<0||y>=g.length||x<0||x>15)return;g[y]=g[y].slice(0,x)+ch+g[y].slice(x+1)}
const HAIRC='HIhj',HAIR2TOP={H:'T',I:'U',h:'t',j:'u'},HAIR2SKIN={H:'S',I:'S',h:'s',j:'s'},HAIR2ACC={H:'A',I:'A',h:'a',j:'a'},HAIR2HW={H:'Y',I:'Y',h:'y',j:'y'},HAIR2MET={H:'M',I:'N',h:'m',j:'m'};
function styleGrid(dir,frame,st){
  let g=SPR[dir].slice();
  if(frame&&frame!=='kneel')LEGS[dir][frame-1].forEach((r,i)=>g[19+i]=r);
  const has=k=>st.includes(k);
  const map=(fn,y0=0,y1=23)=>{for(let y=y0;y<=y1;y++){let r='';for(let x=0;x<16;x++)r+=fn(g[y][x],x,y);g[y]=r}};
  if(has('long')){
    if(dir==='down')for(let y=7;y<=16;y++){setc(g,1,y,y<16?'H':'O');setc(g,14,y,y<16?'h':'O');setc(g,0,y,'O');setc(g,15,y,'O');if(y>=11){setc(g,2,y,'H');setc(g,13,y,'h')}}
    if(dir==='up'){for(let y=11;y<=17;y++)for(let x=3;x<=12;x++)setc(g,x,y,x>=11?'h':x===3?'H':'H');for(let y=11;y<=17;y++){setc(g,2,y,'O');setc(g,13,y,'O')}for(let x=3;x<=12;x++)setc(g,x,18,'O');setc(g,5,15,'I');setc(g,6,14,'I')}
    if(dir==='left'){for(let y=11;y<=16;y++){setc(g,9,y,'H');setc(g,10,y,'h');setc(g,11,y,'j');setc(g,12,y,'O')}setc(g,9,17,'O');setc(g,10,17,'O');setc(g,11,17,'O')}}
  if(has('pony')){
    if(dir==='left'){for(let y=4;y<=11;y++){setc(g,14,y,y<6?'H':'h');setc(g,15,y,'O')}setc(g,14,3,'O');setc(g,14,12,'O');setc(g,13,12,'O')}
    if(dir==='up'){for(let y=12;y<=16;y++){setc(g,7,y,'H');setc(g,8,y,'h');setc(g,6,y,'O');setc(g,9,y,'O')}setc(g,7,17,'O');setc(g,8,17,'O')}
    if(dir==='down'){for(let y=5;y<=9;y++){setc(g,15,y,'O')}setc(g,14,6,'h');setc(g,14,7,'h');setc(g,14,8,'h')}}
  if(has('bun')){g[0]=".....OOOOOO.....";g[1]="....OIIHHHhO....";if(dir==='left'){g[0]="......OOOOO.....";g[1]=".....OIHHhhO...."}}
  if(has('bald')){map((c,x,y)=>HAIR2SKIN[c]&&(dir==='up'||y<=6||dir==='left'&&x<8)?HAIR2SKIN[c]:c,1,dir==='up'?10:8);
    if(dir==='down')for(let y=7;y<=10;y++){setc(g,2,y,'h');setc(g,13,y,'h')}}
  if(has('cap')){map(c=>HAIR2ACC[c]||c,1,5);
    if(dir==='down'){g[6]=".OaaaaaaaaaaaaO.";g[5]=g[5].replace(/^\.O/,'.O')}
    if(dir==='left'){g[6]="OaaaaAAAAAAAaaO.";setc(g,0,5,'O');setc(g,0,7,'.')}}
  if(has('helm')){map(c=>HAIR2ACC[c]||c,1,dir==='up'?12:7);if(dir==='down'){g[7]=".OAaSSSSSSSSaaO.";g[8]=".OaSSSSSSSSSSaO."}if(dir==='left')g[7]=".OSSSSAAAAAAaaO."}
  if(has('hat')){g[0]="....OOOOOOO.....";g[1]="...OAAAAAAAaO...";g[2]="..OAAAAAAAAAaO..";g[3]="..OAAAAAAAAAaO..";g[4]="OOaaaaaaaaaaaaOO";g[5]="OaaaaaaaaaaaaaaO"}
  if(has('hood')){map(c=>HAIR2TOP[c]||c,0,dir==='up'?13:12)}
  if(has('spiky')){
    if(dir!=='left'){g[0]="..O..OO..OO..O..";g[1]="..OOOIHOOHHOOO..";g[2]="..OIIHHIHHHHhO..";setc(g,1,3,'O');setc(g,2,3,'I')}
    else{g[0]="...O...OO..O....";g[1]="..OOO.OIHOOhO...";g[2]=".OOIIHHHHHHhhO..";setc(g,13,3,'h');setc(g,14,3,'O')}}
  if(has('mask')){
    if(dir==='down'){g[11]="..OAAAAAAAAAaO..";g[12]="...OAAAaaAAaO...";g[13]="....OOaaaaOO...."}
    if(dir==='left'){g[10]=".OAAAAAASHHHhjO.".slice(0,16);g[10]=".OAAAAAAHHHHhjO.";g[11]=".OAAAAAaHHHhjO..";g[12]="..OaAAaaOhhjO..."}}
  if(has('beard')){
    if(dir==='down'){g[11]="..OHSSSSSSSShO..";g[12]="...OHHnnHHhO....".slice(0,16);g[12]="...OHHHnnHHhO...";g[13]="....OOHHhhOO...."}
    if(dir==='left'){g[11]=".OHHHSSsHHHhjO..";g[12]="..OHHHhhOhhjO...";g[13]="...OOhhOOOO....."}}
  if(has('dress')){
    if(dir!=='left'){g[19]="..OUTTTTTTTttO..";g[20]="..OUTTTTTTTttO..";g[21]=".OUTTTTTTTTTttO.";if(!frame){g[22]="..OOKKkOOKKkOO..";g[23]="...OOOO..OOOO..."}}
    else{g[19]="....OUTTTtO.....";g[20]="...OUTTTTttO....";g[21]="...OUTTTTttO....";if(!frame){g[22]="....OKKOKkO.....";g[23]="....OOOOOOO....."}}}
  if(has('robe')){
    if(dir!=='left'){g[19]="..OUTTTTTTTttO..";g[20]="..OUTTTTTTTttO..";g[21]=".OUTTTTTTTTTttO.";g[22]=".OUTTTTTTTTTttO.";g[23]=frame?(frame===1?".OOOOOOOOOOOOO..":"..OOOOOOOOOOOOO."):".OOOOOOOOOOOOOO."}
    else{g[19]="....OUTTTtO.....";g[20]="...OUTTTTttO....";g[21]="...OUTTTTttO....";g[22]="..OUTTTTTttO....";g[23]=frame?"..OOOOOOOOOO....":"..OOOOOOOOO....."}}
  const D=dir==='down',U=dir==='up',Lf=dir==='left';
  if(has('mohawk')){map((c,x,y)=>HAIR2SKIN[c]?HAIR2SKIN[c]:c,1,U?10:8);
    if(!Lf){for(let y=0;y<=(U?10:6);y++){setc(g,7,y,'H');setc(g,8,y,'h')}for(let y=0;y<=1;y++){setc(g,6,y,'O');setc(g,9,y,'O')}}
    else{g[0]="....OOOOOOO.....";g[1]="....OHHHHhhO....";for(let x=5;x<=11;x++)setc(g,x,2,x<10?'H':'h')}}
  if(has('messy')){if(!Lf){g[0]="..O.O..OO.O..O..";g[1]="..OHOOHIHOOHOO..";g[2]="..OIHHIHHHHHhO.."}else{g[0]="...O..O.OO.O....";g[1]="..OHOOHIHOHhO...";g[2]=".OOIIHHHHHHhhO.."}}
  if(has('braid')){if(U)for(let y=12;y<=20;y++){setc(g,6,y,'O');setc(g,7,y,y%2?'H':'h');setc(g,8,y,y%2?'h':'H');setc(g,9,y,'O')}
    if(Lf)for(let y=9;y<=18;y++){setc(g,12,y,y%2?'H':'h');setc(g,13,y,'O');if(g[y][11]==='.')setc(g,11,y,'O')}}
  if(has('twin')){const tail=(xa,xb,xo)=>{for(let y=6;y<=15;y++){setc(g,xa,y,y%3?'H':'h');if(xb!=null)setc(g,xb,y,'h');setc(g,xo,y,'O')}setc(g,xa,16,'O');if(xb!=null)setc(g,xb,16,'O')};
    if(D||U){tail(1,null,0);tail(14,null,15)}else tail(13,14,15)}
  if(has('curly')){if(!Lf){g[1]="....OOOOOOOO....";g[2]="..OOIIHHHHHHOO..";for(let y=3;y<=9;y++){setc(g,0,y,'O');setc(g,1,y,y<5?'I':'H');setc(g,14,y,'h');setc(g,15,y,'O')}setc(g,1,10,'O');setc(g,14,10,'O')}
    else{for(let y=2;y<=11;y++){setc(g,14,y,'h');setc(g,15,y,'O')}g[1]="...OOOOOOOOO...."}}
  if(has('swept')&&D){for(const [x,y,c] of [[3,7,'H'],[4,7,'H'],[5,7,'H'],[6,7,'h'],[3,8,'H'],[4,8,'h']])setc(g,x,y,c)}
  if(has('hw-headband')){const y=6,a=Lf?1:2,b=Lf?12:13;for(let x=a;x<=b;x++)if(g[y][x]!=='O'&&g[y][x]!=='.')setc(g,x,y,x%5?'Y':'y');if(U)for(let y2=7;y2<=10;y2++)setc(g,8,y2,'y')}
  if(has('hw-bandana')){map(c=>HAIR2HW[c]||c,1,5);if(U){setc(g,12,6,'Y');setc(g,13,7,'y');setc(g,13,8,'O');setc(g,14,7,'O')}}
  if(has('hw-hood')){map(c=>HAIR2HW[c]||c,0,U?13:12)}
  if(has('hw-cap')){map(c=>HAIR2HW[c]||c,1,5);if(D)g[6]=".OyyyyyyyyyyyyO.";if(Lf){g[6]="OyyyyYYYYYYYyyO.";setc(g,0,5,'O')}}
  if(has('hw-helmet')){map(c=>HAIR2MET[c]||c,1,U?12:7);if(D){g[7]=".OMmSSSSSSSSmmO.";setc(g,7,8,'M');setc(g,8,8,'m')}if(Lf)g[7]=".OSSSSMMMMMMmmO."}
  if(has('mustache')){if(D){setc(g,6,11,'h');setc(g,7,11,'j');setc(g,8,11,'j');setc(g,9,11,'h')}if(Lf){setc(g,2,11,'h');setc(g,3,11,'j')}}
  if(has('stubble')){if(D)for(const [x,y] of [[4,11],[6,12],[9,12],[11,11],[8,12]])setc(g,x,y,'n');if(Lf)for(const [x,y] of [[2,11],[4,12],[5,11]])setc(g,x,y,'n')}
  if(has('o-armor')){for(let y=14;y<=17;y++)for(let x=(Lf?5:5);x<=(Lf?8:10);x++){const c=g[y][x];if('TUtu'.includes(c))setc(g,x,y,'TU'.includes(c)?(y===14?'N':'M'):'m')}}
  if(has('o-vest')&&!U){for(let y=14;y<=17;y++)for(let x=(Lf?5:7);x<=(Lf?6:8);x++)if('TUtu'.includes(g[y][x]))setc(g,x,y,'W')}
  if(has('o-coat')&&frame!=='kneel'){if(!Lf)for(let y=19;y<=21;y++){setc(g,1,y,'O');setc(g,2,y,'T');setc(g,13,y,'t');setc(g,14,y,'O');if(y===21){setc(g,1,22,'O');setc(g,2,22,'O');setc(g,13,22,'O');setc(g,14,22,'O')}}
    else for(let y=19;y<=21;y++){if(g[y][10]==='.'||g[y][10]==='O')setc(g,10,y,'T');setc(g,11,y,'t');setc(g,12,y,'O')}}
  if(has('cape')){const put=(x,y,c)=>{if(g[y]&&g[y][x]==='.')setc(g,x,y,c)};
    if(U)for(let y=14;y<=22;y++)for(let x=3;x<=12;x++)setc(g,x,y,x>=10?'c':'C');
    else if(D)for(let y=15;y<=22;y++){put(1,y,'C');put(14,y,'c');put(2,y,'C');put(13,y,'c')}
    else for(let y=14;y<=22;y++){put(10,y,'C');put(11,y,'c');put(12,y,'c')}
    const G2=g.map(r=>r);for(let y=0;y<24;y++)for(let x=0;x<16;x++)if('Cc'.includes(G2[y][x]))for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const yy=y+dy,xx=x+dx;if(yy>=0&&yy<24&&xx>=0&&xx<16&&G2[yy][xx]==='.')setc(g,xx,yy,'O')}}
  if(frame==='kneel'){const up=g.slice(0,19);g=[...Array(3).fill('................'),...up];
    g[22]=dir==='left'?"..OVBBBBbbO.....":"...OVBBBBbbO....";g[23]=dir==='left'?".OKKKOOOOKkO....":"..OKKkOOOOKkO..."}
  return g}
const MAT={H:'hair',I:'hair',h:'hair',j:'hair',S:'skin',s:'skin',n:'skin',e:'skin',T:'top',U:'top',t:'top',u:'top',A:'acc',a:'acc',B:'bot',V:'bot',b:'bot',K:'boot',k:'boot',Y:'hw',y:'hw',M:'metal',N:'metal',m:'metal',C:'cape',c:'cape',W:'shirt'};
const sprCache=new Map();
function personImg(look,dir,frame){
  const flip=dir==='right';const d=flip?'left':dir;const key=look.id+d+frame+flip;
  let c=sprCache.get(key);if(c)return c;c=mk(16,24);const g=c.getContext('2d');
  const grid=styleGrid(d,frame,look.style||[]);
  const base={hair:look.hair,skin:look.skin,top:look.top,acc:look.acc||shade(look.top,.35),bot:look.bot||'#3a3f5a',boot:look.boot||'#3a2a22',hw:look.hwc||look.acc||'#a83a2a',metal:'#9aa4b8',cape:look.cape||'#7a1a2a',shirt:'#ece4d2'};
  const pal={H:base.hair,I:shade(base.hair,.32),h:shade(base.hair,-.26),j:shade(base.hair,-.46),
    S:base.skin,s:shade(base.skin,-.16),n:shade(base.skin,-.26),e:look.eye||'#1a1424',
    T:base.top,U:shade(base.top,.24),t:shade(base.top,-.26),u:shade(base.top,-.44),A:base.acc,a:shade(base.acc,-.3),
    B:base.bot,V:shade(base.bot,.2),b:shade(base.bot,-.3),K:base.boot,k:shade(base.boot,-.32),Y:base.hw,y:shade(base.hw,-.3),
    M:base.metal,N:shade(base.metal,.35),m:shade(base.metal,-.35),C:base.cape,c:shade(base.cape,-.3),W:base.shirt};
  const dark=look.ol||'#140e1c',olOf={};for(const m in base)olOf[m]=mix(shade(base[m],-.6),dark,.5);
  const at=(x,y)=>y>=0&&y<24&&x>=0&&x<16?grid[y][x]:'.';
  for(let y=0;y<24;y++)for(let x=0;x<16;x++){const ch=grid[y][x];if(ch==='.')continue;let col;
    if(ch==='O'){let m=null;for(const [dx,dy] of [[0,-1],[1,0],[-1,0],[0,1],[1,-1],[-1,-1],[1,1],[-1,1]]){const n=at(x+dx,y+dy);if(MAT[n]){m=MAT[n];break}}
      col=m?(y>=21&&(m==='boot'||m==='bot')?dark:olOf[m]):dark}
    else col=pal[ch];if(!col)continue;g.fillStyle=col;g.fillRect(flip?15-x:x,y,1,1)}
  sprCache.set(key,c);return c}
const LOOKS={};
function look(id,o){LOOKS[id]={id,...o};return LOOKS[id]}
look('marin',{skin:'#f2c39b',hair:'#2f8f9a',top:'#e8963a',acc:'#ffe0a0',bot:'#2f3f6a',style:['pony']});
look('pell',{skin:'#d9a07a',hair:'#4a3020',top:'#5f7f3f',acc:'#c8b070',bot:'#4a3a2a',style:['cap','beard']});
look('ysolde',{skin:'#d6e6f4',hair:'#eef4ff',top:'#6aa0d8',acc:'#c8e4ff',bot:'#4a70a8',style:['long','dress'],ol:'#24304a'});
look('corvane',{skin:'#e0b090',hair:'#a8acb8',top:'#283c6e',acc:'#e0b84a',bot:'#1e2a4a',style:['hat']});
look('tilly',{skin:'#e8b894',hair:'#e8e8f0',top:'#7a4f8f',bot:'#5a3a6a',style:['bun','dress']});
look('hask',{skin:'#d8a07a',hair:'#f0f0f0',top:'#7a5a3a',bot:'#5a4028',style:['bald','beard','robe']});
look('fisher',{skin:'#d9a07a',hair:'#5a3a20',top:'#4f6fa0',bot:'#3a3a3a',style:['cap'],acc:'#d0d0d0'});
look('fishwife',{skin:'#f0c0a0',hair:'#a04a2a',top:'#c86a5a',bot:'#6a3a3a',style:['long','dress']});
look('kid',{skin:'#f2c39b',hair:'#e0b040',top:'#5fa04f',bot:'#3a5a8a'});
look('merchant',{skin:'#e0b090',hair:'#2a2a2a',top:'#a04a8a',bot:'#3a2a4a',style:['cap'],acc:'#ffd77a'});
look('innkeep',{skin:'#f0c0a0',hair:'#6a4a2a',top:'#e0e0e0',bot:'#6a5a4a',style:['bun','dress']});
look('soldier',{skin:'#e0b090',hair:'#3a2a20',top:'#2f4a8a',acc:'#b8bcc8',bot:'#1e2a4a',style:['helm']});
look('sailor',{skin:'#c88a60',hair:'#1a1a1a',top:'#e8e8f0',acc:'#2f4a8a',bot:'#2f4a8a',style:['cap']});
look('scholar',{skin:'#f0c8a8',hair:'#8a8a8a',top:'#3a5a5a',bot:'#2a3a3a',style:['robe']});
look('drowned1',{skin:'#c8dcec',hair:'#8fb0d0',top:'#5a8ab8',bot:'#3a5a88',ol:'#1e2c48'});
look('drowned2',{skin:'#c8dcec',hair:'#d0e0f0',top:'#7a9ac8',bot:'#4a6a98',style:['long','dress'],ol:'#1e2c48'});
look('drowned3',{skin:'#bcd2e6',hair:'#a0c0e0',top:'#4a7aa8',bot:'#2a4a78',style:['bald','beard','robe'],ol:'#1e2c48'});
look('drownedkid',{skin:'#d0e2f0',hair:'#b0d0f0',top:'#6aa8c8',bot:'#3a6a98',ol:'#1e2c48'});
look('cantor',{skin:'#c8dcec',hair:'#f0f8ff',top:'#3a5a98',acc:'#c8e4ff',bot:'#2a4a78',style:['long','robe'],ol:'#1e2c48'});
look('lirien',{skin:'#d6e6f4',hair:'#e8d0a0',top:'#8aa8d8',bot:'#5a78b8',style:['long','dress'],ol:'#24304a'});
look('mother',{skin:'#d6e6f4',hair:'#2f8f9a',top:'#9ab8e0',bot:'#6a88c0',style:['long','dress'],ol:'#24304a'});
look('lift',{skin:'#f0c09a',hair:'#d0682c',top:'#2f5aa8',acc:'#e8c86a',bot:'#3a3a4e',boot:'#4a2e1e',style:['spiky']});
look('bandit1',{skin:'#d8a07a',hair:'#2a2420',top:'#5e3e2a',acc:'#9a2a2a',bot:'#3a2e2a',boot:'#2a2018',style:['cap','mask']});
look('bandit2',{skin:'#c8906a',hair:'#1e1a1a',top:'#3e4a36',acc:'#3a3a4a',bot:'#2e2e2a',boot:'#221a14',style:['hood','mask']});
look('brute1',{skin:'#c88a64',hair:'#6a3a20',top:'#6a1e1e',acc:'#3a2a20',bot:'#3a2a22',boot:'#2a1e16',style:['bald','beard']});
look('villager',{skin:'#f0c8a0',hair:'#8a5a2a',top:'#a8743f',acc:'#e0d0b0',bot:'#5a4a3a',style:[]});
look('wren',{skin:'#b0764e',hair:'#2a1e2e',top:'#6a4aa8',acc:'#e8c86a',bot:'#3a2e4a',boot:'#2a2030',style:['hood']});
// Ysolde as she is in the new telling: alive, warm-skinned, platinum hair
look('ysolde2',{skin:'#f0c8a8',hair:'#f6eedc',top:'#5a8fd0',acc:'#c8e4ff',bot:'#3f62a0',style:['long','dress']});
look('woodcutter',{skin:'#c88a60',hair:'#6a3a20',top:'#8a3a2a',bot:'#4a3a2a',style:['beard']});
look('elder',{skin:'#e0b090',hair:'#d8d8e0',top:'#3f6a4a',bot:'#2a3a2a',style:['bald','beard','robe']});
look('healer',{skin:'#d9a07a',hair:'#3a2a24',top:'#c8b48a',acc:'#ffffff',bot:'#7a5a3a',style:['bun','dress']});
look('weaver',{skin:'#f0c0a0',hair:'#c8a050',top:'#6a8a4a',bot:'#4a5a3a',style:['long','dress']});
look('sable',{skin:'#c8906a',hair:'#1e1a22',top:'#3e4a36',acc:'#9a2a2a',bot:'#2e2e2a',boot:'#221a14',eye:'#5a3a2a',hilt:'#8a8a9a',ostyle:'coat',blade:'knives',style:['pony','o-coat']});
look('redcloak1',{skin:'#d8a07a',hair:'#2a1a14',top:'#8a1e24',acc:'#3a2a20',bot:'#3a2422',boot:'#22160e',hwc:'#6a141a',style:['short','hw-hood']});
look('hollis',{skin:'#ecd0b8',hair:'#1a1418',top:'#8a1e24',acc:'#d8b060',bot:'#2a1a1a',boot:'#140e0e',hwc:'#1e1a22',style:['long','hw-cap','o-coat']});
look('dace',{skin:'#e0b090',hair:'#5a3a1a',top:'#8a1e24',acc:'#3a2a20',bot:'#3a2422',boot:'#22160e',style:['messy']});
look('mom',{skin:'#f0c09a',hair:'#8a4a2a',top:'#6a8a5a',acc:'#e8d8b0',bot:'#4a5a3a',style:['bun','dress']});
look('hob',{skin:'#c88a64',hair:'#9a9aa4',top:'#4a3a2a',acc:'#9aa4b8',bot:'#3a2e26',boot:'#2a1e16',style:['bald','beard','o-vest']});
look('lettie',{skin:'#f2c39b',hair:'#e0b040',top:'#c85a7a',bot:'#5a3a5a',style:['pony']});
look('maud',{skin:'#ecc8a8',hair:'#e8e8f0',top:'#5a6a9a',bot:'#3a4a6a',style:['bun','dress']});
look('tobin',{skin:'#e8b48a',hair:'#8a5a2a',top:'#7a6a4a',acc:'#e0d0b0',bot:'#5a4a3a',boot:'#3a2a1a',eye:'#3a5a2a',hilt:'#9a7444',ostyle:'vest',blade:'fork',style:['curly','o-vest']});
look('pip',{skin:'#f0c09a',hair:'#d0682c',top:'#c86a3a',acc:'#e8d0a0',bot:'#5a4a3a',style:['twin']});
look('ida',{skin:'#e8b894',hair:'#f0f0f4',top:'#6a5a8a',acc:'#c8b070',bot:'#4a3a5a',style:['bun','dress']});
look('smith',{skin:'#c88a64',hair:'#2a1e18',top:'#5a4a3a',acc:'#9aa4b8',bot:'#3a2e26',boot:'#2a1e16',style:['short','o-vest']});
look('farmer',{skin:'#e0a880',hair:'#c8a050',top:'#6a8a3a',acc:'#e0d0a0',bot:'#5a4a30',hwc:'#d8b860',style:['short','hw-cap']});
look('granny',{skin:'#f0c8a8',hair:'#d8d8e0',top:'#a85a5a',bot:'#6a3a3a',style:['bun','dress']});
look('lad',{skin:'#d8a07a',hair:'#3a2a1a',top:'#a86a3a',bot:'#3a3a4e',style:['messy']});
look('girl',{skin:'#f2c39b',hair:'#a04a2a',top:'#5a8ad0',bot:'#3a4a7a',style:['twin']});
look('lookout',{skin:'#d9a07a',hair:'#4a3020',top:'#4a6a3a',acc:'#a8743f',bot:'#3a3a2a',hwc:'#3e5a32',style:['short','hw-hood']});
const GHOSTLY=new Set(['ysolde','drowned1','drowned2','drowned3','drownedkid','cantor','lirien','mother']);
/* a hero is drawn see-through when their current look is a ghostly one (Ysolde is a ghost only in the old telling) */


/* ---------- objects: chest, boat, sparkle ---------- */
function chestImg(open){const c=mk(16,16),g=c.getContext('2d');RF(g,2,5,12,10,C.ol);RF(g,3,6,10,8,'#9a5a2a');RF(g,3,6,10,3,open?'#3a2010':'#c07a3a');RF(g,3,9,10,1,'#5a3418');RF(g,7,8,2,3,'#ffd77a');RF(g,3,13,10,1,'#6a3a18');if(open){RF(g,3,3,10,3,'#c07a3a');RF(g,2,2,12,1,C.ol);P(g,7,7,'#ffe9a8')}return c}
ART.chest=[chestImg(0),chestImg(1)];
function boatImg(dir,f){const c=mk(24,16),g=c.getContext('2d');const b=f%2;
  if(dir==='up'||dir==='down'){RF(g,7,1+b,10,14,C.ol);RF(g,8,2+b,8,12,'#8a5a2e');RF(g,9,3+b,6,10,'#b07a42');RF(g,11,3+b,2,10,'#6b4426');
    RF(g,6,6+b,12,1,'#e8e0d0');RF(g,7,5+b,10,1,'#ffffff');}
  else{RF(g,1,8+b,22,6,C.ol);RF(g,2,9+b,20,4,'#8a5a2e');RF(g,2,9+b,20,1,'#b07a42');RF(g,3,12+b,18,1,'#6b4426');
    RF(g,11,0+b,1,9,'#5a3a1f');for(let y=1;y<8;y++)RF(g,12,y+b,Math.min(8,9-y),1,y%3?'#f0ece0':'#d8d0c0');}
  if(dir==='left'){const d=mk(24,16),dg=d.getContext('2d');dg.translate(24,0);dg.scale(-1,1);dg.drawImage(c,0,0);return d}
  return c}
ART.boat={};for(const d of ['up','down','left','right'])ART.boat[d]=[boatImg(d,0),boatImg(d,1)];
/* the Thorn: a red sword driven point-first into the stone */
function thornImg(){const c=mk(16,30),g=c.getContext('2d'),O='#14060a';
  RF(g,6,11,5,18,O);RF(g,7,28,3,1,O);P(g,8,29,O);                    // blade outline
  RF(g,7,12,3,16,'#d6dbe8');RF(g,7,12,1,16,'#ffffff');RF(g,9,12,1,16,'#8e94ac');P(g,8,28,'#c4c9d8');
  for(let y=13;y<27;y+=3){P(g,8,y,'#ff4a5a');P(g,8,y+1,'#ff8a96')}     // a red seam down the blade
  RF(g,2,9,13,4,O);RF(g,3,10,11,2,'#7a0e1e');RF(g,3,10,11,1,'#d02a3e');P(g,2,10,'#d02a3e');P(g,14,10,'#d02a3e');P(g,1,11,O);P(g,15,11,O);
  RF(g,6,3,5,7,O);RF(g,7,4,3,6,'#3a1612');for(let y=4;y<10;y+=2)RF(g,7,y,3,1,'#6e2a22');
  RF(g,5,0,7,4,O);RF(g,6,1,5,2,'#5a0812');RF(g,7,1,3,2,'#ff2a40');P(g,7,1,'#ffc0c8');
  for(const [x,y] of [[5,15],[11,18],[5,21],[11,24]])P(g,x,y,'#5a0a16');   // little thorns
  return c}
ART.thorn=thornImg();

/* ---------- monsters: shaded shapes turned into pixel art ---------- */
const RAMPS={
  crab:['#5a1a1a','#a8342a','#e0603a','#ffb07a'],iron:['#2a2a38','#4f5468','#8a90a8','#d0d6ea'],abyss:['#1a0f2e','#3f2468','#7a4ab0','#c79af0'],
  eel:['#14304a','#2a6a7a','#4aa89a','#a8f0d0'],lanterneel:['#2a1a3a','#5a3a7a','#9a6ab8','#f0c0ff'],mooneel:['#2a3a5a','#6a7aa8','#b0c0e8','#ffffff'],
  ghost:['#1a2a4a','#4a6a9a','#8ab0d8','#e8f4ff'],mourner:['#2a1a3a','#5a4a8a','#9a8ac8','#f0e8ff'],wraith:['#0a1a1a','#2a4a4a','#5a9a8a','#c8fff0'],
  jelly:['#4a1a5a','#a04ab0','#e88ae0','#ffe0ff'],glow:['#1a4a3a','#3aa07a','#7ae8b0','#f0fff0'],storm:['#1a2a5a','#3a5ab8','#7aa0ff','#e0f0ff'],
  gull:['#3a3a48','#8a8a98','#d0d0dc','#ffffff'],stormgull:['#1a1a2a','#3a3a5a','#6a6a9a','#b0b0e0'],
  barnacle:['#2a3a2a','#4a6a4a','#7a9a6a','#c0d8a8'],golem:['#4a1a2a','#a03a5a','#e87a8a','#ffc0c8'],
  chain:['#1a1a22','#3a3a48','#6a6a7a','#b0b0c0'],ironchain:['#2a1a12','#5a3a22','#9a6a3a','#e0b080'],
  star:['#5a2a10','#b85a20','#f0a040','#fff0a0'],starspawn:['#1a1a4a','#3a3aa0','#7a7af0','#e0e0ff'],
  skin:['#6a3a2a','#b87a5a','#e8b090','#ffe0c8'],navy:['#0a1028','#1e2a5a','#34509a','#6a8ad8'],gold:['#5a3a10','#a87a2a','#e8c050','#fff0b0'],
  brass:['#3a2a10','#8a6a2a','#c8a050','#fff0c0'],glass:['#08101a','#1a3a5a','#4a8ab8','#c8f0ff'],moon:['#6a7898','#a8b4d0','#dce6f8','#ffffff'],
  dark:['#06060c','#14141f','#262636','#404058'],kelp:['#0f2a14','#24582a','#3f8a3f','#8fd07a'],red:['#3a0808','#8a1818','#d83030','#ff8a7a'],
  white:['#7a7a8a','#b0b0c0','#e0e0ea','#ffffff'],bone:['#5a5040','#9a8a6a','#d0c4a0','#fff8e0'],cloth:['#2a1a1a','#5a2a2a','#8a3a3a','#c86a5a'],
  bandit:['#2a1a14','#5a3a2a','#8a5a3a','#c08a5a'],cut:['#18221a','#34442e','#566a48','#8aa070'],brute:['#2a0e0e','#5a1a1a','#8a2a2a','#c05a4a'],
  devil:['#240608','#5a1012','#9a2020','#e05a44'],darksteel:['#0c0a12','#201c2a','#3a3446','#665e74'],cape:['#12030a','#2e0812','#561222','#8a2236'],steel:['#2a2e3a','#5a6274','#9aa4b8','#e8eef8'],
  ginger:['#4a1e0a','#a05420','#e08a3a','#ffc080'],cartwood:['#2a1a0e','#5a3a1e','#8a5a30','#c08a50'],
  redcloak:['#2a0a0e','#5a141c','#9a2430','#d0584a'],crow:['#0c0c14','#24243a','#44446a','#8a8ab0'],mire:['#141e10','#2e4a24','#4e7a3a','#9ac070'],
  toad:['#1e2a12','#3e5a24','#6a8a3a','#b0c870'],lake:['#5a6a78','#9aaab8','#d8e4ec','#ffffff'],
  palewolf:['#3c4456','#7c889c','#c4ccd8','#f4f8fc'],alphawolf:['#221c30','#4e4266','#8a7aa6','#d8ccec'],scout:['#16182a','#2e3250','#4e5478','#8288b0'],
  bramble:['#1c2212','#3a4620','#5e6e32','#96a852'],moth:['#3a304a','#7a6a92','#bcb0d4','#f4eefc'],fur:['#4a3a2a','#8a6a4a','#c8a878','#f4e4c0'],
  stag:['#4a5266','#8e98ae','#d4dcea','#ffffff'],antler:['#5a8aa0','#9ccce0','#dcf4ff','#ffffff'],birch:['#6a6a7a','#b0b0be','#e6e6f0','#ffffff'],paleleaf:['#46685e','#86ac9c','#c6e6d6','#f2fff8'],leather:['#22160e','#4a3020','#7a5434','#b08458']
};
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function sculpt(w,h,parts,ol='#100a18'){
  const c=mk(w,h),g=c.getContext('2d'),img=g.createImageData(w,h),D=img.data,own=new Int16Array(w*h).fill(-1);
  const L=[-.5,-.68,.53];
  const put=(i,col)=>{const [r,gg,b]=hex(col);D[i*4]=r;D[i*4+1]=gg;D[i*4+2]=b;D[i*4+3]=255};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const px=x+.5,py=y+.5;
    for(let k=parts.length-1;k>=0;k--){const p=parts[k];let n=null;
      if(p.t==='e'){const dx=(px-p.x)/p.rx,dy=(py-p.y)/p.ry,d=dx*dx+dy*dy;if(d<=1&&(p.cut==null||py<=p.y+p.cut)&&(p.cutT==null||py>=p.y-p.cutT))n=[dx,dy,Math.sqrt(1-d)]}
      else if(p.t==='c'){const ax=p.x2-p.x1,ay=p.y2-p.y1,l2=ax*ax+ay*ay||1;let t=((px-p.x1)*ax+(py-p.y1)*ay)/l2;t=Math.max(0,Math.min(1,t));
        const cx=p.x1+ax*t,cy=p.y1+ay*t,r=p.r+(p.r2!=null?(p.r2-p.r)*t:0),dx=(px-cx)/r,dy=(py-cy)/r,d=dx*dx+dy*dy;if(d<=1)n=[dx,dy,Math.sqrt(1-d)]}
      else if(p.t==='p'){let ins=false;const pts=p.pts;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi))ins=!ins}
        if(ins){const y0=p.y0!=null?p.y0:Math.min(...pts.map(q=>q[1])),y1=p.y1!=null?p.y1:Math.max(...pts.map(q=>q[1]));const v=(py-y0)/(y1-y0||1);n=[p.nx||0,-.5+v*.9,.75]}}
      if(n){own[y*w+x]=k;const i=y*w+x;
        if(p.flat){put(i,p.flat);break}
        const ramp=RAMPS[p.m]||p.m;let v=(n[0]*L[0]+n[1]*L[1]+n[2]*L[2])*(p.k||1)+(p.b||0);v=v*.62+.42;
        v=v*(ramp.length)+(BAYER[(y%4)*4+x%4]/16-.5)*.9;const idx=Math.max(0,Math.min(ramp.length-1,Math.floor(v)));put(i,ramp[idx]);break}}}
  // inner edges: a part drawn over another gets a dark rim against it; then an outline around the whole shape
  const o2=new Int16Array(own);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=o2[y*w+x];if(k<0)continue;const p=parts[k];if(p.flat||p.noEdge)continue;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;const j=o2[yy*w+xx];
      if(j>=0&&j<k&&!parts[j].flat){const ramp=RAMPS[p.m]||p.m;put(y*w+x,shade(ramp[0],-.25));break}}}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(own[y*w+x]>=0)continue;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;if(own[yy*w+xx]>=0){put(y*w+x,ol);break}}}
  g.putImageData(img,0,0);return c}
const E=(x,y,rx,ry,m,o={})=>({t:'e',x,y,rx,ry,m,...o}),Cp=(x1,y1,x2,y2,r,m,o={})=>({t:'c',x1,y1,x2,y2,r,m,...o}),Pl=(pts,m,o={})=>({t:'p',pts,m,...o});
const eye=(x,y,r=1.4,col='#fff4b0',pupil='#100a18')=>[E(x,y,r,r,null,{flat:col}),E(x+.3,y+.2,r*.5,r*.6,null,{flat:pupil})];
const mirror=(parts,W)=>parts.concat(parts.filter(p=>!p.noMirror).map(p=>p.t==='e'?{...p,x:W-p.x}:p.t==='c'?{...p,x1:W-p.x1,x2:W-p.x2}:p.t==='p'?{...p,pts:p.pts.map(([x,y])=>[W-x,y])}:p));
const MON={
  crab(m){const legs=[];for(let i=0;i<3;i++)legs.push(Cp(8-i*1.5,15+i,2.5-i*.8,19+i*1.4,1.1,m));
    const side=[...legs,Cp(8,13,4.5,9,1.6,m),E(4,7.5,4.2,3.6,m),Pl([[1.5,5],[4,6.2],[1,8]],'dark',{noEdge:1}),Cp(10,10,9.5,6,.8,m),E(9.5,5.6,1.6,1.6,null,{flat:'#fff4b0'}),E(9.6,5.8,.8,.9,null,{flat:'#100a18'})];
    return sculpt(24,24,[...mirror(side,24).filter((p,i,a)=>p.flat?true:true),E(12,14.5,8.5,5.6,m)].sort((a,b)=>(a.flat?1:0)-(b.flat?1:0)))},
  eel(m){const parts=[];for(let i=0;i<9;i++){const x=20-i*2.1,y=13+Math.sin(i*.9)*4.2;parts.push(E(x,y,3.4-i*.18,3.4-i*.18,m))}parts.reverse();
    parts.push(Pl([[13,6],[17,9],[11,9]],m,{b:-.2}),E(21,11.5,4.6,3.8,m),Pl([[21,14],[25,13],[24,15.5]],'red',{noEdge:1}),...eye(22,10,1.2,'#fff4b0'));return sculpt(26,24,parts)},
  ghost(m){return sculpt(24,26,[Cp(5,13,2,17,1.3,m),Cp(19,13,22,17,1.3,m),Pl([[4,10],[20,10],[21,22],[18,19],[15,23],[12,20],[9,23],[6,19],[3,22]],m),E(12,9,7.5,7.5,m),
    E(9,9,1.8,2.4,null,{flat:'#0a0a18'}),E(15,9,1.8,2.4,null,{flat:'#0a0a18'}),E(9,9.5,.7,.8,null,{flat:'#bff6ff'}),E(15,9.5,.7,.8,null,{flat:'#bff6ff'}),E(12,13.5,1.4,1.8,null,{flat:'#0a0a18'})])},
  jelly(m){const t=[];for(let i=0;i<5;i++){const x=6+i*3;t.push(Cp(x,12,x+(i%2?1.5:-1.5),17,.9,m,{r2:.6}),Cp(x+(i%2?1.5:-1.5),17,x,22,.6,m,{r2:.4}))}
    return sculpt(24,24,[...t,E(12,11,9,8,m,{cut:1.5}),E(12,9,5,3.5,m,{b:.25}),...eye(9,9,1.1,'#ffffff'),...eye(15,9,1.1,'#ffffff')])},
  gull(m){return sculpt(26,22,[Pl([[12,10],[1,4],[4,9],[2,12],[9,13]],m,{b:.1}),Pl([[14,10],[25,4],[22,9],[24,12],[17,13]],m,{b:.1}),Pl([[10,16],[8,21],[13,18],[18,21],[16,16]],'white'),
    E(13,13,5.5,4.5,m),E(13,7.5,3.5,3.2,m),Pl([[12,9],[17,10],[12,11]],'star',{noEdge:1}),E(11.5,7,.9,.9,null,{flat:'#ff3030'}),Cp(11,17,10,20,.6,'star'),Cp(15,17,16,20,.6,'star')])},
  knight(m){return sculpt(24,26,[Cp(9,18,8,24,2,m),Cp(15,18,16,24,2,m),Cp(6,10,3,18,2,m),Cp(18,10,21,18,2,m),E(12,14,7,6.5,m),E(12,6.5,4.6,4.4,m),
    E(8,12,1.3,1.3,'white'),E(15,15,1.5,1.5,'white'),E(10,17,1.1,1.1,'white'),E(16,11,1,1,'white'),Pl([[9,6],[15,6],[15,7.6],[9,7.6]],null,{flat:'#0a0a18'}),E(10.5,6.8,.6,.6,null,{flat:'#7affd0'}),E(13.5,6.8,.6,.6,null,{flat:'#7affd0'})])},
  chainer(m){const links=[];for(let i=0;i<3;i++)links.push(E(12,1.6+i*2.6,1.4,1.6,'chain',{b:.1}));
    return sculpt(24,26,[...links,E(12,8.5,2.8,2.6,m),Cp(12,9,12,22,1.7,m),Cp(5,13,19,13,1.4,m),Cp(12,22,4,17,1.8,m,{r2:1.2}),Cp(12,22,20,17,1.8,m,{r2:1.2}),Pl([[2,15],[5,16],[3,19]],m),Pl([[22,15],[19,16],[21,19]],m),
      E(12,15.5,2.6,2.6,'dark'),E(12,15.5,1.6,1.6,null,{flat:'#ff5a3a'}),E(12,15.2,.6,.6,null,{flat:'#fff0a0'})])},
  star(m){const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?4.2:11;pts.push([12+Math.cos(a)*r,13+Math.sin(a)*r])}
    return sculpt(24,25,[Pl(pts,m,{b:.1}),E(12,13,4.5,4.5,m,{b:.2}),...eye(10.3,12,1.1,'#ffffff'),...eye(13.7,12,1.1,'#ffffff'),E(12,15,1.4,.7,null,{flat:'#3a0a0a'})])},
  // bosses (48 px)
  warden(){const m='crab',legs=[];for(let i=0;i<3;i++)legs.push(Cp(17-i*3,30+i*2,6-i*1.5,38+i*2.5,2.2,m));
    const side=[...legs,Cp(16,24,8,16,3,m),E(7,12,8,6.5,m),Pl([[1,9],[7,11.5],[1,14]],'dark',{noEdge:1})];
    return sculpt(48,46,[...mirror(side,48),E(24,28,16,11,m),Pl([[14,22],[34,22],[30,10],[24,7],[18,10]],'iron'),Pl([[18,16],[30,16],[30,18],[18,18]],null,{flat:'#0a0a18'}),
      E(21,17,1.2,1,null,{flat:'#ff6a3a'}),E(27,17,1.2,1,null,{flat:'#ff6a3a'}),Cp(24,7,24,2,1,'gold'),E(24,30,6,3,m,{b:.3})])},
  diver(){return sculpt(48,48,[Cp(17,34,15,46,4,'brass'),Cp(31,34,33,46,4,'brass'),E(15,46,5,2.2,'dark'),E(33,46,5,2.2,'dark'),
    Cp(11,22,6,36,3.6,'brass'),Cp(37,22,42,36,3.6,'brass'),E(6,38,4,3.5,'iron'),E(42,38,4,3.5,'iron'),Cp(42,38,46,24,1.2,'iron'),
    E(24,28,12,11,'brass'),Pl([[16,22],[32,22],[30,34],[18,34]],'iron',{b:-.1}),E(24,13,10.5,10,'brass'),E(24,14,6.5,6,'glass'),
    E(21.5,13.5,1.5,1.5,null,{flat:'#7affd0'}),E(26.5,13.5,1.5,1.5,null,{flat:'#7affd0'}),E(14,13,2,2.5,'gold'),E(34,13,2,2.5,'gold'),E(24,4,2.5,2,'gold'),
    Cp(33,20,40,6,1.3,'dark'),E(24,27,2.5,2.5,'gold')])},
  grief(){const hands=[];for(let i=0;i<5;i++){const a=Math.PI*.15+i*Math.PI*.17;hands.push(Cp(24+Math.cos(a)*10,30,24+Math.cos(a)*19,30+Math.sin(a)*14,1.4,'ghost',{r2:1}))}
    return sculpt(48,48,[...hands,...hands.map(p=>({...p,x1:48-p.x1,x2:48-p.x2})),Pl([[10,16],[38,16],[42,44],[36,40],[31,46],[24,41],[17,46],[12,40],[6,44]],'mourner'),E(24,15,11,11,'mourner'),
      Pl([[13,12],[24,2],[35,12],[33,20],[15,20]],'dark',{b:-.3}),E(20,15,2,2.6,null,{flat:'#fff4b0'}),E(28,15,2,2.6,null,{flat:'#fff4b0'}),
      Cp(24,22,24,27,.7,'gold'),Pl([[19,27],[29,27],[28,37],[20,37]],'gold'),E(24,32,3.2,3.6,null,{flat:'#fff4b0'}),E(24,32,1.8,2.2,null,{flat:'#ffffff'})])},
  corvane(){return sculpt(40,48,[Cp(16,32,15,46,3,'navy'),Cp(24,32,25,46,3,'navy'),E(15,46,4,2,'dark'),E(25,46,4,2,'dark'),
    Pl([[10,18],[30,18],[34,40],[6,40]],'navy'),Pl([[18,18],[22,18],[21,30],[19,30]],'white'),Cp(11,20,5,32,2.6,'navy'),Cp(29,20,34,30,2.6,'navy'),E(5,33,2.2,2.2,'skin'),E(34,31,2.2,2.2,'skin'),
    Cp(35,30,39,6,1.1,'white',{r2:.8}),Cp(33,32,37,30,1.2,'gold'),E(20,12,5.5,6,'skin'),Pl([[10,8],[20,1],[30,8],[27,9],[13,9]],'navy'),Cp(12,8.5,28,8.5,1,'gold'),
    E(18,12,.8,1,null,{flat:'#100a18'}),E(22,12,.8,1,null,{flat:'#100a18'}),Pl([[16,15],[24,15],[23,18],[17,18]],'white'),Cp(11,19,15,19,1.6,'gold'),Cp(25,19,29,19,1.6,'gold')])},
  /* the bandit crew: masked raiders with a long knife, and the big one with a club */
  bandit(m){return sculpt(30,38,[Cp(12,26,11,35,2.3,'leather'),Cp(18,26,19,35,2.3,'leather'),E(10.5,35.5,3.2,1.6,'dark'),E(19.5,35.5,3.2,1.6,'dark'),
    Pl([[8,14],[22,14],[24,29],[6,29]],m),Cp(7,24,23,24,1.1,'bone'),Cp(8,16,4,24,2.2,m),Cp(22,16,25.5,23,2.2,m),E(4,25.5,1.9,1.9,'skin'),E(25.5,24,1.9,1.9,'skin'),
    Cp(26.5,23,28.5,8,.9,'steel',{r2:.5}),Cp(24.5,24.5,28.5,23.5,1,'dark'),
    E(15,9,4.6,5.2,'skin'),Pl([[9.5,8],[15,2.8],[20.5,8],[20.5,9.5],[9.5,9.5]],'cloth'),Pl([[10.5,10.5],[19.5,10.5],[19,14.5],[11,14.5]],'cloth'),
    E(13.2,9.4,.9,.8,null,{flat:'#100a18'}),E(16.8,9.4,.9,.8,null,{flat:'#100a18'})])},
  brute(m){return sculpt(38,44,[Cp(15,30,14,41,3.2,'leather'),Cp(23,30,24,41,3.2,'leather'),E(13.5,41.5,4,2,'dark'),E(24.5,41.5,4,2,'dark'),
    E(19,23,10.5,10,m),Cp(9,17,4,29,3.4,'skin'),Cp(29,17,33,27,3.4,'skin'),E(4,30,2.6,2.6,'skin'),E(33,28,2.6,2.6,'skin'),
    Cp(33,28,36,8,2.6,'leather',{r2:3.6}),E(36,7,3.6,3.6,'leather'),Cp(9,27,29,27,1.4,'dark'),
    E(19,10,5.6,5.8,'skin'),Pl([[14,12.5],[24,12.5],[23,18.5],[19,20],[15,18.5]],'leather'),E(16.8,9.8,.9,.9,null,{flat:'#100a18'}),E(21.2,9.8,.9,.9,null,{flat:'#100a18'})])},
  /* the Bandit Devil King: horned, crowned, caped, with a red-edged greatblade */
  devilking(m,k=1){return sculpt(Math.round(64*k),Math.round(70*k),scaleParts([
    Pl([[13,20],[47,20],[58,68],[2,68]],'cape'),
    Cp(24,47,22,63,4.2,'darksteel'),Cp(36,47,38,63,4.2,'darksteel'),E(21,64,5,2.4,'dark'),E(39,64,5,2.4,'dark'),
    Pl([[17,22],[43,22],[45,49],[15,49]],'darksteel'),Pl([[26,26],[34,26],[32,41],[28,41]],'devil'),Cp(16,47,44,47,1.6,'gold'),Cp(20,30,40,30,.8,'devil'),
    E(16,23.5,6.4,4.8,'darksteel'),E(44,23.5,6.4,4.8,'darksteel'),Pl([[11,21],[7,13],[16,19]],'bone'),Pl([[49,21],[53,13],[44,19]],'bone'),
    Cp(15,26,10,41,3.4,'darksteel'),Cp(45,26,49,39,3.4,'darksteel'),E(10,42.5,2.9,2.9,'devil'),E(49,40.5,2.9,2.9,'devil'),
    Pl([[47,42],[53,6],[58,8],[52.5,43.5]],'steel'),Cp(53.4,8,57.4,9.2,.7,null,{flat:'#ff4a3a',noEdge:1}),Cp(53,20,56,21,.6,null,{flat:'#ff4a3a',noEdge:1}),Cp(48,41,53,40.5,1.5,'gold'),
    E(30,15.5,5.4,5.2,'devil'),E(30,12.5,7,6.2,'darksteel',{cut:.6}),Pl([[24,11],[16,1],[27,8]],'bone'),Pl([[36,11],[44,1],[33,8]],'bone'),
    Pl([[24.5,7],[26,3],[28,6],[30,1.5],[32,6],[34,3],[35.5,7]],'gold'),
    E(27.3,13.9,1.4,.9,null,{flat:'#ff3a2a'}),E(32.7,13.9,1.4,.9,null,{flat:'#ff3a2a'}),E(27.3,13.9,.6,.5,null,{flat:'#ffd0a0'}),E(32.7,13.9,.6,.5,null,{flat:'#ffd0a0'}),
    Pl([[27,18],[33,18],[32,19.2],[28,19.2]],null,{flat:'#140608'})],k))},
  /* the Pale Wood */
  wolf(m){return sculpt(42,30,[
    Cp(9,14.5,2,9,2.4,m,{r2:1.6,b:-.05}),Cp(3.5,10,1.5,7.5,1.5,m,{r2:.9,b:.1}),
    Cp(12,18,10,22.5,2,m,{r2:1.6,b:-.35}),Cp(10,22.5,11,27.5,1.4,m,{r2:1.1,b:-.35}),Cp(28,18,28.5,27.5,1.5,m,{r2:1.1,b:-.35}),
    E(10.5,27.8,2.2,1,'dark'),E(28.4,27.8,2.1,1,'dark'),
    E(14,15.5,6.4,5.4,m),E(20,15.5,7,4.6,m),E(27,14.5,7,6.6,m),
    Cp(16,18.5,14.5,22.5,2.1,m,{r2:1.7}),Cp(14.5,22.5,16,27.5,1.5,m,{r2:1.2}),Cp(31.5,18,32,27.5,1.6,m,{r2:1.2}),
    E(16.4,27.8,2.3,1.1,'dark'),E(32.6,27.8,2.3,1.1,'dark'),
    Pl([[22,10],[25.5,7],[27.5,10],[30,7.6],[31.5,12],[26,14.5]],m,{b:.25}),
    Pl([[30.6,8],[31.4,2],[34.2,7]],m),Pl([[33.4,7.4],[36,2.4],[36.6,8.4]],m),
    E(33.5,10.6,4.8,4,m),Cp(35.5,11.6,40.6,13,2.1,m,{r2:1.4}),
    E(40.9,12.4,1,.9,null,{flat:'#14101c'}),Cp(36.5,14.4,40.2,14,.45,null,{flat:'#3a2028',noEdge:1}),
    E(35,9.5,1.05,.8,null,{flat:'#9fe8ff'}),E(35.3,9.6,.45,.45,null,{flat:'#ffffff'})])},
  thornling(m){const th=[];const T=(a,l=3.2)=>{const x=15+Math.cos(a)*9.2,y=18+Math.sin(a)*8.6,dx=Math.cos(a),dy=Math.sin(a),px=-dy,py=dx;
      th.push(Pl([[x+px*1,y+py*1],[x+dx*l,y+dy*l],[x-px*1,y-py*1]],'bone',{b:.15}))};
    [-2.5,-1.9,-.9,-.3,.4,1.1,2.1,2.8].forEach(a=>T(a));
    return sculpt(32,36,[Cp(11,24,7.5,33,2,m,{r2:1.1,b:-.25}),Cp(19,24,23,33,2,m,{r2:1.1,b:-.25}),Cp(15,26,15,34,1.8,m,{r2:1,b:-.25}),
      Cp(7,15,1.5,22.5,2,m,{r2:1.1}),Cp(23,14,29,7.5,2,m,{r2:1.1}),
      E(15,18,10,9.5,m),...th,
      Cp(7.5,14,22,22.5,.7,m,{b:-.45}),Cp(8,22,22.5,13,.7,m,{b:-.45}),Cp(9.5,11,20,25.5,.6,m,{b:.35}),
      E(10,9,4,2.4,'kelp'),E(20,8.4,4.4,2.6,'kelp'),E(15,6.4,3.4,3,'kelp',{b:.2}),
      E(11.8,16.3,1.6,1.4,null,{flat:'#ffd24a'}),E(18.6,16.3,1.6,1.4,null,{flat:'#ffd24a'}),E(12.1,16.5,.65,.65,null,{flat:'#5a1a08'}),E(18.9,16.5,.65,.65,null,{flat:'#5a1a08'}),
      Cp(12.4,20.6,17.6,20.6,.55,null,{flat:'#1a1008',noEdge:1})])},
  moth(m){const W=36,half=[Pl([[17,12],[3,1.5],[.8,9.5],[6,16],[16.5,15]],m,{b:.1}),Pl([[17,15.5],[5,17],[4,24],[10.5,26.5],[17,19.5]],m,{b:-.15}),
      E(7.5,7.8,2.7,2.5,null,{flat:'#f6e2a8'}),E(7.7,7.9,1.3,1.2,null,{flat:'#5a3a6a'}),E(9.6,21.6,1.7,1.5,null,{flat:'#e8d0f0'}),
      Cp(17,6.5,12,1.2,.55,'fur',{r2:.4})];
    return sculpt(W,28,[...mirror(half,W),E(18,16,2.9,7.6,'fur'),E(18,8.6,2.7,2.5,'fur',{b:.2}),E(16.9,8.2,.8,.8,null,{flat:'#1a1020'}),E(19.1,8.2,.8,.8,null,{flat:'#1a1020'})])},
  cat(m){return sculpt(18,14,[Cp(3,7,1,2.5,1,m,{r2:.7}),E(8,9,5.4,3.4,m),Cp(6,11,5.6,13,1,m),Cp(10,11,10.4,13,1,m),E(13,7,3.4,3,m),
    Pl([[11,5.5],[11.4,2.4],[13,4.6]],m),Pl([[13.6,4.4],[15.4,2.2],[15.6,5.6]],m),E(14.4,6.8,.7,.6,null,{flat:'#a8e070'}),E(12.4,6.8,.7,.6,null,{flat:'#a8e070'}),E(13.6,8.6,.5,.4,null,{flat:'#e08080'})])},
  toad(m){return sculpt(38,28,[
    Cp(8,19,4,25,3,m,{r2:2,b:-.3}),E(4,26,3.6,1.5,m,{b:-.3}),
    E(17,18,13,8,m),E(19,21,9,4.5,'bone',{b:.1}),E(27,14,8.5,7,m),
    Cp(27,19,28.5,25.5,2,m),E(29.5,26,3,1.3,m),
    E(23.5,8,2.8,2.6,m),E(30,8.4,2.6,2.4,m),E(23.8,7.6,1.4,1.4,null,{flat:'#ffe36a'}),E(30.2,8,1.3,1.3,null,{flat:'#ffe36a'}),E(24.1,7.7,.5,.8,null,{flat:'#141008'}),E(30.4,8.1,.5,.8,null,{flat:'#141008'}),
    Cp(23,16.6,35,15.6,.5,null,{flat:'#1a2010',noEdge:1}),E(12,13,1.6,1.2,m,{b:.35}),E(17,11.5,1.3,1,m,{b:.35}),E(20,15,1.1,.9,m,{b:-.2})])},
  hollis(m){return sculpt(40,52,[
    Cp(16,36,15,49,2.6,'dark'),Cp(23,36,24,49,2.6,'dark'),E(14.5,50,3.4,1.6,'dark'),E(24.5,50,3.4,1.6,'dark'),
    Pl([[11,16],[27,16],[31,46],[7,46]],'redcloak'),Pl([[15,17],[23,17],[22,34],[16,34]],'leather'),Cp(9,32,29,32,1.2,'dark'),
    Cp(12,18,7,33,2.6,'redcloak'),E(7,34.5,2.2,2.2,'skin'),
    Cp(26,18,31,9,2.6,'redcloak'),
    E(19,11,4.8,5.2,'skin'),Pl([[13,9],[25,9],[27,10.5],[11,10.5]],'dark'),E(19,6.5,5,3.6,'dark',{cut:1.2}),Cp(14,15.5,24,15.5,1.4,'redcloak'),
    E(20.6,11.2,.9,.8,null,{flat:'#ff6a4a'}),E(17.2,11.2,.9,.8,null,{flat:'#ff6a4a'}),
    Pl([[30,8],[33.4,-1],[35.6,8.6]],'red',{b:.3}),E(32,9.5,3,2.6,'red',{b:.2}),E(32,9.5,1.4,1.2,null,{flat:'#ffd0a0'})])},
  stag(m,k=1){return sculpt(Math.round(66*k),Math.round(66*k),scaleParts([
    Cp(16,44,15,62,2.2,'stag',{r2:1.6,b:-.4}),Cp(42,44,43,62,2,'stag',{r2:1.5,b:-.4}),E(15,62.6,2.4,1.2,'dark'),E(43,62.6,2.3,1.2,'dark'),
    E(9.5,33,2.4,3.2,'stag',{b:.3}),
    E(16,37,8.5,9,'stag'),E(28,38,13,8.5,'stag'),E(40.5,36,8,9,'stag'),
    Cp(21,43,18,53,2.7,'stag',{r2:2}),Cp(18,53,20,63,1.8,'stag',{r2:1.4}),Cp(37.5,45,37,63,2.2,'stag',{r2:1.6}),E(20,63.6,2.6,1.2,'dark'),E(37,63.6,2.5,1.2,'dark'),
    Cp(42,32,50,22,4.8,'stag',{r2:3.6}),Pl([[37,29],[41,24],[43,28],[46,23.5],[48,28],[43,33]],'stag',{b:.3}),
    Cp(50,15,44,4,1.3,'antler',{r2:.8}),Cp(47,9,40.5,9,.9,'antler',{r2:.5}),Cp(45,6,42.5,1,.8,'antler',{r2:.4}),Cp(48.5,12,43.5,13.5,.7,'antler',{r2:.4}),
    Pl([[49.5,16.5],[44,14.2],[49.8,19.2]],'stag'),
    E(52,20,4.8,4,'stag'),Cp(54,21,60.5,24,2.8,'stag',{r2:1.9}),E(61,24,1.2,1,null,{flat:'#2a2436'}),
    Cp(53,15,57,2,1.4,'antler',{r2:.8}),Cp(55,8.5,61.5,6,.9,'antler',{r2:.5}),Cp(56.5,5,59.5,.5,.8,'antler',{r2:.4}),Cp(54,11.5,60,11,.8,'antler',{r2:.4}),
    E(53.4,18.9,1.15,.95,null,{flat:'#9fe8ff'}),E(53.7,19,.5,.5,null,{flat:'#ffffff'}),
    Cp(14,31,38,30,.55,null,{flat:'#e8fbff',noEdge:1})],k))},
  undertide(){const ch=[];for(let i=0;i<7;i++){const a=i*0.9;ch.push(Cp(30+Math.cos(a)*6,34+Math.sin(a)*4,30+Math.cos(a)*27,34+Math.sin(a)*17,1.5,'chain',{r2:1}))}
    const ten=[];for(let i=0;i<4;i++){const x=8+i*15;ten.push(Cp(x,56,x+(i%2?6:-6),40,3.5,'abyss',{r2:1.5}))}
    return sculpt(60,60,[...ten,...ch,E(30,44,22,13,'abyss'),Pl([[20,22],[40,22],[44,44],[16,44]],'navy'),Cp(21,24,10,38,3,'navy'),Cp(39,24,50,38,3,'navy'),
      E(30,16,6,6.5,'skin'),Pl([[20,12],[30,4],[40,12],[37,13],[23,13]],'navy'),Cp(22,12.5,38,12.5,1,'gold'),E(27.5,16,1,1.2,null,{flat:'#7affd0'}),E(32.5,16,1,1.2,null,{flat:'#7affd0'}),
      E(30,33,6,6,'moon',{b:.2}),E(30,33,3,3,null,{flat:'#ffffff'})])},
};
ART.whiteTree=()=>ART._wt||(ART._wt=sculpt(64,80,[
  Cp(32,78,32,42,6,'birch',{r2:4}),Cp(31,54,17,40,2.3,'birch',{r2:1.4}),Cp(33,50,47,37,2.5,'birch',{r2:1.4}),Cp(26,78,16,79.5,2,'birch'),Cp(38,78,48,79.5,2,'birch'),
  E(32,27,27,18,'paleleaf'),E(14,35,12,9,'paleleaf'),E(50,35,12,9,'paleleaf'),E(22,15,12,9,'paleleaf',{b:.2}),E(42,15,12,9,'paleleaf',{b:.2}),E(32,9,9,6,'paleleaf',{b:.3}),
  E(31,62,1.3,.8,null,{flat:'#5a5a6a'}),E(33.5,54,1,.7,null,{flat:'#5a5a6a'}),E(30.5,48,1,.6,null,{flat:'#5a5a6a'}),E(33,70,1.2,.7,null,{flat:'#5a5a6a'})]));
ART.cart=()=>ART._cart||(ART._cart=sculpt(34,28,[Cp(4,19,0,22,1,'cartwood'),Pl([[3,10],[31,10],[29,20],[5,20]],'cartwood'),Cp(3,10,31,10,1,'cartwood',{b:.2}),
  E(11,8,5,4,'bone'),E(20,7.5,5.5,4.4,'bone'),E(16,4.5,4.4,3.4,'bone',{b:.15}),E(27,8.5,3.6,3,'bone'),
  E(9,22,4.6,4.6,'dark'),E(9,22,1.6,1.6,'cartwood'),E(26,22,4.6,4.6,'dark'),E(26,22,1.6,1.6,'cartwood')]));
ART.lakestone=()=>ART._ls||(ART._ls=sculpt(34,52,[E(17,49,15,3.2,'dark',{b:-.4}),Pl([[7,49],[9,12],[13,4],[21,3],[26,10],[28,49]],'lake'),
  Cp(18,10,16,22,.45,null,{flat:'#3a4250',noEdge:1}),Cp(16,22,19,33,.45,null,{flat:'#3a4250',noEdge:1}),Cp(19,33,17,44,.4,null,{flat:'#3a4250',noEdge:1}),
  E(14,20,1.6,1.2,null,{flat:'#e8fbff'}),E(22,28,1.4,1.1,null,{flat:'#e8fbff'}),E(13,36,1.3,1,null,{flat:'#e8fbff'})]));
ART.spike=()=>ART._sp||(ART._sp=sculpt(12,34,[Pl([[3,33],[5,4],[6,0],[7,4],[9,33]],'red',{b:.2}),Cp(6,6,6,30,.5,null,{flat:'#ffb0a0',noEdge:1})]));
ART.hollisF=()=>ART._hf||(ART._hf=MON.hollis(''));
ART.stagF=()=>ART._sf||(ART._sf=MON.stag('',.5));
const monCache=new Map();
function scaleParts(parts,k){if(k===1)return parts;return parts.map(p=>{const q={...p};for(const f of ['x','y','rx','ry','x1','y1','x2','y2','r','r2','cut','cutT'])if(q[f]!=null)q[f]*=k;if(q.pts)q.pts=q.pts.map(([x,y])=>[x*k,y*k]);return q})}
function monImg(kind,ramp){const k=kind+'|'+ramp;let c=monCache.get(k);if(!c){c=MON[kind](ramp);monCache.set(k,c)}return c}

/* ---------- tiny pixel digits for damage numbers ---------- */
const GLYPH={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111',
  'M':'101111111101101','I':'111010010010111','S':'111100111001111','+':'000010111010000','L':'100100100100111','V':'101101101101010','U':'101101101101111','P':'111101111100100','!':'010010010000010','Z':'111001010100111'};
function drawNum(g,s,x,y,col,ol='#0a0a14'){s=String(s);const w=s.length*4-1;let cx=Math.round(x-w/2);
  for(const ch of s){const gl=GLYPH[ch];if(gl){for(let pass=0;pass<2;pass++)for(let i=0;i<15;i++)if(gl[i]==='1'){const px=cx+i%3,py=y+(i/3|0);
    if(pass===0){g.fillStyle=ol;g.fillRect(px-1,py-1,3,3)}else{g.fillStyle=col;g.fillRect(px,py,1,1)}}}cx+=4}}

/* ---------- battle backdrops ---------- */
function backdrop(kind,w,h){const c=mk(w,h),g=c.getContext('2d');const r=rng(kind.length*97);
  const grad=(stops)=>{const gr=g.createLinearGradient(0,0,0,h);stops.forEach(([o,col])=>gr.addColorStop(o,col));g.fillStyle=gr;g.fillRect(0,0,w,h)};
  const band=(y,hh,col)=>{g.fillStyle=col;g.fillRect(0,y,w,hh)};
  const hy=Math.round(h*.34);h=Math.round(h);
  if(kind==='beach'){grad([[0,'#0b1640'],[.4,'#2a3f80'],[.42,'#1d3f8e'],[.55,'#2f7cc6'],[.56,'#e6d39d'],[1,'#c9b27a']]);for(let i=0;i<40;i++){g.fillStyle=i%5?'#c8d8ff':'#fff';g.fillRect(r()*w|0,r()*hy*.8|0,1,1)}
    for(let i=0;i<14;i++){g.fillStyle='#7fc0f0';g.fillRect(r()*w|0,hy+3+(r()*h*.12|0),4,1)}g.fillStyle='#f5e7bd';for(let i=0;i<30;i++)g.fillRect(r()*w|0,h*.58+r()*h*.42|0,1,1)}
  else if(kind==='cave'){grad([[0,'#141824'],[.5,'#262c3c'],[.55,'#3b414d'],[1,'#585f6e']]);g.fillStyle='#0c0f18';for(let i=0;i<9;i++){const x=r()*w,ww=6+r()*12,hh=8+r()*24;g.beginPath();g.moveTo(x-ww/2,0);g.lineTo(x+ww/2,0);g.lineTo(x,hh);g.fill()}
    for(let i=0;i<6;i++){const x=r()*w|0,y=h*.6+r()*h*.32|0,ww=10+r()*14|0;g.fillStyle='#2e4262';g.fillRect(x+2,y,ww-4,1);g.fillRect(x,y+1,ww,2);g.fillRect(x+2,y+3,ww-4,1);g.fillStyle='#6b93c6';g.fillRect(x+3,y+1,Math.max(2,ww/3|0),1)}}
  else if(kind==='sea'){grad([[0,'#0b1640'],[.35,'#2a3f80'],[.36,'#17337a'],[1,'#2f7cc6']]);for(let i=0;i<40;i++){g.fillStyle='#c8d8ff';g.fillRect(r()*w|0,r()*h*.3|0,1,1)}
    for(let y=hy;y<h;y+=4)for(let i=0;i<5;i++){g.fillStyle=y%8?'#4277c9':'#7fc0f0';g.fillRect(r()*w|0,y,3+r()*5|0,1)}}
  else if(kind==='seabed'){grad([[0,'#06122e'],[.5,'#123060'],[.56,'#5a6a5a'],[1,'#8f9a80']]);for(let i=0;i<14;i++){g.fillStyle='rgba(180,220,255,.25)';g.fillRect(r()*w|0,0,1+(r()*3|0),h*.5)}
    for(let i=0;i<8;i++){const x=r()*w|0;for(let y=0;y<16;y++){g.fillStyle=y%3?'#2c6a33':'#3f8a45';g.fillRect(x+(y%4<2?0:1),h*.56-y+8,1,1)}}}
  else if(kind==='coral'){grad([[0,'#200a24'],[.5,'#3a1838'],[.56,'#5a2a4a'],[1,'#8a3b5e']]);for(let i=0;i<20;i++){const x=r()*w,y=h*.5+r()*h*.1;g.fillStyle=['#e86f8f','#ff9eb0','#ffb36a'][i%3];g.fillRect(x,y-r()*14,2,14)}}
  else if(kind==='ruins'){grad([[0,'#081428'],[.5,'#1a3050'],[.56,'#46596b'],[1,'#5f7488']]);for(let i=0;i<5;i++){const x=10+i*34+r()*10;g.fillStyle='#2b3a4a';g.fillRect(x,h*.15,10,h*.4);g.fillStyle='#3d5068';g.fillRect(x,h*.15,3,h*.4)}
    for(let i=0;i<10;i++){g.fillStyle='rgba(190,230,255,.15)';g.fillRect(r()*w|0,0,2,h*.55)}}
  else if(kind==='light'){grad([[0,'#1a1430'],[.5,'#2a2440'],[.56,'#5b6372'],[1,'#7e889a']]);g.fillStyle='#3b414d';for(let x=0;x<w;x+=16){g.fillRect(x,0,1,h*.56)}g.fillStyle='rgba(255,230,150,.12)';g.beginPath();g.moveTo(w*.7,0);g.lineTo(w,0);g.lineTo(w*.4,h);g.lineTo(w*.1,h);g.fill()}
  else if(kind==='moon'){grad([[0,'#05060c'],[.5,'#1a2040'],[.56,'#9aa4bc'],[1,'#dce6f8']]);g.fillStyle='rgba(220,240,255,.5)';g.beginPath();g.arc(w*.5,h*.2,h*.5,0,Math.PI*2);g.fill();g.fillStyle='#dce6f8';g.beginPath();g.arc(w*.5,h*.2,h*.42,0,Math.PI*2);g.fill();
    g.strokeStyle='#454e68';g.lineWidth=2;for(let i=0;i<6;i++){g.beginPath();g.moveTo(w*.5,h*.2);g.lineTo(r()*w,h*.56);g.stroke()}}
  else if(kind==='town'){grad([[0,'#0b1640'],[.5,'#2a3f80'],[.56,'#5aa042'],[1,'#468530']])}
  else if(kind==='nighttown'){grad([[0,'#050816'],[.32,'#121a3a'],[.46,'#2a1a2e'],[.5,'#3a1e22'],[.52,'#2a2420'],[1,'#3a3028']]);
    for(let i=0;i<50;i++){g.fillStyle=i%4?'#8a9ad0':'#ffffff';g.fillRect(r()*w|0,r()*h*.36|0,1,1)}
    g.fillStyle='#f4f0d8';g.beginPath();g.arc(w*.78,h*.11,9,0,Math.PI*2);g.fill();g.fillStyle='#121a3a';g.beginPath();g.arc(w*.78+4,h*.11-2,8,0,Math.PI*2);g.fill();
    const gl=g.createRadialGradient(w*.35,h*.5,4,w*.35,h*.5,w*.6);gl.addColorStop(0,'rgba(255,110,40,.42)');gl.addColorStop(1,'rgba(255,110,40,0)');g.fillStyle=gl;g.fillRect(0,0,w,h);
    let x=-4;while(x<w){const bw=20+r()*18|0,bh=14+r()*12|0,y=Math.round(h*.52);g.fillStyle='#0c0a14';g.fillRect(x,y-bh,bw,bh);g.beginPath();g.moveTo(x-3,y-bh);g.lineTo(x+bw/2,y-bh-10);g.lineTo(x+bw+3,y-bh);g.fill();
      if(r()<.8){g.fillStyle=r()<.5?'#ffd77a':'#ff9a4a';g.fillRect(x+bw/2-2|0,y-bh+4|0,3,3)}x+=bw+3+(r()*6|0)}
    for(let i=0;i<30;i++){g.fillStyle=i%2?'#4a3e32':'#2e261e';g.fillRect(r()*w|0,h*.56+r()*h*.44|0,3,1)}
    for(let i=0;i<14;i++){g.fillStyle=i%2?'#ffb050':'#ff6a2a';g.fillRect(r()*w|0,h*.1+r()*h*.4|0,1,1)}}
  else if(kind==='lake'||kind==='lakered'){const red=kind==='lakered';grad([[0,'#9ab8d8'],[.34,'#d8e4ec'],[.4,'#6a8a7a'],[.44,'#4a6a5a'],[.46,red?'#6a4a5a':'#5a8aa8'],[.6,red?'#7a3a40':'#4a7a98'],[.62,'#4a6a3a'],[1,'#3a5a2a']]);
    g.fillStyle='#5a7a6a';for(let x=0;x<w;x+=2){const hh=Math.sin(x*.05)*6+Math.sin(x*.13)*3+10;g.fillRect(x,Math.round(h*.4-hh),2,Math.ceil(hh))}
    for(let i=0;i<30;i++){g.fillStyle=i%2?'rgba(255,255,255,.5)':(red?'rgba(255,120,110,.4)':'rgba(200,230,255,.5)');g.fillRect(r()*w|0,h*.47+r()*h*.12|0,3+(r()*5|0),1)}
    for(let i=0;i<40;i++){const x=r()*w|0,hh=4+(r()*10|0);g.fillStyle=i%2?'#5a8a3a':'#3e6a2a';g.fillRect(x,Math.round(h*.64-hh+r()*h*.3),1,hh)}}
  else if(kind==='forest'){grad([[0,'#dfe8e4'],[.4,'#9cb8a8'],[.52,'#5a7a5c'],[1,'#3a5a3a']]);
    for(let i=0;i<9;i++){const x=r()*w,ww=6+r()*8;g.fillStyle='rgba(40,60,46,.55)';g.fillRect(x,0,ww,h*.56)}
    for(let i=0;i<40;i++){g.fillStyle='rgba(255,255,255,.6)';g.fillRect(r()*w|0,r()*h|0,1,1)}}
  else if(kind==='cliff'){grad([[0,'#3a6ab8'],[.3,'#8ab8e8'],[.36,'#cfe6f8'],[.37,'#2f74c0'],[.47,'#2462aa'],[.48,'#5a9a44'],[1,'#3a7a2c']]);
    g.fillStyle='#e8f4ff';for(let i=0;i<16;i++)g.fillRect(r()*w|0,h*.38+r()*h*.08|0,3+r()*4|0,1);
    for(let i=0;i<5;i++){const x=i*13-6+r()*6,y=h*.48;g.fillStyle='#24502a';g.beginPath();g.moveTo(x,y);g.lineTo(x+8,y-26-r()*10);g.lineTo(x+16,y);g.fill();g.fillStyle='#2f6a34';g.beginPath();g.moveTo(x+3,y);g.lineTo(x+8,y-18-r()*8);g.lineTo(x+13,y);g.fill()}
    for(let i=0;i<40;i++){g.fillStyle=i%3?'#4f8f3a':'#7ab85a';g.fillRect(r()*w|0,h*.5+r()*h*.5|0,1,2)}}
  else if(kind==='hollow'){grad([[0,'#12060a'],[.45,'#2a0c14'],[.52,'#3a1418'],[1,'#22100e']]);
    for(let i=0;i<7;i++){const x=r()*w,ww=3+r()*3;g.fillStyle='#08030a';g.fillRect(x,0,ww,h*.52)}
    const gr=g.createRadialGradient(w/2,h*.5,4,w/2,h*.5,w*.7);gr.addColorStop(0,'rgba(255,40,60,.35)');gr.addColorStop(1,'rgba(255,40,60,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)}
  return c}
const bdCache=new Map();
function backdropImg(kind,w,h){const k=kind+w+'x'+h;let c=bdCache.get(k);if(!c){c=backdrop(kind,w,h);bdCache.set(k,c)}return c}

/* ---------- the hero up close, for battle: a sculpted, shaded figure about twice the size of the map sprite,
   facing left in a fighting stance with both hands on the sword. Built from the hero's own colors and hair
   style, so a customized hero looks the same here. Poses: idle (guard), raise (wind-up), strike (follow-through). ---------- */
const BIG={W:58,H:62,ox:20,oy:12};
const rampOf=c=>[shade(c,-.62),shade(c,-.3),c,shade(c,.3)];
const bigCache=new Map();
function heroBig(look,pose='idle'){const key=look.id+'|'+pose;let c=bigCache.get(key);if(c)return c;
  const O=BIG.ox,Y=BIG.oy,X=(x)=>x+O,YY=y=>y+Y;
  const hair=rampOf(look.hair),skin=rampOf(look.skin),top=rampOf(look.top),acc=rampOf(look.acc||shade(look.top,.35)),bot=rampOf(look.bot||'#3a3f5a'),boot=rampOf(look.boot||'#3a2a22');
  const hwc=rampOf(look.hwc||look.acc||'#a83a2a'),hilt=rampOf(look.hilt||'#e0b040'),capeR=look.cape?rampOf(look.cape):null,shirt=rampOf('#e6dcc8');
  const ls=look.style||[];const st=look.bstyle||(['spiky','long','pony','bun','bald','mohawk','messy','braid','twin','curly','swept'].find(k=>ls.includes(k))||'short');
  const hw=look.hw||'none',face=look.face||'none',os=look.ostyle||'tunic';
  const P={idle:{h:[10.5,26.5],a:-112},raise:{h:[19.5,2.5],a:-32},strike:{h:[6.5,24.5],a:168}}[pose]||{h:[10.5,26.5],a:-112};
  const d=[Math.cos(P.a*Math.PI/180),Math.sin(P.a*Math.PI/180)],n=[-d[1],d[0]];
  const H1=P.h,H2=[H1[0]-d[0]*2.6,H1[1]-d[1]*2.6],G=[H1[0]+d[0]*2.4,H1[1]+d[1]*2.4],BL=look.blade==='knives'?9:look.blade==='fork'?21:22,T=[G[0]+d[0]*BL,G[1]+d[1]*BL],PM=[H2[0]-d[0]*2.2,H2[1]-d[1]*2.2];
  const FS=[13,19.5],BS=[19.5,19.8];
  const elbow=(s,h,k)=>{const m=[(s[0]+h[0])/2,(s[1]+h[1])/2],dx=h[0]-s[0],dy=h[1]-s[1],L=Math.hypot(dx,dy)||1;return[m[0]-dy/L*k,m[1]+dx/L*k]};
  const EF=elbow(FS,H1,-2.6),EB=elbow(BS,H2,-2.4);
  const pt=([x,y])=>[X(x),YY(y)],cp=(a,b,r,m,o)=>Cp(X(a[0]),YY(a[1]),X(b[0]),YY(b[1]),r,m,o),e=(x,y,rx,ry,m,o)=>E(X(x),YY(y),rx,ry,m,o),pl=(pts,m,o)=>Pl(pts.map(pt),m,o),fl=c=>({flat:c,noEdge:1});
  const parts=[];
  // behind everything: the cape, long hair, ponytail, twin tail, braid
  if(capeR)parts.push(pl([[12.4,17.6],[21.6,17.6],[29,44],[22,45.5],[15.5,44]],capeR));
  if(st==='long')parts.push(cp([19.5,8],[21.5,25],3.6,hair,{r2:2.8}));
  if(st==='pony')parts.push(cp([21.5,7],[27,18.5],1.9,hair,{r2:1.1}));
  if(st==='twin')parts.push(cp([21.4,7.5],[25.6,19.5],2,hair,{r2:1.3}));
  if(st==='braid')for(let i=0;i<6;i++)parts.push(e(21.2+i*.25,11+i*2.6,1.6,1.5,hair));
  if(hw==='hood')parts.push(e(17,9.6,7.2,7.6,hwc));
  // back leg and back arm
  parts.push(cp([20,32],[22.6,39.6],2.7,bot),cp([22.6,39.6],[24.4,45.4],2.3,bot),e(25,46.6,3.6,1.8,boot));
  if(os==='coat')parts.push(pl([[11.4,30],[23,30],[25.4,41.5],[18.6,40],[12.6,41.5],[10.6,40]],top));
  parts.push(cp(BS,EB,2.3,top),cp(EB,H2,2,top));
  // body
  if(os==='vest')parts.push(pl([[11.5,17.4],[21,17.4],[22.6,31],[11,31]],shirt),pl([[11.5,17.4],[13.6,17.4],[14.2,31],[11,31]],top),pl([[17.6,17.4],[21,17.4],[22.6,31],[17,31]],top));
  else parts.push(pl([[11.5,17.4],[21,17.4],[22.6,31],[11,31]],top));
  if(os==='armor')parts.push(pl([[12,18.4],[20.6,18.4],[21.4,28.6],[16.4,30],[11.6,28.6]],'steel'),cp([13,22],[20.4,22],.45,null,fl('#ffffff')));
  else if(os!=='vest')parts.push(cp([13.6,17.6],[15.6,20.6],.7,acc),cp([17.6,17.6],[15.6,20.6],.7,acc));
  if(os==='coat')parts.push(cp([13.4,17.8],[12.4,29.6],.7,acc));
  parts.push(pl([[11,31],[22.6,31],[22.2,34.4],[11.4,34.4]],bot),cp([11,30.4],[22.6,30.4],1.3,acc),e(13.2,30.4,1.2,1.1,hilt));
  parts.push(cp([14,32.4],[10.6,39.6],2.8,bot),cp([10.6,39.6],[9,45.4],2.4,bot),e(8.4,46.6,3.9,1.9,boot));
  // head
  parts.push(cp([16,13.8],[16.6,17.6],1.7,skin),e(15.5,9.6,5.3,5.8,skin),e(10.4,10.7,1.05,1,skin),e(18.7,10.4,1.1,1.6,skin));
  if(face==='beard')parts.push(pl([[10.4,11.4],[18.6,9.6],[19,13],[15.6,16.2],[11.6,15.4]],hair),e(11.6,13.1,1,.5,null,fl(shade(look.skin,-.45))));
  const capOn=!['hood','cap','helmet','bandana'].includes(hw);
  if(st==='bald'||st==='mohawk')parts.push(e(19.4,8.6,1.6,1.1,hair));
  else if(st==='curly')parts.push(e(16.4,6.6,7.2,5.6,hair,{cut:2.4}),e(20,10.4,3.4,4.8,hair),e(10.8,5.6,2.2,2.2,hair),e(14.4,1.8,2.4,2.2,hair),e(19,2.6,2.6,2.3,hair),e(22.4,6.4,2.4,2.4,hair));
  else if(capOn||hw==='bandana'||hw==='cap')parts.push(e(16.2,7.1,6,4.6,hair,{cut:1.2}),e(19.6,9.8,2.7,4.1,hair),pl([[10,7.6],[13,4.4],[15.2,7],[12.4,8.8]],hair));
  if(st==='mohawk')parts.push(pl([[12.2,5.2],[12.8,-.6],[15.4,3.4]],hair),pl([[14.8,3.2],[17,-2.6],[18.6,3.6]],hair),pl([[18,4],[21.6,.2],[21,6.8]],hair),cp([12.6,4.6],[20.6,5.4],1.3,hair));
  if(st==='spiky'&&capOn)parts.push(pl([[10.6,5.4],[11,-1.6],[15,3.4]],hair),pl([[13.6,3.2],[16.8,-3.4],[18.6,3]],hair),pl([[17.4,3.4],[22.8,-1.4],[21.2,5.6]],hair),
    pl([[20,6],[25.8,3.4],[22,9.2]],hair),pl([[21,9],[25.4,9.6],[21.6,12.4]],hair));
  if(st==='messy'&&capOn)parts.push(pl([[11,5],[11.4,1.4],[13.8,3.8]],hair),pl([[14.4,3],[15.4,-.4],[17.2,3]],hair),pl([[17.6,3.6],[20.6,1.2],[20.2,5]],hair),pl([[20.6,6.4],[23.6,5.6],[21.4,8.6]],hair),pl([[9.6,8],[9.4,10.8],[11.6,8.6]],hair));
  if(st==='swept'&&capOn)parts.push(pl([[9.6,6.4],[15.6,3.8],[14.2,9.2],[10.6,9.8]],hair));
  if(st==='bun'&&capOn)parts.push(e(19.6,3.4,2.9,2.9,hair));
  if(st==='pony')parts.push(e(21.6,7.6,1.05,1.05,acc));
  if(st==='twin')parts.push(e(21.4,7.6,1,1,acc),cp([18.6,10.4],[19.4,20.4],1.7,hair,{r2:1.1}),e(18.7,10.6,.95,.95,acc));
  // headwear over the hair
  if(hw==='headband')parts.push(cp([10.2,6.6],[21,7.4],1.05,hwc),cp([21,7.4],[24.6,10.8],.75,hwc),cp([21,7.6],[23.6,12.2],.7,hwc));
  if(hw==='bandana')parts.push(e(16.2,6.8,6.3,4.4,hwc,{cut:1.6}),pl([[21,6.6],[25.6,8.6],[22.4,10.4]],hwc),pl([[21.2,7.8],[24.4,12.8],[21.6,11.6]],hwc));
  if(hw==='hood')parts.push(e(16.6,7,6.6,4.8,hwc,{cut:1.4}),cp([20,7],[21.6,15],2.4,hwc),cp([11.4,16.6],[20.6,16.4],1.6,hwc));
  if(hw==='cap')parts.push(e(16.4,6.8,6.1,4.5,hwc,{cut:1.2}),pl([[8.2,7.8],[12.8,6.2],[13,8.2],[8.8,8.9]],hwc),e(16.6,2.6,1,.8,hwc));
  if(hw==='helmet')parts.push(e(16.2,7.4,6.5,5.2,'steel',{cut:1.6}),cp([10.6,8.2],[21.6,8.4],.9,'steel'),cp([12.2,7.6],[12,11.6],.6,'steel'),cp([14,2.6],[20.6,4.4],.5,null,fl('#ffffff')));
  // the face
  parts.push(e(12.2,9.5,.8,1.1,null,fl(look.eye||'#1a1424')),e(11.6,9.1,.35,.4,null,fl('#ffffff')),cp([11.2,7.5],[13.6,7.2],.45,null,fl(shade(st==='bald'||st==='mohawk'?look.skin:look.hair,-.45))));
  if(face==='mustache')parts.push(cp([10.4,12.2],[13.2,12.4],.6,null,fl(shade(look.hair,-.2))));
  if(face==='stubble')for(const [x,y] of [[11,13.6],[12.6,14.4],[14.4,14.6],[13.4,13.4],[16,14.4]])parts.push(e(x,y,.32,.32,null,fl(shade(look.skin,-.4))));
  if(face!=='beard')parts.push(e(11.4,13.1,.85,.38,null,fl(shade(look.skin,-.45))));
  // a second, reversed knife in the back hand
  if(look.blade==='knives'){const a2=(P.a+118)*Math.PI/180,d2=[Math.cos(a2),Math.sin(a2)],n2=[-d2[1],d2[0]],g2=[H2[0]+d2[0]*1.8,H2[1]+d2[1]*1.8],t2=[g2[0]+d2[0]*8,g2[1]+d2[1]*8];
    parts.push(pl([[g2[0]+n2[0]*.9,g2[1]+n2[1]*.9],[t2[0]+n2[0]*.3,t2[1]+n2[1]*.3],[t2[0]+d2[0]*1,t2[1]+d2[1]*1],[t2[0]-n2[0]*.3,t2[1]-n2[1]*.3],[g2[0]-n2[0]*.9,g2[1]-n2[1]*.9]],'steel'),
      cp([g2[0]+n2[0]*2,g2[1]+n2[1]*2],[g2[0]-n2[0]*2,g2[1]-n2[1]*2],.8,hilt))}
  // the sword (or a pitchfork), then the front arm and both hands over the grip
  if(look.blade==='fork'){const B0=[PM[0]-d[0]*3,PM[1]-d[1]*3];
    parts.push(cp(B0,T,.78,hilt),cp([T[0]+n[0]*1.9,T[1]+n[1]*1.9],[T[0]-n[0]*1.9,T[1]-n[1]*1.9],.5,'steel'));
    for(const k of [-1.7,0,1.7])parts.push(cp([T[0]+n[0]*k,T[1]+n[1]*k],[T[0]+n[0]*k+d[0]*5.4,T[1]+n[1]*k+d[1]*5.4],.42,'steel',{r2:.2}));
    parts.push(e(PM[0],PM[1],.01,.01,hilt));}
  else parts.push(pl([[G[0]+n[0]*1,G[1]+n[1]*1],[T[0]+n[0]*.35,T[1]+n[1]*.35],[T[0]+d[0]*1.2,T[1]+d[1]*1.2],[T[0]-n[0]*.35,T[1]-n[1]*.35],[G[0]-n[0]*1,G[1]-n[1]*1]],'steel'),
    cp([G[0]+d[0]*2.5,G[1]+d[1]*2.5],[T[0]-d[0]*2.5,T[1]-d[1]*2.5],.28,null,fl('#ffffff')),
    cp([G[0]+n[0]*3.2,G[1]+n[1]*3.2],[G[0]-n[0]*3.2,G[1]-n[1]*3.2],1.05,hilt),cp(G,PM,.95,'leather'),e(PM[0],PM[1],1.25,1.25,hilt));
  parts.push(
    cp(FS,EF,2.5,top),cp(EF,H1,2.2,top),e(FS[0],FS[1]+.4,2.9,2.4,os==='armor'?'steel':acc),e(H2[0],H2[1],2.1,2,skin),e(H1[0],H1[1],2.25,2.1,skin));
  c=sculpt(BIG.W,BIG.H,parts);bigCache.set(key,c);return c}
const hasBig=()=>false;

/* ===================== STRIKE AT NIGHT, the second telling: art =====================
   A city street in 2026, the farm village of Larkfield, the Crows' camp, and the people and foes of the new story. */

/* ---------- the city, 2026 ---------- */
function asphalt(g,seed=1){RF(g,0,0,16,16,'#2a2c33');const r=rng(seed*13+5);
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=Math.sin(x*.9+seed)+Math.cos(y*1.1+seed*2);if(v>1.3&&dth(x,y,6))P(g,x,y,'#33363e');else if(v<-1.3&&dth(x,y,6))P(g,x,y,'#24262c')}
  for(let i=0;i<9;i++)P(g,r()*16|0,r()*16|0,i%3?'#3a3d46':'#1e2026');
  if(r()<.5){const x=r()*12|0,y=r()*13|0;RF(g,x,y,4,1,'#3a4658');P(g,x+1,y,'#56657c')}}   // a wet sheen
function sidewalk(g,seed=2){RF(g,0,0,16,16,'#7a7e88');RF(g,0,0,16,1,'#8e929c');RF(g,0,7,16,1,'#5e626c');RF(g,0,8,16,1,'#8e929c');RF(g,7,0,1,7,'#5e626c');RF(g,15,8,1,8,'#5e626c');
  speck(g,seed,7,['#6a6e78','#888c96','#6a6e78'])}
function cityWall(g,win,seed=3){RF(g,0,0,16,16,'#2e3242');RF(g,0,0,1,16,'#3a3f52');RF(g,15,0,1,16,'#22252f');speck(g,seed,5,['#353a4c','#262a38']);
  if(win){RF(g,2,2,12,11,'#141826');RF(g,3,3,10,9,win);RF(g,3,3,10,1,shade(win,.3));RF(g,8,3,1,9,'#141826');RF(g,3,7,10,1,'#141826');P(g,4,4,'#ffffff')}
  RF(g,0,14,16,2,'#1e2130')}
function streetlight(g){sidewalk(g,9);RF(g,7,3,2,12,'#1e2028');RF(g,7,3,1,12,'#3a3d48');RF(g,6,13,4,2,'#1e2028');RF(g,4,0,8,3,'#1e2028');RF(g,5,2,6,1,'#fff2c8');RF(g,6,1,4,1,'#ffe6a0')}
function signal(g,f){sidewalk(g,11);RF(g,7,6,2,9,'#1e2028');RF(g,6,14,4,1,'#1e2028');RF(g,4,0,8,7,'#14161c');RF(g,5,1,6,5,'#22252e');
  // the walking figure, lit white
  const c=f%2?'#ffffff':'#e8f0ff';P(g,8,1,c);RF(g,7,2,2,2,c);P(g,6,3,c);P(g,9,3,c);P(g,7,4,c);P(g,9,5,c);P(g,6,5,c)}
function trashbin(g){sidewalk(g,13);RF(g,4,5,8,10,'#1e3a2a');RF(g,4,5,2,10,'#2e5a3e');RF(g,3,4,10,2,'#2a4a36');RF(g,3,4,10,1,'#4a7a5a');RF(g,4,14,8,1,'#10201a')}
function glassDoor(g){cityWall(g,null,21);RF(g,2,2,12,14,'#1a1e2a');RF(g,3,3,10,13,'#8aa8c8');RF(g,8,3,1,13,'#1a1e2a');RF(g,3,3,4,13,'#a8c4e0');RF(g,3,3,10,1,'#d8e8ff');
  for(let y=4;y<15;y+=3)P(g,4+(y%4),y,'#e8f4ff');RF(g,6,9,1,2,'#c8ccd8');RF(g,9,9,1,2,'#c8ccd8')}
function crosswalk(g,seed){asphalt(g,seed);for(const y of [1,7,13]){RF(g,1,y,14,3,'#d8dbe2');RF(g,1,y,14,1,'#eceef2');speck(g,seed+y,3,['#a8acb4'],[1,y,14,3])}}
function laneLine(g,seed){asphalt(g,seed);RF(g,2,7,7,2,'#d8a83a');RF(g,2,7,7,1,'#f0c85a')}

/* ---------- Larkfield ---------- */
function wheat(g,f){dirt(g,46);const r=rng(48);
  for(let i=0;i<14;i++){const x=1+(i*7+3)%14,y=2+(i*5)%11,sw=(f+i)%4<2?0:1;RF(g,x+sw,y,1,5,i%2?'#c8a040':'#a88430');RF(g,x+sw-1,y-1,3,2,i%3?'#f0d070':'#e0b850');P(g,x+sw,y-2,'#fff0a0')}}
function tilled(g){dirt(g,52);for(let y=1;y<16;y+=4){RF(g,0,y,16,1,'#7e5e36');RF(g,0,y+1,16,1,'#cdaa74')}speck(g,53,4,['#5aa042','#468530'])}
function haystack(g){grass(g,57);blobN(g,8,9,7,6,['#7a5a1e','#a8842e','#d8b450','#f4dc84'],'#3a2a10');for(let i=0;i<8;i++)P(g,3+(i*5)%10,6+(i*3)%6,'#7a5a1e')}
function barrel(g){dirt(g,59);blobN(g,8,9,5,6,['#4a2e18','#7a4e2a','#a8743f','#c48d55'],C.ol);RF(g,3,6,10,1,'#3a3440');RF(g,3,12,10,1,'#3a3440')}
function hearth(g,f){planks(g);RF(g,1,1,14,14,'#5b6372');RF(g,1,1,14,2,'#7e889a');RF(g,0,0,16,1,C.ol);bricks(g,'#5b6372','#3b414d','#7e889a');RF(g,3,6,10,9,'#14101a');
  const fl=[['#ffe8a0','#ffb040','#ff6a1a'],['#fff2c0','#ffc050','#ff7a20']][f%2];const H=[[4,6,5],[5,4,6],[6,5,4],[4,5,6]][f%4];
  for(let i=0;i<3;i++){const x=5+i*2,h=H[i];RF(g,x,14-h,2,h,fl[2]);RF(g,x,15-h,2,Math.max(1,h-3),fl[1]);P(g,x,16-h,fl[0])}RF(g,4,13,8,2,'#3a2418')}
function basin(g){planks(g);RF(g,3,6,10,9,'#6b4426');RF(g,3,6,10,1,'#9a6b3d');RF(g,4,14,2,2,'#3a2412');RF(g,10,14,2,2,'#3a2412');
  blobN(g,8,6,5,3,['#8a8e98','#b0b4bc','#d8dce4','#f4f6f8'],C.ol);RF(g,5,5,6,2,'#4a7ab0');RF(g,6,5,3,1,'#9cc6e0')}
function rug(g){RF(g,0,0,16,16,'#8e3e2c');for(let y=0;y<16;y+=4){RF(g,0,y,16,1,'#b0603a');RF(g,0,y+2,16,1,'#6e2c20')}
  for(let y=1;y<16;y+=4)for(let x=(y%8<4?0:2);x<16;x+=4)P(g,x,y,'#e0a858');speck(g,77,5,['#7a3424','#b8683e'])}
function bush(g){grass(g,63);blobN(g,8,9,7,6,['#123a1c','#1f5226','#2e6c2c','#418a36','#62aa48'],'#0e1a12');P(g,5,6,'#9ad86e');P(g,10,8,'#9ad86e');P(g,7,11,'#c84a4a');P(g,11,5,'#c84a4a')}
function logSeat(g){dirt(g,65);blobN(g,8,10,7,3,['#3a2412','#5a3a1f','#7e5530','#a8743f'],C.ol);blobN(g,13,10,2,2,['#a8743f','#c8965a','#e0b678','#f0d0a0'],C.ol)}
function stall(g){dirt(g,67);RF(g,1,8,14,7,'#6b4426');RF(g,1,8,14,1,'#9a6b3d');for(let x=0;x<16;x+=4){RF(g,x,1,2,6,'#c83a3a');RF(g,x+2,1,2,6,'#f0e8d8')}RF(g,0,6,16,1,C.ol);
  RF(g,3,9,3,3,'#e0a030');RF(g,8,9,2,3,'#5aa042');RF(g,11,9,3,3,'#c84a4a')}
function bars(g){stoneFloor(g,69);for(let x=1;x<16;x+=3){RF(g,x,0,2,16,'#4a4e5a');RF(g,x,0,1,16,'#8a90a0')}RF(g,0,2,16,2,'#4a4e5a');RF(g,0,12,16,2,'#4a4e5a')}
function campDirt(g){dirt(g,71);speck(g,72,6,['#8e6c40','#d4b582','#5a3a1f'])}

(function(){const T=(ch,o)=>{TILE[ch]=o};
  T('0',{paint:g=>asphalt(g,1)});
  T('1',{paint:g=>laneLine(g,3)});
  T('2',{paint:g=>crosswalk(g,5)});
  T('3',{paint:g=>sidewalk(g,2)});
  T('4',{paint:g=>{sidewalk(g,6);RF(g,0,13,16,3,'#4a4e58');RF(g,0,13,16,1,'#a8acb6');RF(g,0,15,16,1,'#22242a')}});
  T('5',{paint:g=>{sidewalk(g,7);RF(g,0,0,16,3,'#4a4e58');RF(g,0,2,16,1,'#a8acb6');RF(g,0,0,16,1,'#22242a')}});
  T('6',{paint:g=>cityWall(g,'#cfe0f4',8),solid:1,lamp:{r:16,c:'rgba(200,225,255,.4)'}});
  T('$',{paint:g=>cityWall(g,'#ffd98a',12),solid:1,lamp:{r:16,c:'rgba(255,210,130,.45)'}});
  T('7',{paint:g=>cityWall(g,null,10),solid:1});
  T('8',{paint:glassDoor,solid:1,lamp:{r:22,c:'rgba(210,230,255,.55)'}});
  T('9',{paint:streetlight,solid:1,lamp:{r:52,c:'rgba(255,225,160,.62)',dy:-6}});
  T('!',{paint:signal,anim:2,solid:1,lamp:{r:14,c:'rgba(240,245,255,.5)',dy:-5}});
  T('@',{paint:trashbin,solid:1});
  // Larkfield and the road
  T('G',{paint:wheat,anim:4,solid:1});
  T('I',{paint:tilled});
  T('%',{paint:haystack,solid:1});
  T('(',{paint:barrel,solid:1});
  T('H',{paint:hearth,anim:4,solid:1,fire:1});
  T('?',{paint:basin,solid:1});
  T(':',{paint:rug});
  T('}',{paint:bush,solid:1});
  T('>',{paint:logSeat,solid:1});
  T(')',{paint:stall,solid:1});
  T(']',{paint:bars,solid:1});
  T('-',{paint:g=>campDirt(g)});
  T('<',{paint:g=>campDirt(g),solid:1});   // under a tent
})();

/* ---------- props, drawn big ---------- */
RAMPS.canvas=['#4a3a24','#7a6440','#a8905e','#d8c08a'];RAMPS.canvasR=['#3a1a1a','#6a2a26','#9a4a3a','#c8786a'];RAMPS.carblue=['#101c3a','#1e3a6e','#3a64a8','#8ab0e8'];
RAMPS.watch=['#141c34','#26365e','#3e5490','#7a90c8'];RAMPS.toll=['#2a0a0e','#5a141c','#8a2430','#c8584a'];RAMPS.sarge=['#2a1a08','#5a3a14','#8a5a20','#d8a040'];
RAMPS.road=['#14240e','#2a4a1e','#46703a','#7ea86a'];RAMPS.xbow=['#22160e','#4a3020','#7a5434','#b08458'];RAMPS.keep=['#1a1a22','#34343e','#585866','#9a9aaa'];
RAMPS.roadwolf=['#3a2e24','#6a5848','#a08a74','#d8c8b4'];RAMPS.hound=['#141014','#2e2628','#4e4244','#8a7a78'];RAMPS.boar=['#2a1a12','#4e3424','#7a5a40','#b08a6a'];
RAMPS.plume=['#4a0a10','#8a1820','#c83a3a','#ff8a7a'];RAMPS.hide=['#2e2418','#5a4830','#8a7450','#c0a880'];
/* a car from 2026, side view, nose to the right, headlights on */
ART.car=()=>ART._car||(ART._car=(()=>{const c=mk(46,22),g=c.getContext('2d');const o='#0a0c12';
  RF(g,2,9,42,8,o);RF(g,11,3,22,7,o);RF(g,3,10,40,6,'#3a64a8');RF(g,3,10,40,2,'#6a94d8');RF(g,12,4,20,6,'#3a64a8');RF(g,12,4,20,1,'#8ab0e8');
  RF(g,14,5,7,4,'#9ad0f0');RF(g,22,5,8,4,'#7ab8e0');RF(g,14,5,7,1,'#e0f4ff');RF(g,21,5,1,5,o);
  RF(g,3,14,40,2,'#1e3a6e');RF(g,42,11,2,3,'#fff6c8');RF(g,2,11,2,2,'#c83a3a');RF(g,18,11,1,3,'#1e3a6e');RF(g,28,11,1,3,'#1e3a6e');
  for(const x of [11,35]){RF(g,x-4,15,9,7,o);RF(g,x-3,16,7,5,'#2a2a30');RF(g,x-1,17,3,3,'#8a8e98')}return c})());
/* a canvas tent: the Crows sleep in these */
ART.tent=(red)=>{const k=red?'_tentR':'_tent';return ART[k]||(ART[k]=sculpt(36,30,[Pl([[2,28],[18,3],[34,28]],red?'canvasR':'canvas'),Pl([[13,28],[18,12],[23,28]],'dark',{b:-.4}),Cp(18,1,18,6,.7,'cartwood'),
  Cp(2,28,34,28,.6,'cartwood'),E(6,28,1,1,null,{flat:'#3a2412'}),E(30,28,1,1,null,{flat:'#3a2412'})]))};
/* the Baron's tax wagon: a covered cart with a red seal */
ART.wagon=()=>ART._wagon||(ART._wagon=sculpt(44,34,[Cp(4,24,0,27,1,'cartwood'),Pl([[4,14],[40,14],[38,25],[6,25]],'cartwood'),E(22,13,18,10,'canvas',{cut:1}),Cp(5,14,39,14,1,'cartwood',{b:.2}),
  E(22,10,4,4,'toll'),E(22,10,2,2,null,{flat:'#ffd77a'}),E(11,27,5,5,'dark'),E(11,27,1.8,1.8,'cartwood'),E(33,27,5,5,'dark'),E(33,27,1.8,1.8,'cartwood')]));

/* ---------- foes ---------- */
Object.assign(MON,{
  /* a spearman in a helmet and a tabard of his master's color; the crossbowman carries a crossbow instead */
  guard(m){const xb=m==='xbow';const parts=[Cp(12,26,11,35,2.3,'leather'),Cp(18,26,19,35,2.3,'leather'),E(10.5,35.5,3.2,1.6,'dark'),E(19.5,35.5,3.2,1.6,'dark'),
    Pl([[8,14],[22,14],[24,29],[6,29]],'steel'),Pl([[11,15],[19,15],[20,29],[10,29]],m),Cp(7,24,23,24,1.1,'leather'),
    Cp(8,16,4,24,2.2,'steel'),Cp(22,16,25.5,23,2.2,'steel'),E(4,25.5,1.9,1.9,'skin'),E(25.5,24,1.9,1.9,'skin')];
    if(xb)parts.push(Cp(9,21,23,17,1,'cartwood'),Cp(13,15,16,24,.7,'steel'),E(23,17,1,1,null,{flat:'#e8eef8'}));
    else parts.push(Cp(26.5,30,27.5,3,.75,'cartwood'),Pl([[26,4],[27.5,-1],[29,4],[27.5,6]],'steel'));
    parts.push(E(15,9,4.6,5.2,'skin'),E(15,6.4,5.6,4.4,'steel',{cut:1}),Cp(9.6,8,20.4,8,1,'steel'),Cp(15,1.5,15,4,.6,m),
      E(13.2,9.8,.9,.8,null,{flat:'#100a18'}),E(16.8,9.8,.9,.8,null,{flat:'#100a18'}),Cp(13.4,12.6,16.6,12.6,.4,null,{flat:'#6a3a2a',noEdge:1}));
    return sculpt(30,38,parts)},
  /* Garrick the Hound: a big man in a wide hat and a fur mantle, a crossbow on his shoulder */
  hunter(){return sculpt(46,56,[
    Cp(18,38,17,52,3,'leather'),Cp(27,38,28,52,3,'leather'),E(16.5,53,4,1.8,'dark'),E(28.5,53,4,1.8,'dark'),
    Pl([[11,18],[35,18],[38,46],[8,46]],'hide'),Pl([[19,19],[27,19],[26,40],[20,40]],'leather'),Cp(10,35,36,35,1.3,'dark'),E(30,35,1.6,1.6,'gold'),
    Cp(12,21,6,36,3,'hide'),E(6,37.5,2.4,2.4,'skin'),Cp(34,21,38,30,3,'hide'),E(38,31,2.4,2.4,'skin'),
    Cp(5,34,9,26,.8,'steel'),
    E(23,20,13,5.5,'fur',{b:.15}),E(14,21,5,4,'fur'),E(32,21,5,4,'fur'),
    E(23,12,5.2,5.6,'skin'),Pl([[17.4,13.5],[28.6,13.5],[27.4,18.4],[23,20.2],[18.6,18.4]],'fur'),
    E(23,6.6,13,2.6,'dark',{b:-.1}),E(23,4.6,6.4,4.2,'dark',{cut:1.6}),Cp(16.6,6.2,29.4,6.2,.7,'red'),
    E(21,11.8,.9,.8,null,{flat:'#100a18'}),E(25,11.8,.9,.8,null,{flat:'#100a18'}),
    Cp(30,26,44,6,1.1,'cartwood'),Cp(38,9,44,14,.9,'steel'),Cp(41,3,45,8,.6,'steel'),Cp(37,15,43,5,.4,null,{flat:'#d8d0c0',noEdge:1})])},
  /* Sir Kell: full plate, a great helm with a red plume, a tower shield and a mace */
  ironknight(){return sculpt(54,62,[
    Cp(21,42,20,57,3.6,'steel'),Cp(32,42,33,57,3.6,'steel'),E(19.5,58,4.6,2.2,'darksteel'),E(33.5,58,4.6,2.2,'darksteel'),
    Pl([[15,20],[39,20],[40,46],[14,46]],'steel'),Pl([[21,22],[33,22],[32,46],[22,46]],'toll'),E(27,30,3,3,null,{flat:'#ffd77a'}),Cp(14,40,40,40,1.4,'darksteel'),
    E(15.5,21.5,6,4.6,'steel'),E(38.5,21.5,6,4.6,'steel'),
    Cp(38,24,44,32,3.2,'steel'),E(44,33,2.8,2.8,'darksteel'),Cp(44,33,47,10,1.1,'cartwood'),E(47,8,4.2,4.2,'darksteel'),
    Pl([[45,4],[47,1],[49,4]],'steel'),Pl([[51,7],[54,8],[51,10]],'steel'),Pl([[43,7],[40,8],[43,10]],'steel'),
    E(27,12.5,6.6,7,'steel'),Cp(21.6,12,32.4,12,.7,null,{flat:'#0a0a14',noEdge:1}),Cp(27,13,27,18,.5,null,{flat:'#0a0a14',noEdge:1}),
    Cp(27,6,22,-1,2,'plume',{r2:1.2}),Cp(22,-1,16,3,1.2,'plume',{r2:.7}),
    Pl([[1,22],[15,20],[16,48],[8,54],[0,48]],'steel',{b:.1}),Pl([[4,26],[12,25],[13,46],[8,50],[3,46]],'toll'),Cp(8,30,8,44,.8,null,{flat:'#ffd77a',noEdge:1}),Cp(5,36,11,36,.8,null,{flat:'#ffd77a',noEdge:1})])},
  boar(m){return sculpt(42,28,[
    Cp(11,18,10,26,2.2,m,{r2:1.6,b:-.3}),Cp(29,18,30,26,2.2,m,{r2:1.6,b:-.3}),E(10,26.5,2.4,1,'dark'),E(30,26.5,2.4,1,'dark'),
    E(20,15,14,8.5,m),Cp(16,18,15,26,2.3,m,{r2:1.7}),Cp(25,18,26,26,2.3,m,{r2:1.7}),E(15,26.5,2.5,1,'dark'),E(26,26.5,2.5,1,'dark'),
    Pl([[8,7],[12,5],[16,7],[20,4.6],[24,7],[28,5.4],[31,8],[20,11]],m,{b:-.3}),
    E(33,14,6.6,6,m),Cp(36,15,41,17,3,m,{r2:2.3}),E(41.2,17.2,1.4,1.6,'skin'),Pl([[36.4,8],[35,4],[38.6,7.6]],m),
    Pl([[37.6,18.6],[40,14.6],[39.4,19.4]],'bone',{noEdge:1}),E(35.6,12.4,.9,.8,null,{flat:'#ffd24a'}),Cp(3,13,7,12,.6,m)])},
});

/* ---------- the people of the new story ---------- */
look('lift2026',{skin:'#f0c09a',hair:'#2a1e18',top:'#5a5f6e',acc:'#2a2c34',bot:'#2f4a7a',boot:'#e8e8ec',style:['messy']});
look('mara',{skin:'#f0c09a',hair:'#8a3a1e',top:'#5a7a4a',acc:'#e8d8b0',bot:'#4a5a3a',style:['long','dress']});
look('bren',{skin:'#d8a07a',hair:'#5a3a22',top:'#7a5a3a',acc:'#c8b48a',bot:'#3a3a40',boot:'#3a2a1a',style:['short','beard','o-vest']});
look('wynn',{skin:'#f2c39b',hair:'#c8902e',top:'#2f7a7a',acc:'#e8d8a0',bot:'#3a3a4e',style:['pony']});
look('garrow',{skin:'#e0b090',hair:'#a8a8b0',top:'#2f4a6a',acc:'#c8b070',bot:'#2a2e3a',boot:'#2a2018',hwc:'#1e2a3a',style:['short','mustache','hw-cap','o-coat']});
look('nell',{skin:'#f0c8a8',hair:'#e0e0e8',top:'#8a5a8a',bot:'#5a3a5a',style:['bun','dress']});
look('tam',{skin:'#e8b48a',hair:'#3a2a1a',top:'#c86a3a',bot:'#3a4a6a',style:['curly']});
look('hale',{skin:'#c88a64',hair:'#c8902e',top:'#6a5a3a',acc:'#e0d0a0',bot:'#3a3a2a',style:['short','stubble']});
look('stranger',{skin:'#e8e4e0',hair:'#18141c',top:'#24222c',acc:'#4a4656',bot:'#18161e',boot:'#121016',hwc:'#1a1820',eye:'#c8d8e8',style:['short','hw-hood','o-coat']});
look('rook',{skin:'#d8a880',hair:'#d8d8e0',top:'#2a2a30',acc:'#8a2a2a',bot:'#222228',boot:'#1a1414',hwc:'#1e1e24',eye:'#5a3a2a',style:['bun','o-coat']});
look('jun',{skin:'#e8c09a',hair:'#141018',top:'#2a3a34',acc:'#3a8a7a',bot:'#1e2224',boot:'#1a1614',eye:'#3a2a20',hilt:'#8a8a9a',ostyle:'coat',blade:'knives',hw:'none',style:['messy','o-coat']});
look('moss',{skin:'#c88a64',hair:'#4a2e1a',top:'#7a2a24',acc:'#d8c8a8',bot:'#3a3428',boot:'#2a2018',eye:'#3a4a2a',hilt:'#7a5a3a',ostyle:'vest',blade:'axe',style:['bald','beard','o-vest']});
look('pike',{skin:'#d8a07a',hair:'#6a3a20',top:'#3a3a34',acc:'#8a2a2a',bot:'#2a2a24',hwc:'#2a2a30',style:['short','hw-bandana']});
look('wick',{skin:'#e0b090',hair:'#8a8a8a',top:'#5a4a3a',acc:'#c8b070',bot:'#3a2e26',style:['bald','mustache']});
look('sprout',{skin:'#f2c39b',hair:'#e0b040',top:'#3a4a2a',bot:'#3a3428',style:['messy']});
look('crow1',{skin:'#c8906a',hair:'#1e1a1a',top:'#2e2e30',acc:'#8a2a2a',bot:'#222224',hwc:'#2a2a30',style:['short','hw-hood']});
look('crow2',{skin:'#e0b090',hair:'#5a2a1a',top:'#3a2e2a',acc:'#c8a050',bot:'#2a2420',style:['long']});
look('tollg',{skin:'#d8a07a',hair:'#3a2a20',top:'#8a2430',acc:'#c8ccd8',bot:'#2a1a1a',style:['helm']});
look('garrickF',{skin:'#d0946a',hair:'#3a2418',top:'#8a7450',acc:'#d8c8b0',bot:'#3a2a1e',boot:'#2a1e14',style:['hat','beard','o-coat']});
look('kellF',{skin:'#e0b090',hair:'#5a4a3a',top:'#8a2430',acc:'#c8ccd8',bot:'#3a3e4a',boot:'#5a5a60',hwc:'#9aa4b8',ostyle:'armor',style:['short','hw-helmet','o-armor','cape'],cape:'#6a1218'});
look('townsman',{skin:'#e0b090',hair:'#5a3a20',top:'#6a6a4a',bot:'#3a3a30',style:['short','stubble']});
look('townwoman',{skin:'#d8a07a',hair:'#2a1e18',top:'#a8743f',bot:'#5a3a2a',style:['bun','dress']});
look('debtor',{skin:'#d8b090',hair:'#7a6a5a',top:'#6a6058',bot:'#4a4440',style:['short','beard']});

/* Moss's axe on his big battle sprite: a long haft and a wide bit on one side */
const _heroBig0=heroBig;
heroBig=function(look,pose){if(look.blade!=='axe')return _heroBig0(look,pose);const key=look.id+'|'+pose;if(bigCache.has(key))return bigCache.get(key);
  const c=_heroBig0({...look,blade:'fork',id:look.id+'~ax'},pose);const g2=c.getContext('2d');
  // paint over the three tines with an axe head: find where the fork ends by redrawing a head at the same tip
  const P0={idle:{h:[10.5,26.5],a:-112},raise:{h:[19.5,2.5],a:-32},strike:{h:[6.5,24.5],a:168}}[pose]||{h:[10.5,26.5],a:-112};
  const d=[Math.cos(P0.a*Math.PI/180),Math.sin(P0.a*Math.PI/180)],n=[-d[1],d[0]],G=[P0.h[0]+d[0]*2.4,P0.h[1]+d[1]*2.4],T=[G[0]+d[0]*21,G[1]+d[1]*21];
  const X=x=>x+BIG.ox,Y=y=>y+BIG.oy;const pts=[[T[0]-d[0]*1,T[1]-d[1]*1],[T[0]+n[0]*5.6-d[0]*2.6,T[1]+n[1]*5.6-d[1]*2.6],[T[0]+n[0]*6.4+d[0]*3.6,T[1]+n[1]*6.4+d[1]*3.6],[T[0]+d[0]*3,T[1]+d[1]*3]];
  const head=sculpt(BIG.W,BIG.H,[Pl(pts.map(([x,y])=>[X(x),Y(y)]),'steel',{b:.1}),Cp(X(T[0]+n[0]*6.2-d[0]*2),Y(T[1]+n[1]*6.2-d[1]*2),X(T[0]+n[0]*6.6+d[0]*3),Y(T[1]+n[1]*6.6+d[1]*3),.35,null,{flat:'#ffffff',noEdge:1})]);
  // clear the tines, keep the haft
  g2.save();g2.globalCompositeOperation='destination-out';for(const k of [-1.7,1.7]){g2.beginPath();g2.arc(X(T[0]+n[0]*k+d[0]*3),Y(T[1]+n[1]*k+d[1]*3),2.6,0,Math.PI*2);g2.fill()}g2.restore();
  g2.drawImage(head,0,0);bigCache.set(key,c);return c};


/* ---------- added for the Spellsteel edition ---------- */
/* an anvil at the Crows' camp */
TILE['&']={paint:g=>{campDirt(g);RF(g,2,6,12,4,'#16101e');RF(g,3,6,10,3,'#5a5a6a');RF(g,3,6,10,1,'#9a9aaa');RF(g,5,9,6,4,'#16101e');RF(g,6,9,4,3,'#3a3a4a');RF(g,4,12,8,3,'#16101e');RF(g,5,12,6,2,'#4a4a5a');P(g,12,7,'#c8c8d8')},solid:1};
/* the tailor's sign on Greyford's blue house: a needle and thread */
TILE['{']={paint:g=>{planks(g,C.plank,C.plank2,'#e0b678',true);RF(g,0,15,16,1,'#5a3a1e');RF(g,2,3,12,9,'#3a2210');RF(g,3,4,10,7,'#f2e6c8');RF(g,5,6,7,1,'#8a8a9a');P(g,12,6,'#c8c8d8');RF(g,4,8,6,1,'#c83a6a');P(g,10,7,'#c83a6a')},solid:1};
/* a person drawn from any outfit in the Spellsteel wardrobe */
const ghostHero=()=>false;
return {TILE,tileImg,personImg,LOOKS,look,ART,monImg,shade,mix};
})();
