/* ================= the people of Port Ember =================
   Looks for faces and bodies (art.js draws them all from these). */
const PEOPLE={
  milo:{jaw:0.8,chin:0.46,build:{w:28,h:46,r:11.5,arm:8,gl:9.5,s:1},name:'MILO BRASS',skin:'#8a5536',hair:'curly',hairCol:'#1c130f',eye:'#2a1a10',gloves:'#d8322b',trunks:'#1f3a7a',trim:'#f2c14e',outfit:'hoodie',outCol:'#35507a'},
  dot:{jaw:0.72,chin:0.4,name:'AUNTIE DOT',skin:'#c99674',hair:'bun',hairCol:'#cfcac4',eye:'#3a2c24',glasses:1,outfit:'cardigan',outCol:'#7c4867',lips:'#a0605c',old:1},
  ann:{jaw:0.8,chin:0.46,name:'ANNOUNCER',skin:'#e0b896',hair:'slick',hairCol:'#3b2a1c',eye:'#2a2018',outfit:'tux',outCol:'#16151d',mustache:'#3b2a1c'},
  sable:{jaw:0.72,chin:0.3,name:'VICTOR SABLE',skin:'#d9b38e',hair:'slick',hairCol:'#141018',streak:'#cfd0d8',eye:'#2a1a22',mustache:'#141018',outfit:'robe',outCol:'#4a2768',
    gloves:'#6a2c96',trunks:'#2a1838',trim:'#e5bd4f',chain:1,build:{w:27,h:46,r:11.5,arm:7,gl:9.5,s:1}},
  gus:{jaw:0.93,chin:0.6,name:'GUS MAHONEY',skin:'#e9b48f',hair:'bald',hairCol:'#b88a6a',eye:'#3a4a2a',stubble:'#9a7a62',gloves:'#5e9c3c',trunks:'#2f6b2a',trim:'#e8e2c8',hairy:1,
    build:{w:31,h:44,r:12.5,arm:8.5,gl:10,s:1,belly:1}},
  vex:{jaw:0.7,chin:0.36,name:'TINY VEX',skin:'#f1c6a4',hair:'spiky',hairCol:'#ef7a2a',eye:'#2e5a3a',freckles:1,bandana:'#2bb3a6',gap:1,gloves:'#2bb3a6',trunks:'#1d2b3a',trim:'#ef7a2a',top:'#1d2b3a',
    build:{w:22,h:40,r:11,arm:6,gl:8.5,s:.86}},
  hal:{jaw:0.78,chin:0.42,name:'BROTHER HALLORAN',skin:'#d7a684',hair:'shaved',hairCol:'#7a6a5c',eye:'#3a3028',beard:'#b9b2a8',gloves:'#8a5a2c',trunks:'#5a3a22',trim:'#d8c49a',rope:1,
    build:{w:26,h:50,r:11.5,arm:7,gl:9,s:1}},
  volk:{jaw:0.86,chin:0.46,name:'SERGEI VOLKOV',skin:'#efd6c8',hair:'buzz',hairCol:'#e8e6dc',eye:'#5ab8e8',scar:1,gloves:'#e9f4fb',trunks:'#2a5a8a',trim:'#e9f4fb',
    build:{w:29,h:46,r:11.5,arm:8,gl:9.5,s:1,cut:1}},
  lola:{jaw:0.68,chin:0.34,name:'LOLA CADENA',skin:'#c9926a',hair:'bun',hairCol:'#1a0f14',eye:'#2a1610',lips:'#c0263a',flower:'#e8263c',earrings:1,gloves:'#c0263a',trunks:'#141018',trim:'#e5bd4f',top:'#c0263a',
    build:{w:23,h:44,r:11,arm:6,gl:8.5,s:.95}},
  tide:{jaw:0.94,chin:0.58,name:'BIG TIDE BARAKA',skin:'#6e4430',hair:'locs',hairCol:'#151010',eye:'#1a1010',beard:'#151010',gloves:'#e8b62c',trunks:'#1b3d6b',trim:'#e8b62c',tattoo:1,
    build:{w:37,h:50,r:13,arm:10,gl:11.5,s:1.06,cut:1}}};
/* the rings */
const VENUES={
  gym:{top:'#5a3328',name:'ANCHOR STREET GYM',place:'Anchor Street basement',song:'gym',rope:['#c9302c','#f0ece0','#2c4a9a'],post:'#c8963a',canvas:'#e8e0cc',apron:'#7a2a24'},
  pier:{top:'#07091e',name:'FISH MARKET PIER',place:'The waterfront, midnight',song:'pier',rope:['#c8a46a','#c8a46a','#c8a46a'],post:'#5a4632',canvas:'#a9b4bc',apron:'#2a3a52'},
  chapel:{top:'#2e1c14',name:"ST. BRINE'S HALL",place:'The old hall, by candlelight',song:'chapel',rope:['#c9a44a','#7a2434','#c9a44a'],post:'#5a3a24',canvas:'#efe4c8',apron:'#5a1c28'},
  ice:{top:'#6a8ea8',name:'COLD ROW ICE HOUSE',place:'Loading dock 4',song:'ice',rope:['#e9f6ff','#7cc8ec','#e9f6ff'],post:'#9ab4c8',canvas:'#dceaf4',apron:'#2a4a6a'},
  roof:{top:'#0b0616',name:'VELVET LANTERN ROOF',place:'Seven floors up, in the rain',song:'roof',rope:['#ff3ea5','#3ee8ff','#ff3ea5'],post:'#2a2232',canvas:'#3a3448',apron:'#1a1424'},
  dock:{top:'#3a1a4a',name:'HARBOR DRYDOCK',place:'Under the cranes at sunset',song:'dock',rope:['#f2c12e','#1a1a1a','#f2c12e'],post:'#3a3a40',canvas:'#8c9096',apron:'#4a2a1a'},
  crown:{top:'#0c0818',name:'THE CROWN ARENA',place:'Title night',song:'crown',rope:['#e5bd4f','#7a3ab0','#e5bd4f'],post:'#e5bd4f',canvas:'#2a3c8a',apron:'#3a1a56'}};

/* ================= the roster =================
   Eight boxers, each with the same basic moves plus three specials of their own:
   S1 = ↓→ + A, S2 = ←→ + B, S3 = ↓← + A (directions relative to the opponent).
   kinds: proj (thrown or punched projectile), dash (rushing punch), rise (rising uppercut), grab (command grab),
   counter (parry stance), armor (heavy punch that takes a hit), multi (spinning hits), slam (leaping ground smash, hits low),
   tele (vanish and reappear behind), leap (leaping overhead), freeze (stuns on hit), flurry (rapid jabs).
   spd: walk speed, pow: damage, hp: health, size: drawn size. */
const ROSTER=[
  {id:'milo',nick:'THE SPARK',venue:'gym',from:'Anchor Street',style:'All-rounder',spd:1,pow:1,hp:1,
   sp:[{k:'proj',n:'EMBER SHOT',c:'#ff8a2a',shape:'fire'},{k:'dash',n:'BLITZ RUSH',c:'#ff5a3a'},{k:'rise',n:'SKY HOOK',c:'#ffd84a'}]},
  {id:'gus',nick:'BUCKET',venue:'gym',from:'Crane operator',style:'Big and tough',spd:.82,pow:1.15,hp:1.18,
   sp:[{k:'proj',n:'HOOK TOSS',c:'#e8f0c8',shape:'egg',arc:1},{k:'multi',n:'WRECKING BALL',c:'#7ad04a'},{k:'slam',n:'GROUND POUND',c:'#c8a87a'}]},
  {id:'vex',nick:'THE PIER SPARROW',venue:'pier',from:'Fish Market, Pier 9',style:'Fast, low damage',spd:1.3,pow:.92,hp:.95,
   sp:[{k:'flurry',n:'MACHINE GUN JABS',c:'#2bd3c6'},{k:'dash',n:'DART RUSH',c:'#2bd3c6',fast:1},{k:'leap',n:'DIVE BOMB',c:'#ef7a2a'}]},
  {id:'hal',nick:'THE MONK',venue:'chapel',from:"St. Brine's Hall",style:'Patient counters',spd:.92,pow:1,hp:1.05,
   sp:[{k:'proj',n:'SHOCKWAVE',c:'#e8d070',shape:'wave',low:1},{k:'armor',n:'BATTERING RAM',c:'#e8d070'},{k:'counter',n:'IRON PARRY',c:'#fff4c0'}]},
  {id:'volk',nick:'THE FREEZER',venue:'ice',from:'Cold Row',style:'Zoner, freezes',spd:.95,pow:1.05,hp:1,
   sp:[{k:'proj',n:'ICE SPEAR',c:'#9ae8ff',shape:'shard'},{k:'armor',n:'AVALANCHE',c:'#9ae8ff',charge:1},{k:'freeze',n:'DEEP FREEZE',c:'#cff4ff'}]},
  {id:'lola',nick:'LA LLAMA',venue:'roof',from:'The Velvet Lantern',style:'Tricky mix-ups',spd:1.12,pow:1,hp:1,
   sp:[{k:'tele',n:'SMOKE STEP',c:'#ff4a3a'},{k:'multi',n:'FIRE TORNADO',c:'#ff4a3a'},{k:'leap',n:'MATADOR DROP',c:'#ffb02a'}]},
  {id:'tide',nick:'BIG TIDE',venue:'dock',from:'Harbor Drydock',style:'Grappler, huge hits',spd:.78,pow:1.25,hp:1.22,
   sp:[{k:'proj',n:'TIDAL WAVE',c:'#5ab0ff',shape:'wave'},{k:'grab',n:'UNDERTOW',c:'#5ab0ff'},{k:'slam',n:'DEPTH CHARGE',c:'#e8b62c'}]},
  {id:'sable',nick:'THE VELVET HAMMER',venue:'crown',from:'Sable Promotions',style:'Boss: does it all',spd:1.05,pow:1.08,hp:1.05,
   sp:[{k:'proj',n:'GOLD COIN',c:'#f2c14e',shape:'coin'},{k:'tele',n:'SHADOW STEP',c:'#a86ae8'},{k:'rise',n:'DEMON UPPERCUT',c:'#a86ae8'}]}];
const RIX=Object.fromEntries(ROSTER.map((f,i)=>[f.id,i]));
const SPIN=['↓→ A','←→ B','↓← A'];
