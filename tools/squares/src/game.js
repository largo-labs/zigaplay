/* ================= Gray Squares =================
   Press the square to make a square. Buy things that make squares for you. That is all. */
const ZP=(()=>{try{return window.parent!==window&&window.parent.ZIGAPLAY||null}catch(e){return null}})();
const RT=document.documentElement;if(ZP)RT.classList.add('zp');if(!ZP&&(matchMedia('(pointer:coarse)').matches||'ontouchstart'in window))RT.classList.add('touch');
const $=s=>document.querySelector(s);
const store={get(k,d){try{const v=localStorage.getItem('squares-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('squares-'+k,JSON.stringify(v))}catch(e){}}};
/* ---------- the numbers ---------- */
const BIG=['thousand','million','billion','trillion','quadrillion','quintillion','sextillion','septillion','octillion','nonillion','decillion'];
function fmt(n,dec){if(n<1e6){if(dec&&n<100)return(Math.floor(n*10)/10).toLocaleString('en-US');return Math.floor(n).toLocaleString('en-US')}
  const e=Math.floor(Math.log10(n)/3);const v=n/Math.pow(10,e*3);return(v<10?v.toFixed(2):v<100?v.toFixed(1):Math.floor(v))+' '+(BIG[e-1]||'a lot')}
const GEN=[
  {id:'sq',nm:'an extra square',c:15,r:.1},{id:'pile',nm:'a small pile of squares',c:100,r:1},{id:'shelf',nm:'a gray shelf',c:1100,r:8},
  {id:'room',nm:'a gray room',c:12e3,r:47},{id:'office',nm:'a gray office',c:13e4,r:260},{id:'bldg',nm:'a gray building',c:1.4e6,r:1400},
  {id:'city',nm:'a gray city',c:2e7,r:7800},{id:'land',nm:'a gray country',c:3.3e8,r:44e3},{id:'planet',nm:'a gray planet',c:5.1e9,r:26e4},
  {id:'galaxy',nm:'a gray galaxy',c:7.5e10,r:1.6e6},{id:'all',nm:'gray everything',c:1e12,r:1e7}];
const fresh=()=>({n:0,run:0,all:0,press:0,presses:0,own:{},warm:0,seen:{},t:Date.now(),born:Date.now()});
let S=Object.assign(fresh(),store.get('save',{}));S.own=S.own||{};S.seen=S.seen||{};
const owned=g=>S.own[g.id]||0;
/* every 25 of a thing doubles what each of them makes */
const doubles=k=>k>=25?Math.floor(Math.log2(k/25))+1:0;
const warmMul=()=>1+S.warm*.1;
const genRate=g=>g.r*Math.pow(2,doubles(owned(g)))*warmMul();
const perSec=()=>GEN.reduce((a,g)=>a+owned(g)*genRate(g),0);
const pressVal=()=>Math.pow(2,S.press)*warmMul()+perSec()*.01*S.press;
const pressCost=()=>50*Math.pow(9,S.press);
const genCost=(g,k=0)=>g.c*Math.pow(1.15,owned(g)+k);
/* buying several at once: x1, x10, or as many as you can */
let AMT=store.get('amt',0);const AMTS=['×1','×10','max'];
function howMany(g){if(AMT===0)return 1;if(AMT===1)return 10;let k=0,sum=0;while(k<1000){const c=genCost(g,k);if(sum+c>S.n)break;sum+=c;k++}return Math.max(1,k)}
function costOf(g,k){let s=0;for(let i=0;i<k;i++)s+=genCost(g,i);return s}
const warmReady=()=>S.run>=1e7*Math.pow(4,S.warm);
/* ---------- sound: dull clicks ---------- */
let AC=null,muted=!!store.get('mute',false);
function audio(){if(AC)return AC;try{const A=(ZP&&ZP.AudioContext)||window.AudioContext||window.webkitAudioContext;if(A)AC=new A()}catch(e){}return AC}
function unlock(){const a=audio();if(a&&a.state==='suspended')a.resume().catch(()=>{})}
function click(f=1400,d=.03,v=.18){const a=AC;if(!a||muted)return;const t=a.currentTime,o=a.createOscillator(),g=a.createGain(),fl=a.createBiquadFilter();o.type='square';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.5,t+d);
  fl.type='lowpass';fl.frequency.value=1800;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(fl);fl.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.01)}
const SND={press(){click(320+Math.random()*30,.04,.2)},buy(){click(180,.09,.25);click(260,.06,.12)},no(){click(110,.08,.15)},move(){click(900,.015,.06)},msg(){click(640,.05,.06)}};
/* ---------- what it says ---------- */
const SAY=[
 [()=>S.presses>=1,'first','A square.'],[()=>S.all>=10,'10','Ten squares. They are all the same.'],[()=>S.all>=50,'50','You could stop now.'],
 [()=>S.all>=100,'100','One hundred squares. Nobody asked for this.'],[()=>owned(GEN[0])>=1,'g0','The square makes squares now. You are less needed.'],
 [()=>S.all>=500,'500','The squares do not mind. They do not mind anything.'],[()=>owned(GEN[1])>=1,'g1','A pile. It is gray.'],
 [()=>S.all>=1e3,'1k','A thousand squares. Still gray.'],[()=>S.presses>=500,'p500','You have pressed the square five hundred times. It has not changed.'],
 [()=>owned(GEN[2])>=1,'g2','You put the squares on a shelf. They look the same there.'],[()=>S.all>=1e4,'10k','Ten thousand squares. The number keeps going.'],
 [()=>Object.values(S.own).some(k=>k>=25),'d25','Twenty-five of something. They work twice as hard now. You do not know why.'],
 [()=>owned(GEN[3])>=1,'g3','A whole room of them. You stand in it. It is quiet.'],[()=>S.all>=1e5,'100k','You are good at this. It is not difficult.'],
 [()=>S.all>=1e6,'1m','A million squares. Your mother would be proud. Probably.'],[()=>owned(GEN[4])>=1,'g4','The office has a meeting about squares. It runs long.'],
 [()=>S.presses>=5000,'p5k','Your thumb is gray now.'],[()=>owned(GEN[5])>=1,'g5','A building. Square on the outside, squares on the inside.'],
 [()=>warmReady()&&!S.warm,'warm0','Something feels slightly warmer. (START)'],[()=>S.all>=1e8,'100m','The squares have formed a committee. It is gray.'],
 [()=>owned(GEN[6])>=1,'g6','A city of squares. The traffic is very orderly.'],[()=>S.all>=1e9,'1b','A billion squares. That is a lot of gray.'],
 [()=>owned(GEN[8])>=1,'g8','A planet. Round, oddly. The squares are unhappy about it.'],[()=>S.all>=1e12,'1t','A trillion. The squares have stopped counting. You have not.'],
 [()=>owned(GEN[10])>=1,'g10','Everything is squares now. Was it worth it? Yes.']];
let msgT=0;function say(s){$('#msg').textContent=s;$('#msg').style.opacity=1;msgT=0;SND.msg()}
function checkSay(){for(const[f,id,s]of SAY)if(!S.seen[id]&&f()){S.seen[id]=1;say(s);return}}
/* ---------- the screen ---------- */
let SEL=0,TOP=0;const rowsEl=$('#list');
function visibleGens(){let out=[];for(let i=0;i<GEN.length;i++){const g=GEN[i];if(owned(g)>0||S.all>=g.c*.4||i===0)out.push(g);else{out.push(null);break}}return out}
function items(){return[{k:'press'},...visibleGens().map(g=>g?{k:'gen',g}:{k:'unk'})]}
function drawList(){const it=items();SEL=Math.min(SEL,it.length);
  rowsEl.innerHTML=it.map((x,i)=>{const sel=SEL===i+1?' sel':'';
    if(x.k==='press'){const c=pressCost();return`<div class="row${sel}${S.n<c?' no':''}" data-i="${i+1}"><span class="nm">a firmer press</span><span class="c">${fmt(c)}</span><span class="s">level ${S.press} · each press makes ${fmt(pressVal(),1)}</span></div>`}
    if(x.k==='unk')return`<div class="row unk${sel}" data-i="${i+1}"><span class="nm">???</span><span class="c">${fmt(GEN[visibleGens().length-1].c)}</span><span class="s">something gray</span></div>`;
    const g=x.g,k=howMany(g),c=costOf(g,k),own=owned(g),nd=25*Math.pow(2,doubles(own));
    return`<div class="row${sel}${S.n<c?' no':''}" data-i="${i+1}"><span class="nm">${g.nm}${own?' · '+own:''}</span><span class="c">${k>1?k+' for ':''}${fmt(c)}</span><span class="s">${fmt(genRate(g),1)} per second each · doubles at ${nd}</span></div>`}).join('');
  /* keep the chosen row in view */
  const box=$('#shop').clientHeight,rows=[...rowsEl.children],r=rows[SEL-1];if(r){const y=r.offsetTop,h=r.offsetHeight;if(y-TOP>box-h)TOP=y-box+h;if(y<TOP)TOP=y}else TOP=0;rowsEl.style.transform=`translateY(${-TOP}px)`;
  $('#sq').classList.toggle('on',SEL===0);$('#amt').textContent=AMTS[AMT]}
let shown=S.n;function drawTop(){shown+=(S.n-shown)*.35;if(Math.abs(S.n-shown)<.5)shown=S.n;$('#num').textContent=fmt(shown);$('#rate').textContent=fmt(perSec(),1)+' per second';
  $('#unit').textContent=Math.floor(shown)===1?'square':'squares';$('#warm').textContent=S.warm?'WARMTH '+S.warm:''}
function tint(){const t=Math.min(1,S.warm/8),m=(a,b)=>'#'+[0,1,2].map(i=>Math.round(parseInt(a.substr(1+i*2,2),16)*(1-t)+parseInt(b.substr(1+i*2,2),16)*t).toString(16).padStart(2,'0')).join('');
  RT.style.setProperty('--bg',m('#cfcfcf','#dacdb6'));RT.style.setProperty('--sel',m('#c2c2c2','#cdbfa6'));RT.style.setProperty('--line',m('#bdbdbd','#c6b89f'));RT.style.setProperty('--sq',m('#9a9a9a','#a8987c'));RT.style.setProperty('--sq2',m('#8a8a8a','#968668'))}
/* ---------- doing things ---------- */
/* now and then the square is slightly darker for a few seconds; pressing it then is worth a minute of everything */
const DARK={on:0,next:60+Math.random()*90};
function darkTick(dt){if(DARK.on>0){DARK.on-=dt;if(DARK.on<=0){$('#sq').classList.remove('dark')}}else if((DARK.next-=dt)<=0&&S.all>=50){DARK.on=6;DARK.next=70+Math.random()*110;$('#sq').classList.add('dark');say('The square looks slightly darker.')}}
function press(){if(DARK.on>0){DARK.on=0;$('#sq').classList.remove('dark');const b=Math.max(perSec()*60,pressVal()*40);S.n+=b;S.run+=b;S.all+=b;say('That one was slightly darker. +'+fmt(b)+'.');SND.buy()}
  const v=pressVal();S.n+=v;S.run+=v;S.all+=v;S.presses++;SND.press();const sq=$('#sq');sq.classList.add('down');setTimeout(()=>sq.classList.remove('down'),70);
  const p=document.createElement('div');p.className='plus';p.textContent='+'+fmt(v,1);const r=sq.getBoundingClientRect(),m=$('#mid').getBoundingClientRect();
  p.style.left=(r.left-m.left+r.width*(.25+Math.random()*.5))+'px';p.style.top=(r.top-m.top+r.height*.2)+'px';$('#mid').appendChild(p);setTimeout(()=>p.remove(),900);checkSay()}
function buy(i){const x=items()[i-1];if(!x||x.k==='unk'){SND.no();return}
  const row=rowsEl.children[i-1];
  if(x.k==='press'){const c=pressCost();if(S.n<c){SND.no();shake(row);return}S.n-=c;S.press++}
  else{const g=x.g,k=howMany(g),c=costOf(g,k);if(S.n<c){SND.no();shake(row);return}S.n-=c;S.own[g.id]=owned(g)+k}
  SND.buy();drawList();const r2=rowsEl.children[i-1];if(r2){r2.classList.add('flash');setTimeout(()=>r2.classList.remove('flash'),120)}checkSay();save()}
function shake(r){if(!r)return;r.classList.remove('shake');void r.offsetWidth;r.classList.add('shake')}
/* saving: every second, on this device and (on the ZigaPlay) to your account, so closing the app loses nothing.
   The Claude app can clear this device's storage when it closes; the account copy is what comes back then. */
const cloud=()=>{try{return ZP&&ZP.cloud||null}catch(e){return null}};
function save(){S.t=Date.now();store.set('save',S);const c=cloud();if(c)try{c.save('squares',JSON.stringify(S),{at:S.t},'progress')}catch(e){}}
function flush(){save();const c=cloud();if(c)try{c.flush('squares')}catch(e){}}
/* ---------- the menu (START) ---------- */
let MENU=null;
function menuItems(){const out=[{s:'back to the square',f:closeMenu}];
  out.push({s:'sound: '+(muted?'off':'on'),f:()=>{muted=!muted;store.set('mute',muted);drawMenu()}});
  if(warmReady())out.push({s:'begin again, slightly warmer',d:'Start over with nothing. Everything makes 10% more, forever. The gray becomes a little warmer.',f:warmer});
  else out.push({s:'begin again, slightly warmer',d:'Not yet. Make '+fmt(1e7*Math.pow(4,S.warm))+' squares in this run first ('+fmt(S.run)+' so far).',f:()=>SND.no()});
  out.push({s:'forget everything',d:'Erase all squares and all warmth.',f:()=>{if(MENU.confirm){S=fresh();shown=0;save();tint();closeMenu();say('Nothing. Gray.')}else{MENU.confirm=1;drawMenu()}}});return out}
function openMenu(){MENU={sel:0,confirm:0};drawMenu();$('#menu').classList.add('on')}
function closeMenu(){MENU=null;$('#menu').classList.remove('on')}
function drawMenu(){const it=menuItems(),mins=Math.floor((Date.now()-S.born)/6e4);
  $('#menu').innerHTML=`<h1>menu</h1><div class="st">${fmt(S.all)} squares made, ever<br>${S.presses.toLocaleString('en-US')} presses<br>${fmt(perSec(),1)} per second<br>warmth ${S.warm} (×${warmMul().toFixed(1)})<br>${mins} minutes of squares</div>`+
    it.map((x,i)=>`<div class="it${i===MENU.sel?' sel':''}" data-m="${i}">${x.s}${x.s==='forget everything'&&MENU.confirm?' (press A again)':''}${x.d?`<small>${x.d}</small>`:''}</div>`).join('')}
function warmer(){S.warm++;Object.assign(S,{n:0,run:0,press:0,own:{}});shown=0;save();tint();closeMenu();drawList();say('Everything is slightly warmer. You notice nothing.')}
/* ---------- input ---------- */
const hold={};let repT=null;
function act(btn){if(MENU){const it=menuItems();if(btn==='up'){MENU.sel=(MENU.sel+it.length-1)%it.length;MENU.confirm=0;SND.move();drawMenu()}else if(btn==='down'){MENU.sel=(MENU.sel+1)%it.length;MENU.confirm=0;SND.move();drawMenu()}
    else if(btn==='a')it[MENU.sel].f();else if(btn==='b'||btn==='start')closeMenu();return}
  const n=items().length;
  if(btn==='up'){if(SEL>0){SEL--;SND.move();drawList()}}else if(btn==='down'){if(SEL<n){SEL++;SND.move();drawList()}}
  else if(btn==='left'){SEL=Math.max(0,SEL-4);drawList()}else if(btn==='right'){SEL=Math.min(n,SEL+4);drawList()}
  else if(btn==='a'){if(SEL===0)press();else buy(SEL)}else if(btn==='b'){if(SEL===0)press();else{SEL=0;SND.move();drawList()}}
  else if(btn==='select'){AMT=(AMT+1)%3;store.set('amt',AMT);SND.move();drawList()}else if(btn==='start')openMenu()}
/* holding A (or B on the square) keeps going: faster the longer you hold */
function input(btn,down){unlock();hold[btn]=down;if(!down){if(btn==='a'||btn==='b'||btn==='up'||btn==='down'){clearTimeout(repT);repT=null}return}
  act(btn);if(['a','b','up','down'].includes(btn)&&!MENU){clearTimeout(repT);let n=0;const go=()=>{if(!hold[btn]||MENU)return;n++;act(btn);repT=setTimeout(go,Math.max(55,170-n*12))};repT=setTimeout(go,320)}}
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',z:'a',Z:'a',' ':'a',x:'b',X:'b',Enter:'start',Escape:'start',Shift:'select'};
addEventListener('keydown',e=>{const b=KEYMAP[e.key];if(!b)return;e.preventDefault();if(e.repeat)return;input(b,true)});
addEventListener('keyup',e=>{const b=KEYMAP[e.key];if(b)input(b,false)});
/* touch: tap the square, tap a row to choose it and again to buy, tap "START menu" */
$('#sq').addEventListener('pointerdown',e=>{e.preventDefault();unlock();SEL=0;drawList();press()});
rowsEl.addEventListener('click',e=>{const r=e.target.closest('.row');if(!r)return;unlock();const i=+r.dataset.i;if(SEL===i)buy(i);else{SEL=i;drawList()}});
$('#menu').addEventListener('click',e=>{const r=e.target.closest('.it');if(!r)return;MENU.sel=+r.dataset.m;menuItems()[MENU.sel].f()});
$('#ft').lastElementChild.addEventListener('click',()=>{if(MENU)closeMenu();else openMenu()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});addEventListener('pagehide',flush);
/* ---------- the console ---------- */
window.ZPCart={title:'Gray Squares',input(btn,down){input(btn,down)},home(){flush();return true},snapshot(){return null}};
if(ZP&&ZP.cartReady)try{ZP.cartReady(window.ZPCart)}catch(e){}
/* ---------- time passing (also while you were away, up to a day) ---------- */
function awayGain(quiet){const away=Math.min(86400,Math.max(0,(Date.now()-(S.t||Date.now()))/1000)),ps=perSec();S.t=Date.now();if(away>30&&ps>0){const g=ps*away;S.n+=g;S.run+=g;S.all+=g;shown=S.n;
  setTimeout(()=>say('While you were away, the squares kept going. +'+fmt(g)+'.'),400);return}if(!quiet&&!S.presses)setTimeout(()=>say('This is a square. Press A.'),300)}
const LOCAL_T=S.presses?(S.t||0):0;awayGain();
/* the account copy wins when it is newer than this device's (or this device has none) */
(async()=>{const c=cloud();if(!c)return;try{const r=await c.load('squares','progress');if(!r||!r.ok||!r.json)return;const d=JSON.parse(r.json);
  if((d.t||0)>LOCAL_T){S=Object.assign(fresh(),d);S.own=S.own||{};S.seen=S.seen||{};shown=S.n;awayGain(true);tint();drawList();drawTop()}}catch(e){}})();
tint();drawList();drawTop();
let last=performance.now(),acc=0,idle=0,lastList=0;
setInterval(()=>{const now=performance.now(),dt=Math.min(1,(now-last)/1000);last=now;const g=perSec()*dt;S.n+=g;S.run+=g;S.all+=g;
  drawTop();if(now-lastList>250){lastList=now;drawList();checkSay()}
  darkTick(dt);msgT+=dt;if(msgT>9)$('#msg').style.opacity=.45},50);
setInterval(save,1000);
if(/sqtest/.test(location.hash))window.__SQ={S:()=>S,input,act,press,buy,items,perSec,fmt,save,warmer};
