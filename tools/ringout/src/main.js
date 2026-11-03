/* ================= the flow of the game ================= */
const SAVED=store.get('settings',{});G.stocks=clamp(SAVED.stocks||3,1,5);G.level=clamp(SAVED.level||3,1,9);G.wins=store.get('wins',{});
G.menu={sel:0};G.sel={step:0,cur:[0,null],picked:[0,1]};G.stageSel=0;G.cpus=[];
function toTitle(){G.state='title';G.menu.sel=0;G.titleStage=buildStage(STAGES[0]);G.titleFighters=[pick(ROSTER),pick(ROSTER)];music(true,'menu')}
function toSelect(step){G.state='select';G.sel.step=step;music(true,'menu')}
function toStage(){G.state='stage';G.stageThumbs=STAGES.map(buildStage)}
/* a mirror match gives the rival other colours */
function hue(c,deg){let[r,g,b]=hx(c).map(v=>v/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;let h=0,s=0;
  if(d){s=d/(1-Math.abs(2*l-1));h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}h=(h+deg+360)%360;
  const C=(1-Math.abs(2*l-1))*s,X=C*(1-Math.abs((h/60)%2-1)),m=l-C/2,[a,bb,cc]=h<60?[C,X,0]:h<120?[X,C,0]:h<180?[0,C,X]:h<240?[0,X,C]:h<300?[X,0,C]:[C,0,X];
  return'#'+[a,bb,cc].map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('')}
function altLook(ch){const lowS=c=>{const[r,g,b]=hx(c);return Math.max(r,g,b)-Math.min(r,g,b)<40};
  return Object.assign({},ch,{id:ch.id+'_alt',suit:lowS(ch.suit)?'#3a8a5a':hue(ch.suit,150),acc:lowS(ch.acc)?'#ffb030':hue(ch.acc,150)})}
function startFight(i1,i2,si,opts={}){if(targetH()!==H)applySize();
  G.stage=buildStage(STAGES[si]);G.proj=[];G.blasts=[];G.tboxes=[];G.parts=[];G.texts=[];G.shake=0;G.slow=0;G.matchEnd=null;G.kobeam=null;G.comboShow=null;
  const c1=ROSTER[i1],c2=i1===i2?altLook(ROSTER[i2]):ROSTER[i2],S=G.stage.main;
  const p1=new Fighter(c1,0,opts.p1cpu?makePad():IN,!!opts.p1cpu),p2=new Fighter(c2,1,makePad(),true);
  G.fighters=[p1,p2];p1.spawnAt(S.l+30,S.y,1);p2.spawnAt(S.r-30,S.y,-1);
  G.cpus=[new CPU(p2,opts.level||G.level)];if(opts.p1cpu)G.cpus.push(new CPU(p1,opts.p1level||G.level));
  G.state='ready';G.readyT=opts.quick?1:170;G.banner=null;clearPresses();music(true,'fight')}
function stepFight(){
  for(const c of G.cpus)c.think();
  for(const f of G.fighters)f.update();
  resolveHits();for(const p of G.proj)updProj(p);G.proj=G.proj.filter(p=>p.life>0);updBlasts();updFx();
  for(const c of G.cpus)c.clear();
  if(G.matchEnd&&--G.matchEnd.t<=0)toResults()}
function toResults(){const loser=G.matchEnd.loser,winner=G.fighters.find(f=>f!==loser);G.result={winner,loser};G.state='result';G.resT=50;
  if(!winner.cpu){G.wins[winner.ch.id.replace('_alt','')]=(G.wins[winner.ch.id.replace('_alt','')]||0)+1;store.set('wins',G.wins)}SFX.win();music(false)}
function update(){G.frame++;IN.frame++;let keep=false;
  switch(G.state){
  case'title':titleInput();break;
  case'select':selectInput();break;
  case'stage':stageInput();break;
  case'ready':G.readyT--;for(const f of G.fighters){f.anim++}updFx();
    if(G.readyT%45===0&&G.readyT>0)SFX.beep();
    if(G.readyT<=0){G.state='fight';G.banner={s:'GO!',t:40};SFX.go()}break;
  case'fight':
    if(IN.pressed.start&&!G.matchEnd){G.state='pause';music(false);SFX.move();break}
    if(G.banner&&--G.banner.t<=0)G.banner=null;
    if(G.matchEnd&&!G.matchEnd.shown){G.matchEnd.shown=1;G.banner={s:'GAME!',t:120};G.slow=60}
    if(G.slow>0){G.slow--;if(G.frame%2){updFx();keep=true;break}}
    stepFight();break;
  case'pause':if(IN.pressed.a||IN.pressed.start){G.state='fight';music(true,'fight');SFX.move()}else if(IN.pressed.b){SFX.back();toSelect(0)}break;
  case'result':if(G.resT>0)G.resT--;updFx();resultInput();break}
  if(IN.pressed.select&&G.state!=='select'&&!keep){setMute(!muted);if(!muted){unlock();SFX.pick()}}
  if(!keep)clearPresses()}
function render(now){ctx.save();ctx.setTransform(1,0,0,1,0,0);
  switch(G.state){
  case'title':drawTitle(now);break;
  case'select':drawSelect(now);break;
  case'stage':drawStageSel(now);break;
  case'result':drawResults(now);break;
  default:drawMatch(now)}
  ctx.restore()}
function drawMatch(now){const st=G.stage;let sx=0,sy=0;if(G.shake>0){sx=Math.round((rnd()-.5)*G.shake);sy=Math.round((rnd()-.5)*G.shake)}
  ctx.translate(sx,sy);ctx.drawImage(st.bg,0,0);drawStageFx(st,now);drawSoftPlats(st,now);
  for(const p of G.proj)drawProj(p,now);
  const order=[...G.fighters].sort((a,b)=>(a.mv?1:0)-(b.mv?1:0));for(const f of order)drawFighter(f,now);
  drawFx(now);drawKoBeam();ctx.setTransform(1,0,0,1,0,0);
  for(const f of G.fighters)drawOffscreen(f);
  drawHud(now);
  if(G.comboShow&&G.comboShow.n>=3){const c=G.comboShow;txt(c.n+' HIT COMBO!',W/2,Math.round(H*.16),'#ffd84a',1,'c',K)}
  if(G.state==='ready'){const n=Math.ceil(G.readyT/45);if(n<=3&&n>=1){const k=(G.readyT%45)/45;txt(String(n),W/2,Math.round(H*.3),'#ffffff',4+Math.round(k*2),'c',K)}
    else{txt(G.fighters[0].ch.name,W/2,Math.round(H*.24),TAGC[0],2,'c',K);txt('VS',W/2,Math.round(H*.24)+18,'#ffd84a',1,'c',K);txt(G.fighters[1].ch.name,W/2,Math.round(H*.24)+30,TAGC[1],2,'c',K)}}
  if(G.banner)txt(G.banner.s,W/2,Math.round(H*.3),G.banner.s==='GO!'?'#a8ff6a':'#ffd84a',4,'c',K);
  if(G.slow>0&&!G.matchEnd){ctx.fillStyle='rgba(106,240,255,.08)';ctx.fillRect(0,0,W,H)}
  if(G.state==='pause')drawPause(now)}
/* ================= buttons ================= */
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',z:'a',Z:'a',x:'b',X:'b',Enter:'start',Shift:'select',' ':'a',k:'a',K:'a',j:'b',J:'b',p:'start',P:'start',Escape:'start',m:'select',M:'select'};
addEventListener('keydown',e=>{const b=KEYMAP[e.key];if(!b)return;e.preventDefault();unlock();if(e.repeat)return;input(b,true)});
addEventListener('keyup',e=>{const b=KEYMAP[e.key];if(b)input(b,false)});
addEventListener('blur',()=>{for(const b of BTN)IN.held[b]=false});
for(const[id,btn]of[['bU','up'],['bD','down'],['bL','left'],['bR','right'],['bA','a'],['bB','b'],['bS','start']]){const el=document.getElementById(id);
  el.addEventListener('pointerdown',e=>{e.preventDefault();unlock();try{el.setPointerCapture(e.pointerId)}catch(_){}el.classList.add('on');input(btn,true)});
  const up=()=>{el.classList.remove('on');input(btn,false)};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up)}
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(G.state==='fight'){G.state='pause'}music(false)}});
addEventListener('resize',()=>{fit();if(G.state!=='fight'&&G.state!=='ready'&&G.state!=='pause'&&targetH()!==H){applySize();fit();if(G.state==='title')G.titleStage=buildStage(STAGES[0]);if(G.state==='stage')G.stageThumbs=STAGES.map(buildStage);if(G.state==='result')G.stage=buildStage(G.stage.def)}});
/* ================= the console ================= */
window.ZPCart={title:'Ring Out',
  input(btn,down){unlock();input(btn,down)},
  /* power switch: on a menu, just turn off; mid-fight, pause and let the console ask */
  home(){if(G.state==='fight'||G.state==='ready'||G.state==='pause'){if(G.state!=='pause'){G.state='pause';music(false)}return'ask'}return true},
  snapshot(){return null}};
if(ZP&&ZP.cartReady)try{ZP.cartReady(window.ZPCart)}catch(e){}
/* ================= go ================= */
applySize();fit();toTitle();
let last=performance.now(),acc=0;const STEP=1000/60;
function frame(now){acc+=Math.min(250,now-last);last=now;let n=0;if(window.__RO&&window.__RO.freeze)acc=0;while(acc>=STEP&&n<6){update();acc-=STEP;n++}if(n>=6)acc=0;render(now);requestAnimationFrame(frame)}
requestAnimationFrame(t=>{last=t;requestAnimationFrame(frame)});
/* hooks for automated tests only (the address must end in #rotest) */
if(/rotest/.test(location.hash))window.__RO={G,IN,input,update,render:()=>render(performance.now()),startFight,stepFight,ROSTER,STAGES,Fighter,CPU,makePad,applySize,kbSpeed,clearPresses,
  get H(){return H},get VS(){return VS}};
