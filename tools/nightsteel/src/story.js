/* ================= the story: STRIKE AT NIGHT, staged on the top-down maps =================
   Prologue: a street in 2026, then one quiet day in Larkfield, then the night it all goes wrong.
   Chapter 1: three months later, with the Crows. The tax wagon, and Garrick the Hound.
   Chapter 2: the Baron's road to Greyford, the tollhouse, and Sir Kell. */
/* Lift as he was in 2026, and the body he wakes up in */
const CITY_LOOK={skin:'Fair',eyes:'Sleepy',eyeC:'Brown',brows:'Soft',mouth:'Calm',ears:'Human',hair:'Short Crop',hairC:'Chocolate',hat:'None',top:'Button Shirt',topC1:'White',topC2:'Navy',bot:'Pants',botC1:'Charcoal',shoes:'Loafers',shoeC:'Black',face:'None',back:'Backpack',backC1:'Charcoal',backC2:'Grey'};
const LARK_LOOK={skin:'Tan',eyes:'Round',eyeC:'Amber',brows:'Soft',mouth:'Calm',ears:'Human',hair:'Messy',hairC:'Chocolate',hat:'None',top:'Tunic',topC1:'Cream',topC2:'Brown',bot:'Pants',botC1:'Brown',shoes:'Boots',shoeC:'Chocolate',face:'None',back:'None'};
/* the hooded man's knife; it is spellsteel, though nobody knows it yet */
function theKnife(){const w=newWeapon('sword','The Knife');Object.assign(w.parts,{Blade:'Knife',Guard:'None',Pommel:'Ring',Wrap:'Leather',Charm:'None'});Object.assign(w,{c1:'Steel',c2:'Charcoal',c3:'Black',c4:'Charcoal'});return w}
const HN=()=>hero().name;
const LIFT=t=>[HN(),t];
const MOM='Mom',DAD='Dad',WYNN='Wynn',GARROW='Warden Garrow',NELL='Nell',HALE='Hale',TAM='Tam',HOOD='Hooded Man',ROOK='Rook',JUN='Jun',MOSS='Moss',PIKE='Pike',GARRICK='Garrick',KELL='Sir Kell';
/* is Lift's face hidden? the Greyford gate only lets you by in a hood, a helm or a mask */
const HIDING_HATS=['Hood','Cat-Ear Hood','Knight Helm','Viking Helm','Winged Helm','Samurai Kabuto','Spartan Helm'],HIDING_FACES=['Mouth Mask','Ninja Mask','Domino Mask','Fox Mask'];
const disguised=()=>{const L=hero().look;return HIDING_HATS.includes(L.hat)||HIDING_FACES.includes(L.face)};
/* ---------- little helpers for scenes ---------- */
function crawl(lines,o={}){return new Promise(async res=>{const e=el('div','crawl'+(o.clear?' clear':''));UI.appendChild(e);await sleep(30);e.classList.add('on');
  for(const l of lines){const t=el('div','cl',l);e.appendChild(t);await sleep(40);t.classList.add('on');
    await new Promise(r=>{let done=false;const m={input(b){if(done||!(b==='a'||b==='b'||b==='start'))return;done=true;popModal(m);r()}};pushModal(m)});t.classList.remove('on');await sleep(260);t.remove()}
  e.classList.remove('on');await sleep(320);e.remove();res()})}
const chapterTitle=(n,name)=>crawl([`<span class="small" style="letter-spacing:.3em">CHAPTER ${n}</span><br><span class="gold big">${name}</span>`]);
const chapterEnd=(n,next)=>crawl([`<span class="small" style="letter-spacing:.3em">END OF CHAPTER ${n}</span>`,`<span class="small">${next}</span>`]);
async function getItem(id,n=1){addItem(id,n);SND.fx('chest');await say('',`Received ${ITEMS[id].n}${n>1?' ×'+n:''}.`)}
const takeKey=id=>{delete G.inv[id]};
async function hint(t){await say('',t)}
async function raiseBounty(n,crime){G.bounty=n;G.crime=crime;SND.fx('debuff');await say('','There\'s a new poster.');await showPoster()}
const learnEl=(...fl)=>toast('A forge can now infuse '+fl.map(f=>{const e=ELEMS[EMBERS[f].elem];return`<b style="color:${e.c}">${e.n}</b>`}).join(' and ')+'.',2400);
async function tweenP(ms,fn){const t0=performance.now();for(;;){const p=Math.min(1,(performance.now()-t0)/ms);fn(p);if(p>=1)return;await frames(1)}}
/* a free tile next to the hero, for someone who comes over to talk */
function besideMe(){for(const d of[OPP[WD.dir],'left','right','down','up']){const [dx,dy]=DIRV[d],x=WD.x+dx,y=WD.y+dy;if(canEnter(x,y)==='foot')return[x,y,OPP[d]]}return[WD.x+1,WD.y,'left']}
/* rest at a fire, then maybe save */
async function campRest(text){const c=await ask('',text,['Rest','Not now']);if(c!==0)return;
  await fadeOut(400);healAll();SND.fx('heal');await sleep(500);await fadeIn(500);await say('','Everyone is rested.');
  if(await ask('','Save your journey?',['Save','Not now'])===0){autosave();SND.fx('save');await say('','Your journey is saved.')}}
/* a power leaving a beaten foe and pouring into Lift: motes that spiral in from where the foe stands */
function absorbFx(sx,sy,cols){const t0=TIME,P=[];for(let i=0;i<46;i++)P.push({d:i*.03,a:rnd()*7,r:6+rnd()*14,big:rnd()<.35,c:cols[i%cols.length]});
  const f=(g,cx,cy)=>{const t=TIME-t0,tx=WD.x*16+8,ty=WD.y*16;let live=false;g.save();g.globalCompositeOperation='lighter';
    for(const p of P){const k=(t-p.d)/.75;if(k<0){live=true;continue}if(k>1)continue;live=true;const e=k*k*(3-2*k);
      const x=sx+(tx-sx)*e+Math.cos(p.a+k*7)*p.r*(1-e),y=sy+(ty-sy)*e+Math.sin(p.a+k*7)*p.r*(1-e)-Math.sin(k*Math.PI)*12;
      g.globalAlpha=1-k*.4;g.fillStyle=p.c;g.fillRect(Math.round(x-cx),Math.round(y-cy),p.big?2:1,p.big?2:1)}
    g.restore();if(!live)WD.fx=WD.fx.filter(q=>q!==f)};WD.fx.push(f)}
async function takePower(flag,from,cols){const n=npc(from);const sx=n?n.x*16+8:WD.x*16+8,sy=n?n.y*16:WD.y*16-30;
  SND.fx('power');absorbFx(sx,sy,cols);await sleep(1900);setF(flag);WD.shake=.5;SND.fx('level');healAll();await sleep(500);
  const P=POWERS[flag];await say('',`You took ${P.from}'s power: ${P.n}.`);await say('',`${P.desc} Lift has a new Special: ${P.art.n}.`)}
/* ---------- the scenes ---------- */
const STORY={
/* ===================== PROLOGUE: Out of Office ===================== */
async r_cityStart(){SND.stop();
  await crawl(['October, 2026.','11:48 PM.']);
  loadMap('city',4,3,'down');await fadeIn(1200);
  await talk(['Your phone buzzes.',['Dana, work','hey!! quick one, can you hop on a call at 7?'],'You type "sure" and put the phone away.',LIFT('I should have said no.')]);
  await hint('D-pad walks (hold B to run) · A talks and looks · START opens the menu')},
r_office(){return talk(['The office. Everyone else went home hours ago.'])},
r_bin(){return talk(['A bin. Somebody threw away a perfectly good umbrella.'])},
r_parked(){return talk(['A parked car. Not yours. You have a bus pass.'])},
async r_jaywalk(){pushBack();await talk([LIFT('The crosswalk\'s right there.')])},
async r_car(){setF('hit');face('me','up');
  await say('','The little white man on the signal says WALK.');
  SND.stop();const car=spawn({id:'car',x:-3,y:7,big:()=>TD.ART.car(),stand:1,dx:0});
  WD.lights=[{get x(){return car.x*16+8+(car.dx||0)+30},get y(){return car.y*16+6},r:70,c:'rgba(255,250,225,.8)'}];
  await sleep(250);face('me','left');SND.fx('horn');
  const goal=(WD.x+3)*16-14;await tweenP(620,p=>{car.dx=Math.round(goal*p*p)});
  SND.fx('boom');WD.shake=.4;const f=$('#fader')||el('div','');if(!f.id){f.id='fader';UI.appendChild(f)}f.style.background='#fff';f.style.transition='none';f.style.opacity=1;await sleep(90);
  f.style.transition='opacity 600ms';f.style.background='#000';await sleep(700);despawn('car');WD.lights=null;
  await crawl(['You don\'t hear the car until it\'s very close.','Then it\'s very quiet.','...','Somewhere, a rooster.']);
  /* a new body, a new morning */
  setF('reborn');hero().look=Object.assign({},DEFAULT_LOOK,LARK_LOOK);
  loadMap('lhome',2,3,'down');WD.pose='kneel';await fadeIn(1400);
  await talk(['Sunlight. Wood smoke. A straw mattress that isn\'t your mattress.',LIFT('...This isn\'t my apartment.')]);
  await walkNpc('mara',['up','up','left','left','left','left']);face('mara','left');face('me','right');
  await talk([[MOM,'Lift. You\'re up. Breakfast is getting cold.'],LIFT('...Lift?'),[MOM,'That\'s your name, love. Did you hit your head?'],LIFT('Maybe.'),[MOM,'Wash your face. Your father wants you on the fence after.']]);
  WD.pose=null;await walkNpc('mara',['right','right','right','right','down','down']);face('mara','left');npc('mara').cond=()=>!F('n1');
  autosave();await hint('The wash basin is by the wall, in the bottom left corner.')},
async r_basin(){
  if(F('face'))return talk(['Your face. You\'re getting used to it.']);
  await talk(['A bowl of cold water. A face looks up out of it.','It isn\'t yours.']);
  await wardrobe(hero(),{heading:'The face in the water',doneLabel:'That\'s me now',title:'Lift',noWeapon:true,mustFinish:true});setF('face');
  await talk([LIFT('Huh.'),LIFT('Okay. That\'s me now, I guess.')]);
  await hint('You can change how you look any time: START, then Style, then Wardrobe.')},
r_hearth(){return talk([F('n1')?'The fire is almost out.':'The fire. Something with onions is cooking over it.'])},
r_bed(){return talk([F('n1')?'Your bed. It\'s still warm.':'Your bed. Well. His bed. Yours now.'])},
r_bed2(){return talk(['Your parents\' bed. Made, with the corners tucked in.'])},
r_shelf(){return talk(['Jars, a carved wooden horse, and a knife for bread.'])},
async r_leaveHome(){pushBack();
  if(!F('face'))return talk([[MOM,'Face first, love. You look like you slept in a ditch.']]);
  return talk([[MOM,'Breakfast! Sit down before it walks off.']])},
async r_mara(){
  if(!F('face'))return talk([[MOM,'Face first, love. You look like you slept in a ditch.']]);
  if(!F('breakfast')){await fadeOut(350);WD.x=7;WD.y=6;WD.dir='right';G.x=7;G.y=6;face('mara','down');face('bren_in','left');initTrail();await fadeIn(350);
    await talk([[DAD,'Morning. You look like you\'ve seen a ghost.'],LIFT('Bad dream.'),[DAD,'About what?'],LIFT('...Work.'),[DAD,'You\'re sixteen. What work?'],[MOM,'Leave him be, Bren.'],
      'Bread, eggs, and something hot that might be tea. It\'s the best breakfast you\'ve had in years.',
      [DAD,'The fence by the wheat is down again. Grab a post from the pile by the shed and meet me there.'],[MOM,'And take these eggs to Nell on your way. Blue roof, across the square.']]);
    setF('breakfast');await getItem('eggs');await fadeOut(300);refreshNpcs();face('mara','left');await fadeIn(300);return}
  if(F('dusk'))return STORY.r_supper();
  const left=[!F('nelldone')&&'Eggs to Nell.',!F('fencedone')&&'Your father\'s at the fence.'].filter(Boolean).join(' ');
  return talk([[MOM,left||'Go on, then.']])},
r_brenIn(){return talk([[DAD,'Sit. Eat. The fence isn\'t going anywhere. That\'s the problem with it.']])},
/* Larkfield, the one quiet day */
async r_bren(){
  if(F('fencedone'))return talk([[DAD,'Good work. Go see if your mother needs anything.']]);
  if(!hasItem('post'))return talk([[DAD,'Post\'s in the pile by the shed. Bottom corner, by the barrel.']]);
  await talk([[DAD,'There it is. Hold it straight, I\'ll get the mallet.']]);
  SND.fx('heavy');WD.shake=.35;await sleep(300);
  await talk(['You push the post into the ground. It goes in like the ground is butter.',[DAD,'...'],[DAD,'Where\'s the mallet?'],LIFT('I think we\'re okay.'),
    [DAD,'Your mother says you get that from me.'],[MOM,'(from the house) He doesn\'t!']]);
  takeKey('post');setF('fencedone');WD.m.onLoad(WD.m);SND.fx('chest');await duskCheck()},
async r_posts(){
  if(!F('breakfast'))return talk(['A pile of fence posts.']);
  if(F('fencedone')||hasItem('post'))return talk(['A pile of fence posts. One is enough.']);
  addItem('post');SND.fx('ok');
  await talk(['You pick up a fence post. It weighs about as much as a loaf of bread.',LIFT('...That can\'t be right.')])},
async r_nell(){
  if(F('nelldone'))return talk([[NELL,'Tell your mother thank you. And eat something, you\'re all shoulders.']]);
  if(!hasItem('eggs'))return talk([[NELL,'Morning, Lift.']]);
  takeKey('eggs');
  await talk([[NELL,'Eggs! Your mother is an angel.'],[NELL,'You\'ve got your father\'s shoulders and your mother\'s manners. Hang on to both.'],LIFT('I\'ll try.'),[NELL,'Here. For later.']]);
  await getItem('honeycake');setF('nelldone');await duskCheck()},
r_wynn(){if(!F('wynn1')){setF('wynn1');return talk([[WYNN,'There you are. You missed the sunrise.'],LIFT('Did I?'),[WYNN,'You come up the hill every morning to watch it. Every single morning.'],
    LIFT('...I overslept.'),[WYNN,'You\'re being weird.'],LIFT('I\'m always weird.'),[WYNN,'New weird.']])}
  return talk([[WYNN,F('dusk')?'Same time tomorrow? The hill?':'Go help your dad. I\'ll be around.'],...(F('dusk')?[LIFT('Sure.')]:[])])},
r_hale(){return talk([[HALE,'Morning, Lift. Tell your father I still owe him for the plough. He\'ll know what that means.']])},
r_tam(){return talk([[TAM,'Lift! Is it true you can lift a cow?'],LIFT('I don\'t know. I\'ve never tried.'),[TAM,'Try!'],LIFT('Maybe later.')])},
r_garrow(){return talk([[GARROW,'Morning, Lift.'],[GARROW,'Tell your father the Baron\'s tax man comes Tuesday.'],LIFT('How much was it last time?'),[GARROW,'Too much. Same as this time.']])},
async r_hood(){
  await talk(['He doesn\'t look at you.',[HOOD,'Nice evening for it.'],LIFT('For what?'),'He doesn\'t answer.']);
  await walkNpc('hood',['up','up']);despawn('hood');setF('hoodgone')},
r_well(){return talk(['The village well. The water is very cold, and very clear.'])},
async r_north(){pushBack();await talk(['The north road runs into the Thornwood. Nobody goes in there after dark.'])},
async r_south(){pushBack();await talk([F('n1')?'Lanterns, coming up the south road. That way is no good.':'The south road goes down to the Baron\'s mill. Nothing you need down there.'])},
async r_east(){pushBack();await talk(['The east road. Wheat as far as you can see.'])},
async r_noHome(){pushBack();await talk(['You can\'t go back in there.'])},
r_doorWynn(){return talk(['Wynn\'s house. It smells like fresh bread.'])},
r_doorNell(){return talk(['Nell\'s door. There\'s a cat on the step that doesn\'t care about you at all.'])},
r_doorGarrow(){return talk(['The warden\'s house. A notice on the door: TAXES DUE TUESDAY.'])},
async r_supper(){await fadeOut(500);WD.x=7;WD.y=6;WD.dir='right';G.x=7;G.y=6;initTrail();
  spawn({id:'bren_sup',x:8,y:6,look:'bren',dir:'left'});face('mara','down');await fadeIn(500);
  await talk([[MOM,'There he is. Sit.'],'Supper is stew. Your father tells a long story about a goose. Your mother has heard it before, and laughs anyway.',
    [DAD,'...and that\'s why we don\'t keep geese.'],[MOM,'You\'ve been quiet today, love.'],LIFT('Just thinking.'),[DAD,'Careful. You\'ll hurt yourself.'],
    'No phone. No email. Nobody needs anything from you by seven.',LIFT('I could get used to this.'),[MOM,'Used to what?'],LIFT('Nothing. This is nice.')]);
  await fadeOut(1000);SND.stop();despawn('bren_sup');
  await crawl(['That night, you sleep like you haven\'t slept in years.']);
  setF('n1');await nightOfTheKnife()},
/* ---------- the night it goes wrong ---------- */
r_watch(){return talk([['Watchman','Stay where you are!']])},
async r_escape1(){face('me','up');WD.dlg='low';
  await talk([['Watchman','That\'s him! The Ashby boy!'],['Watchman','Drop the knife!'],LIFT('I\'m sorry. I really am.')]);
  await startFight(['watchman','watchman'],{noFlee:true});
  await talk(['They\'re breathing. You didn\'t hit them as hard as you could have.',LIFT('Sorry.')]);
  setF('esc1');refreshNpcs()},
async r_escape2(){face('me','up');WD.dlg='low';
  spawn({id:'wynnN',x:11,y:1,look:'wynn',dir:'down'});await walkNpc('wynnN',['down']);
  await talk([[WYNN,'Lift?'],[WYNN,'They\'re saying you...'],LIFT('I didn\'t.'),'She looks at you for a long time.',[WYNN,'...I know.'],[WYNN,'Go. Before Garrow gets here.']]);
  face('wynnN','left');await walkMeTo(10);await walkMe(['up','up','up']);await fadeOut(900);SND.stop();despawn('wynnN');
  await crawl(['You run until the lights of Larkfield are gone.','You sleep in a ditch. It\'s cold.','In the morning, there\'s a notice nailed to every tree on the road.']);
  G.bounty=300;addItem('poster');await showPoster();
  await crawl(['"Dead or alive."','...It isn\'t even a good drawing.']);
  await STORY.r_camp()},
/* ===================== CHAPTER 1: Wanted ===================== */
async r_camp(){
  await crawl(['Three months later.']);await chapterTitle(1,'WANTED');
  const h=hero();if(h.lv<7){h.lv=7;h.xp=0}healAll();setF('c1');
  loadMap('camp',15,5,'down');face('jun','up');await fadeIn(900);
  await talk([[JUN,'You talk in your sleep.'],LIFT('What do I say?'),[JUN,'"Let\'s circle back on that." What\'s circling back?'],LIFT('...A curse. A really old one.'),[JUN,'Rook wants you. Red tent.'],
    [JUN,'And Wick wants another look at that knife of yours. He\'s been staring at it for three months. He\'s by the anvil.']]);
  face('jun','left');autosave();await hint('Your Wanted Poster is in your Items. Choose it to look.')},
async r_rook(){
  if(!F('job1')){
    await talk([[ROOK,'There he is. Sleep well?'],LIFT('Not really.'),[ROOK,'Good. Means you\'re still a person.'],
      [ROOK,'The Baron\'s tax wagon comes through Hangman\'s Bend tonight. South road, out of camp. I want the strongbox.'],[ROOK,'Nobody gets hurt that doesn\'t have to. Take Jun.']]);
    const [bx,by,bd]=besideMe();await fadeOut(200);const j=npc('jun');if(j){j.x=bx;j.y=by;j.ox=j.oy=0;j.dir=bd}await fadeIn(200);
    await talk([[JUN,'I was going anyway.']]);
    despawn('jun');join('jun',hero().lv);await say('','Jun joins you.');
    setF('job1');refreshNpcs();autosave();
    await hint('Jun fights with two knives. In battle your party shares CP: an attack gives 1, a Special costs 2. Fill the gauge for an Ult.');return}
  if(!F('wagon'))return talk([[ROOK,'Hangman\'s Bend. South road. Don\'t make me come and get you.']]);
  if(!F('hound'))return talk([[ROOK,'Well? Where\'s my box?']]);
  if(!F('c1done'))return STORY.r_c1End();
  if(!F('c2'))return STORY.r_c2Start();
  if(!F('kell'))return talk([[ROOK,'Greyford. The tollhouse. Find out who signs with that eye, and come back in one piece.']]);
  return talk([[ROOK,'A Returner, he said. Hm.'],[ROOK,'Get some sleep. All of you.']])},
async r_c1End(){
  await talk([[ROOK,'The box. Good.'],'You hand her the letter too.','Rook reads it. Then she reads it again.',[ROOK,'Where did you get this?'],
    LIFT('It was in the box. It has the same mark as the knife.'),[ROOK,'...Burn it.'],LIFT('I\'d rather not.'),[ROOK,'Then keep it somewhere I can\'t see it.'],
    [ROOK,'And Lift. People who sign with that eye don\'t lose things. They come back for them.']]);
  setF('c1done');await raiseBounty(1200,'Runs with the Crows. Uses strange powers.');
  await talk([LIFT('"Strange powers."'),LIFT('...That\'s fair.')]);
  learnEl('c1done');autosave();
  await chapterEnd(1,'Talk to Rook when you\'re ready for Chapter 2.')},
r_jun(){return talk([[JUN,'Rook wants you. Red tent.']])},
async r_moss(){if(!F('mossbowl')){setF('mossbowl');healAll();SND.fx('heal');
    await talk(['Moss hands you a bowl of stew. He doesn\'t say anything.','It\'s really good.']);return getItem('stew')}
  return talk(['Moss nods at you. That\'s a lot, for Moss.'])},
async r_pike(){if(!F('job1'))return talk([[PIKE,'Rook wants you before you go anywhere.']]);
  return talk([[PIKE,F('hound')?'You beat the man with the dogs? Huh. I owe Sprout a coin.':'Big man with dogs in the woods this week. A hunter. Watch yourself.']])},
async r_leaveCamp(){pushBack();await talk([[PIKE,'Rook wants you before you go anywhere. Red tent.']])},
async r_wick(){if(!F('forge'))return STORY.r_anvil();
  const r=await ask('Wick','Stolen fair and square. What\'ll it be?',['Supplies','Clothes','Nothing']);
  if(r===0)await shopMenu('camp');else if(r===1)await tailorMenu('camp')},
/* the knife is spellsteel */
async r_anvil(){
  if(F('forge')){await forgeMenu('camp');clampParty();return}
  await talk(['An anvil, and a whetstone. You sit down to put an edge on the knife.',['Wick','Hold on. Let me see that again.'],'Wick turns the knife over in the firelight. The closed eye on the handle catches it.',
    ['Wick','I knew it. That isn\'t iron, kid. It\'s spellsteel.'],LIFT('Is that good?'),['Wick','I\'ve only seen it twice, both times in a lord\'s house. It takes the shape its owner wants. Think at it. Hard.'],
    LIFT('Think at it.'),['Wick','Like you mean it.']]);
  await forgeDesign(hero(),{heading:'Spellsteel takes shape',mustFinish:true});clampParty();
  const nn=await letters('Name your weapon',hero().weapon.name||'The Knife',14,{});if(nn)hero().weapon.name=nn;
  await talk([['Wick','...Huh.'],['Wick','Well. Don\'t let Rook see it. She\'ll sell it.'],['Wick','I sell things too, by the way. Supplies, and clothes. Ask.']]);
  setF('forge');SND.fx('level');
  await hint('You can reshape it any time: START, then Style, then Weapon shape. At an anvil you can also reforge it with ore and infuse it with an element.');
  learnEl('forge')},
r_sprout(){return talk([['Sprout','Is it true you killed a man with your bare hands?'],LIFT('No.'),['Sprout','Oh.'],['Sprout','...Could you?'],LIFT('Go to bed, Sprout.')])},
r_crowA(){return talk([['Crow','Rook took me in when I was your age. She does that.'],['Crow','Then she makes you carry things. She does that too.']])},
r_crowB(){return talk([['Crow','You\'re the Larkfield boy? You don\'t look like a killer.'],LIFT('Thanks. I think.')])},
r_fire(){return campRest('The campfire. Rest a while?')},
r_crates(){return talk(['Crates of things the Baron used to own.'])},
r_tentRook(){return talk(['Rook\'s tent. You don\'t go in Rook\'s tent.'])},
r_tentLift(){return talk(['Your tent. Three months, and it still smells like somebody else.'])},
r_tent3(){return talk(['Snoring. A lot of it.'])},
/* Hangman's Bend */
r_bendFire(){return campRest('An old Crows\' fire ring. Rest a while?')},
async r_southBlock(){pushBack();await talk([LIFT('That road goes to Greyford. Not tonight.')])},
async r_southBlock2(){pushBack();await talk([LIFT('That road goes back toward Larkfield.'),LIFT('...Not yet.')])},
r_wagonTalk(){return talk(['The Baron\'s tax wagon. A red seal on the side.'])},
r_tg(){return talk([['Toll Guard','Keep moving.']])},
async r_ambush(){face('me','down');SND.stop();WD.dlg='high';
  await talk([[JUN,'Two guards. Easy.'],LIFT('Let me try asking first.'),[JUN,'...Sure. Ask.']]);
  face('tg1','up');face('tg2','up');
  await talk([LIFT('Evening. We\'re going to need the box.'),['Toll Guard','You\'re...'],['Toll Guard','That\'s the Larkfield boy. From the posters.'],LIFT('Yeah. Sorry about that.'),
    ['Toll Sergeant','(from the wagon) Three hundred coins, standing right there. Get him!'],[JUN,'See? Asking.']]);
  await startFight(['tollguard','tollcapt','tollguard'],{noFlee:true});
  await Promise.all([walkNpc('tg1',['down','down','left','left'],2),walkNpc('tg2',['down','down','right','right'],2)]);despawn('tg1','tg2');
  await talk(['The guards run. The driver is already gone.','The strongbox is heavy. Coins, and one letter, sealed in black wax.','The seal is a closed eye.',
    LIFT('...That\'s the same mark.'),[JUN,'Same as what?'],LIFT('The knife.'),[JUN,'...Oh.'],[JUN,'The night you didn\'t do it.'],LIFT('The night I didn\'t do it.'),
    '"The boy is loose. Bring him in alive."',LIFT('Alive.'),[JUN,'Everybody wants you alive. It\'s on your poster.'],LIFT('The poster says dead or alive.'),[JUN,'...Half of everybody, then.']]);
  await getItem('eyeletter');G.gold+=120;SND.fx('buy');await say('','You keep the guards\' purses. 120 gold.');
  setF('wagon');refreshNpcs();await talk([[JUN,'Back to camp. Rook will want this.']]);SND.play('field');autosave()},
async r_garrick(){face('me','up');SND.stop();WD.dlg='low';
  await say('','Dogs. Close, and getting closer.');
  spawn({id:'garr',x:6,y:7,look:'garrickF',dir:'down'});spawn({id:'hd1',x:5,y:7,mon:['wolf','hound'],dir:'down'});spawn({id:'hd2',x:8,y:7,mon:['wolf','hound'],dir:'down'});
  SND.fx('swirl');await Promise.all([walkNpc('garr',['down','down','right','right']),walkNpc('hd1',['down','down','down']),walkNpc('hd2',['down','down','right','right'])]);
  face('garr','down');await walkMeTo(8);face('me','up');
  SND.play('boss');
  await talk([[GARRICK,'Lift of Larkfield.'],[GARRICK,'Three hundred coins. I\'ve been on your trail for a week.'],LIFT('Sorry. I didn\'t know anyone was following.'),
    [GARRICK,'They never do. Come quietly, and the girl walks.'],[JUN,'The girl has knives.'],[GARRICK,'So I see.'],
    LIFT('I didn\'t kill them.'),[GARRICK,'They all say that.'],LIFT('I know. That\'s the annoying part.')]);
  await startFight(['hound','garrick','hound'],{noFlee:true,boss:true,music:'boss'});
  SND.stop();const gr=npc('garr');if(gr)gr.pose='kneel';
  await talk(['Garrick goes down on one knee. His dogs whine, and back away.','Something comes off him like heat off a road. Grey, and fast.','It goes straight into you.']);
  await takePower('hound','garr',['#ffe2a0','#e8a822','#ffffff','#c8b08a']);
  await talk(['Your heart is going very fast. You can smell everything. The dogs. Rain, an hour away. Jun\'s fear.',
    [JUN,'Lift? Your eyes.'],LIFT('What about them?'),[JUN,'They\'re yellow.'],[GARRICK,'...What are you?'],LIFT('Honestly? I don\'t know.'),
    [GARRICK,'Keep it. Whatever you took.'],[GARRICK,'I\'m done with this job.']]);
  if(gr)gr.pose=0;
  await Promise.all([walkNpc('garr',['up','up','left','up','up']),walkNpc('hd1',['up','up','up','up']),walkNpc('hd2',['up','up','up','up','up'])]);despawn('garr','hd1','hd2');
  learnEl('hound');SND.play('field');autosave()},
/* ===================== CHAPTER 2: Greyford ===================== */
async r_c2Start(){
  await talk([[ROOK,'That letter came out of the tollhouse at Greyford. If you\'re going to chase that eye, you\'ll need more than Jun.'],[ROOK,'Moss. You\'re going with them.']]);
  const [bx,by,bd]=besideMe();await fadeOut(200);const m=npc('moss');if(m){m.x=bx;m.y=by;m.ox=m.oy=0;m.dir=bd}await fadeIn(200);
  await talk(['Moss nods.',[JUN,'He talks, you know. Just not to people he doesn\'t like.'],LIFT('Does he like me?'),[JUN,'Hard to say. He\'s never talked to me either.']]);
  despawn('moss');join('moss',Math.max(1,hero().lv-1));await say('','Moss joins you.');
  await getItem('rooksmap');setF('c2');refreshNpcs();autosave();
  await chapterTitle(2,'GREYFORD');
  await hint('Greyford is down the south road: through Hangman\'s Bend, out the bottom left, then east along the Baron\'s Road.')},
async r_c2road(){setF('c2road');await talk([[JUN,'The Baron\'s road. Keep your head down.']])},
r_waystation(){return talk(['A burned waystation. Someone has scratched into the door: TAXED TO DEATH.'])},
async r_gfArrive(){face('me','right');face('gguard','up');
  if(!disguised()){pushBack();
    await talk([['Gate Guard','Hold on.'],['Gate Guard','You look familiar.'],LIFT('I get that a lot.'),['Gate Guard','...Come closer. Into the light.']]);
    await talk([[JUN,'(quietly) Your face is on every wall in this town. Maybe wear a different one.'],[JUN,'A hood. A helmet. A mask. Anything.']]);
    if(!F('disguisehint')){setF('disguisehint');await hint('Put on a hood, a helm or a mask: START, then Style, then Wardrobe.')}return}
  await talk([['Gate Guard','Move along.']]);
  if(!F('ingf'))await talk([[JUN,'He didn\'t even look twice.'],LIFT('I didn\'t know that would work.'),[JUN,'Neither did I.']]);
  setF('ingf');autosave()},
r_gateGuard(){return talk([['Gate Guard',F('ingf')?'Move along.':'State your business.']])},
async r_gfTrail(){setF('trail');SND.fx('power');
  await talk([[JUN,'So where do we start?'],LIFT('I can\'t exactly ask around.'),'Then you smell it. Garrick\'s nose, still working.','Smoke, and something sweet. Like the night in Larkfield.',
    LIFT('He was here.'),[JUN,'Who?'],LIFT('The man in the hood.'),'The scent runs up the street, past the tollhouse, and under a little door in its back wall.'])},
async r_backDoor(){
  if(!F('trail')){pushBack();return talk(['A small door in the back wall of the tollhouse. Locked.'])}
  if(!F('kell')&&!F('doorOpen')){await talk(['The scent goes under the door.','Moss puts his shoulder against it. It isn\'t locked anymore.']);setF('doorOpen')}
  await goto('tollhouse',7,12,'up')},
async r_frontGate(){pushBack();await talk([['Toll Guard','Tollhouse is closed. Pay at the window.'],['Toll Guard','There is no window.']])},
r_frontGuard(){return talk([['Toll Guard','Taxes are paid inside. Nobody goes inside.']])},
async r_gfDoor(){pushBack();await talk(['Locked. Greyford keeps its doors locked.'])},
async r_gfInnDoor(){pushBack();await talk(['The inn. Ma Dorne runs it from the front step.'])},
async r_gfPeddler(){await say('Peddler','Don\'t tell the Baron what I charge.');await shopMenu('greyford')},
async r_gfSmith(){await say('Brenna','Iron. It holds. Spellsteel, though... let me see that.');await forgeMenu('greyford');clampParty()},
async r_gfInn(){await innMenu('greyford')},
async r_gfTailor(){await say('Tailor','Everything here is finer than anything the Baron owns. Don\'t tell him.');await tailorMenu('greyford')},
r_gfTailorSign(){return talk(['A needle and thread painted on the door. The tailor stands out front, by the street.'])},
r_gfMan(){return talk([['Townsman','The Baron\'s man took my cow for back taxes. The cow didn\'t owe anything.']])},
r_gfWoman(){return talk([['Townswoman',F('freed')?'My brother came home last night. He says a big man pulled the door off his cell.':'They lock people in the tollhouse when they can\'t pay. My brother\'s been in there a month.']])},
r_gfKid(){return talk([['Kid','Are you a bandit? You look like a bandit.'],LIFT('What does a bandit look like?'),['Kid','Like you.']])},
r_gfOld(){return talk([['Old Woman','There\'s a man who visits the tollhouse at night. Tall. Hooded.'],['Old Woman','He walks right under the lamps, and there\'s nothing on the ground behind him.']])},
async r_gfBoard(){await talk(['The notice board. Your face is on it four times.',LIFT('...It\'s not a great likeness.'),[JUN,'It\'s a little generous, honestly.']])},
r_gfWell(){return talk(['A fountain. Somebody threw a coin in. Somebody else is fishing it out.'])},
/* the tollhouse */
r_debtor(){return talk(F('freed')?[['Prisoner','Thank you.']]:[['Prisoner','You\'re not a guard.'],LIFT('No.'),['Prisoner','Then what are you?'],LIFT('Still working that out.')])},
r_kellTalk(){return talk([[KELL,'...']])},
async r_kell(){face('me','up');SND.stop();WD.dlg='low';
  await walkMeTo(7);face('me','up');
  await talk([[KELL,'The Larkfield boy.'],[KELL,'You\'re smaller than your poster.'],LIFT('Everyone\'s smaller than their poster.'),
    [KELL,'You broke into the Baron\'s tollhouse with a thief and a woodcutter.'],[JUN,'Technically Moss broke in. We just walked.'],
    LIFT('Let the prisoners go, and we\'ll leave.'),[KELL,'They owe the Baron.'],LIFT('Then the Baron can come and get them.')]);
  await startFight(['keepguard','kell','keepguard'],{noFlee:true,boss:true,music:'boss'});
  SND.stop();despawn('kg1','kg2');const k=npc('kell');if(k){k.cond=null;k.pose='kneel'}
  await talk(['Sir Kell drops his mace. The floor shakes.','His armor doesn\'t come off. Something under it does.','It\'s cold and heavy, like iron in winter. It sinks into you, and it stays.']);
  await takePower('iron','kell',['#ffffff','#dfe6f2','#9aa4b8','#c8ccd8']);
  await talk([[JUN,'You\'re... shiny.'],LIFT('Is that bad?'),[JUN,'It\'s a lot.'],
    [KELL,'You\'re one of them.'],LIFT('One of what?'),[KELL,'A Returner. Somebody who died somewhere else and woke up here.'],'Your mouth goes dry.',
    [KELL,'The Baron has a guest. He said one would wake in Larkfield this autumn. He said it would look like a boy.'],LIFT('What guest?'),
    [KELL,'Tall. Hooded. He walks under the lamps, and there\'s no shadow on the ground behind him.'],[KELL,'I always thought that was a figure of speech.']]);
  if(k){k.pose=0;k.lying=1}SND.fx('hit');await say('','Sir Kell passes out.');
  SND.fx('heavy');WD.shake=.5;await sleep(300);SND.fx('heavy');
  await talk(['Moss pulls the cell doors off. All of them.']);setF('freed');WD.m.onLoad(WD.m);
  for(const id of['deb1','deb2','deb3']){const n=npc(id);if(n)n.cond=null}
  await Promise.all([walkNpc('deb1',['down','down','right','right','right','right','down','down','down','down','down','down','down'],2),walkNpc('deb2',['down','down','down','down','down','down','down','down','down','down','down'],2),walkNpc('deb3',['down','down','left','left','left','left','down','down','down','down','down','down','down'],2)]);
  despawn('deb1','deb2','deb3');
  await talk([[MOSS,'Go home.'],[JUN,'He talks!'],[MOSS,'...Sometimes.']]);
  setF('kell');despawn('kell');refreshNpcs();SND.play('sad');
  await raiseBounty(3000,'Broke into the Greyford tollhouse. Do not approach.');
  await talk([LIFT('"Broke into." The door was open.'),[JUN,'Moss opened it.'],LIFT('...Fair.'),LIFT('A Returner.'),LIFT('So there are others.')]);
  learnEl('iron','kell');autosave();
  await chapterEnd(2,'Chapter 3 comes in a later update. Until then the roads are yours: fight, forge, wish, and finish your quests.');SND.play('cave')},
};
async function duskCheck(){if(!F('nelldone')||!F('fencedone')||F('dusk'))return;
  await sleep(300);setF('dusk');WD.m._lights=null;SND.fx('bell');
  await say('','The sun goes down over the wheat. Somewhere, your mother is calling you in for supper.')}
/* the night it goes wrong */
async function nightOfTheKnife(){
  loadMap('lhome',2,3,'down');WD.pose='kneel';SND.stop();
  spawn({id:'p_mara',x:4,y:2,look:'mara',lying:1});spawn({id:'p_bren',x:6,y:2,look:'bren',lying:-1});
  spawn({id:'hoodN',x:5,y:3,look:'stranger',dir:'down'});
  await fadeIn(1200);
  await talk(['A sound wakes you. Something heavy, hitting the floor.','The fire is almost out.']);
  WD.pose=null;face('me','right');await sleep(300);
  await talk(['There\'s a man in the middle of the room. Your parents are on the floor beside him.','They aren\'t moving.']);
  face('hoodN','left');SND.play('sad');
  await talk([[HOOD,'...You\'re awake.'],LIFT('Who are you? What did you...'),[HOOD,'So you made it.'],[HOOD,'Good.']]);
  SND.fx('clink');await say('','A knife skids across the floor and stops at your feet. The handle is carved with a closed eye.');
  await walkNpc('hoodN',['down','left','down','down','down','right','down']);SND.fx('door');despawn('hoodN');
  await walkMe(['up','right']);face('me','right');
  await talk([LIFT('Mom?'),LIFT('Dad. Hey. Come on.'),'Nothing.','You pick up the knife. You don\'t know why.']);
  setF('knife');SND.stop();SND.fx('door');WD.shake=.4;
  spawn({id:'gN',x:5,y:8,look:'garrow',dir:'up'});spawn({id:'hN',x:6,y:8,look:'hale',dir:'up'});
  WD.lights=[{x:6*16+8,y:7*16,r:46,c:'rgba(255,200,110,.6)'}];
  await Promise.all([walkNpc('gN',['up']),walkNpc('hN',['up'])]);face('me','down');
  await talk([[GARROW,'Bren? We heard...'],'Garrow sees them. Then he sees you.',[GARROW,'Lift. Put the knife down.'],
    LIFT('There was a man. He just walked out. You had to see him.'),[HALE,'There\'s nobody out there, Garrow.'],[GARROW,'Put it down, son.'],
    LIFT('I didn\'t do this.'),[GARROW,'Then put it down, and we\'ll talk.'],'You\'ve been in this world for one day.','You run.']);
  SND.fx('swirl');await fadeOut(300);despawn('gN','hN','p_mara','p_bren');WD.lights=null;
  loadMap('larkfield',4,15,'up');SND.play('chase');await fadeIn(300);
  await say(GARROW,'(behind you) LIFT! STOP!');autosave();
  await hint('Run north, for the Thornwood.')}
async function runStory(id){const f=STORY[id];if(f)await f()}
