/* ===================== UI: dialogue, lists, menus, shops ===================== */
let uiCount=0;
const uiOpen=()=>uiCount>0;
function win(cls,html,style){const w=el('div','win '+(cls||''),html);if(style)Object.assign(w.style,style);UI.appendChild(w);return w}

/* ---------- dialogue ---------- */
let dlgEl=null,dlgKeep=0;
function tokenize(html){const out=[];const re=/(<[^>]+>)|([^<])/g;let m;while((m=re.exec(html)))out.push(m[1]?{tag:m[1]}:{ch:m[2]});return out}
function say(who,text,{keep=false,auto=0}={}){
  uiCount++;clearTimeout(dlgT);
  if(!dlgEl){dlgEl=win('dlg','')}dlgEl.dataset.live=1;dlgEl.classList.toggle('top',MODE==='field'&&playerLow());
  dlgEl.innerHTML=(who?`<div class="who">${who}</div>`:'')+'<div class="txt"></div>';
  const txt=dlgEl.querySelector('.txt');const toks=tokenize(text);let shown=0,done=false,timer;
  const total=toks.filter(t=>t.ch).length;
  const render=n=>{let s='',c=0;for(const t of toks){if(t.tag)s+=t.tag;else{if(c>=n)break;s+=t.ch;c++}}txt.innerHTML=s};
  return new Promise(res=>{
    const finish=()=>{clearInterval(timer);done=true;render(total);if(!keep&&!auto)dlgEl.insertAdjacentHTML('beforeend','<div class="more"></div>');if(keep||auto){off();uiCount--;if(auto)setTimeout(()=>{closeDlg();res()},auto);else res()}};
    timer=setInterval(()=>{shown+=2;if(shown%6===0&&who)AU.play('talk');render(shown);if(shown>=total)finish()},28);
    const off=pushInput(b=>{if(b!=='a'&&b!=='b')return;if(!done){finish();return}
      if(keep||auto)return;off();uiCount--;if(dlgEl)delete dlgEl.dataset.live;closeDlg();res()});
  })}
let dlgT=0;function closeDlg(){clearTimeout(dlgT);const d=dlgEl;dlgT=setTimeout(()=>{if(dlgEl===d&&d&&!d.dataset.live){d.remove();dlgEl=null}},40)}
async function lines(arr){for(const [who,t] of arr)await say(who,t)}

/* ---------- lists ---------- */
// items: [{label, right, off, desc}] ; returns index or -1
function listWin(items,{cls='',style={},title='',rows=8,start=0,cancel=true,onMove=null,keepOpen=false,hint='',bind=null}={}){
  uiCount++;const w=win(cls,(title?`<h3>${title}</h3>`:'')+'<div class="list"></div>'+(hint?`<div class="small">${hint}</div>`:''),style);const L=w.querySelector('.list');
  let i=clamp(start,0,Math.max(0,items.length-1)),top=0;
  const draw=()=>{if(i<top)top=i;if(i>=top+rows)top=i-rows+1;L.innerHTML='';
    items.slice(top,top+rows).forEach((it,k)=>{const o=el('div','opt'+(top+k===i?' sel':'')+(it.off?' off':''),`<span>${it.label}</span>${it.right!=null?`<span class="r">${it.right}</span>`:''}`);L.appendChild(o)});
    if(items.length>rows)L.insertAdjacentHTML('beforeend',`<div class="small" style="text-align:right">${top>0?'▲':''} ${top+rows<items.length?'▼':''}</div>`);
    if(onMove)onMove(i,items[i])};
  draw();
  const p=new Promise(res=>{const off=pushInput((b)=>{
    if(!items.length){if(b==='b'||b==='a'){off();uiCount--;if(!keepOpen)w.remove();res(-1)}return}
    if(b==='up'){i=(i-1+items.length)%items.length;AU.play('tick');draw()}
    else if(b==='down'){i=(i+1)%items.length;AU.play('tick');draw()}
    else if(b==='left'&&items.length>rows){i=Math.max(0,i-rows);AU.play('tick');draw()}
    else if(b==='right'&&items.length>rows){i=Math.min(items.length-1,i+rows);AU.play('tick');draw()}
    else if(b==='a'){if(items[i].off){AU.play('buzz');return}AU.play('ok');off();uiCount--;if(!keepOpen)w.remove();res(i)}
    else if(b==='b'&&cancel){AU.play('back');off();uiCount--;if(!keepOpen)w.remove();res(-1)}});
    if(bind){let done=false;bind(k=>{if(done||!items[k]||items[k].off)return;done=true;off();uiCount--;if(!keepOpen)w.remove();res(k)});const r0=res;res=v=>{done=true;r0(v)}}});
  p.el=w;return p}
async function ask(who,text,opts,{cancel=-1}={}){
  await say(who,text,{keep:true});
  const r=await listWin(opts.map(o=>({label:o})),{cls:'',style:{right:'.5rem',bottom:'6.4rem'},cancel:cancel>=0});
  closeDlgForce();return r<0?cancel:r}
function closeDlgForce(){if(dlgEl){dlgEl.remove();dlgEl=null}}

/* ---------- small helpers ---------- */
function heroCanvas(id,dir='down'){const c=mk(16,24);c.getContext('2d').drawImage(personImg(LOOKS[HEROES[id].look],dir,0),0,0);c.style.imageRendering='pixelated';return c}
function bar(v,max,mp){return`<div class="bar${mp?' mp':''}"><i style="width:${max?clamp(v/max*100,0,100):0}%"></i></div>`}
function heroCard(h,{sel=false}={}){const s=stats(h);const d=el('div','card'+(sel?' sel':''));d.appendChild(heroCanvas(h.id));
  const st=h.hp<=0?'<span class="bad">KO</span>':h.st.poison?'<span class="bad">Poison</span>':'';
  d.insertAdjacentHTML('beforeend',`<div><b>${HEROES[h.id].name}</b> <span class="small">Lv ${h.lv}</span> ${st}</div>
    <div class="hpc" style="font-size:.8rem">HP ${h.hp}/${s.hp}${bar(h.hp,s.hp)}</div>${S.lore>=3?'':`<div class="mpc" style="font-size:.8rem">MP ${h.mp}/${s.mp}${bar(h.mp,s.mp,1)}</div>`}`);return d}
function pickHero({title='Who?',filter=null,style={left:'.4rem',right:'.4rem',top:'.4rem'}}={}){
  const hs=partyHeroes();return listWin(hs.map(h=>{const s=stats(h);return{label:`${HEROES[h.id].name} <span class="small">Lv${h.lv}</span>`,right:`<span class="hpc">${h.hp}/${s.hp}</span>${S.lore>=3?'':` <span class="mpc">${h.mp}</span>`}`,off:filter&&!filter(h)}}),{title,style})}

/* ---------- applying items & field skills ---------- */
function applyHeal(h,kind,{amt,pct,mag}){const s=stats(h);
  if(kind==='revive'){if(h.hp>0)return 0;h.hp=Math.max(1,Math.round(s.hp*pct));h.st={};return h.hp}
  if(h.hp<=0)return 0;
  if(kind==='heal'){const v=amt!=null?amt:Math.round(s.hp*pct);const before=h.hp;h.hp=Math.min(s.hp,h.hp+v);return h.hp-before}
  if(kind==='mp'){const b=h.mp;h.mp=Math.min(s.mp,h.mp+amt);return h.mp-b}
  if(kind==='cure'){h.st={};return 1}
  if(kind==='full'){h.hp=s.hp;h.mp=s.mp;h.st={};return 1}return 0}
function itemUsable(id,h){const it=ITEMS[id];if(it.kind==='revive')return h.hp<=0;if(h.hp<=0)return false;const s=stats(h);
  if(it.kind==='heal')return h.hp<s.hp;if(it.kind==='mp')return h.mp<s.mp;if(it.kind==='cure')return!!(h.st.poison||h.st.sleep);if(it.kind==='full')return h.hp<s.hp||h.mp<s.mp;return false}

/* ---------- the START menu ---------- */
async function openMainMenu(){
  uiCount++;let idx=0;
  while(true){
    const box=el('div','win mm');UI.appendChild(box);
    const pw=el('div','win','');pw.style.position='relative';pw.style.display='flex';pw.style.flexDirection='column';pw.style.gap='.35rem';
    partyHeroes().forEach(h=>pw.appendChild(heroCard(h)));box.appendChild(pw);
    const info=el('div','win',`<div class="statgrid"><span>${S.lore>=2?'Coins':'Pearls'}</span><span class="gold">${S.gold}</span>${R4()&&S.bounty?`<span>Bounty</span><span class="bad">${S.bounty.toLocaleString()}</span>`:''}<span>Time</span><span>${fmtTime(S.time)}</span>${S.lore>=3?(R4()?`<span>Form</span><span>${FORMS[S.form].short}</span>`:''):`<span>Tide</span><span>${F('tidepower')?(S.tide==='ebb'?'<span style="color:#fff1b8">Ebb</span>':'<span style="color:#9fd6ff">Flood</span>'):'—'}</span>`}</div><div class="small" style="margin-top:.3rem">${FD.map.name}</div>`);
    info.style.position='relative';
    const row=el('div','');row.style.cssText='display:flex;gap:.35rem;align-items:flex-start';box.appendChild(row);
    const cmds=R4()?['Items','Forms','Equip','Status','Save','Settings',...(F('face')?['Look']:[])]:['Items','Skills','Equip','Status','Save','Settings',...(S.lore===3?['Look']:[])];
    const lw=listWin(cmds.map(c=>({label:c,off:c==='Save'&&!canSave()})),{start:idx,style:{position:'relative',flex:'1'}});
    lw.el.remove();row.appendChild(lw.el);row.appendChild(info);
    const tip=el('div','win small',F('tidepower')?'SELECT calls the tide. B closes.':R4()&&S.forms.length>1?'SELECT changes form. B closes.':'B closes.');tip.style.position='relative';box.appendChild(tip);
    const c=await lw;box.remove();
    if(c<0)break;idx=c;
    if(c===0)await menuItems();else if(c===1)await(R4()?menuForms():menuSkills());else if(c===2)await menuEquip();else if(c===3)await menuStatus();else if(c===4)await menuSave();else if(c===5)await menuSettings();else if(c===6){box.remove();await customizeHero({title:'Change your look',canCancel:true})}
  }
  uiCount--}
function canSave(){return!!FD.map&&!FD.map.noSave}
function screenBox(){const b=el('div','win mm');UI.appendChild(b);return b}
async function menuItems(){
  let idx=0;while(true){
    const box=screenBox();const desc=el('div','win desc','');desc.style.position='relative';box.appendChild(desc);
    const ids=Object.keys(S.inv).filter(k=>S.inv[k]>0);
    const items=ids.map(id=>({label:ITEMS[id].name,right:'×'+S.inv[id],off:ITEMS[id].battle}));
    S.keys.forEach(k=>items.push({label:'<span class="gold">'+ITEMS[k].name+'</span>',right:ITEMS[k].view?'look':'key',off:!ITEMS[k].view}));
    if(!items.length)items.push({label:'(nothing)',off:true});
    const lw=listWin(items,{title:'Items',start:idx,rows:10,style:{position:'relative'},onMove:(i)=>{const id=i<ids.length?ids[i]:S.keys[i-ids.length];desc.innerHTML=id&&ITEMS[id]?ITEMS[id].desc:''}});
    lw.el.remove();box.appendChild(lw.el);const c=await lw;box.remove();
    if(c>=ids.length&&c<items.length){idx=c;const k=S.keys[c-ids.length];if(k&&ITEMS[k].view==='poster')await showPoster();continue}
    if(c<0||c>=ids.length)return;idx=c;const id=ids[c],it=ITEMS[id];
    while(S.inv[id]>0){const t=await pickHero({title:it.name+' → who?',filter:h=>itemUsable(id,h)});if(t<0)break;
      const h=partyHeroes()[t];applyHeal(h,it.kind,it);AU.play('heal');addItem(id,-1)}
  }}
async function menuSkills(){
  while(true){const w=await pickHero({title:'Whose skills?'});if(w<0)return;const h=partyHeroes()[w];
    while(true){const box=screenBox();const desc=el('div','win desc','');desc.style.position='relative';box.appendChild(desc);
      const sk=heroSkills(h);const field=s=>['heal','cure','revive'].includes(SKILLS[s].kind);
      const lw=listWin(sk.map(s=>({label:SKILLS[s].name,right:SKILLS[s].mp+' MP',off:!field(s)||h.mp<SKILLS[s].mp||h.hp<=0})),{title:HEROES[h.id].name+' — '+HEROES[h.id].cmd+` <span class="mpc">MP ${h.mp}</span>`,rows:9,style:{position:'relative'},onMove:i=>{desc.innerHTML=SKILLS[sk[i]].desc}});
      lw.el.remove();box.appendChild(lw.el);const c=await lw;box.remove();if(c<0)break;
      const s=SKILLS[sk[c]];
      if(s.tgt==='allies'){h.mp-=s.mp;for(const t of partyHeroes())if(t.hp>0)applyHeal(t,'heal',{amt:Math.round(stats(h).mag*s.pow+s.base)});AU.play('heal');continue}
      const t=await pickHero({title:s.name+' → who?',filter:x=>s.kind==='revive'?x.hp<=0:x.hp>0});if(t<0)continue;const tg=partyHeroes()[t];
      h.mp-=s.mp;if(s.kind==='heal')applyHeal(tg,'heal',s.pct?{pct:s.pct}:{amt:Math.round(stats(h).mag*s.pow+s.base)});else if(s.kind==='cure')applyHeal(tg,'cure',{});else applyHeal(tg,'revive',{pct:s.pct});AU.play('heal')}}}
const SLOTN={w:'Weapon',a:'Armor',c:'Charm'};
function gearLine(id){const it=GEAR[id];if(!it)return'';return['atk','def','mag','spd','mp'].filter(k=>it[k]).map(k=>k.toUpperCase()+'+'+it[k]).join(' ')+(it.immune?' · no '+it.immune:'')}
async function menuEquip(){
  while(true){const w=await pickHero({title:'Equip whom?'});if(w<0)return;const h=partyHeroes()[w];let si=0;
    while(true){const box=screenBox();const st=el('div','win','');st.style.position='relative';box.appendChild(st);
      const showStats=(alt)=>{const a=stats(h);let b=null;if(alt!==undefined){const old=h.eq[alt.slot];h.eq[alt.slot]=alt.id;b=stats(h);h.eq[alt.slot]=old}
        st.innerHTML=`<h3>${HEROES[h.id].name}</h3><div class="statgrid">`+['atk','def','mag','spd'].map(k=>`<span>${k.toUpperCase()}</span><span>${a[k]}${b&&b[k]!==a[k]?` → <span class="${b[k]>a[k]?'up':'down'}">${b[k]}</span>`:''}</span>`).join('')+'</div>'};
      showStats();
      const slots=['w','a','c'];
      const lw=listWin(slots.map(s=>({label:`<span class="small">${SLOTN[s]}</span> ${h.eq[s]?GEAR[h.eq[s]].name:'—'}`})),{title:'Gear',start:si,style:{position:'relative'}});
      lw.el.remove();box.appendChild(lw.el);const c=await lw;box.remove();if(c<0)break;si=c;const slot=slots[c];
      const opts=Object.keys(S.gear).filter(id=>S.gear[id]>0&&GEAR[id].slot===slot&&(!GEAR[id].who||GEAR[id].who.includes(h.id)));
      const box2=screenBox();const st2=el('div','win','');st2.style.position='relative';box2.appendChild(st2);
      const items=opts.map(id=>({label:GEAR[id].name,right:'×'+S.gear[id]}));if(slot!=='w')items.push({label:'(remove)'});
      const lw2=listWin(items,{title:SLOTN[slot],rows:8,style:{position:'relative'},onMove:(i)=>{const id=opts[i];const save=st;st2.innerHTML='';
        const a=stats(h);const old=h.eq[slot];h.eq[slot]=id||null;const b=stats(h);h.eq[slot]=old;
        st2.innerHTML=`<h3>${HEROES[h.id].name}</h3><div class="statgrid">`+['atk','def','mag','spd'].map(k=>`<span>${k.toUpperCase()}</span><span>${a[k]}${b[k]!==a[k]?` → <span class="${b[k]>a[k]?'up':'down'}">${b[k]}</span>`:''}</span>`).join('')+`</div><div class="small">${id?gearLine(id):''}</div>`}});
      lw2.el.remove();box2.appendChild(lw2.el);const c2=await lw2;box2.remove();if(c2<0)continue;
      const nid=opts[c2]||null;const old=h.eq[slot];if(old)addItem(old,1);if(nid)S.gear[nid]--;if(nid&&S.gear[nid]<=0)delete S.gear[nid];h.eq[slot]=nid;
      const s=stats(h);h.hp=Math.min(h.hp,s.hp);h.mp=Math.min(h.mp,s.mp);AU.play('ok')}}}
async function menuStatus(){const w=await pickHero({title:'Status'});if(w<0)return;const h=partyHeroes()[w];const s=stats(h),H=HEROES[h.id];
  const box=screenBox();const d=el('div','win','');d.style.position='relative';box.appendChild(d);
  d.appendChild(heroCard(h));d.insertAdjacentHTML('beforeend',`<div class="small" style="margin:.3rem 0">${H.cls}</div><div class="statgrid">
    ${['atk','def','mag','spd'].map(k=>`<span>${k.toUpperCase()}</span><span>${s[k]}</span>`).join('')}
    <span>EXP</span><span>${h.exp}</span><span>Next</span><span>${h.lv>=40?'—':expFor(h.lv+1)-h.exp}</span></div>
    <div class="small" style="margin-top:.3rem">${['w','a','c'].map(k=>SLOTN[k]+': '+(h.eq[k]?GEAR[h.eq[k]].name:'—')).join('<br>')}</div>
    <div class="small" style="margin-top:.3rem">${H.cmd}: ${heroSkills(h).map(x=>SKILLS[x].name).join(', ')}</div>`);
  uiCount++;await new Promise(r=>{const off=pushInput(b=>{if(b==='a'||b==='b'){AU.play('back');off();r()}})});uiCount--;box.remove()}
function slotLabel(i){const v=loadSlot(i);const nm=i?`Slot ${i}`:'Autosave';if(!v)return{label:`${nm} <span class="small">— empty</span>`};
  const h=v.heroes[v.party[0]];return{label:`${nm} <span class="small">${v.lore===3?'Old story · ':''}${(MAPS[v.map]||{}).name||''}</span>`,right:`Lv${h.lv} · ${fmtTime(v.time)}`}}
async function menuSave(){const c=await listWin([1,2,3].map(slotLabel),{title:'Save to which slot?',style:{left:'.4rem',right:'.4rem',top:'.4rem'}});if(c<0)return;
  if(loadSlot(c+1)){const y=await ask(null,'Write over this save?',['Yes','No'],{cancel:1});if(y!==0)return}
  if(saveGame(c+1)){AU.play('chest');await say(null,'Saved.')}else await say(null,'Could not save here.')}
async function menuSettings(){let i=0;while(true){const c=await listWin([{label:'Music',right:AU.musicOn?'On':'Off'},{label:'Sound',right:AU.sfxOn?'On':'Off'},{label:'Encounters',right:S.flags.noenc?'Off':'On'}],{title:'Settings',start:i,style:{left:'.4rem',right:'.4rem',top:'.4rem'},hint:'Encounters off is for exploring. You earn no EXP.'});if(c<0)return;i=c;
  if(c===0)AU.setMusic(!AU.musicOn);if(c===1)AU.setSfx(!AU.sfxOn);if(c===2)S.flags.noenc=S.flags.noenc?0:1;storeSettings()}}
function storeSettings(){try{localStorage.setItem('drownedmoon-settings',JSON.stringify({m:AU.musicOn,s:AU.sfxOn}))}catch(e){}}
try{const st=JSON.parse(localStorage.getItem('drownedmoon-settings')||'null');if(st){AU.setMusic(st.m);AU.setSfx(st.s)}}catch(e){}

/* ---------- shops & inns ---------- */
async function shop(who,greet,stock){
  await say(who,greet);
  while(true){const c=await listWin([{label:'Buy'},{label:'Sell'},{label:'Leave'}],{style:{left:'.4rem',top:'.4rem'}});
    if(c<0||c===2)break;
    if(c===0){let idx=0;while(true){const box=screenBox();const desc=el('div','win desc','');desc.style.position='relative';box.appendChild(desc);
        const gold=el('div','win',`${S.lore>=2?'Coins':'Pearls'} <span class="gold">${S.gold}</span>`);gold.style.position='relative';box.appendChild(gold);
        const it=id=>ITEMS[id]||GEAR[id];
        const lw=listWin(stock.map(id=>({label:it(id).name,right:it(id).price,off:it(id).price>S.gold})),{title:'Buy',start:idx,rows:9,style:{position:'relative'},onMove:i=>{const id=stock[i];const x=it(id);
          desc.innerHTML=ITEMS[id]?x.desc+` <span class="small">(have ${S.inv[id]||0})</span>`:`${gearLine(id)}<br><span class="small">${x.who?x.who.map(w=>HEROES[w].name).join(', '):'Anyone'} · have ${S.gear[id]||0}</span>`}});
        lw.el.remove();box.appendChild(lw.el);const k=await lw;box.remove();if(k<0)break;idx=k;
        const id=stock[k],x=it(id);let n=1;
        if(ITEMS[id]){n=await qty(x.name,x.price);if(!n)continue}
        S.gold-=x.price*n;addItem(id,n);AU.play('buy');
        if(GEAR[id]){const who=(x.who||S.party).filter(w=>S.party.includes(w));if(who.length){const y=await ask(who.length===1?HEROES[who[0]].name:null,`Equip the ${x.name} now?`,['Yes','No'],{cancel:1});
          if(y===0){let h=S.heroes[who[0]];if(who.length>1){const t=await pickHero({title:'Who wears it?'});if(t<0)continue;h=partyHeroes()[t]}const old=h.eq[x.slot];if(old)addItem(old,1);S.gear[id]--;if(!S.gear[id])delete S.gear[id];h.eq[x.slot]=id;AU.play('ok')}}}}}
    if(c===1){while(true){const ids=Object.keys(S.inv).filter(k=>S.inv[k]>0&&ITEMS[k].price),gs=Object.keys(S.gear).filter(k=>S.gear[k]>0);
        const all=[...ids.map(id=>({id,label:ITEMS[id].name,right:'×'+S.inv[id]+' · '+Math.floor(ITEMS[id].price/2)})),...gs.map(id=>({id,label:GEAR[id].name,right:'×'+S.gear[id]+' · '+Math.floor((GEAR[id].price||400)/2)}))];
        const k=await listWin(all.length?all:[{label:'(nothing to sell)',off:true}],{title:`Sell <span class="gold" style="float:right">${S.gold}</span>`,rows:10,style:{left:'.4rem',right:'.4rem',top:'.4rem'}});if(k<0||!all.length)break;
        const id=all[k].id;const pr=Math.floor((ITEMS[id]?ITEMS[id].price:(GEAR[id].price||400))/2);S.gold+=pr;addItem(id,-1);if(GEAR[id]&&S.gear[id]<=0)delete S.gear[id];AU.play('buy')}}
  }
  await say(who,S.lore>=2?'Come back any time.':'Come back while the tide holds.')}
function qty(name,price){uiCount++;let n=1;const max=Math.max(1,Math.min(99,Math.floor(S.gold/price)));
  const w=win('',`<h3>${name}</h3><div class="q"></div><div class="small">◀ ▶ ±1 · ▲ ▼ ±10</div>`,{left:'50%',top:'40%',transform:'translateX(-50%)'});
  const draw=()=>{w.querySelector('.q').innerHTML=`× ${n} &nbsp; <span class="gold">${n*price}</span>`};draw();
  return new Promise(res=>{const off=pushInput(b=>{if(b==='left')n=Math.max(1,n-1);else if(b==='right')n=Math.min(max,n+1);else if(b==='up')n=Math.min(max,n+10);else if(b==='down')n=Math.max(1,n-10);
    else if(b==='a'){off();uiCount--;w.remove();res(n);return}else if(b==='b'){off();uiCount--;w.remove();res(0);return}AU.play('tick');draw()})})}
async function inn(who,price){const c=await ask(who,`A bed for the night is ${price} ${CUR()}. Stay?`,['Stay','Leave'],{cancel:1});
  if(c!==0)return false;if(S.gold<price){await say(who,`You're short a few ${CUR()}, love.`);return false}
  S.gold-=price;FD.busy++;await fade(1,false,600);healAll();AU.music('');AU.play('heal');await sleep(1200);AU.music(musicFor(FD.map));await fade(0,false,600);FD.busy=Math.max(0,FD.busy-1);
  await say(who,'Rested and dry. Off you go.');return true}

/* ---------- the hero creator: how Lift looks, on the map and in battle ---------- */
const COLORS={
  hair:[['#d0682c','Copper'],['#1e1a22','Black'],['#5a3a22','Brown'],['#8a4a24','Chestnut'],['#7a2e1a','Auburn'],['#e0782a','Ginger'],['#e8c25a','Blonde'],['#c8922e','Honey'],
    ['#ece6d6','Platinum'],['#f4f4f0','White'],['#a8acb8','Silver'],['#6a6a72','Gray'],['#b0222e','Crimson'],['#e07aa8','Rose'],['#7a4ab0','Violet'],['#3a78d8','Azure'],['#2a3a7a','Navy'],['#2f8f9a','Teal'],['#6ad0a8','Mint'],['#3a8a3a','Green']],
  cloth:[['#2f5aa8','Blue'],['#1e2e5e','Navy'],['#5a9ad8','Sky'],['#a82a2a','Red'],['#6a1218','Crimson'],['#3a7a3a','Green'],['#1e4a2a','Forest'],['#2a2a34','Black'],['#3a3a44','Charcoal'],
    ['#7a7a84','Gray'],['#d8d8e0','White'],['#e8dcc0','Cream'],['#5a3a8a','Purple'],['#9a82d0','Lavender'],['#c8642a','Orange'],['#2a7a7a','Teal'],['#c89a2a','Gold'],['#7a5232','Brown'],['#b08a5a','Tan'],['#d86a9a','Pink']]};
const CUSTOM={
  style:[['spiky','Spiky'],['short','Short'],['messy','Messy'],['swept','Swept'],['long','Long'],['pony','Ponytail'],['twin','Twin tails'],['braid','Braid'],['bun','Bun'],['curly','Curly'],['mohawk','Mohawk'],['bald','Shaved']],
  hair:COLORS.hair,
  hw:[['none','None'],['headband','Headband'],['bandana','Bandana'],['hood','Hood'],['cap','Cap'],['helmet','Helmet']],
  hwc:COLORS.cloth,
  face:[['none','None'],['stubble','Stubble'],['mustache','Mustache'],['beard','Beard']],
  skin:[['#ffe0cc','Porcelain'],['#f6d6bc','Fair'],['#f0c09a','Light'],['#e0b088','Warm'],['#d9a07a','Tan'],['#c88a5e','Olive'],['#b87a52','Bronze'],['#9a6440','Umber'],['#8a5636','Brown'],['#5e3a24','Deep'],['#3e2618','Ebony']],
  eye:[['#1a1424','Dark'],['#3a6ad0','Blue'],['#8ad0f0','Ice'],['#3a8a4a','Green'],['#8a7a2a','Hazel'],['#7a4a22','Brown'],['#e0a020','Amber'],['#a02a2a','Red'],['#8a4ac0','Violet']],
  ostyle:[['tunic','Tunic'],['coat','Long coat'],['armor','Steel armor'],['vest','Vest']],
  top:COLORS.cloth,
  acc:[['#e8c86a','Gold'],['#c8ccd8','Silver'],['#b0703a','Bronze'],['#c83a3a','Red'],['#2a2a2a','Black'],['#f0f0f0','White'],['#3a8ad8','Blue'],['#4a9a4a','Green'],['#8a4ac0','Purple'],['#6a4426','Brown']],
  cape:[['','None'],...COLORS.cloth.filter((_,i)=>i%2===0||i<6)],
  bot:[['#3a3a4e','Slate'],['#2a2a2a','Black'],['#5a4a3a','Brown'],['#2a3a5a','Navy'],['#5a2a2a','Maroon'],['#d8d0c0','Cream'],['#3a4a3a','Olive'],['#6a6a72','Gray'],['#a8845a','Tan'],['#1e3a24','Forest'],['#3a3a40','Charcoal'],['#e8e8ec','White']],
  boot:[['#4a2e1e','Brown'],['#2a2020','Black'],['#5a5a60','Iron'],['#7a4a2a','Tan'],['#2a2a40','Navy'],['#6a1a1a','Red'],['#d8d8d8','White'],['#a8802a','Gold']],
  hilt:[['#e0b040','Gold'],['#c8ccd8','Silver'],['#2a2a30','Black'],['#b02a2a','Crimson'],['#b0703a','Bronze'],['#3a7ad8','Azure']]};
const CUSTOM_ROWS=[['style','Hair style'],['hair','Hair color'],['hw','Headwear'],['hwc','Headwear color'],['face','Facial hair'],['skin','Skin'],['eye','Eyes'],
  ['ostyle','Outfit'],['top','Outfit color'],['acc','Trim'],['cape','Cape'],['bot','Pants'],['boot','Boots'],['hilt','Sword hilt']];
const NO_SWATCH=new Set(['style','hw','face','ostyle']);
function defaultCustom(){return{style:'spiky',hair:'#d0682c',hw:'none',hwc:'#a82a2a',face:'none',skin:'#f0c09a',eye:'#1a1424',ostyle:'tunic',top:'#2f5aa8',acc:'#e8c86a',cape:'',bot:'#3a3a4e',boot:'#4a2e1e',hilt:'#e0b040'}}
function applyCustom(c){c={...defaultCustom(),...c};const base={...c};
  // in the second telling, Lift's form changes his clothes (and sometimes his eyes and his blade)
  if(S&&S.lore===4&&FORMS[S.form])c=FORMS[S.form].look(c);
  const st=[...(c.style==='short'?[]:[c.style]),...(c.hw!=='none'?['hw-'+c.hw]:[]),...(c.face!=='none'?[c.face]:[]),...(c.ostyle!=='tunic'?['o-'+c.ostyle]:[]),...(c.cape?['cape']:[])];
  LOOKS.lift={id:'lift~'+CUSTOM_ROWS.map(([k])=>c[k]).join('|')+(c.blade||''),skin:c.skin,hair:c.hair,eye:c.eye,top:c.top,acc:c.acc,bot:c.bot,boot:c.boot,
    hw:c.hw,hwc:c.hwc,face:c.face,ostyle:c.ostyle,cape:c.cape,hilt:c.hilt,style:st,bstyle:c.style,blade:c.blade};

  if(LOOKS.pip)LOOKS.pip={...LOOKS.pip,id:'pip~'+c.hair+c.skin,hair:c.hair,skin:c.skin}}
async function customizeHero({title='Create your hero',canCancel=false}={}){
  const c={...defaultCustom(),...(S.custom||{})},orig={...c},N=CUSTOM_ROWS.length,ROWS=N+2;uiCount++;const keepForm=S.form;if(R4())S.form='base';
  const w=win('custom',`<h3>${title}</h3><div class="cz-prev"><canvas class="cz-f" width="16" height="24"></canvas><canvas class="cz-b" width="58" height="62"></canvas></div><div class="cz-rows"></div><div class="small cz-help">◀▶ change · A next · START done</div>`,{zIndex:'5'});
  const rowsEl=w.querySelector('.cz-rows'),cf=w.querySelector('.cz-f'),cb=w.querySelector('.cz-b');let i=0,fr=0;
  const opts=k=>CUSTOM[k],idx=k=>Math.max(0,opts(k).findIndex(o=>o[0]===c[k]));
  const draw=()=>{applyCustom(c);rowsEl.innerHTML='';
    CUSTOM_ROWS.forEach(([k,lab],r)=>{const L=opts(k),j=idx(k),[val,name]=L[j];const sw=NO_SWATCH.has(k)||!val?'':`<i class="cz-sw" style="background:${val}"></i>`;
      rowsEl.insertAdjacentHTML('beforeend',`<div class="opt${r===i?' sel':''}"><span>${lab}</span><span class="r">◀ ${sw}${name} <em>${j+1}/${L.length}</em> ▶</span></div>`)});
    rowsEl.insertAdjacentHTML('beforeend',`<div class="opt${i===N?' sel':''}"><span>Randomize</span><span class="r">A</span></div><div class="opt${i===N+1?' sel':''}"><span class="gold">Done</span><span></span></div>`);
    const sel=rowsEl.children[i];if(sel){const top=sel.offsetTop-rowsEl.clientHeight/2+sel.offsetHeight/2;rowsEl.scrollTop=Math.max(0,top)}
    rowsEl.classList.toggle('up',rowsEl.scrollTop>2);rowsEl.classList.toggle('dn',rowsEl.scrollTop+rowsEl.clientHeight<rowsEl.scrollHeight-2);
    const gb=cb.getContext('2d');gb.clearRect(0,0,58,62);gb.drawImage(heroBig(LOOKS.lift,'idle'),0,0);walk()};
  const walk=()=>{const gf=cf.getContext('2d');gf.clearRect(0,0,16,24);gf.drawImage(personImg(LOOKS.lift,['down','left','up','right'][(fr/8|0)%4],[1,0,2,0][fr%4]),0,0)};
  const tick=setInterval(()=>{fr++;walk()},170);draw();
  await new Promise(res=>{const off=pushInput(b=>{
    if(b==='up'){i=(i+ROWS-1)%ROWS;AU.play('tick');draw()}
    else if(b==='down'){i=(i+1)%ROWS;AU.play('tick');draw()}
    else if((b==='left'||b==='right')&&i<N){const k=CUSTOM_ROWS[i][0],L=opts(k);c[k]=L[(idx(k)+(b==='left'?-1:1)+L.length)%L.length][0];AU.play('tick');draw()}
    else if(b==='a'&&i<N){i++;AU.play('ok');draw()}
    else if(b==='a'&&i===N){for(const [k] of CUSTOM_ROWS){const L=opts(k);c[k]=L[Math.random()*L.length|0][0]}if(Math.random()<.6)c.hw='none';if(Math.random()<.6)c.face='none';if(Math.random()<.5)c.cape='';AU.play('chest');draw()}
    else if(b==='a'||b==='start'){AU.play('ok');off();res()}
    else if(b==='b'&&canCancel){Object.assign(c,orig);AU.play('back');off();res()}})});
  clearInterval(tick);w.remove();uiCount--;S.custom={...c};if(R4())S.form=keepForm||'base';applyCustom(S.custom)}

/* ---------- Lift's forms (the second telling) ---------- */
function setForm(f){if(!FORMS[f])return;S.form=f;applyCustom(S.custom||defaultCustom());const h=S.heroes.lift;if(h){const st=stats(h);h.hp=Math.min(h.hp,st.hp)}}
function formFx(){FD.fx=FD.fx.filter(f=>f!==formBurst);formBurst.t=0;FD.fx.push(formBurst)}
function formBurst(g,cx,cy){formBurst.t++;const t=formBurst.t,p=t/26;if(p>=1){FD.fx=FD.fx.filter(f=>f!==formBurst);return}
  const x=FD.x*16+FD.ox-cx+8,y=FD.y*16+FD.oy-cy+2;g.save();g.globalCompositeOperation='lighter';
  const r=6+p*26,gr=g.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,`rgba(255,255,255,${.8*(1-p)})`);gr.addColorStop(1,'rgba(200,220,255,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2+t*.08,rr=4+p*20;g.fillStyle=`rgba(255,255,255,${1-p})`;g.fillRect(Math.round(x+Math.cos(a)*rr),Math.round(y+Math.sin(a)*rr*.8),1,1)}g.restore()}
async function changeForm(f,{quiet=false}={}){if(S.form===f)return;AU.play('swirl');formFx();setForm(f);if(!quiet)toast(FORMS[f].name,1200)}
function cycleForm(){if(!S.forms||S.forms.length<2){AU.play('buzz');return}const i=S.forms.indexOf(S.form);changeForm(S.forms[(i+1)%S.forms.length])}
async function menuForms(){let idx=Math.max(0,S.forms.indexOf(S.form));
  while(true){const box=screenBox();const pv=el('div','win formcard','');pv.style.position='relative';box.appendChild(pv);
    const show=i=>{const f=FORMS[S.forms[i]],U=FORM_ULTS[f.ult],SK=SKILLS[f.sk];const keep=S.form;S.form=S.forms[i];applyCustom(S.custom||defaultCustom());
      const cv2=mk(58,62);cv2.getContext('2d').drawImage(heroBig(LOOKS.lift,'idle'),0,0);cv2.className='fm-pic';const st=stats(S.heroes.lift);S.form=keep;applyCustom(S.custom||defaultCustom());
      pv.innerHTML=`<div class="fm-top"><div><h3>${f.name}</h3><div class="small">${f.from?'Taken from '+f.from:'Your own'}</div><div class="small fm-lean">${f.lean}</div></div></div>
        <div class="fm-row"><span class="gold">Special</span> ${SK.name} <span class="cpc">2 CP</span></div><div class="small">${SK.desc}</div>
        <div class="fm-row"><span class="ultl">★ ${U.name}</span></div><div class="small">${U.desc}</div>
        <div class="statgrid small" style="margin-top:.25rem">${['atk','def','spd'].map(k=>`<span>${k.toUpperCase()}</span><span>${st[k]}</span>`).join('')}<span>HP</span><span>${st.hp}</span></div>`;
      pv.querySelector('.fm-top').prepend(cv2)};
    const lw=listWin(S.forms.map(id=>({label:FORMS[id].name,right:id===S.form?'<span class="gold">now</span>':''})),{title:'Forms',start:idx,style:{position:'relative'},onMove:i=>show(i),hint:S.forms.length>1?'SELECT on the map also changes form.':'Beat a strong enemy to take its power.'});
    lw.el.remove();box.appendChild(lw.el);const c=await lw;box.remove();if(c<0)return;idx=c;
    if(S.forms[c]!==S.form){await changeForm(S.forms[c],{quiet:true});AU.play('ok')}}}

/* ---------- the wanted poster ---------- */
function posterFace(){const keep=S.form;S.form='base';applyCustom(S.custom||defaultCustom());const im=personImg(LOOKS.lift,'down',0);S.form=keep;applyCustom(S.custom||defaultCustom());
  const c=mk(16,18),x=c.getContext('2d');x.drawImage(im,0,0,16,18,0,0,16,18);
  // ink it: every pixel becomes a shade of brown, like a print on cheap paper
  const d=x.getImageData(0,0,16,18);for(let i=0;i<d.data.length;i+=4){if(!d.data[i+3])continue;const l=(d.data[i]*.3+d.data[i+1]*.59+d.data[i+2]*.11)/255;const v=l>.62?3:l>.4?2:l>.2?1:0;
    const pal=[[46,28,16],[92,60,34],[146,104,62],[196,160,110]][v];d.data[i]=pal[0];d.data[i+1]=pal[1];d.data[i+2]=pal[2]}x.putImageData(d,0,0);c.className='wp-face';return c}
async function showPoster(){uiCount++;const notes=(S.notes||[]).map(n=>`<li>${n}</li>`).join('');
  const w=win('poster',`<div class="wp-head">WANTED</div><div class="wp-sub">DEAD OR ALIVE</div><div class="wp-pic"></div>
    <div class="wp-name">LIFT OF LARKFIELD</div><div class="wp-for">For the murder of Bren and Mara Ashby</div>
    <div class="wp-rew">REWARD<b>${(S.bounty||0).toLocaleString()} COINS</b></div>${notes?`<ul class="wp-notes">${notes}</ul>`:''}
    <div class="wp-foot">By order of the Baron. Bring him to any warden.</div>`,{zIndex:'6'});
  w.querySelector('.wp-pic').appendChild(posterFace());AU.play('ok');
  await new Promise(r=>{const off=pushInput(b=>{if(b==='a'||b==='b'){AU.play('back');off();r()}})});w.remove();uiCount--}
async function raiseBounty(n,note){S.bounty=n;if(note&&!S.notes.includes(note))S.notes.push(note);AU.play('level');
  await say(null,`<span class="bad">Your bounty is now ${n.toLocaleString()} coins.</span>`)}
