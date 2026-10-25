/* ---------- battle: units, orders, traps, fire, objectives, and drawing the field ---------- */
let B=null,UID=1;
const LEADER_LOOK={skin:'#e0b088',hair:'#8a3a1a',tunic:'#4a7a3a',trim:'#d8b040',hat:'band',hatC:'#c03020',legs:'#4a3a2a',wpn:'cudgel'};
const ORDERS=['hold','charge','follow'],ORDER_NAME={hold:'HOLD',charge:'CHARGE!',follow:'FOLLOW ME'};
const PROJ={stone:{spd:150,arc:10,c:'#a8a8a0'},arrow:{spd:230,arc:4,c:'#e0d8c0'},bolt:{spd:270,arc:2,c:'#c8c8d0'},fire:{spd:120,arc:16,c:'#ff8020'},torch:{spd:120,arc:14,c:'#ff9030'}};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function leaderStats(){const L=G.leader;return{hp:100+L.vigor*20+(G.plan.scheme==='herb'?50:0),dmg:14+L.might*3+(G.flags.blade?6:0),aura:48+L.voice*14,range:17,speed:64}}
function randLook(r,isP,base){const L=Object.assign({},base||{});L.skin=SKINS[r()*SKINS.length|0];L.hair=HAIRS[r()*HAIRS.length|0];
  if(isP){L.tunic=PEASANT_TUNICS[r()*PEASANT_TUNICS.length|0];L.trim='#3a2a14';L.legs=['#4a3a2a','#3a3a2a','#5a4a3a'][r()*3|0];L.hat=r()<.3?'cap':r()<.5?'hood':'';L.hatC=['#6a5a3a','#5a4a2a','#7a3a2a','#3a5a3a'][r()*4|0]}
  return L}
function mkUnit(side,kind,x,y,o={}){
  const isP=side==='p';let d=o.def||(isP?WEAPONS[kind]:FOES[kind]);
  const u={id:UID++,side,kind,d,x,y,r:d.mount?5:d.big?6:d.dog?3:3.5,hp:d.hp,max:d.hp,face:isP?1:-1,cd:Math.random()*.6,atkT:0,hitT:0,walk:Math.random(),
    stun:0,root:0,slow:0,fear:0,flee:0,fleeCd:0,lastHurt:-9,lastAtk:-9,target:null,retarget:Math.random()*.3,state:o.state||'idle',home:{x,y},alive:true,
    temp:!!o.temp,squad:o.squad||0,charging:0,chargeCd:1+Math.random()*2,spec:0,specCd:3,wind:0,hidden:false,inv:0,ambushed:false};
  if(d.dog)u.look=null;else if(isP&&!o.def)u.look=randLook(Math.random,true,{wpn:kind==='stones'?'stones':kind});
  else u.look=randLook(Math.random,false,d.look);
  if(isP&&o.def&&d.look)u.look=randLook(Math.random,false,d.look);
  return u}
function hostile(a,b){return a.side!==b.side}

/* ---------- setting up a battle ---------- */
function newBattle(idx){
  const spec=BATTLES[idx],m=buildMap(spec);renderMapCache(m);
  B={idx,spec,m,units:[],proj:[],fx:[],traps:[],decals:[],state:'deploy',time:0,order:'hold',cam:{x:0,y:0},shake:0,kills:0,plunder:0,escaped:0,
    fire:new Float32Array(MW*MH),fireT:0,F:{},fieldT:{},waves:(spec.waves||[]).map(w=>Object.assign({done:false},w)),queue:[],leader:null,boss:null,
    night:!!spec.night||false,obj:null,coachQ:[],coach:null,did:{moved:0,swings:0,rolled:0},cards:[],card:null,introT:0,cart:null,hold:null,fallen:{},usedTraps:{},deployedFolk:0,endT:0,banner:null,slow:1,militiaT:12,summonT:12,msg:null};
  if(spec.protect){const p=spec.protect;B.obj={x:p.x,y:p.y,w:p.w,h:p.h,hp:p.hp,max:p.hp,name:p.name,sprite:p.sprite,flash:0,burn:0}}
  if(spec.hold){const h=spec.hold;B.hold={x:h.x,y:h.y,w:h.w,h:h.h,need:h.need,prog:0}}
  if(spec.cart){const s=spec.start,e=spec.end;const f=flowField(m,[e[1]*MW+e[0]]);const path=[];let px=s[0]*TS+8,py=s[1]*TS+8;path.push({x:px,y:py});
    for(let i=0;i<200;i++){const n=flowNext(m,f,px,py);if(!n)break;px=n.x;py=n.y;path.push({x:px,y:py})}
    B.cart={x:path[0].x,y:path[0].y,path,pi:1,hp:spec.cart.hp,max:spec.cart.hp,speed:spec.cart.speed,flash:0,moving:false,done:false}}
  return B}
function beginFight(items){
  const spec=B.spec,sch=G.plan.scheme,ls=leaderStats();
  for(const it of items){if(!it.tile)continue;const cx=it.tile[0]*TS+8,cy=it.tile[1]*TS+8;
    if(it.k==='leader'){const L=mkUnit('p','leader',cx,cy,{def:{name:'Wat',hp:ls.hp,dmg:ls.dmg,range:ls.range,cd:.3,speed:ls.speed,armor:0}});
      L.isLeader=true;L.look=Object.assign({},LEADER_LOOK,{wpn:G.flags.blade?'blade':'cudgel'});L.aura=ls.aura;L.roll=0;L.rollCd=0;L.aim={x:spec.face==='left'?-1:spec.face==='up'?0:1,y:spec.face==='up'?-1:spec.face==='down'?1:0};L.combo=0;L.comboT=0;L.r=3.5;
      B.units.push(L);B.leader=L}
    else if(it.k==='squad'){const offs=[[-5,-4],[5,-4],[-5,5],[5,5]];for(let i=0;i<it.n;i++){const u=mkUnit('p',it.w,cx+offs[i][0],cy+offs[i][1],{squad:it.id});u.face=spec.face==='left'?-1:1;B.units.push(u);B.deployedFolk++}}
    else if(it.k==='trap'){addTrap(it.t,cx,cy,it.tile)}}
  const L=B.leader;
  if(sch==='militia'){for(let i=0;i<4;i++){const u=mkUnit('p','stones',L.x+(i-1.5)*8,L.y+10,{temp:true});B.units.push(u)}}
  if(sch==='bribe'){for(let i=0;i<2;i++){const u=mkUnit('p','turncoat',L.x+(i?8:-8),L.y-8,{def:FOES.turncoat,temp:true});B.units.push(u)}}
  for(const g of spec.guards||[]){spawnFoe(g[2],g[0]*TS+8,g[1]*TS+8,'idle')}
  if(spec.boss){const b=spawnFoe(spec.boss.t,spec.boss.x*TS+8,spec.boss.y*TS+8,'idle');B.boss=b}
  for(const u of B.units)if(u.side==='e'&&u.d.boss&&!B.boss)B.boss=u;
  if(spec.boss===undefined){const c=B.units.find(u=>u.kind==='champion');if(c)B.mini=c}
  B.state='fight';B.time=0;B.banner={text:(spec.win==='survive'?'Guard '+spec.protect.name.replace(/^The /,'the '):goalShort(spec))+'!',t:2};AU.sfx('horn');AU.play(spec.boss?'boss':'battle');
  refreshFields(true);
}
/* coaching: one short tip at a time, each one shown once ever */
function coach(id,text,o={}){if(G.seen[id]||(B.coach&&B.coach.id===id)||B.coachQ.some(c=>c.id===id))return;B.coachQ.push({id,text,T:o.T||3.5,until:o.until||null,t:0})}
function updateCoach(dt){
  if(!B.coach&&B.coachQ.length){B.coach=B.coachQ.shift();G.seen[B.coach.id]=1}
  const c=B.coach;if(c){c.t+=dt;if((c.until&&c.t>1&&c.until())||(!c.until&&c.t>c.T)||c.t>14)B.coach=null}
  if(!B.card&&B.cards.length){B.card=B.cards.shift();B.card.t=0}
  if(B.card){B.card.t+=dt;if(B.card.t>(B.card.boss?2.6:3))B.card=null}}
function lessons(){
  const L=B.leader,s=B.spec,foes=B.units.filter(u=>u.alive&&u.side==='e');
  if(B.idx===0){coach('move','{PAD} Move Wat',{until:()=>B.did.moved>0.6});
    if(G.seen.move&&foes.some(e=>dist(e,L)<60))coach('strike','{A} Strike!',{until:()=>B.did.swings>=3});
    if(B.time>7&&B.order==='hold'&&foes.some(e=>e.state==='fight'))coach('order','{SEL} Shout CHARGE!',{until:()=>B.order!=='hold'})}
  if(L.hp<L.max*.7)coach('roll','{B} Roll away from danger',{until:()=>B.did.rolled});
  if(s.win==='escort'&&B.time>1)coach('cart','The cart only rolls when you\'re near');
  if(s.win==='hold'&&B.time>1)coach('hold','Stand in the gold square');
  if(B.night&&B.time>1)coach('night','Darkness: foes can\'t see far');
  if(B.m.gate&&B.m.gate.hp>0&&B.time>6&&B.order!=='charge')coach('gate','{SEL} CHARGE to break the gate',{until:()=>B.order==='charge'});
  for(const tr of B.traps)if(tr.kind==='hay'&&!tr.used&&dist(tr,L)<90&&foes.some(e=>dist(e,tr)<45))coach('hay','{A} Strike the hay to light it!',{until:()=>tr.used});
  // meet each kind of foe once, and each boss with a title card
  const cx=B.cam.x,cy=B.cam.y;
  for(const e of foes){if(e.x<cx||e.y<cy||e.x>cx+W||e.y>cy+H)continue;const k='foe_'+e.kind;
    if(e.d.boss){if(e.state!=='idle'&&!B.introDone){B.introDone=1;B.cards.push({boss:1,kind:e.kind});B.slow=.35;B.slowT=1.6}}
    else if(!G.seen[k]&&!B.cards.some(c=>c.kind===e.kind)){G.seen[k]=1;B.cards.push({kind:e.kind})}}}
function addTrap(kind,x,y,tile){const tr={kind,x,y,tx:tile[0],ty:tile[1],used:false,t:0};
  if(kind==='barricade'){tr.hp=160;tr.max=160;const i=tile[1]*MW+tile[0];B.m.breakable.set(i,tr);tr.tiles=[i];recomputeSolid(B.m,B.spec)}
  B.traps.push(tr);return tr}
function spawnFoe(kind,x,y,state){const u=mkUnit('e',kind,x,y,{state});
  if(G.plan.scheme==='ale'){const k=u.d.boss?.85:.7;u.hp=Math.round(u.hp*k)}
  B.units.push(u);return u}
function objectiveText(){const s=B.spec;
  if(s.win==='rout')return s.exitLimit?'Stop the column! Don\'t let '+s.exitLimit+' get through':'Drive them all out!';
  if(s.win==='survive')return 'Hold out for '+s.time+' seconds!';
  if(s.win==='boss')return 'Defeat '+FOES[s.boss.t].name+'!';
  if(s.win==='hold')return 'Stand in the gold square to burn the rolls!';
  if(s.win==='escort')return 'Get the cart across the valley!';return ''}

/* ---------- fields ---------- */
const tileIdx=(x,y)=>{const tx=clamp(Math.floor(x/TS),0,MW-1),ty=clamp(Math.floor(y/TS),0,MH-1);return ty*MW+tx};
function refreshFields(force){const t=B.time,F=B.F,ft=B.fieldT;
  const due=(k,p)=>{if(force||!(ft[k]>t-p)){ft[k]=t;return true}return false};
  if(due('foes',.5)){F.foes=flowField(B.m,B.units.filter(u=>u.alive&&u.side==='e').map(u=>tileIdx(u.x,u.y)),{side:'p'})}
  if(due('players',.5)){const src=B.units.filter(u=>u.alive&&u.side==='p').map(u=>tileIdx(u.x,u.y));F.players=flowField(B.m,src)}
  if(B.leader&&due('leader',.35)){F.leader=flowField(B.m,[tileIdx(B.leader.x,B.leader.y)])}
  if(due('goal',B.cart?.8:3)){const s=B.spec;let src=null;
    if(s.goal==='exit')src=[s.exit[1]*MW+s.exit[0]];
    else if(B.obj){src=[];for(let y=B.obj.y;y<B.obj.y+B.obj.h;y++)for(let x=B.obj.x;x<B.obj.x+B.obj.w;x++)src.push(y*MW+x)}
    else if(B.cart&&!B.cart.done)src=[tileIdx(B.cart.x,B.cart.y)];
    F.goal=src?flowField(B.m,src):null}
}

/* ---------- moving ---------- */
function blockedAt(x,y,r){const m=B.m;return solidAtPx(m,x-r,y-r)||solidAtPx(m,x+r,y-r)||solidAtPx(m,x-r,y+r)||solidAtPx(m,x+r,y+r)}
function moveBy(u,dx,dy){let hit=false;const r=u.r*.8;
  if(dx){const nx=u.x+dx;if(!blockedAt(nx,u.y,r))u.x=nx;else hit=true}
  if(dy){const ny=u.y+dy;if(!blockedAt(u.x,ny,r))u.y=ny;else hit=true}
  u.x=clamp(u.x,2,MW*TS-2);u.y=clamp(u.y,2,MH*TS-2);return hit}
function speedOf(u){let s=u.d.speed;if(u.slow>0)s*=.45;const c=tileAt(B.m,u.x,u.y);if(c==='m')s*=.6;else if(c==='w'||c==='t')s*=.85;if(u.root>0)s=0;return s}
function stepToward(u,tx,ty,dt,mul=1){const dx=tx-u.x,dy=ty-u.y,d=Math.hypot(dx,dy);if(d<.5)return true;const s=Math.min(d,speedOf(u)*mul*dt);
  if(Math.abs(dx)>.5)u.face=dx>0?1:-1;const hit=moveBy(u,dx/d*s,dy/d*s);u.walk+=dt*2.2*mul;return hit}
// walk toward a point, or down a field when the straight way is blocked
function navigate(u,tx,ty,field,dt,mul=1){
  const d=Math.hypot(tx-u.x,ty-u.y);
  if(d<40&&clearLine(u.x,u.y,tx,ty)){stepToward(u,tx,ty,dt,mul);return}
  if(field){const n=flowNext(B.m,field,u.x,u.y);
    if(n){if(B.m.breakable.has(n.i)){const b=B.m.breakable.get(n.i);if(Math.hypot(n.x-u.x,n.y-u.y)<16&&!(b.kind==='barricade'&&u.side==='p')){hitBreakable(u,b,n);return}}
      stepToward(u,n.x,n.y,dt,mul);return}}
  stepToward(u,tx,ty,dt,mul)}
function clearLine(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/6);for(let i=1;i<n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;if(solidAtPx(B.m,x,y))return false}return true}
function hitBreakable(u,b,at){if(u.cd>0)return;u.cd=u.d.cd||1;u.atkT=.25;u.face=at.x>u.x?1:-1;
  let dm=(u.d.dmg||5)*(u.d.breaker||1);if(u.isLeader)dm=u.d.dmg;b.hp-=dm;AU.sfx('gate');B.shake=Math.max(B.shake,1);
  fxNum(at.x,at.y-8,Math.round(dm),'#e0b040');for(let i=0;i<3;i++)fxBit(at.x,at.y,'#8a5c30');
  if(b.hp<=0)breakIt(b)}
function breakIt(b){const m=B.m;for(const i of b.tiles){m.breakable.delete(i);const x=i%MW,y=(i/MW)|0;if(b.kind==='gate'){m.t[y][x]='x';redrawTile(m,x,y)}for(let k=0;k<10;k++)fxBit(x*TS+8,y*TS+8,b.kind==='gate'?'#6a4424':'#8a5c30')}
  if(b.kind==='barricade'){b.used=true;b.gone=true;B.usedTraps.barricade=(B.usedTraps.barricade||0)+1}recomputeSolid(m,B.spec);refreshFields(true);AU.sfx('crash');B.shake=5;
  if(b.kind==='gate'){B.banner={text:'The gate is down!',t:2};for(const u of B.units)if(u.side==='e'&&u.alive)alert(u)}}

/* ---------- targeting ---------- */
function visibleTo(e,p){if(!p.hidden)return true;return dist(e,p)<22}
function nearestFoe(u,maxD,filter){let best=null,bd=maxD;for(const v of B.units){if(!v.alive||v.side===u.side)continue;if(filter&&!filter(v))continue;const d=dist(u,v)-v.r;if(d<bd){bd=d;best=v}}return best}
function alert(u){if(!u.alive||u.side!=='e')return;if(u.state==='idle'||u.state==='march'){u.state='fight';fxText(u.x,u.y-16,'!','#ff4030',.8);
  for(const v of B.units)if(v.alive&&v.side==='e'&&v.state==='idle'&&dist(u,v)<90){v.state='fight';fxText(v.x,v.y-16,'!','#ff4030',.8)}AU.sfx('alert')}}
function sight(){return B.night?48:88}

/* ---------- damage ---------- */
function dmgOf(a,t){let b=a.d.dmg;if(a.isLeader)b=a.d.dmg*(a.combo>=3?1.6:1);
  if(a.side==='p'&&!a.isLeader&&B.leader&&B.leader.alive&&dist(a,B.leader)<B.leader.aura)b*=1.3;
  if(a.hidden){b*=2;if(!a.ambushed){a.ambushed=true;fxText(a.x,a.y-18,'AMBUSH!','#ffe060',1);coach('ambush','Ambush! Hidden folk hit twice as hard')}}
  if(a.d.antiMount&&t.d&&t.d.mount)b*=a.d.antiMount;
  // nobles shrug off peasant blows: it takes Wat to bring one down
  if(t.d&&t.d.boss&&a.side==='p'&&!a.isLeader)b*=.4;
  let ar=(t.d&&t.d.armor)||0;if(a.d.pierce)ar=0;else if(a.d.pierceHalf)ar/=2;
  return Math.max(1,Math.round(b*(.88+Math.random()*.24)-ar))}
function strike(src,t,dm,kb=1.2){
  if(!t.alive)return;
  if(t.isLeader&&(t.roll>0||t.inv>0))return;
  t.hp-=dm;t.hitT=.12;t.lastHurt=B.time;
  if(src){const dx=t.x-src.x,dy=t.y-src.y,d=Math.hypot(dx,dy)||1;const k=(src.d&&src.d.big?3:kb)*(t.d.big||t.d.mount?.3:1);moveBy(t,dx/d*k,dy/d*k)}
  // numbers only where they matter: your blows, blows on you, on bosses and from traps
  if(!src||src.isLeader||t.isLeader||t.d.boss)fxNum(t.x,t.y-(t.d.big?28:14),dm,t.isLeader?'#ff5040':src&&src.isLeader?'#ffffff':'#ffe0a0');
  for(let i=0;i<2;i++)fxBit(t.x,t.y-6,t.d.armor>2?'#d0d0d8':'#b02020');
  if(t.d.armor>2&&!(src&&src.d.pierce))AU.sfx('clang');else AU.sfx('hit');
  if(t.side==='e'&&!t.d.raider)alert(t);
  if(t.side==='e'&&t.d.raider&&src&&dist(src,t)<50)t.provoked=src;
  if(t.isLeader){B.shake=Math.max(B.shake,3);t.inv=.22;AU.sfx('hurt')}
  if(t.hp<=0)kill(t,src)}
function kill(u,src){if(!u.alive)return;u.alive=false;u.hp=0;
  B.decals.push({x:u.x,y:u.y,kind:u.d.dog?'dog':u.d.mount?'horse':'body',side:u.side,look:u.look,face:u.face,big:u.d.big,t:0});if(B.decals.length>160)B.decals.shift();
  AU.sfx('die');
  if(u.side==='e'){B.kills++;B.plunder+=u.d.boss?20:1;if(u===B.boss){B.bossDead=true;B.shake=8;B.slow=.25;B.slowT=.9}}
  else{if(u.isLeader){lose('Wat has fallen.')}else if(!u.temp){B.fallen[u.kind]=(B.fallen[u.kind]||0)+1}}}

/* ---------- attacks ---------- */
function attack(u,t){
  u.cd=(u.d.cd||1)*(.9+Math.random()*.2);u.atkT=.25;u.face=t.x>u.x?1:-1;
  if(u.d.ranged){shoot(u,t.x,t.y,u.d.ranged,dmgOf(u,t));u.lastAtk=B.time;return}
  strike(u,t,dmgOf(u,t));AU.sfx('swing');
  if(u.d.cleave){let n=u.d.cleave-1;for(const v of B.units){if(n<=0)break;if(v!==t&&v.alive&&hostile(u,v)&&dist(u,v)<u.d.range+v.r+3){strike(u,v,dmgOf(u,v));n--}}}
  u.lastAtk=B.time}
function shoot(u,tx,ty,kind,dm,obj){const P0=PROJ[kind];let range=(u.d.range||80);
  // lead a moving target a little, and spread so volleys don't all land on one spot
  const sp=kind==='bolt'||kind==='arrow'?3:6;tx+=(Math.random()-.5)*sp;ty+=(Math.random()-.5)*sp;
  const d=Math.hypot(tx-u.x,ty-u.y);B.proj.push({x:u.x,y:u.y-6,sx:u.x,sy:u.y-6,tx,ty,t:0,T:Math.max(.12,d/P0.spd),kind,dmg:dm,side:u.side,src:u,obj});AU.sfx('shoot')}
function landProj(p){
  if(p.kind==='fire'||p.kind==='torch'){
    if(p.obj&&p.obj.isObj){damageObj(p.dmg*3);p.obj.burn=4}
    else if(p.obj&&p.obj.kind==='hay'){igniteHay(p.obj)}
    else ignite(tileIdx(p.tx,p.ty),p.kind==='fire'?3.5:2.5);
    if(p.kind==='torch'&&B.cart&&Math.hypot(p.tx-B.cart.x,p.ty-B.cart.y+6)<14){B.cart.hp-=p.dmg*2;B.cart.flash=.12}}
  let best=null,bd=8;for(const v of B.units){if(!v.alive||v.side===p.side)continue;const d=Math.hypot(v.x-p.tx,v.y-6-p.ty+6);if(d<bd+v.r){bd=d;best=v}}
  if(best)strike(p.src,best,p.dmg,.6);
  if(p.kind==='stone'||p.kind==='arrow'||p.kind==='bolt'){if(!best)fxBit(p.tx,p.ty,'#8a8478')}}
function damageObj(dm){const o=B.obj;if(!o)return;o.hp-=dm;o.flash=.1;fxNum((o.x+o.w/2)*TS,o.y*TS,Math.round(dm),'#ffb040');if(o.hp<=0){o.hp=0;lose(o.name+' was destroyed.')}}
function distToRect(u,o){const rx=o.x*TS,ry=o.y*TS,rw=o.w*TS,rh=o.h*TS;const dx=Math.max(rx-u.x,0,u.x-(rx+rw)),dy=Math.max(ry-u.y,0,u.y-(ry+rh));return Math.hypot(dx,dy)}

/* ---------- fire ---------- */
function ignite(i,dur){if(i<0||i>=MW*MH)return;const m=B.m,x=i%MW,y=(i/MW)|0,c=m.t[y][x];if(c==='~'||c==='b')return;
  const fl=TILE_FLAM[c];const d=fl?6:dur;if(B.fire[i]<d)B.fire[i]=d;AU.sfx('fire');
  for(const tr of B.traps)if(tr.kind==='hay'&&!tr.used&&tr.tx===x&&tr.ty===y)igniteHay(tr)}
function igniteHay(tr){if(tr.used)return;tr.used=true;B.usedTraps.hay=(B.usedTraps.hay||0)+1;AU.sfx('crash');B.shake=4;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=tr.tx+dx,y=tr.ty+dy;if(x<0||y<0||x>=MW||y>=MH)continue;const i=y*MW+x;if(!B.m.solid[i]||B.m.solid[i]===3)B.fire[i]=Math.max(B.fire[i],dx||dy?5:7)}
  fxRing(tr.x,tr.y,30,'#ff8020')}
function updateFire(dt){const m=B.m,f=B.fire;B.fireT+=dt;const spread=B.fireT>.4;if(spread)B.fireT=0;let any=false;
  for(let i=0;i<f.length;i++){if(f[i]<=0)continue;any=true;f[i]-=dt;const x=i%MW,y=(i/MW)|0;
    if(spread){for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=MW||ny>=MH)continue;const j=ny*MW+nx;if(f[j]<=0&&TILE_FLAM[m.t[ny][nx]]&&Math.random()<.32)f[j]=6}
      if(B.obj){const o=B.obj;if(x>=o.x-1&&x<=o.x+o.w&&y>=o.y-1&&y<=o.y+o.h)damageObj(2)}
      for(const tr of B.traps)if(tr.kind==='hay'&&!tr.used&&Math.abs(tr.tx-x)<=1&&Math.abs(tr.ty-y)<=1&&Math.random()<.5)igniteHay(tr)}
    if(f[i]<=0){f[i]=0;if(TILE_FLAM[m.t[y][x]]){m.t[y][x]='x';redrawTile(m,x,y)}}}
  if(!any)return;
  for(const u of B.units){if(!u.alive)continue;const i=tileIdx(u.x,u.y);if(f[i]>0){u.burnAcc=(u.burnAcc||0)+12*dt*(u.isLeader?.8:1);if(u.burnAcc>=4){const d=Math.round(u.burnAcc);u.burnAcc=0;
    if(!(u.isLeader&&u.roll>0)){u.hp-=d;u.hitT=.1;u.lastHurt=B.time;fxNum(u.x,u.y-14,d,'#ff9030');if(u.isLeader){B.shake=Math.max(B.shake,2);coach('fire','Careful! Fire burns your side too')}if(u.side==='e'&&!u.d.boss){u.fear=Math.max(u.fear,.6);u.fearFrom={x:(i%MW)*TS+8,y:((i/MW)|0)*TS+8}}if(u.hp<=0)kill(u,null)}}}}}

/* ---------- traps ---------- */
function updateTraps(dt){for(const tr of B.traps){if(tr.used)continue;tr.t+=dt;
  if(tr.kind==='caltrops'){for(const u of B.units){if(!u.alive||u.side!=='e'||u.d.boss&&u.d.mount===undefined&&false)continue;if(Math.hypot(u.x-tr.x,u.y-tr.y)<12){u.slow=.3;u.calAcc=(u.calAcc||0)+(u.d.mount?14:4)*dt;if(u.calAcc>=3){const d=Math.round(u.calAcc);u.calAcc=0;u.hp-=d;u.hitT=.08;fxNum(u.x,u.y-14,d,'#c8c8d0');if(u.hp<=0)kill(u,null);else alert(u)}}}continue}
  if(tr.kind==='hay'||tr.kind==='barricade')continue;
  const rad=tr.kind==='hive'?16:tr.kind==='deadfall'?10:7;
  const v=B.units.find(u=>u.alive&&u.side==='e'&&Math.hypot(u.x-tr.x,u.y-tr.y)<rad+u.r*.5);if(!v)continue;
  tr.used=true;B.usedTraps[tr.kind]=(B.usedTraps[tr.kind]||0)+1;coach('trap','Your trap got one!');
  if(tr.kind==='pit'){const dm=v.d.boss?24:v.d.mount?60:40;strike(null,v,dm);v.stun=3;v.x=tr.x;v.y=tr.y;AU.sfx('trap');B.shake=2;fxText(tr.x,tr.y-18,'PIT!','#ffe060',.9)}
  else if(tr.kind==='snare'){v.root=v.d.boss?2:6;AU.sfx('trap');fxText(tr.x,tr.y-18,'SNARED!','#ffe060',.9);alert(v)}
  else if(tr.kind==='hive'){B.fx.push({kind:'swarm',x:tr.x,y:tr.y,t:0,T:6});AU.sfx('buzz');fxText(tr.x,tr.y-18,'BEES!','#ffe060',.9)}
  else if(tr.kind==='deadfall'){AU.sfx('crash');B.shake=6;fxRing(tr.x,tr.y,22,'#c8a060');fxText(tr.x,tr.y-18,'CRASH!','#ffe060',.9);for(const u of B.units)if(u.alive&&u.side==='e'&&Math.hypot(u.x-tr.x,u.y-tr.y)<24){strike(null,u,u.d.boss?18:28);u.stun=2}}
}}

/* ---------- unit brains ---------- */
function updatePeasant(u,dt){
  const L=B.leader;if(u.flee>0){u.flee-=dt;const e=nearestFoe(u,80);if(e){const dx=u.x-e.x,dy=u.y-e.y,d=Math.hypot(dx,dy)||1;stepToward(u,u.x+dx/d*20,u.y+dy/d*20,dt,1.15)}return}
  const inAura=L&&L.alive&&dist(u,L)<L.aura;
  if(!inAura&&u.hp<u.max*.3&&u.fleeCd<=0&&!u.temp&&nearestFoe(u,40)){u.flee=2.5;u.fleeCd=9;coach('flee','Scared folk run. Stay close to them!');fxText(u.x,u.y-16,'!','#80c0ff',.6);return}
  const ord=B.order,R=u.d.range,ranged=!!u.d.ranged,rng2=ranged&&B.night?R*.75:R;
  u.retarget-=dt;
  if(u.retarget<=0||u.target&&!u.target.alive){u.retarget=.3;
    if(ord==='hold')u.target=nearestFoe(u,ranged?rng2:64,v=>ranged||dist(v,u.home)<90);
    else if(ord==='charge')u.target=nearestFoe(u,9999);
    else u.target=nearestFoe(u,ranged?rng2:56);
    // firebrands light hay traps when foes are near them
    if(u.kind==='torch'){const hay=B.traps.find(tr=>tr.kind==='hay'&&!tr.used&&Math.hypot(tr.x-u.x,tr.y-u.y)<rng2&&B.units.some(e=>e.alive&&e.side==='e'&&Math.hypot(e.x-tr.x,e.y-tr.y)<22));u.hayT=hay||null}}
  if(u.kind==='torch'&&u.hayT&&!u.hayT.used&&u.cd<=0){u.cd=u.d.cd;u.atkT=.25;shoot(u,u.hayT.x,u.hayT.y,'fire',u.d.dmg,u.hayT);u.lastAtk=B.time;return}
  const t=u.target;
  if(t&&t.alive){const d=dist(u,t)-t.r;
    if(d<=(ranged?rng2:R)){if(u.cd<=0)attack(u,t);else if(Math.abs(t.x-u.x)>1)u.face=t.x>u.x?1:-1;return}
    if(ranged&&ord==='hold')return;
    navigate(u,t.x,t.y,B.F.foes,dt);return}
  // no foe in reach: go where the orders say
  if(ord==='hold'){if(Math.hypot(u.home.x-u.x,u.home.y-u.y)>4)navigate(u,u.home.x,u.home.y,null,dt)}
  else if(ord==='follow'&&L&&L.alive){const k=u.id%12,ring=k<6?16:26,a=k*1.047+(k<6?0:.5);const gx=L.x+Math.cos(a)*ring,gy=L.y+Math.sin(a)*ring*.8;
    if(Math.hypot(gx-u.x,gy-u.y)>5)navigate(u,gx,gy,dist(u,L)>40?B.F.leader:null,dt,dist(u,L)>50?1.25:1)}
  else if(ord==='charge'){if(B.m.gate&&B.m.gate.hp>0&&B.F.foes){navigate(u,u.x,u.y,B.F.foes,dt)}else if(B.F.foes)navigate(u,u.x,u.y,B.F.foes,dt)}
}
function updateFoe(u,dt){
  if(u.fear>0){u.fear-=dt;const f=u.fearFrom||u;const dx=u.x-f.x,dy=u.y-f.y,d=Math.hypot(dx,dy)||1;stepToward(u,u.x+dx/d*20+(Math.random()-.5)*10,u.y+dy/d*20,dt,1);return}
  const S=sight();
  if(u.state==='idle'){u.retarget-=dt;if(u.retarget<=0){u.retarget=.4;const v=nearestFoe(u,S,p=>visibleTo(u,p));if(v)alert(u)}
    if(B.spec.bossAlertAt&&u===B.boss&&B.time>B.spec.bossAlertAt){u.state='fight'}return}
  if(u.d.boss){bossSpecial(u,dt);if(u.wind>0||u.dashT>0)return}
  // raiders (torchmen) go for the objective unless someone picks a fight
  if(u.d.raider&&(B.obj||B.cart)&&!(u.provoked&&u.provoked.alive&&dist(u,u.provoked)<60)){
    const tgt=B.obj?B.obj:null;
    if(tgt){const d=distToRect(u,tgt);if(d<=u.d.range){if(u.cd<=0){u.cd=u.d.cd;u.atkT=.25;const cx=(tgt.x+tgt.w/2)*TS+(Math.random()-.5)*20,cy=(tgt.y+tgt.h/2)*TS+(Math.random()-.5)*14;shoot(u,cx,cy,'torch',u.d.dmg,Object.assign(tgt,{isObj:true}))}return}
      navigate(u,(tgt.x+tgt.w/2)*TS,(tgt.y+tgt.h/2)*TS,B.F.goal,dt);return}}
  u.retarget-=dt;
  if(u.retarget<=0||u.target&&!u.target.alive){u.retarget=.35;
    const range=u.state==='fight'?150:S;
    let v=nearestFoe(u,range,p=>visibleTo(u,p));
    if(u===B.boss&&B.leader&&B.leader.alive&&dist(u,B.leader)<170)v=B.leader;
    u.target=v;if(v&&u.state==='march')alert(u)}
  const t=u.target;
  // goal pressure: protect/escort/exit battles pull foes toward the goal unless a fight is right next to them
  const goalFirst=(B.spec.goal==='exit'&&u.state==='march')||(B.cart&&!B.cart.done&&(!t||dist(u,t)>40))||(B.obj&&(!t||dist(u,t)>48)&&u.state!=='fight');
  if(t&&t.alive&&!goalFirst){const d=dist(u,t)-t.r;
    if(u.d.charge&&u.chargeCd<=0&&d>28&&d<120&&clearLine(u.x,u.y,t.x,t.y)){u.charging=1.1;const dd=Math.hypot(t.x-u.x,t.y-u.y)||1;u.cdir={x:(t.x-u.x)/dd,y:(t.y-u.y)/dd};u.chargeHit=new Set();u.chargeCd=3.6;coach('charge','Riders charge in lines. {B} Roll aside!');fxText(u.x,u.y-20,'!','#ffb040',.5)}
    if(u.charging>0){doCharge(u,dt);return}
    if(d<=u.d.range){if(u.cd<=0)attack(u,t);return}
    navigate(u,t.x,t.y,B.F.players,dt);return}
  if(u.charging>0){doCharge(u,dt);return}
  // march toward the goal
  if(B.obj){const d=distToRect(u,B.obj);if(d<=u.d.range+2){if(u.cd<=0){u.cd=u.d.cd;u.atkT=.25;if(u.d.ranged){shoot(u,(B.obj.x+B.obj.w/2)*TS,(B.obj.y+B.obj.h/2)*TS,u.d.ranged,u.d.dmg,Object.assign(B.obj,{isObj:true}))}else{damageObj(u.d.dmg);AU.sfx('gate')}}return}
    navigate(u,(B.obj.x+B.obj.w/2)*TS,(B.obj.y+B.obj.h/2)*TS,B.F.goal,dt);return}
  if(B.cart&&!B.cart.done){const c=B.cart,d=Math.hypot(c.x-u.x,c.y-u.y);if(d<=u.d.range+10){if(u.cd<=0){u.cd=u.d.cd;u.atkT=.25;u.face=c.x>u.x?1:-1;if(u.d.ranged)shoot(u,c.x,c.y-6,u.d.ranged,u.d.dmg);else{c.hp-=u.d.dmg;c.flash=.1;fxNum(c.x,c.y-18,u.d.dmg,'#ffb040');AU.sfx('gate')}}return}
    navigate(u,c.x,c.y,B.F.goal,dt);return}
  if(B.spec.goal==='exit'){const ex=B.spec.exit[0]*TS+8,ey=B.spec.exit[1]*TS+8;if(Math.hypot(ex-u.x,ey-u.y)<14){u.alive=false;u.escaped=true;B.escaped++;fxText(ex-20,ey-10,'GOT THROUGH','#ff6040',1.2);
      if(B.escaped>=B.spec.exitLimit)lose('Too many got through.');return}
    navigate(u,ex,ey,B.F.goal,dt);return}
  if(B.F.players)navigate(u,u.x,u.y,B.F.players,dt);
}
function doCharge(u,dt){u.charging-=dt;const s=u.d.speed*1.9*dt;const hit=moveBy(u,u.cdir.x*s,u.cdir.y*s);u.face=u.cdir.x>0?1:-1;u.walk+=dt*4;
  if(Math.random()<.5)fxBit(u.x-u.cdir.x*6,u.y,'#9a8a6a');
  for(const v of B.units){if(!v.alive||v.side===u.side||u.chargeHit.has(v.id))continue;if(dist(u,v)<u.r+v.r+3){u.chargeHit.add(v.id);
    if(v.d.antiMount&&!v.isLeader){strike(v,u,35);u.stun=1.4;u.charging=0;fxText(u.x,u.y-20,'BRACED!','#80ff80',1);return}
    strike(u,v,dmgOfCharge(u,v),5)}}
  if(hit)u.charging=0}
function dmgOfCharge(u,v){return Math.max(1,Math.round(u.d.charge*(.9+Math.random()*.2)))}
function bossSpecial(u,dt){
  u.specCd-=dt;const L=B.leader;if(!L||!L.alive)return;
  if(u.wind>0){u.wind-=dt;if(u.wind<=0){const sp=u.d.special;
      if(sp==='spin'||sp==='summon'){AU.sfx('crash');B.shake=5;fxRing(u.x,u.y,30,'#ff4040');for(const v of B.units)if(v.alive&&v.side==='p'&&dist(u,v)<30+v.r)strike(u,v,Math.round(u.d.dmg*1.6),6)}
      if(sp==='dash'){u.dashT=.35;const d=Math.hypot(L.x-u.x,L.y-u.y)||1;u.cdir={x:(L.x-u.x)/d,y:(L.y-u.y)/d};u.chargeHit=new Set()}}
    return}
  if(u.dashT>0){u.dashT-=dt;moveBy(u,u.cdir.x*230*dt,u.cdir.y*230*dt);fxBit(u.x,u.y,'#c0c0c0');for(const v of B.units){if(!v.alive||v.side==='e'||u.chargeHit.has(v.id))continue;if(dist(u,v)<u.r+v.r+3){u.chargeHit.add(v.id);strike(u,v,18,5)}}return}
  if(u.specCd>0)return;const d=dist(u,L);
  if(u.d.special==='summon'&&B.summonT<=0){B.summonT=17;const sp=Object.values(B.spec.spawns);for(let i=0;i<2;i++){const s=sp[i%sp.length];queueSpawn('rguard',s,0,'fight')}fxText(u.x,u.y-28,'GUARDS!','#ffd040',1.2);AU.sfx('horn')}
  if((u.d.special==='spin'||u.d.special==='summon')&&d<34){u.wind=.75;u.specCd=6.5;return}
  if(u.d.special==='dash'&&d>30&&d<110){u.wind=.55;u.specCd=5;return}
}

/* ---------- waves ---------- */
function queueSpawn(kind,at,delay,state='march'){B.queue.push({kind,at,t:B.time+delay,state})}
function updateWaves(dt){
  for(const w of B.waves){if(w.done||B.time<w.t)continue;w.done=true;const at=B.spec.spawns[w.at];let k=0;
    for(const[kind,n]of Object.entries(w.u))for(let i=0;i<n;i++){if(G.plan.scheme==='rumor'&&Math.random()<.25){continue}queueSpawn(kind,at,k*.45);k++}
    if(k){B.banner={text:'Enemies '+dirName(at)+'!',t:1.6,small:1};AU.sfx('alert')}}
  for(let i=B.queue.length-1;i>=0;i--){const q=B.queue[i];if(B.time<q.t)continue;B.queue.splice(i,1);
    const x=q.at[0]*TS+8+(Math.random()-.5)*8,y=q.at[1]*TS+8+(Math.random()-.5)*8;const u=spawnFoe(q.kind,x,y,q.state);u.face=x>B.leader.x?-1:1}
  if(B.spec.militiaWaves){B.militiaT-=dt;if(B.militiaT<=0){B.militiaT=15;const o=B.obj;for(let i=0;i<3;i++){const u=mkUnit('p','stones',(o.x+o.w/2)*TS+(i-1)*10,(o.y+o.h)*TS+8,{temp:true});B.units.push(u)}
    B.banner={text:'City folk join the fight!',t:1.6,small:1};AU.sfx('shout')}}
  if(B.boss&&B.boss.d.special==='summon'&&B.boss.state!=='idle')B.summonT-=dt;
}
function dirName([x,y]){if(x<=1)return 'from the west';if(x>=MW-2)return 'from the east';if(y<=1)return 'from the north';if(y>=MH-2)return 'from the south';return 'ahead'}
function wavesLeft(){return B.waves.some(w=>!w.done)||B.queue.length>0}

/* ---------- the leader ---------- */
const HELD={up:0,down:0,left:0,right:0,a:0,b:0,start:0,select:0};
function leaderInput(b){const L=B.leader;if(!L||!L.alive||B.state!=='fight')return;
  if(b==='a')leaderSwing(L);
  else if(b==='b'){if(L.rollCd<=0){const dx=(HELD.right?1:0)-(HELD.left?1:0),dy=(HELD.down?1:0)-(HELD.up?1:0);const d=Math.hypot(dx,dy);L.rollDir=d?{x:dx/d,y:dy/d}:{x:L.aim.x,y:L.aim.y};L.roll=.26;L.rollCd=.6;B.did.rolled=1;AU.sfx('roll')}}
  else if(b==='select'){const i=(ORDERS.indexOf(B.order)+1)%ORDERS.length;setOrder(ORDERS[i])}}
function setOrder(o){B.order=o;for(const u of B.units)if(u.side==='p'&&!u.isLeader){u.retarget=0;if(o==='hold'){u.home={x:u.x,y:u.y}}}
  B.banner={text:ORDER_NAME[o],t:1,order:1};AU.sfx('shout');fxRing(B.leader.x,B.leader.y,B.leader.aura,'#ffe080')}
function leaderSwing(L){if(L.cd>0)return;B.did.swings++;L.cd=.3;L.atkT=.2;L.comboT=.7;L.combo=L.combo>=3?1:L.combo+1;AU.sfx('swing');
  const R=L.d.range;let hitAny=false;
  // aim at the nearest foe in reach, so the swing goes where it is needed
  let near=null,nd=R+8;for(const v of B.units){if(!v.alive||v.side==='p')continue;const d=dist(L,v)-v.r;if(d<nd){nd=d;near=v}}
  if(near){const d=dist(L,near)||1;L.aim={x:(near.x-L.x)/d,y:(near.y-L.y)/d};if(Math.abs(L.aim.x)>.1)L.face=L.aim.x>0?1:-1}
  for(const v of B.units){if(!v.alive||v.side==='p')continue;const dx=v.x-L.x,dy=v.y-L.y,d=Math.hypot(dx,dy);if(d>R+v.r+2)continue;
    if(d>4&&(dx*L.aim.x+dy*L.aim.y)/d<-.15)continue;strike(L,v,dmgOf(L,v),L.combo>=3?4:2);hitAny=true}
  if(hitAny&&L.combo>=3){B.shake=Math.max(B.shake,2)}
  const fx=L.x+L.aim.x*12,fy=L.y-4+L.aim.y*12;
  for(const tr of B.traps){if(tr.kind==='hay'&&!tr.used&&Math.hypot(tr.x-L.x,tr.y-L.y)<22){igniteHay(tr);fxText(tr.x,tr.y-16,'FIRE!','#ff9030',1)}}
  const i=tileIdx(fx,fy+4);const b=B.m.breakable.get(i);if(b&&b.kind==='gate'){L.cd=0;hitBreakable(L,b,{x:(i%MW)*TS+8,y:((i/MW)|0)*TS+8});L.cd=.3}
  B.fx.push({kind:'slash',x:L.x,y:L.y-5,ax:L.aim.x,ay:L.aim.y,t:0,T:.15,big:L.combo>=3})}
function updateLeader(L,dt){
  L.cd-=dt;L.rollCd-=dt;L.inv-=dt;L.comboT-=dt;if(L.comboT<=0)L.combo=0;
  if(B.time-L.lastHurt>4&&L.hp<L.max)L.hp=Math.min(L.max,L.hp+3*dt);
  if(L.roll>0){L.roll-=dt;moveBy(L,L.rollDir.x*175*dt,L.rollDir.y*175*dt);L.walk+=dt*5;if(Math.abs(L.rollDir.x)>.1)L.face=L.rollDir.x>0?1:-1;return}
  if(L.stun>0){L.stun-=dt;return}
  const dx=(HELD.right?1:0)-(HELD.left?1:0),dy=(HELD.down?1:0)-(HELD.up?1:0);
  if(dx||dy){B.did.moved+=dt;const d=Math.hypot(dx,dy);L.aim={x:dx/d,y:dy/d};if(dx)L.face=dx;const s=speedOf(L)*dt;moveBy(L,dx/d*s,dy/d*s);L.walk+=dt*2.6}
  if(HELD.a&&L.cd<=0&&L.heldA>.3)leaderSwing(L);L.heldA=HELD.a?(L.heldA||0)+dt:0;
}

/* ---------- the main step ---------- */
function updateBattle(dt){
  if(!B)return;if(B.slowT>0){B.slowT-=dt;if(B.slowT<=0)B.slow=1}dt*=B.slow;
  for(const f of B.fx)f.t+=dt;B.fx=B.fx.filter(f=>f.t<f.T);
  for(const d of B.decals)d.t+=dt;
  if(B.banner){B.banner.t-=dt;if(B.banner.t<=0)B.banner=null}
  B.shake=Math.max(0,B.shake-dt*14);
  if(B.state==='deploy')return;
  if(B.state!=='fight'){B.endT+=dt;for(const u of B.units)if(u.alive&&u.side==='e'&&B.state==='won'){u.fear=1;u.fearFrom=B.leader}animOnly(dt);return}
  B.time+=dt;updateCoach(dt/Math.max(B.slow,.35));lessons();
  updateWaves(dt);refreshFields(false);
  for(const u of B.units){if(!u.alive)continue;u.cd-=dt;u.atkT-=dt;u.hitT-=dt;u.slow-=dt;u.root-=dt;u.fleeCd-=dt;u.chargeCd-=dt;
    // hidden in wheat or brush until they strike
    const c=tileAt(B.m,u.x,u.y);u.hidden=!!TILE_HIDE[c]&&u.side==='p'&&B.time-u.lastAtk>1.5;if(!u.hidden&&u.side==='p'&&B.time-u.lastAtk>1.5)u.ambushed=false;
    if(u.side==='p'&&!u.isLeader&&B.time-u.lastHurt>5&&u.hp<u.max)u.hp=Math.min(u.max,u.hp+(G.plan.scheme==='herb'?3:1)*dt);
    if(u.isLeader){updateLeader(u,dt);continue}
    if(u.stun>0){u.stun-=dt;continue}
    if(u.side==='p')updatePeasant(u,dt);else updateFoe(u,dt)}
  // keep bodies from stacking
  const us=B.units;for(let i=0;i<us.length;i++){const a=us[i];if(!a.alive)continue;for(let j=i+1;j<us.length;j++){const b=us[j];if(!b.alive)continue;
    const dx=b.x-a.x,dy=b.y-a.y,rr=a.r+b.r;if(dx>rr||dx<-rr||dy>rr||dy<-rr)continue;const d=Math.hypot(dx,dy);if(d>=rr||d===0)continue;
    const push=(rr-d)/2,nx=dx/d*push,ny=dy/d*push;const wa=a.isLeader||a.d.big?.3:1,wb=b.isLeader||b.d.big?.3:1;moveBy(a,-nx*wa,-ny*wa);moveBy(b,nx*wb,ny*wb)}}
  // projectiles
  for(const p of B.proj){p.t+=dt;if(p.t>=p.T){p.done=true;landProj(p)}}B.proj=B.proj.filter(p=>!p.done);
  updateTraps(dt);updateFire(dt);
  // swarms
  for(const f of B.fx)if(f.kind==='swarm'){for(const u of B.units)if(u.alive&&u.side==='e'&&Math.hypot(u.x-f.x,u.y-f.y)<30){u.beeAcc=(u.beeAcc||0)+5*dt;u.fear=Math.max(u.fear,.5);u.fearFrom=f;if(u.beeAcc>=3){u.beeAcc=0;u.hp-=3;u.hitT=.08;fxNum(u.x,u.y-14,3,'#ffe040');if(u.hp<=0)kill(u,null)}}}
  if(B.obj){const o=B.obj;o.flash-=dt;if(o.burn>0){o.burn-=dt;o.burnAcc=(o.burnAcc||0)+3*dt;if(o.burnAcc>=3){o.burnAcc=0;damageObj(3)}}}
  if(B.cart)updateCart(dt);
  if(B.hold){const h=B.hold,L=B.leader,inZ=(u)=>u.x>=h.x*TS&&u.x<=(h.x+h.w)*TS&&u.y>=h.y*TS&&u.y<=(h.y+h.h)*TS;
    const blocked=B.units.some(u=>u.alive&&u.side==='e'&&inZ(u));h.active=inZ(L)&&!blocked;if(h.active){h.prog+=dt;if(Math.random()<dt*6)fxBit((h.x+1.5)*TS,(h.y-1)*TS,'#ff9030')}}
  B.units=B.units.filter(u=>u.alive||u.side==='p'&&u.isLeader);
  checkEnd();
  if(B.leader&&B.state==='fight'){const L=B.leader;B.cam.x=lerp(B.cam.x,L.x-W/2+L.aim.x*20,Math.min(1,dt*6));B.cam.y=lerp(B.cam.y,L.y-H/2+L.aim.y*14,Math.min(1,dt*6));clampCam()}
}
function animOnly(dt){for(const u of B.units){if(!u.alive)continue;u.atkT-=dt;u.hitT-=dt;if(u.fear>0&&u.side==='e'){u.fear-=dt*.2;const f=u.fearFrom||B.leader;const dx=u.x-f.x,dy=u.y-f.y,d=Math.hypot(dx,dy)||1;stepToward(u,u.x+dx/d*20,u.y+dy/d*20,dt,1.2)}}
  for(const p of B.proj){p.t+=dt;if(p.t>=p.T)p.done=true}B.proj=B.proj.filter(p=>!p.done);
  for(let i=0;i<B.fire.length;i++)if(B.fire[i]>0)B.fire[i]=Math.max(0,B.fire[i]-dt)}
function updateCart(dt){const c=B.cart;c.flash-=dt;if(c.done)return;if(c.hp<=0){lose('The cart was destroyed.');return}
  const near=B.units.some(u=>u.alive&&u.side==='p'&&Math.hypot(u.x-c.x,u.y-c.y)<60);const blocked=B.units.some(u=>u.alive&&u.side==='e'&&Math.hypot(u.x-c.x,u.y-c.y)<18);
  c.moving=near&&!blocked;c.why=!near?'The cart waits for you':blocked?'Foes block the cart!':'';if(!c.moving)return;
  const p=c.path[c.pi];if(!p){c.done=true;return}const dx=p.x-c.x,dy=p.y-c.y,d=Math.hypot(dx,dy);const s=c.speed*dt;
  if(d<=s){c.x=p.x;c.y=p.y;c.pi++;if(c.pi>=c.path.length)c.done=true}else{c.x+=dx/d*s;c.y+=dy/d*s}}
function checkEnd(){if(B.state!=='fight')return;const s=B.spec;
  const folk=B.units.some(u=>u.alive&&u.side==='p'&&!u.isLeader&&!u.temp);
  if(B.deployedFolk>0&&!folk){lose('Your whole band fell.');return}
  const foes=B.units.some(u=>u.alive&&u.side==='e');
  if(s.win==='rout'&&!foes&&!wavesLeft())win();
  else if(s.win==='survive'&&B.time>=s.time)win();
  else if(s.win==='boss'&&B.bossDead)win();
  else if(s.win==='hold'&&B.hold.prog>=B.hold.need)win();
  else if(s.win==='escort'&&B.cart.done)win()}
function win(){if(B.state!=='fight')return;B.state='won';B.endT=0;B.banner={text:'VICTORY!',t:2.5,big:1};AU.stop();AU.sfx('win');B.slow=.4;B.slowT=.7}
function lose(why){if(B.state!=='fight')return;B.state='lost';B.endT=0;B.loseWhy=why;B.banner={text:'DEFEAT',t:2.5,big:1,bad:1};AU.stop();AU.sfx('lose')}
function clampCam(){B.cam.x=clamp(B.cam.x,0,MW*TS-W);B.cam.y=clamp(B.cam.y,0,MH*TS-H)}

/* ---------- effects ---------- */
function fxNum(x,y,v,c){B.fx.push({kind:'num',x:x+(Math.random()-.5)*4,y,v,c,t:0,T:.7})}
function fxText(x,y,s,c,T){B.fx.push({kind:'text',x,y,s,c,t:0,T})}
function fxBit(x,y,c){B.fx.push({kind:'bit',x,y,vx:(Math.random()-.5)*60,vy:-Math.random()*50-10,c,t:0,T:.35+Math.random()*.2})}
function fxRing(x,y,r,c){B.fx.push({kind:'ring',x,y,r,c,t:0,T:.35})}

/* ---------- drawing ---------- */
function drawBattle(t){
  const g=ctx,m=B.m;let cx=Math.round(B.cam.x),cy=Math.round(B.cam.y);
  if(B.shake>0){cx+=Math.round((Math.random()-.5)*B.shake);cy+=Math.round((Math.random()-.5)*B.shake)}
  g.fillStyle='#000';g.fillRect(0,0,W,H);
  g.drawImage(m.cache,cx,cy,W,H,0,0,W,H);
  g.save();g.translate(-cx,-cy);
  // shimmer on water
  const tx0=Math.max(0,cx>>4),ty0=Math.max(0,cy>>4),tx1=Math.min(MW-1,(cx+W)>>4),ty1=Math.min(MH-1,(cy+H)>>4);
  for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++)if(m.t[y][x]==='~'){const k=(t*2+hash(x,y,3)*6)%6;if(k<2)P(g,'#5a92c8',x*TS+(hash(x,y,4)*10|0),y*TS+(hash(x,y,5)*12|0)+(k*2|0),4,1)}
  if(B.hold){const h=B.hold;g.globalAlpha=.25+.15*Math.sin(t*5);P(g,'#ffd040',h.x*TS,h.y*TS,h.w*TS,h.h*TS);g.globalAlpha=1;g.strokeStyle='#ffd040';g.strokeRect(h.x*TS+.5,h.y*TS+.5,h.w*TS-1,h.h*TS-1)}
  if(B.spec.goal==='exit'){const[ex,ey]=B.spec.exit;g.globalAlpha=.3+.2*Math.sin(t*4);P(g,'#ff4030',ex*TS-8,ey*TS-4,24,24);g.globalAlpha=1}
  // bodies
  for(const d of B.decals)drawBody(g,d);
  // traps
  for(const tr of B.traps){if(tr.gone)continue;if(tr.kind==='barricade')continue;drawTrap(g,tr,t,false)}
  if(B.obj)drawObjective(g,B.obj,t);
  // y-sorted things
  const list=B.units.filter(u=>u.alive);const ents=list.map(u=>({y:u.y,u}));
  for(const tr of B.traps)if(tr.kind==='barricade'&&!tr.gone)ents.push({y:tr.y+4,tr});
  if(B.cart)ents.push({y:B.cart.y,cart:1});
  ents.sort((a,b)=>a.y-b.y);
  for(const e of ents){if(e.u)drawUnit(g,e.u,t);else if(e.tr)drawTrap(g,e.tr,t,false);else drawCart(g,B.cart,t)}
  g.drawImage(m.canopy,cx,cy,W,H,cx,cy,W,H);
  // fire
  for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++){const f=B.fire[y*MW+x];if(f<=0)continue;const X=x*TS,Y=y*TS;
    for(let i=0;i<5;i++){const k=(t*7+i*1.7+hash(x,y,i)*9)%1,fx=X+2+hash(x,y,i+9)*12,fy=Y+14-k*14;P(g,k<.3?'#ffe060':k<.7?'#ff8020':'#a03010',fx|0,fy|0,2,2)}
    g.globalAlpha=.25;P(g,'#ff6010',X,Y,TS,TS);g.globalAlpha=1}
  if(B.obj&&B.obj.burn>0){const o=B.obj;for(let i=0;i<6;i++){const k=(t*6+i*.37)%1;P(g,k<.4?'#ffe060':'#ff7020',(o.x*TS+6+i*((o.w*TS-12)/5))|0,(o.y*TS+10-k*14)|0,2,3)}}
  for(const p of B.proj)drawProj(g,p,t);
  for(const f of B.fx)drawFx(g,f,t);
  if(B.leader&&B.leader.alive&&B.state==='fight'){const L=B.leader;g.globalAlpha=.18;g.strokeStyle='#ffe080';g.setLineDash([2,4]);g.beginPath();g.arc(L.x,L.y-3,L.aura,0,7);g.stroke();g.setLineDash([]);g.globalAlpha=1}
  if(B.leader&&B.state==='fight')for(const tr of B.traps)if(tr.kind==='hay'&&!tr.used&&dist(tr,B.leader)<26){const bx=Math.round(tr.x),by=Math.round(tr.y)-17+((t*4|0)%2);disc(g,'#000',bx,by,5);disc(g,'#c83020',bx,by,4);P(g,'#fff',bx-1,by-2,3,1);P(g,'#fff',bx-2,by-1,1,4);P(g,'#fff',bx+2,by-1,1,4);P(g,'#fff',bx-1,by,3,1)}
  g.restore();
  if(B.night)drawNight(g,cx,cy,t);
  drawEdgeMarks(g,cx,cy,t);
}
function drawUnit(g,u,t){
  const o={face:u.face,walk:u.walk,atk:u.atkT>0?u.atkT/.25:0,flash:u.hitT>0,t};
  let a=1;if(u.hidden)a=.55;if(u.isLeader&&u.inv>0&&((t*30|0)%2))a=.5;g.globalAlpha=a;
  if(u.d.boss&&u.wind>0){g.globalAlpha=.4+.3*Math.sin(t*30);g.strokeStyle='#ff3030';g.beginPath();g.arc(u.x,u.y-2,30,0,7);g.stroke();g.globalAlpha=a}
  if(u.isLeader&&u.roll>0){g.save();g.translate(u.x,u.y-5);g.rotate(u.roll*30*u.face);P(g,u.look.tunic,-3,-3,6,6);P(g,u.look.skin,-2,-5,4,3);g.restore();g.globalAlpha=1;return}
  if(u.d.dog)drawDog(g,u.x,u.y,o);
  else if(u.d.big){g.save();g.translate(Math.round(u.x),Math.round(u.y));g.scale(2,2);drawPerson(g,0,0,u.look,o);g.restore()}
  else drawPerson(g,u.x,u.y,u.look,o);
  g.globalAlpha=1;
  const c=tileAt(B.m,u.x,u.y);
  if(c==='w'&&!u.d.mount){for(let i=-3;i<=3;i+=2){P(g,'#d8b850',Math.round(u.x)+i,Math.round(u.y)-4,1,4);P(g,'#f0d878',Math.round(u.x)+i,Math.round(u.y)-5,1,1)}}
  else if(c==='t'&&!u.d.mount){disc(g,'#2f5a24',Math.round(u.x),Math.round(u.y)-1,4);P(g,'#3f7030',Math.round(u.x)-2,Math.round(u.y)-4,2,1)}
  // health bars for the hurt, and a crown over the leader
  if(u.hp<u.max&&!u.d.boss){const w=u.d.mount?12:8,X=Math.round(u.x-w/2),Y=Math.round(u.y-(u.d.mount?21:16));P(g,'#000',X,Y,w,2);P(g,u.side==='p'?(u.isLeader?'#80ff60':'#60c0ff'):'#ff4030',X,Y,Math.max(1,w*u.hp/u.max|0),2)}
  if(u.isLeader){P(g,'#ffd040',Math.round(u.x)-1,Math.round(u.y)-19+((t*3|0)%2),3,2)}
  if(u.root>0){P(g,'#c8b070',Math.round(u.x)-3,Math.round(u.y)-2,7,1)}
  if(u.stun>0){const a2=t*8;P(g,'#ffe060',Math.round(u.x+Math.cos(a2)*5),Math.round(u.y-(u.d.big?28:16)+Math.sin(a2)*2),1,1);P(g,'#ffe060',Math.round(u.x-Math.cos(a2)*5),Math.round(u.y-(u.d.big?28:16)-Math.sin(a2)*2),1,1)}
  if(u.flee>0){P(g,'#80c0ff',Math.round(u.x),Math.round(u.y)-17,1,3)}
}
function drawBody(g,d){const x=Math.round(d.x),y=Math.round(d.y),a=Math.max(0,1-Math.max(0,d.t-20)/10);if(a<=0)return;g.globalAlpha=a*.85;
  const s=d.big?2:1;P(g,'#5a1010',x-4*s,y-1,9*s,2);
  if(d.kind==='horse'){P(g,'#5a3a1a',x-7,y-5,14,4);P(g,'#3a2410',x+5,y-6,3,3)}
  else if(d.kind==='dog'){P(g,'#6a4a2a',x-4,y-3,8,3)}
  else if(d.look){P(g,d.look.mail?'#8a9098':d.look.tunic,x-3*s,y-4*s,6*s,3*s);P(g,d.look.skin,x+(d.face>0?3:-6)*s,y-4*s,3*s,3*s)}
  g.globalAlpha=1}
function drawProj(g,p,t){const k=p.t/p.T,x=lerp(p.sx,p.tx,k),y=lerp(p.sy,p.ty,k)-Math.sin(k*Math.PI)*PROJ[p.kind].arc;const c=PROJ[p.kind].c;
  if(p.kind==='arrow'||p.kind==='bolt'){const dx=p.tx-p.sx,dy=p.ty-p.sy,d=Math.hypot(dx,dy)||1;line(g,c,x,y,x-dx/d*5,y-dy/d*5);P(g,'#fff',Math.round(x),Math.round(y))}
  else if(p.kind==='fire'||p.kind==='torch'){P(g,'#5a3a1a',Math.round(x)-1,Math.round(y)-1,2,2);P(g,(t*20|0)%2?'#ffd040':'#ff6020',Math.round(x),Math.round(y)-2,2,2)}
  else P(g,c,Math.round(x)-1,Math.round(y)-1,2,2)}
function drawFx(g,f,t){const k=f.t/f.T;
  if(f.kind==='num'){digits(g,f.v,f.x,f.y-k*10,f.c)}
  else if(f.kind==='text'){g.font='bold 7px monospace';g.textAlign='center';g.fillStyle='#000';g.fillText(f.s,Math.round(f.x)+1,Math.round(f.y-k*8)+1);g.fillStyle=f.c;g.fillText(f.s,Math.round(f.x),Math.round(f.y-k*8))}
  else if(f.kind==='bit'){P(g,f.c,Math.round(f.x+f.vx*f.t),Math.round(f.y+f.vy*f.t+120*f.t*f.t),1,1)}
  else if(f.kind==='ring'){g.globalAlpha=1-k;g.strokeStyle=f.c;g.beginPath();g.arc(f.x,f.y,f.r*(.4+k*.6),0,7);g.stroke();g.globalAlpha=1}
  else if(f.kind==='slash'){g.globalAlpha=1-k;g.strokeStyle=f.big?'#ffe060':'#ffffff';g.lineWidth=f.big?2:1;const a=Math.atan2(f.ay,f.ax);g.beginPath();g.arc(f.x,f.y,f.big?16:13,a-1.1+k*.6,a+1.1);g.stroke();g.lineWidth=1;g.globalAlpha=1}
  else if(f.kind==='swarm'){for(let i=0;i<14;i++){const a=t*(3+i%3)+i*2.1,r=6+(i*7)%22;P(g,i%2?'#ffe040':'#2a2008',Math.round(f.x+Math.cos(a)*r),Math.round(f.y-4+Math.sin(a*1.3)*r*.6),1,1)}}}
let nightCv=null;
function drawNight(g,cx,cy,t){if(!nightCv){nightCv=document.createElement('canvas');nightCv.width=W;nightCv.height=H}const n=nightCv.getContext('2d');
  n.globalCompositeOperation='source-over';n.fillStyle='rgba(8,10,34,.78)';n.fillRect(0,0,W,H);n.globalCompositeOperation='destination-out';
  const hole=(x,y,r,a=1)=>{const gr=n.createRadialGradient(x-cx,y-cy,0,x-cx,y-cy,r);gr.addColorStop(0,'rgba(0,0,0,'+a+')');gr.addColorStop(1,'rgba(0,0,0,0)');n.fillStyle=gr;n.fillRect(x-cx-r,y-cy-r,r*2,r*2)};
  if(B.leader)hole(B.leader.x,B.leader.y,80);for(const u of B.units)if(u.alive&&u.side==='p'&&!u.isLeader)hole(u.x,u.y,22,.7);
  for(const u of B.units)if(u.alive&&u.kind==='torchman')hole(u.x,u.y,34,.9);
  if(B.obj)hole((B.obj.x+B.obj.w/2)*TS,(B.obj.y+B.obj.h/2)*TS,46,.8);
  const x0=Math.max(0,cx>>4),y0=Math.max(0,cy>>4);for(let y=y0;y<Math.min(MH,y0+13);y++)for(let x=x0;x<Math.min(MW,x0+22);x++)if(B.fire[y*MW+x]>0)hole(x*TS+8,y*TS+8,30+Math.sin(t*9+x)*3,.95);
  g.drawImage(nightCv,0,0)}
function drawEdgeMarks(g,cx,cy,t){if(B.state!=='fight')return;
  const mark=(x,y,c)=>{const sx=x-cx,sy=y-cy;if(sx>0&&sx<W&&sy>0&&sy<H)return;const ex=clamp(sx,4,W-4),ey=clamp(sy,14,H-4);g.globalAlpha=.6+.4*Math.sin(t*8);P(g,c,Math.round(ex)-2,Math.round(ey)-2,4,4);P(g,'#000',Math.round(ex)-1,Math.round(ey)-1,2,2);g.globalAlpha=1};
  for(const u of B.units)if(u.alive&&u.side==='e'&&u.state!=='idle')mark(u.x,u.y,u.d.boss?'#ff40ff':'#ff4030');
  if(B.boss&&B.boss.alive)mark(B.boss.x,B.boss.y,'#ff40ff');
  if(B.obj)mark((B.obj.x+B.obj.w/2)*TS,(B.obj.y+B.obj.h/2)*TS,'#ffd040');
  if(B.cart)mark(B.cart.x,B.cart.y,'#ffd040');if(B.hold)mark((B.hold.x+1.5)*TS,(B.hold.y+1.5)*TS,'#ffd040')}
