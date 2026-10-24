const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8765/games/drownedmoon/index.html');await p.waitForTimeout(500);
const url=await p.evaluate(()=>{const D=__DM;const W=144,H=96;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 const hz=40;let gr=g.createLinearGradient(0,0,0,hz);gr.addColorStop(0,'#03061a');gr.addColorStop(1,'#1c2c62');g.fillStyle=gr;g.fillRect(0,0,W,hz);
 let s=7;const r=()=>{s=(s*16807)%2147483647;return s/2147483647};for(let i=0;i<55;i++){g.fillStyle=r()<.2?'#ffffff':r()<.5?'#9fb4e8':'#4a5a90';g.fillRect(r()*W|0,r()*(hz-4)|0,1,1)}
 g.fillStyle='#ffffff';[[20,8],[118,12],[60,5]].forEach(([x,y])=>{g.fillRect(x,y,1,1);g.fillRect(x-1,y,3,1);g.fillRect(x,y-1,1,3)});
 // Grey Rock light
 g.fillStyle='#0a0e22';g.beginPath();g.moveTo(104,hz);g.lineTo(110,hz-6);g.lineTo(126,hz-7);g.lineTo(136,hz);g.fill();g.fillRect(117,hz-24,5,18);g.fillStyle='#ffe08a';g.fillRect(117,hz-27,5,3);
 g.fillStyle='rgba(255,224,138,.18)';g.beginPath();g.moveTo(119,hz-26);g.lineTo(60,hz-40);g.lineTo(60,hz-30);g.fill();
 // sea
 gr=g.createLinearGradient(0,hz,0,H);gr.addColorStop(0,'#123068');gr.addColorStop(1,'#02060f');g.fillStyle=gr;g.fillRect(0,hz,W,H-hz);
 const mx=62,my=74;gr=g.createRadialGradient(mx,my,2,mx,my,52);gr.addColorStop(0,'rgba(225,242,255,.95)');gr.addColorStop(.3,'rgba(150,205,255,.45)');gr.addColorStop(1,'rgba(40,80,160,0)');g.fillStyle=gr;g.fillRect(0,hz,W,H-hz);
 g.fillStyle='#eef6ff';g.beginPath();g.ellipse(mx,my,15,11,0,0,Math.PI*2);g.fill();g.fillStyle='#cfdcf0';g.beginPath();g.arc(mx-5,my-3,3,0,7);g.arc(mx+6,my+4,2.5,0,7);g.fill();
 // chains dragging it down
 g.strokeStyle='#2a2a3a';g.lineWidth=1;for(const [x2] of [[10],[30],[100],[132]]){g.beginPath();g.moveTo(mx+(x2<mx?-12:12),my+2);g.lineTo(x2,H);g.stroke()}
 for(let y=hz+2;y<H;y+=3)for(let i=0;i<7;i++){const x=((i*37+y*11)%(W+10))-5;g.fillStyle=Math.abs(x-mx)<20&&y<my?'rgba(230,246,255,.7)':'rgba(110,160,235,.35)';g.fillRect(x,y,4,1)}
 // Ysolde under the water, reaching up
 g.save();g.globalAlpha=.7;g.drawImage(D.personImg(D.LOOKS.ysolde,'down',0),88,58);g.restore();
 // the boat with Marin and Pell
 const bx=30,by=hz-9;g.fillStyle='#16101e';g.fillRect(bx-1,by+8,30,6);g.fillStyle='#8a5a2e';g.fillRect(bx,by+9,28,4);g.fillStyle='#b07a42';g.fillRect(bx,by+9,28,1);g.fillStyle='#16101e';g.fillRect(bx+2,by+13,24,1);
 g.fillStyle='#5a3a1f';g.fillRect(bx+20,by-14,1,23);for(let y=0;y<10;y++){g.fillStyle=y%3?'#f0ece0':'#d8d0c0';g.fillRect(bx+21,by-13+y,Math.min(9,10-y),1)}
 g.drawImage(D.personImg(D.LOOKS.pell,'right',0),bx+2,by-6);g.drawImage(D.personImg(D.LOOKS.marin,'right',0),bx+9,by-6);
 // lantern glow in Marin's hand
 gr=g.createRadialGradient(bx+22,by+2,0,bx+22,by+2,10);gr.addColorStop(0,'rgba(255,240,180,.9)');gr.addColorStop(1,'rgba(255,240,180,0)');g.fillStyle=gr;g.fillRect(bx+10,by-10,26,24);g.fillStyle='#fff6c8';g.fillRect(bx+21,by+1,2,3);
 g.fillStyle='rgba(230,246,255,.6)';for(let x=0;x<W;x+=2)g.fillRect(x,hz+Math.round(Math.sin(x/7)),2,1);
 const o=document.createElement('canvas');o.width=288;o.height=192;const og=o.getContext('2d');og.imageSmoothingEnabled=false;og.drawImage(c,0,0,288,192);return o.toDataURL()});
// Run from the repo root with the repo served at localhost:8765.
require('fs').writeFileSync('games/drownedmoon/cart.png',Buffer.from(url.split(',')[1],'base64'));await b.close()})()
