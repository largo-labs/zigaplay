/* ---------- icons: little pictures for the menus, made into image URLs once and reused ---------- */
const ICON_PAL={k:'#1a1008',y:'#e8a828',Y:'#ffe080',r:'#c02818',R:'#ff6a50',w:'#ffffff',g:'#6a6a72',G:'#c8c8d0',b:'#6a4422',B:'#b07a42',n:'#3a8a3a',N:'#7ad060',u:'#3a5ab0',U:'#9ac0ff',p:'#7a3a9a',o:'#ff8020',c:'#e0d0a8'};
const BITMAPS={
  coin:['..kkkk..','.kYYYYk.','kYyyyyYk','kYyYYyyk','kYyyYyyk','kYyyyyyk','.kyyyyk.','..kkkk..'],
  heart:['.kk..kk.','kRRkkrrk','kRrrrrrk','krrrrrrk','.krrrrk.','..krrk..','...kk...','........'],
  sword:['......kG','.....kGk','....kGk.','...kGk..','k.kGk...','.kyk....','.kky....','kk..k...'],
  clock:['..kkkk..','.kwwwwk.','kwwkwwwk','kwwkwwwk','kwwkkkwk','kwwwwwwk','.kwwwwk.','..kkkk..'],
  skull:['..kkkk..','.kwwwwk.','kwwwwwwk','kwkkwkkw','kwkkwkkw','.kwwwwk.','..kwkwk.','...k.k..'],
  crown:['........','y..y..y.','yy.yy.yy','yyyyyyyy','yrYyyRyy','yyyyyyyy','kkkkkkkk','........'],
  flame:['...o....','..oo.o..','..ooYo..','.oYYYoo.','.oYwYYo.','ooYwwYoo','.oYYYYo.','..oooo..'],
  scroll:['.kkkkkk.','kccccccB','.kckkck.','.kccccck','.kckkcck','.kccccck','Bcccccck','.kkkkkk.'],
  mug:['.wwwww..','kwwwwwk.','kBBBBBkk','kBbBbBk.','kBbBbBkk','kBbBbBk.','kBBBBBk.','.kkkkk..'],
  bell:['...k....','..kyk...','.kYyyk..','.kYyyk..','.kYyyk..','kYyyyyk.','kkkkkkk.','...k....'],
  moon:['..kkk...','.kYYk...','kYYk....','kYk.....','kYk.....','kYYk...k','.kYYkkYk','..kkkk..'],
  potion:['...kk...','...cc...','..kcck..','.kNNNNk.','kNnNNNNk','kNNNNnNk','kNNNNNNk','.kkkkkk.'],
  bag:['..k..k..','...kk...','..kBBk..','.kBBBBk.','kBByyBBk','kBByyBBk','kBBBBBBk','.kkkkkk.'],
  fist:['........','.kkkk...','kccccck.','kckckcck','kccccccK','kcccccck','.kcccck.','..kkkk..'],
  horn:['......k.','.....kyk','kk..kyyk','kykkyyyk','kyyyyyyk','kk..kyyk','.....kyk','......k.'],
  star:['...y....','...yy...','yyyYyyy.','.yyYYy..','..yyyy..','.yy..yy.','.y....y.','........'],
  stardim:['...g....','...gg...','ggggggg.','.ggggg..','..gggg..','.gg..gg.','.g....g.','........'],
  folk:['..bbbb..','.bccccb.','.cckckc.','.cccccc.','..cccc..','.nnnnnn.','nnnnnnnn','nnnnnnnn'],
  lock:['..kkkk..','.kGGGGk.','.kG..Gk.','kyyyyyyk','kyyYyyyk','kyykkyyk','kyyyyyyk','.kkkkkk.'],
  swords:['k......k','Gk....kG','.Gk..kG.','..GkkG..','..kGGk..','.kykkyk.','kyk..kyk','kk....kk'],
};
const _icons={};
// a close-up head and shoulders for story portraits and the HUD
function drawBust(g,L,who){const sk=L.skin||'#e0b088',hr=L.hair||'#3a2414',hc=L.hatC||hr,tun=L.mail?'#8a9098':(L.tunic||'#6a5a3a'),dk='#1a1010';
  if(L.cape)P(g,L.cape,1,12,14,4);P(g,tun,2,12,12,4);P(g,L.trim||'#3a2a14',6,12,4,1);if(L.mail){P(g,L.tunic,4,13,8,3)}
  P(g,sk,6,10,4,2);P(g,sk,4,3,8,8);P(g,'#00000022',4,9,8,2);
  P(g,dk,6,6,1,2);P(g,dk,9,6,1,2);P(g,'#ffffff',6,6,1,1);P(g,'#ffffff',9,6,1,1);P(g,'#a05a40',7,9,2,1);
  const old=who==='Meg'||who==='King';if(old){P(g,'#c8b098',5,5,2,1);P(g,'#c8b098',9,5,2,1)}
  if(who==='King'||who==='Earl'||who==='Gaunt'){P(g,who==='King'?'#d8d8d8':hr,4,9,8,3);P(g,sk,6,9,4,1);P(g,'#a05a40',7,10,2,1)}
  switch(L.hat){
    case 'cap':P(g,hr,4,3,8,2);P(g,hc,3,1,10,3);P(g,hc,10,3,4,1);break;
    case 'hood':P(g,hc,3,1,10,3);P(g,hc,3,3,2,9);P(g,hc,11,3,2,9);P(g,hc,2,11,12,2);break;
    case 'kettle':P(g,hc,4,0,8,3);P(g,hc,2,3,12,1);P(g,'#00000033',2,3,12,1);break;
    case 'helm':P(g,hc,3,1,10,5);P(g,hc,3,6,2,4);P(g,hc,11,6,2,4);P(g,dk,5,5,6,1);P(g,'#ffffff55',4,2,3,1);break;
    case 'greathelm':P(g,hc,3,1,10,10);P(g,dk,4,6,8,1);P(g,'#c03030',7,0,2,2);break;
    case 'crown':P(g,hr,4,3,8,2);P(g,hr,3,4,1,4);P(g,hr,12,4,1,4);P(g,hc,4,1,8,2);P(g,hc,4,0,1,1);P(g,hc,7,0,2,1);P(g,hc,11,0,1,1);P(g,'#e02020',7,1,2,1);break;
    case 'band':P(g,hr,4,2,8,3);P(g,hr,3,3,1,5);P(g,hr,12,3,1,4);P(g,hc,4,4,8,1);P(g,hc,12,4,2,3);break;
    default:P(g,hr,4,2,8,2);P(g,hr,3,3,1,5);P(g,hr,12,3,1,4)}}
function iconCanvas(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g);return c.toDataURL()}
function icon(name){if(_icons[name])return _icons[name];let url='';
  if(BITMAPS[name]){const bm=BITMAPS[name];url=iconCanvas(8,8,g=>{for(let y=0;y<8;y++)for(let x=0;x<8;x++){const c=ICON_PAL[bm[y][x]];if(c)P(g,c,x,y)}})}
  else{const[kind,key]=name.split(':');
    if(kind==='wpn')url=iconCanvas(18,18,g=>{drawPerson(g,8,17,{skin:'#e0b088',hair:'#6a4424',tunic:'#6a7a3a',trim:'#3a2a14',hat:key==='bow'?'hood':'',hatC:'#3a5a2a',wpn:key,legs:'#4a3a2a'},{face:1,walk:0,atk:0,t:.3})});
    else if(kind==='trap')url=iconCanvas(22,20,g=>drawTrap(g,{kind:key,x:11,y:key==='deadfall'||key==='hive'?17:12,tx:3,ty:3,hp:1,max:1},.4,false));
    else if(kind==='foe'){const d=FOES[key];url=iconCanvas(16,14,g=>{if(d.dog){drawDog(g,8,12,{face:1,walk:0})}else{const L=Object.assign({skin:'#e0b088',hair:'#3a2414'},d.look);delete L.horse;drawPerson(g,8,17,L,{face:1,walk:0,t:0})}})}
    else if(kind==='face'){url=iconCanvas(16,16,g=>drawBust(g,lookOf(key),key))}
    else if(kind==='cart')url=iconCanvas(32,20,g=>drawCart(g,{x:15,y:19,flash:0},0));
  }
  return _icons[name]=url}
function lookOf(who){if(who==='Wat')return Object.assign({},LEADER_LOOK,{wpn:''});const s=SPEAKERS[who];if(typeof s==='string')return Object.assign({skin:'#e0b088',hair:'#3a2414'},FOES[s].look);
  if(s)return s;if(FOES[who])return Object.assign({skin:'#e0b088',hair:'#3a2414'},FOES[who].look);return{skin:'#e0b088',hair:'#3a2414',tunic:'#6a5a3a',trim:'#3a2a14'}}
const img=(name,cls='')=>`<img class="ic ${cls}" src="${icon(name)}" alt="">`;
// button glyphs, written into text as {A} {B} {SEL} {START} {PAD}
const GLYPH={A:'<i class="k ka">A</i>',B:'<i class="k kb">B</i>',SEL:'<i class="k kp">SELECT</i>',START:'<i class="k kp">START</i>',PAD:'<i class="k kd">✚</i>'};
const rich=s=>esc(s).replace(/\{(A|B|SEL|START|PAD|COIN)\}/g,(m,k)=>k==='COIN'?img('coin'):GLYPH[k]).replace(/Ⓐ/g,GLYPH.A);
