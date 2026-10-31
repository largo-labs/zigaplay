/* ================= the title, making your hero, the prologue and the ending; saves; the console ================= */
let HAS_SAVE=null;
const ABORT={abort:1};
function autosave(){if(!G||!WD.zone)return;G.x=WD.x;G.zone=WD.zone;G.dir=WD.dir;writeSave(JSON.parse(JSON.stringify(Object.assign({},G,{zoneName:ZONES[G.zone].n}))));HAS_SAVE=true}
/* fill in anything an older save is missing */
function migrate(d){const g=Object.assign({v:1,party:[],gold:0,inv:{},charms:{},owned:{},flags:{},opened:{},zone:'emberwick',x:96,dir:1,time:0,steps:0,battles:0},d);
  g.party=g.party.map(m=>{const base=makeMember(m.id||'hero',m.lv||1,m.look,m.weapon,m.name);return Object.assign(base,m,{look:Object.assign({},DEFAULT_LOOK,m.look||{}),weapon:Object.assign(base.weapon,m.weapon||{},{parts:Object.assign({},base.weapon.parts,(m.weapon||{}).parts||{})})})});
  const fixM=m=>{const base=makeMember(m.id||'hero',m.lv||1,m.look,m.weapon,m.name);return Object.assign(base,m,{look:Object.assign({},DEFAULT_LOOK,m.look||{}),weapon:Object.assign(base.weapon,m.weapon||{},{parts:Object.assign({},base.weapon.parts,(m.weapon||{}).parts||{})})})};
  g.roster=(g.roster||[]).filter(m=>CHARS[m.id]).map(fixM);g.gems=g.gems|0;g.pity=g.pity|0;while(g.party.length>3)g.roster.push(g.party.pop());
  if(!g.party.length)g.party=[makeMember('hero',1,DEFAULT_LOOK,null,'Ren')];if(!ZONES[g.zone]){g.zone='emberwick';g.x=96}delete g.zoneName;delete g.savedAt;return g}
async function loadGame(data){clearUI();const d=data||await readBest();if(!d){toTitle();return}G=migrate(d);setScene(WORLD_SCENE);enterZone(G.zone,G.x,G.dir);await fadeIn(200)}
function clearUI(){while(MODAL.length)popModal(MODAL[MODAL.length-1]);TEXT_HOOK=null;for(const c of[...UI.children])if(c.id!=='fader')c.remove();WD.busy=false}
function toTitle(){clearUI();BT=null;const f=$('#fader');if(f){f.style.transition='none';f.style.opacity=0}setScene(TITLE_SCENE)}
/* ---------- the title ---------- */
const TITLE_CAST=(()=>{const h=Object.assign({},DEFAULT_LOOK);const w=newWeapon('sword');w.parts.Blade='Flamberge';w.parts.Guard='Wings';w.c1='Platinum';w.engr='SPELLSTEEL';
  return[{look:h,w},{look:CHARS.mira.look,w:Object.assign(newWeapon('grimoire'),CHARS.mira.weapon,{parts:Object.assign(newWeapon('grimoire').parts,CHARS.mira.weapon.parts)})},
    {look:CHARS.bram.look,w:Object.assign(newWeapon('warhammer'),CHARS.bram.weapon,{parts:Object.assign(newWeapon('warhammer').parts,CHARS.bram.weapon.parts)})},{look:CHARS.kit.look,w:Object.assign(newWeapon('bow'),CHARS.kit.weapon,{parts:Object.assign(newWeapon('bow').parts,CHARS.kit.weapon.parts)})}]})();
const TITLE_SCENE={creator:false,
 enter(){SND.play('title');this.creator=false;this.t=0;this.build()},
 build(){clearUI();const logo=el('div','logo','SPELLSTEEL<small>A TALE OF THE GREY</small>');logo.style.top=px(18);UI.appendChild(logo);this.logo=logo;
   const rows=[];if(HAS_SAVE)rows.push({label:'Continue',c:'cont'});rows.push({label:'New Game',c:'new'},{label:'Settings',c:'set'});
   const box=winEl('plain titlemenu',{x:Math.round(W/2-48),y:70,w:96});const lw=new ListWin({el:box,rows,vis:3,quiet:true,pick:async r=>{SND.fx('ok');
       if(r.c==='cont'){popModal(lw);await fadeOut(300);await loadGame();return}
       if(r.c==='new'){if(HAS_SAVE&&!await confirmBox('Start a new journey?<br><span class="small dim">Your saved game will be replaced when you next save.</span>'))return;popModal(lw);this.logo.remove();await newGame();return}
       if(r.c==='set'){await settingsMenu(UI)}}});
   this.lw=lw;pushModal(lw);const hint=el('div','hint','<i class="k a">A</i>choose');UI.appendChild(hint);
   const cr=el('div','tiny dim');cr.style.cssText=`position:absolute;left:${px(5)};bottom:${px(3)}`;cr.textContent='an original game for the ZigaPlay';UI.appendChild(cr)},
 update(dt){this.t+=dt},
 draw(){const g=ctx;drawBackdrop(g,'village',TIME*14,false,TIME);if(this.creator)return;
   TITLE_CAST.forEach((c,i)=>{const x=W/2-36+i*24,pose='walk'+(Math.floor(TIME*7+i)%4);g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,FEET+1,9,2,0,0,7);g.fill();drawHeroAt(g,c.look,c.w,pose,x,FEET,false)})},
};
/* refresh the title once we know whether there's a save */
async function checkSave(){HAS_SAVE=!!(await readBest());if(S_SCENE===TITLE_SCENE&&!TITLE_SCENE.creator&&TITLE_SCENE.lw&&MODAL[MODAL.length-1]===TITLE_SCENE.lw){popModal(TITLE_SCENE.lw);TITLE_SCENE.build()}}
/* ---------- a new journey: make your hero ---------- */
async function newGame(){TITLE_SCENE.creator=true;clearUI();
  newGameState(Object.assign({},DEFAULT_LOOK),newWeapon('sword'),'Ren');const m=G.party[0];
  await say('','Every hero in Spellsteel is yours to make: face, hair, clothes, and a weapon shaped part by part.');
  await say('','Use ◀ ▶ to flip through each row, A to see every choice at once, and SELECT to try a pose. START when you are happy.');
  await wardrobe(m,{heading:'Make your hero',doneLabel:'Next: your weapon',mustFinish:true,title:'You'});
  await say('','Now forge your weapon. Pick from ten kinds, then choose every part and colour, and carve words into the steel.');
  await forgeDesign(m,{heading:'Forge your weapon',mustFinish:true});
  const nm=await letters('What is your name?','Ren',10,{});m.name=nm||'Ren';
  if(!m.weapon.name||m.weapon.name===WTYPES[m.weapon.kind].n){const nn=await letters('Name your weapon',m.weapon.name||WTYPES[m.weapon.kind].n,14,{});if(nn)m.weapon.name=nn}
  const s=statsOf(m);m.hp=s.hp;m.mp=s.mp;
  await fadeOut(500);setScene(PROLOGUE_SCENE);clearUI();await prologue();
  setScene(WORLD_SCENE);enterZone('emberwick',96,1);WD.busy=true;await fadeIn(600);await runStory('intro');autosave();WD.busy=false}
/* ---------- the prologue: words over darkness ---------- */
const PROLOGUE_SCENE={update(){},draw(){const g=ctx;g.fillStyle='#05060e';g.fillRect(0,0,W,H);const cols=['#ff6a2a','#3a8ae8','#e8f4ff','#ffd86a','#a070ff'];
  cols.forEach((c,i)=>{const a=TIME*.4+i*1.2566,x=W/2+Math.cos(a)*34,y=64+Math.sin(a)*12,lit=PROLOGUE_SCENE.lit;g.globalAlpha=lit>i?1:.18;g.fillStyle=c;g.beginPath();g.arc(x,y,3,0,7);g.fill();g.globalAlpha=lit>i?.25:.05;g.beginPath();g.arc(x,y,7,0,7);g.fill();g.globalAlpha=1})},input(){},lit:5};
async function prologue(){setScene(PROLOGUE_SCENE);PROLOGUE_SCENE.lit=5;SND.play('grey');await fadeIn(500);
  const lines=['Five Embers burn at the heart of the world. Each keeps one colour alive.','The red of flame. The blue of the tides. The white of frost. The gold of the sky. The violet of dusk.',
    'A month ago, one by one, the Embers went dark. Where their light failed, the Grey came.','It drains the colour from things. Then the warmth. Then the will to do anything at all.',
    'In the smithing village of Emberwick, an apprentice has just finished a first weapon of spellsteel: the metal that takes whatever shape its bearer wills.'];
  for(let i=0;i<lines.length;i++){if(i===2)PROLOGUE_SCENE.lit=0;const e=el('div','prol fade',esc(lines[i]));UI.appendChild(e);
    await new Promise(r=>{const m={input(b){if(b==='a'||b==='b'||b==='start'){popModal(m);r()}}};pushModal(m)});e.remove()}
  await fadeOut(500)}
/* ---------- the ending ---------- */
const ENDING_SCENE={t:0,update(dt){this.t+=dt},draw(){const g=ctx;drawBackdrop(g,'village',this.t*10,false,TIME);
  G.party.forEach((m,i)=>{const x=W/2+30-i*20;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,FEET+1,9,2,0,0,7);g.fill();drawHeroAt(g,m.look,m.weapon,'walk'+(Math.floor(this.t*6+i)%4),x,FEET,false)})},input(){}};
async function playEnding(){await fadeOut(900);clearUI();ENDING_SCENE.t=0;setScene(ENDING_SCENE);SND.play('ending');await fadeIn(900);
  const roll=[['The Embers burn again.',''],['Colour runs back into the world like water into a dry river.',''],[`${HN()} and friends walk home to Emberwick.`,''],
    ['SPELLSTEEL','a tale of the Grey'],['Starring',G.party.map(m=>m.name).join(' · ')],['Weapons',G.party.map(m=>m.weapon.name).join(' · ')],['Story, art, music and code','made with Claude, for the ZigaPlay'],['Thank you for playing!','The world is yours to keep exploring.']];
  for(const[a,b]of roll){const e=el('div','credit fade',`<div class="big gold">${esc(a)}</div>${b?`<div>${esc(b)}</div>`:''}`);UI.appendChild(e);
    await new Promise(r=>{let done=false;const m={input(x){if(x==='a'&&!done){done=true;popModal(m);r()}}};pushModal(m);setTimeout(()=>{if(!done){done=true;popModal(m);r()}},5200)});e.remove()}
  await fadeOut(700);clearUI();healAll();setScene(WORLD_SCENE);enterZone('emberwick',190,1);autosave();WD.busy=true;await fadeIn(700);
  await talk([['Hessa',`You're home, ${HN()}. And you brought the colour back with you.`],['Hessa','The forge is yours whenever you want it. Every Ember is lit, so any element is yours to infuse.'],'You can keep exploring, fight on, and shape your gear however you like.']);WD.busy=false}
/* ---------- the console ---------- */
window.ZPCart={input(b,d){press(b,d)},
  home(){if(G&&S_SCENE===WORLD_SCENE&&!WD.busy&&!MODAL.length){autosave();flushCloud();return true}if(S_SCENE===TITLE_SCENE&&!TITLE_SCENE.creator)return true;return'ask'},
  snapshot(){return G&&S_SCENE!==TITLE_SCENE&&WD.zone?JSON.stringify(Object.assign({},G,{x:WD.x,zone:WD.zone,dir:WD.dir})):null}};
document.addEventListener('visibilitychange',()=>{SND.pause(document.hidden);if(document.hidden&&G&&S_SCENE===WORLD_SCENE&&!WD.busy)autosave()});
/* a hook for automated tests only (the address must end in #sstest) */
if(/sstest/.test(location.hash))window.__SS={get G(){return G},set G(v){G=v},WD,get BT(){return BT},MODAL,scene:()=>S_SCENE,press,battle,enterZone,setScene,WORLD_SCENE,TITLE_SCENE,join,ZONES,FOE,startFight,loadGame,newGameState,autosave,healAll,giveXP,makeMember,mainMenu,openPlace,wardrobe,forgeDesign,statsOf,SET,interact,migrate,newWeapon,WKINDS,playEnding,runStory,drawBackdrop,drawHeroAt,foeSprite,CHARS,charWeapon,dyeOf};
/* ---------- start ---------- */
(async()=>{SND.music=SET.music;SND.on=SET.sound;layout();requestAnimationFrame(t=>{last=t;requestAnimationFrame(frame)});
  let snap=null;try{snap=ZP&&ZP.takeRestore?ZP.takeRestore('spellsteel'):null}catch(e){}
  if(snap){try{const d=typeof snap==='string'?JSON.parse(snap):snap;if(d&&d.party){G=migrate(d);setScene(WORLD_SCENE);enterZone(G.zone,G.x,G.dir);readBest().then(b=>{HAS_SAVE=!!b});return}}catch(e){}}
  HAS_SAVE=!!readLocal();setScene(TITLE_SCENE);checkSave()})();
