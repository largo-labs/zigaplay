/* ===================== BATTLE: plan a wave, watch it fly ===================== */
let B=null,bRaf=0;
function startBattle(){const m=S.mission;B={m,wave:1,maxWave:3,alert:0,avail:{...S.loadout},lost:{},spent:{},recon:0,focus:null,anim:null,log:[],plan:{}};
  battleScreen();AU.music('battle');AU.play('radio')}
function battleScreen(){const s=screen('battle');const m=B.m;
  const bar=el('div','bar','');s.el.appendChild(bar);
  const mb=el('div','mapbox');const cv=el('canvas');mb.appendChild(cv);const feed=el('div','feed');const fc=mk(FW,FH);fc.className='px';feed.appendChild(fc);const fl=el('span','','');feed.appendChild(fl);mb.appendChild(feed);s.el.appendChild(mb);
  const panel=el('div','panel');panel.style.cssText='flex:0 0 auto;height:11.2rem;overflow:hidden';s.el.appendChild(panel);
  B.ui={bar,cv,feed,fc,fl,panel,s};
  s.leave=()=>cancelAnimationFrame(bRaf);
  s.back=()=>{};
  show(s);planWave();
  const loop=t=>{if(SCR!==s)return;drawBattle(t);bRaf=requestAnimationFrame(loop)};bRaf=requestAnimationFrame(loop)}
const availTot=()=>Object.values(B.avail).reduce((a,b)=>a+b,0);
function targetsList(){return B.m.units.filter(u=>!u.dead&&!u.hidden)}
function defaultPlan(){const wl=B.maxWave-B.wave+1;const p={};for(const [d,n] of Object.entries(B.avail)){if(!n)continue;const D=DRONES[d];
    p[d]=(D.recon||D.hunter||D.interceptor)?n:wl<=1?n:Math.ceil(n/wl)}return p}
function planWave(){const {s,panel,bar}=B.ui;s.items=[];panel.innerHTML='';s.busy=false;
  bar.innerHTML=`<b>${esc(B.m.name.toUpperCase())}</b><span>WAVE ${B.wave}/${B.maxWave}${B.alert?` · <span class="red">ALERT ${B.alert}</span>`:''}</span>`;
  B.plan=defaultPlan();const t=threat(B.m);
  panel.appendChild(el('div','small',`<span class="dim">AA</span> ${meter(t.aaL,3,'red')} <span class="dim">JAM</span> ${meter(t.ewL,3,'red')} <span class="dim">DRONES</span> ${meter(t.drL,3,'red')} <span class="dim">· obj ${Math.round(score(B.m)*100)}%</span>`));
  const box=el('div','scroll');box.style.cssText='height:5.1rem;margin:.15rem 0';const list=el('div','list');box.appendChild(list);panel.appendChild(box);const list2=el('div','list');panel.appendChild(list2);
  const types=DRONE_ORDER.filter(d=>B.avail[d]>0);
  const rows=types.map(d=>row(s,list,'',{d,l:()=>{if(B.plan[d]>0){B.plan[d]--;upd();AU.play('tick')}},r:()=>{if(B.plan[d]<B.avail[d]){B.plan[d]++;upd();AU.play('tick')}else AU.play('buzz')}}));
  const tg=row(s,list2,'',{l:()=>cycleFocus(-1),r:()=>cycleFocus(1),a:()=>cycleFocus(1)});
  const launch=row(s,list2,'',{cls:'btn',a:()=>launchWave()});
  row(s,list2,'END MISSION · BRING DRONES HOME',{cls:'btn',a:async()=>{const c=await choose('End the mission now? Drones still in the air come home, and you are scored on what has been hit so far.',['End mission','Keep fighting'],{cancel:1});if(c===0)endBattle()}});
  function cycleFocus(dir){const L=targetsList();const opts=[null,...L];let i=opts.indexOf(B.focus);i=(i+dir+opts.length)%opts.length;B.focus=opts[i];upd();AU.play('tick')}
  const upd=()=>{rows.forEach(it=>{const d=it.d;it.el.innerHTML='';it.el.appendChild(droneIcon(d,13));it.el.insertAdjacentHTML('beforeend',`<span style="flex:1">${DRONES[d].short} <span class="dim small">${DRONES[d].exp?'one-way':'returns'}</span></span><span class="qty"><i>◀</i><b>${B.plan[d]}</b><i>▶</i></span><span class="r small">/${B.avail[d]}</span>`)});
    tg.el.innerHTML=`<span>TARGET</span><span class="qty"><i>◀</i><b style="min-width:auto">${B.focus&&!B.focus.dead?esc(B.focus.name):'Best available'}</b><i>▶</i></span>`;
    const n=Object.values(B.plan).reduce((a,b)=>a+b,0);launch.el.innerHTML=`LAUNCH WAVE ${B.wave} · ${n} DRONES`};
  if(B.focus&&B.focus.dead)B.focus=null;upd();setFocus(s,Math.max(0,rows.length?0:0),true);
  s.start=()=>launchWave();
  if(B.wave===1&&!S.seen.battleTip){S.seen.battleTip=1;setTimeout(()=>msg('Each mission is three waves. Choose how many of each drone fly in this wave with ◀ ▶. Recon and decoys work best early. Anything you hold back can fly later, and a wave that wins early saves drones.',{who:STORY.co,port:portrait(CO_LOOK)}),300)}}
async function launchWave(){const s=B.ui.s;const n=Object.values(B.plan).reduce((a,b)=>a+b,0);if(!n){toast('Choose drones for this wave');return}if(s.busy)return;s.busy=true;
  const launch={};for(const [d,c] of Object.entries(B.plan))if(c)launch[d]=c;
  const focus=B.focus&&!B.focus.dead?B.focus:null;
  // snapshot positions before the wave changes anything
  const res=resolveWave(B,launch,focus);
  B.ui.panel.innerHTML='';const log=el('div','log');B.ui.panel.appendChild(log);B.ui.log=log;
  AU.play('launch');setTimeout(()=>AU.play('buzzfly'),250);
  await animateWave(res);
  // wave summary
  const c=k=>res.ev.filter(e=>e.k===k).length;const strikes=res.ev.filter(e=>e.k==='strike');
  addLog(`<span class="amb">WAVE ${B.wave-1}:</span> ${res.ds.length} up · ${c('jam')} jammed · ${c('aa')+c('dronekill')} shot down · ${strikes.length} hits · <span class="grn">${strikes.filter(e=>e.kill).length} destroyed</span>`);
  await sleep(900);
  const allPrim=B.m.units.filter(u=>u.prim).every(u=>u.dead);
  if(allPrim){addLog('<span class="grn">All objectives destroyed.</span>');await sleep(800);return endBattle()}
  if(B.wave>B.maxWave||!availTot()){addLog(B.wave>B.maxWave?'The enemy has dispersed. Time to come home.':'No drones left to send.');await sleep(900);return endBattle()}
  planWave()}
function addLog(h){if(!B.ui.log)return;B.ui.log.appendChild(el('div','',h));while(B.ui.log.children.length>7)B.ui.log.firstChild.remove()}
function endBattle(){const R=finishBattle(B);S.battle++;S.mission=null;S.loadout=null;save();const b=B;go(()=>debrief(b,R))}

/* ---------- the wave, animated ---------- */
function animateWave(res){return new Promise(done=>{const ds=res.ds;const T0=performance.now();const dur=3600;
  const base=[.5,.93];const sprites=ds.map((d,i)=>{const n=ds.length;const sx=.5+(i-(n-1)/2)*Math.min(.04,.6/n);
    let dest=d.target?[d.target.x,d.target.y]:d.D.recon?[.2+Math.random()*.6,.25+Math.random()*.3]:d.D.interceptor?[.3+Math.random()*.4,.62]:[.3+Math.random()*.4,.45];
    const t0=i/n*.35;let end=null;const f=d.fate;
    if(f==='jam')end={t:.55+Math.random()*.4,p:.25+Math.random()*.2,how:'jam'};
    else if(f==='drone')end={t:.9+Math.random()*.3,p:.45+Math.random()*.15,how:'drone'};
    else if(f==='aa'||f==='decoy')end={t:1.25+Math.random()*.4,p:.7+Math.random()*.15,how:'aa'};
    else if(f==='spent')end={t:1.55+i/n*.5,p:1,how:'hit'};
    return{d,sx,dest,t0,end,ret:!f||f===null}});
  B.anim={sprites,T0,dur,res,fx:[],shots:[],done:false};
  // events with times
  const timeline=[];
  for(const sp of sprites){const e=sp.end;if(!e)continue;
    if(e.how==='jam')timeline.push([e.t,()=>{AU.play('jam');addLog(`<span class="red">${sp.d.D.short} lost to jamming</span>`)}]);
    if(e.how==='drone')timeline.push([e.t,()=>{AU.play('zap');addLog(`<span class="red">${sp.d.D.short} downed by enemy drone</span>`)}]);
    if(e.how==='aa')timeline.push([e.t-.25,()=>AU.play('aa')]);}
  const ints=res.ev.filter(e=>e.k==='intercept').length;if(ints)timeline.push([.8,()=>{AU.play('zap');addLog(`<span class="cyn">Interceptors downed ${ints} enemy drone${ints>1?'s':''}</span>`)}]);
  if(res.ev.some(e=>e.k==='reveal'))timeline.push([.7,()=>{AU.play('radio');addLog('<span class="cyn">Recon found hidden targets</span>')}]);
  // strikes: by the drone that made them
  const strikes=res.ev.filter(e=>e.k==='strike');strikes.forEach((e,i)=>{const sp=sprites.find(s=>s.d===e.d);const t=sp&&sp.end?sp.end.t:1.7+i*.05;
    timeline.push([t,()=>{B.anim.fx.push({x:e.u.x,y:e.u.y,t:performance.now(),big:e.kill});AU.play(e.kill?'boom':'smallboom');e.u.flash=12;if(e.kill)addLog(`<span class="grn">${e.u.name} destroyed</span>`)}])});
  // the featured strike on the drone camera
  const star=strikes.find(e=>e.kill&&e.u.prim)||strikes.find(e=>e.kill)||strikes[0];
  if(star){const sp=sprites.find(s=>s.d===star.d);const ti=sp&&sp.end?sp.end.t:1.7;B.anim.feed={e:star,t0:ti-1.15,t1:ti+.25,boom:!!star.d.D.exp};}
  timeline.sort((a,b)=>a[0]-b[0]);let ti=0;
  // A skips ahead
  const L={key(b){if(b==='a'||b==='start'){B.anim.skip=true}}};layers.push(L);
  const tick=()=>{const t=(performance.now()-T0)/1000*(B.anim.skip?4:1);if(B.anim.skip&&!B.anim.skipT){B.anim.skipT=performance.now();B.anim.skipBase=(performance.now()-T0)/1000}
    const tt=B.anim.skip?B.anim.skipBase+(performance.now()-B.anim.skipT)/1000*4:t;B.anim.now=tt;
    while(ti<timeline.length&&timeline[ti][0]<=tt){timeline[ti][1]();ti++}
    if(tt>=dur/1000){while(ti<timeline.length){timeline[ti][1]();ti++}layers.splice(layers.indexOf(L),1);B.anim.done=true;B.ui.feed.classList.remove('on');B.anim=null;done();return}
    requestAnimationFrame(tick)};requestAnimationFrame(tick)})}

/* ---------- drawing ---------- */
function drawBattle(t){const {cv,feed,fc,fl}=B.ui;const dpr=Math.min(2,window.devicePixelRatio||1);const W=Math.round(cv.clientWidth*dpr),H=Math.round(cv.clientHeight*dpr);if(!W||!H)return;
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}const g=cv.getContext('2d');
  g.drawImage(terrain(B.m,W,H),0,0);frontLine(g,W,H,t);baseIcon(g,W,H);
  const s=Math.max(7,W*.035);
  for(const u of B.m.units){if(u.flash)u.flash--;unitSymbol(g,u,u.x*W,u.y*H,s,{focus:u===B.focus&&!B.anim,flash:u.flash||0,t:t/16})}
  const A=B.anim;
  if(A){const tt=A.now||0;
    for(const sp of A.sprites){let p=(tt-sp.t0)/1.3;if(p<0)continue;let x0=sp.sx,y0=.93,[x1,y1]=sp.dest;let alpha=1,fall=0;
      if(sp.end){const pe=sp.end.p;const te=sp.end.t;if(tt>=te){if(sp.end.how==='hit')continue;fall=Math.min(1,(tt-te)/.6);if(fall>=1)continue;p=pe}else p=Math.min(pe,p)}
      else{if(p>1){const back=(tt-sp.t0-1.3)/1.3;if(back>1)continue;p=1-back*.999}}
      p=Math.max(0,Math.min(1,p));const e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;let x=x0+(x1-x0)*e,y=y0+(y1-y0)*e;
      if(sp.d.D.recon&&!sp.end&&p>.6){x+=Math.sin(tt*3+sp.sx*9)*.04}
      y+=fall*.06;const ang=Math.atan2((y1-y0),(x1-x0))+(fall?fall*6:0);
      g.globalAlpha=1-fall;droneMark(g,x*W,y*H,ang,Math.max(3.5,W*.014),fall?'#ff8a3a':sp.d.D.decoy?'rgba(95,216,255,.55)':'#5fd8ff');g.globalAlpha=1;
      // tracer from the gun that killed it
      if(sp.end&&sp.end.how==='aa'&&tt>sp.end.t-.35&&tt<sp.end.t+.05){const gun=A.res.ev.find(e=>(e.k==='aa'||e.k==='decoy')&&e.d===sp.d);if(gun&&gun.u){g.strokeStyle='rgba(255,170,80,.9)';g.lineWidth=1.5;g.setLineDash([3,4]);g.beginPath();g.moveTo(gun.u.x*W,gun.u.y*H);g.lineTo(x*W,y*H);g.stroke();g.setLineDash([])}}
      if(sp.end&&sp.end.how==='drone'&&tt>sp.end.t-.3&&tt<sp.end.t){droneMark(g,(x+.05)*W,(y-.04)*H,2.4,Math.max(3,W*.012),'#ff5545')}}
    // AA misses: random flak bursts while drones are over the target area
    if(tt>.9&&tt<2.2&&Math.random()<.25){const gun=A.res.ev.filter(e=>e.k==='miss')[Math.random()*20|0];if(gun&&gun.u){g.fillStyle='rgba(255,200,120,.8)';g.fillRect((gun.u.x+(Math.random()-.5)*.12)*W,(gun.u.y+.05+Math.random()*.1)*H,2,2)}}
    // explosions
    const now=performance.now();A.fx=A.fx.filter(f=>now-f.t<900);for(const f of A.fx){const p=(now-f.t)/900;const r=(f.big?W*.07:W*.035)*(.3+p);g.strokeStyle=`rgba(255,${180-p*120|0},60,${1-p})`;g.lineWidth=2;g.beginPath();g.arc(f.x*W,f.y*H,r,0,7);g.stroke();
      g.fillStyle=`rgba(255,230,160,${(1-p)*.6})`;g.beginPath();g.arc(f.x*W,f.y*H,r*.5,0,7);g.fill()}
    // the drone camera
    const F=A.feed;if(F&&tt>=F.t0&&tt<=F.t1+.5){feed.classList.add('on');const p=Math.min(1,(tt-F.t0)/(F.t1-F.t0));
      drawFeed(fc,F.e.u.type,p*.98,B.m.seed+(F.e.u.x*1000|0),{boom:true,sea:F.e.u.cat==='naval'});fl.textContent=`${F.e.d.D.short}-${String(F.e.d.id+1).padStart(2,'0')} · ${F.e.u.name.toUpperCase()}`}
    else feed.classList.remove('on')}}
