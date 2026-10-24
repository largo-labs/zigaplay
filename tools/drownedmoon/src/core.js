/* ===================== CORE: state, input, loop, field ===================== */
const $=s=>document.querySelector(s);
const cv=$('#cv'),g=cv.getContext('2d'),UI=$('#ui'),APP=$('#app');
const SAVE_KEY='drownedmoon-save-';
let VW=160,VH=256;
function resize(){const w=APP.clientWidth||300,h=APP.clientHeight||500;
  if(w<=h){VW=160;VH=Math.max(144,Math.min(340,Math.round(160*h/w)))}else{VH=176;VW=Math.max(176,Math.min(360,Math.round(176*w/h)))}
  cv.width=VW;cv.height=VH;g.imageSmoothingEnabled=false}
addEventListener('resize',resize);resize();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const frames=n=>new Promise(r=>{let k=0;const f=()=>{if(++k>=n)r();else requestAnimationFrame(f)};requestAnimationFrame(f)});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pick=a=>a[Math.random()*a.length|0];
const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};

/* ---------- saved state ---------- */
let S=null;
function newState(){return{party:['marin'],heroes:{marin:mkHero('marin',1)},gold:60,inv:{tonic:4},gear:{},keys:[],flags:{},
  map:'home',x:3,y:3,dir:'down',tide:'flood',time:0,boat:0,steps:0}}
function mkHero(id,lv){const h={id,lv,exp:expFor(lv),eq:{w:{marin:'diverknife',pell:'oldharpoon',ysolde:'drownedbell'}[id],a:'sailcloth',c:null},st:{}};
  const s=stats(h);h.hp=s.hp;h.mp=s.mp;return h}
const F=k=>!!(S&&S.flags[k]);
const setF=(k,v=1)=>{S.flags[k]=v};
function expFor(lv){return lv<=1?0:Math.round(11*Math.pow(lv-1,2.25)+16*(lv-1))}
function stats(h){const H=HEROES[h.id],o={};for(const k in H.base)o[k]=Math.floor(H.base[k]+H.grow[k]*(h.lv-1));
  o.atk+=0;for(const sl of ['w','a','c']){const it=GEAR[h.eq[sl]];if(!it)continue;for(const k of ['atk','def','mag','spd','hp','mp'])if(it[k])o[k]+=it[k]}
  o.hp=Math.min(o.hp,9999);return o}
function heroSkills(h){return HEROES[h.id].learn.filter(([lv])=>lv<=h.lv).map(([,s])=>s).filter(s=>s!=='lanternheart'||F('grief')).filter(s=>s!=='moonsong'||F('grief'))}
function addItem(id,n=1){if(GEAR[id]){S.gear[id]=(S.gear[id]||0)+n}else if(ITEMS[id]&&ITEMS[id].key){if(!S.keys.includes(id))S.keys.push(id)}else{S.inv[id]=(S.inv[id]||0)+n;if(S.inv[id]<=0)delete S.inv[id]}}
function itemName(id){return(ITEMS[id]||GEAR[id]||{name:id}).name}
function partyHeroes(){return S.party.map(id=>S.heroes[id])}
function healAll(){for(const h of partyHeroes()){const s=stats(h);h.hp=s.hp;h.mp=s.mp;h.st={}}}

function saveGame(slot){S.saved=Date.now();try{localStorage.setItem(SAVE_KEY+slot,JSON.stringify(S));return true}catch(e){return false}}
function loadSlot(slot){try{const v=localStorage.getItem(SAVE_KEY+slot);return v?JSON.parse(v):null}catch(e){return null}}
function fmtTime(t){t=t|0;const h=t/3600|0,m=(t/60|0)%60;return h+':'+String(m).padStart(2,'0')}

/* ---------- input ---------- */
const HELD={};let dirOrder=[];
const handlers=[]; // top-most gets presses: fn(btn,repeat)
function pushInput(fn){handlers.push(fn);return()=>{const i=handlers.lastIndexOf(fn);if(i>=0)handlers.splice(i,1)}}
let repTimer=null;
function btn(b,down){
  if(down){AU.unlock();if(HELD[b])return;HELD[b]=true;
    if(DIRS[b]){dirOrder=dirOrder.filter(d=>d!==b);dirOrder.push(b)}
    const h=handlers[handlers.length-1];if(h)h(b,false);
    if(DIRS[b]){clearTimeout(repTimer);const rep=()=>{if(!HELD[b])return;const hh=handlers[handlers.length-1];if(hh)hh(b,true);repTimer=setTimeout(rep,85)};repTimer=setTimeout(rep,320)}}
  else{HELD[b]=false;if(DIRS[b])dirOrder=dirOrder.filter(d=>d!==b)}}
const heldDir=()=>dirOrder.length?dirOrder[dirOrder.length-1]:null;
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',z:'a',Z:'a',x:'b',X:'b',Enter:'start',Shift:'select',' ':'a',Escape:'b',Backspace:'b',w:'up',a:'left',s:'down',d:'right'};
addEventListener('keydown',e=>{const b=KEYMAP[e.key];if(b){e.preventDefault();btn(b,true)}});
addEventListener('keyup',e=>{const b=KEYMAP[e.key];if(b){e.preventDefault();btn(b,false)}});
// on-screen buttons when the game runs on its own on a touch screen
(()=>{let inConsole=false;try{inConsole=window.parent!==window&&!!window.parent.ZIGAPLAY}catch(e){}
  const touch='ontouchstart' in window||matchMedia('(pointer:coarse)').matches;if(inConsole||!touch)return;
  document.body.classList.add('touch');const pad=$('#pad');const active=new Map();
  const hit=(x,y)=>{const e=document.elementFromPoint(x,y);return e&&e.dataset&&e.dataset.b?e:null};
  const upd=(ev)=>{ev.preventDefault();const now=new Map();for(const t of ev.touches){const e=hit(t.clientX,t.clientY);if(e)now.set(e.dataset.b,e)}
    for(const [b,e] of active)if(!now.has(b)){e.classList.remove('on');btn(b,false)}for(const [b,e] of now)if(!active.has(b)){e.classList.add('on');btn(b,true)}
    active.clear();for(const [b,e] of now)active.set(b,e)};
  for(const ev of ['touchstart','touchmove','touchend','touchcancel'])pad.addEventListener(ev,upd,{passive:false});
  setTimeout(resize,0)})();
window.ZPCart={title:'Tides of the Drowned Moon',input(b,d){btn(b,d)},home(){return MODE==='title'?true:'ask'}};

/* ---------- fades & toasts ---------- */
const fadeEl=$('#fade');
async function fade(on,white=false,ms=350){fadeEl.classList.toggle('white',white);fadeEl.style.transitionDuration=ms+'ms';fadeEl.style.opacity=on?1:0;await sleep(ms+20)}
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function toast(text,ms=1500){const w=el('div','win toast',text);UI.appendChild(w);setTimeout(()=>w.remove(),ms)}
function mapToast(name){const w=el('div','win mapname',name);UI.appendChild(w);setTimeout(()=>w.remove(),2700)}

/* ---------- field ---------- */
let MODE='boot';
const FD={map:null,x:0,y:0,ox:0,oy:0,dir:'down',moving:0,walkF:0,npcs:[],busy:0,fx:[],shake:0,tideFx:0,stepCount:0,noEnc:0};
let animT=0;
function tileAt(m,x,y){if(x<0||y<0||x>=m.w||y>=m.h)return m.border;return m.rows[y][x]}
function footOK(ch,tide){const t=TILE[ch];if(!t)return true;if(t.solid||t.deep)return false;
  if(t.shallow||t.reef||t.pool)return tide==='ebb';if(t.drift)return tide!=='ebb';
  if(ch==='u')return tide==='ebb';if(ch==='w'||ch==='i'&&false)return false;return true}
function sailOK(ch,tide){return tide==='flood'&&['~',',','u','w'].includes(ch)}
function onBoat(){const m=FD.map;return m.world&&!footOK(tileAt(m,FD.x,FD.y),S.tide)}
function npcAt(x,y){return FD.npcs.find(n=>n.visible&&n.x===x&&n.y===y)}
function chestAt(x,y){return FD.map.chests.find(c=>c.x===x&&c.y===y)}
function canEnter(x,y){const m=FD.map;
  if(x<0||y<0||x>=m.w||y>=m.h)return m.edge&&!m.world?'edge':null;
  if(npcAt(x,y)||chestAt(x,y))return null;
  const ch=tileAt(m,x,y);if(footOK(ch,S.tide))return'foot';
  if(m.world&&S.boat&&sailOK(ch,S.tide))return'boat';return null}

function loadMap(id,x,y,dir){const m=MAPS[id];FD.map=m;FD.foam=null;FD.x=x;FD.y=y;FD.ox=FD.oy=0;FD.moving=0;FD.dir=dir||FD.dir;
  S.map=id;S.x=x;S.y=y;S.dir=FD.dir;
  FD.npcs=m.npcs.map(n=>({...n,hx:n.x,hy:n.y,ox:0,oy:0,dir:n.dir||'down',wt:60+Math.random()*120,mv:0,visible:true}));
  refreshNpcs();FD.stepCount=0;FD.noEnc=6}
function refreshNpcs(){for(const n of FD.npcs)n.visible=!n.cond||n.cond()}
function musicFor(m){if(m.world)return S.tide==='ebb'?'seabed':'sea';return m.music}
async function goto(id,x,y,dir,{silent=false}={}){
  FD.busy++;if(!silent){AU.play('door');await fade(1)}
  loadMap(id,x,y,dir);AU.music(musicFor(FD.map));if(MODE==='field')saveGame(0);
  if(!silent){await fade(0);if(!FD.map.indoor)mapToast(FD.map.name)}
  FD.busy=Math.max(0,FD.busy-1);
  await onArrive()}
async function onArrive(){const m=FD.map;if(m.world)return;
  const tr=m.triggers.find(t=>FD.x>=t.x&&FD.x<t.x+(t.w||1)&&FD.y>=t.y&&FD.y<t.y+(t.h||1)&&(!t.cond||t.cond()));if(tr&&tr.onArrive)await runScript(tr.run)}

async function runScript(key,arg){const fn=STORY[key];if(!fn){console.warn('no script',key);return}
  FD.busy++;try{await fn(arg)}catch(e){console.error(e)}finally{FD.busy=Math.max(0,FD.busy-1);refreshNpcs()}}

function fieldUpdate(){
  const m=FD.map;if(!m)return;
  // npcs
  for(const n of FD.npcs){if(!n.visible)continue;
    if(n.mv){const sp=1;const [dx,dy]=DIRS[n.dir];n.mvp+=sp;n.ox=dx*(n.mvp-16);n.oy=dy*(n.mvp-16);n.frame=(n.mvp/8|0)%2+1;if(n.mvp>=16){n.mv=0;n.ox=n.oy=0;n.frame=0}}
    else if(n.wander&&!FD.busy&&!uiOpen()){if(--n.wt<=0){n.wt=90+Math.random()*160;const d=pick(Object.keys(DIRS)),[dx,dy]=DIRS[d],tx=n.x+dx,ty=n.y+dy;n.dir=d;
      if(Math.abs(tx-n.hx)<=2&&Math.abs(ty-n.hy)<=2&&footOK(tileAt(m,tx,ty),S.tide)&&!npcAt(tx,ty)&&!chestAt(tx,ty)&&!(tx===FD.x&&ty===FD.y)&&!(FD.moving&&tx===FD.tx&&ty===FD.ty)&&tx>=0&&ty>=0&&tx<m.w&&ty<m.h){n.x=tx;n.y=ty;n.mv=1;n.mvp=0;n.ox=-dx*16;n.oy=-dy*16}}}}
  // player
  if(FD.moving){const sp=FD.boatMove?4:2;FD.mp+=sp;const [dx,dy]=DIRS[FD.dir];FD.ox=dx*(FD.mp-16);FD.oy=dy*(FD.mp-16);
    if(FD.mp%8===0)FD.walkF++;
    if(FD.mp>=16){FD.moving=0;FD.ox=FD.oy=0;if(!FD.scripted)afterStep()}return}
  if(FD.busy||uiOpen()||MODE!=='field')return;
  const d=heldDir();if(d)tryMove(d)}
function tryMove(d){FD.dir=d;const [dx,dy]=DIRS[d],tx=FD.x+dx,ty=FD.y+dy;const how=canEnter(tx,ty);
  if(how==='edge'){leaveByEdge();return}
  if(!how){return}
  FD.px=FD.x;FD.py=FD.y;FD.boatMove=how==='boat';FD.tx=tx;FD.ty=ty;FD.x=tx;FD.y=ty;FD.moving=1;FD.mp=0;FD.ox=-dx*16;FD.oy=-dy*16}
async function leaveByEdge(){const e=FD.map.edge;FD.busy++;
  if(e.to==='world'){await goto('world',e.x,e.y,'down')}else await goto(e.to,e.x,e.y,e.dir||'down');FD.busy=Math.max(0,FD.busy-1)}
async function afterStep(){
  const m=FD.map;S.x=FD.x;S.y=FD.y;S.dir=FD.dir;S.steps++;
  const ex=m.exits.find(e=>e.x===FD.x&&e.y===FD.y);
  if(ex){FD.busy++;await goto(ex.to,ex.tx,ex.ty,ex.dir);FD.busy=Math.max(0,FD.busy-1);return}
  if(m.world){const ch=tileAt(m,FD.x,FD.y);const icon=Object.entries(WORLD_POS).find(([k,[x,y]])=>x===FD.x&&y===FD.y);
    if(icon){FD.busy++;await runScript('enter_'+icon[0]);FD.busy=Math.max(0,FD.busy-1);return}}
  const tr=m.triggers.find(t=>FD.x>=t.x&&FD.x<t.x+(t.w||1)&&FD.y>=t.y&&FD.y<t.y+(t.h||1)&&(!t.cond||t.cond()));
  if(tr){await runScript(tr.run);return}
  // encounters
  const grp=encGroup();if(grp){FD.stepCount++;if(FD.noEnc>0)FD.noEnc--;
    else{const rate=m.world?(onBoat()?34:26):(m.rate||24);if(Math.random()<1/rate){await randomBattle(grp)}}}}
function tier(){return F('grief')?3:F('spire')?2:1}
function encGroup(){const m=FD.map;if(S.flags.noenc)return null;
  if(m.world){const t=tier(),ch=tileAt(m,FD.x,FD.y);
    if(['v','V','n','u','i','l','w'].includes(ch))return null;
    if(onBoat())return['sea1','sea2','sea3'][t-1];
    if(TILE[ch]&&(TILE[ch].shallow||TILE[ch].reef))return['seabed1','seabed2','sea3'][t-1];
    if(FD.y>28&&FD.x<18)return t===1?'saltmere':'sea1';
    return['saltmere','sea1','sea2'][t-1]}
  return m.enc||null}
function battleBg(){const m=FD.map;if(!m.world)return m.bg||'cave';const ch=tileAt(m,FD.x,FD.y);if(onBoat())return'sea';if(TILE[ch]&&(TILE[ch].shallow||TILE[ch].reef))return'seabed';return'beach'}
async function randomBattle(grp){const tbl=GROUPS[grp];let tot=tbl.reduce((a,b)=>a+b[0],0),r=Math.random()*tot,ch=tbl[0][1];for(const [w,ids] of tbl){if((r-=w)<0){ch=ids;break}}
  FD.busy++;const res=await startBattle(ch,{bg:battleBg()});FD.busy=Math.max(0,FD.busy-1);FD.noEnc=5;return res}

// A button on the field
async function interact(){
  const [dx,dy]=DIRS[FD.dir];let tx=FD.x+dx,ty=FD.y+dy;const m=FD.map;
  let n=npcAt(tx,ty);if(!n&&tileAt(m,tx,ty)==='c'){n=npcAt(tx+dx,ty+dy)}
  if(n){if(!n.mon&&!n.fixed){n.dir={up:'down',down:'up',left:'right',right:'left'}[FD.dir]}await runScript(n.talk,n);return}
  const c=chestAt(tx,ty);if(c){await openChest(c);return}
  const ins=m.inspect.find(i=>i.x===tx&&i.y===ty);if(ins){await runScript(ins.talk,ins);return}
}
async function openChest(c){if(S.flags['ch_'+c.id]){return}
  FD.busy++;AU.play('chest');setF('ch_'+c.id);
  if(c.gold){S.gold+=c.gold;await say(null,`Found <span class="gold">${c.gold} pearls</span>.`)}
  else{const id=c.item||c.gear;addItem(id,c.n||1);await say(null,`Found <span class="gold">${itemName(id)}</span>${c.n>1?' ×'+c.n:''}.`)}
  FD.busy=Math.max(0,FD.busy-1)}

/* ---------- tide ---------- */
async function toggleTide(){
  if(!F('tidepower')){return}
  const m=FD.map,to=S.tide==='flood'?'ebb':'flood';
  if(m.tideLock){AU.play('buzz');await say(null,'The lantern flickers. The sea won\'t answer it here.');return}
  if(m.indoor){AU.play('buzz');return}
  const ch=tileAt(m,FD.x,FD.y);
  if(!footOK(ch,to)){
    if(!(m.world&&S.boat&&sailOK(ch,to))){AU.play('buzz');
      await say(null,to==='ebb'?(TILE[ch]&&TILE[ch].drift?'You\'re standing on a floating log. Draw the sea back now and you\'ll fall.':'The water here is too deep to draw back.'):(TILE[ch]&&TILE[ch].reef?'Flood the reef with you on it? The boat can\'t reach you here. Walk to open shallows first.':'If the sea comes back now, it will sweep you away.'));return}}
  FD.busy++;AU.play('tide');FD.tideFx={t:0,to};
  await frames(28);S.tide=to;FD.foam=null;refreshNpcs();await frames(28);FD.tideFx=0;
  if(m.world)AU.music(musicFor(m));FD.busy=Math.max(0,FD.busy-1);
  if(!F('tidetip2')&&to==='ebb'&&m.world){setF('tidetip2');await say(null,'At Ebb the shallows are dry ground. Walk them. Things sleep down here that the boat sails over.')}}

/* ---------- drawing the field ---------- */
function computeFoam(){const m=FD.map,t=S.tide,mask=new Uint8Array(m.w*m.h);
  const isW=ch=>{const d=TILE[ch];if(!d)return false;if(d.deep)return true;if(d.shallow||d.reef)return t!=='ebb';return ch==='w'||ch==='d'||(ch==='u'&&t!=='ebb')||ch==='i'};
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const ch=m.rows[y][x];if(!isW(ch)||ch==='d')continue;
    const n=[[0,-1],[1,0],[0,1],[-1,0]].map(([dx,dy])=>{const c2=tileAt(m,x+dx,y+dy);return!isW(c2)&&!(x+dx<0||y+dy<0||x+dx>=m.w||y+dy>=m.h)});
    mask[y*m.w+x]=n[0]|n[1]<<1|n[2]<<2|n[3]<<3}
  FD.foam=mask}
const foamCache=new Map();
function foamImg(bits,f){const k=bits*4+f;let c=foamCache.get(k);if(!c){c=mk(16,16);foamEdges(c.getContext('2d'),[bits&1,bits&2,bits&4,bits&8],f);foamCache.set(k,c)}return c}
function camera(){const m=FD.map;const px=FD.x*16+FD.ox+8,py=FD.y*16+FD.oy+8;
  let cx=px-VW/2,cy=py-VH/2+8;const mw=m.w*16,mh=m.h*16;
  if(m.world){/* free scroll, border is sea */}
  else{cx=mw<=VW?(mw-VW)/2:clamp(cx,0,mw-VW);cy=mh<=VH?(mh-VH)/2:clamp(cy,0,mh-VH)}
  return[Math.round(cx),Math.round(cy)]}
function drawField(){
  const m=FD.map;if(!m)return;if(!FD.foam)computeFoam();
  const [cx,cy]=camera();const af=(animT/16|0)%4;
  g.fillStyle='#000';g.fillRect(0,0,VW,VH);
  const x0=Math.floor(cx/16),y0=Math.floor(cy/16),x1=Math.ceil((cx+VW)/16),y1=Math.ceil((cy+VH)/16);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const ch=tileAt(m,tx,ty);const sx=tx*16-cx,sy=ty*16-cy;
    g.drawImage(tileImg(ch,af,S.tide),sx,sy);
    if(tx>=0&&ty>=0&&tx<m.w&&ty<m.h){const fb=FD.foam[ty*m.w+tx];if(fb)g.drawImage(foamImg(fb,af%2),sx,sy)}}
  if(m.under)m.under(g,cx,cy);
  // sprites sorted by y
  const list=[];
  for(const c of m.chests)list.push({y:c.y*16,draw:()=>g.drawImage(ART.chest[F('ch_'+c.id)?1:0],c.x*16-cx,c.y*16-cy)});
  for(const n of FD.npcs){if(!n.visible)continue;const nx=n.x*16+n.ox-cx,ny=n.y*16+n.oy-cy;
    list.push({y:n.y*16+n.oy,draw:()=>{
      if(n.mon){const im=monImg(n.mon[0],n.mon[1]);const bob=Math.sin(animT/20)*1.5;g.drawImage(im,Math.round(nx+8-im.width/2),Math.round(ny+16-im.height+bob))}
      else if(n.big){g.save();g.globalAlpha=.95;g.drawImage(n.big,Math.round(nx+8-n.big.width/2),Math.round(ny+8-n.big.height/2));g.restore()}
      else{const im=personImg(LOOKS[n.look],n.dir,n.mv?n.frame:0);if(n.ghost){g.save();g.globalAlpha=.72+Math.sin(animT/25+n.x)*.12;g.drawImage(im,nx,ny-1+Math.round(Math.sin(animT/30+n.y)));g.restore()}else g.drawImage(im,nx,ny-1)}}})}
  const px=FD.x*16+FD.ox-cx,py=FD.y*16+FD.oy-cy;
  if(!FD.hidePlayer)list.push({y:FD.y*16+FD.oy,draw:()=>{
    if(onBoatDraw()){g.drawImage(ART.boat[FD.dir][(animT/20|0)%2],px-4,py)}
    else{const look=LOOKS[S.party[0]];const wf=FD.moving?[1,0,2,0][FD.walkF%4]:0;
      const im=personImg(look,FD.dir,wf);if(GHOSTLY.has(S.party[0])){g.save();g.globalAlpha=.85;g.drawImage(im,px,py-1);g.restore()}else g.drawImage(im,px,py-1)}}});
  list.sort((a,b)=>a.y-b.y);for(const s of list)s.draw();
  // tide wave sweep
  if(FD.tideFx){const t=FD.tideFx;t.t++;const p=t.t/56;const y=Math.round((t.to==='ebb'?p:1-p)*VH*1.3-VH*.15);
    g.fillStyle=t.to==='ebb'?'rgba(255,240,190,.18)':'rgba(120,190,255,.25)';g.fillRect(0,0,VW,VH);
    g.fillStyle='rgba(230,246,255,.75)';for(let x=0;x<VW;x+=2)g.fillRect(x,y+Math.round(Math.sin(x/8+t.t/4)*3),2,2);
    g.fillStyle='rgba(120,190,255,.35)';g.fillRect(0,t.to==='ebb'?0:y,VW,t.to==='ebb'?y:VH-y)}
  if(m.world&&S.tide==='ebb'){g.fillStyle='rgba(20,30,70,.18)';g.fillRect(0,0,VW,VH)}
  for(const f of FD.fx)f(g,cx,cy);
}
function onBoatDraw(){const m=FD.map;if(!m.world||!S.boat)return false;const ch=tileAt(m,FD.x,FD.y);
  if(FD.moving&&FD.boatMove)return true;return!footOK(ch,S.tide)}

/* ---------- main loop ---------- */
let last=performance.now(),acc=0;
function loop(t){requestAnimationFrame(loop);acc+=Math.min(100,t-last);last=t;
  while(acc>=1000/60){acc-=1000/60;animT++;if(S&&MODE!=='title')S.time+=1/60;
    if(MODE==='field')fieldUpdate();else if(MODE==='battle')battleUpdate();else if(MODE==='title')titleUpdate()}
  if(MODE==='field'||MODE==='cut')drawField();else if(MODE==='battle')drawBattle();else if(MODE==='title')drawTitle();else if(MODE==='ending')drawEnding();else if(MODE==='black'){g.fillStyle='#000';g.fillRect(0,0,VW,VH)}}

function fieldInput(b){if(MODE!=='field'||FD.busy||FD.moving||uiOpen())return;
  if(b==='a')interact();else if(b==='start'){AU.play('ok');openMainMenu()}else if(b==='select')toggleTide()}
