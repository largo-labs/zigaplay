/* ================= steering: tilt the phone, or the D-pad where tilt isn't available =================
   Tilt comes from the phone's orientation sensor. iPhone asks permission first, and only inside a tap, so the game
   asks on the first button press. On the ZigaPlay the sensor is read from the console page, where the touches are. */
const OPT={steer:store.get('steer','auto'),sens:store.get('sens',1)};
const FULL=[30,20,13];
const TILT={raw:0,abs:0,center:store.get('tc',0),live:false,lastAt:-1e9,perm:'unknown'};
const TW=(()=>{try{return ZP?window.parent:window}catch(e){return window}})();
const held={};
function orientAngle(){try{const o=TW.screen&&TW.screen.orientation;if(o&&typeof o.angle==='number')return o.angle;if(typeof TW.orientation==='number')return TW.orientation}catch(e){}return 0}
function onTilt(e){if(e.gamma==null&&e.beta==null)return;const a=((orientAngle()%360)+360)%360,g=e.gamma||0,b=e.beta||0;
  const lat=a===90?b:a===270?-b:a===180?-g:g;TILT.abs=lat;TILT.raw=lat-TILT.center;TILT.lastAt=performance.now();TILT.live=true}
try{TW.addEventListener('deviceorientation',onTilt)}catch(e){addEventListener('deviceorientation',onTilt)}
/* ask on every press and release until it is granted: iPhone only shows its question when asked inside a tap,
   and a release counts as a tap where a press may not. A page shown inside another site's page (the Claude app) is
   refused without a question, so then tilt can't work and the screen sides or the D-pad steer. */
function requestTilt(){if(TILT.perm==='granted')return;let D=null;try{D=TW.DeviceOrientationEvent}catch(e){}
  if(D&&typeof D.requestPermission==='function'){try{D.requestPermission().then(r=>{TILT.perm=r==='granted'?'granted':'denied'}).catch(()=>{})}catch(e){}}
  else TILT.perm='granted'}
function tiltLive(){if(performance.now()-TILT.lastAt>1500)TILT.live=false;return TILT.live}
const tiltOK=()=>tiltLive();
function tiltLine(){if(tiltLive())return'TILT ON: TILT TO STEER';if(TILT.perm==='denied')return'TILT IS BLOCKED HERE\nHOLD A SIDE OF THE SCREEN';
  let D=null;try{D=TW.DeviceOrientationEvent}catch(e){}if(D&&typeof D.requestPermission==='function'&&TILT.perm!=='granted')return'PRESS A TO ALLOW TILT';return'NO TILT SIGNAL HERE\nHOLD A SIDE OF THE SCREEN'}
function steerMode(){if(TOUCH.side)return'pad';if(OPT.steer==='pad')return'pad';if(OPT.steer==='tilt')return'tilt';return tiltLive()?'tilt':'pad'}
function steerX(){if(steerMode()==='tilt'){let v=TILT.raw/FULL[OPT.sens];if(Math.abs(v)<.08)v=0;return clamp(v*Math.abs(v)*.35+v*.65,-1,1)}
  return(held.right?1:0)-(held.left?1:0)||TOUCH.side}
/* holding the left or right half of the picture steers too (the screen itself takes touches, also on the ZigaPlay) */
const TOUCH={id:null,side:0};
function touchSide(e){const r=cv.getBoundingClientRect();TOUCH.side=e.clientX<r.left+r.width/2?-1:1}
cv.addEventListener('pointerdown',e=>{unlock();requestTilt();if(G.state!=='play')return;e.preventDefault();TOUCH.id=e.pointerId;touchSide(e);try{cv.setPointerCapture(e.pointerId)}catch(_){}});
cv.addEventListener('pointermove',e=>{if(e.pointerId===TOUCH.id)touchSide(e)});
for(const t of['pointerup','pointercancel','lostpointercapture'])cv.addEventListener(t,e=>{if(e.pointerId===TOUCH.id){TOUCH.id=null;TOUCH.side=0}});
function centerTilt(){TILT.center=TILT.abs;TILT.raw=0;store.set('tc',TILT.center);SFX.pick();if(G.state==='play'||G.state==='pause')G.pops.push({x:P.x,y:P.y-30,s:'TILT CENTERED',c:'#7af0ff',t:50})}
document.documentElement.classList.toggle('notilt',true);setInterval(()=>RT.classList.toggle('notilt',steerMode()!=='tilt'),500);

/* ================= buttons ================= */
function input(btn,down){unlock();requestTilt();held[btn]=down;if(!down)return;const s=G.state;
  const nav=(n,fn)=>{if(btn==='up'){G.menu=(G.menu+n-1)%n;SFX.move()}else if(btn==='down'){G.menu=(G.menu+1)%n;SFX.move()}else fn()};
  if(s==='title'){const it=titleItems();nav(it.length,()=>{if(btn!=='a'&&btn!=='start')return;SFX.pick();const k=it[G.menu][0];
    if(k==='cont'){SFX.start();newGame(G.saved)}else if(k==='new'){SFX.start();G.saved=null;newGame()}else if(k==='how')G.state='how';else{G.optBack='title';G.state='opts';G.menu=0}})}
  else if(s==='how'){if(btn==='a'||btn==='b'||btn==='start'){SFX.pick();G.state='title';G.menu=titleItems().findIndex(x=>x[0]==='how')}}
  else if(s==='opts')nav(6,()=>{const i=G.menu,ch=btn==='left'?-1:btn==='right'?1:btn==='a'?1:0;
    if(btn==='b'||(btn==='a'&&i===5)||btn==='start'){SFX.pick();if(G.optBack==='pause'){G.state='pause';G.menu=2}else{G.state='title';G.menu=titleItems().length-1}return}
    if(!ch)return;if(i===0){const o=['auto','tilt','pad'];OPT.steer=o[(o.indexOf(OPT.steer)+ch+3)%3];store.set('steer',OPT.steer)}
    else if(i===1){OPT.sens=(OPT.sens+ch+3)%3;store.set('sens',OPT.sens)}else if(i===2){if(btn==='a')centerTilt();return}
    else if(i===3){setMute(!muted);if(!muted)unlock()}else if(i===4){HAP.on=!HAP.on;store.set('vib',HAP.on);if(HAP.on)haptic(25)}SFX.move()});
  else if(s==='play'){if(btn==='a'||btn==='b')P.buf[btn]=G.t;else if(btn==='start'){pause()}else if(btn==='select')centerTilt()}
  else if(s==='pause')nav(4,()=>{if(btn==='start'||btn==='b'){resume();return}if(btn!=='a')return;SFX.pick();
    if(G.menu===0)resume();else if(G.menu===1){centerTilt();resume()}else if(G.menu===2){G.optBack='pause';G.state='opts';G.menu=0}else toTitle()});
  else if(s==='over'&&G.overT<=0){if(btn==='a'||btn==='start'){SFX.start();newGame()}else if(btn==='b'){SFX.pick();toTitle()}}}
function pause(){if(G.state!=='play')return;G.state='pause';G.menu=0;music(false)}
function resume(){G.state='play';music(true)}
function toTitle(){if(G.state==='pause'||G.state==='play')saveProgress(true);G.state='title';G.menu=0;music(true)}
function titleItems(){return G.saved?[['cont','CONTINUE '+meters(G.saved.y)+'M'],['new','NEW CLIMB'],['how','HOW TO PLAY'],['opt','OPTIONS']]:[['new','CLIMB'],['how','HOW TO PLAY'],['opt','OPTIONS']]}
setInterval(()=>{if(G.state==='play'||G.state==='pause')saveProgress()},1000);
addEventListener('pagehide',()=>saveProgress(true));
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',z:'a',Z:'a',k:'a',K:'a',' ':'a',x:'b',X:'b',j:'b',J:'b',Enter:'start',Escape:'start',p:'start',Shift:'select'};
addEventListener('keydown',e=>{const b=KEYMAP[e.key];if(!b)return;e.preventDefault();if(e.repeat)return;input(b,true)});
addEventListener('keyup',e=>{const b=KEYMAP[e.key];if(b)input(b,false)});
addEventListener('blur',()=>{for(const k in held)held[k]=false});
for(const[id,btn]of[['bA','a'],['bB','b'],['bP','start'],['bL','left'],['bR','right']]){const el=document.getElementById(id);
  el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}el.classList.add('on');input(btn,true)});
  const up=()=>{if(!el.classList.contains('on'))return;el.classList.remove('on');input(btn,false)};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up)}
/* tapping the picture: choose on the menus (and asks for tilt on iPhone) */
cv.addEventListener('pointerup',()=>{requestTilt();if(G.state==='title'||G.state==='how'||(G.state==='over'&&G.overT<=0))input('a',true),input('a',false)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();music(false);saveProgress(true)}});
addEventListener('resize',()=>{if(G.state==='title'&&targetH()!==H)applySize();else fit()});

/* ================= the console ================= */
window.ZPCart={title:'Grim Ascent',input(btn,down){input(btn,down)},
  status(){return{state:G.state,tilt:tiltLive(),perm:TILT.perm,raw:Math.round(TILT.raw),steer:+steerX().toFixed(2),h:G.maxH}},
  home(){saveProgress(true);return true},snapshot(){return null}};
if(ZP&&ZP.cartReady)try{ZP.cartReady(window.ZPCart)}catch(e){}

/* ================= go ================= */
applySize();toTitle();
let last=performance.now(),acc=0;const STEP=1000/60;
function frame(now){acc+=Math.min(250,now-last);last=now;let n=0;if(window.__GA&&window.__GA.freeze)acc=0;
  while(acc>=STEP&&n<6){update();if(G.state==='over'&&G.overT>0)G.overT--;acc-=STEP;n++}if(n>=6)acc=0;render();requestAnimationFrame(frame)}
requestAnimationFrame(t=>{last=t;requestAnimationFrame(frame)});
/* hooks for automated tests only (the address must end in #grimtest) */
if(/grimtest/.test(location.hash))window.__GA={G,P,TILT,OPT,held,input,update,render,newGame,toTitle,spawnMon,startCombo,steerX,onTilt,platCanvas,monSpr,reaperSpr,MON};
