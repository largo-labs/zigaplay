/* ---------- screens: title, story, camp, HUD, results, ending ---------- */
const UI=document.getElementById('ui');
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
let MODE='boot',SCR={};
function setScreen(mode,scr){MODE=mode;SCR=scr||{};UI.innerHTML='';if(SCR.enter)SCR.enter()}

/* ---------- save ---------- */
const SAVE_KEY='pitchfork-save';
function NEWG(){return{v:1,stage:0,plunder:10,folk:{stones:3,fork:3},traps:{pit:1,snare:1},leader:{vigor:0,might:0,voice:0},flags:{},plan:{scheme:'none'},stats:{kills:0,fallen:0,won:0,tries:0},seenPre:-1,done:false}}
let G=NEWG(),SNAP=null;
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(G))}catch(e){}}
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s&&s.v===1)return s}catch(e){}return null}
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

/* ---------- title ---------- */
function titleScreen(){const has=loadSave();let sel=0;const items=[];
  if(has&&!has.done)items.push({label:'Continue the Revolt',sub:'Battle '+(has.stage+1)+' of 12',act:()=>{G=has;toCamp()}});
  items.push({label:'New Revolt',act:()=>{G=NEWG();save();startStory()}});
  items.push({label:'How to Play',act:()=>howTo(()=>titleScreen())});
  items.push({label:()=>'Sound: '+(AU.muted?'off':'on'),act:()=>{AU.toggleMute();draw()}});
  const draw=()=>{UI.innerHTML=`<div class="title fadein"><h1>PITCHFORK RISING</h1><p>From the village barn to the king's throne</p></div>
    <div class="tmenu panel">${items.map((it,i)=>`<div class="item${i===sel?' sel':''}">${esc(typeof it.label==='function'?it.label():it.label)}${it.sub?`<span class="r">${esc(it.sub)}</span>`:''}</div>`).join('')}</div>`};
  setScreen('title',{enter:draw,draw:t=>drawTitleScene(t),btn(b){if(b==='up'||b==='down'){sel=(sel+(b==='up'?items.length-1:1))%items.length;AU.sfx('tick');draw()}
    else if(b==='a'||b==='start'){AU.unlock();AU.play('title');AU.sfx('pick');items[sel].act()}}});
  AU.play('title')}
function howTo(back){setScreen('howto',{enter(){UI.innerHTML=`<div class="panel howto"><h3>How to lead a revolt</h3>
  <p><b>Before each battle</b> spend plunder at camp: arm your folk, buy traps, and pick one scheme. Then place your squads in the green area and set traps where the enemy will walk.</p>
  <p style="margin-top:.4em"><b>In battle</b> you are Wat, on the field with your folk. <b>Move</b> with the D-pad or stick. <b>A</b> strikes (hold to keep swinging). <b>B</b> rolls out of danger. <b>SELECT</b> shouts orders: HOLD (wait in ambush), CHARGE, FOLLOW ME. <b>START</b> pauses.</p>
  <p style="margin-top:.4em"><b>Tricks:</b> folk hidden in wheat or brush strike for double damage. Folk near you hit harder and never run. Fire spreads through wheat. Pikes stop horses.</p>
  <p style="margin-top:.4em"><b>You lose</b> if Wat falls, if your whole band falls, or if what you must protect is destroyed. Then try the battle again.</p>
  <p class="dim" style="margin-top:.5em;text-align:center">A or B to go back</p></div>`},draw:t=>drawTitleScene(t),btn(b){if(b==='a'||b==='b'||b==='start'){AU.sfx('tick');back()}}})}

/* ---------- story ---------- */
function talk(lines,done,scene){let i=0,shown=0,full='';
  const draw=()=>{const[who,text]=lines[i];full=text;UI.innerHTML=`<div class="panel dlg${who?'':' narr'}">${who?`<span class="who">${esc(who)}</span>`:''}<p id="dlgt"></p><i class="more"></i></div>`;shown=0};
  setScreen('dialog',{enter:draw,update(dt){if(shown<full.length){shown=Math.min(full.length,shown+dt*70);const e=document.getElementById('dlgt');if(e)e.textContent=full.slice(0,shown|0)}},
    draw:scene,btn(b){if(b==='start'){done();return}if(b!=='a'&&b!=='b')return;if(shown<full.length){shown=full.length;const e=document.getElementById('dlgt');if(e)e.textContent=full;return}
      i++;AU.sfx('tick');if(i>=lines.length)done();else draw()}})}
function actCard(a,done){const A=ACTS[a];let t0=0;setScreen('act',{enter(){UI.innerHTML=`<div class="act fadein"><small>ACT ${A.n}</small><h2>${esc(A.name)}</h2><p>${esc(A.sub)}</p></div>`},
  update(dt){t0+=dt;if(t0>3.2)done()},draw:t=>{ctx.fillStyle='#0c0806';ctx.fillRect(0,0,W,H)},btn(b){if((b==='a'||b==='start')&&t0>.6)done()}})}
function battleScene(idx){return t=>drawCampScene(t)}
function startStory(){actCard(0,()=>preStory())}
function preStory(){const sp=BATTLES[G.stage];AU.play('camp');talk(sp.pre,()=>{G.seenPre=G.stage;save();toCamp()},t=>drawCampScene(t))}

/* ---------- camp ---------- */
const TABS=['BRIEF','ARMORY','TRAPS','SCHEME','LEADER'];
function toCamp(){AU.play('camp');let tab=0,sel=0;const sp=BATTLES[G.stage];
  if(!SCHEMES[G.plan.scheme]||SCHEMES[G.plan.scheme].from>G.stage)G.plan.scheme='none';
  const rows=()=>{
    if(tab===0)return[{label:'March to battle!',right:'START',act:march}];
    if(tab===1)return avail(WEAPONS).sort((a,b)=>WORDER.indexOf(a)-WORDER.indexOf(b)).map(k=>({k,label:WEAPONS[k].name,count:G.folk[k]||0,cost:WEAPONS[k].cost,desc:WEAPONS[k].desc,w:1}));
    if(tab===2)return avail(TRAPS).sort((a,b)=>TORDER.indexOf(a)-TORDER.indexOf(b)).map(k=>({k,label:TRAPS[k].name,count:G.traps[k]||0,cost:TRAPS[k].cost,desc:TRAPS[k].desc,t:1}));
    if(tab===3)return avail(SCHEMES).sort((a,b)=>SORDER.indexOf(a)-SORDER.indexOf(b)).map(k=>({k,label:SCHEMES[k].name,cost:SCHEMES[k].cost,desc:SCHEMES[k].desc,s:1,on:G.plan.scheme===k}));
    return Object.keys(UPGRADES).map(k=>({k,label:UPGRADES[k].name,lvl:G.leader[k],cost:G.leader[k]>=4?null:UPGRADES[k].base*(G.leader[k]+1),desc:UPGRADES[k].desc,u:1}))};
  const draw=()=>{const R=rows();sel=clamp(sel,0,R.length-1);const r=R[sel];const pips=BATTLES.map((b,i)=>`<i class="${i<G.stage?'on':i===G.stage?'cur':''}"></i>`).join('');
    let body='';
    if(tab===0){body=`<div class="brief"><p>${esc(sp.brief)}</p><p class="obj">Goal: ${esc(goalText(sp))}</p><ul>${sp.tips.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`+R.map((x,i)=>`<div class="item${i===sel?' sel':''}"><span class="gold">${esc(x.label)}</span><span class="r">${x.right}</span></div>`).join('')}
    else body=R.map((x,i)=>{let right='';
      if(x.w)right=`<span class="r">×${x.count}</span><span class="c">${x.k==='stones'?'free':'◆'+x.cost}</span>`;
      else if(x.t)right=`<span class="r">owned ${x.count}</span><span class="c">◆${x.cost}</span>`;
      else if(x.s)right=`<span class="r">${x.on?'<span class="green">✓ chosen</span>':''}</span><span class="c">${x.cost?'◆'+x.cost:'free'}</span>`;
      else right=`<span class="r">${'★'.repeat(x.lvl)}${'☆'.repeat(4-x.lvl)}</span><span class="c">${x.cost==null?'max':'◆'+x.cost}</span>`;
      return `<div class="item${i===sel?' sel':''}${(x.cost!=null&&x.cost>G.plunder&&!x.on)?' dis':''}">${esc(x.label)}${right}</div>`}).join('');
    let info='';if(tab===1)info=`${esc(r.desc)}<br><span class="dim">Unarmed folk: ${G.folk.stones||0}. Arming one costs ◆${r.cost}. ◀ returns a weapon for half.</span>`;
    else if(tab===2)info=`${esc(r.desc)}<br><span class="dim">Traps you don't spring are kept for the next battle.</span>`;
    else if(tab===3)info=`${esc(r.desc)}<br><span class="dim">One scheme per battle, paid when you march.</span>`;
    else if(tab===4)info=`${esc(r.desc)}<br><span class="dim">Wat: ${leaderStats().hp} health, ${leaderStats().dmg} damage${G.flags.blade?' (Roderick\'s blade)':''}.</span>`;
    else info=`<span class="dim">Your band: ${bandText()}.<br>Traps: ${trapText()}. Scheme: ${SCHEMES[G.plan.scheme].name}.</span>`;
    UI.innerHTML=`<div class="panel camp"><div class="chead"><b>${esc(sp.name)}</b><span class="pips">${pips}</span><span class="r"><span class="gold">◆ ${G.plunder}</span> plunder · ${folkCount()} folk</span></div>
      <div class="tabs">${TABS.map((x,i)=>`<span class="${i===tab?'on':''}">${x}</span>`).join('')}</div>
      <div class="clist">${body}</div><div class="cinfo">${info}</div>
      <div class="chint">▲▼ choose · ${tab===0?'A march':tab===3?'A choose':'▶/A buy · ◀/B sell'} · SELECT next tab · START march!</div></div>`};
  const act=(b)=>{const R=rows(),r=R[sel];if(!r)return;
    if(tab===0){if(b==='a')march();return}
    if(tab===1){if(r.k==='stones')return AU.sfx('no');
      if(b==='a'||b==='right'){if((G.folk.stones||0)<1){toastMsg('No unarmed folk left to arm.');return AU.sfx('no')}if(G.plunder<r.cost){toastMsg('Not enough plunder.');return AU.sfx('no')}G.plunder-=r.cost;G.folk.stones--;G.folk[r.k]=(G.folk[r.k]||0)+1;AU.sfx('buy')}
      else{if(!(G.folk[r.k]>0))return AU.sfx('no');G.folk[r.k]--;G.folk.stones=(G.folk.stones||0)+1;G.plunder+=Math.floor(r.cost/2);AU.sfx('coin')}}
    else if(tab===2){if(b==='a'||b==='right'){if(G.plunder<r.cost){toastMsg('Not enough plunder.');return AU.sfx('no')}G.plunder-=r.cost;G.traps[r.k]=(G.traps[r.k]||0)+1;AU.sfx('buy')}
      else{if(!(G.traps[r.k]>0))return AU.sfx('no');G.traps[r.k]--;G.plunder+=Math.floor(r.cost/2);AU.sfx('coin')}}
    else if(tab===3){if(b==='a'||b==='right'){if(r.cost>G.plunder){toastMsg('Not enough plunder.');return AU.sfx('no')}G.plan.scheme=r.k;AU.sfx('pick')}else if(b==='left'||b==='b'){G.plan.scheme='none';AU.sfx('tick')}}
    else if(tab===4){if(b==='a'||b==='right'){if(r.cost==null||G.plunder<r.cost){toastMsg(r.cost==null?'Already at its best.':'Not enough plunder.');return AU.sfx('no')}G.plunder-=r.cost;G.leader[r.k]++;AU.sfx('buy')}}
    save();draw()};
  const march=()=>{const sc=SCHEMES[G.plan.scheme];if(sc.cost>G.plunder){G.plan.scheme='none'}
    SNAP=JSON.stringify(G);G.plunder-=SCHEMES[G.plan.scheme].cost;G.stats.tries++;AU.sfx('horn');toDeploy()};
  setScreen('camp',{enter:draw,draw:t=>drawCampScene(t),btn(b){
    if(b==='select'){tab=(tab+1)%TABS.length;sel=0;AU.sfx('tick');draw();return}
    if(b==='start'){march();return}
    if(b==='up'||b==='down'){const n=rows().length;sel=(sel+(b==='up'?n-1:1))%n;AU.sfx('tick');draw();return}
    if(tab===0&&(b==='left'||b==='right')){tab=b==='right'?1:TABS.length-1;sel=0;AU.sfx('tick');draw();return}
    if(b==='b'&&tab!==0&&tab!==3&&tab!==4){act('left');return}
    if(b==='b'&&tab===4){tab=0;sel=0;draw();return}
    if(b==='a'||b==='left'||b==='right'||b==='b')act(b)}})}
function toastMsg(s){const e=document.createElement('div');e.className='warn';e.textContent=s;UI.appendChild(e);setTimeout(()=>e.remove(),1100)}
function bandText(){const p=WORDER.filter(k=>G.folk[k]>0).map(k=>G.folk[k]+' '+WEAPONS[k].name.toLowerCase());return p.join(', ')||'nobody'}
function trapText(){const p=TORDER.filter(k=>G.traps[k]>0).map(k=>G.traps[k]+' '+TRAPS[k].name.toLowerCase());return p.join(', ')||'none'}
function goalText(s){if(s.win==='rout')return s.exitLimit?`Destroy the column. Lose if ${s.exitLimit} of them get through.`:'Drive out every enemy.';
  if(s.win==='survive')return `Keep ${s.protect.name.toLowerCase()} standing for ${s.time} seconds.`;
  if(s.win==='boss')return `Defeat ${FOES[s.boss.t].name}.`;if(s.win==='hold')return `Stand in the gold square for ${s.hold.need} seconds.`;
  if(s.win==='escort')return 'Get the cart to the far side of the valley.';return ''}

/* ---------- deploy and battle ---------- */
function toDeploy(){startDeploy(G.stage);AU.play('camp');
  setScreen('deploy',{enter(){UIX.deployHud()},update(dt){updateDeploy(dt);updateBattle(dt);UIX.deployHud(true)},draw:t=>drawDeploy(t),btn(b){deployBtn(b)}})}
const UIX={
  deployHud(upd){if(!DEP)return;const it=DEP.items[DEP.sel];const k=it.k+it.sel+DEP.sel+(DEP.warn?DEP.warn.s:'')+(it.tile?it.tile.join():'');if(upd&&UIX._dk===k)return;UIX._dk=k;
    const sp=B.spec;const n=DEP.items.length;
    UI.innerHTML=`<div class="panel dtop"><span class="gold">${esc(sp.name)}</span> · ${esc(goalText(sp))}</div>
      <div class="panel dbar"><b>${DEP.sel+1}/${n} · ${esc(ITEM_NAME(it))}</b><span class="dim">${it.k==='trap'?'Set it where foes will walk.':it.k==='leader'?'Where you start.':'Hidden in wheat or brush = ambush!'}</span>
      <span class="r">A move here · SELECT/B next<br><span class="gold">START fight!</span></span></div>${DEP.warn?`<div class="warn">${esc(DEP.warn.s)}</div>`:''}`},
  battleHud(){setScreen('battle',{enter(){UI.innerHTML=`<div class="hud"><div class="hp"><b>WAT</b><div class="bar"><i id="hpb"></i></div><span class="ord" id="ord">HOLD</span></div>
      <div class="goal" id="goal"></div><div class="stat" id="stat"></div></div><div class="bossbar" id="boss" hidden></div><div id="ban"></div><div class="hint" id="hint"></div>`;UIX._bk=''},
    update(dt){updateBattle(dt);UIX.hud();if(B.state!=='fight'&&B.endT>2.2){if(B.state==='won')resultWin();else resultLose()}},
    draw:t=>drawBattle(t),btn(b){if(b==='start'){pauseMenu();return}leaderInput(b)}})},
  hud(){const L=B.leader,s=B.spec;const q=id=>document.getElementById(id);if(!q('hpb'))return;
    q('hpb').style.width=Math.max(0,L.hp/L.max*100)+'%';const o=q('ord');if(o.dataset.o!==B.order){o.dataset.o=B.order;o.className='ord '+B.order;o.textContent=ORDER_NAME[B.order]}
    let gl='',bar=null;
    if(s.win==='survive'){gl=`${esc(B.obj.name)} · <span class="gold">${Math.max(0,Math.ceil(s.time-B.time))}s</span> till dawn`;bar=B.obj.hp/B.obj.max}
    else if(s.win==='hold'){gl=B.hold.active?'<span class="gold">Burning the rolls...</span>':'Stand in the gold square!';bar=B.hold.prog/B.hold.need}
    else if(s.win==='escort'){gl=B.cart.why?esc(B.cart.why):'The cart rolls on';bar=B.cart.hp/B.cart.max}
    else if(s.win==='boss'){gl='Defeat '+esc(FOES[s.boss.t].name)}
    else{const n=B.units.filter(u=>u.alive&&u.side==='e').length+B.queue.length+B.waves.filter(w=>!w.done).reduce((a,w)=>a+Object.values(w.u).reduce((x,y)=>x+y,0),0);gl=`Foes left: <span class="gold">${n}</span>`+(s.exitLimit?` · Got through: <span class="red">${B.escaped}/${s.exitLimit}</span>`:'')}
    const gk=gl+(bar==null?'':Math.round(bar*100));if(gk!==UIX._gk){UIX._gk=gk;q('goal').innerHTML=gl+(bar==null?'':`<div class="bar obj"><i style="width:${clamp(bar,0,1)*100}%"></i></div>`)}
    const folk=B.units.filter(u=>u.alive&&u.side==='p'&&!u.isLeader).length;const st=`${folk} folk<br><span class="gold">◆${B.plunder}</span>`;if(st!==UIX._st){UIX._st=st;q('stat').innerHTML=st}
    const bs=B.boss;const be=q('boss');if(bs&&(bs.state!=='idle'||bs.hp<bs.max)&&bs.alive){be.hidden=false;const k='b'+Math.round(bs.hp);if(be.dataset.k!==k){be.dataset.k=k;be.innerHTML=`${esc(bs.d.name)}<div class="bar boss"><i style="width:${bs.hp/bs.max*100}%"></i></div>`}}else be.hidden=true;
    const bn=B.banner;const bk=bn?bn.text+(bn.big?1:0):'';if(bk!==UIX._bk){UIX._bk=bk;q('ban').innerHTML=bn?`<div class="banner${bn.small?' small':''}${bn.order?' order':''}${bn.big?' big':''}${bn.bad?' bad':''}">${esc(bn.text)}</div>`:''}
    const h=G.stage===0&&B.time<14&&B.state==='fight'?'A strike · B roll · SELECT give orders (HOLD → CHARGE → FOLLOW)':(B.time<6&&B.state==='fight'&&s.tips?esc(s.tips[0]):'');
    if(h!==UIX._h){UIX._h=h;q('hint').textContent=h}}
};
function pauseMenu(){let sel=0;const prev=SCR;const items=[{label:'Resume',act:()=>{resume()}},{label:'Restart battle',act:()=>{retry()}},{label:'Retreat to camp',act:()=>{G=JSON.parse(SNAP);save();toCamp()}},{label:()=>'Sound: '+(AU.muted?'off':'on'),act:()=>{AU.toggleMute();draw()}}];
  const draw=()=>{const old=document.getElementById('pz');if(old)old.remove();const d=document.createElement('div');d.id='pz';d.className='panel res';
    d.innerHTML=`<h2>Paused</h2><div class="menu">${items.map((it,i)=>`<div class="item${i===sel?' sel':''}">${esc(typeof it.label==='function'?it.label():it.label)}</div>`).join('')}</div>`;UI.appendChild(d)};
  const resume=()=>{const e=document.getElementById('pz');if(e)e.remove();MODE='battle';SCR=prev};
  MODE='pause';SCR={draw:t=>drawBattle(t),btn(b){if(b==='start'||b==='b'){resume();return}if(b==='up'||b==='down'){sel=(sel+(b==='up'?3:1))%4;AU.sfx('tick');draw()}else if(b==='a'){AU.sfx('pick');items[sel].act()}}};draw()}
function retry(){G=JSON.parse(SNAP);SNAP=JSON.stringify(G);G.plunder-=SCHEMES[G.plan.scheme].cost;G.stats.tries++;toDeploy()}
function resultLose(){let sel=0;const items=[{label:'Try again',act:retry},{label:'Back to camp',act:()=>{G=JSON.parse(SNAP);save();toCamp()}}];
  const draw=()=>{UI.innerHTML=`<div class="panel res"><h2 class="bad">Defeat</h2><p style="text-align:center">${esc(B.loseWhy||'')}</p><p class="dim" style="text-align:center;margin-top:.4em">Nothing is lost: try the battle again, or change your plan at camp.</p>
    <div class="menu">${items.map((it,i)=>`<div class="item${i===sel?' sel':''}">${esc(it.label)}</div>`).join('')}</div></div>`};
  setScreen('result',{enter:draw,update(dt){updateBattle(dt)},draw:t=>drawBattle(t),btn(b){if(b==='up'||b==='down'){sel=1-sel;AU.sfx('tick');draw()}else if(b==='a'||b==='start'){AU.sfx('pick');items[sel].act()}}})}
function applyWin(){const sp=B.spec;
  // what the battle cost and earned
  let lost=0;const lostTxt=[];for(const[k,n]of Object.entries(B.fallen)){G.folk[k]=Math.max(0,(G.folk[k]||0)-n);lost+=n;lostTxt.push(n+' '+WEAPONS[k].name.toLowerCase())}
  for(const[k,n]of Object.entries(B.usedTraps))G.traps[k]=Math.max(0,(G.traps[k]||0)-n);
  const gain=sp.reward+B.plunder;G.plunder+=gain;G.folk.stones=(G.folk.stones||0)+sp.recruits;if(sp.gift)G.flags[sp.gift]=1;
  G.stats.kills+=B.kills;G.stats.fallen+=lost;G.stats.won++;G.stage++;G.plan.scheme='none';save();
  return{lost,lostTxt,gain}}
function resultWin(){const sp=B.spec;const{lost,lostTxt,gain}=applyWin();
  const next=G.stage;const unl=[];if(next<BATTLES.length){for(const o of[WEAPONS,TRAPS,SCHEMES])for(const k in o)if(o[k].from===next)unl.push(o[k].name)}
  UI.innerHTML=`<div class="panel res"><h2>Victory!</h2><div class="row"><span>${esc(sp.name)}</span><span class="dim">battle ${next} of 12</span></div>
    <div class="row"><span>Foes beaten</span><span>${B.kills}</span></div><div class="row"><span>Folk lost</span><span class="${lost?'red':'green'}">${lost?esc(lostTxt.join(', ')):'none!'}</span></div>
    <div class="row"><span>Plunder</span><span class="gold">+◆${gain}</span></div>${sp.recruits?`<div class="row"><span>New recruits</span><span class="green">+${sp.recruits} folk</span></div>`:''}
    ${unl.length?`<div class="unl">New at camp: ${esc(unl.join(', '))}</div>`:''}<p class="dim" style="text-align:center;margin-top:.5em">A to continue</p></div>`;
  MODE='result';SCR={update(dt){updateBattle(dt)},draw:t=>drawBattle(t),btn(b){if(b==='a'||b==='start'){AU.sfx('pick');afterWin(sp)}}}}
function afterWin(sp){AU.play('camp');talk(sp.post,()=>{
  if(G.stage>=BATTLES.length){chooseEnding();return}
  const nb=BATTLES[G.stage];const go=()=>preStory();if(nb.act!==sp.act)actCard(nb.act,go);else go()},t=>drawCampScene(t))}

/* ---------- ending ---------- */
function chooseEnding(){let sel=0;AU.play('title');const draw=()=>{UI.innerHTML=`<div class="panel end"><h2>What comes after the king?</h2>${ENDINGS.map((e,i)=>`<div class="item${i===sel?' sel':''}"><span>${esc(e.name)}<br><small>${esc(e.sub)}</small></span></div>`).join('')}</div>`};
  setScreen('ending',{enter:draw,draw:t=>drawTitleScene(t),btn(b){if(b==='up'||b==='down'){sel=(sel+(b==='up'?2:1))%3;AU.sfx('tick');draw()}else if(b==='a'){const e=ENDINGS[sel];G.done=true;G.ending=e.k;save();AU.sfx('win');
    talk(e.text.map(x=>['',x]),()=>credits(e),t=>drawEndScene(t))}}})}
function credits(e){setScreen('credits',{enter(){UI.innerHTML=`<div class="panel res"><h2>${esc(e.name)}</h2><p style="text-align:center">The revolt is won.</p>
  <div class="row" style="margin-top:.5em"><span>Battles won</span><span>${G.stats.won}</span></div><div class="row"><span>Attempts</span><span>${G.stats.tries}</span></div>
  <div class="row"><span>Foes beaten</span><span>${G.stats.kills}</span></div><div class="row"><span>Folk who fell for the cause</span><span>${G.stats.fallen}</span></div>
  <p class="dim" style="text-align:center;margin-top:.6em">Thank you for playing Pitchfork Rising.<br>A to return to the title</p></div>`},draw:t=>drawEndScene(t),btn(b){if(b==='a'||b==='start')titleScreen()}})}
