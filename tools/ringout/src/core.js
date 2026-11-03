/* ================= setup ================= */
const ZP=(()=>{try{return window.parent!==window&&window.parent.ZIGAPLAY||null}catch(e){return null}})();
const RT=document.documentElement;if(ZP)RT.classList.add('zp');
if(!ZP&&(matchMedia('(pointer:coarse)').matches||'ontouchstart'in window))RT.classList.add('touch');
/* The screen is 180 pixels wide and as tall as the phone allows (220 to 340). Everything vertical in a fight
   (stage heights, jumps, gravity, launches) is designed for a 220-tall screen and scaled by VS, so a fight plays
   the same on every phone. */
const W=180,K='#140c22',WH='#ffffff',DH=220;
let H=300,VS=H/DH;
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
const rnd=Math.random,clamp=(v,a,b)=>v<a?a:v>b?b:v,pick=a=>a[Math.floor(rnd()*a.length)],lerp=(a,b,t)=>a+(b-a)*t,sgn=v=>v<0?-1:v>0?1:0;
const store={get(k,d){try{const v=localStorage.getItem('ringout-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('ringout-'+k,JSON.stringify(v))}catch(e){}}};
const hx=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
const mix=(a,b,t)=>{const A=hx(a),B=hx(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
const dk=c=>mix(c,'#140c22',.32),lt=c=>mix(c,'#ffffff',.38);
function padH(){return RT.classList.contains('touch')&&!ZP?Math.min(170,innerHeight*.3):0}
function targetH(){const aw=Math.max(1,innerWidth-(ZP?0:16)),ah=Math.max(1,innerHeight-padH()-(ZP?0:16));return clamp(Math.round(W*ah/aw/2)*2,220,340)}
function applySize(h){H=h||targetH();VS=H/DH;cv.width=W;cv.height=H;ctx.imageSmoothingEnabled=false}
function fit(){const pad=padH(),aw=innerWidth-(ZP?0:16),ah=innerHeight-pad-(ZP?0:16);
  let s=Math.min(aw/W,ah/H);if(s>=2)s=Math.floor(s*2)/2;cv.style.width=Math.round(W*s)+'px';cv.style.height=Math.round(H*s)+'px';
  document.getElementById('stage').style.bottom=pad+'px'}

/* ================= a pixel font (5x7), so the words stay crisp everywhere ================= */
const FD={A:'01110 10001 10001 11111 10001 10001 10001',B:'11110 10001 10001 11110 10001 10001 11110',C:'01110 10001 10000 10000 10000 10001 01110',D:'11110 10001 10001 10001 10001 10001 11110',
 E:'11111 10000 10000 11110 10000 10000 11111',F:'11111 10000 10000 11110 10000 10000 10000',G:'01110 10001 10000 10111 10001 10001 01111',H:'10001 10001 10001 11111 10001 10001 10001',
 I:'01110 00100 00100 00100 00100 00100 01110',J:'00111 00010 00010 00010 00010 10010 01100',K:'10001 10010 10100 11000 10100 10010 10001',L:'10000 10000 10000 10000 10000 10000 11111',
 M:'10001 11011 10101 10101 10001 10001 10001',N:'10001 10001 11001 10101 10011 10001 10001',O:'01110 10001 10001 10001 10001 10001 01110',P:'11110 10001 10001 11110 10000 10000 10000',
 Q:'01110 10001 10001 10001 10101 10010 01101',R:'11110 10001 10001 11110 10100 10010 10001',S:'01111 10000 10000 01110 00001 00001 11110',T:'11111 00100 00100 00100 00100 00100 00100',
 U:'10001 10001 10001 10001 10001 10001 01110',V:'10001 10001 10001 10001 10001 01010 00100',W:'10001 10001 10001 10101 10101 10101 01010',X:'10001 10001 01010 00100 01010 10001 10001',
 Y:'10001 10001 01010 00100 00100 00100 00100',Z:'11111 00001 00010 00100 01000 10000 11111',
 0:'01110 10001 10011 10101 11001 10001 01110',1:'00100 01100 00100 00100 00100 00100 01110',2:'01110 10001 00001 00010 00100 01000 11111',3:'11110 00001 00001 01110 00001 00001 11110',
 4:'00010 00110 01010 10010 11111 00010 00010',5:'11111 10000 11110 00001 00001 10001 01110',6:'00110 01000 10000 11110 10001 10001 01110',7:'11111 00001 00010 00100 01000 01000 01000',
 8:'01110 10001 10001 01110 10001 10001 01110',9:'01110 10001 10001 01111 00001 00010 01100',
 '!':'00100 00100 00100 00100 00100 00000 00100','?':'01110 10001 00001 00010 00100 00000 00100','.':'00000 00000 00000 00000 00000 01100 01100',',':'00000 00000 00000 00000 01100 00100 01000',
 ':':'00000 01100 01100 00000 01100 01100 00000','-':'00000 00000 00000 11111 00000 00000 00000','+':'00000 00100 00100 11111 00100 00100 00000','*':'00000 10001 01010 00100 01010 10001 00000',
 "'":'00100 00100 01000 00000 00000 00000 00000','/':'00001 00010 00010 00100 01000 01000 10000','(':'00010 00100 01000 01000 01000 00100 00010',')':'01000 00100 00010 00010 00010 00100 01000',
 '<':'00010 00100 01000 10000 01000 00100 00010','>':'01000 00100 00010 00001 00010 00100 01000','·':'00000 00000 00000 00100 00000 00000 00000','#':'01010 11111 01010 01010 11111 01010 00000',
 '♥':'00000 01010 11111 11111 01110 00100 00000','▲':'00000 00100 01110 11111 00000 00000 00000','▼':'00000 00000 11111 01110 00100 00000 00000','◀':'00010 00110 01110 11110 01110 00110 00010','▶':'01000 01100 01110 01111 01110 01100 01000'};
const FONT={};for(const k in FD)FONT[k]=FD[k].replace(/ /g,'');
const tw=(s,sc=1)=>String(s).length*6*sc-sc;
function txt(s,x,y,col,sc=1,al='l',sh=null){s=String(s).toUpperCase();let X=al==='c'?Math.round(x-tw(s,sc)/2):al==='r'?x-tw(s,sc):x;
  if(sh){txt(s,X+sc,y+sc,sh,sc,'l')}ctx.fillStyle=col;
  for(const ch of s){const g=FONT[ch];if(g)for(let i=0;i<35;i++)if(g[i]==='1')ctx.fillRect(X+(i%5)*sc,y+Math.floor(i/5)*sc,sc,sc);X+=6*sc}}
FONT['%']='11000'+'11001'+'00010'+'00100'+'01000'+'10011'+'00011';
FONT['=']='00000'+'00000'+'11111'+'00000'+'11111'+'00000'+'00000';
FONT['★']='00100'+'00100'+'11111'+'01110'+'01010'+'10001'+'00000';
FONT['&']='01100'+'10010'+'10100'+'01000'+'10101'+'10010'+'01101';
FONT['_']='00000'+'00000'+'00000'+'00000'+'00000'+'00000'+'11111';
/* a box with a pixel border, used by every menu */
function box(x,y,w,h,fill='#1e1438',edge='#ffd36a'){ctx.fillStyle=K;ctx.fillRect(x-2,y-2,w+4,h+4);ctx.fillStyle=edge;ctx.fillRect(x-1,y-1,w+2,h+2);ctx.fillStyle=fill;ctx.fillRect(x,y,w,h)}

/* ================= sound: little synths, no files ================= */
let AC=null,master=null,musicBus=null,muted=!!store.get('mute',false);
function audio(){if(AC)return AC;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;AC=new A();master=AC.createGain();master.gain.value=muted?0:.5;master.connect(AC.destination);
  musicBus=AC.createGain();musicBus.gain.value=.26;musicBus.connect(master)}catch(e){AC=null}return AC}
function unlock(){const a=audio();if(a&&a.state==='suspended')a.resume().catch(()=>{})}
function tone({f=440,f2=null,d=.12,type='square',v=.2,t0=0,dest=null}){const a=AC;if(!a||muted)return;const t=a.currentTime+t0,o=a.createOscillator(),g=a.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g);g.connect(dest||master);o.start(t);o.stop(t+d+.02)}
let NB=null;function noise({d=.15,v=.2,f=1000,q=1,t0=0}){const a=AC;if(!a||muted)return;if(!NB){NB=a.createBuffer(1,a.sampleRate*.5,a.sampleRate);const c=NB.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=rnd()*2-1}
  const t=a.currentTime+t0,s=a.createBufferSource(),bp=a.createBiquadFilter(),g=a.createGain();s.buffer=NB;bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(bp);bp.connect(g);g.connect(master);s.start(t);s.stop(t+d+.02)}
const SFX={
  swing(){noise({d:.07,f:2400,q:.8,v:.09})},
  hit(p=1){/* p: 0 light, 1 medium, 2 heavy */tone({f:220-p*40,f2:80,d:.08+p*.04,v:.22+p*.04});noise({d:.06+p*.05,f:1400-p*300,v:.2+p*.06})},
  smash(){tone({f:120,f2:40,d:.35,type:'sawtooth',v:.2});noise({d:.3,f:500,v:.32})},
  jump(){tone({f:330,f2:560,d:.1,type:'triangle',v:.12})},
  land(){noise({d:.05,f:300,v:.12})},
  dash(){noise({d:.09,f:900,q:.6,v:.12})},
  dodge(){tone({f:900,f2:1500,d:.08,type:'triangle',v:.08})},
  perfect(){[1047,1319,1568].forEach((f,i)=>tone({f,d:.12,type:'triangle',v:.13,t0:i*.05}))},
  shoot(){tone({f:700,f2:300,d:.12,type:'square',v:.1})},
  boom(){noise({d:.35,f:300,q:.5,v:.35});tone({f:90,f2:40,d:.3,v:.2})},
  counter(){tone({f:1400,d:.06,v:.12});tone({f:1800,d:.12,v:.12,t0:.06})},
  ko(){noise({d:.8,f:200,q:.4,v:.4});tone({f:200,f2:30,d:.7,type:'sawtooth',v:.22});tone({f:1200,f2:300,d:.5,type:'triangle',v:.1,t0:.05})},
  move(){tone({f:660,d:.04,v:.08})},
  pick(){tone({f:520,d:.06,v:.12});tone({f:780,d:.1,v:.12,t0:.06})},
  back(){tone({f:400,f2:260,d:.08,v:.1})},
  beep(){tone({f:520,d:.15,v:.14})},
  go(){tone({f:1040,d:.4,v:.16});tone({f:780,d:.4,type:'triangle',v:.12})},
  win(){[523,659,784,1047,784,1047].forEach((f,i)=>tone({f,d:.16,v:.12,t0:i*.1}))},
};
/* music: a driving fight loop (and a calmer one for the menus), melody, bass and drums */
const FMEL=[69,0,72,69,76,0,74,72,69,0,67,69,72,74,72,0, 69,0,72,69,79,0,77,76,74,0,72,74,76,72,69,0],FBASS=[45,45,57,45,48,48,60,48,43,43,55,43,45,45,57,45];
const MMEL=[64,67,71,72,71,67,64,0,62,66,69,71,69,66,62,0],MBASS=[40,40,47,47,38,38,45,45];
const mf=n=>440*Math.pow(2,(n-69)/12);let mus={on:false,step:0,next:0,timer:0,song:'menu'};
function musicTick(){const a=AC;if(!a||!mus.on)return;const fight=mus.song==='fight',spb=fight?.13:.2;
  while(mus.next<a.currentTime+.2){const s=mus.step,t=mus.next-a.currentTime,M=fight?FMEL:MMEL,B=fight?FBASS:MBASS;
    const n=M[s%M.length];if(n&&!muted)tone({f:mf(n),d:fight?.11:.18,type:'square',v:.07,t0:t,dest:musicBus});
    if(s%2===0){const bn=B[(s/2)%B.length];if(bn&&!muted)tone({f:mf(bn),d:.22,type:'triangle',v:.2,t0:t,dest:musicBus})}
    if(fight&&!muted){if(s%4===0)tone({f:110,f2:45,d:.1,v:.16,t0:t,dest:musicBus});if(s%4===2)noise({d:.05,f:4000,v:.05,t0:t})}
    mus.step++;mus.next+=spb}}
function music(on,song){if(song&&song!==mus.song){mus.song=song;mus.step=0}mus.on=on;const a=AC;if(on&&a){mus.next=Math.max(mus.next,a.currentTime+.05);if(!mus.timer)mus.timer=setInterval(musicTick,50)}}
function setMute(m){muted=m;store.set('mute',m);if(master)master.gain.value=m?0:.5}

/* ================= input =================
   The buttons are held/released by the console (or the keyboard, or the touch pad). A press is remembered until
   the next game frame reads it, so a quick tap between two frames is never lost. */
const BTN=['up','down','left','right','a','b','start','select'];
const IN={held:{},pressed:{},released:{},last:{},frame:0};
for(const b of BTN){IN.held[b]=false;IN.pressed[b]=false;IN.released[b]=false;IN.last[b]=-99}
function input(btn,down){if(!BTN.includes(btn))return;if(down){if(!IN.held[btn])IN.pressed[btn]=true;IN.held[btn]=true}else{if(IN.held[btn])IN.released[btn]=true;IN.held[btn]=false}}
function clearPresses(){for(const b of BTN){IN.pressed[b]=false;IN.released[b]=false}}
