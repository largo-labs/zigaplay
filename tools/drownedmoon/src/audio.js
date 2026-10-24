/* ===================== AUDIO: chip sound effects and a small music sequencer ===================== */
const AU=(()=>{
  const ZP=(()=>{try{return window.parent&&window.parent!==window&&window.parent.ZIGAPLAY||null}catch(e){return null}})();
  const AC=(ZP&&ZP.AudioContext)||window.AudioContext||window.webkitAudioContext;
  let ctx=null,master=null,musicBus=null,sfxBus=null,noiseBuf=null,pulses={};
  let musicOn=true,sfxOn=true,pending='',gestured=false;
  function init(){
    if(ctx||!AC)return;
    try{ctx=new AC()}catch(e){return}
    master=ctx.createGain();master.gain.value=.9;master.connect(ctx.destination);
    musicBus=ctx.createGain();musicBus.gain.value=.55;musicBus.connect(master);
    sfxBus=ctx.createGain();sfxBus.gain.value=.8;sfxBus.connect(master);
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
    const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    for(const duty of [.125,.25,.5]){const n=32,re=new Float32Array(n),im=new Float32Array(n);
      for(let k=1;k<n;k++){im[k]=2/(k*Math.PI)*Math.sin(k*Math.PI*duty)}
      pulses[duty]=ctx.createPeriodicWave(re,im)}
  }
  function unlock(){gestured=true;init();if(ctx&&ctx.state!=='running')ctx.resume().then(()=>{if(pending&&!cur){const n=pending;curName='';playMusic(n)}}).catch(()=>{})}
  const NOTE={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  function freq(n){const m=/^([A-G])([#b]?)(-?\d)$/.exec(n);if(!m)return 0;
    let s=NOTE[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+(+m[3]+1)*12;return 440*Math.pow(2,(s-69)/12)}
  function osc(type,f,t,len,vol,bus,opt={}){
    if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();
    if(type==='p12')o.setPeriodicWave(pulses[.125]);else if(type==='p25')o.setPeriodicWave(pulses[.25]);else o.type=type;
    o.frequency.setValueAtTime(f,t);
    if(opt.slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,opt.slide),t+len);
    if(opt.vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=5.5;lg.gain.value=f*.012;l.connect(lg);lg.connect(o.frequency);l.start(t+Math.min(.12,len*.5));l.stop(t+len+.05)}
    const a=opt.a||.006,r=Math.min(opt.r||.06,len*.6);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+a);
    if(opt.decay)g.gain.exponentialRampToValueAtTime(Math.max(.0004,vol*opt.decay),t+len);
    else{g.gain.setValueAtTime(vol,t+Math.max(a,len-r))}
    g.gain.linearRampToValueAtTime(0,t+len);
    o.connect(g);g.connect(bus||sfxBus);o.start(t);o.stop(t+len+.02);
  }
  function noise(t,len,vol,bus,opt={}){
    if(!ctx)return;const s=ctx.createBufferSource(),g=ctx.createGain(),f=ctx.createBiquadFilter();
    s.buffer=noiseBuf;f.type=opt.type||'highpass';f.frequency.setValueAtTime(opt.f||3000,t);
    if(opt.f2)f.frequency.exponentialRampToValueAtTime(opt.f2,t+len);f.Q.value=opt.q||.7;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0005,t+len);
    s.connect(f);f.connect(g);g.connect(bus||sfxBus);s.start(t,Math.random()*.5);s.stop(t+len+.02);
  }
  /* ---------- sound effects ---------- */
  const SFX={
    tick(){osc('p25',1320,now(),.035,.05)},
    ok(){const t=now();osc('p25',988,t,.05,.05);osc('p25',1480,t+.05,.08,.05)},
    back(){const t=now();osc('p25',740,t,.05,.05);osc('p25',494,t+.05,.07,.05)},
    buzz(){osc('sawtooth',110,now(),.14,.05)},
    talk(){osc('p12',660+Math.random()*80,now(),.025,.025)},
    door(){const t=now();noise(t,.12,.12,null,{type:'lowpass',f:900});osc('triangle',140,t,.12,.15,null,{slide:80})},
    hit(){const t=now();noise(t,.12,.25,null,{type:'bandpass',f:1800,f2:400,q:1});osc('square',180,t,.08,.06,null,{slide:60})},
    crit(){const t=now();noise(t,.2,.3,null,{type:'bandpass',f:2600,f2:300,q:1});osc('square',320,t,.15,.07,null,{slide:50})},
    miss(){osc('triangle',600,now(),.12,.06,null,{slide:1200})},
    water(){const t=now();noise(t,.5,.22,null,{type:'bandpass',f:400,f2:2400,q:2});osc('sine',300,t,.4,.08,null,{slide:900})},
    moon(){const t=now();[1568,2093,2637,3136,2637].forEach((f,i)=>osc('p12',f,t+i*.05,.18,.035,null,{decay:.05}))},
    heal(){const t=now();[523,659,784,1047,1319].forEach((f,i)=>osc('triangle',f,t+i*.06,.2,.08,null,{decay:.1}))},
    tide(){const t=now();noise(t,.9,.2,null,{type:'lowpass',f:300,f2:3500,q:3});noise(t+.35,.8,.12,null,{type:'lowpass',f:3500,f2:200,q:2})},
    swirl(){const t=now();for(let i=0;i<10;i++)osc('p25',300+i*90,t+i*.035,.06,.05);noise(t,.6,.12,null,{type:'bandpass',f:500,f2:4000,q:2})},
    chest(){const t=now();[784,988,1175,1568].forEach((f,i)=>osc('p25',f,t+i*.07,.14,.05))},
    level(){const t=now();[523,659,784,1047,784,1047,1319].forEach((f,i)=>osc('p25',f,t+i*.08,.12,.05))},
    die(){const t=now();osc('square',400,t,.5,.06,null,{slide:60});noise(t,.5,.1,null,{type:'lowpass',f:2000,f2:100})},
    boom(){const t=now();noise(t,.7,.35,null,{type:'lowpass',f:1200,f2:60});osc('triangle',90,t,.5,.25,null,{slide:30})},
    flee(){const t=now();for(let i=0;i<5;i++)noise(t+i*.06,.05,.1,null,{f:5000})},
    buy(){const t=now();osc('p25',1568,t,.05,.05);osc('p25',2093,t+.06,.12,.05)},
    bell(){const t=now();[523,1047,1568,2093].forEach((f,i)=>osc('sine',f*1.002,t,2.2-i*.3,.1/(i+1),null,{decay:.01}))},
    step(){noise(now(),.04,.05,null,{type:'lowpass',f:600})},
    poison(){const t=now();osc('sawtooth',220,t,.2,.04,null,{slide:110})},
    sleep(){const t=now();osc('sine',880,t,.25,.06,null,{slide:440});osc('sine',660,t+.2,.3,.05,null,{slide:330})},
  };
  function now(){return ctx?ctx.currentTime+.005:0}
  function play(name){if(!sfxOn)return;unlock();if(ctx&&ctx.state==='running'&&SFX[name])try{SFX[name]()}catch(e){}}

  /* ---------- music ---------- */
  // A channel is a string of notes "D5:4 F5:2 -:2", lengths in sixteenths (a bare note keeps the last length).
  function parse(str,tr=0){const out=[];let len=4;
    for(const tok of str.trim().split(/\s+/)){if(!tok)continue;const [n,l]=tok.split(':');if(l)len=+l;
      if(n==='-')out.push([0,len]);else if(n==='x'||n==='k'||n==='s')out.push([n,len]);
      else{let f=freq(n);if(tr)f*=Math.pow(2,tr/12);out.push([f,len])}}
    return out}
  const CH={Dm:['D','F','A'],Bb:['Bb','D','F'],F:['F','A','C'],C:['C','E','G'],Gm:['G','Bb','D'],A:['A','C#','E'],Am:['A','C','E'],
    G:['G','B','D'],E:['E','G#','B'],Em:['E','G','B'],D:['D','F#','A'],Eb:['Eb','G','Bb'],Cm:['C','Eb','G'],Fm:['F','Ab','C'],Ab:['Ab','C','Eb']};
  // An arpeggio: each chord fills `bar` sixteenths, stepping `step` at a time up and down its tones.
  function arp(chords,o=4,step=2,bar=16,shape=[0,1,2,3,2,1]){let s='';
    for(const c of chords.split(' ')){const t=CH[c];const tones=[t[0]+o,t[1]+(noteIdx(t[1])<noteIdx(t[0])?o+1:o),t[2]+(noteIdx(t[2])<noteIdx(t[0])?o+1:o),t[0]+(o+1)];
      for(let i=0;i<bar/step;i++)s+=tones[shape[i%shape.length]]+':'+step+' '}
    return s}
  function noteIdx(n){return NOTE[n[0]]+(n[1]==='#'?1:n[1]==='b'?-1:0)}
  function bass(chords,o=2,pat=[0,0,1,0],step=4,bar=16){let s='';
    for(const c of chords.split(' ')){const t=CH[c];const tones=[t[0]+o,t[2]+(noteIdx(t[2])<noteIdx(t[0])?o+1:o),t[0]+(o+1)];
      for(let i=0;i<bar/step;i++)s+=tones[pat[i%pat.length]]+':'+step+' '}
    return s}
  const rep=(s,n)=>Array(n).fill(s).join(' ');
  const SONGS={
    title:{bpm:76,ch:[
      {w:'p25',v:.05,vib:1,n:'A4:4 D5:4 E5:4 F5:4 F5:6 E5:2 D5:8 C5:4 F5:4 G5:4 A5:4 G5:12 -:4 A5:4 F5:4 D5:4 F5:4 E5:6 D5:2 Bb4:8 D5:4 C5:4 Bb4:4 G4:4 A4:12 -:4'},
      {w:'p12',v:.028,n:arp('Dm Bb F C Dm Bb Gm A',4,2,16,[0,1,2,3,2,1,0,1])},
      {w:'triangle',v:.12,n:bass('Dm Bb F C Dm Bb Gm A',2,[0,1],8)}]},
    town:{bpm:100,ch:[
      {w:'p25',v:.045,vib:1,n:'C5:4 A4:2 C5:2 F5:4 E5:4 D5:4 C5:4 G4:8 A4:4 D5:2 E5:2 F5:4 A5:4 G5:8 F5:4 D5:4 C5:4 A4:2 C5:2 F5:4 G5:4 A5:4 G5:4 E5:8 F5:4 D5:4 E5:4 G5:4 F5:12 -:4'},
      {w:'p12',v:.025,n:arp('F C Dm Bb F C Bb F',4,4,16,[1,2,3,2])},
      {w:'triangle',v:.12,n:bass('F C Dm Bb F C Bb F',3,[0,1,0,1],4)}]},
    sea:{bpm:118,ch:[
      {w:'p25',v:.045,vib:1,n:'D5:6 E5:2 F5:4 A5:4 G5:6 F5:2 E5:8 F5:4 D5:4 Bb4:4 D5:4 C5:8 E5:4 G5:4 A5:6 G5:2 F5:4 A5:4 G5:4 E5:4 C5:8 D5:4 F5:4 Bb5:4 A5:4 A5:12 -:4'},
      {w:'p12',v:.022,n:arp('Dm C Bb C Dm C Bb A',4,2,16,[0,1,2,1])},
      {w:'triangle',v:.13,n:bass('Dm C Bb C Dm C Bb A',2,[0,0,2,0,1,0,2,0],2)},
      {w:'noise',v:.03,n:rep('x:4 x:2 x:2',16)}]},
    seabed:{bpm:80,ch:[
      {w:'triangle',v:.09,n:'B5:8 C6:8 A5:8 F5:8 G5:4 A5:4 B5:8 A5:16 E5:8 F5:8 G5:8 E5:8 D5:4 E5:4 F5:8 E5:16'},
      {w:'p12',v:.022,n:arp('Em F Em D Em F Em D',3,2,16,[0,2,1,3])},
      {w:'triangle',v:.07,n:bass('Em F Em D Em F Em D',2,[0],16)}]},
    dungeon:{bpm:92,ch:[
      {w:'p25',v:.04,vib:1,n:'E5:4 -:4 C5:4 B4:4 A4:8 -:8 C5:4 D5:4 E5:4 F5:4 E5:8 G#4:8 A4:4 C5:4 E5:4 A5:4 G5:8 F5:8 E5:4 D5:4 C5:4 D5:4 E5:16'},
      {w:'triangle',v:.13,n:bass('Am Am F E Am Am F E',2,[0,-1,0,1].map(x=>x<0?0:x),4)},
      {w:'noise',v:.02,n:rep('x:8 x:8',16)}]},
    nethra:{bpm:88,ch:[
      {w:'p25',v:.04,vib:1,n:'D5:4 G5:4 Bb5:4 A5:8 G5:4 G5:4 Eb5:4 C5:4 D5:12 D5:4 G5:4 A5:4 Bb5:6 A5:2 G5:4 Eb5:4 C5:2 D5:2 F#5:4 G5:12'},
      {w:'p12',v:.022,n:arp('Gm Eb Cm D Gm Eb Cm Gm',4,2,12,[0,1,2,3,2,1])},
      {w:'triangle',v:.12,n:bass('Gm Eb Cm D Gm Eb Cm Gm',2,[0,1,1],4,12)}]},
    battle:{bpm:150,ch:[
      {w:'p25',v:.045,n:'E5:3 E5:1 E5:2 D5:2 E5:4 A4:4 F5:3 F5:1 F5:2 E5:2 F5:4 C5:4 G5:4 F5:2 E5:2 D5:4 B4:4 E5:6 G#5:2 B5:8 A5:4 G5:2 E5:2 C5:4 E5:4 F5:4 A5:4 C6:4 A5:4 B5:4 A5:2 G5:2 D5:4 G5:4 G#5:8 E5:8'},
      {w:'p12',v:.024,n:arp('Am F G E Am F G E',4,1,16,[0,1,2,3])},
      {w:'triangle',v:.14,n:bass('Am F G E Am F G E',2,[0,2],2)},
      {w:'noise',v:.05,n:rep('k:4 x:2 x:2 s:4 x:2 x:2',8)}]},
    boss:{bpm:162,ch:[
      {w:'p25',v:.045,n:'D5:2 D5:2 F5:2 D5:2 G#5:4 A5:4 D6:4 C6:2 A5:2 G#5:4 F5:4 F5:2 F5:2 Bb5:2 F5:2 D6:4 Bb5:4 A5:4 C#6:4 E6:4 A5:4 D6:3 C6:1 A5:4 F5:4 D5:4 E5:4 F5:4 G#5:4 A5:4 Bb5:4 A5:2 G5:2 F5:4 D5:4 C#5:8 A4:8'},
      {w:'p12',v:.024,n:arp('Dm Dm Bb A Dm Dm Bb A',4,1,16,[0,1,2,1])},
      {w:'triangle',v:.15,n:bass('Dm Dm Bb A Dm Dm Bb A',2,[0,0,2,0],2)},
      {w:'noise',v:.055,n:rep('k:2 x:2 s:2 x:2 k:2 k:2 s:2 x:2',8)}]},
    final:{bpm:172,tr:-2,from:'boss'},
    victory:{bpm:132,ch:[
      {w:'p25',v:.05,n:'G4:2 C5:2 E5:2 G5:6 E5:2 G5:2 C6:16 E5:4 G5:4 A5:8 G5:4 E5:4 C5:8 D5:4 E5:4 F5:4 A5:4 G5:16'},
      {w:'p12',v:.025,n:'-:32 '+arp('C F C G',4,2,16,[0,1,2,3])},
      {w:'triangle',v:.12,n:'C3:2 E3:2 G3:2 C4:6 G3:4 C3:16 '+bass('C F C G',2,[0,1],8)}],intro:32},
    sad:{bpm:60,tr:-5,from:'title'},
    ending:{bpm:84,tr:3,from:'title'},
  };
  for(const k in SONGS){const s=SONGS[k];if(s.from){const b=SONGS[s.from];s.ch=b.ch.map(c=>({...c}));s.intro=b.intro}}
  let cur=null,curName='',timer=null;
  function playMusic(name){
    pending=name;if(!gestured&&!ctx)return;if(name===curName)return;stopMusic();curName=name;if(!name||!SONGS[name]||!ctx||ctx.state!=='running')return;
    const s=SONGS[name],sp=60/s.bpm/4,t0=ctx.currentTime+.08;
    const g=ctx.createGain();g.gain.value=musicOn?1:0;g.connect(musicBus);
    cur={g,chs:s.ch.map(c=>({...c,ev:parse(c.n,s.tr||0),i:0,t:t0})),sp,intro:s.intro||0,name};
    // channels with an intro loop back to the point after it
    for(const c of cur.chs){let acc=0;c.loopAt=0;if(cur.intro){for(let i=0;i<c.ev.length;i++){if(acc>=cur.intro){c.loopAt=i;break}acc+=c.ev[i][1]}}}
    timer=setInterval(pump,30);pump();
  }
  function pump(){if(!cur||!ctx)return;const ahead=ctx.currentTime+.2;
    for(const c of cur.chs){let guard=0;
      while(c.t<ahead&&guard++<64){const [f,l]=c.ev[c.i];const len=l*cur.sp;
        if(f){if(c.w==='noise'){if(f==='k')osc('triangle',150,c.t,.12,.22,cur.g,{slide:45});else if(f==='s')noise(c.t,.12,c.v*2.2,cur.g,{type:'bandpass',f:1800,q:.8});else noise(c.t,.04,c.v,cur.g,{f:7000})}
          else osc(c.w,f,c.t,len*.92,c.v,cur.g,{vib:c.vib&&len>.25,r:.05})}
        c.t+=len;c.i++;if(c.i>=c.ev.length)c.i=c.loopAt||0}}}
  function stopMusic(){if(timer)clearInterval(timer);timer=null;if(cur&&ctx){const g=cur.g;try{g.gain.setTargetAtTime(0,ctx.currentTime,.05);setTimeout(()=>g.disconnect(),400)}catch(e){}}cur=null;curName=''}
  function setMusic(on){musicOn=on;if(cur&&ctx)cur.g.gain.value=on?1:0}
  function setSfx(on){sfxOn=on}
  return {unlock,play,music:playMusic,stop:stopMusic,setMusic,setSfx,get current(){return curName},get musicOn(){return musicOn},get sfxOn(){return sfxOn}};
})();
