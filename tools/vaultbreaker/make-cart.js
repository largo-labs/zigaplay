/* Redraws Vaultbreaker's label (games/vaultbreaker/cart.png, 288 x 192) from the game's own title screen.
   Needs Playwright:  node tools/vaultbreaker/make-cart.js */
const {chromium}=require('playwright'),path=require('path');
const ROOT=path.resolve(__dirname,'..','..');
(async()=>{const b=await chromium.launch();
  const p=await (await b.newContext({viewport:{width:288,height:192},deviceScaleFactor:1})).newPage();
  await p.addInitScript(()=>{window.__vbBare=true});
  await p.goto('file://'+path.join(ROOT,'games','vaultbreaker','index.html'));await p.waitForTimeout(900);
  await (await p.$('#cv')).screenshot({path:path.join(ROOT,'games','vaultbreaker','cart.png')});
  await b.close()})();
