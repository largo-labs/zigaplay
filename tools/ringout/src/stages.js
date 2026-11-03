/* ================= stages =================
   Laid out on a 180 x 220 design screen; heights are scaled by VS to the real screen. The main stage is solid
   (land on it, bump into it); the small platforms can be jumped up through and dropped through (tap down twice). */
const STAGES=[
  {id:'sky',name:'SKY TEMPLE',main:{l:28,r:152,y:158,th:22},soft:[{l:42,r:78,y:120},{l:102,r:138,y:120},{l:72,r:108,y:84},{l:16,r:48,y:52},{l:132,r:164,y:52}],spawn:42,
   sky:['#5aa8ff','#bfe6ff'],top:'#7ad86a',side:'#c8b89a',dark:'#8a7a62',plank:'#e8dcc0'},
  {id:'bridge',name:'OLD BRIDGE',main:{l:14,r:166,y:162,th:12},soft:[{l:62,r:118,y:120},{l:20,r:56,y:84},{l:124,r:160,y:84},{l:70,r:110,y:50}],spawn:30,
   sky:['#ff8a5a','#ffd890'],top:'#b07a44',side:'#8a5a34',dark:'#5a3a1e',plank:'#c08a54'},
  {id:'lava',name:'LAVA PEAK',main:{l:36,r:144,y:156,th:30},soft:[{l:16,r:52,y:118},{l:128,r:164,y:118},{l:72,r:108,y:84},{l:24,r:56,y:52},{l:124,r:156,y:52}],spawn:40,
   sky:['#2a0c1a','#8a2a1a'],top:'#5a4a4a',side:'#3a2e30',dark:'#241c1e',plank:'#6a5a5a'},
  {id:'roof',name:'NEON ROOF',main:{l:22,r:158,y:160,th:22},soft:[{l:30,r:70,y:124},{l:110,r:150,y:124},{l:70,r:110,y:90},{l:24,r:60,y:56},{l:120,r:156,y:56}],spawn:30,
   sky:['#0c0a2a','#3a1a5a'],top:'#4a4a6a',side:'#2a2a44',dark:'#1a1a30',plank:'#ff5fd8'},
];
function buildStage(def){const sy=v=>Math.round(v*VS);
  const main={l:def.main.l,r:def.main.r,y:sy(def.main.y),th:def.main.th,soft:false,main:1};
  const plats=[main,...def.soft.map(p=>({l:p.l,r:p.r,y:sy(p.y),soft:true}))];
  const st={def,name:def.name,main,plats,spawnY:sy(def.spawn),bg:paintBg(def,main)};return st}
/* the background and the stage itself, painted once */
function paintBg(d,main){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,d.sky[0]);gr.addColorStop(1,d.sky[1]);g.fillStyle=gr;g.fillRect(0,0,W,H);
  let s=d.id.length*977;const r=()=>(s=(s*9301+49297)%233280)/233280;
  const disc=(x,y,rr,col)=>{g.fillStyle=col;for(let dy=-rr;dy<=rr;dy++){const w=Math.round(Math.sqrt(rr*rr-dy*dy));g.fillRect(x-w,y+dy,w*2,1)}};
  const hills=(base,amp,col,f,ph)=>{g.fillStyle=col;for(let x=0;x<W;x++){const h=Math.round(Math.sin(x/f+ph)*amp+Math.sin(x/(f*.37)+ph*2)*amp*.35);g.fillRect(x,base-h,1,H)}};
  if(d.id==='sky'){disc(140,Math.round(40*VS),12,'#fff6c8');for(let i=0;i<7;i++){const x=Math.floor(r()*W),y=Math.floor((20+r()*120)*VS);g.fillStyle='rgba(255,255,255,.8)';g.fillRect(x,y,26,6);g.fillRect(x+5,y-4,13,5)}
    hills(Math.round(200*VS),8,'#9ad0ff',30,1);g.fillStyle='#86c070';for(let i=0;i<3;i++){const x=15+i*64,y=Math.round((90+i*14)*VS);g.fillRect(x,y,22,5);g.fillStyle='#a88a62';g.fillRect(x+4,y+5,14,6);g.fillStyle='#86c070'}}
  if(d.id==='bridge'){disc(60,Math.round(70*VS),16,'#fff0b0');hills(Math.round(140*VS),14,'#c86a5a',24,0);hills(Math.round(165*VS),10,'#8a4a5a',18,2);
    g.fillStyle='#4a8ad8';g.fillRect(0,Math.round(200*VS),W,H);g.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<14;i++)g.fillRect(Math.floor(r()*W),Math.round((204+r()*14)*VS),6,1)}
  if(d.id==='lava'){for(let i=0;i<30;i++){g.fillStyle='rgba(255,180,120,'+(.2+r()*.4)+')';g.fillRect(Math.floor(r()*W),Math.floor(r()*120*VS),1,1)}
    g.fillStyle='#3a1a1a';g.beginPath();g.moveTo(10,H);g.lineTo(70,Math.round(70*VS));g.lineTo(110,Math.round(70*VS));g.lineTo(175,H);g.fill();g.fillStyle='#ff6a2a';g.fillRect(74,Math.round(68*VS),32,4);
    const lg=g.createLinearGradient(0,Math.round(190*VS),0,H);lg.addColorStop(0,'#ff8a2a');lg.addColorStop(1,'#ffd84a');g.fillStyle=lg;g.fillRect(0,Math.round(204*VS),W,H)}
  if(d.id==='roof'){disc(140,Math.round(36*VS),10,'#f4f0d8');disc(144,Math.round(33*VS),8,d.sky[0]);for(let i=0;i<40;i++){g.fillStyle='#ffffff';g.fillRect(Math.floor(r()*W),Math.floor(r()*100*VS),1,1)}
    for(let i=0;i<9;i++){const bw=14+Math.floor(r()*16),x=i*21-6,top=Math.round((110+r()*60)*VS);g.fillStyle='#1c1838';g.fillRect(x,top,bw,H);
      for(let wy=top+4;wy<H;wy+=7)for(let wx=x+3;wx<x+bw-3;wx+=5)if(r()<.45){g.fillStyle=r()<.7?'#ffd86a':'#6af0ff';g.fillRect(wx,wy,2,3)}}}
  /* the main stage */
  const top=main.y,bot=main.y+Math.round(main.th*VS),L=main.l,R=main.r;
  g.fillStyle=K;g.fillRect(L-1,top-1,R-L+2,bot-top+2);g.fillStyle=d.side;g.fillRect(L,top,R-L,bot-top);
  g.fillStyle=d.dark;for(let y=top+6;y<bot;y+=6)for(let x=L+((y/6)%2?0:5);x<R;x+=10)g.fillRect(x,y,1,5);g.fillRect(L,bot-2,R-L,2);
  g.fillStyle=d.top;g.fillRect(L,top,R-L,3);g.fillStyle=lt(d.top);g.fillRect(L,top,R-L,1);
  if(d.id==='sky'){g.fillStyle='#e8dcc0';for(const x of[L+6,R-12]){g.fillRect(x,top-26,6,26);g.fillStyle='#c8b89a';g.fillRect(x+4,top-26,2,26);g.fillStyle='#e8dcc0'}g.fillRect(L+3,top-29,12,3);g.fillRect(R-15,top-29,12,3)}
  if(d.id==='bridge'){g.fillStyle='#5a3a1e';for(let x=L;x<R;x+=8)g.fillRect(x,top+1,1,bot-top-1);g.strokeStyle='#d8b878';g.beginPath();g.moveTo(L,top-12);g.quadraticCurveTo((L+R)/2,top-2,R,top-12);g.stroke();
    g.fillStyle='#5a3a1e';g.fillRect(L-2,top-16,4,bot-top+16);g.fillRect(R-2,top-16,4,bot-top+16)}
  if(d.id==='lava'){g.fillStyle='#ff6a2a';for(let i=0;i<6;i++){const x=L+8+Math.floor(r()*(R-L-16));g.fillRect(x,top+8+Math.floor(r()*(bot-top-12)),1,4)}}
  if(d.id==='roof'){g.fillStyle='#ff5fd8';g.fillRect(L,top+2,R-L,1);g.fillStyle='#6af0ff';g.fillRect(L+20,top+8,30,6);g.fillStyle='#1a1a30';g.fillRect(L+22,top+9,26,4);g.fillStyle='#6af0ff';g.fillRect(L+24,top+10,4,2);g.fillRect(L+31,top+10,4,2);g.fillRect(L+38,top+10,6,2)}
  return c}
function drawSoftPlats(st,now){for(const p of st.plats){if(!p.soft)continue;const d=st.def,w=p.r-p.l;
  ctx.fillStyle=K;ctx.fillRect(p.l-1,p.y-1,w+2,5);ctx.fillStyle=d.plank;ctx.fillRect(p.l,p.y,w,3);ctx.fillStyle=lt(d.plank);ctx.fillRect(p.l,p.y,w,1);
  if(d.id==='roof'){ctx.fillStyle=Math.floor(now/400+p.l)%5?'#ff5fd8':'#ffb0f0';ctx.fillRect(p.l,p.y+3,w,1)}}}
function drawStageFx(st,now){if(st.def.id==='lava'){ctx.fillStyle='rgba(255,140,40,.5)';for(let i=0;i<6;i++){const x=(i*37+now/30)%W,y=H-((now/20+i*29)%(40*VS));ctx.fillRect(Math.round(x),Math.round(y),2,2)}}
  if(st.def.id==='sky'){ctx.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<3;i++){const x=((now/60+i*70)%(W+40))-30,y=Math.round((60+i*40)*VS);ctx.fillRect(Math.round(x),y,22,5);ctx.fillRect(Math.round(x)+5,y-3,11,3)}}}
