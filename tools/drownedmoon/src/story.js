/* ===================== STORY: scenes and conversations ===================== */
const M='Marin',PE='Pell',YS='Ysolde',CO='Corvane';
const npc=id=>FD.npcs.find(n=>n.id===id);
function spawn(def){const n={hx:def.x,hy:def.y,ox:0,oy:0,dir:'down',wt:999,mv:0,visible:true,...def};FD.npcs.push(n);return n}
function despawn(id){FD.npcs=FD.npcs.filter(n=>n.id!==id)}
async function walkNpc(id,path){const n=npc(id);if(!n)return;for(const d of path){const [dx,dy]=DIRS[d];n.dir=d;n.x+=dx;n.y+=dy;n.mv=1;n.mvp=0;n.ox=-dx*16;n.oy=-dy*16;while(n.mv)await frames(1)}}
async function walkMe(path){for(const d of path){const [dx,dy]=DIRS[d];FD.dir=d;pushTrail(FD.x,FD.y);FD.x+=dx;FD.y+=dy;FD.moving=1;FD.mp=0;FD.scripted=1;FD.boatMove=0;FD.ox=-dx*16;FD.oy=-dy*16;while(FD.moving)await frames(1)}FD.scripted=0;S.x=FD.x;S.y=FD.y}
function face(id,d){if(id==='me')FD.dir=d;else{const n=npc(id);if(n)n.dir=d}}
async function flash(){AU.play('bell');await fade(1,true,180);await fade(0,true,500)}
async function getItem(id,n=1){addItem(id,n);AU.play('chest');await say(null,`Received <span class="gold">${itemName(id)}</span>${n>1?' ×'+n:''}.`)}
async function join(id){const lv=Math.max(S.heroes.marin.lv,id==='pell'?3:7);S.heroes[id]=mkHero(id,lv);S.party.push(id);AU.play('level');await say(null,`<span class="gold">${HEROES[id].name}</span> joins the party!`)}
function nearestWater(x,y){const m=MAPS.world;let best=null,bd=1e9;for(let yy=y-6;yy<=y+6;yy++)for(let xx=x-6;xx<=x+6;xx++){const ch=tileAt(m,xx,yy);if(sailOK(ch,'flood')&&ch!=='w'&&ch!=='u'){const d=Math.abs(xx-x)+Math.abs(yy-y);if(d<bd){bd=d;best=[xx,yy]}}}return best}
async function boss(id,opt={}){const r=await startBattle([id],{boss:1,bg:opt.bg||FD.map.bg,...opt});return r==='win'}
function pushBack(){FD.x=FD.px;FD.y=FD.py;S.x=FD.x;S.y=FD.y}

const STORY={
/* ---------- opening ---------- */
async intro(){
  MODE='black';AU.music('title');
  const crawl=['Seven years ago, the moon fell into the sea.',
    'It did not sink quietly. The tides ran wild, the low islands went under, and half the world\'s people were lost to the water.',
    'No one remembers their faces now. The sea took the names, too.',
    'Every night since, the tide has climbed a little higher.',
    'And at low water, the fishers of Saltmere swear they see ghosts walking the seabed...'];
  for(const t of crawl){const w=win('',`<div style="text-align:center;line-height:1.5">${t}</div>`,{left:'8%',right:'8%',top:'38%',background:'none',border:'0',boxShadow:'none',zIndex:'5'});w.style.opacity=0;w.style.transition='opacity .8s';
    await frames(2);w.style.opacity=1;uiCount++;await Promise.race([sleep(3600),new Promise(r=>{const off=pushInput(b=>{if(b==='a'||b==='start'){off();r()}});setTimeout(off,3700)})]);uiCount--;w.style.opacity=0;await sleep(800);w.remove()}
  loadMap('home',3,3,'down');FD.busy++;await fade(1,false,0);MODE='field';AU.music('town');await fade(0,false,900);
  await say('Gran Tilly','Marin. Marin, wake up. The sea\'s at the door again.');
  face('me','right');
  await say(M,'...Higher than last night?');
  await say('Gran Tilly','Past the bell-mark. Old Hask rang for you. He wants his best diver.');
  await walkNpc('tilly',['left']);
  await say('Gran Tilly','Here. Your mother\'s lantern. You\'re old enough now, and I\'m too old to be afraid of it.');
  await getItem('lantern');
  await say(M,'It\'s never been lit, Gran.');
  await say('Gran Tilly','No. But it\'s never been cold, either. Go on. The Elder\'s Hall, across the lane.');
  setF('lantern');await walkNpc('tilly',['right']);npc('tilly').dir='left';FD.busy=Math.max(0,FD.busy-1);
  await say(null,'<span class="small">D-pad moves · A talks and checks · START opens the menu</span>');
},
tilly(){if(F('ysolde'))return lines([['Gran Tilly','Who\'s your friend, Marin? ...Pale as milk, that one. Pale as your mother was, at the end.']]);
  if(F('pell'))return lines([['Gran Tilly','You\'ve got a boat now? With a salvager? Your mother would laugh herself silly.']]);
  if(F('tidepower'))return lines([['Gran Tilly','The water went out of the lane an hour ago. All at once, like a breath. That was you. I know it was.']]);
  return lines([['Gran Tilly','The Elder\'s Hall is the blue roof across the lane. Mind the puddles.']])},
async hask(){
  if(!F('hask')){
    await lines([['Elder Hask','Marin. Good. Shut the door, the damp\'s getting into my knees.'],
      ['Elder Hask','The bell in the Old Steps rang tonight. No hand pulled it. That bell has hung under this island since before Saltmere had a name.'],
      ['Elder Hask','The Steps go down to the old sea floor. When the moon fell they flooded, and we sealed them. Now the tide climbs every night, and something down there is ringing.'],
      ['Elder Hask','I want to know what. You dive deeper than anyone here, and that lantern is yours by right. Your mother went down those steps once.'],
      [M,'My mother did? You never told me that.'],
      ['Elder Hask','I never told anyone. Take the east path out of the village, past the palms. The Steps are on the rocks. Here, take these. And the seal-key.']]);
    await getItem('tonic',3);setF('hask');await say(null,'The Old Steps are unsealed.');return}
  if(F('grief'))return lines([['Elder Hask','You remember her now. Your sister. ...So do I. Ysolde. She used to sing on the hall steps. How did we all forget?']]);
  if(F('pell'))return lines([['Elder Hask','A tide-caller, sailing with a salvager. Go carefully, child. Gullwick is north, and the Admiral likes to own things.']]);
  if(F('warden'))return lines([['Elder Hask','The bell is quiet. Good. Now come home and tell me what you saw.']]);
  return lines([['Elder Hask','The Steps are east, past the palms. Be careful down there.']])},
saltScholar(){return lines([[ 'Tide-Reader',F('tidepower')?'You MOVED the tide? ...Pass me my quill. No. Pass me something stronger than my quill.':'The charts make no sense. The moon is in the sea, so the sea pulls toward it. Toward the middle. And every night, the middle gets heavier.']])},
saltFisher(){return lines([['Fisher',F('tidepower')?'Low water at midnight, when it should be high. Was that you? Do it again on Thursdays.':'Three boats I\'ve lost to the high water this month. Three!']])},
saltWife(){return lines([['Net-Mender','At low water I see them out on the flats. Pale folk, walking. They never come close. My mother says they\'re the drowned, looking for the ones they left.']])},
saltKid(){return lines([['Kid','If you see a ghost you have to say its name, or it follows you home. But nobody knows their names. So... run?']])},
saltDrunk(){return lines([['Old Sailor','The moon\'s down there, I tell you. I saw it glowing under the water once. Like a lamp left on in a cellar.']])},
saltBell(){return lines([[null,'The village bell. The tide-mark is cut into its post. Three nights ago the sea passed it.']])},
innSaltmere(){return inn('Innkeeper',10)},
shopSaltmere(){return shop('Merchant','Tonics, charms, sharkskin! Everything a diver needs, and some things she doesn\'t.',['tonic','clearwater','pearlwater','sharkskin','luckyshell'])},

/* ---------- world entrances ---------- */
async enter_saltmere(){await goto('saltmere',8,1,'down')},
async enter_steps(){if(!F('hask')){await say(M,'The Old Steps. Sealed with iron and salt. Elder Hask keeps the key.');pushBack();return}await goto('steps',7,28,'up')},
async enter_gullwick(){
  if(F('spire')&&!F('reveal')){await goto('gullwick',10,13,'down');await STORY.reveal();return}
  await goto('gullwick',10,13,'up');
  if(!F('gullwick')){setF('gullwick');await lines([[PE,'Gullwick. More cannons than fish. The Admiralty\'s the big house at the top.']])}},
async enter_nethra(){
  if(S.tide!=='ebb'){if(!F('nethrahint')){setF('nethrahint');await say(null,'Far below the hull, through the green water, you can see towers. At low water you could walk down there.')}return}
  if(!F('commission')){await lines([[PE,'Ruins under the flats. Pretty. Not paying, though.'],[PE,'Gullwick first. The Admiral pays for this kind of thing, and I\'d like to be paid.']]);pushBack();return}
  await goto('nethra',9,19,'up')},
async enter_spire(){
  if(!F('ysolde')){await say(null,'Coral has grown over the door, thick as a wall. When you touch it, it shivers, as if it\'s listening for something.');pushBack();return}
  if(!F('spireopen')){setF('spireopen');await say(YS,'Let me.');await say(null,'Ysolde hums three low notes. The coral uncurls like fingers.')}
  await goto('spire',8,27,'up')},
async enter_lighthouse(){
  if(!F('reveal')){await say(null,'Grey Rock Light. Dark for years, and the door is barred from inside.');await say(M,'...I know this door. I don\'t know how.');pushBack();return}
  await goto('lh1',6,11,'up')},
async enter_moonscar(){
  if(!F('grief')){await say(null,'The whirlpool grabs the Gull\'s Debt and flings it back out.');await say(PE,'Not without a better idea!');pushBack();return}
  if(!F('calm')){await say(YS,'Hold the boat steady. I remember it now.');AU.music('');AU.play('bell');await say(null,'Ysolde sings the Tide-Hymn. The whirlpool slows... and opens, like an eye.');setF('calm')}
  await goto('moonscar',8,25,'up')},

/* ---------- the Old Steps ---------- */
poolHint(){setF('poolhint');return lines([[M,'Flooded to the roof. Too deep and too cold to swim, even for me.'],[M,'There\'s a passage to the west. Something down there is glowing.']])},
async altar(){
  if(F('tidepower'))return say(null,'The altar is dark now. Its light lives in the lantern.');
  await say(null,'An old altar. A pale stone is set into it, the same kind as the shard in Mother\'s lantern.');
  await say(null,'The lantern grows warm in your hands...');
  await flash();
  await say(null,'The shard wakes. You can feel the whole sea, as if it were on the end of a thread.');
  await say(M,'I could pull it. I could pull the whole sea back.');
  setF('tidepower');
  await say(null,'<span class="gold">Marin can call the tide.</span> Press <b>SELECT</b> to switch between Flood and Ebb.');
  await say(null,'Ebb drains pools and shallows so you can walk them. Flood floats drift logs into bridges, and lets boats sail.');
  await say(null,'In battle, Marin\'s <span class="gold">Turn Tide</span> does the same. Drowned things are fierce at Flood and soft at Ebb.')},
async wispTalk(){setF('wispseen');const n=npc('wisp1');if(!n)return;
  face('wisp1','down');await say('Drowned Wisp','...!');
  await say('Drowned Wisp','A Pale One! A Pale One in the Steps! Run, run!');
  await walkNpc('wisp1',['up','up']);despawn('wisp1');
  await say(M,'A ghost. And it was afraid of me?')},
async wardenFight(){
  if(F('warden'))return;
  await say(null,'Something huge shifts in front of the bell. Barnacled armor. Claws like anchors.');
  await say(M,'It\'s guarding the bell. Or the bell is guarding it.');
  if(!await boss('warden',{bg:'cave'}))return;
  setF('warden');refreshNpcs();
  await say(null,'The Warden sinks into the dark water. Beyond the bell, a tunnel climbs toward the sound of surf.')},

/* ---------- Pell ---------- */
async pellMeet(){if(F('pell'))return;
  face('me','down');
  await lines([['???','Oi! Lantern! Over here!'],
    ['Salvager','Saw your light coming up the tunnel. Saw the sea go out, too, back in the Steps. Did you do that?'],
    [M,'...Yes.'],
    ['Salvager','Then you are the most valuable person I have ever met. Pell. Pell Varga. Salvager, harpooner, and owner of the Gull\'s Debt.'],
    [PE,'I owe money to everyone who owns a gull. But the Admiral in Gullwick pays good coin to anyone who\'ll dive the ghost-flats.'],
    [PE,'With your trick, we\'d clean up. Half and half.'],
    [M,'I need to know why the tide keeps rising. And who rang that bell.'],
    [PE,'Then come to Gullwick. If anyone knows what the sea\'s up to, it\'s Corvane. Man\'s been staring at it for seven years.']]);
  await join('pell');S.boat=1;setF('pell');despawn('pellObj');
  await fade(1,false,500);
  const w=nearestWater(...WORLD_POS.steps)||[16,33];S.tide='flood';loadMap('world',w[0],w[1],'up');AU.music('sea');await fade(0,false,500);
  await lines([[PE,'Gullwick is north, across open water. When we\'re at sea, the boat goes where the water goes.'],
    [null,'<span class="small">Sail at Flood. Ebb only works over shallows and dry land; the deep sea won\'t draw back.</span>']])},

/* ---------- Gullwick ---------- */
gullGuard(){return lines([['Guard',F('commission')?'The Admiral\'s business is the sea\'s business.':'The Admiral sees no one. ...Saltmere, you say? With a lantern that\'s lit? Go in. Quickly.']])},
gullSailor(){return lines([['Sailor','Corvane hasn\'t slept since the Fall. They say he walks out on the flats every low water and just... looks.']])},
gullWife(){return lines([['Townswoman','The tide was in my kitchen this morning. I made soup. You have to keep your spirits up.']])},
gullScholar(){return lines([['Scholar','There are two tides now. The one the sea makes, and the one the moon makes from underneath. The moon\'s tide is winning.']])},
gullKid(){return lines([['Kid','The Admiral\'s ship has a chain on it as thick as a man! I bet it\'s for pulling something up out of the sea.']])},
gullOld(){return lines([['Old Keeper',F('grief')?'The Light is burning on Grey Rock! I\'d forgotten how it looked. I\'d forgotten a lot of things.':'Grey Rock Light went dark the night the moon fell. The family that kept it... I forget. Funny. I knew them well.']])},
cartographer(){if(F('reveal'))return lines([['Cartographer','Grey Rock is north-east. A reef rings it, so no boat gets in. You\'d have to walk the reef at low water. Mad, but you\'re that kind.']]);
  if(F('nethra'))return lines([['Cartographer','The Coral Spire is south-east, past the shallows. Reef all around it. No boat gets close. Low water, maybe.']]);
  return lines([['Cartographer','Every chart I draw is wrong by morning. The Great Shallows east of here are a city at low water. I\'ve seen the towers.']])},
innGullwick(){return inn('Innkeeper',30)},
shopGullwick(){return shop('Quartermaster','Navy surplus. Don\'t ask where it fell off.',['tonic','deeptonic','pearlwater','clearwater','moonsalt','tidebomb'])},
armsGullwick(){return shop('Armorer','Blades, harpoons, mail. Iron sinks, but it sinks slower than you.',['coraldirk','ironharpoon','shellmail','saltcharm','wakebead','luckyshell'])},
admGuard(){return lines([['Guard','Stand straight in the Admiralty.']])},
admClerk(){return lines([['Clerk','The Admiral orders chain. Miles of it. Every month. I don\'t ask what for.']])},
async corvane(){
  if(F('commission'))return lines([[CO,'The shallows are east. At low water, find their heart and tell me where it beats.']]);
  await lines([[CO,'So. Hask\'s girl from Saltmere. And her lantern is lit.'],
    [CO,'I am Corvane, Admiral of what\'s left of the fleet. Seven years I\'ve watched the sea climb our walls.'],
    [CO,'My scholars say the drowned, the ghosts on the shallows, are hauling the moon deeper, and the tide follows it up our streets.'],
    [CO,'East of here, under the Great Shallows, lies a city. At low water you can see its towers, but no one can reach it. Except, perhaps, someone who carries low water in a lamp.'],
    [M,'You want me to go down there.'],
    [CO,'I want to know what moves them. Take my writ. My sailors will let you pass. And five hundred pearls for the trouble.'],
    [PE,'Make it six hundred and I\'ll stop eyeing your silverware.'],
    [CO,'...Six hundred.']]);
  await getItem('commission');S.gold+=600;AU.play('buy');await say(null,'Received <span class="gold">600 pearls</span>.');setF('commission');
  await say(CO,'Go at low water, over the shallows. When you find their heart, come back and tell me where it beats.')},
async reveal(){
  FD.busy++;
  spawn({id:'cv',x:10,y:15,look:'corvane',dir:'up'});spawn({id:'s1',x:8,y:15,look:'soldier',dir:'up'});spawn({id:'s2',x:12,y:15,look:'soldier',dir:'up'});
  AU.music('sad');
  await lines([[CO,'You found the Spire. And my diver.'],
    [CO,'I told you to find where their heart beats. You\'ve done better than that. You\'ve shown me the way to it.'],
    [M,'You\'re dragging the moon down. The tide is rising because of you.'],
    [CO,'Yes.'],
    [CO,'My wife Lirien drowned the night the moon fell. For seven years, every low water, I\'ve walked out on the flats and seen her. And she screams, and runs from me, as if I were the ghost.'],
    [CO,'There is no Above and no Below. There\'s only the water between us. When the tide covers every island, there will be no more Pale Ones. Only the drowned. All of us, together.'],
    [YS,'You\'d drown the whole world to stand next to her?'],
    [CO,'I\'d drown it to end the haunting. The moon lies in the Moonscar, under the great whirlpool. My chains are already on it. One more night of hauling.'],
    [CO,'Don\'t follow. The whirlpool only opens for Admiralty iron.']]);
  await Promise.all([walkNpc('cv',['down','down','down']),walkNpc('s1',['down','down','down']),walkNpc('s2',['down','down','down'])]);
  despawn('cv');despawn('s1');despawn('s2');
  await lines([[PE,'We are definitely following.'],
    [YS,'The whirlpool... My mother sang a hymn that could calm deep water. The Tide-Hymn. I can\'t remember it. I remember a lighthouse. And stairs.'],
    [M,'Grey Rock Light. North-east, inside the reef. My family kept it, before the Fall.'],
    [YS,'...So did mine.'],
    [PE,'Well. That\'s not ominous at all.']]);
  setF('reveal');AU.music('town');FD.busy=Math.max(0,FD.busy-1)},

/* ---------- Nethra ---------- */
async nethraEnter(){setF('nethra');
  await lines([['Drowned Folk','A Pale One! Two of them!'],['Drowned Folk','Hide the children! Don\'t look at their eyes!'],[PE,'...Are we the ghosts here?'],[M,'They\'re scared of us.']])},
async ysoldeMeet(){
  await lines([['Drowned Girl','You\'re Pale Ones. You came down from the Above.'],
    ['Drowned Girl','But you\'re breathing. And your shadows fall the right way.'],
    [M,'We\'re not ghosts. We\'re from Saltmere, up on the islands.'],
    ['Drowned Girl','Up is where the dead go. When the moon fell, half of us were taken up into the Pale. My mother said they walk the dry places and can\'t come home.'],
    ['Drowned Girl','My sister was one of them. I can\'t remember her face.'],
    [M,'...'],
    ['Drowned Girl','I\'m Ysolde. I sang in the choir, before the Chainers came.'],
    [M,'Chainers?'],
    [YS,'Iron things on long chains. They come from the Coral Spire and drag our people away, out toward the deep. The Cantor says it\'s the Pale, taking more of us.'],
    [PE,'Iron things on chains. That doesn\'t sound like any ghost I know.'],
    [YS,'If you\'re really alive, help me find where they take us. The Spire\'s coral only opens for a hymn, and I know it. It\'s south-east, past the reef.']]);
  await join('ysolde');setF('ysolde');despawn('ysoldeObj');
  await say(null,'<span class="small">Ysolde is one of the Drowned. Her Hymns heal, and her moon-songs hurt drowned things most at Ebb.</span>')},
cantor(){if(F('grief'))return lines([['Cantor','Sisters. Of course. Half of every house went up, and half stayed. We were all one city once.']]);
  if(F('spire'))return lines([['Cantor','You brought our people home. I was wrong about the Pale. Or about which of us is pale.']]);
  if(F('ysolde'))return lines([['Cantor','Ysolde trusts you. Then so must I. The Spire waits south-east, ringed by reef. Walk it at low water.']]);
  return lines([['Cantor','Pale One. You should not be here. The tide is not yours to walk.']])},
shopNethra(){const st=['deeptonic','pearlwater','moonsalt','clearwater','tidebomb'];if(F('spire'))st.push('abysstonic');return shop('Shell-Trader','You pay in pearls? Strange. Up there, pearls are money? Down here they\'re just... pearls. Fine.',st)},
armsNethra(){const st=['pearlkris','whaler','choirbell','coralplate'];if(F('spire'))st.push('krakentooth');if(F('grief'))st.push('tidecutter','moonbell','abyssmail');return shop('Smith','Drowned steel. Never rusts. Never quite dries.',st)},
innNethra(){return inn('Pool-Keeper',40)},
nethraKid(){return lines([['Drowned Child',F('ysolde')?'Ysolde says you\'re not cold. Can I touch your hand? ...Oh! It\'s warm!':'Are you a ghost? Say something ghosty.']])},
nethraFolk1(){return lines([['Drowned Woman','The moon is our lamp. It lies in the deep and lights the city. But every night it sinks further, and the light gets dimmer.']])},
nethraFolk2(){return lines([['Drowned Man','Sometimes we hear your bells through the water. We always thought they were your funerals.']])},
nethraFolk3(){return lines([['Old Drowned',F('spire')?'My neighbor\'s boy came home. He says the Chainers were made by the Pale. By the living. ...Hm.':'Chains in the night. Clank, clank. My neighbor\'s boy was taken. Iron doesn\'t drown, they say.']])},

/* ---------- the Coral Spire ---------- */
captive(){return lines([['Captive','Ysolde? Is that you? Get us out of these chains!']])},
async diverFight(){
  if(F('spire'))return;
  await lines([[YS,'There! Our people!'],[null,'A huge brass diving suit turns toward you. Its helmet glass glows green.'],
    [PE,'That\'s no ghost. That\'s a diving suit. Admiralty make. I\'ve seen them in the Gullwick yards.']]);
  if(!await boss('diver',{bg:'coral'}))return;
  setF('spire');refreshNpcs();
  spawn({id:'c1',x:5,y:2,look:'drowned1',dir:'down',ghost:1});spawn({id:'c2',x:11,y:2,look:'drowned2',dir:'down',ghost:1});
  await lines([[null,'The suit splits open. It\'s empty. Only water, and a brass plate: PROPERTY OF THE ADMIRALTY, GULLWICK.'],
    ['Freed Captive','Ysolde! The chains... they weren\'t dragging us. We were only in the way. They\'re dragging something else, down into the deep.'],
    [YS,'...The moon. They\'re pulling the moon down.'],
    [M,'Corvane.'],
    [PE,'Six hundred pearls. I should have asked for a thousand.'],
    ['Freed Captive','We\'ll swim home to Nethra. Thank you, Pale Ones. Thank you.']]);
  despawn('c1');despawn('c2');
  await say(null,'<span class="small">Back to Gullwick, to face the Admiral.</span>')},

/* ---------- Grey Rock Light ---------- */
lhEnter(){setF('lhenter');return lines([[M,'I\'ve been here. I\'ve been inside.'],[YS,'So have I. There\'s a stair that creaks on the seventh step.'],[M,'...It\'s the ninth.'],[YS,'Seventh, if you\'re small.']])},
lhMemory(){return lines([[null,'Pencil marks on the wall, measuring two children. M. Y. M. Y.'],[null,'The marks stop at the same height. Seven years ago.']])},
lamp(){return lines([[null,F('grief')?'The lamp burns. Somewhere out on the dark water, ships can see it.':'The great lamp is cold and dark.']])},
async griefFight(){
  if(F('grief'))return;
  await lines([[null,'Something huddles over the dead lamp. A shape made of everything the sea took.'],
    ['The Grief','...forget... forget... it hurts less...'],
    [YS,'It\'s eating memories. Ours. Everyone\'s.'],[M,'Then it\'s been eating mine for seven years.']]);
  if(!await boss('grief',{bg:'light'}))return;
  setF('grief');refreshNpcs();AU.music('sad');
  await lines([[null,'The Grief comes apart like fog. Things drift out of it: names, faces, a song.']]);
  await getItem('drawing');
  await lines([[M,'...Ysolde.'],
    [YS,'Marin. You always took the ninth step. You said the seventh was mine.'],
    [M,'How did I forget you? How did I forget my own sister?'],
    [YS,'The Fall didn\'t just sink the moon. It split us. Half of every family went up and half went down, and the sea took the names so we\'d stop looking.']]);
  await getItem('hymnbox');
  await lines([[null,'The music box plays a slow tune. Ysolde sings along without thinking.'],
    [YS,'The Tide-Hymn. I remember it now. All of it.'],
    [null,'Marin holds up the lantern. The great lamp catches its light and blazes.']]);
  await flash();
  await lines([[null,'Grey Rock Light burns again.'],
    [null,'<span class="gold">Ysolde</span> learned <span class="gold">Moonsong</span>. <span class="gold">Marin</span> learned <span class="gold">Lantern Heart</span>.'],
    [PE,'Hate to break up the reunion. But the moon\'s still being dragged into a hole.'],
    [M,'The whirlpool. Let\'s go.']]);
  AU.music('dungeon')},

async moonspring(){await say(null,'A pool of pale light. Where it touches you, wounds close and weariness lifts.');healAll();AU.play('heal');await say(null,'The party is fully restored.')},
/* ---------- the end ---------- */
async finale(){
  if(F('corvane'))return;
  FD.busy++;
  await lines([[CO,'You came. Of course you came. Hask\'s girl, with her mother\'s lantern.'],
    [CO,'Look at it. The moon. It isn\'t dead. It\'s dreaming. Every name the sea took is in there.'],
    [M,'Then let it go, Corvane. Let it rise.'],
    [CO,'If it rises, she stays a ghost to me forever. No.']]);
  face('corvaneEnd','down');
  if(!await boss('corvane',{bg:'moon'})){FD.busy=Math.max(0,FD.busy-1);return}
  await lines([[CO,'Not... yet.'],[null,'Corvane grabs the great chain with both hands. It coils around his arms, his chest, his throat.'],
    [CO,'If I can\'t pull it down with my hands, I\'ll pull it down with all of me!']]);
  await flash();
  for(const h of partyHeroes()){if(h.hp<=0)h.hp=1}healAll();AU.play('heal');
  await say(null,'Behind you, the moon stirs in its sleep. Its light pours over the party, and every wound closes.');
  await say(YS,'It\'s helping us. Marin, it knows we\'re here.');
  if(!await boss('undertide',{bg:'moon',final:1})){FD.busy=Math.max(0,FD.busy-1);return}
  setF('corvane');despawn('corvaneEnd');
  spawn({id:'cvd',x:7,y:6,look:'corvane',dir:'down'});spawn({id:'lir',x:8,y:5,look:'lirien',dir:'down',ghost:1});
  AU.music('sad');
  await lines([[null,'The chains fall away. Corvane lies on the pale stone. Beside him, a drowned woman kneels.'],
    ['Lirien','Corvane. You were never the ghost. Neither was I.'],
    [CO,'Lirien... I can see your face.'],
    [null,'He doesn\'t say anything else.'],
    [YS,'Marin. The lantern.'],
    [M,'Together, then.'],
    [PE,'One more heave. Grab the line!']]);
  AU.play('tide');await flash();await flash();
  FD.busy=Math.max(0,FD.busy-1);await ending()},
};

async function ending(){
  setF('cleared');try{localStorage.setItem('drownedmoon-cleared','1')}catch(e){}
  await fade(1,true,900);MODE='ending';endT=0;AU.music('ending');await fade(0,true,1500);
  const txt=['The moon rose out of the Moonscar at dawn, streaming seawater, and hung in the sky where it belonged.',
    'The tide went out, and kept going out, until the shallows were shores again.',
    'On the new beaches, the people of the islands and the people of Nethra met, and found they could see each other plainly.',
    'Not ghosts. Just families, each missing half of itself.',
    'The names came back slowly. Then all at once.',
    'Pell bought a second boat and named it the Six Hundred Pearls.',
    'Grey Rock Light burns every night now. Two sisters keep it.'];
  for(const t of txt){const w=win('',`<div style="text-align:center;line-height:1.5">${t}</div>`,{left:'8%',right:'8%',bottom:'14%',background:'rgba(4,8,24,.55)'});w.style.opacity=0;w.style.transition='opacity 1s';await frames(2);w.style.opacity=1;await sleep(4200);w.style.opacity=0;await sleep(1000);w.remove()}
  const w=win('',`<div style="text-align:center"><div style="font-size:1.6rem;color:#fff;letter-spacing:.15em">THE END</div><div class="gold" style="margin-top:.4rem">Tides of the Drowned Moon</div><div class="small" style="margin-top:.8rem">Thank you for playing.<br>Press A</div></div>`,{left:'10%',right:'10%',top:'34%',background:'rgba(4,8,24,.55)'});
  uiCount++;await new Promise(r=>{const off=pushInput(b=>{if(b==='a'||b==='start'){off();r()}})});uiCount--;w.remove();
  toTitle();await new Promise(()=>{})}
let endT=0;
function drawEnding(){endT++;const H=VH,W=VW;const p=Math.min(1,endT/900);
  const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,mix('#0b1640','#f0a868',p*.7));sky.addColorStop(.6,mix('#2a3f80','#ffd9a0',p*.8));sky.addColorStop(.6001,mix('#17337a','#3a78c8',p));sky.addColorStop(1,mix('#0c1a3a','#2a5a98',p));
  g.fillStyle=sky;g.fillRect(0,0,W,H);
  const my=H*.62-p*H*.42,r=22;g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(W/2,my,r+6,0,Math.PI*2);g.fill();g.fillStyle='#f4f8ff';g.beginPath();g.arc(W/2,my,r,0,Math.PI*2);g.fill();
  g.fillStyle='#d6deec';g.beginPath();g.arc(W/2-7,my-4,5,0,Math.PI*2);g.arc(W/2+8,my+6,4,0,Math.PI*2);g.fill();
  g.fillStyle=mix('#17337a','#3a78c8',p);g.fillRect(0,H*.6,W,H*.4);
  for(let i=0;i<40;i++){const y=H*.6+(i*7%(H*.4)),x=(i*53+endT*.3)%W;g.fillStyle='rgba(230,246,255,.5)';g.fillRect(x|0,y|0,4,1)}
  g.fillStyle='rgba(255,255,255,.35)';for(let y=H*.6;y<H;y+=3)g.fillRect(W/2-6+Math.sin(y+endT/10)*3,y,12,1)}

/* ===================== THE NEW TELLING: four friends and the Thorn =====================
   Lore 2. Marin, Pell, Ysolde and Wren walk the cliff road above Saltmere looking for a ruin on an old map, find a
   red sword in a ring of stones, and Marin touches it. The vines take all four; one may be pulled free, and whoever
   is pulled free carries the story from Thornwick on. */
const WR='Wren';
const THORN={k:1,fx:null};
const FRIEND_NPC={pell:'fpell',ysolde:'fysolde',wren:'fwren'};
const CHOSEN=()=>(S&&S.flags.chosen)||(S&&S.party[0])||'marin';
const CN=()=>HEROES[CHOSEN()].name;
/* lines of story text on black, one at a time; each stays until A is pressed */
function waitA(minMs=350){const t0=performance.now();uiCount++;return new Promise(r=>{const off=pushInput(b=>{if((b==='a'||b==='start')&&performance.now()-t0>=minMs){off();uiCount--;AU.play('ok');r()}})})}
async function crawl(lines){
  for(const t of lines){const w=win('',`<div style="text-align:center;line-height:1.5">${t}</div><div class="more" style="position:relative;margin:.6rem auto 0;right:auto;bottom:auto"></div>`,{left:'8%',right:'8%',top:'36%',background:'none',border:'0',boxShadow:'none',zIndex:'5'});
    w.style.opacity=0;w.style.transition='opacity .6s';await frames(2);w.style.opacity=1;await waitA();w.style.opacity=0;await sleep(500);w.remove()}}
/* the four friends, one card each: who they are and what they fight with */
const FRIENDS=[
  {id:'marin',role:'Tide-Diver',weapon:'Diver\'s Knife',who:'The best swimmer in Saltmere, and always the first one in.',fight:'Fights up close with a short diver\'s knife. Her <b>Tide</b> skills strike with seawater, and Turn Tide flips the battle between Flood and Ebb.'},
  {id:'pell',role:'Harpooner',weapon:'Old Harpoon',who:'Big, loud and loyal. Talks his way into trouble and fights his way out.',fight:'His long harpoon punches straight through armor. <b>Anchor Guard</b> braces the whole party against the next blows.'},
  {id:'ysolde',role:'Singer',weapon:'Silver Bell',who:'Quiet, until she sings. Then everyone stops to listen.',fight:'She rings a silver hand-bell as she sings. Her <b>Hymns</b> heal wounds, wash away poison and sing enemies to sleep.'},
  {id:'wren',role:'Scout',weapon:'Shortbow',who:'Sharp-eyed and quick, and the one who found the old map.',fight:'Fights from a distance with a shortbow. <b>Quick Shot</b> fires before anyone else can move, and <b>Volley</b> rains arrows on every foe.'}];
function portrait(id){if(hasBig(id)){const b=mk(58,62);b.getContext('2d').drawImage(heroBig(LOOKS[HEROES[id].look],'idle'),0,0);b.className='fc-pic big';return b}
  const c=mk(22,26),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(personImg(LOOKS[HEROES[id].look],'left',0),4,1);drawWeapon(x,HEROES[id].wt,4,8,0);c.className='fc-pic';return c}
async function friendCards(){
  for(let i=0;i<FRIENDS.length;i++){const f=FRIENDS[i],H=HEROES[f.id];
    const w=win('fcard',`<div class="fc-top"><span>Four friends from Saltmere</span><span>${i+1}/4</span></div>
      <div class="fc-head"><div class="fc-id"><b>${H.name}</b><span>${f.role}</span><em>Weapon · ${f.weapon}</em></div></div>
      <p class="fc-who">${f.who}</p><p class="fc-fight">${f.fight}</p><div class="more"></div>`,{zIndex:'5'});
    w.querySelector('.fc-head').prepend(portrait(f.id));
    w.style.opacity=0;w.style.transition='opacity .35s';await frames(2);w.style.opacity=1;await waitA();w.style.opacity=0;await sleep(300);w.remove()}}
async function flashRed(){fadeEl.classList.remove('white');fadeEl.classList.add('red');fadeEl.style.transitionDuration='90ms';fadeEl.style.opacity=.8;await sleep(110);
  fadeEl.style.transitionDuration='700ms';fadeEl.style.opacity=0;await sleep(720);fadeEl.classList.remove('red')}
async function sinkTo(who,to,ms){const st=who.map(w=>w==='me'?(FD.sink||0):((npc(w)||{}).sink||0)),t0=performance.now();
  while(true){const p=Math.min(1,(performance.now()-t0)/ms);who.forEach((w,i)=>{const v=st[i]+(to-st[i])*p;if(w==='me')FD.sink=v;else{const n=npc(w);if(n)n.sink=v}});if(p>=1)break;await frames(1)}}

/* the red vines: they creep out of the stone toward each of the four, then coil up around their legs */
const V={on:false};
function startVines(){V.on=true;V.t=0;V.fade=1;V.src=[7*16+8,6*16+13];
  V.tg=[['me',0],['fpell',10],['fysolde',18],['fwren',26]].map(([who,d])=>({who,d,grow:0,wrap:0,freed:false,ph:Math.random()*6}));
  V.ten=[...Array(9)].map((_,i)=>({a:i/9*Math.PI*2+Math.random()*.4,len:16+Math.random()*26,ph:Math.random()*6}));THORN.fx=drawVines}
function vinePos(t){if(t.who==='me')return[FD.x*16+FD.ox+8,FD.y*16+FD.oy+14];const n=npc(t.who);return n?[n.x*16+n.ox+8,n.y*16+n.oy+14]:null}
function drawVines(g,cx,cy){if(!V.on)return;V.t++;const [sx,sy]=V.src;
  const line=(pts,w,col)=>{g.strokeStyle=col;g.lineWidth=w;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x-cx,y-cy):g.moveTo(x-cx,y-cy));g.stroke()};
  for(const d of V.ten){const L=d.len*Math.min(1,V.t/50)*V.fade;if(L<1)continue;const pts=[];
    for(let u=0;u<=1.001;u+=.1){const r=L*u,a=d.a+Math.sin(u*5+d.ph)*.35;pts.push([sx+Math.cos(a)*r,sy+Math.sin(a)*r*.6])}line(pts,2,'#4a0410');line(pts,1,'#b8182e')}
  for(const t of V.tg){const p=vinePos(t);if(!p)continue;
    if(t.freed){t.grow=Math.max(0,t.grow-.05);t.wrap=Math.max(0,t.wrap-.12)}else if(V.t>t.d){t.grow=Math.min(1,t.grow+.03);if(t.grow>=1)t.wrap=Math.min(1,t.wrap+.015)}
    const gr=t.grow*V.fade;if(gr<=0)continue;
    const [tx,ty]=p,dx=tx-sx,dy=ty-sy,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,pts=[];
    for(let u=0;u<=gr+.001;u+=.05){const w=Math.sin(u*Math.PI*3+t.ph+V.t/20)*3*(1-u*.6);pts.push([sx+dx*u+nx*w,sy+dy*u+ny*w])}
    line(pts,2.4,'#4a0410');line(pts,1,'#d0243c');
    for(let i=2;i<pts.length;i+=3){g.fillStyle='#ff7a8a';g.fillRect((pts[i][0]-cx+(i%2?1:-2))|0,(pts[i][1]-cy-1)|0,1,1)}
    const wr=t.wrap*V.fade;if(wr>0)for(let k=0;k<3;k++){if(k/3>=wr)break;const ry=ty-1-k*4.5-cy,rx=tx-cx;
      g.strokeStyle='#4a0410';g.lineWidth=2;g.beginPath();g.ellipse(rx,ry,6.5,2.2,-.25,0,Math.PI*2);g.stroke();
      g.strokeStyle='#e0304a';g.lineWidth=1;g.beginPath();g.ellipse(rx,ry,6.5,2.2,-.25,Math.PI*1.1,Math.PI*1.9);g.stroke()}}}

Object.assign(STORY,{
async prologue(){
  MODE='black';AU.music('title');
  await friendCards();
  loadMap('trail',8,23,'up');FD.busy++;await fade(1,false,0);MODE='field';AU.music('town');await fade(0,false,900);mapToast('Cliff Road');
  FD.busy=Math.max(0,FD.busy-1);
  await say(null,'<span class="small">D-pad moves · A talks and checks · START opens the menu</span>')},
async trailFight1(){setF('fight1');await startBattle(['rotgull','rotgull'],{bg:'cliff',noFlee:1})},
async trailTalk(){setF('talk1')},
async trailFight2(){setF('fight2');await startBattle(['brinecrab','jellysting','rotgull'],{bg:'cliff',noFlee:1})},

/* ---------- the Hollow ---------- */
async hollowSee(){FD.noFollow=1;AU.music('');
  await fade(1,false,250);FD.x=7;FD.y=11;FD.dir='up';S.x=7;S.y=11;initTrail();
  spawn({id:'w_pell',x:7,y:12,look:HEROES.pell.look,dir:'up'});spawn({id:'w_ysolde',x:7,y:13,look:HEROES.ysolde.look,dir:'up'});spawn({id:'w_wren',x:7,y:14,look:HEROES.wren.look,dir:'up'});
  await fade(0,false,300);
  await Promise.all([walkMe(['up','up']),walkNpc('w_pell',['up','up','left','up']),walkNpc('w_ysolde',['up','up','up','right','up']),walkNpc('w_wren',['up','up','up','up'])]);
  for(const k of ['w_pell','w_ysolde','w_wren'])face(k,'up');
  AU.music('dungeon');
  await lines([[WR,'Here! This is it. The ruin on the map.'],[null,'Old stones stand in a broken ring. In the middle of them, something is shining.'],
    [PE,'...Is that a sword?'],[YS,'It\'s glowing. Red.'],[M,'Red light in the woods.'],
    [PE,'Walk the other way. Yep. Every gran in Saltmere. Let\'s do what the grans say for once.'],
    [WR,'Nobody leaves a sword like that by accident. Someone put it there on purpose.'],
    [YS,'Then someone had a reason. Marin, don\'t go near it.']]);
  despawn('w_pell');despawn('w_ysolde');despawn('w_wren');setF('sawsword');refreshNpcs();FD.noFollow=0},
async hollowLeave(){pushBack();FD.dir='up';
  await lines([[PE,'Good call. Let\'s go home and never talk about this.'],[null,'...But your feet won\'t carry you away. You keep looking back at the red light.']])},
friend_pell(){return lines([[PE,'Marin. I know that face. That\'s your "I\'m about to do something" face. Don\'t.']])},
friend_ysolde(){return lines([[YS,'Can you hear that? It\'s humming, like it\'s singing to itself. I don\'t like the song.']])},
friend_wren(){return lines([[WR,'Grandad drew a circle around this place on the map. Then he crossed it out. Three times.']])},
async thornTouch(){
  if(!F('thornlook')){setF('thornlook');await lines([[null,'The sword is driven deep into the stone. Red light runs down the blade, slow, like a heartbeat.'],[null,'It\'s warm. You can feel the warmth from here.']])}
  const c=await ask(null,'Touch the sword?',['Take hold of it','Step back'],{cancel:1});
  if(c!==0){await lines([[null,'You pull your hand back.'],[null,'The red light dims... then brightens again. As if it\'s waiting for you.']]);return}
  await thornScene()},
});

async function thornScene(){
  AU.music('');
  await say(PE,'Marin, DON\'T—');
  const rush=Promise.all([walkNpc('fpell',['up']),walkNpc('fysolde',['up']),walkNpc('fwren',['up','up'])]);
  await say(YS,'Marin, no!');await rush;for(const k of ['fpell','fysolde','fwren'])face(k,'up');
  await say(null,'Your fingers close around the hilt. It is warm, like a hand.');
  AU.play('boom');FD.shake=40;THORN.k=2.4;await flashRed();AU.music('boss');
  startVines();await sleep(1100);
  await lines([[null,'Red vines tear up out of the stone!'],[WR,'It\'s got my legs!'],[PE,'What did you DO?!'],[M,'I can\'t let go! It won\'t let me let go!']]);
  FD.shake=20;await sinkTo(['me','fpell','fysolde','fwren'],7,700);
  await lines([[YS,'It\'s pulling us down. Into the ground!'],[null,'The earth goes soft as water under your feet. It is swallowing all four of you.']]);
  await sinkTo(['me','fpell','fysolde','fwren'],12,800);
  AU.music('');AU.play('moon');
  await say('The Thorn','<span style="color:#ff8a96">Four came to me.</span>');
  await say('The Thorn','<span style="color:#ff8a96">One may leave. Only one.</span>');
  await say('The Thorn','<span style="color:#ff8a96">Choose.</span>');
  const opts=[['marin','Save yourself'],['pell','Save Pell'],['ysolde','Save Ysolde'],['wren','Save Wren']];
  let pick=null;
  while(!pick){
    const c=await listWin(opts.map(([id,l])=>({label:`<img src="${heroCanvas(id).toDataURL()}" alt="" style="width:1.6em;height:2.4em;image-rendering:pixelated;vertical-align:middle;margin-right:.45em">${l}`})),
      {title:'Who do you pull free?',cancel:false,style:{left:'50%',transform:'translateX(-50%)',top:'.5rem',minWidth:'11rem'}});
    const id=opts[c][0];
    const y=await ask(null,id==='marin'?'Tear yourself free and leave the other three?':`Pull ${HEROES[id].name} free? You will be taken with the others.`,['Yes','No'],{cancel:1});
    if(y===0)pick=id}
  await thornOutcome(pick)}

const FAREWELL={pell:'Get help, Pell. Then come back for us.',ysolde:'Sing loud enough that we can hear you, Ysolde. Come back for us.',wren:'Don\'t miss, Wren. Come back for us.'};
async function thornOutcome(id){
  const tg=w=>V.tg.find(t=>t.who===(w==='marin'?'me':FRIEND_NPC[w]));
  const others=['pell','ysolde','wren'].filter(x=>x!==id).map(x=>FRIEND_NPC[x]);
  AU.music('sad');
  if(id==='marin'){
    await say(null,'You wrench your hand off the hilt. The vines around you snap like wet rope.');
    tg('marin').freed=true;AU.play('crit');FD.shake=10;await sinkTo(['me'],0,350);
    await lines([[PE,'Marin—!'],[YS,'Take my hand! Marin, take my—']]);
    await sinkTo(others,24,1600);others.forEach(despawn);
    await lines([[M,'PELL! YSOLDE! WREN!'],[null,'The vines pull back into the stone. Then the stone swallows the sword.']])}
  else{const nm=HEROES[id].name,n=FRIEND_NPC[id];
    await lines([[M,`${nm}! Give me your hand!`],[null,`You can't get yourself free. But you can reach ${nm}.`],[null,`You grab ${nm} with everything you have left, and pull.`]]);
    tg(id).freed=true;AU.play('crit');FD.shake=10;await sinkTo([n],0,300);
    await walkNpc(n,[{pell:'left',ysolde:'right',wren:'down'}[id]]);face(n,{pell:'right',ysolde:'left',wren:'up'}[id]);
    await lines([[nm,'MARIN!'],[M,FAREWELL[id]]]);
    await sinkTo(['me',...others],24,1700);others.forEach(despawn);
    await lines([[nm,'No... no, no, no...'],[null,'The vines pull back into the stone. Then the stone swallows the sword.']])}
  for(let i=0;i<40;i++){V.fade=Math.max(0,1-i/40);await frames(1)}
  V.on=false;THORN.fx=null;THORN.k=1;
  await fade(1,false,1600);
  // whoever was pulled free carries the story from here
  S.party=[id];S.flags.chosen=id;setF('touched');FD.sink=0;
  for(const k of ['fpell','fysolde','fwren'])despawn(k);healAll();
  MODE='black';
  await crawl(['The Hollow went quiet.',`When the red light finally went out, only one of you walked out of the trees.`]);
  await wakeScene()}

const WAKE={marin:'I touched it. They all told me not to, and I touched it anyway.',
  pell:'She shoved me out. The vines had her, and she used the last of her strength to shove ME out. That idiot.',
  ysolde:'She chose me. Out of everyone... why would she choose me?',
  wren:'I had her hand. I had it. She let go so the vines would let go of me.'};
async function wakeScene(){const id=CHOSEN(),C=CN();
  loadMap('thorninn',2,3,'down');spawn({id:'agna_t',x:3,y:3,look:'healer',dir:'left'});
  MODE='field';AU.music('sad');await fade(0,false,1500);
  await say(C,'...');
  await say('Healer','Easy. Easy, now. Don\'t sit up too fast.');
  face('me','right');
  await say(C,id==='marin'?'Pell? Ysolde... Wren? Where are they?':'Marin? ...Where\'s Marin? Where are the others?');
  await lines([['Agna','You\'re in Thornwick, love. The Woodcutter\'s Rest. I\'m Agna.'],
    ['Agna','Bram the woodcutter found you at first light, at the edge of the Hollow. Face down in the dirt, holding on to it like it might get away from you.'],
    ['Agna','Just you. There was nobody else.'],[C,WAKE[id]],
    ['Agna','...Elder Rowan will want to hear this, whatever it is. His is the blue-roofed house at the top of the lane.'],
    ['Agna','Go when your legs are steady. And eat something first. That isn\'t advice.']]);
  await walkNpc('agna_t',['right','right','right','right','right']);face('agna_t','down');despawn('agna_t');setF('woke');refreshNpcs();
  AU.music('town');saveGame(0)}

const ROWAN1={marin:'Then I\'m going back down there. This was my fault. I\'ll get them out if it takes the rest of my life.',
  pell:'Then I\'m going back. Marin threw me out of there. I\'m not letting that be the last thing she ever did.',
  ysolde:'Then I\'m going back for them. Marin gave me this. I won\'t waste it.',
  wren:'Then I\'m going back. I don\'t miss twice.'};
const ROWAN2={marin:'Then let it choke on me.',pell:'Then it\'s about to get the worst bellyache of its life.',ysolde:'Then I\'ll sing so loud it forgets to eat.',wren:'Let it try. I have a lot of arrows.'};
Object.assign(STORY,{
async rowan(){
  if(F('rowan'))return lines([['Elder Rowan','Rest. Eat. Learn what this valley knows. When the Hollow sleeps, we\'ll talk about the Rootdeep.']]);
  const id=CHOSEN(),C=CN();
  await lines([['Elder Rowan','So. Agna says you came out of the Hollow. Sit down before you fall down.'],
    ['Elder Rowan','Four of you went in. Am I right?'],[C,'...How did you know that?'],
    ['Elder Rowan','Because it is always four. Every time the Thorn wakes, four go into the Hollow, and one comes out.'],
    [C,'The Thorn?'],
    ['Elder Rowan','The red sword. It was here before Thornwick, before the road. My grandmother\'s grandmother saw it wake, and she was the one who walked out.'],
    ['Elder Rowan','Hear me, now. Your friends are not dead. The roots took them down into the Rootdeep, under the valley, and there they sleep.'],
    [C,ROWAN1[id]],
    ['Elder Rowan','Of course you are. Everyone the Thorn lets go says that.'],
    ['Elder Rowan','That is why it lets one go. The Thorn doesn\'t feed on the ones it keeps. It feeds on the one who comes back for them.'],
    [C,ROWAN2[id]],
    ['Elder Rowan','...Yes. You\'ll do. But not tonight. The Hollow is awake, and the road stays shut until the red goes out of the trees.'],
    ['Elder Rowan','Rest. Eat. Talk to people. Learn what this valley knows. Then we\'ll talk about the Rootdeep.']]);
  setF('rowan');AU.play('level');
  await say(null,'<div class="gold" style="text-align:center;letter-spacing:.14em">— END OF THE PROLOGUE —</div><div class="small" style="text-align:center;margin-top:.2rem">The story goes on in a later update. Thornwick is yours to explore.</div>')},
agna(){return inn('Agna',8)},
twDrinker(){return lines([['Old Logger','Another one out of the Hollow. Rowan keeps a book of you lot, you know. Names of everyone who walked out.']])},
twApprentice(){return lines([['Apprentice','The Elder keeps a book of everyone who ever came out of the Hollow. Eleven names in three hundred years.'],['Apprentice','You\'d be twelve.']])},
twGuard(){return lines([['Gate Warden',F('rowan')?'Hollow road\'s shut by the Elder\'s order. Nobody in, nobody out until the red goes out of the trees.':'You\'re the one Bram carried in. Go and see the Elder first. Blue roof, top of the lane.']])},
twBram(){return lines([['Bram','You\'re up! Good. You gave me a fright.'],['Bram','Thirty years I\'ve cut wood on the edge of that Hollow. Never once seen the trees lean the way they leaned last night. Every one of them, pointing in.']])},
twPeddler(){return shop('Peddler','Tonics, salves, a lucky charm or two. You look like you could use all three.',['tonic','clearwater','pearlwater','sharkskin','luckyshell','ashbow'])},
twWeaver(){return lines([['Weaver','My aunt went into the Hollow when I was small. Her and three friends from the mill. Only my aunt came out.'],
  ['Weaver','She went back in every spring for forty years. Every single spring.'],['Weaver','...Then one spring she didn\'t come back out.']])},
twKid(){return lines([['Kid','Is it true you touched the red sword? Did it hurt?'],['Kid','Mum says if you look at the red light too long, your shadow goes red. ...Can I see your shadow?']])},
twTraveler(){return lines([['Traveler','Came up the coast road yesterday, just before the bridge washed out. Folk in Saltmere were out on the cliffs with lanterns.'],
  ['Traveler','Calling four names. Four young ones who went up the cliff road for a lark and never came home.'],['Traveler','...Oh. Oh, I\'m sorry. You\'re one of them, aren\'t you.']])},
async twNorth(){pushBack();await lines([['Gate Warden','Whoa, there. The Hollow road is shut. Elder\'s orders.']])},
async twSouth(){pushBack();await lines([[null,'The coast road runs south, toward Saltmere. A little way on, it simply stops. The bridge is gone, taken by last night\'s storm.'],[CN(),'Home is that way.']])},
});

/* ===================== STRIKE AT NIGHT =====================
   Lore 3. Lift, the strongest fighter in Millbrook, holds the town against a night raid, until the Bandit Devil King
   comes through the gate. Beaten and on one knee, Lift is saved by a white fairy who blocks the killing blow, then
   goes into Lift; everything goes black, and Lift wakes in the Pale Wood. The story stops there for now. */
const LF='Lift',DK='Devil King';
const kingField=()=>ART.kingF||(ART.kingF=MON.devilking('',.5));
const FAIRY={on:false,x:0,y:0,t:0,k:1,ring:null};
/* the white fairy: a tiny figure in a white dress with glassy wings, wrapped in light */
function drawFairy(g,x,y,t,k=1){x=Math.round(x);y=Math.round(y);const fl=Math.sin(t/2.6);
  g.save();g.globalCompositeOperation='lighter';const R=30*k;
  const gr=g.createRadialGradient(x,y-4,1,x,y-4,R);gr.addColorStop(0,'rgba(240,250,255,.95)');gr.addColorStop(.35,'rgba(180,215,255,.4)');gr.addColorStop(1,'rgba(160,200,255,0)');g.fillStyle=gr;g.fillRect(x-R,y-4-R,R*2,R*2);
  g.fillStyle='rgba(210,235,255,.55)';for(const s of [-1,1]){g.beginPath();g.ellipse(x+s*5,y-7,3.2,6+fl*1.6,s*.55,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(x+s*4,y-1,2.2,3.4+fl,s*-.4,0,Math.PI*2);g.fill()}
  g.restore();
  const p=(c,a,b,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x+a,y+b,w,h)};
  p('#ffffff',-1,-12,3,1);p('#ffffff',-2,-11,5,3);p('#ffeef0',-1,-10,3,2);p('#7a9ad8',-1,-10);p('#7a9ad8',1,-10);
  p('#ffffff',-1,-8,3,1);p('#f4f8ff',-2,-7,5,3);p('#dfeaff',-3,-4,7,3);p('#c8dcff',-3,-1,7,1);p('#fff4f0',-3,-6);p('#fff4f0',3,-6);
  for(let i=0;i<5;i++){const a=t/9+i*1.26,r=9+Math.sin(t/7+i)*2;p(i%2?'#ffffff':'#bfe0ff',Math.round(Math.cos(a)*r),Math.round(Math.sin(a)*r*.7-5))}}
/* the barrier the fairy throws up: a ring of white light that bursts outward */
function drawRing(g,r,cx,cy){r.t++;const p=r.t/r.dur;if(p>=1){FAIRY.ring=null;return}g.save();g.globalCompositeOperation='lighter';
  g.strokeStyle=`rgba(235,248,255,${1-p})`;g.lineWidth=3*(1-p)+1;g.beginPath();g.ellipse(r.x-cx,r.y-cy,8+p*40,10+p*44,0,0,Math.PI*2);g.stroke();
  g.fillStyle=`rgba(220,240,255,${.5*(1-p)})`;g.beginPath();g.ellipse(r.x-cx,r.y-cy,6+p*22,12+p*18,0,0,Math.PI*2);g.fill();g.restore()}
async function tween(ms,fn){const t0=performance.now();while(true){const p=Math.min(1,(performance.now()-t0)/ms);fn(p);if(p>=1)break;await frames(1)}}
const PIP='Pip',SB='Sable',MOM='Mom',HOB='Hob',LET='Lettie',MAUD='Maud';
function joinSable(){if(S.party.includes('sable'))return;const lv=Math.max(1,S.heroes.lift.lv-1);S.heroes.sable=mkHero('sable',lv);S.party.push('sable');initTrail()}
const chores=()=>['e_sword','e_cat','e_water'].filter(k=>!F(k)).length;

/* ===================== Prologue: an afternoon in Millbrook, then the raid ===================== */
Object.assign(STORY,{
async strikePrologue(){
  MODE='black';AU.music('title');
  await customizeHero();
  loadMap('millbrook',6,22,'left');FD.busy++;await fade(1,false,0);MODE='field';AU.music('home');await fade(0,false,1100);mapToast('Millbrook');
  spawn({id:'pip',x:4,y:21,look:'pip',dir:'down'});face('me','left');
  await lines([[MOM,'There you are. Three things before supper.'],[MOM,'Hob has your sword. Lettie\'s cat is loose again. And Maud needs water from the well.'],
    [PIP,'I\'m helping!'],[MOM,'Pip—']]);
  despawn('pip');setF('pipfollow');initTrail();
  await say(null,'Pip is already following you.');
  FD.busy=Math.max(0,FD.busy-1);
  await say(null,'<span class="small">D-pad moves · A talks and checks · START opens the menu</span>')},
async mbMom(){
  if(F('raid'))return;
  if(chores()>0){const left=[!F('e_sword')&&'Hob has your sword.',!F('e_cat')&&'Lettie\'s cat.',!F('e_water')&&'Maud\'s water.'].filter(Boolean).join(' ');
    return lines([[MOM,left]])}
  await lines([[MOM,'Good. Wash your hands.']]);await nightfall()},
async mbHob(){
  if(F('e_sword'))return lines([[HOB,'Go on. Your mother\'s got supper on.']]);
  setF('e_sword');AU.play('chest');
  await lines([[HOB,'Sharpened it twice. Can\'t have the Wall of Millbrook with a dull edge.'],[LF,'Nobody calls me that, Hob.'],[HOB,'Everybody calls you that, lad.'],
    [null,'Hob hands you your sword.'],[PIP,'Can I hold it?'],[HOB,'No.'],[LF,'No.']])},
async mbLettie(){
  if(F('e_cat'))return lines([[LET,'Biscuit says thank you. She doesn\'t, but she would.']]);
  if(F('e_cathave')){setF('e_cat');AU.play('chest');return lines([[LET,'Biscuit!'],[null,'Lettie squeezes the cat. The cat puts up with it.']])}
  return lines([[LET,'Biscuit\'s gone again. She hates me.'],[PIP,'She hates everyone.']])},
async mbCat(){setF('e_cathave');despawn('biscuit');AU.play('ok');
  await lines([[null,'Biscuit is asleep in a flowerbed. You pick her up. She allows it.'],[PIP,'She scratched me last time.']])},
async mbMaud(){
  if(F('e_water'))return lines([[MAUD,'Bless you, Lift.']]);
  if(F('e_bucket')){setF('e_water');AU.play('chest');return lines([[MAUD,'Bless you, Lift.'],[null,'Maud gives Pip a sweet. Pip gives it straight to you, then asks for it back.']])}
  setF('e_maud');return lines([[MAUD,'My bucket\'s by the well, dear. My knees aren\'t what they were.']])},
async mbWell(){
  if(F('raid'))return lines([[null,'The well.']]);
  if(F('e_maud')&&!F('e_bucket')){setF('e_bucket');AU.play('ok');return lines([[null,'You fill Maud\'s bucket. It\'s heavier than it looks.']])}
  return lines([[null,'The town well. Pip leans over the edge and shouts her name into it.']])},
async mbTobin(){
  if(F('e_cart'))return;
  await lines([[TB,'Lift! Help? It\'s stuck.']]);
  FD.busy++;AU.play('door');FD.shake=6;await sleep(300);
  await lines([[null,'You put your shoulder to it. The cart rolls free.'],[TB,'Thanks. Dad would\'ve made me unload the whole thing.']]);
  const c=npc('cart');if(c)c.fixed=1;await Promise.all([walkNpc('cart',['up','up']),walkNpc('tobinM',['up','left','up','up'])]);despawn('cart');despawn('tobinM');setF('e_cart');
  FD.busy=Math.max(0,FD.busy-1)},
mbBaker(){return lines([['Odo the Baker',F('raid')?'...':'Last of the bread. Take one home for your mother.']])},
async mbGate(){pushBack();await lines([[PIP,'Mom said before supper.']])},
mbDoorA(){pushBack();return lines(F('raid')?[[HOB,'(through the door) That sword\'s sharp. I made sure. Go on.']]:[[null,'Hob\'s forge. It\'s hot enough in there to bake bread.']])},
mbDoorB(){pushBack();return lines(F('raid')?[[null,'Behind the door, Lettie whispers. "Mama, it\'s the Wall." "Hush, love."']]:[[null,'Lettie\'s house. Something inside smells like burnt honey.']])},
mbDoorC(){pushBack();return lines(F('raid')?[[null,'Behind the door, very quietly, Maud is praying.']]:[[null,'Maud\'s door has a hundred little scratches on it. Biscuit, mostly.']])},
mbHome(){pushBack();return lines(F('raid')?[[null,'Under the floor, Mom is moving crates, and Pip is singing to keep her calm. Badly.']]:[[null,'Home. Mom is cooking something with a lot of onions.']])},
mbBandit(){return lines([['Bandit','...']])},
async mbFight1(){face('me','up');
  await lines([['Bandit','Well, well. The Wall himself.'],[LF,'Just Lift. Could you put the torches down? The hay\'s real dry this time of year.'],['Bandit','Or what, farm boy?'],
    [LF,'I was kind of hoping you\'d just say okay.']]);
  const r=await startBattle(['bandit','cutthroat'],{bg:'nighttown',noFlee:1});if(r==='lose')return;
  await walkNpc('b_a',['up','up','left']);despawn('b_a');
  await lines([[null,'The bandit runs. The cutthroat is on one knee.'],[LF,'Go on. Get home.'],['Cutthroat','You\'re letting me go?'],['Cutthroat','I don\'t have a home.'],[LF,'Then go somewhere else, I guess.']]);
  await walkNpc('b_b',['up','up','right']);setF('mb1')},
async mbFight2(){face('me','up');
  await lines([['Bandit Brute','You the one they call the Wall?'],[LF,'That\'s just what folks say. I\'m Lift.'],['Bandit Brute','Well, Lift. I\'m gonna knock you flat.'],[LF,'Alright. If you have to.']]);
  const r=await startBattle(['cutthroat','brute','bandit'],{bg:'nighttown',noFlee:1});if(r==='lose')return;
  await lines([['Bandit Brute','Laugh while you can... the King\'s already here.']]);
  await Promise.all([walkNpc('b_c',['up','up','up']),walkNpc('b_brute',['up','up','up','up']),walkNpc('b_d',['up','up','up'])]);setF('mb2');refreshNpcs();
  await kingScene()},
});
async function nightfall(){FD.busy++;await fade(1,false,900);MODE='black';AU.music('');
  await crawl(['Supper is onion soup. Pip talks the whole way through it.','That night, a dog starts barking somewhere north, and doesn\'t stop.']);
  setF('raid');setF('raidstart');S.flags.pipfollow=0;
  loadMap('millbrook',6,22,'left');MODE='field';AU.music('raid');await fade(0,false,900);
  spawn({id:'pip',x:4,y:21,look:'pip',dir:'down'});AU.play('door');await walkNpc('pip',['down','right']);face('pip','right');face('me','left');
  await lines([[PIP,'Lift! There\'s fire on the north road!'],[LF,'I see it. Go on, get in the cellar with Mom.'],[PIP,'You always say that.'],[LF,'And you always listen. Go on.']]);
  await walkNpc('pip',['left','up']);despawn('pip');AU.play('door');face('me','up');
  FD.busy=Math.max(0,FD.busy-1);saveGame(0)}

async function kingScene(){
  AU.music('');AU.play('boom');FD.shake=34;await flashRed();
  await say(null,'Every fire in the street bends toward the gate.');
  spawn({id:'king',x:10,y:0,big:kingField,stand:1,fixed:1,dir:'down',alpha:1});
  FD.lights=[{get x(){const n=npc('king');return n?n.x*16+n.ox+8+(n.dx||0):-999},get y(){const n=npc('king');return n?n.y*16+n.oy+12:-999},r:40,c:'rgba(255,40,40,.32)'}];
  AU.music('boss');await walkNpc('king',['down','down','down','down']);
  await lines([[null,'He doesn\'t hurry.'],[DK,'So this is Millbrook\'s famous wall.'],[LF,'You should probably take your men and go home, mister.'],[DK,'No. I don\'t think I will.'],[LF,'Alright, then.']]);
  await startBattle(['devilking'],{boss:1,bg:'nighttown',noFlee:1,scripted:1,finishRound:4,music:'final',loseMsg:'Lift falls to one knee...'});
  const h=partyHeroes()[0];h.hp=1;h.st={};
  despawn('king');spawn({id:'king',x:9,y:7,big:kingField,stand:1,fixed:1,dir:'right',alpha:1});
  FD.x=11;FD.y=7;FD.dir='left';FD.pose='kneel';S.x=11;S.y=7;FD.ox=FD.oy=0;initTrail();
  AU.music('sad');await fade(0,false,1000);
  await lines([[null,'Your sword is in the dirt.'],[DK,'Is that all the wall had?'],[LF,'Give me a minute.'],[DK,'Stay down, boy.']]);
  spawn({id:'pip',x:12,y:13,look:'pip',dir:'up'});await walkNpc('pip',['up','up','up','up']);face('pip','up');
  await lines([[PIP,'LIFT!'],[DK,'Yours?'],[LF,'Leave her alone. Please.'],[DK,'Take her.']]);
  spawn({id:'grab',x:14,y:12,look:'bandit2',dir:'up'});await walkNpc('grab',['up','up','up','left']);face('grab','left');face('pip','right');
  await lines([[null,'It\'s the cutthroat from the square. She won\'t look at you.'],[null,'Pip bites her hand. She doesn\'t let go.'],[DK,'Goodnight, wall.'],[null,'He lifts the greatblade.']]);
  const K=npc('king');AU.play('swirl');await tween(260,p=>{K.dx=Math.round(-3*p)});
  FAIRY.on=true;FAIRY.t=0;FAIRY.k=1;FAIRY.x=10*16+10;FAIRY.y=7*16-60;
  const lunge=tween(160,p=>{K.dx=Math.round(-3+11*p)});
  await tween(220,p=>{FAIRY.y=7*16-60+(56+4)*p});await lunge;
  AU.play('crit');FD.shake=18;FAIRY.ring={x:FAIRY.x,y:FAIRY.y-6,t:0,dur:30};await fade(1,true,90);await fade(0,true,420);
  await tween(240,p=>{K.dx=Math.round(8-14*p)});
  AU.music('');
  await lines([[null,'The blade stops. Something small and white hangs in the air between you.'],[DK,'Hello, little light.'],['White Fairy','Hello, Corin.'],
    [DK,'Come home.'],['White Fairy','Never.']]);
  AU.music('ending');
  await lines([['White Fairy','Lift. I can get you out. Only you.'],[LF,'Not without Pip.'],[PIP,'GO!'],[LF,'Keep singing. I\'ll hear you.'],
    [null,'The light rushes into your chest.']]);
  await tween(700,p=>{FAIRY.x=10*16+10+(11*16+8-(10*16+10))*p;FAIRY.y=7*16-4+2*p;FAIRY.k=1+p*1.6});
  FAIRY.on=false;FD.lights=[...FD.lights,{x:11*16+8,y:7*16+4,r:70,c:'rgba(235,248,255,.9)'}];
  await say(null,'Behind you, Pip starts to sing. Loudly. Badly.');
  await fade(1,true,1300);await sleep(400);
  await fade(1,false,700);MODE='black';FD.lights=null;FD.pose=0;K.dx=0;despawn('king');despawn('pip');despawn('grab');AU.music('');
  await crawl(['...']);
  loadMap('whiteforest',7,8,'down');MODE='field';AU.music('pale');await fade(1,true,0);await fade(0,true,1600);mapToast('The Pale Wood');
  setF('pipgone');setF('forest');await STORY.paleWake()}

/* ===================== Chapter 1: the Pale Wood ===================== */
const AS='Aster';
// dialogue where Aster speaks from inside Lift: her light shows at his chest while she talks
async function talk(arr){for(const [who,t] of arr){FD.aglow=(who===AS||who==='White Fairy')?1:0;await say(who,t)}FD.aglow=0}
async function chapterEnd(n,next){AU.play('level');
  await say(null,`<div class="gold" style="text-align:center;letter-spacing:.14em">— END OF CHAPTER ${n} —</div><div class="small" style="text-align:center;margin-top:.2rem">${next}</div>`)}

Object.assign(STORY,{
async paleWake(){FD.busy++;FD.pose='kneel';FD.dir='down';FD.tremble=1;await sleep(400);
  await lines([[null,'Birdsong. Cold dew.'],[LF,'Pip.']]);
  FD.aglow=1;await say(null,'Something warm moves in your chest, like a second heartbeat.');FD.aglow=0;
  FD.pose=0;await lines([[LF,'Who\'s there?'],[null,'No answer. Your hands are shaking.']]);
  FD.tremble=0;setF('aster');FD.busy=Math.max(0,FD.busy-1);saveGame(0);
  await say(null,'<span class="small">White mushroom rings heal you and let you save.</span>')},
async pwRing(){const c=await ask(null,'A ring of white mushrooms. The air inside it is warm.',['Rest here','Walk on'],{cancel:1});if(c!==0)return;
  FD.busy++;AU.play('heal');FD.aglow=1;await fade(1,true,350);healAll();await sleep(450);await fade(0,true,500);FD.aglow=0;FD.busy=Math.max(0,FD.busy-1);
  await say(null,'HP is full.');
  if(!F('ringtalk')){setF('ringtalk');await say(LF,'Pip makes these out of pebbles.')}
  const v=await ask(null,'Save your journey?',['Save','Not now'],{cancel:1});if(v===0)await menuSave()},
pwTalk1(){setF('pwt1')},
async pwPack(){setF('pack');face('me','up');AU.music('');FD.tremble=1;
  await lines([[null,'Something moves between the white trunks. Wolves.'],[null,'Your sword arm won\'t stop shaking.']]);
  spawn({id:'alpha',x:FD.x,y:FD.y-2,mon:['wolf','alphawolf'],fixed:1});AU.play('swirl');await sleep(500);FD.tremble=0;
  const r=await startBattle(['palewolf','alphawolf','palewolf'],{bg:'forest',noFlee:1});despawn('alpha');if(r==='lose')return;AU.music('pale');
  await say(LF,'My hands stopped.')},
pwTalk2(){setF('pwt2')},
wtree(){return lines([[null,'The bark is white and warm, like a hand.']])},
stagTalk(){return lines([['The Pale Stag',F('stag')?'Go.':'...']])},
async stagScene(){face('me','up');AU.music('');
  await talk([[null,'Beneath the white tree, something lifts its head.']]);
  {const p=[];let x=FD.x;while(x<8){p.push('right');x++}while(x>8){p.push('left');x--}if(p.length)await walkMe(p);face('me','up')}
  await walkNpc('stag',['down','left','down']);
  await lines([['The Pale Stag','Little light. You came back.'],[null,'The light in your chest says nothing.'],['The Pale Stag','Silent, still. The last one you chose came back red.'],
    [LF,'Chose?'],['The Pale Stag','Show me you are not him, boy.']]);
  if(!await boss('palestag',{bg:'forest',noFlee:1})){return}
  AU.music('ending');
  await talk([['The Pale Stag','You are not him. Not yet.'],[null,'Light drips from the white tree like rain, straight into your chest.']]);
  FD.aglow=1;AU.play('heal');await fade(1,true,500);healAll();await sleep(500);await fade(0,true,700);FD.aglow=0;
  await talk([['The Pale Stag','Take this.']]);await getItem('antler');
  await walkNpc('stag',['right','up','up']);face('stag','left');setF('stag');setF('lbboost');AU.music('pale');AU.play('level');
  await say(null,'<span class="gold">Your Limit fills faster now.</span>');saveGame(0)},
async fhArrive(){setF('fh');const n=npc('fh_farmer');FD.busy++;
  if(n){n.wander=0;n.mv=0;n.x=FD.x-1;n.y=FD.y-1;n.ox=n.oy=0;n.dir='down';await walkNpc('fh_farmer',['down']);face('fh_farmer','right');face('me','left')}
  await talk([['Farmer','You came from Millbrook? We saw the smoke.'],[LF,'Yes, sir. It\'s bad.'],['Farmer','Gods. The inn\'s the red roof.']]);
  if(n)n.wander=1;FD.busy=Math.max(0,FD.busy-1)},
fhFarmer(){return lines([['Farmer',F('poster')?'You sent three Red Pass off like crows off a fence. My wife wants to feed you.':'Red roof\'s the inn. Ida\'s the blue one, with the herbs out front.']])},
fhGranny(){return lines([['Old Woman',F('poster')?'Alive, the notice says. Nothing good wants a boy alive.':'A rider came through at dawn. He says the bandits are running the Millbrook mill now.']])},
fhLad(){return lines([['Lad','My da says the Red Pass will be here by harvest.']])},
fhGirl(){return lines([['Girl',F('poster')?'Can I hold the sword? Half a second?':'I have a big brother too. He\'s useless. Is yours?']])},
fhSmith(){return shop('Brenna the Smith','Iron and hide. It holds.',['ironsword','hidecoat','wolffang',...(F('poster')?['redknives']:[]),...(F('tobin')?['millfork']:[])])},
fhEast(){pushBack();return lines([[LF,'Ida first.']])},
fhPeddler(){return shop('Peddler','Tonics, water, and something for bites.',['tonic','deeptonic','pearlwater','clearwater'])},
fhLookout(){return lines([['Lookout',F('poster')?'That woman with you is Red Pass.':'Road north is no good. Red cloaks on the ridge.']])},
async fhNorth(){pushBack();await lines([['Lookout','Not that way. That road runs straight into the Red Pass.']])},
fhDoor(){pushBack();return lines([[null,'A sign on the door: "GONE TO MY SISTER\'S. DON\'T TOUCH THE CHICKENS."']])},
fhSmithDoor(){pushBack();return lines([[null,'The smithy. Brenna sells out front.']])},
fhBoard(){return F('poster')?lines([[null,'<span class="gold">WANTED ALIVE: THE WALL OF MILLBROOK.</span> 1,000 coins.'],[null,'<span class="gold">WANTED, ANY CONDITION: SABLE, DESERTER.</span> 300 coins.']]):
  lines([[null,'A notice board. "Lost goat: found." "Lost goat: lost again."']])},
fhInn(){return inn('Marta',12)},
fhDrinker(){return lines([['Woodcutter','Wolves have been coming out of the Pale Wood all week.']])},
idaTalk(){return lines([['Ida',F('poster')?'The Lakestone is east, past the mill road.':'Get some sleep at the inn.']])},
async idaScene(){setF('ida');FD.busy++;face('me','up');face('ida','down');
  await lines([['Old Woman','Come into the light.'],[null,'She looks at you for a long time.'],['Old Woman','There\'s something white in your eyes.'],[null,'She sits down, hard.'],
    ['Ida','I saw that light once. Sixty-one years ago, it walked me home through a blizzard.'],['Ida','There was a tall boy with it. Whatever happened to him?']]);
  FD.aglow=1;await say(null,'Something in your chest goes cold.');FD.aglow=0;
  await lines([[LF,'I don\'t know.'],[null,'She presses a folded map into your hands.']]);
  await getItem('idamap');await getItem('remedy',2);
  await talk([['Ida','Get some sleep at the inn.']]);
  FD.busy=Math.max(0,FD.busy-1);saveGame(0)},
async fhPoster(){FD.busy++;AU.music('');
  await say(null,'Hammering, from the square.');
  await fade(1,false,450);const nl=npc('fh_lookout');if(nl)nl.visible=false;
  FD.x=14;FD.y=10;FD.ox=FD.oy=0;FD.dir='up';S.x=14;S.y=10;initTrail();
  spawn({id:'sc1',x:13,y:9,look:'bandit1',dir:'up'});spawn({id:'sc2',x:15,y:9,look:'bandit2',dir:'up'});spawn({id:'scb',x:14,y:7,look:'brute1',dir:'down'});
  await fade(0,false,450);await sleep(300);face('sc1','down');face('sc2','down');
  await talk([['Bandit Scout','Hold on. That sword... that\'s him.'],['Bandit Brute','Alive, the notice says. Shame.'],['???','Touch him and you\'ll be the one on a notice.']]);
  spawn({id:'sable',x:19,y:7,look:'sable',dir:'left'});await walkNpc('sable',['left','left','left','left']);face('sable','left');
  await talk([['Bandit Scout','Sable? The deserter?'],[SB,'In the flesh.']]);
  despawn('sable');joinSable();AU.play('level');await say(null,'<span class="gold">Sable joins you.</span>');
  const r=await startBattle(['scout','brute','scout'],{bg:'town',noFlee:1});if(r==='lose'){FD.busy=Math.max(0,FD.busy-1);return}
  await Promise.all([walkNpc('sc1',['up','up','left','left','up','up','up','up','up','up']),walkNpc('sc2',['up','up','left','left','left','left','left','up','up','up','up','up','up']),walkNpc('scb',['left','left','left','up','up','up','up','up','up'])]);
  despawn('sc1');despawn('sc2');despawn('scb');if(nl)nl.visible=true;
  AU.music('sad');
  await talk([[null,'Two notices, nailed side by side.'],[null,'<span class="gold">WANTED ALIVE: THE WALL OF MILLBROOK.</span> 1,000 coins.'],[null,'<span class="gold">WANTED, ANY CONDITION: SABLE, DESERTER.</span> 300 coins.']]);
  addItem('notice');
  await talk([[LF,'Why are you here?'],[SB,'I\'m the one who carried her.'],[null,'There\'s a bite mark on her hand, small and deep.'],[LF,'Then you can help me bring her home.'],
    [SB,'She\'s alive. In the mill. He wants her alive.'],[LF,'Why?'],[SB,'He talks to that red sword at night. Like it used to talk back.'],
    [null,'The light in your chest goes very still.'],[SB,'I\'m not calling you Wall.'],[LF,'That\'s fine. It\'s just Lift.']]);
  setF('poster');FD.busy=Math.max(0,FD.busy-1);saveGame(0);
  await chapterEnd(1,'Head east from Fernhollow for Chapter 2.')},
});

/* ===================== Chapter 2: the Lakestone ===================== */
const TB='Tobin',DC='Dace';
function joinTobin(){if(S.party.includes('tobin'))return;const lv=Math.max(1,S.heroes.lift.lv-1);S.heroes.tobin=mkHero('tobin',lv);S.party.push('tobin');initTrail()}
function patchBridge(m){for(const y of [6,7]){const r=m.rows[y];m.rows[y]=r.slice(0,21)+'d'+r.slice(22)}}
Object.assign(STORY,{
async c2Start(){setF('c2');await talk([[SB,'Red Pass moves grain down this road.'],[LF,'Millbrook\'s grain.']]);saveGame(0)},
c2Way(){pushBack();return lines([[null,'The waystation burned days ago. Scratched into the doorframe: "THEY TOOK THE HORSES. WE WENT EAST."']])},
c2Cloak(){return lines([['Red Cloak','Road\'s closed.']])},
async c2Check(){face('me','right');AU.music('');
  await talk([['Red Cloak','Road\'s closed, friend.'],[SB,'Hello, Dace.'],[DC,'Sable? Gods. Of all the roads.'],[SB,'Let us through.'],[DC,'You know I can\'t.'],[SB,'I know.']]);
  const r=await startBattle(['redcloak','redcloak'],{bg:'town',noFlee:1});if(r==='lose')return;
  await talk([[DC,'Hollis is on the lake. He drove a red spike into the old stone.'],[SB,'Go home, Dace.'],[DC,'Home\'s the Pass.'],[SB,'Then go somewhere else.'],
    [null,'You look at her. She doesn\'t look back.']]);
  await Promise.all([walkNpc('rc1',['right','right','up','up','up']),walkNpc('rc2',['right','right','down','down','down'])]);despawn('rc1');despawn('rc2');setF('check');refreshNpcs();saveGame(0);AU.music('road')},
async c2Bridge(){face('me','right');FD.busy++;AU.music('');
  await talk([[null,'The bridge is broken. The middle planks are gone.']]);
  spawn({id:'tob',x:19,y:10,look:'tobin',dir:'up'});AU.play('swirl');await walkNpc('tob',['up','up']);face('tob','up');face('me','down');
  await talk([['???','Stay back! I\'ve got a pitchfork!'],[LF,'Tobin?'],[TB,'Lift! They said you were dead.'],[LF,'Pip?'],[TB,'In the grain loft. She sings every night.'],[LF,'Badly?'],[TB,'So badly.'],
    [null,'For the first time since Millbrook, you laugh.'],[TB,'That\'s the one who took her.'],[SB,'Yes.'],[LF,'She\'s helping me bring her home.'],[TB,'Then I\'m coming.'],
    [LF,'You\'ve never been in a fight.'],[TB,'Neither had you. Not a real one.']]);
  await fade(1,false,500);AU.play('door');await sleep(350);AU.play('door');patchBridge(FD.map);FD.foam=null;despawn('tob');joinTobin();setF('bridge');setF('tobin');await sleep(300);await fade(0,false,500);
  AU.play('level');await say(null,'Tobin drags the planks out of the river and lays them across the gap. <span class="gold">Tobin joins you.</span>');
  FD.busy=Math.max(0,FD.busy-1);saveGame(0);AU.music('road')},
async c2Lake(){setF('lake0');await talk([[null,'Near the shore, the lake is the color of rust.'],[TB,'We swam here last summer.']])},
async c2Goat(){setF('goat');
  await talk([[TB,'Do you have a family, Sable?'],[SB,'They sold me to the Pass when I was twelve. For a goat.'],[TB,'A whole goat?'],[SB,'A small goat.'],[TB,'You\'re worth at least two.']])},
c2Hut(){pushBack();return lines([[null,'A note on the door: "Red men on the island. They took my boat. — Perch"']])},
c2Stone(){return lines(F('spike')?[[null,'The Lakestone is cool and quiet. The crack is still there.']]:[[null,'The stone hums under the red spike.']])},
c2Hollis(){return lines([['Hollis',F('spike')?'...':'Patience. It\'s nearly full.']])},
async c2Boss(){face('me','up');AU.music('');FD.busy++;
  await talk([['Hollis','Well. The wall, the deserter, and the miller\'s boy.'],['Hollis','The King said you\'d come crawling here, hungry for light. Like he used to be.'],
    [LF,'I\'d really rather you pulled that thing out of the stone.'],['Hollis','When it\'s full. Not a moment before.'],[LF,'Okay. We\'ll do it, then.']]);
  const r=await startBattle(['redcloak','hollis','redcloak'],{bg:'lakered',noFlee:1,music:'boss'});if(r==='lose'){FD.busy=Math.max(0,FD.busy-1);return}
  despawn('lc1');despawn('lc2');
  await talk([['Hollis','He isn\'t even angry yet.'],[null,'You grab the spike and pull. The red drains out of the lake all at once.']]);
  setF('spike');refreshNpcs();AU.music('ending');FD.aglow=1;
  await talk([[null,'The stone is cold under your hand. Then it isn\'t.']]);FD.aglow=0;
  await fade(1,true,900);MODE='black';
  await crawl(['A tall young man kneels where you are standing. A white light sits in his chest, the way it sits in yours.',
    'Years pass in a breath. He kneels here again, older. The light in him is thin now, and pink at the edges.',
    'The last time, he doesn\'t kneel. He strikes the stone with a red sword, and it cracks.']);
  MODE='field';await fade(0,true,900);
  FD.aglow=1;await say(null,'For the first time since Millbrook, the light in your chest speaks.');setF('named');
  await talk([[LF,'That was him. The King.'],[AS,'Corin. My name is Aster. I lived in him for twenty-two years.'],[AS,'Every time he broke his limit, he burned a little of me. I never told him to stop.'],
    [AS,'What was left of me turned red. It\'s in his sword.'],[LF,'And every time I—'],[AS,'Yes.'],[LF,'Why didn\'t you tell me?'],[AS,'Because you\'d stop. And you\'d die.'],
    [null,'The Lakestone hums. Its light settles in your chest.']]);
  setF('lake');S.burn=Math.max(0,(S.burn||0)-4);AU.play('level');healAll();
  await say(null,'<span class="gold">Your Limit fills faster still.</span>');
  AU.music('sad');
  await talk([['Hollis','He wants her back, little light. He\'ll trade. The girl for you.'],[TB,'We\'re not trading her.'],[null,'You don\'t say anything.'],[LF,'We\'re going back to Millbrook.']]);
  setF('c2done');refreshNpcs();FD.busy=Math.max(0,FD.busy-1);saveGame(0);
  await chapterEnd(2,'Chapter 3 comes in a later update.')},
});
