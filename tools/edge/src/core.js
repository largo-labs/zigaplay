/* ================= setup ================= */
const ZP=(()=>{try{return window.parent!==window&&window.parent.ZIGAPLAY||null}catch(e){return null}})();
const RT=document.documentElement;if(ZP)RT.classList.add('zp');
if(!ZP&&(matchMedia('(pointer:coarse)').matches||'ontouchstart'in window))RT.classList.add('touch');
const $=s=>document.querySelector(s);
const rnd=Math.random,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,sgn=v=>v<0?-1:v>0?1:0,pick=a=>a[Math.floor(rnd()*a.length)],D2R=Math.PI/180;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const store={get(k,d){try{const v=localStorage.getItem('edge-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('edge-'+k,JSON.stringify(v))}catch(e){}}};
/* the HTML layer is designed at 640 x 360 and scaled to the screen */
let UIS=1;function fitUI(){const w=innerWidth,h=innerHeight;UIS=Math.min(w/640,h/360);const ui=$('#ui');ui.style.transform=`translate(-50%,-50%) scale(${UIS})`}
addEventListener('resize',fitUI);fitUI();

/* ================= input =================
   Raw buttons come from the console (or the keyboard, or the touch controls); the stick also reports where it
   points. Each game frame turns them into a pad: the stick (x right, y up, -1..1), and the game's actions
   (attack, special, jump, shield, grab) held / pressed this frame, using the player's button mapping. */
const BTN=['up','down','left','right','a','b','c','d','start','select'];
const RAW={held:{},tap:{},rel:{},ax:0,ay:0,analogAt:-1e9};
for(const b of BTN){RAW.held[b]=false;RAW.tap[b]=false;RAW.rel[b]=false}
function rawInput(btn,down){if(!BTN.includes(btn))return;if(down){if(!RAW.held[btn])RAW.tap[btn]=true;RAW.held[btn]=true}else{if(RAW.held[btn])RAW.rel[btn]=true;RAW.held[btn]=false}}
function rawStick(x,y){RAW.ax=clamp(+x||0,-1,1);RAW.ay=clamp(+y||0,-1,1);RAW.analogAt=performance.now()}
const ACTIONS=[['attack','ATTACK'],['special','SPECIAL'],['jump','JUMP'],['shield','SHIELD / DODGE'],['grab','GRAB']];
const DEFAULT_MAP={attack:'a',special:'b',jump:'c',shield:'d',grab:'',tapJump:false,smash:true};
let MAP=Object.assign({},DEFAULT_MAP,store.get('map',{}));
function saveMap(){store.set('map',MAP)}
function btnOf(action){return MAP[action]||''}
/* the human's pad, rebuilt every frame */
function makePad(){return{x:0,y:0,px:0,py:0,held:{},pressed:{},released:{},flickX:0,flickY:0,flickAt:-99,neutralAt:0,t:0,menu:{}}}
const HUMAN=makePad();
function readPad(P){P.t++;
  let x=0,y=0;const analog=performance.now()-RAW.analogAt<1500&&(Math.abs(RAW.ax)>.04||Math.abs(RAW.ay)>.04);
  if(analog){x=RAW.ax;y=-RAW.ay}else{x=(RAW.held.right?1:0)-(RAW.held.left?1:0);y=(RAW.held.up?1:0)-(RAW.held.down?1:0);if(x&&y){x*=.7071;y*=.7071}}
  P.px=P.x;P.py=P.y;P.x=x;P.y=y;
  /* a flick: the stick goes from near the middle to near the edge within a few frames (smash attacks, dashes, fast falls) */
  const m=Math.hypot(x,y),pm=Math.hypot(P.px,P.py);if(m<.3)P.neutralAt=P.t;
  P.flickX=0;P.flickY=0;
  if(m>.75&&P.t-P.neutralAt<=4){if(Math.abs(x)>.6&&Math.abs(P.px)<.6)P.flickX=sgn(x);if(Math.abs(y)>.6&&Math.abs(P.py)<.6)P.flickY=sgn(y);if(P.flickX||P.flickY)P.flickAt=P.t}
  for(const[a]of ACTIONS){const b=MAP[a];P.pressed[a]=!!(b&&RAW.tap[b]);P.held[a]=!!(b&&RAW.held[b]);P.released[a]=!!(b&&RAW.rel[b])}
  if(MAP.tapJump&&P.flickY>0)P.pressed.jump=true,P.held.jump=true;
  if(MAP.tapJump&&y>.6)P.held.jump=true;
  /* menus always use the console's own buttons: A to choose, B to go back */
  for(const b of BTN)P.menu[b]=RAW.tap[b];
  P.menu.mx=0;P.menu.my=0}
function clearRaw(){for(const b of BTN){RAW.tap[b]=false;RAW.rel[b]=false}}
/* menu navigation repeats when a direction is held */
const REP={d:'',t:0};
function menuDir(){const P=HUMAN;let d='';if(P.menu.up||RAW.held.up&&!RAW.held.down||P.y>.6)d='up';else if(P.menu.down||RAW.held.down||P.y<-.6)d='down';else if(P.menu.left||RAW.held.left||P.x<-.6)d='left';else if(P.menu.right||RAW.held.right||P.x>.6)d='right';
  if(!d){REP.d='';return''}if(d!==REP.d){REP.d=d;REP.t=0;return d}REP.t++;if(REP.t>18&&REP.t%5===0)return d;return''}
/* the keyboard, when played in a browser outside the ZigaPlay */
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right',
  j:'a',J:'a',z:'a',Z:'a',k:'b',K:'b',x:'b',X:'b',l:'c',L:'c',' ':'c',c:'c',C:'c',i:'d',I:'d',v:'d',V:'d',Enter:'start',Escape:'start',Shift:'select'};
addEventListener('keydown',e=>{const b=KEYMAP[e.key];if(!b)return;e.preventDefault();unlock();if(e.repeat)return;rawInput(b,true)});
addEventListener('keyup',e=>{const b=KEYMAP[e.key];if(b)rawInput(b,false)});
addEventListener('blur',()=>{for(const b of BTN)rawInput(b,false);rawStick(0,0)});
/* touch controls outside the console */
(()=>{const st=$('#tstick'),kn=$('#tknob');let id=null;
  const move=e=>{const r=st.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=(e.clientX-cx)/(r.width/2),dy=(e.clientY-cy)/(r.height/2);const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}
    kn.style.transform=`translate(${dx*39}px,${dy*39}px)`;rawStick(dx,dy)};
  st.addEventListener('pointerdown',e=>{e.preventDefault();unlock();id=e.pointerId;try{st.setPointerCapture(id)}catch(_){}move(e)});
  st.addEventListener('pointermove',e=>{if(e.pointerId===id)move(e)});
  const end=e=>{if(e.pointerId!==id)return;id=null;kn.style.transform='';rawStick(0,0)};st.addEventListener('pointerup',end);st.addEventListener('pointercancel',end);
  for(const[id2,b]of[['tA','a'],['tB','b'],['tC','c'],['tD','d'],['tS','start']]){const el=$('#'+id2);
    el.addEventListener('pointerdown',e=>{e.preventDefault();unlock();try{el.setPointerCapture(e.pointerId)}catch(_){}rawInput(b,true)});
    const up=()=>rawInput(b,false);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up)}})();

/* ================= sound: synthesised, no files ================= */
let AC=null,master=null,musicBus=null,sfxBus=null,muted=!!store.get('mute',false);
function audio(){if(AC)return AC;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;AC=new A();master=AC.createGain();master.gain.value=muted?0:.6;
  const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;master.connect(comp);comp.connect(AC.destination);
  musicBus=AC.createGain();musicBus.gain.value=.22;musicBus.connect(master);sfxBus=AC.createGain();sfxBus.gain.value=.9;sfxBus.connect(master)}catch(e){AC=null}return AC}
function unlock(){const a=audio();if(a&&a.state==='suspended')a.resume().catch(()=>{})}
function tone({f=440,f2=null,d=.12,type='square',v=.2,t0=0,dest=null,a=.005}){const c=AC;if(!c||muted)return;const t=c.currentTime+t0,o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g);g.connect(dest||sfxBus);o.start(t);o.stop(t+d+.02)}
let NB=null;function noise({d=.15,v=.2,f=1000,q=1,t0=0,type='bandpass',f2=null,dest=null}){const c=AC;if(!c||muted)return;if(!NB){NB=c.createBuffer(1,c.sampleRate,c.sampleRate);const ch=NB.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=rnd()*2-1}
  const t=c.currentTime+t0,s=c.createBufferSource(),bp=c.createBiquadFilter(),g=c.createGain();s.buffer=NB;s.playbackRate.value=.8+rnd()*.4;bp.type=type;bp.frequency.setValueAtTime(f,t);if(f2)bp.frequency.exponentialRampToValueAtTime(f2,t+d);bp.Q.value=q;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(bp);bp.connect(g);g.connect(dest||sfxBus);s.start(t,rnd()*.5);s.stop(t+d+.02)}
const SFX={
  swing(h){noise({d:.12+h*.05,f:900,f2:2600,q:.9,v:.1+h*.05})},
  slash(){noise({d:.14,f:2400,f2:5200,q:1.4,v:.12});tone({f:1400,f2:700,d:.1,type:'triangle',v:.04})},
  hit(p){/* p: 0 light, 1 medium, 2 heavy */const lo=[170,130,95][p];tone({f:lo,f2:lo*.35,d:.1+p*.07,type:'sine',v:.5});noise({d:.06+p*.06,f:[1800,1300,900][p],q:.8,v:.35+p*.08});if(p===2)noise({d:.35,f:240,q:.5,v:.3,type:'lowpass'})},
  cut(p){tone({f:2200,f2:1400,d:.09,type:'square',v:.07});tone({f:2900,f2:1900,d:.12,type:'square',v:.05,t0:.01});this.hit(p)},
  jump(){noise({d:.12,f:700,f2:1600,q:.7,v:.09})},
  djump(){noise({d:.16,f:500,f2:2000,q:.7,v:.1});tone({f:300,f2:520,d:.12,type:'triangle',v:.05})},
  land(){noise({d:.07,f:260,q:.7,v:.18,type:'lowpass'})},
  dash(){noise({d:.12,f:1400,f2:500,q:.6,v:.12})},
  shield(){tone({f:180,f2:240,d:.18,type:'sine',v:.08})},
  block(){tone({f:520,d:.08,type:'triangle',v:.12});noise({d:.06,f:3000,v:.1})},
  parry(){[1568,2093,2637].forEach((f,i)=>tone({f,d:.25,type:'triangle',v:.12,t0:i*.03}))},
  shatter(){noise({d:.6,f:3000,q:.3,v:.35});[880,660,440].forEach((f,i)=>tone({f,f2:f*.6,d:.4,type:'triangle',v:.1,t0:i*.07}))},
  grab(){noise({d:.08,f:500,v:.2});tone({f:200,d:.08,v:.1})},
  charge(){tone({f:220,f2:660,d:.6,type:'sawtooth',v:.05})},
  shoot(){tone({f:900,f2:260,d:.16,type:'square',v:.08});noise({d:.08,f:2000,v:.08})},
  boom(){noise({d:.45,f:200,q:.4,v:.4,type:'lowpass'});tone({f:90,f2:35,d:.4,v:.3,type:'sine'})},
  ko(){noise({d:1.1,f:160,q:.3,v:.5,type:'lowpass'});tone({f:240,f2:30,d:.9,type:'sawtooth',v:.18});noise({d:.8,f:5000,f2:1200,q:.6,v:.15,t0:.08});this.crowd(1.2)},
  crowd(s=1){noise({d:1.4*s,f:900,q:.4,v:.09,type:'bandpass'});noise({d:1.2*s,f:1800,q:.5,v:.05,t0:.1})},
  move(){tone({f:880,d:.04,type:'triangle',v:.08})},
  pick(){tone({f:660,d:.07,type:'triangle',v:.12});tone({f:990,d:.12,type:'triangle',v:.12,t0:.06})},
  back(){tone({f:440,f2:300,d:.09,type:'triangle',v:.1})},
  beep(){tone({f:660,d:.18,type:'square',v:.1})},
  go(){tone({f:1320,d:.5,type:'square',v:.1});tone({f:990,d:.5,type:'triangle',v:.12});this.crowd(.8)},
  game(){[523,392,330,262].forEach((f,i)=>tone({f,d:.3,type:'square',v:.1,t0:i*.12}))},
  win(){[523,659,784,1047,1319].forEach((f,i)=>tone({f,d:.22,type:'triangle',v:.13,t0:i*.1}));this.crowd(1.5)},
};
/* music: a sequencer with drums, bass, chords and a lead; one song per stage and one for the menus */
const SONGS={
  menu:{bpm:112,bass:[45,45,52,52,43,43,50,50],ch:[[57,60,64],[55,59,62],[53,57,60],[55,59,62]],lead:[69,0,72,0,76,74,72,0,67,0,71,0,74,72,71,0]},
  sky:{bpm:138,bass:[40,40,52,40,43,43,55,43,45,45,57,45,43,43,55,47],ch:[[64,67,71],[62,67,71],[64,69,72],[62,66,71]],lead:[76,0,79,76,83,0,81,79,76,0,74,76,79,0,71,0]},
  dock:{bpm:126,bass:[38,38,50,38,41,41,53,41,36,36,48,36,43,43,55,43],ch:[[62,65,69],[60,65,69],[60,64,67],[62,67,71]],lead:[74,0,77,0,74,72,69,0,72,0,74,0,77,79,77,0]},
  temple:{bpm:120,bass:[45,45,45,52,41,41,41,48,43,43,43,50,40,40,47,52],ch:[[69,72,76],[65,69,72],[67,71,74],[64,68,71]],lead:[81,0,79,76,74,0,76,0,72,74,76,0,79,0,76,0]},
  orbit:{bpm:144,bass:[33,33,45,33,36,36,48,36,31,31,43,31,38,38,50,38],ch:[[57,60,64],[60,64,67],[55,59,62],[62,65,69]],lead:[69,72,76,72,81,76,72,76,67,71,74,71,79,74,71,74]},
};
const mf=n=>440*Math.pow(2,(n-69)/12);let mus={on:false,step:0,next:0,timer:0,song:'menu'};
function musicTick(){const c=AC;if(!c||!mus.on)return;const S=SONGS[mus.song]||SONGS.menu,spb=60/S.bpm/4;
  while(mus.next<c.currentTime+.25){const s=mus.step,t=mus.next-c.currentTime;if(!muted){
      if(s%4===0)tone({f:120,f2:42,d:.16,type:'sine',v:.5,t0:t,dest:musicBus});
      if(s%8===4)noise({d:.12,f:1800,q:.6,v:.22,t0:t,dest:musicBus});
      if(s%2===1)noise({d:.03,f:7000,q:1,v:.05,t0:t,type:'highpass',dest:musicBus});
      if(s%2===0){const b=S.bass[(s/2)%S.bass.length];tone({f:mf(b),d:.2,type:'sawtooth',v:.09,t0:t,dest:musicBus,a:.01});tone({f:mf(b-12),d:.2,type:'sine',v:.16,t0:t,dest:musicBus})}
      if(s%16===0){const ch=S.ch[(s/16)%S.ch.length];for(const n of ch)tone({f:mf(n),d:spb*14,type:'triangle',v:.035,t0:t,dest:musicBus,a:.08})}
      const l=S.lead[s%S.lead.length];if(l&&mus.song!=='menu'||l&&s%2===0)tone({f:mf(l),d:spb*1.7,type:'square',v:.045,t0:t,dest:musicBus,a:.01})}
    mus.step++;mus.next+=spb}}
function music(on,song){if(song&&song!==mus.song){mus.song=song;mus.step=0}mus.on=on;const c=AC;if(on&&c){mus.next=Math.max(mus.next,c.currentTime+.05);if(!mus.timer)mus.timer=setInterval(musicTick,60)}}
/* ================= vibration on hits =================
   Phones that have it (Android) get navigator.vibrate. iPhone Safari has no vibrate, but it gives a haptic tick when a
   switch control is flipped, so a hidden one is flipped instead. It lives in the console page when on the ZigaPlay,
   since that is where the player's touches are. */
const HAPTIC={on:store.get('vib',true),lab:null,last:0};
function hapticWin(){try{return ZP?window.parent:window}catch(e){return window}}
function haptic(ms){if(!HAPTIC.on)return;const now=performance.now();if(now-HAPTIC.last<40)return;HAPTIC.last=now;const w=hapticWin();
  try{const nv=w.navigator;if(typeof nv.vibrate==='function'){nv.vibrate(ms);return}}catch(e){}
  try{if(!HAPTIC.lab||!HAPTIC.lab.isConnected){const d=w.document,id='zp-haptic';let lab=d.getElementById(id+'-l');
      if(!lab){const inp=d.createElement('input');inp.type='checkbox';inp.setAttribute('switch','');inp.id=id;inp.tabIndex=-1;inp.setAttribute('aria-hidden','true');
        lab=d.createElement('label');lab.id=id+'-l';lab.htmlFor=id;lab.setAttribute('aria-hidden','true');
        for(const e of[inp,lab])e.style.cssText='position:fixed;left:-200px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';d.body.append(inp,lab)}
      HAPTIC.lab=lab}
    HAPTIC.lab.click();if(ms>=40)setTimeout(()=>{try{HAPTIC.lab.click()}catch(e){}},70)}catch(e){}}
function setVib(on){HAPTIC.on=on;store.set('vib',on);if(on)haptic(20)}
function setMute(m){muted=m;store.set('mute',m);if(master)master.gain.value=m?0:.6}
