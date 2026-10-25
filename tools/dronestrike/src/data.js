/* ===================== DATA ===================== */
// target categories: inf armor arty logi struct aa ew naval
const CATS={inf:'Infantry',armor:'Armor',arty:'Artillery',logi:'Logistics',struct:'Structures',aa:'Air defense',ew:'Jammers',naval:'Naval'};
// range: 0 front line only, 1 also the near rear, 2 anywhere. eva: chance to dodge a shot. jr: jamming resistance (1 = immune)
// exp: expendable (used up when it strikes). Reusable drones strike every wave they survive and come home after.
const DRONES={
  fpv:{name:'FPV Kamikaze',short:'FPV',cost:2,slots:1,range:1,eva:.15,jr:0,exp:1,
    atk:{inf:6,armor:5,arty:6,logi:6,struct:1,aa:3,ew:5,naval:1},desc:'A cheap racing drone with a bomb strapped on. It hits troops, trucks and guns well, but jamming can cut its radio link.'},
  recon:{name:'Recon Wing',short:'RCN',cost:6,slots:1,range:2,eva:.4,jr:.25,exp:0,recon:1,atk:{},
    desc:'An unarmed scout plane. It reveals hidden targets and makes every strike after it in the same wave 10% more accurate.',plural:'Recon Wings'},
  decoy:{name:'Decoy Swarm',short:'DCY',cost:1,slots:1,range:2,eva:0,jr:1,exp:1,decoy:1,atk:{},
    desc:'A cheap fake drone. Anti-aircraft fire and enemy drones go after it, so send decoys ahead of your real drones.',plural:'Decoy Swarms'},
  hexa:{name:'Hexa Bomber',short:'HEX',cost:7,slots:1,range:0,eva:.05,jr:.15,exp:0,
    atk:{inf:6,armor:2,arty:4,logi:3,struct:2,aa:2,ew:3},desc:'A six-rotor bomber that drops grenades and flies home to strike again next wave. It is slow, so guns hit it easily.'},
  loiter:{name:'Loitering Munition',short:'LM',cost:12,slots:1,range:2,eva:.25,jr:.3,exp:1,
    atk:{armor:15,arty:14,logi:8,aa:9,ew:9,inf:3,struct:6,naval:7},desc:'A guided bomb that circles the target area and dives on armor. Your best tank killer.',plural:'Loitering Munitions'},
  intercept:{name:'Interceptor',short:'INT',cost:5,slots:1,range:2,eva:.3,jr:.3,exp:0,interceptor:1,atk:{},
    desc:'A hunter of enemy drones. Send it early so it clears the sky for the drones behind it.'},
  hunter:{name:'Radar Hunter',short:'RH',cost:14,slots:1,range:2,eva:.35,jr:.6,exp:1,hunter:1,
    atk:{aa:24,ew:20,struct:2},desc:'It homes in on radar. It destroys anti-air sites and jammers before they can fire on its group.'},
  longr:{name:'Long-Range Wing',short:'LRW',cost:22,slots:2,range:2,eva:.2,jr:.35,exp:1,
    atk:{struct:24,logi:16,arty:12,aa:10,ew:10,armor:8,naval:18,inf:4},desc:'A one-way plane with a heavy warhead. It reaches depots, bridges and headquarters deep behind the lines.',plural:'Long-Range Wings'},
  fiber:{name:'Fiber-Optic FPV',short:'FOF',cost:3,slots:1,range:1,eva:.15,jr:1,exp:1,
    atk:{inf:7,armor:6,arty:7,logi:7,struct:1,aa:4,ew:6,naval:1},desc:'An FPV steered through a thin cable instead of radio, so jamming cannot stop it.'},
  naval:{name:'Sea Drone',short:'SEA',cost:18,slots:2,range:1,eva:.3,jr:.4,exp:1,
    atk:{naval:34,struct:6,arty:6},desc:'A fast boat packed with explosives, built to sink ships.'},
  ucav:{name:'Heavy UCAV',short:'UCV',cost:60,slots:3,range:2,eva:.55,jr:.6,exp:0,
    atk:{inf:8,armor:13,arty:13,logi:10,struct:15,aa:12,ew:10,naval:11},desc:'A pilotless warplane. It hits almost anything, anywhere, and usually flies home.'},
};
const DRONE_ORDER=['fpv','fiber','hexa','loiter','recon','decoy','intercept','hunter','longr','naval','ucav'];
// enemy units. depth: 0 front, 1 near rear, 2 deep. shots/acc: air defense. jam: jamming strength. spawn: enemy drones each wave
const UNITS={
  squad:{name:'Infantry Squad',cat:'inf',hp:8,depth:0,val:2},
  trench:{name:'Trench Line',cat:'inf',hp:16,depth:0,val:4},
  apc:{name:'APC',cat:'armor',hp:9,depth:0,val:4},
  tank:{name:'Battle Tank',cat:'armor',hp:14,depth:0,val:6},
  arty:{name:'Howitzer',cat:'arty',hp:14,depth:1,val:6},
  mlrs:{name:'Rocket Launcher',cat:'arty',hp:12,depth:1,val:7},
  truck:{name:'Supply Truck',cat:'logi',hp:7,depth:1,val:3},
  fuel:{name:'Fuel Tanker',cat:'logi',hp:7,depth:1,val:4},
  depot:{name:'Ammo Depot',cat:'struct',hp:28,depth:2,val:10},
  bridge:{name:'Bridge',cat:'struct',hp:34,depth:2,val:10},
  cp:{name:'Command Post',cat:'struct',hp:26,depth:2,val:12},
  aagun:{name:'AA Gun',cat:'aa',hp:9,depth:0,val:4,shots:2,acc:.3},
  sam:{name:'SAM Site',cat:'aa',hp:16,depth:1,val:8,shots:3,acc:.45},
  ew:{name:'Jammer Truck',cat:'ew',hp:10,depth:1,val:6,jam:.18},
  hive:{name:'Drone Launch Site',cat:'struct',hp:16,depth:1,val:7,spawn:2},
  boat:{name:'Patrol Boat',cat:'naval',hp:16,depth:1,val:6,shots:1,acc:.3},
  lship:{name:'Landing Ship',cat:'naval',hp:30,depth:1,val:12},
  coastal:{name:'Coastal Battery',cat:'arty',hp:20,depth:1,val:8},
  hq:{name:'Field Headquarters',cat:'struct',hp:36,depth:2,val:20},
};
// research. tier needs rank (0..4); cost in $k
const RESEARCH=[
  {id:'decoy',tier:0,cost:20,name:'Decoy Swarm',unlock:'decoy',desc:'Unlocks the Decoy Swarm.'},
  {id:'hexa',tier:0,cost:30,name:'Hexa Bomber',unlock:'hexa',desc:'Unlocks the reusable Hexa Bomber.'},
  {id:'loiter',tier:0,cost:45,name:'Loitering Munition',unlock:'loiter',desc:'Unlocks the Loitering Munition, the tank killer.'},
  {id:'pay1',tier:0,cost:40,name:'Shaped Charges',desc:'+15% damage for every drone.'},
  {id:'hop',tier:0,cost:40,name:'Frequency Hopping',desc:'Every radio drone resists jamming 25% better.'},
  {id:'crew1',tier:0,cost:35,name:'Second Crew Shift',desc:'+2 launch slots.'},
  {id:'intercept',tier:1,cost:40,name:'Interceptor',unlock:'intercept',desc:'Unlocks the Interceptor, for drone-on-drone fights.'},
  {id:'hunter',tier:1,cost:60,name:'Radar Hunter',unlock:'hunter',desc:'Unlocks the Radar Hunter, an air-defense killer.'},
  {id:'longr',tier:1,cost:70,name:'Long-Range Wing',unlock:'longr',desc:'Unlocks the Long-Range Wing for deep strikes.'},
  {id:'crew2',tier:1,cost:60,name:'Field Launch Teams',desc:'+3 launch slots.'},
  {id:'thermal',tier:1,cost:50,name:'Thermal Optics',desc:'+10% accuracy for every strike.'},
  {id:'workshop',tier:1,cost:60,name:'Garage Workshop',desc:'Drones cost 20% less.'},
  {id:'recovery',tier:1,cost:50,name:'Recovery Teams',desc:'40% of reusable drones shot down are found and repaired.'},
  {id:'fiber',tier:2,cost:70,name:'Fiber-Optic FPV',unlock:'fiber',desc:'Unlocks the jam-proof Fiber-Optic FPV.'},
  {id:'naval',tier:2,cost:60,name:'Sea Drone',unlock:'naval',desc:'Unlocks the Sea Drone, a ship killer.'},
  {id:'pay2',tier:2,cost:80,name:'Tandem Warheads',desc:'Another +15% damage for every drone.'},
  {id:'auto',tier:2,cost:80,name:'Terminal Autonomy',desc:'Drones finish their dive on their own: another 25% jamming resistance.'},
  {id:'intel',tier:2,cost:50,name:'Signals Intelligence',desc:'Briefings show every enemy unit, hidden or not.'},
  {id:'ucav',tier:3,cost:150,name:'Heavy UCAV',unlock:'ucav',desc:'Unlocks the Heavy UCAV.'},
  {id:'pay3',tier:3,cost:120,name:'Thermobaric Fill',desc:'Another +20% damage for every drone.'},
  {id:'crew3',tier:2,cost:90,name:'Second Airfield',desc:'+3 launch slots.'},
  {id:'crew4',tier:3,cost:120,name:'Highway Launch Strips',desc:'+4 launch slots.'},
];
const RANKS=[['Lieutenant',0],['Captain',20],['Major',48],['Lt. Colonel',85],['Colonel',130]];
// enemy generals, one per campaign
const GENERALS=[
  {id:'brask',name:'Gen. Oleg Brask',nick:'"The Hammer"',front:'Northern Plains',look:{skin:'#c99a78',hat:'cap',hatc:'#5a5f3a',mous:1,hair:'#3a2a20',scar:0},
    doc:'Armored columns, and lots of them. Brask believes a tank fixes every problem.',
    quote:'"Your little toys will break on our armor like rain on a road."',
    missions:['column','convoy','trench','column','spear'],aa:1,ew:0,dr:0,hide:.1},
  {id:'vorst',name:'Col. Ilyana Vorst',nick:'"The Silence"',front:'River Crossings',look:{skin:'#e0b898',hat:'beret',hatc:'#3a3f6a',mous:0,hair:'#1a1a22',scar:1},
    doc:'An electronic-warfare specialist. Where she goes, the radio goes quiet.',
    quote:'"Radios are a gift. Thank you for flying them at me."',
    missions:['convoy','trench','arty','sead','final'],aa:1,ew:2,dr:0,hide:.15},
  {id:'kessan',name:'Adm. Yuri Kessan',nick:'"The Tide"',front:'The Southern Coast',look:{skin:'#d8a888',hat:'naval',hatc:'#1e2a4a',mous:0,hair:'#b8b8c0',scar:0,beard:1},
    doc:'Commands the fleet. He means to land troops on your coast behind the lines.',
    quote:'"The sea does not care how brave you are."',
    missions:['naval','coastal','convoy','naval','finalsea'],aa:1,ew:0,dr:0,hide:.1},
  {id:'okhrin',name:'Marshal Pavel Okhrin',nick:'"The Umbrella"',front:'The Eastern Hills',look:{skin:'#c8946c',hat:'cap',hatc:'#4a2a2a',mous:1,hair:'#6a6a6a',scar:0},
    doc:'Air defense and drone swarms. He has studied you, and he has built an umbrella.',
    quote:'"Nothing flies over my men. Nothing."',
    missions:['sead','hive','depot','arty','final'],aa:2,ew:1,dr:2,hide:.2},
  {id:'dravik',name:'Supreme Cmdr. Arkady Dravik',nick:'"The Architect"',front:'The Road to the Capital',look:{skin:'#d0a080',hat:'peak',hatc:'#2a2a2a',mous:0,hair:'#2a2a2a',scar:1},
    doc:'The man who planned the invasion. He uses everything, and he learns from every strike you make.',
    quote:'"I have read every report you ever caused. Let us finish this."',
    missions:['column','depot','hive','sead','final'],aa:2,ew:2,dr:2,hide:.25,adaptive:2},
];
// mission recipes: primary targets and escorts. n() scales with difficulty
const MISSIONS={
  column:{name:'Armored Column',brief:'An armored column is pushing toward the front. Stop the tanks before they break through.',prim:[['tank',2],['apc',2]],esc:[['aagun',1]],reward:42},
  convoy:{name:'Supply Convoy',brief:'Fuel and ammunition are moving up behind the lines. Burn the convoy and their attack stalls.',prim:[['truck',2],['fuel',2]],esc:[['aagun',1]],reward:40},
  trench:{name:'Trench Assault',brief:'Our infantry is pinned. Clear the enemy trenches so they can move.',prim:[['trench',2],['squad',2]],esc:[['aagun',1]],reward:36},
  arty:{name:'Artillery Hunt',brief:'Enemy guns are shelling our towns from the rear. Find them and silence them.',prim:[['arty',2],['mlrs',1]],esc:[['sam',1]],reward:46},
  sead:{name:'Break the Umbrella',brief:'Their air defense is choking our operations. Take it apart.',prim:[['sam',2],['aagun',1]],esc:[['ew',1]],reward:48},
  hive:{name:'Drone Nest',brief:'Their drones launch from a site behind the lines. Shut it down.',prim:[['hive',2]],esc:[['aagun',1],['squad',1]],reward:46},
  depot:{name:'Deep Strike',brief:'An ammunition depot and the bridge that feeds it. Hit them deep behind the front.',prim:[['depot',1],['bridge',1]],esc:[['sam',1],['aagun',1]],reward:52},
  naval:{name:'Landing Force',brief:'Landing ships are gathering offshore with patrol boats screening them. Sink them before they land.',prim:[['lship',1],['boat',2]],esc:[],reward:52},
  coastal:{name:'Coastal Guns',brief:'Coastal batteries are covering the landing beaches. Knock them out.',prim:[['coastal',2],['arty',1]],esc:[['sam',1]],reward:50},
  spear:{name:'The Spearhead',brief:'Brask is leading his main assault in person, from a command post just behind his tanks. Break the spearhead.',prim:[['tank',3],['cp',1,1]],esc:[['aagun',2]],reward:55,final:1},
  final:{name:'Field Headquarters',brief:'We have found the general\'s headquarters. Destroy it and this offensive collapses.',prim:[['hq',1],['cp',1]],esc:[['sam',1],['aagun',1],['tank',1]],reward:60,final:1},
  finalsea:{name:'The Flagship Group',brief:'The admiral is aboard the lead landing ship. Sink the group and the invasion fleet turns back.',prim:[['lship',2],['hq',1]],esc:[['boat',2],['sam',1]],reward:60,final:1},
};
const NAME_A=['Night','Iron','Steel','Silent','Black','Red','Grey','Wild','Storm','Lucky','Old','Ghost','Copper','Stray','Winter','Bitter'];
const NAME_B=['Wasps','Hornets','Kestrels','Owls','Ravens','Foxes','Magpies','Swifts','Bees','Herons','Falcons','Crows','Lynxes','Moths','Jackdaws','Martens'];
const NAME_C=['Unit','Squadron','Company','Detachment','Wing'];
const STORY={
  intro:['The Dominion of Korgath has invaded Varna, your small country.',
    'Our army can slow their tanks, but it cannot stop them.',
    'Varna\'s best hope is a new drone unit, and you command it.'],
  co:'Gen. Ana Morel',
};
const CO_LINES={
  win:['Good work. The line held where you struck.','The men on the ground are cheering your name on the radio.','That was textbook. Keep it up.','They will think twice before massing like that again.'],
  lose:['That one hurt. Regroup and think about the mix.','We lost ground today. Study the intel and try a different approach.','Drones are cheaper than soldiers, but not free. Choose carefully.'],
};
