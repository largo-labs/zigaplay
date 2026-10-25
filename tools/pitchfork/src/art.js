/* ---------- art: every picture is drawn in code with small rectangles ---------- */
let W=320;const H=180,TS=16,MW=40,MH=24; // W follows the screen's shape (240 to 400)
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
function rng(seed){let s=(seed>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const hash=(x,y,k=0)=>{let h=(x*374761393+y*668265263+k*2147483647)>>>0;h=(h^(h>>>13))*1274126177>>>0;return((h^(h>>>16))>>>0)/4294967296};
function P(g,c,x,y,w=1,h=1){g.fillStyle=c;g.fillRect(x,y,w,h)}
function line(g,c,x0,y0,x1,y1){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);g.fillStyle=c;
  const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
  for(let i=0;i<64;i++){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function disc(g,c,cx,cy,r){g.fillStyle=c;for(let y=-r;y<=r;y++){const w=Math.round(Math.sqrt(r*r-y*y));g.fillRect(Math.round(cx-w),Math.round(cy+y),w*2+1,1)}}

/* 3x5 digits for damage numbers */
const DIG={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111','!':'010010010000010','+':'000010111010000','x':'000101010101000'};
function digits(g,s,x,y,c,sh='#000'){s=String(s);let cx=Math.round(x-s.length*2);y=Math.round(y);
  for(const ch of s){const d=DIG[ch];if(d){for(let i=0;i<15;i++)if(d[i]==='1'){P(g,sh,cx+i%3+1,y+(i/3|0)+1);}for(let i=0;i<15;i++)if(d[i]==='1')P(g,c,cx+i%3,y+(i/3|0))}cx+=4}}

/* ---------- people ---------- */
const SKINS=['#f0c8a0','#e0b088','#c08a5a','#8a5a3a'],HAIRS=['#3a2414','#6a4424','#a07038','#d8b060','#2a2a2a','#9a9a9a','#8a3a1a'];
const PEASANT_TUNICS=['#7a6a4a','#6a7a3a','#8a6a3a','#5a6a5a','#8a7a5a','#6a5a3a','#4a6a4a','#9a8058'];
// look: {skin,hair,tunic,trim,hat,hatC,wpn,mail,horse,barding,cape,legs}
function drawPerson(g,x,y,L,o){
  x=Math.round(x);y=Math.round(y);const f=o.face<0?-1:1,ph=o.walk||0,atk=o.atk||0,fl=o.flash;
  const step=Math.sin(ph*Math.PI*2),bob=Math.abs(step)>.5?-1:0;
  const C=c=>fl?'#ffffff':c;
  if(L.horse){drawHorse(g,x,y,L,f,ph,fl);y-=5}
  const sk=C(L.skin),tun=C(L.mail?'#9aa0a8':L.tunic),trim=C(L.trim||'#2a1a10');
  // shadow
  if(!L.horse){g.globalAlpha*=.35;P(g,'#000',x-3,y-1,7,2);g.globalAlpha/=.35}
  // cape behind
  if(L.cape){P(g,C(L.cape),x-2-f,y-9+bob,5,7)}
  // legs
  if(!L.horse){const lc=C(L.legs||'#3a2a1a');const a=step>0.3?1:step<-0.3?-1:0;P(g,lc,x-2+a,y-3,2,3);P(g,lc,x+1-a,y-3,2,3)}
  else{P(g,C(L.legs||'#3a2a1a'),x-1+f,y-3,2,2)}
  // body
  P(g,tun,x-3,y-8+bob,6,5);
  if(L.mail){P(g,C(L.tunic),x-2,y-8+bob,4,5);P(g,C('#7a8088'),x-3,y-4+bob,6,1)}
  P(g,trim,x-3,y-5+bob,6,1);
  // head
  P(g,sk,x-2,y-12+bob,4,4);P(g,C('#1a1010'),x+(f>0?1:-2),y-11+bob,1,1);
  const hc=C(L.hatC||L.hair);
  switch(L.hat){
    case 'cap':P(g,hc,x-2,y-13+bob,4,2);P(g,hc,x+(f>0?1:-3),y-12+bob,2,1);break;
    case 'hood':P(g,hc,x-3,y-13+bob,6,2);P(g,hc,x-3-0,y-12+bob,1,4);P(g,hc,x+2,y-12+bob,1,4);if(f>0)P(g,hc,x-3,y-12+bob,1,4);else P(g,hc,x+2,y-12+bob,1,4);break;
    case 'kettle':P(g,hc,x-3,y-12+bob,6,1);P(g,hc,x-2,y-14+bob,4,2);break;
    case 'helm':P(g,hc,x-2,y-13+bob,4,3);P(g,hc,x-2,y-10+bob,1,2);P(g,hc,x+1,y-10+bob,1,2);P(g,C('#1a1a1a'),x+(f>0?0:-1),y-11+bob,2,1);break;
    case 'greathelm':P(g,hc,x-2,y-13+bob,4,5);P(g,C('#111'),x-2,y-11+bob,4,1);P(g,C('#c03030'),x-1,y-15+bob,2,2);break;
    case 'crown':P(g,C(L.hair||'#6a4424'),x-2,y-12+bob,4,1);P(g,hc,x-2,y-14+bob,4,2);P(g,hc,x-2,y-15+bob,1,1);P(g,hc,x+1,y-15+bob,1,1);P(g,C('#e02020'),x-1,y-14+bob,1,1);break;
    case 'band':P(g,C(L.hair),x-2,y-13+bob,4,1);P(g,hc,x-2,y-12+bob,4,1);break;
    default:P(g,C(L.hair),x-2,y-13+bob,4,1);P(g,C(L.hair),x+(f>0?-2:1),y-12+bob,1,2);
  }
  // arm + weapon
  const hx=x+2*f,hy=y-6+bob;
  if(L.wpn)drawWeapon(g,L.wpn,hx,hy,f,atk,fl,o.t||0);
  P(g,sk,hx,hy,1,1);
}
function drawHorse(g,x,y,L,f,ph,fl){
  const C=c=>fl?'#ffffff':c,hc=C(L.horse),dk=C('#2a1a10');const st=Math.sin(ph*Math.PI*2);
  g.globalAlpha*=.35;P(g,'#000',x-7,y-1,14,2);g.globalAlpha/=.35;
  const a=st>0?1:-1;P(g,dk,x-5+a,y-4,1,4);P(g,dk,x-3-a,y-4,1,4);P(g,dk,x+3+a,y-4,1,4);P(g,dk,x+5-a,y-4,1,4);
  P(g,hc,x-6,y-8,12,5);if(L.barding){P(g,C(L.barding),x-5,y-7,10,3);P(g,C(L.trim||'#e8c040'),x-5,y-5,10,1)}
  P(g,hc,x+(f>0?5:-8),y-11,3,5);P(g,hc,x+(f>0?7:-9),y-11,2,2);P(g,dk,x+(f>0?5:-7),y-12,2,1);
  P(g,dk,x+(f>0?-7:6),y-8,1,4);
}
const WPN={ // len, idle angle, colors
  fork:{len:10,shaft:'#8a6a3a',tip:'fork',tc:'#b0b0b0'},spear:{len:11,shaft:'#7a5a30',tip:'point',tc:'#c8c8d0'},pike:{len:16,shaft:'#7a5a30',tip:'point',tc:'#c8c8d0'},
  lance:{len:15,shaft:'#e0d0a0',tip:'point',tc:'#d0d0d8'},halberd:{len:13,shaft:'#5a4020',tip:'axe',tc:'#c8c8d0'},
  club:{len:5,shaft:'#5a3a1a',tip:'knob',tc:'#4a2a10'},sword:{len:7,shaft:'#d8d8e0',tip:'hilt',tc:'#8a6a20'},greatsword:{len:10,shaft:'#e0e0e8',tip:'hilt',tc:'#d0a020'},
  axe:{len:8,shaft:'#5a3a1a',tip:'axe',tc:'#c0c0c8'},mace:{len:6,shaft:'#5a5a5a',tip:'knob',tc:'#8a8a90'},
  scythe:{len:11,shaft:'#8a6a3a',tip:'scythe',tc:'#d0d0d8'},flail:{len:6,shaft:'#8a6a3a',tip:'flail',tc:'#6a4a2a'},
  torch:{len:5,shaft:'#5a3a1a',tip:'flame',tc:'#ffb030'},bow:{len:0,tip:'bow',tc:'#8a5a2a'},xbow:{len:0,tip:'xbow',tc:'#6a4a2a'},
  stones:{len:0,tip:'stone',tc:'#9a9a90'},sling:{len:0,tip:'sling',tc:'#8a6a4a'},cudgel:{len:6,shaft:'#6a4422',tip:'knob',tc:'#5a3818'},blade:{len:8,shaft:'#e8e8f0',tip:'hilt',tc:'#ffd040'},
};
function drawWeapon(g,k,hx,hy,f,atk,fl,t){
  const w=WPN[k];if(!w)return;const C=c=>fl?'#ffffff':c;
  if(w.tip==='bow'){const dx=f*1;line(g,C(w.tc),hx+dx,hy-4,hx+dx+f*2,hy-1);line(g,C(w.tc),hx+dx+f*2,hy-1,hx+dx,hy+3);line(g,C('#e0e0d0'),hx+dx,hy-4,hx+dx,hy+3);return}
  if(w.tip==='xbow'){P(g,C(w.tc),hx,hy-1,f*5,2);line(g,C('#8a8a90'),hx+f*4,hy-3,hx+f*4,hy+2);return}
  if(w.tip==='stone'){if(atk>0)P(g,C(w.tc),hx+f*2,hy-3,2,2);else P(g,C(w.tc),hx,hy+1,2,2);return}
  if(w.tip==='sling'){const a=t*20;line(g,C(w.tc),hx,hy,hx+Math.cos(a)*3,hy-3+Math.sin(a)*3);return}
  // idle: angled up and forward; attacking: swung or thrust forward
  const thrust=k==='fork'||k==='spear'||k==='pike'||k==='lance';
  let ang=-1.05,ext=0;
  if(atk>0){if(thrust){ang=-.1;ext=atk*4}else{ang=-1.6+atk*2.4}}
  const ca=Math.cos(ang)*f,sa=Math.sin(ang);const bx=hx-ca*2,by=hy-sa*2;
  const ex=hx+ca*(w.len+ext),ey=hy+sa*(w.len+ext);
  line(g,C(w.shaft),bx,by,ex,ey);
  const tc=C(w.tc);
  switch(w.tip){
    case 'fork':{const px=-sa,py=ca;line(g,tc,ex,ey,ex+ca*2,ey+sa*2);line(g,tc,ex+px*1.5,ey+py*1.5*f,ex+px*1.5+ca*3,ey+py*1.5*f+sa*3);line(g,tc,ex-px*1.5,ey-py*1.5*f,ex-px*1.5+ca*3,ey-py*1.5*f+sa*3);break}
    case 'point':line(g,tc,ex,ey,ex+ca*3,ey+sa*3);break;
    case 'knob':P(g,tc,Math.round(ex)-1,Math.round(ey)-1,3,3);break;
    case 'hilt':P(g,tc,Math.round(hx-ca*1)-1,Math.round(hy-sa*1),3,1);break;
    case 'axe':P(g,tc,Math.round(ex)-(f>0?0:2),Math.round(ey)-1,3,4);break;
    case 'scythe':{const ex2=ex-f*5,ey2=ey+2;line(g,tc,ex,ey,ex2,ey2);line(g,tc,ex,ey+1,ex2+f,ey2);break}
    case 'flail':{const sw=Math.sin(t*9)*2;line(g,C('#9a9a9a'),ex,ey,ex+f*2+sw,ey+2);P(g,tc,Math.round(ex+f*2+sw)-1,Math.round(ey+2),3,3);break}
    case 'flame':{const k2=(t*12|0)%2;P(g,C('#ff6020'),Math.round(ex)-1,Math.round(ey)-2,3,3);P(g,C('#ffd040'),Math.round(ex),Math.round(ey)-2-k2,1,2);break}
  }
}
function drawDog(g,x,y,o){x=Math.round(x);y=Math.round(y);const f=o.face<0?-1:1,C=c=>o.flash?'#fff':c,st=Math.sin((o.walk||0)*Math.PI*2)>0?1:0;
  g.globalAlpha*=.35;P(g,'#000',x-4,y-1,8,2);g.globalAlpha/=.35;
  P(g,C('#3a2a1a'),x-3+st,y-2,1,2);P(g,C('#3a2a1a'),x+2-st,y-2,1,2);P(g,C('#6a4a2a'),x-4,y-5,8,3);P(g,C('#6a4a2a'),x+(f>0?3:-6),y-7,3,3);
  P(g,C('#2a1a0a'),x+(f>0?5:-6),y-7,1,1);P(g,C('#4a3018'),x+(f>0?-5:4),y-6,1,2);if(o.atk>0)P(g,C('#fff'),x+(f>0?6:-7),y-5,1,1)}

/* ---------- tiles ---------- */
const TILE_SOLID={T:1,H:1,M:1,W:1,F:1,r:1,'~':1,G:1};
const TILE_HIDE={w:1,t:1};
const TILE_FLAM={w:1,t:1};
function drawTile(g,m,tx,ty){
  const c=m.t[ty][tx],X=tx*TS,Y=ty*TS,h=k=>hash(tx,ty,k);
  const at=(x,y)=>(x<0||y<0||x>=MW||y>=MH)?c:m.t[y][x];
  const ground=(base,cols,n)=>{P(g,base,X,Y,TS,TS);for(let i=0;i<n;i++)P(g,cols[i%cols.length],X+(h(i)*TS|0),Y+(h(i+50)*TS|0),1+(h(i+90)*2|0),1)};
  const grass=()=>{ground('#4f7a35',['#5f8c3e','#456c2e','#58843a'],12);if(h(7)<.4){const gx=X+(h(8)*12|0)+2,gy=Y+(h(9)*12|0)+2;P(g,'#6f9a48',gx,gy,1,2);P(g,'#6f9a48',gx+2,gy-1,1,3)}
    if(h(11)<.08){P(g,['#e8e070','#e080a0','#f0f0f0'][h(12)*3|0],X+(h(13)*14|0)+1,Y+(h(14)*14|0)+1,1,1)}};
  switch(c){
    case '=':ground('#9a7a50',['#8a6c44','#a8885c','#b0946a'],10);
      for(const[dx,dy,ex,ey,w2,h2]of[[-1,0,0,0,2,TS],[1,0,TS-2,0,2,TS],[0,-1,0,0,TS,2],[0,1,0,TS-2,TS,2]]){const n=at(tx+dx,ty+dy);if(n!=='='&&n!=='b'&&n!=='s'&&n!=='x'&&n!=='m'){P(g,'#6a8a3a',X+ex,Y+ey,w2,h2)}}break;
    case '~':{P(g,'#2c5f96',X,Y,TS,TS);for(let i=0;i<5;i++)P(g,'#3a72aa',X+(h(i)*12|0),Y+(h(i+9)*15|0),4,1);
      for(const[dx,dy,ex,ey,w2,h2]of[[0,-1,0,0,TS,2],[-1,0,0,0,2,TS],[1,0,TS-2,0,2,TS],[0,1,0,TS-1,TS,1]]){const n=at(tx+dx,ty+dy);if(n!=='~'&&n!=='b'&&n!=='m')P(g,'#1e4470',X+ex,Y+ey,w2,h2)}break}
    case 'b':{P(g,'#2c5f96',X,Y,TS,TS);const vert=at(tx-1,ty)==='~'||at(tx+1,ty)==='~';
      if(vert){P(g,'#8a5c30',X,Y,TS,TS);for(let i=0;i<TS;i+=4)P(g,'#6a4420',X,Y+i,TS,1);P(g,'#4a2c14',X,Y,1,TS);P(g,'#4a2c14',X+TS-1,Y,1,TS)}
      else{P(g,'#8a5c30',X,Y,TS,TS);for(let i=0;i<TS;i+=4)P(g,'#6a4420',X+i,Y,1,TS);P(g,'#4a2c14',X,Y,TS,1);P(g,'#4a2c14',X,Y+TS-1,TS,1)}break}
    case 'w':ground('#b89238',['#a08030','#c8a040'],6);for(let i=0;i<9;i++){const sx=X+1+(i%3)*5+(h(i)*2|0),sy=Y+2+(i/3|0)*5;P(g,'#e0c060',sx,sy,1,3);P(g,'#f0d878',sx,sy,1,1);P(g,'#8a6a28',sx+1,sy+2,1,1)}break;
    case 'x':ground('#2e2a24',['#4a443a','#1e1a16','#3a342c'],14);break;
    case 'm':ground('#5a4630',['#4a3a28','#6a5440','#3a7aaa'],10);break;
    case 's':ground('#8a8478',['#9a9488','#7a7468'],4);for(let yy=0;yy<TS;yy+=5){P(g,'#6e685c',X,Y+yy,TS,1);const o2=(ty*3+yy)%2?4:0;for(let xx=o2;xx<TS;xx+=8)P(g,'#6e685c',X+xx,Y+yy,1,5)}break;
    case 't':grass();disc(g,'#22481c',X+8,Y+9,6);disc(g,'#2f5a24',X+7,Y+8,5);P(g,'#3f7030',X+5,Y+5,3,2);P(g,'#4a8038',X+5,Y+5,1,1);break;
    case 'T':grass();g.globalAlpha=.3;disc(g,'#000',X+8,Y+12,6);g.globalAlpha=1;P(g,'#4a3018',X+7,Y+8,3,7);P(g,'#3a2410',X+7,Y+13,1,2);break;
    case 'r':grass();disc(g,'#5a5a54',X+8,Y+10,6);disc(g,'#8a8a84',X+7,Y+9,5);P(g,'#a8a8a0',X+5,Y+6,3,2);break;
    case 'F':grass();{const hz=at(tx-1,ty)==='F'||at(tx+1,ty)==='F',vt=at(tx,ty-1)==='F'||at(tx,ty+1)==='F';
      if(hz||!vt){P(g,'#7a5430',X,Y+6,TS,2);P(g,'#7a5430',X,Y+11,TS,2);P(g,'#5a3a1a',X,Y+8,TS,1)}
      if(vt){P(g,'#7a5430',X+6,Y,3,TS);P(g,'#5a3a1a',X+8,Y,1,TS)}
      P(g,'#5a3a1a',X+2,Y+3,2,12);P(g,'#5a3a1a',X+11,Y+3,2,12);P(g,'#8a6440',X+2,Y+3,2,1);P(g,'#8a6440',X+11,Y+3,2,1)}break;
    case 'W':{P(g,'#7a7468',X,Y,TS,TS);for(let yy=0;yy<TS;yy+=4){P(g,'#5e584c',X,Y+yy,TS,1);const o2=(yy/4)%2?4:0;for(let xx=o2;xx<TS;xx+=8)P(g,'#5e584c',X+xx,Y+yy,1,4)}
      if(at(tx,ty+1)!=='W'){P(g,'#4a4438',X,Y+TS-3,TS,3)}if(at(tx,ty-1)!=='W'){P(g,'#a8a294',X,Y,TS,2);P(g,'#a8a294',X+2,Y-2>=0?Y:Y,4,2)}break}
    case 'G':{P(g,'#3a3028',X,Y,TS,TS);P(g,'#6a4424',X+1,Y,TS-2,TS);for(let xx=3;xx<TS;xx+=4)P(g,'#4a2c14',X+xx,Y,1,TS);P(g,'#3a3a3a',X+1,Y+3,TS-2,2);P(g,'#3a3a3a',X+1,Y+11,TS-2,2);P(g,'#8a8a8a',X+3,Y+3,1,1);P(g,'#8a8a8a',X+11,Y+11,1,1);break}
    case 'H':case 'M':{const stone=c==='M';P(g,stone?'#5a6070':'#9a7438',X,Y,TS,TS);for(let yy=1;yy<TS;yy+=3)P(g,stone?'#454a58':'#7a5a28',X,Y+yy,TS,1);
      if(at(tx,ty+1)!==c){P(g,stone?'#9a9488':'#d8c8a0',X,Y+TS-6,TS,6);P(g,'#5a3a20',X,Y+TS-6,TS,1);if(!stone){P(g,'#5a3a20',X,Y+TS-6,1,6);P(g,'#5a3a20',X+TS-1,Y+TS-6,1,6)}
        if(h(3)<.5){P(g,stone?'#3a3a44':'#3a2410',X+5,Y+TS-4,4,4)}else{P(g,'#2a3a4a',X+6,Y+TS-4,3,2);P(g,'#5a3a20',X+5,Y+TS-5,5,1)}}
      if(at(tx,ty-1)!==c){P(g,stone?'#7a8090':'#c09858',X,Y,TS,2)}
      break}
    default:grass();
  }
}
// building outlines and roof ridges on top of the tile pass
function drawBuildings(g,m){
  for(const b of m.houses){const X=b.x*TS,Y=b.y*TS,w=b.w*TS,h=b.h*TS,stone=b.c==='M';
    const roofH=h-6,mid=Y+roofH/2|0;
    P(g,stone?'#454a58':'#7a5a28',X,Y,w,roofH);
    for(let yy=0;yy<roofH;yy+=3)P(g,stone?(yy%6?'#5a6070':'#646a7a'):(yy%6?'#a88040':'#b89048'),X+1,Y+yy,w-2,2);
    P(g,stone?'#7a8090':'#d0a860',X,mid,w,2);P(g,'#2a1a10',X,Y,1,roofH);P(g,'#2a1a10',X+w-1,Y,1,roofH);P(g,'#2a1a10',X,Y,w,1);
    // front wall with timber, door and windows
    P(g,stone?'#9a9488':'#d8c8a0',X,Y+roofH,w,6);P(g,'#4a3020',X,Y+roofH,w,1);
    const dx=X+(w/2|0)-2;P(g,stone?'#3a3a44':'#4a2c14',dx,Y+roofH+1,4,5);
    for(let xx=X+3;xx<X+w-4;xx+=9){if(Math.abs(xx-dx)<6)continue;P(g,'#2a3a4a',xx,Y+roofH+2,3,2)}
    if(!stone&&b.w>=4){P(g,'#6a5a50',X+w-8,Y-3,3,5)}
  }
}
function drawCrowns(g,m){
  for(let ty=0;ty<MH;ty++)for(let tx=0;tx<MW;tx++)if(m.t[ty][tx]==='T'){const X=tx*TS,Y=ty*TS,h=k=>hash(tx,ty,k);
    const cx=X+8+(h(1)*3|0)-1,cy=Y+3;disc(g,'#1c3c18',cx,cy+1,8);disc(g,'#2a5a26',cx,cy,7);disc(g,'#3a7030',cx-2,cy-2,4);P(g,'#4a8a3a',cx-3,cy-4,2,1);P(g,'#22481e',cx+3,cy+2,2,2)}
}

/* ---------- objectives ---------- */
function drawObjective(g,o,t){
  const X=o.x*TS,Y=o.y*TS,w=o.w*TS,h=o.h*TS,fl=o.flash>0;
  const C=c=>fl?'#ffffff':c;
  if(o.sprite==='mill'){P(g,C('#7a7468'),X+4,Y+20,w-8,h-22);P(g,C('#9a9488'),X+4,Y+20,w-8,3);P(g,C('#8a5a30'),X+2,Y+6,w-4,16);for(let yy=8;yy<22;yy+=3)P(g,C('#a87840'),X+3,Y+yy,w-6,1);
    P(g,C('#5a3a1a'),X+2,Y+4,w-4,3);P(g,C('#3a2410'),X+w/2-3,Y+h-12,6,10);
    const cx=X-2,cy=Y+h/2,a=t*1.5;disc(g,C('#4a3018'),cx,cy,9);disc(g,C('#2c5f96'),cx,cy,7);for(let i=0;i<6;i++){const aa=a+i*Math.PI/3;line(g,C('#8a5c30'),cx,cy,cx+Math.cos(aa)*9,cy+Math.sin(aa)*9)}P(g,C('#3a2410'),cx-1,cy-1,3,3)}
  else if(o.sprite==='tents'){for(const[dx,dy,c]of[[2,10,'#c8b890'],[30,6,'#b8a880'],[18,24,'#d0c098'],[44,22,'#c0b088']]){const tx=X+dx,ty=Y+dy;
      for(let i=0;i<10;i++)P(g,C(c),tx+10-i,ty+i,i*2+1,1);P(g,C('#3a2a1a'),tx+9,ty+5,3,5);P(g,C('#6a5a3a'),tx+10,ty-2,1,3)}
    P(g,'#ff9030',X+30,Y+38,3,3);P(g,'#ffd040',X+31,Y+37,1,2)}
  else if(o.sprite==='tower'){P(g,C('#6a6458'),X+8,Y+8,w-16,h-8);for(let yy=Y+10;yy<Y+h;yy+=5)P(g,C('#5a5448'),X+8,yy,w-16,1);P(g,C('#8a8478'),X+6,Y+4,w-12,6);P(g,C('#4a4438'),X+6,Y+2,w-12,2);
    P(g,C('#2a2420'),X+w/2-6,Y+14,12,14);const sw=Math.sin(t*4)*2;P(g,C('#d8a830'),X+w/2-4+sw,Y+16,8,8);P(g,C('#b08820'),X+w/2-5+sw,Y+23,10,2);P(g,C('#3a2410'),X+w/2-3,Y+h-12,6,12);
    for(let i=0;i<w-12;i+=4)P(g,C('#8a8478'),X+6+i,Y,2,2)}
}
function drawCart(g,c,t){const x=Math.round(c.x),y=Math.round(c.y),C=k=>c.flash>0?'#fff':k,rot=c.moving?((t*6|0)%2):0;
  g.globalAlpha=.35;P(g,'#000',x-14,y-1,26,3);g.globalAlpha=1;
  P(g,C('#6a4a2a'),x+6,y-9,8,5);P(g,C('#6a4a2a'),x+12,y-11,3,4);P(g,C('#3a2a1a'),x+7,y-4,1,4);P(g,C('#3a2a1a'),x+12,y-4,1,4); // ox
  P(g,C('#8a5c30'),x-12,y-8,18,5);P(g,C('#e0d8c0'),x-12,y-15,18,7);P(g,C('#c8c0a8'),x-12,y-15,18,1);P(g,C('#f0c8a0'),x-8,y-17,3,3);P(g,C('#d8a878'),x-2,y-16,3,2);
  disc(g,C('#3a2410'),x-8,y-3,3);P(g,C('#8a6a3a'),x-9+rot,y-4,1,3);disc(g,C('#3a2410'),x+2,y-3,3);P(g,C('#8a6a3a'),x+1+rot,y-4,1,3);P(g,C('#5a3a1a'),x+5,y-7,3,1)}

/* trap icons: drawn for the player only (foes never see them) */
function drawTrap(g,tr,t,ghost){
  const x=Math.round(tr.x),y=Math.round(tr.y);g.globalAlpha=ghost?.7:1;
  switch(tr.kind){
    case 'pit':if(tr.used){disc(g,'#1a120a',x,y,5);for(let i=-3;i<=3;i+=2)P(g,'#c8b890',x+i,y-2,1,3)}else{disc(g,'#6a5a3a',x,y,5);for(let i=-4;i<=4;i+=2)line(g,'#8a7448',x-4,y+i/2,x+4,y-i/2);if(!ghost)g.globalAlpha=.5;P(g,'#d0c098',x-1,y-1,2,2)}break;
    case 'snare':if(!tr.used){g.globalAlpha*=.8;for(let a=0;a<6.3;a+=.7)P(g,'#c8b070',x+Math.cos(a)*4|0,y+Math.sin(a)*3|0,1,1);P(g,'#8a6a3a',x-1,y-6,1,6)}break;
    case 'caltrops':for(let i=0;i<9;i++){const a=hash(tr.tx,tr.ty,i)*6.3,r=hash(tr.tx,tr.ty,i+20)*11;P(g,'#8a8a90',x+Math.cos(a)*r|0,y+Math.sin(a)*r*.7|0,2,1);P(g,'#c8c8d0',x+Math.cos(a)*r|0,y+Math.sin(a)*r*.7-1|0,1,1)}
      if(ghost){g.globalAlpha=.45;g.strokeStyle='#c8c8d0';g.setLineDash([2,2]);g.beginPath();g.arc(x,y,12,0,7);g.stroke();g.setLineDash([])}break;
    case 'hay':if(tr.used){disc(g,'#2a2018',x,y,6)}else{disc(g,'#8a6a20',x,y-2,7);disc(g,'#d0a840',x,y-3,6);for(let i=-4;i<=4;i+=2)P(g,'#e8c860',x+i,y-6+(Math.abs(i)>>1),1,4);P(g,'#3a2a10',x-5,y+1,10,2)}break;
    case 'hive':if(!tr.used){P(g,'#6a4a1a',x,y-12,1,6);disc(g,'#c8902a',x,y-4,4);P(g,'#a87020',x-4,y-5,9,1);P(g,'#a87020',x-3,y-2,7,1);P(g,'#2a1a08',x-1,y-3,2,2);const b=t*8;P(g,'#ffe040',x+Math.cos(b)*6|0,y-6+Math.sin(b*1.3)*3|0,1,1)}break;
    case 'deadfall':if(tr.used){P(g,'#5a3a1a',x-9,y-2,18,4);P(g,'#7a5430',x-9,y-2,18,1)}else{P(g,'#5a3a1a',x-1,y-14,2,10);P(g,'#7a5430',x-7,y-16,14,4);P(g,'#c8b070',x,y-4,1,4);g.globalAlpha*=.35;disc(g,'#000',x,y,9)}break;
    case 'barricade':P(g,'#6a4424',x-8,y-9,16,9);P(g,'#8a5c30',x-8,y-9,16,2);for(let i=-6;i<8;i+=4)P(g,'#4a2c14',x+i,y-9,1,9);disc(g,'#3a2410',x-5,y,3);disc(g,'#3a2410',x+5,y,3);
      if(tr.hp<tr.max){g.globalAlpha=1;P(g,'#000',x-7,y-13,14,2);P(g,'#e0b040',x-7,y-13,14*tr.hp/tr.max|0,2)}break;
  }
  g.globalAlpha=1;
}
