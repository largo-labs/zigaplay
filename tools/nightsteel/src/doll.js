/* ================= the paper doll: one rig, every item drawn onto it in layers =================
   A character is drawn into a 64x64 buffer facing right, feet on y=60. The rig gives the head, torso, arms and
   legs for a pose; each wardrobe layer is drawn from that, so every item fits every pose. */
const DYES=[
 ['Crimson','#c8283c'],['Red','#e24a4a'],['Rose','#f07a8a'],['Maroon','#7a1e2e'],['Blood','#8a0e1e'],
 ['Orange','#f08a2a'],['Amber','#f4b030'],['Rust','#b4581e'],['Ginger','#d0662a'],['Peach','#ffb890'],
 ['Gold','#f2c84a'],['Lemon','#f8e870'],['Blonde','#f0d27a'],['Mustard','#c8a030'],['Cream','#fff0c8'],
 ['Lime','#9ae050'],['Green','#4ab048'],['Forest','#2a7a3a'],['Olive','#7a8a3a'],['Mint','#9ae8c0'],['Teal','#2aa898'],
 ['Sky','#78c8f8'],['Azure','#3a8ae8'],['Royal','#2a50c0'],['Navy','#1e2a6a'],['Ice','#c8ecff'],['Cyan','#3ad8e8'],['Sea','#1a6a8a'],
 ['Lilac','#c8a8f0'],['Lavender','#e0d0ff'],['Violet','#8a5ae0'],['Purple','#6a2aa8'],['Plum','#5a1e5a'],['Magenta','#d83ab8'],['Pink','#f8a8d8'],['Sakura','#ffc8dc'],
 ['Tan','#d8b080'],['Leather','#a06a3a'],['Brown','#8a5a32'],['Chocolate','#5a3420'],
 ['White','#f4f4f8'],['Platinum','#efe9d8'],['Ash','#b8b0a8'],['Silver','#c8ccd8'],['Grey','#8a8ca0'],['Slate','#5a5e74'],['Charcoal','#33344a'],['Black','#1e1c28'],
 ['Steel','#9aa8bc'],['Bronze','#b8783a'],['Copper','#d0784a'],['Brass','#d8b048']];
const DYE=Object.fromEntries(DYES.map(([n,c])=>[n,c]));
const SKINS=[['Porcelain','#ffe4d0'],['Fair','#f8d2b4'],['Peach','#f0c09a'],['Honey','#e0a878'],['Tan','#c88a5a'],['Bronze','#a86c42'],['Umber','#8a5432'],['Ebony','#5e3a22'],
 ['Frost','#c4e4ff'],['Sylvan','#c8eec0'],['Fae','#e0c8ff'],['Stone','#a4a6b4'],['Ember','#ffb0a0'],['Night','#5a5a8a']];
const EYES=['Round','Sharp','Sleepy','Sparkle','Cat','Happy','Fierce','Dot','Star','Wide'];
const MOUTHS=['Smile','Calm','Grin','Open','Smirk','Frown','Cat','Fang'];
const BROWS=['None','Soft','Thick','Angled','Worried'];
const EARS=['Human','Elf','Long elf','Fin'];

/* ---------- the rig ---------- */
/* the buffer is roomy so a raised greatsword or a pair of wings still fits; the feet stand at (DOLL_FX, DOLL_FY) */
const DOLL_W=104,DOLL_H=84,OX=20,OY=14,DOLL_FX=32+OX,DOLL_FY=60+OY;
/* pose: arm angles are measured from straight down, positive swinging forward (to the right) */
function rig(pose){const p=Object.assign({bob:0,lean:0,na:[.15,-.35],fa:[-.1,-.25],nl:[0,0],fl:[0,0],crouch:0,face:'normal'},pose||{});
  const lx=p.lean,by=p.bob+p.crouch;
  const P={p,hx:33+OX+lx*1.4,hy:21+OY+by,cx:32+OX+lx,top:31+OY+by,hip:45+OY+p.crouch*.6,gy:60+OY,face:p.face};
  P.nS=[35.5+OX+lx,33+OY+by];P.fS=[28.5+OX+lx,33+OY+by];
  const arm=(S,[a1,a2])=>{const E=[S[0]+Math.sin(a1)*5.5,S[1]+Math.cos(a1)*5.5],H=[E[0]+Math.sin(a1+a2)*5.5,E[1]+Math.cos(a1+a2)*5.5];return{S,E,H,a1,a2}};
  P.nArm=arm(P.nS,p.na);P.fArm=arm(P.fS,p.fa);
  const leg=(x,[t,k])=>{const Hp=[x,P.hip],K=[x+Math.sin(t)*7.5,P.hip+Math.cos(t)*7.5],F=[K[0]+Math.sin(t+k)*7.5,K[1]+Math.cos(t+k)*7.5];return{H:Hp,K,F,t,k}};
  P.nLeg=leg(34+OX+lx*.5,p.nl);P.fLeg=leg(30+OX+lx*.5,p.fl);
  /* the torso outline, from the shoulders to the hips */
  const c=P.cx,t=P.top,h=P.hip;P.torso=[[c-5.5,t],[c+5.5,t],[c+6.5,t+3],[c+4.5,t+10],[c+5,h],[c-5,h],[c-4.5,t+10],[c-6.5,t+3]];
  return P}
const POSES={
  idle:{},
  breathe:{bob:1},
  walk0:{nl:[.45,-.2],fl:[-.4,-.35],na:[-.35,-.3],fa:[.35,-.3]},
  walk1:{nl:[.15,-.5],fl:[-.1,-.1],na:[-.1,-.3],fa:[.1,-.3],bob:-1},
  walk2:{nl:[-.4,-.35],fl:[.45,-.2],na:[.35,-.3],fa:[-.35,-.3]},
  walk3:{nl:[-.1,-.1],fl:[.15,-.5],na:[.1,-.3],fa:[-.1,-.3],bob:-1},
};

/* ---------- colour helpers ---------- */
const skinOf=L=>(SKINS.find(s=>s[0]===L.skin)||SKINS[1])[1];
const dyeOf=(n,def)=>DYE[n]||n&&n[0]==='#'&&n||DYE[def]||def||'#8a8ca0';
/* the far half of a shape goes a shade darker, so the body reads as round */
function sideShade(b,cols,splitX,yFrom=0){const set=new Set(cols);b.tint((x,y,v)=>set.has(v)&&x<splitX&&y>=yFrom?dk(v):undefined)}

/* ---------- head, face and ears ---------- */
function drawEarsBack(b,P,L,sk){const e=L.ears||'Human',x=P.hx-6.5,y=P.hy+1;
  if(e==='Elf')b.poly([[x+2,y-1],[x-5,y-5],[x+1,y+3]],sk);else if(e==='Long elf')b.poly([[x+2,y-1],[x-8,y-8],[x+1,y+3]],sk);
  else if(e==='Fin'){b.poly([[x+2,y-3],[x-4,y-6],[x-3,y+1],[x+1,y+3]],mix(sk,'#5ab8e8',.35))}
  else b.ell(x+1,y+.5,2,2.6,sk,0)}
function drawHead(b,P,L){const sk=skinOf(L),hx=P.hx,hy=P.hy,sd=shade(sk,-1),hl=shade(sk,1);
  b.ell(hx,hy,8.5,8.2,sk,0);b.ell(hx+3,hy+4.2,4.9,3.6,sk,0);
  /* the back of the head in shadow, a soft light on the brow; the face itself stays clean */
  b.tint((x,y,v)=>{if(v!==sk)return;const dx=x+.5-hx,dy=y+.5-hy;if(dx<-3.6&&(dx*dx)/72+(dy*dy)/67>.3)return sd;if(dy>6.4&&dx<2)return sd;if(dx>-2&&dx<3&&dy>-6.5&&dy<-3.6)return hl});
  b.ell(hx+6.4,hy+3.4,1.3,.9,mix(sk,'#ff8a9a',.3),0);
  drawEarsBack(b,P,L,sk);if((L.ears||'Human')==='Human')b.px(hx-5.6,hy+1.5,sd)}
function drawFace(b,P,L){const hx=P.hx,hy=P.hy,ec=dyeOf(L.eyeC,'Brown'),e=L.eyes||'Round',f=P.face,sk=skinOf(L),ink='#2a1a2a';
  const ex1=hx+1.5,ex2=hx+6.2,ey=hy+.5;
  if(f==='hurt'||f==='closed'){for(const ex of[ex1,ex2]){b.line(ex-1.2,ey+.5,ex+1.2,ey-.5,ink)}}
  else if(f==='ko'){for(const ex of[ex1,ex2]){b.line(ex-1,ey-1,ex+1,ey+1,ink);b.line(ex-1,ey+1,ex+1,ey-1,ink)}}
  else{const eye=(x,w)=>{
    if(e==='Happy'){b.line(x-1.2,ey+.5,x,ey-.8,ink);b.line(x,ey-.8,x+1.2,ey+.5,ink);return}
    if(e==='Dot'){b.rect(x,ey-1,1,2,ink);return}
    if(e==='Sleepy'){b.rect(x-1,ey,w+1,1,ink);b.rect(x-1,ey+1,w+1,1,ec);return}
    const h=e==='Wide'||e==='Sparkle'?3.2:e==='Sharp'||e==='Fierce'?2:2.6;
    b.ell(x,ey,w*.75,h*.62,'#ffffff',0);b.ell(x+.3,ey+.2,w*.5,h*.5,ec,0);
    if(e==='Cat')b.rect(x+.3,ey-1,1,2.4,ink);else b.ell(x+.4,ey+.4,w*.28,h*.3,shade(ec,-2),0);
    b.px(x-.2,ey-.8,'#ffffff');if(e==='Sparkle'||e==='Star'){b.px(x+.8,ey+1,'#ffffff')}
    if(e==='Star'){b.px(x+.3,ey+.2,'#fff6a0')}
    if(e==='Sharp'||e==='Fierce')b.line(x-1.4,ey-1.6,x+1.4,ey-1.1-(e==='Fierce'?-.6:0),ink);else b.line(x-1.2,ey-1.8,x+1.2,ey-1.8,ink)};
    eye(ex1,2.6);eye(ex2,2.1)}
  const br=L.brows||'Soft',hc=dyeOf(L.hairC,'Chocolate'),bc=shade(hc,-1);
  if(br!=='None'){const y=ey-3+(br==='Worried'?0:0),t=br==='Thick'?2:1;
    for(const[x,w]of[[ex1,2.4],[ex2,2]]){if(br==='Angled')b.line(x-w/2,y-.6,x+w/2,y+.8,bc,t);else if(br==='Worried')b.line(x-w/2,y+.6,x+w/2,y-.6,bc,t);else b.line(x-w/2,y,x+w/2,y,bc,t)}}
  const m=L.mouth||'Smile',mx=hx+4.6,my=hy+5;
  if(f==='hurt'){b.rect(mx-1,my,3,1,ink);b.px(mx+2,my+1,ink)}
  else if(m==='Smile'){b.px(mx-1,my,ink);b.rect(mx,my+1,2,1,ink);b.px(mx+2,my,ink)}
  else if(m==='Calm')b.rect(mx-.5,my+.5,2.5,1,ink);
  else if(m==='Grin'){b.rect(mx-1,my,4,2,ink);b.rect(mx-.5,my,3,1,'#ffffff')}
  else if(m==='Open'){b.ell(mx+.7,my+1,1.4,1.3,ink,0);b.px(mx+.7,my+1.6,'#e05a6a')}
  else if(m==='Smirk'){b.rect(mx,my+1,2,1,ink);b.px(mx+2,my,ink)}
  else if(m==='Frown'){b.rect(mx,my,2,1,ink);b.px(mx-1,my+1,ink);b.px(mx+2,my+1,ink)}
  else if(m==='Cat'){b.px(mx-1,my,ink);b.px(mx,my+1,ink);b.px(mx+1,my,ink);b.px(mx+2,my+1,ink);b.px(mx+3,my,ink)}
  else if(m==='Fang'){b.px(mx-1,my,ink);b.rect(mx,my+1,3,1,ink);b.px(mx+3,my,ink);b.px(mx+1,my+2,'#ffffff')}
  if(f==='happy')b.ell(hx+6.4,hy+3.6,1.6,1.1,mix(sk,'#ff5a7a',.5),0)}

/* ---------- hair: a back layer, a cap and bangs, mixed into named styles ---------- */
function hairCap(b,P,c,kind){const hx=P.hx,hy=P.hy;if(kind==='none')return;
  if(kind==='buzz'||kind==='mohawk'){buzz(b,P,c);if(kind==='mohawk')for(let k=0;k<6;k++){const x=hx-6+k*2.4,y=hy-8.5+Math.abs(k-2.5)*.6;b.quill(x,y+3,x-1,y-4.5,3.4,c)}return}
  if(kind==='afro'){b.ell(hx-1.5,hy-4,12.5,10.5,c,2);for(let k=0;k<14;k++){const a=k/14*Math.PI*2;b.ell(hx-1.5+Math.cos(a)*11.5,hy-4+Math.sin(a)*9.5,2.2,2.2,c,0)}return}
  const big=kind==='tall'||kind==='pomp'||kind==='spiky'?1:0,R=kind==='slick'?8.9:9.5+big*.6;
  b.ell(hx-.6,hy-2.8-big,R,7.6+big,c,2);
  b.poly([[hx-9.4,hy-3],[hx-3,hy-3],[hx-3.5,hy+3.5],[hx-8.6,hy+4.5]],c);
  if(kind==='spiky'){for(const[a,l]of[[-2.6,7],[-2.15,8],[-1.7,8.5],[-1.25,7],[-.85,6],[-3.0,6]]){const x0=hx-1+Math.cos(a)*7,y0=hy-3+Math.sin(a)*6.5;b.quill(x0,y0,x0+Math.cos(a)*l*.7,y0+Math.sin(a)*l*.75,4.4,c)}}
  if(kind==='messy'){for(const[a,l]of[[-2.5,4],[-2.0,5],[-1.5,4.5],[-1.0,4],[-3,4]]){const x0=hx-1+Math.cos(a)*8.5,y0=hy-3+Math.sin(a)*7;b.quill(x0,y0,x0+Math.cos(a+.5)*l,y0+Math.sin(a+.5)*l,3.4,c)}}
  if(kind==='curly'){for(let k=0;k<9;k++){const a=Math.PI*(1.0+k/8),x=hx-.6+Math.cos(a)*9.2,y=hy-2.8+Math.sin(a)*7.8;b.ell(x,y,2.3,2.3,c,1)}}
  if(kind==='pomp'){b.ell(hx+3,hy-9.5,6.5,4,c,2);b.quill(hx+6,hy-9,hx+11,hy-10,4,c)}
  if(kind==='tall'){b.ell(hx-1,hy-8,8,5,c,2)}}
/* a shaved head: short hair shows as a soft tint on the scalp (drawn on its own layer, so it never covers the face) */
function buzz(b,P,c){const hx=P.hx,hy=P.hy;for(let y=Math.floor(hy-10);y<hy+5;y++)for(let x=Math.floor(hx-10);x<hx+9;x++){const nx=(x+.5-(hx-.4))/8.7,ny=(y+.5-(hy-1.2))/8.3;
  if(nx*nx+ny*ny<=1&&(y<hy-4.6||x<hx-4.6))b.px(x,y,(x*7+y*3)%4?mix(c,'#c8a890',.25):shade(c,-1))}}
/* the cap may not cover the face: this is the window it is cut out of */
const faceWindow=(P,x,y)=>x>=P.hx-3.4+(y>P.hy+2?-1:0)&&y>=P.hy-4.8+Math.max(0,(x-(P.hx+6))*.4)&&y<=P.hy+10
function hairBangs(b,P,c,kind){const hx=P.hx,hy=P.hy,y0=hy-8.5;
  if(kind==='none')return;
  if(kind==='straight'){b.poly([[hx-3,y0+1],[hx+8.6,y0+3.5],[hx+8.4,hy-2.4],[hx-2,hy-2.4]],c);for(let x=Math.ceil(hx-1);x<hx+8;x+=2)b.px(x,hy-2.4,c)}
  else if(kind==='side'){b.poly([[hx-3,y0+.5],[hx+8.8,y0+3],[hx+8,hy-4.5],[hx+3,hy-3.4],[hx-1,hy-2]],c)}
  else if(kind==='swept'){b.poly([[hx-3,y0+.5],[hx+9,y0+3],[hx+8.6,hy+1.5],[hx+5,hy-1.5],[hx+1,hy-3]],c);b.line(hx+2,hy-4,hx+7.5,hy+.5,shade(c,-1))}
  else if(kind==='spiky'){b.poly([[hx-3,y0+.5],[hx+8.4,y0+2.4],[hx+8,hy-5]],c);for(const[x,l]of[[hx,4.5],[hx+3.2,5.4],[hx+6.2,4.8]])b.tri(x-1.8,hy-6,x+1.8,hy-6,x+1.2,hy-6+l,c)}
  else if(kind==='parted'){b.poly([[hx-3,y0+.5],[hx+8.6,y0+3.2],[hx+8.8,hy+3],[hx+7.2,hy+3.5],[hx+6.4,hy-3],[hx+3.4,hy-5.4],[hx+1.5,hy-2],[hx+.4,hy+2],[hx-1.4,hy+2]],c)}
  else if(kind==='long'){b.poly([[hx-3,y0+.5],[hx+8.6,y0+3.2],[hx+9,hy+6],[hx+7.4,hy+6.5],[hx+6.6,hy-3],[hx+1,hy-3.4],[hx-1,hy-1]],c)}
  else if(kind==='tuft'){b.poly([[hx-3,y0+.5],[hx+8.6,y0+3],[hx+7.6,hy-4.6],[hx+1,hy-4.2]],c);b.horn(hx+5,hy-5,hx+8,hy-3.6,hx+6.4,hy-1.6,2.2,c,.8)}
  else if(kind==='locks'){hairBangs(b,P,c,'side');b.poly([[hx+7.4,hy-3],[hx+9.4,hy-3],[hx+9,hy+7],[hx+7.4,hy+7.4]],c)}}
function hairBack(b,P,c,kind){const hx=P.hx,hy=P.hy,bx=hx-7.5;
  const fall=(y1,w=5.5,jag=1)=>{b.poly([[bx-1.8,hy-5],[bx+5,hy-4],[bx+4.2,y1-2],[bx+2,y1],[bx-.5,y1-1.2],[bx-2.6,y1-2.4],[bx-3,hy+2]],c);if(jag)for(let x=bx-2;x<bx+4;x+=2)b.px(x,y1-1.6+((x|0)%3===0?1:0),c)};
  switch(kind){
    case 'none':break;
    case 'short':b.ell(bx+1.5,hy+3.5,4,4.5,c,1);break;
    case 'bob':b.poly([[bx-1.8,hy-5],[hx+1,hy-6],[hx-1,hy+7],[bx-1,hy+7.6]],c);b.ell(bx+.4,hy+5.4,3,2.6,c,0);break;
    case 'shoulder':fall(hy+13);break;
    case 'long':fall(43+OY,6);break;
    case 'vlong':fall(52+OY,6.5);break;
    case 'mullet':b.ell(bx+1.5,hy+3.5,4,4.5,c,1);fall(hy+14);break;
    case 'wolf':fall(hy+13);for(const[y,l]of[[hy+4,4],[hy+8,5],[hy+12,4]])b.quill(bx-1,y,bx-2-l,y+3,3,c);break;
    case 'pony':b.ell(bx+1,hy-6,3,3,c,1);b.horn(bx,hy-6,bx-8,hy-4,bx-6,hy+12,5.2,c,1.5);break;
    case 'lowpony':b.ell(bx+1.5,hy+3.5,3.4,3.6,c,1);b.horn(bx,hy+4,bx-4,hy+9,bx-3,hy+20,4.2,c,1.2);break;
    case 'twin':b.ell(bx+1,hy-6,2.6,2.6,c,1);b.horn(bx,hy-6,bx-9,hy-3,bx-7,hy+16,4.6,c,1.6);b.ell(hx-3,hy-9.6,2.4,2.4,c,1);b.horn(hx-3.5,hy-9.6,hx-13,hy-6,hx-12,hy+13,4,shade(c,-1),1.4);break;
    case 'bun':b.ell(bx+.5,hy-6.5,4.2,4,c,2);break;
    case 'twinbun':b.ell(hx-5.5,hy-9.5,3.8,3.6,c,2);b.ell(hx+3.5,hy-10.6,3.8,3.6,c,2);break;
    case 'braid':b.ell(bx+1.5,hy+3,3.4,3.6,c,1);for(let k=0;k<6;k++){b.ell(bx-1-k*.6,hy+6+k*3.2,2.4,2,k%2?c:shade(c,1),0)}b.ell(bx-4.6,hy+25,1.6,2,c,0);break;
    case 'drills':fall(hy+8);for(const ox of[-1.5,2.5]){for(let k=0;k<5;k++)b.ell(bx+ox,hy+9+k*2.6,2.6-k*.3,1.6,k%2?c:shade(c,1),0)}break;
    case 'topknot':b.ell(hx-2,hy-11,3,2.8,c,2);b.rect(hx-3,hy-9,2,2,shade(c,-1));break;
    case 'locs':for(let k=0;k<5;k++){const x=bx-2+k*1.6;b.horn(x+2,hy-4,x-1,hy+6,x-1.5+k*.2,hy+15,2.2,k%2?c:shade(c,-1),1.6)}break;
    case 'halfup':fall(43+OY,6);b.ell(bx+.5,hy-7,3.2,3,c,2);break;
    case 'curlylong':fall(hy+16);for(let k=0;k<4;k++)b.ell(bx-2+k*1.8,hy+15+(k%2),2,2,c,1);break;
    case 'mane':fall(52+OY,7);for(let k=0;k<7;k++)b.quill(bx-1,hy+k*4,bx-6,hy+2+k*4,3.4,c);break;
  }}
/* [name, back, cap, bangs, extra] */
const HAIRS=[
 ['Short Crop','short','round','side'],['Spiky Hero','short','spiky','spiky'],['Messy','short','messy','tuft'],['Bob','bob','round','straight'],
 ['Long Straight','long','round','parted'],['Very Long','vlong','round','straight'],['Ponytail','pony','slick','side'],['Low Ponytail','lowpony','round','parted'],
 ['Twintails','twin','round','straight'],['Bun','bun','slick','none'],['Twin Buns','twinbun','round','straight'],['Braid','braid','round','side'],
 ['Mohawk','none','mohawk','none'],['Afro','none','afro','none'],['Curly','bob','curly','tuft'],['Buzz Cut','none','buzz','none'],
 ['Bald','none','none','none'],['Slicked Back','short','slick','none'],['Pompadour','short','pomp','none'],['Wolf Cut','wolf','messy','spiky'],
 ['Mullet','mullet','round','tuft'],['Hime Cut','vlong','round','locks'],['Drill Curls','drills','round','straight'],['Top Knot','topknot','slick','none'],
 ['Emo Fringe','short','round','swept'],['Long Spiky','long','spiky','spiky'],['Pixie','none','slick','side'],['Undercut','none','pomp','none'],
 ['Wavy','curlylong','curly','parted'],['Locs','locs','round','none'],['Side Swept Long','long','round','swept'],['Royal Curls','curlylong','curly','locks'],
 ['Antenna','short','round','side','ahoge'],['Shaggy','shoulder','messy','straight'],['Wild Mane','mane','spiky','spiky'],['Half Up','halfup','round','parted'],
 ['Tall Spikes','short','tall','spiky'],['Fluffy','shoulder','curly','straight','ahoge']];
function drawAhoge(b,P,c){b.horn(P.hx,P.hy-10,P.hx+3,P.hy-15,P.hx+5.5,P.hy-13,2,c,.8)}

/* ---------- hats: [name, draw, hide] hide: 'cap' keeps the hair cap off, 'all' keeps every hair layer off but the bangs ---------- */
const brim=(b,x,y,w,h,c)=>{b.ell(x,y,w,h,c,1)};
const HATS=[
 ['None',null],
 ['Wizard Hat',(b,P,a,c)=>{const x=P.hx,y=P.hy-7;brim(b,x,y,12,2.6,a);b.poly([[x-7,y],[x+7,y],[x+2,y-11],[x-6,y-17],[x-1,y-10]],a);b.rect(x-7,y-2,14,2,c);b.star(x+1,y-6,2.2,'#fff2a0')},'cap'],
 ['Witch Hat',(b,P,a,c)=>{const x=P.hx,y=P.hy-7;brim(b,x,y,14,2.4,a);b.poly([[x-6,y],[x+6,y],[x+5,y-9],[x+11,y-15],[x+1,y-11]],a);b.rect(x-6,y-2,12,2,c);b.rect(x-1,y-3,3,3,'#f2c84a');b.px(x,y-2,a)},'cap'],
 ['Top Hat',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-7;brim(b,x,y,10.5,2.2,a);b.rect(x-6.5,y-12,13,12,a);b.ell(x,y-12,6.5,1.4,shade(a,1),0);b.rect(x-6.5,y-3.5,13,2.4,c)},'cap'],
 ['Bowler',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-6;brim(b,x,y,10.5,2,a);b.ell(x,y-3.5,8,6,a,2);b.rect(x-8,y-2,16,1.6,c)},'cap'],
 ['Cap',(b,P,a,c)=>{const x=P.hx,y=P.hy-5;b.ell(x-.4,y-2.6,9.4,6.2,a,2);b.poly([[x+5,y-1],[x+14,y],[x+13,y+1.6],[x+5,y+1.2]],c);b.px(x-.4,y-8.4,c)},'cap'],
 ['Backwards Cap',(b,P,a,c)=>{const x=P.hx,y=P.hy-5;b.ell(x-.4,y-2.6,9.4,6.2,a,2);b.poly([[x-6,y-1],[x-14,y+1],[x-13,y+2.4],[x-6,y+1.4]],c);b.rect(x+2,y-1.5,4,1.6,shade(a,-1))},'cap'],
 ['Beanie',(b,P,a,c)=>{const x=P.hx-.4,y=P.hy-4.5;b.ell(x,y-3.4,9.6,7.6,a,2);b.rect(x-9.6,y-1.5,19.2,3.4,c);for(let k=-8;k<9;k+=2)b.px(x+k,y,shade(c,-1))},'cap'],
 ['Pom Beanie',(b,P,a,c)=>{const x=P.hx-.4,y=P.hy-4.5;b.ell(x,y-3.4,9.6,7.6,a,2);b.rect(x-9.6,y-1.5,19.2,3.4,c);b.ell(x-1,y-12,3.4,3.2,c,1);for(let k=-8;k<9;k+=3)b.line(x+k,y-6,x+k*.8,y-9,shade(a,-1))},'cap'],
 ['Beret',(b,P,a,c)=>{const x=P.hx-1,y=P.hy-8;b.ell(x+1,y,10,3.8,a,2);b.ell(x-6,y+1.6,4,2.6,a,0);b.rect(x+1,y-4.4,1,1.6,c)},''],
 ['Cowboy Hat',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-6.5;b.ell(x,y+.6,14,2.6,a,1);b.ell(x-13,y-1.5,2,2.6,a,0);b.ell(x+13,y-1.5,2,2.6,a,0);b.poly([[x-6.5,y],[x+6.5,y],[x+6,y-8],[x+2,y-6.6],[x,y-8.4],[x-2,y-6.6],[x-6,y-8]],a);b.rect(x-6.5,y-2.2,13,1.8,c)},'cap'],
 ['Straw Hat',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-6;b.ell(x,y,15,3,a,1);b.ell(x,y-3.4,7.4,4.6,a,2);b.rect(x-7.3,y-2.4,14.6,2,c);for(let k=-13;k<14;k+=3)b.px(x+k,y+1,shade(a,-1))},'cap'],
 ['Adventurer Hat',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-6.5;b.ell(x+1,y+.4,12,2.4,a,1);b.poly([[x-6.5,y],[x+6.5,y],[x+5.5,y-7],[x+1,y-5.4],[x-5,y-7.4]],a);b.rect(x-6.5,y-2.2,13,1.8,c);b.quill(x-5,y-3,x-10,y-10,2.2,'#f4f4f8')},'cap'],
 ['Pirate Tricorn',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-7;b.poly([[x-13,y-2],[x-6,y+1],[x+6,y+1],[x+13,y-2],[x+7,y-9],[x,y-6.6],[x-7,y-9]],a);b.line(x-13,y-2,x-7,y-9,c);b.line(x+13,y-2,x+7,y-9,c);b.ell(x+.5,y-3.5,2.2,2,'#f4f4f8',0);b.px(x,y-4,INK);b.px(x+1,y-4,INK)},'cap'],
 ['Bandana',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-5;b.ell(x,y-3,9.6,6.4,a,2);b.tint((xx,yy,v)=>v===a&&yy>y+.5?null:undefined);for(let k=-8;k<9;k+=3)b.px(x+k,y-3,c);b.quill(x-9,y-1,x-15,y+3,3,a);b.quill(x-9,y,x-14,y+6,2.6,a)},'cap'],
 ['Headband',(b,P,a,c)=>{const x=P.hx,y=P.hy-4.5;b.rect(x-9,y-1,18.4,2.6,a);b.rect(x+3,y-1,3,2.6,c);b.quill(x-9,y,x-15,y+4,2.4,a);b.quill(x-9,y+.5,x-14,y+7,2,a)},''],
 ['Crown',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-7.6;b.poly([[x-7,y+2],[x+7,y+2],[x+8,y-5],[x+4.6,y-1.6],[x+2,y-7],[x-.5,y-2],[x-3,y-7],[x-5.4,y-1.6],[x-8,y-5]],a);b.rect(x-7,y,14,2.2,shade(a,-1));for(const k of[-4,0,4])b.ell(x+k,y+1,1,1,c,0)},''],
 ['Tiara',(b,P,a,c)=>{const x=P.hx+.5,y=P.hy-7.4;b.poly([[x-6,y+1.4],[x+6,y+1.4],[x+3,y-1],[x,y-4.4],[x-3,y-1]],a);b.ell(x,y-1,1.4,1.6,c,0)},''],
 ['Circlet',(b,P,a,c)=>{const x=P.hx,y=P.hy-4.5;b.rect(x-8.8,y,18,1.4,a);b.ell(x+7,y+.6,1.6,1.8,c,0);b.px(x+6.6,y,'#ffffff')},''],
 ['Laurel Wreath',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-5.5;for(let k=0;k<7;k++){const t=k/6,xx=x-9+t*18,yy=y-Math.sin(t*Math.PI)*2.4;b.leaf(xx,yy,xx+2.6,yy-2.4,2.2,k%2?a:shade(a,1))}},''],
 ['Flower Crown',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-6;b.line(x-9,y+1,x+9,y,shade('#4ab048',-1),2);for(let k=0;k<5;k++){const xx=x-8+k*4,yy=y-.4;b.ell(xx,yy,2,2,k%2?a:c,1);b.px(xx,yy,'#fff2a0')}},''],
 ['Halo',(b,P,a,c)=>{const x=P.hx-1,y=P.hy-14;b.ell(x,y,7,2,a,0);b.ell(x,y,4.8,.9,null,0);b.ell(x,y-.4,5,1.1,null,0)},''],
 ['Knight Helm',(b,P,a,c)=>{const x=P.hx,y=P.hy;b.horn(x-2,y-9,x-8,y-17,x-14,y-10,3.6,c,2.2);b.ell(x-.4,y-2.4,9,8.2,a,2);b.poly([[x-9,y-2],[x+9.2,y-2],[x+9.4,y+6],[x+6,y+9],[x-1,y+9],[x-8.6,y+6]],a);
  b.rect(x+1,y-.4,8.6,1.6,INK);b.line(x+5.6,y-6,x+5.6,y+8,shade(a,2));for(const k of[0,2,4])b.px(x+6.6+k*.6,y+3.4,INK);b.rect(x-8.6,y+5,16,1,shade(a,-1));b.line(x-6,y-8,x+3,y-9.6,shade(a,2))},'all'],
 ['Viking Helm',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-5;b.ell(x,y-2.6,9.4,6.6,a,2);b.rect(x-9.4,y-.6,18.8,2.4,c);b.horn(x-6,y-3,x-13,y-5,x-11,y-13,3.4,'#fff0c8',1);b.horn(x+6,y-3,x+12,y-6,x+10,y-14,3.4,'#fff0c8',1)},'cap'],
 ['Winged Helm',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-5;b.ell(x,y-2.6,9.4,6.6,a,2);b.rect(x-9.4,y-.6,18.8,2,shade(a,-1));for(const s of[-1,1]){const wx=x+s*8;for(let k=0;k<3;k++)b.leaf(wx,y-3+k,wx+s*7,y-9+k*2.6,2.8,k?c:lt(c))}},'cap'],
 ['Samurai Kabuto',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-5;b.ell(x,y-2.6,9.6,6.8,a,2);b.poly([[x-11,y],[x-9,y-1],[x-9,y+5],[x-12,y+4]],a);b.rect(x-9.6,y-.6,19.2,2,shade(a,-1));b.horn(x-1,y-6,x+5,y-14,x+12,y-16,2.2,c,1);b.horn(x-1,y-6,x-6,y-13,x-11,y-15,2.2,c,1);b.ell(x-1,y-6,1.8,1.8,'#e24a4a',0)},'cap'],
 ['Spartan Helm',(b,P,a,c)=>{const x=P.hx,y=P.hy;b.ell(x-.4,y-1.6,9.6,9.4,a,2);b.poly([[x+2,y-2],[x+10,y-2],[x+10,y+6],[x+7,y+6],[x+6,y+1],[x+3,y+1]],null);b.rect(x+5.6,y-2,1.4,8,shade(a,-1));b.horn(x+4,y-10,x-4,y-18,x-13,y-10,4.4,c,2.4)},'all'],
 ['Hood',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy;b.ell(x-.6,y-1.4,11,10.4,a,2);b.poly([[x-10,y],[x-12,y+12],[x-3,y+10]],a);b.ell(x+3.6,y+1.4,6.6,7.4,null,0);b.ell(x+3.6,y+1.4,6.6,7.4,c,0);b.tint((xx,yy,v)=>v===c&&(xx>x+1.2||yy>y-4)?null:undefined)},'all'],
 ['Cat-Ear Hood',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy;b.tri(x-8,y-6,x-3,y-9,x-7,y-15,a);b.tri(x+1,y-9,x+6,y-7,x+5,y-15,a);b.tri(x-6.6,y-8,x-4,y-9,x-6,y-12,c);b.tri(x+2.6,y-9,x+5,y-8,x+4.6,y-12,c);b.ell(x-.6,y-1.4,11,10.4,a,2);b.poly([[x-10,y],[x-12,y+12],[x-3,y+10]],a);b.ell(x+3.6,y+1.4,6.6,7.4,null,0)},'all'],
 ['Cat Ears',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-7;b.tri(x-7.5,y+1,x-2,y-1.4,x-6.4,y-8,a);b.tri(x+.8,y-1.4,x+6,y+.4,x+5,y-8,a);b.tri(x-6.2,y,x-3.4,y-1,x-5.6,y-5,c);b.tri(x+2,y-1,x+4.8,y,x+4.4,y-5,c)},''],
 ['Bunny Ears',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-7;b.leaf(x-4,y,x-8,y-15,4.4,a);b.leaf(x+1,y-1,x+5,y-16,4.4,a);b.leaf(x-4,y-1,x-7.4,y-13,2,c,true);b.leaf(x+1,y-2,x+4.6,y-14,2,c,true)},''],
 ['Fox Ears',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-7;b.tri(x-8,y+1,x-1.6,y-1.6,x-7,y-10,a);b.tri(x+.6,y-1.6,x+6.6,y+.6,x+6,y-10,a);b.tri(x-6.6,y-.4,x-3.4,y-1.4,x-6.4,y-6,c);b.tri(x+2,y-1.2,x+5.2,y-.2,x+5.2,y-6,c);b.px(x-7,y-9,'#f4f4f8');b.px(x+6,y-9,'#f4f4f8')},''],
 ['Demon Horns',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-7;b.horn(x-5,y+1,x-9,y-4,x-5,y-10,3.4,a,.8);b.horn(x+3,y,x+7,y-5,x+3.6,y-11,3.4,a,.8)},''],
 ['Antlers',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-7;for(const s of[-1,1]){const bx=x+s*3.5;b.horn(bx,y+1,bx+s*3,y-6,bx+s*7,y-11,2.2,a,1.2);b.line(bx+s*2.2,y-4,bx+s*6.4,y-6,a,2);b.line(bx+s*4.6,y-8,bx+s*3.4,y-13,a,1)}},''],
 ['Unicorn Horn',(b,P,a,c)=>{const x=P.hx+3,y=P.hy-7;b.quill(x,y+1,x+4,y-12,4.4,a);for(let k=0;k<4;k++)b.line(x-1+k*.9,y-k*3,x+2+k*.9,y-1-k*3,c)},''],
 ['Chef Hat',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-6;b.rect(x-7,y-4,14,4.6,a);b.ell(x-4,y-8,4.6,4.4,a,2);b.ell(x+3,y-9,5,4.8,a,2);b.ell(x,y-11,4.4,4,a,2);b.rect(x-7,y-1.4,14,1.4,c)},'cap'],
 ['Jester Hat',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-5;b.ell(x,y-2.6,9.4,6,a,2);b.horn(x-4,y-6,x-12,y-14,x-14,y-2,4.2,a,1.4);b.horn(x+3,y-6,x+11,y-14,x+13,y-3,4.2,c,1.4);b.ell(x-14,y-1,1.8,1.8,'#f2c84a',1);b.ell(x+13,y-2,1.8,1.8,'#f2c84a',1);b.rect(x-9.4,y-.6,18.8,2,shade(a,-1))},'cap'],
 ['Party Hat',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-7;b.tri(x-5.5,y+1,x+5.5,y+1,x+1,y-13,a);for(let k=0;k<3;k++)b.line(x-4+k*1.4,y-1-k*3.5,x+4-k*1.1,y-2-k*3.5,c,1);b.ell(x+1,y-13.6,1.8,1.8,c,1)},''],
 ['Propeller Cap',(b,P,a,c)=>{const x=P.hx-.4,y=P.hy-5;b.ell(x,y-2.6,9.4,6.4,a,2);for(let k=0;k<4;k++)b.tri(x,y-9,x-1+((k%2)*2),y-8.4,x+(k<2?-1:1)*6,y-10+(k%2)*1.4,k%2?c:'#f2c84a');b.rect(x-.5,y-9.5,1,2,'#8a8ca0');b.poly([[x+5,y-1],[x+13,y],[x+12,y+1.4],[x+5,y+1]],c)},'cap'],
 ['Graduation Cap',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-7;b.ell(x,y+.6,8.4,3,a,1);b.poly([[x-12,y-2],[x+1,y-6],[x+13,y-2],[x,y+2]],a);b.line(x,y-2,x-8,y+3,c);b.rect(x-9,y+3,2,3,c)},'cap'],
 ['Ushanka',(b,P,a,c)=>{const x=P.hx-.4,y=P.hy-5;b.ell(x,y-3,9.6,6.6,a,2);b.rect(x-10,y-.6,20,3.4,c);b.poly([[x-10,y],[x-6,y],[x-6.4,y+8],[x-9.4,y+8]],c);b.rect(x+2,y-7,4,3,shade('#f2c84a',-1))},'cap'],
 ['Bucket Hat',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-5.5;b.poly([[x-11,y+2],[x+11,y+2],[x+8,y-1],[x-8,y-1]],a);b.ell(x,y-3.4,8.2,5.6,a,2);b.rect(x-8,y-2,16,1.4,c)},'cap'],
 ['Goggles',(b,P,a,c)=>{const x=P.hx,y=P.hy-5;b.rect(x-9,y-.6,18.4,1.6,a);for(const gx of[x+1,x+6.4]){b.ell(gx,y,2.6,2.4,'#5a5e74',0);b.ell(gx,y,1.8,1.6,c,0);b.px(gx-.6,y-.8,'#ffffff')}},''],
 ['Headphones',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-2;b.horn(x-7,y,x,y-15,x+7,y-2,2.2,a,2.2);b.ell(x-7,y+1,3,3.6,a,1);b.ell(x-7,y+1,1.6,2.2,c,0)},''],
 ['Ribbon Bow',(b,P,a,c)=>{const x=P.hx-6,y=P.hy-9;b.poly([[x,y],[x-6,y-5],[x-6,y+4]],a);b.poly([[x,y],[x+6,y-5],[x+6,y+4]],a);b.ell(x,y,1.8,1.8,c,0);b.quill(x-1,y+1,x-4,y+8,2,a);b.quill(x+1,y+1,x+3,y+8,2,a)},''],
 ['Mushroom Cap',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-6;b.ell(x,y-2,12,7,a,2);b.tint((xx,yy,v)=>(v===a||v===lt(a)||v===dk(a)||v===shade(a,2))&&yy>y+1.4?null:undefined);for(const[dx,dy,r]of[[-6,-4,1.8],[0,-6,2.2],[5,-3,1.6],[-1,-1,1.2],[8,-1,1.2]])b.ell(x+dx,y+dy,r,r,c,0)},'cap'],
 ['Frog Hat',(b,P,a,c)=>{const x=P.hx-.5,y=P.hy-5;b.ell(x,y-2.6,9.6,6.6,a,2);for(const ex of[x-3,x+4]){b.ell(ex,y-8,3,3,a,1);b.ell(ex+.4,y-8,1.8,1.8,'#ffffff',0);b.ell(ex+.8,y-8,1,1.2,INK,0)}b.line(x+2,y-1,x+8,y-2,c,1)},'cap'],
 ['Nightcap',(b,P,a,c)=>{const x=P.hx-.4,y=P.hy-5;b.ell(x,y-2.6,9.4,6.2,a,2);b.horn(x+2,y-7,x-9,y-12,x-15,y-2,5,a,1.6);b.rect(x-9.4,y-.6,18.8,2.2,c);b.ell(x-15,y-1,2.4,2.4,c,1)},'cap'],
 ['Royal Circlet',(b,P,a,c)=>{const x=P.hx,y=P.hy-4.8;b.rect(x-8.8,y,18,1.6,a);b.tri(x+5.5,y,x+8.5,y,x+7,y-4,a);b.ell(x+7,y-1,1.4,1.6,c,0)},''],
];

/* ---------- tops: drawn from a few traits ---------- */
/* [name, {len, sleeve, collar, open, belt, pattern, pads, trim, extra}, default dyes] */
const TOPS=[
 ['Tee',{len:'waist',sleeve:'short',collar:'crew'},['White','Azure']],
 ['Long Tee',{len:'waist',sleeve:'long',collar:'crew'},['Charcoal','Grey']],
 ['Striped Shirt',{len:'waist',sleeve:'long',collar:'crew',pattern:'stripes'},['White','Navy']],
 ['Tank Top',{len:'waist',sleeve:'none',collar:'scoop'},['Crimson','White']],
 ['Button Shirt',{len:'hip',sleeve:'long',collar:'shirt',buttons:1},['Sky','White']],
 ['Tunic',{len:'hip',sleeve:'long',collar:'v',belt:1},['Forest','Brown']],
 ['Hoodie',{len:'hip',sleeve:'long',collar:'hood',pocket:1},['Grey','White']],
 ['Sweater',{len:'hip',sleeve:'long',collar:'crew',pattern:'knit'},['Rust','Cream']],
 ['Vest',{len:'hip',sleeve:'long',collar:'v',open:1,vest:1},['Brown','Cream']],
 ['Jacket',{len:'hip',sleeve:'long',collar:'lapel',open:1},['Navy','White']],
 ['Leather Jacket',{len:'hip',sleeve:'long',collar:'lapel',open:1,zip:1},['Black','Crimson']],
 ['Long Coat',{len:'knee',sleeve:'long',collar:'high',open:1},['Charcoal','Crimson']],
 ['Trench Coat',{len:'knee',sleeve:'long',collar:'lapel',belt:1,buttons:1},['Tan','Brown']],
 ['Noble Doublet',{len:'hip',sleeve:'puff',collar:'ruff',trim:1,buttons:1},['Royal','Gold']],
 ['Royal Tunic',{len:'hip',sleeve:'long',collar:'high',sash:1,trim:1},['Crimson','Gold']],
 ['Kimono',{len:'ankle',sleeve:'wide',collar:'wrap',obi:1},['Sakura','Crimson']],
 ['Ninja Garb',{len:'hip',sleeve:'long',collar:'wrap',belt:1,pattern:'mesh'},['Charcoal','Crimson']],
 ['Samurai Armor',{len:'hip',sleeve:'long',collar:'wrap',pattern:'lamellar',pads:1},['Crimson','Gold']],
 ['Breastplate',{len:'hip',sleeve:'long',collar:'crew',plate:1,pads:1},['Steel','Royal']],
 ['Full Plate',{len:'hip',sleeve:'long',collar:'high',plate:1,pads:2,tasset:1},['Steel','Gold']],
 ['Chainmail',{len:'hip',sleeve:'long',collar:'crew',pattern:'chain',belt:1},['Silver','Brown']],
 ['Leather Armor',{len:'hip',sleeve:'short',collar:'crew',straps:1,pads:1},['Leather','Chocolate']],
 ['Mage Robe',{len:'ankle',sleeve:'wide',collar:'v',trim:1,belt:1},['Purple','Gold']],
 ['Sorcerer Robe',{len:'ankle',sleeve:'wide',collar:'high',pattern:'stars',trim:1},['Navy','Gold']],
 ['Priest Vestment',{len:'ankle',sleeve:'wide',collar:'crew',stole:1},['White','Gold']],
 ['Dress',{len:'knee',sleeve:'short',collar:'scoop',flare:1,belt:1},['Sky','White']],
 ['Ball Gown',{len:'ankle',sleeve:'puff',collar:'scoop',flare:2,trim:1},['Magenta','Gold']],
 ['Sailor Top',{len:'waist',sleeve:'short',collar:'sailor'},['White','Navy']],
 ['Apron Dress',{len:'knee',sleeve:'puff',collar:'crew',flare:1,apron:1},['Royal','White']],
 ['Overalls',{len:'hip',sleeve:'short',collar:'crew',bib:1},['Azure','White']],
 ['Poncho',{len:'hip',sleeve:'none',collar:'crew',poncho:1,pattern:'zigzag'},['Rust','Amber']],
 ['Suit',{len:'hip',sleeve:'long',collar:'lapel',open:1,tie:1},['Black','Crimson']],
 ['Ranger Vest',{len:'hip',sleeve:'long',collar:'fur',vest:1,open:1},['Forest','Tan']],
 ['Monk Gi',{len:'hip',sleeve:'short',collar:'wrap',belt:1},['White','Black']],
 ['Pirate Coat',{len:'knee',sleeve:'long',collar:'lapel',open:1,buttons:1,trim:1},['Crimson','Gold']],
 ['Scale Mail',{len:'hip',sleeve:'short',collar:'crew',pattern:'scales',belt:1},['Teal','Brown']],
];
function sleeveColor(T,c1,sk){return T.sleeve==='none'?sk:c1}
/* one arm: the sleeve, the bare skin and a hand */
function drawArm(b,A,T,c1,c2,sk,glove){const s=T?T.sleeve:'short',col=s==='none'?sk:c1;
  const{S,E,H}=A;
  if(s==='long'||s==='wide'||s==='puff'){b.limb(S[0],S[1],E[0],E[1],3.6,col,3.2);b.limb(E[0],E[1],H[0],H[1],3.2,col,s==='wide'?4.6:2.8);
    if(s==='wide'){b.limb(E[0],E[1],H[0]+(H[0]-E[0])*.2,H[1]+2.6,4.4,col,5)}
    if(s==='puff')b.ell(S[0],S[1]+1,3,2.8,col,1)}
  else if(s==='short'){b.limb(S[0],S[1],E[0],E[1],3.6,col,3.2);const m=[(S[0]+E[0])/2,(S[1]+E[1])/2];b.limb(m[0],m[1],E[0],E[1],2.6,sk,2.6);b.limb(E[0],E[1],H[0],H[1],2.6,sk,2.4)}
  else{b.limb(S[0],S[1],E[0],E[1],2.8,sk,2.6);b.limb(E[0],E[1],H[0],H[1],2.6,sk,2.4)}
  if(T&&T.trim&&s!=='none'){const tx=s==='short'?E:H;b.ell(tx[0],tx[1],1.8,1.4,c2,0)}
  b.ell(H[0],H[1],2.1,2.1,glove||sk,1)}
function drawTorso(b,P,T,c1,c2,sk){const c=P.cx,t=P.top,h=P.hip,fx=c+3.2;
  /* the long part (coats, robes, dresses) hangs down over the legs */
  const lenY={waist:h,hip:h+2,knee:h+9,ankle:h+14}[T.len]||h;
  if(lenY>h+2){const fl=T.flare||0,w=5.5+fl*2.2+(T.len==='ankle'?1.5:0);
    b.poly([[c-5,h-2],[c+5,h-2],[c+w+.5,lenY],[c-w-1,lenY]],c1);
    if(T.open&&!T.flare)b.poly([[fx-1,h-1],[fx+1,h-1],[fx+3,lenY],[fx+.5,lenY]],c2);
    if(T.trim)b.rect(c-w-1,lenY-1.4,2*w+1.5,1.4,c2);
    if(T.apron)b.poly([[fx-3.5,h-2],[fx+3,h-2],[fx+4,lenY-1.5],[fx-3,lenY-1.5]],c2);
    if(T.obi)b.rect(c-5,h-4,10.5,3.4,c2)}
  b.poly(P.torso,c1);
  if(T.poncho){b.poly([[c-7.4,t+1],[c+7.4,t+1],[c+8,h-1],[c,h+3],[c-8,h-1]],c1)}
  /* the patterns sit on the body only */
  const pat=T.pattern;
  if(pat==='stripes')for(let y=t+2;y<h;y+=3)b.rect(c-8,y,17,1,c2,true);
  if(pat==='knit')for(let y=t+2;y<h+2;y+=2)for(let x=c-7;x<c+8;x+=2)b.px(x+((y/2)%2),y,shade(c1,-1),true);
  if(pat==='chain')for(let y=t+1;y<h+2;y+=2)for(let x=c-7;x<c+8;x+=2)b.px(x+((y/2)%2),y,shade(c1,1));
  if(pat==='mesh')for(let y=t+1;y<t+8;y+=2)for(let x=c-3;x<c+6;x+=2)b.px(x+((y/2)%2),y,shade(c1,1));
  if(pat==='lamellar')for(let y=t+3;y<h+2;y+=3){b.rect(c-7,y,15,1,shade(c1,-1),true);for(let x=c-6;x<c+7;x+=3)b.px(x,y+1,c2)}
  if(pat==='scales')for(let y=t+2;y<h+2;y+=3)for(let x=c-7+(y%2?1.5:0);x<c+8;x+=3)b.ell(x,y,1.4,1,shade(c1,1),0,true);
  if(pat==='stars')for(const[x,y]of[[c-2,t+5],[c+3,t+9],[c-1,h+4],[c+4,h+9],[c-4,h+10]])b.plus(x,y,c2);
  if(pat==='zigzag')for(let x=c-7;x<c+8;x+=2){b.px(x,h-3+((x/2)%2),c2,true);b.px(x,h-5+((x/2)%2),c2,true)}
  if(T.plate){b.ell(c+1,t+6,6,6,c1,2,true);b.rect(c-6,h-4,13,1,shade(c1,-1),true);b.line(fx+1,t+2,fx+1,t+10,shade(c1,2))}
  if(T.vest){b.poly([[fx-1.6,t],[fx+2.8,t],[fx+1.6,h],[fx-1,h]],c2);if(!T.open)b.line(fx,t,fx,h,dk(c1))}
  else if(T.open&&!T.bib)b.poly([[fx-1.2,t],[fx+2.6,t],[fx+1.6,h+1],[fx-.6,h+1]],c2);
  if(T.zip)b.line(fx+.6,t+1,fx+.4,h,'#c8ccd8');
  if(T.buttons)for(let y=t+3;y<h;y+=3)b.px(fx+(T.open?1.8:.5),y,T.trim?c2:shade(c1,2));
  if(T.belt)b.rect(c-6,h-4,13,2,c2===c1?shade(c1,-2):c2),b.rect(fx,h-4,2,2,'#f2c84a');
  if(T.sash)b.line(c-5,t+1,c+5,h-2,c2,2);
  if(T.stole)for(const x of[fx-1,fx+1.8])b.rect(x,t,1.6,h-t+10,c2);
  if(T.straps){b.line(c-5,t+1,c+5,h-3,shade(c1,-2),1);b.line(c-4,t+6,c+5,t+6,shade(c1,-2),1)}
  if(T.tie){b.poly([[fx+.2,t+1],[fx+1.8,t+1],[fx+2,t+8],[fx+1,t+9.5],[fx,t+8]],c2)}
  if(T.pocket)b.rect(fx-3,h-5,5,3,shade(c1,-1));
  if(T.bib){b.rect(c-2.5,t+4,7,h-t-4,c2);b.line(c-4,t,c-2,t+4,c2);b.line(c+4,t,c+3,t+4,c2)}
  if(T.trim&&!T.tasset)b.rect(c-6,h-.6,12.6,1,c2,true);
  if(T.tasset)for(const x of[c-5,c-1,c+3])b.rect(x,h-1,3.6,4,shade(c1,1));
  /* collars */
  const col=T.collar;
  if(col==='v')b.tri(fx-2.4,t-.4,fx+2.6,t-.4,fx+.4,t+4,sk);
  else if(col==='scoop')b.ell(fx,t,3,2,sk,0);
  else if(col==='shirt'){b.tri(fx-2.6,t-.6,fx,t+2.6,fx-1.2,t-1,'#ffffff');b.tri(fx+2.6,t-.6,fx,t+2.6,fx+1.4,t-1,'#ffffff')}
  else if(col==='high')b.rect(c-3.5,t-2,8,3,T.trim?c2:c1);
  else if(col==='lapel'){b.tri(fx-2.8,t-.4,fx,t+5,fx-3,t+4,shade(c1,1));b.tri(fx+3,t-.4,fx+1,t+5,fx+3.4,t+4,shade(c1,1))}
  else if(col==='wrap'){b.line(fx-3.6,t,fx+2.4,t+7,c2===c1?shade(c1,1):c2,2);b.tri(fx-1,t-.4,fx+2.6,t-.4,fx+1.6,t+4,sk)}
  else if(col==='ruff'){for(let x=c-4;x<c+6;x+=2)b.ell(x,t-.6,1.6,1.4,'#f4f4f8',0)}
  else if(col==='sailor'){b.poly([[c-6,t-.4],[c+1,t-.4],[c-1,t+5],[c-7,t+4]],c2);b.tri(fx-2,t,fx+2.4,t,fx+.4,t+5,'#ffffff');b.ell(fx+.4,t+5,1.4,1.2,'#e24a4a',0)}
  else if(col==='hood'){b.ell(c-3.4,t-.4,4.4,2.6,shade(c1,-1),1);b.line(fx+.5,t+1,fx+.5,t+6,'#f4f4f8');b.line(fx+2,t+1,fx+2,t+5,'#f4f4f8')}
  else if(col==='fur'){for(let x=c-6;x<c+7;x+=2)b.ell(x,t,1.8,1.6,'#f0e6d0',0)}
  if(T.pads){b.ell(P.nS[0]-.5,P.nS[1]-.6,3.6,2.8,T.pads===2?c2:shade(c1,1),2);}
  sideShade(b,[c1,shade(c1,1)],c-2.2,t)}
/* ---------- bottoms ---------- */
const BOTTOMS=[
 ['Pants',{kind:'pants'},['Brown']],['Jeans',{kind:'pants',stitch:1},['Azure']],['Cargo Pants',{kind:'pants',pockets:1},['Olive']],['Shorts',{kind:'shorts'},['Tan']],
 ['Skirt',{kind:'skirt'},['Crimson']],['Pleated Skirt',{kind:'skirt',pleats:1},['Navy']],['Long Skirt',{kind:'longskirt'},['Plum']],['Kilt',{kind:'skirt',plaid:1},['Forest','Crimson']],
 ['Hakama',{kind:'hakama'},['Navy']],['Harem Pants',{kind:'baggy'},['Violet']],['Leggings',{kind:'tights'},['Black']],['Greaves',{kind:'pants',armor:1},['Steel']],
 ['Leather Pants',{kind:'pants',knee:1},['Chocolate']],['Ripped Jeans',{kind:'pants',stitch:1,rip:1},['Sky']],['Track Pants',{kind:'pants',stripe:1},['Charcoal','White']],
 ['Tutu',{kind:'tutu'},['Pink']],['Wrap Skirt',{kind:'skirt',wrap:1},['Teal','Gold']],['Ranger Trousers',{kind:'pants',wraps:1},['Leather','Tan']],
 ['Striped Tights',{kind:'tights',stripes:1},['White','Crimson']],['Bloomers',{kind:'shorts',puff:1},['White']]];
function drawLeg(b,Lg,B,c1,c2,sk,inner){const{H,K,F}=Lg,k=B.kind;
  const legC=k==='tights'||k==='pants'||k==='baggy'||k==='hakama'?c1:sk;
  const w0=k==='baggy'?4.6:k==='hakama'?5.4:3.6,w1=k==='baggy'?3.8:k==='hakama'?5.6:2.8;
  b.limb(H[0],H[1],K[0],K[1],w0,k==='shorts'||k==='skirt'||k==='tutu'||k==='longskirt'?sk:legC,w0-.4);b.limb(K[0],K[1],F[0],F[1],w1,legC,w1-.2);
  if(k==='shorts'){b.limb(H[0],H[1],(H[0]+K[0])/2,(H[1]+K[1])/2+(B.puff?1:0),B.puff?4.8:4,c1,B.puff?4.6:3.8)}
  if(B.stripes)for(let t=.1;t<1;t+=.18){const x=K[0]+(F[0]-K[0])*t,y=K[1]+(F[1]-K[1])*t;b.rect(x-1.5,y,3,1,c2,true)}
  if(B.armor){b.ell(K[0],K[1],2.4,2,shade(c1,1),2);b.line(K[0],K[1]+1,F[0],F[1]-1,shade(c1,2))}
  if(B.knee)b.ell(K[0]+.4,K[1],1.8,1.6,shade(c1,-1),0);
  if(B.rip){b.rect(K[0],K[1]-1,2,1,sk);b.px(K[0]+.4,K[1]+2,sk)}
  if(B.stripe)b.line(H[0]-1.6,H[1],F[0]-1.6,F[1]-1,c2);
  if(B.wraps)for(let t=.2;t<.9;t+=.22){const x=K[0]+(F[0]-K[0])*t,y=K[1]+(F[1]-K[1])*t;b.line(x-1.6,y,x+1.6,y-1,c2)}
  if(B.stitch)b.line(K[0]+1,K[1],F[0]+1,F[1]-1,shade(c1,1))}
function drawHips(b,P,B,c1,c2){const c=P.cx,h=P.hip,k=B.kind;
  if(k==='pants'||k==='baggy'||k==='tights'||k==='shorts'){b.rect(c-5,h-2,10.5,3.4,c1);if(B.pockets)b.rect(c-5,h+4,3,3,shade(c1,-1))}
  if(k==='skirt'||k==='tutu'){const w=k==='tutu'?9:6.6,y1=h+(k==='tutu'?4:7);b.poly([[c-5,h-2],[c+5.5,h-2],[c+w,y1],[c-w-.5,y1]],c1);
    if(B.pleats)for(let x=c-5;x<c+7;x+=2)b.line(x,h,x+(x-c)*.25,y1-.5,shade(c1,-1));
    if(B.plaid){for(let x=c-6;x<c+7;x+=3)b.line(x,h-1,x,y1,c2,1,true);b.line(c-7,h+3,c+7,h+3,c2,1,true)}
    if(B.wrap)b.line(c+4,h-1,c-1,y1,c2,1);if(k==='tutu')for(let x=c-8;x<c+9;x+=2)b.px(x,y1,shade(c1,1))}
  if(k==='longskirt'||k==='hakama'){const y1=k==='hakama'?P.hip+15:P.hip+14;b.poly([[c-5,h-2],[c+5.5,h-2],[c+7.5,y1],[c-8,y1]],c1);if(k==='hakama')for(let x=c-4;x<c+6;x+=3)b.line(x,h+1,x+(x-c)*.3,y1,shade(c1,-1))}
  sideShade(b,[c1],c-2.4,h-2)}
/* ---------- shoes ---------- */
const SHOES=[
 ['Boots',{h:4},['Brown']],['Tall Boots',{h:8},['Black']],['Sneakers',{h:2,sole:'#f4f4f8'},['Crimson']],['Sandals',{h:1,open:1},['Tan']],
 ['Sabatons',{h:4,metal:1},['Steel']],['Fluffy Slippers',{h:2,fluff:1},['Pink']],['Geta',{h:1,geta:1},['Chocolate']],['Cowboy Boots',{h:6,spur:1},['Leather']],
 ['Winged Boots',{h:5,wing:1},['White']],['Loafers',{h:1},['Chocolate']],['Mary Janes',{h:1,strap:1},['Black']],['Barefoot',{none:1},['Tan']],
 ['Rain Boots',{h:6},['Amber']],['Ninja Tabi',{h:3,split:1},['Charcoal']],['Knight Greaves',{h:9,metal:1},['Silver']],['Curled Elf Shoes',{h:2,curl:1},['Green']]];
function drawFoot(b,Lg,S,c1,sk){const{K,F}=Lg;if(S.none){b.ell(F[0]+1,F[1]-.4,2.6,1.4,sk,0);return}
  const sx=F[0]+1.2,sy=F[1]-.6;
  if(S.h>2){const n=Math.min(1,S.h/8),tx=F[0]+(K[0]-F[0])*n,ty=F[1]+(K[1]-F[1])*n;b.limb(tx,ty,F[0],F[1]-1,3.4,c1,3.4)}
  b.ell(sx,sy,3.2,1.8,c1,1);
  if(S.sole)b.rect(sx-3,sy+1,6.6,1,S.sole);
  if(S.open){b.ell(sx,sy,2.6,1,sk,0);b.line(sx-2,sy,sx+2,sy-1,c1)}
  if(S.geta){b.rect(sx-2.6,sy+1,5.6,1,c1);b.ell(sx,sy-.4,2.6,1,sk,0)}
  if(S.fluff)for(let x=-3;x<4;x+=2)b.px(sx+x,sy-1.6,shade(c1,1));
  if(S.spur)b.ell(sx-3.6,sy,1,1,'#f2c84a',0);
  if(S.wing)b.leaf(sx-2,sy-2.4,sx-7,sy-5,2.2,'#f4f4f8');
  if(S.strap)b.line(sx-1,sy-1.6,sx+1.6,sy-1.6,shade(c1,1));
  if(S.metal)b.line(sx-2,sy-1.4,sx+2,sy-1.4,shade(c1,2));
  if(S.curl)b.horn(sx+2,sy,sx+5,sy-1,sx+4.4,sy-3.4,1.8,c1,.8);
  if(S.split)b.px(sx+2,sy,shade(c1,-1))}
/* ---------- things worn on the back ---------- */
const BACKS=[
 ['None',null],
 ['Short Cape',(b,P,a,c)=>{const t=P.top,x=P.cx;b.poly([[x-5,t-.4],[x+1,t-.4],[x-3,t+11],[x-9,t+12]],a);b.rect(x-5,t-1,7,1.6,c)}],
 ['Long Cape',(b,P,a,c)=>{const t=P.top,x=P.cx;b.poly([[x-5,t-.4],[x+1,t-.4],[x-2,P.gy-2],[x-6,P.gy-1],[x-11,P.gy-3]],a);b.line(x-5,t+2,x-9,P.gy-4,shade(a,-1));b.rect(x-5,t-1,7,1.6,c)}],
 ['Tattered Cape',(b,P,a,c)=>{const t=P.top,x=P.cx;b.poly([[x-5,t-.4],[x+1,t-.4],[x-2,P.gy-6],[x-4,P.gy-9],[x-6,P.gy-4],[x-8,P.gy-8],[x-11,P.gy-5]],a);b.rect(x-5,t-1,7,1.6,c)}],
 ['Royal Cape',(b,P,a,c)=>{const t=P.top,x=P.cx;b.poly([[x-5,t-.4],[x+1,t-.4],[x-1,P.gy-2],[x-12,P.gy-2]],a);for(let k=-6;k<3;k+=2)b.ell(x+k,t,1.8,1.8,'#f4f0e4',0);b.px(x-3,t+1,'#1e1c28')}],
 ['Angel Wings',(b,P,a,c)=>{const t=P.top,x=P.cx-4;for(let k=0;k<4;k++)b.leaf(x,t+2+k*1.6,x-14+k,t-9+k*4,5-k*.6,k%2?a:lt(a))}],
 ['Bat Wings',(b,P,a,c)=>{const t=P.top,x=P.cx-4;b.poly([[x,t+1],[x-6,t-8],[x-15,t-4],[x-12,t+1],[x-14,t+6],[x-9,t+5],[x-8,t+10],[x-3,t+7]],a);b.line(x,t+1,x-15,t-4,shade(a,-1));b.line(x,t+2,x-14,t+6,shade(a,-1))}],
 ['Butterfly Wings',(b,P,a,c)=>{const t=P.top,x=P.cx-4;b.ell(x-7,t-2,7,6.4,a,1);b.ell(x-6,t+7,5,4.6,c,1);b.ell(x-8,t-3,2.4,2.2,c,0);b.ell(x-6,t+7,1.6,1.6,a,0)}],
 ['Dragon Wings',(b,P,a,c)=>{const t=P.top,x=P.cx-4;b.poly([[x,t],[x-4,t-10],[x-16,t-11],[x-13,t-5],[x-17,t-2],[x-12,t+1],[x-15,t+6],[x-6,t+6]],a);for(const[ex,ey]of[[-16,-11],[-17,-2],[-15,6]])b.line(x-4,t-9,x+ex,t+ey,shade(a,-1));b.px(x-4,t-11,c)}],
 ['Fairy Wings',(b,P,a,c)=>{const t=P.top,x=P.cx-4;b.leaf(x,t+3,x-12,t-10,6,mix(a,'#ffffff',.4));b.leaf(x,t+5,x-11,t+11,4.4,mix(c,'#ffffff',.4));b.line(x,t+3,x-11,t-9,a)}],
 ['Mech Wings',(b,P,a,c)=>{const t=P.top,x=P.cx-4;for(let k=0;k<3;k++){b.poly([[x,t+k*3],[x-13+k*1.4,t-8+k*5],[x-14+k*1.4,t-6+k*5],[x,t+2+k*3]],a);b.px(x-12+k*1.4,t-7+k*5,c)}b.rect(x-3,t,4,6,shade(a,-1))}],
 ['Backpack',(b,P,a,c)=>{const t=P.top,x=P.cx-6.5;b.rect(x-3,t+1,6,11,a);b.rect(x-3,t+7,6,1.6,c);b.ell(x,t+1,3,1.6,shade(a,1),0)}],
 ['Quiver',(b,P,a,c)=>{const t=P.top,x=P.cx-6;b.poly([[x-1,t+12],[x+2,t+13],[x-4,t-4],[x-7,t-3]],a);for(let k=0;k<3;k++)b.leaf(x-6+k*1.6,t-4,x-7+k*1.6,t-9,2,c)}],
 ['Long Scarf',(b,P,a,c)=>{const t=P.top,x=P.cx;b.ell(x+.5,t,6.4,2.4,a,1);b.horn(x-4,t,x-12,t+3,x-17,t+1,3.4,a,2.6);b.horn(x-4,t+1,x-10,t+8,x-15,t+7,3,shade(a,-1),2.4);for(const yy of[1,7])b.px(x-16,t+yy,c)}],
 ['Shield',(b,P,a,c)=>{const t=P.top,x=P.cx-7;b.poly([[x-5,t],[x+4,t],[x+4,t+8],[x,t+13],[x-5,t+8]],a);b.poly([[x-3,t+2],[x+2,t+2],[x+2,t+7],[x,t+10],[x-3,t+7]],c);b.ell(x-.5,t+5,1.4,1.4,a,0)}],
 ['Banner',(b,P,a,c)=>{const t=P.top,x=P.cx-6;b.line(x,t+12,x-2,t-14,'#8a5a32',1);b.poly([[x-2,t-14],[x-12,t-13],[x-10,t-9],[x-12,t-5],[x-1.4,t-6]],a);b.star(x-6,t-9.6,1.8,c)}],
 ['Cat Tail',(b,P,a,c)=>{const h=P.hip,x=P.cx-5;b.horn(x,h-1,x-9,h-2,x-9,h-12,2.4,a,2.2)}],
 ['Fox Tail',(b,P,a,c)=>{const h=P.hip,x=P.cx-5;b.horn(x,h-1,x-12,h+2,x-11,h-10,5,a,3);b.ell(x-11,h-10,2.4,2.4,'#f4f4f8',0)}],
 ['Dragon Tail',(b,P,a,c)=>{const h=P.hip,x=P.cx-5;b.horn(x,h-1,x-8,h+6,x-15,h+10,4.4,a,1);for(let k=0;k<4;k++)b.tri(x-3-k*3,h+1+k*2.4,x-5-k*3,h+1+k*2.4,x-4-k*3,h-1+k*2.4,c)}],
 ['Jetpack',(b,P,a,c)=>{const t=P.top,x=P.cx-7;b.rect(x-3,t+1,6,10,a);b.rect(x-4,t+3,2,8,shade(a,-1));b.ell(x-1,t+11,2,1.2,'#5a5e74',0);b.tri(x-2.6,t+12,x+.6,t+12,x-1,t+16,c);b.tri(x-1.8,t+12,x-.2,t+12,x-1,t+14.6,'#fff2a0')}],
];
/* ---------- the face: glasses, masks, paint and beards ---------- */
const FACES=[
 ['None',null],
 ['Round Glasses',(b,P,a,c)=>{const y=P.hy+.5;for(const x of[P.hx+1.5,P.hx+6.2]){b.ell(x,y,2.4,2.2,a,0);b.ell(x,y,1.5,1.3,null,0)}b.line(P.hx+3.4,y,P.hx+4.4,y,a);b.line(P.hx-.8,y,P.hx-5,y-.6,a)}],
 ['Square Glasses',(b,P,a,c)=>{const y=P.hy-1;for(const x of[P.hx,P.hx+4.8]){b.rect(x,y,3.4,3,a);b.rect(x+.7,y+.7,2,1.6,null)}b.line(P.hx-.4,y+1,P.hx-5,y+.4,a)}],
 ['Sunglasses',(b,P,a,c)=>{const y=P.hy+.4;b.ell(P.hx+1.5,y,2.6,1.8,a,0);b.ell(P.hx+6.4,y,2.2,1.8,a,0);b.line(P.hx+3,y-1,P.hx+5,y-1,a);b.px(P.hx+1,y-.6,'#ffffff');b.line(P.hx-1,y-.8,P.hx-5,y-1.2,a)}],
 ['Monocle',(b,P,a,c)=>{const x=P.hx+6.2,y=P.hy+.5;b.ell(x,y,2.4,2.4,a,0);b.ell(x,y,1.6,1.6,null,0);b.line(x,y+2.4,x-2,y+8,a)}],
 ['Eyepatch',(b,P,a,c)=>{const x=P.hx+6.2,y=P.hy+.5;b.ell(x,y,2.4,2.2,a,0);b.line(x-2,y-1.6,P.hx-5,y-4,a);b.line(x+2,y-1.6,x+3,y-3,a)}],
 ['Eye Goggles',(b,P,a,c)=>{const y=P.hy+.5;b.line(P.hx-6,y-.4,P.hx+9,y-.4,a,2);for(const x of[P.hx+1.5,P.hx+6.2]){b.ell(x,y,2.6,2.4,a,0);b.ell(x,y,1.8,1.6,c,0);b.px(x-.6,y-.6,'#ffffff')}}],
 ['Mouth Mask',(b,P,a,c)=>{const x=P.hx+4.4,y=P.hy+4.6;b.ell(x,y,4.4,2.8,a,1);b.line(x-4,y-1,P.hx-5,y-3,a)}],
 ['Ninja Mask',(b,P,a,c)=>{const x=P.hx,y=P.hy+3;b.poly([[x-8,y-1.4],[x+9,y-1.4],[x+8,y+5],[x+2,y+6],[x-6,y+4]],a)}],
 ['Domino Mask',(b,P,a,c)=>{const y=P.hy+.4;b.poly([[P.hx-1,y-2],[P.hx+9,y-2],[P.hx+8.6,y+2],[P.hx+4,y+1],[P.hx,y+2]],a);for(const x of[P.hx+1.5,P.hx+6.2])b.ell(x,y,1.2,1,'#ffffff',0)}],
 ['Fox Mask',(b,P,a,c)=>{const x=P.hx-4.5,y=P.hy-3;b.ell(x,y,3.6,4,a,1);b.tri(x-3,y-2,x-1,y-3,x-2.6,y-6,a);b.tri(x+1,y-3,x+3,y-2,x+2.6,y-6,a);b.line(x-2,y,x-.6,y+.6,c);b.line(x+.6,y+.6,x+2,y,c);b.px(x,y+2,c)}],
 ['War Paint',(b,P,a,c)=>{for(const k of[0,2])b.line(P.hx+4,P.hy+2+k,P.hx+8,P.hy+1.4+k,a)}],
 ['Cheek Marks',(b,P,a,c)=>{b.tri(P.hx+5,P.hy+3,P.hx+8,P.hy+3,P.hx+6.4,P.hy+5,a)}],
 ['Whiskers',(b,P,a,c)=>{for(const k of[-.6,.6])b.line(P.hx+5,P.hy+3.6+k*2,P.hx+9,P.hy+3+k*2.6,a)}],
 ['Scar',(b,P,a,c)=>{b.line(P.hx+4.6,P.hy-3.6,P.hx+7.4,P.hy+3,mix(a,'#ff7a8a',.4));b.px(P.hx+5,P.hy-1,'#fff0f0')}],
 ['Bandage',(b,P,a,c)=>{b.rect(P.hx+3.4,P.hy+2.4,4,2,a);b.px(P.hx+4,P.hy+3,shade(a,-1));b.px(P.hx+6,P.hy+3,shade(a,-1))}],
 ['Freckles',(b,P,a,c)=>{for(const[x,y]of[[5,2.6],[7,3],[6,4],[3.4,3]])b.px(P.hx+x,P.hy+y,a)}],
 ['Blush',(b,P,a,c)=>{b.ell(P.hx+6.4,P.hy+3.6,1.8,1.1,a,0);b.ell(P.hx+1.4,P.hy+3.6,1.4,1,a,0)}],
 ['Full Beard',(b,P,a,c)=>{b.poly([[P.hx-3,P.hy+1],[P.hx+1,P.hy+3],[P.hx+8,P.hy+4],[P.hx+7,P.hy+9],[P.hx+2,P.hy+11],[P.hx-3,P.hy+6]],a);b.rect(P.hx+3.4,P.hy+4.6,3,1,'#2a1a2a')}],
 ['Mustache',(b,P,a,c)=>{b.poly([[P.hx+2.4,P.hy+4],[P.hx+7.4,P.hy+3.4],[P.hx+8.6,P.hy+5],[P.hx+5,P.hy+4.8],[P.hx+2,P.hy+5.6]],a)}],
 ['Goatee',(b,P,a,c)=>{b.poly([[P.hx+3.4,P.hy+6.4],[P.hx+6.6,P.hy+6.4],[P.hx+5.4,P.hy+9.4],[P.hx+4,P.hy+9]],a)}],
 ['Stubble',(b,P,a,c)=>{for(const[x,y]of[[0,4],[2,6],[4,7],[6,6.4],[1,7],[-1,5],[5,8]])b.px(P.hx+x,P.hy+y,mix(a,'#f8d2b4',.4))}],
 ['Hoop Earring',(b,P,a,c)=>{b.ell(P.hx-5.6,P.hy+4,1.4,1.6,a,0);b.px(P.hx-5.6,P.hy+4,null)}],
 ['Third Eye',(b,P,a,c)=>{b.ell(P.hx+4.4,P.hy-4.4,1.3,1.6,a,0);b.px(P.hx+4.4,P.hy-4.4,'#ffffff')}],
 ['Tear Mark',(b,P,a,c)=>{b.ell(P.hx+6.4,P.hy+3.4,.8,1.2,a,0)}],
 ['Star Sticker',(b,P,a,c)=>{b.star(P.hx+7.2,P.hy+3,1.8,a,5,.5)}],
];
/* defaults for a fresh look */
const DEFAULT_LOOK={skin:'Fair',eyes:'Round',eyeC:'Azure',brows:'Soft',mouth:'Smile',ears:'Human',hair:'Spiky Hero',hairC:'Chocolate',
  hat:'None',hatC1:'Royal',hatC2:'Gold',top:'Tunic',topC1:'Forest',topC2:'Brown',bot:'Pants',botC1:'Brown',botC2:'Tan',shoes:'Boots',shoeC:'Chocolate',
  back:'None',backC1:'Crimson',backC2:'Gold',face:'None',faceC:'Charcoal',faceC2:'White',glove:''};
const byName=(list,n)=>list.find(x=>x[0]===n)||list[0];

/* ---------- putting a character together ----------
   w: the held weapon (drawn by weapons.js through the hooks below), pose: a pose object or a POSES name */
let WEAPON_HOOK=null; // set by weapons.js: (b,P,look,weapon,layer) layer 'back' or 'front'
function drawDoll(L,pose,w){L=Object.assign({},DEFAULT_LOOK,L||{});const P=rig(typeof pose==='string'?POSES[pose]:pose);
  const b=new Buf(DOLL_W,DOLL_H),N=DOLL_W*DOLL_H,ring=new Uint8Array(N),sk=skinOf(L);
  /* every part is drawn on its own layer and gets a soft edge in its own dark shade, so parts read apart;
     at the end the outermost edge turns to ink */
  const lay=(fn,edge=true,mask=null)=>{const t=new Buf(DOLL_W,DOLL_H);fn(t);if(mask)for(let y=0;y<DOLL_H;y++)for(let x=0;x<DOLL_W;x++)if(mask(x,y))t.d[y*DOLL_W+x]=null;
    let rs=null;if(edge){const before=t.d.slice();t.softline();rs=[];for(let i=0;i<N;i++)if(before[i]===null&&t.d[i]!==null)rs.push(i)}
    for(let i=0;i<N;i++)if(t.d[i]!==null){b.d[i]=t.d[i];ring[i]=0}if(rs)for(const i of rs)ring[i]=1};
  const H=byName(HAIRS,L.hair),hat=byName(HATS,L.hat),TT=byName(TOPS,L.top),T=TT[1],Bt=byName(BOTTOMS,L.bot)[1],Sh=byName(SHOES,L.shoes)[1],BK=byName(BACKS,L.back),FC=byName(FACES,L.face);
  const hc=dyeOf(L.hairC,'Chocolate'),t1=dyeOf(L.topC1,TT[2][0]),t2=dyeOf(L.topC2,TT[2][1]),b1=dyeOf(L.botC1,'Brown'),b2=dyeOf(L.botC2,'Tan'),s1=dyeOf(L.shoeC,'Chocolate');
  const glove=L.glove?dyeOf(L.glove):null,hide=hat[2]||'';
  if(BK[1])lay(t=>BK[1](t,P,dyeOf(L.backC1,'Crimson'),dyeOf(L.backC2,'Gold')));
  if(hide!=='all')lay(t=>hairBack(t,P,hc,H[1]));
  if(WEAPON_HOOK)lay(t=>WEAPON_HOOK(t,P,L,w,'back'));
  lay(t=>{drawArm(t,P.fArm,T,shade(t1,-1),t2,shade(sk,-1),glove&&shade(glove,-1))});
  lay(t=>{drawLeg(t,P.fLeg,Bt,shade(b1,-1),b2,shade(sk,-1));drawFoot(t,P.fLeg,Sh,shade(s1,-1),shade(sk,-1))});
  lay(t=>{drawLeg(t,P.nLeg,Bt,b1,b2,sk);drawFoot(t,P.nLeg,Sh,s1,sk)});
  lay(t=>{drawHips(t,P,Bt,b1,b2);t.rect(P.hx-2.2,P.hy+6.5,4,4,shade(sk,-1));drawTorso(t,P,T,t1,t2,sk)});
  lay(t=>drawHead(t,P,L));
  drawFace(b,P,L);
  if(FC[1])lay(t=>FC[1](t,P,dyeOf(L.faceC,'Charcoal'),dyeOf(L.faceC2,'White')),false);
  if(hide==='')lay(t=>hairCap(t,P,hc,H[2]),true,(x,y)=>faceWindow(P,x,y));
  if(hide!=='all')lay(t=>{hairBangs(t,P,hc,H[3]);if(H[4]==='ahoge'&&hide==='')drawAhoge(t,P,hc)});
  if(hat[1])lay(t=>hat[1](t,P,dyeOf(L.hatC1,'Royal'),dyeOf(L.hatC2,'Gold')));
  if(WEAPON_HOOK)lay(t=>WEAPON_HOOK(t,P,L,w,'mid'));
  lay(t=>drawArm(t,P.nArm,T,t1,t2,sk,glove));
  if(WEAPON_HOOK)lay(t=>WEAPON_HOOK(t,P,L,w,'front'));
  /* the outer edge in ink; anything still unedged gets an ink ring */
  for(let y=0;y<DOLL_H;y++)for(let x=0;x<DOLL_W;x++){const i=y*DOLL_W+x;if(b.d[i]===null||!ring[i])continue;
    if(x===0||y===0||x===DOLL_W-1||y===DOLL_H-1||b.d[i-1]===null||b.d[i+1]===null||b.d[i-DOLL_W]===null||b.d[i+DOLL_W]===null)b.d[i]=INK}
  return b}
/* the colours each piece comes in before you dye it */
const ITEM_DYES={
 hat:{'Wizard Hat':['Royal','Gold'],'Witch Hat':['Black','Violet'],'Top Hat':['Black','Crimson'],'Bowler':['Charcoal','Maroon'],'Cap':['Crimson','White'],'Backwards Cap':['Azure','White'],
  'Beanie':['Teal','Cream'],'Pom Beanie':['Rose','White'],'Beret':['Maroon','Black'],'Cowboy Hat':['Leather','Chocolate'],'Straw Hat':['Blonde','Crimson'],'Adventurer Hat':['Brown','Chocolate'],
  'Pirate Tricorn':['Black','Gold'],'Bandana':['Crimson','White'],'Headband':['Crimson','White'],'Crown':['Gold','Crimson'],'Tiara':['Silver','Sky'],'Circlet':['Gold','Azure'],'Laurel Wreath':['Green','Gold'],
  'Flower Crown':['Pink','Lemon'],'Halo':['Lemon','White'],'Knight Helm':['Steel','Crimson'],'Viking Helm':['Steel','Brown'],'Winged Helm':['Silver','White'],'Samurai Kabuto':['Charcoal','Gold'],
  'Spartan Helm':['Bronze','Crimson'],'Hood':['Forest','Chocolate'],'Cat-Ear Hood':['Charcoal','Pink'],'Cat Ears':['Black','Pink'],'Bunny Ears':['White','Pink'],'Fox Ears':['Orange','Cream'],
  'Demon Horns':['Charcoal','Crimson'],'Antlers':['Tan','Brown'],'Unicorn Horn':['Lavender','Gold'],'Chef Hat':['White','Silver'],'Jester Hat':['Crimson','Royal'],'Party Hat':['Magenta','Lemon'],
  'Propeller Cap':['Royal','Crimson'],'Graduation Cap':['Black','Gold'],'Ushanka':['Brown','Cream'],'Bucket Hat':['Olive','Tan'],'Goggles':['Leather','Sky'],'Headphones':['Charcoal','Cyan'],
  'Ribbon Bow':['Crimson','Gold'],'Mushroom Cap':['Red','White'],'Frog Hat':['Green','Crimson'],'Nightcap':['Azure','White'],'Royal Circlet':['Silver','Violet']},
 back:{'Short Cape':['Crimson','Gold'],'Long Cape':['Royal','Gold'],'Tattered Cape':['Charcoal','Silver'],'Royal Cape':['Crimson','White'],'Angel Wings':['White','Cream'],'Bat Wings':['Charcoal','Crimson'],
  'Butterfly Wings':['Azure','Lemon'],'Dragon Wings':['Forest','Gold'],'Fairy Wings':['Mint','Pink'],'Mech Wings':['Steel','Cyan'],'Backpack':['Leather','Crimson'],'Quiver':['Brown','White'],
  'Long Scarf':['Crimson','Gold'],'Shield':['Steel','Royal'],'Banner':['Crimson','Gold'],'Cat Tail':['Black','White'],'Fox Tail':['Orange','White'],'Dragon Tail':['Forest','Lime'],'Jetpack':['Steel','Orange']},
 face:{'Round Glasses':['Charcoal'],'Square Glasses':['Black'],'Sunglasses':['Black'],'Monocle':['Gold'],'Eyepatch':['Black'],'Eye Goggles':['Leather','Sky'],'Mouth Mask':['White'],'Ninja Mask':['Charcoal'],
  'Domino Mask':['Black'],'Fox Mask':['White','Crimson'],'War Paint':['Crimson'],'Cheek Marks':['Violet'],'Whiskers':['Charcoal'],'Scar':['Rose'],'Bandage':['Cream'],'Freckles':['Rust'],'Blush':['Rose'],
  'Full Beard':['Chocolate'],'Mustache':['Chocolate'],'Goatee':['Chocolate'],'Stubble':['Charcoal'],'Hoop Earring':['Gold'],'Third Eye':['Crimson'],'Tear Mark':['Azure'],'Star Sticker':['Lemon']}};
function itemDyes(cat,name){if(cat==='top')return byName(TOPS,name)[2];if(cat==='bot')return byName(BOTTOMS,name)[2];if(cat==='shoes')return byName(SHOES,name)[2];return(ITEM_DYES[cat]||{})[name]||['Royal','Gold']}
