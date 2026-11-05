/* ================= the reaper: a little figure in a black cloak with a skull mask =================
   16x20, the hem on the bottom row, facing right. The sword is drawn separately so it can swing. */
const CL='#191322',CL2='#2c2140',CL3='#463463',BONE='#eee8d4',BONE2='#b9b098',EYE='#7af0ff';
function reaperBuf(pose){const b=new Buf(16,20);
  /* the cloak */
  if(pose==='fall')b.poly([[4,9],[12,9],[16,17],[13,15],[11,19],[8,16],[5,19],[3,15],[0,17]],CL);
  else if(pose==='slam')b.poly([[4,8],[12,8],[14,13],[12,19],[8,17],[4,19],[2,13]],CL);
  else if(pose==='dead')b.poly([[1,14],[15,14],[16,19],[0,19]],CL);
  else b.poly([[4,9],[12,9],[14,19],[12,17],[10,19],[8,17],[6,19],[4,17],[2,19]],CL);
  if(pose!=='dead'){for(let y=10;y<18;y++){b.px(4+(y>13?-1:0),y,CL2)}b.rect(7,11,1,6,CL2)}
  /* the hood and the mask */
  const hy=pose==='dead'?13:pose==='slam'?6:6;
  b.ell(8,hy,5.6,5.4,CL);b.ell(8,hy-1,5,4.6,CL2);b.ell(8.6,hy+.5,4.2,4.2,CL);
  if(pose!=='dead'){b.ell(9.4,hy+1,3,3.4,BONE);b.rect(7,hy+3,5,1,BONE2);
    b.px(8,hy,K);b.px(8,hy+1,K);b.px(11,hy,K);b.px(11,hy+1,K);b.px(8,hy,EYE);b.px(11,hy,EYE);
    b.px(9,hy+3,K);b.px(11,hy+3,K);b.px(10,hy+2,BONE2)}
  else{b.ell(12,16,2.6,2.2,BONE);b.px(11,16,K);b.px(13,16,K)}
  /* the sleeve and a bony hand holding the sword */
  if(pose==='hit'||pose==='slam'){b.rect(11,11,3,2,CL);b.px(14,11,BONE)}else if(pose!=='dead'){b.rect(11,12,2,3,CL);b.px(12,15,BONE)}
  if(pose==='hurt')b.swap(BONE,'#ffb0b0');
  return b.outline()}
const reaperSpr=pose=>spr('r'+pose,()=>reaperBuf(pose));
/* the hand, where the sword is held, for each pose (sprite pixels) */
const HAND={up:[12,15],fall:[12,15],hit:[14,11],slam:[14,11],hurt:[12,15],dead:[12,17]};

/* ================= the monsters ================= */
function wispBuf(f){const b=new Buf(12,14),T='#3ae0c0',T2='#a8fff0';
  b.poly([[6,0+f],[9,4],[11,8],[10,12],[6,13],[2,12],[1,8],[3,4]],T);b.poly([[6,4+f],[8,7],[8,10],[6,11],[4,10],[4,7]],T2);
  b.rect(4,7,1,2,K);b.rect(7,7,1,2,K);return b.outline('#0a2a26')}
function batBuf(f){const b=new Buf(18,10),M='#2a1838',M2='#4a2e62';
  if(f){b.poly([[8,4],[1,1],[3,5],[0,6],[7,7]],M);b.poly([[10,4],[17,1],[15,5],[18,6],[11,7]],M)}else{b.poly([[8,4],[2,8],[4,5],[0,3],[7,3]],M);b.poly([[10,4],[16,8],[14,5],[18,3],[11,3]],M)}
  b.rect(3,f?2:5,3,1,M2);b.rect(12,f?2:5,3,1,M2);b.ell(9,5,2.6,2.6,BONE);b.px(8,5,'#ff3a4a');b.px(10,5,'#ff3a4a');b.px(9,7,BONE2);return b.outline()}
function ghoulBuf(f){const b=new Buf(14,18),S='#86a072',S2='#5e7a50',R='#3a3048',R2='#544468';
  b.rect(4+f,13,2,5,S2);b.rect(8-f,13,2,5,S2);b.poly([[3,7],[11,6],[12,14],[2,14]],R);b.rect(3,9,9,1,R2);
  b.ell(7,5,3.6,3.4,S);b.px(6,5,'#ff3a3a');b.px(9,5,'#ff3a3a');b.rect(6,7,3,1,'#2a1a1a');b.px(7,8,BONE);
  b.rect(11,8,3,2,S);b.rect(12,10,2,1,S2);b.rect(0,9,3,2,S);return b.outline()}
function wraithBuf(f){const b=new Buf(16,20),P='#5a3c96',P2='#8a68c8';
  b.poly([[4,4],[12,4],[15,15],[13,13+f],[11,19],[8,15],[5,19],[3,13+f],[1,15]],P);b.ell(8,6,5,5.4,P);b.ell(8,5,4,4.4,P2);b.ell(8,7,3.4,3.2,'#140c24');
  b.px(6,7,'#ffe04a');b.px(10,7,'#ffe04a');b.rect(6,8,1,1,'#806010');b.rect(10,8,1,1,'#806010');for(let y=12;y<17;y++)b.px(8,y,P2);return b.outline('#0c0618')}
function gargBuf(open){const b=new Buf(20,16),S='#80808e',S2='#5a5a6a',S3='#a8a8b8';
  b.poly([[2,4],[6,8],[5,14],[1,10]],S2);b.poly([[18,4],[14,8],[15,14],[19,10]],S2);b.poly([[5,7],[15,7],[16,15],[4,15]],S);b.rect(6,15,3,1,S2);b.rect(11,15,3,1,S2);
  b.ell(10,5,4.4,3.8,S);b.poly([[6,3],[5,0],[8,2]],S3);b.poly([[14,3],[15,0],[12,2]],S3);b.px(8,4,'#ffd84a');b.px(12,4,'#ffd84a');
  if(open){b.rect(8,6,5,2,'#2a0808');b.px(9,6,'#ff7a2a');b.px(11,7,'#ff7a2a')}else b.rect(8,7,5,1,S2);
  b.rect(7,10,6,1,S3);return b.outline()}
function golemBuf(f){const b=new Buf(28,30),B=BONE,B2=BONE2,D='#2a2030';
  b.rect(8+f,24,4,6,B2);b.rect(16-f,24,4,6,B2);b.poly([[6,10],[22,10],[20,24],[8,24]],D);
  for(let i=0;i<4;i++)b.rect(8,12+i*3,12,1,B);b.rect(13,11,2,13,B);b.ell(14,17,2.4,2.4,'#ff3a2a');b.px(14,16,'#ffd0a0');
  b.rect(1,10,5,4,B);b.rect(0,14,4,9,B2);b.rect(22,10,5,4,B);b.rect(24,14,4,9,B2);b.rect(0,22,5,3,B);b.rect(23,22,5,3,B);
  b.ell(14,6,5.4,5,B);b.rect(10,9,8,2,B2);b.ell(12,5,1.4,1.6,K);b.ell(16.4,5,1.4,1.6,K);b.px(12,5,'#ff3a2a');b.px(16,5,'#ff3a2a');for(let x=11;x<18;x+=2)b.px(x,10,K);
  return b.outline()}
const MK={wisp:wispBuf,bat:batBuf,ghoul:ghoulBuf,wraith:wraithBuf,garg:gargBuf,golem:golemBuf};
const monSpr=(t,f)=>spr('m'+t+f,()=>MK[t](f));
/* a white flash of a sprite, shown for a moment when it is hit */
const FLASH=new Map();function flashOf(im){let c=FLASH.get(im);if(!c){c=mk(im.width,im.height,g=>{g.drawImage(im,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#ffffff';g.fillRect(0,0,im.width,im.height)});FLASH.set(im,c)}return c}

/* ================= little things ================= */
function soulBuf(){const b=new Buf(7,9);b.poly([[3,0],[6,4],[5,8],[1,8],[0,4]],'#5ab8ff');b.ell(3,5.5,1.6,2,'#d8f4ff');return b.outline('#0a1a3a')}
function heartBuf(){const b=new Buf(9,8);b.ell(2.5,2.5,2.3,2.3,'#ff3a5a');b.ell(6.5,2.5,2.3,2.3,'#ff3a5a');b.poly([[0,3],[9,3],[4.5,8]],'#ff3a5a');b.px(2,1,'#ffc0c8');return b.outline()}
function springBuf(){const b=new Buf(12,7);b.rect(1,5,10,2,'#3a2c52');for(let i=0;i<3;i++)b.rect(3,1+i*1.4,6,1,'#c8a8ff');b.rect(2,0,8,1,'#f0e0ff');return b.outline()}
const SOUL=()=>spr('soul',soulBuf)[0],HEART=()=>spr('heart',heartBuf)[0],SPRING=()=>spr('spring',springBuf)[0];
/* platforms, drawn once per kind and width */
const PCOL={stone:['#8a8296','#5e566e','#3e3850','#6a9a5a'],rune:['#4a3a6e','#2e2450','#1c1638','#c88aff'],crumble:['#9a7a5a','#6e5238','#4a3424','#3a2a1c'],bone:['#e8e0cc','#b8ae96','#7e7664','#ffffff']};
function platCanvas(kind,w){return spr('p'+kind+w,()=>{const[a,b2,c,d]=PCOL[kind],h=7,B=new Buf(w,h);B.rect(0,1,w,h-1,b2);B.rect(0,0,w,2,a);B.rect(0,h-1,w,1,c);
  if(kind==='stone'){for(let x=2;x<w;x+=7)B.rect(x,3,1,3,c);for(let x=0;x<w;x+=5)if((x*7)%3===0)B.px(x,0,d)}
  if(kind==='rune'){for(let x=3;x<w-2;x+=6){B.px(x,3,d);B.px(x+1,4,d);B.px(x+2,3,d)}}
  if(kind==='crumble'){for(let x=3;x<w;x+=6){B.px(x,2,c);B.px(x+1,3,c);B.px(x,4,c);B.px(x+1,5,d)}}
  if(kind==='bone'){for(let x=1;x<w;x+=4)B.rect(x,2,2,3,b2)}
  return B.outline()})[0]}
/* ================= the sky behind: four stretches of the climb, each with its own colours ================= */
const ZONES=[
 {name:'GRAVEYARD',at:0,sky:['#0a0818','#1c1438','#3a2050'],moon:'#f4ecd0',fog:'#5a4a7a',sil:'#120c1e'},
 {name:'CATHEDRAL',at:300,sky:['#08060e','#1a1030','#4a1838'],moon:'#ffd8c0',fog:'#7a3a5a',sil:'#100818'},
 {name:'STORM',at:800,sky:['#04060c','#101830','#203860'],moon:'#d0e8ff',fog:'#3a5a8a',sil:'#060a16'},
 {name:'BLOOD MOON',at:1500,sky:['#0c0206','#2a0610','#5a0a1a'],moon:'#ff5a4a',fog:'#8a1a2a',sil:'#100206'}];
function zoneAt(m){let z=ZONES[0];for(const q of ZONES)if(m>=q.at)z=q;return z}
function skyCanvas(z){return spr('sky'+z.name+H,()=>{const B={canvas:()=>mk(W,H,g=>{const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,z.sky[0]);gr.addColorStop(.6,z.sky[1]);gr.addColorStop(1,z.sky[2]);g.fillStyle=gr;g.fillRect(0,0,W,H);
    let sd=z.at+7;const r=()=>(sd=(sd*9301+49297)%233280)/233280;for(let i=0;i<60;i++){g.fillStyle=r()<.2?'#ffffff':'#8a80b0';g.fillRect(Math.floor(r()*W),Math.floor(r()*H*.7),1,1)}
    g.fillStyle=z.moon;g.beginPath();g.arc(132,46,17,0,7);g.fill();g.fillStyle=mix(z.moon,'#000000',.15);g.beginPath();g.arc(126,42,4,0,7);g.arc(138,52,3,0,7);g.fill()})};return B})[0]}
/* the silhouettes that drift past slower than the platforms: spires and crooked towers, tiled up the sky */
function silCanvas(z){return spr('sil'+z.name,()=>({canvas:()=>mk(W,200,g=>{g.fillStyle=z.sil;let sd=z.at+3;const r=()=>(sd=(sd*9301+49297)%233280)/233280;
  for(let i=0;i<6;i++){const x=Math.floor(r()*W),w=10+Math.floor(r()*18),h=40+Math.floor(r()*120),y=200-h;g.fillRect(x,y,w,h);g.beginPath();g.moveTo(x-2,y);g.lineTo(x+w/2,y-10-r()*14);g.lineTo(x+w+2,y);g.fill();
    g.fillStyle=mix(z.fog,'#000000',.2);for(let k=0;k<3;k++)g.fillRect(x+3+Math.floor(r()*(w-6)),y+8+Math.floor(r()*(h-16)),2,3);g.fillStyle=z.sil}})}))[0]}
