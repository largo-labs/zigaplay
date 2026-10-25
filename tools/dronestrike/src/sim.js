/* ===================== SIMULATION: the campaign, missions and strikes ===================== */
let S=null;
const rnd=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),pick=a=>a[rnd()*a.length|0];
function newState(unit){return{v:1,unit,funds:90,prestige:0,research:{},stock:{fpv:14,recon:2},camp:0,battle:0,front:0,results:[],
  usage:{},usageAll:{},stats:{sorties:0,strikes:0,kills:0,lost:0,spent:0,battles:0,wins:0},mission:null,checkpoint:null,seen:{},time:0}}
const has=id=>!!(S&&S.research[id]);
const unlocked=d=>d==='fpv'||d==='recon'||RESEARCH.some(r=>r.unlock===d&&has(r.id));
function rankIdx(p=S.prestige){let r=0;RANKS.forEach(([,need],i)=>{if(p>=need)r=i});return r}
const rankName=()=>RANKS[rankIdx()][0];
function slots(){return 10+(has('crew1')?2:0)+(has('crew2')?3:0)+(has('crew3')?3:0)+(has('crew4')?4:0)}
function costOf(d){return Math.max(1,Math.round(DRONES[d].cost*(has('workshop')?.8:1)))}
function jamRes(d){const b=DRONES[d].jr;return b>=1?1:Math.min(.95,b+(has('hop')?.25:0)+(has('auto')?.25:0))}
function dmgMult(){return 1+(has('pay1')?.15:0)+(has('pay2')?.15:0)+(has('pay3')?.2:0)}
function baseAcc(){return .8+(has('thermal')?.1:0)}
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
  const ad=adaptation();const hpk=1+c*.07+b*.02;const units=[];
  const add=(type,prim,dep)=>{const U=UNITS[type];units.push({type,name:U.name,cat:U.cat,depth:dep!=null?dep:U.depth,max:Math.round(U.hp*hpk),hp:0,val:U.val,prim,shots:U.shots||0,acc:U.acc||0,jam:U.jam||0,spawn:U.spawn||0,hidden:false,dead:false})};
  const extra=Math.floor((c+b)/5);
  R.prim.forEach(([t,n,dep],i)=>{const e=i===0?Math.floor(extra/2):i===1&&n>1?Math.ceil(extra/2):0;for(let k=0;k<n+e;k++)add(t,1,dep)});
  R.esc.forEach(([t,n])=>{for(let k=0;k<n;k++)add(t,0)});
  const sea=['naval','coastal','finalsea'].includes(key);
  for(let i=0;i<g.aa-1+(c>=2&&b>=2?1:0);i++)add(c>=2&&i%2===0?'sam':'aagun',0);
  for(let i=0;i<Math.min(g.ew,b>=3?2:1);i++)add('ew',0);
  if(g.dr&&b>=1)add('hive',0);
  for(let i=0;i<Math.min(1,ad.ew);i++)add('ew',0);for(let i=0;i<ad.aagun;i++)add('aagun',0);for(let i=0;i<ad.sam;i++)add('sam',0);
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

/* ---------- one wave: groups fly in the order the player set ----------
   Each air defense site has a limited amount of fire per wave, so whatever flies first draws it. Enemy drones
   attack the first groups they meet. Recon reveals hidden targets for its own group and every group after it,
   and radar hunters dive on air defense before the rest of their group passes over it. */
const DEFAULT_ORDER=['decoy','intercept','hunter','recon','loiter','longr','ucav','naval','hexa','fpv','fiber'];
function resolveWave(B,groups,focus){
  const m=B.m,out=[];const L=u=>!u.dead;const accB=baseAcc(),mult=dmgMult();let nid=0;
  const jam=Math.min(.55,m.units.filter(L).reduce((s,u)=>s+u.jam,0)+m.genEw*.05);
  let E=Math.round(m.units.filter(L).reduce((s,u)=>s+u.spawn,0)+m.genDr*1.5+(m.genDr?rnd()*1.5:0));
  // ammunition: each gun or missile site can engage about two groups' worth this wave
  for(const u of m.units)u.ammo=u.shots*2;
  for(const [t,n] of groups){if(!n)continue;const D=DRONES[t];const ds=[];for(let i=0;i<n;i++)ds.push({t,D,id:nid++,fate:null,target:null});
    const ev=[];const live=()=>ds.filter(d=>!d.fate);
    // jamming cuts some radio links before they arrive
    if(jam>0&&!D.decoy)for(const d of ds)if(rnd()<jam*(1-jamRes(t))){d.fate='jam';ev.push({k:'jam',d})}
    // interceptors clear enemy drones; the rest of the enemy drones attack this group
    if(D.interceptor)for(const d of live()){for(let k=0;k<2&&E>0;k++)if(rnd()<.8){E--;ev.push({k:'intercept',d})}}
    else{let tries=Math.min(E,live().length);while(tries-->0&&E>0){const v=pick(live());if(!v)break;E--;if(rnd()<(D.decoy?.8:.45*(1-D.eva*.5))){v.fate=D.decoy?'decoy':'drone';ev.push({k:'dronekill',d:v})}}}
    // recon finds what is hidden
    if(D.recon&&live().length){const found=m.units.filter(u=>u.hidden&&!u.dead);found.forEach(u=>{u.hidden=false});if(found.length)ev.push({k:'reveal',units:found})}
    B.recon=Math.max(B.recon||0,Math.min(.3,live().filter(d=>d.D.recon).length*.1));
    const strike=(d,u)=>{const a=(d.D.atk[u.cat]||0)*mult*(.85+rnd()*.3);const hit=rnd()<accB+B.recon;const dmg=Math.max(1,Math.round(a*(hit?1:.3)));
      u.hp-=dmg;d.target=u;S.stats.strikes++;const kill=u.hp<=0&&!u.dead;if(kill){u.dead=true;u.hp=0;S.stats.kills++}ev.push({k:'strike',d,u,dmg,kill,hit});if(d.D.exp)d.fate='spent'};
    const pickTarget=(d,list)=>{let best=null,bs=0;for(const u of list){if(u.dead||u.hidden||u.depth>d.D.range)continue;const a=d.D.atk[u.cat]||0;if(!a)continue;
        const left=u.hp-(u.pend||0);const s=a*(u.prim?1.4:1)*(u===focus?4:1)*(left>0?1:.08);if(s>bs){bs=s;best=u}}return best};
    m.units.forEach(u=>u.pend=0);
    // radar hunters strike air defense before it can fire on their group
    if(D.hunter)for(const d of live()){const u=pickTarget(d,m.units.filter(u=>u.cat==='aa'||u.cat==='ew'));if(u){u.pend+=d.D.atk[u.cat]*mult;strike(d,u)}}
    // air defense fires at the group as it passes
    for(const u of m.units.filter(u=>L(u)&&u.shots&&u.ammo>0)){if(D.decoy&&m.decoyEff<1&&rnd()>m.decoyEff)continue;
      u.hidden=false;const acc=u.acc*(1+B.alert*.15);const n2=Math.min(u.ammo,u.shots);for(let k=0;k<n2;k++){const pool=live();if(!pool.length)break;u.ammo--;const v=pick(pool);
        if(D.decoy){if(rnd()<.85){v.fate='decoy';ev.push({k:'aa',d:v,u})}else ev.push({k:'miss',d:v,u})}
        else if(rnd()<acc*(1-v.D.eva)){v.fate='aa';ev.push({k:'aa',d:v,u})}else ev.push({k:'miss',d:v,u})}}
    // the strike
    if(!D.recon&&!D.decoy&&!D.interceptor){m.units.forEach(u=>u.pend=0);for(const d of live()){if(d.D.hunter)continue;const u=pickTarget(d,m.units);if(!u){d.idle=true;continue}u.pend+=(d.D.atk[u.cat]||0)*mult*.9;strike(d,u)}
      if(D.hunter)for(const d of live()){const u=pickTarget(d,m.units);if(u)strike(d,u);else d.idle=true}}
    for(const d of ds)if(d.D.decoy&&!d.fate)d.fate='spent';
    for(const d of ds){S.usage[t]=(S.usage[t]||0)+1;S.usageAll[t]=(S.usageAll[t]||0)+1;B.avail[t]-=1;
      if(!d.fate)B.avail[t]+=1;else if(d.fate==='spent'){B.spent[t]=(B.spent[t]||0)+1;S.stats.spent++}else{B.lost[t]=(B.lost[t]||0)+1;S.stats.lost++}}
    out.push({t,ds,ev})}
  S.stats.sorties++;B.alert++;B.wave++;B.enemyDr=E;
  return out}
function score(m){const p=m.units.filter(u=>u.prim);if(!p.length)return 0;const dead=p.filter(u=>u.dead).length;const dmg=p.filter(u=>!u.dead).reduce((s,u)=>s+(1-u.hp/u.max),0);return Math.min(1,(dead+dmg*.25)/p.length)}
function tierOf(sc){return sc>=.999?0:sc>=.5?1:sc>=.2?2:3}
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
