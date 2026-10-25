/* ---------- screens: title, story, camp, HUD, results, ending ---------- */
const UI=document.getElementById('ui');
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
let MODE='boot',SCR={};
function setScreen(mode,scr){MODE=mode;SCR=scr||{};UI.innerHTML='';if(SCR.enter)SCR.enter()}

/* ---------- save ---------- */
const SAVE_KEY='pitchfork-save';
function NEWG(){return{v:1,stage:0,plunder:10,folk:{stones:3,fork:3},traps:{pit:1},leader:{vigor:0,might:0,voice:0},flags:{},plan:{scheme:'none'},stats:{kills:0,fallen:0,won:0,tries:0},seenPre:-1,done:false,seen:{},stars:[]}}
let G=NEWG(),SNAP=null;
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(G))}catch(e){}}
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s&&s.v===1){s.seen=s.seen||{};s.stars=s.stars||[];return s}}catch(e){}return null}
const avail=(o,st=G.stage)=>Object.keys(o).filter(k=>o[k].from<=st);
const folkCount=()=>Object.values(G.folk).reduce((a,b)=>a+b,0);

/* ---------- backdrops ---------- */
function drawSky(g,t,top,bot){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,top);gr.addColorStop(1,bot);g.fillStyle=gr;g.fillRect(-100,0,W+200,H)}
function drawTitleScene(t){const g0=ctx,ox=Math.min(0,(W-320)>>1),SW=Math.max(W,320);g0.save();g0.translate(ox,0);const g=ctx;drawSky(g,t,'#1a1030','#c8603a');
  for(let i=0;i<40;i++){const x=hash(i,1)*SW|0,y=hash(i,2)*70|0;g.globalAlpha=.4+.4*Math.sin(t*2+i);P(g,'#fff0d0',x,y,1,1)}g.globalAlpha=1;
  disc(g,'#ffcf8a',250,62,16);disc(g,'#ffe0a8',250,62,13);
  // castle on the hill
  g.fillStyle='#2a1420';g.beginPath();g.moveTo(150,120);g.quadraticCurveTo(230,70,320,95);g.lineTo(320,180);g.lineTo(150,180);g.fill();
  P(g,'#1e0e18',236,58,40,30);P(g,'#1e0e18',228,48,10,40);P(g,'#1e0e18',270,44,10,44);for(let i=0;i<5;i++)P(g,'#1e0e18',236+i*8,54,4,4);P(g,'#1e0e18',228,44,3,4);P(g,'#1e0e18',235,44,3,4);P(g,'#1e0e18',270,40,3,4);P(g,'#1e0e18',277,40,3,4);
  P(g,'#ffb040',252,70,3,4);P(g,'#ffb040',273,56,2,3);
  // village roofs
  g.fillStyle='#160a10';g.beginPath();g.moveTo(0,130);g.quadraticCurveTo(80,112,180,128);g.lineTo(180,180);g.lineTo(0,180);g.fill();
  for(const[x,w,h]of[[10,26,16],[44,20,13],[70,30,18],[112,22,12],[140,26,15]]){const y=126-h;g.fillStyle='#120810';g.beginPath();g.moveTo(x,y+h);g.lineTo(x+w/2,y);g.lineTo(x+w,y+h);g.fill();P(g,'#120810',x+3,y+h-1,w-6,10);P(g,'#ffb050',x+w/2-1,y+h+2,2,2)}
  // the crowd
  P(g,'#0a0408',0,150,SW,30);
  for(let i=0;i<26;i++){const x=6+i*12+(hash(i,5)*6|0),y=152+(hash(i,6)*8|0),b=Math.sin(t*3+i)*1.2;P(g,'#0a0408',x-2,y-10+b,5,12);P(g,'#0a0408',x-1,y-13+b,3,3);
    if(i%3===0){line(g,'#0a0408',x+2,y-6+b,x+5,y-22+b);P(g,'#0a0408',x+3,y-25+b,1,3);P(g,'#0a0408',x+5,y-25+b,1,3);P(g,'#0a0408',x+7,y-25+b,1,3);P(g,'#0a0408',x+3,y-23+b,5,1)}
    else if(i%3===1){line(g,'#0a0408',x+2,y-6+b,x+3,y-18+b);const k=(t*10+i)%2|0;P(g,'#ff7020',x+2,y-21+b,3,3);P(g,'#ffd040',x+3,y-22-k+b,1,2);g.globalAlpha=.15;disc(g,'#ffa040',x+3,y-20+b,9);g.globalAlpha=1}}
;g0.restore()}
function drawCampScene(t){const g0=ctx,ox=Math.min(0,(W-320)>>1),SW=Math.max(W,320);g0.save();g0.translate(ox,0);const g=ctx;drawSky(g,t,'#0a0c20','#20182a');for(let i=0;i<50;i++){g.globalAlpha=.3+.4*Math.sin(t+i*1.7);P(g,'#e0e8ff',hash(i,9)*SW|0,hash(i,8)*90|0,1,1)}g.globalAlpha=1;
  P(g,'#141018',0,110,SW,70);g.fillStyle='#0e0a12';for(let i=0;i<12;i++){const x=i*30-10;g.beginPath();g.moveTo(x,112);g.lineTo(x+14,80+hash(i,3)*14);g.lineTo(x+28,112);g.fill()}
  for(const[x,y]of[[50,140],[250,136]]){for(let i=0;i<14;i++)P(g,'#3a2a20',x+10-i,y+i-14,i*2+1,1)}
  const fx=160,fy=150;g.globalAlpha=.25;disc(g,'#ff8030',fx,fy-6,40+Math.sin(t*9)*2);g.globalAlpha=1;
  for(let i=0;i<8;i++){const k=(t*3+i*.13)%1;P(g,k<.3?'#ffe070':k<.7?'#ff8020':'#902010',fx-6+(hash(i,4)*12|0),fy-2-k*16|0,2,3)}P(g,'#4a2a10',fx-9,fy,18,3);
  for(const[x,f]of[[128,1],[138,1],[184,-1],[194,-1],[110,1]]){drawPerson(g,x,fy+6,{skin:'#d8a878',hair:'#3a2414',tunic:'#4a3a2a',trim:'#2a1a10',hat:'hood',hatC:'#3a2a1a',wpn:'fork'},{face:f,walk:0,t})};g0.restore()}
function drawEndScene(t){const g0=ctx,ox=Math.min(0,(W-320)>>1),SW=Math.max(W,320);g0.save();g0.translate(ox,0);const g=ctx;drawSky(g,t,'#ffb070','#fff0c8');g.fillStyle='#7a9a4a';g.beginPath();g.moveTo(0,120);g.quadraticCurveTo(160,96,320,124);g.lineTo(320,180);g.lineTo(0,180);g.fill();
  disc(g,'#fff8e0',160,70,20);for(let i=0;i<20;i++){const x=10+i*16,y=150+(hash(i,4)*10|0);drawPerson(g,x,y,{skin:SKINS[i%4],hair:HAIRS[i%7],tunic:PEASANT_TUNICS[i%8],trim:'#3a2a14',hat:i%3?'':'cap',hatC:'#6a5a3a',wpn:i%2?'fork':''},{face:i%2?1:-1,walk:(t*.6+i*.3)%1,t})};g0.restore()}

/* ---------- small helpers ---------- */
const btnRow=(items,sel)=>items.map((it,i)=>`<div class="btn ${it.cls||''}${i===sel?' sel':''}${it.dis?' dis':''}">${it.html}${it.badge?`<b class="badge">${it.badge}</b>`:''}</div>`).join('');
const chip=(ic,txt,cls='')=>`<span class="chip ${cls}">${img(ic)}${txt}</span>`;
function toastMsg(s){const e=document.createElement('div');e.className='toast';e.innerHTML=rich(s);UI.appendChild(e);setTimeout(()=>e.remove(),1300)}
function goalShort(s){if(s.win==='rout')return s.exitLimit?'Let none pass':'Drive them out';if(s.win==='survive')return 'Guard '+s.protect.name.replace(/^The /,'the ')+' · '+s.time+'s';
  if(s.win==='boss')return 'Defeat '+FOES[s.boss.t].name;if(s.win==='hold')return 'Burn the tax rolls';if(s.win==='escort')return 'Guard the cart';return ''}
const goalIcon=s=>({rout:'swords',survive:'clock',boss:'crown',hold:'flame',escort:'cart:'})[s.win];
function foeKinds(s){const k=new Set();for(const g of s.guards||[])k.add(g[2]);for(const w of s.waves||[])for(const u in w.u)k.add(u);const b=s.boss?s.boss.t:null;return{list:[...k].filter(x=>x!==b),boss:b}}
// menus that move with the D-pad: up/down (or left/right) step through items
function stepSel(b,sel,n,axis='v'){const prev=axis==='v'?'up':'left',next=axis==='v'?'down':'right';if(b===prev)return(sel+n-1)%n;if(b===next)return(sel+1)%n;return sel}

/* ---------- title ---------- */
function titleScreen(){const has=loadSave();let sel=0,sure=false;
  const items=()=>{const a=[];if(has&&!has.done)a.push({k:'cont',html:'Continue'});a.push({k:'new',html:sure?'Start over?':'New Revolt',cls:sure?'warnb':''});a.push({k:'snd',html:AU.muted?'Sound off':'Sound on',cls:'small'});return a};
  const draw=()=>{UI.innerHTML=`<div class="title fadein"><h1>PITCHFORK<br>RISING</h1></div><div class="tmenu">${btnRow(items(),sel)}</div>`};
  setScreen('title',{enter:draw,draw:t=>drawTitleScene(t),btn(b){const it=items();if(b==='up'||b==='down'){sel=stepSel(b,sel,it.length);sure=false;AU.sfx('tick');draw();return}
    if(b!=='a'&&b!=='start')return;AU.unlock();AU.play('title');const k=it[sel].k;AU.sfx('pick');
    if(k==='cont'){G=has;toCamp()}
    else if(k==='new'){if(has&&!has.done&&!sure){sure=true;draw();return}G=NEWG();save();startStory()}
    else{AU.toggleMute();draw()}}});
  AU.play('title')}

/* ---------- story: one short line at a time, with a face to it ---------- */
function talk(lines,done,scene){let i=0,shown=0,full='';
  const draw=()=>{const[who,text]=lines[i];full=text;
    UI.innerHTML=who?`<div class="dlg pop"><img class="face" src="${icon('face:'+who)}" alt=""><div class="dtx"><b>${esc(who)}</b><p id="dlgt"></p></div><i class="more"></i></div>`
      :`<div class="narr pop"><p id="dlgt"></p></div>`;
    UI.insertAdjacentHTML('beforeend',`<div class="skip">${rich('{START} Skip')}</div>`);shown=0};
  setScreen('dialog',{enter:draw,update(dt){if(shown<full.length){shown=Math.min(full.length,shown+dt*55);const e=document.getElementById('dlgt');if(e)e.textContent=full.slice(0,shown|0)}},
    draw:scene,btn(b){if(b==='start'){done();return}if(b!=='a'&&b!=='b')return;if(shown<full.length){shown=full.length;const e=document.getElementById('dlgt');if(e)e.textContent=full;return}
      i++;AU.sfx('tick');if(i>=lines.length)done();else draw()}})}
function actCard(a,done){const A=ACTS[a];let t0=0;setScreen('act',{enter(){UI.innerHTML=`<div class="act fadein"><small>ACT ${A.n}</small><h2>${esc(A.name)}</h2></div>`},
  update(dt){t0+=dt;if(t0>2.6)done()},draw:t=>{ctx.fillStyle='#0c0806';ctx.fillRect(0,0,W,H)},btn(b){if((b==='a'||b==='start')&&t0>.5)done()}})}
function startStory(){actCard(0,()=>preStory())}
function preStory(){const sp=BATTLES[G.stage];AU.play('camp');talk(sp.pre,()=>{G.seenPre=G.stage;save();G.stage===0?toDeploy():toCamp()},t=>drawCampScene(t))}

/* ---------- camp: a hub of a few big buttons ---------- */
const HUB=[{k:'arm',label:'Arm',ic:'wpn:fork'},{k:'traps',label:'Traps',ic:'trap:pit'},{k:'plan',label:'Plan',ic:'scroll'},{k:'wat',label:'Wat',ic:'face:Wat'}];
const HUB_NEW={arm:'New! Spend plunder to arm your folk',traps:'New! Buy traps to set before battle',plan:'New! Choose a plan for each battle',wat:'New! Make Wat stronger'};
function shopHasNew(k){const o=k==='arm'?WEAPONS:k==='traps'?TRAPS:k==='plan'?SCHEMES:null;if(!o)return false;return Object.keys(o).some(x=>o[x].from===G.stage&&o[x].from>0)}
function toCamp(focus){AU.play('camp');const sp=BATTLES[G.stage];
  if(!SCHEMES[G.plan.scheme]||SCHEMES[G.plan.scheme].from>G.stage)G.plan.scheme='none';
  const hubs=HUB.filter(h=>G.stage>=HUB_FROM[h.k]);
  const fresh=hubs.find(h=>!G.seen['hub_'+h.k]);
  const items=()=>[...hubs.map(h=>({k:h.k,cls:'hb',html:`${img(h.ic,'big')}<span>${h.label}</span>`,badge:!G.seen['hub_'+h.k]?'NEW':shopHasNew(h.k)&&!G.seen['new_'+h.k+G.stage]?'!':''})),{k:'fight',cls:'hb fight',html:`<span class="fx">FIGHT</span>`}];
  let sel=focus!=null?focus:fresh?hubs.indexOf(fresh):hubs.length;
  const draw=()=>{const it=items(),fk=foeKinds(sp);sel=clamp(sel,0,it.length-1);
    const plan=G.plan.scheme!=='none'?`<div class="planchip">${img(schemeIcon(G.plan.scheme))}${esc(SCHEMES[G.plan.scheme].name)}</div>`:'';
    UI.innerHTML=`<div class="topbar">${chip('coin',G.plunder)}${chip('folk',folkCount())}</div>
      <div class="bcard pop"><small>BATTLE ${G.stage+1} OF 12</small><h2>${esc(sp.name)}</h2>
        <div class="goalline">${img(goalIcon(sp))}${esc(goalShort(sp))}</div>
        <div class="foes">${fk.boss?img('foe:'+fk.boss,'boss'):''}${fk.list.map(k=>img('foe:'+k)).join('')}</div>${plan}</div>
      ${fresh&&it[sel].k===fresh.k?`<div class="bubble">${esc(HUB_NEW[fresh.k])}</div>`:''}
      <div class="hub">${btnRow(it,sel)}</div>`};
  setScreen('camp',{enter:draw,draw:t=>drawCampScene(t),btn(b){const it=items();
    if(b==='left'||b==='right'||b==='up'||b==='down'){sel=stepSel(b==='up'?'left':b==='down'?'right':b,sel,it.length,'h');AU.sfx('tick');draw();return}
    if(b==='start'){march();return}
    if(b==='a'){const k=it[sel].k;AU.sfx('pick');if(k==='fight')march();else{G.seen['hub_'+k]=1;G.seen['new_'+k+G.stage]=1;save();shop(k,()=>toCamp(sel))}}}})}
function march(){const sc=SCHEMES[G.plan.scheme];if(sc.cost>G.plunder)G.plan.scheme='none';
  SNAP=JSON.stringify(G);G.plunder-=SCHEMES[G.plan.scheme].cost;G.stats.tries++;save();AU.sfx('horn');toDeploy()}
const schemeIcon=k=>({none:'fist',ale:'mug',militia:'bell',rumor:'scroll',night:'moon',herb:'potion',bribe:'bag'})[k];

/* ---------- shops: one big card at a time ---------- */
function shop(kind,back){
  const keys=kind==='arm'?WORDER.filter(k=>WEAPONS[k].from<=G.stage):kind==='traps'?TORDER.filter(k=>TRAPS[k].from<=G.stage):kind==='plan'?SORDER.filter(k=>SCHEMES[k].from<=G.stage):Object.keys(UPGRADES);
  let sel=kind==='arm'?Math.min(1,keys.length-1):0;
  // open on the newest thing
  const nk=keys.findIndex(k=>(kind==='arm'?WEAPONS:kind==='traps'?TRAPS:kind==='plan'?SCHEMES:{})[k]?.from===G.stage&&G.stage>0);if(nk>=0)sel=nk;
  const title={arm:'Arm your folk',traps:'Traps',plan:'Battle plan',wat:'Train Wat'}[kind];
  const card=k=>{let ic,name,desc,stats='',own='',act,can=true,why='',isNew=false;
    if(kind==='arm'){const w=WEAPONS[k];ic='wpn:'+k;name=w.name;desc=w.desc;isNew=w.from===G.stage&&G.stage>0;
      stats=`${chip('sword',w.dmg)}${chip('heart',w.hp)}<span class="chip">${w.ranged?'Ranged':'Close'}</span>`;own=`You have ${G.folk[k]||0}`;
      if(k==='stones'){act='';own=`${G.folk.stones||0} unarmed`}else{act=`{A} Arm one {COIN}${w.cost}`;if(!(G.folk.stones>0)){can=false;why='No unarmed folk left'}else if(G.plunder<w.cost){can=false;why='Not enough plunder'}}}
    else if(kind==='traps'){const t=TRAPS[k];ic='trap:'+k;name=t.name;desc=t.desc;isNew=t.from===G.stage&&G.stage>0;own=`You have ${G.traps[k]||0}`;act=`{A} Buy {COIN}${t.cost}`;if(G.plunder<t.cost){can=false;why='Not enough plunder'}}
    else if(kind==='plan'){const c=SCHEMES[k];ic=schemeIcon(k);name=c.name;desc=c.desc;isNew=c.from===G.stage&&G.stage>0;const on=G.plan.scheme===k;
      own=on?'<span class="green">✓ Chosen</span>':'';act=on?'':`{A} Choose${c.cost?' {COIN}'+c.cost:''}`;if(!on&&c.cost>G.plunder){can=false;why='Not enough plunder'}}
    else{const u=UPGRADES[k],l=G.leader[k],cost=l>=4?null:u.base*(l+1);ic=u.icon;name=u.name;desc=u.desc;own=`<span class="stars">${[0,1,2,3].map(i=>img(i<l?'star':'stardim')).join('')}</span>`;
      act=cost==null?'':`{A} Train {COIN}${cost}`;if(cost==null){can=false;why='Fully trained'}else if(G.plunder<cost){can=false;why='Not enough plunder'}}
    return{ic,name,desc,stats,own,act,can,why,isNew}};
  const draw=(dir)=>{const c=card(keys[sel]);const sellable=(kind==='arm'&&keys[sel]!=='stones'&&G.folk[keys[sel]]>0)||(kind==='traps'&&G.traps[keys[sel]]>0);
    UI.innerHTML=`<div class="topbar"><b class="stitle">${esc(title)}</b>${chip('coin',G.plunder)}${kind==='arm'?chip('folk',(G.folk.stones||0)+' free'):''}</div>
      <div class="carousel"><span class="arr${sel>0?'':' off'}">◀</span>
        <div class="card ${dir?'slide'+dir:'pop'}">${c.isNew?'<b class="badge">NEW</b>':''}${img(c.ic,'hero')}<h3>${esc(c.name)}</h3>${c.stats?`<div class="stats">${c.stats}</div>`:''}<p>${rich(c.desc)}</p><div class="own">${c.own}</div></div>
        <span class="arr${sel<keys.length-1?'':' off'}">▶</span></div>
      <div class="dots">${keys.map((_,i)=>`<i class="${i===sel?'on':''}"></i>`).join('')}</div>
      <div class="sfoot">${c.act?`<span class="buy${c.can?'':' dis'}">${c.can?rich(c.act):esc(c.why)}</span>`:''}</div><div class="ssub">${sellable?`<span>${rich('{SEL} Return one')}</span>`:''}<span>${rich('{B} Back')}</span></div>`};
  setScreen('shop',{enter:()=>draw(),draw:t=>drawCampScene(t),btn(b){const k=keys[sel];
    if(b==='left'||b==='right'){const n=stepSel(b,sel,keys.length,'h');if((b==='left'&&sel===0)||(b==='right'&&sel===keys.length-1))return;sel=n;AU.sfx('tick');draw(b==='right'?'r':'l');return}
    if(b==='b'||b==='start'){AU.sfx('tick');back();return}
    if(b==='select'){
      if(kind==='arm'&&k!=='stones'&&G.folk[k]>0){G.folk[k]--;G.folk.stones=(G.folk.stones||0)+1;G.plunder+=Math.floor(WEAPONS[k].cost/2);AU.sfx('coin')}
      else if(kind==='traps'&&G.traps[k]>0){G.traps[k]--;G.plunder+=Math.floor(TRAPS[k].cost/2);AU.sfx('coin')}else return;save();draw();return}
    if(b!=='a')return;const c=card(k);if(!c.act)return;if(!c.can){AU.sfx('no');toastMsg(c.why);return}
    if(kind==='arm'){G.plunder-=WEAPONS[k].cost;G.folk.stones--;G.folk[k]=(G.folk[k]||0)+1}
    else if(kind==='traps'){G.plunder-=TRAPS[k].cost;G.traps[k]=(G.traps[k]||0)+1}
    else if(kind==='plan'){G.plan.scheme=k}
    else{G.plunder-=UPGRADES[k].base*(G.leader[k]+1);G.leader[k]++}
    AU.sfx('buy');save();draw();const e=UI.querySelector('.card');if(e){e.classList.remove('pop');void e.offsetWidth;e.classList.add('bump')}}})}

/* ---------- deploy and battle ---------- */
function toDeploy(){startDeploy(G.stage);
  if(G.stage===0){if(!SNAP){SNAP=JSON.stringify(G);G.stats.tries++}beginFight(DEP.items);DEP=null;UIX.battleHud();return}
  AU.play('camp');
  setScreen('deploy',{enter(){UIX.deployHud()},update(dt){updateDeploy(dt);updateBattle(dt);UIX.deployHud(true)},draw:t=>drawDeploy(t),btn(b){deployBtn(b)}})}
function itemIcon(it){return it.k==='leader'?'face:Wat':it.k==='squad'?'wpn:'+it.w:'trap:'+it.t}
const UIX={
  deployHud(upd){if(!DEP)return;const it=DEP.carry||DEP.items[DEP.sel];const pr=deployPrompt();const k=DEP.sel+pr+(DEP.warn?DEP.warn.s:'')+(DEP.carry?1:0);if(upd&&UIX._dk===k)return;UIX._dk=k;
    const sp=B.spec;const first=!G.seen.deploy;
    UI.innerHTML=`<div class="topbar">${chip(goalIcon(sp),esc(goalShort(sp)))}</div>
      ${first?`<div class="bubble mid">${rich('Ready? Press {START} to fight!')}<small>${rich('Or move pieces first: {PAD} + {A}')}</small></div>`:''}
      <div class="dbar">${img(itemIcon(it),'mid')}<span class="dname">${esc(it.k==='leader'?'Wat':it.k==='squad'?WEAPONS[it.w].name+' ×'+it.n:TRAPS[it.t].name)}</span>
        <span class="dpr">${rich(pr)}</span><span class="go">${rich('{START} Fight!')}</span></div>${DEP.warn?`<div class="toast">${esc(DEP.warn.s)}</div>`:''}`},
  battleHud(){setScreen('battle',{enter(){UI.innerHTML=`<div class="hud"><div class="wat">${img('face:Wat','face')}<div class="bar"><i id="hpb"></i></div></div>
      <div class="goalchip" id="goal"></div><span class="chip" id="folk"></span></div><div class="ord" id="ord"></div>
      <div id="coach"></div><div id="card"></div><div class="bossbar" id="boss" hidden></div><div id="ban"></div>`;UIX._k={}},
    update(dt){updateBattle(dt);UIX.hud();if(B.state!=='fight'&&B.endT>2.2){if(B.state==='won')resultWin();else resultLose()}},
    draw:t=>drawBattle(t),btn(b){if(b==='start'){pauseMenu();return}leaderInput(b)}})},
  hud(){const L=B.leader,s=B.spec,K=UIX._k;const q=id=>document.getElementById(id);if(!q('hpb'))return;
    const set=(id,v,f)=>{if(K[id]!==v){K[id]=v;f(q(id))}};
    q('hpb').style.width=Math.max(0,L.hp/L.max*100)+'%';q('hpb').parentNode.classList.toggle('low',L.hp<L.max*.3);
    set('ord',B.order,e=>{e.className='ord '+B.order;e.innerHTML=`${ORDER_NAME[B.order].replace('!','')}${GLYPH.SEL}`});
    let gl='',bar=null,ic=goalIcon(s);
    if(s.win==='survive'){gl=String(Math.max(0,Math.ceil(s.time-B.time)));bar=B.obj.hp/B.obj.max}
    else if(s.win==='hold'){gl=B.hold.active?'Burning!':'';bar=B.hold.prog/B.hold.need}
    else if(s.win==='escort'){gl=B.cart.why==='Foes block the cart!'?'Blocked!':B.cart.why?'Waiting':'';bar=B.cart.hp/B.cart.max}
    else if(s.win==='boss'){gl=esc(FOES[s.boss.t].name.split(' ').slice(-1)[0])}
    else{const n=B.units.filter(u=>u.alive&&u.side==='e').length+B.queue.length+B.waves.filter(w=>!w.done).reduce((a,w)=>a+Object.values(w.u).reduce((x,y)=>x+y,0),0);gl=String(n);ic='skull';if(s.exitLimit)gl+=` <span class="red">${B.escaped}/${s.exitLimit} out</span>`}
    set('goal',gl+'|'+(bar==null?'':Math.round(bar*50))+ic,e=>{e.innerHTML=`${img(ic)}<span>${gl}</span>${bar==null?'':`<div class="bar obj"><i style="width:${clamp(bar,0,1)*100}%"></i></div>`}`});
    const folk=B.units.filter(u=>u.alive&&u.side==='p'&&!u.isLeader).length;set('folk',folk,e=>{e.innerHTML=img('folk')+folk});
    const bs=B.boss;const be=q('boss');if(bs&&(bs.state!=='idle'||bs.hp<bs.max)&&bs.alive){be.hidden=false;set('boss',Math.round(bs.hp),e=>{e.innerHTML=`<span>${esc(bs.d.name)}</span><div class="bar boss"><i style="width:${bs.hp/bs.max*100}%"></i></div>`})}else be.hidden=true;
    const bn=B.banner;set('ban',bn?bn.text+(bn.big?1:0):'',e=>{e.innerHTML=bn?`<div class="banner${bn.small?' small':''}${bn.order?' order':''}${bn.big?' big':''}${bn.bad?' bad':''}">${esc(bn.text)}</div>`:''});
    const c=B.coach;set('coach',c?c.id:'',e=>{e.innerHTML=c?`<div class="coach pop">${rich(c.text)}</div>`:''});
    const cd=B.card;set('card',cd?cd.kind+(cd.boss?1:0):'',e=>{if(!cd){e.innerHTML='';return}const d=FOES[cd.kind];
      e.innerHTML=cd.boss?`<div class="bossintro">${img('foe:'+cd.kind,'hero')}<div><small>${esc(d.blurb)}</small><h2>${esc(d.name)}</h2></div></div>`
        :`<div class="fcard slidein">${img('foe:'+cd.kind,'mid')}<div><small>NEW FOE</small><b>${esc(d.name)}</b><span>${esc(d.blurb)}</span></div></div>`})}
};
function menuPanel(title,items,sel,cls=''){return `<div class="mpanel pop ${cls}">${title?`<h2>${title}</h2>`:''}<div class="mlist">${btnRow(items,sel)}</div></div>`}
function pauseMenu(){let sel=0;const prev=SCR;
  const items=()=>[{html:'Resume',act:()=>resume()},{html:'Restart',act:()=>retry()},{html:'Back to camp',act:()=>{G=JSON.parse(SNAP);save();G.stage===0?titleScreen():toCamp()}},{html:AU.muted?'Sound off':'Sound on',cls:'small',act:()=>{AU.toggleMute();draw()}}];
  const draw=()=>{const old=document.getElementById('pz');if(old)old.remove();const d=document.createElement('div');d.id='pz';d.className='shade';d.innerHTML=menuPanel('Paused',items(),sel);UI.appendChild(d)};
  const resume=()=>{const e=document.getElementById('pz');if(e)e.remove();MODE='battle';SCR=prev};
  MODE='pause';SCR={draw:t=>drawBattle(t),btn(b){if(b==='start'||b==='b'){resume();return}if(b==='up'||b==='down'){sel=stepSel(b,sel,4);AU.sfx('tick');draw()}else if(b==='a'){AU.sfx('pick');items()[sel].act()}}};draw()}
function retry(){G=JSON.parse(SNAP);SNAP=JSON.stringify(G);G.plunder-=SCHEMES[G.plan.scheme].cost;G.stats.tries++;toDeploy()}
function resultLose(){let sel=0;const items=[{html:'Try again',act:retry},{html:'Camp',cls:'alt',act:()=>{G=JSON.parse(SNAP);save();G.stage===0?retry():toCamp()}}];
  if(G.stage===0)items.pop();
  const draw=()=>{UI.innerHTML=`<div class="shade"><div class="result pop"><h1 class="bad">DEFEAT</h1><p>${esc(B.loseWhy||'')}</p><div class="rbtns">${btnRow(items,sel)}</div></div></div>`};
  setScreen('result',{enter:draw,update(dt){updateBattle(dt)},draw:t=>drawBattle(t),btn(b){if(b==='left'||b==='right'||b==='up'||b==='down'){sel=(sel+1)%items.length;AU.sfx('tick');draw()}else if(b==='a'||b==='start'){AU.sfx('pick');items[sel].act()}}})}
function applyWin(){const sp=B.spec;
  let lost=0;for(const[k,n]of Object.entries(B.fallen)){G.folk[k]=Math.max(0,(G.folk[k]||0)-n);lost+=n}
  for(const[k,n]of Object.entries(B.usedTraps))G.traps[k]=Math.max(0,(G.traps[k]||0)-n);
  const gain=sp.reward+B.plunder;G.plunder+=gain;G.folk.stones=(G.folk.stones||0)+sp.recruits;if(sp.gift)G.flags[sp.gift]=1;
  const stars=lost===0?3:lost<=Math.max(1,B.deployedFolk*.3)?2:1;G.stars[B.idx]=Math.max(G.stars[B.idx]||0,stars);
  G.stats.kills+=B.kills;G.stats.fallen+=lost;G.stats.won++;G.stage++;G.plan.scheme='none';SNAP=null;save();
  return{lost,gain,stars}}
function resultWin(){const sp=B.spec;const{lost,gain,stars}=applyWin();
  UI.innerHTML=`<div class="shade"><div class="result pop"><h1>VICTORY!</h1><div class="rstars">${[0,1,2].map(i=>`<span style="animation-delay:${.3+i*.25}s">${img(i<stars?'star':'stardim','hero')}</span>`).join('')}</div>
    <div class="rchips">${chip('skull',B.kills)}${chip('coin','+'+gain)}${sp.recruits?chip('folk','+'+sp.recruits,'green'):''}${lost?`<span class="chip red">−${lost} fell</span>`:''}</div>
    <div class="cont">${rich('{A} Continue')}</div></div></div>`;
  MODE='result';SCR={update(dt){updateBattle(dt)},draw:t=>drawBattle(t),btn(b){if(b==='a'||b==='start'){AU.sfx('pick');unlockCards(()=>afterWin(sp))}}}}
// new toys arrive one card at a time
function unlockCards(done){const st=G.stage,list=[];if(st<BATTLES.length){for(const k of WORDER)if(WEAPONS[k].from===st)list.push({tag:'New weapon',ic:'wpn:'+k,name:WEAPONS[k].name,desc:WEAPONS[k].desc});
    for(const k of TORDER)if(TRAPS[k].from===st)list.push({tag:'New trap',ic:'trap:'+k,name:TRAPS[k].name,desc:TRAPS[k].desc});
    for(const k of SORDER)if(SCHEMES[k].from===st&&k!=='none')list.push({tag:'New plan',ic:schemeIcon(k),name:SCHEMES[k].name,desc:SCHEMES[k].desc});
    if(BATTLES[st-1]&&BATTLES[st-1].gift==='blade')list.push({tag:'New sword',ic:'sword',name:'Roderick\'s Blade',desc:'Wat hits much harder.'})}
  let i=0;const show=()=>{if(i>=list.length){done();return}const c=list[i];AU.sfx('buy');
    setScreen('unlock',{enter(){UI.innerHTML=`<div class="shade"><div class="unlock pop"><small>${esc(c.tag)}!</small>${img(c.ic,'hero')}<h2>${esc(c.name)}</h2><p>${rich(c.desc)}</p><div class="cont">${rich('{A} Got it')}</div></div></div>`},
      draw:t=>drawCampScene(t),btn(b){if(b==='a'||b==='start'){i++;show()}}})};show()}
function afterWin(sp){AU.play('camp');talk(sp.post,()=>{
  if(G.stage>=BATTLES.length){chooseEnding();return}
  const nb=BATTLES[G.stage];const go=()=>preStory();if(nb.act!==sp.act)actCard(nb.act,go);else go()},t=>drawCampScene(t))}

/* ---------- ending ---------- */
function chooseEnding(){let sel=0;AU.play('title');const items=ENDINGS.map(e=>({html:`<span>${esc(e.name)}<small>${esc(e.sub)}</small></span>`,cls:'tall'}));
  const draw=()=>{UI.innerHTML=`<div class="shade">${menuPanel('What now?',items,sel,'wide')}</div>`};
  setScreen('ending',{enter:draw,draw:t=>drawTitleScene(t),btn(b){if(b==='up'||b==='down'){sel=stepSel(b,sel,3);AU.sfx('tick');draw()}else if(b==='a'){const e=ENDINGS[sel];G.done=true;G.ending=e.k;save();AU.sfx('win');
    talk(e.text.map(x=>['',x]),()=>credits(e),t=>drawEndScene(t))}}})}
function credits(e){const st=G.stars.reduce((a,b)=>a+(b||0),0);setScreen('credits',{enter(){UI.innerHTML=`<div class="shade"><div class="result pop"><small class="gold">THE REVOLT IS WON</small><h1>${esc(e.name)}</h1>
  <div class="rchips">${chip('star',st+'/36')}${chip('skull',G.stats.kills)}${chip('folk',G.stats.fallen+' fell')}</div><p class="dim">Thanks for playing!</p><div class="cont">${rich('{A} Title')}</div></div></div>`},draw:t=>drawEndScene(t),btn(b){if(b==='a'||b==='start')titleScreen()}})}
