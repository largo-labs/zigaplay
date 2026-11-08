/* ================= screens ================= */
let SCR='title',MSEL=0,TT=0,BACKTO='title',MSG=null;
function go(s,sel=0){SCR=s;MSEL=sel;SFX.move()}
function toast(s){MSG={s,t:2}}
const fmtT=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function menuNav(n){const d=menuDir();if(d==='up'){MSEL=(MSEL+n-1)%n;SFX.move()}else if(d==='down'){MSEL=(MSEL+1)%n;SFX.move()}return d}
function drawMenu(items,x,y,px,gap,al='center'){items.forEach((s,i)=>{const on=i===MSEL,yy=y+i*gap;if(on){const w=tw(s,px,700)+26*U;rrect(al==='center'?x-w/2:x-10*U,yy-3*U,w,px*U+7*U,6*U);ctx.fillStyle='rgba(255,216,74,.18)';ctx.fill()}
  text((on?'▸ ':'')+s,x,yy,px,on?'#ffd84a':'#e8e2d0',al,'#120c14',700)})}
function help(s){text(s,SW/2,SH-16*U,9,'rgba(255,255,255,.75)','center','#000',600)}
function dimAll(a){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle=`rgba(6,4,14,${a})`;ctx.fillRect(0,0,SW,SH)}

/* ---------- title ---------- */
function titleItems(){const it=[];if(SAVE.fight||(SAVE.step>0&&!SAVE.done))it.push(['CONTINUE','cont']);it.push([SAVE.step>0||SAVE.done?'NEW STORY':'START STORY','new'],['CIRCUIT','circ'],['HOW TO PLAY','how'],['SETTINGS','set']);return it}
let CONFIRM=null;const titleIdx=k=>Math.max(0,titleItems().findIndex(x=>x[1]===k));
function titleTick(){const it=titleItems();
  if(CONFIRM){if(TAP('a')){CONFIRM=null;SAVE.step=0;SAVE.done=false;SAVE.fight=null;saveNow(true);SFX.pick();advanceStory()}else if(TAP('b')){CONFIRM=null;SFX.back()}return}
  menuNav(it.length);if(TAP('a')||TAP('start')){const k=it[MSEL][1];SFX.pick();
    if(k==='cont'){if(SAVE.fight){const f=SAVE.fight;newFight(f.oi,{resume:f,story:f.story});go('fight')}else advanceStory()}
    else if(k==='new'){if(SAVE.step>0&&!SAVE.done)CONFIRM=1;else{SAVE.step=0;SAVE.done=false;SAVE.fight=null;advanceStory()}}
    else if(k==='circ')go('circuit');else if(k==='how'){BACKTO='title';HOW=0;go('howto')}else if(k==='set')go('settings')}}
function titleDraw(){drawScene('crown',TT,null,null,{dim:.35});blit();ctx.setTransform(DPR,0,0,DPR,0,0);
  const ps=Math.min(SW*.42,SH*.27),py=SH-ps-24*U;portrait('milo','angry',SW*.03,py,ps);portrait('sable','smug',SW*.97-ps,py,ps);text('VS',SW/2,py+ps*.45,16,'#ffd84a','center','#2a0c0c',700);
  const g=ctx.createLinearGradient(0,SH*.08,0,SH*.2);g.addColorStop(0,'#fff2b0');g.addColorStop(1,'#e8962a');
  ctx.font=font(PORT?40:46,700);ctx.textAlign='center';ctx.textBaseline='top';ctx.lineWidth=7*U;ctx.strokeStyle='#2a0c0c';ctx.lineJoin='round';ctx.strokeText('HAYMAKER',SW/2,SH*.09);ctx.fillStyle=g;ctx.fillText('HAYMAKER',SW/2,SH*.09);
  text('A PORT EMBER BOXING STORY',SW/2,SH*.09+48*U,9,'#ffd84a','center','#000',600);
  const it=titleItems();drawMenu(it.map(x=>x[0]),SW/2,SH*.36,13,21*U);
  if(SAVE.done)text('★ CHAMPION OF PORT EMBER ★',SW/2,SH*.36+it.length*21*U+4*U,8,'#ffd84a','center','#000');
  if(CONFIRM){dimAll(.7);panel(SW*.08,SH*.36,SW*.84,92*U);for(const[i,l]of wrap('Start the story over? Your circuit records stay.',SW*.74,11).entries())text(l,SW/2,SH*.36+12*U+i*15*U,11,'#fff','center');text('A YES · B NO',SW/2,SH*.36+66*U,11,'#ffd84a','center')}
  help('D-PAD MOVE · A SELECT')}

/* ---------- story ---------- */
let SC=null;
function advanceStory(){if(SAVE.step>=STORY.length){SAVE.done=true;SAVE.step=0;saveNow(true);go('title');return}
  const s=STORY[SAVE.step];if(s[0]==='s'){SC={id:s.slice(2),i:0,ch:0,t:0};go('story')}else{CARD={oi:+s.slice(2),story:true};go('card')}}
function storyTick(dt){const sc=SCENES[SC.id],ln=sc.lines[SC.i],full=ln[1].length;SC.t+=dt;const before=Math.floor(SC.ch);SC.ch=Math.min(full,SC.ch+dt*48);if(Math.floor(SC.ch)>before&&Math.floor(SC.ch)%3===0&&SC.ch<full)SFX.blip();
  if(TAP('start')){endScene();return}
  if(TAP('a')||TAP('b')){if(SC.ch<full)SC.ch=full;else{SC.i++;SC.ch=0;SC.t=0;SFX.move();if(SC.i>=sc.lines.length)endScene()}}}
function endScene(){if(SC.id==='ending'){SAVE.done=true;SAVE.step=0;SAVE.fight=null;saveNow(true);SC=null;go('title');toast('THE END · CIRCUIT OPEN');return}SAVE.step++;saveNow();SC=null;advanceStory()}
function storyDraw(){const sc=SCENES[SC.id],ln=sc.lines[SC.i],who=ln[0];drawScene(sc.bg,TT,null,null,{dim:.42});blit();ctx.setTransform(DPR,0,0,DPR,0,0);
  const bh=Math.max(96*U,SH*.27),by=SH-bh-8*U,bxx=8*U,bw=SW-16*U;
  if(who){const ps=Math.min(SW*.46,SH*.34,170*U),left=who==='milo',px=left?bxx+4*U:SW-bxx-4*U-ps,py=by-ps+6*U;
    rrect(px-3*U,py-3*U,ps+6*U,ps+6*U,8*U);ctx.fillStyle='#120c14';ctx.fill();portrait(who,ln[2]||'neutral',px,py,ps,'#2a2440');
    const nm=PEOPLE[who].name;panel(left?bxx:SW-bxx-tw(nm,10,700)-20*U,by-16*U,tw(nm,10,700)+20*U,20*U,'#f2c14e','#120c14',6);text(nm,left?bxx+10*U:SW-bxx-10*U,by-12*U,10,'#120c14',left?'left':'right',null,700)}
  panel(bxx,by+6*U,bw,bh,'rgba(10,8,20,.92)','#f2c14e');
  const lines=wrap(ln[1].slice(0,Math.floor(SC.ch)),bw-22*U,11);lines.slice(0,7).forEach((l,i)=>text(l,bxx+11*U,by+16*U+i*15*U,11,who?'#fff':'#e8d8a8','left',null,who?600:400));
  if(SC.ch>=ln[1].length&&Math.floor(TT*3)%2)text('▼',SW-bxx-14*U,by+bh-14*U,10,'#ffd84a','center');
  text('A NEXT · START SKIP',SW/2,by+bh-10*U,7,'rgba(255,255,255,.45)','center')}

/* ---------- the fighter's card ---------- */
let CARD=null;
function cardTick(){if(TAP('a')||TAP('start')){SFX.pick();SAVE.fight=null;newFight(CARD.oi,{story:CARD.story});go('fight')}else if(TAP('b')){SFX.back();go(CARD.story?'title':'circuit',CARD.story?0:CARD.oi)}}
function cardDraw(){const o=OPP[CARD.oi],p=PEOPLE[o.p],v=VENUES[o.venue];drawScene(o.venue,TT,null,null,{dim:.5});blit();ctx.setTransform(DPR,0,0,DPR,0,0);
  text(CARD.story?'EMBER CIRCUIT · FIGHT '+(CARD.oi+1):'EXHIBITION',SW/2,12*U,9,'#ffd84a','center','#000');
  const ps=Math.min(SW*.62,SH*.36);const px=SW/2-ps/2,py=30*U;rrect(px-4*U,py-4*U,ps+8*U,ps+8*U,10*U);ctx.fillStyle='#f2c14e';ctx.fill();portrait(o.p,'angry',px,py,ps,'#241c34');
  let y=py+ps+10*U;text('"'+o.nick+'"',SW/2,y,11,'#ffd84a','center','#000',700);y+=15*U;text(p.name,SW/2,y,17,'#fff','center','#2a0c0c',700);y+=24*U;
  const rows=[['FROM',o.from],['RECORD',o.rec],['HEIGHT / WEIGHT',o.ht+' / '+o.wt],['RING',v.name]];
  panel(SW*.06,y,SW*.88,rows.length*15*U+12*U,'rgba(10,8,20,.85)','#5a4a7a');rows.forEach(([a,b],i)=>{text(a,SW*.1,y+7*U+i*15*U,9,'#a8a0c8','left');text(b,SW*.9,y+7*U+i*15*U,9,'#fff','right')});
  y+=rows.length*15*U+20*U;const b=SAVE.best[o.id];if(b)text('BEST: '+'★'.repeat(b.stars)+'☆'.repeat(3-b.stars)+'  '+fmtT(b.time),SW/2,y,9,'#ffd84a','center','#000');
  help('A FIGHT · B BACK')}

/* ---------- the fight on screen ---------- */
function fightStep(dt){if(TAP('start')&&!['ko','pko'].includes(F.ph)){SFX.back();go('pause');return}fightTick(dt)}
const LANE=()=>{const x=8*U,y=40*U,w=SW-16*U,h=30*U;return{x,y,w,h,tx:x+22*U,span:w-40*U}};
function arrowGlyph(x,y,s,d,col){const a={R:0,D:Math.PI/2,L:Math.PI,U:-Math.PI/2}[d];ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(s*.75,0);ctx.lineTo(-s*.05,-s*.62);ctx.lineTo(-s*.05,-s*.24);ctx.lineTo(-s*.7,-s*.24);ctx.lineTo(-s*.7,s*.24);ctx.lineTo(-s*.05,s*.24);ctx.lineTo(-s*.05,s*.62);ctx.closePath();ctx.fill();ctx.restore()}
function circ(x,y,r,fill,edge,lw=2){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill()}if(edge){ctx.lineWidth=lw*U;ctx.strokeStyle=edge;ctx.stroke()}}
function drawLane(){const L=LANE(),ph=F.ph,mode=F.toks.some(t=>t.k==='c')?'c':F.toks.length?'d':null,cy=L.y+L.h/2,r=11*U;
  rrect(L.x,L.y,L.w,L.h,L.h/2);ctx.fillStyle='rgba(8,6,16,.72)';ctx.fill();ctx.lineWidth=2*U;ctx.strokeStyle=mode==='c'?'#7dff9a':mode==='d'?'#ff5a5a':'rgba(255,255,255,.25)';ctx.stroke();
  const pulse=mode?1+.08*Math.sin(TT*12):1;circ(L.tx,cy,(r+3*U)*pulse,'rgba(255,255,255,.08)','#fff',2);
  if(mode)text(mode==='c'?'PUNCH':'DODGE',L.x+4*U,L.y+L.h+2*U,8,mode==='c'?'#7dff9a':'#ff7a6a','left','#000',700);
  ctx.save();rrect(L.x,L.y,L.w,L.h,L.h/2);ctx.clip();
  for(const n of F.toks){const x=L.tx+(n.t-F.clk)/n.lead*L.span;if(x>L.x+L.w+r)continue;
    if(n.st===1){const k=(F.clk-Math.max(n.t-.2,n.pt||n.t))/.35;if(k<1&&k>0)circ(L.tx,cy,r*(1+k),null,`rgba(125,255,154,${1-k})`,3);continue}
    if(n.st===2||n.st===3){if(n.st===2){const k=clamp((F.clk-n.t+.3)/.6,0,1);ctx.globalAlpha=1-k;text('✕',Math.max(L.tx,x),cy-8*U,14,'#ff5a5a','center','#000',700);ctx.globalAlpha=1}continue}
    if(n.k==='d'){const hid=n.frz&&n.t-F.clk<n.lead*.52;
      if(n.fake){ctx.setLineDash([3*U,3*U]);circ(x,cy,r,'rgba(30,26,40,.6)','#b8b0c8',2);ctx.setLineDash([]);ctx.globalAlpha=.45+.45*Math.sin(TT*16);if(!hid)arrowGlyph(x,cy,r*.95,n.d,'#d8d0e8');ctx.globalAlpha=1}
      else if(hid){circ(x,cy,r,'rgba(190,232,255,.9)','#fff',2);text('?',x,cy-6*U,11,'#5a8ab0','center',null,700)}
      else{circ(x,cy,r,'#3a0c14','#ff5a5a',2);arrowGlyph(x,cy,r*1.05,n.d,'#fff')}}
    else{if(n.b==='AB'){const w=r*1.9;rrect(x-w,cy-r,w*2,r*2,r);const g=ctx.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,'#c8263a');g.addColorStop(1,'#e0a72a');ctx.fillStyle=g;ctx.fill();ctx.lineWidth=2*U;ctx.strokeStyle='#fff';ctx.stroke();text('A+B',x,cy-6*U,11,'#fff','center','#2a0c0c',700)}
      else{circ(x,cy,r,n.b==='A'?'#c8263a':'#d8961a','#fff',2);text(n.b,x,cy-6.5*U,12,'#fff','center','#2a0c0c',700)}
      if(n.half){circ(x,cy,r*1.4,null,'#ffd84a',2)}}}
  ctx.restore();
  F.pops.forEach((p,i)=>{const k=(F.clk-p.t)/.7;ctx.globalAlpha=1-k*k;text(p.s,L.tx+14*U,L.y+L.h+2*U-k*8*U+(i%2)*0,10,p.c,'left','#000',700);ctx.globalAlpha=1})}
function bar(x,y,w,h,v,col,right){rrect(x,y,w,h,3*U);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fill();const f=clamp(v/100,0,1),ww=(w-4*U)*f;if(ww>0){rrect(right?x+w-2*U-ww:x+2*U,y+2*U,ww,h-4*U,2*U);ctx.fillStyle=col;ctx.fill()}rrect(x,y,w,h,3*U);ctx.lineWidth=1.5*U;ctx.strokeStyle='#fff';ctx.stroke()}
const hpCol=v=>v>55?'#5ae06a':v>28?'#f2c14e':'#ff4a4a';
function fightHud(){const w=SW*.36,y=6*U;text('MILO',8*U,y,9,'#fff','left','#000',700);bar(8*U,y+12*U,w,10*U,F.php,hpCol(F.php));
  const nm=PEOPLE[F.id].name.split(' ').slice(-1)[0];text(nm,SW-8*U,y,9,'#fff','right','#000',700);bar(SW-8*U-w,y+12*U,w,10*U,F.ohp,hpCol(F.ohp),true);
  for(let i=0;i<F.pkd;i++)text('✕',8*U+w-8*U-i*9*U,y,8,'#ff5a5a','left','#000');for(let i=0;i<F.okd;i++)text('★',SW-8*U-w+i*9*U,y,8,'#ffd84a','left','#000');
  panel(SW/2-22*U,y,44*U,24*U,'rgba(10,8,20,.85)','#f2c14e',5);text('R'+F.rd,SW/2,y+2*U,8,'#ffd84a','center');text(fmtT(F.tleft),SW/2,y+11*U,10,F.tleft<10?'#ff5a5a':'#fff','center',null,700)}
function fightDraw(){const op=oppPose(),pp=playerPose();drawScene(F.venue,TT,{id:F.id,pose:op},pp);const sh=F.shake;blit(sh?(rnd()-.5)*sh:0,sh?(rnd()-.5)*sh:0);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(F.flash>0){const g=ctx.createRadialGradient(SW/2,SH*.6,SH*.15,SW/2,SH*.6,SH*.75);g.addColorStop(0,'rgba(255,0,0,0)');g.addColorStop(1,`rgba(255,20,20,${.55*F.flash})`);ctx.fillStyle=g;ctx.fillRect(0,0,SW,SH)}
  if(['pdown','pko'].includes(F.ph)){ctx.fillStyle=`rgba(0,0,0,${Math.min(.45,(F.clk-F.p0)*.5)})`;ctx.fillRect(0,0,SW,SH)}
  fightHud();if(['defend','counter','neutral','recover','stagger','block'].includes(F.ph))drawLane();
  /* the opponent talks */
  if(F.clk-F.O.sayT<1.8&&F.O.say){const b=PEOPLE[F.id].build,hx=BW/2*PS,hy=(BH-OPP_Y-(b.h+b.r*2.2)*b.s*OSC)*PS,w=Math.min(SW*.5,tw(F.O.say,9)+16*U),lines=wrap(F.O.say,w-12*U,9),h=lines.length*12*U+10*U,x=Math.min(SW-w-6*U,hx+18*U),y=Math.max(76*U,hy-h);
    panel(x,y,w,h,'#fff','#120c14',6);lines.forEach((l,i)=>text(l,x+w/2,y+5*U+i*12*U,9,'#120c14','center',null,600))}
  if(F.msg){const k=(F.clk-F.msg.t)/F.msg.d;if(k<1){const sc=k<.12?.6+k/.12*.4:1;ctx.globalAlpha=k>.8?(1-k)/.2:1;ctx.save();ctx.translate(SW/2,SH*.4);ctx.scale(sc,sc);text(F.msg.s,0,0,F.msg.s.length>10?20:30,F.msg.c,'center','#2a0c0c',700);ctx.restore();ctx.globalAlpha=1}}
  if(['odown','pdown'].includes(F.ph)&&F.count>0){text(String(F.count),SW/2,SH*.48,44,'#fff','center','#2a0c0c',700)}
  if(F.ph==='pdown'){const w=SW*.6,x=SW/2-w/2,y=SH*.66;text('MASH A + B TO GET UP!',SW/2,y-18*U,11,'#ffd84a','center','#000',700);bar(x,y,w,12*U,F.mash/F.need*100,'#7dff9a')}
  if(F.tutor&&F.okd===0){const s=F.ph==='defend'?'Press the arrow\'s way as it reaches the ring':F.ph==='counter'?'Press A / B as each reaches the ring (A+B: both at once)':F.ph==='neutral'?'Wait for his combo...':'';if(s){const lines=wrap(s,SW*.8,9);lines.forEach((l,i)=>text(l,SW/2,LANE().y+LANE().h+14*U+i*12*U,9,'#fff','center','#000'))}}}

/* ---------- pause ---------- */
function pauseTick(){menuNav(3);if(TAP('start')||TAP('b')){go('fight');return}if(TAP('a')){SFX.pick();if(MSEL===0)go('fight');else if(MSEL===1){BACKTO='pause';HOW=0;go('howto')}else{saveNow(true);F=null;go('title')}}}
function pauseDraw(){fightDraw();dimAll(.6);text('PAUSED',SW/2,SH*.26,22,'#fff','center','#000',700);drawMenu(['RESUME','HOW TO PLAY','QUIT (SAVES THIS ROUND)'],SW/2,SH*.4,11,20*U);help('A SELECT · START RESUME')}

/* ---------- the corner between rounds ---------- */
function cornerTick(){if(TAP('a')||TAP('start')){SFX.pick();nextRound();go('fight')}}
function cornerDraw(){drawScene(F.venue,TT,null,null,{dim:.55});blit();ctx.setTransform(DPR,0,0,DPR,0,0);
  text('CORNER · AFTER ROUND '+F.rd,SW/2,14*U,11,'#ffd84a','center','#000',700);const ps=Math.min(SW*.5,SH*.32);portrait('dot','neutral',SW/2-ps/2,34*U,ps,'#2a2440');
  const y=34*U+ps+10*U,tip=F.op.tips[Math.min(F.op.tips.length-1,F.rd-1)],lines=wrap('"'+tip+'"',SW*.78,11);panel(SW*.06,y,SW*.88,lines.length*15*U+16*U);lines.forEach((l,i)=>text(l,SW/2,y+8*U+i*15*U,11,'#fff','center'));
  const y2=y+lines.length*15*U+28*U,st=F.stats;[['YOUR HEALTH',Math.round(Math.min(100,F.php+28))+' (+28)'],['PUNCHES LANDED',Math.round(st.dealt)+' dmg'],['DODGES',st.dodges],['KNOCKDOWNS',F.okd+' – '+F.pkd]].forEach(([a,b],i)=>{text(a,SW*.12,y2+i*14*U,9,'#a8a0c8');text(String(b),SW*.88,y2+i*14*U,9,'#fff','right')});
  help('A NEXT ROUND')}

/* ---------- results ---------- */
function resultTick(){const r=F.res;if(TAP('a')||TAP('start')){SFX.pick();if(r.win){if(F.story){F=null;advanceStory()}else{F=null;go('circuit')}}else{const oi=F.oi,s=F.story;newFight(oi,{story:s});go('fight')}}
  else if(TAP('b')){SFX.back();F=null;go('title')}}
function resultDraw(){const r=F.res;drawScene(F.venue,TT,{id:F.id,pose:oppPose()},r.win?playerPose():null,{dim:.5});blit();ctx.setTransform(DPR,0,0,DPR,0,0);
  text(r.win?'YOU WIN!':'YOU LOST',SW/2,SH*.12,30,r.win?'#ffd84a':'#ff5a5a','center','#2a0c0c',700);text(r.how,SW/2,SH*.12+38*U,12,'#fff','center','#000',700);
  if(r.win){text('★'.repeat(r.stars)+'☆'.repeat(3-r.stars),SW/2,SH*.12+58*U,22,'#ffd84a','center','#000')}
  const st=F.stats,y=SH*.42;panel(SW*.1,y,SW*.8,5*15*U+14*U);[['TIME',fmtT(st.time)],['DODGES',st.dodges],['PERFECTS',st.perfect],['COMBOS',st.combos],['HITS TAKEN',st.taken]].forEach(([a,b],i)=>{text(a,SW*.15,y+8*U+i*15*U,10,'#a8a0c8');text(String(b),SW*.85,y+8*U+i*15*U,10,'#fff','right')});
  help(r.win?(F.story?'A CONTINUE · B TITLE':'A CIRCUIT · B TITLE'):'A TRY AGAIN · B TITLE')}

/* ---------- the circuit: rematches ---------- */
function circuitTick(){const n=OPP.length;menuNav(n+1);if(TAP('b')){SFX.back();go('title',titleIdx('circ'));return}
  if(TAP('a')){if(MSEL===n){SFX.back();go('title',titleIdx('circ'));return}const o=OPP[MSEL];if(!SAVE.met[o.id]&&!SAVE.done){SFX.back();toast('MEET THEM IN THE STORY FIRST');return}SFX.pick();CARD={oi:MSEL,story:false};go('card')}}
function circuitDraw(){drawScene('gym',TT,null,null,{dim:.6});blit();ctx.setTransform(DPR,0,0,DPR,0,0);text('THE CIRCUIT',SW/2,10*U,16,'#ffd84a','center','#000',700);text('Rematch anyone you have met',SW/2,30*U,8,'#c8c0e0','center');
  const rh=Math.min(44*U,(SH-90*U)/(OPP.length+1)),y0=44*U;
  OPP.forEach((o,i)=>{const y=y0+i*rh,on=i===MSEL,known=SAVE.met[o.id]||SAVE.done;rrect(10*U,y,SW-20*U,rh-4*U,6*U);ctx.fillStyle=on?'rgba(255,216,74,.2)':'rgba(10,8,20,.7)';ctx.fill();if(on){ctx.lineWidth=2*U;ctx.strokeStyle='#ffd84a';ctx.stroke()}
    const ps=rh-8*U;if(known)portrait(o.p,'guard',14*U,y+2*U,ps,'#2a2440');else{rrect(14*U,y+2*U,ps,ps,4*U);ctx.fillStyle='#1a1424';ctx.fill();text('?',14*U+ps/2,y+ps/2-6*U,12,'#5a4a7a','center')}
    text(known?PEOPLE[o.p].name:'???',20*U+ps,y+4*U,10,known?'#fff':'#5a4a7a','left',null,700);text(known?VENUES[o.venue].name:'',20*U+ps,y+17*U,7,'#a8a0c8');
    const b=SAVE.best[o.id];if(b)text('★'.repeat(b.stars)+'☆'.repeat(3-b.stars),SW-16*U,y+6*U,10,'#ffd84a','right')});
  const by=y0+OPP.length*rh;text((MSEL===OPP.length?'▸ ':'')+'BACK',SW/2,by+2*U,11,MSEL===OPP.length?'#ffd84a':'#e8e2d0','center','#000',700);help('A FIGHT · B BACK')}

/* ---------- how to play ---------- */
let HOW=0;const HOWS=[
  ['DODGE','Your opponent\'s punches slide along the lane at the top as red arrows. Press that way on the D-pad just as each arrow reaches the ring on the left.\n◀ ▶ slip left or right · ▼ duck · ▲ lean back.\nToo early, the wrong way or too late, and you eat the punch.'],
  ['PUNCH','Slip his whole combo and he\'s OPEN. Your punches slide in: A is your left jab, B your right cross, A+B (both together) is the haymaker. Hit each one as it reaches the ring.\nMiss one and he blocks and starts his combo again. Land them all for a COMBO bonus.'],
  ['TRICKS','Hollow blinking arrows are FAKES: don\'t move. Frozen arrows hide halfway: remember the pattern. Don\'t throw punches while he waits; some fighters punish greed.\nKnocked down? Mash A and B to get up. Three rounds of 90 seconds; knock him down enough times and it\'s a K.O.']];
function howtoTick(){const d=menuDir();if(d==='left'&&HOW>0){HOW--;SFX.move()}else if(d==='right'&&HOW<HOWS.length-1){HOW++;SFX.move()}else if(TAP('a')){if(HOW<HOWS.length-1){HOW++;SFX.move()}else{SFX.back();go(BACKTO,BACKTO==='title'?titleIdx('how'):1)}}else if(TAP('b')||TAP('start')){SFX.back();go(BACKTO,BACKTO==='title'?titleIdx('how'):1)}}
function howtoDraw(){drawScene('gym',TT,null,null,{dim:.62});blit();ctx.setTransform(DPR,0,0,DPR,0,0);const[h,s]=HOWS[HOW];text('HOW TO PLAY · '+(HOW+1)+'/'+HOWS.length,SW/2,12*U,9,'#ffd84a','center','#000');text(h,SW/2,28*U,22,'#fff','center','#2a0c0c',700);
  /* a sample lane */
  const L={x:16*U,y:62*U,w:SW-32*U,h:30*U},cy=L.y+15*U,r=11*U;rrect(L.x,L.y,L.w,L.h,15*U);ctx.fillStyle='rgba(8,6,16,.8)';ctx.fill();ctx.lineWidth=2*U;ctx.strokeStyle=HOW===1?'#7dff9a':'#ff5a5a';ctx.stroke();circ(L.x+22*U,cy,r+3*U,null,'#fff',2);
  const items=HOW===0?['R','R','D','U']:HOW===1?['A','AB','B','B']:['*R','R','?','L'];items.forEach((it,i)=>{const x=L.x+22*U+(i+.6)*(L.w-50*U)/4;
    if(HOW===1){if(it==='AB'){rrect(x-r*1.9,cy-r,r*3.8,r*2,r);ctx.fillStyle='#c8263a';ctx.fill();text('A+B',x,cy-6*U,11,'#fff','center',null,700)}else{circ(x,cy,r,it==='A'?'#c8263a':'#d8961a','#fff',2);text(it,x,cy-6.5*U,12,'#fff','center',null,700)}}
    else if(it==='?'){circ(x,cy,r,'rgba(190,232,255,.9)','#fff',2);text('?',x,cy-6*U,11,'#5a8ab0','center',null,700)}
    else if(it[0]==='*'){ctx.setLineDash([3*U,3*U]);circ(x,cy,r,null,'#b8b0c8',2);ctx.setLineDash([]);arrowGlyph(x,cy,r,it[1],'#b8b0c8')}else{circ(x,cy,r,'#3a0c14','#ff5a5a',2);arrowGlyph(x,cy,r*1.05,it,'#fff')}});
  const lines=wrap(s,SW-36*U,10);lines.forEach((l,i)=>text(l,18*U,108*U+i*14*U,10,'#fff','left','#000'));
  help('◀ ▶ PAGE · B BACK')}

/* ---------- settings ---------- */
function setItems(){return['TIMING  '+TIM().n,'SOUND  '+(muted?'OFF':'ON'),'VIBRATION  '+(HAP.on?'ON':'OFF'),'BACK']}
function settingsTick(){const it=setItems();const d=menuNav(it.length),ch=d==='left'?-1:d==='right'?1:TAP('a')?1:0;
  if(TAP('b')||(TAP('a')&&MSEL===3)){SFX.back();saveNow();go('title',titleIdx('set'));return}
  if(ch&&MSEL===0){SAVE.timing=((SAVE.timing|0)+ch+3)%3;SFX.move()}else if(ch&&MSEL===1){setMute(!muted);if(!muted)SFX.pick()}else if(ch&&MSEL===2){HAP.on=!HAP.on;store.set('vib',HAP.on);haptic(20);SFX.move()}}
function settingsDraw(){drawScene('gym',TT,null,null,{dim:.62});blit();ctx.setTransform(DPR,0,0,DPR,0,0);text('SETTINGS',SW/2,SH*.14,20,'#fff','center','#000',700);drawMenu(setItems(),SW/2,SH*.3,12,22*U);
  const notes=['EASY: wider timing, slower punches. HARD: tight timing.','',''];if(MSEL===0)wrap(notes[0],SW*.8,9).forEach((l,i)=>text(l,SW/2,SH*.3+4*22*U+6*U+i*12*U,9,'#c8c0e0','center'));help('◀ ▶ CHANGE · B BACK')}
