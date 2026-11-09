/* Builds Haymaker's tier list: every fighter plays every other, once from each side, CPU against CPU at level 5,
   on the built game (games/haymaker/index.html?hmtest, no drawing). Win rates go into src/tiers.js as TIER_DATA,
   ranked into S (top 5), A (next 10), B (15), C (12) and D (the rest). Then run build.py again.
     node tools/haymaker/tiers.js [rounds per pairing, default 1]
   Needs Playwright with Chromium. */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const ROOT=path.join(__dirname,'..','..'),SRC=path.join(__dirname,'src','tiers.js'),reps=+process.argv[2]||1;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844}});const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
  await pg.goto('file://'+path.join(ROOT,'games','haymaker','index.html')+'?hmtest');await pg.waitForTimeout(500);
  await pg.evaluate(()=>{window.requestAnimationFrame=()=>0});await pg.waitForTimeout(100);
  const res=await pg.evaluate(reps=>{const H=HMT,ids=H.ROSTER.map(f=>f.id),win={},games={},vk=['gym','pier','chapel','ice','roof','dock','crown'];let total=0;
    for(const id of ids){win[id]=0;games[id]=0}
    for(let k=0;k<reps;k++)for(const a of ids)for(const b of ids){if(a===b)continue;
      H.startMatch({mode:'vs',p1:a,p2:b,venue:vk[total%7],lvl:5,bestOf:3});H.go('fight');H.M.F[0].cpu=true;let n=0;
      while(H.SCR==='fight'&&n<60*60*8){H.run(1);n++}
      const w=H.RES?H.RES.winner:-1;if(w===0)win[a]++;else if(w===1)win[b]++;games[a]++;games[b]++;total++;H.go('title')}
    return{win,games,total}},reps);
  const ids=Object.keys(res.win),rate={};for(const id of ids)rate[id]=+(res.win[id]/res.games[id]).toFixed(3);
  const order=ids.slice().sort((a,b)=>rate[b]-rate[a]),tier={},cut=[['S',5],['A',10],['B',15],['C',12],['D',99]];let i=0;
  for(const[t,n]of cut)for(let k=0;k<n&&i<order.length;k++,i++)tier[order[i]]=t;
  const data={games:res.total,rate,tier};
  const src=fs.readFileSync(SRC,'utf8').replace(/\/\*@@TIERS@@\*\/[\s\S]*?\/\*@@END@@\*\//,'/*@@TIERS@@*/'+JSON.stringify(data)+'/*@@END@@*/');
  fs.writeFileSync(SRC,src);
  console.log(order.map(id=>tier[id]+' '+id+' '+Math.round(rate[id]*100)+'%').join('\n'));console.log('matches',res.total,'errors',errs.slice(0,3));await b.close()})();
