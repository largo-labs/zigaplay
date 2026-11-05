/* ================= the 3D view ================= */
const CV=$('#gl');
let REN;try{REN=new THREE.WebGLRenderer({canvas:CV,antialias:true,powerPreference:'high-performance'})}catch(e){$('#err').style.display='block';throw e}
REN.outputColorSpace=THREE.SRGBColorSpace;REN.toneMapping=THREE.ACESFilmicToneMapping;REN.toneMappingExposure=1.05;REN.shadowMap.enabled=true;REN.shadowMap.type=THREE.PCFSoftShadowMap;
const SC=new THREE.Scene(),CAM=new THREE.PerspectiveCamera(30,16/9,.1,400);
function resize(){const w=innerWidth,h=innerHeight;REN.setPixelRatio(Math.min(2,devicePixelRatio||1));REN.setSize(w,h,false);CAM.aspect=w/h;CAM.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
const VIEW={group:null,stage:null,fx:[],fighters:new Map(),cam:{x:0,y:3,d:22,tx:0,ty:3,td:22},lights:null,t:0};
const FXT={glow:glowTex('rgba(255,255,255,1)'),smoke:canvasTex(64,64,(g,w,h)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.75)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)}),
  ring:canvasTex(64,64,(g,w,h)=>{g.strokeStyle='rgba(255,255,255,1)';g.lineWidth=5;g.beginPath();g.arc(32,32,26,0,7);g.stroke()}),
  star:canvasTex(64,64,(g,w,h)=>{g.translate(32,32);g.fillStyle='#fff';for(let i=0;i<4;i++){g.rotate(Math.PI/4);g.beginPath();g.moveTo(-3,0);g.lineTo(0,-30);g.lineTo(3,0);g.lineTo(0,30);g.fill()}})};
/* ---------- building the world for a stage (or a menu backdrop) ---------- */
function setWorld(def,st){if(VIEW.group){SC.remove(VIEW.group);disposeGroup(VIEW.group)}for(const v of VIEW.fighters.values())SC.remove(v.outer);VIEW.fighters.clear();VIEW.fx.forEach(e=>e.obj.parent&&e.obj.parent.remove(e.obj));VIEW.fx=[];
  const g=new THREE.Group();VIEW.group=g;SC.add(g);const L=def.light;
  SC.fog=new THREE.Fog(L.fog,L.fogN,L.fogF);
  g.add(new THREE.HemisphereLight(L.hemiSky,L.hemiGround,L.hemi));
  const sun=new THREE.DirectionalLight(L.sun,L.sunI);sun.position.set(...L.sunPos);sun.castShadow=true;sun.shadow.mapSize.set(2048,1024);
  Object.assign(sun.shadow.camera,{left:-16,right:16,top:14,bottom:-6,near:1,far:60});sun.shadow.bias=-.0005;sun.shadow.normalBias=.02;g.add(sun);g.add(sun.target);
  const rim=new THREE.DirectionalLight(L.rim,.9);rim.position.set(-L.sunPos[0],6,-10);g.add(rim);
  const fill=new THREE.DirectionalLight('#ffffff',.35);fill.position.set(0,3,14);g.add(fill);
  def.build(g,st||buildStage(def));VIEW.stage=def;return g}
function disposeGroup(g){g.traverse(o=>{if(o.geometry&&!o.geometry._keep)o.geometry.dispose()})}
/* ---------- fighters on screen ---------- */
const SHIELDC=['#ff4a5a','#4ab0ff'];
function addFighterView(f){const R=buildRig(f.ch.look),outer=new THREE.Group(),yaw=new THREE.Group();yaw.add(R.root);outer.add(yaw);SC.add(outer);
  const shield=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:SHIELDC[f.slot],transparent:true,opacity:.32,depthWrite:false,blending:THREE.AdditiveBlending}));shield.visible=false;outer.add(shield);
  const aura=new THREE.Sprite(new THREE.SpriteMaterial({map:FXT.glow,color:f.ch.fx,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));aura.visible=false;outer.add(aura);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.42,.5,32),new THREE.MeshBasicMaterial({color:SHIELDC[f.slot],transparent:true,opacity:.75,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;outer.add(ring);
  const v={f,R,outer,yaw,shield,aura,ring,pose:new Float32Array(PK.length),tgt:new Float32Array(PK.length),yawA:f.face>0?1:-1,spin:0};
  VIEW.fighters.set(f,v);return v}
const YAW=Math.PI/2-.5;
function targetPose(f,v){const m=f.mv,out=v.tgt,weapon=!!f.ch.look.weapon;
  switch(f.st){
  case'stand':{if(Math.abs(f.vx)>.01){v.ph=(v.ph||0)+Math.abs(f.vx)*7;return cyclePose(v.ph,false,out)}const s=weapon?'stanceW':'stance';return mixPose(POSE[s],POSE[s+'2'],(Math.sin(f.clock/14)+1)/2,out)}
  case'dash':case'run':v.ph=(v.ph||0)+Math.abs(f.vx)*4.2;return cyclePose(v.ph,true,out);
  case'skid':return mixPose(POSE.land,POSE.shield,.4,out);
  case'crouch':case'jsq':case'land':case'getup':case'ledgeup':return out.set(f.st==='crouch'?POSE.crouch:f.st==='ledgeup'?POSE.climb:POSE.jsq),out;
  case'air':case'respawn':return mixPose(POSE.jump,POSE.fall,clamp(.5-f.vy*4,0,1),out);
  case'helpless':return out.set(POSE.helpless),out;
  case'attack':case'special':return sampleMove(m,out);
  case'shield':return out.set(POSE.shield),out;
  case'roll':return out.set(POSE.roll),out;
  case'spot':return out.set(POSE.dodge),out;
  case'adodge':return out.set(POSE.adodge),out;
  case'hurt':return out.set(f.tumble?POSE.tumble:(f.slot+f.clock)%2?POSE.hurt:POSE.hurt2),out;
  case'lie':return out.set(POSE.lie),out;
  case'dizzy':case'parried':return out.set(POSE.dizzy),out;
  case'held':return out.set(POSE.held),out;
  case'grabbing':return out.set(POSE.hold),out;
  case'throwing':return out.set(POSE[f.throwPose]||POSE.throwF),out;
  case'ledge':return out.set(POSE.hang),out;
  case'win':return out.set(POSE[f.winPose||'win']),out;
  case'clap':return out.set(POSE.clap),out;
  default:return out.set(POSE.stance),out}}
function syncFighter(f,v){const o=v.outer;if(f.dead){o.visible=false;return}o.visible=true;
  const m=f.mv;if(m&&m.def.hidden&&m.def.hidden(m)){o.visible=false;return}
  if(f.st==='respawn'||f.inv>40&&f.st==='air')o.visible=Math.floor(VIEW.t/4)%3!==0;
  targetPose(f,v);const fast=f.st==='attack'||f.st==='special'||f.st==='hurt'||f.st==='throwing';mixPose(v.pose,v.tgt,fast?.55:.3,v.pose);applyPose(v.R,v.pose);
  let sx=0;if(f.hitlag>0&&f.st==='hurt')sx=(Math.random()-.5)*.12;
  o.position.set(f.x+sx,f.y,0);
  v.yawA=lerp(v.yawA,f.face,f.st==='ledge'||f.st==='roll'?1:.35);let yaw=v.yawA*YAW;
  if(m&&m.def.spin&&f.st!=='hurt')yaw+=m.f*.55;
  v.yaw.rotation.y=yaw;
  let rz=0;if(f.st==='hurt'&&f.tumble)rz=-f.face*f.t*.25;if(f.flip>0)rz=f.face*(1-f.flip/24)*Math.PI*-2;if(f.st==='roll')rz=0;if(m&&m.def.rot&&f.st==='special'&&m.f<18)rz=-f.face*m.f/18*Math.PI*2;
  v.yaw.rotation.z=rz;v.yaw.position.y=rz?f.h*.5:0;v.R.root.position.y=rz?-f.h*.5:0;
  /* shield bubble, shrinking as it wears down */
  const sh=f.st==='shield';v.shield.visible=sh;if(sh){const s=.45+f.shieldHP/50*.75;v.shield.scale.setScalar(s*(f.h/1.8));v.shield.position.set(0,f.h*.5,0);v.shield.material.opacity=.22+(1-f.shieldHP/50)*.25}
  /* glows: charging, counters, dodges */
  let au=null;if(m){if(m.def.aura)au=m.def.aura(f,m);if(m.def.smash&&m.charge>0)au={r:.15+m.charge/60*.25,front:1};if(m.def.glow&&m.def.glow(f,m))au={r:.9,body:1}}
  if(f.st==='spot'||f.st==='roll'||f.st==='adodge')au=f.inv>0?{r:.95,body:1,col:'#9af0ff'}:null;
  v.aura.visible=!!au;if(au){const fl=1+Math.sin(VIEW.t/3)*.12;v.aura.scale.setScalar((au.body?1.9:au.r*4)*fl);v.aura.position.set(au.body?0:f.face*.7,au.body?f.h*.5:1.15,au.body?-.2:.3);v.aura.material.color.set(au.col||f.ch.fx);v.aura.material.opacity=au.body?.35:.9}
  v.ring.visible=!f.dead&&G.state!=='menu';if(f.st==='respawn'){v.ring.position.y=.03;v.ring.scale.setScalar(1.7+Math.sin(VIEW.t/6)*.15)}else{v.ring.scale.setScalar(1);v.ring.position.y=(platUnder(f.x,f.y+.01)?.y??f.y)-f.y+.03}
  /* blade trails */
  if(m&&m.def.weaponFx&&m.f>=m.def.s-1&&m.f<m.def.s+m.def.a+1&&v.R.J.weapon){const w=v.R.J.weapon,p=new THREE.Vector3(0,0,w.userData.tip*.8);w.localToWorld(p);fxAt(p.x,p.y,p.z,FXT.glow,f.ch.fx,.5,8,0,0,0,.92)}
  if(m&&m.def.draw){const d=m.def.draw(f,m);if(d&&d.beam){for(let i=0;i<4;i++)fxAt(f.x+f.face*(.6+rnd()*d.beam),f.y+1.12,.2,FXT.glow,f.ch.fx,.45,6,0,0,0,.9)}}}
/* ---------- effects: additive sprites that move, grow and fade ---------- */
function fxAt(x,y,z,tex,col,size,life,vx=0,vy=0,vz=0,grow=1,add=true,op=1){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:col,transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,opacity:op}));
  s.position.set(x,y,z);s.scale.setScalar(size);SC.add(s);VIEW.fx.push({obj:s,vx,vy,vz,life,max:life,grow,op});return s}
function tickFx(){for(const e of VIEW.fx){e.life--;e.obj.position.x+=e.vx;e.obj.position.y+=e.vy;e.obj.position.z+=e.vz;e.vy-=e.g||0;e.obj.scale.multiplyScalar(e.grow);e.obj.material.opacity=e.op*Math.min(1,e.life/(e.max*.5))}
  for(const e of VIEW.fx)if(e.life<=0){SC.remove(e.obj);e.obj.material.dispose()}VIEW.fx=VIEW.fx.filter(e=>e.life>0)}
function fxHit(x,y,col,p,dir){fxAt(x,y,.6,FXT.glow,'#ffffff',.7+p*.45,7,0,0,0,1.04,true,.85);fxAt(x,y,.6,FXT.star,col,.8+p*.5,9,0,0,0,1.04);
  for(let i=0;i<5+p*4;i++){const a=rnd()*Math.PI*2,s=.06+rnd()*.09*(1+p);fxAt(x,y,.5,FXT.glow,i%2?col:'#ffffff',.12+rnd()*.1,12+rnd()*10,Math.cos(a)*s+dir*.04,Math.sin(a)*s,0,.94)}
  if(p>=1)fxAt(x,y,.4,FXT.ring,col,.5,12,0,0,0,1.11,true,.8)}
function fxSpark(x,y,col,s){fxAt(x,y,.5,FXT.glow,col,s*1.6,8,0,0,0,1.05)}
function fxDust(f,n){for(let i=0;i<n;i++)fxAt(f.x+(rnd()-.5)*.6,f.y+.1,(rnd()-.5)*.4,FXT.smoke,'#e0d8d0',.3+rnd()*.25,18+rnd()*10,(rnd()-.5)*.03,.006+rnd()*.008,0,1.025,false,.45)}
function fxRing(f){fxAt(f.x,f.y+.1,0,FXT.ring,'#ffffff',.6,14,0,0,0,1.09,true,.7)}
function fxTrail(f){fxAt(f.x,f.y+1,.1,FXT.glow,f.ch.fx,.8,12,0,0,0,.95,true,.6)}
function fxPoof(f){for(let i=0;i<10;i++){const a=rnd()*Math.PI*2;fxAt(f.x,f.y+.9,0,FXT.smoke,'#7a6a9a',.6,20,Math.cos(a)*.04,Math.sin(a)*.04,0,1.04,false,.7)}}
function fxShock(x,y,col){fxAt(x,y+.1,0,FXT.ring,col,.8,16,0,0,0,1.1,true,.8);for(let i=0;i<8;i++){const s=i<4?-1:1;fxAt(x,y+.15,(rnd()-.5)*.6,FXT.smoke,'#cfc6bc',.45,20,s*(.03+rnd()*.05),.008,0,1.03,false,.45)}}
function fxBoom(x,y,col){fxAt(x,y,0,FXT.glow,'#ffd890',2.2,14,0,0,0,1.03,true,.9);fxAt(x,y,0,FXT.ring,col,.8,16,0,0,0,1.11,true,.8);for(let i=0;i<12;i++){const a=rnd()*Math.PI*2;fxAt(x,y,0,FXT.smoke,'#8a7a70',.6,26,Math.cos(a)*.06,Math.sin(a)*.06,0,1.03,false,.6)}}
function fxKO(f){const x=clamp(f.x,G.stage.blast.l+2,G.stage.blast.r-2),y=clamp(f.y,G.stage.blast.b+1.5,G.stage.blast.t-2),a=Math.atan2(VIEW.cam.y-y,VIEW.cam.x-x);
  for(let i=0;i<26;i++){const s=.4+i*.32;fxAt(x+Math.cos(a)*s,y+Math.sin(a)*s,0,FXT.glow,i%3?f.ch.fx:'#ffffff',2.4-i*.06,26+i,0,0,0,1.01)}
  for(let i=0;i<30;i++){const b=a+(rnd()-.5)*1.4,s=.1+rnd()*.3;fxAt(x,y,0,FXT.glow,pick(['#ffffff',f.ch.fx,'#ffd84a']),.35,30+rnd()*20,Math.cos(b)*s,Math.sin(b)*s,0,.97)}}
/* projectiles: a glowing core and a halo that follow it */
function fxProj(p){const core=fxAt(p.x,p.y,.2,p.kind==='star'?FXT.star:FXT.glow,p.kind==='mine'?'#ff5a5a':'#ffffff',p.r*2.6,1e9,0,0,0,1,true);
  const halo=fxAt(p.x,p.y,.15,FXT.glow,p.col,p.r*5.5,1e9,0,0,0,1,true);p.views=[core,halo]}
function syncProj(){for(const p of G.proj){if(!p.views)continue;const[c,h]=p.views;c.position.set(p.x,p.y,.2);h.position.set(p.x,p.y,.15);h.material.color.set(p.col);
    if(p.kind==='star')c.material.rotation+=.4;if(p.mine){const on=p.t>=p.arm&&Math.floor(p.t/8)%2;c.material.color.set(on?'#ff3a3a':'#ffd84a')}
    if(p.kind==='wave'&&p.t%2===0)fxAt(p.x,p.y-.2,(rnd()-.5)*.6,FXT.smoke,'#d8d0c8',.5,14,0,.03,0,1.04,false,.7)}
}
function text3d(f,s,col){G.texts=G.texts||[];G.texts.push({f,s,col,t:60})}
/* ---------- the camera: frames everyone, smoothly ---------- */
function updateCamera(snap){const c=VIEW.cam,fs=G.fighters.filter(f=>!f.dead);let minX=-4,maxX=4,minY=0,maxY=3;
  if(fs.length){minX=Math.min(...fs.map(f=>f.x))-2.4;maxX=Math.max(...fs.map(f=>f.x))+2.4;minY=Math.min(...fs.map(f=>f.y))-.6;maxY=Math.max(...fs.map(f=>f.y+f.h))+1}
  const B=G.stage.blast;minX=Math.max(minX,B.l+2);maxX=Math.min(maxX,B.r-2);minY=Math.max(minY,B.b+2);maxY=Math.min(maxY,B.t-1);
  const t=Math.tan(CAM.fov*D2R/2),w=Math.max(9,maxX-minX),h=Math.max(5,maxY-minY);
  c.td=clamp(Math.max(w/2/(t*CAM.aspect),h/2/t)*1.08,12,38);c.tx=(minX+maxX)/2;c.ty=(minY+maxY)/2+.6;
  const k=snap?1:.09;c.x=lerp(c.x,c.tx,k);c.y=lerp(c.y,c.ty,k);c.d=lerp(c.d,c.td,k*.8);
  const sh=G.shake>0?G.shake:0;CAM.position.set(c.x+(rnd()-.5)*sh,c.y+c.d*.11+(rnd()-.5)*sh,c.d);CAM.lookAt(c.x,c.y,0)}
/* ---------- portraits for the menus and the HUD, drawn once from the models ---------- */
let PREN=null;const PORTS={};
function portrait(ch,kind='face'){const key=ch.id+kind;if(PORTS[key])return PORTS[key];
  if(!PREN){PREN=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});PREN.outputColorSpace=THREE.SRGBColorSpace;PREN.toneMapping=THREE.ACESFilmicToneMapping}
  const w=kind==='face'?160:240,h=kind==='face'?160:300;PREN.setSize(w,h,false);
  const s=new THREE.Scene();s.add(new THREE.HemisphereLight('#dfe8ff','#3a2a3a',1.1));const l=new THREE.DirectionalLight('#fff0e0',2.4);l.position.set(2,3,4);s.add(l);const r=new THREE.DirectionalLight(ch.fx,1.4);r.position.set(-3,2,-2);s.add(r);
  const R=buildRig(ch.look);applyPose(R,POSE[ch.look.weapon?'stanceW':'stance']);if(kind==='face'&&R.J.weapon)R.J.weapon.visible=false;R.root.rotation.y=.45;s.add(R.root);const H=1.8*(ch.look.h||1);
  const c=new THREE.PerspectiveCamera(kind==='face'?22:26,w/h,.1,50);
  if(kind==='face'){c.position.set(.35,H*.9,1.35);c.lookAt(0,H*.87,0)}else{c.position.set(.6,H*.55,4.3);c.lookAt(0,H*.5,0)}
  PREN.render(s,c);const url=PREN.domElement.toDataURL();PORTS[key]=url;return url}
/* ---------- each frame ---------- */
function render3D(){VIEW.t++;if(VIEW.stage&&VIEW.stage.tick)VIEW.stage.tick(VIEW.group,VIEW.t);
  for(const[f,v]of VIEW.fighters){if(VIEW.hideF){v.outer.visible=false;continue}syncFighter(f,v)}syncProj();REN.render(SC,CAM)}
