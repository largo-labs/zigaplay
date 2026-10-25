/* ===================== TITLE & BOOT ===================== */
let titleEl=null;
function titleUpdate(){}
/* the title: Millbrook under a crescent moon, something burning beyond the wall */
function nightScene(g,W,H,t,hz=Math.round(H*.62)){
  const sky=g.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#03040e');sky.addColorStop(.6,'#121a3c');sky.addColorStop(1,'#3a1a2e');g.fillStyle=sky;g.fillRect(0,0,W,hz);
  const r=rng(7);for(let i=0;i<Math.round(W*H/360);i++){const x=r()*W|0,y=r()*hz*.85|0,tw=(Math.sin(t/20+i)+1)/2;g.fillStyle=tw>.7?'#ffffff':tw>.3?'#9fb4e8':'#3a4a80';g.fillRect(x,y,1,1)}
  const mx=W*.76,my=H*.14,mr=Math.max(8,W*.06);g.fillStyle='rgba(255,250,220,.12)';g.beginPath();g.arc(mx,my,mr*1.8,0,Math.PI*2);g.fill();
  g.fillStyle='#f6f0d4';g.beginPath();g.arc(mx,my,mr,0,Math.PI*2);g.fill();g.fillStyle='#0b1030';g.beginPath();g.arc(mx+mr*.45,my-mr*.2,mr*.92,0,Math.PI*2);g.fill();
  const fx=W*.3,gl=g.createRadialGradient(fx,hz,4,fx,hz,W*.55);gl.addColorStop(0,'rgba(255,110,40,.55)');gl.addColorStop(1,'rgba(255,110,40,0)');g.fillStyle=gl;g.fillRect(0,0,W,H);
  g.fillStyle='#0a0a1a';g.beginPath();g.moveTo(0,hz-H*.06);for(let x=0;x<=W;x+=8)g.lineTo(x,hz-H*.06-Math.sin(x/W*6+1)*H*.03-Math.sin(x/W*13)*H*.012);g.lineTo(W,hz);g.lineTo(0,hz);g.fill();
  const r2=rng(11);let x=-6;while(x<W){const bw=Math.round(W*.09+r2()*W*.06),bh=Math.round(H*.06+r2()*H*.05);g.fillStyle='#06060f';g.fillRect(x,hz-bh,bw,bh);
    g.beginPath();g.moveTo(x-3,hz-bh);g.lineTo(x+bw/2,hz-bh-H*.05);g.lineTo(x+bw+3,hz-bh);g.fill();
    if(r2()<.75){g.fillStyle=r2()<.5?'#ffd77a':'#ff9a4a';g.fillRect(Math.round(x+bw/2-2),Math.round(hz-bh+H*.02),3,3)}x+=bw+Math.round(2+r2()*W*.03)}
  for(let i=0;i<W;i+=5){g.fillStyle='#06060f';g.fillRect(i,hz-H*.035,3,H*.035);g.fillRect(i,hz-H*.04,1,1)}
  const gr=g.createLinearGradient(0,hz,0,H);gr.addColorStop(0,'#1a1218');gr.addColorStop(1,'#05040a');g.fillStyle=gr;g.fillRect(0,hz,W,H-hz);
  for(let i=0;i<22;i++){const ph=((t/180)+i*.137)%1,ex=fx+Math.sin(i*2.1+t/40)*W*.12+(i%5-2)*W*.03,ey=hz-ph*hz*.7;g.fillStyle=`rgba(255,${120+(i%3)*40},60,${(1-ph)*.9})`;g.fillRect(ex|0,ey|0,1,1)}}
function drawTitle(){nightScene(g,VW,VH,animT)}
async function toTitle(){
  for(const k in BUI){if(BUI[k]&&BUI[k].remove)BUI[k].remove()}BUI={};
  UI.innerHTML='';dlgEl=null;handlers.length=0;handlers.push(fieldInput);uiCount=0;FD.busy=0;FD.fx=[];FD.map=null;B=null;
  MODE='title';AU.music('title');fadeEl.style.opacity=0;
  titleEl=el('div','',`<div class="logo"><small>THE LEGEND OF LIFT</small><b style="font-size:1.85rem">STRIKE AT NIGHT</b><em style="letter-spacing:.14em;font-size:.82rem">~ a second life ~</em></div><div class="press">PRESS START</div><div class="foot">A ZigaPlay cartridge</div>`);titleEl.id='title';UI.appendChild(titleEl);
  uiCount++;await new Promise(r=>{const off=pushInput(b=>{if(b==='a'||b==='start'){AU.unlock();AU.play('ok');off();r()}})});uiCount--;
  titleEl.querySelector('.press').remove();
  /* your saves may be on their way from your account */
  if(ZPC){const w=el('div','press','LOADING YOUR SAVES…');titleEl.appendChild(w);await Promise.race([CLOUD_PULL,sleep(7000)]);w.remove()}
  while(true){const has=[0,1,2,3].some(i=>loadSlot(i));
    const c=await listWin([{label:'New Game'},{label:'Continue',off:!has},{label:'Settings'}],{style:{left:'50%',transform:'translateX(-50%)',bottom:'18%',minWidth:'9rem'},start:has?1:0,cancel:false});
    if(c===0){titleEl.remove();await newGame();return}
    if(c===1){const ids=[0,1,2,3].filter(i=>loadSlot(i));const best=ids.reduce((b,i)=>(loadSlot(i).saved||0)>(loadSlot(b).saved||0)?i:b,ids[0]);
      const s=await listWin(ids.map(i=>slotLabel(i)),{title:'Continue',start:ids.indexOf(best),style:{left:'.4rem',right:'.4rem',bottom:'14%'}});if(s<0)continue;
      titleEl.remove();await continueGame(loadSlot(ids[s]));return}
    if(c===2){const tmp=S;S=S||newState();await menuSettings();S=tmp}}}
async function newGame(){S=newState4();applyLore();await fade(1,false,500);await runScript('r_outOfOffice')}
async function continueGame(data){S=data;applyLore();await fade(1,false,400);MODE='field';loadMap(S.map,S.x,S.y,S.dir);AU.music(musicFor(FD.map));await fade(0,false,500);mapToast(FD.map.name);
  if(S.lore===3&&S.map==='whiteforest'&&F('forest')&&!F('aster'))await STORY.paleWake()}
handlers.push(fieldInput);
requestAnimationFrame(loop);
// a hook for tests
window.__DM={get S(){return S},set S(v){S=v},newState4,FORMS,setForm,changeForm,raiseBounty,showPoster,FORM_ULTS,ULTS,FD,canEnter,saveGame,F,AU,MAPS,TILE,tileImg,personImg,LOOKS,monImg,ART,backdropImg,drawNum,btn,goto,loadMap,startBattle,STORY,runScript,newState,mkHero,toTitle,get MODE(){return MODE},set MODE(v){MODE=v},get B(){return B},toggleTide,healAll,SKILLS,ITEMS,partyHeroes,addItem,setF,F,stats,expFor,FOES,HEROES,join,newState2,newState3,applyLore,heroBig,applyCustom,CUSTOM,defaultCustom,get V(){return V}};
window.__DM.cartArt=()=>{const c=mk(288,192),x=c.getContext('2d');x.imageSmoothingEnabled=false;nightScene(x,288,192,40,150);
  // far back, by the burning village: the man in the hood, and his pale eyes
  const st=personImg(LOOKS.stranger,'down',0);x.save();x.filter='brightness(.45)';x.globalAlpha=.8;x.drawImage(st,118,112,24,36);x.restore();x.fillStyle='#e8f4ff';x.fillRect(125,126,2,1);x.fillRect(131,126,2,1);
  // a wanted poster nailed to a post
  x.fillStyle='#1a1008';x.fillRect(44,52,6,98);x.fillStyle='#2a1a0e';x.fillRect(45,52,2,98);
  const px=14,py=22,pw=66,ph=84;x.fillStyle='#2a1a0e';x.fillRect(px-2,py-2,pw+4,ph+4);const pg=x.createLinearGradient(0,py,0,py+ph);pg.addColorStop(0,'#ecdab0');pg.addColorStop(1,'#cdb27a');x.fillStyle=pg;x.fillRect(px,py,pw,ph);
  x.fillStyle='rgba(90,58,31,.25)';x.fillRect(px,py+ph-6,pw,6);x.fillRect(px+pw-5,py,5,ph);
  x.fillStyle='#3a1a0e';x.font='bold 14px monospace';x.textAlign='center';x.fillText('WANTED',px+pw/2,py+16);x.font='bold 6px monospace';x.fillStyle='#6a2a1a';x.fillText('DEAD OR ALIVE',px+pw/2,py+24);
  const keep=S;S=S||newState4();const f=posterFace();S=keep;x.fillStyle='#5a3a1f';x.fillRect(px+19,py+28,28,30);x.fillStyle='#e6d2a0';x.fillRect(px+20,py+29,26,28);x.drawImage(f,px+21,py+30,24,27);
  x.fillStyle='#3a1a0e';x.font='bold 7px monospace';x.fillText('LIFT',px+pw/2,py+67);x.fillStyle='#8a1a10';x.font='bold 9px monospace';x.fillText('300',px+pw/2,py+78);
  x.fillStyle='#8a8a9a';x.fillRect(px+pw/2-1,py-1,2,2);
  // Lift, up close
  const hb=heroBig(LOOKS.lift,'idle');x.save();x.translate(150+124,192-124);x.scale(-2,2);x.drawImage(hb,0,0);x.restore();
  const v=x.createLinearGradient(0,120,0,192);v.addColorStop(0,'rgba(3,4,14,0)');v.addColorStop(1,'rgba(3,4,14,.35)');x.fillStyle=v;x.fillRect(0,120,288,72);
  return c.toDataURL('image/png')};
toTitle();
window.__DM.start=async(data)=>{UI.innerHTML='';dlgEl=null;handlers.length=0;handlers.push(fieldInput);uiCount=0;FD.busy=0;fadeEl.style.opacity=0;S=data;applyLore();MODE='field';loadMap(S.map,S.x,S.y,S.dir);AU.music(musicFor(FD.map))};
