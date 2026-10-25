// Redraws games/pitchfork/cart.png. Run from the repo root with the repo served at localhost:8765.
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8765/games/pitchfork/index.html');await p.waitForTimeout(400);
const url=await p.evaluate(()=>{const W=144,H=96;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#2a1438');gr.addColorStop(.6,'#d8683a');gr.addColorStop(1,'#f0a050');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.fillStyle='#ffd890';g.beginPath();g.arc(104,40,11,0,7);g.fill();
  // castle on the hill
  g.fillStyle='#3a1a2a';g.beginPath();g.moveTo(60,70);g.quadraticCurveTo(110,40,144,52);g.lineTo(144,96);g.lineTo(60,96);g.fill();
  g.fillStyle='#2a1020';g.fillRect(96,30,30,22);g.fillRect(92,22,8,30);g.fillRect(122,18,8,34);for(let i=0;i<4;i++)g.fillRect(97+i*8,26,4,4);g.fillRect(92,19,2,3);g.fillRect(97,19,2,3);g.fillRect(122,15,2,3);g.fillRect(128,15,2,3);
  g.fillStyle='#ffb040';g.fillRect(108,38,2,3);g.fillRect(125,28,2,2);
  // ground
  g.fillStyle='#4a3a20';g.fillRect(0,74,W,22);g.fillStyle='#5a7a30';g.fillRect(0,72,W,4);
  for(let x=0;x<W;x+=3){g.fillStyle=x%2?'#6a8a3a':'#4a6a28';g.fillRect(x,71,1,2)}
  // the rabble, with torches and forks
  const people=[[10,84,'fork'],[22,88,'torch'],[34,83,'scythe'],[46,89,'fork'],[18,92,'flail'],[58,86,'torch'],[30,93,'fork'],[6,94,'pike']];
  people.forEach(([x,y,w],i)=>{const L={skin:SKINS[i%4],hair:HAIRS[(i*3)%7],tunic:PEASANT_TUNICS[i%8],trim:'#3a2a14',hat:i%3===0?'hood':i%3===1?'cap':'',hatC:'#5a4a2a',wpn:w,legs:'#3a2a1a'};drawPerson(g,x,y,L,{face:1,walk:(i*.3)%1,atk:0,t:i})});
  for(const[x,y]of[[22,88],[58,86]]){g.globalAlpha=.25;g.fillStyle='#ffa040';g.beginPath();g.arc(x+4,y-14,8,0,7);g.fill();g.globalAlpha=1}
  // Wat at the front, swinging
  g.save();g.translate(80,90);g.scale(2,2);drawPerson(g,0,0,Object.assign({},LEADER_LOOK,{wpn:'blade'}),{face:1,walk:.25,atk:.6,t:0});g.restore();
  // a knight on the right
  g.save();g.translate(124,92);g.scale(1,1);drawPerson(g,0,0,Object.assign({skin:'#e0b088',hair:'#2a2a2a'},FOES.knight.look),{face:-1,walk:.5,atk:0,t:0});g.restore();
  drawPerson(g,138,86,Object.assign({skin:'#d8a878',hair:'#3a2414'},FOES.rguard.look),{face:-1,walk:0,t:0});
  const o=document.createElement('canvas');o.width=288;o.height=192;const og=o.getContext('2d');og.imageSmoothingEnabled=false;og.drawImage(c,0,0,288,192);return o.toDataURL()});
require('fs').writeFileSync('games/pitchfork/cart.png',Buffer.from(url.split(',')[1],'base64'));await b.close()})();
