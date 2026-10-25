/* ===================== SIMULATION: the campaign, missions and strikes ===================== */
let S=null;
const rnd=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),pick=a=>a[rnd()*a.length|0];
function newState(unit){return{v:1,unit,funds:90,prestige:0,research:{},stock:{fpv:14,recon:2},camp:0,battle:0,front:0,results:[],
  usage:{},usageAll:{},stats:{sorties:0,strikes:0,kills:0,lost:0,spent:0,battles:0,wins:0},mission:null,checkpoint:null,seen:{},time:0}}
const has=id=>!!(S&&S.research[id]);
const unlocked=d=>d==='fpv'||d==='recon'||RESEARCH.some(r=>r.unlock===d&&has(r.id));
function rankIdx(p=S.prestige){let r=0;RANKS.forEach(([,need],i)=>{if(p>=need)r=i});return r}
const rankName=()=>RANKS[rankIdx()][0];
function slots(){return 10+(has('crew1')?2:0)+(has('crew2')?2:0)+(has('crew3')?3:0)}
function costOf(d){return Math.max(1,Math.round(DRONES[d].cost*(has('workshop')?.8:1)))}
function jamRes(d){const b=DRONES[d].jr;return b>=1?1:Math.min(.95,b+(has('hop')?.25:0)+(has('auto')?.25:0))}
function dmgMult(){return 1+(has('pay1')?.15:0)+(has('pay2')?.15:0)+(has('pay3')?.2:0)}
function baseAcc(){return .72+(has('thermal')?.1:0)}
const general=()=>GENERALS[S.camp];

/* ---------- missions ---------- */
function shares(u){const tot=Object.values(u).reduce((a,b)=>a+b,0)||1;const s={};for(const k in u)s[k]=u[k]/tot;return{s,tot}}
function adaptation(){const g=general();const src=g.adaptive?S.usageAll:S.usage;const {s,tot}=shares(src);const out={ew:0,aagun:0,sam:0,decoy:1,hide:0,notes:[]};
  if(tot<12||(S.battle===0&&!g.adaptive))return out;const k=g.adaptive?.75:1,m=g.adaptive?2:1;
  if((s.fpv||0)+(s.hexa||0)>.45*k){out.ew+=m;out.notes.push('They have brought in jammers to stop your FPVs.')}
  if((s.hexa||0)>.2*k){out.aagun+=m;out.notes.push('More anti-aircraft guns: your slow bombers have been noticed.')}
  if((s.longr||0)+(s.hunter||0)+(s.loiter||0)+(s.ucav||0)>.4*k){out.sam+=1;out.notes.push('A new SAM site is covering their rear.')}
  if((s.decoy||0)>.22*k){out.decoy=.5;out.notes.push('Their gunners have learned to tell decoys from real drones.')}
  if((s.recon||0)>.15*k){out.hide=.15;out.notes.push('They are camouflaging more of their units.')}
  return out}
function genMission(){const g=general(),key=g.missions[S.battle],R=MISSIONS[key];const c=S.camp,b=S.battle;
  const ad=adaptation();const hpk=1+c*.12+b*.03;const units=[];
  const add=(type,prim,dep)=>{const U=UNITS[type];units.push({type,name:U.name,cat:U.cat,depth:dep!=null?dep:U.depth,max:Math.round(U.hp*hpk),hp:0,val:U.val,prim,shots:U.shots||0,acc:U.acc||0,jam:U.jam||0,spawn:U.spawn||0,hidden:false,dead:false})};
  const extra=Math.floor((c+b)/4);
  R.prim.forEach(([t,n,dep],i)=>{const e=i===0?Math.floor(extra/2):i===1&&n>1?Math.ceil(extra/2):0;for(let k=0;k<n+e;k++)add(t,1,dep)});
  R.esc.forEach(([t,n])=>{for(let k=0;k<n;k++)add(t,0)});
  const sea=['naval','coastal','finalsea'].includes(key);
  for(let i=0;i<g.aa-1+(c>=2&&b>=2?1:0);i++)add(c>=2&&i%2===0?'sam':'aagun',0);
  for(let i=0;i<g.ew;i++)if(i===0||b>=2)add('ew',0);
  if(g.dr&&b>=1)add('hive',0);
  for(let i=0;i<ad.ew;i++)add('ew',0);for(let i=0;i<ad.aagun;i++)add('aagun',0);for(let i=0;i<ad.sam;i++)add('sam',0);
  if(!sea&&b>=1&&rnd()<.6)add(pick(['squad','truck','apc']),0);
  units.forEach(u=>{u.hp=u.max;u.hidden=!has('intel')&&rnd()<(g.hide+ad.hide)*(u.prim?.5:1)});
  // positions: depth rows from the front line (low) to the deep rear (high); the sea runs down the right edge
  const rows=[[],[],[]];units.forEach(u=>rows[u.depth].push(u));
  rows.forEach((r,d)=>r.forEach((u,i)=>{const n=r.length;const x0=sea&&u.cat==='naval'?.62:.1,x1=sea?(u.cat==='naval'?.92:.58):.9;
    u.x=x0+(x1-x0)*((i+.5)/n)+(rnd()-.5)*.05;u.y=[.6,.4,.18][d]+(rnd()-.5)*.08}));
  return{key,name:R.name,brief:R.brief,final:!!R.final,sea,units,reward:R.reward+c*8,notes:ad.notes,seed:(rnd()*1e9)|0,decoyEff:ad.decoy,genDr:g.dr,genEw:g.ew}}
function threat(m){const live=m.units.filter(u=>!u.dead&&!u.hidden);
  const aa=live.reduce((s,u)=>s+u.shots*u.acc,0),ew=live.reduce((s,u)=>s+u.jam,0)+m.genEw*.05,dr=live.reduce((s,u)=>s+u.spawn,0)+m.genDr*1.5;
  return{aa,ew,dr,aaL:aa<=0?0:aa<1?1:aa<2.2?2:3,ewL:ew<=.06?0:ew<.3?1:ew<.6?2:3,drL:dr<=0?0:dr<3?1:dr<5?2:3}}

/* ---------- how good a drone is against this mission (0-3 bars) ---------- */
function fit(d,m){const D=DRONES[d];if(D.recon)return m.units.some(u=>u.hidden)?3:1;if(D.decoy)return threat(m).aaL>=2?3:threat(m).aaL?2:0;
  if(D.interceptor)return threat(m).drL>=2?3:threat(m).drL?2:0;
  let bp=0,be=0;for(const u of m.units){if(u.dead||u.depth>D.range)continue;const a=D.atk[u.cat]||0;if(!a)continue;if(u.prim)bp=Math.max(bp,a/u.max);else be=Math.max(be,a/u.max)}
  const t=threat(m);let v=Math.max(bp>=.9?3:bp>=.45?2:bp>0?1:0,Math.min(be>=.6?2:be>0?1:0,D.hunter?2:1));if(v&&!D.exp&&t.aaL>=3&&D.eva<.3)v--;if(v&&jamRes(d)<.3&&t.ewL>=2)v--;return v}

/* ---------- one wave ---------- */
function resolveWave(B,launch,focus){
  const m=B.m,ev=[];const ds=[];let id=0;
  for(const [t,n] of Object.entries(launch))for(let i=0;i<n;i++)ds.push({t,D:DRONES[t],id:id++,fate:null,target:null});
  const live=()=>ds.filter(d=>!d.fate);const L=u=>!u.dead;
  // 1. jamming
  const jam=Math.min(.7,m.units.filter(L).reduce((s,u)=>s+u.jam,0)+m.genEw*.05);
  if(jam>0)for(const d of ds){if(d.D.decoy)continue;if(rnd()<jam*(1-jamRes(d.t))){d.fate='jam';ev.push({k:'jam',d})}}
  // 2. drone fights
  let E=Math.round(m.units.filter(L).reduce((s,u)=>s+u.spawn,0)+m.genDr*1.5+(m.genDr?rnd()*1.5:0));B.enemyDr=E;
  for(const d of live().filter(d=>d.D.interceptor)){for(let k=0;k<2&&E>0;k++)if(rnd()<.8){E--;ev.push({k:'intercept',d})}}
  for(let i=0;i<E;i++){const pool=live().filter(d=>!d.D.interceptor);const v=pool.length?pick(pool):pick(live()||[]);if(!v)break;if(rnd()<.45*(1-v.D.eva*.5)){v.fate='drone';ev.push({k:'dronekill',d:v})}}
  const accB=baseAcc(),mult=dmgMult();
  const strike=(d,u)=>{const a=(d.D.atk[u.cat]||0)*mult*(.85+rnd()*.3);const hit=rnd()<accB+B.recon;const dmg=Math.max(1,Math.round(a*(hit?1:.3)));
    u.hp-=dmg;d.target=u;S.stats.strikes++;const kill=u.hp<=0&&!u.dead;if(kill){u.dead=true;u.hp=0;S.stats.kills++}ev.push({k:'strike',d,u,dmg,kill,hit});if(d.D.exp)d.fate='spent'};
  const pickTarget=(d,list)=>{let best=null,bs=0;for(const u of list){if(u.dead||u.hidden||u.depth>d.D.range)continue;const a=d.D.atk[u.cat]||0;if(!a)continue;
      const left=u.hp-(u.pend||0);let s=a*(u.prim?1.4:1)*(u===focus?4:1)*(left>0?1:.08)*(d.D.hunter&&(u.cat==='aa'||u.cat==='ew')?5:1);if(s>bs){bs=s;best=u}}return best};
  // 3. recon reveals before anything is aimed
  const rc=live().filter(d=>d.D.recon).length;B.recon=Math.min(.3,rc*.1);
  if(rc&&m.units.some(u=>u.hidden&&!u.dead)){m.units.forEach(u=>{if(u.hidden){u.hidden=false;ev.push({k:'reveal',u})}})}
  // 4. radar hunters strike the air defense before it fires
  m.units.forEach(u=>u.pend=0);
  for(const d of live().filter(d=>d.D.hunter)){const u=pickTarget(d,m.units.filter(u=>u.cat==='aa'||u.cat==='ew'));if(u){u.pend+=d.D.atk[u.cat]*mult;strike(d,u)}}
  // 5. air defense fires
  for(const u of m.units.filter(u=>L(u)&&u.shots&&!u.hidden)){const acc=u.acc*(1+B.alert*.15);for(let s=0;s<u.shots;s++){const pool=live();if(!pool.length)break;
      const w=pool.map(d=>d.D.decoy?4*m.decoyEff:1),tot=w.reduce((a,b)=>a+b,0);let r=rnd()*tot,v=pool[0];for(let i=0;i<pool.length;i++){if((r-=w[i])<0){v=pool[i];break}}
      if(v.D.decoy){if(rnd()<.9){v.fate='decoy';ev.push({k:'decoy',d:v,u})}else ev.push({k:'miss',u,d:v})}
      else if(rnd()<acc*(1-v.D.eva)){v.fate='aa';ev.push({k:'aa',d:v,u})}else ev.push({k:'miss',u,d:v})}}
  // hidden air defense also fires, once found or not
  for(const u of m.units.filter(u=>L(u)&&u.shots&&u.hidden)){for(let s=0;s<u.shots;s++){const pool=live().filter(d=>!d.D.decoy);if(!pool.length)break;const v=pick(pool);if(rnd()<u.acc*(1-v.D.eva)){v.fate='aa';ev.push({k:'aa',d:v,u})}}}
  // 6. the strike
  m.units.forEach(u=>u.pend=0);
  const strikers=live().filter(d=>!d.D.recon&&!d.D.decoy&&!d.D.interceptor&&!(d.D.hunter&&d.fate));
  strikers.sort((a,b)=>(b.D.atk.armor||0)-(a.D.atk.armor||0));
  for(const d of strikers){const u=pickTarget(d,m.units);if(!u){d.idle=true;continue}u.pend+=(d.D.atk[u.cat]||0)*mult*.9;strike(d,u)}
  // decoys that were not shot are spent anyway
  for(const d of ds)if(d.D.decoy&&!d.fate)d.fate='spent';
  // bookkeeping
  for(const d of ds){S.usage[d.t]=(S.usage[d.t]||0)+1;S.usageAll[d.t]=(S.usageAll[d.t]||0)+1;B.avail[d.t]-=1;
    if(!d.fate){B.avail[d.t]+=1}
    else if(d.fate==='spent'){B.spent[d.t]=(B.spent[d.t]||0)+1;S.stats.spent++}
    else{B.lost[d.t]=(B.lost[d.t]||0)+1;S.stats.lost++}}
  S.stats.sorties++;B.alert++;B.wave++;
  return{ds,ev,jam}}
function score(m){const p=m.units.filter(u=>u.prim);const tot=p.reduce((s,u)=>s+u.max,0);const done=p.reduce((s,u)=>s+(u.max-Math.max(0,u.hp)),0);return tot?done/tot:0}
function tierOf(sc){return sc>=.9?0:sc>=.6?1:sc>=.3?2:3}
const TIERS=[{name:'DECISIVE',col:'grn',funds:1.3,pres:10,front:2},{name:'SUCCESS',col:'amb',funds:1,pres:6,front:1},{name:'PARTIAL',col:'amb',funds:.6,pres:3,front:0},{name:'FAILED',col:'red',funds:.45,pres:0,front:-1}];
function finishBattle(B){const m=B.m,sc=score(m),ti=tierOf(sc),T=TIERS[ti];
  // everything still in the sortie goes home
  for(const [t,n] of Object.entries(B.avail))S.stock[t]=(S.stock[t]||0)+n;
  let recovered=0;if(has('recovery'))for(const [t,n] of Object.entries(B.lost)){if(DRONES[t].exp)continue;const r=Math.round(n*.4);if(r){recovered+=r;S.stock[t]=(S.stock[t]||0)+r}}
  const sec=m.units.filter(u=>!u.prim&&u.dead).reduce((s,u)=>s+u.val,0);
  const valDone=m.units.filter(u=>u.dead).reduce((s,u)=>s+u.val,0);
  const cost=[...Object.entries(B.lost),...Object.entries(B.spent)].reduce((s,[t,n])=>s+costOf(t)*n,0);
  const aid=rankIdx()*6,budget=25+S.camp*8;const funds=Math.round(m.reward*T.funds+sec+aid+budget);
  const eff=ti<=1&&cost<=valDone*2.5?2:0;const pres=T.pres+eff+(m.final&&ti<=1?5:0);
  S.funds+=funds;S.prestige+=pres;S.front+=T.front;S.stats.battles++;if(ti<=1)S.stats.wins++;
  S.results.push(ti);
  return{sc,ti,funds,aid,budget,pres,eff,recovered,cost,valDone,sec}}
function campaignOver(){return S.battle>=GENERALS[S.camp].missions.length}
const CAMP_NEED=3;

/* ---------- names ---------- */
function genName(){const r=rnd();const a=pick(NAME_A),b=pick(NAME_B);
  return r<.45?`${a} ${b}`:r<.75?`The ${a} ${b}`:r<.9?`${pick(NAME_C)} ${100+(rnd()*900|0)} "${b}"`:`${b} ${pick(NAME_C)}`}
