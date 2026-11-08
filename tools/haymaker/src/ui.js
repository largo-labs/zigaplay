/* ================= screens: helpers, the fight and its HUD, pause, results ================= */
let SCR='title',MSEL=0,TT=0,BACKTO='title',MSG=null;
function go(s,sel=0){SCR=s;MSEL=sel;SFX.move()}
function toast(s){MSG={s,t:2}}
function menuNav(n){const d=menuDir();if(d==='up'){MSEL=(MSEL+n-1)%n;SFX.move()}else if(d==='down'){MSEL=(MSEL+1)%n;SFX.move()}return d}
function drawMenu(items,x,y,px,gap,al='center'){items.forEach((s,i)=>{const on=i===MSEL,yy=y+i*gap;if(on){const w=tw(s,px,700)+26*U;rrect(al==='center'?x-w/2:x-10*U,yy-3*U,w,px*U+7*U,6*U);ctx.fillStyle='rgba(255,216,74,.18)';ctx.fill()}
  text((on?'▸ ':'')+s,x,yy,px,on?'#ffd84a':'#e8e2d0',al,'#120c14',700)})}
function help(s){textB(s,SW/2,SH-15*U,8,'rgba(255,255,255,.85)','center','#000',600)}
/* a paint splash behind big words (screen pixels) */
function splashUI(x,y,r,col,seed=1){ctx.save();ctx.translate(x,y);ctx.beginPath();const n=14;for(let i=0;i<=n;i++){const a=i/n*TAU,rr_=r*(.72+.42*hash(seed*13+i)),px=Math.cos(a)*rr_*1.5,py=Math.sin(a)*rr_*.62;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();
  ctx.fillStyle=col;ctx.fill();ctx.lineWidth=3*U;ctx.strokeStyle='#0e0a14';ctx.stroke();for(let i=0;i<4;i++){const dx=(hash(seed*7+i)-.5)*r*2.2,l=r*(.3+hash(seed+i*3)*.5);ctx.beginPath();ctx.ellipse(dx,r*.5+l/2,r*.06,l/2,0,0,TAU);ctx.fill();ctx.stroke()}ctx.restore()}
function dimAll(a){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle=`rgba(6,4,14,${a})`;ctx.fillRect(0,0,SW,SH)}
function circ(x,y,r,fill,edge,lw=2){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill()}if(edge){ctx.lineWidth=(lw+2.6)*U;ctx.strokeStyle='#0e0a14';ctx.stroke();ctx.lineWidth=lw*U;ctx.strokeStyle=edge;ctx.stroke()}}
/* portraits (busts in fighting gear), cached at their drawn size */
const PC=new Map();
function portraitC(id,ex,x,y,size,bg,o={}){const s=Math.round(size*DPR);if(s<4)return;const key=[id,ex,s,bg,o.alt?1:0,id==='milo'?JSON.stringify(SAVE.look):''].join('|');let c=PC.get(key);
  if(!c){if(PC.size>48)PC.clear();G=pbx;pbx.setTransform(4,0,0,4,0,0);pbx.clearRect(0,0,72,72);
    if(bg){pbx.fillStyle=bg;pbx.fillRect(0,0,72,72);G.globalAlpha=.18;for(let i=-72;i<72;i+=7)LN(i,72,i+72,0,2.4,'#fff');G.globalAlpha=1}
    drawBust(id,36,52,1.55,ex,Object.assign({fighter:1},o));G=bx;c=document.createElement('canvas');c.width=c.height=s;const cc=c.getContext('2d');cc.imageSmoothingEnabled=true;cc.imageSmoothingQuality='high';cc.drawImage(PB,0,0,s,s);PC.set(key,c)}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(c,Math.round(x*DPR),Math.round(y*DPR));ctx.restore()}
const fname=id=>id==='milo'?'MILO "'+nick()+'"':PEOPLE[id].name;
const short=id=>PEOPLE[id].name.split(' ').slice(id==='tide'?1:-1).join(' ').replace('TIDE BARAKA','BIG TIDE');

/* ---------- the fight ---------- */
let ACC=0;
function fightTick(dt){if(!M){go('title');return}if(TAP('start')&&M.ph!=='done'){SFX.back();go('pause');return}
  for(const k in RAW.tap)if(RAW.tap[k])PT[k]=true;
  ACC=Math.min(ACC+dt,5/60);while(ACC>=1/60-1e-4&&SCR==='fight'){ACC-=1/60;matchStep();for(const k in PT)delete PT[k]}}
function fightDraw(){drawMatch();blit();fightHud()}
function hpBar(x,y,w,h,f,right){if(f.lag==null||f.hp>f.lag)f.lag=f.hp;else if(f.combo===0&&f.st!=='hit'&&f.st!=='air')f.lag=Math.max(f.hp,f.lag-f.max*.012);
  const v=clamp(f.hp/f.max,0,1),lg=clamp(f.lag/f.max,0,1),k=Math.max(2,3*U);
  ctx.save();ctx.translate(x,y);if(right){ctx.translate(w,0);ctx.scale(-1,1)}
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w,0);ctx.lineTo(w-h*.5,h);ctx.lineTo(0,h);ctx.closePath();ctx.fillStyle='rgba(0,0,0,.55)';ctx.translate(k,k);ctx.fill();ctx.translate(-k,-k);
  ctx.fillStyle='#2a1018';ctx.fill();ctx.save();ctx.clip();ctx.fillStyle='#fff';ctx.fillRect(0,0,w*lg,h);
  const g=ctx.createLinearGradient(0,0,0,h);const c=v>.5?['#ffe680','#e8a81a']:v>.3?['#ffc060','#e8661a']:['#ff8a6a','#d8222b'];g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);ctx.fillStyle=g;ctx.fillRect(0,0,w*v,h);
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(0,1.5*U,w*v,h*.22);ctx.restore();ctx.lineWidth=2.4*U;ctx.strokeStyle='#0e0a14';ctx.stroke();ctx.restore()}
function fightHud(){ctx.setTransform(DPR,0,0,DPR,0,0);const m=M,tw_=34*U,w=(SW-14*U-tw_)/2,y=7*U,h=13*U,need=Math.ceil(m.bestOf/2);
  m.F.forEach((f,i)=>{const x=i?SW-7*U-w:7*U,al=i?'right':'left',ax=i?SW-7*U:7*U;hpBar(x,y,w,h,f,i);
    text(short(f.id),ax+(i?-4:4)*U,y+h+2*U,9,'#fff',al,'#0e0a14',700);
    for(let k=0;k<need;k++){const cx=i?x+w-6*U-k*12*U:x+6*U+k*12*U;circ(cx,y+h+20*U,4*U,k<m.rw[i]?'#ffd84a':'rgba(0,0,0,.5)','#fff',1.4)}
    if(f.hp<=f.max*.3&&!f.fatalUsed&&m.ph==='fight'){const p=.6+.4*Math.sin(TT*8);ctx.globalAlpha=p;text(f.cpu?'FATAL READY':'FATAL ▼+A+B',ax+(i?-4:4)*U,y+h+28*U,8,'#ff5a5a',al,'#0e0a14',700);ctx.globalAlpha=1}});
  const tx=SW/2;panel(tx-tw_/2+2*U,y-3*U,tw_-4*U,24*U,'rgba(14,10,24,.9)','#ffd84a',6);const secs=m.timer===Infinity?'∞':String(Math.max(0,Math.ceil(m.timer/60)));
  text(secs,tx,y-.5*U,15,m.timer<600&&m.ph==='fight'?'#ff5a5a':'#fff','center',null,700);text('ROUND '+m.rd,tx,y+24*U,7,'#c8c0e0','center','#0e0a14',600);
  /* combo counter */
  const c=m.cmb;if(c&&c.n>=2&&m.t-c.t<80){const left=c.i===0,x=left?10*U:SW-10*U,yy=SH*.24,a=clamp(1-(m.t-c.t-50)/30,0,1);ctx.globalAlpha=a;
    text(c.n+' HITS',x,yy,16,'#ffd84a',left?'left':'right','#2a0c0c',700);text(Math.round(c.dmg/c.max*100)+'%',x,yy+20*U,10,'#fff',left?'left':'right','#0e0a14',700);ctx.globalAlpha=1}
  /* banners */
  const ms=m.msg;if(ms&&ms.s&&m.t-ms.t<ms.d){const k=m.t-ms.t,sc=k<8?.6+.4*easeOut(k/8):1,a=clamp((ms.d-k)/12,0,1),big=ms.s.length<10,px=big?30:18,yy=SH*.33;
    ctx.save();ctx.globalAlpha=a;ctx.translate(SW/2,yy);ctx.scale(sc,sc);const ww=Math.min(SW*.31,tw(ms.s,px,700)*.36+10*U);splashUI(0,px*U*.6,ww,'#1c1030',(ms.s.length*7)|0);
    text(ms.s,0,0,px,ms.c,'center','#0e0a14',700);ctx.restore()}
  /* the specials, under the ring when there's room */
  const me=m.F[0],gyPx=(groundY()+50)*PS,room=SH-gyPx;if(!me.cpu&&room>30*U&&m.ph!=='done'){const sp=me.ch.sp,rows=room>58*U&&SW<420*U?3:1;
    if(rows===3)sp.forEach((s,i)=>{const yy=gyPx+(room-3*15*U)/2+i*15*U;text(SPIN[i],SW/2-8*U,yy,9,'#ffd84a','right','#0e0a14',700);text(s.n,SW/2,yy,9,'#fff','left','#0e0a14',600)});
    else{const s=sp.map((s,i)=>SPIN[i]+' '+s.n).join('   ');text(s,SW/2,gyPx+room/2-6*U,8,'#e8e2d0','center','#0e0a14',600)}}}

/* ---------- pause ---------- */
function pauseTick(){menuNav(3);if(TAP('start')||TAP('b')){SFX.back();go('fight');return}
  if(TAP('a')){SFX.pick();if(MSEL===0)go('fight');else if(MSEL===1)openMoves(M.p1,'pause');else{saveNow(true);M=null;go('title')}}}
function pauseDraw(){fightDraw();dimAll(.62);text('PAUSED',SW/2,SH*.26,26,'#fff','center','#0e0a14');drawMenu(['RESUME','MOVE LIST','QUIT · SAVES THE MATCH'],SW/2,SH*.42,12,24*U);help('A SELECT · START RESUME')}

/* ---------- after a match ---------- */
let RES=null;
function onMatchEnd(r){const win=r.winner===0,me=M.p1,op=M.p2;SAVE.match=null;
  if(!M.F[0].cpu){if(win){SAVE.wins=(SAVE.wins||0)+1;SAVE.beaten[op]=1}else SAVE.losses=(SAVE.losses||0)+1;if(r.fin&&win)SAVE.fins=(SAVE.fins||0)+1}
  RES=Object.assign({},r,{win,mode:M.mode,t:0});
  if(M.mode==='tower'&&SAVE.tower){const T=SAVE.tower;if(win){T.i++;if(T.i>=T.ladder.length){RES.champ=1;CH={me};SAVE.done=true;(SAVE.cleared=SAVE.cleared||{})[me]=1;SAVE.tower=null}}}
  saveNow(true);SFX[win?'win':'lose']();(win?RUMBLE.win:RUMBLE.lose)();go('result')}
function resItems(){if(RES.mode==='tower')return RES.champ?['CONTINUE']:RES.win?['NEXT FIGHT','TITLE']:['TRY AGAIN','QUIT THE TOWER','TITLE'];return['REMATCH','NEW FIGHTERS','TITLE']}
function resultTick(dt){RES.t+=dt;M.t++;for(const f of M.F){f.t++;if(f.st==='launched'){f.vy+=.1;f.y+=f.vy;f.x+=f.vx;f.spin+=.3}f.P=lerpP(f.P,poseOf(f),.3)}fxTick(dt);
  if(RES.t<.6)return;const it=resItems();menuNav(it.length);if(!(TAP('a')||TAP('start')))return;SFX.pick();const k=it[MSEL],last={mode:M.mode,p1:M.p1,p2:M.p2,venue:M.venue,lvl:M.lvl};
  if(k==='CONTINUE'){M=null;go('champ')}
  else if(k==='NEXT FIGHT'||k==='TRY AGAIN')startTowerFight();
  else if(k==='QUIT THE TOWER'){SAVE.tower=null;saveNow(true);M=null;go('title')}
  else if(k==='REMATCH')startMatch(last);
  else if(k==='NEW FIGHTERS'){M=null;openSelect('vs')}
  else{M=null;go('title')}}
function resultDraw(){drawMatch({dim:.25});blit();ctx.setTransform(DPR,0,0,DPR,0,0);const r=RES,a=clamp(r.t*3,0,1);ctx.globalAlpha=a;
  const y=SH*.16;splashUI(SW/2,y+18*U,SW*.3,r.win?'#c8263a':'#2a2a40',r.win?4:9);text(r.win?'YOU WIN':'YOU LOSE',SW/2,y,30,r.win?'#ffd84a':'#c8c0e0','center','#0e0a14',700);
  const tags=[r.flawless&&'FLAWLESS VICTORY',r.fin&&(r.win?'KNOCKOUT FINISHER':'FINISHED'),r.mode==='tower'&&!r.champ&&SAVE.tower&&('TOWER · FIGHT '+(SAVE.tower.i+(r.win?0:1))+' OF '+SAVE.tower.ladder.length)].filter(Boolean);
  tags.forEach((s,i)=>text(s,SW/2,y+48*U+i*15*U,10,i===0&&r.flawless?'#7dff9a':'#fff','center','#0e0a14',700));
  if(r.win&&SAVE.beaten[M.p2]&&M.p1==='milo'&&!r.champ)textB('Milo can wear '+short(M.p2)+'\'s gloves in the locker room.',SW/2,y+50*U+tags.length*15*U,8,'#7dff9a','center','#000');
  ctx.globalAlpha=1;if(r.t>=.6){const it=resItems();drawMenu(it,SW/2,SH*.62,12,23*U)}help('A SELECT')}
function champTick(){if(TAP('a')||TAP('start')){SFX.pick();go('title')}}
function champDraw(){drawStage('crown',[{id:CH.me||'milo',P:Object.assign(idlePose(TT*60),{fx:8,fy:-108,nx:-4,ny:-106,ex:'grin'}),x:0,y:0,face:1}],{dim:.15});blit();ctx.setTransform(DPR,0,0,DPR,0,0);
  for(let i=0;i<14;i++){const x=hash(i*3)*SW,y=((hash(i+5)*SH+TT*90*(1+hash(i)))%SH);ctx.fillStyle=['#ffd84a','#ff3ea5','#3ee8ff'][i%3];ctx.fillRect(x,y,4*U,8*U)}
  splashUI(SW/2,SH*.14+18*U,SW*.34,'#c8263a',2);text('TOWER CLEARED',SW/2,SH*.14,24,'#ffd84a','center','#0e0a14',700);
  text(fname(CH.me||'milo'),SW/2,SH*.14+42*U,11,'#fff','center','#0e0a14',700);
  wrap('Champion of Port Ember. Gold trunks and a crown tattoo for Milo are waiting in the locker room.',SW*.8,10).forEach((l,i)=>textB(l,SW/2,SH*.72+i*14*U,10,'#fff','center','#000',600));help('A CONTINUE')}
let CH={};

/* ---------- versus splash before a fight ---------- */
let VI=null;
function startMatch(o){newMatch(o);SAVE.last={p1:o.p1,p2:o.p2,venue:o.venue};VI={t:0};saveNow(true);go('vsintro')}
function vsTick(dt){VI.t+=dt;if(VI.t>2.4||(VI.t>.4&&(TAP('a')||TAP('start')))){ACC=0;go('fight')}}
function vsDraw(){ctx.setTransform(DPR,0,0,DPR,0,0);const k=easeOut(Math.min(1,VI.t*3)),c1=PEOPLE[M.p1].gloves,c2=M.F[1].alt?'#e9e4d6':PEOPLE[M.p2].gloves;
  ctx.fillStyle='#0e0a14';ctx.fillRect(0,0,SW,SH);ctx.fillStyle=shade(c1,-.45);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(SW*.62,0);ctx.lineTo(SW*.38,SH);ctx.lineTo(0,SH);ctx.fill();
  ctx.fillStyle=shade(c2,-.5);ctx.beginPath();ctx.moveTo(SW*.62+4*U,0);ctx.lineTo(SW,0);ctx.lineTo(SW,SH);ctx.lineTo(SW*.38+4*U,SH);ctx.fill();
  const ps=Math.min(SW*.5,SH*.3);portraitC(M.p1,'angry',lerp(-ps,SW*.04,k),SH*.12,ps,null);
  portraitC(M.p2,'smug',lerp(SW+ps,SW*.96-ps,k),SH*.5,ps,null,{alt:M.F[1].alt});
  text(fname(M.p1),SW*.06,SH*.12+ps+4*U,11,'#fff','left','#0e0a14',700);text(PEOPLE[M.p2].name,SW*.94,SH*.5-20*U,11,'#fff','right','#0e0a14',700);
  const s=1+.15*Math.max(0,1-VI.t*4);ctx.save();ctx.translate(SW/2,SH*.46);ctx.scale(s,s);splashUI(0,14*U,34*U,'#c8263a',6);text('VS',0,0,30,'#ffd84a','center','#0e0a14',700);ctx.restore();
  const v=VENUES[M.venue];text(v.name,SW/2,SH-40*U,11,'#ffd84a','center','#0e0a14',700);textB(v.place+(M.mode==='tower'&&SAVE.tower?' · Tower fight '+(SAVE.tower.i+1)+' of '+SAVE.tower.ladder.length:''),SW/2,SH-24*U,8,'#e8e2d0','center','#000')}
