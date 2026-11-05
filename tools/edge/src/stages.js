/* ================= stages =================
   Gameplay happens on the z = 0 plane: x across, y up, the main stage's top at y = 0. The main stage is solid
   (with a ledge at each end); the other platforms can be jumped up through and dropped through. */
function canvasTex(w,h,draw,rep=[1,1]){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...rep);t.anisotropy=4;return t}
function noiseFill(g,w,h,base,amt,n=3000,sz=2){g.fillStyle=base;g.fillRect(0,0,w,h);for(let i=0;i<n;i++){const v=Math.floor((rnd()-.5)*amt);g.fillStyle=`rgba(${v>0?255:0},${v>0?255:0},${v>0?255:0},${Math.abs(v)/255})`;g.fillRect(rnd()*w,rnd()*h,sz,sz)}}
const TEX={};
function stoneTex(){return TEX.stone||(TEX.stone=canvasTex(256,256,(g,w,h)=>{noiseFill(g,w,h,'#8a8478',70,5000);g.strokeStyle='rgba(30,26,20,.55)';g.lineWidth=2;
  for(let y=0;y<h;y+=42){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();for(let x=(y/42%2)*40;x<w;x+=80){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+42);g.stroke()}}},[4,1]))}
function woodTex(){return TEX.wood||(TEX.wood=canvasTex(256,64,(g,w,h)=>{g.fillStyle='#7a5232';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){g.strokeStyle=`rgba(40,22,10,${.15+rnd()*.25})`;g.beginPath();const y=rnd()*h;g.moveTo(0,y);g.bezierCurveTo(w*.3,y+rnd()*6-3,w*.6,y+rnd()*6-3,w,y);g.stroke()}
  g.fillStyle='rgba(20,10,4,.7)';for(let x=0;x<w;x+=64)g.fillRect(x,0,2,h)},[6,1]))}
function metalTex(){return TEX.metal||(TEX.metal=canvasTex(256,128,(g,w,h)=>{noiseFill(g,w,h,'#5a6478',30,3000,1);g.strokeStyle='rgba(10,14,24,.7)';g.lineWidth=2;for(let x=0;x<w;x+=64){g.strokeRect(x+2,2,60,h-4)}
  g.fillStyle='rgba(160,220,255,.9)';for(let x=8;x<w;x+=64)g.fillRect(x,h-10,48,3)},[5,1]))}
function grassTex(){return TEX.grass||(TEX.grass=canvasTex(128,32,(g,w,h)=>{noiseFill(g,w,h,'#4a8a3a',60,2000);for(let i=0;i<200;i++){g.fillStyle=`rgba(140,220,90,${rnd()*.6})`;g.fillRect(rnd()*w,rnd()*h,1,3)}},[8,1]))}
function skyTex(stops){return canvasTex(8,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);stops.forEach(([t,c])=>gr.addColorStop(t,c));g.fillStyle=gr;g.fillRect(0,0,w,h)})}
function glowTex(col){return canvasTex(64,64,(g,w,h)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,col);gr.addColorStop(.35,col.replace(/[\d.]+\)$/,'0.45)'));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)})}
function sky(group,stops,r=180){const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),new THREE.MeshBasicMaterial({map:skyTex(stops),side:THREE.BackSide,depthWrite:false,fog:false}));group.add(m);return m}
function sprite(group,tex,x,y,z,s,op=1,add=false){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,fog:false}));m.position.set(x,y,z);m.scale.set(s,s,1);group.add(m);return m}
function box(group,mat,x,y,z,w,h,d,shadow=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;group.add(m);return m}
function cloudTex(){return TEX.cloud||(TEX.cloud=canvasTex(128,64,(g,w,h)=>{for(let i=0;i<14;i++){const x=20+rnd()*88,y=24+rnd()*20,r=12+rnd()*16,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)}}))}
/* a floating platform: a top slab and a tapered underside */
function softPlat(group,p,mat,edge){box(group,mat,(p.l+p.r)/2,p.y-.15,0,p.r-p.l,.3,2.2);if(edge)box(group,edge,(p.l+p.r)/2,p.y-.02,1.12,p.r-p.l,.06,.04,false)}
const STAGES=[
 {id:'sky',name:'SKY SANCTUARY',song:'sky',desc:'Floating ruins above the clouds at sunset. Three platforms.',
  main:{l:-8,r:8,y:0,th:2.6},soft:[{l:-5.3,r:-1.9,y:3.1},{l:1.9,r:5.3,y:3.1},{l:-1.7,r:1.7,y:6.1}],blast:{l:-21,r:21,b:-11,t:21},spawn:{x:0,y:9},
  light:{sun:'#ffd8a8',sunI:2.6,sunPos:[6,12,10],hemiSky:'#ffc8a0',hemiGround:'#5a4a6a',hemi:.85,rim:'#ff9ac8',fog:'#e8a8a0',fogN:40,fogF:140},
  build(g,st){sky(g,[[0,'#2a3a8a'],[.45,'#c87aa8'],[.62,'#ffb878'],[.7,'#ffe0b0'],[1,'#e8a8a0']]);
    sprite(g,glowTex('rgba(255,236,190,1)'),18,10,-80,40,1,true);
    const stone=new THREE.MeshStandardMaterial({map:stoneTex(),roughness:.92}),grass=new THREE.MeshStandardMaterial({map:grassTex(),roughness:.95});
    const M=st.main;box(g,grass,0,-.12,0,M.r-M.l,.24,3.4);box(g,stone,0,-1.1,0,M.r-M.l,1.8,3.2);
    const under=new THREE.Mesh(new THREE.ConeGeometry(6.4,6,7),stone);under.position.set(0,-5,0);under.rotation.y=.3;under.scale.set(1.25,1,.42);under.receiveShadow=true;g.add(under);
    for(const x of[-6.6,6.6]){box(g,stone,x,2.2,-1.2,.7,4.4,.7);box(g,stone,x,4.5,-1.2,1.1,.3,1.1)}box(g,stone,0,4.4,-1.6,15,.35,.6);
    for(const p of st.plats)if(p.soft)softPlat(g,p,stone);
    const ct=cloudTex();for(let i=0;i<26;i++){const s=sprite(g,ct,(rnd()-.5)*160,-14+rnd()*30,-30-rnd()*70,10+rnd()*22,.55+rnd()*.35);s.userData.drift=.004+rnd()*.012;g.userData.clouds=(g.userData.clouds||[]).concat(s)}
    for(let i=0;i<6;i++){const isl=new THREE.Mesh(new THREE.ConeGeometry(2+rnd()*3,4+rnd()*3,6),stone);isl.position.set((rnd()-.5)*90,-4+rnd()*20,-40-rnd()*40);isl.rotation.x=Math.PI;g.add(isl);box(g,grass,isl.position.x,isl.position.y+(isl.geometry.parameters.height/2),isl.position.z,isl.geometry.parameters.radius*1.6,.3,isl.geometry.parameters.radius*1.2,false)}},
  tick(g,t){for(const s of g.userData.clouds||[]){s.position.x+=s.userData.drift;if(s.position.x>90)s.position.x=-90}}},
 {id:'orbit',name:'FINAL HORIZON',song:'orbit',desc:'One long flat stage above a planet. Nowhere to hide.',
  main:{l:-9,r:9,y:0,th:1.6},soft:[],blast:{l:-22,r:22,b:-11,t:21},spawn:{x:0,y:8},
  light:{sun:'#cfe0ff',sunI:2.4,sunPos:[-6,10,10],hemiSky:'#7a8aff',hemiGround:'#1a1030',hemi:.7,rim:'#6af0ff',fog:'#06081a',fogN:60,fogF:200},
  build(g,st){sky(g,[[0,'#02030a'],[.5,'#0a0e2a'],[1,'#1a0a2a']]);
    const pts=new Float32Array(1800*3);for(let i=0;i<1800;i++){const a=rnd()*Math.PI*2,b=Math.acos(rnd()*2-1),r=150;pts[i*3]=r*Math.sin(b)*Math.cos(a);pts[i*3+1]=r*Math.cos(b);pts[i*3+2]=-Math.abs(r*Math.sin(b)*Math.sin(a))}
    const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(pts,3));g.add(new THREE.Points(sg,new THREE.PointsMaterial({color:'#ffffff',size:.6,sizeAttenuation:true,fog:false})));
    const pt=canvasTex(512,256,(c,w,h)=>{const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#3a6ad8');gr.addColorStop(.5,'#2a8a7a');gr.addColorStop(1,'#1a3a8a');c.fillStyle=gr;c.fillRect(0,0,w,h);
      for(let i=0;i<90;i++){c.fillStyle=`rgba(${rnd()<.5?'60,140,70':'230,230,240'},${.3+rnd()*.4})`;c.beginPath();c.ellipse(rnd()*w,rnd()*h,10+rnd()*60,4+rnd()*14,0,0,7);c.fill()}});
    const planet=new THREE.Mesh(new THREE.SphereGeometry(60,48,32),new THREE.MeshStandardMaterial({map:pt,roughness:.9}));planet.position.set(10,-78,-70);g.add(planet);g.userData.planet=planet;
    sprite(g,glowTex('rgba(120,190,255,1)'),10,-30,-60,150,.55,true);
    sprite(g,glowTex('rgba(255,120,220,1)'),-50,30,-120,90,.35,true);
    const metal=new THREE.MeshStandardMaterial({map:metalTex(),roughness:.35,metalness:.7}),glow=new THREE.MeshBasicMaterial({color:'#6af0ff'});
    const M=st.main;box(g,metal,0,-.8,0,M.r-M.l,1.6,3.2);box(g,glow,0,-.05,1.62,M.r-M.l,.06,.05,false);box(g,glow,0,-1.55,1.62,M.r-M.l-.4,.05,.05,false);
    const und=new THREE.Mesh(new THREE.CylinderGeometry(3,.6,4,8),metal);und.position.set(0,-3.4,0);und.scale.z=.5;g.add(und);
    for(const x of[-4,4]){const e=new THREE.Mesh(new THREE.SphereGeometry(.35,16,12),glow);e.position.set(x,-1.7,1.2);g.add(e)}},
  tick(g,t){if(g.userData.planet)g.userData.planet.rotation.y+=.0006}},
 {id:'dock',name:'HARBOR NIGHT',song:'dock',desc:'A moonlit pier with crates to stand on.',
  main:{l:-9.5,r:9.5,y:0,th:1.2},soft:[{l:-6.4,r:-3.4,y:2.8},{l:3.4,r:6.4,y:2.8}],blast:{l:-22,r:22,b:-10,t:20},spawn:{x:0,y:8},
  light:{sun:'#a8c0ff',sunI:1.8,sunPos:[-5,10,9],hemiSky:'#3a4a8a',hemiGround:'#0a0a14',hemi:.75,rim:'#ffb060',fog:'#0a1024',fogN:30,fogF:120},
  build(g,st){sky(g,[[0,'#04060f'],[.55,'#121a3a'],[.68,'#2a2a5a'],[1,'#0a1024']]);
    sprite(g,glowTex('rgba(240,240,255,1)'),-22,22,-90,22,1,true);
    const moon=new THREE.Mesh(new THREE.SphereGeometry(4,24,16),new THREE.MeshBasicMaterial({color:'#f4f0e0',fog:false}));moon.position.set(-22,22,-92);g.add(moon);
    const wood=new THREE.MeshStandardMaterial({map:woodTex(),roughness:.85}),dark=new THREE.MeshStandardMaterial({color:'#2a1a10',roughness:.9});
    const M=st.main;box(g,wood,0,-.3,0,M.r-M.l,.6,3.6);for(let x=M.l+.4;x<M.r;x+=2.2){box(g,dark,x,-3,1.4,.35,6,.35);box(g,dark,x,-3,-1.4,.35,6,.35)}
    const crate=new THREE.MeshStandardMaterial({map:canvasTex(64,64,(c,w,h)=>{c.fillStyle='#8a6a3a';c.fillRect(0,0,w,h);c.strokeStyle='#4a3218';c.lineWidth=4;c.strokeRect(2,2,w-4,h-4);c.beginPath();c.moveTo(4,4);c.lineTo(w-4,h-4);c.stroke()}),roughness:.8});
    for(const p of st.plats)if(p.soft){const cx=(p.l+p.r)/2,w=p.r-p.l;box(g,crate,cx-w*.25,p.y/2,0,w*.48,p.y,1.6);box(g,crate,cx+w*.25,p.y/2,0,w*.48,p.y,1.6)}
    const water=new THREE.Mesh(new THREE.PlaneGeometry(400,200),new THREE.MeshStandardMaterial({color:'#0a1a3a',roughness:.15,metalness:.6}));water.rotation.x=-Math.PI/2;water.position.y=-6;g.add(water);g.userData.water=water;
    sprite(g,glowTex('rgba(200,210,255,1)'),-22,-5.9,-60,26,.35,true);
    const city=new THREE.MeshBasicMaterial({color:'#0c1028',fog:false});for(let i=0;i<30;i++){const w=3+rnd()*6,h=6+rnd()*26,x=-90+i*6+rnd()*3;const b=box(g,city,x,-6+h/2,-80,w,h,4,false);
      for(let k=0;k<8;k++)sprite(g,glowTex(rnd()<.5?'rgba(255,210,120,1)':'rgba(140,220,255,1)'),x+(rnd()-.5)*w,-6+rnd()*h,-77.5,.9,.9,true)}
    for(const x of[-8.6,8.6]){box(g,dark,x,1.3,-1.3,.18,2.6,.18);const l=new THREE.PointLight('#ffb060',14,9,1.6);l.position.set(x,2.7,-1);g.add(l);sprite(g,glowTex('rgba(255,190,100,1)'),x,2.7,-1.2,2.2,1,true)}},
  tick(g,t){if(g.userData.water)g.userData.water.position.y=-6+Math.sin(t/60)*.06}},
 {id:'temple',name:'TEMPLE GARDEN',song:'temple',desc:'A mountain temple in spring, petals on the wind.',
  main:{l:-8.5,r:8.5,y:0,th:2.2},soft:[{l:-6.2,r:-2.6,y:3.3},{l:2.6,r:6.2,y:3.3}],blast:{l:-21,r:21,b:-11,t:21},spawn:{x:0,y:8},
  light:{sun:'#fff0d8',sunI:2.5,sunPos:[7,12,9],hemiSky:'#c8e0ff',hemiGround:'#6a5a4a',hemi:.9,rim:'#ffd0e0',fog:'#d8e0f0',fogN:35,fogF:130},
  build(g,st){sky(g,[[0,'#6aa0e8'],[.55,'#b8d8f8'],[.7,'#f0f0f4'],[1,'#d8e0f0']]);
    const stone=new THREE.MeshStandardMaterial({map:stoneTex(),roughness:.9,color:'#d8d0c0'}),red=new THREE.MeshStandardMaterial({color:'#b82a20',roughness:.6}),roof=new THREE.MeshStandardMaterial({color:'#2a3448',roughness:.5}),wood=new THREE.MeshStandardMaterial({map:woodTex(),roughness:.8});
    const M=st.main;box(g,stone,0,-1.1,0,M.r-M.l,2.2,3.6);box(g,stone,0,-.05,0,M.r-M.l+.3,.12,3.8);
    for(const p of st.plats)if(p.soft){softPlat(g,p,wood);for(const x of[p.l+.3,p.r-.3])box(g,red,x,p.y/2-.15,-.8,.25,p.y-.3,.25)}
    /* a pagoda behind */
    for(let i=0;i<4;i++){const w=7-i*1.4,y=2+i*4.2;box(g,red,0,y,-14,w*.55,3.4,w*.55);const r=new THREE.Mesh(new THREE.ConeGeometry(w*.75,1.4,4),roof);r.position.set(0,y+2.2,-14);r.rotation.y=Math.PI/4;r.castShadow=true;g.add(r)}
    const pink=new THREE.MeshStandardMaterial({color:'#ffb0c8',roughness:.9}),trunk=new THREE.MeshStandardMaterial({color:'#4a3020',roughness:.9});
    for(const[x,z]of[[-13,-8],[13,-9],[-20,-20],[19,-18],[-6,-24],[8,-26]]){box(g,trunk,x,1,z,.5,4,.5);for(let k=0;k<6;k++){const b=new THREE.Mesh(new THREE.SphereGeometry(1.4+rnd(),12,10),pink);b.position.set(x+(rnd()-.5)*3,4+rnd()*2,z+(rnd()-.5)*2);g.add(b)}}
    const mt=new THREE.MeshStandardMaterial({color:'#7a8aa8',roughness:1});for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(14+rnd()*14,20+rnd()*20,5),mt);m.position.set(-80+i*27,-2,-90-rnd()*20);g.add(m)}
    const pt=glowTex('rgba(255,180,210,1)');g.userData.petals=[];for(let i=0;i<60;i++){const s=sprite(g,pt,(rnd()-.5)*40,rnd()*20,(rnd()-.5)*8,.35,.9);s.userData.v=[.01+rnd()*.03,-.01-rnd()*.02,rnd()*6];g.userData.petals.push(s)}},
  tick(g,t){for(const s of g.userData.petals||[]){const v=s.userData.v;s.position.x+=v[0]+Math.sin(t/40+v[2])*.01;s.position.y+=v[1];if(s.position.y<-6){s.position.y=20;s.position.x=(rnd()-.5)*40}}}},
];
function buildStage(def){const M=def.main;const main={l:M.l,r:M.r,y:M.y,th:M.th,soft:false,solid:true,main:1};
  const plats=[main,...def.soft.map(p=>({l:p.l,r:p.r,y:p.y,soft:true}))];
  return{def,name:def.name,main,plats,ledges:[{x:M.l,y:M.y,side:-1,who:null},{x:M.r,y:M.y,side:1,who:null}],blast:def.blast,spawn:def.spawn}}
