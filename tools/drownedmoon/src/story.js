/* ===================== STORY: scenes and conversations ===================== */
const M='Marin',PE='Pell',YS='Ysolde',CO='Corvane';
const npc=id=>FD.npcs.find(n=>n.id===id);
function spawn(def){const n={hx:def.x,hy:def.y,ox:0,oy:0,dir:'down',wt:999,mv:0,visible:true,...def};FD.npcs.push(n);return n}
function despawn(id){FD.npcs=FD.npcs.filter(n=>n.id!==id)}
async function walkNpc(id,path){const n=npc(id);if(!n)return;for(const d of path){const [dx,dy]=DIRS[d];n.dir=d;n.x+=dx;n.y+=dy;n.mv=1;n.mvp=0;n.ox=-dx*16;n.oy=-dy*16;while(n.mv)await frames(1)}}
async function walkMe(path){for(const d of path){const [dx,dy]=DIRS[d];FD.dir=d;FD.x+=dx;FD.y+=dy;FD.moving=1;FD.mp=0;FD.scripted=1;FD.boatMove=0;FD.ox=-dx*16;FD.oy=-dy*16;while(FD.moving)await frames(1)}FD.scripted=0;S.x=FD.x;S.y=FD.y}
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
  for(const t of crawl){const w=win('',`<div style="text-align:center;line-height:1.5">${t}</div>`,{left:'8%',right:'8%',top:'38%',background:'none',border:'0',boxShadow:'none'});w.style.opacity=0;w.style.transition='opacity .8s';
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
