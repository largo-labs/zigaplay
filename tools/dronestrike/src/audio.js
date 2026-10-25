/* ===================== AUDIO: synth effects and a small music sequencer ===================== */
const AU=(()=>{
  const ZP=(()=>{try{return window.parent&&window.parent!==window&&window.parent.ZIGAPLAY||null}catch(e){return null}})();
  const AC=(ZP&&ZP.AudioContext)||window.AudioContext||window.webkitAudioContext;
  let ctx=null,master,musicBus,sfxBus,noiseBuf,musicOn=true,sfxOn=true,pending='',gestured=false;
  function init(){if(ctx||!AC)return;try{ctx=new AC()}catch(e){return}
    master=ctx.createGain();master.gain.value=.9;master.connect(ctx.destination);
    musicBus=ctx.createGain();musicBus.gain.value=.5;musicBus.connect(master);sfxBus=ctx.createGain();sfxBus.gain.value=.75;sfxBus.connect(master);
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  function unlock(){gestured=true;init();if(ctx&&ctx.state!=='running')ctx.resume().then(()=>{if(pending&&!cur){const n=pending;curName='';music(n)}}).catch(()=>{})}
  const now=()=>ctx?ctx.currentTime+.005:0;
  function tone(type,f,t,len,vol,bus,o={}){if(!ctx)return;const os=ctx.createOscillator(),g=ctx.createGain();os.type=type;os.frequency.setValueAtTime(f,t);
    if(o.slide)os.frequency.exponentialRampToValueAtTime(Math.max(20,o.slide),t+len);if(o.det)os.detune.value=o.det;
    let node=os;if(o.lp){const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(o.lp,t);if(o.lp2)fl.frequency.exponentialRampToValueAtTime(o.lp2,t+len);fl.Q.value=o.q||1;os.connect(fl);node=fl}
    const a=o.a||.005;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+a);
    if(o.decay)g.gain.exponentialRampToValueAtTime(Math.max(.0004,vol*o.decay),t+len);else g.gain.setValueAtTime(vol,t+Math.max(a,len-(o.r||.05)));
    g.gain.linearRampToValueAtTime(0,t+len+(o.tail||0));node.connect(g);g.connect(bus||sfxBus);os.start(t);os.stop(t+len+(o.tail||0)+.05)}
  function noise(t,len,vol,bus,o={}){if(!ctx)return;const s=ctx.createBufferSource(),g=ctx.createGain(),f=ctx.createBiquadFilter();s.buffer=noiseBuf;
    f.type=o.type||'lowpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+len);f.Q.value=o.q||.7;
    g.gain.setValueAtTime(o.a?0:vol,t);if(o.a)g.gain.linearRampToValueAtTime(vol,t+o.a);g.gain.exponentialRampToValueAtTime(.0005,t+len);
    s.connect(f);f.connect(g);g.connect(bus||sfxBus);s.start(t,Math.random());s.stop(t+len+.05)}
  const SFX={
    tick(){tone('square',1200,now(),.025,.03)},
    ok(){const t=now();tone('square',880,t,.04,.04);tone('square',1320,t+.045,.06,.04)},
    back(){const t=now();tone('square',660,t,.04,.035);tone('square',440,t+.045,.06,.035)},
    buzz(){tone('sawtooth',120,now(),.15,.04)},
    radio(){const t=now();noise(t,.12,.08,null,{type:'bandpass',f:1800,q:2});tone('sine',1400,t+.1,.06,.05);tone('sine',1900,t+.17,.08,.05)},
    type(){noise(now(),.02,.03,null,{type:'highpass',f:3000})},
    launch(){const t=now();noise(t,.7,.12,null,{type:'bandpass',f:400,f2:2600,q:3,a:.1});tone('sawtooth',90,t,.7,.03,null,{slide:220,lp:600})},
    buzzfly(){const t=now();for(let i=0;i<3;i++)tone('sawtooth',170+i*23,t+i*.02,1.2,.012,null,{lp:900,det:i*12})},
    boom(){const t=now();noise(t,.9,.35,null,{f:900,f2:60});tone('sine',70,t,.6,.3,null,{slide:30,decay:.01})},
    smallboom(){const t=now();noise(t,.35,.2,null,{f:1600,f2:120});tone('sine',110,t,.25,.15,null,{slide:50,decay:.02})},
    aa(){const t=now();for(let i=0;i<6;i++)noise(t+i*.07,.05,.12,null,{type:'bandpass',f:900,q:1.5})},
    jam(){const t=now();noise(t,.6,.12,null,{type:'bandpass',f:2400,f2:600,q:4});tone('square',220,t,.5,.02,null,{slide:3000})},
    zap(){const t=now();tone('sawtooth',1800,t,.15,.04,null,{slide:300})},
    stamp(){const t=now();noise(t,.18,.3,null,{f:500});tone('square',196,t,.25,.05,null,{decay:.05})},
    cash(){const t=now();[1047,1319,1568,2093].forEach((f,i)=>tone('square',f,t+i*.05,.09,.035))},
    research(){const t=now();[523,659,784,1047,1568].forEach((f,i)=>tone('triangle',f,t+i*.07,.18,.07,null,{decay:.1}))},
    alarm(){const t=now();for(let i=0;i<3;i++){tone('square',880,t+i*.3,.14,.04);tone('square',660,t+i*.3+.15,.14,.04)}},
    static(){noise(now(),.4,.1,null,{type:'highpass',f:2000})},
    win(){const t=now();[392,523,659,784].forEach((f,i)=>tone('sawtooth',f,t+i*.12,.5,.035,null,{lp:2400,decay:.2}))},
    lose(){const t=now();[392,349,311,262].forEach((f,i)=>tone('sawtooth',f,t+i*.2,.5,.035,null,{lp:1400,decay:.2}))},
  };
  function play(n){if(!sfxOn)return;unlock();if(ctx&&ctx.state==='running'&&SFX[n])try{SFX[n]()}catch(e){}}
  /* ---------- music: notes are "A2:4" (length in sixteenths); a chord is "A2+C3+E3:16" ---------- */
  const NOTE={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const fq=n=>{const m=/^([A-G])([#b]?)(-?\d)$/.exec(n);if(!m)return 0;const s=NOTE[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+(+m[3]+1)*12;return 440*Math.pow(2,(s-69)/12)};
  const parse=str=>{let len=4;return str.trim().split(/\s+/).map(tok=>{const [n,l]=tok.split(':');if(l)len=+l;return[n==='-'?null:n==='x'||n==='k'||n==='s'?n:n.split('+').map(fq),len]})};
  const rep=(s,n)=>Array(n).fill(s).join(' ');
  const SONGS={
    title:{bpm:70,ch:[
      {w:'pad',v:.045,n:'A2+E3+A3:32 F2+C3+A3:32 D2+A2+F3:32 E2+B2+G#3:32'},
      {w:'bass',v:.12,n:rep('A1:4 -:4 A1:2 -:6',4)+' '+rep('F1:4 -:4 F1:2 -:6',4)+' '+rep('D1:4 -:4 D1:2 -:6',4)+' '+rep('E1:4 -:4 E1:2 -:6',4)},
      {w:'lead',v:.03,n:'-:16 E4:8 C4:8 -:16 A3:16 -:16 D4:8 F4:8 E4:32'}]},
    hq:{bpm:84,ch:[
      {w:'pad',v:.035,n:'D3+F3+A3:32 Bb2+D3+F3:32 C3+E3+G3:32 A2+C#3+E3:32'},
      {w:'bass',v:.1,n:rep('D2:2 -:2',8)+' '+rep('Bb1:2 -:2',8)+' '+rep('C2:2 -:2',8)+' '+rep('A1:2 -:2',8)},
      {w:'blip',v:.02,n:'-:12 A5:1 -:3 -:16 -:12 F5:1 -:3 -:16 -:12 G5:1 -:3 -:16 -:12 E5:1 -:3 -:16'}]},
    battle:{bpm:132,ch:[
      {w:'bass',v:.12,n:rep('E1:1 E1:1 E2:1 E1:1',8)+' '+rep('C1:1 C1:1 C2:1 C1:1',4)+' '+rep('D1:1 D1:1 D2:1 D1:1',4)},
      {w:'pad',v:.03,n:'E2+B2+G3:32 C2+G2+E3:16 D2+A2+F#3:16'},
      {w:'lead',v:.028,n:'-:8 B3:2 C4:2 B3:4 -:16 G3:4 A3:4 -:8 B3:2 C4:2 D4:4 E4:8 -:4 D4:4 C4:8 B3:8'},
      {w:'drum',v:.05,n:rep('k:4 x:2 x:2 s:4 x:2 x:2',8)}]},
    debrief:{bpm:76,ch:[
      {w:'pad',v:.04,n:'C3+E3+G3:32 A2+C3+E3:32 F2+A2+C3:32 G2+B2+D3:32'},
      {w:'lead',v:.03,n:'E4:8 G4:8 C5:16 -:8 A4:8 E4:16 F4:8 A4:8 C5:16 B4:16 G4:16'}]},
    tension:{bpm:60,ch:[{w:'pad',v:.04,n:'C2+G2+Eb3:32 Db2+Ab2+F3:32'},{w:'bass',v:.1,n:rep('C1:8 -:8',2)+' '+rep('Db1:8 -:8',2)}]},
  };
  let cur=null,curName='',timer=null;
  function voice(c,f,t,len){
    if(c.w==='pad'){for(const x of f)for(const d of[-7,7])tone('sawtooth',x,t,len,c.v/f.length,cur.g,{lp:700,q:2,a:len*.25,r:len*.3,det:d})}
    else if(c.w==='bass'){for(const x of f)tone('sawtooth',x,t,len*.9,c.v,cur.g,{lp:420,lp2:160,q:5})}
    else if(c.w==='lead'){for(const x of f)tone('square',x,t,len*.95,c.v,cur.g,{lp:1800,a:.02})}
    else if(c.w==='blip'){for(const x of f)tone('sine',x,t,.08,c.v*2,cur.g,{decay:.05})}}
  function music(name){pending=name;if(!gestured&&!ctx)return;if(name===curName)return;stop();curName=name;if(!name||!SONGS[name]||!ctx||ctx.state!=='running')return;
    const s=SONGS[name],sp=60/s.bpm/4,t0=ctx.currentTime+.1;const g=ctx.createGain();g.gain.value=musicOn?1:0;g.connect(musicBus);
    cur={g,sp,chs:s.ch.map(c=>({...c,ev:parse(c.n),i:0,t:t0}))};timer=setInterval(pump,40);pump()}
  function pump(){if(!cur||!ctx)return;const ahead=ctx.currentTime+.25;
    for(const c of cur.chs){let n=0;while(c.t<ahead&&n++<64){const [f,l]=c.ev[c.i],len=l*cur.sp;
      if(f){if(c.w==='drum'){if(f==='k')tone('sine',120,c.t,.15,.25,cur.g,{slide:40,decay:.02});else if(f==='s')noise(c.t,.12,c.v*2,cur.g,{type:'bandpass',f:1500});else noise(c.t,.03,c.v,cur.g,{type:'highpass',f:6000})}else voice(c,f,c.t,len)}
      c.t+=len;c.i=(c.i+1)%c.ev.length}}}
  function stop(){if(timer)clearInterval(timer);timer=null;if(cur&&ctx){const g=cur.g;try{g.gain.setTargetAtTime(0,ctx.currentTime,.08);setTimeout(()=>g.disconnect(),600)}catch(e){}}cur=null;curName=''}
  return{unlock,play,music,stop,setMusic(o){musicOn=o;if(cur)cur.g.gain.value=o?1:0},setSfx(o){sfxOn=o},get musicOn(){return musicOn},get sfxOn(){return sfxOn}};
})();
