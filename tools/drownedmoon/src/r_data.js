/* ===================== STRIKE AT NIGHT, the second telling (lore 4): data =====================
   Lift was a tech worker in 2026. A car, a white flash, and he wakes up in Larkfield as a farm boy who is also
   called Lift. That night his new parents are killed and he is blamed. Now he lives with the Crows, a bandit gang,
   with a price on his head. When he beats a strong enemy, he takes its power for himself as a new form. */

// the people who fight beside him
Object.assign(HEROES,{
  jun:{name:'Jun',cls:'Thief',look:'jun',cmd:'Special',wt:'knife',big:1,
    base:{hp:176,mp:20,atk:27,def:15,mag:10,spd:25},grow:{hp:14,mp:2.2,atk:2.7,def:1.6,mag:1,spd:1.8},
    learn:[[1,'cheapshot']]},
  moss:{name:'Moss',cls:'Woodcutter',look:'moss',cmd:'Special',wt:'axe',big:1,
    base:{hp:250,mp:12,atk:27,def:23,mag:12,spd:11},grow:{hp:19,mp:1.2,atk:2.6,def:2.2,mag:1.2,spd:1},
    learn:[[1,'stew']]},
});
Object.assign(SKILLS,{
  hunt:{name:'Hunt',mp:0,cp:2,tgt:'foe',el:'phys',kind:'phys',pow:1.1,hits:2,st:'poison',chance:.45,desc:'Two fast bites at the same foe. May make it bleed.',fx:'claw'},
  ironwall:{name:'Iron Wall',mp:0,cp:2,tgt:'none',desc:'Plant your feet. The party takes 40% less damage this round, and foes come for you.',fx:'guard',first:1,taunt:1},
  cheapshot:{name:'Cheap Shot',mp:0,cp:2,tgt:'foe',el:'phys',kind:'phys',pow:2.1,st:'poison',chance:.5,desc:'Somewhere it really hurts. May poison.',fx:'slash'},
  stew:{name:'Hot Stew',mp:0,cp:2,tgt:'allies',kind:'heal',pct:.3,cure:1,desc:'Moss always has some. Heals every ally 30% and cures poison.',fx:'heal'},
});
/* Lift's forms. Each changes how he looks, his special, his ult, and which way his stats lean.
   He takes a new one from each strong enemy he beats, and can change between them any time outside battle. */
const FORMS={
  base:{name:'Drifter',short:'Drifter',sk:'whirl',ult:'reset',from:'',desc:'Just you. A farm boy\'s body and a borrowed sword.',lean:'Even',
    mod:{},look:c=>c},
  hound:{name:'Hound Form',short:'Hound',sk:'hunt',ult:'packrun',from:'Garrick the Hound',desc:'Garrick\'s speed, and his nose. Fast and fierce, a little fragile.',lean:'SPD ▲▲ ATK ▲ DEF ▼',
    mod:{spd:1.4,atk:1.1,def:.85,hp:.92},look:c=>({...c,ostyle:'coat',top:'#3a3a44',acc:'#c8b08a',bot:'#26262c',boot:'#2a2020',eye:'#e8a822',cape:'#7a6a58',hw:'none',blade:'knives',hilt:'#c8b08a'})},
  iron:{name:'Iron Form',short:'Iron',sk:'ironwall',ult:'anvil',from:'Sir Kell',desc:'Sir Kell\'s armor, and his weight. Slow, and very hard to hurt.',lean:'DEF ▲▲ HP ▲ SPD ▼',
    mod:{def:1.55,hp:1.22,atk:1.05,spd:.8},look:c=>({...c,ostyle:'armor',hw:'helmet',top:'#3e4a6a',acc:'#c8ccd8',cape:'#6a1218',boot:'#5a5a60',bot:'#2a2e3a',hilt:'#c8ccd8'})},
};
const FORM_ORDER=['base','hound','iron'];
const FORM_ULTS={
  reset:{name:'Hard Reset',desc:'Everything you\'ve got, in one wide swing. Hits up to 3 foes.',max:3,pow:3.3,fx:'moon',col:['#ffffff','#e0f6ff','#bfe6ff']},
  packrun:{name:'Pack Run',desc:'Six fast hits, wherever the foes are.',hits:6,pow:1.3,fx:'claw',col:['#ffffff','#ffe2a0','#e8a822']},
  anvil:{name:'Anvil',desc:'One blow, all your weight behind it. One foe.',max:1,pow:6.6,fx:'slam',col:['#ffffff','#dfe6f2','#8a94ac']},
};

Object.assign(ITEMS,{
  poster:{name:'Wanted Poster',key:1,view:'poster',desc:'Your face, more or less. Choose it to take a look.'},
  eyeletter:{name:'Sealed Letter',key:1,desc:'"The boy is loose. Bring him in alive." Sealed with a closed eye.'},
  rooksmap:{name:'Rook\'s Map',key:1,desc:'Rook\'s map of the Baron\'s roads. Greyford is circled twice.'},
  stew:{name:'Moss\'s Stew',price:0,kind:'full',tgt:'ally',desc:'Still warm. Restores all HP.'},
  honeycake:{name:'Honey Cake',price:0,kind:'heal',amt:140,tgt:'ally',desc:'Nell\'s. Restores 140 HP.'},
  eggs:{name:'Basket of Eggs',key:1,desc:'For Nell, two doors up from the well.'},
  post:{name:'Fence Post',key:1,desc:'It should be heavy. It isn\'t.'},
});
Object.assign(GEAR,{
  junknives:{name:'Pocket Knives',slot:'w',who:['jun'],atk:12,price:0},
  crowknives:{name:'Crow Knives',slot:'w',who:['jun'],atk:20,price:340},
  woodaxe:{name:'Wood Axe',slot:'w',who:['moss'],atk:12,price:0},
  felleraxe:{name:'Feller\'s Axe',slot:'w',who:['moss'],atk:21,price:340},
  oldsword:{name:'Dad\'s Old Sword',slot:'w',who:['lift'],atk:10,price:0},
  greysteel:{name:'Greysteel Sword',slot:'w',who:['lift'],atk:27,price:900},
  crowcoat:{name:'Crow Coat',slot:'a',def:10,price:200},
  mailshirt:{name:'Mail Shirt',slot:'a',def:18,price:620},
  houndtooth:{name:'Hound Tooth',slot:'c',atk:6,spd:4,price:0},
  ironring:{name:'Iron Ring',slot:'c',def:8,hp:40,price:0},
});
GEAR.ironsword.who=['lift'];GEAR.redknives.who=['sable','jun'];
Object.assign(FOES,{
  watchman:{name:'Watchman',spr:['guard','watch'],hp:90,atk:22,def:14,mag:6,spd:12,exp:24,gold:0,acts:[['atk',3],['shove',1]],drop:['tonic',.2]},
  roadwolf:{name:'Road Wolf',spr:['wolf','roadwolf'],hp:96,atk:31,def:13,mag:6,spd:22,exp:46,gold:12,acts:[['atk',3],['lunge',1]],drop:['tonic',.25]},
  crowr:{name:'Crow Swarm',spr:['gull','crow'],hp:80,atk:34,def:12,mag:6,spd:30,exp:44,gold:10,acts:[['atk',2],['peck',2]],drop:['tonic',.2]},
  thornr:{name:'Thornling',spr:['thornling','bramble'],hp:132,atk:30,def:26,mag:10,spd:8,exp:56,gold:18,acts:[['atk',2],['thornlash',1]],drop:['clearwater',.3]},
  mothr:{name:'Dusk Moth',spr:['moth','moth'],hp:74,atk:18,def:10,mag:30,spd:21,exp:50,gold:16,acts:[['atk',1],['flutter',2],['dust',1]],drop:['pearlwater',.15]},
  tollguard:{name:'Toll Guard',spr:['guard','toll'],hp:150,atk:34,def:20,mag:6,spd:14,exp:70,gold:40,acts:[['atk',3],['spear',1],['shell',1]],drop:['tonic',.4]},
  tollcapt:{name:'Toll Sergeant',spr:['guard','sarge'],hp:260,atk:38,def:24,mag:8,spd:15,exp:120,gold:90,acts:[['atk',2],['spear',2],['rally',1]],drop:['deeptonic',.5]},
  hound:{name:'Garrick\'s Hound',spr:['wolf','hound'],hp:180,atk:36,def:16,mag:6,spd:26,exp:90,gold:0,acts:[['atk',3],['lunge',2],['howl',1]],drop:['tonic',.5]},
  garrick:{name:'Garrick the Hound',spr:['hunter',''],boss:1,hp:1250,atk:42,def:28,mag:20,spd:22,exp:760,gold:300,acts:[['atk',2],['bolt',2],['net',1],['whistle',1],['takedown',1]],drop:['houndtooth',1]},
  // the road to Greyford and the tollhouse
  boar:{name:'Bristleback',spr:['toad','boar'],hp:220,atk:42,def:30,mag:10,spd:12,exp:82,gold:20,acts:[['atk',2],['charge',2]],drop:['tonic',.35]},
  roadguard:{name:'Road Warden',spr:['guard','road'],hp:180,atk:42,def:26,mag:6,spd:16,exp:84,gold:36,acts:[['atk',3],['spear',1],['shell',1]],drop:['tonic',.35]},
  crossbow:{name:'Crossbowman',spr:['guard','xbow'],hp:140,atk:46,def:18,mag:6,spd:20,exp:80,gold:34,acts:[['atk',1],['bolt',3]],drop:['pearlwater',.2]},
  keepguard:{name:'Tollhouse Guard',spr:['guard','keep'],hp:240,atk:48,def:30,mag:8,spd:16,exp:110,gold:50,acts:[['atk',3],['spear',2],['shell',1]],drop:['deeptonic',.25]},
  kell:{name:'Sir Kell',spr:['ironknight',''],boss:1,hp:2600,atk:56,def:44,mag:30,spd:16,exp:1600,gold:600,acts:[['atk',2],['maceblow',2],['shieldbash',2],['bulwark',1],['quake',1]],drop:['ironring',1]},
});
Object.assign(FMOVES,{
  shove:{name:'Shove',kind:'phys',pow:1.1,tgt:'one'},
  spear:{name:'Spear Thrust',kind:'phys',pow:1.5,tgt:'one'},
  bolt:{name:'Crossbow Bolt',kind:'phys',pow:1.55,tgt:'one'},
  net:{name:'Weighted Net',kind:'status',st:'sleep',chance:.5,tgt:'one'},
  whistle:{name:'Two-Finger Whistle',kind:'buff',tgt:'self',atk:1},
  takedown:{name:'Takedown',kind:'phys',pow:1.9,tgt:'one'},
  charge:{name:'Charge',kind:'phys',pow:1.55,tgt:'one'},
  maceblow:{name:'Mace Blow',kind:'phys',pow:1.75,tgt:'one'},
  shieldbash:{name:'Shield Bash',kind:'phys',pow:1.2,tgt:'one',st:'sleep',chance:.35},
  bulwark:{name:'Bulwark',kind:'buff',tgt:'self'},
});
Object.assign(GROUPS,{
  bend1:[[3,['roadwolf','roadwolf']],[3,['thornr']],[2,['crowr','crowr']],[2,['mothr','roadwolf']],[1,['roadwolf','roadwolf','roadwolf']]],
  grey1:[[3,['roadguard','crossbow']],[3,['boar']],[2,['roadwolf','roadwolf','crowr']],[2,['crossbow','crossbow']],[2,['boar','crowr']]],
});
