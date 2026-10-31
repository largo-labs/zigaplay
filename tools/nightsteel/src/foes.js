/* ================= foes, drawn in code, facing right (toward the party) ================= */
/* each design takes a palette p and draws into a buffer; pal swaps make the later regions' cousins */
const FPAL={
 sprout:[{b:'#5ab84a',d:'#2f7a34',l:'#a8e08a',f:'#ff8ab0',s:'#8a5a32'},{b:'#6a5a3a',d:'#3a2e1e',l:'#9a8a5a',f:'#c8283c',s:'#4a3420'}],
 wolf:[{b:'#6a5a4a',d:'#3a2e26',l:'#9a8a72',e:'#ffd040',m:'#4ab048'},{b:'#c8dcf0',d:'#7a94b8',l:'#f4f8ff',e:'#5ae0ff',m:'#9ad8ff'},{b:'#5a5a62',d:'#2e2e36',l:'#8a8a94',e:'#ffd040',m:'#c8a040'}],
 beetle:[{b:'#4a8a3a',d:'#24481e',l:'#8ac860',e:'#ffe04a'},{b:'#7a5a3a',d:'#3e2a18',l:'#b08a5a',e:'#ff6a3a'}],
 wisp:[{b:'#ff7a2a',d:'#c0381a',l:'#ffe08a',e:'#fff6c8'},{b:'#7ad8ff',d:'#2a78c8',l:'#e0f8ff',e:'#ffffff'},{b:'#8a7a9a',d:'#3a3048',l:'#c8bcd8',e:'#1a1426'}],
 crab:[{b:'#e05a3a',d:'#8a2a1a',l:'#ffa080',e:'#1a1426'}],
 jelly:[{b:'#c08af0',d:'#7a4ac0',l:'#f0d8ff',e:'#1a1426'},{b:'#8af0e0',d:'#3ab0a0',l:'#e0fff8',e:'#1a1426'},{b:'#ffe86a',d:'#c8a020',l:'#fffac8',e:'#1a1426'}],
 imp:[{b:'#3a8ab0',d:'#1a4a6a',l:'#8ad0f0',e:'#ffe04a',w:'#2a5a78'}],
 skeleton:[{b:'#e8e0c8',d:'#a89878',l:'#ffffff',e:'#5ae0ff',a:'#4a6a7a'}],
 harpy:[{b:'#e8e8f0',d:'#9a9ab0',l:'#ffffff',s:'#f0c098',e:'#ff6a2a',h:'#5a4a6a'}],
 serpent:[{b:'#2a8ab8',d:'#14486a',l:'#7ad0f0',e:'#ffe04a',f:'#e8f0ff',c:'#ffe04a'}],
 yeti:[{b:'#f0f4ff',d:'#a8b8d8',l:'#ffffff',s:'#8ab0d8',e:'#1a1426'}],
 bat:[{b:'#5a4a7a',d:'#2a2040',l:'#8a7ab0',e:'#ff4a5a'},{b:'#2a2a34',d:'#141418',l:'#4a4a5a',e:'#ff4a3a'},{b:'#8ab8e0',d:'#3a6a9a',l:'#d0ecff',e:'#ffffff'}],
 golem:[{b:'#8a8a9a',d:'#4a4a5a',l:'#c8c8d8',e:'#ffd040',c:'#6ad0ff'},{b:'#a8d8f0',d:'#4a88b0',l:'#e8f8ff',e:'#ffffff',c:'#2a68c8'}],
 colossus:[{b:'#a8d8f0',d:'#3a78a8',l:'#f0fcff',e:'#ffffff',c:'#2a58b8',s:'#5a6a8a'}],
 hawk:[{b:'#3a4a8a',d:'#1a2448',l:'#7a8ad0',e:'#ffe04a',k:'#ffd040'}],
 elemental:[{b:'#8ad8ff',d:'#3a78d8',l:'#ffffff',e:'#ffe04a'}],
 clock:[{b:'#c8a04a',d:'#7a5a20',l:'#ffe08a',e:'#ff4a4a',m:'#7a7a8a'}],
 gargoyle:[{b:'#7a7a8a',d:'#3a3a4a',l:'#b0b0c0',e:'#ff4a4a'}],
 roc:[{b:'#4a5ab0',d:'#1e2660',l:'#9aa8f0',e:'#ffe04a',k:'#ffd040',s:'#8affff'}],
 eye:[{b:'#4a2a6a',d:'#1e1030',l:'#8a5ab0',e:'#ff3a5a'}],
 chimera:[{b:'#b08a5a',d:'#6a4a28',l:'#e0c090',m:'#8a4a2a',s:'#4a8a3a',w:'#5a5a7a'}],
 thornmaw:[{b:'#6a4a2a',d:'#3a2414',l:'#a07a4a',g:'#4ab048',gd:'#2a6a2a',e:'#ff6a2a',t:'#f0e8d0'}],
 king:[{b:'#3a3a4a',d:'#16161e',l:'#6a6a80',c:'#8a8a9a',e:'#e8e8ff',g:'#c8c8d8'}],
};
const FART={
 sprout(b,p){b.line(18,36,15,40,p.s,2);b.line(23,36,26,40,p.s,2);b.ell(20,28,9,9,p.b,2);b.ell(22,31,5,4,p.l,0,true);
  b.leaf(18,20,12,9,5,p.b);b.leaf(21,20,27,8,5,p.l);b.ell(20,9,3,3,p.f,1);b.eye(18,27,2);b.eye(24,27,2);b.line(19,33,24,32,p.d)},
 wolf(b,p){b.horn(10,30,4,26,2,18,5,p.b,2);b.ell(22,30,13,8,p.b,1);b.ell(24,34,9,3,p.l,0,true);for(const x of[13,18,28,33])b.line(x,34,x+(x>25?1:-1),44,p.d,3);
  b.ell(36,24,7,6,p.b,1);b.poly([[39,22],[48,25],[47,29],[39,29]],p.b);b.fangs(41,46,29,1);b.tri(31,19,35,18,32,12,p.b);b.tri(35,19,38,19,37,13,p.d);b.angry(36,21,1,p.e);b.px(47,25,'#1a1426');
  for(const x of[16,20,24,28])b.tri(x,23,x+3,23,x+1,18,p.m||p.d)},
 beetle(b,p){for(const x of[14,20,27,32])b.line(x,34,x+(x>22?2:-2),41,'#1a1426',2);b.ell(22,28,15,10,p.b,2);b.line(22,18,22,38,p.d,1);b.ell(17,24,4,3,p.l,0,true);
  b.ell(39,30,6,5,p.d,1);b.horn(43,28,48,22,46,16,2.6,p.d,1);b.px(41,29,p.e);b.px(42,29,p.e)},
 wisp(b,p){b.leaf(22,40,22,6,20,p.d);b.leaf(22,40,22,9,15,p.b);b.leaf(22,38,22,15,9,p.l);b.eye(19,28,2.2,p.e);b.eye(26,28,2.2,p.e);b.ell(22.5,33,2,1.4,'#1a1426',0);
  for(const[x,y]of[[10,20],[34,16],[8,32],[37,30]])b.ell(x,y,1.6,1.6,p.l,0)},
 crab(b,p){for(const s of[-1,1])for(let i=0;i<3;i++)b.line(22+s*6,34,22+s*(12+i*3),40,p.d,2);b.ell(22,30,13,8,p.b,2);b.ell(22,33,9,3,p.l,0,true);
  b.ell(38,22,6,5,p.b,2);b.tri(40,20,48,15,46,22,p.b);b.tri(40,24,48,26,44,20,p.d);b.ell(8,24,4,4,p.b,1);b.line(18,22,16,15,p.d,1);b.line(26,22,28,15,p.d,1);b.ell(16,14,2,2,'#ffffff',0);b.px(16,14,p.e);b.ell(28,14,2,2,'#ffffff',0);b.px(28,14,p.e)},
 jelly(b,p){for(let i=0;i<5;i++){const x=12+i*5;b.horn(x,30,x+2,36,x-1,44,2,p.d,1)}b.ell(22,24,13,11,p.b,2);b.tint((x,y,v)=>v===p.b&&y>28?shade(p.b,-1):undefined);b.ell(17,19,4,3,p.l,0);
  b.eye(18,25,2);b.eye(26,25,2);b.line(20,30,24,30,p.d)},
 imp(b,p){b.poly([[16,22],[4,14],[6,24],[2,28],[12,30]],p.w);b.ell(22,30,8,9,p.b,2);b.ell(23,17,8,7,p.b,2);b.tri(17,12,20,11,15,4,p.d);b.tri(26,11,29,12,30,4,p.d);
  b.angry(23,15,1,p.e);b.angry(28,15,0,p.e);b.fangs(23,28,22,1);b.horn(16,36,8,40,4,34,2,p.d,1);b.line(19,38,18,44,p.d,2);b.line(25,38,26,44,p.d,2);b.line(30,28,36,24,p.b,2)},
 skeleton(b,p){b.rect(18,44,3,1,p.d);b.line(19,34,18,44,p.b,2);b.line(25,34,27,44,p.b,2);b.rect(17,30,10,5,p.a);for(let y=22;y<31;y+=2)b.line(17,y,27,y,p.b);b.line(22,20,22,31,p.d);
  b.ell(23,14,7,7,p.b,2);b.rect(19,19,9,3,p.b);b.ell(21,13,1.8,2,'#1a1426',0);b.ell(26,13,1.8,2,'#1a1426',0);b.px(21,13,p.e);b.px(26,13,p.e);for(let x=20;x<27;x+=2)b.px(x,20,'#1a1426');
  b.line(28,22,36,30,p.b,2);b.quill(35,30,44,14,3,'#a8b0c0');b.rect(33,28,5,2,'#6a5a3a');b.ell(13,26,5,7,p.a,1);b.ell(13,26,3,5,shade(p.a,1),0)},
 harpy(b,p){b.poly([[18,20],[2,8],[4,18],[0,22],[6,26],[4,32],[16,30]],p.b);for(let i=0;i<4;i++)b.line(16,22+i*2,2+i,10+i*5,p.d);b.ell(22,26,7,8,p.b,1);b.ell(24,15,6,6,p.s,1);
  b.poly([[18,12],[28,10],[26,6],[18,8]],p.h);b.horn(18,10,10,10,8,20,3,p.h,1);b.eye(26,15,1.8,'#ffffff');b.tri(29,16,33,17,29,18,'#f0a030');b.line(20,34,18,42,'#f0a030',2);b.line(25,34,27,42,'#f0a030',2)},
 serpent(b,p){/* a great sea serpent rising out of the waves */
  for(let i=0;i<5;i++)b.ell(10+i*16,82+(i%2)*2,12,4,'#2a6aa8',0);b.horn(8,78,24,40,44,30,16,p.b,12);b.horn(30,76,14,58,10,40,10,p.d,6);
  for(let y=46;y<76;y+=6)b.ell(32-(y-46)*.3,y,6,2,p.f,0,true);b.ell(52,26,15,11,p.b,2);b.poly([[60,22],[78,26],[76,34],[60,36]],p.b);b.fangs(62,74,34,-1);b.fangs(62,72,31,1);
  for(let i=0;i<5;i++)b.tri(40+i*4,16-i,44+i*4,16-i,42+i*4,4-i*1.6,p.c);b.angry(54,22,1,p.e);b.ell(70,25,1,1,'#1a1426',0);b.horn(46,20,38,10,30,14,3,p.f,1)},
 yeti(b,p){b.ell(16,36,6,10,p.b,1);b.ell(36,36,6,10,p.b,1);b.ell(26,30,14,16,p.b,2);b.ell(28,34,8,9,p.s,0,true);
  b.ell(28,14,9,8,p.b,2);b.ell(31,16,5,4,p.s,0);b.angry(28,12,1,'#5ae0ff');b.fangs(28,33,19,-1);b.rect(18,44,6,5,p.d);b.rect(30,44,6,5,p.d);
  for(let i=0;i<8;i++)b.px(14+i*3,22+(i%3)*5,p.l)},
 bat(b,p){b.poly([[22,18],[4,8],[2,20],[8,18],[10,26],[16,22]],p.d);b.poly([[24,18],[42,8],[44,20],[38,18],[36,26],[30,22]],p.d);b.ell(23,22,7,7,p.b,2);
  b.tri(18,16,21,15,18,9,p.b);b.tri(25,15,28,16,28,9,p.b);b.angry(21,20,1,p.e);b.angry(25,20,0,p.e);b.fangs(21,25,26,1)},
 golem(b,p){b.rect(16,40,8,10,p.d);b.rect(28,40,8,10,p.d);b.poly([[12,18],[40,16],[42,40],[10,42]],p.b);b.rect(10,18,8,6,p.l);
  b.ell(10,28,6,10,p.b,1);b.ell(42,28,6,10,p.b,1);b.rect(18,6,16,12,p.b);b.rect(18,6,16,3,p.l);b.rect(26,10,6,3,p.e);
  b.crystal(24,30,8,6,p.c,lt(p.c),dk(p.c));for(const[x,y]of[[14,30],[36,22],[20,38]])b.line(x,y,x+3,y+3,p.d)},
 colossus(b,p){/* the Rime Colossus: a mountain of ice with a crystal heart */
  b.rect(26,70,14,22,p.d);b.rect(56,70,14,22,p.d);b.poly([[16,30],[80,26],[84,72],[12,76]],p.b);b.poly([[16,30],[80,26],[78,36],[18,40]],p.l);
  b.ell(12,48,10,20,p.b,2);b.ell(86,46,10,20,p.b,2);b.rect(4,62,16,10,p.s);b.rect(78,60,16,10,p.s);
  for(const[x,h]of[[28,20],[36,26],[46,30],[56,24],[66,18],[74,12]])b.crystal(x,30,h,8,lt(p.b),'#ffffff',p.d);
  b.rect(36,8,26,20,p.b);b.rect(36,8,26,4,p.l);b.rect(42,15,6,4,p.e);b.rect(52,15,6,4,p.e);b.crystal(48,58,18,14,p.c,lt(p.c),dk(p.c));b.px(46,50,'#ffffff')},
 hawk(b,p){b.poly([[22,22],[2,6],[6,18],[0,22],[10,26],[14,30]],p.b);for(let i=0;i<3;i++)b.line(18,24,4+i*2,8+i*6,p.d);b.ell(24,26,9,8,p.b,2);b.ell(26,30,5,4,p.l,0,true);
  b.ell(32,16,6,6,p.b,2);b.tri(36,15,44,18,36,20,p.k);b.angry(32,14,1,p.e);b.poly([[14,30],[4,38],[12,38]],p.d);b.line(22,33,20,40,p.k,2);b.line(28,33,30,40,p.k,2);b.zap(38,4,.6,'#ffe04a')},
 elemental(b,p){b.leaf(22,44,22,4,22,shade(p.b,-1));b.leaf(22,42,22,8,16,p.b);b.leaf(22,40,22,14,9,p.l);for(const[x,y,s]of[[6,10,.6],[34,6,.5],[38,28,.6],[4,30,.5]])b.zap(x,y,s,p.e);
  b.angry(18,24,1,'#ffffff');b.angry(24,24,0,'#ffffff');b.line(19,32,26,32,'#1a2470')},
 clock(b,p){b.rect(16,40,5,8,p.m);b.rect(26,40,5,8,p.m);b.rect(12,18,24,22,p.b);b.rect(12,18,24,3,p.l);b.ell(24,29,7,7,'#f4f0e0',0);b.line(24,29,24,24,'#1a1426');b.line(24,29,28,30,'#1a1426');
  for(let i=0;i<8;i++){const a=i*Math.PI/4;b.px(24+Math.cos(a)*6,29+Math.sin(a)*6,'#1a1426')}b.rect(16,6,16,12,p.b);b.rect(20,10,8,3,p.e);b.line(24,6,24,2,p.m,1);b.ell(24,2,1.4,1.4,p.e,0);
  b.line(36,24,42,30,p.m,3);b.quill(42,30,48,14,4,'#c8ccd8');b.line(12,24,6,32,p.m,3);b.ell(5,34,4,4,p.d,1)},
 gargoyle(b,p){b.poly([[16,18],[2,6],[4,16],[0,22],[12,26]],p.d);b.ell(24,30,10,10,p.b,2);b.ell(26,16,7,7,p.b,2);b.horn(22,10,18,4,14,6,2.4,p.d,1);b.horn(28,10,32,4,36,6,2.4,p.d,1);
  b.angry(26,15,1,p.e);b.fangs(26,32,20,1);b.line(18,38,14,46,p.d,3);b.line(30,38,34,46,p.d,3);b.line(32,28,40,32,p.b,3);for(let i=0;i<3;i++)b.line(40,32,42+i*2,35,'#e8e8f0')},
 roc(b,p){/* Stormwing: a great roc wreathed in lightning */
  b.poly([[44,40],[4,4],[10,26],[0,34],[16,42],[10,52],[30,52]],p.b);for(let i=0;i<5;i++)b.line(40,42,4+i*3,6+i*10,p.d);b.poly([[50,40],[88,10],[84,30],[94,36],[80,44],[86,54],[62,54]],p.d);
  b.ell(48,52,18,16,p.b,2);b.ell(52,58,11,9,p.l,0,true);b.ell(62,30,11,10,p.b,2);b.tri(70,28,86,34,70,38,p.k);b.angry(62,26,1,p.e);for(let i=0;i<4;i++)b.tri(52+i*4,22,56+i*4,22,52+i*4,12-i*2,p.s);
  b.line(42,66,38,80,p.k,3);b.line(54,66,58,80,p.k,3);for(const[x,y,s]of[[14,62,.8],[84,64,.7],[28,8,.6],[74,4,.7]])b.zap(x,y,s,'#ffe04a')},
 eye(b,p){for(let i=0;i<6;i++){const a=Math.PI*(.2+i*.12);b.horn(22,28,22+Math.cos(a)*10,28+Math.sin(a)*12,22+Math.cos(a)*14,28+Math.sin(a)*18,3,p.d,1)}
  b.ell(22,22,14,13,p.b,2);b.ell(24,22,9,7,'#f4f0f8',0);b.ell(25,22,5,5,p.e,0);b.ell(26,22,2,4,'#1a1426',0);b.px(23,20,'#ffffff');b.line(10,15,18,13,p.d);b.line(10,30,18,31,p.d)},
 chimera(b,p){b.horn(10,30,0,24,2,14,5,p.s,3);b.ell(2,14,3,3,p.s,1);b.poly([[24,20],[12,6],[14,18],[8,22]],p.w);b.ell(26,32,16,10,p.b,2);for(const x of[14,20,32,38])b.line(x,38,x,50,p.d,4);
  b.ell(42,22,9,9,p.m,2);b.ell(44,24,6,6,p.b,2);b.poly([[48,22],[56,25],[55,30],[48,30]],p.b);b.fangs(50,55,30,1);b.angry(44,20,1,'#ffe04a');
  b.horn(30,22,28,12,34,8,3,'#e8e0c8',1);b.ell(26,26,5,5,'#8a8a9a',1);b.tri(24,22,28,22,26,18,'#8a8a9a')},
 thornmaw(b,p){/* Thornmaw: a huge boar of bark and bramble, burning at the heart */
  for(const x of[22,34,58,70])b.rect(x,64,8,20,p.d);b.ell(44,52,32,20,p.b,2);b.ell(46,60,24,9,p.l,0,true);
  for(let i=0;i<9;i++){const x=18+i*6;b.tri(x,36,x+6,36,x+3,22-((i*7)%5)*2,i%2?p.g:p.gd)}for(let i=0;i<5;i++)b.leaf(20+i*10,38,24+i*10,30,4,p.g);
  b.ell(78,48,14,12,p.b,2);b.poly([[84,46],[98,50],[96,60],[84,60]],p.b);b.horn(84,58,94,58,96,46,4,p.t,1.4);b.horn(80,58,86,64,82,70,3,p.t,1);
  b.angry(80,44,1,p.e);b.ell(46,52,6,6,p.e,0);b.ell(46,52,3,3,'#ffe08a',0);b.line(40,46,52,58,p.d);for(const[x,y]of[[30,60],[60,40],[24,48]])b.line(x,y,x+5,y+3,p.d)},
 king(b,p){/* the Hollow King: a giant in grey armor, a crown of iron, a cape that drinks colour */
  b.poly([[30,30],[8,96],[22,92],[36,98],[50,92],[64,98],[78,92],[86,96],[64,30]],'#2a2a34');b.poly([[30,30],[14,90],[48,86],[64,30]],'#3a3a46');
  b.rect(34,70,10,24,p.d);b.rect(52,70,10,24,p.d);b.poly([[30,28],[66,28],[70,70],[26,70]],p.b);b.poly([[30,28],[66,28],[64,40],[32,40]],p.l);b.ell(48,52,7,7,'#1a1a22',0);b.ell(48,52,4,4,p.e,0);
  b.ell(26,34,8,7,p.c,2);b.ell(70,34,8,7,p.c,2);b.rect(20,40,10,24,p.b);b.rect(66,40,10,24,p.b);b.ell(25,66,5,5,p.c,1);b.ell(71,66,5,5,p.c,1);
  b.quill(76,66,84,6,6,p.g);b.rect(66,62,16,4,p.d);
  b.ell(48,18,10,10,p.b,2);b.rect(40,18,18,4,'#0a0a10');b.px(44,19,p.e);b.px(53,19,p.e);b.poly([[37,10],[59,10],[61,0],[55,5],[52,-2],[48,4],[44,-2],[41,5],[35,0]],p.c);b.rect(37,8,22,3,p.d)},
};
/* bandits and knights are people: they are drawn with the same doll as the party */
const FOE_LOOKS={
 bandit:{look:{skin:'Tan',hair:'Messy',hairC:'Black',hat:'Bandana',hatC1:'Grey',hatC2:'Charcoal',top:'Leather Armor',topC1:'Slate',topC2:'Charcoal',bot:'Pants',botC1:'Charcoal',shoes:'Boots',shoeC:'Black',face:'Ninja Mask',faceC:'Grey',eyes:'Sharp',brows:'Angled',mouth:'Smirk',back:'Short Cape',backC1:'Grey',backC2:'Slate'},
  weapon:{kind:'sword',parts:{Blade:'Scimitar',Guard:'Claw',Pommel:'Spike',Wrap:'Leather',Charm:'None'},c1:'Silver',c2:'Slate',c3:'Black'}},
 hollow:{look:{skin:'Stone',hair:'Bald',hat:'Knight Helm',hatC1:'Charcoal',hatC2:'Slate',top:'Full Plate',topC1:'Charcoal',topC2:'Slate',bot:'Greaves',botC1:'Charcoal',shoes:'Knight Greaves',shoeC:'Charcoal',back:'Tattered Cape',backC1:'Grey',backC2:'Slate',eyes:'Fierce',eyeC:'White'},
  weapon:{kind:'greatsword',parts:{Blade:'Executioner',Guard:'Skull',Pommel:'Spike',Wrap:'Plain',Charm:'Chain'},c1:'Grey',c2:'Black',c3:'Charcoal'}},
 warden:{look:{skin:'Stone',hair:'Bald',hat:'Spartan Helm',hatC1:'Slate',hatC2:'Grey',top:'Full Plate',topC1:'Slate',topC2:'Silver',bot:'Greaves',botC1:'Slate',shoes:'Knight Greaves',shoeC:'Slate',back:'Royal Cape',backC1:'Charcoal',backC2:'Grey',eyes:'Fierce',eyeC:'White'},
  weapon:{kind:'greataxe',parts:{Head:'Moon',Haft:'Iron',Top:'Spike',Wrap:'Plain',Charm:'Chain'},c1:'Silver',c2:'Black',c3:'Charcoal'}},
};
Object.assign(FOE_LOOKS,{
 watch:{look:{skin:'Honey',eyes:'Sharp',hair:'Short Crop',hairC:'Brown',hat:'Cap',hatC1:'Navy',hatC2:'Steel',top:'Leather Armor',topC1:'Navy',topC2:'Steel',bot:'Pants',botC1:'Navy',shoes:'Boots',shoeC:'Black'},
  weapon:{kind:'staff',parts:{Head:'Plain',Gem:'Orb',Shaft:'Wood',Trim:'None'},c1:'Brown',c2:'Steel',c3:'Leather',gemC:'Amber'}},
 tollg:{look:{skin:'Tan',eyes:'Sharp',hair:'Short Crop',hairC:'Brown',hat:'Knight Helm',hatC1:'Steel',hatC2:'Crimson',top:'Breastplate',topC1:'Crimson',topC2:'Steel',bot:'Pants',botC1:'Maroon',shoes:'Boots',shoeC:'Black'},
  weapon:{kind:'sword',parts:{Blade:'Straight',Guard:'Cross',Pommel:'Round',Wrap:'Leather',Charm:'None'},c1:'Silver',c2:'Steel',c3:'Brown'}},
 sarge:{look:{skin:'Bronze',eyes:'Fierce',brows:'Thick',hair:'Short Crop',hairC:'Black',hat:'Spartan Helm',hatC1:'Bronze',hatC2:'Crimson',top:'Full Plate',topC1:'Crimson',topC2:'Gold',bot:'Greaves',botC1:'Bronze',shoes:'Sabatons',shoeC:'Bronze',face:'Mustache',faceC:'Black'},
  weapon:{kind:'greatsword',parts:{Blade:'Cleaver',Guard:'Block',Pommel:'Round',Wrap:'Leather',Charm:'None'},c1:'Steel',c2:'Gold',c3:'Maroon'}},
 garrick:{look:{skin:'Honey',eyes:'Sharp',eyeC:'Amber',brows:'Thick',mouth:'Calm',hair:'Shaggy',hairC:'Chocolate',hat:'Cowboy Hat',hatC1:'Leather',hatC2:'Chocolate',top:'Long Coat',topC1:'Tan',topC2:'Cream',bot:'Pants',botC1:'Brown',shoes:'Tall Boots',shoeC:'Chocolate',face:'Full Beard',faceC:'Chocolate'},
  weapon:{kind:'bow',parts:{Limbs:'Compound',Tips:'Blades',Grip:'Metal',Charm:'Feather'},c1:'Leather',c2:'Steel',c3:'Cream',c4:'Tan'}},
 roadw:{look:{skin:'Fair',eyes:'Sleepy',hair:'Short Crop',hairC:'Ash',hat:'Knight Helm',hatC1:'Slate',hatC2:'Navy',top:'Chainmail',topC1:'Slate',topC2:'Navy',bot:'Greaves',botC1:'Slate',shoes:'Sabatons',shoeC:'Slate'},
  weapon:{kind:'sword',parts:{Blade:'Broad',Guard:'Cross',Pommel:'Round',Wrap:'Plain',Charm:'None'},c1:'Steel',c2:'Slate',c3:'Navy'}},
 xbow:{look:{skin:'Tan',eyes:'Sharp',hair:'Short Crop',hairC:'Black',hat:'Hood',hatC1:'Olive',hatC2:'Brown',top:'Leather Armor',topC1:'Olive',topC2:'Brown',bot:'Pants',botC1:'Brown',shoes:'Boots',shoeC:'Brown'},
  weapon:{kind:'bow',parts:{Limbs:'Compound',Tips:'None',Grip:'Metal',Charm:'None'},c1:'Brown',c2:'Steel',c3:'Cream',c4:'Olive'}},
 keepg:{look:{skin:'Honey',eyes:'Fierce',hair:'Short Crop',hairC:'Black',hat:'Knight Helm',hatC1:'Charcoal',hatC2:'Crimson',top:'Full Plate',topC1:'Charcoal',topC2:'Crimson',bot:'Greaves',botC1:'Charcoal',shoes:'Sabatons',shoeC:'Charcoal'},
  weapon:{kind:'warhammer',parts:{Head:'Block',Haft:'Iron',Top:'Spike',Wrap:'Plain',Charm:'None'},c1:'Slate',c2:'Charcoal',c3:'Black'}},
 kell:{look:{skin:'Fair',eyes:'Fierce',eyeC:'Grey',brows:'Thick',mouth:'Frown',hair:'Short Crop',hairC:'Brown',hat:'Knight Helm',hatC1:'Silver',hatC2:'Crimson',top:'Full Plate',topC1:'Silver',topC2:'Crimson',bot:'Greaves',botC1:'Steel',shoes:'Sabatons',shoeC:'Steel',back:'Long Cape',backC1:'Maroon',backC2:'Gold'},
  weapon:{kind:'warhammer',parts:{Head:'Morningstar',Haft:'Iron',Top:'Spike',Wrap:'Leather',Charm:'Chain'},c1:'Silver',c2:'Gold',c3:'Maroon',c4:'Crimson'}},
});
const FSIZE={serpent:[96,92],colossus:[100,96],roc:[100,86],thornmaw:[104,90],king:[96,100],yeti:[52,52],golem:[52,54],chimera:[60,54]};
const _foeC=new Map();
/* a foe's picture: a canvas, and where its feet (or its middle, if it flies) sit */
function foeSprite(F,flash){const key=F.id+(flash||'');let c=_foeC.get(key);if(c)return c;
  if(FOE_LOOKS[F.look||F.art]&&(F.look||F.art)!=='king'){const L=FOE_LOOKS[F.look||F.art],w=Object.assign(newWeapon(L.weapon.kind),L.weapon,{parts:Object.assign(newWeapon(L.weapon.kind).parts,L.weapon.parts)});
    const b=drawHero(L.look,w,'ready');if(F.boss){const b2=new Buf(b.w*1.5|0,b.h*1.5|0);for(let y=0;y<b2.h;y++)for(let x=0;x<b2.w;x++)b2.d[y*b2.w+x]=b.d[Math.floor(y/1.5)*b.w+Math.floor(x/1.5)];c={cv:b2.canvas(1,false,flash||null),fx:DOLL_FX*1.5,fy:DOLL_FY*1.5,w:b2.w,h:b2.h}}
    else c={cv:b.canvas(1,false,flash||null),fx:DOLL_FX,fy:DOLL_FY,w:b.w,h:b.h}}
  else{const sz=FSIZE[F.art]||[50,48],b=new Buf(sz[0],sz[1]+4),pals=FPAL[F.art]||[{}],p=pals[Math.min(F.pal||0,pals.length-1)];FART[F.art](b,p);b.softline();
    c={cv:b.canvas(1,false,flash||null),fx:sz[0]/2,fy:sz[1]-2,w:b.w,h:b.h}}
  _foeC.set(key,c);return c}
