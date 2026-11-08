/* ================= the venues =================
   Each venue's backdrop: the walls, the crowd and the lights behind the ring. stage.js raises it behind a side
   view of the ring. Also the hit effects and the portrait buffer. */
const RING=()=>({cx:BW/2,ft:BH-138,pl:BW/2-104,pr:BW/2+104});
function hash(i){const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function crowd(y,rows,cols,t,flash=0,dens=1){const W=BW;for(let r=0;r<rows;r++){const yy=y-r*7,n=Math.ceil(W/(6-r*.5)*dens);for(let i=0;i<n;i++){const x=(i+(r%2)*.5)*(W/n)+hash(i+r*91)*2-1,c=cols[(i+r)%cols.length],bob=Math.sin(t*3+i*1.7+r)*.6;
  E(x,yy+5+bob,3.2-r*.3,3,shade(c,-.25-r*.08));E(x,yy+bob,2.1-r*.2,2.2-r*.2,shade(c,-.1-r*.08))}}
  if(flash)for(let i=0;i<flash;i++){const k=Math.floor(t*6)+i*13;if(hash(k)>.55){const x=hash(k*3.1)*W,yy=y-hash(k*7.7)*rows*7;E(x,yy,2,2,'#fff');E(x,yy,4,4,'rgba(255,255,255,.25)')}}}
function lightCone(x,y,w,h,col,a=.12){const g=G.createLinearGradient(0,y,0,y+h);g.addColorStop(0,col.replace('A',a));g.addColorStop(1,col.replace('A',0));G.fillStyle=g;G.beginPath();G.moveTo(x-3,y);G.lineTo(x+3,y);G.lineTo(x+w,y+h);G.lineTo(x-w,y+h);G.closePath();G.fill()}
function grad(y0,y1,stops){const g=G.createLinearGradient(0,y0,0,y1);stops.forEach((c,i)=>g.addColorStop(i/(stops.length-1),c));G.fillStyle=g;G.fillRect(0,y0,BW,y1-y0)}
function drawVenue(id,t){const{cx,ft}=RING();
  if(id==='gym'){RC(0,0,BW,ft+4,'#5a3328');for(let y=0;y<ft;y+=6){const off=(y/6)%2?6:0;RC(0,y,BW,1,'#3a231c');for(let x=-off;x<BW;x+=12)RC(x,y,1,6,'#3a231c')}
    G.globalAlpha=.25;for(let i=0;i<40;i++)RC(hash(i)*BW,hash(i+9)*ft,10,5,'#6a4234');G.globalAlpha=1;
    for(const s of[-1,1]){const x=cx+s*(BW*.5-14);LN(x,0,x,ft-70,1,'#2a2a2a');EO(x,ft-52,10,20,'#7a2a24');RC(x-10,ft-60,20,3,'#5a1c18')}
    /* the gym clock */
    EO(cx,ft-84,11,11,'#2a2a30');E(cx,ft-84,9,9,'#f4efe2');for(let i=0;i<12;i++){const k=i/12*TAU;E(cx+Math.cos(k)*7.4,ft-84+Math.sin(k)*7.4,.6,.6,INK)}
    {const m=t/60*TAU,h=t/720*TAU;LN(cx,ft-84,cx+Math.sin(h)*4.5,ft-84-Math.cos(h)*4.5,1.4,INK);LN(cx,ft-84,cx+Math.sin(m)*7,ft-84-Math.cos(m)*7,.9,INK);LN(cx,ft-84,cx+Math.sin(t*TAU/2)*7,ft-84-Math.cos(t*TAU/2)*7,.5,'#c8263a')}
    RC(cx-38,ft-62,76,13,OUT);RC(cx-37,ft-61,74,11,'#1d3a6a');RC(cx-37,ft-61,74,1,'#f2c14e');RC(cx-37,ft-51,74,1,'#f2c14e');for(let i=0;i<9;i++)RC(cx-31+i*7,ft-58,4,5,'#f2c14e');
    for(const s of[-1,1]){const x=cx+s*40;LN(x,0,x,10,1,'#222');E(x,12,3,3,'#fff6c8');lightCone(x,12,34,ft,'rgba(255,240,180,A)',.16)}
    tag(10,ft-32,'#3ee8ff',2);tag(BW-36,ft-40,'#ff3ea5',5,26);crowd(ft-6,1,['#3a3a4a','#5a3a2a','#2a3a2a'],t,0,.45)}
  else if(id==='pier'){grad(0,ft,['#07091e','#1a1d48','#3a2a5a']);for(let i=0;i<50;i++)RC(hash(i)*BW,hash(i+5)*ft*.6,1,1,hash(i+2)>.5?'#fff':'#9ab');
    EO(cx+BW*.28,26,11,11,'#f4f0d8',.6);E(cx+BW*.28+3,24,9,9,'#e8e2c4');
    RC(0,ft-46,BW,46,'#0c1a34');for(let i=0;i<14;i++){const y=ft-44+i*3,w=6+i*1.6;G.globalAlpha=.4+.3*Math.sin(t*2+i);RC(cx+BW*.28-w/2+Math.sin(t*1.5+i)*3,y,w,1,'#e8e2c4');G.globalAlpha=1}
    for(let k=0;k<2;k++){const y0=18+k*16;G.strokeStyle='#2a2030';G.lineWidth=1;G.beginPath();for(let x=0;x<=BW;x+=4){const y=y0+Math.sin(x/BW*Math.PI)*14;x?G.lineTo(x,y):G.moveTo(x,y)}G.stroke();
      for(let x=6;x<BW;x+=12){const y=y0+Math.sin(x/BW*Math.PI)*14+2,c=['#ff5a4a','#ffd04a','#5ae0ff','#7aff8a'][(x/12+k)%4|0];G.globalAlpha=.25;E(x,y,4.5,4.5,c);G.globalAlpha=1;E(x,y,2,2.4,c)}}
    for(let i=0;i<3;i++){const x=(t*14+i*70)%(BW+40)-20,y=40+i*9+Math.sin(t*3+i)*3;LN(x-3,y,x,y+2,1,'#ddd');LN(x,y+2,x+3,y,1,'#ddd')}
    RC(0,ft-14,BW,14,'#3a2a20');for(let x=0;x<BW;x+=9)RC(x,ft-14,1,14,'#2a1c14');
    crowd(ft-8,2,['#3a4a6a','#5a3a4a','#4a5a3a','#6a5a3a'],t,0,.8)}
  else if(id==='chapel'){RC(0,0,BW,ft,'#2e1c14');for(let x=0;x<BW;x+=14)RC(x,0,2,ft,'#24150e');RC(0,10,BW,5,'#1c100a');
    const ww=46,wh=78,wx=cx-ww/2,wy=ft-wh-36;EO(cx,wy+12,ww/2+3,14,'#1a0e0a');RC(wx-3,wy+12,ww+6,wh,'#1a0e0a');
    G.save();G.beginPath();G.ellipse(cx,wy+12,ww/2,12,0,Math.PI,TAU);G.rect(wx,wy+12,ww,wh-4);G.clip();
    const cols=['#c8263a','#2a5ac8','#e8b62c','#3aa04a','#8a3ac8','#e86a2a'];for(let y=wy-2;y<wy+wh;y+=8)for(let x=wx;x<wx+ww;x+=8)RC(x,y,8,8,cols[(Math.floor(x/8)*3+Math.floor(y/8)*5)%6]);
    G.globalAlpha=.25+.08*Math.sin(t*.8);RC(wx,wy-2,ww,wh,'#fff4c8');G.globalAlpha=1;for(let y=wy-2;y<wy+wh;y+=8)RC(wx,y,ww,1,'#1a0e0a');for(let x=wx;x<wx+ww;x+=8)RC(x,wy-2,1,wh,'#1a0e0a');G.restore();
    lightCone(cx,wy+30,60,ft-wy,'rgba(255,220,160,A)',.14);
    for(const s of[-1,1])for(let i=0;i<3;i++){const x=cx+s*(40+i*14),y=ft-20-i*3;RC(x-1.5,y,3,9,'#efe4c8');const f=Math.sin(t*9+i*2+s)*.6;E(x+f*.5,y-2,1.5,3+f,'#ffd04a');E(x,y-6,6,6,'rgba(255,200,90,.12)')}
    crowd(ft-6,1,['#3a2a2a','#2a2a3a','#4a3a2a'],t,0,.6)}
  else if(id==='ice'){grad(0,ft,['#6a8ea8','#a8c8dc','#cfe2ee']);for(let x=0;x<BW;x+=20)RC(x,0,1,ft,'#8fb0c6');
    for(const s of[-1,1])for(let r=0;r<5;r++)for(let c=0;c<2;c++){const x=s<0?4+c*16+(r%2)*6:BW-20-c*16-(r%2)*6,y=ft-12-r*11;RC(x,y,15,10,OUT);RC(x+1,y+1,13,8,'#d8f0fc');RC(x+2,y+2,5,2,'#fff')}
    for(const s of[-1,1]){const x=cx+s*38;RC(x-12,8,24,3,'#e8f6ff');lightCone(x,11,30,ft,'rgba(220,245,255,A)',.18)}
    G.globalAlpha=.6;for(let i=0;i<24;i++){const x=hash(i)*BW,y=hash(i+3)*ft;if((t*2+i)%3<1.5)RC(x,y,1,1,'#fff')}G.globalAlpha=1;
    crowd(ft-6,1,['#3a4a5a','#4a5a6a','#2a3a4a'],t,0,.5);G.globalAlpha=.25;for(let i=0;i<5;i++)E((t*8+i*50)%(BW+60)-30,ft-6,30,6,'#fff');G.globalAlpha=1}
  else if(id==='roof'){grad(0,ft,['#0b0616','#1e0e2c','#3a1838']);
    for(let i=0;i<12;i++){const w=14+hash(i)*20,h=30+hash(i+1)*60,x=i*(BW/10)-10;RC(x,ft-h,w,h,'#140c1e');for(let y=ft-h+4;y<ft-4;y+=5)for(let xx=x+3;xx<x+w-3;xx+=5)if(hash(xx*3+y)>.6)RC(xx,y,2,2,hash(xx+y)>.5?'#ffd27a':'#7ad8ff')}
    const neon=(x,y,w,h,c,on)=>{G.globalAlpha=on?1:.35;G.strokeStyle=c;G.lineWidth=2;G.strokeRect(x,y,w,h);G.globalAlpha=on?.18:.05;RC(x-4,y-4,w+8,h+8,c);G.globalAlpha=1};
    neon(cx-50,ft-92,40,14,'#ff3ea5',Math.sin(t*5)>-.7);neon(cx+14,ft-80,34,20,'#3ee8ff',true);for(let i=0;i<4;i++)E(cx-44+i*9,ft-85,2,2,'#ff7ac8');LN(cx+20,ft-70,cx+42,ft-70,2,'#3ee8ff');
    tag(12,ft-22,'#ffd84a',7);crowd(ft-6,1,['#2a1a3a','#3a1a2a','#1a1a3a'],t,0,.5)}
  else if(id==='dock'){grad(0,ft,['#3a1a4a','#c84a3a','#f0a03a']);EO(cx-BW*.22,ft-58,16,16,'#ffd47a',.4);
    for(const s of[-1,1]){const x=cx+s*(BW*.32);LN(x,ft,x,10,4,'#1a1018');LN(x,14,x-s*50,14,3,'#1a1018');for(let i=0;i<6;i++)LN(x-s*i*8,14,x-s*(i+1)*8,20,1,'#1a1018');LN(x-s*40,14,x-s*40,40+Math.sin(t)*2,1,'#1a1018');RC(x-s*40-4,40+Math.sin(t)*2,8,6,'#1a1018')}
    PL([BW*.55,ft-8,BW+10,ft-70,BW+10,ft,BW*.6,ft],'#4a1a18');RC(BW*.6,ft-30,BW,4,'#2a0e0c');for(let i=0;i<4;i++)EO(BW*.68+i*14,ft-40-i*6,2.5,2.5,'#f0c060',.6);
    for(let i=0;i<8;i++){const k=Math.floor(t*12)+i;if(hash(k)>.5){const x=BW*.7+hash(k*2)*20,y=ft-50+hash(k*5)*20;RC(x,y,1,1,'#fff6a0');RC(x+hash(k)*4-2,y+2,1,1,'#ffa040')}}
    tag(BW*.62,ft-18,'#3ee8ff',4);crowd(ft-6,2,['#4a3a2a','#3a2a2a','#5a4a3a'],t,0,.7)}
  else if(id==='crown'){RC(0,0,BW,ft,'#0c0818');crowd(ft-8,6,['#3a2a5a','#2a2a4a','#4a2a3a','#2a3a4a'],t,6,1);
    RC(cx-34,6,68,26,OUT);RC(cx-33,7,66,24,'#1a1430');PL([cx-12,26,cx-12,14,cx-6,20,cx,12,cx+6,20,cx+12,14,cx+12,26],'#e5bd4f');
    for(let i=0;i<3;i++){const x=BW*(.2+i*.3)+Math.sin(t*.7+i*2)*20;lightCone(x,0,26,ft+60,'rgba(255,255,230,A)',.12)}}}
function tag(x,y,c,sd,w=22){G.save();G.lineCap='round';G.lineJoin='round';G.beginPath();for(let i=0;i<9;i++){const px=x+i*w/8,py=y+Math.sin(sd+i*1.7)*4-(i%3===1?4:0);i?G.lineTo(px,py):G.moveTo(px,py)}
  G.lineWidth=4.2;G.strokeStyle=INK;G.stroke();G.lineWidth=2.4;G.strokeStyle=c;G.stroke();G.restore()}
function rain(t){G.globalAlpha=.45;G.strokeStyle='#9ad8ff';G.lineWidth=1;G.beginPath();for(let i=0;i<70;i++){const x=(hash(i)*BW*1.3+t*60)%(BW*1.3)-BW*.15,y=(hash(i+9)*BH+t*260)%BH;G.moveTo(x,y);G.lineTo(x-3,y+8)}G.stroke();G.globalAlpha=1}

/* ---------- effects in the ring (ring pixels) ---------- */
const FX=[];
function fx(k,x,y,o={}){FX.push(Object.assign({k,x,y,t:0,life:.5,vx:0,vy:0},o))}
function burst(x,y,n,col,sp=60){for(let i=0;i<n;i++){const a=rnd()*TAU,v=sp*(.4+rnd()*.8);fx('dot',x,y,{vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,life:.35+rnd()*.3,c:col})}}
function fxTick(dt){for(const f of FX){f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=140*dt}for(let i=FX.length-1;i>=0;i--)if(FX[i].t>=FX[i].life)FX.splice(i,1)}
function drawFxRing(){for(const f of FX){const k=f.t/f.life;
  if(f.k==='dot'){G.globalAlpha=1-k;RC(f.x,f.y,2,2,f.c)}
  else if(f.k==='star'){G.globalAlpha=1-k;const r=(f.r||12)*(.5+k);G.strokeStyle=f.c||'#fff';G.lineWidth=2;G.beginPath();for(let i=0;i<8;i++){const a=i*TAU/8+f.x;G.moveTo(f.x+Math.cos(a)*r*.4,f.y+Math.sin(a)*r*.4);G.lineTo(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r)}G.stroke()}
  else if(f.k==='ring'){G.globalAlpha=1-k;ARC(f.x,f.y,(f.r||10)*(.3+k*1.2),0,TAU,2,f.c||'#fff')}
  else if(f.k==='whiff'){G.globalAlpha=(1-k)*.6;ARC(f.x,f.y,14+k*10,f.a0,f.a1,3,'#fff')}
  else if(f.k==='splash'){const g=Math.min(1,k*5),r=(f.r||14)*(.4+.6*g)*(1+k*.15),sd=f.seed||1;G.globalAlpha=k>.6?(1-k)/.4:1;
    G.beginPath();for(let i=0;i<=16;i++){const a=i/16*TAU,rr_=r*(i%2?.55:1)*(.75+.5*hash(sd*31+i));i?G.lineTo(f.x+Math.cos(a)*rr_,f.y+Math.sin(a)*rr_):G.moveTo(f.x+Math.cos(a)*rr_,f.y+Math.sin(a)*rr_)}G.closePath();
    G.fillStyle=f.c;G.fill();G.lineWidth=1.8;G.strokeStyle=INK;G.lineJoin='round';G.stroke();E(f.x,f.y,r*.32,r*.3,f.c2||'#fff');
    for(let i=0;i<5;i++){const a=hash(sd*7+i)*TAU,d=r*(1.1+hash(sd+i*3)*.6+k*.6);EO(f.x+Math.cos(a)*d,f.y+Math.sin(a)*d,r*.1+1,r*.1+1,f.c,.6)}}}G.globalAlpha=1}

/* ---------- portraits: a small buffer scaled up ---------- */
const PB=document.createElement('canvas');PB.width=PB.height=288;const pbx=PB.getContext('2d');
function portrait(id,ex,x,y,size,bg,o={}){G=pbx;pbx.setTransform(4,0,0,4,0,0);pbx.clearRect(0,0,72,72);
  if(bg){pbx.fillStyle=bg;pbx.fillRect(0,0,72,72);G.globalAlpha=.18;for(let i=-72;i<72;i+=7)LN(i,72,i+72,0,2.4,'#fff');G.globalAlpha=1}drawBust(id,36,52,1.55,ex,o);G=bx;
  ctx.imageSmoothingEnabled=true;ctx.drawImage(PB,x,y,size,size)}

/* ---------- putting the ring together and onto the screen ---------- */
function blit(sx=0,sy=0){ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(BUF,Math.round(sx*PS*DPR),Math.round(sy*PS*DPR))}
