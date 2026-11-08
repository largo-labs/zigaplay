/* ================= the people of Port Ember =================
   Looks for faces and bodies (art.js draws them all from these). */
const PEOPLE={
  milo:{name:'MILO BRASS',skin:'#8a5536',hair:'curly',hairCol:'#1c130f',eye:'#2a1a10',gloves:'#d8322b',trunks:'#1f3a7a',trim:'#f2c14e',outfit:'hoodie',outCol:'#35507a'},
  dot:{name:'AUNTIE DOT',skin:'#c99674',hair:'bun',hairCol:'#cfcac4',eye:'#3a2c24',glasses:1,outfit:'cardigan',outCol:'#7c4867',lips:'#a0605c',old:1},
  ann:{name:'ANNOUNCER',skin:'#e0b896',hair:'slick',hairCol:'#3b2a1c',eye:'#2a2018',outfit:'tux',outCol:'#16151d',mustache:'#3b2a1c'},
  sable:{name:'VICTOR SABLE',skin:'#d9b38e',hair:'slick',hairCol:'#141018',streak:'#cfd0d8',eye:'#2a1a22',mustache:'#141018',outfit:'robe',outCol:'#4a2768',
    gloves:'#6a2c96',trunks:'#2a1838',trim:'#e5bd4f',chain:1,build:{w:27,h:46,r:11.5,arm:7,gl:9.5,s:1}},
  gus:{name:'GUS MAHONEY',skin:'#e9b48f',hair:'bald',hairCol:'#b88a6a',eye:'#3a4a2a',stubble:'#9a7a62',gloves:'#5e9c3c',trunks:'#2f6b2a',trim:'#e8e2c8',hairy:1,
    build:{w:31,h:44,r:12.5,arm:8.5,gl:10,s:1,belly:1}},
  vex:{name:'TINY VEX',skin:'#f1c6a4',hair:'spiky',hairCol:'#ef7a2a',eye:'#2e5a3a',freckles:1,bandana:'#2bb3a6',gap:1,gloves:'#2bb3a6',trunks:'#1d2b3a',trim:'#ef7a2a',top:'#1d2b3a',
    build:{w:22,h:40,r:11,arm:6,gl:8.5,s:.86}},
  hal:{name:'BROTHER HALLORAN',skin:'#d7a684',hair:'shaved',hairCol:'#7a6a5c',eye:'#3a3028',beard:'#b9b2a8',gloves:'#8a5a2c',trunks:'#5a3a22',trim:'#d8c49a',rope:1,
    build:{w:26,h:50,r:11.5,arm:7,gl:9,s:1}},
  volk:{name:'SERGEI VOLKOV',skin:'#efd6c8',hair:'buzz',hairCol:'#e8e6dc',eye:'#5ab8e8',scar:1,gloves:'#e9f4fb',trunks:'#2a5a8a',trim:'#e9f4fb',
    build:{w:29,h:46,r:11.5,arm:8,gl:9.5,s:1,cut:1}},
  lola:{name:'LOLA CADENA',skin:'#c9926a',hair:'bun',hairCol:'#1a0f14',eye:'#2a1610',lips:'#c0263a',flower:'#e8263c',earrings:1,gloves:'#c0263a',trunks:'#141018',trim:'#e5bd4f',top:'#c0263a',
    build:{w:23,h:44,r:11,arm:6,gl:8.5,s:.95}},
  tide:{name:'BIG TIDE BARAKA',skin:'#6e4430',hair:'locs',hairCol:'#151010',eye:'#1a1010',beard:'#151010',gloves:'#e8b62c',trunks:'#1b3d6b',trim:'#e8b62c',tattoo:1,
    build:{w:37,h:50,r:13,arm:10,gl:11.5,s:1.06,cut:1}}};
/* the rings */
const VENUES={
  gym:{name:'THE BELL & ANCHOR',place:'Anchor Street basement',song:'gym',rope:['#c9302c','#f0ece0','#2c4a9a'],post:'#c8963a',canvas:'#e8e0cc',apron:'#7a2a24'},
  pier:{name:'FISH MARKET PIER',place:'The waterfront, midnight',song:'pier',rope:['#c8a46a','#c8a46a','#c8a46a'],post:'#5a4632',canvas:'#a9b4bc',apron:'#2a3a52'},
  chapel:{name:"ST. BRINE'S HALL",place:'Under the bell tower',song:'chapel',rope:['#c9a44a','#7a2434','#c9a44a'],post:'#5a3a24',canvas:'#efe4c8',apron:'#5a1c28'},
  ice:{name:'COLD ROW ICE HOUSE',place:'Loading dock 4',song:'ice',rope:['#e9f6ff','#7cc8ec','#e9f6ff'],post:'#9ab4c8',canvas:'#dceaf4',apron:'#2a4a6a'},
  roof:{name:'VELVET LANTERN ROOF',place:'Seven floors up, in the rain',song:'roof',rope:['#ff3ea5','#3ee8ff','#ff3ea5'],post:'#2a2232',canvas:'#3a3448',apron:'#1a1424'},
  dock:{name:'HARBOR DRYDOCK',place:'Under the cranes at sunset',song:'dock',rope:['#f2c12e','#1a1a1a','#f2c12e'],post:'#3a3a40',canvas:'#8c9096',apron:'#4a2a1a'},
  crown:{name:'THE CROWN ARENA',place:'Title night',song:'crown',rope:['#e5bd4f','#7a3ab0','#e5bd4f'],post:'#e5bd4f',canvas:'#2a3c8a',apron:'#3a1a56'}};

/* ================= the fighters =================
   Dodge patterns: L R U D are the D-pad (the way to slip; U leans back from an uppercut, D ducks a hook), '.' is a
   rest beat and '*' marks a feint (a fake: don't move). Tiers get harder by round and after knockdowns.
   Counters: A, B, A+B (both together); beats are spaces, 'A,B' puts two punches half a beat apart.
   beat = seconds between punches, win = how early (s) a slip still counts, cbeat = seconds between your punches. */
const OPP=[
  {id:'gus',p:'gus',venue:'gym',nick:'BUCKET',from:'Crane operator, Anchor St.',rec:'0-12-3',ht:"6'1\"",wt:'262 lb',
   beat:.78,win:.42,cbeat:.95,wait:[1.5,2.3],dmg:8,def:1.35,kds:2,up:[4,6],
   pats:[['L','R','L R'],['L R L','R . R','R L'],['L R D','R L R','D L R']],
   counters:['A B','A A B','B A B'],
   taunts:['Hold still, kid!','Ooh, I felt a breeze!','Pickled egg break soon?'],
   tips:['He telegraphs everything. Wait for the ring, then slip.','You found his rhythm. Now just stay in it.']},
  {id:'vex',p:'vex',venue:'pier',nick:'THE PIER SPARROW',from:'Fish Market, Pier 9',rec:'31-4',ht:"5'1\"",wt:'111 lb',
   beat:.42,win:.3,cbeat:.55,wait:[.6,1.1],dmg:6,def:1.15,kds:3,up:[5,7],
   pats:[['R R','L L R','R R R L','L R'],['R L R L','D R R','L L L R','R R D'],['R R L L D','R L R L R','D D R R','L R L R D']],
   counters:['A A B B','A B A B','A,A B'],
   taunts:['Too slow, rope-boy!','I talk AND punch!','Look, a gull! Ha, made you look!','Fast fast fast!'],
   tips:['Short bunches. Let them come, don\'t chase.','Her combo is quick: tap tap, tap tap.']},
  {id:'hal',p:'hal',venue:'chapel',nick:'THE QUIET BELL',from:"St. Brine's Hall",rec:'44-9',ht:"6'3\"",wt:'188 lb',
   beat:.56,win:.34,cbeat:1,wait:[1.4,2.4],dmg:10,def:1,kds:3,up:[6,8],
   pats:[['R R D U','D . . R','L . U'],['R . . . R L','U . D . . L','R R D U'],['R L . . . U D','D . R . . . L R','R R D U . L']],
   counters:['A A+B B B','B A A+B','A B B A+B'],
   taunts:['Patience, son.','The bell keeps its own time.','Breathe.'],
   tips:['He pauses on purpose. Don\'t jump early.','When he\'s open: A, A+B, B, B. About a second apart.']},
  {id:'volk',p:'volk',venue:'ice',nick:'THE FREEZER',from:'Cold Row, Olympic silver',rec:'38-2',ht:"6'2\"",wt:'205 lb',
   beat:.52,win:.34,cbeat:.8,wait:[1,1.6],dmg:10,def:.95,kds:3,up:[6,8],freeze:1,punish:1,
   pats:[['R L D','L R U','D D'],['R R L U','D L R L','U R R'],['U D R L R','L L R D U','R D L U R']],
   counters:['A+B A B','A A+B A+B','B B A A+B'],
   taunts:['Cold.','You will forget.','Nuisance removed soon.'],
   tips:['His arrows freeze halfway. Memorize the pattern early.','Don\'t throw lazy punches between his combos. He counters.']},
  {id:'lola',p:'lola',venue:'roof',nick:'LA LLAMA',from:'The Velvet Lantern',rec:'27-3',ht:"5'7\"",wt:'138 lb',
   beat:.48,win:.32,cbeat:.7,wait:[.8,1.4],dmg:10,def:1,kds:3,up:[6,8],feint:1,
   pats:[['R *L L','*D D R','L *R R'],['L *R R L','*U U D R','R R *L L'],['R *R L *L L','D *D U R *L L','*R R *L L D']],
   counters:['A,B B A+B','A A,B A+B','B,A B,A A+B'],
   taunts:['Half my steps are lies, querido.','Dance with me.','Olé!'],
   tips:['Hollow blinking arrows are fakes. Don\'t move for those.','Her combos skip: A-B quick, then the big one.']},
  {id:'tide',p:'tide',venue:'dock',nick:'BIG TIDE',from:'Harbor Drydock',rec:'40-6',ht:"6'7\"",wt:'310 lb',
   beat:.66,win:.32,cbeat:.85,wait:[1.5,2.2],dmg:15,def:.85,kds:3,up:[7,9],punish:1,
   pats:[['D R L','R R D','L L U'],['L R D U','D D R L','R L R U'],['R L R D U','L R L U D D','D R L R L U']],
   counters:['A+B A+B','A B A+B A+B','A,A B,B A+B'],
   taunts:['Tide comes for everyone.','Steady now.','Ho! Good!'],
   tips:['Every punch is a wrecking ball. One mistake costs plenty.','Long combos. Breathe through them.']},
  {id:'sable',p:'sable',venue:'crown',nick:'THE VELVET HAMMER',from:'Sable Promotions',rec:'52-1',ht:"6'0\"",wt:'176 lb',
   beat:.46,win:.29,cbeat:.66,wait:[.7,1.2],dmg:14,def:.8,kds:3,up:[8,9],feint:1,punish:1,
   pats:[['R L D','*R R U','L R L'],['L R *D D U','R R L D','U *L L R'],['R *L L D U R','U D *R R L L','L L *R R D U']],
   counters:['A B A+B B','A,B A,B A+B','B A A+B A+B'],
   rage:{beat:.39,win:.27,freeze:1,cbeat:.6,counters:['A,B A+B B,A A+B','A A,B A+B A+B']},
   taunts:['My ring. My rules.','Nice gloves. Dead man\'s gloves.','The deed says I win.'],
   tips:['He fakes and he counters. Be patient.','When he gets mad he gets fast. You stay calm.']}];
const OIX=Object.fromEntries(OPP.map((o,i)=>[o.id,i]));

/* ================= the story =================
   Each scene happens somewhere (a venue's backdrop) and is a list of [who, line, face]. */
const SCENES={
  prologue:{bg:'gym',lines:[
    ['','Port Ember. Rain on the harbor, rust on everything. On Anchor Street one light still burns: the Bell & Anchor gym.'],
    ['dot','Again, Milo. Hands up. Your daddy didn\'t hang that bell so you could slap the bag like it owes you money.','neutral'],
    ['milo','It does owe me money, Auntie. Everybody in this town owes me money.','grin'],
    ['','The door bangs open. Wet shoes, gold rings, cologne you can taste.'],
    ['sable','Dorothea. Little Brass. Lovely place. Shame about the roof. And the rent. Ninety days late.','smug'],
    ['dot','Cap paid you every cent for ten years, Victor.','angry'],
    ['sable','Cap is gone, and Sable Promotions holds the deed. I\'m turning this dump into lofts. Unless...','smug'],
    ['sable','The Ember Circuit starts this week. Six fighters, then me, for my belt. Win it, and I tear up the debt. Lose once, and you hand me the keys.','grin'],
    ['milo','Deal.','angry'],
    ['dot','Milo!','shock'],
    ['sable','Wonderful. Try not to bleed on my floor. It\'ll be my floor soon.','smug'],
    ['dot','...Fine. If we\'re doing this, we do it right. Gus is downstairs. Go spar.','neutral']]},
  pre0:{bg:'gym',lines:[
    ['gus','Heh. Dot says I gotta knock some sense into ya before the real fights. I\'ll go easy. Mostly.','grin'],
    ['dot','Watch the lane up top. Every arrow is a punch coming. When it reaches the ring on the left, press that way on the D-pad to slip it.','neutral'],
    ['dot','Slip his whole combo and he\'s wide open. Then your punches roll in: A is your left, B your right, A+B together is the haymaker. Hit each one on the ring.','neutral'],
    ['dot','Miss a beat and he shakes it off and comes again. Stay calm. Rhythm wins fights.','grin'],
    ['gus','And pickled eggs. Pickled eggs win fights too.','grin']]},
  post0:{bg:'gym',lines:[
    ['gus','Oof. Kid, you hit like a falling crate. My ears are ringing in two keys.','hurt'],
    ['milo','Sorry, Gus.','grin'],
    ['gus','Don\'t be. Next up is Tiny Vex at the fish market. She talks fast and punches faster. Don\'t listen to the talking.','grin'],
    ['dot','The pier, at midnight. Get some sleep, champ. Not champ yet. Get some sleep.','neutral']]},
  pre1:{bg:'pier',lines:[
    ['ann','Tonight on the Fish Market Pier! A hundred and eleven pounds of pure trash talk: TINY VEX!','grin'],
    ['vex','Ooh, the dock boy! Is it true you smell like rope? You do! You smell like rope and sadness!','grin'],
    ['milo','...Is she always like this?','neutral'],
    ['vex','Always! I\'m fast, I\'m small, and you\'re gonna be looking at the ceiling. Which is the sky! Cause we\'re outside!','grin'],
    ['dot','She throws quick bunches, Milo. Don\'t chase her. Let the beat come to you.','neutral']]},
  post1:{bg:'pier',lines:[
    ['vex','Okay. Okay okay okay. You\'re fast. Not as fast as me. But fast.','hurt'],
    ['vex','Listen, rope-boy. Sable fixes fights. He paid half this pier to bet against you tonight. He\'s scared of you.','neutral'],
    ['milo','Scared of me? Why?','shock'],
    ['vex','Ask the monk. Brother Halloran knew your pop. Bye now! I\'m collecting from the gulls!','grin']]},
  pre2:{bg:'chapel',lines:[
    ['ann','From the hall of St. Brine\'s, fighting for a new orphanage roof: the Quiet Bell, BROTHER HALLORAN!','grin'],
    ['hal','Milo Brass. You have your father\'s shoulders. I rang the bell at his funeral.','calm'],
    ['milo','You knew him?','shock'],
    ['hal','We boxed together, long ago. Then I learned patience. The bell keeps its own time, son. So do I.','calm'],
    ['dot','He pauses, then strikes. Don\'t jump the gun. And when he opens up, it\'s A, A+B, B, B, about a second apart.','neutral']]},
  post2:{bg:'chapel',lines:[
    ['hal','Well struck. The orphans will forgive me. They like you better anyway.','calm'],
    ['hal','Your father lent Victor the money to start Sable Promotions. Victor swore he\'d pay it back. He never did. Then Cap\'s deed went missing.','neutral'],
    ['milo','He stole the gym?','angry'],
    ['hal','I can\'t prove it. But Volkov guards Victor\'s papers at the ice house. Win there, and you may learn more.','calm']]},
  pre3:{bg:'ice',lines:[
    ['ann','Cold Row\'s own frozen nightmare, Olympic silver medalist: SERGEI "THE FREEZER" VOLKOV!','grin'],
    ['volk','Mr. Sable says you are a nuisance. I remove nuisances.','angry'],
    ['milo','You always talk like a refrigerator manual?','grin'],
    ['volk','In my ring, the cold takes your memory. You see my punches once. Then: gone.','angry'],
    ['dot','His arrows freeze over halfway. Read the whole pattern while you can, then do it from memory. And no lazy jabs between his combos. He punishes them.','neutral']]},
  post3:{bg:'ice',lines:[
    ['volk','...I have not been hit like that since the Olympics.','hurt'],
    ['volk','Mr. Sable promised to pay my daughter\'s school if I break you. He promises many people many things.','neutral'],
    ['volk','A dancer, Lola Cadena, keeps his books at the Velvet Lantern. Ask her about the ledger. Tell her the Freezer says the ice has melted.','neutral']]},
  pre4:{bg:'roof',lines:[
    ['ann','Up on the Velvet Lantern rooftop, in the pouring rain: the flame of Ember, LOLA CADENA!','grin'],
    ['lola','So you\'re the boy with the bell. Victor told me to make you dance. Do you dance, Milo?','smug'],
    ['milo','Only when I\'m getting punched.','grin'],
    ['lola','Then let\'s dance. Careful, querido. Half my steps are lies.','grin'],
    ['dot','She fakes. A hollow, blinking arrow is a feint. Don\'t move for it. Only slip the real ones.','neutral']]},
  post4:{bg:'roof',lines:[
    ['lola','Ay. You dance better than you talk.','hurt'],
    ['lola','Here. A page from Victor\'s ledger. Your father\'s deed, signed over the night he died. In Victor\'s own handwriting.','neutral'],
    ['milo','He forged it...','shock'],
    ['lola','Proof means nothing in Port Ember without a belt. Beat Big Tide at the drydock. Then take the Crown from Victor himself.','neutral']]},
  pre5:{bg:'dock',lines:[
    ['ann','Three hundred and ten pounds of shipyard steel! The man who carried an anchor up Harbor Hill: BIG TIDE BARAKA!','grin'],
    ['tide','Little Brass. Your father fixed my crane in the storm of \'09. Didn\'t charge me a cent.','calm'],
    ['tide','But I fight to keep this yard open, and Sable owns its lease too. So I won\'t hold back. The tide comes for everyone.','neutral'],
    ['dot','He\'s slow, but every punch is a wrecking ball. Long combos. One mistake costs plenty. Breathe.','neutral']]},
  post5:{bg:'dock',lines:[
    ['tide','Ha! The tide turned! Go on, Little Brass. Take the Crown. And when you do, tear up my lease too, eh?','grin'],
    ['milo','That\'s a promise.','grin'],
    ['dot','Tomorrow night, the Crown Arena. Victor fights dirty, and when he\'s hurt he gets faster. Get some sleep. Real sleep.','neutral']]},
  pre6:{bg:'crown',lines:[
    ['ann','LADIES AND GENTLEMEN! For the Ember Belt! Your champion, your landlord, your promoter: VICTOR "THE VELVET HAMMER" SABLE!','grin'],
    ['sable','Look at you. A dockworker in a dead man\'s gloves. I\'ll keep the belt, the gym and that ugly bell.','smug'],
    ['milo','Lola gave me the ledger, Victor. Everyone knows what you did.','angry'],
    ['sable','Then I\'ll just have to win in front of everyone.','angry'],
    ['dot','Everything you\'ve learned, Milo. Watch for fakes. Remember the frozen ones. And when he gets mad, you get calmer.','neutral'],
    ['dot','Your daddy\'s bell is listening.','grin']]},
  ending:{bg:'crown',lines:[
    ['ann','IT\'S OVER! THE NEW CHAMPION OF PORT EMBER: MILO "THE BELL" BRASS!','shock'],
    ['sable','No... the deed, the gym... it\'s all mine...','hurt'],
    ['volk','The ice has melted, Mr. Sable. The police are reading your ledger now.','neutral'],
    ['lola','Adiós, Victor. Your books never balanced anyway.','smug'],
    ['dot','The debt is gone. The gym is ours. Your daddy would be... well. He\'d be loud about it.','grin'],
    ['tide','And my lease?','grin'],
    ['milo','Torn up. Everybody\'s is.','grin'],
    ['gus','Pickled eggs for everyone!','grin'],
    ['vex','I bet on you the whole time, rope-boy! Mostly!','grin'],
    ['hal','Ring the bell, Milo.','calm'],
    ['','And over Anchor Street, the old brass bell rings out across the harbor.\n\nTHE END\n\nEvery fighter waits in the CIRCUIT for a rematch.']]}};
/* the story in order: scenes and fights */
const STORY=['s:prologue','s:pre0','f:0','s:post0','s:pre1','f:1','s:post1','s:pre2','f:2','s:post2','s:pre3','f:3','s:post3','s:pre4','f:4','s:post4','s:pre5','f:5','s:post5','s:pre6','f:6','s:ending'];
