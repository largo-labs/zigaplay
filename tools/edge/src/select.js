/* ================= choosing fighters and stages; the moves list; results ================= */
const STATN=['POWER','SPEED','WEIGHT','RANGE'];
const SEL={phase:'p1',c:[0,1],mode:'vs'};
function statBars(ch){return`<div class="bars">${STATN.map(n=>`<span>${n}</span><div class="bar"><i style="width:${ch.stats[n.toLowerCase()]*20}%"></i></div>`).join('')}</div>`}
function goSelect(mode){SEL.mode=mode;SEL.phase='p1';SEL.c=[PICK.p1,PICK.p2];G.state='menu';const el=scr('select');
  el.innerHTML=`<div class="top"><div class="hdr" id="selH">CHOOSE YOUR FIGHTER</div><div class="sub" id="selS"></div></div>
  <div class="cards" style="left:16px;top:62px;width:318px">${ROSTER.map((c,i)=>`<div class="card" id="cd${i}" style="height:70px"><img alt=""><b>${c.name}</b><span class="tag p1" hidden>P1</span><span class="tag p2" hidden>CPU</span></div>`).join('')}</div>
  <div class="pane box" id="selInfo" style="left:16px;top:218px;width:318px;height:114px;padding:9px 12px"></div>
  <div style="position:absolute;left:360px;top:66px;font:900 italic 30px/1 var(--ui);letter-spacing:.02em;text-shadow:0 2px 0 #000,0 0 10px #000" id="selName"></div>
  <div class="sub" style="position:absolute;left:362px;top:98px;text-shadow:0 1px 2px #000" id="selTitle"></div>
  <div class="hint">${stk('any')} CHOOSE · ${kb('a')} PICK · ${kb('b')} BACK · ${kb('c')} MOVES</div>`;
  ROSTER.forEach((c,i)=>{const im=$('#cd'+i+' img');im.src=portrait(c,'face')});selDraw();show('select');CAMMODE={tx:0,ty:.98,d:6.4,ux:482,h:.3}}
function selDraw(){const p=SEL.phase==='p1'?0:1,ch=ROSTER[SEL.c[p]];
  ROSTER.forEach((c,i)=>{const e=$('#cd'+i),a=SEL.c[0]===i,b=SEL.phase!=='p1'&&SEL.c[1]===i;e.className='card'+(a?' p1':'')+(b?' p2':'');e.querySelector('.tag.p1').hidden=!a;e.querySelector('.tag.p2').hidden=!b});
  $('#selH').textContent=SEL.phase==='p1'?'CHOOSE YOUR FIGHTER':SEL.mode==='training'?'CHOOSE A TRAINING PARTNER':'CHOOSE YOUR OPPONENT';
  $('#selS').innerHTML=SEL.phase==='p1'?'Player 1':SEL.mode==='training'?'They stand still unless you change it in the pause menu':`Computer · level ${SET.level} (change it in Settings)`;
  $('#selName').innerHTML=`<span style="color:${p?'var(--blue)':'var(--red)'}">${p?'CPU':'P1'}</span> ${ch.name}`;$('#selTitle').textContent=ch.title.toUpperCase();
  $('#selInfo').innerHTML=`<div style="display:grid;grid-template-columns:120px 1fr;gap:12px">${statBars(ch)}<div class="mv" style="gap:3px 6px">${['n','s','u','d'].map(k=>{const s=ch.sp[k][1];
    return`<span class="in">${k==='n'?'':stk(k==='s'?'r':k)}${ka('special')}</span><span class="nm" style="font-size:11px">${s.name}</span>`}).join('')}</div></div>`;
  showSet([{ch,x:0,yaw:-.35,spin:0}])}
function selectTick(){const P=HUMAN.menu,p=SEL.phase==='p1'?0:1,d=menuDir();
  if(d){let i=SEL.c[p],c=i%4,r=Math.floor(i/4);if(d==='left')c=(c+3)%4;if(d==='right')c=(c+1)%4;if(d==='up'||d==='down')r=1-r;SEL.c[p]=r*4+c;SFX.move();selDraw()}
  if(P.c){SFX.pick();PICK.p1=SEL.c[0];goMoves(SEL.c[p],'select');return}
  if(P.a||P.start){SFX.pick();if(p===0){SEL.phase='p2';if(SEL.c[1]===SEL.c[0]&&SCR_T<2)SEL.c[1]=(SEL.c[0]+1)%8;selDraw()}else{PICK.p1=SEL.c[0];PICK.p2=SEL.c[1];goStages()}return}
  if(P.b){SFX.back();if(p===1){SEL.phase='p1';selDraw()}else goMain()}}
/* ---------- stages: the 3D world behind changes as you move through them ---------- */
function goStages(){const el=scr('stages');el.innerHTML=`<div class="top"><div class="hdr">CHOOSE A STAGE</div></div><div class="pane box sub" id="stgD" style="left:24px;top:52px;width:330px;color:#dfe6ff"></div><div class="hint">${kb('a')} FIGHT · ${kb('b')} BACK</div>`;
  buildMenu('stages',STAGES.map((s,i)=>({label:s.name,act:()=>{PICK.stage=i;saveSet();startMatch(SEL.mode)}})),{x:24,y:96,w:260,back:()=>{goSelect(SEL.mode);SEL.phase='p2';selDraw()}});
  MENU.stages.sel=PICK.stage;MENU.stages.onMove=stgPreview;drawMenu('stages');show('stages');stgPreview()}
function stgPreview(){const i=MENU.stages.sel,def=STAGES[i];$('#stgD').textContent=def.desc;G.stage=buildStage(def);setWorld(def,G.stage);
  showSet([{ch:ROSTER[PICK.p1],x:-2.2,yaw:Math.PI/2-.5},{ch:ROSTER[PICK.p2],x:2.2,yaw:-Math.PI/2+.5}]);const B=def.main;CAMMODE={tx:0,ty:2.4,d:(B.r-B.l)*1.65,ux:420,h:3}}
/* ---------- the moves list: every move, its input, and the fighter doing it ---------- */
const ML={ch:0,sel:1,back:'main',rows:[]};
function moveRows(ch){const N=buildNormals(ch),S=buildSpecials(ch),A=ka('attack'),B=ka('special');
  return[{sec:'SPECIAL MOVES'},{in:B,nm:S.n.nm,ds:S.n.desc,def:S.n},{in:stk('r')+B,nm:S.s.nm,ds:S.s.desc,def:S.s},{in:stk('u')+B,nm:S.u.nm,ds:S.u.desc,def:S.u},{in:stk('d')+B,nm:S.d.nm,ds:S.d.desc,def:S.d},
   {sec:'ON THE GROUND'},{in:A+A+A,nm:'JAB COMBO',ds:'Fast punches. Tap A to keep going.',def:N.jab3},{in:stk('r')+A,nm:'SIDE ATTACK',ds:'Reliable poke at mid range.',def:N.ftilt},
   {in:stk('u')+A,nm:'UP ATTACK',ds:'Hits above you. Starts combos.',def:N.utilt},{in:stk('d')+A,nm:'LOW SWEEP',ds:'Low and quick. Pops them up.',def:N.dtilt},
   {in:'RUN '+A,nm:'DASH ATTACK',ds:'Run then attack to close the gap.',def:N.dash},
   {sec:'SMASH ATTACKS · HOLD TO CHARGE'},{in:smashIn('r'),nm:'SIDE SMASH',ds:'Your strongest blow. A finisher.',def:N.fsmash},{in:smashIn('u'),nm:'UP SMASH',ds:'Launches straight up.',def:N.usmash},
   {in:smashIn('d'),nm:'DOWN SMASH',ds:'Hits both sides at once.',def:N.dsmash},
   {sec:'IN THE AIR'},{in:A,nm:'NEUTRAL AIR',ds:'Hits all around you.',def:N.nair},{in:stk('r')+A,nm:'FORWARD AIR',ds:'Your main air attack.',def:N.fair},
   {in:stk('l')+A,nm:'BACK AIR',ds:'Strong kick behind you.',def:N.bair},{in:stk('u')+A,nm:'UP AIR',ds:'Juggle them above you.',def:N.uair},{in:stk('d')+A,nm:'DOWN AIR',ds:'Spikes them down. Deadly off the edge.',def:N.dair},
   {sec:'GRABS AND THROWS'},{in:ka('grab'),nm:'GRAB',ds:'Goes through shields.',def:N.grab},{in:A+' (held)',nm:'PUMMEL',ds:'Hit them while you hold them.',pose:'hold'},
   {in:stk('r')+stk('l')+stk('u')+stk('d'),nm:'THROWS',ds:'Throw them the way you push.',pose:'throwF'},
   {sec:'DEFENCE'},{in:'hold '+ka('shield'),nm:'SHIELD',ds:'Blocks everything except grabs. It shrinks as it takes hits.',pose:'shield'},
   {in:ka('shield')+' on hit',nm:'PARRY',ds:'Press shield just as a hit lands to stun them.',pose:'shield'},{in:ka('shield')+stk('lr',1),nm:'ROLL',ds:'Roll past or away, untouchable.',pose:'roll'},
   {in:ka('shield')+stk('d',1),nm:'SPOT DODGE',ds:'Dodge in place.',pose:'dodge'},{in:ka('shield')+' in air',nm:'AIR DODGE',ds:'Add a direction to dash through the air.',pose:'adodge'},
   {in:ka('shield')+' on landing',nm:'TECH',ds:'Shield as you hit the ground after a big hit to land on your feet.',pose:'land'},
   {in:stk('r')+' at ledge',nm:'LEDGE',ds:'You grab ledges by falling near them. Jump, climb, attack or roll from there.',pose:'hang'}]}
function goMoves(i,back){ML.ch=i;ML.back=back;ML.sel=1;if(back!=='pause'){G.state='menu'}const el=scr('moves');
  el.innerHTML=`${back==='pause'?'<div class="dim"></div>':''}<div class="top"><div class="hdr" id="mlH"></div><div class="sub" id="mlT"></div></div>
  <div class="pane box" style="left:14px;top:66px;width:356px;height:262px;overflow:hidden"><div class="mv" id="mlL" style="position:relative;transition:top .12s"></div></div>
  <div class="hint">${stk('ud')} MOVE · ${stk('lr')} FIGHTER · ${kb('b')} BACK</div>`;mlDraw();show('moves');CAMMODE={tx:0,ty:1,d:6.6,ux:505,h:.3}}
function mlDraw(){const ch=ROSTER[ML.ch];ML.rows=moveRows(ch);$('#mlH').innerHTML=`◀ ${ch.name} ▶`;$('#mlT').textContent=ch.title.toUpperCase();
  const L=$('#mlL');L.innerHTML=ML.rows.map((r,i)=>r.sec?`<span style="grid-column:1/3;font:900 italic 10.5px/1 var(--ui);letter-spacing:.12em;color:var(--gold);margin-top:${i?6:0}px">${r.sec}</span>`
    :`<span class="in" id="mr${i}" style="${i===ML.sel?'background:rgba(255,204,74,.25);border-radius:6px;':''}padding:2px 4px">${r.in}</span><span class="nm" style="${i===ML.sel?'color:var(--gold)':''}">${r.nm}</span>${i===ML.sel?`<span class="ds">${r.ds}</span>`:''}`).join('');
  const sel=$('#mr'+ML.sel);L.style.top=Math.min(0,-(sel?sel.offsetTop:0)+100)+'px';const r=ML.rows[ML.sel];
  showSet([{ch,x:0,yaw:Math.PI/2-.55,move:r.def&&!r.pose?r.def:null,pose:r.pose||null}])}
function movesTick(){const d=menuDir(),P=HUMAN.menu;
  if(d==='up'||d==='down'){let i=ML.sel;do{i=(i+(d==='up'?-1:1)+ML.rows.length)%ML.rows.length}while(ML.rows[i].sec);ML.sel=i;SFX.move();mlDraw()}
  if(d==='left'||d==='right'){ML.ch=(ML.ch+(d==='left'?7:1))%8;SFX.move();mlDraw()}
  if(P.b||P.start&&ML.back==='pause'){SFX.back();if(ML.back==='pause')goPause();else if(ML.back==='select'){goSelect(SEL.mode)}else goMain()}}
/* ---------- results ---------- */
function goResults(){G.state='results';const[w,l]=G.matchEnd.loser===G.fighters[0]?[G.fighters[1],G.fighters[0]]:[G.fighters[0],G.fighters[1]];
  for(const v of VIEW.fighters.values())v.outer.visible=false;
  showSet([{ch:w.ch,x:0,yaw:-.2,pose:pick(['win','win2'])},{ch:l.ch,x:-1.4,z:-1.4,yaw:.5,pose:'clap'}]);
  const row=(n,k)=>`<span>${n}</span><b>${k(G.fighters[0])}</b><b>${k(G.fighters[1])}</b>`;
  const el=scr('results');el.innerHTML=`<div class="top"><div class="hdr" style="font-size:34px">${w.ch.name} WINS!</div><div class="sub">${w===G.fighters[0]?'Player 1':'Computer'} · ${G.stage.name}</div></div>
  <div class="pane box" style="left:350px;top:70px;width:272px"><div class="ctl" style="grid-template-columns:1fr auto auto;gap:5px 14px">
   <span></span><b style="color:var(--red)">P1</b><b style="color:var(--blue)">CPU</b>${row('KOs',f=>f.kos)}${row('FALLS',f=>f.falls)}${row('DAMAGE DEALT',f=>Math.round(f.dealt)+'%')}${row('DAMAGE TAKEN',f=>Math.round(f.taken)+'%')}
   ${row('BEST COMBO',f=>f.bestCombo+' hits')}${row('PARRIES',f=>f.parries)}</div></div>`;
  buildMenu('results',[{label:'REMATCH',act:()=>startMatch(G.mode)},{label:'CHANGE FIGHTERS',act:()=>goSelect(G.mode)},{label:'MAIN MENU',act:()=>{music(SET.music,'menu');goMain()}}],{x:350,y:236,w:272,gap:5,back:()=>{music(SET.music,'menu');goMain()}});
  show('results');CAMMODE={tx:-.3,ty:1.15,d:5.2,ux:170,h:.3};music(SET.music,'menu')}
