/* ================= the party, the bag and the rules that tie them together ================= */
let G=null; // the game in play
const TIERS=['Plain','Fine','Keen','Runed','Starforged','Embered','Legendary'];
const MAXTIER=TIERS.length-1;
/* what reforging to the next tier asks for */
const forgeCost=t=>({gold:120*(t+1)*(t+1),ore:2*(t+1),star:t>=3?t-2:0});
/* a weapon's numbers at its tier */
function weaponStats(w){const T=WTYPES[w.kind]||WTYPES.sword,o={},t=w.tier||0;
  for(const k of['atk','mag','def','spd']){const v=T.stat[k]||0;o[k]=v>0?Math.round(v*(1+.55*t)+t*1.5):v}return o}
/* everything about a member at their level, with weapon and charm */
function statsOf(m){const C=CHARS[m.id]||CHARS.hero,L=m.lv,ws=weaponStats(m.weapon),ch=CHARMS[m.charm||'none']||{};
  const g=k=>Math.round(C.base[k]+C.grow[k]*(L-1));
  const s={hp:g('hp'),mp:g('mp'),atk:g('atk')+ws.atk,mag:g('mag')+ws.mag,def:g('def')+ws.def,spd:Math.max(3,g('spd')+ws.spd)};
  for(const k of['hp','mp','atk','mag','def','spd'])if(ch[k])s[k]=Math.round(s[k]*(1+ch[k]));
  const sy=synOf(m);for(const k in sy)if(s[k]!=null)s[k]=Math.round(s[k]*(1+sy[k]));
  s.mdef=Math.round((s.def+s.mag)/2);s.crit=.05+(ch.crit||0);s.limitGain=1+(ch.limit||0);s.xpMul=1+(ch.xp||0);s.goldMul=1+(ch.gold||0);s.regen=!!ch.regen;
  s.hp=Math.min(9999,s.hp);s.mp=Math.min(999,s.mp);return s}
/* the arts a member knows with the weapon in hand */
const artsOf=m=>(ARTS[m.weapon.kind]||ARTS.sword).list.filter(a=>a.lv<=m.lv);
const limitOf=m=>(ARTS[m.weapon.kind]||ARTS.sword).limit;
const artLabel=m=>(ARTS[m.weapon.kind]||ARTS.sword).label;
/* a member made fresh at a level */
function makeMember(id,lv,look,weapon,name){const C=CHARS[id];
  const w=weapon?Object.assign(newWeapon(weapon.kind),JSON.parse(JSON.stringify(weapon))):newWeapon('sword');
  if(weapon&&weapon.parts)w.parts=Object.assign(newWeapon(weapon.kind).parts,weapon.parts);
  const m={id,name:name||C.n,lv:lv||1,xp:0,look:Object.assign({},DEFAULT_LOOK,look||C.look||{}),weapon:w,charm:'none',limit:0,hp:1,mp:1};
  const s=statsOf(m);m.hp=s.hp;m.mp=s.mp;return m}
/* experience: returns what each level brought */
function giveXP(m,n){const out=[];m.xp+=n;while(m.lv<MAXLV&&m.xp>=needXP(m.lv)){m.xp-=needXP(m.lv);const before=statsOf(m);m.lv++;const after=statsOf(m);
    m.hp+=after.hp-before.hp;m.mp+=after.mp-before.mp;out.push({lv:m.lv,learned:(ARTS[m.weapon.kind]||ARTS.sword).list.filter(a=>a.lv===m.lv).map(a=>a.n)})}
  if(m.lv>=MAXLV)m.xp=0;return out}
/* the bag */
const addItem=(id,n=1)=>{G.inv[id]=Math.min(99,(G.inv[id]||0)+n);if(G.inv[id]<=0)delete G.inv[id]};
const hasItem=id=>(G.inv[id]||0)>0;
const addCharm=(id,n=1)=>{G.charms[id]=(G.charms[id]||0)+n};
/* how many of a charm are free to put on */
const charmFree=id=>(G.charms[id]||0)-allMembers().filter(m=>m.charm===id).length;
function healAll(){for(const m of allMembers()){const s=statsOf(m);m.hp=s.hp;m.mp=s.mp}}
function clampParty(){for(const m of allMembers()){const s=statsOf(m);m.hp=Math.min(m.hp,s.hp);m.mp=Math.min(m.mp,s.mp)}}
/* ---------- the wardrobe: almost everything is yours from the start; a few pieces are found or bought ---------- */
const CAT_LIST={hair:()=>HAIRS,hat:()=>HATS,top:()=>TOPS,bot:()=>BOTTOMS,shoes:()=>SHOES,back:()=>BACKS,face:()=>FACES};
const FOUND={'hat:Flower Crown':'Found in Whisperwood','top:Sailor Top':'Found on Saltwind Road','face:Eye Goggles':'Found in the Tide Grotto','hat:Ushanka':'Found on Frostpeak Pass','back:Mech Wings':'Found on the Stormbreak Plains','hat:Crown':'Found in the Grey Citadel'};
const TAILOR={
 emberwick:[['hat','Party Hat',80],['face','Star Sticker',60],['hat','Propeller Cap',120],['back','Cat Tail',150],['top','Royal Tunic',220]],
 saltmere:[['hat','Frog Hat',250],['shoes','Rain Boots',200],['hat','Pirate Tricorn',300],['top','Pirate Coat',450],['top','Ball Gown',500],['back','Butterfly Wings',600]],
 frosthold:[['hat','Unicorn Horn',700],['hat','Winged Helm',800],['shoes','Winged Boots',900],['back','Fairy Wings',900],['hat','Samurai Kabuto',900],['back','Angel Wings',1000],['top','Samurai Armor',1100]],
 stormwatch:[['face','Third Eye',1200],['back','Dragon Tail',1300],['hat','Royal Circlet',1400],['hat','Halo',1500],['back','Royal Cape',1600],['back','Jetpack',1800],['back','Dragon Wings',2200]],
};
const LOCKED={};for(const k in FOUND)LOCKED[k]=FOUND[k];for(const[t,l]of Object.entries(TAILOR))for(const[c,n,p]of l)LOCKED[c+':'+n]=`Sold by the ${ZONES[t].n} tailor (${p}g)`;
const owns=(cat,name)=>!LOCKED[cat+':'+name]||!!(G&&G.owned[cat+':'+name]);
/* a new game */
function newGameState(look,weapon,name){G={v:1,party:[makeMember('hero',1,look,weapon,name||'Hero')],roster:[],gems:0,pity:0,gold:150,inv:{potion:4,ether:1},charms:{},owned:{},flags:{},opened:{},
  zone:'emberwick',x:96,dir:1,time:0,steps:0,battles:0};G.party[0].weapon.name=weapon&&weapon.name||'Spellsteel';return G}
/* play time as text */
const playTime=()=>{const s=Math.floor(G.time),h=Math.floor(s/3600),m=Math.floor(s/60)%60;return h+':'+String(m).padStart(2,'0')};
/* the settings, kept apart from the save */
const SET=(()=>{const d={music:true,sound:true,speed:'Normal',text:'Normal'};try{return Object.assign(d,JSON.parse(localStorage.getItem('spellsteel-settings')||'{}'))}catch(e){return d}})();
const saveSettings=()=>{try{localStorage.setItem('spellsteel-settings',JSON.stringify(SET))}catch(e){}};
const TEXTSPD={Slow:28,Normal:55,Fast:120};
