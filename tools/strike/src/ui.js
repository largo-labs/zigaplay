/* ================= screens: title, controls, settings, records, select, pause, results ================= */
let SCR='title',MSEL=0,SEL={mode:'fight',phase:0,cur:[0,1],stage:0},MSG=null;
const TAP=b=>!!RAW.tap[b];
function go(s,sel=0){SCR=s;MSEL=sel}
function dummy(c,face=1,st='stand'){return{c,st,x:0,y:0,face,vx:0,vy:0,anim:FRAME*.25,mv:null,gr:{},hl:0,inv:0,hide:0,trail:[],boxes:[],flash:0,t:0,sh:50}}
function drawDummy(d,x,y,k){ctx.setTransform(DPR*k,0,0,DPR*k,DPR*x,DPR*y);drawFighter(d);ctx.setTransform(DPR,0,0,DPR,0,0)}
function panel(x,y,w,h,col='rgba(8,8,22,.82)',edge='rgba(255,255,255,.14)'){rrect(x,y,w,h,8*U);ctx.fillStyle=col;ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle=edge;ctx.stroke()}
function menuList(items,x,y,px,gap,sel,al='center'){items.forEach((it,i)=>{const on=i===sel,yy=y+i*gap;
  if(on){const w=Math.max(150*U,ctx.measureText?0:0);ctx.font=font(px);const tw=ctx.measureText(it).width;const bx=al==='center'?x-tw/2-14*U:x-10*U;
    rrect(bx,yy-3*U,tw+28*U,px*U+7*U,5*U);ctx.fillStyle='rgba(255,79,168,.22)';ctx.fill();ctx.strokeStyle='#ff4fa8';ctx.lineWidth=1.5;ctx.stroke()}
  text(it,x,yy,px,on?'#ffffff':'#a8a8c8',al,800,on?'rgba(0,0,0,.5)':null)})}
function hint(s){text(s,SW/2,SH-16*U,PORT?8:9,'rgba(220,220,255,.7)','center',700)}
/* text wrapped to a width; returns the y under it */
function wrap(s,x,y,maxW,px,col,al='center',w=700){ctx.font=font(px,w);let line='',yy=y;const lh=px*U*1.35;
  for(const wd of s.split(' ')){const t=line?line+' '+wd:wd;if(line&&ctx.measureText(t).width>maxW){text(line,x,yy,px,col,al,w);yy+=lh;line=wd}else line=t}if(line){text(line,x,yy,px,col,al,w);yy+=lh}return yy}
/* ---------- title ---------- */
let TITLE_F=[0,1];function rollTitle(){TITLE_F=[Math.floor(rnd()*50),Math.floor(rnd()*50)]}rollTitle();
function titleItems(){const a=[];if(SAVE.match)a.push('RESUME MATCH');a.push('FIGHT','TRAINING','CONTROLS','SETTINGS','RECORDS');return a}
function titleTick(){const it=titleItems(),d=menuDir();if(d==='up'){MSEL=(MSEL+it.length-1)%it.length;SFX.move()}if(d==='down'){MSEL=(MSEL+1)%it.length;SFX.move()}
  if(TAP('a')||TAP('start')){const s=it[MSEL];SFX.pick();
    if(s==='RESUME MATCH')resumeMatch();else if(s==='FIGHT'){SEL.mode='fight';SEL.phase=0;go('select')}else if(s==='TRAINING'){SEL.mode='train';SEL.phase=0;go('select')}
    else if(s==='CONTROLS')go('controls');else if(s==='SETTINGS')go('settings');else go('records')}}
function titleDraw(){drawSky('roof');ctx.setTransform(DPR,0,0,DPR,0,0);const W=SW,Hh=SH;
  const gy=Hh*(PORT?.86:.8),ty=PORT?Hh*.07:16*U;ctx.fillStyle='#0a0b1e';ctx.fillRect(0,gy,W,Hh-gy);ctx.fillStyle='#ff4fa8';ctx.fillRect(0,gy,W,1.5);
  const k=(PORT?1.8:2.2)*U;drawDummy(dummy(ROSTER[TITLE_F[0]],1),W*(PORT?.2:.13),gy,k);drawDummy(dummy(ROSTER[TITLE_F[1]],-1),W*(PORT?.8:.87),gy,k);
  const g=.5+.5*Math.sin(FRAME*.05);ctx.shadowColor='#ff4fa8';ctx.shadowBlur=18*U*g;text('HAMMER',W/2,ty,PORT?40:46,'#ffffff','center',900,'#2a0a2a');ctx.shadowBlur=0;
  text('F A L L',W/2,ty+46*U,22,'#ff8ad0','center',900,'#14061a');
  menuList(titleItems(),W/2,PORT?Math.max(ty+86*U,Hh*.3):104*U,15,22*U,MSEL);hint('▲▼ choose · A select · 50 fighters')}
/* ---------- controls ---------- */
const BTN_ORDER=['a','b','up','down','select'];
function controlsTick(){const n=ACTS.length+2,d=menuDir();if(d==='up'){MSEL=(MSEL+n-1)%n;SFX.move()}if(d==='down'){MSEL=(MSEL+1)%n;SFX.move()}
  if(MSEL<ACTS.length&&(d==='left'||d==='right')){const a=ACTS[MSEL][0],i=BTN_ORDER.indexOf(CTRL[a]),j=(i+(d==='right'?1:BTN_ORDER.length-1))%BTN_ORDER.length;assign(a,BTN_ORDER[j]);SFX.move()}
  if(TAP('a')){if(MSEL===ACTS.length){CTRL=Object.assign({},CTRL_DEF);saveCtrl();SFX.pick();MSG={s:'CONTROLS RESET',t:90}}else if(MSEL===ACTS.length+1){SFX.back();go(BACKTO||'title',BACKTO?2:3);BACKTO=null}
    else{const a=ACTS[MSEL][0],i=BTN_ORDER.indexOf(CTRL[a]);assign(a,BTN_ORDER[(i+1)%BTN_ORDER.length]);SFX.move()}}
  if(TAP('b')){SFX.back();go(BACKTO||'title',BACKTO?2:3);BACKTO=null}}
let BACKTO=null;
function controlsDraw(){drawSky('clock');ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='rgba(4,4,14,.6)';ctx.fillRect(0,0,SW,SH);const W=SW,pw=Math.min(W-(PORT?16:30)*U,380*U),px=(W-pw)/2;
  text('CONTROLS',W/2,12*U,22,'#fff','center',900,'#000');panel(px,44*U,pw,ACTS.length*24*U+64*U);
  ACTS.forEach(([a,label],i)=>{const y=54*U+i*24*U,on=MSEL===i;if(on){rrect(px+6*U,y-4*U,pw-12*U,22*U,5*U);ctx.fillStyle='rgba(255,79,168,.2)';ctx.fill()}
    text(label,px+16*U,y,12,on?'#fff':'#b8b8d8','left');text('◀ '+BTN_NAMES[CTRL[a]]+' ▶',px+pw-16*U,y,12,on?'#ffd84a':'#e8e8ff','right')});
  const y2=54*U+ACTS.length*24*U;['RESET DEFAULTS','BACK'].forEach((s,i)=>{const on=MSEL===ACTS.length+i;text(s,W/2,y2+i*20*U,12,on?'#ffd84a':'#a8a8c8','center',800)});
  let yy=44*U+ACTS.length*24*U+74*U;const N=BTN_NAMES,mw=pw-8*U;
  for(const l of['◀ ▶ move · '+N[CTRL.jump]+' jump, again in the air to double jump · '+N[CTRL.attack]+' attack (with a direction for other attacks)',
    'hold away from your foe + '+N[CTRL.attack]+' for a back attack · '+N[CTRL.special]+' alone blocks (in the air: dodge) · '+N[CTRL.special]+' with ▲ or ◀▶ is that special · '+N[CTRL.block]+' blocks',
    'block + '+N[CTRL.attack]+' grabs · block + ◀▶ rolls · ▼ in the air falls fast · ▼ twice drops through a platform'])yy=wrap(l,W/2,yy,mw,8.5,'#c8c8e8')+3*U;
  hint('▲▼ choose · ◀▶ change button · B back')}
/* ---------- settings ---------- */
const TIMES=[0,2,3,5];
function setItems(){const S=SAVE.set;return['STOCKS  '+S.stocks,'CPU LEVEL  '+S.level,'TIME LIMIT  '+(S.time?S.time+' MIN':'OFF'),'SOUND  '+(muted?'OFF':'ON'),'VIBRATION  '+(HAP.on?'ON':'OFF'),'BACK']}
function settingsTick(){const it=setItems(),d=menuDir(),S=SAVE.set;if(d==='up'){MSEL=(MSEL+it.length-1)%it.length;SFX.move()}if(d==='down'){MSEL=(MSEL+1)%it.length;SFX.move()}
  const ch=d==='left'?-1:d==='right'||TAP('a')?1:0;
  if(ch&&MSEL===0){S.stocks=(S.stocks-1+ch+5)%5+1;SFX.move()}else if(ch&&MSEL===1){S.level=(S.level-1+ch+9)%9+1;SFX.move()}else if(ch&&MSEL===2){S.time=TIMES[(TIMES.indexOf(S.time)+ch+TIMES.length)%TIMES.length];SFX.move()}
  else if(ch&&MSEL===3){setMute(!muted);if(!muted)SFX.pick()}else if(ch&&MSEL===4){HAP.on=!HAP.on;store.set('vib',HAP.on);haptic(20);SFX.move()}else if(TAP('a')&&MSEL===5){SFX.back();go('title',4)}
  if(TAP('b')){SFX.back();go('title',4)}}
function settingsDraw(){drawSky('bridge');ctx.setTransform(DPR,0,0,DPR,0,0);text('SETTINGS',SW/2,12*U,22,'#fff','center',900,'#000');const it=setItems();panel(SW/2-130*U,44*U,260*U,it.length*22*U+16*U);
  menuList(it,SW/2,54*U,13,22*U,MSEL);hint('▲▼ choose · ◀▶ or A change · B back')}
/* ---------- records ---------- */
function recordsTick(){if(TAP('b')||TAP('a')){SFX.back();go('title',5)}const d=menuDir();if(d==='down')MSEL++;if(d==='up')MSEL=Math.max(0,MSEL-1)}
function recordsDraw(){drawSky('docks');ctx.setTransform(DPR,0,0,DPR,0,0);const T=SAVE.tot||{w:0,l:0,ko:0};text('RECORDS',SW/2,12*U,22,'#fff','center',900,'#000');
  text(`WINS ${T.w}   LOSSES ${T.l}   KOs ${T.ko}`,SW/2,42*U,13,'#ffd84a','center');
  const rows=ROSTER.map(c=>({c,r:SAVE.rec[c.i]||{w:0,l:0}})).filter(x=>x.r.w+x.r.l>0).sort((a,b)=>b.r.w-a.r.w||a.r.l-b.r.l);
  if(!rows.length)text('No matches yet. Go fight!',SW/2,90*U,12,'#c8c8e8','center');
  const per=Math.max(1,Math.floor((SH-110*U)/20/U));MSEL=Math.min(MSEL,Math.max(0,rows.length-per));
  rows.slice(MSEL,MSEL+per).forEach((x,i)=>{const y=66*U+i*20*U;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.save();ctx.beginPath();ctx.arc(SW/2-110*U,y+6*U,8*U,0,TAU);ctx.clip();drawBust(x.c,SW/2-110*U,y+7*U,.85*U);ctx.restore();text(x.c.name,SW/2-94*U,y,11,'#fff','left');text(`${x.r.w} W  ${x.r.l} L`,SW/2+110*U,y,11,'#c8c8e8','right')});
  hint('▲▼ scroll · B back')}
/* ---------- character select ---------- */
function selGeom(){if(PORT){const cell=(SW-12*U)/10;return{cell,gx:6*U,gy:30*U}}const gw=Math.min(SW*.6,SW-190*U),cell=Math.min((gw-8*U)/10,(SH-70*U)/5);return{cell,gx:10*U,gy:34*U}}
function selectTick(){const d=menuDir(),p=SEL.phase;let c=SEL.cur[p];
  if(p<2){if(d==='left'){c=c%10?c-1:c+9;SFX.move()}if(d==='right'){c=c%10<9?c+1:c-9;SFX.move()}if(d==='up'){c=(c+40)%50;SFX.move()}if(d==='down'){c=(c+10)%50;SFX.move()}SEL.cur[p]=c;
    if(TAP('select')){SEL.cur[p]=Math.floor(rnd()*50);SFX.pick()}
    if(TAP('a')||TAP('start')){SFX.pick();if(p===0)SEL.phase=1;else{SEL.phase=2;go('stage',SEL.stage)}}
    if(TAP('b')){SFX.back();if(p===1)SEL.phase=0;else go('title',SEL.mode==='train'?2:1)}}}
function selectDraw(){drawSky('roof');ctx.setTransform(DPR,0,0,DPR,0,0);const{cell,gx,gy}=selGeom(),p=Math.min(1,SEL.phase);
  text(SEL.mode==='train'?(PORT?'TRAINING · PICK':'TRAINING · PICK YOUR FIGHTER'):p===0?'PICK YOUR FIGHTER':'PICK THE CPU FIGHTER',gx,10*U,PORT?13:14,'#fff','left',900,'#000');
  for(let i=0;i<50;i++){const c=ROSTER[i],x=gx+(i%10)*cell,y=gy+Math.floor(i/10)*cell;rrect(x+1,y+1,cell-2,cell-2,4*U);ctx.fillStyle=shade(c.body,-.55);ctx.fill();
    ctx.save();ctx.beginPath();rrect(x+1,y+1,cell-2,cell-2,4*U);ctx.clip();drawBust(c,x+cell/2,y+cell*.56,cell/17);ctx.fillStyle=GROUPS[c.grp].col;ctx.fillRect(x+2,y+cell-4*U,cell-4,2*U);ctx.restore();
    for(const q of[0,1]){if(SEL.cur[q]===i&&(q<=SEL.phase)){ctx.lineWidth=q===p?3:2;ctx.strokeStyle=q===0?'#ff4a5a':'#7aa0ff';rrect(x+1,y+1,cell-2,cell-2,4*U);ctx.stroke();
      text(q===0?'P1':'CPU',x+3*U,y+2*U,7,q===0?'#ff4a5a':'#7aa0ff','left',900,'#000')}}}
  /* who is under the cursor: beside the grid on a wide screen, under it on an upright one */
  const c=ROSTER[SEL.cur[p]];let px,py,pw,ph;if(PORT){px=gx;py=gy+cell*5+6*U;pw=SW-2*gx;ph=SH-py-26*U}else{px=gx+cell*10+10*U;py=gy;pw=SW-px-8*U;ph=SH-gy-30*U}panel(px,py,pw,ph);
  const nx=PORT?px+(ph>230*U?106:92)*U:px+pw*.48;const big=PORT&&ph>230*U;drawDummy(dummy(c,1),PORT?px+46*U:px+pw*.24,py+(big?112:PORT?82:88)*U,(big?2.3:PORT?1.65:1.8)*U);
  text(c.name,nx,py+6*U,17,'#fff','left',900,'#000');text(c.title,nx,py+27*U,8.5,c.acc,'left',800);text(GROUPS[c.grp].name,nx,py+38*U,7.5,GROUPS[c.grp].col,'left',900);
  const bars=[['SPEED',c.spd],['POWER',c.pow],['WEIGHT',{l:1,m:3,h:5}[c.build]]];bars.forEach(([n,v],i)=>{const y=py+50*U+i*11*U;text(n,nx,y,7.5,'#a8a8c8','left',800);
    for(let k=0;k<5;k++){ctx.fillStyle=k<v?c.acc:'rgba(255,255,255,.12)';ctx.fillRect(nx+42*U+k*9*U,y+1*U,7*U,6*U)}});
  const sp=[['B+▲',c.up],['B+◀▶',c.side]],sy=py+(big?126:PORT?100:98)*U,sg=PORT?Math.min(30*U,(ph-(big?130:104)*U)/2):26*U;
  sp.forEach(([k,m],i)=>{const y=sy+i*sg;text(k,px+10*U,y,8.5,'#ffd84a','left',900);text(m.name,px+46*U,y,9.5,'#fff','left',900);text(SPDESC[m.kind],px+46*U,y+11*U,7.5,'#b8b8d8','left',700)});
  if(p===1){const a=ROSTER[SEL.cur[0]];if(PORT)text('YOU: '+a.name,SW-gx,12*U,8,'#ff4a5a','right',900);else text('YOU: '+a.name,px+10*U,SH-48*U,9,'#ff4a5a','left',900)}
  hint('D-pad move · A pick · SELECT random · B back')}
/* ---------- stage select ---------- */
function stageTick(){const d=menuDir(),n=STAGES.length,cols=PORT?2:4;if(d==='left'){MSEL=(MSEL+n-1)%n;SFX.move()}if(d==='right'){MSEL=(MSEL+1)%n;SFX.move()}if(d==='up'||d==='down'){MSEL=(MSEL+(d==='up'?n-cols:cols))%n;SFX.move()}
  if(TAP('a')||TAP('start')){SEL.stage=MSEL;SFX.go();startMatch({chars:[SEL.cur[0],SEL.cur[1]],stage:MSEL,train:SEL.mode==='train'})}
  if(TAP('b')){SFX.back();SEL.phase=1;go('select')}}
function stageDraw(){drawSky(STAGES[MSEL].id);ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,0,SW,SH);
  text('PICK A STAGE',SW/2,PORT?14*U:12*U,18,'#fff','center',900,'#000');
  const cols=PORT?2:4,rows=Math.ceil(STAGES.length/cols),w=PORT?(SW-30*U)/2:Math.min(96*U,(SW-50*U)/4),gap=PORT?10*U:8*U,top=PORT?44*U:40*U,h=Math.min(PORT?w*.62:64*U,(SH-top-40*U)/rows-gap-16*U);
  STAGES.forEach((s,i)=>{const cx=i%cols,cy=Math.floor(i/cols),x=SW/2+(cx-(cols-1)/2)*(w+gap)-w/2,y=top+cy*(h+gap+16*U),on=i===MSEL;
    panel(x,y,w,h,on?'rgba(255,79,168,.25)':'rgba(8,8,22,.8)',on?'#ff4fa8':'rgba(255,255,255,.2)');
    const M=s.main,k=w/380,by=y+h*.78;ctx.fillStyle='#c8c8e8';ctx.fillRect(x+w/2+M.x1*k,by,(M.x2-M.x1)*k,3*U);for(const p of s.plats)ctx.fillRect(x+w/2+p.x1*k,by+p.y*k*.9,(p.x2-p.x1)*k,2*U);
    text(s.name,x+w/2,y+h+4*U,9,on?'#fff':'#a8a8c8','center',900)});
  hint('D-pad choose · A fight! · B back')}
/* ---------- pause and move list ---------- */
function pauseItems(){return['RESUME','MOVE LIST','CONTROLS',MATCH.train?'END TRAINING':'QUIT MATCH']}
function pauseTick(){const it=pauseItems(),d=menuDir();if(d==='up'){MSEL=(MSEL+it.length-1)%it.length;SFX.move()}if(d==='down'){MSEL=(MSEL+1)%it.length;SFX.move()}
  if(TAP('start')||TAP('b')){SFX.back();go('fight');return}
  if(TAP('a')){const s=it[MSEL];if(s==='RESUME'){SFX.back();go('fight')}else if(s==='MOVE LIST'){SFX.pick();go('moves')}else if(s==='CONTROLS'){SFX.pick();BACKTO='pause';go('controls')}
    else{SFX.back();SAVE.match=null;saveNow();rollTitle();go('title')}}}
function pauseDraw(){fightDraw();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='rgba(4,4,14,.6)';ctx.fillRect(0,0,SW,SH);text('PAUSED',SW/2,30*U,24,'#fff','center',900,'#000');
  menuList(pauseItems(),SW/2,76*U,14,22*U,MSEL);hint('▲▼ choose · A select · START resume')}
function movesTick(){if(TAP('b')||TAP('a')||TAP('start')){SFX.back();go('pause',1)}}
function movesDraw(){fightDraw();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='rgba(4,4,14,.85)';ctx.fillRect(0,0,SW,SH);const c=FT[0].c,A=BTN_NAMES[CTRL.attack],B=BTN_NAMES[CTRL.special];
  text(c.name+' · MOVES',SW/2,8*U,16,'#fff','center',900,'#000');text(GROUPS[c.grp].name,SW/2,26*U,8,GROUPS[c.grp].col,'center',900);
  const g={L:['shoot (tap again to keep firing)','heavy blast','back kick','shoot upward','low sweep','spin kick · ▶ shoot · ◀ back kick · ▲ shoot up · ▼ shoot down'],
    M:['slash, slash, thrust','lunging stab','backslash','rising slash (pops them up)','low slash','spin slash · ▶ overhead · ◀ backslash · ▲ arc · ▼ down stab'],
    C:['jab, cross, knee','straight punch','spinning backfist','uppercut (pops them up)','low kick','knee · ▶ punch · ◀ back kick · ▲ flip kick · ▼ stomp']}[c.grp];
  const L=[[A,g[0]],['▶ + '+A,g[1]],['◀ + '+A+' (away)',g[2]],['▲ + '+A,g[3]],['▼ + '+A,g[4]],['air '+A,g[5]],
    [B+' + ▲',c.up.name+' · '+SPDESC[c.up.kind]],[B+' + ◀▶',c.side.name+' · '+SPDESC[c.side.kind]],[B+' / '+BTN_NAMES[CTRL.block],'block (just before a hit: parry) · + '+A+' grab · + ◀▶ roll']];
  if(PORT){let y=40*U;for(const[k,v]of L){text(k,14*U,y,10,'#ffd84a','left',900);y=wrap(v,22*U,y+13*U,SW-34*U,9,'#e8e8ff','left')+5*U}}
  else L.forEach(([k,v],i)=>{const y=40*U+i*19*U;text(k,SW/2-60*U,y,10,'#ffd84a','right',900);text(v,SW/2-50*U,y,10,'#e8e8ff','left',700)});hint('B back')}
/* ---------- results ---------- */
function resultsTick(){const d=menuDir();if(d==='up'||d==='down'){MSEL=(MSEL+1)%3;SFX.move()}
  if(TAP('a')||TAP('start')){SFX.pick();const R=MATCH.res;if(MSEL===0)startMatch({chars:R.chars,stage:R.stage,train:false});else if(MSEL===1){SEL.mode='fight';SEL.phase=0;go('select')}else{rollTitle();go('title')}}}
function resultsDraw(){const R=MATCH.res;drawSky(STAGES[R.stage].id);ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(0,0,SW,SH);
  const win=ROSTER[R.chars[R.win]],lose=ROSTER[R.chars[1-R.win]];text(R.win===0?'YOU WIN!':'CPU WINS',SW/2,10*U,26,R.win===0?'#ffd84a':'#7aa0ff','center',900,'#000');
  text(win.name+' · '+win.title,SW/2,44*U,11,win.acc,'center',800);
  const fy=PORT?172*U:SH*.78,sy=PORT?182*U:62*U,my=PORT?sy+80*U:140*U;
  drawDummy(dummy(win,1,'stand'),SW*(PORT?.3:.22),fy,(PORT?2:2.3)*U);drawDummy(dummy(lose,-1,'down'),SW*(PORT?.76:.82),fy,(PORT?1.35:1.5)*U);
  panel(SW/2-95*U,sy,190*U,72*U);panel(SW/2-80*U,my-4*U,160*U,62*U);const S=R.stats;['KOs','FALLS','DAMAGE'].forEach((h,i)=>{const y=sy+4*U+(i+1)*16*U;text(h,SW/2,y,9,'#a8a8c8','center',800);
    text(String(S[0][i]),SW/2-50*U,y,11,'#ff4a5a','center',900);text(String(S[1][i]),SW/2+50*U,y,11,'#7aa0ff','center',900)});
  text('YOU',SW/2-50*U,sy+4*U,9,'#ff4a5a','center',900);text('CPU',SW/2+50*U,sy+4*U,9,'#7aa0ff','center',900);
  menuList(['REMATCH','NEW FIGHTERS','TITLE'],SW/2,my,12,19*U,MSEL);hint('▲▼ choose · A select')}
