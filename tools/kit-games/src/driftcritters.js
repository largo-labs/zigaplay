/* =====================================================================================================
   DRIFT CRITTERS: eight critters in small karts race three laps, with drifting, crates of tricks and cups.
   Every course is a road: asphalt with painted lines and kerbs, a verge either side, and a drop beyond it
   (water, lava, the night sky). A kart that leaves the land is fished out by the rescue balloon and set
   back on the road. The ground is one big picture, drawn row by row as seen from behind the kart;
   everything standing on it (karts, trees, signs) is a small picture scaled by how far away it is.
   ===================================================================================================== */
const S=makeSave('driftcritters',()=>({v:1,sound:2,gas:0,racer:0,cc:1,cups:{},best:{},savedAt:0}));
SND.mode=S.v.sound;
const cv=$('#cv'),g=cv.getContext('2d'),stage=$('#stage'),hud=$('#hud');
const WS=1024,RW=36,DS=8,TAU=Math.PI*2,NF=16;
const angd=(a,b)=>{let d=(a-b)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d};
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const u32=(r,gg,b)=>(255<<24|clamp(b|0,0,255)<<16|clamp(gg|0,0,255)<<8|clamp(r|0,0,255))>>>0;
const shade=(h,m)=>{const[r,gg,b]=hex(h);return u32(r*m,gg*m,b*m)};
const dark=(h,m=.7)=>{const[r,gg,b]=hex(h);return'#'+[r,gg,b].map(v=>Math.round(v*m).toString(16).padStart(2,'0')).join('')};
function paint(w,h,fn){const c=mkCanvas(w,h),x=c.getContext('2d');fn({r(col,X,Y,W=1,H=1){x.fillStyle=col;x.fillRect(X,Y,W,H)},
  d(col,cx,cy,rx,ry=rx){x.fillStyle=col;for(let Y=Math.floor(cy-ry)-1;Y<=cy+ry+1;Y++)for(let X=Math.floor(cx-rx)-1;X<=cx+rx+1;X++){const dx=(X+.5-cx)/rx,dy=(Y+.5-cy)/ry;if(dx*dx+dy*dy<=1)x.fillRect(X,Y,1,1)}},
  s(rows,pal,ox=0,oy=0){rows.forEach((row,Y)=>{for(let X=0;X<row.length;X++){const ch=row[X];if(pal[ch]){x.fillStyle=pal[ch];x.fillRect(ox+X,oy+Y,1,1)}}})}},x);return c}

/* ---------- the racers: each kart and driver is a handful of boxes, drawn once from sixteen sides.
   They differ in looks only: every critter is the same size and drives exactly the same. ---------- */
const ear=(x0,y0,z0,x1,y1,z1,c)=>[[-x1,y0,z0,-x0,y1,z1,c],[x0,y0,z0,x1,y1,z1,c]];
const RACERS=[
  {n:'FENNEL',kart:'#e8443a',body:'#f08a2a',head:'#f08a2a',snout:'#fff4e6',ex:[...ear(1.2,14.2,-4.5,3.4,17.4,-2.5,'#f08a2a'),...ear(1.6,17.4,-4.2,3,18.6,-2.8,'#2a1a14'),[-1.2,5,-11.5,1.2,8.5,-9,'#f08a2a'],[-1,8.5,-11.3,1,10,-9.2,'#ffffff']]},
  {n:'BOK',kart:'#3ac04a',body:'#8ae05a',head:'#6ad04a',snout:'#8ae05a',ex:[...ear(1,14.2,-2.6,3.6,16.2,.4,'#6ad04a'),...ear(1.4,14.6,.4,3.2,15.9,.7,'#ffffff')]},
  {n:'POM',kart:'#ff8ab8',body:'#ffd0e0',head:'#f4f0ea',snout:'#ffffff',nose:'#ff7aa8',ex:[...ear(1.2,14.2,-4,2.8,20.5,-2.6,'#f4f0ea'),[-1.2,5.5,-10.6,1.2,7.9,-9,'#ffffff']]},
  {n:'GRIZZ',kart:'#d9a02a',body:'#8a5a34',head:'#8a5a34',snout:'#d8b890',ex:[...ear(2.2,13.2,-4,4.4,15.8,-2.4,'#6e452a')]},
  {n:'MISO',kart:'#8a5ad8',body:'#b8b8c6',head:'#9a9aa8',snout:'#e8e8f0',nose:'#ff9ab0',ex:[...ear(1.4,14.2,-4.2,3.4,16.4,-2.6,'#9a9aa8'),[-.8,5,-11.5,.8,10.5,-10,'#9a9aa8']]},
  {n:'WADDLE',kart:'#3a8ae8',body:'#ffffff',head:'#2a2a3a',snout:'#ff9a2a',nose:'#ff9a2a',ex:[[-2.6,8.8,.4,2.6,11,.6,'#ffffff']]},
  {n:'HOOT',kart:'#2ab8a8',body:'#c8a878',head:'#b08a5a',snout:'#ffd23f',nose:'#ffd23f',ex:[...ear(2.2,14.2,-3.5,3.6,16.2,-2.2,'#8a6a40'),...ear(1,11.4,.4,3.3,13.6,.6,'#fff4d8')]},
  {n:'BANDIT',kart:'#f0c020',body:'#8a8a92',head:'#8a8a92',snout:'#e8e8ee',ex:[...ear(1.8,14.2,-4,3.6,15.8,-2.6,'#5a5a64'),[-3.7,11.4,.3,3.7,13.6,.5,'#2a2a34'],[-1,5,-11.5,1,7,-9.5,'#8a8a92'],[-1,7,-11.5,1,8.5,-9.5,'#2a2a34'],[-1,8.5,-11.5,1,10,-9.5,'#8a8a92']]}];
function kartModel(r){const K=r.kart,KD=dark(K),B=[];
  for(const sx of[-1,1])for(const sz of[-1,1])B.push([sx>0?4.6:-7.4,0,sz>0?3:-7.5,sx>0?7.4:-4.6,4.4,sz>0?7.5:-3,'#2b2b36']);
  B.push([-4.6,1.6,-9,4.6,5,8,K],[-3.2,1.6,8,3.2,4,10.5,KD],[-4.2,5,-9,4.2,7.8,-6.5,KD],[-2.6,5,-5.5,2.6,8.6,-.5,r.body],[-3.6,8.6,-6,3.6,14.2,.4,r.head],
    [-2,9.2,.4,2,11.6,2,r.snout],[-2.9,11.9,.4,-1.5,13.2,.75,'#1a1424'],[1.5,11.9,.4,2.9,13.2,.75,'#1a1424'],[-1,10.8,2,1,11.6,2.3,r.nose||'#1a1424'],[-3.4,5,.2,3.4,6.4,3,'#3a3a48'],...r.ex);return B}
function renderModel(boxes,yaw,W=48,H=48,SCL=1.7,BY=35){const img=new ImageData(W,H),d=new Uint32Array(img.data.buffer),cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(.42),sp=Math.sin(.42),faces=[];
  for(const[x0,y0,z0,x1,y1,z1,col]of boxes){const C=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]].map(([x,y,z])=>{const xr=x*cy-z*sy,zr=x*sy+z*cy;return[W/2+xr*SCL,BY-(y*cp+zr*sp)*SCL,zr*cp-y*sp]});
    for(const[a,b,c,e,nx0,ny,nz0]of[[0,1,2,3,0,0,-1],[5,4,7,6,0,0,1],[4,0,3,7,-1,0,0],[1,5,6,2,1,0,0],[3,2,6,7,0,1,0]]){const nx=nx0*cy-nz0*sy,nz=nx0*sy+nz0*cy;if(ny*-sp+nz*cp>=-.02)continue;
      faces.push({p:[C[a],C[b],C[c],C[e]],z:(C[a][2]+C[b][2]+C[c][2]+C[e][2])/4,col:shade(col,ny?1.1:(.62+.3*Math.max(0,-nz))*(nx<0?1.06:.94))})}}
  faces.sort((a,b)=>b.z-a.z);
  for(const f of faces){const p=f.p;let ax=999,bx=-999,ay=999,by=-999;for(const q of p){ax=Math.min(ax,q[0]);bx=Math.max(bx,q[0]);ay=Math.min(ay,q[1]);by=Math.max(by,q[1])}
    for(let Y=Math.max(0,Math.floor(ay));Y<=Math.min(H-1,by);Y++)for(let X=Math.max(0,Math.floor(ax));X<=Math.min(W-1,bx);X++){const px=X+.5,py=Y+.5;let pos=0,neg=0;
      for(let i=0;i<4;i++){const q=p[i],r=p[(i+1)%4],cr=(r[0]-q[0])*(py-q[1])-(r[1]-q[1])*(px-q[0]);if(cr>0)pos++;else if(cr<0)neg++}if(!pos||!neg)d[Y*W+X]=f.col}}
  const o=d.slice();for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++)if(!o[Y*W+X]&&((X>0&&o[Y*W+X-1])||(X<W-1&&o[Y*W+X+1])||(Y>0&&o[Y*W+X-W])||(Y<H-1&&o[Y*W+X+W])))d[Y*W+X]=u32(26,20,36);
  const c=mkCanvas(W,H);c.getContext('2d').putImageData(img,0,0);return c}
const MODEL=RACERS.map(kartModel),KSPR=MODEL.map(m=>Array.from({length:NF},(_,f)=>renderModel(m,-f*TAU/NF)));
/* bigger pictures for the choosing screen, made as they are needed: the kart from each side, and each driver's face */
const BIG={},FACE=[];
const bigFrame=(ri,f)=>BIG[ri*NF+f]||(BIG[ri*NF+f]=renderModel(MODEL[ri],-f*TAU/NF,96,96,3.4,70));
const face=ri=>FACE[ri]||(FACE[ri]=(()=>{const c=mkCanvas(40,40);c.getContext('2d').drawImage(renderModel(MODEL[ri],-7*TAU/NF,96,96,3.4,70),-29,-3);return c})());

/* ---------- small pictures: tricks, crates, trees ---------- */
const ICON={
  pepper:paint(16,16,P=>P.s(['.........gg.....','........Gg......','.......orr......','......orRrr.....','.....orRrrr.....','.....orrrrr.....','.....orrrrro....','......orrrrro...','.......orrrro...','........orrro...','.........orro...','..........oo....'],{g:'#3ac04a',G:'#2a8a3a',r:'#f03a2a',R:'#ff9a7a',o:'#5a0a0a'},0,2)),
  snow:paint(16,16,P=>{P.d('#3a5a8a',8,8,6.5);P.d('#eaf4ff',8,8,5.5);P.d('#ffffff',6.5,6,2.4,1.8);P.d('#b8d4f0',9.5,10.5,2.6,1.6)}),
  hornet:paint(16,16,P=>{P.d('#cfeaff',5,4.5,3,2.4);P.d('#cfeaff',10,4.5,3,2.4);P.d('#2a1a08',8,9,6,4.5);P.d('#ffcf2a',8,9,5,3.5);P.r('#2a1a08',6,6,2,7);P.r('#2a1a08',10,6,1,7);P.r('#ffffff',11,8,2,2);P.r('#2a1a08',12,9,1,1);P.r('#2a1a08',1,9,2,1)}),
  mud:paint(16,16,P=>{P.d('#3a2410',8,10,7,4.5);P.d('#7a4e26',8,10,6,3.5);P.d('#9a6a3a',6,9,2.4,1.2);P.d('#7a4e26',4,6,1.5);P.d('#7a4e26',11,5,1.2)}),
  bubble:paint(16,16,P=>{P.d('#2a8ad8',8,8,7);P.d('#bfeaff',8,8,6);P.d('#8ad4ff',8,8.6,5,4.6);P.d('#ffffff',5.5,5.5,1.8,1.3)}),
  fire:paint(16,16,P=>{P.d('#fff6a0',8,8,7);P.d('#d8ff5a',8,8,5);P.d('#ffffff',8,8,2.6);P.r('#fff6a0',8,0,1,2);P.r('#fff6a0',8,14,1,2);P.r('#fff6a0',0,8,2,1);P.r('#fff6a0',14,8,2,1)}),
  crate:paint(16,16,P=>{P.r('#5a2a0a',1,2,14,13);P.r('#f0a030',2,3,12,11);P.r('#ffd070',2,3,12,2);P.r('#c8741a',2,12,12,2);P.r('#fff6dc',7,3,2,11);P.r('#fff6dc',2,7,12,2);P.r('#ff5a7a',6,6,4,4)}),
  berry:paint(10,10,P=>{P.d('#5a0a2a',5,6,4.5,4);P.d('#ff4a7a',5,6,3.5,3);P.r('#ffb0c8',3,4,2,1);P.r('#2a8a3a',4,0,2,2)}),
  shadow:paint(24,8,P=>P.d('rgba(10,10,30,.35)',12,4,11,3.5))};
const ITEM_NAMES={pepper:'PEPPER',snow:'SNOWBALL',hornet:'HORNET',mud:'MUD PIE',bubble:'BUBBLE',fire:'FIREFLIES'};
const SCN={
  tree:paint(26,34,P=>{P.r('#5a3a1a',11,22,4,12);P.r('#7a5226',11,22,2,12);P.d('#1f6a2a',13,13,12.5,12.5);P.d('#3aa83e',13,13,11,11);P.d('#6ad25a',9.5,9,5,4)}),
  palm:paint(30,40,P=>{P.r('#7a5a2a',14,14,3,26);P.r('#a07a3a',14,14,1,26);for(const[cx,cy,rx,ry]of[[7,10,7,3],[23,10,7,3],[10,5,5,3],[20,5,5,3],[15,8,5,3]]){P.d('#1f6a2a',cx,cy,rx,ry);P.d('#3ab84a',cx,cy-.6,rx-1,ry-1)}P.d('#5a3a1a',15,14,2,2)}),
  pine:paint(24,38,P=>{P.r('#4a2e14',10,28,4,10);for(let i=0;i<4;i++){const w=6+i*3;P.r('#12402a',12-w,4+i*7,w*2,8);P.r('#1f6a3e',12-w+1,4+i*7,w*2-2,6);P.r('#3a9a5a',12-w+2,4+i*7,w-2,2)}}),
  snowpine:paint(24,38,P=>{P.r('#4a2e14',10,28,4,10);for(let i=0;i<4;i++){const w=6+i*3;P.r('#1a4a3a',12-w,4+i*7,w*2,8);P.r('#2a7a5a',12-w+1,4+i*7,w*2-2,6);P.r('#f4faff',12-w+1,4+i*7,w*2-2,2)}}),
  snowman:paint(18,26,P=>{P.d('#8aa8c8',9,18,7.5,7.5);P.d('#ffffff',9,18,6.5,6.5);P.d('#8aa8c8',9,8,5.5,5.5);P.d('#ffffff',9,8,4.5,4.5);P.r('#1a1424',7,7,1,1);P.r('#1a1424',10,7,1,1);P.r('#ff8a2a',8,9,3,1);P.r('#e8443a',5,12,8,2)}),
  rock:paint(22,16,P=>{P.d('#2a2026',11,10,10.5,6.5);P.d('#6a5a62',11,10,9.5,5.5);P.d('#8a7a84',8,8,4,2)}),
  flame:paint(16,28,P=>{P.d('#2a2026',8,23,7.5,4.5);P.d('#5a4a52',8,23,6.5,3.5);P.d('#ff5a1a',8,13,5,8);P.d('#ffb02a',8,15,3.4,6);P.d('#fff2a0',8,17,1.8,3.6)}),
  lamp:paint(14,44,P=>{P.r('#3a3a4a',6,8,2,36);P.r('#5a5a70',6,8,1,36);P.r('#3a3a4a',3,6,8,3);P.d('#fff2a0',7,4,4,4);P.d('#ffffff',7,4,2,2);P.r('#3a3a4a',4,42,6,2)}),
  tower:paint(30,60,P=>{P.r('#1a1a2e',0,0,30,60);P.r('#2a2a48',1,1,28,59);for(let y=4;y<56;y+=7)for(let x=4;x<26;x+=6)P.r(((x*7+y*13)%5)<2?'#ffe07a':'#3a3a60',x,y,3,4)}),
  cactus:paint(18,28,P=>{P.r('#1f6a2a',7,4,5,24);P.r('#3ab84a',8,4,2,24);P.r('#1f6a2a',1,10,4,8);P.r('#1f6a2a',1,15,7,3);P.r('#1f6a2a',13,7,4,9);P.r('#1f6a2a',11,13,6,3)}),
  flowers:paint(14,8,P=>{for(const[x,c]of[[2,'#ff7ab0'],[7,'#ffffff'],[11,'#ffd23f']]){P.r('#2f8f3a',x,4,1,4);P.r(c,x-1,2,3,2);P.r(c,x,1,1,4)}}),
  /* things a road has: arrow boards on the bends, cones, stacks of tyres, the banner over the start line */
  sign:paint(22,20,P=>{P.r('#3a3a48',3,12,2,8);P.r('#3a3a48',17,12,2,8);P.r('#1a1424',0,0,22,13);P.r('#ffd23f',1,1,20,11);for(const o of[2,8,14])for(let i=0;i<5;i++)P.r('#1a1424',o+(i<3?i:4-i),1+i*2+(i>2?1:0),3,2)}),
  cone:paint(10,13,P=>{P.r('#1a1424',0,11,10,2);P.r('#ff7a1a',1,10,8,2);P.r('#ff7a1a',2,6,6,4);P.r('#ffffff',2,6,6,2);P.r('#ff7a1a',3,2,4,4);P.r('#ffb06a',4,0,2,3)}),
  tyres:paint(14,15,P=>{for(let i=0;i<3;i++){P.d('#14141c',7,12-i*4,6.5,3);P.d('#3a3a48',7,11.4-i*4,5,2)}P.d('#14141c',7,3.2,2.6,1)}),
  gantry:paint(96,38,P=>{P.r('#3a3a48',1,6,4,32);P.r('#5a5a70',1,6,2,32);P.r('#3a3a48',91,6,4,32);P.r('#5a5a70',91,6,2,32);P.r('#1a1424',0,0,96,13);P.r('#e8443a',1,1,94,11);
    for(let X=0;X<10;X++)for(let Y=0;Y<2;Y++){P.r((X+Y)&1?'#1a1424':'#ffffff',3+X*2,3+Y*2+(Y?0:0),2,2);P.r((X+Y)&1?'#1a1424':'#ffffff',73+X*2,3+Y*2,2,2)}
    P.s(['###.###..#..###..###','#....#..#.#.#.#...#.','###..#..###.##....#.','..#..#..#.#.#.#...#.','###..#..#.#.#.#...#.'],{'#':'#ffffff'},38,4)}),
  /* the rescue balloon: it lowers a line to a kart that has left the road and sets it back down */
  balloon:paint(24,34,P=>{P.d('#8a1a3a',12,11,11.5,11.5);P.d('#ff5a7a',12,11,10.5,10.5);P.d('#ffd23f',12,11,4.6,10.5);P.d('#ff8aa0',6.5,7,2.4,3.4);P.d('#fff2a0',11,6,1.4,3);
    P.r('#8a1a3a',9,21,6,2);P.r('#5a3a1a',8,23,1,5);P.r('#5a3a1a',15,23,1,5);P.d('#3a8a3a',12,25.5,3,2.4);P.d('#6ad04a',12,25,2.6,2);P.r('#1a1424',10,24,1,1);P.r('#1a1424',13,24,1,1);
    P.r('#5a3a1a',6,27,12,7);P.r('#b07a3a',7,28,10,5);P.r('#8a5a2a',7,30,10,1);P.r('#8a5a2a',7,32,10,1)})};

/* ---------- the six courses ----------
   v1/v2 the verge, rim the edge of the land, out/o2 what lies beyond it (kind: wave, floe, blob, lights),
   road/r2 the asphalt, line its edge lines, mid the centre dashes, k1/k2 the kerbs on the bends, edge the kerbstones */
const TH={
  meadow:{v1:'#5cc85a',v2:'#50ba50',rim:'#e8dca8',out:'#3a9ee0',o2:'#84ccf6',kind:'wave',road:'#5a5c68',r2:'#53555f',line:'#ffffff',mid:'#ffd23f',k1:'#ffffff',k2:'#e8443a',edge:'#c9c9d2',oops:'SPLASH!',splash:['#ffffff','#bfeaff'],sky:['#4aa8ff','#c8ecff'],far:'#6fc7a4',fog:'#c8ecff',scn:['tree','tree','flowers','tyres']},
  beach:{v1:'#f2dc98',v2:'#e8cd84',rim:'#fffbe8',out:'#2a8ae0',o2:'#74c4fa',kind:'wave',road:'#6c6e7a',r2:'#646671',line:'#ffffff',mid:'#ffffff',k1:'#ffffff',k2:'#2a9ae8',edge:'#d8d2c0',oops:'SPLASH!',splash:['#ffffff','#bfeaff'],sky:['#38a0ff','#d8f4ff'],far:'#58c0e8',fog:'#d8f4ff',scn:['palm','palm','cactus','cone']},
  forest:{v1:'#3f9048',v2:'#36823f',rim:'#7a5a34',out:'#1d5a60',o2:'#3f9690',kind:'wave',road:'#4e505a',r2:'#474952',line:'#f4f4f8',mid:'#ffd23f',k1:'#ffd23f',k2:'#2a2026',edge:'#a89878',oops:'SPLASH!',splash:['#ffffff','#a8e8e0'],sky:['#ffb070','#ffe8c0'],far:'#4a8a5a',fog:'#ffe8c0',scn:['pine','pine','rock','pine']},
  snow:{v1:'#eef6ff',v2:'#dbe8f8',rim:'#ffffff',out:'#2f62a8',o2:'#e4f2ff',kind:'floe',road:'#66707e',r2:'#5e6876',line:'#ffffff',mid:'#ffd23f',k1:'#ffffff',k2:'#3a7ad8',edge:'#c8d8ea',oops:'BRRR!',splash:['#ffffff','#bfeaff'],sky:['#7ab8f0','#f0f8ff'],far:'#b8d0e8',fog:'#f0f8ff',scn:['snowpine','snowpine','snowman','cone']},
  lava:{v1:'#4a3a40',v2:'#3f3137',rim:'#1e1418',out:'#dc440c',o2:'#ffb02a',kind:'blob',road:'#585862',r2:'#4f4f59',line:'#ffd23f',mid:'#ffd23f',k1:'#ffd23f',k2:'#2a2026',edge:'#2a2026',oops:'TOO HOT!',splash:['#ffd23f','#ff7a1a'],sky:['#2a1020','#a83a1a'],far:'#5a2018',fog:'#a83a1a',scn:['flame','rock','rock','cone']},
  night:{v1:'#2c3848',v2:'#263142',rim:'#5af0ff',out:'#0b0f22',o2:'#ffe07a',kind:'lights',road:'#36384a',r2:'#303243',line:'#5af0ff',mid:'#ff4fd8',k1:'#ff4fd8',k2:'#5af0ff',edge:'#4a5670',oops:'WHOOPS!',splash:['#5af0ff','#ff4fd8'],sky:['#0a0a24','#3a2a6a'],far:'#1a1a3a',fog:'#3a2a6a',scn:['lamp','tower','cone','lamp'],stars:true}};
const TRACKS=[
  {name:'CLOVER CIRCUIT',th:'meadow',pts:[[200,300],[512,180],[820,300],[860,520],[700,760],[512,700],[320,780],[170,560]],pads:[.33,.8],crates:[.14,.5,.72],walk:[.24,.62]},
  {name:'SANDY HOOK',th:'beach',pts:[[180,200],[500,150],[840,220],[860,420],[600,470],[560,600],[850,680],[800,860],[400,850],[170,700],[230,450]],pads:[.08,.6],crates:[.2,.47,.8],walk:[.3,.7]},
  {name:'PINECONE PASS',th:'forest',pts:[[160,512],[240,220],[480,170],[620,330],[820,200],[880,480],[700,560],[840,800],[520,860],[430,640],[260,800]],pads:[.2,.66],crates:[.1,.42,.76],walk:[.31,.9]},
  {name:'FROSTBITE RING',th:'snow',pts:[[512,140],[800,200],[880,440],[760,560],[860,760],[600,870],[420,760],[300,860],[150,700],[240,480],[150,280],[300,170]],pads:[.05,.52],crates:[.18,.4,.7,.9],walk:[.28,.61]},
  {name:'LAVA LANE',th:'lava',pts:[[200,200],[420,160],[520,320],[700,180],[860,300],[780,520],[880,760],[640,860],[540,660],[380,820],[180,760],[280,520],[160,380]],pads:[.3,.74],crates:[.1,.36,.6,.86],walk:[.2,.5]},
  {name:'MOONLIT SPEEDWAY',th:'night',pts:[[150,250],[500,170],[870,180],[900,400],[620,440],[560,580],[880,640],[850,860],[500,880],[180,850],[140,640],[380,580],[340,430],[160,420]],pads:[.07,.45,.82],crates:[.16,.52,.7,.94],walk:[.3,.6]}];
const CUPS=[{name:'SPROUT CUP',t:[0,1,2]},{name:'EMBER CUP',t:[3,4,5]}];
const CC=[{n:'EASY',top:118,ai:.91},{n:'NORMAL',top:138,ai:.985},{n:'FAST',top:160,ai:1.03}];
const VERGE=24,builtTracks={},LINES={},THUMB={};
/* the centre line of a course: a smooth loop through its points, cut into steps of equal length */
function trackLine(ti){if(LINES[ti])return LINES[ti];const P=TRACKS[ti].pts,n=P.length,raw=[];
  for(let i=0;i<n;i++){const p0=P[(i+n-1)%n],p1=P[i],p2=P[(i+1)%n],p3=P[(i+2)%n];for(let k=0;k<24;k++){const t=k/24,t2=t*t,t3=t2*t;
      raw.push([0,1].map(c=>.5*(2*p1[c]+(-p0[c]+p2[c])*t+(2*p0[c]-5*p1[c]+4*p2[c]-p3[c])*t2+(-p0[c]+3*p1[c]-3*p2[c]+p3[c])*t3)))}}
  let len=0;const cum=[0];for(let i=0;i<raw.length;i++){const a=raw[i],b=raw[(i+1)%raw.length];len+=Math.hypot(b[0]-a[0],b[1]-a[1]);cum.push(len)}
  const N=Math.round(len/DS),sx=new Float32Array(N),sy=new Float32Array(N),ta=new Float32Array(N),curv=new Float32Array(N);let j=0;
  for(let i=0;i<N;i++){const d=i*len/N;while(cum[j+1]<d)j++;const a=raw[j],b=raw[(j+1)%raw.length],f=(d-cum[j])/(cum[j+1]-cum[j]||1);sx[i]=a[0]+(b[0]-a[0])*f;sy[i]=a[1]+(b[1]-a[1])*f}
  for(let i=0;i<N;i++)ta[i]=Math.atan2(sy[(i+1)%N]-sy[(i+N-1)%N],sx[(i+1)%N]-sx[(i+N-1)%N]);
  for(let i=0;i<N;i++)curv[i]=angd(ta[(i+3)%N],ta[(i+N-3)%N])/(6*DS);
  return LINES[ti]={N,sx,sy,ta,curv,len}}
/* a small picture of a course for the menus: the land, the road and the start line */
function thumbOf(ti){if(THUMB[ti])return THUMB[ti];const{N,sx,sy,ta}=trackLine(ti),th=TH[TRACKS[ti].th],c=mkCanvas(64,64),x=c.getContext('2d'),k=64/WS;x.fillStyle=th.out;x.fillRect(0,0,64,64);
  x.lineJoin='round';x.beginPath();for(let i=0;i<N;i+=2)x.lineTo(sx[i]*k,sy[i]*k);x.closePath();
  x.strokeStyle=th.rim;x.lineWidth=2*(RW+VERGE+8)*k+2;x.stroke();x.strokeStyle=th.v1;x.lineWidth=2*(RW+VERGE+8)*k;x.stroke();x.strokeStyle=th.road;x.lineWidth=2*RW*k;x.stroke();
  x.setLineDash([2,2]);x.strokeStyle=th.mid;x.lineWidth=.8;x.stroke();x.setLineDash([]);x.save();x.translate(sx[0]*k,sy[0]*k);x.rotate(ta[0]);x.fillStyle='#ffffff';x.fillRect(-1,-3.5,2,7);x.fillStyle='#1a1424';x.fillRect(-1,-3.5,1,2);x.fillRect(0,-1.5,1,2);x.fillRect(-1,.5,1,2);x.restore();
  return THUMB[ti]=c}
function buildTrack(ti){if(builtTracks[ti])return builtTracks[ti];const def=TRACKS[ti],th=TH[def.th],{N,sx,sy,ta,curv,len}=trackLine(ti);
  /* a coarse grid that knows, for any spot on the land, how far the centre line is and which part of the lap it belongs to */
  const gi=new Int16Array(65536).fill(-1),gd=new Float32Array(65536).fill(999);
  for(let i=0;i<N;i++){const cx=sx[i]/4|0,cy=sy[i]/4|0;for(let Y=Math.max(0,cy-25);Y<=Math.min(255,cy+25);Y++)for(let X=Math.max(0,cx-25);X<=Math.min(255,cx+25);X++){const d=Math.hypot(X*4+2-sx[i],Y*4+2-sy[i]),c=Y*256+X;if(d<gd[c]){gd[c]=d;gi[c]=i}}}
  let sd=ti*977+13;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
  const at=(i,off)=>{i=((i%N)+N)%N;return[sx[i]-Math.sin(ta[i])*off,sy[i]+Math.cos(ta[i])*off,ta[i]]};
  const line=new Path2D();line.moveTo(sx[0],sy[0]);for(let i=1;i<N;i++)line.lineTo(sx[i],sy[i]);line.closePath();
  /* the bends, as stretches of the centre line: they get striped kerbs and arrow boards */
  const bend=new Uint8Array(N);for(let i=0;i<N;i++)if(Math.abs(curv[i])>.0075)for(let k=-2;k<=2;k++)bend[((i+k)%N+N)%N]=1;
  const bends=new Path2D();for(let i=0;i<N;i++)if(bend[i]&&bend[(i+1)%N]){bends.moveTo(sx[i],sy[i]);bends.lineTo(sx[(i+1)%N],sy[(i+1)%N])}
  /* 1. what lies beyond the land */
  const tc=mkCanvas(WS,WS),x=tc.getContext('2d');x.fillStyle=th.out;x.fillRect(0,0,WS,WS);
  if(th.kind==='wave'){x.fillStyle=dark(th.out,.9);for(let Y=0;Y<WS;Y+=64)for(let X=0;X<WS;X+=64)if((X+Y)/64&1)x.fillRect(X,Y,64,64);x.fillStyle=th.o2;for(let i=0;i<2600;i++){const w=5+rn()*8|0;x.fillRect(rn()*WS|0,rn()*WS|0,w,2)}}
  else if(th.kind==='floe'){x.fillStyle=dark(th.out,.9);for(let Y=0;Y<WS;Y+=64)for(let X=0;X<WS;X+=64)if((X+Y)/64&1)x.fillRect(X,Y,64,64);for(let i=0;i<420;i++){const X=rn()*WS,Y=rn()*WS,r=4+rn()*11;x.fillStyle='#b8d8f4';x.beginPath();x.ellipse(X,Y+2,r,r*.62,rn()*3,0,TAU);x.fill();x.fillStyle=th.o2;x.beginPath();x.ellipse(X,Y,r,r*.62,rn()*3,0,TAU);x.fill()}}
  else if(th.kind==='blob'){x.fillStyle='#b02c08';for(let i=0;i<900;i++){const r=5+rn()*16;x.beginPath();x.ellipse(rn()*WS,rn()*WS,r,r*.6,rn()*3,0,TAU);x.fill()}x.fillStyle=th.o2;for(let i=0;i<1500;i++){const w=4+rn()*9|0;x.fillRect(rn()*WS|0,rn()*WS|0,w,2+(rn()*2|0))}x.fillStyle='#ffe98a';for(let i=0;i<500;i++)x.fillRect(rn()*WS|0,rn()*WS|0,3,2)}
  else{x.fillStyle='#141a36';for(let Y=0;Y<WS;Y+=48)for(let X=0;X<WS;X+=48)if((X+Y)/48&1)x.fillRect(X,Y,48,48);const cols=[th.o2,'#5af0ff','#ff4fd8','#ffffff'];for(let i=0;i<2200;i++){x.fillStyle=cols[rn()*4|0];x.fillRect(rn()*WS|0,rn()*WS|0,2,2)}x.fillStyle='#232b52';for(let i=0;i<260;i++)x.fillRect(rn()*WS|0,rn()*WS|0,10+rn()*26|0,3)}
  /* 2. the land: a strip either side of the road, wider in places, with a rim where it ends */
  const blobs=[];for(let i=0;i<N;i+=3){const[bx,by]=at(i,(rn()*2-1)*26);blobs.push([bx,by,RW+12+rn()*22])}
  const lc=mkCanvas(WS,WS),lx=lc.getContext('2d');lx.lineJoin='round';
  const land=(c,col,grow)=>{c.strokeStyle=c.fillStyle=col;c.lineWidth=2*(RW+VERGE+grow);c.stroke(line);for(const[bx,by,r]of blobs){c.beginPath();c.arc(bx,by,r+grow,0,TAU);c.fill()}};
  x.lineJoin='round';land(x,dark(th.rim,.72),7);land(x,th.rim,5);land(lx,th.v1,0);
  lx.globalCompositeOperation='source-atop';lx.fillStyle=th.v2;for(let Y=0;Y<WS;Y+=32)for(let X=0;X<WS;X+=32)if((X+Y)/32&1)lx.fillRect(X,Y,32,32);
  lx.fillStyle=dark(th.v2,.9);for(let i=0;i<2600;i++)lx.fillRect(rn()*WS|0,rn()*WS|0,2,2);lx.fillStyle='rgba(255,255,255,.16)';for(let i=0;i<1400;i++)lx.fillRect(rn()*WS|0,rn()*WS|0,2,1);
  x.drawImage(lc,0,0);
  /* 3. the road: kerbstones, striped kerbs on the bends, asphalt, edge lines, centre dashes */
  const rc=mkCanvas(WS,WS),rx=rc.getContext('2d');rx.lineJoin='round';rx.lineCap='butt';
  rx.strokeStyle=th.edge;rx.lineWidth=2*RW+7;rx.stroke(line);
  rx.lineCap='round';rx.strokeStyle=th.k1;rx.lineWidth=2*RW+15;rx.stroke(bends);rx.lineCap='butt';rx.setLineDash([9,9]);rx.strokeStyle=th.k2;rx.stroke(bends);rx.setLineDash([]);
  rx.strokeStyle=th.road;rx.lineWidth=2*RW;rx.stroke(line);rx.strokeStyle=th.line;rx.lineWidth=2*(RW-3);rx.stroke(line);rx.strokeStyle=th.road;rx.lineWidth=2*(RW-5);rx.stroke(line);
  rx.setLineDash([44,44]);rx.strokeStyle=th.r2;rx.stroke(line);rx.setLineDash([]);
  rx.globalCompositeOperation='source-atop';rx.fillStyle='rgba(255,255,255,.1)';for(let i=0;i<5200;i++)rx.fillRect(rn()*WS|0,rn()*WS|0,2,1);rx.fillStyle='rgba(0,0,0,.14)';for(let i=0;i<5200;i++)rx.fillRect(rn()*WS|0,rn()*WS|0,2,2);
  rx.globalCompositeOperation='source-over';rx.setLineDash([14,18]);rx.strokeStyle=th.mid;rx.lineWidth=2.5;rx.stroke(line);rx.setLineDash([]);
  /* zebra crossings, the boxes on the starting grid, the start line and the speed pads */
  for(const f of def.walk||[]){const i=Math.round(f*N)%N;rx.save();rx.translate(sx[i],sy[i]);rx.rotate(ta[i]);rx.fillStyle=th.road;rx.fillRect(-8,-RW+5,16,2*RW-10);rx.fillStyle='#f4f4f8';for(let u=-RW+7;u<RW-9;u+=8)rx.fillRect(-6,u,12,4);rx.restore()}
  for(let s=0;s<8;s++){const i=((N-3-(s>>1)*3)%N+N)%N;rx.save();rx.translate(sx[i],sy[i]);rx.rotate(ta[i]);rx.translate(0,s&1?13:-13);rx.fillStyle='#f4f4f8';rx.fillRect(7,-9,2,18);rx.fillRect(1,-9,6,2);rx.fillRect(1,7,6,2);rx.restore()}
  rx.save();rx.translate(sx[0],sy[0]);rx.rotate(ta[0]);for(let u=-RW;u<RW;u+=6)for(let v=0;v<2;v++){rx.fillStyle=((u+RW)/6+v)&1?'#1a1424':'#ffffff';rx.fillRect(v*6-6,u,6,6)}rx.restore();
  const pads=def.pads.map(f=>{const i=Math.round(f*N)%N;rx.save();rx.translate(sx[i],sy[i]);rx.rotate(ta[i]);rx.fillStyle='#ff8a1a';rx.fillRect(-13,-15,26,30);rx.fillStyle='#fff2a0';
    for(const o of[-9,-1,7]){rx.beginPath();rx.moveTo(o,-11);rx.lineTo(o+7,0);rx.lineTo(o,11);rx.lineTo(o+3,11);rx.lineTo(o+10,0);rx.lineTo(o+3,-11);rx.fill()}rx.restore();return{x:sx[i],y:sy[i]}});
  x.drawImage(rc,0,0);
  const tex=new Uint32Array(x.getImageData(0,0,WS,WS).data.buffer);
  /* what a kart is standing on: 1 the road, 0 the verge (slow), 9 nothing at all */
  const sm=new Uint8Array(WS*WS),la=lx.getImageData(0,0,WS,WS).data,ra=rx.getImageData(0,0,WS,WS).data;for(let p=0,q=3;p<sm.length;p++,q+=4)sm[p]=ra[q]>127?1:la[q]>127?2:0;
  const surf=(X,Y)=>{if(X<3||Y<3||X>WS-4||Y>WS-4)return 9;const v=sm[Y*WS+X];return v===1?1:v===2?0:9};
  /* things beside the road: arrow boards round the outside of the bends, then whatever grows here */
  const scn=[];const clear=(X,Y,m)=>!scn.some(o=>Math.hypot(o.x-X,o.y-Y)<m);
  for(let i=0,lastB=-9;i<N;i++)if(Math.abs(curv[i])>.0105&&i-lastB>=5){const[X,Y]=at(i,-Math.sign(curv[i])*(RW+13));if(surf(X|0,Y|0)===0&&clear(X,Y,26)){scn.push({x:X,y:Y,spr:SCN.sign,solid:true,r:5});lastB=i}}
  for(let tries=0;tries<2600&&scn.length<76;tries++){const X=30+rn()*(WS-60),Y=30+rn()*(WS-60);if(surf(X|0,Y|0)!==0||gd[(Y>>2)*256+(X>>2)]<RW+14||!clear(X,Y,36))continue;
    const kind=th.scn[rn()*th.scn.length|0];scn.push({x:X,y:Y,spr:SCN[kind],solid:kind!=='flowers',r:kind==='tower'?12:kind==='cone'?4:6})}
  scn.push({x:sx[0],y:sy[0],spr:SCN.gantry,solid:false,r:0,fade:92});
  const mini=mkCanvas(46,46),mx=mini.getContext('2d');mx.fillStyle='rgba(10,10,30,.45)';mx.fillRect(0,0,46,46);mx.strokeStyle='#ffffff';mx.lineWidth=2.4;mx.beginPath();for(let i=0;i<N;i+=2)mx.lineTo(1+sx[i]/WS*44,1+sy[i]/WS*44);mx.closePath();mx.stroke();
  const thumb=mkCanvas(92,92);thumb.getContext('2d').drawImage(tc,0,0,92,92);
  const far=mkCanvas(512,44),fx=far.getContext('2d');fx.fillStyle=th.far;for(let X=0;X<512;X++){const a=X/512*TAU,h=def.th==='night'?10+((X>>4)*37%23):16+Math.sin(a*3+ti)*9+Math.sin(a*7+1)*5+Math.sin(a*13)*2;fx.fillRect(X,44-h,1,h)}
  if(def.th==='night'){fx.fillStyle='#ffe07a';for(let i=0;i<120;i++){const X=rn()*512|0,hh=10+((X>>4)*37%23);fx.fillRect(X,44-rn()*hh|0,1,1)}}
  return builtTracks[ti]={def,th,N,sx,sy,ta,curv,gi,gd,tex,surf,at,pads,scn,mini,thumb,far,out:shade(th.out,1),len}}

/* ---------- a race ---------- */
let SC=2,VW=250,VH=178,Y0=64,FH=114,F=170,CX=125,fcv=null,fctx=null,fimg=null,fbuf=null,T=0,R=null,state='title',gp=null,cam={x:0,y:0,a:0},engine=null,demoT=0,selSpin=0,SEL=null,hudT=0;
const CAMH=26,CAMD=64;
const SFX={count(){SND.tone(440,.14,{vol:.08})},go(){SND.tone(880,.4,{vol:.09})},item(){SND.tone(784,.05,{vol:.05})},got(){SND.tone(1047,.08,{vol:.07});SND.tone(1568,.14,{vol:.07,at:.08})},
  boost(){SND.noise(.35,{hp:900,vol:.09});SND.tone(220,.35,{to:880,vol:.06,type:'sawtooth'})},hit(){SND.tone(300,.4,{to:70,vol:.1,type:'sawtooth'});SND.noise(.2,{lp:1200,vol:.14})},
  bump(){SND.tone(110,.07,{type:'triangle',vol:.14})},berry(){SND.tone(1319,.05,{vol:.05});SND.tone(1760,.09,{vol:.05,at:.05})},hop(){SND.tone(300,.07,{to:520,vol:.04})},
  shoot(){SND.tone(700,.16,{to:240,vol:.07})},drop(){SND.tone(240,.12,{to:120,vol:.08,type:'triangle'})},pop(){SND.tone(900,.1,{to:300,vol:.07})},spark(){SND.tone(1400,.04,{vol:.03})},
  fall(){SND.tone(620,.5,{to:90,vol:.09,type:'triangle'});SND.noise(.35,{lp:1400,vol:.12,at:.32})},rescue(){[523,659,784].forEach((f,i)=>SND.tone(f,.12,{vol:.06,type:'triangle',at:i*.1}))},land(){SND.tone(196,.1,{type:'triangle',vol:.12});SND.tone(392,.12,{vol:.05,at:.06})},
  lap(){[784,1047,1319].forEach((f,i)=>SND.tone(f,.12,{vol:.07,at:i*.09}))},fin(){[523,659,784,1047,784,1047,1319,1568].forEach((f,i)=>SND.tone(f,.16,{vol:.07,at:i*.11}))}};
const SONG={bpm:164,ch:[
  SND.seq('square',.028,'E5 E5 . E5 . G5 . E5 . D5 . B4 . D5 . . E5 E5 . E5 . G5 . A5 . B5 - - . A5 G5 . C5 C5 . C5 . E5 . C5 . B4 . G4 . B4 . . D5 D5 . D5 . F#5 . A5 . B5 - A5 - F#5 . .'),
  SND.seq('triangle',.08,'E2 . E3 . E2 . E3 . E2 . E3 . E2 . E3 . E2 . E3 . E2 . E3 . G2 . G3 . G2 . G3 . C3 . C3 . C3 . C3 . C3 . C3 . G2 . G2 . D3 . D3 . D3 . D3 . B2 . B2 . B2 . B2 .'),
  SND.seq('drum',.045,'k . h . s . h h k . h . s . h .')]};
function mkKart(ri,slot,isP){const tr=R.tr,cc=CC[R.cc],[x,y,a]=tr.at(tr.N-3-(slot>>1)*3,slot&1?13:-13);
  return{ri,n:RACERS[ri].n,isP,x,y,a,va:a,v:0,s:0,spin:0,spinA:0,boost:0,inv:0,shield:0,safe:0,item:null,roul:0,berries:0,lap:-1,cp:7,idx:tr.N-3,okIdx:tr.N-3,fall:null,fin:0,drift:0,driftT:0,hop:0,padT:0,wrong:0,
    top:cc.top,acc:95,turn:2.25,mass:1,ai:{lane:0,cl:slot&1?13:-13,laneT:rnd()*3,skill:cc.ai*(.95+rnd()*.07),itemT:0}}}
function startRace(ti,opts={}){const tr=buildTrack(ti);pcv=null;R={ti,tr,cc:opts.cc!=null?opts.cc:S.v.cc,karts:[],crates:[],berries:[],shots:[],traps:[],parts:[],t:0,st:'count',count:opts.demo?0:3.6,laps:3,P:null,order:[],demo:!!opts.demo,finT:0,msgT:0};
  const others=[0,1,2,3,4,5,6,7].filter(i=>opts.demo||i!==S.v.racer);for(let i=others.length-1;i>0;i--){const j=ri(i+1);[others[i],others[j]]=[others[j],others[i]]}
  others.slice(0,opts.demo?8:7).forEach((r,s)=>R.karts.push(mkKart(r,s,false)));if(!opts.demo){R.P=mkKart(S.v.racer,7,true);R.karts.push(R.P)}
  for(const f of tr.def.crates)for(const o of[-21,-7,7,21]){const[x,y]=tr.at(Math.round(f*tr.N),o);R.crates.push({x,y,t:0})}
  for(let b=0;b<9;b++){const i=Math.round((b+.5)/9*tr.N),o=b%2?15:-15;for(let k=0;k<3;k++){const[x,y]=tr.at(i+k*2,o);R.berries.push({x,y,t:0})}}
  const k0=R.P||R.karts[0];cam.a=k0.a;cam.x=k0.x-Math.cos(cam.a)*CAMD;cam.y=k0.y-Math.sin(cam.a)*CAMD;
  if(R.demo){R.st='race';for(const k of R.karts)k.v=60}else{state='race';closeMenu();hud.hidden=false;SND.stop();msg(tr.def.name,2.2)}}
const metric=k=>{const N=R.tr.N,sec=Math.floor(k.idx*8/N);return k.fin?1e9-k.fin:k.lap*N+(sec===k.cp?k.idx:sec===(k.cp+1)%8?k.idx:k.cp*N/8)};
function ranks(){const o=R.karts.slice().sort((a,b)=>metric(b)-metric(a));o.forEach((k,i)=>k.rank=i+1);return o}
function hit(k,by){if(k.fall||k.inv>0||k.safe>0||k.fin&&k.isP)return;if(k.shield>0){k.shield=0;k.safe=.6;if(k.isP)SFX.pop();return}k.spin=1.1;k.safe=2.4;k.boost=0;k.drift=0;k.berries=Math.max(0,k.berries-3);if(k.isP||(by&&by.isP))SFX.hit();
  for(let i=0;i<8;i++)R.parts.push({k,ox:(rnd()-.5)*26,oy:-rnd()*16,vx:(rnd()-.5)*60,vy:-30-rnd()*50,l:.6,c:pick(['#ffd23f','#ffffff','#ff5a3a'])})}
function giveItem(k){const r=k.rank||4,w=r===1?{mud:45,snow:25,bubble:20,pepper:10}:r<=3?{snow:30,mud:20,pepper:20,hornet:15,bubble:15}:r<=6?{pepper:30,hornet:25,snow:20,bubble:10,fire:10,mud:5}:{fire:30,pepper:35,hornet:25,snow:10};
  let t=0;for(const i in w)t+=w[i];let x=rnd()*t;for(const i in w){x-=w[i];if(x<=0){k.item=i;break}}k.ai.itemT=1+rnd()*3.5;if(k.isP)SFX.got()}
function useItem(k){const it=k.item;if(!it||k.spin>0||k.fall)return;k.item=null;const ca=Math.cos(k.a),sa=Math.sin(k.a);
  if(it==='pepper'){k.boost=1.7;if(k.isP)SFX.boost()}
  else if(it==='snow'){R.shots.push({type:'snow',x:k.x+ca*12,y:k.y+sa*12,a:k.a,v:Math.max(k.v,40)+170,life:3.2,owner:k});if(k.isP)SFX.shoot()}
  else if(it==='hornet'){const o=ranks(),tg=o[k.rank-2]||null;R.shots.push({type:'hornet',x:k.x+ca*12,y:k.y+sa*12,a:k.a,v:230,life:8,owner:k,tg});if(k.isP)SFX.shoot()}
  else if(it==='mud'){R.traps.push({x:k.x-ca*14,y:k.y-sa*14,life:50,owner:k,arm:.6});if(k.isP)SFX.drop()}
  else if(it==='bubble'){k.shield=14;if(k.isP)SFX.got()}
  else if(it==='fire'){k.inv=6;if(k.isP)SFX.boost()}}
function aiInput(k,dt){const tr=R.tr,N=tr.N,la=9+Math.round(k.v/16),A=k.ai;A.laneT-=dt;if(A.laneT<=0){A.laneT=1.5+rnd()*3;A.lane=(rnd()*2-1)*RW*.5}A.cl+=(A.lane-A.cl)*Math.min(1,dt*1.2);
  const[tx,ty]=tr.at(k.idx+la,A.cl),d=angd(Math.atan2(ty-k.y,tx-k.x),k.a),c=Math.abs(angd(tr.ta[(k.idx+24)%N],tr.ta[(k.idx+5)%N]));
  let band=1;if(R.P&&!R.P.fin){band=clamp(1+(metric(R.P)-metric(k))*DS/2000,.93,1.12)}
  const lim=k.top*(1-clamp(c-.6,0,1)*.3)*A.skill*band;
  if(k.item&&!k.roul){A.itemT-=dt;if(A.itemT<=0)useItem(k)}
  return{s:clamp(d*3.2,-1,1),gas:k.v<lim,brake:k.v>lim+28,drift:false}}
/* a kart that has left the land: it drops out of sight, then the rescue balloon carries it to the last stretch of road
   it drove on and lowers it down, facing the right way. It costs a couple of seconds and two berries. */
const FALL_T=.6,LIFT_T=1.7;
function fallOff(k){if(k.fall)return;R.falls=(R.falls||0)+1;k.fall={t:0,ph:0};k.drift=0;k.driftT=0;k.boost=0;k.inv=0;k.spin=0;k.shield=0;k.berries=Math.max(0,k.berries-2);
  if(k.isP){SFX.fall();msg(R.tr.th.oops,1.2)}
  for(let i=0;i<12;i++)R.parts.push({k,ox:(rnd()-.5)*24,oy:-rnd()*6,vx:(rnd()-.5)*80,vy:-40-rnd()*70,l:.55,c:pick(R.tr.th.splash)})}
function stepFall(k,dt){const f=k.fall,tr=R.tr;f.t+=dt;
  if(!f.ph){k.v*=Math.max(0,1-dt*4);k.x=clamp(k.x+Math.cos(k.va)*k.v*dt,2,WS-3);k.y=clamp(k.y+Math.sin(k.va)*k.v*dt,2,WS-3);
    if(f.t>=FALL_T){f.ph=1;const[x,y,a]=tr.at(k.okIdx,((R.karts.indexOf(k)%3)-1)*12);k.x=x;k.y=y;k.a=k.va=a;k.s=0;k.v=0;k.idx=((k.okIdx%tr.N)+tr.N)%tr.N;k.wrong=0;if(k.isP){cam.a=a;SFX.rescue()}}}
  else if(f.t>=FALL_T+LIFT_T){k.fall=null;k.safe=1.5;k.v=30;if(k.isP)SFX.land()}}
function stepKart(k,inp,dt){const tr=R.tr,N=tr.N;
  for(const t of['boost','inv','shield','safe','padT','hop'])if(k[t]>0)k[t]=Math.max(0,k[t]-dt);
  if(k.fall){stepFall(k,dt);return}
  if(k.roul>0){k.roul-=dt;if(k.roul<=0)giveItem(k);else if(k.isP&&Math.floor(k.roul*12)!==Math.floor((k.roul+dt)*12))SFX.item()}
  const sf=tr.surf(k.x|0,k.y|0),fast=k.boost>0||k.inv>0,top=k.top*(1+k.berries*.012)*(k.inv>0?1.2:1),maxV=fast?top*(k.boost>0?1.42:1):top*(sf===1?1:.6);
  if(k.spin>0){k.spin-=dt;k.spinA+=dt*15;k.v=Math.max(15,k.v-170*dt);inp={s:0,gas:false,brake:false,drift:false}}
  k.s+=(inp.s-k.s)*Math.min(1,dt*10);
  if(inp.gas&&k.v<maxV)k.v+=k.acc*(fast?2.4:1)*(1-clamp(k.v/maxV,0,1)*.75)*dt;else if(!inp.gas&&k.v>0)k.v=Math.max(0,k.v-55*dt);
  if(k.v>maxV)k.v=Math.max(maxV,k.v-(sf===1?90:210)*dt);
  if(inp.brake)k.v=Math.max(-45,k.v-(k.v>0?230:70)*dt);
  /* drifting: hop, then slide with the nose tucked in; the longer the slide, the bigger the kick when it is let go */
  if(inp.drift&&!k.dh){k.hop=.22;if(k.isP)SFX.hop();if(Math.abs(k.s)>.25&&k.v>55){k.drift=Math.sign(k.s);k.driftT=0}}
  if(k.drift&&(!inp.drift||k.v<40||sf!==1&&!fast)){if(!inp.drift&&k.driftT>.8){k.boost=Math.max(k.boost,k.driftT>1.7?1.25:.65);if(k.isP)SFX.boost()}k.drift=0;k.driftT=0}
  k.dh=inp.drift;let st=k.s;if(k.drift){k.driftT+=dt;st=k.drift*(.62+.5*k.s*k.drift);if(k.isP&&(Math.floor(k.driftT/.85)!==Math.floor((k.driftT-dt)/.85))&&k.driftT<2)SFX.spark()}
  const sp=clamp(k.v/55,-1,1);k.a+=st*k.turn*sp*(1-.22*clamp(k.v/k.top,0,1))*(k.drift?1.18:1)*dt;
  k.va+=angd(k.a,k.va)*Math.min(1,dt*(k.drift?2.6:9));
  let nx=k.x+Math.cos(k.va)*k.v*dt,ny=k.y+Math.sin(k.va)*k.v*dt;
  for(const o of tr.scn)if(o.solid){const dx=nx-o.x,dy=ny-o.y,d=Math.hypot(dx,dy),m=o.r+6;if(d<m&&d>0){nx=o.x+dx/d*m;ny=o.y+dy/d*m;if(k.v>40){k.v*=.45;if(k.isP)SFX.bump()}}}
  k.x=nx;k.y=ny;const sf2=tr.surf(nx|0,ny|0);
  /* off the edge of the land (a hop can carry a kart over a corner of it) */
  if(sf2===9&&k.hop<=0){fallOff(k);return}
  /* which part of the lap the kart is on: the eight sectors have to be passed in order for a lap to count */
  const gi=tr.gi[(k.y>>2)*256+(k.x>>2)];if(gi>=0){k.idx=gi;if(sf2===1&&Math.abs(angd(k.va,tr.ta[gi]))<1.5)k.okIdx=gi;const sec=Math.floor(gi*8/N);if(sec===(k.cp+1)%8){k.cp=sec;if(sec===0){k.lap++;if(k.lap>=R.laps&&!k.fin){k.fin=R.t;R.order.push(k);if(k.isP)finishPlayer()}else if(k.isP&&k.lap>0){SFX.lap();msg(k.lap===R.laps-1?'FINAL LAP!':'LAP '+(k.lap+1),1.6)}}}
    if(k.isP){k.wrong=Math.abs(angd(k.va,tr.ta[gi]))>2.1&&k.v>30?k.wrong+dt:0}}
  for(const p of tr.pads)if(k.padT<=0&&Math.abs(k.x-p.x)<15&&Math.abs(k.y-p.y)<15){k.boost=Math.max(k.boost,.9);k.padT=1;if(k.isP)SFX.boost()}}
function stepRace(dt){const tr=R.tr;R.t+=dt;
  if(R.st==='count'){const o=R.count;R.count-=dt;for(const n of[3,2,1])if(o>n&&R.count<=n){SFX.count();msg(String(n),.9)}
    if(R.count<=0){R.st='race';R.t=0;SFX.go();msg('GO!',1);SND.play(SONG);const P=R.P,early=P.rev;if(early>0&&early<.65){P.boost=1.1;P.v=60;SFX.boost()}}
    else{const P=R.P,gas=S.v.gas?held.a:held.a;if(gas)P.rev=(P.rev||0)+dt;else P.rev=0;return}}
  ranks();
  for(const k of R.karts){let inp;if(k.isP&&!k.fin){const ax=Math.abs(stickX)>.18?clamp(stickX*1.25,-1,1):(held.right?1:0)-(held.left?1:0);inp={s:ax,gas:S.v.gas?held.a:!held.down,brake:held.down,drift:held.b}}else inp=aiInput(k,dt);stepKart(k,inp,dt)}
  /* karts bump each other; fireflies knock the others spinning */
  for(let i=0;i<R.karts.length;i++)for(let j=i+1;j<R.karts.length;j++){const a=R.karts[i],b=R.karts[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<13&&d>0&&!a.fall&&!b.fall){const p=(13-d)/2,ux=dx/d,uy=dy/d,ma=b.mass/(a.mass+b.mass),mb=1-ma;
      a.x-=ux*p*2*ma;a.y-=uy*p*2*ma;b.x+=ux*p*2*mb;b.y+=uy*p*2*mb;if(a.inv>0&&!b.inv)hit(b,a);else if(b.inv>0&&!a.inv)hit(a,b);else if((a.isP||b.isP)&&Math.abs(a.v-b.v)>25)SFX.bump()}}
  for(const c of R.crates){if(c.t>0){c.t-=dt;continue}for(const k of R.karts)if(!k.fall&&Math.abs(k.x-c.x)<11&&Math.abs(k.y-c.y)<11){c.t=2.6;if(!k.item&&!k.roul)k.roul=k.isP?.9:.4;break}}
  for(const b of R.berries){if(b.t>0){b.t-=dt;continue}for(const k of R.karts)if(!k.fall&&Math.abs(k.x-b.x)<9&&Math.abs(k.y-b.y)<9){b.t=9;if(k.berries<10)k.berries++;if(k.isP)SFX.berry();break}}
  for(const s of R.shots){s.life-=dt;if(s.type==='hornet'&&s.tg&&!s.tg.fin){s.a+=clamp(angd(Math.atan2(s.tg.y-s.y,s.tg.x-s.x),s.a),-4*dt,4*dt)}
    s.x+=Math.cos(s.a)*s.v*dt;s.y+=Math.sin(s.a)*s.v*dt;if(s.x<4||s.y<4||s.x>WS-4||s.y>WS-4||(s.type==='snow'&&tr.surf(s.x|0,s.y|0)===9))s.life=0;
    for(const k of R.karts)if((k!==s.owner||s.life<(s.type==='snow'?2.6:7))&&Math.abs(k.x-s.x)<10&&Math.abs(k.y-s.y)<10){hit(k,s.owner);s.life=0;break}}
  for(const t of R.traps){t.life-=dt;t.arm-=dt;for(const k of R.karts)if((k!==t.owner||t.arm<=0)&&Math.abs(k.x-t.x)<9&&Math.abs(k.y-t.y)<9){hit(k,t.owner);t.life=0;break}}
  R.shots=R.shots.filter(s=>s.life>0);R.traps=R.traps.filter(t=>t.life>0);
  for(let i=R.parts.length-1;i>=0;i--){const p=R.parts[i];p.l-=dt;if(p.l<=0){R.parts.splice(i,1);continue}p.ox+=p.vx*dt;p.oy+=p.vy*dt;p.vy+=160*dt}
  /* sparks, flames and dust behind the karts the player can see */
  const P=R.P||R.karts[demoCam()];
  if(P.fall){}
  else if(P.drift&&P.driftT>.8&&rnd()<dt*40)for(const sd of[-1,1])R.parts.push({k:P,ox:sd*9+(rnd()-.5)*3,oy:-1,vx:sd*30+(rnd()-.5)*30,vy:-20-rnd()*30,l:.25,c:P.driftT>1.7?'#ffb02a':'#6ad8ff'});
  if(P.boost>0&&!P.fall&&rnd()<dt*50)R.parts.push({k:P,ox:(rnd()-.5)*10,oy:-3,vx:(rnd()-.5)*20,vy:10+rnd()*20,l:.25,c:pick(['#ff5a1a','#ffd23f','#ffffff'])});
  if(P.v>50&&!P.fall&&tr.surf(P.x|0,P.y|0)!==1&&rnd()<dt*30)R.parts.push({k:P,ox:(rnd()-.5)*16,oy:-1,vx:(rnd()-.5)*30,vy:-10-rnd()*20,l:.35,c:dark(tr.th.v2,.8)});
  if(R.st==='fin'){R.finT+=dt;if(R.finT>3.2&&state==='race')results()}
  if(R.msgT>0){R.msgT-=dt;if(R.msgT<=0)$('#hMsg').textContent=''}}
function msg(t,d){$('#hMsg').textContent=t;R.msgT=d;const e=$('#hMsg');e.classList.remove('go');void e.offsetWidth;e.classList.add('go')}
const demoCam=()=>Math.floor(demoT/7)%R.karts.length;
const ORD=['1ST','2ND','3RD','4TH','5TH','6TH','7TH','8TH'];
const clock=t=>{const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(2)};
function finishPlayer(){R.st='fin';R.finT=0;ranks();SND.stop();SFX.fin();msg('FINISH!  '+ORD[R.P.rank-1],3);stopEngine();
  const b=S.v.best[R.ti];if(!b||R.P.fin<b){S.v.best[R.ti]=+R.P.fin.toFixed(2);R.newBest=true}S.save()}

/* ---------- drawing ---------- */
function drawFloor(){const tr=R.tr,ca=Math.cos(cam.a),sa=Math.sin(cam.a),tex=tr.tex,out=tr.out,b=fbuf;let o=0;
  for(let r=0;r<FH;r++){const z=CAMH*F/(r+1),zx=z/F;let wx=cam.x+ca*z+sa*CX*zx,wy=cam.y+sa*z-ca*CX*zx;const dx=-sa*zx,dy=ca*zx;
    for(let c=0;c<VW;c++){b[o++]=wx>=0&&wy>=0&&wx<WS&&wy<WS?tex[(wy|0)*WS+(wx|0)]:out;wx+=dx;wy+=dy}}
  fctx.putImageData(fimg,0,0);g.drawImage(fcv,0,Y0)}
function proj(x,y){const dx=x-cam.x,dy=y-cam.y,ca=Math.cos(cam.a),sa=Math.sin(cam.a),z=dx*ca+dy*sa;if(z<5)return null;const sc=F/z;return{sx:CX+(-dx*sa+dy*ca)*sc,sy:Y0+CAMH*sc,sc,z}}
let skyC=null,fogC=null;
function draw(){if(!R)return;const tr=R.tr,th=tr.th,view=R.P||R.karts[demoCam()];
  g.drawImage(skyC,0,0,VW,Y0+1);if(th.stars){g.fillStyle='#ffffff';for(let i=0;i<40;i++){const x=((i*97+((-cam.a/TAU*1024)|0))%VW+VW)%VW;g.fillRect(x,(i*53)%Math.max(1,Y0-14),1,1)}}
  const off=((cam.a/TAU*1024)%512+512)%512;for(let x=-off;x<VW;x+=512)g.drawImage(tr.far,Math.round(x),Y0-44);
  drawFloor();g.drawImage(fogC,0,Y0,VW,26);
  const L=[];
  for(const o of tr.scn){const p=proj(o.x,o.y);if(p&&p.z<560&&p.sx>-60&&p.sx<VW+60)L.push({z:p.z,p,spr:o.spr,k:1,fade:o.fade})}
  for(const c of R.crates)if(c.t<=0){const p=proj(c.x,c.y);if(p&&p.z<420)L.push({z:p.z,p,spr:ICON.crate,k:.62,lift:3+Math.sin(T*4+c.x)*1.5})}
  for(const b of R.berries)if(b.t<=0){const p=proj(b.x,b.y);if(p&&p.z<300)L.push({z:p.z,p,spr:ICON.berry,k:.6,lift:1.5})}
  for(const s of R.shots){const p=proj(s.x,s.y);if(p)L.push({z:p.z,p,spr:s.type==='snow'?ICON.snow:ICON.hornet,k:.6,lift:s.type==='snow'?1:5+Math.sin(T*20)*1})}
  for(const t of R.traps){const p=proj(t.x,t.y);if(p)L.push({z:p.z,p,spr:ICON.mud,k:.7})}
  for(const k of R.karts){const p=proj(k.x,k.y);if(p&&p.z<520&&(p.z>30||k===view))L.push({z:p.z,p,kart:k})}
  L.sort((a,b)=>b.z-a.z);
  for(const o of L){const p=o.p,sc=p.sc;if(o.kart){const k=o.kart,rel=k.a+(k.spin>0?k.spinA:0)-(cam.a+Math.atan2(p.sx-CX,F)),f=((Math.round(rel/(TAU/NF))%NF)+NF)%NF,spr=KSPR[k.ri][f],s=sc/1.7,hop=Math.sin(Math.min(1,k.hop/.22)*Math.PI)*4*sc;
      if(p.sx<-40||p.sx>VW+40)continue;
      if(k.fall){const fl=k.fall,th=tr.th;
        if(!fl.ph){const u=clamp(fl.t/FALL_T,0,1);g.globalAlpha=1-u*.55;g.drawImage(spr,Math.round(p.sx-24*s),Math.round(p.sy-35*s+48*s*u*.74),48*s,48*s*(1-u*.9));g.globalAlpha=1-u;
          g.strokeStyle=th.splash[0];g.lineWidth=Math.max(1,sc*.8);g.beginPath();g.ellipse(p.sx,p.sy,(7+u*18)*sc,(2+u*5)*sc,0,0,TAU);g.stroke();g.globalAlpha=1}
        else{const u=clamp((fl.t-FALL_T)/LIFT_T,0,1),d=clamp(u/.78,0,1),lift=(1-d)*(1-d)*46,away=clamp((u-.78)/.22,0,1),B=SCN.balloon,bk=sc*.95,bw=B.width*bk,bh=B.height*bk,ky=p.sy-lift*sc,top=ky-19*sc-away*46*sc;
          const sh=.45+.45*d;g.drawImage(ICON.shadow,p.sx-12*sc*sh,p.sy-3*sc,24*sc*sh,7*sc);
          g.globalAlpha=1-away;g.strokeStyle='#5a3a1a';g.lineWidth=Math.max(1,sc*.7);g.beginPath();g.moveTo(p.sx,top);g.lineTo(p.sx,ky-12*sc);g.stroke();g.drawImage(B,Math.round(p.sx-bw/2),Math.round(top-bh),bw,bh);g.globalAlpha=1;
          g.drawImage(spr,Math.round(p.sx-24*s),Math.round(ky-35*s),48*s,48*s)}
        for(const q of R.parts)if(q.k===k){g.fillStyle=q.c;const z=Math.max(1,Math.round(sc*1.3));g.fillRect(p.sx+q.ox*sc,p.sy+q.oy*sc,z,z)}continue}
      g.drawImage(ICON.shadow,p.sx-12*sc*.9,p.sy-3*sc,24*sc*.9,7*sc);
      if(!(k.safe>0&&k.spin<=0&&Math.floor(T*20)%2)){if(k!==view&&p.z<CAMD-5)g.globalAlpha=.45;g.drawImage(spr,Math.round(p.sx-24*s),Math.round(p.sy-35*s-hop),48*s,48*s);g.globalAlpha=1}
      if(k.shield>0){g.strokeStyle='rgba(160,230,255,.85)';g.lineWidth=Math.max(1,sc);g.beginPath();g.arc(p.sx,p.sy-8*sc,12*sc,0,TAU);g.stroke()}
      if(k.inv>0)for(let i=0;i<5;i++){const a=T*5+i*1.26;g.fillStyle=i%2?'#d8ff5a':'#fff6a0';g.fillRect(p.sx+Math.cos(a)*12*sc,p.sy-8*sc+Math.sin(a*1.3)*8*sc,Math.max(1,sc*1.2),Math.max(1,sc*1.2))}
      for(const q of R.parts)if(q.k===k){g.fillStyle=q.c;const z=Math.max(1,Math.round(sc*1.3));g.fillRect(p.sx+q.ox*sc,p.sy+q.oy*sc,z,z)}}
    else{const w=o.spr.width*sc*o.k,h=o.spr.height*sc*o.k;if(h<1.5)continue;if(o.fade){const al=clamp((p.z-o.fade)/50,0,1);if(al<=0)continue;g.globalAlpha=al}g.drawImage(o.spr,Math.round(p.sx-w/2),Math.round(p.sy-h-(o.lift||0)*sc),w,h);g.globalAlpha=1}}
  if(state==='race'&&R.P&&!draw.bare){const P=R.P,bx=CX-11;g.fillStyle='rgba(10,10,30,.55)';g.fillRect(bx,4,22,22);g.strokeStyle=P.item?'#ffd23f':'#ffffff';g.lineWidth=1;g.strokeRect(bx+.5,4.5,21,21);
    const ic=P.roul>0?ICON[Object.keys(ITEM_NAMES)[Math.floor(T*14)%6]]:P.item?ICON[P.item]:null;if(ic)g.drawImage(ic,bx+3,7);
    if(PANEL&&PANEL.shown)return;const mx=VW-50,my=VH-50;g.drawImage(tr.mini,mx,my);for(const k of R.karts){if(k===P)continue;g.fillStyle='#ffffff';g.fillRect(mx+k.x/WS*44,my+k.y/WS*44,2,2)}g.fillStyle='#ffd23f';g.fillRect(mx+P.x/WS*44-1,my+P.y/WS*44-1,4,4);g.fillStyle='#1a1424';g.fillRect(mx+P.x/WS*44,my+P.y/WS*44,2,2)}
}
let pcv=null;
/* the second screen: the whole track from above with every kart on it */
function panelDraw(){if(!PANEL||!R.P)return;if(!pcv)pcv=PANEL.canvas(92,92,R.tr.def.name);if(!pcv)return;const x=pcv.getContext('2d'),P=R.P;x.imageSmoothingEnabled=false;x.drawImage(R.tr.thumb,0,0);
  for(const k of R.karts){if(k===P)continue;x.fillStyle='#1a1424';x.fillRect(k.x/WS*92-3,k.y/WS*92-3,6,6);x.fillStyle=RACERS[k.ri].kart;x.fillRect(k.x/WS*92-2,k.y/WS*92-2,4,4)}x.fillStyle='#1a1424';x.fillRect(P.x/WS*92-4,P.y/WS*92-4,8,8);x.fillStyle='#ffd23f';x.fillRect(P.x/WS*92-3,P.y/WS*92-3,6,6)}
function hudText(){const P=R.P;if(!P)return;if(PANEL){PANEL.rows([['PLACE',ORD[(P.rank||8)-1]],['LAP',clamp(P.lap+1,1,R.laps)+'/'+R.laps],['TIME',clock(P.fin||(R.st==='count'?0:R.t))],['BERRIES',P.berries],['TRICK',P.item?ITEM_NAMES[P.item]:'—']]);panelDraw()}
  $('#hLap').textContent='LAP '+clamp(P.lap+1,1,R.laps)+'/'+R.laps;$('#hTime').textContent=clock(P.fin||(R.st==='count'?0:R.t));$('#hPos').textContent=ORD[(P.rank||8)-1];
  $('#hBer').textContent='● '+P.berries;if(P.wrong>1&&R.msgT<=0)msg('WRONG WAY',.6)}
function startEngine(){stopEngine();const c=SND.ctx;if(!c||!SND.mode)return;try{const o=c.createOscillator(),f=c.createBiquadFilter(),gn=c.createGain();o.type='sawtooth';f.type='lowpass';f.frequency.value=500;gn.gain.value=.022;o.connect(f);f.connect(gn);gn.connect(SND.out);o.start();engine={o,gn}}catch(e){}}
function stopEngine(){if(engine){try{engine.o.stop()}catch(e){}engine=null}}

/* ---------- screens ---------- */
const soundItem=()=>({t:'SOUND',v:()=>SOUND_NAMES[S.v.sound],adj:d=>{S.v.sound=(S.v.sound+d+3)%3;SND.mode=S.v.sound;S.save()}});
const ccItem=()=>({t:'SPEED',v:()=>CC[S.v.cc].n,adj:d=>{S.v.cc=(S.v.cc+d+3)%3;S.save()}});
function title(){state='title';gp=null;hud.hidden=true;SEL=null;if(PANEL){PANEL.clear();pcv=null}stopEngine();SND.stop();if(!R||!R.demo)startRace(ri(3),{demo:true,cc:1});
  menu({cls:'title',html:'<h1 class="logo"><b>DRIFT</b><b>CRITTERS</b></h1>',items:[{t:'GRAND PRIX',fn:gpMenu},{t:'QUICK RACE',fn:quickMenu},{t:'GAS',v:()=>S.v.gas?'A BUTTON':'AUTO',adj:()=>{S.v.gas=S.v.gas?0:1;S.save()}},soundItem(),{t:'HOW TO PLAY',fn:how}]})}
let pickCup=0,pickTrack=0;
const cupOpen=i=>i===0||Object.keys(S.v.cups).some(k=>k[0]==='0'&&S.v.cups[k]<=3);
function menuToast(t){let e=$('.toast',ov);if(!e){e=el('p','toast');ov.append(e)}e.textContent=t}
/* ---------- choosing a critter: eight faces in a grid; the one under the cursor turns on a stand above its name ---------- */
const faceEl=ri=>{const c=mkCanvas(40,40);c.getContext('2d').drawImage(face(ri),0,0);return c};
function pickRacer(head,ok,back){closeMenu();SEL={i:S.v.racer,ok,back,done:false,hop:0,cols:4};ov.hidden=false;ov.className='sel';
  ov.innerHTML=`<h2>${head}</h2><div class="selmain"><div class="selshow"><canvas id="selCv" width="112" height="100"></canvas><div class="selname"><b></b></div></div><div class="selgrid"></div></div><p class="foot">ALL DRIVE THE SAME · A CHOOSE · B BACK</p>`;
  const grid=$('.selgrid',ov);RACERS.forEach((r,i)=>{const b=el('button','selt');b.tabIndex=-1;b.style.setProperty('--k',r.kart);b.append(faceEl(i));
    b.addEventListener('click',()=>{SND.unlock();if(!SEL||SEL.done)return;if(SEL.i===i)selOk();else{SEL.i=i;SND.ui.tick();selMark()}});grid.append(b)});
  selLayout();selMark()}
/* the screen is tall on the console and wide on its own: the grid goes under the stand, or beside it */
function selLayout(){if(!SEL)return;const side=VH<222,t=side?clamp(Math.floor((VH-44)/4),20,34):clamp(Math.min(Math.floor((VW-22)/4),Math.floor((VH-151)/2)),24,38);
  ov.classList.toggle('side',side);SEL.cols=side?2:4;ov.style.setProperty('--t',t);ov.style.setProperty('--pv',side?clamp(Math.min(VW-21-2*t,(VH-58)*1.12),64,112):112)}
function selMark(){const r=RACERS[SEL.i];$$('.selt',ov).forEach((b,n)=>b.classList.toggle('hot',n===SEL.i));$('.selname b',ov).textContent=r.n;ov.style.setProperty('--k',r.kart)}
function selInput(b){if(!SEL||SEL.done)return;const c=SEL.cols,n=RACERS.length;let i=SEL.i;
  if(b==='left')i=i%c===0?i+c-1:i-1;else if(b==='right')i=i%c===c-1?i-c+1:i+1;else if(b==='up')i=(i-c+n)%n;else if(b==='down')i=(i+c)%n;
  else if(b==='a'||b==='start'){selOk();return}else if(b==='b'){SND.ui.back();const f=SEL.back;SEL=null;f();return}else return;
  SEL.i=i;SND.ui.tick();selMark()}
function selOk(){SEL.done=true;SEL.hop=.45;S.v.racer=SEL.i;S.save();SND.ui.ok();SND.tone(1568,.18,{vol:.06,at:.14});const t=$$('.selt',ov)[SEL.i];if(t)t.classList.add('ok');$('.selname',ov).classList.add('ok');
  const me=SEL;setTimeout(()=>{if(SEL!==me)return;const f=me.ok;SEL=null;f()},620)}
function drawSel(){const c=$('#selCv',ov);if(!c||!SEL)return;const x=c.getContext('2d'),W=c.width,cx=W/2,cy=c.height-17,r=RACERS[SEL.i],K=r.kart,el2=(col,y,rx,ry)=>{x.fillStyle=col;x.beginPath();x.ellipse(cx,y,rx,ry,0,0,TAU);x.fill()};
  x.clearRect(0,0,W,c.height);x.imageSmoothingEnabled=false;
  el2('rgba(8,8,26,.5)',cy+8,50,12);el2(dark(K,.5),cy+5,46,11);el2(dark(K,.78),cy,46,11);el2(K,cy,40,9);
  /* the stand turns with the kart: light wedges going round it */
  x.save();x.beginPath();x.ellipse(cx,cy,40,9,0,0,TAU);x.clip();x.fillStyle='rgba(255,255,255,.3)';const a0=-selSpin/NF*TAU;
  for(let w=0;w<6;w++){const a=a0+w*TAU/6;x.beginPath();x.moveTo(cx,cy);for(let q=0;q<=4;q++){const b=a+q*TAU/48;x.lineTo(cx+Math.cos(b)*60,cy+Math.sin(b)*14)}x.fill()}x.restore();
  el2('rgba(8,8,26,.35)',cy+1,24,5);
  const hop=SEL.hop>0?Math.sin((1-SEL.hop/.45)*Math.PI)*13:0;x.drawImage(bigFrame(SEL.i,Math.floor(selSpin)%NF),cx-48,Math.round(cy-70-hop))}
/* ---------- then the cup or the course, each shown as a small map ---------- */
function setupHead(t){return `<h2>${t}</h2><div class="who" style="--k:${RACERS[S.v.racer].kart}"><span class="chip"></span><b>${RACERS[S.v.racer].n}</b></div><div class="cards" id="cards"></div>`}
function courseCards(list){const box=$('#cards',ov);if(!box)return;box.innerHTML='';box.classList.toggle('one',list.length===1);
  for(const ti of list){const d=el('div','card'),c=mkCanvas(64,64),b=S.v.best[ti];c.getContext('2d').drawImage(thumbOf(ti),0,0);d.append(c,el('span','',TRACKS[ti].name+(list.length===1?`<i>${b?'BEST '+clock(b):'NO TIME YET'}</i>`:'')));box.append(d)}}
function gpMenu(){pickRacer('CHOOSE YOUR CRITTER',gpSetup,title)}
function gpSetup(){menu({cls:'pick',html:setupHead('GRAND PRIX'),items:[{t:'CUP',v:()=>CUPS[pickCup].name+(cupOpen(pickCup)?'':' (LOCKED)'),adj:d=>{pickCup=(pickCup+d+2)%2;courseCards(CUPS[pickCup].t)}},ccItem(),
    {t:'START',fn:()=>{if(!cupOpen(pickCup)){menuToast('Finish in the top three of the Sprout Cup first.');return}gp={cup:pickCup,i:0,pts:new Array(8).fill(0)};startRace(CUPS[pickCup].t[0]);startEngine()}}],back:gpMenu});
  $('.chip',ov).append(faceEl(S.v.racer));courseCards(CUPS[pickCup].t)}
function quickMenu(){pickRacer('CHOOSE YOUR CRITTER',quickSetup,title)}
function quickSetup(){menu({cls:'pick',html:setupHead('QUICK RACE'),items:[{t:'COURSE',v:()=>(pickTrack+1)+' / '+TRACKS.length,adj:d=>{pickTrack=(pickTrack+d+6)%6;courseCards([pickTrack])}},ccItem(),{t:'START',fn:()=>{gp=null;startRace(pickTrack);startEngine()}}],back:quickMenu});
  $('.chip',ov).append(faceEl(S.v.racer));courseCards([pickTrack])}
function how(){menu({html:`<h2>HOW TO PLAY</h2><p class="keys">${S.v.gas?'<b>A</b> gas &nbsp; <b>▲</b> use your trick':'The kart drives itself &nbsp; <b>A</b> use your trick'}<br><b>◀ ▶</b> or the stick: steer &nbsp; <b>▼</b> brake<br><b>B</b> hop; hold it in a turn to drift, let go for a kick of speed<br><b>START</b> pause</p><p>Drive through crates for tricks. Berries make you faster. The verge beside the road slows you down, and if you go over the edge the rescue balloon sets you back on the road.</p>`,items:[{t:'BACK',fn:title}],back:title})}
function pause(){if(state!=='race'||R.st==='fin')return;state='pause';SND.pause(true);menu({html:'<h2>PAUSED</h2>',items:[{t:'RESUME',fn:resume},{t:'RESTART RACE',fn:()=>{SND.pause(false);startRace(R.ti);startEngine()}},soundItem(),{t:'QUIT',fn:()=>{SND.pause(false);title()}}],back:resume})}
function resume(){closeMenu();state='race';SND.pause(false)}
function results(){state='results';hud.hidden=true;const o=ranks(),PT=[10,8,6,5,4,3,2,1];if(gp)o.forEach((k,i)=>gp.pts[k.ri]+=PT[i]);
  const rows=o.map((k,i)=>`<tr class="${k.isP?'me':''}"><td>${ORD[i]}</td><td>${k.n}</td><td>${k.fin?clock(k.fin):'—'}</td>${gp?`<td>+${PT[i]}</td>`:''}</tr>`).join('');
  const last=gp&&gp.i>=CUPS[gp.cup].t.length-1;
  menu({cls:'res',html:`<h2>${R.tr.def.name}</h2><table>${rows}</table>${R.newBest?'<p>NEW BEST TIME!</p>':''}`,items:gp?[{t:last?'CUP RESULTS':'NEXT RACE',fn:()=>{if(last)cupEnd();else{gp.i++;startRace(CUPS[gp.cup].t[gp.i]);startEngine()}}}]:[{t:'RACE AGAIN',fn:()=>{startRace(R.ti);startEngine()}},{t:'TITLE',fn:title}],back:gp?null:title})}
function cupEnd(){const me=S.v.racer,o=RACERS.map((r,i)=>[i,gp.pts[i]]).sort((a,b)=>b[1]-a[1]),place=o.findIndex(x=>x[0]===me)+1,key=gp.cup+'-'+S.v.cc;
  if(!S.v.cups[key]||place<S.v.cups[key])S.v.cups[key]=place;S.save();if(place<=3)SFX.fin();
  const rows=o.map(([i,p],n)=>`<tr class="${i===me?'me':''}"><td>${ORD[n]}</td><td>${RACERS[i].n}</td><td>${p} PTS</td></tr>`).join('');
  menu({cls:'res',html:`<h2>${CUPS[gp.cup].name}</h2><p class="trophy">${place===1?'GOLD TROPHY!':place===2?'SILVER TROPHY!':place===3?'BRONZE TROPHY!':'NO TROPHY THIS TIME'}</p><table>${rows}</table>`,items:[{t:'TITLE',fn:title}],back:title})}

onBtn=(b,d)=>{if(SEL){if(d)selInput(b);return}if(M){if(d)menuInput(b);return}if(state!=='race'||!d||!R.P)return;if(b==='start')pause();else if(R.st==='race'&&!R.P.fin&&((S.v.gas&&(b==='up'||b==='select'||b==='c'))||(!S.v.gas&&(b==='a'||b==='select'||b==='c'))))useItem(R.P)};
function resize(){const W=innerWidth||500,H=innerHeight||350;SC=pickScale(W,H,176,150);VW=Math.floor(W/SC);VH=Math.floor(H/SC);cv.width=VW;cv.height=VH;stage.style.width=VW*SC+'px';stage.style.height=VH*SC+'px';stage.style.setProperty('--s',SC);
  g.imageSmoothingEnabled=false;Y0=Math.round(VH*.36);FH=VH-Y0;CX=VW/2;F=VW*.72;fcv=mkCanvas(VW,FH);fctx=fcv.getContext('2d');fimg=fctx.createImageData(VW,FH);fbuf=new Uint32Array(fimg.data.buffer);if(R)mkSky();selLayout()}
function mkSky(){const th=R.tr.th;skyC=mkCanvas(1,64);let x=skyC.getContext('2d'),gr=x.createLinearGradient(0,0,0,64);gr.addColorStop(0,th.sky[0]);gr.addColorStop(1,th.sky[1]);x.fillStyle=gr;x.fillRect(0,0,1,64);
  fogC=mkCanvas(1,26);x=fogC.getContext('2d');const[r,gg,b]=hex(th.fog);gr=x.createLinearGradient(0,0,0,26);gr.addColorStop(0,`rgba(${r},${gg},${b},.9)`);gr.addColorStop(1,`rgba(${r},${gg},${b},0)`);x.fillStyle=gr;x.fillRect(0,0,1,26);mkSky.ti=R.ti}
let last=performance.now(),acc=0;
function frame(now){const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;T+=dt;demoT+=dt;selSpin+=dt*7;
  if(R&&(state==='race'||state==='title'||state==='results'||R.demo)){acc+=dt;let n=0;while(acc>=1/60&&n<4){stepRace(1/60);acc-=1/60;n++}if(n===4)acc=0}
  if(R){if(mkSky.ti!==R.ti)mkSky();const k=R.P||R.karts[demoCam()],ta=k.spin>0?cam.a:k.va;cam.a+=angd(ta,cam.a)*Math.min(1,dt*(R.P?7:3));cam.x=k.x-Math.cos(cam.a)*CAMD;cam.y=k.y-Math.sin(cam.a)*CAMD;
    if(engine&&R.P){engine.o.frequency.value=55+Math.abs(R.P.v)*1.15+(R.P.boost>0?40:0);engine.gn.gain.value=state==='race'&&SND.mode?.02:0}
    draw();if(SEL){if(SEL.hop>0)SEL.hop=Math.max(0,SEL.hop-dt);drawSel()}hudT-=dt;if(!hud.hidden&&hudT<=0){hudT=.05;hudText()}}
  requestAnimationFrame(frame)}
addEventListener('resize',()=>{resize();draw()});
addEventListener('visibilitychange',()=>{if(document.hidden&&state==='race')pause()});
hookConsole('driftcritters','Drift Critters',S);
resize();title();requestAnimationFrame(frame);S.init(()=>{SND.mode=S.v.sound;if(state==='title')title()});
window.__dc={get SEL(){return SEL},thumbOf,face,bigFrame,gpMenu,quickMenu,set bare(v){draw.bare=v},get R(){return R},get state(){return state},get cam(){return cam},get held(){return held},buildTrack,startRace,stepRace,draw,title,btnSet,results,TRACKS,RACERS,KSPR,ranks,metric,
  texURL(ti){const tr=buildTrack(ti),c=mkCanvas(WS,WS),x=c.getContext('2d'),im=x.createImageData(WS,WS);new Uint32Array(im.data.buffer).set(tr.tex);x.putImageData(im,0,0);for(const o of tr.scn){x.fillStyle=o.solid?'#000':'#f0f';x.fillRect(o.x-3,o.y-3,6,6)}return c.toDataURL()},
  sheet(){const c=mkCanvas(48*NF,48*8),x=c.getContext('2d');x.fillStyle='#5cc85a';x.fillRect(0,0,c.width,c.height);KSPR.forEach((fr,r)=>fr.forEach((s,f)=>x.drawImage(s,f*48,r*48)));return c.toDataURL()}};
