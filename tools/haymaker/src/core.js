/* ================= setup ================= */
const ZP=(()=>{try{return window.parent!==window&&window.parent.ZIGAPLAY||null}catch(e){return null}})();
const RT=document.documentElement;if(ZP)RT.classList.add('zp');
if(!ZP&&(matchMedia('(pointer:coarse)').matches||'ontouchstart'in window))RT.classList.add('touch');
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const rnd=Math.random,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,sgn=v=>v<0?-1:v>0?1:0,pick=a=>a[Math.floor(rnd()*a.length)],TAU=Math.PI*2;
const rr=(a,b)=>a+rnd()*(b-a),ease=t=>t<=0?0:t>=1?1:t*t*(3-2*t),easeOut=t=>t<=0?0:t>=1?1:1-(1-t)*(1-t);
const store={get(k,d){try{const v=localStorage.getItem('haymaker-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('haymaker-'+k,JSON.stringify(v))}catch(e){}}};
/* the view: the screen in CSS pixels, drawn at up to 2x. The ring is drawn into a small buffer (BW x BH, at least
   180 x 250 "ring pixels") and scaled up by PS with sharp pixels. UI sizes follow U. */
let SW=300,SH=430,DPR=1,U=1,PORT=true,PS=2,BW=180,BH=250;
const BUF=document.createElement('canvas'),bx=BUF.getContext('2d');
let G=bx;/* the context the art functions draw into */
function resize(){DPR=Math.min(2,devicePixelRatio||1);SW=innerWidth||300;SH=innerHeight||430;cv.width=Math.round(SW*DPR);cv.height=Math.round(SH*DPR);PORT=SH>SW*1.05;
  U=PORT?Math.min(SW/300,SH/440):Math.min(SH/290,SW/470);
  PS=Math.max(1,Math.min(SW/180,SH/250));BW=Math.ceil(SW/PS);BH=Math.ceil(SH/PS);BUF.width=BW;BUF.height=BH}
addEventListener('resize',resize);resize();
const FONT="'Pixelify Sans','VT323',ui-monospace,Menlo,monospace";
const font=(px,w=600)=>`${w} ${Math.max(7,Math.round(px*U))}px ${FONT}`;
function text(s,x,y,px,col,al='left',out=null,w=600){ctx.font=font(px,w);ctx.textAlign=al;ctx.textBaseline='top';if(out){ctx.lineWidth=Math.max(2,px*U*.24);ctx.strokeStyle=out;ctx.lineJoin='round';ctx.strokeText(s,x,y)}ctx.fillStyle=col;ctx.fillText(s,x,y)}
function tw(s,px,w=600){ctx.font=font(px,w);return ctx.measureText(s).width}
function wrap(s,maxW,px,w=600){ctx.font=font(px,w);const out=[];for(const para of String(s).split('\n')){let line='';for(const word of para.split(' ')){const t=line?line+' '+word:word;if(ctx.measureText(t).width>maxW&&line){out.push(line);line=word}else line=t}out.push(line)}return out}
function rrect(x,y,w,h,r,c=ctx){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function panel(x,y,w,h,fill='rgba(10,8,20,.86)',edge='#f2c14e',r=8){rrect(x,y,w,h,r*U);ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=Math.max(1.5,2*U);ctx.strokeStyle=edge;ctx.stroke()}
const shade=(c,t)=>{const n=parseInt(c.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=t<0?0:255,a=Math.abs(t);r=Math.round(r+(f-r)*a);g=Math.round(g+(f-g)*a);b=Math.round(b+(f-b)*a);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)};
if(document.fonts&&document.fonts.load){document.fonts.load(`20px 'Pixelify Sans'`).catch(()=>{})}

/* ================= sound ================= */
let AC=null,master=null,muted=!!store.get('mute',false);
function audio(){if(AC)return AC;try{const A=(ZP&&ZP.AudioContext)||window.AudioContext||window.webkitAudioContext;if(!A)return null;AC=new A();master=AC.createGain();master.gain.value=muted?0:.5;
  const comp=AC.createDynamicsCompressor();master.connect(comp);comp.connect(AC.destination)}catch(e){AC=null}return AC}
function unlock(){const a=audio();if(a&&a.state==='suspended')a.resume().catch(()=>{})}
function tone({f=440,f2=null,d=.1,type='square',v=.2,t0=0,a=.006}){const A=AC;if(!A||muted)return;const t=A.currentTime+t0,o=A.createOscillator(),g=A.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.02)}
let NB=null;function noise({d=.1,v=.2,f=1200,q=1,t0=0,type='bandpass',f2=null}){const A=AC;if(!A||muted)return;if(!NB){NB=A.createBuffer(1,A.sampleRate*.5,A.sampleRate);const c=NB.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=rnd()*2-1}
  const t=A.currentTime+t0,s=A.createBufferSource(),bp=A.createBiquadFilter(),g=A.createGain();s.buffer=NB;s.loop=true;bp.type=type;bp.frequency.setValueAtTime(f,t);if(f2)bp.frequency.exponentialRampToValueAtTime(f2,t+d);bp.Q.value=q;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
  s.connect(bp);bp.connect(g);g.connect(master);s.start(t);s.stop(t+d+.02)}
const SFX={
  jab(){noise({d:.07,f:900,q:.8,v:.32});tone({f:130,f2:55,d:.09,type:'sine',v:.34})},
  cross(){noise({d:.09,f:700,q:.7,v:.38});tone({f:115,f2:45,d:.12,type:'sine',v:.4})},
  hay(){noise({d:.16,f:500,q:.6,v:.45});tone({f:95,f2:32,d:.22,type:'sine',v:.5});noise({d:.3,f:2600,q:.5,v:.07,t0:.03})},
  whoosh(){noise({d:.15,f:900,f2:2600,q:.9,v:.13})},
  block(){noise({d:.06,f:350,q:1,v:.25});tone({f:90,f2:60,d:.06,type:'sine',v:.18})},
  hurt(){noise({d:.12,f:420,q:.6,v:.42});tone({f:80,f2:30,d:.2,type:'sine',v:.45});noise({d:.08,f:3000,q:1,v:.08,t0:.02})},
  bell(n=1){for(let i=0;i<n;i++){tone({f:1318,d:1.1,type:'triangle',v:.16,t0:i*.32});tone({f:1976,d:.8,type:'sine',v:.08,t0:i*.32});tone({f:3120,d:.4,type:'sine',v:.03,t0:i*.32})}},
  crowd(v=.14,d=1.4){noise({d,f:700,q:.35,v,type:'bandpass'});noise({d:d*.8,f:1600,q:.5,v:v*.4})},
  count(){tone({f:520,d:.14,v:.12,type:'square'})},
  perfect(){tone({f:1568,d:.08,type:'triangle',v:.09});tone({f:2093,d:.12,type:'triangle',v:.07,t0:.05})},
  ok(){tone({f:1046,d:.06,type:'triangle',v:.07})},
  miss(){tone({f:180,f2:120,d:.16,type:'square',v:.08})},
  combo(){[784,988,1175,1568].forEach((f,i)=>tone({f,d:.12,type:'triangle',v:.09,t0:i*.05}))},
  ko(){noise({d:.9,f:300,q:.4,v:.4});tone({f:400,f2:40,d:.8,type:'sawtooth',v:.12});tone({f:55,f2:28,d:.8,type:'sine',v:.4})},
  fall(){noise({d:.35,f:200,q:.5,v:.4});tone({f:70,f2:30,d:.3,type:'sine',v:.4})},
  move(){tone({f:700,d:.03,v:.05})},pick(){tone({f:660,d:.05,v:.08});tone({f:990,d:.07,v:.08,t0:.05})},back(){tone({f:400,f2:300,d:.07,v:.07})},
  blip(){tone({f:1200+rnd()*200,d:.02,type:'square',v:.025})},
  win(){[523,659,784,1047,1319].forEach((f,i)=>tone({f,d:.28,type:'triangle',v:.12,t0:i*.1}))},
  lose(){[392,349,311,262].forEach((f,i)=>tone({f,d:.35,type:'triangle',v:.1,t0:i*.18}))}};
function setMute(m){muted=m;store.set('mute',m);if(master)master.gain.value=m?0:.5;if(MUS.bus)MUS.bus.gain.value=m?0:MUS.vol}
/* ================= vibration =================
   Phones with a vibration motor (Android) use navigator.vibrate. iPhones have no vibration API for web pages; a
   page can only get a haptic tick by toggling a hidden switch, and since iOS 18.4 only within about a second of a
   tap (a click). So on iPhone a buzz plays at once when you tapped a button in the last second, or else waits for
   the click that ends the tap you're making (that's every dodge and punch). */
const HAP={on:store.get('vib',true),lab:null,inp:null,last:0,grant:-1e9,queued:0};
const hapWin=()=>{let w=window;try{if(ZP&&window.parent.document)w=window.parent}catch(e){}return w};
const canVibrate=()=>{try{return typeof hapWin().navigator.vibrate==='function'}catch(e){return false}};
const IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function hapTick(){try{const w=hapWin(),d=w.document,id='zp-haptic';if(!HAP.lab||!HAP.lab.isConnected){let lab=d.getElementById(id+'-l'),inp=d.getElementById(id);
    if(!lab||!inp){inp=d.createElement('input');inp.type='checkbox';inp.setAttribute('switch','');inp.id=id;lab=d.createElement('label');lab.id=id+'-l';lab.htmlFor=id;
      for(const e of[inp,lab]){e.setAttribute('aria-hidden','true');e.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none'}d.body.append(inp,lab)}HAP.lab=lab;HAP.inp=inp}
  HAP.lab.click()}catch(e){}}
function haptic(ms){if(!HAP.on)return;const now=performance.now();if(now-HAP.last<40)return;HAP.last=now;
  if(canVibrate()){try{hapWin().navigator.vibrate(ms)}catch(e){}return}
  if(!IOS)return;if(now-HAP.grant<950)hapTick();else HAP.queued=now}
/* a rhythm of buzzes: [on, off, on, ...] in ms; on iPhone each "on" is one tick (those after the first second are lost) */
function buzz(pat){if(!HAP.on)return;if(canVibrate()){try{hapWin().navigator.vibrate(pat)}catch(e){}return}
  if(!IOS)return;let t=0;pat.forEach((ms,i)=>{if(i%2===0){const at=t;if(at===0){HAP.last=0;haptic(ms)}else setTimeout(()=>{if(performance.now()-HAP.grant<950)hapTick()},at)}t+=ms})}
/* every real tap (on the console's buttons, or the touch pad here) opens a second's window, and plays a waiting buzz */
(()=>{const docs=[document];try{if(ZP&&window.parent.document)docs.push(window.parent.document)}catch(e){}
  for(const d of docs)d.addEventListener('click',e=>{if(!e.isTrusted||e.target===HAP.lab||e.target===HAP.inp)return;HAP.grant=performance.now();
    if(HAP.queued&&HAP.grant-HAP.queued<700){HAP.queued=0;hapTick()}},true)})();
const RUMBLE={dodge:()=>haptic(12),perfect:()=>buzz([14,30,10]),jab:()=>haptic(22),cross:()=>haptic(30),hay:()=>buzz([45,35,60]),block:()=>haptic(15),
  hurt:()=>buzz([70,40,40]),combo:()=>buzz([25,45,25,45,70]),odown:()=>buzz([90,60,90,60,140]),pdown:()=>buzz([160,90,80]),ko:()=>buzz([120,70,120,70,260]),
  bell:()=>buzz([30,90,30]),count:()=>haptic(10),mash:()=>haptic(8),up:()=>buzz([40,50,40]),win:()=>buzz([40,60,40,60,40,60,180]),lose:()=>buzz([200])};
/* ================= buttons =================
   D-pad, A, B, START, SELECT. Presses are timestamped so the rhythm lanes judge them to the millisecond. */
const RAW={held:{},tap:{}},PRESSES=[];
function rawInput(btn,down){unlock();if(down){if(!RAW.held[btn]){RAW.tap[btn]=true;PRESSES.push({b:btn,at:performance.now()})}RAW.held[btn]=true}else RAW.held[btn]=false}
function clearTaps(){RAW.tap={};PRESSES.length=0}
const TAP=b=>!!RAW.tap[b];
const KEYS={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right',
  z:'a',Z:'a',j:'a',J:'a',' ':'a',x:'b',X:'b',k:'b',K:'b',Enter:'start',Escape:'start',p:'start',P:'start',Shift:'select'};
addEventListener('keydown',e=>{const b=KEYS[e.key];if(!b)return;e.preventDefault();if(!e.repeat)rawInput(b,true)});
addEventListener('keyup',e=>{const b=KEYS[e.key];if(b)rawInput(b,false)});
addEventListener('blur',()=>{for(const k in RAW.held)RAW.held[k]=false});
/* touch pad (only outside the ZigaPlay) */
(()=>{const dp=document.getElementById('dp');if(!dp)return;const set=(e)=>{const r=dp.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,d=Math.hypot(x,y);
    const want={left:d>18&&x<-Math.abs(y)*.6,right:d>18&&x>Math.abs(y)*.6,up:d>18&&y<-Math.abs(x)*.6,down:d>18&&y>Math.abs(x)*.6};
    for(const k in want){if(want[k]!==!!RAW.held[k])rawInput(k,want[k]);dp.querySelector(`[data-d=${k}]`).classList.toggle('on',want[k])}};
  const end=()=>{for(const k of['left','right','up','down']){if(RAW.held[k])rawInput(k,false);dp.querySelector(`[data-d=${k}]`).classList.remove('on')}};
  dp.addEventListener('pointerdown',e=>{e.preventDefault();dp.setPointerCapture(e.pointerId);set(e)});dp.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')set(e)});
  dp.addEventListener('pointerup',end);dp.addEventListener('pointercancel',end);
  for(const[id,b]of[['bA','a'],['bB','b'],['bS','start']]){const el=document.getElementById(id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.classList.add('on');rawInput(b,true)});
    const up=()=>{el.classList.remove('on');rawInput(b,false)};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)}})();
/* menus: a repeat when a direction is held */
const REP={};function menuDir(){for(const d of['up','down','left','right']){if(RAW.tap[d]){REP[d]=performance.now()+300;return d}
    if(RAW.held[d]&&REP[d]&&performance.now()>REP[d]){REP[d]=performance.now()+95;return d}}return null}

/* ================= saving: every second, on this device and (on the ZigaPlay) to your account =================
   The Claude app can clear this device's storage when it closes; the account copy is what comes back then. */
const SAVE=Object.assign({at:0,step:0,beaten:{},met:{},best:{},timing:1,fight:null,done:false},store.get('save',{}));
const acct=()=>{try{return ZP&&ZP.cloud||null}catch(e){return null}};
let saveHook=null;
function saveNow(flush){if(saveHook)saveHook();SAVE.at=Date.now();store.set('save',SAVE);const c=acct();if(c)try{c.save('haymaker',JSON.stringify(SAVE),{at:SAVE.at},'progress');if(flush)c.flush('haymaker')}catch(e){}}
async function loadAccount(apply){const c=acct();if(!c)return;try{const r=await c.load('haymaker','progress');if(!r||!r.ok||!r.json)return;const d=JSON.parse(r.json);if((d.at||0)>(SAVE.at||0)){Object.assign(SAVE,d);store.set('save',SAVE);apply&&apply()}}catch(e){}}
