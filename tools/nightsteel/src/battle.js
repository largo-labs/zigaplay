/* ================= battle: active time, the way the old ones did it (time waits while you choose) =================
   The party stands on the right facing left, the foes on the left. Each fighter's gauge fills with speed; when a
   party member's is full their commands open. Foes act when theirs fill. */
const BSPD={Slow:.7,Normal:1,Fast:1.45},ANIM={Slow:.85,Normal:1,Fast:1.3};
let BT=null;
const HAND=(()=>{const b=new Buf(10,7);b.rect(0,2,6,3,'#f4f4f8');b.rect(5,1,4,2,'#f4f4f8');b.rect(6,3,3,1,'#d8dcec');b.rect(1,5,4,1,'#c8cce0');b.outline('#1a1c3a');return b.canvas(1)})();
const TGT_TXT={one:'One foe',all:'All foes',rand:'Random foes',ally:'One ally',party:'The whole party',self:'Self',dead:'A fallen ally'};
function artDesc(a){if(a.desc&&a.kind==='buff')return`${TGT_TXT[a.tgt]} · ${a.desc}`;const bits=[TGT_TXT[a.tgt]];
  if(a.kind==='heal')bits.push(a.revive&&a.tgt==='dead'?'Revives':a.pct?'Heals by a share of HP':'Heals');else if(a.kind==='buff')bits.push(STATUS[a.st]?STATUS[a.st].n:'');
  else{if(a.hits>1)bits.push(a.hits+' hits');if(a.elem)bits.push(a.elem);bits.push(a.kind==='mag'?'Magic':'Strike')}
  if(a.st&&a.kind!=='buff'&&STATUS[a.st])bits.push((a.chance>=1?'':'May ')+STATUS[a.st].n.toLowerCase().replace(/^(def|atk) -$/,m=>m));
  if(a.crit)bits.push('Keen');if(a.execute)bits.push('Finishes the weak');if(a.drain)bits.push('Drains HP');if(a.refund)bits.push('Refunds MP');if(a.sure)bits.push('Never misses');if(a.after==='regen')bits.push('then Regen');return bits.join(' · ')}
/* ---------- time inside a battle ---------- */
const bwait=ms=>new Promise(r=>BT.timers.push({t:ms/1000/ANIM[SET.speed],r}));
function tween(o,props,ms,ease=t=>t){return new Promise(r=>{const from={};for(const k in props)from[k]=o[k];BT.tweens.push({o,from,props,t:0,d:Math.max(.001,ms/1000/ANIM[SET.speed]),ease,r})})}
const easeOut=t=>1-(1-t)*(1-t),easeIn=t=>t*t,easeIO=t=>t<.5?2*t*t:1-2*(1-t)*(1-t);
function addFx(life,draw,o={}){const e=Object.assign({t:0,life,draw},o);BT.fx.push(e);return e}
/* ---------- the fighters ---------- */
function unitP(m,i){const s=statsOf(m);return{side:'p',m,name:m.name,hp:clamp(m.hp,0,s.hp),mhp:s.hp,mp:clamp(m.mp,0,s.mp),mmp:s.mp,s,atb:.15+rnd()*.55,st:s.regen?{regen:999}:{},alive:m.hp>0,i,ox:0,oy:0,pose:null,poseT:0,nk:0,guard:false}}
function unitE(id,i,tag){const F=FOE[id],s=foeStats(F);if(F.boss)s.hp=Math.round(s.hp*.85);return{side:'e',F,name:F.n+(tag?' '+tag:''),hp:s.hp,mhp:s.hp,mp:0,mmp:0,s,atb:rnd()*.45,st:{},alive:true,i,ox:0,oy:0,flash:0,nk:0,phased:{},spr:foeSprite(F),dying:-1}}
const HUD_Y=149;
function bLayout(){const P=BT.P,n=P.length,sl={1:[[64,128]],2:[[92,118],[56,138]],3:[[104,124],[66,108],[62,141]],4:[[106,124],[72,108],[66,142],[34,126]]}[n]||[[64,128]];
  P.forEach((u,i)=>{u.hx=W-sl[i][0];u.hy=sl[i][1]});
  const E=BT.E,m=E.length,sp=BT.o.boss?[[.27,140]]:{1:[[.28,132]],2:[[.17,116],[.39,138]],3:[[.15,108],[.39,120],[.23,142]]}[m]||[[.27,132]];
  E.forEach((u,i)=>{const s=sp[Math.min(i,sp.length-1)];u.hx=Math.max(u.spr.fx+4,Math.round(W*s[0]));u.lift=u.F.fly?Math.round(Math.max(28,u.spr.h*.45)):0;u.hy=s[1]-u.lift})}
/* ---------- the camera: it leans in for Specials and Ults ---------- */
function bcamTo(x,y,z,ms=260){const hw=W/(2*z),hh=H/(2*z);return tween(BT.cam,{x:clamp(x,hw,W-hw),y:clamp(y,hh,H-hh),z},ms,easeIO)}
const camHome=(ms=300)=>BT&&BT.cam?tween(BT.cam,{x:W/2,y:H/2,z:1},ms,easeIO):Promise.resolve();
function camOn(units,z){units=units.filter(Boolean);if(!units.length)return Promise.resolve();const xs=units.map(midX),ys=units.map(midY);return bcamTo((Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2,z)}
const toScreen=(x,y)=>{const c=BT.cam||{x:W/2,y:H/2,z:1};return[(x-c.x)*c.z+W/2,(y-c.y)*c.z+H/2]};
/* the middle of a fighter, for effects and numbers */
const midX=u=>u.hx+u.ox,midY=u=>u.side==='p'?u.hy+u.oy-24:u.hy+u.oy-u.spr.fy+u.spr.h*.5,topY=u=>u.side==='p'?u.hy+u.oy-46:u.hy+u.oy-u.spr.fy+6;
const alive=l=>l.filter(u=>u.alive);
/* numbers in play, with statuses */
function stat(u,k){let v=u.s[k];const st=u.st;
  if(k==='atk'||k==='mag'){if(st.atkUp&&k==='atk')v*=1.35;if(st.atkDown)v*=.7;if(st.berserk&&k==='atk')v*=1.5}
  if(k==='def'||k==='mdef'){if(st.defUp)v*=1.5;if(st.defDown)v*=.6;if(st.berserk)v*=.75}return v}
function atbRate(u){let r=(stat(u,'spd')+30)/88;if(u.st.haste)r*=1.5;if(u.st.slow)r*=.5;return r*BSPD[SET.speed]}
/* ---------- damage ---------- */
function calc(src,t,o){const phys=o.kind!=='mag';const A=stat(src,phys?'atk':'mag'),D=stat(t,phys?'def':'mdef');
  const r={dmg:0,crit:false,miss:false,weak:false,resist:false};
  if(phys&&!o.sure){let miss=.04;if(t.st.evade)miss+=.5;if(rnd()<miss){r.miss=true;return r}}
  let d=A*(o.pow||1)*(src.side==='p'?2.4:2.0)*(55/(55+D))*(.92+rnd()*.16);
  const el=o.elem||(phys&&src.side==='p'&&src.m.weapon.elem!=='None'?src.m.weapon.elem:null)||(src.side==='p'?innateEl(src.m):null);
  if(el&&t.side==='e'){if(t.F.weak.includes(el)){d*=1.5;r.weak=true}else if(t.F.res.includes(el)){d*=.5;r.resist=true}}
  if(phys){let cc=(src.s.crit||.05)+(o.crit||0);if(src.st.focus)cc=1;if(rnd()<cc){d*=1.75;r.crit=true}}
  if(t.guard)d*=.5;if(o.execute&&t.side==='e'){if(t.hp/t.mhp<.3&&!t.F.boss)d=t.hp;else d*=1.3}
  r.dmg=clamp(Math.round(d),1,9999);r.elem=el;return r}
/* a number over someone's head */
function num(u,txt,cls=''){const k=u.nk++%4,[x,y]=toScreen(midX(u)+(k%2?6:-6)*(k>1?1:0)+(k===3?-4:0),topY(u)+10+(k>1?-7:0));
  const e=el('div','dmg '+cls,txt);e.style.left=px(x);e.style.top=px(y);BT.layer.appendChild(e);setTimeout(()=>e.remove(),1150);setTimeout(()=>{u.nk=Math.max(0,u.nk-1)},500)}
function hurt(u,amount){u.hp=Math.max(0,u.hp-amount);
  if(u.side==='p'){u.pose='hurt';u.poseT=.32;const g=amount/u.mhp*100*1.15*u.s.limitGain;u.m.limit=Math.min(100,(u.m.limit||0)+g)}else{u.flash=.16;u.shake=.25}
  if(u.hp<=0)knockOut(u)}
function healU(u,n){const v=Math.min(u.mhp-u.hp,Math.round(n));u.hp+=v;num(u,v,'heal');return v}
function knockOut(u){u.alive=false;u.atb=0;u.st={};u.guard=false;
  if(u.side==='p'){SND.fx('ko');BT.ready=BT.ready.filter(x=>x!==u);if(BT.cur===u)closeCommand(true);for(const p of BT.P)if(p.alive)p.m.limit=Math.min(100,p.m.limit+12)}
  else{SND.fx('die');u.dying=0}}
/* a hit from src on t: shows it, applies it, returns the result */
function strike(src,t,o){if(!t.alive)return null;const r=calc(src,t,o);
  if(r.miss){num(t,'Miss','miss');SND.fx('miss');return r}
  hurt(t,r.dmg);num(t,r.dmg,r.crit?'crit':'');if(r.weak)num(t,'Weak!','tag');if(r.elem&&src.side==='p')applyAura(src,t,r);
  if(r.crit)SND.fx('crit');if(src.side==='p')src.m.limit=Math.min(100,src.m.limit+1.5*src.s.limitGain);
  if(src.st.focus&&o.kind!=='mag')delete src.st.focus;
  if(o.drain&&src.alive){const v=Math.round(r.dmg*o.drain);if(v>0)healU(src,v)}
  if(o.st&&t.alive&&rnd()<(o.chance||1))giveStatus(t,o.st,o.turns||3);
  if(t.alive&&t.side==='p'&&t.st.counter&&o.kind!=='mag'&&src.alive&&src.side==='e')BT.queue.unshift({u:t,type:'counter',t:src});
  BT.shake=Math.max(BT.shake,r.crit?.25:.12);return r}
/* an enemy hit by an element carries it for a while; a different element landing on it sets off a reaction */
function applyAura(src,t,r){if(t.side!=='e'||!t.alive||!ELEMS[r.elem]||r.elem==='None')return;const a=t.aura;
  if(!a||a.el===r.elem){t.aura={el:r.elem,t:4};return}
  const R=RX[rxKey(a.el,r.elem)];if(!R){t.aura={el:r.elem,t:4};return}
  t.aura=null;G.rx=(G.rx||0)+1;const x=midX(t),y=midY(t),extra=Math.max(1,Math.round(r.dmg*(R.m-1)));
  hurt(t,extra);num(t,extra,'crit');num(t,R.n+'!','tag');BT.flash=Math.max(BT.flash,.4);BT.shake=Math.max(BT.shake,.35);SND.fx('crit');fxRing(t,R.c);fxSparks(x,y,R.c,18);
  if(R.aoe)for(const e of alive(BT.E)){if(e===t)continue;const d=Math.max(1,Math.round(extra*R.aoe));hurt(e,d);num(e,d,'');fxSparks(midX(e),midY(e),R.c,8)}
  if(t.alive&&R.stun)giveStatus(t,'stun',R.stun);if(t.alive&&R.st)giveStatus(t,R.st,3);if(R.ally)for(const p of alive(BT.P))giveStatus(p,R.ally,3);
  addFx(1.2,(g,k)=>{g.save();g.globalAlpha=k<.7?1:1-(k-.7)/.3;g.textAlign='center';g.font='bold 15px ui-monospace,monospace';g.lineWidth=3;g.strokeStyle='#0a0c2a';g.strokeText(R.n.toUpperCase()+'!',W/2,34-k*6);g.fillStyle=R.c;g.fillText(R.n.toUpperCase()+'!',W/2,34-k*6);
    g.font='8px ui-monospace,monospace';g.lineWidth=2;g.strokeText(`${ELEMS[a.el].n} + ${ELEMS[r.elem].n}`,W/2,44-k*6);g.fillStyle='#ffffff';g.fillText(`${ELEMS[a.el].n} + ${ELEMS[r.elem].n}`,W/2,44-k*6);g.restore()})}
function drawAura(g,u){const a=u.aura;if(!a||!u.alive)return;const x=midX(u),y=topY(u)-2+Math.round(Math.sin(BT.t*4)*1.2),c=ELEMS[a.el].c;g.fillStyle='#0a0c2a';g.beginPath();g.arc(x,y,4.2,0,7);g.fill();g.fillStyle=c;g.beginPath();g.arc(x,y,3,0,7);g.fill();g.fillStyle='rgba(255,255,255,.8)';g.fillRect(x-1.4,y-1.6,1.2,1.2)}
function giveStatus(t,st,turns){if(!t.alive)return;if(t.side==='e'&&t.F.boss&&st==='stun'&&rnd()<.6){num(t,'Resist','miss');return}
  t.st[st]=Math.max(t.st[st]||0,turns);num(t,STATUS[st].n,'st');SND.fx(STATUS[st].bad?'debuff':'buff')}
/* ---------- effects ---------- */
function fxSlash(t,col,heavy){const x=midX(t),y=midY(t),r=(heavy?26:20)*tsz(t),a0=-2.4+rnd()*.3;
  addFx(.26,(g,k)=>{g.save();g.globalAlpha=1-k*.8;g.lineCap='round';for(let j=0;j<(heavy?3:2);j++){g.strokeStyle=j?'#ffffff':col;g.lineWidth=(heavy?5:3.4)-j*1.6-k*2;g.beginPath();
      const sweep=Math.min(1,k*3.2);g.arc(x+6,y-4,r-j*2,a0,a0+sweep*2.4);g.stroke()}g.restore()});fxSparks(x,y,col,heavy?10:6)}
function fxSparks(x,y,col,n=6){for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,s=40+rnd()*60;addFx(.3+rnd()*.15,(g,k,e)=>{g.fillStyle=k<.4?'#ffffff':col;g.fillRect(Math.round(x+Math.cos(a)*s*k*.5),Math.round(y+Math.sin(a)*s*k*.5),2,2)})}}
function fxPunch(t,col){const x=midX(t)+rnd()*8-4,y=midY(t)+rnd()*8-4;addFx(.2,(g,k)=>{g.globalAlpha=1-k;g.fillStyle='#ffffff';g.beginPath();g.arc(x,y,4+k*10,0,7);g.fill();g.strokeStyle=col;g.lineWidth=2;g.beginPath();g.arc(x,y,6+k*14,0,7);g.stroke();g.globalAlpha=1});fxSparks(x,y,col,5)}
const tsz=t=>t.side==='e'?clamp(t.spr.w/44,1,2.2):1;
const ELEM_FX={
 Fire:t=>{const x=midX(t),y=midY(t),z=tsz(t);SND.fx('fire');for(let i=0;i<14+z*6;i++){const ox=(rnd()*28-14)*z,d=rnd()*.25;addFx(.6,(g,k)=>{const kk=clamp((k-d)/(1-d),0,1);if(kk<=0)return;const r=((1-kk)*8+2.5)*Math.sqrt(z);g.fillStyle=kk<.3?'#fff4a0':kk<.6?'#ffa02a':'#e0401a';g.globalAlpha=1-kk*.6;g.beginPath();g.arc(x+ox*(1-kk*.3),y+12*z-kk*34*z-Math.abs(ox)*.3,r,0,7);g.fill();g.globalAlpha=1})}},
 Ice:t=>{const x=midX(t),y=midY(t),z=tsz(t);SND.fx('ice');for(let i=0;i<7+z*3;i++){const a=i/(7+z*3)*Math.PI*2,R=14*z;addFx(.55,(g,k)=>{const r=k<.6?R*(1-k/.6*.7):R*.3+(k-.6)*60;const cx=x+Math.cos(a)*r,cy=y+Math.sin(a)*r;g.globalAlpha=k<.6?1:1-(k-.6)/.4;g.fillStyle='#c8f4ff';g.beginPath();g.moveTo(cx,cy-6);g.lineTo(cx+3,cy);g.lineTo(cx,cy+6);g.lineTo(cx-3,cy);g.fill();g.fillStyle='#ffffff';g.fillRect(cx-1,cy-3,1,4);g.globalAlpha=1})}},
 Bolt:t=>{const x=midX(t),y=midY(t);SND.fx('bolt');const pts=[];let cx=x+rnd()*10-5;for(let yy=-4;yy<y;yy+=8){pts.push([cx,yy]);cx+=rnd()*12-6}pts.push([x,y]);
   addFx(.4,(g,k)=>{if(k<.5&&Math.floor(k*20)%2===0){g.fillStyle='rgba(255,255,220,.25)';g.fillRect(-W,-H,W*3,H*3)}g.strokeStyle=k<.5?'#ffffff':'#ffe04a';g.lineWidth=3-k*2;g.beginPath();pts.forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b));g.stroke();g.strokeStyle='#ffe04a';g.lineWidth=1;g.stroke()});fxSparks(x,y,'#ffe04a',10)},
 Holy:t=>{const x=midX(t),y=midY(t),z=tsz(t);SND.fx('holy');addFx(.65,(g,k)=>{const w=(k<.3?k/.3*14:14*(1-(k-.3)/.7))*z;g.fillStyle='rgba(255,246,200,.75)';g.fillRect(x-w/2,0,w,y+16);g.fillStyle='#ffffff';g.fillRect(x-w/5,0,w/2.5,y+16);
   g.strokeStyle='rgba(255,240,170,'+(1-k)+')';g.lineWidth=2;g.beginPath();g.ellipse(x,y+14,6+k*22,2+k*6,0,0,7);g.stroke()})},
 Shadow:t=>{const x=midX(t),y=midY(t),z=tsz(t);SND.fx('shadow');for(let i=0;i<9;i++){const a=i/9*Math.PI*2;addFx(.6,(g,k)=>{const r=(1-k)*28*z;g.fillStyle=k<.8?'#a070ff':'#ffffff';g.globalAlpha=.9;g.beginPath();g.arc(x+Math.cos(a+k*4)*r,y+Math.sin(a+k*4)*r*.7,3.2-k*1.5,0,7);g.fill();g.globalAlpha=1})}
   addFx(.6,(g,k)=>{if(k<.75)return;g.fillStyle=`rgba(40,0,80,${1-(k-.75)/.25})`;g.beginPath();g.arc(x,y,10+(k-.75)*60,0,7);g.fill()})},
 Dendro:t=>{const x=midX(t),y=midY(t),z=tsz(t);SND.fx('heal');for(let i=0;i<12;i++){const ox=(rnd()*30-15)*z,d=rnd()*.3,sp=rnd()*6;addFx(.7,(g,k)=>{const kk=clamp((k-d)/(1-d),0,1);if(kk<=0)return;g.globalAlpha=1-kk*.4;g.fillStyle=i%2?'#6ad65a':'#2f9a3a';const px=x+ox+Math.sin(kk*5+sp)*4,py=y-16+kk*30;g.save();g.translate(px,py);g.rotate(kk*6+sp);g.fillRect(-2,-1,4,2);g.restore();g.globalAlpha=1})}fxRing(t,'#6ad65a')},
 Geo:t=>{const x=midX(t),y=midY(t),z=tsz(t);SND.fx('crit');for(let i=0;i<9;i++){const ox=(rnd()*26-13)*z,d=rnd()*.15,h=10+rnd()*14;addFx(.6,(g,k)=>{const kk=clamp((k-d)/(1-d),0,1);if(kk<=0)return;g.globalAlpha=1-kk*.3;g.fillStyle=i%2?'#e6b84a':'#9a7a2a';const py=y+10-Math.sin(kk*3.14)*h;g.fillRect(Math.round(x+ox),Math.round(py),3,3);g.globalAlpha=1})}fxRing(t,'#e6b84a')},
 Grey:t=>{const x=midX(t),y=midY(t);SND.fx('shadow');addFx(.6,(g,k)=>{g.fillStyle=`rgba(150,150,160,${.7*(1-k)})`;g.beginPath();g.arc(x,y,8+k*26,0,7);g.fill();g.fillStyle=`rgba(40,40,48,${.8*(1-k)})`;g.beginPath();g.arc(x,y,4+k*16,0,7);g.fill()})},
 Wind:t=>{const x=midX(t),y=midY(t);SND.fx('swirl');for(let i=0;i<3;i++)addFx(.5,(g,k)=>{g.strokeStyle=`rgba(230,250,255,${1-k})`;g.lineWidth=2;g.beginPath();g.arc(x,y-8+i*8,6+k*16,k*6+i,k*6+i+2.4);g.stroke()})},
 Poison:t=>{const x=midX(t),y=midY(t);for(let i=0;i<8;i++){const ox=rnd()*22-11,d=rnd()*.3;addFx(.6,(g,k)=>{const kk=clamp((k-d)/(1-d),0,1);if(!kk)return;g.strokeStyle='#9ae050';g.fillStyle='rgba(154,224,80,.4)';g.beginPath();g.arc(x+ox,y+10-kk*26,2+kk*2,0,7);g.fill();g.stroke()})}},
};
const FXNAME={fire:'Fire',ice:'Ice',bolt:'Bolt',holy:'Holy',shadow:'Shadow',grey:'Grey',wind:'Wind',poison:'Poison'};
function fxHeal(t){const x=midX(t),y=midY(t);for(let i=0;i<10;i++){const ox=rnd()*22-11,d=rnd()*.4;addFx(.7,(g,k)=>{const kk=clamp((k-d)/(1-d),0,1);if(!kk)return;g.globalAlpha=1-kk;g.fillStyle=i%3?'#9affb0':'#ffffff';const yy=y+16-kk*34;g.fillRect(x+ox-1,yy-3,2,6);g.fillRect(x+ox-3,yy-1,6,2);g.globalAlpha=1})}}
function fxRing(t,col){const x=midX(t),y=t.side==='p'?t.hy:midY(t)+14;addFx(.6,(g,k)=>{g.strokeStyle=col;g.globalAlpha=1-k*.7;g.lineWidth=2;g.beginPath();g.ellipse(x,y-k*36,12,4,0,0,7);g.stroke();g.globalAlpha=1})}
function fxCharge(u,col){const x=midX(u),y=midY(u);SND.fx('cast');for(let i=0;i<10;i++){const a=rnd()*Math.PI*2,r=20+rnd()*14;addFx(.4,(g,k)=>{g.fillStyle=k<.7?col:'#ffffff';g.fillRect(Math.round(x+Math.cos(a)*r*(1-k)),Math.round(y+Math.sin(a)*r*(1-k)),2,2)})}
  addFx(.42,(g,k)=>{g.globalAlpha=.5*(1-Math.abs(k-.6)*2);g.fillStyle=col;g.beginPath();g.ellipse(x,u.side==='p'?u.hy:midY(u)+10,14,4,0,0,7);g.fill();g.globalAlpha=1})}
function fxArrow(u,t,col){const x0=midX(u)-12,y0=midY(u)-4,x1=midX(t),y1=midY(t);return new Promise(r=>{SND.fx('arrow');addFx(.16/ANIM[SET.speed],(g,k)=>{const x=lerp(x0,x1,k),y=lerp(y0,y1,k)-Math.sin(k*Math.PI)*6;g.strokeStyle=col;g.lineWidth=1;g.beginPath();g.moveTo(x+10,y);g.lineTo(x+22,y);g.stroke();g.strokeStyle='#e8dcc0';g.beginPath();g.moveTo(x,y);g.lineTo(x+10,y);g.stroke();g.fillStyle='#ffffff';g.fillRect(Math.round(x)-1,Math.round(y),2,1)},{done:r})})}
/* ---------- the window at the top: what is being done ---------- */
/* a band across the screen when an Ult fires, and speed lines behind it */
function cutIn(u,name){const e=el('div','cutin');e.innerHTML=`${portraitHTML(u.m,2.4)}<div><div class="cn">${esc(name)}</div><div class="cw">${esc(u.name)}</div></div>`;BT.layer.appendChild(e);setTimeout(()=>e.remove(),1100)}
function fxUltLines(col){addFx(.9,(g,k)=>{g.save();g.globalAlpha=.55*(1-Math.abs(k-.5)*2);g.strokeStyle=col;g.lineWidth=1;for(let i=0;i<26;i++){const y=(i*37+Math.floor(k*30)*13)%H,x=((i*91+k*900)%(W+80))-40;g.beginPath();g.moveTo(x,y);g.lineTo(x+30+i%5*8,y);g.stroke()}g.restore()})}
function banner(txt,col){if(!txt){BT.ban.style.display='none';return}BT.ban.style.display='';BT.ban.innerHTML=txt;BT.ban.style.color=col||''}
/* ---------- starting a battle ---------- */
function battle(foeIds,o={}){return new Promise(res=>{const back=S_SCENE,snap=document.createElement('canvas');snap.width=cv.width;snap.height=cv.height;snap.getContext('2d').drawImage(cv,0,0);
  const pre=JSON.stringify({party:G.party.map(m=>({hp:m.hp,mp:m.mp,limit:m.limit})),inv:G.inv,gold:G.gold});
  const begin=()=>{BT={o,res,back,units:[],P:[],E:[],queue:[],ready:[],fx:[],tweens:[],timers:[],busy:false,cur:null,over:false,t:0,shake:0,flash:0,intro:0,snap,pre,modals:[],cursor:null,stolen:0,cp:3,cpMax:6,cam:{x:W/2,y:H/2,z:1}};
    const counts={};for(const id of foeIds)counts[id]=(counts[id]||0)+1;const seen={};
    BT.P=G.party.slice(0,3).map((m,i)=>unitP(m,i));BT.E=foeIds.map((id,i)=>{seen[id]=(seen[id]||0)+1;return unitE(id,i,counts[id]>1?'ABC'[seen[id]-1]:'')});BT.units=BT.P.concat(BT.E);bLayout();
    BT.layer=el('div','blayer');UI.appendChild(BT.layer);
    BT.ban=winEl('banner',{x:Math.round(W/2-90),y:4,w:180},BT.layer);BT.ban.style.display='none';
    /* the strip at the bottom: the team's CP, then a card for each fighter (enemy health shows under each enemy) */
    BT.hud=el('div','bhud');place(BT.hud,{x:2,y:HUD_Y,w:W-4,h:29});BT.layer.appendChild(BT.hud);
    BT.cpw=el('div','cpb','<span class="lbl">CP</span><span class="pips">'+'<i></i>'.repeat(BT.cpMax)+'</span>');BT.hud.appendChild(BT.cpw);
    BT.prow=BT.P.map(u=>{const c=el('div','pc');c.innerHTML=`<div class="l1"><span class="nm"></span><span class="hpn"></span></div><span class="bar hpb"><i></i></span><span class="bar atb"><i></i></span><span class="bar lim"><i></i></span>`;BT.hud.appendChild(c);return c});
    SND.play(o.music||(o.boss?(o.final?'final':'boss'):'battle'));SND.fx('swirl');setScene(BATTLE_SCENE);
    for(const u of BT.P)u.ox=70;for(const u of BT.E)u.ox=-80;
    tween(BT,{intro:1},520).then(()=>{});for(const u of BT.P)tween(u,{ox:0},420,easeOut);for(const u of BT.E)tween(u,{ox:0},420,easeOut);
    if(o.preemptive)for(const u of BT.P)u.atb=.8;BT.restart=begin};
  begin()})}
/* ---------- the battle scene ---------- */
const BATTLE_SCENE={
 enter(){},
 update(dt){if(!BT||!BT.P)return;BT.t+=dt;if(G)G.time+=dt;
   for(const tw of BT.tweens.slice()){tw.t+=dt;const k=Math.min(1,tw.t/tw.d);for(const p in tw.props)tw.o[p]=lerp(tw.from[p],tw.props[p],tw.ease(k));if(k>=1){BT.tweens.splice(BT.tweens.indexOf(tw),1);tw.r()}}
   for(const tm of BT.timers.slice()){tm.t-=dt;if(tm.t<=0){BT.timers.splice(BT.timers.indexOf(tm),1);tm.r()}}
   for(const e of BT.fx.slice()){e.t+=dt*(e.done?1:ANIM[SET.speed]);if(e.t>=e.life){BT.fx.splice(BT.fx.indexOf(e),1);e.done&&e.done()}}
   for(const u of BT.units){if(u.poseT>0){u.poseT-=dt;if(u.poseT<=0)u.pose=null}if(u.flash>0)u.flash-=dt;if(u.shake>0)u.shake-=dt;if(u.dying>=0&&u.dying<1)u.dying=Math.min(1,u.dying+dt*1.6)}
   BT.shake=Math.max(0,BT.shake-dt);BT.flash=Math.max(0,BT.flash-dt*2.5);
   hud();if(BT.over||BT.intro<1)return;
   if(!BT.busy&&BT.queue.length){const a=BT.queue.shift();BT.busy=true;runAction(a).catch(e=>console.error(e)).then(()=>{BT.busy=false;checkEnd()})}
   const waiting=BT.busy||BT.queue.length||MODAL.length||BT.cur;
   if(!waiting)for(const u of BT.units){if(!u.alive||BT.ready.includes(u))continue;u.atb+=dt*atbRate(u);if(u.atb>=1){u.atb=1;turnReady(u);if(BT.queue.length||BT.over)break}}
   if(!BT.cur&&BT.ready.length&&!MODAL.length&&!BT.over&&!BT.busy)openCommand(BT.ready[0])},
 draw(){if(!BT||!BT.P)return;const g=ctx,c=BT.cam,sh=BT.shake>0?Math.round((rnd()-.5)*BT.shake*16):0;g.save();g.translate(W/2+sh,H/2);g.scale(c.z,c.z);g.translate(-c.x,-c.y);
   drawBackdrop(g,BT.o.theme||'forest',0,!!BT.o.grey,TIME,true,!!BT.o.night);if(BT.o.night){g.fillStyle='rgba(8,10,40,.38)';g.fillRect(-W,-H,W*3,H*3)}
   const list=BT.units.slice().sort((a,b)=>a.hy-b.hy);
   for(const u of list){if(u.side==='e'){drawFoe(g,u);drawAura(g,u)}else drawMember(g,u)}
   for(const e of BT.fx)e.draw(g,Math.min(1,e.t/e.life),e);
   if(BT.cursor&&(Math.floor(BT.t*4)%2===0||BT.cursor.length===1))for(const u of BT.cursor){const x=u.side==='p'?u.hx+u.ox-26:midX(u)-Math.min(u.spr.w/2,30)-10,y=midY(u)-3+(Math.floor(BT.t*5)%2);g.drawImage(HAND,Math.round(x),Math.round(y))}
   g.restore();if(c.z>1.02){g.fillStyle=`rgba(0,0,12,${Math.min(.4,(c.z-1)*1.5)})`;g.fillRect(0,0,W,9);g.fillRect(0,H-9,W,9)}
   const gr=g.createLinearGradient(0,HUD_Y-8,0,H);gr.addColorStop(0,'rgba(4,6,20,0)');gr.addColorStop(1,'rgba(4,6,20,.55)');g.fillStyle=gr;g.fillRect(0,HUD_Y-8,W,H-HUD_Y+8);
   if(BT.flash>0){g.fillStyle=`rgba(255,255,255,${BT.flash})`;g.fillRect(0,0,W,H)}
   if(BT.intro<1){const k=BT.intro,n=12,sw=W/n;for(let i=0;i<n;i++){g.globalAlpha=1-k;g.drawImage(BT.snap,i*sw*cv.width/W,0,sw*cv.width/W,cv.height,i*sw,(i%2?1:-1)*k*H*.8,sw,H)}g.globalAlpha=1;if(k<.25){g.fillStyle=`rgba(255,255,255,${(.25-k)*3})`;g.fillRect(0,0,W,H)}}},
 input(){},
};
function drawFoe(g,u){if(!u.alive&&u.dying>=1)return;const s=u.spr,bob=u.F.fly?Math.round(Math.sin(BT.t*3+u.i)*2):0,sx=u.shake>0?Math.round((rnd()-.5)*4):0;
  const x=Math.round(u.hx+u.ox-s.fx+sx),y=Math.round(u.hy+u.oy-s.fy+bob);
  if(u.dying>=0){const k=u.dying,cut=Math.round(s.h*k);const sil=foeSprite(u.F,'#ff7aa8');g.globalAlpha=1-k*.5;g.drawImage(sil.cv,0,cut,s.w,s.h-cut,x,y+cut,s.w,s.h-cut);g.globalAlpha=1;return}
  const gy=u.hy+(u.lift||0);g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(u.hx+u.ox,gy+1,Math.min(26,s.w*.32),3,0,0,7);g.fill();
  g.drawImage(u.flash>0&&Math.floor(u.flash*30)%2===0?foeSprite(u.F,'#ffffff').cv:s.cv,x,y);
  const bw=u.F.boss?56:26,bx=Math.round(u.hx+u.ox-bw/2),by=Math.round(gy+4);g.fillStyle='rgba(0,0,0,.7)';g.fillRect(bx-1,by-1,bw+2,4);g.fillStyle='#3a1010';g.fillRect(bx,by,bw,2);g.fillStyle=u.hp/u.mhp<.3?'#ff5a4a':'#ff9a6a';g.fillRect(bx,by,Math.max(1,Math.round(bw*u.hp/u.mhp)),2);
  pips(g,u,u.hx+u.ox,topY(u)-2)}
function drawMember(g,u){const m=u.m,x=u.hx+u.ox,y=u.hy+u.oy;
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,u.hy+1,10,2.5,0,0,7);g.fill();
  if(!u.alive){const c=heroSprite(m.look,m.weapon,'ko',true);g.save();g.translate(Math.round(x-14),Math.round(y-6));g.rotate(Math.PI/2);g.drawImage(c,-(DOLL_W-DOLL_FX),-DOLL_FY);g.restore();return}
  let pose=u.pose||(BT.won?'win':u.guard?'guard':u.hp<u.mhp*.25?'guard':'ready');
  if(u.running)pose='walk'+(Math.floor(BT.t*10)%4);
  if(u.dash)for(const[k,a]of[[18,.18],[9,.32]])drawHeroAt(g,m.look,m.weapon,pose,x+k*u.dash,y,true,a);
  if(m.limit>=100&&!BT.over){const p=.5+.5*Math.sin(BT.t*8);g.fillStyle=`rgba(255,140,220,${.16+.2*p})`;g.beginPath();g.ellipse(x,u.hy,14,4,0,0,7);g.fill()}
  drawHeroAt(g,m.look,m.weapon,pose,x,y,!u.running);
  if(BT.cur===u&&!BT.over){const yy=y-52+(Math.floor(BT.t*4)%2);g.fillStyle='#ffd86a';g.beginPath();g.moveTo(x-3,yy);g.lineTo(x+3,yy);g.lineTo(x,yy+4);g.fill()}
  if(m.limit>=100&&!BT.over&&Math.floor(BT.t*6)%2===0){g.fillStyle='rgba(255,140,220,.5)';g.fillRect(Math.round(x-1),Math.round(y-48),2,2)}
  pips(g,u,x,y-50)}
function pips(g,u,x,y){const ks=Object.keys(u.st).filter(k=>STATUS[k]&&!(k==='regen'&&u.st[k]>500));if(!ks.length)return;let xx=Math.round(x-ks.length*2);for(const k of ks){g.fillStyle='#000';g.fillRect(xx-1,y-1,5,5);g.fillStyle=STATUS[k].c;g.fillRect(xx,y,3,3);xx+=4}}
/* the windows at the bottom */
function hud(){if(!BT.prow)return;
  const pp=BT.cpw.children[1].children;for(let i=0;i<pp.length;i++)pp[i].className=i<BT.cp?'on':'';if(BT._cpv!==BT.cp){BT.cpw.classList.remove('pulse');void BT.cpw.offsetWidth;BT.cpw.classList.add('pulse');BT._cpv=BT.cp}
  BT.P.forEach((u,i)=>{const c=BT.prow[i],e=ELEMS[innateEl(u.m)]||ELEMS.None,R=ROLES[roleOf(u.m)],nmE=c.querySelector('.nm'),hn=c.querySelector('.hpn'),bars=c.querySelectorAll('.bar');
    const nm=`<b style="color:${R.c}">${R.s}</b><i class="eld" style="background:${e.c}"></i>${esc(u.name)}${u.m.limit>=100?' <b class="ultr">★</b>':''}`;if(nmE.innerHTML!==nm)nmE.innerHTML=nm;
    const hp=String(u.hp);if(hn.textContent!==hp)hn.textContent=hp;
    bars[0].firstChild.style.width=(u.mhp?u.hp/u.mhp*100:0)+'%';bars[0].classList.toggle('low',u.alive&&u.hp<u.mhp*.25);
    bars[1].firstChild.style.width=(u.alive?u.atb*100:0)+'%';bars[1].classList.toggle('full',u.alive&&u.atb>=1);bars[2].firstChild.style.width=u.m.limit+'%';bars[2].classList.toggle('full',u.m.limit>=100);
    c.classList.toggle('turn',BT.cur===u);c.classList.toggle('ko',!u.alive)})}
/* ---------- turns ---------- */
function turnReady(u){u.guard=false;const st=u.st;if(u.aura&&--u.aura.t<=0)u.aura=null;
  if(st.stun){delete st.stun;num(u,'Stunned','st');u.atb=0;return}
  let d=0;if(st.poison)d+=u.mhp*.06;if(st.burn)d+=u.mhp*.08;if(st.bleed)d+=u.mhp*.05;
  if(d>0){d=Math.max(1,Math.round(Math.min(d,u.side==='e'&&u.F.boss?250:9999)));hurt(u,d);num(u,d,'');if(st.poison)ELEM_FX.Poison(u);if(!u.alive){checkEnd();return}}
  if(st.regen&&u.hp<u.mhp)healU(u,u.mhp*.06);
  for(const k of Object.keys(st)){if(k==='counter'||k==='evade'||k==='focus'||k==='regen'&&st[k]>500)continue;st[k]--;if(st[k]<=0)delete st[k]}
  if(st.counter){st.counter--;if(st.counter<=0)delete st.counter}if(st.evade){st.evade--;if(st.evade<=0)delete st.evade}
  if(u.side==='p'){BT.ready.push(u);SND.fx('cur')}else{u.atb=0;BT.queue.push(foeChoose(u))}}
function foeChoose(u){const F=u.F;
  if(F.phases)for(const[th,mv]of F.phases)if(!u.phased[mv]&&u.hp/u.mhp<=th){u.phased[mv]=1;return{u,type:'foe',mv}}
  let tot=0;for(const[wt]of F.moves)tot+=wt;let r=rnd()*tot,mv='atk';for(const[wt,id]of F.moves){r-=wt;if(r<=0){mv=id;break}}
  if(FMOVES[mv].self&&u.st[FMOVES[mv].st])mv='atk';
  return{u,type:'foe',mv}}
function randomTarget(list,lowBias=.3){const a=alive(list);if(!a.length)return null;if(rnd()<lowBias)return a.slice().sort((x,y)=>x.hp/x.mhp-y.hp/y.mhp)[0];
  if(a[0].side==='p'){let tot=0;const w=a.map(u=>{const x=(roleOf(u.m)==='tank'?2.4:1)*(u.i===0?1.5:1);tot+=x;return x});let r=rnd()*tot;for(let i=0;i<a.length;i++){r-=w[i];if(r<=0)return a[i]}}
  return pick1(a)}
const pick1=a=>a[Math.floor(rnd()*a.length)];
/* ---------- the command windows ---------- */
function openCommand(u){if(!u.alive){BT.ready=BT.ready.filter(x=>x!==u);return}BT.cur=u;SND.fx('cur');tween(u,{ox:-10},120);
  const m=u.m,lim=m.limit>=100,L=limitOf(m),cpOk=BT.cp>=2;
  const rows=[{label:lim?L.n:'Attack',html:lim?`<span style="color:#ffa0e0">★ ${esc(L.n)}</span>`:'<span>⚔ Attack</span>',r:lim?'<span style="color:#ffa0e0">ULT</span>':'<span class="tiny blue">+1</span>',c:'attack'},
    {label:artLabel(m),html:`<span>✦ ${esc(artLabel(m))}</span>`,r:`<span class="tiny ${cpOk?'blue':'red'}">−2</span>`,off:!cpOk,c:'arts'},{label:'Item',html:'<span>◆ Item</span>',c:'item',off:!battleItems().length},{label:'Guard',html:'<span>⛨ Guard</span>',c:'guard'},{label:'Flee',html:'<span>➜ Flee</span>',c:'flee',off:!!BT.o.boss||!!BT.o.noFlee}];
  /* the window opens just to the left of whoever's turn it is, in the open ground between the two sides */
  const bw=92,bx=clamp(Math.round(u.hx-34-bw),3,W-bw-3),by=clamp(Math.round(u.hy-70),22,HUD_Y-62);
  const box=winEl('cmd pop',{x:bx,y:by,w:bw},BT.layer);box.appendChild(el('div','who2',esc(u.name)));
  const lw=new ListWin({el:box,rows,vis:5,quiet:true,
    render:row=>{if(!row)return;banner(row.c==='arts'?`<span class="small">${esc(artLabel(m))} cost 2 of the team's CP (${BT.cp}/${BT.cpMax})</span>`:row.c==='attack'?(lim?`<span class="small" style="color:#ffa0e0">Ult: ${esc(artDesc(L))}</span>`:'<span class="small">A plain attack earns the team 1 CP</span>'):'')},
    pick:async row=>{SND.fx('ok');
      if(row.c==='attack'){if(lim){const t=await chooseTargets(u,L.tgt);if(t)commit(u,{type:'limit',art:L,t})}else{const t=await chooseTargets(u,'one');if(t)commit(u,{type:'attack',t})}}
      else if(row.c==='arts')await artsMenu(u);else if(row.c==='item')await itemMenu(u);
      else if(row.c==='guard')commit(u,{type:'guard'});else if(row.c==='flee')commit(u,{type:'flee'})},
    back:()=>{if(BT.ready.length>1){BT.ready.push(BT.ready.shift());closeCommand(false,true)}},
    key:b=>{if(b==='select'&&BT.ready.length>1){BT.ready.push(BT.ready.shift());closeCommand(false,true)}}});
  BT.cmd=lw;BT.modals.push(lw);pushModal(lw);lw.render()}
function closeCommand(dead,keepReady){const u=BT.cur;if(!u)return;for(const m of BT.modals.slice()){popModal(m);if(m.el)m.el.remove()}BT.modals=[];BT.cursor=null;banner('');
  if(!keepReady)BT.ready=BT.ready.filter(x=>x!==u);if(!dead){tween(u,{ox:0},100)}else u.ox=0;BT.cur=null}
function commit(u,a){a.u=u;u.atb=0;BT.queue.push(a);closeCommand()}
/* choosing who: returns a list of units, or null */
function chooseTargets(u,tgt){return new Promise(res=>{let list,i=0,all=false;
  if(tgt==='self'){res([u]);return}
  if(tgt==='one'||tgt==='all'||tgt==='rand')list=alive(BT.E);else if(tgt==='ally'||tgt==='party')list=alive(BT.P);else if(tgt==='dead')list=BT.P.filter(p=>!p.alive);
  if(!list.length){SND.fx('no');res(null);return}
  if(tgt==='all'||tgt==='party'||tgt==='rand')all=true;
  if(tgt==='ally'){i=Math.max(0,list.indexOf(list.slice().sort((a,b)=>a.hp/a.mhp-b.hp/b.mhp)[0]))}
  const show=()=>{BT.cursor=all?list:[list[i]];if(all){banner(TGT_TXT[tgt]);return}const t=list[i];banner(`${esc(t.name)} <span class="tiny dim">${t.side==='e'?Math.ceil(t.hp/t.mhp*100)+'%':t.hp+'/'+t.mhp}</span>${t.aura?` <i class="eld" style="background:${ELEMS[t.aura.el].c}"></i><span class="tiny">${ELEMS[t.aura.el].n}</span>`:''}`)};
  const hid=BT.modals.filter(x=>x.el).map(x=>x.el);for(const e of hid)e.style.visibility='hidden';
  const m={input(b){if(b==='a'){SND.fx('ok');done(all?list:[list[i]])}else if(b==='b'){SND.fx('back');done(null)}
      else if(!all&&(b==='up'||b==='left')){i=(i+list.length-1)%list.length;SND.fx('cur');show()}else if(!all&&(b==='down'||b==='right')){i=(i+1)%list.length;SND.fx('cur');show()}}};
  const done=v=>{popModal(m);BT.modals=BT.modals.filter(x=>x!==m);BT.cursor=null;banner('');for(const e of hid)e.style.visibility='';res(v)};
  BT.modals.push(m);pushModal(m);show()})}
function subBox(h){const c=BT.cmd&&BT.cmd.el,r=c.getBoundingClientRect(),ui=UI.getBoundingClientRect(),cx=(r.right-ui.left)/U,cy=(r.top-ui.top)/U,w=Math.min(180,W-8);
  return winEl('pop sub',{x:clamp(Math.round(cx-w),3,W-w-3),y:clamp(Math.round(cy-4),20,HUD_Y-h-2),w,h},BT.layer)}
function artsMenu(u){return new Promise(res=>{const m=u.m,list=artsOf(m);
  const box=subBox(84);
  const rows=list.map(a=>{const dead=a.tgt==='dead'&&!BT.P.some(p=>!p.alive);return{label:a.n,r:`<span class="${BT.cp<2?'red':'blue'}">2 CP</span>`,off:BT.cp<2||dead,a}});
  const lw=new ListWin({el:box,rows,vis:5,title:`<span class="small">${esc(artLabel(m))}</span> <span class="tiny dim">team CP ${BT.cp}/${BT.cpMax}</span>`,
    render:row=>{if(row)banner(`<span class="small">${esc(artDesc(row.a))}</span>`)},
    pick:async row=>{const t=await chooseTargets(u,row.a.tgt);if(t){close();commit(u,{type:'art',art:row.a,t})}else banner(`<span class="small">${esc(artDesc(row.a))}</span>`)},
    back:()=>{close()}});
  const close=()=>{popModal(lw);BT.modals=BT.modals.filter(x=>x!==lw);banner('');box.remove();res()};
  BT.modals.push(lw);pushModal(lw)})}
const battleItems=()=>Object.keys(G.inv).filter(k=>ITEMS[k]&&!ITEMS[k].mat&&!ITEMS[k].field&&G.inv[k]>0);
function itemMenu(u){return new Promise(res=>{const ids=battleItems();
  const box=subBox(84);
  const rows=ids.map(id=>{const I=ITEMS[id],off=(I.use==='revive'&&!BT.P.some(p=>!p.alive))||(I.use==='flee'&&BT.o.boss);return{label:I.n,r:'×'+G.inv[id],id,off}});
  const lw=new ListWin({el:box,rows,vis:5,title:'<span class="small">Items</span>',empty:'Nothing to use.',
    render:row=>{if(row)banner(`<span class="small">${esc(ITEMS[row.id].desc)}</span>`)},
    pick:async row=>{const I=ITEMS[row.id],tg=I.tgt==='none'?'self':I.tgt;const t=await chooseTargets(u,tg);if(t){close();commit(u,{type:'item',id:row.id,t})}},
    back:()=>close()});
  const close=()=>{popModal(lw);BT.modals=BT.modals.filter(x=>x!==lw);banner('');box.remove();res()};
  BT.modals.push(lw);pushModal(lw)})}
/* ---------- doing things ---------- */
function retarget(u,t,side){const pool=side==='e'?BT.E:BT.P;return t.filter(x=>x.alive).length?t.filter(x=>x.alive):(alive(pool).length?[randomTarget(pool,0)]:[])}
async function runAction(a){const u=a.u;if(BT.over)return;if(!u.alive&&a.type!=='counter')return;if(a.type==='counter'&&!u.alive)return;
  if(a.type==='foe')return foeAct(a);
  if(a.type==='guard'){u.guard=true;num(u,'Guard','st');SND.fx('buff');u.pose='guard';u.poseT=.3;await bwait(250);return}
  if(a.type==='flee')return flee(u);
  if(a.type==='item')return useItemB(u,a.id,a.t);
  if(a.type==='counter'){if(!a.t.alive)return;banner('Counter');await melee(u,[a.t],1,{kind:'phys',pow:.8});banner('');return}
  if(a.type==='attack'){let t=retarget(u,a.t,'e');if(!t.length)return;const w=u.m.weapon;
    if(w.kind==='bow')await ranged(u,t,1,{kind:'phys',pow:1});else await melee(u,t,w.kind==='dual'?2:w.kind==='fists'?2:1,{kind:'phys',pow:w.kind==='dual'||w.kind==='fists'?.55:1});gainCP(u,1);return}
  if(a.type==='art'||a.type==='limit')return artAct(u,a.art,a.t,a.type==='limit')}
/* where a party fighter stands to hit a foe: just to its right */
const frontOf=t=>t.hx+Math.min(t.spr.w*.42,34)+12;
/* dashing across to strike, once or many times, then back to their place */
async function melee(u,targets,hits,o,heavy){const w=u.m.weapon,col=dyeOf(w.glow,'Sky'),T=WTYPES[w.kind],big=T.hold==='two';
  const live=targets.filter(t=>t.alive),fx=live.length?Math.max(...live.map(frontOf)):frontOf(targets[0]);
  u.pose='walk1';u.dash=1;SND.fx('run');await tween(u,{ox:Math.min(-30,fx-u.hx)},200,easeOut);u.dash=0;
  for(let h=0;h<hits;h++){let tg=o.rand?[randomTarget(BT.E,0)].filter(Boolean):targets.filter(t=>t.alive);if(!tg.length)tg=alive(BT.E).slice(0,1);if(!tg.length)break;
    u.pose='wind';await bwait(hits>3?50:90);u.pose='strike';SND.fx(w.kind==='fists'?'punch':big?'heavy':'slash');
    for(const t of tg){if(w.kind==='fists')fxPunch(t,col);else fxSlash(t,col,big||heavy);strike(u,t,o)}
    if(big)BT.shake=Math.max(BT.shake,.18);await bwait(hits>3?80:hits>1?120:200)}
  u.pose='walk2';u.dash=-1;await tween(u,{ox:0},220,easeIO);u.dash=0;u.pose=null}
async function ranged(u,targets,hits,o){const w=u.m.weapon,col=dyeOf(w.glow,'Lime');await tween(u,{ox:-18},120,easeOut);
  for(let h=0;h<hits;h++){let tg=o.rand?[randomTarget(BT.E,0)].filter(Boolean):targets.filter(t=>t.alive);if(!tg.length)tg=alive(BT.E).slice(0,1);if(!tg.length)break;
    u.pose='ready';await bwait(h?60:150);u.pose='strike';await Promise.all(tg.map(t=>fxArrow(u,t,col)));for(const t of tg){fxSparks(midX(t),midY(t),col,5);strike(u,t,o)}await bwait(hits>1?70:160)}
  u.pose=null;await tween(u,{ox:0},140)}
async function cast(u,targets,o){const w=u.m?u.m.weapon:null,col=w?dyeOf(w.glow,'Violet'):'#a070ff';
  if(u.side==='p'){u.pose='cast';tween(u,{ox:-16},140,easeOut)}fxCharge(u,col);await bwait(380);
  const fx=ELEM_FX[o.elem||'']||null;for(const t of targets){if(!t.alive)continue;if(fx)fx(t);else ELEM_FX.Shadow(t)}await bwait(320);
  for(const t of targets)strike(u,t,o);await bwait(220);u.pose=null;if(u.side==='p')await tween(u,{ox:0},140)}
async function artAct(u,a,tg,isLimit){const m=u.m;
  if(!isLimit){if(BT.cp<2){num(u,'No CP','miss');return}BT.cp-=2}else m.limit=0;
  banner(isLimit?`<span style="color:#ffa0e0">★ ${esc(a.n)} ★</span>`:esc(a.n));
  const near=a.kind==='heal'||a.kind==='buff'?(a.tgt==='party'?alive(BT.P):(tg||[u])):(a.tgt==='one'?retarget(u,tg,'e'):alive(BT.E));
  if(isLimit){cutIn(u,a.n);SND.fx('limit');fxUltLines('#ffa0e0');await bcamTo(midX(u),midY(u)-6,1.3,300);u.pose='win';await bwait(600);BT.flash=.5;await camOn([u].concat(near),1.12)}
  else await camOn([u].concat(near),1.12);
  const o={kind:a.kind,pow:a.pow,elem:a.elem,crit:a.crit,sure:a.sure,st:a.st,chance:a.chance,turns:a.turns,execute:a.execute,drain:a.drain,rand:a.tgt==='rand'};
  if(a.kind==='phys'){let t=a.tgt==='all'?alive(BT.E):a.tgt==='rand'?alive(BT.E):retarget(u,tg,'e');if(!t.length){await camHome();banner('');return}
    const hits=a.hits||1;if(a.tgt==='rand'&&!a.hits)o.rand=true;if(a.tgt==='rand')t=alive(BT.E);
    if(m.weapon.kind==='bow')await ranged(u,a.tgt==='rand'?t:t,hits,Object.assign(o,{rand:a.tgt==='rand'}));
    else if(m.weapon.kind==='staff'||m.weapon.kind==='grimoire'){for(let h=0;h<hits;h++)await cast(u,a.tgt==='rand'?[randomTarget(BT.E,0)].filter(Boolean):t.filter(x=>x.alive),Object.assign({},o,{kind:'phys'}))}
    else await melee(u,t,hits,Object.assign(o,{rand:a.tgt==='rand'}),isLimit||a.pow>=2)}
  else if(a.kind==='mag'){const t=a.tgt==='all'?alive(BT.E):retarget(u,tg,'e');if(t.length)await cast(u,t,o)}
  else if(a.kind==='heal'){let t=a.tgt==='party'?BT.P.filter(p=>p.alive||a.revive):a.tgt==='self'?[u]:tg;u.pose='cast';fxCharge(u,'#9affb0');await bwait(340);SND.fx('heal');
    for(const p of t){if(!p.alive){if(a.revive){p.alive=true;p.hp=0;p.atb=0;healU(p,p.mhp*a.revive);fxHeal(p)}else num(p,'Miss','miss');continue}
      fxHeal(p);healU(p,a.pct?p.mhp*(a.pow>=99?1:a.pow):stat(u,'mag')*a.pow*1.6+10)}
    await bwait(380);u.pose=null}
  else if(a.kind==='buff'){const t=a.tgt==='party'?alive(BT.P):a.tgt==='self'?[u]:tg.filter(x=>x.alive);u.pose='cast';await bwait(200);
    for(const p of t){fxRing(p,STATUS[a.st].c);giveStatus(p,a.st,a.turns||3)}await bwait(380);u.pose=null}
  if(a.after==='regen')for(const p of alive(BT.P)){p.st.regen=Math.max(p.st.regen||0,4);fxRing(p,STATUS.regen.c)}
  if(a.refund)u.mp=Math.min(u.mmp,u.mp+Math.round(a.mp*a.refund));await camHome();banner('')}
async function useItemB(u,id,tg){let cpDone=false;const I=ITEMS[id];if(!hasItem(id)){num(u,'None left','miss');return}addItem(id,-1);banner(esc(I.n));u.pose='cast';await bwait(220);
  if(I.use==='bomb'){const lv=G.party.reduce((s,m)=>s+m.lv,0)/G.party.length,t=alive(BT.E);for(const e of t)(ELEM_FX[I.elem]||ELEM_FX.Fire)(e);await bwait(380);
    for(const e of t){let d=I.amt*(1+lv*.12)*(.92+rnd()*.16);if(e.F.weak.includes(I.elem))d*=1.5;else if(e.F.res.includes(I.elem))d*=.5;d=Math.round(d);hurt(e,d);num(e,d)}}
  else if(I.use==='flee'){banner('');u.pose=null;return flee(u,true)}
  else for(const p of tg){if(I.use==='revive'){if(p.alive){num(p,'Miss','miss');continue}p.alive=true;p.hp=0;p.atb=0;healU(p,p.mhp*I.amt);fxHeal(p);SND.fx('heal');continue}if(!p.alive){num(p,'Miss','miss');continue}
    if(I.use==='heal'){healU(p,I.amt);fxHeal(p);SND.fx('heal')}else if(I.use==='mp'){if(!cpDone){cpDone=true;gainCP(u,Math.max(1,Math.round(I.amt/20)))}fxHeal(p);SND.fx('heal')}
    else if(I.use==='full'){healU(p,p.mhp);p.mp=p.mmp;fxHeal(p);SND.fx('heal')}else if(I.use==='cure'){for(const k of['poison','burn','bleed','stun','slow','atkDown','defDown'])delete p.st[k];num(p,'Cured','st');fxRing(p,'#ffffff');SND.fx('heal')}}
  await bwait(380);u.pose=null;banner('')}
async function flee(u,sure){if(BT.o.boss){banner('There is no escape!');SND.fx('no');await bwait(700);banner('');return}
  const ps=alive(BT.P).reduce((s,p)=>s+stat(p,'spd'),0)/Math.max(1,alive(BT.P).length),es=alive(BT.E).reduce((s,e)=>s+stat(e,'spd'),0)/Math.max(1,alive(BT.E).length);
  const ch=sure?1:clamp(.55+(ps-es)*.03+(BT.fails||0)*.15,.25,.95);banner('Fleeing…');await bwait(300);
  if(rnd()<ch){SND.fx('run');for(const p of alive(BT.P))p.running=true;await Promise.all(alive(BT.P).map(p=>tween(p,{ox:80},450,easeIn)));banner('');endBattle('flee');return}
  BT.fails=(BT.fails||0)+1;banner('Couldn\'t get away!');SND.fx('no');await bwait(650);banner('')}
/* a foe's move */
async function foeAct(a){const u=a.u,M=FMOVES[a.mv]||FMOVES.atk;if(!u.alive)return;
  if(a.mv!=='atk')banner(esc(M.text?u.name+' '+M.text:M.n));
  u.flash=.16;await bwait(160);
  if(M.kind==='buff'){fxRing(u,STATUS[M.st].c);giveStatus(u,M.st,M.turns||3);await bwait(450);banner('');return}
  let t=M.all?alive(BT.P):[randomTarget(BT.P)].filter(Boolean);if(!t.length){banner('');return}
  if(M.kind==='phys'){const reach=t.length===1&&!u.F.boss?clamp(t[0].hx-46-u.hx,16,90):22;await tween(u,{ox:reach},150,easeOut);SND.fx(M.pow>1.2?'heavy':'hit');for(const p of t){fxSlash(p,'#ffffff',M.pow>1.2);const r=strike(u,p,M);
      if(M.steal&&r&&!r.miss){const n=Math.min(G.gold,Math.round(10+u.F.lv*6));if(n>0){G.gold-=n;BT.stolen+=n;num(p,'-'+n+'g','miss')}}}
    await bwait(240);await tween(u,{ox:0},180,easeIO)}
  else{fxCharge(u,'#c8a8ff');await bwait(330);const fx=ELEM_FX[FXNAME[M.fx]||M.elem]||ELEM_FX.Shadow;for(const p of t)fx(p);await bwait(300);for(const p of t)strike(u,p,M);await bwait(260)}
  banner('')}
/* ---------- the end ---------- */
function checkEnd(){if(!BT||BT.over||!BT.P)return;if(!alive(BT.E).length){victory();return}if(!alive(BT.P).length)defeat()}
function closeAllModals(){for(const m of BT.modals.slice()){popModal(m);if(m.el)m.el.remove()}BT.modals=[];BT.cur=null;BT.cursor=null}
function writeBack(win){for(const u of BT.P){const m=u.m;m.hp=u.alive?u.hp:(win?1:0);m.mp=u.mp}}
async function victory(){BT.over=true;closeAllModals();banner('');camHome(200);await bwait(450);BT.won=true;SND.play('victory');
  let xp=0,gold=0;const drops={};G.kills=G.kills||{};for(const u of BT.E){const s=u.s;xp+=s.xp;gold+=s.gold;const F=u.F;G.kills[F.id]=(G.kills[F.id]||0)+1;
    if(rnd()<.12)drops.potion=(drops.potion||0)+1;if(F.lv>=5&&rnd()<.1)drops.ore=(drops.ore||0)+1;if(F.lv>=12&&rnd()<.06)drops.hipotion=(drops.hipotion||0)+1;if(F.lv>=10&&rnd()<.06)drops.ether=(drops.ether||0)+1;
    if(F.boss){drops.ore=(drops.ore||0)+3;drops.starsteel=(drops.starsteel||0)+1;drops[F.lv>=20?'megapotion':'hipotion']=(drops[F.lv>=20?'megapotion':'hipotion']||0)+2}}
  const gm=Math.max(...BT.P.map(u=>u.s.goldMul));gold=Math.round(gold*gm)+BT.stolen;G.gold+=gold;let gems=0;for(const u of BT.E)gems+=Math.ceil(4+u.F.lv*1.4)*(u.F.boss?8:1);const w0=wishes();G.gems=(G.gems||0)+gems;for(const[k,n]of Object.entries(drops))addItem(k,n);
  writeBack(true);G.battles++;
  for(const m of G.roster||[])giveXP(m,Math.round(xp*.6*statsOf(m).xpMul));
  const ups=G.party.map(m=>{const st=statsOf(m),n=Math.round(xp*st.xpMul);return{m,n,ups:giveXP(m,n)}});clampParty();
  await bwait(600);
  /* the results */
  const box=winEl('pop results',{x:Math.round(W/2-120),y:14,w:240},BT.layer);
  const dropTxt=Object.entries(drops).map(([k,n])=>`${ITEMS[k].n}${n>1?' ×'+n:''}`).join(', ');
  box.innerHTML=`<div class="ttl">Victory!</div><div class="small">EXP <b class="gold">${fmt(xp)}</b> · Gold <b class="gold">${fmt(gold)}</b> · Gems <b class="blue">◆${gems}</b>${wishes()>w0?' <span class="green">A wish is ready!</span>':''}${BT.stolen?` <span class="dim">(${BT.stolen} won back)</span>`:''}</div>${dropTxt?`<div class="small">Found: <span class="blue">${esc(dropTxt)}</span></div>`:''}`+
    ups.map(({m,n,ups})=>`<div class="rr">${portraitHTML(m)}<div style="flex:1"><div class="small">${esc(m.name)} <span class="dim">Lv</span> ${m.lv}${ups.length?' <span class="gold lvup">LEVEL UP!</span>':''}</div>${barHTML(m.xp,needXP(m.lv),'xp',90)}${ups.flatMap(x=>x.learned).map(a=>`<div class="tiny green">Learned ${esc(a)}!</div>`).join('')}</div></div>`).join('')+
    `<div class="tiny dim" style="text-align:right;margin-top:${px(2)}"><i class="k a">A</i>continue</div>`;
  if(ups.some(x=>x.ups.length))setTimeout(()=>SND.fx('level'),300);
  await new Promise(r=>{const m={el:box,input(b){if(b==='a'||b==='b'){popModal(m);r()}}};setTimeout(()=>pushModal(m),350)});
  endBattle('win')}
async function defeat(){BT.over=true;closeAllModals();banner('');camHome(200);SND.stop();await bwait(800);
  const box=winEl('pop',{x:Math.round(W/2-90),y:40,w:180},BT.layer);
  const i=await pick({el:box,rows:[{label:'Try this battle again'},{label:'Load your last save'},{label:'Back to the title'}],vis:3,noBack:true,title:'<span class="ttl">Everything goes dark…</span>'});
  if(i===0){const p=JSON.parse(BT.pre);G.party.forEach((m,k)=>Object.assign(m,p.party[k]||{}));G.inv=p.inv;G.gold=p.gold;const restart=BT.restart;BT.layer.remove();restart()}
  else{writeBack(false);endBattle(i===1?'load':'title')}}
function endBattle(r){const b=BT;if(r!=='win'&&r!=='load'&&r!=='title')writeBack(false);b.layer.remove();
  for(const m of G.party)m.limit=Math.min(100,m.limit||0);BT=null;setScene(b.back);b.res(r);if(r==='win')setTimeout(checkQuests,300)}
