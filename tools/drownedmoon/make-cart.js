// Redraws games/drownedmoon/cart.png from the game's own art (window.__DM.cartArt(): the poster, the hooded man, Lift).
// Run from the repo root with the repo served at localhost:8765:  node tools/drownedmoon/make-cart.js
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8765/games/drownedmoon/index.html');await p.waitForTimeout(800);
const url=await p.evaluate(()=>window.__DM.cartArt());
require('fs').writeFileSync('games/drownedmoon/cart.png',Buffer.from(url.split(',')[1],'base64'));await b.close()})()
