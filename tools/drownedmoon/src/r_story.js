/* ===================== STRIKE AT NIGHT, the second telling: the story =====================
   Prologue: a street in 2026, then one quiet day in Larkfield, then the night it all goes wrong.
   Chapter 1: three months later, with the Crows. The tax wagon, and Garrick the Hound.
   Chapter 2: the Baron's road to Greyford, the tollhouse, and Sir Kell. */
const R_MOM='Mom',R_DAD='Dad',WYNN='Wynn',GARROW='Warden Garrow',NELL='Nell',HALE='Hale',TAM='Tam',HOOD='Hooded Man',
  ROOK='Rook',JUN='Jun',MOSS='Moss',PIKE='Pike',GARRICK='Garrick',KELL='Sir Kell';
// the ults of Lift's friends (ULTS lives in battle.js)
Object.assign(ULTS,{
  jun:{name:'Vanishing Act',desc:'She\'s gone. Then she\'s behind it, with both knives. One foe. Poisons.',max:1,pow:6.2,fx:'slash',poison:1,col:['#ffffff','#c8f0e0','#3a8a7a']},
  moss:{name:'Timber!',desc:'He brings the axe down like a falling tree. Hits up to 2 foes.',max:2,pow:4.3,fx:'slam',col:['#ffffff','#ffe9a0','#b0703a']},
});
function joinR(id){if(S.party.includes(id))return;const lv=Math.max(1,S.heroes.lift.lv-(id==='moss'?1:0));S.heroes[id]=mkHero(id,lv);S.party.push(id);initTrail()}
async function chapterTitle(n,name){await crawl([`<span class="small" style="letter-spacing:.3em">CHAPTER ${n}</span><br><span class="gold" style="font-size:1.35rem;letter-spacing:.12em">${name}</span>`])}
async function restHere(text){const c=await ask(null,text,['Rest','Not now'],{cancel:1});if(c!==0)return;
  FD.busy++;AU.play('heal');await fade(1,false,400);healAll();await sleep(500);await fade(0,false,500);FD.busy=Math.max(0,FD.busy-1);
  await say(null,'Everyone\'s HP is full.');const v=await ask(null,'Save your journey?',['Save','Not now'],{cancel:1});if(v===0)await menuSave()}
/* a power leaving a beaten foe and pouring into Lift: motes that spiral in from where the foe stands */
function absorbFx(sx,sy,cols){const t0=animT,P=[];for(let i=0;i<40;i++)P.push({d:i*1.5,a:Math.random()*Math.PI*2,r:6+Math.random()*12,big:Math.random()<.35});
  const f=(g,cx,cy)=>{const t=animT-t0,tx=FD.x*16+8,ty=FD.y*16;let live=false;g.save();g.globalCompositeOperation='lighter';
    for(const p of P){const k=(t-p.d)/44;if(k<0){live=true;continue}if(k>1)continue;live=true;const e=k*k*(3-2*k);
      const x=sx+(tx-sx)*e+Math.cos(p.a+k*7)*p.r*(1-e),y=sy+(ty-sy)*e+Math.sin(p.a+k*7)*p.r*(1-e)-Math.sin(k*Math.PI)*12;
      g.globalAlpha=1-k*.4;g.fillStyle=cols[i0(p.d)%cols.length];g.fillRect(Math.round(x-cx),Math.round(y-cy),p.big?2:1,p.big?2:1)}
    g.restore();if(!live)FD.fx=FD.fx.filter(q=>q!==f)};
  const i0=v=>v|0;FD.fx.push(f)}
async function takeForm(id,fromNpc,cols){const n=npc(fromNpc);const sx=n?n.x*16+8:FD.x*16+8,sy=n?n.y*16:FD.y*16-30;
  AU.play('moon');absorbFx(sx,sy,cols);await sleep(1900);if(!S.forms.includes(id))S.forms.push(id);await changeForm(id,{quiet:true});FD.shake=8;AU.play('level');await sleep(500)}
// the fence by the wheat: once Lift fixes it, it stays fixed
MAPS.larkfield.onLoad=function(m){if(!m._rows0)m._rows0=m.rows.slice();m.rows=m._rows0.slice();if(F('fencedone')){const r=m.rows[17];m.rows[17]=r.slice(0,16)+'|'+r.slice(17)}m._lights=null};

Object.assign(STORY,{
/* ===================== PROLOGUE: Out of Office ===================== */
async r_outOfOffice(){
  MODE='black';AU.music('');
  await crawl(['October, 2026.','11:48 PM.']);
  loadMap('city',4,3,'down');FD.busy++;await fade(1,false,0);MODE='field';AU.music('city');await fade(0,false,1200);mapToast('October, 2026');
  await sleep(500);
  await lines([[null,'Your phone buzzes.'],['Dana, work','hey!! quick one, can you hop on a call at 7?'],[null,'You type "sure" and put the phone away.'],[LF,'I should have said no.']]);
  FD.busy=Math.max(0,FD.busy-1);
  await say(null,'<span class="small">D-pad moves · A talks and checks · START opens the menu</span>')},
r_office(){return lines([[null,'The office. Everyone else went home hours ago.']])},
r_bin(){return lines([[null,'A bin. Somebody threw away a perfectly good umbrella.']])},
r_parked(){return lines([[null,'A parked car. Not yours. You have a bus pass.']])},
async r_jaywalk(){pushBack();await lines([[LF,'The crosswalk\'s right there.']])},
async r_car(){setF('hit');FD.busy++;face('me','up');
  await say(null,'The little white man on the signal says WALK.');
  AU.music('');spawn({id:'car',x:-3,y:7,big:()=>ART.car(),stand:1,fixed:1,alpha:1,dx:0});
  FD.lights=[{get x(){const n=npc('car');return n?n.x*16+8+(n.dx||0)+30:-999},get y(){const n=npc('car');return n?n.y*16+6:-999},r:70,c:'rgba(255,250,225,.8)'}];
  await sleep(250);face('me','left');AU.play('horn');
  const goal=(FD.x+3)*16-14;await tween(620,p=>{const n=npc('car');if(n)n.dx=Math.round(goal*p*p)});
  AU.play('boom');await fade(1,true,60);despawn('car');FD.lights=null;MODE='black';await sleep(700);await fade(1,false,600);
  await crawl(['You don\'t hear the car until it\'s very close.','Then it\'s very quiet.','...','Somewhere, a rooster.']);
  // a new body, a new morning
  setF('reborn');applyLore();
  loadMap('lhome',2,3,'down');FD.pose='kneel';MODE='field';AU.music('home');await fade(0,false,1400);
  await lines([[null,'Sunlight. Wood smoke. A straw mattress that isn\'t your mattress.'],[LF,'...This isn\'t my apartment.']]);
  await walkNpc('mara',['up','up','left','left','left','left']);face('mara','left');face('me','right');
  await lines([[R_MOM,'Lift. You\'re up. Breakfast is getting cold.'],[LF,'...Lift?'],[R_MOM,'That\'s your name, love. Did you hit your head?'],[LF,'Maybe.'],
    [R_MOM,'Wash your face. Your father wants you on the fence after.']]);
  await walkNpc('mara',['right','right','right','right','down','down']);face('mara','left');
  FD.pose=0;FD.busy=Math.max(0,FD.busy-1);
  await say(null,'<span class="small">The wash basin is by the wall.</span>')},
async r_basin(){
  if(F('face'))return lines([[null,'Your face. You\'re getting used to it.']]);
  FD.busy++;await lines([[null,'A bowl of cold water. A face looks up out of it.'],[null,'It isn\'t yours.']]);
  await customizeHero({title:'The face in the water'});setF('face');
  await lines([[LF,'Huh.'],[LF,'Okay. That\'s me now, I guess.']]);FD.busy=Math.max(0,FD.busy-1)},
r_hearth(){return lines([[null,F('n1')?'The fire is almost out.':'The fire. Something with onions is cooking over it.']])},
r_bed(){return lines([[null,F('n1')?'Your bed. It\'s still warm.':'Your bed. Well. His bed. Yours now.']])},
r_shelf(){return lines([[null,'Jars, a carved wooden horse, and a knife for bread.']])},
async r_leaveHome(){pushBack();
  if(!F('face'))return lines([[R_MOM,'Face first, love. You look like you slept in a ditch.']]);
  return lines([[R_MOM,'Breakfast! Sit down before it walks off.']])},
async r_mara(){
  if(!F('face'))return lines([[R_MOM,'Face first, love. You look like you slept in a ditch.']]);
  if(!F('breakfast')){FD.busy++;await fade(1,false,400);FD.x=7;FD.y=6;FD.dir='right';S.x=7;S.y=6;face('mara','down');face('bren_in','left');await fade(0,false,400);
    await lines([[R_DAD,'Morning. You look like you\'ve seen a ghost.'],[LF,'Bad dream.'],[R_DAD,'About what?'],[LF,'...Work.'],[R_DAD,'You\'re sixteen. What work?'],[R_MOM,'Leave him be, Bren.'],
      [null,'Bread, eggs, and something hot that might be tea. It\'s the best breakfast you\'ve had in years.'],
      [R_DAD,'The fence by the wheat is down again. Grab a post from the pile by the shed and meet me there.'],[R_MOM,'And take these eggs to Nell on your way. Blue roof, past the well.']]);
    setF('breakfast');addItem('eggs');AU.play('chest');await say(null,'Received <span class="gold">Basket of Eggs</span>.');
    await fade(1,false,350);refreshNpcs();face('mara','left');await fade(0,false,350);FD.busy=Math.max(0,FD.busy-1);return}
  if(F('dusk'))return STORY.r_supper();
  const left=[!F('nelldone')&&'Eggs to Nell.',!F('fencedone')&&'Your father\'s at the fence.'].filter(Boolean).join(' ');
  return lines([[R_MOM,left||'Go on, then.']])},
r_brenIn(){return lines([[R_DAD,'Sit. Eat. The fence isn\'t going anywhere. That\'s the problem with it.']])},

// Larkfield, the one quiet day
async r_bren(){
  if(F('fencedone'))return lines([[R_DAD,'Good work. Go see if your mother needs anything.']]);
  if(!S.keys.includes('post'))return lines([[R_DAD,'Post\'s in the pile by the shed. Bottom corner, by the barrel.']]);
  FD.busy++;await lines([[R_DAD,'There it is. Hold it straight, I\'ll get the mallet.']]);
  AU.play('door');FD.shake=6;await sleep(250);
  await lines([[null,'You push the post into the ground. It goes in like the ground is butter.'],[R_DAD,'...'],[R_DAD,'Where\'s the mallet?'],[LF,'I think we\'re okay.'],
    [R_DAD,'Your mother says you get that from me.'],[R_MOM,'(from the house) He doesn\'t!']]);
  S.keys=S.keys.filter(k=>k!=='post');setF('fencedone');MAPS.larkfield.onLoad(FD.map);AU.play('chest');FD.busy=Math.max(0,FD.busy-1);await duskCheck()},
async r_posts(){
  if(!F('breakfast'))return lines([[null,'A pile of fence posts.']]);
  if(F('fencedone')||S.keys.includes('post'))return lines([[null,'A pile of fence posts. One is enough.']]);
  addItem('post');AU.play('ok');
  await lines([[null,'You pick up a fence post. It weighs about as much as a loaf of bread.'],[LF,'...That can\'t be right.']])},
async r_nell(){
  if(F('nelldone'))return lines([[NELL,'Tell your mother thank you. And eat something, you\'re all shoulders.']]);
  if(!S.keys.includes('eggs'))return lines([[NELL,'Morning, Lift.']]);
  FD.busy++;S.keys=S.keys.filter(k=>k!=='eggs');
  await lines([[NELL,'Eggs! Your mother is an angel.'],[NELL,'You\'ve got your father\'s shoulders and your mother\'s manners. Hang on to both.'],[LF,'I\'ll try.'],[NELL,'Here. For later.']]);
  await getItem('honeycake');setF('nelldone');FD.busy=Math.max(0,FD.busy-1);await duskCheck()},
r_wynn(){if(!F('wynn1')){setF('wynn1');return lines([[WYNN,'There you are. You missed the sunrise.'],[LF,'Did I?'],[WYNN,'You come up the hill every morning to watch it. Every single morning.'],
    [LF,'...I overslept.'],[WYNN,'You\'re being weird.'],[LF,'I\'m always weird.'],[WYNN,'New weird.']])}
  return lines([[WYNN,F('dusk')?'Same time tomorrow? The hill?':'Go help your dad. I\'ll be around.'],...(F('dusk')?[[LF,'Sure.']]:[])])},
r_hale(){return lines([[HALE,'Morning, Lift. Tell your father I still owe him for the plough. He\'ll know what that means.']])},
r_tam(){return lines([[TAM,'Lift! Is it true you can lift a cow?'],[LF,'I don\'t know. I\'ve never tried.'],[TAM,'Try!'],[LF,'Maybe later.']])},
r_garrow(){return lines([[GARROW,'Morning, Lift.'],[GARROW,'Tell your father the Baron\'s tax man comes Tuesday.'],[LF,'How much was it last time?'],[GARROW,'Too much. Same as this time.']])},
async r_hood(){FD.busy++;
  await lines([[null,'He doesn\'t look at you.'],[HOOD,'Nice evening for it.'],[LF,'For what?'],[null,'He doesn\'t answer.']]);
  await walkNpc('hood',['up','up']);despawn('hood');setF('hoodgone');FD.busy=Math.max(0,FD.busy-1)},
r_well(){return lines([[null,'The village well. The water is very cold, and very clear.']])},
async r_north(){pushBack();await lines([[null,'The north road runs into the Thornwood. Nobody goes in there after dark.']])},
async r_south(){pushBack();await lines([[null,F('n1')?'Lanterns, coming up the south road. That way is no good.':'The south road goes down to the Baron\'s mill. Nothing you need down there.']])},
async r_east(){pushBack();await lines([[null,'The east road. Wheat as far as you can see.']])},
async r_noHome(){pushBack();await lines([[null,'You can\'t go back in there.']])},
r_doorWynn(){pushBack();return lines([[null,'Wynn\'s house. It smells like fresh bread.']])},
r_doorNell(){pushBack();return lines([[null,'Nell\'s door. There\'s a cat on the step that doesn\'t care about you at all.']])},
r_doorGarrow(){pushBack();return lines([[null,'The warden\'s house. A notice on the door: TAXES DUE TUESDAY.']])},
async r_supper(){FD.busy++;await fade(1,false,500);FD.x=7;FD.y=6;FD.dir='right';S.x=7;S.y=6;
  spawn({id:'bren_sup',x:8,y:6,look:'bren',dir:'left',fixed:1});face('mara','down');await fade(0,false,500);
  await lines([[R_MOM,'There he is. Sit.'],[null,'Supper is stew. Your father tells a long story about a goose. Your mother has heard it before, and laughs anyway.'],
    [R_DAD,'...and that\'s why we don\'t keep geese.'],[R_MOM,'You\'ve been quiet today, love.'],[LF,'Just thinking.'],[R_DAD,'Careful. You\'ll hurt yourself.'],
    [null,'No phone. No email. Nobody needs anything from you by seven.'],[LF,'I could get used to this.'],[R_MOM,'Used to what?'],[LF,'Nothing. This is nice.']]);
  await fade(1,false,1000);MODE='black';AU.music('');despawn('bren_sup');
  await crawl(['That night, you sleep like you haven\'t slept in years.']);
  setF('n1');await nightOfTheKnife();FD.busy=Math.max(0,FD.busy-1)},
});
async function duskCheck(){if(!F('nelldone')||!F('fencedone')||F('dusk'))return;
  FD.busy++;await sleep(300);setF('dusk');FD.map._lights=null;AU.play('bell');
  await say(null,'The sun goes down over the wheat. Somewhere, your mother is calling you in for supper.');FD.busy=Math.max(0,FD.busy-1)}

/* the night it goes wrong */
async function nightOfTheKnife(){
  loadMap('lhome',2,3,'down');FD.pose='kneel';
  spawn({id:'p_mara',x:4,y:2,look:'mara',lying:1,fixed:1});spawn({id:'p_bren',x:6,y:2,look:'bren',lying:-1,fixed:1});
  spawn({id:'hoodN',x:5,y:3,look:'stranger',dir:'down',fixed:1});
  MODE='field';await fade(0,false,1200);FD.busy++;
  await lines([[null,'A sound wakes you. Something heavy, hitting the floor.'],[null,'The fire is almost out.']]);
  FD.pose=0;face('me','right');await sleep(300);
  await lines([[null,'There\'s a man in the middle of the room. Your parents are on the floor beside him.'],[null,'They aren\'t moving.']]);
  face('hoodN','left');AU.music('sad');
  await lines([[HOOD,'...You\'re awake.'],[LF,'Who are you? What did you—'],[HOOD,'So you made it.'],[HOOD,'Good.']]);
  AU.play('clink');await say(null,'A knife skids across the floor and stops at your feet. The handle is carved with a closed eye.');
  await walkNpc('hoodN',['down','left','down','down','down','right','down']);AU.play('door');despawn('hoodN');
  await walkMe(['up','right']);face('me','right');
  await lines([[LF,'Mom?'],[LF,'Dad. Hey. Come on.'],[null,'Nothing.'],[null,'You pick up the knife. You don\'t know why.']]);
  AU.music('');AU.play('door');FD.shake=8;
  spawn({id:'gN',x:5,y:8,look:'garrow',dir:'up',fixed:1});spawn({id:'hN',x:6,y:8,look:'hale',dir:'up',fixed:1});
  FD.lights=[{x:6*16+8,y:7*16,r:46,c:'rgba(255,200,110,.6)'}];
  await Promise.all([walkNpc('gN',['up']),walkNpc('hN',['up'])]);face('me','down');
  await lines([[GARROW,'Bren? We heard—'],[null,'Garrow sees them. Then he sees you.'],[GARROW,'Lift. Put the knife down.'],
    [LF,'There was a man. He just walked out. You had to see him.'],[HALE,'There\'s nobody out there, Garrow.'],[GARROW,'Put it down, son.'],
    [LF,'I didn\'t do this.'],[GARROW,'Then put it down, and we\'ll talk.'],[null,'You\'ve been in this world for one day.'],[null,'You run.']]);
  AU.play('swirl');await fade(1,false,300);despawn('gN');despawn('hN');despawn('p_mara');despawn('p_bren');FD.lights=null;
  loadMap('larkfield',4,15,'up');AU.music('raid');await fade(0,false,300);mapToast('Larkfield');
  await lines([[GARROW,'(behind you) LIFT! STOP!']]);
  FD.busy=Math.max(0,FD.busy-1);saveGame(0);
  await say(null,'<span class="small">Run north, for the Thornwood.</span>')}

Object.assign(STORY,{
r_watch(){return lines([['Watchman','Stay where you are!']])},
async r_escape1(){face('me','up');FD.busy++;
  await lines([['Watchman','That\'s him! The Ashby boy!'],['Watchman','Drop the knife!'],[LF,'I\'m sorry. I really am.']]);
  const r=await startBattle(['watchman','watchman'],{bg:'nighttown',noFlee:1});if(r==='lose'){FD.busy=Math.max(0,FD.busy-1);return}
  await lines([[null,'They\'re breathing. You didn\'t hit them as hard as you could have.'],[LF,'Sorry.']]);
  setF('esc1');refreshNpcs();FD.busy=Math.max(0,FD.busy-1)},
async r_escape2(){FD.busy++;face('me','up');
  spawn({id:'wynnN',x:11,y:1,look:'wynn',dir:'down',fixed:1});await walkNpc('wynnN',['down']);
  await lines([[WYNN,'Lift?'],[WYNN,'They\'re saying you—'],[LF,'I didn\'t.'],[null,'She looks at you for a long time.'],[WYNN,'...I know.'],[WYNN,'Go. Before Garrow gets here.']]);
  face('wynnN','left');{const p=[];let x=FD.x;while(x>10){p.push('left');x--}while(x<10){p.push('right');x++}if(p.length)await walkMe(p)}
  await walkMe(['up','up','up']);await fade(1,false,900);MODE='black';AU.music('');despawn('wynnN');
  await crawl(['You run until the lights of Larkfield are gone.','You sleep in a ditch. It\'s cold.','In the morning, there\'s a notice nailed to every tree on the road.']);
  S.bounty=300;addItem('poster');await showPoster();
  await crawl(['"Dead or alive."','...It isn\'t even a good drawing.']);
  FD.busy=Math.max(0,FD.busy-1);await STORY.r_camp()},

/* ===================== CHAPTER 1: Wanted ===================== */
async r_camp(){
  await crawl(['Three months later.']);await chapterTitle(1,'WANTED');
  const h=S.heroes.lift;if(h.lv<7){h.lv=7;h.exp=expFor(7)}healAll();setF('c1');
  loadMap('camp',15,5,'down');face('jun','up');MODE='field';AU.music('camp');await fade(0,false,900);mapToast('Crows\' Camp');FD.busy++;
  await lines([[JUN,'You talk in your sleep.'],[LF,'What do I say?'],[JUN,'"Let\'s circle back on that." What\'s circling back?'],[LF,'...A curse. A really old one.'],[JUN,'Rook wants you. Red tent.']]);
  face('jun','left');FD.busy=Math.max(0,FD.busy-1);saveGame(0);
  await say(null,'<span class="small">Your Wanted Poster is in your Items. Choose it to look.</span>')},
async r_rook(){
  if(!F('job1')){FD.busy++;
    await lines([[ROOK,'There he is. Sleep well?'],[LF,'Not really.'],[ROOK,'Good. Means you\'re still a person.'],
      [ROOK,'The Baron\'s tax wagon comes through Hangman\'s Bend tonight. South road. I want the strongbox.'],[ROOK,'Nobody gets hurt that doesn\'t have to. Take Jun.']]);
    const j=npc('jun');if(j){j.fixed=1;j.x=FD.x+1;j.y=FD.y;j.ox=j.oy=0}face('jun','left');
    await lines([[JUN,'I was going anyway.']]);
    despawn('jun');joinR('jun');AU.play('level');await say(null,'<span class="gold">Jun joins you.</span>');
    setF('job1');refreshNpcs();FD.busy=Math.max(0,FD.busy-1);saveGame(0);return}
  if(!F('wagon'))return lines([[ROOK,'Hangman\'s Bend. South road. Don\'t make me come and get you.']]);
  if(!F('hound'))return lines([[ROOK,'Well? Where\'s my box?']]);
  if(!F('c1done'))return STORY.r_c1End();
  if(!F('c2'))return STORY.r_c2Start();
  if(!F('kell'))return lines([[ROOK,'Greyford. The tollhouse. Find out who signs with that eye, and come back in one piece.']]);
  return lines([[ROOK,'A Returner, he said. Hm.'],[ROOK,'Get some sleep. All of you.']])},
async r_c1End(){FD.busy++;
  await lines([[ROOK,'The box. Good.'],[null,'You hand her the letter too.'],[null,'Rook reads it. Then she reads it again.'],[ROOK,'Where did you get this?'],
    [LF,'It was in the box. It has the same mark as the knife.'],[ROOK,'...Burn it.'],[LF,'I\'d rather not.'],[ROOK,'Then keep it somewhere I can\'t see it.'],
    [ROOK,'And Lift. People who sign with that eye don\'t lose things. They come back for them.']]);
  setF('c1done');await raiseBounty(1200,'Runs with the Crows. Uses strange powers.');
  await lines([[LF,'"Strange powers."'],[LF,'...That\'s fair.']]);
  FD.busy=Math.max(0,FD.busy-1);saveGame(0);
  await chapterEnd(1,'Talk to Rook when you\'re ready for Chapter 2.')},
r_jun(){return lines([[JUN,'Rook wants you. Red tent.']])},
async r_moss(){if(!F('mossbowl')){setF('mossbowl');healAll();AU.play('heal');
    await lines([[null,'Moss hands you a bowl of stew. He doesn\'t say anything.'],[null,'It\'s really good.']]);return getItem('stew')}
  return lines([[null,'Moss nods at you. That\'s a lot, for Moss.']])},
async r_pike(){if(!F('job1'))return lines([[PIKE,'Rook wants you before you go anywhere.']]);
  return lines([[PIKE,F('hound')?'You beat the man with the dogs? Huh. I owe Sprout a coin.':'Big man with dogs in the woods this week. A hunter. Watch yourself.']])},
async r_leaveCamp(){pushBack();await lines([[PIKE,'Rook wants you before you go anywhere.']])},
r_wick(){return shop('Wick','Stolen fair and square.',['tonic','deeptonic','pearlwater','clearwater','crowcoat',...(F('hound')?['crowknives','felleraxe','ironsword']:[])])},
r_sprout(){return lines([['Sprout','Is it true you killed a man with your bare hands?'],[LF,'No.'],['Sprout','Oh.'],['Sprout','...Could you?'],[LF,'Go to bed, Sprout.']])},
r_crowA(){return lines([['Crow','Rook took me in when I was your age. She does that.'],['Crow','Then she makes you carry things. She does that too.']])},
r_crowB(){return lines([['Crow','You\'re the Larkfield boy? You don\'t look like a killer.'],[LF,'Thanks. I think.']])},
r_fire(){return restHere('The campfire. Rest a while?')},
r_crates(){return lines([[null,'Crates of things the Baron used to own.']])},
r_tentRook(){return lines([[null,'Rook\'s tent. You don\'t go in Rook\'s tent.']])},
r_tentLift(){return lines([[null,'Your tent. Three months, and it still smells like somebody else.']])},
r_tent3(){return lines([[null,'Snoring. A lot of it.']])},

// Hangman's Bend
r_bendFire(){return restHere('An old Crows\' fire ring. Rest a while?')},
async r_southBlock(){pushBack();await lines([[LF,'That road goes to Greyford. Not tonight.']])},
async r_southBlock2(){pushBack();await lines([[LF,'That road goes back toward Larkfield.'],[LF,'...Not yet.']])},
r_wagonTalk(){return lines([[null,'The Baron\'s tax wagon. A red seal on the side.']])},
r_tg(){return lines([['Toll Guard','Keep moving.']])},
async r_ambush(){FD.busy++;face('me','down');AU.music('');
  await lines([[JUN,'Two guards. Easy.'],[LF,'Let me try asking first.'],[JUN,'...Sure. Ask.']]);
  face('tg1','up');face('tg2','up');
  await lines([[LF,'Evening. We\'re going to need the box.'],['Toll Guard','You\'re—'],['Toll Guard','That\'s the Larkfield boy. From the posters.'],[LF,'Yeah. Sorry about that.'],
    ['Toll Sergeant','(from the wagon) Three hundred coins, standing right there. Get him!'],[JUN,'See? Asking.']]);
  const r=await startBattle(['tollguard','tollcapt','tollguard'],{bg:'forest',noFlee:1});if(r==='lose'){FD.busy=Math.max(0,FD.busy-1);return}
  await Promise.all([walkNpc('tg1',['down','down','left','left']),walkNpc('tg2',['down','down','right','right'])]);despawn('tg1');despawn('tg2');
  await lines([[null,'The guards run. The driver is already gone.'],[null,'The strongbox is heavy. Coins, and one letter, sealed in black wax.'],[null,'The seal is a closed eye.'],
    [LF,'...That\'s the same mark.'],[JUN,'Same as what?'],[LF,'The knife.'],[JUN,'...Oh.'],[JUN,'The night you didn\'t do it.'],[LF,'The night I didn\'t do it.'],
    [null,'"The boy is loose. Bring him in alive."'],[LF,'Alive.'],[JUN,'Everybody wants you alive. It\'s on your poster.'],[LF,'The poster says dead or alive.'],[JUN,'...Half of everybody, then.']]);
  await getItem('eyeletter');S.gold+=120;AU.play('chest');await say(null,'You keep the guards\' purses. <span class="gold">120 coins</span>.');
  setF('wagon');refreshNpcs();await lines([[JUN,'Back to camp. Rook will want this.']]);
  FD.busy=Math.max(0,FD.busy-1);AU.music('road');saveGame(0)},
async r_garrick(){FD.busy++;face('me','up');AU.music('');
  await say(null,'Dogs. Close, and getting closer.');
  spawn({id:'garr',x:6,y:7,look:'garrickF',dir:'down',fixed:1});spawn({id:'hd1',x:5,y:7,mon:['wolf','hound'],fixed:1});spawn({id:'hd2',x:8,y:7,mon:['wolf','hound'],fixed:1});
  AU.play('swirl');await Promise.all([walkNpc('garr',['down','down','right','right']),walkNpc('hd1',['down','down','down']),walkNpc('hd2',['down','down','right','right'])]);
  {const p=[];let x=FD.x;while(x<8){p.push('right');x++}while(x>8){p.push('left');x--}if(p.length)await walkMe(p);face('me','up')}
  AU.music('boss');
  await lines([[GARRICK,'Lift of Larkfield.'],[GARRICK,'Three hundred coins. I\'ve been on your trail for a week.'],[LF,'Sorry. I didn\'t know anyone was following.'],
    [GARRICK,'They never do. Come quietly, and the girl walks.'],[JUN,'The girl has knives.'],[GARRICK,'So I see.'],
    [LF,'I didn\'t kill them.'],[GARRICK,'They all say that.'],[LF,'I know. That\'s the annoying part.']]);
  const r=await startBattle(['hound','garrick','hound'],{bg:'forest',noFlee:1,music:'boss'});if(r==='lose'){FD.busy=Math.max(0,FD.busy-1);return}
  AU.music('');
  {const n=npc('garr');if(n)n.pose='kneel'}
  await lines([[null,'Garrick goes down on one knee. His dogs whine, and back away.'],[null,'Something comes off him like heat off a road. Grey, and fast.'],[null,'It goes straight into you.']]);
  await takeForm('hound','garr',['#ffe2a0','#e8a822','#ffffff','#c8b08a']);
  await lines([[null,'Your heart is going very fast. You can smell everything. The dogs. Rain, an hour away. Jun\'s fear.'],
    [JUN,'Lift? Your eyes.'],[LF,'What about them?'],[JUN,'They\'re yellow.'],[GARRICK,'...What are you?'],[LF,'Honestly? I don\'t know.'],
    [GARRICK,'Keep it. Whatever you took.'],[GARRICK,'I\'m done with this job.']]);{const n=npc('garr');if(n)n.pose=0}
  await Promise.all([walkNpc('garr',['up','up','left','up','up']),walkNpc('hd1',['up','up','up','up']),walkNpc('hd2',['up','up','up','up','up'])]);despawn('garr');despawn('hd1');despawn('hd2');
  await say(null,'<span class="gold">You took Garrick\'s power: Hound Form.</span>');
  await say(null,'<span class="small">Change forms from the menu (Forms), or press SELECT on the map. Each form has its own look, its own special and its own ult. You can\'t change in battle.</span>');
  setF('hound');AU.music('road');FD.busy=Math.max(0,FD.busy-1);saveGame(0)},

/* ===================== CHAPTER 2: Greyford ===================== */
async r_c2Start(){FD.busy++;
  await lines([[ROOK,'That letter came out of the tollhouse at Greyford. If you\'re going to chase that eye, you\'ll need more than Jun.'],[ROOK,'Moss. You\'re going with them.']]);
  const m=npc('moss');if(m){m.x=FD.x+1;m.y=FD.y;m.ox=m.oy=0}face('moss','left');await sleep(300);
  await lines([[null,'Moss nods.'],[JUN,'He talks, you know. Just not to people he doesn\'t like.'],[LF,'Does he like me?'],[JUN,'Hard to say. He\'s never talked to me either.']]);
  despawn('moss');joinR('moss');AU.play('level');await say(null,'<span class="gold">Moss joins you.</span>');
  await getItem('rooksmap');setF('c2');refreshNpcs();FD.busy=Math.max(0,FD.busy-1);saveGame(0);
  await chapterTitle(2,'GREYFORD');
  await say(null,'<span class="small">Greyford is down the south road, past the Bend, then east.</span>')},
async r_c2road(){setF('c2road');await lines([[JUN,'The Baron\'s road. Keep your head down.']])},
r_waystation(){return lines([[null,'A burned waystation. Someone has scratched into the door: TAXED TO DEATH.']])},
async r_gfArrive(){face('me','right');face('gguard','up');
  if(S.form==='base'){pushBack();FD.busy++;
    await lines([['Gate Guard','Hold on.'],['Gate Guard','You look familiar.'],[LF,'I get that a lot.'],['Gate Guard','...Come closer. Into the light.']]);
    await lines([[JUN,'(quietly) Your face is on every wall in this town. Maybe wear a different one.']]);
    FD.busy=Math.max(0,FD.busy-1);return}
  FD.busy++;await lines([['Gate Guard','Move along.']]);
  if(!F('ingf'))await lines([[JUN,'He didn\'t even look twice.'],[LF,'I didn\'t know that would work.'],[JUN,'Neither did I.']]);
  setF('ingf');FD.busy=Math.max(0,FD.busy-1);saveGame(0)},
r_gateGuard(){return lines([['Gate Guard',F('ingf')?'Move along.':'State your business.']])},
async r_gfTrail(){if(S.form!=='hound'){if(!F('trailhint')){setF('trailhint');
      return lines([[JUN,'So where do we start?'],[LF,'I can\'t exactly ask around.'],[JUN,'Garrick found you by your smell. Maybe you can find him the same way.']])}return}
  FD.busy++;setF('trail');AU.play('moon');
  await lines([[null,'That smell.'],[null,'Smoke, and something sweet. Like the night in Larkfield.'],[LF,'He was here.'],[JUN,'Who?'],[LF,'The man in the hood.'],
    [null,'The scent runs past the market, up the alley, and under a little door in the back of the tollhouse.']]);
  FD.busy=Math.max(0,FD.busy-1)},
async r_backDoor(){pushBack();
  if(!F('trail'))return lines([[null,'A small door in the back wall of the tollhouse. Locked.']]);
  if(!F('kell')&&!F('doorOpen')){FD.busy++;await lines([[null,'The scent goes under the door.'],[null,'Moss puts his shoulder against it. It isn\'t locked anymore.']]);setF('doorOpen');FD.busy=Math.max(0,FD.busy-1)}
  await goto('tollhouse',7,12,'up')},
async r_frontGate(){pushBack();await lines([['Toll Guard','Tollhouse is closed. Pay at the window.'],['Toll Guard','There is no window.']])},
r_frontGuard(){return lines([['Toll Guard','Taxes are paid inside. Nobody goes inside.']])},
r_gfPeddler(){return shop('Peddler','Don\'t tell the Baron what I charge.',['tonic','deeptonic','pearlwater','clearwater'])},
r_gfSmith(){return shop('Brenna','Iron. It holds.',['greysteel','crowknives','felleraxe','mailshirt'])},
async r_gfInn(){const ok=await inn('Ma Dorne',20);if(ok){const v=await ask(null,'Save your journey?',['Save','Not now'],{cancel:1});if(v===0)await menuSave()}},
r_gfMan(){return lines([['Townsman','The Baron\'s man took my cow for back taxes. The cow didn\'t owe anything.']])},
r_gfWoman(){return lines([['Townswoman',F('freed')?'My brother came home last night. He says a big man pulled the door off his cell.':'They lock people in the tollhouse when they can\'t pay. My brother\'s been in there a month.']])},
r_gfKid(){return lines([['Kid','Are you a bandit? You look like a bandit.'],[LF,'What does a bandit look like?'],['Kid','Like you.']])},
r_gfOld(){return lines([['Old Woman','There\'s a man who visits the tollhouse at night. Tall. Hooded.'],['Old Woman','He walks right under the lamps, and there\'s nothing on the ground behind him.']])},
async r_gfBoard(){await lines([[null,'The notice board. Your face is on it four times.'],[LF,'...It\'s not a great likeness.'],[JUN,'It\'s a little generous, honestly.']])},
r_gfWell(){return lines([[null,'A fountain. Somebody threw a coin in. Somebody else is fishing it out.']])},
async r_gfDoor(){pushBack();await lines([[null,'Locked. Greyford keeps its doors locked.']])},
async r_gfInnDoor(){pushBack();await lines([[null,'The inn. Ma Dorne runs it from the front step.']])},

// the tollhouse
r_debtor(){return lines(F('freed')?[['Prisoner','Thank you.']]:[['Prisoner','You\'re not a guard.'],[LF,'No.'],['Prisoner','Then what are you?'],[LF,'Still working that out.']])},
r_kellTalk(){return lines([[KELL,'...']])},
async r_kell(){FD.busy++;face('me','up');AU.music('');
  {const p=[];let x=FD.x;while(x<7){p.push('right');x++}while(x>7){p.push('left');x--}if(p.length)await walkMe(p);face('me','up')}
  await lines([[KELL,'The Larkfield boy.'],[KELL,'You\'re smaller than your poster.'],[LF,'Everyone\'s smaller than their poster.'],
    [KELL,'You broke into the Baron\'s tollhouse with a thief and a woodcutter.'],[JUN,'Technically Moss broke in. We just walked.'],
    [LF,'Let the prisoners go, and we\'ll leave.'],[KELL,'They owe the Baron.'],[LF,'Then the Baron can come and get them.']]);
  AU.music('boss');
  const r=await startBattle(['keepguard','kell','keepguard'],{bg:'cave',noFlee:1,music:'boss'});if(r==='lose'){FD.busy=Math.max(0,FD.busy-1);return}
  AU.music('');despawn('kg1');despawn('kg2');{const k=npc('kell');if(k){k.pose='kneel'}}
  await lines([[null,'Sir Kell drops his mace. The floor shakes.'],[null,'His armor doesn\'t come off. Something under it does.'],[null,'It\'s cold and heavy, like iron in winter. It sinks into you, and it stays.']]);
  await takeForm('iron','kell',['#ffffff','#dfe6f2','#9aa4b8','#c8ccd8']);
  await lines([[JUN,'You\'re... shiny.'],[LF,'Is that bad?'],[JUN,'It\'s a lot.'],
    [KELL,'You\'re one of them.'],[LF,'One of what?'],[KELL,'A Returner. Somebody who died somewhere else and woke up here.'],[null,'Your mouth goes dry.'],
    [KELL,'The Baron has a guest. He said one would wake in Larkfield this autumn. He said it would look like a boy.'],[LF,'What guest?'],
    [KELL,'Tall. Hooded. He walks under the lamps, and there\'s no shadow on the ground behind him.'],[KELL,'I always thought that was a figure of speech.']]);
  {const k=npc('kell');if(k){k.pose=0;k.lying=1}}AU.play('hit');await say(null,'Sir Kell passes out.');
  AU.play('door');FD.shake=10;await sleep(300);AU.play('door');
  await lines([[null,'Moss pulls the cell doors off. All of them.']]);
  for(const id of ['deb1','deb2','deb3']){const n=npc(id);if(n)n.fixed=1}
  await Promise.all([walkNpc('deb1',['down','down','right','right','right','right','down','down','down','down','down','down','down']),walkNpc('deb2',['down','down','down','down','down','down','down','down','down','down','down']),walkNpc('deb3',['down','down','left','left','left','left','down','down','down','down','down','down','down'])]);
  despawn('deb1');despawn('deb2');despawn('deb3');
  await lines([[MOSS,'Go home.'],[JUN,'He talks!'],[MOSS,'...Sometimes.']]);
  setF('kell');setF('freed');despawn('kell');refreshNpcs();AU.music('sad');
  await raiseBounty(3000,'Broke into the Greyford tollhouse. Do not approach.');
  await lines([[LF,'"Broke into." The door was open.'],[JUN,'Moss opened it.'],[LF,'...Fair.'],[LF,'A Returner.'],[LF,'So there are others.']]);
  FD.busy=Math.max(0,FD.busy-1);saveGame(0);
  await chapterEnd(2,'Chapter 3 comes in a later update.')},
});
