/* ================= the fight: a jab duel =================
   Runs at a fixed 60 steps a second. Each boxer starts on their own side of the ring.
   → throws a jab: you lunge across, and it lands about 0.8 s later (a touch quicker for fast fighters, slower for
     heavy ones). The jab itself can't be punished.
   ← blocks, but only while a jab is coming at you. Press it with no jab coming and you're stunned for 5 seconds.
   A blocked jab sends the jabber home, and they can't jab again for 1 second while the blocker can.
   A jab that lands gives you 1 second to press B. Then you have 1 second to press A four times: each press is a
   punch of a 4-hit combo. About ten full combos knock a fighter out. ▲ and ▼ do nothing yet. */
const STAGE=150,HOME=62;
const TIME={cool:60,bwin:60,awin:60,stun:300,back:16,clash:30};
let M=null;
const PT={};/* buttons pressed since the last step */
function newMatch(o){FX.length=0;const train=o.mode==='train';M={mode:o.mode||'vs',train,venue:o.venue,p1:o.p1,p2:o.p2,lvl:o.lvl||SAVE.cpu||3,bestOf:train?99:o.bestOf||SAVE.rounds||3,
    rw:o.rw?o.rw.slice():[0,0],rd:o.rd||1,F:[],ph:'intro',t:0,timer:0,msg:null,shake:0,freeze:0,zoom:1,slow:0,res:null,fin:null,roundWinner:-1,
    tr:train?{dummy:'stand',refill:true,last:null}:null};
  M.F=[mkFighter(0,o.p1,false),mkFighter(1,o.p2,true)];M.F[1].alt=o.p1===o.p2;if(o.cpu1)M.F[0].cpu=true;CAMV.x=0;startRound();if(o.hp)M.F.forEach((f,i)=>f.hp=Math.min(f.max,o.hp[i]||f.max))}
/* each fighter's body in ring units: standing height, half-width, reach */
function geoOf(id,ch){const b=PEOPLE[id].build,S=b.s*.9,L=rigOf(b);return{H:(40+L.torso+L.neck+L.head*2.1)*S+3,HW:b.w*.45*S+1.5,RF:(1+(S/.9-1)*.6)*(ch.reach||1),VS:1+(S/.9-1)*.3}}
/* how long their jab takes to land (steps), and how much a full combo takes off */
const jabTime=ch=>Math.round(clamp(48/Math.sqrt(ch.spd),42,56));
const comboDmg=ch=>10*(1+(ch.pow-1)*.5);
const combosToKO=ch=>Math.round(100*ch.hp/10);
function mkFighter(i,id,cpu){const ch=ROSTER[RIX[id]];return Object.assign({i,id,ch,cpu,dir:i?-1:1,x:0,y:0,vx:0,vy:0,face:i?-1:1,hp:100*ch.hp,max:100*ch.hp,st:'idle',t:0,
  cool:0,stunT:0,hits:0,hitN:0,punchT:0,punchN:0,jabId:0,W:jabTime(ch),pad:{tap:{}},P:Object.assign({},GUARD),wph:0,ai:{t:60},dmgRound:0,refillT:0,flash:0},geoOf(id,ch))}
const homeX=f=>-f.dir*HOME;
function startRound(){M.F.forEach(f=>Object.assign(f,{x:homeX(f),y:0,vx:0,vy:0,face:f.dir,hp:f.max,st:'idle',t:0,cool:0,stunT:0,hits:0,punchT:0,dmgRound:0,P:Object.assign({},GUARD),ai:{t:50+Math.round(rnd()*40)}}));
  M.ph='intro';M.t=M.train?40:0;M.timer=SAVE.time===0||M.train?Infinity:(SAVE.time||60)*60;M.fin=null;M.res=null;M.zoom=1;M.cpuFin=0;
  M.msg={s:M.train?'TRAINING':'ROUND '+M.rd,t:M.t,d:46,c:'#fff'};SFX.crowd(.12,1.4)}
const other=f=>M.F[1-f.i];
function say(s,c='#ffd84a',d=70,small=false){M.msg={s,t:M.t,d,c,small}}
const tell=(s,c,d)=>say(s,c,d,true);
function note(s,c){if(M.tr)M.tr.last={s,c,t:M.t}}

/* ---------- input: → jab, ← block, B combo, A punch ---------- */
function humanPad(f){f.pad={tap:{jab:!!PT.right,block:!!PT.left,b:!!PT.b,a:!!PT.a}}}
function setSt(f,st){f.st=st;f.t=0}
function goHome(f){f.x0=f.x;setSt(f,'back')}
function stun(f){f.stunT=TIME.stun;setSt(f,'stun');SFX.lose();if(!f.cpu){RUMBLE.hurt();tell('STUNNED!','#ff5a5a',60)}else tell('OPEN!','#7dff9a',50);note(f.cpu?'DUMMY STUNNED':'TOO EARLY: STUNNED 5 S','#ff5a5a')}
function act(f){const o=other(f),p=f.pad.tap;if(f.stunT>0)return;
  if(f.st==='idle'){
    if(p.block){if(o.st==='lunge'){setSt(f,'guard');note('BLOCK AT '+(o.t/60).toFixed(2)+' S','#9ae8ff')}else stun(f);return}
    if(p.jab&&f.cool<=0){setSt(f,'lunge');f.x0=f.x;f.jabId++;SFX.whoosh();if(!f.cpu)RUMBLE.count()}}
  else if(f.st==='jabbed'&&p.b){setSt(f,'combo');f.hits=0;f.punchT=0;SFX.combo();if(!f.cpu)RUMBLE.dodge()}
  else if(f.st==='combo'&&p.a&&f.hits<4)punch(f,o)}
/* the jab arrives: blocked, a clash, or it lands */
function jabLands(f,o){const cx=(f.x+o.x)/2,cy=-70*o.VS;
  if(o.st==='guard'){setSt(o,'block');f.cool=TIME.cool;goHome(f);fx('ring',cx,cy,{r:12,life:.25,c:'#fff'});SFX.block();if(!o.cpu)RUMBLE.block();
    if(!o.cpu)tell('BLOCKED!','#9ae8ff',40);else if(!f.cpu)tell('BLOCKED','#c8c0e0',40);note(o.cpu?'BLOCKED BY THE DUMMY':'BLOCKED!','#9ae8ff');return}
  if(o.st==='lunge'&&o.t>=o.W-2){goHome(f);goHome(o);f.cool=o.cool=TIME.clash;fx('splash',cx,cy,{r:16,life:.3,c:'#fff',seed:M.t});SFX.block();tell('CLASH!','#fff',36);return}
  setSt(f,'jabbed');setSt(o,'hit');o.hitN=0;o.flash=6;M.shake=Math.max(M.shake,2.5);fx('splash',o.x-o.dir*4,cy,{r:12,life:.3,c:'#3ee8ff',seed:M.t});burst(o.x,cy,6,'#fff',60);SFX.jab();
  if(!o.cpu)RUMBLE.hurt();else if(!f.cpu){RUMBLE.jab();tell('B!','#ffd84a',30)}note(f.cpu?'YOU GOT HIT':'JAB LANDS: PRESS B','#ffd84a')}
/* one punch of the combo */
function punch(f,o){f.hits++;f.punchN=f.hits;f.punchT=10;o.hitN=f.hits;o.t=0;setSt(o,'reel');const last=f.hits===4,dmg=comboDmg(f.ch)/4*(last?1.3:.9);
  o.hp=Math.max(M.train?1:0,o.hp-dmg);o.dmgRound+=dmg;o.flash=6;o.refillT=0;const cy=(f.hits===3?-46:-74)*o.VS,c=['#3ee8ff','#ff3ea5','#ffd84a','#ff7a3a'][f.hits-1];
  fx('splash',o.x-o.dir*4,cy,{r:last?22:13,life:.32,c,c2:last?'#fff':null,seed:M.t+f.hits});burst(o.x,cy,last?12:6,'#fff',70);(last?SFX.hay:f.hits%2?SFX.cross:SFX.jab)();
  M.shake=Math.max(M.shake,last?6:3);if(last)M.freeze=6;if(!o.cpu)RUMBLE.hurt();else if(!f.cpu)(last?RUMBLE.cross:RUMBLE.jab)();
  if(o.hp<=0&&!M.train){koRound(f,o);return}}
function endCombo(f,o){goHome(f);goHome(o);if(f.hits>=2)tell(f.hits+' HIT COMBO','#ffd84a',50);note(f.hits+' OF 4 PUNCHES',f.hits===4?'#7dff9a':'#ffd84a')}
/* ---------- each step ---------- */
function fighterStep(f){const o=other(f);f.t++;if(f.cool>0)f.cool--;if(f.flash>0)f.flash--;if(f.punchT>0)f.punchT--;
  if(f.stunT>0){f.stunT--;if(f.stunT===0&&f.st==='stun')setSt(f,'idle')}
  switch(f.st){
    case'lunge':{const k=Math.min(1,f.t/f.W),tx=o.x-f.dir*(o.HW+f.HW+14*f.RF);f.x=lerp(f.x0,tx,ease(k));f.wph+=.3;if(f.t>=f.W&&M.ph==='fight')jabLands(f,o);break}
    case'guard':if(o.st!=='lunge'&&f.t>12)setSt(f,'idle');break;
    case'block':if(f.t>18)setSt(f,'idle');break;
    case'back':{const k=Math.min(1,f.t/TIME.back);f.x=lerp(f.x0,homeX(f),ease(k));f.wph-=.3;if(f.t>=TIME.back){f.x=homeX(f);setSt(f,f.stunT>0?'stun':'idle')}break}
    case'jabbed':if(f.t>=TIME.bwin){goHome(f);goHome(o);note('TOO SLOW ON B','#c8c0e0')}break;
    case'combo':if(f.t>=TIME.awin||f.hits>=4&&f.punchT<=0)endCombo(f,o);break}
  /* knockouts fly, land and lie there */
  if(['air','down','dizzy'].includes(f.st)){const air=f.y<0||f.vy<0;if(air){f.vy+=.32;f.y+=f.vy}f.x+=f.vx;f.x=clamp(f.x,-STAGE+10,STAGE-10);
    if(f.y>=0&&air){f.y=0;f.vy=0;if(f.st==='air'){setSt(f,'down');f.vx*=.4;SFX.fall();M.shake=Math.max(M.shake,4);fx('ring',f.x,0,{r:26,life:.35,c:'#fff'});if(!f.cpu)RUMBLE.hurt()}}
    if(f.st==='down')f.vx*=.8}}
/* ---------- rounds ---------- */
function koRound(a,d){if(M.ph!=='fight')return;M.ph='ko';M.t0=M.t;setSt(d,'air');d.vy=-4.5;d.vx=a.dir*2.6;d.y=-2;goHome(a);M.slow=40;M.zoom=1.15;M.roundWinner=a.i;
  say('K.O.','#ff5a5a',90);SFX.ko();SFX.crowd(.3,2.4);RUMBLE.ko()}
function timeUp(){M.ph='ko';M.t0=M.t;const[a,b]=M.F,ra=a.hp/a.max,rb=b.hp/b.max;M.roundWinner=ra===rb?-1:ra>rb?0:1;say('TIME!','#fff',90);SFX.horn();
  for(const f of M.F)if(!['idle','stun'].includes(f.st))goHome(f)}
function afterRound(){const w=M.roundWinner;M.flawless=0;if(w>=0){M.rw[w]++;if(M.F[w].dmgRound===0)M.flawless=1}
  const need=Math.ceil(M.bestOf/2);
  if(w>=0&&M.rw[w]>=need){M.ph='finish';M.t0=M.t;const L=M.F[1-w],W=M.F[w];setSt(L,'dizzy');L.hp=Math.max(1,L.hp);L.y=0;L.vy=0;L.vx=0;L.x=homeX(L)*.4;L.stunT=0;
    setSt(W,'idle');W.x=L.x-W.dir*(W.HW+L.HW+16);W.face=W.dir;L.face=L.dir;
    say(M.flawless?'FLAWLESS VICTORY':'FINISH THEM!',M.flawless?'#7dff9a':'#ff5a5a',100);SFX.crowd(.25,2);SFX.horn();return}
  M.rd++;startRound();saveNow()}
/* the finisher: press B while they're dizzy (A just ends it) */
function finishStep(){const w=M.F[M.roundWinner],l=M.F[1-M.roundWinner];
  if(M.fin){const c=M.fin;c.t++;w.t=c.t;
    if(c.t===24){setSt(l,'launched');l.vy=-9;l.vx=w.dir*1.2;l.spin=0;M.shake=12;SFX.ko();SFX.crowd(.35,2.8);RUMBLE.ko();fx('splash',l.x,-70,{r:40,life:.7,c:'#ffd84a',c2:'#fff',seed:5});burst(l.x,-70,24,'#fff',120)}
    if(l.st==='launched'){l.vy+=.1;l.y+=l.vy;l.x+=l.vx;l.spin+=.3;if(c.t===100){fx('star',l.x,-260,{r:30,life:.8,c:'#fff'});SFX.perfect()}}
    if(c.t===60)say('KNOCKOUT FINISHER!','#ffd84a',130);if(c.t>190)endMatch(w.i,true);return}
  if(M.t-M.t0<36)return;
  if(w.cpu){if(!M.cpuFin&&M.t-M.t0>60){M.cpuFin=1;if(rnd()<.3+M.lvl*.12){doFinisher(w,l);return}}if(M.t-M.t0>90){plainWin(w,l);return}}
  else if(w.pad.tap.b){doFinisher(w,l);return}
  else if(w.pad.tap.a){plainWin(w,l);return}
  if(M.t-M.t0>420)plainWin(w,l)}
function plainWin(w,l){setSt(l,'air');l.vy=-3;l.vx=w.dir*2;l.y=-2;SFX.cross();M.ph='over';M.t0=M.t;say(winName(w)+' WINS','#ffd84a',150)}
const winName=f=>(f.id==='milo'?nick():PEOPLE[f.id].name.split(' ').slice(-1)[0]);
function doFinisher(w,l){M.fin={t:0};setSt(w,'fin');M.zoom=1.25;M.msg=null;SFX.whoosh()}
function endMatch(wi,fin){if(M.ph==='done')return;M.ph='done';M.res={winner:wi,fin:!!fin,flawless:!!M.flawless};onMatchEnd(M.res)}
/* ---------- each step of the match ---------- */
const CAMV={x:0};
function matchStep(){if(!M||M.ph==='done')return;M.t++;
  for(const f of M.F){if(f.cpu)aiTick(f);else humanPad(f)}
  if(M.freeze>0){M.freeze--;fxTick(1/60);return}
  if(M.ph==='intro'){if(M.t===46){say('FIGHT!','#ffd84a',36);SFX.horn();SFX.crowd(.16,1)}if(M.t>=56)M.ph='fight';for(const f of M.F){f.t++;f.P=lerpP(f.P,poseOf(f),.4)}fxTick(1/60);camTick();return}
  if(M.slow>0&&M.t%2){M.slow--;fxTick(1/120);return}
  if(M.ph==='fight'){/* whoever started their jab first gets to land it first */const[a,b]=M.F;if(b.st==='lunge'&&(a.st!=='lunge'||b.t>a.t)){act(b);act(a)}else{act(a);act(b)}}
  else if(M.ph==='finish')finishStep();
  for(const f of M.F){if(['fin','launched'].includes(f.st))continue;fighterStep(f)}
  for(const f of M.F)f.P=lerpP(f.P,poseOf(f),['combo','lunge','reel'].includes(f.st)?.7:.5);
  if(M.ph==='fight'){M.timer--;if(M.timer<=0)timeUp()}
  if(M.train)trainStep();
  if(M.ph==='ko'&&M.t-M.t0>115)afterRound();
  if(M.ph==='over'&&M.t-M.t0>110)endMatch(M.roundWinner,false);
  if(M.shake>0)M.shake=Math.max(0,M.shake-.5);if(M.zoom>1&&!M.fin&&M.ph==='fight')M.zoom=Math.max(1,M.zoom-.01);
  fxTick(1/60);camTick()}
/* the training room: health comes back between exchanges */
function trainStep(){for(const f of M.F){if(['idle','back'].includes(f.st)&&f.hp<f.max){if(++f.refillT>40&&M.tr.refill)f.hp=f.max}else f.refillT=0}}
function camTick(){const[a,b]=M.F,half=BW/2/M.zoom,want=M.zoom>1?clamp((a.x+b.x)/2,-STAGE-40+half,STAGE+40-half):0;CAMV.x=lerp(CAMV.x,want,.15)}
