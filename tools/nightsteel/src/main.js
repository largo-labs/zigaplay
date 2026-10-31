/* ================= the title, making your hero, the prologue and the ending; saves; the console ================= */
let HAS_SAVE=null;
const ABORT={abort:1};
function autosave(){if(!G||!WD.zone||ZONES[WD.zone].noSave)return;G.x=WD.x;G.zone=WD.zone;G.dir=WD.dir;writeSave(JSON.parse(JSON.stringify(Object.assign({},G,{zoneName:ZONES[G.zone].n}))));HAS_SAVE=true}
/* fill in anything an older save is missing */
function migrate(d){const g=Object.assign({v:1,party:[],gold:0,inv:{},charms:{},owned:{},flags:{},opened:{},zone:'larkfield',x:86,dir:1,time:0,steps:0,battles:0},d);
  const fixM=m=>{const base=makeMember(m.id||'hero',m.lv||1,m.look,m.weapon,m.name);return Object.assign(base,m,{look:Object.assign({},DEFAULT_LOOK,m.look||{}),weapon:Object.assign(base.weapon,m.weapon||{},{parts:Object.assign({},base.weapon.parts,(m.weapon||{}).parts||{})})})};
  g.party=g.party.filter(m=>CHARS[m.id||'hero']).map(fixM);g.roster=(g.roster||[]).filter(m=>CHARS[m.id]).map(fixM);g.gems=g.gems|0;g.pity=g.pity|0;while(g.party.length>3)g.roster.push(g.party.pop());
  if(!g.party.length)g.party=[makeMember('hero',1,LARK_LOOK,theKnife(),'Lift')];
  if(!ZONES[g.zone]||g.zone==='city'){g.zone=g.flags.c1?'camp':g.flags.reborn?'lhome':'larkfield';g.x=g.zone==='lhome'?60:140}delete g.zoneName;delete g.savedAt;return g}
async function loadGame(data){clearUI();const d=data||await readBest();if(!d){toTitle();return}G=migrate(d);setScene(WORLD_SCENE);enterZone(G.zone,G.x,G.dir);await fadeIn(200)}
function clearUI(){while(MODAL.length)popModal(MODAL[MODAL.length-1]);TEXT_HOOK=null;for(const c of[...UI.children])if(c.id!=='fader')c.remove();WD.busy=false}
function toTitle(){clearUI();BT=null;const f=$('#fader');if(f){f.style.transition='none';f.style.opacity=0}setScene(TITLE_SCENE)}
/* ---------- the title: Larkfield at night, and the three of them walking ---------- */
const TITLE_CAST=(()=>{const k=theKnife();k.parts.Blade='Leaf';k.parts.Guard='Crescent';k.c1='Platinum';k.c2='Charcoal';
  return[{look:Object.assign({},LARK_LOOK,{hat:'Hood',hatC1:'Charcoal',hatC2:'Black',top:'Leather Jacket',topC1:'Charcoal',topC2:'Crimson',back:'Short Cape',backC1:'Charcoal',backC2:'Crimson'}),w:k},
    {look:CHARS.jun.look,w:charWeapon('jun')},{look:CHARS.moss.look,w:charWeapon('moss')}]})();
const TITLE_SCENE={creator:false,
 enter(){SND.play('title');this.creator=false;this.t=0;this.build()},
 build(){clearUI();const logo=el('div','logo night','STRIKE AT NIGHT<small>A SPELLSTEEL STORY</small>');logo.style.top=px(16);UI.appendChild(logo);this.logo=logo;
   const rows=[];if(HAS_SAVE)rows.push({label:'Continue',c:'cont'});rows.push({label:'New Game',c:'new'},{label:'Settings',c:'set'});
   const box=winEl('plain titlemenu',{x:Math.round(W/2-48),y:70,w:96});const lw=new ListWin({el:box,rows,vis:3,quiet:true,pick:async r=>{SND.fx('ok');
       if(r.c==='cont'){popModal(lw);await fadeOut(300);await loadGame();return}
       if(r.c==='new'){if(HAS_SAVE&&!await confirmBox('Start a new game?<br><span class="small dim">Your saved game will be replaced when you next save.</span>'))return;popModal(lw);this.logo.remove();await newGame();return}
       if(r.c==='set'){await settingsMenu(UI)}}});
   this.lw=lw;pushModal(lw);const hint=el('div','hint','<i class="k a">A</i>choose');UI.appendChild(hint);
   const cr=el('div','tiny dim');cr.style.cssText=`position:absolute;left:${px(5)};bottom:${px(3)}`;cr.textContent='an original game for the ZigaPlay';UI.appendChild(cr)},
 update(dt){this.t+=dt},
 draw(){const g=ctx;drawBackdrop(g,'village',TIME*14,false,TIME,false,true);g.fillStyle='rgba(8,10,36,.5)';g.fillRect(0,0,W,H);if(this.creator)return;
   TITLE_CAST.forEach((c,i)=>{const x=W/2-24+i*22,pose='walk'+(Math.floor(TIME*7+i)%4);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,FEET+1,9,2,0,0,7);g.fill();drawHeroAt(g,c.look,c.w,pose,x,FEET,false)})},
};
/* refresh the title once we know whether there's a save */
async function checkSave(){HAS_SAVE=!!(await readBest());if(S_SCENE===TITLE_SCENE&&!TITLE_SCENE.creator&&TITLE_SCENE.lw&&MODAL[MODAL.length-1]===TITLE_SCENE.lw){popModal(TITLE_SCENE.lw);TITLE_SCENE.build()}}
/* ---------- a new game: it starts on a street in 2026 ---------- */
async function newGame(){TITLE_SCENE.creator=true;await fadeOut(500);clearUI();
  newGameState(Object.assign({},DEFAULT_LOOK,CITY_LOOK),theKnife(),'Lift');
  setScene(WORLD_SCENE);WD.zone=null;WD.busy=true;
  try{await STORY.r_cityStart()}catch(e){if(e!==ABORT)console.error(e)}WD.busy=false}
/* ---------- the console ---------- */
window.ZPCart={input(b,d){press(b,d)},
  home(){if(G&&S_SCENE===WORLD_SCENE&&!WD.busy&&!MODAL.length){autosave();flushCloud();return true}if(S_SCENE===TITLE_SCENE&&!TITLE_SCENE.creator)return true;return'ask'},
  snapshot(){return G&&S_SCENE!==TITLE_SCENE&&WD.zone?JSON.stringify(Object.assign({},G,{x:WD.x,zone:WD.zone,dir:WD.dir})):null}};
document.addEventListener('visibilitychange',()=>{SND.pause(document.hidden);if(document.hidden&&G&&S_SCENE===WORLD_SCENE&&!WD.busy)autosave()});
/* a hook for automated tests only (the address must end in #sstest) */
if(/sstest/.test(location.hash))window.__SS={get G(){return G},set G(v){G=v},WD,get BT(){return BT},MODAL,scene:()=>S_SCENE,press,battle,enterZone,setScene,WORLD_SCENE,TITLE_SCENE,join,ZONES,FOE,startFight,loadGame,newGameState,autosave,healAll,giveXP,makeMember,mainMenu,openPlace,wardrobe,forgeDesign,statsOf,SET,interact,migrate,newWeapon,WKINDS,STORY,actorAdd,actor,npcOut,heroTo,goZone,runStory,themeArt,heroSprite,TITLE_CAST,GROUND_Y,DOLL_W,DOLL_FX,DOLL_FY,drawBackdrop,drawHeroAt,foeSprite,CHARS,charWeapon,dyeOf};
/* ---------- start ---------- */
(async()=>{SND.music=SET.music;SND.on=SET.sound;layout();requestAnimationFrame(t=>{last=t;requestAnimationFrame(frame)});
  let snap=null;try{snap=ZP&&ZP.takeRestore?ZP.takeRestore('nightsteel'):null}catch(e){}
  if(snap){try{const d=typeof snap==='string'?JSON.parse(snap):snap;if(d&&d.party){G=migrate(d);setScene(WORLD_SCENE);enterZone(G.zone,G.x,G.dir);readBest().then(b=>{HAS_SAVE=!!b});return}}catch(e){}}
  HAS_SAVE=!!readLocal();setScene(TITLE_SCENE);checkSave()})();
