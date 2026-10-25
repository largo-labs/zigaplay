/* ---------- deployment: place your leader, squads and traps before the horn ---------- */
let DEP=null;
const ITEM_NAME=it=>(it.k==='leader'?'Wat (you)':it.k==='squad'?WEAPONS[it.w].name+' ×'+it.n:TRAPS[it.t].name)+(it.tile?'':' (not placed)');
function startDeploy(idx){
  newBattle(idx);const spec=B.spec,m=B.m;
  const zone=new Set();for(const[x0,y0,x1,y1]of spec.deploy)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(x>=0&&y>=0&&x<MW&&y<MH&&!m.solid[y*MW+x])zone.add(y*MW+x);
  // where foes will be: their spawn points, posts, and the roads they will walk
  const threat=[],nogo=new Set();
  const mark=(x,y,r)=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const X=x+i,Y=y+j;if(X>=0&&Y>=0&&X<MW&&Y<MH)nogo.add(Y*MW+X)}};
  for(const g of spec.guards||[]){threat.push(g[1]*MW+g[0]);mark(g[0],g[1],2)}
  if(spec.boss){threat.push(spec.boss.y*MW+spec.boss.x);mark(spec.boss.x,spec.boss.y,2)}
  const zl=[...zone];const zc=zl.reduce((a,i)=>[a[0]+i%MW,a[1]+((i/MW)|0)],[0,0]).map(v=>v/Math.max(1,zl.length));
  const goalIdx=spec.exit?spec.exit[1]*MW+spec.exit[0]:B.obj?(B.obj.y+1)*MW+B.obj.x+1:Math.round(zc[1])*MW+Math.round(zc[0]);
  const gf=flowField(m,[goalIdx]);
  const usedSp=new Set((spec.waves||[]).map(w=>w.at));if(spec.militiaWaves||!usedSp.size)for(const k in spec.spawns||{})usedSp.add(k);
  for(const k of Object.keys(spec.spawns||{})){if(!usedSp.has(k))continue;const[x,y]=spec.spawns[k];mark(x,y,3);let px=x*TS+8,py=y*TS+8;threat.push(y*MW+x);
    for(let i=0;i<120;i++){const n=flowNext(m,gf,px,py);if(!n)break;px=n.x;py=n.y;threat.push(n.i)}}
  const tf=flowField(m,threat),zf=flowField(m,zl);
  // trap spots: the ground each enemy group crosses on its way to you (or to the exit), earliest arrivals first
  const tsrc=[];for(const k of usedSp){const w=(spec.waves||[]).filter(w=>w.at===k);tsrc.push({p:spec.spawns[k],t:w.length?Math.min(...w.map(w=>w.t)):5})}
  for(const g of spec.guards||[])tsrc.push({p:[g[0],g[1]],t:.5});if(spec.boss)tsrc.push({p:[spec.boss.x,spec.boss.y],t:.5});
  const ef=spec.goal==='exit'?gf:zf;const trapPath=[];const seen=new Set();
  for(const s0 of tsrc){let px=s0.p[0]*TS+8,py=s0.p[1]*TS+8;for(let i=0;i<120;i++){const n=flowNext(m,ef,px,py);if(!n)break;px=n.x;py=n.y;if(zone.has(n.i)){if(spec.goal!=='exit')break;continue}
    if(!seen.has(n.i)){seen.add(n.i);trapPath.push({i:n.i,t:s0.t})}}}
  const items=[{k:'leader',tile:null}];let id=1;
  for(const w of WORDER){let n=G.folk[w]||0;while(n>0){const k=Math.min(4,n);items.push({k:'squad',w,n:k,id:id++,tile:null});n-=k}}
  for(const t of TORDER)for(let i=0;i<(G.traps[t]||0);i++)items.push({k:'trap',t,tile:null});
  DEP={items,sel:0,cur:[0,0],zone,nogo,tf,zf,threat:new Set(threat),trapPath};
  autoPlace();const L=items[0];DEP.cur=L.tile.slice();B.cam.x=L.tile[0]*TS-W/2;B.cam.y=L.tile[1]*TS-H/2;clampCam();
}
function occupied(tile,kind,except){return DEP.items.some(it=>it!==except&&it.tile&&it.tile[0]===tile[0]&&it.tile[1]===tile[1]&&((kind==='trap')===(it.k==='trap')))}
function validSpot(it,tile){const[x,y]=tile;if(x<0||y<0||x>=MW||y>=MH)return false;const i=y*MW+x;if(B.m.solid[i])return false;
  if(it.k==='trap'){if(DEP.nogo.has(i))return false;return !occupied(tile,'trap',it)}
  return DEP.zone.has(i)&&!occupied(tile,'unit',it)}
function autoPlace(){
  const{items,zone,tf,zf}=DEP;const m=B.m,spec=B.spec;const zl=[...zone];const taken=[];
  const far=(i,sp)=>taken.every(j=>Math.max(Math.abs(j%MW-i%MW),Math.abs(((j/MW)|0)-((i/MW)|0)))>=sp);
  const hide=i=>TILE_HIDE[m.t[(i/MW)|0][i%MW]]?1:0;
  const pick=(score,sp=2)=>{let best=-1,bs=1e9;for(const i of zl){if(!far(i,sp))continue;const s=score(i);if(s<bs){bs=s;best=i}}if(best<0)for(const i of zl){if(taken.includes(i))continue;const s=score(i);if(s<bs){bs=s;best=i}}if(best>=0)taken.push(best);return best};
  const T=i=>tf[i]>1e8?999:tf[i];
  const melee=items.filter(it=>it.k==='squad'&&!WEAPONS[it.w].ranged),ranged=items.filter(it=>it.k==='squad'&&WEAPONS[it.w].ranged);
  for(const it of melee){const i=pick(i=>Math.abs(T(i)-30)-hide(i)*14);if(i>=0)it.tile=[i%MW,(i/MW)|0]}
  for(const it of ranged){const i=pick(i=>Math.abs(T(i)-75)-hide(i)*10);if(i>=0)it.tile=[i%MW,(i/MW)|0]}
  {const i=pick(i=>Math.abs(T(i)-55),1);items[0].tile=i>=0?[i%MW,(i/MW)|0]:[zl[0]%MW,(zl[0]/MW)|0]}
  // traps go along the way foes will walk, a little in front of your lines
  const tb=t=>t<8?0:t<20?1:2;const path=DEP.trapPath.filter(o=>!m.solid[o.i]&&!DEP.nogo.has(o.i)&&zf[o.i]>=10&&zf[o.i]<=90).sort((a,b)=>tb(a.t)-tb(b.t)||zf[a.i]-zf[b.i]).map(o=>o.i);
  const used=new Set();
  const defend=spec.win==='survive'||spec.win==='escort'||spec.goal==='exit';
  for(const it of items){if(it.k!=='trap')continue;if(it.t==='barricade'&&!defend)continue;let spot=-1;
    for(const i of path){if(used.has(i))continue;let ok=true;for(const j of used)if(Math.max(Math.abs(j%MW-i%MW),Math.abs(((j/MW)|0)-((i/MW)|0)))<(it.t==='caltrops'||it.t==='hay'?2:1)){ok=false;break}if(ok){spot=i;break}}
    if(spot<0)for(const i of zl){if(!used.has(i)&&!DEP.nogo.has(i)){spot=i;break}}
    if(spot>=0){used.add(spot);it.tile=[spot%MW,(spot/MW)|0]}}
  for(const it of items)if(!it.tile&&!(it.t==='barricade'&&!defend)){for(const i of zl)if(validSpot(it,[i%MW,(i/MW)|0])){it.tile=[i%MW,(i/MW)|0];break}}
}
function deployBtn(b){
  const it=DEP.items[DEP.sel];
  if(b==='up'||b==='down'||b==='left'||b==='right'){const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[b];DEP.cur[0]=clamp(DEP.cur[0]+d[0],0,MW-1);DEP.cur[1]=clamp(DEP.cur[1]+d[1],0,MH-1);AU.sfx('tick');return}
  if(b==='a'){const here=DEP.items.findIndex(x=>x!==it&&x.tile&&x.tile[0]===DEP.cur[0]&&x.tile[1]===DEP.cur[1]&&(x.k==='trap')===(it.k==='trap'));
    if(here>=0){DEP.sel=here;AU.sfx('pick');return}
    if(validSpot(it,DEP.cur)){it.tile=DEP.cur.slice();AU.sfx('pick')}else{AU.sfx('no');DEP.warn={t:1.4,s:it.k==='trap'?'Too close to the enemy to set a trap there.':'Your folk must start inside the green area.'}}return}
  if(b==='select'||b==='b'){const n=DEP.items.length;DEP.sel=(DEP.sel+(b==='b'?n-1:1))%n;const s=DEP.items[DEP.sel];if(s.tile)DEP.cur=s.tile.slice();AU.sfx('tick');return}
  if(b==='start'){beginFight(DEP.items);DEP=null;UIX.battleHud();return}
}
function updateDeploy(dt){if(!DEP)return;if(DEP.warn){DEP.warn.t-=dt;if(DEP.warn.t<=0)DEP.warn=null}
  const tx=DEP.cur[0]*TS+8-W/2,ty=DEP.cur[1]*TS+8-H/2+12;B.cam.x=lerp(B.cam.x,tx,Math.min(1,dt*8));B.cam.y=lerp(B.cam.y,ty,Math.min(1,dt*8));clampCam()}
function drawDeploy(t){
  const g=ctx,m=B.m,cx=Math.round(B.cam.x),cy=Math.round(B.cam.y);
  g.fillStyle='#000';g.fillRect(0,0,W,H);g.drawImage(m.cache,cx,cy,W,H,0,0,W,H);g.save();g.translate(-cx,-cy);
  // deployment area and no-trap ground
  g.globalAlpha=.22+.06*Math.sin(t*3);for(const i of DEP.zone)P(g,'#60ff60',(i%MW)*TS,((i/MW)|0)*TS,TS,TS);g.globalAlpha=1;
  const it=DEP.items[DEP.sel];
  if(it.k==='trap'){g.globalAlpha=.18;for(const i of DEP.nogo)P(g,'#ff3020',(i%MW)*TS,((i/MW)|0)*TS,TS,TS);g.globalAlpha=1}
  if(B.hold){const h=B.hold;g.globalAlpha=.35;P(g,'#ffd040',h.x*TS,h.y*TS,h.w*TS,h.h*TS);g.globalAlpha=1}
  if(B.spec.goal==='exit'){const[ex,ey]=B.spec.exit;g.globalAlpha=.4;P(g,'#ff4030',ex*TS-8,ey*TS-4,24,24);g.globalAlpha=1}
  if(B.obj)drawObjective(g,B.obj,t);
  if(B.cart)drawCart(g,B.cart,t);
  // scouted foes
  const show=[];for(const gd of B.spec.guards||[])show.push([gd[0],gd[1],gd[2]]);if(B.spec.boss)show.push([B.spec.boss.x,B.spec.boss.y,B.spec.boss.t]);
  for(const[x,y,k]of show){const d=FOES[k],o={face:-1,walk:0,t};const px=x*TS+8,py=y*TS+10;
    if(d.dog)drawDog(g,px,py,o);else if(d.big){g.save();g.translate(px,py);g.scale(2,2);drawPerson(g,0,0,d.look,o);g.restore()}else drawPerson(g,px,py,Object.assign({skin:'#d8a878',hair:'#3a2414'},d.look),o)}
  for(const k of Object.keys(B.spec.spawns||{})){const[x,y]=B.spec.spawns[k];const px=x*TS+8,py=y*TS+8,b=(t*4|0)%2;
    g.fillStyle='#ff3020';g.globalAlpha=.85;g.beginPath();g.arc(px,py,6+b,0,7);g.fill();g.globalAlpha=1;digits(g,'!',px+1,py-2,'#fff')}
  // your things
  const sorted=DEP.items.filter(x=>x.tile).slice().sort((a,b)=>a.tile[1]-b.tile[1]);
  for(const x of sorted){const px=x.tile[0]*TS+8,py=x.tile[1]*TS+8;const isSel=x===it;
    if(isSel){g.globalAlpha=.5+.5*Math.sin(t*10);g.strokeStyle='#ffe060';g.strokeRect(x.tile[0]*TS+.5,x.tile[1]*TS+.5,TS-1,TS-1);g.globalAlpha=1}
    if(x.k==='trap'){drawTrap(g,{kind:x.t,x:px,y:py+2,tx:x.tile[0],ty:x.tile[1],hp:1,max:1},t,true)}
    else if(x.k==='leader'){drawPerson(g,px,py+4,Object.assign({},LEADER_LOOK,{wpn:G.flags.blade?'blade':'cudgel'}),{face:B.spec.face==='left'?-1:1,walk:0,t});P(g,'#ffd040',px-1,py-11,3,2)}
    else{const offs=[[-4,-2],[4,-2],[-4,5],[4,5]];for(let i=0;i<x.n;i++){drawPerson(g,px+offs[i][0],py+offs[i][1]+3,{skin:SKINS[(x.id+i)%4],hair:HAIRS[(x.id*3+i)%7],tunic:PEASANT_TUNICS[(x.id+i*3)%8],trim:'#3a2a14',hat:'',wpn:x.w},{face:B.spec.face==='left'?-1:1,walk:0,t})}}}
  // cursor
  const[qx,qy]=DEP.cur;const ok=validSpot(it,DEP.cur)||(it.tile&&it.tile[0]===qx&&it.tile[1]===qy);const b2=(t*6|0)%2;
  g.strokeStyle=ok?'#ffffff':'#ff4030';g.lineWidth=1;const X=qx*TS,Y=qy*TS;
  for(const[ax,ay,sx,sy]of[[X,Y,1,1],[X+TS,Y,-1,1],[X,Y+TS,1,-1],[X+TS,Y+TS,-1,-1]]){P(g,ok?'#fff':'#ff4030',ax+(sx<0?-1:0)-b2*sx,ay+(sy<0?-1:0)-b2*sy,4*sx||1,1);P(g,ok?'#fff':'#ff4030',ax+(sx<0?-1:0)-b2*sx,ay+(sy<0?-1:0)-b2*sy,1,4*sy||1)}
  g.restore();
  if(B.night){g.fillStyle='rgba(8,10,34,.35)';g.fillRect(0,0,W,H)}
}
