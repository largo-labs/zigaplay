/* ================= the fifty fighters, in three groups =================
   LONG range: guns, bombs and energy blasts. MEDIUM range: swords. CLOSE range: fists.
   Each row: name, title, group (L M C), outfit, accent, skin, hair, head, weapon, build (l light, m middle, h heavy),
   speed 1-5, power 1-5, then UP B and SIDE B as [kind, name] (the kinds live in moves.js). No two fighters share a pair. */
const R50=[
 /* ---------- long range ---------- */
 ['NOVA','Star Pilot','L','#2a3a7a','#ffd84a','#e0a878','#3a2a1a','visor','blaster','m',4,3,['jetpack','STAR BOOST'],['orb','NOVA SHOT']],
 ['COLT','Gunslinger','L','#7a4a2a','#e8d8a8','#e0a878','#5a3a1a','cowboy','pistol','m',4,3,['recoil','BACKFIRE LEAP'],['burst','SIX SHOOTER']],
 ['BUSTER','Demolition Expert','L','#d8642a','#2a2a3a','#8a5a3a','#1a1a1a','helmet','grenade','h',2,5,['recoil','BLAST JUMP'],['grenade','FRAG TOSS']],
 ['VOLT','Storm Caller','L','#2a2a4a','#ffe84a','#e0a878','#e8e8f0','spiky','energy','l',5,3,['warp','LIGHTNING STEP'],['beam','THUNDER RAY']],
 ['TITAN','Heavy Gunner','L','#4a5a4a','#ff3a3a','#a87850','#1a1a1a','bald','cannon','h',1,5,['jetpack','THRUSTERS'],['rocket','WARHEAD']],
 ['PIPER','Sky Pirate','L','#7a2a2a','#e8c84a','#e0a878','#2a1a12','bandana','pistol','m',3,3,['hover','SKY HOOK'],['shotgun','BLUNDERBUSS']],
 ['LUNA','Moon Witch','L','#4a3a8a','#c8b8ff','#f6d8c0','#e8e8f8','long','energy','l',3,3,['warp','MOON GATE'],['orb','LUNAR ORB']],
 ['RUSTY','Scrap Bot','L','#8a9aa8','#ff7a2a','#b8c4d8','#5a6470','antenna','blaster','h',2,4,['hover','JET BOOTS'],['sticky','SCRAP BOMB']],
 ['ECHO','Sound Tech','L','#1e1e26','#3af0ff','#c08458','#141414','cap','blaster','m',4,3,['recoil','BASS DROP'],['beam','SONIC BOOM']],
 ['SPRITZ','Soda Kid','L','#ff5a8a','#5affd0','#f2c9a0','#e8c860','spiky','grenade','l',5,2,['jetpack','FIZZ ROCKET'],['grenade','SODA BOMB']],
 ['HAWK','Sniper','L','#4a5a3a','#c8b880','#d8a878','#3a2a1a','beanie','rifle','m',3,4,['hover','GLIDER'],['snipe','LONG SHOT']],
 ['GLITCH','Rogue Program','L','#1a2a1e','#3affa0','#b8c4d8','#3affa0','mohawk','blaster','l',4,3,['warp','LAG SPIKE'],['burst','DATA BURST']],
 ['OSIRIS','Sun Priest','L','#e8c84a','#2a5ad8','#8a5a3a','#141414','crown','energy','m',3,4,['hover','SOLAR WINGS'],['beam','SUN BEAM']],
 ['MIRA','Prism Mage','L','#c8e8ff','#5a8aff','#f6d8c0','#f0f0ff','ponytail','energy','l',4,3,['jetpack','LIGHT LIFT'],['snipe','PRISM LANCE']],
 ['SARGE','Commando','L','#3a4a2a','#d8c87a','#c08458','#2a1a12','band','rifle','h',2,5,['recoil','CANNON JUMP'],['rocket','BAZOOKA']],
 ['BLAZE','Flame Trooper','L','#c8402a','#ffb03a','#e0a878','#ff7a2a','flame','energy','m',4,4,['jetpack','FIRE JETS'],['shotgun','FLAMETHROWER']],
 ['FROST','Cryo Gunner','L','#3a7ac8','#c8f0ff','#f6d8c0','#d8f0ff','short','blaster','m',3,3,['hover','ICE SKATES'],['orb','SNOWBALL CANNON']],
 /* ---------- medium range: swords ---------- */
 ['KAGE','Shadow Ninja','M','#24242e','#c82a3a','#e0a878','#141414','mask','katana','l',5,3,['warp','SHADOW BLINK'],['dash','SHADOW CUT']],
 ['DUKE','Royal Fencer','M','#f0f0f0','#2a4aa8','#f6d8c0','#e8c860','crown','rapier','m',4,3,['risestab','SKY THRUST'],['drill','FLURRY OF STEEL']],
 ['RONIN','Wandering Samurai','M','#5a3a5a','#e8d8c8','#e0a878','#141414','topknot','katana','m',4,4,['spinup','WHIRLWIND'],['counter','IAI COUNTER']],
 ['VALE','Paladin','M','#c8c8d8','#ffd84a','#f2c9a0','#c8401c','short','broadsword','h',2,5,['risestab','HOLY ASCENT'],['wave','LIGHT WAVE']],
 ['RAJA','Desert Prince','M','#e8c070','#2a8a8a','#8a5a3a','#141414','band','scimitar','m',4,3,['spinup','SAND TWISTER'],['whirl','DUNE DANCE']],
 ['BRUTUS','Gladiator','M','#a8602a','#e8c84a','#c08458','#2a1a12','helmet','broadsword','h',2,5,['leap','TITAN LEAP'],['dive','ARENA CRASH']],
 ['YUKI','Snow Ninja','M','#e8f4ff','#4ab0ff','#f6d8c0','#e8e8f8','mask','dual','l',5,2,['warp','SNOW VEIL'],['whirl','BLIZZARD BLADES']],
 ['CINDER','Ash Knight','M','#3a2a2a','#ff5a1a','#c08458','#141414','helmet','greatsword','h',2,5,['risestab','ERUPTION'],['dive','MAGMA SLAM']],
 ['PIXIE','Fairy Knight','M','#7ae0a0','#ffb0e0','#f6d8c0','#e86aa0','bun','rapier','l',5,2,['leap','FAIRY HOP'],['wave','PETAL WAVE']],
 ['OMEGA','Dark Lord','M','#1a1a2a','#ff2a2a','#9a8aa8','#e8e8f8','horns','greatsword','h',3,5,['warp','DOOM GATE'],['wave','END SLASH']],
 ['MAMBA','Viper Assassin','M','#2a6a3a','#d8e84a','#c08458','#141414','hood','dual','l',5,3,['hook','VIPER LINE'],['dash','VENOM STRIKE']],
 ['TORO','Matador','M','#c82a3a','#ffd84a','#c08458','#141414','cowboy','rapier','m',3,4,['leap','BULL LEAP'],['counter','CAPE COUNTER']],
 ['HALO','Sky Knight','M','#ffffff','#ffd84a','#f6d8c0','#e8c860','long','sword','m',3,3,['leap','ANGEL WINGS'],['dash','HOLY CHARGE']],
 ['RAVEN','Night Blade','M','#2e2a44','#a87aff','#d8a888','#141414','hood','katana','l',5,3,['hook','GRAPPLE LINE'],['counter','SLIP AWAY']],
 ['TUSK','Viking','M','#8a6a4a','#c8c8d8','#f2c9a0','#c8401c','horns','broadsword','h',2,5,['spinup','VALHALLA'],['dive','BERSERK DROP']],
 ['KOI','River Swordsman','M','#3a8ad8','#ff8a5a','#e0a878','#141414','bald','katana','m',4,3,['spinup','WHIRLPOOL'],['wave','WATER CUT']],
 ['SAGE','Old Master','M','#e8a030','#c03020','#f2c9a0','#e8e8f0','long','sword','m',3,4,['warp','STILL MIND'],['counter','PATIENCE']],
 /* ---------- close range: fists ---------- */
 ['MAX','Boxing Champ','C','#c82a3a','#ffffff','#8a5a3a','#141414','short','gloves','m',4,4,['uppercut','UPPERCUT'],['rush','HAYMAKER']],
 ['KONG','Jungle Brawler','C','#5a4a3a','#3a8a3a','#6a4a30','#141414','afro','bare','h',3,5,['leapup','VINE LEAP'],['rush','GORILLA RUSH']],
 ['OKKO','Sumo Champ','C','#f0e8d8','#3a3a8a','#f2c9a0','#141414','topknot','bare','h',1,5,['leapup','SUMO HOP'],['palm','THUNDER SLAP']],
 ['SHIVA','Six-Arm Fighter','C','#3a6ad8','#ffd84a','#7ab8ff','#141414','crown','wraps','m',4,4,['helikick','LOTUS SPIN'],['flurry','HUNDRED FISTS']],
 ['FANG','Werewolf','C','#6a5a4a','#c8a878','#8a7a6a','#5a4a3a','spiky','claws','m',5,4,['uppercut','HOWL CLAW'],['flykick','POUNCE']],
 ['CHOMP','Shark Brawler','C','#4a7aa8','#ffffff','#7a9ab8','#2a3a5a','bald','gauntlets','h',3,4,['helikick','WHIRLPOOL KICK'],['grab','JAWS LOCK']],
 ['DIESEL','Trucker','C','#5a6a3a','#ffb03a','#c08458','#3a2a1a','cap','knuckles','h',2,4,['leapup','AIR HORN'],['grab','HEAVY HAUL']],
 ['ZIGGY','Street Kid','C','#ff5fa8','#3af0ff','#e0a878','#141414','beanie','wraps','l',5,2,['helikick','SPIN 180'],['flykick','KICKFLIP KICK']],
 ['PEP','Cheer Fighter','C','#ffd84a','#ff3a8a','#f6d8c0','#e8c860','ponytail','bare','l',5,2,['leapup','POM VAULT'],['flurry','CHEER COMBO']],
 ['BOLT','Speed Courier','C','#ff8a2a','#ffffff','#8a5a3a','#141414','cap','wraps','l',5,3,['flameup','AFTERBURN'],['flykick','EXPRESS KICK']],
 ['DRAKO','Dragon Kid','C','#2a8a5a','#ffb03a','#e0a878','#2a8a5a','horns','claws','m',3,4,['flameup','DRAGON CLIMB'],['rush','DRAGON RUSH']],
 ['GALE','Wind Fist','C','#4ac898','#f0fff8','#f2c9a0','#2a1a12','ponytail','wraps','l',5,3,['helikick','TORNADO KICK'],['palm','GUST PALM']],
 ['ROOK','Stone Fist','C','#8a8478','#c8b890','#9a9488','#141414','bald','gauntlets','h',1,5,['uppercut','ROCK RISE'],['grab','LANDSLIDE THROW']],
 ['MOSS','Mountain Monk','C','#e8a030','#3a6a2a','#c08458','#141414','bald','wraps','m',3,4,['uppercut','RISING PALM'],['palm','INNER FORCE']],
 ['GRIMM','Grave Brawler','C','#3a3a44','#8aff8a','#d8d0c0','#141414','hood','gauntlets','m',3,4,['flameup','SOUL FLAME'],['flurry','GRAVE BLOWS']],
 ['WRAITH','Phantom Fist','C','#c8c8e8','#7a5aa8','#e8e8ff','#7a5aa8','long','bare','l',4,3,['leapup','PHASE LEAP'],['flykick','SHADE KICK']]];
const GROUPS={L:{name:'LONG RANGE',short:'LONG',col:'#5ad8ff'},M:{name:'MEDIUM RANGE',short:'MEDIUM',col:'#ffd84a'},C:{name:'CLOSE RANGE',short:'CLOSE',col:'#ff6a5a'}};
const BUILDS={l:{w:84,sz:.95},m:{w:100,sz:1},h:{w:122,sz:1.07}};
const ROSTER=R50.map((r,i)=>{const[name,title,grp,body,acc,skin,hair,head,weapon,build,spd,pow,up,side]=r,B=BUILDS[build];
  return{i,name,title,grp,body,acc,skin,hair,head,weapon,build,spd,pow,w:B.w,sz:B.sz,pants:shade(body,-.45),
    run:2.9+spd*.3+(grp==='C'?.2:0),air:2.2+spd*.18,jump:10.6+spd*.12-(build==='h'?.5:0),grav:build==='h'?.62:build==='l'?.54:.58,
    up:{kind:up[0],name:up[1]},side:{kind:side[0],name:side[1]},fx:acc}});
