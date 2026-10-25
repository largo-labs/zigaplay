/* ===================== UI: input, screens, message boxes, saves ===================== */
const $=s=>document.querySelector(s);
const APP=$('#app');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const frame=()=>new Promise(r=>requestAnimationFrame(r));
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=v=>'$'+v+'k';

/* ---------- input ---------- */
const HELD={};let repT=0;
const layers=[]; // top layer gets the buttons: {key(b,rep)}
function topLayer(){return layers[layers.length-1]||SCR}
function btn(b,down){
  if(down){AU.unlock();if(HELD[b])return;HELD[b]=true;const L=topLayer();if(L&&L.key)L.key(b,false);
    if(['up','down','left','right'].includes(b)){clearTimeout(repT);const go=()=>{if(!HELD[b])return;const L2=topLayer();if(L2&&L2.key)L2.key(b,true);repT=setTimeout(go,95)};repT=setTimeout(go,330)}}
  else HELD[b]=false}
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',z:'a',Z:'a',x:'b',X:'b',Enter:'start',Shift:'select',' ':'a',Escape:'b',Backspace:'b'};
addEventListener('keydown',e=>{const b=KEYMAP[e.key];if(b){e.preventDefault();if(!e.repeat)btn(b,true)}});
addEventListener('keyup',e=>{const b=KEYMAP[e.key];if(b){e.preventDefault();btn(b,false)}});
window.ZPCart={title:'Drone Strike',input(b,d){btn(b,d)},home(){return SCR&&SCR.id==='title'?true:'ask'}};
(()=>{let inConsole=false;try{inConsole=window.parent!==window&&!!window.parent.ZIGAPLAY}catch(e){}
  const touch='ontouchstart' in window||matchMedia('(pointer:coarse)').matches;if(inConsole||!touch)return;
  document.body.classList.add('touch');const pad=$('#pad');const active=new Map();
  const hit=(x,y)=>{const e=document.elementFromPoint(x,y);return e&&e.dataset&&e.dataset.b?e:null};
  const upd=ev=>{ev.preventDefault();const now=new Map();for(const t of ev.touches){const e=hit(t.clientX,t.clientY);if(e)now.set(e.dataset.b,e)}
    for(const [b,e] of active)if(!now.has(b)){e.classList.remove('on');btn(b,false)}for(const [b,e] of now)if(!active.has(b)){e.classList.add('on');btn(b,true)}active.clear();for(const [b,e] of now)active.set(b,e)};
  for(const ev of ['touchstart','touchmove','touchend','touchcancel'])pad.addEventListener(ev,upd,{passive:false})})();

/* ---------- screens: a column of rows you move through with the D-pad ---------- */
let SCR=null;
function screen(id,opts={}){const s={id,el:el('div','scr '+(opts.cls||'')),items:[],i:0,...opts};s.key=(b,rep)=>navKey(s,b,rep);return s}
function row(s,parent,html,h={}){const e=el('div','row'+(h.cls?' '+h.cls:''),html);parent.appendChild(e);const it={el:e,...h};s.items.push(it);if(h.off)e.classList.add('off');return it}
function keybar(s,keys){if(!s.keysEl){s.keysEl=el('div','keys','')}s.keysEl.innerHTML=keys.map(([k,t])=>`<span><b>${k}</b>${t}</span>`).join('');if(!s.keysEl.parentNode)s.el.appendChild(s.keysEl)}
function show(s,{keep=false}={}){if(s.keys)keybar(s,s.keys);const prev=SCR;if(prev&&prev.el.parentNode)prev.el.remove();if(prev&&prev.leave)prev.leave();SCR=s;APP.appendChild(s.el);
  let i=keep&&prev&&prev.id===s.id?prev.i:(s.start0||0);i=Math.max(0,Math.min(s.items.length-1,i));setFocus(s,i,true);if(s.enter)s.enter()}
function setFocus(s,i,quiet){if(!s.items.length)return;s.items.forEach(it=>it.el.classList.remove('focus'));s.i=i;const it=s.items[i];it.el.classList.add('focus');
  const sc=it.el.closest('.scroll');if(sc){const top=it.el.offsetTop-sc.offsetTop,bot=top+it.el.offsetHeight;if(top<sc.scrollTop)sc.scrollTop=top-4;else if(bot>sc.scrollTop+sc.clientHeight)sc.scrollTop=bot-sc.clientHeight+4}
  if(s.onFocus)s.onFocus(it);if(!quiet)AU.play('tick')}
function navKey(s,b,rep){if(s.busy)return;const it=s.items[s.i];
  if(b==='up'||b==='down'){if(!s.items.length)return;let j=s.i;const n=s.items.length;for(let k=0;k<n;k++){j=(j+(b==='up'?-1:1)+n)%n;if(!s.items[j].skip)break}if(rep&&((b==='down'&&j<s.i)||(b==='up'&&j>s.i)))return;setFocus(s,j);return}
  if(rep)return void((b==='left'&&it&&it.l)?it.l():(b==='right'&&it&&it.r)?it.r():0);
  if(b==='a'){if(!it)return;if(it.off){AU.play('buzz');if(it.offMsg)toast(it.offMsg);return}if(it.a){AU.play('ok');it.a()}}
  else if(b==='left'&&it&&it.l)it.l();else if(b==='right'&&it&&it.r)it.r();
  else if(b==='b'&&s.back){AU.play('back');s.back()}else if(b==='start'&&s.start)s.start();else if(b==='select'&&s.select)s.select()}

/* ---------- message boxes on top of everything ---------- */
function overlay(html){const o=el('div','ov',`<div class="panel">${html}</div>`);APP.appendChild(o);return o}
function msg(text,{who=null,port=null}={}){return new Promise(res=>{
  const o=overlay(`<div style="display:flex;gap:.45rem;align-items:flex-start">${port?'<span class="pslot"></span>':''}<div class="msg" style="flex:1">${who?`<span class="who">${esc(who)}</span>`:''}<span class="t"></span></div></div><div class="more">A ▶</div>`);
  if(port){const c=port;c.className='port px';o.querySelector('.pslot').replaceWith(c)}
  const t=o.querySelector('.t'),more=o.querySelector('.more');more.style.visibility='hidden';let n=0,done=false;const full=text;
  const tm=setInterval(()=>{n+=2;t.textContent=full.slice(0,n);if(n%6===0)AU.play('type');if(n>=full.length)fin()},22);
  function fin(){clearInterval(tm);done=true;t.textContent=full;more.style.visibility=''}
  const L={key(b){if(b!=='a'&&b!=='b'&&b!=='start')return;if(!done){fin();return}layers.splice(layers.indexOf(L),1);o.remove();res()}};layers.push(L)})}
function choose(text,opts,{cancel=-1,who=null}={}){return new Promise(res=>{
  const o=overlay(`<div class="msg">${who?`<span class="who">${esc(who)}</span>`:''}${text}</div><div class="list" style="margin-top:.4rem"></div>`);const list=o.querySelector('.list');
  const s=screen('choose');opts.forEach((t,i)=>row(s,list,t,{cls:'btn',a:()=>end(i)}));
  function end(i){layers.splice(layers.indexOf(L),1);o.remove();res(i)}
  const L={key(b,rep){if(b==='b'&&cancel>=0){AU.play('back');end(cancel);return}navKey(s,b,rep)}};layers.push(L);setFocus(s,0,true)})}
function toast(t){const e=el('div','toast',esc(t));APP.appendChild(e);setTimeout(()=>e.remove(),1900)}
const fadeEl=el('div','');fadeEl.style.cssText='position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:45;transition:opacity .3s';APP.appendChild(fadeEl);
async function fade(on,ms=300){fadeEl.style.transitionDuration=ms+'ms';fadeEl.style.opacity=on?1:0;await sleep(ms+20)}
async function go(fn,...a){await fade(1,200);fn(...a);await fade(0,220)}

/* ---------- saves ---------- */
const SAVE='dronestrike-save',SET='dronestrike-settings';
function save(){if(!S)return;try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}}
function loadSave(){try{const v=localStorage.getItem(SAVE);return v?JSON.parse(v):null}catch(e){return null}}
function saveSettings(){try{localStorage.setItem(SET,JSON.stringify({m:AU.musicOn,s:AU.sfxOn}))}catch(e){}}
try{const st=JSON.parse(localStorage.getItem(SET)||'null');if(st){AU.setMusic(st.m);AU.setSfx(st.s)}}catch(e){}
