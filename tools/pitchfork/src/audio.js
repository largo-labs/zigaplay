/* ---------- sound: small synthesized effects and three looping tunes ---------- */
const AU=(()=>{
  let ctx=null,master=null,sfxG=null,musG=null,song=null,step=0,nextT=0,timer=null,muted=false;
  try{muted=localStorage.getItem('pitchfork-mute')==='1'}catch(e){}
  function ensure(){
    if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
      try{ctx=new AC()}catch(e){return null}
      master=ctx.createGain();master.gain.value=muted?0:.55;master.connect(ctx.destination);
      sfxG=ctx.createGain();sfxG.gain.value=.9;sfxG.connect(master);musG=ctx.createGain();musG.gain.value=.32;musG.connect(master)}
    if(ctx.state!=='running')ctx.resume().catch(()=>{});return ctx}
  const ok=()=>ctx&&ctx.state==='running';
  function tone(f,dur,{type='square',vol=.2,at=0,slide=0,dest=null,attack=.004}={}){if(!ok())return;
    const t=ctx.currentTime+at,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+attack);g.gain.exponentialRampToValueAtTime(.0004,t+dur);
    o.connect(g);g.connect(dest||sfxG);o.start(t);o.stop(t+dur+.03)}
  let nbuf=null;
  function noise(dur,{vol=.2,at=0,freq=1200,type='lowpass',dest=null,q=1}={}){if(!ok())return;
    if(!nbuf){nbuf=ctx.createBuffer(1,ctx.sampleRate*.6|0,ctx.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
    const t=ctx.currentTime+at,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=nbuf;f.type=type;f.frequency.value=freq;f.Q.value=q;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0004,t+dur);s.connect(f);f.connect(g);g.connect(dest||sfxG);s.start(t);s.stop(t+dur+.02)}
  // rate-limit each effect so a big brawl doesn't turn into a wall of noise
  const last={};const lim=(k,ms)=>{const n=performance.now();if(last[k]&&n-last[k]<ms)return false;last[k]=n;return true};
  const S={
    tick(){tone(1320,.03,{vol:.06})},
    pick(){tone(880,.05,{vol:.09});tone(1320,.08,{vol:.08,at:.05})},
    buy(){tone(660,.05,{vol:.08,type:'triangle'});tone(990,.05,{vol:.08,type:'triangle',at:.05});tone(1320,.09,{vol:.08,type:'triangle',at:.1})},
    no(){tone(140,.14,{type:'sawtooth',vol:.07})},
    swing(){if(lim('sw',40))noise(.07,{vol:.13,freq:2600,type:'highpass'})},
    hit(){if(lim('hit',35)){noise(.06,{vol:.22,freq:900});tone(160,.07,{vol:.09,slide:-80})}},
    clang(){if(lim('cl',45)){tone(1900,.09,{vol:.05,type:'square'});tone(2650,.12,{vol:.04,type:'triangle'});noise(.05,{vol:.12,freq:4000,type:'highpass'})}},
    shoot(){if(lim('sh',60))noise(.05,{vol:.07,freq:1800,type:'bandpass',q:3})},
    die(){if(lim('die',60)){tone(300,.25,{type:'sawtooth',vol:.06,slide:-200})}},
    hurt(){tone(220,.12,{type:'square',vol:.12,slide:-120});noise(.08,{vol:.2,freq:700})},
    roll(){noise(.12,{vol:.1,freq:500})},
    trap(){tone(90,.18,{type:'square',vol:.18,slide:-40});noise(.15,{vol:.3,freq:600})},
    crash(){noise(.4,{vol:.4,freq:300});tone(70,.3,{type:'triangle',vol:.3,slide:-30})},
    fire(){if(lim('fi',120))noise(.35,{vol:.16,freq:900,type:'bandpass',q:.7})},
    buzz(){for(let i=0;i<6;i++)tone(180+Math.random()*60,.12,{type:'sawtooth',vol:.04,at:i*.07})},
    horn(){tone(196,.5,{type:'sawtooth',vol:.09,attack:.06});tone(294,.7,{type:'sawtooth',vol:.08,at:.4,attack:.06});tone(392,.9,{type:'sawtooth',vol:.07,at:.85,attack:.08})},
    shout(){tone(330,.09,{type:'sawtooth',vol:.08,slide:120});tone(440,.14,{type:'sawtooth',vol:.07,at:.08,slide:60})},
    win(){[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.22,{type:'square',vol:.08,at:i*.13}))},
    lose(){[392,349,311,262].forEach((f,i)=>tone(f,.35,{type:'triangle',vol:.12,at:i*.25}))},
    alert(){if(lim('al',300)){tone(990,.06,{vol:.06});tone(990,.06,{vol:.06,at:.09})}},
    coin(){tone(1568,.05,{vol:.06});tone(2093,.12,{vol:.05,at:.05})},
    gate(){if(lim('ga',80)){tone(80,.12,{type:'square',vol:.14});noise(.1,{vol:.22,freq:400})}},
  };
  // songs: steps of 8th notes; each voice is an array of midi numbers (or 0 for rest)
  const SONGS={
    title:{bpm:84,len:32,v:[
      {type:'triangle',vol:.16,dur:1.8,n:[62,0,0,0,65,0,0,0,64,0,0,0,60,0,0,0,62,0,0,0,69,0,0,0,67,0,65,0,64,0,0,0]},
      {type:'square',vol:.035,dur:.9,n:[74,0,72,0,77,0,76,74,72,0,69,0,72,0,74,0,74,0,77,0,81,0,79,77,76,0,74,72,74,0,0,0]},
      {type:'triangle',vol:.2,dur:3.5,n:[38,0,0,0,0,0,0,0,36,0,0,0,0,0,0,0,38,0,0,0,0,0,0,0,33,0,0,0,0,0,0,0]}]},
    camp:{bpm:100,len:32,v:[
      {type:'triangle',vol:.13,dur:.5,n:[62,65,69,65,62,65,69,72,60,64,67,64,60,64,67,71,58,62,65,62,58,62,65,69,57,61,64,61,57,64,69,64]},
      {type:'square',vol:.03,dur:.7,n:[74,0,0,76,77,0,76,74,72,0,0,74,76,0,74,72,70,0,72,74,72,0,70,69,69,0,0,0,73,0,0,0]},
      {type:'triangle',vol:.2,dur:1.6,n:[38,0,0,0,38,0,0,0,36,0,0,0,36,0,0,0,34,0,0,0,34,0,0,0,33,0,0,0,33,0,0,0]}]},
    battle:{bpm:152,len:32,drums:true,v:[
      {type:'square',vol:.045,dur:.25,n:[74,0,72,74,69,0,67,69,65,67,69,0,62,0,0,0,74,0,76,77,76,74,72,0,69,72,74,0,74,0,0,0]},
      {type:'triangle',vol:.22,dur:.3,n:[38,0,50,0,38,0,50,0,36,0,48,0,36,0,48,0,41,0,53,0,41,0,53,0,36,0,48,0,38,0,50,0]}],
      kick:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,1]},
    boss:{bpm:164,len:32,drums:true,v:[
      {type:'sawtooth',vol:.03,dur:.22,n:[62,63,62,0,69,0,68,69,70,0,69,0,65,0,63,0,62,63,62,0,69,0,70,72,74,0,72,70,69,0,0,0]},
      {type:'triangle',vol:.24,dur:.25,n:[38,38,0,38,38,0,38,0,39,39,0,39,39,0,39,0,38,38,0,38,38,0,38,0,34,34,0,34,36,0,37,0]}],
      kick:[1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,1,0,1,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0]},
  };
  const mf=m=>440*Math.pow(2,(m-69)/12);
  function sched(){if(!ok()||!song){return}
    const sp=60/song.bpm/2;
    while(nextT<ctx.currentTime+.25){const at=nextT-ctx.currentTime;
      for(const v of song.v){const m=v.n[step%song.len];if(m)tone(mf(m),sp*v.dur*2,{type:v.type,vol:v.vol,at:Math.max(0,at),dest:musG,attack:.01})}
      if(song.drums){if(song.kick[step%song.len])tone(110,.16,{type:'sine',vol:.5,at:Math.max(0,at),slide:-70,dest:musG});
        if(song.snare[step%song.len])noise(.11,{vol:.22,at:Math.max(0,at),freq:2400,type:'bandpass',dest:musG});
        if(step%2)noise(.03,{vol:.05,at:Math.max(0,at),freq:7000,type:'highpass',dest:musG})}
      nextT+=sp;step++}}
  return{
    unlock:ensure,
    sfx(k){if(!muted&&S[k]){try{S[k]()}catch(e){}}},
    play(name){ensure();const s=SONGS[name]||null;if(s===song)return;song=s;step=0;if(ctx)nextT=ctx.currentTime+.05;
      if(!timer)timer=setInterval(()=>{try{sched()}catch(e){}},60)},
    stop(){song=null},
    get muted(){return muted},
    toggleMute(){muted=!muted;try{localStorage.setItem('pitchfork-mute',muted?'1':'0')}catch(e){}if(master)master.gain.value=muted?0:.55;return muted},
  };
})();
