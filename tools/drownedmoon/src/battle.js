/* ===================== BATTLE ===================== */
let B=null;
const sceneH=()=>Math.round(VH*.74);
function foeLayout(n,boss){const W=VW,H=sceneH();
  if(boss)return[[W*.36,H*.92]];
  const L={1:[[.36,.88]],2:[[.24,.8],[.5,.96]],3:[[.2,.79],[.48,.84],[.28,.99]],4:[[.18,.79],[.44,.79],[.26,.98],[.52,.98]]}[n]||[];
  return L.map(([x,y])=>[W*x,H*y])}
async function startBattle(ids,opt={}){
  // how the party walked in, so a lost fight can be tried again from the same start
  const snap=JSON.stringify({heroes:S.heroes,inv:S.inv,gold:S.gold});
  // swirl in
  AU.play('swirl');AU.music(opt.music||(opt.boss?(opt.final?'final':'boss'):'battle'));
  await swirl();
  for(let tries=0;;tries++){
  if(tries){const o=JSON.parse(snap);
    for(const id in o.heroes){const h=S.heroes[id];if(h){for(const k of Object.keys(h))delete h[k];Object.assign(h,o.heroes[id])}else S.heroes[id]=o.heroes[id]}
    for(const k of Object.keys(S.inv))delete S.inv[k];Object.assign(S.inv,o.inv);S.gold=o.gold;
    for(const h of partyHeroes()){const st=stats(h);h.hp=st.hp;h.mp=st.mp;h.st={}}
    AU.music(opt.music||(opt.boss?(opt.final?'final':'boss'):'battle'))}
  const foes=ids.map((id,i)=>{const f=FOES[id];return{kind:'foe',id,name:f.name,def:f,hp:f.hp,max:f.hp,gh:1,ghW:0,lunge:0,st:{},buf:{},fl:0,dead:false,alpha:1,img:monImg(f.spr[0],f.spr[1])}});
  const counts={};foes.forEach(f=>{counts[f.name]=(counts[f.name]||0)+1});
  const used={};foes.forEach(f=>{if(counts[f.name]>1){used[f.name]=(used[f.name]||0)+1;f.label=f.name+' '+'ABCD'[used[f.name]-1]}else f.label=f.name});
  const lay=foeLayout(foes.length,opt.boss);foes.forEach((f,i)=>{f.x=lay[i][0];f.y=lay[i][1]});
  const heroes=partyHeroes().map((h,i)=>({kind:'hero',h,id:h.id,name:HEROES[h.id].name,buf:{},fl:0,i}));
  B={foes,heroes,tide:S.tide,tideIn:3,round:0,fx:[],nums:[],parts:[],bg:opt.bg||'cave',opt,cursor:null,acting:null,msg:null,over:null,shake:0,cp:2,ultTap:null};
  for(const h of partyHeroes())h.st={...h.st,sleep:0};
  MODE='battle';await fadeQuick();
  buildBattleUI();
  if(opt.intro&&!tries)await opt.intro();
  await bmsg(opt.boss?`${foes[0].name} blocks the way!`:foes.length===1?`${foes[0].name} appears!`:`${foes[0].name} and ${foes.length-1} more appear!`,900);
  if(CP_ON()&&!F('tipcp')){setF('tipcp');await say(null,'<span class="small">Attacks earn CP. Specials cost 2 CP. When a Limit bar fills, tap it to unleash an ult.</span>')}
  let result=null;
  while(!result){result=await battleRound()}
  const out=await battleEnd(result);
  teardownBattleUI();
  if(out==='scripted'){MODE='field';fadeEl.classList.remove('white','red');fadeEl.style.transitionDuration='0ms';fadeEl.style.opacity=1;return'lost'}
  if(out==='lose'){if(await gameOver())continue;return'lose'}
  MODE='field';AU.music(musicFor(FD.map));await fadeQuick(true);
  return out}}
async function fadeQuick(rev){fadeEl.style.transitionDuration='0ms';fadeEl.classList.remove('white');fadeEl.style.opacity=1;await frames(2);fadeEl.style.transitionDuration='250ms';fadeEl.style.opacity=0;await sleep(260)}
async function swirl(){FD.fx.push(swirlFx);swirlFx.t=0;await frames(42);FD.fx=FD.fx.filter(f=>f!==swirlFx)}
function swirlFx(g){swirlFx.t++;const t=swirlFx.t,cs=10,cx=VW/2,cy=VH/2;
  for(let y=0;y<VH;y+=cs)for(let x=0;x<VW;x+=cs){const a=Math.atan2(y-cy,x-cx),d=Math.hypot(x-cx,y-cy)/Math.hypot(cx,cy);const k=((a/Math.PI+1)/2+d*.6)%1;
    if(k*30<t-8||t>36){g.fillStyle='#000';g.fillRect(x,y,cs,cs)}else if(k*30<t){g.fillStyle=t%4<2?'#fff':'#9fd6ff';g.fillRect(x,y,cs,cs)}}}

/* ---------- battle UI ---------- */
/* ---------- Strike at Night: CP, specials and Limit ults ----------
   The party shares CP. A battle starts with 2, every base attack earns 1, and every special costs 2.
   Each hero also has a Limit bar: attacks and specials fill it, and so do hits taken. When it's full,
   tap the bar (or pick the starred move at the top of the menu) to unleash that hero's ult. */
const LIMIT_ON=()=>S&&S.lore>=3;
const CP_ON=()=>S&&S.lore>=3;
const CP_MAX=9;
const limitOn=h=>false;
function chargeLimit(h,n){if(!LIMIT_ON()||h.hp<=0)return;h.limit=Math.min(100,(h.limit||0)+n*(F('lbboost')?1.25:1)*(F('lake')?1.15:1))}
function gainCP(n){if(!CP_ON())return;const b=B.cp;B.cp=clamp(B.cp+n,0,CP_MAX);if(B.cp>b&&BUI.cp){try{BUI.cp.animate([{transform:'scale(1.25)',filter:'brightness(1.6)'},{transform:'none',filter:'none'}],{duration:320})}catch(e){}}}
const ULTS={
  lift:{name:'Aster\'s Edge',desc:'White light runs down the blade. Hits up to 3 foes.',max:3,pow:3.3,fx:'moon',col:['#ffffff','#e0f6ff','#bfe6ff']},
  sable:{name:'Nightfall',desc:'Every knife she owns, all at once, into one foe. Poisons.',max:1,pow:6.2,fx:'slash',poison:1,col:['#ffffff','#c79af0','#7a4ab0']},
  tobin:{name:'Millstone',desc:'Brings the pitchfork down like a falling millstone. Hits up to 2 foes.',max:2,pow:4.2,fx:'slam',col:['#ffffff','#ffe9a0','#d8b27a']},
};
function ultOf(a){if(a.id==='lift'&&R4())return FORM_ULTS[(FORMS[S.form]||FORMS.base).ult];return ULTS[a.id]}
async function ultBanner(a,U){AU.play('level');B.shake=8;B.fx.push({kind:'lbflash',t:0,dur:26});
  const [x,y]=centerOf(a);for(let i=0;i<26;i++){const ang=Math.random()*Math.PI*2,sp=1+Math.random()*2.4;B.parts.push({x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-1,life:14+(Math.random()*10|0),max:24,col:U.col[i%3],big:i<8})}
  const w=win('lbbanner',`<small>LIMIT BREAK</small>${U.name}`);await sleep(1000);w.remove();
  // every Limit Break burns a little of Aster; now and then she lets it show
  // before she has told him her name, Aster says nothing: the light only flickers
  if(F('aster')&&a.id==='lift'){S.burn=(S.burn||0)+1;
    if(!F('named')){if([1,3,6].includes(S.burn))await bmsg('The light in your chest flickers.',1500)}
    else{const L={1:'That\'s me. Don\'t get used to it.',3:'Give me a moment.',6:'I\'m fine. Stop asking.',10:'Lift. Not so often.'}[S.burn];if(L){setF('lbaster');await bmsg('<span class="gold">Aster:</span> '+L,1900)}}}}
let BUI={};
// The party panel is built once and then only its numbers and bar widths change, so the bars can slide
// (a pale "ghost" piece shows how much was just lost, then drains away).
function buildBattleUI(){const cpm=CP_ON();BUI.party=win('bparty'+(cpm?' cpm':''),cpm?'<div class="phead"><span class="cpv"></span><span>HP</span></div>':'<div class="phead"><span></span><span></span><span>HP</span><span>MP</span></div>');BUI.tide=win('tidebadge','');
  BUI.cp=cpm?BUI.party.querySelector('.cpv'):null;
  BUI.rows=B.heroes.map(a=>{const r=el('div','prow',
    `<div class="nm"><span class="n">${a.name}</span><span class="st"></span></div><div class="hpb"><s></s><i></i></div><div class="hpt">0</div><div class="mpt">0</div>`+(LIMIT_ON()?'<div class="lbb"><b>LIMIT</b><div class="lbar"><i></i></div><em>0%</em></div>':''));BUI.party.appendChild(r);
    const q=s=>r.querySelector(s);const lb=q('.lbb');
    // tapping a full Limit bar on that hero's turn unleashes the ult
    if(lb){const tap=e=>{e.preventDefault();e.stopPropagation();if(B&&B.ultTap&&B.acting===a)B.ultTap()};lb.addEventListener('pointerdown',tap);lb.addEventListener('click',e=>e.preventDefault())}
    return{a,r,st:q('.st'),hp:q('.hpt'),ghost:q('.hpb s'),fill:q('.hpb i'),mp:q('.mpt'),lb,last:null}});
  updateBattleUI()}
function teardownBattleUI(){for(const k in BUI){if(BUI[k]&&BUI[k].remove)BUI[k].remove()}BUI={}}
function updateBattleUI(){if(!B||!BUI.party)return;
  if(BUI.cp){let pips='';for(let k=0;k<CP_MAX;k++)pips+=`<i class="${k<B.cp?'on':''}"></i>`;BUI.cp.innerHTML=`<b>CP</b>${pips}<em>${B.cp}</em>`}
  for(const R of BUI.rows){const a=R.a,h=a.h,s=stats(h);const r=clamp(h.hp/Math.max(1,s.hp),0,1),m=clamp(h.mp/Math.max(1,s.mp),0,1);
    const st=h.hp<=0?'KO':h.st.sleep?'Zz':h.st.poison?'PSN':'';
    R.r.className='prow'+(B.acting===a?' act':'')+(h.hp<=0?' ko':r<=.25?' low':'');
    R.st.textContent=st;R.st.className='st'+(st?' on '+st.toLowerCase():'');
    R.hp.textContent=h.hp;R.mp.textContent=CP_ON()?'':h.mp;
    if(R.lb){const v=h.limit||0,rd=v>=100&&h.hp>0,mine=rd&&B.acting===a&&!a.ultQueued;R.lb.querySelector('i').style.width=v+'%';R.lb.className='lbb'+(a.ultQueued?' on':rd?' ready':'')+(mine?' tap':'');
      R.lb.querySelector('b').textContent=a.ultQueued?'ULT':'LIMIT';R.lb.querySelector('em').textContent=a.ultQueued?'READY':mine?'TAP ★':rd?'FULL':Math.floor(v)+'%'}
    R.fill.className=r>.5?'':r>.25?'mid':'lo';
    const pct=(r*100).toFixed(1)+'%';
    if(R.last!=null&&h.hp<R.last){R.ghost.style.transition='width .55s ease-in .4s';
      try{R.r.animate([{transform:'translateX(-3px)',background:'rgba(255,80,80,.45)'},{transform:'translateX(3px)'},{transform:'translateX(-2px)'},{transform:'none',background:'rgba(255,80,80,0)'}],{duration:320})}catch(e){}}
    else{R.ghost.style.transition='none';
      if(R.last!=null&&h.hp>R.last){try{R.r.animate([{background:'rgba(125,255,176,.4)'},{background:'rgba(125,255,176,0)'}],{duration:450})}catch(e){}}}
    R.fill.style.width=pct;R.ghost.style.width=pct;R.last=h.hp}
  BUI.tide.style.display=S.lore>=3?'none':'';BUI.tide.className='win tidebadge '+B.tide;BUI.tide.innerHTML=(B.tide==='flood'?'≈ Flood':'◐ Ebb')+` <span>${B.tideIn}</span>`}
async function bmsg(text,ms=700){if(BUI.msg)BUI.msg.remove();BUI.msg=win('bmsg',text);await sleep(ms);if(BUI.msg){BUI.msg.remove();BUI.msg=null}}
function bmsgShow(text){if(BUI.msg)BUI.msg.remove();BUI.msg=win('bmsg',text)}
function bmsgHide(){if(BUI.msg){BUI.msg.remove();BUI.msg=null}}

/* ---------- stats in battle ---------- */
function bst(a){if(a.kind==='hero'){const s=stats(a.h);return{...s,atk:s.atk*(a.buf.atk||1),def:s.def*(a.h.st.guard?1:1)}}
  const f=a.def;let atk=f.atk,mag=f.mag,def=f.def;
  if(f.tb&&B.tide==='flood'){atk*=1.2;mag*=1.2}
  if(f.tb&&B.tide==='ebb')def*=.6;
  if(a.buf.def)def*=1.6;if(a.buf.atk)atk*=1.3;
  return{atk,mag,def,spd:f.spd}}
const alive=a=>a.kind==='hero'?a.h.hp>0:!a.dead;
const asleep=a=>a.kind==='hero'?a.h.st.sleep:a.st.sleep;
function calcDmg(src,dst,{kind,pow=1,el,pierce=0}){
  const A=bst(src),D=bst(dst);const a=kind==='phys'?A.atk:A.mag;let d=kind==='phys'?D.def*(1-pierce):(D.def*.45+(D.mag||0)*.35);
  let v=1.5*a*a/(a+d+1)*pow;if(src.kind==='hero'&&limitOn(src.h))v*=2.6;
  if(el==='water')v*=B.tide==='flood'?1.35:.8;
  if(el==='moon')v*=B.tide==='ebb'?1.35:.8;
  if(dst.kind==='foe'&&dst.def.weak&&dst.def.weak===el)v*=1.5;
  if(dst.kind==='foe'&&dst.def.final&&B.tide==='flood')v*=.45;
  if(dst.kind==='hero'){if(dst.guard)v*=.5;if(B.anchor)v*=.6}
  let crit=false;if(kind==='phys'&&Math.random()<.06){v*=1.5;crit=true}
  v*=.9+Math.random()*.2;return{v:Math.max(1,Math.round(v)),crit}}

/* ---------- one round ---------- */
async function battleRound(){
  B.round++;B.anchor=false;B.taunt=null;for(const a of B.heroes)a.guard=false;
  // choose
  const acts=[];let i=0;const hs=B.heroes;
  while(i<hs.length){const a=hs[i];if(!alive(a)||asleep(a)){i++;continue}
    B.acting=a;updateBattleUI();const c=await chooseCommand(a);B.acting=null;
    if(c==='back'){let j=i-1;while(j>=0&&(!alive(hs[j])||asleep(hs[j])))j--;if(j>=0){const pa=acts.pop();if(pa){if(pa.cp)B.cp+=pa.cp;if(pa.type==='ult')pa.who.ultQueued=0}i=j;updateBattleUI()}continue}
    if(c&&c.flee){updateBattleUI();if(await tryFlee())return'flee';acts.length=0;break}
    acts.push(c);i++}
  updateBattleUI();
  for(const f of B.foes)if(!f.dead)acts.push(foeChoose(f));
  for(const a of acts)a.ini=(a.first?1000:0)+bst(a.who).spd*(.75+Math.random()*.5);
  acts.sort((x,y)=>y.ini-x.ini);
  for(const act of acts){if(!alive(act.who)){if(act.cp)B.cp+=act.cp;if(act.type==='ult')act.who.ultQueued=0;continue}
    const r=checkEnd();if(r)return r;
    if(asleep(act.who)){const wake=Math.random()<.35;if(wake){setSleep(act.who,0);await bmsg(`${act.who.name||act.who.label} wakes up!`,500)}else{await bmsg(`${act.who.kind==='foe'?act.who.label:act.who.name} is asleep...`,500);continue}}
    await doAction(act);updateBattleUI();
    const r2=checkEnd();if(r2)return r2}
  // end of round
  for(const a of [...B.heroes,...B.foes]){if(!alive(a))continue;const st=a.kind==='hero'?a.h.st:a.st;
    if(st.poison){const mx=a.kind==='hero'?stats(a.h).hp:a.max;const d=Math.max(1,Math.round(mx*(a.kind==='foe'&&a.def.boss?.03:.07)));hurt(a,d);pop(a,d,'#c87aff');AU.play('poison');updateBattleUI();await sleep(250)}}
  for(const f of B.foes){if(f.buf.defT&&--f.buf.defT<=0)f.buf.def=0}
  for(const x of B.heroes)x.ultQueued=0;
  const r3=checkEnd();if(r3)return r3;
  if(S.lore<3){B.tideIn--;if(B.tideIn<=0){await flipTide(true)}}
  updateBattleUI();return null}
async function flipTide(nat){B.tide=B.tide==='flood'?'ebb':'flood';B.tideIn=3;AU.play('tide');B.tideFx=1;updateBattleUI();
  await bmsg(B.tide==='ebb'?(nat?'The tide turns. Ebb.':'The sea draws back! Ebb.'):(nat?'The tide turns. Flood.':'The sea comes roaring back! Flood.'),900)}
function checkEnd(){if(B.foes.every(f=>f.dead))return'win';if(B.heroes.every(a=>!alive(a)))return'lose';return null}
function setSleep(a,v){if(a.kind==='hero')a.h.st.sleep=v;else a.st.sleep=v}
function hurt(a,d){if(a.kind==='hero'){a.h.hp=Math.max(0,a.h.hp-d);if(a.h.hp<=0){a.h.st={}}}else{a.hp=Math.max(0,a.hp-d);a.ghW=22;if(a.hp<=0&&!a.dead){a.dead=true;a.dying=1}}}
function heal(a,v){if(a.kind==='hero'){const s=stats(a.h);const b=a.h.hp;a.h.hp=Math.min(s.hp,a.h.hp+v);return a.h.hp-b}else{const b=a.hp;a.hp=Math.min(a.max,a.hp+v);return a.hp-b}}

/* ---------- choosing ---------- */
async function chooseCommand(a){
  const h=a.h,H=HEROES[h.id];
  if(window.__DMAI){const r=window.__DMAI(a,B);if(r){await sleep(60);if(r.cp)B.cp-=r.cp;if(r.type==='ult')a.ultQueued=1;updateBattleUI();return r}}
  if(CP_ON())return chooseCP(a);
  while(true){
    const sks=heroSkills(h),one=sks.length===1?sks[0]:null,free=limitOn(h);
    const items=[{label:'Attack'},one?{label:SKILLS[one].name,off:!free&&SKILLS[one].mp>h.mp}:{label:H.cmd},{label:'Item',off:!Object.keys(S.inv).some(k=>S.inv[k]>0)},{label:'Defend'},{label:'Flee',off:!!B.opt.boss||!!B.opt.noFlee}];
    const c=await listWin(items,{cls:'bcmd',style:{left:'.3rem',bottom:'.3rem'},start:a.lastCmd||0,cancel:true,
      onMove:one?(i=>{if(i===1)bmsgShow(`<span class="small">${SKILLS[one].desc} <span class="mpc">${free?'MP ∞':SKILLS[one].mp+' MP'}</span></span>`);else bmsgHide()}):null});
    if(one)bmsgHide();
    if(c<0){if(a!==firstLiving())return'back';continue}
    a.lastCmd=c;
    if(c===1&&one){const s=SKILLS[one];const t=await pickTarget(s.tgt);if(t)return{who:a,type:'skill',sk:one,tgt:t,first:s.first};continue}
    if(c===0){const t=await pickTarget('foe');if(t)return{who:a,type:'attack',tgt:t};continue}
    if(c===1){const sk=heroSkills(h),free=limitOn(h);const r=await listWin(sk.map(s=>({label:SKILLS[s].name,right:free?'∞':(SKILLS[s].mp||''),off:!free&&SKILLS[s].mp>h.mp})),{title:H.cmd+` <span class="mpc" style="float:right">MP ${free?'∞':h.mp}</span>`,rows:6,style:{left:'.3rem',right:'.3rem',bottom:'.3rem'},start:a.lastSk||0,
        onMove:(i)=>{bmsgShow(`<span class="small">${SKILLS[sk[i]].desc}</span>`)}});bmsgHide();
      if(r<0)continue;a.lastSk=r;const s=SKILLS[sk[r]];const t=await pickTarget(s.tgt);if(t)return{who:a,type:'skill',sk:sk[r],tgt:t,first:s.first};continue}
    if(c===2){const ids=Object.keys(S.inv).filter(k=>S.inv[k]>0);const r=await listWin(ids.map(id=>({label:ITEMS[id].name,right:'×'+S.inv[id]})),{title:'Item',rows:6,style:{left:'.3rem',right:'.3rem',bottom:'.3rem'},onMove:i=>bmsgShow(`<span class="small">${ITEMS[ids[i]].desc}</span>`)});bmsgHide();
      if(r<0)continue;const it=ITEMS[ids[r]];const t=await pickTarget(it.tgt);if(t)return{who:a,type:'item',item:ids[r],tgt:t};continue}
    if(c===3)return{who:a,type:'defend',first:1};
    if(c===4)return{flee:1}}}
async function chooseCP(a){const h=a.h;
  while(true){
    const sk=heroSkills(h)[0],S0=SKILLS[sk],U=ultOf(a),ready=!!U&&(h.limit||0)>=100&&!a.ultQueued,cost=S0?S0.cp||2:2;
    const items=[];if(ready)items.push({label:`<span class="ultl">★ ${U.name}</span>`,k:'ult'});
    items.push({label:'Attack',k:'atk'});if(S0)items.push({label:S0.name,right:`<span class="cpc">${cost} CP</span>`,off:B.cp<cost,k:'sp'});
    items.push({label:'Item',off:!Object.keys(S.inv).some(k=>S.inv[k]>0),k:'it'},{label:'Defend',k:'def'},{label:'Flee',off:!!B.opt.boss||!!B.opt.noFlee,k:'flee'});
    let pick=null;const desc=i=>{const it=items[i];if(it.k==='ult')bmsgShow(`<span class="small">${U.desc}</span>`);else if(it.k==='sp')bmsgShow(`<span class="small">${S0.desc} <span class="cpc">${cost} CP</span></span>`);else bmsgHide()};
    const start=ready?0:Math.min(a.lastCmd||0,items.length-1);
    const lw=listWin(items,{cls:'bcmd',style:{left:'.3rem',bottom:'.3rem'},start,cancel:true,onMove:desc,bind:fn=>{pick=fn}});
    B.ultTap=ready?()=>{if(pick){AU.play('ok');pick(0)}}:null;updateBattleUI();
    const c=await lw;B.ultTap=null;bmsgHide();updateBattleUI();
    if(c<0){if(a!==firstLiving())return'back';continue}
    const it=items[c];if(it.k!=='ult')a.lastCmd=c;
    if(it.k==='ult'){const t=await pickTarget('foe');if(t){a.ultQueued=1;updateBattleUI();return{who:a,type:'ult',tgt:t}}continue}
    if(it.k==='atk'){const t=await pickTarget('foe');if(t)return{who:a,type:'attack',tgt:t};continue}
    if(it.k==='sp'){const t=await pickTarget(S0.tgt);if(t){B.cp-=cost;updateBattleUI();return{who:a,type:'skill',sk,tgt:t,cp:cost,first:S0.first}}continue}
    if(it.k==='it'){const ids=Object.keys(S.inv).filter(k=>S.inv[k]>0);const r=await listWin(ids.map(id=>({label:ITEMS[id].name,right:'×'+S.inv[id]})),{title:'Item',rows:6,style:{left:'.3rem',right:'.3rem',bottom:'.3rem'},onMove:i=>bmsgShow(`<span class="small">${ITEMS[ids[i]].desc}</span>`)});bmsgHide();
      if(r<0)continue;const itm=ITEMS[ids[r]];const t=await pickTarget(itm.tgt);if(t)return{who:a,type:'item',item:ids[r],tgt:t};continue}
    if(it.k==='def')return{who:a,type:'defend',first:1};
    if(it.k==='flee')return{flee:1}}}
function firstLiving(){return B.heroes.find(x=>alive(x)&&!asleep(x))}
function pickTarget(kind){
  if(kind==='none'||kind==='self')return Promise.resolve({none:1});
  let pool;if(kind==='foe'||kind==='foes')pool=B.foes.filter(f=>!f.dead);else if(kind==='ko')pool=B.heroes.filter(a=>!alive(a));else pool=B.heroes.filter(a=>alive(a));
  if(!pool.length){AU.play('buzz');return Promise.resolve(null)}
  const all=kind==='foes'||kind==='allies';let i=0;
  if(kind==='ally'){const low=pool.reduce((m,a)=>a.h.hp/stats(a.h).hp<m.h.hp/stats(m.h).hp?a:m,pool[0]);i=pool.indexOf(low)}
  uiCount++;B.cursor={list:all?pool:[pool[i]]};
  const show=()=>{B.cursor={list:all?pool:[pool[i]]};const t=all?'All':pool[i].kind==='foe'?pool[i].label:pool[i].name;bmsgShow(t)};show();
  return new Promise(res=>{const off=pushInput(b=>{
    if(!all&&(b==='up'||b==='left')){i=(i-1+pool.length)%pool.length;AU.play('tick');show()}
    else if(!all&&(b==='down'||b==='right')){i=(i+1)%pool.length;AU.play('tick');show()}
    else if(b==='a'){AU.play('ok');off();uiCount--;B.cursor=null;bmsgHide();res(all?{all:pool[0].kind}:{one:pool[i]})}
    else if(b==='b'){AU.play('back');off();uiCount--;B.cursor=null;bmsgHide();res(null)}})})}
function hpWord(f){const r=f.hp/f.max;return r>.75?'unhurt':r>.4?'hurt':r>.15?'badly hurt':'nearly down'}

/* ---------- foes decide ---------- */
function foeChoose(f){const d=f.def;let pool=d.acts.filter(([m])=>!(FMOVES[m].flood&&B.tide!=='flood')).filter(([m])=>!(FMOVES[m].kind==='buff'&&f.buf.def&&m!=='rally')).filter(([m])=>!(FMOVES[m].atk&&f.buf.atk));
  if(!pool.length)pool=[['atk',1]];let tot=pool.reduce((a,b)=>a+b[1],0),r=Math.random()*tot,m=pool[0][0];for(const [k,w] of pool){if((r-=w)<0){m=k;break}}
  // the boss of the deep floods the world when it can
  if(d.final&&B.tide==='flood'&&Math.random()<.4)m='drown';
  if(B.opt.finishRound&&B.round>=B.opt.finishRound)m='verdict';
  return{who:f,type:'foe',move:m,first:FMOVES[m]&&FMOVES[m].first?1:0}}
function randHero(){const l=B.heroes.filter(alive);
  // Pell draws the eye: a little more likely to be targeted
  const w=l.map(a=>B.taunt===a?3.5:a.id==='pell'?1.4:1);let t=w.reduce((x,y)=>x+y,0),r=Math.random()*t;for(let i=0;i<l.length;i++){if((r-=w[i])<0)return l[i]}return l[0]}

/* ---------- doing things ---------- */
function resolveTargets(act,fallbackKind){const t=act.tgt;if(!t||t.none)return[];
  if(t.all)return t.all==='foe'?B.foes.filter(f=>!f.dead):B.heroes.filter(alive);
  let one=t.one;if(one.kind==='foe'&&one.dead){one=B.foes.find(f=>!f.dead)}if(one&&one.kind==='hero'&&!alive(one)&&fallbackKind!=='ko'){one=B.heroes.find(alive)}return one?[one]:[]}
async function doAction(act){const a=act.who,hero=a.kind==='hero';
  await doAction0(act);if(!hero||!LIMIT_ON())return;const h=a.h;
  if(act.type==='attack'||act.type==='skill')chargeLimit(h,16);
  updateBattleUI()}
async function doAction0(act){const a=act.who;
  if(act.type==='defend'){a.guard=true;await bmsg(`${a.name} braces.`,450);return}
  if(act.type==='attack'){const [t]=resolveTargets(act);if(!t)return;await heroStep(a);await strike(a,t,{kind:'phys',pow:1},'slash');gainCP(1);updateBattleUI();heroBack(a);return}
  if(act.type==='ult'){const U=ultOf(a);a.h.limit=0;a.ultQueued=0;updateBattleUI();await ultBanner(a,U);
    // a many-hit ult lands its hits on whoever is still standing, one after another
    if(U.hits){await heroStep(a);B.ultNow=a;await bigFx(U.fx==='claw'?'slash':U.fx,B.foes.filter(f=>!f.dead));let first=resolveTargets(act)[0];
      for(let k=0;k<U.hits;k++){const live=B.foes.filter(f=>!f.dead);if(!live.length)break;const t=k===0&&first&&!first.dead?first:live[Math.random()*live.length|0];
        await strike(a,t,{kind:'phys',pow:U.pow},U.fx==='claw'?'claw':'slash',true);await sleep(40)}
      B.ultNow=null;heroBack(a);return}
    let ts=resolveTargets(act);if(U.max>1)ts=[...ts,...B.foes.filter(f=>!f.dead&&!ts.includes(f))].slice(0,U.max);if(!ts.length)return;
    await heroStep(a);B.ultNow=a;await bigFx(U.fx,ts);for(const t of ts){await strike(a,t,{kind:'phys',pow:U.pow},ts.length>1?null:'slash',true);if(U.poison&&!t.dead){t.st.poison=1;pop(t,'PSN','#c87aff',-10)}await sleep(90)}
    B.ultNow=null;heroBack(a);return}
  if(act.type==='skill'){const s=SKILLS[act.sk],cost=CP_ON()?0:s.mp;if(a.h.mp<cost){await bmsg(`Not enough MP.`,500);return}a.h.mp-=cost;updateBattleUI();
    await heroStep(a);bmsgShow(s.name);await sleep(350);
    if(act.sk==='turn'){await bigFx('tide');await flipTide(false);bmsgHide();heroBack(a);return}
    if(act.sk==='anchor'||act.sk==='steelguard'||act.sk==='ironwall'){B.anchor=true;if(s.taunt)B.taunt=a;await bigFx('guard');bmsgHide();heroBack(a);return}
    const ts=resolveTargets(act,s.tgt);
    if(s.kind==='phys'||s.kind==='mag'){if(ts.length>1)await bigFx(s.fx,ts);
      for(const t of ts){for(let k=0;k<(s.hits||1);k++){if(t.dead)break;await strike(a,t,{kind:s.kind,pow:s.pow,el:s.el,pierce:s.pierce},ts.length>1?null:s.fx,true);await sleep(80)}
        if(s.st&&t.kind==='foe'&&!t.dead&&!t.def.boss&&Math.random()<s.chance){t.st[s.st]=1;pop(t,s.st==='sleep'?'Zz':'PSN','#c87aff',-10)}
        else if(s.st==='poison'&&t.kind==='foe'&&!t.dead&&t.def.boss&&Math.random()<s.chance*.6){t.st.poison=1;pop(t,'PSN','#c87aff',-10)}}}
    else if(s.kind==='heal'){for(const t of ts){const v=s.pct?Math.round(stats(t.h).hp*s.pct):Math.round(bst(a).mag*s.pow+s.base*(1+Math.random()*.1));fxAt(t,'heal');AU.play('heal');const got=heal(t,v);if(s.cure)t.h.st={};pop(t,got,'#7dffb0')}await sleep(450)}
    else if(s.kind==='cure'){for(const t of ts){t.h.st={};fxAt(t,'heal');AU.play('heal')}await sleep(400)}
    else if(s.kind==='revive'){for(const t of ts){if(alive(t))continue;t.h.hp=Math.max(1,Math.round(stats(t.h).hp*s.pct));fxAt(t,'heal');AU.play('heal');pop(t,t.h.hp,'#7dffb0')}await sleep(450)}
    else if(s.kind==='status'){AU.play('sleep');for(const t of ts){fxAt(t,'sleep');if(!t.def.boss&&Math.random()<s.chance){t.st.sleep=1;pop(t,'Zz','#ffb0e0')}else pop(t,'MISS','#ffffff')}await sleep(500)}
    bmsgHide();heroBack(a);return}
  if(act.type==='item'){const it=ITEMS[act.item];if(!S.inv[act.item]){return}addItem(act.item,-1);await heroStep(a);bmsgShow(it.name);await sleep(300);const ts=resolveTargets(act,it.tgt);
    if(it.kind==='cp'){gainCP(it.amt);AU.play('moon');fxAt(a,'heal');pop(a,'+'+it.amt+' CP','#ffe36a');updateBattleUI();await sleep(500);bmsgHide();heroBack(a);return}
    if(it.kind==='dmg'){await bigFx('water',ts);for(const t of ts){const v=Math.round(it.amt*(B.tide==='flood'?1.3:1)*(.9+Math.random()*.2));hurt(t,v);pop(t,v);t.fl=10;AU.play('hit')}await sleep(400)}
    else for(const t of ts){if(it.kind==='revive'){if(alive(t))continue;t.h.hp=Math.max(1,Math.round(stats(t.h).hp*it.pct))}else if(it.kind==='full'){const s=stats(t.h);t.h.hp=s.hp;t.h.mp=s.mp;t.h.st={}}else if(it.kind==='cure')t.h.st={};else if(it.kind==='mp'){const s=stats(t.h);t.h.mp=Math.min(s.mp,t.h.mp+it.amt)}else{heal(t,it.amt)}
      fxAt(t,'heal');AU.play('heal');pop(t,it.kind==='mp'?it.amt:it.kind==='cure'?'+':'+','#7dffb0')}
    await sleep(350);bmsgHide();heroBack(a);return}
  if(act.type==='foe'){const f=a,m=FMOVES[act.move];f.fl=-14;if(m.kind==='phys'&&m.tgt!=='all')f.lunge=1;await sleep(260);
    if(m.name)bmsgShow(m.name);
    if(m.kind==='buff'){if(m.atk){f.buf.atk=1}else{f.buf.def=1;f.buf.defT=3}AU.play('ok');await sleep(500);bmsgHide();return}
    if(m.kind==='ldrain'){for(const t of B.heroes.filter(alive)){const d=Math.min(t.h.limit||0,30);t.h.limit=(t.h.limit||0)-d;pop(t,'LIMIT -'+Math.round(d),'#ff6a5a')}AU.play('moon');B.fx.push({kind:'lbflash',t:0,dur:20});updateBattleUI();await sleep(700);bmsgHide();return}
    if(m.kind==='mpdrain'){for(const t of B.heroes.filter(alive)){const d=Math.round(t.h.mp*.3);t.h.mp-=d;pop(t,d,'#8fd0ff')}AU.play('moon');await sleep(600);bmsgHide();return}
    const ts=m.tgt==='all'?B.heroes.filter(alive):[randHero()];
    if(m.kind==='status'){AU.play('sleep');for(const t of ts){fxAt(t,'sleep');const imm=gearImmune(t.h,m.st);if(!imm&&Math.random()<m.chance){t.h.st[m.st]=1;pop(t,m.st==='sleep'?'Zz':'PSN','#ffb0e0')}else pop(t,'MISS','#fff')}await sleep(550);bmsgHide();return}
    if(ts.length>1)await bigFx(m.el==='water'?'water':m.el==='moon'?'moon':'slam',ts);
    for(const t of ts){await strike(f,t,{kind:m.kind,pow:m.pow,el:m.el},ts.length>1?null:(m.kind==='mag'?(m.el==='moon'?'moon':'water'):'claw'),true);
      if(m.st&&alive(t)&&!gearImmune(t.h,m.st)&&Math.random()<m.chance){t.h.st[m.st]=1;pop(t,m.st==='sleep'?'Zz':'PSN','#ffb0e0',8)}
      if(m.drain){heal(f,Math.round(f.max*.06))}}
    bmsgHide();return}}
function gearImmune(h,st){return['w','a','c'].some(k=>h.eq[k]&&GEAR[h.eq[k]].immune===st)}
/* weapons in hand: every hero holds what they fight with, drawn over their battle sprite (facing left).
   k runs 0..1 through an attack: the knife and harpoon thrust, the bell rings, the bow is drawn. */
function drawWeapon(c,wt,x,y,k=0){const sw=Math.sin(Math.min(1,k)*Math.PI),P=new Map(),add=(col,a,b,w=1,h=1)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++)P.set((a+i)+','+(b+j),col)};
  const dot=(col,a,b,w=1,h=1)=>{c.fillStyle=col;c.fillRect(x+a,y+b,w,h)};let extra=null;
  if(wt==='sword'){const d=-Math.round(sw*3),l=-Math.round(sw*2);
    add('#f4f8ff',5+d,1+l,1,10);add('#a8b4c8',6+d,2+l,1,9);add('#ffffff',5+d,3+l);add('#d8b050',3+d,11+l,5,1);add('#8a6020',4+d,12+l);add('#8a6020',6+d,12+l);
    add('#5a3418',5+d,12+l,1,2);add('#3a2010',6+d,13+l);add('#e8c86a',5+d,14+l,2,1)}
  else if(wt==='knife'){const d=-Math.round(sw*3);
    add('#6b3e1c',6+d,11,2,2);add('#2a1a10',5+d,11,1,2);add('#eef3fb',1+d,11,4,1);add('#9aa6bc',2+d,12,3,1)}
  else if(wt==='harpoon'){const d=-Math.round(sw*4);
    for(let i=0;i<=11;i++)add(i%3?'#a8743f':'#8a5a2e',12-i+d,16-i);
    add('#ffffff',-2+d,2);add('#dfe6f2',-1+d,3);add('#dfe6f2',0+d,4);add('#b8c2d6',0+d,2);add('#b8c2d6',-2+d,4)}
  else if(wt==='bell'){const d=k>0?Math.round(Math.sin(k*Math.PI*5)):0,l=-Math.round(sw*2);
    add('#6b4426',5+d,8+l,1,2);add('#f4f8ff',4+d,10+l,3,1);add('#c8d0e0',3+d,11+l,5,2);add('#ffffff',4+d,11+l);add('#8890a8',2+d,13+l,7,1);add('#ffd77a',5+d,14+l)}
  else if(wt==='bow'){const p=Math.round(sw*3);
    for(const [a,b] of [[3,2],[2,3],[1,4],[1,5],[0,6],[0,7],[0,10],[0,11],[1,12],[1,13],[2,14],[3,15]])add('#b07a42',a,b);add('#5a3418',0,8,1,2);
    extra=()=>{for(let b=3;b<=14;b++){const off=p?Math.round(p*(1-Math.abs(b-8.5)/6)):0;dot('rgba(240,234,216,.9)',4+off,b)}
      if(k>0&&k<.75){dot('#e8dcc0',1,8,4+p,1);dot('#ffffff',0,8);dot('#c84a4a',5+p,7,1,3)}}}
  else return;
  c.fillStyle='#14101c';for(const key of P.keys()){const [a,b]=key.split(',').map(Number);for(const [u,v] of [[1,0],[-1,0],[0,1],[0,-1]])if(!P.has((a+u)+','+(b+v)))c.fillRect(x+a+u,y+b+v,1,1)}
  for(const [key,col] of P){const [a,b]=key.split(',').map(Number);c.fillStyle=col;c.fillRect(x+a,y+b,1,1)}
  if(extra)extra()}
async function strike(src,dst,o,fx,quiet){
  const bow=src.kind==='hero'&&HEROES[src.id].wt==='bow';if(src.kind==='hero')src.atkT=16;
  if(bow&&fx==='slash'){const [hx,hy]=heroPos(src),[tx,ty]=centerOf(dst);B.fx.push({kind:'arrow',x0:hx+1,y0:hy+15,x1:tx,y1:ty,t:0,dur:14});fx=null;await sleep(140)}
  if(fx==='slash'&&src.kind==='hero'&&!hasBig(src.id)){const [x,y]=heroPos(src);B.fx.push({kind:'swing',x,y,t:0,dur:13})}
  if(o.kind==='phys'&&Math.random()<.04&&!(dst.kind==='foe'&&asleep(dst))){if(fx)fxAt(dst,fx);AU.play('miss');pop(dst,'MISS','#ffffff');await sleep(380);return}
  if(fx)fxAt(dst,fx);if(fx)await sleep(o.el==='moon'?240:180);
  const {v,crit}=calcDmg(src,dst,o);hurt(dst,v);
  if(o.kind==='phys'){const fromHero=src.kind==='hero';
    sparks(dst,crit?12:7,fromHero?(crit?['#fff','#ffd77a','#ffb347']:['#fff','#bfe6ff','#7cc8ff']):['#fff','#ffb0a0','#ff5a4a'],fromHero?-1:1);
    if(crit&&fx==='slash')fxAt(dst,'slash2',{crit:1})}
  AU.play(crit?'crit':o.el==='water'&&!quiet?'water':'hit');if(o.el==='water'&&fx)AU.play('water');if(o.el==='moon')AU.play('moon');
  const lb=src.kind==='hero'&&B.ultNow===src;if(dst.kind==='hero')chargeLimit(dst.h,4);
  dst.fl=12;if(dst.kind==='hero')B.shake=6;if(lb)B.shake=7;pop(dst,v,dst.kind==='hero'?'#ffffff':lb?'#ffcf3a':crit?'#ffe08a':'#ffffff');
  if(asleep(dst)&&Math.random()<.5)setSleep(dst,0);
  if(dst.kind==='foe'&&dst.dead)AU.play('die');
  updateBattleUI();await sleep(crit?520:380)}
async function heroStep(a){a.step=1;a.stepT=0;if(!hasBig(a.id))a.atkT=Math.max(a.atkT||0,10);await sleep(160)}
function heroBack(a){a.step=0}
function pop(a,v,col='#fff',dy=0){const [x,y]=centerOf(a);B.nums.push({x,y:y-4+dy,v:String(v),col,t:0})}
function centerOf(a){if(a.kind==='foe')return[a.x,a.y-a.img.height/2];const [x,y]=heroPos(a);return hasBig(a.id)?[x+8,y]:[x+8,y+13]}
const eOut=x=>1-Math.pow(1-x,3),eIn=x=>x*x;
function heroPos(a){const H=sceneH(),n=B.heroes.length,big=hasBig(a.id);
  const top=n===2?H*.62:n===3?H*.5:H*.52,bot=H*.94,feet=n===1?H*.8:top+(bot-top)*a.i/(n-1);
  // big heroes stand in a loose diagonal so they don't stack like a totem pole
  const sx=big?(n===3?[2,14,-4]:n===2?[0,10]:[0])[a.i]||0:a.i*3;
  return[VW-(big?44:30)+sx-(a.step?Math.round(12*eOut(Math.min(1,(a.stepT||0)/5))):0),Math.round(feet-24)]}
// how big a hit effect should be: scaled to the sprite it lands on
function fxSize(a){if(a.kind!=='foe')return .75;return clamp(Math.max(a.img.width,a.img.height)/26,.8,2.1)}
function fxAt(a,kind,extra){const [x,y]=centerOf(a);B.fx.push(Object.assign({kind,x,y,t:0,sc:fxSize(a),dur:kind==='heal'?30:kind==='slash'||kind==='slash2'?20:kind==='claw'?20:22},extra||{}))}
function sparks(a,n,cols,dir){const [x,y]=centerOf(a);for(let i=0;i<n;i++){const ang=(dir<0?Math.PI:0)+(Math.random()-.5)*2.4;const sp=1.1+Math.random()*1.9;
  B.parts.push({x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-.7,life:9+(Math.random()*9|0),max:18,col:cols[i%cols.length],big:i<2})}}
// a lunging foe slides toward the party and back
function lungeOff(f){const l=f.lunge||0;if(!l)return 0;return Math.round(l<12?7*eOut(l/12):l<18?7:7*(1-(l-18)/10))}
async function bigFx(kind,ts){B.fx.push({kind:'big'+kind,t:0,dur:36,ts});
  if((kind==='slash'||kind==='slam')&&ts)ts.forEach((t,i)=>setTimeout(()=>{if(B)fxAt(t,kind==='slash'?'slash':'claw')},i*70));if(kind==='water')AU.play('water');if(kind==='moon')AU.play('moon');if(kind==='tide')AU.play('tide');await sleep(520)}

/* ---------- fleeing, winning, losing ---------- */
async function tryFlee(){const ps=B.heroes.filter(alive).reduce((s,a)=>s+bst(a).spd,0)/Math.max(1,B.heroes.filter(alive).length);
  const fs=B.foes.filter(f=>!f.dead).reduce((s,f)=>s+f.def.spd,0)/Math.max(1,B.foes.filter(f=>!f.dead).length);
  const ch=clamp(.55+(ps-fs)*.03,.25,.92);if(Math.random()<ch){AU.play('flee');await bmsg('You slip away!',700);return true}
  await bmsg('Couldn\'t get away!',700);
  for(const f of B.foes.filter(f=>!f.dead)){await doAction(foeChoose(f));updateBattleUI();if(checkEnd())break}
  return false}
async function battleEnd(res){
  for(const h of partyHeroes()){h.st.sleep=0;h.st.poison=0;h.lbTurns=0}
  if(res==='flee'){return'flee'}
  if(res==='lose'&&B.opt.scripted){AU.music('');await bmsg(B.opt.loseMsg||'You fall...',1500);return'scripted'}
  if(res==='lose'){AU.music('');await bmsg(S&&S.lore>=3?'Lift falls...':'The sea closes over you...',1600);return'lose'}
  // win
  await sleep(500);AU.music('victory');
  const exp=B.foes.reduce((s,f)=>s+f.def.exp,0),gold=B.foes.reduce((s,f)=>s+f.def.gold,0);
  S.gold+=gold;const drops=[];for(const f of B.foes){const d=f.def.drop;if(d&&Math.random()<d[1]){addItem(d[0],1);drops.push(itemName(d[0]))}}
  B.over=true;
  const lines=[];if(exp)lines.push(`Gained <span class="gold">${exp} EXP</span> and <span class="gold">${gold} ${CUR()}</span>.`);
  if(drops.length)lines.push(`Found ${drops.map(d=>`<span class="gold">${d}</span>`).join(', ')}.`);
  const ups=[];
  for(const a of B.heroes){if(!alive(a))continue;const h=a.h;h.exp+=exp;
    while(h.lv<40&&h.exp>=expFor(h.lv+1)){const before=stats(h),oldSk=heroSkills(h);h.lv++;const after=stats(h);h.hp+=after.hp-before.hp;h.mp+=after.mp-before.mp;
      ups.push(`${a.name} is now <span class="gold">level ${h.lv}</span>!`);for(const s of heroSkills(h))if(!oldSk.includes(s))ups.push(`${a.name} learned <span class="gold">${SKILLS[s].name}</span>!`)}}
  for(const l of lines)await say(null,l);
  if(ups.length){AU.play('level');for(const u of ups)await say(null,u)}
  if(B.opt.boss)await sleep(100);
  return'win'}
/* losing a fight: a moment to see it, then try the same fight again at full health, or go back to the title.
   Presses made while the party was falling are ignored, so a mashed A can't skip past this by accident. */
async function gameOver(){teardownBattleUI();MODE='black';AU.music('sad');
  const w=win('',`<div style="text-align:center;font-size:1.4rem;color:#bcd2ff;letter-spacing:.2em">${S&&S.lore===4?'GAME OVER':S&&S.lore===3?(F('aster')?'THE LIGHT GOES OUT':'MILLBROOK FALLS'):'THE SEA TAKES ALL'}</div>`,{left:'10%',right:'10%',top:'30%'});
  uiCount++;const off=pushInput(()=>{});await sleep(1200);off();uiCount--;
  const c=await listWin([{label:'Try again'},{label:'Back to title'}],{style:{left:'50%',transform:'translateX(-50%)',top:'50%',minWidth:'9.5rem'},start:0,cancel:false});
  w.remove();
  if(c===0){AU.play('ok');return true}
  toTitle();await new Promise(()=>{})}

/* ---------- update & draw ---------- */
function battleUpdate(){if(!B)return;for(const f of B.fx)f.t++;B.fx=B.fx.filter(f=>f.t<f.dur);for(const n of B.nums)n.t++;B.nums=B.nums.filter(n=>n.t<50);
  for(const p of B.parts){p.x+=p.vx;p.y+=p.vy;p.vy+=.14;p.vx*=.9;p.life--}B.parts=B.parts.filter(p=>p.life>0);
  for(const f of B.foes){const r=Math.max(0,f.hp/f.max);if(f.gh<r)f.gh=r;else if(f.gh>r){if(f.ghW>0)f.ghW--;else f.gh=Math.max(r,f.gh-.02)}if(f.lunge){f.lunge++;if(f.lunge>28)f.lunge=0}}
  for(const a of B.heroes){if(a.step)a.stepT=(a.stepT||0)+1;if(a.atkT>0)a.atkT--;
    if(limitOn(a.h)&&a.h.hp>0&&animT%3===0){const [x,y]=centerOf(a);B.parts.push({x:x+(Math.random()*20-10),y:y+14,vx:(Math.random()-.5)*.3,vy:-.9-Math.random()*.9,life:16+(Math.random()*10|0),max:26,col:['#ffe36a','#ffb22a','#ffffff'][animT%3],big:Math.random()<.3})}}
  for(const a of [...B.foes,...B.heroes]){if(a.fl>0)a.fl--;else if(a.fl<0)a.fl++}for(const f of B.foes)if(f.dying){f.dying++;if(f.dying>36)f.dying=0}if(B.shake>0)B.shake--;if(B.tideFx){B.tideFx++;if(B.tideFx>50)B.tideFx=0}}
function drawBattle(){if(!B)return;const H=sceneH();g.fillStyle='#000';g.fillRect(0,0,VW,VH);
  const sx=B.shake?(B.shake%2?2:-2):0;g.save();g.translate(sx,0);
  g.drawImage(backdropImg(B.bg,VW,VH),0,0);
  if(B.tide==='ebb'){g.fillStyle='rgba(255,236,170,.10)';g.fillRect(0,0,VW,VH)}else{g.fillStyle='rgba(40,110,220,.10)';g.fillRect(0,0,VW,VH)}
  if(B.tideFx){const p=B.tideFx/50;g.fillStyle='rgba(200,235,255,.35)';const y=B.tide==='ebb'?H*p:H*(1-p);g.fillRect(0,y-3,VW,6)}
  // foes
  for(const f of B.foes){if(f.dead&&!f.dying)continue;const im=f.img;let x=Math.round(f.x-im.width/2),y=Math.round(f.y-im.height);
    if(f.fl>0)x+=f.fl%4<2?2:-2;
    if(f.def.boss&&!f.dead)y+=Math.round(Math.sin(animT/30)*1.5);
    const lo=lungeOff(f);
    g.save();if(f.dying){const p=f.dying/36;g.globalAlpha=1-p;g.drawImage(im,0,0,im.width,im.height,x,y+im.height*p*.3,im.width,im.height*(1-p*.3))}
    else{const ga=GHOSTLY_FOE(f)?.88:1;
      if(lo&&f.lunge<14){g.globalAlpha=.22*ga;g.drawImage(im,x+Math.round(lo*.35),y);g.globalAlpha=.4*ga;g.drawImage(im,x+Math.round(lo*.7),y)}
      x+=lo;g.globalAlpha=ga;g.drawImage(im,x,y);
      if(f.fl<0&&(-f.fl)%4<2){g.globalCompositeOperation='lighter';g.globalAlpha=.6;g.drawImage(im,x,y)}
      if(f.fl>0&&f.fl%4<2){g.globalCompositeOperation='lighter';g.globalAlpha=.8;g.drawImage(im,x,y)}
      if(f.st.sleep){drawNum(g,'Z',x+im.width-2,y-2+Math.round(Math.sin(animT/10)*2),'#ffb0e0')}}
    g.restore()}
  if(!B.over)for(const f of B.foes)drawFoeBar(f);
  // heroes
  for(const a of B.heroes){const [x,y]=heroPos(a);const h=a.h;const look=LOOKS[HEROES[h.id].look];g.save();if(ghostHero(h.id))g.globalAlpha=.88;
    if(h.hp<=0&&hasBig(h.id)){g.translate(x+20,y+24);g.rotate(-Math.PI/2);g.globalAlpha=.8;g.drawImage(heroBig(look,'idle'),-24,-60);g.restore();continue}
    if(h.hp<=0){g.translate(x+8,y+18);g.rotate(-Math.PI/2);g.globalAlpha=.75;g.drawImage(personImg(look,'left',0),-8,-12);g.restore();continue}
    if(limitOn(h)&&h.hp>0){const [cx2,cy2]=centerOf(a),pul=.55+.2*Math.sin(animT/6),gr=g.createRadialGradient(cx2,cy2,2,cx2,cy2,30);gr.addColorStop(0,`rgba(255,210,80,${.5*pul})`);gr.addColorStop(1,'rgba(255,160,40,0)');g.save();g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(cx2-30,cy2-30,60,60);g.restore()}
    if(hasBig(h.id)){const k=a.atkT>0?1-a.atkT/16:0,pose=a.atkT>0?(k<.4?'raise':k<.85?'strike':'idle'):'idle';
      let dx=0;if(a.fl>0)dx=a.fl%4<2?2:-2;if(B.acting===a&&!a.step)dx-=Math.round(Math.abs(Math.sin(animT/10))*2);
      const im=heroBig(LOOKS[HEROES[h.id].look],pose),bx=x+8-36+dx,by=y+24-60+((animT/24|0)%2&&pose==='idle'?1:0);
      if(a.step&&a.stepT<12){const k2=1-a.stepT/12;g.globalAlpha=.16*k2;g.drawImage(im,bx+10,by);g.globalAlpha=.32*k2;g.drawImage(im,bx+5,by);g.globalAlpha=1}
      g.drawImage(im,bx,by);if(a.fl>0&&a.fl%4<2){g.globalCompositeOperation='lighter';g.globalAlpha=.6;g.drawImage(im,bx,by)}
      if(h.st.sleep)drawNum(g,'Z',x+18,y-26+Math.round(Math.sin(animT/10)*2),'#ffb0e0');
      if(a.guard||B.anchor){g.globalCompositeOperation='source-over';g.globalAlpha=.5;g.strokeStyle='#9fd6ff';g.strokeRect(x-12.5,y-26.5,42,52)}
      g.restore();continue}
    let im=personImg(look,B.over?'down':'left',a.step?((animT/8|0)%2+1):0);let dx=0;if(a.fl>0)dx=a.fl%4<2?2:-2;
    if(B.acting===a&&!a.step)dx-=Math.round(Math.abs(Math.sin(animT/10))*2);
    if(a.step&&a.stepT<12){const ga=g.globalAlpha,k=1-a.stepT/12;g.globalAlpha=ga*.18*k;g.drawImage(im,x+dx+9,y);g.globalAlpha=ga*.35*k;g.drawImage(im,x+dx+5,y);g.globalAlpha=ga}
    g.drawImage(im,x+dx,y);if(!B.over)drawWeapon(g,HEROES[h.id].wt,x+dx,y+7,a.atkT>0?1-a.atkT/16:0);if(a.fl>0&&a.fl%4<2){g.globalCompositeOperation='lighter';g.globalAlpha=.6;g.drawImage(im,x+dx,y)}
    if(h.st.sleep)drawNum(g,'Z',x+14,y-2+Math.round(Math.sin(animT/10)*2),'#ffb0e0');
    if(a.guard||B.anchor){g.globalCompositeOperation='source-over';g.globalAlpha=.5;g.strokeStyle='#9fd6ff';g.strokeRect(x-1.5,y-1.5,19,27)}
    g.restore()}
  // effects
  for(const f of B.fx)drawFx(f);
  for(const p of B.parts){const k=Math.min(1,p.life/p.max*1.8);g.globalAlpha=k*.45;g.fillStyle=p.col;g.fillRect(Math.round(p.x-p.vx),Math.round(p.y-p.vy),1,1);
    g.globalAlpha=k;g.fillRect(Math.round(p.x),Math.round(p.y),p.big?2:1,p.big?2:1)}g.globalAlpha=1;
  // cursor
  if(B.cursor&&(animT%30)<22)for(const t of B.cursor.list){let x,y;if(t.kind==='foe'){x=t.x;y=t.y-t.img.height-4}else{const p=heroPos(t);x=p[0]+8;y=p[1]-(hasBig(t.id)?28:5)}
    g.fillStyle='#100a18';g.beginPath();g.moveTo(x-4,y-5);g.lineTo(x+4,y-5);g.lineTo(x,y+1);g.fill();g.fillStyle='#ffd77a';g.beginPath();g.moveTo(x-3,y-4);g.lineTo(x+3,y-4);g.lineTo(x,y);g.fill()}
  for(const n of B.nums){const b=n.t<10?-Math.sin(n.t/10*Math.PI)*6:0;g.globalAlpha=n.t>40?(50-n.t)/10:1;drawNum(g,n.v,n.x,Math.round(n.y+b),n.col);g.globalAlpha=1}
  g.restore()}
const GHOSTLY_FOE=f=>['ghost','grief'].includes(f.def.spr[0]);
/* enemy health: a small framed bar under each foe; a pale piece shows what the last hit took, then drains */
function drawFoeBar(f){if(f.dead&&!f.dying)return;const im=f.img;const aimed=B.cursor&&B.cursor.list.includes(f);if(!aimed&&f.hp>=f.max&&f.gh>=1)return;
  const w=f.def.boss?clamp(Math.round(im.width*.7),40,72):clamp(Math.round(im.width*.8),20,34);
  const x=Math.round(f.x-w/2),y=Math.min(Math.round(f.y+3),sceneH()+12);
  const r=clamp(f.hp/f.max,0,1),gh=clamp(f.gh,r,1);const fw=r>0?Math.max(1,Math.round(w*r)):0,gw=Math.round(w*gh);
  g.save();g.globalAlpha=f.dying?Math.max(0,1-f.dying/20):1;
  g.fillStyle='rgba(5,10,28,.85)';g.fillRect(x-1,y-1,w+2,5);
  g.fillStyle='#262c50';g.fillRect(x,y,w,3);
  if(gw>fw){g.fillStyle='#fff1c4';g.fillRect(x+fw,y,gw-fw,3)}
  const c=r>.5?['#ffb09a','#ef5446','#a3262a']:r>.25?['#ffd38a','#f08a2a','#a4521a']:['#ff9ab8','#e2305c','#8e1636'];
  if(fw){g.fillStyle=c[1];g.fillRect(x,y,fw,3);g.fillStyle=c[0];g.fillRect(x,y,fw,1);g.fillStyle=c[2];g.fillRect(x,y+2,fw,1)}
  if(r<=.25&&r>0&&animT%24<12){g.globalCompositeOperation='lighter';g.globalAlpha*=.5;g.fillStyle='#ff6080';g.fillRect(x,y,fw,3)}
  g.restore()}
/* slash trails: a curved swoosh that grows from a thin tail to a sharp head, then wipes away */
function bez(P0,C,P1,s){const u=1-s;return[u*u*P0[0]+2*u*s*C[0]+s*s*P1[0],u*u*P0[1]+2*u*s*C[1]+s*s*P1[1]]}
function trail(P0,P1,bow,head,tail,wMax,col,alpha){if(head-tail<.02||alpha<=0)return;
  const dx=P1[0]-P0[0],dy=P1[1]-P0[1],L=Math.hypot(dx,dy)||1;const C=[(P0[0]+P1[0])/2-dy/L*bow,(P0[1]+P1[1])/2+dx/L*bow];
  const N=14,A=[],Z=[];
  for(let i=0;i<=N;i++){const u=i/N,s=tail+(head-tail)*u;const p=bez(P0,C,P1,s),q=bez(P0,C,P1,Math.min(1,s+.02)),q0=bez(P0,C,P1,Math.max(0,s-.02));
    const tx=q[0]-q0[0],ty=q[1]-q0[1],tl=Math.hypot(tx,ty)||1;const w=wMax*Math.sin(Math.PI*Math.pow(u,1.7))/2;
    A.push([p[0]-ty/tl*w,p[1]+tx/tl*w]);Z.push([p[0]+ty/tl*w,p[1]-tx/tl*w])}
  g.globalAlpha=alpha;g.fillStyle=col;g.beginPath();g.moveTo(A[0][0],A[0][1]);for(const p of A)g.lineTo(p[0],p[1]);for(let i=Z.length-1;i>=0;i--)g.lineTo(Z[i][0],Z[i][1]);g.closePath();g.fill();g.globalAlpha=1}
function drawFx(f){const p=f.t/f.dur;
  if(f.kind==='slash'||f.kind==='slash2'){const k=f.sc||1,rev=f.kind==='slash2';
    const head=eOut(clamp(p/.38,0,1)),tail=eIn(clamp((p-.14)/.56,0,1)),al=p<.7?1:1-(p-.7)/.3;
    const P0=[f.x+(rev?-16:16)*k,f.y-13*k],P1=[f.x+(rev?15:-15)*k,f.y+12*k],bow=(rev?-8:8)*k;
    trail(P0,P1,bow,head,tail,11*k,f.crit?'#ffb627':'#3f9dff',.5*al);
    trail(P0,P1,bow,head,tail,5.5*k,f.crit?'#fff1b8':'#cdeeff',.9*al);
    trail(P0,P1,bow,head,tail,2.4*k,'#ffffff',al);
    if(p>.2&&p<.5){const q=1-(p-.2)/.3,r=Math.round((2+q*5)*k);g.fillStyle=`rgba(255,255,255,${q})`;g.fillRect(Math.round(f.x-r),Math.round(f.y),r*2+1,1);g.fillRect(Math.round(f.x),Math.round(f.y-r),1,r*2+1)}}
  else if(f.kind==='claw'){const k=f.sc||1,al=p<.7?1:1-(p-.7)/.3;
    for(let i=-1;i<=1;i++){const d=(i+1)*.07;const head=eOut(clamp((p-d)/.36,0,1)),tail=eIn(clamp((p-d-.14)/.5,0,1));
      const o=i*4*k;const P0=[f.x-11*k+o*.7,f.y-11*k-o*.7],P1=[f.x+10*k+o*.7,f.y+9*k-o*.7];
      trail(P0,P1,-4*k,head,tail,6*k,'#ff3a2e',.55*al);trail(P0,P1,-4*k,head,tail,2.6*k,'#ffe2da',al)}}
  else if(f.kind==='lbflash'){g.fillStyle=`rgba(255,236,170,${.6*(1-p)})`;g.fillRect(0,0,VW,VH)}
  else if(f.kind==='arrow'){const q=Math.min(1,f.t/8),x=f.x0+(f.x1-f.x0)*q,y=f.y0+(f.y1-f.y0)*q,L=Math.hypot(f.x1-f.x0,f.y1-f.y0)||1,ux=(f.x1-f.x0)/L,uy=(f.y1-f.y0)/L;
    if(q<1){g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.beginPath();g.moveTo(x-ux*14,y-uy*14);g.lineTo(x,y);g.stroke();
      g.strokeStyle='#e8dcc0';g.beginPath();g.moveTo(x-ux*7,y-uy*7);g.lineTo(x,y);g.stroke();g.fillStyle='#ffffff';g.fillRect(Math.round(x)-1,Math.round(y)-1,2,2);g.fillStyle='#c84a4a';g.fillRect(Math.round(x-ux*7),Math.round(y-uy*7)-1,1,3)}
    else{const r=Math.round(2+(f.t-8)*1.2),al=1-(f.t-8)/6;g.fillStyle=`rgba(255,255,255,${al})`;g.fillRect(Math.round(f.x1)-r,Math.round(f.y1),r*2+1,1);g.fillRect(Math.round(f.x1),Math.round(f.y1)-r,1,r*2+1)}}
  else if(f.kind==='swing'){const head=eOut(clamp(p/.45,0,1)),tail=eIn(clamp((p-.12)/.6,0,1)),al=p<.6?1:1-(p-.6)/.4;
    const P0=[f.x+5,f.y+3],P1=[f.x-1,f.y+23];trail(P0,P1,-8,head,tail,6,'#5fb6ff',.4*al);trail(P0,P1,-8,head,tail,2.4,'#ffffff',.9*al)}
  else if(f.kind==='water'){for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=p*14;g.fillStyle=i%2?'#7fc0f0':'#e8f6ff';g.fillRect(f.x+Math.cos(a)*r|0,f.y+Math.sin(a)*r-p*4|0,2,2)}}
  else if(f.kind==='moon'){g.fillStyle='rgba(255,255,255,'+(1-p)+')';for(let i=0;i<6;i++){const a=i/6*Math.PI*2+p*2;g.fillRect(f.x+Math.cos(a)*10*p|0,f.y+Math.sin(a)*10*p|0,2,2)}g.fillRect(f.x-1,f.y-14+p*10|0,2,12)}
  else if(f.kind==='heal'){for(let i=0;i<8;i++){g.fillStyle=i%2?'#a8ffcc':'#ffffff';g.fillRect(f.x-8+i*2,f.y+8-((p*30+i*7)%20)|0,1,2)}}
  else if(f.kind==='sleep'){g.fillStyle='#ffb0e0';for(let i=0;i<3;i++)g.fillRect(f.x+i*4-4,f.y-p*12-i*3|0,2,2)}
  else if(f.kind==='bigwater'){const H=sceneH();const x=VW*(1-p*1.4);g.fillStyle='rgba(80,160,240,.55)';g.beginPath();g.moveTo(x,H);for(let y=H;y>=H*.2;y-=4)g.lineTo(x+Math.sin(y/9+f.t/3)*6-(H-y)*.2,y);g.lineTo(x+60,H*.2);g.lineTo(x+60,H);g.fill();g.fillStyle='#e8f6ff';for(let y=H*.2;y<H;y+=6)g.fillRect(x+Math.sin(y/9+f.t/3)*6-(H-y)*.2|0,y|0,2,2)}
  else if(f.kind==='bigmoon'){g.fillStyle=`rgba(230,245,255,${.5*(1-Math.abs(p-.5)*2)})`;g.fillRect(0,0,VW,sceneH());for(const t of f.ts||[]){const [x,y]=centerOf(t);g.fillStyle='#fff';g.fillRect(x-1,0,3,y*Math.min(1,p*2))}}
  else if(f.kind==='bigheal'){}
  else if(f.kind==='bigtide'){const H=sceneH();g.fillStyle=`rgba(160,210,255,${.4*(1-p)})`;g.fillRect(0,0,VW,H);g.strokeStyle='#e8f6ff';g.beginPath();for(let x=0;x<VW;x+=2)g.lineTo(x,H*(1-p)+Math.sin(x/8+f.t/2)*4);g.stroke()}
  else if(f.kind==='bigguard'){for(const a of B.heroes){const [x,y]=heroPos(a);g.strokeStyle=`rgba(159,214,255,${1-p})`;g.strokeRect(x-2-p*4,y-2-p*4,20+p*8,28+p*8)}}
  else if(f.kind==='bigslam'||f.kind==='bigslash'){g.fillStyle=`rgba(255,255,255,${.35*(1-p)})`;g.fillRect(0,0,VW,sceneH())}
  else if(f.kind==='bigsleep'){}}
