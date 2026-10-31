/* ================= Strike at Night's places: the 2026 street, Larkfield, the Crows' camp, Greyford, the tollhouse =================
   New backdrop layers (hooked into scenery.js), things that stand on the ground, and the night sky. */
Object.assign(THEMES,{
 city:{sky:['#04050e','#10183a','#2a1a3a'],far:'city',farC:['#1a1e3a','#141830'],mid:'street',midC:['#2a2c3e','#1c1e2c','#ffd77a'],ground:['#3a3a44','#26262e','#c8c8d0'],gfx:'road',nightSky:1},
 house:{sky:['#5a3a24','#4a2e1c','#3a2416'],far:'woodwall',farC:['#7a5434','#5a3a22'],mid:'none',midC:['#000','#000','#000'],ground:['#8a6238','#6a4a2a','#5a3a20'],planks:1,indoor:1},
 fields:{sky:['#5a8ae0','#a8ccf4','#ffe8b8'],far:'hills',farC:['#7aa0c8','#6a8cb0'],mid:'wheat',midC:['#e8c050','#b89030','#7a5a2a'],ground:['#7ab048','#5a8a34','#c8a878'],path:1,sun:1},
 camp:{sky:['#1a3040','#2a5060','#5a7a6a'],far:'treeline',farC:['#2a4a3a','#1e3a2e'],mid:'bigtrees',midC:['#2a5a34','#1e4426','#4a3420'],ground:['#3a6a2e','#2a4e22','#6a4a2a'],deco:'mushrooms'},
 greyford:{sky:['#6a84b8','#a8bce0','#e8dcc8'],far:'city',farC:['#6a6a88','#585870'],mid:'walls',midC:['#8a7a6a','#6a5a4a','#ffd86a'],ground:['#8a8a96','#6a6a78','#5a5a66'],stones:1},
 tollhouse:{sky:['#16161e','#24222c','#2e2a34'],far:'halls',farC:['#26222c','#1c1a22'],mid:'banners',midC:['#3a343e','#2a262e','#8a2430'],ground:['#3a3640','#2a2830','#4a4450'],stones:1,cave:1,torches:1,indoor:1},
});
const XFAR={
 woodwall(fg,T,R,c1,c2){fg.fillStyle=c1;fg.fillRect(0,0,TILE,H);for(let x=0;x<TILE;x+=12){fg.fillStyle=x%24?shade(c1,-1):c1;fg.fillRect(x,0,11,H);fg.fillStyle=shade(c1,-2);fg.fillRect(x+11,0,1,H)}
   fg.fillStyle=c2;fg.fillRect(0,30,TILE,5);fg.fillRect(0,120,TILE,4);for(let x=40;x<TILE;x+=160){fg.fillStyle=c2;fg.fillRect(x-2,46,40,36);fg.fillStyle='#7aa8d8';fg.fillRect(x,48,36,32);fg.fillStyle='#a8d0f0';fg.fillRect(x+2,50,14,13);fg.fillRect(x+20,50,14,13);fg.fillStyle=c2;fg.fillRect(x+17,48,2,32);fg.fillRect(x,63,36,2)}},
};
const XMID={
 street(mg,T,R,m1,m2,m3,G){/* shop fronts and lamps along a city street */let x=0;while(x<TILE){const w=60+R()*50|0,h=50+R()*40|0;mg.fillStyle=R()<.5?m1:shade(m1,1);mg.fillRect(x,G-h,w,h);mg.fillStyle=m2;mg.fillRect(x,G-h,w,3);
     for(let i=0;i<w-10;i+=14)for(let j=G-h+8;j<G-30;j+=12)if(R()<.45){mg.fillStyle=R()<.7?'#ffd77a':'#9ad0ff';mg.fillRect(x+6+i,j,6,6)}
     mg.fillStyle='#14141c';mg.fillRect(x+w/2-7|0,G-22,14,22);mg.fillStyle='rgba(255,215,122,.35)';mg.fillRect(x+w/2-6|0,G-21,12,20);x+=w+6}
   for(let lx=30;lx<TILE;lx+=128){mg.fillStyle='#1a1a24';mg.fillRect(lx,G-58,3,58);mg.fillRect(lx,G-58,12,3);mg.fillStyle='#fff2c0';mg.fillRect(lx+9,G-56,5,3)}},
 wheat(mg,T,R,m1,m2,m3,G){for(let x=0;x<TILE;x+=3){const h=18+R()*10|0;mg.fillStyle=R()<.5?m1:m2;mg.fillRect(x,G-h,2,h);mg.fillStyle=shade(m1,1);mg.fillRect(x,G-h,2,3)}
   mg.fillStyle=m3;for(let x=0;x<TILE;x+=40){mg.fillRect(x,G-14,3,14)}mg.fillRect(0,G-11,TILE,2);mg.fillRect(0,G-6,TILE,2)},
 none(){},
};
const XGROUND={
 road(gg,T,R,g1,g2,g3){gg.fillStyle='#4a4a54';gg.fillRect(0,0,TILE,9);gg.fillStyle='#5a5a66';gg.fillRect(0,0,TILE,2);for(let x=0;x<TILE;x+=16)gg.fillRect(x,2,1,7);
   gg.fillStyle=g2;gg.fillRect(0,9,TILE,H);gg.fillStyle=g3;for(let x=0;x<TILE;x+=40)gg.fillRect(x,19,20,2)},
};
/* the sky after dark: a crescent moon, stars, and the day colours pressed down to night */
function drawNightSky(g,t,deepen){if(deepen){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(2,4,18,.92)');gr.addColorStop(.6,'rgba(14,20,56,.82)');gr.addColorStop(1,'rgba(40,24,52,.7)');g.fillStyle=gr;g.fillRect(0,0,W,H)}
  for(let i=0;i<46;i++){const x=(i*97%W),y=(i*53%90),tw=.5+.5*Math.sin(t*2+i);g.fillStyle=`rgba(255,255,255,${.25+.6*tw*(i%3?.6:1)})`;g.fillRect(x,y,1,1)}
  const mx=W*.8,my=26;g.fillStyle='rgba(255,250,220,.1)';g.beginPath();g.arc(mx,my,18,0,7);g.fill();g.fillStyle='#f6f0d4';g.beginPath();g.arc(mx,my,9,0,7);g.fill();g.fillStyle='#0c1232';g.beginPath();g.arc(mx+4,my-2,8.4,0,7);g.fill()}
/* the sky at sundown: the day pressed toward orange and violet, a low red sun, the first star */
function drawDuskSky(g,t){const gr=g.createLinearGradient(0,0,0,GROUND_Y);gr.addColorStop(0,'rgba(40,30,90,.85)');gr.addColorStop(.55,'rgba(200,90,110,.6)');gr.addColorStop(1,'rgba(255,170,90,.55)');g.fillStyle=gr;g.fillRect(0,0,W,GROUND_Y);
  g.fillStyle='rgba(255,200,120,.25)';g.beginPath();g.arc(W*.2,92,22,0,7);g.fill();g.fillStyle='#ff8a4a';g.beginPath();g.arc(W*.2,92,11,0,7);g.fill();
  g.fillStyle=`rgba(255,255,255,${.5+.4*Math.sin(t*2)})`;g.fillRect(Math.round(W*.7),22,1,1);g.fillRect(Math.round(W*.86),40,1,1)}
/* a house with a door: kind decides the sign (inn, shop, forge, tailor) or none */
function drawHouse(g,x,o){const y=GROUND_Y,w=o.w||62,h=o.h||46,wall=o.wall||'#e8d8b8',roof=o.roof||'#8a5a3a';
  g.fillStyle=shade(wall,-1);g.fillRect(x-w/2,y-h,w,h);g.fillStyle=wall;g.fillRect(x-w/2+2,y-h,w-4,h);
  g.fillStyle=roof;g.beginPath();g.moveTo(x-w/2-6,y-h);g.lineTo(x,y-h-24);g.lineTo(x+w/2+6,y-h);g.fill();g.fillStyle=shade(roof,-1);g.fillRect(x-w/2-6,y-h,w+12,3);
  g.fillStyle='#5a3a24';g.fillRect(x-7,y-22,14,22);g.fillStyle=o.open?'#1a1008':'#7a5434';g.fillRect(x-6,y-21,12,21);if(!o.open){g.fillStyle='#f2c84a';g.fillRect(x+3,y-11,2,2)}
  const lit=o.lit;for(const wx of[x-22,x+14]){g.fillStyle=lit?'#ffd77a':'#a8c8e0';g.fillRect(wx,y-34,9,9);g.fillStyle='#5a3a24';g.fillRect(wx+4,y-34,1,9);g.fillRect(wx,y-30,9,1)}
  if(o.sign&&SIGN_ICONS[o.sign]){g.fillStyle='#5a3a24';g.fillRect(x+w/2-4,y-40,2,8);g.fillStyle='#f4e8c8';g.fillRect(x+w/2-12,y-32,18,12);g.drawImage(SIGN_ICONS[o.sign],x+w/2-9,y-31)}}
/* ---------- things that stand on the ground; each draws with its foot at (x, GROUND_Y + 11) ---------- */
const PROP={};
{const mk=(name,w,h,f)=>{const b=new Buf(w,h);f(b,w,h);b.outline(INK);PROP[name]={c:b.canvas(1),w,h}};
 mk('car',58,22,b=>{b.rect(3,10,52,8,'#c8283c');b.poly([[12,10],[18,3],[38,3],[46,10]],'#c8283c');b.poly([[15,10],[20,5],[28,5],[28,10]],'#9ad0ff');b.poly([[30,10],[30,5],[37,5],[43,10]],'#9ad0ff');
   b.rect(3,12,4,3,'#fff6c0');b.rect(51,12,4,3,'#ff6a5a');b.rect(3,16,52,2,'#7a1424');b.ell(14,18,4,4,'#1a1a22',1);b.ell(44,18,4,4,'#1a1a22',1);b.ell(14,18,1.5,1.5,'#8a8a96',1);b.ell(44,18,1.5,1.5,'#8a8a96',1)});
 mk('parked',58,22,b=>{b.rect(3,10,52,8,'#3a6a9a');b.poly([[12,10],[18,3],[38,3],[46,10]],'#3a6a9a');b.poly([[15,10],[20,5],[28,5],[28,10]],'#1a2a3a');b.poly([[30,10],[30,5],[37,5],[43,10]],'#1a2a3a');
   b.rect(3,16,52,2,'#1e3a5a');b.ell(14,18,4,4,'#1a1a22',1);b.ell(44,18,4,4,'#1a1a22',1)});
 mk('bin',12,16,b=>{b.rect(1,3,10,13,'#4a5a4a');b.rect(0,1,12,3,'#3a4a3a');b.rect(3,6,1,8,'#3a4a3a');b.rect(7,6,1,8,'#3a4a3a')});
 mk('signal',10,46,b=>{b.rect(4,8,2,38,'#2a2a34');b.rect(1,0,8,14,'#1a1a22');b.rect(3,2,4,4,'#3a1a1a');b.rect(3,8,4,4,'#f4f4f8')});
 mk('basin',20,22,b=>{b.rect(4,10,2,12,'#6a4428');b.rect(14,10,2,12,'#6a4428');b.rect(2,9,16,3,'#8a5a32');b.ell(10,8,8,3,'#a8a8b0',1);b.ell(10,7,6,1.6,'#7ab0d8',1)});
 mk('hearth',34,34,b=>{b.rect(0,6,34,28,'#7a7068');b.rect(2,8,30,26,'#8a8078');for(let y=10;y<34;y+=6)for(let x=(y/6%2)*5+2;x<32;x+=10)b.rect(x,y,1,5,'#6a6058');b.rect(8,16,18,18,'#1a1008');b.rect(0,4,34,4,'#5a5048');b.rect(10,26,14,3,'#6a4428')});
 mk('bed',40,16,b=>{b.rect(0,6,40,8,'#8a5a32');b.rect(2,3,36,6,'#e8d8a0');b.rect(2,3,10,5,'#f4f4f8');b.rect(14,4,24,5,'#7a8a5a');b.rect(0,12,2,4,'#6a4428');b.rect(38,12,2,4,'#6a4428')});
 mk('shelf',22,40,b=>{b.rect(0,0,22,40,'#6a4428');b.rect(2,2,18,36,'#4a2e1a');for(const y of[12,24,36])b.rect(2,y,18,2,'#8a5a32');b.rect(4,6,4,6,'#c8a060');b.rect(10,7,4,5,'#7ab0d8');b.rect(5,18,8,6,'#a87a4a');b.rect(14,29,5,7,'#c8c8d8')});
 mk('table',40,16,b=>{b.rect(0,2,40,4,'#8a5a32');b.rect(3,6,3,10,'#6a4428');b.rect(34,6,3,10,'#6a4428');b.ell(10,1,4,1.6,'#e8e0d0',1);b.ell(28,1,4,1.6,'#e8e0d0',1);b.rect(18,0,4,2,'#c8a060')});
 mk('idoor',20,40,b=>{b.rect(0,0,20,40,'#4a2e1a');b.rect(2,2,16,38,'#7a5434');b.rect(14,20,2,2,'#f2c84a');b.rect(2,14,16,1,'#5a3a22');b.rect(2,28,16,1,'#5a3a22')});
 mk('fence',48,16,b=>{for(const x of[2,22,42])b.rect(x,0,4,16,'#8a6a4a');b.rect(0,4,48,3,'#a07a52');b.rect(0,10,48,3,'#a07a52')});
 mk('fencebroke',48,16,b=>{for(const x of[2,42])b.rect(x,0,4,16,'#8a6a4a');b.rect(0,4,14,3,'#a07a52');b.rect(34,10,14,3,'#a07a52');b.poly([[20,15],[30,13],[31,16],[20,16]],'#8a6a4a')});
 mk('posts',26,12,b=>{for(let i=0;i<4;i++)b.rect(1+i*2,8-i*2,22-i*3,3,i%2?'#8a6a4a':'#a07a52');b.rect(0,10,26,2,'#6a4a2a')});
 mk('well',30,30,b=>{b.rect(2,16,26,14,'#8a8a96');for(let x=4;x<28;x+=6)b.rect(x,18,1,12,'#6a6a78');b.rect(0,14,30,3,'#6a6a78');b.rect(3,0,2,14,'#6a4428');b.rect(25,0,2,14,'#6a4428');b.poly([[0,2],[15,-2],[30,2],[30,4],[0,4]],'#8a3a2a');b.rect(14,4,2,8,'#c8a060')});
 mk('tentred',56,34,b=>{b.poly([[0,34],[28,0],[56,34]],'#8a2430');b.poly([[28,0],[56,34],[34,34]],'#6a1820');b.poly([[22,34],[28,16],[34,34]],'#2a0a0e');b.rect(27,0,2,3,'#3a2a1a')});
 mk('tent',48,30,b=>{b.poly([[0,30],[24,0],[48,30]],'#7a6a4a');b.poly([[24,0],[48,30],[30,30]],'#5a4a34');b.poly([[19,30],[24,15],[29,30]],'#1a140c')});
 mk('crates',34,22,b=>{b.rect(0,8,16,14,'#8a6a3a');b.rect(16,4,18,18,'#a07a42');b.rect(5,0,14,10,'#7a5a32');for(const[x,y,w,h]of[[0,8,16,14],[16,4,18,18],[5,0,14,10]]){b.rect(x,y,w,1,'#5a3a1a');b.line(x,y,x+w-1,y+h-1,'#5a3a1a')}});
 mk('fireout',22,8,b=>{b.ell(11,5,10,3,'#5a5a60',1);for(let i=0;i<5;i++)b.rect(3+i*4,2+i%2,3,3,'#3a2a1a')});
 mk('wagon',74,40,b=>{b.rect(4,8,60,22,'#6a4428');b.rect(4,8,60,3,'#8a5a32');b.rect(30,13,10,10,'#c8283c');b.ell(35,18,3,3,'#f4d0a0',1);b.rect(64,18,10,3,'#5a3a1a');
   b.ell(16,32,7,7,'#3a2414',0);b.ell(16,32,5,5,'#6a4428',1);b.ell(52,32,7,7,'#3a2414',0);b.ell(52,32,5,5,'#6a4428',1);b.rect(8,2,52,6,'#e8e0c8');b.rect(8,2,52,1,'#c8c0a8')});
 mk('board',30,34,b=>{b.rect(4,14,2,20,'#6a4428');b.rect(24,14,2,20,'#6a4428');b.rect(0,0,30,20,'#8a5a32');b.rect(2,2,26,16,'#c8a878');for(const[x,y]of[[4,4],[11,3],[18,5],[23,3]]){b.rect(x,y,6,8,'#f4ecd0');b.rect(x+1,y+2,4,3,'#8a6a5a')}});
 mk('fountain',40,24,b=>{b.ell(20,18,19,6,'#8a8a96',1);b.ell(20,17,16,4,'#5a8ac8',1);b.rect(18,4,4,12,'#8a8a96');b.ell(20,4,6,2,'#9a9aa8',1);b.rect(19,0,2,4,'#a8d0f0')});
 mk('cell',40,52,b=>{b.rect(0,0,40,3,'#4a4450');b.rect(0,49,40,3,'#4a4450');for(let x=2;x<40;x+=6)b.rect(x,3,2,46,'#6a6470')});
 mk('cellopen',40,52,b=>{b.rect(0,0,40,3,'#4a4450');b.rect(0,49,40,3,'#4a4450');for(let x=2;x<10;x+=6)b.rect(x,3,2,46,'#6a6470')});
 mk('waystation',60,40,b=>{b.rect(4,12,52,28,'#3a2a20');b.rect(6,14,48,26,'#2a1e16');b.poly([[0,12],[22,0],[30,6],[44,2],[60,12]],'#1e1610');b.rect(26,22,10,18,'#120c08');b.rect(10,18,8,6,'#6a3a1a');b.rect(42,20,8,5,'#5a2a14')});
 mk('anvil',22,16,b=>{b.poly([[0,2],[22,2],[18,7],[16,12],[6,12],[4,7]],'#5a5a6a');b.rect(3,12,16,4,'#3a3a4a');b.rect(0,2,22,1,'#8a8a9a')});
 mk('gate',44,60,b=>{b.rect(0,0,8,60,'#6a6a78');b.rect(36,0,8,60,'#6a6a78');b.rect(0,0,44,8,'#7a7a88');for(let x=10;x<36;x+=5)b.rect(x,8,2,52,'#3a3a44');b.rect(8,30,28,2,'#3a3a44')});
 mk('backdoor',16,26,b=>{b.rect(0,0,16,26,'#4a4450');b.rect(2,2,12,24,'#3a2a20');b.rect(10,14,2,2,'#8a8a96')});
}
/* a little campfire that flickers, drawn each frame */
function drawFire(g,x,t){const y=GROUND_Y+10;g.drawImage(PROP.fireout.c,Math.round(x-11),y-8);for(let i=0;i<5;i++){const k=(t*3+i*.37)%1,h=(1-k)*12,ox=Math.sin(t*9+i)*2+(i-2)*2;g.fillStyle=k<.3?'#fff4a0':k<.6?'#ffa02a':'#e0401a';g.globalAlpha=1-k*.5;g.fillRect(Math.round(x+ox-1.5),Math.round(y-6-h*1.2),3,Math.max(1,Math.round(h*.6)));g.globalAlpha=1}}
function drawProp(g,name,x,t,flip){if(name==='fire'){drawFire(g,x,t);return}const P=PROP[name];if(!P)return;const y=GROUND_Y+11-P.h;
  if(flip){g.save();g.translate(Math.round(x),0);g.scale(-1,1);g.drawImage(P.c,-Math.round(P.w/2),y);g.restore()}else g.drawImage(P.c,Math.round(x-P.w/2),y)}
/* the poster with your face on it */
function showPoster(){return new Promise(res=>{const m=hero(),e=el('div','poster pop');const c=document.createElement('canvas');c.width=56;c.height=60;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const s=heroSprite(m.look,null,'idle',false);g.fillStyle='#d8c8a0';g.fillRect(0,0,56,60);g.drawImage(s,DOLL_FX-28,DOLL_FY-62,56,60,0,0,56,60);
  const d=g.getImageData(0,0,56,60),a=d.data;for(let i=0;i<a.length;i+=4){const l=a[i]*.3+a[i+1]*.59+a[i+2]*.11;a[i]=l*1.02+30;a[i+1]=l*.92+20;a[i+2]=l*.7+8}g.putImageData(d,0,0);
  e.innerHTML=`<div class="pt">WANTED</div><div class="ps">DEAD OR ALIVE</div><img src="${c.toDataURL()}"><div class="pn">LIFT OF LARKFIELD</div><div class="pc2">${esc(G.crime||'For the murder of his parents, Bren and Mara Ashby.')}</div><div class="pr">${fmt(G.bounty||300)} COINS</div>`;
  UI.appendChild(e);SND.fx('chest');const md={el:e,input(b){if(b==='a'||b==='b'){popModal(md);res()}}};pushModal(md)})}
