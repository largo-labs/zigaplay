/* ================= setup ================= */
const ZP=(()=>{try{return window.parent!==window&&window.parent.ZIGAPLAY||null}catch(e){return null}})();
const RT=document.documentElement;if(ZP)RT.classList.add('zp');
if(!ZP&&(matchMedia('(pointer:coarse)').matches||'ontouchstart'in window))RT.classList.add('touch');
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const rnd=Math.random,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,sgn=v=>v<0?-1:v>0?1:0,pick=a=>a[Math.floor(rnd()*a.length)],TAU=Math.PI*2;
const store={get(k,d){try{const v=localStorage.getItem('strike-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('strike-'+k,JSON.stringify(v))}catch(e){}}};
/* the view: the screen in CSS pixels, drawn at up to 2x; UI sizes follow U = height / 270 */
let SW=480,SH=270,DPR=1,U=1,PORT=false;
function resize(){DPR=Math.min(2,devicePixelRatio||1);SW=innerWidth;SH=innerHeight;cv.width=Math.round(SW*DPR);cv.height=Math.round(SH*DPR);PORT=SH>SW*1.1;U=PORT?Math.min(SW/300,SH/400):Math.min(SH/270,SW/420)}
addEventListener('resize',resize);resize();
const font=(px,w=800)=>`${w} ${Math.round(px*U)}px system-ui,-apple-system,"Segoe UI",sans-serif`;
function text(s,x,y,px,col,al='left',w=800,out=null){ctx.font=font(px,w);ctx.textAlign=al;ctx.textBaseline='top';if(out){ctx.lineWidth=Math.max(2,px*U*.22);ctx.strokeStyle=out;ctx.lineJoin='round';ctx.strokeText(s,x,y)}ctx.fillStyle=col;ctx.fillText(s,x,y)}
function rrect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
const shade=(c,t)=>{const n=parseInt(c.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=t<0?0:255,a=Math.abs(t);r=Math.round(r+(f-r)*a);g=Math.round(g+(f-g)*a);b=Math.round(b+(f-b)*a);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)};

/* ================= sound ================= */
let AC=null,master=null,mbus=null,muted=!!store.get('mute',false);
function audio(){if(AC)return AC;try{const A=(ZP&&ZP.AudioContext)||window.AudioContext||window.webkitAudioContext;if(!A)return null;AC=new A();master=AC.createGain();master.gain.value=muted?0:.5;
  const comp=AC.createDynamicsCompressor();master.connect(comp);comp.connect(AC.destination);mbus=AC.createGain();mbus.gain.value=.22;mbus.connect(master)}catch(e){AC=null}return AC}
function unlock(){const a=audio();if(a&&a.state==='suspended')a.resume().catch(()=>{})}
function tone({f=440,f2=null,d=.1,type='square',v=.2,t0=0,dest=null}){const a=AC;if(!a||muted)return;const t=a.currentTime+t0,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(dest||master);o.start(t);o.stop(t+d+.02)}
let NB=null;function noise({d=.1,v=.2,f=1200,q=1,t0=0}){const a=AC;if(!a||muted)return;if(!NB){NB=a.createBuffer(1,a.sampleRate*.5,a.sampleRate);const c=NB.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=rnd()*2-1}
  const t=a.currentTime+t0,s=a.createBufferSource(),bp=a.createBiquadFilter(),g=a.createGain();s.buffer=NB;bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
  s.connect(bp);bp.connect(g);g.connect(master);s.start(t);s.stop(t+d+.02)}
const SFX={
  swing(){noise({d:.07,f:2200,q:1.2,v:.1})},slash(){noise({d:.09,f:4200,q:2,v:.12});tone({f:2400,f2:1400,d:.06,type:'sine',v:.03})},
  jump(){noise({d:.05,f:700,v:.06});tone({f:240,f2:420,d:.07,type:'triangle',v:.06})},djump(){noise({d:.08,f:1400,q:.8,v:.08});tone({f:380,f2:680,d:.09,type:'triangle',v:.06})},land(){noise({d:.06,f:300,v:.12})},
  hit(p=0){noise({d:.06+p*.05,f:700-p*180,q:.7,v:.3+p*.08});tone({f:140-p*25,f2:50,d:.1+p*.06,type:'sine',v:.35});if(p>1)noise({d:.25,f:2400,q:.5,v:.08,t0:.02})},
  clang(){tone({f:1900,f2:1700,d:.18,type:'triangle',v:.06});tone({f:2830,d:.14,type:'sine',v:.04})},
  shield(){tone({f:900,f2:700,d:.06,type:'triangle',v:.1});noise({d:.05,f:3000,v:.05})},
  parry(){tone({f:1200,f2:1800,d:.12,type:'triangle',v:.14});tone({f:1800,d:.1,type:'sine',v:.08,t0:.04})},brk(){noise({d:.4,f:600,v:.3});tone({f:500,f2:80,d:.4,type:'sawtooth',v:.12})},
  special(){noise({d:.12,f:1800,q:1.5,v:.07});tone({f:400,f2:800,d:.12,type:'sawtooth',v:.04})},
  shot(){noise({d:.05,f:2600,q:.6,v:.22});tone({f:180,f2:60,d:.07,v:.12})},shotgun(){noise({d:.14,f:1600,q:.5,v:.32});tone({f:120,f2:40,d:.14,v:.2})},
  snipe(){noise({d:.08,f:3200,q:.5,v:.28});tone({f:220,f2:50,d:.2,v:.16});noise({d:.4,f:1200,q:.4,v:.05,t0:.05})},
  zap(){tone({f:1400,f2:300,d:.1,type:'sawtooth',v:.07});tone({f:2100,f2:600,d:.08,type:'square',v:.03})},
  orb(){tone({f:300,f2:600,d:.25,type:'sine',v:.1});tone({f:450,f2:900,d:.25,type:'triangle',v:.05})},beam(){tone({f:200,f2:900,d:.35,type:'sawtooth',v:.08});noise({d:.35,f:5000,q:.6,v:.06})},
  rocket(){noise({d:.3,f:500,q:.4,v:.18});tone({f:90,f2:260,d:.25,type:'sawtooth',v:.06})},throw(){noise({d:.08,f:1200,q:1,v:.08})},jet(){noise({d:.2,f:900,q:.4,v:.12})},
  boom(){noise({d:.5,f:240,q:.5,v:.4});tone({f:90,f2:30,d:.45,v:.32});noise({d:.25,f:2000,q:.5,v:.06})},
  ko(){noise({d:.7,f:400,q:.4,v:.35});tone({f:600,f2:50,d:.7,type:'sawtooth',v:.1});tone({f:60,f2:30,d:.6,v:.3})},beep(){tone({f:660,d:.12,v:.12})},go(){tone({f:990,d:.25,v:.14});tone({f:1320,d:.25,type:'triangle',v:.1,t0:.05})},
  move(){tone({f:700,d:.03,v:.05})},pick(){tone({f:660,d:.05,v:.08});tone({f:990,d:.07,v:.08,t0:.05})},back(){tone({f:400,f2:300,d:.07,v:.07})},
  game(){[523,659,784,1047].forEach((f,i)=>tone({f,d:.2,type:'triangle',v:.12,t0:i*.09}))}};
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
/* every real tap (on the console's buttons, or the touch pad here) opens a second's window, and plays a waiting buzz */
(()=>{const docs=[document];try{if(ZP&&window.parent.document)docs.push(window.parent.document)}catch(e){}
  for(const d of docs)d.addEventListener('click',e=>{if(!e.isTrusted||e.target===HAP.lab||e.target===HAP.inp)return;HAP.grant=performance.now();
    if(HAP.queued&&HAP.grant-HAP.queued<700){HAP.queued=0;hapTick()}},true)})();

/* ================= saving: every second, on this device and (on the ZigaPlay) to your account =================
   The Claude app can clear this device's storage when it closes; the account copy is what comes back then. */
const SAVE=Object.assign({at:0,set:{stocks:3,level:4,time:0,speed:85},rec:{},picks:[0,1,0],match:null},store.get('save',{}));
const acct=()=>{try{return ZP&&ZP.cloud||null}catch(e){return null}};
let saveHook=null;
function saveNow(flush){if(saveHook)saveHook();SAVE.at=Date.now();store.set('save',SAVE);const c=acct();if(c)try{c.save('strike',JSON.stringify(SAVE),{at:SAVE.at},'progress');if(flush)c.flush('strike')}catch(e){}}
async function loadAccount(apply){const c=acct();if(!c)return;try{const r=await c.load('strike','progress');if(!r||!r.ok||!r.json)return;const d=JSON.parse(r.json);if((d.at||0)>(SAVE.at||0)){Object.assign(SAVE,d);store.set('save',SAVE);apply&&apply()}}catch(e){}}
