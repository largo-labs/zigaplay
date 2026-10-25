// Redraws games/dronestrike/cart.png with the game's own map art.
// Run from the repo root while the repo is served at localhost:8765 (python3 -m http.server 8765).
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('http://localhost:8765/games/dronestrike/index.html');await p.waitForTimeout(800);
const url=await p.evaluate(()=>{const D=__DS;const W=288,H=192;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const m={seed:4242,sea:false};g.drawImage(D.terrain(m,W,H),0,0);D.frontLine(g,W,H,0);
  const units=[{cat:'armor',x:.18,y:.5,prim:1},{cat:'armor',x:.36,y:.44,prim:1,dead:1},{cat:'aa',x:.62,y:.36},{cat:'struct',x:.84,y:.2,prim:1},{cat:'arty',x:.3,y:.2},{cat:'logi',x:.56,y:.58}];
  for(const u of units){u.hp=u.dead?0:7;u.max=10;D.unitSymbol(g,u,u.x*W,u.y*H,10)}
  // drones streaking in from the bottom, with faint trails
  const ds=[[.2,.95,.18,.56],[.33,.98,.3,.27],[.52,1,.55,.64],[.62,.97,.8,.28],[.72,1,.83,.27],[.45,.99,.37,.5]];
  for(const [x0,y0,x1,y1] of ds){const x=x0+(x1-x0)*.78,y=y0+(y1-y0)*.78;g.strokeStyle='rgba(95,216,255,.35)';g.setLineDash([2,3]);g.beginPath();g.moveTo(x0*W,y0*H);g.lineTo(x*W,y*H);g.stroke();g.setLineDash([]);D.droneMark(g,x*W,y*H,Math.atan2(y1-y0,x1-x0),5)}
  // a strike going off on the second tank
  const ex=.36*W,ey=.44*H;const gr=g.createRadialGradient(ex,ey,1,ex,ey,22);gr.addColorStop(0,'rgba(255,240,180,.95)');gr.addColorStop(.4,'rgba(255,150,60,.7)');gr.addColorStop(1,'rgba(255,90,40,0)');g.fillStyle=gr;g.beginPath();g.arc(ex,ey,22,0,7);g.fill();
  g.strokeStyle='rgba(255,170,80,.9)';g.lineWidth=1.5;g.setLineDash([3,4]);g.beginPath();g.moveTo(.62*W,.36*H);g.lineTo(.74*W,.5*H);g.stroke();g.setLineDash([]);
  // the thermal feed inset
  const f=document.createElement('canvas');f.width=96;f.height=64;D.drawFeed(f,'tank',.5,11,{});const fx=W-104,fy=H-72;g.fillStyle='#000';g.fillRect(fx-1,fy-1,98,66);g.drawImage(f,fx,fy);g.strokeStyle='#93e46c';g.lineWidth=1;g.strokeRect(fx-1.5,fy-1.5,99,67);
  g.fillStyle='#93e46c';g.font='12px VT323, monospace';g.fillText('LM-07 · BATTLE TANK',fx+3,fy+10);
  for(let y=0;y<H;y+=3){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,y,W,1)}
  return c.toDataURL()});
require('fs').writeFileSync('games/dronestrike/cart.png',Buffer.from(url.split(',')[1],'base64'));await b.close()})();
