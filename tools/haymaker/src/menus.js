/* ================= menus: title, fighter select, the tower, moves, settings ================= */
function titleItems(){const it=[];if(SAVE.match)it.push(['CONTINUE MATCH','cont']);it.push(['VERSUS','vs'],[SAVE.tower?'TOWER · FIGHT '+(SAVE.tower.i+1)+'/'+SAVE.tower.ladder.length:'TOWER','tower'],['TRAINING','train'],['TIER LIST','tiers'],['LOCKER ROOM','lock'],['MOVES','moves'],['SETTINGS','set']);return it}
const titleIdx=k=>Math.max(0,titleItems().findIndex(x=>x[1]===k));
function titleTick(){const it=titleItems();menuNav(it.length);if(!(TAP('a')||TAP('start')))return;const k=it[MSEL][1];SFX.pick();
  if(k==='cont'){const s=SAVE.match;newMatch(s);VI={t:0};go('vsintro')}
  else if(k==='vs'||k==='train')openSelect(k);else if(k==='tiers')openTiers();else if(k==='tower'){if(SAVE.tower)go('ladder');else openSelect('tower')}
  else if(k==='lock')openLocker();else if(k==='moves')openMoves((SAVE.last&&SAVE.last.p1)||'milo','title');else if(k==='set')go('settings')}
function titleDraw(){const T=TT*60,it=titleItems(),mh=it.length*21*U+14*U,gyPx=groundY()*PS,below=SH-gyPx-24*U>=mh+8*U,fx=below?40:Math.min(BW*.3,130);
  drawStage('crown',[{id:'milo',P:idlePose(T,0),x:-fx,y:0,face:1},{id:'sable',P:Object.assign(idlePose(T,1),{ex:'smug'}),x:fx,y:0,face:-1}],{dim:.3});blit();ctx.setTransform(DPR,0,0,DPR,0,0);
  const g=ctx.createLinearGradient(0,SH*.07,0,SH*.07+46*U);g.addColorStop(0,'#fff2b0');g.addColorStop(1,'#e8962a');
  splashUI(SW/2,SH*.07+26*U,Math.min(SW*.3,96*U),'#c8263a',3);ctx.font=font(PORT?40:46,700);ctx.textAlign='center';ctx.textBaseline='top';ctx.lineWidth=9*U;ctx.strokeStyle='#0e0a14';ctx.lineJoin='round';ctx.strokeText('HAYMAKER',SW/2,SH*.07);ctx.fillStyle=g;ctx.fillText('HAYMAKER',SW/2,SH*.07);
  text('PORT EMBER FIGHT NIGHT',SW/2,SH*.07+48*U,9,'#ffd84a','center','#000',600);
  const y0=below?gyPx+14*U:SH*.62-it.length*11*U;panel(SW/2-80*U,y0-10*U,160*U,it.length*21*U+14*U,'rgba(14,10,24,.78)','#ffd84a',8);drawMenu(it.map(x=>x[0]),SW/2,y0,12,21*U);
  if(SAVE.done)text('★ TOWER CHAMPION ★',SW/2,y0+it.length*21*U+10*U,8,'#ffd84a','center','#000');
  help('D-PAD MOVE · A SELECT')}

/* ---------- fighter select ---------- */
let SEL=null;
function openSelect(mode){const L=SAVE.last||{};SEL={mode,stage:'p1',c1:RIX[L.p1]??0,c2:RIX[L.p2]??1,ring:Math.max(0,Object.keys(VENUES).indexOf(L.venue)),t:0,scroll:0};go('select')}
const VKEYS=Object.keys(VENUES);
const gridCols=()=>PORT?(SW<330?6:7):clamp(Math.floor((SW-16*U)/(50*U)),8,14);
function gridMove(c,d){const n=ROSTER.length,C=gridCols();if(d==='left')return(c+n-1)%n;if(d==='right')return(c+1)%n;
  if(d==='up')return c-C>=0?c-C:Math.min(n-1,(Math.ceil(n/C)-1)*C+c%C);if(d==='down')return c+C<n?c+C:c%C;return c}
const homeRing=f=>f.id==='sable'?'crown':f.venue;
function selectTick(dt){SEL.t+=dt;const d=menuDir(),n=ROSTER.length;
  if(SEL.stage==='ring'){if(d==='left'||d==='right'){SEL.ring=(SEL.ring+(d==='right'?1:-1)+VKEYS.length+1)%(VKEYS.length+1);SFX.move()}
    if(TAP('b')){SFX.back();SEL.stage='p2';return}
    if(TAP('a')||TAP('start')){SFX.horn();const v=SEL.ring===VKEYS.length?pick(VKEYS):VKEYS[SEL.ring];startMatch({mode:SEL.mode,p1:ROSTER[SEL.c1].id,p2:ROSTER[SEL.c2].id,venue:v})}return}
  const k=SEL.stage==='p1'?'c1':'c2';if(d){SEL[k]=gridMove(SEL[k],d);SFX.move()}
  if(TAP('select')){SEL[k]=Math.floor(rnd()*n);SFX.pick()}
  if(TAP('b')){SFX.back();if(SEL.stage==='p2')SEL.stage='p1';else go('title',titleIdx(SEL.mode));return}
  if(TAP('a')||TAP('start')){SFX.pick();RUMBLE.dodge();
    if(SEL.stage==='p1'){if(SEL.mode==='tower'){newTower(ROSTER[SEL.c1].id);go('ladder');return}SEL.stage='p2';if(SEL.c2===SEL.c1)SEL.c2=(SEL.c1+1)%n}
    else{SEL.stage='ring';SEL.ring=VKEYS.indexOf(homeRing(ROSTER[SEL.c2]))}}}
function statBar(lab,v,x,y,w){textB(lab,x,y,7,'#c8c0e0','left');const bx2=x+38*U,bw=w-38*U;rrect(bx2,y+1*U,bw,7*U,3*U);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fill();rrect(bx2,y+1*U,bw*clamp((v-.6)/.8,.08,1),7*U,3*U);ctx.fillStyle='#ffd84a';ctx.fill()}
const reachOf=f=>PEOPLE[f.id].build.s*(f.reach||1);
const TIERC={S:'#ff3a5a',A:'#ff8a2a',B:'#ffd84a',C:'#7dd84a',D:'#5ab0ff'};
function selectDraw(){const s=SEL,a=ROSTER[s.c1],b=ROSTER[s.c2],two=s.stage!=='p1',T=TT*60,n=ROSTER.length,C=gridCols();
  const ts=Math.min((SW-16*U)/C-3*U,64*U,PORT?1e9:SH*.12),rh=ts+3*U,vr=Math.max(2,Math.min(Math.ceil(n/C),Math.floor(SH*.34/rh))),gridY=SH-vr*rh-24*U,infoH=PORT?Math.min(80*U,SH*.17):Math.min(80*U,SH*.22),gyPx=gridY-infoH-10*U,gy=Math.floor(gyPx/PS),z=Math.min(1,(gy-26*U/PS)/100);
  const show=two?b:a,venue=s.stage==='ring'?(s.ring===VKEYS.length?VKEYS[Math.floor(TT*2)%VKEYS.length]:VKEYS[s.ring]):homeRing(show);
  const list=[{id:a.id,P:Object.assign(idlePose(T,0),{ex:'angry'}),x:two?-42:0,y:0,face:1}];if(two)list.push({id:b.id,P:Object.assign(idlePose(T,1),{ex:'smug'}),x:42,y:0,face:-1,alt:a.id===b.id});
  drawStage(venue,list,{gy,z,anchor:1,dim:.12});blit();ctx.setTransform(DPR,0,0,DPR,0,0);
  const head=s.stage==='p1'?(s.mode==='tower'?'TOWER · CHOOSE YOUR FIGHTER':s.mode==='train'?'TRAINING · YOUR FIGHTER':'CHOOSE YOUR FIGHTER'):s.stage==='p2'?(s.mode==='train'?'CHOOSE THE DUMMY':'CHOOSE YOUR OPPONENT'):'CHOOSE THE RING';
  text(head,SW/2,8*U,13,'#ffd84a','center','#0e0a14',700);
  /* info panel */
  const iy=gridY-infoH-4*U;panel(8*U,iy,SW-16*U,infoH,'rgba(14,10,24,.9)',s.stage==='p1'?'#3ee8ff':'#ff5a5a',8);
  if(s.stage==='ring'){const v=s.ring===VKEYS.length?null:VENUES[VKEYS[s.ring]];text('◀  '+(v?v.name:'RANDOM RING')+'  ▶',SW/2,iy+12*U,12,'#fff','center','#0e0a14',700);textB(v?v.place:'Any of the seven venues',SW/2,iy+32*U,9,'#c8c0e0','center');
    textB('A FIGHT · B BACK',SW/2,iy+infoH-16*U,8,'#ffd84a','center')}
  else{const f=show,tier=tierOf(f.id);text(fname(f.id),16*U,iy+6*U,11,'#fff','left','#0e0a14',700);textB((f.id==='milo'?'':'"'+f.nick+'" · ')+f.style,16*U,iy+21*U,8,'#c8c0e0','left');
    if(tier){rrect(SW-34*U,iy+6*U,20*U,16*U,4*U);ctx.fillStyle=TIERC[tier];ctx.fill();text(tier,SW-24*U,iy+6.5*U,11,'#0e0a14','center',null,700)}
    const cw=(SW-40*U)/2,y0=iy+33*U,gap=Math.min(11*U,(infoH-38*U)/4),st=[['SPEED',f.spd],['POWER',f.pow],['HEALTH',f.hp],['REACH',reachOf(f)]];
    if(gap>=9*U)st.forEach(([l,v],k)=>statBar(l,v,16*U,y0+gap*k,cw*.9));else st.forEach(([l,v],k)=>statBar(l,v,16*U+(k%2)*cw*.5,y0+Math.floor(k/2)*11*U,cw*.46));
    const sg=Math.min(13*U,(infoH-36*U)/3);f.sp.forEach((sp,i)=>{const yy=y0+i*sg,x=16*U+cw+6*U;text(SPIN[i],x,yy,7,'#ffd84a','left','#0e0a14',700);textB(sp.n,x+30*U,yy+1*U,7,'#fff','left')})}
  /* the grid, scrolling to keep the cursor in view */
  const cur=s.stage==='p1'?s.c1:s.c2,row=Math.floor(cur/C),rows=Math.ceil(n/C);if(row<s.scroll)s.scroll=row;if(row>s.scroll+vr-1)s.scroll=row-vr+1;s.scroll=clamp(s.scroll,0,Math.max(0,rows-vr));
  const gx=(SW-C*(ts+3*U)+3*U)/2;
  ctx.save();ctx.beginPath();ctx.rect(0,gridY-3*U,SW,vr*rh+4*U);ctx.clip();
  for(let i=s.scroll*C;i<Math.min(n,(s.scroll+vr)*C);i++){const f=ROSTER[i],x=gx+(i%C)*(ts+3*U),y=gridY+(Math.floor(i/C)-s.scroll)*rh,on1=i===s.c1,on2=two&&i===s.c2;
    rrect(x,y,ts,ts,5*U);ctx.fillStyle='#0e0a14';ctx.fill();portraitC(f.id,on1||on2?'angry':'guard',x+1.5*U,y+1.5*U,ts-3*U,shade(PEOPLE[f.id].gloves,-.35));
    if(on1||on2){rrect(x-1*U,y-1*U,ts+2*U,ts+2*U,6*U);ctx.lineWidth=3*U;ctx.strokeStyle=on2&&s.stage!=='p1'?'#ff5a5a':'#3ee8ff';ctx.stroke();if(on1&&on2){rrect(x+3*U,y+3*U,ts-6*U,ts-6*U,4*U);ctx.strokeStyle='#3ee8ff';ctx.lineWidth=2*U;ctx.stroke()}}
    if(SAVE.beaten[f.id]&&!on1&&!on2)text('✓',x+ts-3*U,y+1*U,7,'#7dff9a','right','#0e0a14')}
  ctx.restore();
  if(rows>vr){const bh=vr*rh,th=bh*vr/rows,ty=gridY+bh*s.scroll/rows;rrect(SW-5*U,gridY,3*U,bh,2*U);ctx.fillStyle='rgba(255,255,255,.15)';ctx.fill();rrect(SW-5*U,ty,3*U,th,2*U);ctx.fillStyle='#ffd84a';ctx.fill()}
  help(s.stage==='ring'?'◀ ▶ RING · A FIGHT · B BACK':(s.c1+1)+'/'+n+' · A PICK · SELECT RANDOM · B BACK')}

function newTower(me){const boss=me==='sable'?'milo':'sable',pool=ROSTER.map(f=>f.id).filter(id=>id!==me&&id!==boss);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  const ladder=pool.slice(0,7).sort((a,b)=>tierRank(a)-tierRank(b));ladder.push(boss);SAVE.tower={me,ladder,i:0};SAVE.match=null;saveNow(true)}
function towerLvl(i,n){return clamp(Math.round((SAVE.cpu||3)-1+i*2/Math.max(1,n-1)),1,5)}
function startTowerFight(){const T=SAVE.tower;if(!T){go('title');return}const op=T.ladder[T.i],last=T.i===T.ladder.length-1;
  startMatch({mode:'tower',p1:T.me,p2:op,venue:last?'crown':homeRing(ROSTER[RIX[op]]),lvl:towerLvl(T.i,T.ladder.length)})}
function ladderTick(){menuNav(2);if(TAP('b')){SFX.back();go('title',titleIdx('tower'));return}if(TAP('a')||TAP('start')){SFX.pick();if(MSEL===0)startTowerFight();else go('title',titleIdx('tower'))}}
function ladderDraw(){const T=SAVE.tower;if(!T){go('title');return}drawStage('crown',[{id:T.me,P:idlePose(TT*60),x:-62,y:0,face:1}],{dim:.45});blit();ctx.setTransform(DPR,0,0,DPR,0,0);
  text('THE TOWER',SW/2,8*U,16,'#ffd84a','center','#0e0a14',700);textB('Beat all '+T.ladder.length+'. The CPU gets tougher on the way up.',SW/2,30*U,8,'#e8e2d0','center','#000');
  const n=T.ladder.length,top=46*U,bot=SH*.7,rh=Math.min(40*U,(bot-top)/n),w=Math.min(SW*.62,230*U),x=SW-w-12*U;
  T.ladder.forEach((_,k)=>{const i=n-1-k,id=T.ladder[i],y=top+k*rh,cur=i===T.i,done=i<T.i;
    panel(x,y,w,rh-4*U,cur?'rgba(200,38,58,.9)':done?'rgba(14,10,24,.6)':'rgba(14,10,24,.88)',cur?'#ffd84a':'#5a4a6a',6);
    portraitC(id,cur?'angry':done?'hurt':'guard',x+3*U,y+2*U,rh-8*U,null);text((i+1)+'. '+short(id),x+rh,y+(rh-4*U)/2-6.5*U,10,done?'#8a8098':'#fff','left','#0e0a14',700);
    if(done)text('✓',x+w-8*U,y+(rh-4*U)/2-7*U,11,'#7dff9a','right','#0e0a14');else text('LV'+towerLvl(i,n),x+w-8*U,y+(rh-4*U)/2-5*U,7,cur?'#ffd84a':'#8a8098','right','#0e0a14')});
  drawMenu(['FIGHT '+short(T.ladder[T.i]),'TITLE'],SW/2,SH*.78,12,22*U);help('A SELECT · B BACK')}

/* ---------- move list ---------- */
let MV={i:0,back:'title'};
const KIND={proj:'Thrown across the ring',dash:'Rushing punch',rise:'Rising uppercut, launches',grab:'Command grab: can\'t be blocked',counter:'Parry stance: answers any punch',
  armor:'Heavy punch that takes a hit',multi:'Spinning hits, front and back',slam:'Leaping smash, hits low',tele:'Vanish and reappear behind',leap:'Leaping overhead',freeze:'Freezes them for a moment',flurry:'Rapid jabs',
  beam:'Long beam across the ring',rain:'Drops from above: block standing',pull:'Hook that reels them in',slide:'Low slide under highs',roll:'Roll through, can\'t be hit',
  heal:'Gets back some health (slow)',buff:'Hits 25% harder for 5 seconds',shield:'Shrugs off the next two hits',trap:'Sets a trap on the floor',quake:'Shockwave on the ground: crouch',
  reflect:'Sends projectiles back',drain:'Steals health back',barrage:'Three-hit rush, the last launches'};
function openMoves(id,back){MV={i:RIX[id]||0,back};go('moves')}
function movesTick(){const d=menuDir();if(d==='left'||d==='right'){MV.i=(MV.i+(d==='right'?1:ROSTER.length-1))%ROSTER.length;SFX.move()}if(TAP('b')||TAP('a')||TAP('start')){SFX.back();if(MV.back==='pause')go('pause',M&&M.train?6:1);else if(MV.back==='tiers')go('tiers');else go('title',titleIdx('moves'))}}
function movesDraw(){const f=ROSTER[MV.i];drawStage(homeRing(f),[{id:f.id,P:idlePose(TT*60),x:BW/2-40,y:0,face:-1}],{dim:.6});blit();ctx.setTransform(DPR,0,0,DPR,0,0);
  text('◀  '+short(f.id)+'  ▶',SW/2,8*U,15,'#ffd84a','center','#0e0a14',700);textB(f.style,SW/2,28*U,8,'#c8c0e0','center');
  const rows=[['SPECIALS',null],...f.sp.map((s,i)=>[SPIN[i]+'  '+s.n,KIND[s.k]]),['BASICS',null],['A · A · B','Jab, jab, cross string'],['▼ + A','Low jab: crouch blocks it'],['▼ + B','Uppercut: launches them'],['→ + B','Overhead: beats a crouch'],
    ['A + B (CLOSE)','Throw'],['▲ THEN A / B','Jump-in attack'],['HOLD ←','Block (not lows)'],['HOLD ▼','Ducks highs, blocks lows'],
    ['FINISHERS',null],['▼ + A + B','Fatal Haymaker, under 30% health'],['COUNTER-HIT ▼B','Crushing Blow, once a match'],['↓ → ↓ + B','Finisher, at FINISH THEM']];
  const top=44*U,lw=Math.max(...rows.filter(r=>r[1]).map(r=>tw(r[0],8,700))),dx=14*U+lw+8*U,dw=SW-dx-8*U,two=dw<120*U,rh=Math.min(two?24*U:16*U,(SH-top-24*U)/rows.length);let y=top;
  for(const[a,b]of rows){if(!b){text(a,14*U,y+(two?5:2)*U,9,'#ff5a5a','left','#0e0a14',700)}else{text(a,14*U,y,8,'#fff','left','#0e0a14',700);textB(b,two?22*U:dx,two?y+10.5*U:y+1*U,7,'#e8e2d0','left','#000')}y+=rh}
  help('◀ ▶ FIGHTER · B BACK')}

/* ---------- settings ---------- */
const LVN=['ROOKIE','CONTENDER','PRO','CHAMP','LEGEND'];
function setItems(){return['CPU  '+(SAVE.cpu||3)+' · '+LVN[(SAVE.cpu||3)-1],'ROUNDS  BEST OF '+(SAVE.rounds||3),'ROUND TIME  '+(SAVE.time===0?'NO LIMIT':(SAVE.time||60)+'S'),'SOUND  '+(muted?'OFF':'ON'),'VIBRATION  '+(HAP.on?'ON':'OFF'),'BACK']}
function settingsTick(){const it=setItems();const d=menuNav(it.length),ch=d==='left'?-1:d==='right'?1:TAP('a')?1:0;
  if(TAP('b')||(TAP('a')&&MSEL===5)){SFX.back();saveNow();go('title',titleIdx('set'));return}if(!ch)return;
  if(MSEL===0){SAVE.cpu=clamp((SAVE.cpu||3)+ch,1,5);SFX.move()}
  else if(MSEL===1){const o=[1,3,5];SAVE.rounds=o[(o.indexOf(SAVE.rounds||3)+ch+3)%3];SFX.move()}
  else if(MSEL===2){const o=[45,60,90,0];SAVE.time=o[(o.indexOf(SAVE.time??60)+ch+4)%4];SFX.move()}
  else if(MSEL===3){setMute(!muted);if(!muted)SFX.pick()}else if(MSEL===4){HAP.on=!HAP.on;store.set('vib',HAP.on);buzz([30,60,30]);SFX.move()}}
function settingsDraw(){drawStage('gym',[],{dim:.62});blit();ctx.setTransform(DPR,0,0,DPR,0,0);text('SETTINGS',SW/2,SH*.14,20,'#fff','center','#000',700);drawMenu(setItems(),SW/2,SH*.3,12,22*U);
  const notes=['How hard the CPU fights in Versus. The Tower starts one level lower and ends one higher.','','','','',''];if(notes[MSEL])wrap(notes[MSEL],SW*.8,9).forEach((l,i)=>textB(l,SW/2,SH*.3+6*22*U+8*U+i*12*U,9,'#c8c0e0','center'));help('◀ ▶ CHANGE · B BACK')}
