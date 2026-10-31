/* ================= weapons: ten kinds, every one built from parts you choose =================
   Each weapon is drawn pointing up, at a scale k (1 in the hand, 3 on the forge's anvil), with its grip point
   (gx, gy) where the hand holds it. Colours: c1 the blade or head, c2 the metal fittings, c3 the grip or wood,
   c4 an accent (tassels, ribbons, fletching, the second blade), glow the light it leaves when it swings. */
const ELEMS={None:{c:'#c8ccd8',n:'None'},Fire:{c:'#ff6a2a',n:'Pyro'},Ice:{c:'#78d8ff',n:'Cryo'},Bolt:{c:'#c88aff',n:'Electro'},Holy:{c:'#fff2b0',n:'Holy'},Shadow:{c:'#a070ff',n:'Shadow'},Dendro:{c:'#6ad65a',n:'Dendro'},Geo:{c:'#e6b84a',n:'Geo'}};
const ELEM_LIST=Object.keys(ELEMS);
const GLYPHS=['Star','Eye','Moon','Sun','Rune','Skull','Heart','Flame','Leaf','Snowflake','Bolt','Spiral','Rose','Key','Crown','Sigil'];
/* [kind id, name, hold, parts {part:[choices]}, base stats, default parts, default colours] */
const WTYPES={
 sword:{n:'Sword',hold:'one',parts:{Blade:['Straight','Broad','Leaf','Flamberge','Serrated','Crystal','Rapier','Scimitar'],Guard:['Cross','Disc','Wings','Ring','Basket','Claw','Crescent','None'],Pommel:['Round','Gem','Spike','Skull','Ring','Fang'],Wrap:['Plain','Criss-cross','Spiral','Leather'],Charm:['None','Tassel','Bell','Feather','Ribbon']},
  stat:{atk:10,mag:2,def:2,spd:2},col:{c1:'Silver',c2:'Gold',c3:'Leather',c4:'Crimson',glow:'Sky',gemC:'Crimson'},
  blurb:'Balanced and quick. Arts strike, parry and rally the party.'},
 greatsword:{n:'Greatsword',hold:'two',parts:{Blade:['Zweihander','Buster','Executioner','Cleaver','Dragonbone','Runic','Twin Edge'],Guard:['Cross','Wings','Block','Horns','Skull','None'],Pommel:['Round','Gem','Spike','Skull','Ring'],Wrap:['Plain','Criss-cross','Spiral','Leather'],Charm:['None','Tassel','Chain','Ribbon']},
  stat:{atk:16,mag:0,def:3,spd:-3},col:{c1:'Steel',c2:'Charcoal',c3:'Maroon',c4:'Gold',glow:'Amber',gemC:'Amber'},
  blurb:'Slow and crushing. Arts cleave every foe and break their guard.'},
 katana:{n:'Katana',hold:'one',parts:{Blade:['Uchigatana','Tachi','Nodachi','Wakizashi','Serpent'],Tsuba:['Round','Square','Flower','Lotus','Cloud','Crescent'],Hamon:['Wave','Straight','Flame','None'],Wrap:['Diamond','Plain','Spiral'],Charm:['Tassel','None','Bell','Ribbon']},
  stat:{atk:12,mag:1,def:0,spd:3},col:{c1:'Platinum',c2:'Brass',c3:'Navy',c4:'Crimson',glow:'Sakura',gemC:'Crimson'},
  blurb:'A keen edge. Arts aim for criticals and cut deep.'},
 dual:{n:'Dual Katana',hold:'dual',parts:{Blade:['Uchigatana','Tachi','Wakizashi','Serpent'],Tsuba:['Round','Square','Flower','Lotus','Cloud','Crescent'],Hamon:['Wave','Straight','Flame','None'],Wrap:['Diamond','Plain','Spiral'],Charm:['Tassel','None','Bell','Ribbon']},
  stat:{atk:9,mag:1,def:-1,spd:5},col:{c1:'Platinum',c5:'Platinum',c2:'Brass',c3:'Charcoal',c4:'Violet',glow:'Violet',gemC:'Violet'},
  blurb:'Two blades, many hits. Arts strike again and again.'},
 greataxe:{n:'Great Axe',hold:'two',parts:{Head:['Crescent','Double','Bearded','Halberd','Moon','Saw'],Haft:['Wood','Iron','Bone','Twisted'],Top:['Spike','None','Blade','Gem'],Wrap:['Plain','Leather','Spiral'],Charm:['None','Tassel','Chain','Fur']},
  stat:{atk:17,mag:0,def:1,spd:-2},col:{c1:'Steel',c2:'Bronze',c3:'Brown',c4:'Crimson',glow:'Red',gemC:'Crimson'},
  blurb:'Brutal and bloody. Arts rend foes and fuel a fury.'},
 warhammer:{n:'Warhammer',hold:'two',parts:{Head:['Block','Round','Morningstar','Anvil','Twin','Spiked','Hex'],Haft:['Wood','Iron','Bone','Twisted'],Top:['Spike','None','Gem'],Wrap:['Plain','Leather','Spiral'],Charm:['None','Tassel','Chain','Bell']},
  stat:{atk:15,mag:0,def:5,spd:-3},col:{c1:'Slate',c2:'Brass',c3:'Chocolate',c4:'Royal',glow:'Azure',gemC:'Azure'},
  blurb:'Heavy and sure. Arts stun, shatter armor and guard the party.'},
 bow:{n:'Bow',hold:'bow',parts:{Limbs:['Longbow','Recurve','Compound','Wing','Crescent','Bone','Branch'],Tips:['None','Blades','Gems','Feathers'],Grip:['Wrapped','Carved','Metal'],Charm:['None','Feather','Tassel','Bell']},
  stat:{atk:11,mag:2,def:0,spd:4},col:{c1:'Leather',c2:'Gold',c3:'Cream',c4:'Forest',glow:'Lime',gemC:'Green'},
  blurb:'Strikes from afar. Arts rain arrows, poison and pin foes.'},
 fists:{n:'Fists',hold:'fists',parts:{Style:['Gauntlets','Knuckles','Claws','Wraps','Cestus','Dragon'],Studs:['None','Studs','Spikes','Blades'],Plate:['Plain','Engraved','Gem'],Charm:['None','Ribbon','Bell','Fur']},
  stat:{atk:10,mag:2,def:2,spd:6},col:{c1:'Steel',c2:'Gold',c3:'Crimson',c4:'White',glow:'Orange',gemC:'Orange'},
  blurb:'Fast and fierce. Arts land combos and channel chi to heal.'},
 staff:{n:'Staff',hold:'staff',parts:{Head:['Ring','Crescent','Branch','Wings','Cage','Star','Serpent','Plain'],Gem:['Orb','Crystal','Star','Moon','Heart','Diamond','Skull','Eye'],Shaft:['Wood','Gnarled','Metal','Bone','Crystal'],Trim:['Ribbons','None','Chains','Feathers','Bells']},
  stat:{atk:4,mag:13,def:2,spd:1},col:{c1:'Gold',c2:'Gold',c3:'Leather',c4:'Sky',glow:'Lemon',gemC:'Azure'},
  blurb:'A healer\'s focus. Prayers cure, revive and smite with light.'},
 grimoire:{n:'Grimoire',hold:'book',parts:{Symbol:GLYPHS,Clasp:['Lock','None','Strap','Chain','Eye'],Corners:['Metal','None','Gems','Thorns','Bone'],Binding:['Leather','Scales','Velvet','Bone','Crystal']},
  stat:{atk:3,mag:15,def:1,spd:1},col:{c1:'Plum',c2:'Gold',c3:'Cream',c4:'Crimson',glow:'Violet',gemC:'Crimson'},
  blurb:'Black magic. Spells of fire, ice and lightning, some on every foe.'},
};
const WKINDS=Object.keys(WTYPES);
function newWeapon(kind,name){const T=WTYPES[kind],parts={};for(const[p,l]of Object.entries(T.parts))parts[p]=l[0];
  return Object.assign({kind,name:name||T.n,engr:'',elem:'None',tier:0,parts},JSON.parse(JSON.stringify(T.col)))}
const wc=(w,k,def)=>dyeOf(w[k],def);

/* ---------- little shapes shared by several weapons ---------- */
/* words along a blade, reading from the hilt toward the tip */
function engraveUp(b,str,x,y0,y1,c){str=String(str||'').toUpperCase();let y=y0;
  for(const ch of str){if(y-3<y1)break;const g=MINI[ch]||MINI['?'];for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(g[r*3+q]==='1')b.px(x+r,y-q,c);y-=4}}
/* the same text across a flat face (an axe head, a book cover) */
function engraveFlat(b,str,cx,y,c,maxW){str=String(str||'').toUpperCase();while(str.length&&miniW(str)>maxW)str=str.slice(0,-1);miniText(b,str,Math.round(cx-miniW(str)/2),y,c)}
/* tiny rune marks for when the weapon is too small to read */
function runeMarks(b,str,x,y0,y1,c){let h=0;for(const ch of String(str||''))h=(h*31+ch.charCodeAt(0))>>>0;if(!str)return;for(let y=y0;y>y1;y-=2){if((h>>(y&15))&1)b.px(x,y,c);h=(h*1103515245+12345)>>>0}}
function gemAt(b,x,y,r,c){b.ell(x,y,r,r,c,2);b.px(x-r*.4,y-r*.4,'#ffffff')}
function wrapGrip(b,x,y0,y1,w,c,kind,k){b.rect(Math.round(x-w/2),y0,Math.ceil(w),y1-y0,c);
  if(kind==='Criss-cross'||kind==='Diamond'){for(let y=y0;y<y1;y+=Math.max(2,k*2)){b.line(x-w/2,y,x+w/2,y+k,shade(c,-1));b.line(x+w/2,y,x-w/2,y+k,shade(c,1))}}
  else if(kind==='Spiral'){for(let y=y0;y<y1;y+=Math.max(2,k*2))b.line(x-w/2,y,x+w/2,y+k*1.2,shade(c,-1))}
  else if(kind==='Leather'){for(let y=y0+k;y<y1;y+=k*3)b.rect(Math.round(x-w/2),y,Math.ceil(w),Math.max(1,k*.6),shade(c,-1))}
  b.line(x-w/2+.5,y0,x-w/2+.5,y1-1,shade(c,1))}
function charmAt(b,x,y,kind,c,k){if(kind==='None')return;
  if(kind==='Tassel'){b.line(x,y,x+1*k,y+3*k,c,Math.max(1,k*.8));b.quill(x+1*k,y+2.4*k,x+1.4*k,y+6*k,2.4*k,c)}
  else if(kind==='Bell'){b.line(x,y,x,y+2*k,'#d8b048');b.ell(x,y+3.2*k,1.6*k,1.6*k,'#f2c84a',2)}
  else if(kind==='Feather'){b.line(x,y,x,y+2*k,'#8a5a32');b.leaf(x,y+2*k,x+2*k,y+8*k,2.4*k,c)}
  else if(kind==='Ribbon'){b.horn(x,y,x+3*k,y+2*k,x+1*k,y+6*k,1.6*k,c,1.2*k);b.horn(x,y,x-2*k,y+3*k,x-1*k,y+7*k,1.4*k,shade(c,-1),1*k)}
  else if(kind==='Chain'){for(let i=0;i<4;i++)b.ell(x+(i%2)*k*.6,y+i*1.6*k,.9*k,1*k,'#a8b0c0',0)}
  else if(kind==='Fur'){b.ell(x,y+2*k,2*k,2.6*k,c,1);for(let i=-1;i<=1;i++)b.px(x+i*k,y+4.4*k,shade(c,1))}}
function glyph(b,kind,cx,cy,r,c){const k=r/3.5,d=shade(c,-1);
  switch(kind){
    case 'Star':b.star(cx,cy,r,c);break;
    case 'Eye':b.ell(cx,cy,r,r*.55,c,0);b.ell(cx,cy,r*.4,r*.4,d,0);b.px(cx,cy,'#ffffff');break;
    case 'Moon':b.ell(cx,cy,r,r,c,0);b.ell(cx+r*.45,cy-r*.25,r*.8,r*.8,null,0);break;
    case 'Sun':b.ell(cx,cy,r*.55,r*.55,c,0);for(let i=0;i<8;i++){const a=i*Math.PI/4;b.line(cx+Math.cos(a)*r*.7,cy+Math.sin(a)*r*.7,cx+Math.cos(a)*r,cy+Math.sin(a)*r,c,Math.max(1,k*.7))}break;
    case 'Rune':b.line(cx,cy-r,cx,cy+r,c,Math.max(1,k*.7));b.line(cx,cy-r*.3,cx+r*.7,cy-r,c,Math.max(1,k*.7));b.line(cx,cy+r*.1,cx-r*.7,cy-r*.5,c,Math.max(1,k*.7));break;
    case 'Skull':b.ell(cx,cy-r*.2,r*.8,r*.7,c,0);b.rect(cx-r*.45,cy+r*.3,r*.9,r*.5,c);b.ell(cx-r*.32,cy-r*.15,r*.22,r*.25,d,0);b.ell(cx+r*.32,cy-r*.15,r*.22,r*.25,d,0);break;
    case 'Heart':b.ell(cx-r*.4,cy-r*.25,r*.5,r*.5,c,0);b.ell(cx+r*.4,cy-r*.25,r*.5,r*.5,c,0);b.tri(cx-r*.88,cy-r*.05,cx+r*.88,cy-r*.05,cx,cy+r*.9,c);break;
    case 'Flame':b.leaf(cx,cy+r,cx+r*.2,cy-r,r*1.3,c);b.leaf(cx,cy+r*.8,cx-r*.1,cy-r*.2,r*.6,lt(c));break;
    case 'Leaf':b.leaf(cx-r*.7,cy+r*.7,cx+r*.7,cy-r*.7,r*.9,c);b.line(cx-r*.6,cy+r*.6,cx+r*.5,cy-r*.5,d);break;
    case 'Snowflake':for(let i=0;i<3;i++){const a=i*Math.PI/3;b.line(cx-Math.cos(a)*r,cy-Math.sin(a)*r,cx+Math.cos(a)*r,cy+Math.sin(a)*r,c,Math.max(1,k*.6))}break;
    case 'Bolt':b.poly([[cx+r*.3,cy-r],[cx-r*.5,cy+r*.1],[cx,cy+r*.1],[cx-r*.3,cy+r],[cx+r*.5,cy-r*.2],[cx,cy-r*.2]],c);break;
    case 'Spiral':{let px0=cx,py0=cy;for(let t=0;t<12;t+=.25){const rr=t/12*r,x=cx+Math.cos(t)*rr,y=cy+Math.sin(t)*rr;b.line(px0,py0,x,y,c,Math.max(1,k*.6));px0=x;py0=y}}break;
    case 'Rose':b.ell(cx,cy-r*.2,r*.6,r*.55,c,0);b.ell(cx,cy-r*.2,r*.3,r*.3,d,0);b.line(cx,cy+r*.3,cx,cy+r,'#4ab048',Math.max(1,k*.6));b.leaf(cx,cy+r*.6,cx+r*.6,cy+r*.4,r*.35,'#4ab048');break;
    case 'Key':b.ell(cx-r*.5,cy-r*.5,r*.45,r*.45,c,0);b.ell(cx-r*.5,cy-r*.5,r*.18,r*.18,null,0);b.line(cx-r*.2,cy-r*.2,cx+r*.8,cy+r*.8,c,Math.max(1,k*.7));b.line(cx+r*.4,cy+r*.4,cx+r*.7,cy+r*.1,c);break;
    case 'Crown':b.poly([[cx-r,cy+r*.5],[cx+r,cy+r*.5],[cx+r,cy-r*.6],[cx+r*.5,cy-r*.05],[cx,cy-r*.8],[cx-r*.5,cy-r*.05],[cx-r,cy-r*.6]],c);break;
    case 'Sigil':b.ell(cx,cy,r,r,c,0);b.ell(cx,cy,r*.8,r*.8,null,0);b.tri(cx,cy-r*.75,cx+r*.65,cy+r*.4,cx-r*.65,cy+r*.4,c);b.tri(cx,cy-r*.4,cx+r*.35,cy+r*.2,cx-r*.35,cy+r*.2,null);break;
  }}
function gemShape(b,kind,cx,cy,r,c){const l=lt(c),d=shade(c,-1);
  switch(kind){
    case 'Orb':b.ell(cx,cy,r,r,c,2);break;
    case 'Crystal':b.poly([[cx,cy-r*1.3],[cx+r*.75,cy],[cx,cy+r*1.3],[cx-r*.75,cy]],c);b.poly([[cx,cy-r*1.3],[cx+r*.75,cy],[cx,cy]],l);break;
    case 'Star':b.star(cx,cy,r*1.2,c);b.ell(cx,cy,r*.35,r*.35,l,0);break;
    case 'Moon':b.ell(cx,cy,r,r,c,2);b.ell(cx+r*.5,cy-r*.3,r*.8,r*.8,null,0);break;
    case 'Heart':glyph(b,'Heart',cx,cy,r*1.1,c);break;
    case 'Diamond':b.poly([[cx-r,cy-r*.3],[cx-r*.5,cy-r*.8],[cx+r*.5,cy-r*.8],[cx+r,cy-r*.3],[cx,cy+r]],c);b.line(cx-r,cy-r*.3,cx+r,cy-r*.3,l);break;
    case 'Skull':glyph(b,'Skull',cx,cy,r*1.15,c);break;
    case 'Eye':b.ell(cx,cy,r*1.1,r*.8,'#f4f4f8',0);b.ell(cx,cy,r*.6,r*.6,c,0);b.ell(cx,cy,r*.25,r*.3,INK,0);break;
  }
  if(kind!=='Moon'&&kind!=='Eye')b.px(cx-r*.35,cy-r*.45,'#ffffff')}

/* ---------- each kind ---------- */
const WDRAW={
 sword(w,k){const b=new Buf(16*k,34*k),x=8*k,P=w.parts,m=wc(w,'c1','Silver'),g=wc(w,'c2','Gold'),gr=wc(w,'c3','Leather'),a=wc(w,'c4','Crimson');
  const top=3*k,gy=24.5*k;
  const blade=P.Blade;let bw=blade==='Broad'?4.6*k:blade==='Rapier'?1.6*k:3.2*k;
  if(blade==='Leaf'){b.leaf(x,gy,x,top-1*k,5.4*k,m)}
  else if(blade==='Flamberge'){const pts=[],pts2=[];for(let y=gy;y>top+3*k;y-=k){const o=Math.sin(y/k*.9)*.9*k;pts.push([x-bw/2+o,y]);pts2.unshift([x+bw/2+o,y])}b.poly([...pts,[x,top],...pts2],m)}
  else if(blade==='Scimitar'){b.poly([[x-1.6*k,gy],[x+1.6*k,gy],[x+3*k,top+8*k],[x+1*k,top],[x-1.4*k,top+6*k]],m)}
  else if(blade==='Crystal'){b.poly([[x-2*k,gy],[x+2*k,gy],[x+2.4*k,top+8*k],[x,top-1*k],[x-2.4*k,top+8*k]],mix(m,'#c8f0ff',.4));for(let y=gy-2*k;y>top+4*k;y-=4*k)b.line(x-2*k,y,x+2*k,y-2*k,lt(mix(m,'#ffffff',.5)))}
  else{b.rect(Math.round(x-bw/2),top+2*k,Math.round(bw),gy-top-2*k,m);b.tri(x-bw/2,top+2*k,x+bw/2,top+2*k,x,top-1*k,m);
    if(blade==='Serrated')for(let y=gy-2*k;y>top+3*k;y-=2*k)b.tri(x+bw/2-.5,y,x+bw/2-.5,y-1.4*k,x+bw/2+1.2*k,y-.4*k,m)}
  /* the light along the edge and the fuller down the middle */
  b.tint((xx,yy,v)=>v===m&&yy<gy?(xx<x-.5?shade(m,1):xx>x+bw/2-1.2?shade(m,-1):undefined):undefined);
  if(blade!=='Rapier'&&blade!=='Crystal'){b.line(x,gy-1,x,top+4*k,shade(m,2))}
  if(k>=2&&w.engr)engraveUp(b,w.engr,Math.round(x-2),gy-2*k,top+3*k,shade(m,-2));else if(w.engr)runeMarks(b,w.engr,Math.round(x),gy-2,top+4,shade(m,-2));
  /* guard */
  const G=P.Guard,gy0=gy;
  if(G==='Cross'){b.rect(x-4.5*k,gy0,9*k,1.8*k,g);b.ell(x-4.5*k,gy0+.9*k,1.1*k,1.1*k,g,0);b.ell(x+4.5*k,gy0+.9*k,1.1*k,1.1*k,g,0)}
  else if(G==='Disc'){b.ell(x,gy0+.8*k,3.4*k,1.4*k,g,2)}
  else if(G==='Wings'){b.leaf(x,gy0+1*k,x-6*k,gy0-3*k,2.6*k,g);b.leaf(x,gy0+1*k,x+6*k,gy0-3*k,2.6*k,g)}
  else if(G==='Ring'){b.ell(x,gy0+1*k,3*k,2.2*k,g,0);b.ell(x,gy0+1*k,1.8*k,1.1*k,null,0);b.rect(x-1*k,gy0,2*k,2*k,g)}
  else if(G==='Basket'){b.ell(x+1*k,gy0+2.5*k,3.6*k,3.2*k,g,2);b.ell(x+1.6*k,gy0+2.6*k,2.2*k,2*k,null,0)}
  else if(G==='Claw'){b.horn(x,gy0+1*k,x-4*k,gy0,x-5*k,gy0-3*k,2*k,g,.6);b.horn(x,gy0+1*k,x+4*k,gy0,x+5*k,gy0-3*k,2*k,g,.6)}
  else if(G==='Crescent'){b.horn(x-5*k,gy0-2*k,x,gy0+3*k,x+5*k,gy0-2*k,1.8*k,g,1*k)}
  if(G!=='None'&&w.elem!=='None')gemAt(b,x,gy0+.9*k,.9*k,wc(w,'gemC','Crimson'));
  wrapGrip(b,x,gy0+2*k,gy0+7.4*k,2.2*k,gr,P.Wrap,k);
  const pm=P.Pommel,py=gy0+8.4*k;
  if(pm==='Round')b.ell(x,py,1.6*k,1.4*k,g,2);
  else if(pm==='Gem'){b.ell(x,py,1.8*k,1.6*k,g,0);gemAt(b,x,py,1.1*k,wc(w,'gemC','Crimson'))}
  else if(pm==='Spike')b.tri(x-1.4*k,py-.6*k,x+1.4*k,py-.6*k,x,py+2.4*k,g);
  else if(pm==='Skull')glyph(b,'Skull',x,py+.4*k,1.8*k,'#efe9d8');
  else if(pm==='Ring'){b.ell(x,py+.6*k,1.6*k,1.6*k,g,0);b.ell(x,py+.6*k,.7*k,.7*k,null,0)}
  else if(pm==='Fang')b.horn(x,py-.6*k,x+1.6*k,py+1*k,x+.6*k,py+3*k,1.6*k,'#f4f0e0',.6);
  charmAt(b,x,py+1.4*k,P.Charm,a,k);
  return{buf:b,gx:x,gy:gy0+4.6*k}},
 greatsword(w,k){const b=new Buf(22*k,46*k),x=11*k,P=w.parts,m=wc(w,'c1','Steel'),g=wc(w,'c2','Charcoal'),gr=wc(w,'c3','Maroon'),a=wc(w,'c4','Gold');
  const top=2*k,gy=33*k,bl=P.Blade;
  if(bl==='Buster'){b.rect(x-3.6*k,top+2*k,7.2*k,gy-top-2*k,m);b.poly([[x-3.6*k,top+2.4*k],[x+3.6*k,top+2.4*k],[x+3.6*k,top]],m);b.rect(x-1.2*k,top+8*k,2.4*k,3*k,shade(m,-2));b.rect(x-1.2*k,top+15*k,2.4*k,3*k,shade(m,-2))}
  else if(bl==='Executioner'){b.rect(x-3*k,top,7.4*k,gy-top,m);b.ell(x-1.5*k,top+4*k,1.2*k,1.2*k,null,0)}
  else if(bl==='Cleaver'){b.poly([[x-2.4*k,gy],[x+2.6*k,gy],[x+5*k,top+4*k],[x+4*k,top],[x-2.4*k,top+2*k]],m)}
  else if(bl==='Dragonbone'){b.poly([[x-2.6*k,gy],[x+2.6*k,gy],[x+3.4*k,top+10*k],[x,top-1*k],[x-3.4*k,top+10*k]],'#efe9d8');for(let y=gy-3*k;y>top+5*k;y-=3.4*k){b.tri(x-3*k,y,x-3*k,y-2*k,x-5*k,y-1.6*k,'#efe9d8');b.tri(x+3*k,y,x+3*k,y-2*k,x+5*k,y-1.6*k,'#efe9d8')}b.line(x,gy,x,top+4*k,m,Math.max(1,k))}
  else if(bl==='Twin Edge'){b.rect(x-3*k,top+3*k,6*k,gy-top-3*k,m);b.tri(x-3*k,top+3*k,x+3*k,top+3*k,x,top-1*k,m);b.rect(x-.5*k,top+6*k,1*k,gy-top-8*k,null)}
  else{const bw=bl==='Runic'?5.4*k:4.8*k;b.rect(Math.round(x-bw/2),top+3*k,Math.round(bw),gy-top-3*k,m);b.tri(x-bw/2,top+3*k,x+bw/2,top+3*k,x,top-1*k,m);if(bl==='Runic'){for(let y=gy-3*k;y>top+5*k;y-=3*k)glyph(b,'Rune',x,y,1.1*k,wc(w,'glow','Amber'))}}
  b.tint((xx,yy,v)=>v===m&&yy<gy?(xx<x-1.5*k?shade(m,1):xx>x+1.5*k?shade(m,-1):undefined):undefined);
  if(bl!=='Dragonbone'&&bl!=='Twin Edge'&&bl!=='Runic')b.line(x,gy-1,x,top+5*k,shade(m,2));
  if(k>=2&&w.engr)engraveUp(b,w.engr,Math.round(x-2),gy-2*k,top+4*k,shade(m,-2));else if(w.engr)runeMarks(b,w.engr,Math.round(x),gy-2,top+5,shade(m,-2));
  const G=P.Guard;
  if(G==='Cross'){b.rect(x-6*k,gy,12*k,2.2*k,g)}else if(G==='Wings'){b.leaf(x,gy+1*k,x-8*k,gy-4*k,3*k,g);b.leaf(x,gy+1*k,x+8*k,gy-4*k,3*k,g)}
  else if(G==='Block'){b.rect(x-4.6*k,gy-1*k,9.2*k,3.4*k,g)}else if(G==='Horns'){b.horn(x,gy+1*k,x-6*k,gy+1*k,x-6*k,gy-5*k,2.4*k,g,.6);b.horn(x,gy+1*k,x+6*k,gy+1*k,x+6*k,gy-5*k,2.4*k,g,.6)}
  else if(G==='Skull'){b.rect(x-5*k,gy,10*k,2*k,g);glyph(b,'Skull',x,gy+1*k,2.6*k,'#efe9d8')}
  if(w.elem!=='None')gemAt(b,x,gy+1*k,1.1*k,wc(w,'gemC','Amber'));
  wrapGrip(b,x,gy+2.2*k,gy+10*k,2.6*k,gr,P.Wrap,k);
  const pm=P.Pommel,py=gy+11*k;
  if(pm==='Round')b.ell(x,py,2*k,1.8*k,g,2);else if(pm==='Gem'){b.ell(x,py,2.2*k,2*k,g,0);gemAt(b,x,py,1.3*k,wc(w,'gemC','Amber'))}
  else if(pm==='Spike')b.tri(x-1.8*k,py-.8*k,x+1.8*k,py-.8*k,x,py+3*k,g);else if(pm==='Skull')glyph(b,'Skull',x,py+.5*k,2.2*k,'#efe9d8');else if(pm==='Ring'){b.ell(x,py+.6*k,2*k,2*k,g,0);b.ell(x,py+.6*k,.9*k,.9*k,null,0)}
  charmAt(b,x,py+1.6*k,P.Charm,a,k);
  return{buf:b,gx:x,gy:gy+6*k}},
 katana(w,k,second){const b=new Buf(14*k,40*k),x=6*k,P=w.parts,m=wc(w,second?'c5':'c1','Platinum'),g=wc(w,'c2','Brass'),gr=wc(w,'c3','Navy'),a=wc(w,'c4','Crimson');
  const bl=P.Blade,len=bl==='Nodachi'?27*k:bl==='Wakizashi'?15*k:21*k,gy=31*k,top=gy-len,curve=bl==='Tachi'?2.6*k:bl==='Serpent'?0:1.6*k;
  /* the blade: a smooth curve from the habaki to the point */
  const bx=t=>x+.1*k+(bl==='Serpent'?Math.sin(t*9)*1*k:curve*t*t),wid=t=>t>.9?(1-t)/.1*2.4*k+.5:2.4*k;
  for(let i=0;i<=len*2;i++){const t=i/(len*2),y=gy-t*len,X=bx(t),hw=wid(t)/2;for(let xx=Math.floor(X-hw);xx<=Math.ceil(X+hw);xx++){if(xx+.5>=X-hw&&xx+.5<=X+hw)b.px(xx,y,m)}}
  const H=P.Hamon;if(H!=='None')for(let i=2;i<len*2*.92;i+=1){const t=i/(len*2),y=gy-t*len,wv=H==='Wave'?Math.sin(t*16)*.45*k:H==='Flame'?((i>>1)%4===0?-.6*k:.2*k):0;b.px(bx(t)+.5*k+wv,y,'#ffffff')}
  for(let i=0;i<=len*2;i++){const t=i/(len*2),y=gy-t*len;b.px(bx(t)-wid(t)/2+.2,y,shade(m,-1))}

  if(k>=2&&w.engr&&!second)engraveUp(b,w.engr,Math.round(x-2.4),gy-2*k,top+5*k,shade(m,-2));else if(w.engr&&!second)runeMarks(b,w.engr,Math.round(x),gy-2,top+4,shade(m,-2));
  b.rect(x-1.2*k,gy-1*k,2.8*k,1.4*k,'#d8b048');
  const T=P.Tsuba,ty=gy+1*k;
  if(T==='Round')b.ell(x+.2*k,ty,3*k,1.2*k,g,2);else if(T==='Square')b.rect(x-2.6*k,ty-1*k,5.6*k,2*k,g);
  else if(T==='Flower'){for(let i=0;i<4;i++)b.ell(x+.2*k+(i-1.5)*1.6*k,ty,1.2*k,1.2*k,g,1)}else if(T==='Lotus'){b.leaf(x,ty,x-3.4*k,ty-1.6*k,1.6*k,g);b.leaf(x,ty,x+3.6*k,ty-1.6*k,1.6*k,g);b.ell(x+.2*k,ty,1.4*k,1*k,g,0)}
  else if(T==='Cloud'){b.ell(x-1.4*k,ty,1.6*k,1.2*k,g,1);b.ell(x+1.6*k,ty,1.8*k,1.3*k,g,1)}else if(T==='Crescent'){b.horn(x-3*k,ty-1.6*k,x+.2*k,ty+1.6*k,x+3.4*k,ty-1.6*k,1.4*k,g,.8*k)}
  const gl=bl==='Nodachi'?9*k:7*k;b.rect(x-1.2*k,ty+1*k,2.8*k,gl,'#f4f0e4');
  if(P.Wrap==='Diamond'){for(let y=ty+1*k;y<ty+1*k+gl;y+=2*k){b.line(x-1.2*k,y,x+1.6*k,y+1.4*k,gr,Math.max(1,k*.8));b.line(x+1.6*k,y,x-1.2*k,y+1.4*k,gr,Math.max(1,k*.8))}}
  else if(P.Wrap==='Spiral'){for(let y=ty+1*k;y<ty+1*k+gl;y+=2*k)b.line(x-1.2*k,y,x+1.6*k,y+1.4*k,gr,Math.max(1,k*.8))}else b.rect(x-1.2*k,ty+1*k,2.8*k,gl,gr);
  b.ell(x+.2*k,ty+1.2*k+gl,1.6*k,1*k,shade(g,-1),0);
  charmAt(b,x+.2*k,ty+1.6*k+gl,P.Charm,a,k);
  return{buf:b,gx:x+.2*k,gy:ty+gl*.55}},
 greataxe(w,k){const b=new Buf(24*k,44*k),x=11*k,P=w.parts,m=wc(w,'c1','Steel'),g=wc(w,'c2','Bronze'),gr=wc(w,'c3','Brown'),a=wc(w,'c4','Crimson');
  const hy=9*k,bot=42*k,hf=P.Haft;
  const hc=hf==='Iron'?'#8a8ca0':hf==='Bone'?'#efe9d8':gr;b.rect(x-1.1*k,hy-4*k,2.4*k,bot-hy+4*k,hc);
  if(hf==='Twisted')for(let y=hy;y<bot;y+=2*k)b.line(x-1.1*k,y,x+1.2*k,y+1.4*k,shade(hc,-1));if(hf==='Bone')for(let y=hy+6*k;y<bot;y+=7*k)b.ell(x,y,1.8*k,1*k,hc,0);
  b.line(x-.6*k,hy,x-.6*k,bot-1,shade(hc,1));
  const H=P.Head,ex=x+1*k;
  if(H==='Crescent'){b.poly([[ex,hy-3*k],[ex+5*k,hy-7*k],[ex+10*k,hy-6*k],[ex+11*k,hy+2*k],[ex+9*k,hy+9*k],[ex+5*k,hy+8*k],[ex,hy+4*k]],m)}
  else if(H==='Double'){for(const s of[-1,1]){const e=s>0?ex:x-1.2*k;b.poly([[e,hy-3*k],[e+s*4*k,hy-6*k],[e+s*9*k,hy-6*k],[e+s*9*k,hy+8*k],[e+s*4*k,hy+8*k],[e,hy+4*k]],m)}}
  else if(H==='Bearded'){b.poly([[ex,hy-3*k],[ex+7*k,hy-4*k],[ex+9*k,hy+1*k],[ex+8*k,hy+11*k],[ex+4*k,hy+5*k],[ex,hy+3*k]],m)}
  else if(H==='Halberd'){b.poly([[ex,hy-2*k],[ex+8*k,hy-3*k],[ex+9*k,hy+3*k],[ex+5*k,hy+6*k],[ex,hy+3*k]],m);b.quill(x+.1*k,hy-3*k,x+.1*k,hy-13*k,3.4*k,m);b.tri(x-1.2*k,hy,x-1.2*k,hy+2*k,x-5*k,hy-1*k,m)}
  else if(H==='Moon'){b.ell(ex+5*k,hy+2*k,7*k,7*k,m,0);b.ell(ex+1*k,hy+2*k,5.5*k,6*k,null,0);b.rect(ex-1*k,hy-1*k,3*k,6*k,m)}
  else if(H==='Saw'){b.poly([[ex,hy-4*k],[ex+8*k,hy-4*k],[ex+8*k,hy+7*k],[ex,hy+5*k]],m);for(let y=hy-4*k;y<hy+7*k;y+=2*k)b.tri(ex+8*k-.5,y,ex+8*k-.5,y+2*k,ex+10*k,y+1*k,m)}
  b.tint((xx,yy,v)=>v===m?(yy<hy?shade(m,1):xx>ex+7*k?shade(m,2):yy>hy+5*k?shade(m,-1):undefined):undefined);
  if(w.engr){if(k>=2)engraveFlat(b,w.engr,ex+5*k,hy-.5*k,shade(m,-2),8*k);else runeMarks(b,w.engr,ex+4,hy+2,hy-2,shade(m,-2))}
  b.rect(x-1.8*k,hy-3*k,3.8*k,7*k,g);
  const Tp=P.Top;if(Tp==='Spike')b.tri(x-1.4*k,hy-3*k,x+1.6*k,hy-3*k,x+.1*k,hy-9*k,m);else if(Tp==='Blade')b.quill(x+.1*k,hy-3*k,x+.1*k,hy-10*k,3*k,m);else if(Tp==='Gem')gemAt(b,x+.1*k,hy-5*k,1.8*k,wc(w,'gemC','Crimson'));
  if(w.elem!=='None')gemAt(b,x+.1*k,hy+.5*k,1.2*k,wc(w,'gemC','Crimson'));
  const gy=33*k;wrapGrip(b,x+.1*k,gy-4*k,gy+5*k,2.6*k,P.Wrap==='Plain'?shade(gr,-1):gr,P.Wrap,k);
  b.ell(x+.1*k,bot,1.8*k,1.4*k,g,2);charmAt(b,x+.1*k,gy+5*k,P.Charm,a,k);
  return{buf:b,gx:x+.1*k,gy}},
 warhammer(w,k){const b=new Buf(22*k,40*k),x=11*k,P=w.parts,m=wc(w,'c1','Slate'),g=wc(w,'c2','Brass'),gr=wc(w,'c3','Chocolate'),a=wc(w,'c4','Royal');
  const hy=8*k,bot=38*k,hf=P.Haft,hc=hf==='Iron'?'#8a8ca0':hf==='Bone'?'#efe9d8':gr;
  b.rect(x-1.1*k,hy,2.4*k,bot-hy,hc);if(hf==='Twisted')for(let y=hy;y<bot;y+=2*k)b.line(x-1.1*k,y,x+1.2*k,y+1.4*k,shade(hc,-1));b.line(x-.6*k,hy,x-.6*k,bot-1,shade(hc,1));
  const H=P.Head;
  if(H==='Block'){b.rect(x-6*k,hy-4*k,12*k,8*k,m);b.rect(x-6*k,hy-4*k,12*k,1.2*k,shade(m,1))}
  else if(H==='Round'){b.ell(x,hy,6*k,5*k,m,2)}
  else if(H==='Morningstar'){b.ell(x,hy,5*k,5*k,m,2);for(let i=0;i<8;i++){const an=i*Math.PI/4;b.tri(x+Math.cos(an)*4*k-Math.sin(an)*1.2*k,hy+Math.sin(an)*4*k+Math.cos(an)*1.2*k,x+Math.cos(an)*4*k+Math.sin(an)*1.2*k,hy+Math.sin(an)*4*k-Math.cos(an)*1.2*k,x+Math.cos(an)*7.6*k,hy+Math.sin(an)*7.6*k,shade(m,1))}}
  else if(H==='Anvil'){b.poly([[x-8*k,hy-4*k],[x+7*k,hy-4*k],[x+5*k,hy],[x+3*k,hy+4*k],[x-3*k,hy+4*k],[x-4*k,hy],[x-6*k,hy-1.6*k]],m)}
  else if(H==='Twin'){b.rect(x-8*k,hy-3*k,6*k,7*k,m);b.rect(x+2.2*k,hy-3*k,6*k,7*k,m);b.rect(x-2.2*k,hy-1.4*k,4.4*k,4*k,shade(m,-1))}
  else if(H==='Spiked'){b.rect(x-5*k,hy-4*k,10*k,8*k,m);for(const s of[-1,1])b.tri(x+s*5*k,hy-2.4*k,x+s*5*k,hy+2.4*k,x+s*9*k,hy,shade(m,1))}
  else if(H==='Hex'){b.poly([[x-6*k,hy],[x-3*k,hy-5*k],[x+3*k,hy-5*k],[x+6*k,hy],[x+3*k,hy+5*k],[x-3*k,hy+5*k]],m)}
  b.tint((xx,yy,v)=>v===m&&yy>hy+2*k?shade(m,-1):undefined);
  if(w.engr){if(k>=2)engraveFlat(b,w.engr,x,hy-1*k,shade(m,-2),11*k);else runeMarks(b,w.engr,x-3,hy+1,hy-2,shade(m,-2))}
  b.rect(x-2*k,hy+3*k,4.2*k,2*k,g);
  const Tp=P.Top;if(Tp==='Spike')b.tri(x-1.4*k,hy-4*k,x+1.6*k,hy-4*k,x+.1*k,hy-9*k,shade(m,1));else if(Tp==='Gem')gemAt(b,x+.1*k,hy-6*k,1.8*k,wc(w,'gemC','Azure'));
  if(w.elem!=='None')gemAt(b,x,hy,1.4*k,wc(w,'gemC','Azure'));
  const gy=30*k;wrapGrip(b,x+.1*k,gy-4*k,gy+5*k,2.6*k,P.Wrap==='Plain'?shade(gr,-1):gr,P.Wrap,k);
  b.ell(x+.1*k,bot,1.8*k,1.4*k,g,2);charmAt(b,x+.1*k,gy+5*k,P.Charm,a,k);
  return{buf:b,gx:x+.1*k,gy}},
 bow(w,k,drawn=0){const b=new Buf(16*k,34*k),P=w.parts,m=wc(w,'c1','Leather'),g=wc(w,'c2','Gold'),st=wc(w,'c3','Cream'),a=wc(w,'c4','Forest');
  const cx=5*k,cy=17*k,L=P.Limbs,h=L==='Longbow'?16*k:L==='Compound'?13*k:14*k,bulge=L==='Recurve'?5*k:L==='Crescent'?7*k:L==='Compound'?3.4*k:5*k;
  const pt=t=>{const y=cy+t*h,x0=cx+bulge*(1-t*t);let x=x0;if(L==='Recurve'||L==='Wing')x=x0-Math.pow(Math.abs(t),6)*3*k*(L==='Wing'?1.6:1);return[x,y]};
  const lc=L==='Bone'?'#efe9d8':L==='Branch'?'#7a5a32':m;
  for(let i=0;i<40;i++){const t0=-1+i/20,t1=-1+(i+1)/20,[x0,y0]=pt(t0),[x1,y1]=pt(t1),wd=(1.2+1.4*(1-Math.abs(t0)))*k;b.line(x0,y0,x1,y1,lc,Math.max(1,Math.round(wd)))}
  if(L==='Compound')for(const s of[-1,1]){const[x,y]=pt(s*.95);b.ell(x,y,1.4*k,1.4*k,g,0)}
  if(L==='Wing')for(const s of[-1,1])for(let i=0;i<3;i++){const[x,y]=pt(s*(.4+i*.2));b.leaf(x,y,x+3*k,y+s*2*k,1.6*k,shade(lc,1))}
  if(L==='Branch')for(const s of[-1,1]){const[x,y]=pt(s*.55);b.leaf(x,y,x+3*k,y-s*1*k,1.4*k,'#4ab048')}
  if(L==='Bone')for(let t=-.8;t<=.8;t+=.4){const[x,y]=pt(t);b.ell(x,y,1.5*k,.8*k,'#efe9d8',0)}
  const top=pt(-1),bot=pt(1),pull=drawn?4*k:0;
  b.line(top[0],top[1],cx-pull,cy,st);b.line(cx-pull,cy,bot[0],bot[1],st);
  const Tp=P.Tips;for(const p of[top,bot]){if(Tp==='Blades')b.quill(p[0],p[1],p[0]-2*k,p[1]+(p===top?-3:3)*k,1.8*k,'#c8ccd8');else if(Tp==='Gems')gemAt(b,p[0],p[1],1.1*k,wc(w,'gemC','Green'));else if(Tp==='Feathers')b.leaf(p[0],p[1],p[0]+2*k,p[1]+(p===top?-4:4)*k,1.8*k,a)}
  const gp=pt(0),G=P.Grip;b.rect(gp[0]-1.3*k,cy-2*k,2.6*k,4*k,G==='Metal'?g:G==='Carved'?shade(lc,-1):a);if(G==='Wrapped')for(let y=cy-2*k;y<cy+2*k;y+=k)b.px(gp[0]-1*k,y,shade(a,1));
  if(w.elem!=='None')gemAt(b,gp[0],cy-2.6*k,.9*k,wc(w,'gemC','Green'));
  if(w.engr&&k>=2){const s=String(w.engr).toUpperCase().slice(0,4);for(let i=0;i<s.length;i++){const[x,y]=pt(-.7+i*.12);miniText(b,s[i],Math.round(x-1),Math.round(y-2),shade(lc,-2))}}
  charmAt(b,gp[0]+.6*k,cy+2*k,P.Charm,a,k);
  return{buf:b,gx:gp[0],gy:cy,string:[top,bot]}},
 fists(w,k){const b=new Buf(12*k,12*k),P=w.parts,m=wc(w,'c1','Steel'),g=wc(w,'c2','Gold'),a=wc(w,'c3','Crimson'),c4=wc(w,'c4','White'),cx=5*k,cy=6*k,S=P.Style;
  if(S==='Wraps'){b.ell(cx,cy,3.8*k,3.4*k,c4,1);for(let y=cy-3*k;y<cy+3*k;y+=1.4*k)b.line(cx-3.6*k,y,cx+3.6*k,y+.8*k,shade(c4,-1))}
  else if(S==='Claws'){b.ell(cx-.4*k,cy,3.6*k,3.2*k,m,2);for(let i=0;i<3;i++)b.horn(cx+2.4*k,cy-2*k+i*2*k,cx+5*k,cy-2.4*k+i*2*k,cx+7*k,cy-1*k+i*2*k,1.4*k,shade(m,1),.6)}
  else if(S==='Dragon'){b.ell(cx,cy,4*k,3.6*k,a,2);for(let i=0;i<3;i++)b.tri(cx-3*k+i*2*k,cy-3.2*k,cx-1.4*k+i*2*k,cy-3.2*k,cx-2.6*k+i*2*k,cy-5.4*k,g);b.ell(cx+2.6*k,cy-1*k,.9*k,.9*k,'#ffe04a',0)}
  else{b.ell(cx,cy,S==='Gauntlets'?4.2*k:3.8*k,S==='Gauntlets'?3.8*k:3.2*k,m,2);if(S==='Gauntlets')b.rect(cx-5*k,cy-2.4*k,3*k,4.8*k,shade(m,-1));if(S==='Cestus')for(let y=cy-2*k;y<cy+3*k;y+=1.6*k)b.line(cx-3*k,y,cx+3*k,y,a)}
  if(S!=='Claws'&&S!=='Dragon'){if(S==='Knuckles'){b.rect(cx+2*k,cy-3*k,1.8*k,6*k,g)}for(let i=0;i<3;i++)b.ell(cx+3*k,cy-2*k+i*2*k,.9*k,.8*k,shade(m,1),0)}
  const St=P.Studs;for(let i=0;i<3;i++){const y=cy-2*k+i*2*k,x=cx+3.8*k;if(St==='Studs')b.ell(x,y,.8*k,.8*k,g,0);else if(St==='Spikes')b.tri(x,y-.8*k,x,y+.8*k,x+2.2*k,y,'#e0e4ec');else if(St==='Blades')b.quill(x-1*k,y,x+3.4*k,y-1*k,1.4*k,'#e0e4ec')}
  if(P.Plate==='Gem'||w.elem!=='None')gemAt(b,cx-1*k,cy-.6*k,1*k,wc(w,'gemC','Orange'));
  if(P.Plate==='Engraved'&&k>=2&&w.engr)engraveFlat(b,String(w.engr).slice(0,2),cx-1*k,cy+.4*k,shade(m,-2),7*k);
  charmAt(b,cx-3*k,cy+2*k,P.Charm,c4,k*.7);
  return{buf:b,gx:cx-1*k,gy:cy}},
 staff(w,k){const b=new Buf(20*k,52*k),x=10*k,P=w.parts,m=wc(w,'c1','Gold'),g=wc(w,'c2','Gold'),sh=wc(w,'c3','Leather'),a=wc(w,'c4','Sky'),gc=wc(w,'gemC','Azure');
  const hy=10*k,bot=50*k,S=P.Shaft,sc=S==='Metal'?'#a8b0c0':S==='Bone'?'#efe9d8':S==='Crystal'?mix(gc,'#ffffff',.5):sh;
  if(S==='Gnarled'){for(let y=hy+4*k;y<bot;y+=k){const o=Math.sin(y/k*.5)*.9*k;b.rect(Math.round(x-1.2*k+o),y,Math.ceil(2.4*k),k,sc)}b.ell(x+1*k,hy+14*k,1.6*k,1.2*k,sc,0)}
  else{b.rect(x-1.1*k,hy+4*k,2.4*k,bot-hy-4*k,sc);b.line(x-.6*k,hy+4*k,x-.6*k,bot-1,shade(sc,1));if(S==='Bone')for(let y=hy+9*k;y<bot;y+=8*k)b.ell(x+.1*k,y,1.8*k,1*k,sc,0)}
  if(w.engr){if(k>=2)engraveUp(b,w.engr,Math.round(x-2),bot-4*k,hy+18*k,shade(sc,-2));else runeMarks(b,w.engr,x,bot-4,hy+20,shade(sc,-2))}
  const H=P.Head,gx=x+.1*k,gy=hy;
  if(H==='Ring'){b.ell(gx,gy,5*k,5.4*k,m,0);b.ell(gx,gy,3.8*k,4.2*k,null,0)}
  else if(H==='Crescent'){b.horn(gx-1*k,gy+5*k,gx-6*k,gy-2*k,gx+1*k,gy-7*k,2.4*k,m,1*k);b.horn(gx+1*k,gy+5*k,gx+6*k,gy,gx+4*k,gy-5*k,1.6*k,m,.8*k)}
  else if(H==='Branch'){for(const[ex,ey]of[[-5,-6],[4,-7],[6,-1],[-6,0]])b.horn(gx,gy+4*k,gx+ex*.4*k,gy-1*k,gx+ex*k,gy+ey*k,1.8*k,sc,.8);for(const[ex,ey]of[[-5,-6],[4,-7],[6,-1]])b.leaf(gx+ex*k,gy+ey*k,gx+ex*k+2*k,gy+ey*k-2*k,1.6*k,'#4ab048')}
  else if(H==='Wings'){b.leaf(gx-1*k,gy+3*k,gx-8*k,gy-5*k,3.4*k,m);b.leaf(gx+1*k,gy+3*k,gx+8*k,gy-5*k,3.4*k,m);b.leaf(gx-1*k,gy+3*k,gx-6*k,gy-1*k,2*k,lt(m))}
  else if(H==='Cage'){for(const ox of[-3.4,-1.2,1.2,3.4])b.line(gx+ox*k*.6,gy+4*k,gx+ox*k,gy-1*k,m,Math.max(1,k*.8));b.horn(gx-3.4*k,gy-1*k,gx,gy-7*k,gx+3.4*k,gy-1*k,1.2*k,m,1.2*k)}
  else if(H==='Star'){b.star(gx,gy,6*k,m);b.star(gx,gy,4*k,null)}
  else if(H==='Serpent'){b.horn(gx,gy+5*k,gx+6*k,gy+1*k,gx+1*k,gy-4*k,2.4*k,'#4ab048',2*k);b.horn(gx+1*k,gy-4*k,gx-5*k,gy-7*k,gx-4*k,gy-1*k,2.2*k,'#4ab048',1.2*k);b.px(gx-4*k,gy-2*k,'#ffe04a')}
  b.rect(x-1.6*k,gy+4*k,3.4*k,1.6*k,g);
  gemShape(b,P.Gem,gx,gy,2.4*k,gc);
  const Tr=P.Trim,ry=gy+6*k;
  if(Tr==='Ribbons'){b.horn(gx,ry,gx+4*k,ry+4*k,gx+3*k,ry+10*k,1.6*k,a,1*k);b.horn(gx,ry,gx-3*k,ry+5*k,gx-2*k,ry+11*k,1.4*k,shade(a,-1),1*k)}
  else if(Tr==='Chains')for(let i=0;i<4;i++){b.ell(gx+3*k,ry+i*1.6*k,.8*k,.9*k,'#a8b0c0',0);b.ell(gx-3*k,ry+i*1.6*k,.8*k,.9*k,'#a8b0c0',0)}
  else if(Tr==='Feathers'){b.leaf(gx+1*k,ry,gx+5*k,ry+8*k,2.2*k,a);b.leaf(gx-1*k,ry,gx-4*k,ry+7*k,2*k,lt(a))}
  else if(Tr==='Bells'){for(const s of[-1,1]){b.line(gx+s*1.6*k,ry,gx+s*3*k,ry+2*k,'#d8b048');b.ell(gx+s*3*k,ry+3*k,1.3*k,1.3*k,'#f2c84a',2)}}
  if(w.elem!=='None'&&H!=='Plain')gemAt(b,gx,ry+2.6*k,.9*k,ELEMS[w.elem].c);
  b.ell(x+.1*k,bot-.5*k,1.6*k,1.2*k,g,2);
  return{buf:b,gx,gy:30*k,gemX:gx,gemY:gy}},
 grimoire(w,k,open=0){const P=w.parts,cv=wc(w,'c1','Plum'),g=wc(w,'c2','Gold'),pg=wc(w,'c3','Cream'),rb=wc(w,'c4','Crimson'),gc=wc(w,'gemC','Crimson');
  const Bd=P.Binding,cov=Bd==='Bone'?'#efe9d8':Bd==='Crystal'?mix(cv,'#ffffff',.35):cv;
  if(open){const b=new Buf(20*k,14*k),cx=10*k,cy=7*k;b.poly([[cx,cy+4*k],[cx-9*k,cy+3*k],[cx-9*k,cy-4*k],[cx,cy-3*k]],cov);b.poly([[cx,cy+4*k],[cx+9*k,cy+3*k],[cx+9*k,cy-4*k],[cx,cy-3*k]],cov);
    b.poly([[cx,cy+3*k],[cx-8*k,cy+2*k],[cx-8*k,cy-5*k],[cx,cy-4*k]],pg);b.poly([[cx,cy+3*k],[cx+8*k,cy+2*k],[cx+8*k,cy-5*k],[cx,cy-4*k]],shade(pg,-1));
    for(let i=0;i<3;i++){b.line(cx-7*k,cy-3*k+i*2*k,cx-1.4*k,cy-2.6*k+i*2*k,shade(pg,-2));b.line(cx+1.4*k,cy-2.6*k+i*2*k,cx+7*k,cy-3*k+i*2*k,shade(pg,-2))}
    glyph(b,P.Symbol,cx+4.4*k,cy-1*k,1.6*k,wc(w,'c2','Gold'));b.line(cx,cy-4*k,cx,cy+3.6*k,shade(cov,-1));b.horn(cx,cy+3*k,cx+1*k,cy+5*k,cx+.4*k,cy+7*k,1.2*k,rb,1*k);
    return{buf:b,gx:cx,gy:cy+3*k}}
  const b=new Buf(16*k,18*k),x0=2*k,y0=2*k,W=11*k,H=14*k;
  b.rect(x0+W-.5*k,y0+1*k,2*k,H-2*k,pg);for(let y=y0+2*k;y<y0+H-2*k;y+=k)b.px(x0+W+.8*k,y,shade(pg,-1));
  b.rect(x0,y0,W,H,cov);b.rect(x0,y0,2*k,H,shade(cov,-1));
  if(Bd==='Scales')for(let y=y0+1*k;y<y0+H;y+=2*k)for(let x=x0+2*k+((y/k)%4?1*k:0);x<x0+W;x+=2*k)b.ell(x,y,.9*k,.7*k,shade(cov,1),0);
  if(Bd==='Velvet')for(let y=y0+1;y<y0+H;y+=2)b.px(x0+3*k+(y%3),y,shade(cov,1));
  b.rect(x0+3*k,y0+1*k,W-4*k,H-2*k,shade(cov,1));b.rect(x0+3.4*k,y0+1.4*k,W-4.8*k,H-2.8*k,cov);
  glyph(b,P.Symbol,x0+W/2+1*k,y0+H/2+.6*k,3.3*k,g);
  const C=P.Corners;for(const[cx,cy]of[[x0+2*k,y0],[x0+W,y0],[x0+2*k,y0+H],[x0+W,y0+H]]){if(C==='Metal')b.tri(cx,cy,cx+(cx>x0+5*k?-3:3)*k,cy,cx,cy+(cy>y0+5*k?-3:3)*k,g);else if(C==='Gems')gemAt(b,cx+(cx>x0+5*k?-1.2:1.2)*k,cy+(cy>y0+5*k?-1.2:1.2)*k,1*k,gc);else if(C==='Thorns')b.tri(cx-1*k,cy,cx+1*k,cy,cx+(cx>x0+5*k?2:-2)*k,cy+(cy>y0+5*k?2:-2)*k,'#4a3a2a');else if(C==='Bone')b.ell(cx,cy,1.4*k,1.4*k,'#efe9d8',0)}
  const Cl=P.Clasp,cy=y0+H/2;
  if(Cl==='Lock'){b.rect(x0+W-1*k,cy-1.6*k,3*k,3.2*k,g);b.px(x0+W+.4*k,cy,INK)}else if(Cl==='Strap'){b.rect(x0+W-3*k,cy-1*k,5*k,2*k,'#5a3420');b.rect(x0+W,cy-1*k,1.4*k,2*k,g)}
  else if(Cl==='Chain'){for(let i=0;i<4;i++)b.ell(x0+W-1*k+i*.8*k,cy-1.6*k+i*1.2*k,.8*k,.8*k,'#a8b0c0',0)}else if(Cl==='Eye'){b.ell(x0+W+.4*k,cy,1.6*k,1.2*k,'#f4f4f8',0);b.ell(x0+W+.6*k,cy,.8*k,.8*k,gc,0)}
  if(w.engr&&k>=2)engraveFlat(b,w.engr,x0+W/2+1*k,y0+1.6*k,g,W-5*k);
  b.horn(x0+W-3*k,y0+H,x0+W-2*k,y0+H+2*k,x0+W-3*k,y0+H+3.6*k,1.4*k,rb,1.2*k);
  if(w.elem!=='None')gemAt(b,x0+W/2+1*k,y0+H-2.4*k,.9*k,ELEMS[w.elem].c);
  return{buf:b,gx:x0+W/2+1*k,gy:y0+H-2*k}},
};
WDRAW.dual=(w,k)=>WDRAW.katana(w,k);
/* both katanas together, hilts close and blades spread in a V: how a Dual Katana is shown on its own */
function pairKatana(w,k){const a=WDRAW.katana(w,k),l=WDRAW.katana(w,k,true),W=Math.ceil(a.buf.w*3.6),B=new Buf(W,a.buf.h+4),cx=W/2,ty=a.gy+2;
  B.blitRot(l.buf,l.gx,l.gy,-.5,cx-2*k,ty);B.blitRot(a.buf,a.gx,a.gy,.5,cx+2*k,ty);return{buf:B,gx:cx,gy:ty}}
const _wcache=new Map();
function weaponBuf(w,k=1,variant=0){const key=JSON.stringify([w.kind,w.parts,w.c1,w.c2,w.c3,w.c4,w.c5,w.gemC,w.engr,w.elem,k,variant]);let r=_wcache.get(key);
  if(!r){r=w.kind==='dual'&&variant==='pair'?pairKatana(w,k):w.kind==='dual'&&variant==='left'?WDRAW.katana(w,k,true):w.kind==='bow'?WDRAW.bow(w,k,variant==='drawn'?1:0):w.kind==='grimoire'?WDRAW.grimoire(w,k,variant==='open'?1:0):WDRAW[w.kind](w,k);
    if(variant!=='raw'){r.buf.softline()}if(_wcache.size>400)_wcache.clear();_wcache.set(key,r)}return r}

/* ---------- how each kind is held, pose by pose ----------
   na/fa: near and far arm, w: the weapon's angle (0 points up, positive tips forward), wl: which layer it sits on */
const HOLDS={
 one:{idle:{na:[.2,-1.1],fa:[-.1,-.3],w:.75,wl:'front'},ready:{na:[.75,-1.6],fa:[.3,-1.2],w:.3,wl:'front',lean:1},wind:{na:[-2.3,.2],fa:[.3,-.8],w:-1.9,wl:'back',lean:-1},
  strike:{na:[1.55,.05],fa:[-.4,-.4],w:1.85,wl:'front',lean:2},win:{na:[-2.95,.05],fa:[.2,-.6],w:-.05,wl:'front'},guard:{na:[1.05,-1.9],fa:[.6,-1.6],w:.08,wl:'front',crouch:1},cast:{na:[1.1,-1.4],fa:[.6,-1.2],w:.4,wl:'front'}},
 two:{idle:{na:[.55,-2.05],fa:[.7,-1.9],w:-.75,wl:'back'},ready:{na:[.85,-1.45],fa:[.95,-1.2],w:.5,wl:'front',lean:1},wind:{na:[-2.5,.4],fa:[-2.3,.2],w:-2.25,wl:'back',lean:-1},
  strike:{na:[1.35,.25],fa:[1.25,.35],w:2.05,wl:'front',lean:2,crouch:1},win:{na:[-2.95,.05],fa:[-2.8,.1],w:-.02,wl:'front'},guard:{na:[1,-1.7],fa:[1.1,-1.5],w:.1,wl:'front',crouch:1},cast:{na:[.85,-1.45],fa:[.95,-1.2],w:.5,wl:'front'}},
 dual:{idle:{na:[.2,-1.1],fa:[.25,-1],w:.7,w2:-.5,wl:'front'},ready:{na:[.8,-1.6],fa:[.6,-1.8],w:.25,w2:-.45,wl:'front',lean:1},wind:{na:[-2.2,.3],fa:[-1.6,.1],w:-1.95,w2:-1.5,wl:'back',lean:-1},
  strike:{na:[1.55,.1],fa:[1.2,.4],w:1.9,w2:2.3,wl:'front',lean:2},win:{na:[-2.9,.05],fa:[-2.5,.2],w:-.05,w2:-.4,wl:'front'},guard:{na:[1,-1.9],fa:[.9,-2],w:.2,w2:-.3,wl:'front',crouch:1},cast:{na:[.8,-1.6],fa:[.6,-1.8],w:.25,w2:-.45,wl:'front'}},
 bow:{idle:{na:[.15,-.35],fa:[-.1,-.3],w:.15,wl:'front',hand:'n'},ready:{na:[1.15,-2.3],fa:[1.5,0],w:0,wl:'mid',hand:'f',drawn:1},wind:{na:[1.0,-2.6],fa:[1.55,0],w:0,wl:'mid',hand:'f',drawn:1,lean:-1},
  strike:{na:[1.3,-1.6],fa:[1.55,0],w:0,wl:'mid',hand:'f'},win:{na:[-2.9,.05],fa:[.1,-.4],w:-.1,wl:'front',hand:'n'},guard:{na:[.9,-1.8],fa:[1.2,-.6],w:.3,wl:'mid',hand:'f',crouch:1},cast:{na:[1.15,-2.3],fa:[1.5,0],w:0,wl:'mid',hand:'f',drawn:1}},
 staff:{idle:{na:[.25,-.55],fa:[-.1,-.3],w:.04,wl:'front'},ready:{na:[.6,-1.15],fa:[.3,-.9],w:.22,wl:'front'},wind:{na:[-2.3,.4],fa:[.2,-.7],w:-.7,wl:'back',lean:-1},
  strike:{na:[1.5,.05],fa:[-.3,-.3],w:1.5,wl:'front',lean:2},win:{na:[-2.9,.05],fa:[.3,-.6],w:0,wl:'front'},guard:{na:[.9,-1.6],fa:[.7,-1.4],w:.05,wl:'front',crouch:1},cast:{na:[1.35,-1.7],fa:[.9,-1.2],w:.45,wl:'front',glow:1}},
 book:{idle:{na:[.45,-1.5],fa:[-.1,-.3],w:0,wl:'front'},ready:{na:[.95,-1.55],fa:[.9,-1.4],w:0,wl:'front',open:1},wind:{na:[.8,-2.2],fa:[.6,-1.8],w:0,wl:'front',open:1,lean:-1},
  strike:{na:[1.5,-.2],fa:[.6,-1.3],w:0,wl:'front',open:1,lean:1},win:{na:[-2.9,.05],fa:[.3,-.6],w:0,wl:'front'},guard:{na:[1,-1.7],fa:[.8,-1.5],w:0,wl:'front',crouch:1},cast:{na:[1.35,-1.1],fa:[1.1,-1.2],w:0,wl:'front',open:1,glow:1}},
 fists:{idle:{na:[.45,-2.45],fa:[.7,-2.3],wl:'front'},ready:{na:[.6,-2.5],fa:[.9,-2.3],wl:'front',lean:1},wind:{na:[-.35,-2.3],fa:[1,-2.2],wl:'front',lean:-1},
  strike:{na:[1.57,0],fa:[.4,-2.4],wl:'front',lean:2},win:{na:[-2.95,.05],fa:[.6,-2.3],wl:'front'},guard:{na:[1.1,-2.6],fa:[1.3,-2.4],wl:'front',crouch:1},cast:{na:[1.2,-1.2],fa:[1.1,-1.3],wl:'front',glow:1}},
};
/* a pose for a character holding their weapon: name is idle, walk0-3, ready, wind, strike, win, guard, cast, hurt */
function holdPose(kind,name){const T=WTYPES[kind]||WTYPES.sword,H=HOLDS[T.hold];
  if(name&&name.startsWith('walk')){const p=Object.assign({},POSES[name]),h=H.idle;return Object.assign(p,{na:h.na,w:h.w,w2:h.w2,wl:h.wl,hand:h.hand,fa:T.hold==='two'||T.hold==='fists'||T.hold==='dual'?h.fa:p.fa,kind})}
  if(name==='hurt')return Object.assign({},H.idle,{lean:-2,face:'hurt',kind});
  if(name==='ko')return Object.assign({},H.idle,{face:'ko',kind});
  return Object.assign({},H[name]||H.idle,{kind,face:name==='win'?'happy':name==='strike'||name==='wind'?'normal':'normal'})}
/* lerp between two poses (for smooth swings) */
function blendPose(a,b,t){const o=Object.assign({},t<.5?a:b),L=(x,y)=>x+(y-x)*t;
  for(const k of['na','fa'])if(a[k]&&b[k])o[k]=[L(a[k][0],b[k][0]),L(a[k][1],b[k][1])];
  for(const k of['w','w2','lean','bob','crouch'])if(a[k]!=null&&b[k]!=null)o[k]=L(a[k],b[k]);return o}
/* the weapon drawn into the doll at the right layer */
WEAPON_HOOK=(b,P,L,w,layer)=>{if(!w)return;const p=P.p,T=WTYPES[w.kind];if(!T)return;const hold=T.hold;
  if(hold==='fists'){const g=weaponBuf(w,1);if(layer==='front'){b.blitRot(g.buf,g.gx,g.gy,(p.na?p.na[0]+p.na[1]:0)*.3,P.nArm.H[0],P.nArm.H[1])}
    else if(layer==='back'){const f=Object.assign({},w,{c1:w.c1});b.blitRot(g.buf,g.gx,g.gy,(p.fa?p.fa[0]+p.fa[1]:0)*.3,P.fArm.H[0],P.fArm.H[1])}return}
  if(hold==='dual'){if(layer==='front'){const g=weaponBuf(w,1);b.blitRot(g.buf,g.gx,g.gy,p.w??.7,P.nArm.H[0],P.nArm.H[1])}
    else if(layer==='back'){const g=weaponBuf(w,1,'left');b.blitRot(g.buf,g.gx,g.gy,p.w2??.5,P.fArm.H[0],P.fArm.H[1])}return}
  if((p.wl||'front')!==layer)return;
  const H=(p.hand==='f'?P.fArm:P.nArm).H;
  if(hold==='bow'){const g=weaponBuf(w,1,p.drawn?'drawn':0);b.blitRot(g.buf,g.gx,g.gy,p.w||0,H[0],H[1]);if(p.drawn){/* the arrow, nocked */const nh=P.nArm.H;b.line(nh[0],nh[1],H[0]+6,H[1],'#d8c8a0');b.tri(H[0]+5,H[1]-1,H[0]+5,H[1]+1,H[0]+8,H[1],'#c8ccd8');b.leaf(nh[0],nh[1],nh[0]-3,nh[1]-1,1.6,dyeOf(w.c4,'Forest'))}return}
  if(hold==='book'){const g=weaponBuf(w,1,p.open?'open':0);b.blitRot(g.buf,g.gx,g.gy,p.w||0,H[0]+(p.open?3:1),H[1]-(p.open?3:0));return}
  const g=weaponBuf(w,1);b.blitRot(g.buf,g.gx,g.gy,p.w||0,H[0],H[1])};
/* a whole character, posed with their weapon */
function drawHero(look,w,name){return drawDoll(look,rigPose(w,name),w)}
const rigPose=(w,name)=>holdPose(w?w.kind:'sword',name);
