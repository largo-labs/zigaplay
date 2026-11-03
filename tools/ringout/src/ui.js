/* ================= menus ================= */
const LOGOC=['#ff5f6a','#ffd84a','#6af0ff','#a8ff6a','#ff8ac0','#c8a8ff'];
function logo(word,y,now,off=0){let x=Math.round(W/2-tw(word,4)/2);for(const[i,ch]of[...word].entries()){const yy=y+Math.round(Math.sin(now/240+i*.8+off)*2);txt(ch,x+3,yy+3,K,4);txt(ch,x,yy,LOGOC[(i+off)%LOGOC.length],4);x+=24}}
function hint(s,y,c='#c8b8ff'){txt(s,W/2,y,c,1,'c',K)}
function wrap(s,n){const out=[];let line='';for(const w of s.split(' ')){if((line+' '+w).trim().length>n){out.push(line);line=w}else line=(line+' '+w).trim()}if(line)out.push(line);return out}
/* ---------- title ---------- */
function drawTitle(now){const st=G.titleStage;ctx.drawImage(st.bg,0,0);drawSoftPlats(st,now);drawStageFx(st,now);
  const y=st.main.y,[a,b]=G.titleFighters;drawPuppet(a,Math.floor(now/400)%2?'idle':'idle2',st.main.l+26,y,1,now/16);drawPuppet(b,Math.floor(now/400)%2?'idle2':'idle',st.main.r-26,y,-1,now/16);
  ctx.fillStyle='rgba(10,6,24,.55)';ctx.fillRect(0,0,W,H);
  const ly=Math.round(clamp(H*.07,12,28));logo('RING',ly,now,0);logo('OUT!',ly+32,now,2);
  const items=['FIGHT!',`STOCKS  ◀ ${G.stocks} ▶`,`CPU LEVEL  ◀ ${G.level} ▶`,`SOUND  ${muted?'OFF':'ON'}`],my=ly+74;
  box(30,my-4,120,items.length*12+6,'#1e1438','#ffd36a');
  items.forEach((s,i)=>{const on=G.menu.sel===i;if(on){ctx.fillStyle='#ffd36a';ctx.fillRect(32,my-2+i*12,116,11)}txt(s,W/2,my+i*12,on?'#1e1438':'#ffffff',1,'c')});
  const hy=H-44;ctx.fillStyle='rgba(10,6,24,.7)';ctx.fillRect(0,hy-4,W,44);
  hint('◀◀ ▶▶ RUN · ▲ JUMP · ▼ DODGE',hy);hint('A ATTACK · B SPECIAL',hy+10);hint('B + ◀▶ ▲ ▼: MORE SPECIALS',hy+20);hint('HIT WITH A, THEN B FOR COMBOS',hy+30,'#ffd84a')}
function titleInput(){const p=IN.pressed,m=G.menu;
  if(p.up){m.sel=(m.sel+3)%4;SFX.move()}if(p.down){m.sel=(m.sel+1)%4;SFX.move()}
  const d=(p.right?1:0)-(p.left?1:0);
  if(m.sel===1&&d){G.stocks=clamp(G.stocks+d,1,5);SFX.move();saveSettings()}
  if(m.sel===2&&d){G.level=clamp(G.level+d,1,9);SFX.move();saveSettings()}
  if(m.sel===3&&(d||p.a)){setMute(!muted);if(!muted){unlock();SFX.pick()}return}
  if(p.a&&m.sel===1){G.stocks=G.stocks%5+1;SFX.move();saveSettings()}
  if(p.a&&m.sel===2){G.level=G.level%9+1;SFX.move();saveSettings()}
  if((p.a&&m.sel===0)||p.start){SFX.pick();toSelect(0)}}
function saveSettings(){store.set('settings',{stocks:G.stocks,level:G.level})}
/* ---------- choose a fighter ---------- */
const GC=5,GR=4,CW=34,CH=30;
function gridY(){return H-CH*GR-6}
function drawSelect(now){const sel=G.sel,step=sel.step;ctx.fillStyle='#120c24';ctx.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=8){ctx.fillStyle=(y/8)%2?'#170f2e':'#140c28';ctx.fillRect(0,y,W,8)}
  txt(step?'CHOOSE YOUR RIVAL':'CHOOSE YOUR FIGHTER',W/2,3,step?TAGC[1]:TAGC[0],1,'c',K);
  const gy=gridY(),ch=ROSTER[sel.cur[step]],ty=13,th=gy-ty-5;
  box(3,ty,W-6,th,'#1e1438',step?TAGC[1]:TAGC[0]);
  const c=portrait(ch,'idle'),px=27,py=ty+th/2+16;circle(px,py-18,20,'#3a2a6a');circle(px,py-18,16,'#4a3a86');ctx.drawImage(c,0,0,SP,SP,px-OX*2,py-OY*2,SP*2,SP*2);
  const ix=50;txt(ch.name,ix,ty+4,'#ffffff',2,'l',K);
  const wins=(G.wins[ch.id]||0);if(wins)txt('★'+wins,W-7,ty+4,'#ffd84a',1,'r');
  const bl=wrap(ch.blurb,21);bl.slice(0,2).forEach((s,i)=>txt(s,ix,ty+20+i*8,'#c8b8ff'));
  const sp=ch.sp,ln=[['B',sp.n[1].name],['B◀▶',sp.s[1].name],['B▲',sp.u[1].name],['B▼',sp.d[1].name]];
  const ly=ty+th-36;ln.forEach(([k,n],i)=>{txt(k,ix,ly+i*8,'#ffd84a');txt(n,ix+26,ly+i*8,'#ffffff')});
  if(step)txt('SELECT: RANDOM',W-7,ty+th-46,'#8a7ab0',1,'r');
  for(let i=0;i<ROSTER.length;i++){const cx=5+(i%GC)*CW,cy=gy+Math.floor(i/GC)*CH,c2=ROSTER[i];
    ctx.fillStyle=(i+Math.floor(i/GC))%2?'#241a44':'#2a2050';ctx.fillRect(cx,cy,CW-2,CH-2);
    ctx.save();ctx.beginPath();ctx.rect(cx,cy,CW-2,CH-2);ctx.clip();const pc=portrait(c2,'idle');ctx.drawImage(pc,cx+(CW-2)/2-OX,cy+CH-4-OY);ctx.restore();
    if(step===1&&sel.picked[0]===i){ctx.fillStyle=TAGC[0];ctx.fillRect(cx+1,cy+1,6,5);txt('1',cx+2,cy,'#fff')}
    if(sel.cur[step]===i){const on=Math.floor(now/250)%2;ctx.strokeStyle=on?'#ffffff':(step?TAGC[1]:TAGC[0]);ctx.lineWidth=2;ctx.strokeRect(cx,cy,CW-2,CH-2)}}}
function selectInput(){const p=IN.pressed,sel=G.sel,s=sel.step;let c=sel.cur[s];
  if(p.left){c=(c%GC===0)?c+GC-1:c-1;SFX.move()}if(p.right){c=(c%GC===GC-1)?c-GC+1:c+1;SFX.move()}
  if(p.up){c=(c-GC+ROSTER.length)%ROSTER.length;SFX.move()}if(p.down){c=(c+GC)%ROSTER.length;SFX.move()}
  sel.cur[s]=c;
  if(p.b){SFX.back();if(s===0)toTitle();else sel.step=0;return}
  if(s===1&&p.select){sel.cur[1]=Math.floor(rnd()*ROSTER.length);sel.picked[1]=sel.cur[1];SFX.pick();toStage();return}
  if(p.a||p.start){SFX.pick();sel.picked[s]=c;if(s===0){sel.step=1;if(sel.cur[1]==null||sel.cur[1]===c)sel.cur[1]=(c+1+Math.floor(rnd()*(ROSTER.length-1)))%ROSTER.length}else toStage()}}
/* ---------- choose a stage ---------- */
function drawStageSel(now){ctx.fillStyle='#120c24';ctx.fillRect(0,0,W,H);txt('CHOOSE A STAGE',W/2,4,'#ffd84a',1,'c',K);
  const st=G.stageThumbs[G.stageSel],tw2=Math.round(W*.78),th2=Math.round(H*.78*.78),tx=Math.round(W/2-tw2/2),ty=16;
  box(tx,ty,tw2,th2,'#000','#ffd36a');ctx.drawImage(st.bg,0,0,W,H,tx,ty,tw2,th2);
  const[a,b]=G.sel.picked.map(i=>ROSTER[i]),sc=tw2/W;
  ctx.save();ctx.translate(tx,ty);ctx.scale(sc,th2/H);for(const p of st.plats)if(p.soft){ctx.fillStyle=st.def.plank;ctx.fillRect(p.l,p.y,p.r-p.l,3)}
  ctx.restore();
  const by=ty+th2+8;txt('◀ '+st.name+' ▶',W/2,by,'#ffffff',1,'c',K);
  txt(STAGES.map((_,i)=>i===G.stageSel?'*':'·').join(' '),W/2,by+11,'#ffd84a',1,'c');
  const cy=by+24;ctx.drawImage(portrait(a),W/2-40-OX,cy+26-OY);txt('VS',W/2,cy+8,'#ffd84a',2,'c',K);ctx.save();ctx.translate(W/2+40,0);ctx.scale(-1,1);ctx.drawImage(portrait(b),-OX,cy+26-OY);ctx.restore();
  if(cy+40<H)hint('A: FIGHT!   B: BACK',Math.min(H-10,cy+40))}
function stageInput(){const p=IN.pressed;if(p.left){G.stageSel=(G.stageSel+STAGES.length-1)%STAGES.length;SFX.move()}if(p.right){G.stageSel=(G.stageSel+1)%STAGES.length;SFX.move()}
  if(p.b){SFX.back();G.state='select';G.sel.step=1;return}if(p.a||p.start){SFX.pick();startFight(G.sel.picked[0],G.sel.picked[1],G.stageSel)}}
/* ---------- pause: your moves ---------- */
function drawPause(now){ctx.fillStyle='rgba(10,6,24,.72)';ctx.fillRect(0,0,W,H);const f=G.fighters[0],ch=f.ch,y=Math.round(H/2-62);
  box(6,y,W-12,124,'#1e1438','#ffd36a');txt('PAUSED',W/2,y+5,'#ffd84a',2,'c',K);txt(ch.name+"'S MOVES",W/2,y+22,'#c8b8ff',1,'c');
  const sp=ch.sp,ln=[['B',sp.n[1].name],['B◀▶',sp.s[1].name],['B▲',sp.u[1].name],['B▼',sp.d[1].name]];
  ln.forEach(([k,n],i)=>{txt(k,14,y+34+i*10,'#ffd84a');txt(n,40,y+34+i*10,'#ffffff')});
  txt('A A A JAB · A+◀▶ SMACK',W/2,y+78,'#c8b8ff',1,'c');txt('HIT WITH A, THEN B = COMBO',W/2,y+88,'#c8b8ff',1,'c');
  txt('A: KEEP FIGHTING',W/2,y+102,'#ffffff',1,'c');txt('B: QUIT THE MATCH',W/2,y+112,'#ffffff',1,'c')}
/* ---------- results ---------- */
function drawResults(now){const r=G.result,st=G.stage;ctx.drawImage(st.bg,0,0);ctx.fillStyle='rgba(10,6,24,.66)';ctx.fillRect(0,0,W,H);
  const w=r.winner;logo('GAME!',Math.round(H*.05),now,1);
  const fy=Math.round(H*.05)+34+60;ctx.save();const c=portrait(w.ch,'win');ctx.translate(W/2,fy);ctx.drawImage(c,0,0,SP,SP,-OX*2,-OY*2,SP*2,SP*2);ctx.restore();
  txt(w.ch.name+' WINS!',W/2,fy+6,TAGC[w.slot],2,'c',K);
  const ty=fy+26;box(8,ty,W-16,62,'#1e1438','#ffd36a');
  const rows=[['KOS',f=>f.kos],['FALLS',f=>f.falls],['DAMAGE',f=>f.dealt+'%'],['BEST COMBO',f=>f.bestCombo],['PERFECT DODGE',f=>f.perfects]];
  txt('P1',W-58,ty+3,TAGC[0],1,'c');txt('CPU',W-26,ty+3,TAGC[1],1,'c');
  rows.forEach(([k,fn],i)=>{const yy=ty+13+i*9;txt(k,14,yy,'#c8b8ff');txt(fn(G.fighters[0]),W-58,yy,'#ffffff',1,'c');txt(fn(G.fighters[1]),W-26,yy,'#ffffff',1,'c')});
  if(G.resT<=0&&ty+70<H){hint('A: REMATCH',Math.min(H-20,ty+68),'#ffffff');hint('B: NEW FIGHTERS',Math.min(H-10,ty+78),'#ffffff')}}
function resultInput(){if(G.resT>0)return;const p=IN.pressed;if(p.a||p.start){SFX.pick();startFight(G.sel.picked[0],G.sel.picked[1],G.stageSel)}else if(p.b){SFX.back();toSelect(0)}}
