/* ================= sound: a little chip synth, original tunes and effects ================= */
const SND=(()=>{let ac=null,out=null,mus=null,sfxG=null,cur=null,timer=0,next=0,step=0,on=true,musicOn=true;
  const ensure=()=>{if(ac)return true;const C=(ZP&&ZP.AudioContext)||window.AudioContext||window.webkitAudioContext;if(!C)return false;
    try{ac=new C();out=ac.createGain();out.gain.value=.55;out.connect(ac.destination);mus=ac.createGain();mus.gain.value=.5;mus.connect(out);sfxG=ac.createGain();sfxG.gain.value=.8;sfxG.connect(out)}catch(e){ac=null;return false}return true};
  const live=()=>ac&&ac.state==='running';
  const mf=m=>440*Math.pow(2,(m-69)/12);
  /* effects pass a delay from now, music an exact time; anything already past is taken as a delay */
  const at=t=>t<ac.currentTime?ac.currentTime+t:t;
  function tone(f,t,len,type,vol,dest,slide,att=.005){t=at(t);const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+len);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+len);o.connect(g);g.connect(dest);o.start(t);o.stop(t+len+.05)}
  let nb=null;const noiseBuf=()=>{if(nb)return nb;nb=ac.createBuffer(1,ac.sampleRate*.5|0,ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return nb};
  function noise(t,len,vol,f,dest,type='highpass'){t=at(t);const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf();fl.type=type;fl.frequency.value=f;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+len);s.connect(fl);fl.connect(g);g.connect(dest);s.start(t);s.stop(t+len+.05)}
  /* ---- tunes: notes as text, 8th notes, '-' holds, '.' rests ---- */
  const N=s=>s.trim().split(/\s+/).map(x=>{if(x==='.')return 0;if(x==='-')return -1;const m=/^([A-G])(#|b)?(\d)$/.exec(x);if(!m)return 0;return 12*(+m[3]+1)+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)});
  const TUNES={
    title:{bpm:84,lead:N(`D5 - - A4 - - F5 - E5 - D5 - C5 - A4 - Bb4 - - F5 - - D5 - C5 - Bb4 - A4 - - - D5 - - A4 - - F5 - G5 - A5 - G5 - E5 - F5 - - E5 - - D5 - C#5 - - - D5 - - -`),
      bass:N(`D3 - A3 - D3 - A3 - D3 - A3 - D3 - A3 - Bb2 - F3 - Bb2 - F3 - Bb2 - F3 - Bb2 - F3 - D3 - A3 - D3 - A3 - C3 - G3 - C3 - G3 - Bb2 - F3 - A2 - E3 - D3 - A3 - D3 - - -`),pad:'tri',drums:''},
    town:{bpm:112,lead:N(`F5 - A5 - C6 - A5 - G5 - - F5 E5 - G5 - F5 - - - . . A4 C5 D5 - F5 - E5 - D5 - C5 - - - D5 E5 F5 - A5 - G5 - F5 - E5 - D5 - - - C5 D5 E5 - G5 - F5 - - - . - . .`),
      bass:N(`F3 . C4 . F3 . C4 . C3 . G3 . C3 . G3 . Bb2 . F3 . Bb2 . F3 . C3 . G3 . C3 . G3 . D3 . A3 . D3 . A3 . Bb2 . F3 . Bb2 . F3 . C3 . G3 . C3 . E3 . F3 . C4 . F3 . - .`),drums:'k.h.s.h.k.h.s.h.'},
    field:{bpm:128,lead:N(`G4 - B4 - D5 - - E5 D5 - B4 - G4 - A4 - B4 - - - D5 - G5 - F#5 - E5 - D5 - - - C5 - E5 - G5 - - A5 G5 - E5 - C5 - D5 - E5 - - - D5 - - C5 B4 - A4 - G4 - - - . . . .`),
      bass:N(`G2 . G3 . D3 . G3 . G2 . G3 . D3 . G3 . E2 . E3 . B2 . E3 . D2 . D3 . A2 . D3 . C2 . C3 . G2 . C3 . A2 . A3 . E3 . A3 . D2 . D3 . A2 . D3 . G2 . D3 . G2 . - .`),drums:'k.h.s.hkk.h.s.h.'},
    cave:{bpm:96,lead:N(`E5 - - . B4 - - . C5 - B4 - A4 - - - G4 - - . A4 - B4 - E4 - - - - - . . E5 - - . G5 - - . F#5 - E5 - D#5 - - - E5 - - . B4 - C5 - B4 - - - - - . .`),
      bass:N(`E2 - - - E2 - - - A2 - - - A2 - - - C3 - - - D3 - - - E2 - - - B2 - - - E2 - - - E2 - - - B2 - - - B2 - - - C3 - - - A2 - - - E2 - - - - - - -`),drums:'k.......s.......'},
    battle:{bpm:156,lead:N(`A4 . A4 C5 E5 . D5 C5 B4 . G4 B4 E5 - - . A4 . A4 C5 E5 . G5 F5 E5 . D5 E5 C5 - - . F5 . F5 E5 D5 . C5 D5 E5 . E5 D5 C5 . B4 . A4 . C5 B4 A4 . G#4 . A4 - - - E4 - - .`),
      bass:N(`A2 A2 A3 A2 A2 A2 A3 A2 G2 G2 G3 G2 E2 E2 E3 E2 A2 A2 A3 A2 A2 A2 A3 A2 G2 G2 G3 G2 C3 C3 C4 C3 F2 F2 F3 F2 F2 F2 F3 F2 C3 C3 C4 C3 G2 G2 G3 G2 F2 F2 F3 F2 E2 E2 E3 E2 A2 A2 A3 A2 E2 E2 E3 E2`),drums:'k.hsk.hskkhsk.hs'},
    boss:{bpm:164,lead:N(`E5 . E5 . G5 . E5 . F#5 - D5 - B4 - - . E5 . E5 . G5 . B5 . A5 - F#5 - D5 - - . C5 . C5 . E5 . G5 . F#5 . E5 . D#5 - B4 . E5 - - - B5 - A5 - G5 - F#5 - E5 - - - - . . .`),
      bass:N(`E2 E3 E2 E3 E2 E3 E2 E3 D2 D3 D2 D3 B1 B2 B1 B2 E2 E3 E2 E3 E2 E3 E2 E3 D2 D3 D2 D3 B1 B2 B1 B2 C2 C3 C2 C3 C2 C3 C2 C3 B1 B2 B1 B2 B1 B2 B1 B2 E2 E3 E2 E3 G2 G3 G2 G3 A2 A3 A2 A3 B2 B3 B2 B3`),drums:'kkhskkhskkhskshs'},
    grey:{bpm:72,lead:N(`B4 - - - D5 - - - C#5 - B4 - A4 - - - F#4 - - - A4 - - - B4 - - - - - - - G4 - - - B4 - - - A4 - F#4 - E4 - - - F#4 - - - - - - - . . . . . . . .`),
      bass:N(`B2 - - - - - - - F#2 - - - - - - - G2 - - - - - - - D2 - - - - - - - E2 - - - - - - - F#2 - - - - - - - B2 - - - - - - - - - - - - - - -`),drums:''},
    final:{bpm:150,lead:N(`B4 . D5 . F#5 - E5 D5 C#5 . A4 . C#5 - - . B4 . D5 . F#5 - A5 G5 F#5 . E5 . C#5 - - . G5 . F#5 . E5 . D5 . C#5 . D5 . E5 - - . F#5 - - - E5 - D5 - C#5 - B4 - A#4 - - .`),
      bass:N(`B1 B2 B1 B2 B1 B2 B1 B2 A1 A2 A1 A2 F#1 F#2 F#1 F#2 B1 B2 B1 B2 B1 B2 B1 B2 A1 A2 A1 A2 F#1 F#2 F#1 F#2 G1 G2 G1 G2 E1 E2 E1 E2 F#1 F#2 F#1 F#2 F#1 F#2 F#1 F#2 G1 G2 G1 G2 A1 A2 A1 A2 F#1 F#2 F#1 F#2 F#1 F#2 F#1 F#2`),drums:'k.hsk.hsk.hskkhs'},
    victory:{bpm:150,once:1,lead:N(`C5 . E5 . G5 . C6 - - - A5 . B5 . C6 - - - - - - - - -`),bass:N(`C3 . . . E3 . . . F3 - - - G3 - - - C3 - - - - - - - - -`),drums:''},
    ending:{bpm:96,lead:N(`C5 - E5 - G5 - - - F5 - E5 - D5 - - - E5 - G5 - C6 - - - B5 - A5 - G5 - - - A5 - - G5 F5 - E5 - D5 - - - G5 - - - E5 - - - C5 - - - - - - -`),
      bass:N(`C3 - G3 - C3 - G3 - F2 - C3 - F2 - C3 - A2 - E3 - A2 - E3 - G2 - D3 - G2 - D3 - F2 - C3 - F2 - C3 - G2 - D3 - G2 - B2 - C3 - G3 - C3 - - - - - - -`),drums:''},
  };
  function schedule(){if(!live()||!cur||!musicOn)return;const T=TUNES[cur],sp=60/T.bpm/2,len=T.lead.length;
    while(next<ac.currentTime+.4){const i=step%len;
      if(T.once&&step>=len){cur=null;return}
      const n=T.lead[i];if(n>0){let d=1;while(T.lead[(i+d)%len]===-1&&d<16)d++;tone(mf(n),next,sp*d*.95,'square',.045,mus);tone(mf(n)*1.005,next,sp*d*.9,'square',.018,mus)}
      const b=T.bass[i%T.bass.length];if(b>0){let d=1;while(T.bass[(i+d)%T.bass.length]===-1&&d<16)d++;tone(mf(b),next,sp*d*.9,'triangle',.11,mus)}
      const dr=T.drums;if(dr){const c=dr[i%dr.length];if(c==='k')tone(140,next,.12,'sine',.25,mus,48);else if(c==='s')noise(next,.09,.08,1800,mus);else if(c==='h')noise(next,.03,.03,7000,mus)}
      next+=sp;step++}}
  function play(name){if(cur===name)return;cur=name;step=0;if(ac)next=ac.currentTime+.08}
  const FX={
    cur:()=>tone(1320,0,.03,'square',.03,sfxG),ok:()=>{tone(880,0,.05,'square',.04,sfxG);tone(1320,.05,.07,'square',.04,sfxG)},no:()=>tone(160,0,.12,'sawtooth',.05,sfxG),back:()=>tone(660,0,.06,'square',.035,sfxG,440),
    slash:()=>{noise(0,.12,.18,2600,sfxG);tone(900,0,.1,'sawtooth',.03,sfxG,300)},heavy:()=>{noise(0,.22,.25,600,sfxG,'lowpass');tone(120,0,.25,'square',.08,sfxG,50)},hit:()=>{noise(0,.08,.2,1200,sfxG);tone(220,0,.08,'square',.05,sfxG,110)},
    crit:()=>{noise(0,.15,.25,1800,sfxG);tone(1600,0,.12,'square',.05,sfxG,400);tone(200,0,.2,'square',.07,sfxG,60)},miss:()=>tone(1200,0,.12,'sine',.04,sfxG,2200),
    arrow:()=>{noise(0,.1,.1,4000,sfxG);tone(1800,0,.1,'sine',.03,sfxG,600)},punch:()=>{noise(0,.06,.22,900,sfxG,'lowpass');tone(180,0,.07,'square',.06,sfxG,90)},
    fire:()=>{noise(0,.5,.16,500,sfxG,'lowpass');tone(160,0,.4,'sawtooth',.04,sfxG,80)},ice:()=>{for(let i=0;i<5;i++)tone(2000+i*400,i*.05,.12,'sine',.03,sfxG)},bolt:()=>{noise(0,.3,.22,3000,sfxG);tone(80,0,.3,'square',.06,sfxG,40)},
    holy:()=>{[0,4,7,12].forEach((n,i)=>tone(mf(84+n),i*.06,.4,'sine',.04,sfxG))},shadow:()=>{tone(110,0,.5,'sawtooth',.05,sfxG,55);noise(0,.4,.08,300,sfxG,'lowpass')},
    heal:()=>{[0,4,7,11,14].forEach((n,i)=>tone(mf(76+n),i*.05,.3,'triangle',.05,sfxG))},buff:()=>{[0,5,9].forEach((n,i)=>tone(mf(72+n),i*.07,.2,'square',.035,sfxG))},debuff:()=>{[9,5,0].forEach((n,i)=>tone(mf(60+n),i*.07,.2,'square',.035,sfxG))},
    limit:()=>{for(let i=0;i<8;i++)tone(mf(60+i*3),i*.04,.2,'square',.04,sfxG)},cast:()=>{for(let i=0;i<4;i++)tone(mf(72+i*4),i*.05,.15,'triangle',.04,sfxG)},
    swirl:()=>{for(let i=0;i<10;i++)tone(400+i*120,i*.04,.1,'square',.03,sfxG)},chest:()=>{[0,4,7,12].forEach((n,i)=>tone(mf(72+n),i*.08,.25,'square',.04,sfxG))},
    level:()=>{[0,4,7,12,7,12].forEach((n,i)=>tone(mf(72+n),i*.09,.2,'square',.045,sfxG))},buy:()=>{tone(1568,0,.06,'square',.04,sfxG);tone(2093,.06,.12,'square',.04,sfxG)},
    ko:()=>{tone(400,0,.5,'square',.05,sfxG,80)},die:()=>{noise(0,.6,.15,800,sfxG,'lowpass');tone(300,0,.6,'sawtooth',.04,sfxG,60)},run:()=>{for(let i=0;i<4;i++)noise(i*.06,.05,.08,2000,sfxG)},
    step:()=>noise(0,.03,.02,1200,sfxG),door:()=>{tone(300,0,.1,'square',.04,sfxG,200);noise(.05,.1,.05,800,sfxG)},save:()=>{[0,7,12,16].forEach((n,i)=>tone(mf(79+n),i*.1,.3,'sine',.04,sfxG))},
    type:()=>tone(1800,0,.02,'square',.015,sfxG),
  };
  return{
    unlock(){if(!ensure())return;if(ac.state==='suspended')ac.resume().catch(()=>{});if(!timer)timer=setInterval(schedule,100)},
    play(n){play(n)},stop(){cur=null},
    fx(n){if(!live()||!on||!FX[n])return;try{FX[n]()}catch(e){}},
    get on(){return on},set on(v){on=v;if(out)out.gain.value=v?.55:0},
    get music(){return musicOn},set music(v){musicOn=v;if(mus)mus.gain.value=v?.5:0},
    pause(p){if(!ac)return;try{(p?ac.suspend():ac.resume()).catch(()=>{})}catch(e){}},
  }})();
