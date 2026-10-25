/* ===================== SCREENS ===================== */
const meter=(n,max=3,cls='on')=>`<span class="meter">${Array.from({length:max},(_,i)=>`<i class="${i<n?cls:''}"></i>`).join('')}</span>`;
const fitBars=n=>`<span class="meter">${[0,1,2].map(i=>`<i class="${i<n?(n>=3?'grn':'on'):''}"></i>`).join('')}</span>`;
function frontBar(){const need=CAMP_NEED,max=Math.max(need+2,5);let h='';for(let i=0;i<max;i++)h+=`<i class="${i<S.front?'us':''}"></i>`;
  return`<div class="front">${S.front<0?`<span class="red small">${S.front}</span>`:''}${h}</div><div class="small dim" style="margin-top:.1rem">Front: ${S.front} of ${need} needed to hold · battle ${Math.min(S.battle+1,5)}/5</div>`}
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
function settingsScreen(back){const s=screen('settings');header2(s,'SETTINGS');const p=el('div','panel');const list=el('div','list');p.appendChild(list);s.el.appendChild(p);
  const m=row(s,list,'',{a:()=>{AU.setMusic(!AU.musicOn);saveSettings();upd()}}),f=row(s,list,'',{a:()=>{AU.setSfx(!AU.sfxOn);saveSettings();upd()}});row(s,list,'BACK',{cls:'btn',a:()=>back()});
  const upd=()=>{m.el.innerHTML=`Music <span class="r">${AU.musicOn?'ON':'OFF'}</span>`;f.el.innerHTML=`Sound <span class="r">${AU.sfxOn?'ON':'OFF'}</span>`};upd();s.back=()=>back();show(s)}
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
  row(s,list,'CONFIRM',{cls:'btn',a:async()=>{S=newState(cur());S.checkpoint=null;save();await go(campaignIntro)}});
  const draw=()=>{big.textContent=cur();nm.el.innerHTML=`<span>◀ Suggest another ▶</span><span class="r">${ni+1}</span>`;sub.textContent='◀ ▶ cycles names · A on Edit to change letters'};draw();
  s.back=()=>go(titleScreen);show(s)}
function editName(v,done){const CH=" ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'\".&";let a=(v.toUpperCase()+' '.repeat(20)).slice(0,20).split('');let c=0;
  const o=overlay(`<h3>EDIT CALLSIGN</h3><div class="ed" style="font-size:1.35rem;letter-spacing:.06em;white-space:pre;color:var(--amber)"></div><div class="small dim">▲▼ letter · ◀▶ move · A done · B cancel</div>`);const ed=o.querySelector('.ed');
  const draw=()=>{ed.innerHTML=a.map((ch,i)=>i===c?`<span style="background:var(--amber);color:#000">${ch===' '?'_':esc(ch)}</span>`:esc(ch)).join('')};draw();
  const L={key(b){if(b==='left'){c=Math.max(0,c-1)}else if(b==='right'){c=Math.min(19,c+1)}else if(b==='up'||b==='down'){const i=CH.indexOf(a[c]);a[c]=CH[(i+(b==='up'?1:-1)+CH.length)%CH.length]}
      else if(b==='a'||b==='start'){const out=a.join('').trim().replace(/\s+/g,' ');layers.splice(layers.indexOf(L),1);o.remove();if(out)done(out);AU.play('ok');return}
      else if(b==='b'){layers.splice(layers.indexOf(L),1);o.remove();AU.play('back');return}AU.play('tick');draw()}};layers.push(L)}

/* ---------- a new front ---------- */
async function campaignIntro(){const g=general();S.checkpoint=null;S.checkpoint=JSON.stringify(S);save();
  const s=screen('dossier');header2(s,`FRONT ${S.camp+1} OF 5 · ${g.front.toUpperCase()}`);
  const p=el('div','panel');p.innerHTML='<h3>ENEMY COMMANDER</h3>';const r=el('div','');r.style.cssText='display:flex;gap:.5rem';const pc=portrait(g.look);pc.className='port px';pc.style.width='5rem';pc.style.height='6.25rem';r.appendChild(pc);
  r.appendChild(el('div','',`<div class="amb" style="font-size:1.15rem">${esc(g.name)}</div><div class="red">${esc(g.nick)}</div><div class="desc" style="margin-top:.2rem">${esc(g.doc)}</div>`));p.appendChild(r);s.el.appendChild(p);
  const q=el('div','panel',`<div class="msg" style="font-size:1rem">${esc(g.quote)}</div>`);s.el.appendChild(q);
  const hint=el('div','panel small',`Win enough battles here to hold the front: ${CAMP_NEED} front points over five battles. Decisive wins give 2, wins give 1, failures cost 1.`);s.el.appendChild(hint);
  s.el.appendChild(el('div','grow'));const list=el('div','list');s.el.appendChild(list);row(s,list,'TO HEADQUARTERS',{cls:'btn',a:()=>go(hq)});show(s);AU.music('tension');
  if(S.camp===0){await msg(`${S.unit}. Good name. You'll need it.`,{who:STORY.co,port:portrait(CO_LOOK)});await msg('Brask\'s tanks are rolling across the northern plains. Start with what you have: FPVs and a pair of recon planes. Research will get you more.',{who:STORY.co,port:portrait(CO_LOOK)})}
  else await msg(['','The Silence is coming. Vorst jams everything. Think about what flies without a radio.','Kessan\'s fleet is off the southern coast. Ships need something that swims, or something that reaches far.','Okhrin has built an umbrella of guns and drones. You\'ll need to tear holes in it before anything gets through.','This is the last front. Dravik himself. He has studied everything you\'ve done. Surprise him.'][S.camp],{who:STORY.co,port:portrait(CO_LOOK)})}

/* ---------- headquarters ---------- */
function hq(){const s=screen('hq');const g=general();
  s.el.appendChild(el('div','bar',`<b>${esc(S.unit.toUpperCase())}</b><span>${rankName()}</span>`));
  const res=el('div','panel',`<div style="display:flex;justify-content:space-between"><span>FUNDS <span class="amb">${money(S.funds)}</span></span><span>PRESTIGE <span class="amb">★${S.prestige}</span></span><span>SLOTS <span class="amb">${slots()}</span></span></div>`);s.el.appendChild(res);
  const nxt=RANKS[rankIdx()+1];if(nxt)res.appendChild(el('div','small dim',`Next rank ${nxt[0]} at ★${nxt[1]} · unlocks research tier ${rankIdx()+2} and more aid`));
  const cp=el('div','panel');cp.innerHTML=`<h3>FRONT ${S.camp+1}/5 · ${esc(g.front.toUpperCase())}</h3>`;const r=el('div','');r.style.cssText='display:flex;gap:.45rem;align-items:center';const pc=portrait(g.look);pc.className='port px';r.appendChild(pc);
  r.appendChild(el('div','',`<div class="amb">${esc(g.name)}</div><div class="red small">${esc(g.nick)}</div><div style="margin-top:.25rem">${frontBar()}</div>`));r.lastChild.style.flex='1';cp.appendChild(r);s.el.appendChild(cp);
  const stockTot=Object.values(S.stock).reduce((a,b)=>a+b,0);
  const list=el('div','list');s.el.appendChild(list);
  row(s,list,`NEXT MISSION <span class="r">▶</span>`,{cls:'big',a:()=>{if(!stockTot){toast('No drones in stock. Visit the hangar.');return}go(briefing)}});
  row(s,list,`HANGAR <span class="r">${stockTot} drones</span>`,{a:()=>go(hangar)});
  const can=RESEARCH.filter(x=>!has(x.id)&&x.tier<=rankIdx()&&x.cost<=S.funds).length;
  row(s,list,`RESEARCH <span class="r">${can?`<span class="amb">${can} ready</span>`:''}</span>`,{a:()=>go(research)});
  row(s,list,'RECORDS',{a:()=>go(records)});
  row(s,list,'SETTINGS',{a:()=>settingsScreen(hq)});
  row(s,list,'QUIT TO TITLE',{a:()=>{save();go(titleScreen)}});
  s.el.appendChild(el('div','grow'));s.el.appendChild(el('div','hint','Progress saves after every battle and purchase'));
  s.back=()=>{};show(s,{keep:true});AU.music('hq');save()}

/* ---------- hangar: buy drones ---------- */
function hangar(){const s=screen('hangar');header(s,'HANGAR');
  const box=el('div','panel grow scroll');const list=el('div','list');box.appendChild(list);s.el.appendChild(box);const desc=el('div','panel desc');s.el.appendChild(desc);
  const order={};const tot=()=>Object.entries(order).reduce((a,[d,n])=>a+n*costOf(d),0);
  const types=DRONE_ORDER.filter(unlocked);
  const rows=types.map(d=>{const it=row(s,list,'',{l:()=>{order[d]=Math.max(0,(order[d]||0)-1);upd()},r:()=>{if(tot()+costOf(d)>S.funds){AU.play('buzz');return}order[d]=(order[d]||0)+1;upd();AU.play('tick')},
      a:()=>{if(tot()+costOf(d)>S.funds){AU.play('buzz');return}order[d]=(order[d]||0)+1;upd()},d});it.el.prepend(droneIcon(d,14));return it});
  const buy=row(s,list,'',{cls:'btn',a:()=>{const t=tot();if(!t){toast('Use ◀ ▶ to add drones to the order');return}S.funds-=t;for(const [d,n] of Object.entries(order))S.stock[d]=(S.stock[d]||0)+n;for(const k in order)order[k]=0;AU.play('cash');toast('Order delivered');save();hangar()}});
  row(s,list,'BACK',{cls:'btn',a:()=>go(hq)});
  const upd=()=>{rows.forEach(it=>{const d=it.d,n=order[d]||0;it.el.innerHTML='';it.el.appendChild(droneIcon(d,14));it.el.insertAdjacentHTML('beforeend',`<span style="flex:1">${DRONES[d].name}</span><span class="r">${S.stock[d]||0} · ${money(costOf(d))}</span><span class="qty"><i>◀</i><b>${n?'+'+n:'·'}</b><i>▶</i></span>`)});
    buy.el.innerHTML=`PLACE ORDER <span class="amb">${money(tot())}</span>&nbsp;of ${money(S.funds)}`};upd();
  s.onFocus=it=>{desc.innerHTML=it.d?droneInfo(it.d):'◀ ▶ adds or removes drones from the order.'};
  s.back=()=>go(hq);show(s)}
function droneInfo(d){const D=DRONES[d];const best=Object.entries(D.atk).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([c])=>CATS[c]).join(', ');
  return`<span class="amb">${D.name}</span> ${D.exp?'<span class="tag">ONE-WAY</span>':'<span class="tag grn">REUSABLE</span>'}${D.slots>1?`<span class="tag">${D.slots} SLOTS</span>`:''}<br>${D.desc}<br><span class="dim">Range ${['front','near rear','deep'][D.range]} · dodge ${Math.round(D.eva*100)}% · anti-jam ${Math.round(jamRes(d)*100)}%${best?' · best vs '+best:''}</span>`}

/* ---------- research ---------- */
function research(){const s=screen('research');header(s,'RESEARCH');
  const box=el('div','panel grow scroll');const list=el('div','list');box.appendChild(list);s.el.appendChild(box);const desc=el('div','panel desc');s.el.appendChild(desc);
  for(let t=0;t<4;t++){const need=RANKS[t];const open=rankIdx()>=t;const hd=el('div','small '+(open?'amb':'dim'),`TIER ${t+1} ${open?'':`· needs ${need[0]} (★${need[1]})`}`);hd.style.margin='.2rem 0 0 .2rem';list.appendChild(hd);
    for(const r of RESEARCH.filter(x=>x.tier===t)){const done=has(r.id);
      row(s,list,`<span>${done?'✓ ':''}${r.name}</span><span class="r">${done?'done':open?money(r.cost):'locked'}</span>`,{r,off:done||!open||r.cost>S.funds,offMsg:done?'Already researched':!open?`Needs rank ${need[0]}`:'Not enough funds',
        a:async()=>{S.funds-=r.cost;S.research[r.id]=1;AU.play('research');if(r.unlock){S.stock[r.unlock]=(S.stock[r.unlock]||0)+(DRONES[r.unlock].cost<10?4:1);toast(`${r.name} unlocked · prototypes delivered`)}else toast(`${r.name} complete`);save();research()}})}}
  row(s,list,'BACK',{cls:'btn',a:()=>go(hq)});
  s.onFocus=it=>{desc.innerHTML=it.r?`<span class="amb">${it.r.name}</span> · ${money(it.r.cost)}<br>${it.r.desc}`+(it.r.unlock?`<br><span class="dim">${DRONES[it.r.unlock].desc}</span>`:''):`Funds ${money(S.funds)}`};
  s.back=()=>go(hq);show(s,{keep:true})}

/* ---------- records ---------- */
function records(){const s=screen('records');header(s,'RECORDS');const st=S.stats;
  const p=el('div','panel',`<h3>${esc(S.unit.toUpperCase())}</h3><div class="small">Rank ${rankName()} · battles ${st.battles} (won ${st.wins}) · strikes ${st.strikes} · targets destroyed ${st.kills}<br>Drones expended ${st.spent} · drones lost ${st.lost}</div>`);s.el.appendChild(p);
  const ad=adaptation();const a=el('div','panel',`<h3>ENEMY ADAPTATION</h3><div class="small">${ad.notes.length?ad.notes.map(esc).join('<br>'):'The enemy has not adapted to your tactics yet. Lean too hard on one drone and they will.'}</div>`);s.el.appendChild(a);
  const box=el('div','panel grow scroll');box.innerHTML='<h3>DRONE CODEX</h3>';const list=el('div','list');box.appendChild(list);s.el.appendChild(box);const desc=el('div','panel desc');s.el.appendChild(desc);
  for(const d of DRONE_ORDER){const u=unlocked(d);const it=row(s,list,`<span>${u?DRONES[d].name:'??? (not researched)'}</span><span class="r">${u?money(costOf(d)):''}</span>`,{d:u?d:null});if(u)it.el.prepend(droneIcon(d,14))}
  row(s,list,'BACK',{cls:'btn',a:()=>go(hq)});s.onFocus=it=>{desc.innerHTML=it.d?droneInfo(it.d):''};s.back=()=>go(hq);show(s)}

/* ---------- briefing ---------- */
function briefing(){if(!S.mission){S.mission=genMission();save()}const m=S.mission,g=general();const s=screen('brief');
  s.el.appendChild(el('div','bar',`<b>BATTLE ${S.battle+1}/5</b><span class="red">${esc(g.nick)}</span>`));
  s.el.appendChild(el('div','panel',`<h3>${esc(m.name.toUpperCase())}${m.final?' · <span class="red">DECISIVE</span>':''}</h3><div class="desc">${esc(m.brief)}</div>`));
  const tp=el('div','panel grow scroll');tp.innerHTML='<h3>KNOWN TARGETS</h3>';const grp={};
  for(const u of m.units){const k=u.hidden?'?':u.type+(u.prim?'*':'');(grp[k]=grp[k]||{u,n:0}).n++}
  for(const [k,{u,n}] of Object.entries(grp)){const name=k==='?'?'<span class="red">Unknown contact</span>':`${u.prim?'<span class="amb">★</span> ':''}${u.name}`;
    tp.appendChild(el('div','row',`<span>${name} ×${n}</span><span class="r">${k==='?'?'—':CATS[u.cat]+' · '+['front','rear','deep'][u.depth]}</span>`))}
  s.el.appendChild(tp);
  const t=threat(m);s.el.appendChild(el('div','panel small',`<h3>THREATS</h3>Air defense ${meter(t.aaL,3,'red')} &nbsp; Jamming ${meter(t.ewL,3,'red')} &nbsp; Enemy drones ${meter(t.drL,3,'red')}`+(m.notes.length?`<div class="amb" style="margin-top:.2rem">INTEL: ${m.notes.map(esc).join(' ')}</div>`:'')+`${m.units.some(u=>u.prim&&u.depth===2)?'<div class="amb" style="margin-top:.15rem">Deep targets: only long-range drones can reach them.</div>':''}<div class="dim" style="margin-top:.15rem">Reward ${money(m.reward)} · ★ marks objectives</div>`));
  const list=el('div','list');s.el.appendChild(list);row(s,list,'PLAN THE STRIKE ▶',{cls:'btn',a:()=>go(loadout)});row(s,list,'BACK TO HQ',{cls:'btn',a:()=>go(hq)});
  s.back=()=>go(hq);show(s);AU.music('tension')}

/* ---------- loadout ---------- */
function loadout(){const m=S.mission;const s=screen('loadout');const bar=el('div','bar','');s.el.appendChild(bar);
  const box=el('div','panel grow scroll');box.innerHTML='<h3>DRONE · FIT · TAKE</h3>';const list=el('div','list');box.appendChild(list);s.el.appendChild(box);const desc=el('div','panel desc');s.el.appendChild(desc);
  const types=DRONE_ORDER.filter(d=>unlocked(d)&&(S.stock[d]||0)>0);const take={};const used=()=>Object.entries(take).reduce((a,[d,n])=>a+n*DRONES[d].slots,0);
  const prev=S.lastLoad||{};types.forEach(d=>{take[d]=0});
  const apply=src=>{types.forEach(d=>take[d]=0);for(const d of types){let n=Math.min(src[d]||0,S.stock[d]||0);while(n>0&&used()+DRONES[d].slots>slots())n--;take[d]=n}};
  if(Object.keys(prev).length)apply(prev);else apply(suggest(m,types));
  const rows=types.map(d=>{const it=row(s,list,'',{d,l:()=>{if(take[d]>0){take[d]--;upd();AU.play('tick')}},r:()=>{if(take[d]>=S.stock[d]||used()+DRONES[d].slots>slots()){AU.play('buzz');return}take[d]++;upd();AU.play('tick')}});return it});
  const go1=row(s,list,'LAUNCH ▶',{cls:'btn',a:()=>{if(!used()){toast('Choose at least one drone');return}S.lastLoad={...take};const ld={};for(const d in take)if(take[d])ld[d]=take[d];for(const d in ld)S.stock[d]-=ld[d];S.loadout=ld;save();go(startBattle)}});
  row(s,list,'SUGGEST A LOADOUT',{a:()=>{apply(suggest(m,types));upd();toast('Suggested by your staff')}});
  row(s,list,'BACK',{cls:'btn',a:()=>go(briefing)});
  const upd=()=>{bar.innerHTML=`<b>LOADOUT</b><span>SLOTS ${used()}/${slots()}</span>`;rows.forEach(it=>{const d=it.d;it.el.innerHTML='';it.el.appendChild(droneIcon(d,14));
      it.el.insertAdjacentHTML('beforeend',`<span style="flex:1">${DRONES[d].short} <span class="dim small">${DRONES[d].name}</span></span>${fitBars(fit(d,m))}<span class="qty"><i>◀</i><b>${take[d]}</b><i>▶</i></span><span class="r small">/${S.stock[d]}</span>`)})};upd();
  s.onFocus=it=>{desc.innerHTML=it.d?droneInfo(it.d):'Green bars: how well a drone fits this mission, from what intel can see.'};
  s.select=()=>{apply(suggest(m,types));upd();toast('Suggested by your staff')};
  s.back=()=>go(briefing);show(s)}
function suggest(m,types,stock=S.stock){const out={};let left=slots();const t=threat(m);const want=(d,n)=>{n=Math.min(n,stock[d]||0);while(n>0&&n*DRONES[d].slots>left)n--;if(n>0){out[d]=(out[d]||0)+n;left-=n*DRONES[d].slots}};
  if(types.includes('recon'))want('recon',m.units.some(u=>u.hidden)?2:1);
  if(t.aaL>=2&&types.includes('hunter'))want('hunter',2);if(t.aaL>=1&&types.includes('decoy'))want('decoy',t.aaL+1);
  if(t.drL>=1&&types.includes('intercept'))want('intercept',t.drL+1);
  const strikers=types.filter(d=>!DRONES[d].recon&&!DRONES[d].decoy&&!DRONES[d].interceptor&&!DRONES[d].hunter).sort((a,b)=>fit(b,m)-fit(a,m)||(DRONES[b].atk.armor||0)-(DRONES[a].atk.armor||0));
  for(let pass=0;pass<6&&left>0;pass++)for(const d of strikers){if(fit(d,m)<2&&pass<2)continue;if(fit(d,m)<1)continue;want(d,Math.max(1,Math.ceil(left/2)))}
  return out}

/* ---------- debrief ---------- */
async function debrief(B,R){const s=screen('debrief');const T=TIERS[R.ti];const m=B.m;
  s.el.appendChild(el('div','bar',`<b>AFTER-ACTION REPORT</b><span>${esc(m.name)}</span>`));
  const st=el('div',`stamp ${T.col}`,T.name);s.el.appendChild(st);
  const p=m.units.filter(u=>u.prim);const pd=p.filter(u=>u.dead).length;
  s.el.appendChild(el('div','panel',`<h3>RESULT</h3>Objectives ${Math.round(R.sc*100)}% · ${pd}/${p.length} destroyed<br>Other targets destroyed ${m.units.filter(u=>!u.prim&&u.dead).length}<br>
    <span class="dim">Drones expended ${Object.values(B.spent).reduce((a,b)=>a+b,0)} · lost ${Object.values(B.lost).reduce((a,b)=>a+b,0)}${R.recovered?` · recovered ${R.recovered}`:''}</span>`));
  s.el.appendChild(el('div','panel',`<h3>REWARDS</h3>Funds <span class="amb">+${money(R.funds)}</span> <span class="dim">(budget ${money(R.budget)}${R.aid?`, aid ${money(R.aid)}`:''})</span><br>Prestige <span class="amb">+★${R.pres}</span>${R.eff?' <span class="grn">efficient strike</span>':''}<br>Front <span class="${T.front>0?'grn':T.front<0?'red':''}">${T.front>0?'+':''}${T.front}</span><div style="margin-top:.2rem">${frontBar()}</div>`));
  const before=rankIdx(S.prestige-R.pres),after=rankIdx();
  s.el.appendChild(el('div','grow'));const list=el('div','list');s.el.appendChild(list);
  row(s,list,'CONTINUE ▶',{cls:'btn',a:()=>afterBattle(R,before,after)});show(s);
  AU.music('debrief');AU.play(R.ti<=1?'win':'lose');AU.play('stamp')}
async function afterBattle(R,before,after){
  await msg(pick(R.ti<=1?CO_LINES.win:CO_LINES.lose),{who:STORY.co,port:portrait(CO_LOOK)});
  if(after>before){AU.play('research');await msg(`Promotion: you are now ${RANKS[after][0]}. Research tier ${after+1} is open, and foreign aid grows with your reputation.`,{who:STORY.co,port:portrait(CO_LOOK)})}
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
  s.el.appendChild(el('div','grow'));const list=el('div','list');s.el.appendChild(list);row(s,list,'TO TITLE',{cls:'btn',a:()=>go(titleScreen)});show(s);AU.music('debrief')}
