/* =====================================================================================================
   THE TALE OF WICK: HOLLOW WOOD, a 3D adventure for ZigaPlay 2.0.
   The four beacons around the valley have gone dark and the fog is coming down off the hills. You keep the
   village lamps. You never say a word. Find your grandfather's sword, go down into the four old keeper-houses,
   bring back their flames, and open the Spire.

   Controls: stick or D-pad to walk, A sword (hold to charge a spin), B roll, X and Y the items you set in the bag,
   START the bag, SELECT the map. On the keyboard: arrows, Z sword, X roll, V item X, C item Y, Enter, Shift.

   The world is made of screens of 12 x 12 tiles of 16 pixels. The overworld is a 6 x 6 grid of screens; the barrow,
   four dungeons, the Spire and a few caves and houses are small grids of rooms. Rooms are built from short
   descriptions (a theme, which sides are open, what stands in the way, a template for a puzzle) by the code in
   part 3, so the whole valley fits in a few pages.

   Part 1: pictures. Everything is drawn here, once, from strings and a few shapes.
   ===================================================================================================== */
const TS=16,RW=12,RH=12,HUD=18,GW=RW*TS,GH=RH*TS+HUD,TAU=Math.PI*2;
function spr(rows,pal,w=16,h=16){const c=mkCanvas(w,h),x=c.getContext('2d');for(let y=0;y<h;y++){const r=rows[y]||'';for(let i=0;i<w;i++){const ch=r[i];if(!ch||ch==='.')continue;const col=pal[ch];if(!col)continue;x.fillStyle=col;x.fillRect(i,y,1,1)}}return c}
const flipH=c=>{const d=mkCanvas(c.width,c.height),x=d.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return d};
const K='#1a1424';

/* ---------- you: a grey hood, an orange scarf, a brown tunic ---------- */
const PAL_P={k:K,H:'#5d6f94',h:'#47577c',f:'#f2c9a0',S:'#e8743a',s:'#b4532c',T:'#7c5b3b',t:'#5e4430',b:'#3b2a1e',B:'#3a2a30'};
const P_DOWN=["......kkkk......","....kkHHHHkk....","...kHHHHHHHHk...","...kHHhhhhHHk...","...kHhffffhHk...","...kHfkffkfHk...","....kffffffk....","....kSSSSSSk....",
  "...kSSssSSSSk...","..kfkTTSSTTkfk..","..kfkTTTTTTkfk..","...kkTbbbbTkk...","....kTTTTTTk....","....ktTkkTtk....","....kBBk.kBBk...",".....kk...kk...."];
const P_UP=["......kkkk......","....kkHHHHkk....","...kHHHHHHHHk...","...kHHHHHHHHk...","...kHHHhhHHHk...","...kHHHHHHHHk...","....kHHHHHHk....","....kSSSSSSk....",
  "...kSSSSSSSSk...","..kfkTTsSTTkfk..","..kfkTTsSTTkfk..","...kkTbbbbTkk...","....kTTTTTTk....","....ktTkkTtk....","....kBBk.kBBk...",".....kk...kk...."];
const P_SIDE=["......kkkk......","....kkHHHHk.....","...kHHHHHHHk....","...kHHHHHhhk....","...kHHHHhffk....","...kHHHhffkfk...","....kHHffffk....","....kSSSSSk.....",
  "...kSSSsSSk.....","..kSskTTTTk.....","..kskkTTTfk.....","....kTbbbbk.....","....kTTTTTk.....","....ktTkTtk.....","....kBBkBBk.....",".....kk.kk......"];
const stepLegs=(rows,legs)=>rows.slice(0,13).concat(legs);
const LEGS_FB=["...ktTk..kTtk...","...kBBk..kBBk...","....kk....kk...."],LEGS_S=["...ktTk.kTtk....","...kBBk.kBBk....","....kk...kk....."];
const PSPR={down:[spr(P_DOWN,PAL_P),spr(stepLegs(P_DOWN,LEGS_FB),PAL_P)],up:[spr(P_UP,PAL_P),spr(stepLegs(P_UP,LEGS_FB),PAL_P)],right:[spr(P_SIDE,PAL_P),spr(stepLegs(P_SIDE,LEGS_S),PAL_P)]};
PSPR.left=PSPR.right.map(flipH);

/* ---------- the people of Hollowmere: one shape, their own colours and hats ---------- */
const NPC_BASE=["................","......kkkk......",".....kHHHHk.....","....kHHHHHHk....","....kHffffHk....","....kfkffkfk....","....kffffffk....",".....kffffk.....",
  "....kCCCCCCk....","...kCCCCCCCCk...","...kfCCCCCCfk...","...kkCCccCCkk...","....kCCCCCCk....","....kCCCCCCk....","....kkBkkBkk....","................"];
function npcSprite(p){const c=spr(NPC_BASE,{k:K,f:p.skin||'#f0c8a0',H:p.hair,C:p.coat,c:p.trim||p.coat,B:'#3a2a2a'});const x=c.getContext('2d');
  if(p.hat){x.fillStyle=K;x.fillRect(3,1,10,3);x.fillRect(5,0,6,2);x.fillStyle=p.hat;x.fillRect(4,2,8,1);x.fillRect(6,1,4,1)}
  if(p.beard){x.fillStyle=p.beard;x.fillRect(5,6,6,3);x.fillRect(6,9,4,1);x.fillStyle=K;x.fillRect(6,5,1,1);x.fillRect(9,5,1,1)}
  if(p.shawl){x.fillStyle=p.shawl;x.fillRect(3,8,10,2);x.fillRect(4,10,8,1)}
  if(p.ghost){const d=x.getImageData(0,0,16,16);for(let i=3;i<d.data.length;i+=4)if(d.data[i])d.data[i]=150;x.putImageData(d,0,0)}return c}
const NPCS={
  maren:{name:'Maren',spr:npcSprite({hair:'#d8d8e0',coat:'#7a3a5a',shawl:'#a8586a'})},
  tobin:{name:'Tobin',spr:npcSprite({hair:'#a86a2a',coat:'#3a7ac8'})},
  edda:{name:'Edda',spr:npcSprite({hair:'#5a3a22',coat:'#6a8a4a',shawl:'#c8b87a'})},
  corvo:{name:'Corvo',spr:npcSprite({hair:'#2a2a2a',coat:'#8a3a2a',hat:'#3a2a2a',trim:'#ffd23f'})},
  ilse:{name:'Ilse',spr:npcSprite({hair:'#3a2a1a',coat:'#3a8a7a',hat:'#c8a85a'})},
  hermit:{name:'The Hermit',spr:npcSprite({hair:'#e8e8e8',coat:'#6a5a4a',beard:'#e8e8e8'})},
  scholar:{name:'A drowned scholar',spr:npcSprite({hair:'#b8d8e8',coat:'#6a8aa8',ghost:true,skin:'#d8e8f0'})},
  keeper:{name:'An old keeper',spr:npcSprite({hair:'#8a8a8a',coat:'#5a4a7a',ghost:true,skin:'#d8d8e8'})},
  wick:{name:'Wick',spr:npcSprite({hair:'#c8642a',coat:'#7a8a3a'})},
  bram:{name:'Bram'},oda:{name:'Oda'},fen:{name:'Fen'},twins:{name:'Pell & Poll'}};

/* ---------- things that want to hurt you ---------- */
const E_SPR={};
{const G={k:K,G:'#5cc85a',g:'#3a8a40',w:'#ffffff'};
 E_SPR.slime=[spr(["","","","","","......kkkk......","....kkGGGGkk....","...kGGgGGGGGk...","..kGGwkGGwkGGk..","..kGGkkGGkkGGk..","..kGGGGGGGGGGk..","..kgGGGGGGGGgk..","...kggGGGGggk...","....kkkkkkkk...."],G),
   spr(["","","","","","","","......kkkk......","...kkkGGGGkkk...","..kGGwkGGwkGGk..",".kGGGkkGGkkGGGk.",".kgGGGGGGGGGGgk.","..kggGGGGGGggk..","...kkkkkkkkkk..."],G)];
 const B={k:K,W:'#6a4a8a',P:'#8a6aa8',r:'#ff4a4a'};
 E_SPR.bat=[spr(["","","","..k..........k..",".kWk.kkkkkk.kWk.","kWWWkkPPPPkkWWWk","kWWWWkPrrPkWWWWk",".kWWWkPPPPkWWWk.","..kkWkkPPkkWkk..","....k..kk..k...."],B),
   spr(["","","","","","......kkkk......","..kkkkPPPPkkkk..",".kWWWkPrrPkWWWk.","kWWWWkPPPPkWWWWk","kWWkk.kPPk.kkWWk",".kk....kk....kk."],B)];
 const H={k:K,R:'#6a6a5a',r:'#4e4e42',y:'#e8e05a',d:'#a8a898'};
 const husk=["......kkkk......",".....kRRRRk.....","....kRRRRRRk....","....kRkyykRk....","....kRRRRRRk....","...kRRrrrrRRk...","..kRRRrrrrRRRk..","..kdkRRRRRRkdk..","..kdkRRrrRRkdk..","...kkRRRRRRkk...","....kRRrrRRk....","....kRRRRRRk....","....kRRkkRRk....","....krrk.krrk...","....kkk...kkk..."];
 E_SPR.husk=[spr(husk,H),spr(husk.slice(0,12).concat(["...kRRk..kRRk...","...krrk..krrk...","...kkk....kkk..."]),H)];
 E_SPR.ghoul=[spr(husk,{k:K,R:'#6a2a3a',r:'#4a1a28',y:'#ff6a3a',d:'#c8a8a8'}),spr(husk.slice(0,12).concat(["...kRRk..kRRk...","...krrk..krrk...","...kkk....kkk..."]),{k:K,R:'#6a2a3a',r:'#4a1a28',y:'#ff6a3a',d:'#c8a8a8'})];
 const L={k:K,L:'#c84a6a',l:'#8a2a4a',Q:'#3a8a40',q:'#2a6a30',w:'#1a1424'};
 E_SPR.spitter=[spr(["","......kkkk......","....kkLLLLkk....","...kLLlkklLLk...","...kLk.ww.kLk...","...kLLlkklLLk...","....kkLLLLkk....","......kQQk......",".....kQqQQk.....","...kkQQkkQQkk...","..kQQk....kQQk..","..kk........kk.."],L)];
 E_SPR.spitter.push(spr(["","","......kkkk......","....kkLLLLkk....","...kLLlkklLLk...","...kLLlkklLLk...","....kkLLLLkk....","......kQQk......",".....kQqQQk.....","...kkQQkkQQkk...","..kQQk....kQQk..","..kk........kk.."],L));
 const A={k:K,A:'#8a98b0',a:'#5e6a80',N:'#a8603a',n:'#ffd23f',y:'#ff6a3a'};
 const kn=["......kkkk......",".....kAAAAk.....","....kAAAAAAk....","....kAkkkkAk....","....kAAyyAAk....",".....kAAAAk.....","...kkAAAAAAkk...","..kNNkAaaAkAAk..","..kNnNkAAAkAAk..","..kNNNkAaAkkk...","..kNnNkAAAk.....","...kNNkAAAAk....","....kkkAkkAk....","....kAAk.kAAk...","....kkk...kkk..."];
 E_SPR.knight=[spr(kn,A),spr(kn.slice(0,12).concat(["...kAAk..kAAk...","...kaak..kaak...","...kkk....kkk..."]),A)];
 const Wp={k:'#2a4a6a',W:'#9ae8ff',w:'#ffffff'};
 E_SPR.wisp=[spr(["","......kkkk......","....kkWWWWkk....","...kWWwWWWWWk...","...kWkkWWkkWk...","...kWWWWWWWWk...","...kWWWkkWWWk...","....kWWWWWWk....",".....kWkkWk.....","......k..k......"],Wp),
   spr(["","","......kkkk......","....kkWWWWkk....","...kWWwWWWWWk...","...kWkkWWkkWk...","...kWWWWWWWWk...","...kWWWkkWWWk...","....kWWWWWWk....","....kWk..kWk...."],Wp)];
 const C={k:K,C:'#e86a3a',c:'#b44a2a',w:'#ffffff'};
 E_SPR.crab=[spr(["","","","..kk........kk..",".kCCk......kCCk.",".kCkCk.kk.kCkCk.","..kCCkkwwkkCCk..","...kkCCkkCCkk...","...kCCCCCCCCk...","..kCCCCCCCCCCk..","..kcCCCCCCCCck..","...kkcCCCCckk...","..k.k.kkkk.k.k.."],C),
   spr(["","","",".kk..........kk.","kCCk........kCCk","kCkCk..kk..kCkCk",".kCCkkkwwkkkCCk.","...kkCCkkCCkk...","...kCCCCCCCCk...","..kCCCCCCCCCCk..","..kcCCCCCCCCck..","...kkcCCCCckk...","...k.kkkkkk.k..."],C)];
 const sp=mkCanvas(16,16),sx=sp.getContext('2d');sx.fillStyle=K;for(let i=0;i<8;i++){const a=i/8*TAU;sx.beginPath();sx.moveTo(8+Math.cos(a)*7.8,8+Math.sin(a)*7.8);sx.lineTo(8+Math.cos(a+.35)*4,8+Math.sin(a+.35)*4);sx.lineTo(8+Math.cos(a-.35)*4,8+Math.sin(a-.35)*4);sx.fill()}
 sx.beginPath();sx.arc(8,8,5,0,TAU);sx.fill();sx.fillStyle='#b8c0d0';sx.beginPath();sx.arc(8,8,4,0,TAU);sx.fill();sx.fillStyle='#ffffff';sx.fillRect(6,5,2,2);E_SPR.spinner=[sp,sp];
 const mo=mkCanvas(12,10),mx=mo.getContext('2d');mx.fillStyle=K;mx.fillRect(0,1,12,7);mx.fillStyle='#d8c88a';mx.fillRect(1,2,4,4);mx.fillRect(7,2,4,4);mx.fillStyle='#6a5a3a';mx.fillRect(5,1,2,8);E_SPR.moth=[mo,mo];
 const sh=mkCanvas(14,14),shx=sh.getContext('2d');shx.fillStyle='rgba(20,16,40,.85)';shx.beginPath();shx.arc(7,6,6,Math.PI,0);shx.lineTo(13,13);shx.lineTo(10,11);shx.lineTo(7,13);shx.lineTo(4,11);shx.lineTo(1,13);shx.fill();shx.fillStyle='#e8e0ff';shx.fillRect(4,5,2,2);shx.fillRect(8,5,2,2);E_SPR.shade=[sh,sh]}

/* ---------- small pictures: what you carry and what you pick up ---------- */
const ICON={};
{const ic=(rows,pal)=>spr(rows,Object.assign({k:K},pal),12,12);
 ICON.sword=ic(["..........kk",".........kwk","........kwk.",".......kwk..","......kwk...",".....kwk....","..k.kwk.....","...kwk......","...kbk......","..kbkbk.....",".kbk.kk.....",".kk........."],{w:'#e8eef8',b:'#8a5a2a'});
 ICON.sling=ic(["............","..kk....kk..",".kbbk..kbbk.",".kbbk..kbbk..","..kbkkkkbk..","..kbwwwwbk..","...kbbbbk...","....kbbk....","....kbbk....","....kbbk....","....kkkk....","............"],{b:'#9a6a3a',w:'#e8d8b8'});
 ICON.hook=ic(["........kkk.",".......kgggk",".......kgkgk",".......kggk.","......kgk...",".....kck....","....kck.....","...kck......","..kck.......",".kbbk.......",".kbbk.......","..kk........"],{g:'#c8d0e0',c:'#8a7a5a',b:'#7a3a2a'});
 ICON.lantern=ic(["....kkkk....","...k....k...","..kkkkkkkk..","..kgyyyygk..","..kyoooyyk..","..kyoOOoyk..","..kyoOOoyk..","..kgyyyygk..","..kkkkkkkk..","...kbbbbk...","....kkkk....","............"],{g:'#8a7a5a',y:'#ffe88a',o:'#ffb02a',O:'#ff6a1a',b:'#6a5a3a'});
 ICON.bombs=ic(["........kk..",".......kyk..","......kk.k..",".....kkkk...","...kkbbbbkk.","..kbbwbbbbbk","..kbwbbbbbbk",".kbbbbbbbbbk",".kbbbbbbbbbk","..kbbbbbbbk.","...kkbbbkk..",".....kkk...."],{b:'#3a3a4a',w:'#8a8aa0',y:'#ffd23f'});
 ICON.heart=ic(["............","..kk...kk...",".krrk.krrk..","krwrrkrrrrk.","krrrrrrrrrk.","krrrrrrrrrk.",".krrrrrrrk..","..krrrrrk...","...krrrk....","....krk.....",".....k......","............"],{r:'#e8443a',w:'#ffb0a8'});
 ICON.half=ic(["............","..kk...kk...",".krrk.k..k..","krwrrk....k.","krrrrk....k.","krrrrk....k.",".krrrk...k..","..krrk..k...","...krk.k....","....kk......",".....k......","............"],{r:'#e8443a',w:'#ffb0a8'});
 ICON.empty=ic(["............","..kk...kk...",".k..k.k..k..","k....k....k.","k.........k.","k.........k.",".k.......k..","..k.....k...","...k...k....","....k.k.....",".....k......","............"],{});
 ICON.key=ic(["............","....kkk.....","...kyyyk....","...kykyk....","...kyyyk....","....kyk.....","....kyk.....","....kyyk....","....kyk.....","....kyyk....","....kkk.....","............"],{y:'#ffd23f'});
 ICON.big=ic(["...kkkkk....","..kyyyyyk...","..kykkkyk...","..kyyyyyk...","...kkykk....","....kyk.....","....kyykk...","....kyk.....","....kyyyk...","....kyk.....","....kkk.....","............"],{y:'#ff9a3a'});
 ICON.shard=ic(["............",".....kk.....","....kggk....","...kgwggk...","...kgwggk...","..kggggggk..","..kggggggk..","...kggggk...","...kggggk...","....kggk....",".....kk.....","............"],{g:'#5ad8a0',w:'#d8fff0'});
 ICON.shard5=ic(["............",".....kk.....","....kbbk....","...kbwbbk...","...kbwbbk...","..kbbbbbbk..","..kbbbbbbk..","...kbbbbk...","...kbbbbk...","....kbbk....",".....kk.....","............"],{b:'#5a9aff',w:'#d8e8ff'});
 ICON.shard20=ic(["............",".....kk.....","....kyyk....","...kywyyk...","...kywyyk...","..kyyyyyyk..","..kyyyyyyk..","...kyyyyk...","...kyyyyk...","....kyyk....",".....kk.....","............"],{y:'#ffc83a',w:'#fff6d0'});
 ICON.seeds=ic(["............","............","...kk..kk...","..kbbkkbbk..","..kbwbkbwb..","...kkkkkk...","..kk.kk.kk..",".kbbkbbkbbk.",".kbwkbwkbwk.","..kk.kk.kk..","............","............"],{b:'#8a6a3a',w:'#c8a87a'});
 ICON.map=ic(["............",".kkkkkkkkkk.",".kppkppkppk.",".kpkkppkkpk.",".kppppkpppk.",".kpkppkppkk.",".kppkpppkpk.",".kpppkppppk.",".kkkkkkkkkk.","............","............","............"],{p:'#e8d8a8'});
 ICON.flame=ic(["....k..k....","...kOkkOk...","...kyOOyk...","..kOyyyyOk..","..kkkkkkkk..","..kbbbbbbk..","..kbBbbBbk..","..kbbbbbbk..",".kbbBbbbBbk.","kbbk.kk.kbbk","kk........kk","............"],{O:'#ff6a1a',y:'#ffd23f',b:'#5a3a22',B:'#3a2416'});
 ICON.flameOff=ic(["............","....kkkk....","...kbbbbk...","..kbrbbrbk..","..kbbrrbbk..","..kbrbbrbk..","..kbbbbbbk..","..kbbrbbbk..",".kbbbbrbbbk.","kbbk.kk.kbbk","kk........kk","............"],{b:'#4a3020',r:'#c8302a'});
 ICON.ring=ic(["............","....kkkk....","...kyyyyk...","..kyk..kyk..",".kyk....kyk.",".kyk....kyk.",".kyk....kyk.","..kyk..kyk..","...kyyyyk...","....kkkk....","............","............"],{y:'#ffd23f'});
 ICON.box=ic(["............","............","..kkkkkkkk..",".kbbbbbbbbk.",".kBBBBBBBBk.",".kkkkyykkkk.",".kbbbyybbbk.",".kbbbbbbbbk.",".kbbbbbbbbk.",".kkkkkkkkkk.","............","............"],{b:'#3a7a7a',B:'#2a5a5a',y:'#ffd23f'});
 ICON.piece=ic(["............","..kk........",".krrk.......","krwrrk......","krrrrk......","kkkkkk......","............","............","............","............","............","............"],{r:'#e8443a',w:'#ffb0a8'});
 ICON.container=ic(["............","..kk...kk...",".kyyk.kyyk..","kyrrykyrryk.","kyrrrrrrryk.","kyrrrrrrryk.",".kyrrrrryk..","..kyrrryk...","...kyryk....","....kyk.....",".....k......","............"],{r:'#e8443a',y:'#ffd23f'});
 ICON.shield=ic(["............","..kkkkkkkk..","..kssssssk..","..ksyssysk..","..kssyyssk..","..kssyyssk..","..ksyssysk..","...kssssk...","....kssk....",".....kk.....","............","............"],{s:'#5a7ab8',y:'#ffd23f'});
 ICON.edge=ic(["..........kk",".........kyk","........kyk.",".......kyk..","......kyk...",".....kyk....","..k.kyk.....","...kyk......","...kbk......","..kbkbk.....",".kbk.kk.....",".kk........."],{y:'#ffe88a',b:'#8a5a2a'});
 ICON.bag=ic(["............","....kkkk....","...kbbbbk...","....kkkk....","...kbbbbk...","..kbbbbbbk..","..kbbwbbbk..","..kbbbbbbk..","..kbbbbbbk..","...kkkkkk...","............","............"],{b:'#a87a4a',w:'#ffd23f'});}

/* ---------- the ground: every tile drawn once per place and kept ---------- */
/* outside means "out in the hollow": every place is somewhere inside the tree */
const THEMES={
  village:{g:'#7e6a46',g2:'#6e5c3c',d:'#a8865a',d2:'#94744a',blk:'T',tree:'#6a4a2e',tree2:'#5a3e26',trunk:'#5e3e24',fm:'dirt'},
  meadow:{g:'#5a6432',g2:'#4c562a',d:'#8a6a42',d2:'#7a5c38',blk:'T',tree:'#5e4228',tree2:'#4e3820',trunk:'#5a3a22',fm:'grass'},
  field:{g:'#4e6a32',g2:'#425c2a',d:'#8a7a4a',d2:'#7a6a40',blk:'T',tree:'#5a3e24',tree2:'#4a3420',trunk:'#5a3a22',fm:'grass'},
  wood:{g:'#5e4a34',g2:'#523f2c',d:'#7a5e3e',d2:'#6a5034',blk:'T',tree:'#5a3e24',tree2:'#4a3420',trunk:'#4e3420',fm:'dirt'},
  deep:{g:'#43362a',g2:'#3a2e24',d:'#5a4630',d2:'#4e3c2a',blk:'T',tree:'#4a3220',tree2:'#3a281a',trunk:'#3e2a1a',fm:'dirt'},
  pine:{g:'#3e5a58',g2:'#344e4c',d:'#6a6a5a',d2:'#5a5a4c',blk:'N',tree:'#4ac8c0',tree2:'#2a8a9a',trunk:'#d8d0b8',fm:'grass'},
  ash:{g:'#5e5260',g2:'#524654',d:'#6e6270',d2:'#605464',blk:'R',tree:'#5a4a5a',tree2:'#4a3a4a',trunk:'#4a3a2a',fm:'dirt'},
  crag:{g:'#a07e54',g2:'#8e6e48',d:'#b8925e',d2:'#a48250',blk:'R',tree:'#7a5a3a',tree2:'#6a4a2e',trunk:'#5a3c22',fm:'bark'},
  plaza:{g:'#7a3e34',g2:'#6a342c',d:'#9a5e4c',d2:'#8a5040',blk:'T',tree:'#6a2a22',tree2:'#5a221c',trunk:'#5a241c',fm:'dirt'},
  river:{g:'#8a6a3a',g2:'#7a5c32',d:'#a8844a',d2:'#947440',blk:'T',tree:'#5e4228',tree2:'#4e3820',trunk:'#5a3a22',fm:'dirt'},
  shore:{g:'#9a7a46',g2:'#8a6c3e',d:'#b8945a',d2:'#a4844e',blk:'T',tree:'#5e4228',tree2:'#4e3820',trunk:'#5a3a22',fm:'dirt'},
  lake:{g:'#9a7a46',g2:'#8a6c3e',d:'#b8945a',d2:'#a4844e',blk:'T',tree:'#5e4228',tree2:'#4e3820',trunk:'#5a3a22',fm:'dirt'},
  /* inside */
  cave:{f:'#4e4640',f2:'#443c36',w:'#2c2620',w2:'#3c342c',wt:'#5a5048',acc:'#8a7a6a'},
  house:{f:'#a8784a',f2:'#966a40',w:'#6a4a32',w2:'#7a583c',wt:'#c8a070',acc:'#e8c890'},
  d1:{f:'#5a4a38',f2:'#504232',w:'#2e2418',w2:'#3e3224',wt:'#6a5a40',acc:'#4a8a3a'},
  d2:{f:'#4a6676',f2:'#425c6a',w:'#22323e',w2:'#2e404e',wt:'#5a7a8a',acc:'#7ac8d8'},
  d3:{f:'#55555e',f2:'#4b4b54',w:'#26262e',w2:'#32323c',wt:'#62626e',acc:'#c8b88a'},
  d4:{f:'#6a5232',f2:'#5e482c',w:'#32220e',w2:'#432e16',wt:'#7a6038',acc:'#8ab84a'},
  sp:{f:'#5a2c26',f2:'#4e2620',w:'#2a100c',w2:'#3a1814',wt:'#8a4436',acc:'#ff6a4a'}};
const INSIDE=t=>!!THEMES[t]&&!!THEMES[t].f;
const TCACHE=new Map();
const shadeC=(h,a)=>{const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(a<0?v*(1+a):v+(255-v)*a)));return'#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('')};
function tileImg(theme,ch,v,fr){const key=theme+ch+v+'|'+fr;let c=TCACHE.get(key);if(c)return c;c=mkCanvas(16,16);drawTile(c.getContext('2d'),theme,ch,v,fr);TCACHE.set(key,c);return c}
function drawTile(x,theme,ch,v,fr){const T=THEMES[theme]||THEMES.meadow,ins=INSIDE(theme),R=(n=>()=>(n=(n*16807+11)%2147483647)/2147483647)(v*977+ch.charCodeAt(0)*31+7);
  const P=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a,b,w,h)},D=(c,cx,cy,r)=>{x.fillStyle=c;x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill()};
  const ground=()=>{if(ins){P(T.f,0,0,16,16);P(T.f2,0,0,8,8);P(T.f2,8,8,8,8);P(shadeC(T.f,-.12),0,15,16,1);P(shadeC(T.f,-.12),15,0,1,16);for(let i=0;i<3;i++)P(shadeC(T.f,.08),R()*14|0,R()*14|0,2,1)}
    else{P(T.g,0,0,16,16);for(let i=0;i<5;i++){const a=R()*14|0,b=R()*14|0;P(T.g2,a,b,1,2);P(T.g2,a+1,b+1,1,1)}if(v%5===0){P(shadeC(T.g,.12),R()*12|0,R()*12|0,2,1)}}};
  const wall=()=>{if(ins){P(T.w,0,0,16,16);P(T.w2,1,1,14,6);P(T.w2,1,9,6,6);P(T.w2,9,9,6,6);P(T.wt,1,1,14,1);P(T.wt,1,9,6,1);P(T.wt,9,9,6,1);P(shadeC(T.w,-.3),0,7,16,2)}
    else{P(shadeC(T.d,-.25),0,0,16,16);P(shadeC(T.d,-.1),1,1,14,10);P(shadeC(T.d,.1),1,1,14,2);P(shadeC(T.d,-.4),0,12,16,4)}};
  switch(ch){
    case '.':case ',':ground();if(ch===','&&ins){P(T.acc,R()*12|0,R()*12|0,2,2)}break;
    case '_':if(ins){ground();break}P(T.d,0,0,16,16);for(let i=0;i<4;i++)P(T.d2,R()*14|0,R()*14|0,2,1);break;
    case 'a':P(T.d,0,0,16,16);for(let i=0;i<6;i++)P(T.d2,R()*14|0,R()*14|0,1,1);break;
    case 'f':ground();for(const[a,b,c]of[[3,4,'#ff7ab0'],[10,9,'#fff6a0'],[6,12,'#ffffff']]){P('#2f8f3a',a,b+1,1,2);P(c,a-1,b-1,3,2);P(c,a,b-2,1,4)}break;
    case '#':wall();break;
    case 'v':wall();P(T.acc||'#3a8a3a',3,0,2,16);P(T.acc||'#3a8a3a',2,5,4,2);P(T.acc||'#3a8a3a',10,2,2,12);break;
    case 'T':ground();D(K,8,7,7.5);D(T.tree2,8,7,6.6);D(T.tree,7,6,5.4);D(shadeC(T.tree,.25),6,4,2.2);P(K,6,12,4,4);P(T.trunk,7,12,2,4);break;
    case 'N':ground();x.fillStyle=K;x.beginPath();x.moveTo(8,0);x.lineTo(15,12);x.lineTo(1,12);x.fill();x.fillStyle=T.tree;x.beginPath();x.moveTo(8,1.5);x.lineTo(13.6,11);x.lineTo(2.4,11);x.fill();
      x.fillStyle=T.tree2;x.beginPath();x.moveTo(8,6);x.lineTo(13.6,11);x.lineTo(2.4,11);x.fill();P(K,6,12,4,4);P(T.trunk,7,12,2,4);break;
    case 'R':ins?P(T.f,0,0,16,16):ground();x.fillStyle=K;x.beginPath();x.ellipse(8,9,7.5,6.5,0,0,TAU);x.fill();x.fillStyle='#8a8a94';x.beginPath();x.ellipse(8,9,6.5,5.5,0,0,TAU);x.fill();x.fillStyle='#a8a8b4';x.beginPath();x.ellipse(6.5,7.5,3.5,2.5,0,0,TAU);x.fill();P('#6a6a74',4,12,9,1);break;
    case 'r':ins?wall():(ground(),D(K,8,9,7.4),D('#9a9088',8,9,6.4),D('#b4aaa0',6.5,7.5,3));x.strokeStyle=K;x.lineWidth=1;x.beginPath();x.moveTo(5,3);x.lineTo(8,8);x.lineTo(6,12);x.moveTo(8,8);x.lineTo(12,10);x.stroke();break;
    case 'b':ground();D(K,8,9,7);D('#3a9a3a',8,9,6);D('#5ac04a',7,7.5,4);P('#2a7a2a',5,10,2,1);P('#2a7a2a',10,8,2,1);P('#8ae06a',6,5,2,1);break;
    case 'B':ground();x.strokeStyle='#4a2a3a';x.lineWidth=2;for(let i=0;i<5;i++){x.beginPath();x.moveTo(R()*16,16);x.quadraticCurveTo(R()*16,R()*8,R()*16,0);x.stroke()}x.strokeStyle='#8a4a6a';x.lineWidth=1;for(let i=0;i<4;i++){x.beginPath();x.moveTo(R()*16,R()*16);x.lineTo(R()*16,R()*16);x.stroke()}
      for(let i=0;i<6;i++)P('#d8c8d0',R()*15|0,R()*15|0,1,1);break;
    case 'w':P('#3a7ad8',0,0,16,16);P('#4a8ae8',0,0,16,3);P('#6aaaf8',(fr*5+v*3)%12,5+(v%3)*3,4,1);P('#6aaaf8',(fr*5+v*7+6)%12,11,3,1);break;
    case 'j':P('#3a7ad8',0,0,16,16);P('#8adcff',(fr*4+v)%12,4,3,1);P('#ffffff',(fr*3+v*5)%13,10,2,1);P('#ff9ae8',(fr*7+v*3)%13,7,1,1);break;
    case 'p':P('#0c0a14',0,0,16,16);P('#1e1a28',0,0,16,3);P('#2a2436',0,0,16,1);break;
    case 'L':P('#d8440c',0,0,16,16);P('#ff8a1a',0,0,16,4);P('#ffd23f',(fr*5+v*3)%13,6+(v%2)*4,3,2);P('#ff6a1a',(fr*3+v*5)%12,12,4,1);break;
    case '=':P('#3a7ad8',0,0,16,16);P(K,0,1,16,14);P('#a8784a',0,2,16,12);for(let i=0;i<16;i+=4){P('#7a5432',i,2,1,12)}P('#c8986a',0,2,16,1);break;
    case 'P':ins?ground():ground();P(K,5,1,6,15);P('#9a6a3a',6,2,4,13);P('#c8986a',6,2,1,13);D(K,8,3,3.2);D('#c8d0e0',8,3,2.2);D(K,8,3,.9);break;
    case 'i':case 'I':ins?ground():ground();P(K,4,6,8,10);P('#6a6a74',5,7,6,8);P('#8a8a94',5,7,6,2);P(K,3,4,10,3);P('#5a5a64',4,5,8,1);
      if(ch==='I'){x.fillStyle='#ff6a1a';x.beginPath();x.moveTo(8,-1+(fr%2));x.lineTo(12,5);x.lineTo(4,5);x.fill();x.fillStyle='#ffd23f';x.beginPath();x.moveTo(8,2+(fr%2));x.lineTo(10,5);x.lineTo(6,5);x.fill()}break;
    case 'o':ground();P(K,2,2,12,12);P(shadeC(ins?T.f:T.g,-.2),3,3,10,10);P(shadeC(ins?T.f:T.g,-.05),4,4,8,8);break;
    case 'c':ground();x.fillStyle=K;x.beginPath();x.moveTo(8,0);x.lineTo(14,8);x.lineTo(8,16);x.lineTo(2,8);x.fill();x.fillStyle=fr?'#4a8aff':'#ff8a2a';x.beginPath();x.moveTo(8,1.5);x.lineTo(12.5,8);x.lineTo(8,14.5);x.lineTo(3.5,8);x.fill();
      x.fillStyle='#ffffff';x.beginPath();x.moveTo(8,3);x.lineTo(10,8);x.lineTo(8,8);x.fill();break;
    case 'O':case 'u':{const col=ch==='O'?'#e8742a':'#3a7ae8';ground();if(fr){P(K,1,1,14,14);P(shadeC(col,-.25),2,2,12,12);P(col,2,2,12,9);P(shadeC(col,.35),2,2,12,2)}else{P(shadeC(col,-.5),3,3,10,10);P(shadeC(col,-.25),4,4,8,8)}}break;
    case 'e':case 'E':wall();P(K,3,3,10,9);P('#f4f0e0',4,4,8,7);if(ch==='e'){D(K,8,7.5,2.6);D('#e8443a',8,7.5,1.8);P('#ffffff',7,6,1,1)}else{P('#6a6a74',4,4,8,7);P(K,4,7,8,1)}break;
    case 'S':ins?ground():P(T.d||'#c8c0b8',0,0,16,16);P(K,1,1,14,14);for(let i=0;i<4;i++){P(shadeC('#6a6070',-i*.18),2,2+i*3,12,3);P('#a8a0b0',2,2+i*3,12,1)}break;
    case 'C':case 'U':ground();P(K,1,4,14,11);P('#8a5a2a',2,5,12,9);P('#a8743a',2,5,12,3);P('#ffd23f',2,8,12,1);P('#ffd23f',7,7,2,3);if(ch==='U'){P(K,1,1,14,4);P('#5a3a1a',2,2,12,2)}break;
    case 's':ins?ground():ground();P(K,3,2,10,14);P('#9a98a8',4,3,8,12);P('#b8b6c4',4,3,8,2);P('#7a7888',4,13,8,2);P(K,6,6,1,2);P(K,9,6,1,2);break;
    case 'x':ground();for(const[a,b]of[[3,3],[11,3],[7,7],[3,11],[11,11]]){x.fillStyle=K;x.beginPath();x.moveTo(a,b-3);x.lineTo(a+3,b+2);x.lineTo(a-3,b+2);x.fill();x.fillStyle='#c8c8d4';x.beginPath();x.moveTo(a,b-2);x.lineTo(a+2,b+1);x.lineTo(a-2,b+1);x.fill()}break;
    case 'h':P('#8a3a2a',0,0,16,16);for(let i=0;i<16;i+=4)P('#a8483a',0,i,16,2);P('#6a2a1e',0,15,16,1);break;
    case 'H':P('#e8d8b8',0,0,16,16);P('#c8b898',0,0,16,1);P('#b8a888',0,15,16,1);if(v%2){P(K,4,4,8,8);P('#ffe68a',5,5,6,6);P(K,8,5,1,6);P(K,5,8,6,1)}break;
    case 'd':P('#e8d8b8',0,0,16,16);P(K,3,2,10,14);P('#7a4a2a',4,3,8,13);P('#ffd23f',10,9,1,2);break;
    case 'F':ground();P(K,0,5,16,3);P('#c8a070',0,6,16,1);P(K,1,3,3,12);P('#c8a070',2,4,1,10);P(K,12,3,3,12);P('#c8a070',13,4,1,10);break;
    case 'n':ground();P(K,7,8,2,8);P('#7a5432',7,9,2,7);P(K,1,2,14,8);P('#c8a070',2,3,12,6);P('#7a5432',4,5,8,1);P('#7a5432',4,7,6,1);break;
    case 'V':case 'J':ground();P(K,3,8,10,8);P('#6a6a74',4,9,8,6);P(K,2,5,12,4);P('#8a8a94',3,6,10,2);if(ch==='J'){x.fillStyle='#ff6a1a';x.beginPath();x.moveTo(8,-1);x.lineTo(12,6);x.lineTo(4,6);x.fill();x.fillStyle='#ffd23f';x.beginPath();x.moveTo(8,2);x.lineTo(10,6);x.lineTo(6,6);x.fill()}break;
    case 'G':P('#3a3048',0,0,16,16);P(K,0,0,16,1);P('#5a4a7a',1,1,14,15);P('#ffd23f',7,2,2,12);P('#ffd23f',4,7,8,2);break;
    case 'D':ground();P('rgba(0,0,0,.25)',0,0,16,16);break;
    case 'Z':wall();P(K,2,1,12,15);P('#7a4a2a',3,2,10,14);P('#5a3a1a',3,8,10,1);D(K,8,7,2.4);D('#ffd23f',8,7,1.6);P(K,7,7,2,4);break;
    case 'Y':wall();P(K,1,1,14,15);for(let i=2;i<14;i+=3)P('#8a8a94',i,2,2,14);P('#5a5a64',1,8,14,2);break;
    case 'X':wall();P(K,1,1,14,15);P('#6a2a6a',2,2,12,14);P('#ff9a3a',2,2,12,1);D(K,8,8,3.2);D('#ff9a3a',8,8,2.2);P(K,7,8,2,5);break;
    case 'W':wall();x.strokeStyle=K;x.lineWidth=1;x.beginPath();x.moveTo(4,2);x.lineTo(8,7);x.lineTo(5,13);x.moveTo(8,7);x.lineTo(13,9);x.stroke();break;
    case 'm':ground();P(K,0,0,16,16);P('#8a8494',1,1,14,14);P('#a8a2b4',1,1,14,2);P('#6a6474',1,13,14,2);P(K,4,4,8,8);P('#9a94a6',5,5,6,6);break;
    case 'q':ins?ground():ground();P(K,1,2,14,13);P('#5a4a3a',2,3,12,11);P('#ffd23f',3,4,10,2);break; /* a shop counter */
    default:ground()}}
/* the parts of a tile that move: water, lava, torches, crystals */
const ANIM=new Set(['w','j','L','I','J']);
/* ---------- Part 2: the valley, the dungeons and what people say ---------- */

/* the overworld: 6 x 6 screens. Each has a look (theme) and a name */
/* everything happens inside the tree. Its hollow is one big open space; the names are what the swallowed call each part */
const OW={w:6,h:6,cells:[
  ['ash','The Rot'],['ash','Rotting Rings'],['plaza','The Heart'],['crag','Upper Galleries'],['crag','Upper Galleries'],['crag',"Hermit's Knot"],
  ['pine','Fungus Hollow'],['pine','Fungus Hollow'],['plaza','Heart Stair'],['crag','Upper Galleries'],['crag','Upper Galleries'],['crag','Upper Galleries'],
  ['wood','The Rootways'],['wood','The Rootways'],['field','Mossfloor'],['field','Mossfloor'],['shore','Mere Shore'],['lake','Hollowmere'],
  ['wood','The Rootways'],['wood','Root Cellar'],['field','Mossfloor'],['river','Old Bridge'],['lake','Hollowmere'],['lake','Knot Isle'],
  ['deep','Deep Roots'],['wood','Rootways Edge'],['meadow','Soft Ground'],['river','Sap Run'],['shore','Mere Shore'],['lake','Hollowmere'],
  ['deep','The Taproot'],['meadow','The Gullet'],['village','The Camp'],['village','The Camp'],['shore',"Ilse's Jetty"],['shore','Mere Shore']]};
/* the ways between screens, written from the west or north screen: o open; the rest are in the way until you can deal with them.
   "in" says which screen the obstacle stands in */
const OWE={
  '0,0,e':'o','2,0,e':{t:'rock',in:'2,0'},'3,0,e':'o','4,0,e':'o',
  '0,1,e':'o','1,1,e':{t:'chasm',in:'2,1'},'2,1,e':{t:'rock',in:'2,1'},'3,1,e':'o','4,1,e':'o',
  '0,2,e':'o','2,2,e':'o','4,2,e':'o',
  '0,3,e':'o','1,3,e':{t:'bush',in:'2,3'},'2,3,e':'o','3,3,e':{t:'bridge',in:'3,3'},'4,3,e':{t:'lakegap',in:'4,3'},
  '0,4,e':{t:'bramble',in:'1,4'},'1,4,e':{t:'bush',in:'2,4'},'2,4,e':'o','4,4,e':'o',
  '1,5,e':'o','2,5,e':'o','4,5,e':'o',
  '0,0,s':'o','0,2,s':'o','0,4,s':'o',
  '1,0,s':'o','1,2,s':'o','1,3,s':'o','1,4,s':{t:'bush',in:'1,5'},
  '2,0,s':'o','2,1,s':'o','2,2,s':'o','2,3,s':'o','2,4,s':'o',
  '3,0,s':'o','3,2,s':'o',
  '4,0,s':'o','4,2,s':'o','4,3,s':'o','4,4,s':'o',
  '5,0,s':'o','5,4,s':'o'};
const owEdge=(x,y,d)=>{let k;if(d==='e')k=x+','+y+',e';else if(d==='s')k=x+','+y+',s';else if(d==='w')k=(x-1)+','+y+',e';else k=x+','+(y-1)+',s';const v=OWE[k];return v?(typeof v==='string'?{t:'o'}:v):null};

/* what stands on each screen */
const FEAT={
  '2,5':[{k:'house',x:1,y:1,to:'maren',door:[2,3]},{k:'sign',x:7,y:8,text:'THE CAMP. Under that, names carved into the wood. Forty-one of them. The newest are still sticky.'},{k:'npc',id:'tobin',x:8,y:4},{k:'npc',id:'bram',x:5,y:2},{k:'npc',id:'twins',x:4,y:8},{k:'flowers',n:6}],
  '3,5':[{k:'house',x:6,y:1,to:'shop',door:[7,3]},{k:'npc',id:'edda',x:3,y:6},{k:'npc',id:'wick',x:9,y:6,if:'wickFound'},{k:'npc',id:'fen',x:1,y:10},{k:'tile',ch:'s',x:9,y:8},{k:'flowers',n:5}],
  '1,5':[{k:'cave',x:5,y:3,to:'barrow'},{k:'sign',x:8,y:5,text:'THE GULLET. Whatever the tree can\'t use rolls down here.'}],
  '2,4':[{k:'npc',id:'oda',x:2,y:6},{k:'sign',x:3,y:3,text:'West: the Gullet and the Rootways. North: the moss. East: the sap run.'}],
  '3,4':[{k:'water',r:[7,0,5,12]},{k:'fill',ch:'.',r:[9,4,2,3]},{k:'tile',ch:'P',x:10,y:6},{k:'tile',ch:'P',x:5,y:5},{k:'pickup',it:'piece',id:'hp_river',x:10,y:5}],
  '1,3':[{k:'dun',x:6,y:3,to:'d1',name:'THORNHOLLOW'}],
  '0,2':[{k:'cave',x:3,y:3,to:'spring'}],
  '3,3':[{k:'sign',x:4,y:8,text:'The bridge went up when the sap rose. The mark that lowers it is on the far bank. So is the bridge.'}],
  '2,1':[{k:'sign',x:7,y:8,text:'THE HEART STAIR. You can hear it from here. Four roots keep it fed.'}],
  '1,2':[{k:'pickup',it:'keep',id:'keep1',x:7,y:7}],'3,2':[{k:'pickup',it:'keep',id:'keep2',x:4,y:8}],
  '3,0':[{k:'tile',ch:'V',x:6,y:6}],'4,1':[{k:'tile',ch:'V',x:5,y:5}],
  '2,0':[{k:'spire'}],
  '1,0':[{k:'dun',x:6,y:3,to:'d3',name:'ASHEN CATACOMBS'}],
  '0,0':[{k:'cave',x:3,y:4,to:'ashhp'}],
  '4,2':[{k:'water',r:[8,6,4,6]},{k:'dun',x:6,y:2,to:'d2',name:'SUNKEN CHAPEL'}],
  '5,2':[{k:'water',r:[0,8,12,4]},{k:'chest',x:9,y:3,loot:'tackle',id:'ow_lake_chest'}],
  '5,3':[{k:'water',r:[0,0,12,12]},{k:'fill',ch:'.',r:[0,4,4,4]},{k:'fill',ch:'_',r:[3,3,6,6]},{k:'tile',ch:'f',x:4,y:4},{k:'tile',ch:'f',x:7,y:7},{k:'pickup',it:'piece',id:'hp_isle',x:6,y:5}],
  '4,3':[],
  '4,4':[{k:'water',r:[8,0,4,3]},{k:'pickup',it:'keep',id:'keep3',x:4,y:6}],
  '5,4':[{k:'water',r:[0,0,12,4]}],
  '5,5':[{k:'water',r:[8,6,4,6]}],
  '4,5':[{k:'water',r:[7,8,5,4]},{k:'npc',id:'ilse',x:6,y:6}],
  '0,5':[{k:'dun',x:5,y:3,to:'d4',name:'THE HOLLOW OAK'}],
  '4,0':[{k:'cave',x:7,y:3,to:'craghp'},{k:'tile',ch:'r',x:7,y:4}],
  '5,0':[{k:'house',x:4,y:2,to:'hermit',door:[5,4]}],
  '5,1':[{k:'chest',x:9,y:8,loot:'shards50',id:'ow_crag_chest'},{k:'tile',ch:'R',x:8,y:8},{k:'tile',ch:'R',x:9,y:7},{k:'tile',ch:'r',x:10,y:8},{k:'tile',ch:'V',x:3,y:6}]};
/* the hermit's three old lamps */
const QLAMP={'3,0':1,'4,1':1,'5,1':1};
/* who lives where outside */
const OWFOES={village:[],meadow:['slime','slime'],field:['slime','spitter','slime'],wood:['slime','bat','spitter'],deep:['husk','spitter','wisp'],pine:['husk','bat','slime'],
  ash:['husk','wisp','bat'],crag:['knight','spinner'],plaza:['knight'],river:['crab','slime'],shore:['crab','slime'],lake:['crab']};
const OWSAFE=new Set(['2,5','3,5','2,0','5,3']);

/* ---------- the dungeons ----------
   grid: one letter per room; doors: [room, room, kind] with kinds o open, L locked, K the boss door, B a cracked wall, S a shutter
   (closed in the first room until its puzzle is done). Rooms: t template, e foes, cond what opens its shutters or its chest,
   loot what its chest holds, hidden: the chest appears when cond is met */
const DUN={
  barrow:{name:'The Gullet',theme:'cave',grid:['V','S'],doors:[['S','V','o']],entry:'S',
    rooms:{S:{t:'entry',e:[]},V:{t:'item',loot:'sword',note:'Scratched into the wood, low down, by someone sitting: "Everything ends up here eventually."'}}},
  d1:{name:'The Root Cellar',theme:'d1',music:'dun',grid:['.KX.','MIE.','BHCW','.S..'],entry:'S',
    doors:[['S','H','o'],['H','B','o'],['H','C','o'],['B','M','o'],['C','W','L'],['H','I','L'],['I','E','o'],['E','X','S'],['I','K','K']],
    rooms:{S:{t:'entry',e:['slime']},H:{t:'pillars',e:['slime','slime','bat']},B:{t:'blocks',v:0,cond:'plate',loot:'key',hidden:1},M:{t:'plain',e:['bat','bat'],loot:'map'},
      C:{t:'crystal',e:['slime'],loot:'key'},W:{t:'maze',e:['spitter','slime'],loot:'piece'},I:{t:'item',e:['husk','husk'],cond:'clear',loot:'sling',hidden:1},
      E:{t:'eye',n:2,e:['bat'],cond:'eye'},X:{t:'crystal',far:1,loot:'big'},K:{t:'boss',boss:'beetle',flame:0}}},
  d2:{name:'The Swallowed Chapel',theme:'d2',music:'dun',grid:['.K..','PQR.','LNOT','.SJ.'],entry:'S',
    doors:[['S','N','o'],['S','J','o'],['N','L','o'],['N','O','o'],['L','P','o'],['O','T','o'],['N','Q','L'],['O','R','L'],['Q','R','o'],['Q','K','K']],
    rooms:{S:{t:'water',e:['crab']},J:{t:'blocks',v:1,cond:'plate',loot:'shards20',hidden:1},N:{t:'water',e:['crab','crab','spitter']},L:{t:'eye',n:1,cond:'eye',loot:'key',hidden:1,e:['spitter']},
      P:{t:'plain',e:['bat','bat'],loot:'map',npc:'scholar'},O:{t:'crystal',far:1,loot:'key',e:['crab']},T:{t:'water',e:['husk','husk','spitter'],loot:'shards50'},
      Q:{t:'item',e:['knight','crab'],cond:'clear',loot:'hook',hidden:1},R:{t:'island',loot:'big',e:['bat']},K:{t:'boss',boss:'bell',flame:1}}},
  d3:{name:'The Rotting Rings',theme:'d3',music:'dun',grid:['..K.','GFED','HABC','.S..'],entry:'S',
    doors:[['S','A','o'],['A','H','o'],['A','B','L'],['A','F','L'],['H','G','o'],['B','C','o'],['C','D','S'],['D','E','o'],['E','F','o'],['E','K','K']],
    rooms:{S:{t:'entry',e:['bat']},A:{t:'pillars',e:['husk','bat','bat'],dark:1},H:{t:'island',loot:'key',e:['bat']},G:{t:'plain',e:['wisp','wisp'],loot:'key',dark:1,npc:'keeper'},
      B:{t:'spikes',e:['knight'],loot:'map'},C:{t:'eye',n:2,cond:'eye',e:['bat','husk'],dark:1},D:{t:'item',e:['wisp','husk'],cond:'clear',loot:'lantern',hidden:1,dark:1},
      E:{t:'torches',n:4,cond:'torches',loot:'big',hidden:1,dark:1,e:['wisp']},F:{t:'torches',n:2,cond:'torches',loot:'piece',hidden:1,dark:1},K:{t:'boss',boss:'moth',flame:2,dark:1}}},
  d4:{name:'The Taproot',theme:'d4',music:'dun',grid:['.K...','IHGF.','JABCE','.S.D.'],entry:'S',
    doors:[['S','A','o'],['A','J','o'],['A','B','o'],['A','H','L'],['B','C','o'],['C','D','o'],['C','E','B'],['B','G','B'],['G','F','L'],['G','H','o'],['H','I','o'],['H','K','K']],
    rooms:{S:{t:'entry',e:['spitter']},A:{t:'pillars',e:['spitter','husk','husk']},J:{t:'torches',n:2,cond:'torches',loot:'key',hidden:1,e:['wisp']},B:{t:'crystal',far:1,loot:'key',e:['husk']},
      C:{t:'item',e:['knight','spinner'],cond:'clear',loot:'bombs',hidden:1},D:{t:'blocks',v:1,cond:'plate',loot:'piece',hidden:1},E:{t:'island',loot:'map',e:['bat']},
      G:{t:'plain',e:['wisp','wisp','ghoul'],loot:'shards20',dark:1},F:{t:'eye',n:1,cond:'eye',loot:'shards50',hidden:1,e:['spitter','spitter']},H:{t:'spikes',e:['knight','husk']},
      I:{t:'torches',n:2,cond:'torches',loot:'big',hidden:1,dark:1,e:['ghoul']},K:{t:'boss',boss:'golem',flame:3}}},
  sp:{name:'The Heart Core',theme:'sp',music:'spire',grid:['.F.','EDC','.B.','.A.','.S.'],entry:'S',
    doors:[['S','A','o'],['A','B','S'],['B','D','S'],['D','E','B'],['D','C','L'],['D','F','K']],
    rooms:{S:{t:'entry',e:[],note:'It does not hate you. It does not know you are here.'},A:{t:'pillars',e:['ghoul','ghoul','knight'],cond:'clear'},B:{t:'torches',n:4,cond:'torches',e:['shade','shade']},
      D:{t:'lava',e:['spinner','shade','shade','ghoul']},E:{t:'island',loot:'key',e:['shade','shade']},C:{t:'eye',n:2,cond:'eye',loot:'big',hidden:1,e:['knight','ghoul']},F:{t:'boss',boss:'hush',flame:-1}}},
  /* single rooms */
  spring:{name:'A clean spring',theme:'cave',grid:['A'],entry:'A',doors:[],rooms:{A:{t:'spring'}}},
  ashhp:{name:'A cold hollow',theme:'cave',grid:['A'],entry:'A',doors:[],rooms:{A:{t:'pillars',e:['wisp','wisp','wisp'],loot:'piece',dark:1}}},
  craghp:{name:'A knot pocket',theme:'cave',grid:['A'],entry:'A',doors:[],rooms:{A:{t:'plain',e:['spinner','bat'],loot:'piece'}}},
  maren:{name:"Maren's workshop",theme:'house',grid:['A'],entry:'A',doors:[],rooms:{A:{t:'house',npc:'maren'}}},
  shop:{name:"Corvo's",theme:'house',grid:['A'],entry:'A',doors:[],rooms:{A:{t:'shop',npc:'corvo'}}},
  hermit:{name:"The hermit's hollow",theme:'house',grid:['A'],entry:'A',doors:[],rooms:{A:{t:'house',npc:'hermit'}}}};
/* where each inside place lets you out */
const EXITS={barrow:[1,5,5,4],d1:[1,3,6,4],d2:[4,2,6,3],d3:[1,0,6,4],d4:[0,5,5,4],sp:[2,0,5,4],spring:[0,2,3,4],ashhp:[0,0,3,5],craghp:[4,0,7,5],maren:[2,5,2,4],shop:[3,5,7,4],hermit:[5,0,5,5]};

/* ---------- things you can find ---------- */
const ITEMS={
  sword:{name:'your sword',icon:'sword',text:'B swings it. Hold B, then let go, for a spin.'},
  sling:{name:'the Sling',icon:'sling',text:'It hits things you can\'t reach: marks, crystals, the eyes of things that wear armour.'},
  hook:{name:'the Hookline',icon:'hook',text:'It catches on posts and pulls you across. It catches on other things too.'},
  lantern:{name:'the Lantern',icon:'lantern',text:'It lights torches and lamps, burns thorns, and keeps a little of the dark off you.'},
  bombs:{name:'Blastcaps',icon:'bombs',text:'Set one down and step back. They open cracked walls and cracked wood.'},
  key:{name:'a small key',icon:'key'},big:{name:'the great key',icon:'big',text:'It opens the door to whatever lives at the bottom.'},map:{name:'the map',icon:'map',text:'START, then SELECT twice, shows it. So does the little screen.'},
  piece:{name:'a piece of heart',icon:'piece'},container:{name:'a heart',icon:'container',text:'You feel a little harder to kill.'},
  tackle:{name:"Ilse's tackle box",icon:'box',text:'Heavier than it looks. She will want it back.'},keep:{name:'a keepsake',icon:'ring'},
  shards20:{name:'20 shards',icon:'shard20'},shards50:{name:'50 shards',icon:'shard20'},seeds:{name:'seeds',icon:'seeds'},bombs5:{name:'5 Blastcaps',icon:'bombs'}};
const USE_ITEMS=['sling','hook','lantern','bombs'];

/* ---------- quests: who gives them, what they ask, what you get ---------- */
const QUESTS=[{id:'main',title:"The Demon's Cores",from:''},{id:'wick',title:'The Horse Thief',from:'Tobin'},{id:'edda',title:'Keepsakes',from:'Edda'},
  {id:'corvo',title:'Goblins',from:'Corvo'},{id:'ilse',title:'Tackle',from:'Ilse'},{id:'hermit',title:'The Old Lamps',from:'The hermit'}];
const ROOTS=['the Root Cellar','the Swallowed Chapel','the Rotting Rings','the Taproot'];
const qs=id=>(S.v.q||(S.v.q={}))[id]||0,qc=id=>(S.v.qc||(S.v.qc={}))[id]||0;
function questText(id){const v=S.v,st=qs(id),f=v.flames.filter(Boolean).length;
  switch(id){
    case 'main':if(v.done)return'Done. Everyone it kept is outside.';if(!v.flags.metMaren)return'Someone called Maren wants to see you. Her workshop is the house on the west side of the camp.';if(!v.items.sword)return'Your sword sank in the mere. Maren thinks it rolled down the Gullet, west of the camp.';
      if(f<4){const n=v.flames.findIndex(x=>!x);return'Destroy the demon\'s four cores ('+f+' of 4). Each is guarded. Maren says the next is in '+ROOTS[n]+'.'}return'The four cores are broken. Climb the Heart Stair, beat what guards the main core, and destroy it.';
    case 'wick':return st===1?'A boy came down the throat just before you and ran off into the roots. Tobin thinks he went toward the Root Cellar.':st===2?'You found Wick. He went back to the camp. Talk to him there.':'Done.';
    case 'edda':return st===1?'Find her husband\'s ring, pipe and knife. The tree dropped them around the hollow ('+qc('edda')+' of 3).':st===2?'You have all three. Take them to Edda in the camp.':'Done.';
    case 'corvo':return st===1?'Kill ten of the goblins that drag people off the path ('+Math.min(10,qc('corvo'))+' of 10).':st===2?'Ten. Go and tell Corvo.':'Done.';
    case 'ilse':return st===1?'Ilse\'s tackle box washed up on the north shore of the mere, past the chapel.':st===2?'You have the tackle box. Take it back to Ilse on her jetty.':'Done.';
    case 'hermit':return st===1?'Light the three old lamps in the Upper Galleries ('+qc('hermit')+' of 3).':st===2?'The lamps are lit. Go back to the hermit.':'Done.'}return''}
function questSet(id,st){const v=S.v;v.q=v.q||{};if((v.q[id]||0)===st)return;const was=v.q[id]||0;v.q[id]=st;const Q=QUESTS.find(q=>q.id===id);
  setTimeout(()=>banner(st===1&&was===0?'NEW QUEST · '+Q.title.toUpperCase():st===99?'QUEST DONE · '+Q.title.toUpperCase():'QUEST · '+Q.title.toUpperCase()),st===1?900:300);S.save()}

/* ---------- what people say. Nobody waits for you to answer ---------- */
function talkLines(id){const v=S.v,f=v.flames.filter(Boolean).length,has=k=>!!v.items[k];
  switch(id){
    case 'maren':
      if(v.done)return['{happy}Daylight on the water again. I\'d forgotten what it does to your scales.'];
      if(!has('sword'))return v.flags.metMaren?['The Gullet is west of the camp. Things that sink end up there. Go and get your sword, knight.']:(v.flags.metMaren=1,['You came down the throat an hour ago. We fished you out of the mere. A dry-skin, in the King\'s colours.','I\'m Maren. I spoke for the Water Kingdom, when there was water. The forests drank our lakes, and then this thing drank us.','Forty-one of us down here now, scales and all. It keeps what it swallows. It just hasn\'t decided what to do with you yet.','You had a sword when you came down. It didn\'t come out of the mere with you. Things that sink roll down into the Gullet, west of here.','Get it back. Then I\'ll tell you how we kill it.']);
      if(f===0)return v.flags.toldD1?['The first core is under the Root Cellar. West, through the Rootways. Cut the fungus on the way.']:(v.flags.toldD1=1,['Good. Now listen, knight.','This demon has four cores. Each one is guarded by something it grew to keep us away from it.','Break all four and the way opens to the main core, the one that keeps it alive. The worst of them guards that one.','Destroy the main core and the tree has to let go of everyone in it.','The first core is under the Root Cellar, through the Rootways west of here. The fungus on the way will need cutting.']);
      if(!v.flames[1])return['One core. The whole floor shook when it broke.','The bridge over the sap run has been up since the sap rose. There\'s a mark on the far bank that drops it, if you can hit it from this side.','The next core is in a chapel the tree swallowed. Half of it is under the mere now.'];
      if(!v.flames[2])return['Two cores. The gap past the Heart Stair can be crossed now, with that line of yours.','The third core is in the Rotting Rings, past the fungus. Take something to see by.'];
      if(!v.flames[3])return['Three. That lantern will burn through the thorns at the edge of the Deep Roots.','The last core is in the Taproot. Everything in the tree drinks from it.'];
      return['All four cores. Listen to it. It isn\'t beating so much as limping.','The way to the main core is open, at the top of the Heart Stair. Whatever guards it will be the worst thing in here. Finish it.'];
    case 'tobin':
      if(v.done)return['{excited}I saw the sky. It\'s bigger than I remembered.'];
      if(qs('wick')===0){questSet('wick',1);return['A boy came down the throat right before you. Older than me. He was crying.','He ran off into the roots, toward the cellar. I didn\'t follow him. I\'m not stupid.']}
      if(qs('wick')===1)return['Did you find him? He went toward the Root Cellar.'];
      if(qs('wick')===2)return['{laugh}That\'s him? He doesn\'t look like a horse thief. He looks wet.'];
      return f<2?['Mum says don\'t go past the moss.','You\'re going past the moss, aren\'t you.']:['You\'re dripping sap on the step.','Ilse says the eels have gone funny. Eels are boring.'];
    case 'wick':
      if(qs('wick')<2){v.flags.wickFound=1;questSet('wick',2);return['...You.','I\'m sorry about your horse. The little seed things said it could be mine if I wanted it. I don\'t know why I listened.','The camp\'s back that way? ...I can find it. I\'ll find it.']}
      if(qs('wick')===2){questSet('wick',99);give('piece',true);return['They fished this out of the mere with me. You should have it. You\'re the one going back in there.','(You got a piece of heart.'+(v.pieces%4===0?' Four pieces make a whole heart.':' '+v.pieces%4+' of 4.')+')']}
      return v.done?['{laugh}Your horse came back on its own. It likes you better. Fair enough.']:['When we get out, your horse will be somewhere in those woods. I\'ll help you look. I owe you that.'];
    case 'edda':
      if(v.done)return['{happy}He\'s talking again. Laughing, even, once. Thank you.'];
      if(qs('edda')===0){questSet('edda',qc('edda')>=3?2:1);return['The tree took our house a piece at a time. The roof one winter. The kitchen the next. Us last.','My husband\'s things are scattered all over in here. His ring, his pipe, his knife.','If you see them, bring them back. He won\'t ask for them. He\'s stopped asking for anything.']}
      if(qs('edda')===1)return['You\'ve found '+qc('edda')+' of the three. The tree drops things wherever it likes. Watch the floor.'];
      if(qs('edda')===2){questSet('edda',99);give('piece',true);return['{surprise}That\'s all of them. ...He smiled. I saw it.','Take this. It was in the kitchen when the kitchen came down here.','(You got a piece of heart.'+(v.pieces%4===0?' Four pieces make a whole heart.':' '+v.pieces%4+' of 4.')+')']}
      return['He sits by the window with the pipe. There\'s no window. He sits there anyway.'];
    case 'corvo':
      if(qs('corvo')===0){questSet('corvo',1);return['Everything\'s for sale. Even down here.','The goblins. The tree keeps them: the seed things walk you off the path, the goblins drag you the rest of the way and the tree does the rest.','Kill ten of them and I\'ll pay you for the trouble.']}
      if(qs('corvo')===1)return['That\'s '+Math.min(10,qc('corvo'))+' of ten. They\'re easy to find. They come looking for you.','Walk up to anything on the counter and press A.'];
      if(qs('corvo')===2){questSet('corvo',99);v.shards=Math.min(999,v.shards+60);return['{laugh}Ten. Good. Sixty shards. Spend them here.']}
      return['Walk up to something and press A. No refunds.'];
    case 'ilse':
      if(qs('ilse')===0){questSet('ilse',v.flags.tackle?2:1);return['I fish the mere. Sap eels, mostly. They taste like a cough.','My tackle box washed up on the north shore, past the chapel. I can\'t get to it through the sap.','Get it for me?']}
      if(qs('ilse')===1)return v.flags.tackle?(questSet('ilse',2),['That\'s it. Hand it over.']):['{laugh}North shore, past the chapel. You can\'t miss it. I did.'];
      if(qs('ilse')===2){questSet('ilse',99);v.cap.seeds+=15;v.ammo.seeds=v.cap.seeds;return['Everything\'s still in it. Even the good hooks.','Take my spare pouch. It holds more seeds than yours.','(You can carry '+v.cap.seeds+' seeds now.)']}
      return f>=2?['The eels have gone quiet. Something\'s wrong with the tree, and they know it.']:['Thanks again. Mind the sap. It\'s deeper than it looks.'];
    case 'hermit':
      if(qs('hermit')===0){questSet('hermit',qc('hermit')>=3?2:1);return['You don\'t talk much. Good.','There are three old lamps out in the galleries. I lit them every night for twenty years. My legs stopped agreeing to it.','Light them. Then come back and give me that sword.']}
      if(qs('hermit')===1)return['That\'s '+qc('hermit')+' lit. I can see them from here, so don\'t bother lying.'];
      if(qs('hermit')===2){questSet('hermit',99);v.sword=2;v.flags.edge=1;return['{angry}Good. Now the sword. ...Who sharpened this, a goat?','{angry}There. It\'ll bite now. Don\'t thank me.','(Your sword hits twice as hard.)']}
      return['Four roots, one heart. People like to think things are complicated.','{angry}Go on. I was enjoying the quiet.'];
    case 'bram':
      if(v.done)return['{happy}Is it morning? It looks like morning. I\'ll sleep the rest of it outside.'];
      return f>=3?['It moves at night now. Turns over, like it can\'t get comfortable. Woke me three times.','Good. Let it lie awake for once.']:f>=1?['Mm. The floor shook. Something of yours?','Do it quieter next time.']:['Mm? Oh. A new one. You still smell of outside. That goes, after a while.','I sleep through the loud parts. The tree turns over at night, you know. Like a big dog.','Wake me when we\'re out. Not before.'];
    case 'oda':
      if(v.done)return['It\'s quiet. I don\'t know what to do with my ears.'];
      return f===0?['Shh.','...It\'s counting. It does that when it\'s hungry.','Your name isn\'t in there yet. Keep it that way.']:f<3?['It felt that. One of its roots went quiet.','{hesitant}It isn\'t angry. I thought it would be angry. It\'s frightened.']:f<4?['It\'s talking to itself now. Mostly about you.']:['Nothing left but the beating. Go on. It\'s waiting for you the way a held breath waits.'];
    case 'fen':
      if(v.done)return['There\'s light everywhere out here. Nobody has to keep it going.'];
      return f>=2?['They stay lit longer now. Something\'s changed in here.','I still go round. In case.']:['I light the lamps so people can find the camp. The tree puts them out. I light them again.','It\'s not a hard job. It just doesn\'t end.'];
    case 'twins':
      if(v.done)return['PELL: We\'re out.','POLL: We\'re out. You can stop saying it.','PELL: We\'re out.'];
      return f>=2?['PELL: The mushrooms are going grey.','POLL: Maren says that\'s good.','{sad}PELL: It doesn\'t look good.','POLL: Things that are good don\'t have to look good.']:['PELL: We were picking mushrooms.','POLL: You were picking mushrooms. I was holding the basket.','PELL: And then the mushrooms picked us.','POLL: Maren says if we wear these, it forgets what we look like.','{laugh}PELL: I think it forgot what it looks like.'];
    case 'scholar':return['Third day. The sap rises when the bell rings. I\'ve stopped ringing it.','It rings anyway.','If you find my notes, burn them. They\'re wrong.'];
    case 'keeper':return['Light keeps them off. Mostly.','I came down here forty years ago looking for my brother. I found the Rings instead.','Don\'t let it keep you.']}
  return['...']}
const INTRO=['Dark, and warm, and it smells of sap.','Cold, webbed hands pull you out of something thick and sticky and lay you down on boards.','"A dry-skin," someone says, wetly. "A knight, by the look of him. Let him sleep. Maren will want him when he wakes."'];
const OUTRO=['The tree goes grey from the inside out.','Its mouth falls open, and the people it kept walk out into the woods, one at a time, blinking.','Your horse is waiting by the path. Wick holds out the reins and doesn\'t say anything. Neither do you.'];
/* ---------- Part 3: building a room from its description ---------- */
const hashN=(...a)=>{let h=2166136261;for(const v of a){h^=v&0xffff;h=Math.imul(h,16777619)}return h>>>0};
const rngOf=seed=>{let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}};
const mkGrid=ch=>Array.from({length:RH},()=>Array(RW).fill(ch));
const inner=(g,ch)=>{for(let j=1;j<RH-1;j++)for(let i=1;i<RW-1;i++)g[j][i]=ch};
const DOORPOS={n:[[5,0],[6,0]],s:[[5,11],[6,11]],w:[[0,5],[0,6]],e:[[11,5],[11,6]]};
const APPROACH={n:[[5,1],[6,1],[5,2],[6,2]],s:[[5,10],[6,10],[5,9],[6,9]],w:[[1,5],[1,6],[2,5],[2,6]],e:[[10,5],[10,6],[9,5],[9,6]]};
const DIRV={n:[0,-1],s:[0,1],w:[-1,0],e:[1,0]},OPP={n:'s',s:'n',e:'w',w:'e'};
/* a place on the edge of a screen: depth inward from edge d, along the edge */
const edgeAt=(d,depth,along)=>d==='e'?[11-depth,along]:d==='w'?[depth,along]:d==='n'?[along,depth]:[along,11-depth];
const roomKey=(map,rx,ry)=>map+':'+rx+','+ry;

/* ---------- outdoors ---------- */
function buildOW(x,y){const[th,name]=OW.cells[y*6+x],T=THEMES[th],R=rngOf(hashN(x,y,1907)),g=mkGrid(T.blk),key=roomKey('ow',x,y);
  const room={map:'ow',rx:x,ry:y,key,theme:th,name,t:g,ents:[],signs:{},warps:{},chests:{},dark:false,outdoors:true,exits:{}};
  inner(g,'.');
  /* the hollow is open: where two parts connect there is no wall between them at all. The outside of the tree is a wall of bark (K) */
  const OPEN={},WORLD={};for(const d of'nesw'){const nx=x+DIRV[d][0],ny=y+DIRV[d][1];WORLD[d]=nx<0||ny<0||nx>=OW.w||ny>=OW.h;const e=WORLD[d]?null:owEdge(x,y,d);OPEN[d]=!!e&&e.t==='o'}
  /* a chasm or a gap in the sap runs right across its side of the screen; the open edges next to it keep their wall that far, so nobody walks round it */
  const LINE={};for(const d of'nesw'){const e=WORLD[d]?null:owEdge(x,y,d);if(e&&['chasm','lakegap','bridge'].includes(e.t)&&e.in===x+','+y)LINE[d]=1}
  const nearLine=(d,al)=>(d==='n'||d==='s')?((LINE.w&&al<=5)||(LINE.e&&al>=6)):((LINE.n&&al<=5)||(LINE.s&&al>=6));
  for(const d of'nesw')for(let al=0;al<12;al++){const[i,j]=edgeAt(d,0,al);if(WORLD[d])g[j][i]='K';else if(OPEN[d]&&al>0&&al<11&&!nearLine(d,al))g[j][i]='.'}
  for(const[cx,cy,a,b]of[[0,0,'n','w'],[11,0,'n','e'],[0,11,'s','w'],[11,11,'s','e']]){if(WORLD[a]||WORLD[b])g[cy][cx]='K';else if(OPEN[a]&&OPEN[b])g[cy][cx]='.'}
  /* a second ring of roots here and there along the closed sides, so they look grown, not drawn */
  for(let j=1;j<RH-1;j++)for(let i=1;i<RW-1;i++){const near=[i===1&&'w',i===RW-2&&'e',j===1&&'n',j===RH-2&&'s'].filter(Boolean);if(!near.length||near.every(d=>OPEN[d]))continue;if(R()<({wood:.6,deep:.7,pine:.5,crag:.5,ash:.45}[th]||.25))g[j][i]=T.blk}
  const dens={village:0,meadow:.05,field:.06,wood:.1,deep:.13,pine:.1,ash:.08,crag:.09,plaza:.02,river:.04,shore:.03,lake:.03}[th]||0;
  const extras={meadow:['T','b','b','f'],field:['b','R','T','b'],wood:['T','T','b'],deep:['T','T','b'],pine:['N','N','R'],ash:['R','R','r'],crag:['R','R','R'],plaza:['s'],river:['T','b'],shore:['b','T'],lake:['b'],village:['f']};
  for(let j=2;j<RH-2;j++)for(let i=2;i<RW-2;i++)if(R()<dens){const pick=extras[th]||['T'];g[j][i]=pick[(R()*pick.length)|0]}
  const path=th==='village'||th==='plaza'?'_':'.';
  const carve=(i,j)=>{if(i>0&&j>0&&i<RW-1&&j<RH-1)g[j][i]=path};
  const toCentre=(i,j)=>{let a=i,b=j;const ci=a<6?5:6,cj=b<6?5:6;while(a!==ci){carve(a,b);carve(a,b+(b<6?1:-1));a+=a<ci?1:-1}while(b!==cj){carve(a,b);carve(a+(a<6?1:-1),b);b+=b<cj?1:-1}carve(a,b)};
  /* the ways out */
  for(const d of'nesw'){const e=owEdge(x,y,d);if(!e)continue;const nx=x+DIRV[d][0],ny=y+DIRV[d][1];if(nx<0||ny<0||nx>=OW.w||ny>=OW.h)continue;room.exits[d]=e;
    for(let al=4;al<=7;al++)for(let dp=0;dp<=1;dp++){const[i,j]=edgeAt(d,dp,al);g[j][i]=path==='_'&&dp===1?'_':'.'}
    const[i,j]=edgeAt(d,2,5);toCentre(i,j);const[i2,j2]=edgeAt(d,2,6);toCentre(i2,j2)}
  /* what stands here */
  const front=[],pk=[];
  for(const f of FEAT[x+','+y]||[]){if(f.if&&!S.v.flags[f.if])continue;
    if(f.k==='house'){for(let i=0;i<4;i++){g[f.y][f.x+i]='h';g[f.y+1][f.x+i]='H';g[f.y+2][f.x+i]='H'}g[f.door[1]][f.door[0]]='d';room.warps[f.door[0]+','+f.door[1]]={to:f.to};front.push([f.door[0],f.door[1]+1])}
    else if(f.k==='cave'||f.k==='dun'){const fr=f.k==='cave'?'R':'s';g[f.y][f.x]='S';g[f.y][f.x-1]=fr;g[f.y][f.x+1]=fr;for(let i=-1;i<=1;i++)g[f.y-1][f.x+i]=f.k==='cave'?'R':'#';room.warps[f.x+','+f.y]={to:f.to,name:f.name};front.push([f.x,f.y+1])}
    else if(f.k==='sign'){g[f.y][f.x]='n';room.signs[f.x+','+f.y]=f.text;front.push([f.x,f.y+1])}
    else if(f.k==='npc'){g[f.y][f.x]='.';room.ents.push({k:'npc',id:f.id,tx:f.x,ty:f.y});front.push([f.x,f.y+1])}
    else if(f.k==='tile'){g[f.y][f.x]=f.ch}
    else if(f.k==='water'||f.k==='fill'){const[a,b,w,h]=f.r;for(let j=b;j<b+h;j++)for(let i=a;i<a+w;i++)if(i>=0&&j>=0&&i<RW&&j<RH)g[j][i]=f.k==='water'?'w':f.ch}
    else if(f.k==='pickup'){if(!S.v.got[f.id]){g[f.y][f.x]='.';room.ents.push({k:'pickup',it:f.it,id:f.id,tx:f.x,ty:f.y});pk.push([f.x,f.y])}}
    else if(f.k==='chest'){g[f.y][f.x]='C';room.chests[f.x+','+f.y]={loot:f.loot,id:f.id};front.push([f.x,f.y+1])}
    else if(f.k==='flowers'){for(let n=0,t=0;n<f.n&&t<60;t++){const i=2+(R()*8|0),j=2+(R()*8|0);if(g[j][i]==='.'){g[j][i]='f';n++}}}
    else if(f.k==='spire'){for(let j=0;j<=2;j++)for(let i=3;i<=8;i++)g[j][i]='#';const lit=S.v.flames.filter(Boolean).length,open=lit>=4;
      g[2][5]=open?'S':'G';g[2][6]=open?'S':'G';if(open){room.warps['5,2']={to:'sp',name:'THE SPIRE'};room.warps['6,2']={to:'sp',name:'THE SPIRE'}}
      [[3,4],[4,4],[7,4],[8,4]].forEach(([i,j],n)=>{g[j][i]=S.v.flames[n]?'J':'V'});for(let j=3;j<=8;j++){carve(5,j);carve(6,j)}front.push([5,3])}}
  for(const[i,j]of front){if(g[j]&&g[j][i]!=null&&!'wSdn'.includes(g[j][i]))g[j][i]=path==='_'?'_':'.';toCentre(i,j)}
  /* make sure every way out and every door can reach the others: a house or a cave mouth may have been set down on a path,
     so find the cheapest way round, cutting only through loose trees, rocks and bushes */
  {const fixed=new Set();for(const f of FEAT[x+','+y]||[]){if(f.k==='tile'||f.k==='chest'||f.k==='sign')fixed.add(f.x+','+f.y);
      if(f.k==='water'||f.k==='fill'){const[a,b,w,h]=f.r;for(let j=b;j<b+h;j++)for(let i=a;i<a+w;i++)fixed.add(i+','+j)}}
    const walkable=c=>'._,fa='.includes(c),soft=(i,j)=>'TNRbf'.includes(g[j][i])&&!fixed.has(i+','+j);
    const anchors=[];for(const d in room.exits){anchors.push(edgeAt(d,1,5))}for(const p2 of front)anchors.push(p2);for(const p2 of pk)anchors.push(p2);
    const ok=a=>a&&g[a[1]]&&walkable(g[a[1]][a[0]]);const first=anchors.find(ok);
    if(first){const region=()=>{const seen=new Set([first.join(',')]),q=[first];while(q.length){const[i,j]=q.shift();for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const u=i+a,v=j+b,k=u+','+v;if(u<1||v<1||u>RW-2||v>RH-2||seen.has(k))continue;if(walkable(g[v][u])){seen.add(k);q.push([u,v])}}}return seen};
      for(const an of anchors){if(!ok(an))continue;const reg=region();if(reg.has(an.join(',')))continue;
        /* cheapest route from this anchor into the region */
        const dist={},prev={},open=[[0,an[0],an[1]]];dist[an.join(',')]=0;let hit=null;
        while(open.length){open.sort((p,q)=>p[0]-q[0]);const[c,i,j]=open.shift();const k=i+','+j;if(c>dist[k])continue;if(reg.has(k)){hit=[i,j];break}
          for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const u=i+a,v=j+b;if(u<1||v<1||u>RW-2||v>RH-2)continue;const ch=g[v][u];const step=walkable(ch)?1:soft(u,v)?6:-1;if(step<0)continue;
            const nk=u+','+v,nc=c+step;if(dist[nk]==null||nc<dist[nk]){dist[nk]=nc;prev[nk]=k;open.push([nc,u,v])}}}
        if(hit){let k=hit.join(',');while(k&&k!==an.join(',')){const[i,j]=k.split(',').map(Number);if(!walkable(g[j][i]))g[j][i]=path;k=prev[k]}}}}}
  /* obstacles on the way out that need something you don't have yet */
  for(const d of'nesw'){const e=room.exits[d];if(!e||e.t==='o'||e.in!==x+','+y)continue;const put=(dp,al,ch)=>{const[i,j]=edgeAt(d,dp,al);g[j][i]=ch};
    if(e.t==='bush'||e.t==='bramble'||e.t==='rock'){const ch=e.t==='bush'?'b':e.t==='bramble'?'B':'r';for(let al=4;al<=7;al++)for(let dp=0;dp<=1;dp++)put(dp,al,ch)}
    else if(e.t==='chasm'||e.t==='lakegap'){const ch=e.t==='chasm'?'p':'w';for(let al=1;al<=10;al++){put(3,al,ch);put(4,al,ch)}for(let al=4;al<=7;al++){put(2,al,'.');put(5,al,'.');put(1,al,'.');put(0,al,'.')}put(1,4,'P');put(6,7,'P');put(5,6,'.');put(5,7,'.')}
    else if(e.t==='bridge'){for(let al=1;al<=10;al++){put(2,al,'w');put(3,al,'w');put(1,al,'.')}const[ei,ej]=edgeAt(d,1,2);g[ej][ei]=S.v.flags.bridge?'E':'e';room.bridgeEdge=d;
      if(S.v.flags.bridge)for(let al=4;al<=7;al++){put(2,al,'=');put(3,al,'=')}}}
  applyOverrides(room);
  if(!OWSAFE.has(x+','+y))for(const k of OWFOES[th]||[])room.ents.push({k:'foe',type:k});
  if(x===2&&y===5&&!S.v.items.sword){}/* the village is quiet */
  return room}

/* ---------- inside: houses, caves and dungeons ---------- */
function buildDun(dk,rx,ry){const D=DUN[dk],id=D.grid[ry][rx],spec=D.rooms[id],th=D.theme,R=rngOf(hashN(rx,ry,dk.charCodeAt(0)*7+dk.length)),g=mkGrid('#'),key=roomKey(dk,rx,ry);
  inner(g,'.');const room={map:dk,rx,ry,key,id,theme:th,name:D.name,t:g,ents:[],signs:{},warps:{},chests:{},doors:{},spec,dark:!!spec.dark,outdoors:false,blocks:[],plates:[],cond:spec.cond||null};
  for(const[a,b,kind]of D.doors){if(a!==id&&b!==id)continue;const other=a===id?b:a,pos=findRoom(D,other);if(!pos)continue;const dx=pos[0]-rx,dy=pos[1]-ry;
    const d=dx===1?'e':dx===-1?'w':dy===1?'s':'n';room.doors[d]={kind,other,dkey:dk+':door:'+[a,b].sort().join(''),shutHere:kind==='S'&&a===id}}
  if(id===D.entry&&!room.doors.s)room.doors.s={kind:'exit'};
  room.solved=!!S.v.solved[key];
  (TPL[spec.t]||TPL.plain)(g,spec,R,room);
  /* the doors themselves */
  for(const d in room.doors){const dr=room.doors[d];let ch='D';
    if(dr.kind==='L')ch=S.v.opened[dr.dkey]?'D':'Z';else if(dr.kind==='K')ch=S.v.opened[dr.dkey]?'D':'X';else if(dr.kind==='B')ch=S.v.opened[dr.dkey]?'D':'W';
    else if(dr.kind==='S'&&dr.shutHere)ch=room.solved?'D':'Y';
    for(const[i,j]of DOORPOS[d])g[j][i]=ch;for(const[i,j]of APPROACH[d].slice(0,2))if(g[j][i]!=='C')g[j][i]='.'}
  /* the chest */
  if(spec.loot){const[cx,cy]=room.chestAt||[6,5];room.chestPos=[cx,cy];room.chests[cx+','+cy]={loot:spec.loot,id:key+':chest'};
    if(!spec.hidden||room.solved||S.v.got[key+':chest'])g[cy][cx]=S.v.got[key+':chest']?'U':'C'}
  if(spec.note){g[1][2]='n';room.signs['2,1']=spec.note}
  if(spec.npc)room.ents.push({k:'npc',id:spec.npc,tx:room.npcAt?room.npcAt[0]:6,ty:room.npcAt?room.npcAt[1]:3});
  /* the boy who took your horse, hiding in the cellar until you find him */
  if(dk==='d1'&&id==='M'&&!S.v.flags.wickFound)room.ents.push({k:'npc',id:'wick',tx:4,ty:6});
  applyOverrides(room);
  if(!(spec.cond==='clear'&&room.solved))for(const k of spec.e||[])room.ents.push({k:'foe',type:k});
  if(dk==='barrow'&&id==='S'&&S.v.items.sword&&!S.v.flags.barrowOut)room.ents.push({k:'foe',type:'slime'},{k:'foe',type:'slime'});
  return room}
const findRoom=(D,id)=>{for(let y=0;y<D.grid.length;y++){const x=D.grid[y].indexOf(id);if(x>=0)return[x,y]}return null};
/* things you have changed stay changed: bombed rock, burned thorns, opened chests */
function applyOverrides(room){const o=S.v.tiles[room.key];if(!o)return;for(const k in o){const[i,j]=k.split(',').map(Number);if(room.t[j])room.t[j][i]=o[k]}}
function setTile(room,i,j,ch,keep){room.t[j][i]=ch;if(keep){(S.v.tiles[room.key]||(S.v.tiles[room.key]={}))[i+','+j]=ch}}

/* ---------- room templates: each lays out the inside of a 12 x 12 room ---------- */
const TPL={
  plain(g,s,R,room){if(R()<.5){g[3][3]='s';g[8][8]='s'}else{g[3][8]='s';g[8][3]='s'}for(let n=0;n<4;n++)g[2+(R()*8|0)][2+(R()*8|0)]=',';room.chestAt=[9,2]},
  entry(g,s,R,room){g[2][2]='s';g[2][9]='s';g[1][1]='I';g[1][10]='I';g[8][2]=',';g[7][9]=',';room.chestAt=[9,9]},
  pillars(g,s,R,room){for(const[i,j]of[[3,3],[8,3],[3,8],[8,8]])g[j][i]='s';room.chestAt=[6,2]},
  item(g,s,R,room){for(const[i,j]of[[4,3],[8,3],[4,7],[8,7]])g[j][i]='s';g[2][6]=',';g[2][5]=',';room.chestAt=[6,4]},
  blocks(g,s,R,room){if(!s.v){g[3][3]='o';room.plates.push([3,3]);if(!room.solved)room.blocks.push([3,7]);g[3][7]='s';g[7][7]='s';room.chestAt=[8,5]}
    else{g[3][8]='o';room.plates.push([8,3]);if(!room.solved)room.blocks.push([5,6]);g[2][3]='s';g[8][3]='s';room.chestAt=[3,4]}
    if(room.solved)room.blocks.push(s.v?[8,3]:[3,3])},
  crystal(g,s,R,room){room.crystal=true;if(s.far){for(const[i,j]of[[1,2],[2,2],[3,2],[1,3],[3,3],[1,4],[2,4],[3,4]])g[j][i]='p';g[3][2]='c'}else g[8][2]='c';
    for(const[i,j]of[[7,2],[8,2],[9,2],[7,3],[9,3],[7,4],[8,4],[9,4]])g[j][i]='O';for(const[i,j]of[[3,7],[4,7],[3,8]])g[j][i]=s.far?'u':'.';room.chestAt=[8,3]},
  eye(g,s,R,room){const eyes=s.n===1?[[3,0]]:[[3,0],[8,0]];for(const[i,j]of eyes){g[j][i]='e';g[1][i]='p';g[2][i]='p'}room.eyes=eyes.length;room.chestAt=[9,8]},
  island(g,s,R,room){for(let j=2;j<=8;j++)for(let i=3;i<=9;i++)g[j][i]='p';for(let j=4;j<=6;j++)for(let i=5;i<=7;i++)g[j][i]='.';g[4][6]='P';g[4][1]='P';room.chestAt=[7,6]},
  torches(g,s,R,room){const at=s.n===4?[[2,2],[9,2],[2,9],[9,9]]:[[3,3],[8,3]];for(const[i,j]of at)g[j][i]=room.solved?'I':'i';room.torches=at.length;room.chestAt=[6,4]},
  spikes(g,s,R,room){for(const[a,b]of[[2,2],[7,2],[2,7],[7,7]])for(let j=b;j<b+3;j++)for(let i=a;i<a+3;i++)g[j][i]='x';room.chestAt=[1,1]},
  maze(g,s,R,room){for(const i of[2,3,4,7,8,9]){g[3][i]='s';g[8][i]='s'}for(let j=4;j<=7;j++){if(j!==5&&j!==6){g[j][3]='b';g[j][8]='b'}else{g[j][3]='b';g[j][8]='b'}}g[5][3]='.';g[6][8]='.';room.chestAt=[9,9]},
  water(g,s,R,room){for(let j=2;j<=9;j++){g[j][3]='w';g[j][8]='w'}for(const j of[5,6]){g[j][3]='=';g[j][8]='='}room.chestAt=[1,9]},
  lava(g,s,R,room){for(let j=2;j<=9;j++){g[j][3]='L';g[j][8]='L'}for(const j of[5,6]){g[j][3]='=';g[j][8]='='}for(let i=4;i<=7;i++){g[2][i]='L';g[9][i]='L'}g[2][5]=g[2][6]='=';g[9][5]=g[9][6]='=';room.chestAt=[1,1]},
  spring(g,s,R,room){for(let j=3;j<=5;j++)for(let i=4;i<=7;i++)g[j][i]='j';g[7][2]='n';room.signs['2,7']='The water is warm. You feel better just standing near it.';room.heal=true;room.doors.s={kind:'exit'}},
  house(g,s,R,room){for(let i=1;i<=10;i++)g[1][i]='#';g[2][2]='q';g[2][3]='q';g[2][8]='q';g[2][9]='q';g[6][2]='s';g[6][9]='s';room.npcAt=[6,4];room.doors.s={kind:'exit'}},
  shop(g,s,R,room){for(let i=3;i<=8;i++)g[3][i]='q';room.npcAt=[6,2];room.doors.s={kind:'exit'};
    const wares=[['piece',150,'hp_shop'],['seedbag',60],['bombbag',80],['tonic',30]];wares.forEach(([it,price,id],n)=>{if(id&&S.v.got[id])return;room.ents.push({k:'ware',it,price,id,tx:2+n*2+(n>1?1:0),ty:7})})},
  boss(g,s,R,room){const b=s.boss;room.bossRoom=true;if(b==='beetle')for(const[i,j]of[[3,3],[8,3],[3,8],[8,8]])g[j][i]='s';
    if(b==='bell'){for(let i=1;i<=10;i++){g[1][i]='w';g[10][i]='w'}for(let j=1;j<=10;j++){g[j][1]='w';g[j][10]='w'}}
    if(b==='moth')for(const[i,j]of[[2,2],[9,2],[2,9],[9,9]])g[j][i]='i';
    if(b==='golem'){g[2][2]=',';g[9][9]=','}
    if(b==='hush'){for(const[i,j]of[[2,3],[9,3],[6,2]])g[j][i]=',';room.dark=true}}};
/* ---------- Part 4: playing ---------- */
const FRESH=()=>({v:1,sound:2,started:0,max:6,hp:6,shards:0,sword:0,items:{},ammo:{seeds:0,bombs:0},cap:{seeds:20,bombs:8},xb:'',yb:'',flames:[0,0,0,0],
  keys:{},big:{},maps:{},opened:{},solved:{},got:{},tiles:{},flags:{},pieces:0,seen:{},at:null,deaths:0,time:0,done:0,savedAt:0,q:{main:1},qc:{}});
/* three save files. File 1 keeps the old save's name, so nothing already played is lost */
const SLOTS=['hollowmere','hollowmere2','hollowmere3'].map(id=>makeSave(id,FRESH));
let SLOT=0;try{SLOT=clamp(+localStorage.getItem('hollowmere-slot')||0,0,2)}catch(e){}
const S={get v(){return SLOTS[SLOT].v},save(){SLOTS[SLOT].save()},flush(){return Promise.all(SLOTS.map(s=>s.flush()))},init(f){SLOTS.forEach(s=>s.init(f))}};
function useSlot(n){const snd=S.v.sound;SLOT=n;S.v.sound=snd;SND.mode=snd;try{localStorage.setItem('hollowmere-slot',n)}catch(e){}}
function eraseSlot(n){const sv=SLOTS[n],snd=sv.v.sound;for(const k of Object.keys(sv.v))delete sv.v[k];Object.assign(sv.v,FRESH());sv.v.sound=snd;sv.save()}
SND.mode=S.v.sound;
const cv=$('#cv'),ctx=cv.getContext('2d'),stage=$('#stage'),dlgEl=$('#dlg'),banEl=$('#banner'),bagEl=$('#bag'),mapEl=$('#mapv');
/* the 3D view is drawn small (about 300 pixels across) and blown up, the way old consoles looked on a television */
let W3=300,H3=330,SNAP=null,RES_BASE=300;
function resize(){const W=innerWidth||300,H=innerHeight||400;stage.style.width=W+'px';stage.style.height=H+'px';stage.style.setProperty('--s',(Math.min(W,H*.95)/192).toFixed(3));
  const k=Math.max(1,Math.min(W,H*1.1)/RES_BASE);W3=Math.max(160,Math.round(W/k));H3=Math.max(140,Math.round(H/k));cv.width=W3;cv.height=H3;ctx.imageSmoothingEnabled=false;
  if(G3.r){glSize();G3.cam.aspect=W3/H3;G3.cam.updateProjectionMatrix()}}

/* ---------- sound ---------- */
const SFX={swing(){SND.noise(.07,{hp:2500,vol:.05})},hit(){SND.tone(220,.08,{type:'square',vol:.07,to:110})},clank(){SND.tone(1400,.06,{vol:.06,type:'square'});SND.tone(900,.08,{vol:.05,at:.03})},
  hurt(){SND.tone(330,.18,{type:'sawtooth',vol:.08,to:120})},die(){SND.tone(200,.5,{type:'triangle',vol:.08,to:60})},cut(){SND.noise(.08,{hp:1800,vol:.06})},
  pick(){SND.tone(990,.05,{vol:.05});SND.tone(1320,.07,{vol:.05,at:.05})},heart(){SND.tone(660,.08,{vol:.06,type:'triangle'});SND.tone(990,.1,{vol:.06,type:'triangle',at:.07})},
  key(){[784,988,1175].forEach((f,i)=>SND.tone(f,.1,{vol:.06,at:i*.07}))},door(){SND.tone(150,.2,{type:'square',vol:.06,to:90})},secret(){[523,622,740,988].forEach((f,i)=>SND.tone(f,.14,{vol:.06,type:'triangle',at:i*.12}))},
  get(){[392,523,659,784,1047].forEach((f,i)=>SND.tone(f,.16,{vol:.07,type:'square',at:i*.1}))},roll(){SND.noise(.12,{lp:900,vol:.05})},seed(){SND.tone(700,.05,{vol:.05,to:400})},
  hook(){SND.tone(500,.08,{vol:.05,type:'square',to:900})},latch(){SND.tone(1200,.05,{vol:.06,type:'square'})},fire(){SND.noise(.25,{lp:1200,vol:.08})},boom(){SND.noise(.5,{lp:500,vol:.2});SND.tone(80,.4,{type:'sawtooth',vol:.08,to:40})},
  fuse(){SND.tone(1800,.02,{vol:.02})},crystal(){SND.tone(1568,.12,{vol:.05,type:'triangle'});SND.tone(2093,.15,{vol:.04,type:'triangle',at:.06})},push(){SND.noise(.1,{lp:400,vol:.06})},
  fall(){SND.tone(600,.5,{vol:.06,type:'triangle',to:100})},text(){SND.tone(880,.015,{vol:.015,type:'square'})},boss(){SND.tone(110,.6,{type:'sawtooth',vol:.08,to:55})},ring(){SND.tone(392,.9,{vol:.07,type:'sine'});SND.tone(588,.9,{vol:.04,type:'sine'})},
  tick(){SND.tone(1200,.03,{vol:.03})},buzz(){SND.tone(150,.1,{type:'square',vol:.04})}};
const SONGS={
  /* slow and low, in minor keys: the inside of the tree is not a happy place */
  field:{bpm:58,ch:[SND.seq('triangle',.045,'A3 - - - - - - - . . . . . . . . C4 - - - B3 - - - - - - - . . . . E3 - - - - - - - . . . . F3 - - - E3 - - - - - - - - - - - . . . .'),
    SND.seq('square',.014,'A1 - - - - - - - - - - - - - - - F1 - - - - - - - - - - - - - - - D1 - - - - - - - - - - - - - - - E1 - - - - - - - - - - - - - - -')]},
  village:{bpm:66,ch:[SND.seq('triangle',.04,'D5 . . . F5 . . . E5 . . . A4 - - - . . . . D5 . . . C5 . . . A4 - - - - - - - . . . . A#4 . . . A4 . . . G4 . . . E4 - - - . . . . F4 . . . E4 . . . D4 - - - - - - - . . . .'),
    SND.seq('square',.013,'D3 - - - - - - - A2 - - - - - - - F2 - - - - - - - A2 - - - - - - - G2 - - - - - - - C3 - - - - - - - A2 - - - - - - - D2 - - - - - - - . . . . . . . . . . . . . . . .')]},
  dun:{bpm:84,ch:[SND.seq('square',.022,'E4 . . . . . G4 . F#4 . . . . . D4 . E4 . . . . . B3 . C4 . . . B3 . . . . . . . . . . . E4 . . . G4 . A4 . B4 - - - A4 . G4 . F#4 - - - - - . .'),
    SND.seq('triangle',.08,'E2 . . . E2 . . . C2 . . . D2 . . . E2 . . . E2 . . . A1 . . . B1 . . .'),SND.seq('drum',.02,'k . . . . . h . . . k . . . h .')]},
  spire:{bpm:76,ch:[SND.seq('triangle',.05,'B4 - - - C5 - - - B4 - - - F#4 - - - G4 - - - A4 - - - F#4 - - - - - - -'),SND.seq('square',.02,'B2 . F#3 . B2 . F#3 . G2 . D3 . G2 . D3 . A2 . E3 . A2 . E3 . F#2 . C#3 . F#2 . C#3 .'),SND.seq('drum',.02,'k . . . . . . . s . . . . . . .')]},
  boss:{bpm:120,ch:[SND.seq('square',.024,'E4 . . . F4 . . . E4 . . . . . . . D#4 . . . E4 . . . F4 . G4 . F4 . . .'),
    SND.seq('sawtooth',.028,'E2 . E2 . E2 . E2 . E2 . E2 . F2 . E2 . D#2 . D#2 . D#2 . D#2 . D#2 . D#2 . E2 . D#2 .'),SND.seq('drum',.03,'k . . . . . . . k . k . . . . .')]},
  end:{bpm:60,ch:[SND.seq('triangle',.045,'A4 - - - C5 - - - E5 - - - D5 - - - C5 - - - - - - - B4 - - - - - - - A4 - - - C5 - - - G5 - - - F5 - - - E5 - - - - - - - - - - - . . . .'),
    SND.seq('square',.015,'A2 - - - - - - - F2 - - - - - - - C3 - - - - - - - G2 - - - - - - - A2 - - - - - - - F2 - - - - - - - C3 - - - - - - - E2 - - - - - - -')]}};
const songFor=r=>r.outdoors?(r.theme==='village'?'village':'field'):r.bossRoom&&!S.v.solved[r.key]?'boss':r.map==='sp'?'spire':(r.theme==='house'||r.map==='spring')?'village':'dun';

/* ---------- the room you are in, and everything moving in it ---------- */
let room=null,E=[],T=0,state='title',trans=null,fade=0,fadeTo=null,shake=0,banT=0,saveT=0;
const P={x:96,y:120,ang:-Math.PI/2,hw:5,hh:4,dir:'up',st:'walk',t:0,inv:0,swing:0,charge:0,spin:0,roll:0,rollCd:0,rvx:0,rvy:0,kx:0,ky:0,kt:0,fall:0,hold:0,holdIt:null,slow:0,anim:0,entry:[96,120],swingHit:null};
function buildRoom(map,rx,ry){return map==='ow'?buildOW(rx,ry):buildDun(map,rx,ry)}
const tileAt=(i,j)=>{if(!room)return'#';i=clamp(i,0,RW-1);j=clamp(j,0,RH-1);return room.t[j][i]};
const PASS=new Set(['.','_','f','a',',','=','o','x','S','d','D']);
function blocked(i,j,who){const c=tileAt(i,j);if(c==='O')return room.crys!==1;if(c==='u')return room.crys===1;if(PASS.has(c))return false;
  if(c==='p'||c==='L')return!(who==='p'||who==='fly'||who==='hook');if(c==='w')return!(who==='fly'||who==='hook');return true}
const projStop=(i,j)=>{const c=tileAt(i,j);if(c==='O')return room.crys!==1;if(c==='u')return room.crys===1;return!(PASS.has(c)||c==='p'||c==='L'||c==='w'||c==='j')};
function boxHits(x,y,hw,hh,who,self){const i0=Math.floor((x-hw)/TS),i1=Math.floor((x+hw-.01)/TS),j0=Math.floor((y-hh)/TS),j1=Math.floor((y+hh-.01)/TS);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){if((i<0||i>=RW||j<0||j>=RH)&&room.outdoors&&who!=='p')return true;if(blocked(i,j,who))return true}
  for(const e of E)if(e!==self&&e.solid&&Math.abs(e.x-x)<e.hw+hw&&Math.abs(e.y-y)<e.hh+hh)return true;return false}
function moveBox(o,dx,dy,who){let moved=false;if(dx){const nx=o.x+dx;if(!boxHits(nx,o.y,o.hw,o.hh,who,o)){o.x=nx;moved=true}else if(o===P&&!dy){for(const s of[3,-3,6,-6])if(!boxHits(nx,o.y+s,o.hw,o.hh,who,o)&&!boxHits(o.x,o.y+Math.sign(s)*.8,o.hw,o.hh,who,o)){o.y+=Math.sign(s)*.8;break}}}
  if(dy){const ny=o.y+dy;if(!boxHits(o.x,ny,o.hw,o.hh,who,o)){o.y=ny;moved=true}else if(o===P&&!dx){for(const s of[3,-3,6,-6])if(!boxHits(o.x+s,ny,o.hw,o.hh,who,o)&&!boxHits(o.x+Math.sign(s)*.8,o.y,o.hw,o.hh,who,o)){o.x+=Math.sign(s)*.8;break}}}return moved}
const overlap=(a,b,pad=0)=>Math.abs(a.x-b.x)<a.hw+b.hw+pad&&Math.abs(a.y-b.y)<a.hh+b.hh+pad;
const tc=v=>Math.floor(v/TS),cen=i=>i*TS+8;
/* you face any way you like; puzzles that need a straight line use the nearest of the four */
let camYaw=-Math.PI/2,lockT=null,camSnap=0,camSnapTo=0,moveV=[0,0];
/* how far behind the hero the camera sits */
const CAM_DIST=2.7;
/* monsters drawn bigger and wider than their old size; and once killed, a monster stays gone for ten real minutes */
const FOE_W=1.32,FOE_H=1.22,RESPAWN_MS=10*60*1000;
const CARD=a=>{const c=Math.cos(a),s=Math.sin(a);return Math.abs(c)>=Math.abs(s)?[c>0?1:-1,0]:[0,s>0?1:-1]};
const facing=()=>CARD(P.ang),fvec=()=>[Math.cos(P.ang),Math.sin(P.ang)];
const angD=(a,b)=>{let d=a-b;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d};
function frontTile(){const[fx,fy]=facing();return[tc(P.x+fx*11),tc(P.y+fy*11)]}
function frontTiles(){const a=frontTile(),[vx,vy]=fvec(),b=[tc(P.x+vx*11),tc(P.y+vy*11)];return a[0]===b[0]&&a[1]===b[1]?[a]:[b,a]}

/* ---------- entering rooms ---------- */
function enterRoom(map,rx,ry,px,py,how){room=buildRoom(map,rx,ry);room.crys=0;room.torchT={};room.eyesHit=0;E=[];P.entry=[px,py];P.x=px;P.y=py;P.st='walk';P.swing=0;P.spin=0;P.roll=0;P.jump=0;P.fall=0;
  room.ents.forEach((s,i)=>spawn(s,i));for(const b of room.blocks||[])E.push(mkBlock(b[0],b[1]));
  if(room.spec&&room.spec.boss&&!S.v.solved[room.key])spawnBoss(room.spec.boss);
  if(room.spec&&room.spec.boss&&S.v.solved[room.key]){if(!S.v.got[room.key+':container'])E.push(mkPickup('container',96,90,0,room.key+':container'));
    const fi=room.spec.flame;if(fi>=0&&!S.v.flames[fi])E.push(mkPickup('flame',96,70,0,'flame'+fi))}
  if(room.heal&&S.v.hp<S.v.max){S.v.hp=S.v.max;SFX.heart()}
  S.v.seen[room.key]=1;S.v.at={map,rx,ry,x:px,y:py};SND.play(SONGS[songFor(room)]);voxEnd();voxWarm(E);
  if(how==='warp'||how==='start'){const nm=room.outdoors?room.name:(DUN[map]?DUN[map].name:'');if(nm)banner(nm)}
  if(how!=='seam'){const a=how==='door'?camSnapTo:how==='start'?-Math.PI/2:(room.outdoors?Math.PI/2:-Math.PI/2);P.ang=a;camYaw=a;G3.snap=true;lockT=null;G3.camDist=CAM_DIST}
  hudText();S.save()}
/* each of a room's monsters has a key (room and its place in the list); killing one writes down the time, and it stays away
   until ten real minutes have passed (the save keeps the times, so it holds across sessions) */
function foeAway(sk){const K=S.v.kills;if(!K||!K[sk])return false;if(Date.now()-K[sk]>=RESPAWN_MS){delete K[sk];return false}return true}
function foeDown(e){if(e.sk==null)return;(S.v.kills||(S.v.kills={}))[e.sk]=Date.now();S.save()}
let respT=0;
function respawnTick(dt){respT-=dt;if(respT>0||!room||!S.v.kills)return;respT=1;if(room.outdoors&&!S.v.items.sword)return;
  room.ents.forEach((s,i)=>{if(s.k!=='foe')return;const sk=room.key+':'+i;if(!S.v.kills[sk]||foeAway(sk)||E.some(f=>f.sk===sk&&!f.dead))return;
    const p=freeSpot();if(!p)return;const f=mkFoe(s.type,p[0],p[1]);f.sk=sk;E.push(f);for(let n=0;n<8;n++)E.push({k:'fx',x:f.x,y:f.y,vx:(rnd()-.5)*70,vy:(rnd()-.5)*70-20,t:.45,c:'#b8a8c8'})})}
function spawn(s,i){if(s.k==='foe'){if(room.outdoors&&!S.v.items.sword)return;const sk=i==null?null:room.key+':'+i;if(sk&&foeAway(sk))return;const p=freeSpot();if(p){const f=mkFoe(s.type,p[0],p[1]);f.sk=sk;E.push(f)}}else if(s.k==='npc'){const C=CHAR[s.id]||CHAR._;E.push({k:'npc',id:s.id,x:cen(s.tx),y:cen(s.ty)+2,hw:C.hw||6,hh:C.hh||5,solid:true})}
  else if(s.k==='pickup')E.push(mkPickup(s.it,cen(s.tx),cen(s.ty),0,s.id));else if(s.k==='ware')E.push({k:'ware',it:s.it,price:s.price,id:s.id,x:cen(s.tx),y:cen(s.ty),hw:6,hh:6,solid:true})}
function freeSpot(){for(let t=0;t<80;t++){const i=1+(rnd()*10|0),j=1+(rnd()*10|0),x=cen(i),y=cen(j);if(blocked(i,j,'e')||'xop'.includes(tileAt(i,j)))continue;if(Math.hypot(x-P.x,y-P.y)<56)continue;
    if(E.some(e=>Math.hypot(e.x-x,e.y-y)<14))continue;return[x,y]}return null}

/* moving off the edge of a room into the next one */
function edgeCheck(){let d=null;if(P.x<1)d='w';else if(P.x>GW-1)d='e';else if(P.y<1)d='n';else if(P.y>RH*TS-1)d='s';if(!d)return;
  const nx=room.rx+DIRV[d][0],ny=room.ry+DIRV[d][1];
  if(room.outdoors){if(nx<0||ny<0||nx>=OW.w||ny>=OW.h||!room.exits[d]){P.x=clamp(P.x,6,GW-6);P.y=clamp(P.y,6,RH*TS-6);return}}
  else{const dr=room.doors&&room.doors[d];if(dr&&dr.kind==='exit'){const ex=EXITS[room.map];if(room.map==='barrow'&&S.v.items.sword)S.v.flags.barrowOut=1;warp('ow',ex[0],ex[1],cen(ex[2]),cen(ex[3])+4);return}
    const D=DUN[room.map];if(!dr||!D.grid[ny]||!D.grid[ny][nx]||D.grid[ny][nx]==='.'){P.x=clamp(P.x,6,GW-6);P.y=clamp(P.y,6,RH*TS-6);return}}
  startScroll(d,nx,ny)}
/* outdoors the valley is one piece: you walk straight into the next screen. Inside, a door fades you through */
function startScroll(d,nx,ny){let px=P.x,py=P.y;for(const e of E)if(e.k==='hookhead'||e.k==='bomb')e.dead=true;if(P.st==='hook')P.st='walk';
  if(room.outdoors){if(d==='w')px=GW-2;if(d==='e')px=2;if(d==='n')py=RH*TS-2;if(d==='s')py=2;const old=room.name;enterRoom(room.map,nx,ny,px,py,'seam');if(room.name!==old)banner(room.name);return}
  if(d==='w')px=GW-14;if(d==='e')px=14;if(d==='n')py=RH*TS-14;if(d==='s')py=14;camSnapTo=Math.atan2(DIRV[d][1],DIRV[d][0]);fadeTo={map:room.map,rx:nx,ry:ny,px,py,how:'door'};fade=0;state='fade'}
function warp(map,rx,ry,px,py){fadeTo={map,rx,ry,px,py};fade=0;state='fade'}
function stepTile(){const i=tc(P.x),j=tc(P.y),c=tileAt(i,j),w=room.warps[i+','+j];
  if(w&&(c==='S'||c==='d')&&Math.abs(P.x-cen(i))<7&&Math.abs(P.y-cen(j))<9){if(w.to==='sp'&&S.v.flames.filter(Boolean).length<4)return;
    const D=DUN[w.to],pos=findRoom(D,D.entry);warp(w.to,pos[0],pos[1],96,RH*TS-26);return true}}

/* ---------- you ---------- */
const AXIS=()=>{let ax=stickX||0,ay=stickY||0;if(Math.hypot(ax,ay)<.22){ax=(held.right?1:0)-(held.left?1:0);ay=(held.down?1:0)-(held.up?1:0)}const l=Math.hypot(ax,ay);return l>1?[ax/l,ay/l]:[ax,ay]};
function setDir(ax,ay){if(Math.abs(ax)>Math.abs(ay)+.05)P.dir=ax>0?'right':'left';else if(Math.abs(ay)>.05)P.dir=ay>0?'down':'up'}
/* HITSTOP: after a solid hit the game holds still for a few hundredths of a second, so the blow lands */
let HITSTOP=0;
function hitFX(x,y,big){HITSTOP=Math.max(HITSTOP,big?.075:.05);spark3D(x,y,big)}
function stepPlayer(dt){P.inv=Math.max(0,P.inv-dt);P.rollCd=Math.max(0,P.rollCd-dt);P.slow=Math.max(0,P.slow-dt);
  if(P.fall>0){P.fall-=dt;if(P.fall<=0){P.x=P.entry[0];P.y=P.entry[1];hurt(2,null,true);P.inv=1.2}return}
  if(P.hold>0){P.hold-=dt;return}
  if(P.kt>0){P.kt-=dt;moveBox(P,P.kx*dt,0,'p');moveBox(P,0,P.ky*dt,'p')}
  if(P.st==='hook')return;
  /* the stick is read against the camera: up is away from it */
  const[ax,ay]=AXIS(),cf=[Math.cos(camYaw),Math.sin(camYaw)],cr=[-Math.sin(camYaw),Math.cos(camYaw)],mx=cf[0]*(-ay)+cr[0]*ax,my=cf[1]*(-ay)+cr[1]*ax;moveV=[mx,my];
  if(lockT&&(lockT.dead||!E.includes(lockT))){lockT=nearFoe();if(lockT)SFX.tick()}else if(lockT&&Math.hypot(lockT.x-P.x,lockT.y-P.y)>170)lockT=null;
  if(P.roll>0){P.roll-=dt;moveBox(P,P.rvx*dt,0,'p');moveBox(P,0,P.rvy*dt,'p');if(P.roll<=0)P.st='walk'}
  else if(P.jump>0){P.jump-=dt;if(P.jump>.06){moveBox(P,P.jvx*dt,0,'p');moveBox(P,0,P.jvy*dt,'p')}if(P.jump<=.1&&!P.jhit){P.jhit=true;leapHit()}if(P.jump<=0){P.jump=0;P.st='walk'}}
  else if(P.swing>0||P.spin>0){if(P.swing>0){P.swing-=dt;swordHits(false)}if(P.spin>0){P.spin-=dt;swordHits(true)}}
  else{const charging=held.b&&P.charge>.15,sp=(charging?42:74)*(P.slow>0?.5:1);if(lockT)P.ang=Math.atan2(lockT.y-P.y,lockT.x-P.x);
    if(Math.hypot(mx,my)>.05){if(!charging&&!lockT)P.ang+=angD(Math.atan2(my,mx),P.ang)*Math.min(1,dt*16);moveBox(P,mx*sp*dt,0,'p');moveBox(P,0,my*sp*dt,'p');P.anim+=dt*(sp/74)*Math.min(1,Math.hypot(mx,my))}
    pushCheck(mx,my,dt)}
  P.dir=({'1,0':'right','-1,0':'left','0,1':'down','0,-1':'up'})[facing().join(',')];
  if(held.b&&P.swing<=0&&P.spin<=0&&S.v.sword&&P.charge>=0)P.charge+=dt;
  /* the ground under you */
  const c=tileAt(tc(P.x),tc(P.y));
  if((c==='p'||c==='L')&&P.st!=='hook'&&!(P.jump>.1)){P.fall=.5;P.roll=0;P.jump=0;P.st='walk';SFX.fall();heroSay('fall');return}
  if(c==='x'&&P.inv<=0)hurt(1,null);
  if(!stepTile())edgeCheck()}
function swordHits(spin){const[fx,fy]=fvec(),dmg=S.v.sword>=2?2:1;
  const box=spin?{x:P.x,y:P.y-2,hw:21,hh:20}:{x:P.x+fx*12,y:P.y-2+fy*12,hw:10,hh:10};if(!P.swingHit)P.swingHit=new Set();
  for(const e of E){if(e.dead||P.swingHit.has(e))continue;if((e.k==='foe'||e.k==='boss'||e.k==='part')&&overlap(box,e,1)){P.swingHit.add(e);hitThing(e,spin?'spin':'sword',spin?dmg*2:dmg,P.x,P.y);hitFX((P.x+e.x)/2,(P.y+e.y)/2,spin)}}
  const i0=tc(box.x-box.hw),i1=tc(box.x+box.hw),j0=tc(box.y-box.hh),j1=tc(box.y+box.hh);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){if(i<0||j<0||i>=RW||j>=RH)continue;const c=room.t[j][i];const k='s'+i+','+j;if(P.swingHit.has(k))continue;
    if(c==='b'){P.swingHit.add(k);setTile(room,i,j,'.');SFX.cut();leaf(cen(i),cen(j));maybeDrop(cen(i),cen(j),.3)}
    else if(c==='c'){P.swingHit.add(k);toggleCrystal()}}}
let pushT=0,pushDir='';
function pushCheck(ax,ay,dt){const l=Math.hypot(ax,ay);if(l<.3){pushT=0;return}const[fx,fy]=Math.abs(ax)>=Math.abs(ay)?[Math.sign(ax),0]:[0,Math.sign(ay)];if(Math.max(Math.abs(ax),Math.abs(ay))/l<.7){pushT=0;return}
  const bx=P.x+fx*(P.hw+3),by=P.y+fy*(P.hh+3);const b=E.find(e=>e.k==='block'&&!e.moving&&Math.abs(e.x-bx)<9&&Math.abs(e.y-by)<9);if(!b){pushT=0;return}
  pushT+=dt;if(pushT<.35)return;pushT=0;
  const ti=b.ti+fx,tj=b.tj+fy,c=tileAt(ti,tj);if(ti<1||tj<1||ti>RW-2||tj>RH-2)return;if(!(PASS.has(c)||c==='p')||'SdD'.includes(c))return;if(E.some(e=>e.k==='block'&&e.ti===ti&&e.tj===tj))return;
  if(E.some(e=>(e.k==='foe'||e.k==='npc')&&Math.abs(e.x-cen(ti))<12&&Math.abs(e.y-cen(tj))<12))return;b.moving={fx,fy,t:0};b.ti=ti;b.tj=tj;SFX.push()}
function hurt(n,from,quiet){if(P.inv>0||P.roll>0||state!=='play'&&!quiet)return;if(P.st==='hook'&&!quiet)return;S.v.hp=Math.max(0,S.v.hp-n);P.inv=1;SFX.hurt();heroSay('hurt');shake=.15;
  if(from){const d=Math.hypot(P.x-from[0],P.y-from[1])||1;P.kx=(P.x-from[0])/d*150;P.ky=(P.y-from[1])/d*150;P.kt=.12}hudText();if(S.v.hp<=0)die()}
function die(){state='dead';SND.stop();SFX.die();heroSay('fall');S.v.deaths++;S.save();
  menu({html:'<h2>YOU FALL</h2><p>The fog closes over you for a moment.</p>',items:[{t:'GET UP',fn:respawn},{t:'SAVE AND QUIT',fn:()=>{S.v.hp=Math.max(6,S.v.max>>1);S.save();title()}}]})}
function respawn(){closeMenu();S.v.hp=Math.max(6,Math.ceil(S.v.max/2/2)*2);state='play';P.inv=1.5;
  if(room.map==='ow')enterRoom('ow',2,5,cen(5),cen(6),'warp');else{const D=DUN[room.map],pos=findRoom(D,D.entry);enterRoom(room.map,pos[0],pos[1],96,RH*TS-26,'warp')}}

/* ---------- the A button: talk, read, open, or swing ---------- */
/* A does what the moment needs: talk, read, open, or roll. B is the sword */
function aTarget(){const[vx,vy]=fvec();const near=E.find(e=>(e.k==='npc'||e.k==='ware')&&Math.abs(e.x-(P.x+vx*12))<13&&Math.abs(e.y-(P.y+vy*12))<(e.k==='npc'&&(CHAR[e.id]||{}).reach||14));if(near)return near;
  for(const[fi,fj]of frontTiles()){const c=tileAt(fi,fj);if(c==='n'&&room.signs[fi+','+fj])return{k:'sign',key:fi+','+fj};if(c==='C'&&room.chests[fi+','+fj])return{k:'chest',i:fi,j:fj}}return null}
function aLabel(){if(state==='dialog')return'NEXT';if(state!=='play')return'';const t=aTarget();if(t)return t.k==='npc'?'TALK':t.k==='ware'?'BUY':t.k==='sign'?'READ':'OPEN';if(canLeap())return'JUMP';return Math.hypot(moveV[0],moveV[1])>.2?'ROLL':''}
function pressA(){if(P.hold>0||P.roll>0||P.fall>0||P.st==='hook'||P.jump>0)return;const t=aTarget();
  if(t){if(t.k==='npc'){t.talkT=3;t.ang=Math.atan2(P.y-t.y,P.x-t.x);t.awake=true;t.wakeT=6;t.walking=false}if(t.k==='npc')say(talkLines(t.id).map(x=>NPCS[t.id].name.toUpperCase()+'\n'+x));else if(t.k==='ware')buyWare(t);else if(t.k==='sign')say([room.signs[t.key]]);else openChest(t.i,t.j);return}
  if(canLeap()){leap();return}
  roll()}
function pressB(){if(P.hold>0||P.roll>0||P.fall>0||P.st==='hook'||!S.v.sword||P.swing>0||P.spin>0||P.jump>0)return;P.swing=.22;P.swingHit=null;P.charge=0;SFX.swing();if(Math.random()<.8)heroSay('swing')}
function releaseB(){if(P.charge>=.7&&S.v.sword&&P.swing<=0&&state==='play'){P.spin=.32;P.swingHit=null;SFX.swing();heroSay('spin');SND.tone(520,.2,{vol:.05,type:'triangle',to:1040})}P.charge=0}
const releaseA=()=>{};
/* A while locked on, standing still or pressing toward your target: a leaping chop that lands for double damage */
function canLeap(){if(!lockT||lockT.dead||!E.includes(lockT)||!S.v.sword||P.swing>0||P.spin>0||P.roll>0||P.jump>0)return false;const dx=lockT.x-P.x,dy=lockT.y-P.y,d=Math.hypot(dx,dy);if(d>96)return false;
  const m=Math.hypot(moveV[0],moveV[1]);return m<.25||(moveV[0]*dx+moveV[1]*dy)/(m*(d||1))>.55}
function leap(){const dx=lockT.x-P.x,dy=lockT.y-P.y,d=Math.hypot(dx,dy)||1,go=clamp(d-15,0,70);P.ang=Math.atan2(dy,dx);P.jump=.44;P.jvx=dx/d*go/.38;P.jvy=dy/d*go/.38;P.jhit=false;P.swingHit=null;P.charge=0;P.st='jump';SFX.roll();heroSay('jump')}
function leapHit(){const[fx,fy]=fvec(),dmg=(S.v.sword>=2?2:1)*2,box={x:P.x+fx*11,y:P.y-2+fy*11,hw:14,hh:14};let hit=null;
  for(const e of E){if(e.dead)continue;if((e.k==='foe'||e.k==='boss'||e.k==='part')&&overlap(box,e,1)){hitThing(e,'sword',dmg,P.x,P.y);hit=e}}
  shake=Math.max(shake,.12);SND.noise(.12,{lp:500,vol:.08});SFX.swing();if(hit)hitFX((P.x+hit.x)/2,(P.y+hit.y)/2,true)}
/* aim: the item swings to the nearest thing worth hitting within a narrow cone in front of you */
function clearLine(x0,y0,x1,y1,ti,tj){const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/4);for(let k=1;k<n;k++){const x=x0+(x1-x0)*k/n,y=y0+(y1-y0)*k/n,i=tc(x),j=tc(y);if(i===ti&&j===tj)return true;if(projStop(i,j))return false}return true}
function aimAt(kind){const range=kind==='hook'?104:200,ox=P.x,oy=P.y-2;if(lockT&&!lockT.dead)return Math.atan2(lockT.y-oy,lockT.x-ox);const cands=[];
  for(const e of E){if(e.dead)continue;if(e.k==='foe'||e.k==='part'||(e.k==='boss'&&e.kind!=='hush'))cands.push([e.x,e.y]);else if(kind==='hook'&&e.k==='pickup')cands.push([e.x,e.y])}
  const hb=E.find(e=>e.k==='boss'&&e.kind==='hush'&&e.phase===1);if(hb&&kind==='sling')for(const m of hb.masks)if(m.gone<=0&&m.x!=null)cands.push([m.x,m.y]);
  for(let j=0;j<RH;j++)for(let i=0;i<RW;i++){const c=room.t[j][i];if(c==='e'||(kind==='sling'&&c==='c')||(kind==='hook'&&(c==='P'||c==='C')))cands.push([cen(i),cen(j),i,j])}
  let best=null,bs=1e9;for(const c of cands){const dx=c[0]-ox,dy=c[1]-oy,d=Math.hypot(dx,dy);if(d<6||d>range)continue;const a=Math.atan2(dy,dx),da=Math.abs(angD(a,P.ang));if(da>.5)continue;if(!clearLine(ox,oy,c[0],c[1],c[2],c[3]))continue;const sc=da*60+d*.2;if(sc<bs){bs=sc;best=a}}
  return best==null?P.ang:best}
/* where the hook sets you down: the free side of the post nearest you */
function landFor(i,j){let best=null,bd=1e9;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const u=i+a,v=j+b;if(u<0||v<0||u>=RW||v>=RH)continue;const c=tileAt(u,v);if(blocked(u,v,'p')||'pLwSdDx'.includes(c))continue;
    if(E.some(e=>e.k==='block'&&e.ti===u&&e.tj===v))continue;const d=Math.hypot(cen(u)-P.x,cen(v)-P.y);if(d<bd){bd=d;best=[cen(u),cen(v)]}}return best}
function openChest(i,j){const ch=room.chests[i+','+j];if(!ch)return;setTile(room,i,j,'U',true);S.v.got[ch.id]=1;give(ch.loot)}
let KEEPID='';
function give(it,quiet){const v=S.v,I=Object.assign({},ITEMS[it]||{name:it});let extra='';
  switch(it){case 'sword':v.items.sword=1;v.sword=Math.max(1,v.sword);extra=' It goes across your back.';break;
    case 'sling':case 'hook':case 'lantern':case 'bombs':v.items[it]=1;if(it==='sling')v.ammo.seeds=v.cap.seeds;if(it==='bombs')v.ammo.bombs=v.cap.bombs;if(!v.xb)v.xb=it;else if(!v.yb)v.yb=it;extra=' It is set to '+(v.xb===it?'X':v.yb===it?'Y':'nothing yet: press START')+'.';break;
    case 'key':v.keys[room.map]=(v.keys[room.map]||0)+1;break;case 'big':v.big[room.map]=1;break;case 'map':v.maps[room.map]=1;break;
    case 'piece':v.pieces++;if(v.pieces%4===0){v.max+=2;v.hp=v.max;extra=' Four pieces make a whole heart.'}else extra=' ('+(v.pieces%4)+' of 4)';break;
    case 'container':v.max+=2;v.hp=v.max;break;
    case 'tackle':v.flags.tackle=1;if(qs('ilse')===1)questSet('ilse',2);break;
    case 'keep':{v.qc=v.qc||{};v.qc.edda=['keep1','keep2','keep3'].filter(k=>v.got[k]).length;I.name=['his ring','his pipe','his knife'][['keep1','keep2','keep3'].indexOf(KEEPID)]||'a keepsake';extra=' Edda\'s husband\'s, by the look of it. ('+v.qc.edda+' of 3)';if(qs('edda')===1&&v.qc.edda>=3)questSet('edda',2);break}
    case 'shards20':v.shards=Math.min(999,v.shards+20);break;case 'shards50':v.shards=Math.min(999,v.shards+50);break;
    case 'seeds':v.ammo.seeds=Math.min(v.cap.seeds,v.ammo.seeds+10);break;case 'bombs5':v.ammo.bombs=Math.min(v.cap.bombs,v.ammo.bombs+5);break}
  hudText();S.save();if(quiet)return;P.hold=1.1;P.holdIt=I.icon||it;SFX.get();heroSay('get',.8);setTimeout(()=>say(['You got '+I.name+'.'+extra+(I.text?'\n'+I.text:'')]),500)}
const WARES={piece:{name:'a piece of heart',icon:'piece'},seedbag:{name:'a bigger seed pouch',icon:'seeds',need:'sling'},bombbag:{name:'a bigger blastcap bag',icon:'bombs',need:'bombs'},tonic:{name:'a red tonic',icon:'heart'}};
function buyWare(w){const W=WARES[w.it];if(W.need&&!S.v.items[W.need]){say(['CORVO\nThat\'s for people with a '+(W.need==='sling'?'sling':'bag of blastcaps')+'. Come back when you are one.']);return}
  if(S.v.shards<w.price){say(['CORVO\n{laugh}'+cap1(W.name)+'. '+w.price+' shards. You have '+S.v.shards+'. I can count, even if you can\'t.']);return}
  say(['CORVO\n'+cap1(W.name)+'. '+w.price+' shards.\nA buys it. B doesn\'t.'],{ask:()=>{S.v.shards-=w.price;SFX.pick();
    if(w.it==='piece'){S.v.got[w.id]=1;w.dead=true;give('piece')}else if(w.it==='seedbag'){S.v.cap.seeds+=15;S.v.ammo.seeds=S.v.cap.seeds;say(['You can carry '+S.v.cap.seeds+' seeds now.'])}
    else if(w.it==='bombbag'){S.v.cap.bombs+=6;S.v.ammo.bombs=S.v.cap.bombs;say(['You can carry '+S.v.cap.bombs+' blastcaps now.'])}else{S.v.hp=S.v.max;SFX.heart();say(['It tastes of iron and pepper. You feel fine.'])}hudText();S.save()}})}
const cap1=s=>s.charAt(0).toUpperCase()+s.slice(1);

/* ---------- X and Y: the things you carry ---------- */
let itemCd=0;
function useItem(it){if(!it||!S.v.items[it]||itemCd>0||P.hold>0||P.fall>0||P.roll>0||P.st==='hook'||P.swing>0)return;itemCd=.25;
  if(it==='sling'){if(S.v.ammo.seeds<=0){SFX.buzz();return}const a=aimAt('sling'),fx=Math.cos(a),fy=Math.sin(a);P.ang=a;S.v.ammo.seeds--;E.push({k:'seed',x:P.x+fx*8,y:P.y-3+fy*8,vx:fx*230,vy:fy*230,hw:2,hh:2,mine:true,t:0});SFX.seed()}
  else if(it==='hook'){if(E.some(e=>e.k==='hookhead'))return;const a=aimAt('hook'),fx=Math.cos(a),fy=Math.sin(a);P.ang=a;E.push({k:'hookhead',x:P.x+fx*6,y:P.y-2+fy*6,fx,fy,d:0,back:false,hw:3,hh:3,grab:null});P.st='hook';SFX.hook()}
  else if(it==='lantern'){itemCd=.4;const[fx,fy]=fvec(),px=P.x+fx*14,py=P.y+fy*14;E.push({k:'puff',x:px,y:py,t:.35,hw:7,hh:7});const done=new Set();
    for(const[i,j]of[[tc(px),tc(py)],...frontTiles()])for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const u=i+a,v=j+b,k=u+','+v;if(done.has(k)||u<0||v<0||u>=RW||v>=RH)continue;done.add(k);const c=tileAt(u,v);if((c==='i'||c==='B'||c==='V')&&Math.hypot(cen(u)-px,cen(v)-py)<17)burnAt(u,v)}
    SFX.fire();for(const e of E)if((e.k==='foe'||e.k==='boss'||e.k==='part')&&Math.abs(e.x-px)<16&&Math.abs(e.y-py)<16)hitThing(e,'fire',e.type==='wisp'?2:1,P.x,P.y)}
  else if(it==='bombs'){if(S.v.ammo.bombs<=0||E.filter(e=>e.k==='bomb').length>=2){SFX.buzz();return}const[fx,fy]=fvec();S.v.ammo.bombs--;E.push({k:'bomb',x:P.x+fx*12,y:P.y+fy*12,t:1.7,hw:5,hh:5});SFX.fuse()}
  hudText()}
function burnAt(i,j){const c=tileAt(i,j);
  if(c==='V'&&room.outdoors&&QLAMP[room.rx+','+room.ry]){setTile(room,i,j,'J',true);SFX.fire();S.v.flags['lamp'+room.rx+room.ry]=1;S.v.qc=S.v.qc||{};S.v.qc.hermit=Object.keys(QLAMP).filter(k=>S.v.flags['lamp'+k.replace(',','')]).length;
    if(qs('hermit')===1&&S.v.qc.hermit>=3)questSet('hermit',2);else if(qs('hermit')===1)setTimeout(()=>banner('A LAMP · '+S.v.qc.hermit+' OF 3'),200)}
  if(c==='i'){setTile(room,i,j,'I');room.torchT[i+','+j]=room.bossRoom?9:0;SFX.fire();checkCond()}
  if(c==='B')igniteBramble(i,j)}
function igniteBramble(i,j){if(tileAt(i,j)!=='B')return;setTile(room,i,j,'.',true);E.push({k:'puff',x:cen(i),y:cen(j),t:.45,hw:7,hh:7,fire:1});SFX.fire();
  for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])setTimeout(()=>{if(room&&tileAt(i+a,j+b)==='B')igniteBramble(i+a,j+b)},180)}
function explode(b){SFX.boom();shake=.3;E.push({k:'blast',x:b.x,y:b.y,t:.4,hw:20,hh:20});const bi=tc(b.x),bj=tc(b.y);
  for(let j=bj-1;j<=bj+1;j++)for(let i=bi-1;i<=bi+1;i++){if(i<0||j<0||i>=RW||j>=RH)continue;const c=room.t[j][i];
    if(c==='r'){setTile(room,i,j,room.outdoors?'.':(INSIDE(room.theme)&&(i===0||j===0||i===RW-1||j===RH-1)?'#':'.'),true);SFX.secret();rubble(cen(i),cen(j))}
    else if(c==='W'){for(const d in room.doors){const dr=room.doors[d];if(dr.kind==='B'&&DOORPOS[d].some(([a,b2])=>a===i&&b2===j)){S.v.opened[dr.dkey]=1;for(const[a,b2]of DOORPOS[d])room.t[b2][a]='D';SFX.secret();rubble(cen(i),cen(j))}}}
    else if(c==='c')toggleCrystal()}
  for(const e of E){if(e.dead)continue;const d=Math.hypot(e.x-b.x,e.y-b.y);if((e.k==='foe'||e.k==='boss'||e.k==='part')&&d<28)hitThing(e,'bomb',2,b.x,b.y)}
  if(Math.hypot(P.x-b.x,P.y-b.y)<20)hurt(2,[b.x,b.y])}
function toggleCrystal(){if(room.crysT>T)return;room.crysT=T+.35;room.crys^=1;SFX.crystal();
  if(room.crys===1){}else{}/* standing on a block that rises? you stay put until you walk off it */}

/* ---------- things that move: projectiles, the hook, bombs, blocks, pickups ---------- */
function mkBlock(i,j){return{k:'block',ti:i,tj:j,x:cen(i),y:cen(j),hw:8,hh:8,solid:true,moving:null}}
function mkPickup(it,x,y,life,id){return{k:'pickup',it,x,y,hw:5,hh:5,life:life||0,id:id||null,t:0}}
function maybeDrop(x,y,p){if(rnd()>p)return;const r=rnd(),v=S.v;let it=r<.38?'heart':r<.72?'shard':r<.82?'shard5':null;
  if(!it&&v.items.sling&&r<.91)it='seeds1';if(!it&&v.items.bombs)it='bombs1';if(!it)it='shard';E.push(mkPickup(it,x,y,9))}
function collect(p){const v=S.v;p.dead=true;switch(p.it){case 'heart':v.hp=Math.min(v.max,v.hp+2);SFX.heart();break;case 'shard':v.shards=Math.min(999,v.shards+1);SFX.pick();break;case 'shard5':v.shards=Math.min(999,v.shards+5);SFX.pick();break;
    case 'seeds1':v.ammo.seeds=Math.min(v.cap.seeds,v.ammo.seeds+5);SFX.pick();break;case 'bombs1':v.ammo.bombs=Math.min(v.cap.bombs,v.ammo.bombs+3);SFX.pick();break;
    case 'piece':v.got[p.id]=1;give('piece');break;case 'keep':v.got[p.id]=1;KEEPID=p.id;give('keep');break;case 'container':v.got[p.id]=1;give('container');break;
    case 'flame':{const fi=room.spec.flame;v.flames[fi]=1;S.save();P.hold=1.6;P.holdIt='flame';SFX.get();const n=v.flames.filter(Boolean).length;
      setTimeout(()=>say(['You break the core of '+ROOTS[fi]+'. It cracks, bleeds sap and goes dark. Far above you, the whole tree flinches.',n<4?(4-n)+(4-n===1?' core left.':' cores left.'):'All four cores. The way to the main core is open.'],{done:()=>{const ex=EXITS[room.map];warp('ow',ex[0],ex[1],cen(ex[2]),cen(ex[3])+4)}}),700);break}}
  hudText()}
function stepThings(dt){respawnTick(dt);for(const e of E){if(e.dead)continue;switch(e.k){
  case 'npc':stepNpc(e,dt);break;
  case 'seed':case 'spit':case 'orb':case 'rock':{e.t+=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;const i=tc(e.x),j=tc(e.y);
    if(e.x<0||e.y<0||e.x>GW||e.y>RH*TS||e.t>3){e.dead=true;break}
    if(e.mine){const c=tileAt(i,j);if(c==='e'){setTile(room,i,j,'E',!!room.outdoors);eyeHit(i,j);e.dead=true;break}if(c==='c'){toggleCrystal();e.dead=true;break}
      if(projStop(i,j)){e.dead=true;break}for(const f of E)if((f.k==='foe'||f.k==='boss'||f.k==='part')&&!f.dead&&overlap(e,f)){hitThing(f,'seed',1,e.x-e.vx*.05,e.y-e.vy*.05,e);e.dead=true;break}}
    else{if(projStop(i,j)&&e.k!=='orb'){e.dead=true;break}if(overlap(e,P)){if(shieldBlocks(e)){e.dead=true;SFX.clank();break}hurt(e.dmg||1,[e.x-e.vx*.1,e.y-e.vy*.1]);e.dead=true}}break}
  case 'hookhead':{const sp=300*dt;if(!e.back){e.x+=e.fx*sp;e.y+=e.fy*sp;e.d+=sp;const i=tc(e.x),j=tc(e.y),c=tileAt(i,j);
      if(c==='P'&&hushPost(i,j)){e.back=true}
      else if(c==='P'||c==='C'||c==='U'){const land=landFor(i,j);if(land){e.latch=[i,j];e.land=land;SFX.latch()}else SFX.clank();e.back=true}
      else if(c==='e'){setTile(room,i,j,'E',!!room.outdoors);eyeHit(i,j);e.back=true}
      else if(projStop(i,j)||e.d>100)e.back=true;
      else{for(const f of E){if(f.dead)continue;if((f.k==='foe'||f.k==='boss'||f.k==='part')&&overlap(e,f,2)){hitThing(f,'hook',1,P.x,P.y,e);e.back=true;break}if(f.k==='pickup'&&!f.id&&overlap(e,f,2)){e.grab=f;e.back=true;break}if(f.k==='pickup'&&f.id&&overlap(e,f,2)){e.grab=f;e.back=true;break}}}}
    else if(e.latch){const[tx,ty]=e.land;const dx=tx-P.x,dy=ty-P.y,d=Math.hypot(dx,dy);P.inv=Math.max(P.inv,.05);
      if(d<4){P.x=tx;P.y=ty;e.dead=true;P.st='walk';P.entry=[P.x,P.y]}else{const s=Math.min(d,280*dt);P.x+=dx/d*s;P.y+=dy/d*s}}
    else{const dx=P.x-e.x,dy=P.y-2-e.y,d=Math.hypot(dx,dy);if(d<8){e.dead=true;P.st='walk';if(e.grab&&!e.grab.dead)collect(e.grab)}else{const s=Math.min(d,340*dt);e.x+=dx/d*s;e.y+=dy/d*s;if(e.grab){e.grab.x=e.x;e.grab.y=e.y}}}break}
  case 'bomb':e.t-=dt;if(Math.floor(e.t*8)!==Math.floor((e.t+dt)*8))SFX.fuse();if(e.t<=0){e.dead=true;explode(e)}break;
  case 'blast':case 'puff':case 'fx':e.t-=dt;if(e.t<=0)e.dead=true;if(e.vx){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=200*dt}break;
  case 'block':if(e.moving){e.moving.t+=dt*5;const tx=cen(e.ti),ty=cen(e.tj);if(e.moving.t>=1){e.x=tx;e.y=ty;e.moving=null;
      if(tileAt(e.ti,e.tj)==='p'){setTile(room,e.ti,e.tj,'.');e.dead=true;SFX.secret()}checkCond()}else{e.x=tx-e.moving.fx*16*(1-e.moving.t);e.y=ty-e.moving.fy*16*(1-e.moving.t)}}break;
  case 'pickup':e.t+=dt;if(e.life&&e.t>e.life){e.dead=true;break}if(overlap(e,P,1)&&P.fall<=0)collect(e);break;
  case 'wave':{e.r+=e.sp*dt;if(e.r>150){e.dead=true;break}const d=Math.hypot(P.x-e.x,P.y-e.y);if(Math.abs(d-e.r)<5)hurt(1,[e.x,e.y]);break}
  case 'shock':{e.t-=dt;if(e.t<=0){e.dead=true;break}if(!e.done&&e.t<e.t0-.05){e.done=true;if(Math.hypot(P.x-e.x,P.y-e.y)<e.r)hurt(e.dmg||2,[e.x,e.y])}break}
  case 'spike':{e.t-=dt;if(e.t<=0){e.dead=true;break}if(e.t<.5&&!e.hit&&Math.abs(P.x-e.x)<9&&Math.abs(P.y-e.y)<9){e.hit=true;hurt(2,[e.x,e.y-10])}break}
  case 'dust':e.t-=dt;if(e.t<=0)e.dead=true;else if(Math.hypot(P.x-e.x,P.y-e.y)<14)P.slow=1;break;
  case 'foe':stepFoe(e,dt);break;case 'boss':stepBoss(e,dt);break;case 'part':stepPart(e,dt);break}}
  E=E.filter(e=>!e.dead)}
/* the hero carries no shield */
const HAS_SHIELD=false;
function shieldBlocks(p){if(!HAS_SHIELD||!S.v.flags.shield||P.swing>0||P.spin>0||P.roll>0||P.st==='hook')return false;const[fx,fy]=fvec();const d=Math.hypot(p.vx,p.vy)||1;return(p.vx/d)*fx+(p.vy/d)*fy<-.6}
function eyeHit(i,j){SFX.secret();if(room.outdoors&&room.bridgeEdge){S.v.flags.bridge=1;const d=room.bridgeEdge;for(let al=4;al<=7;al++)for(const dp of[2,3]){const[a,b]=edgeAt(d,dp,al);setTile(room,a,b,'=',true)}say(['Somewhere across the water, chains run out. The bridge comes down with a sound like a door shutting.']);return}
  room.eyesHit=(room.eyesHit||0)+1;checkCond()}
const leaf=(x,y)=>{for(let n=0;n<6;n++)E.push({k:'fx',x,y,vx:(rnd()-.5)*80,vy:-40-rnd()*40,t:.4,c:'#5ac04a'})};
const rubble=(x,y)=>{for(let n=0;n<10;n++)E.push({k:'fx',x,y,vx:(rnd()-.5)*120,vy:-60-rnd()*50,t:.5,c:'#8a8a94'})};

/* ---------- puzzles: what opens a room ---------- */
function checkCond(){if(!room||room.outdoors||!room.cond||room.solved)return;let ok=false;
  if(room.cond==='clear')ok=!E.some(e=>e.k==='foe'&&!e.dead&&e.type!=='spinner');
  else if(room.cond==='plate')ok=room.plates.every(([i,j])=>E.some(e=>e.k==='block'&&!e.moving&&e.ti===i&&e.tj===j));
  else if(room.cond==='eye')ok=(room.eyesHit||0)>=room.eyes;
  else if(room.cond==='torches')ok=!room.t.some(r=>r.includes('i'));
  if(!ok)return;room.solved=true;S.v.solved[room.key]=1;SFX.secret();
  for(const d in room.doors){const dr=room.doors[d];if(dr.kind==='S'&&dr.shutHere)for(const[i,j]of DOORPOS[d])room.t[j][i]='D'}
  if(room.spec.hidden&&room.chestPos&&!S.v.got[room.key+':chest']){const[i,j]=room.chestPos;room.t[j][i]='C';E.push({k:'fx',x:cen(i),y:cen(j),vx:0,vy:-20,t:.6,c:'#ffd23f'})}S.save()}
/* locked doors open when you walk into them with a key */
function doorCheck(){const[fi,fj]=frontTile(),c=tileAt(fi,fj);if(c!=='Z'&&c!=='X')return;for(const d in room.doors){const dr=room.doors[d];if(!DOORPOS[d].some(([a,b])=>a===fi&&b===fj))continue;
    if(c==='Z'){if((S.v.keys[room.map]||0)<=0){if(!room.keyHint){room.keyHint=1;say(['Locked. You need a small key.'])}return}S.v.keys[room.map]--}
    else{if(!S.v.big[room.map]){if(!room.keyHint){room.keyHint=1;say(['A heavy door with a heavy lock. Something down here has the key.'])}return}}
    S.v.opened[dr.dkey]=1;for(const[a,b]of DOORPOS[d])room.t[b][a]='D';SFX.door();hudText();S.save()}}

/* ---------- foes ---------- */
const FOE={slime:{hp:2,dmg:1,sp:0},bat:{hp:1,dmg:1,fly:1},husk:{hp:4,dmg:2,sp:30},ghoul:{hp:7,dmg:2,sp:46},spitter:{hp:3,dmg:1},knight:{hp:6,dmg:2,sp:26},wisp:{hp:2,dmg:1,sp:22},crab:{hp:3,dmg:1},spinner:{hp:99,dmg:2},moth:{hp:1,dmg:1,fly:1},shade:{hp:2,dmg:1,sp:38,fly:1}};
function mkFoe(type,x,y){const F=FOE[type];return{k:'foe',type,x,y,hw:7,hh:6,hp:F.hp,t:rnd()*2,dir:'down',vx:0,vy:0,stun:0,inv:0,kx:0,ky:0,kt:0,fly:!!F.fly,state:0,an:rnd()*3}}
function stepFoe(e,dt){const F=FOE[e.type],who=e.fly?'fly':'e';e.inv=Math.max(0,e.inv-dt);e.an+=dt;
  if(e.kt>0){e.kt-=dt;moveBox(e,e.kx*dt,0,who);moveBox(e,0,e.ky*dt,who)}
  if(e.stun>0){e.stun-=dt}
  else{const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1;e.t-=dt;
    switch(e.type){
      case 'slime':if(e.t<=0){if(e.state){e.state=0;e.t=.6+rnd()*.6}else{e.state=1;e.t=.35;const a=Math.atan2(dy,dx)+(rnd()-.5)*.8;e.vx=Math.cos(a)*70;e.vy=Math.sin(a)*70}}if(e.state){moveBox(e,e.vx*dt,0,who);moveBox(e,0,e.vy*dt,who)}break;
      case 'bat':case 'moth':{if(e.t<=0){e.t=.5+rnd()*.7;const a=Math.atan2(dy,dx)+(rnd()-.5)*2.2;const sp=e.type==='moth'?95:70;e.vx=Math.cos(a)*sp;e.vy=Math.sin(a)*sp}moveBox(e,e.vx*dt,0,who);moveBox(e,0,e.vy*dt,who);
        e.x=clamp(e.x,12,GW-12);e.y=clamp(e.y,12,RH*TS-12);break}
      case 'husk':case 'ghoul':case 'knight':case 'wisp':case 'shade':{const sp=F.sp*(e.type==='knight'&&d>90?.6:1);if(d<150||e.type==='wisp'||e.type==='shade'){const mvx=dx/d*sp*dt,mvy=dy/d*sp*dt;if(Math.abs(dx)>Math.abs(dy))e.dir=dx>0?'right':'left';else e.dir=dy>0?'down':'up';
          if(!moveBox(e,mvx,0,who))moveBox(e,0,Math.sign(dy||1)*sp*dt,who);moveBox(e,0,mvy,who)}else if(e.t<=0){e.t=1;e.vx=(rnd()-.5)*30;e.vy=(rnd()-.5)*30}else{moveBox(e,e.vx*dt,0,who);moveBox(e,0,e.vy*dt,who)}break}
      case 'spitter':if(e.t<=0){e.t=2.2+rnd()*.6;if(d<130){const s=90;E.push({k:'spit',x:e.x,y:e.y-4,vx:dx/d*s,vy:dy/d*s,hw:2,hh:2,dmg:1,t:0});SND.tone(300,.06,{vol:.04,to:200})}}break;
      case 'crab':if(e.t<=0){e.t=.9+rnd()*.8;e.state^=1;e.vx=(rnd()<.5?-1:1)*(e.state?80:0);e.vy=e.state?(rnd()-.5)*20:0}moveBox(e,e.vx*dt,0,who);moveBox(e,0,e.vy*dt,who);break;
      case 'spinner':if(!e.vx&&!e.vy){const a=(rnd()*4|0)*Math.PI/2+Math.PI/4;e.vx=Math.cos(a)*55;e.vy=Math.sin(a)*55}if(!moveBox(e,e.vx*dt,0,who))e.vx=-e.vx;if(!moveBox(e,0,e.vy*dt,who))e.vy=-e.vy;break}}
  if(overlap(e,P)&&P.fall<=0&&e.stun<=0)hurt(F.dmg,[e.x,e.y])}
function hitThing(e,how,dmg,fx,fy,src){if(e.k==='boss')return bossHit(e,how,dmg,src);if(e.k==='part')return partHit(e,how,dmg,src);if(e.inv>0)return;
  if(e.type==='spinner'){if(how==='bomb'){e.dead=true;foeDown(e);rubble(e.x,e.y);maybeDrop(e.x,e.y,.8);checkCond()}else{SFX.clank();if(how==='sword'||how==='spin')P.kx=(P.x-e.x)*6,P.ky=(P.y-e.y)*6,P.kt=.1}return}
  if(e.type==='knight'&&(how==='sword'||how==='spin')&&e.stun<=0){const fd=DIRV[{up:'n',down:'s',left:'w',right:'e'}[e.dir]];const dx=fx-e.x,dy=fy-e.y,d=Math.hypot(dx,dy)||1;
    if(how==='sword'&&(dx/d)*fd[0]+(dy/d)*fd[1]>.3){SFX.clank();P.kx=dx/d*120;P.ky=dy/d*120;P.kt=.1;e.kx=-dx/d*60;e.ky=-dy/d*60;e.kt=.1;return}}
  if(how==='seed'||how==='hook'){e.stun=Math.max(e.stun,e.type==='knight'?2.2:1.2);if(e.type==='knight'){SFX.clank();return}if(how==='hook'&&e.type!=='bat'&&e.type!=='moth')dmg=0}
  if(dmg<=0)return;e.hp-=dmg;e.inv=.25;SFX.hit();const d=Math.hypot(e.x-fx,e.y-fy)||1;e.kx=(e.x-fx)/d*160;e.ky=(e.y-fy)/d*160;e.kt=.12;
  if(e.hp<=0){e.dead=true;foeDown(e);if(e.type==='slime'&&qs('corvo')===1){S.v.qc.corvo=(S.v.qc.corvo||0)+1;if(S.v.qc.corvo>=10)questSet('corvo',2)}for(let n=0;n<8;n++)E.push({k:'fx',x:e.x,y:e.y,vx:(rnd()-.5)*90,vy:(rnd()-.5)*90-20,t:.4,c:'#e8e8f0'});maybeDrop(e.x,e.y,.45);setTimeout(checkCond,50)}}
/* ---------- Part 5: the five things at the bottom ----------
   Bramble Beetle: armoured. Hit its eye with the Sling when it faces you, or make it charge into something hard; then the sword.
   Bell Warden: rings out waves and sends arms up from the water. Hook it down and hit it while it lies there.
   Moth Queen: in the dark. Light a torch and she goes to it, burns herself, and falls.
   Rot Golem: too thick for the sword. A blastcap at its feet cracks it open; then the sword, on the glowing core.
   The Heart: four pods (only the live one glows in the light: Sling it), a veil held by three posts (Hookline them),
   and two hands (pin each with a blastcap after it slams; then its core is open). */
function spawnBoss(kind){const b={k:'boss',kind,x:96,y:70,hw:12,hh:10,hp:8,t:1.2,st:'intro',dir:'down',inv:0,stun:0,z:0,phase:1,an:0};
  if(kind==='beetle'){b.hw=13;b.hh=10;b.hp=8}
  if(kind==='bell'){b.hp=8;b.z=16;b.y=80}
  if(kind==='moth'){b.hp=8;b.hw=10;b.hh=8;b.z=10;b.spawnT=9}
  if(kind==='golem'){b.hp=9;b.hw=14;b.hh=12;b.y=60}
  if(kind==='hush'){b.hp=3;b.phase=1;b.y=-60;b.hw=2;b.hh=2;b.masks=[0,1,2,3].map(n=>({a:n*Math.PI/2,real:false,gone:0}));b.masks[rnd()*4|0].real=true;b.anchors=0}
  E.push(b);SFX.boss();bannerBoss({beetle:'BRAMBLE BEETLE',bell:'THE BELL WARDEN',moth:'THE MOTH QUEEN',golem:'THE ROT GOLEM',hush:'THE HEART'}[kind])}
const vuln=b=>b.st==='dazed'||b.st==='flipped'||b.st==='down'||b.st==='stunned'||b.st==='cracked'||b.st==='open';
function bossHit(b,how,dmg,src){if(b.inv>0||b.dead)return;
  switch(b.kind){
    case 'beetle':if(how==='seed'&&(b.st==='walk'||b.st==='aim')){const fd=DIRV[{up:'n',down:'s',left:'w',right:'e'}[b.dir]],vl=src?Math.hypot(src.vx,src.vy)||1:1,sv=src?[src.vx/vl,src.vy/vl]:[0,0];
        if(fd[0]*sv[0]+fd[1]*sv[1]<-.5){b.st='flipped';b.t=2.6;b.hits=0;SFX.hit();return}SFX.clank();return}
      if((how==='sword'||how==='spin')&&vuln(b)){bossDamage(b,dmg);return roundHit(b,3)}if(how==='sword'||how==='spin'||how==='seed'){SFX.clank();if(how!=='seed'){P.kx=(P.x-b.x)*5;P.ky=(P.y-b.y)*5;P.kt=.1}}return;
    case 'bell':if(how==='hook'&&b.st!=='down'){b.st='down';b.t=3.2;b.z=0;b.hits=0;SFX.ring();shake=.25;return}if((how==='sword'||how==='spin')&&b.st==='down'){bossDamage(b,dmg);return roundHit(b,3)}if(how!=='fire')SFX.clank();return;
    case 'moth':if(b.st==='stunned'&&(how==='sword'||how==='spin'||how==='seed'||how==='fire')){bossDamage(b,how==='seed'?1:dmg);return roundHit(b,3)}if(how==='fire'){b.st='singed';b.t=.4;return}return;
    case 'golem':if(how==='bomb'&&b.st!=='cracked'){b.st='cracked';b.t=3.6;b.hits=0;SFX.secret();shake=.3;return}if((how==='sword'||how==='spin')&&b.st==='cracked'){b.hits=(b.hits||0)+1;bossDamage(b,dmg);if(b.hits>=3&&!b.dead){b.st='walk';b.t=1}return}SFX.clank();return;
    case 'hush':if(b.phase===3&&b.st==='open'&&(how==='sword'||how==='spin')){bossDamage(b,dmg);if(!b.dead){b.hits=(b.hits||0)+1;if(b.hits>=4)b.openT=0}return}if(b.phase!==1)SFX.clank();return}}
/* after a few hits the boss shakes it off and you have to open it up again */
function roundHit(b,n){if(b.dead)return;b.hits=(b.hits||0)+1;if(b.hits<n)return;b.hits=0;b.t=b.kind==='bell'?1.5:1;b.st='walk';if(b.kind==='bell')b.z=16}
function bossDamage(b,dmg){b.hp-=dmg;b.inv=.3;SFX.hit();shake=.12;for(let n=0;n<6;n++)E.push({k:'fx',x:b.x,y:b.y-b.z,vx:(rnd()-.5)*100,vy:-40-rnd()*60,t:.4,c:'#ffd23f'});
  if(b.kind==='beetle'&&b.hp<=4&&b.phase===1){b.phase=2;for(let n=0;n<2;n++){const p=freeSpot();if(p)E.push(mkFoe('slime',p[0],p[1]))}}
  if((b.kind==='bell'||b.kind==='moth'||b.kind==='golem')&&b.hp<=b.hpMax/2)b.phase=2;
  if(b.hp<=0)bossDown(b)}
function bossDown(b){if(b.kind==='hush'&&b.phase<3)return;b.dead=true;SFX.boom();shake=.5;for(let n=0;n<30;n++)E.push({k:'fx',x:b.x+(rnd()-.5)*30,y:b.y+(rnd()-.5)*30,vx:(rnd()-.5)*140,vy:-30-rnd()*120,t:.8,c:pick(['#ffd23f','#ffffff','#ff6a3a'])});
  for(const e of E)if(e.k==='foe'||e.k==='part'||e.k==='wave'||e.k==='orb'||e.k==='spike'||e.k==='rock'||e.k==='dust')e.dead=true;
  S.v.solved[room.key]=1;S.save();SND.stop();
  if(b.kind==='hush'){setTimeout(ending,1800);return}
  setTimeout(()=>{SFX.secret();E.push(mkPickup('container',96,92,0,room.key+':container'));const fi=room.spec.flame;if(fi>=0)E.push(mkPickup('flame',96,64,0,'flame'+fi));SND.play(SONGS.dun)},1400)}
function stepBoss(b,dt){b.inv=Math.max(0,b.inv-dt);b.an+=dt;b.t-=dt;if(!b.hpMax)b.hpMax=b.hp;const dx=P.x-b.x,dy=P.y-b.y,d=Math.hypot(dx,dy)||1;
  /* never run dry in a fight that needs seeds or blastcaps: if you are low and none are lying about, some turn up */
  b.ammoT=(b.ammoT==null?3:b.ammoT)-dt;if(b.ammoT<=0){b.ammoT=5;const need=(b.kind==='golem'||(b.kind==='hush'&&b.phase===3))?'bombs1':((b.kind==='hush'&&b.phase===1)||b.kind==='beetle')?'seeds1':null;
    const have=need==='bombs1'?S.v.ammo.bombs:need==='seeds1'?S.v.ammo.seeds:99;if(need&&S.v.items[need==='bombs1'?'bombs':'sling']&&have<3&&!E.some(e=>e.k==='pickup'&&e.it===need)){const p=freeSpot();if(p)E.push(mkPickup(need,p[0],p[1],0))}}
  if(b.st==='intro'){if(b.t<=0){b.st=b.kind==='hush'?'masks':'walk';b.t=1}return}
  switch(b.kind){
  case 'beetle':{const sp=b.phase===2?200:155;
    if(b.st==='walk'){if(Math.abs(dx)>Math.abs(dy))b.dir=dx>0?'right':'left';else b.dir=dy>0?'down':'up';moveBox(b,Math.sign(dx)*30*dt,0,'e');moveBox(b,0,Math.sign(dy)*30*dt,'e');
      if(b.t<=0&&(Math.abs(dx)<10||Math.abs(dy)<10)&&d>30){b.st='aim';b.t=b.phase===2?.35:.5;b.cdx=Math.abs(dx)<10?0:Math.sign(dx);b.cdy=Math.abs(dx)<10?Math.sign(dy):0;b.dir=b.cdx>0?'right':b.cdx<0?'left':b.cdy>0?'down':'up'}}
    else if(b.st==='aim'){if(b.t<=0){b.st='charge';b.t=3}}
    else if(b.st==='charge'){const m1=moveBox(b,b.cdx*sp*dt,0,'e'),m2=moveBox(b,0,b.cdy*sp*dt,'e');if((b.cdx&&!m1)||(b.cdy&&!m2)||b.t<=0){b.st='dazed';b.t=1.7;b.hits=0;shake=.25;SFX.boom()}}
    else if(b.st==='dazed'||b.st==='flipped'){if(b.t<=0){b.st='walk';b.t=1}}
    if(!vuln(b)&&overlap(b,P))hurt(b.st==='charge'?2:1,[b.x,b.y]);break}
  case 'bell':{if(b.st==='down'){if(b.t<=0){b.st='walk';b.t=1.5}break}b.z=16+Math.sin(b.an*2)*3;
    if(!b.goal||Math.hypot(b.goal[0]-b.x,b.goal[1]-b.y)<4)b.goal=[48+rnd()*96,48+rnd()*80];const gx=b.goal[0]-b.x,gy=b.goal[1]-b.y,gd=Math.hypot(gx,gy)||1;b.x+=gx/gd*26*dt;b.y+=gy/gd*26*dt;
    if(b.st==='walk'&&b.t<=0){b.st='ring';b.t=.6}
    else if(b.st==='ring'&&b.t<=0){SFX.ring();E.push({k:'wave',x:b.x,y:b.y,r:6,sp:72});if(b.phase===2)setTimeout(()=>{if(!b.dead&&room)E.push({k:'wave',x:b.x,y:b.y,r:6,sp:72})},550);b.st='walk';b.t=b.phase===2?2.4:3.2}
    b.armT=(b.armT||2)-dt;if(b.armT<=0){b.armT=b.phase===2?2:2.8;const sides=[[1+rnd()*10|0,1],[1+rnd()*10|0,10],[1,1+rnd()*10|0],[10,1+rnd()*10|0]],[i,j]=sides[rnd()*4|0];E.push({k:'part',kind:'arm',x:cen(i),y:cen(j),hw:7,hh:7,t:3,hp:2,inv:0})}break}
  case 'moth':{b.spawnT-=dt;if(b.spawnT<=0){b.spawnT=9;if(E.filter(e=>e.type==='moth').length<4)for(let n=0;n<2;n++)E.push(mkFoe('moth',b.x,b.y))}
    const lit=[];for(let j=0;j<RH;j++)for(let i=0;i<RW;i++)if(room.t[j][i]==='I')lit.push([i,j]);
    if(b.st==='stunned'){b.z=0;if(b.t<=0){b.st='walk';b.t=1}break}
    if(b.st==='singed'){b.z=Math.max(0,b.z-60*dt);if(b.t<=0){b.st='stunned';b.t=3.2;b.hits=0;SFX.hit()}break}
    if(lit.length&&b.st!=='drawn'){b.st='drawn';b.t=1.8;b.torch=lit.reduce((a,c)=>Math.hypot(cen(c[0])-b.x,cen(c[1])-b.y)<Math.hypot(cen(a[0])-b.x,cen(a[1])-b.y)?c:a)}
    if(b.st==='drawn'){const tx=cen(b.torch[0])+Math.cos(b.an*6)*12,ty=cen(b.torch[1])+Math.sin(b.an*6)*8,mx=tx-b.x,my=ty-b.y,md=Math.hypot(mx,my)||1;b.x+=mx/md*Math.min(md,110*dt);b.y+=my/md*Math.min(md,110*dt);
      if(tileAt(b.torch[0],b.torch[1])!=='I'){b.st='walk';b.t=1;break}if(b.t<=0){b.st='singed';b.t=.5;setTile(room,b.torch[0],b.torch[1],'i');SFX.fire()}break}
    b.z=10+Math.sin(b.an*5)*3;
    if(b.st==='walk'){if(!b.goal||Math.hypot(b.goal[0]-b.x,b.goal[1]-b.y)<5)b.goal=[30+rnd()*132,30+rnd()*130];const gx=b.goal[0]-b.x,gy=b.goal[1]-b.y,gd=Math.hypot(gx,gy)||1;b.x+=gx/gd*60*dt;b.y+=gy/gd*60*dt;
      b.dustT=(b.dustT||2)-dt;if(b.dustT<=0){b.dustT=2;E.push({k:'dust',x:b.x,y:b.y,t:2.5})}if(b.t<=0){b.st='dive';b.t=.7;b.dvx=dx/d*(b.phase===2?190:160);b.dvy=dy/d*(b.phase===2?190:160)}}
    else if(b.st==='dive'){b.x=clamp(b.x+b.dvx*dt,20,GW-20);b.y=clamp(b.y+b.dvy*dt,20,RH*TS-20);if(overlap(b,P))hurt(1,[b.x,b.y]);if(b.t<=0){b.st='walk';b.t=2+rnd()*1.5}}
    for(const k in room.torchT){if(room.torchT[k]>0){room.torchT[k]-=dt;if(room.torchT[k]<=0){const[i,j]=k.split(',').map(Number);if(tileAt(i,j)==='I')setTile(room,i,j,'i')}}}break}
  case 'golem':{const sp=b.phase===2?28:22;
    if(b.st==='cracked'){if(b.t<=0){b.st='walk';b.t=1}break}
    if(b.st==='walk'){moveBox(b,dx/d*sp*dt,0,'e');moveBox(b,0,dy/d*sp*dt,'e');if(d<40&&b.t<=0){b.st='stomp';b.t=.6}else if(d>70&&b.t<=-2){b.t=0;E.push({k:'rock',x:b.x,y:b.y-14,vx:dx/d*85,vy:dy/d*85,hw:4,hh:4,dmg:2,t:0})}
      if(b.phase===2){b.rootT=(b.rootT||3)-dt;if(b.rootT<=0){b.rootT=3.6;const row=rnd()<.5;for(let n=1;n<=10;n++)E.push({k:'spike',x:row?cen(n):P.x,y:row?P.y:cen(n),t:1.2})}}}
    else if(b.st==='stomp'&&b.t<=0){E.push({k:'shock',x:b.x,y:b.y+6,r:38,t:.35,t0:.35,dmg:2});SFX.boom();shake=.3;b.st='walk';b.t=1.4}
    if(b.st!=='cracked'&&overlap(b,P))hurt(2,[b.x,b.y]);break}
  case 'hush':stepHush(b,dt,dx,dy,d);break}}
function stepHush(b,dt,dx,dy,d){
  if(b.phase===1){b.y=-60;b.x=96;for(const m of b.masks){m.a+=dt*(.7+(3-b.hp)*.25);if(m.gone>0){m.gone-=dt;continue}m.x=96+Math.cos(m.a)*46;m.y=80+Math.sin(m.a)*34}
    b.shotT=(b.shotT||2)-dt;if(b.shotT<=0){b.shotT=2.2;const live=b.masks.filter(m=>m.gone<=0),m=pick(live);if(m){const mx=P.x-m.x,my=P.y-m.y,md=Math.hypot(mx,my)||1;E.push({k:'orb',x:m.x,y:m.y,vx:mx/md*70,vy:my/md*70,hw:3,hh:3,dmg:1,t:0})}}
    for(const e of E){if(e.k!=='seed'||e.dead)continue;for(const m of b.masks){if(m.gone>0)continue;if(Math.abs(e.x-m.x)<9&&Math.abs(e.y-m.y)<9){e.dead=true;
      if(m.real){b.hp--;SFX.hit();shake=.15;for(const n of b.masks){n.real=false}b.masks[rnd()*4|0].real=true;if(b.hp<=0){b.phase=2;b.st='veil';b.y=26;b.hpMax=0;for(const[i,j]of[[2,3],[9,3],[6,2]])room.t[j][i]='P';say(['The pods sink back into the heart and a skin of sap closes over it. Three posts glow where it is tied down.'])}}
      else{m.gone=6;SFX.clank();for(let n=0;n<2;n++)E.push(mkFoe('shade',m.x,m.y))}break}}}}
  else if(b.phase===2){b.x=96+Math.sin(b.an)*20;b.y=26;b.spawnT=(b.spawnT||3)-dt;if(b.spawnT<=0){b.spawnT=4;if(E.filter(e=>e.type==='shade').length<4)E.push(mkFoe('shade',40+rnd()*112,60))}
    const posts=[[2,3],[9,3],[6,2]].filter(([i,j])=>room.t[j][i]==='P').length;if(3-posts>b.anchors){b.anchors=3-posts;SFX.boom();shake=.3}
    if(b.anchors>=3){b.phase=3;b.hp=8;b.hpMax=8;b.hw=16;b.hh=12;b.st='hands';b.y=34;b.hands=[{x:50,y:90,st:'hover',t:1.5,pin:0},{x:142,y:90,st:'hover',t:2.4,pin:0}];say(['The veil tears. Behind it there is less than you expected, and it is very close.'])}}
  else{b.x=96;if(b.st==='open'){b.y=Math.min(60,b.y+40*dt);b.t-=0;b.openT-=dt;if(b.openT<=0){b.st='hands';b.y=34;for(const h of b.hands){h.st='hover';h.t=1.2;h.pin=0}}}
    else b.y=Math.max(34,b.y-40*dt);
    for(const h of b.hands){h.t-=dt;
      if(h.st==='hover'){const tx=P.x,ty=P.y-26;h.x+=(tx-h.x)*Math.min(1,dt*2.2);h.y+=(ty-h.y)*Math.min(1,dt*2.2);if(h.t<=0){h.st='fall';h.t=.25;h.tx=P.x;h.ty=P.y}}
      else if(h.st==='fall'){h.y+=(h.ty-h.y)*Math.min(1,dt*14);if(h.t<=0){h.st='rest';h.t=3.2;SFX.boom();shake=.25;if(Math.hypot(P.x-h.x,P.y-h.y)<16)hurt(2,[h.x,h.y-8])}}
      else if(h.st==='rest'){for(const e of E)if(e.k==='blast'&&!e.counted&&Math.hypot(e.x-h.x,e.y-h.y)<28){e.counted=true;h.st='pinned';h.t=6;SFX.secret()}if(h.st==='rest'&&h.t<=0){h.st='hover';h.t=2+rnd()}}
      else if(h.st==='pinned'){if(h.t<=0&&b.st!=='open'){h.st='hover';h.t=1.5}}}
    if(b.st==='hands'&&b.hands.every(h=>h.st==='pinned')){b.st='open';b.openT=4.5;b.hits=0;SFX.secret()}
    if(b.st==='hands'){b.boltT=(b.boltT||3)-dt;if(b.boltT<=0){b.boltT=3;E.push({k:'orb',x:b.x,y:b.y+10,vx:dx/d*80,vy:dy/d*80,hw:3,hh:3,dmg:2,t:0})}}}}
/* in the last fight, the three glowing posts tear loose instead of pulling you over */
function hushPost(i,j){const b=E.find(e=>e.k==='boss'&&e.kind==='hush');if(!b||b.phase!==2)return false;if(![[2,3],[9,3],[6,2]].some(([a,c])=>a===i&&c===j))return false;
  setTile(room,i,j,',');rubble(cen(i),cen(j));SFX.latch();return true}
function stepPart(e,dt){e.t-=dt;e.inv=Math.max(0,e.inv-dt);if(e.t<=0){e.dead=true;return}if(e.kind==='arm'){const up=e.t<2.6&&e.t>.3;e.up=up;if(up&&Math.hypot(P.x-e.x,P.y-e.y)<14)hurt(1,[e.x,e.y])}}
function partHit(e,how,dmg){if(e.inv>0)return;if(e.kind==='arm'){e.hp-=1;e.inv=.25;SFX.hit();if(e.hp<=0)e.dead=true}}
/* ---------- Part 6: the 3D view ----------
   The game still thinks in flat 16px tiles. This part lifts every room into low-poly 3D: soft 32px textures
   painted in code, vertex colours for baked light, fog, blob shadows, and a camera that follows behind you. */
const TH=window.THREE;
/* the picture: HD draws the 3D view at the screen's own resolution with smoothed edges; RETRO draws it about 320 pixels
   across like a 64-bit console on a television (15-bit colour, an ordered dither, blown up softly); PIXEL draws it small
   with crisp square pixels. Kept per device. */
let PIC='hd';try{const v=localStorage.getItem('hollowmere-pic');PIC=v==='retro'||v==='pixel'?v:v==='sharp'?'pixel':'hd'}catch(e){}
stage.classList.toggle('sharp',PIC==='pixel');RES_BASE=PIC==='retro'?320:300;
/* shadows: a sun that casts soft shadows from everything solid (trees, walls, people, the things you fight). Kept per device */
let SHADOWS=true;try{SHADOWS=localStorage.getItem('hollowmere-shadows')!=='off'}catch(e){}
const SUND=new TH.Vector3(-6,6.5,4).normalize(),_cfw=new TH.Vector3();
/* the words spoken in the scenes */
const subEl=document.createElement('div');subEl.id='sub';subEl.hidden=true;stage.appendChild(subEl);
const col3=(h,m)=>{const n=parseInt(h.slice(1),16),k=(m==null?1:m)/255;return[(n>>16)*k,(n>>8&255)*k,(n&255)*k]};
const mulc=(c,m)=>[c[0]*m,c[1]*m,c[2]*m];
const hrand=(a,b,c)=>(hashN(a+999,b+999,c|0)%10007)/10007;

/* ---------- textures: small, soft and repeated, painted once at load ---------- */
const TEX={};
function paint(name,size,fn,o){o=o||{};const c=mkCanvas(size,size),x=c.getContext('2d');const R=rngOf(hashN(name.length*31,name.charCodeAt(0),name.charCodeAt(name.length-1)));
  /* draw a rectangle four times so it wraps round the edges and the texture tiles without seams */
  const W=(cc,a,b,w,h)=>{x.fillStyle=cc;for(const dx of[0,-size])for(const dy of[0,-size])x.fillRect(a+dx,b+dy,w,h)};
  const Wc=(cc,a,b,r)=>{x.fillStyle=cc;for(const dx of[0,-size,size])for(const dy of[0,-size,size]){x.beginPath();x.arc(a+dx,b+dy,r,0,TAU);x.fill()}};
  fn(x,size,R,W,Wc);const t=new TH.CanvasTexture(c);t.wrapS=t.wrapT=TH.RepeatWrapping;
  if(o.nearest){t.magFilter=t.minFilter=TH.NearestFilter;t.generateMipmaps=false}else{t.magFilter=TH.LinearFilter;t.minFilter=TH.LinearMipmapLinearFilter}
  TEX[name]=t;return t}
const g8=v=>{v=clamp(Math.round(v),0,255);return`rgb(${v},${v},${v})`};
paint('grass',32,(x,s,R,W,Wc)=>{W('#dcdcdc',0,0,s,s);for(let n=0;n<10;n++)Wc('rgba(255,255,255,.18)',R()*s,R()*s,2+R()*4);for(let n=0;n<10;n++)Wc('rgba(0,0,0,.07)',R()*s,R()*s,2+R()*5);
  for(let n=0;n<120;n++){const v=170+R()*85;W(g8(v),R()*s|0,R()*s|0,1,1+(R()*3|0))}});
paint('dirt',32,(x,s,R,W,Wc)=>{W('#d8d4cc',0,0,s,s);for(let n=0;n<14;n++)Wc('rgba(0,0,0,.08)',R()*s,R()*s,2+R()*5);for(let n=0;n<26;n++){const a=R()*s|0,b=R()*s|0;W('#f4f2ee',a,b,2,1);W('#9a968e',a,b+1,2,1)}
  for(let n=0;n<60;n++)W(g8(170+R()*70),R()*s|0,R()*s|0,1,1)});
paint('stone',32,(x,s,R,W)=>{W('#8a8a8a',0,0,s,s);for(let row=0;row<4;row++){const off=row%2?8:0;for(let k=0;k<2;k++){const a=k*16+off,b=row*8;const v=190+R()*50;W(g8(v),a+1,b+1,14,6);W(g8(v+20),a+1,b+1,14,1);W(g8(v-40),a+1,b+6,14,1);
    for(let n=0;n<5;n++)W(g8(v-30+R()*40),a+1+R()*13|0,b+2+R()*4|0,1,1)}}});
paint('flag',32,(x,s,R,W)=>{W('#7a7a7a',0,0,s,s);for(const[a,b]of[[0,0],[16,0],[0,16],[16,16]]){const v=185+R()*55;W(g8(v),a+1,b+1,14,14);W(g8(v+18),a+1,b+1,14,1);W(g8(v-35),a+1,b+14,14,1);
    for(let n=0;n<8;n++)W(g8(v-25+R()*35),a+2+R()*12|0,b+2+R()*12|0,1+(R()*2|0),1);if(R()<.5){let cx=a+3+R()*10,cy=b+3;for(let n=0;n<8;n++){W(g8(v-60),cx|0,cy|0,1,1);cx+=R()*2-1;cy+=1}}}});
paint('wood',32,(x,s,R,W)=>{for(let row=0;row<4;row++){const v=180+R()*50;W(g8(v),0,row*8,s,8);W(g8(v-55),0,row*8+7,s,1);for(let n=0;n<6;n++)W(g8(v-25),R()*s|0,row*8+1+R()*5|0,4+R()*8|0,1);W(g8(v-70),(R()*28|0)+2,row*8+3,1,1)}});
paint('bark',32,(x,s,R,W)=>{W('#b8b8b8',0,0,s,s);for(let n=0;n<16;n++){const a=R()*s|0;W(g8(110+R()*40),a,0,1+(R()*2|0),s)}for(let n=0;n<30;n++)W(g8(200+R()*40),R()*s|0,R()*s|0,1,2+(R()*4|0))});
paint('leaf',32,(x,s,R,W,Wc)=>{W('#b4b4b4',0,0,s,s);for(let n=0;n<40;n++)Wc(g8(120+R()*50),R()*s,R()*s,1.5+R()*2.5);for(let n=0;n<40;n++)Wc(g8(205+R()*50),R()*s,R()*s,1+R()*2)});
paint('roof',32,(x,s,R,W)=>{for(let row=0;row<4;row++){const off=row%2?4:0;W(g8(120),0,row*8,s,8);for(let k=0;k<4;k++){const v=190+R()*50;W(g8(v),k*8+off+1,row*8,7,7);W(g8(v-50),k*8+off+1,row*8+6,7,1)}}});
paint('plaster',32,(x,s,R,W)=>{W('#eeeae2',0,0,s,s);for(let n=0;n<90;n++)W(g8(205+R()*45),R()*s|0,R()*s|0,1,1);for(let n=0;n<3;n++){let a=R()*s,b=R()*s;for(let k=0;k<6;k++){W(g8(170),a|0,b|0,1,1);a+=R()*2-1;b+=1}}});
paint('rock',32,(x,s,R,W,Wc)=>{W('#c4c4c4',0,0,s,s);for(let n=0;n<26;n++)Wc(g8(150+R()*80),R()*s,R()*s,2+R()*5);for(let n=0;n<60;n++)W(g8(120+R()*120),R()*s|0,R()*s|0,1,1)});
paint('crack',32,(x,s,R,W,Wc)=>{W('#c4c4c4',0,0,s,s);for(let n=0;n<20;n++)Wc(g8(150+R()*80),R()*s,R()*s,2+R()*5);for(let k=0;k<4;k++){let a=s/2,b=s/2;const da=R()*2-1,db=R()*2-1;for(let n=0;n<14;n++){W('#262626',a|0,b|0,2,2);a+=da*1.4+R()-.5;b+=db*1.4+R()-.5}}});
paint('thorn',32,(x,s,R,W)=>{W('#8a8a8a',0,0,s,s);for(let n=0;n<34;n++){let a=R()*s,b=R()*s;const da=R()*2-1,db=R()*2-1;for(let k=0;k<8;k++){W(g8(60+R()*40),a|0,b|0,1,1);a+=da;b+=db}W('#f0f0f0',a|0,b|0,1,1)}});
paint('marble',32,(x,s,R,W)=>{W('#e6e2ee',0,0,s,s);for(let k=0;k<5;k++){let a=R()*s,b=0;for(let n=0;n<40;n++){W(g8(150+R()*30),a|0,b|0,1,1);a+=R()*2-1;b+=.8}}for(let n=0;n<40;n++)W(g8(220+R()*30),R()*s|0,R()*s|0,1,1)});
paint('water',32,(x,s,R,W)=>{W('#6a3e12',0,0,s,s);for(let k=0;k<6;k++){const y0=R()*s,ph=R()*TAU,a=1+R()*2;for(let i=0;i<s;i++){const y=y0+Math.sin(i/s*TAU*2+ph)*a;W(k%2?'#9a6424':'#7e4e1a',i,y|0,1,1)}}for(let n=0;n<10;n++)W('#d8b070',R()*s|0,R()*s|0,2,1)});
paint('lava',32,(x,s,R,W,Wc)=>{W('#c8380a',0,0,s,s);for(let n=0;n<14;n++)Wc('#ff8a1a',R()*s,R()*s,2+R()*4);for(let n=0;n<8;n++)Wc('#ffd25a',R()*s,R()*s,1+R()*2);for(let n=0;n<8;n++)Wc('#5a1408',R()*s,R()*s,1.5+R()*2.5)});
paint('pool',32,(x,s,R,W,Wc)=>{W('#5ad8d0',0,0,s,s);for(let n=0;n<12;n++)Wc('#b8fff0',R()*s,R()*s,1+R()*3);for(let n=0;n<8;n++)Wc('#ff9ae8',R()*s,R()*s,1+R()*2)});
paint('metal',32,(x,s,R,W)=>{W('#c8ccd4',0,0,s,s);for(let n=0;n<30;n++)W(g8(150+R()*90),0,R()*s|0,s,1);for(let n=0;n<6;n++)W('#f4f6fa',R()*s|0,R()*s|0,3,1)});
paint('eye',32,(x,s)=>{x.fillStyle='#3a2a2a';x.fillRect(0,0,s,s);x.fillStyle='#f4ead8';x.beginPath();x.ellipse(16,16,14,8,0,0,TAU);x.fill();x.fillStyle='#d83a2a';x.beginPath();x.arc(16,16,6,0,TAU);x.fill();x.fillStyle='#200';x.beginPath();x.arc(16,16,3,0,TAU);x.fill();x.fillStyle='#fff';x.fillRect(18,12,2,2)});
paint('eyeshut',32,(x,s)=>{x.fillStyle='#3a2a2a';x.fillRect(0,0,s,s);x.fillStyle='#ffd23f';x.beginPath();x.ellipse(16,16,14,8,0,0,TAU);x.fill();x.fillStyle='#8a5a10';x.fillRect(3,15,26,2)});
paint('wing',64,(x,s,R)=>{x.fillStyle='#e8dcb0';x.fillRect(0,0,s,s);for(let n=0;n<40;n++){x.fillStyle=`rgba(${120+R()*60|0},${90+R()*40|0},50,.25)`;x.fillRect(R()*s,R()*s,6,2)}x.fillStyle='#6a4a2a';x.beginPath();x.arc(36,30,12,0,TAU);x.fill();x.fillStyle='#ffd23f';x.beginPath();x.arc(36,30,7,0,TAU);x.fill();x.fillStyle='#2a1a0a';x.beginPath();x.arc(36,30,3,0,TAU);x.fill()});

/* ---------- materials ---------- */
const MAT={};
const lam=(k,tex,o)=>MAT[k]=new TH.MeshLambertMaterial(Object.assign({map:tex?TEX[tex]:null,vertexColors:true},o||{}));
['grass','dirt','stone','flag','wood','bark','leaf','roof','plaster','rock','crack','thorn','marble','metal'].forEach(k=>lam(k,k));lam('plain',null);
MAT.glow=new TH.MeshBasicMaterial({vertexColors:true});
/* scenery between the camera and you dissolves in an ordered dither, so trees never hide you */
const FADE={value:3};
function nearFade(m){m.onBeforeCompile=sh=>{sh.uniforms.uFade=FADE;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vCamD;').replace('#include <project_vertex>','#include <project_vertex>\nvCamD=-mvPosition.z;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vCamD;uniform float uFade;\nfloat bay4(vec2 p){vec2 q=mod(floor(p),4.);float a=mod(q.x,2.),b=mod(q.y,2.),c=floor(q.x/2.),d=floor(q.y/2.);return(4.*(2.*a+3.*b-4.*a*b)+(2.*c+3.*d-4.*c*d)+.5)/16.;}')
    .replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(smoothstep(uFade-1.3,uFade,vCamD)<bay4(gl_FragCoord.xy))discard;')};m.customProgramCacheKey=()=>'nearfade'}
['leaf','bark','rock','crack','thorn','stone','plaster','roof'].forEach(k=>nearFade(MAT[k]));MAT.void=new TH.MeshBasicMaterial({color:0x000000,fog:false});
MAT.water=new TH.MeshLambertMaterial({map:TEX.water,transparent:true,opacity:.88,vertexColors:true,depthWrite:false,emissive:0x1a0c02});
MAT.lava=new TH.MeshBasicMaterial({map:TEX.lava,vertexColors:true});MAT.pool=new TH.MeshBasicMaterial({map:TEX.pool,vertexColors:true,transparent:true,opacity:.9});
MAT.eye=new TH.MeshBasicMaterial({map:TEX.eye});MAT.eyeshut=new TH.MeshBasicMaterial({map:TEX.eyeshut});

/* ---------- base shapes, flattened so every face is lit on its own (the faceted look) ---------- */
function fb(geo){const g=geo.index?geo.toNonIndexed():geo;g.computeVertexNormals();const r={p:g.attributes.position.array,n:g.attributes.normal.array,u:g.attributes.uv?g.attributes.uv.array:new Float32Array(g.attributes.position.count*2),geo:g};return r}
const BG={box:fb(new TH.BoxGeometry(1,1,1)),cyl6:fb(new TH.CylinderGeometry(1,1,1,6)),cyl8:fb(new TH.CylinderGeometry(1,1,1,8)),cone7:fb(new TH.ConeGeometry(1,1,7)),cone4:fb(new TH.ConeGeometry(1,1,4)),
  ico:fb(new TH.IcosahedronGeometry(1,0)),ico1:fb(new TH.IcosahedronGeometry(1,1)),dode:fb(new TH.DodecahedronGeometry(1,0)),octa:fb(new TH.OctahedronGeometry(1,0)),tor:fb(new TH.TorusGeometry(1,.22,4,8)),
  taper:fb(new TH.CylinderGeometry(.75,1,1,6)),sph:fb(new TH.SphereGeometry(1,8,6)),hemi:fb(new TH.SphereGeometry(1,8,4,0,TAU,0,Math.PI/2)),halfc:fb(new TH.CylinderGeometry(1,1,1,6,1,false,0,Math.PI))};
const _m4=new TH.Matrix4(),_q=new TH.Quaternion(),_e=new TH.Euler(),_v=new TH.Vector3(),_s=new TH.Vector3();
const M4=(x,y,z,sx,sy,sz,ry,rx,rz)=>{_e.set(rx||0,ry||0,rz||0,'YXZ');_q.setFromEuler(_e);return _m4.clone().compose(_v.set(x,y,z),_q,_s.set(sx,sy==null?sx:sy,sz==null?sx:sz))};

/* ---------- the batcher: thousands of little shapes become one mesh per material ---------- */
class Bat{constructor(){this.g={}}
  a(k){return this.g[k]||(this.g[k]={p:[],n:[],u:[],c:[]})}
  tri(k,A,B,C,ca,cb,cc,ua,ub,uc){const o=this.a(k),ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
    o.p.push(A[0],A[1],A[2],B[0],B[1],B[2],C[0],C[1],C[2]);o.n.push(nx,ny,nz,nx,ny,nz,nx,ny,nz);o.u.push(ua[0],ua[1],ub[0],ub[1],uc[0],uc[1]);o.c.push(ca[0],ca[1],ca[2],cb[0],cb[1],cb[2],cc[0],cc[1],cc[2])}
  quad(k,A,B,C,D,cl,uv){const c=Array.isArray(cl[0])?cl:[cl,cl,cl,cl],u=uv||[[0,0],[1,0],[1,1],[0,1]];this.tri(k,A,B,C,c[0],c[1],c[2],u[0],u[1],u[2]);this.tri(k,A,C,D,c[0],c[2],c[3],u[0],u[2],u[3])}
  /* a shape at a transform; grad darkens its underside so it looks lit from above */
  geom(k,base,m,cl,grad,uvs){const e=m.elements,o=this.a(k),nm=new TH.Matrix3().getNormalMatrix(m).elements,p=base.p,n=base.n;const us=uvs||1;
    for(let i=0;i<p.length;i+=3){const x=p[i],y=p[i+1],z=p[i+2];o.p.push(e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],e[2]*x+e[6]*y+e[10]*z+e[14]);
      const a=n[i],b=n[i+1],c=n[i+2];let nx=nm[0]*a+nm[3]*b+nm[6]*c,ny=nm[1]*a+nm[4]*b+nm[7]*c,nz=nm[2]*a+nm[5]*b+nm[8]*c;const l=Math.hypot(nx,ny,nz)||1;o.n.push(nx/l,ny/l,nz/l);
      const f=grad?(1-grad)+grad*clamp(y+.5,0,1):1;o.c.push(cl[0]*f,cl[1]*f,cl[2]*f)}
    for(let i=0;i<base.u.length;i++)o.u.push(base.u[i]*us)}
  /* an axis-aligned box with world-scaled texture coordinates; skip lists faces to leave out */
  box(k,x0,y0,z0,x1,y1,z1,cl,skip,top){skip=skip||'';const ct=top||cl,cb=mulc(cl,.62);
    if(!skip.includes('t'))this.quad(k,[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],ct,[[x0,z0],[x0,z1],[x1,z1],[x1,z0]]);
    if(!skip.includes('n'))this.quad(k,[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[cb,cb,cl,cl],[[-x1,y0],[-x0,y0],[-x0,y1],[-x1,y1]]);
    if(!skip.includes('s'))this.quad(k,[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[cb,cb,cl,cl],[[x0,y0],[x1,y0],[x1,y1],[x0,y1]]);
    if(!skip.includes('w'))this.quad(k,[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[cb,cb,cl,cl],[[z0,y0],[z1,y0],[z1,y1],[z0,y1]]);
    if(!skip.includes('e'))this.quad(k,[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[cb,cb,cl,cl],[[-z1,y0],[-z0,y0],[-z0,y1],[-z1,y1]]);
    if(skip.includes('B'))return;if(!skip.includes('b'))this.quad(k,[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],cb,[[x0,z0],[x1,z0],[x1,z1],[x0,z1]])}
  build(){const grp=new TH.Group();for(const k in this.g){const o=this.g[k];if(!o.p.length)continue;const b=new TH.BufferGeometry();b.setAttribute('position',new TH.Float32BufferAttribute(o.p,3));b.setAttribute('normal',new TH.Float32BufferAttribute(o.n,3));
      b.setAttribute('uv',new TH.Float32BufferAttribute(o.u,2));b.setAttribute('color',new TH.Float32BufferAttribute(o.c,3));b.computeBoundingSphere();const m=new TH.Mesh(b,MAT[k]);if(k==='water'||k==='pool')m.renderOrder=2;grp.add(m)}return grp}}

/* ---------- the ground outdoors rolls a little; the game underneath stays flat ---------- */
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),u0=x-xi,v0=y-yi,h=(a,b)=>(hashN(a+700,b+700,77)%1000)/1000,s=t=>t*t*(3-2*t),a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1),u=s(u0),v=s(v0);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const AMP={village:.35,meadow:.9,field:1,wood:1.1,deep:1.3,pine:1.2,ash:1.1,crag:1.6,plaza:.15,river:.55,shore:.4,lake:.35};
function heights(r){const hc=new Float32Array(169);if(!r.outdoors)return hc;const A=AMP[r.theme]==null?.6:AMP[r.theme];
  const fl=(i,j)=>{const c=r.t[j]&&r.t[j][i];if(c==null)return 1;return'.,fa'.includes(c)?1:c==='_'?.45:'TNRbBr'.includes(c)?1:0};
  const al=(i,j)=>Math.min(fl(i,j),fl(i+1,j),fl(i-1,j),fl(i,j+1),fl(i,j-1));
  for(let cj=0;cj<=12;cj++)for(let ci=0;ci<=12;ci++){if(!ci||!cj||ci===12||cj===12)continue;const a=Math.min(al(ci-1,cj-1),al(ci,cj-1),al(ci-1,cj),al(ci,cj)),gx=r.rx*12+ci,gz=r.ry*12+cj;
    hc[cj*13+ci]=a*A*(vnoise(gx*.19,gz*.19)*.8+vnoise(gx*.6,gz*.6)*.3)*1.25}return hc}
function groundAt(r,x,y){if(!r)return 0;const h=r.hc||(r.hc=heights(r)),fx=clamp(x/16,0,11.999),fy=clamp(y/16,0,11.999),i=fx|0,j=fy|0,u=fx-i,v=fy-j,a=h[j*13+i],b=h[j*13+i+1],c=h[(j+1)*13+i],d=h[(j+1)*13+i+1];return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const groundY=(x,y)=>groundAt(room,x,y);

/* ---------- a room, turned into meshes ---------- */
const WALLH=2.6,DOORH=1.8,PITD=3.2,WATY=-.2,WATB=-.8,LAVY=-.25;
const DXY={n:[0,-1],s:[0,1],w:[-1,0],e:[1,0]};
const flameGeo=new TH.ConeGeometry(.13,.42,5),flameGeo2=new TH.ConeGeometry(.07,.26,5);
const flameMat=new TH.MeshBasicMaterial({color:0xff7a1a,transparent:true,opacity:.92}),flameMat2=new TH.MeshBasicMaterial({color:0xffe27a});
const SHAFTG=new TH.CylinderGeometry(1,1.7,16,10,1,true),SHAFTM=new TH.MeshBasicMaterial({color:0xffd8a0,transparent:true,opacity:.06,blending:TH.AdditiveBlending,depthWrite:false,side:TH.DoubleSide,fog:false});
function mkFlame(s){const g=new TH.Group(),a=new TH.Mesh(flameGeo,flameMat),b=new TH.Mesh(flameGeo2,flameMat2);a.position.y=.2;b.position.y=.14;g.add(a,b);g.scale.setScalar(s||1);return g}
function buildRoomMesh(r){const B=new Bat(),out=r.outdoors,T=THEMES[r.theme]||THEMES.meadow,hc=r.hc||(r.hc=heights(r)),anim=[],lights=[],extra=new TH.Group();
  const tl=(i,j)=>(i<0||j<0||i>11||j>11)?null:r.t[j][i],H=(ci,cj)=>hc[cj*13+ci],hm=(i,j)=>(H(i,j)+H(i+1,j)+H(i,j+1)+H(i+1,j+1))/4;
  const spire=out&&r.map==='ow'&&r.rx===2&&r.ry===0;
  const isW=c=>c!=null&&(out?(c==='#'||c==='G'||c==='K'):'#vWGeE'.includes(c));
  const liquid=c=>c==='w'||c==='='||c==='j'||c==='p'||c==='L';
  const wallH=out?(spire?7:2.3):WALLH;
  const wallMat=out?'stone':({d4:'bark',sp:'bark',house:'wood',cave:'rock'}[r.theme]||'stone');
  const floorMat=out?(T.fm||'grass'):({house:'wood',d4:'wood',cave:'dirt',sp:'wood'}[r.theme]||'flag');
  const gcol=out?col3(T.g):col3(T.f),dcol=out?col3(T.d):col3(T.f2),wcol=out?col3(spire?'#b8b0c8':'#b0aca0'):mulc(col3(T.wt),1.15),wtop=out?col3('#c8c4b8'):mulc(col3(T.w),.5);
  const ox=r.rx*12,oz=r.ry*12,jit=(i,j,k)=>.9+.16*hrand(ox+i,oz+j,k||1);
  /* baked shade: floor corners next to walls are darker */
  const occ=(ci,cj)=>{let n=0;for(const[a,b]of[[ci-1,cj-1],[ci,cj-1],[ci-1,cj],[ci,cj]]){const c=tl(a,b);if(c==null)continue;if(isW(c))n+=out?.12:.2;else if(out&&'TNhH'.includes(c))n+=.07}return 1-n};
  const floorQ=(i,j,mat,cl,y,sc)=>{sc=sc||.5;const ys=y==null?[H(i,j),H(i+1,j),H(i+1,j+1),H(i,j+1)]:[y,y,y,y],k=jit(i,j),c0=mulc(cl,k);
    const C=[mulc(c0,occ(i,j)),mulc(c0,occ(i+1,j)),mulc(c0,occ(i+1,j+1)),mulc(c0,occ(i,j+1))],X=v=>(ox+v)*sc,Z=v=>(oz+v)*sc;
    B.quad(mat,[i,ys[0],j],[i,ys[3],j+1],[i+1,ys[2],j+1],[i+1,ys[1],j],[C[0],C[3],C[2],C[1]],[[X(i),Z(j)],[X(i),Z(j+1)],[X(i+1),Z(j+1)],[X(i+1),Z(j)]])};
  /* an upright quad on side d of tile (i,j); inward flips it to face the tile's own middle */
  const vq=(mat,i,j,d,y0,y1,cb,ct,inward,off,a0,a1)=>{off=off||0;a0=a0==null?0:a0;a1=a1==null?1:a1;let A,Bq,C,D;
    if(d==='n'){const z=j+off;A=[i+a1,y0,z];Bq=[i+a0,y0,z];C=[i+a0,y1,z];D=[i+a1,y1,z]}
    else if(d==='s'){const z=j+1-off;A=[i+a0,y0,z];Bq=[i+a1,y0,z];C=[i+a1,y1,z];D=[i+a0,y1,z]}
    else if(d==='w'){const x=i+off;A=[x,y0,j+a0];Bq=[x,y0,j+a1];C=[x,y1,j+a1];D=[x,y1,j+a0]}
    else{const x=i+1-off;A=[x,y0,j+a1];Bq=[x,y0,j+a0];C=[x,y1,j+a0];D=[x,y1,j+a1]}
    const al=d==='n'||d==='s'?[A[0]+ox,Bq[0]+ox]:[A[2]+oz,Bq[2]+oz],uv=[[al[0]*.5,y0*.5],[al[1]*.5,y0*.5],[al[1]*.5,y1*.5],[al[0]*.5,y1*.5]];
    if(inward)B.quad(mat,Bq,A,D,C,[cb,cb,ct,ct],[uv[1],uv[0],uv[3],uv[2]]);else B.quad(mat,A,Bq,C,D,[cb,cb,ct,ct],uv)};
  const edgeTop=(i,j,d)=>{const[a,b]=d==='n'?[[i,j],[i+1,j]]:d==='s'?[[i,j+1],[i+1,j+1]]:d==='w'?[[i,j],[i,j+1]]:[[i+1,j],[i+1,j+1]];return(H(a[0],a[1])+H(b[0],b[1]))/2};
  const bottomFor=c=>c==='p'?-PITD:c==='w'||c==='='||c==='j'?WATB:c==='L'?LAVY:-.15;
  const G=(base,m,cl,grad,mat)=>B.geom(mat,base,m,cl,grad);
  /* a mushroom that glows: the light in the Fungus Hollow */
  const mush=(x0,y0,z0,a,b,s)=>{const h=(1.5+a*1.1)*s,cr=(.75+b*.35)*s,cap=mulc(col3(a<.5?T.tree:T.tree2),.85+b*.25);G(BG.cyl8,M4(x0,y0+h/2,z0,.15*s,h,.15*s),col3(T.trunk),.3,'plain');
    G(BG.hemi,M4(x0,y0+h-.05,z0,cr,cr*.5,cr,a*6),cap,0,'glow');G(BG.cyl8,M4(x0,y0+h-.08,z0,cr*.92,.04,cr*.92),mulc(cap,.4),0,'glow');
    for(let n=0;n<3;n++){const q=n*2.1+a*5;B.box('glow',x0+Math.cos(q)*cr*.5-.05,y0+h+cr*.38,z0+Math.sin(q)*cr*.5-.05,x0+Math.cos(q)*cr*.5+.05,y0+h+cr*.38+.06,z0+Math.sin(q)*cr*.5+.05,[1,1,.9],'b')}};
  for(let j=0;j<12;j++)for(let i=0;i<12;i++){const c=r.t[j][i],cx=i+.5,cz=j+.5,y=hm(i,j),r0=hrand(ox+i,oz+j,5),r1=hrand(ox+i,oz+j,9);
    /* walls */
    if(isW(c)){const KW=c==='K',wh=KW?9:wallH,wm=KW?'bark':wallMat,k=jit(i,j,3),cl=mulc(KW?col3('#4e3420'):wcol,k),cb=mulc(cl,.5);
      for(const d of'nsew'){const n=tl(i+DXY[d][0],j+DXY[d][1]);if(n==null||isW(n))continue;const mat=c==='W'?'crack':wm;vq(mat,i,j,d,bottomFor(n),wh,cb,cl);
        if((c==='e'||c==='E')){const q=c==='e'?MAT.eye:MAT.eyeshut,pl=new TH.Mesh(new TH.PlaneGeometry(.62,.42),q);const[dx,dz]=DXY[d];pl.position.set(cx+dx*.515,1.25,cz+dz*.515);pl.rotation.y=Math.atan2(dx,dz);extra.add(pl)}}
      if(out||!(i===0||j===0||i===11||j===11))B.quad(wm,[i,wh,j],[i,wh,j+1],[i+1,wh,j+1],[i+1,wh,j],KW?mulc(cl,.4):mulc(wtop,k));
      if(c==='G'){B.box('marble',i+.05,0,j+1,i+.95,2.6,j+1.12,col3('#8a7aa8'),'nb');for(let n=0;n<2;n++){const f=S.v.flames.filter(Boolean).length;B.box('glow',i+.3+n*.3,1.7,j+1.12,i+.42+n*.3,1.82,j+1.16,col3(f>i-3+n?'#ffd23f':'#3a2a5a'),'nb')}}
      continue}
    /* doors in a dungeon's walls */
    if('DZYX'.includes(c)&&!out&&(i===0||j===0||i===11||j===11)){const d=j===0?'n':j===11?'s':i===0?'w':'e',k=jit(i,j,3),cl=mulc(wcol,k);floorQ(i,j,floorMat,gcol,0);
      const opp={n:'s',s:'n',e:'w',w:'e'}[d];vq(wallMat,i,j,opp,DOORH,wallH,mulc(cl,.8),cl,false,1);
      const[x0,z0,x1,z1]=[i,j,i+1,j+1];B.quad(wallMat,[x0,DOORH,z0],[x1,DOORH,z0],[x1,DOORH,z1],[x0,DOORH,z1],mulc(cl,.45));
      vq('plain',i,j,d,0,DOORH,[0,0,0],[0,0,0],true,.02);
      /* door leaves are single faces turned to the room, so a camera outside the wall sees straight through them */
      const along=d==='n'||d==='s',leaf=(mat,cl2,y0,y1,a0,a1,off)=>vq(mat,i,j,d,y0,y1,mulc(cl2,.7),cl2,true,off==null?.45:off,a0,a1);
      if(c==='Z'){leaf('wood',col3('#7a4a26'),0,DOORH);leaf('metal',col3('#4a4a52'),.42,.56,0,1,.43);leaf('metal',col3('#4a4a52'),1.28,1.42,0,1,.43);
        const mateHi=along?tl(i+1,j)==='Z':tl(i,j+1)==='Z';leaf('metal',col3('#e8b83a'),.68,1.08,mateHi?.82:0,mateHi?1:.18,.42)}
      else if(c==='Y'){for(let n=0;n<3;n++){const a=.2+n*.3;if(along)B.box('metal',i+a-.05,0,j+.45,i+a+.05,DOORH,j+.55,col3('#8a8a96'));else B.box('metal',i+.45,0,j+a-.05,i+.55,DOORH,j+a+.05,col3('#8a8a96'))}leaf('metal',col3('#8a8a96'),1.48,1.6,0,1,.44)}
      else if(c==='X'){leaf('wood',col3('#7a1e1e'),0,DOORH);leaf('metal',col3('#c89a2a'),.2,1.6,.15,.85,.44);leaf('wood',col3('#9a2828'),.35,1.45,.25,.75,.43)}
      continue}
    /* water, pits, lava, the spring */
    if(liquid(c)){let kind=c;if(c==='='){kind='w';for(const d of'nsew'){const n=tl(i+DXY[d][0],j+DXY[d][1]);if(n==='L')kind='L';else if(n==='p'&&kind!=='L')kind='p'}}
      if(kind==='w'||kind==='j'){floorQ(i,j,'dirt',mulc(dcol,.45),WATB);if(kind==='w')B.quad('water',[i,WATY,j],[i,WATY,j+1],[i+1,WATY,j+1],[i+1,WATY,j],col3('#ffffff'),[[(ox+i)*.5,(oz+j)*.5],[(ox+i)*.5,(oz+j+1)*.5],[(ox+i+1)*.5,(oz+j+1)*.5],[(ox+i+1)*.5,(oz+j)*.5]]);
        else B.quad('pool',[i,-.12,j],[i,-.12,j+1],[i+1,-.12,j+1],[i+1,-.12,j],[1,1,1],[[i*.5,j*.5],[i*.5,(j+1)*.5],[(i+1)*.5,(j+1)*.5],[(i+1)*.5,j*.5]])}
      else if(kind==='p')B.quad('plain',[i,-PITD,j],[i,-PITD,j+1],[i+1,-PITD,j+1],[i+1,-PITD,j],[0,0,0]);
      else{B.quad('lava',[i,LAVY,j],[i,LAVY,j+1],[i+1,LAVY,j+1],[i+1,LAVY,j],[1,1,1],[[i*.5,j*.5],[i*.5,(j+1)*.5],[(i+1)*.5,(j+1)*.5],[(i+1)*.5,j*.5]]);if(r0<.22&&lights.length<6)lights.push([cx,.4,cz,0xff6a2a,.9])}
      for(const d of'nsew'){const n=tl(i+DXY[d][0],j+DXY[d][1]);if(n==null||isW(n)||liquid(n))continue;const top=edgeTop(i,j,d);
        if(kind==='p')vq(wallMat,i,j,d,-PITD,top,[0,0,0],mulc(wcol,.55),true);else if(kind==='L')vq('rock',i,j,d,LAVY,top,col3('#2a1008'),col3('#5a3020'),true);else vq('dirt',i,j,d,WATB,top,mulc(dcol,.35),mulc(dcol,.8),true)}
      if(c==='='){const pc=col3(out?'#a8784a':'#8a6a44');B.box('wood',i,-.04,j,i+1,.06,j+1,pc,'');for(const d of'nsew'){const n=tl(i+DXY[d][0],j+DXY[d][1]);if(!n||!(n==='w'||n==='L'||n==='p'))continue;const[dx,dz]=DXY[d];const ex=cx+dx*.45,ez=cz+dz*.45;
          if(dx)B.box('wood',ex-.05,.06,j,ex+.05,.4,j+1,mulc(pc,.8));else B.box('wood',i,.06,ez-.05,i+1,.4,ez+.05,mulc(pc,.8))}}
      continue}
    /* everything else stands on a floor */
    if(!(out&&(c==='h'||c==='H'||c==='d'))){let fm=floorMat,fc=gcol;if(out&&(c==='_'||c==='a'||c==='d'))fm='dirt',fc=dcol;if(c==='S')fm=out?'dirt':floorMat,fc=mulc(dcol,.25);if(!out&&c==='a')fc=dcol;floorQ(i,j,fm,fc)}
    const ac=out?null:col3(T.acc),M=(x,yy,z,sx,sy,sz,ry,rx,rz)=>M4(x,yy,z,sx,sy,sz,ry,rx,rz);
    switch(c){
      case 'T':{if(r.theme==='pine'){mush(cx,y,cz,r0,r1,1);break}
        /* a root coming down out of the dark */
        const tc=mulc(col3(T.trunk),jit(i,j,4)),dx=(r0-.5)*.3,dz=(r1-.5)*.3;G(BG.cone7,M(cx+dx,y+.25,cz+dz,.62,.5,.62,r0*3),mulc(tc,.85),.4,'bark');
        let px=cx+dx,pz=cz+dz,yy=y+.4;for(let n=0;n<3;n++){const h=n===2?6:2.6,rr=.36-n*.06,lx=(hrand(ox+i,oz+j,30+n)-.5)*.4,lz=(hrand(ox+i,oz+j,40+n)-.5)*.4;G(BG.cyl6,M(px+lx/2,yy+h/2,pz+lz/2,rr,h,rr,r0*5+n,lz*.3,-lx*.3),mulc(tc,1+n*.06),.3,'bark');px+=lx;pz+=lz;yy+=h-.05}
        if(r1<.28)G(BG.hemi,M(cx+dx+.3,y+1.3,cz+dz,.3,.1,.24,r0*6),col3(r0<.5?'#7ae8d0':'#ffb060'),0,'glow');break}
      case 'N':mush(cx,y,cz,r0,r1,1.35);break;
      case 'R':{const tall=(r.theme==='crag'||r.theme==='ash')&&(i<2||j<2||i>9||j>9),rc=col3(r.theme==='crag'?'#7a5a3a':r.theme==='ash'?'#5e4e60':out?'#5e4430':'#7a7068'),s=.85+r0*.35,rm=out?'bark':'rock';
        if(tall)G(BG.dode,M(cx,y+.9,cz,.62*s,1.25+r1*.6,.62*s,r0*6,r1),mulc(rc,jit(i,j)),.4,rm);else G(BG.dode,M(cx,y+.32,cz,.55*s,.45*s,.55*s,r0*6,r1*.4),mulc(rc,jit(i,j)),.4,rm);break}
      case 'r':G(BG.dode,M(cx,y+.38,cz,.58,.5,.58,r0*6),col3(out?'#a89c88':'#8a7e70'),.35,'crack');break;
      case 'b':{const cc=r.theme==='pine'?'#5ae8d8':['#ffb050','#e86a4a','#d8e86a'][(r0*3)|0];for(let n=0;n<3;n++){const a=n*2.1+r0*4,d=n?.2:0,hx=cx+Math.cos(a)*d,hz=cz+Math.sin(a)*d,h=n?.26:.42;
        G(BG.cyl6,M(hx,y+h/2,hz,.05,h,.05),col3('#e8dcc0'),.3,'plain');G(BG.hemi,M(hx,y+h-.02,hz,n?.16:.26,n?.1:.15,n?.16:.26,a),col3(cc),0,'glow')}G(BG.ico,M(cx,y+.05,cz,.38,.1,.38),mulc(gcol,.7),.3,'leaf');break}
      case 'B':G(BG.ico,M(cx,y+.42,cz,.5,.45,.5,r0*6),col3('#6a3a5a'),.4,'thorn');for(let n=0;n<5;n++){const a=n/5*TAU+r0*3;G(BG.cone4,M(cx+Math.cos(a)*.42,y+.4+(n%2)*.2,cz+Math.sin(a)*.42,.05,.28,.05,0,Math.sin(a)*1.4,-Math.cos(a)*1.4),col3('#d8c8b0'),0,'plain')}break;
      case 's':{const sc=out?col3('#aaa8a0'):mulc(wcol,1.05);B.box('stone',cx-.4,y,cz-.4,cx+.4,y+.32,cz+.4,mulc(sc,.85));G(BG.cone7,M(cx,y+.32+.55,cz,.3,1.1,.3,r0),sc,.4,'stone');G(BG.ico,M(cx,y+1.5,cz,.17,.17,.17),sc,.2,'stone');G(BG.cone7,M(cx,y+1.66,cz-.04,.21,.36,.21,0,-.25),mulc(sc,.9),.3,'stone');break}
      case 'F':{const ax=tl(i-1,j)==='F'||tl(i+1,j)==='F'||!(tl(i,j-1)==='F'||tl(i,j+1)==='F'),wc=col3('#9a7048');if(ax){B.box('wood',i+.05,y,cz-.06,i+.17,y+.8,cz+.06,wc);B.box('wood',i+.83,y,cz-.06,i+.95,y+.8,cz+.06,wc);B.box('wood',i,y+.5,cz-.04,i+1,y+.62,cz+.04,mulc(wc,1.1));B.box('wood',i,y+.22,cz-.04,i+1,y+.32,cz+.04,mulc(wc,1.1))}
        else{B.box('wood',cx-.06,y,j+.05,cx+.06,y+.8,j+.17,wc);B.box('wood',cx-.06,y,j+.83,cx+.06,y+.8,j+.95,wc);B.box('wood',cx-.04,y+.5,j,cx+.04,y+.62,j+1,mulc(wc,1.1));B.box('wood',cx-.04,y+.22,j,cx+.04,y+.32,j+1,mulc(wc,1.1))}break}
      case 'n':B.box('wood',cx-.05,y,cz-.05,cx+.05,y+.75,cz+.05,col3('#7a5432'));B.box('wood',cx-.36,y+.62,cz-.04,cx+.36,y+1.05,cz+.04,col3('#b08858'));break;
      case 'P':{G(BG.cyl6,M(cx,y+.55,cz,.17,1.1,.17),col3('#8a6038'),.4,'wood');G(BG.tor,M(cx,y+.95,cz,.22,.22,.22,0,Math.PI/2),col3('#e8c060'),0,'metal');G(BG.cyl8,M(cx,y+1.12,cz,.2,.06,.2),col3('#d84a3a'),0,'plain');G(BG.cyl8,M(cx,y+1.15,cz,.1,.03,.1),col3('#ffffff'),0,'glow');break}
      case 'i':case 'I':{const sc=out?col3('#a8a49c'):mulc(wcol,.95);B.box('stone',cx-.2,y,cz-.2,cx+.2,y+.85,cz+.2,sc);G(BG.cyl8,M(cx,y+.92,cz,.25,.16,.25),col3('#3a3430'),0,'metal');
        if(c==='I'){const f=mkFlame(1.1);f.position.set(cx,y+1,cz);extra.add(f);anim.push(f);lights.push([cx,y+1.3,cz,0xffa04a,1.5])}break}
      case 'V':case 'J':{G(BG.cyl6,M(cx,y+.3,cz,.16,.6,.16),col3('#4a4a52'),.3,'metal');G(BG.cyl8,M(cx,y+.68,cz,.4,.2,.4),col3('#5a5a64'),.2,'metal');
        if(c==='J'){const f=mkFlame(1.8);f.position.set(cx,y+.75,cz);extra.add(f);anim.push(f);lights.push([cx,y+1.3,cz,0xffb04a,2])}break}
      case 'c':{B.box('stone',cx-.25,y,cz-.25,cx+.25,y+.45,cz+.25,mulc(wcol,.9));G(BG.octa,M(cx,y+.95,cz,.28,.4,.28,r0*6),col3(r.crys===1?'#4a9aff':'#ff8a2a'),0,'glow');break}
      case 'O':case 'u':{const up=c==='O'?r.crys!==1:r.crys===1,bc=col3(c==='O'?'#e8842a':'#3a7ae8');if(up){B.box('plain',i+.04,0,j+.04,i+.96,1,j+.96,bc,'',mulc(bc,1.2));B.box('plain',i+.25,1,j+.25,i+.75,1.02,j+.75,mulc(bc,.7))}else B.box('plain',i+.1,0,j+.1,i+.9,.04,j+.9,mulc(bc,.55));break}
      case 'm':B.box('stone',i+.04,0,j+.04,i+.96,.96,j+.96,mulc(wcol,.95));break;
      case 'C':case 'U':{const wc=col3('#8a5228'),gc=col3('#e8b83a');B.box('wood',cx-.38,y,cz-.28,cx+.38,y+.42,cz+.28,wc);B.box('metal',cx-.4,y,cz+.22,cx-.3,y+.44,cz+.3,gc);B.box('metal',cx+.3,y,cz+.22,cx+.4,y+.44,cz+.3,gc);
        if(c==='C'){B.box('wood',cx-.4,y+.42,cz-.3,cx+.4,y+.62,cz+.3,mulc(wc,1.1));B.box('wood',cx-.36,y+.62,cz-.24,cx+.36,y+.7,cz+.24,mulc(wc,1.18));B.box('metal',cx-.08,y+.3,cz+.29,cx+.08,y+.52,cz+.34,gc)}
        else{B.quad('plain',[cx-.36,y+.41,cz-.26],[cx-.36,y+.41,cz+.26],[cx+.36,y+.41,cz+.26],[cx+.36,y+.41,cz-.26],[.05,.03,.02]);B.box('wood',cx-.4,y+.42,cz-.36,cx+.4,y+1,cz-.24,mulc(wc,1.1))}break}
      case 'q':B.box('wood',i,0,j+.1,i+1,.9,j+.9,col3('#8a5a32'),'',col3('#b0804a'));break;
      case 'x':{B.box('metal',i+.06,0,j+.06,i+.94,.04,j+.94,col3('#3a3a40'));for(let a=0;a<3;a++)for(let b=0;b<3;b++)G(BG.cone4,M(i+.2+a*.3,.2,j+.2+b*.3,.08,.34,.08,.78),col3('#c8ccd8'),.4,'metal');break}
      case 'o':B.box('stone',cx-.38,0,cz-.38,cx+.38,.07,cz+.38,col3('#d8c860'));break;
      case 'f':for(let n=0;n<4;n++){const a=hrand(ox+i,oz+j,20+n),b=hrand(ox+i,oz+j,40+n),fc=['#7ae8d0','#ffd890','#c8f0ff','#ffb0e8'][n];B.box('glow',i+.15+a*.7,y+.06,j+.15+b*.7,i+.23+a*.7,y+.18,j+.23+b*.7,col3(fc),'b')}break;
      case ',':if(out){for(let n=0;n<3;n++){const a=hrand(ox+i,oz+j,60+n),b=hrand(ox+i,oz+j,70+n);G(BG.cone4,M(i+.2+a*.6,y+.1,j+.2+b*.6,.07,.24,.07,a*3),mulc(gcol,.75),.5,'plain')}}
        else for(let n=0;n<3;n++){const a=hrand(ox+i,oz+j,60+n),b=hrand(ox+i,oz+j,70+n);B.box('plain',i+.2+a*.55,0,j+.2+b*.55,i+.32+a*.55,.08,j+.3+b*.55,ac,'b')}break;
      case 'e':case 'E':{B.box('stone',cx-.3,y,cz-.3,cx+.3,y+1.7,cz+.3,col3('#a8a49c'));for(const d of'nsew'){const[dx,dz]=DXY[d],pl=new TH.Mesh(new TH.PlaneGeometry(.5,.34),c==='e'?MAT.eye:MAT.eyeshut);pl.position.set(cx+dx*.31,y+1.25,cz+dz*.31);pl.rotation.y=Math.atan2(dx,dz);extra.add(pl)}break}
      case 'S':{const back=out?'n':'n';vq('plain',i,j,back,y,y+1.7,[0,0,0],[0,0,0],true,.02);vq('plain',i,j,'w',y,y+1.7,[0,0,0],[.06,.05,.05],true,.03);vq('plain',i,j,'e',y,y+1.7,[0,0,0],[.06,.05,.05],true,.03);
        if(out&&tl(i,j-1)!=='#')B.box('rock',i-.05,y+1.6,j,i+1.05,y+2.1,j+.7,col3('#8a8478'));break}
    }}
  /* houses: one model per 4 x 3 footprint */
  for(let j=0;j<12;j++)for(let i=0;i<12;i++){if(r.t[j][i]!=='h'||tl(i-1,j)==='h'||tl(i,j-1)==='h')continue;let w=0;while(tl(i+w,j)==='h')w++;const x0=i+.1,x1=i+w-.1,z0=j+.2,z1=j+3-.08,y0=0,wh=2,zm=(z0+z1)/2;
    let door=null;for(let a=i;a<i+w;a++)if(tl(a,j+2)==='d')door=a;const to=door!=null&&r.warps[door+','+(j+2)]?r.warps[door+','+(j+2)].to:'';const rc=col3(to==='shop'?'#3a64b0':to==='hermit'?'#7a5a3a':'#b8503a');
    B.box('plaster',x0,y0-.2,z0,x1,wh,z1,col3('#efe4cc'),'tb');const wd=col3('#5a3a22');
    for(const[a,b]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])B.box('wood',a-.07,y0-.2,b-.07,a+.07,wh,b+.07,wd);B.box('wood',x0-.05,wh-.12,z1-.02,x1+.05,wh,z1+.06,wd);B.box('wood',x0-.05,.95,z1-.02,x1+.05,1.05,z1+.05,wd);
    const ex0=x0-.3,ex1=x1+.3,ez0=z0-.35,ez1=z1+.35,ry=3.25,ey=1.85;
    B.quad('roof',[ex0,ey,ez1],[ex1,ey,ez1],[ex1,ry,zm],[ex0,ry,zm],[mulc(rc,.8),mulc(rc,.8),rc,rc],[[ex0,0],[ex1,0],[ex1,1.6],[ex0,1.6]]);B.quad('roof',[ex1,ey,ez0],[ex0,ey,ez0],[ex0,ry,zm],[ex1,ry,zm],[mulc(rc,.62),mulc(rc,.62),mulc(rc,.85),mulc(rc,.85)],[[ex1,0],[ex0,0],[ex0,1.6],[ex1,1.6]]);
    B.quad('roof',[ex1,ey,ez1],[ex0,ey,ez1],[ex0,ry,zm],[ex1,ry,zm],mulc(rc,.35));B.quad('roof',[ex0,ey,ez0],[ex1,ey,ez0],[ex1,ry,zm],[ex0,ry,zm],mulc(rc,.35));
    B.tri('plaster',[x0,wh,z1],[x0,ry-.1,zm],[x0,wh,z0],col3('#d8ccb4'),col3('#d8ccb4'),col3('#d8ccb4'),[0,0],[.5,1],[1,0]);B.tri('plaster',[x1,wh,z0],[x1,ry-.1,zm],[x1,wh,z1],col3('#d8ccb4'),col3('#d8ccb4'),col3('#d8ccb4'),[0,0],[.5,1],[1,0]);
    B.box('stone',x1-.9,2.4,zm-.5,x1-.5,3.7,zm-.1,col3('#8a8478'));
    for(let a=i;a<i+w;a++){if(a===door){B.box('wood',a+.18,0,z1,a+.82,1.45,z1+.06,col3('#6a4024'));B.box('metal',a+.66,.7,z1+.06,a+.74,.78,z1+.1,col3('#e8b83a'));B.box('wood',a+.12,1.45,z1,a+.88,1.55,z1+.08,wd)}
      else{B.box('plain',a+.28,.95,z1,a+.72,1.45,z1+.04,col3('#2a3a5a'));B.box('wood',a+.24,.9,z1,a+.76,.96,z1+.07,wd);B.box('wood',a+.47,.95,z1+.02,a+.53,1.45,z1+.07,wd)}}}
  /* a few landmarks that do not fit in a tile */
  if(spire){B.box('bark',2.9,wallH-.3,-.1,9.1,wallH,3.1,col3('#3a1410'),'b');const hg=new TH.Group(),hb=new TH.Mesh(GEO.ico1,new TH.MeshLambertMaterial({color:0x8a1e1e,emissive:0x3a0606}));hb.scale.set(2.6,3,2.4);hg.add(hb);
    for(let n=0;n<7;n++){const a=n/7*TAU,v=new TH.Mesh(GEO.cyl6,mat('#4a1410'));v.scale.set(.28,10,.28);v.position.set(Math.cos(a)*2.6,4.5,Math.sin(a)*2.2);v.rotation.set(Math.sin(a)*.45,0,-Math.cos(a)*.45);hg.add(v)}
    hg.position.set(6,wallH+3.2,1.5);hg.userData.kind='heart';extra.add(hg);anim.push(hg);lights.push([6,wallH+3,1.5,0xff4a3a,1.4,16])}
  if(out&&r.map==='ow'&&r.rx===0&&r.ry===5){B.geom('bark',BG.cyl8,M4(5.5,8,.4,2.2,16,2.2,.3),col3('#6a4428'),.5);
    for(let n=0;n<5;n++){const a=n/5*TAU+.4;B.geom('bark',BG.box,M4(5.5+Math.cos(a)*2.2,.3,.4+Math.sin(a)*2.2,.5,.6,1.6,-a),col3('#6a4a2a'),.4)}}
  if(out&&hrand(ox,oz,77)<.5){const sx=3+hrand(ox,oz,78)*6,sz=3+hrand(ox,oz,79)*6,sh=new TH.Mesh(SHAFTG,SHAFTM);sh.position.set(sx,8,sz);sh.renderOrder=3;extra.add(sh)}
  const grp=B.build();grp.add(extra);grp.position.set(ox,0,oz);return{group:grp,anim,lights:lights.map(l=>[l[0]+ox,l[1],l[2]+oz,l[3],l[4]])}}

/* ---------- models: people, creatures, bosses, things on the floor ---------- */
const MC=new Map();
function mat(c,o){const k=c+(o?JSON.stringify(o):'');let m=MC.get(k);if(!m){m=new TH.MeshLambertMaterial(Object.assign({color:c},o||{}));MC.set(k,m)}return m}
function bmat(c,o){const k='b'+c+(o?JSON.stringify(o):'');let m=MC.get(k);if(!m){m=new TH.MeshBasicMaterial(Object.assign({color:c},o||{}));MC.set(k,m)}return m}
const GEO={box:BG.box.geo,cyl6:BG.cyl6.geo,cyl8:BG.cyl8.geo,cone7:BG.cone7.geo,cone4:BG.cone4.geo,ico:BG.ico.geo,ico1:BG.ico1.geo,dode:BG.dode.geo,octa:BG.octa.geo,tor:BG.tor.geo,taper:BG.taper.geo,sph:BG.sph.geo,hemi:BG.hemi.geo};
/* one coloured piece: shape, colour, place, size, parent, and an optional turn */
function pc(g,c,x,y,z,sx,sy,sz,par,rx,ry,rz,o){const m=new TH.Mesh(GEO[g],typeof c==='string'?mat(c,o):c);m.position.set(x,y,z);m.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);par.add(m);return m}
const grp=(par,x,y,z)=>{const g=new TH.Group();g.position.set(x||0,y||0,z||0);if(par)par.add(g);return g};
/* people are built in part 6h (the cast) */
/* a seedling: an acorn with a sprout and two black eyes. Friendly-looking. That is the point */
/* a seedling: a hard, faceless seed husk split down the front, two limp leaves and little root feet */
function mkSeedling(){const g=new TH.Group(),u={};g.userData=u;u.b=grp(g,0,0,0);pc('ico1','#ac9462',0,.2,0,.16,.21,.15,u.b);pc('hemi','#5e4628',0,.29,0,.17,.1,.165,u.b);pc('cone4','#3a2a18',0,.42,0,.022,.08,.022,u.b);
  pc('box','#8a9a62',.05,.46,0,.11,.015,.05,u.b,0,0,.6);pc('box','#7a8a56',-.045,.47,0,.08,.015,.04,u.b,0,0,-.8);
  pc('box','#1a120a',0,.2,.155,.012,.2,.01,u.b);pc('box','#1a120a',.03,.13,.148,.01,.07,.01,u.b,0,0,.5);pc('box','#1a120a',-.025,.27,.15,.01,.06,.01,u.b,0,0,-.4);
  for(const sd of[-1,1])for(let n=0;n<2;n++)pc('cone4','#4a3a24',sd*(.05+n*.04),.03,.02-n*.04,.015,.09,.015,u.b,Math.PI,0,sd*(.5+n*.3));return g}
function mkFoeModel(t){const g=new TH.Group(),u={};g.userData=u;
  switch(t){
    case 'bat':case 'moth':{const c=t==='bat'?'#4a3a5a':'#c8b888';u.body=grp(g,0,.9,0);pc('ico',c,0,0,0,.13,.12,.13,u.body);if(t==='bat'){pc('cone4',c,-.08,.13,0,.04,.1,.04,u.body);pc('cone4',c,.08,.13,0,.04,.1,.04,u.body);pc('box','#ff3a2a',-.05,.02,.12,.03,.03,.02,u.body);pc('box','#ff3a2a',.05,.02,.12,.03,.03,.02,u.body)}
      u.w=[-1,1].map(sd=>{const w=grp(u.body,sd*.1,0,0);pc('box',t==='bat'?'#3a2a4a':'#e8dcb0',sd*.2,0,0,.4,.02,.24,w);return w});break}
    /* goblins, the mutated goblin, lizard people, skeletons, the shade: all rigged figures (see mkCreature) */
    case 'slime':case 'spitter':case 'crab':case 'husk':case 'ghoul':case 'knight':case 'shade':{const c=mkCreature(t);g.add(c.g);u.h=c.h;u.cr=c;break}
    /* a skull that burns with cold blue fire and chatters as it drifts after you */
    case 'wisp':{u.c=grp(g,0,.8,0);const sk=grp(u.c,0,0,0);u.jaw=skullOn(sk,skinM('#d8d0b8'),skinM('#141010'),glowM('#8ad8ff'),{s:1.35});u.fl=[];
      for(let n=0;n<9;n++){const a=Math.PI*(1.05+n/8*.9),rr=n%3?.11:.06,f=pc('cone7',bmat(n%2?'#4ab0ff':'#a8e8ff',{transparent:true,opacity:.7,depthWrite:false}),Math.cos(a)*rr,.12,Math.sin(a)*rr-.06,.055,.3,.055,u.c,-.45*Math.sin(a)-.35,0,.45*Math.cos(a));f.userData.h=n%3?.3:.42;u.fl.push(f)}break}
    case 'spinner':{u.s=grp(g,0,.28,0);pc('cyl8','#8a8a96',0,0,0,.36,.12,.36,u.s);pc('cyl8','#c8a040',0,.07,0,.12,.04,.12,u.s);for(let n=0;n<8;n++){const a=n/8*TAU;pc('cone4','#d8dce8',Math.cos(a)*.42,0,Math.sin(a)*.42,.06,.22,.06,u.s,0,-a,Math.PI/2)}break}
  }return g}

function mkBossModel(b){const g=new TH.Group(),u={};g.userData=u;
  switch(b.kind){
    case 'beetle':{u.b=grp(g,0,.55,0);pc('hemi','#3a5a2a',0,0,0,.9,.6,1.25,u.b);pc('box','#1a2a12',0,.33,0,.04,.3,2.2,u.b);pc('hemi','#6a8a4a',-.35,.18,-.1,.3,.2,.6,u.b);
      u.head=grp(u.b,0,.05,1.15);pc('ico1','#4a3a2a',0,0,0,.42,.34,.38,u.head);u.eye=pc('ico1',bmat('#ff3a2a'),0,.05,.33,.12,.12,.08,u.head);pc('cone4','#e8d8a8',.18,.12,.3,.05,.4,.05,u.head,1.2,0,-.3);pc('cone4','#e8d8a8',-.18,.12,.3,.05,.4,.05,u.head,1.2,0,.3);
      u.legs=[];for(const sd of[-1,1])for(let n=0;n<3;n++){const l=grp(u.b,sd*.8,-.1,-.6+n*.6);pc('box','#1a1a12',sd*.25,-.15,0,.5,.07,.07,l,0,0,sd*.6);u.legs.push(l)}
      u.belly=pc('hemi','#c8a87a',0,-.02,0,.85,.25,1.15,u.b,Math.PI);break}
    case 'bell':{u.b=grp(g,0,1.1,0);const prof=[];for(let n=0;n<=8;n++){const t=n/8;prof.push(new TH.Vector2(.25+Math.pow(t,1.7)*.85,1.1-t*1.25))}const lg=new TH.LatheGeometry(prof,9);
      pc('box','#3a2a1a',0,1.15,0,.12,.25,.12,u.b);const bm=new TH.Mesh(lg,mat('#b8863a',{side:TH.DoubleSide}));bm.position.y=-.1;u.b.add(bm);u.bell=bm;pc('tor','#8a5a1a',0,-.12,0,1.06,1.06,.6,u.b,Math.PI/2);
      u.eye=pc('box',bmat('#c8a050'),0,.45,.64,.24,.03,.03,u.b);pc('ico1','#3a2a1a',0,-.32,0,.2,.2,.2,u.b);
      for(let n=0;n<3;n++){const a=n/3*TAU;pc('cyl6','#5a5a62',Math.cos(a)*.2,2.4,Math.sin(a)*.2,.03,2.4,.03,u.b,0,0,Math.cos(a)*.1)}break}
    case 'moth':{u.b=grp(g,0,1,0);pc('cone7','#6a5a3a',0,0,0,.18,.8,.18,u.b,Math.PI/2);pc('ico1','#8a7a5a',0,0,.42,.16,.16,.16,u.b);pc('ico1',bmat('#ff6a3a'),-.08,.05,.55,.04,.04,.04,u.b);pc('ico1',bmat('#ff6a3a'),.08,.05,.55,.04,.04,.04,u.b);
      pc('cyl6','#4a3a2a',-.08,.25,.6,.015,.4,.015,u.b,.7,0,.3);pc('cyl6','#4a3a2a',.08,.25,.6,.015,.4,.015,u.b,.7,0,-.3);
      const wm=new TH.MeshLambertMaterial({map:TEX.wing,side:TH.DoubleSide,transparent:true});u.w=[];for(const sd of[-1,1]){const w=grp(u.b,sd*.1,0,0);const p1=new TH.Mesh(new TH.PlaneGeometry(1.3,1),wm);p1.rotation.x=-Math.PI/2;p1.position.set(sd*.7,0,.15);w.add(p1);
        const p2=new TH.Mesh(new TH.PlaneGeometry(.8,.7),wm);p2.rotation.x=-Math.PI/2;p2.position.set(sd*.45,0,-.5);w.add(p2);u.w.push(w)}break}
    case 'golem':{u.b=grp(g,0,0,0);u.t=grp(u.b,0,1.05,0);pc('box','#6a6a5a',0,0,0,1.4,1.1,1,u.t);pc('box','#4a7a2a',.3,.56,.1,.6,.12,.5,u.t);pc('box','#7a7a68',0,.75,.1,.6,.5,.55,u.t);pc('box',bmat('#ffd23f'),-.15,.8,.38,.1,.08,.02,u.t);pc('box',bmat('#ffd23f'),.15,.8,.38,.1,.08,.02,u.t);
      u.core=pc('ico1',bmat('#ff4a2a'),0,0,.48,.22,.22,.1,u.t);u.crack=pc('box','#1a1a12',0,.1,.51,.5,.04,.02,u.t,0,0,.4);u.arms=[-1,1].map(sd=>{const a=grp(u.t,sd*.85,.35,0);pc('box','#5a5a4a',0,-.45,0,.4,.9,.4,a);pc('box','#4a7a2a',0,-.1,.15,.42,.15,.2,a);return a});
      u.legs=[-1,1].map(sd=>{const l=grp(u.b,sd*.38,.55,0);pc('box','#5a5a4a',0,-.28,0,.45,.6,.45,l);return l});break}
    case 'hush':{u.fog=[];for(let n=0;n<5;n++)u.fog.push(pc('ico1',bmat('#1e1830',{transparent:true,opacity:.55,depthWrite:false}),0,1.4,0,1-n*.12,.7,1-n*.12,g));
      u.masks=[0,1,2,3].map(()=>{const m=grp(g,0,0,0);pc('ico1','#4a1a16',0,0,0,.26,.32,.22,m);for(let n=0;n<4;n++)pc('box','#2a0c0a',Math.cos(n*1.6)*.12,0,Math.sin(n*1.6)*.1,.02,.5,.02,m,0,n*.8,.3);
        m.userData.e=[pc('ico1',bmat('#ff5a3a'),0,0,.16,.1,.14,.06,m)];return m});
      u.face=grp(g,0,0,0);pc('ico1','#4a1a18',0,0,0,.85,1,.6,u.face);pc('ico1','#3a1210',-.35,.4,.2,.35,.3,.3,u.face);pc('ico1','#3a1210',.4,-.2,.25,.3,.35,.25,u.face);for(let n=0;n<7;n++){const a=n/7*TAU;pc('cyl6','#2a0c0a',Math.cos(a)*.6,Math.sin(a)*.7,.3,.04,.6,.04,u.face,0,0,a)}
      u.core=pc('ico1',bmat('#ff4a6a'),0,-1,0,.25,.2,.2,u.face);
      u.veil=new TH.Mesh(new TH.PlaneGeometry(12,2.4,12,2),new TH.MeshBasicMaterial({color:0xc8bef0,transparent:true,opacity:.18,side:TH.DoubleSide,depthWrite:false}));u.veil.position.set(0,1.2,0);g.add(u.veil);
      u.hands=[0,1].map(()=>{const h=grp(g,0,0,0);pc('box','#5a4632',0,0,0,.7,.22,.6,h);for(let n=0;n<4;n++)pc('box','#5a4632',-.25+n*.17,0,.42,.12,.16,.32,h);pc('box','#5a4632',-.42,0,.05,.14,.14,.3,h,0,.6);return h});break}
  }return g}

/* ---------- the scene, sky and lights ---------- */
const G3={r:null,cache:new Map(),live:new Map(),camPos:new TH.Vector3(),camLook:new TH.Vector3(),camDist:4.4,snap:true,yawV:0};
const SHG=new TH.CircleGeometry(1,10);SHG.rotateX(-Math.PI/2);const SHM=new TH.MeshBasicMaterial({color:0,transparent:true,opacity:SHADOWS?.1:.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
const shadow=(par,s)=>{const m=new TH.Mesh(SHG,SHM);m.scale.setScalar(s);m.position.y=.03;par.add(m);return m};
function mkStars(par,y,s){const g=grp(par,0,y,0);for(let n=0;n<3;n++)pc('octa',bmat('#ffd23f'),Math.cos(n*2.1)*.3*s,0,Math.sin(n*2.1)*.3*s,.06,.06,.06,g);g.visible=false;return g}
/* the last pass: the frame is drawn into a texture, then onto the screen through a shader that does what the old video
   chips did on the way to the television: colour cut down to 5 bits a channel with an ordered dither, and a soft blend
   with the pixels either side */
function postInit(){G3.rt=new TH.WebGLRenderTarget(Math.max(1,W3),Math.max(1,H3),{minFilter:TH.LinearFilter,magFilter:TH.LinearFilter});
  G3.postM=new TH.ShaderMaterial({uniforms:{tex:{value:G3.rt.texture},res:{value:new TH.Vector2(W3,H3)}},depthTest:false,depthWrite:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:'uniform sampler2D tex;uniform vec2 res;varying vec2 vUv;\n'+
      'float bay(vec2 p){vec2 q=mod(floor(p),4.);float a=mod(q.x,2.),b=mod(q.y,2.),c=floor(q.x/2.),d=floor(q.y/2.);return(4.*(2.*a+3.*b-4.*a*b)+(2.*c+3.*d-4.*c*d)+.5)/16.;}\n'+
      'void main(){vec2 px=vec2(1./res.x,0.);vec3 c=texture2D(tex,vUv).rgb*.78+(texture2D(tex,vUv-px).rgb+texture2D(tex,vUv+px).rgb)*.11;\n'+
      'c=floor(c*31.+bay(gl_FragCoord.xy))/31.;gl_FragColor=vec4(c,1.);}'});
  G3.postS=new TH.Scene();const q=new TH.Mesh(new TH.PlaneGeometry(2,2),G3.postM);q.frustumCulled=false;G3.postS.add(q);G3.postC=new TH.OrthographicCamera(-1,1,1,-1,0,1)}
/* how many pixels the 3D view is drawn with: HD uses the screen's own (up to a limit, so phones stay smooth); RETRO and PIXEL draw small */
function glSize(){const r=G3.r;if(!r)return;if(PIC!=='hd'){r.setSize(W3,H3,false);return}
  const dpr=Math.min(window.devicePixelRatio||1,2);let w=(stage.clientWidth||innerWidth||300)*dpr,h=(stage.clientHeight||innerHeight||400)*dpr;const cap=2.4e6;
  if(w*h>cap){const f=Math.sqrt(cap/(w*h));w*=f;h*=f}r.setSize(Math.round(w),Math.round(h),false)}
function present(sc,cam){const r=G3.r;if(PIC!=='retro'||!G3.rt){r.render(sc,cam);return}
  if(G3.rt.width!==W3||G3.rt.height!==H3){G3.rt.setSize(W3,H3);G3.postM.uniforms.res.value.set(W3,H3)}
  r.setRenderTarget(G3.rt);r.render(sc,cam);r.setRenderTarget(null);r.render(G3.postS,G3.postC)}
function setPic(p){PIC=p;try{localStorage.setItem('hollowmere-pic',p)}catch(e){}stage.classList.toggle('sharp',p==='pixel');
  const f=p==='retro'?TH.LinearFilter:TH.NearestFilter;for(const t of Object.values(PXT)){t.magFilter=t.minFilter=f;t.needsUpdate=true}RES_BASE=p==='retro'?320:300;resize()}
/* ---------- the sword's trail: a ribbon from the blade's root to its point over the last few frames, bright and fading ---------- */
function mkTrail(sc){const N=10,pos=new Float32Array(N*6),al=new Float32Array(N*2),idx=[];for(let i=0;i<N-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
  const g=new TH.BufferGeometry();g.setAttribute('position',new TH.BufferAttribute(pos,3));g.setAttribute('alpha',new TH.BufferAttribute(al,1));g.setIndex(idx);
  const m=new TH.ShaderMaterial({transparent:true,depthWrite:false,side:TH.DoubleSide,blending:TH.AdditiveBlending,uniforms:{col:{value:new TH.Color(0xd8ecff)}},
    vertexShader:'attribute float alpha;varying float vA;void main(){vA=alpha;gl_Position=projectionMatrix*viewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform vec3 col;varying float vA;void main(){gl_FragColor=vec4(col*vA,vA);}'});
  const me=new TH.Mesh(g,m);me.frustumCulled=false;me.visible=false;sc.add(me);return{me,N,pts:[],pos,al,col:m.uniforms.col.value}}
const _ta=new TH.Vector3(),_tb=new TH.Vector3();
function trailTick(){const R=G3.trailR,h=G3.hero;if(!R||HITSTOP>0)return;const on=state==='play'&&(P.swing>0||P.spin>0||P.jump>0)&&h.sword.visible;
  if(on){h.root.updateMatrixWorld(true);h.baseM.getWorldPosition(_ta);h.tipM.getWorldPosition(_tb);R.pts.unshift([_ta.x,_ta.y,_ta.z,_tb.x,_tb.y,_tb.z]);R.col.setHex(P.spin>0?0xffe2a0:S.v.sword>=2?0xffd8a0:0xd8ecff)}
  else if(R.pts.length)R.pts.pop();
  if(R.pts.length>R.N)R.pts.length=R.N;R.me.visible=R.pts.length>1;if(!R.me.visible)return;
  const n=R.pts.length;for(let i=0;i<R.N;i++){const q=R.pts[Math.min(i,n-1)],k=i<n?Math.pow(1-i/(n-1),1.4):0;R.pos.set(q,i*6);R.al[i*2]=k*.22;R.al[i*2+1]=k}
  R.me.geometry.attributes.position.needsUpdate=true;R.me.geometry.attributes.alpha.needsUpdate=true}
/* a hit: a star of light where the blade meets (the world stops for a moment too, see HITSTOP) */
const STARG=(()=>{const g=new TH.BufferGeometry(),p=[0,0,0];for(let i=0;i<=8;i++){const a=i/8*TAU,r=i%2?.24:1;p.push(Math.cos(a)*r,Math.sin(a)*r,0)}const idx=[];for(let i=1;i<=8;i++)idx.push(0,i,i+1);
  g.setAttribute('position',new TH.Float32BufferAttribute(p,3));g.setIndex(idx);return g})();
const SPK=[];
function spark3D(x,y,big){if(!G3.scene||!room)return;let s=SPK.find(o=>o.t<=0);if(!s){if(SPK.length>=6)s=SPK[0];else{const m=new TH.Mesh(STARG,new TH.MeshBasicMaterial({color:0xffffff,transparent:true,depthTest:false,depthWrite:false,blending:TH.AdditiveBlending,fog:false}));
    m.renderOrder=20;m.frustumCulled=false;G3.scene.add(m);s={m,t:0};SPK.push(s)}}
  const[gx,gz]=gpos(x,y);s.m.position.set(gx,groundY(x,y)+.7,gz);s.t=s.T=big?.2:.15;s.big=big;s.r=Math.random()*TAU;s.m.visible=true}
function sparkTick(dt){for(const s of SPK){if(s.t<=0){s.m.visible=false;continue}s.t-=dt;const k=clamp(1-s.t/s.T,0,1);s.m.quaternion.copy(G3.cam.quaternion);s.m.rotateZ(s.r+k*.7);
  s.m.scale.setScalar((s.big?.56:.37)*(.3+k*.9));s.m.material.opacity=.75*(1-k);s.m.material.color.setHex(k<.35?0xfff2dc:0xe8c890)}}
/* ---------- the lock-on mark: four amber pointers that close in round your target and turn slowly, and a gem bobbing over it ---------- */
function mkLock(sc){const g=new TH.Group();g.visible=false;sc.add(g);G3.lock=g;const tg=new TH.BufferGeometry();tg.setAttribute('position',new TH.Float32BufferAttribute([0,0,0,-.1,.2,0,.1,.2,0],3));
  const mk=c=>new TH.MeshBasicMaterial({color:c,transparent:true,depthTest:false,depthWrite:false,fog:false,side:TH.DoubleSide});
  G3.lockP=[0,1,2,3].map(()=>{const p=new TH.Group(),o=new TH.Mesh(tg,mk(0x3a1a04));o.scale.set(1.5,1.35,1);o.position.y=-.03;o.renderOrder=21;const m=new TH.Mesh(tg,mk(0xffc23a));m.renderOrder=22;p.add(o,m);g.add(p);return p});
  G3.lockGem=new TH.Mesh(new TH.OctahedronGeometry(.09,0),new TH.MeshBasicMaterial({color:0xffd86a,transparent:true,depthTest:false,depthWrite:false,fog:false}));G3.lockGem.scale.y=1.5;G3.lockGem.renderOrder=22;G3.lockGem.visible=false;sc.add(G3.lockGem)}
function lockTick(dt){const lk=lockT&&!lockT.dead&&E.includes(lockT)&&state==='play'?lockT:null;G3.lock.visible=G3.lockGem.visible=!!lk;if(!lk){G3.lockFor=null;return}
  if(G3.lockFor!==lk){G3.lockFor=lk;G3.lockK=0}G3.lockK=Math.min(1,G3.lockK+dt*5);const[gx,gz]=gpos(lk.x,lk.y),gy=groundY(lk.x,lk.y),big=lk.k==='boss',k=cs(G3.lockK);
  G3.lock.position.set(gx,gy+(big?1.4:.62),gz);G3.lock.quaternion.copy(G3.cam.quaternion);const rad=(big?1.2:.52)*(2-k)+Math.sin(T*6)*.015,sp=T*1.1;
  G3.lockP.forEach((p,i)=>{const a=sp+i*Math.PI/2;p.position.set(Math.cos(a)*rad,Math.sin(a)*rad,0);p.rotation.z=a-Math.PI/2;for(const m of p.children)m.material.opacity=k});
  G3.lockGem.position.set(gx,gy+(big?2.9:1.42)+Math.sin(T*6)*.06,gz);G3.lockGem.rotation.y=T*3;G3.lockGem.material.opacity=k}
/* which meshes take part in shadows: everything solid. Glows, effects, water and the soft blobs under people don't */
function shadowAll(o){o.traverse(m=>{if(!m.isMesh||m.geometry===SHG)return;const mt=m.material;if(!mt||Array.isArray(mt)||mt.isMeshBasicMaterial||mt.isShaderMaterial||(mt.transparent&&!mt.depthWrite))return;m.castShadow=m.receiveShadow=true});return o}
function sunShadow(L,size,box){L.castShadow=true;L.shadow.mapSize.set(size,size);const c=L.shadow.camera;c.left=c.bottom=-box;c.right=c.top=box;c.near=1;c.far=70;c.updateProjectionMatrix();L.shadow.bias=-.0004;L.shadow.normalBias=.022}
/* the sun's shadows cover a square around what the camera is looking at; moved in whole shadow pixels so edges don't crawl */
function aimSun(L,x,y,z,box,size){const st=box*2/size;x=Math.round(x/st)*st;z=Math.round(z/st)*st;L.target.position.set(x,y,z);L.position.set(x+SUND.x*30,y+SUND.y*30,z+SUND.z*30);L.target.updateMatrixWorld()}
function aimSun3D(){if(!SHADOWS||!room)return;const[px,pz]=gpos(P.x,P.y),fx=G3.camLook.x-G3.camPos.x,fz=G3.camLook.z-G3.camPos.z,fl=Math.hypot(fx,fz)||1;aimSun(G3.sun,px+fx/fl*3,groundY(P.x,P.y),pz+fz/fl*3,10,2048)}
function setShadows(v){SHADOWS=v;try{localStorage.setItem('hollowmere-shadows',v?'on':'off')}catch(e){}if(G3.r)G3.r.shadowMap.enabled=v;SHM.opacity=v?.1:.3;
  for(const sc of[G3.scene,CINE.sc])if(sc)sc.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true)})}
function glInit(){let r;try{r=new TH.WebGLRenderer({canvas:$('#gl'),antialias:true,powerPreference:'default'})}catch(e){G3.fail=1;return}
  r.setPixelRatio(1);G3.r=r;postInit();glSize();r.shadowMap.enabled=SHADOWS;r.shadowMap.type=TH.PCFSoftShadowMap;const sc=new TH.Scene();G3.scene=sc;G3.cam=new TH.PerspectiveCamera(60,1,.08,95);
  G3.hemi=new TH.HemisphereLight(0xffffff,0x5a5040,.75);sc.add(G3.hemi);G3.sun=new TH.DirectionalLight(0xfff0d8,.7);G3.sun.position.set(-4,10,3);sc.add(G3.sun);sunShadow(G3.sun,2048,10);sc.add(G3.sun.target);
  G3.pl=[];for(let n=0;n<6;n++){const l=new TH.PointLight(0xffa050,0,6,1.4);sc.add(l);G3.pl.push(l)}
  sc.fog=new TH.Fog(0x9ac8e8,12,32);
  const sg=new TH.SphereGeometry(80,14,8);sg.setAttribute('color',new TH.Float32BufferAttribute(new Float32Array(sg.attributes.position.count*3),3));
  G3.sky=new TH.Mesh(sg,new TH.MeshBasicMaterial({vertexColors:true,side:TH.BackSide,fog:false,depthWrite:false}));G3.sky.renderOrder=-10;sc.add(G3.sky);
  const sp=[];for(let n=0;n<260;n++){const a=Math.random()*TAU,e=Math.random()*1.3+.12;sp.push(Math.cos(a)*Math.cos(e)*75,Math.sin(e)*75,Math.sin(a)*Math.cos(e)*75)}
  const stg=new TH.BufferGeometry();stg.setAttribute('position',new TH.Float32BufferAttribute(sp,3));G3.stars=new TH.Points(stg,new TH.PointsMaterial({color:0xffffff,size:1.4,sizeAttenuation:false,fog:false,transparent:true,depthWrite:false}));sc.add(G3.stars);
  G3.moon=new TH.Mesh(new TH.CircleGeometry(4,12),new TH.MeshBasicMaterial({color:0xeae6d0,fog:false,transparent:true,depthWrite:false}));sc.add(G3.moon);
  G3.world=new TH.Group();sc.add(G3.world);G3.ents=new TH.Group();sc.add(G3.ents);
  G3.hero=mkHero();sc.add(G3.hero.root);shadow(G3.hero.root,.3);shadowAll(G3.hero.root);G3.trailR=mkTrail(sc);
  mkLock(sc);
  G3.chain=new TH.Mesh(GEO.box,mat('#6a6a72'));G3.chain.visible=false;sc.add(G3.chain);
  /* spores drifting in the air around you */
  const mp=[];for(let n=0;n<70;n++)mp.push((Math.random()-.5)*18,Math.random()*7,(Math.random()-.5)*18);const mg=new TH.BufferGeometry();mg.setAttribute('position',new TH.Float32BufferAttribute(mp,3));
  G3.motes=new TH.Points(mg,new TH.PointsMaterial({color:0xb4a486,size:1.3,sizeAttenuation:false,transparent:true,opacity:.3,depthWrite:false}));G3.motes.visible=false;sc.add(G3.motes)}
function moveMotes(dt){if(!G3.motes.visible)return;const p=G3.motes.geometry.attributes.position,a=p.array,c=G3.cam.position;for(let i=0;i<a.length;i+=3){a[i]+=Math.sin(T*.3+i)*dt*.15;a[i+1]+=dt*(.08+(i%7)*.02);a[i+2]+=Math.cos(T*.25+i)*dt*.15;
    if(a[i]<c.x-9)a[i]+=18;else if(a[i]>c.x+9)a[i]-=18;if(a[i+2]<c.z-9)a[i+2]+=18;else if(a[i+2]>c.z+9)a[i+2]-=18;if(a[i+1]>c.y+4)a[i+1]-=8;else if(a[i+1]<c.y-4)a[i+1]+=8}p.needsUpdate=true}
const lerpC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const toHex=c=>(clamp(c[0]*255|0,0,255)<<16)|(clamp(c[1]*255|0,0,255)<<8)|clamp(c[2]*255|0,0,255);
function setSky(top,hor){const g=G3.sky.geometry,p=g.attributes.position.array,c=g.attributes.color.array;for(let i=0;i<p.length/3;i++){const t=clamp(p[i*3+1]/80,0,1),k=Math.pow(t,.55),cc=lerpC(hor,top,k);c[i*3]=cc[0];c[i*3+1]=cc[1];c[i*3+2]=cc[2]}g.attributes.color.needsUpdate=true}
let skyKey='';
/* the hour: one valley day lasts twelve minutes of play */
/* nights are short: about a third of the day */
function dayLight(){const p=(S.v.time/720+.3)%1,sh=Math.sin(p*TAU),L=clamp((sh+.6)/.45,0,1),D=clamp(1-Math.abs(sh+.32)/.3,0,1)*(sh<.1?1:0);return{p,sh,L,D}}
function lightScene(){const sc=G3.scene,out=room&&room.outdoors;
  if(out){const f=S.v.flames.filter(Boolean).length;if(skyKey!=='tree'){setSky(col3('#0a0503'),col3('#2e1e12'));skyKey='tree'}
    sc.background=null;G3.sky.visible=true;sc.fog.color.setHex(0x2e1e12);sc.fog.near=7+f*2.5;sc.fog.far=24+f*5;
    /* the tree breathes: the light swells and falls very slowly */
    const br=1+Math.sin(T*.8)*.05;G3.hemi.intensity=(SHADOWS?.48:.64)*br;G3.hemi.color.setHex(0xe6d6c0);G3.hemi.groundColor.setHex(0x30241a);G3.sun.intensity=SHADOWS?.72:.4;G3.sun.color.setHex(0xf0caa0);
    G3.stars.visible=true;G3.stars.material.color.setHex(0xc09a70);G3.stars.material.opacity=.2;G3.moon.visible=false;G3.night=0;G3.motes.visible=true}
  else{G3.sky.visible=false;G3.stars.visible=false;G3.moon.visible=false;G3.motes.visible=false;G3.hemi.groundColor.setHex(0x5a5040);const dark=room&&room.dark,T2=THEMES[room?room.theme:'cave']||THEMES.cave,bg=dark?[0,0,0]:mulc(col3(T2.w||'#000000'),.25);sc.background=new TH.Color(toHex(bg));sc.fog.color.setHex(toHex(bg));
    sc.fog.near=dark?4:10;sc.fog.far=dark?13:26;G3.hemi.intensity=dark?.07:(room&&room.theme==='house'?(SHADOWS?.68:.85):(SHADOWS?.54:.7));G3.hemi.color.setHex(0xf2ece4);G3.sun.intensity=dark?0:(SHADOWS?.5:.25);G3.night=dark?1:0}}
/* up to six point lights: your lantern in the dark, torches, fire, glowing things */
function placeLights(list){const out=[];if(room&&(room.dark||(room.outdoors&&G3.night>.45&&S.v.items.lantern))&&state!=='title'){const[gx,gz]=gpos(P.x,P.y);out.push([gx,groundY(P.x,P.y)+1.1,gz,0xffd8a0,room.dark?(S.v.items.lantern?1.6:1.1):.8,S.v.items.lantern?7:4])}
  const[px,pz]=gpos(P.x,P.y);list.sort((a,b)=>Math.hypot(a[0]-px,a[2]-pz)-Math.hypot(b[0]-px,b[2]-pz));for(const l of list){if(out.length>=6)break;out.push(l)}
  G3.pl.forEach((l,n)=>{const d=out[n];if(!d){l.intensity=0;return}l.position.set(d[0],d[1],d[2]);l.color.setHex(d[3]);l.intensity=d[4]*(1+Math.sin(T*13+n)*.06);l.distance=d[5]||6})}

/* ---------- which rooms are standing: outdoors the screens around you, inside just the one ---------- */
const gpos=(x,y)=>[room.rx*12+x/16,room.ry*12+y/16];
let SHSET=null;const SHARED=()=>SHSET||(SHSET=new Set([...Object.values(GEO),flameGeo,flameGeo2,SHAFTG]));
const rsig=r=>r.t.map(a=>a.join('')).join('')+'|'+(r.crys||0)+'|'+S.v.flames.filter(Boolean).length;
function syncWorld(){if(!room)return;const want=new Map();
  if(room.outdoors)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=room.rx+dx,y=room.ry+dy;if(x<0||y<0||x>=OW.w||y>=OW.h)continue;want.set('ow:'+x+','+y,dx===0&&dy===0?room:null)}
  else want.set(room.map+':'+room.rx+','+room.ry,room);
  for(const[k,c]of G3.cache){if(!want.has(k)){G3.world.remove(c.group);c.group.traverse(o=>{if(o.geometry&&!SHARED().has(o.geometry))o.geometry.dispose()});G3.cache.delete(k)}}
  for(const[k,live]of want){let c=G3.cache.get(k);const[mp,xy]=k.split(':'),[x,y]=xy.split(',').map(Number);const r=live||(c&&c.room)||buildRoom(mp,x,y);if(live&&!r.hc)r.hc=heights(r);const sig=rsig(r);
    if(c&&c.sig===sig){c.room=r;continue}if(c){G3.world.remove(c.group);c.group.traverse(o=>{if(o.geometry&&!SHARED().has(o.geometry))o.geometry.dispose()})}
    const m=buildRoomMesh(r);shadowAll(m.group);G3.world.add(m.group);G3.cache.set(k,{group:m.group,anim:m.anim,lights:m.lights,sig,room:r})}}

/* ---------- things in the room: made when they appear, posed every frame, dropped when they go ---------- */
const ICONTEX={};
const iconTex=k=>{if(!ICON[k])return null;let t=ICONTEX[k];if(!t){t=new TH.CanvasTexture(ICON[k]);t.magFilter=t.minFilter=TH.NearestFilter;t.generateMipmaps=false;ICONTEX[k]=t}return t};
const sprite=(k,s)=>{const m=new TH.Sprite(new TH.SpriteMaterial({map:iconTex(k),transparent:true}));m.scale.set(s,s,1);return m};
function textSprite(txt,col){const c=mkCanvas(32,8),x=c.getContext('2d');digits(x,txt,1,1,col||'#ffd23f');const t=new TH.CanvasTexture(c);t.magFilter=t.minFilter=TH.NearestFilter;t.generateMipmaps=false;const m=new TH.Sprite(new TH.SpriteMaterial({map:t,transparent:true}));m.scale.set(1.2,.3,1);return m}
const blockMats={};
function mkEnt(e){const g=new TH.Group(),u={};g.userData=u;switch(e.k){
  case 'foe':{const m=mkFoeModel(e.type);m.scale.set(FOE_W,FOE_H,FOE_W);g.add(m);u.m=m;if(!e.fly)shadow(g,.3*FOE_W);else shadow(g,.2*FOE_W);u.st=mkStars(g,1.15*FOE_H,1);break}
  case 'boss':{const m=mkBossModel(e);g.add(m);u.m=m;if(e.kind!=='hush')u.sh=shadow(g,e.hw/16+.25);u.st=mkStars(g,e.kind==='golem'?2.3:1.7,2);break}
  case 'npc':{const h=mkNpc(e.id);g.add(h.root);u.h=h;shadow(g,(CHAR[e.id]||CHAR._).hw/16*1.1+.12);break}
  case 'ware':{pc('box','#7a5432',0,.25,0,.6,.5,.5,g);const s=sprite(WARES[e.it].icon,.55);s.position.y=.85;g.add(s);const p=textSprite(e.price);p.position.y=1.25;g.add(p);break}
  case 'pickup':{if(e.it==='shard'||e.it==='shard5'){u.s=pc('octa',bmat(e.it==='shard'?'#4ae08a':'#4aa8ff'),0,.35,0,.12,.2,.12,g)}else if(e.it==='flame'){const f=mkFlame(1.6);f.position.y=.3;g.add(f);u.s=f}
    else{const k={heart:'heart',seeds1:'seeds',bombs1:'bombs',piece:'piece',container:'container'}[e.it]||'shard',s=sprite(k,e.it==='container'||e.it==='piece'?.7:.42);s.position.y=.4;g.add(s);u.s=s}shadow(g,.18);break}
  case 'block':{const th=room.theme;let m=blockMats[th];if(!m)m=blockMats[th]=new TH.MeshLambertMaterial({map:TEX.stone,color:toHex(mulc(col3((THEMES[th]||THEMES.cave).wt||'#a8a8a8'),1.2))});const b=new TH.Mesh(GEO.box,m);b.scale.set(.96,.96,.96);b.position.y=.48;g.add(b);pc('box','#2a2a2a',0,.97,0,.5,.02,.5,g);break}
  case 'seed':pc('ico',e.mine?'#c8a87a':'#8ae06a',0,0,0,.07,.07,.07,g);break;
  case 'spit':pc('ico',bmat('#8ae06a'),0,0,0,.09,.09,.09,g);break;
  case 'orb':pc('ico1',bmat('#e8d8ff'),0,0,0,.09,.09,.09,g);pc('ico1',bmat('#b48cff',{transparent:true,opacity:.35}),0,0,0,.2,.2,.2,g);break;
  case 'rock':pc('dode','#8a8a7a',0,0,0,.24,.24,.24,g);shadow(g,.2);break;
  case 'hookhead':pc('cone4','#c8ccd8',0,0,0,.08,.2,.08,g,Math.PI/2);break;
  case 'bomb':{u.b=pc('ico1','#2a2a4a',0,.18,0,.17,.17,.17,g);pc('cyl6','#c8a060',0,.38,0,.03,.08,.03,g);u.sp=pc('ico',bmat('#ffd23f'),0,.44,0,.04,.04,.04,g);shadow(g,.18);break}
  case 'blast':u.s=pc('ico1',bmat('#ffb43a',{transparent:true,opacity:.8,depthWrite:false}),0,.5,0,1,1,1,g);u.c=pc('ico1',bmat('#fff8d0',{transparent:true,opacity:.9,depthWrite:false}),0,.5,0,.5,.5,.5,g);break;
  case 'puff':for(let n=0;n<5;n++)pc('ico',bmat(n%2?'#ffd23f':'#ff6a1a',{transparent:true,opacity:.9}),0,.5,0,.12,.12,.12,g);break;
  case 'fx':pc('box',bmat(e.c||'#ffffff'),0,0,0,.07,.07,.07,g);break;
  case 'wave':{u.r=new TH.Mesh(new TH.TorusGeometry(1,.06,3,24),bmat('#c8e6ff',{transparent:true,opacity:.75}));u.r.rotation.x=Math.PI/2;g.add(u.r);break}
  case 'shock':{u.r=new TH.Mesh(new TH.TorusGeometry(1,.1,3,20),bmat('#e6d2aa',{transparent:true,opacity:.7}));u.r.rotation.x=Math.PI/2;g.add(u.r);break}
  case 'spike':{u.w=pc('cyl8','#5a3a1e',0,.02,0,.4,.02,.4,g,0,0,0,{transparent:true,opacity:.6});u.s=grp(g,0,0,0);for(let n=-1;n<=1;n++)pc('cone4','#8a6a4a',n*.3,.35,0,.1,.7,.1,u.s);break}
  case 'dust':u.s=pc('ico1',bmat('#e6dcb4',{transparent:true,opacity:.3,depthWrite:false}),0,.6,0,.75,.55,.75,g);break;
  case 'part':{u.s=grp(g,0,0,0);for(let n=0;n<4;n++)pc('cyl6','#7a4a9a',Math.sin(n)*.05,n*.3+.15,0,.16-n*.025,.32,.16-n*.025,u.s);pc('ico1','#b88ad8',0,1.25,0,.12,.12,.12,u.s);break}
  default:return null}return g}
const faceTo=(m,ax,ay)=>{m.rotation.y=Math.PI/2-Math.atan2(ay,ax)};
const walkPose=(h,ph,amt)=>{const s=Math.sin(ph)*amt;h.legs[0].rotation.x=s*.8;h.legs[1].rotation.x=-s*.8;h.arms[0].rotation.x=-s*.6;h.arms[1].rotation.x=s*.6;if(h.knees)kneesFollow(h)};
function poseEnt(e,g,dt){const u=g.userData,[gx,gz]=gpos(e.x,e.y),gy=groundY(e.x,e.y);g.position.set(gx,gy,gz);g.visible=true;
  switch(e.k){
  case 'foe':{const m=u.m,mu=m.userData;if(e.inv>0&&Math.floor(T*20)%2)g.visible=false;u.st.visible=e.stun>0;u.st.rotation.y=T*5;
    const mvx=e.vx||0,mvy=e.vy||0,toP=[P.x-e.x,P.y-e.y];
    if(e.type==='bat'||e.type==='moth'){mu.body.position.y=.9+Math.sin(e.an*4)*.12;mu.w[0].rotation.z=Math.sin(e.an*30)*.8;mu.w[1].rotation.z=-Math.sin(e.an*30)*.8;faceTo(m,mvx||toP[0],mvy||toP[1])}
    else if(mu.h){faceTo(m,toP[0],toP[1]);if(e.type==='knight'){const d={up:-Math.PI/2,down:Math.PI/2,left:Math.PI,right:0}[e.dir];m.rotation.y=Math.PI/2-d}animCreature(e,mu,dt)}
    else if(e.type==='wisp'){faceTo(m,toP[0],toP[1]);mu.c.position.y=.8+Math.sin(e.an*4)*.08;mu.c.rotation.z=Math.sin(e.an*2.3)*.15;m.position.y=Math.sin(e.an*2)*.1;mu.jaw.rotation.x=Math.abs(Math.sin(e.an*11))*.4;
      mu.fl.forEach((f,n)=>{const k=.75+Math.abs(Math.sin(e.an*9+n*1.7))*.5;f.scale.set(.055*(2-k),f.userData.h*k,.055*(2-k))})}
    else if(e.type==='spinner')mu.s.rotation.y+=dt*14;break}
  case 'npc':animNpc(e,g,dt);break;
  case 'ware':g.rotation.y=0;break;
  case 'pickup':{if(e.life&&e.t>e.life-2&&Math.floor(T*10)%2)g.visible=false;if(u.s){u.s.position.y=.38+Math.sin(T*3+e.x)*.06;if(e.it==='shard'||e.it==='shard5')u.s.rotation.y=T*3}break}
  case 'block':break;
  case 'seed':case 'spit':case 'orb':case 'hookhead':g.position.y=gy+.55;if(e.k==='hookhead'&&(e.fx||e.fy))faceTo(g,e.fx,e.fy);break;
  case 'rock':g.position.y=gy+.6+Math.sin(clamp(e.t,0,1)*Math.PI)*.3;break;
  case 'bomb':{const f=e.t<.6&&Math.floor(T*16)%2;u.b.material=f?mat('#e84a3a'):mat('#2a2a4a');u.sp.visible=Math.floor(T*20)%2===0;break}
  case 'blast':{const k=1-e.t/.4;u.s.scale.setScalar(.5+k*1.3);u.s.material.opacity=.8*(1-k);u.c.scale.setScalar(.3+k*.6);break}
  case 'puff':{const k=1-e.t/.35;g.children.forEach((c,n)=>{const a=n*1.3+T*4;c.position.set(Math.cos(a)*k*.4,.5+k*.4+(n%2)*.1,Math.sin(a)*k*.4);c.scale.setScalar(.14*(1-k*.6))});break}
  case 'fx':{const k=e.t0?1-e.t/e.t0:0;if(!e.h0){e.h0=.5+Math.random()*.4;e.t0=e.t}g.position.y=gy+e.h0+Math.sin(clamp(1-e.t/e.t0,0,1)*Math.PI)*.5;break}
  case 'wave':u.r.scale.set(e.r/16,e.r/16,1);g.position.y=gy+.2;break;
  case 'shock':{const s=e.r*(1-e.t/e.t0*.6)/16;u.r.scale.set(s,s,1);u.r.material.opacity=e.t/e.t0;g.position.y=gy+.1;break}
  case 'spike':u.s.position.y=e.t<.5?0:-.7;u.s.visible=e.t<.5;break;
  case 'dust':u.s.material.opacity=Math.min(.35,e.t*.18);break;
  case 'part':{const up=e.up?1:Math.max(0,e.t>2.6?(3-e.t)/.4:e.t/.3);u.s.scale.set(1,Math.max(.01,up),1);u.s.position.y=-(1-up)*.3;if(e.inv>0&&Math.floor(T*20)%2)g.visible=false;break}
  case 'boss':poseBoss(e,g,dt);break}}
function poseBoss(b,g,dt){const u=g.userData,m=u.m,mu=m.userData,fl=b.inv>0&&Math.floor(T*20)%2;g.visible=!fl||b.kind==='hush';const stun=b.st==='dazed'||b.st==='flipped'||b.st==='down'||b.st==='stunned';u.st.visible=stun;u.st.rotation.y=T*5;
  switch(b.kind){
  case 'beetle':{const d={up:-Math.PI/2,down:Math.PI/2,left:Math.PI,right:0}[b.dir];m.rotation.y=Math.PI/2-d;const fl2=b.st==='flipped';mu.b.rotation.z=fl2?Math.PI:0;mu.b.position.y=fl2?.7:.55;
    const sp=b.st==='charge'?30:10;mu.legs.forEach((l,n)=>l.rotation.y=Math.sin(T*sp+n)*.35);mu.eye.material=b.st==='aim'&&Math.floor(T*10)%2?bmat('#ffffff'):bmat('#ff3a2a');break}
  case 'bell':{const down=b.st==='down';mu.b.position.y=down?.55:1.1+b.z/16*.5;mu.b.rotation.z=down?.5:Math.sin(T*3)*.08+(b.st==='ring'?Math.sin(T*40)*.15:0);faceTo(m,P.x-b.x,P.y-b.y);break}
  case 'moth':{const st=b.st==='stunned';mu.b.position.y=st?.25:.6+b.z/16;mu.w[0].rotation.z=Math.sin(T*(st?2:18))*.5;mu.w[1].rotation.z=-Math.sin(T*(st?2:18))*.5;faceTo(m,b.dvx||P.x-b.x,b.dvy||P.y-b.y);break}
  case 'golem':{faceTo(m,P.x-b.x,P.y-b.y);const st=b.st==='stomp'?Math.sin((1-b.t/.6)*Math.PI)*.4:0;mu.t.position.y=1.05+st;mu.arms.forEach((a,n)=>a.rotation.x=b.st==='stomp'?-2.2*Math.sin((1-b.t/.6)*Math.PI):Math.sin(T*3+n*3)*.3);
    mu.legs.forEach((l,n)=>l.rotation.x=b.st==='walk'?Math.sin(T*4+n*Math.PI)*.4:0);const cr=b.st==='cracked';mu.core.visible=cr;mu.crack.visible=cr;if(cr)mu.core.scale.setScalar(.22+Math.sin(T*10)*.03);break}
  case 'hush':{const[ox,oz]=[room.rx*12,room.ry*12];g.position.set(ox,0,oz);const L=(x,y)=>[x/16,y/16];
    const fy=b.phase===1?80:b.y;mu.fog.forEach((f,n)=>{f.position.set(b.x/16+Math.sin(T+n)*.6,1.6+Math.cos(T*1.3+n)*.3,fy/16+Math.cos(T*.9+n)*.4)});
    mu.masks.forEach((mk,n)=>{const ms=b.masks&&b.masks[n];mk.visible=b.phase===1&&ms&&ms.gone<=0&&ms.x!=null;if(!mk.visible)return;mk.position.set(ms.x/16,1.3+Math.sin(T*2+n)*.1,ms.y/16);faceTo(mk,P.x-ms.x,P.y-ms.y);
      const lit=Math.hypot(ms.x-P.x,ms.y-P.y)<(S.v.items.lantern?60:30);mk.userData.e.forEach(e=>e.visible=ms.real&&lit)});
    mu.face.visible=b.phase>1;if(b.phase>1){mu.face.position.set(b.x/16,b.phase===2?2.8:(b.st==='open'?1.6:2.3)+Math.sin(T*2)*.08,b.y/16);faceTo(mu.face,P.x-b.x,P.y-b.y);mu.core.visible=b.phase===3&&b.st==='open';if(fl)mu.face.visible=Math.floor(T*20)%2===0}
    mu.veil.visible=b.phase===2;if(b.phase===2){mu.veil.position.set(6,1.3,3.6);const p=mu.veil.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*.8+T*3)*.25);p.needsUpdate=true}
    mu.hands.forEach((h,n)=>{const hd=b.hands&&b.hands[n];h.visible=b.phase===3&&!!hd;if(!h.visible)return;const hh=hd.st==='hover'?1.7:hd.st==='fall'?.9:.12;h.position.set(hd.x/16,hh,(hd.st==='hover'?hd.y+26:hd.y)/16);h.children.forEach(c=>c.material=hd.st==='pinned'?mat('#3a2e22'):mat('#5a4632'))});
    u.st.visible=false;break}}}

/* ---------- you ---------- */
function poseHero(dt){const h=G3.hero,[gx,gz]=gpos(P.x,P.y);let y=groundY(P.x,P.y);h.root.visible=state!=='title'||true;
  h.root.position.set(gx,y,gz);h.root.rotation.y=Math.PI/2-P.ang;h.root.scale.setScalar(1);h.body.rotation.set(0,0,0);h.body.position.y=.42+Math.sin(T*2)*.006;
  for(const l of h.legs)l.rotation.set(0,0,0);for(const a of h.arms)a.rotation.set(0,0,0);if(h.knees)h.knees.forEach(k=>k.rotation.x=.04);
  const mv=state==='play'?Math.hypot(moveV[0],moveV[1]):0,moving=mv>.2&&P.swing<=0&&P.roll<=0&&P.spin<=0&&!(P.jump>0);if(moving)walkPose(h,P.anim*7,Math.min(1,mv));
  const hasS=!!S.v.sword,charging=held.b&&P.charge>.15&&hasS&&P.swing<=0&&P.spin<=0,sw=P.swing>0||P.spin>0||P.jump>0||charging;
  h.sword.visible=hasS&&sw;h.back.visible=hasS;h.backHilt.visible=!sw;h.shield.visible=!!S.v.flags.shield;h.hook.visible=P.st==='hook';h.trail.visible=false;h.held.visible=false;
  h.bladeG.scale.y=S.v.sword>=2?1.14:1;{const fl=charging&&P.charge>=.7&&Math.floor(T*12)%2;h.bladeMat.color.setHex(fl?0xf4f4f4:S.v.sword>=2?0xe6dcb8:0xd6dade);h.bladeMat.emissive.setHex(fl?0x4a4a4a:S.v.sword>=2?0x2a1004:0)}
  if(P.swing>0){const k=1-P.swing/.22;h.arms[1].rotation.set(-1.45,1.3-k*2.7,0)}
  if(P.spin>0){const k=1-P.spin/.32;h.root.rotation.y+=k*TAU;h.arms[1].rotation.set(-1.5,-1.4,0)}
  if(charging){h.arms[1].rotation.set(-.5,-1.1,0)}
  if(P.roll>0){const k=1-P.roll/.24;h.body.rotation.x=k*TAU;h.legs.forEach(l=>l.rotation.x=-1.2);h.arms.forEach(a=>a.rotation.x=-1.4);if(h.knees)h.knees.forEach(n=>n.rotation.x=1.6)}
  /* the leap: up with the sword held high over the head, down with it as you land */
  if(P.jump>0){const k=1-P.jump/.44,air=Math.sin(Math.min(1,k/.86)*Math.PI);h.root.position.y=y+air*.62;h.body.rotation.x=k<.6?-.15:cl(-.15,.5,cs(cp(k,.6,.86)));
    h.legs.forEach(l=>l.rotation.x=-.9*air);if(h.knees)h.knees.forEach(n=>n.rotation.x=1.5*air+.04);h.arms[1].rotation.set(k<.6?-2.9:cl(-2.9,-.5,cs(cp(k,.6,.86))),0,0);h.arms[0].rotation.set(-.9,0,.3)}
  if(P.st==='hook')h.arms[1].rotation.set(-1.5,0,0);
  if(P.hold>0&&P.holdIt){h.arms[0].rotation.x=-2.9;h.arms[1].rotation.x=-2.9;const t=iconTex(P.holdIt);if(t){h.held.material.map=t;h.held.material.needsUpdate=true;h.held.visible=true}}
  if(P.fall>0){const k=1-P.fall/.5;h.root.position.y=y-k*2.2;h.root.scale.setScalar(1-k*.5)}
  h.tail.rotation.x=.35+Math.sin(T*8)*(moving?.25:.05);h.cape.rotation.x=moving?.3+Math.sin(T*9)*.05:.06;
  if(P.inv>0&&P.fall<=0&&Math.floor(T*14)%2&&state==='play')h.root.visible=false;else h.root.visible=true;
  for(const ch of h.root.children)if(ch.geometry===SHG)ch.visible=!(P.jump>0)&&P.fall<=0;
  /* the hero blinks too */
  G3.blink=(G3.blink==null?3:G3.blink)-dt;const shut=G3.blink<0;if(G3.blink<-.13)G3.blink=2.5+Math.random()*3.5;if(h.fx&&h.fx.headMesh){const f=h.fx.faces[shut?1:0];if(h.fx.headMesh.material.map!==f)h.fx.headMesh.material=cmat('#ffffff',f)}}

/* ---------- the camera: behind you, swinging round slowly as you turn, pulled in by walls ---------- */
function tallAt(gx,gz){const sx=Math.floor(gx/12),sz=Math.floor(gz/12);let r=null;if(room&&sx===room.rx&&sz===room.ry)r=room;else{const c=G3.cache.get(room.map+':'+sx+','+sz);r=c&&c.room}
  if(!r)return room.outdoors?2:0;const i=Math.floor(gx)-sx*12,j=Math.floor(gz)-sz*12,c=r.t[j]&&r.t[j][i];if(c==null)return 0;if('#hHGd'.includes(c)||(c==='R'&&(r.theme==='crag'||r.theme==='ash')&&(i<2||j<2||i>9||j>9)))return 1;return'TN'.includes(c)?2:0}
/* walls and houses push the camera in from any distance; trees only when they are right behind you (further back they dissolve) */
const camHit=(x,z,s)=>tallAt(x,z)===1;
function camUpdate(dt){if(!room)return;const cam=G3.cam,[px,pz]=gpos(P.x,P.y),py=groundY(P.x,P.y);
  if(state==='title'){const a=T*.08;cam.position.set(px+Math.cos(a)*8,py+3.6,pz+Math.sin(a)*8);cam.lookAt(px,py+1,pz);G3.snap=true;return}
  const lk=lockT&&!lockT.dead&&E.includes(lockT)?lockT:null;
  if(state==='play'){if(lk){const ta=Math.atan2(lk.y-P.y,lk.x-P.x);camYaw+=angD(ta,camYaw)*Math.min(1,dt*6)}
    else if(camSnap>0){camSnap-=dt;camYaw+=angD(P.ang,camYaw)*Math.min(1,dt*12)}
    else{const mv=Math.hypot(moveV[0],moveV[1]);if(mv>.2){const d=angD(P.ang,camYaw);if(Math.abs(d)<2.35)camYaw+=d*Math.min(1,dt*1.5*mv)}}}
  let dist=CAM_DIST,hgt=1.6;const fx=Math.cos(camYaw),fz=Math.sin(camYaw);let cx=px-fx*dist,cz=pz-fz*dist;
  if(room.outdoors){let d=dist;const qx=-fz,qz=fx;for(let s=.6;s<=dist+.4;s+=.2){const w=Math.min(.7,s*.25);if(camHit(px-fx*s,pz-fz*s,s)||camHit(px-fx*s+qx*w,pz-fz*s+qz*w,s)||camHit(px-fx*s-qx*w,pz-fz*s-qz*w,s)){d=Math.max(1.3,s-.55);break}}
    if(d<G3.camDist)G3.camDist=d;else G3.camDist+=(d-G3.camDist)*Math.min(1,dt*2.5)}
  else{const ox=room.rx*12,oz=room.ry*12;let d=dist;const lim=(v,a,b)=>v<a||v>b;for(let s=.4;s<=dist;s+=.1){const x=px-fx*s,z=pz-fz*s;if(lim(x-ox,-1.2,13.2)||lim(z-oz,-1.2,13.2)){d=Math.max(1.2,s-.1);break}}if(d<G3.camDist)G3.camDist=d;else G3.camDist+=(d-G3.camDist)*Math.min(1,dt*3)}
  const cd=G3.camDist;hgt+=(dist-cd)*.45;cx=px-fx*cd;cz=pz-fz*cd;const want=new TH.Vector3(cx,py+hgt,cz);
  let look=new TH.Vector3(px,py+.8,pz);if(lk){const[tx,tz]=gpos(lk.x,lk.y);look.set((px+tx)/2,py+.7,(pz+tz)/2)}
  const tk=talkCam(px,pz,py);if(tk){want.copy(tk[0]);look.copy(tk[1])}
  if(G3.snap){G3.camPos.copy(want);G3.camLook.copy(look);G3.snap=false}else{G3.camPos.lerp(want,Math.min(1,dt*9));G3.camLook.lerp(look,Math.min(1,dt*12))}
  FADE.value=state==='title'?1.5:Math.max(1.6,G3.camPos.distanceTo(G3.camLook)-.7);cam.position.copy(G3.camPos);if(shake>0)cam.position.add(new TH.Vector3((Math.random()-.5)*.25,(Math.random()-.5)*.18,(Math.random()-.5)*.25));cam.lookAt(G3.camLook)}

/* in conversation: an over-the-shoulder shot of whoever is speaking, so you can watch them talk and react.
   It keeps to one side once chosen, and uses the other side if a wall is in the way. */
const _hv=new TH.Vector3();
function talkCam(px,pz,py){if(state!=='dialog'||!DLG||!DLG.vid)return null;const sp=E.find(e=>e.k==='npc'&&e.id===DLG.vid&&!e.dead);if(!sp||Math.hypot(sp.x-P.x,sp.y-P.y)>72)return null;
  const g=G3.live.get(sp);if(!g||!g.userData.h)return null;const hd=g.userData.h.head.getWorldPosition(_hv);
  const[nx,nz]=gpos(sp.x,sp.y);let dx=nx-px,dz=nz-pz;const D=Math.hypot(dx,dz)||1;dx/=D;dz/=D;
  const ox=room.rx*12,oz=room.ry*12,bad=(x,z)=>room.outdoors?camHit(x,z):(x-ox<-1.2||x-ox>13.2||z-oz<-1.2||z-oz>13.2);const pref=sp.talkSide||1;
  /* further away (across a counter): come in a little closer and higher, to see over what's between */
  const far=Math.max(0,D-1.2),back=Math.max(.9,1.45-far*.35),up=far*.5;
  for(const side of[pref,-pref]){const qx=-dz*side,qz=dx*side,cx=px-dx*back+qx*.9,cz=pz-dz*back+qz*.9;if(bad(cx,cz)||bad((cx+px)/2,(cz+pz)/2))continue;sp.talkSide=side;
    return[new TH.Vector3(cx,Math.max(py+.95,hd.y+.22)+up,cz),new TH.Vector3(hd.x-dx*.25,hd.y-.12-up*.3,hd.z-dz*.25)]}
  return null}

/* ---------- one frame of the 3D view ---------- */
let lastR=0;
function render3D(){if(!G3.r){if(!G3.fail)glInit();if(!G3.r)return}const now=performance.now(),dt=Math.min(.05,(now-(lastR||now))/1000);lastR=now;if(!room)return;
  syncWorld();lightScene();
  const lights=[];for(const c of G3.cache.values()){for(const f of c.anim){if(f.userData.kind==='heart'){const sp=1.15-S.v.flames.filter(Boolean).length*.16,b=(T*sp)%1;f.scale.setScalar(1+.08*Math.exp(-Math.pow(b-.1,2)/.003)+.05*Math.exp(-Math.pow(b-.32,2)/.003));continue}
    f.scale.y=f.scale.x*(1+Math.sin(T*18+f.position.x)*.12);f.rotation.y=T*2}lights.push(...c.lights)}
  /* things that glow bring their own light */
  const seen=new Set();for(const e of E){if(e.dead)continue;let g=G3.live.get(e);if(!g){g=mkEnt(e);if(!g)continue;shadowAll(g);G3.ents.add(g);G3.live.set(e,g)}poseEnt(e,g,dt);seen.add(e);const[gx,gz]=gpos(e.x,e.y);
    if(e.k==='puff'||e.k==='blast')lights.push([gx,.8,gz,0xff8a3a,2.2,6]);else if(e.k==='pickup'&&e.it==='flame')lights.push([gx,.9,gz,0xffc060,1.8,6]);else if(e.type==='wisp')lights.push([gx,.9,gz,0x6ac8ff,1.2,4]);else if(e.k==='orb')lights.push([gx,.6,gz,0xb48cff,.9,3])}
  for(const[e,g]of G3.live)if(!seen.has(e)){G3.ents.remove(g);G3.live.delete(e)}
  placeLights(lights);poseHero(dt);
  const hk=E.find(e=>e.k==='hookhead');if(hk){const[gx,gz]=gpos(P.x,P.y),[hx,hz]=gpos(hk.x,hk.y),y0=groundY(P.x,P.y)+.6,a=new TH.Vector3(gx,y0,gz),b=new TH.Vector3(hx,y0-.05,hz),m=a.clone().add(b).multiplyScalar(.5),l=a.distanceTo(b);
    G3.chain.visible=l>.05;G3.chain.position.copy(m);G3.chain.scale.set(.03,.03,Math.max(.01,l));G3.chain.lookAt(b)}else G3.chain.visible=false;
    camUpdate(dt);aimSun3D();lockTick(dt);trailTick();sparkTick(dt);moveMotes(dt);if(G3.sky.visible)G3.sky.position.copy(G3.cam.position);if(G3.stars.visible)G3.stars.position.copy(G3.cam.position);
  TEX.water.offset.set(T*.04,T*.025);TEX.lava.offset.set(T*.03,-T*.02);TEX.pool.offset.set(-T*.02,T*.03);
  present(G3.scene,G3.cam)}
/* ---------- Part 6h: the people of the hollow ----------
   Everyone down here was swallowed by the tree; they are tired, hungry and a little strange from it.
   Every character is built on one low-poly rig (hips, a waist that can hunch, shoulders, a head, a body that can roll),
   dressed in small pixel textures, and given its own silhouette, habits, gait and behaviour. */

/* a head that isn't a ball: longer than wide, a skull rounder at the back, a flatter face with a brow ridge, cheekbones,
   a nose, and a jaw that narrows to a chin. Same texture mapping as a sphere, so painted faces still land in place. */
function sculptHead(){const g=new TH.SphereGeometry(1,18,14),p=g.attributes.position;
  for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    x*=.86;y*=1.12;if(z<0)z*=1.06;else z*=.95;
    if(y<-.12){const k=Math.min(1,(-.12-y)/1.0);x*=1-.44*k;if(z>0){z*=1-.1*k;z+=.07*k*Math.max(0,1-Math.abs(x)*2.2)}else z*=1-.32*k}
    if(z>.45){const d=Math.hypot(x/.17,(y+.1)/.24);if(d<1)z+=.15*(1-d*d);const b=Math.hypot(x/.62,(y-.24)/.09);if(b<1)z+=.045*(1-b*b)}
    if(z>.3&&Math.abs(y+.04)<.2&&Math.abs(x)>.38)x*=1.05;
    p.setX(i,x);p.setY(i,y);p.setZ(i,z)}
  g.computeVertexNormals();return g}
/* ---------- low-poly pieces, smooth-shaded the way N64 models were (pointy bits and gems stay faceted) ---------- */
const flatG=g=>{const n=g.index?g.toNonIndexed():g;n.computeVertexNormals();return n};
const LP={box:new TH.BoxGeometry(1,1,1),cyl5:new TH.CylinderGeometry(1,1,1,7),cyl6:new TH.CylinderGeometry(1,1,1,8),cyl8:new TH.CylinderGeometry(1,1,1,10),
  taper:new TH.CylinderGeometry(.72,1,1,8),cone4:flatG(new TH.ConeGeometry(1,1,4)),cone6:new TH.ConeGeometry(1,1,8),cone8:new TH.ConeGeometry(1,1,10),
  ball:new TH.SphereGeometry(1,10,7),head:new TH.SphereGeometry(1,14,10),headS:sculptHead(),ico:flatG(new TH.IcosahedronGeometry(1,0)),oct:flatG(new TH.OctahedronGeometry(1,0)),
  bell:new TH.CylinderGeometry(.3,1,1,10,1,true),tube:new TH.CylinderGeometry(1,1,1,8,1,true),tor:new TH.TorusGeometry(1,.25,6,12),skirt:new TH.CylinderGeometry(.62,1,1,10,1,true)};

/* ---------- pixel textures: tiny canvases, nearest-neighbour, so the pixels show ---------- */
const PXT={};
function pxt(key,w,h,draw){if(PXT[key])return PXT[key];const c=mkCanvas(w,h),x=c.getContext('2d');const p=(col,a,b,ww,hh)=>{x.fillStyle=col;x.fillRect(a,b,ww||1,hh||1)};
  const oval=(cx,cy,rx,ry,col)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=(i+.5-cx)/rx,dy=(j+.5-cy)/ry;if(dx*dx+dy*dy<=1)p(col,i,j)}};
  const sym=(col,a,b)=>{p(col,a,b);p(col,w-1-a,b)};draw(p,oval,sym,w,h,x);
  const t=new TH.CanvasTexture(c);t.magFilter=t.minFilter=PIC==='retro'?TH.LinearFilter:TH.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=TH.RepeatWrapping;PXT[key]=t;return t}
const shade=(hx,m)=>{const n=parseInt(hx.slice(1),16),f=v=>clamp(Math.round(v*m),0,255).toString(16).padStart(2,'0');return'#'+f(n>>16)+f((n>>8)&255)+f(n&255)};
/* cloth: a base colour with a dither of darker and lighter threads, and maybe stripes, a patch or checks */
function cloth(base,pat,c2){return pxt('cl'+base+(pat||'')+(c2||''),8,8,p=>{const R=rngOf(hashN(parseInt(base.slice(1),16)%9973,(pat||'').length,7));p(base,0,0,8,8);const d=shade(base,.78),l=shade(base,1.18);
  for(let i=0;i<64;i++){const r=R();if(r<.2)p(d,i%8,i>>3);else if(r<.28)p(l,i%8,i>>3)}
  if(pat==='stripe')for(let y=0;y<8;y+=4)p(c2,0,y,8,2);if(pat==='patch'){p(c2,1,1,4,4);for(let i=0;i<4;i++){p('#e8dcc0',1+i,5);p('#e8dcc0',5,1+i)}}
  if(pat==='check')for(let y=0;y<8;y++)for(let x=0;x<8;x++)if(((x>>1)+(y>>1))%2)p(c2,x,y);if(pat==='seam'){for(let y=0;y<8;y+=2)p(c2,3,y)}})}
const CM=new Map();
function cmat(color,tex,o){const k=color+'|'+(tex?tex.uuid:'')+'|'+(o?JSON.stringify(o):'');let m=CM.get(k);if(!m){m=new TH.MeshLambertMaterial(Object.assign({color,map:tex||null},o||{}));CM.set(k,m)}return m}
const glowM=c=>cmat(c,null,{emissive:c,emissiveIntensity:1});
/* metal: the old reflection-map trick. Shiny things show a painted world (sky, a bright horizon, dark ground) that slides
   across them as they turn, multiplied into their lit colour so they still darken in the shade */
const ENVT=(()=>{const c=mkCanvas(64,32),x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,32);
  [[0,'#6a7894'],[.34,'#c8d4e8'],[.47,'#ffffff'],[.52,'#fff4dc'],[.58,'#6e6254'],[1,'#3a3430']].forEach(([o,cc])=>g.addColorStop(o,cc));x.fillStyle=g;x.fillRect(0,0,64,32);
  x.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<4;i++)x.fillRect(i*16+5,7,5,7);x.fillStyle='rgba(40,34,30,.5)';for(let i=0;i<6;i++)x.fillRect(i*11+2,19,6,13);
  const t=new TH.CanvasTexture(c);t.mapping=TH.EquirectangularReflectionMapping;return t})();
const MM=new Map();
function metalM(c,o){o=o||{};const k=c+'|'+(o.r||.85)+'|'+(o.map?o.map.uuid:'');let m=MM.get(k);
  if(!m){m=new TH.MeshPhongMaterial({color:c,map:o.map||null,specular:0x4a4a4a,shininess:28,envMap:ENVT,combine:TH.MultiplyOperation,reflectivity:(o.r||.85)*.6});MM.set(k,m)}return m}
const metalTex=(tex,r)=>metalM('#ffffff',{map:tex,r:r||.6});
/* a sword blade and its point, diamond in section, so the ridge down the middle catches the light */
const BLADEG=flatG(new TH.CylinderGeometry(1,1,1,4,1)),TIPG=flatG(new TH.ConeGeometry(1,1,4));
/* the shield's face: oak boards with nail heads, and the lamp-keeper's flame painted in a gold ring */
function shieldTex(){return pxt('shieldface',32,32,(p,oval)=>{p('#6a4a2c',0,0,32,32);for(let x=0;x<32;x+=6){p('#7a5634',x,0,5,32);p('#553a22',x+5,0,1,32)}
  oval(16,16,11,11,'#e0b860');oval(16,16,9.6,9.6,'#2e3a56');
  [0,1,1,2,2,3,3,4,4,5,5,4,3,2].forEach((w,j)=>{if(w)p('#e8742a',16-w,8+j,w*2,1)});[0,1,1,2,2,1,1].forEach((w,j)=>{if(w)p('#ffd23f',16-w,14+j,w*2,1)});
  for(const[a,b]of[[5,5],[26,5],[5,26],[26,26],[16,2],[16,29],[2,16],[29,16]])p('#2a2a30',a,b,1,1)})}
function pt(geo,m,x,y,z,sx,sy,sz,par,rx,ry,rz){const me=new TH.Mesh(geo,m);me.position.set(x,y,z);me.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);if(rx||ry||rz)me.rotation.set(rx||0,ry||0,rz||0);par.add(me);return me}
/* a bare face painted round a low-poly head (the face sits at the front); one open, one with the eyes shut for blinking */
function faceSkin(key,skin,draw){return[0,1].map(sh=>pxt('face'+key+sh,48,24,(p,oval,sym,w,h)=>{p(skin,0,0,w,h);p(shade(skin,.86),0,16,w,8);draw(p,sh)}))}
/* a painted face with features of its own and a full set of expressions:
   [0] neutral [1] blink [2] talking [3] happy [4] surprised [5] sad [6] cross
   o.eyes round|big|lid|squint|beady|droop|wide · o.brows flat|thin|thick|up|down|sad|arch|none · o.mouth flat|frown|smile|grin|gap|small|thin|smirk|none
   o.eye/o.white/o.brow/o.lip colours · o.hair/o.hairH a hairline band · o.extra(p,c,y,expr) adds freckles, wrinkles, soot, stubble, tears */
const FACEX=['n','b','t','h','s','d','x'];
function faceHead(h,par,key,skin,o,sx,sy,sz){o=o||{};const em=o.eyes,eye=em==='lid'||em==='droop'?'tired':em==='squint'||em==='beady'?'narrow':'big',
    mo=o.mouth==='smile'||o.mouth==='grin'?'smile':o.mouth==='frown'?'frown':o.mouth==='smirk'?'smirk':'flat';
  const faces=headAtlas({skin,ex:FACEX,face:humanFace({skin,iris:o.eye||'#3a2a1a',brow:o.brow||shade(skin,.42),lipLine:o.lip||shade(skin,.5),hair:o.hair,hairY:16,eye,mouth:mo,freckles:key==='wick'}),sides:headSides({skin,hair:o.hair})});
  const m=pt(boxHeadGeo({}),cmat('#ffffff',faces[0]),0,0,0,sx*1.86,sy*1.7,sz*1.86,par);m.userData.faces=faces;if(!o.noBlink){h.fx.headMesh=m;h.fx.faces=faces}return m}

/* ---------- heads: a rounded box, not a ball ----------
   The front is a flattish face with a brow, cheekbones, a nose and a jaw that narrows to the chin; the back of the skull is
   rounder. One texture per expression, laid out as an atlas: the face on the front (its own 128 x 128), skin and an ear on
   the sides, hair (or scales) on top and behind, skin under the chin. o: round (how ball-like), jaw (how much it narrows),
   nose (how far it stands out), snout (pushes the lower face forward, for lizards and fish) */
const HEADG={};
function boxHeadGeo(o){o=o||{};const key=JSON.stringify(o);if(HEADG[key])return HEADG[key];
  const W=6,H=7,D=6,g=new TH.BoxGeometry(1,1,1,W,H,D),p=g.attributes.position,uv=g.attributes.uv;
  const n1=(D+1)*(H+1),n2=(W+1)*(D+1),n3=(W+1)*(H+1),R=[[0,n1,'px'],[n1,2*n1,'nx'],[2*n1,2*n1+n2,'py'],[2*n1+n2,2*n1+2*n2,'ny'],[2*n1+2*n2,2*n1+2*n2+n3,'pz'],[2*n1+2*n2+n3,2*n1+2*n2+2*n3,'nz']];
  const CELL={px:[.5,0,.25,1],nx:[.5,0,.25,1],py:[.75,.5,.25,.5],ny:[.5,0,.25,.18],pz:[0,0,.5,1],nz:[.75,0,.25,.5]};
  for(const[a,b,f]of R){const[c0,c1,cw,ch]=CELL[f];for(let i=a;i<b;i++){let u=uv.getX(i);const v=uv.getY(i);if(f==='nx')u=1-u;uv.setXY(i,c0+u*cw,c1+v*ch)}}
  const rd=o.round==null?.3:o.round,jaw=o.jaw==null?.16:o.jaw,nose=o.nose==null?.08:o.nose,sn=o.snout||0,bw=o.brow==null?.03:o.brow,chk=o.cheek==null?1:o.cheek;
  for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const l=Math.hypot(x,y,z)||1,k=z<0?Math.min(.8,rd*1.7):rd;
    x=x*(1-k)+x/l*.56*k;y=y*(1-k)+y/l*.56*k;z=z*(1-k)+z/l*.56*k;
    if(y<0){const t=Math.min(1,-y*2);x*=1-jaw*t*t;if(z>0)z*=1-.1*t*t}
    if(z>.25){const nb=Math.max(0,1-Math.abs(x)/.12)*Math.max(0,1-Math.abs(y+.08)/.2);z+=nb*nose;
      const br=Math.max(0,1-Math.abs(y-.14)/.07)*Math.max(0,1-Math.abs(x)/.42);z+=br*bw;
      const ck=Math.max(0,1-Math.hypot((Math.abs(x)-.29)/.12,(y+.07)/.12));x+=Math.sign(x)*ck*.025*chk;z+=ck*.015*chk;
      if(sn&&y<.05)z+=sn*Math.min(1,(.05-y)*3)*Math.max(0,1-Math.abs(x)/.5)}
    p.setXYZ(i,x,y,z)}
  g.computeVertexNormals();
  /* smooth across the box's seams: vertices in the same place share one normal */
  const nm=g.attributes.normal,acc=new Map();for(let i=0;i<p.count;i++){const kk=p.getX(i).toFixed(4)+','+p.getY(i).toFixed(4)+','+p.getZ(i).toFixed(4);let a=acc.get(kk);if(!a)acc.set(kk,a=[0,0,0,[]]);a[0]+=nm.getX(i);a[1]+=nm.getY(i);a[2]+=nm.getZ(i);a[3].push(i)}
  for(const a of acc.values()){const L=Math.hypot(a[0],a[1],a[2])||1;for(const i of a[3])nm.setXYZ(i,a[0]/L,a[1]/L,a[2]/L)}nm.needsUpdate=true;
  return HEADG[key]=g}
/* one texture per expression: o.face paints the front cell (0..128 both ways), o.sides the rest of the canvas */
function headAtlas(o){return(o.ex||['n','b']).map(ex=>{const c=mkCanvas(256,128),x=c.getContext('2d');x.lineCap=x.lineJoin='round';x.fillStyle=o.skin;x.fillRect(0,0,256,128);
  if(o.sides)o.sides(x,ex);x.save();x.beginPath();x.rect(0,0,128,128);x.clip();o.face(x,ex);x.restore();const t=new TH.CanvasTexture(c);t.anisotropy=4;return t})}
/* a face the way that era drew them, for a boy or a man: big round eyes with a coloured iris and a light in it, a plain lid
   line (no lashes), heavy straight brows set low, a nose the head's shape mostly makes, a firm mouth, and complexion (the
   face's own shading, shadow under the brow, along the jaw and under the lip). o: skin, iris, brow, lipLine, hair (a fringe),
   eye 'big'|'narrow'|'tired', mouth 'smile'|'flat'|'frown'|'smirk', freckles */
function humanFace(o){return(x,ex)=>{
  let g=x.createLinearGradient(0,0,128,0);g.addColorStop(0,'rgba(70,35,20,.32)');g.addColorStop(.25,'rgba(70,35,20,0)');g.addColorStop(.75,'rgba(70,35,20,0)');g.addColorStop(1,'rgba(70,35,20,.32)');x.fillStyle=g;x.fillRect(0,0,128,128);
  g=x.createLinearGradient(0,100,0,128);g.addColorStop(0,'rgba(70,35,20,0)');g.addColorStop(1,'rgba(70,35,20,.34)');x.fillStyle=g;x.fillRect(0,100,128,28);
  g=x.createRadialGradient(64,28,4,64,28,40);g.addColorStop(0,'rgba(255,245,230,.16)');g.addColorStop(1,'rgba(255,245,230,0)');x.fillStyle=g;x.fillRect(0,0,128,80);
  for(const sd of[-1,1]){g=x.createRadialGradient(64+sd*25,56,4,64+sd*25,54,18);g.addColorStop(0,'rgba(80,40,30,.22)');g.addColorStop(1,'rgba(80,40,30,0)');x.fillStyle=g;x.fillRect(64+sd*25-19,36,38,38);
    g=x.createRadialGradient(64+sd*36,84,2,64+sd*36,84,14);g.addColorStop(0,'rgba(80,40,30,.1)');g.addColorStop(1,'rgba(80,40,30,0)');x.fillStyle=g;x.fillRect(64+sd*36-15,70,30,30)}
  if(o.freckles){x.fillStyle='rgba(150,80,50,.5)';for(const[a,b]of[[-30,74],[-24,79],[-34,80],[-27,85],[30,74],[24,79],[34,80],[27,85]]){x.beginPath();x.arc(64+a,b,1.3,0,TAU);x.fill()}}
  x.fillStyle='rgba(255,240,228,.24)';x.fillRect(62,52,4,26);g=x.createRadialGradient(64,88,1,64,88,10);g.addColorStop(0,'rgba(100,45,30,.4)');g.addColorStop(1,'rgba(100,45,30,0)');x.fillStyle=g;x.fillRect(53,80,22,15);
  x.fillStyle='rgba(80,35,25,.6)';for(const sd of[-1,1]){x.beginPath();x.ellipse(64+sd*4.5,88,2,1.2,0,0,TAU);x.fill()}
  const wide=ex==='s',hap=ex==='h',shut=ex==='b',sad=ex==='d',cross=ex==='x',ew=o.eye==='narrow'?11:12,eh=wide?10:o.eye==='narrow'?6:o.eye==='tired'?7:8.5,lid=o.lid||'#2a1810';
  for(const sd of[-1,1]){const cx=64+sd*25,cy=60;
    if(shut||hap){x.strokeStyle=lid;x.lineWidth=2.6;x.beginPath();if(hap){x.moveTo(cx-ew,cy+2);x.quadraticCurveTo(cx,cy-6,cx+ew,cy+2)}else{x.moveTo(cx-ew,cy);x.quadraticCurveTo(cx,cy+3,cx+ew,cy)}x.stroke();continue}
    x.save();x.beginPath();x.moveTo(cx-ew,cy);x.quadraticCurveTo(cx,cy-eh*1.15,cx+ew,cy);x.quadraticCurveTo(cx,cy+eh*.95,cx-ew,cy);x.closePath();x.fillStyle='#f6f2ea';x.fill();x.clip();
    const ir=Math.min(eh*.88,7.6);g=x.createLinearGradient(0,cy-ir,0,cy+ir);g.addColorStop(0,shade(o.iris,.55));g.addColorStop(1,shade(o.iris,1.2));x.fillStyle=g;x.beginPath();x.arc(cx-sd*1.2,cy,ir,0,TAU);x.fill();
    x.fillStyle='#0b0806';x.beginPath();x.arc(cx-sd*1.2,cy,ir*.46,0,TAU);x.fill();x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.arc(cx-sd*1.2-2.6,cy-2.6,1.8,0,TAU);x.fill();
    x.fillStyle='rgba(60,30,20,.3)';x.fillRect(cx-ew,cy-eh*1.2,ew*2,eh*.6);x.restore();
    x.strokeStyle=lid;x.lineWidth=2.2;x.beginPath();x.moveTo(cx-ew,cy);x.quadraticCurveTo(cx,cy-eh*1.15,cx+ew,cy);x.stroke()}
  /* brows: heavy, nearly straight, low over the eyes, lower at the inside */
  x.fillStyle=o.brow||'#3a2414';for(const sd of[-1,1]){const cx=64+sd*25,by=wide?42:47,inn=cross?6:sad?-5:2,out=wide?-3:sad?4:0;
    x.beginPath();x.moveTo(cx-sd*13,by+inn);x.lineTo(cx+sd*14,by-1+out);x.lineTo(cx+sd*13,by+3.5+out);x.lineTo(cx-sd*13,by+inn+5.5);x.closePath();x.fill()}
  /* a firm mouth, and the shadow under the lower lip that makes a chin */
  const my=104,mw=ex==='t'?8:9;x.strokeStyle=o.lipLine||'#6a3226';x.lineWidth=2.6;
  if(ex==='t'||wide){x.fillStyle='#3a1210';x.beginPath();x.ellipse(64,my+1,wide?5.5:8,wide?6:4.5,0,0,TAU);x.fill()}
  else{const m=hap?'smile':sad||cross?'frown':o.mouth||'flat';x.beginPath();if(m==='smile'){x.moveTo(64-mw,my-1);x.quadraticCurveTo(64,my+4,64+mw,my-1)}else if(m==='frown'){x.moveTo(64-mw,my+2);x.quadraticCurveTo(64,my-2,64+mw,my+2)}
    else if(m==='smirk'){x.moveTo(64-mw,my);x.quadraticCurveTo(64,my+1,64+mw,my-3)}else{x.moveTo(64-mw,my);x.lineTo(64+mw,my)}x.stroke()}
  g=x.createRadialGradient(64,111,1,64,111,9);g.addColorStop(0,'rgba(80,35,25,.22)');g.addColorStop(1,'rgba(80,35,25,0)');x.fillStyle=g;x.fillRect(54,105,20,12);
  if(o.hair){const hy=o.hairY||18;x.fillStyle=o.hair;x.fillRect(0,0,128,hy);for(let i=-4;i<132;i+=9){x.beginPath();x.moveTo(i,hy-2);x.lineTo(i+4.5,hy+8+((i*13)%7));x.lineTo(i+9,hy-2);x.fill()}}}}
/* the sides, top and back of a head: skin with an ear, and hair (if any) over the top and down the back */
function headSides(o){return x=>{x.fillStyle=o.skin;x.fillRect(128,0,128,128);const g=x.createLinearGradient(128,0,192,0);g.addColorStop(0,'rgba(70,30,20,.15)');g.addColorStop(1,'rgba(70,30,20,0)');x.fillStyle=g;x.fillRect(128,0,64,128);
  x.fillStyle=shade(o.skin,.78);x.beginPath();x.ellipse(158,62,7,11,0,0,TAU);x.fill();x.fillStyle=shade(o.skin,.6);x.beginPath();x.ellipse(159,63,3.5,6.5,0,0,TAU);x.fill();
  if(o.hair){x.fillStyle=o.hair;x.fillRect(128,0,64,30);x.fillRect(170,0,22,96);x.fillRect(192,0,64,128);x.strokeStyle=shade(o.hair,.7);x.lineWidth=1.5;for(let i=0;i<14;i++){x.beginPath();const a=196+i*4.4;x.moveTo(a,0);x.lineTo(a+2,128);x.stroke()}}}}
/* hair with some thickness: a slightly bigger head shell, see-through except where the hair is */
function hairShellTex(hair){const c=mkCanvas(256,128),x=c.getContext('2d');x.fillStyle=hair;
  for(let i=-4;i<132;i+=9){x.beginPath();x.moveTo(i,0);x.lineTo(i,15);x.lineTo(i+4.5,24+((i*13)%7));x.lineTo(i+9,15);x.lineTo(i+9,0);x.fill()}
  x.fillRect(128,0,64,24);x.fillRect(168,0,24,88);x.fillRect(192,0,64,128);x.strokeStyle=shade(hair,.7);x.lineWidth=1.4;for(let i=0;i<14;i++){const a=194+i*4.4;x.beginPath();x.moveTo(a,0);x.lineTo(a+2,128);x.stroke()}
  for(let i=0;i<15;i++){const a=i*8.6;x.beginPath();x.moveTo(a,0);x.lineTo(a+3,13);x.stroke()}return new TH.CanvasTexture(c)}
/* the twisted Wick: sunken bruised sockets, ember eyes with slit pupils, bark cracks in grey skin, freckles still, and a grin
   that goes too far, full of small pointed teeth. ex: n grin, b eyes shut, t talking, h laughing, s startled */
function impFace(x,ex){let g=x.createLinearGradient(0,0,128,0);g.addColorStop(0,'rgba(20,20,10,.32)');g.addColorStop(.3,'rgba(20,20,10,0)');g.addColorStop(.7,'rgba(20,20,10,0)');g.addColorStop(1,'rgba(20,20,10,.32)');x.fillStyle=g;x.fillRect(0,0,128,128);
  for(const sd of[-1,1]){g=x.createRadialGradient(64+sd*25,58,3,64+sd*25,58,20);g.addColorStop(0,'rgba(20,8,24,.8)');g.addColorStop(1,'rgba(20,8,24,0)');x.fillStyle=g;x.fillRect(64+sd*25-21,37,42,42)}
  x.strokeStyle='rgba(50,40,30,.6)';x.lineWidth=1.2;for(const[a,b,c2,d]of[[20,22,30,40],[104,26,98,44],[58,12,62,28],[84,88,92,104],[30,92,38,108]]){x.beginPath();x.moveTo(a,b);x.lineTo((a+c2)/2+3,(b+d)/2);x.lineTo(c2,d);x.stroke()}
  x.fillStyle='rgba(110,70,40,.6)';for(const[a,b]of[[-32,76],[-26,80],[-36,82],[32,76],[26,80],[36,82]]){x.beginPath();x.arc(64+a,b,1.4,0,TAU);x.fill()}
  const wide=ex==='s',laugh=ex==='h';
  for(const sd of[-1,1]){const e0=64+sd*25,ey=58;
    if(ex==='b'||laugh){x.strokeStyle='#120a08';x.lineWidth=3;x.beginPath();if(laugh){x.moveTo(e0-11,ey+3);x.quadraticCurveTo(e0,ey-8,e0+11,ey+3)}else{x.moveTo(e0-11,ey);x.quadraticCurveTo(e0,ey+5,e0+11,ey)}x.stroke();continue}
    x.fillStyle='#14100c';x.beginPath();x.ellipse(e0,ey,12,wide?11:9,sd*.15,0,TAU);x.fill();
    x.fillStyle='#ffb02a';x.beginPath();x.arc(e0,ey,wide?6.5:7.5,0,TAU);x.fill();x.fillStyle='#ff6a10';x.beginPath();x.arc(e0,ey+2,4.5,0,TAU);x.fill();
    x.fillStyle='#000';x.beginPath();x.ellipse(e0,ey,1.5,wide?3:6.2,0,0,TAU);x.fill();x.fillStyle='rgba(255,255,230,.9)';x.beginPath();x.arc(e0-3,ey-3.5,1.6,0,TAU);x.fill()}
  x.strokeStyle='#2a1208';x.lineWidth=3.2;for(const sd of[-1,1]){x.beginPath();x.moveTo(64+sd*11,wide?40:46);x.lineTo(64+sd*36,wide?34:38);x.stroke()}
  x.fillStyle='rgba(40,30,20,.75)';x.fillRect(60,82,2.4,3.4);x.fillRect(65.6,82,2.4,3.4);
  const my=100;x.fillStyle='#2a0606';x.beginPath();if(wide){x.ellipse(64,my+2,7,8,0,0,TAU);x.fill();return}
  const open=ex==='t'?9:laugh?12:5,half=32,yt=u=>my-8+(4+open*.35)*(1-u*u),yb=u=>my-8+(4+open*1.1)*(1-u*u);
  x.moveTo(64-half,my-8);x.quadraticCurveTo(64,my+open*2.2,64+half,my-8);x.quadraticCurveTo(64,my+open*.7,64-half,my-8);x.fill();
  x.fillStyle='#efe6d2';for(let u=-.84;u<=.85;u+=.14){const tx=64+u*half;x.beginPath();x.moveTo(tx-2.6,yt(u));x.lineTo(tx+2.6,yt(u));x.lineTo(tx,yt(u)+4.4);x.fill();if(open>5){x.beginPath();x.moveTo(tx-2.5,yb(u));x.lineTo(tx+2.5,yb(u));x.lineTo(tx,yb(u)-3.8);x.fill()}}
  x.strokeStyle='#2a0606';x.lineWidth=2;for(const sd of[-1,1]){x.beginPath();x.moveTo(64+sd*half,my-8);x.quadraticCurveTo(64+sd*(half+5),my-12,64+sd*(half+6),my-18);x.stroke()}}
/* where his eyes glow: black except the embers */
function impGlowFace(x,ex){if(ex==='b'||ex==='h')return;for(const sd of[-1,1]){const e0=64+sd*25,ey=58,g=x.createRadialGradient(e0,ey,1,e0,ey,12);g.addColorStop(0,'#ffc050');g.addColorStop(.6,'rgba(255,120,20,.8)');g.addColorStop(1,'rgba(255,90,10,0)');
  x.fillStyle=g;x.beginPath();x.arc(e0,ey,12,0,TAU);x.fill();x.fillStyle='#000';x.beginPath();x.ellipse(e0,ey,1.5,ex==='s'?3:6.2,0,0,TAU);x.fill()}}
/* the fish folk's faces: big round eyes set high and wide, a wide mouth with thick lips, a pale belly under the chin, scales;
   on the sides, three gill slits */
function fishFace(o){return(x,ex)=>{x.fillStyle='rgba(255,255,255,.1)';for(let j=0;j<128;j+=7)for(let i=(j/7%2)*5;i<128;i+=10){x.beginPath();x.arc(i,j,4.5,0,Math.PI);x.fill()}
  let g=x.createLinearGradient(0,70,0,128);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.3,o.belly);g.addColorStop(1,o.belly);x.fillStyle=g;x.fillRect(0,70,128,58);
  g=x.createLinearGradient(0,0,128,0);g.addColorStop(0,'rgba(10,20,40,.3)');g.addColorStop(.3,'rgba(10,20,40,0)');g.addColorStop(.7,'rgba(10,20,40,0)');g.addColorStop(1,'rgba(10,20,40,.3)');x.fillStyle=g;x.fillRect(0,0,128,128);
  for(const sd of[-1,1]){const e0=64+sd*30,ey=52,R=ex==='s'?18:16;
    if(ex==='b'){x.strokeStyle='#14101a';x.lineWidth=3;x.beginPath();x.moveTo(e0-13,ey);x.quadraticCurveTo(e0,ey+7,e0+13,ey);x.stroke();continue}
    x.fillStyle=shade(o.skin,.6);x.beginPath();x.arc(e0,ey,R+2.5,0,TAU);x.fill();x.fillStyle='#f6f2e4';x.beginPath();x.arc(e0,ey,R,0,TAU);x.fill();
    g=x.createLinearGradient(0,ey-9,0,ey+9);g.addColorStop(0,shade(o.iris,.6));g.addColorStop(1,shade(o.iris,1.3));x.fillStyle=g;x.beginPath();x.arc(e0-sd*2,ey+1,9,0,TAU);x.fill();
    x.fillStyle='#08080a';x.beginPath();x.arc(e0-sd*2,ey+1,4.6,0,TAU);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(e0-sd*2-3.5,ey-3,2.6,0,TAU);x.fill();x.beginPath();x.arc(e0-sd*2+3,ey+4,1.2,0,TAU);x.fill();
    if(ex==='h'){x.fillStyle=o.skin;x.fillRect(e0-R-3,ey+4,2*R+6,R)}
    if(ex==='d'||ex==='x'){x.strokeStyle='#14101a';x.lineWidth=3;const a=ex==='x'?-sd*5:sd*4;x.beginPath();x.moveTo(e0-14,ey-R-4+a);x.lineTo(e0+14,ey-R-4-a);x.stroke()}}
  const open=ex==='t'?9:ex==='s'?11:ex==='h'?6:3,my=96;x.fillStyle=shade(o.skin,.62);x.beginPath();x.ellipse(64,my,26,open+6,0,0,TAU);x.fill();x.fillStyle='#2a0e14';x.beginPath();x.ellipse(64,my,19,open,0,0,TAU);x.fill();
  }}
function fishSides(o){return x=>{x.fillStyle=o.skin;x.fillRect(128,0,128,128);x.fillStyle='rgba(255,255,255,.1)';for(let j=0;j<128;j+=7)for(let i=128+(j/7%2)*5;i<256;i+=10){x.beginPath();x.arc(i,j,4.5,0,Math.PI);x.fill()}
  x.fillStyle=o.belly;x.fillRect(128,92,64,36);x.strokeStyle=shade(o.skin,.45);x.lineWidth=2.4;for(let k=0;k<3;k++){x.beginPath();x.arc(148+k*8,66,16,-1.1,1.1);x.stroke()}
  x.fillStyle=shade(o.skin,.78);x.fillRect(192,0,64,128)}}
/* the lizard folk's faces: big slit-pupilled eyes high on the head under heavy brow scales, nostrils at the end of the muzzle,
   a long mouth from side to side, scales all over and a paler throat */
function lizFace(o){return(x,ex)=>{x.fillStyle='rgba(0,0,0,.13)';for(let j=0;j<128;j+=6)for(let i=(j/6%2)*5;i<128;i+=10)x.fillRect(i,j,7,4);x.fillStyle=o.belly;x.fillRect(0,106,128,22);
  let g=x.createLinearGradient(0,0,128,0);g.addColorStop(0,'rgba(10,20,10,.3)');g.addColorStop(.3,'rgba(10,20,10,0)');g.addColorStop(.7,'rgba(10,20,10,0)');g.addColorStop(1,'rgba(10,20,10,.3)');x.fillStyle=g;x.fillRect(0,0,128,128);
  for(const sd of[-1,1]){const e0=64+sd*28,ey=40,eh=ex==='s'?11:9;x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(e0,ey,16,12,0,0,TAU);x.fill();
    if(ex==='b'){x.strokeStyle='#14100a';x.lineWidth=3;x.beginPath();x.moveTo(e0-12,ey);x.lineTo(e0+12,ey);x.stroke();continue}
    x.fillStyle=o.eye;x.beginPath();x.ellipse(e0,ey,12,eh,0,0,TAU);x.fill();g=x.createRadialGradient(e0,ey,2,e0,ey,12);g.addColorStop(0,'rgba(255,255,200,.4)');g.addColorStop(1,'rgba(0,0,0,.35)');x.fillStyle=g;x.beginPath();x.ellipse(e0,ey,12,eh,0,0,TAU);x.fill();
    x.fillStyle='#0a0806';x.beginPath();x.ellipse(e0,ey,2.2,ex==='s'?5:8,0,0,TAU);x.fill();x.fillStyle='rgba(255,255,230,.9)';x.beginPath();x.arc(e0-3.5,ey-3.5,1.8,0,TAU);x.fill();
    x.strokeStyle='#14100a';x.lineWidth=3;const a=ex==='x'?-sd*4:ex==='d'?sd*3:ex==='h'?-sd*2:0;x.beginPath();x.moveTo(e0-14,ey-12+a);x.lineTo(e0+14,ey-12-a);x.stroke()}
  x.fillStyle='#1a140c';for(const sd of[-1,1]){x.beginPath();x.ellipse(64+sd*7,78,2.2,1.4,0,0,TAU);x.fill()}
  const up=ex==='h'?7:ex==='d'?-5:1,my=98;x.strokeStyle='#2a140c';x.lineWidth=3;x.beginPath();x.moveTo(4,my-up);x.quadraticCurveTo(64,my+3+(ex==='t'?10:0),124,my-up);x.stroke();
  if(ex==='t'||ex==='s'){x.fillStyle='#4a1414';x.beginPath();x.ellipse(64,my+5,16,ex==='s'?9:6,0,0,TAU);x.fill()}}}
function lizSides(o){return x=>{x.fillStyle=o.skin;x.fillRect(128,0,128,128);x.fillStyle='rgba(0,0,0,.13)';for(let j=0;j<128;j+=6)for(let i=128+(j/6%2)*5;i<256;i+=10)x.fillRect(i,j,7,4);x.fillStyle=o.belly;x.fillRect(128,98,64,30);x.fillStyle=shade(o.skin,.8);x.fillRect(192,0,64,128)}}
/* ---------- the rig ---------- */
/* sculpted body parts, made once at unit size and scaled per character: a torso with hips, waist and chest; limbs that
   swell at the bicep, thigh, forearm and calf and narrow at the joints; round joints; a flared cuff for gloves and boots */
const BODY=(()=>{const lathe=(pts,seg)=>new TH.LatheGeometry(pts.map(([r,y])=>new TH.Vector2(r,y)),seg||10);
  return{torso:lathe([[0,-.03],[.8,0],[.87,.1],[.75,.34],[.8,.55],[.97,.76],[1,.84],[.86,.95],[.45,1],[0,1.02]],12),
    upper:lathe([[0,.07],[.72,.05],[.95,-.06],[1,-.2],[.96,-.48],[.86,-.86],[.8,-.97],[0,-1.03]],10),
    lower:lathe([[0,.04],[.82,.03],[.9,-.04],[1,-.22],[.86,-.6],[.66,-.94],[.56,-1],[0,-1.02]],10),
    joint:new TH.SphereGeometry(1,8,6),cuff:new TH.CylinderGeometry(1,.8,1,10,1,true)}})();
/* o.prop: 'adult' gives grown-up proportions (head about a sixth of the height, long legs and arms), 'kid' a little less so */
const PROP={adult:[1.38,1.22,.76],kid:[1.16,1.12,.9],sitter:[1,1.05,.8]};
/* the rig: hips, thighs, knees, shins and feet; a shaped torso; shoulders, upper arms, elbows, forearms and hands with a thumb.
   Joints are groups, so walking bends the knees and arms rest slightly bent. Clothing options: o.bootM (boot shafts), o.gloveM (cuffs) */
function rig(o){const PR=PROP[o.prop]||[1,1,1],pl=o.noLegs?1:PR[0],pa=PR[1],ph=o.headS||PR[2],sl=o.prop?.86:1;
  const root=new TH.Group(),body=grp(root,0,.42,0),lo=grp(body,0,-.42,0);lo.scale.setScalar(o.h||1);const legs=[],knees=[],arms=[],elbows=[],hip=(o.hip||.34)*pl,lr=(o.legR||.048)*sl,ar=(o.armR||.04)*sl,hw=o.hipW||.07;
  if(!o.noLegs)pt(BODY.joint,o.legM,0,hip-.005,0,hw+lr*1.1,lr*1.5,lr*1.45,lo);
  for(const sd of[-1,1]){const hp=grp(lo,sd*hw,hip,0),th=hip*.5,shn=hip-th-.045,kn=grp(hp,0,-th,0);
    if(!o.noLegs){pt(BODY.upper,o.legM,0,0,0,lr*1.25,th,lr*1.15,hp);pt(BODY.lower,o.legM,0,0,0,lr*1.02,shn,lr*.98,kn);
      if(o.bootM){pt(BODY.cuff,o.bootM,0,-shn*.56,0,lr*1.32,shn*.86,lr*1.32,kn);pt(LP.cyl8,o.bootCuffM||o.bootM,0,-shn*.12,0,lr*1.5,.032,lr*1.5,kn)}
      const an=grp(kn,0,-shn,0),fw=o.shoeW||.1,fl=o.shoeL||.17,fm=o.shoeM;
      pt(LP.box,fm,0,-.022,fl*.16,fw*.86,.046,fl*.7,an);pt(BODY.joint,fm,0,-.02,fl*.5,fw*.47,.033,fl*.2,an);pt(BODY.joint,fm,0,-.012,-fl*.1,fw*.42,.042,fl*.2,an);pt(LP.box,skinM('#1e1612'),0,-.042,fl*.19,fw*.9,.008,fl*.86,an)}
    legs.push(hp);knees.push(kn)}
  const up=grp(lo,0,hip,0);up.rotation.x=o.hunch||0;const tl=o.torsoL||.34,tr=o.torsoR||.14;
  if(o.torsoM)pt(BODY.torso,o.torsoM,0,0,0,tr,tl,tr*(o.torsoD||.8),up);
  const nk=(o.neck||.11)*(ph<1?.62:1);if(o.torsoM&&o.prop)pt(LP.cyl6,o.neckM||o.handM,0,tl+nk*.35,0,.03,nk*.9,.028,up);
  const head=grp(up,0,tl+nk,0);head.scale.setScalar(ph);
  for(const sd of[-1,1]){const sh=grp(up,sd*(o.shW||.17),tl-.03,0);sh.rotation.order='YXZ';const al=(o.armL||.27)*pa,ua=al*.48,fa=al*.52,hs=(o.handS||.06)*1.12;
    if(!o.noArms){pt(BODY.upper,o.armM,0,0,0,ar*1.15,ua,ar*1.05,sh)}
    const el=grp(sh,0,-ua,0);el.rotation.x=-.18;
    if(!o.noArms){pt(BODY.lower,o.foreM||o.armM,0,0,0,ar*1.05,fa,ar*.95,el);if(o.gloveM)pt(BODY.cuff,o.gloveM,0,-fa*.8,0,ar*1.45,fa*.34,ar*1.45,el)}
    const hand=grp(el,0,-fa-.03,0);
    if(!o.noArms){pt(BODY.joint,o.handM,0,.012,0,hs*.5,hs*.6,hs*.32,hand);pt(BODY.joint,o.handM,0,-hs*.4,.004,hs*.44,hs*.42,hs*.27,hand);pt(BODY.joint,o.handM,-sd*hs*.32,-hs*.02,hs*.18,hs*.14,hs*.3,hs*.14,hand,.55,0,sd*.3)}
    sh.userData.hand=hand;arms.push(sh);elbows.push(el)}
  return{root,body,lo,up,head,legs,knees,arms,elbows,hand:[arms[0].userData.hand,arms[1].userData.hand],fx:{},hipY:hip}}
/* knees follow the hips: a leg swinging back bends at the knee, as in a real step */
function kneesFollow(h){if(!h.knees)return;h.knees.forEach((k,i)=>{k.rotation.x=Math.max(0,h.legs[i].rotation.x)*1.1+.04})}
const skinM=c=>cmat(c,null);

/* ---------- the cast ---------- */
const CHAR={};
/* Maren, the carver: very tall, stooped, long arms, grey hair and heavy tired eyes, pouches at her belt and a knife that never stops */
CHAR.maren={name:'Maren',hw:6,hh:5,beh:'wander',radius:22,speed:9,gait:'shuffle',turn:2.5,breath:1.6,cadence:5,
  build(){const coat=cmat('#ffffff',cloth('#5a4660','seam','#4a3850')),h=rig({prop:'adult',h:1.18,hunch:.38,torsoM:coat,torsoR:.12,torsoL:.36,armM:coat,armL:.31,armR:.035,handM:skinM('#d8b898'),handS:.07,legM:coat,shoeM:skinM('#2a2020'),noLegs:true,shW:.15});
    pt(LP.bell,cmat('#ffffff',cloth('#5a4660','seam','#4a3850'),{side:TH.DoubleSide}),0,.2,0,.22,.42,.2,h.lo);pt(LP.cyl6,skinM('#3a2a2a'),0,.4,0,.13,.05,.11,h.lo);
    for(let n=0;n<3;n++){const a=-.9+n*.9;pt(LP.box,skinM(['#4a3a2a','#5a4632','#3e3226'][n]),Math.sin(a)*.14,.33,Math.cos(a)*.12,.05,.07,.04,h.lo,0,a)}
    pt(LP.cyl5,skinM('#a8a8b0'),0,.0,-.02,.05,.06,.05,h.head);for(let n=0;n<5;n++)pt(LP.box,skinM('#c8c8cc'),-.06+n*.03,-.06,-.07,.018,.18,.018,h.head,.2);
    faceHead(h,h.head,'maren','#d8b898',{hair:'#9a9aa2',hairH:5,eyes:'lid',eye:'#4a5a6a',brows:'arch',brow:'#8a8a92',mouth:'thin',extra:(p,c,y)=>{p('#b8987a',c-7,y+2,1,3);p('#b8987a',c+6,y+2,1,3);p('#b8987a',c-1,y-4,3,1)}},.1,.12,.1);
    const knife=grp(h.hand[1],0,0,0);pt(LP.box,skinM('#5a3a22'),0,0,.0,.025,.06,.025,knife);pt(LP.box,cmat('#d8dce8',null,{emissive:'#303440'}),0,-.06,0,.012,.07,.03,knife);
    pt(LP.box,cmat('#ffffff',cloth('#b89870')),0,0,.03,.05,.05,.05,h.hand[0]);return h},
  pose(h){h.arms[1].rotation.set(-1.1,-.42,0);h.arms[0].rotation.set(-1.0,.48,0);h.elbows[1].rotation.x=-.5;h.elbows[0].rotation.x=-.45},
  idle(h,e,s,dt,w){if(!w){const k=Math.sin(T*7)*.5+.5;h.arms[1].rotation.x=-1.1-k*.25;h.arms[1].rotation.y=-.42+k*.12;h.head.rotation.x=.25+Math.sin(T*.5)*.08;h.head.rotation.z=Math.sin(T*.37)*.12}}};
/* Tobin: a small, freckled boy with straw hair, who never stops moving his head */
CHAR.tobin={name:'Tobin',hw:5,hh:4,beh:'circle',radius:20,speed:46,gait:'run',turn:9,breath:3,cadence:15,notice:40,
  build(){const sh=cmat('#ffffff',cloth('#8a3a2e','stripe','#5a2a22')),h=rig({prop:'kid',h:.72,torsoM:sh,torsoR:.12,torsoL:.28,armM:sh,armR:.035,armL:.22,handM:skinM('#e8c098'),legM:cmat('#ffffff',cloth('#3a4a6a')),shoeM:skinM('#2a1e14'),shoeW:.13,shoeL:.2,legR:.045});
    faceHead(h,h.head,'tobin','#e8c098',{hair:'#b8984e',hairH:6,eyes:'big',eye:'#2a5aa8',brows:'up',mouth:'gap',extra:(p,c,y)=>{for(const x of[-4,-2,2,4])p('#c8865a',c+x,y+5);p('#e8a088',c-6,y+4,2,1);p('#e8a088',c+5,y+4,2,1)}},.13,.14,.13);
    for(let n=0;n<5;n++)pt(LP.cone4,skinM('#b8984e'),-.06+n*.03,.12,-.02,.018,.08,.018,h.head,(n%2)*.4-.2,0,-.4+n*.2);pt(LP.cone6,cmat('#ffffff',cloth('#6a4a2a')),0,.18,-.09,.05,.06,.05,h.lo,-.3);return h},
  idle(h,e,s,dt,w){if(!w){h.body.position.y=.42+Math.abs(Math.sin(T*6))*.04;if(s.snapT==null||T>s.snapT){s.snapT=T+.6+Math.random()*1.4;s.snap=(Math.random()-.5)*1.6;s.tilt=(Math.random()-.5)*.6}
      h.head.rotation.z+=((s.tilt||0)-h.head.rotation.z)*Math.min(1,dt*25);s.lookOverride=e.look==null?s.snap:null}}};
/* Edda: a wide bell of a dress, a long grey veil, a pale face with red-rimmed eyes that has been crying for a long time. She carries a candle */
CHAR.edda={name:'Edda',hw:7,hh:6,beh:'pace',pace:[-2,0],speed:10,gait:'glide',turn:2,breath:1.4,
  build(){const dr=cmat('#ffffff',cloth('#3e4c4c','seam','#344040'),{side:TH.DoubleSide}),h=rig({prop:'adult',h:1,torsoM:cmat('#ffffff',cloth('#3e4c4c')),torsoR:.1,torsoL:.3,armM:cmat('#ffffff',cloth('#3e4c4c')),armR:.032,armL:.24,handM:skinM('#e8e0d8'),noLegs:true,shW:.13});
    h.fx.skirt=pt(LP.bell,dr,0,.24,0,.36,.5,.34,h.lo);pt(LP.cyl8,skinM('#2a3232'),0,.0,0,.37,.02,.35,h.lo);
    faceHead(h,h.head,'edda','#d8d4cc',{hair:'#3a3a40',hairH:5,eyes:'droop',eye:'#3a2a2a',brows:'sad',mouth:'small',lip:'#8a5a5a',extra:(p,c,y)=>{p('#a86a6a',c-4,y+3,3,1);p('#a86a6a',c+2,y+3,3,1);p('#8a8e98',c-3,y+5,1,4);p('#8a8e98',c+3,y+5,1,3)}},.11,.13,.11);
    pt(LP.cone8,cmat('#4a4a52',null,{transparent:true,opacity:.62,side:TH.DoubleSide,depthWrite:false}),0,-.08,-.01,.2,.52,.19,h.head);pt(LP.cyl8,skinM('#2a2a30'),0,.18,0,.12,.03,.12,h.head);
    const cnd=grp(h.lo,0,.55,.15);pt(LP.cyl6,skinM('#e8e0c8'),0,.04,0,.025,.1,.025,cnd);pt(LP.cyl6,skinM('#6a5a3a'),0,-.02,0,.05,.015,.05,cnd);h.fx.flame=pt(LP.cone4,glowM('#ffb84a'),0,.13,0,.02,.06,.02,cnd);h.fx.candle=cnd;return h},
  pose(h){h.arms[0].rotation.set(-1.2,.45,0);h.arms[1].rotation.set(-1.2,-.45,0)},
  idle(h,e,s,dt,w){h.fx.flame.scale.set(.02,.06+Math.sin(T*17)*.015,.02);h.lo.rotation.z=Math.sin(T*.9)*.06;h.fx.skirt.rotation.y=Math.sin(T*1.3)*.08}};
/* Corvo, the trader: tall and thin under an enormous pack of wares, a gaunt stubbled face and a long nose, a hat with a feather */
CHAR.corvo={name:'Corvo',hw:6,hh:5,beh:'counter',reach:21,speed:14,gait:'strut',turn:7,breath:2.2,cadence:9,
  build(){const coat=cmat('#ffffff',cloth('#242430','seam','#1a1a22')),h=rig({prop:'adult',h:1.1,hunch:.28,torsoM:coat,torsoR:.12,torsoL:.36,armM:coat,armR:.03,armL:.3,handM:skinM('#c8b8a0'),handS:.05,legM:cmat('#ffffff',cloth('#2a2a34')),shoeM:skinM('#1a1414'),legR:.035,shoeL:.2});
    pt(LP.cone6,coat,0,.12,-.02,.17,.3,.14,h.up,Math.PI);
    const pk=grp(h.up,0,.22,-.2);[['#7a5a3a',0,0,.3,.24,.2],['#5a6a4a',.04,.2,.24,.16,.18],['#8a3a3a',-.02,.33,.18,.12,.16]].forEach(([c,x,y,sx,sy,sz])=>pt(LP.box,cmat('#ffffff',cloth(c,'patch',shade(c,.7))),x,y,0,sx,sy,sz,pk));
    pt(LP.cyl6,cmat('#ffffff',cloth('#8a6a4a','stripe','#6a4a32')),0,.12,-.14,.06,.32,.06,pk,0,0,Math.PI/2);const lt=grp(pk,.17,.05,0);pt(LP.box,skinM('#3a3a3a'),0,0,0,.05,.07,.05,lt);h.fx.lamp=pt(LP.box,glowM('#ffc860'),0,0,0,.035,.05,.035,lt);
    faceHead(h,h.head,'corvo','#c8b8a0',{hair:'#1e1e24',hairH:6,eyes:'beady',brows:'down',brow:'#1e1e24',mouth:'smirk',extra:(p,c,y)=>{for(let x=c-3;x<=c+3;x+=2){p('#9a8a74',x,y+6);p('#9a8a74',x+1,y+9)}}},.11,.12,.11);pt(LP.cone4,skinM('#b8a890'),0,-.01,.12,.022,.07,.026,h.head,Math.PI/2);
    pt(LP.cyl8,skinM('#141418'),0,.12,0,.2,.02,.2,h.head);pt(LP.cyl8,skinM('#141418'),0,.19,0,.09,.13,.09,h.head);pt(LP.box,skinM('#6a2a2a'),0,.14,0,.19,.03,.19,h.head,0,.4);pt(LP.box,skinM('#e8dcc0'),.08,.22,-.03,.015,.16,.04,h.head,-.5,0,-.3);return h},
  pose(h){h.arms[0].rotation.set(-.9,.3,0);h.arms[1].rotation.set(-.9,-.3,0)},
  idle(h,e,s,dt,w){if(s.twT==null||T>s.twT){s.twT=T+.35+Math.random()*1.2;s.tw=(Math.random()-.5)*.9;s.peck=Math.random()<.2?.25:0}
    h.head.rotation.z+=(s.tw-h.head.rotation.z)*Math.min(1,dt*30);if(s.peck>0){s.peck-=dt;h.head.rotation.x=.5}else h.head.rotation.x=0;if(!w){const k=Math.sin(T*9);h.arms[0].rotation.y=.3+k*.15;h.arms[1].rotation.y=-.3-k*.15}
    h.fx.lamp.material.emissiveIntensity=.7+Math.sin(T*5)*.3}};
/* Ilse, the fisher: short and wide, a huge cone of a rain hat hiding everything but two small lamp-eyes, a rod with a glowing float */
CHAR.ilse={name:'Ilse',hw:6,hh:5,beh:'fish',speed:8,gait:'waddle',turn:3,breath:2,cadence:7,ang0:.8,
  build(){const coat=cmat('#ffffff',cloth('#8a7a34','seam','#6e6028')),h=rig({prop:'adult',headS:.88,h:.9,torsoM:coat,torsoR:.19,torsoL:.32,torsoD:.9,armM:coat,armR:.05,armL:.24,handM:skinM('#b07a50'),legM:cmat('#ffffff',cloth('#3a3a30')),shoeM:skinM('#2a2a24'),shoeW:.13,shoeL:.19,legR:.06,hipW:.09,shW:.21});
    pt(LP.cone8,coat,0,.06,0,.25,.24,.23,h.lo,Math.PI);pt(LP.head,skinM('#2a2420'),0,0,0,.12,.12,.12,h.head);
    pt(LP.cone8,cmat('#ffffff',cloth('#9a8a3c')),0,.08,0,.42,.3,.42,h.head);pt(LP.cyl8,skinM('#5a5024'),0,-.07,0,.42,.015,.42,h.head);
    h.fx.eyes=[-1,1].map(sd=>pt(LP.box,glowM('#ffe070'),sd*.045,-.03,.11,.03,.02,.02,h.head));
    const rod=grp(h.hand[1],0,0,0);rod.rotation.x=-.9;pt(LP.cyl5,skinM('#6a4a2a'),0,.45,0,.012,.95,.012,rod);h.fx.rod=rod;
    h.fx.line=pt(LP.box,cmat('#d8d8d8',null,{transparent:true,opacity:.6}),0,0,0,.004,1,.004,h.root);h.fx.bob=pt(LP.ball,glowM('#ff6a4a'),0,0,0,.035,.035,.035,h.root);return h},
  pose(h){h.arms[1].rotation.set(-1.0,0,0);h.arms[0].rotation.set(-.6,-.4,0)},
  idle(h,e,s,dt,w){const m=e.mode||'wait',k=e.mt||0;let lift=0;if(m==='cast')lift=k<.5?-k*2:(1-k)*2-1+1;if(m==='reel')lift=Math.sin(T*6)*.1;h.fx.rod.rotation.x=-.9-lift*.9;
    h.fx.eyes.forEach(o=>o.visible=!(s.blinkOn));
    /* the line runs from the rod tip to the float, which bobs where she cast it */
    const tip=new TH.Vector3(0,.95,0);h.fx.rod.localToWorld(tip);h.root.worldToLocal(tip);const dist=m==='cast'?k*1.6:m==='reel'?1.6*(1-k):m==='wait'?1.6:0;
    const bob=new TH.Vector3(0,.0+Math.sin(T*2.4)*.03-.12,.3+dist);h.fx.bob.position.copy(bob);h.fx.bob.visible=dist>.1;h.fx.line.visible=dist>.1;
    const mid=tip.clone().add(bob).multiplyScalar(.5);h.fx.line.position.copy(mid);h.fx.line.scale.y=tip.distanceTo(bob);h.fx.line.lookAt(h.root.localToWorld(bob.clone()));h.fx.line.rotateX(Math.PI/2)}};
/* the hermit: tiny and bent nearly double, a beard that drags on the floor, bushy white brows and one clouded eye, a staff taller than he is with a swinging lamp */
CHAR.hermit={name:'The hermit',hw:5,hh:4,beh:'wander',radius:16,speed:6,gait:'hobble',turn:2,breath:1.2,cadence:4,
  build(){const rb=cmat('#ffffff',cloth('#4e3e2c','patch','#5e4a32')),h=rig({prop:'adult',h:.74,hunch:1.0,torsoM:rb,torsoR:.13,torsoL:.3,armM:rb,armR:.035,armL:.28,handM:skinM('#c8a078'),legM:rb,shoeM:skinM('#2a2018'),neck:.06});
    pt(LP.cone6,rb,0,.2,0,.2,.34,.18,h.lo,Math.PI);faceHead(h,h.head,'hermit','#c8a078',{hair:'#d8d4c8',hairH:4,brow:'#ece8e0',eyes:'squint',brows:'thick',mouth:'none',extra:(p,c,y)=>{p('#ece8e0',c-5,y-3,4,1);p('#ece8e0',c+2,y-3,4,1);p('#c8ccd0',c+2,y+1,2,2)}},.11,.11,.11);
    pt(LP.cone6,skinM('#d8d4c8'),0,-.32,.12,.1,.5,.07,h.head,Math.PI+.25);pt(LP.ball,skinM('#d8d4c8'),0,.0,-.08,.12,.08,.06,h.head);
    const st=grp(h.hand[1],0,0,0);pt(LP.cyl5,skinM('#5a4028'),0,.15,0,.018,1.1,.018,st);const lp=grp(st,0,.68,.06);h.fx.lampPivot=lp;pt(LP.box,skinM('#3a3a30'),0,-.07,0,.05,.07,.05,lp);h.fx.lamp=pt(LP.box,glowM('#a8ff8a'),0,-.07,0,.033,.05,.033,lp);h.fx.staff=st;return h},
  pose(h){h.arms[1].rotation.set(-.4,0,-.25);h.arms[0].rotation.set(.3,0,.1);h.head.rotation.x=-.8},
  idle(h,e,s,dt,w){h.fx.lampPivot.rotation.x=Math.sin(T*1.6)*.35+(w?Math.sin(s.ph)*.3:0);h.fx.lamp.material.emissiveIntensity=.7+Math.sin(T*3.1)*.3;
    if(s.coughT==null||T>s.coughT){s.coughT=T+5+Math.random()*6;s.cough=.6}if(s.cough>0){s.cough-=dt;h.up.rotation.x=1.0+Math.sin(s.cough*30)*.08}else h.up.rotation.x=1.0}};
/* Wick: the boy who took your horse. Long legs, a cloak too big for him, wild orange hair and a face that won't look at you straight */
CHAR.wick={name:'Wick',hw:5,hh:4,beh:'shy',radius:20,speed:22,gait:'walk',turn:6,breath:2.6,cadence:10,notice:46,
  build(o){const ck=cmat('#ffffff',cloth('#5a6630','patch','#4a5426')),h=rig({prop:'kid',h:.82,hip:.38,torsoM:ck,torsoR:.11,torsoL:.27,armM:ck,armR:.033,armL:.25,handM:skinM('#f0c8a0'),legM:cmat('#ffffff',cloth('#5a4630')),shoeM:skinM('#3a2a1a'),legR:.04});
    pt(LP.cone6,ck,0,.16,-.03,.19,.36,.16,h.up,Math.PI);faceHead(h,h.head,'wick','#f0c8a0',{hair:'#c86a2a',hairH:6,eyes:'big',eye:'#3a6a2a',brows:'sad',brow:'#7a3a1a',mouth:'small',lip:'#8a3a2a',extra:(p,c,y)=>{for(const[a,b]of[[-5,4],[-3,5],[3,5],[5,4]])p('#c87a4a',c+a,y+b)}},.13,.14,.13);
    for(let n=0;n<7;n++){const a=n/7*TAU;pt(LP.cone4,skinM('#c86a2a'),Math.cos(a)*.08,.11,Math.sin(a)*.08-.02,.04,.12,.04,h.head,Math.sin(a)*.8,0,-Math.cos(a)*.8)}
    pt(LP.cone6,ck,0,.03,-.06,.17,.16,.16,h.head,-.5);return h},
  idle(h,e,s,dt,w){if(!w){if(s.fidT==null||T>s.fidT){s.fidT=T+2+Math.random()*3;s.fid=Math.floor(Math.random()*3)}if(s.fid===0){h.legs[1].rotation.x=Math.sin(T*8)*.25-.1}else if(s.fid===1){h.arms[0].rotation.set(-.6,.8,0);h.arms[1].rotation.set(-.3,-.4,0)}h.head.rotation.x=.25}}};
/* the scholar's ghost: no head, an open book where the head should be, pages turning by themselves */
CHAR.scholar={name:'A drowned scholar',hw:5,hh:4,beh:'float',speed:6,gait:'float',turn:1.5,breath:1,ghost:1,
  build(){const gm=cmat('#8ab8e8',null,{transparent:true,opacity:.55,depthWrite:false,emissive:'#1a3a6a'}),h=rig({h:1,torsoM:gm,torsoR:.12,torsoL:.32,armM:gm,armR:.03,armL:.26,handM:gm,noLegs:true});
    pt(LP.cone6,cmat('#7aa8e0',null,{transparent:true,opacity:.35,depthWrite:false,side:TH.DoubleSide}),0,.12,0,.2,.5,.18,h.lo,Math.PI);
    const pg=pxt('pages',8,10,p=>{p('#e8e0c8',0,0,8,10);for(let y=1;y<9;y+=2)p('#8a8a8a',1,y,6,1);p('#c8a060',0,0,8,1)});const book=grp(h.head,0,-.02,0);h.fx.pages=[-1,1].map(sd=>{const pv=grp(book,0,0,0);pt(LP.box,cmat('#ffffff',pg,{emissive:'#3a4a6a'}),sd*.08,.0,0,.16,.2,.01,pv);pv.rotation.y=sd*.5;return pv});
    pt(LP.box,skinM('#5a2a2a'),0,0,-.01,.02,.21,.03,book);h.fx.flip=pt(LP.box,cmat('#ffffff',pg,{emissive:'#3a4a6a'}),0,0,0,.16,.2,.01,grp(book,0,0,0));return h},
  pose(h){h.arms[0].rotation.set(-1.2,.6,0);h.arms[1].rotation.set(-1.2,-.6,0)},
  idle(h,e,s,dt){h.root.position.y=.18+Math.sin(T*1.5)*.05;const f=(T*.7)%1;h.fx.flip.parent.rotation.y=-.5+f*1;h.fx.flip.position.x=.08*Math.cos(f*Math.PI);h.head.rotation.x=.3}};
/* the old keeper's ghost: tall, armoured, translucent, a lantern burning where the head should be */
CHAR.keeper={name:'An old keeper',hw:6,hh:5,beh:'float',speed:5,gait:'float',turn:1.2,breath:1,ghost:1,
  build(){const am=cmat('#a8b8d0',null,{transparent:true,opacity:.5,depthWrite:false,emissive:'#22303a'}),h=rig({h:1.2,torsoM:am,torsoR:.15,torsoL:.36,armM:am,armR:.045,armL:.3,handM:am,noLegs:true});
    pt(LP.cone6,cmat('#98a8c8',null,{transparent:true,opacity:.3,depthWrite:false,side:TH.DoubleSide}),0,.15,0,.24,.55,.22,h.lo,Math.PI);pt(LP.box,am,0,.0,.05,.04,.4,.3,h.hand[0]);
    pt(LP.cyl6,am,0,-.04,0,.1,.04,.1,h.head);for(let n=0;n<4;n++){const a=n/4*TAU+.4;pt(LP.box,am,Math.cos(a)*.08,.06,Math.sin(a)*.08,.012,.16,.012,h.head)}pt(LP.cone6,am,0,.17,0,.11,.06,.11,h.head);
    h.fx.flame=pt(LP.oct,glowM('#9ad8ff'),0,.05,0,.05,.08,.05,h.head);return h},
  pose(h){h.arms[0].rotation.set(-.8,-.2,0)},
  idle(h,e,s,dt){h.root.position.y=.12+Math.sin(T*1.1)*.05;h.fx.flame.scale.set(.05,.08+Math.sin(T*13)*.02,.05);h.fx.flame.rotation.y=T*2}};
/* Bram, the sleeper: huge and round, propped against a wall under a long nightcap, stubbled and red-cheeked. He wakes when you come close */
CHAR.bram={name:'Bram',hw:8,hh:6,beh:'sleep',turn:2,breath:.9,ang0:0,
  build(){const sh=cmat('#ffffff',cloth('#6a5a7a','patch','#8a6a4a')),h=rig({prop:'sitter',h:1.05,torsoM:sh,torsoR:.24,torsoL:.3,torsoD:1,armM:sh,armR:.06,armL:.24,handM:skinM('#d8a880'),handS:.08,legM:cmat('#ffffff',cloth('#4a3a2a')),shoeM:skinM('#2a2018'),legR:.07,hipW:.12,shoeW:.13,neck:.08,shW:.25});
    pt(LP.ball,sh,0,.12,.04,.27,.24,.25,h.up);pt(LP.box,cmat('#ffffff',cloth('#7a3a3a','check','#5a2a2a')),0,.03,.12,.42,.04,.3,h.lo);
    faceHead(h,h.head,'bram','#d8a880',{hair:'#6a5a4a',hairH:4,eyes:'droop',brows:'flat',mouth:'smile',extra:(p,c,y)=>{p('#c88a7a',c-6,y+4,2,2);p('#c88a7a',c+5,y+4,2,2);for(let x=c-4;x<=c+4;x+=2)p('#b8906a',x,y+9)}},.14,.14,.14);
    const cap=grp(h.head,0,.1,0);pt(LP.cone6,cmat('#ffffff',cloth('#3a4a7a','stripe','#c8c0a8')),0,.1,-.05,.13,.32,.13,cap,-.9);pt(LP.ball,skinM('#e8e0d0'),0,.12,-.3,.05,.05,.05,cap);
    h.fx.z=[0,1,2].map(n=>{const z=pt(LP.box,cmat('#e8e8ff',pxt('zz',5,5,p=>{p('#e8e8ff',0,0,5,1);p('#e8e8ff',3,1);p('#e8e8ff',2,2);p('#e8e8ff',1,3);p('#e8e8ff',0,4,5,1)}),{transparent:true,alphaTest:.5,side:TH.DoubleSide}),0,0,0,.08,.08,.001,h.root);return z});return h},
  pose(h){h.legs.forEach((l,n)=>l.rotation.set(-1.45,0,n?-.3:.3));h.body.position.y=.12;h.up.rotation.x=-.32;h.arms.forEach((a,n)=>a.rotation.set(-.3,0,n?-.5:.5))},
  idle(h,e,s,dt){const aw=!!e.awake;h.fx.shut=!aw;
    const b=Math.sin(T*(aw?1.6:.9))*.5+.5;h.up.scale.set(1+b*.05,1+b*.03,1+b*.06);h.head.rotation.x=aw?-.1:.35+Math.sin(T*.9)*.06;h.up.rotation.x=aw?-.15:-.32;
    h.fx.z.forEach((z,n)=>{const k=((T*.4+n/3)%1);z.visible=!aw;z.position.set(.12+k*.25,.85+k*.5,.1);z.scale.setScalar(.06+k*.06);z.lookAt(G3.cam.position)})}};
/* Oda, the listener: very tall, a long neck, a long pale face with half-shut eyes and one long ear-trumpet; she spends her days with her ear pressed to the tree */
CHAR.oda={name:'Oda',hw:5,hh:4,beh:'listen',radius:44,speed:7,gait:'glide',turn:1.6,breath:1.3,
  build(){const sw=cmat('#ffffff',cloth('#5e5a56','seam','#4e4a46'),{side:TH.DoubleSide}),h=rig({prop:'adult',h:1.32,torsoM:cmat('#ffffff',cloth('#5e5a56')),torsoR:.1,torsoL:.36,armM:cmat('#ffffff',cloth('#5e5a56')),armR:.03,armL:.32,handM:skinM('#c8c0b8'),noLegs:true,neck:.22,shW:.13});
    pt(LP.bell,sw,0,.25,0,.24,.52,.22,h.lo);pt(LP.cyl5,skinM('#c8c0b8'),0,-.12,0,.035,.2,.035,h.head);faceHead(h,h.head,'oda','#c8c0b8',{hair:'#5a5652',hairH:7,eyes:'lid',eye:'#7aa8b8',brows:'thin',mouth:'small',extra:(p,c,y)=>{for(const x of[-5,-3,3,5])p('#a89a8a',c+x,y+5)}},.09,.13,.09);
    const horn=grp(h.head,.08,.04,0);pt(LP.cone6,skinM('#d8d0c0'),.12,0,0,.06,.24,.06,horn,0,0,Math.PI/2);pt(LP.cyl6,skinM('#a8a090'),.24,0,0,.07,.02,.07,horn,0,0,Math.PI/2);
    pt(LP.cone6,sw,0,.03,-.03,.14,.3,.13,h.up,Math.PI);return h},
  pose(h){h.arms[0].rotation.set(-.15,0,.12);h.arms[1].rotation.set(-.15,0,-.12)},
  idle(h,e,s,dt,w){if(e.mode==='listen'&&!w){h.head.rotation.z=-.55;h.up.rotation.z=-.15;h.arms[0].rotation.set(-2.2,.4,.6);if(e.jolt>0){h.head.rotation.z=-.1;h.up.rotation.x=-.12}else h.up.rotation.x=0}else{h.head.rotation.z=Math.sin(T*.5)*.15;h.up.rotation.z=0}}};
/* Fen, the lamplighter: a small, soot-smudged child with a candle burning on top of the head, a long pole, and a round of lamps to keep lit */
CHAR.fen={name:'Fen',hw:5,hh:4,beh:'patrol',path:[[0,0],[4,0],[4,-2],[0,-2]],speed:20,gait:'march',turn:6,breath:2.4,cadence:10,
  build(){const ct=cmat('#ffffff',cloth('#8a5a2e','patch','#6a4a8a')),h=rig({prop:'kid',h:.78,torsoM:ct,torsoR:.12,torsoL:.27,armM:ct,armR:.035,armL:.22,handM:skinM('#e8c8a0'),legM:cmat('#ffffff',cloth('#3a3a3a','stripe','#6a6a6a')),shoeM:skinM('#2a1a14')});
    pt(LP.cone6,ct,0,.08,0,.18,.18,.16,h.lo,Math.PI);faceHead(h,h.head,'fen','#e8c8a0',{hair:'#3a2a20',hairH:6,eyes:'round',eye:'#8a5a1a',brows:'flat',mouth:'flat',extra:(p,c,y)=>{p('#6a5a50',c-6,y+4,2,1);p('#6a5a50',c+4,y-1,2,1);p('#6a5a50',c-1,y+9,2,1)}},.13,.13,.13);
    pt(LP.cyl6,skinM('#3a2a20'),0,.12,0,.1,.04,.1,h.head);const cd=grp(h.head,0,.14,0);pt(LP.cyl6,skinM('#efe6d0'),0,.07,0,.035,.14,.035,cd);for(let n=0;n<3;n++)pt(LP.box,skinM('#efe6d0'),Math.cos(n*2.1)*.035,.02,Math.sin(n*2.1)*.035,.012,.05,.012,cd);
    h.fx.flame=pt(LP.cone4,glowM('#ffc85a'),0,.18,0,.025,.07,.025,cd);const pole=grp(h.hand[1],0,0,0);pt(LP.cyl5,skinM('#6a4a2a'),0,.4,0,.012,1.0,.012,pole);pt(LP.tor,skinM('#4a4a4a'),0,.9,.04,.035,.035,.035,pole,Math.PI/2);h.fx.pole=pole;return h},
  pose(h){h.arms[1].rotation.set(-.35,0,-.1)},
  idle(h,e,s,dt,w){h.fx.flame.scale.set(.025,.07+Math.sin(T*15)*.02,.025);if(e.mode==='light'){h.arms[1].rotation.set(-2.4,0,-.2);h.head.rotation.x=-.5}else h.head.rotation.x=0}};
/* Pell and Poll: two small children inside one long patchwork coat. One dark-haired, one fair. They finish each other's sentences */
CHAR.twins={name:'Pell & Poll',hw:8,hh:5,beh:'wander',radius:18,speed:12,gait:'shuffle',turn:3,breath:2.8,cadence:9,
  build(){const pc2=cmat('#ffffff',cloth('#5a4a6a','check','#6a5a3a'),{side:TH.DoubleSide}),h=rig({h:.8,hipW:.12,torsoM:null,armM:cmat('#ffffff',cloth('#5a4a6a')),armR:.035,armL:.22,handM:skinM('#e8c8a0'),legM:cmat('#ffffff',cloth('#3a2a2a')),shoeM:skinM('#2a1e14'),shW:.27});
    pt(LP.bell,pc2,0,.38,0,.36,.48,.2,h.lo);pt(LP.box,pc2,0,.66,0,.5,.12,.2,h.lo);h.fx.heads=[-1,1].map(sd=>{const hd=grp(h.up,sd*.12,.42,0);const tm=faceHead(h,hd,'twin'+sd,sd<0?'#e8c8a0':'#d8b890',sd<0?{hair:'#c8a868',hairH:6,noBlink:1,eyes:'big',eye:'#5a3a1a',mouth:'smile',extra:(p,c,y)=>{for(const x of[-4,3])p('#c8865a',c+x,y+5)}}:{hair:'#2a2a3a',hairH:6,noBlink:1,eyes:'lid',eye:'#2a2a2a',brows:'down',mouth:'grin'},.11,.11,.11);(h.fx.twinHeads=h.fx.twinHeads||[]).push(tm);pt(LP.cyl6,skinM(sd<0?'#c8a868':'#2a2a3a'),0,.08,-.02,.11,.05,.11,hd);return{hd}});
    h.head.visible=false;return h},
  idle(h,e,s,dt,w){const [a,b]=h.fx.heads;const talk=Math.sin(T*.8);a.hd.rotation.y=talk>.3?.6:e.look!=null?h.head.rotation.y:.1;b.hd.rotation.y=talk>.3?-.6:e.look!=null?h.head.rotation.y:-.1;a.hd.rotation.z=Math.sin(T*1.3)*.1;b.hd.rotation.z=Math.sin(T*1.3+1.5)*.1;
    a.hd.position.y=.42+Math.abs(Math.sin(s.ph))*.02;b.hd.position.y=.42+Math.abs(Math.sin(s.ph+Math.PI))*.02}};
CHAR._={name:'',hw:6,hh:5,beh:'stay',gait:'walk'};

/* ---------- who they are: voice, manner and dress ----------
   voice: how they sound (see Part 6v) · persona: blink pace (blink [min,max] seconds, dbl blinks twice), gestures they make
   on their own (gest), how they react when you come close (react), how they use their hands while talking (talk).
   dress: the accessories that make each one themselves, added on top of the body their build() made. */
const ACC={
  /* beads round the neck on a torso: y height, r spread, n beads, cols colours, sz bead size, drop how low the middle hangs */
  beads(up,y,r,n,cols,sz,drop){for(let i=0;i<n;i++){const a=Math.PI*(.12+.76*i/(n-1));pt(LP.ball,skinM(cols[i%cols.length]),-Math.cos(a)*r,y-Math.sin(a)*(drop||.04),Math.sin(a)*r*.95,sz,sz,sz,up)}},
  scarf(up,y,r,col,tail){pt(LP.tor,cmat('#ffffff',cloth(col,'stripe',shade(col,.75))),0,y,0,r,r,r*1.3,up,Math.PI/2);if(tail)pt(LP.box,cmat('#ffffff',cloth(col,'stripe',shade(col,.75))),tail[0],y-tail[2]/2,r*.9,.045,tail[2],.015,up,-.15,0,tail[1])},
  braid(par,x,y,z,n,col,sz,dy){for(let i=0;i<n;i++)pt(LP.ball,skinM(col),x,y-i*dy,z-i*.012,sz*(1-i*.08),sz*1.2*(1-i*.08),sz*(1-i*.08),par)},
  glasses(head,ex,ey,ez,r,col){for(const sd of[-1,1])pt(LP.tor,skinM(col),sd*ex,ey,ez,r,r,r*.6,head);pt(LP.box,skinM(col),0,ey,ez+.004,ex*.7,.006,.006,head)}};
Object.assign(CHAR.maren,{voice:{f0:178,sc:1.1,vow:'ao@e',cons:'hmn ',rate:6.5,len:.09,breath:.35,vib:4.5,vd:.012,glide:[1.0,.92],wobble:.05,oq:.66,vol:.2,greet:'hm',laugh:'hoho',react:'hm',idle:['hum','scrape','sigh','scrape']},
  persona:{blink:[3,7],gest:['look','tilt','nod'],react:'nod',talk:'still'},
  dress(h){const H=h.head;pt(LP.ball,skinM('#a8a8b0'),0,.115,-.055,.06,.05,.06,H);pt(LP.box,skinM('#c8ccd8'),.03,.135,-.06,.006,.012,.15,H,0,.7,.3);pt(LP.box,skinM('#5a3a22'),.085,.16,-.1,.012,.02,.05,H,0,.7,.3);
    pt(LP.cone6,skinM('#d0ac8a'),0,-.01,.1,.017,.055,.021,H,Math.PI/2+.25);for(const sd of[-1,1]){pt(LP.ball,skinM('#7a5a3a'),sd*.088,-.045,0,.012,.018,.012,H);pt(LP.ball,skinM('#9a7a4a'),sd*.088,-.075,0,.009,.012,.009,H)}
    pt(LP.bell,cmat('#ffffff',cloth('#7a4a52','stripe','#6a3a44'),{side:TH.DoubleSide}),0,.315,0,.19,.13,.16,h.up);ACC.beads(h.up,.3,.075,9,['#8a6a44','#6a4a2c','#a8885a'],.012,.06);pt(LP.box,skinM('#a8885a'),0,.225,.085,.02,.028,.01,h.up);
    pt(LP.box,cmat('#ffffff',cloth('#8a7a62')),0,.2,.13,.16,.3,.012,h.lo,-.22);for(let i=0;i<3;i++)pt(LP.tor,skinM('#d8c8a0'),-.05+i*.05,.05,.17,.012,.012,.006,h.lo,.4,i)}});
Object.assign(CHAR.tobin,{voice:{f0:430,sc:1.32,vow:'aeiA',cons:'hbdk ',rate:11,len:.055,breath:.2,vib:8,vd:.02,glide:[1.08,1.0],wobble:.1,oq:.55,vol:.19,greet:'hey',laugh:'giggle',react:'oh',surprise:'eep',idle:['hum','chuckle','whistle','breath']},
  persona:{blink:[1.2,3],gest:['scratch','hop','look','cross','shift','stretch'],react:'wave',talk:'hands'},
  dress(h){const H=h.head;pt(LP.ball,skinM('#3a6ab8'),0,.078,-.012,.142,.078,.148,H);pt(LP.box,skinM('#2a5aa8'),0,.07,-.15,.12,.016,.08,H,-.2);pt(LP.ball,skinM('#e8e2d0'),0,.155,-.012,.022,.022,.022,H);
    for(const sd of[-1,1])pt(LP.ball,skinM('#e0b48a'),sd*.122,-.005,-.01,.024,.042,.03,H);
    pt(LP.box,skinM('#7a5a3a'),.06,h.hipY-.06,-.1,.012,.07,.012,h.lo);for(const sd of[-1,1])pt(LP.box,skinM('#7a5a3a'),.06+sd*.014,h.hipY-.005,-.1,.01,.04,.01,h.lo,0,0,sd*.4);
    pt(LP.cyl6,skinM('#e8e2d4'),0,-.015,0,.05,.032,.05,h.knees[0]);pt(LP.box,skinM('#c84a3a'),0,-.015,.048,.016,.016,.006,h.knees[0])}});
Object.assign(CHAR.edda,{voice:{f0:232,sc:1.17,vow:'o@ue',cons:'hm ',rate:6,len:.1,breath:.45,vib:5.5,vd:.035,glide:[1.02,.9],wobble:.04,oq:.7,vol:.19,greet:'oh',laugh:'heh',react:'sigh',surprise:'gasp',idle:['sigh','hum','sniff']},
  persona:{blink:[4,8],gest:['look','tilt'],react:'nod',talk:'still',mood:'sad'},
  dress(h){pt(LP.tor,skinM('#e8e4dc'),0,.3,0,.068,.068,.075,h.up,Math.PI/2);for(let i=0;i<8;i++){const a=i/8*TAU;pt(LP.ball,skinM('#e8e4dc'),Math.cos(a)*.072,.29,Math.sin(a)*.066,.012,.012,.012,h.up)}
    pt(LP.ball,cmat('#c8a040',null,{emissive:'#3a2a08'}),0,.215,.09,.018,.024,.01,h.up);ACC.beads(h.up,.28,.06,7,['#2a2a2a'],.006,.06)}});
Object.assign(CHAR.corvo,{voice:{f0:192,sc:.98,vow:'aA@e',cons:'kdh ',rate:10,len:.06,breath:.3,vib:7,vd:.02,glide:[1.1,.95],wobble:.12,jit:.05,oq:.5,vol:.21,greet:'heh',laugh:'kraa',react:'heh',surprise:'kraa',confused:'hm',idle:['clink','mutter','chuckle','clink']},
  persona:{blink:[1.5,4],dbl:1,gest:['rub','look','tilt'],react:'bow',talk:'hands',mood:'happy'},
  dress(h){const H=h.head;ACC.glasses(H,.036,.012,.098,.022,'#b8a060');pt(LP.cone6,skinM('#b8a890'),0,-.012,.12,.02,.075,.024,H,Math.PI/2+.15);
    ACC.scarf(h.up,.345,.072,'#2a5a5a',[.05,-.1,.26]);
    for(const[x,y,c]of[[.19,.14,'#5a5a62'],[-.18,.2,'#6a4a2a'],[.15,.34,'#8a8a92']]){pt(LP.cyl8,skinM(c),x,y,-.24,.045,.05,.045,h.up);pt(LP.tor,skinM('#3a3a3a'),x,y+.04,-.24,.02,.02,.02,h.up)}
    pt(LP.box,skinM('#9a9aa2'),-.2,.05,-.2,.01,.12,.03,h.up,0,0,.2);pt(LP.ball,cmat('#ffffff',cloth('#6a4a2a')),.12,h.hipY-.03,.06,.04,.05,.035,h.lo);pt(LP.ball,skinM('#c8a040'),.12,h.hipY+.02,.08,.012,.012,.012,h.lo)}});
Object.assign(CHAR.ilse,{voice:{f0:158,sc:1.1,vow:'o@u',cons:'hbm ',rate:6.5,len:.085,breath:.3,vib:4,vd:.01,glide:[.98,.9],wobble:.05,jit:.03,oq:.5,vol:.2,greet:'hm',laugh:'heh',react:'grunt',idle:['whistle','reel','mutter']},
  persona:{blink:[3,6],gest:['shift','look'],react:'grumble',talk:'still'},
  dress(h){const H=h.head;pt(LP.ball,skinM('#b07a50'),0,-.045,.12,.028,.024,.028,H);ACC.braid(H,0,-.06,-.11,5,'#8a8a8a',.03,.055);pt(LP.box,skinM('#5a3a2a'),0,-.33,-.15,.02,.03,.012,H);
    for(const[x,z,r]of[[.2,.06,-.3],[.22,-.03,.25]]){pt(LP.ico,skinM('#8aa0b0'),x,h.hipY-.11,z,.03,.075,.018,h.lo,0,0,r);pt(LP.cone4,skinM('#7a90a0'),x,h.hipY-.18,z,.02,.03,.008,h.lo,Math.PI)}}});
Object.assign(CHAR.hermit,{voice:{f0:104,sc:.92,vow:'o@a',cons:'hmk ',rate:5.5,len:.1,breath:.4,vib:5,vd:.025,glide:[1.0,.88],wobble:.06,jit:.07,oq:.55,vol:.24,greet:'throat',laugh:'wheeze',react:'hm',confused:'throat',angry:'grunt',surprise:'grunt',idle:['throat','cough','mutter','throat']},
  persona:{blink:[2,5],gest:['scratch','look'],react:'grumble',talk:'still'},
  dress(h){const H=h.head;pt(LP.ball,skinM('#c89070'),0,-.02,.11,.036,.032,.032,H);pt(LP.box,skinM('#e8e4dc'),0,-.05,.105,.075,.016,.022,H);for(const sd of[-1,1])pt(LP.cone4,skinM('#e8e4dc'),sd*.045,-.07,.1,.012,.04,.012,H,Math.PI,0,-sd*.3);
    pt(LP.bell,cmat('#ffffff',cloth('#3e3226','patch','#4e4030'),{side:TH.DoubleSide}),0,.27,0,.17,.12,.15,h.up);for(let i=0;i<9;i++){const a=i/9*TAU;pt(LP.cone4,skinM('#3e3226'),Math.cos(a)*.16,.2,Math.sin(a)*.14,.02,.05,.02,h.up,Math.PI)}
    for(let i=0;i<7;i++){const a=Math.PI*(.15+.7*i/6);pt(i%2?LP.cone4:LP.ball,skinM(i%2?'#e8e0c8':'#5a3a22'),-Math.cos(a)*.07,.3-Math.sin(a)*.05,Math.sin(a)*.075,.01,i%2?.025:.012,.01,h.up,i%2?Math.PI:0)}}});
Object.assign(CHAR.wick,{voice:{f0:385,sc:1.28,vow:'ei@a',cons:'bdh ',rate:9,len:.06,breath:.25,vib:7,vd:.02,glide:[1.06,.96],wobble:.08,oq:.6,vol:.19,stutter:.35,greet:'uh',laugh:'giggle',react:'eep',surprise:'eep',confused:'uh',idle:['chuckle','sniff','mutter']},
  persona:{blink:[1,2.5],gest:['fidget','cross','look','scratch','shift'],react:'hide',talk:'fidget',mood:'hesitant'},
  dress(h){const H=h.head;pt(LP.cone4,skinM('#b83a2a'),.085,.15,-.03,.012,.13,.03,H,0,.3,-.55);pt(LP.cone4,skinM('#e8e0c8'),.088,.2,-.034,.008,.05,.02,H,0,.3,-.55);
    ACC.beads(h.up,.255,.06,5,['#3a2a1a'],.006,.05);pt(LP.ball,cmat('#c8a040',null,{emissive:'#2a2008'}),0,.205,.075,.014,.014,.014,h.up);pt(LP.tor,skinM('#c8ccd8'),-.025,.21,.072,.012,.012,.006,h.up);pt(LP.oct,cmat('#c83a3a',null,{emissive:'#3a0808'}),.026,.21,.072,.01,.014,.01,h.up);
    for(const el of h.elbows)pt(LP.cyl6,skinM('#e8e2d4'),0,-.135,0,.034,.045,.034,el)}});
Object.assign(CHAR.scholar,{voice:{f0:240,sc:1.0,vow:'aeio',whisper:true,cons:'h ',rate:7,len:.08,vol:.2,greet:'hm',laugh:'heh',react:'hm',idle:['rustle','whisper','rustle']},
  persona:{blink:[3,6],gest:['tilt'],react:'nod',talk:'still',mood:'mysterious'},
  dress(h){const pg=pxt('pages',8,10,p=>{p('#e8e0c8',0,0,8,10)});h.fx.orbit=[0,1,2].map(i=>{const m=pt(LP.box,cmat('#ffffff',pg,{emissive:'#3a4a6a',transparent:true,opacity:.8}),0,0,0,.08,.1,.004,h.root);return m})}});
Object.assign(CHAR.keeper,{voice:{f0:94,sc:.85,vow:'ou',cons:'m ',rate:4.5,len:.16,breath:.2,vib:3.5,vd:.04,glide:[1,1],wobble:.03,oq:.55,vol:.21,greet:'hm',laugh:'hoho',react:'hm',idle:['hum','armour','hum']},
  persona:{blink:[3,6],gest:['tilt'],react:'bow',talk:'still'},
  dress(h){const am=cmat('#a8b8d0',null,{transparent:true,opacity:.6,depthWrite:false,emissive:'#22303a'});pt(LP.tor,am,.13,.3,.06,.04,.04,.04,h.lo,Math.PI/2);for(let i=0;i<3;i++)pt(LP.box,am,.12+i*.015,.24,.07,.008,.06,.016,h.lo,0,0,(i-1)*.3)}});
Object.assign(CHAR.bram,{voice:{f0:108,sc:.88,vow:'o@a',cons:'mh ',rate:5,len:.11,breath:.3,vib:4,vd:.015,glide:[1.02,.9],wobble:.05,oq:.6,vol:.24,greet:'yawn',laugh:'hoho',react:'yawn',surprise:'oh',confused:'hmm',idle:['snore','yawn','hum','breath']},
  persona:{blink:[4,9],gest:['scratch','yawn','stretch'],react:'nod',talk:'still'},
  dress(h){const H=h.head;pt(LP.ball,skinM('#d8907a'),0,-.02,.135,.042,.036,.036,H);for(const sd of[-1,1])pt(LP.ball,skinM('#d0a078'),sd*.14,0,-.01,.026,.042,.03,H);
    const mug=grp(h.hand[1],0,0,.02);pt(LP.cyl8,skinM('#7a5a3a'),0,-.01,.02,.032,.055,.032,mug);pt(LP.tor,skinM('#6a4a2a'),.035,-.01,.02,.018,.018,.012,mug,0,Math.PI/2);
    pt(LP.ball,cmat('#ffffff',cloth('#c8b8a0','stripe','#a89880')),0,.24,-.27,.22,.14,.09,h.up)}});
Object.assign(CHAR.oda,{voice:{f0:252,sc:1.12,vow:'iuo',cons:'hm ',rate:5.5,len:.11,breath:.5,vib:5,vd:.02,glide:[.95,1.08],wobble:.07,oq:.72,vol:.18,greet:'shh',laugh:'hm',react:'shh',surprise:'gasp',confused:'hm',idle:['hum','shh','whisper','hum']},
  persona:{blink:[5,10],gest:['tilt','look'],react:'shh',talk:'still',mood:'mysterious'},
  dress(h){const H=h.head;ACC.braid(H,0,-.05,-.085,7,'#5a5652',.026,.06);for(let i=0;i<3;i++)pt(LP.cone4,skinM('#e8e0c8'),(i-1)*.03,.09,-.08,.006,.06,.006,H,-.6,0,(i-1)*.4);
    for(let i=0;i<3;i++)pt(LP.tor,skinM('#c8a040'),-.088,-.02-i*.025,.01,.01,.01,.006,H,0,Math.PI/2);
    pt(LP.bell,cmat('#ffffff',cloth('#6a7a88','seam','#5a6a78'),{side:TH.DoubleSide}),0,.32,0,.17,.16,.15,h.up)}});
Object.assign(CHAR.fen,{voice:{f0:362,sc:1.26,vow:'aeo',cons:'hdb ',rate:9.5,len:.06,breath:.22,vib:6,vd:.015,glide:[1.05,.98],wobble:.07,oq:.58,vol:.19,greet:'hey',laugh:'heh',react:'oh',idle:['hum','match','cough']},
  persona:{blink:[2,4],gest:['wipe','look','shift'],react:'wave',talk:'hands',hand:0},
  dress(h){const H=h.head;pt(LP.cyl8,skinM('#4a3a2e'),0,.095,0,.135,.035,.135,H);pt(LP.box,skinM('#3a2a20'),0,.088,.12,.12,.012,.07,H,.15);
    pt(LP.box,cmat('#ffffff',cloth('#3a3430','patch','#4a4440')),0,.15,.105,.15,.24,.012,h.up,-.05);pt(LP.box,skinM('#6a4a2a'),-.1,h.hipY-.02,.07,.04,.05,.025,h.lo);pt(LP.box,skinM('#e8d8b0'),-.1,h.hipY+.01,.08,.006,.03,.006,h.lo)}});
Object.assign(CHAR.twins,{voice:{f0:455,sc:1.34,vow:'ieA',cons:'hbd ',rate:10,len:.055,breath:.2,vib:8,vd:.02,glide:[1.06,1.0],wobble:.08,oq:.58,vol:.18,greet:'hey',laugh:'giggle',react:'oh',idle:['whisper','chuckle','giggle'],
    two:{tag:'POLL',f0:388,sc:1.3,vow:'ao@',cons:'hmd ',rate:9,len:.065,breath:.25,vib:6,vd:.02,glide:[1.0,.94],wobble:.06,oq:.6,vol:.18,laugh:'chuckle'}},
  persona:{blink:[1.5,3],gest:['look'],react:'wave',talk:'hands'},
  dress(h){const[a,b]=h.fx.heads;pt(LP.cyl8,skinM('#a83a3a'),0,.07,0,.115,.06,.115,a.hd);pt(LP.ball,skinM('#e8e2d0'),0,.13,0,.03,.03,.03,a.hd);
    pt(LP.tor,skinM('#4a6a3a'),0,.08,0,.11,.11,.15,b.hd,Math.PI/2);for(let i=0;i<7;i++){const an=i/7*TAU;pt(LP.cone4,skinM(i%2?'#5a7a42':'#3e5a30'),Math.cos(an)*.11,.1,Math.sin(an)*.11,.02,.05,.012,b.hd,0,-an,.6)}
    for(const[x,y,c]of[[.03,.6,'#c8a040'],[-.02,.5,'#8a3a3a'],[.025,.4,'#3a6a8a']])pt(LP.ball,skinM(c),x,y,.17,.018,.018,.01,h.lo)}});
/* ---------- building, and the old names the rest of the game uses ---------- */
/* the thing in the woods (the opening): Wick as the tree has made him. Still a small boy who thinks everything is a game,
   but grey as ash, with twig horns, ember eyes that glow in the dark, a grin too wide and too full of teeth, and rags */
CHAR.imp={name:'Wick',build(o){const rag=cmat('#ffffff',cloth('#2e3424','patch','#22281a')),skin='#b9c2a0',
    h=rig({prop:'kid',h:.82,hip:.38,torsoM:rag,torsoR:.1,torsoL:.27,armM:skinM('#9ea88c'),armR:.028,armL:.27,handM:skinM('#8e987c'),handS:.07,legM:skinM('#949e84'),shoeM:skinM('#2a2420'),legR:.035});
  pt(LP.cone6,rag,0,.1,-.03,.17,.25,.15,h.up,Math.PI);for(let i=0;i<6;i++){const a=(i/6-.5)*2.4;pt(LP.box,rag,Math.sin(a)*.15,-.06-(i%3)*.03,Math.cos(a)*.13-.03,.03,.14+(i%2)*.06,.008,h.up,0,a,0)}
  const IG=boxHeadGeo({round:.32,jaw:.48,nose:.04}),ex5=['n','b','t','h','s'],F=headAtlas({skin,ex:ex5,face:impFace,sides:headSides({skin,hair:'#5a2412'})}),G=headAtlas({skin:'#000',ex:ex5,face:impGlowFace});
  h.fx.imp=F.map((t,i)=>new TH.MeshLambertMaterial({map:t,emissive:0xffffff,emissiveMap:G[i]}));h.fx.headMesh=pt(IG,h.fx.imp[0],0,0,0,.25,.25,.25,h.head);
  for(let n=0;n<9;n++){const a=n/9*TAU;pt(LP.cone4,skinM(n%2?'#6a2a14':'#8a3a1a'),Math.cos(a)*.085,.115,Math.sin(a)*.085-.02,.045,.16,.045,h.head,Math.sin(a)*.95,0,-Math.cos(a)*.95)}
  for(const sd of[-1,1]){const hr=grp(h.head,sd*.07,.1,.06);hr.rotation.set(-.15,0,-sd*.6);pt(LP.cone6,skinM('#5a3e2a'),0,.075,0,.026,.15,.026,hr);const tip=grp(hr,0,.14,0);tip.rotation.set(.45,0,sd*.55);pt(LP.cone6,skinM('#4a3222'),0,.055,0,.016,.11,.016,tip)}
  h.head.position.y+=.04;return h}};
CHAR.imp.voice=Object.assign({},CHAR.wick.voice,{f0:350,jit:.03,breath:.32,vib:5.5,vd:.03,oq:.55});
const NPCLOOK={wick:{}};
/* ---------- the Water Kingdom's people, swallowed with their forests: fish folk and lizard folk ----------
   Each keeps the clothes, build and manner they had; the head and hands are theirs. Faces are painted smooth, with the
   same seven expressions everyone has (plain, blink, talking, happy, startled, sad, cross) */
const FOLK={maren:['fish',{skin:'#5a8ab0',belly:'#c8dce8',fin:'#3a5a8a',iris:'#d8a030',lip:'#e88a7a'}],tobin:['fish',{skin:'#e8904a',belly:'#f8e0c0',fin:'#c85a2a',iris:'#3a2a1a',lip:'#e86a5a'}],
  ilse:['fish',{skin:'#4aa89a',belly:'#d0ece0',fin:'#2a7a6a',iris:'#3a2a5a',lip:'#e88a8a'}],oda:['fish',{skin:'#9a7ac0',belly:'#e8dcf0',fin:'#6a4a9a',iris:'#2a2a2a',lip:'#e87aa0'}],
  edda:['lizard',{skin:'#6a9a4a',belly:'#d8d8a0',eye:'#e8c040',crest:'#c85a2a'}],corvo:['lizard',{skin:'#7a5a3a',belly:'#d8c090',eye:'#e86a2a',crest:'#3a2a1a'}],
  hermit:['lizard',{skin:'#8a9a8a',belly:'#e0e0c8',eye:'#d8d050',crest:'#5a6a5a'}],bram:['lizard',{skin:'#4a7a6a',belly:'#c8d8b0',eye:'#f0b030',crest:'#2a4a3a'}],
  fen:['lizard',{skin:'#5a6a8a',belly:'#c8d0e0',eye:'#e8e040',crest:'#3a4a6a'}],twins:['fish',{skin:'#e8c050',skin2:'#3a5a9a',belly:'#f4ecd0',fin:'#c88a2a',iris:'#2a2a2a',lip:'#e88a7a'}]};
function toFolk(h,kind,o){const scl=cmat('#ffffff',SCALES(o.skin,shade(o.skin,.84))),fin=cmat(o.fin||o.crest,null,{side:TH.DoubleSide}),sk=cmat(o.skin,null);
  const fishG=boxHeadGeo({round:.38,jaw:.1,nose:0,snout:.06,brow:0,cheek:0}),lizG=boxHeadGeo({round:.3,jaw:.15,nose:0,snout:.24,brow:0,cheek:0});
  const headOn=(par,q,one)=>{const F=headAtlas({skin:q.skin,ex:one?['n']:FACEX,face:kind==='fish'?fishFace(q):lizFace(q),sides:kind==='fish'?fishSides(q):lizSides(q)});
    const m=kind==='fish'?pt(fishG,cmat('#ffffff',F[0]),0,0,.01,.235,.215,.26,par):pt(lizG,cmat('#ffffff',F[0]),0,0,.03,.2,.19,.27,par);
    if(kind==='fish'){pt(LP.box,fin,0,.13,-.03,.012,.08,.18,par,-.2);for(const sd of[-1,1])pt(LP.cone4,fin,sd*.13,-.02,-.02,.04,.09,.016,par,0,0,sd*1.3)}
    else{const cr=cmat(q.crest,null);for(let k=0;k<5;k++)pt(LP.cone4,cr,0,.11-k*.012,.03-k*.055,.016,.065,.026,par,-.4)}return{m,F}};
  /* the twins share one body: each head becomes a fish's, and the body takes scales */
  if(h.fx.heads){const hs=new Set();h.fx.heads.forEach(({hd},i)=>{for(const ch of hd.children)ch.visible=false;headOn(hd,Object.assign({},o,{skin:i?o.skin2:o.skin}),true);hd.traverse(m=>hs.add(m))});
    h.root.traverse(m=>{if(m.isMesh&&!hs.has(m)&&m.visible)m.material=scl});return}
  for(const ch of h.head.children)ch.visible=false;const g=grp(h.head,0,0,0),{m,F}=headOn(g,o);h.fx.faces=F;h.fx.headMesh=m;h.fx.shut=false;
  for(const hd of h.hand)hd.traverse(q=>{if(q.isMesh)q.material=sk});
  if(kind==='fish'){/* fish wear nothing: the clothes go, the body takes scales, a pale belly, a fin down the back and a tail */
    const keep=new Set([BODY.torso,BODY.upper,BODY.lower,BODY.joint]),own=new Set(),hs=new Set();h.head.traverse(q=>hs.add(q));for(const hd of h.hand)hd.traverse(q=>own.add(q));for(const k of h.knees||[])ankleOf(k).traverse(q=>own.add(q));
    let tor=null;h.root.traverse(q=>{if(!q.isMesh||hs.has(q))return;if(keep.has(q.geometry)||own.has(q)){q.material=own.has(q)&&!keep.has(q.geometry)?sk:scl;q.visible=true;if(q.geometry===BODY.torso)tor=q}else q.visible=false});
    const tl=tor?tor.scale.y:.3,tr=tor?tor.scale.x:.13;pt(LP.cone4,fin,0,tl*.62,-tr*.85,.016,tl*.55,.11,h.up,-.35);pt(LP.cone4,fin,0,h.hipY-.02,-.1,.014,.13,.1,h.lo,-2.1);
    pt(LP.ball,cmat(o.belly,null),0,tl*.48,tr*.42,tr*.7,tl*.36,tr*.45,h.up)}}
function mkNpc(id,o){const C=CHAR[id]||CHAR._;const h=C.build?C.build(o||{}):rig({torsoM:skinM('#888'),armM:skinM('#888'),handM:skinM('#888'),legM:skinM('#666'),shoeM:skinM('#333')});h.cid=id;if(C.dress)C.dress(h,o||{});if(C.pose)C.pose(h);
  const FK=FOLK[id];if(FK)toFolk(h,FK[0],FK[1]);h.base=snapPose(h);return h}
function mkHuman(o){return mkNpc('wick',{bare:true})}
/* remember a character's resting pose so animation can start from it every frame */
function snapPose(h){const r=[];const take=o=>r.push([o,o.rotation.clone(),o.position.clone(),o.scale.clone()]);[h.body,h.up,h.head,...h.legs,...(h.knees||[]),...h.arms,...(h.elbows||[]),h.root,h.lo].forEach(take);return r}
function restPose(h){for(const[o,rt,ps,sc]of h.base){o.rotation.copy(rt);o.position.copy(ps);o.scale.copy(sc)}}

/* ---------- the hero: a young traveller with real proportions (the head about a sixth of the height, long legs),
   a slate-blue hooded coat to mid-thigh, an orange scarf, a leather belt, tall boots and bracers, a sword at the hip
   and a round wooden shield. Same named parts as every other rig, so all the animation code works on it. ---------- */
/* ---------- models made in Blender (tools/models), packed into MODELS: geometry from base64, textures from data URLs ---------- */
const MTEX={},MGEO={};
function mtex(model,k){const id=model+':'+k;if(MTEX[id])return MTEX[id];const img=new Image(),t=new TH.Texture(img);t.wrapS=TH.RepeatWrapping;t.anisotropy=4;img.onload=()=>{t.needsUpdate=true};img.src=MODELS[model].tex[k];return MTEX[id]=t}
const unb64=s=>{const r=atob(s),a=new Uint8Array(r.length);for(let i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a.buffer};
function mgeo(model,part){const id=model+':'+part;if(MGEO[id])return MGEO[id];const P=MODELS[model].parts[part],g=new TH.BufferGeometry(),U=new Uint16Array(unb64(P.u)),uv=new Float32Array(U.length);
  for(let i=0;i<U.length;i++)uv[i]=U[i]/65535*(P.uh&&!(i&1)?2:1);
  g.setAttribute('position',new TH.BufferAttribute(new Float32Array(unb64(P.p)),3));g.setAttribute('normal',new TH.BufferAttribute(new Int8Array(unb64(P.n)),3,true));g.setAttribute('uv',new TH.BufferAttribute(uv,2));
  g.setIndex(new TH.BufferAttribute(new Uint16Array(unb64(P.i)),1));g.computeBoundingSphere();return MGEO[id]=g}
function mpart(model,part,par,side){const P=MODELS[model].parts[part],m=new TH.Mesh(mgeo(model,part),cmat('#ffffff',mtex(model,P.t),side?{side:TH.DoubleSide}:undefined));par.add(m);return m}
function mkHero(){const coatT=cloth('#3e4c68','seam','#34405a'),coat=cmat('#ffffff',coatT),coat2=cmat('#ffffff',coatT,{side:TH.DoubleSide}),lea=cmat('#ffffff',cloth('#5a3a24')),boot=cmat('#ffffff',cloth('#3a281a')),skin='#e0b08a';
  const glove=cmat('#ffffff',cloth('#4e3220')),h=rig({h:1,hip:.4,torsoM:coat,torsoR:.135,torsoL:.29,torsoD:.84,neck:.06,neckM:skinM(skin),armM:coat,armR:.04,armL:.31,handM:glove,gloveM:glove,handS:.064,legM:cmat('#ffffff',cloth('#5a4c3e')),bootM:boot,bootCuffM:cmat('#ffffff',cloth('#4a3424')),shoeM:boot,legR:.05,hipW:.07,shW:.17,shoeW:.11,shoeL:.17});
  const H=h.hipY;
  /* the hero made in Blender (tools/models), when it is packed in: his parts hang from the same joints, so all the animation still works */
  const BM=typeof MODELS!=='undefined'&&MODELS.hero;
  if(BM){const strip=[];h.root.traverse(o=>{if(o.isMesh)strip.push(o)});strip.forEach(o=>o.parent.remove(o));
    const mp=(p,par,side)=>BM.parts[p]?mpart('hero',p,par,side):null;mp('torso',h.up);mp('neck',h.up);mp('hood',h.up);mp('scarf',h.up);mp('skirt',h.lo,true);mp('belt',h.lo);
    h.tail=grp(h.up,.03,.275,-.085);mp('tail',h.tail);h.cape=grp(h.up,0,.26,-.11);
    h.fx.headMesh=mp('head',h.head);h.fx.faces=[mtex('hero','head'),mtex('hero','shut')];mp('hair',h.head);mp('cap',h.head);mp('ears',h.head);
    for(let i=0;i<2;i++){mp('uarm',h.arms[i]);mp('farm',h.elbows[i]);mp(i?'handR':'handL',h.hand[i]);mp('thigh',h.legs[i]);mp('shin',h.knees[i]);mp('foot',ankleOf(h.knees[i]))}}
  else{
  /* coat skirt to mid-thigh, belt and buckle, a pouch on the right hip */
  pt(LP.skirt,coat2,0,H-.08,0,.165,.2,.145,h.lo);pt(LP.cyl8,lea,0,H+.015,0,.142,.04,.122,h.lo);pt(LP.box,skinM('#c8a040'),0,H+.015,.122,.04,.035,.012,h.lo);pt(LP.box,lea,-.135,H-.05,.04,.05,.07,.04,h.lo,0,.4);
  /* the head: a boy's, squarish, with a jaw and a nose; big eyes, his own complexion, brown hair with a fringe, the hood down */
  const HG=boxHeadGeo({round:.28,jaw:.1,nose:.09,brow:.045}),hs={skin:'#eebf98',hair:'#4a2e1a'},face=headAtlas({skin:hs.skin,face:humanFace({skin:hs.skin,iris:'#4a78b0',brow:'#4a2e1a',hair:hs.hair,hairY:18}),sides:headSides(hs)});
  h.fx.headMesh=pt(HG,cmat('#ffffff',face[0]),0,0,0,.16,.185,.17,h.head);h.fx.faces=face;
  pt(HG,new TH.MeshLambertMaterial({map:hairShellTex(hs.hair),alphaTest:.5,side:TH.DoubleSide}),0,.005,-.005,.171,.197,.182,h.head);
  {const hm=skinM('#4a2e1a'),hm2=skinM('#5a3a22');for(let i=0;i<5;i++){const x0=(i-2)*.03;pt(LP.cone6,i%2?hm2:hm,x0,.098,-.01-Math.abs(x0)*.3,.022,.06,.018,h.head,-.5+i*.05,0,-x0*4)}
    for(const sd of[-1,1])pt(LP.cone6,hm2,sd*.05,.07,-.085,.022,.07,.016,h.head,Math.PI+.7,0,sd*.3)}
  for(const sd of[-1,1])pt(LP.ball,skinM(shade(skin,.92)),sd*.087,-.01,-.004,.013,.026,.018,h.head);
  /* the hood: rounded, framing the face, falling into a short drape on the shoulders */
  const hood=cmat('#ffffff',cloth('#34405a'),{side:TH.DoubleSide});
  pt(LP.bell,hood,0,.255,-.03,.2,.13,.18,h.up);
  /* scarf round the neck with a tail that blows about */
  pt(LP.tor,skinM('#d8742a'),0,.27,0,.088,.088,.1,h.up,Math.PI/2);h.tail=grp(h.up,.03,.275,-.085);pt(LP.box,cmat('#ffffff',cloth('#d8742a','stripe','#b85a1a')),0,-.12,0,.055,.24,.02,h.tail);
  /* a short travelling cloak from the shoulders */
  h.cape=grp(h.up,0,.26,-.11);pt(LP.box,hood,0,-.17,0,.26,.34,.02,h.cape);
  }
  /* grandfather's sword: a diamond-section blade whose ridge catches the light, a brass guard with down-swept ends,
     a grip bound in dark leather and a brass pommel. In the hand when drawn, otherwise in a scabbard on the back */
  const brass=metalM('#e0b860',{r:.7}),grip=cmat('#ffffff',cloth('#4a2c18','stripe','#2a180c')),sw=grp(h.hand[1],0,.02,0);
  pt(LP.cyl6,grip,0,-.015,0,.017,.1,.017,sw);pt(LP.ball,brass,0,.045,0,.026,.024,.026,sw);
  pt(LP.box,brass,0,-.075,0,.15,.022,.034,sw);for(const sd of[-1,1])pt(LP.box,brass,sd*.084,-.088,0,.026,.042,.03,sw,0,0,sd*.5);pt(LP.ball,brass,0,-.075,0,.03,.026,.03,sw);
  const bm=new TH.MeshPhongMaterial({color:0xd6dade,specular:0x606060,shininess:36,envMap:ENVT,combine:TH.MultiplyOperation,reflectivity:.55});h.bladeMat=bm;
  const bg=grp(sw,0,-.09,0);h.bladeG=bg;h.blade=pt(BLADEG,bm,0,-.22,0,.024,.44,.0075,bg);pt(TIPG,bm,0,-.475,0,.024,.07,.0075,bg,Math.PI);
  h.tipM=grp(bg,0,-.5,0);h.baseM=grp(bg,0,-.02,0);h.sword=sw;
  /* sheathed, the sword goes across his back: the hilt over the right shoulder, the point down by the left hip */
  h.back=grp(h.up,.05,.21,-.13);h.back.rotation.set(-.12,0,Math.PI-.6);pt(LP.box,lea,0,.25,0,.05,.5,.022,h.back);pt(LP.box,brass,0,.5,0,.056,.03,.028,h.back);
  /* the hilt sticking out of the sheath: it goes when the sword is drawn, the empty sheath stays */
  h.backHilt=grp(h.back,0,0,0);pt(LP.cyl6,grip,0,-.06,0,.016,.1,.016,h.backHilt);pt(LP.box,brass,0,.005,0,.14,.022,.034,h.backHilt);pt(LP.ball,brass,0,-.12,0,.024,.022,.024,h.backHilt);
  /* no shield: the group stays (the scenes and the rest of the game look for it) but holds nothing */
  h.shield=grp(h.arms[0],-.05,-.2,0);
  h.hook=grp(h.hand[1],0,.02,0);pt(LP.box,skinM('#8a8a96'),0,-.06,0,.07,.18,.07,h.hook);pt(LP.cone4,skinM('#c8ccd8'),0,-.18,0,.05,.08,.05,h.hook,Math.PI);
  h.held=new TH.Sprite(new TH.SpriteMaterial({transparent:true,depthTest:false}));h.held.scale.set(.5,.5,1);h.held.position.y=1.3;h.held.visible=false;h.root.add(h.held);
  const ring=new TH.Mesh(new TH.RingGeometry(.55,1.05,10,1,-.95,1.9),new TH.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35,side:TH.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.55;ring.visible=false;h.root.add(ring);h.trail=ring;
  /* a kid's head: big next to the body, the way heroes of that era were drawn, on a neck that shows */
  h.head.scale.setScalar(BM?1:1.42);h.head.position.y+=BM?.125:.075;
  h.cid='hero';h.base=snapPose(h);return h}

/* ---------- the things in the dark: built the same way, with no faces to speak of ---------- */
/* ---------- the things in the wood: goblins (some of them grown wrong), lizard people and the restless dead ----------
   Internal type ids are the old ones (the game's rooms and rules use them): slime = goblin, spitter = mutated goblin rooted in
   the tree, crab = lizard spearman with a shield, ghoul = lizard hunter, husk = skeleton, knight = skeleton knight, shade = shade. */
const SCALES=(a,b)=>pxt('scl'+a+b,8,8,p=>{p(a,0,0,8,8);for(let y=0;y<8;y+=2)for(let x=(y>>1)%2;x<8;x+=2)p(b,x,y)});
function skullOn(par,bone,dark,eye,o){o=o||{};const s=o.s||1;
  pt(LP.head,bone,0,.03*s,-.01*s,.11*s,.115*s,.12*s,par);pt(LP.box,bone,0,-.035*s,.05*s,.085*s,.05*s,.075*s,par);
  for(const sd of[-1,1]){pt(LP.ball,dark,sd*.042*s,.018*s,.088*s,.03*s,.032*s,.022*s,par);if(eye)pt(LP.ball,eye,sd*.042*s,.018*s,.1*s,.011*s,.011*s,.008*s,par);pt(LP.ball,bone,sd*.085*s,.0,.03*s,.03*s,.035*s,.05*s,par)}
  pt(LP.cone4,dark,0,-.01*s,.112*s,.012*s,.022*s,.008*s,par,Math.PI);
  const jaw=grp(par,0,-.05*s,.0);pt(LP.box,bone,0,-.02*s,.055*s,.08*s,.028*s,.06*s,jaw);pt(LP.box,skinM('#ece4cc'),0,-.003*s,.082*s,.07*s,.012*s,.01*s,jaw);return jaw}
function mkCreature(t){const g=new TH.Group(),u={};g.userData=u;let h;
  const bone=skinM('#d8d0b8'),boneD=skinM('#a89f88'),hole=skinM('#141010'),ember=glowM('#ff7a2a');
  if(t==='husk'){/* a skeleton: ribs, spine and pelvis on bare bones, a rag at the hips, a rusted blade, embers in its eyes */
    h=rig({h:1.1,hunch:.3,armM:bone,armR:.017,armL:.34,handM:bone,handS:.06,legM:bone,legR:.019,shoeM:boneD,shoeW:.075,shoeL:.13,neck:.13,shW:.15});
    for(let i=0;i<5;i++)pt(LP.tor,bone,0,.12+i*.045,.0,.11-Math.abs(i-2)*.012,.085-Math.abs(i-2)*.01,.2,h.up,Math.PI/2);
    pt(LP.cyl6,boneD,0,.16,-.06,.016,.36,.016,h.up);pt(LP.box,bone,0,.2,.08,.025,.16,.012,h.up);pt(LP.ball,bone,0,.31,0,.13,.025,.04,h.up);
    pt(LP.tor,bone,0,h.hipY+.01,0,.075,.055,.35,h.lo,Math.PI/2);pt(LP.skirt,cmat('#ffffff',cloth('#4a4234','patch','#3a3428'),{side:TH.DoubleSide}),0,h.hipY-.06,0,.1,.13,.09,h.lo);
    h.fx.jaw=skullOn(h.head,bone,hole,ember);const sw=grp(h.hand[1],0,0,0);pt(LP.box,skinM('#7a5a3a'),0,-.03,0,.02,.07,.02,sw);pt(LP.box,skinM('#8a6a4a'),0,-.22,0,.03,.3,.05,sw);pt(LP.box,skinM('#5a3a22'),0,-.07,0,.08,.015,.02,sw)}
  else if(t==='knight'){/* a skeleton knight: dented armour on old bones, a helm it never takes off, sword and shield */
    const ar=metalTex(pxt('armour2',8,8,p=>{p('#7a7a86',0,0,8,8);p('#9a9aa6',0,0,8,1);p('#5a5a66',0,4,8,1);p('#5a5a66',3,0,1,8);p('#6a4a3a',5,6);p('#6a4a3a',1,2)}),.55);
    h=rig({h:1.18,torsoM:ar,torsoR:.14,torsoL:.33,armM:bone,armR:.02,armL:.29,handM:bone,handS:.06,legM:bone,legR:.022,shoeM:skinM('#5a5a66'),shoeW:.09,shoeL:.15,neck:.12});
    for(const sd of[-1,1]){pt(LP.ball,ar,sd*.17,.32,0,.075,.055,.08,h.up);pt(LP.cyl6,ar,0,-.06,0,.035,.08,.035,h.knees[sd<0?0:1])}
    pt(LP.skirt,ar,0,h.hipY-.05,0,.15,.12,.13,h.lo);skullOn(h.head,bone,hole,null);
    pt(LP.cyl6,ar,0,.1,0,.135,.13,.135,h.head);pt(LP.cone6,ar,0,.2,0,.135,.08,.135,h.head);pt(LP.box,ar,0,.03,.125,.018,.1,.018,h.head);pt(LP.box,skinM('#6a2a2a'),0,.26,-.02,.025,.12,.18,h.head);
    h.fx.slit=pt(LP.box,glowM('#ff6a3a'),0,.018,.1,.11,.016,.01,h.head);
    const sh=grp(h.arms[0],-.05,-.18,.05);pt(LP.box,ar,0,0,0,.05,.36,.28,sh);pt(LP.box,metalM('#e0b860',{r:.7}),.03,0,0,.02,.1,.1,sh);const sw=grp(h.hand[1],0,0,0);pt(LP.box,metalM('#e8ecf4'),0,-.24,0,.035,.44,.07,sw);pt(LP.box,skinM('#5a3a22'),0,-.02,0,.1,.02,.03,sw)}
  else if(t==='slime'){/* a goblin: small, crouched, all ears and nose and long fingers, a stolen knife */
    const gs=skinM('#6f7d4a'),gd=skinM('#4e5a32'),rag=cmat('#ffffff',cloth('#5a4a34','patch','#4a3a28'),{side:TH.DoubleSide});
    h=rig({h:.74,hunch:.55,torsoM:gs,torsoR:.12,torsoL:.25,torsoD:.95,armM:gs,armR:.03,armL:.38,handM:gs,handS:.08,legM:gs,legR:.038,hip:.3,shoeM:gd,shoeW:.11,shoeL:.21,neck:.07});
    pt(LP.skirt,rag,0,h.hipY-.03,0,.13,.11,.12,h.lo);pt(LP.box,skinM('#4a3a28'),0,.15,0,.13,.03,.13,h.up,0,0,.6);
    const H=h.head;pt(LP.head,gs,0,.0,0,.15,.13,.14,H);pt(LP.box,gd,0,.05,.115,.17,.025,.04,H);
    for(const sd of[-1,1]){pt(LP.cone4,gs,sd*.17,.04,-.01,.03,.15,.05,H,0,0,-sd*1.25);pt(LP.ball,glowM('#e8d040'),sd*.055,.025,.128,.024,.014,.01,H);pt(LP.cone4,skinM('#e8e0c8'),sd*.035,-.07,.12,.008,.025,.008,H)}
    pt(LP.cone6,gs,0,-.005,.15,.028,.09,.032,H,Math.PI/2+.35);pt(LP.box,hole,0,-.06,.12,.08,.012,.02,H);for(let i=0;i<4;i++)pt(LP.cone4,gd,(i-1.5)*.04,.13,-.02,.012,.06,.012,H,(i-1.5)*.2,0,(i-1.5)*.3);
    const kn=grp(h.hand[1],0,0,0);pt(LP.box,skinM('#4a3020'),0,-.02,0,.02,.06,.02,kn);pt(LP.cone4,skinM('#b0b0b8'),0,-.15,0,.03,.2,.01,kn,Math.PI)}
  else if(t==='spitter'){/* a goblin the tree got into: swollen, lumpy, one great eye, rooted where it stands; it spits what grows inside it */
    const ms=skinM('#7a8a5a'),gr=skinM('#8a3a4a'),pus=glowM('#c8b84a'),root=skinM('#3a2a1a');
    h=rig({h:1.0,hunch:.55,torsoM:ms,torsoR:.15,torsoL:.3,torsoD:.95,armM:ms,armR:.042,armL:.46,handM:ms,handS:.11,legM:ms,legR:.055,hip:.28,shoeM:root,shoeW:.13,shoeL:.2,neck:.06,shW:.18});
    h.fx.belly=pt(LP.ball,ms,0,.1,.07,.15,.14,.13,h.up);pt(LP.skirt,cmat('#ffffff',cloth('#4a3a28','patch','#3a2e20'),{side:TH.DoubleSide}),0,h.hipY-.03,0,.15,.11,.13,h.lo);
    for(const[x,y,z,r,c]of[[.15,.3,-.08,.09,gr],[-.12,.34,-.1,.07,gr],[.05,.22,-.16,.06,gr],[-.16,.16,.08,.05,gr],[.12,.2,.14,.035,pus],[-.06,.33,.04,.03,pus],[.18,.33,.02,.025,pus]])pt(LP.ball,c,x,y,z,r,r*.9,r,h.up);
    const ex=grp(h.up,.2,.24,0);pt(LP.cyl6,ms,0,-.07,0,.016,.14,.016,ex,0,0,.6);pt(LP.ball,ms,.05,-.13,0,.025,.025,.025,ex);
    const H=h.head;pt(LP.head,ms,0,0,0,.15,.13,.14,H);pt(LP.ball,gr,-.09,.08,-.03,.06,.05,.06,H);pt(LP.ball,skinM('#e8e0b0'),.04,.04,.11,.05,.05,.035,H);pt(LP.ball,glowM('#c8d040'),.045,.04,.14,.022,.022,.01,H);pt(LP.ball,glowM('#c8d040'),-.06,.02,.125,.012,.01,.008,H);
    pt(LP.cone4,ms,.17,.03,-.01,.03,.15,.05,H,0,0,-1.25);pt(LP.cone4,ms,-.15,-.02,-.01,.03,.13,.05,H,0,0,2.1);pt(LP.cone6,ms,-.005,-.015,.15,.03,.08,.034,H,Math.PI/2+.5);
    for(let i=0;i<5;i++)pt(LP.cone4,skinM('#d8d0a0'),(i-2)*.022,-.075,.125,.008,.02+(i%2)*.012,.008,H,Math.PI);
    h.fx.mouth=pt(LP.box,hole,0,-.06,.12,.11,.02,.03,H);h.fx.sac=pt(LP.ball,skinM('#c8a07a'),0,-.11,.07,.08,.06,.08,H);
    for(let n=0;n<7;n++){const a=n/7*TAU;pt(LP.cone4,root,Math.cos(a)*.17,.03,Math.sin(a)*.17,.03,.24,.03,h.root,Math.PI/2,-a+Math.PI/2,0)}
    for(const k of h.knees)pt(LP.cyl6,root,0,-.05,.0,.07,.14,.07,k)}
  else if(t==='crab'||t==='ghoul'){/* lizard people: crocodile snouts, a crest, a tail. The spearman keeps his shield up; the hunter runs you down */
    const hunt=t==='ghoul',c1=hunt?'#3e4e3e':'#4e6a3a',c2=hunt?'#2e3a2e':'#3e5a2e',sc=cmat('#ffffff',SCALES(c1,c2)),belly=skinM(hunt?'#8a8a6a':'#a89a6a'),cr=skinM(hunt?'#8a2a2a':'#6a5a2a');
    h=rig({h:hunt?1.22:1.12,hunch:hunt?.45:.22,torsoM:sc,torsoR:.12,torsoL:.33,armM:sc,armR:.034,armL:hunt?.4:.32,handM:skinM(c1),handS:.065,legM:sc,legR:.046,shoeM:skinM(c2),shoeW:.11,shoeL:.24,neck:.14});
    pt(LP.box,belly,0,.17,.085,.13,.26,.03,h.up);pt(LP.skirt,cmat('#ffffff',cloth('#5a4630','seam','#4a3a24'),{side:TH.DoubleSide}),0,h.hipY-.04,0,.12,.1,.11,h.lo);
    const H=h.head;pt(LP.ball,sc,0,.02,0,.1,.085,.1,H);pt(LP.ball,sc,0,-.005,.12,.07,.05,.13,H);const jaw=grp(H,0,-.04,.04);pt(LP.ball,belly,0,-.012,.08,.06,.025,.12,jaw);h.fx.jaw=jaw;
    for(const sd of[-1,1]){pt(LP.ball,glowM(hunt?'#ff8a2a':'#e8c030'),sd*.07,.04,.06,.018,.016,.012,H);for(let i=0;i<4;i++)pt(LP.cone4,skinM('#e8e0c8'),sd*.05,-.03,.07+i*.035,.006,.016,.006,H,Math.PI)}
    for(let i=0;i<5;i++)pt(LP.cone4,cr,0,.1-i*.008,-.02-i*.035,.012,.05+(i===1?.03:0),.03,H,-.3-i*.2);
    if(hunt){h.fx.frill=grp(H,0,-.01,-.04);for(let n=0;n<9;n++){const a=(n/8-.5)*2.4;pt(LP.cone4,cr,Math.sin(a)*.1,Math.cos(a)*.06,-.02,.03,.11,.008,h.fx.frill,0,0,-a)}
      for(const hd of h.hand)for(let n=0;n<3;n++)pt(LP.cone4,skinM('#e8e0c8'),-.02+n*.02,-.07,.01,.007,.05,.007,hd,Math.PI)}
    else{const shd=grp(h.arms[0],-.06,-.2,.04);shd.rotation.y=-Math.PI/2;pt(LP.cyl8,cmat('#ffffff',cloth('#6a4a2a','seam','#5a3a20')),0,0,0,.16,.03,.16,shd,Math.PI/2);for(let n=0;n<5;n++){const a=n/5*TAU;pt(LP.cone4,skinM('#e8e0c8'),Math.cos(a)*.11,Math.sin(a)*.11,.03,.012,.035,.012,shd,Math.PI/2)}
      const sp=grp(h.hand[1],0,0,0);pt(LP.cyl6,skinM('#5a4632'),0,0,0,.014,.95,.014,sp);pt(LP.cone4,skinM('#4a4a52'),0,.52,0,.03,.1,.012,sp)}
    const tl=grp(h.lo,0,h.hipY-.02,-.08);let seg=tl;for(let i=0;i<5;i++){const r=.055*(1-i*.17);pt(LP.ball,sc,0,0,-.06,r,r,.09,seg);const nx=grp(seg,0,-.005,-.12);nx.rotation.x=.12;seg=nx;(h.fx.tail=h.fx.tail||[]).push(nx)}h.fx.tailRoot=tl}
  else{const sm=cmat('#1a1424',null,{transparent:true,opacity:.6,depthWrite:false});h=rig({h:1,torsoM:sm,torsoR:.12,torsoL:.34,armM:sm,armR:.035,armL:.3,handM:sm,noLegs:true});pt(LP.cone6,sm,0,.14,0,.2,.4,.18,h.lo,Math.PI);
    pt(LP.head,sm,0,0,0,.12,.13,.12,h.head);pt(LP.cone6,sm,0,.02,-.02,.15,.3,.15,h.head)}
  h.cid=t;h.base=snapPose(h);g.add(h.root);u.h=h;return{g,u,h}}

/* ---------- how they move: gaits, breathing, looking, blinking ---------- */
const GAIT={
  walk(h,s,w,k){if(w){const a=Math.sin(s.ph);h.legs[0].rotation.x=a*.7;h.legs[1].rotation.x=-a*.7;h.arms[0].rotation.x+=-a*.5;h.arms[1].rotation.x+=a*.5;h.body.position.y+=Math.abs(Math.sin(s.ph))*.03}},
  run(h,s,w){if(w){const a=Math.sin(s.ph);h.legs[0].rotation.x=a*1.1;h.legs[1].rotation.x=-a*1.1;h.arms[0].rotation.x=-a*1.1;h.arms[1].rotation.x=a*1.1;h.up.rotation.x+=.2;h.body.position.y+=Math.abs(Math.sin(s.ph))*.06}},
  shuffle(h,s,w){if(w){const a=Math.sin(s.ph);h.legs[0].rotation.x=a*.3;h.legs[1].rotation.x=-a*.3;h.lo.rotation.z=a*.05;h.body.position.y+=Math.abs(a)*.012}},
  glide(h,s,w){h.body.position.y+=Math.sin(T*1.8)*.012+(w?Math.sin(s.ph*.5)*.008:0)},
  strut(h,s,w){if(w){const a=Math.sin(s.ph);h.legs[0].rotation.x=-Math.max(0,a)*1.3+Math.max(0,-a)*.3;h.legs[1].rotation.x=-Math.max(0,-a)*1.3+Math.max(0,a)*.3;h.head.position.z+=Math.sin(s.ph*2)*.03;h.body.position.y+=Math.abs(a)*.03}},
  waddle(h,s,w){if(w){const a=Math.sin(s.ph);h.legs[0].rotation.x=a*.4;h.legs[1].rotation.x=-a*.4;h.lo.rotation.z=a*.14;h.body.position.y+=Math.abs(a)*.02}},
  march(h,s,w){if(w){const a=Math.sin(s.ph);h.legs[0].rotation.x=a*.85;h.legs[1].rotation.x=-a*.85;h.arms[0].rotation.x=-a*.7;h.body.position.y+=Math.abs(a)*.035}},
  hobble(h,s,w){if(w){const a=Math.sin(s.ph);h.legs[0].rotation.x=a*.35;h.legs[1].rotation.x=-a*.35;h.arms[1].rotation.x+=-Math.max(0,a)*.4;h.body.position.y+=Math.max(0,a)*.025}},
  float(h,s,w){},sit(){}};
/* ---------- personality in motion: small gestures, talking, reacting to you ---------- */
/* gestures are layered on the rest pose; k fades them in and out */
const GEST={
  look:(h,k,t)=>{h.head.rotation.y+=Math.sin(t*1.6)*.75*k},
  tilt:(h,k)=>{h.head.rotation.z+=.32*k},
  nod:(h,k,t)=>{h.head.rotation.x+=Math.sin(t*6)*.14*k},
  scratch:(h,k,t)=>{const a=h.arms[0],e=h.elbows[0];a.rotation.x=cl(a.rotation.x,-2.55,k);a.rotation.z=cl(a.rotation.z,.4,k);e.rotation.x=cl(e.rotation.x,-1.75,k)+Math.sin(t*15)*.2*k;h.head.rotation.z-=.18*k},
  /* arms folded: upper arms forward a little, forearms swung across the chest at the elbow, one above the other */
  cross:(h,k)=>{h.arms.forEach((a,i)=>{const e=h.elbows[i];a.rotation.x=cl(a.rotation.x,-.55,k);a.rotation.y=cl(a.rotation.y,0,k);a.rotation.z=cl(a.rotation.z,0,k);e.rotation.x=cl(e.rotation.x,i?-1.42:-1.18,k);e.rotation.z=cl(e.rotation.z,i?-1.22:1.22,k)});h.head.rotation.x-=.06*k},
  shift:(h,k)=>{h.body.rotation.z+=.06*k;h.lo.position.x+=.014*k;h.knees[1].rotation.x+=.3*k;h.legs[1].rotation.x-=.08*k},
  stretch:(h,k)=>{h.arms.forEach((a,i)=>{a.rotation.x=cl(a.rotation.x,-2.9,k);a.rotation.z=cl(a.rotation.z,(i?-1:1)*.25,k)});h.up.rotation.x-=.16*k;h.head.rotation.x-=.25*k},
  wipe:(h,k,t)=>{const a=h.arms[0],e=h.elbows[0];a.rotation.x=cl(a.rotation.x,-2.2,k);a.rotation.z=cl(a.rotation.z,.55,k);e.rotation.x=cl(e.rotation.x,-2.0,k);a.rotation.y+=Math.sin(t*5)*.25*k;h.head.rotation.x+=.12*k},
  rub:(h,k,t)=>{h.arms.forEach((a,i)=>{const sd=i?1:-1;a.rotation.x=cl(a.rotation.x,-.85,k);a.rotation.y=cl(a.rotation.y,-sd*.5,k);h.elbows[i].rotation.x=cl(h.elbows[i].rotation.x,-1.2,k);a.rotation.z+=Math.sin(t*11+i*3)*.08*k})},
  yawn:(h,k)=>{h.head.rotation.x-=.4*k;const a=h.arms[0];a.rotation.x=cl(a.rotation.x,-2.1,k);a.rotation.z=cl(a.rotation.z,.5,k);h.elbows[0].rotation.x=cl(h.elbows[0].rotation.x,-2.1,k)},
  hop:(h,k,t)=>{h.body.position.y+=Math.abs(Math.sin(t*8))*.05*k},
  fidget:(h,k,t)=>{h.legs[1].rotation.x+=Math.sin(t*8)*.22*k;const a=h.arms[0];a.rotation.x=cl(a.rotation.x,-.6,k);a.rotation.y=cl(a.rotation.y,.9,k);h.elbows[0].rotation.x=cl(h.elbows[0].rotation.x,-1.5,k)+Math.sin(t*9)*.15*k}};
/* how they react when you come close */
const REACT={
  wave:(h,k,t,i)=>{i=i==null?1:i;const a=h.arms[i];a.rotation.x=cl(a.rotation.x,-2.7,k);a.rotation.z=cl(a.rotation.z,i?-.35:.35,k);h.elbows[i].rotation.x=cl(h.elbows[i].rotation.x,-.5,k)+Math.sin(t*14)*.45*k},
  startle:(h,k)=>{h.body.position.y+=k*.04;h.up.rotation.x-=.25*k;h.arms.forEach((a,i)=>{a.rotation.z+=(i?-1:1)*.6*k;a.rotation.x-=.4*k})},
  nod:(h,k,t)=>{h.head.rotation.x+=Math.sin(t*8)*.2*k},
  bow:(h,k)=>{h.up.rotation.x+=.45*k;h.head.rotation.x+=.2*k;h.arms[1].rotation.x=cl(h.arms[1].rotation.x,-.9,k);h.elbows[1].rotation.x=cl(h.elbows[1].rotation.x,-1.4,k)},
  hide:(h,k)=>{h.head.rotation.y+=1.0*k;h.head.rotation.x+=.25*k;h.arms.forEach((a,i)=>{a.rotation.x=cl(a.rotation.x,-1.7,k);h.elbows[i].rotation.x=cl(h.elbows[i].rotation.x,-2.1,k)})},
  grumble:(h,k,t)=>{h.head.rotation.y+=Math.sin(t*9)*.25*k;h.up.rotation.x+=.1*k},
  shh:(h,k)=>{const a=h.arms[0];a.rotation.x=cl(a.rotation.x,-1.95,k);a.rotation.z=cl(a.rotation.z,.35,k);h.elbows[0].rotation.x=cl(h.elbows[0].rotation.x,-2.25,k);h.head.rotation.z+=.15*k}};
/* the face for the moment: speaking, the line's mood, a fright, a blink */
const MOODFACE={happy:3,laugh:3,excited:3,surprise:4,sad:5,hesitant:5,angry:6};
function npcPersona(h,e,s,dt,w,C){const PS=C.persona||{},t=T+e.x*.13;
  if(e.mouthT>0)e.mouthT-=dt;
  /* talking: a nod on each syllable, the line's mood in the body, and the character's own way of using its hands */
  if(e.talking){const md=e.mood,sp=e.mouthT>0?1:0;h.head.rotation.x+=sp*Math.sin(T*22)*.05;
    if(md==='happy'||md==='laugh'||md==='excited'){h.up.rotation.x-=.08;h.head.rotation.z+=Math.sin(T*3)*.06;if(md==='laugh')h.body.position.y+=Math.abs(Math.sin(T*16))*.012}
    else if(md==='surprise'){h.up.rotation.x-=.12;h.arms.forEach((a,i)=>{a.rotation.z+=(i?-1:1)*.3;a.rotation.x-=.2})}
    else if(md==='sad'||md==='hesitant'){h.head.rotation.x+=.25;h.up.rotation.x+=.08}
    else if(md==='angry'){h.up.rotation.x+=.12;h.head.rotation.y+=Math.sin(T*8)*.05}
    else if(md==='question'||md==='confused')h.head.rotation.z+=.2;
    else if(md==='mysterious'){h.head.rotation.z+=.14+Math.sin(T*.7)*.05;h.up.rotation.x+=.06}
    if(PS.talk==='hands'&&sp){const a=h.arms[1];a.rotation.x=cl(a.rotation.x,-.75+Math.sin(T*6)*.25,.8);h.elbows[1].rotation.x=cl(h.elbows[1].rotation.x,-1.0,.8)}
    if(PS.talk==='fidget')GEST.fidget(h,.7,T)}
  /* reacting to you coming close */
  if(e.reactT>0&&!e.talking){const R=REACT[PS.react];if(R)R(h,Math.sin(clamp(1-e.reactT/1.1,0,1)*Math.PI),T,PS.hand)}
  /* little gestures of their own when nothing else is going on */
  else if(!w&&!e.talking&&PS.gest&&PS.gest.length&&e.mode!=='listen'){if(!s.g||s.g.t>=s.g.d){s.gW=(s.gW==null?2+Math.random()*4:s.gW)-dt;if(s.gW<=0){s.g={n:PS.gest[(Math.random()*PS.gest.length)|0],t:0,d:1.6+Math.random()*1.8};s.gW=3+Math.random()*6}}
    if(s.g&&s.g.t<s.g.d){s.g.t+=dt;const k=Math.min(1,s.g.t/.35,(s.g.d-s.g.t)/.35);if(k>0&&GEST[s.g.n])GEST[s.g.n](h,cs(k),t)}}
  /* loose things that drift around some of them */
  if(h.fx.orbit)h.fx.orbit.forEach((o,i)=>{const a=T*.7+i*2.1;o.position.set(Math.cos(a)*.32,.75+Math.sin(T*1.3+i)*.08,Math.sin(a)*.32);o.rotation.set(Math.sin(T+i),a,0)})}
/* every frame for every character: rest pose, breathing, gait, head, blink, then its own habits */
function animNpc(e,g,dt){const u=g.userData,h=u.h,C=CHAR[e.id]||CHAR._,s=u.s||(u.s={yaw:Math.PI/2-(e.ang==null?Math.PI/2:e.ang),blink:1+Math.random()*3,look:0,ph:Math.random()*9,blinkOn:false});
  restPose(h);const tgt=Math.PI/2-(e.ang==null?Math.PI/2:e.ang);s.yaw+=angD(tgt,s.yaw)*Math.min(1,dt*(C.turn||5));h.root.rotation.y=s.yaw;
  const w=!!e.walking&&state==='play';s.ph+=dt*(C.cadence||8)*(w?1:0);
  const br=Math.sin(T*(C.breath||2)+e.x*.1)*.5+.5;h.up.scale.y*=1+br*.03;h.up.scale.x*=1+br*.012;h.head.position.y+=br*.006;
  (GAIT[C.gait]||GAIT.walk)(h,s,w);
  s.lookOverride=undefined;kneesFollow(h);if(C.idle)C.idle(h,e,s,dt,w);npcPersona(h,e,s,dt,w,C);
  let want=s.lookOverride!=null?s.lookOverride:e.look!=null?clamp(angD(e.ang==null?Math.PI/2:e.ang,e.look),-1.1,1.1):Math.sin(T*.35+e.x*.07)*.35;s.look+=(want-s.look)*Math.min(1,dt*(C.headSpd||5));h.head.rotation.y+=s.look;
  /* blinking at the character's own pace (some blink twice) */
  const PB=(C.persona&&C.persona.blink)||[2,6];s.blink-=dt;if(s.blink<0){s.blinkOn=true;if(s.blink<-.12){s.blinkOn=false;s.blink=C.persona&&C.persona.dbl&&Math.random()<.35?.16:PB[0]+Math.random()*(PB[1]-PB[0])}}
  if(h.fx.faces&&h.fx.headMesh){let fi=e.talking&&MOODFACE[e.mood]||0;if(e.reactT>0&&C.persona&&C.persona.react==='startle')fi=4;if(e.mouthT>0)fi=2;if(s.blinkOn||h.fx.shut)fi=1;
    const f=h.fx.faces[fi]||h.fx.faces[0];if(h.fx.headMesh.material.map!==f)h.fx.headMesh.material=cmat('#ffffff',f)}
  /* the twins take turns with their mouths */
  if(h.fx.twinHeads){h.fx.twinHeads.forEach((m,i)=>{const F=m.userData.faces;let fi=(e.talking&&MOODFACE[e.mood])||0;if(e.mouthT>0&&(e.mouthWho|0)===i)fi=2;if(s.blinkOn&&i===0||((T*.9+i*1.7)%5)<.12)fi=1;if(m.material.map!==F[fi])m.material=cmat('#ffffff',F[fi])})}}
/* creatures: the same machinery with the foe's own state */
function animCreature(e,u,dt){const h=u.h,s=u.s||(u.s={ph:0});restPose(h);const T2=T+(e.an||0),mv=Math.hypot(e.vx||0,e.vy||0)>3||e.type==='husk'||e.type==='ghoul';s.ph+=dt*(e.type==='husk'?5:e.type==='ghoul'?11:8);
  const tail=(amp,sp)=>{if(h.fx.tail){h.fx.tailRoot.rotation.y=Math.sin(T2*sp)*amp;h.fx.tail.forEach((g,i)=>g.rotation.y=Math.sin(T2*sp-i*.7)*amp*.6)}};
  if(e.type==='husk'){GAIT.shuffle(h,s,true);h.arms[0].rotation.set(-1.25+Math.sin(T2*3)*.12,0,.1);h.arms[1].rotation.set(-.6+Math.sin(T2*3+1)*.2,0,-.1);h.head.rotation.z=Math.sin(T2*1.7)*.25;h.fx.jaw.rotation.x=Math.abs(Math.sin(T2*7))*.35}
  else if(e.type==='knight'){GAIT.march(h,s,mv);h.arms[0].rotation.x-=.5;h.fx.slit.material.emissiveIntensity=.6+Math.sin(T*4)*.4}
  else if(e.type==='slime'){const hop=e.state?Math.sin(clamp(1-e.t/.35,0,1)*Math.PI):0;
    if(e.state){h.root.position.y=hop*.3;h.up.rotation.x+=.25;h.legs[0].rotation.x=-.9*hop;h.legs[1].rotation.x=.6*hop;h.arms[1].rotation.set(-2.6+hop*2.2,0,-.25);h.arms[0].rotation.set(-1.2,0,.5);h.elbows[1].rotation.x=-.3}
    else{h.body.position.y-=.025;h.legs.forEach(l=>l.rotation.x=-.5);h.knees.forEach(k=>k.rotation.x=.95);h.arms[1].rotation.set(-1.0+Math.sin(T2*3)*.3,0,-.2);h.elbows[1].rotation.x=-.9;h.arms[0].rotation.set(-.5,0,.4+Math.sin(T2*2.3)*.12);
      h.head.rotation.x=Math.sin(T2*6)*.08;h.head.rotation.y=Math.sin(T2*1.3)*.45}return}
  else if(e.type==='spitter'){const k=e.t<.4?1-e.t/.4:0,rec=e.t>2.05?Math.min(1,(e.t-2.05)*4):0;
    h.fx.sac.scale.set(.08*(1+k*.55),.06*(1+k*.7),.08*(1+k*.55));h.fx.mouth.scale.y=.02*(1+k*2.5+rec*2);h.head.rotation.x=-.55*k+.35*rec+Math.sin(T2*1.7)*.06;h.up.rotation.x=.3-.22*k+.2*rec;
    const br=Math.sin(T2*2.2)*.035;h.fx.belly.scale.set(.15*(1+br),.14*(1-br*.5),.13*(1+br));h.arms.forEach((a,n)=>a.rotation.set(-.55+Math.sin(T2*3+n*2)*.1-.4*k,0,(n?-1:1)*.3));h.elbows.forEach(e=>e.rotation.x=-.5-.4*k);return}
  else if(e.type==='crab'){const side=Math.abs(e.vx||0)>1;s.sp=(s.sp||0)+dt*(side?13:0);const a=Math.sin(s.sp);
    h.legs[0].rotation.z=a*.35*(side?1:0);h.legs[1].rotation.z=a*.35*(side?1:0);h.legs.forEach(l=>l.rotation.x=-.25);h.knees.forEach(k=>k.rotation.x=.45);h.body.position.y-=.02-Math.abs(a)*.02*(side?1:0);
    h.arms[0].rotation.set(-1.15,0,.35);h.arms[1].rotation.set(-.55+Math.sin(T2*2.8)*.12,0,-.15);h.elbows[1].rotation.x=-1.2;h.head.rotation.y=Math.sin(T2*1.1)*.2;h.fx.jaw.rotation.x=Math.max(0,Math.sin(T2*1.9))*.2;tail(.35,2.4);return}
  else if(e.type==='ghoul'){GAIT.run(h,s,true);h.arms.forEach((a,n)=>a.rotation.set(-1.25+Math.sin(T2*8+n*3)*.45,0,(n?-1:1)*.25));h.fx.jaw.rotation.x=.25+Math.sin(T2*9)*.15;h.fx.frill.scale.setScalar(1+Math.max(0,Math.sin(T2*2))*.25);tail(.45,5)}
  else{h.root.position.y=.25+Math.sin(T*3)*.08;h.arms.forEach((a,n)=>a.rotation.set(-1.2+Math.sin(T*2.5+n)*.3,0,n?-.3:.3))}kneesFollow(h)}

/* ---------- how they behave: each one has its own routine, and stops to face you when you come near ---------- */
function npcSpot(e,r){for(let n=0;n<14;n++){const a=rnd()*TAU,d=rnd()*r,x=e.home[0]+Math.cos(a)*d,y=e.home[1]+Math.sin(a)*d;if(npcFree(e,x,y))return[x,y]}return e.home.slice()}
function npcFree(e,x,y){if(x<12||y<12||x>GW-12||y>RH*TS-12)return false;for(const[a,b]of[[-e.hw,-e.hh],[e.hw,-e.hh],[-e.hw,e.hh],[e.hw,e.hh]]){const i=tc(x+a),j=tc(y+b),c=tileAt(i,j);if(blocked(i,j,e.fly?'fly':'e')||'SdDx=o'.includes(c))return false}return true}
function npcMove(e,dx,dy){const nx=e.x+dx,ny=e.y+dy;if(Math.abs(nx-P.x)<e.hw+P.hw+1&&Math.abs(ny-P.y)<e.hh+P.hh+1)return false;if(!npcFree(e,nx,ny))return false;
  const a=moveBox(e,dx,0,e.fly?'fly':'e'),b=moveBox(e,0,dy,e.fly?'fly':'e');return a||b}
function stepNpc(e,dt){const C=CHAR[e.id]||CHAR._;if(!e.home){e.home=[e.x,e.y];e.ang=C.ang0!=null?C.ang0:Math.PI/2;e.t=1+rnd()*2}e.t-=dt;e.mt=(e.mt||0);if(e.talkT>0)e.talkT-=dt;if(e.jolt>0)e.jolt-=dt;
  const dP=Math.hypot(P.x-e.x,P.y-e.y),near=dP<(C.notice||40),sp=C.speed||16;e.walking=false;e.look=near?Math.atan2(P.y-e.y,P.x-e.x):null;
  /* when you come close they react in their own way (once per approach), and now and then make their own small sounds */
  if(dP<30&&!e.nearP){e.nearP=true;if(!(e.reactCd>0)){e.reactT=1.1;e.reactCd=9;voxReact(e,dP)}}else if(dP>52)e.nearP=false;
  if(e.reactT>0)e.reactT-=dt;if(e.reactCd>0)e.reactCd-=dt;voxIdle(e,dt,dP);
  const go=(tx,ty,spd)=>{const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);if(d<1.5)return true;const st=Math.min(d,spd*dt),ok=npcMove(e,dx/d*st,dy/d*st);e.ang=Math.atan2(dy,dx);
    if(ok){e.walking=true;e.stuck=0}else{e.stuck=(e.stuck||0)+dt;if(e.stuck>1.1){e.stuck=0;return true}}return false};
  switch(C.beh){
    case 'wander':if(near&&dP<30){e.ang=e.look;e.tgt=null;break}if(e.t>0)break;if(!e.tgt)e.tgt=npcSpot(e,C.radius||20);if(go(e.tgt[0],e.tgt[1],sp)){e.tgt=null;e.t=2+rnd()*4}break;
    case 'circle':if(near){e.ang=e.look;break}e.ca=(e.ca||0)+dt*(sp/22);{const tx=e.home[0]+Math.cos(e.ca)*(C.radius||20),ty=e.home[1]+Math.sin(e.ca)*(C.radius||20)*.7;if(e.t>0){break}go(tx,ty,sp);if(rnd()<dt*.15)e.t=1+rnd()*2}break;
    case 'pace':{if(near&&dP<34){e.ang=e.look;break}const ends=[e.home,[e.home[0]+C.pace[0]*16,e.home[1]+C.pace[1]*16]];e.leg=e.leg||0;if(e.t>0)break;if(go(ends[e.leg][0],ends[e.leg][1],sp)){e.leg=1-e.leg;e.t=2+rnd()*2}break}
    case 'shy':{if(dP<28){const ax=e.x-P.x,ay=e.y-P.y,l=Math.hypot(ax,ay)||1,bx=e.x+ax/l*10,by=e.y+ay/l*10;if(Math.hypot(bx-e.home[0],by-e.home[1])<(C.radius||20)+10)go(bx,by,sp*1.2);e.ang=e.look;e.walking=e.walking;break}
      if(near){e.ang=e.look;break}if(e.t>0)break;if(!e.tgt)e.tgt=npcSpot(e,C.radius||20);if(go(e.tgt[0],e.tgt[1],sp*.6)){e.tgt=null;e.t=3+rnd()*4}break}
    case 'sleep':if(dP<34){if(!e.awake){e.awake=true;e.nearP=true;e.reactT=1.1;e.reactCd=9;voxReact(e,dP,'yawn')}e.wakeT=4}else if(e.awake){e.wakeT-=dt;if(e.wakeT<=0)e.awake=false}if(!e.awake)e.look=null;break;
    case 'listen':{if(!e.spots){e.spots=[];const hi=tc(e.home[0]),hj=tc(e.home[1]);for(let j=hj-3;j<=hj+3;j++)for(let i=hi-3;i<=hi+3;i++){if(i<1||j<1||i>10||j>10)continue;const x=cen(i),y=cen(j);if(!npcFree(e,x,y))continue;
          for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const c=tileAt(i+a,j+b);if('TN#hHRK'.includes(c)){e.spots.push([x+a*3,y+b*3,Math.atan2(b,a)]);break}}}if(!e.spots.length)e.spots.push([e.home[0],e.home[1],-Math.PI/2])}
      if(near&&dP<30){e.mode='look';e.ang=e.look;break}if(e.mode!=='listen'||e.t<=0){if(!e.cur||e.t<=0&&e.mode==='listen'){const others=e.spots.filter(q=>q!==e.cur);e.cur=(others.length?others:e.spots)[(rnd()*(others.length||e.spots.length))|0];e.mode='walk'}if(go(e.cur[0],e.cur[1],sp)){e.mode='listen';e.ang=e.cur[2];e.t=6+rnd()*6}}
      else{e.ang=e.cur[2];if(rnd()<dt*.12)e.jolt=.5}break}
    case 'patrol':{if(near&&dP<30){e.ang=e.look;break}e.wp=e.wp||0;if(e.mode==='light'){if(e.t<=0)e.mode='walk';break}const w=C.path[e.wp],tx=e.home[0]+w[0]*16,ty=e.home[1]+w[1]*16;if(go(tx,ty,sp)){e.wp=(e.wp+1)%C.path.length;e.mode='light';e.t=1.3}break}
    case 'counter':{if(e.t>0||near&&dP<26){e.ang=Math.PI/2;break}if(!e.tgt){e.side=e.side?-e.side:1;e.tgt=[e.home[0]+e.side*16,e.home[1]]}if(go(e.tgt[0],e.tgt[1],sp)){e.tgt=null;e.t=3+rnd()*3;e.ang=Math.PI/2}break}
    case 'fish':{if(near&&dP<34){e.ang=e.look;break}e.ang=C.ang0||0;e.mode=e.mode||'wait';e.mt+=dt/({cast:1,wait:5,reel:2}[e.mode]);if(e.mt>=1){e.mt=0;e.mode={cast:'wait',wait:'reel',reel:'cast'}[e.mode];if(e.mode==='cast'&&dP<120&&voxOn())FSND.cast(clamp(1.25-dP/100,.2,1))}break}
    case 'float':{e.fly=true;e.an=(e.an||0)+dt;const tx=e.home[0]+Math.cos(e.an*.35)*14,ty=e.home[1]+Math.sin(e.an*.7)*8;if(near&&dP<34){e.ang=e.look;break}go(tx,ty,sp);break}
    default:if(near)e.ang=e.look}}
/* ---------- Part 6v: a tiny voice for the cutscenes ----------
   No recordings: a buzzing glottal pulse at a child's pitch, shaped by three vowel resonances (formants), cut into
   quick syllables with a breath of "h" in front of each. That is all a giggle is. The same engine makes Wick's
   yelps and screams. Everything is rendered into a buffer on the spot, with a little randomness each time. */
/* syl: [{t start, d length, f0a..f0b pitch glide, F formants [F1,F2,F3], B bandwidths, amp, h breath before (s), asp breathiness, n0 nasal onset (s),
        voiced (false = whisper), vib/vd vibrato rate/depth, jit roughness, oq how open the voice is (breathy high, pressed low)}] */
const VSR=22050;
function vsynth(syl,sr){sr=sr||22050;let lead=0,end=0;for(const s of syl)lead=Math.max(lead,(s.h==null?.022:s.h)-s.t);for(const s of syl)end=Math.max(end,lead+s.t+s.d+.08);const out=new Float32Array(Math.ceil(end*sr));let seed=(Math.random()*2147483646|0)+1;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  const mkRes=(f,bw)=>{const c=-Math.exp(-2*Math.PI*bw/sr),b=2*Math.exp(-Math.PI*bw/sr)*Math.cos(2*Math.PI*f/sr);return{a:1-b-c,b,c,y1:0,y2:0}};
  for(const s of syl){const n0=Math.floor((s.t+lead)*sr),n=Math.max(1,Math.floor(s.d*sr)),F=s.F||[480,2900,3800],B=s.B||[100,190,280],hn=Math.floor((s.h==null?.022:s.h)*sr),nn=Math.floor((s.n0||0)*sr),tail=Math.floor((s.tail||.035)*sr);
    const res=F.map((f,i)=>mkRes(f,B[i])),nas=[mkRes(260,90),mkRes(1250,250),mkRes(2700,300)],xf=Math.floor(.016*sr),at=(s.atk||.008)*sr,lpa=1-Math.exp(-TAU*(s.lp||3600)/sr);let ph=0,prev=0,lp=0;const tmp=new Float32Array(hn+n+tail);
    /* each syllable is rendered on its own and levelled, so vowels that happen to ring louder don't jump out */
    for(let i=-hn;i<n+tail;i++){const k=clamp(i/n,0,1);
      /* pitch: a glide from f0a to f0b with a quick wobble, a slow vibrato and jitter, as a laughing voice has */
      const f0=(s.f0a+(s.f0b-s.f0a)*k)*(1+(s.vd==null?.018:s.vd)*Math.sin(i/sr*TAU*(s.vib||9))+(rnd()-.5)*(s.jit||.012));ph+=f0/sr;if(ph>=1)ph-=1;
      /* glottal pulse: a raised-cosine puff while the folds are open, then nothing; its slope is what we hear */
      const OQ=s.oq||.6,g=ph<OQ?.5-.5*Math.cos(TAU*ph/OQ):0,src=(s.voiced===false?0:(g-prev)*6);prev=g;
      const on=i<0?0:Math.min(1,i/at)*(i<n?1:Math.max(0,1-(i-n)/tail));const ve=on*(1-.3*k);
      /* breath: rises before the syllable and dies away into it (no sudden step, which would click) */
      const ae=i<0?(1+i/hn)*(s.hb||.42):s.voiced===false?on*.9:Math.max(0,.3-k*.7)*.6+(hn?(s.hb||.42)*.75*Math.exp(-i/at):0);
      let x=src*ve+(rnd()*2-1)*ae*(s.asp==null?.28:s.asp);
      /* the mouth (formants) always runs, so it never starts cold; a hummed start (m, n) runs through the nose and opens into the vowel */
      for(const r of res){const y=r.a*x+r.b*r.y1+r.c*r.y2;r.y2=r.y1;r.y1=y;x=y}
      if(nn>0){let y=src*on*.5;for(const r of nas){const z=r.a*y+r.b*r.y1+r.c*r.y2;r.y2=r.y1;r.y1=z;y=z}const w=i<0?0:nn>=n?1:i<nn?Math.min(1,i/at):Math.max(0,1-(i-nn)/xf);x=y*w*(s.ng||.8)+x*(1-w)}
      /* a soft top: retro and warm rather than buzzy */
      lp+=(x-lp)*lpa;tmp[i+hn]=lp}
    let pk=0;for(let i=0;i<tmp.length;i++)pk=Math.max(pk,Math.abs(tmp[i]));const gain=pk>0?(s.amp==null?1:s.amp)/pk:0;
    for(let i=0;i<tmp.length;i++){const idx=n0-hn+i;if(idx>=0&&idx<out.length)out[idx]+=tmp[i]*gain}}
  let m=0;for(let i=0;i<out.length;i++)m=Math.max(m,Math.abs(out[i]));if(m>0)for(let i=0;i<out.length;i++)out[i]=out[i]/m*.95;return out}
/* a giggle: n quick "hee/heh" bursts, each a little lower than the last, the final one held a touch longer.
   f0 is the pitch (a child laughing sits around 500-600 Hz), rate the bursts per second, sc shrinks the vocal tract (higher formants = smaller creature) */
function giggleSyl(o){o=o||{};const n=o.n||7,rate=o.rate||9.5,f0=o.f0||560,sc=o.sc||1,syl=[];let t=o.lead||.03;
  for(let i=0;i<n;i++){const k=n>1?i/(n-1):0,last=i===n-1,d=(o.dur||.044)*(last?1.9:1)*(.9+Math.random()*.2),base=f0*(1.08-.18*k+(i===1?.06:0))*(1+(Math.random()-.5)*.05),e=Math.random()<.5;
    syl.push({t,d,f0a:base*1.1,f0b:base*(last?.82:.93),F:[(e?560:430)*sc,(e?2500:2900)*sc,3700*sc],B:[110,200,300],amp:(1-.3*k)*(.85+Math.random()*.3),h:i===0?.04:.02,asp:.34,hb:.9,tail:last?.05:.016});
    t+=1/rate*(1+(Math.random()-.5)*.18)}return syl}
/* Wick's other noises */
const KIDV={
  yelp:()=>[{t:0,d:.2,f0a:560,f0b:780,F:[950,1750,3300],h:.008,asp:.15,hb:.9}],
  whimper:()=>[{t:0,d:.34,f0a:520,f0b:390,F:[700,1350,3000],h:.05,asp:.35,amp:.7,hb:.9}],
  no:()=>[0,1,2].map(i=>({t:i*.3,d:.17,f0a:660-i*30,f0b:560-i*30,F:[620,1050,3000],n0:.04,h:0,asp:.12})),
  scream:()=>[{t:0,d:.8,f0a:720,f0b:520,F:[900,1650,3250],h:.02,asp:.18,vib:6,hb:.9}],
  huh:()=>[{t:0,d:.24,f0a:430,f0b:610,F:[620,1550,3050],h:.05,asp:.3,hb:.9}]};
/* the hero never says a word, but he does make noise: a young man's grunts and shouts, on the same engine.
   A few versions of each are made the first times they are needed and then picked from at random */
const HEROV={
  swing:()=>{const f=215+Math.random()*35,v=Math.random()<.5?[740,1180,2550]:[600,1650,2550];return[{t:0,d:.09+Math.random()*.04,f0a:f*1.1,f0b:f*.84,F:v,B:[120,160,250],h:.03,asp:.32,hb:.85,oq:.5,tail:.03}]},
  spin:()=>[{t:0,d:.07,f0a:240,f0b:270,F:[380,2100,2700],h:.03,asp:.35,hb:.9,amp:.6,tail:.01},{t:.07,d:.38,f0a:285,f0b:205,F:[760,1250,2600],h:0,asp:.2,oq:.48,vib:6,vd:.025}],
  jump:()=>[{t:0,d:.06,f0a:250,f0b:280,F:[380,2100,2700],h:.03,asp:.35,amp:.6,tail:.01},{t:.06,d:.24,f0a:300,f0b:235,F:[740,1220,2600],h:0,asp:.22,oq:.48}],
  roll:()=>[{t:0,d:.07,f0a:235,f0b:215,F:[470,1080,2500],h:.045,asp:.42,hb:1,amp:.85,tail:.02}],
  hurt:()=>[{t:0,d:.17,f0a:290,f0b:185,F:[560,1150,2550],h:.012,asp:.3,oq:.45,jit:.035,tail:.04}],
  fall:()=>[{t:0,d:.6,f0a:320,f0b:170,F:[700,1220,2600],h:.02,asp:.25,vib:5,vd:.03}],
  get:()=>[{t:0,d:.15,f0a:245,f0b:320,F:[740,1300,2600],h:.04,asp:.3,amp:.9}],
  groan:()=>[{t:0,d:.36,f0a:190,f0b:160,F:[520,950,2450],h:.06,asp:.45,oq:.45,jit:.03}],
  huh:()=>[{t:0,d:.2,f0a:205,f0b:290,F:[580,1450,2550],h:.05,asp:.35}],
  shout:()=>[{t:0,d:.22,f0a:300,f0b:235,F:[560,1850,2600],h:.07,asp:.3,oq:.5}]};
const HVP={};
function heroSay(k,vol){if(!voxOn()||!HEROV[k])return;const p=HVP[k]||(HVP[k]=[]);let a;if(p.length<3){a=vsynth(HEROV[k](),VSR);p.push(a)}else a=p[(Math.random()*p.length)|0];
  SND.pcm(a,VSR,{vol:(vol==null?1:vol)*.17*vloud(a),rate:.96+Math.random()*.08})}

/* ---------- everyone's voice (Part 6v, continued) ----------
   Nobody speaks words. Each character has a small vocal identity, set in its CHAR entry as `voice`:
     f0 pitch (Hz) · sc size of the vocal tract (1 grown man, ~1.15 woman, ~1.3 child, more = tinier) · vow the vowels it uses
     cons how syllables start (h breath, m/n hum, b/d/k a tap, space none) · rate syllables a second · len syllable length
     breath · vib/vd vibrato · jit roughness · oq breathy (.7) or pressed (.45) · glide pitch across a syllable · wobble between syllables
     vol · whisper (no voice at all) · two (a second voice that alternates: the twins) · stutter
     greet / laugh / react: which little sounds it makes · idle: what it does on its own when you're near
   As letters appear in the dialogue box a syllable is spoken every few letters, bent by the line's mood. */
const VOW={a:[730,1090,2440],e:[530,1840,2480],i:[390,1990,2550],o:[570,840,2410],u:[440,1020,2240],y:[300,2240,3000],'@':[500,1500,2500],A:[660,1720,2410]};
const MOODS={neutral:{f:1,rate:1,len:1},happy:{f:1.07,rate:1.08,len:.95,ga:1.04},excited:{f:1.15,rate:1.18,len:.9,ga:1.06,amp:1.1},question:{f:1.02,rate:1,len:1,rise:1},
  hesitant:{f:.95,rate:.72,len:1.08,stut:.22},sad:{f:.88,rate:.76,len:1.2,gb:.93,amp:.85},angry:{f:.9,rate:1.12,len:.85,gb:.9,amp:1.15},surprise:{f:1.18,rate:1.08,len:.9},
  laugh:{f:1.08,rate:1.1,len:.95},confused:{f:1,rate:.88,len:1.05,rise:1},mysterious:{f:.93,rate:.78,len:1.18,amp:.8,asp:1.9,gb:.95}};
const vowF=(V,k)=>VOW[k].map((f,i)=>f*(i?V.sc:(1+(V.sc-1)*.8)));
/* one babble syllable in a voice and mood */
function sylFor(V,mood){const M=MOODS[mood]||MOODS.neutral,R=Math.random,vk=V.vow[(R()*V.vow.length)|0],c=(V.cons||'h ')[(R()*(V.cons||'h ').length)|0],d=(V.len||.075)*(M.len||1)*(.82+R()*.36),
  f0=V.f0*(M.f||1)*(1+(R()-.5)*2*(V.wobble||.06)),g=V.glide||[1.04,.96];
  return{t:0,d,f0a:f0*g[0]*(M.ga||1),f0b:f0*g[1]*(M.gb||1),F:vowF(V,vk),B:[85*V.sc,150*V.sc,230*V.sc],h:c==='h'?.028:/[bdk]/.test(c)?.008:0,asp:V.whisper?1:Math.min(1,(M.asp||1)*(c==='h'?(V.breath||.25)+.1:/[bdk]/.test(c)?.32:(V.breath||.25))),
    n0:/[mn]/.test(c)?d*.35:0,vib:V.vib||6,vd:V.vd,jit:V.jit,oq:V.oq,voiced:!V.whisper,tail:.022}}
/* the little sounds: built from the same voice so they fit the character */
const VSND={
  hm:(V)=>[{t:0,d:.17,f0a:V.f0*.96,f0b:V.f0*1.14,F:vowF(V,'@'),n0:.17,h:.01,asp:.12}],
  hmm:(V)=>[{t:0,d:.13,f0a:V.f0,f0b:V.f0*.9,F:vowF(V,'@'),n0:.13,h:.02,asp:.1},{t:.15,d:.2,f0a:V.f0*.92,f0b:V.f0*1.25,F:vowF(V,'@'),n0:.2,h:0,asp:.1}],
  heh:(V)=>[0,1].map(i=>({t:i*.12,d:.065,f0a:V.f0*(1.15-i*.08),f0b:V.f0*(1.02-i*.08),F:vowF(V,'e'),h:.03,asp:(V.breath||.25)+.15,tail:.02})),
  oh:(V)=>[{t:0,d:.2,f0a:V.f0*1.3,f0b:V.f0*1.0,F:vowF(V,'o'),h:.012,asp:.18}],
  ah:(V)=>[{t:0,d:.22,f0a:V.f0*1.12,f0b:V.f0*.9,F:vowF(V,'a'),h:.02,asp:.2}],
  hey:(V)=>[{t:0,d:.09,f0a:V.f0*1.05,f0b:V.f0*1.12,F:vowF(V,'e'),h:.03,asp:.25},{t:.1,d:.12,f0a:V.f0*1.18,f0b:V.f0*1.28,F:vowF(V,'y'),h:0,asp:.12}],
  uh:(V)=>[{t:0,d:.12,f0a:V.f0,f0b:V.f0*.94,F:vowF(V,'@'),h:0,asp:.2},{t:.22,d:.08,f0a:V.f0*1.05,f0b:V.f0*1.1,F:vowF(V,'a'),h:.025,asp:.25}],
  eep:(V)=>[{t:0,d:.09,f0a:V.f0*1.5,f0b:V.f0*1.75,F:vowF(V,'y'),h:.004,asp:.1}],
  hoho:(V)=>[0,1,2].map(i=>({t:i*.16,d:.1,f0a:V.f0*(1.1-i*.06),f0b:V.f0*(.98-i*.06),F:vowF(V,'o'),h:.035,asp:(V.breath||.25)+.12})),
  kraa:(V)=>[0,1].map(i=>({t:i*.2,d:.13,f0a:V.f0*1.6,f0b:V.f0*1.3,F:vowF(V,'A'),h:.004,asp:.35,jit:.18,oq:.4})),
  wheeze:(V)=>[0,1,2].map(i=>({t:i*.14,d:.09,f0a:V.f0*1.2,f0b:V.f0*1.1,F:vowF(V,'e'),h:.03,asp:.7,jit:.1})),
  giggle:(V)=>giggleSyl({f0:V.f0*1.35,sc:V.sc,n:5+(Math.random()*2|0),rate:(V.rate||9)*1.05,dur:.04}),
  sigh:(V)=>[{t:0,d:.55,f0a:V.f0,f0b:V.f0,F:vowF(V,'a'),h:.08,hb:.9,asp:1,voiced:false,amp:.8,tail:.12},{t:.04,d:.42,f0a:V.f0*1.05,f0b:V.f0*.8,F:vowF(V,'a'),h:0,asp:.4,oq:.75,amp:.42,tail:.1}],
  grunt:(V)=>[{t:0,d:.11,f0a:V.f0*.85,f0b:V.f0*.78,F:vowF(V,'@'),h:.015,asp:.3,jit:.06,oq:.45}],
  gasp:(V)=>[{t:0,d:.16,f0a:V.f0*1.4,f0b:V.f0*1.6,F:vowF(V,'a'),h:.03,hb:.9,asp:1,voiced:false,tail:.04},{t:.02,d:.1,f0a:V.f0*1.45,f0b:V.f0*1.7,F:vowF(V,'a'),h:0,asp:.3,amp:.35}],
  yawn:(V)=>[{t:0,d:.85,f0a:V.f0*1.15,f0b:V.f0*.85,F:vowF(V,'a'),h:.05,asp:.45,vd:.03,vib:4},{t:.85,d:.25,f0a:V.f0*.85,f0b:V.f0*.75,F:vowF(V,'o'),n0:.15,asp:.3}],
  snore:(V)=>[{t:0,d:.7,f0a:V.f0*.6,f0b:V.f0*.62,F:vowF(V,'o').map(f=>f*.7),h:.05,asp:.9,voiced:false,amp:.7},{t:.75,d:.4,f0a:V.f0*.5,f0b:V.f0*.45,F:vowF(V,'@'),n0:.4,asp:.4,jit:.15,amp:.5}],
  cough:(V)=>[0,1].map(i=>({t:i*.22,d:.09,f0a:V.f0*1.1,f0b:V.f0*.9,F:vowF(V,'@'),h:.004,asp:.8,jit:.1})),
  throat:(V)=>[{t:0,d:.16,f0a:V.f0*.8,f0b:V.f0*.85,F:vowF(V,'@'),n0:.05,h:.03,asp:.5,jit:.2},{t:.22,d:.14,f0a:V.f0*.95,f0b:V.f0*1.05,F:vowF(V,'@'),n0:.14,asp:.1}],
  shh:(V)=>[{t:0,d:.6,f0a:V.f0,f0b:V.f0,F:[2500*V.sc,3600*V.sc,4800],B:[600,800,900],h:.05,asp:1,voiced:false,amp:.6}],
  sniff:(V)=>[0,1].map(i=>({t:i*.16,d:.07,f0a:V.f0,f0b:V.f0,F:[2000,3200,4200],B:[700,900,1100],h:.01,asp:1,voiced:false,amp:.5})),
  breath:(V)=>[{t:0,d:.45,f0a:V.f0,f0b:V.f0,F:vowF(V,'@'),h:.08,asp:1,voiced:false,amp:.45}],
  whisper:(V)=>Array.from({length:4+(Math.random()*3|0)},(x,i)=>Object.assign(sylFor(Object.assign({},V,{whisper:true}),'neutral'),{t:i*.13})),
  mutter:(V)=>Array.from({length:4+(Math.random()*3|0)},(x,i)=>Object.assign(sylFor(V,'neutral'),{t:i*(1/(V.rate||8))*1.1,amp:.6+Math.random()*.4})),
  chuckle:(V)=>[0,1,2].map(i=>({t:i*.13,d:.06,f0a:V.f0*(1.08-i*.05),f0b:V.f0*(.98-i*.05),F:vowF(V,'@'),h:.03,asp:.4,amp:1-i*.2})),
  hum:(V)=>{const sc=[0,3,5,7,10,12],n=4+(Math.random()*3|0),o=[];let t=0;for(let i=0;i<n;i++){const st=sc[(Math.random()*sc.length)|0]-5,d=.22+Math.random()*.22;o.push({t,d,f0a:V.f0*.9*Math.pow(2,st/12),f0b:V.f0*.9*Math.pow(2,st/12),F:vowF(V,'@'),n0:d,h:0,asp:.08,vib:5,vd:.02,tail:.06,atk:.025,amp:.8});t+=d+.01}return o}};
/* sounds that aren't voices: tools, pages, coins, the reel, a match */
const FSND={
  scrape:v=>{for(let i=0;i<3;i++)SND.noise(.07,{hp:2600+Math.random()*900,vol:.02*v,at:i*.16,off:Math.random()*.4})},
  clink:v=>{for(let i=0;i<3;i++)SND.tone(2200+Math.random()*1400,.05,{type:'triangle',vol:.018*v,at:i*.07+Math.random()*.03,to:2000})},
  rustle:v=>{for(let i=0;i<4;i++)SND.noise(.06,{hp:1800,vol:.018*v,at:i*.06,off:Math.random()*.4})},
  reel:v=>{for(let i=0;i<9;i++)SND.noise(.008,{hp:3000,vol:.02*v,at:i*.045,off:Math.random()*.4})},
  match:v=>{SND.noise(.05,{hp:2500,vol:.03*v,off:Math.random()*.4});SND.noise(.35,{lp:900,vol:.018*v,at:.05,off:Math.random()*.1})},
  whistle:v=>{const b=900+Math.random()*200;[0,4,7,4,2].forEach((st,i)=>SND.tone(b*Math.pow(2,st/12),.16,{type:'sine',vol:.016*v,at:i*.19,to:b*Math.pow(2,st/12)*1.01}))},
  chirp:v=>{for(let i=0;i<3;i++)SND.tone(1800+Math.random()*900,.06,{type:'sine',vol:.016*v,at:i*.09,to:2600+Math.random()*600})},
  cast:v=>{SND.noise(.16,{hp:1400,vol:.024*v,off:Math.random()*.3});SND.noise(.05,{hp:3000,vol:.012*v,at:.5,off:Math.random()*.3})},
  armour:v=>{SND.tone(180,.08,{type:'square',vol:.012*v,to:150});SND.noise(.05,{hp:1500,vol:.015*v,at:.03,off:Math.random()*.4})}};
const voiceOf=id=>(CHAR[id]&&CHAR[id].voice)||null;
const voxOn=()=>!!(SND.pcm&&SND.mode&&SND.ctx&&SND.ctx.state==='running');
/* how loud a sound really is: its loudest 12 ms. Every sound is brought to the same level before its own volume is applied,
   so a breathy voice and a buzzing one, a short "heh" and a long hum, all sit together under the music */
function vloud(a){if(a.g)return a.g;let mx=1e-4;for(let i=0;i<a.length;i+=128){const e=Math.min(a.length,i+256);let q=0;for(let j=i;j<e;j++)q+=a[j]*a[j];mx=Math.max(mx,Math.sqrt(q/(e-i)))}return a.g=.225/mx}
/* breath and noise read louder than voice at the same level, so they are set back a little */
const VSOFT={sigh:.7,breath:.55,shh:.6,sniff:.6,snore:.75,yawn:.85,whisper:.85,gasp:.7,hum:.8,wheeze:.75,cough:.8};
/* two channels: VOX.cur speaks (dialogue: each syllable cuts off the last, so nothing overlaps) and VOX.amb carries the small
   sounds people make on their own. A line of dialogue silences both; closing the box or leaving the room stops everything. */
const VOX={cur:null,amb:null,sp:null,pool:{},named:{},q:[],idleT:0,onSyl:null};
function voxStop(){if(VOX.cur){VOX.cur.stop();VOX.cur=null}}
function voxEnd(){voxStop();VOX.sp=null;if(VOX.amb){VOX.amb.stop();VOX.amb=null}}
function voxBuf(a,vol,rate,amb){if(!voxOn()||!a||!a.length)return null;const hd=SND.pcm(a,VSR,{vol:vol*vloud(a),rate})||null;
  if(amb){if(VOX.amb)VOX.amb.stop();VOX.amb=hd}else{voxStop();VOX.cur=hd}return hd}
/* syllables are kept in a small pool per voice and mood and re-drawn now and then, so speech varies without being rebuilt every time */
function voxSyl(key,V,mood){let p=VOX.pool[key+'|'+mood];if(!p)p=VOX.pool[key+'|'+mood]={a:[],last:-1};
  if(p.a.length<9||Math.random()<.07){const sy=sylFor(V,mood),b=vsynth([sy],VSR);b.dur=sy.d+.022;if(p.a.length<9)p.a.push(b);else p.a[(Math.random()*9)|0]=b}
  let i=(Math.random()*p.a.length)|0;if(i===p.last&&p.a.length>1)i=(i+1)%p.a.length;p.last=i;return p.a[i]}
/* a named little sound in a character's voice (or a tool noise); returns how long it lasts.
   amb: an ambient sound (idle, noticing you) rather than speech. V/who: a particular voice of the character (the twins have two) */
function voxSay(id,name,vol,amb,V,who){V=V||voiceOf(id);if(!V||!name)return 0;vol=vol==null?1:vol;
  if(FSND[name]){if(voxOn())FSND[name](vol);return .4}if(!VSND[name])return 0;let end;
  if(voxOn()){const a=voxNamed(id,V,who,name),r=.97+Math.random()*.06;end=a.dur/r;voxBuf(a,(V.vol||.2)*vol*(VSOFT[name]||1),r,amb)}
  else{end=0;for(const q of VSND[name](V))end=Math.max(end,q.t+q.d)}
  if(VOX.onSyl&&!amb)VOX.onSyl(id,Math.min(end,.45),who|0);return end}
/* named sounds are built ahead of time: a few versions of each, for the people in the room, one per frame (voxTick),
   so making a sound never costs a frame. Each use may queue a fresh version, so they keep varying. */
function voxBuild(V,name){const syl=VSND[name](V);if(V.whisper)for(const q of syl){q.voiced=false;q.asp=1}let end=0;for(const q of syl)end=Math.max(end,q.t+q.d);const a=vsynth(syl,VSR);a.dur=end;return a}
const vnKey=(id,who,name)=>id+'#'+(who|0)+'|'+name;
function voxNamed(id,V,who,name){const k=vnKey(id,who,name),c=VOX.named[k]||(VOX.named[k]=[]);
  if(!c.length){const a=voxBuild(V,name);c.push(a);return a}if((c.length<3||Math.random()<.3)&&VOX.q.length<40)VOX.q.push([k,V,name]);return c[(Math.random()*c.length)|0]}
function voxWarm(ents){VOX.q.length=0;const here=new Set();
  for(const e of ents){if(e.k!=='npc'||here.has(e.id))continue;const V=voiceOf(e.id);if(!V)continue;here.add(e.id);
    for(const[who,VV]of V.two?[[0,V],[1,Object.assign({},V,V.two)]]:[[0,V]]){const names=new Set([VV.greet,VV.react,VV.laugh,VV.surprise,VV.confused,VV.angry,'oh','hmm','sigh',...(VV.idle||[])].filter(n=>n&&VSND[n]));
      for(let i=0;i<2;i++)for(const n of names)VOX.q.push([vnKey(e.id,who,n),VV,n])}}
  /* forget the voices of people who aren't here any more */
  for(const k in VOX.named)if(!here.has(k.split('#')[0]))delete VOX.named[k];for(const k in VOX.pool)if(!here.has(k.split('#')[0]))delete VOX.pool[k]}
/* the mood of a line: an explicit {tag} at its start, or its punctuation and first word */
function lineMood(text,base){const m=/^\{(\w+)\}\s*/.exec(text);if(m&&MOODS[m[1]])return[m[1],text.slice(m[0].length)];const s=text.trim().replace(/^[A-Z]{2,}:\s*/,'');let mood=base||'neutral';
  if(/^(ha|heh|hah|hee|ho)[\s,.!-]/i.test(s)||/\b(ha ?ha|heh heh|hee hee)\b/i.test(s))mood='laugh';
  else if(/^(oh|ah|what|wha|eh)[!?]/i.test(s)||/^(oh|ah)!/i.test(s))mood='surprise';
  else if(/^(hm+|mm+)\b/i.test(s))mood='confused';
  else if(/\.\.\.|…/.test(s))mood=base==='mysterious'||base==='sad'?base:'hesitant';
  else if(/\?\s*$/.test(s))mood='question';
  else if(/!/.test(s))mood=base==='sad'?'sad':'excited';
  return[mood,text]}
/* the sound that comes before a line in a strong mood: the character's own if it has one, otherwise a common one */
const MOODSND={laugh:['laugh','heh'],surprise:['surprise','oh'],confused:['confused','hmm'],sad:['sigh','sigh'],angry:['angry','grunt']};
/* starting a line: maybe a greeting or a reaction first, then syllables as the letters come.
   The twins: a line that starts with the second twin's name is spoken in the second voice, by the second head. */
function voxLine(id,text,mood,first){voxEnd();const V0=voiceOf(id);if(!V0)return;let V=V0,who=0;
  if(V0.two&&V0.two.tag&&text.startsWith(V0.two.tag+':')){V=Object.assign({},V0,V0.two);who=1}
  const M=MOODS[mood]||MOODS.neutral;VOX.sp={id,V,who,key:id+'#'+who,mood,text,next:3,cps:55/((V.rate||8)*(M.rate||1)),n:0,wait:0};
  let s=null;if(first&&V.greet)s=V.greet;else{const k=MOODSND[mood];if(k&&Math.random()<.8)s=V[k[0]]||k[1]}
  if(s){const d=voxSay(id,s,1,false,V,who);VOX.sp.wait=d+.05}}
/* called by the dialogue box with how many letters are showing: one syllable every few letters, a pause at punctuation,
   a rise at the end of a question, a stumble for the nervous. The mouth moves with it even when the sound is off. */
function voxType(shown,dt){const sp=VOX.sp;if(!sp)return;if(sp.wait>0){sp.wait-=dt;if(sp.wait<=0&&shown>sp.next)sp.next=shown;return}
  if(shown-sp.next>sp.cps*1.5)sp.next=shown-sp.cps*.5;
  const L=sp.text.length;let guard=0;while(shown>=sp.next&&sp.next<L&&guard++<12){const ch=sp.text[Math.floor(sp.next)]||' ';
    if(/[.,!?;:—…-]/.test(ch)){sp.next+=sp.cps*.9;continue}
    if(!/[A-Za-z0-9']/.test(ch)){sp.next+=1;continue}
    const k=sp.next/L,M=MOODS[sp.mood]||MOODS.neutral,V=sp.V,rate=(M.rise&&k>.6?1+(k-.6)*.7:1)*(.97+Math.random()*.06);let d=(V.len||.075)*(M.len||1)/rate;
    if(voxOn()){const b=voxSyl(sp.key,V,sp.mood);voxBuf(b,(V.vol||.2)*(M.amp||1),rate);d=b.dur/rate}
    sp.n++;if(VOX.onSyl)VOX.onSyl(sp.id,d,sp.who);
    const stut=(M.stut||0)+(V.stutter||0)*.4;sp.next+=stut&&Math.random()<stut?sp.cps*.35:sp.cps*(.8+Math.random()*.45);break}}
/* the hush that comes with a skipped line: stop speaking, the text is all there */
function voxSkip(){voxEnd()}
/* noticing you: their own little sound as they react, unless someone has only just made one */
function voxReact(e,d,name){const V=voiceOf(e.id);name=name||(V&&V.react);if(!V||!name||VOX.sp||VOX.idleT>1.5)return;VOX.idleT=Math.max(VOX.idleT,2.8);voxSay(e.id,name,clamp(1.2-d/80,.35,.9),true)}
/* idle sounds: each character near you makes one of its own sounds now and then, never the same twice running,
   and only one person anywhere at a time, with a good gap between, so a crowd murmurs instead of chattering */
function voxIdle(e,dt,d){const V=voiceOf(e.id);if(!V||!V.idle)return;e.vT=(e.vT==null?4+Math.random()*8:e.vT)-dt;if(e.vT>0)return;e.vT=9+Math.random()*13;
  if(d>96||VOX.idleT>0||VOX.sp)return;const list=V.idle.filter(x=>x!==e.vLast);let name=list[(Math.random()*list.length)|0];if(e.id==='bram'&&!e.awake)name=Math.random()<.85?'snore':'breath';
  e.vLast=name;VOX.idleT=4.5+Math.random()*2;voxSay(e.id,name,clamp(1.15-d/100,.15,.85),true)}
function voxTick(dt){if(VOX.idleT>0)VOX.idleT-=dt;if(VOX.q.length&&voxOn()){const[k,V,name]=VOX.q.shift(),c=VOX.named[k]||(VOX.named[k]=[]),a=voxBuild(V,name);if(c.length<3)c.push(a);else c[(Math.random()*3)|0]=a}}
/* ---------- Part 6b: the two scenes in the woods outside the tree ----------
   The opening: a long, slow ride through an old wood in the rain. Two seedlings walk you off the path, Wick takes
   your horse and rides it into the tree, and the tree eats him, then you. The ending: the rain has gone, the tree is
   dead, everyone walks out, and your horse comes back. Nothing here talks to the game; it is a little film with its
   own set, weather, sound, actors and camera. */
const CINE={sc:null,cam:null,t:0,kind:'',done:null,len:0,fade:1,cues:new Set(),A:{},gal:0,galN:0,wph:0,flashAt:-99,flashP:0,lens:[],lamps:[],flap:[],shafts:[]};
const cs=t=>t<=0?0:t>=1?1:t*t*(3-2*t),cp=(t,a,b)=>clamp((t-a)/(b-a),0,1),cl=(a,b,k)=>a+(b-a)*k;
const lerp3=(a,b,k)=>[cl(a[0],b[0],k),cl(a[1],b[1],k),cl(a[2],b[2],k)];
/* rises over e seconds from a, holds, and falls back by b; blip is one quick bump */
const hump=(t,a,b,e)=>{e=e||.6;return cs(cp(t,a,a+e))*(1-cs(cp(t,b-e,b)))},blip=(t,a,b)=>t<a||t>b?0:Math.sin((t-a)/(b-a)*Math.PI);
/* where an actor is at time t, from a list of [time, x, y, z] keys */
function kf(K,t){if(t<=K[0][0])return K[0].slice(1);for(let i=1;i<K.length;i++){if(t<=K[i][0]){const a=K[i-1],b=K[i],k=(t-a[0])/(b[0]-a[0]||1);return[cl(a[1],b[1],k),cl(a[2],b[2],k),cl(a[3],b[3],k)]}}return K[K.length-1].slice(1)}

/* ---------- the road: it wanders north of the clearing, crosses a creek, then runs straight at the tree ---------- */
const CREEK=24.5,WZMAX=78;
const roadX=z=>z<=16?0:Math.sin((z-16)*.13)*1.9*cs(cp(z,16,23));
function wGround(x,z){const dx=Math.abs(x-roadX(z)),ck=Math.abs(z-CREEK);return Math.max(0,dx-4.5)*.12*vnoise(x*.2,z*.2)-(ck<1.9?.58*cs(1-ck/1.9):0)}
/* the ride: a slow walk, a stop at the roadside shrine, then on again, slowing as it nears the clearing.
   Speeds are integrated once so the horse arrives at z=14 exactly when the old opening takes over. */
const RIDE=(()=>{const len=34,dt=.05,v=t=>t<13.4?1.2+Math.sin(t*.5)*.04:t<14.6?1.2*(1-cs(cp(t,13.4,14.6))):t<16.9?0:t<18.4?1.25*cs(cp(t,16.9,18.4)):t<30?1.25:cl(1.25,1,cs(cp(t,30,34)));
  const zs=[0];let z=0;for(let i=1;i<=len/dt;i++){z+=v((i-.5)*dt)*dt;zs.push(z)}return{len,dt,z:zs.map(s=>14+z-s)}})();
const rideZ=t=>{const f=clamp(t,0,RIDE.len)/RIDE.dt,i=Math.min(f|0,RIDE.z.length-2);return cl(RIDE.z[i],RIDE.z[i+1],f-i)};
const STOPZ=rideZ(15),SHZ=STOPZ-.9,SHX=roadX(SHZ)+1.75;
/* after the ride: the ambush, the theft, the chase and the tree, all on one clock (ambushAt, a = seconds since the ride ended) */
const RIDE_T=34,AMB_LEN=30.4,TREE0=RIDE_T+21,INTRO_LEN=RIDE_T+AMB_LEN;
/* the tree off to the right of the road where the seedlings live */
const SEEDT=[3.6,0,11.0];
/* puddles along the road: [x, z, rx, rz] */
const PUD=[];(()=>{const R=rngOf(777),add=(x,z,rx,rz)=>PUD.push([x,z,rx,rz]);
  for(let z=-9;z<58;z+=2.2+R()*2.6){if(Math.abs(z-CREEK)<2.6||Math.abs(z-37.7)<1.2||Math.abs(z-30.6)<2)continue;add(roadX(z)+(R()-.5)*1.5,z,.26+R()*.4,.2+R()*.26)}
  add(roadX(37.7)+.35,37.7,.5,.34);add(roadX(31.6)+.18,31.6,.56,.4);add(roadX(29.7)-.22,29.7,.5,.36)})();
const inPud=(x,z)=>PUD.some(p=>{const a=(x-p[0])/p[2],b=(z-p[1])/p[3];return a*a+b*b<1});

/* ---------- textures and materials for the wood ---------- */
paint('bark2',64,(x,s,R,W)=>{W('#9a9a9a',0,0,s,s);for(let n=0;n<240;n++)W(g8(115+R()*95),R()*s|0,R()*s|0,1,1+(R()*3|0));
  /* deep furrows that wander but meet themselves top and bottom, so the trunk tiles */
  for(let k=0;k<12;k++){const c0=R()*s,f=1+(R()*2|0),ph=R()*TAU,a=1.5+R()*2.5,w=1+(R()<.4?1:0);for(let y=0;y<s;y++){const cx=((c0+Math.sin(y/s*TAU*f+ph)*a)%s+s)%s|0;W('#232323',cx,y,w,1);W('#474747',(cx+w)%s,y,1,1);W('#d2d2d2',(cx+s-1)%s,y,1,1)}}
  for(let n=0;n<16;n++){const a=R()*s|0,b=1+(R()*(s-2)|0),w=2+R()*5|0;W('#363636',a,b,w,1);W('#c8c8c8',a,b-1,w,1)}});
paint('creek',32,(x,s,R,W)=>{W('#7a7a7a',0,0,s,s);for(let n=0;n<50;n++)W(g8(100+R()*70),R()*s|0,R()*s|0,1,1);for(let k=0;k<10;k++){const y0=R()*s|0,len=5+R()*14|0,a=R()*s|0;W('#dadada',a,y0,len,1);W('#565656',(a+3)%s,(y0+1)%s,Math.max(1,len-5),1)}});
MAT.cgrass=new TH.MeshLambertMaterial({map:TEX.grass,vertexColors:true});
MAT.cdirt=new TH.MeshPhongMaterial({map:TEX.dirt,vertexColors:true,shininess:24,specular:0x2a2e30});
MAT.cbark=new TH.MeshLambertMaterial({map:TEX.bark2,vertexColors:true});
MAT.cleaf=new TH.MeshLambertMaterial({map:TEX.leaf,vertexColors:true});
MAT.cmoss=new TH.MeshLambertMaterial({map:TEX.grass,vertexColors:true});
MAT.cwood=new TH.MeshLambertMaterial({map:TEX.wood,vertexColors:true});
MAT.cpud=new TH.MeshPhongMaterial({vertexColors:true,shininess:45,specular:0x56606a,transparent:true,opacity:.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
['cbark','cleaf','cmoss','cwood'].forEach(k=>nearFade(MAT[k]));
/* three slightly lumpy trunk shapes (so no two trees share a silhouette), a thin limb, a flat disc */
const CG=(()=>{const tr=n=>{const g=new TH.CylinderGeometry(.8,1,1,7,1,true),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.round((Math.atan2(z,x)+TAU)%TAU*100)%628,k=1+((hashN(a,Math.round(y*10)+n*37,n)%100)/100-.5)*.3;p.setX(i,x*k);p.setZ(i,z*k)}return fb(g)};
  return{tr:[tr(1),tr(2),tr(3)],limb:fb(new TH.CylinderGeometry(.72,1,1,5,1,true)),disc:fb(new TH.CircleGeometry(1,12).rotateX(-Math.PI/2))}})();
/* a shape stretched from point a to point b with radius r */
const _up3=new TH.Vector3(0,1,0),_dir3=new TH.Vector3(),_qa=new TH.Quaternion(),_qb=new TH.Quaternion();
function M4d(a,b,r,spin){_dir3.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L=_dir3.length()||1e-4;_dir3.divideScalar(L);_qa.setFromUnitVectors(_up3,_dir3);_qb.setFromAxisAngle(_up3,spin==null?a[0]*3.1+a[2]*1.7:spin);_qa.multiply(_qb);
  return new TH.Matrix4().compose(new TH.Vector3((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),_qa,new TH.Vector3(r,L*1.1,r))}
const pk=(R,a)=>a[(R()*a.length)|0],wc=(R,a,v)=>{v=v||.15;return mulc(col3(pk(R,a)),1-v+R()*v*2)};
const BARKC=['#4a3a2c','#54443a','#3e342a','#584a3c','#463c34'],MOSSC=['#4a5e2c','#56682e','#3e5226','#5e6a3a'],LEAFC=['#2c4228','#324a2c','#3a4e30','#28402e','#36462a'],PINEC=['#22362c','#283c30','#2e4030'],CAPC=['#7a4a2a','#b8a880','#9a4224','#c8b898','#6a3a22'];

/* ---------- the forest floor ---------- */
function wMush(B,R,x,z,n,glowOK){for(let i=0;i<n;i++){const a=R()*TAU,d=R()*.28,mx=x+Math.cos(a)*d,mz=z+Math.sin(a)*d,y=wGround(mx,mz),h=.04+R()*.11,glow=glowOK&&R()<.3;
  B.geom('plain',BG.cyl6,M4(mx,y+h/2,mz,.012+h*.12,h,.012+h*.12),col3('#cfc4ae'),.3);
  B.geom(glow?'glow':'plain',BG.hemi,M4(mx,y+h-.01,mz,.035+h*.42,.03+h*.28,.035+h*.42,R()*6,(R()-.5)*.3),glow?mulc(col3('#6ad8b0'),.7):wc(R,CAPC),glow?0:.35)}}
function wFern(B,R,x,z,s){const y=wGround(x,z),n=5+(R()*3|0),c=wc(R,['#3a5a2a','#44602e','#34502a']);for(let i=0;i<n;i++){const a=i/n*TAU+R()*.5;B.geom('cleaf',BG.cone4,M4(x+Math.sin(a)*.2*s,y+.16*s,z+Math.cos(a)*.2*s,.05*s,.5*s,.17*s,a,.8+R()*.4),mulc(c,.85+R()*.3),.5)}}
function wRock(B,R,x,z,s){const y=wGround(x,z);B.geom('rock',BG.dode,M4(x,y+.12*s,z,.42*s,.3*s,.36*s,R()*6,(R()-.5)*.4),mulc(col3('#6a6a62'),.7+R()*.3),.45);if(R()<.75)B.geom('cmoss',BG.ico,M4(x,y+.3*s,z,.36*s,.1*s,.3*s,R()*6),wc(R,MOSSC),.2)}
/* trees: an ancient oak, a crooked leaning one, a dead snag, a hollow shell, a pine. Every one is grown from its own
   random numbers, so heights, girths, bends, roots and crowns all differ. */
function wTree(B,R,x,z,s,kind){const y0=wGround(x,z)-.06,rx0=roadX(z);
  if(kind==='pine'){const H=(5+R()*3)*s,bc=wc(R,['#3a2e26','#33291f']);B.geom('cbark',CG.tr[(R()*3)|0],M4d([x,y0,z],[x+(R()-.5)*.25,y0+H*.9,z+(R()-.5)*.25],.16*s),bc,.3,1.4);
    const L=4+(R()*3|0),c2=wc(R,PINEC);for(let i=0;i<L;i++){const k=i/(L-1),r=cl(1.5,.42,k)*s,yy=y0+cl(1.4*s,H*.92,k);B.geom('cleaf',BG.cone7,M4(x+(R()-.5)*.15,yy+r*.55,z+(R()-.5)*.15,r,r*1.2,r,R()*6,(R()-.5)*.12,(R()-.5)*.12),mulc(c2,.85+k*.25),.55)}return}
  const dead=kind==='dead',hollow=kind==='hollow',bc=dead?wc(R,['#5a5248','#4e4840','#62584c']):wc(R,BARKC);
  const N=hollow?2:4,H=(hollow?1.9+R()*.8:dead?3.4+R()*1.4:2.7+R()*1.2)*s,r0=(hollow?.55+R()*.15:dead?.2+R()*.08:.27+R()*.13)*s,lean=(kind==='lean'?1.1:.3)*s;
  const la=R()*TAU,f1=1+R()*1.6,ph=R()*TAU,bend=(.12+R()*.26)*s,TG=CG.tr[(R()*3)|0];
  const P=[];for(let i=0;i<=N;i++){const k=i/N;P.push([x+Math.cos(la)*lean*k*k+Math.sin(k*f1*3+ph)*bend*k,y0+H*k,z+Math.sin(la)*lean*k*k+Math.cos(k*f1*2.3+ph)*bend*k])}
  const rs=[];let r=r0;for(let i=0;i<N;i++){rs.push(r);B.geom('cbark',TG,M4d(P[i],P[i+1],r),mulc(bc,.92+i*.04),.25,1.5);r*=hollow?.92:.8}
  B.geom('cbark',TG,M4d([x,y0-.15,z],[cl(x,P[1][0],.3),y0+r0*1.5+.1,cl(z,P[1][2],.3)],r0*1.5),mulc(bc,.88),.3,2);
  /* roots: they arch out of the trunk and dive back into the ground, kept off the road */
  const nr=hollow?6:4+(R()*3|0);for(let j=0;j<nr;j++){const a=j/nr*TAU+R()*.7,ca=Math.cos(a),sa=Math.sin(a);let L=(.7+R()*.8)*s;
    const far=d=>Math.abs(x+ca*d-roadX(z+sa*d));for(let g=0;g<4&&far(r0+L)<2.1;g++)L*=.65;
    const ex=x+ca*(r0+L),ez=z+sa*(r0+L),mx=x+ca*(r0+L*.42),mz=z+sa*(r0+L*.42),p0=[x+ca*r0*.4,y0+r0*1.0,z+sa*r0*.4],p1=[mx,Math.max(y0+.2*s,wGround(mx,mz)+.1)+R()*.1,mz],p2=[ex,wGround(ex,ez)-.08,ez];
    B.geom('cbark',CG.limb,M4d(p0,p1,r0*.4),bc,.3,1);B.geom('cbark',CG.limb,M4d(p1,p2,r0*.26),mulc(bc,.92),.3,1);
    if(R()<.5)B.geom('cmoss',BG.ico,M4(p1[0],p1[1]+r0*.22,p1[2],r0*.36,r0*.14,r0*.36,a),wc(R,MOSSC),.25)}
  /* moss creeping up the lower trunk */
  const nm=dead?1:2+(R()*3|0);for(let j=0;j<nm;j++){const i=(R()*Math.min(2,N))|0,k=R(),pp=lerp3(P[i],P[i+1],k),rr=rs[i]*(1-.2*k),a=R()*TAU;B.geom('cmoss',BG.ico,M4(pp[0]+Math.cos(a)*rr*.82,pp[1],pp[2]+Math.sin(a)*rr*.82,rr*.55,rr*.95,rr*.3,Math.atan2(Math.cos(a),Math.sin(a))),wc(R,MOSSC),.2)}
  const top=P[N];
  if(hollow){/* a broken shell: a jagged rim, a dark throat on top, and a hole facing the road */
    const rt=rs[N-1]*.92,hc=col3('#0d0a08');B.geom('plain',BG.cyl8,M4(top[0],top[1]-.02,top[2],rt*.86,.05,rt*.86),hc);
    for(let j=0;j<7;j++){const a=j/7*TAU+R()*.4;B.geom('cbark',BG.cone4,M4(top[0]+Math.cos(a)*rt*.85,top[1]+.1*s,top[2]+Math.sin(a)*rt*.85,rt*.28,(.25+R()*.45)*s,rt*.2,R()*6),bc,.3)}
    const sd=x<rx0?1:-1;B.geom('plain',BG.dode,M4(x+sd*r0*1.12,y0+.72*s,z,.14*s,.44*s,.34*s,0),hc);wMush(B,R,x+sd*r0*1.5,z,3,true)}
  else if(dead){/* bare and broken: a snapped crown and crooked limbs */
    B.geom('cbark',BG.cone4,M4(top[0],top[1]+.25*s,top[2],rs[N-1]*.7,.6*s,rs[N-1]*.6,R()*6,(R()-.5)*.5),bc,.3);
    const nb=4+(R()*3|0);for(let j=0;j<nb;j++){const k=.45+R()*.5,i=Math.min(N-1,(k*N)|0),st=lerp3(P[i],P[i+1],k*N-i),a=R()*TAU,L=(.7+R()*.9)*s,up=.2+R()*.7;
      const e1=[st[0]+Math.cos(a)*L,st[1]+L*up,st[2]+Math.sin(a)*L];B.geom('cbark',CG.limb,M4d(st,e1,rs[i]*.35),bc,.3,1);
      if(R()<.7){const a2=a+(R()-.5)*1.4,L2=L*.6;B.geom('cbark',CG.limb,M4d(e1,[e1[0]+Math.cos(a2)*L2,e1[1]+L2*(up+.2),e1[2]+Math.sin(a2)*L2],rs[i]*.2),bc,.3,1)}}}
  else{/* big crooked limbs ending in heavy clumps, with grey moss hanging off them */
    const lc=wc(R,LEAFC),nb=2+(R()*3|0),ends=[top];
    for(let j=0;j<nb;j++){const k=.55+R()*.4,i=Math.min(N-1,(k*N)|0),st=lerp3(P[i],P[i+1],k*N-i),a=j/nb*TAU+R()*1.2,L=(.9+R()*.8)*s,up=.35+R()*.5;
      const e1=[st[0]+Math.cos(a)*L*.6,st[1]+L*up*.6,st[2]+Math.sin(a)*L*.6],e2=[e1[0]+Math.cos(a+.3)*L*.55,e1[1]+L*up*.5,e1[2]+Math.sin(a+.3)*L*.55];
      B.geom('cbark',CG.limb,M4d(st,e1,rs[i]*.5),bc,.3,1);B.geom('cbark',CG.limb,M4d(e1,e2,rs[i]*.32),bc,.3,1);ends.push(e2)}
    for(const e of ends){const cn=2+(R()*2|0);for(let c=0;c<cn;c++){const q=(.75+R()*.55)*s;B.geom('cleaf',R()<.75?BG.ico:BG.dode,M4(e[0]+(R()-.5)*q,e[1]+(R()-.2)*q*.6,e[2]+(R()-.5)*q,q,q*.72,q,R()*6,(R()-.5)*.4),mulc(lc,.8+R()*.35),.55)}
      if(R()<.6)for(let c=0;c<2+(R()*3|0);c++){const L=.3+R()*.6;B.geom('cmoss',BG.cone4,M4(e[0]+(R()-.5)*.9*s,e[1]-.3*s-L/2,e[2]+(R()-.5)*.9*s,.045,L,.045,R()*6,Math.PI),mulc(col3('#7a8468'),.8+R()*.3),.2)}}}
  if(R()<.45){const a=R()*TAU;wMush(B,R,x+Math.cos(a)*(r0*1.4+.12),z+Math.sin(a)*(r0*1.4+.12),3+(R()*4|0),true)}}
/* trees deep in the fog get by with less */
function wFarTree(B,R,x,z,s){if(R()<.45)return wTree(B,R,x,z,s,'pine');const y0=wGround(x,z),H=(2.6+R()*1.5)*s,bc=wc(R,BARKC),lc=wc(R,LEAFC);B.geom('cbark',CG.limb,M4d([x,y0-.1,z],[x+(R()-.5)*.6,y0+H,z+(R()-.5)*.6],.26*s),bc,.3,1.4);
  for(let c=0;c<3;c++){const q=(.9+R()*.6)*s;B.geom('cleaf',BG.ico,M4(x+(R()-.5)*1.1*s,y0+H*(.8+R()*.35),z+(R()-.5)*1.1*s,q,q*.75,q,R()*6),mulc(lc,.85+R()*.3),.55)}}
/* a fallen trunk: torn-up roots at one end, a splintered break at the other, moss and shelf fungus along it */
function wLog(B,R,x,z,a,L,r){const ca=Math.cos(a),sa=Math.sin(a),bc=wc(R,BARKC),gy=(px,pz)=>wGround(px,pz)+r*.75;
  const p0=[x-ca*L/2,0,z-sa*L/2],p2=[x+ca*L/2,0,z+sa*L/2],p1=[x+(R()-.5)*.3,0,z+(R()-.5)*.3];for(const p of[p0,p1,p2])p[1]=gy(p[0],p[2]);
  B.geom('cbark',CG.tr[(R()*3)|0],M4d(p0,p1,r,0),bc,.2,1.5);B.geom('cbark',CG.tr[(R()*3)|0],M4d(p1,p2,r*.85,0),bc,.2,1.5);
  B.geom('cbark',BG.cyl8,M4d([p0[0]+ca*.05,p0[1],p0[2]+sa*.05],[p0[0]-ca*.1,p0[1],p0[2]-sa*.1],r*1.7,0),mulc(bc,.8),.2);
  for(let j=0;j<5;j++){const b=j/5*TAU+R()*.5,d0=Math.cos(b),d1=Math.sin(b);B.geom('cbark',CG.limb,M4d(p0,[p0[0]-ca*.25-sa*d0*r*2.6,p0[1]+d1*r*2.6,p0[2]-sa*.25+ca*d0*r*2.6],r*.25),mulc(bc,.85),.3,1)}
  for(let j=0;j<5;j++){const b=j/5*TAU,o0=Math.cos(b)*r*.5,o1=Math.sin(b)*r*.5,l=.25+R()*.3;B.geom('cbark',BG.cone4,M4d([p2[0]-sa*o0,p2[1]+o1,p2[2]+ca*o0],[p2[0]+ca*l-sa*o0*.8,p2[1]+o1*.8,p2[2]+sa*l+ca*o0*.8],r*.3),bc,.3)}
  for(let j=0;j<4;j++){const pp=lerp3(p0,p2,R());B.geom('cmoss',BG.ico,M4(pp[0],pp[1]+r*.75,pp[2],r*.7,r*.25,r*.7,a),wc(R,MOSSC),.2)}
  for(let j=0;j<3;j++){const pp=lerp3(p0,p2,.2+R()*.6),sd=R()<.5?1:-1;B.geom('plain',BG.hemi,M4(pp[0]-sa*r*sd*.9,pp[1]+(R()-.3)*r*.5,pp[2]+ca*r*sd*.9,.13,.04,.1,-a),wc(R,['#c8a070','#a8784a','#d8c8a0']),.3)}
  wMush(B,R,p1[0]-sa*r*1.3,p1[2]+ca*r*1.3,3,false)}

/* ---------- things people left: fences, signs, a shrine, a bridge, a hut, lanterns ---------- */
function wFence(B,R,pts){const posts=pts.map(([x,z])=>{if(R()<.1)return null;const y=wGround(x,z),h=.8+R()*.25,lx=(R()-.5)*.25,lz=(R()-.5)*.25,c=wc(R,['#5a5046','#4e463c','#665a4a']);B.geom('cwood',BG.box,M4(x+lx*h/2,y+h/2-.05,z+lz*h/2,.1,h,.1,R()*.4,lz,-lx),c,.3);return{x,z,y,h,lx,lz,c}});
  for(let i=0;i<posts.length-1;i++){const a=posts[i],b=posts[i+1];if(!a||!b)continue;for(const hh of[.35,.68]){const r=R();if(r<.22)continue;
    const A=[a.x+a.lx*hh,a.y+hh*a.h,a.z+a.lz*hh],E=r<.36?[cl(a.x,b.x,.85),wGround(cl(a.x,b.x,.85),cl(a.z,b.z,.85))+.04,cl(a.z,b.z,.85)]:[b.x+b.lx*hh,b.y+hh*b.h,b.z+b.lz*hh];B.geom('cwood',BG.box,M4d(A,E,.055,0),mulc(a.c,.9+R()*.2),.2)}}}
const GLOWT=(()=>{const c=mkCanvas(32,32),x=c.getContext('2d'),g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32);return new TH.CanvasTexture(c)})();
function wLantern(par,x,y,z,o){o=o||{};const g=grp(par,x,y,z),fr='#2a2622',col=o.col||0xffa850;
  pc('box',fr,0,.17,0,.17,.03,.17,g);pc('cone4',fr,0,.24,0,.13,.1,.13,g,0,Math.PI/4);pc('box',fr,0,-.01,0,.15,.03,.15,g);pc('tor',fr,0,.33,0,.035,.035,.035,g,Math.PI/2);
  for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])pc('box',fr,a*.065,.08,b*.065,.02,.17,.02,g);
  const core=new TH.Mesh(GEO.box,new TH.MeshBasicMaterial({color:col}));core.scale.set(.09,.12,.09);core.position.y=.08;g.add(core);
  const halo=new TH.Sprite(new TH.SpriteMaterial({map:GLOWT,color:col,transparent:true,opacity:.26,blending:TH.AdditiveBlending,depthWrite:false,fog:false}));halo.scale.setScalar(o.halo||.95);halo.position.y=.08;g.add(halo);
  const l=new TH.PointLight(col,o.i||.95,o.d||6.5,1.6);l.position.y=.08;g.add(l);CINE.lamps.push({l,halo,i:o.i||.95,ph:x*7.3+z});return g}
/* carved letters on old planks: the game's own 3x5 font, word by word */
function carve(x,s,a,b,col){let cx=a;for(const ch of s){if(ch!==' ')txt(x,ch,cx,b,col);cx+=4}}
function plankTex(key,w,h,lines,claw){return pxt(key,w,h,(p,oval,sym,W,Hh,x)=>{const R=rngOf(hashN(key.length*13,w,h));p('#7a6450',0,0,w,h);for(let j=2;j<h;j+=3)p('#6a5442',0,j,w,1);for(let n=0;n<w*h/5;n++)p(R()<.5?'#5e4a3a':'#8a7460',R()*w|0,R()*h|0,1,1);for(let n=0;n<w*h/30;n++)p('#4e5a2e',R()*w|0,R()*h|0,1+(R()*2|0),1);
  for(const[s,col,yy]of lines)carve(x,s,Math.floor((w-(s.length*4-1))/2),yy,col);if(claw)for(let k=0;k<3;k++)for(let i=0;i<h-2;i++)p('#24180e',(claw+k*2.5+i*.7)|0,1+i,1,1);p('#3a2a1a',0,0,w,1);p('#3a2a1a',0,h-1,w,1)})}
function wSign(par,x,y,z,ry,w,h,tex,rz){const side=new TH.MeshLambertMaterial({color:0x5a4a3a}),m=new TH.Mesh(new TH.BoxGeometry(w,h,.05),[side,side,side,side,new TH.MeshLambertMaterial({map:tex}),side]);m.position.set(x,y,z);m.rotation.set(0,ry,rz||0);par.add(m);return m}
/* a missing-person notice; on the last one somebody has scratched the face out */
function noticeTex(n){return pxt('notice'+n,30,38,(p,oval,sym,W,Hh,x)=>{const R=rngOf(91+n);p('#d8d0b8',0,0,30,38);for(let i=0;i<60;i++)p(R()<.6?'#c8bea4':'#b8ac90',R()*30|0,R()*38|0,1+(R()*2|0),1);for(let i=0;i<4;i++)oval(R()*30,R()*38,2+R()*3,3+R()*4,'rgba(120,100,60,.25)');
  carve(x,'MISSING',2,2,'#3a2418');const skin=['#c8a080','#d8b090','#b88a68','#e8e0d0'][n];oval(15,19,6,7,'#2a1a10');oval(15,19,5,6,skin);
  if(n===3){for(let i=0;i<16;i++)p('#2a1a10',9+((i*5)%12),13+((i*3)%12),2,1)}else{p('#2a1a10',12,18,1,1);p('#2a1a10',17,18,1,1);p('#6a3a2a',13,22,4,1);if(n===0)for(let i=0;i<5;i++)p('#3a2a1a',10+i*2,12-(i%2),1,2);if(n===1){p('#5a3a20',9,14,2,9);p('#5a3a20',19,14,2,9)}if(n===2){p('#d8d8d0',11,23,8,3)}}
  for(let j=29;j<36;j+=2)p('#8a7a6a',4,j,22-(j%4)*3,1)})}
function wShrine(B,R,par,x,z){const y=wGround(x,z),fy=Math.atan2(-.55,-.83),c=Math.cos(fy),sn=Math.sin(fy),Wp=(lx,ly,lz)=>[x+lx*c+lz*sn,y+ly,z-lx*sn+lz*c];
  const bx=(lx,ly,lz,sx,sy,sz,col,k,rx,rz)=>{const p=Wp(lx,ly,lz);B.geom(k||'cwood',BG.box,M4(p[0],p[1],p[2],sx,sy,sz,fy,rx||0,rz||0),col,.3)};
  bx(0,.55,0,.12,1.1,.12,col3('#4e4236'));bx(0,1.2,0,.5,.36,.34,col3('#5a4a3a'));bx(0,1.19,.065,.36,.26,.24,col3('#120e0a'),'plain');
  bx(.13,1.46,0,.34,.04,.5,col3('#4a3c30'),0,0,-.6);bx(-.13,1.46,0,.34,.04,.5,col3('#4a3c30'),0,0,.6);{const p=Wp(0,1.56,0);B.geom('cmoss',BG.ico,M4(p[0],p[1],p[2],.12,.05,.26,fy),wc(R,MOSSC),.2)}
  /* little wooden charms on strings that knock together in the wind, two candle stubs, small offerings in the grass */
  const mm=new TH.MeshLambertMaterial({color:0x8a6a48});
  for(let i=0;i<4;i++){const m=new TH.Mesh(i%2?GEO.box:GEO.octa,mm),p=Wp(-.16+i*.105,1.0-(i%2)*.05,.22);m.scale.set(.04,.06,.02);m.position.set(p[0],p[1],p[2]);m.rotation.order='YXZ';m.rotation.y=fy;par.add(m);CINE.flap.push({m,f:1.3+i*.4,ph:i*1.7,amp:1.8});
    const q=Wp(-.16+i*.105,1.1,.22);B.geom('plain',BG.box,M4(q[0],q[1],q[2],.006,.12,.006),col3('#3a3028'))}
  for(const lx of[-.08,.08]){const p=Wp(lx,1.1,.1);B.geom('plain',BG.cyl6,M4(p[0],p[1],p[2],.025,.06,.025),col3('#e8e0c8'));const f=new TH.Mesh(GEO.octa,new TH.MeshBasicMaterial({color:0xffc070}));f.scale.set(.012,.025,.012);f.position.set(p[0],p[1]+.05,p[2]);par.add(f)}
  const lp=Wp(0,1.2,.3),l=new TH.PointLight(0xffb060,.6,3.6,1.6);l.position.set(lp[0],lp[1],lp[2]);par.add(l);CINE.lamps.push({l,halo:null,i:.6,ph:3});
  for(let i=0;i<4;i++)bx((R()-.5)*.5,.04,.32+R()*.25,.06,.08,.05,col3(['#8a6a48','#a08060','#6a5038'][i%3]))}
function wBoard(B,R,par,x,z){const y=wGround(x,z),fy=Math.atan2(.62,.78),c=Math.cos(fy),sn=Math.sin(fy),Wp=(lx,ly,lz)=>[x+lx*c+lz*sn,y+ly,z-lx*sn+lz*c];
  const bx=(lx,ly,lz,sx,sy,sz,col,rz)=>{const p=Wp(lx,ly,lz);B.geom('cwood',BG.box,M4(p[0],p[1],p[2],sx,sy,sz,fy,0,rz||0),col,.25)};
  for(const lx of[-.55,.55])bx(lx,.75,0,.1,1.5,.1,col3('#4e4236'));bx(0,1.15,0,1.2,.7,.06,col3('#5e5040'));bx(0,1.55,0,1.36,.05,.14,col3('#4a3c30'),.1);
  [[-.32,1.2,-.06,0],[.06,1.28,.04,1],[.36,1.12,.1,2],[-.04,.92,-.08,3]].forEach(([lx,dy,rz,n])=>{const m=new TH.Mesh(new TH.PlaneGeometry(.26,.33),new TH.MeshLambertMaterial({map:noticeTex(n),side:TH.DoubleSide})),p=Wp(lx,dy,.045);
    m.position.set(p[0],p[1],p[2]);m.rotation.order='YXZ';m.rotation.set(0,fy,rz);par.add(m);if(n===1||n===3)CINE.flap.push({m,f:1.7+n*.3,ph:n,amp:1.4})})}
function wBridge(B,R,par){const bx=roadX(CREEK),z0=22.25,z1=26.75,ya=Math.atan2(roadX(z1)-roadX(z0),z1-z0),c=Math.cos(ya),s=Math.sin(ya);
  const Wp=(lx,ly,lz)=>[bx+lx*c+lz*s,ly,CREEK-lx*s+lz*c],bxg=(lx,ly,lz,sx,sy,sz,col,rx,rz)=>{const p=Wp(lx,ly,lz);B.geom('cwood',BG.box,M4(p[0],p[1],p[2],sx,sy,sz,ya,rx||0,rz||0),col,.2)};
  /* the deck: weathered planks, a few mossy, one snapped short */
  for(let lz=-2.2;lz<=2.21;lz+=.34){const mossy=R()<.28,col=mossy?wc(R,['#56643e','#4e5a3a']):wc(R,['#6a6052','#5e5648','#726a5a','#585044']),w=R()<.06?1.6:2.5+(R()-.5)*.2;bxg((2.5-w)*(R()<.5?.5:-.5),-.02+(R()-.5)*.02,lz,w,.07,.3,col,(R()-.5)*.04,(R()-.5)*.03)}
  for(const lx of[-1,1]){bxg(lx,-.13,0,.14,.16,4.8,col3('#4a4036'));for(const lz of[-1.25,1.25])bxg(lx*1.05,-.42,lz,.14,.62,.14,col3('#3e362e'))}
  /* rails: the left one holds, the right one has given way */
  const post=(lx,lz,h)=>{const p=Wp(lx,0,lz);B.geom('cwood',BG.box,M4(p[0],h/2,p[2],.11,h,.11,ya,(R()-.5)*.08,(R()-.5)*.08),col3('#4e463c'),.3);B.geom('cmoss',BG.ico,M4(p[0],h+.02,p[2],.09,.04,.09,0),wc(R,MOSSC),.2);return[p[0],h,p[2]]};
  const L=[post(-1.2,-2.2,1.05),post(-1.2,0,1),post(-1.2,2.2,1.05)],Rr=[post(1.2,-2.2,1.05),post(1.2,0,.7),post(1.2,2.2,1.05)];
  for(let i=0;i<2;i++){B.geom('cwood',BG.box,M4d([L[i][0],.95,L[i][2]],[L[i+1][0],.95,L[i+1][2]],.06,0),col3('#5a5046'),.2);B.geom('cwood',BG.box,M4d([L[i][0],.5,L[i][2]],[L[i+1][0],.5,L[i+1][2]],.05,0),col3('#5a5046'),.2)}
  B.geom('cwood',BG.box,M4d([Rr[2][0],.95,Rr[2][2]],[cl(Rr[2][0],Rr[1][0],.6),.95,cl(Rr[2][2],Rr[1][2],.6)],.06,0),col3('#5a5046'),.2);
  B.geom('cwood',BG.box,M4d([Rr[1][0],.62,Rr[1][2]],[cl(Rr[1][0],Rr[0][0],.7),.08,cl(Rr[1][2],Rr[0][2],.7)],.06,0),col3('#5a5046'),.2);
  /* a fishing rod someone left leaning on the rail, and a bucket on its side down the bank */
  const a=Wp(-1.15,.05,.9),b=Wp(-1.6,1.9,-.2);B.geom('cwood',CG.limb,M4d(a,b,.015),col3('#6a5038'),.2,1);
  const bk=Wp(-2.4,0,2.6);B.geom('cwood',BG.taper,M4(bk[0],wGround(bk[0],bk[2])+.1,bk[2],.13,.24,.13,.4,0,Math.PI/2),col3('#6a5a44'),.3);
  /* lanterns on the far posts and the near left one */
  for(const[p,sd]of[[L[0],-1],[Rr[0],1],[L[2],-1]]){const q=[p[0]+sd*.18*c,p[1]-.02,p[2]-sd*.18*s];B.geom('cwood',BG.box,M4d([p[0],p[1]-.02,p[2]],[q[0],q[1],q[2]],.03,0),col3('#2a2622'),.2);wLantern(par,q[0],q[1]-.38,q[2])}
  /* the creek itself */
  const wt=TEX.creek.clone();wt.needsUpdate=true;wt.repeat.set(18,1);const water=new TH.Mesh(new TH.PlaneGeometry(56,3.1).rotateX(-Math.PI/2),new TH.MeshPhongMaterial({map:wt,color:0x5a6a6e,specular:0x3c464c,shininess:36,transparent:true,opacity:.9,depthWrite:false}));
  water.position.set(0,-.3,CREEK);water.renderOrder=1;par.add(water);CINE.water=wt}
function wHut(B,R,par){const hx0=-8.3,hz0=18.3,hy=Math.PI/2-.3,ch=Math.cos(hy),sh=Math.sin(hy),gy=wGround(hx0,hz0)-.04;
  const Wp=(lx,ly,lz)=>[hx0+lx*ch+lz*sh,gy+ly,hz0-lx*sh+lz*ch],bx=(lx,ly,lz,sx,sy,sz,col,ry,rx,rz,k)=>{const p=Wp(lx,ly,lz);B.geom(k||'cwood',BG.box,M4(p[0],p[1],p[2],sx,sy,sz,hy+(ry||0),rx||0,rz||0),col,.25)};
  const lc=()=>wc(R,['#5a4c3e','#4e4236','#62544a']),log=(a,b,r)=>B.geom('cbark',BG.cyl8,M4d(Wp(...a),Wp(...b),r||.15,0),lc(),.15,1.2),row=i=>.15+i*.29;
  bx(0,.03,0,3.2,.08,2.6,col3('#2a221c'));
  for(let i=0;i<6;i++){log([-1.75,row(i),-1.3],[1.75,row(i),-1.3]);log([-1.6,row(i),-1.45],[-1.6,row(i),1.45])}
  for(let i=0;i<3;i++)log([1.6,row(i),-1.45],[1.6,row(i),1.45]);log([1.6,row(3),-1.45],[1.6,row(3),-.2]);
  for(let i=0;i<6;i++)if(i!==3)log([-1.75,row(i),1.3],[-.15,row(i),1.3]);log([-1.75,row(3),1.3],[-1.3,row(3),1.3]);
  for(let i=0;i<4;i++)log([.65,row(i),1.3],[1.75,row(i),1.3]);log([-.35,1.47,1.3],[.85,1.47,1.3],.12);
  log([2.3,.12,-1.2],[2.9,.12,1.1]);   // a wall log that rolled off
  /* the roof: the back slope mostly holds, the front has fallen in */
  const back=[0,1,2,4],front=[0,1];for(const i of back)bx(-1.45+i*.72,1.95,-.8,.7,.06,1.85,wc(R,['#4a4036','#544a3e']),0,-.4636);
  for(const i of front)bx(-1.45+i*.72,1.95,.8,.7,.06,1.85,wc(R,['#4a4036','#544a3e']),0,.4636);bx(.0,1.6,.75,.7,.06,1.85,col3('#4a4036'),.2,1.0,.3);
  bx(1.25,.06,1.95,.7,.05,1.6,col3('#4a4036'),.4,0,.08);bx(.6,.2,2.1,.7,.05,1.5,col3('#544a3e'),-.3,.25,.1);log([-1.85,2.35,0],[1.85,2.35,0],.1);
  log([-1.6,1.75,-1.0],[-1.6,1.75,1.0],.13);log([-1.6,2.02,-.6],[-1.6,2.02,.6],.12);log([-1.6,2.24,-.25],[-1.6,2.24,.25],.1);
  for(let i=0;i<6;i++)bx(-1.98+(R()-.5)*.08,.2+i*.3,-.85,.36,.28,.36,mulc(col3('#6a6862'),.8+R()*.3),R()*.2,0,0,'rock');for(let i=0;i<3;i++)bx(-2.5-R()*.6,.1,-.4+R()*.8,.3,.22,.3,col3('#5e5c56'),R()*3,0,0,'rock');
  /* the door hangs off one hinge, a shutter flaps, the lantern by the door is still lit */
  bx(.95,.6,1.62,.78,1.15,.06,col3('#5a4a38'),-.9,0,.18);bx(-1.0,.9,1.42,.5,.4,.04,col3('#54463a'),.3,0,.5);
  const lp=Wp(-.4,1.55,1.5);bx(-.4,1.55,1.42,.04,.04,.25,col3('#2a2622'));wLantern(par,lp[0],lp[1]-.42,lp[2],{i:1.1,d:7});
  /* the yard: barrels, crates, a woodpile, a stump with an axe and a little wooden horse, a cart that lost a wheel */
  const barrel=(lx,lz,side)=>{const p=Wp(lx,side?.2:.3,lz);B.geom('cwood',BG.cyl8,M4(p[0],p[1],p[2],.22,.56,.22,R()*3,side?Math.PI/2:0),col3('#6a5440'),.3);for(const k of[-.18,.18])B.geom('plain',BG.tor,side?M4(p[0],p[1],p[2]+k,.22,.22,.1,R()*3):M4(p[0],p[1]+k,p[2],.23,.23,.1,0,Math.PI/2),col3('#2e2a26'))};
  barrel(1.95,.9);barrel(2.3,.35);barrel(2.5,1.5,true);
  bx(-2.15,.2,1.15,.4,.4,.4,col3('#6a5a44'),.3);bx(-2.1,.53,1.1,.28,.26,.28,col3('#5e4e3c'),-.2);bx(-2.6,.06,1.7,.42,.05,.12,col3('#6a5a44'),.9);bx(-2.4,.05,1.9,.42,.05,.12,col3('#5e4e3c'),.2);
  for(let i=0;i<9;i++){const r2=i%3,h2=(i/3|0),yy=.08+h2*.14,zz=-.2+r2*.15;log([-1.8,yy,zz],[-2.3,yy,zz+.01],.07)}
  const st=Wp(2.9,0,2.4);B.geom('cbark',BG.cyl8,M4(st[0],st[1]+.17,st[2],.25,.35,.25,R()*3),lc(),.2);B.geom('cwood',BG.cyl8,M4(st[0],st[1]+.35,st[2],.24,.02,.24),col3('#9a8466'));
  B.geom('cwood',CG.limb,M4d([st[0]+.05,st[1]+.35,st[2]],[st[0]+.25,st[1]+.75,st[2]+.1],.02),col3('#7a5a3a'),.2,1);B.geom('plain',BG.box,M4(st[0]+.06,st[1]+.38,st[2]+.02,.16,.08,.03,.4),col3('#3a3e44'));
  const toy=(px,py,pz,ry)=>{const T=(dx,dy,dz,sx,sy,sz)=>B.geom('cwood',BG.box,M4(px+dx*Math.cos(ry)+dz*Math.sin(ry),py+dy,pz-dx*Math.sin(ry)+dz*Math.cos(ry),sx,sy,sz,ry),col3('#8a6a48'),.2);T(0,.07,0,.05,.04,.12);T(0,.11,.07,.035,.06,.035);T(0,.13,.1,.03,.03,.05);for(const[a,b]of[[-.018,-.04],[.018,-.04],[-.018,.04],[.018,.04]])T(a,.025,b,.012,.05,.012)};
  toy(st[0]-.08,st[1]+.36,st[2]-.06,.7);
  const cp2=Wp(2.6,0,-1.7);B.geom('cwood',BG.box,M4(cp2[0],gy+.42,cp2[2],1.0,.08,1.5,hy+.6,0,.22),col3('#5e5040'),.25);
  for(const sd of[-1,1])B.geom('cwood',BG.box,M4(cp2[0]+sd*.45*Math.cos(hy+.6),gy+.55,cp2[2]-sd*.45*Math.sin(hy+.6),.05,.22,1.5,hy+.6,0,.22),col3('#54483a'),.25);
  const wh=[cp2[0]+.55*Math.cos(hy+.6),gy+.34,cp2[2]-.55*Math.sin(hy+.6)];B.geom('plain',BG.tor,M4(wh[0],wh[1],wh[2],.32,.32,.25,hy+.6+Math.PI/2),col3('#3e3428'));for(let i=0;i<4;i++)B.geom('cwood',BG.box,M4(wh[0],wh[1],wh[2],.03,.6,.03,hy+.6+Math.PI/2,0,i*Math.PI/4),col3('#5a4a3a'));
  const fw=Wp(3.4,0,-.6);B.geom('plain',BG.tor,M4(fw[0],gy+.05,fw[2],.32,.32,.25,0,Math.PI/2),col3('#3e3428'));
  const bk=Wp(.3,0,1.9);B.geom('cwood',BG.taper,M4(bk[0],gy+.12,bk[2],.13,.24,.13,0,Math.PI),col3('#6a5a44'),.3);
  wFence(B,R,[[-6.1,15.7],[-7.1,14.7],[-8.4,14.3],[-9.7,14.5]])}
/* the whole set */
function woodsSet(){const B=new Bat(),R=rngOf(4242),extra=new TH.Group();CINE.lamps=[];CINE.flap=[];CINE.shafts=[];
  /* the ground: wet grass that turns to mud near the road, and a dark creek bed */
  const g3=col3('#46603a'),g4=col3('#3c5434'),d3=col3('#62503e'),m3=col3('#3a3028');
  const vc=(x,z)=>{const d=Math.abs(x-roadX(z)),ck=Math.abs(z-CREEK),h=hrand(Math.floor(x*3),Math.floor(z*3),3),g=hrand(Math.floor(x*.5),Math.floor(z*.5),9)<.35?g4:g3;
    let c=z>-12.5?lerpC(g,d3,1-cs(cp(d,1.25,2.3))):g;if(ck<1.4)c=lerpC(c,m3,1-cs(cp(ck,.9,1.4)));return mulc(c,.84+.2*h)};
  for(let z=-30;z<WZMAX+4;z++)for(let x=-26;x<26;x++){const on=z>-13&&Math.abs(x+.5-roadX(z+.5))<1.9,ck=Math.abs(z+.5-CREEK)<1.3,Y=wGround;
    B.quad(on||ck?'cdirt':'cgrass',[x,Y(x,z),z],[x,Y(x,z+1),z+1],[x+1,Y(x+1,z+1),z+1],[x+1,Y(x+1,z),z],[vc(x,z),vc(x,z+1),vc(x+1,z+1),vc(x+1,z)],[[x*.5,z*.5],[x*.5,(z+1)*.5],[(x+1)*.5,(z+1)*.5],[(x+1)*.5,z*.5]])}
  for(const[x,z,rx,rz]of PUD)B.geom('cpud',CG.disc,M4(x,wGround(x,z)+.014,z,rx,1,rz,0),mulc(col3('#6a767c'),.85+R()*.2));
  /* the forest, keeping clear of the clearing, the shot positions and the props */
  const SH=SHZ,clear=[[1.9,13.9,1.2],[roadX(36)+1.25,36.3,1.3],[roadX(30.6)+1.2,30.4,1.3],[roadX(29.3)-1.5,29.1,1.1],[3.9,20.3,1.6],[-8.3,18.3,4.4],[roadX(SH)+1.75,SH,1.2],[roadX(21.3)-1.95,21.3,1.2],[roadX(27.9)+1.95,27.9,1],[roadX(44.5)+2.1,44.5,1.2]];
  const blocked=(x,z)=>clear.some(([a,b,r])=>Math.hypot(x-a,z-b)<r+.6);
  for(let z=-30;z<70;z+=1.6)for(const sd of[-1,1])for(let n=0;n<(z>56?3:4);n++){const x=roadX(z)+sd*(3.2+n*3.4+R()*2.4),zz=z+R()*1.4,r1=R(),s=1.05+R()*.55;
    if(zz<-4&&Math.abs(x)<9)continue;if(x>1&&x<9.5&&zz>4&&zz<14)continue;if(x>1&&x<6&&zz>-9&&zz<-3)continue;if(Math.abs(zz-CREEK)<1.25||blocked(x,zz))continue;
    if(n<2)wTree(B,R,x,zz,s,r1<.12?'hollow':r1<.27?'dead':r1<.37?'lean':r1<.5?'pine':'oak');else wFarTree(B,R,x,zz,s)}
  wTree(B,R,2.95,15.9,1.3,'oak');wTree(B,rngOf(99),SEEDT[0],SEEDT[2],1.35,'oak');
  /* fallen trunks, snapped branches, rocks, ferns, mushrooms and leaf litter */
  for(const[x,z,a,L,r]of[[roadX(41)-3.6,41,.5,4.2,.32],[roadX(47.5)+3.6,47.5,-.3,3.6,.28],[roadX(33)-3.9,33.6,1.2,3.4,.3],[roadX(17.2)+4.9,17,.6,4.2,.34],[5.4,2.5,.9,3.8,.3],[roadX(56)-3.2,56,2.6,4,.3],[roadX(62)+3.6,62,.4,3.8,.3]])wLog(B,R,x,z,a,L,r);
  const side=(z,a,b)=>(z>-4?roadX(z):0)+(R()<.5?-1:1)*(a+R()*b),inClear=(x,z)=>x>1&&x<9.5&&z>4&&z<14;
  for(let n=0;n<70;n++){const z=-12+R()*(WZMAX+12),x=side(z,2.1,5);if(blocked(x,z)||inClear(x,z))continue;wRock(B,R,x,z,.5+R()*.8)}
  for(let n=0;n<16;n++){const z=CREEK+(R()<.5?-1:1)*(1.15+R()*.35),x=roadX(CREEK)+(R()-.5)*16;if(Math.abs(x-roadX(z))<1.6)continue;wRock(B,R,x,z,.5+R()*.5)}
  for(let n=0;n<150;n++){const z=-14+R()*(WZMAX+14),x=side(z,1.9,8);if(blocked(x,z)||Math.abs(z-CREEK)<1||inClear(x,z)&&R()<.7)continue;wFern(B,R,x,z,.7+R()*.6)}
  for(let n=0;n<45;n++){const z=-8+R()*(WZMAX+8),x=side(z,1.8,5),a=R()*TAU,L=.5+R()*1.1,y=wGround(x,z)+.03,ex=x+Math.cos(a)*L,ez=z+Math.sin(a)*L;B.geom('cbark',CG.limb,M4d([x,y,z],[ex,wGround(ex,ez)+.03,ez],.035+R()*.03),wc(R,BARKC),.2,1);
    if(R()<.5){const m=R()*L*.6,sx=x+Math.cos(a)*m,sz=z+Math.sin(a)*m;B.geom('cbark',CG.limb,M4d([sx,y,sz],[sx+Math.cos(a+1)*.35,y+.12,sz+Math.sin(a+1)*.35],.02),wc(R,BARKC),.2,1)}}
  for(let n=0;n<26;n++){const z=-8+R()*WZMAX,x=side(z,2,4);if(!inClear(x,z))wMush(B,R,x,z,2+(R()*4|0),R()<.6)}
  for(let n=0;n<340;n++){const z=-10+R()*(WZMAX+10),x=side(z,1.3,3.2),a=R()*TAU,q=.05+R()*.05,y=wGround(x,z)+.012,c=wc(R,['#5a4028','#6a4a2a','#4a3a24','#6a5a30']),P=(b,l)=>[x+Math.cos(a+b)*q*l,y,z+Math.sin(a+b)*q*l];
    B.quad('plain',P(0,1),P(-1.6,.6),P(Math.PI,1),P(Math.PI-1.6,.6),c)}
  for(let n=0;n<70;n++){const z=-10+R()*50,x=(z>-4?roadX(z):0)+(R()-.5)*14;if(Math.abs(x-roadX(z))<1.6)continue;const y=wGround(x,z);B.box('plain',x,y,z,x+.06,y+.12,z+.06,col3(['#d8d4c8','#c8b880','#b89aa0','#a8a0c0'][n%4]),'b')}
  /* what people left behind */
  wBridge(B,R,extra);wHut(B,R,extra);wShrine(B,R,extra,roadX(SH)+1.75,SH);wBoard(B,R,extra,roadX(21.3)-1.95,21.3);
  wFence(B,R,[36.6,38.1,39.5,41,42.4,43.6].map(z=>[roadX(z)+2.25+Math.sin(z)*.1,z]));wFence(B,R,[31.6,33,34.4].map(z=>[roadX(z)-2.35,z]));
  {const x=roadX(27.9)+1.95,y=wGround(x,27.9);B.geom('cwood',BG.box,M4(x,y+.6,27.9,.11,1.2,.11,.3,.06,-.08),col3('#4e4236'),.3);wSign(extra,x-.02,y+.95,27.98,-.25,.62,.17,plankTex('turnback',40,11,[['TURN BACK','#5a1a12',3]]),.12)}
  {const x=roadX(44.5)+2.1,y=wGround(x,44.5);B.geom('cwood',BG.box,M4(x,y+.8,44.5,.12,1.6,.12,.1),col3('#4e4236'),.3);
    wSign(extra,x-.08,y+1.38,44.5,-Math.PI/2+.08,.78,.17,plankTex('westwood',36,9,[['WESTWOOD','#2a1a10',2]]),-.05);wSign(extra,x-.08,y+1.12,44.5,-Math.PI/2-.1,.7,.16,plankTex('hollow',32,9,[['HOLLOW','#2a1a10',2]],8),.12)}
  {const x=roadX(40.2)-1.9,y=wGround(x,40.2);B.geom('cwood',BG.cyl8,M4(x,y+.12,40.2,.18,.22,.18,0,1.2,.3),col3('#6a5432'),.3);wMush(B,R,x+.35,40.4,4,false)}
  {const x=roadX(49)+2.4,y=wGround(x,49);B.geom('plain',BG.tor,M4(x,y+.12,49,.36,.36,.28,.6,.25),col3('#3e3428'))}
  /* pale light shafts, only for the ending when the rain has gone */
  for(let n=0;n<5;n++){const sh=new TH.Mesh(SHAFTG,new TH.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:.07,blending:TH.AdditiveBlending,depthWrite:false,side:TH.DoubleSide,fog:false}));sh.position.set(n%2?-4:4.5,7,22-n*9);sh.rotation.z=.35;sh.scale.set(.9,1,.9);extra.add(sh);CINE.shafts.push(sh)}
  const g=B.build();g.add(extra);return g}

/* ---------- weather: rain streaks, splashes where it lands, rings on the puddles, thunder far off ---------- */
function mkRain(sc){const n=1500,P=new Float32Array(n*6),C=new Float32Array(n*8),g=new TH.BufferGeometry();g.setAttribute('position',new TH.BufferAttribute(P,3).setUsage(TH.DynamicDrawUsage));g.setAttribute('color',new TH.BufferAttribute(C,4));
  const D=new Float32Array(n*4);for(let i=0;i<n;i++){D[i*4]=(Math.random()-.5)*24;D[i*4+1]=Math.random()*11-3;D[i*4+2]=(Math.random()-.5)*24;D[i*4+3]=8+Math.random()*3.5;const a=.2+Math.random()*.4,b=.7+Math.random()*.14;C.set([b,b+.03,b+.07,0,b,b+.03,b+.07,a],i*8)}
  const L=new TH.LineSegments(g,new TH.LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false}));L.frustumCulled=false;L.renderOrder=3;sc.add(L);
  const ns=320,SP=new Float32Array(ns*3),SC=new Float32Array(ns*4),sg=new TH.BufferGeometry();sg.setAttribute('position',new TH.BufferAttribute(SP,3).setUsage(TH.DynamicDrawUsage));sg.setAttribute('color',new TH.BufferAttribute(SC,4).setUsage(TH.DynamicDrawUsage));
  const S=new TH.Points(sg,new TH.PointsMaterial({size:1.5,sizeAttenuation:false,vertexColors:true,transparent:true,depthWrite:false}));S.frustumCulled=false;S.renderOrder=4;sc.add(S);
  const nr=48,seg=10,RP=new Float32Array(nr*seg*6),RC=new Float32Array(nr*seg*8),rg=new TH.BufferGeometry();rg.setAttribute('position',new TH.BufferAttribute(RP,3).setUsage(TH.DynamicDrawUsage));rg.setAttribute('color',new TH.BufferAttribute(RC,4).setUsage(TH.DynamicDrawUsage));
  const Rl=new TH.LineSegments(rg,new TH.LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false}));Rl.frustumCulled=false;Rl.renderOrder=4;sc.add(Rl);
  const spl=[];for(let i=0;i<ns/4;i++)spl.push({age:9,life:.25,x:0,y:0,z:0,d:[0,0,0,0,0,0,0,0,0,0,0,0]});const rip=[];for(let i=0;i<nr;i++)rip.push({age:9,life:.7,x:0,y:0,z:0,r:.16});
  return{n,P,D,g,L,SP,SC,sg,S,spl,si:0,seg,RP,RC,rg,Rl,rip,ri:0,wind:.9,on:true}}
function splash(W,x,y,z,water,big){const s=W.spl[W.si++%W.spl.length],b=big||1;s.age=0;s.life=.2+Math.random()*.12;s.x=x;s.y=y+.01;s.z=z;s.c=water?[.78,.86,.9]:[.62,.6,.56];
  for(let k=0;k<4;k++){const a=Math.random()*TAU,sp=(.25+Math.random()*.35)*b;s.d[k*3]=Math.cos(a)*sp;s.d[k*3+1]=(.8+Math.random()*.9)*b;s.d[k*3+2]=Math.sin(a)*sp}if(water&&Math.random()<.6)ripple(W,x,y,z)}
function ripple(W,x,y,z,r){const q=W.rip[W.ri++%W.rip.length];q.age=0;q.life=.55+Math.random()*.35;q.x=x;q.y=y+.016;q.z=z;q.r=r||.1+Math.random()*.1}
function rainTick(dt){const W=CINE.rain;if(!W||!W.on)return;const c=CINE.cam.position,cx=c.x,cy=c.y,cz=c.z,half=12,P=W.P,D=W.D,rnd2=Math.random;
  for(let i=0;i<W.n;i++){const j=i*4,v=D[j+3];let x=D[j]+W.wind*dt,y=D[j+1]-v*dt,z=D[j+2];
    if(x-cx>half)x-=2*half;else if(x-cx<-half)x+=2*half;if(z-cz>half)z-=2*half;else if(z-cz<-half)z+=2*half;
    if(y<1.4){const near=Math.abs(x-cx)<8&&Math.abs(z-cz)<8;let gy=near?wGround(x,z):cy-7;const ck=Math.abs(z-CREEK)<.95;if(ck)gy=Math.max(gy,-.3);
      if(y<gy||y<cy-7){if(near&&rnd2()<.22)splash(W,x,gy,z,ck||inPud(x,z));y=cy+5+rnd2()*3;x=cx+(rnd2()-.5)*2*half;z=cz+(rnd2()-.5)*2*half}}
    if(y>cy+9)y-=11;D[j]=x;D[j+1]=y;D[j+2]=z;const k=i*6,len=v*.038;P[k]=x-W.wind*.038;P[k+1]=y+len;P[k+2]=z;P[k+3]=x;P[k+4]=y;P[k+5]=z}
  W.g.attributes.position.needsUpdate=true;
  const SP=W.SP,SC=W.SC;W.spl.forEach((s,i)=>{s.age+=dt;const on=s.age<s.life,a=on?(1-s.age/s.life)*.85:0;for(let k=0;k<4;k++){const p=(i*4+k)*3,q=(i*4+k)*4,t=Math.min(s.age,s.life);
    SP[p]=s.x+s.d[k*3]*t;SP[p+1]=s.y+Math.max(0,s.d[k*3+1]*t-5*t*t);SP[p+2]=s.z+s.d[k*3+2]*t;if(s.c){SC[q]=s.c[0];SC[q+1]=s.c[1];SC[q+2]=s.c[2]}SC[q+3]=a}});
  W.sg.attributes.position.needsUpdate=true;W.sg.attributes.color.needsUpdate=true;
  const RP=W.RP,RC=W.RC,sg=W.seg;W.rip.forEach((q,i)=>{q.age+=dt;const on=q.age<q.life,k=on?q.age/q.life:1,r=q.r*Math.sqrt(k)+.01,a=on?(1-k)*.5:0;for(let s=0;s<sg;s++){const a0=s/sg*TAU,a1=(s+1)/sg*TAU,p=(i*sg+s)*6,o=(i*sg+s)*8;
    RP[p]=q.x+Math.cos(a0)*r;RP[p+1]=q.y;RP[p+2]=q.z+Math.sin(a0)*r*.8;RP[p+3]=q.x+Math.cos(a1)*r;RP[p+4]=q.y;RP[p+5]=q.z+Math.sin(a1)*r*.8;RC[o]=RC[o+4]=.8;RC[o+1]=RC[o+5]=.86;RC[o+2]=RC[o+6]=.9;RC[o+3]=RC[o+7]=a}});
  W.rg.attributes.position.needsUpdate=true;W.rg.attributes.color.needsUpdate=true}
/* lightning: a quick double flicker on the sky, then a long low roll some way behind it */
function thunder(pow,flash,delay){if(flash){CINE.flashAt=CINE.t;CINE.flashP=pow}const r=Math.random,d=delay==null?1.2:delay;
  if(pow>.8)SND.noise(.4,{hp:900,vol:.05*pow,at:d,off:r()*.05});
  for(let i=0;i<16;i++)SND.noise(.45,{lp:90+r()*110+pow*60,vol:pow*.11*(1-i/18)*(.55+r()*.45),at:d+i*.16+r()*.07,off:r()*.04})}
const flashLv=()=>{const a=CINE.t-CINE.flashAt;if(a<0||a>.9)return 0;return CINE.flashP*(a<.05?1:a<.1?.2:a<.18?.75:a<.24?.15:.5*Math.max(0,1-(a-.24)/.6))};
/* raindrops on the lens: each one bends and flips the picture behind it, and some slide */
function lensDrop(){const bh=H3*.1;CINE.lens.push({x:14+Math.random()*(W3-28),y:bh+8+Math.random()*(H3-bh*2-24),r:4+Math.random()*4.5,age:0,life:2.8+Math.random()*2.4,vy:Math.random()<.5?0:3+Math.random()*6,ty:0})}
function drawLens(c){const gl=G3.r&&G3.r.domElement;for(const d of CINE.lens){const a=clamp(Math.min(d.age/.12,(d.life-d.age)/.9),0,1),r=d.r;if(a<=0)continue;
  if(d.ty>1){c.fillStyle=`rgba(200,214,220,${.1*a})`;c.fillRect(Math.round(d.x),Math.round(d.y-d.ty),1,Math.round(d.ty))}
  c.save();c.globalAlpha=a*.9;c.beginPath();c.ellipse(d.x,d.y,r,r*1.12,0,0,TAU);c.clip();if(gl){try{c.translate(d.x,d.y);c.scale(-1,-1);c.drawImage(gl,d.x-r*2.6,d.y-r*2.6,r*5.2,r*5.2,-r*1.15,-r*1.25,r*2.3,r*2.5)}catch(e){}}c.restore();
  c.save();c.globalAlpha=a;c.fillStyle='rgba(190,206,216,.1)';c.beginPath();c.ellipse(d.x,d.y,r,r*1.12,0,0,TAU);c.fill();c.strokeStyle='rgba(6,10,12,.32)';c.lineWidth=1;c.beginPath();c.ellipse(d.x,d.y+.4,r-.3,r*1.1-.3,0,.05*Math.PI,.95*Math.PI);c.stroke();
  c.strokeStyle='rgba(225,236,244,.22)';c.beginPath();c.ellipse(d.x,d.y-.3,r-.6,r*1.1-.6,0,1.15*Math.PI,1.7*Math.PI);c.stroke();c.fillStyle='rgba(245,250,255,.75)';c.fillRect(Math.round(d.x-r*.42),Math.round(d.y-r*.55),2,1);c.fillRect(Math.round(d.x-r*.42),Math.round(d.y-r*.55)+1,1,1);c.restore()}}
function lensTick(dt){for(const d of CINE.lens){d.age+=dt;if(d.age>.5){d.y+=d.vy*dt;d.ty=Math.min(18,d.ty+d.vy*dt)}}CINE.lens=CINE.lens.filter(d=>d.age<d.life)}

/* ---------- the soundscape: rain on leaves, wind in the canopy, far birds, creaking boughs ---------- */
const AMB={on:false,vol:0};
function ambBeds(){if(!SND.bed)return;if(!AMB.hiss)AMB.hiss=SND.bed({type:'highpass',f:3200,q:.4});if(!AMB.roar)AMB.roar=SND.bed({type:'lowpass',f:900,q:.3});if(!AMB.wind)AMB.wind=SND.bed({type:'bandpass',f:420,q:.7})}
function ambStart(){ambStop();AMB.on=true;AMB.u=0;AMB.nx={bird:5+Math.random()*4,creak:8+Math.random()*4};ambBeds()}
function ambStop(){for(const k of['hiss','roar','wind'])if(AMB[k]){AMB[k].stop();AMB[k]=null}AMB.on=false;AMB.vol=0}
function bird(v){const r=Math.random,k=r();if(k<.4){SND.tone(430,.3,{type:'sine',vol:.011*v});SND.tone(385,.45,{type:'sine',vol:.011*v,at:.38})}
  else if(k<.75){const n=4+(r()*4|0);for(let i=0;i<n;i++)SND.tone(3300-i*90,.05,{type:'sine',vol:.006*v,at:i*.075,to:2700-i*80})}
  else for(let i=0;i<2;i++)SND.tone(560,.2,{type:'triangle',vol:.008*v,to:420,at:i*.3})}
function creak(v){const r=Math.random;let t=0;const n=18+(r()*14|0);for(let i=0;i<n;i++){t+=.012+i*.0016+r()*.006;SND.noise(.009,{lp:800+r()*500,vol:.028*v,at:t,off:r()*.45})}SND.tone(68,t+.2,{type:'sawtooth',vol:.004*v,to:58})}
function chime(){const r=Math.random;for(let i=0;i<4;i++)SND.tone([2093,2637,3136,2349][(i+(r()*4|0))%4],.9,{type:'sine',vol:.011,at:i*.13+r()*.08});SND.noise(.03,{hp:2500,vol:.01,off:r()*.4,at:.05})}
/* a hoof coming down: a deep thud and a wet slap in mud, a hollow clonk on boards */
function stompSnd(k,wood){const r=Math.random;if(k<=0)return;if(wood){SND.tone(175+r()*40,.11,{type:'triangle',vol:.11*k,to:100});SND.tone(92,.1,{type:'sine',vol:.08*k,to:55});SND.noise(.06,{hp:1000,vol:.05*k,off:r()*.4})}
  else{SND.tone(96,.13,{type:'sine',vol:.14*k,to:40});SND.noise(.12,{lp:520+r()*220,vol:.11*k,off:r()*.4});SND.noise(.025,{hp:1800,vol:.035*k,off:r()*.4})}}
/* voices, synthesised on the spot (Part 6v): the seedlings titter high and fast, Wick giggles like the kid he is */
const voiceOut=(mk,vol,at)=>SND.pcm&&SND.pcm(()=>vsynth(mk(),VSR),VSR,{vol,at});
function giggle(n){voiceOut(()=>giggleSyl({f0:960+n*90,rate:12.5+n,sc:1.3,n:5+(Math.random()*2|0),dur:.034}),.15)}
function kidGiggle(v){voiceOut(()=>giggleSyl({n:6+(Math.random()*2|0)}),.32*(v||1))}
function kidSay(k,v,at){voiceOut(KIDV[k],.3*(v||1),at)}
const pawAt=(t,list)=>{for(const a of list)if(t>=a&&t<a+.55)return(t-a)/.55;return 0};
function snort(p){const r=Math.random;SND.noise(.22,{lp:1500,vol:.05*p,off:r()*.2});SND.noise(.16,{lp:1100,vol:.04*p,off:r()*.3,at:.2})}
function ambTick(dt,t){if(!AMB.on)return;ambBeds();const v=AMB.vol,r=Math.random;
  if((AMB.u-=dt)<=0){AMB.u=.12;if(AMB.hiss)AMB.hiss.set(.034*v);if(AMB.roar)AMB.roar.set(.05*v);if(AMB.wind)AMB.wind.set((.024+.018*Math.sin(t*.29)+.01*Math.sin(t*.77+1))*v,300+140*Math.sin(t*.21)+60*Math.sin(t*.53))}
  if(v<.01)return;let n=Math.floor(dt*34+r());while(n-->0)SND.noise(.01+r()*.025,{hp:2200+r()*5000,vol:(.003+r()*.011)*v,off:r()*.45});
  if(r()<dt*3)SND.tone(1500+r()*2200,.035,{type:'sine',vol:.005*v,to:800+r()*500});
  if((AMB.nx.bird-=dt)<=0){AMB.nx.bird=7+r()*9;bird(v)}if((AMB.nx.creak-=dt)<=0){AMB.nx.creak=8+r()*9;creak(v)}}

/* ---------- the horse: chestnut with a white blaze, jointed legs, a real four-beat walk ---------- */
const HORSEG={girth:new TH.TorusGeometry(1,.055,5,26),iron:new TH.TorusGeometry(1,.16,5,12),ball:new TH.SphereGeometry(1,12,9),neck:new TH.CapsuleGeometry(.12,.34,4,10),up:new TH.CapsuleGeometry(.076,.23,3,8),upH:new TH.CapsuleGeometry(.096,.2,3,8),lo:new TH.CapsuleGeometry(.046,.24,3,8),tail:new TH.CapsuleGeometry(.05,.45,3,8),hoof:new TH.CylinderGeometry(.052,.064,.08,10)};
/* a piece of tack shaped to the horse's barrel (an ellipsoid R wide and Lz long): angles u0..u1 round from the top, z0..z1 along it, lifted off the coat by off */
function drapeGeo(R,Lz,u0,u1,z0,z1,off,nu,nv){const RX=R*.845;const pos=[],uv=[],idx=[];
  for(let j=0;j<=nv;j++){const z=z0+(z1-z0)*j/nv,r=R*Math.sqrt(Math.max(0,1-(z/Lz)**2))+off;for(let i=0;i<=nu;i++){const a=u0+(u1-u0)*i/nu;pos.push(Math.sin(a)*(r-off)*.845+Math.sin(a)*off,Math.cos(a)*r,z);uv.push(i/nu,j/nv)}}
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;idx.push(a,c,b,b,c,d)}
  const g=new TH.BufferGeometry();g.setAttribute('position',new TH.Float32BufferAttribute(pos,3));g.setAttribute('uv',new TH.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g}
function mkHorse(){const g=new TH.Group(),u={};g.userData=u;const C='#7a4a2c',D='#261a0e',W='#d8d0c0',HG2=HORSEG,B=(geo,c,x,y,z,sx,sy,sz,par,rx)=>{const m=new TH.Mesh(geo,mat(c));m.position.set(x,y,z);m.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);if(rx)m.rotation.x=rx;par.add(m);return m};
  u.b=grp(g,0,1.02,0);B(HG2.ball,C,0,0,0,.245,.29,.62,u.b);B(HG2.ball,C,0,.02,.42,.235,.29,.3,u.b);B(HG2.ball,C,0,.01,-.44,.25,.3,.3,u.b);B(HG2.ball,C,0,-.04,.52,.19,.24,.2,u.b);
  /* the tack, shaped to the barrel: a red blanket with a pale trim, a leather saddle with a raised pommel and cantle, the girth,
     stirrup leathers and irons hung where a rider's feet reach, and reins from the bit (posed each frame by reinsTo) */
  const tm=c=>new TH.MeshLambertMaterial({color:c,side:TH.DoubleSide}),D2=(geo,c)=>{const m=new TH.Mesh(geo,tm(c));u.b.add(m);return m};
  D2(drapeGeo(.29,.62,-1.25,1.25,-.29,.25,.007,14,6),'#6a1e1e');for(const sd of[-1,1])D2(drapeGeo(.29,.62,sd>0?1.15:-1.27,sd>0?1.27:-1.15,-.3,.26,.011,2,6),'#b89a5a');
  D2(drapeGeo(.29,.62,-1.0,1.0,-.2,.17,.017,12,5),'#4a2a16');
  B(HG2.ball,'#3a2010',0,.312,-.02,.15,.05,.19,u.b);B(HG2.ball,'#4a2a16',0,.338,.15,.06,.05,.05,u.b);B(HG2.ball,'#4a2a16',0,.35,-.19,.12,.055,.045,u.b);
  {const gm=new TH.Mesh(HG2.girth,mat('#3a2416'));gm.position.set(0,0,.1);gm.scale.set(.252,.296,.25);u.b.add(gm)}
  u.stir=[-1,1].map(sd=>{const st=grp(u.b,sd*.3,.07,.06);B(GEO.box,'#3a2416',-sd*.03,.085,0,.012,.15,.03,st).rotation.z=sd*.42;const ir=new TH.Mesh(HG2.iron,mat('#8a8a90'));ir.scale.set(.034,.03,.05);st.add(ir);B(GEO.box,'#8a8a90',0,-.028,0,.06,.008,.035,st);return st});
  u.seat=grp(u.b,0,.37,-.02);u.reins=[0,1,2,3].map(()=>{const m=new TH.Mesh(GEO.box,mat('#2a1a10'));m.scale.set(.012,.005,.1);g.add(m);return m});
  u.neck=grp(u.b,0,.15,.55);u.neck.rotation.order='YXZ';u.neck.rotation.x=.82;B(HG2.neck,C,0,.26,0,1.15,1,1.3,u.neck);for(let n=0;n<6;n++)B(HG2.ball,D,0,.05+n*.092,-.13,.05,.07,.05,u.neck);
  u.head=grp(u.neck,0,.52,0);u.head.rotation.x=-.4;B(HG2.ball,C,0,.04,.12,.145,.155,.24,u.head);B(HG2.ball,C,0,-.01,.35,.11,.105,.14,u.head);B(HG2.ball,W,0,.1,.26,.04,.03,.18,u.head);B(HG2.ball,D,0,.17,.07,.05,.03,.06,u.head);
  u.ears=[B(GEO.cone7,C,-.07,.2,0,.035,.11,.035,u.head),B(GEO.cone7,C,.07,.2,0,.035,.11,.035,u.head)];B(HG2.ball,'#100806',-.12,.08,.14,.022,.03,.03,u.head);B(HG2.ball,'#100806',.12,.08,.14,.022,.03,.03,u.head);
  B(HG2.ball,'#2a1a10',-.05,-.03,.46,.015,.015,.015,u.head);B(HG2.ball,'#2a1a10',.05,-.03,.46,.015,.015,.015,u.head);B(GEO.box,'#3a2416',0,0,.42,.22,.025,.025,u.head);
  u.tail=grp(u.b,0,.12,-.7);u.tail.rotation.x=.45;B(HG2.tail,D,0,-.3,-.03,1,1,1,u.tail);
  u.legs=[];for(const[x,z,hind]of[[-.15,.44,0],[.15,.44,0],[-.15,-.44,1],[.15,-.44,1]]){const l=grp(u.b,x,-.18,z);B(hind?HG2.upH:HG2.up,C,0,-.2,0,1,1,1,l);if(hind)B(HG2.ball,C,0,-.02,-.02,.13,.18,.15,l);else B(HG2.ball,C,0,-.03,.01,.1,.13,.1,l);
    const k=grp(l,0,-.4,0);B(HG2.ball,C,0,0,0,.056,.056,.056,k);B(HG2.lo,C,0,-.16,0,1,1,1,k);B(HG2.ball,W,0,-.29,0,.056,.06,.056,k);B(HG2.hoof,'#2a2018',0,-.37,0,1,1,1,k);l.userData.knee=k;u.legs.push(l)}
  u.lp=[0,0,0,0];shadow(g,.75);return g}
/* walk (w) is a lateral four-beat: left hind, left fore, right hind, right fore. Gallop (g) is the old bounding stride.
   With both at zero it stands, breathing, flicking its ears and swishing its tail. Returns the legs that just landed. */
function horseGait(h,o){const u=h.userData,w=o.w||0,g=o.g||0,t=o.t||0,rear=o.rear||0,wp=o.wph||0,p0=((wp%1)+1)%1,offs=[.25,.75,0,.5],landed=[],idle=1-Math.max(w,g);
  u.legs.forEach((l,n)=>{const hind=n>1,k=l.userData.knee;let hip=hind?-.1:0,kn=hind?.16:0;
    if(w>0){const p=((wp+offs[n])%1+1)%1,A=hind?.3:.34,K=hind?.75:1.05,st=.64;let wh,wk;if(p<st){wh=cl(-A,A,p/st);wk=hind?.16:0}else{const s=(p-st)/(1-st);wh=cl(A,-A*1.08,.5-.5*Math.cos(s*Math.PI));wk=(hind?.16:0)+Math.sin(s*Math.PI)*K}
      hip=cl(hip,wh+(hind?-.1:0),w);kn=cl(kn,wk,w);if(p<u.lp[n]-.5&&w>.3)landed.push(n);u.lp[n]=p}
    if(g>0){const a=o.gph+[0,.6,Math.PI,Math.PI+.6][n];hip=cl(hip,Math.sin(a)*.75,g);kn=cl(kn,Math.max(0,Math.sin(a+1.3))*(hind?.9:1.3),g)}
    if(idle>.5&&n===3)kn+=.22*(idle-.5)*2*(.5+.5*Math.sin(t*.3));   // resting a hind foot
    l.rotation.x=hip;k.rotation.x=kn});
  let by=1.02-w*(.018+.018*Math.cos(p0*TAU*2))+Math.abs(Math.sin(o.gph||0))*.07*g+Math.sin(t*1.6)*.006*idle,bp=w*Math.sin(p0*TAU*2)*.012+Math.sin((o.gph||0)*2)*.03*g,br=w*Math.sin(p0*TAU)*.03,nod=w*Math.sin(p0*TAU*2+.9)*.08+Math.sin((o.gph||0)*2+1)*.08*g;
  u.b.position.set(w*Math.sin(p0*TAU)*.018,by,0);u.b.rotation.set(bp,0,br);
  u.neck.rotation.set(.82+nod+(o.pitch||0)+Math.sin(t*.7)*.02*idle,(o.look||0)*.6,0);u.head.rotation.set(-.4-(o.pitch||0)*.5,(o.look||0)*.5,o.shake||0);
  u.tail.rotation.set(.45+g*.5+Math.sin(t*1.3)*.05,0,Math.sin(t*1.1+Math.sin(t*.37)*2)*.12*(1-g)+w*Math.sin(p0*TAU)*.08);
  u.ears.forEach((e,n)=>{const fl=Math.pow(Math.max(0,Math.sin(t*.9+n*2.1)),14);e.rotation.set((o.ears||0)+fl*.5,0,(n?1:-1)*(fl*.4-(o.ears||0)*.2))});
  if(o.paw>0){const s2=Math.sin(Math.min(1,o.paw)*Math.PI),l=u.legs[1];l.rotation.x=-.55*s2;l.userData.knee.rotation.x=1.25*s2}
  if(rear>0){const q=clamp(rear*2.2,0,1);u.b.rotation.x=cl(u.b.rotation.x,-.75*rear,q);u.b.position.y=cl(u.b.position.y,1.02+.45*rear,q);[-1.3,-1.1,.75,.75].forEach((v,n)=>{u.legs[n].rotation.x=cl(u.legs[n].rotation.x,v*rear,q);u.legs[n].userData.knee.rotation.x=cl(u.legs[n].userData.knee.rotation.x,n<2?1.1*rear:.1,q)});u.neck.rotation.x=cl(u.neck.rotation.x,.4,q)}
  return landed}
function horsePose(h,ph,amt,rear){horseGait(h,{gph:ph,g:amt,rear,t:CINE.t})}
const LEGXZ=[[-.15,.44],[.15,.44],[-.15,-.44],[.15,-.44]];
function hoofStep(H,n){const ry=H.rotation.y,c=Math.cos(ry),s=Math.sin(ry),[lx,lz]=LEGXZ[n],x=H.position.x+lx*c+lz*s,z=H.position.z-lx*s+lz*c,cam=CINE.cam.position,r=Math.random;
  const k=clamp(1.25-Math.hypot(x-cam.x,z-cam.z)/16,.1,1)*(CINE.kind==='end'?.6:AMB.vol),wood=Math.abs(z-CREEK)<2.2&&Math.abs(x-roadX(z))<1.3,pud=!wood&&inPud(x,z);
  stompSnd(k*.8,wood);if(pud)SND.noise(.16,{hp:1400,vol:.05*k,off:r()*.3,at:.02})
  const W=CINE.rain;if(W&&W.on){if(pud){for(let i=0;i<3;i++)splash(W,x+(r()-.5)*.1,wGround(x,z)+.02,z+(r()-.5)*.1,true,1.8);ripple(W,x,wGround(x,z),z,.3)}else if(!wood&&r()<.5)splash(W,x,wGround(x,z),z,false,1.2)}}
/* drives the horse from its ground speed: walk blends into gallop, and both settle into standing */
function horseDrive(H,spd,dt,o){o=o||{};CINE.wph+=dt*spd/1.5;CINE.gal+=dt*spd*1.6;const g=cs(cp(spd,2.4,4.2)),w=(1-g)*cs(cp(spd,.04,.45));
  const landed=horseGait(H,{wph:CINE.wph,w,gph:CINE.gal,g,rear:o.rear||0,paw:o.paw||0,look:o.look||0,pitch:o.pitch||0,shake:o.shake||0,ears:o.ears||0,t:CINE.t});for(const n of landed)hoofStep(H,n);reinsTo(H,null,null);
  if(g>.3){const g0=Math.floor(CINE.gal/Math.PI);if(g0!==CINE.galN){CINE.galN=g0;const cam=CINE.cam.position,d=Math.hypot(H.position.x-cam.x,H.position.z-cam.z);stompSnd(clamp(1.3-d/18,.2,1)*(CINE.kind==='end'?.6:.85),false)}}}
/* ---------- limbs that reach: two-bone IK for legs and arms ----------
   The upper bone (hip, shoulder) turns toward a solved middle joint, and the hinge (knee, elbow) bends so the end reaches the
   target. pole: a world point the joint bends toward. bend +1 for knees (they fold backwards), -1 for elbows. w blends from the pose already set. */
const _iv=[0,1,2,3,4,5,6].map(()=>new TH.Vector3()),_iq=new TH.Quaternion(),_iq2=new TH.Quaternion(),_im=new TH.Matrix4();
function limbIK(top,mid,a,b,target,pole,bend,w){w=w==null?1:w;if(w<=0)return;
  const P=top.getWorldPosition(_iv[0]),d=_iv[1].copy(target).sub(P);let L=d.length();if(L<1e-5)return;d.divideScalar(L);L=clamp(L,Math.abs(a-b)+.002,(a+b)*.998);
  const x=(a*a-b*b+L*L)/(2*L),y=Math.sqrt(Math.max(0,a*a-x*x)),pv=_iv[2].copy(pole).sub(P);pv.addScaledVector(d,-pv.dot(d));if(pv.lengthSq()<1e-9)pv.set(0,0,1).addScaledVector(d,-d.z);pv.normalize();
  const J=_iv[3].copy(P).addScaledVector(d,x).addScaledVector(pv,y),T=_iv[4].copy(J).sub(P).normalize(),S=_iv[5].copy(P).addScaledVector(d,L).sub(J).normalize();
  top.parent.getWorldQuaternion(_iq).invert();T.applyQuaternion(_iq);S.applyQuaternion(_iq);
  const th=Math.acos(clamp(T.dot(S),-1,1)),A=_iv[6];if(bend>0)A.crossVectors(T,S);else A.crossVectors(S,T);if(A.lengthSq()<1e-9)A.set(1,0,0).addScaledVector(T,-T.x);A.normalize();
  const Y=_iv[1].copy(T).negate(),Z=_iv[2].crossVectors(A,Y);_im.makeBasis(A,Y,Z);_iq2.setFromRotationMatrix(_im);
  if(w<1){top.quaternion.slerp(_iq2,w);mid.rotation.x=cl(mid.rotation.x,bend*th,w)}else{top.quaternion.copy(_iq2);mid.rotation.set(bend*th,0,0)}}
const ankleOf=k=>k.userData.ank||(k.userData.ank=k.children.find(c=>c.type==='Group')||k);
function legIK(h,i,F,pole,w){const k=h.knees[i];limbIK(h.legs[i],k,Math.abs(k.position.y),Math.abs(ankleOf(k).position.y),F,pole,1,w)}
function armIK(h,i,F,pole,w){const e=h.elbows[i];limbIK(h.arms[i],e,Math.abs(e.position.y),Math.abs(h.hand[i].position.y),F,pole,-1,w)}
/* the rider sits the saddle: the seat carries him (so he moves with the horse), his feet find the stirrups with the knees
   turned forward and out round the barrel, and his hands hold the reins */
const _rv=new TH.Vector3(),_rf=new TH.Vector3(),_rp=new TH.Vector3();
function seatRoot(h,H){H.updateMatrixWorld(true);const s=H.userData.seat.getWorldPosition(_rv);return[s.x,s.y+.05-(h.hipY||.52),s.z]}
function rideOn(h,H,o){o=o||{};const u=H.userData;place(h,seatRoot(h,H),H.rotation.y);ridePose(h,o.ph||0,(o.lean||.12)+u.b.rotation.x*.6);
  h.body.rotation.z=u.b.rotation.z*.7;h.head.rotation.y=o.look||0;h.head.rotation.x=o.tilt||0;
  if(o.pat>0){h.arms[0].rotation.set(-.55-.3*Math.max(0,Math.sin(o.t*11))*o.pat,0,.2)}
  rideLegs(h,H);reinsTo(H,o.pat>0?h.hand[1]:h.hand[0],h.hand[1])}
function rideLegs(h,H,w,only){const u=H.userData,ry=H.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry),xx=Math.cos(ry),xz=-Math.sin(ry);h.root.updateMatrixWorld(true);
  for(let i=0;i<2;i++){if(only!=null&&only!==i)continue;const sd=i?1:-1,F=u.stir[i].getWorldPosition(_rf);F.y+=.05;const pole=h.legs[i].getWorldPosition(_rp);
    pole.x+=fx*.45+xx*sd*.3;pole.z+=fz*.45+xz*sd*.3;legIK(h,i,F,pole,w)}}
/* reins: bit, over the crest of the neck, to a hand (or resting on the pommel when nobody holds them) */
const _ra=new TH.Vector3(),_rb=new TH.Vector3(),_rc=new TH.Vector3(),_re=new TH.Vector3();
function reinSeg(H,m,A,B){const L=A.distanceTo(B);_rc.addVectors(A,B).multiplyScalar(.5);m.position.copy(H.worldToLocal(_rc));m.lookAt(B);m.scale.set(.012,.005,L)}
function reinsTo(H,hA,hB){const u=H.userData;if(!u.reins)return;H.updateMatrixWorld(true);
  for(let i=0;i<2;i++){const sd=i?1:-1,hand=i?hB:hA,bit=u.head.localToWorld(_ra.set(sd*.085,-.06,.38)).clone(),mid=u.neck.localToWorld(_rb.set(sd*.075,.34,-.17)).clone();
    const end=hand?hand.getWorldPosition(_re).clone():u.b.localToWorld(_re.set(sd*.05,.36,.16)).clone();reinSeg(H,u.reins[i*2],bit,mid);reinSeg(H,u.reins[i*2+1],mid,end)}}

/* the tree: an ancient, twisted giant. Its trunk flares into buttress roots and twists as it rises; a real hole is torn in
   the front for the mouth, rimmed with lumpy bark lips and splintered pale-wood teeth; above it two deep knotholes under
   heavy brows, with embers that kindle inside when it wakes. Bare crooked limbs, a dark crown, moss and shelf fungus. */
function mkMaw(){const g=new TH.Group(),u={};g.userData=u;const R=rngOf(616),F=3.38,MY=1.75;
  const bt=TEX.bark2.clone();bt.needsUpdate=true;bt.repeat.set(3,3);u.barkM=new TH.MeshLambertMaterial({map:bt,color:0x8a6a4a,vertexColors:true});MAT.mawbark=u.barkM;
  u.lm=new TH.MeshLambertMaterial({map:TEX.leaf,vertexColors:true});MAT.mawleaf=u.lm;
  const surf=(x,y)=>{const h=y,r=3.35-1.1*(h/15);return Math.sqrt(Math.max(.1,r*r-x*x))};   // how far forward the face of the trunk is at (x, height)
  /* the trunk */
  const tg=new TH.CylinderGeometry(2.25,3.35,15,20,14),p=tg.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),h=y+7.5,a=Math.atan2(z,x),fr=Math.exp(-Math.pow(angD(a,Math.PI/2)/.8,2))*(h<6.2?1:0);let r=Math.hypot(x,z);
    r*=1+(Math.sin(a*5+h*.5)*.06+Math.sin(a*3-h*.3)*.05+Math.sin(a*11+h*1.3)*.025)*(1-.9*fr);const b=Math.max(0,1-h/3.4);r*=1+b*b*(.32+.3*Math.cos(a*6+.4))*(1-fr);
    const a2=a+Math.max(0,h-6.2)*.07;p.setX(i,Math.cos(a2)*r);p.setZ(i,Math.sin(a2)*r)}
  /* cut the mouth and the two eye sockets out of the front */
  const holes=[[0,MY,1.22,.92],[-1.0,4.25,.33,.27],[1.0,4.25,.33,.27]],tn=tg.toNonIndexed(),P=tn.attributes.position,UV=tn.attributes.uv,kp=[],ku=[];
  for(let t=0;t<P.count;t+=3){let cx=0,cy=0,cz=0;for(let k=0;k<3;k++){cx+=P.getX(t+k)/3;cy+=P.getY(t+k)/3+7.5/3;cz+=P.getZ(t+k)/3}if(cz>0&&holes.some(([hx,hy,rx,ry])=>((cx-hx)/rx)**2+((cy-hy)/ry)**2<1))continue;
    for(let k=0;k<3;k++){kp.push(P.getX(t+k),P.getY(t+k),P.getZ(t+k));ku.push(UV.getX(t+k),UV.getY(t+k))}}
  const tg2=new TH.BufferGeometry();tg2.setAttribute('position',new TH.Float32BufferAttribute(kp,3));tg2.setAttribute('uv',new TH.Float32BufferAttribute(ku,2));tg2.computeVertexNormals();
  {const Q=tg2.attributes.position,c=[];for(let i=0;i<Q.count;i++){const h=Q.getY(i)+7.5,a=Math.atan2(Q.getZ(i),Q.getX(i)),n=vnoise(a*2+5,h*.6),m=Math.max(0,1-h/2.6)*(.5+.5*Math.sin(a*4))*.65;c.push(cl(.6+.24*n,.42,m),cl(.58+.2*n,.56,m),cl(.56+.18*n,.3,m))}tg2.setAttribute('color',new TH.Float32BufferAttribute(c,3))}
  const tr=new TH.Mesh(tg2,u.barkM);tr.position.y=7.5;g.add(tr);
  /* the gullet behind the mouth: dark wet wood narrowing into nothing */
  const gul=new TH.Mesh(new TH.CylinderGeometry(1.2,.45,3.2,14,1,true),new TH.MeshLambertMaterial({map:bt,color:0x2a1810,side:TH.BackSide}));gul.rotation.x=Math.PI/2;gul.scale.set(1,1,.78);gul.position.set(0,MY,F-1.55);g.add(gul);
  u.throat=new TH.Mesh(new TH.CircleGeometry(.5,12),new TH.MeshBasicMaterial({color:0x000000,fog:false}));u.throat.position.set(0,MY,F-3.12);g.add(u.throat);
  const B=new Bat(),bark=()=>mulc(col3('#74583e'),.78+R()*.35);
  /* lips: lumpy bark round the hole, jaws that hinge at the corners, crooked splinters for teeth */
  u.up=grp(g,0,2.75,F-.25);u.lo=grp(g,0,.75,F-.25);
  const lip=(par,top)=>{const L=new Bat(),edge=top?-1.0:1.0,dir=top?-1:1;
    for(let i=0;i<10;i++){const x=-1.35+i*.3,k=x/1.35,cv=(top?.16:-.1)*(1-k*k),zb=-(x*x)/(2*F)+.27;
      L.geom('mawbark',BG.dode,M4(x,edge-dir*(.24+R()*.12)+cv,zb,.27+R()*.08,.25+R()*.1,.27,R()*6,(R()-.5)*.4),bark(),.3);
      L.geom('plain',BG.box,M4(x,edge-dir*.1+cv*.5,zb-.25,.34,.24,.32,0),col3('#1a0c08'));
      const nt=1+(R()<.55?1:0);for(let j=0;j<nt;j++){const len=R()<.2?.12:.2+R()*.28,tx=x+(R()-.5)*.24;
        L.geom('plain',BG.cone4,M4(tx,edge+dir*len*.42-dir*.06+cv*.5,zb-.1+(R()-.5)*.05,.042+R()*.03,len,.038,R()*.6,top?Math.PI+(R()-.5)*.4:(R()-.5)*.4,(R()-.5)*.35),wc(R,['#c8b88e','#b8a47a','#d8caa0','#a89068']),.35)}}
    for(const sd of[-1,1])L.geom('mawbark',BG.dode,M4(sd*1.5,edge-dir*.02,-(1.5*1.5)/(2*F)+.2,.34,.42,.32,R()*6),mulc(col3('#5a4430'),.9),.3);
    if(top){for(let i=0;i<5;i++){const x=-1.1+i*.55;L.geom('cmoss',BG.ico,M4(x,edge+.5,.36-(x*x)/(2*F),.2,.06,.17,R()*6),wc(R,MOSSC),.2)}
      for(let i=0;i<6;i++){const x=-1.2+i*.48,len=.25+R()*.35;L.geom('cmoss',BG.cone4,M4(x,edge+.22-len/2,.42-(x*x)/(2*F),.03,len,.03,R()*6,Math.PI),mulc(col3('#7a8468'),.8+R()*.3),.2)}}
    par.add(L.build())};
  lip(u.up,true);lip(u.lo,false);
  /* the eyes: deep knotholes with a bark rim, embers inside, heavy brows slanting down to the middle */
  u.eyes=[];u.halos=[];
  for(const sd of[-1,1]){const ex=sd*1.0,ey=4.25,ez=surf(ex,ey);
    const cup=new TH.Mesh(new TH.SphereGeometry(.34,10,8,0,TAU,0,Math.PI/2),new TH.MeshLambertMaterial({color:0x0c0705,side:TH.BackSide}));cup.rotation.x=Math.PI/2;cup.scale.set(1,.55,.82);cup.position.set(ex,ey,ez-.02);g.add(cup);
    const e=new TH.Mesh(new TH.SphereGeometry(1,10,8),new TH.MeshBasicMaterial({color:0xffa030}));e.position.set(ex,ey,ez-.12);g.add(e);u.eyes.push(e);
    const hl=new TH.Sprite(new TH.SpriteMaterial({map:GLOWT,color:0xff9030,transparent:true,opacity:0,blending:TH.AdditiveBlending,depthWrite:false,fog:false}));hl.scale.setScalar(.9);hl.position.set(ex,ey,ez+.05);g.add(hl);u.halos.push(hl);
    B.geom('mawbark',BG.tor,M4(ex,ey,ez+.02,.37,.31,.5,0),mulc(col3('#6e5238'),.9),.3);for(let n=0;n<3;n++){const a=sd*.6+n*2.1,rx=ex+Math.cos(a)*.4,ry=ey+Math.sin(a)*.33;B.geom('mawbark',BG.dode,M4(rx,ry,surf(rx,ry)+.06,.14,.11,.12,R()*6),bark(),.3)}
    /* the brow: two heavy ridges slanting down towards the middle of the face */
    for(let n=0;n<2;n++){const bx=ex-sd*(.12+n*.3),by=ey+.44-n*.1;B.geom('mawbark',BG.dode,M4(bx,by,surf(bx,by)+.14,.36-n*.08,.12,.2,0,0,sd*.38),mulc(col3('#7a5e44'),.9+R()*.15),.35)}}
  /* a nose-like burl between the eyes, and gnarled cheeks either side of the mouth */
  B.geom('mawbark',BG.dode,M4(0,3.35,surf(0,3.35)+.12,.32,.48,.26,.3),bark(),.3);
  for(const sd of[-1,1])for(let n=0;n<3;n++){const x=sd*(1.7+n*.12),y=MY+.6-n*.6;B.geom('mawbark',BG.dode,M4(x,y,surf(x,y)+.1,.32,.38,.26,R()*6),bark(),.3)}
  /* roots: huge, arching out of the buttresses and diving into the earth, leaving the way to the mouth open */
  for(let n=0;n<10;n++){const a=n/10*TAU+R()*.3;if(Math.abs(angD(a,Math.PI/2))<.62)continue;const ca=Math.cos(a),sa=Math.sin(a),L=4.6+R()*2.2;
    const p0=[ca*3.0,.75,sa*3.0],p1=[ca*(3.6+L*.3),.55+R()*.2,sa*(3.6+L*.3)],p2=[ca*(3.4+L*.7),.1,sa*(3.4+L*.7)],p3=[ca*(3.4+L),-.3,sa*(3.4+L)];
    B.geom('mawbark',CG.tr[n%3],M4d(p0,p1,.62,0),bark(),.25,2);B.geom('mawbark',CG.tr[(n+1)%3],M4d(p1,p2,.45,0),bark(),.25,2);B.geom('mawbark',CG.limb,M4d(p2,p3,.3,0),bark(),.25,1.5);
    if(R()<.7)B.geom('cmoss',BG.ico,M4(p1[0],p1[1]+.4,p1[2],.5,.14,.5,a),wc(R,MOSSC),.2)}
  /* shelf fungus and moss up the trunk, away from the face */
  for(let n=0;n<14;n++){const a=Math.PI/2+(R()<.5?-1:1)*(.9+R()*2),h=1+R()*9,r=3.35-1.1*(h/15);B.geom('plain',BG.hemi,M4(Math.cos(a)*r,h,Math.sin(a)*r,.35,.08,.25,-a+Math.PI/2),wc(R,['#c8a070','#a8784a','#d8c8a0']),.3)}
  for(let n=0;n<16;n++){const a=R()*TAU,h=R()*6,r=3.35-1.1*(h/15)+.05;if(Math.abs(angD(a,Math.PI/2))<.5&&h<5.5)continue;B.geom('cmoss',BG.ico,M4(Math.cos(a)*r,h,Math.sin(a)*r,.5,.7,.25,-a+Math.PI/2),wc(R,MOSSC),.2)}
  /* bare crooked limbs (they stay when the tree dies) */
  const ends=[];for(let n=0;n<7;n++){const a=n/7*TAU+R()*.5,h=11.5+R()*3,r=2.6-.6*(h-11)/4,a2=a+Math.max(0,h-6.2)*.07,st=[Math.cos(a2)*r*.8,h,Math.sin(a2)*r*.8],L=4+R()*3,up=.5+R()*.5;
    const e1=[st[0]+Math.cos(a2)*L*.55,h+L*up*.5,st[2]+Math.sin(a2)*L*.55],e2=[e1[0]+Math.cos(a2+.4)*L*.5,e1[1]+L*up*.35,e1[2]+Math.sin(a2+.4)*L*.5];
    B.geom('mawbark',CG.tr[n%3],M4d(st,e1,.55,0),bark(),.25,2);B.geom('mawbark',CG.limb,M4d(e1,e2,.32,0),bark(),.25,1.5);ends.push(e1,e2);
    if(R()<.7){const e3=[e1[0]+Math.cos(a2-.9)*L*.35,e1[1]+L*.2,e1[2]+Math.sin(a2-.9)*L*.35];B.geom('mawbark',CG.limb,M4d(e1,e3,.2,0),bark(),.25,1);ends.push(e3)}}
  g.add(B.build());
  /* the crown: dark heavy clumps and hanging moss (gone in the ending) */
  const C=new Bat();for(const e of ends){for(let c=0;c<3;c++){const q=1.6+R()*1.4;C.geom('mawleaf',R()<.6?BG.ico:BG.dode,M4(e[0]+(R()-.5)*q,e[1]+(R()-.3)*q*.6,e[2]+(R()-.5)*q,q,q*.7,q,R()*6),mulc(col3('#8aa07a'),.75+R()*.35),.55)}
    for(let c=0;c<3;c++){const L=.8+R()*1.6;C.geom('cmoss',BG.cone4,M4(e[0]+(R()-.5)*1.6,e[1]-1.2-L/2,e[2]+(R()-.5)*1.6,.07,L,.07,R()*6,Math.PI),mulc(col3('#7a8468'),.8+R()*.3),.2)}}
  for(const[x,y,z,q]of[[0,17,0,5.5],[3,16,1.5,4],[-3.5,16.4,-1,4.2]])C.geom('mawleaf',BG.ico,M4(x,y,z,q,q*.7,q,x),mulc(col3('#8aa07a'),.8),.55);
  u.can=C.build();g.add(u.can);return g}
function mawPose(m,open,eyes){const u=m.userData;u.up.rotation.x=-open*.95;u.lo.rotation.x=open*.55;const k=Math.max(0,eyes);
  u.eyes.forEach((e,i)=>{e.visible=k>.02;e.scale.set(.11+.05*k,.1*k+.01,.06);u.halos[i].visible=k>.02;u.halos[i].material.opacity=.75*k;u.halos[i].scale.setScalar(.5+.6*k)})}

/* ---------- the stage ---------- */
function cineBuild(){if(CINE.sc)return;const sc=new TH.Scene();CINE.sc=sc;CINE.cam=new TH.PerspectiveCamera(52,1,.08,120);
  CINE.hemi=new TH.HemisphereLight(0xdcecff,0x4a5a2a,.85);sc.add(CINE.hemi);CINE.sun=new TH.DirectionalLight(0xfff0d0,.85);CINE.sun.position.set(-5,10,4);sc.add(CINE.sun);sc.fog=new TH.Fog(0xb8d0b8,16,58);
  const sg=new TH.SphereGeometry(90,14,8);sg.setAttribute('color',new TH.Float32BufferAttribute(new Float32Array(sg.attributes.position.count*3),3));CINE.sky=new TH.Mesh(sg,new TH.MeshBasicMaterial({vertexColors:true,side:TH.BackSide,fog:false,depthWrite:false}));sc.add(CINE.sky);
  sc.add(woodsSet());CINE.rain=mkRain(sc);const A=CINE.A;
  A.maw=mkMaw();A.maw.position.set(0,0,-16);sc.add(A.maw);
  A.horse=mkHorse();sc.add(A.horse);
  A.hero=mkHero();shadow(A.hero.root,.3);sc.add(A.hero.root);
  A.kid=mkNpc('imp',{});shadow(A.kid.root,.25);sc.add(A.kid.root);
  A.roots=[0,1,2,3].map(()=>mkRoot(sc));A.seeds=[mkSeedling(),mkSeedling()];A.seeds.forEach(s=>{shadow(s,.16);sc.add(s)});
  /* the whirl of leaves Wick flies on, and the shimmer where the horse goes through the tree */
  A.leaves=new TH.Group();A.leaves.visible=false;sc.add(A.leaves);{const lg=new TH.PlaneGeometry(.075,.045),cols=['#6a8a3a','#8aa04a','#a8783a','#5a7a2e'];
    for(let i=0;i<16;i++){const lm=new TH.Mesh(lg,cmat(cols[i%4],null,{side:TH.DoubleSide}));lm.userData={ph:i*1.7,r:.26+(i%5)*.06,h:.1+(i%7)*.13};A.leaves.add(lm)}}
  A.ripple=[0,1].map(()=>{const r=new TH.Mesh(new TH.RingGeometry(.55,.75,28),new TH.MeshBasicMaterial({color:0xc8ffe0,transparent:true,opacity:0,depthTest:false,depthWrite:false,blending:TH.AdditiveBlending,side:TH.DoubleSide,fog:false}));
    r.position.set(0,1.0,-12.3);r.renderOrder=5;r.visible=false;sc.add(r);return r});
  A.folk=['maren','tobin','edda','corvo','ilse','hermit'].map(id=>{const h=mkNpc(id);shadow(h.root,.28);sc.add(h.root);return h});sunShadow(CINE.sun,2048,12);sc.add(CINE.sun.target);shadowAll(sc)}
function cineSky(top,hor){const g=CINE.sky.geometry,p=g.attributes.position.array,c=g.attributes.color.array;for(let i=0;i<p.length/3;i++){const k=Math.pow(clamp(p[i*3+1]/90,0,1),.5),cc=lerpC(hor,top,k);c[i*3]=cc[0];c[i*3+1]=cc[1];c[i*3+2]=cc[2]}g.attributes.color.needsUpdate=true}
function cineStart(kind,done){if(!G3.r)glInit();cineBuild();if(M)closeMenu();dlgEl.hidden=true;const intro=kind==='intro';
  Object.assign(CINE,{kind,t:0,done,len:intro?INTRO_LEN:13.2,fade:1,gal:0,galN:0,wph:0,flashAt:-99,lens:[],lastCam:null,lid:0,vig:0,white:0});CINE.cues.clear();state='cine';SND.stop();
  const A=CINE.A,end=!intro,u=A.maw.userData,fog=CINE.sc.fog,W=CINE.rain;u.can.visible=!end;A.horse.visible=true;A.leaves.visible=false;A.ripple.forEach(r=>r.visible=false);A.maw.position.x=0;u.barkM.color.setHex(end?0x8a8682:0x6e5a48);u.lm.color.setHex(0x3a5c3a);A.folk.forEach(f=>f.root.visible=end);
  W.on=intro;[W.L,W.S,W.Rl].forEach(o=>o.visible=intro);CINE.shafts.forEach(s=>s.visible=end);
  if(end){cineSky(col3('#5a7ab8'),col3('#f0c494'));fog.color.setHex(0xe8cfa8);fog.near=16;fog.far=58;CINE.hemi.color.setHex(0xffe0c0);CINE.hemi.groundColor.setHex(0x4a5a2a);CINE.hemi.intensity=SHADOWS?.58:.72;CINE.sun.color.setHex(0xf0b880);CINE.sun.intensity=SHADOWS?.95:.75;ambStop()}
  else{cineSky(col3('#363f44'),col3('#58645e'));fog.color.setHex(0x58645e);fog.near=3.5;fog.far=34;CINE.hemi.color.setHex(0xa8b4bc);CINE.hemi.groundColor.setHex(0x283022);CINE.hemi.intensity=SHADOWS?.6:.7;CINE.sun.color.setHex(0xb8c8d8);CINE.sun.intensity=SHADOWS?.5:.34;ambStart()}
  CINE.base={hemi:CINE.hemi.intensity,fog:fog.color.clone(),lit:new TH.Color(0xc8d4dc)}}
function cineEnd(){subEl.hidden=true;CINE.subL=null;const d=CINE.done;CINE.done=null;state='black';fade=1;SND.stop();ambStop();if(d)d()}
function cineSkip(){if(CINE.t>.6)cineEnd()}
const cue=(name,t,at,fn)=>{if(t>=at&&!CINE.cues.has(name)){CINE.cues.add(name);fn()}};
function cineTick(dt){CINE.t+=dt;const t=CINE.t,intro=CINE.kind==='intro';if(intro)introAt(t,dt);else endAt(t,dt);
  /* a hard cut wipes the lens */
  const cp0=CINE.cam.position;if(CINE.lastCam&&cp0.distanceTo(CINE.lastCam)>1.2)CINE.lens.length=0;CINE.lastCam=cp0.clone();
  if(intro){rainTick(dt);lensTick(dt);AMB.vol=cs(cp(t,0,3.5))*(1-cp(t,INTRO_LEN-1.4,INTRO_LEN-.3));ambTick(dt,t)}
  const f=flashLv();CINE.hemi.intensity=CINE.base.hemi*(1+f*1.1);CINE.sky.material.color.setScalar(1+f*.8);CINE.sc.fog.color.copy(CINE.base.fog).lerp(CINE.base.lit,f*.45);
  for(const L of CINE.lamps){const k=.84+.1*Math.sin(t*13+L.ph)+.06*Math.sin(t*31+L.ph*3);L.l.intensity=L.i*k;if(L.halo)L.halo.material.opacity=.26*k}
  for(const p of CINE.flap)p.m.rotation.x=(Math.sin(t*p.f+p.ph)*.12+Math.sin(t*p.f*2.7)*.05)*p.amp;
  if(CINE.water)CINE.water.offset.x-=dt*.22;if(CINE.t>=CINE.len)cineEnd()}
function cineRender(){const c=CINE.cam;c.aspect=W3/H3;c.updateProjectionMatrix();CINE.sky.position.copy(c.position);FADE.value=.6;
  if(SHADOWS){const f=_cfw.set(0,0,-1).applyQuaternion(c.quaternion);aimSun(CINE.sun,c.position.x+f.x*5,0,c.position.z+f.z*5,12,2048)}present(CINE.sc,c)}
function drawCineHUD(){const c=ctx,W=W3,H=H3;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);if(CINE.lens.length)drawLens(c);
  if(CINE.vig>0){const g=c.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,H*.8);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${CINE.vig})`);c.fillStyle=g;c.fillRect(0,0,W,H)}
  if(CINE.lid>0){const lh=Math.round(H/2*clamp(CINE.lid,0,1));c.fillStyle='#000';c.fillRect(0,0,W,lh);c.fillRect(0,H-lh,W,lh)}
  if(CINE.white>0){c.fillStyle=`rgba(255,255,255,${clamp(CINE.white,0,1)})`;c.fillRect(0,0,W,H)}const bh=Math.round(H*.1);c.fillStyle='#000';c.fillRect(0,0,W,bh);c.fillRect(0,H-bh,W,bh);
  if(CINE.t>1&&CINE.t<CINE.len-1)carve(c,'START SKIPS',W-48,H-bh+Math.round(bh/2)-2,'rgba(255,255,255,.45)');if(CINE.fade>0){c.fillStyle=`rgba(0,0,0,${clamp(CINE.fade,0,1)})`;c.fillRect(0,0,W,H)}}
/* posing people in the scenes */
function humanReset(h){if(h.base){restPose(h);h.root.visible=true;return}h.root.visible=true;h.root.scale.setScalar(1);h.body.rotation.set(0,0,0);h.body.position.y=.42;h.head.rotation.set(0,0,0);for(const l of h.legs)l.rotation.set(0,0,0);for(const a of h.arms)a.rotation.set(0,0,0)}
function place(h,p,ang){h.root.position.set(p[0],p[1],p[2]);if(ang!=null)h.root.rotation.y=ang}
const lookAng=(from,to)=>Math.atan2(to[0]-from[0],to[2]-from[2]);
function ridePose(h,ph,lean){h.legs[0].rotation.set(-1.25,0,.45);h.legs[1].rotation.set(-1.25,0,-.45);if(h.knees)h.knees.forEach(k=>k.rotation.x=1.25);h.arms[0].rotation.x=-.95;h.arms[1].rotation.x=-.95;h.body.rotation.x=lean||.12;h.body.position.y=.42+Math.abs(Math.sin(ph))*.05}
function heroGear(h,drawn){h.sword.visible=drawn;h.back.visible=true;h.backHilt.visible=!drawn;h.shield.visible=true;h.hook.visible=false;h.trail.visible=false;h.held.visible=false;h.tail.rotation.x=.4+Math.sin(T*8)*.2;h.cape.rotation.x=.25}

/* ---------- the opening, part one: the ride ----------
   Long, slow shots. Rain and fog do the talking: a puddle shivering by the road, a horse coming out of the mist,
   a sign that says WESTWOOD and another with its name clawed off, a roadside shrine where the horse won't
   go on until the thunder moves it, a notice board of missing people, a mossy bridge, a hut with its lamp still lit. */
function rideCam(t,H){const u=H.userData,hp=H.position,hz=hp.z,hx=hp.x,db=u.b.position.y-1.02,ry=H.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry);let pos,look,roll=0;
  if(t<6.5){const q=cs(cp(t,1.4,6.3));pos=[roadX(36)+1.25,cl(.42,1.3,cs(cp(t,.5,6.5))),36.3-t*.06];look=lerp3([roadX(37.7)+.35,.04,37.7],[hx,1.15,hz],q)}
  else if(t<12.5){pos=[hx-3.55,1.2+db*.55,hz+.45-(t-6.5)*.04];look=[hx+.15,1.42+db*.3,hz-.35];roll=u.b.rotation.z*.4}
  else if(t<18){const q=cs(cp(t,12.5,18));pos=[roadX(30.6)+1.2,cl(.85,1.0,q),cl(30.1,30.6,q)];look=[cl(hx-.1,SHX,.42),1.22,cl(hz-.7,SHZ,.42)]}
  else if(t<22.5){pos=[roadX(29.3)-1.5,.3,29.1];look=[cl(pos[0],hx,.75),.32,hz-.2]}
  else if(t<28){const rx=-fz,rz=fx;pos=[hx-fx*2.25+rx*.5,2.2+db*.85,hz-fz*2.25+rz*.5];look=[hx+fx*6,1.45,hz+fz*6];roll=u.b.rotation.z*.6}
  else{const q=cs(cp(t,28,34));pos=[cl(4.2,3.6,q),cl(1.65,1.45,q),cl(21.3,19.3,q)];look=[cl(hx,-8.3,.22),1.2,hz-.3]}
  return{pos:[pos[0]+Math.sin(t*.53)*.025+Math.sin(t*1.31)*.01,pos[1]+Math.sin(t*.71)*.018,pos[2]+Math.sin(t*.43)*.02],look,roll}}
function rideAt(t,dt){subTick(t-RIDE_T,dt);const A=CINE.A,H=A.horse,h=A.hero;CINE.fade=1-cs(cp(t,0,3.2));
  const hz=rideZ(t),hx=roadX(hz),hz2=rideZ(t+.05),hx2=roadX(hz2),spd=Math.hypot(hx2-hx,hz2-hz)/.05;
  H.position.set(hx,0,hz);if(spd>.05)H.rotation.y=Math.atan2(hx2-hx,hz2-hz);
  horseDrive(H,spd,dt,{look:-.35*hump(t,8.6,10.8)-.6*hump(t,13,16.1)+.4*hump(t,28.6,31.8),pitch:.14*hump(t,4.2,6)-.14*hump(t,12.8,16.4)-.42*blip(t,16,16.8)-.12*cp(t,31.4,34),
    shake:Math.sin(t*26)*(.3*blip(t,16.05,16.8)+.16*blip(t,21,21.5)),paw:pawAt(t,[15.1]),ears:.42*(hump(t,12.5,17.2)+cp(t,31.2,34))-.12});
  humanReset(h);heroGear(h,false);rideOn(h,H,{t,look:-.5*hump(t,8.4,11)-.7*hump(t,13.2,16.3)+.8*hump(t,28.8,32)+.12*Math.sin(t*.37)*(1-hump(t,8,33)),tilt:-.28*hump(t,2.2,4.8)+.15*hump(t,31.5,34.5),pat:blip(t,16.4,17.5)});
  A.kid.root.visible=false;A.seeds.forEach(s=>s.visible=false);mawPose(A.maw,0,0);
  cue('th1',t,3.2,()=>thunder(.45,false,0));cue('th2',t,14.9,()=>thunder(.4,true,1.1));cue('th3',t,25.3,()=>thunder(.6,true,1.5));
  cue('breath',t,8,()=>snort(.4));cue('snort',t,14.3,()=>snort(1));cue('chime',t,13.9,chime);cue('chime2',t,16.3,chime);cue('paw0',t,15.57,()=>stompSnd(AMB.vol*.9,false));cue('breath2',t,24,()=>snort(.35));
  [4.2,9.6,19.3,20.4,24.9,30.4].forEach((at,i)=>cue('lens'+i,t,at,lensDrop));
  const C=rideCam(t,H),c=CINE.cam;c.position.set(C.pos[0],C.pos[1],C.pos[2]);c.up.set(0,1,0);c.lookAt(C.look[0],C.look[1],C.look[2]);if(C.roll)c.rotateZ(C.roll)}

/* ---------- the opening, part two: the ambush ----------
   Something flits through the trees ahead. Then Wick comes flying up from behind on a whirl of leaves and kicks you
   clean off the horse. You come round on the ground to see him going over the horse as if he has never seen one:
   poking its nose, knocking on its legs, peering at its hooves, scratching his head. He sees you getting up, jumps into
   the saddle and is off. You run after him; he rides straight at the great tree, and through it, as if it were mist.
   You stop, lost. Then it opens its eyes, and while you stare at it a root comes up out of the ground behind you,
   takes you round the middle and puts you in its mouth. a = seconds since the ride ended; u = seconds since it woke. */
const HK2=[[0,0,0,14],[2.9,0,0,11.9],[3.5,0,0,11.35],[4.3,0,0,11.15],[12.55,0,0,11.15],[13.35,0,0,10.1],[16.35,0,0,-5.6],[17.25,0,0,-10.6],[18.3,0,0,-16.4]];
const LAND=[-1.05,0,9.75],HSTOP=[0,0,-8.9],ROOTO=[1.15,-.02,-6.25];
/* where Wick is, stretch by stretch: [time, x, y, z] */
const WK={dart:[[.55,-4.6,2.7,4.6],[1.35,4.8,2.2,3.4]],swoop:[[2.3,.6,.25,17.8],[2.7,.35,1.0,14.4],[2.92,.1,1.05,12.55]],
  rebound:[[2.92,.1,1.05,12.55],[3.2,.4,1.9,13.2],[3.45,.6,2.0,13.5],[4.2,1.2,1.2,11.0],[4.75,.95,0,10.35]],
  look:[[4.9,.95,0,10.35],[5.6,.75,0,9.85],[6.3,.38,0,9.5]],around:[[7.35,.8,0,8.95],[8.1,.66,0,10.42]],side:[[9.95,.66,0,10.42],[10.6,.66,0,11.35]]};
/* a painted face by number (for Wick: 0 plain, 3 happy, 4 surprised; for you: 0 open, 1 eyes shut) */
const paintFace=(h,i)=>{const f=h.fx;if(f&&f.imp){const m=f.imp[i]||f.imp[0];if(f.headMesh.material!==m)f.headMesh.material=m;return}if(f&&f.headMesh&&f.faces&&f.faces[i]&&f.headMesh.material.map!==f.faces[i])f.headMesh.material=cmat('#ffffff',f.faces[i])};
/* Wick in the air: leaning into it with his arms back, or leaning back with one leg out for the kick */
function kidFly(k,a,kick){k.body.rotation.x=kick?-.45:.5;k.legs.forEach((l,n)=>l.rotation.x=kick?(n?-1.55:-.5):.45+Math.sin(a*9+n*3)*.12);if(k.knees)k.knees.forEach((n,i)=>n.rotation.x=kick?(i?.05:1.4):.5);
  k.arms.forEach((ar,n)=>ar.rotation.set(kick?.4:.9,0,(n?1:-1)*(kick?.9:.35)))}
/* the whirl of leaves that carries him */
function leavesOn(A,k,a,on){const L=A.leaves;L.visible=on;if(!on)return;L.position.copy(k.root.position);
  L.children.forEach(m=>{const u=m.userData,an=a*7.5+u.ph;m.position.set(Math.cos(an)*u.r,u.h+Math.sin(a*5+u.ph)*.06,Math.sin(an)*u.r);m.rotation.set(a*9+u.ph,a*6+u.ph*2,a*4)})}
/* what is said in the opening: Wick's lines in his own voice, typed out at the bottom, and the tree's, in a voice like a cellar */
const SUBS=[[-31.5,-26.3,'narr','The lakes of the Water Kingdom are drying up, and nobody knows why.'],[-25.6,-20.8,'narr','The King has sent one of his knights to find out.'],
  [-14.6,-9.8,'narr','Out here the forests have drunk the water. Every pond is mud.'],[.75,2.25,'imp',"Ooh... somebody's on my path.",'question'],[2.35,2.95,'imp','Peekaboo!','excited'],[3.1,4.05,'imp','Down you go!','happy'],
  [5.25,6.85,'imp','What ARE you? Four legs. Long face. No wings...','question'],[7.0,7.95,'imp','Hey! It breathed on me!','excited'],[8.2,9.4,'imp','Knock knock. Anybody in there?','neutral'],
  [10.5,11.7,'imp','Is it for eating? For riding? ...For breaking?','question'],[11.75,12.42,'imp',"Oh! The sleepy one's awake.",'happy'],[12.45,13.7,'imp','Mine now! Catch me, catch me!','excited'],
  [14.0,15.7,'imp','Come on! The tree wants to meet you!','happy'],[24.0,25.5,'tree','Another one... for the dark.'],[26.3,27.9,'tree','Come... inside.']];
function subTick(a,dt){const L=SUBS.find(q=>a>=q[0]&&a<q[1]);if(!L){if(!subEl.hidden){subEl.hidden=true;CINE.subL=null}return null}
  if(CINE.subL!==L){CINE.subL=L;subEl.className=L[2];subEl.hidden=false;if(L[2]==='imp')voxLine('imp',L[3],L[4]||'neutral',false);else if(L[2]==='tree'){voxEnd();treeSay(L[3])}}
  const n=Math.min(L[3].length,Math.floor((a-L[0])*32));subEl.textContent=L[3].slice(0,n);if(L[2]==='imp')voxType(n,dt);return L}
function treeSay(t){if(!voxOn())return;const n=Math.max(3,Math.round(t.length/7)),syl=[];for(let i=0;i<n;i++)syl.push({t:i*.36,d:.3,f0a:62-i*2,f0b:52-i*2,F:[380+Math.random()*120,760+Math.random()*200,1900],B:[90,140,220],h:.05,asp:.45,jit:.05,oq:.4,vib:3,vd:.04,tail:.08});
  SND.pcm(vsynth(syl,VSR),VSR,{vol:.5})}
function introAt(tn,dtn){if(tn<RIDE_T)return rideAt(tn,dtn);return ambushAt(tn-RIDE_T,dtn,tn)}
function ambushAt(a,dt,tn){const A=CINE.A,H=A.horse,h=A.hero,k=A.kid,m=A.maw,R=A.roots,u=a-21,SL=subTick(a,dt);
  /* black after the kick; then your eyes open and close a few times before they stay open */
  CINE.fade=a<3.65?0:a<4.1?cp(a,3.65,4.1):a<4.9?1:a<5.5?1-cp(a,4.9,5.5):u>8.6?cp(u,8.6,9.4):0;CINE.white=Math.max(0,(CINE.white||0)-dt*2.4);
  CINE.vig=a>4.9&&a<7.6?.85:0;CINE.lid=a>4.9&&a<7.6?clamp(1-cs(cp(a,4.95,5.45))*.55-cs(cp(a,6.0,6.5))*.35-cs(cp(a,7.0,7.4))*.1+.4*hump(a,5.55,5.95,.15)+.25*hump(a,6.6,6.9,.12),0,1):0;
  A.seeds.forEach(s=>s.visible=false);[1,2,3].forEach(i=>R[i].g.visible=false);
  /* the horse: startled by the kick, stands to be looked at, bolts with Wick on it, and goes into the tree */
  const hp=kf(HK2,a),hq=kf(HK2,a+.05),spd=Math.hypot(hq[0]-hp[0],hq[2]-hp[2])/.05;H.visible=a<18.3;H.position.set(hp[0],0,hp[2]);if(spd>.4)H.rotation.y=Math.atan2(hq[0]-hp[0],hq[2]-hp[2]);
  horseDrive(H,spd,dt,{rear:.35*blip(a,2.95,3.7)+.45*blip(a,12.35,12.95),paw:pawAt(a,[9.0]),shake:Math.sin(a*26)*(.4*blip(a,6.92,7.5)+.2*blip(a,3,3.5)),
    look:.45*hump(a,5.2,7.0,.3)-.35*hump(a,8.2,9.6,.3)+.3*hump(a,9.9,11.4,.3),ears:.4*hump(a,1,2.4)-.45*blip(a,6.9,7.8)-.1,pitch:.1*hump(a,5.5,6.9,.3)-.25*blip(a,6.9,7.4)});
  /* you */
  humanReset(h);heroGear(h,u>=2.0&&u<7.2);paintFace(h,a>2.95&&a<10.45?1:0);let hv=true;const hpos=h.root.position;
  if(a<2.92)rideOn(h,H,{t:tn,look:-.75*hump(a,.75,2.2,.25),tilt:.12*hump(a,.75,2.2,.25)});
  else if(a<3.55){const q=cs(cp(a,2.92,3.55)),st=seatRoot(h,H);place(h,[cl(st[0],LAND[0],q),cl(st[1],0,q)+Math.sin(q*Math.PI)*.45,cl(st[2],LAND[2],q)],Math.PI);
    h.body.rotation.x=cl(.2,1.52,q);h.body.position.y=cl(.42,.11,q);h.arms.forEach((ar,n)=>ar.rotation.set(-2.4+Math.sin(a*20+n)*.5,0,0));h.legs.forEach((l,n)=>l.rotation.x=Math.sin(a*18+n*2)*.6)}
  else if(a<10.4){place(h,LAND,Math.PI);h.body.rotation.x=1.52;h.body.position.y=.11;h.arms[0].rotation.set(-2.6,0,.3);h.arms[1].rotation.set(-1.0,0,-.25);h.head.rotation.y=-.5+.12*blip(a,5.5,6.1)}
  else if(a<10.95){const q=cs(cp(a,10.4,10.95));place(h,LAND,Math.PI);h.body.rotation.x=cl(1.52,0,q);h.body.position.y=cl(.11,.18,q);h.legs.forEach((l,n)=>l.rotation.set(cl(0,-1.45,q),0,(n?-.25:.25)*q));h.arms.forEach(ar=>ar.rotation.x=cl(-1.8,-.4,q))}
  else if(a<11.65){place(h,LAND,Math.PI);h.body.position.y=.18;h.legs.forEach((l,n)=>l.rotation.set(-1.45,0,n?-.25:.25));h.arms[0].rotation.x=-.4;
    if(a<11.35){h.arms[1].rotation.set(-2.6,0,-.4+Math.sin(a*14)*.25);h.head.rotation.z=Math.sin(a*6)*.12}else{h.arms[1].rotation.x=-.4;h.head.rotation.y=-1.15*cs(cp(a,11.35,11.6))}}
  else if(a<12.9){const q=cs(cp(a,11.65,12.3)),yaw=Math.PI+angD(lookAng(LAND,[.66,0,11.35]),Math.PI)*q;place(h,LAND,yaw);h.body.position.y=cl(.18,.42,q);h.legs.forEach((l,n)=>l.rotation.set(cl(-1.45,0,q),0,(n?-.25:.25)*(1-q)));
    h.head.rotation.y=-1.15*(1-q);if(a>12.35){h.arms[1].rotation.set(-1.45,0,-.1);h.body.rotation.x=.12}}
  else if(a<18.7){const K=[[12.9,LAND[0],0,LAND[2]],[13.3,-.9,0,9.1],[16.6,-.25,0,-3.6],[18.0,-.05,0,-7.7],[18.7,0,0,-8.9]],p0=kf(K,a),p1=kf(K,a+.05),v=Math.hypot(p1[0]-p0[0],p1[2]-p0[2])/.05,amt=clamp(v/3.8,.25,1);
    place(h,p0,v>.2?lookAng(p0,p1):Math.PI);walkPose(h,tn*(8+5*amt),amt);h.body.rotation.x=.16*amt}
  else if(u<0){place(h,HSTOP,Math.PI);h.body.position.y=.42+Math.sin(a*7)*.012*(1-cp(a,18.7,19.4));
    if(a>19.2&&a<20.1)h.head.rotation.y=.8*Math.sin((a-19.2)/.9*TAU);else if(a>=20.1){h.arms[1].rotation.set(-2.7,0,-.5+Math.sin(a*16)*.2);h.head.rotation.z=.15;h.arms[0].rotation.set(-.3,0,.25)}}
  else if(u<4.6){const back=cs(cp(u,1.2,1.8));place(h,[0,0,cl(HSTOP[2],-8.5,back)],Math.PI);h.head.rotation.x=-.35*cs(cp(u,.4,1.2));if(back>0&&back<1)walkPose(h,-tn*9,.6);
    if(u>1.2&&u<2.0)h.arms.forEach(ar=>ar.rotation.x=-1.0);
    if(u>=2.0){h.arms[1].rotation.set(-1.2,0,-.15);h.arms[0].rotation.set(-1.0,0,.2);h.body.position.y=.4+Math.sin(u*9)*.008}}
  else if(u<4.95){place(h,[0,0,-8.5],Math.PI);h.body.rotation.z=Math.sin(u*30)*.15;h.arms.forEach((ar,n)=>ar.rotation.set(-1.8+Math.sin(u*24+n)*.6,0,0))}
  else if(u<7.2){const K=[[4.95,0,0,-8.5],[5.55,.15,1.0,-7.95],[6.25,0,2.65,-9.3],[6.85,0,2.25,-11.6],[7.2,0,1.55,-12.95]],p0=kf(K,u);place(h,p0,Math.PI+cs(cp(u,4.95,7.2))*1.4);
    h.body.rotation.x=-.8;h.root.scale.setScalar(1-.25*cp(u,6.85,7.2));h.arms.forEach((ar,n)=>ar.rotation.set(-2.6+Math.sin(u*16+n)*.45,0,0));h.legs.forEach((l,n)=>l.rotation.x=Math.sin(u*18+n*2)*.6)}
  else hv=false;
  h.root.visible=hv;
  /* Wick */
  humanReset(k);let kv=true,fly=false;paintFace(k,(a>3.0&&a<3.45)||(a>11.7&&a<12.4)||(a>12.95&&a<16.5)?3:(a>6.95&&a<7.6)||(a>9.05&&a<9.5)?4:a>4.9&&a<11.7?0:3);
  if(SL&&SL[2]==='imp'&&Math.floor((a-SL[0])*32)<SL[3].length&&Math.floor(a*9)%2)paintFace(k,2);
  if(a<.55)kv=false;
  else if(a<1.35){const p0=kf(WK.dart,a),p1=kf(WK.dart,a+.05);place(k,p0,lookAng(p0,p1));kidFly(k,a,false);fly=true}
  else if(a<2.3)kv=false;
  else if(a<2.92){place(k,kf(WK.swoop,a),Math.PI);kidFly(k,a,a>2.6);fly=true}
  else if(a<4.75){const p0=kf(WK.rebound,a),p1=kf(WK.rebound,a+.05);place(k,p0,a<3.45?Math.PI:lookAng(p0,p1));kidFly(k,a,false);if(a<3.3)k.body.rotation.x=cl(-.45,-.45-TAU,cs(cp(a,2.92,3.3)));fly=true}
  else if(a<4.9){const sp=WK.rebound[4].slice(1);place(k,sp,lookAng(sp,[0,0,10.15]));k.body.position.y=.42-.12*blip(a,4.75,4.9);fly=a<4.8}
  else if(a<6.4){const p0=kf(WK.look,a),p1=kf(WK.look,a+.05);place(k,p0,lookAng(p0,[0,0,10.15]));if(Math.hypot(p1[0]-p0[0],p1[2]-p0[2])>.004)walkPose(k,tn*9,.6);
    k.head.rotation.x=-.5;k.head.rotation.z=.28*Math.sin(a*2.4)}
  else if(a<6.95){const sp=WK.look[2].slice(1),q=cs(cp(a,6.45,6.85));place(k,sp,lookAng(sp,[0,0,10.15]));k.arms[1].rotation.set(cl(-.4,-2.0,q),0,0);k.body.rotation.x=.15*q;k.head.rotation.x=-.45}
  else if(a<7.35){const q=cs(cp(a,6.95,7.35)),s0=WK.look[2].slice(1);place(k,[cl(s0[0],.8,q),Math.sin(q*Math.PI)*.3,cl(s0[2],8.95,q)],lookAng(s0,[0,0,10.15]));k.arms.forEach(ar=>ar.rotation.x=-2.6);k.body.rotation.x=-.3}
  else if(a<8.1){const p0=kf(WK.around,a),p1=kf(WK.around,a+.05);place(k,p0,lookAng(p0,p1));walkPose(k,tn*10,.7);k.head.rotation.x=-.25}
  else if(a<9.05){const sp=WK.around[1].slice(1);place(k,sp,lookAng(sp,[.15,0,10.55]));k.body.position.y=.3;k.legs.forEach(l=>l.rotation.x=-1.1);if(k.knees)k.knees.forEach(n=>n.rotation.x=1.9);k.body.rotation.x=.55;k.head.rotation.x=.2;
    const kn=Math.max(blip(a,8.5,8.65),blip(a,8.75,8.9));k.arms[1].rotation.set(-1.25-kn*.5,0,0);k.arms[0].rotation.x=-.4}
  else if(a<9.95){const sp=WK.around[1].slice(1),q=cs(cp(a,9.5,9.95));place(k,sp,lookAng(sp,[.15,0,10.55]));
    if(a<9.5){k.body.position.y=.18;k.legs.forEach((l,n)=>l.rotation.set(-1.45,0,n?-.25:.25));k.arms.forEach(ar=>ar.rotation.x=.6);k.head.rotation.x=-.3}
    else{k.body.position.y=cl(.18,.42,q);k.legs.forEach((l,n)=>l.rotation.set(cl(-1.45,0,q),0,(n?-.25:.25)*(1-q)))}}
  else if(a<10.6){const p0=kf(WK.side,a),p1=kf(WK.side,a+.05);place(k,p0,lookAng(p0,p1));walkPose(k,tn*8,.5);k.arms[1].rotation.set(-1.5+Math.sin(a*12)*.15,0,0)}
  else if(a<11.65){const sp=WK.side[1].slice(1);place(k,sp,lookAng(sp,[0,1.2,11.3]));k.head.rotation.x=-.6;k.head.rotation.z=.2*Math.sin(a*3);if(a>10.95)k.arms[1].rotation.set(-2.7,0,-.4+Math.sin(a*14)*.2)}
  else if(a<12.0){const sp=WK.side[1].slice(1);place(k,sp,lookAng(sp,LAND));k.head.rotation.x=-.1}
  else if(a<12.35){const q=cp(a,12.0,12.35),sp=WK.side[1].slice(1),st=seatRoot(k,H);place(k,[cl(sp[0],st[0],q),cl(0,st[1],q)+Math.sin(q*Math.PI)*.45,cl(sp[2],st[2],q)],H.rotation.y)}
  else if(a<18.3)rideOn(k,H,{lean:.45,ph:CINE.gal,look:a>14.0&&a<14.9?1.25:0});
  else kv=false;
  k.root.visible=kv;leavesOn(A,k,a,kv&&fly);
  for(const who of[h,k])for(const ch of who.root.children)if(ch.geometry===SHG)ch.visible=who.root.position.y<.08;
  /* the shimmer where the horse goes through the bark */
  A.ripple.forEach((r,i)=>{const q=cp(a,17.2+i*.28,18.2+i*.28);r.visible=q>0&&q<1;if(!r.visible)return;r.scale.setScalar(.3+2.4*q);r.material.opacity=.85*(1-q)});
  /* the tree: asleep, then its eyes open, it shudders, and its mouth opens for you */
  const open=u<0?0:cs(cp(u,5.3,5.9))*(1-cs(cp(u,7.15,7.4)));mawPose(m,open,u<0?0:cs(cp(u,.6,2.4)));
  m.position.x=u<0?0:Math.sin(u*37)*.025*(hump(u,0,2.8,.3)+blip(u,4.5,5.2)+hump(u,5.3,7.3,.3));
  /* the root: up out of the ground behind you, creeping to your heels, then round your middle; it carries you up and over into the mouth */
  if(u>=2.7&&u<4.6)rootPose(R[0],ROOTO,{g:cs(cp(u,2.7,4.4))*.85,E:[hpos.x+.06,.05,hpos.z+.12],arc:.06,wig:.1,t:u,r0:.075,r1:.03});
  else if(u>=4.6&&u<7.5)rootPose(R[0],ROOTO,{g:u<7.2?cl(.85,1,cs(cp(u,4.6,4.85))):1-cp(u,7.2,7.5),wrap:{c:[hpos.x,0,hpos.z],r:.1,y0:hpos.y+.35,y1:hpos.y+.75,turns:1.6},arc:.3,wig:.06,t:u,r0:.085,r1:.035});
  else R[0].g.visible=false;
  /* sound */
  const at=(name,t0,fn)=>cue(name,a,t0,fn);
  at('flit',.7,()=>{kidGiggle(.35);SND.noise(.3,{hp:1200,vol:.03})});at('whoosh',2.42,()=>SND.noise(.42,{hp:700,vol:.07}));
  at('kick',2.92,()=>{stompSnd(1,false);SND.noise(.18,{lp:700,vol:.12});SND.tone(110,.22,{type:'sine',vol:.12,to:45});heroSay('hurt');CINE.white=.35;shake=.4});
  at('whinny',3.0,()=>SND.tone(760,.5,{type:'sawtooth',vol:.04,to:420}));at('cackle',3.08,()=>kidGiggle(1));at('land',3.55,()=>{stompSnd(.9,false);SND.noise(.2,{lp:400,vol:.1})});
  at('ring',3.7,()=>{SND.tone(2300,1.5,{type:'sine',vol:.02});SND.tone(2312,1.5,{type:'sine',vol:.014})});at('dark',4.4,()=>kidGiggle(.3));at('kidland',4.76,()=>stompSnd(.3,false));
  at('huh1',5.3,()=>kidSay('huh',.8));at('poke',6.88,()=>SND.tone(520,.04,{type:'triangle',vol:.03}));at('hsnort',6.94,()=>{snort(1);stompSnd(.6,false)});at('yelp',7.0,()=>kidSay('yelp',.6));
  at('knock1',8.55,()=>SND.tone(180,.06,{type:'square',vol:.04,to:120}));at('knock2',8.8,()=>SND.tone(170,.06,{type:'square',vol:.04,to:115}));at('hpaw',9.05,()=>stompSnd(.9,false));at('bump',9.12,()=>stompSnd(.4,false));
  at('groan',10.45,()=>heroSay('groan',.8));at('huh2',10.8,()=>kidSay('huh'));at('notice',11.75,()=>kidGiggle(1));at('mount',12.35,()=>{stompSnd(.5,false);SND.tone(820,.6,{type:'sawtooth',vol:.05,to:380})});at('hey',12.45,()=>heroSay('shout'));
  at('g1',13.1,()=>kidGiggle(.8));at('g2',14.45,()=>kidGiggle(.7));at('g3',15.9,()=>kidGiggle(.55));
  at('ripple',17.22,()=>{SND.tone(260,.9,{type:'sine',vol:.06,to:1300});SND.noise(.7,{hp:2600,vol:.035})});at('ripple2',17.5,()=>SND.tone(520,.7,{type:'triangle',vol:.03,to:1600}));
  at('lost',19.3,()=>heroSay('huh'));
  at('drone',21,()=>SND.tone(55,4,{type:'sawtooth',vol:.06}));at('bolt',21.02,()=>thunder(1,true,.3));at('tgroan',21.6,()=>SND.tone(48,2.4,{type:'sawtooth',vol:.05,to:38}));at('cr1',22,()=>creak(1));
  at('gasp',22.25,()=>heroSay('huh',.7));at('rumble',23,()=>thunder(.55,false,0));at('draw',23,()=>SND.tone(1600,.12,{vol:.05,type:'square',to:2600}));at('cr2',23.3,()=>creak(.9));
  at('rus1',23.8,()=>SND.noise(.6,{lp:500,vol:.03}));at('cr3',24.2,()=>creak(.5));at('rus2',24.6,()=>SND.noise(.5,{lp:450,vol:.03}));
  at('grab',25.62,()=>{SND.noise(.35,{lp:500,vol:.1});heroSay('hurt');shake=.15});at('scream',26.0,()=>heroSay('fall'));
  at('mouth',26.3,()=>{SND.noise(.5,{lp:300,vol:.08});SND.noise(.5,{lp:260,vol:.07,at:.45});SND.tone(42,2,{type:'sawtooth',vol:.04,to:36})});
  at('chomp',28.25,()=>{SFX.boom();shake=.45});at('after',28.9,()=>creak(.7));
  [1.5,8.6,14.2,24.0].forEach((t0,i)=>at('lensA'+i,t0,lensDrop));
  /* the camera */
  const c=CINE.cam;let pos,look,roll=0;
  if(a<2.3){pos=[hp[0]+1.15,1.95,hp[2]+3.0];look=[hp[0]-.25,1.45,hp[2]-6]}                 /* behind you on the horse */
  else if(a<3.05){pos=[-3.7,1.15,12.9];look=[0,1.35,12.2]}                                  /* from the side: here he comes */
  else if(a<4.1){pos=[-2.6,.55,8.2];look=[-.9,.35,9.9]}                                    /* you hit the ground */
  else if(a<7.6){pos=[-1.32,.3+Math.sin(a*.9)*.02,9.0];look=[.3,.95,10.25];roll=.32-.06*cs(cp(a,4.9,7.6))}   /* through your eyes, lying there */
  else if(a<10.5){pos=[2.25,.75,9.3];look=[.4,.55,10.6]}                                    /* Wick and the hooves */
  else if(a<11.65){pos=[-2.5,.75,8.6];look=[-1.0,.5,9.9]}                                  /* you sit up */
  else if(a<12.9){pos=[-1.75,1.45,9.1];look=[.5,1.25,11.4]}                                 /* over your shoulder as he jumps on */
  else if(a<16.4){pos=[hpos.x-1.0,1.55,hpos.z+2.6];look=[0,1.1,hp[2]]}                      /* the chase */
  else if(a<18.75){pos=[5.4,1.45,-6.2];look=[0,1.25,-11.6]}                                 /* into the tree */
  else if(u<0){pos=[.85,1.32,-10.25];look=[0,1.28,-8.9]}                                       /* your face: where did he go? */
  else if(u<2.6){pos=[-1.3,.95,-6.7];look=[.1,cl(1.9,2.9,cs(cp(u,0,2.4))),-13]}              /* it opens its eyes */
  else if(u<4.6){pos=[1.5,.35,-5.4];look=[0,.3,-7.9]}                                       /* down at the ground behind you */
  else if(u<5.5){pos=[3.0,1.25,-7.6];look=[0,1.0,-8.8]}                                     /* caught */
  else if(u<7.45){pos=[4.8,1.9,-6.4];look=[0,1.8,-10.8]}                                    /* up and over, into the mouth */
  else{const q=cs(cp(u,7.45,9.4));pos=[-1.0,1.15,cl(-6.2,-7.4,q)];look=[0,2.1,-13]}           /* the tree, shut again */
  c.position.set(pos[0]+Math.sin(tn*.53)*.015,pos[1]+Math.sin(tn*.71)*.012,pos[2]);if(shake>0){c.position.x+=(Math.random()-.5)*.2;c.position.y+=(Math.random()-.5)*.15;shake-=dt}
  c.up.set(0,1,0);c.lookAt(look[0],look[1],look[2]);if(roll)c.rotateZ(roll)}

/* ---------- roots: a chain of bark segments laid along a curve that can grow, wriggle and coil round someone ---------- */
function mkRoot(sc){const g=new TH.Group(),m=new TH.MeshLambertMaterial({map:TEX.bark2,color:0x6e5846}),geo=new TH.CylinderGeometry(1,1,1,6,1,true),segs=[];for(let i=0;i<14;i++){const s=new TH.Mesh(geo,m);s.matrixAutoUpdate=false;g.add(s);segs.push(s)}g.visible=false;sc.add(g);return{g,segs}}
/* S: where it comes out. o.g: how much of it has grown (0..1). o.wrap {c centre, r, y0, y1, turns}: the last 40% coils round that spot; otherwise it ends at o.E */
function rootPose(T,S,o){const N=T.segs.length,g=clamp(o.g,0,1),t=o.t||0;T.g.visible=g>.02;if(!T.g.visible)return;const W=o.wrap;
  const a0=t*.6+(o.ph||0),E=W?[W.c[0]+Math.cos(a0)*W.r,W.y0,W.c[2]+Math.sin(a0)*W.r]:o.E,pts=[];
  for(let i=0;i<=N;i++){const u=i/N*g;let p;
    if(W&&u>.6){const w=(u-.6)/.4,a=a0+w*W.turns*TAU;p=[W.c[0]+Math.cos(a)*W.r,cl(W.y0,W.y1,w),W.c[2]+Math.sin(a)*W.r]}
    else{const q=W?u/.6:u;p=lerp3(S,E,q);p[1]+=Math.sin(q*Math.PI)*(o.arc==null?.35:o.arc);const wg=(o.wig==null?.12:o.wig)*Math.sin(q*9+t*7+(o.ph||0))*(1-q);p[0]+=wg;p[2]+=wg*.6}pts.push(p)}
  for(let i=0;i<N;i++){const sg=T.segs[i];sg.matrix.copy(M4d(pts[i],pts[i+1],cl(o.r0||.07,o.r1||.022,i/N),0));sg.matrixWorldNeedsUpdate=true}}

/* ---------- the ending ---------- */
function endAt(t,dt){const A=CINE.A,H=A.horse,h=A.hero,k=A.kid,m=A.maw;
  CINE.fade=t<1?1-t:t>11.6?cp(t,11.6,13):0;cue('music',t,.05,()=>SND.play(SONGS.end));mawPose(m,1,0);m.userData.up.rotation.x=-.9;m.userData.lo.rotation.x=.7;A.seeds.forEach(s=>s.visible=false);
  const out=(t0,to)=>{if(t<t0)return null;const q1=cp(t,t0,t0+.6),q2=cp(t,t0+.6,t0+3.2);if(q1<1)return[[cl(0,0,q1),cl(1.3,0,q1)+Math.sin(q1*Math.PI)*.3,cl(-12.7,-11.3,q1)],0,true];return[[cl(0,to[0],cs(q2)),0,cl(-11.3,to[1],cs(q2))],lookAng([0,0,-11.3],to.length?[to[0],0,to[1]]:[0,0,0]),q2<1]};
  /* you first, then everyone it kept */
  humanReset(h);heroGear(h,false);const ho=out(.4,[-.4,-7.4]);if(!ho)h.root.visible=false;else{place(h,ho[0],t>9.4?cl(ho[1],lookAng(ho[0],[1.3,0,-6.6]),cs(cp(t,9.4,10))):ho[1]);if(ho[2])walkPose(h,t*8,.8)}
  const spots=[[-2.4,-7.4],[2.4,-8.8],[-3.8,-9.6],[3.8,-10],[-1.4,-6.4],[1.2,-10.2]];
  A.folk.forEach((f,n)=>{humanReset(f);const o=out(1.5+n*.85,spots[n]);if(!o){f.root.visible=false;return}place(f,o[0],o[2]?o[1]:o[1]+Math.sin(t*.7+n)*.6);if(o[2])walkPose(f,t*7+n,.7);else f.head.rotation.x=-.35});
  humanReset(k);const ko=out(6.8,[1.7,-6.1]);if(!ko)k.root.visible=false;else{place(k,ko[0],ko[2]?ko[1]:lookAng(ko[0],[0,0,-7.4]));if(ko[2])walkPose(k,t*8,.7);else{k.arms[1].rotation.x=-1.2;k.head.rotation.x=.3}}
  /* the horse comes back on its own */
  const HK2=[[0,14,0,1],[5,14,0,1],[8.6,1.3,0,-6.6],[20,1.3,0,-6.6]],hp=kf(HK2,t),hq=kf(HK2,t+.05),spd=Math.hypot(hq[0]-hp[0],hq[2]-hp[2])/.05;H.position.set(hp[0],0,hp[2]);
  if(spd>.3)H.rotation.y=Math.atan2(hq[0]-hp[0],hq[2]-hp[2]);else H.rotation.y=cl(H.rotation.y,-Math.PI/2-.3,Math.min(1,dt*2));horseDrive(H,spd,dt,{ears:.2,look:t>9.5?.25*Math.sin((t-9.5)*.8):0});cue('neigh',t,8.7,()=>SND.tone(700,.4,{type:'sawtooth',vol:.035,to:480}));
  const c=CINE.cam;let pos,look;if(t<5){const q=cs(cp(t,0,5));pos=[cl(5.5,4.2,q),cl(2.4,1.8,q),cl(-2,-3,q)];look=[0,cl(1.6,1.2,q),cl(-12,-9,q)]}else{const q=cs(cp(t,5,9));pos=[cl(4.2,3.4,q),cl(1.8,1.7,q),cl(-3,-1.6,q)];look=[cl(0,.5,q),cl(1.2,1,q),cl(-9,-7.6,q)]}
  c.position.set(pos[0],pos[1],pos[2]);c.up.set(0,1,0);c.lookAt(look[0],look[1],look[2])}
/* ---------- Part 6: drawing, words on screen, the bag, the map, and the clock that runs it all ---------- */
const DIG=['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001010010010','111101111101111','111101111001111'];
function digits(c,n,x,y,col){const s=String(n);c.fillStyle=col||'#fff';for(let k=0;k<s.length;k++){const p=DIG[+s[k]];if(!p)continue;for(let b=0;b<15;b++)if(p[b]==='1')c.fillRect(x+k*4+b%3,y+(b/3|0),1,1)}}
const HEART=['0110110','1111111','1111111','0111110','0011100','0001000'];
function miniHeart(c,x,y,fill){for(let j=0;j<6;j++)for(let i=0;i<7;i++){if(HEART[j][i]!=='1')continue;const f=fill>=2||(fill===1&&i<4);c.fillStyle=f?'#e8443a':'#3a2a3a';c.fillRect(x+i,y+j,1,1)}c.fillStyle='rgba(255,255,255,.6)';if(fill)c.fillRect(x+1,y+1,1,1)}
/* a 3 x 5 letter font for the little labels on the HUD */
const LET={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111'};
function txt(c,s,x,y,col){c.fillStyle=col||'#fff';for(let k=0;k<s.length;k++){const p=LET[s[k]]||(DIG[+s[k]]);if(!p)continue;for(let b=0;b<15;b++)if(p[b]==='1')c.fillRect(x+k*4+b%3,y+(b/3|0),1,1)}}
const disc=(c,x,y,r,fill,line)=>{c.fillStyle=line||'#000';c.beginPath();c.arc(x,y,r+1,0,TAU);c.fill();c.fillStyle=fill;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()};
/* the HUD sits over the 3D view: hearts, shards, keys, the four buttons, a small map, the boss bar */
function drawHUD(){const c=ctx,v=S.v,W=W3,H=H3;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);
  const lk=lockT&&!lockT.dead&&state==='play';if(lk||G3.barK>0){G3.barK=clamp((G3.barK||0)+(lk?.12:-.12),0,1);const bh=Math.round(H*.07*G3.barK);c.fillStyle='#000';c.fillRect(0,0,W,bh);c.fillRect(0,H-bh,W,bh)}
  if(state==='title'||!room){if(fade>0){c.fillStyle=`rgba(0,0,0,${clamp(fade,0,1)})`;c.fillRect(0,0,W,H)}return}
  const hearts=v.max/2;for(let i=0;i<hearts;i++){const r=i<10?0:1,col=i%10;miniHeart(c,5+col*8,5+r*7,clamp(v.hp-i*2,0,2))}
  const fy=hearts>10?21:14;for(let n=0;n<4;n++)c.drawImage(v.flames[n]?ICON.flame:ICON.flameOff,5+n*9,fy,8,8);
  const inDun=room&&!room.outdoors&&DUN[room.map]&&room.map!=='barrow'&&!['spring','ashhp','craghp','maren','shop','hermit'].includes(room.map);
  if(inDun){c.drawImage(ICON.key,44,fy-1,10,10);digits(c,v.keys[room.map]||0,55,fy+2,'#ffd23f');if(v.big[room.map])c.drawImage(ICON.big,62,fy-1,10,10)}
  c.drawImage(ICON.shard,5,H-15,10,10);c.fillStyle='rgba(0,0,0,.45)';c.fillRect(15,H-13,15,7);digits(c,v.shards,16,H-12,'#c8ffe0');
  /* the buttons, laid out like the console: X top, Y left, A right, B bottom */
  const bx=W-30,by=28,lab=aLabel();
  disc(c,bx,by-14,7,'#e8c83a');disc(c,bx-14,by,7,'#e8c83a');disc(c,bx,by+14,7,'#3aa85a');
  for(const[slot,x,y,L]of[['xb',bx,by-14,'X'],['yb',bx-14,by,'Y']]){const it=v[slot];if(it&&ICON[it]){c.drawImage(ICON[it],x-6,y-6,12,12);const am=it==='sling'?v.ammo.seeds:it==='bombs'?v.ammo.bombs:null;if(am!=null){c.fillStyle='#000';c.fillRect(x+1,y+3,9,6);digits(c,am,x+2,y+4,'#fff')}}else txt(c,L,x-1,y-2,'#5a4a10')}
  if(v.sword)c.drawImage(ICON[v.sword>=2?'edge':'sword'],bx-6,by+8,12,12);else txt(c,'B',bx-1,by+12,'#0a3a1a');
  const aw=Math.max(14,lab.length*4+5);c.fillStyle='#000';c.fillRect(bx+6,by-6,aw+2,12);c.fillStyle='#3a6ae8';c.fillRect(bx+7,by-5,aw,10);txt(c,lab||'A',bx+7+((aw-(lab||'A').length*4+1)/2|0),by-2,'#fff');
  /* a little map of where you are */
  const ms=3,mw=12*ms,mx=W-mw-5,my=H-mw-5;c.fillStyle='rgba(0,0,0,.5)';c.fillRect(mx-1,my-1,mw+2,mw+2);
  for(let j=0;j<12;j++)for(let i=0;i<12;i++){const ch=room.t[j][i];let cc=null;if('#vWGeETNRhHK'.includes(ch))cc='rgba(30,26,40,.85)';else if(ch==='w'||ch==='=')cc=ch==='w'?'#3a6ac8':'#a8784a';else if(ch==='p')cc='#000';else if(ch==='L')cc='#e84a1a';else if('DZYX'.includes(ch))cc=ch==='D'?'#c8b88a':'#e8443a';else if(ch==='S'||ch==='d')cc='#ffd23f';else if(ch==='C')cc='#ffd23f';else cc=room.outdoors?'rgba(120,190,110,.55)':'rgba(150,140,180,.5)';
    c.fillStyle=cc;c.fillRect(mx+i*ms,my+j*ms,ms,ms)}
  const pxm=mx+P.x/16*ms,pym=my+P.y/16*ms;c.fillStyle='#fff';c.beginPath();c.moveTo(pxm+Math.cos(P.ang)*4,pym+Math.sin(P.ang)*4);c.lineTo(pxm+Math.cos(P.ang+2.5)*3,pym+Math.sin(P.ang+2.5)*3);c.lineTo(pxm+Math.cos(P.ang-2.5)*3,pym+Math.sin(P.ang-2.5)*3);c.fill();
  const b=E.find(e=>e.k==='boss');if(b&&b.hpMax){const w=Math.max(0,b.hp/b.hpMax)*80;c.fillStyle='rgba(0,0,0,.6)';c.fillRect(W/2-41,H-12,82,6);c.fillStyle='#e8443a';c.fillRect(W/2-40,H-11,w,4)}
  if(fade>0){c.fillStyle=`rgba(0,0,0,${clamp(fade,0,1)})`;c.fillRect(0,0,W,H)}}
function draw(){if(state==='cine'){cineRender();drawCineHUD();return}render3D();drawHUD()}

/* ---------- words ---------- */
let DLG=null;
/* the speaker of a line is found from its name; their voice plays as the letters come and their face moves with it */
let NPCID=null;const npcIdFor=name=>{if(!NPCID){NPCID={};for(const k in NPCS)NPCID[NPCS[k].name.toUpperCase()]=k}return NPCID[name]||null};
const speakers=id=>E.filter(e=>e.k==='npc'&&e.id===id);
VOX.onSyl=(id,d,who)=>{for(const e of speakers(id)){e.mouthT=Math.min(.2,Math.max(e.mouthT||0,d*.9));e.mouthWho=who|0}};
function dlgSpeakerOff(id){for(const e of speakers(id)){e.talking=false;e.mood=null;e.mouthT=0}}
function dlgVoiceEnd(){voxEnd();if(DLG&&DLG.vid)dlgSpeakerOff(DLG.vid)}
function say(lines,opts){if(!lines||!lines.length)return;dlgVoiceEnd();const prev=state==='dialog'?DLG.prev:state;DLG={lines:lines.slice(),i:0,shown:0,prev:prev==='dialog'?'play':prev,opts:opts||{}};state='dialog';dlgEl.hidden=false;dlgShow()}
function dlgShow(){const L=DLG.lines[DLG.i],nl=L.indexOf('\n'),hasName=nl>0&&L.slice(0,nl)===L.slice(0,nl).toUpperCase()&&nl<24;DLG.name=hasName?L.slice(0,nl):'';DLG.text=hasName?L.slice(nl+1):L;DLG.shown=0;DLG.done=false;
  {const id=DLG.name?npcIdFor(DLG.name):null,C=id&&CHAR[id],[mood,text]=lineMood(DLG.text,C&&C.persona&&C.persona.mood),vid=id&&C&&C.voice&&text[0]!=='('?id:null;DLG.text=text;
   /* a line in brackets is the game talking (you got something), not the person, so it gets no voice */
   if(DLG.vid&&DLG.vid!==vid)dlgSpeakerOff(DLG.vid);DLG.vid=vid;DLG.mood=mood;
   if(vid){for(const e of speakers(id)){e.talking=true;e.mood=mood}voxLine(id,text,mood,DLG.i===0)}else voxEnd()}
  $('#dlgName').textContent=DLG.name;$('#dlgName').hidden=!DLG.name;$('#dlgText').textContent='';$('#dlgMore').hidden=true}
function dlgTick(dt){if(!DLG||DLG.done)return;const before=DLG.shown|0;DLG.shown=Math.min(DLG.text.length,DLG.shown+dt*55);if((DLG.shown|0)!==before){$('#dlgText').textContent=DLG.text.slice(0,DLG.shown|0);if(!DLG.vid&&before%4===0)SFX.text()}if(DLG.vid)voxType(DLG.shown,dt)
  if(DLG.shown>=DLG.text.length){DLG.done=true;$('#dlgMore').hidden=false;$('#dlgMore').textContent=DLG.i<DLG.lines.length-1?'▼':DLG.opts.ask?'A: YES   B: NO':'■'}}
function dlgNext(b){if(!DLG.done){voxSkip();DLG.shown=DLG.text.length;$('#dlgText').textContent=DLG.text;DLG.done=true;$('#dlgMore').hidden=false;$('#dlgMore').textContent=DLG.i<DLG.lines.length-1?'▼':DLG.opts.ask?'A: YES   B: NO':'■';return}
  if(DLG.i<DLG.lines.length-1){DLG.i++;dlgShow();return}dlgVoiceEnd();const o=DLG.opts,prev=DLG.prev;DLG=null;dlgEl.hidden=true;state=prev==='title'?'title':prev==='fade'?'play':(prev||'play');if(state==='dialog')state='play';
  if(o.ask&&b==='a')o.ask();if(o.done)o.done()}
function banner(t){banEl.textContent=t;banEl.hidden=false;banEl.classList.remove('go');void banEl.offsetWidth;banEl.classList.add('go');clearTimeout(banner.t);banner.t=setTimeout(()=>banEl.hidden=true,2600)}
function bannerBoss(t){banEl.textContent=t;banEl.hidden=false;banEl.classList.remove('go');void banEl.offsetWidth;banEl.classList.add('go','boss');clearTimeout(banner.t);banner.t=setTimeout(()=>{banEl.hidden=true;banEl.classList.remove('boss')},2600)}

/* ---------- the bag (START): what you carry, and which of it is on X and Y ---------- */
let bagI=0,bagPage=0;
function openBag(){state='bag';bagEl.hidden=false;bagPage=0;bagDraw()}
function closeBag(){bagEl.hidden=true;state='play';hudText()}
function bagDraw(){if(bagPage===1)return questDraw();const v=S.v,slots=USE_ITEMS.map(k=>v.items[k]?k:null);
  const icon=k=>`<img src="${ICON[k].toDataURL()}" alt="">`;
  let h='<h3>BAG</h3><div class="slots">';slots.forEach((k,n)=>{h+=`<div class="slot${n===bagI?' hot':''}">${k?icon(k):''}${k&&v.xb===k?'<b class="tx">X</b>':''}${k&&v.yb===k?'<b class="ty">Y</b>':''}</div>`});h+='</div>';
  const k=slots[bagI];h+=`<p class="what">${k?'<b>'+cap1(ITEMS[k].name)+'</b>'+(k==='sling'?' · '+v.ammo.seeds+'/'+v.cap.seeds:k==='bombs'?' · '+v.ammo.bombs+'/'+v.cap.bombs:'')+'<br>'+ITEMS[k].text:'Nothing here yet.'}</p><p class="keys">Press <b>X</b> or <b>Y</b> to put it on that button.</p>`;
  h+=`<div class="row">${v.sword?icon(v.sword>=2?'edge':'sword'):''}${HAS_SHIELD&&v.flags.shield?icon('shield'):''}<span>${icon('piece')} ${v.pieces%4}/4</span><span>${icon('shard')} ${v.shards}</span><span>${v.flames.map(f=>icon(f?'flame':'flameOff')).join('')}</span></div>`;
  h+=`<p class="foot">${fmtTime(v.time)} · B closes · SELECT quests</p>`;bagEl.innerHTML=h}
/* the quest log: what you're doing for whom, newest jobs first, finished ones at the bottom */
function questDraw(){const v=S.v;let h='<h3>QUESTS</h3><div class="ql">';const st=q=>q.id==='main'?(v.done?99:1):qs(q.id);
  const list=QUESTS.filter(q=>st(q)>0).sort((a,b)=>(st(a)===99)-(st(b)===99));
  for(const q of list){const d=st(q)===99;h+=`<div class="q${d?' done':''}${q.id==='main'?' main':''}"><b>${d?'✓ ':''}${esc(q.title)}</b>${q.from?`<i>${esc(q.from)}</i>`:''}${d?'':`<p>${esc(questText(q.id))}</p>`}</div>`}
  if(list.length<2)h+='<p class="none">People in the camp will ask you for things. Talk to them.</p>';h+='</div><p class="foot">B closes · SELECT map</p>';bagEl.innerHTML=h}
function bagInput(b){if(bagPage===1&&b!=='b'&&b!=='start'&&b!=='a'&&b!=='select')return;if(b==='left'){bagI=(bagI+3)%4;SFX.tick();bagDraw()}else if(b==='right'){bagI=(bagI+1)%4;SFX.tick();bagDraw()}
  else if(b==='d'||b==='c'){const k=USE_ITEMS[bagI];if(!S.v.items[k]){SFX.buzz();return}const me=b==='d'?'xb':'yb',other=b==='d'?'yb':'xb';if(S.v[other]===k)S.v[other]=S.v[me];S.v[me]=k;SFX.pick();bagDraw();S.save()}
  else if(b==='b'||b==='start'||b==='a')closeBag();else if(b==='select'){if(bagPage===0){bagPage=1;SFX.tick();bagDraw()}else{closeBag();openMap()}}}
const fmtTime=s=>{s=Math.floor(s);return Math.floor(s/3600)+':'+String(Math.floor(s/60)%60).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};

/* ---------- maps: the full one (SELECT) and the little one on the second screen ---------- */
function mapPaint(c,W,H){const x=c.getContext('2d');x.fillStyle='#120e1e';x.fillRect(0,0,W,H);if(!room)return;
  if(room.map==='ow'||room.outdoors){const cw=Math.floor(W/6),ch=Math.floor(H/6),ox=(W-cw*6)/2|0,oy=(H-ch*6)/2|0;
    for(let y=0;y<6;y++)for(let i=0;i<6;i++){const k=roomKey('ow',i,y),seen=S.v.seen[k],th=OW.cells[y*6+i][0],T2=THEMES[th];x.fillStyle=seen?(['lake','shore'].includes(th)?'#3a7ad8':T2.g):'#2a2240';x.fillRect(ox+i*cw+1,oy+y*ch+1,cw-2,ch-2)}
    const mk=(i,y,col)=>{x.fillStyle=col;x.fillRect(ox+i*cw+cw/2-2,oy+y*ch+ch/2-2,4,4)};[[1,3,0],[4,2,1],[1,0,2],[0,5,3]].forEach(([i,y,n])=>{if(S.v.seen[roomKey('ow',i,y)])mk(i,y,S.v.flames[n]?'#ffd23f':'#e8443a')});
    if(S.v.seen[roomKey('ow',2,0)])mk(2,0,'#b88aff');const at=room.outdoors?[room.rx,room.ry]:EXITS[room.map]?[EXITS[room.map][0],EXITS[room.map][1]]:[2,5];if(Math.floor(T*3)%2){x.fillStyle='#fff';x.fillRect(ox+at[0]*cw+2,oy+at[1]*ch+2,cw-4,ch-4)}}
  else{const D=DUN[room.map],gh=D.grid.length,gw=D.grid[0].length,cs=Math.floor(Math.min(W/gw,H/gh)),ox=(W-cs*gw)/2|0,oy=(H-cs*gh)/2|0;
    for(let y=0;y<gh;y++)for(let i=0;i<gw;i++){const id=D.grid[y][i];if(id==='.')continue;const k=roomKey(room.map,i,y),seen=S.v.seen[k],known=seen||S.v.maps[room.map];if(!known)continue;
      x.fillStyle=seen?'#5a4a8a':'#2e2850';x.fillRect(ox+i*cs+1,oy+y*cs+1,cs-2,cs-2);if(D.rooms[id].boss){x.fillStyle='#e8443a';x.fillRect(ox+i*cs+cs/2-2,oy+y*cs+cs/2-2,4,4)}
      if(D.rooms[id].loot&&!S.v.got[k+':chest']&&S.v.maps[room.map]){x.fillStyle='#ffd23f';x.fillRect(ox+i*cs+2,oy+y*cs+2,2,2)}}
    if(Math.floor(T*3)%2){x.fillStyle='#fff';x.fillRect(ox+room.rx*cs+3,oy+room.ry*cs+3,cs-6,cs-6)}}}
const MAPC=mkCanvas(120,120);
function openMap(){state='map';mapEl.hidden=false;mapEl.innerHTML=`<h3>${room.outdoors?'HOLLOW WOOD':esc(room.name).toUpperCase()}</h3>`;mapEl.append(MAPC);const p=el('p','foot',room.outdoors?'Red: a flame still down there. Gold: one you took back.':S.v.maps[room.map]?'You have this place\'s map. Gold dots: chests you haven\'t opened.':'Find this place\'s map to see all of it.');mapEl.append(p);mapPaint(MAPC,120,120)}
function closeMap(){mapEl.hidden=true;state='play'}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let pcv=null;
function hudText(){if(!PANEL||!room)return;const v=S.v,f=v.flames.filter(Boolean).length;PANEL.rows([['PLACE',room.outdoors?room.name:(DUN[room.map]?DUN[room.map].name:'')],['HEARTS',(v.hp/2)+' / '+(v.max/2)],['GOAL',v.done?'Done':!v.items.sword?'Find sword':f<4?'Roots '+f+'/4':'Kill the Heart'],['SHARDS',v.shards]]);
  if(!pcv)pcv=PANEL.canvas(92,92,'MAP');if(pcv)mapPaint(pcv,92,92)}

/* ---------- title, start, ending ---------- */
const soundItem=()=>({t:'SOUND',v:()=>SOUND_NAMES[S.v.sound],adj:d=>{S.v.sound=(S.v.sound+d+3)%3;SND.mode=S.v.sound;S.save()}});
const shadowItem=()=>({t:'SHADOWS',v:()=>SHADOWS?'ON':'OFF',adj:()=>setShadows(!SHADOWS)});
const picItem=()=>({t:'PICTURE',v:()=>({hd:'HD',retro:'RETRO',pixel:'PIXEL'})[PIC],adj:d=>{const L=['hd','retro','pixel'];setPic(L[(L.indexOf(PIC)+(d<0?-1:1)+3)%3])}});
function title(){state='title';SND.play(SONGS.village);room=buildRoom('ow',2,5);E=[];P.x=cen(5);P.y=cen(6)+4;P.ang=Math.PI/2;P.inv=0;P.fall=0;P.hold=0;dlgEl.hidden=true;bagEl.hidden=true;mapEl.hidden=true;
  menu({cls:'title',html:'<h1 class="logo"><small>THE TALE OF</small>WICK</h1><p class="subt">HOLLOW WOOD</p><p>Stay on the path.</p>',i:SLOT,
    items:[0,1,2].map(n=>({t:'FILE '+(n+1),v:()=>slotLabel(n),fn:()=>pickSlot(n)})).concat(SLOTS.some(sv=>sv.v.started)?[{t:'DELETE SAVES',fn:delMenu}]:[],[soundItem(),picItem(),shadowItem(),{t:'HOW TO PLAY',fn:how}]),
    foot:'STICK MOVE · B SWORD (B B LOCK ON) · A ACT/ROLL · X/Y ITEMS · SELECT FOCUS · START BAG'})}
/* each file shows how far it has got: time played and roots cut, or that it is finished */
function slotLabel(n){const v=SLOTS[n].v;if(!v.started)return'NEW';const f=(v.flames||[]).filter(Boolean).length;return(v.done?'DONE':f+'/4 CORES')+' · '+fmtTime(v.time||0)}
function placeOf(v){const a=v.at;if(!a)return'The Camp';if(a.map==='ow'){const c=OW.cells[a.ry*6+a.rx];return c?c[1]:'The Camp'}return DUN[a.map]?DUN[a.map].name:'The Camp'}
function pickSlot(n){useSlot(n);const v=S.v;if(!v.started){newGame();return}
  const ask=(h,p,yes)=>menu({html:`<h2>${h}</h2><p>${p}</p>`,items:[{t:'NO',fn:()=>pickSlot(n)},{t:'YES',fn:yes}],back:()=>pickSlot(n)});
  menu({cls:'title',html:`<h1 class="logo">FILE ${n+1}</h1><p>${esc(placeOf(v))}</p><p class="keys">${slotLabel(n)} · ${v.max/2} hearts · ${QUESTS.filter(q=>q.id!=='main'&&qs(q.id)===99).length} quests done</p>`,
    items:[{t:'CONTINUE',fn:cont},{t:'START OVER',fn:()=>ask('START FILE '+(n+1)+' OVER?','Everything in this file will be lost.',newGame)},{t:'DELETE',fn:()=>ask('DELETE FILE '+(n+1)+'?','It will be empty again. This can\'t be undone.',()=>{eraseSlot(n);title()})},{t:'BACK',fn:title}],back:title})}
/* deleting saves from the title: one file at a time, or all of them */
function delMenu(){const used=[0,1,2].filter(n=>SLOTS[n].v.started);if(!used.length){title();return}
  const ask=(h,yes)=>menu({html:`<h2>${h}</h2><p>This can't be undone.</p>`,items:[{t:'NO',fn:delMenu},{t:'YES, DELETE',fn:yes}],back:delMenu});
  menu({html:'<h2>DELETE SAVES</h2><p>Pick a file to delete.</p>',items:used.map(n=>({t:'FILE '+(n+1),v:()=>slotLabel(n),fn:()=>ask('DELETE FILE '+(n+1)+'?',()=>{eraseSlot(n);delMenu()})}))
    .concat(used.length>1?[{t:'DELETE ALL',fn:()=>ask('DELETE ALL '+used.length+' FILES?',()=>{used.forEach(eraseSlot);title()})}]:[],[{t:'BACK',fn:title}]),back:title})}
function how(){menu({html:'<h2>HOW TO PLAY</h2><p class="keys">Walk with the <b>stick</b>; the camera follows behind you.<br><b>B</b> swings the sword: hold it and let go for a spin. Tap it <b>twice</b> quickly to lock on to the nearest enemy.<br><b>A</b> talks, reads and opens chests, and rolls when you\'re running (you can\'t be hurt mid-roll).<br><b>X</b> and <b>Y</b> use the items you set in the bag (<b>START</b>). They aim at whatever is in front of you.<br><b>SELECT</b> locks on too, lets go of a lock, or swings the camera behind you.<br>While locked on, <b>A</b> leaps at your target with a chop that hits twice as hard.<br>In the bag, <b>SELECT</b> turns to your quests, then the map.</p>',items:[{t:'BACK',fn:title}],back:title})}
function newGame(){const snd=S.v.sound;for(const k of Object.keys(S.v))delete S.v[k];Object.assign(S.v,FRESH());S.v.sound=snd;S.v.started=1;S.save();closeMenu();room=null;E=[];
  cineStart('intro',()=>{say(INTRO,{done:()=>{enterRoom('ow',2,5,cen(5),cen(6),'start');fade=1;state='fadein';setTimeout(()=>banner('NEW QUEST · OUT OF THE TREE'),1400)}})})}
function cont(){closeMenu();S.v.q=S.v.q||{main:1};S.v.qc=S.v.qc||{};const a=S.v.at;try{if(a&&(a.map==='ow'||DUN[a.map]))enterRoom(a.map,a.rx,a.ry,a.x,a.y,'start');else enterRoom('ow',2,5,cen(5),cen(6),'start')}catch(e){enterRoom('ow',2,5,cen(5),cen(6),'start')}state='play'}
function ending(){S.v.done=1;S.v.hp=S.v.max;S.save();cineStart('end',()=>{say(OUTRO,{done:()=>{const v=S.v;menu({cls:'title',html:`<h1 class="logo"><small>THE TALE OF</small>WICK</h1><p class="subt">HOLLOW WOOD</p><p>The tree is dead. Everyone is out.</p><p class="keys">Time ${fmtTime(v.time)} · Falls ${v.deaths} · Hearts ${v.max/2} · Quests ${QUESTS.filter(q=>q.id!=='main'&&qs(q.id)===99).length} of ${QUESTS.length-1}</p>`,
    items:[{t:'KEEP PLAYING',fn:()=>{closeMenu();fade=1;enterRoom('ow',2,5,cen(5),cen(6),'warp');state='fadein'}},{t:'TITLE',fn:title}]})}})})}

/* ---------- buttons ---------- */
function roll(){if(P.rollCd>0||P.roll>0||P.hold>0||P.fall>0||P.st==='hook'||P.swing>0||P.spin>0||P.jump>0)return;let[ax,ay]=moveV;if(Math.hypot(ax,ay)<.2)[ax,ay]=fvec();else if(!lockT)P.ang=Math.atan2(ay,ax);const l=Math.hypot(ax,ay)||1;P.rvx=ax/l*175;P.rvy=ay/l*175;P.roll=.24;P.rollCd=.5;P.st='roll';SFX.roll();heroSay('roll',.75)}
onBtn=(b,d)=>{if(d)SND.unlock();if(M){if(d)menuInput(b);return}
  if(state==='cine'){if(d&&b==='start')cineSkip();return}
  if(state==='dialog'){if(d&&(b==='a'||b==='b'))dlgNext(b);return}
  if(state==='bag'){if(d)bagInput(b);return}
  if(state==='map'){if(d&&'abstartselect'.includes(b))closeMap();return}
  if(state!=='play')return;
  if(b==='b'){if(d){if(T-lastB<.32){lastB=-9;bLock()}else lastB=T;pressB()}else releaseB();return}
  if(!d)return;
  if(b==='a')pressA();else if(b==='d')useItem(S.v.xb);else if(b==='c')useItem(S.v.yb);else if(b==='start')openBag();else if(b==='select')focus()};
/* SELECT: lock on to the nearest foe ahead, or swing the camera round behind you */
function bestFoe(){let best=null,bs=1e9;for(const e of E){if(e.dead||!(e.k==='foe'||(e.k==='boss'&&!(e.kind==='hush'&&e.phase===1))))continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d>140)continue;
    const s=d+Math.abs(angD(Math.atan2(e.y-P.y,e.x-P.x),camYaw))*40;if(s<bs){bs=s;best=e}}return best}
/* the nearest foe still standing, for the lock to move to when its target falls */
function nearFoe(){let best=null,bd=170;for(const e of E){if(e.dead||!(e.k==='foe'||(e.k==='boss'&&!(e.kind==='hush'&&e.phase===1))))continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;best=e}}return best}
function focus(){if(lockT){lockT=null;SFX.tick();return}const best=bestFoe();if(best){lockT=best;SFX.tick()}else camSnap=.35}
/* B twice, quickly: lock on to the foe ahead (the first press still swings). While locked it moves the lock to whichever foe
   you now face, so hammering the sword at your target never drops it; SELECT lets go */
let lastB=-9;
function bLock(){const best=bestFoe();if(best&&best!==lockT){lockT=best;SFX.tick()}}
stage.addEventListener('pointerdown',()=>SND.unlock());

/* ---------- the clock ---------- */
let last=performance.now(),panT=0;
let PAUSED=false;
function tick(dt){T+=dt;voxTick(dt);
  if(state==='play'){S.v.time+=dt;itemCd=Math.max(0,itemCd-dt);stepPlayer(dt);if(state==='play'){stepThings(dt);const[ax,ay]=AXIS();if(ax||ay)doorCheck()}saveT+=dt;if(saveT>20){saveT=0;S.save()}}
  else if(state==='trans'){trans.t+=dt/.45;if(trans.t>=1){trans=null;SNAP=null;state='play'}}
  else if(state==='fade'){fade+=dt*3.5;if(fade>=1&&fadeTo){const f=fadeTo;fadeTo=null;enterRoom(f.map,f.rx,f.ry,f.px,f.py,f.how||'warp');fade=1;state='fadein'}}
  else if(state==='fadein'){fade-=dt*3.5;if(fade<=0){fade=0;if(state==='fadein')state='play'}}
  else if(state==='dialog')dlgTick(dt);
  else if(state==='cine')cineTick(dt);
  if(shake>0)shake-=dt;panT-=dt;if(panT<=0){panT=.5;hudText()}}
function frame(now){const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;if(!PAUSED){if(HITSTOP>0)HITSTOP-=dt;else tick(dt);draw()}requestAnimationFrame(frame)}
addEventListener('resize',()=>{resize();draw()});
addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play'){S.save();openBag()}});
hookConsole('hollowmere','The Tale of Wick: Hollow Wood',S);
resize();title();requestAnimationFrame(frame);S.init(()=>{SND.mode=S.v.sound;if(state==='title')title()});
window.__hm={get lockT(){return lockT},bestFoe,animCreature,S,G3,SND,AMB,mawPose,VOX,lineMood,voiceOf,vsynth,sylFor,VSND,FSND,voxOn,vloud,voxSay,voxEnd,setBase(v){RES_BASE=v;resize()},mkHero,mkNpc,mkFoeModel,CHAR,animNpc,stepNpc,THREE:TH,SLOTS,useSlot,eraseSlot,pickSlot,get SLOT(){return SLOT},CINE,cineStart,cineSkip,questText,get bagPage(){return bagPage},get camYaw(){return camYaw},set camYaw(v){camYaw=v},get lockT(){return lockT},set lockT(v){lockT=v},focus,pressB,releaseB,aimAt,landFor,render3D,set paused(v){PAUSED=v},get itemCd(){return itemCd},set itemCd(v){itemCd=v},doorCheck,openChest,frontTile,get DLG(){return DLG},collect,mkPickup,get room(){return room},get E(){return E},P,get state(){return state},enterRoom,give,get HITSTOP(){return HITSTOP},set state(v){state=v},enterRoom,buildRoom,give,warp,DUN,OW,owEdge,TPL,useItem,pressA,releaseA,roll,stepThings,stepPlayer,checkCond,explode,say,dlgNext,newGame,cont,title,spawnBoss,hitThing,bossHit,
  step(dt){tick(dt)},draw,btnSet,tileAt,blocked,findRoom,cen,toggleCrystal,burnAt};
