/* ===================== STRIKE AT NIGHT, the second telling: art =====================
   A city street in 2026, the farm village of Larkfield, the Crows' camp, and the people and foes of the new story. */

/* ---------- the city, 2026 ---------- */
function asphalt(g,seed=1){RF(g,0,0,16,16,'#2a2c33');const r=rng(seed*13+5);
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=Math.sin(x*.9+seed)+Math.cos(y*1.1+seed*2);if(v>1.3&&dth(x,y,6))P(g,x,y,'#33363e');else if(v<-1.3&&dth(x,y,6))P(g,x,y,'#24262c')}
  for(let i=0;i<9;i++)P(g,r()*16|0,r()*16|0,i%3?'#3a3d46':'#1e2026');
  if(r()<.5){const x=r()*12|0,y=r()*13|0;RF(g,x,y,4,1,'#3a4658');P(g,x+1,y,'#56657c')}}   // a wet sheen
function sidewalk(g,seed=2){RF(g,0,0,16,16,'#7a7e88');RF(g,0,0,16,1,'#8e929c');RF(g,0,7,16,1,'#5e626c');RF(g,0,8,16,1,'#8e929c');RF(g,7,0,1,7,'#5e626c');RF(g,15,8,1,8,'#5e626c');
  speck(g,seed,7,['#6a6e78','#888c96','#6a6e78'])}
function cityWall(g,win,seed=3){RF(g,0,0,16,16,'#2e3242');RF(g,0,0,1,16,'#3a3f52');RF(g,15,0,1,16,'#22252f');speck(g,seed,5,['#353a4c','#262a38']);
  if(win){RF(g,2,2,12,11,'#141826');RF(g,3,3,10,9,win);RF(g,3,3,10,1,shade(win,.3));RF(g,8,3,1,9,'#141826');RF(g,3,7,10,1,'#141826');P(g,4,4,'#ffffff')}
  RF(g,0,14,16,2,'#1e2130')}
function streetlight(g){sidewalk(g,9);RF(g,7,3,2,12,'#1e2028');RF(g,7,3,1,12,'#3a3d48');RF(g,6,13,4,2,'#1e2028');RF(g,4,0,8,3,'#1e2028');RF(g,5,2,6,1,'#fff2c8');RF(g,6,1,4,1,'#ffe6a0')}
function signal(g,f){sidewalk(g,11);RF(g,7,6,2,9,'#1e2028');RF(g,6,14,4,1,'#1e2028');RF(g,4,0,8,7,'#14161c');RF(g,5,1,6,5,'#22252e');
  // the walking figure, lit white
  const c=f%2?'#ffffff':'#e8f0ff';P(g,8,1,c);RF(g,7,2,2,2,c);P(g,6,3,c);P(g,9,3,c);P(g,7,4,c);P(g,9,5,c);P(g,6,5,c)}
function trashbin(g){sidewalk(g,13);RF(g,4,5,8,10,'#1e3a2a');RF(g,4,5,2,10,'#2e5a3e');RF(g,3,4,10,2,'#2a4a36');RF(g,3,4,10,1,'#4a7a5a');RF(g,4,14,8,1,'#10201a')}
function glassDoor(g){cityWall(g,null,21);RF(g,2,2,12,14,'#1a1e2a');RF(g,3,3,10,13,'#8aa8c8');RF(g,8,3,1,13,'#1a1e2a');RF(g,3,3,4,13,'#a8c4e0');RF(g,3,3,10,1,'#d8e8ff');
  for(let y=4;y<15;y+=3)P(g,4+(y%4),y,'#e8f4ff');RF(g,6,9,1,2,'#c8ccd8');RF(g,9,9,1,2,'#c8ccd8')}
function crosswalk(g,seed){asphalt(g,seed);for(const y of [1,7,13]){RF(g,1,y,14,3,'#d8dbe2');RF(g,1,y,14,1,'#eceef2');speck(g,seed+y,3,['#a8acb4'],[1,y,14,3])}}
function laneLine(g,seed){asphalt(g,seed);RF(g,2,7,7,2,'#d8a83a');RF(g,2,7,7,1,'#f0c85a')}

/* ---------- Larkfield ---------- */
function wheat(g,f){dirt(g,46);const r=rng(48);
  for(let i=0;i<14;i++){const x=1+(i*7+3)%14,y=2+(i*5)%11,sw=(f+i)%4<2?0:1;RF(g,x+sw,y,1,5,i%2?'#c8a040':'#a88430');RF(g,x+sw-1,y-1,3,2,i%3?'#f0d070':'#e0b850');P(g,x+sw,y-2,'#fff0a0')}}
function tilled(g){dirt(g,52);for(let y=1;y<16;y+=4){RF(g,0,y,16,1,'#7e5e36');RF(g,0,y+1,16,1,'#cdaa74')}speck(g,53,4,['#5aa042','#468530'])}
function haystack(g){grass(g,57);blobN(g,8,9,7,6,['#7a5a1e','#a8842e','#d8b450','#f4dc84'],'#3a2a10');for(let i=0;i<8;i++)P(g,3+(i*5)%10,6+(i*3)%6,'#7a5a1e')}
function barrel(g){dirt(g,59);blobN(g,8,9,5,6,['#4a2e18','#7a4e2a','#a8743f','#c48d55'],C.ol);RF(g,3,6,10,1,'#3a3440');RF(g,3,12,10,1,'#3a3440')}
function hearth(g,f){planks(g);RF(g,1,1,14,14,'#5b6372');RF(g,1,1,14,2,'#7e889a');RF(g,0,0,16,1,C.ol);bricks(g,'#5b6372','#3b414d','#7e889a');RF(g,3,6,10,9,'#14101a');
  const fl=[['#ffe8a0','#ffb040','#ff6a1a'],['#fff2c0','#ffc050','#ff7a20']][f%2];const H=[[4,6,5],[5,4,6],[6,5,4],[4,5,6]][f%4];
  for(let i=0;i<3;i++){const x=5+i*2,h=H[i];RF(g,x,14-h,2,h,fl[2]);RF(g,x,15-h,2,Math.max(1,h-3),fl[1]);P(g,x,16-h,fl[0])}RF(g,4,13,8,2,'#3a2418')}
function basin(g){planks(g);RF(g,3,6,10,9,'#6b4426');RF(g,3,6,10,1,'#9a6b3d');RF(g,4,14,2,2,'#3a2412');RF(g,10,14,2,2,'#3a2412');
  blobN(g,8,6,5,3,['#8a8e98','#b0b4bc','#d8dce4','#f4f6f8'],C.ol);RF(g,5,5,6,2,'#4a7ab0');RF(g,6,5,3,1,'#9cc6e0')}
function rug(g){RF(g,0,0,16,16,'#8e3e2c');for(let y=0;y<16;y+=4){RF(g,0,y,16,1,'#b0603a');RF(g,0,y+2,16,1,'#6e2c20')}
  for(let y=1;y<16;y+=4)for(let x=(y%8<4?0:2);x<16;x+=4)P(g,x,y,'#e0a858');speck(g,77,5,['#7a3424','#b8683e'])}
function bush(g){grass(g,63);blobN(g,8,9,7,6,['#123a1c','#1f5226','#2e6c2c','#418a36','#62aa48'],'#0e1a12');P(g,5,6,'#9ad86e');P(g,10,8,'#9ad86e');P(g,7,11,'#c84a4a');P(g,11,5,'#c84a4a')}
function logSeat(g){dirt(g,65);blobN(g,8,10,7,3,['#3a2412','#5a3a1f','#7e5530','#a8743f'],C.ol);blobN(g,13,10,2,2,['#a8743f','#c8965a','#e0b678','#f0d0a0'],C.ol)}
function stall(g){dirt(g,67);RF(g,1,8,14,7,'#6b4426');RF(g,1,8,14,1,'#9a6b3d');for(let x=0;x<16;x+=4){RF(g,x,1,2,6,'#c83a3a');RF(g,x+2,1,2,6,'#f0e8d8')}RF(g,0,6,16,1,C.ol);
  RF(g,3,9,3,3,'#e0a030');RF(g,8,9,2,3,'#5aa042');RF(g,11,9,3,3,'#c84a4a')}
function bars(g){stoneFloor(g,69);for(let x=1;x<16;x+=3){RF(g,x,0,2,16,'#4a4e5a');RF(g,x,0,1,16,'#8a90a0')}RF(g,0,2,16,2,'#4a4e5a');RF(g,0,12,16,2,'#4a4e5a')}
function campDirt(g){dirt(g,71);speck(g,72,6,['#8e6c40','#d4b582','#5a3a1f'])}

(function(){const T=(ch,o)=>{TILE[ch]=o};
  T('0',{paint:g=>asphalt(g,1)});
  T('1',{paint:g=>laneLine(g,3)});
  T('2',{paint:g=>crosswalk(g,5)});
  T('3',{paint:g=>sidewalk(g,2)});
  T('4',{paint:g=>{sidewalk(g,6);RF(g,0,13,16,3,'#4a4e58');RF(g,0,13,16,1,'#a8acb6');RF(g,0,15,16,1,'#22242a')}});
  T('5',{paint:g=>{sidewalk(g,7);RF(g,0,0,16,3,'#4a4e58');RF(g,0,2,16,1,'#a8acb6');RF(g,0,0,16,1,'#22242a')}});
  T('6',{paint:g=>cityWall(g,'#cfe0f4',8),solid:1,lamp:{r:16,c:'rgba(200,225,255,.4)'}});
  T('$',{paint:g=>cityWall(g,'#ffd98a',12),solid:1,lamp:{r:16,c:'rgba(255,210,130,.45)'}});
  T('7',{paint:g=>cityWall(g,null,10),solid:1});
  T('8',{paint:glassDoor,solid:1,lamp:{r:22,c:'rgba(210,230,255,.55)'}});
  T('9',{paint:streetlight,solid:1,lamp:{r:52,c:'rgba(255,225,160,.62)',dy:-6}});
  T('!',{paint:signal,anim:2,solid:1,lamp:{r:14,c:'rgba(240,245,255,.5)',dy:-5}});
  T('@',{paint:trashbin,solid:1});
  // Larkfield and the road
  T('G',{paint:wheat,anim:4,solid:1});
  T('I',{paint:tilled});
  T('%',{paint:haystack,solid:1});
  T('(',{paint:barrel,solid:1});
  T('H',{paint:hearth,anim:4,solid:1,fire:1});
  T('?',{paint:basin,solid:1});
  T(':',{paint:rug});
  T('}',{paint:bush,solid:1});
  T('>',{paint:logSeat,solid:1});
  T(')',{paint:stall,solid:1});
  T(']',{paint:bars,solid:1});
  T('-',{paint:g=>campDirt(g)});
  T('<',{paint:g=>campDirt(g),solid:1});   // under a tent
})();

/* ---------- props, drawn big ---------- */
RAMPS.canvas=['#4a3a24','#7a6440','#a8905e','#d8c08a'];RAMPS.canvasR=['#3a1a1a','#6a2a26','#9a4a3a','#c8786a'];RAMPS.carblue=['#101c3a','#1e3a6e','#3a64a8','#8ab0e8'];
RAMPS.watch=['#141c34','#26365e','#3e5490','#7a90c8'];RAMPS.toll=['#2a0a0e','#5a141c','#8a2430','#c8584a'];RAMPS.sarge=['#2a1a08','#5a3a14','#8a5a20','#d8a040'];
RAMPS.road=['#14240e','#2a4a1e','#46703a','#7ea86a'];RAMPS.xbow=['#22160e','#4a3020','#7a5434','#b08458'];RAMPS.keep=['#1a1a22','#34343e','#585866','#9a9aaa'];
RAMPS.roadwolf=['#3a2e24','#6a5848','#a08a74','#d8c8b4'];RAMPS.hound=['#141014','#2e2628','#4e4244','#8a7a78'];RAMPS.boar=['#2a1a12','#4e3424','#7a5a40','#b08a6a'];
RAMPS.plume=['#4a0a10','#8a1820','#c83a3a','#ff8a7a'];RAMPS.hide=['#2e2418','#5a4830','#8a7450','#c0a880'];
/* a car from 2026, side view, nose to the right, headlights on */
ART.car=()=>ART._car||(ART._car=(()=>{const c=mk(46,22),g=c.getContext('2d');const o='#0a0c12';
  RF(g,2,9,42,8,o);RF(g,11,3,22,7,o);RF(g,3,10,40,6,'#3a64a8');RF(g,3,10,40,2,'#6a94d8');RF(g,12,4,20,6,'#3a64a8');RF(g,12,4,20,1,'#8ab0e8');
  RF(g,14,5,7,4,'#9ad0f0');RF(g,22,5,8,4,'#7ab8e0');RF(g,14,5,7,1,'#e0f4ff');RF(g,21,5,1,5,o);
  RF(g,3,14,40,2,'#1e3a6e');RF(g,42,11,2,3,'#fff6c8');RF(g,2,11,2,2,'#c83a3a');RF(g,18,11,1,3,'#1e3a6e');RF(g,28,11,1,3,'#1e3a6e');
  for(const x of [11,35]){RF(g,x-4,15,9,7,o);RF(g,x-3,16,7,5,'#2a2a30');RF(g,x-1,17,3,3,'#8a8e98')}return c})());
/* a canvas tent: the Crows sleep in these */
ART.tent=(red)=>{const k=red?'_tentR':'_tent';return ART[k]||(ART[k]=sculpt(36,30,[Pl([[2,28],[18,3],[34,28]],red?'canvasR':'canvas'),Pl([[13,28],[18,12],[23,28]],'dark',{b:-.4}),Cp(18,1,18,6,.7,'cartwood'),
  Cp(2,28,34,28,.6,'cartwood'),E(6,28,1,1,null,{flat:'#3a2412'}),E(30,28,1,1,null,{flat:'#3a2412'})]))};
/* the Baron's tax wagon: a covered cart with a red seal */
ART.wagon=()=>ART._wagon||(ART._wagon=sculpt(44,34,[Cp(4,24,0,27,1,'cartwood'),Pl([[4,14],[40,14],[38,25],[6,25]],'cartwood'),E(22,13,18,10,'canvas',{cut:1}),Cp(5,14,39,14,1,'cartwood',{b:.2}),
  E(22,10,4,4,'toll'),E(22,10,2,2,null,{flat:'#ffd77a'}),E(11,27,5,5,'dark'),E(11,27,1.8,1.8,'cartwood'),E(33,27,5,5,'dark'),E(33,27,1.8,1.8,'cartwood')]));

/* ---------- foes ---------- */
Object.assign(MON,{
  /* a spearman in a helmet and a tabard of his master's color; the crossbowman carries a crossbow instead */
  guard(m){const xb=m==='xbow';const parts=[Cp(12,26,11,35,2.3,'leather'),Cp(18,26,19,35,2.3,'leather'),E(10.5,35.5,3.2,1.6,'dark'),E(19.5,35.5,3.2,1.6,'dark'),
    Pl([[8,14],[22,14],[24,29],[6,29]],'steel'),Pl([[11,15],[19,15],[20,29],[10,29]],m),Cp(7,24,23,24,1.1,'leather'),
    Cp(8,16,4,24,2.2,'steel'),Cp(22,16,25.5,23,2.2,'steel'),E(4,25.5,1.9,1.9,'skin'),E(25.5,24,1.9,1.9,'skin')];
    if(xb)parts.push(Cp(9,21,23,17,1,'cartwood'),Cp(13,15,16,24,.7,'steel'),E(23,17,1,1,null,{flat:'#e8eef8'}));
    else parts.push(Cp(26.5,30,27.5,3,.75,'cartwood'),Pl([[26,4],[27.5,-1],[29,4],[27.5,6]],'steel'));
    parts.push(E(15,9,4.6,5.2,'skin'),E(15,6.4,5.6,4.4,'steel',{cut:1}),Cp(9.6,8,20.4,8,1,'steel'),Cp(15,1.5,15,4,.6,m),
      E(13.2,9.8,.9,.8,null,{flat:'#100a18'}),E(16.8,9.8,.9,.8,null,{flat:'#100a18'}),Cp(13.4,12.6,16.6,12.6,.4,null,{flat:'#6a3a2a',noEdge:1}));
    return sculpt(30,38,parts)},
  /* Garrick the Hound: a big man in a wide hat and a fur mantle, a crossbow on his shoulder */
  hunter(){return sculpt(46,56,[
    Cp(18,38,17,52,3,'leather'),Cp(27,38,28,52,3,'leather'),E(16.5,53,4,1.8,'dark'),E(28.5,53,4,1.8,'dark'),
    Pl([[11,18],[35,18],[38,46],[8,46]],'hide'),Pl([[19,19],[27,19],[26,40],[20,40]],'leather'),Cp(10,35,36,35,1.3,'dark'),E(30,35,1.6,1.6,'gold'),
    Cp(12,21,6,36,3,'hide'),E(6,37.5,2.4,2.4,'skin'),Cp(34,21,38,30,3,'hide'),E(38,31,2.4,2.4,'skin'),
    Cp(5,34,9,26,.8,'steel'),
    E(23,20,13,5.5,'fur',{b:.15}),E(14,21,5,4,'fur'),E(32,21,5,4,'fur'),
    E(23,12,5.2,5.6,'skin'),Pl([[17.4,13.5],[28.6,13.5],[27.4,18.4],[23,20.2],[18.6,18.4]],'fur'),
    E(23,6.6,13,2.6,'dark',{b:-.1}),E(23,4.6,6.4,4.2,'dark',{cut:1.6}),Cp(16.6,6.2,29.4,6.2,.7,'red'),
    E(21,11.8,.9,.8,null,{flat:'#100a18'}),E(25,11.8,.9,.8,null,{flat:'#100a18'}),
    Cp(30,26,44,6,1.1,'cartwood'),Cp(38,9,44,14,.9,'steel'),Cp(41,3,45,8,.6,'steel'),Cp(37,15,43,5,.4,null,{flat:'#d8d0c0',noEdge:1})])},
  /* Sir Kell: full plate, a great helm with a red plume, a tower shield and a mace */
  ironknight(){return sculpt(54,62,[
    Cp(21,42,20,57,3.6,'steel'),Cp(32,42,33,57,3.6,'steel'),E(19.5,58,4.6,2.2,'darksteel'),E(33.5,58,4.6,2.2,'darksteel'),
    Pl([[15,20],[39,20],[40,46],[14,46]],'steel'),Pl([[21,22],[33,22],[32,46],[22,46]],'toll'),E(27,30,3,3,null,{flat:'#ffd77a'}),Cp(14,40,40,40,1.4,'darksteel'),
    E(15.5,21.5,6,4.6,'steel'),E(38.5,21.5,6,4.6,'steel'),
    Cp(38,24,44,32,3.2,'steel'),E(44,33,2.8,2.8,'darksteel'),Cp(44,33,47,10,1.1,'cartwood'),E(47,8,4.2,4.2,'darksteel'),
    Pl([[45,4],[47,1],[49,4]],'steel'),Pl([[51,7],[54,8],[51,10]],'steel'),Pl([[43,7],[40,8],[43,10]],'steel'),
    E(27,12.5,6.6,7,'steel'),Cp(21.6,12,32.4,12,.7,null,{flat:'#0a0a14',noEdge:1}),Cp(27,13,27,18,.5,null,{flat:'#0a0a14',noEdge:1}),
    Cp(27,6,22,-1,2,'plume',{r2:1.2}),Cp(22,-1,16,3,1.2,'plume',{r2:.7}),
    Pl([[1,22],[15,20],[16,48],[8,54],[0,48]],'steel',{b:.1}),Pl([[4,26],[12,25],[13,46],[8,50],[3,46]],'toll'),Cp(8,30,8,44,.8,null,{flat:'#ffd77a',noEdge:1}),Cp(5,36,11,36,.8,null,{flat:'#ffd77a',noEdge:1})])},
  boar(m){return sculpt(42,28,[
    Cp(11,18,10,26,2.2,m,{r2:1.6,b:-.3}),Cp(29,18,30,26,2.2,m,{r2:1.6,b:-.3}),E(10,26.5,2.4,1,'dark'),E(30,26.5,2.4,1,'dark'),
    E(20,15,14,8.5,m),Cp(16,18,15,26,2.3,m,{r2:1.7}),Cp(25,18,26,26,2.3,m,{r2:1.7}),E(15,26.5,2.5,1,'dark'),E(26,26.5,2.5,1,'dark'),
    Pl([[8,7],[12,5],[16,7],[20,4.6],[24,7],[28,5.4],[31,8],[20,11]],m,{b:-.3}),
    E(33,14,6.6,6,m),Cp(36,15,41,17,3,m,{r2:2.3}),E(41.2,17.2,1.4,1.6,'skin'),Pl([[36.4,8],[35,4],[38.6,7.6]],m),
    Pl([[37.6,18.6],[40,14.6],[39.4,19.4]],'bone',{noEdge:1}),E(35.6,12.4,.9,.8,null,{flat:'#ffd24a'}),Cp(3,13,7,12,.6,m)])},
});

/* ---------- the people of the new story ---------- */
look('lift2026',{skin:'#f0c09a',hair:'#2a1e18',top:'#5a5f6e',acc:'#2a2c34',bot:'#2f4a7a',boot:'#e8e8ec',style:['messy']});
look('mara',{skin:'#f0c09a',hair:'#8a3a1e',top:'#5a7a4a',acc:'#e8d8b0',bot:'#4a5a3a',style:['long','dress']});
look('bren',{skin:'#d8a07a',hair:'#5a3a22',top:'#7a5a3a',acc:'#c8b48a',bot:'#3a3a40',boot:'#3a2a1a',style:['short','beard','o-vest']});
look('wynn',{skin:'#f2c39b',hair:'#c8902e',top:'#2f7a7a',acc:'#e8d8a0',bot:'#3a3a4e',style:['pony']});
look('garrow',{skin:'#e0b090',hair:'#a8a8b0',top:'#2f4a6a',acc:'#c8b070',bot:'#2a2e3a',boot:'#2a2018',hwc:'#1e2a3a',style:['short','mustache','hw-cap','o-coat']});
look('nell',{skin:'#f0c8a8',hair:'#e0e0e8',top:'#8a5a8a',bot:'#5a3a5a',style:['bun','dress']});
look('tam',{skin:'#e8b48a',hair:'#3a2a1a',top:'#c86a3a',bot:'#3a4a6a',style:['curly']});
look('hale',{skin:'#c88a64',hair:'#c8902e',top:'#6a5a3a',acc:'#e0d0a0',bot:'#3a3a2a',style:['short','stubble']});
look('stranger',{skin:'#e8e4e0',hair:'#18141c',top:'#24222c',acc:'#4a4656',bot:'#18161e',boot:'#121016',hwc:'#1a1820',eye:'#c8d8e8',style:['short','hw-hood','o-coat']});
look('rook',{skin:'#d8a880',hair:'#d8d8e0',top:'#2a2a30',acc:'#8a2a2a',bot:'#222228',boot:'#1a1414',hwc:'#1e1e24',eye:'#5a3a2a',style:['bun','o-coat']});
look('jun',{skin:'#e8c09a',hair:'#141018',top:'#2a3a34',acc:'#3a8a7a',bot:'#1e2224',boot:'#1a1614',eye:'#3a2a20',hilt:'#8a8a9a',ostyle:'coat',blade:'knives',hw:'none',style:['messy','o-coat']});
look('moss',{skin:'#c88a64',hair:'#4a2e1a',top:'#7a2a24',acc:'#d8c8a8',bot:'#3a3428',boot:'#2a2018',eye:'#3a4a2a',hilt:'#7a5a3a',ostyle:'vest',blade:'axe',style:['bald','beard','o-vest']});
look('pike',{skin:'#d8a07a',hair:'#6a3a20',top:'#3a3a34',acc:'#8a2a2a',bot:'#2a2a24',hwc:'#2a2a30',style:['short','hw-bandana']});
look('wick',{skin:'#e0b090',hair:'#8a8a8a',top:'#5a4a3a',acc:'#c8b070',bot:'#3a2e26',style:['bald','mustache']});
look('sprout',{skin:'#f2c39b',hair:'#e0b040',top:'#3a4a2a',bot:'#3a3428',style:['messy']});
look('crow1',{skin:'#c8906a',hair:'#1e1a1a',top:'#2e2e30',acc:'#8a2a2a',bot:'#222224',hwc:'#2a2a30',style:['short','hw-hood']});
look('crow2',{skin:'#e0b090',hair:'#5a2a1a',top:'#3a2e2a',acc:'#c8a050',bot:'#2a2420',style:['long']});
look('tollg',{skin:'#d8a07a',hair:'#3a2a20',top:'#8a2430',acc:'#c8ccd8',bot:'#2a1a1a',style:['helm']});
look('garrickF',{skin:'#d0946a',hair:'#3a2418',top:'#8a7450',acc:'#d8c8b0',bot:'#3a2a1e',boot:'#2a1e14',style:['hat','beard','o-coat']});
look('kellF',{skin:'#e0b090',hair:'#5a4a3a',top:'#8a2430',acc:'#c8ccd8',bot:'#3a3e4a',boot:'#5a5a60',hwc:'#9aa4b8',ostyle:'armor',style:['short','hw-helmet','o-armor','cape'],cape:'#6a1218'});
look('townsman',{skin:'#e0b090',hair:'#5a3a20',top:'#6a6a4a',bot:'#3a3a30',style:['short','stubble']});
look('townwoman',{skin:'#d8a07a',hair:'#2a1e18',top:'#a8743f',bot:'#5a3a2a',style:['bun','dress']});
look('debtor',{skin:'#d8b090',hair:'#7a6a5a',top:'#6a6058',bot:'#4a4440',style:['short','beard']});

/* Moss's axe on his big battle sprite: a long haft and a wide bit on one side */
const _heroBig0=heroBig;
heroBig=function(look,pose){if(look.blade!=='axe')return _heroBig0(look,pose);const key=look.id+'|'+pose;if(bigCache.has(key))return bigCache.get(key);
  const c=_heroBig0({...look,blade:'fork',id:look.id+'~ax'},pose);const g2=c.getContext('2d');
  // paint over the three tines with an axe head: find where the fork ends by redrawing a head at the same tip
  const P0={idle:{h:[10.5,26.5],a:-112},raise:{h:[19.5,2.5],a:-32},strike:{h:[6.5,24.5],a:168}}[pose]||{h:[10.5,26.5],a:-112};
  const d=[Math.cos(P0.a*Math.PI/180),Math.sin(P0.a*Math.PI/180)],n=[-d[1],d[0]],G=[P0.h[0]+d[0]*2.4,P0.h[1]+d[1]*2.4],T=[G[0]+d[0]*21,G[1]+d[1]*21];
  const X=x=>x+BIG.ox,Y=y=>y+BIG.oy;const pts=[[T[0]-d[0]*1,T[1]-d[1]*1],[T[0]+n[0]*5.6-d[0]*2.6,T[1]+n[1]*5.6-d[1]*2.6],[T[0]+n[0]*6.4+d[0]*3.6,T[1]+n[1]*6.4+d[1]*3.6],[T[0]+d[0]*3,T[1]+d[1]*3]];
  const head=sculpt(BIG.W,BIG.H,[Pl(pts.map(([x,y])=>[X(x),Y(y)]),'steel',{b:.1}),Cp(X(T[0]+n[0]*6.2-d[0]*2),Y(T[1]+n[1]*6.2-d[1]*2),X(T[0]+n[0]*6.6+d[0]*3),Y(T[1]+n[1]*6.6+d[1]*3),.35,null,{flat:'#ffffff',noEdge:1})]);
  // clear the tines, keep the haft
  g2.save();g2.globalCompositeOperation='destination-out';for(const k of [-1.7,1.7]){g2.beginPath();g2.arc(X(T[0]+n[0]*k+d[0]*3),Y(T[1]+n[1]*k+d[1]*3),2.6,0,Math.PI*2);g2.fill()}g2.restore();
  g2.drawImage(head,0,0);bigCache.set(key,c);return c};
