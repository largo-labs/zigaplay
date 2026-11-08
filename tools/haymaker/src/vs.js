/* ================= the fight: a side-view fighting game =================
   Runs at a fixed 60 steps a second. ◀▶ walk, ▲ jump (a jump goes the way you were just walking), ▼ crouch.
   Hold away from the opponent to block highs, mids and overheads standing; crouching ducks highs and blocks lows
   (down-back, on a keyboard or stick, blocks mids too). So lows beat a standing block and mids and overheads beat a
   crouch. A jab, B cross: A A B strings; ▼B uppercut launches for juggles; →B overhead; ▼A low; A+B up close throws.
   Each fighter has three specials (↓→A, ←→B, ↓←A) and a normal that hits (or is blocked) can be cancelled into
   the next part of its string or into a special. Under 30% health, ▼+A+B is the Fatal Haymaker (used up once it
   lands). An uppercut that counter-hits is a Crushing Blow (once a match). Best of three; then FINISH THEM: ↓→↓+B. */
const STAGE=150,WALK=1.25,GRAV=.3,JUMPV=-5.7,JUMPX=1.8;
const MOVES={
  jab:{s:4,a:3,r:9,dmg:5,h:'high',hx:[14,44],hy:[-80,-60],hs:14,bs:8,push:2.5,chain:{a:'jab2',b:'cross'},hand:'f',to:{fx:46,fy:-70,lean:.18},sfx:'jab'},
  jab2:{s:4,a:3,r:10,dmg:5,h:'high',hx:[14,44],hy:[-80,-60],hs:15,bs:8,push:2.5,chain:{b:'cross'},hand:'f',to:{fx:47,fy:-67,lean:.2},sfx:'jab'},
  cross:{s:7,a:3,r:15,dmg:9,h:'mid',hx:[14,48],hy:[-78,-46],hs:18,bs:10,push:4,chain:{d:'upper'},hand:'n',to:{nx:49,ny:-66,lean:.36,hx:5},sfx:'cross'},
  over:{s:16,a:4,r:16,dmg:12,h:'over',hx:[12,46],hy:[-90,-40],hs:20,bs:12,push:5,hand:'n',wind:{nx:-4,ny:-100,lean:-.1},to:{nx:42,ny:-56,lean:.45,hx:8},sfx:'hay'},
  low:{s:5,a:3,r:10,dmg:4,h:'low',crouch:1,hx:[12,42],hy:[-34,-4],hs:13,bs:8,push:2.5,chain:{a:'low',b:'cross'},hand:'f',to:{fx:44,fy:-30,lean:.42},sfx:'jab'},
  upper:{s:7,a:4,r:22,dmg:10,h:'mid',crouch:1,hx:[6,34],hy:[-110,-30],hs:30,bs:12,push:2,launch:1,hand:'n',wind:{nx:16,ny:-30},to:{nx:28,ny:-108,lean:-.12,hy:-44},sfx:'hay'},
  jA:{air:1,s:4,a:20,r:4,dmg:6,h:'over',hx:[8,36],hy:[-60,-16],hs:16,bs:9,push:2,hand:'f',to:{fx:36,fy:-40},sfx:'jab'},
  jB:{air:1,s:6,a:16,r:4,dmg:9,h:'over',hx:[6,34],hy:[-56,-8],hs:18,bs:10,push:3,hand:'n',to:{nx:34,ny:-34,fx:30,fy:-38,lean:.3},sfx:'cross'},
  throw:{s:5,a:3,r:20,throw:1,dmg:12,hx:[8,32],hy:[-80,-20],to:{fx:34,fy:-64,nx:30,ny:-62,lean:.25}}};
/* the specials, by kind (data.js gives each fighter three) */
const SPK={
  proj:{s:12,a:2,r:20,dmg:8,to:{nx:46,ny:-70,lean:.3}},
  dash:{s:6,a:14,r:18,dmg:10,h:'mid',hx:[10,44],hy:[-80,-46],hs:20,bs:12,push:4,to:{nx:50,ny:-68,lean:.42,hx:6},move:4.4},
  rise:{s:3,a:12,r:20,dmg:11,h:'mid',hx:[0,30],hy:[-118,-30],hs:30,bs:14,push:2,launch:1,inv:8,to:{nx:22,ny:-112,lean:-.1}},
  grab:{s:8,a:4,r:24,dmg:15,grab:1,hx:[8,40],hy:[-80,-20],to:{fx:40,fy:-66,nx:36,ny:-62,lean:.3}},
  counter:{s:2,a:26,r:16,dmg:12,counter:1,to:{fx:12,fy:-84,nx:16,ny:-80,lean:-.05,ex:'smug'}},
  armor:{s:20,a:4,r:18,dmg:14,h:'mid',hx:[12,52],hy:[-84,-46],hs:24,bs:14,push:7,armor:1,wind:{nx:-16,ny:-74,lean:-.15},to:{nx:52,ny:-66,lean:.5,hx:8},sfx:'hay'},
  multi:{s:8,a:24,r:18,dmg:4,h:'mid',hits:4,hx:[-30,40],hy:[-84,-36],hs:14,bs:8,push:1.5,move:1.2,to:{fx:40,fy:-72,nx:-28,ny:-72,lean:0}},
  slam:{s:4,a:8,r:16,dmg:12,h:'low',hx:[-46,56],hy:[-16,0],hs:26,bs:12,push:4,hop:1,to:{fx:30,fy:-40,nx:30,ny:-38,lean:.4}},
  tele:{s:12,a:2,r:10,tele:1,to:{lean:0}},
  leap:{s:6,a:30,r:12,dmg:11,h:'over',hx:[4,36],hy:[-70,-6],hs:22,bs:12,push:4,leap:1,to:{nx:34,ny:-40,fx:30,fy:-46,lean:.35}},
  freeze:{s:10,a:3,r:16,dmg:7,h:'mid',hx:[12,46],hy:[-82,-46],hs:12,bs:10,push:2,freeze:50,to:{fx:46,fy:-68,lean:.25}},
  flurry:{s:5,a:22,r:14,dmg:3,h:'high',hits:5,hx:[12,46],hy:[-82,-58],hs:12,bs:7,push:1.2,to:{fx:46,fy:-70,lean:.25}}};
const FATAL={s:10,a:5,r:30,inv:12,hx:[6,44],hy:[-90,-30],to:{nx:50,ny:-70,lean:.4,hx:6}};
let M=null;/* the match */
const PT={};/* buttons pressed since the last step */
function newMatch(o){FX.length=0;M={mode:o.mode||'vs',venue:o.venue,p1:o.p1,p2:o.p2,lvl:o.lvl||SAVE.cpu||3,bestOf:o.bestOf||SAVE.rounds||3,rw:o.rw?o.rw.slice():[0,0],rd:o.rd||1,
    F:[],proj:[],ph:'intro',t:0,timer:0,msg:null,shake:0,freeze:0,zoom:1,slow:0,res:null,fin:null,cin:null,cmb:null,roundWinner:-1};
  M.F=[mkFighter(0,o.p1,false),mkFighter(1,o.p2,true)];M.F[1].alt=o.p1===o.p2;if(o.cpu1)M.F[0].cpu=true;CAMV.x=0;startRound();if(o.hp)M.F.forEach((f,i)=>f.hp=Math.min(f.max,o.hp[i]||f.max))}
function mkFighter(i,id,cpu){const ch=ROSTER[RIX[id]];return{i,id,ch,x:0,y:0,vx:0,vy:0,face:1,hp:100*ch.hp,max:100*ch.hp,st:'idle',t:0,mv:null,mf:0,hit:0,hits:0,
  combo:0,juggle:0,cpu,pad:{held:{},tap:{}},hist:[],buf:null,lastA:-99,lastB:-99,fatalUsed:false,crushUsed:false,low:false,armor:0,inv:0,frz:0,flash:0,P:Object.assign({},GUARD),wph:0,
  ai:{t:30,hold:0,held:null,react:null},dmgRound:0}}
function startRound(){M.F.forEach((f,i)=>Object.assign(f,{x:i?55:-55,y:0,vx:0,vy:0,face:i?-1:1,hp:f.max,st:'idle',t:0,mv:null,combo:0,juggle:0,low:false,armor:0,inv:0,frz:0,dmgRound:0,buf:null,hist:[],P:Object.assign({},GUARD)}));
  M.proj=[];M.ph='intro';M.t=0;M.timer=SAVE.time===0?Infinity:(SAVE.time||60)*60;M.cin=null;M.fin=null;M.res=null;M.cmb=null;M.zoom=1;M.cpuFin=0;
  M.msg={s:'ROUND '+M.rd,t:0,d:60,c:'#fff'};SFX.bell(1);SFX.crowd(.12,1.4)}
const other=f=>M.F[1-f.i];
function say(s,c='#ffd84a',d=70){M.msg={s,t:M.t,d,c}}

/* ---------- input ---------- */
function humanPad(f){const H=RAW.held;f.pad={held:{l:!!H.left,r:!!H.right,u:!!H.up,d:!!H.down,a:!!H.a,b:!!H.b},tap:{u:!!PT.up,a:!!PT.a,b:!!PT.b,d:!!PT.down,l:!!PT.left,r:!!PT.right}}}
const fwdK=f=>f.face>0?'r':'l',backK=f=>f.face>0?'l':'r';
function dirOf(f){const h=f.pad.held,F=h[fwdK(f)],B=h[backK(f)];return h.d?(F?'DF':B?'DB':'D'):h.u?(F?'UF':B?'UB':'U'):F?'F':B?'B':'N'}
function recordDir(f){const d=dirOf(f);if(!f.hist.length||f.hist[f.hist.length-1].d!==d)f.hist.push({d,t:M.t});if(f.hist.length>12)f.hist.shift()}
/* did the stick go through these directions in order, within the last n steps, the last one entered just now? */
function motion(f,seq,n=18){let i=seq.length-1;for(let k=f.hist.length-1;k>=0&&i>=0;k--){const h=f.hist[k];if(M.t-h.t>n&&i<seq.length-1)break;
    if(seq[i].split('|').includes(h.d)){if(i===seq.length-1&&M.t-h.t>12)return false;i--}else if(i===seq.length-1&&h.d!=='N')return false}return i<0}
/* which way a jump goes: the way you hold, or the way you were walking a moment ago (for a four-way D-pad) */
function jumpDir(f){const h=f.pad.held;if(h[fwdK(f)])return 1;if(h[backK(f)])return-1;for(let k=f.hist.length-1;k>=0;k--){const e=f.hist[k];if(M.t-e.t>10)break;if(/F/.test(e.d))return 1;if(/B/.test(e.d))return-1}return 0}
/* ---------- moves ---------- */
function canAct(f){return['idle','walk','crouch','jump'].includes(f.st)&&!f.frz}
function startMove(f,key,sp){const m=sp?Object.assign({},SPK[sp.k],{sp,key}):Object.assign({},MOVES[key],{key});if(m.air&&f.y>=0)return false;if(!m.air&&f.y<0)return false;
  if(sp&&sp.charge)m.move=3.6;
  f.st='atk';f.mv=m;f.mf=0;f.hit=0;f.hits=0;f.armor=m.armor?1:0;if(m.inv)f.inv=m.inv;if(!m.air)f.vx=0;f.buf=null;
  if(m.hop){f.vy=-4.6;f.vx=2.2*f.face}if(m.leap){f.vy=-5.6;f.vx=3.1*f.face}
  if(sp){f.flash=10;SFX.whoosh();if(!f.cpu)RUMBLE.dodge()}return true}
function trySpecial(f,btn){if(f.y<0)return false;let sl=-1;
  if(btn==='a'){if(motion(f,['D|DF','F|DF']))sl=0;else if(motion(f,['D|DB','B|DB']))sl=2}else if(motion(f,['B|DB|UB','F|DF|UF'],20))sl=1;
  if(sl<0)return false;return startMove(f,'sp'+sl,f.ch.sp[sl])}
function tryFatal(f){if(f.fatalUsed||f.hp>f.max*.3||!f.pad.held.d||f.y<0)return false;const m=Object.assign({},FATAL,{key:'fatal',fatal:1});f.st='atk';f.mv=m;f.mf=0;f.hit=0;f.inv=m.inv;f.vx=0;
  M.freeze=18;say('FATAL HAYMAKER',f.ch.sp[0].c,60);SFX.combo();if(!f.cpu)RUMBLE.hay();return true}
function control(f){const pd=f.pad,o=other(f);recordDir(f);
  if(pd.tap.a)f.lastA=M.t;if(pd.tap.b)f.lastB=M.t;if(pd.tap.a||pd.tap.b)f.buf={a:!!pd.tap.a,b:!!pd.tap.b,t:M.t};
  const bf=f.buf&&M.t-f.buf.t<=8?f.buf:null;
  /* A+B together (within 3 steps): the Fatal Haymaker holding ▼ at low health, else a throw up close */
  const both=Math.abs(f.lastA-f.lastB)<=3&&M.t-Math.max(f.lastA,f.lastB)===0;
  if(both&&(canAct(f)||f.st==='atk'&&f.mf<=3&&['jab','low','cross','upper','sp0','sp2'].includes(f.mv.key))){f.lastA=f.lastB=-99;
    if(tryFatal(f))return;if(Math.abs(o.x-f.x)<38&&f.y>=0&&o.y>=0&&!['down','getup','air','thrown'].includes(o.st)){startMove(f,'throw');return}}
  /* strings and cancels */
  if(f.st==='atk'){const m=f.mv;if(m&&!m.sp&&!m.fatal&&!m.air&&f.y>=0&&f.hit&&f.mf>=m.s&&bf){const btn=bf.a?'a':'b';if(trySpecial(f,btn))return;
      const nx=m.chain&&(pd.held.d&&m.chain.d&&btn==='b'?m.chain.d:m.chain[btn]);if(nx){startMove(f,nx);return}}return}
  if(!canAct(f))return;
  const h=pd.held,F=h[fwdK(f)],B=h[backK(f)];
  if(bf){const b=bf.a?'a':'b';f.buf=null;if(f.st==='jump'){startMove(f,b==='a'?'jA':'jB');return}if(trySpecial(f,b))return;
    if(h.d){startMove(f,b==='a'?'low':'upper');return}if(b==='b'&&F){startMove(f,'over');return}startMove(f,b==='a'?'jab':'cross');return}
  if(f.st==='jump')return;
  if(pd.tap.u||h.u){const j=jumpDir(f);f.st='jump';f.t=0;f.vy=JUMPV;f.vx=j*JUMPX*f.face*(j<0?.85:1);f.low=false;SFX.whoosh();return}
  f.low=!!h.d;
  if(f.low){f.st='crouch';f.vx=0}else if(F||B){f.st='walk';f.vx=(F?WALK:-WALK*.78)*f.face*f.ch.spd;f.wph+=.22*(F?1:-1)}else{f.st='idle';f.vx=0}}
/* ---------- each step ---------- */
function fighterStep(f){const o=other(f);f.t++;if(f.inv>0)f.inv--;if(f.flash>0)f.flash--;if(f.frz>0){f.frz--;return}
  if(f.st==='atk'){const m=f.mv;f.mf++;
    if(m.move&&f.mf>m.s&&f.mf<=m.s+m.a&&!f.hit)f.vx=m.move*f.face*(m.sp&&m.sp.fast?1.4:1);else if(m.move&&f.mf>m.s+m.a)f.vx*=.7;
    if(m.sp&&m.sp.k==='rise'&&f.mf===m.s+1){f.vy=-6.2;f.vx=1.2*f.face}
    if(m.sp&&m.sp.k==='proj'&&f.mf===m.s+1)spawnProj(f);
    if(m.tele&&f.mf===m.s){f.x=clamp(o.x-o.face*34,-STAGE+12,STAGE-12);f.face=sgn(o.x-f.x)||f.face;f.inv=6;fx('splash',f.x,-50,{r:16,life:.3,c:m.sp.c,seed:M.t})}
    if(f.armor&&f.mf>m.s+m.a)f.armor=0;
    if(m.leap||m.hop){if(f.y>=0&&f.mf>2){if(m.hop){f.mv=Object.assign({},m,{hop:0,s:0,a:6});f.mf=0;f.vx=0;fx('ring',f.x,0,{r:40,life:.4,c:m.sp.c});SFX.hay();M.shake=Math.max(M.shake,6);if(!f.cpu)RUMBLE.cross()}
      else{f.st='idle';f.mv=null;f.vx=0}}}
    else{const done=f.y<0?false:(m.air?f.mf>m.s:f.mf>=m.s+m.a+m.r);if(done){f.st=f.pad.held.d&&!m.air?'crouch':'idle';f.vx=0;f.mv=null}}}
  else if(f.st==='hit'||f.st==='block'){if(--f.stun<=0){if(f.st==='hit')f.combo=0;f.st=f.pad.held.d?'crouch':'idle'}f.vx*=.82}
  else if(f.st==='down'){f.vx*=.8;if(f.t>40&&f.hp>0&&M.ph!=='ko'){f.st='getup';f.t=0;f.inv=24}}
  else if(f.st==='getup'){if(f.t>22){f.st='idle';f.combo=0;f.juggle=0}}
  else if(f.st==='thrown'){if(f.t>28&&f.y>=0){f.st='down';f.t=0;f.y=0;f.vy=0}}
  else if(f.st==='throwing'){if(f.t>28)f.st='idle'}
  else if(f.st==='dizzy'){f.vx=0}
  /* physics */
  const air=f.y<0||f.vy<0;if(air){f.vy+=f.st==='air'?.26:GRAV;f.y+=f.vy}f.x+=f.vx;
  if(f.y>=0&&air){f.y=0;f.vy=0;
    if(f.st==='jump'){f.st='idle';f.vx=0}
    else if(f.st==='air'){f.st='down';f.t=0;f.vx*=.4;SFX.fall();M.shake=Math.max(M.shake,4);fx('ring',f.x,0,{r:26,life:.35,c:'#fff'});if(!f.cpu)RUMBLE.hurt()}
    else if(f.st==='atk'&&f.mv&&f.mv.sp&&f.mv.sp.k==='rise')f.mf=Math.max(f.mf,f.mv.s+f.mv.a)}
  if(f.st==='walk'&&!f.pad.held.l&&!f.pad.held.r)f.st='idle'}
/* ---------- hits ---------- */
function hurt(f){const lo=f.st==='crouch'||(f.st==='block'&&f.low)||(f.st==='atk'&&f.mv&&f.mv.crouch&&f.mf<f.mv.s),s=f.ch.hp>1.1?1.08:1;
  return{x0:f.x-12*s,x1:f.x+12*s,y0:f.y+(lo?-58:f.st==='down'?-14:-92*s),y1:f.y}}
function hitbox(f){const m=f.mv;if(!m||!m.hx||m.hop||f.mf<=m.s||f.mf>m.s+m.a)return null;const a=f.x+m.hx[0]*f.face,b=f.x+m.hx[1]*f.face;return{x0:Math.min(a,b),x1:Math.max(a,b),y0:f.y+m.hy[0],y1:f.y+m.hy[1]}}
const overlap=(a,b)=>a.x0<b.x1&&a.x1>b.x0&&a.y0<b.y1&&a.y1>b.y0;
/* standing and holding back blocks everything but lows; crouching blocks lows (and mids too, holding down-back) */
function canBlock(d,h){if(!['idle','walk','crouch','block'].includes(d.st)||d.y<0||d.frz)return false;const H=d.pad.held,B=H[backK(d)];
  if(H.d)return h==='low'||(B&&h==='mid');return!!B&&h!=='low'}
function resolve(a){const d=other(a),m=a.mv,hb=hitbox(a);if(!hb)return;if(m.hits?a.hits>=m.hits||(a.mf-m.s)%Math.ceil(m.a/m.hits)!==1:a.hit)return;
  if(d.inv>0||['getup','down','thrown','throwing','cine'].includes(d.st))return;
  const hr=hurt(d);if(!overlap(hb,hr))return;
  const cx=(Math.max(hb.x0,hr.x0)+Math.min(hb.x1,hr.x1))/2,cy=(Math.max(hb.y0,hr.y0)+Math.min(hb.y1,hr.y1))/2;
  /* throws and grabs can't be blocked, and only work on the ground */
  if(m.throw||m.grab){if(d.y<0||d.st==='air')return;a.hit=1;a.st='throwing';a.t=0;a.mv=null;d.st='thrown';d.t=0;d.face=-a.face;d.vx=a.face*2.4;d.vy=-4.2;d.y=-1;d.combo=0;
    dealDmg(a,d,m.dmg*a.ch.pow,cx,cy,true);M.shake=6;fx('splash',d.x,-40,{r:18,life:.35,c:m.grab?a.ch.sp[1].c:'#ffd84a',seed:M.t});return}
  /* a counter stance answers any strike */
  if(d.st==='atk'&&d.mv&&d.mv.counter&&d.mf>d.mv.s&&d.mf<=d.mv.s+d.mv.a&&!m.fatal){a.hit=1;a.st='hit';a.stun=30;a.mv=null;
    d.mv=Object.assign({},MOVES.cross,{key:'cnt',s:2,a:4,r:18,dmg:12,hs:30,launch:1,chain:null,to:MOVES.over.to,sfx:'hay'});d.mf=0;d.hit=0;d.inv=8;say('PATIENCE!',d.ch.sp[2].c,40);SFX.perfect();return}
  if(m.hits)a.hits++;else a.hit=1;
  if(m.fatal){startCinematic(a,d);return}
  if(canBlock(d,m.h)){d.st='block';d.stun=m.bs;d.t=0;d.low=!!d.pad.held.d;const chip=m.sp?Math.max(1,m.dmg*.12):0;if(chip)dealDmg(a,d,chip,cx,cy,false,true);
    pushApart(a,d,m.push*.9);fx('ring',cx,cy,{r:9,life:.18,c:'#fff'});SFX.block();if(!a.cpu)RUMBLE.block();if(!d.cpu)RUMBLE.dodge();return}
  if(d.armor>0){d.armor--;d.flash=8;dealDmg(a,d,m.dmg*.6,cx,cy);fx('ring',cx,cy,{r:12,life:.2,c:'#ffd84a'});SFX.block();return}
  const counter=d.st==='atk'&&d.mv&&d.mf<=d.mv.s+d.mv.a;
  let dmg=m.dmg*a.ch.pow*(counter?1.2:1);
  if(counter&&m.key==='upper'&&!a.crushUsed){a.crushUsed=true;dmg+=10;M.freeze=34;M.zoom=1.25;say('CRUSHING BLOW!','#ff3ea5',70);SFX.ko();if(!a.cpu||!d.cpu)RUMBLE.combo();fx('splash',cx,cy,{r:34,life:.6,c:'#ff3ea5',c2:'#fff',seed:M.t})}
  else if(counter&&d.combo===0){fx('ring',cx,cy,{r:18,life:.3,c:'#ffd84a'})}
  d.combo++;dmg*=Math.max(.45,1-.1*Math.max(0,d.combo-2));
  if(d.frz&&!m.freeze){d.frz=0;burst(d.x,-50,10,'#cff4ff',90)}
  dealDmg(a,d,dmg,cx,cy);d.mv=null;
  const air=d.y<0||d.st==='air';
  if(m.launch||air){d.st='air';d.t=0;d.vy=m.launch?-6.2:-3.2-Math.max(0,4-d.juggle)*.3;d.vx=a.face*(m.launch?.9:1.5);d.y=Math.min(d.y,-2);d.juggle++;if(d.juggle>6){d.vy=-2;d.vx=a.face*3}}
  else{d.st='hit';d.stun=m.hs;d.t=0;d.hitHigh=m.h!=='low';pushApart(a,d,m.push)}
  if(m.freeze&&!air){d.frz=m.freeze;fx('splash',d.x,-50,{r:22,life:.5,c:'#cff4ff',c2:'#fff',seed:M.t});say('FROZEN!','#9ae8ff',40)}
  if(m.leap||m.sp&&m.sp.k==='dash')a.vx*=.2;
  if(m.launch||m.sp)M.slow=4}
function dealDmg(a,d,dmg,cx,cy,big,chip){if(M.ph!=='fight')return;d.hp=Math.max(0,d.hp-dmg);d.dmgRound+=dmg;
  if(!chip){d.flash=6;const c=a.mv&&a.mv.sp?a.mv.sp.c:a.mv&&a.mv.hand==='f'?'#3ee8ff':'#ff3ea5';fx('splash',cx,cy,{r:big?22:dmg>9?16:11,life:.3,c,seed:M.t+a.i});burst(cx,cy,big?12:6,'#fff',70);
    const s=a.mv&&a.mv.sfx;(s==='hay'?SFX.hay:s==='cross'?SFX.cross:SFX.jab)();M.shake=Math.max(M.shake,big||dmg>9?5:2.5);
    if(!d.cpu)RUMBLE.hurt();else if(!a.cpu)(dmg>9?RUMBLE.cross:RUMBLE.jab)();
    if(M.cmb&&M.cmb.i===a.i&&d.combo>1){M.cmb.n=d.combo;M.cmb.dmg+=dmg;M.cmb.t=M.t}else M.cmb={i:a.i,n:Math.max(1,d.combo),dmg,t:M.t,max:d.max}}
  if(d.hp<=0)koRound(a,d)}
function pushApart(a,d,p){d.vx=a.face*p;if(Math.abs(d.x)>STAGE-14)a.vx=-a.face*p*.8}
function spawnProj(f){if(M.proj.some(p=>p.o===f))return;const sp=f.mv.sp,y=sp.low?-10:-68;
  M.proj.push({o:f,x:f.x+22*f.face,y,vx:(sp.arc?2.6:3.2)*f.face,vy:sp.arc?-3.2:0,grav:sp.arc?.13:0,dmg:8*f.ch.pow,sp,t:0,h:sp.low?'low':'mid'});SFX.whoosh()}
function projStep(){for(const p of M.proj){p.t++;p.x+=p.vx;p.y+=p.vy;p.vy+=p.grav;const d=other(p.o);if(p.y>0||Math.abs(p.x)>STAGE+60)p.dead=1;
    for(const q of M.proj)if(q!==p&&q.o!==p.o&&!q.dead&&!p.dead&&Math.abs(q.x-p.x)<12&&Math.abs(q.y-p.y)<20){p.dead=q.dead=1;fx('splash',p.x,p.y,{r:14,life:.3,c:'#fff',seed:M.t});SFX.block()}
    if(p.dead)continue;const h=hurt(d);
    if(d.inv<=0&&!['down','getup','thrown','cine'].includes(d.st)&&p.x>h.x0-6&&p.x<h.x1+6&&p.y>h.y0&&p.y<h.y1+2){p.dead=1;
      if(canBlock(d,p.h)){d.st='block';d.stun=10;d.low=!!d.pad.held.d;dealDmg(p.o,d,1,p.x,p.y,false,true);SFX.block();fx('ring',p.x,p.y,{r:10,life:.2,c:'#fff'})}
      else{d.combo++;const mv=p.o.mv;p.o.mv={sp:p.sp};dealDmg(p.o,d,p.dmg,p.x,p.y);p.o.mv=mv;d.mv=null;
        if(d.y<0||d.st==='air'){d.st='air';d.vy=-3;d.vx=p.vx*.4}else{d.st='hit';d.stun=18;d.vx=sgn(p.vx)*2.5;d.hitHigh=1}}}}
  M.proj=M.proj.filter(p=>!p.dead)}
/* ---------- the Fatal Haymaker: a short cinematic ---------- */
function startCinematic(a,d){a.fatalUsed=true;M.cin={a,d,t:0};d.st='hit';d.stun=999;d.combo=0;d.mv=null;a.st='cine';d.vx=a.vx=0;d.y=0;d.vy=0;M.zoom=1.3;SFX.hay()}
function cinStep(){const c=M.cin,{a,d}=c;c.t++;const hitAt=[18,46,82];
  if(hitAt.includes(c.t)){const n=hitAt.indexOf(c.t),dmg=[8,8,14][n]*a.ch.pow;M.shake=8+n*3;d.hp=Math.max(0,d.hp-dmg);d.dmgRound+=dmg;d.flash=8;d.hitHigh=n!==1;
    fx('splash',d.x-a.face*4,-60+n*12,{r:26+n*8,life:.5,c:[a.ch.sp[0].c,'#ff3ea5','#ffd84a'][n],c2:'#fff',seed:M.t+n});burst(d.x,-60,16,'#fff',100);SFX.hay();if(n===2)SFX.ko();
    if(!d.cpu)RUMBLE.hurt();else RUMBLE.hay();if(d.hp<=0)c.ko=1}
  if(c.t>=110){M.cin=null;M.zoom=1;a.st='idle';a.mv=null;if(c.ko){koRound(a,d)}else{d.st='air';d.vy=-4;d.vx=a.face*2.2;d.y=-2;d.stun=0}}}
/* ---------- rounds ---------- */
function koRound(a,d){if(M.ph!=='fight')return;M.ph='ko';M.t0=M.t;d.st='air';d.vy=-4.5;d.vx=a.face*2.6;d.y=Math.min(-2,d.y);d.mv=null;M.slow=40;M.zoom=1.15;M.roundWinner=a.i;
  say('K.O.','#ff5a5a',90);SFX.ko();SFX.crowd(.3,2.4);RUMBLE.ko()}
function timeUp(){M.ph='ko';M.t0=M.t;const[a,b]=M.F,ra=a.hp/a.max,rb=b.hp/b.max;M.roundWinner=ra===rb?-1:ra>rb?0:1;say('TIME!','#fff',90);SFX.bell(2);for(const f of M.F)if(f.st==='atk'){f.st='idle';f.mv=null}}
function afterRound(){const w=M.roundWinner;M.flawless=0;if(w>=0){M.rw[w]++;const W=M.F[w];if(W.dmgRound===0)M.flawless=1}
  const need=Math.ceil(M.bestOf/2);
  if(w>=0&&M.rw[w]>=need){M.ph='finish';M.t0=M.t;const L=M.F[1-w],W=M.F[w];L.st='dizzy';L.t=0;L.hp=Math.max(1,L.hp);L.y=0;L.vy=0;L.vx=0;L.x=clamp(L.x,-STAGE+30,STAGE-30);L.mv=null;
    W.st='idle';W.mv=null;W.y=0;W.vy=0;W.hist=[];if(Math.abs(W.x-L.x)<30)W.x=L.x-sgn(L.x-W.x||1)*30;W.face=sgn(L.x-W.x)||1;L.face=-W.face;
    say(M.flawless?'FLAWLESS VICTORY':'FINISH THEM!',M.flawless?'#7dff9a':'#ff5a5a',100);SFX.crowd(.25,2);SFX.bell(3);return}
  M.rd++;startRound();saveNow()}
/* the finisher: ↓→↓+B while they're dizzy */
function finishStep(){const w=M.F[M.roundWinner],l=M.F[1-M.roundWinner];
  if(M.fin){const c=M.fin;c.t++;w.t=c.t;
    if(c.t===24){l.st='launched';l.vy=-9;l.vx=w.face*1.2;l.spin=0;M.shake=12;SFX.ko();SFX.crowd(.35,2.8);RUMBLE.ko();fx('splash',l.x,-70,{r:40,life:.7,c:'#ffd84a',c2:'#fff',seed:5});burst(l.x,-70,24,'#fff',120)}
    if(l.st==='launched'){l.vy+=.1;l.y+=l.vy;l.x+=l.vx;l.spin+=.3;if(c.t===100){fx('star',l.x,-260,{r:30,life:.8,c:'#fff'});SFX.perfect()}}
    if(c.t===60)say('KNOCKOUT FINISHER!','#ffd84a',130);if(c.t>190)endMatch(w.i,true);return}
  if(M.t-M.t0<50)return;
  if(w.cpu){if(!M.cpuFin&&M.t-M.t0>80){M.cpuFin=1;if(rnd()<.3+M.lvl*.12){doFinisher(w,l);return}}if(M.t-M.t0>110){plainWin(w,l);return}}
  else if(w.pad.tap.b&&motion(w,['D|DF|DB','F|DF','D|DF|DB'],45)){doFinisher(w,l);return}
  else if(w.pad.tap.a||w.pad.tap.b){plainWin(w,l);return}
  if(M.t-M.t0>420)plainWin(w,l)}
function plainWin(w,l){l.st='air';l.vy=-3;l.vx=w.face*2;l.y=-2;SFX.cross();M.ph='over';M.t0=M.t;say(winName(w)+' WINS','#ffd84a',150)}
const winName=f=>(f.id==='milo'?nick():PEOPLE[f.id].name.split(' ').slice(-1)[0]);
function doFinisher(w,l){M.fin={t:0};w.st='fin';w.t=0;w.face=sgn(l.x-w.x)||w.face;w.x=l.x-w.face*30;M.zoom=1.25;M.msg=null;SFX.whoosh()}
function endMatch(wi,fin){if(M.ph==='done')return;M.ph='done';M.res={winner:wi,fin:!!fin,flawless:!!M.flawless};onMatchEnd(M.res)}
/* ---------- each step of the match ---------- */
const CAMV={x:0};
function matchStep(){if(!M||M.ph==='done')return;M.t++;
  for(const f of M.F){if(f.cpu)aiTick(f);else humanPad(f)}
  if(M.freeze>0){M.freeze--;fxTick(1/60);return}
  if(M.ph==='intro'){if(M.t===60){say('FIGHT!','#ffd84a',40);SFX.crowd(.16,1)}if(M.t>=72)M.ph='fight';for(const f of M.F){f.t++;recordDir(f);f.P=lerpP(f.P,poseOf(f),.4)}fxTick(1/60);camTick();return}
  if(M.cin){cinStep();for(const f of M.F){f.t++;f.P=lerpP(f.P,poseOf(f),.5)}fxTick(1/60);camTick();return}
  if(M.slow>0&&M.t%2){M.slow--;fxTick(1/120);return}
  if(M.ph==='fight'){for(const f of M.F)control(f)}
  else if(M.ph==='finish'){recordDir(M.F[M.roundWinner]);finishStep()}
  for(const f of M.F){if(['cine','fin','launched'].includes(f.st))continue;fighterStep(f)}
  /* facing and spacing */
  const[a,b]=M.F;for(const f of M.F){if(['idle','walk','crouch','block'].includes(f.st)&&f.y>=0)f.face=sgn(other(f).x-f.x)||f.face}
  if(M.ph==='fight'){resolve(a);resolve(b);projStep()}
  const busy=f=>['thrown','throwing','down','launched','fin'].includes(f.st);
  const dx=b.x-a.x,minD=22;if(Math.abs(dx)<minD&&Math.abs(a.y-b.y)<50&&!busy(a)&&!busy(b)){const push=(minD-Math.abs(dx))/2*(sgn(dx)||(a.face>0?1:-1));a.x-=push;b.x+=push}
  for(const f of M.F)if(f.st!=='launched')f.x=clamp(f.x,-STAGE+10,STAGE-10);
  const span=Math.min(BW/M.zoom-26,STAGE*2);if(Math.abs(b.x-a.x)>span&&!busy(a)&&!busy(b)){const mid=(a.x+b.x)/2,s=sgn(b.x-a.x);a.x=mid-s*span/2;b.x=mid+s*span/2}
  for(const f of M.F)f.P=lerpP(f.P,poseOf(f),f.st==='atk'?.62:.38);
  if(M.ph==='fight'){M.timer--;if(M.timer<=0)timeUp()}
  if(M.ph==='ko'&&M.t-M.t0>150)afterRound();
  if(M.ph==='over'&&M.t-M.t0>150)endMatch(M.roundWinner,false);
  if(M.shake>0)M.shake=Math.max(0,M.shake-.5);if(M.zoom>1&&!M.cin&&!M.fin&&M.ph==='fight')M.zoom=Math.max(1,M.zoom-.01);
  fxTick(1/60);camTick()}
function camTick(){const[a,b]=M.F,half=BW/2/M.zoom,want=clamp((a.x+b.x)/2,-STAGE-40+half,STAGE+40-half);CAMV.x=lerp(CAMV.x,half*2>=STAGE*2+80?0:want,.15)}
