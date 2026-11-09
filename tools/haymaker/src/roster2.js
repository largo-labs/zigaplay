/* ================= forty-one more fighters =================
   F(id, name, nick, style, home ring, [speed, power, health, jump, reach, quickness], look, [w,h,r,arm,glove,size,flags], specials)
   speed/power/health/jump/reach are multipliers (1 = Milo); quickness -1 makes normals a step faster, +1 a step slower.
   Size scales the whole fighter, and with it their hurtbox and how far their punches reach. Specials are
   [kind, name, colour, options]; the kinds live in vs.js. */
function F(id,name,nick,style,venue,st,look,b,sp){PEOPLE[id]=Object.assign({name,jaw:.8,chin:.45,eye:'#2a1a10',hairCol:'#2a1a10'},look,{build:Object.assign({w:b[0],h:b[1],r:b[2],arm:b[3],gl:b[4],s:b[5]},b[6]||{})});
  ROSTER.push({id,nick,style,venue,spd:st[0],pow:st[1],hp:st[2],jump:st[3]||1,reach:st[4]||1,qk:st[5]||0,sp:sp.map(([k,n,c,o])=>Object.assign({k,n,c},o||{}))})}
F('rook','ROOK ADEYEMI','THE WALL','Huge defender','dock',[.74,1.1,1.22,.9,1.05,1],{skin:'#4a2c1c',hair:'buzz',hairCol:'#141010',beard:'#141010',gloves:'#2a2a30',trunks:'#7a1c24',trim:'#e8e2d0',tattoo:1,jaw:.95,chin:.6},[38,52,13,11,12,1.2,{cut:1}],
  [['shield','IRON SKIN','#c8c8d8'],['quake','EARTHSHAKER','#c8a87a'],['grab','CASTLE CRUSH','#e8e2d0']]);
F('pip','PIP McALLISTER','THE MOUSE','Tiny and slippery','gym',[1.35,0.92,0.92,1.15,1,-1],{skin:'#f6d2b8',hair:'spiky',hairCol:'#d8542a',freckles:1,headgear:'#2a5ac8',gap:1,eye:'#3a6a2a',gloves:'#2a5ac8',trunks:'#f4f1ea',trim:'#2a5ac8',jaw:.7,chin:.36},[20,38,10.5,5.5,8,.78],
  [['roll','MOUSE HOLE','#e8e2d0'],['flurry','PEPPER JABS','#ff5a3a'],['slide','SKID MARK','#d8542a']]);
F('zora','ZORA KHAN','THE STORM','Lightning zoner','roof',[1.05,1.02,1.05],{skin:'#c9926a',hair:'mohawk',hairCol:'#f4f1ea',paint:'#3ee8ff',earrings:1,eye:'#5ab8e8',gloves:'#1c2a5a',trunks:'#1c2a5a',trim:'#3ee8ff',top:'#1c2a5a',jaw:.7,chin:.36,lips:'#8a3a4a'},[23,46,11,6.5,8.5,.96],
  [['beam','LIGHTNING LINE','#9ae8ff',{jag:1}],['rain','THUNDERCLAP','#ffe680',{shape:'bolt'}],['dash','BOLT RUSH','#3ee8ff',{fast:1}]]);
F('toro','EL TORO','THE BULL','Masked grappler','crown',[.85,1.2,1.25,.95,1,1],{skin:'#a86e48',hair:'bald',mask:'#c8263a',maskTrim:'#f2c14e',gloves:'#f2c14e',trunks:'#c8263a',trim:'#f2c14e',hairy:1,jaw:.92,chin:.55},[34,48,12.5,9.5,11,1.1,{belly:1}],
  [['armor','BULL RUSH','#ff5a3a',{charge:1}],['grab','PILEDRIVER','#f2c14e'],['slam','STAMPEDE','#c8a87a']]);
F('mika','MIKA SATO','THE NEEDLE','Counter-puncher','ice',[1.15,1.02,.9,1,1,-1],{skin:'#efd2b4',hair:'bun',hairCol:'#141018',eye:'#1a1010',lips:'#b0384a',gloves:'#f4f1ea',trunks:'#141018',trim:'#c8263a',top:'#141018',jaw:.68,chin:.34},[22,44,10.5,6,8.5,.92],
  [['counter','STILL WATER','#9ae8ff'],['dash','NEEDLE POINT','#f4f1ea',{fast:1}],['pull','FISHHOOK','#c8c8d8']]);
F('brick',"BRICK O'HARA",'THE MASON','Stocky brawler','gym',[.9,1.1,1.1],{skin:'#efc4a4',hair:'bald',hairCol:'#c8542a',beard:'#c8542a',eye:'#3a5a2a',gloves:'#8a3a22',trunks:'#3a3a40',trim:'#c8542a',hairy:1,jaw:.95,chin:.58},[33,42,12,9.5,10.5,1,{cut:1}],
  [['barrage','BRICK BY BRICK','#c8542a'],['quake','FOUNDATION','#a89a8a'],['armor','MORTAR SHOT','#e8e2d0']]);
F('saint','SAINT DUBOIS','THE PREACHER','Old master, heals','chapel',[.9,1,1.05,.9],{skin:'#55321f',hair:'shaved',hairCol:'#d8d0c0',beard:'#d8d0c0',old:1,glasses:1,gloves:'#f4f1ea',trunks:'#4a2a6a',trim:'#e5bd4f'},[27,46,11.5,7,9,1],
  [['heal','SECOND WIND','#7dff9a'],['counter','TURN THE CHEEK','#fff4c0'],['proj','SERMON','#e8d070',{shape:'wave'}]]);
F('viper','VIPER CRUZ','THE VIPER','Poison mix-ups','pier',[1.12,.95,.92,1,1.08],{skin:'#c98c62',hair:'slick',hairCol:'#1a2a14',paint:'#3ac84a',eye:'#d8c83a',gloves:'#2a7a2a',trunks:'#141c10',trim:'#9ae84a',tattoo:1,jaw:.74,chin:.38},[24,46,11,6.5,8.5,.98],
  [['pull','FANG HOOK','#9ae84a'],['drain','VENOM BITE','#7ad04a'],['slide','SIDEWINDER','#3ac84a']]);
F('blaze','BLAZE OKAFOR','THE BURNER','Fire zoner','roof',[1,0.98,1],{skin:'#6e4130',hair:'locs',hairCol:'#c8341a',eye:'#e8661a',gloves:'#e8661a',trunks:'#2a1410',trim:'#ffb02a',tattoo:1,chain:1},[28,46,11.5,8,9.5,1.02],
  [['proj','FIRE FAN','#ff8a2a',{shape:'fire',triple:1}],['rise','FLAME PILLAR','#ff5a1a'],['buff','STOKE THE FIRE','#ffb02a']]);
F('echo','ECHO VANCE','THE GHOST','Tricky teleporter','chapel',[1.05,1,1],{skin:'#f2e6e0',hair:'slick',hairCol:'#e8e8f0',eye:'#8ab8e8',lips:'#8a8aa8',gloves:'#d8e0f0',trunks:'#3a3a5a',trim:'#a8b8e8',jaw:.72,chin:.4},[23,48,11,6,8.5,1],
  [['tele','FADE OUT','#a8b8e8'],['proj','SPECTER ORB','#c8d8ff',{shape:'orb',big:1}],['reflect','MIRROR GUARD','#e8f0ff']]);
F('rusty','RUSTY KOWALSKI','RUST BUCKET','Dockyard trapper','dock',[.9,0.98,1],{skin:'#e0a982',hair:'buzz',hairCol:'#8a4a2a',stubble:'#8a5a3a',eye:'#4a3a2a',bandana:'#c8542a',gloves:'#7a4a2a',trunks:'#3a4a5a',trim:'#c8542a',top:'#4a5a6a',jaw:.9,chin:.5},[30,46,12,9,10,1.04],
  [['trap','BEAR TRAP','#c8c8d8'],['pull','CHAIN HOOK','#a8a8b8'],['armor','IRON WILL','#c8542a']]);
F('juno','JUNO PARK','THE SPARKLER','Flashy rushdown','roof',[1.2,0.95,0.95,1.1,1,-1],{skin:'#f1c8a5',hair:'curly',hairCol:'#ff6ab4',earrings:1,lips:'#e8508a',gloves:'#ff6ab4',trunks:'#f4f1ea',trim:'#ff3ea5',top:'#ff6ab4',jaw:.68,chin:.34},[21,43,10.5,5.8,8,.88],
  [['proj','FLARE UP','#ff9ae0',{shape:'star',up:1}],['roll','CARTWHEEL','#ff6ab4'],['barrage','ENCORE','#ff3ea5']]);
F('gideon','GIDEON STONE','THE MOUNTAIN','Giant, slow, huge hits','dock',[.7,1.2,1.32,.85,1.08,1],{skin:'#d7a684',hair:'shaved',hairCol:'#5a4a3a',beard:'#5a4a3a',eye:'#3a3028',gloves:'#5a4a3a',trunks:'#2a3a2a',trim:'#a89a7a',hairy:1,jaw:.96,chin:.62},[40,56,13.5,11,12.5,1.26,{belly:1}],
  [['slam','ROCKSLIDE','#a89a8a'],['shield','GRANITE','#c8c0b0'],['rise','MOUNTAIN TOP','#e8e2d0']]);
F('kai','KAI NAKAMURA','THE WAVE','Surfer, slippery','pier',[1.08,1,1,1.05],{skin:'#c98c62',hair:'curly',hairCol:'#e8c878',headband:'#2bb3a6',eye:'#3a6aa8',gloves:'#2bb3a6',trunks:'#2a8ac8',trim:'#f4f1ea'},[25,45,11,7,9,.98],
  [['proj','RIPTIDE','#5ab0ff',{shape:'wave',fast:1}],['slide','WIPEOUT','#2bb3a6'],['leap','HANG TEN','#f2c14e']]);
F('dolly','DOLLY RAMOS','THE BULLDOZER','Big rushdown','dock',[.85,1.12,1.15,1,1,1],{skin:'#8a5536',hair:'afro',hairCol:'#2a1a10',lips:'#a0383a',earrings:1,gloves:'#e8b62c',trunks:'#c8263a',trim:'#e8b62c',top:'#c8263a',jaw:.78,chin:.42},[34,46,12,9.5,11,1.08,{belly:1}],
  [['dash','BULLDOZER','#e8b62c'],['grab','BEAR HUG','#c8263a'],['armor','NO SELL','#f4f1ea']]);
F('hex','HEX MORROW','THE WITCH','Curses and traps','chapel',[1,.95,.9],{skin:'#e8d8e0',hair:'long',hairCol:'#2a1438',paint:'#7a3ab0',lips:'#4a1a5a',eye:'#a86ae8',earrings:1,gloves:'#4a1a5a',trunks:'#1a0e24',trim:'#a86ae8',top:'#1a0e24',jaw:.68,chin:.34},[22,45,10.8,6,8.5,.94],
  [['drain','HEX DRAIN','#a86ae8'],['rain','CURSE FALL','#c86ae8',{shape:'orb'}],['trap','RUNE TRAP','#a86ae8',{shape:'rune'}]]);
F('ace','ACE DALTON','THE GAMBLER','Cards and tricks','roof',[1.05,1.06,1],{skin:'#e0b896',hair:'slick',hairCol:'#2a1a10',mustache:'#2a1a10',eye:'#3a2a1a',gloves:'#c8263a',trunks:'#141018',trim:'#f4f1ea',chain:1},[25,46,11.2,7,9,1],
  [['proj','FULL HOUSE','#f4f1ea',{shape:'card',triple:1}],['tele','SLEIGHT OF HAND','#c8263a'],['counter','CALL THE BLUFF','#f2c14e']]);
F('bones','BONES MALONE','THE UNDERTAKER','Grabs and drains','chapel',[.95,1.02,1,1,1.04],{skin:'#e8e0d0',hair:'bald',skull:1,eye:'#c8263a',gloves:'#141018',trunks:'#141018',trim:'#e8e0d0',jaw:.74,chin:.4},[24,50,11.5,6.5,9,1.06],
  [['grab','GRAVE DIGGER','#e8e0d0'],['drain','LAST RITES','#c8263a'],['rain','BONE RAIN','#e8e0d0',{shape:'shard'}]]);
F('nyx','NYX ORLOV','THE SHADOW','Fast and low','roof',[1.2,0.95,0.95,1.1,1,-1],{skin:'#d7a684',hair:'slick',hairCol:'#141018',scarf:'#141018',eye:'#5a5a7a',gloves:'#2a2a3a',trunks:'#141018',trim:'#5a5a7a',top:'#141018',jaw:.7,chin:.36},[22,45,10.8,6,8.2,.94],
  [['roll','NIGHTFALL','#5a5a7a'],['slide','SHADE SLIDE','#3a3a5a'],['flurry','THOUSAND CUTS','#c8c8e8']]);
F('duke','DUKE WELLINGTON','THE ARISTOCRAT','Classic boxer','crown',[1,1.05,1,1,1.05],{skin:'#f1d0b5',hair:'slick',hairCol:'#a8a098',mustache:'#a8a098',monocle:1,eye:'#4a5a7a',gloves:'#f4f1ea',trunks:'#2a3a6a',trim:'#e5bd4f',jaw:.76,chin:.48},[24,48,11,7,9,1.02],
  [['counter','RIPOSTE','#f4f1ea'],['dash',"GENTLEMAN'S JAB",'#e5bd4f'],['buff','STIFF UPPER LIP','#c8263a']]);
F('tank','TANK MORGAN','THE TANK','Armored zoner','dock',[.82,1.1,1.15,1,1,1],{skin:'#a86e48',hair:'buzz',hairCol:'#2a2a20',scar:1,chain:1,eye:'#2a2a20',gloves:'#4a5a2a',trunks:'#4a5a2a',trim:'#c8b878',top:'#6a7a4a',jaw:.92,chin:.52},[34,48,12.5,10,11,1.1,{cut:1}],
  [['proj','CANNONBALL','#3a3a3a',{shape:'ball',big:1}],['armor','TREAD MARKS','#6a7a4a',{charge:1}],['quake','ARTILLERY','#e8b62c']]);
F('lulu','LULU FONTAINE','THE DANCER','Agile spinner','roof',[1.15,1.02,1,1.15],{skin:'#c9926a',hair:'bun',hairCol:'#3a2416',flower:'#ff6ab4',lips:'#c0263a',earrings:1,eye:'#2a1610',gloves:'#ff9ac8',trunks:'#ff9ac8',trim:'#f4f1ea',top:'#ff9ac8',jaw:.66,chin:.34},[21,46,10.5,5.6,8,.92],
  [['multi','PIROUETTE','#ff9ac8'],['leap','GRAND JETÉ','#ff6ab4'],['roll','PLIÉ ROLL','#f4f1ea']]);
F('moose','MOOSE LAFLEUR','THE LUMBERJACK','Big swinger','ice',[.82,1.18,1.3,1,1.04,1],{skin:'#efc4a4',hair:'curly',hairCol:'#6a3d1e',beard:'#6a3d1e',eye:'#3a5a2a',gloves:'#c8263a',trunks:'#2a2a30',trim:'#c8263a',top:'#c8263a',hairy:1,jaw:.94,chin:.58},[36,50,12.8,10,11.5,1.16],
  [['multi','AXE SWING','#c8263a'],['slam','TIMBER!','#8a5a2a'],['grab','LUMBER LIFT','#6a3d1e']]);
F('quill','QUILL ABARA','THE PORCUPINE','Spiky defender','pier',[1,.95,1],{skin:'#8a5536',hair:'spiky',hairCol:'#e8e2d0',eye:'#e8b62c',earrings:1,gloves:'#6a4a2a',trunks:'#3a2a1a',trim:'#e8e2d0'},[25,44,11,7,9,.96],
  [['reflect','QUILL GUARD','#e8e2d0'],['proj','NEEDLE SPRAY','#e8e2d0',{shape:'shard',triple:1}],['counter','PRICKLY','#e8b62c']]);
F('zed','ZED ROSARIO','THE ZERO','Tech zoner','ice',[.95,1,1.02],{skin:'#c98c62',hair:'fade',hairCol:'#2a2a3a',shades:'#3ee8ff',eye:'#3ee8ff',gloves:'#3a3a4a',trunks:'#1a1a24',trim:'#3ee8ff',top:'#2a2a3a'},[26,47,11.2,7.5,9.5,1.02],
  [['beam','RAILGUN','#3ee8ff'],['shield','FORCE FIELD','#3ee8ff'],['pull','TRACTOR BEAM','#9ae8ff']]);
F('mama','MAMA OSEI','THE MATRIARCH','Tough, heals','gym',[.88,1.02,1.04,.9],{skin:'#6e4130',hair:'bun',hairCol:'#c8c0b8',old:1,glasses:1,earrings:1,lips:'#8a3a3a',bandana:'#e8b62c',gloves:'#e8b62c',trunks:'#2a6a3a',trim:'#e8b62c',top:'#2a6a3a',jaw:.8,chin:.46},[30,44,11.8,8,9.5,.98,{belly:1}],
  [['heal','CHICKEN SOUP','#7dff9a'],['grab','TIME OUT','#e8b62c'],['proj','FLYING PAN','#3a3a40',{shape:'disc',arc:1}]]);
F('coil','COIL BRENNAN','THE SPRING','Jumper','gym',[1.1,.92,.9,1.35],{skin:'#e0a982',hair:'mohawk',hairCol:'#3ee86a',eye:'#2a4a2a',gloves:'#3ee86a',trunks:'#2a2a30',trim:'#3ee86a',jaw:.72,chin:.4},[22,46,10.6,6,8.4,.95],
  [['leap','POGO DROP','#3ee86a'],['rise','BOING','#9aff9a'],['slide','RECOIL','#3ee86a']]);
F('sumo','HARU ITO','THE YOKOZUNA','Giant pusher','ice',[.72,1.15,1.3,.8,1,1],{skin:'#e9b48f',hair:'bun',hairCol:'#141010',gloves:'#f4f1ea',trunks:'#f4f1ea',trim:'#2a2a6a',jaw:.98,chin:.62},[42,48,13.5,11,12,1.18,{belly:1}],
  [['quake','SHIKO STOMP','#c8a87a'],['barrage','TSUPPARI','#f4f1ea'],['grab','YORIKIRI','#2a2a6a']]);
F('volt','VOLT IBARRA','LIVE WIRE','Electric rushdown','roof',[1.12,1,1,1,1,-1],{skin:'#a86e48',hair:'spiky',hairCol:'#ffe640',paint:'#ffe640',eye:'#ffe640',gloves:'#ffe640',trunks:'#2a2a30',trim:'#ffe640',jaw:.76,chin:.42},[24,45,11,7,9,.97],
  [['freeze','STUN GUN','#ffe640'],['dash','SHORT CIRCUIT','#ffe640',{fast:1}],['beam','ARC FLASH','#fff4a0',{jag:1}]]);
F('cleo','CLEO MBEKI','THE QUEEN','Regal zoner','crown',[1,1.05,1,1,1.04],{skin:'#8a5536',hair:'cornrows',hairCol:'#141010',headband:'#e5bd4f',earrings:1,lips:'#7a2a3a',gloves:'#e5bd4f',trunks:'#4a2a8a',trim:'#e5bd4f',top:'#4a2a8a',jaw:.68,chin:.36},[23,47,10.8,6.2,8.6,.98],
  [['proj','CROWN TOSS','#e5bd4f',{shape:'ring'}],['reflect','ROYAL GUARD','#e5bd4f'],['tele','EXIT STAGE LEFT','#a86ae8']]);
F('grit','GRIT HOLLOWAY','THE MINER','Explosives','dock',[.92,1.05,1.05],{skin:'#d7a684',hair:'buzz',hairCol:'#3a2a1a',helmet:'#e8b62c',stubble:'#3a2a1a',eye:'#3a2a1a',gloves:'#6a5a4a',trunks:'#3a3a3a',trim:'#e8b62c',jaw:.88,chin:.5},[30,45,11.8,8.5,10,1.02],
  [['trap','DYNAMITE','#ff5a3a',{shape:'tnt'}],['quake','CAVE-IN','#a89a8a'],['pull','PICKAXE HOOK','#c8c8d8']]);
F('rocco','ROCCO BIANCHI','THE MEATBALL','Chef, heals','gym',[.9,1.05,1.1],{skin:'#e9b48f',hair:'curly',hairCol:'#2a1a10',mustache:'#2a1a10',bandana:'#f4f1ea',eye:'#3a2a1a',gloves:'#c8263a',trunks:'#2a8a3a',trim:'#f4f1ea',jaw:.9,chin:.52},[32,44,12.2,8.5,10,1,{belly:1}],
  [['proj','MEATBALL','#8a4a2a',{shape:'ball',arc:1}],['heal','TASTE TEST','#7dff9a'],['armor','ROLLING PIN','#d8b878']]);
F('sky','SKY DELACROIX','THE HAWK','Aerial','pier',[1.08,0.92,.92,1.25],{skin:'#c9926a',hair:'mohawk',hairCol:'#3a2416',paint:'#f4f1ea',eye:'#e8b62c',earrings:1,gloves:'#8a5a2a',trunks:'#3a5a8a',trim:'#f4f1ea'},[23,46,11,6.5,8.6,.96],
  [['leap','TALON DIVE','#e8b62c'],['rise','UPDRAFT','#9ae8ff'],['rain','FEATHER STORM','#f4f1ea',{shape:'shard'}]]);
F('mags','MAGS PRICE','THE MAGNET','Pull and push','ice',[1,1,1.05],{skin:'#f1c8a5',hair:'pomp',hairCol:'#2a2a30',eye:'#3a5a8a',lips:'#c0263a',gloves:'#c8263a',trunks:'#5a8ac8',trim:'#c8263a',top:'#c8263a',jaw:.7,chin:.36},[24,45,11,7,9,.98],
  [['pull','MAGNET PULL','#c8263a'],['reflect','REPEL','#5a8ac8'],['dash','ATTRACTION','#c8263a']]);
F('otis','OTIS GREENE','THE OLD OAK','Veteran wall','gym',[.85,1.05,1.08],{skin:'#3d2417',hair:'shaved',hairCol:'#c8c0b8',facial:'goatee',beard:null,old:1,eye:'#2a1a10',gloves:'#6a4a2a',trunks:'#2a4a2a',trim:'#c8a87a',jaw:.86,chin:.5},[30,48,12,8.5,10,1.05],
  [['shield','THICK BARK','#8a6a3a'],['counter','OLD TRICKS','#fff4c0'],['rise','ROOTED UPPERCUT','#7ad04a']]);
F('rina','RINA VOSS','THE VALKYRIE','Tall warrior','ice',[.98,1.05,1.02,1,1.06],{skin:'#f1d0b5',hair:'braids',hairCol:'#e8c878',paint:'#5a8ac8',eye:'#5ab8e8',gloves:'#a8b8c8',trunks:'#3a2a1a',trim:'#c8a87a',top:'#3a2a1a',jaw:.74,chin:.4},[26,50,11.2,7.5,9.5,1.1],
  [['armor','WAR CRY','#e8c878'],['leap','VALHALLA DROP','#5ab8e8'],['barrage','BERSERK','#c8263a']]);
F('dez','DEZ MONROE','THE DJ','Sound waves','roof',[1.02,.98,.98],{skin:'#55321f',hair:'fade',hairCol:'#141010',shades:'#7a3ab0',chain:1,gloves:'#7a3ab0',trunks:'#141018',trim:'#3ee8ff',top:'#7a3ab0'},[25,46,11.2,7,9,1],
  [['proj','BASS DROP','#7a3ab0',{shape:'note',fast:1}],['quake','SUBWOOFER','#7a3ab0'],['buff','TURN IT UP','#3ee8ff']]);
F('hugo','HUGO BRANDT','THE BUTCHER','Hook and grab','dock',[.8,1.15,1.18,.95,1,1],{skin:'#efd6c8',hair:'bald',mustache:'#8a6a4a',eye:'#5a4a3a',gloves:'#c8263a',trunks:'#f4f1ea',trim:'#c8263a',hairy:1,jaw:.95,chin:.58},[36,48,12.6,10,11,1.12,{belly:1}],
  [['grab','CLEAVER','#c8c8d8'],['pull','MEAT HOOK','#a8a8b8'],['armor','CHOP BLOCK','#c8263a']]);
F('wren','WREN ADAIR','THE SONGBIRD','Tiny, fast, heals','pier',[1.25,0.92,0.94,1.15,.92,-1],{skin:'#f1c6a4',hair:'long',hairCol:'#8a5a2a',freckles:1,eye:'#3a6a2a',gloves:'#e8b62c',trunks:'#5a8a3a',trim:'#e8b62c',top:'#5a8a3a',jaw:.66,chin:.34},[20,42,10.2,5.4,7.8,.84],
  [['proj','TRILL','#e8b62c',{shape:'note',up:1}],['roll','NOSEDIVE','#5a8a3a'],['heal','SWEET SONG','#7dff9a']]);
F('gator','GATOR BOUDREAUX','THE SWAMP KING','Grabs and traps','pier',[.9,1.08,1.12],{skin:'#c98c62',hair:'slick',hairCol:'#2a3a1a',stubble:'#3a2a1a',paint:'#3a6a2a',eye:'#c8b83a',gloves:'#3a6a2a',trunks:'#5a4a2a',trim:'#c8b83a',tattoo:1,jaw:.92,chin:.52},[33,47,12.3,9.5,10.5,1.08],
  [['grab','DEATH ROLL','#3a6a2a'],['slide','MUD SLIDE','#6a5a3a'],['trap','SNAPPER','#3a6a2a']]);
F('orbit','ORBIT CHEN','THE ASTRONAUT','Floaty zoner','crown',[.95,1,0.95,1.3],{skin:'#e0a982',hair:'buzz',hairCol:'#141010',headgear:'#f4f1ea',gloves:'#f4f1ea',trunks:'#2a5ac8',trim:'#ff5a3a',top:'#f4f1ea'},[26,46,11.4,7.2,9.2,1],
  [['proj','MOON ROCK','#a8a8b8',{shape:'ball',big:1}],['leap','LOW GRAVITY','#9ae8ff'],['rain','METEOR SHOWER','#ff8a2a',{shape:'fire'}]]);
ROSTER.forEach((f,i)=>{RIX[f.id]=i;f.jump=f.jump||1;f.reach=f.reach||1;f.qk=f.qk||0});
