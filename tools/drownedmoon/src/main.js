/* ===================== TITLE & BOOT ===================== */
let titleEl=null;
function titleUpdate(){}
function drawTitle(){const W=VW,H=VH,t=animT;const hz=Math.round(H*.58);
  const sky=g.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#03061a');sky.addColorStop(1,'#1a2a5e');g.fillStyle=sky;g.fillRect(0,0,W,hz);
  const r=rng(7);for(let i=0;i<70;i++){const x=r()*W|0,y=r()*hz*.95|0,tw=(Math.sin(t/20+i)+1)/2;g.fillStyle=tw>.7?'#ffffff':tw>.3?'#9fb4e8':'#3a4a80';g.fillRect(x,y,1,1)}
  // Grey Rock and its light
  g.fillStyle='#0a0e22';g.beginPath();g.moveTo(W*.72,hz);g.lineTo(W*.78,hz-10);g.lineTo(W*.9,hz-12);g.lineTo(W*.97,hz);g.fill();
  g.fillRect(W*.83|0,hz-30,5,20);g.fillStyle=(t%120)<60?'#ffe08a':'#7a6a3a';g.fillRect(W*.83|0,hz-33,5,3);
  const sea=g.createLinearGradient(0,hz,0,H);sea.addColorStop(0,'#10245a');sea.addColorStop(1,'#030818');g.fillStyle=sea;g.fillRect(0,hz,W,H-hz);
  // the drowned moon glowing under the water
  const mx=W*.42,my=hz+(H-hz)*.55,gr=g.createRadialGradient(mx,my,2,mx,my,70);gr.addColorStop(0,'rgba(220,240,255,.85)');gr.addColorStop(.25,'rgba(160,210,255,.45)');gr.addColorStop(1,'rgba(40,80,160,0)');
  g.fillStyle=gr;g.fillRect(0,hz,W,H-hz);g.fillStyle='rgba(235,245,255,.9)';g.beginPath();g.ellipse(mx,my,18,13,0,0,Math.PI*2);g.fill();
  for(let y=hz+2;y<H;y+=3){const n=8;for(let i=0;i<n;i++){const x=((i*41+y*7+t*(y>my?.2:.35))%(W+20))-10;g.fillStyle=Math.abs(x-mx)<24&&y<my?'rgba(230,246,255,.7)':'rgba(120,170,240,.35)';g.fillRect(x|0,y,5,1)}}
  g.fillStyle='rgba(230,246,255,.5)';for(let x=0;x<W;x+=2)g.fillRect(x,hz+Math.round(Math.sin(x/9+t/18)),2,1)}
async function toTitle(){
  for(const k in BUI){if(BUI[k]&&BUI[k].remove)BUI[k].remove()}BUI={};
  UI.innerHTML='';dlgEl=null;handlers.length=0;handlers.push(fieldInput);uiCount=0;FD.busy=0;FD.fx=[];FD.map=null;B=null;
  MODE='title';AU.music('title');fadeEl.style.opacity=0;
  titleEl=el('div','',`<div class="logo"><small>TIDES OF THE</small><b>DROWNED MOON</b><em>~ a tide-calling tale ~</em></div><div class="press">PRESS START</div><div class="foot">A ZigaPlay cartridge</div>`);titleEl.id='title';UI.appendChild(titleEl);
  uiCount++;await new Promise(r=>{const off=pushInput(b=>{if(b==='a'||b==='start'){AU.unlock();AU.play('ok');off();r()}})});uiCount--;
  titleEl.querySelector('.press').remove();
  while(true){const has=[0,1,2,3].some(i=>loadSlot(i));
    const c=await listWin([{label:'New Game'},{label:'Continue',off:!has},{label:'Settings'}],{style:{left:'50%',transform:'translateX(-50%)',bottom:'18%',minWidth:'9rem'},start:has?1:0,cancel:false});
    if(c===0){titleEl.remove();await newGame();return}
    if(c===1){const ids=[0,1,2,3].filter(i=>loadSlot(i));const best=ids.reduce((b,i)=>(loadSlot(i).saved||0)>(loadSlot(b).saved||0)?i:b,ids[0]);
      const s=await listWin(ids.map(i=>slotLabel(i)),{title:'Continue',start:ids.indexOf(best),style:{left:'.4rem',right:'.4rem',bottom:'14%'}});if(s<0)continue;
      titleEl.remove();await continueGame(loadSlot(ids[s]));return}
    if(c===2){const tmp=S;S=S||newState();await menuSettings();S=tmp}}}
async function newGame(){S=newState();await fade(1,false,500);await runScript('intro')}
async function continueGame(data){S=data;await fade(1,false,400);MODE='field';loadMap(S.map,S.x,S.y,S.dir);AU.music(musicFor(FD.map));await fade(0,false,500);mapToast(FD.map.name)}
handlers.push(fieldInput);
requestAnimationFrame(loop);
// a hook for tests
window.__DM={get S(){return S},set S(v){S=v},FD,MAPS,TILE,tileImg,personImg,LOOKS,monImg,ART,backdropImg,drawNum,btn,goto,loadMap,startBattle,STORY,runScript,newState,mkHero,toTitle,get MODE(){return MODE},set MODE(v){MODE=v},get B(){return B},toggleTide,healAll,SKILLS,ITEMS,partyHeroes,addItem,setF,F,stats,expFor,FOES,HEROES,join};
toTitle();
window.__DM.start=async(data)=>{UI.innerHTML='';dlgEl=null;handlers.length=0;handlers.push(fieldInput);uiCount=0;FD.busy=0;fadeEl.style.opacity=0;S=data;MODE='field';loadMap(S.map,S.x,S.y,S.dir);AU.music(musicFor(FD.map))};
