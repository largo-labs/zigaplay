/* ================= the match HUD: damage, stocks, callouts, banners ================= */
let HUDC=null;
function hudBuild(){const el=scr('hud');
  el.innerHTML=`<div id="hud">${G.fighters.map((f,i)=>`<div class="pl p${i+1}" id="pl${i}"><div class="face"><img alt="" src="${portrait(f.ch,'face')}"></div><div class="stk"></div><div class="pc"></div><div class="nm">${f.ch.name}</div><div class="call"></div></div>`).join('')}</div>
  <div id="tags"></div><div class="ban" id="ban"></div><div class="combo" id="combo"></div><div class="flash" id="flash"></div>
  <div id="trn" class="sub" style="position:absolute;left:12px;top:10px;text-shadow:0 1px 2px #000,0 0 6px #000;font-size:12px"></div>`;
  const tags=$('#tags');HUDC={pl:G.fighters.map((f,i)=>{const e=$('#pl'+i);const t=document.createElement('div');
    t.style.cssText=`position:absolute;left:0;top:0;padding:2px 5px;border-radius:4px;font:900 10px/1 var(--ui);color:#fff;background:${i?'var(--blue)':'var(--red)'};box-shadow:0 1px 3px #000;transform:translate(-50%,-100%)`;t.textContent=i?'CPU':'P1';tags.appendChild(t);
    return{e,pc:e.querySelector('.pc'),stk:e.querySelector('.stk'),call:e.querySelector('.call'),tag:t,last:'',lastS:-1,lastC:''}}),ban:$('#ban'),combo:$('#combo'),flash:$('#flash'),trn:$('#trn'),texts:[],lastBan:null}}
function pctCol(p){const S=[[0,[255,255,255]],[40,[255,236,120]],[80,[255,170,60]],[120,[255,80,50]],[180,[200,20,30]],[260,[110,0,10]]];
  for(let i=1;i<S.length;i++)if(p<=S[i][0]){const[a,ca]=S[i-1],[b,cb]=S[i],t=(p-a)/(b-a);return`rgb(${ca.map((v,k)=>Math.round(v+(cb[k]-v)*t)).join(',')})`}return'rgb(110,0,10)'}
const _pv=new THREE.Vector3();
function toUI(x,y,z=0){_pv.set(x,y,z).project(CAM);const sx=(_pv.x+1)/2*innerWidth,sy=(1-_pv.y)/2*innerHeight;return[(sx-innerWidth/2)/UIS+320,(sy-innerHeight/2)/UIS+180]}
function banner(s,col){G.banner={s,col,t:70}}
function hudTick(){if(!HUDC||SCREEN!=='hud'&&SCREEN!=='pause')return;
  G.fighters.forEach((f,i)=>{const H=HUDC.pl[i],p=Math.floor(f.pct),txt=f.dead?'':p+'';
    if(txt!==H.last){H.last=txt;H.pc.innerHTML=f.dead?'':`${p}<small>%</small>`;H.pc.style.color=pctCol(p)}
    const sh=f.flash>0&&f.st==='hurt'?f.flash*.5:0;H.pc.style.transform=sh?`translate(${(rnd()-.5)*sh}px,${(rnd()-.5)*sh}px) scale(${1+sh*.012})`:'';
    const s=G.mode==='training'?-2:f.stocks;if(s!==H.lastS){H.lastS=s;H.stk.innerHTML=s<0?'':Array.from({length:Math.max(0,s)},()=>`<i style="background:${f.ch.fx}"></i>`).join('')}
    const c=f.callout?f.callout.s:'';if(c!==H.lastC){H.lastC=c;if(c)H.call.textContent=c;H.call.classList.toggle('on',!!c)}
    /* the P1 / CPU marker above each head, held at the screen edge when they are off it */
    if(f.dead||G.state==='results'){H.tag.style.display='none'}else{H.tag.style.display='';let[x,y]=toUI(f.x,f.y+f.h+.35);const out=x<8||x>632||y<14||y>300;
      x=clamp(x,14,626);y=clamp(y,16,296);H.tag.style.left=x+'px';H.tag.style.top=y+'px';H.tag.style.outline=out?'2px solid #fff':''}});
  /* banners */
  const b=G.banner;if(b!==HUDC.lastBan){HUDC.lastBan=b;HUDC.ban.classList.remove('on');if(b){void HUDC.ban.offsetWidth;HUDC.ban.textContent=b.s;HUDC.ban.style.color=b.col||'#fff';HUDC.ban.classList.add('on')}}
  HUDC.ban.style.opacity=b?Math.min(1,b.t/12):'';
  /* combos */
  const cs=G.comboShow;if(cs){HUDC.combo.classList.add('on');const i=G.fighters.indexOf(cs.f);HUDC.combo.textContent=`${cs.n} HIT COMBO!`;HUDC.combo.style.left=i?'':'18px';HUDC.combo.style.right=i?'18px':''}else HUDC.combo.classList.remove('on');
  HUDC.flash.style.opacity=Math.max(0,G.flash||0);
  /* floating words: PARRY!, COUNTER!, TECH! */
  for(const t of G.texts||[]){if(!t.el){t.el=document.createElement('div');t.el.style.cssText=`position:absolute;transform:translate(-50%,-100%);font:900 italic 16px/1 var(--ui);color:${t.col};-webkit-text-stroke:2px #10142a;paint-order:stroke fill;white-space:nowrap`;t.el.textContent=t.s;$('#tags').appendChild(t.el)}
    const[x,y]=toUI(t.f.x,t.f.y+t.f.h+.7+(60-t.t)*.012);t.el.style.left=x+'px';t.el.style.top=y+'px';t.el.style.opacity=Math.min(1,t.t/15)}
  /* training: how much the last combo did */
  if(G.mode==='training'){const T=G.trn,v=G.fighters[1],a=G.fighters[0];const d=v.pct-T.prev;if(d>0){if(a.combo<=1||v.st!=='hurt'&&!T.inC)T.dmg=0;T.dmg+=d;T.n=Math.max(1,a.combo);T.inC=1}if(v.st!=='hurt'&&v.hitlag<=0)T.inC=0;T.prev=v.pct;
    const s=`DUMMY: ${TRAIN.names[TRAIN.dummy]} · COMBO ${T.n} · ${Math.round(T.dmg*10)/10}% · START for options`;if(s!==T.s){T.s=s;HUDC.trn.textContent=s}}else if(HUDC.trn.textContent)HUDC.trn.textContent=''}
function hudStep(){if(G.banner&&--G.banner.t<=0)G.banner=null;if(G.comboShow&&--G.comboShow.t<=0)G.comboShow=null;if(G.flash>0)G.flash=Math.max(0,G.flash-.03);
  if(G.texts){for(const t of G.texts)t.t--;for(const t of G.texts)if(t.t<=0&&t.el)t.el.remove();G.texts=G.texts.filter(t=>t.t>0)}}
