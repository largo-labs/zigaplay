/* ===================== BATTLE: plan a wave, then watch it fly across the map ===================== */
let B=null,bRaf=0;
const LEVEL=['none','light','heavy','very heavy'];
function startBattle(){const m=S.mission;
  let order=DEFAULT_ORDER.filter(d=>S.loadout[d]>0);
  // in the first mission Recon starts at the back, so the player learns to move it up
  if(!S.seen.tutDone&&S.camp===0&&S.battle===0&&order[0]==='recon')order=[...order.slice(1),'recon'];
  B={m,wave:1,maxWave:3,alert:0,avail:{...S.loadout},lost:{},spent:{},recon:0,focus:null,order,plan:{},anim:null,fx:[],tracers:[],pops:[],raiders:[]};
  for(const u of m.units){u.vhp=u.hp;u.vdead=u.dead;u.vhidden=u.hidden}
  battleScreen();AU.music('battle');AU.play('radio')}
function battleScreen(){const s=screen('battle');
  const bar=el('div','bar','');s.el.appendChild(bar);
  const mb=el('div','mapbox');const cv=el('canvas');mb.appendChild(cv);s.el.appendChild(mb);
  const panel=el('div','panel');panel.style.cssText='flex:0 0 auto;height:14rem;overflow:hidden;display:flex;flex-direction:column;gap:.25rem';s.el.appendChild(panel);
  B.ui={bar,cv,panel,s};s.leave=()=>cancelAnimationFrame(bRaf);s.back=()=>{};
  show(s);planWave();
  const loop=t=>{if(SCR!==s)return;drawBattle(t);bRaf=requestAnimationFrame(loop)};bRaf=requestAnimationFrame(loop)}
const availTot=()=>Object.values(B.avail).reduce((a,b)=>a+b,0);
const plural=(n,one,many)=>n===1?one:(many||one+'s');
const dname=(t,n)=>n===1?DRONES[t].name:DRONES[t].plural||DRONES[t].name+'s';
// a drone icon drawn crisp at a readable size
function dIcon(d,size='1.25rem',col){const c=droneIcon(d,16,col);c.className='px';c.style.cssText=`width:${size};height:${size};flex:0 0 auto`;return c}
// a row of icons with a number under each: [[canvas,label,cls]]
function figs(list){const w=el('div','icons');for(const [c,label,cls] of list){const f=el('figure',cls||'');f.appendChild(c);f.appendChild(el('span','',label));w.appendChild(f)}return w}
// only the threats that are really there
function threatChips(m){const t=threat(m);const c=[];
  if(t.aaL)c.push([`Air defense: ${LEVEL[t.aaL]}`,t.aaL>1?'red':'amb']);
  if(t.ewL)c.push([`Jamming: ${LEVEL[t.ewL]}`,t.ewL>1?'red':'amb']);
  if(t.drL)c.push([`Enemy drones: ${LEVEL[t.drL]}`,t.drL>1?'red':'amb']);
  const hid=m.units.filter(u=>u.hidden&&!u.dead).length;if(hid)c.push([`${hid} hidden ${plural(hid,'unit')}`,'amb']);
  return`<div class="chips">${c.length?c.map(([t,k])=>`<span class="chip ${k}">${t}</span>`).join(''):'<span class="chip">No defenses spotted</span>'}</div>`}

/* ---------- forecast: fly the planned wave 40 times on copies of the battle and report the likely result ---------- */
function forecast(runs=40){const groups=B.order.filter(d=>B.plan[d]>0).map(d=>[d,B.plan[d]]);const prim=B.m.units.filter(u=>u.prim);
  const out={objs:0,all:0,lost:0,total:prim.length,n:groups.reduce((a,[,n])=>a+n,0)};if(!out.n)return out;
  const S0=S;const fi=B.focus&&!B.focus.dead?B.m.units.indexOf(B.focus):-1;
  try{for(let r=0;r<runs;r++){S={...S0,stats:{...S0.stats},usage:{},usageAll:{}};
      const units=B.m.units.map(u=>({...u}));const b={m:{...B.m,units},wave:B.wave,maxWave:B.maxWave,alert:B.alert,avail:{...B.avail},lost:{},spent:{},recon:B.recon};
      resolveWave(b,groups,fi>=0?units[fi]:null);
      const d=units.filter(u=>u.prim&&u.dead).length;out.objs+=d;if(d===prim.length)out.all++;out.lost+=Object.values(b.lost).reduce((a,c)=>a+c,0)}}
  finally{S=S0}
  out.objs/=runs;out.all/=runs;out.lost/=runs;return out}
function forecastText(){const f=forecast();if(!f.n)return'<span class="dim">No drones are in this wave yet.</span>';
  const o=Math.round(f.objs),l=Math.round(f.lost);
  return`<span class="dim">Forecast:</span> about <span class="amb">${o} of ${f.total}</span> objectives destroyed${f.all>=.1&&f.all<.95?` <span class="dim">(${Math.round(f.all*100)}% chance of all)</span>`:''}, and ${l?`about <span class="red">${l} ${plural(l,'drone')}</span> lost`:'<span class="grn">few or no drones</span> lost'}.`}

/* ---------- planning a wave: the plan at a glance, with the forecast and one big Launch button ---------- */
function defaultPlan(){const wl=B.maxWave-B.wave+1;const p={};for(const d of B.order){const n=B.avail[d]||0;const D=DRONES[d];
    p[d]=(D.recon||D.hunter||D.interceptor||D.decoy)?n:wl<=1?n:Math.ceil(n*.6)}return p}
function battleBar(){B.ui.bar.innerHTML=`<b>${esc(B.m.name.toUpperCase())}</b><span>WAVE ${B.wave} OF ${B.maxWave}</span>`}
function planWave(keep){const {s,panel}=B.ui;s.items=[];panel.innerHTML='';s.busy=false;B.editing=false;
  B.order=B.order.filter(d=>B.avail[d]>0);battleBar();
  if(!keep)B.plan=defaultPlan();if(B.focus&&B.focus.dead)B.focus=null;
  panel.insertAdjacentHTML('beforeend',threatChips(B.m));
  const coach=el('div','coach','');panel.appendChild(coach);B.ui.coach=coach;
  // the launch order, as icons, left to right
  const fl=B.order.filter(d=>B.plan[d]>0);
  const strip=figs(fl.map((d,i)=>[dIcon(d),`${i+1}. ×${B.plan[d]}`]));strip.style.minHeight='2.1rem';
  if(!fl.length)strip.innerHTML='<span class="dim">No drones in this wave. Choose Edit Plan.</span>';
  const wrap=el('div','');wrap.style.cssText='display:flex;align-items:center;gap:.4rem';wrap.appendChild(el('span','small dim','ORDER'));wrap.appendChild(strip);panel.appendChild(wrap);
  if(B.focus)panel.appendChild(el('div','small',`<span class="dim">Aiming first at:</span> ${esc(B.focus.name)}`));
  panel.appendChild(el('div','small',forecastText()));
  panel.appendChild(el('div','grow'));
  const list=el('div','list');panel.appendChild(list);
  const n=fl.reduce((a,d)=>a+B.plan[d],0);
  row(s,list,`LAUNCH WAVE ${B.wave} · ${n} ${plural(n,'DRONE','DRONES')}`,{cls:'primary',a:()=>launchWave()});
  row(s,list,'EDIT PLAN',{cls:'btn',a:()=>editPlan()});
  const quit=async()=>{if(s.busy)return;const c=await choose('End the mission now? Drones still at the launch site go back into stock, and you are scored on what has been destroyed so far.',['Keep fighting','End mission'],{cancel:0});if(c===1)endBattle('ended')};
  s.key=(b,rep)=>navKey(s,b,rep);s.start=()=>launchWave();s.select=()=>editPlan();s.back=quit;
  keybar(s,[['A','Select'],['START','Launch'],['B','End mission']]);
  const tutFix=tutorialBattle()&&B.wave===1&&B.order[0]!=='recon';
  setFocus(s,tutFix?1:0,true);coachCheck()}

/* ---------- editing the plan: how many of each, the order they fly in, and what to aim at ---------- */
function editPlan(focusD,movingD){const {s,panel}=B.ui;s.items=[];panel.innerHTML='';B.editing=true;battleBar();
  const fc=el('div','small','');panel.appendChild(fc);
  const coach=el('div','coach','');panel.appendChild(coach);B.ui.coach=coach;
  const box=el('div','scroll');box.style.cssText='flex:1 1 auto;min-height:0';const list=el('div','list');box.appendChild(list);panel.appendChild(box);
  let moving=movingD||null;
  const rows=B.order.map(d=>row(s,list,'',{d,
    l:()=>{if(moving)return;if(B.plan[d]>0){B.plan[d]--;upd();AU.play('tick')}},
    r:()=>{if(moving)return;if(B.plan[d]<B.avail[d]){B.plan[d]++;upd();AU.play('tick')}else{AU.play('buzz');toast(`All ${B.avail[d]} are already in this wave`)}},
    a:()=>{moving=moving?null:d;upd();keys()}}));
  const tg=row(s,list,'',{l:()=>cycleFocus(-1),r:()=>cycleFocus(1),a:()=>cycleFocus(1)});
  row(s,list,'DONE',{cls:'primary',a:()=>planWave(true)});
  function cycleFocus(dir){const L=B.m.units.filter(u=>!u.dead&&!u.hidden);const opts=[null,...L];let i=opts.indexOf(B.focus);i=(i+dir+opts.length)%opts.length;B.focus=opts[i];upd();AU.play('tick')}
  const keys=()=>keybar(s,moving?[['▲▼','Move in line'],['A','Drop']]:[['◀▶','How many'],['A','Change order'],['B','Done']]);
  s.key=(b,rep)=>{
    if(moving&&(b==='up'||b==='down')){const i=B.order.indexOf(moving),j=i+(b==='up'?-1:1);if(j<0||j>=B.order.length){AU.play('buzz');return}
      B.order.splice(i,1);B.order.splice(j,0,moving);AU.play('tick');editPlan(moving,moving);return}
    if(b==='b'){AU.play('back');if(moving){moving=null;upd();keys();return}planWave(true);return}
    if(b==='start'){planWave(true);launchWave();return}
    navKey(s,b,rep)};
  s.start=null;s.select=null;
  const upd=()=>{rows.forEach((it,i)=>{const d=it.d;it.el.innerHTML='';it.el.classList.toggle('moving',moving===d);
      it.el.insertAdjacentHTML('beforeend',`<span class="dim" style="width:1rem">${i+1}</span>`);it.el.appendChild(dIcon(d));
      it.el.insertAdjacentHTML('beforeend',moving===d?`<span style="flex:1">${DRONES[d].name}</span><span>▲▼</span>`:
        `<span style="flex:1">${DRONES[d].name}</span><span class="qty"><i>◀</i><b>${B.plan[d]}</b><i>▶</i></span><span class="r small">of ${B.avail[d]}</span>`)});
    tg.el.innerHTML=`<span>Aim first at</span><span class="qty"><i>◀</i><b style="min-width:auto">${B.focus&&!B.focus.dead?esc(B.focus.name):'Best target'}</b><i>▶</i></span>`;
    fc.innerHTML=forecastText();coachCheck(moving)};
  upd();keys();
  const k=focusD?rows.findIndex(it=>it.d===focusD):tutorialBattle()&&B.wave===1?rows.findIndex(it=>it.d==='recon'):0;setFocus(s,Math.max(0,k),true)}

/* ---------- the hands-on tutorial in the first battle ---------- */
const tutorialBattle=()=>!S.seen.tutDone&&S.camp===0&&S.battle===0;
function coachSay(text){const c=B.ui&&B.ui.coach;if(!c)return;c.innerHTML=text?esc(text):'';c.style.display=text?'':'none'}
function coachCheck(moving){if(!tutorialBattle()){coachSay('');return}
  const first=B.order[0]==='recon';
  if(B.wave===1){
    if(!B.editing)coachSay(first?'Recon now flies first. The forecast shows what this wave will likely do. Press START to launch.':'Recon flies last, so it cannot find hidden targets for the drones ahead of it. Choose Edit Plan to fix that.');
    else coachSay(first?'Recon is first in line. Press B to go back, then launch.':moving?'Press ▲ until Recon is at the top, then press A.':'Select Recon and press A to pick it up.')}
  else if(B.wave===2)coachSay('Your FPVs are split over three waves. Launch as planned, or use Edit Plan to send more now.');
  else coachSay('This is the last wave. Everything you have left is in it.')}

/* ---------- a wave in the air ---------- */
async function launchWave(){const s=B.ui.s;const n=B.order.reduce((a,d)=>a+(B.plan[d]||0),0);if(!n){toast('Choose Edit Plan and add some drones');return}if(s.busy)return;s.busy=true;
  const groups=B.order.filter(d=>B.plan[d]>0).map(d=>[d,B.plan[d]]);
  const focus=B.focus&&!B.focus.dead?B.focus:null;
  for(const u of B.m.units){u.vhp=u.hp;u.vdead=u.dead;u.vhidden=u.hidden}
  const before=B.m.units.map(u=>({u,hp:u.hp,dead:u.dead}));
  const res=resolveWave(B,groups,focus);
  const {panel}=B.ui;panel.innerHTML='';
  const strip=figs(res.map((g,i)=>[dIcon(g.t),`${i+1}. ×${g.ds.length}`,'dim']));B.ui.strip=strip;panel.appendChild(strip);
  const tk=el('div','ticker','');panel.appendChild(tk);B.ui.ticker=tk;B.ui.details=[];
  keybar(s,[['A','Hold to speed up']]);
  AU.play('launch');
  await animateWave(res);
  for(const u of B.m.units){u.vhp=u.hp;u.vdead=u.dead;u.vhidden=u.hidden}
  await waveReport(res,before);
  const allPrim=B.m.units.filter(u=>u.prim).every(u=>u.dead);
  if(allPrim)return endBattle('won');
  if(B.wave>B.maxWave)return endBattle('time');
  if(!availTot())return endBattle('empty');
  planWave()}
// the strike ticker: one line, always the latest thing that happened
function addLog(h){if(B.ui.ticker)B.ui.ticker.innerHTML=h}
function groupLive(i){if(!B.ui.strip)return;[...B.ui.strip.children].forEach((f,k)=>{f.className=k===i?'cyn':k<i?'':'dim'})}
// one plain sentence or two for what a group did
function groupStory(g){const t=g.t,ev=g.ev,ds=g.ds,n=ds.length,D=DRONES[t];const out=[];
  const cnt=k=>ev.filter(e=>e.k===k).length;const jam=ds.filter(d=>d.fate==='jam').length,shot=ds.filter(d=>d.fate==='aa').length,dk=ds.filter(d=>d.fate==='drone').length;
  if(D.decoy){const drew=ev.filter(e=>e.k==='aa'||e.k==='miss').length+cnt('dronekill');out.push(drew?`The decoys drew ${drew} ${plural(drew,'shot')} away from your drones.`:'Nothing fired at the decoys.');return out}
  if(D.interceptor){const k=cnt('intercept');out.push(k?`Interceptors shot down ${k} enemy ${plural(k,'drone')}.`:'Interceptors found no enemy drones.')}
  if(D.recon){const r=ev.find(e=>e.k==='reveal');out.push(r?`Recon spotted ${r.units.length} hidden ${plural(r.units.length,'target')}.`:'Recon found nothing hidden.')}
  const hits={};for(const e of ev.filter(e=>e.k==='strike')){const k=e.u.name+'|'+(e.u.x);(hits[k]=hits[k]||{u:e.u,n:0,kill:false}).n++;if(e.kill)hits[k].kill=true}
  for(const h of Object.values(hits))out.push(`<span class="${h.kill?'grn':''}">${h.n} ${dname(t,h.n)} hit the ${esc(h.u.name)}${h.kill?' and destroyed it':''}.</span>`);
  const idle=ds.filter(d=>d.idle&&!d.fate).length;if(idle)out.push(`${idle} ${dname(t,idle)} found no target in range and turned back.`);
  if(shot)out.push(`<span class="red">${shot} ${dname(t,shot)} ${shot===1?'was':'were'} shot down.</span>`);
  if(jam)out.push(`<span class="red">${jam} ${dname(t,jam)} lost ${jam===1?'its':'their'} signal to jamming.</span>`);
  if(dk)out.push(`<span class="red">Enemy drones brought down ${dk} ${dname(t,dk)}.</span>`);
  return out}
function animateWave(res){return new Promise(done=>{
  const GAP=2.5,CROSS=3.0;const ys=B.m.units.filter(u=>!u.dead).map(u=>u.y);const lane=Math.max(.12,Math.min(.62,(ys.length?Math.min(...ys):.5)-.09));let t0=performance.now(),vt=0,last=t0;const timeline=[];
  res.forEach((g,gi)=>{const start=gi*GAP;const n=g.ds.length;
    timeline.push([start,()=>{AU.play('buzzfly');groupLive(gi);addLog(`<span class="cyn">${n} ${dname(g.t,n)} ${n===1?'is':'are'} on the way.</span>`)}]);
    g.ds.forEach((d,i)=>{d.start=start+i*.12;d.dy=((i%5)-2)*.022;d.end=null;
      const xAt=x=>d.start+CROSS*((x+.05)/1.1);
      if(d.fate==='jam'){d.end={t:d.start+.4+Math.random()*.5,how:'jam'}}
      else if(d.fate==='drone'||(d.fate==='decoy'&&!g.ev.some(e=>e.k==='aa'&&e.d===d))){const tt=d.start+.6+Math.random()*.6;d.end={t:tt,how:'drone'};B.raidersQ=(B.raidersQ||[]);timeline.push([tt-.5,()=>B.raiders.push({d,t:performance.now()})])}
      else if(d.fate==='aa'||d.fate==='decoy'){const e=g.ev.find(e=>e.k==='aa'&&e.d===d);const tt=Math.max(d.start+.3,xAt(e.u.x)-.05);d.end={t:tt,how:'aa',u:e.u};timeline.push([tt-.35,()=>{e.u.vhidden=false;B.tracers.push({u:e.u,d,t:performance.now(),hit:true});AU.play('aa')}])}
      if(d.target){const tt=Math.max(d.start+.3,xAt(d.target.x)-.2);d.dive={t:tt,u:d.target};
        const e=g.ev.find(e=>e.k==='strike'&&e.d===d);timeline.push([tt+.45,()=>{const u=e.u;u.vhp=Math.max(0,u.vhp-e.dmg);if(e.kill){u.vdead=true;u.vhp=0}u.flash=12;
          B.fx.push({x:u.x,y:u.y,t:performance.now(),big:e.kill});B.pops.push({x:u.x,y:u.y,text:e.kill?'DESTROYED':'-'+e.dmg,t:performance.now(),col:e.kill?'#93e46c':'#ffd27a'});AU.play(e.kill?'boom':'smallboom')}]);
        if(d.D.exp)d.end={t:tt+.45,how:'hit'}}});
    for(const e of g.ev.filter(e=>e.k==='miss')){const d=e.d;const tt=d.start+CROSS*((e.u.x+.05)/1.1)-.3;timeline.push([tt,()=>{e.u.vhidden=false;B.tracers.push({u:e.u,d,t:performance.now(),hit:false});AU.play('aa')}])}
    const rv=g.ev.find(e=>e.k==='reveal');if(rv)for(const u of rv.units){timeline.push([start+CROSS*((u.x+.05)/1.1),()=>{u.vhidden=false;B.pops.push({x:u.x,y:u.y,text:'SPOTTED',t:performance.now(),col:'#5fd8ff'});AU.play('radio')}])}
    const ints=g.ev.filter(e=>e.k==='intercept').length;if(ints)timeline.push([start+.9,()=>{AU.play('zap');for(let k=0;k<ints;k++)B.fx.push({x:.3+Math.random()*.4,y:.3+Math.random()*.2,t:performance.now(),air:true})}]);
    for(const d of g.ds)if(d.end&&d.end.how==='jam')timeline.push([d.end.t,()=>AU.play('jam')]);
    timeline.push([start+CROSS+.2,()=>{const L=groupStory(g);B.ui.details.push(...L);addLog(L.join(' '))}])});
  timeline.sort((a,b)=>a[0]-b[0]);const total=(res.length-1)*GAP+CROSS+1;let ti=0;
  const A={res,lane,CROSS,now:0},myB=B;B.anim=A;
  const tick=()=>{if(B!==myB){done();return}const now=performance.now();vt+=(now-last)/1000*(HELD.a||HELD.start?3:1);last=now;A.now=vt;
    while(ti<timeline.length&&timeline[ti][0]<=vt){timeline[ti][1]();ti++}
    if(vt>=total){while(ti<timeline.length){timeline[ti][1]();ti++}B.anim=null;done();return}
    requestAnimationFrame(tick)};requestAnimationFrame(tick)})}

/* ---------- the report after each wave: pictures first, and it stays until you press A ---------- */
// objective icons: a tick when destroyed, the health left when not
function objFigs(m,fresh=[]){return figs(m.units.filter(u=>u.prim).map(u=>{const c=unitPic(u.type,30);return[c,u.dead?'✓':`${Math.round(u.hp/u.max*100)}%`,u.dead?(fresh.includes(u)?'grn new':'grn'):'amb']}))}
function lossFigs(o,cls){return figs(Object.entries(o).filter(([,n])=>n>0).map(([t,n])=>[dIcon(t,'1.3rem',cls==='red'?'#ff5545':undefined),`×${n}`,cls]))}
function waveReport(res,before){const fresh=before.filter(b=>!b.dead&&b.u.dead).map(b=>b.u);
  const lost={},back={};for(const g of res)for(const d of g.ds){if(!d.fate)back[d.t]=(back[d.t]||0)+1;else if(d.fate!=='spent')lost[d.t]=(lost[d.t]||0)+1}
  const prim=B.m.units.filter(u=>u.prim),pd=prim.filter(u=>u.dead).length;
  const w=el('div','');w.appendChild(el('h3','',`WAVE ${B.wave-1} REPORT`));
  w.appendChild(el('div','',fresh.length?`<span class="grn">Destroyed this wave: ${fresh.map(u=>esc(u.name)).join(', ')}.</span>`:'No objective was destroyed this wave.'));
  w.appendChild(el('div','small dim',`Objectives destroyed: ${pd} of ${prim.length}`));w.appendChild(objFigs(B.m,fresh));
  const nl=Object.values(lost).reduce((a,b)=>a+b,0);
  w.appendChild(el('div','small dim',nl?`Drones lost: ${nl}`:'No drones were lost.'));if(nl)w.appendChild(lossFigs(lost,'red'));
  if(Object.keys(back).length){w.appendChild(el('div','small dim','Back at base, ready to fly again'));w.appendChild(lossFigs(back,''))}
  const det=(B.ui.details||[]).map(h=>`<div>${h}</div>`).join('');
  return report(w,'CONTINUE',det)}
// a panel that waits for A; SELECT flips to the details when there are any
function report(content,btnText='CONTINUE',details=''){return new Promise(res=>{
  const o=overlay(`<div class="msg rep" style="font-size:1rem;line-height:1.2"></div><div class="list" style="margin-top:.45rem"><div class="row primary focus">${btnText}</div></div><div class="keys" style="margin-top:.35rem"><span><b>A</b>Continue</span>${details?'<span><b>SELECT</b>Details</span>':''}</div>`);
  const box=o.querySelector('.rep');if(typeof content==='string')box.innerHTML=content;else box.appendChild(content);
  let detOn=false;const main=box.innerHTML===''?null:[...box.childNodes];
  AU.play('radio');const L={key(b){
    if(b==='select'&&details){detOn=!detOn;AU.play('tick');box.innerHTML='';if(detOn)box.innerHTML=`<h3>DETAILS</h3><div class="small">${details}</div>`;else main.forEach(n=>box.appendChild(n));return}
    if(b!=='a'&&b!=='start'&&b!=='b')return;AU.play('ok');layers.splice(layers.indexOf(L),1);o.remove();res()}};setTimeout(()=>layers.push(L),250)})}
async function endBattle(why){const m=B.m;const prim=m.units.filter(u=>u.prim),pd=prim.filter(u=>u.dead).length;
  const head={won:'ALL OBJECTIVES DESTROYED',time:'THE ENEMY HAS PULLED BACK',empty:'NO DRONES LEFT TO SEND',ended:'MISSION ENDED'}[why];
  const body={won:'Every target marked ★ is destroyed.',
    time:`All three waves have flown. ${pd} of ${prim.length} objectives were destroyed.`,
    empty:`Every drone you brought is spent. ${pd} of ${prim.length} objectives were destroyed.`,
    ended:`You called the drones home. ${pd} of ${prim.length} objectives were destroyed.`}[why];
  AU.play(why==='won'?'win':'alarm');
  await report(`<h3 class="${why==='won'?'grn':'amb'}" style="font-size:1rem">${head}</h3><div>${body}</div>`,'SEE THE RESULTS');
  const R=finishBattle(B);S.battle++;S.mission=null;S.loadout=null;if(S.camp===0&&S.battle===1)S.seen.tutDone=1;save();const b=B;go(()=>debrief(b,R))}
/* ---------- drawing ---------- */
function drawBattle(t){const {cv}=B.ui;const dpr=Math.min(2,window.devicePixelRatio||1);const W=Math.round(cv.clientWidth*dpr),H=Math.round(cv.clientHeight*dpr);if(!W||!H)return;
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}const g=cv.getContext('2d');
  g.drawImage(terrain(B.m,W,H),0,0);frontLine(g,W,H,t);baseIcon(g,W,H);
  const s=Math.max(9,Math.min(W,H*1.2)*.052);const now=performance.now();
  for(const u of B.m.units){if(u.flash)u.flash--;const vu={...u,hidden:u.vhidden,dead:u.vdead,hp:u.vhp};unitSymbol(g,vu,u.x*W,u.y*H,s,{focus:u===B.focus&&!B.anim&&!u.dead,flash:u.flash||0,t:t/16})}
  const A=B.anim;
  if(A){const vt=A.now,ds=Math.max(5,s*.75);
    for(const g2 of A.res)for(const d of g2.ds){const p=(vt-d.start)/A.CROSS;if(p<0)continue;
      let x=-.05+1.1*p,y=A.lane+d.dy,ang=0,alpha=1,col=null;
      if(d.end&&vt>=d.end.t){if(d.end.how==='hit')continue;const f=(vt-d.end.t)/.7;if(f>=1)continue;
        const pe=(d.end.t-d.start)/A.CROSS;x=-.05+1.1*pe;y+=f*.07;ang=f*5;alpha=1-f;col='#ff8a3a';
        if(d.end.how==='aa'&&f<.05)B.fx.push({x,y,t:now,air:true})}
      else if(d.dive&&vt>=d.dive.t){const f=Math.min(1,(vt-d.dive.t)/.45);const pe=(d.dive.t-d.start)/A.CROSS;const x0=-.05+1.1*pe,y0=A.lane+d.dy;
        x=x0+(d.dive.u.x-x0)*f;y=y0+(d.dive.u.y-y0)*f*f;ang=Math.atan2(d.dive.u.y-y0,d.dive.u.x-x0);
        if(!d.D.exp&&f>=1){const back=(vt-d.dive.t-.45)/.8;if(back>1)continue;x=d.dive.u.x+back*.3;y=d.dive.u.y+(A.lane-d.dive.u.y)*back;ang=-.5}}
      if(p>1.02&&!(d.dive&&vt>=d.dive.t))continue;
      g.globalAlpha=alpha*(d.D.decoy?.7:1);droneMark(g,x*W,y*H,ang,ds,d.t,col||undefined);g.globalAlpha=1;d.px=x;d.py=y}
    // the group's name rides above it
    for(const g2 of A.res){const d=g2.ds[0];const p=(vt-d.start)/A.CROSS;if(p<0||p>1)continue;g.fillStyle='rgba(95,216,255,.85)';g.font=`${Math.round(s*.85)}px VT323, monospace`;g.textAlign='left';
      g.fillText(`${g2.ds.length} ${DRONES[g2.t].short}`,(-.05+1.1*p)*W-s,(A.lane-.06)*H)}
    // tracers from air defense
    B.tracers=B.tracers.filter(tr=>now-tr.t<380);for(const tr of B.tracers){const d=tr.d;if(d.px==null)continue;const k=(now-tr.t)/380;
      g.strokeStyle=`rgba(255,190,90,${1-k})`;g.lineWidth=2;g.setLineDash([4,5]);g.lineDashOffset=-k*40;g.beginPath();g.moveTo(tr.u.x*W,tr.u.y*H);
      g.lineTo((d.px+(tr.hit?0:.04))*W,(d.py+(tr.hit?0:-.03))*H);g.stroke();g.setLineDash([])}
    // enemy drones closing in
    B.raiders=B.raiders.filter(r=>now-r.t<600);for(const r of B.raiders){const d=r.d;if(d.px==null)continue;const k=(now-r.t)/600;droneMark(g,(d.px+.18*(1-k))*W,(d.py-.15*(1-k))*H,2.3,ds*.9,'fpv','#ff5545')}}
  // explosions and numbers
  B.fx=B.fx.filter(f=>now-f.t<900);for(const f of B.fx){const p=(now-f.t)/900;const r=(f.air?s*.6:f.big?s*1.8:s*1.1)*(.3+p);g.strokeStyle=`rgba(255,${180-p*120|0},60,${1-p})`;g.lineWidth=2;g.beginPath();g.arc(f.x*W,f.y*H,r,0,7);g.stroke();
    g.fillStyle=`rgba(255,230,160,${(1-p)*.6})`;g.beginPath();g.arc(f.x*W,f.y*H,r*.5,0,7);g.fill()}
  B.pops=B.pops.filter(p=>now-p.t<1400);for(const p of B.pops){const k=(now-p.t)/1400;g.globalAlpha=1-k*k;g.fillStyle=p.col;g.font=`${Math.round(s*1.05)}px VT323, monospace`;g.textAlign='center';
    g.fillStyle='#000';g.fillText(p.text,p.x*W+1,p.y*H-s*1.6-k*s*1.5+1);g.fillStyle=p.col;g.fillText(p.text,p.x*W,p.y*H-s*1.6-k*s*1.5);g.globalAlpha=1}
  g.textAlign='left'}
