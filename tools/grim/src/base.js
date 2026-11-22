/* ================= setup ================= */
const ZP=(()=>{try{return window.parent!==window&&window.parent.ZIGAPLAY||null}catch(e){return null}})();
const RT=document.documentElement;if(ZP)RT.classList.add('zp');
if(!ZP&&(matchMedia('(pointer:coarse)').matches||'ontouchstart'in window))RT.classList.add('touch');
const W=180,K='#07050c',WH='#ffffff';let H=300;
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
const rnd=Math.random,clamp=(v,a,b)=>v<a?a:v>b?b:v,pick=a=>a[Math.floor(rnd()*a.length)],lerp=(a,b,t)=>a+(b-a)*t,sgn=v=>v<0?-1:v>0?1:0;
const store={get(k,d){try{const v=localStorage.getItem('grim-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('grim-'+k,JSON.stringify(v))}catch(e){}}};
const hx=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
const mix=(a,b,t)=>{const A=hx(a),B=hx(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
/* the picture is always 180 wide; its height follows the screen (220 to 340), fixed while a climb is on */
function targetH(){const pad=RT.classList.contains('touch')&&!ZP?Math.min(130,innerHeight*.3):0,aw=Math.max(1,innerWidth-(ZP?0:16)),ah=Math.max(1,innerHeight-pad-(ZP?0:16));
  return clamp(Math.round(W*ah/aw/2)*2,220,340)}
function fit(){const pad=RT.classList.contains('touch')&&!ZP?Math.min(130,innerHeight*.3):0,aw=innerWidth-(ZP?0:16),ah=innerHeight-pad-(ZP?0:16);
  let s=Math.min(aw/W,ah/H);if(s>=2)s=Math.floor(s*2)/2;cv.style.width=Math.round(W*s)+'px';cv.style.height=Math.round(H*s)+'px';
  document.getElementById('stage').style.bottom=pad+'px'}
function applySize(h){H=h||targetH();cv.width=W;cv.height=H;ctx.imageSmoothingEnabled=false;fit()}

/* ================= sound: little synths, no files ================= */
let AC=null,master=null,musicBus=null,muted=!!store.get('mute',false);
function audio(){if(AC)return AC;try{const A=(ZP&&ZP.AudioContext)||window.AudioContext||window.webkitAudioContext;if(!A)return null;AC=new A();master=AC.createGain();master.gain.value=muted?0:.55;master.connect(AC.destination);
  musicBus=AC.createGain();musicBus.gain.value=.28;musicBus.connect(master)}catch(e){AC=null}return AC}
function unlock(){const a=audio();if(a&&a.state==='suspended')a.resume().catch(()=>{})}
function tone({f=440,f2=null,d=.12,type='square',v=.2,t0=0,dest=null}){const a=AC;if(!a||muted)return;const t=a.currentTime+t0,o=a.createOscillator(),g=a.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g);g.connect(dest||master);o.start(t);o.stop(t+d+.02)}
let NB=null;function noise({d=.15,v=.2,f=1000,q=1,t0=0,dest=null}){const a=AC;if(!a||muted)return;if(!NB){NB=a.createBuffer(1,a.sampleRate*.5,a.sampleRate);const c=NB.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=rnd()*2-1}
  const t=a.currentTime+t0,s=a.createBufferSource(),bp=a.createBiquadFilter(),g=a.createGain();s.buffer=NB;bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(bp);bp.connect(g);g.connect(dest||master);s.start(t);s.stop(t+d+.02)}
const SFX={
  jump(){tone({f:240,f2:420,d:.1,type:'triangle',v:.12})},
  spring(){tone({f:200,f2:900,d:.25,type:'triangle',v:.18});noise({d:.08,f:2200,v:.08})},
  slam(){noise({d:.25,f:900,q:.6,v:.22});tone({f:520,f2:110,d:.24,type:'sawtooth',v:.08})},
  thud(){noise({d:.12,f:200,q:.8,v:.32});tone({f:110,f2:55,d:.15,v:.2})},
  swing(n=0){noise({d:.07,f:2400+n*500,q:1.2,v:.14})},
  hit(n=0){tone({f:180+n*40,f2:90,d:.08,v:.24});noise({d:.06,f:1800+n*300,q:1,v:.16});tone({f:600+n*150,f2:900+n*200,d:.08,type:'triangle',v:.1,t0:.02})},
  finish(){tone({f:140,f2:60,d:.22,v:.3});noise({d:.2,f:700,q:.7,v:.25});tone({f:880,f2:1320,d:.18,type:'triangle',v:.14,t0:.05})},
  kill(){[659,784,988,1319].forEach((f,i)=>tone({f,d:.12,type:'triangle',v:.12,t0:i*.05}));noise({d:.3,f:500,q:.5,v:.12})},
  soul(){tone({f:1320,f2:1760,d:.08,type:'sine',v:.1})},
  heart(){[784,988,1175].forEach((f,i)=>tone({f,d:.1,type:'square',v:.08,t0:i*.07}))},
  hurt(){tone({f:300,f2:120,d:.25,type:'sawtooth',v:.16});noise({d:.15,f:400,v:.18})},
  crumble(){noise({d:.2,f:300,q:.6,v:.2})},
  spit(){noise({d:.15,f:1200,q:2,v:.1});tone({f:300,f2:200,d:.1,type:'sawtooth',v:.06})},
  die(){[330,311,294,262,196].forEach((f,i)=>tone({f,f2:f*.95,d:i===4?.9:.25,type:'sawtooth',v:.12,t0:i*.22}))},
  move(){tone({f:520,d:.04,v:.06})},
  pick(){tone({f:660,d:.05,v:.08});tone({f:990,d:.07,v:.08,t0:.05})},
  start(){[262,311,392,523].forEach((f,i)=>tone({f,d:.12,type:'square',v:.1,t0:i*.08}))},
};
/* a creeping minor tune: organ chords, a walking bass and a bell, looped */
const MEL=[69,0,72,71,69,0,64,0,65,0,69,67,64,0,0,0,69,0,72,74,76,0,74,72,71,0,67,69,71,0,0,0],BASS=[45,45,52,52,41,41,48,48,43,43,50,50,40,40,47,44];
const mf=n=>440*Math.pow(2,(n-69)/12);let mus={on:false,step:0,next:0,timer:0,spb:.16};
function musicTick(){const a=AC;if(!a||!mus.on)return;const spb=mus.spb;while(mus.next<a.currentTime+.2){const s=mus.step,t=mus.next-a.currentTime;
    const n=MEL[s%MEL.length];if(n&&!muted){tone({f:mf(n),d:.22,type:'triangle',v:.1,t0:t,dest:musicBus});tone({f:mf(n+12),d:.1,type:'sine',v:.03,t0:t,dest:musicBus})}
    if(s%2===0){const bn=BASS[(s/2)%BASS.length];if(!muted)tone({f:mf(bn-12),d:.3,type:'square',v:.07,t0:t,dest:musicBus})}
    if(s%8===4&&!muted)noise({d:.05,f:6000,v:.03,t0:t,dest:musicBus});mus.step++;mus.next+=spb}}
function music(on){mus.on=on;const a=AC;if(on&&a){mus.next=Math.max(mus.next,a.currentTime+.05);if(!mus.timer)mus.timer=setInterval(musicTick,50)}}
function setMute(m){muted=m;store.set('mute',m);if(master)master.gain.value=m?0:.55}
/* a buzz on hits: vibrate where it exists; on iPhone, a hidden switch gives a haptic tick */
const HAP={on:store.get('vib',true),lab:null,last:0};
function haptic(ms){if(!HAP.on)return;const now=performance.now();if(now-HAP.last<40)return;HAP.last=now;let w=window;try{if(ZP)w=window.parent}catch(e){}
  try{if(typeof w.navigator.vibrate==='function'){w.navigator.vibrate(ms);return}}catch(e){}
  try{if(!HAP.lab||!HAP.lab.isConnected){const d=w.document,id='zp-haptic';let lab=d.getElementById(id+'-l');
      if(!lab){const inp=d.createElement('input');inp.type='checkbox';inp.setAttribute('switch','');inp.id=id;inp.tabIndex=-1;lab=d.createElement('label');lab.id=id+'-l';lab.htmlFor=id;
        for(const e of[inp,lab]){e.setAttribute('aria-hidden','true');e.style.cssText='position:fixed;left:-200px;top:0;width:1px;height:1px;opacity:0;pointer-events:none'}d.body.append(inp,lab)}
      HAP.lab=lab}HAP.lab.click()}catch(e){}}
