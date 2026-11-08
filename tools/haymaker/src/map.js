/* ================= Port Ember: the city you walk around =================
   A top-down town of 60 x 46 tiles (16 ring units each). Streets, a park with the bell statue, the harbor with two
   piers, and every ring: the Bell & Anchor gym, St. Brine's, the Crown Arena, the Velvet Lantern, the Cold Row ice
   house, the Fish Market pier and the drydock. Walk with the D-pad (hold B to run), A talks and opens doors. */
const MW=60,MH=46,T=16;
const GRD=new Uint8Array(MW*MH);/* 0 pavement, 1 road, 2 grass, 3 water, 4 boards, 5 plaza */
const gset=(x0,y0,x1,y1,v)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(x>=0&&y>=0&&x<MW&&y<MH)GRD[y*MW+x]=v};
gset(0,10,59,11,1);gset(0,24,59,25,1);gset(0,33,59,34,1);gset(14,0,15,34,1);gset(46,0,47,34,1);gset(30,8,31,12,1);gset(30,23,31,34,1);
gset(18,13,43,22,2);gset(26,15,35,20,5);gset(30,13,31,14,5);gset(30,21,31,22,5);gset(18,17,25,18,5);gset(36,17,43,18,5);
gset(0,36,59,37,4);gset(0,38,59,45,3);gset(5,38,13,45,4);gset(42,38,58,41,4);
const gAt=(x,y)=>x<0||y<0||x>=MW||y>=MH?3:GRD[y*MW+x];
/* buildings: footprint in tiles; the bottom two rows are the front wall with the door */
const BLD=[
  {id:'chapel',x:2,y:1,w:10,h:7,wall:'#8a6a52',roof:'#6a2a2e',door:7,venue:'chapel',sign:"ST. BRINE'S",tall:26,style:'chapel'},
  {id:'arena',x:19,y:0,w:24,h:8,wall:'#3a2a5a',roof:'#2a1a40',door:31,venue:'crown',sign:'CROWN ARENA',tall:14,style:'arena'},
  {id:'club',x:49,y:1,w:9,h:7,wall:'#2a1a30',roof:'#1a1024',door:53.5,venue:'roof',sign:'VELVET LANTERN',tall:8,style:'club'},
  {id:'row',x:3,y:12,w:9,h:3,wall:'#5a6a8a',roof:'#3a3a4a',sign:null,tall:4,style:'apts'},
  {id:'gym',x:2,y:16,w:10,h:6,wall:'#8a3a2a',roof:'#3a2a2a',door:7,venue:'gym',sign:'BELL & ANCHOR',tall:6,style:'gym'},
  {id:'ice',x:49,y:14,w:10,h:8,wall:'#9ab8cc',roof:'#5a7a90',door:54,venue:'ice',sign:'COLD ROW ICE',tall:6,style:'ice'},
  {id:'market',x:2,y:27,w:10,h:5,wall:'#c89a5a',roof:'#2a6a8a',sign:'FISH MARKET',tall:4,style:'market'},
  {id:'apts',x:17,y:27,w:6,h:5,wall:'#a85a3a',roof:'#4a3a3a',sign:null,tall:10,style:'apts'},
  {id:'laund',x:23,y:27,w:6,h:5,wall:'#5aa8a0',roof:'#3a4a4a',sign:'SUDS',tall:4,style:'shop',awn:'#f4f1ea'},
  {id:'pawn',x:33,y:27,w:6,h:5,wall:'#6a5a3a',roof:'#3a3428',sign:'PAWN',tall:4,style:'shop',awn:'#c8263a'},
  {id:'paper',x:39,y:27,w:6,h:5,wall:'#d8d0c0',roof:'#4a4a52',sign:'EMBER DAILY',tall:6,style:'apts'},
  {id:'diner',x:50,y:27,w:8,h:5,wall:'#e8e2d0',roof:'#2f6b2a',sign:'PICKLE JAR',tall:4,style:'shop',awn:'#2f6b2a'}];
/* outdoor rings on the piers, and the big ship at the drydock */
const RINGS=[{venue:'pier',x:6,y:40,w:7,h:5},{venue:'dock',x:46,y:38,w:7,h:4}];
const SHIP={x:52,y:42,w:8,h:4};
/* props: trees, lamps, benches, crates, the bell statue, parked cars, cranes */
const PROPS=[];(()=>{const P=(k,x,y,o={})=>PROPS.push(Object.assign({k,x,y},o));
  for(let x=19;x<=42;x+=3)if(x<29||x>32){P('tree',x,13.3);P('tree',x,22.2)}for(let y=15;y<=20;y+=2.5){P('tree',18.5,y);P('tree',42.5,y)}
  P('statue',30.5,17.6);for(const[x,y]of[[27,16],[34,16],[27,19.5],[34,19.5]])P('bench',x,y);
  for(let x=2;x<58;x+=6){P('lamp',x+.5,9.4);P('lamp',x+3.5,23.4);P('lamp',x+.5,32.4)}
  for(const[x,y]of[[1,37],[3,36.6],[12.6,37],[40,36.6],[41.2,37],[58,37],[44,40.6],[57.2,39]])P(['crate','barrel'][(x*7|0)%2],x,y);
  P('crane',43.5,39);P('crane',57.2,40.2);P('hydrant',13,23);P('hydrant',45,9.2);P('hydrant',16.4,32.4);
  P('car',20,24.1,{c:'#c8263a'});P('car',37,24.1,{c:'#2a5ac8'});P('car',53,33.1,{c:'#e5bd4f'});P('car',8,10.1,{c:'#2f6b2a'});P('car',24,33.1,{c:'#e8e2d0'});
  P('boat',20,41,{c:'#c8463a'});P('boat',33,43,{c:'#e8e2d0'});P('mail',12.6,15)})();
const PROPSOLID={tree:[.7,.5],lamp:[.3,.3],bench:[1,.4],statue:[2.6,1.6],crate:[.8,.6],barrel:[.6,.5],crane:[1.6,1.2],hydrant:[.4,.3],car:[1.9,.9],mail:[.5,.4]};
/* solid tiles */
const SOL=new Uint8Array(MW*MH);(()=>{for(let i=0;i<MW*MH;i++)if(GRD[i]===3)SOL[i]=1;
  const box=(x,y,w,h)=>{for(let yy=Math.floor(y);yy<Math.ceil(y+h);yy++)for(let xx=Math.floor(x);xx<Math.ceil(x+w);xx++)if(xx>=0&&yy>=0&&xx<MW&&yy<MH)SOL[yy*MW+xx]=1};
  for(const b of BLD)box(b.x,b.y,b.w,b.h);for(const r of RINGS)box(r.x,r.y,r.w,r.h)})();
/* is the point (in ring units) blocked? props block with their own small boxes */
function blocked(px,py){const tx=Math.floor(px/T),ty=Math.floor(py/T);if(tx<0||ty<0||tx>=MW||ty>=MH||SOL[ty*MW+tx])return true;
  for(const p of PROPS){const s=PROPSOLID[p.k];if(!s)continue;if(Math.abs(px-p.x*T)<s[0]*T/2+3&&py<p.y*T+2&&py>p.y*T-s[1]*T)return true}
  for(const n of npcsHere())if(Math.abs(px-n.x)<6&&Math.abs(py-n.y)<4)return true;return false}

/* ---------- the people in town ---------- */
const TOWN=[
  {id:'dot',x:9.6,y:22.6,look:'dot',name:'AUNTIE DOT',lines:()=>[dotHint()]},
  {id:'kid',x:20,y:26.4,look:{skin:'#c98c62',hair:'afro',hairCol:'#2a1a12',out:'#e8662a'},name:'KID',lines:()=>[SAVE.done?'CHAMP! Sign my glove! Both gloves! My forehead!':'Are you the boxer? Sign my glove! Wait, I don\'t have a glove.']},
  {id:'cop',x:44.6,y:12.5,look:{skin:'#e0a982',hair:'buzz',hairCol:'#3a2416',out:'#22305a'},name:'OFFICER RUIZ',lines:()=>[SAVE.beaten.sable?'We\'ve got Sable\'s ledger. Thanks for the push, Brass.':'Keep it in the ring, Brass. Sable\'s got friends at the station. Not me, though.']},
  {id:'paper',x:42,y:32.6,look:{skin:'#a86e48',hair:'fade',hairCol:'#1c130f',out:'#d8d0c0'},name:'PAPER SELLER',lines:()=>[headline()]},
  {id:'fisher',x:4,y:37.3,look:{skin:'#f1c8a5',hair:'bald',hairCol:'#a08a6a',out:'#3a6a4a'},name:'OLD FISHER',lines:()=>['Gulls stole my lunch again. Third time today. They\'re organised.']},
  {id:'chef',x:55,y:32.6,look:{skin:'#e0a982',hair:'buzz',hairCol:'#d8d0c0',out:'#f4f1ea'},name:'DINER COOK',lines:()=>['Gus eats a jar of pickled eggs before every spar. I don\'t ask questions.']},
  {id:'nun',x:9,y:9.2,look:{skin:'#c99674',hair:'bun',hairCol:'#2a2a30',out:'#2a2a3a'},name:'SISTER AGNES',lines:()=>[SAVE.beaten.hal?'The orphanage roof got fixed anyway. Victor\'s money, they say. Funny how that worked out.':'Brother Halloran rings the bell at dawn. He\'s been ringing it for thirty years.']},
  {id:'dj',x:52,y:8.8,look:{skin:'#6e4130',hair:'locs',hairCol:'#1a1012',out:'#ff3ea5'},name:'BOUNCER',lines:()=>[SAVE.beaten.lola?'Lola says you\'re on the list. Forever.':'Velvet Lantern\'s roof is a ring tonight. Lola Cadena\'s house. Rain or shine.']},
  {id:'dock',x:44.5,y:37.3,look:{skin:'#8a5536',hair:'buzz',hairCol:'#1c130f',out:'#e8b62c'},name:'DOCKHAND',lines:()=>['Big Tide once carried a whole anchor up Harbor Hill. For a bet. He lost the bet.']},
  {id:'ann',x:33.5,y:9.3,look:'ann',name:'ANNOUNCER',lines:()=>[SAVE.done?'Champ! The arena\'s yours any night. Want a rematch with somebody? Go see them at their ring.':'The Crown Arena seats twelve thousand. Win the Circuit and every seat will be screaming your name.']},
  /* the fighters hang around their rings once you've met them */
  {id:'gus',x:12.6,y:22.6,look:'gus',name:'GUS',show:()=>true,lines:()=>[SAVE.beaten.gus?'Pickled egg? No? More for me. Go get \'em, kid.':'Dot says we spar downstairs. Come on in, I\'ll go easy. Mostly.']},
  {id:'vex',x:10,y:38.6,look:'vex',name:'TINY VEX',show:()=>SAVE.met.vex,lines:()=>[SAVE.beaten.vex?'Rope-boy! I\'m betting on you now. Mostly.':'Ooh, the dock boy! Come to the ring, I dare you!']},
  {id:'hal',x:4.5,y:9.3,look:'hal',name:'BROTHER HALLORAN',show:()=>SAVE.met.hal,lines:()=>['Patience, son. The bell keeps its own time.']},
  {id:'volk',x:57,y:23,look:'volk',name:'VOLKOV',show:()=>SAVE.met.volk,lines:()=>[SAVE.beaten.volk?'My daughter starts school next month. Real school. Thank you.':'Cold.']},
  {id:'lola',x:56.5,y:8.8,look:'lola',name:'LOLA',show:()=>SAVE.met.lola,lines:()=>[SAVE.beaten.lola?'You still dance better than you talk, querido.':'Half my steps are lies. Which half? Come find out.']},
  {id:'tide',x:54,y:37.4,look:'tide',name:'BIG TIDE',show:()=>SAVE.met.tide,lines:()=>[SAVE.beaten.tide?'The tide turned, Little Brass. The yard stays open.':'Steady now. The tide comes for everyone.']},
  {id:'sable',x:28,y:9.3,look:'sable',name:'VICTOR SABLE',show:()=>SAVE.met.sable&&!SAVE.beaten.sable,lines:()=>['My arena. My city. Enjoy the view while you can.']}];
for(const n of TOWN){n.x*=T;n.y*=T;n.hx=n.x;n.hy=n.y;n.d='down';n.t=rnd()*3;n.f=0}
const npcsHere=()=>TOWN.filter(n=>!n.show||n.show());
function headline(){const n=Object.keys(SAVE.beaten).length;return SAVE.done?'EXTRA! SABLE IN CUFFS! DOCKWORKER CHAMP SAVES GYM!':n>=4?'EXTRA! BRASS ON A TEAR! CROWN ARENA SOLD OUT!':n>=1?'EXTRA! DOCKWORKER WINS AGAIN! SABLE "NOT WORRIED"!':'EXTRA! DOCKWORKER TAKES ON SABLE! "HE\'S DOOMED," SAYS SABLE!'}
function dotHint(){const o=objective();if(SAVE.done)return'Champion of Port Ember. Your daddy\'s bell is ringing every night. Rematch anyone you like at their ring.';
  if(!o)return'Go on, champ.';return o.oi===0?'Gus is downstairs. Spar with him first: come inside the gym.':'Next is '+PEOPLE[OPP[o.oi].p].name+' at '+VENUES[o.venue].name+'. '+OPP[o.oi].tips[0]}

/* ---------- the story's next stop ---------- */
function objective(){if(SAVE.done)return null;const s=STORY[SAVE.step];if(!s||!s.startsWith('s:pre'))return null;const oi=+s.slice(5);return{oi,venue:OPP[oi].venue}}
function doorOf(v){const b=BLD.find(b=>b.venue===v);if(b)return{x:b.door*T,y:(b.y+b.h)*T+4};const r=RINGS.find(r=>r.venue===v);return{x:(r.x+r.w/2)*T,y:r.y*T-6}}
/* ---------- you on the map ---------- */
const MP={x:7.5*T,y:22.7*T,d:'up',moving:false,t:0,run:false};
let DLG=null;
function enterMap(fresh){if(fresh||!SAVE.pos){MP.x=7.5*T;MP.y=22.7*T;MP.d='down'}else{MP.x=SAVE.pos.x;MP.y=SAVE.pos.y;MP.d=SAVE.pos.d||'down'}DLG=null;HUB='map';go('map')}
function mapTick(dt){
  if(DLG){if(TAP('a')||TAP('b')){DLG.i++;SFX.move();if(DLG.i>=DLG.lines.length)DLG=null}return}
  if(TAP('start')){SFX.back();go('mappause');return}
  const H=RAW.held,dx=(H.right?1:0)-(H.left?1:0),dy=(H.down?1:0)-(H.up?1:0);MP.run=!!H.b;MP.moving=!!(dx||dy);
  if(MP.moving){MP.d=dx&&Math.abs(dx)>=Math.abs(dy)&&!dy?(dx>0?'right':'left'):dy?(dy>0?'down':'up'):(dx>0?'right':'left');MP.t+=dt*(MP.run?1.6:1);
    const sp=(MP.run?104:62)*dt/(dx&&dy?1.41:1);
    const nx=MP.x+dx*sp;if(!blocked(nx+dx*5,MP.y)&&!blocked(nx+dx*5,MP.y-4))MP.x=nx;else bump(dx,0);
    const ny=MP.y+dy*sp;if(!blocked(MP.x-4,ny+dy*3)&&!blocked(MP.x+4,ny+dy*3))MP.y=ny;else bump(0,dy)}
  for(const n of npcsHere()){n.t+=dt;if(n.id==='dot'||n.look===n.id&&!['vex','tide'].includes(n.id))continue;if(n.t>3+((n.hx*7)%3)){n.t=0;const a=pick([[1,0],[-1,0],[0,1],[0,-1],[0,0]]),tx=n.hx+a[0]*T,ty=n.hy+a[1]*T;if(!SOL[Math.floor(ty/T)*MW+Math.floor(tx/T)]&&Math.hypot(tx-MP.x,ty-MP.y)>14){n.tx=tx;n.ty=ty}}
    if(n.tx!=null){const ddx=n.tx-n.x,ddy=n.ty-n.y,l=Math.hypot(ddx,ddy);if(l>1){const s=Math.min(l,22*dt);n.x+=ddx/l*s;n.y+=ddy/l*s;n.d=Math.abs(ddx)>Math.abs(ddy)?(ddx>0?'right':'left'):(ddy>0?'down':'up');n.f+=dt}else n.tx=null}}
  if(TAP('a'))interact();
  fxTick(dt);SAVE.pos={x:Math.round(MP.x),y:Math.round(MP.y),d:MP.d}}
/* walking into a door (or into a ring on the piers) goes in */
let bumpT=0;function bump(dx,dy){if(TT-bumpT<.4)return;
  for(const b of BLD){if(!b.venue||dy>=0||dx)continue;const fy=(b.y+b.h)*T;if(Math.abs(MP.y-3-fy)<6&&Math.abs(MP.x-b.door*T)<T*.9){bumpT=TT;enterDoor(b.venue);return}}
  for(const r of RINGS){if(MP.x>r.x*T-6&&MP.x<(r.x+r.w)*T+6&&MP.y>r.y*T-8&&MP.y<(r.y+r.h)*T+8){bumpT=TT;enterDoor(r.venue);return}}}
function facing(){const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[MP.d];return{x:MP.x+v[0]*14,y:MP.y-3+v[1]*12}}
function interact(){const f=facing();
  for(const n of npcsHere())if(Math.hypot(n.x-f.x,n.y-3-f.y)<13){n.d={up:'down',down:'up',left:'right',right:'left'}[MP.d];DLG={name:n.name,face:typeof n.look==='string'?n.look:null,lines:n.lines(),i:0};SFX.pick();return}
  for(const b of BLD){if(!b.venue)continue;const fy=(b.y+b.h)*T;if(MP.d==='up'&&Math.abs(MP.y-fy)<14&&Math.abs(MP.x-b.door*T)<T){enterDoor(b.venue);return}}
  for(const r of RINGS)if(f.x>r.x*T-4&&f.x<(r.x+r.w)*T+4&&f.y>r.y*T-6&&f.y<(r.y+r.h)*T+6){enterDoor(r.venue);return}
  const p=PROPS.find(p=>p.k==='statue'&&Math.hypot(p.x*T-f.x,p.y*T-f.y)<30);if(p){DLG={name:'THE BELL STATUE',lines:['"For the dockworkers of Port Ember, who built this city with their hands."','Someone has polished the bell recently. It shines.'],i:0};SFX.pick()}}
function enterDoor(v){SFX.pick();saveNow();
  if(v==='gym'){go('gymmenu');return}
  const oi=OPP.findIndex(o=>o.venue===v),o=OPP[oi],ob=objective();
  if(ob&&ob.oi===oi){SC={id:'pre'+oi,i:0,ch:0,t:0};go('story');return}
  if(SAVE.beaten[o.id]){CARD={oi,story:false,from:'map'};go('card');return}
  DLG={name:VENUES[v].name,lines:[SAVE.met[o.id]?'Not tonight. Come back for the Circuit fight.':'Closed tonight. The Circuit hasn\'t come here yet.'+(ob?' Next stop: '+VENUES[ob.venue].name+'.':'')],i:0}}

/* ---------- drawing the city ---------- */
const GCOL=['#b9b2aa','#3a3a46','#5aa04a','#2a6aa8','#a8743e','#dccbb0'];
function drawGround(x0,y0,x1,y1,t){for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const g=gAt(tx,ty),X=tx*T,Y=ty*T,h=hash(tx*131+ty*7);RC(X,Y,T+.6,T+.6,GCOL[g]);
  if(g===0){G.globalAlpha=.18;RC(X,Y,T,.8,'#fff');RC(X,Y,.8,T,'#fff');G.globalAlpha=1;if(h>.86){G.globalAlpha=.25;E(X+8,Y+8,3,2,'#5a524a');G.globalAlpha=1}}
  else if(g===1){if(h>.92){G.globalAlpha=.3;E(X+h*12,Y+6,2.5,1.4,'#1a1a22');G.globalAlpha=1}
    const hz=gAt(tx,ty-1)===1&&gAt(tx,ty+1)!==1&&gAt(tx-1,ty)===1&&gAt(tx+1,ty)===1&&gAt(tx,ty-2)!==1,vt=gAt(tx-1,ty)!==1&&gAt(tx+1,ty)===1&&gAt(tx+2,ty)!==1;
    const inter=(gAt(tx,ty-1)===1||gAt(tx,ty+1)===1)&&(gAt(tx-1,ty)===1||gAt(tx+1,ty)===1)&&!((gAt(tx,ty-1)===1&&gAt(tx,ty+1)===1&&gAt(tx-1,ty)===1&&gAt(tx+1,ty)===1));
    if(gAt(tx,ty-1)===1&&gAt(tx,ty+1)!==1&&!(gAt(tx-1,ty)!==1||gAt(tx+1,ty)!==1)&&tx%2===0&&!vertRoad(tx))RC(X+2,Y-1,9,2,'#f2c14e');
    if(gAt(tx-1,ty)===1&&gAt(tx+1,ty)!==1&&ty%2===0&&!horzRoad(ty))RC(X-1,Y+2,2,9,'#f2c14e');
    if(nearCross(tx,ty)){G.globalAlpha=.85;for(let i=1;i<T;i+=4)horzRoad(ty)?RC(X+i,Y+1,2,T-2,'#e8e2d0'):RC(X+1,Y+i,T-2,2,'#e8e2d0');G.globalAlpha=1}}
  else if(g===2){G.globalAlpha=.5;for(let i=0;i<3;i++){const a=hash(tx*17+ty*31+i);LN(X+a*14+1,Y+((a*97)%1)*12+3,X+a*14+2,Y+((a*97)%1)*12+1,1,'#2f6a2a')}G.globalAlpha=1}
  else if(g===3){const w=Math.sin(t*1.6+tx*.9+ty*.6);G.globalAlpha=.35;ARC(X+8,Y+8+w*1.5,4,3.6,5.8,1.2,'#9ad8ff');G.globalAlpha=1}
  else if(g===4){for(let i=0;i<T;i+=4)RC(X,Y+i,T,.7,'#6a4a2a');if(h>.5)E(X+3,Y+2,.6,.6,'#3a2a1a')}
  else if(g===5){G.globalAlpha=.25;ARC(X+8,Y+8,6,0,TAU,.8,'#8a7a5a');G.globalAlpha=1}}
  /* ink edges where ground types meet: kerbs, grass edges, the shoreline */
  G.strokeStyle=INK;G.lineWidth=1.6;G.beginPath();for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const g=gAt(tx,ty);const e=(o)=>o!==g&&!(g===1&&o===5)&&!(g===5&&o===1)&&!(g===5&&o===2)&&!(g===2&&o===5);
    if(e(gAt(tx+1,ty))){G.moveTo((tx+1)*T,ty*T);G.lineTo((tx+1)*T,(ty+1)*T)}if(e(gAt(tx,ty+1))){G.moveTo(tx*T,(ty+1)*T);G.lineTo((tx+1)*T,(ty+1)*T)}}G.stroke()}
const vertRoad=tx=>gAt(tx,0)===1||gAt(tx,12)===1&&gAt(tx,30)===1,horzRoad=ty=>gAt(0,ty)===1&&gAt(59,ty)===1;
function nearCross(tx,ty){if(gAt(tx,ty)!==1)return false;const hr=horzRoad(ty),vr=[14,15,30,31,46,47].includes(tx);if(hr&&!vr)return[13,16,29,32,45,48].includes(tx)&&(vertRoad(tx-1)||vertRoad(tx+1)||gAt(tx-1,ty-2)===1||gAt(tx+1,ty-2)===1||gAt(tx-1,ty+2)===1||gAt(tx+1,ty+2)===1);if(vr&&!hr)return[9,12,23,26,32,35].includes(ty);return false}
function drawBuilding(b,t){const X=b.x*T,Y=b.y*T,W=b.w*T,H=b.h*T,fh=Math.min(2,b.h-1)*T,ry=Y-b.tall,rh=H-fh+b.tall,fy=Y+H-fh;
  /* shadow */G.globalAlpha=.25;PL([X+W,fy,X+W+10,fy+8,X+W+10,Y+H+6,X+8,Y+H+6,X,Y+H],'#000');G.globalAlpha=1;
  /* front wall */cel(pP([X,fy,X+W,fy,X+W,Y+H,X,Y+H]),b.wall,{sx:0,sy:-3,rw:0,rim:false,lw:2,inner(){
    const wc=b.style==='club'?'#ff3ea5':b.style==='ice'?'#cfeaff':'#ffe6a0',n=Math.max(1,Math.floor(b.w/2));
    for(let i=0;i<n;i++){const wx=X+8+i*(W-16)/Math.max(1,n-1)-4;if(b.door&&Math.abs(wx+4-b.door*T)<12)continue;if(b.style==='shop'||b.style==='market')continue;RC(wx,fy+5,8,9,INK);RC(wx+1,fy+6,6,7,(hash(i+b.x)>.4?wc:'#2a3040'));RC(wx+1,fy+6,6,1.5,'rgba(255,255,255,.4)')}
    if(b.style==='shop'||b.style==='market'){RC(X+5,fy+9,W-10,12,INK);RC(X+6,fy+10,W-12,10,'#ffe6a0');for(let i=0;i<W-12;i+=9)RC(X+6+i,fy+10,1,10,INK);
      for(let i=0;i<W;i+=6)PL([X+i,fy+1,X+i+6,fy+1,X+i+6,fy+8,X+i+3,fy+10,X+i,fy+8],(i/6)%2?(b.awn||'#2a6a8a'):'#f4f1ea');LN(X,fy+8,X+W,fy+8,1.4,INK)}
    if(b.style==='gym'||b.style==='chapel'||b.style==='arena'||b.style==='club'||b.style==='ice'){/* graffiti and fight posters */
      const tag=hash(b.x*3)*TAU;G.globalAlpha=.85;G.lineWidth=2;G.strokeStyle=['#ff3ea5','#3ee8ff','#ffd84a','#7dff9a'][b.x%4];G.beginPath();for(let i=0;i<7;i++){const a=tag+i;i?G.lineTo(X+6+i*3,fy+fh-6+Math.sin(a)*3):G.moveTo(X+6,fy+fh-6)}G.stroke();G.globalAlpha=1;
      const op=OPP.find(o=>o.venue===b.venue);if(op){RCO(X+W-18,fy+fh-15,10,13,'#f4f1ea',1);RC(X+W-17,fy+fh-14,8,5,PEOPLE[op.p].gloves);E(X+W-13,fy+fh-6,2.4,2.4,PEOPLE[op.p].skin)}}}});
  if(b.door){const dx=b.door*T;RC(dx-7,Y+H-15,14,15,INK);RC(dx-6,Y+H-14,12,14,b.style==='club'?'#3a0a2a':'#2a1a14');RC(dx-.4,Y+H-14,.8,14,'#000');E(dx+3,Y+H-7,.9,.9,'#f2c14e');
    const glow=.5+.3*Math.sin(t*3);G.globalAlpha=glow*.35;E(dx,Y+H+4,12,4,'#ffd84a');G.globalAlpha=1}
  /* roof */
  cel(pP([X-2,ry,X+W+2,ry,X+W+2,fy+1,X-2,fy+1]),b.roof,{sx:4,sy:4,rw:1.6,lw:2.2,inner(){
    if(b.style==='arena'){for(let i=0;i<5;i++)ARC(X+W/2,fy+30,W*.32+i*7,3.3,6.1,1.2,shade(b.roof,.18));PL([X+W/2-16,ry+18,X+W/2-16,ry+6,X+W/2-8,ry+12,X+W/2,ry+2,X+W/2+8,ry+12,X+W/2+16,ry+6,X+W/2+16,ry+18],'#e5bd4f');LN(X+W/2-16,ry+18,X+W/2+16,ry+18,1.4,INK)}
    else if(b.style==='chapel'){}
    else{for(let i=0;i<3;i++)RCO(X+8+i*((W-24)/2),ry+6+(i%2)*6,10,7,shade(b.roof,.15),1.2)}
    if(b.style==='club'){const on=Math.sin(t*5)>-.6;G.globalAlpha=on?1:.4;G.lineWidth=2;G.strokeStyle='#ff3ea5';G.strokeRect(X+8,ry+8,W-16,10);G.strokeStyle='#3ee8ff';G.strokeRect(X+12,ry+22,W-24,8);G.globalAlpha=1}
    if(b.style==='ice'){G.globalAlpha=.6;for(let i=0;i<6;i++)RC(X+6+i*13,ry+4,6,rh-10,'#cfeaff');G.globalAlpha=1}
    if(b.style==='apts')RCO(X+W-16,ry+4,10,14,'#8a6a4a',1.2)}});
  if(b.style==='chapel'){const cx=X+W*.5;cel(pP([cx-12,ry-6,cx+12,ry-6,cx+12,fy,cx-12,fy]),b.wall,{sx:3,sy:0,lw:2});cel(pP([cx-15,ry-6,cx,ry-26,cx+15,ry-6]),b.roof,{sx:3,sy:2,lw:2});EO(cx,ry+6,5,5,'#e5bd4f');RC(cx-6,ry+16,12,14,'#2a5ac8');LN(cx,ry+16,cx,ry+30,1.2,INK)}
  if(b.sign){const sw=Math.min(W-8,b.sign.length*5+10);G.font='700 7px '+FONT_D;G.textAlign='center';G.textBaseline='middle';cel(pP([X+W/2-sw/2,fy-6,X+W/2+sw/2,fy-6,X+W/2+sw/2,fy+5,X+W/2-sw/2,fy+5]),b.style==='club'?'#2a0a2a':'#f4f1ea',{sx:0,sy:-2,rw:0,rim:false,lw:1.6});
    G.fillStyle=b.style==='club'?'#ff7ac8':INK;G.fillText(b.sign,X+W/2,fy);G.textBaseline='alphabetic'}}
function drawRingProp(r){const X=r.x*T,Y=r.y*T,W=r.w*T,H=r.h*T,v=VENUES[r.venue];G.globalAlpha=.25;RC(X+6,Y+6,W,H,'#000');G.globalAlpha=1;
  cel(pP([X,Y,X+W,Y,X+W,Y+H,X,Y+H]),v.apron,{sx:2,sy:-3,lw:2});cel(pP([X+5,Y+4,X+W-5,Y+4,X+W-5,Y+H-7,X+5,Y+H-7]),v.canvas,{sx:3,sy:3,lw:1.6});
  for(const[x,y]of[[X+5,Y+4],[X+W-5,Y+4],[X+5,Y+H-7],[X+W-5,Y+H-7]])EO(x,y,2.4,2.4,v.post);
  for(let k=0;k<2;k++){G.strokeStyle=v.rope[k];G.lineWidth=1.4;G.strokeRect(X+5-k*.5,Y+4-k*2-.5,W-10+k,H-11)}}
function drawProp(p,t){const X=p.x*T,Y=p.y*T;
  if(p.k==='tree'){G.globalAlpha=.25;E(X+3,Y+1,9,4,'#000');G.globalAlpha=1;RCO(X-1.5,Y-8,3,9,'#6a4a2a',1.2);cel(pE(X,Y-14,11,9),'#3f8a3a',{sx:3,sy:3,rw:1.4,lw:1.8});cel(pE(X-3,Y-18,6,5),'#56a84a',{sx:1.5,sy:1.5,lw:1.2})}
  else if(p.k==='lamp'){LNO(X,Y,X,Y-22,1.6,'#3a3a46');cel(pE(X,Y-23,3,2.2),'#ffe6a0',{lw:1.2});G.globalAlpha=.16+.04*Math.sin(t*2+X);E(X,Y-2,14,6,'#ffd84a');G.globalAlpha=1}
  else if(p.k==='bench'){RCO(X-8,Y-6,16,4,'#8a5a2a',1.2);RCO(X-8,Y-2,16,2.5,'#6a4420',1.2)}
  else if(p.k==='statue'){cel(pE(X,Y-4,22,10),'#9ab8cc',{sx:3,sy:3,lw:2});G.globalAlpha=.6;ARC(X,Y-4,16,0,TAU,1,'#e8f6ff');G.globalAlpha=1;cel(pP([X-8,Y-4,X+8,Y-4,X+6,Y-16,X-6,Y-16]),'#8a8a96',{sx:2,sy:0,lw:1.6});
    cel(pE(X,Y-22,7,6.5),'#e5bd4f',{sx:2,sy:2,lw:1.6});PL([X-9,Y-16,X+9,Y-16,X+7,Y-20,X-7,Y-20],'#c8962e');E(X,Y-15,1.6,1.6,INK);for(let i=0;i<4;i++){const a=t*2+i*1.6;E(X+Math.cos(a)*12,Y-4+Math.sin(a)*5,.8,.8,'#e8f6ff')}}
  else if(p.k==='crate')RCO(X-5,Y-9,10,9,'#b8823e',1.4);
  else if(p.k==='barrel'){cel(pE(X,Y-5,4.5,5.5),'#7a4a2a',{sx:1.2,sy:0,lw:1.4});LN(X-4.5,Y-6,X+4.5,Y-6,1,INK)}
  else if(p.k==='hydrant'){cel(pP([X-2.4,Y,X+2.4,Y,X+2.4,Y-7,X-2.4,Y-7]),'#d8322b',{sx:1,sy:0,lw:1.2});EO(X,Y-7.5,2.8,1.6,'#d8322b',.8)}
  else if(p.k==='mail'){cel(pP([X-3.5,Y,X+3.5,Y,X+3.5,Y-9,X-3.5,Y-9]),'#2a5ac8',{sx:1.2,sy:0,lw:1.2})}
  else if(p.k==='car'){G.globalAlpha=.25;RC(X-14,Y-6,32,13,'#000');G.globalAlpha=1;cel(pP([X-16,Y-12,X+16,Y-12,X+16,Y+2,X-16,Y+2]),p.c,{sx:3,sy:3,lw:1.8});cel(pP([X-7,Y-11,X+8,Y-11,X+8,Y+1,X-7,Y+1]),shade(p.c,-.15),{sx:1,sy:1,lw:1.2});RC(X+8,Y-10,3,10,'#9ad8ff');RC(X-10,Y-10,3,10,'#9ad8ff')}
  else if(p.k==='crane'){LNO(X-8,Y,X-8,Y-70,3,'#e8b62c');LNO(X+8,Y,X+8,Y-70,3,'#e8b62c');for(let i=0;i<7;i++)LN(X-8,Y-i*10,X+8,Y-i*10-10,1.2,'#a07a1a');LNO(X-30,Y-72,X+30,Y-72,4,'#e8b62c');RCO(X-6,Y-80,12,8,'#3a3a46',1.4);LN(X+24,Y-72,X+24,Y-44+Math.sin(t)*3,1,INK);RCO(X+20,Y-44+Math.sin(t)*3,8,6,'#c8463a',1.2)}
  else if(p.k==='boat'){const b=Math.sin(t*1.4+X)*1.2;cel(pP([X-14,Y-4+b,X+14,Y-4+b,X+10,Y+5+b,X-10,Y+5+b]),p.c,{sx:2,sy:2,lw:1.6});RCO(X-4,Y-10+b,8,6,'#f4f1ea',1.2)}}
function drawShip(t){const X=SHIP.x*T,Y=SHIP.y*T,W=SHIP.w*T,b=Math.sin(t*.8)*1;cel(pP([X,Y+b,X+W+20,Y+b,X+W+20,Y+40+b,X+10,Y+40+b]),'#4a1a18',{sx:3,sy:3,lw:2.2});RC(X+6,Y+8+b,W,4,'#e8e2d0');for(let i=0;i<6;i++)EO(X+14+i*18,Y+22+b,2.6,2.6,'#f0c060',.6)}
/* a person on the map, seen from above and a little in front */
function walker(look,x,y,d,f,o={}){const p=typeof look==='string'?PEOPLE[look]:look,sk=p.skin,hc=p.hairCol,shirt=o.shirt||p.out||p.outCol||(p.top||p.trunks||'#5a5a6a'),pants=o.pants||(p.trunks&&!p.outfit?p.trunks:'#2a2a3a'),s=o.s||1;
  G.save();G.translate(x,y);G.scale(s,s);G.globalAlpha=.3;E(0,0,6,2.2,'#000');G.globalAlpha=1;
  const step=o.moving?Math.sin(f*12):0;
  for(const sd of[-1,1]){const l=sd*step*2;RCO(sd*2.6-1.6,-6+Math.max(0,-l),3.2,6-Math.abs(l)*.3,pants,1)}
  cel(pP([-5.5,-15,5.5,-15,5,-6,-5,-6]),shirt,{sx:1.6,sy:0,lw:1.4});
  const arm=step*2.2;if(d!=='left')RCO(5,-14+arm*(d==='right'?0:1),2.4,7,sk,1);if(d!=='right')RCO(-7.4,-14-arm*(d==='left'?0:1),2.4,7,sk,1);
  const hy=-20;cel(pE(0,hy,5.6,5.4),sk,{sx:1.4,sy:1,rw:.6,lw:1.4});
  const hs=p.hair;if(hs&&hs!=='bald'&&hs!=='shaved'){const cover=d==='up'?pE(0,hy-.6,5.9,5.6):pE(0,hy-2.2,5.9,3.9);if(hs==='afro')cel(pE(0,hy-2,8,6.8),hc,{sx:1.4,sy:1,lw:1.3});else if(hs==='mohawk')cel(pP([-1.4,hy-7,1.4,hy-7,1.4,hy+1,-1.4,hy+1]),hc,{sx:.4,sy:0,lw:1});else cel(cover,hc,{sx:1,sy:.8,rw:.5,lw:1.2});
    if(hs==='bun')cel(pE(0,hy-6,2.6,2.2),hc,{lw:1});if(hs==='locs'||hs==='spiky')for(let i=-1;i<=1;i++)LN(i*3,hy-3,i*4,hy+(d==='up'?6:-6),1.6,hc)}
  if(d==='down'){E(-2,hy+.6,.8,1,INK);E(2,hy+.6,.8,1,INK);if(p.beard||p.facial==='beard')E(0,hy+3.6,3.4,1.8,p.beard||hc)}
  else if(d==='left')E(-3,hy+.4,.8,1,INK);else if(d==='right')E(3,hy+.4,.8,1,INK);
  if(o.mark){const k=Math.sin(TT*5)*1.5;PLO([-3,hy-14+k,3,hy-14+k,0,hy-9+k],'#ffd84a',1)}
  G.restore()}
const CAM={x:0,y:0};
function mapDraw(){G=bx;bx.setTransform(R,0,0,R,0,0);const t=TT;
  CAM.x=clamp(MP.x-BW/2,0,MW*T-BW);CAM.y=clamp(MP.y-BH*.55,0,MH*T-BH);if(MW*T<BW)CAM.x=(MW*T-BW)/2;
  bx.translate(-Math.round(CAM.x*R)/R,-Math.round(CAM.y*R)/R);
  const x0=Math.max(0,Math.floor(CAM.x/T)-1),y0=Math.max(0,Math.floor(CAM.y/T)-1),x1=Math.min(MW-1,Math.ceil((CAM.x+BW)/T)+1),y1=Math.min(MH-1,Math.ceil((CAM.y+BH)/T)+1);
  drawGround(x0,y0,x1,y1,t);
  const inView=(x,y,m=80)=>x>CAM.x-m&&x<CAM.x+BW+m&&y>CAM.y-m&&y<CAM.y+BH+m*2;
  for(const r of RINGS)if(inView(r.x*T,r.y*T,120))drawRingProp(r);
  if(inView(SHIP.x*T,SHIP.y*T,200))drawShip(t);
  /* everything that stands up, back to front */
  const list=[];for(const b of BLD)if(inView((b.x+b.w/2)*T,(b.y+b.h/2)*T,b.w*T))list.push([(b.y+b.h)*T,()=>drawBuilding(b,t)]);
  for(const p of PROPS)if(inView(p.x*T,p.y*T))list.push([p.y*T,()=>drawProp(p,t)]);
  const ob=objective();
  for(const n of npcsHere())if(inView(n.x,n.y))list.push([n.y,()=>walker(n.look,n.x,n.y,n.d,n.f,{moving:n.tx!=null,mark:n.id==='dot'&&!SAVE.done||(ob&&n.id===OPP[ob.oi].id)})]);
  list.push([MP.y,()=>walker('milo',MP.x,MP.y,MP.d,MP.t,{moving:MP.moving,shirt:PEOPLE.milo.outCol,pants:'#22222c'})]);
  list.sort((a,b)=>a[0]-b[0]);for(const[,f]of list)f();
  /* gulls over the harbor */
  for(let i=0;i<5;i++){const gx=((t*18+i*140)%(MW*T+80))-40,gy=36*T+Math.sin(t+i)*20-i*12;if(inView(gx,gy)){LN(gx-4,gy,gx,gy+2,1.2,'#f4f1ea');LN(gx,gy+2,gx+4,gy,1.2,'#f4f1ea')}}
  /* the next stop glows */
  if(ob){const dd=doorOf(ob.venue),k=.5+.5*Math.sin(t*4);G.globalAlpha=.35+.3*k;ARC(dd.x,dd.y,10+k*4,0,TAU,2.4,'#ffd84a');G.globalAlpha=1}
  drawFxRing();bx.setTransform(R,0,0,R,0,0)}
function mapScreenDraw(){mapDraw();blit();ctx.setTransform(DPR,0,0,DPR,0,0);
  const ob=objective();
  if(ob){const dd=doorOf(ob.venue),sx=(dd.x-CAM.x)*PS,sy=(dd.y-CAM.y)*PS,lbl='NEXT: '+VENUES[ob.venue].name;const w=tw(lbl,9)+20*U;panel(8*U,8*U,w,22*U,'rgba(14,10,24,.9)','#ffd84a',6);text(lbl,8*U+w/2,13*U,9,'#ffd84a','center');
    if(sx<0||sx>SW||sy<0||sy>SH){const a=Math.atan2(sy-SH/2,sx-SW/2),r=Math.min(SW,SH)*.42,ax=SW/2+Math.cos(a)*Math.min(SW*.44,r*1.1),ay=SH/2+Math.sin(a)*Math.min(SH*.42,r*1.3);
      ctx.save();ctx.translate(ax,ay);ctx.rotate(a);ctx.beginPath();ctx.moveTo(14*U,0);ctx.lineTo(-8*U,-10*U);ctx.lineTo(-3*U,0);ctx.lineTo(-8*U,10*U);ctx.closePath();ctx.fillStyle='#ffd84a';ctx.fill();ctx.lineWidth=3*U;ctx.strokeStyle='#0e0a14';ctx.stroke();ctx.restore()}}
  else if(SAVE.done){panel(8*U,8*U,tw('★ CHAMPION',9)+20*U,22*U,'rgba(14,10,24,.9)','#ffd84a',6);text('★ CHAMPION',18*U,13*U,9,'#ffd84a')}
  if(DLG){const bh=Math.max(78*U,SH*.2),by=SH-bh-10*U,bxx=8*U,bw=SW-16*U,ln=DLG.lines[DLG.i]||'';
    if(DLG.face){const ps=Math.min(SW*.34,SH*.24);portrait(DLG.face,'neutral',SW-bxx-ps,by-ps+4*U,ps,'#e8662a');}
    panel(bxx,by,bw,bh);const nw=tw(DLG.name,10)+18*U;panel(bxx+6*U,by-12*U,nw,20*U,'#ffd84a','#0e0a14',5);text(DLG.name,bxx+6*U+nw/2,by-8*U,10,'#0e0a14','center');
    wrap(ln,bw-24*U,11).slice(0,5).forEach((l,i)=>textB(l,bxx+12*U,by+14*U+i*15*U,11,'#fff','left',null,600));if(Math.floor(TT*3)%2)text('▼',SW-bxx-14*U,by+bh-16*U,10,'#ffd84a','center')}
  else textB('D-PAD walk · B run · A talk / enter · START menu',SW/2,SH-14*U,8,'rgba(255,255,255,.85)','center','#000')}

/* ---------- inside the gym ---------- */
function gymItems(){const ob=objective(),it=[['TALK TO AUNTIE DOT','dot'],['LOCKER ROOM','lock']];
  if(ob&&ob.oi===0)it.push(['SPAR WITH GUS (STORY)','spar']);else if(SAVE.beaten.gus)it.push(['SPAR WITH GUS','rematch']);
  it.push(['LEAVE','leave']);return it}
let GYMSAY='';
function gymTick(){const it=gymItems();menuNav(it.length);if(TAP('b')){SFX.back();go('map');return}
  if(TAP('a')){const k=it[MSEL][1];SFX.pick();if(k==='dot')GYMSAY=dotHint();else if(k==='lock')openLocker('gym');else if(k==='spar'){SC={id:'pre0',i:0,ch:0,t:0};go('story')}else if(k==='rematch'){CARD={oi:0,story:false,from:'map'};go('card')}else go('map')}}
function gymDraw(){drawScene('gym',TT,null,null,{dim:.5});blit();ctx.setTransform(DPR,0,0,DPR,0,0);text('THE BELL & ANCHOR',SW/2,12*U,16,'#ffd84a','center','#0e0a14');
  const ps=Math.min(SW*.5,SH*.3);portrait('dot',GYMSAY?'grin':'neutral',SW/2-ps/2,40*U,ps,'#7c4867');
  let y=40*U+ps+8*U;if(GYMSAY){const l=wrap(GYMSAY,SW*.8,10);panel(SW*.06,y,SW*.88,l.length*13*U+12*U);l.forEach((s,i)=>textB(s,SW/2,y+6*U+i*13*U,10,'#fff','center'));y+=l.length*13*U+20*U}
  drawMenu(gymItems().map(x=>x[0]),SW/2,y+4*U,12,21*U);help('A SELECT · B LEAVE')}
/* ---------- the city map (from the menu) ---------- */
function cityTick(){if(TAP('b')||TAP('start')||TAP('a')){SFX.back();go('mappause')}}
function cityDraw(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#0e0a14';ctx.fillRect(0,0,SW,SH);const pad=10*U,s=Math.min((SW-pad*2)/MW,(SH-60*U)/MH),ox=(SW-MW*s)/2,oy=36*U;
  const C=['#7a746e','#2a2a34','#3f8a3a','#1d4a7a','#8a5a2e','#a8987a'];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){ctx.fillStyle=C[gAt(x,y)];ctx.fillRect(ox+x*s,oy+y*s,s+.5,s+.5)}
  for(const b of BLD){ctx.fillStyle=b.roof;ctx.fillRect(ox+b.x*s,oy+b.y*s,b.w*s,b.h*s);ctx.lineWidth=1.5*U;ctx.strokeStyle='#0e0a14';ctx.strokeRect(ox+b.x*s,oy+b.y*s,b.w*s,b.h*s)}
  for(const r of RINGS){ctx.fillStyle=VENUES[r.venue].canvas;ctx.fillRect(ox+r.x*s,oy+r.y*s,r.w*s,r.h*s)}
  const ob=objective();for(const v of Object.keys(VENUES)){const d=doorOf(v),x=ox+d.x/T*s,y=oy+d.y/T*s,on=ob&&ob.venue===v,oi=OPP.findIndex(o=>o.venue===v);
    circ(x,y,(on?6:4)*U*(on?1+.2*Math.sin(TT*6):1),on?'#ffd84a':SAVE.beaten[OPP[oi].id]?'#7dff9a':'#f4f1ea','#0e0a14',2);const nm=VENUES[v].name.replace('THE ',''),hw=tw(nm,7)/2+2*U;text(nm,clamp(x,hw,SW-hw),y+6*U,7,on?'#ffd84a':'#fff','center','#0e0a14')}
  circ(ox+MP.x/T*s,oy+MP.y/T*s,4*U,'#ff5a5a','#fff',2);text('PORT EMBER',SW/2,10*U,16,'#ffd84a','center','#0e0a14');help('● YOU · ◆ NEXT FIGHT · B BACK')}
/* ---------- the map's pause menu ---------- */
const MPAUSE=[['RESUME','res'],['CITY MAP','city'],['LOCKER ROOM','lock'],['CIRCUIT','circ'],['HOW TO PLAY','how'],['SETTINGS','set'],['SAVE & QUIT','quit']];
function mapPauseTick(){menuNav(MPAUSE.length);if(TAP('b')||TAP('start')){SFX.back();go('map');return}
  if(TAP('a')){const k=MPAUSE[MSEL][1];SFX.pick();if(k==='res')go('map');else if(k==='city')go('citymap');else if(k==='lock')openLocker('map');else if(k==='circ')go('circuit');else if(k==='how'){BACKTO='mappause';HOW=0;go('howto')}else if(k==='set')go('settings');else{saveNow(true);HUB='title';go('title')}}}
function mapPauseDraw(){mapScreenDraw();dimAll(.62);text('PAUSED',SW/2,SH*.14,24,'#fff','center','#0e0a14');drawMenu(MPAUSE.map(x=>x[0]),SW/2,SH*.28,12,22*U);help('A SELECT · B BACK')}
