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
    horn(){const t=now();osc('square',415,t,.5,.05);osc('square',523,t,.5,.04);osc('square',415,t+.55,.7,.05);osc('square',523,t+.55,.7,.04)},
    clink(){const t=now();osc('triangle',2200,t,.06,.07,null,{decay:.1});osc('triangle',1700,t+.07,.08,.06,null,{decay:.1});osc('triangle',2500,t+.17,.1,.04,null,{decay:.1})},
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

  /* ---------- music ----------
     The old chip songs (the sea, the seabed, Nethra) still play on the pulse/triangle/noise voices.
     Everything else is a 16-bit style synth: strings, flute, horns, harp, bells, organ and a drum kit,
     with echo and a little reverb, the way SNES soundtracks were mixed. */
  // A channel is a string of tokens "D5:4 F5:2 -:2": lengths in sixteenths (a bare token keeps the last length).
  // Notes can be stacked into chords with + ("A3+C4+E4:16"). A drum channel uses letters: k kick, s snare, h hat,
  // o open hat, c crash, t/T low/high tom, p shaker, m rim, r snare roll ("k+c:4" plays both).
  function parse(str,tr=0,drums=false){const out=[];let len=4;
    for(const tok of str.trim().split(/\s+/)){if(!tok)continue;const [n,l]=tok.split(':');if(l)len=+l;
      if(n==='-'){out.push([0,len]);continue}
      if(drums){out.push([n.split('+'),len]);continue}
      if(n==='x'||n==='k'||n==='s'){out.push([n,len]);continue}
      const fs=n.split('+').map(q=>{let f=freq(q);if(tr)f*=Math.pow(2,tr/12);return f}).filter(Boolean);out.push([fs.length>1?fs:fs[0]||0,len])}
    return out}
  const CH={Dm:['D','F','A'],Bb:['Bb','D','F'],F:['F','A','C'],C:['C','E','G'],Gm:['G','Bb','D'],A:['A','C#','E'],Am:['A','C','E'],
    G:['G','B','D'],E:['E','G#','B'],Em:['E','G','B'],D:['D','F#','A'],Eb:['Eb','G','Bb'],Cm:['C','Eb','G'],Fm:['F','Ab','C'],Ab:['Ab','C','Eb']};
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

  /* --- chord helpers for the new songs: "Am", "C#m", "G7", "Ddim", "Bsus4"; one chord per bar unless written "Am_8" --- */
  const NT=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
  const QUAL={'':[0,4,7],m:[0,3,7],'7':[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11],sus4:[0,5,7],sus2:[0,2,7],dim:[0,3,6]};
  function tonesOf(name,oct){const m=/^([A-G][#b]?)(m7|maj7|m|7|sus4|sus2|dim)?$/.exec(name);const root=noteIdx(m[1]);
    return(QUAL[m[2]||'']).map(i=>{const v=root+i+(oct+1)*12;return NT[v%12]+(Math.floor(v/12)-1)})}
  const up=(n,k=12)=>{const m=/^([A-G][#b]?)(-?\d)$/.exec(n);const v=noteIdx(m[1])+(+m[2]+1)*12+k;return NT[v%12]+(Math.floor(v/12)-1)};
  function bars(prog){return prog.trim().split(/\s+/).map(t=>{const [c,l]=t.split('_');return[c,l?+l:16]})}
  // whole chords held for each bar
  function padOf(prog,oct){return bars(prog).map(([c,l])=>tonesOf(c,oct).slice(0,4).join('+')+':'+l).join(' ')}
  // arpeggios: shape indexes into root, third, fifth, then the same an octave up
  function arpOf(prog,oct,step,shape){let s='';for(const [c,l] of bars(prog)){const t=tonesOf(c,oct).slice(0,3),x=[...t,...t.map(n=>up(n)),up(t[0],24)];
      for(let i=0;i<l/step;i++){const k=shape[i%shape.length];s+=(k<0?'-':x[k])+':'+step+' '}}return s}
  // bass lines: pattern of [tone, length], tone 0 root, 1 fifth, 2 octave, 3 the third, -1 rest
  function bassOf(prog,oct,pat){let s='';for(const [c,l] of bars(prog)){const t=tonesOf(c,oct),x=[t[0],t[2],up(t[0]),t[1]];let acc=0,i=0;
      while(acc<l){const [k,n]=pat[i++%pat.length],ln=Math.min(n,l-acc);s+=(k<0?'-':x[k])+':'+ln+' ';acc+=ln}}return s}
  // offbeat chord stabs: pattern of [length, play?]
  function stabOf(prog,oct,pat){let s='';for(const [c,l] of bars(prog)){const ch=tonesOf(c,oct).slice(0,3).join('+');let acc=0,i=0;
      while(acc<l){const [n,on]=pat[i++%pat.length],ln=Math.min(n,l-acc);s+=(on?ch:'-')+':'+ln+' ';acc+=ln}}return s}
  // drums: one bar repeated, with an optional fill bar every `every` bars and a crash on chosen bars
  function drumsOf(barPat,n,{fill=null,every=8,crash=[]}={}){const out=[];for(let b=0;b<n;b++){let p=(fill&&(b+1)%every===0)?fill:barPat;
      if(crash.includes(b))p=p.replace(/^(\S+?):/,(m,t)=>(t==='-'?'c':t+'+c')+':');out.push(p)}return out.join(' ')}

  const SONGS={
    sea:{bpm:118,ch:[
      {w:'p25',v:.045,vib:1,n:'D5:6 E5:2 F5:4 A5:4 G5:6 F5:2 E5:8 F5:4 D5:4 Bb4:4 D5:4 C5:8 E5:4 G5:4 A5:6 G5:2 F5:4 A5:4 G5:4 E5:4 C5:8 D5:4 F5:4 Bb5:4 A5:4 A5:12 -:4'},
      {w:'p12',v:.022,n:arp('Dm C Bb C Dm C Bb A',4,2,16,[0,1,2,1])},
      {w:'triangle',v:.13,n:bass('Dm C Bb C Dm C Bb A',2,[0,0,2,0,1,0,2,0],2)},
      {w:'noise',v:.03,n:rep('x:4 x:2 x:2',16)}]},
    seabed:{bpm:80,ch:[
      {w:'triangle',v:.09,n:'B5:8 C6:8 A5:8 F5:8 G5:4 A5:4 B5:8 A5:16 E5:8 F5:8 G5:8 E5:8 D5:4 E5:4 F5:8 E5:16'},
      {w:'p12',v:.022,n:arp('Em F Em D Em F Em D',3,2,16,[0,2,1,3])},
      {w:'triangle',v:.07,n:bass('Em F Em D Em F Em D',2,[0],16)}]},
    nethra:{bpm:88,ch:[
      {w:'p25',v:.04,vib:1,n:'D5:4 G5:4 Bb5:4 A5:8 G5:4 G5:4 Eb5:4 C5:4 D5:12 D5:4 G5:4 A5:4 Bb5:6 A5:2 G5:4 Eb5:4 C5:2 D5:2 F#5:4 G5:12'},
      {w:'p12',v:.022,n:arp('Gm Eb Cm D Gm Eb Cm Gm',4,2,12,[0,1,2,3,2,1])},
      {w:'triangle',v:.12,n:bass('Gm Eb Cm D Gm Eb Cm Gm',2,[0,1,1],4,12)}]},
  };
  /* ---- the songs of Strike at Night ---- */
  {
    // TITLE: "The Legend of Lift". A slow, proud horn theme over strings and harp, in D minor.
    const A='Dm Bb F C Dm Bb Gm A',B='Bb C Dm C Gm A Dm A',P=A+' '+B;
    SONGS.title={bpm:80,echo:3,ch:[
      {i:'brass',v:.085,rv:.35,ec:.18,n:'D5:6 E5:2 F5:4 A5:4 G5:6 F5:2 D5:8 C5:4 F5:4 A5:4 C6:4 G5:12 E5:4 F5:6 E5:2 D5:4 A5:4 Bb5:6 A5:2 G5:4 F5:4 G5:4 Bb5:4 A5:4 G5:4 A5:12 C#6:4 '+
        'D6:8 C6:4 Bb5:4 C6:8 Bb5:4 A5:4 A5:6 G5:2 F5:4 A5:4 G5:8 E5:8 Bb5:6 A5:2 G5:4 Bb5:4 A5:6 G5:2 E5:4 C#5:4 D5:16 -:8 A4:4 C#5:4'},
      {i:'strings',v:.032,rv:.45,n:padOf(P,3)},
      {i:'strings',v:.022,rv:.45,n:'-:128 '+'F5:16 G5:16 F5:16 E5:16 D5:16 E5:16 F5:16 E5:16'},
      {i:'harp',v:.05,rv:.35,ec:.25,n:arpOf(P,3,2,[0,1,2,3,4,3,2,1])},
      {i:'bass',v:.11,rv:.1,n:bassOf(P,2,[[0,8],[1,4],[2,4]])},
      {i:'timp',v:.13,rv:.3,n:'D2:4 -:12 -:16 -:16 -:16 D2:4 -:12 -:16 -:16 A1:2 A1:2 A1:4 -:8 Bb1:4 -:12 -:16 -:16 -:16 G1:4 -:12 A1:4 -:12 D2:4 -:12 A1:1 A1:1 A1:1 A1:1 A1:1 A1:1 A1:1 A1:1 A1:8'}]};
    // RAID: Millbrook on the night of the bandits. Tense pizzicato, a snare march and low horns, in C minor.
    const RA='Cm Cm Ab Bb Cm Cm Ab G',RB='Fm Cm Ab Bb Fm Cm Ddim G',R=RA+' '+RB;
    SONGS.raid={bpm:108,echo:3,ch:[
      {i:'brass',v:.07,rv:.3,ec:.15,n:'C5:4 -:2 C5:2 Eb5:4 G5:4 F5:4 Eb5:4 D5:4 C5:4 Eb5:6 F5:2 G5:4 Ab5:4 G5:8 F5:4 D5:4 C5:4 -:2 C5:2 Eb5:4 G5:4 C6:6 Bb5:2 G5:4 Eb5:4 F5:4 Ab5:4 G5:4 F5:4 G5:8 D5:4 B4:4 '+
        'Ab5:6 G5:2 F5:4 C5:4 Eb5:6 D5:2 C5:4 G4:4 Ab4:4 C5:4 Eb5:4 Ab5:4 G5:6 F5:2 D5:8 F5:4 Ab5:4 C6:4 Ab5:4 G5:6 Eb5:2 C5:8 D5:4 F5:4 Ab5:4 F5:4 G5:4 B4:4 D5:4 G5:4'},
      {i:'pizz',v:.07,rv:.2,n:bassOf(R,3,[[0,2],[0,2],[1,2],[0,2],[2,2],[0,2],[1,2],[0,2]])},
      {i:'strings',v:.026,rv:.4,n:padOf(R,3)},
      {i:'bass',v:.1,n:bassOf(R,1,[[0,4],[-1,4],[0,4],[1,4]])},
      {i:'drums',v:.38,rv:.12,n:drumsOf('k:2 -:2 s:1 s:1 s:2 k:2 -:2 s:2 s:1 s:1',16,{fill:'k:2 s:2 r:8 s:2 s:2',every:8,crash:[0,8]})}]};
    // BATTLE: fast and bright, a synth lead over driving bass and rock drums, in A minor.
    const BA='Am F G Em Am F G E',BB='F G Am Am F G E E',BP=BA+' '+BB;
    SONGS.battle={bpm:152,echo:3,intro:32,ch:[
      {i:'lead',v:.065,rv:.2,ec:.2,n:'-:32 A5:3 A5:3 G5:2 A5:4 E5:4 F5:3 F5:3 E5:2 F5:4 C5:4 D5:4 G5:4 B5:4 D6:4 B5:8 G5:4 E5:4 A5:3 A5:3 G5:2 A5:4 C6:4 C6:3 A5:3 F5:2 C6:4 A5:4 B5:4 A5:4 G5:4 D5:4 E5:4 G#5:4 B5:4 E6:4 '+
        'A5:8 C6:8 B5:8 G5:8 C6:6 B5:2 A5:4 E5:4 A5:12 -:4 F5:4 A5:4 C6:4 F6:4 E6:4 D6:4 B5:4 G5:4 G#5:4 B5:4 E6:4 D6:4 B5:8 G#5:4 E5:4'},
      {i:'strings',v:.03,rv:.3,n:'-:32 -:128 '+padOf(BB,4)},
      {i:'brass',v:.03,rv:.15,g:.5,n:'-:32 '+stabOf(BP,4,[[2,0],[2,1]])},
      {i:'sbass',v:.1,n:'A2:2 A2:2 A3:2 A2:2 G2:2 A2:2 C3:2 D3:2 A2:2 A2:2 A3:2 A2:2 G2:2 A2:2 E3:2 G3:2 '+bassOf(BP,2,[[0,2],[2,2]])},
      {i:'drums',v:.46,rv:.1,n:'k:4 s:4 k:4 s:4 k:2 k:2 s:4 k:2 s:2 s:2 s:2 '+drumsOf('k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2',16,{fill:'k:2 s:2 s:1 s:1 s:2 T:2 T:2 t:2 t:2',every:8,crash:[0,8]})}]};
    // BOSS: the Pale Stag and every great foe. Strings and lead in unison, timpani, in E minor.
    const XA='Em C D B Em C Am B',XB='C D Em Em C D B B',XP=XA+' '+XB;
    const XM='E5:6 F#5:2 G5:4 B5:4 C6:6 B5:2 G5:4 E5:4 F#5:6 G5:2 A5:4 D6:4 D#6:8 B5:4 F#5:4 E6:6 D6:2 B5:4 G5:4 C6:6 B5:2 A5:4 G5:4 A5:4 C6:4 E6:4 C6:4 B5:8 F#5:4 D#5:4 '+
      'G5:4 C6:4 E6:8 F#6:4 E6:4 D6:8 B5:4 E6:4 G6:8 F#6:4 E6:4 B5:8 C6:4 E6:4 G6:4 E6:4 D6:4 F#6:4 A6:4 F#6:4 F#6:8 D#6:8 B5:8 -:8';
    SONGS.boss={bpm:138,echo:3,ch:[
      {i:'lead',v:.055,rv:.25,ec:.15,n:XM},
      {i:'strings',v:.04,rv:.35,tr:-12,n:XM},
      {i:'pluck',v:.032,rv:.2,ec:.2,n:arpOf(XP,4,1,[0,1,2,3,2,1,0,1])},
      {i:'sbass',v:.11,n:bassOf(XP,2,[[0,2],[0,2],[2,2],[0,2]])},
      {i:'timp',v:.12,rv:.25,n:bassOf(XP,2,[[0,4],[-1,12]])},
      {i:'drums',v:.46,rv:.1,n:drumsOf('k:2 h:2 s:2 h:2 k:1 k:1 h:2 s:2 h:2',16,{fill:'s:2 s:2 T:2 T:2 t:2 t:2 k+c:4',every:8,crash:[0,8]})}]};
    // FINAL: the Bandit Devil King. A church organ, a dark choir and double kicks, in D minor.
    const FA='Dm Eb Dm A Dm Eb Bb A',FB='Gm A Dm Bb Gm Eb A A',FP=FA+' '+FB;
    SONGS.final={bpm:156,echo:3,ch:[
      {i:'organ',v:.044,rv:.3,ec:.12,n:'D5:4 A5:4 G#5:4 A5:4 Bb5:6 A5:2 G5:4 Eb5:4 F5:4 A5:4 D6:4 C6:4 C#6:8 A5:4 E5:4 D6:4 A5:4 G#5:4 A5:4 G5:6 Bb5:2 Eb6:4 D6:4 D6:4 C6:4 Bb5:4 F5:4 A5:8 C#6:4 E6:4 '+
        'G6:8 F6:4 D6:4 E6:8 C#6:4 A5:4 F6:6 E6:2 D6:4 A5:4 Bb5:12 -:4 G5:4 Bb5:4 D6:4 G6:4 G6:4 F6:4 Eb6:4 Bb5:4 A5:4 C#6:4 E6:4 G6:4 F6:4 E6:4 C#6:4 A5:4'},
      {i:'pad',v:.042,rv:.45,n:padOf(FP,3)},
      {i:'sbass',v:.11,n:bassOf(FP,1,[[0,2],[0,2],[2,2],[0,2]])},
      {i:'timp',v:.13,rv:.25,n:bassOf(FP,1,[[0,4],[-1,4],[0,2],[0,2],[-1,4]])},
      {i:'drums',v:.48,rv:.1,n:drumsOf('k:1 k:1 h:2 s:2 h:2 k:1 k:1 k:2 s:2 h:2',16,{fill:'k:1 k:1 k:1 k:1 s:2 s:2 T:2 t:2 s+c:4',every:4,crash:[0,4,8,12]})}]};
    // VICTORY: a short horn fanfare, then a bright loop, in C major.
    SONGS.victory={bpm:132,echo:3,intro:32,ch:[
      {i:'brass',v:.08,rv:.3,ec:.2,n:'G4:2 C5:2 E5:2 G5:6 E5:2 G5:2 C6:16 A5:4 G5:4 F5:4 A5:4 G5:8 D5:8 E5:4 G5:4 B5:4 G5:4 A5:12 -:4 F5:4 A5:4 C6:4 A5:4 B5:4 D6:4 G5:4 B5:4 C6:16 -:16'},
      {i:'strings',v:.03,rv:.4,n:'C4+E4+G4:16 C4+E4+G4:16 '+padOf('F G Em Am F G C C',3)},
      {i:'glock',v:.035,rv:.4,ec:.3,n:'-:32 '+arpOf('F G Em Am F G C C',5,2,[0,2,1,2])},
      {i:'bass',v:.1,n:'C3:2 E3:2 G3:2 C3:10 C3:16 '+bassOf('F G Em Am F G C C',2,[[0,4],[1,4]])},
      {i:'drums',v:.3,rv:.1,n:'k:2 k:2 k:2 s:6 s:2 s:2 c:16 '+drumsOf('k:4 h:4 s:4 h:4',8,{crash:[0]})}]};
    // SAD: Lift on one knee. A lonely flute over harp and strings, in D minor.
    const SP='Dm Bb F C Gm Dm Bb A';
    SONGS.sad={bpm:66,echo:3,ch:[
      {i:'flute',v:.07,rv:.45,ec:.25,n:'A5:8 G5:4 F5:4 F5:6 E5:2 D5:8 C5:8 F5:4 G5:4 E5:12 -:4 D5:8 G5:4 A5:4 A5:6 G5:2 F5:8 D5:4 F5:4 E5:4 D5:4 C#5:12 -:4'},
      {i:'harp',v:.05,rv:.4,ec:.2,n:arpOf(SP,3,2,[0,1,2,4,3,2,1,2])},
      {i:'strings',v:.032,rv:.5,n:padOf(SP,3)},
      {i:'bass',v:.08,rv:.1,n:bassOf(SP,2,[[0,16]])}]};
    // ENDING: the white light. Bells and strings, in E major.
    const EP='E C#m A B E G#m A B';
    SONGS.ending={bpm:72,echo:3,ch:[
      {i:'bell',v:.06,rv:.5,ec:.3,n:'B5:4 G#5:4 E5:4 G#5:4 C#6:8 B5:4 G#5:4 A5:4 C#6:4 E6:4 C#6:4 B5:12 -:4 E6:4 D#6:4 B5:4 G#5:4 B5:6 A5:2 G#5:8 F#5:4 A5:4 C#6:4 E6:4 D#6:8 B5:8'},
      {i:'flute',v:.03,rv:.5,tr:-12,n:'B5:4 G#5:4 E5:4 G#5:4 C#6:8 B5:4 G#5:4 A5:4 C#6:4 E6:4 C#6:4 B5:12 -:4 E6:4 D#6:4 B5:4 G#5:4 B5:6 A5:2 G#5:8 F#5:4 A5:4 C#6:4 E6:4 D#6:8 B5:8'},
      {i:'glock',v:.028,rv:.5,ec:.3,n:arpOf(EP,5,2,[0,1,2,1])},
      {i:'strings',v:.035,rv:.55,n:padOf(EP,3)},
      {i:'bass',v:.07,rv:.1,n:bassOf(EP,2,[[0,8],[1,8]])}]};
    // PALE: the Pale Wood. A breathy flute, a harp running up and down, bells in the trees, in E minor.
    const PA='Em D C D Em D C B',PB='Am C G D Am C B B',PP=PA+' '+PB;
    SONGS.pale={bpm:92,echo:3,ch:[
      {i:'flute',v:.068,rv:.4,ec:.28,n:'E5:4 F#5:2 G5:2 B5:8 A5:4 F#5:4 D5:8 E5:4 G5:4 C6:4 B5:4 A5:12 -:4 G5:4 F#5:2 E5:2 B5:8 D6:4 C#6:2 A5:2 F#5:8 E5:4 G5:4 B5:4 E6:4 D#6:12 -:4 '+
        'C6:6 B5:2 A5:8 G5:4 E5:4 C5:8 B5:4 D6:4 G6:4 D6:4 F#6:8 E6:4 D6:4 E6:6 D6:2 C6:4 A5:4 G5:6 A5:2 E5:8 F#5:4 A5:4 D#6:4 F#6:4 D#6:8 B5:8'},
      {i:'harp',v:.048,rv:.35,ec:.2,n:arpOf(PP,3,2,[0,1,2,3,4,3,2,1])},
      {i:'glock',v:.024,rv:.5,ec:.35,n:arpOf(PP,5,4,[-1,-1,2,-1,-1,1,-1,-1])},
      {i:'pad',v:.03,rv:.5,n:padOf(PP,3)},
      {i:'bass',v:.08,rv:.1,n:bassOf(PP,2,[[0,8],[1,8]])},
      {i:'drums',v:.22,rv:.2,n:drumsOf('k:4 p:2 p:2 m:4 p:2 p:2',16)}]};
    // TOWN: Fernhollow. A cheerful folk tune with a plucked strum and a boom-chuck bass, in G major.
    const TA='G C D G Em C D D',TB='C G Am D C G D G',TP=TA+' '+TB;
    SONGS.town={bpm:112,echo:3,ch:[
      {i:'flute',v:.068,rv:.3,ec:.2,n:'D5:4 G5:4 B5:4 A5:2 G5:2 E5:4 G5:4 C6:6 B5:2 A5:4 F#5:4 D5:4 F#5:4 G5:12 -:4 B5:4 G5:2 E5:2 B5:4 C6:4 C6:4 A5:2 E5:2 G5:8 F#5:4 A5:4 D6:4 C6:4 A5:8 -:4 D5:4 '+
        'E5:4 E5:2 G5:2 C6:4 B5:4 B5:4 A5:2 G5:2 D5:8 C5:4 E5:4 A5:4 G5:4 F#5:8 A5:8 E5:2 G5:2 C6:4 B5:4 A5:4 G5:4 B5:4 D6:8 C6:4 B5:4 A5:4 F#5:4 G5:12 D5:4'},
      {i:'pluck',v:.04,rv:.2,ec:.15,n:stabOf(TP,4,[[4,0],[2,1],[2,1]])},
      {i:'bass',v:.1,rv:.1,n:bassOf(TP,2,[[0,4],[1,4]])},
      {i:'strings',v:.02,rv:.4,n:'-:128 '+padOf(TB,4)},
      {i:'drums',v:.26,rv:.12,n:drumsOf('k+h:2 h:2 m+h:2 h:2 k+h:2 h:2 m+h:2 h:2',16,{fill:'k+h:2 h:2 m+h:2 h:2 k:2 m:2 m:2 m:2',every:8})}]};
    // ROAD: the old mill road. A bright travelling tune with a shuffle beat, in D major.
    const OA='D A Bm G D A G A',OB='G A F#m Bm G A D D',OP=OA+' '+OB;
    SONGS.road={bpm:116,echo:3,ch:[
      {i:'lead',v:.058,rv:.25,ec:.22,n:'D5:4 F#5:4 A5:6 G5:2 F#5:4 E5:4 C#5:4 A4:4 B4:4 D5:4 F#5:6 E5:2 D5:12 -:4 A5:4 F#5:2 A5:2 B5:4 A5:4 E5:6 F#5:2 G5:4 A5:4 B5:4 A5:4 G5:4 F#5:4 E5:12 -:4 '+
        'B5:8 A5:4 G5:4 A5:8 C#6:4 E6:4 C#6:6 B5:2 A5:4 F#5:4 B5:8 D6:4 F#6:4 E6:4 D6:4 B5:4 G5:4 A5:4 C#6:4 E6:4 A5:4 D6:16 -:12 A5:4'},
      {i:'pluck',v:.036,rv:.2,ec:.15,n:stabOf(OP,4,[[2,1],[2,0],[2,1],[2,1],[2,0],[2,1],[2,1],[2,0]])},
      {i:'strings',v:.022,rv:.4,n:'-:128 '+padOf(OB,4)},
      {i:'bass',v:.1,rv:.1,n:bassOf(OP,2,[[0,4],[1,2],[0,2],[2,4],[1,4]])},
      {i:'drums',v:.3,rv:.12,n:drumsOf('k:3 h:1 h:2 s:2 k:2 h:1 k:1 s:2 h:2',16,{fill:'k:2 s:2 s:2 s:1 s:1 T:2 T:2 t:2 t:2',every:8,crash:[0,8]})}]};
    // LAKE: Lake Merrow and the Lakestone. Still water, a low flute, bells under the surface, in A minor.
    const LA='Am Em F C Am Em Dm E',LB='F G Em Am F G E E',LP=LA+' '+LB;
    SONGS.lake={bpm:72,echo:3,ch:[
      {i:'flute',v:.064,rv:.5,ec:.3,n:'E5:8 A5:8 G5:6 E5:2 B4:8 C5:4 F5:4 A5:8 G5:12 -:4 E5:4 C5:4 A4:8 B4:4 E5:4 G5:8 F5:6 E5:2 D5:8 E5:16 '+
        'A5:8 C6:8 B5:6 A5:2 G5:8 G5:8 E5:8 A5:6 G5:2 E5:8 F5:4 A5:4 C6:8 B5:4 D6:4 G5:8 G#5:8 B5:8 E5:16'},
      {i:'glock',v:.026,rv:.55,ec:.35,n:arpOf(LP,4,2,[0,2,4,2,1,3,5,3])},
      {i:'pad',v:.032,rv:.55,n:padOf(LP,3)},
      {i:'bass',v:.075,rv:.15,n:bassOf(LP,2,[[0,12],[1,4]])}]};
    // HOME: Millbrook on an ordinary afternoon. A music box, a flute and a slow harp, in F major.
    const HA='F C Dm Bb F C Bb C',HB='Dm Am Bb F Gm C F F',HP=HA+' '+HB;
    SONGS.home={bpm:92,echo:3,ch:[
      {i:'flute',v:.06,rv:.35,ec:.22,n:'A5:4 C6:4 A5:4 F5:4 G5:6 E5:2 C5:8 D5:4 F5:4 A5:4 D6:4 C6:12 -:4 A5:4 G5:4 F5:4 A5:4 G5:6 F5:2 E5:8 D5:4 F5:4 Bb5:4 A5:4 G5:12 -:4 '+
        'F5:6 E5:2 D5:4 A5:4 E5:8 C5:8 D5:4 F5:4 Bb5:4 D6:4 C6:8 A5:8 Bb5:6 A5:2 G5:4 D5:4 E5:4 G5:4 C6:4 Bb5:4 A5:16 -:12 C5:4'},
      {i:'glock',v:.028,rv:.4,ec:.25,n:arpOf(HP,5,2,[0,2,1,2,4,2,1,2])},
      {i:'harp',v:.04,rv:.35,n:arpOf(HP,3,4,[0,2,3,1])},
      {i:'strings',v:.02,rv:.45,n:'-:128 '+padOf(HB,3)},
      {i:'bass',v:.07,rv:.1,n:bassOf(HP,2,[[0,8],[1,8]])},
      {i:'drums',v:.14,rv:.2,n:drumsOf('k:4 p:4 m:4 p:4',16)}]};
    SONGS.dungeon=SONGS.raid;
    // CITY: October 2026, a little before midnight. A sleepy electric piano over a soft beat, in A minor.
    const CY='Fmaj7 Em7 Dm7 Cmaj7 Fmaj7 Em7 Am7 G';
    SONGS.city={bpm:76,echo:3,ch:[
      {i:'bell',v:.042,rv:.45,ec:.3,n:'A5:6 G5:2 E5:8 G5:4 E5:4 D5:8 F5:6 E5:2 C5:8 E5:4 D5:4 B4:8 A5:6 G5:2 E5:8 G5:4 A5:4 C6:8 B5:6 A5:2 E5:8 -:8 D5:8'},
      {i:'harp',v:.034,rv:.4,ec:.2,n:arpOf(CY,3,2,[0,-1,2,-1,1,-1,3,-1])},
      {i:'pad',v:.03,rv:.5,n:padOf(CY,3)},
      {i:'bass',v:.085,rv:.1,n:bassOf(CY,2,[[0,6],[1,2],[0,4],[2,4]])},
      {i:'drums',v:.2,rv:.15,n:drumsOf('k:3 h:1 p:2 h:2 s:4 h:2 k:2',8)}]};
    // CAMP: the Crows around the fire. A plucked strum, a flute and a frame drum, in A minor.
    const CA='Am G Am Em F G Am Am',CB='C G Am Em F G E E',CP2=CA+' '+CB;
    SONGS.camp={bpm:104,echo:3,ch:[
      {i:'flute',v:.064,rv:.35,ec:.22,n:'E5:4 A5:4 A5:2 B5:2 C6:4 B5:4 A5:2 G5:2 D5:8 E5:4 A5:4 C6:4 B5:2 A5:2 B5:8 G5:4 E5:4 F5:4 A5:4 C6:6 A5:2 B5:4 D6:4 B5:4 G5:4 A5:6 G5:2 E5:4 C5:4 A4:8 -:4 E5:4 '+
        'G5:4 C6:4 E6:4 C6:4 D6:6 C6:2 B5:8 C6:4 B5:2 A5:2 E5:4 A5:4 G5:8 B5:8 A5:4 C6:4 F6:4 C6:4 B5:4 D6:4 G6:4 D6:4 E6:6 D6:2 B5:4 G#5:4 E5:12 -:4'},
      {i:'pluck',v:.04,rv:.2,ec:.15,n:stabOf(CP2,4,[[2,1],[2,0],[2,1],[2,1]])},
      {i:'bass',v:.09,rv:.1,n:bassOf(CP2,2,[[0,4],[1,4],[0,4],[2,4]])},
      {i:'strings',v:.018,rv:.45,n:'-:128 '+padOf(CB,3)},
      {i:'drums',v:.24,rv:.15,n:drumsOf('k:4 m:2 m:2 k:2 m:2 p:4',16,{fill:'k:2 m:2 k:2 m:2 k:2 m:1 m:1 m:2 m:2',every:8})}]};
  }

  /* --- the synth voices --- */
  let fxRev=null,fxEcho=null,fxEchoFb=null;
  function makeFx(c,out){const n=Math.round(c.sampleRate*1.5),b=c.createBuffer(2,n,c.sampleRate);
    for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3.2)}
    const rev=c.createConvolver();rev.buffer=b;const rg=c.createGain();rg.gain.value=.55;rev.connect(rg);rg.connect(out);
    const ec=c.createDelay(1.2);ec.delayTime.value=.3;const fb=c.createGain();fb.gain.value=.33;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=2400;
    const eg=c.createGain();eg.gain.value=.5;ec.connect(f);f.connect(fb);fb.connect(ec);f.connect(eg);eg.connect(out);
    return{rev,echo:ec}}
  function O(type,f,t,det=0){const o=ctx.createOscillator();if(type==='p12')o.setPeriodicWave(pulses[.125]);else if(type==='p25')o.setPeriodicWave(pulses[.25]);else o.type=type;
    o.frequency.setValueAtTime(f,t);if(det)o.detune.setValueAtTime(det,t);return o}
  function G(v=1){const g=ctx.createGain();g.gain.value=v;return g}
  function LP(f,q=.7,type='lowpass'){const b=ctx.createBiquadFilter();b.type=type;b.frequency.value=f;b.Q.value=q;return b}
  // attack, decay time, sustain level, release: returns when the voice can stop
  function ADSR(g,t,len,v,a,d,s,r){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);if(s<1)g.gain.setTargetAtTime(v*s,t+a,d);
    const e=t+Math.max(a+.01,len);g.gain.setTargetAtTime(0,e,r/3);return e+r*1.6+.05}
  function PERC(g,t,v,dec,a=.004){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+dec);return t+a+dec+.05}
  function VIB(oscs,t,end,cents=9,rate=5.2,delay=.22){if(end-t<delay+.12)return;const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=rate;
    lg.gain.setValueAtTime(0,t);lg.gain.setValueAtTime(0,t+delay);lg.gain.linearRampToValueAtTime(cents,t+delay+.3);l.connect(lg);for(const o of oscs)lg.connect(o.detune);l.start(t);l.stop(end)}
  const run=(os,t,end)=>{for(const o of os){o.start(t);o.stop(end)}};
  const VOICE={
    lead(f,t,len,v,out){const g=G(),fl=LP(2400,1.2);fl.frequency.setValueAtTime(4800,t);fl.frequency.setTargetAtTime(2200,t,.1);
      const a=O('sawtooth',f,t,-7),b=O('p25',f,t,7),bg=G(.6);a.connect(fl);b.connect(bg);bg.connect(fl);fl.connect(g);g.connect(out);
      const e=ADSR(g,t,len,v,.012,.25,.78,.14);VIB([a,b],t,e,10);run([a,b],t,e)},
    brass(f,t,len,v,out){const g=G(),fl=LP(700,2);fl.frequency.setValueAtTime(500,t);fl.frequency.linearRampToValueAtTime(3000,t+.07);fl.frequency.setTargetAtTime(1500,t+.07,.18);
      const a=O('sawtooth',f,t,-5),b=O('sawtooth',f,t,6);a.connect(fl);b.connect(fl);fl.connect(g);g.connect(out);
      const e=ADSR(g,t,len,v,.035,.3,.82,.16);VIB([a,b],t,e,7,5);run([a,b],t,e)},
    flute(f,t,len,v,out){const g=G(),fl=LP(3800,.5);const a=O('triangle',f,t),b=O('sine',f*2,t),bg=G(.18);a.connect(fl);b.connect(bg);bg.connect(fl);fl.connect(g);g.connect(out);
      const e=ADSR(g,t,len,v,.045,.4,.88,.18);VIB([a,b],t,e,13,5,.25);run([a,b],t,e);
      const n=ctx.createBufferSource(),nf=LP(f*2.2,2,'bandpass'),ng=G();n.buffer=noiseBuf;n.connect(nf);nf.connect(ng);ng.connect(out);PERC(ng,t,v*.5,.09,.01);n.start(t,Math.random()*.5);n.stop(t+.15)},
    strings(f,t,len,v,out){const g=G(),fl=LP(1900,.6);const os=[-9,9].map(d=>O('sawtooth',f,t,d));for(const o of os)o.connect(fl);fl.connect(g);g.connect(out);
      const e=ADSR(g,t,len,v,.16,.5,.9,.45);VIB(os,t,e,6,5.5,.3);run(os,t,e)},
    pad(f,t,len,v,out){const g=G(),fl=LP(1300,.5);const os=[O('triangle',f,t,-9),O('sawtooth',f,t,9)];os[0].connect(fl);os[1].connect(G(.35)).connect(fl);
      fl.connect(g);g.connect(out);const e=ADSR(g,t,len,v,.35,.6,.9,.7);VIB(os,t,e,5,4.5,.4);run(os,t,e)},
    organ(f,t,len,v,out){const g=G(),fl=LP(3400,.5);const os=[[1,1],[2,.5],[3,.3],[.5,.4]].map(([m,a])=>{const o=O('sine',f*m,t);o.connect(G(a)).connect(fl);return o});
      fl.connect(g);g.connect(out);const e=ADSR(g,t,len,v,.01,.2,.95,.09);VIB(os,t,e,8,6.2,.05);run(os,t,e)},
    harp(f,t,len,v,out){const g=G(),fl=LP(3200,.5);const a=O('triangle',f,t),b=O('sine',f*2,t),bg=G(.22);a.connect(fl);b.connect(bg);bg.connect(fl);fl.connect(g);g.connect(out);
      const e=PERC(g,t,v,Math.min(1.6,len*1.6+.35));run([a,b],t,e)},
    pluck(f,t,len,v,out){const g=G(),fl=LP(3000,2);fl.frequency.setValueAtTime(3400,t);fl.frequency.exponentialRampToValueAtTime(500,t+.25);
      const a=O('sawtooth',f,t);a.connect(fl);fl.connect(g);g.connect(out);const e=PERC(g,t,v*1.2,Math.min(.45,len+.15));run([a],t,e)},
    pizz(f,t,len,v,out){const g=G(),fl=LP(1400,1);const a=O('sawtooth',f,t),b=O('triangle',f,t,4);a.connect(fl);b.connect(fl);fl.connect(g);g.connect(out);const e=PERC(g,t,v,.22);run([a,b],t,e)},
    bell(f,t,len,v,out){const g=G();const c=O('sine',f,t),m=O('sine',f*3.5,t),mg=G();mg.gain.setValueAtTime(f*2.2,t);mg.gain.exponentialRampToValueAtTime(f*.05,t+.9);
      m.connect(mg);mg.connect(c.frequency);const h=O('sine',f*2,t),hg=G(.12);h.connect(hg);hg.connect(g);c.connect(g);g.connect(out);const e=PERC(g,t,v,1.9);run([c,m,h],t,e)},
    glock(f,t,len,v,out){const g=G();const a=O('sine',f,t),b=O('sine',f*2.76,t),bg=G(.18);a.connect(g);b.connect(bg);bg.connect(g);g.connect(out);const e=PERC(g,t,v,.8,.002);run([a,b],t,e)},
    bass(f,t,len,v,out){const g=G(),fl=LP(900,.8);const a=O('triangle',f,t),b=O('p25',f,t),bg=G(.22);a.connect(fl);b.connect(bg);bg.connect(fl);fl.connect(g);g.connect(out);
      const e=ADSR(g,t,len,v,.006,.25,.72,.06);run([a,b],t,e)},
    sbass(f,t,len,v,out){const g=G(),fl=LP(1800,3);fl.frequency.setValueAtTime(2200,t);fl.frequency.exponentialRampToValueAtTime(420,t+.12);
      const a=O('sawtooth',f,t),b=O('square',f/2,t),bg=G(.5);a.connect(fl);b.connect(bg);bg.connect(fl);fl.connect(g);g.connect(out);const e=ADSR(g,t,len,v,.004,.12,.55,.04);run([a,b],t,e)},
    timp(f,t,len,v,out){const g=G(),fl=LP(600,1);const a=O('sine',f,t),b=O('triangle',f,t);a.frequency.exponentialRampToValueAtTime(f*.96,t+.4);a.connect(fl);b.connect(G(.4)).connect(fl);fl.connect(g);g.connect(out);
      const e=PERC(g,t,v,1.1,.006);run([a,b],t,e);NZ(t,.08,v*.5,out,'lowpass',500)},
  };
  function NZ(t,len,v,out,type,f,q=.7,f2){const s=ctx.createBufferSource(),fl=LP(f,q,type),g=G();s.buffer=noiseBuf;if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+len);
    s.connect(fl);fl.connect(g);g.connect(out);PERC(g,t,v,len,.002);s.start(t,Math.random()*.5);s.stop(t+len+.06)}
  const DRUM={
    k(t,v,out){const o=O('sine',130,t),g=G();o.frequency.exponentialRampToValueAtTime(42,t+.11);o.connect(g);g.connect(out);run([o],t,PERC(g,t,v,.3,.002));NZ(t,.012,v*.35,out,'highpass',3000)},
    s(t,v,out){NZ(t,.17,v*.6,out,'bandpass',2100,.6);const o=O('triangle',230,t),g=G();o.frequency.exponentialRampToValueAtTime(160,t+.07);o.connect(g);g.connect(out);run([o],t,PERC(g,t,v*.45,.08))},
    h(t,v,out){NZ(t,.035,v*.28,out,'highpass',7800)},
    o(t,v,out){NZ(t,.22,v*.24,out,'highpass',6800)},
    c(t,v,out){NZ(t,1.5,v*.36,out,'highpass',4200);NZ(t,.9,v*.14,out,'bandpass',9000,.8)},
    t(t,v,out){const o=O('sine',150,t),g=G();o.frequency.exponentialRampToValueAtTime(90,t+.25);o.connect(g);g.connect(out);run([o],t,PERC(g,t,v*.8,.3))},
    T(t,v,out){const o=O('sine',220,t),g=G();o.frequency.exponentialRampToValueAtTime(140,t+.22);o.connect(g);g.connect(out);run([o],t,PERC(g,t,v*.75,.26))},
    p(t,v,out){NZ(t,.055,v*.22,out,'bandpass',7200,1.6)},
    m(t,v,out){NZ(t,.03,v*.4,out,'bandpass',3400,4);const o=O('triangle',1100,t),g=G();o.connect(g);g.connect(out);run([o],t,PERC(g,t,v*.18,.03,.001))},
  };
  let cur=null,curName='',timer=null;
  function playMusic(name){
    pending=name;if(!gestured&&!ctx)return;if(name===curName)return;stopMusic();curName=name;if(!name||!SONGS[name]||!ctx||ctx.state!=='running')return;
    cur=startSong(name,ctx.currentTime+.08,musicBus);timer=setInterval(pump,30);pump()}
  function startSong(name,t0,dest){const s=SONGS[name],sp=60/s.bpm/4;
    const g=ctx.createGain();g.gain.value=musicOn?1:0;g.connect(dest);
    if(!fxRev||fxRev.ctx!==ctx){const fx=makeFx(ctx,dest);fxRev=fx.rev;fxEcho=fx.echo;fxRev.ctx=ctx}
    try{fxEcho.delayTime.setValueAtTime(sp*(s.echo||3),t0)}catch(e){}
    const song={g,sp,intro:s.intro||0,name,chs:s.ch.map(c=>{const ch={...c,ins:c.i,ev:parse(c.n,(s.tr||0)+(c.tr||0),c.i==='drums'),i:0,t:t0};
      if(c.i){ch.out=ctx.createGain();ch.out.connect(g);if(c.rv){const r=G(c.rv);ch.out.connect(r);r.connect(fxRev);ch.sends=[r]}if(c.ec){const e2=G(c.ec);ch.out.connect(e2);e2.connect(fxEcho);(ch.sends=ch.sends||[]).push(e2)}}
      return ch})};
    // channels with an intro loop back to the point after it
    for(const c of song.chs){let acc=0;c.loopAt=0;if(song.intro){for(let i=0;i<c.ev.length;i++){if(acc>=song.intro){c.loopAt=i;break}acc+=c.ev[i][1]}}}
    return song}
  function schedule(song,until){
    // after the page stalls (a slow frame, Safari pausing timers), notes that are already late are skipped
    // rather than all played at once, which would make a loud burst and a pile of audio nodes
    const late=song.offline?-1:ctx.currentTime-.04;
    for(const c of song.chs){let guard=0;
      if(c.t<late-2){const span=c.ev.reduce((a,e)=>a+e[1],0)*song.sp;if(span>0&&!song.intro){c.t+=Math.floor((late-c.t)/span)*span}}
      while(c.t<until&&guard++<(song.offline?1e6:400)){const [f,l]=c.ev[c.i];const len=l*song.sp;
        if(f&&c.t>=late){try{
          if(c.ins==='drums'){for(const d of f){if(d==='r'){const n=Math.max(2,Math.round(l*2));for(let k=0;k<n;k++)DRUM.s(c.t+k*len/n,c.v*(.35+.65*k/n),c.out)}else if(DRUM[d])DRUM[d](c.t,c.v,c.out)}}
          else if(c.ins){const fs=Array.isArray(f)?f:[f];for(const q of fs)VOICE[c.ins](q,c.t,len*(c.g||.96),c.v,c.out)}
          else if(c.w==='noise'){if(f==='k')osc('triangle',150,c.t,.12,.22,song.g,{slide:45});else if(f==='s')noise(c.t,.12,c.v*2.2,song.g,{type:'bandpass',f:1800,q:.8});else noise(c.t,.04,c.v,song.g,{f:7000})}
          else osc(c.w,f,c.t,len*.92,c.v,song.g,{vib:c.vib&&len>.25,r:.05})}catch(e){if(window.__AUDBG)window.__AUDBG.push(String(e))}}
        c.t+=len;c.i++;if(c.i>=c.ev.length)c.i=c.loopAt||0}}}
  function pump(){if(!cur||!ctx)return;schedule(cur,ctx.currentTime+.25)}
  function stopMusic(){if(timer)clearInterval(timer);timer=null;if(cur&&ctx){const g=cur.g,chs=cur.chs;try{g.gain.setTargetAtTime(0,ctx.currentTime,.05);setTimeout(()=>{g.disconnect();for(const c of chs){if(c.sends)for(const x of c.sends)x.disconnect()}},400)}catch(e){}}cur=null;curName=''}
  // Safari: when the page is hidden, rest the audio; it comes back on the next touch if Safari wants one
  try{document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden){try{ctx.suspend()}catch(e){}}else if(gestured){ctx.resume().catch(()=>{})}})}catch(e){}
  function setMusic(on){musicOn=on;if(cur&&ctx)cur.g.gain.value=on?1:0}
  function setSfx(on){sfxOn=on}
  // for testing: how long each channel of a song is, in sixteenths, and an offline render of a song
  function info(name){const s=SONGS[name];return s.ch.map(c=>parse(c.n,0,c.i==='drums').reduce((a,e)=>a+e[1],0))}
  async function render(name,sec){const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;const oc=new OAC(2,44100*sec,44100);
    const keep={ctx,musicBus,noiseBuf,pulses,fxRev,fxEcho,musicOn};ctx=oc;musicOn=true;if(!noiseBuf){noiseBuf=oc.createBuffer(1,oc.sampleRate,oc.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
    pulses={};for(const duty of [.125,.25,.5]){const n=32,re=new Float32Array(n),im=new Float32Array(n);for(let k=1;k<n;k++){im[k]=2/(k*Math.PI)*Math.sin(k*Math.PI*duty)}pulses[duty]=oc.createPeriodicWave(re,im)}
    musicBus=oc.createGain();musicBus.gain.value=.55;const mg=oc.createGain();mg.gain.value=.9;musicBus.connect(mg);mg.connect(oc.destination);fxRev=null;
    const song=startSong(name,0.05,musicBus);song.offline=1;schedule(song,sec);const buf=await oc.startRendering();Object.assign({},keep);ctx=keep.ctx;musicBus=keep.musicBus;noiseBuf=keep.noiseBuf;pulses=keep.pulses;fxRev=keep.fxRev;fxEcho=keep.fxEcho;musicOn=keep.musicOn;return buf}
  return {unlock,play,music:playMusic,stop:stopMusic,setMusic,setSfx,info,render,songs:SONGS,get current(){return curName},get musicOn(){return musicOn},get sfxOn(){return sfxOn}};
})();
