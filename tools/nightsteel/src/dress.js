/* ================= the wardrobe and the forge: dressing up, and shaping a weapon part by part ================= */
/* rows of the wardrobe: k the look's key; list, cat (an item list) or dye */
const WROWS=[
 {k:'skin',n:'Skin',list:()=>SKINS.map(s=>s[0]),sw:v=>(SKINS.find(s=>s[0]===v)||SKINS[1])[1]},
 {k:'eyes',n:'Eyes',list:()=>EYES},{k:'eyeC',n:'Eye colour',dye:1},{k:'brows',n:'Brows',list:()=>BROWS},{k:'mouth',n:'Mouth',list:()=>MOUTHS},{k:'ears',n:'Ears',list:()=>EARS},
 {k:'hair',n:'Hairstyle',cat:'hair'},{k:'hairC',n:'Hair colour',dye:1},
 {k:'hat',n:'Hat',cat:'hat'},{k:'hatC1',n:'Hat colour',dye:1,dep:'hat'},{k:'hatC2',n:'Hat trim',dye:1,dep:'hat'},
 {k:'top',n:'Top',cat:'top'},{k:'topC1',n:'Top colour',dye:1},{k:'topC2',n:'Top trim',dye:1},
 {k:'bot',n:'Bottoms',cat:'bot'},{k:'botC1',n:'Bottoms colour',dye:1},{k:'botC2',n:'Bottoms trim',dye:1},
 {k:'shoes',n:'Shoes',cat:'shoes'},{k:'shoeC',n:'Shoe colour',dye:1},
 {k:'back',n:'On the back',cat:'back'},{k:'backC1',n:'Back colour',dye:1,dep:'back'},{k:'backC2',n:'Back trim',dye:1,dep:'back'},
 {k:'face',n:'Face extra',cat:'face'},{k:'faceC',n:'Face colour',dye:1,dep:'face'},{k:'faceC2',n:'Face trim',dye:1,dep:'face'},
 {k:'glove',n:'Gloves',dye:1,none:1},
];
const POSE_CYCLE=['idle','ready','strike','cast','win','walk1'];
/* the item lists by category, and which dye keys go with each */
const CAT_KEYS={hat:['hatC1','hatC2'],top:['topC1','topC2'],bot:['botC1','botC2'],shoes:['shoeC'],back:['backC1','backC2'],face:['faceC','faceC2']};
function rowValues(r){if(r.list)return r.list();return CAT_LIST[r.cat]().map(x=>x[0])}
function rowShow(r,L){const v=L[r.k];if(r.dye)return{txt:v||'None',sw:v?dyeOf(v):null};if(r.sw)return{txt:v,sw:r.sw(v)};return{txt:v||'None'}}
/* change an item, and take on its own colours if you had kept the old item's */
function setItem(L,r,v){const old=L[r.k];L[r.k]=v;const keys=CAT_KEYS[r.cat];if(!keys)return;
  const od=itemDyes(r.cat,old)||[],nd=itemDyes(r.cat,v)||[];keys.forEach((k,i)=>{if(!L[k]||L[k]===od[i]||!od[i])if(nd[i])L[k]=nd[i]})}
/* a random look, from what you own */
function randomLook(L){const rr=a=>a[Math.floor(rnd()*a.length)],d=()=>rr(DYES)[0];
  L.skin=rr(SKINS)[0];L.eyes=rr(EYES);L.eyeC=d();L.brows=rr(BROWS);L.mouth=rr(MOUTHS);L.ears=rnd()<.8?'Human':rr(EARS);
  for(const r of WROWS)if(r.cat){const vals=rowValues(r).filter(v=>owns(r.cat,v));let v=rr(vals);if((r.cat==='hat'||r.cat==='back'||r.cat==='face')&&rnd()<.4)v='None';setItem(L,r,v)}
  L.hairC=rr(['Chocolate','Black','Blonde','Ginger','Brown','Rust','Silver','White','Azure','Pink','Violet','Mint','Crimson',d()]);
  for(const k of['topC1','topC2','botC1','botC2','shoeC','hatC1','hatC2','backC1','backC2'])if(rnd()<.55)L[k]=d();L.glove=rnd()<.25?d():''}
/* ---------- the wardrobe screen ---------- */
function wardrobe(m,o={}){return new Promise(res=>{const L=JSON.parse(JSON.stringify(Object.assign({},DEFAULT_LOOK,m.look))),start=JSON.stringify(L);let pose=0;
  const root=el('div','screen fade');UI.appendChild(root);
  const left=winEl('plain',{x:4,y:4,w:122,h:172},root),[pc,pg]=previewCanvas(left,112,144,{x:4,y:14});
  const nm=el('div','small gold');nm.style.cssText=`position:absolute;left:${px(6)};top:${px(2)}`;left.appendChild(nm);
  const ph=el('div','tiny dim');ph.style.cssText=`position:absolute;left:${px(6)};bottom:${px(3)}`;ph.innerHTML='<i class="k">SELECT</i>pose';left.appendChild(ph);
  const paint=()=>{paintDoll(pg,L,o.noWeapon?null:m.weapon,POSE_CYCLE[pose],[24,4,56,72],2);nm.textContent=o.title||m.name};
  const rows=()=>[{label:'Randomize',html:'<span class="gold">✦ Randomize</span>'}].concat(WROWS.map(r=>{const s=rowShow(r,L),dep=r.dep&&(L[r.dep]==='None'||!L[r.dep]);
      return{label:r.n,html:`<span class="${dep?'dim':''}">${r.n}</span>`,r:`<span class="${dep?'dim':''}">${esc(s.txt)}</span>${s.sw?`<span class="sw" style="background:${s.sw};margin-left:${px(2)};display:inline-block;vertical-align:middle"></span>`:''}`,wr:r}}))
    .concat([{label:o.doneLabel||'Done',html:`<span class="gold">${esc(o.doneLabel||'Done')}</span>`,done:1}]);
  const box={x:130,y:4,w:W-134,h:172};const right=winEl('',box,root);
  const lw=new ListWin({el:right,title:o.heading||'Wardrobe',rows:rows(),vis:12,foot:'<i class="k">◀▶</i>change <i class="k a">A</i>pick from all',
    lr:(d,row)=>{if(!row.wr)return;cycle(row.wr,d)},
    pick:async(row)=>{if(row.done){finish(true);return}if(!row.wr){randomLook(L);refresh();return}await choose(row.wr)},
    back:()=>{if(o.mustFinish){finish(true);return}finish(false)},
    key:b=>{if(b==='select'){pose=(pose+1)%POSE_CYCLE.length;SND.fx('cur');paint()}else if(b==='start')finish(true)}});
  const refresh=()=>{lw.set(rows());paint()};
  const cycle=(r,d)=>{if(r.dye){const list=(r.none?['']:[]).concat(DYES.map(x=>x[0]));let i=list.indexOf(L[r.k]||'');i=(i+d+list.length)%list.length;L[r.k]=list[i];SND.fx('cur');refresh();return}
    const vals=rowValues(r);let i=vals.indexOf(L[r.k]);for(let n=0;n<vals.length;n++){i=(i+d+vals.length)%vals.length;if(!r.cat||owns(r.cat,vals[i]))break}
    if(r.cat)setItem(L,r,vals[i]);else L[r.k]=vals[i];SND.fx('cur');refresh()};
  const choose=async r=>{if(r.dye){const before=L[r.k];const v=await dyeGrid(r.n,L[r.k]||'',v=>{L[r.k]=v;paint()},{none:r.none,box:{x:W-160,y:20}});L[r.k]=v===null?before:v;refresh();return}
    const vals=rowValues(r),before=JSON.stringify(L);const sel=Math.max(0,vals.indexOf(L[r.k]));const pe=winEl('pop',{x:130,y:4,w:W-134,h:172});
    const idx=await pick({el:pe,title:r.n+` <span class="dim small">${vals.length}</span>`,vis:12,sel,rows:vals.map(v=>{const lock=r.cat&&!owns(r.cat,v);return{label:v,html:`<span>${esc(v)}</span>`,r:lock?`<span class="lock">🔒</span>`:'',off:lock,lockWhy:lock?LOCKED[r.cat+':'+v]:''}}),
      move:(row)=>{Object.assign(L,JSON.parse(before));if(r.cat)setItem(L,r,row.label);else L[r.k]=row.label;paint();hint.innerHTML=row.lockWhy?`🔒 ${esc(row.lockWhy)}`:''},foot:''});
    hint.innerHTML='';if(idx<0)Object.assign(L,JSON.parse(before));refresh()};
  const hint=el('div','tiny gold');hint.style.cssText=`position:absolute;left:${px(6)};right:${px(4)};bottom:${px(12)};white-space:normal`;left.appendChild(hint);
  const finish=ok=>{popModal(lw);root.remove();if(ok){m.look=L}res(ok&&JSON.stringify(L)!==start)};
  paint();pushModal(lw)})}
/* ---------- the forge: every part of a weapon ---------- */
const COLOR_LABELS={
 sword:{c1:'Blade',c2:'Guard & pommel',c3:'Grip',c4:'Charm',gemC:'Gem',glow:'Swing light'},greatsword:{c1:'Blade',c2:'Guard & pommel',c3:'Grip',c4:'Charm',gemC:'Gem',glow:'Swing light'},
 katana:{c1:'Blade',c2:'Tsuba',c3:'Wrap',c4:'Tassel',gemC:'Gem',glow:'Swing light'},dual:{c1:'Right blade',c5:'Left blade',c2:'Tsuba',c3:'Wrap',c4:'Tassel',gemC:'Gem',glow:'Swing light'},
 greataxe:{c1:'Axe head',c2:'Fittings',c3:'Haft',c4:'Charm',gemC:'Gem',glow:'Swing light'},warhammer:{c1:'Hammer head',c2:'Fittings',c3:'Haft',c4:'Charm',gemC:'Gem',glow:'Swing light'},
 bow:{c1:'Limbs',c2:'Fittings',c3:'String',c4:'Feathers',gemC:'Gems',glow:'Arrow light'},fists:{c1:'Metal',c2:'Trim',c3:'Wraps',c4:'Accent',gemC:'Gem',glow:'Strike light'},
 staff:{c1:'Head',c2:'Fittings',c3:'Shaft',c4:'Trim',gemC:'Gem in the middle',glow:'Magic light'},grimoire:{c1:'Cover',c2:'Symbol & metal',c3:'Pages',c4:'Ribbon',gemC:'Gems',glow:'Magic light'}};
const ENGR_MAX={sword:12,greatsword:12,katana:12,dual:12,greataxe:8,warhammer:8,bow:4,fists:2,staff:12,grimoire:10};
/* the biggest whole scale a weapon fits the window at */
function weaponFit(w,maxW,maxH){for(let k=4;k>=1;k--){const r=weaponBuf(w,k,w.kind==='dual'?'pair':'raw');if(r.buf.w<=maxW&&r.buf.h<=maxH)return k}return 1}
function swapKind(w,kind){const n=newWeapon(kind);n.name=(!w.name||w.name===(WTYPES[w.kind]||{}).n)?WTYPES[kind].n:w.name;n.engr=String(w.engr||'').slice(0,ENGR_MAX[kind]);n.elem=w.elem||'None';n.tier=w.tier||0;return n}
/* mode: 'free' (anywhere: shape, colour, words, kind) or 'creator' */
function forgeDesign(m,o={}){return new Promise(res=>{let w=JSON.parse(JSON.stringify(m.weapon));const start=JSON.stringify(w);let view=0;
  const root=el('div','screen fade');UI.appendChild(root);
  const left=winEl('plain',{x:4,y:4,w:122,h:172},root),[pc,pg]=previewCanvas(left,112,124,{x:4,y:13});
  const nm=el('div','small gold');nm.style.cssText=`position:absolute;left:${px(6)};right:${px(4)};top:${px(2)};overflow:hidden;white-space:nowrap`;left.appendChild(nm);
  const info=el('div','tiny');info.style.cssText=`position:absolute;left:${px(6)};right:${px(4)};bottom:${px(3)}`;left.appendChild(info);
  const paint=()=>{pg.clearRect(0,0,112,124);
    if(view===0){const k=weaponFit(w,108,120),r=weaponBuf(w,k,w.kind==='dual'?'pair':0),c=r.buf.canvas(1);pg.drawImage(c,Math.round(56-c.width/2),Math.round(62-c.height/2))}
    else paintDoll(pg,m.look,w,['ready','strike','cast','win'][view-1],[30,12,56,62],2);
    const s=weaponStats(w),T=WTYPES[w.kind];nm.textContent=w.name||T.n;
    info.innerHTML=`<span class="dim">${T.n} · ${TIERS[w.tier||0]}${w.elem&&w.elem!=='None'?` · <span style="color:${ELEMS[w.elem].c}">${ELEMS[w.elem].n}</span>`:''}</span><br>ATK ${s.atk} MAG ${s.mag} DEF ${s.def} SPD ${s.spd>=0?'+':''}${s.spd}<br><i class="k">SELECT</i>view`};
  const rows=()=>{const T=WTYPES[w.kind],R=[];
    if(o.kind!==false)R.push({label:'Weapon kind',r:esc(T.n),kind:1});
    R.push({label:'Name',r:esc(w.name||T.n),txt:'name'});R.push({label:w.kind==='grimoire'?'Cover words':w.kind==='bow'?'Limb words':w.kind==='fists'?'Plate letters':'Engraving',r:esc(w.engr||'—'),txt:'engr'});
    for(const[p,l]of Object.entries(T.parts))R.push({label:p==='Symbol'?'Cover symbol':p,r:esc(w.parts[p]),part:p,vals:l});
    for(const[k,n]of Object.entries(COLOR_LABELS[w.kind]))R.push({label:n,r:esc(w[k]||'—'),sw:null,col:k,swc:dyeOf(w[k],'Grey')});
    R.push({label:'Done',html:'<span class="gold">Done</span>',done:1});
    return R.map(r=>Object.assign(r,{html:r.html||`<span>${esc(r.label)}</span>`,r:r.col?`${r.r}<span class="sw" style="background:${r.swc};margin-left:${px(2)};display:inline-block;vertical-align:middle"></span>`:r.r}))};
  const right=winEl('',{x:130,y:4,w:W-134,h:172},root);
  const lw=new ListWin({el:right,title:o.heading||'Forge',rows:rows(),vis:12,foot:'<i class="k">◀▶</i>change <i class="k a">A</i>pick',
    lr:(d,row)=>cycle(row,d),pick:row=>choose(row),back:()=>finish(!o.mustFinish?false:true),
    key:b=>{if(b==='select'){view=(view+1)%5;SND.fx('cur');paint()}else if(b==='start')finish(true)}});
  const refresh=()=>{lw.set(rows());paint()};
  const cycle=(row,d)=>{if(row.part){const l=row.vals;w.parts[row.part]=l[(l.indexOf(w.parts[row.part])+d+l.length)%l.length]}
    else if(row.col){const l=DYES.map(x=>x[0]);w[row.col]=l[(l.indexOf(w[row.col])+d+l.length)%l.length]}
    else if(row.kind){const i=WKINDS.indexOf(w.kind);w=swapKind(w,WKINDS[(i+d+WKINDS.length)%WKINDS.length])}else return;SND.fx('cur');refresh()};
  const choose=async row=>{if(row.done){finish(true);return}
    if(row.kind){const before=w;const pe=winEl('pop',{x:130,y:4,w:W-134,h:172});
      const i=await pick({el:pe,title:'Weapon kind',vis:10,sel:WKINDS.indexOf(w.kind),rows:WKINDS.map(k=>({label:WTYPES[k].n,r:`<span class="tiny">${esc(ARTS[k].label)}</span>`})),
        move:(r,i)=>{w=swapKind(before,WKINDS[i]);paint();blurb.textContent=WTYPES[WKINDS[i]].blurb},render:(r,i)=>{blurb.textContent=WTYPES[WKINDS[i]].blurb}});
      blurb.textContent='';if(i<0)w=before;else w=swapKind(before,WKINDS[i]);refresh();return}
    if(row.part){const l=row.vals,before=w.parts[row.part];const pe=winEl('pop',{x:130,y:4,w:W-134,h:172});
      const i=await pick({el:pe,title:row.label,vis:12,sel:l.indexOf(before),rows:l.map(v=>({label:v})),move:r=>{w.parts[row.part]=r.label;paint()}});
      w.parts[row.part]=i<0?before:l[i];refresh();return}
    if(row.col){const before=w[row.col];const v=await dyeGrid(row.label,w[row.col],v=>{w[row.col]=v;paint()},{box:{x:W-160,y:20}});w[row.col]=v===null?before:v;refresh();return}
    if(row.txt==='name'){const v=await letters('Name this weapon',w.name,14,{});if(v)w.name=v;refresh();return}
    if(row.txt==='engr'){const max=ENGR_MAX[w.kind]||12,before=w.engr;const v=await letters(row.label,w.engr,max,{upper:true,allowed:ch=>!!MINI[ch.toUpperCase()]||ch===' ',live:s=>{w.engr=s;paint()},
        note:w.kind==='grimoire'?'Written across the cover.':w.kind==='fists'?'Two letters on the plate (with an Engraved plate).':'Carved along the blade, read from the hilt up.'});
      w.engr=v===null?before:v;refresh();return}};
  const blurb=el('div','tiny');blurb.style.cssText=`position:absolute;left:${px(6)};right:${px(4)};bottom:${px(26)};white-space:normal;color:var(--gold)`;left.appendChild(blurb);
  const finish=ok=>{popModal(lw);root.remove();if(ok){const kindChanged=w.kind!==m.weapon.kind;m.weapon=w;if(kindChanged)m.limit=0}res(ok&&JSON.stringify(w)!==start)};
  paint();pushModal(lw)})}
