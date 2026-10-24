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
  sand:'#e6d39d',sand2:'#d1bb80',sandHi:'#f5e7bd',grass:'#5aa042',grass2:'#468530',grassHi:'#7bc35a',
  dirt:'#b99460',dirt2:'#9d7a48',stone:'#868c9a',stone2:'#6e7482',stoneHi:'#a3a9b6',
  wall:'#5b6372',wall2:'#3b414d',wallHi:'#7e889a',wood:'#a8743f',wood2:'#7e5530',woodHi:'#c48d55',
  plank:'#c99a5b',plank2:'#946a38',ol:'#16101e'
};
function water(g,f,deep){
  RF(g,0,0,16,16,deep?C.deep:C.shal);
  const r=rng(deep?7:11);
  for(let i=0;i<5;i++){const y=(r()*16|0),x0=(r()*16|0),l=3+(r()*3|0);const ph=(i+f)%4;
    const col=ph<2?(deep?C.deepHi:C.shalHi):(deep?C.deep2:C.shal2);
    const dx=[0,1,2,1][(f+i)%4];for(let k=0;k<l;k++)P(g,(x0+dx+k)%16,y,col)}
  if(!deep)speck(g,5,6,[C.shal2]);
}
function wet(g,seed=3){RF(g,0,0,16,16,C.wet);speck(g,seed,22,[C.wet2,C.wet2,C.wetHi]);
  const r=rng(seed*7+1);if(r()<.7){const x=1+(r()*10|0),y=2+(r()*10|0),w=3+(r()*3|0);RF(g,x,y,w,2,C.pud);RF(g,x+1,y-1,w-2,1,C.pud);P(g,x+1,y,C.pudHi)}
  if(r()<.4){const x=(r()*14|0),y=(r()*14|0);P(g,x,y,'#f3e4d0');P(g,x+1,y,'#e2c9b0')}}
function grass(g,seed=1){RF(g,0,0,16,16,C.grass);const r=rng(seed);
  for(let i=0;i<7;i++){const x=r()*14|0,y=1+(r()*14|0);P(g,x,y,C.grass2);P(g,x+1,y-1,C.grass2);P(g,x+2,y,C.grass2)}
  speck(g,seed+9,6,[C.grassHi])}
function sand(g,seed=2){RF(g,0,0,16,16,C.sand);speck(g,seed,14,[C.sand2,C.sand2,C.sandHi])}
function dirt(g,seed=4){RF(g,0,0,16,16,C.dirt);speck(g,seed,16,[C.dirt2,C.dirt2,'#cfae78'])}
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
function tree(g){grass(g,21);RF(g,7,11,3,4,'#5a3a1f');RF(g,7,11,1,4,'#7a5230');blob(g,8,7,6,['#1f5226','#2f6e2a','#3f8a35','#68b24c'],C.ol)}
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
  T('j',{paint:g=>{sand(g,99);RF(g,2,5,12,7,'#7a5230');RF(g,2,5,12,1,'#a8743f');RF(g,4,2,2,4,'#6b4426');RF(g,10,2,2,4,'#6b4426');RF(g,3,1,10,2,'#e8e0d0')}});// beached boat
}
defTiles();
const tileCache=new Map();
function tileImg(ch,frame,tide){const t=TILE[ch]||TILE['"'];const f=t.anim?frame%t.anim:0,td=t.tideDep?tide:'';
  const key=ch+f+td;let c=tileCache.get(key);if(!c){c=mk(16,16);t.paint(c.getContext('2d'),f,tide);tileCache.set(key,c)}return c}

/* ---------- people ---------- */
const SPR={
down:[
"................",
".....OOOOOO.....",
"....OHHHHHHO....",
"...OHHHHHHHHO...",
"...OHHHHHHHhO...",
"...OHSSSSSShO...",
"...OSSeSSeSSO...",
"...OSSeSSeSSO...",
"....OSSSSSSO....",
"....OTTAATTO....",
"...OSTTTTTTSO...",
"...OSTTTTTtSO...",
"....OBBBBBBO....",
"....OBBOOBBO....",
"....OKKOOKKO....",
"....OOO..OOO...."],
up:[
"................",
".....OOOOOO.....",
"....OHHHHHHO....",
"...OHHHHHHHHO...",
"...OHHHHHHHhO...",
"...OHHHHHHHhO...",
"...OHHHHHHHhO...",
"...OhHHHHHHhO...",
"....OhhhhhhO....",
"....OTTTTTTO....",
"...OSTTTTTTSO...",
"...OSTTTTTtSO...",
"....OBBBBBBO....",
"....OBBOOBBO....",
"....OKKOOKKO....",
"....OOO..OOO...."],
left:[
"................",
".....OOOOOO.....",
"....OHHHHHHO....",
"...OHHHHHHHHO...",
"...OHHHHHHHhO...",
"...OSSSHHHHhO...",
"...OSeSSHHHhO...",
"...OSeSSSHhhO...",
"....OSSSSSOO....",
".....OTTTTO.....",
".....OTSTTO.....",
".....OTSTtO.....",
".....OBBBBO.....",
".....OBOOBO.....",
".....OKOOKO.....",
".....OOOOOO....."]};
const LEGS={
down:[["....OBBBBBBO....","....OKKOOBBO....",".....OOOOKKO....",".........OO....."],["....OBBBBBBO....","....OBBOOKKO....","....OKKOOOO.....",".....OO........."]],
up:[["....OBBBBBBO....","....OKKOOBBO....",".....OOOOKKO....",".........OO....."],["....OBBBBBBO....","....OBBOOKKO....","....OKKOOOO.....",".....OO........."]],
left:[[".....OBBBBO.....","....OBBOOBBO....","....OKO..OKO....","....OO....OO...."],[".....OBBBBO.....",".....OBBBBO.....",".....OKKKKO.....",".....OOOOOO....."]]};
function setc(g,x,y,ch){g[y]=g[y].slice(0,x)+ch+g[y].slice(x+1)}
function styleGrid(dir,frame,st){
  let g=SPR[dir].slice();
  if(frame)LEGS[dir][frame-1].forEach((r,i)=>g[12+i]=r);
  const has=k=>st.includes(k);
  const map=(fn,y0=0,y1=15)=>{for(let y=y0;y<=y1;y++){let r='';for(let x=0;x<16;x++)r+=fn(g[y][x],x,y);g[y]=r}};
  if(has('long')){
    if(dir==='down'){for(let y=5;y<=11;y++){setc(g,3,y,'H');setc(g,12,y,'h');setc(g,2,y,'O');setc(g,13,y,'O')}setc(g,3,12,'O');setc(g,12,12,'O')}
    if(dir==='up'){for(let y=8;y<=11;y++)for(let x=4;x<=11;x++)setc(g,x,y,x===11||y===11?'h':'H');for(let y=8;y<=11;y++){setc(g,3,y,'O');setc(g,12,y,'O')}setc(g,4,12,'O');setc(g,11,12,'O')}
    if(dir==='left'){for(let y=8;y<=11;y++){setc(g,9,y,'H');setc(g,10,y,'h');setc(g,11,y,'O')}setc(g,10,12,'O')}}
  if(has('pony')){if(dir==='left'){for(let y=4;y<=8;y++){setc(g,12,y,'H');setc(g,13,y,'O')}setc(g,12,9,'O')}if(dir==='up'){for(let y=8;y<=10;y++){setc(g,7,y,'H');setc(g,8,y,'h')}}}
  if(has('bun')){g[0]="......OOOO......";g[1]=".....OHHHHO.....";if(dir!=='left')setc(g,4,2,'O'),setc(g,11,2,'O')}
  if(has('bald')){map((c,x,y)=>c==='H'?'S':c==='h'?'s':c,2,dir==='up'?7:5);if(dir==='up')map((c)=>c==='H'?'S':c==='h'?'s':c,2,7)}
  if(has('cap')){map((c)=>c==='H'||c==='h'?'A':c,1,3);if(dir==='down')g[4]="...OAAAAAAAAO...";if(dir==='left')g[4]="..OAAAAHHHHhO..."}
  if(has('helm')){map((c)=>c==='H'||c==='h'?'A':c,1,4);if(dir==='down'){g[5]="...OAAAAAAAAO...";setc(g,3,6,'A');setc(g,12,6,'A')}if(dir==='left')g[5]="...OAAAAAAAAO..."}
  if(has('hat')){g[0]=".....OOOOOO.....";g[1]="....OAAAAAAO....";g[2]="..OOAAAAAAAAOO..";g[3]="..OAAAAAAAAAAO..";g[4]="...OOOOOOOOOO..."}
  if(has('hood')){map(c=>c==='H'?'T':c==='h'?'t':c,0,11)}
  if(has('beard')){if(dir==='down'){g[8]="....OHHHHHHO....";setc(g,4,7,'H');setc(g,11,7,'H');g[9]="....OTHHHHTO...."}if(dir==='left'){g[8]="....OHHHHSOO....";setc(g,4,7,'H');setc(g,5,7,'H')}}
  if(has('dress')){map(c=>c==='B'?'T':c==='b'?'t':c,12,13);if(dir!=='left'){g[12]="...OTTTTTTTTO...";g[13]="...OTTTTTTTtO..."}}
  if(has('robe')){map(c=>c==='B'?'T':c==='K'?'t':c,12,14)}
  return g}
const sprCache=new Map();
function personImg(look,dir,frame){
  const flip=dir==='right';const d=flip?'left':dir;const key=look.id+d+frame+flip;
  let c=sprCache.get(key);if(c)return c;c=mk(16,16);const g=c.getContext('2d');
  const grid=styleGrid(d,frame,look.style||[]);
  const pal={O:look.ol||'#1a1424',H:look.hair,h:shade(look.hair,-.3),S:look.skin,s:shade(look.skin,-.2),e:look.eye||'#1a1424',
    T:look.top,t:shade(look.top,-.3),A:look.acc||shade(look.top,.35),B:look.bot||'#3a3f5a',b:shade(look.bot||'#3a3f5a',-.3),K:look.boot||'#3a2a22'};
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const ch=grid[y][x];if(ch==='.')continue;const col=pal[ch];if(!col)continue;
    g.fillStyle=col;g.fillRect(flip?15-x:x,y,1,1)}
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
const GHOSTLY=new Set(['ysolde','drowned1','drowned2','drowned3','drownedkid','cantor','lirien','mother']);

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
  white:['#7a7a8a','#b0b0c0','#e0e0ea','#ffffff'],bone:['#5a5040','#9a8a6a','#d0c4a0','#fff8e0'],cloth:['#2a1a1a','#5a2a2a','#8a3a3a','#c86a5a']
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
  undertide(){const ch=[];for(let i=0;i<7;i++){const a=i*0.9;ch.push(Cp(30+Math.cos(a)*6,34+Math.sin(a)*4,30+Math.cos(a)*27,34+Math.sin(a)*17,1.5,'chain',{r2:1}))}
    const ten=[];for(let i=0;i<4;i++){const x=8+i*15;ten.push(Cp(x,56,x+(i%2?6:-6),40,3.5,'abyss',{r2:1.5}))}
    return sculpt(60,60,[...ten,...ch,E(30,44,22,13,'abyss'),Pl([[20,22],[40,22],[44,44],[16,44]],'navy'),Cp(21,24,10,38,3,'navy'),Cp(39,24,50,38,3,'navy'),
      E(30,16,6,6.5,'skin'),Pl([[20,12],[30,4],[40,12],[37,13],[23,13]],'navy'),Cp(22,12.5,38,12.5,1,'gold'),E(27.5,16,1,1.2,null,{flat:'#7affd0'}),E(32.5,16,1,1.2,null,{flat:'#7affd0'}),
      E(30,33,6,6,'moon',{b:.2}),E(30,33,3,3,null,{flat:'#ffffff'})])},
};
const monCache=new Map();
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
    for(let i=0;i<6;i++){g.fillStyle='#2f78c8';g.fillRect(r()*w|0,h*.7+r()*h*.25|0,10+r()*14|0,2)}}
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
  return c}
const bdCache=new Map();
function backdropImg(kind,w,h){const k=kind+w+'x'+h;let c=bdCache.get(k);if(!c){c=backdrop(kind,w,h);bdCache.set(k,c)}return c}
