/* ================= quests: things to do around the world, each paying wish gems ================= */
const qKills=(...ids)=>()=>ids.reduce((s,id)=>s+((G.kills||{})[id]||0),0);
const qFlag=k=>()=>G.flags[k]?1:0;
const qTier=()=>Math.max(0,...allMembers().map(m=>m.weapon.tier||0));
const qWished=()=>allMembers().filter(m=>WISH_IDS.includes(m.id)).length;
/* [id, kind, name, what to do, how many, how far along, gems] */
const QUESTS=[
 ['q_reborn','Story','Out of Office','Wake up somewhere that isn\'t your apartment.',1,qFlag('reborn'),50],
 ['q_dusk','Story','One Quiet Day','Help out around Larkfield until the sun goes down.',1,qFlag('dusk'),100],
 ['q_run','Story','Run','Get out of Larkfield.',1,qFlag('c1'),150],
 ['q_wagon','Story','The Tax Wagon','Take the strongbox at Hangman\'s Bend.',1,qFlag('wagon'),200],
 ['q_hound','Story','The Hound','Survive Garrick the Hound.',1,qFlag('hound'),300],
 ['q_wanted','Story','Wanted','Bring Rook the box, and the letter.',1,qFlag('c1done'),200],
 ['q_gate','Story','A Different Face','Get past the Greyford gate guard.',1,qFlag('ingf'),150],
 ['q_kell','Story','The Tollhouse','Face Sir Kell and free the prisoners.',1,qFlag('kell'),500],
 ['q_eggs','Chores','Eggs for Nell','Take the eggs to Nell, past the well.',1,qFlag('nelldone'),50],
 ['q_fence','Chores','Mending Fences','Fix the fence by the wheat with your father.',1,qFlag('fencedone'),50],
 ['q_wynn','Chores','The Hill','Talk to Wynn.',1,qFlag('wynn1'),30],
 ['q_stew','Chores','Moss\'s Stew','Let Moss feed you.',1,qFlag('mossbowl'),50],
 ['q_steel','Chores','Spellsteel','Find out what the knife is made of.',1,qFlag('forge'),150],
 ['q_jun','Friends','Two Knives','Jun joins you.',1,()=>owned('jun')?1:0,100],
 ['q_moss','Friends','The Woodcutter','Moss joins you.',1,()=>owned('moss')?1:0,100],
 ['q_wolf','Bounty','Road Wolves','Defeat 10 Road Wolves.',10,qKills('roadwolf'),120],
 ['q_crow','Bounty','Murder of Crows','Defeat 8 Crow Swarms.',8,qKills('crowr'),120],
 ['q_thorn','Bounty','Weeding the Bend','Defeat 6 Thornlings.',6,qKills('thornr'),120],
 ['q_moth','Bounty','Lights Out','Defeat 6 Dusk Moths.',6,qKills('mothr'),120],
 ['q_boar','Bounty','Bristleback Hunt','Defeat 5 Bristlebacks.',5,qKills('boar'),160],
 ['q_baron','Bounty','The Baron\'s Men','Defeat 10 Road Wardens or Crossbowmen.',10,qKills('roadguard','crossbow'),200],
 ['q_rx5','Deeds','Sparks Fly','Set off 5 element reactions.',5,()=>G.rx||0,120],
 ['q_rx25','Deeds','Chain Reaction','Set off 25 element reactions.',25,()=>G.rx||0,300],
 ['q_bal','Deeds','Balanced Party','Field a Tank, a Healer and a DPS together.',1,()=>new Set(G.party.slice(0,3).map(roleOf)).size===3?1:0,150],
 ['q_b10','Deeds','Blooded','Win 10 battles.',10,()=>G.battles||0,100],
 ['q_b25','Deeds','Seasoned','Win 25 battles.',25,()=>G.battles||0,150],
 ['q_b50','Deeds','Veteran','Win 50 battles.',50,()=>G.battles||0,250],
 ['q_b100','Deeds','Legend of the Road','Win 100 battles.',100,()=>G.battles||0,400],
 ['q_c5','Deeds','Treasure Hunter','Open 5 chests.',5,()=>Object.keys(G.opened||{}).length,100],
 ['q_c12','Deeds','Nothing Left Unopened','Open 12 chests.',12,()=>Object.keys(G.opened||{}).length,250],
 ['q_w10','Deeds','First Wishes','Make 10 wishes.',10,()=>G.wishes||0,100],
 ['q_w50','Deeds','Stargazer','Make 50 wishes.',50,()=>G.wishes||0,300],
 ['q_r3','Deeds','New Friends','Wish 3 heroes into your company.',3,qWished,150],
 ['q_r8','Deeds','Full House','Wish 8 heroes into your company.',8,qWished,300],
 ['q_r15','Deeds','Hall of Heroes','Wish 15 heroes into your company.',15,qWished,600],
 ['q_t2','Forge','Sharper Still','Reforge a weapon to Keen.',2,qTier,150],
 ['q_t4','Forge','Starforged','Reforge a weapon to Starforged.',4,qTier,350],
 ['q_inf','Forge','Kindled','Infuse a weapon with an element at an anvil.',1,()=>allMembers().some(m=>m.weapon.elem&&m.weapon.elem!=='None')?1:0,100],
];
/* hand out whatever is finished, with a note for each */
let _qNote=Promise.resolve();
function checkQuests(){if(!G)return 0;G.qdone=G.qdone||{};const done=[];
  for(const[id,kind,n,d,need,prog,gems]of QUESTS){if(G.qdone[id])continue;let p=0;try{p=prog()}catch(e){}if(p>=need){G.qdone[id]=1;G.gems=(G.gems||0)+gems;done.push([n,gems])}}
  for(const[n,g]of done)_qNote=_qNote.then(()=>{SND.fx('chest');toast(`<span class="gold">Quest done!</span> ${esc(n)} <span class="blue">◆+${g}</span>`,2200);return sleep(2300)});
  return done.length}
/* the quest log */
async function questMenu(root){const kinds=['All','Story','Chores','Bounty','Deeds','Forge','Friends'];let tab=0;checkQuests();
  const desc=winEl('plain',{x:4,y:150,w:W-8,h:26},root);let lw;
  const rows=()=>QUESTS.filter(q=>tab===0||q[1]===kinds[tab]).map(([id,kind,n,d,need,prog,gems])=>{let p=0;try{p=Math.min(need,prog())}catch(e){}const dn=!!(G.qdone||{})[id];
    return{label:n,html:`<span class="${dn?'green':''}">${dn?'✓ ':''}${esc(n)}</span>`,r:dn?'<span class="dim tiny">done</span>':`<span class="dim tiny">${p}/${need}</span> <span class="blue">◆${gems}</span>`,d,kind}});
  const title=()=>`Quests <span class="small dim">◀ ${kinds[tab]} ▶ · ${Object.keys(G.qdone||{}).length}/${QUESTS.length} done</span>`;
  await new Promise(res=>{lw=new ListWin({el:winEl('pop',{x:4,y:4,w:W-8,h:142},root),title:title(),rows:rows(),vis:8,
    render:r=>{desc.innerHTML=r?`<span class="small"><span class="dim">${r.kind}:</span> ${esc(r.d)}</span>`:''},
    lr:d=>{tab=(tab+d+kinds.length)%kinds.length;SND.fx('cur');lw.tt.innerHTML=title();lw.set(rows(),0)},
    back:()=>{popModal(lw);desc.remove();res()}});pushModal(lw)})}
/* ---------- the best in each role: who is strongest at each job ---------- */
const TIER={gorm:'S',moss:'A',ferro:'A',hildr:'A',tilda:'B',orrin:'B',
  olive:'S',bel:'S',lumi:'A',sana:'A',mei:'B',thea:'B',
  taro:'S',rue:'S',jun:'A',cass:'A',vex:'A',juno:'B',dax:'B',zed:'B',brisa:'B'};
const TIER_ORDER=['gorm','moss','ferro','hildr','tilda','orrin','olive','bel','lumi','sana','mei','thea','taro','rue','jun','cass','vex','juno','dax','zed','brisa'];
const TIER_COL={S:'#ffb84a',A:'#c8a0ff',B:'#8ad0ff'};
const TIER_WHY={S:'Best in role: ★5, the strongest stats in the game.',A:'Strong: a sound pick for any party.',B:'Solid: good with the right bond or reaction.'};
function bestHeroes(parent){return new Promise(res=>{const roles=['tank','healer','dps'];let tab=0;const root=el('div','screen fade darken');(parent||UI).appendChild(root);
  const left=winEl('plain',{x:4,y:4,w:122,h:172},root);const[,pg]=previewCanvas(left,112,96,{x:4,y:12});const info=el('div','hlinfo');info.style.cssText=`position:absolute;left:${px(6)};right:${px(4)};top:${px(110)}`;left.appendChild(info);
  const ids=()=>TIER_ORDER.filter(id=>CHARS[id]&&CHARS[id].role===roles[tab]);
  const rows=()=>ids().map(id=>{const C=CHARS[id],t=TIER[id],e=ELEMS[C.el]||ELEMS.None;
    return{id,label:C.n,html:`<span class="tg" style="background:${TIER_COL[t]}">${t}</span><i class="eld" style="background:${e.c}"></i><span>${esc(C.n)}</span><span class="tiny ${C.rar===5?'gold':'blue'}">${C.rar?'★'+C.rar:'story'}</span>`,r:owned(id)?'<span class="green tiny">✓ yours</span>':'<span class="dim tiny">—</span>'}});
  const title=()=>`Best ${ROLES[roles[tab]].n}${roles[tab]==='dps'?'':'s'} <span class="small dim">◀ ▶ strongest first</span>`;
  const show=r=>{if(!r)return;const id=r.id,C=CHARS[id],m=allMembers().find(q=>q.id===id),w=m?m.weapon:Object.assign(newWeapon(C.weapon.kind),C.weapon,{parts:Object.assign(newWeapon(C.weapon.kind).parts,C.weapon.parts||{})});
    paintDoll(pg,m?m.look:C.look,w,'ready',[24,10,56,48],2);const e=ELEMS[C.el]||ELEMS.None,bonds=SYN.filter(y=>y.ids.includes(id)).map(y=>`${y.n} (with ${y.ids.filter(x=>x!==id).map(x=>CHARS[x].n).join(', ')})`);
    info.innerHTML=`<div class="gold">${esc(C.n)} <span class="tiny" style="color:${TIER_COL[TIER[id]]}">Tier ${TIER[id]}</span></div><div class="tiny dim">${ROLES[C.role].n} · <span style="color:${e.c}">${e.n}</span> · ${WTYPES[w.kind].n}</div><div class="tiny">${TIER_WHY[TIER[id]]}</div>${bonds.length?`<div class="tiny dim">Bond: ${esc(bonds[0])}</div>`:''}<div class="tiny ${m?'green':'dim'}">${m?'In your company':C.rar?'Not met yet (wish for them)':'Joins in the story'}</div>`};
  const lw=new ListWin({el:winEl('',{x:130,y:4,w:W-134,h:172},root),title:title(),rows:rows(),vis:8,foot:`<span class="tiny dim">S is best, then A, then B · ★5: ${Math.round(WISH.rate5*100)}% a wish</span>`,
    move:show,render:show,lr:d=>{tab=(tab+d+3)%3;SND.fx('cur');lw.tt.innerHTML=title();lw.set(rows(),0)},back:()=>{popModal(lw);root.remove();res()}});pushModal(lw)})}
