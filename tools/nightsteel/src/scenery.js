/* ================= scenery: layered backdrops for every region =================
   Each theme is drawn once into tiles that repeat: the sky, a far layer (slow), a middle layer, the ground.
   Regions under the Grey get a drained copy of their tiles until their Ember comes home. */
const GROUND_Y=150,TILE=640;
const srand=seed=>{let s=seed>>>0||1;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296};
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return[c,g]}
const THEMES={
 village:{sky:['#5a7ad8','#9ab8f0','#ffd8a8'],far:'hills',farC:['#6a9ad0','#5a88b8'],mid:'trees',midC:['#3a7a4a','#2a5a3a','#5a3a2a'],ground:['#5aa84a','#3a7a34','#c8a878'],path:1,deco:'flowers',sun:1},
 forest:{sky:['#4a9ab8','#8ad0d8','#d8f0d0'],far:'treeline',farC:['#4a8a7a','#3a6a5a'],mid:'bigtrees',midC:['#2a7a3a','#1e5a2e','#5a3a24'],ground:['#4a9a3a','#2e6a2a','#7a5a32'],deco:'flowers',motes:'#fff8a0'},
 deepforest:{sky:['#1e3a3a','#2a5a4a','#4a7a5a'],far:'treeline',farC:['#1e4a3a','#163a2e'],mid:'bigtrees',midC:['#1e5a2e','#143e22','#3a2414'],ground:['#2e6a2a','#1e4a1e','#4a3a24'],deco:'mushrooms',motes:'#a8ff8a',dark:.25},
 coast:{sky:['#3a8ae8','#8ad0ff','#e0f4ff'],far:'sea',farC:['#2a78c8','#1a5aa8'],mid:'cliffs',midC:['#a89878','#7a6a54','#4ab048'],ground:['#e0c890','#c8a870','#a08858'],deco:'shells',sun:1},
 port:{sky:['#4a90e0','#9ad4ff','#f0f8ff'],far:'sea',farC:['#2a78c8','#1a5aa8'],mid:'masts',midC:['#8a6a4a','#5a4430','#e8e0d0'],ground:['#a07a4a','#7a5a32','#5a4024'],planks:1,sun:1},
 grotto:{sky:['#0a1a2a','#123044','#1a4a5a'],far:'stalactites',farC:['#163a4a','#0e2634'],mid:'pillars',midC:['#2a5a6a','#1a3a4a','#4ae8d8'],ground:['#2a4a5a','#1a3040','#3a6a7a'],deco:'crystals',motes:'#7affe8',dark:.2,cave:1},
 snow:{sky:['#8ab0e0','#c8e0f8','#f4f8ff'],far:'peaks',farC:['#d8e8f8','#a8c0e0'],mid:'pines',midC:['#2a5a4a','#1e4436','#f4f8ff'],ground:['#f4f8ff','#c8d8f0','#a8b8d8'],snow:1},
 snowtown:{sky:['#7aa0d8','#c0d8f4','#f0f6ff'],far:'peaks',farC:['#d8e8f8','#a8c0e0'],mid:'pines',midC:['#2a5a4a','#1e4436','#f4f8ff'],ground:['#f4f8ff','#c8d8f0','#a8a098'],snow:1,path:1},
 glacier:{sky:['#1a4a7a','#3a8ac0','#8ad8f0'],far:'icewall',farC:['#5ab0e0','#3a88c0'],mid:'icecrystals',midC:['#8ae0ff','#4aa8e0','#e8faff'],ground:['#c8f0ff','#8ad0f0','#5aa8d8'],cave:1,motes:'#ffffff'},
 storm:{sky:['#2a2440','#4a4468','#7a6a8a'],far:'mesas',farC:['#3a3450','#2a2440'],mid:'deadtrees',midC:['#3a3040','#2a2030','#8a8aa0'],ground:['#4a5a3a','#36442a','#5a5a4a'],rain:1,lightning:1},
 tower:{sky:['#3a3a6a','#6a6a9a','#a8a0c0'],far:'city',farC:['#4a4a70','#36365a'],mid:'walls',midC:['#7a6a6a','#5a4a4a','#ffd86a'],ground:['#8a8a9a','#6a6a7a','#5a5a6a'],stones:1,rain:1},
 spire:{sky:['#2a2a4a','#4a4a7a','#7a7ab0'],far:'windows',farC:['#3a3a5a','#2a2a44'],mid:'gears',midC:['#8a7a5a','#5a4a34','#c8a04a'],ground:['#6a6a80','#4a4a5e','#8a8aa0'],stones:1,cave:1},
 wastes:{sky:['#5a5a5e','#8a8a8e','#b8b8b8'],far:'dunes',farC:['#7a7a7e','#6a6a6e'],mid:'ruins',midC:['#6a6a70','#4a4a50','#8a8a90'],ground:['#8a8a8a','#6a6a6a','#5a5a5a'],ash:1},
 citadel:{sky:['#16161e','#24242e','#34343e'],far:'halls',farC:['#22222c','#1a1a22'],mid:'banners',midC:['#3a3a44','#2a2a32','#8a8a96'],ground:['#3a3a44','#2a2a32','#4a4a54'],stones:1,cave:1,torches:1},
 throne:{sky:['#0e0e14','#1a1a24','#26262e'],far:'blacksun',farC:['#1e1e28','#16161e'],mid:'pillars2',midC:['#3a3a48','#2a2a34','#6a6a78'],ground:['#2a2a34','#1e1e26','#5a2a3a'],stones:1,cave:1,carpet:1},
};
function greyOut(c){const g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height),a=d.data;for(let i=0;i<a.length;i+=4){const l=a[i]*.3+a[i+1]*.59+a[i+2]*.11;a[i]=l*.85+a[i]*.15;a[i+1]=l*.85+a[i+1]*.15;a[i+2]=l*.88+a[i+2]*.12+4}g.putImageData(d,0,0);return c}
const _scene={};
function themeArt(name,grey){const key=name+(grey?'g':'');if(_scene[key])return _scene[key];const T=THEMES[name]||THEMES.village,R=srand(name.length*977+name.charCodeAt(0)*131);
  /* the sky */
  const[sky,sg]=mkCanvas(1,H);const gr=sg.createLinearGradient(0,0,0,H);gr.addColorStop(0,T.sky[0]);gr.addColorStop(.6,T.sky[1]);gr.addColorStop(1,T.sky[2]);sg.fillStyle=gr;sg.fillRect(0,0,1,H);
  /* the far layer */
  const[far,fg]=mkCanvas(TILE,H);const[fc1,fc2]=T.farC;
  const ridge=(base,amp,col,n)=>{fg.fillStyle=col;fg.beginPath();fg.moveTo(0,H);for(let x=0;x<=TILE;x+=8){const y=base-Math.abs(Math.sin(x/TILE*Math.PI*n+base))*amp-Math.sin(x/TILE*Math.PI*2*(n+1))*amp*.3;fg.lineTo(x,y)}fg.lineTo(TILE,H);fg.fill()};
  switch(T.far){
   case 'hills':ridge(118,26,fc1,3);ridge(132,18,fc2,5);break;
   case 'treeline':for(const[b,c,s]of[[112,fc1,1],[128,fc2,1.3]]){fg.fillStyle=c;for(let x=-10;x<TILE+10;x+=9*s){const h=14+R()*16;fg.beginPath();fg.moveTo(x,b);fg.lineTo(x+6*s,b-h);fg.lineTo(x+12*s,b);fg.fill()}fg.fillRect(0,b,TILE,H)}break;
   case 'sea':fg.fillStyle=fc1;fg.fillRect(0,104,TILE,H);fg.fillStyle=fc2;fg.fillRect(0,118,TILE,H);fg.fillStyle='#ffffff';for(let i=0;i<70;i++){fg.globalAlpha=.4+R()*.5;fg.fillRect(R()*TILE|0,106+R()*40|0,2+R()*5|0,1)}fg.globalAlpha=1;
     fg.fillStyle=mix(fc1,'#6a8aa0',.4);for(let i=0;i<3;i++){const x=R()*TILE;fg.beginPath();fg.ellipse(x,104,20+R()*30,7,0,Math.PI,0);fg.fill()}break;
   case 'stalactites':fg.fillStyle=fc1;fg.fillRect(0,0,TILE,28);for(let x=0;x<TILE;x+=12){const h=10+R()*34;fg.beginPath();fg.moveTo(x,20);fg.lineTo(x+6,20+h);fg.lineTo(x+12,20);fg.fill()}ridge(132,20,fc2,4);break;
   case 'peaks':for(const[b,c,a]of[[118,fc2,50],[130,fc1,34]]){fg.fillStyle=c;fg.beginPath();fg.moveTo(0,H);for(let x=0;x<=TILE;x+=40){fg.lineTo(x,b-R()*a);fg.lineTo(x+20,b-a*.3-R()*12)}fg.lineTo(TILE,H);fg.fill()}fg.fillStyle='#ffffff';for(let x=0;x<TILE;x+=40){}break;
   case 'icewall':fg.fillStyle=fc2;fg.fillRect(0,0,TILE,H);fg.fillStyle=fc1;for(let x=0;x<TILE;x+=18){const h=60+R()*60;fg.fillRect(x,H-h-20,14,h+20)}fg.fillStyle='rgba(255,255,255,.25)';for(let x=0;x<TILE;x+=18)fg.fillRect(x+2,20,3,140);break;
   case 'mesas':for(const[b,c]of[[110,fc1],[126,fc2]]){fg.fillStyle=c;let x=0;while(x<TILE){const w=40+R()*70,h=14+R()*24;fg.fillRect(x,b-h,w,H);x+=w+10+R()*30}fg.fillRect(0,b,TILE,H)}break;
   case 'city':for(const[b,c]of[[120,fc1],[134,fc2]]){fg.fillStyle=c;let x=0;while(x<TILE){const w=14+R()*24,h=24+R()*50;fg.fillRect(x,b-h,w,H);if(R()<.4){fg.beginPath();fg.moveTo(x,b-h);fg.lineTo(x+w/2,b-h-14);fg.lineTo(x+w,b-h);fg.fill()}fg.fillStyle='#ffd86a';for(let i=0;i<4;i++)if(R()<.6)fg.fillRect(x+3+R()*(w-6)|0,b-h+6+R()*(h-8)|0,2,2);fg.fillStyle=c;x+=w+2}}break;
   case 'windows':fg.fillStyle=fc1;fg.fillRect(0,0,TILE,H);for(let x=20;x<TILE;x+=80){const gg=fg.createLinearGradient(0,30,0,110);gg.addColorStop(0,'#6a8ad8');gg.addColorStop(1,'#c8b0e0');fg.fillStyle=gg;fg.fillRect(x,30,30,80);fg.beginPath();fg.arc(x+15,30,15,Math.PI,0);fg.fill();fg.fillStyle=fc2;fg.fillRect(x+14,16,2,94);fg.fillRect(x,66,30,2)}break;
   case 'dunes':ridge(120,14,fc1,2);ridge(136,10,fc2,3);break;
   case 'halls':fg.fillStyle=fc1;fg.fillRect(0,0,TILE,H);for(let x=0;x<TILE;x+=64){fg.fillStyle=fc2;fg.fillRect(x+20,20,24,120);fg.fillStyle='#4a4a56';fg.beginPath();fg.arc(x+32,30,12,Math.PI,0);fg.fill()}break;
   default:if(typeof XFAR!=='undefined'&&XFAR[T.far])XFAR[T.far](fg,T,R,fc1,fc2);break;
   case 'blacksun':fg.fillStyle=fc1;fg.fillRect(0,0,TILE,H);for(let x=160;x<TILE;x+=320){fg.fillStyle='#3a3a48';fg.beginPath();fg.arc(x,64,40,0,Math.PI*2);fg.fill();fg.fillStyle='#08080c';fg.beginPath();fg.arc(x,64,30,0,Math.PI*2);fg.fill();fg.strokeStyle='#8a8a9a';fg.lineWidth=2;fg.beginPath();fg.arc(x,64,33,0,Math.PI*2);fg.stroke()}break;
  }
  /* the middle layer */
  const[mid,mg]=mkCanvas(TILE,H);const[m1,m2,m3]=T.midC;const G=GROUND_Y;
  const tree=(x,s,trunk,leaf,leaf2)=>{mg.fillStyle=trunk;mg.fillRect(x-2*s,G-26*s,4*s,26*s);mg.fillStyle=leaf2;mg.beginPath();mg.arc(x,G-32*s,13*s,0,Math.PI*2);mg.fill();mg.fillStyle=leaf;mg.beginPath();mg.arc(x-3*s,G-35*s,10*s,0,Math.PI*2);mg.fill();mg.fillStyle=mix(leaf,'#ffffff',.25);mg.beginPath();mg.arc(x-6*s,G-39*s,4*s,0,Math.PI*2);mg.fill()};
  switch(T.mid){
   case 'trees':for(let x=20;x<TILE;x+=70+R()*40|0)tree(x,1+R()*.4,m3,m1,m2);mg.fillStyle='#8a6a4a';for(let x=0;x<TILE;x+=16){mg.fillRect(x,G-12,2,12)}mg.fillRect(0,G-10,TILE,2);mg.fillRect(0,G-5,TILE,2);break;
   case 'bigtrees':for(let x=0;x<TILE;x+=60+R()*50|0){const s=1.4+R()*.8;mg.fillStyle=m3;mg.fillRect(x-4*s,G-80,8*s,80);mg.fillStyle=shade(m3,-1);mg.fillRect(x+2*s,G-80,2*s,80);mg.fillStyle=m2;mg.beginPath();mg.arc(x,G-86,26*s,0,Math.PI*2);mg.fill();mg.fillStyle=m1;mg.beginPath();mg.arc(x-6,G-92,20*s,0,Math.PI*2);mg.fill();
     mg.fillStyle=m3;mg.beginPath();mg.moveTo(x-6*s,G);mg.lineTo(x,G-12);mg.lineTo(x+6*s,G);mg.fill()}break;
   case 'cliffs':mg.fillStyle=m2;mg.beginPath();mg.moveTo(0,G);for(let x=0;x<=TILE;x+=20)mg.lineTo(x,G-8-R()*10);mg.lineTo(TILE,G);mg.fill();for(let x=30;x<TILE;x+=120+R()*60|0){mg.fillStyle=m1;mg.fillRect(x,G-34,26,34);mg.fillStyle=m3;mg.fillRect(x-2,G-36,30,4)}break;
   case 'masts':for(let x=40;x<TILE;x+=150){mg.fillStyle=m2;mg.fillRect(x,G-90,3,90);mg.fillStyle=m3;mg.beginPath();mg.moveTo(x+3,G-84);mg.lineTo(x+34,G-50);mg.lineTo(x+3,G-46);mg.fill();mg.fillStyle=m1;mg.fillRect(x-30,G-24,90,14)}mg.fillStyle=m1;for(let x=0;x<TILE;x+=20)mg.fillRect(x,G-6,4,6);break;
   case 'pillars':for(let x=30;x<TILE;x+=90+R()*40|0){mg.fillStyle=m2;mg.fillRect(x,0,18,H);mg.fillStyle=m1;mg.fillRect(x+2,0,6,H);mg.fillStyle=m3;for(let i=0;i<3;i++){const y=G-10-R()*90;mg.beginPath();mg.moveTo(x+18,y);mg.lineTo(x+26,y-6);mg.lineTo(x+22,y+4);mg.fill()}}break;
   case 'pines':for(let x=10;x<TILE;x+=40+R()*40|0){const s=1+R()*.6;mg.fillStyle=m2;mg.fillRect(x-1,G-10*s,3,10*s);for(let i=0;i<3;i++){mg.fillStyle=i%2?m1:m2;mg.beginPath();mg.moveTo(x-12*s+i*3*s,G-8*s-i*10*s);mg.lineTo(x+1,G-24*s-i*10*s);mg.lineTo(x+14*s-i*3*s,G-8*s-i*10*s);mg.fill();mg.fillStyle=m3;mg.fillRect(x-8*s+i*3*s,G-10*s-i*10*s,16*s-i*6*s,2)}}break;
   case 'icecrystals':for(let x=20;x<TILE;x+=50+R()*40|0){const h=20+R()*50;mg.fillStyle=m2;mg.beginPath();mg.moveTo(x-8,G);mg.lineTo(x-8,G-h*.7);mg.lineTo(x,G-h);mg.lineTo(x+8,G-h*.7);mg.lineTo(x+8,G);mg.fill();mg.fillStyle=m3;mg.fillRect(x-6,G-h*.7,2,h*.6)}break;
   case 'deadtrees':for(let x=30;x<TILE;x+=110+R()*60|0){mg.strokeStyle=m1;mg.lineWidth=4;mg.beginPath();mg.moveTo(x,G);mg.lineTo(x,G-50);mg.lineTo(x-14,G-70);mg.moveTo(x,G-40);mg.lineTo(x+16,G-62);mg.stroke();mg.fillStyle=m3;mg.fillRect(x+60,G-60,2,60);mg.beginPath();mg.arc(x+61,G-62,3,0,7);mg.fill()}break;
   case 'walls':mg.fillStyle=m1;mg.fillRect(0,G-50,TILE,50);mg.fillStyle=m2;for(let y=G-50;y<G;y+=8)for(let x=((y/8)%2)*10;x<TILE;x+=20)mg.fillRect(x,y,1,8);for(let y=G-50;y<G;y+=8)mg.fillRect(0,y,TILE,1);for(let x=40;x<TILE;x+=120){mg.fillStyle=m3;mg.fillRect(x,G-40,8,10);mg.fillStyle='#2a2440';mg.fillRect(x+2,G-38,4,6)}break;
   case 'gears':for(let x=50;x<TILE;x+=160){for(const[ox,oy,r]of[[0,-70,22],[30,-40,14]]){mg.fillStyle=m2;mg.beginPath();mg.arc(x+ox,G+oy,r+4,0,7);mg.fill();mg.fillStyle=m1;mg.beginPath();mg.arc(x+ox,G+oy,r,0,7);mg.fill();mg.fillStyle=m3;mg.beginPath();mg.arc(x+ox,G+oy,r*.35,0,7);mg.fill()}mg.fillStyle=m2;mg.fillRect(x+70,0,14,H)}break;
   case 'ruins':for(let x=20;x<TILE;x+=90+R()*60|0){const h=20+R()*50;mg.fillStyle=m1;mg.fillRect(x,G-h,16,h);mg.fillStyle=m2;mg.fillRect(x,G-h,16,3);mg.fillRect(x+16+R()*20,G-8,14,8)}break;
   case 'banners':for(let x=30;x<TILE;x+=110){mg.fillStyle=m1;mg.fillRect(x,0,20,H);mg.fillStyle=m3;mg.fillRect(x+30,20,22,60);mg.beginPath();mg.moveTo(x+30,80);mg.lineTo(x+41,72);mg.lineTo(x+52,80);mg.fill();mg.fillStyle='#5a5a66';mg.fillRect(x+38,34,6,6)}break;
   default:if(typeof XMID!=='undefined'&&XMID[T.mid])XMID[T.mid](mg,T,R,m1,m2,m3,G);break;
   case 'pillars2':for(let x=40;x<TILE;x+=100){mg.fillStyle=m2;mg.fillRect(x,0,22,H);mg.fillStyle=m1;mg.fillRect(x+3,0,6,H);mg.fillStyle=m3;mg.fillRect(x-3,G-8,28,8);mg.fillRect(x-3,10,28,6)}break;
  }
  /* the ground */
  const[gc,gg]=mkCanvas(TILE,H-G);const[g1,g2,g3]=T.ground;gg.fillStyle=g2;gg.fillRect(0,0,TILE,H-G);gg.fillStyle=g1;gg.fillRect(0,0,TILE,5);
  for(let i=0;i<260;i++){gg.fillStyle=R()<.5?g1:shade(g2,-1);gg.fillRect(R()*TILE|0,4+R()*(H-G-4)|0,2,1)}
  if(T.path){gg.fillStyle=g3;gg.fillRect(0,9,TILE,12);gg.fillStyle=shade(g3,-1);for(let x=0;x<TILE;x+=10)gg.fillRect(x+((x/10)%2)*5,12,4,1)}
  if(T.planks){gg.fillStyle=g1;for(let x=0;x<TILE;x+=14){gg.fillRect(x,0,1,H-G)}}
  if(T.stones){gg.fillStyle=shade(g2,-1);for(let y=4;y<H-G;y+=8)for(let x=((y/8)%2)*12;x<TILE;x+=24)gg.fillRect(x,y,1,8);for(let y=4;y<H-G;y+=8)gg.fillRect(0,y,TILE,1)}
  if(T.carpet){gg.fillStyle=g3;gg.fillRect(0,8,TILE,14);gg.fillStyle=shade(g3,1);gg.fillRect(0,8,TILE,1);gg.fillRect(0,21,TILE,1)}
  if(T.snow){gg.fillStyle='#ffffff';for(let x=0;x<TILE;x+=6)gg.fillRect(x,0,4,2)}
  if(T.gfx&&typeof XGROUND!=='undefined'&&XGROUND[T.gfx])XGROUND[T.gfx](gg,T,R,g1,g2,g3);
  for(let x=0;x<TILE;x+=4){gg.fillStyle=shade(g1,1);if(R()<.4)gg.fillRect(x,0,1,2)}
  /* little things along the ground edge */
  const deco=[];if(T.deco)for(let x=8;x<TILE;x+=22+R()*40|0)deco.push([x,R()]);
  if(T.deco){for(const[x,r]of deco){if(T.deco==='flowers'){gg.fillStyle=['#ff8ab0','#ffe04a','#ffffff','#a8c8ff'][r*4|0];gg.fillRect(x,1,2,2)}else if(T.deco==='mushrooms'){mg.fillStyle='#e05a4a';mg.beginPath();mg.arc(x,G-2,4,Math.PI,0);mg.fill();mg.fillStyle='#f0e8d0';mg.fillRect(x-1,G-2,2,3)}
    else if(T.deco==='crystals'){mg.fillStyle=m3;mg.beginPath();mg.moveTo(x-3,G);mg.lineTo(x,G-10-r*8);mg.lineTo(x+3,G);mg.fill()}else if(T.deco==='shells'){gg.fillStyle='#fff0e0';gg.fillRect(x,3,2,1)}}}
  if(T.torches)for(let x=70;x<TILE;x+=110){mg.fillStyle='#5a4a3a';mg.fillRect(x,G-50,3,14);mg.fillStyle='#c8c8d8';mg.beginPath();mg.arc(x+1.5,G-53,4,0,7);mg.fill();mg.fillStyle='#8a8aa0';mg.beginPath();mg.arc(x+1.5,G-52,2,0,7);mg.fill()}
  if(T.dark){for(const c of[far,mid]){const g=c.getContext('2d');g.fillStyle=`rgba(0,10,20,${T.dark})`;g.fillRect(0,0,TILE,H)}}
  const out={T,sky,far,mid,ground:gc};
  if(grey)for(const k of['sky','far','mid','ground'])greyOut(out[k]);
  return _scene[key]=out}
/* sky extras that move: the sun, rain, snow, ash, motes, lightning */
const WEATHER={drops:Array.from({length:60},()=>({x:Math.random()*400,y:Math.random()*180,s:.6+Math.random()*.8})),flash:0};
function drawBackdrop(g,theme,camX,grey,t,battle,night){const A=themeArt(theme,grey),T=A.T;
  g.drawImage(A.sky,0,0,W,H);
  if(night==='dusk'){if(!T.indoor)drawDuskSky(g,t)}else if((night||T.nightSky)&&!T.indoor)drawNightSky(g,t,night&&!T.nightSky);
  if(T.sun&&!grey&&!night){g.fillStyle='rgba(255,246,200,.9)';g.beginPath();g.arc(W*.78,34,12,0,7);g.fill();g.fillStyle='rgba(255,246,200,.25)';g.beginPath();g.arc(W*.78,34,20,0,7);g.fill()}
  const tile=(c,par,y=0)=>{const off=((camX*par)%TILE+TILE)%TILE;for(let x=-off;x<W;x+=TILE)g.drawImage(c,Math.round(x),y)};
  tile(A.far,battle?0:.2);tile(A.mid,battle?0:.55);tile(A.ground,battle?0:1,GROUND_Y);
  if(T.lightning){WEATHER.flash=Math.max(0,WEATHER.flash-.03);if(Math.random()<.003)WEATHER.flash=.6;if(WEATHER.flash>0){g.fillStyle=`rgba(230,230,255,${WEATHER.flash*.4})`;g.fillRect(0,0,W,H)}}
  if(T.rain||T.snow||T.ash||T.motes){for(const d of WEATHER.drops){if(T.rain){d.y+=5*d.s;d.x-=1.6*d.s;g.fillStyle='rgba(180,190,255,.45)';g.fillRect(Math.round(d.x),Math.round(d.y),1,4)}
      else if(T.snow){d.y+=.5*d.s;d.x+=Math.sin(t*2+d.s*9)*.3;g.fillStyle='rgba(255,255,255,.85)';g.fillRect(Math.round(d.x),Math.round(d.y),d.s>1?2:1,d.s>1?2:1)}
      else if(T.ash){d.y+=.3*d.s;d.x+=.3;g.fillStyle='rgba(60,60,64,.6)';g.fillRect(Math.round(d.x),Math.round(d.y),2,1)}
      else{d.y-=.15*d.s;d.x+=Math.sin(t+d.s*7)*.2;g.globalAlpha=.5+.5*Math.sin(t*3+d.s*11);g.fillStyle=T.motes;g.fillRect(Math.round(d.x),Math.round(d.y),1,1);g.globalAlpha=1}
      if(d.y>H)d.y=-4;if(d.y<-4)d.y=H;if(d.x<-4)d.x=W+4;if(d.x>W+4)d.x=-4}}}
/* town buildings: a front with a door and a sign */
const SIGNS={inn:'bed',shop:'potion',tailor:'needle',forge:'anvil',home:'house'};
function drawBuilding(g,x,kind,theme,label){const snow=theme==='snowtown',port=theme==='port',tower=theme==='tower';
  const wall=tower?'#7a6a7a':port?'#e8e0d0':snow?'#c8b8a8':'#e8d8b8',roof=kind==='inn'?'#c8483a':kind==='shop'?'#3a8ae8':kind==='forge'?'#5a5a6a':kind==='tailor'?'#c85ab0':'#8a5a3a';
  const w=62,h=46,y=GROUND_Y;g.fillStyle=shade(wall,-1);g.fillRect(x-w/2,y-h,w,h);g.fillStyle=wall;g.fillRect(x-w/2+2,y-h,w-4,h);
  g.fillStyle=roof;g.beginPath();g.moveTo(x-w/2-6,y-h);g.lineTo(x,y-h-24);g.lineTo(x+w/2+6,y-h);g.fill();g.fillStyle=shade(roof,-1);g.fillRect(x-w/2-6,y-h,w+12,3);
  if(snow){g.fillStyle='#ffffff';g.beginPath();g.moveTo(x-w/2-6,y-h);g.lineTo(x,y-h-24);g.lineTo(x+w/2+6,y-h);g.lineTo(x+w/2,y-h-3);g.lineTo(x,y-h-20);g.lineTo(x-w/2,y-h-3);g.fill()}
  g.fillStyle='#5a3a24';g.fillRect(x-7,y-22,14,22);g.fillStyle='#7a5434';g.fillRect(x-6,y-21,12,21);g.fillStyle='#f2c84a';g.fillRect(x+3,y-11,2,2);
  g.fillStyle='#ffe8a0';for(const wx of[x-22,x+14]){g.fillRect(wx,y-34,9,9);g.fillStyle='#5a3a24';g.fillRect(wx+4,y-34,1,9);g.fillRect(wx,y-30,9,1);g.fillStyle='#ffe8a0'}
  /* the sign */
  g.fillStyle='#5a3a24';g.fillRect(x+w/2-4,y-40,2,8);g.fillStyle='#f4e8c8';g.fillRect(x+w/2-12,y-32,18,12);g.fillStyle='#5a3a24';g.fillRect(x+w/2-12,y-32,18,1);
  const ic=SIGN_ICONS[SIGNS[kind]];if(ic)g.drawImage(ic,x+w/2-9,y-31)}
const SIGN_ICONS={};
{const mk=(k,f)=>{const b=new Buf(12,10);f(b);b.outline('#3a2414');SIGN_ICONS[k]=b.canvas(1)};
 mk('bed',b=>{b.rect(1,5,10,3,'#c8483a');b.rect(1,3,3,3,'#f4f4f8');b.rect(1,3,1,6,'#8a5a32');b.rect(10,5,1,4,'#8a5a32')});
 mk('potion',b=>{b.ell(6,6,3.4,3,'#e24a4a',1);b.rect(5,1,2,3,'#c8ccd8')});
 mk('needle',b=>{b.line(2,8,9,1,'#8a8ca0');b.ell(4,4,2.6,2.2,'#c85ab0',0);b.px(9,1,'#ffffff')});
 mk('anvil',b=>{b.poly([[1,2],[10,2],[8,5],[7,8],[4,8],[3,5]],'#5a5a6a');b.rect(2,8,8,1,'#3a3a4a')});
 mk('house',b=>{b.poly([[1,5],[6,1],[11,5]],'#c8483a');b.rect(2,5,8,4,'#e8d8b8');b.rect(5,6,2,3,'#7a5434')})}
