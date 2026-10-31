/* ================= the field: walking side to side through each place ================= */
const FEET=161,WALK_SPD=62,RUN_SPD=112;
const WD={actors:[],zone:null,x:0,dir:1,moving:false,cam:0,trail:[],busy:false,enc:400,near:null,ban:null,banT:0,walkT:0,stepAcc:0,bump:0,
  pose:null,hidden:new Set(),arm:{},shake:0,lights:null,auto:null,hideParty:0,fx:[]};
/* chests */
const FSPR={};
{const chest=open=>{const b=new Buf(16,14);b.rect(1,5,14,8,'#8a5a32');b.rect(1,5,14,1,'#a8763e');b.rect(1,9,14,1,'#c8a04a');b.rect(7,7,2,4,'#f2c84a');
   if(open){b.rect(1,1,14,4,'#5a3a20');b.rect(2,2,12,3,'#2a1a10');b.px(5,3,'#ffe88a');b.px(9,2,'#ffe88a')}else{b.rect(1,2,14,4,'#a06a3a');b.rect(1,2,14,1,'#c8884a');b.rect(7,4,2,3,'#f2c84a')}b.outline(INK);return b.canvas(1)};
 FSPR.chest=chest(0);FSPR.chestOpen=chest(1)}
/* people without weapons, in plain poses */
const PLAIN={kneel:{crouch:6,lean:1,nl:[1.3,-1.3],fl:[.1,-1.67]},kneelsad:{crouch:6,lean:1.5,nl:[1.3,-1.3],fl:[.1,-1.67],na:[.6,-.4],fa:[.5,-.3],face:'closed'},
  ko:{face:'ko'},hurt:{lean:-2,face:'hurt'},guard:{na:[1,-1.9],fa:[.6,-1.6],crouch:1},wave:{na:[-2.6,-.4]},point:{na:[1.5,0]}};
const _npcC=new Map();
function npcSprite(L,pose,flip){const k=JSON.stringify(L)+pose+flip;let c=_npcC.get(k);if(!c){c=drawDoll(L,PLAIN[pose]||POSES[pose]||{},null).canvas(1,flip);_npcC.set(k,c);if(_npcC.size>300)_npcC.delete(_npcC.keys().next().value)}return c}
/* who someone is: a look, and a weapon if they carry one */
const charWeapon=id=>{const C=CHARS[id],w=newWeapon(C.weapon.kind);return Object.assign(w,C.weapon,{parts:Object.assign(w.parts,C.weapon.parts)})};
const _who={};
function whoLook(key){if(_who[key])return _who[key];let r;
  if(CHARS[key]&&CHARS[key].look)r={look:CHARS[key].look,weapon:charWeapon(key)};
  else if(NPC_LOOKS[key])r={look:NPC_LOOKS[key],weapon:null};
  else if(FOE_LOOKS[key]){const L=FOE_LOOKS[key],w=newWeapon(L.weapon.kind);r={look:L.look,guard:1,weapon:Object.assign(w,L.weapon,{parts:Object.assign(w.parts,L.weapon.parts)})}}
  else r={look:NPC_LOOKS.townsman||DEFAULT_LOOK,weapon:null};
  return _who[key]=r}
function drawPerson(g,who,pose,sx,flip,lying){const W2=whoLook(who);
  if(lying){const c=npcSprite(W2.look,'ko',false);g.save();g.translate(Math.round(sx+(lying>0?22:-22)),FEET-8);g.rotate(lying>0?-Math.PI/2:Math.PI/2);g.drawImage(c,-DOLL_FX,-DOLL_FY);g.restore();return}
  shadow(g,sx);if(W2.weapon&&!PLAIN[pose])drawHeroAt(g,W2.look,W2.weapon,W2.guard&&!pose.startsWith('walk')?'ready':pose,sx,FEET,flip);else g.drawImage(npcSprite(W2.look,pose,flip),Math.round(sx-(flip?DOLL_W-DOLL_FX:DOLL_FX)),FEET-DOLL_FY)}
const shadow=(g,sx,w=9)=>{g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(sx,FEET+1,w,2,0,0,7);g.fill()};
/* is this thing here right now? */
const shown=ev=>(!ev.if||ev.if())&&!(ev.id&&WD.hidden.has(ev.id));
const evArt=ev=>typeof ev.art==='function'?ev.art():ev.art;
/* ---------- moving between places ---------- */
function enterZone(id,x,dir){const Z=ZONES[id];WD.actors=[];WD.hidden=new Set();WD.arm={};WD.lights=null;WD.auto=null;WD.pose=null;WD.fx=[];WD.zone=id;G.zone=id;WD.x=x;G.x=x;WD.dir=dir||1;G.dir=WD.dir;
  WD.trail=[];for(let i=120;i>0;i--)WD.trail.push(x-WD.dir*i);for(const ev of Z.ev)if(ev.k==='scene'&&Math.abs(ev.x-x)<18)WD.arm[ev.id]=false;
  WD.enc=320+rnd()*260;WD.bump=0;WD.ban=Z.n;WD.banT=2.4;SND.play(Z.music||'field');camTo(true)}
function camTo(snap){const Z=ZONES[WD.zone],t=Z.len<=W?(Z.len-W)/2:clamp(WD.x-W/2+WD.dir*20,0,Z.len-W);WD.cam=snap?t:lerp(WD.cam,t,.12);if(Math.abs(WD.cam-t)<.3)WD.cam=t}
async function goZone(id,x,dir){WD.busy=true;await fadeOut(220);enterZone(id,x,dir);if(!ZONES[id].noSave)autosave();await fadeIn(240);WD.busy=false}
/* the edge of a place: go through, or be told why not */
function edge(E,dir){if(!E)return false;if(E.to&&(!E.if||E.if())){goZone(E.to,E.x!=null?E.x:(dir>0?16:ZONES[E.to].len-16),dir);return true}
  if(E.block&&WD.bump<=0){WD.bump=1;runTalk(E.block)}return false}
/* step back from a closed way */
function pushBack(n=12){const Z=ZONES[WD.zone];WD.x=clamp(WD.x-WD.dir*n,6,Z.len-6);G.x=WD.x;WD.trail.push(WD.x)}
/* ---------- people in a scene ---------- */
function actorAdd(o){const a=Object.assign({x:WD.x,flip:false,pose:'idle',walkT:0},o);WD.actors=WD.actors.filter(b=>b.id!==a.id);WD.actors.push(a);return a}
function actorDel(...ids){WD.actors=WD.actors.filter(a=>!ids.includes(a.id))}
const actor=id=>WD.actors.find(a=>a.id===id);
function actorTo(id,x,sp=60){const a=actor(id);if(!a)return Promise.resolve();return new Promise(r=>{a.tx=x;a.sp=sp;a.done=r;if(a.prop){}else if(!a.foe)a.flip=x<a.x;else a.flip=x>a.x})}
/* an npc standing in the place steps out to move about in a scene */
function npcOut(id){const Z=ZONES[WD.zone],ev=Z.ev.find(e=>e.id===id);if(!ev)return null;WD.hidden.add(id);return actorAdd({id,who:ev.look||id,x:ev.x,flip:WD.x<ev.x})}
function heroTo(x,sp=WALK_SPD){return new Promise(r=>{if(Math.abs(x-WD.x)<1){r();return}WD.auto={x,sp,done:r};WD.dir=x<WD.x?-1:1})}
const face=d=>{WD.dir=d};
/* ---------- the scene ---------- */
const WORLD_SCENE={
 enter(){const Z=ZONES[WD.zone];if(Z)SND.play(Z.music||'field');WD.busy=false},
 update(dt){const Z=ZONES[WD.zone];if(!Z)return;G.time+=dt;WD.qT=(WD.qT||0)+dt;if(WD.qT>1.5){WD.qT=0;if(!WD.busy&&!MODAL.length)checkQuests()}if(WD.banT>0)WD.banT-=dt;
   if(WD.shake>0)WD.shake=Math.max(0,WD.shake-dt);
   for(const a of WD.actors){if(a.tx==null)continue;const d=a.tx-a.x,st=a.sp*dt;a.walkT+=dt;if(Math.abs(d)<=st){a.x=a.tx;a.tx=null;const r=a.done;a.done=null;if(r)r()}else a.x+=Math.sign(d)*st}
   if(WD.auto){const A=WD.auto,d=A.x-WD.x,st=A.sp*dt;WD.moving=true;WD.walkT+=dt;if(Math.abs(d)<=st){WD.x=A.x;WD.auto=null;WD.moving=false;A.done()}else{WD.x+=Math.sign(d)*st;WD.dir=Math.sign(d)}G.x=WD.x;WD.trail.push(WD.x);if(WD.trail.length>200)WD.trail.shift();camTo(false);return}
   const free=!WD.busy&&!MODAL.length;let d=0;if(free){if(held.has('left'))d-=1;if(held.has('right'))d+=1}
   WD.moving=d!==0;if(d){WD.dir=d;const sp=(held.has('b')?RUN_SPD:WALK_SPD)*dt;let nx=WD.x+d*sp;
     if(nx>Z.len-6){if(edge(Z.right,1))return;nx=Z.len-6}
     if(nx<6){if(edge(Z.left,-1))return;nx=6}
     const moved=Math.abs(nx-WD.x);WD.x=nx;G.x=nx;WD.walkT+=dt*(held.has('b')?1.6:1);WD.stepAcc+=moved;if(WD.stepAcc>15){WD.stepAcc=0;SND.fx('step')}
     WD.trail.push(WD.x);if(WD.trail.length>200)WD.trail.shift();
     for(const ev of Z.ev){if(ev.k!=='scene')continue;const dd=Math.abs(WD.x-ev.x);if(dd>18)WD.arm[ev.id]=true;else if(dd<10&&WD.arm[ev.id]!==false&&shown(ev)){WD.arm[ev.id]=false;runScene(ev);return}}
     if(Z.enc&&!WD.busy){WD.enc-=moved;if(WD.enc<=0){WD.enc=280+rnd()*300;encounter(Z);return}}}
   if(WD.bump>0&&!(d>0&&WD.x>=Z.len-7)&&!(d<0&&WD.x<=7))WD.bump=0;
   WD.near=null;let best=18;for(const ev of Z.ev){if(!['npc','spot','house','chest','fire'].includes(ev.k)||!shown(ev))continue;if(ev.k==='chest'&&G.opened[ev.id])continue;const dd=Math.abs(ev.x-WD.x)-(ev.k==='house'?6:0);if(dd<best){best=dd;WD.near=ev}}
   camTo(false)},
 draw(){const Z=ZONES[WD.zone];if(!Z)return;const g=ctx,cam=Math.round(WD.cam),nv=Z.night?Z.night():false,nt=!!nv;
   const sh=WD.shake>0?Math.round((rnd()-.5)*WD.shake*14):0;g.save();g.translate(sh,0);
   drawBackdrop(g,Z.theme,cam,false,TIME,false,nv);
   /* what stands on the ground */
   for(const ev of Z.ev){if(!shown(ev))continue;const sx=Math.round(ev.x-cam);if(sx<-90||sx>W+90)continue;
     if(ev.k==='house')drawHouse(g,sx,{roof:ev.roof,wall:ev.wall,sign:ev.sign,lit:ev.lit?ev.lit():false,w:ev.w,h:ev.h});
     else if(ev.k==='prop'||(ev.k==='spot'&&ev.art))drawProp(g,evArt(ev),sx,TIME,ev.flip);
     else if(ev.k==='fire')drawFire(g,sx,TIME);
     else if(ev.k==='chest')g.drawImage(G.opened[ev.id]?FSPR.chestOpen:FSPR.chest,sx-8,FEET-14)}
   /* people who live here */
   for(const ev of Z.ev){if(ev.k!=='npc'||!shown(ev))continue;const sx=ev.x-cam;if(sx<-60||sx>W+60)continue;
     const f=ev.face!=null?ev.face<0:WD.x<ev.x;drawPerson(g,ev.look||ev.id,Math.floor(TIME*1.5+ev.x)%4===0?'breathe':(ev.pose||'idle'),sx,f)}
   /* people and creatures in a scene */
   for(const a of WD.actors){const sx=a.x-cam;if(sx<-80||sx>W+80)continue;
     if(a.prop){drawProp(g,a.prop,sx,TIME,a.flip);continue}
     if(a.foe){const F=FOE[a.foe],s=foeSprite(F),fly=F.fly?-24+Math.round(Math.sin(TIME*2+a.x)*2):0;shadow(g,sx,12);g.save();g.translate(Math.round(sx),0);if(a.flip)g.scale(-1,1);g.drawImage(s.cv,-s.fx,FEET-s.fy+fly);g.restore();continue}
     const mv=a.tx!=null,pose=mv?'walk'+(Math.floor(a.walkT*8)%4):a.pose||'idle';
     if(a.look){shadow(g,sx);drawHeroAt(g,a.look,a.weapon||null,pose,sx,FEET,!!a.flip)}else drawPerson(g,a.who,pose,sx,!!a.flip,a.lying)}
   /* the party, last one first */
   const P=G.party,n=WD.hideParty?0:P.length,walking=WD.moving;
   for(let i=n-1;i>=0;i--){const m=P[i];let x=WD.x,dir=WD.dir,mv=walking;
     if(i>0){const idx=WD.trail.length-1-i*16;x=idx>=0?WD.trail[idx]:WD.x-WD.dir*i*16;const nx=idx+1<WD.trail.length&&idx>=0?WD.trail[idx+1]:x;if(nx!==x)dir=nx>x?1:-1;else dir=WD.dir}
     const sx=x-cam;if(sx<-40||sx>W+40)continue;shadow(g,sx);
     const w=m.id==='hero'&&!G.flags.knife?null:m.weapon;
     const pose=mv?'walk'+(Math.floor(WD.walkT*8+i*2)%4):i===0&&WD.pose?WD.pose:(m.hp<=0?'hurt':'idle');drawHeroAt(g,m.look,w,pose,sx,FEET,dir<0)}
   /* night: everything darker, then the lights */
   if(nt){g.fillStyle=Z.tint?Z.tint():'rgba(8,10,36,.5)';g.fillRect(-8,0,W+16,H);g.globalCompositeOperation='lighter';
     const glow=(x,y,r,c)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)};
     for(const ev of Z.ev){if(!shown(ev))continue;const sx=ev.x-cam;if(sx<-90||sx>W+90)continue;
       if(ev.k==='fire')glow(sx,FEET-8,54+Math.sin(TIME*9)*2,'rgba(255,140,50,.42)');
       else if(ev.glow)glow(sx,FEET-14,48+Math.sin(TIME*7)*2,ev.glow==='#ff9a4a'?'rgba(255,140,60,.4)':'rgba(255,220,140,.32)');
       else if(ev.k==='house'&&ev.lit&&ev.lit()){glow(sx-18,GROUND_Y-30,18,'rgba(255,200,110,.35)');glow(sx+18,GROUND_Y-30,18,'rgba(255,200,110,.35)')}}
     if(Z.theme==='tollhouse'||Z.theme==='city'){}else glow(WD.x-cam,FEET-24,30,'rgba(120,130,180,.12)');
     g.globalCompositeOperation='source-over'}
   if(WD.lights){g.globalCompositeOperation='lighter';for(const L of WD.lights){const x=L.x-cam,y=L.y,gr=g.createRadialGradient(x,y,0,x,y,L.r);gr.addColorStop(0,L.c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-L.r,y-L.r,L.r*2,L.r*2)}g.globalCompositeOperation='source-over'}
   for(const f of WD.fx.slice())f(g,cam);
   g.restore();
   /* what you could do here */
   if(WD.near&&!WD.busy&&!MODAL.length){const ev=WD.near,sx=Math.round(ev.x-cam),y=FEET-(ev.k==='house'?82:ev.k==='npc'?62:ev.art==='idoor'||ev.art==='gate'?66:ev.art==='hearth'?50:36)+(Math.floor(TIME*3)%2);
     g.fillStyle='#160f24';g.fillRect(sx-5,y-1,11,10);g.fillStyle='#c8283c';g.fillRect(sx-4,y,9,8);g.fillStyle='#ffffff';g.font='bold 7px monospace';g.textAlign='center';g.fillText('A',sx+.5,y+7);g.textAlign='left';
     if(ev.label){g.font='7px "Pixelify Sans",monospace';const tw=g.measureText(ev.label).width+6;g.fillStyle='rgba(14,10,30,.75)';g.fillRect(Math.round(sx-tw/2),y-11,Math.round(tw),9);g.fillStyle='#ffe9a8';g.textAlign='center';g.fillText(ev.label,sx,y-4);g.textAlign='left'}}
   if(WD.banT>0&&WD.ban){const a=Math.min(1,WD.banT*2,(2.4-WD.banT)*4);g.globalAlpha=a;const t=WD.ban;g.font='9px "Pixelify Sans",monospace';const tw=g.measureText(t).width+20;
     g.fillStyle='rgba(14,22,84,.9)';g.fillRect(Math.round(W/2-tw/2),8,Math.round(tw),15);g.fillStyle='#e8eeff';g.fillRect(Math.round(W/2-tw/2),8,Math.round(tw),1);g.fillRect(Math.round(W/2-tw/2),22,Math.round(tw),1);
     g.fillStyle='#ffd86a';g.textAlign='center';g.fillText(t,W/2,19);g.textAlign='left';g.globalAlpha=1}},
 input(b){if(WD.busy)return;if(b==='a'||b==='up'){if(WD.near)interact(WD.near)}else if(b==='start'){SND.fx('ok');mainMenu()}},
};
/* ---------- things you can touch ---------- */
async function interact(ev){WD.busy=true;WD.moving=false;try{
  if(ev.k==='npc'||ev.k==='spot'||ev.k==='fire'||ev.k==='house'&&ev.talk){if(ev.k==='npc'&&Math.abs(ev.x-WD.x)>2)WD.dir=ev.x<WD.x?-1:1;await runStoryFn(ev.talk,ev)}
  else if(ev.k==='house'){SND.fx('door');await openPlace(ev.to,WD.zone)}
  else if(ev.k==='chest'){await openChest(ev)}
 }catch(e){if(e!==ABORT)console.error(e)}finally{if(S_SCENE===WORLD_SCENE)WD.busy=false}}
async function runStoryFn(id,ev){const f=STORY[id];if(f)await f(ev);else await say('','...')}
async function runTalk(id){WD.busy=true;WD.moving=false;try{await runStoryFn(id)}catch(e){if(e!==ABORT)console.error(e)}finally{if(S_SCENE===WORLD_SCENE)WD.busy=false}}
async function openChest(ev){SND.fx('chest');G.opened[ev.id]=1;let txt;
  if(ev.item){addItem(ev.item,ev.n||1);txt=`${ITEMS[ev.item].n}${ev.n>1?' ×'+ev.n:''}`}
  else if(ev.charm){addCharm(ev.charm);txt=CHARMS[ev.charm].n+' (a charm)'}
  else if(ev.cos){G.owned[ev.cos[0]+':'+ev.cos[1]]=1;txt=`${ev.cos[1]}, new for the wardrobe!`}
  else if(ev.gold){G.gold+=ev.gold;txt=`${ev.gold} gold`}
  await say('',`Found ${txt}`)}
function encounter(Z){let tot=0;for(const f of Z.enc)tot+=f[1];let r=rnd()*tot,form=Z.enc[0][0];for(const f of Z.enc){r-=f[1];if(r<=0){form=f[0];break}}
  startFight(form,{theme:Z.bt||Z.theme,night:!!(Z.night&&Z.night())}).catch(e=>{if(e!==ABORT)console.error(e)})}
/* a fight; if the party falls and you choose to load or quit, whatever was running stops */
async function startFight(form,o){const was=WD.busy;WD.busy=true;const Z=ZONES[WD.zone];o=Object.assign({theme:Z.bt||Z.theme,night:!!(Z.night&&Z.night())},o);
  const r=await battle(form,o);if(r==='load'||r==='title'){await afterFight(r);throw ABORT}WD.busy=was;return r}
async function afterFight(r){if(r==='load'){await loadGame();return}if(r==='title'){toTitle();return}}
async function runScene(ev){WD.busy=true;WD.moving=false;try{await runStoryFn(ev.run)}catch(e){if(e===ABORT)return;throw e}finally{if(S_SCENE===WORLD_SCENE)WD.busy=false}if(!ZONES[WD.zone].noSave)autosave()}
/* a member joins */
function join(id,lv){if(owned(id))return;const C=CHARS[id],L=lv||avgLv();
  const m=makeMember(id,L,C.look,C.weapon,C.n);m.weapon.tier=hero().weapon.tier||0;(G.party.length<3?G.party:G.roster).push(m);G.flags[id]=1;SND.fx('level')}
