/* ================= the field, top-down: walking the classic Strike at Night maps tile by tile ================= */
const TS=16;
const DIRV={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const WD={map:null,m:null,x:0,y:0,px:0,py:0,ox:0,oy:0,dir:'down',moving:0,mp:0,walkF:0,run:0,npcs:[],lock:0,busy:false,trail:[],
  pose:null,hidePlayer:0,lights:null,fx:[],shake:0,steps:0,noEnc:14,ban:null,banT:0,scripted:0,qT:0,
  get zone(){return this.map}};
/* ---------- people: any Spellsteel outfit as a 16x24 top-down sprite ---------- */
const HAIR_STYLE={long:['Long Straight','Very Long','Side Swept Long','Hime Cut','Wavy','Locs','Half Up','Drill Curls'],pony:['Ponytail','Low Ponytail'],bun:['Bun','Top Knot'],
  bald:['Bald','Buzz Cut'],spiky:['Spiky Hero','Long Spiky','Tall Spikes'],messy:['Messy','Shaggy','Wild Mane','Wolf Cut','Mullet','Emo Fringe','Fluffy','Antenna'],
  braid:['Braid'],twin:['Twintails','Twin Buns'],curly:['Curly','Afro','Royal Curls'],mohawk:['Mohawk']};
const HAT_STYLE={'hw-hood':['Hood','Cat-Ear Hood'],'hw-cap':['Cap','Backwards Cap','Beanie','Pom Beanie','Ushanka','Beret','Bucket Hat','Nightcap','Graduation Cap','Propeller Cap','Chef Hat','Goggles','Headphones'],
  'hw-helmet':['Knight Helm','Viking Helm','Winged Helm','Spartan Helm','Samurai Kabuto'],'hw-bandana':['Bandana'],
  'hw-headband':['Headband','Crown','Tiara','Circlet','Royal Circlet','Laurel Wreath','Flower Crown','Halo','Ribbon Bow'],
  hat:['Wizard Hat','Witch Hat','Top Hat','Bowler','Cowboy Hat','Straw Hat','Adventurer Hat','Pirate Tricorn','Jester Hat','Party Hat','Mushroom Cap','Frog Hat']};
const styleOf=(T,v)=>Object.keys(T).find(k=>T[k].includes(v));
const _topC=new Map();
function topLook(L0){const L=Object.assign({},DEFAULT_LOOK,L0||{}),k=JSON.stringify(L);let t=_topC.get(k);if(t)return t;
  const st=[],hs=styleOf(HAIR_STYLE,L.hair);if(hs)st.push(hs);
  const hat=L.hat&&L.hat!=='None'?styleOf(HAT_STYLE,L.hat):null;if(hat)st.push(hat);
  const f=L.face||'None';if(f==='Full Beard'||f==='Goatee')st.push('beard');else if(f==='Mustache')st.push('mustache');else if(f==='Stubble')st.push('stubble');else if(['Mouth Mask','Ninja Mask','Fox Mask','Domino Mask'].includes(f))st.push('mask');
  const top=L.top||'',bot=L.bot||'';
  if(['Dress','Ball Gown','Apron Dress','Kimono'].includes(top)||['Skirt','Pleated Skirt','Long Skirt','Kilt','Wrap Skirt','Tutu','Hakama'].includes(bot))st.push('dress');
  else if(['Mage Robe','Sorcerer Robe','Priest Vestment'].includes(top))st.push('robe');
  if(['Long Coat','Trench Coat','Pirate Coat'].includes(top))st.push('o-coat');else if(['Vest','Ranger Vest','Noble Doublet'].includes(top))st.push('o-vest');
  else if(['Full Plate','Breastplate','Chainmail','Scale Mail','Samurai Armor'].includes(top))st.push('o-armor');
  if(['Short Cape','Long Cape','Tattered Cape','Royal Cape'].includes(L.back))st.push('cape');
  const TT=byName(TOPS,top),c=(n,d)=>dyeOf(n,d);
  t={id:'ss'+_topC.size,skin:skinOf(L),hair:c(L.hairC,'Chocolate'),top:c(L.topC1,TT[2][0]),acc:c(L.topC2,TT[2][1]),bot:c(L.botC1,'Brown'),boot:c(L.shoeC,'Chocolate'),
    hwc:hat==='hw-headband'&&['Crown','Tiara','Circlet','Royal Circlet','Halo'].includes(L.hat)?c(L.hatC1,'Gold'):c(L.hatC1,'Crimson'),cape:c(L.backC1,'Crimson'),style:st};
  if(hat==='hat')t.acc=c(L.hatC1,'Leather');if(st.includes('mask'))t.acc=c(L.faceC,'Charcoal');
  _topC.set(k,t);return t}
/* who an npc is drawn as: one of the classic people, or a member of the party in their own clothes */
const npcLook=n=>n.party?topLook((allMembers().find(m=>m.id===n.party)||{look:CHARS[n.party].look}).look):n.ss?topLook(n.ss):TD.LOOKS[n.look]||TD.LOOKS.villager;
/* ---------- the map ---------- */
const F=k=>!!(G&&G.flags[k]),setF=k=>{G.flags[k]=1};
function tileAt(m,x,y){if(x<0||y<0||x>=m.w||y>=m.h)return m.border;return m.rows[y][x]}
const solidCh=ch=>{const t=TD.TILE[ch];return!t||!!t.solid||!!t.deep};
const npcAt=(x,y)=>WD.npcs.find(n=>n.visible&&n.x===x&&n.y===y);
const chestAt=(x,y)=>WD.m.chests.find(c=>c.x===x&&c.y===y&&(!c.cond||c.cond()));
function canEnter(x,y){const m=WD.m;if(x<0||y<0||x>=m.w||y>=m.h)return m.edge?'edge':null;if(npcAt(x,y)||chestAt(x,y))return null;return solidCh(tileAt(m,x,y))?null:'foot'}
const npc=id=>WD.npcs.find(n=>n.id===id);
function refreshNpcs(){for(const n of WD.npcs)n.visible=!n.cond||n.cond()}
function initTrail(){WD.trail=[];const [dx,dy]=DIRV[WD.dir]||[0,1];let px=WD.x,py=WD.y;
  for(let k=1;k<=3;k++){const nx=WD.x-dx*k,ny=WD.y-dy*k;if(nx>=0&&ny>=0&&nx<WD.m.w&&ny<WD.m.h&&!solidCh(tileAt(WD.m,nx,ny))&&px===WD.x-dx*(k-1)&&py===WD.y-dy*(k-1)){px=nx;py=ny}WD.trail.push({x:px,y:py})}}
function pushTrail(x,y){WD.trail.unshift({x,y});if(WD.trail.length>4)WD.trail.length=4}
function loadMap(id,x,y,dir){const m=MAPS[id];WD.map=id;WD.m=m;G.zone=id;WD.x=x;WD.y=y;WD.px=x;WD.py=y;WD.ox=WD.oy=0;WD.moving=0;WD.dir=dir||WD.dir;
  G.x=x;G.y=y;G.dir=WD.dir;WD.pose=null;WD.hidePlayer=0;WD.lights=null;WD.fx=[];WD.shake=0;
  if(m.onLoad)m.onLoad(m);
  WD.npcs=m.npcs.map(n=>({...n,hx:n.x,hy:n.y,ox:0,oy:0,dir:n.dir||'down',wt:60+rnd()*120,mv:0,visible:true}));
  refreshNpcs();initTrail();WD.steps=0;WD.noEnc=14;WD.ban=m.indoor?null:m.name;WD.banT=m.indoor?0:2.6;SND.play(m.music||'field')}
/* enter a map at a spot, or at its default spot if that one is no good (an old save, say) */
function enterZone(id,x,y,dir){const m=MAPS[id];if(typeof dir!=='string')dir=null;
  if(x==null||y==null||x<0||y<0||x>=m.w||y>=m.h||solidCh(tileAt(m,x,y))){[x,y,dir]=m.spawn}loadMap(id,x,y,dir||'down')}
async function goto(id,x,y,dir,o={}){WD.lock++;try{if(!o.silent){SND.fx('door');await fadeOut(240)}loadMap(id,x,y,dir);if(!MAPS[id].noSave)autosave();if(!o.silent)await fadeIn(260)}finally{WD.lock=Math.max(0,WD.lock-1)}
  await onArrive()}
const goZone=goto;
async function onArrive(){const m=WD.m;const tr=m.triggers.find(t=>t.onArrive&&WD.x>=t.x&&WD.x<t.x+(t.w||1)&&WD.y>=t.y&&WD.y<t.y+(t.h||1)&&(!t.cond||t.cond()));if(tr)await runScript(tr.run)}
/* stories run one at a time; while one runs the hero stands still */
async function runScript(key,arg){const fn=STORY[key];if(!fn){console.warn('no script',key);return}
  WD.lock++;WD.moving=0;try{await fn(arg)}catch(e){if(e!==ABORT)console.error(e)}finally{WD.lock=Math.max(0,WD.lock-1);if(!WD.lock)WD.dlg=null;if(WD.m)refreshNpcs()}}
const runStoryFn=runScript;
/* step back onto the tile you came from */
function pushBack(){WD.x=WD.px;WD.y=WD.py;WD.ox=WD.oy=0;WD.moving=0;G.x=WD.x;G.y=WD.y}
const free=()=>!WD.lock&&!WD.busy&&!MODAL.length&&S_SCENE===WORLD_SCENE;
/* ---------- moving ---------- */
function heldDir(){for(const d of['up','down','left','right'])if(held.has(d))return d;return null}
function tryMove(d){WD.dir=d;const [dx,dy]=DIRV[d],tx=WD.x+dx,ty=WD.y+dy,how=canEnter(tx,ty);
  if(how==='edge'){leaveByEdge();return}if(!how)return;
  WD.px=WD.x;WD.py=WD.y;pushTrail(WD.x,WD.y);WD.x=tx;WD.y=ty;WD.moving=1;WD.mp=0;WD.ox=-dx*TS;WD.oy=-dy*TS}
async function leaveByEdge(){const e=WD.m.edge;WD.lock++;try{await goto(e.to,e.x,e.y,e.dir||'down')}finally{WD.lock=Math.max(0,WD.lock-1)}}
async function afterStep(){const m=WD.m;G.x=WD.x;G.y=WD.y;G.dir=WD.dir;G.steps=(G.steps||0)+1;
  const ex=m.exits.find(e=>e.x===WD.x&&e.y===WD.y&&(!e.cond||e.cond()));
  if(ex){WD.lock++;try{await goto(ex.to,ex.tx,ex.ty,ex.dir)}finally{WD.lock=Math.max(0,WD.lock-1)}return}
  const tr=m.triggers.find(t=>!t.onArrive&&WD.x>=t.x&&WD.x<t.x+(t.w||1)&&WD.y>=t.y&&WD.y<t.y+(t.h||1)&&(!t.cond||t.cond()));
  if(tr){await runScript(tr.run);return}
  if(m.enc&&!G.flags.noenc){WD.steps++;if(WD.noEnc>0)WD.noEnc--;else if(rnd()<1/(m.rate||30)){WD.noEnc=18;encounter(m)}}}
/* ---------- the scene ---------- */
const WORLD_SCENE={
 enter(){if(WD.m)SND.play(WD.m.music||'field');WD.busy=false},
 update(dt){if(!WD.m)return;G.time+=dt;WD.qT+=dt;if(WD.qT>1.5){WD.qT=0;if(free())checkQuests()}if(WD.banT>0)WD.banT-=dt;if(WD.shake>0)WD.shake=Math.max(0,WD.shake-dt);
   const k=Math.min(3,dt*60);
   for(const n of WD.npcs){if(!n.visible)continue;
     if(n.mv){const [dx,dy]=DIRV[n.dir];n.mvp+=(n.sp||1)*k;const p=Math.min(16,n.mvp);n.ox=dx*(p-16);n.oy=dy*(p-16);n.frame=(n.mvp/8|0)%2+1;if(n.mvp>=16){n.mv=0;n.ox=n.oy=0;n.frame=0}}
     else if(n.wander&&free()){n.wt-=k;if(n.wt<=0){n.wt=90+rnd()*160;const d=['up','down','left','right'][ri(0,3)],[dx,dy]=DIRV[d],tx=n.x+dx,ty=n.y+dy;n.dir=d;
       if(Math.abs(tx-n.hx)<=2&&Math.abs(ty-n.hy)<=2&&tx>=0&&ty>=0&&tx<WD.m.w&&ty<WD.m.h&&!solidCh(tileAt(WD.m,tx,ty))&&!npcAt(tx,ty)&&!chestAt(tx,ty)&&!(tx===WD.x&&ty===WD.y)&&!(WD.moving&&tx===WD.x&&ty===WD.y)){n.x=tx;n.y=ty;n.mv=1;n.mvp=0;n.ox=-dx*16;n.oy=-dy*16}}}}
   if(WD.moving){const sp=(!WD.scripted&&held.has('b')?4:2)*k;WD.mp+=sp;const [dx,dy]=DIRV[WD.dir];const p=Math.min(16,WD.mp);WD.ox=dx*(p-16);WD.oy=dy*(p-16);
     if(Math.floor((WD.mp-sp)/8)!==Math.floor(WD.mp/8)){WD.walkF++;if(WD.walkF%2===0)SND.fx('step')}
     if(WD.mp>=16){WD.moving=0;WD.ox=WD.oy=0;if(!WD.scripted)afterStep()}return}
   if(!free())return;const d=heldDir();if(d)tryMove(d)},
 draw(){drawField()},
 input(b){if(!free()||WD.moving)return;if(b==='a')interact();else if(b==='start'){SND.fx('ok');mainMenu()}},
};
const heroScreenY=()=>{const [,cy]=camera();return WD.y*TS+WD.oy-cy+8};
function camera(){const m=WD.m,px=WD.x*TS+WD.ox+8,py=WD.y*TS+WD.oy+8,mw=m.w*TS,mh=m.h*TS;
  let cx=px-W/2,cy=py-Math.round(H*.42);cx=mw<=W?(mw-W)/2:clamp(cx,0,mw-W);cy=mh<=H?(mh-H)/2:clamp(cy,0,mh-H);return[Math.round(cx),Math.round(cy)]}
function drawField(){const m=WD.m;if(!m)return;const g=ctx;let [cx,cy]=camera();const af=Math.floor(TIME*3.75)%4;
  if(WD.shake>0){cx+=ri(-2,2);cy+=ri(-2,2)}
  g.fillStyle='#000';g.fillRect(0,0,W,H);
  const x0=Math.floor(cx/TS),y0=Math.floor(cy/TS),x1=Math.ceil((cx+W)/TS),y1=Math.ceil((cy+H)/TS);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++)g.drawImage(TD.tileImg(tileAt(m,tx,ty),af,'flood'),tx*TS-cx,ty*TS-cy);
  const list=[];
  for(const c of m.chests){if(c.cond&&!c.cond())continue;list.push({y:c.y*TS,draw:()=>g.drawImage(TD.ART.chest[G.opened[c.id]?1:0],c.x*TS-cx,c.y*TS-cy)})}
  for(const n of WD.npcs){if(!n.visible)continue;const nx=n.x*TS+n.ox-cx,ny=n.y*TS+n.oy-cy;
    list.push({y:n.y*TS+n.oy+(n.big?-2:0),draw:()=>{
      if(n.mon){const im=TD.monImg(n.mon[0],n.mon[1]);const bob=Math.sin(TIME*3+n.x)*1.5;g.save();if(n.dir==='left'){g.translate(Math.round(nx+8),0);g.scale(-1,1);g.drawImage(im,Math.round(-im.width/2),Math.round(ny+16-im.height+bob))}else g.drawImage(im,Math.round(nx+8-im.width/2),Math.round(ny+16-im.height+bob));g.restore()}
      else if(n.big){const im=n.big();g.drawImage(im,Math.round(nx+8-im.width/2+(n.dx||0)),n.stand?Math.round(ny+15-im.height):Math.round(ny+8-im.height/2))}
      else if(n.lying){const im=TD.personImg(npcLook(n),'down',0);g.save();g.translate(Math.round(nx+8),Math.round(ny+10));g.rotate(n.lying<0?Math.PI/2:-Math.PI/2);g.drawImage(im,-8,-14);g.restore()}
      else g.drawImage(TD.personImg(npcLook(n),n.dir,n.mv?n.frame:(n.pose||0)),Math.round(nx),Math.round(ny-9))}})}
  const px=WD.x*TS+WD.ox-cx,py=WD.y*TS+WD.oy-cy;
  if(!WD.hidePlayer)list.push({y:WD.y*TS+WD.oy,draw:()=>{const wf=WD.pose||(WD.moving?[1,0,2,0][WD.walkF%4]:0);g.drawImage(TD.personImg(topLook(hero().look),WD.dir,wf),Math.round(px),Math.round(py-9))}});
  const fl=m.noFollow||WD.hidePlayer?[]:G.party.filter(x=>x.id!=='hero').slice(0,2);
  if(fl.length){const p=WD.moving?Math.min(1,WD.mp/16):1;
    fl.forEach((mem,k)=>{const to=WD.trail[k]||{x:WD.x,y:WD.y},fr=WD.trail[k+1]||to,at=WD.moving?fr:to;
      const fx=(at.x+(to.x-at.x)*p)*TS,fy=(at.y+(to.y-at.y)*p)*TS;
      const dir=fr.x!==to.x||fr.y!==to.y?(to.x>fr.x?'right':to.x<fr.x?'left':to.y>fr.y?'down':'up'):WD.dir;
      const walking=WD.moving&&(fr.x!==to.x||fr.y!==to.y);const wf=walking?[1,0,2,0][(WD.walkF+k+1)%4]:0;
      list.push({y:fy-.5-k*.01,draw:()=>g.drawImage(TD.personImg(topLook(mem.look),dir,wf),Math.round(fx-cx),Math.round(fy-cy)-9)})})}
  list.sort((a,b)=>a.y-b.y);for(const s of list)s.draw();
  const nt=m.night&&m.night();if(nt)drawNight(m,cx,cy);else if(WD.lights)drawLights(cx,cy,WD.lights);
  if(m.over)m.over(g,cx,cy);
  for(const f of WD.fx.slice())f(g,cx,cy);
  if(WD.banT>0&&WD.ban){const a=Math.min(1,WD.banT*2,(2.6-WD.banT)*4);g.globalAlpha=a;const t=WD.ban;g.font='9px "Pixelify Sans",monospace';const tw=g.measureText(t).width+20;
    g.fillStyle='rgba(14,22,84,.9)';g.fillRect(Math.round(W/2-tw/2),8,Math.round(tw),15);g.fillStyle='#e8eeff';g.fillRect(Math.round(W/2-tw/2),8,Math.round(tw),1);g.fillRect(Math.round(W/2-tw/2),22,Math.round(tw),1);
    g.fillStyle='#ffd86a';g.textAlign='center';g.fillText(t,W/2,19);g.textAlign='left';g.globalAlpha=1}}
/* night: a deep wash over everything, then warm light added back around every lit window, fire and lamp */
function nightLights(m){if(m._lights)return m._lights;const L=[];for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const ch=m.rows[y][x],t=TD.TILE[ch];
    if(ch==='+')L.push({x:x*16+8,y:y*16+8,r:20,c:'rgba(255,200,110,.55)'});else if(t&&t.fire)L.push({x:x*16+8,y:y*16+8,r:44,c:'rgba(255,120,40,.7)',fire:1});
    else if(t&&t.lamp){const l=t.lamp;L.push({x:x*16+8+(l.dx||0),y:y*16+8+(l.dy||0),r:l.r,c:l.c,fire:l.flicker?1:0})}}
  return m._lights=L}
function drawLights(cx,cy,list){const g=ctx;g.save();g.globalCompositeOperation='lighter';
  for(const l of list){const x=l.x-cx,y=l.y-cy,r=l.r*(l.fire?.88+Math.sin(TIME*15+l.x)*.08+rnd()*.05:1);if(x<-r||y<-r||x>W+r||y>H+r)continue;
    const gr=g.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,l.c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}g.restore()}
function drawNight(m,cx,cy){const g=ctx;g.fillStyle=m.nightTint||'rgba(6,10,36,.58)';g.fillRect(0,0,W,H);drawLights(cx,cy,[...nightLights(m),...(WD.lights||[])])}
/* ---------- the A button ---------- */
const OPP={up:'down',down:'up',left:'right',right:'left'};
async function interact(){const [dx,dy]=DIRV[WD.dir];let tx=WD.x+dx,ty=WD.y+dy;const m=WD.m;
  let n=npcAt(tx,ty);if(!n&&[')',']','c'].includes(tileAt(m,tx,ty)))n=npcAt(tx+dx,ty+dy);
  if(n&&n.talk){if(!n.mon&&!n.big&&!n.lying&&n.turn!==false)n.dir=OPP[WD.dir];await runScript(n.talk,n);return}
  const c=chestAt(tx,ty);if(c&&!G.opened[c.id]){WD.lock++;try{await openChest(c)}finally{WD.lock=Math.max(0,WD.lock-1)}return}
  const ins=m.inspect.find(i=>i.x===tx&&i.y===ty);if(ins){await runScript(ins.talk,ins)}}
async function openChest(ev){SND.fx('chest');G.opened[ev.id]=1;let txt;
  if(ev.item){addItem(ev.item,ev.n||1);txt=`${ITEMS[ev.item].n}${ev.n>1?' ×'+ev.n:''}`}
  else if(ev.charm){addCharm(ev.charm);txt=CHARMS[ev.charm].n+' (a charm)'}
  else if(ev.cos){G.owned[ev.cos[0]+':'+ev.cos[1]]=1;txt=`${ev.cos[1]}, new for the wardrobe!`}
  else if(ev.gold){G.gold+=ev.gold;txt=`${ev.gold} gold`}
  await say('',`Found ${txt}`)}
/* ---------- fights ---------- */
function encounter(m){let tot=0;for(const f of m.enc)tot+=f[1];let r=rnd()*tot,form=m.enc[0][0];for(const f of m.enc){r-=f[1];if(r<=0){form=f[0];break}}
  WD.lock++;startFight(form,{}).catch(e=>{if(e!==ABORT)console.error(e)}).finally(()=>{WD.lock=Math.max(0,WD.lock-1)})}
/* a fight; if the party falls and you choose to load or quit, whatever was running stops */
async function startFight(form,o){const was=WD.busy;WD.busy=true;const m=WD.m;o=Object.assign({theme:m.bt||'forest',night:!!(m.night&&m.night())},o);
  const r=await battle(form,o);if(r==='load'||r==='title'){await afterFight(r);throw ABORT}WD.busy=was;return r}
async function afterFight(r){if(r==='load'){await loadGame();return}if(r==='title'){toTitle();return}}
/* ---------- helpers for scenes ---------- */
const charWeapon=id=>{const C=CHARS[id],w=newWeapon(C.weapon.kind);return Object.assign(w,C.weapon,{parts:Object.assign(w.parts,C.weapon.parts)})};
const frames=n=>new Promise(r=>{let k=0;const f=()=>{if(++k>=n)r();else requestAnimationFrame(f)};requestAnimationFrame(f)});
function spawn(def){const n={hx:def.x,hy:def.y,ox:0,oy:0,dir:'down',wt:999,mv:0,visible:true,fixed:1,...def};WD.npcs=WD.npcs.filter(o=>o.id!==n.id);WD.npcs.push(n);return n}
function despawn(...ids){WD.npcs=WD.npcs.filter(n=>!ids.includes(n.id))}
/* walk someone along a path of steps; they stay out (and visible) afterwards until despawned */
async function walkNpc(id,path,sp=1){const n=npc(id);if(!n)return;n.cond=null;n.visible=true;n.sp=sp;for(const d of path){const [dx,dy]=DIRV[d];n.dir=d;n.x+=dx;n.y+=dy;n.mv=1;n.mvp=0;n.ox=-dx*16;n.oy=-dy*16;while(n.mv)await frames(1)}}
async function walkMe(path){for(const d of path){const [dx,dy]=DIRV[d];WD.dir=d;pushTrail(WD.x,WD.y);WD.px=WD.x;WD.py=WD.y;WD.x+=dx;WD.y+=dy;WD.moving=1;WD.mp=0;WD.scripted=1;WD.ox=-dx*16;WD.oy=-dy*16;while(WD.moving)await frames(1)}
  WD.scripted=0;G.x=WD.x;G.y=WD.y}
/* walk the hero to a column (and row) one tile at a time */
async function walkMeTo(x,y){const p=[];let cx=WD.x,cy=WD.y;while(cx<x){p.push('right');cx++}while(cx>x){p.push('left');cx--}if(y!=null){while(cy<y){p.push('down');cy++}while(cy>y){p.push('up');cy--}}if(p.length)await walkMe(p)}
function face(id,d){if(id==='me')WD.dir=d;else{const n=npc(id);if(n)n.dir=d}}
/* a member joins */
function join(id,lv){if(owned(id))return;const C=CHARS[id],L=lv||avgLv();
  const m=makeMember(id,L,C.look,C.weapon,C.n);m.weapon.tier=hero().weapon.tier||0;(G.party.length<3?G.party:G.roster).push(m);G.flags[id]=1;SND.fx('level');if(WD.m)initTrail()}
