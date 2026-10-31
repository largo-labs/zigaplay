/* ================= the game's content: party, arts, items, enemies, places ================= */
/* ---------- the party ---------- */
const CHARS={
 hero:{n:'Hero',base:{hp:62,mp:18,atk:10,mag:8,def:8,spd:10},grow:{hp:9.5,mp:2.6,atk:1.7,mag:1.5,def:1.35,spd:.75}},
 mira:{n:'Mira',base:{hp:50,mp:30,atk:7,mag:12,def:6,spd:10},grow:{hp:7.8,mp:3.8,atk:1.2,mag:2.1,def:1.1,spd:.75},
  look:{skin:'Peach',eyes:'Sparkle',eyeC:'Violet',brows:'Soft',mouth:'Smile',hair:'Long Straight',hairC:'Plum',hat:'None',top:'Sorcerer Robe',topC1:'Plum',topC2:'Gold',bot:'Long Skirt',botC1:'Navy',shoes:'Boots',shoeC:'Chocolate',back:'None',face:'Round Glasses',faceC:'Gold'},
  weapon:{kind:'grimoire',name:'Ink & Ember',c1:'Plum',c2:'Gold',parts:{Symbol:'Moon',Clasp:'Lock',Corners:'Metal',Binding:'Leather'}}},
 bram:{n:'Bram',base:{hp:78,mp:12,atk:13,mag:4,def:12,spd:7},grow:{hp:11.5,mp:1.6,atk:2.0,mag:.8,def:1.8,spd:.55},
  look:{skin:'Bronze',eyes:'Sharp',eyeC:'Brown',brows:'Thick',mouth:'Calm',hair:'Buzz Cut',hairC:'Black',hat:'None',top:'Breastplate',topC1:'Steel',topC2:'Royal',bot:'Greaves',botC1:'Steel',shoes:'Sabatons',shoeC:'Steel',back:'Short Cape',backC1:'Royal',backC2:'Gold',face:'Full Beard',faceC:'Black'},
  weapon:{kind:'warhammer',name:'Gatekeeper',parts:{Head:'Block',Haft:'Iron',Top:'Spike',Wrap:'Leather',Charm:'None'}}},
 kit:{n:'Kit',base:{hp:56,mp:20,atk:11,mag:8,def:7,spd:14},grow:{hp:8.6,mp:2.6,atk:1.8,mag:1.4,def:1.2,spd:1.0},
  look:{skin:'Fair',eyes:'Cat',eyeC:'Amber',brows:'Angled',mouth:'Fang',hair:'Messy',hairC:'Orange',hat:'Fox Ears',hatC1:'Orange',hatC2:'Cream',top:'Ranger Vest',topC1:'Forest',topC2:'Tan',bot:'Ranger Trousers',botC1:'Leather',botC2:'Tan',shoes:'Tall Boots',shoeC:'Chocolate',back:'Fox Tail',backC1:'Orange',face:'Cheek Marks',faceC:'Rust'},
  weapon:{kind:'bow',name:'Foxfire',parts:{Limbs:'Recurve',Tips:'Feathers',Grip:'Wrapped',Charm:'Feather'},c4:'Orange'}},
};
const MAXLV=40;
/* ---------- roles, the wish roster and who works well together ---------- */
const ROLES={tank:{n:'Tank',s:'T',c:'#7ab8ff'},healer:{n:'Healer',s:'H',c:'#8aff9a'},dps:{n:'DPS',s:'D',c:'#ff9a7a'}};
Object.assign(CHARS.hero,{role:'dps'});Object.assign(CHARS.mira,{role:'dps'});Object.assign(CHARS.bram,{role:'tank'});Object.assign(CHARS.kit,{role:'dps'});
const _T={tank:[{hp:80,mp:12,atk:12,mag:4,def:13,spd:7},{hp:11.8,mp:1.6,atk:1.9,mag:.8,def:1.85,spd:.55}],
  healer:[{hp:52,mp:28,atk:4,mag:13,def:6,spd:9},{hp:7.6,mp:3.6,atk:.7,mag:2.2,def:1.1,spd:.7}],
  dps:[{hp:58,mp:18,atk:12,mag:5,def:7,spd:12},{hp:8.6,mp:2.4,atk:1.95,mag:.9,def:1.15,spd:.9}]};
function mkChar(id,n,role,rar,look,weapon){const k=rar===5?1.07:1,[b,g]=_T[role],sc=o=>Object.fromEntries(Object.entries(o).map(([a,v])=>[a,a==='hp'||a==='mp'?v:+(v*k).toFixed(2)]));
  CHARS[id]={n,role,rar,base:sc(b),grow:sc(g),look,weapon}}
mkChar('ferro','Ferro','tank',4,{skin:'Umber',eyes:'Fierce',eyeC:'Brown',brows:'Thick',mouth:'Calm',hair:'Locs',hairC:'Black',hat:'Spartan Helm',hatC1:'Bronze',top:'Full Plate',topC1:'Steel',topC2:'Crimson',bot:'Greaves',botC1:'Steel',shoes:'Sabatons',shoeC:'Steel',back:'Long Cape',backC1:'Crimson',face:'Scar',faceC:'Maroon'},{kind:'greatsword',name:'Ironwall',c1:'Steel',c2:'Bronze'});
mkChar('hildr','Hildr','tank',4,{skin:'Fair',eyes:'Sharp',eyeC:'Sky',brows:'Angled',mouth:'Smirk',hair:'Braid',hairC:'Blonde',hat:'Winged Helm',hatC1:'Silver',hatC2:'Gold',top:'Chainmail',topC1:'Silver',topC2:'Navy',bot:'Kilt',botC1:'Forest',shoes:'Tall Boots',shoeC:'Brown',back:'Shield',backC1:'Royal',backC2:'Gold',face:'War Paint',faceC:'Sky'},{kind:'warhammer',name:'Aegis Maul',c1:'Slate',c2:'Gold'});
mkChar('gorm','Gorm','tank',5,{skin:'Bronze',eyes:'Fierce',eyeC:'Amber',brows:'Thick',mouth:'Grin',hair:'Mohawk',hairC:'Crimson',hat:'Viking Helm',hatC1:'Steel',top:'Leather Armor',topC1:'Brown',topC2:'Rust',bot:'Leather Pants',botC1:'Chocolate',shoes:'Boots',shoeC:'Brown',back:'Tattered Cape',backC1:'Maroon',face:'Full Beard',faceC:'Ginger'},{kind:'greataxe',name:'Mountainsplit',c1:'Steel',c2:'Bronze'});
mkChar('lumi','Lumi','healer',4,{skin:'Porcelain',eyes:'Sparkle',eyeC:'Mint',brows:'Soft',mouth:'Smile',hair:'Twintails',hairC:'Pink',hat:'Halo',hatC1:'Gold',top:'Priest Vestment',topC1:'White',topC2:'Gold',bot:'Long Skirt',botC1:'White',shoes:'Mary Janes',shoeC:'White',back:'Fairy Wings',backC1:'Mint'},{kind:'staff',name:'Dawnlight',c1:'Gold',c2:'Gold'});
mkChar('sana','Sana','healer',4,{skin:'Honey',eyes:'Happy',eyeC:'Brown',brows:'Soft',mouth:'Smile',hair:'Long Straight',hairC:'Black',hat:'Flower Crown',hatC1:'Rose',hatC2:'Lemon',top:'Kimono',topC1:'Sakura',topC2:'White',bot:'Hakama',botC1:'Lilac',shoes:'Geta',shoeC:'Chocolate'},{kind:'staff',name:'Blossom Rod',c1:'Rose',c2:'Gold'});
mkChar('olive','Olive','healer',5,{skin:'Tan',eyes:'Sleepy',eyeC:'Forest',brows:'Soft',mouth:'Calm',hair:'Wavy',hairC:'Forest',hat:'Laurel Wreath',hatC1:'Green',top:'Mage Robe',topC1:'Forest',topC2:'Gold',bot:'Wrap Skirt',botC1:'Teal',shoes:'Sandals',shoeC:'Tan',back:'Butterfly Wings',backC1:'Lime'},{kind:'staff',name:'Verdant Crown',c1:'Forest',c2:'Gold'});
mkChar('vex','Vex','dps',4,{skin:'Fair',eyes:'Cat',eyeC:'Violet',brows:'Angled',mouth:'Smirk',hair:'Undercut',hairC:'Platinum',top:'Ninja Garb',topC1:'Charcoal',topC2:'Crimson',bot:'Leggings',botC1:'Black',shoes:'Ninja Tabi',shoeC:'Charcoal',face:'Ninja Mask',faceC:'Charcoal'},{kind:'dual',name:'Twin Eclipse',c1:'Platinum',c4:'Violet'});
mkChar('juno','Juno','dps',4,{skin:'Peach',eyes:'Fierce',eyeC:'Amber',brows:'Angled',mouth:'Grin',hair:'Ponytail',hairC:'Ginger',hat:'Headband',hatC1:'Red',top:'Tank Top',topC1:'Crimson',topC2:'White',bot:'Shorts',botC1:'Charcoal',shoes:'Sneakers',shoeC:'Crimson'},{kind:'fists',name:'Sunbreakers',c1:'Steel',c2:'Gold'});
mkChar('taro','Taro','dps',5,{skin:'Tan',eyes:'Sharp',eyeC:'Brown',brows:'Angled',mouth:'Calm',hair:'Top Knot',hairC:'Black',top:'Samurai Armor',topC1:'Crimson',topC2:'Charcoal',bot:'Hakama',botC1:'Charcoal',shoes:'Geta',shoeC:'Chocolate',back:'Long Scarf',backC1:'Crimson'},{kind:'katana',name:'Moonpetal',c1:'Platinum',c2:'Brass'});
mkChar('cass','Cass','dps',4,{skin:'Ebony',eyes:'Star',eyeC:'Gold',brows:'Soft',mouth:'Grin',hair:'Afro',hairC:'Black',hat:'Witch Hat',hatC1:'Purple',hatC2:'Gold',top:'Mage Robe',topC1:'Purple',topC2:'Gold',bot:'Long Skirt',botC1:'Plum',shoes:'Boots',shoeC:'Brown'},{kind:'grimoire',name:'Night Tome',c1:'Navy',c2:'Silver',parts:{Symbol:'Moon'}});
mkChar('tilda','Tilda','tank',4,{skin:'Honey',eyes:'Round',eyeC:'Brown',brows:'Thick',mouth:'Smile',hair:'Ponytail',hairC:'Copper',hat:'Knight Helm',hatC1:'Silver',top:'Breastplate',topC1:'Silver',topC2:'Teal',bot:'Greaves',botC1:'Silver',shoes:'Knight Greaves',shoeC:'Silver',back:'Shield',backC1:'Teal',backC2:'Gold'},{kind:'warhammer',name:'Clocktower',c1:'Slate',c2:'Brass'});
mkChar('orrin','Orrin','tank',4,{skin:'Peach',eyes:'Sleepy',eyeC:'Azure',brows:'Soft',mouth:'Calm',hair:'Short Crop',hairC:'Ash',hat:'None',top:'Full Plate',topC1:'Slate',topC2:'Royal',bot:'Greaves',botC1:'Slate',shoes:'Sabatons',shoeC:'Slate',back:'Royal Cape',backC1:'Royal',backC2:'Gold',face:'Mustache',faceC:'Ash'},{kind:'greatsword',name:'Quiet Bastion',c1:'Slate',c2:'Gold'});
mkChar('mei','Mei','healer',4,{skin:'Peach',eyes:'Happy',eyeC:'Brown',brows:'Soft',mouth:'Grin',hair:'Twin Buns',hairC:'Black',hat:'Ribbon Bow',hatC1:'Pink',top:'Dress',topC1:'Sky',topC2:'White',bot:'Pleated Skirt',botC1:'Navy',shoes:'Loafers',shoeC:'Chocolate'},{kind:'staff',name:'Teahouse Cane',c1:'Brown',c2:'Gold'});
mkChar('bel','Bel','healer',5,{skin:'Porcelain',eyes:'Sparkle',eyeC:'Lavender',brows:'Soft',mouth:'Smile',hair:'Very Long',hairC:'Platinum',hat:'Tiara',hatC1:'Silver',top:'Ball Gown',topC1:'Lilac',topC2:'Silver',bot:'Long Skirt',botC1:'Lilac',shoes:'Winged Boots',shoeC:'White',back:'Angel Wings',backC1:'White'},{kind:'staff',name:'Moonwell',c1:'Silver',c2:'Gold'});
mkChar('thea','Thea','healer',4,{skin:'Umber',eyes:'Sleepy',eyeC:'Forest',brows:'Soft',mouth:'Calm',hair:'Bun',hairC:'Silver',hat:'Hood',hatC1:'Forest',top:'Tunic',topC1:'Forest',topC2:'Cream',bot:'Pants',botC1:'Brown',shoes:'Boots',shoeC:'Brown',back:'Backpack',backC1:'Tan',face:'Round Glasses',faceC:'Gold'},{kind:'staff',name:'Herbalist Branch',c1:'Brown',c2:'Forest'});
mkChar('dax','Dax','dps',4,{skin:'Tan',eyes:'Sharp',eyeC:'Brown',brows:'Angled',mouth:'Smirk',hair:'Messy',hairC:'Brown',hat:'Cowboy Hat',hatC1:'Leather',top:'Vest',topC1:'Brown',topC2:'Tan',bot:'Jeans',botC1:'Azure',shoes:'Cowboy Boots',shoeC:'Leather',face:'Stubble',faceC:'Brown'},{kind:'bow',name:'Dustwind',c1:'Leather',c4:'Forest'});
mkChar('rue','Rue','dps',5,{skin:'Fair',eyes:'Fierce',eyeC:'Red',brows:'Angled',mouth:'Fang',hair:'Wolf Cut',hairC:'Black',top:'Kimono',topC1:'Crimson',topC2:'Black',bot:'Hakama',botC1:'Black',shoes:'Geta',shoeC:'Charcoal',face:'Domino Mask',faceC:'Crimson'},{kind:'dual',name:'Crimson Twins',c1:'Steel',c5:'Steel',c4:'Crimson',glow:'Red',gemC:'Crimson'});
mkChar('zed','Zed','dps',4,{skin:'Bronze',eyes:'Wide',eyeC:'Azure',brows:'Thick',mouth:'Grin',hair:'Tall Spikes',hairC:'Azure',top:'Leather Jacket',topC1:'Black',topC2:'Silver',bot:'Cargo Pants',botC1:'Olive',shoes:'Boots',shoeC:'Black',back:'Short Cape',backC1:'Azure'},{kind:'sword',name:'Stormcaller',c1:'Steel',c2:'Azure'});
mkChar('brisa','Brisa','dps',4,{skin:'Honey',eyes:'Fierce',eyeC:'Amber',brows:'Thick',mouth:'Grin',hair:'Wild Mane',hairC:'Ginger',top:'Tank Top',topC1:'Rust',topC2:'White',bot:'Shorts',botC1:'Brown',shoes:'Sandals',shoeC:'Tan',face:'War Paint',faceC:'Red'},{kind:'greataxe',name:'Cinderfang',c1:'Steel',c2:'Rust'});
/* every character fights with an element: when two different ones meet on an enemy they react */
for(const[id,e]of Object.entries({hero:'Bolt',mira:'Fire',bram:'Geo',kit:'Dendro',ferro:'Ice',hildr:'Bolt',gorm:'Fire',tilda:'Geo',orrin:'Ice',lumi:'Bolt',sana:'Dendro',olive:'Geo',mei:'Fire',bel:'Ice',thea:'Dendro',vex:'Bolt',juno:'Fire',taro:'Ice',cass:'Dendro',dax:'Geo',rue:'Fire',zed:'Bolt',brisa:'Fire'}))CHARS[id].el=e;
const innateEl=m=>(CHARS[m.id]||{}).el||null;
const RX={'Fire+Ice':{n:'Melt',m:2.2,c:'#ffd2a0'},'Bolt+Fire':{n:'Overload',m:1.5,aoe:.7,c:'#ff9a3a'},'Dendro+Fire':{n:'Burning',m:1.5,st:'burn',c:'#ff8a3a'},'Fire+Geo':{n:'Magma Burst',m:1.7,aoe:.5,c:'#ff7a2a'},
  'Bolt+Ice':{n:'Superconduct',m:1.4,st:'defDown',c:'#d8c8ff'},'Dendro+Ice':{n:'Frostbloom',m:1.3,stun:1,c:'#b8f0e0'},'Geo+Ice':{n:'Shatter',m:2,c:'#cfeaff'},
  'Bolt+Dendro':{n:'Quicken',m:1.8,c:'#a8ff9a'},'Bolt+Geo':{n:'Crystallize',m:1.3,ally:'defUp',c:'#ffe49a'},'Dendro+Geo':{n:'Petrify',m:1.2,stun:2,c:'#d8c070'},'Holy+Shadow':{n:'Eclipse',m:3,aoe:.8,c:'#ffeaff'}};
const rxKey=(a,b)=>[a,b].sort().join('+');
function reactionsFor(P){const out=[];for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=innateEl(P[i]),b=innateEl(P[j]),R=a&&b&&a!==b?RX[rxKey(a,b)]:null;if(R)out.push({n:R.n,c:R.c,who:`${P[i].name} (${a}) + ${P[j].name} (${b})`})}return out}
const WISH_IDS=['ferro','hildr','gorm','tilda','orrin','lumi','sana','olive','mei','bel','thea','vex','juno','taro','cass','dax','rue','zed','brisa'];
const WISH={cost:100,pity:30,rate5:.06,dupe:50};
/* pairs that fight better side by side: a tank with a healer, a healer with a damage dealer, a tank with a damage dealer */
const SYN=[
 {n:"Gatekeeper's Prayer",ids:['bram','lumi'],b:{bram:{def:.14},lumi:{mag:.12}}},
 {n:'Ember Ward',ids:['bram','mira'],b:{bram:{hp:.1},mira:{mag:.12}}},
 {n:'Shield and Sword',ids:['bram','hero'],b:{bram:{def:.1},hero:{atk:.1}}},
 {n:'Fox and Fawn',ids:['kit','sana'],b:{kit:{spd:.12},sana:{spd:.1}}},
 {n:'Ironwall Vow',ids:['ferro','sana'],b:{ferro:{def:.16},sana:{mag:.12}}},
 {n:'Hearth and Hammer',ids:['hildr','olive'],b:{hildr:{hp:.12},olive:{mag:.12}}},
 {n:'Mountain Pact',ids:['gorm','juno'],b:{gorm:{atk:.1},juno:{atk:.12}}},
 {n:'Blade in the Light',ids:['lumi','hero'],b:{lumi:{mag:.1},hero:{atk:.12}}},
 {n:'Moonlit Bloom',ids:['olive','cass'],b:{olive:{mag:.1},cass:{mag:.14}}},
 {n:'Veil and Vow',ids:['sana','vex'],b:{sana:{spd:.08},vex:{atk:.12}}},
 {n:'Petal Guard',ids:['hildr','taro'],b:{hildr:{def:.12},taro:{atk:.14}}},
 {n:'Cinder Bulwark',ids:['gorm','cass'],b:{gorm:{hp:.12},cass:{mag:.12}}},
 {n:"Hunter's Rest",ids:['ferro','kit'],b:{ferro:{hp:.1},kit:{atk:.12}}},
 {n:'Grove Song',ids:['lumi','kit'],b:{lumi:{spd:.1},kit:{atk:.1}}},
 {n:'Clockwork Guard',ids:['tilda','mei'],b:{tilda:{def:.14},mei:{mag:.12}}},
 {n:'Quiet Watch',ids:['orrin','thea'],b:{orrin:{hp:.12},thea:{spd:.1}}},
 {n:'Frontier Bond',ids:['tilda','dax'],b:{tilda:{hp:.1},dax:{atk:.12}}},
 {n:'Crimson Vow',ids:['orrin','rue'],b:{orrin:{def:.1},rue:{atk:.14}}},
 {n:'Starlit Shield',ids:['bel','tilda'],b:{bel:{mag:.14},tilda:{def:.12}}},
 {n:'Lantern and Edge',ids:['mei','zed'],b:{mei:{spd:.08},zed:{atk:.12}}},
 {n:'Greenwood Oath',ids:['thea','dax'],b:{thea:{mag:.1},dax:{atk:.12}}},
 {n:'Moon and Blades',ids:['bel','rue'],b:{bel:{mag:.1},rue:{atk:.16}}},
 {n:'Hearthfire',ids:['orrin','brisa'],b:{orrin:{def:.1},brisa:{atk:.12}}},
 {n:'Stormhold',ids:['tilda','zed'],b:{tilda:{hp:.1},zed:{spd:.1}}},
 {n:'Herb and Hammer',ids:['hildr','thea'],b:{hildr:{def:.1},thea:{mag:.1}}},
 {n:'Sunlit Duet',ids:['mei','juno'],b:{mei:{mag:.1},juno:{atk:.12}}},
 {n:'Ashen Pact',ids:['gorm','brisa'],b:{gorm:{hp:.1},brisa:{atk:.1}}},
 {n:'Twin Fangs',ids:['vex','rue'],b:{vex:{spd:.12},rue:{spd:.12}}}];
const roleOf=m=>(CHARS[m.id]||CHARS.hero).role||'dps';
const allMembers=()=>G.party.concat(G.roster||[]);
const hero=()=>allMembers().find(m=>m.id==='hero')||G.party[0];
const owned=id=>allMembers().some(m=>m.id===id);
const avgLv=()=>Math.max(1,Math.round(allMembers().reduce((a,m)=>a+m.lv,0)/allMembers().length));
const wishes=()=>Math.floor((G.gems||0)/WISH.cost);
/* the bonuses the party in front of you is getting right now */
function synActive(P){const ids=P.map(x=>x.id),out=[];if(new Set(P.map(roleOf)).size===3)out.push({n:'Balanced party',t:'Tank + Healer + DPS: everyone +8% HP, +6% DEF',all:{hp:.08,def:.06}});
  for(const y of SYN)if(y.ids.every(i=>ids.includes(i)))out.push({n:y.n,t:Object.entries(y.b).map(([i,o])=>`${CHARS[i].n} ${Object.entries(o).map(([k,v])=>`+${Math.round(v*100)}% ${k.toUpperCase()}`).join(', ')}`).join(' · '),b:y.b});return out}
function synOf(m){if(typeof G==='undefined'||!G||!G.party)return{};const P=G.party.slice(0,3);if(!P.includes(m))return{};const out={},add=(k,v)=>out[k]=(out[k]||0)+v;
  for(const y of synActive(P)){for(const[k,v]of Object.entries(y.all||{}))add(k,v);for(const[k,v]of Object.entries((y.b||{})[m.id]||{}))add(k,v)}return out}
const gainCP=(u,n)=>{BT.cp=Math.min(BT.cpMax,BT.cp+n);num(u,'+'+n+' CP','mp');SND.fx('buff')};
const needXP=L=>Math.round(12*L*L+20*L);
/* ---------- weapon arts: [id, name, mp, level, target, kind, power, extra] ---------- */
const A=(id,n,mp,lv,tgt,kind,pow,x={})=>Object.assign({id,n,mp,lv,tgt,kind,pow},x);
const ARTS={
 sword:{label:'Sword Arts',list:[A('slash','Keen Slash',3,1,'one','phys',1.6),A('parry','Parry',3,4,'self','buff',0,{st:'counter',turns:2,desc:'Counter the next hit'}),A('rally','Rally Cry',6,8,'party','buff',0,{st:'atkUp',turns:3}),A('dance','Blade Dance',8,13,'rand','phys',.85,{hits:4}),A('dawn','Dawn Strike',12,19,'one','phys',3,{elem:'Holy'})],
  limit:A('lsword','Radiant Edge',0,1,'one','phys',5.5,{elem:'Holy',after:'regen'})},
 greatsword:{label:'Greatsword Arts',list:[A('cleave','Cleave',5,1,'all','phys',1.05),A('brace','Brace',4,4,'self','buff',0,{st:'defUp',turns:3}),A('gbreak','Guard Break',6,8,'one','phys',1.4,{st:'defDown',turns:3,chance:1}),A('titan','Titan Fall',10,13,'all','phys',1.6),A('rend','Earthrend',14,19,'one','phys',3.4)],
  limit:A('lgreat','Worldsplitter',0,1,'all','phys',3.2)},
 katana:{label:'Iaido',list:[A('iai','Iai Cut',4,1,'one','phys',1.5,{crit:.4}),A('focus','Focus',3,4,'self','buff',0,{st:'focus',turns:2}),A('moon','Moonslice',6,8,'one','phys',1.3,{st:'bleed',turns:3,chance:.9}),A('flash','Flash Step',5,13,'one','phys',1.25,{refund:.6}),A('thousand','Thousand Cuts',13,19,'one','phys',.6,{hits:6,crit:.15})],
  limit:A('lkatana','Petal Storm',0,1,'all','phys',.95,{hits:4,crit:.25})},
 dual:{label:'Twin Arts',list:[A('fang','Twin Fang',4,1,'one','phys',.9,{hits:2}),A('whirl','Whirlwind',7,4,'all','phys',.62,{hits:2}),A('shade','Shadow Step',5,8,'self','buff',0,{st:'evade',turns:3}),A('cross','Crossfire',9,13,'one','phys',.75,{hits:4}),A('tempest','Tempest',14,19,'all','phys',.62,{hits:4})],
  limit:A('ldual','Steel Tempest',0,1,'all','phys',.62,{hits:7})},
 greataxe:{label:'Axe Arts',list:[A('rend2','Rend',4,1,'one','phys',1.3,{st:'bleed',turns:3,chance:.9}),A('berserk','Berserk',5,4,'self','buff',0,{st:'berserk',turns:3}),A('split','Earthsplit',8,8,'all','phys',1.2),A('exec','Executioner',10,13,'one','phys',2,{execute:1}),A('bloodmoon','Blood Moon',15,19,'all','phys',2.1)],
  limit:A('laxe','Ragnarend',0,1,'all','phys',3.4)},
 warhammer:{label:'Hammer Arts',list:[A('stun','Stun Smash',5,1,'one','phys',1.3,{st:'stun',turns:1,chance:.5}),A('mend','Mend',4,3,'ally','heal',.3,{pct:1}),A('guardup','Guard Up',6,4,'party','buff',0,{st:'defUp',turns:3}),A('quake','Quake',8,8,'all','phys',1,{st:'stun',turns:1,chance:.2}),A('shatter','Shatter',7,13,'one','phys',1.2,{st:'defDown',turns:3,chance:1}),A('mountain','Mountainfall',15,19,'all','phys',2.2)],
  limit:A('lhammer','Skybreaker',0,1,'all','phys',3,{st:'stun',turns:1,chance:.6})},
 bow:{label:'Shots',list:[A('aim','Aimed Shot',3,1,'one','phys',1.8,{sure:1}),A('volley','Volley',6,4,'all','phys',.9),A('poison','Venom Arrow',5,8,'one','phys',1.1,{st:'poison',turns:4,chance:.95}),A('pin','Pinning Shot',6,13,'one','phys',1.1,{st:'slow',turns:3,chance:.9}),A('starfall','Starfall',14,19,'all','phys',1.7,{elem:'Holy'})],
  limit:A('lbow','Comet Rain',0,1,'all','phys',.95,{hits:3})},
 fists:{label:'Techniques',list:[A('flurry','Flurry',4,1,'one','phys',.45,{hits:4}),A('chi','Chi Heal',5,4,'self','heal',.35,{pct:1}),A('tiger','Tiger Kick',6,8,'one','phys',1.6,{st:'stun',turns:1,chance:.3}),A('cstance','Counter Stance',4,13,'self','buff',0,{st:'counter',turns:3}),A('dragon','Dragon Rush',12,19,'one','phys',3)],
  limit:A('lfists','Hundred Fists',0,1,'one','phys',.6,{hits:10})},
 staff:{label:'Prayers',list:[A('cure','Cure',4,1,'ally','heal',1.4),A('holy','Holy',6,3,'one','mag',1.6,{elem:'Holy'}),A('cura','Cura All',10,7,'party','heal',.9),A('haste','Haste',8,11,'ally','buff',0,{st:'haste',turns:4}),A('raise','Raise',14,15,'dead','heal',0,{revive:.5}),A('regen','Regen',9,20,'party','buff',0,{st:'regen',turns:4})],
  limit:A('lstaff','Sanctuary',0,1,'party','heal',99,{pct:1,after:'regen',revive:.5})},
 grimoire:{label:'Spells',list:[A('fire','Fire',4,1,'one','mag',1.5,{elem:'Fire'}),A('ice','Ice',4,2,'one','mag',1.5,{elem:'Ice'}),A('bolt','Bolt',4,3,'one','mag',1.5,{elem:'Bolt'}),A('drain','Drain',7,6,'one','mag',1.3,{elem:'Shadow',drain:.5}),
   A('firestorm','Firestorm',10,9,'all','mag',1.15,{elem:'Fire'}),A('blizzard','Blizzard',10,12,'all','mag',1.15,{elem:'Ice'}),A('thunder','Thunderstorm',10,15,'all','mag',1.15,{elem:'Bolt'}),A('meteor','Meteor',22,22,'all','mag',2.2)],
  limit:A('lgrim','Arcanum Nova',0,1,'all','mag',3.2)},
};
const STATUS={poison:{n:'Poison',c:'#9ae050',bad:1},burn:{n:'Burn',c:'#ff8a3a',bad:1},bleed:{n:'Bleed',c:'#ff4a5a',bad:1},stun:{n:'Stun',c:'#ffe04a',bad:1},slow:{n:'Slow',c:'#a0a0ff',bad:1},
  defDown:{n:'Def -',c:'#ff9a9a',bad:1},atkDown:{n:'Atk -',c:'#ff9a9a',bad:1},haste:{n:'Haste',c:'#8affff'},atkUp:{n:'Atk +',c:'#ffd86a'},defUp:{n:'Def +',c:'#8ad0ff'},regen:{n:'Regen',c:'#8aff9a'},
  counter:{n:'Counter',c:'#ffffff'},evade:{n:'Evade',c:'#c8a8ff'},focus:{n:'Focus',c:'#ffe8a0'},berserk:{n:'Berserk',c:'#ff6a6a'}};
/* ---------- things to carry ---------- */
const ITEMS={
 potion:{n:'Potion',price:30,desc:'Heals 60 HP.',use:'heal',amt:60,tgt:'ally'},
 hipotion:{n:'Hi-Potion',price:120,desc:'Heals 250 HP.',use:'heal',amt:250,tgt:'ally'},
 megapotion:{n:'Mega Potion',price:420,desc:'Heals 800 HP.',use:'heal',amt:800,tgt:'ally'},
 ether:{n:'Ether',price:90,desc:'Gives the party 1 CP in battle.',use:'mp',amt:25,tgt:'ally'},
 hiether:{n:'Hi-Ether',price:320,desc:'Gives the party 4 CP in battle.',use:'mp',amt:80,tgt:'ally'},
 elixir:{n:'Elixir',price:0,desc:'Fully restores HP and MP.',use:'full',tgt:'ally',rare:1},
 feather:{n:'Revive Feather',price:150,desc:'Revives a fallen ally with a third of their HP.',use:'revive',amt:.33,tgt:'dead'},
 remedy:{n:'Remedy',price:45,desc:'Cures poison, burns, bleeding, stun and slow.',use:'cure',tgt:'ally'},
 firebomb:{n:'Fire Flask',price:90,desc:'Fire damage to every foe.',use:'bomb',elem:'Fire',amt:90,tgt:'all'},
 icebomb:{n:'Frost Flask',price:90,desc:'Ice damage to every foe.',use:'bomb',elem:'Ice',amt:90,tgt:'all'},
 boltbomb:{n:'Storm Flask',price:90,desc:'Lightning damage to every foe.',use:'bomb',elem:'Bolt',amt:90,tgt:'all'},
 smoke:{n:'Smoke Bomb',price:60,desc:'Escape from any battle but a boss fight.',use:'flee',tgt:'none'},
 camp:{n:'Camp Kit',price:240,desc:'Rest anywhere outside battle: fully heals the party.',use:'camp',tgt:'none',field:1},
 ore:{n:'Spellsteel Ore',price:0,desc:'Raw spellsteel. A forge turns it into a stronger weapon.',mat:1},
 starsteel:{n:'Starsteel',price:0,desc:'Spellsteel touched by an Ember. Needed for the finest forging.',mat:1},
};
/* charms: worn one at a time, they shape a character */
const CHARMS={
 none:{n:'No charm',desc:''},
 power:{n:'Power Band',price:300,desc:'ATK +15%.',atk:.15},sage:{n:'Sage Bead',price:300,desc:'MAG +15%.',mag:.15},iron:{n:'Iron Charm',price:300,desc:'DEF +20%.',def:.2},
 swift:{n:'Swift Feather',price:350,desc:'SPD +15%.',spd:.15},life:{n:'Life Locket',price:350,desc:'Max HP +20%.',hp:.2},mana:{n:'Mana Locket',price:350,desc:'Max MP +35%.',mp:.35},
 regen:{n:'Regen Ring',price:900,desc:'Slowly heals in battle.',regen:1},hero:{n:'Hero Medal',price:900,desc:'The Limit gauge fills faster.',limit:.6},
 thief:{n:'Thief Glove',price:500,desc:'Foes drop 50% more gold.',gold:.5},wisdom:{n:'Wisdom Pendant',price:700,desc:'30% more experience.',xp:.3},keen:{n:'Keen Eye',price:800,desc:'Criticals 12% more often.',crit:.12},
};
/* ---------- foes: [id, name, art, level, mults {hp,atk,mag,def,mdef,spd}, weak, resist, moves, drops] ---------- */
const FOE={};
function foe(id,n,art,lv,m,weak,res,moves,o={}){FOE[id]=Object.assign({id,n,art,lv,m,weak:weak||[],res:res||[],moves},o)}
/* moves: [weight, action] actions: atk (power), names below */
foe('sprout','Sproutling','sprout',1,{hp:.8,atk:.85},['Fire'],[],[[3,'atk'],[1,'spore']],{pal:0});
foe('wolf','Briar Wolf','wolf',2,{hp:.9,atk:1.05,spd:1.3},['Fire'],[],[[3,'atk'],[1,'bite']],{pal:0});
foe('beetle','Mossback','beetle',2,{hp:1.2,def:1.6,spd:.7},['Bolt'],[],[[3,'atk'],[1,'shell']],{pal:0});
foe('wisp','Ember Wisp','wisp',3,{hp:.7,mag:1.2,mdef:1.4,spd:1.2},['Ice'],['Fire'],[[2,'atk'],[2,'fire']],{pal:0,fly:1});
foe('bandit','Grey Bandit','bandit',3,{hp:1,atk:1.1,spd:1.1},[],[],[[3,'atk'],[1,'steal']],{gold:2,look:'bandit'});
foe('thornmaw','Thornmaw','thornmaw',5,{hp:7.5,atk:1.2,mag:.9,def:1.3,spd:.85},['Fire'],[],[[3,'atk'],[2,'thorns'],[1,'roar'],[1,'spore']],{boss:1,phases:[[.5,'enrage']]});
foe('crab','Shellcrab','crab',6,{hp:1.1,def:1.8,atk:1.1},['Bolt'],['Ice'],[[3,'atk'],[1,'shell']],{pal:0});
foe('jelly','Tide Jelly','jelly',6,{hp:.9,mag:1.2,mdef:1.3},['Bolt'],['Fire'],[[2,'atk'],[2,'soak'],[1,'sting']],{pal:0,fly:1});
foe('imp','Sea Imp','imp',7,{hp:.85,mag:1.3,spd:1.4},['Holy'],[],[[2,'atk'],[2,'ice'],[1,'curse']],{pal:0,fly:1});
foe('drowned','Drowned Knight','skeleton',8,{hp:1.3,atk:1.25,def:1.2},['Holy','Fire'],['Shadow'],[[3,'atk'],[1,'bash']],{pal:0});
foe('harpy','Gull Harpy','harpy',7,{hp:.9,atk:1.05,spd:1.6},['Bolt'],[],[[3,'atk'],[1,'gust']],{pal:0,fly:1});
foe('tidecaller','Tidecaller','serpent',10,{hp:9.5,atk:1.35,mag:1.35,def:1.2,spd:1},['Bolt'],['Ice','Fire'],[[2,'atk'],[2,'wave'],[1,'thunder'],[1,'soak']],{boss:1,phases:[[.5,'enrage']]});
foe('snowwolf','Frost Wolf','wolf',11,{hp:1,atk:1.1,spd:1.35},['Fire'],['Ice'],[[3,'atk'],[1,'bite'],[1,'icebreath']],{pal:1});
foe('frostwisp','Frost Wisp','wisp',12,{hp:.75,mag:1.3,mdef:1.4,spd:1.2},['Fire'],['Ice'],[[2,'atk'],[2,'ice']],{pal:1,fly:1});
foe('yeti','Yeti','yeti',13,{hp:1.6,atk:1.35,def:1.1,spd:.8},['Fire'],['Ice'],[[3,'atk'],[1,'roar'],[1,'icebreath']],{pal:0});
foe('icebat','Glacier Bat','bat',12,{hp:.7,atk:.95,spd:1.7},['Fire'],[],[[3,'atk'],[1,'drain']],{pal:1,fly:1});
foe('golem','Rime Golem','golem',14,{hp:1.6,def:2,atk:1.2,spd:.6},['Fire','Bolt'],['Ice'],[[3,'atk'],[1,'stomp']],{pal:1});
foe('colossus','Rime Colossus','colossus',16,{hp:11,atk:1.45,mag:1.3,def:1.6,spd:.8},['Fire'],['Ice'],[[2,'atk'],[2,'icebreath'],[1,'stomp'],[1,'shell']],{boss:1,phases:[[.5,'enrage']]});
foe('hawk','Thunder Hawk','hawk',17,{hp:.95,atk:1.15,spd:1.6},['Ice'],['Bolt'],[[3,'atk'],[1,'thunder']],{pal:0,fly:1});
foe('elemental','Storm Spirit','elemental',18,{hp:1.1,mag:1.4,mdef:1.5},['Shadow'],['Bolt'],[[2,'atk'],[2,'thunder'],[1,'gust']],{pal:0,fly:1});
foe('clock','Clockwork Guard','clock',18,{hp:1.4,def:1.8,atk:1.25,spd:.9},['Bolt'],['Ice'],[[3,'atk'],[1,'bash'],[1,'shell']],{pal:0});
foe('sparkjelly','Spark Jelly','jelly',17,{hp:.95,mag:1.3,mdef:1.3},['Ice'],['Bolt'],[[2,'atk'],[2,'thunder']],{pal:2,fly:1});
foe('gargoyle','Gargoyle','gargoyle',19,{hp:1.4,def:1.6,atk:1.3},['Holy'],['Bolt'],[[3,'atk'],[1,'stomp'],[1,'gust']],{pal:0,fly:1});
foe('stormwing','Stormwing','roc',21,{hp:12,atk:1.5,mag:1.5,def:1.3,spd:1.3},['Ice'],['Bolt'],[[2,'atk'],[2,'thunder'],[1,'gust'],[1,'roar']],{boss:1,phases:[[.5,'enrage']]});
foe('shade','Grey Shade','wisp',23,{hp:.9,mag:1.45,mdef:1.4,spd:1.3},['Holy'],['Shadow'],[[2,'atk'],[2,'shadow'],[1,'curse']],{pal:2,fly:1});
foe('hollow','Hollow Knight','knight',24,{hp:1.5,atk:1.4,def:1.6,spd:1},['Holy'],['Shadow'],[[3,'atk'],[1,'bash'],[1,'greywave']],{look:'hollow'});
foe('voideye','Void Eye','eye',24,{hp:1.1,mag:1.55,mdef:1.6,spd:1.1},['Holy'],['Shadow'],[[2,'shadow'],[1,'curse'],[1,'drain']],{pal:0,fly:1});
foe('chimera','Grey Chimera','chimera',26,{hp:1.8,atk:1.45,mag:1.3,def:1.3,spd:1.1},['Holy'],[],[[3,'atk'],[1,'fire'],[1,'icebreath'],[1,'roar']],{pal:0});
foe('warden','Grey Warden','knight',27,{hp:11,atk:1.55,mag:1.4,def:1.7,spd:1.05},['Holy'],['Shadow'],[[3,'atk'],[1,'greywave'],[1,'bash'],[1,'roar']],{boss:1,look:'warden',phases:[[.5,'enrage']]});
foe('hollowking','The Hollow King','king',30,{hp:16,atk:1.6,mag:1.7,def:1.7,spd:1.15},['Holy'],['Shadow'],[[2,'atk'],[2,'greywave'],[1,'unmake'],[1,'shadow']],{boss:1,final:1,phases:[[.6,'enrage'],[.3,'despair']]});
/* the numbers for a foe at its level */
function foeStats(F){const L=F.lv,m=F.m,g=k=>m[k]||1;
  return{hp:Math.round((42+L*30)*g('hp')),atk:Math.round((6+L*2.3)*g('atk')),mag:Math.round((5+L*2.1)*g('mag')),def:Math.round((3+L*1.7)*g('def')),mdef:Math.round((3+L*1.5)*g('mdef')),spd:Math.round((8+L*.65)*g('spd')),
    xp:Math.round((8+L*L*1.25)*(F.boss?6:1)),gold:Math.round((6+L*4.5)*(F.gold||1)*(F.boss?5:1))}}
/* what each foe move does */
const FMOVES={
 atk:{n:'Attack',kind:'phys',pow:1},bite:{n:'Bite',kind:'phys',pow:1.4},spore:{n:'Spore Cloud',kind:'mag',pow:.5,all:1,st:'poison',chance:.5,turns:3,fx:'poison'},
 shell:{n:'Harden',kind:'buff',st:'defUp',turns:3,self:1},fire:{n:'Fireball',kind:'mag',pow:1.35,elem:'Fire',fx:'fire'},steal:{n:'Pickpocket',kind:'phys',pow:.8,steal:1},
 thorns:{n:'Thorn Storm',kind:'phys',pow:.85,all:1,st:'bleed',chance:.3,turns:3},roar:{n:'War Roar',kind:'buff',st:'atkUp',turns:3,self:1},
 soak:{n:'Drench',kind:'mag',pow:.8,st:'slow',chance:.4,turns:2,fx:'ice'},sting:{n:'Sting',kind:'phys',pow:1,st:'poison',chance:.5,turns:3},
 ice:{n:'Frost Shard',kind:'mag',pow:1.3,elem:'Ice',fx:'ice'},curse:{n:'Curse',kind:'mag',pow:.6,st:'atkDown',chance:.7,turns:3,fx:'shadow'},
 bash:{n:'Shield Bash',kind:'phys',pow:1.25,st:'stun',chance:.25,turns:1},gust:{n:'Gale',kind:'mag',pow:.85,all:1,fx:'wind'},
 wave:{n:'Tidal Wave',kind:'mag',pow:1,all:1,elem:'Ice',fx:'ice'},thunder:{n:'Thunder',kind:'mag',pow:1.4,elem:'Bolt',fx:'bolt'},
 icebreath:{n:'Frost Breath',kind:'mag',pow:.95,all:1,elem:'Ice',fx:'ice'},drain:{n:'Drain',kind:'mag',pow:.9,drain:.5,fx:'shadow'},stomp:{n:'Stomp',kind:'phys',pow:.9,all:1,st:'stun',chance:.15,turns:1},
 shadow:{n:'Umbra',kind:'mag',pow:1.4,elem:'Shadow',fx:'shadow'},greywave:{n:'The Grey',kind:'mag',pow:1,all:1,elem:'Shadow',st:'defDown',chance:.5,turns:3,fx:'grey'},
 unmake:{n:'Unmaking',kind:'mag',pow:1.8,elem:'Shadow',fx:'grey'},
 enrage:{n:'Enrage',kind:'buff',st:'haste',turns:5,self:1,text:'is enraged!'},despair:{n:'Despair',kind:'mag',pow:1.2,all:1,elem:'Shadow',fx:'grey',text:'calls up the Grey!'},
};
/* ---------- places ---------- */
/* themes draw the backdrop; enc: formations; ev: things along the road */
const ZONES={
 emberwick:{n:'Emberwick',theme:'village',town:1,len:760,music:'town',right:'wood1',ev:[
   {x:60,k:'door',to:'home',label:'Your house'},{x:170,k:'npc',id:'hessa',name:'Hessa',talk:'hessa'},{x:240,k:'door',to:'forge',label:'Forge'},{x:330,k:'npc',id:'eve',name:'Eve',talk:'villager1',look:'r1'},{x:400,k:'door',to:'shop',label:'Shop'},
   {x:480,k:'npc',id:'tom',name:'Old Tom',talk:'villager2',look:'r2'},{x:550,k:'door',to:'tailor',label:'Tailor'},{x:640,k:'door',to:'inn',label:'Inn'},{x:710,k:'npc',id:'gate',name:'Gate Guard',talk:'gate1',look:'guard'}]},
 wood1:{n:'Whisperwood',theme:'forest',len:1300,music:'field',lv:[1,3],left:'emberwick',right:'wood2',grey:'flame',enc:[[['sprout','sprout'],3],[['wolf'],3],[['sprout','wolf'],2],[['beetle','sprout'],2]],ev:[
   {x:120,k:'sign',text:'WHISPERWOOD\nEmberwick is back the way you came. The deep wood lies east.'},{x:420,k:'chest',id:'c_w1a',item:'potion',n:3},{x:700,k:'scene',id:'mira_meet',once:'mira'},{x:1000,k:'chest',id:'c_w1b',cos:['hat','Flower Crown']},{x:1180,k:'save'}]},
 wood2:{n:'Deep Whisperwood',theme:'deepforest',len:1400,music:'field',lv:[2,5],left:'wood1',right:'thornden',grey:'flame',enc:[[['wolf','wolf'],3],[['beetle','wisp'],2],[['bandit','bandit'],2],[['wisp','sprout','sprout'],2]],ev:[
   {x:300,k:'chest',id:'c_w2a',item:'ether',n:2},{x:600,k:'npc',id:'lost',name:'Lost Woodcutter',talk:'woodcutter',look:'r3'},{x:900,k:'chest',id:'c_w2b',charm:'power'},{x:1150,k:'chest',id:'c_w2c',item:'ore',n:3},{x:1330,k:'save'}]},
 thornden:{n:'Thornmaw\'s Den',theme:'deepforest',len:520,music:'cave',left:'wood2',right:'saltroad',grey:'flame',ev:[{x:300,k:'boss',id:'thornmaw',foes:['thornmaw'],flag:'flame',pre:'thorn_pre',post:'thorn_post'}],lock:{right:'flame'}},
 saltroad:{n:'Saltwind Road',theme:'coast',len:1400,music:'field',lv:[5,8],left:'thornden',right:'saltmere',grey:'tide',enc:[[['crab','crab'],3],[['harpy','harpy'],2],[['jelly','crab'],2],[['bandit','harpy'],2]],ev:[
   {x:200,k:'sign',text:'SALTWIND ROAD\nSaltmere lies ahead, by the sea.'},{x:500,k:'chest',id:'c_s1a',item:'hipotion',n:2},{x:800,k:'chest',id:'c_s1b',cos:['top','Sailor Top']},{x:1100,k:'chest',id:'c_s1c',item:'ore',n:3},{x:1320,k:'save'}]},
 saltmere:{n:'Saltmere',theme:'port',town:1,len:820,music:'town',left:'saltroad',right:'grotto1',grey:'tide',ev:[
   {x:80,k:'door',to:'inn',label:'Inn'},{x:180,k:'npc',id:'bram',name:'Bram',talk:'bram',look:'bram',hideFlag:'bram'},{x:260,k:'door',to:'shop',label:'Shop'},{x:350,k:'npc',id:'sailor',name:'Sailor Ann',talk:'sailor',look:'r4'},
   {x:440,k:'door',to:'tailor',label:'Tailor'},{x:540,k:'door',to:'forge',label:'Forge'},{x:640,k:'npc',id:'kid',name:'Pip',talk:'kid',look:'r5'},{x:760,k:'npc',id:'harbor',name:'Harbor Master',talk:'harbor',look:'r6'}],lock:{right:'bram'}},
 grotto1:{n:'Tide Grotto',theme:'grotto',len:1300,music:'cave',lv:[7,10],left:'saltmere',right:'grotto2',grey:'tide',enc:[[['jelly','jelly'],3],[['imp','drowned'],2],[['drowned','crab'],2],[['imp','imp','jelly'],2]],ev:[
   {x:350,k:'chest',id:'c_g1a',item:'remedy',n:3},{x:700,k:'chest',id:'c_g1b',cos:['face','Eye Goggles']},{x:1000,k:'chest',id:'c_g1c',charm:'sage'},{x:1220,k:'save'}]},
 grotto2:{n:'The Drowned Hall',theme:'grotto',len:700,music:'cave',lv:[8,10],left:'grotto1',right:'frost1',grey:'tide',enc:[[['drowned','drowned'],3],[['imp','jelly','imp'],2]],ev:[{x:420,k:'boss',id:'tidecaller',foes:['tidecaller'],flag:'tide',pre:'tide_pre',post:'tide_post'}],lock:{right:'tide'}},
 frost1:{n:'Frostpeak Pass',theme:'snow',len:1400,music:'field',lv:[10,13],left:'grotto2',right:'frosthold',grey:'frost',enc:[[['snowwolf','snowwolf'],3],[['frostwisp','icebat'],2],[['yeti'],2],[['icebat','icebat','snowwolf'],2]],ev:[
   {x:250,k:'sign',text:'FROSTPEAK PASS\nTravelers, beware the Rime Colossus.'},{x:600,k:'scene',id:'kit_meet',once:'kit'},{x:900,k:'chest',id:'c_f1a',item:'hiether',n:1},{x:1200,k:'chest',id:'c_f1b',cos:['hat','Ushanka']},{x:1330,k:'save'}]},
 frosthold:{n:'Frosthold',theme:'snowtown',town:1,len:700,music:'town',left:'frost1',right:'glacier',grey:'frost',ev:[
   {x:80,k:'door',to:'inn',label:'Inn'},{x:180,k:'door',to:'shop',label:'Shop'},{x:290,k:'npc',id:'elder',name:'Elder Rhosa',talk:'elder',look:'r7'},{x:380,k:'door',to:'forge',label:'Forge'},{x:480,k:'door',to:'tailor',label:'Tailor'},{x:600,k:'npc',id:'hunter',name:'Hunter Oleg',talk:'hunter',look:'r8'}]},
 glacier:{n:'The Glass Glacier',theme:'glacier',len:1200,music:'cave',lv:[13,16],left:'frosthold',right:'stormroad',grey:'frost',enc:[[['golem','icebat'],3],[['yeti','frostwisp'],2],[['golem','golem'],2]],ev:[
   {x:400,k:'chest',id:'c_gl1',item:'ore',n:4},{x:650,k:'chest',id:'c_gl2',charm:'iron'},{x:850,k:'save'},{x:1050,k:'boss',id:'colossus',foes:['colossus'],flag:'frost',pre:'col_pre',post:'col_post'}],lock:{right:'frost'}},
 stormroad:{n:'Stormbreak Plains',theme:'storm',len:1400,music:'field',lv:[16,19],left:'glacier',right:'stormwatch',grey:'storm',enc:[[['hawk','hawk'],3],[['elemental','sparkjelly'],2],[['clock','hawk'],2],[['sparkjelly','sparkjelly','hawk'],2]],ev:[
   {x:300,k:'chest',id:'c_sr1',item:'megapotion',n:1},{x:700,k:'chest',id:'c_sr2',cos:['back','Mech Wings']},{x:1000,k:'chest',id:'c_sr3',item:'ore',n:4},{x:1320,k:'save'}]},
 stormwatch:{n:'Stormwatch',theme:'tower',town:1,len:760,music:'town',left:'stormroad',right:'spire1',grey:'storm',ev:[
   {x:80,k:'door',to:'inn',label:'Inn'},{x:180,k:'door',to:'shop',label:'Shop'},{x:290,k:'npc',id:'sage',name:'Sage Ilo',talk:'sage',look:'r9'},{x:390,k:'door',to:'forge',label:'Forge'},{x:490,k:'door',to:'tailor',label:'Tailor'},{x:620,k:'npc',id:'tinker',name:'Tinker Bea',talk:'tinker',look:'r10'}]},
 spire1:{n:'The Storm Spire',theme:'spire',len:1300,music:'cave',lv:[18,21],left:'stormwatch',right:'spire2',grey:'storm',enc:[[['clock','clock'],3],[['gargoyle','elemental'],2],[['gargoyle','hawk','sparkjelly'],2]],ev:[
   {x:400,k:'chest',id:'c_sp1',charm:'swift'},{x:800,k:'chest',id:'c_sp2',item:'starsteel',n:1},{x:1220,k:'save'}]},
 spire2:{n:'The Spire\'s Crown',theme:'spire',len:600,music:'cave',left:'spire1',right:'wastes',grey:'storm',ev:[{x:380,k:'boss',id:'stormwing',foes:['stormwing'],flag:'storm',pre:'storm_pre',post:'storm_post'}],lock:{right:'storm'}},
 wastes:{n:'The Grey Wastes',theme:'wastes',len:1500,music:'grey',lv:[21,25],left:'spire2',right:'citadel1',enc:[[['shade','shade'],3],[['hollow','voideye'],2],[['chimera'],2],[['hollow','shade','voideye'],2]],ev:[
   {x:300,k:'scene',id:'wastes_in',once:'wastes'},{x:600,k:'chest',id:'c_wa1',item:'elixir',n:1},{x:1000,k:'chest',id:'c_wa2',charm:'hero'},{x:1420,k:'save'}]},
 citadel1:{n:'The Grey Citadel',theme:'citadel',len:1400,music:'grey',lv:[24,28],left:'wastes',right:'citadel2',enc:[[['hollow','hollow'],3],[['chimera','shade'],2],[['voideye','voideye','shade'],2]],ev:[
   {x:400,k:'chest',id:'c_ci1',item:'starsteel',n:2},{x:800,k:'boss',id:'warden',foes:['warden'],flag:'shadow',pre:'warden_pre',post:'warden_post'},{x:1100,k:'chest',id:'c_ci2',cos:['hat','Crown']},{x:1320,k:'save'}],lock:{right:'shadow'}},
 citadel2:{n:'The Hollow Throne',theme:'throne',len:640,music:'grey',left:'citadel1',ev:[{x:420,k:'boss',id:'hollowking',foes:['hollowking'],flag:'end',pre:'king_pre',post:'king_post'}]},
};
/* the Embers: each one brings back a region's colour and lets the forge infuse an element */
const EMBERS={flame:{n:'Ember of Flame',elem:'Fire'},tide:{n:'Ember of Tides',elem:'Bolt'},frost:{n:'Ember of Frost',elem:'Ice'},storm:{n:'Ember of the Sky',elem:'Holy'},shadow:{n:'Ember of Dusk',elem:'Shadow'}};
/* the shops in each town */
const SHOPS={
 emberwick:{items:['potion','ether','remedy','feather','smoke'],charms:[]},
 saltmere:{items:['potion','hipotion','ether','remedy','feather','smoke','firebomb','boltbomb'],charms:['power','sage','iron']},
 frosthold:{items:['hipotion','ether','hiether','remedy','feather','firebomb','icebomb','camp'],charms:['swift','life','mana','thief']},
 stormwatch:{items:['hipotion','megapotion','hiether','remedy','feather','icebomb','boltbomb','camp'],charms:['regen','wisdom','keen','hero']},
};
/* the inn's price per town */
const INN={emberwick:0,saltmere:20,frosthold:40,stormwatch:60};
