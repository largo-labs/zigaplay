/* =====================================================================================================
   FOURFALL: four-square pieces fall into a well ten wide. Slide and turn them; a full row clears.
   Everything is drawn on one small canvas scaled up in whole steps; words and numbers sit on top as text.
   ===================================================================================================== */
const S=makeSave('fourfall',()=>({v:1,sound:2,best:0,bestLines:0,sprint:0,startLv:1,savedAt:0}));
SND.mode=S.v.sound;
const cv=$('#cv'),g=cv.getContext('2d'),stage=$('#stage'),hud=$('#hud');
const COLS=10,ROWS=18,HID=3,TR=ROWS+HID,C=8,KINDS='IOTSZJL';
const SHAPE={I:[4,[[0,1],[1,1],[2,1],[3,1]]],O:[2,[[0,0],[1,0],[0,1],[1,1]]],T:[3,[[1,0],[0,1],[1,1],[2,1]]],S:[3,[[1,0],[2,0],[0,1],[1,1]]],
  Z:[3,[[0,0],[1,0],[1,1],[2,1]]],J:[3,[[0,0],[0,1],[1,1],[2,1]]],L:[3,[[2,0],[0,1],[1,1],[2,1]]]};
const ROT={};for(const k of KINDS){const[n,c]=SHAPE[k];let cur=c;ROT[k]=[];for(let r=0;r<4;r++){ROT[k].push(cur);cur=cur.map(([x,y])=>[n-1-y,x])}}
/* each piece: body colour, lit edge, shaded edge */
const PAL={I:['#ff6f6b','#ffc7bd','#b23346'],O:['#63dba2','#c9ffe1','#278a66'],T:['#ffd15c','#fff4c2','#c07f24'],S:['#5cbcff','#c9ecff','#2470c2'],
  Z:['#ae8aff','#e6d9ff','#6444c4'],J:['#ff92c6','#ffdaec','#c2447f'],L:['#ffa158','#ffdcb6','#c25a24'],X:['#6d6a8c','#a19ec0','#3d3a58']};
function blockSpr(p,n){const c=mkCanvas(n,n),x=c.getContext('2d');x.fillStyle=p[0];x.fillRect(0,0,n,n);x.fillStyle=p[1];x.fillRect(0,0,n,1);x.fillRect(0,0,1,n);
  x.fillStyle=p[2];x.fillRect(0,n-1,n,1);x.fillRect(n-1,0,1,n);if(n>=8){x.fillStyle=p[1];x.fillRect(2,2,2,1);x.fillRect(2,3,1,1);x.fillStyle=p[2];x.fillRect(3,n-3,n-5,1);x.fillRect(n-3,3,1,n-5)}return c}
const BLK={},MINI={};for(const k in PAL){BLK[k]=blockSpr(PAL[k],C);MINI[k]=blockSpr(PAL[k],5)}
const FRAME=['#6a63c8','#3fa9c4','#4fbf74','#c9b548','#d1824a','#d1557f','#a659d6'];

let SC=2,VW=126,VH=170,BX=0,BY=0,PX=0,stars=[];
let state='title',mode='marathon',grid=[],cur=null,bag=[],queue=[],holdK=null,canHold=true,score=0,lines=0,level=1,startLv=1,combo=0,b2b=false,
  fallT=0,lockT=0,lockMoves=0,dasDir=0,dasT=0,clearRows=null,clearT=0,parts=[],shake=0,timeT=0,overFill=0,overShown=false,deco=[],T=0;

/* ---------- sound ---------- */
const SFX={move(){SND.tone(240,.03,{vol:.03})},rot(){SND.tone(560,.04,{vol:.05})},lock(){SND.tone(190,.06,{type:'triangle',vol:.12})},
  drop(){SND.noise(.09,{lp:900,vol:.22});SND.tone(120,.09,{type:'triangle',vol:.2,to:55})},hold(){SND.tone(660,.05,{vol:.05});SND.tone(990,.07,{vol:.05,at:.05})},
  bad(){SND.tone(110,.08,{type:'sawtooth',vol:.04})},
  clear(n){const sc=[523,659,784,1047,1319,1568];for(let i=0;i<n+2;i++)SND.tone(sc[i],.12,{vol:.08,at:i*.055});if(n===4)SND.noise(.3,{hp:3000,vol:.08,at:.1})},
  level(){[784,988,1175,1568].forEach((f,i)=>SND.tone(f,.14,{vol:.08,at:.3+i*.09,type:'triangle'}))},
  over(){[392,330,262,196,131].forEach((f,i)=>SND.tone(f,.22,{vol:.09,at:i*.16,type:'triangle'}))},
  win(){[523,659,784,1047,784,1047,1319].forEach((f,i)=>SND.tone(f,.16,{vol:.08,at:i*.1}))}};
const SONG={bpm:132,ch:[
  SND.seq('square',.035,'A4 . E5 . A5 . E5 . C5 . E5 . A5 - - . G4 . D5 . G5 . D5 . B4 . D5 . G5 - - . F4 . C5 . F5 . C5 . A4 . C5 . F5 . E5 . E5 . D5 . C5 . B4 . C5 - D5 - E5 - - .'),
  SND.seq('triangle',.09,'A2 . . . A2 . . . A2 . . . A2 . E2 . G2 . . . G2 . . . G2 . . . G2 . D2 . F2 . . . F2 . . . F2 . . . F2 . C3 . E2 . . . E2 . . . E2 . G#2 . B2 . E2 .'),
  SND.seq('drum',.05,'k . h . s . h . k . h . s . h h')]};

/* ---------- layout ---------- */
function place(id,x,y,w){const e=$('#'+id);e.style.left=x*SC+'px';e.style.top=y*SC+'px';if(w)e.style.width=w*SC+'px'}
let slim=false;
function resize(){const W=innerWidth||300,H=innerHeight||500;slim=!!(PANEL&&PANEL.shown);SC=slim?pickScale(W,H,90,172):pickScale(W,H,124,170);VW=Math.floor(W/SC);VH=Math.floor(H/SC);
  cv.width=VW;cv.height=VH;stage.style.width=VW*SC+'px';stage.style.height=VH*SC+'px';stage.style.setProperty('--s',SC);g.imageSmoothingEnabled=false;
  BX=Math.floor((VW-(slim?COLS*C:COLS*C+8+32))/2);BY=Math.floor((VH-ROWS*C)/2)+8;PX=BX+COLS*C+8;
  for(const id of['hNextL','hHoldL','hLvL','hLv','hLnL','hLn'])$('#'+id).hidden=slim;
  place('hScoreL',BX,BY-20);place('hScore',BX,BY-14);place('hBestL',slim?BX+46:PX-4,BY-20);place('hBest',slim?BX+46:PX-4,BY-14);
  place('hNextL',PX,BY-1);place('hHoldL',PX,BY+57);place('hLvL',PX,BY+91);place('hLv',PX,BY+97);place('hLnL',PX,BY+115);place('hLn',PX,BY+121);place('banner',BX,BY+50,COLS*C);
  stars=[];for(let i=0;i<46;i++)stars.push([ri(VW),ri(VH),rnd()*6,rnd()<.2?2:1])}

/* ---------- the pieces ---------- */
function newBag(){const b=KINDS.split('');for(let i=6;i>0;i--){const j=ri(i+1);[b[i],b[j]]=[b[j],b[i]]}return b}
function nextKind(){while(queue.length<5){if(!bag.length)bag=newBag();queue.push(bag.pop())}return queue.shift()}
function hits(k,r,x,y){for(const[cx,cy]of ROT[k][r]){const X=cx+x,Y=cy+y;if(X<0||X>=COLS||Y>=TR)return true;if(Y>=0&&grid[Y][X])return true}return false}
function spawn(k){cur={k,r:0,x:Math.floor((COLS-SHAPE[k][0])/2),y:HID-2};fallT=0;lockT=0;lockMoves=0;
  if(hits(k,0,cur.x,cur.y)){cur=null;gameOver();return}if(!hits(k,0,cur.x,cur.y+1))cur.y++}
function nudge(){if(lockT>0&&lockMoves<15){lockT=0;lockMoves++}}
function tryMove(dx,dy){if(!cur||hits(cur.k,cur.r,cur.x+dx,cur.y+dy))return false;cur.x+=dx;cur.y+=dy;if(dx)nudge();return true}
function rotate(d){if(!cur||cur.k==='O')return;const r=(cur.r+d+4)%4;
  for(const[kx,ky]of[[0,0],[-d,0],[d,0],[0,-1],[-d,-1],[d,-1],[-2*d,0],[2*d,0]])if(!hits(cur.k,r,cur.x+kx,cur.y+ky)){cur.r=r;cur.x+=kx;cur.y+=ky;nudge();SFX.rot();return}
  SFX.bad()}
function ghostY(){let y=cur.y;while(!hits(cur.k,cur.r,cur.x,y+1))y++;return y}
function hardDrop(){if(!cur)return;const gy=ghostY();score+=(gy-cur.y)*2;cur.y=gy;shake=.14;SFX.drop();lock(true)}
function hold(){if(!cur||!canHold){SFX.bad();return}const k=cur.k;if(holdK){const h=holdK;holdK=k;spawn(h)}else{holdK=k;spawn(nextKind())}canHold=false;SFX.hold()}
function lock(hard){let above=true;for(const[cx,cy]of ROT[cur.k][cur.r]){const x=cx+cur.x,y=cy+cur.y;if(y>=0)grid[y][x]=cur.k;if(y>=HID)above=false;
    if(hard)for(let i=0;i<2;i++)parts.push({x:BX+x*C+rnd()*C,y:BY+(y-HID+1)*C,vx:(rnd()-.5)*40,vy:-rnd()*30,l:.3,c:PAL[cur.k][1]})}
  cur=null;if(above){gameOver();return}
  const full=[];for(let y=0;y<TR;y++)if(grid[y].every(v=>v))full.push(y);
  if(full.length){clearRows=full;clearT=.3;SFX.clear(full.length);if(full.length===4)shake=.3}else{combo=0;if(!hard)SFX.lock();canHold=true;spawn(nextKind())}}
function finishClear(){const n=clearRows.length;
  for(const y of clearRows){for(let x=0;x<COLS;x++)for(let i=0;i<2;i++)parts.push({x:BX+x*C+4,y:BY+(y-HID)*C+4,vx:(rnd()-.5)*90,vy:(rnd()-.7)*90,l:.35+rnd()*.3,c:PAL[grid[y][x]][i]});
    grid.splice(y,1);grid.unshift(new Array(COLS).fill(0))}
  combo++;let pts=[0,100,300,500,800][n]*level;if(n===4){if(b2b)pts=Math.floor(pts*1.5);b2b=true}else b2b=false;if(combo>1)pts+=50*(combo-1)*level;score+=pts;lines+=n;clearRows=null;
  let msg=n===4?'FOURFALL!':n===3?'TRIPLE':n===2?'DOUBLE':'';if(combo>1)msg+=(msg?' · ':'')+'COMBO ×'+combo;
  const nl=mode==='sprint'?level:startLv+Math.floor(lines/10);if(nl>level){level=nl;SFX.level();msg=(msg?msg+' · ':'')+'LEVEL '+level}
  if(msg)banner(msg);
  if(mode==='sprint'&&lines>=40){finishSprint();return}
  canHold=true;spawn(nextKind())}
const gravity=()=>Math.max(.02,Math.pow(.8-(level-1)*.007,level-1));
function banner(t){const b=$('#banner');b.textContent=t;b.classList.remove('go');void b.offsetWidth;b.classList.add('go')}

/* ---------- a game from start to end ---------- */
function newGame(m){mode=m;startLv=m==='sprint'?2:S.v.startLv;level=startLv;grid=[];for(let y=0;y<TR;y++)grid.push(new Array(COLS).fill(0));
  bag=[];queue=[];holdK=null;canHold=true;score=0;lines=0;combo=0;b2b=false;clearRows=null;parts=[];timeT=0;overFill=0;overShown=false;dasDir=0;
  $('#hBestL').textContent=m==='sprint'?'TIME':'BEST';$('#hLnL').textContent=m==='sprint'?'LEFT':'LINES';
  closeMenu();hud.hidden=false;state='play';spawn(nextKind());SND.play(SONG);hudText()}
const clock=t=>{const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(1)};
let pcv=null;
function panelDraw(){if(!PANEL)return;if(!pcv)pcv=PANEL.canvas(60,100,'HOLD · NEXT');if(!pcv)return;const x=pcv.getContext('2d');x.fillStyle='#120f2b';x.fillRect(0,0,60,100);x.fillStyle='#211c48';x.fillRect(4,25,52,1);
  const put=(k,cy,dim)=>{const cs=ROT[k][0];let a=9,b=0,c=9,d=0;for(const[cx,q]of cs){a=Math.min(a,cx);b=Math.max(b,cx);c=Math.min(c,q);d=Math.max(d,q)}const ox=30-(b-a+1)*4,oy=cy-(d-c+1)*4;x.globalAlpha=dim?.4:1;for(const[cx,q]of cs)x.drawImage(BLK[k],ox+(cx-a)*8,oy+(q-c)*8);x.globalAlpha=1};
  if(holdK)put(holdK,13,!canHold);for(let i=0;i<3;i++)if(queue[i])put(queue[i],40+i*23)}
function hudText(){if(PANEL){PANEL.rows(mode==='sprint'?[['TIME',clock(timeT)],['LEFT',Math.max(0,40-lines)],['BEST',S.v.sprint?clock(S.v.sprint):'—']]:[['SCORE',fmt(score)],['BEST',fmt(Math.max(S.v.best,score))],['LEVEL',level],['LINES',lines]]);panelDraw()}
  $('#hScore').textContent=fmt(score);$('#hLv').textContent=level;$('#hLn').textContent=mode==='sprint'?Math.max(0,40-lines):lines;
  $('#hBest').textContent=mode==='sprint'?clock(timeT):fmt(Math.max(S.v.best,score))}
function gameOver(){state='over';overFill=0;overShown=false;SND.stop();SFX.over();
  if(mode==='marathon'){const nb=score>S.v.best;if(nb)S.v.best=score;if(lines>S.v.bestLines)S.v.bestLines=lines;S.save();gameOver.nb=nb}}
function overMenu(){overShown=true;menu({html:`<h2>GAME OVER</h2><div class="big">${fmt(score)}</div><p>${mode==='marathon'&&gameOver.nb&&score?'NEW BEST! · ':''}LINES ${lines} · LEVEL ${level}</p>`,
  items:[{t:'PLAY AGAIN',fn:()=>newGame(mode)},{t:'TITLE',fn:title}],back:title})}
function finishSprint(){state='done';SND.stop();SFX.win();const nb=!S.v.sprint||timeT<S.v.sprint;if(nb)S.v.sprint=+timeT.toFixed(2);S.save();
  menu({html:`<h2>40 LINES!</h2><div class="big">${clock(timeT)}</div><p>${nb?'NEW BEST TIME!':'BEST '+clock(S.v.sprint)}</p>`,items:[{t:'AGAIN',fn:()=>newGame('sprint')},{t:'TITLE',fn:title}],back:title})}
const soundItem=()=>({t:'SOUND',v:()=>SOUND_NAMES[S.v.sound],adj:d=>{S.v.sound=(S.v.sound+d+3)%3;SND.mode=S.v.sound;S.save()}});
function pause(){if(state!=='play')return;state='pause';SND.pause(true);
  menu({html:'<h2>PAUSED</h2>',items:[{t:'RESUME',fn:resume},{t:'RESTART',fn:()=>{SND.pause(false);newGame(mode)}},soundItem(),{t:'QUIT',fn:()=>{SND.pause(false);title()}}],back:resume})}
function resume(){closeMenu();state='play';SND.pause(false)}
function title(){state='title';SND.stop();hud.hidden=true;cur=null;if(PANEL){PANEL.clear();pcv=null}
  menu({cls:'title',html:'<h1 class="logo"><b>FOUR</b><b>FALL</b></h1><p>Slide and turn the falling pieces. Fill a row to clear it.</p>',
    items:[{t:'MARATHON',fn:()=>newGame('marathon')},{t:'SPRINT 40',fn:()=>newGame('sprint')},
      {t:'START LEVEL',v:()=>S.v.startLv,adj:d=>{S.v.startLv=clamp(S.v.startLv+d,1,12);S.save()}},soundItem(),{t:'HOW TO PLAY',fn:how}],
    foot:`BEST ${fmt(S.v.best)}${S.v.sprint?' · SPRINT '+clock(S.v.sprint):''}`})}
function how(){menu({html:'<h2>HOW TO PLAY</h2><p class="keys"><b>◀ ▶</b> slide &nbsp; <b>▼</b> fall faster &nbsp; <b>▲</b> drop<br><b>A</b> turn right &nbsp; <b>B</b> turn left<br><b>SELECT</b> hold a piece for later<br><b>START</b> pause</p><p>Clear four rows at once for a FOURFALL. Marathon speeds up every ten lines; Sprint times you to forty.</p>',
  items:[{t:'BACK',fn:title}],back:title})}

/* ---------- buttons ---------- */
onBtn=(b,d)=>{if(M){if(d)menuInput(b);return}
  if(state!=='play')return;
  if(!d){if(b==='left'&&dasDir<0)dasDir=held.right?1:0;else if(b==='right'&&dasDir>0)dasDir=held.left?-1:0;if(dasDir)dasT=.17;return}
  if(b==='start'){pause();return}
  if(b==='left'||b==='right'){dasDir=b==='left'?-1:1;dasT=.17;if(cur&&!clearRows&&tryMove(dasDir,0))SFX.move();return}
  if(!cur||clearRows)return;
  if(b==='up')hardDrop();else if(b==='a')rotate(1);else if(b==='b')rotate(-1);else if(b==='select'||b==='c'||b==='d')hold()};

/* ---------- one step of time ---------- */
function step(dt){T+=dt;if(shake>0)shake-=dt;
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.l-=dt;if(p.l<=0){parts.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=260*dt}
  if(state==='title'){if(deco.length<9&&rnd()<dt*1.6)deco.push({k:pick(KINDS.split('')),r:ri(4),x:ri(VW-24),y:-30,v:14+rnd()*22});
    for(let i=deco.length-1;i>=0;i--){deco[i].y+=deco[i].v*dt;if(deco[i].y>VH+10)deco.splice(i,1)}return}
  if(state==='over'){if(overFill<TR)overFill+=dt*34;else if(!overShown)overMenu();return}
  if(state!=='play')return;
  timeT+=dt;
  if(clearRows){clearT-=dt;if(clearT<=0)finishClear();return}
  if(!cur)return;
  if(dasDir&&held[dasDir>0?'right':'left']){dasT-=dt;while(dasT<=0){if(!tryMove(dasDir,0)){dasT=0;break}dasT+=.04}}
  if(hits(cur.k,cur.r,cur.x,cur.y+1)){fallT=0;lockT+=dt;if(lockT>=.5)lock(false)}
  else{lockT=0;const iv=held.down?Math.min(gravity(),.04):gravity();fallT+=dt;
    while(fallT>=iv&&cur){fallT-=iv;if(hits(cur.k,cur.r,cur.x,cur.y+1)){fallT=0;break}cur.y++;if(held.down)score++}}}

/* ---------- drawing ---------- */
function drawPiece(k,r,px,py,img,alpha){if(alpha!=null)g.globalAlpha=alpha;for(const[cx,cy]of ROT[k][r]){const y=cy+py;if(y<HID)continue;g.drawImage(img||BLK[k],BX+(cx+px)*C,BY+(y-HID)*C)}g.globalAlpha=1}
function drawMini(k,x,y,w,h,dim){const cs=ROT[k][0];let a=9,b=0,c=9,d=0;for(const[cx,cy]of cs){a=Math.min(a,cx);b=Math.max(b,cx);c=Math.min(c,cy);d=Math.max(d,cy)}
  const ox=x+Math.floor((w-(b-a+1)*5)/2),oy=y+Math.floor((h-(d-c+1)*5)/2);g.globalAlpha=dim?.4:1;for(const[cx,cy]of cs)g.drawImage(MINI[k],ox+(cx-a)*5,oy+(cy-c)*5);g.globalAlpha=1}
function box(x,y,w,h,col){g.fillStyle=col;g.fillRect(x-1,y-1,w+2,h+2);g.fillStyle='#120f2b';g.fillRect(x,y,w,h)}
function draw(){g.fillStyle='#0d0b20';g.fillRect(0,0,VW,VH);
  for(const s of stars){g.fillStyle=`rgba(190,180,255,${.18+.22*Math.sin(T*1.3+s[2])})`;g.fillRect(s[0],s[1],s[3],s[3])}
  if(state==='title'){for(const d of deco){g.globalAlpha=.55;for(const[cx,cy]of ROT[d.k][d.r])g.drawImage(BLK[d.k],d.x+cx*C,Math.round(d.y)+cy*C);g.globalAlpha=1}return}
  const sx=shake>0?Math.round((rnd()-.5)*3):0,sy=shake>0?Math.round(rnd()*2):0,fc=FRAME[(level-1)%FRAME.length];
  g.save();g.translate(sx,sy);
  g.fillStyle=fc;g.fillRect(BX-2,BY-2,COLS*C+4,ROWS*C+4);g.fillStyle='#120f2b';g.fillRect(BX,BY,COLS*C,ROWS*C);
  g.fillStyle='#211c48';for(let y=1;y<ROWS;y++)for(let x=1;x<COLS;x++)g.fillRect(BX+x*C,BY+y*C,1,1);
  for(let y=HID;y<TR;y++)for(let x=0;x<COLS;x++){const k=grid[y][x];if(!k)continue;const dead=state==='over'&&y>=TR-overFill;g.drawImage(BLK[dead?'X':k],BX+x*C,BY+(y-HID)*C)}
  if(cur&&state!=='over'){const gy=ghostY();if(gy!==cur.y){g.fillStyle=PAL[cur.k][0];for(const[cx,cy]of ROT[cur.k][cur.r]){const y=cy+gy;if(y<HID)continue;const X=BX+(cx+cur.x)*C,Y=BY+(y-HID)*C;
        g.globalAlpha=.16;g.fillRect(X,Y,C,C);g.globalAlpha=.6;g.fillRect(X,Y,C,1);g.fillRect(X,Y+C-1,C,1);g.fillRect(X,Y,1,C);g.fillRect(X+C-1,Y,1,C)}g.globalAlpha=1}
    const grounded=hits(cur.k,cur.r,cur.x,cur.y+1);drawPiece(cur.k,cur.r,cur.x,cur.y,null,grounded?.75+.25*Math.cos(lockT*18):1)}
  if(clearRows){const t=clearT/.3;g.fillStyle='#fff';for(const y of clearRows){if(y<HID)continue;const w=Math.round(COLS*C*t);g.globalAlpha=.35+.6*t;g.fillRect(BX+Math.floor((COLS*C-w)/2),BY+(y-HID)*C,w,C)}g.globalAlpha=1}
  g.restore();
  if(!slim){box(PX,BY+8,30,43,'#3a3566');for(let i=0;i<3;i++)if(queue[i])drawMini(queue[i],PX,BY+10+i*13,30,13);
    box(PX,BY+66,30,17,'#3a3566');if(holdK)drawMini(holdK,PX,BY+66,30,17,!canHold)}
  for(const p of parts){g.fillStyle=p.c;g.globalAlpha=Math.min(1,p.l*3);g.fillRect(Math.round(p.x),Math.round(p.y),1,1)}g.globalAlpha=1}

let last=performance.now(),hudT=0;
function frame(now){const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;step(dt);draw();hudT-=dt;if(hudT<=0&&(state==='play'||state==='over')){hudT=.05;hudText()}requestAnimationFrame(frame)}
addEventListener('resize',()=>{resize();draw()});
addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')pause()});
hookConsole('fourfall','Fourfall',S);
resize();title();requestAnimationFrame(frame);S.init(()=>{SND.mode=S.v.sound;if(state==='title')title()});
window.__ff={BLK,ROT,KINDS,PAL,get state(){return state},get grid(){return grid},get cur(){return cur},get score(){return score},get lines(){return lines},newGame,step,draw,title,btnSet,
  set lines(v){lines=v},setGrid(fn){fn(grid)},art(){deco=[];state='art'}};
