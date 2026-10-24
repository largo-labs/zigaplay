/* ===================== UI: dialogue, lists, menus, shops ===================== */
let uiCount=0;
const uiOpen=()=>uiCount>0;
function win(cls,html,style){const w=el('div','win '+(cls||''),html);if(style)Object.assign(w.style,style);UI.appendChild(w);return w}

/* ---------- dialogue ---------- */
let dlgEl=null,dlgKeep=0;
function tokenize(html){const out=[];const re=/(<[^>]+>)|([^<])/g;let m;while((m=re.exec(html)))out.push(m[1]?{tag:m[1]}:{ch:m[2]});return out}
function say(who,text,{keep=false,auto=0}={}){
  uiCount++;clearTimeout(dlgT);
  if(!dlgEl){dlgEl=win('dlg','')}dlgEl.dataset.live=1;
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
function listWin(items,{cls='',style={},title='',rows=8,start=0,cancel=true,onMove=null,keepOpen=false,hint=''}={}){
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
    else if(b==='b'&&cancel){AU.play('back');off();uiCount--;if(!keepOpen)w.remove();res(-1)}})});
  p.el=w;return p}
async function ask(who,text,opts,{cancel=-1}={}){
  await say(who,text,{keep:true});
  const r=await listWin(opts.map(o=>({label:o})),{cls:'',style:{right:'.5rem',bottom:'6.4rem'},cancel:cancel>=0});
  closeDlgForce();return r<0?cancel:r}
function closeDlgForce(){if(dlgEl){dlgEl.remove();dlgEl=null}}

/* ---------- small helpers ---------- */
function heroCanvas(id,dir='down'){const c=mk(16,16);c.getContext('2d').drawImage(personImg(LOOKS[HEROES[id].look],dir,0),0,0);c.style.imageRendering='pixelated';return c}
function bar(v,max,mp){return`<div class="bar${mp?' mp':''}"><i style="width:${max?clamp(v/max*100,0,100):0}%"></i></div>`}
function heroCard(h,{sel=false}={}){const s=stats(h);const d=el('div','card'+(sel?' sel':''));d.appendChild(heroCanvas(h.id));
  const st=h.hp<=0?'<span class="bad">KO</span>':h.st.poison?'<span class="bad">Poison</span>':'';
  d.insertAdjacentHTML('beforeend',`<div><b>${HEROES[h.id].name}</b> <span class="small">Lv ${h.lv}</span> ${st}</div>
    <div class="hpc" style="font-size:.8rem">HP ${h.hp}/${s.hp}${bar(h.hp,s.hp)}</div><div class="mpc" style="font-size:.8rem">MP ${h.mp}/${s.mp}${bar(h.mp,s.mp,1)}</div>`);return d}
function pickHero({title='Who?',filter=null,style={left:'.4rem',right:'.4rem',top:'.4rem'}}={}){
  const hs=partyHeroes();return listWin(hs.map(h=>{const s=stats(h);return{label:`${HEROES[h.id].name} <span class="small">Lv${h.lv}</span>`,right:`<span class="hpc">${h.hp}/${s.hp}</span> <span class="mpc">${h.mp}</span>`,off:filter&&!filter(h)}}),{title,style})}

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
    const info=el('div','win',`<div class="statgrid"><span>Pearls</span><span class="gold">${S.gold}</span><span>Time</span><span>${fmtTime(S.time)}</span><span>Tide</span><span>${F('tidepower')?(S.tide==='ebb'?'<span style="color:#fff1b8">Ebb</span>':'<span style="color:#9fd6ff">Flood</span>'):'—'}</span></div><div class="small" style="margin-top:.3rem">${FD.map.name}</div>`);
    info.style.position='relative';
    const row=el('div','');row.style.cssText='display:flex;gap:.35rem;align-items:flex-start';box.appendChild(row);
    const cmds=['Items','Skills','Equip','Status','Save','Settings'];
    const lw=listWin(cmds.map(c=>({label:c,off:c==='Save'&&!canSave()})),{start:idx,style:{position:'relative',flex:'1'}});
    lw.el.remove();row.appendChild(lw.el);row.appendChild(info);
    const tip=el('div','win small',F('tidepower')?'SELECT calls the tide. B closes.':'B closes.');tip.style.position='relative';box.appendChild(tip);
    const c=await lw;box.remove();
    if(c<0)break;idx=c;
    if(c===0)await menuItems();else if(c===1)await menuSkills();else if(c===2)await menuEquip();else if(c===3)await menuStatus();else if(c===4)await menuSave();else if(c===5)await menuSettings();
  }
  uiCount--}
function canSave(){return!!FD.map&&!FD.map.noSave}
function screenBox(){const b=el('div','win mm');UI.appendChild(b);return b}
async function menuItems(){
  let idx=0;while(true){
    const box=screenBox();const desc=el('div','win desc','');desc.style.position='relative';box.appendChild(desc);
    const ids=Object.keys(S.inv).filter(k=>S.inv[k]>0);
    const items=ids.map(id=>({label:ITEMS[id].name,right:'×'+S.inv[id],off:ITEMS[id].battle}));
    S.keys.forEach(k=>items.push({label:'<span class="gold">'+ITEMS[k].name+'</span>',right:'key',off:true}));
    if(!items.length)items.push({label:'(nothing)',off:true});
    const lw=listWin(items,{title:'Items',start:idx,rows:10,style:{position:'relative'},onMove:(i)=>{const id=i<ids.length?ids[i]:S.keys[i-ids.length];desc.innerHTML=id&&ITEMS[id]?ITEMS[id].desc:''}});
    lw.el.remove();box.appendChild(lw.el);const c=await lw;box.remove();
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
  const h=v.heroes[v.party[0]];return{label:`${nm} <span class="small">${(MAPS[v.map]||{}).name||''}</span>`,right:`Lv${h.lv} · ${fmtTime(v.time)}`}}
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
        const gold=el('div','win',`Pearls <span class="gold">${S.gold}</span>`);gold.style.position='relative';box.appendChild(gold);
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
  await say(who,'Come back while the tide holds.')}
function qty(name,price){uiCount++;let n=1;const max=Math.max(1,Math.min(99,Math.floor(S.gold/price)));
  const w=win('',`<h3>${name}</h3><div class="q"></div><div class="small">◀ ▶ ±1 · ▲ ▼ ±10</div>`,{left:'50%',top:'40%',transform:'translateX(-50%)'});
  const draw=()=>{w.querySelector('.q').innerHTML=`× ${n} &nbsp; <span class="gold">${n*price}</span>`};draw();
  return new Promise(res=>{const off=pushInput(b=>{if(b==='left')n=Math.max(1,n-1);else if(b==='right')n=Math.min(max,n+1);else if(b==='up')n=Math.min(max,n+10);else if(b==='down')n=Math.max(1,n-10);
    else if(b==='a'){off();uiCount--;w.remove();res(n);return}else if(b==='b'){off();uiCount--;w.remove();res(0);return}AU.play('tick');draw()})})}
async function inn(who,price){const c=await ask(who,`A bed for the night is ${price} pearls. Stay?`,['Stay','Leave'],{cancel:1});
  if(c!==0)return false;if(S.gold<price){await say(who,'You\'re short a few pearls, love.');return false}
  S.gold-=price;FD.busy++;await fade(1,false,600);healAll();AU.music('');AU.play('heal');await sleep(1200);AU.music(musicFor(FD.map));await fade(0,false,600);FD.busy=Math.max(0,FD.busy-1);
  await say(who,'Rested and dry. Off you go.');return true}
