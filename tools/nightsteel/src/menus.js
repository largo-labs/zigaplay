/* ================= the menu (START), shops, inns, the forge and the tailor ================= */
function screenRoot(dark=true){const r=el('div','screen fade'+(dark?' darken':''));UI.appendChild(r);return r}
function memberCard(m,wide){const s=statsOf(m);return`<div class="card">${portraitHTML(m)}<div class="cb"><div><span class="gold">${esc(m.name)}</span> <span class="tiny" style="color:${ROLES[roleOf(m)].c}">${ROLES[roleOf(m)].n}</span> <span class="tiny" style="color:${(ELEMS[innateEl(m)]||ELEMS.None).c}">● ${innateEl(m)?ELEMS[innateEl(m)].n:''}</span> <span class="dim small">Lv</span> ${m.lv}${m.hp<=0?' <span class="red small">KO</span>':''}</div>
  <div class="small"><span class="dim">HP</span> ${m.hp}<span class="dim">/${s.hp}</span> ${barHTML(m.hp,s.hp,'',wide?34:24)} <span class="dim">MP</span> ${m.mp}<span class="dim">/${s.mp}</span></div>
  <div class="tiny dim">${esc(m.weapon.name||WTYPES[m.weapon.kind].n)} · ${WTYPES[m.weapon.kind].n}${m.weapon.tier?' · '+TIERS[m.weapon.tier]:''}</div></div></div>`}
/* choose a member in a window: resolves with the member or null */
function pickMember(parent,box,title,o={}){return pick(Object.assign({el:winEl('pop',box,parent),title,vis:4,rows:(o.pool||G.party).map(m=>({html:memberCard(m,box.w>200),m,off:o.off?o.off(m):false}))},o.extra||{})).then(i=>i<0?null:(o.pool||G.party)[i])}
/* a menu that stays open while its choices run */
function menuLoop(o){return new Promise(res=>{let busy=false;const lw=new ListWin(Object.assign({},o,{pick:async(r,i)=>{if(busy)return;busy=true;lw.dim=true;lw.render();let out;
    try{out=await o.act(r,i,lw)}catch(e){console.error(e)}busy=false;lw.dim=false;if(out==='close'){popModal(lw);res(out);return}lw.render()},back:()=>{if(busy)return;popModal(lw);res()}}));pushModal(lw)})}
async function mainMenu(){WD.busy=true;const root=screenRoot();const pw=W-98;
  const party=winEl('',{x:4,y:4,w:pw,h:142},root);const drawParty=()=>{party.innerHTML=G.party.map(m=>memberCard(m,pw>200)).join('')};drawParty();
  const info=winEl('plain',{x:4,y:150,w:W-8,h:26},root);info.innerHTML=`<span class="gold">${fmt(G.gold)}</span><span class="dim">g</span>&nbsp;&nbsp; <span class="blue">◆${fmt(G.gems||0)}</span> <span class="dim">·</span> <span class="dim">Time</span> ${playTime()}&nbsp;&nbsp; <span class="dim">${esc(ZONES[G.zone].n)}</span>`;
  const cmds=['Items','Arts','Status','Style','Charms','Party','Wish','Quests','System'];checkQuests();
  const sub=names=>new Promise(res=>{const w=winEl('roomy',{x:W-91,y:4,w:87,h:16+names.length*16},root);menuLoop({el:w,rows:names.map(l=>({label:l})),vis:names.length,act:async(row,i)=>{res(names[i]);return 'close'}}).then(()=>{w.remove();res(null)})});
  const r=await menuLoop({el:winEl('roomy r9',{x:W-91,y:4,w:87,h:142},root),rows:cmds.map(c=>({label:c})),vis:9,act:async(row,i)=>{let c=cmds[i];const box={x:4,y:4,w:pw,h:142};
    if(c==='Style'){const opts=[G.flags.face&&'Wardrobe',G.flags.forge&&'Weapon shape'].filter(Boolean);if(!opts.length){SND.fx('no');await say('',G.flags.reborn?'Find a mirror first. Or a bowl of water.':'You\'re in your work clothes. They\'ll do.');return}
      const k=await sub(opts);if(!k)return;c=k==='Wardrobe'?'Wardrobe':'Forge'}
    else if(c==='System'){const k=await sub(['Save','Settings','Title']);if(!k)return;c=k}
    if(c==='Items')await itemsMenu(root,box);
    else if(c==='Arts'){const m=await pickMember(root,box,'Whose arts?');if(m)await fieldArts(root,m)}
    else if(c==='Status'){const m=await pickMember(root,box,'Status');if(m)await statusScreen(m)}
    if(c==='Wardrobe'){root.style.visibility='hidden';await wardrobe(hero(),{noWeapon:!G.flags.knife});root.style.visibility=''}
    else if(c==='Forge'){root.style.visibility='hidden';await forgeDesign(hero(),{heading:'Reshape'});root.style.visibility='';clampParty()}
    else if(c==='Charms'){const m=await pickMember(root,box,'Who wears a charm?');if(m)await charmMenu(root,m)}
    else if(c==='Party'){root.style.visibility='hidden';await partyMenu();root.style.visibility=''}
    else if(c==='Wish'){root.style.visibility='hidden';await wishMenu();root.style.visibility=''}
    else if(c==='Quests'){await questMenu(root);info.innerHTML=info.innerHTML.replace(/◆[\d,]+/,'◆'+fmt(G.gems||0))}
    else if(c==='Save'){if(ZONES[WD.zone].noSave){SND.fx('no');toast('You can\'t save here.')}else{autosave(true);SND.fx('save');toast('Your journey is saved.')}}
    else if(c==='Settings')await settingsMenu(root);
    else if(c==='Title'){if(await confirmBox('Return to the title?<br><span class="small dim">Anything since your last save is lost.</span>'))return 'close'}
    drawParty()}});
  if(r==='close'){root.remove();WD.busy=false;toTitle();return}
  root.remove();WD.busy=false}

/* ---------- your party of three, in order: the front slot draws the most attacks ---------- */
async function partyMenu(){
  const root=screenRoot(),box={x:4,y:4,w:W-98,h:110},win=winEl('',box,root),syn=winEl('plain',{x:4,y:118,w:W-8,h:58},root);
  const draw=()=>{win.innerHTML=[0,1,2].map(i=>G.party[i]?memberCard(G.party[i],false):`<div class="card"><div class="cb dim small">Empty slot</div></div>`).join('');
    const P=G.party.slice(0,3),a=synActive(P),rx=reactionsFor(P);
    syn.innerHTML=`<div class="tiny dim">BONDS</div>`+(a.length?`<div class="small gold">${a.map(x=>esc(x.n)).join(' · ')}</div>`:`<div class="tiny dim">A Tank, a Healer and a DPS together give everyone a boost.</div>`)
      +`<div class="tiny dim" style="margin-top:calc(var(--u)*1.5)">ELEMENT REACTIONS</div>`+(rx.length?rx.slice(0,3).map(x=>`<div class="small"><b style="color:${x.c}">${x.n}</b> <span class="tiny dim">${esc(x.who)}</span></div>`).join(''):`<div class="tiny dim">Mix elements, like Pyro with Cryo, to blow up enemies.</div>`)};draw();
  const names=['Front','Middle','Back','Done'];
  await menuLoop({el:winEl('roomy',{x:W-91,y:4,w:87,h:110},root),rows:names.map(l=>({label:l})),vis:4,act:async(row,i)=>{if(i===3)return 'close';
    const c=await pickMember(root,box,`Who takes the ${names[i].toLowerCase()} slot?`,{pool:allMembers()});if(!c)return;
    const cur=G.party[i],j=G.party.indexOf(c);
    if(c===cur){}else if(j>=0){if(cur){G.party[j]=cur;G.party[i]=c}else{G.party.splice(j,1);G.party.push(c)}SND.fx('ok')}
    else{if(cur){G.roster.push(cur);G.party[i]=c}else G.party.push(c);G.roster=G.roster.filter(x=>x!==c);SND.fx('ok')}
    clampParty();draw()}});
  root.remove()}
/* ---------- wishes: 100 gems each, a new friend every time ---------- */
function wishPull(){G.pity=(G.pity||0)+1;G.wishes=(G.wishes||0)+1;const five=G.pity>=WISH.pity||rnd()<WISH.rate5;if(five)G.pity=0;
  const ids=WISH_IDS.filter(id=>CHARS[id].rar===(five?5:4)),id=ids[Math.floor(rnd()*ids.length)],had=owned(id);
  if(had)G.gems+=WISH.dupe;else join(id);return{id,five,had}}
async function wishMenu(){
  const root=screenRoot(),info=winEl('plain',{x:4,y:4,w:W-8,h:24},root),side=winEl('plain',{x:W-168,y:32,w:164,h:144},root);
  const draw=()=>{info.innerHTML=`<span class="blue">◆ ${fmt(G.gems||0)}</span> <span class="dim">gems</span> · <span class="gold">${wishes()}</span> <span class="dim">wish${wishes()===1?'':'es'}</span> · <span class="dim">5★ guaranteed in</span> ${Math.max(1,WISH.pity-(G.pity||0))}`;
    side.innerHTML='<div style="column-count:2;column-gap:4px">'+WISH_IDS.map(id=>{const C=CHARS[id],R=ROLES[C.role];return`<div class="tiny" style="break-inside:avoid;color:${owned(id)?'#fff':'#7a82a8'}">${C.rar===5?'<span class="gold">★5</span>':'<span class="blue">★4</span>'} <i class="eld" style="background:${ELEMS[C.el].c}"></i>${esc(C.n)} <span style="color:${R.c}">${R.s}</span>${owned(id)?'✓':''}</div>`}).join('')+'</div>'};draw();
  const one=winEl('plain',{x:4,y:32,w:W-176,h:60},root);one.innerHTML='<div class="tiny dim">Defeat enemies for gems. Every 100 gems is a wish. A repeat turns into 50 gems.</div>';
  await menuLoop({el:winEl('roomy r9',{x:4,y:96,w:W-176,h:80},root),rows:[{label:'Wish ×1'},{label:'Wish ×10'},{label:'Best heroes'},{label:'Back'}],vis:4,act:async(row,i)=>{if(i===3)return 'close';if(i===2){await bestHeroes(root);return}
    const n=i?10:1;if(wishes()<n){SND.fx('no');await say('',`You need ${n*WISH.cost} gems for that.`);return}
    G.gems-=n*WISH.cost;const res=[];for(let k=0;k<n;k++)res.push(wishPull());draw();setTimeout(checkQuests,600);
    const fresh=res.filter(r=>!r.had),dupes=res.length-fresh.length,wide=fresh.length>4,box=winEl('pop results',{x:Math.round(W/2-(wide?140:120)),y:6,w:wide?280:240},root);
    box.innerHTML=`<div class="ttl">${n===1?'A wish comes true!':'Ten wishes!'}</div><div class="${wide?'wcols':''}">`+fresh.map(r=>{const m=allMembers().find(x=>x.id===r.id),R=ROLES[CHARS[r.id].role];return`<div class="rr">${portraitHTML(m)}<div style="flex:1"><div class="small">${esc(CHARS[r.id].n)} <span class="${r.five?'gold':'blue'}">★${CHARS[r.id].rar}</span> <span style="color:${R.c}">${R.n}</span></div><div class="tiny green">Joined your roster!</div></div></div>`}).join('')+'</div>'
      +(dupes?`<div class="small dim">${dupes} repeat${dupes>1?'s':''} → ◆${dupes*WISH.dupe} back</div>`:'')+`<div class="tiny dim" style="text-align:right"><i class="k a">A</i>continue</div>`;
    SND.fx(res.some(r=>r.five)?'limit':'level');
    await new Promise(r=>{const m={el:box,input(b){if(b==='a'||b==='b'){popModal(m);box.remove();r()}}};setTimeout(()=>pushModal(m),250)});draw()}});
  root.remove()}
/* ---------- items ---------- */
async function itemsMenu(root,box){let sel=0;for(;;){const ids=Object.keys(G.inv).filter(k=>ITEMS[k]&&G.inv[k]>0);
    const desc=winEl('plain',{x:4,y:150,w:W-8,h:26},root);
    const i=await pick({el:winEl('pop',box,root),title:'Items',cols:2,vis:8,sel,empty:'Your bag is empty.',rows:ids.map(id=>{const I=ITEMS[id];const usable=['heal','mp','full','revive','cure','camp'].includes(I.use)||!!I.view;return{label:I.n,r:I.key?'<span class="tiny gold">key</span>':'×'+G.inv[id],id,off:!usable}}),
      render:r=>{desc.innerHTML=r?`<span class="small">${esc(ITEMS[r.id].desc)}</span>`:''}});desc.remove();if(i<0)return;sel=i;const id=ids[i],I=ITEMS[id];
    if(I.view==='poster'){await showPoster();continue}
    if(I.use==='camp'){if(await confirmBox('Make camp and rest?')){addItem(id,-1);await fadeOut();healAll();await fadeIn();SND.fx('heal');toast('Everyone is rested.')}continue}
    const m=await pickMember(root,box,'Use on who?',{off:x=>I.use==='revive'?x.hp>0:x.hp<=0});if(!m)continue;const s=statsOf(m);
    if(I.use==='heal')m.hp=Math.min(s.hp,m.hp+I.amt);else if(I.use==='mp')m.mp=Math.min(s.mp,m.mp+I.amt);else if(I.use==='full'){m.hp=s.hp;m.mp=s.mp}else if(I.use==='revive')m.hp=Math.max(1,Math.round(s.hp*I.amt));
    addItem(id,-1);SND.fx('heal');toast(`${esc(m.name)}: ${esc(I.n)}`,1100)}}
async function fieldArts(root,m){for(;;){const arts=artsOf(m),s=statsOf(m);const desc=winEl('plain',{x:4,y:150,w:W-8,h:26},root);
    const i=await pick({el:winEl('pop',{x:4,y:4,w:W-98,h:142},root),title:`${esc(artLabel(m))} <span class="small dim">MP ${m.mp}/${s.mp}</span>`,cols:2,vis:8,
      rows:arts.map(a=>({label:a.n,r:`<span class="blue">${a.mp}</span>`,a,off:a.kind!=='heal'||a.tgt==='self'&&a.pct||m.mp<a.mp||m.hp<=0})),render:r=>{desc.innerHTML=r?`<span class="small">${esc(artDesc(r.a))}${r.a.kind!=='heal'?' <span class="dim">(battle only)</span>':''}</span>`:''}});
    desc.remove();if(i<0)return;const a=arts[i];
    const targets=a.tgt==='party'?G.party.filter(x=>x.hp>0||a.revive):a.tgt==='self'?[m]:[await pickMember(root,{x:4,y:4,w:W-98,h:142},'On who?',{off:x=>a.tgt==='dead'?x.hp>0:x.hp<=0})].filter(Boolean);
    if(!targets.length)continue;m.mp-=a.mp;const mag=statsOf(m).mag;
    for(const t of targets){const ts=statsOf(t);if(t.hp<=0){if(a.revive)t.hp=Math.max(1,Math.round(ts.hp*a.revive));continue}t.hp=Math.min(ts.hp,t.hp+Math.round(a.pct?ts.hp*(a.pow>=99?1:a.pow):mag*a.pow*1.6+10))}
    SND.fx('heal');toast(esc(a.n),900)}}
async function charmMenu(root,m){const ids=Object.keys(CHARMS).filter(k=>k==='none'||(G.charms[k]||0)>0);const desc=winEl('plain',{x:4,y:150,w:W-8,h:26},root);
  const i=await pick({el:winEl('pop',{x:4,y:4,w:W-98,h:142},root),title:`${esc(m.name)}'s charm`,vis:9,sel:Math.max(0,ids.indexOf(m.charm||'none')),
    rows:ids.map(k=>({label:CHARMS[k].n,r:k==='none'?'':m.charm===k?'<span class="gold">worn</span>':charmFree(k)>0?'×'+charmFree(k):'<span class="dim">in use</span>',off:k!=='none'&&m.charm!==k&&charmFree(k)<=0,k})),
    render:r=>{desc.innerHTML=r?`<span class="small">${esc(CHARMS[r.k].desc||'Nothing worn.')}</span>`:''}});desc.remove();if(i<0)return;m.charm=ids[i];clampParty()}
async function settingsMenu(root){const opts={music:['On','Off'],sound:['On','Off'],speed:['Slow','Normal','Fast'],text:['Slow','Normal','Fast']};const names={music:'Music',sound:'Sound',speed:'Battle speed',text:'Text speed'};
  const val=k=>k==='music'||k==='sound'?(SET[k]?'On':'Off'):SET[k];
  const set=(k,d)=>{const l=opts[k];let i=(l.indexOf(val(k))+d+l.length)%l.length;if(k==='music'||k==='sound')SET[k]=l[i]==='On';else SET[k]=l[i];SND.music=SET.music;SND.on=SET.sound;saveSettings();SND.fx('cur')};
  const keys=Object.keys(opts);const rows=()=>keys.map(k=>({label:names[k],r:`◀ ${val(k)} ▶`,k}));
  await new Promise(res=>{const lw=new ListWin({el:winEl('pop',{x:4,y:4,w:W-98,h:80},root),title:'Settings',rows:rows(),vis:4,lr:(d,r)=>{set(r.k,d);lw.set(rows())},pick:r=>{set(r.k,1);lw.set(rows())},back:()=>{popModal(lw);res()}});pushModal(lw)})}
/* ---------- a member's numbers ---------- */
function statusScreen(m){return new Promise(res=>{const root=screenRoot();const s=statsOf(m),w=m.weapon,ws=weaponStats(w);
  const left=winEl('plain',{x:4,y:4,w:122,h:172},root);const[,pg]=previewCanvas(left,112,144,{x:4,y:14});paintDoll(pg,m.look,w,'idle',[24,4,56,72],2);
  const nm=el('div','gold');nm.style.cssText=`position:absolute;left:${px(6)};top:${px(2)}`;nm.textContent=m.name;left.appendChild(nm);
  const r=winEl('',{x:130,y:4,w:W-134,h:172},root);const ch=CHARMS[m.charm||'none'];
  const row=(a,b)=>`<div class="sr"><span class="dim">${a}</span><span>${b}</span></div>`;
  r.innerHTML=`<div class="ttl">Lv ${m.lv} <span class="small dim">next ${m.lv>=MAXLV?'—':fmt(needXP(m.lv)-m.xp)+' EXP'}</span></div>`+
    `<div class="stats">${row('HP',`${m.hp}/${s.hp}`)}${row('MP',`${m.mp}/${s.mp}`)}${row('ATK',s.atk)}${row('MAG',s.mag)}${row('DEF',s.def)}${row('M.DEF',s.mdef)}${row('SPD',s.spd)}${row('Crit',Math.round(s.crit*100)+'%')}</div>`+
    `<div class="small" style="margin-top:${px(3)}"><span class="gold">${esc(w.name)}</span> <span class="dim">${WTYPES[w.kind].n} · ${TIERS[w.tier||0]}${w.elem!=='None'?' · '+w.elem:''}</span></div>`+
    `<div class="tiny dim">Weapon: ATK ${ws.atk} MAG ${ws.mag} DEF ${ws.def} SPD ${ws.spd}${w.engr?` · “${esc(w.engr)}”`:''}</div>`+
    `<div class="small" style="margin-top:${px(2)}"><span class="dim">Charm</span> ${esc(ch.n)}</div>`+
    `<div class="small" style="margin-top:${px(2)}"><span class="dim">${esc(artLabel(m))}:</span> ${artsOf(m).map(a=>esc(a.n)).join(', ')||'—'}</div>`+
    `<div class="tiny" style="color:#ffa0e0">Limit: ${esc(limitOf(m).n)} ${barHTML(m.limit,100,'lim',30)}</div>`;
  const md={input(b){if(b==='a'||b==='b'){SND.fx('back');popModal(md);root.remove();res()}}};pushModal(md)})}
/* ---------- places in town ---------- */
async function openPlace(kind,zone){if(kind==='shop')return shopMenu(zone);if(kind==='inn')return innMenu(zone);if(kind==='home')return homeMenu();if(kind==='forge')return forgeMenu(zone);if(kind==='tailor')return tailorMenu(zone)}
function goldBar(root){const g=winEl('plain',{r:4,y:4,w:90,h:18},root);const upd=()=>{g.innerHTML=`<span class="gold">${fmt(G.gold)}</span><span class="dim small"> gold</span>`};upd();return upd}
async function shopMenu(zone){const S=SHOPS[zone]||SHOPS.emberwick,root=screenRoot();const upd=goldBar(root);const head=winEl('plain',{x:4,y:4,w:W-100,h:18},root);head.innerHTML=`<span class="gold">${esc(ZONES[zone].n)} Shop</span>`;
  await menuLoop({el:winEl('',{x:4,y:26,w:80,h:52},root),rows:[{label:'Buy'},{label:'Sell'},{label:'Leave'}],vis:3,act:async(row,i)=>{if(i===2)return 'close';
    if(i===0){const stock=S.items.map(id=>({id,n:ITEMS[id].n,p:ITEMS[id].price,desc:ITEMS[id].desc,charm:0})).concat(S.charms.map(id=>({id,n:CHARMS[id].n,p:CHARMS[id].price,desc:CHARMS[id].desc,charm:1})));
      const qty={};const desc=winEl('plain',{x:4,y:150,w:W-8,h:26},root);let lw;
      const rows=()=>stock.map(s=>{const q=qty[s.id]||1,own=s.charm?(G.charms[s.id]||0):(G.inv[s.id]||0);return{label:s.n,html:`<span>${esc(s.n)}</span><span class="tiny dim">${s.charm?'charm':'×'+own}</span>`,r:`${s.charm?'':`<span class="dim">◀</span>${q}<span class="dim">▶</span> `}<span class="${G.gold<s.p*q?'red':'gold'}">${fmt(s.p*q)}</span>`,s}});
      await new Promise(res=>{lw=new ListWin({el:winEl('pop',{x:88,y:26,w:W-92,h:120},root),title:'Buy',rows:rows(),vis:8,
        render:r=>{if(r)desc.innerHTML=`<span class="small">${esc(r.s.desc)}${r.s.charm?` <span class="dim">(own ${G.charms[r.s.id]||0})</span>`:''}</span>`},
        lr:(d,r,i2,rep)=>{if(r.s.charm)return;qty[r.s.id]=clamp((qty[r.s.id]||1)+d*(rep?5:1),1,99);SND.fx('cur');lw.set(rows())},
        pick:r=>{const q=r.s.charm?1:(qty[r.s.id]||1),cost=r.s.p*q;if(G.gold<cost){SND.fx('no');return}G.gold-=cost;if(r.s.charm)addCharm(r.s.id);else addItem(r.s.id,q);SND.fx('buy');upd();lw.set(rows())},
        back:()=>{popModal(lw);desc.remove();res()}});pushModal(lw)})}
    else{const desc=winEl('plain',{x:4,y:150,w:W-8,h:26},root);let lw;
      const rows=()=>Object.keys(G.inv).filter(k=>G.inv[k]>0&&ITEMS[k]&&ITEMS[k].price>0).map(k=>({label:ITEMS[k].n,r:`×${G.inv[k]} <span class="gold">${fmt(ITEMS[k].price/2)}</span>`,k})).concat(Object.keys(G.charms).filter(k=>charmFree(k)>0).map(k=>({label:CHARMS[k].n,r:`×${charmFree(k)} <span class="gold">${fmt(CHARMS[k].price/2)}</span>`,c:k})));
      await new Promise(res=>{lw=new ListWin({el:winEl('pop',{x:88,y:26,w:W-92,h:120},root),title:'Sell',rows:rows(),vis:8,empty:'Nothing to sell.',
        render:r=>{desc.innerHTML=r?`<span class="small">${esc(r.k?ITEMS[r.k].desc:CHARMS[r.c].desc)}</span>`:''},
        pick:r=>{if(r.k){addItem(r.k,-1);G.gold+=Math.floor(ITEMS[r.k].price/2)}else{G.charms[r.c]--;G.gold+=Math.floor(CHARMS[r.c].price/2)}SND.fx('buy');upd();lw.set(rows())},back:()=>{popModal(lw);desc.remove();res()}});pushModal(lw)})}}});
  root.remove()}
async function restHere(cost,text){if(cost>G.gold){await say('','You don\'t have enough gold.');return}G.gold-=cost;await fadeOut(400);healAll();SND.fx('heal');autosave(true);await sleep(300);await fadeIn(400);await say('',text)}
async function innMenu(zone){const c=INN[zone]||0;const r=await ask('Innkeeper',c?`A warm bed for the night? That's ${c} gold for everyone.`:'The beds are free tonight.',[c?`Rest (${c}g)`:'Rest','No thanks']);
  if(r===0)await restHere(c,'Good morning! Everyone is rested, and your journey is saved.')}
async function homeMenu(){const r=await ask('','Your little house by the forge. Your bed looks very soft.',['Sleep','Leave']);if(r===0)await restHere(0,'You wake up rested. Your journey is saved.')}
/* the forge: reforge with ore, infuse an element, reshape */
async function forgeMenu(zone){const root=screenRoot();const upd=goldBar(root);const head=winEl('plain',{x:4,y:4,w:W-100,h:18},root);
  const mats=()=>`<span class="gold">${esc(ZONES[zone].n)} Forge</span> <span class="small dim">Ore ×${G.inv.ore||0} · Starsteel ×${G.inv.starsteel||0}</span>`;head.innerHTML=mats();
  await menuLoop({el:winEl('',{x:4,y:26,w:100,h:66},root),rows:[{label:'Reforge'},{label:'Infuse'},{label:'Reshape'},{label:'Leave'}],vis:4,act:async(row,i)=>{if(i===3)return 'close';
    const box={x:108,y:26,w:W-112,h:150};
    if(i===0){const m=await pickMember(root,box,'Reforge whose weapon?');if(!m)return;const w=m.weapon,t=w.tier||0;if(t>=MAXTIER){await say('Smith',`${w.name} is already Legendary. There's nothing left to teach that metal.`);return}
      const c=forgeCost(t),next=Object.assign({},w,{tier:t+1}),a=weaponStats(w),b=weaponStats(next);const ok=G.gold>=c.gold&&(G.inv.ore||0)>=c.ore&&(G.inv.starsteel||0)>=c.star;
      const r=await ask('Smith',`${TIERS[t]} → ${TIERS[t+1]}: ATK ${a.atk}→${b.atk}, MAG ${a.mag}→${b.mag}, DEF ${a.def}→${b.def}.\nIt takes ${fmt(c.gold)} gold, ${c.ore} ore${c.star?`, ${c.star} starsteel`:''}.`,[ok?'Reforge it':'Not enough materials','Never mind']);
      if(r===0&&ok){G.gold-=c.gold;addItem('ore',-c.ore);if(c.star)addItem('starsteel',-c.star);w.tier=t+1;for(let k=0;k<3;k++)setTimeout(()=>SND.fx('heavy'),k*260);await sleep(800);SND.fx('level');upd();head.innerHTML=mats();await say('Smith',`Done. ${w.name} is ${TIERS[w.tier]} now. Feel the weight of it.`)}
      else if(r===0)SND.fx('no')}
    else if(i===1){const m=await pickMember(root,box,'Infuse whose weapon?');if(!m)return;const els=['None'].concat(Object.keys(EMBERS).filter(k=>G.flags[k]).map(k=>EMBERS[k].elem));
      if(els.length<2){await say('Smith','You haven\'t learned an element to put in it yet.');return}
      const j=await pick({el:winEl('pop',box,root),title:'Element (100 gold)',vis:6,sel:Math.max(0,els.indexOf(m.weapon.elem)),rows:els.map(e=>({label:e,html:`<span style="color:${ELEMS[e].c}">${e==='None'?'No element':ELEMS[e].n}</span>`,r:e===m.weapon.elem?'<span class="gold">now</span>':''}))});
      if(j<0||els[j]===m.weapon.elem)return;if(G.gold<100){SND.fx('no');await say('Smith','That\'s 100 gold for the coal alone.');return}G.gold-=100;m.weapon.elem=els[j];SND.fx('fire');upd();toast(`${esc(m.weapon.name)} is ${els[j]==='None'?'plain spellsteel again':'infused with '+els[j]}.`)}
    else if(i===2){const m=hero();root.style.visibility='hidden';await forgeDesign(m,{heading:'Reshape'});root.style.visibility=''}}});
  root.remove()}
/* the tailor: rare pieces for sale, and a mirror */
async function tailorMenu(zone){const root=screenRoot();const upd=goldBar(root);const head=winEl('plain',{x:4,y:4,w:W-100,h:18},root);head.innerHTML=`<span class="gold">${esc(ZONES[zone].n)} Tailor</span>`;
  const stock=TAILOR[zone]||[];let sel=0;const CATN={hat:'Hat',top:'Top',bot:'Bottoms',shoes:'Shoes',back:'Back',face:'Face',hair:'Hair'};
  await menuLoop({el:winEl('',{x:4,y:26,w:100,h:52},root),rows:[{label:'Buy'},{label:'Dress up'},{label:'Leave'}],vis:3,act:async(row,i)=>{if(i===2)return 'close';
    if(i===0){let lw;const desc=winEl('plain',{x:4,y:150,w:W-8,h:26},root);
      const rows=()=>stock.map(([c,n,p])=>{const own=!!G.owned[c+':'+n];return{label:n,html:`<span>${esc(n)}</span><span class="tiny dim">${CATN[c]}</span>`,r:own?'<span class="green">owned</span>':`<span class="${G.gold<p?'red':'gold'}">${fmt(p)}</span>`,c,n,p,own}});
      await new Promise(res=>{lw=new ListWin({el:winEl('pop',{x:108,y:26,w:W-112,h:120},root),title:'Rare pieces',rows:rows(),vis:8,empty:'Nothing today.',
        render:r=>{desc.innerHTML=r?`<span class="small">A ${CATN[r.c].toLowerCase()} piece. Once bought, everyone in the party can wear it.</span>`:''},
        pick:r=>{if(r.own||G.gold<r.p){SND.fx('no');return}G.gold-=r.p;G.owned[r.c+':'+r.n]=1;SND.fx('buy');upd();lw.set(rows());toast(`${esc(r.n)} added to the wardrobe!`)},back:()=>{popModal(lw);desc.remove();res()}});pushModal(lw)})}
    else{root.style.visibility='hidden';await wardrobe(hero());root.style.visibility=''}}});
  root.remove()}
