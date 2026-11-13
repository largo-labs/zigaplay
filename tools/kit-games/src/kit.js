/* ---------- shared kit: console hookup, buttons, sound, saves, menus ---------- */
/* ZigaPlay: inside the console, window.parent.ZIGAPLAY is the console's API (same origin). */
const ZP=(()=>{try{return window.parent!==window&&window.parent.ZIGAPLAY||null}catch(e){return null}})();
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rnd=Math.random,ri=n=>Math.floor(rnd()*n),pick=a=>a[ri(a.length)];
const fmt=n=>Math.floor(n).toLocaleString('en-US');
const mkCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
/* how big one game pixel is on screen: the largest size, in whole device pixels, at which a view of at least minW x minH still fits */
function pickScale(W,H,minW,minH){const dpr=Math.max(1,window.devicePixelRatio||1),k=Math.max(1,Math.floor(Math.min(W/minW,H/minH)*dpr+1e-6));return k/dpr}
/* the console's second screen (below the hinge): rows of numbers and one small canvas; missing when the game runs on its own */
const PANEL=ZP&&ZP.panel&&typeof ZP.panel.rows==='function'?ZP.panel:null;

/* ---------- sound: a few oscillators for effects and a step sequencer for the tune ---------- */
const SND=(()=>{const AC=window.AudioContext||window.webkitAudioContext;let ctx=null,master=null,musicG=null,mode=2,song=null,sStep=0,sNext=0,timer=0,nbuf=null,paused=false;
  const NOTE={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const freq=n=>{const m=/^([A-G])([#b]?)(\d)$/.exec(n);if(!m)return 0;const s=NOTE[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+12*(+m[3]+1);return 440*Math.pow(2,(s-69)/12)};
  function unlock(){if(!AC)return;try{if(!ctx){ctx=new AC();master=ctx.createGain();master.gain.value=mode?0.55:0;master.connect(ctx.destination);
      musicG=ctx.createGain();musicG.gain.value=.5;musicG.connect(master);
      nbuf=ctx.createBuffer(1,ctx.sampleRate*.5,ctx.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=rnd()*2-1}
    if(ctx.state!=='running'&&!paused)ctx.resume().catch(()=>{})}catch(e){}}
  function tone(f,d,o={}){if(!ctx||!mode||ctx.state!=='running')return;const t=Math.max(ctx.currentTime,o.t||0)+(o.at||0),os=ctx.createOscillator(),g=ctx.createGain(),v=o.vol||.1;
    os.type=o.type||'square';os.frequency.setValueAtTime(f,t);if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+d);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0008,t+d);os.connect(g);g.connect(o.dest||master);os.start(t);os.stop(t+d+.03)}
  function noise(d,o={}){if(!ctx||!mode||ctx.state!=='running')return;const t=Math.max(ctx.currentTime,o.t||0)+(o.at||0),s=ctx.createBufferSource(),g=ctx.createGain(),v=o.vol||.1;s.buffer=nbuf;
    let n=s;if(o.hp||o.lp){const f=ctx.createBiquadFilter();f.type=o.hp?'highpass':'lowpass';f.frequency.value=o.hp||o.lp;s.connect(f);n=f}
    g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);n.connect(g);g.connect(o.dest||master);s.start(t);s.stop(t+d+.03)}
  /* a channel: 'E5 . G5 - k h' -> one token per sixteenth; '.' rests, '-' holds the note before it; k h s are drums */
  function seq(type,vol,str){const tk=str.trim().split(/\s+/),ev=[];let last=null;tk.forEach((x,i)=>{if(x==='.'){last=null}else if(x==='-'){if(last)last.n++}else{last={f:type==='drum'?x:freq(x),n:1};ev[i]=last}});return{type,vol,ev,len:tk.length}}
  function tick(){if(!ctx||!song||mode<2||ctx.state!=='running')return;const spb=60/song.bpm/4;if(sNext<ctx.currentTime)sNext=ctx.currentTime+.06;
    while(sNext<ctx.currentTime+.3){for(const ch of song.ch){const e=ch.ev[sStep%ch.len];if(!e)continue;
        if(ch.type==='drum'){if(e.f==='k')tone(140,.11,{type:'sine',to:45,vol:ch.vol*1.6,t:sNext,dest:musicG});else if(e.f==='s')noise(.09,{vol:ch.vol,hp:1800,t:sNext,dest:musicG});else noise(.03,{vol:ch.vol*.6,hp:6000,t:sNext,dest:musicG})}
        else tone(e.f,Math.max(.06,e.n*spb*.95),{type:ch.type,vol:ch.vol,t:sNext,dest:musicG})}
      sStep++;sNext+=spb}}
  return{unlock,tone,noise,seq,
    play(sg){if(song===sg)return;song=sg;sStep=0;sNext=0;if(!timer)timer=setInterval(tick,60)},
    stop(){song=null},
    get mode(){return mode},set mode(v){mode=v;if(master)master.gain.value=v?0.55:0},
    pause(p){paused=p;if(!ctx||ctx.state==='closed')return;try{(p?ctx.suspend():ctx.resume()).catch(()=>{})}catch(e){}},
    get ctx(){return ctx},get out(){return master},
    ui:{tick(){tone(1320,.035,{vol:.05})},ok(){tone(880,.06,{vol:.07});tone(1320,.1,{vol:.07,at:.06})},back(){tone(520,.07,{vol:.06,type:'triangle'});tone(390,.1,{vol:.06,type:'triangle',at:.06})}}}})();
const SOUND_NAMES=['OFF','EFFECTS','ALL'];

/* ---------- saved progress: this phone's storage, plus the player's account through the console ---------- */
function makeSave(id,fresh){const KEY=id+'-save';let SV=fresh(),cloud=false,t=0;
  try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==='object')SV=Object.assign(fresh(),s)}catch(e){}
  const ZC=ZP&&ZP.cloud&&typeof ZP.cloud.save==='function'?ZP.cloud:null,push=()=>{try{ZC.save(id,JSON.stringify(SV),{})}catch(e){}};
  return{get v(){return SV},
    save(){SV.savedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(SV))}catch(e){}if(cloud){clearTimeout(t);t=setTimeout(push,1500)}},
    async init(onLoad){if(!ZC)return;for(let a=0;a<6;a++){let r=null;try{r=await ZC.load(id)}catch(e){}
        if(r&&r.ok){cloud=true;let cs=null;try{cs=r.json?JSON.parse(r.json):null}catch(e){}
          if(cs&&typeof cs==='object'&&(+cs.savedAt||0)>(+SV.savedAt||0)){const snd=SV.sound;SV=Object.assign(fresh(),cs);SV.sound=snd;try{localStorage.setItem(KEY,JSON.stringify(SV))}catch(e){}if(onLoad)onLoad()}
          else if(SV.savedAt)push();return}
        await sleep(9000)}},
    async flush(){if(!cloud)return;clearTimeout(t);push();try{await ZC.flush(id)}catch(e){}}}}

/* ---------- buttons: the console's own, or the keyboard when the game has focus ---------- */
const held={};let onBtn=()=>{},stickX=0,stickY=0;
function btnSet(b,d){d=!!d;if(!!held[b]===d)return;held[b]=d;if(d)SND.unlock();try{onBtn(b,d)}catch(e){console.error(e)}}
const KEYMAP=(()=>{const src=(ZP&&ZP.keys)||{up:['ArrowUp','w'],down:['ArrowDown','s'],left:['ArrowLeft','a'],right:['ArrowRight','d'],a:['z',' '],b:['x','Escape'],c:['c'],d:['v'],start:['Enter'],select:['Shift']},m={};
  for(const b in src)for(const k of src[b]){if(!k)continue;m[k]=b;if(k.length===1)m[k.toUpperCase()]=b}return m})();
addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;const b=KEYMAP[e.key];if(!b)return;e.preventDefault();if(!e.repeat)btnSet(b,true)});
addEventListener('keyup',e=>{const b=KEYMAP[e.key];if(b)btnSet(b,false)});
addEventListener('blur',()=>{for(const b in held)if(held[b])btnSet(b,false)});
document.addEventListener('contextmenu',e=>e.preventDefault());
function hookConsole(id,title,save,extra){window.ZPCart=Object.assign({title,input(b,d){btnSet(b,d)},stick(x,y){stickX=x;stickY=y},async home(){try{await save.flush()}catch(e){}return true},snapshot:()=>null},extra||{});
  if(ZP){document.documentElement.classList.add('zp');try{if(ZP.takeRestore)ZP.takeRestore(id)}catch(e){}try{if(ZP.cartReady)ZP.cartReady(window.ZPCart)}catch(e){}}}

/* ---------- menus: a list of buttons over the game; the D-pad moves, A picks, B goes back ---------- */
const ov=$('#ov');let M=null;
function menu(o){M={items:o.items||[],i:o.i||0,back:o.back||null};ov.hidden=false;ov.className=o.cls||'';
  ov.innerHTML=(o.html||'')+'<div class="menu"></div>'+(o.foot?`<p class="foot">${o.foot}</p>`:'');const box=$('.menu',ov);
  M.items.forEach((it,n)=>{const b=el('button','',`<span>${it.t}</span>${it.v!=null?'<em></em>':''}`);b.tabIndex=-1;if(it.adj)b.classList.add('adj');
    b.addEventListener('click',()=>{SND.unlock();if(!M)return;M.i=n;menuMark();menuAct(it,1)});box.append(b)});menuMark()}
function menuMark(){if(!M)return;$$('.menu button',ov).forEach((b,n)=>{b.classList.toggle('hot',n===M.i);const it=M.items[n],em=$('em',b);if(em)em.textContent=typeof it.v==='function'?it.v():it.v})}
function menuAct(it,dir){if(it.adj){it.adj(dir);SND.ui.tick();menuMark()}else if(it.fn){SND.ui.ok();it.fn()}}
function menuInput(b){if(!M)return false;const n=M.items.length;if(!n){if(b==='b'&&M.back)M.back();return true}
  if(b==='up'){M.i=(M.i+n-1)%n;SND.ui.tick();menuMark()}else if(b==='down'){M.i=(M.i+1)%n;SND.ui.tick();menuMark()}
  else if(b==='left'||b==='right'){const it=M.items[M.i];if(it.adj){it.adj(b==='left'?-1:1);SND.ui.tick();menuMark()}}
  else if(b==='a'||b==='start')menuAct(M.items[M.i],1);else if(b==='b'){if(M.back){SND.ui.back();M.back()}}return true}
function closeMenu(){M=null;ov.hidden=true;ov.innerHTML=''}
