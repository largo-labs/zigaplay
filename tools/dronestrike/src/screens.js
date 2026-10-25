/* ===================== SCREENS ===================== */
const meter=(n,max=3,cls='on')=>`<span class="meter">${Array.from({length:max},(_,i)=>`<i class="${i<n?cls:''}"></i>`).join('')}</span>`;
const fitBars=n=>`<span class="meter">${[0,1,2].map(i=>`<i class="${i<n?(n>=3?'grn':'on'):''}"></i>`).join('')}</span>`;
function frontBar(){const need=CAMP_NEED,max=Math.max(need+2,5);let h='';for(let i=0;i<max;i++)h+=`<i class="${i<S.front?'us':''}"></i>`;
  return`<div class="front">${S.front<0?`<span class="red small">${S.front}</span>`:''}${h}</div><div class="small dim" style="margin-top:.1rem">Front points: ${S.front} of ${need}. Battle ${Math.min(S.battle+1,5)} of 5.</div>`}
function header(s,title){const b=el('div','bar',`<b>${esc(title)}</b><span>${money(S.funds)} · ★${S.prestige}</span>`);s.el.appendChild(b);return b}

/* ---------- title ---------- */
let titleRaf=0;
function titleScreen(){const s=screen('title',{cls:''});s.el.id='title';
  const cv=el('canvas');cv.style.cssText='position:absolute;inset:0;width:100%;height:100%';s.el.appendChild(cv);
  const top=el('div','');top.style.cssText='position:relative;margin-top:22%;display:flex;flex-direction:column;gap:.4rem';top.innerHTML='<h1>DRONE<br>STRIKE</h1><div class="sub">DEFENSE OF VARNA</div>';s.el.appendChild(top);
  const box=el('div','panel');box.style.cssText='position:relative;margin:auto auto 18%;width:72%';const list=el('div','list');box.appendChild(list);s.el.appendChild(box);
  const sv=loadSave();
  row(s,list,'NEW WAR',{cls:'btn',a:async()=>{if(sv&&!(await confirmNew()))return;go(introScreen)}});
  row(s,list,'CONTINUE',{cls:'btn',off:!sv,a:()=>{S=loadSave();go(S.won?victoryScreen:hq)}});
  row(s,list,'SETTINGS',{cls:'btn',a:()=>settingsScreen(titleScreen)});
  const foot=el('div','hint','A ZigaPlay cartridge');foot.style.cssText+=';position:absolute;bottom:.4rem;left:0;right:0';s.el.appendChild(foot);
  s.start0=sv?1:0;
  s.enter=()=>{AU.music('title');const g=cv.getContext('2d');const blips=Array.from({length:14},()=>[Math.random()*6.28,.2+Math.random()*.75]);
    const draw=t=>{if(SCR!==s)return;const W=cv.width=cv.clientWidth,H=cv.height=cv.clientHeight;const cx=W/2,cy=H*.55,R=Math.min(W,H)*.48;
      g.fillStyle='#050905';g.fillRect(0,0,W,H);g.strokeStyle='rgba(147,228,108,.18)';g.lineWidth=1;for(let i=1;i<=4;i++){g.beginPath();g.arc(cx,cy,R*i/4,0,7);g.stroke()}
      g.beginPath();g.moveTo(cx-R,cy);g.lineTo(cx+R,cy);g.moveTo(cx,cy-R);g.lineTo(cx,cy+R);g.stroke();const a=t/1400%(Math.PI*2);
      const gr=g.createConicGradient?g.createConicGradient(a-1,cx,cy):null;if(gr){gr.addColorStop(0,'rgba(147,228,108,0)');gr.addColorStop(.16,'rgba(147,228,108,.28)');gr.addColorStop(.161,'rgba(147,228,108,0)');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,R,0,7);g.fill()}
      g.strokeStyle='rgba(147,228,108,.7)';g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);g.stroke();
      for(const [ba,br] of blips){const d=((a-ba)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);const al=Math.max(0,1-d/2.5);if(al<=0)continue;g.fillStyle=`rgba(255,85,69,${al})`;g.fillRect(cx+Math.cos(ba)*R*br-2,cy+Math.sin(ba)*R*br-2,4,4)}
      titleRaf=requestAnimationFrame(draw)};titleRaf=requestAnimationFrame(draw)};
  s.leave=()=>cancelAnimationFrame(titleRaf);
  show(s)}
async function confirmNew(){return(await choose('Start a new war? Your saved war will be overwritten.',['Start over','Keep my save'],{cancel:1}))===0}
function settingsScreen(back,quit){const s=screen('settings');header2(s,'SETTINGS');const p=el('div','panel');const list=el('div','list');p.appendChild(list);s.el.appendChild(p);
  const m=row(s,list,'',{a:()=>{AU.setMusic(!AU.musicOn);saveSettings();upd()}}),f=row(s,list,'',{a:()=>{AU.setSfx(!AU.sfxOn);saveSettings();upd()}});
  if(quit)row(s,list,'Quit to title <span class="r">your war is saved</span>',{a:()=>{save();go(titleScreen)}});
  s.el.appendChild(el('div','grow'));const l2=el('div','list');s.el.appendChild(l2);row(s,l2,'DONE',{cls:'primary',a:()=>back()});
  const upd=()=>{m.el.innerHTML=`Music <span class="r">${AU.musicOn?'ON':'OFF'}</span>`;f.el.innerHTML=`Sound <span class="r">${AU.sfxOn?'ON':'OFF'}</span>`};upd();
  s.keys=[['A','Change'],['B','Done']];s.back=()=>back();show(s)}
function header2(s,title){s.el.appendChild(el('div','bar',`<b>${esc(title)}</b><span></span>`))}

/* ---------- the story so far ---------- */
async function introScreen(){const s=screen('intro');s.el.appendChild(el('div','grow'));show(s);AU.music('tension');
  for(const t of STORY.intro)await msg(t);
  nameScreen()}
function nameScreen(){const s=screen('name');header2(s,'NAME YOUR UNIT');
  const p=el('div','panel');p.innerHTML='<h3>CALLSIGN</h3>';const big=el('div','');big.style.cssText='font-size:1.7rem;color:var(--amber);text-align:center;padding:.6rem 0;min-height:2.6rem;letter-spacing:.04em';p.appendChild(big);
  const sub=el('div','small dim','');sub.style.textAlign='center';p.appendChild(sub);s.el.appendChild(p);
  const list=el('div','list');s.el.appendChild(list);
  const names=[genName()];let ni=0;const cur=()=>names[ni];
  const nm=row(s,list,'',{l:()=>{ni=(ni-1+names.length)%names.length;draw();AU.play('tick')},r:()=>{ni++;if(ni>=names.length)names.push(genName());draw();AU.play('tick')}});
  row(s,list,'EDIT LETTERS',{a:()=>editName(cur(),v=>{names[ni]=v;draw()})});
  row(s,list,'CONFIRM',{cls:'primary',a:async()=>{S=newState(cur());S.checkpoint=null;save();await go(campaignIntro)}});
  const draw=()=>{big.textContent=cur();nm.el.innerHTML=`<span>◀ Suggest another ▶</span><span class="r">${ni+1}</span>`;sub.textContent='Press ◀ or ▶ for another name, or choose Edit Letters to write your own.'};draw();
  s.keys=[['◀▶','Other names'],['A','Select'],['B','Back']];s.back=()=>go(titleScreen);show(s)}
function editName(v,done){const CH=" ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'\".&";let a=(v.toUpperCase()+' '.repeat(20)).slice(0,20).split('');let c=0;
  const o=overlay(`<h3>EDIT CALLSIGN</h3><div class="ed" style="font-size:1.35rem;letter-spacing:.06em;white-space:pre;color:var(--amber)"></div><div class="small dim">▲▼ letter · ◀▶ move · A done · B cancel</div>`);const ed=o.querySelector('.ed');
  const draw=()=>{ed.innerHTML=a.map((ch,i)=>i===c?`<span style="background:var(--amber);color:#000">${ch===' '?'_':esc(ch)}</span>`:esc(ch)).join('')};draw();
  const L={key(b){if(b==='left'){c=Math.max(0,c-1)}else if(b==='right'){c=Math.min(19,c+1)}else if(b==='up'||b==='down'){const i=CH.indexOf(a[c]);a[c]=CH[(i+(b==='up'?1:-1)+CH.length)%CH.length]}
      else if(b==='a'||b==='start'){const out=a.join('').trim().replace(/\s+/g,' ');layers.splice(layers.indexOf(L),1);o.remove();if(out)done(out);AU.play('ok');return}
      else if(b==='b'){layers.splice(layers.indexOf(L),1);o.remove();AU.play('back');return}AU.play('tick');draw()}};layers.push(L)}

/* ---------- hangar: A buys one, ◀ takes back a purchase made on this visit ---------- */
function hangar(){const s=screen('hangar');const hd=header(s,'HANGAR');
  const box=el('div','panel grow scroll');const list=el('div','list');box.appendChild(list);s.el.appendChild(box);
  const bought={};const types=DRONE_ORDER.filter(unlocked);
  const buy=d=>{if(costOf(d)>S.funds){AU.play('buzz');toast('Not enough funds');return}S.funds-=costOf(d);S.stock[d]=(S.stock[d]||0)+1;bought[d]=(bought[d]||0)+1;AU.play('cash');save();upd()};
  const undo=d=>{if(!bought[d]){AU.play('buzz');return}S.funds+=costOf(d);S.stock[d]--;bought[d]--;AU.play('tick');save();upd()};
  const rows=types.map(d=>row(s,list,'',{d,a:()=>buy(d),r:()=>buy(d),l:()=>undo(d)}));
  const lst=el('div','list');s.el.appendChild(lst);row(s,lst,'DONE',{cls:'primary',a:()=>go(hq)});
  const upd=()=>{hd.querySelector('span').innerHTML=`${money(S.funds)} · ★${S.prestige}`;
    rows.forEach(it=>{const d=it.d,n=bought[d]||0;it.el.innerHTML='';it.el.appendChild(dIcon(d));
      it.el.insertAdjacentHTML('beforeend',`<span style="flex:1">${DRONES[d].name}${n?` <span class="grn">+${n}</span>`:''}</span><span class="r">own ${S.stock[d]||0}</span><span class="amb" style="width:2.6rem;text-align:right">${money(costOf(d))}</span>`);
      it.el.classList.toggle('off',costOf(d)>S.funds)})};upd();
  s.select=()=>{const it=s.items[s.i];if(it.d)report(droneInfo(it.d),'OK')};
  s.keys=[['A','Buy one'],['◀','Undo'],['SELECT','Info'],['B','Done']];
  s.back=()=>go(hq);show(s);
  if(S.camp===0&&S.battle===1&&!S.seen.hangTip){S.seen.hangTip=1;coach(s,'Each press of A buys one drone and puts it straight into stock.')}}
function droneInfo(d){const D=DRONES[d];const best=Object.entries(D.atk).sort((a,b)=>b[1]-a[1]).filter(([,v])=>v>=6).slice(0,3).map(([c])=>CATS[c].toLowerCase());
  const reach=['the front line','the front line and the rear','anywhere, even the deep rear'][D.range];
  return`<h3>${D.name.toUpperCase()}</h3><div><span class="tag">${D.exp?'ONE-WAY':'COMES HOME'}</span>${D.slots>1?`<span class="tag">${D.slots} SLOTS</span>`:''} <span class="amb">${money(costOf(d))}</span></div><div style="margin-top:.2rem">${D.desc}</div><div class="dim" style="margin-top:.2rem">Reaches ${reach}.${best.length?` Best against ${best.join(', ').replace(/, ([^,]*)$/,' and $1')}.`:''}</div>`}

/* ---------- research: the open tiers, a look at the next one, and one recommendation ---------- */
function recommend(){const g=general(),ad=adaptation();const pri=[];
  if(S.camp===0)pri.push('decoy');if(g.ew||ad.ew)pri.push('hop','fiber','auto');if(g.dr)pri.push('intercept');if(g.aa>2)pri.push('hunter');if(S.camp===1)pri.push('hop');
  pri.push('loiter','crew1','decoy','pay1','longr','crew2','hop','crew3','hunter','thermal','intercept','workshop','hexa','recovery','fiber','naval','pay2','auto','intel','crew4','ucav','pay3');
  for(const id of pri){const r=RESEARCH.find(x=>x.id===id);if(r&&!has(id)&&r.tier<=rankIdx())return id}return null}
function research(){const s=screen('research');const hd=header(s,'RESEARCH');
  const box=el('div','panel grow scroll');const list=el('div','list');box.appendChild(list);s.el.appendChild(box);const desc=el('div','panel desc');s.el.appendChild(desc);
  const rk=rankIdx(),rec=recommend();
  for(let t=0;t<=Math.min(3,rk);t++){const todo=RESEARCH.filter(x=>x.tier===t&&!has(x.id));if(!todo.length)continue;
    const h=el('div','small amb',`TIER ${t+1}`);h.style.margin='.15rem 0 0 .2rem';list.appendChild(h);
    for(const r of todo)row(s,list,`<span>${r.name}${r.id===rec?' <span class="tag grn">ADVISED</span>':''}</span><span class="${r.cost>S.funds?'r':'amb'}">${money(r.cost)}</span>`,{r,off:r.cost>S.funds,offMsg:'Not enough funds',
        a:async()=>{S.funds-=r.cost;S.research[r.id]=1;AU.play('research');if(r.unlock){S.stock[r.unlock]=(S.stock[r.unlock]||0)+(DRONES[r.unlock].cost<10?4:1);toast(`${r.name}: prototypes in the hangar`)}else toast(`${r.name} complete`);save();research()}})}
  const nx=RANKS[rk+1];if(nx&&rk<3){const names=RESEARCH.filter(x=>x.tier===rk+1).map(x=>x.name);
    list.appendChild(el('div','small dim',`<div style="margin:.3rem .2rem 0">TIER ${rk+2} opens at ${nx[0]} (★${nx[1]}): ${names.join(', ')}.</div>`))}
  const done=RESEARCH.filter(x=>has(x.id)).map(x=>x.name);if(done.length)list.appendChild(el('div','small dim',`<div style="margin:.3rem .2rem 0">Done: ${done.join(', ')}.</div>`));
  const lst=el('div','list');s.el.appendChild(lst);row(s,lst,'DONE',{cls:'primary',a:()=>go(hq)});
  s.onFocus=it=>{desc.innerHTML=it.r?`<span class="amb">${it.r.name}</span><br>${it.r.desc}`+(it.r.unlock?` <span class="dim">${DRONES[it.r.unlock].desc}</span>`:''):`You have ${money(S.funds)} to spend.`};
  s.keys=[['A','Research'],['B','Done']];
  s.back=()=>go(hq);show(s,{keep:true});if(S.camp===0&&S.battle===1&&!has('decoy'))coach(s,'Decoy Swarm is marked ADVISED. Select it and press A.')}

/* ---------- records ---------- */
function records(){const s=screen('records');header(s,'RECORDS');const st=S.stats;
  const p=el('div','panel',`<h3>${esc(S.unit.toUpperCase())}</h3><div class="small">Rank: ${rankName()}. Battles fought: ${st.battles}, won: ${st.wins}.<br>Targets destroyed: ${st.kills}. Drones used up: ${st.spent}. Drones lost: ${st.lost}.</div>`);s.el.appendChild(p);
  const ad=adaptation();const a=el('div','panel',`<h3>HOW THE ENEMY IS ADAPTING</h3><div class="small">${ad.notes.length?ad.notes.map(esc).join('<br>'):'The enemy has not adapted yet. If you rely too much on one drone, they will.'}</div>`);s.el.appendChild(a);
  const box=el('div','panel grow scroll');box.innerHTML='<h3>DRONE CODEX</h3>';const list=el('div','list');box.appendChild(list);s.el.appendChild(box);
  for(const d of DRONE_ORDER){const u=unlocked(d);const it=row(s,list,`<span style="flex:1">${u?DRONES[d].name:'??? (not researched)'}</span>`,{d:u?d:null,a:()=>{if(u)report(droneInfo(d),'OK')}});if(u)it.el.prepend(dIcon(d))}
  const lst=el('div','list');s.el.appendChild(lst);row(s,lst,'DONE',{cls:'primary',a:()=>go(hq)});
  s.keys=[['A','Info'],['B','Done']];s.back=()=>go(hq);show(s)}

/* ---------- tutorial prompts: one short line on top of a screen, gone once you do it ---------- */
const tutorial=()=>!S.seen.tutDone&&S.camp===0&&S.battle===0;
function coach(s,text){let c=s.el.querySelector('.coach');if(!text){if(c)c.remove();return}if(!c){c=el('div','coach','');s.el.insertBefore(c,s.el.children[1]||null)}c.textContent=text}
function unitPic(type,px=28){const c=mk(px*2,px*2);const g=c.getContext('2d');unitSymbol(g,{type,cat:UNITS[type].cat,hp:1,max:1,prim:0},px,px,px*.62);c.style.cssText=`width:${px}px;height:${px}px;flex:0 0 auto`;return c}
const FIT=[['No use','dim'],['Poor','dim'],['OK','amb'],['Good','grn']];

/* ---------- a new front: the enemy commander first, then a word from your CO ---------- */
async function campaignIntro(){const g=general();S.checkpoint=null;S.checkpoint=JSON.stringify(S);save();
  if(S.camp===2&&!S.seen.seaGift){S.seen.seaGift=1;S.research.naval=1;S.stock.naval=(S.stock.naval||0)+4;save()}
  const s=screen('dossier');header2(s,`FRONT ${S.camp+1} OF 5: ${g.front.toUpperCase()}`);
  const p=el('div','panel');p.innerHTML='<h3>ENEMY COMMANDER</h3>';const r=el('div','');r.style.cssText='display:flex;gap:.5rem';const pc=portrait(g.look);pc.className='port px';pc.style.width='5rem';pc.style.height='6.25rem';r.appendChild(pc);
  r.appendChild(el('div','',`<div class="amb" style="font-size:1.15rem">${esc(g.name)}</div><div class="red">${esc(g.nick)}</div><div class="desc" style="margin-top:.2rem">${esc(g.doc)}</div>`));p.appendChild(r);
  p.appendChild(el('div','msg',`<div style="margin-top:.4rem">${esc(g.quote)}</div>`));s.el.appendChild(p);
  s.el.appendChild(el('div','panel',`To hold this front, earn <span class="amb">${CAMP_NEED} points</span> in five battles: +1 for a win, +2 for a decisive win, and −1 for a failed mission.`));
  s.el.appendChild(el('div','grow'));const list=el('div','list');s.el.appendChild(list);
  const co=t=>msg(t,{who:STORY.co,port:portrait(CO_LOOK)});
  row(s,list,'CONTINUE',{cls:'primary',a:async()=>{if(s.busy)return;s.busy=true;await co(['Brask\'s tanks are crossing the northern plains. We have FPV drones and two recon planes. Let\'s put them to work.',
    'Vorst jams radio signals, and most drones fly by radio. Research ways around her jamming.',
    'Kessan is bringing a fleet to the southern coast. Our allies have sent Sea Drone plans and four prototypes. They are in your hangar.',
    'Okhrin has guns and drones everywhere. Break his air defense before anything else gets through.',
    'This is the last front: Dravik himself. He has studied everything you have done, so mix it up.'][S.camp]);go(hq)}});
  s.keys=[['A','Continue']];show(s);AU.music('tension')}

/* ---------- headquarters: built around the next mission; the rest appears once it is useful ---------- */
function hq(){const s=screen('hq');const g=general();
  s.el.appendChild(el('div','bar',`<b>${esc(S.unit.toUpperCase())}</b><span>${rankName()}</span>`));
  s.el.appendChild(el('div','status',`<span>Funds <span class="amb">${money(S.funds)}</span></span><span>Prestige <span class="amb">★${S.prestige}</span></span>`));
  const cp=el('div','panel');cp.innerHTML=`<h3>FRONT ${S.camp+1} OF 5: ${esc(g.front.toUpperCase())}</h3>`;const r=el('div','');r.style.cssText='display:flex;gap:.45rem;align-items:center';const pc=portrait(g.look);pc.className='port px';r.appendChild(pc);
  r.appendChild(el('div','',`<div class="amb">${esc(g.name)}</div><div class="red small">${esc(g.nick)}</div><div style="margin-top:.25rem">${frontBar()}</div>`));r.lastChild.style.flex='1';cp.appendChild(r);
  const list0=el('div','list');list0.style.marginTop='.35rem';cp.appendChild(list0);s.el.appendChild(cp);
  const stockTot=Object.values(S.stock).reduce((a,b)=>a+b,0);
  row(s,list0,`NEXT MISSION ▶`,{cls:'primary',a:()=>{if(!stockTot){toast('You have no drones. Buy some in the Hangar.');return}go(briefing)}});
  const list=el('div','list');s.el.appendChild(list);
  const open=S.battle>0||S.camp>0;
  if(open){row(s,list,`HANGAR <span class="r">${stockTot} drones in stock</span>`,{a:()=>go(hangar)});
    const can=RESEARCH.filter(x=>!has(x.id)&&x.tier<=rankIdx()&&x.cost<=S.funds).length;
    row(s,list,`RESEARCH ${can?`<span class="tag amb">${can} READY</span>`:''}`,{a:()=>go(research)});
    row(s,list,'RECORDS',{a:()=>go(records)})}
  row(s,list,'SETTINGS',{a:()=>settingsScreen(hq,true)});
  s.el.appendChild(el('div','grow'));
  const nxt=RANKS[rankIdx()+1];if(nxt&&open)s.el.appendChild(el('div','hint',`At ★${nxt[1]} you are promoted to ${nxt[0]}, which opens more research.`));
  s.keys=[['▲▼','Move'],['A','Select']];s.back=()=>{};show(s,{keep:true});AU.music('hq');save();
  if(tutorial())coach(s,'Press A on Next Mission to see your first target.');
  else if(S.camp===0&&S.battle===1&&!has('decoy'))coach(s,'You earned funds. Open Research and get Decoy Swarm: decoys draw anti-aircraft fire away from your drones.')}

/* ---------- briefing: the target area on the map, one sentence of orders, and only the threats that exist ---------- */
function briefing(){if(!S.mission){S.mission=genMission();save()}const m=S.mission,g=general();const s=screen('brief');
  s.el.appendChild(el('div','bar',`<b>BATTLE ${S.battle+1} OF 5</b><span class="red">${esc(g.name)}</span>`));
  const mb=el('div','mapbox');const cv=el('canvas');mb.appendChild(cv);s.el.appendChild(mb);
  const p=el('div','panel');p.style.flex='0 0 auto';s.el.appendChild(p);
  p.appendChild(el('h3','',`${esc(m.name.toUpperCase())}${m.final?' · <span class="red">FINAL BATTLE</span>':''}`));
  const grp={};let hid=0;for(const u of m.units.filter(u=>u.prim)){if(u.hidden){hid++;continue}grp[u.name]=(grp[u.name]||0)+1}
  const parts=Object.entries(grp).map(([nm,n])=>`${n} ${nm}${n>1&&!nm.endsWith("s")?"s":""}`);if(hid)parts.push(`${hid} hidden ${plural(hid,'target')}`);
  p.appendChild(el('div','',`Destroy the ★ targets: ${parts.join(', ').replace(/, ([^,]*)$/,' and $1')}.`));
  const chips=el('div','');chips.style.marginTop='.25rem';chips.innerHTML=threatChips(m);const cw=chips.firstChild;
  if(m.units.some(u=>u.prim&&u.depth===2))cw.insertAdjacentHTML('beforeend','<span class="chip amb">Deep targets: long range only</span>');
  cw.insertAdjacentHTML('beforeend',`<span class="chip">Pay ${money(m.reward)}</span>`);p.appendChild(chips);
  if(m.notes.length)p.appendChild(el('div','small amb',`<div style="margin-top:.2rem">${m.notes.map(esc).join(' ')}</div>`));
  const list=el('div','list');s.el.appendChild(list);row(s,list,'CHOOSE DRONES ▶',{cls:'primary',a:()=>go(loadout)});
  s.select=()=>targetList(m);
  s.keys=[['A','Choose drones'],['SELECT','Target list'],['B','HQ']];
  s.back=()=>go(hq);
  s.enter=()=>{const draw=t=>{if(SCR!==s)return;drawMap(cv,m,t);requestAnimationFrame(draw)};requestAnimationFrame(draw)};
  show(s);AU.music('tension');
  if(tutorial())coach(s,'Your targets are marked ★ on the map. Press A to choose your drones.')}
function drawMap(cv,m,t){const dpr=Math.min(2,window.devicePixelRatio||1);const W=Math.round(cv.clientWidth*dpr),H=Math.round(cv.clientHeight*dpr);if(!W||!H)return;
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}const g=cv.getContext('2d');
  g.drawImage(terrain(m,W,H),0,0);frontLine(g,W,H,t);baseIcon(g,W,H);const s=Math.max(9,Math.min(W,H*1.2)*.052);
  for(const u of m.units)unitSymbol(g,u,u.x*W,u.y*H,s,{t:t/16})}
function targetList(m){const w=el('div','');w.appendChild(el('h3','','WHAT INTEL CAN SEE'));const grp={};
  for(const u of m.units){const k=u.hidden?'?':u.type+(u.prim?'*':'');(grp[k]=grp[k]||{u,n:0}).n++}
  const ents=Object.entries(grp).sort((a,b)=>(b[1].u.prim?1:0)-(a[1].u.prim?1:0)||(a[0]==='?'?1:0)-(b[0]==='?'?1:0));
  for(const [k,{u,n}] of ents){const r=el('div','row','');r.style.cssText='gap:.35rem;min-height:1.2rem;padding:0 .2rem';
    if(k==='?')r.innerHTML=`<span class="red" style="width:24px;text-align:center">?</span><span style="flex:1">${n} hidden ${plural(n,'unit')}. Recon can find ${n===1?'it':'them'}.</span>`;
    else{r.appendChild(unitPic(u.type,24));r.insertAdjacentHTML('beforeend',`<span style="flex:1">${u.prim?'<span class="amb">★</span> ':''}${n>1?n+' × ':''}${u.name}</span><span class="r small">${['front','rear','deep rear'][u.depth]}</span>`)}
    w.appendChild(r)}
  return report(w,'OK')}

/* ---------- loadout: your staff's pick is already loaded; change it or just launch ---------- */
function loadout(){const m=S.mission;const s=screen('loadout');const bar=el('div','bar','');s.el.appendChild(bar);
  const box=el('div','panel grow scroll');box.innerHTML='<h3>DRONE · USE HERE · NUMBER</h3>';const list=el('div','list');box.appendChild(list);s.el.appendChild(box);
  const types=DRONE_ORDER.filter(d=>unlocked(d)&&(S.stock[d]||0)>0);const take={};const used=()=>Object.entries(take).reduce((a,[d,n])=>a+n*DRONES[d].slots,0);
  const tut=tutorial();types.forEach(d=>{take[d]=0});
  const apply=src=>{types.forEach(d=>take[d]=0);for(const d of types){let n=Math.min(src[d]||0,S.stock[d]||0);while(n>0&&used()+DRONES[d].slots>slots())n--;take[d]=n}};
  if(!tut)apply(suggest(m,types));
  const step=()=>{if(!tut)return;coach(s,(take.fpv||0)<9?`Press ▶ until 9 FPV drones are loaded (${take.fpv||0} now). They are cheap one-way attack drones.`:!(take.recon>0)?'Now press ▼ to go to Recon and add one. It finds hidden targets.':'Good. Press START, or go down to Launch.')};
  const rows=types.map(d=>row(s,list,'',{d,a:()=>report(droneInfo(d),'OK'),l:()=>{if(take[d]>0){take[d]--;upd();AU.play('tick');step()}},r:()=>{if(take[d]>=S.stock[d]||used()+DRONES[d].slots>slots()){AU.play('buzz');toast(take[d]>=S.stock[d]?'That is all of them in stock':'Every launch slot is full');return}take[d]++;upd();AU.play('tick');step()}}));
  const lst=el('div','list');s.el.appendChild(lst);
  const launch=()=>{if(!used()){toast('Load at least one drone');return}S.lastLoad={...take};const ld={};for(const d in take)if(take[d])ld[d]=take[d];for(const d in ld)S.stock[d]-=ld[d];S.loadout=ld;save();go(startBattle)};
  const lr=row(s,lst,'',{cls:'primary',a:launch});
  const upd=()=>{bar.innerHTML=`<b>CHOOSE DRONES</b><span>Slots ${used()} of ${slots()}</span>`;rows.forEach(it=>{const d=it.d;const f=FIT[fit(d,m)];it.el.innerHTML='';it.el.appendChild(dIcon(d));
      it.el.insertAdjacentHTML('beforeend',`<span style="flex:1">${DRONES[d].name}</span><span class="${f[1]} small" style="width:3.1rem">${f[0]}</span><span class="qty"><i>◀</i><b>${take[d]}</b><i>▶</i></span><span class="r small">of ${S.stock[d]}</span>`)});
    const n=Object.values(take).reduce((a,b)=>a+b,0);lr.el.textContent=`LAUNCH · ${n} ${plural(n,'DRONE','DRONES')}`};upd();
  s.select=()=>{apply(suggest(m,types));upd();toast('Staff pick loaded')};s.start=launch;
  s.keys=[['◀▶','Number'],['A','Info'],['SELECT','Staff pick'],['B','Back']];
  s.start0=tut?0:rows.length;s.back=()=>go(briefing);show(s);step()}

function suggest(m,types,stock=S.stock){const out={};let left=slots();const t=threat(m);const want=(d,n)=>{n=Math.min(n,stock[d]||0);while(n>0&&n*DRONES[d].slots>left)n--;if(n>0){out[d]=(out[d]||0)+n;left-=n*DRONES[d].slots}};
  if(types.includes('recon'))want('recon',m.units.some(u=>u.hidden)?2:1);
  if(t.aaL>=2&&types.includes('hunter'))want('hunter',2);if(t.aaL>=1&&types.includes('decoy'))want('decoy',t.aaL+1);
  if(t.drL>=1&&types.includes('intercept'))want('intercept',t.drL+1);
  const strikers=types.filter(d=>!DRONES[d].recon&&!DRONES[d].decoy&&!DRONES[d].interceptor&&!DRONES[d].hunter).sort((a,b)=>fit(b,m)-fit(a,m)||(DRONES[b].atk.armor||0)-(DRONES[a].atk.armor||0));
  for(let pass=0;pass<6&&left>0;pass++)for(const d of strikers){if(fit(d,m)<2&&pass<2)continue;if(fit(d,m)<1)continue;want(d,Math.max(1,Math.ceil(left/2)))}
  return out}

/* ---------- debrief: three big numbers, the objectives as pictures, the details on SELECT ---------- */
async function debrief(B,R){const s=screen('debrief');const T=TIERS[R.ti];const m=B.m;
  s.el.appendChild(el('div','bar',`<b>MISSION RESULTS</b><span>${esc(m.name)}</span>`));
  s.el.appendChild(el('div',`stamp ${T.col}`,T.name));
  const fr=T.front>0?`+${T.front}`:T.front<0?'−1':'0';
  s.el.appendChild(el('div','panel big3',`<div>+${money(R.funds)}<small>funds</small></div><div>+★${R.pres}<small>prestige</small></div><div class="${T.front<0?'red':T.front>0?'grn':''}">${fr}<small>front</small></div>`));
  const p=m.units.filter(u=>u.prim),pd=p.filter(u=>u.dead).length;
  const ob=el('div','panel');ob.appendChild(el('h3','',`OBJECTIVES: ${pd} OF ${p.length} DESTROYED`));ob.appendChild(objFigs(m));s.el.appendChild(ob);
  const lostAll={};for(const [t,n] of Object.entries(B.lost))lostAll[t]=n;const nl=Object.values(lostAll).reduce((a,b)=>a+b,0);
  const dr=el('div','panel');dr.appendChild(el('h3','',nl?`DRONES SHOT DOWN OR JAMMED: ${nl}`:'NO DRONES LOST'));if(nl)dr.appendChild(lossFigs(lostAll,'red'));s.el.appendChild(dr);
  const left=GENERALS[S.camp].missions.length-S.battle;
  s.el.appendChild(el('div','small',`<div style="padding:0 .2rem">Front points: <span class="amb">${Math.max(0,S.front)} of ${CAMP_NEED}</span>. ${left>0?`${left} ${plural(left,'battle')} left on this front.`:'That was the last battle on this front.'}</div>`));
  s.el.appendChild(el('div','grow'));const list=el('div','list');s.el.appendChild(list);
  const before=rankIdx(S.prestige-R.pres),after=rankIdx();
  row(s,list,'CONTINUE ▶',{cls:'primary',a:()=>{if(s.busy)return;s.busy=true;afterBattle(R,before,after)}});
  const fmt=o=>Object.entries(o).filter(([,n])=>n).map(([t,n])=>`${n} ${dname(t,n)}`).join(', ');
  const used=fmt(B.spent),home=fmt(B.avail),other=m.units.filter(u=>!u.prim&&u.dead);
  s.select=()=>report(`<h3>DETAILS</h3><div class="small">
    <div>Funds: mission ${money(R.funds-R.budget-R.aid)}, war budget ${money(R.budget)}${R.aid?`, foreign aid ${money(R.aid)}`:''}.</div>
    <div>Prestige: ${R.pres-R.eff} for the result${R.eff?`, plus ${R.eff} for losing few drones`:''}.</div>
    ${other.length?`<div>Also destroyed: ${other.map(u=>esc(u.name)).join(', ')}.</div>`:''}
    ${used?`<div>Used up on targets: ${used}.</div>`:''}${home?`<div>Back in stock: ${home}.</div>`:''}
    ${R.recovered?`<div class="grn">Recovery teams repaired ${R.recovered} downed drones.</div>`:''}</div>`,'OK');
  s.keys=[['A','Continue'],['SELECT','Details']];s.back=()=>{};show(s);
  AU.music('debrief');AU.play('stamp')}
async function afterBattle(R,before,after){
  await msg(pick(R.ti<=1?CO_LINES.win:CO_LINES.lose),{who:STORY.co,port:portrait(CO_LOOK)});
  if(after>before){AU.play('research');await msg(`You have been promoted to ${RANKS[after][0]}. New research is open, and foreign aid will grow.`,{who:STORY.co,port:portrait(CO_LOOK)})}
  if(campaignOver()){if(S.front>=CAMP_NEED)await campaignWon();else await campaignLost();return}
  save();go(hq)}
async function campaignWon(){const g=general();AU.play('win');
  await msg(`${g.name}'s offensive has collapsed. ${g.front} is holding.`,{who:STORY.co,port:portrait(CO_LOOK)});
  if(S.camp>=GENERALS.length-1){await ending();return}
  S.camp++;S.battle=0;S.front=0;S.usage={};S.mission=null;S.funds+=40;await msg(`The government has sent a reward to the unit: ${money(40)}. Spend it well.`,{who:STORY.co,port:portrait(CO_LOOK)});
  save();go(campaignIntro)}
async function campaignLost(){AU.play('lose');const g=general();
  await msg(`The line has broken on ${g.front}. ${g.name}'s troops are through.`,{who:STORY.co,port:portrait(CO_LOOK)});
  await msg('The army will fall back and dig in. We get one more chance at this front. Regroup and try again.',{who:STORY.co,port:portrait(CO_LOOK)});
  const cp=S.checkpoint;if(cp){const keep={stats:S.stats};S=JSON.parse(cp);S.checkpoint=cp;S.stats=keep.stats}save();go(campaignIntro)}
async function ending(){S.won=1;save();const s=screen('end');s.el.appendChild(el('div','grow'));show(s);AU.music('debrief');
  const lines=['Dravik\'s headquarters burned through the night. By morning, the Dominion\'s columns were turning around.',
    'The border is quiet now. Cratered, scarred, but ours.',
    `In the capital they put up a plaque for ${S.unit}. Nobody can agree on what to call the drones on it.`,
    'Wars like this one are not won by the biggest army. They are won by the side that learns fastest.',
    'Varna learned faster.'];
  for(const t of lines)await msg(t);
  victoryScreen()}
function victoryScreen(){const s=screen('end');s.el.appendChild(el('div','grow'));const p=el('div','panel',`<div class="stamp grn">VICTORY</div><div style="text-align:center">${esc(S.unit)}<br><span class="dim">${rankName()} · ${S.stats.battles} battles · ${S.stats.kills} targets destroyed</span></div>`);s.el.appendChild(p);
  s.el.appendChild(el('div','grow'));const list=el('div','list');s.el.appendChild(list);row(s,list,'TO TITLE',{cls:'primary',a:()=>go(titleScreen)});s.keys=[['A','Title']];show(s);AU.music('debrief')}
