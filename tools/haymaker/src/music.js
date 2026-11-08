/* ================= the soundtrack =================
   A small synth band: kick, snare, hats, a filtered bass, warm pads, a plucked arpeggio and a lead with vibrato and
   echo. Each song is a key, a tempo, a chord progression and drum and bass patterns; its melody is a short motif
   written over the chords from the song's seed. Every ring has its own fight song; the menus and story are softer. */
const SONGS={
  title:{bpm:100,root:50,prog:[0,5,3,4],k:'x.......x.x.....',s:'....x.......x...',h:'..x...x...x...x.',bass:'0...0.0.5...0...',arp:'A',lead:.7,seed:4,soft:1},
  story:{bpm:84,root:53,prog:[0,3,5,4],k:'x.......x.......',s:'........x.......',h:'..x...x...x...x.',bass:'0.......5...0...',arp:'A',lead:.45,seed:9,soft:1},
  corner:{bpm:90,root:57,prog:[0,5,2,6],k:'x.......x.......',s:'........x.......',h:'..x...x...x...x.',bass:'0...0...5...0...',arp:'A',lead:.4,seed:51,soft:1},
  gym:{bpm:112,root:45,prog:[0,6,5,6],k:'x..x..x...x..x..',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.',bass:'0..0..0.0..5.1..',arp:'B',lead:1,seed:13},
  pier:{bpm:132,root:52,prog:[0,5,2,6],k:'x...x...x...x...',s:'....x.......x...',h:'.x.x.x.x.x.x.x.x',bass:'0.10.10.0.10.150',arp:'B',lead:1,seed:19},
  chapel:{bpm:98,root:55,prog:[0,3,5,4],k:'x.......x..x....',s:'....x.......x...',h:'..x...x...x...x.',bass:'0...5...0...1...',arp:'AB',lead:.9,seed:27},
  ice:{bpm:126,root:49,prog:[0,5,6,4],k:'x.....x...x.....',s:'....x.......x...',h:'x.xxx.xxx.xxx.xx',bass:'0.0.0.0.1.1.5.5.',arp:'AB',lead:1,seed:33},
  roof:{bpm:118,root:54,prog:[0,4,5,4],k:'x..x..x.x..x..x.',s:'....x.......x.x.',h:'x.x.x.xxx.x.x.xx',bass:'0..0..0.5..5..1.',arp:'B',lead:1,seed:37},
  dock:{bpm:104,root:43,prog:[0,6,5,4],k:'x...x...x...x...',s:'....x.......x...',h:'..x...x...x...x.',bass:'00.000.000.0.11.',arp:'B',lead:1,seed:41},
  city:{bpm:104,root:52,prog:[0,5,3,6],k:'x..x..x...x.....',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.',bass:'0..0..5.0..0..1.',arp:'A',lead:.75,seed:61,soft:1},
  crown:{bpm:146,root:50,prog:[0,5,3,4],k:'x.....x.x.....x.',s:'....x.......x..x',h:'xxx.xxx.xxx.xxx.',bass:'0.0.0.0.5.5.1.1.',arp:'AB',lead:1,seed:47}};
const MINOR=[0,2,3,5,7,8,10],mf=n=>440*Math.pow(2,(n-69)/12);
const MUS={on:false,song:null,step:0,next:0,timer:0,bus:null,vol:.34,dly:null,S:null,mel:null};
function seededR(n){let s=n*1103+12345;return()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648}}
const deg=(S,d,oct=0)=>{const k=((d%7)+7)%7,o=Math.floor(d/7);return S.root+MINOR[k]+12*(o+oct)};
const chordOf=(S,bar)=>{const d=S.prog[bar%S.prog.length];return[deg(S,d),deg(S,d+2),deg(S,d+4)]};
/* the melody: a two-bar motif (rhythm + shape) laid over each pair of chords, with a different answer in the B section */
function makeMelody(S){const r=seededR(S.seed),R=['x..x..x.x.......','x...x.x...x.x...','..x.x..xx...x...','x.x...x...x.x.x.','x..x..x...x.....','x.....x.x.x.x...'];
  const phrase=()=>{const rh=[R[Math.floor(r()*R.length)],R[Math.floor(r()*R.length)]],shape=[];let p=Math.floor(r()*3);for(let i=0;i<16;i++){p=clamp(p+[-1,0,1,1,2,-2][Math.floor(r()*6)],-1,6);shape.push(p)}return{rh,shape}};
  return{A:phrase(),B:phrase()}}
function musBus(){const a=AC;if(MUS.bus)return;MUS.bus=a.createGain();MUS.bus.gain.value=muted?0:MUS.vol;MUS.bus.connect(master);
  const d=a.createDelay(1),fb=a.createGain(),lp=a.createBiquadFilter();d.delayTime.value=.33;fb.gain.value=.32;lp.type='lowpass';lp.frequency.value=2400;d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(MUS.bus);MUS.dly=d}
function env(g,t,a,peak,dec){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0005,t+a+dec)}
function osc(type,f,t,dur,dest,det=0){const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);o.detune.value=det;o.connect(dest);o.start(t);o.stop(t+dur+.05);return o}
const I={
  kick(t,v=1){const g=AC.createGain();g.connect(MUS.bus);env(g,t,.002,.9*v,.28);const o=AC.createOscillator();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.14);o.connect(g);o.start(t);o.stop(t+.35)},
  noiseHit(t,f,q,v,dec,type='bandpass'){if(!NB){NB=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const c=NB.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=rnd()*2-1}const s=AC.createBufferSource(),bp=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NB;bp.type=type;bp.frequency.value=f;bp.Q.value=q;env(g,t,.001,v,dec);s.connect(bp);bp.connect(g);g.connect(MUS.bus);s.start(t);s.stop(t+dec+.05)},
  snare(t,v=1){I.noiseHit(t,1900,.7,.32*v,.17);const g=AC.createGain();g.connect(MUS.bus);env(g,t,.001,.18*v,.09);osc('triangle',190,t,.12,g)},
  hat(t,open,v=1){I.noiseHit(t,8000,1,(open?.07:.05)*v,open?.2:.035,'highpass')},
  bass(t,n,dur,v=1){const f=AC.createBiquadFilter(),g=AC.createGain();f.type='lowpass';f.Q.value=6;f.frequency.setValueAtTime(1400,t);f.frequency.exponentialRampToValueAtTime(220,t+dur*.9);
    f.connect(g);g.connect(MUS.bus);env(g,t,.005,.26*v,dur);osc('sawtooth',mf(n),t,dur,f);osc('square',mf(n-12),t,dur,f,4)},
  pad(t,notes,dur,v=1){const f=AC.createBiquadFilter(),g=AC.createGain();f.type='lowpass';f.frequency.value=1100;f.connect(g);g.connect(MUS.bus);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045*v,t+.25);g.gain.setValueAtTime(.045*v,t+dur-.15);g.gain.linearRampToValueAtTime(0,t+dur+.2);
    for(const n of notes){osc('sawtooth',mf(n+12),t,dur+.2,f,-7);osc('sawtooth',mf(n+12),t,dur+.2,f,7)}},
  arp(t,n,v=1){const g=AC.createGain();g.connect(MUS.bus);g.connect(MUS.dly);env(g,t,.003,.06*v,.16);osc('square',mf(n),t,.2,g)},
  lead(t,n,dur,v=1){const f=AC.createBiquadFilter(),g=AC.createGain();f.type='lowpass';f.frequency.value=3200;f.connect(g);g.connect(MUS.bus);g.connect(MUS.dly);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.075*v,t+.02);g.gain.setValueAtTime(.06*v,t+dur*.7);g.gain.exponentialRampToValueAtTime(.0005,t+dur+.12);
    const lfo=AC.createOscillator(),lg=AC.createGain();lfo.frequency.value=5.5;lg.gain.value=9;lfo.connect(lg);
    for(const[ty,dt]of[['sawtooth',-5],['square',6]]){const o=osc(ty,mf(n),t,dur+.15,f,dt);lg.connect(o.detune)}lfo.start(t+.08);lfo.stop(t+dur+.2)}};
/* one sixteenth note of the current song */
function musStep(t,st){const S=MUS.S,bar=Math.floor(st/16),i=st%16,sec=bar<2?'intro':(Math.floor((bar-2)/8)%2?'B':'A'),inB=sec==='B',last=(bar-2)%8===7;
  const ch=chordOf(S,bar),soft=S.soft;
  /* drums */
  if(S.k[i]==='x')I.kick(t,soft?.7:1);
  if(sec!=='intro'||bar===1){if(last&&i>=12&&!soft)I.snare(t,.5+(i-12)*.15);else if(S.s[i]==='x')I.snare(t,soft?.5:1)}
  if(S.h[i]==='x'||(inB&&!soft&&i%2===1))I.hat(t,inB&&i%8===6,soft?.6:1);
  /* bass */
  const b=S.bass[i];if(b&&b!=='.'){const n=ch[0]-12+(b==='1'?12:b==='5'?7:0);let len=1;while(i+len<16&&S.bass[i+len]==='.'&&len<4)len++;I.bass(t,n,len*MUS.spb*.95,soft?.7:1)}
  /* pads on each bar */
  if(i===0)I.pad(t,ch,MUS.spb*16,sec==='intro'?.6:1);
  /* arpeggio */
  if(S.arp.includes(sec==='intro'?'A':sec)&&(soft?i%2===0:true)){const seq=[ch[0],ch[1],ch[2],ch[0]+12,ch[2],ch[1]];I.arp(t,seq[(st>>(soft?1:0))%seq.length]+12,soft?.8:1)}
  /* lead melody */
  if(sec!=='intro'&&MUS.mel){const ph=MUS.mel[sec],half=bar%2,rh=ph.rh[half];if(rh[i]==='x'){let len=1;while(i+len<16&&rh[i+len]==='.'&&len<6)len++;
      const k=ph.shape[(half*8+Math.floor(i/2))%16],d=S.prog[bar%S.prog.length]+[0,2,4,7,9,11,14,16][clamp(k,0,7)]-(k<0?2:0);
      I.lead(t,deg(S,d,1),len*MUS.spb*.9,S.lead)}}}
function musTick(){const a=AC;if(!a||!MUS.on||!MUS.S)return;while(MUS.next<a.currentTime+.15){musStep(MUS.next,MUS.step);MUS.step++;MUS.next+=MUS.spb}}
function music(on,id){if(!on){MUS.on=false;if(MUS.bus&&AC){const g=MUS.bus.gain;g.setTargetAtTime(0,AC.currentTime,.15);const old=MUS.bus;MUS.bus=null;setTimeout(()=>{try{old.disconnect()}catch(e){}},900)}MUS.song=null;return}
  if(!AC)return;id=id||'title';if(MUS.on&&MUS.song===id)return;if(MUS.on)music(false);
  musBus();const S=SONGS[id]||SONGS.title;MUS.S=S;MUS.song=id;MUS.spb=60/S.bpm/4;MUS.step=0;MUS.mel=makeMelody(S);MUS.on=true;MUS.next=AC.currentTime+.08;
  MUS.bus.gain.value=muted?0:MUS.vol;if(!MUS.timer)MUS.timer=setInterval(musTick,25)}
