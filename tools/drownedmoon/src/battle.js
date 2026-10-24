/* ===================== BATTLE ===================== */
let B=null;
const sceneH=()=>Math.round(VH*.74);
function foeLayout(n,boss){const W=VW,H=sceneH();
  if(boss)return[[W*.36,H*.86]];
  const L={1:[[.36,.78]],2:[[.24,.62],[.48,.86]],3:[[.2,.56],[.46,.66],[.26,.92]],4:[[.18,.55],[.42,.55],[.24,.9],[.48,.9]]}[n]||[];
  return L.map(([x,y])=>[W*x,H*y])}
async function startBattle(ids,opt={}){
  const prevMode=MODE;
  // swirl in
  AU.play('swirl');AU.music(opt.music||(opt.boss?(opt.final?'final':'boss'):'battle'));
  await swirl();
  const foes=ids.map((id,i)=>{const f=FOES[id];return{kind:'foe',id,name:f.name,def:f,hp:f.hp,max:f.hp,st:{},buf:{},fl:0,dead:false,alpha:1,img:monImg(f.spr[0],f.spr[1])}});
  const counts={};foes.forEach(f=>{counts[f.name]=(counts[f.name]||0)+1});
  const used={};foes.forEach(f=>{if(counts[f.name]>1){used[f.name]=(used[f.name]||0)+1;f.label=f.name+' '+'ABCD'[used[f.name]-1]}else f.label=f.name});
  const lay=foeLayout(foes.length,opt.boss);foes.forEach((f,i)=>{f.x=lay[i][0];f.y=lay[i][1]});
  const heroes=partyHeroes().map((h,i)=>({kind:'hero',h,id:h.id,name:HEROES[h.id].name,buf:{},fl:0,i}));
  B={foes,heroes,tide:S.tide,tideIn:3,round:0,fx:[],nums:[],bg:opt.bg||'cave',opt,cursor:null,acting:null,msg:null,over:null,shake:0};
  for(const h of partyHeroes())h.st={...h.st,sleep:0};
  MODE='battle';await fadeQuick();
  buildBattleUI();
  if(opt.intro)await opt.intro();
  await bmsg(opt.boss?`${foes[0].name} blocks the way!`:foes.length===1?`${foes[0].name} appears!`:`${foes[0].name} and ${foes.length-1} more appear!`,900);
  let result=null;
  while(!result){result=await battleRound()}
  const out=await battleEnd(result);
  teardownBattleUI();
  if(out==='lose'){await gameOver();return'lose'}
  MODE='field';AU.music(musicFor(FD.map));await fadeQuick(true);
  return out}
async function fadeQuick(rev){fadeEl.style.transitionDuration='0ms';fadeEl.classList.remove('white');fadeEl.style.opacity=1;await frames(2);fadeEl.style.transitionDuration='250ms';fadeEl.style.opacity=0;await sleep(260)}
async function swirl(){FD.fx.push(swirlFx);swirlFx.t=0;await frames(42);FD.fx=FD.fx.filter(f=>f!==swirlFx)}
function swirlFx(g){swirlFx.t++;const t=swirlFx.t,cs=10,cx=VW/2,cy=VH/2;
  for(let y=0;y<VH;y+=cs)for(let x=0;x<VW;x+=cs){const a=Math.atan2(y-cy,x-cx),d=Math.hypot(x-cx,y-cy)/Math.hypot(cx,cy);const k=((a/Math.PI+1)/2+d*.6)%1;
    if(k*30<t-8||t>36){g.fillStyle='#000';g.fillRect(x,y,cs,cs)}else if(k*30<t){g.fillStyle=t%4<2?'#fff':'#9fd6ff';g.fillRect(x,y,cs,cs)}}}

/* ---------- battle UI ---------- */
let BUI={};
function buildBattleUI(){BUI.names=win('bnames','');BUI.party=win('bparty','');BUI.tide=win('tidebadge','');updateBattleUI()}
function teardownBattleUI(){for(const k in BUI){if(BUI[k]&&BUI[k].remove)BUI[k].remove()}BUI={}}
function updateBattleUI(){if(!B||!BUI.names)return;
  const live=B.foes.filter(f=>!f.dead);const grp={};live.forEach(f=>grp[f.name]=(grp[f.name]||0)+1);
  BUI.names.innerHTML=Object.entries(grp).map(([n,c])=>`<div>${n}${c>1?' ×'+c:''}</div>`).join('');
  BUI.party.innerHTML=B.heroes.map(a=>{const h=a.h,s=stats(h);const st=h.hp<=0?'KO':h.st.sleep?'Zz':h.st.poison?'PSN':'';
    return`<div class="prow${B.acting===a?' act':''}${h.hp<=0?' ko':''}"><div class="nm">${a.name}<span class="st">${st}</span></div><div class="nums"><span class="${h.hp<s.hp/4?'bad':'hpc'}">${h.hp}</span><span class="small">/${s.hp}</span> <span class="mpc">${h.mp}</span></div></div>`}).join('');
  BUI.tide.className='win tidebadge '+B.tide;BUI.tide.innerHTML=(B.tide==='flood'?'≈ FLOOD':'◐ EBB')+` <span class="small">${B.tideIn}</span>`}
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
  let v=1.5*a*a/(a+d+1)*pow;
  if(el==='water')v*=B.tide==='flood'?1.35:.8;
  if(el==='moon')v*=B.tide==='ebb'?1.35:.8;
  if(dst.kind==='foe'&&dst.def.weak&&dst.def.weak===el)v*=1.5;
  if(dst.kind==='foe'&&dst.def.final&&B.tide==='flood')v*=.45;
  if(dst.kind==='hero'){if(dst.guard)v*=.5;if(B.anchor)v*=.6}
  let crit=false;if(kind==='phys'&&Math.random()<.06){v*=1.5;crit=true}
  v*=.9+Math.random()*.2;return{v:Math.max(1,Math.round(v)),crit}}

/* ---------- one round ---------- */
async function battleRound(){
  B.round++;B.anchor=false;for(const a of B.heroes)a.guard=false;
  // choose
  const acts=[];let i=0;const hs=B.heroes;
  while(i<hs.length){const a=hs[i];if(!alive(a)||asleep(a)){i++;continue}
    B.acting=a;updateBattleUI();const c=await chooseCommand(a);B.acting=null;
    if(c==='back'){let j=i-1;while(j>=0&&(!alive(hs[j])||asleep(hs[j])))j--;if(j>=0){acts.pop();i=j}continue}
    if(c&&c.flee){updateBattleUI();if(await tryFlee())return'flee';acts.length=0;break}
    acts.push(c);i++}
  updateBattleUI();
  for(const f of B.foes)if(!f.dead)acts.push(foeChoose(f));
  for(const a of acts)a.ini=(a.first?1000:0)+bst(a.who).spd*(.75+Math.random()*.5);
  acts.sort((x,y)=>y.ini-x.ini);
  for(const act of acts){if(!alive(act.who))continue;
    const r=checkEnd();if(r)return r;
    if(asleep(act.who)){const wake=Math.random()<.35;if(wake){setSleep(act.who,0);await bmsg(`${act.who.name||act.who.label} wakes up!`,500)}else{await bmsg(`${act.who.kind==='foe'?act.who.label:act.who.name} is asleep...`,500);continue}}
    await doAction(act);updateBattleUI();
    const r2=checkEnd();if(r2)return r2}
  // end of round
  for(const a of [...B.heroes,...B.foes]){if(!alive(a))continue;const st=a.kind==='hero'?a.h.st:a.st;
    if(st.poison){const mx=a.kind==='hero'?stats(a.h).hp:a.max;const d=Math.max(1,Math.round(mx*.07));hurt(a,d);pop(a,d,'#c87aff');AU.play('poison');await sleep(250)}}
  for(const f of B.foes){if(f.buf.defT&&--f.buf.defT<=0)f.buf.def=0}
  const r3=checkEnd();if(r3)return r3;
  B.tideIn--;if(B.tideIn<=0){await flipTide(true)}
  updateBattleUI();return null}
async function flipTide(nat){B.tide=B.tide==='flood'?'ebb':'flood';B.tideIn=3;AU.play('tide');B.tideFx=1;updateBattleUI();
  await bmsg(B.tide==='ebb'?(nat?'The tide turns. Ebb.':'The sea draws back! Ebb.'):(nat?'The tide turns. Flood.':'The sea comes roaring back! Flood.'),900)}
function checkEnd(){if(B.foes.every(f=>f.dead))return'win';if(B.heroes.every(a=>!alive(a)))return'lose';return null}
function setSleep(a,v){if(a.kind==='hero')a.h.st.sleep=v;else a.st.sleep=v}
function hurt(a,d){if(a.kind==='hero'){a.h.hp=Math.max(0,a.h.hp-d);if(a.h.hp<=0){a.h.st={}}}else{a.hp=Math.max(0,a.hp-d);if(a.hp<=0&&!a.dead){a.dead=true;a.dying=1}}}
function heal(a,v){if(a.kind==='hero'){const s=stats(a.h);const b=a.h.hp;a.h.hp=Math.min(s.hp,a.h.hp+v);return a.h.hp-b}else{const b=a.hp;a.hp=Math.min(a.max,a.hp+v);return a.hp-b}}

/* ---------- choosing ---------- */
async function chooseCommand(a){
  const h=a.h,H=HEROES[h.id];
  if(window.__DMAI){const r=window.__DMAI(a,B);if(r){await sleep(60);return r}}
  while(true){
    const items=[{label:'Attack'},{label:H.cmd},{label:'Item',off:!Object.keys(S.inv).some(k=>S.inv[k]>0)},{label:'Defend'},{label:'Flee',off:!!B.opt.boss||!!B.opt.noFlee}];
    const c=await listWin(items,{cls:'bcmd',style:{left:'.3rem',bottom:'.3rem'},start:a.lastCmd||0,cancel:true});
    if(c<0){if(a!==firstLiving())return'back';continue}
    a.lastCmd=c;
    if(c===0){const t=await pickTarget('foe');if(t)return{who:a,type:'attack',tgt:t};continue}
    if(c===1){const sk=heroSkills(h);const r=await listWin(sk.map(s=>({label:SKILLS[s].name,right:SKILLS[s].mp,off:SKILLS[s].mp>h.mp})),{title:H.cmd+` <span class="mpc" style="float:right">MP ${h.mp}</span>`,rows:6,style:{left:'.3rem',right:'.3rem',bottom:'.3rem'},start:a.lastSk||0,
        onMove:(i)=>{bmsgShow(`<span class="small">${SKILLS[sk[i]].desc}</span>`)}});bmsgHide();
      if(r<0)continue;a.lastSk=r;const s=SKILLS[sk[r]];const t=await pickTarget(s.tgt);if(t)return{who:a,type:'skill',sk:sk[r],tgt:t,first:s.first};continue}
    if(c===2){const ids=Object.keys(S.inv).filter(k=>S.inv[k]>0);const r=await listWin(ids.map(id=>({label:ITEMS[id].name,right:'×'+S.inv[id]})),{title:'Item',rows:6,style:{left:'.3rem',right:'.3rem',bottom:'.3rem'},onMove:i=>bmsgShow(`<span class="small">${ITEMS[ids[i]].desc}</span>`)});bmsgHide();
      if(r<0)continue;const it=ITEMS[ids[r]];const t=await pickTarget(it.tgt);if(t)return{who:a,type:'item',item:ids[r],tgt:t};continue}
    if(c===3)return{who:a,type:'defend',first:1};
    if(c===4)return{flee:1}}}
function firstLiving(){return B.heroes.find(x=>alive(x)&&!asleep(x))}
function pickTarget(kind){
  if(kind==='none'||kind==='self')return Promise.resolve({none:1});
  let pool;if(kind==='foe'||kind==='foes')pool=B.foes.filter(f=>!f.dead);else if(kind==='ko')pool=B.heroes.filter(a=>!alive(a));else pool=B.heroes.filter(a=>alive(a));
  if(!pool.length){AU.play('buzz');return Promise.resolve(null)}
  const all=kind==='foes'||kind==='allies';let i=0;
  if(kind==='ally'){const low=pool.reduce((m,a)=>a.h.hp/stats(a.h).hp<m.h.hp/stats(m.h).hp?a:m,pool[0]);i=pool.indexOf(low)}
  uiCount++;B.cursor={list:all?pool:[pool[i]]};
  const show=()=>{B.cursor={list:all?pool:[pool[i]]};const t=all?'All':pool[i].kind==='foe'?pool[i].label:pool[i].name;bmsgShow(t+(pool[i].kind==='foe'&&!all?` <span class="small">${hpWord(pool[i])}</span>`:''))};show();
  return new Promise(res=>{const off=pushInput(b=>{
    if(!all&&(b==='up'||b==='left')){i=(i-1+pool.length)%pool.length;AU.play('tick');show()}
    else if(!all&&(b==='down'||b==='right')){i=(i+1)%pool.length;AU.play('tick');show()}
    else if(b==='a'){AU.play('ok');off();uiCount--;B.cursor=null;bmsgHide();res(all?{all:pool[0].kind}:{one:pool[i]})}
    else if(b==='b'){AU.play('back');off();uiCount--;B.cursor=null;bmsgHide();res(null)}})})}
function hpWord(f){const r=f.hp/f.max;return r>.75?'unhurt':r>.4?'hurt':r>.15?'badly hurt':'nearly down'}

/* ---------- foes decide ---------- */
function foeChoose(f){const d=f.def;let pool=d.acts.filter(([m])=>!(FMOVES[m].flood&&B.tide!=='flood')).filter(([m])=>!(FMOVES[m].kind==='buff'&&f.buf.def&&m!=='rally')).filter(([m])=>!(m==='rally'&&f.buf.atk));
  if(!pool.length)pool=[['atk',1]];let tot=pool.reduce((a,b)=>a+b[1],0),r=Math.random()*tot,m=pool[0][0];for(const [k,w] of pool){if((r-=w)<0){m=k;break}}
  // the boss of the deep floods the world when it can
  if(d.final&&B.tide==='flood'&&Math.random()<.4)m='drown';
  return{who:f,type:'foe',move:m}}
function randHero(){const l=B.heroes.filter(alive);
  // Pell draws the eye: a little more likely to be targeted
  const w=l.map(a=>a.id==='pell'?1.4:1);let t=w.reduce((x,y)=>x+y,0),r=Math.random()*t;for(let i=0;i<l.length;i++){if((r-=w[i])<0)return l[i]}return l[0]}

/* ---------- doing things ---------- */
function resolveTargets(act,fallbackKind){const t=act.tgt;if(!t||t.none)return[];
  if(t.all)return t.all==='foe'?B.foes.filter(f=>!f.dead):B.heroes.filter(alive);
  let one=t.one;if(one.kind==='foe'&&one.dead){one=B.foes.find(f=>!f.dead)}if(one&&one.kind==='hero'&&!alive(one)&&fallbackKind!=='ko'){one=B.heroes.find(alive)}return one?[one]:[]}
async function doAction(act){const a=act.who;
  if(act.type==='defend'){a.guard=true;await bmsg(`${a.name} braces.`,450);return}
  if(act.type==='attack'){const [t]=resolveTargets(act);if(!t)return;await heroStep(a);await strike(a,t,{kind:'phys',pow:1},'slash');heroBack(a);return}
  if(act.type==='skill'){const s=SKILLS[act.sk];if(a.h.mp<s.mp){await bmsg(`Not enough MP.`,500);return}a.h.mp-=s.mp;updateBattleUI();
    await heroStep(a);bmsgShow(s.name);await sleep(350);
    if(act.sk==='turn'){await bigFx('tide');await flipTide(false);bmsgHide();heroBack(a);return}
    if(act.sk==='anchor'){B.anchor=true;await bigFx('guard');bmsgHide();heroBack(a);return}
    const ts=resolveTargets(act,s.tgt);
    if(s.kind==='phys'||s.kind==='mag'){if(ts.length>1)await bigFx(s.fx,ts);for(const t of ts){await strike(a,t,{kind:s.kind,pow:s.pow,el:s.el,pierce:s.pierce},ts.length>1?null:s.fx,true);await sleep(80)}}
    else if(s.kind==='heal'){for(const t of ts){const v=s.pct?Math.round(stats(t.h).hp*s.pct):Math.round(bst(a).mag*s.pow+s.base*(1+Math.random()*.1));fxAt(t,'heal');AU.play('heal');const got=heal(t,v);pop(t,got,'#7dffb0')}await sleep(450)}
    else if(s.kind==='cure'){for(const t of ts){t.h.st={};fxAt(t,'heal');AU.play('heal')}await sleep(400)}
    else if(s.kind==='revive'){for(const t of ts){if(alive(t))continue;t.h.hp=Math.max(1,Math.round(stats(t.h).hp*s.pct));fxAt(t,'heal');AU.play('heal');pop(t,t.h.hp,'#7dffb0')}await sleep(450)}
    else if(s.kind==='status'){AU.play('sleep');for(const t of ts){fxAt(t,'sleep');if(!t.def.boss&&Math.random()<s.chance){t.st.sleep=1;pop(t,'Zz','#ffb0e0')}else pop(t,'MISS','#ffffff')}await sleep(500)}
    bmsgHide();heroBack(a);return}
  if(act.type==='item'){const it=ITEMS[act.item];if(!S.inv[act.item]){return}addItem(act.item,-1);await heroStep(a);bmsgShow(it.name);await sleep(300);const ts=resolveTargets(act,it.tgt);
    if(it.kind==='dmg'){await bigFx('water',ts);for(const t of ts){const v=Math.round(it.amt*(B.tide==='flood'?1.3:1)*(.9+Math.random()*.2));hurt(t,v);pop(t,v);t.fl=10;AU.play('hit')}await sleep(400)}
    else for(const t of ts){if(it.kind==='revive'){if(alive(t))continue;t.h.hp=Math.max(1,Math.round(stats(t.h).hp*it.pct))}else if(it.kind==='full'){const s=stats(t.h);t.h.hp=s.hp;t.h.mp=s.mp;t.h.st={}}else if(it.kind==='cure')t.h.st={};else if(it.kind==='mp'){const s=stats(t.h);t.h.mp=Math.min(s.mp,t.h.mp+it.amt)}else{heal(t,it.amt)}
      fxAt(t,'heal');AU.play('heal');pop(t,it.kind==='mp'?it.amt:it.kind==='cure'?'+':'+','#7dffb0')}
    await sleep(350);bmsgHide();heroBack(a);return}
  if(act.type==='foe'){const f=a,m=FMOVES[act.move];f.fl=-14;await sleep(260);
    if(m.name)bmsgShow(m.name);
    if(m.kind==='buff'){if(m.atk){f.buf.atk=1}else{f.buf.def=1;f.buf.defT=3}AU.play('ok');await sleep(500);bmsgHide();return}
    if(m.kind==='mpdrain'){for(const t of B.heroes.filter(alive)){const d=Math.round(t.h.mp*.3);t.h.mp-=d;pop(t,d,'#8fd0ff')}AU.play('moon');await sleep(600);bmsgHide();return}
    const ts=m.tgt==='all'?B.heroes.filter(alive):[randHero()];
    if(m.kind==='status'){AU.play('sleep');for(const t of ts){fxAt(t,'sleep');const imm=gearImmune(t.h,m.st);if(!imm&&Math.random()<m.chance){t.h.st[m.st]=1;pop(t,m.st==='sleep'?'Zz':'PSN','#ffb0e0')}else pop(t,'MISS','#fff')}await sleep(550);bmsgHide();return}
    if(ts.length>1)await bigFx(m.el==='water'?'water':m.el==='moon'?'moon':'slam',ts);
    for(const t of ts){await strike(f,t,{kind:m.kind,pow:m.pow,el:m.el},ts.length>1?null:(m.kind==='mag'?(m.el==='moon'?'moon':'water'):'claw'),true);
      if(m.st&&alive(t)&&!gearImmune(t.h,m.st)&&Math.random()<m.chance){t.h.st[m.st]=1;pop(t,m.st==='sleep'?'Zz':'PSN','#ffb0e0',8)}
      if(m.drain){heal(f,Math.round(f.max*.06))}}
    bmsgHide();return}}
function gearImmune(h,st){return['w','a','c'].some(k=>h.eq[k]&&GEAR[h.eq[k]].immune===st)}
async function strike(src,dst,o,fx,quiet){
  if(o.kind==='phys'&&Math.random()<.04&&!(dst.kind==='foe'&&asleep(dst))){if(fx)fxAt(dst,fx);AU.play('miss');pop(dst,'MISS','#ffffff');await sleep(380);return}
  if(fx)fxAt(dst,fx);if(fx)await sleep(o.el==='moon'?240:180);
  const {v,crit}=calcDmg(src,dst,o);hurt(dst,v);
  AU.play(crit?'crit':o.el==='water'&&!quiet?'water':'hit');if(o.el==='water'&&fx)AU.play('water');if(o.el==='moon')AU.play('moon');
  dst.fl=12;if(dst.kind==='hero')B.shake=6;pop(dst,v,dst.kind==='hero'?'#ffffff':crit?'#ffe08a':'#ffffff');
  if(asleep(dst)&&Math.random()<.5)setSleep(dst,0);
  if(dst.kind==='foe'&&dst.dead)AU.play('die');
  updateBattleUI();await sleep(crit?520:380)}
async function heroStep(a){a.step=1;await sleep(160)}
function heroBack(a){a.step=0}
function pop(a,v,col='#fff',dy=0){const [x,y]=centerOf(a);B.nums.push({x,y:y-4+dy,v:String(v),col,t:0})}
function centerOf(a){if(a.kind==='foe')return[a.x,a.y-a.img.height/2];const [x,y]=heroPos(a);return[x+8,y+8]}
function heroPos(a){const H=sceneH(),n=B.heroes.length;const y0=H*.34,gap=Math.min(28,(H*.55)/Math.max(1,n));return[VW-30+a.i*3-(a.step?12:0),Math.round(y0+a.i*gap)]}
function fxAt(a,kind){const [x,y]=centerOf(a);B.fx.push({kind,x,y,t:0,dur:kind==='heal'?30:22})}
async function bigFx(kind,ts){B.fx.push({kind:'big'+kind,t:0,dur:36,ts});if(kind==='water')AU.play('water');if(kind==='moon')AU.play('moon');if(kind==='tide')AU.play('tide');await sleep(520)}

/* ---------- fleeing, winning, losing ---------- */
async function tryFlee(){const ps=B.heroes.filter(alive).reduce((s,a)=>s+bst(a).spd,0)/Math.max(1,B.heroes.filter(alive).length);
  const fs=B.foes.filter(f=>!f.dead).reduce((s,f)=>s+f.def.spd,0)/Math.max(1,B.foes.filter(f=>!f.dead).length);
  const ch=clamp(.55+(ps-fs)*.03,.25,.92);if(Math.random()<ch){AU.play('flee');await bmsg('You slip away!',700);return true}
  await bmsg('Couldn\'t get away!',700);
  for(const f of B.foes.filter(f=>!f.dead)){await doAction(foeChoose(f));updateBattleUI();if(checkEnd())break}
  return false}
async function battleEnd(res){
  for(const h of partyHeroes()){h.st.sleep=0;h.st.poison=0}
  if(res==='flee'){return'flee'}
  if(res==='lose'){AU.music('');await bmsg('The sea closes over you...',1600);return'lose'}
  // win
  await sleep(500);AU.music('victory');
  const exp=B.foes.reduce((s,f)=>s+f.def.exp,0),gold=B.foes.reduce((s,f)=>s+f.def.gold,0);
  S.gold+=gold;const drops=[];for(const f of B.foes){const d=f.def.drop;if(d&&Math.random()<d[1]){addItem(d[0],1);drops.push(itemName(d[0]))}}
  B.over=true;
  const lines=[];if(exp)lines.push(`Gained <span class="gold">${exp} EXP</span> and <span class="gold">${gold} pearls</span>.`);
  if(drops.length)lines.push(`Found ${drops.map(d=>`<span class="gold">${d}</span>`).join(', ')}.`);
  const ups=[];
  for(const a of B.heroes){if(!alive(a))continue;const h=a.h;h.exp+=exp;
    while(h.lv<40&&h.exp>=expFor(h.lv+1)){const before=stats(h),oldSk=heroSkills(h);h.lv++;const after=stats(h);h.hp+=after.hp-before.hp;h.mp+=after.mp-before.mp;
      ups.push(`${a.name} is now <span class="gold">level ${h.lv}</span>!`);for(const s of heroSkills(h))if(!oldSk.includes(s))ups.push(`${a.name} learned <span class="gold">${SKILLS[s].name}</span>!`)}}
  for(const l of lines)await say(null,l);
  if(ups.length){AU.play('level');for(const u of ups)await say(null,u)}
  if(B.opt.boss)await sleep(100);
  return'win'}
async function gameOver(){teardownBattleUI();MODE='black';AU.music('sad');
  const w=win('',`<div style="text-align:center;font-size:1.4rem;color:#bcd2ff;letter-spacing:.2em">THE SEA TAKES ALL</div><div class="small" style="text-align:center;margin-top:.6rem">Press A</div>`,{left:'10%',right:'10%',top:'38%'});
  uiCount++;await new Promise(r=>{const off=pushInput(b=>{if(b==='a'||b==='start'){off();r()}})});uiCount--;w.remove();
  toTitle();await new Promise(()=>{})}

/* ---------- update & draw ---------- */
function battleUpdate(){if(!B)return;for(const f of B.fx)f.t++;B.fx=B.fx.filter(f=>f.t<f.dur);for(const n of B.nums)n.t++;B.nums=B.nums.filter(n=>n.t<50);
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
    g.save();if(f.dying){const p=f.dying/36;g.globalAlpha=1-p;g.drawImage(im,0,0,im.width,im.height,x,y+im.height*p*.3,im.width,im.height*(1-p*.3))}
    else{if(GHOSTLY_FOE(f))g.globalAlpha=.88;g.drawImage(im,x,y);
      if(f.fl<0&&(-f.fl)%4<2){g.globalCompositeOperation='lighter';g.globalAlpha=.6;g.drawImage(im,x,y)}
      if(f.fl>0&&f.fl%4<2){g.globalCompositeOperation='lighter';g.globalAlpha=.8;g.drawImage(im,x,y)}
      if(f.st.sleep){drawNum(g,'Z',x+im.width-2,y-2+Math.round(Math.sin(animT/10)*2),'#ffb0e0')}}
    g.restore()}
  // heroes
  for(const a of B.heroes){const [x,y]=heroPos(a);const h=a.h;const look=LOOKS[HEROES[h.id].look];g.save();if(GHOSTLY.has(h.id))g.globalAlpha=.88;
    if(h.hp<=0){g.translate(x+8,y+12);g.rotate(-Math.PI/2);g.globalAlpha=.75;g.drawImage(personImg(look,'left',0),-8,-8);g.restore();continue}
    let im=personImg(look,B.over?'down':'left',a.step?((animT/8|0)%2+1):0);let dx=0;if(a.fl>0)dx=a.fl%4<2?2:-2;
    if(B.acting===a&&!a.step)dx-=Math.round(Math.abs(Math.sin(animT/10))*2);
    g.drawImage(im,x+dx,y);if(a.fl>0&&a.fl%4<2){g.globalCompositeOperation='lighter';g.globalAlpha=.6;g.drawImage(im,x+dx,y)}
    if(h.st.sleep)drawNum(g,'Z',x+14,y-2+Math.round(Math.sin(animT/10)*2),'#ffb0e0');
    if(a.guard||B.anchor){g.globalCompositeOperation='source-over';g.globalAlpha=.5;g.strokeStyle='#9fd6ff';g.strokeRect(x-1.5,y-1.5,19,19)}
    g.restore()}
  // effects
  for(const f of B.fx)drawFx(f);
  // cursor
  if(B.cursor&&(animT%30)<22)for(const t of B.cursor.list){let x,y;if(t.kind==='foe'){x=t.x;y=t.y-t.img.height-4}else{const p=heroPos(t);x=p[0]+8;y=p[1]-5}
    g.fillStyle='#100a18';g.beginPath();g.moveTo(x-4,y-5);g.lineTo(x+4,y-5);g.lineTo(x,y+1);g.fill();g.fillStyle='#ffd77a';g.beginPath();g.moveTo(x-3,y-4);g.lineTo(x+3,y-4);g.lineTo(x,y);g.fill()}
  for(const n of B.nums){const b=n.t<10?-Math.sin(n.t/10*Math.PI)*6:0;g.globalAlpha=n.t>40?(50-n.t)/10:1;drawNum(g,n.v,n.x,Math.round(n.y+b),n.col);g.globalAlpha=1}
  g.restore()}
const GHOSTLY_FOE=f=>['ghost','grief'].includes(f.def.spr[0]);
function drawFx(f){const p=f.t/f.dur;
  if(f.kind==='slash'||f.kind==='claw'){g.strokeStyle=f.kind==='claw'?'#ffb0a0':'#ffffff';g.lineWidth=1;const n=f.kind==='claw'?3:1;for(let i=0;i<n;i++){const o=(i-1)*4;const l=Math.min(1,p*2.5)*16;g.beginPath();g.moveTo(f.x-8+o,f.y-8);g.lineTo(f.x-8+o+l,f.y-8+l);g.stroke()}}
  else if(f.kind==='water'){for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=p*14;g.fillStyle=i%2?'#7fc0f0':'#e8f6ff';g.fillRect(f.x+Math.cos(a)*r|0,f.y+Math.sin(a)*r-p*4|0,2,2)}}
  else if(f.kind==='moon'){g.fillStyle='rgba(255,255,255,'+(1-p)+')';for(let i=0;i<6;i++){const a=i/6*Math.PI*2+p*2;g.fillRect(f.x+Math.cos(a)*10*p|0,f.y+Math.sin(a)*10*p|0,2,2)}g.fillRect(f.x-1,f.y-14+p*10|0,2,12)}
  else if(f.kind==='heal'){for(let i=0;i<8;i++){g.fillStyle=i%2?'#a8ffcc':'#ffffff';g.fillRect(f.x-8+i*2,f.y+8-((p*30+i*7)%20)|0,1,2)}}
  else if(f.kind==='sleep'){g.fillStyle='#ffb0e0';for(let i=0;i<3;i++)g.fillRect(f.x+i*4-4,f.y-p*12-i*3|0,2,2)}
  else if(f.kind==='bigwater'){const H=sceneH();const x=VW*(1-p*1.4);g.fillStyle='rgba(80,160,240,.55)';g.beginPath();g.moveTo(x,H);for(let y=H;y>=H*.2;y-=4)g.lineTo(x+Math.sin(y/9+f.t/3)*6-(H-y)*.2,y);g.lineTo(x+60,H*.2);g.lineTo(x+60,H);g.fill();g.fillStyle='#e8f6ff';for(let y=H*.2;y<H;y+=6)g.fillRect(x+Math.sin(y/9+f.t/3)*6-(H-y)*.2|0,y|0,2,2)}
  else if(f.kind==='bigmoon'){g.fillStyle=`rgba(230,245,255,${.5*(1-Math.abs(p-.5)*2)})`;g.fillRect(0,0,VW,sceneH());for(const t of f.ts||[]){const [x,y]=centerOf(t);g.fillStyle='#fff';g.fillRect(x-1,0,3,y*Math.min(1,p*2))}}
  else if(f.kind==='bigheal'){}
  else if(f.kind==='bigtide'){const H=sceneH();g.fillStyle=`rgba(160,210,255,${.4*(1-p)})`;g.fillRect(0,0,VW,H);g.strokeStyle='#e8f6ff';g.beginPath();for(let x=0;x<VW;x+=2)g.lineTo(x,H*(1-p)+Math.sin(x/8+f.t/2)*4);g.stroke()}
  else if(f.kind==='bigguard'){for(const a of B.heroes){const [x,y]=heroPos(a);g.strokeStyle=`rgba(159,214,255,${1-p})`;g.strokeRect(x-2-p*4,y-2-p*4,20+p*8,20+p*8)}}
  else if(f.kind==='bigslam'||f.kind==='bigslash'){g.fillStyle=`rgba(255,255,255,${.35*(1-p)})`;g.fillRect(0,0,VW,sceneH())}
  else if(f.kind==='bigsleep'){}}
