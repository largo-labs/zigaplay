/* Redraws the label art (games/<id>/cart.png, 288 x 192) for Drift Critters, Pipsqueak and Fourfall from the games' own graphics.
   Needs Playwright:  node tools/kit-games/make-cart.js   (run tools/kit-games/build.py first) */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..','..'),game=id=>'file://'+path.join(ROOT,'games',id,'index.html'),out=id=>path.join(ROOT,'games',id,'cart.png');
(async()=>{
  const b=await chromium.launch();
  const open=async id=>{const ctx=await b.newContext({viewport:{width:288,height:192},deviceScaleFactor:1}),p=await ctx.newPage();await p.goto(game(id));await p.waitForTimeout(500);return p};
  /* Drift Critters: nine seconds into a race on Clover Circuit, mid-drift, with the gauges hidden */
  let p=await open('driftcritters');
  await p.evaluate(()=>{const q=__dc;q.startRace(0);const R=q.R,P=R.P,tr=R.tr,angd=(a,b)=>{let d=(a-b)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d};
    for(let i=0;i<60*9.4;i++){const[tx,ty]=tr.at(P.idx+12,0),d=angd(Math.atan2(ty-P.y,tx-P.x),P.a);q.btnSet('left',d<-.08);q.btnSet('right',d>.08);if(i>60*8.6)q.btnSet('b',true);q.stepRace(1/60)}
    document.getElementById('hud').hidden=true;q.bare=true});
  await p.waitForTimeout(250);await (await p.$('#cv')).screenshot({path:out('driftcritters')});
  /* Pipsqueak: big Pip under the first row of blocks */
  p=await open('pipsqueak');
  await p.evaluate(()=>{const q=__pq;q.newRun(0);let n=0;while(q.state!=='play'&&n++<2000)q.step(1/120);q.P.x=385;q.setForm(1);q.btnSet('right',true);for(let i=0;i<40;i++)q.step(1/120);q.btnSet('a',true);for(let i=0;i<34;i++)q.step(1/120);
    q.st='art';document.getElementById('hud').hidden=true;document.getElementById('ov').hidden=true;q.draw()});
  await p.waitForTimeout(200);await (await p.$('#cv')).screenshot({path:out('pipsqueak')});
  /* Fourfall: a wide well of big blocks with three pieces on the way down */
  p=await open('fourfall');
  const u=await p.evaluate(()=>{const {BLK,ROT}=__ff,c=document.createElement('canvas');c.width=288;c.height=192;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
    const g=x.createLinearGradient(0,0,0,192);g.addColorStop(0,'#1c1650');g.addColorStop(1,'#0d0b20');x.fillStyle=g;x.fillRect(0,0,288,192);
    let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<60;i++){x.fillStyle=`rgba(200,190,255,${.15+r()*.5})`;x.fillRect(r()*288|0,r()*130|0,r()<.2?2:1,r()<.2?2:1)}
    const K='IOTSZJL',S=16,cols=18,rows=12,hs=[5,4,4,3,3,2,2,3,1,1,2,3,3,4,4,5,5,4];
    for(let cx=0;cx<cols;cx++)for(let k=0;k<hs[cx];k++)x.drawImage(BLK[K[(cx*3+k*5+(cx>>1))%7]],cx*S,(rows-1-k)*S,S,S);
    const put=(k,rot,px,py,a)=>{x.globalAlpha=a;for(const[cx,cy]of ROT[k][rot])x.drawImage(BLK[k],(px+cx)*S,(py+cy)*S,S,S);x.globalAlpha=1};
    x.fillStyle='rgba(255,209,92,.14)';x.fillRect(8*S,0,2*S,10*S);put('T',2,8,3,1);put('L',1,2,1,.9);put('I',1,13,0,.9);
    x.fillStyle='#fff';for(const[sx,sy]of[[150,60],[138,84],[166,96]])x.fillRect(sx,sy,2,2);return c.toDataURL()});
  fs.writeFileSync(out('fourfall'),Buffer.from(u.split(',')[1],'base64'));
  await b.close();
})();
