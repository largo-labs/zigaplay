/* ================= drawing a fight ================= */
POSES.idle2={lean:0,aF:28,aB:-17,lF:6,lB:-6,bob:1};
function fighterPose(f){const m=f.mv;
  switch(f.st){
  case'ground':if(f.run&&Math.abs(f.vx)>.5)return walkPose(f.anim,true);if(Math.abs(f.vx)>.25)return walkPose(f.anim,false);return Math.floor(f.anim/28)%2?POSES.idle2:POSES.idle;
  case'jsq':case'land':case'climb':return POSES.crouch;
  case'air':return f.vy<0?POSES.jump:POSES.fall;
  case'attack':return POSES[m.def.pose]||POSES.idle;
  case'special':{const p=m.def.pose;return POSES[typeof p==='function'?p(m):p]||POSES.cast}
  case'dodge':case'adodge':return POSES.dodge;
  case'hurt':return f.tumble?POSES.tumble:POSES.hurt;
  case'helpless':return POSES.helpless;
  case'stagger':case'grabbed':return POSES.hurt;
  default:return POSES.idle}}
const TAGC=['#ff5f6a','#6ab8ff'];
function drawFighter(f,now){if(f.dead)return;const m=f.mv;
  if(m&&m.def.hidden&&m.def.hidden(m))return;
  if(f.halo){ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(f.halo.l+2,f.halo.y,f.halo.r-f.halo.l-4,2);ctx.fillStyle=f.ch.fx;ctx.fillRect(f.halo.l+4,f.halo.y+2,f.halo.r-f.halo.l-8,1)}
  /* the shadow on whatever is below */
  const pl=platUnder(f.x,f.y);if(pl){const d=clamp((pl.y-f.y)/80,0,1),w=Math.round(12-8*d);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(Math.round(f.x-w/2),pl.y-1,w,2)}
  let face=f.face,rot=0,alpha=null,flash=0,col='#ffffff';
  if(f.st==='hurt'&&f.tumble)rot=f.anim*.35*f.face;
  if(m&&m.def.spin&&(f.st==='attack'||f.st==='special'))face=Math.floor(f.anim/3)%2?f.face:-f.face;
  if(m&&m.def.kind==='normal'&&m.def.spin&&!(m.f>=m.def.s&&m.f<m.def.s+m.def.a))face=f.face;
  if(f.st==='dodge'||f.st==='adodge')alpha=f.inv>0?.45:.85;
  if(f.inv>0&&(f.st==='respawn'||f.st==='air'&&f.t<60))alpha=Math.floor(now/80)%2?.55:.9;
  if(f.flash>0){flash=.75}
  if(f.st==='stagger'){flash=Math.floor(f.t/4)%2?.6:0;col='#ffd84a'}
  if(m&&m.window){flash=.35+Math.sin(f.t*.6)*.2}
  drawPuppet(f.ch,fighterPose(f),f.x,f.y,face,f.anim,{rot,alpha,flash,flashCol:col});
  if(m){if(m.def.draw)m.def.draw(f,m);if(m.def.aura){const a=m.def.aura(f,m);if(a){const ax=f.x+(a.front?f.face*10:0),ay=f.y-12;ctx.globalAlpha=.55+Math.sin(now/60)*.25;circle(ax,ay,a.r+1,a.col);ctx.globalAlpha=1;circle(ax,ay,Math.max(1,a.r-1),WH)}}
    if(m.def.kind==='normal'&&m.f>=m.def.s&&m.f<m.def.s+m.def.a)swoosh(f,m)}
  if(f.st==='stagger'){for(let i=0;i<3;i++){const a=now/150+i*2.1;ctx.fillStyle='#ffd84a';ctx.fillRect(Math.round(f.x+Math.cos(a)*8),Math.round(f.y-f.h-3+Math.sin(a)*2),2,2)}}
  /* who is who: a little tag over the head */
  const tg=f.cpu?'CPU':'P1',ty=Math.round(f.y-f.h-12);if(ty>-4){txt(tg,Math.round(f.x),ty,TAGC[f.slot],1,'c',K);ctx.fillStyle=TAGC[f.slot];ctx.fillRect(Math.round(f.x)-1,ty+8,3,1)}}
function circle(x,y,r,c){ctx.fillStyle=c;for(let dy=-Math.ceil(r);dy<=Math.ceil(r);dy++){const w=Math.sqrt(Math.max(0,r*r-dy*dy));if(w<.5)continue;ctx.fillRect(Math.round(x-w),Math.round(y+dy),Math.round(w*2),1)}}
/* the swish of an A attack */
function swoosh(f,m){const b=m.def.hb[0],x=f.x+f.face*b.x,y=f.y+b.y,st=m.def.fx,k=(m.f-m.def.s)/m.def.a;
  ctx.globalAlpha=.75-k*.4;
  if(st==='slash'){ctx.strokeStyle=f.ch.fx;ctx.lineWidth=2;ctx.beginPath();const a0=f.face>0?-1.2:Math.PI+1.2,a1=f.face>0?1.2:Math.PI-1.2;ctx.arc(f.x+f.face*2,y,Math.max(6,Math.abs(b.x)+b.w/2-4),Math.min(a0,a1),Math.max(a0,a1));ctx.stroke();ctx.strokeStyle=WH;ctx.lineWidth=1;ctx.stroke()}
  else if(st==='spark'){ctx.fillStyle=f.ch.fx;for(let i=0;i<5;i++){const a=i*1.26+m.f;ctx.fillRect(Math.round(x+Math.cos(a)*b.w*.35),Math.round(y+Math.sin(a)*b.h*.35),2,2)}}
  else{ctx.fillStyle=WH;const r=Math.min(b.w,b.h)*.35;ctx.fillRect(Math.round(x-r),Math.round(y),Math.round(r*2),1);ctx.fillRect(Math.round(x),Math.round(y-r),1,Math.round(r*2))}
  ctx.globalAlpha=1}
function drawProj(p,now){const x=Math.round(p.x),y=Math.round(p.y),c=p.own.ch.fx;
  switch(p.kind){
  case'fire':circle(x,y,3.2,'#ff6a2a');circle(x+(p.vx>0?1:-1),y,1.8,'#ffd84a');if(p.t%2)fx({x:p.x,y:p.y,vx:-p.vx*.2,vy:-.2,life:8,c:'#ff8a3a',s:1});break;
  case'star':{const r=p.w/2;ctx.save();ctx.translate(x,y);ctx.rotate(p.t*.4);ctx.fillStyle=K;ctx.fillRect(-r-1,-1.5,r*2+2,3);ctx.fillRect(-1.5,-r-1,3,r*2+2);ctx.fillStyle=c;ctx.fillRect(-r,-.5,r*2,1.5);ctx.fillRect(-.5,-r,1.5,r*2);ctx.restore();circle(x,y,Math.max(1,r*.35),WH);break}
  case'ice':ctx.fillStyle=K;ctx.fillRect(x-4,y-2,9,4);ctx.fillStyle='#bff4ff';ctx.fillRect(x-3,y-1,7,2);ctx.fillStyle=WH;ctx.fillRect(x+(p.vx>0?2:-3),y-1,2,1);break;
  case'bubble':ctx.strokeStyle='#bff4ff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,p.w/2,0,7);ctx.stroke();ctx.fillStyle='rgba(138,216,255,.35)';ctx.beginPath();ctx.arc(x,y,p.w/2-1,0,7);ctx.fill();ctx.fillStyle=WH;ctx.fillRect(x-2,y-3,2,2);break;
  case'boomer':{const s=p.t%8<4;ctx.fillStyle=K;ctx.fillRect(x-5,y-(s?2:3),10,s?4:6);ctx.fillStyle=c;ctx.fillRect(x-4,y-(s?1:2),8,s?2:4);break}
  case'bomb':circle(x,y,4,K);circle(x,y,3,'#3a3a4a');ctx.fillStyle=WH;ctx.fillRect(x-2,y-2,1,1);ctx.fillStyle=p.t%6<3?'#ffd84a':'#ff5f3a';ctx.fillRect(x+1,y-5,2,2);break;
  case'mine':{ctx.fillStyle=K;ctx.fillRect(x-4,y-2,8,4);ctx.fillStyle=c;ctx.fillRect(x-3,y-1,6,2);const armed=p.t>=p.arm;ctx.fillStyle=armed?(Math.floor(now/150)%2?'#ff3a3a':'#ffd84a'):'#888';ctx.fillRect(x-1,y-3,2,1);break}
  case'wave':{for(let i=0;i<3;i++){const hh=4+((p.t+i*3)%6);ctx.fillStyle=i===1?WH:c;ctx.fillRect(x-4+i*3,Math.round(p.y+5-hh),3,hh)}break}
  default:circle(x,y,3,c)}}
function drawFx(now){for(const p of G.parts){if(p.spark){const r=p.spark*3+(6-p.life%6);ctx.fillStyle=WH;ctx.fillRect(Math.round(p.x-r),Math.round(p.y),Math.round(r*2),1);ctx.fillRect(Math.round(p.x),Math.round(p.y-r),1,Math.round(r*2));ctx.fillStyle=p.c;ctx.fillRect(Math.round(p.x-r/2),Math.round(p.y-r/2),Math.round(r),Math.round(r));continue}
    if(p.spring){ctx.fillStyle='#9aa0b0';for(let i=0;i<3;i++)ctx.fillRect(Math.round(p.x-4),Math.round(p.y-2-i*2),8,1);continue}
    ctx.globalAlpha=clamp(p.life/10,0,1);ctx.fillStyle=p.c;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s)}ctx.globalAlpha=1;
  for(const b of G.blasts){circle(b.x,b.y,b.r*(1-b.life/8)+4,'#ffd84a');circle(b.x,b.y,b.r*(1-b.life/8),'#ffffff')}
  for(const t of G.texts){ctx.globalAlpha=clamp(t.life/15,0,1);txt(t.s,Math.round(t.x),Math.round(t.y),t.c,1,'c',K)}ctx.globalAlpha=1}
/* the KO flash: a beam of light from where the fighter flew out */
function drawKoBeam(){const b=G.kobeam;if(!b)return;ctx.save();ctx.globalAlpha=b.t/24*.8;ctx.strokeStyle=b.c;ctx.lineWidth=10*b.t/24+2;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+(W/2-b.x)*.7,b.y+(H/2-b.y)*.7);ctx.stroke();ctx.strokeStyle=WH;ctx.lineWidth=3*b.t/24+1;ctx.stroke();ctx.restore()}
/* fighters above the top of the screen show in a little bubble */
function drawOffscreen(f){if(f.dead||f.y>-2)return;const x=clamp(Math.round(f.x),10,W-10);circle(x,10,8,K);circle(x,10,7,'#ffffff');
  const c=portrait(f.ch);ctx.drawImage(c,OX-8,OY-26,16,16,x-6,3,12,12);ctx.fillStyle=TAGC[f.slot];ctx.fillRect(x-2,19,5,2)}
/* ---------- the damage panels at the bottom ---------- */
function pctColor(p){return p<40?mix('#ffffff','#ffe066',p/40):p<90?mix('#ffe066','#ff8a3a',(p-40)/50):p<150?mix('#ff8a3a','#ff3a3a',(p-90)/60):mix('#ff3a3a','#a01020',clamp((p-150)/100,0,1))}
function drawHud(now){const y0=H-30;ctx.fillStyle='rgba(10,6,24,.72)';ctx.fillRect(0,y0-2,W,32);
  G.fighters.forEach((f,i)=>{const x0=2+i*90,w=86;ctx.fillStyle=TAGC[i];ctx.fillRect(x0,y0,w,1);
    const c=portrait(f.ch);ctx.save();ctx.beginPath();ctx.rect(x0,y0+2,24,26);ctx.clip();ctx.drawImage(c,x0+12-OX,y0+2+30-OY);ctx.restore();
    txt(f.ch.name,x0+26,y0+2,TAGC[i]);
    const p=Math.floor(f.pct),jig=f.flash>0?Math.round((rnd()-.5)*3):0,s=(f.dead?'':p)+(f.dead?'--':'%');
    txt(s,x0+w-1+jig,y0+10+(f.flash>0?Math.round((rnd()-.5)*2):0),f.dead?'#888':pctColor(p),2,'r',K);
    for(let k=0;k<f.stocks;k++){const sx=x0+29+k*7,sy=y0+26;circle(sx,sy,2.8,K);circle(sx,sy,2.1,f.ch.skin);ctx.fillStyle=f.ch.suit;ctx.fillRect(sx-1,sy+1,3,1)}})}
