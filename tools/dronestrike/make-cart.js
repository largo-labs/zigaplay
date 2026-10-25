// Redraws games/dronestrike/cart.png with the game's own map art.
// Run from the repo root while the repo is served at localhost:8765 (python3 -m http.server 8765).
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('http://localhost:8765/games/dronestrike/index.html');await p.waitForTimeout(800);
const url=await p.evaluate(()=>{const D=__DS;const W=288,H=192;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const m={seed:4242,sea:false};g.drawImage(D.terrain(m,W,H),0,0);D.frontLine(g,W,H,0);
  const units=[{type:'tank',x:.16,y:.52,prim:1},{type:'tank',x:.36,y:.46,prim:1,dead:1},{type:'aagun',x:.6,y:.38},{type:'hq',x:.84,y:.2,prim:1},{type:'arty',x:.3,y:.2},{type:'truck',x:.58,y:.6},{type:'sam',x:.82,y:.55}];
  for(const u of units){u.cat=D.UNITS[u.type].cat;u.hp=u.dead?0:7;u.max=10;D.unitSymbol(g,u,u.x*W,u.y*H,13)}
  // a group of drones crossing from the left, one peeling off onto the tank
  const lane=.33;[['decoy',.12],['decoy',.17],['fpv',.3],['fpv',.36],['fpv',.42],['loiter',.55],['loiter',.6]].forEach(([t,x],i)=>D.droneMark(g,x*W,(lane+((i%3)-1)*.035)*H,0,8,t));
  g.strokeStyle='rgba(95,216,255,.5)';g.setLineDash([2,3]);g.beginPath();g.moveTo(.3*W,lane*H);g.quadraticCurveTo(.36*W,lane*H,.36*W,.44*H);g.stroke();g.setLineDash([]);
  const ex=.36*W,ey=.46*H;const gr=g.createRadialGradient(ex,ey,1,ex,ey,24);gr.addColorStop(0,'rgba(255,240,180,.95)');gr.addColorStop(.4,'rgba(255,150,60,.7)');gr.addColorStop(1,'rgba(255,90,40,0)');g.fillStyle=gr;g.beginPath();g.arc(ex,ey,24,0,7);g.fill();
  g.strokeStyle='rgba(255,190,90,.9)';g.lineWidth=2;g.setLineDash([4,4]);g.beginPath();g.moveTo(.6*W,.38*H);g.lineTo(.17*W,(lane+.035)*H);g.stroke();g.setLineDash([]);
  for(let y=0;y<H;y+=3){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,y,W,1)}
  return c.toDataURL()});
require('fs').writeFileSync('games/dronestrike/cart.png',Buffer.from(url.split(',')[1],'base64'));await b.close()})();
