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
  swing(){noise({d:.06,f:2600,q:1.4,v:.12})},jump(){tone({f:300,f2:520,d:.08,type:'triangle',v:.1})},djump(){tone({f:420,f2:760,d:.1,type:'triangle',v:.1})},land(){noise({d:.05,f:400,v:.1})},
  hit(p=0){noise({d:.07+p*.04,f:900-p*200,q:.8,v:.25+p*.08});tone({f:200-p*40,f2:70,d:.09+p*.05,v:.22})},shield(){tone({f:900,f2:700,d:.06,type:'triangle',v:.12})},
  parry(){tone({f:1200,f2:1800,d:.12,type:'triangle',v:.16});tone({f:1800,d:.1,type:'sine',v:.08,t0:.04})},brk(){noise({d:.4,f:600,v:.3});tone({f:500,f2:80,d:.4,type:'sawtooth',v:.15})},
  special(){tone({f:500,f2:900,d:.12,type:'sawtooth',v:.08})},shot(){tone({f:900,f2:300,d:.12,type:'square',v:.08})},boom(){noise({d:.35,f:300,q:.6,v:.35});tone({f:120,f2:40,d:.3,v:.25})},
  ko(){noise({d:.6,f:500,q:.5,v:.35});tone({f:900,f2:60,d:.6,type:'sawtooth',v:.15})},beep(){tone({f:660,d:.12,v:.12})},go(){tone({f:990,d:.25,v:.14});tone({f:1320,d:.25,type:'triangle',v:.1,t0:.05})},
  move(){tone({f:700,d:.03,v:.05})},pick(){tone({f:660,d:.05,v:.08});tone({f:990,d:.07,v:.08,t0:.05})},back(){tone({f:400,f2:300,d:.07,v:.07})},
  game(){[523,659,784,1047].forEach((f,i)=>tone({f,d:.2,type:'triangle',v:.12,t0:i*.09}))}};
/* a driving night tune: a minor bass line, chords and a lead, with a beat */
const MUS={on:false,step:0,next:0,timer:0};const mf=n=>440*Math.pow(2,(n-69)/12);
const LEAD=[69,0,72,74,76,0,74,72,69,0,67,69,72,0,0,0,69,0,72,74,76,79,76,74,72,0,74,72,69,0,0,0],BASSL=[45,45,57,45,43,43,55,43,41,41,53,41,40,40,52,44];
function musicTick(){const a=AC;if(!a||!MUS.on)return;const spb=.13;while(MUS.next<a.currentTime+.2){const s=MUS.step,t=MUS.next-a.currentTime;
  if(!muted){const n=LEAD[s%32];if(n)tone({f:mf(n),d:.16,type:'square',v:.05,t0:t,dest:mbus});const b=BASSL[(s>>1)%16];if(s%2===0)tone({f:mf(b-12),d:.2,type:'triangle',v:.2,t0:t,dest:mbus});
    if(s%4===0)tone({f:120,f2:45,d:.12,type:'sine',v:.3,t0:t,dest:mbus});if(s%4===2)noise({d:.05,f:5000,v:.04,t0:t});if(s%8===4)noise({d:.1,f:1800,q:.7,v:.08,t0:t})}
  MUS.step++;MUS.next+=spb}}
function music(on){MUS.on=on;if(on&&AC){MUS.next=Math.max(MUS.next,AC.currentTime+.05);if(!MUS.timer)MUS.timer=setInterval(musicTick,50)}}
function setMute(m){muted=m;store.set('mute',m);if(master)master.gain.value=m?0:.5}
/* a buzz on big hits: vibrate where it exists; on iPhone a hidden switch gives a haptic tick */
const HAP={on:store.get('vib',true),lab:null,last:0};
function haptic(ms){if(!HAP.on)return;const now=performance.now();if(now-HAP.last<45)return;HAP.last=now;let w=window;try{if(ZP)w=window.parent}catch(e){}
  try{if(typeof w.navigator.vibrate==='function'){w.navigator.vibrate(ms);return}}catch(e){}
  try{if(!HAP.lab||!HAP.lab.isConnected){const d=w.document,id='zp-haptic';let lab=d.getElementById(id+'-l');if(!lab){const inp=d.createElement('input');inp.type='checkbox';inp.setAttribute('switch','');inp.id=id;lab=d.createElement('label');lab.id=id+'-l';lab.htmlFor=id;
    for(const e of[inp,lab]){e.setAttribute('aria-hidden','true');e.style.cssText='position:fixed;left:-200px;top:0;width:1px;height:1px;opacity:0;pointer-events:none'}d.body.append(inp,lab)}HAP.lab=lab}HAP.lab.click()}catch(e){}}

/* ================= saving: every second, on this device and (on the ZigaPlay) to your account =================
   The Claude app can clear this device's storage when it closes; the account copy is what comes back then. */
const SAVE=Object.assign({at:0,set:{stocks:3,level:4,time:0},rec:{},picks:[0,1,0],match:null},store.get('save',{}));
const acct=()=>{try{return ZP&&ZP.cloud||null}catch(e){return null}};
let saveHook=null;
function saveNow(flush){if(saveHook)saveHook();SAVE.at=Date.now();store.set('save',SAVE);const c=acct();if(c)try{c.save('strike',JSON.stringify(SAVE),{at:SAVE.at},'progress');if(flush)c.flush('strike')}catch(e){}}
async function loadAccount(apply){const c=acct();if(!c)return;try{const r=await c.load('strike','progress');if(!r||!r.ok||!r.json)return;const d=JSON.parse(r.json);if((d.at||0)>(SAVE.at||0)){Object.assign(SAVE,d);store.set('save',SAVE);apply&&apply()}}catch(e){}}
