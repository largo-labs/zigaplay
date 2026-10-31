/* ================= the field: walking side to side through each region ================= */
const FEET=161,WALK_SPD=62,RUN_SPD=112;
const WD={actors:[],zone:null,x:0,dir:1,moving:false,cam:0,trail:[],busy:false,enc:400,near:null,ban:null,banT:0,restore:1,walkT:0,stepAcc:0,bump:0};
const isGrey=Z=>!!(Z&&Z.grey&&!G.flags[Z.grey]);
/* little sprites of the field */
const FSPR={};
{const chest=open=>{const b=new Buf(16,14);b.rect(1,5,14,8,'#8a5a32');b.rect(1,5,14,1,'#a8763e');b.rect(1,9,14,1,'#c8a04a');b.rect(7,7,2,4,'#f2c84a');
   if(open){b.rect(1,1,14,4,'#5a3a20');b.rect(2,2,12,3,'#2a1a10');b.px(5,3,'#ffe88a');b.px(9,2,'#ffe88a')}else{b.rect(1,2,14,4,'#a06a3a');b.rect(1,2,14,1,'#c8884a');b.rect(7,4,2,3,'#f2c84a')}b.outline(INK);return b.canvas(1)};
 FSPR.chest=chest(0);FSPR.chestOpen=chest(1);
 const cry=c=>{const b=new Buf(14,22);b.poly([[7,0],[13,8],[7,21],[1,8]],c);b.poly([[7,0],[13,8],[7,8]],lt(c));b.poly([[7,8],[7,21],[1,8]],dk(c));b.line(4,5,6,2,'#ffffff');b.outline(INK);return b.canvas(1)};
 FSPR.crystal=cry('#5ab8ff');
 const sign=()=>{const b=new Buf(18,20);b.rect(8,8,2,12,'#6a4428');b.rect(1,1,16,9,'#a8763e');b.rect(1,1,16,1,'#c8945a');for(let i=0;i<3;i++)b.rect(3,3+i*2,12-i*3,1,'#6a4428');b.outline(INK);return b.canvas(1)};
 FSPR.sign=sign()}
const _npcC=new Map();
function npcSprite(L,pose,flip){const k=JSON.stringify(L)+pose+flip;let c=_npcC.get(k);if(!c){c=drawDoll(L,POSES[pose]||pose,null).canvas(1,flip);_npcC.set(k,c)}return c}
/* ---------- moving between places ---------- */
function enterZone(id,x,dir){const Z=ZONES[id];WD.actors=[];WD.zone=id;G.zone=id;WD.x=x;G.x=x;WD.dir=dir||1;G.dir=WD.dir;WD.trail=[];for(let i=120;i>0;i--)WD.trail.push(x-WD.dir*i);
  WD.enc=320+rnd()*260;WD.restore=1;WD.bump=0;WD.ban=Z.n;WD.banT=2.4;SND.play(Z.music||'field');camTo(true)}
function camTo(snap){const Z=ZONES[WD.zone],t=Z.len<=W?(Z.len-W)/2:clamp(WD.x-W/2+WD.dir*20,0,Z.len-W);WD.cam=snap?t:lerp(WD.cam,t,.12);if(Math.abs(WD.cam-t)<.3)WD.cam=t}
async function goZone(id,x,dir){WD.busy=true;await fadeOut(220);enterZone(id,x,dir);autosave();await fadeIn(240);WD.busy=false}
const LOCK_MSG={flame:'Thorns as thick as arms choke the path. Something in this den is growing them.',bram:'The harbor guard steps in front of you. "Nobody goes into the grotto alone. Find someone who knows those caves."',
 tide:'Seawater pours down the stair. The hall will not open while the Tidecaller holds it.',frost:'A wall of glass-hard ice seals the way on.',storm:'The storm itself shoves you back from the crown of the Spire.',shadow:'A grey nothing fills the doorway.'};
/* ---------- the scene ---------- */
const WORLD_SCENE={
 enter(){const Z=ZONES[WD.zone];if(Z)SND.play(Z.music||'field');WD.busy=false},
 update(dt){const Z=ZONES[WD.zone];if(!Z)return;G.time+=dt;WD.qT=(WD.qT||0)+dt;if(WD.qT>1.5){WD.qT=0;if(!WD.busy&&!MODAL.length)checkQuests()}if(WD.banT>0)WD.banT-=dt;if(WD.restore<1)WD.restore=Math.min(1,WD.restore+dt*.4);
   const free=!WD.busy&&!MODAL.length;let d=0;if(free){if(held.has('left'))d-=1;if(held.has('right'))d+=1}
   WD.moving=d!==0;if(d){WD.dir=d;const sp=(held.has('b')?RUN_SPD:WALK_SPD)*dt;let nx=WD.x+d*sp;
     if(nx>Z.len-6){if(Z.right&&!(Z.lock&&Z.lock.right&&!G.flags[Z.lock.right])){goZone(Z.right,14,1);return}nx=Z.len-6;
       if(Z.lock&&Z.lock.right&&!G.flags[Z.lock.right]&&WD.bump<=0){WD.bump=1;WD.busy=true;say('',LOCK_MSG[Z.lock.right]||'The way is shut.').then(()=>{WD.busy=false;WD.x-=8})}}
     if(nx<6){if(Z.left){goZone(Z.left,ZONES[Z.left].len-14,-1);return}nx=6}
     const moved=Math.abs(nx-WD.x);WD.x=nx;G.x=nx;WD.walkT+=dt*(held.has('b')?1.6:1);WD.stepAcc+=moved;if(WD.stepAcc>15){WD.stepAcc=0;SND.fx('step')}
     WD.trail.push(WD.x);if(WD.trail.length>200)WD.trail.shift();
     if(Z.enc&&!Z.town){WD.enc-=moved;if(WD.enc<=0){WD.enc=280+rnd()*300;encounter(Z);return}}
     for(const ev of Z.ev){if(ev.k==='scene'&&!G.flags[ev.once||ev.id]&&Math.abs(WD.x-ev.x)<10){runScene(ev);return}
       if(ev.k==='boss'&&!G.flags[ev.flag]&&WD.x>ev.x-46&&WD.x<ev.x){bossEvent(ev);return}}}
   if(WD.bump>0&&d<=0)WD.bump=0;
   WD.near=null;let best=18;for(const ev of Z.ev){if(!['door','npc','sign','chest','save'].includes(ev.k))continue;if(ev.hideFlag&&G.flags[ev.hideFlag])continue;if(ev.k==='chest'&&G.opened[ev.id])continue;const dd=Math.abs(ev.x-WD.x);if(dd<best){best=dd;WD.near=ev}}
   camTo(false)},
 draw(){const Z=ZONES[WD.zone];if(!Z)return;const g=ctx,cam=Math.round(WD.cam),grey=isGrey(Z);
   if(WD.restore<1){drawBackdrop(g,Z.theme,cam,true,TIME);g.globalAlpha=WD.restore;drawBackdrop(g,Z.theme,cam,false,TIME);g.globalAlpha=1}else drawBackdrop(g,Z.theme,cam,grey,TIME);
   for(const ev of Z.ev){const sx=ev.x-cam;if(sx<-60||sx>W+60)continue;
     if(ev.k==='door')drawBuilding(g,Math.round(sx),ev.to,Z.theme,ev.label);
     else if(ev.k==='sign')g.drawImage(FSPR.sign,Math.round(sx-9),FEET-20);
     else if(ev.k==='chest')g.drawImage(G.opened[ev.id]?FSPR.chestOpen:FSPR.chest,Math.round(sx-8),FEET-14);
     else if(ev.k==='save'){const bob=Math.round(Math.sin(TIME*2.5)*2);g.fillStyle='rgba(90,184,255,.25)';g.beginPath();g.ellipse(sx,FEET,12,3,0,0,7);g.fill();g.drawImage(FSPR.crystal,Math.round(sx-7),FEET-34+bob);
       if(Math.floor(TIME*3)%3===0){g.fillStyle='#ffffff';g.fillRect(Math.round(sx-4+((TIME*7)%8)),FEET-30+bob,1,1)}}}
   /* people and the boss */
   for(const ev of Z.ev){const sx=ev.x-cam;if(sx<-60||sx>W+60)continue;
     if(ev.k==='npc'&&!(ev.hideFlag&&G.flags[ev.hideFlag])){const L=NPC_LOOK(ev);const face=WD.x<ev.x;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(sx,FEET+1,9,2,0,0,7);g.fill();
       g.drawImage(npcSprite(L,Math.floor(TIME*1.5+ev.x)%4===0?'breathe':'idle',face),Math.round(sx-(face?DOLL_W-DOLL_FX:DOLL_FX)),FEET-DOLL_FY)}
     if(ev.k==='boss'&&!G.flags[ev.flag]){const F=FOE[ev.foes[0]],s=foeSprite(F),bob=F.fly?Math.round(Math.sin(TIME*2)*3)-24:0;g.save();g.translate(Math.round(sx),0);g.scale(-1,1);g.drawImage(s.cv,-s.fx,FEET-s.fy+bob);g.restore()}}
   /* people and creatures in a scene */
   for(const a of WD.actors){const sx=a.x-cam;if(sx<-60||sx>W+60)continue;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(sx,FEET+1,9,2,0,0,7);g.fill();
     if(a.foe){const s=foeSprite(FOE[a.foe]);g.save();g.translate(Math.round(sx),0);if(a.flip)g.scale(-1,1);g.drawImage(s.cv,-s.fx,FEET-s.fy+(FOE[a.foe].fly?-24:0));g.restore()}
     else drawHeroAt(g,a.look,a.weapon||null,a.pose||'idle',sx,FEET,!!a.flip)}
   /* the party, last one first */
   const P=G.party,n=P.length,walking=WD.moving;
   for(let i=n-1;i>=0;i--){const m=P[i];let x=WD.x,dir=WD.dir,mv=walking;
     if(i>0){const idx=WD.trail.length-1-i*16;x=idx>=0?WD.trail[idx]:WD.x-WD.dir*i*16;const nx=idx+1<WD.trail.length&&idx>=0?WD.trail[idx+1]:x;if(nx!==x)dir=nx>x?1:-1;else dir=WD.dir}
     const sx=x-cam;if(sx<-40||sx>W+40)continue;g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(sx,FEET+1,9,2,0,0,7);g.fill();
     const pose=mv?'walk'+(Math.floor(WD.walkT*8+i*2)%4):(m.hp<=0?'hurt':'idle');drawHeroAt(g,m.look,m.weapon,pose,sx,FEET,dir<0)}
   /* what you could do here */
   if(WD.near&&!WD.busy&&!MODAL.length){const ev=WD.near,sx=Math.round(ev.x-cam),y=FEET-(ev.k==='door'?78:ev.k==='npc'?62:ev.k==='save'?46:32)+(Math.floor(TIME*3)%2);
     g.fillStyle='#160f24';g.fillRect(sx-5,y-1,11,10);g.fillStyle='#c8283c';g.fillRect(sx-4,y,9,8);g.fillStyle='#ffffff';g.font='bold 7px monospace';g.textAlign='center';g.fillText('A',sx+.5,y+7);g.textAlign='left'}
   if(WD.banT>0){const a=Math.min(1,WD.banT*2,(2.4-WD.banT)*4);g.globalAlpha=a;const t=WD.ban;g.font='9px "Pixelify Sans",monospace';const tw=g.measureText(t).width+20;
     g.fillStyle='rgba(14,22,84,.9)';g.fillRect(Math.round(W/2-tw/2),8,Math.round(tw),15);g.fillStyle='#e8eeff';g.fillRect(Math.round(W/2-tw/2),8,Math.round(tw),1);g.fillRect(Math.round(W/2-tw/2),22,Math.round(tw),1);
     g.fillStyle='#ffd86a';g.textAlign='center';g.fillText(t,W/2,19);g.textAlign='left';g.globalAlpha=1}},
 input(b){if(WD.busy)return;if(b==='a'||b==='up'){if(WD.near)interact(WD.near)}else if(b==='start'){SND.fx('ok');mainMenu()}},
};
/* ---------- things you can touch ---------- */
async function interact(ev){WD.busy=true;try{
  if(ev.k==='door'){SND.fx('door');await openPlace(ev.to,WD.zone)}
  else if(ev.k==='npc'){await talkTo(ev)}
  else if(ev.k==='sign'){await say('',ev.text)}
  else if(ev.k==='chest'){await openChest(ev)}
  else if(ev.k==='save'){SND.fx('save');healAll();await say('','The crystal hums. Your party is fully restored.');if(await ask('','Save your journey?',['Save','Not now'])===0){autosave(true);await say('','Your journey is saved.')}}
 }finally{WD.busy=false}}
async function openChest(ev){SND.fx('chest');G.opened[ev.id]=1;let txt;
  if(ev.item){addItem(ev.item,ev.n||1);txt=`${ITEMS[ev.item].n}${ev.n>1?' ×'+ev.n:''}`}
  else if(ev.charm){addCharm(ev.charm);txt=CHARMS[ev.charm].n+' (a charm)'}
  else if(ev.cos){G.owned[ev.cos[0]+':'+ev.cos[1]]=1;txt=`${ev.cos[1]} — new for the wardrobe!`}
  await say('',`Found ${txt}`)}
function encounter(Z){let tot=0;for(const f of Z.enc)tot+=f[1];let r=rnd()*tot,form=Z.enc[0][0];for(const f of Z.enc){r-=f[1];if(r<=0){form=f[0];break}}
  startFight(form,{theme:Z.theme,grey:isGrey(Z)}).catch(e=>{if(e!==ABORT)console.error(e)})}
/* a fight; if the party falls and you choose to load or quit, whatever was running stops */
async function startFight(form,o){const was=WD.busy;WD.busy=true;const r=await battle(form,o);if(r==='load'||r==='title'){await afterFight(r);throw ABORT}WD.busy=was;return r}
async function afterFight(r){if(r==='load'){await loadGame();return}if(r==='title'){toTitle();return}}
async function bossEvent(ev){WD.busy=true;WD.moving=false;const Z=ZONES[WD.zone];
  if(ev.pre)await runStory(ev.pre);
  const r=await battle(ev.foes,{boss:true,final:FOE[ev.foes[0]].final,theme:Z.theme,grey:isGrey(Z)});
  if(r!=='win'){await afterFight(r);WD.busy=false;return}
  G.flags[ev.flag]=1;if(EMBERS[ev.flag]){G.flags['ember_'+ev.flag]=1}
  if(ev.post)await runStory(ev.post);
  if(Z.grey===ev.flag){WD.restore=0;SND.fx('holy')}
  autosave();WD.busy=false}
async function runScene(ev){WD.busy=true;WD.moving=false;G.flags[ev.once||ev.id]=1;try{await runStory(ev.id)}catch(e){if(e===ABORT)return;throw e}autosave();WD.busy=false}
/* a member joins */
function join(id,lv){if(owned(id))return;const C=CHARS[id],L=lv||avgLv();
  const m=makeMember(id,L,C.look,C.weapon,C.n);m.weapon.tier=hero().weapon.tier||0;(G.party.length<3?G.party:G.roster).push(m);G.flags[id]=1;SND.fx('level')}
