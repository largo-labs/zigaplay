/* ================= Lynties 3D: the world as a little toy diorama =================
   Everything about how the game plays stays the same: maps are still tile grids, you still walk tile by tile,
   and battles, menus and saves are untouched. Only the world view is new. The ground keeps its pixel-art tiles,
   laid flat; trees, rocks, walls, houses and tall grass stand up as toon-shaded 3D shapes; you and everyone you
   meet are small chibi figures; and the camera follows from behind and above. If three.js or WebGL can't load,
   the game simply keeps the pixel-art view. */
let THREE=null;
var W3={ok:false,stats:()=>W3.r?Object.assign({},W3.r.info.render,{geos:W3.r.info.memory.geometries,tex:W3.r.info.memory.textures,chunks:W3.chunks.size,ents:W3.ents.size}):null,failed:false,loading:false,m:null,chunks:new Map(),ents:new Map(),U:null,shown:false,frame:0};
const W3K={fov:34,pitch:.8,viewW:9.4,CH:12,PAD:4,ahead:12,behind:7,kid:1.32,gs:2};

function load3D(){
  if(W3.loading||W3.ok)return;
  /* the offline edition's copy of three.js comes after the game's script in the page, so wait for the whole page */
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',load3D,{once:true});return}
  W3.loading=true;
  let p;
  try{
    const inCore=document.getElementById('three-core'),inMod=document.getElementById('three-mod');
    if(inCore&&inMod){/* the offline edition carries three.js inside the page */
      const core=URL.createObjectURL(new Blob([inCore.textContent],{type:'text/javascript'}));
      const mod=inMod.textContent.split('"./three.core.min.js"').join(JSON.stringify(core));
      p=import(URL.createObjectURL(new Blob([mod],{type:'text/javascript'})))}
    else p=import(new URL('3d/three.module.min.js',document.baseURI).href);
  }catch(e){p=Promise.reject(e)}
  p.then(T=>{THREE=T;init3D()}).catch(e=>{W3.failed=true;console.warn('Lynties 3D could not load, using the pixel view',e)})}

function init3D(){
  try{
    const box=$('#screenBox'),c=document.createElement('canvas');c.id='cv3';box.insertBefore(c,box.firstChild);
    const r=new THREE.WebGLRenderer({canvas:c,antialias:true,powerPreference:'high-performance'});
    r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.NeutralToneMapping;r.toneMappingExposure=1.05;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFShadowMap;
    const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(W3K.fov,1,1,120);
    const hemi=new THREE.HemisphereLight('#ffffff','#5a6470',1.5),sun=new THREE.DirectionalLight('#fff3dc',2.4);
    sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.radius=3;
    const s2=sun.shadow.camera;s2.left=-12;s2.right=12;s2.top=12;s2.bottom=-12;s2.near=1;s2.far=70;sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;
    sc.add(hemi,sun,sun.target);
    const lamp=new THREE.PointLight('#ffd9a0',0,13,1.1);sc.add(lamp);
    sc.fog=new THREE.Fog('#a6ddf5',30,60);sc.background=new THREE.Color('#a6ddf5');
    const world=new THREE.Group(),actors=new THREE.Group();sc.add(world,actors);
    W3.U={uPly:{value:new THREE.Vector3()},uCam:{value:new THREE.Vector3()},uTime:{value:0}};
    Object.assign(W3,{r,sc,cam,hemi,sun,lamp,world,actors,cv:c,ok:true,aniso:Math.min(8,r.capabilities.getMaxAnisotropy())});
    W3.env={cur:null,want:null};
    size3D();
  }catch(e){W3.failed=true;W3.ok=false;console.warn('Lynties 3D could not start, using the pixel view',e)}}

function size3D(){if(!W3||!W3.ok)return;const b=$('#screenBox'),w=b.clientWidth||240,h=b.clientHeight||200,k=(b.getBoundingClientRect().width/(b.offsetWidth||w))||1;
  W3.r.setPixelRatio(Math.min(2.5,(window.devicePixelRatio||1)*k));W3.r.setSize(w,h,false);W3.cam.aspect=w/h;W3.cam.updateProjectionMatrix();W3.aspect=w/h}
function show3D(on){if(!W3.ok||W3.shown===on)return;W3.shown=on;W3.cv.style.visibility=on?'visible':'hidden'}

/* ---------- materials: banded toon shading, ink outlines, and a see-through hole around you ---------- */
let _w3grad=null;
function w3grad(){if(_w3grad)return _w3grad;const d=new Uint8Array([150,188,222,255]);_w3grad=new THREE.DataTexture(d,4,1,THREE.RedFormat);_w3grad.minFilter=_w3grad.magFilter=THREE.NearestFilter;_w3grad.needsUpdate=true;return _w3grad}
/* anything standing between the camera and you dissolves in a fine dither, so walls and trees never hide you */
const W3FADE=`varying vec3 vW3;uniform vec3 uPly;uniform vec3 uCam;
const float W3BY[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
void w3fade(){vec3 ab=uPly-uCam;float t=dot(vW3-uCam,ab)/dot(ab,ab);if(t>.93)return;vec3 q=uCam+ab*clamp(t,0.,1.);float d=length(vW3-q);
  float k=1.-smoothstep(.35,.8,d);if(k<=0.)return;ivec2 g=ivec2(mod(gl_FragCoord.xy,4.));if(W3BY[g.x+g.y*4]/16.<k*.8)discard;}`;
const W3WPOS=`#ifdef USE_INSTANCING
vW3=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;
#else
vW3=(modelMatrix*vec4(transformed,1.)).xyz;
#endif`;
function w3fadeable(mat){mat.onBeforeCompile=sh=>{sh.uniforms.uPly=W3.U.uPly;sh.uniforms.uCam=W3.U.uCam;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vW3;').replace('#include <project_vertex>','#include <project_vertex>\n'+W3WPOS);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+W3FADE).replace(/void main\(\) \{/,'void main() {\nw3fade();')};
  mat.customProgramCacheKey=()=>'w3fade';return mat}
const _w3m=new Map();
function w3toon(hex,o={}){const k='t'+hex+JSON.stringify(o);if(_w3m.has(k))return _w3m.get(k);const{fade,...rest}=o;
  const m=new THREE.MeshToonMaterial(Object.assign({color:new THREE.Color(hex),gradientMap:w3grad()},rest));if(fade)w3fadeable(m);_w3m.set(k,m);return m}
function w3vc(fade,toon=false){const k='vc'+(fade?1:0)+(toon?'t':'');if(_w3m.has(k))return _w3m.get(k);const m=toon?new THREE.MeshToonMaterial({vertexColors:true,gradientMap:w3grad()}):new THREE.MeshLambertMaterial({vertexColors:true});if(fade)w3fadeable(m);_w3m.set(k,m);return m}
/* plain smooth-lit material for scenery */
function w3lam(hex){const k='l'+hex;if(_w3m.has(k))return _w3m.get(k);const m=new THREE.MeshLambertMaterial({color:new THREE.Color(hex)});_w3m.set(k,m);return m}
function w3ink(width=.02,hex='#1b1430',fade=false){const k='i'+width+hex+fade;if(_w3m.has(k))return _w3m.get(k);
  const u=THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{w:{value:width},col:{value:new THREE.Color(hex)}}]);u.uPly=W3.U.uPly;u.uCam=W3.U.uCam;
  const m=new THREE.ShaderMaterial({side:THREE.BackSide,uniforms:u,fog:true,
    vertexShader:`uniform float w;varying vec3 vW3;
      #include <fog_pars_vertex>
      void main(){vec3 transformed=position+normalize(normal)*w;
      #ifdef USE_INSTANCING
        vec4 mvPosition=modelViewMatrix*instanceMatrix*vec4(transformed,1.0);
      #else
        vec4 mvPosition=modelViewMatrix*vec4(transformed,1.0);
      #endif
        gl_Position=projectionMatrix*mvPosition;
        ${W3WPOS}
      #include <fog_vertex>
      }`,
    fragmentShader:`uniform vec3 col;${fade?W3FADE:'varying vec3 vW3;'}
      #include <fog_pars_fragment>
      void main(){${fade?'w3fade();':''}gl_FragColor=vec4(col,1.0);
      #include <colorspace_fragment>
      #include <fog_fragment>
      }`});
  m.userData.ink=true;_w3m.set(k,m);return m}
/* a toon mesh with its outline */
function w3part(geo,hex,{ol=.012,shadow=true,mat=null,fade=false}={}){const m=new THREE.Mesh(geo,mat||w3toon(hex,fade?{fade:1}:{}));m.castShadow=shadow;m.receiveShadow=true;
  if(ol>0){const o=new THREE.Mesh(geo,w3ink(ol,'#1b1430',fade));o.userData.outline=true;o.castShadow=false;m.add(o)}return m}

/* ---------- merging many pieces into one mesh (one draw call, plus one for the outline) ---------- */
function w3merge(pieces){let n=0;const qs=pieces.map(([g,mx,hex])=>{const q=g.index?g.toNonIndexed():g.clone();if(mx)q.applyMatrix4(mx);n+=q.attributes.position.count;return[q,hex]});
  const P2=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3),col=new THREE.Color();let o=0;
  for(const[q,hex]of qs){const cnt=q.attributes.position.count;P2.set(q.attributes.position.array,o*3);N.set(q.attributes.normal.array,o*3);col.set(hex);
    for(let i=0;i<cnt;i++){C[(o+i)*3]=col.r;C[(o+i)*3+1]=col.g;C[(o+i)*3+2]=col.b}o+=cnt;q.dispose()}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P2,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setAttribute('color',new THREE.BufferAttribute(C,3));g.computeBoundingSphere();return g}
function w3mergedMesh(pieces,{ol=.022,fade=true,shadow=true,toon=false}={}){if(!pieces.length)return null;const g=w3merge(pieces),m=new THREE.Mesh(g,w3vc(fade,toon));m.castShadow=shadow;m.receiveShadow=true;
  if(ol>0){const o=new THREE.Mesh(g,w3ink(ol,'#1b1430',fade));o.userData.outline=true;m.add(o)}return m}
const w3M4=(x,y,z,ry=0,sx=1,sy=sx,sz=sx,rx=0,rz=0)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz));
const _w3g=new Map();function w3geo(k,f){if(!_w3g.has(k))_w3g.set(k,f());return _w3g.get(k)}
const W3G={
  sph:(d=1)=>w3geo('sph'+d,()=>new THREE.IcosahedronGeometry(1,d)),
  ball:()=>w3geo('ball',()=>new THREE.SphereGeometry(1,16,12)),
  cyl:(s=8)=>w3geo('cyl'+s,()=>new THREE.CylinderGeometry(1,1,1,s)),
  cone:(s=8)=>w3geo('cone'+s,()=>new THREE.ConeGeometry(1,1,s)),
  blade:()=>w3geo('blade',()=>new THREE.ConeGeometry(1,1,3,1,true)),
  box:()=>w3geo('box',()=>new THREE.BoxGeometry(1,1,1)),
  dode:()=>w3geo('dode',()=>new THREE.DodecahedronGeometry(1,0)),
  tcone:(r0,s=8)=>w3geo('tc'+r0+s,()=>new THREE.CylinderGeometry(r0,1,1,s)),
};

/* ---------- tiles: what each kind becomes in 3D ---------- */
const W3BLD=/^(roof[TRS]|hroof_|win$|door$|lwall_|lgate_|hfront$|hdoor$)/;
const W3WATER=/^(deep|lava|shallows|cp_)/;
const W3GRASS=new Set(['tallgrass','windgrass','frostgrass','stormgrass','embergrass','shadegrass','brush']);
/* walls and other solid blocks: how tall, and which tile paints the top */
function w3block(t){
  if(t==='cliff')return{h:1.05,top:'peak'};
  if(t==='rockface')return{h:1.7};
  if(t==='cavemouth')return{h:1.7,side:'rockface',top:'rockface',front:'cavemouth'};
  if(t.startsWith('cw_'))return{h:1.15,rough:1};
  if(t==='iwall')return{h:1.75};
  if(t==='shelf')return{h:1.3,side:'iwall',top:'counter',front:'shelf'};
  if(t==='counter')return{h:.62};
  if(t==='hearth')return{h:1,side:'iwall',top:'counter',front:'hearth'};
  if(t==='labpc')return{h:1.05,side:'counter',top:'counter',front:'labpc'};
  if(t==='rail')return{h:.5};
  if(t.startsWith('hwall_'))return{h:1.95};
  if(t==='swall')return{h:2};
  if(t==='sdoor')return{h:2,side:'swall',top:'swall',front:'sdoor'};
  if(t.startsWith('gate_'))return{h:1.25,gate:1};
  return{h:1}}
const _w3kind={};
function w3kind(t){if(_w3kind[t])return _w3kind[t];const d=TL[t];let k='flat';
  if(W3BLD.test(t))k='bld';else if(W3WATER.test(t))k='water';else if(W3GRASS.has(t))k='grass';else if(t.startsWith('cr_'))k='rubble';
  else if(TIMG_O[t]&&TIMG_O[t].length)k='obj';else if(!d.walk)k='block';
  return _w3kind[t]=k}

/* a tile canvas with the ground only (objects are drawn separately in 3D) */
const w3gimg=(t,v,f)=>{const a=TIMG_G[t][v];return a[f%a.length]};
function w3tex(canvas,{rep=false,mip=true,smooth=false}={}){const tx=new THREE.CanvasTexture(canvas);tx.colorSpace=THREE.SRGBColorSpace;tx.magFilter=smooth?THREE.LinearFilter:THREE.NearestFilter;
  tx.minFilter=mip?THREE.LinearMipmapLinearFilter:THREE.NearestFilter;tx.generateMipmaps=mip;tx.anisotropy=W3.aniso||1;if(rep){tx.wrapS=tx.wrapT=THREE.RepeatWrapping}return tx}
const _w3tt={};function w3tileTex(t,v=0){const k=t+v;return _w3tt[k]||(_w3tt[k]=w3tex(w3gimg(t,v,0),{rep:true}))}

/* the map, extended past its edges by repeating the edge tiles, so the camera never looks off the world */
const w3pad=m=>m.interior?0:W3K.PAD;
function w3t(m,x,y){if(!w3pad(m))return mT(m,x,y);return mT(m,clamp(x,0,m.w-1),clamp(y,0,m.h-1))}
function w3under(m,x,y){for(let k=1;k<8;k++){const t=w3t(m,x,y+k);if(t&&w3kind(t)!=='bld'&&TL[t].walk)return t}const z=m.zones&&m.zones.length?zoneAt(m,y):null;return z?THEMES[z.theme].ground:'grass'}

/* ---------- scenery models: each one is a handful of toon pieces, merged per chunk ---------- */
function w3obj(t,x,y,P){
  const cx=x+.5,cz=y+.5,r=mulberry(((x*73856093)^(y*19349663)^hashStr(t))>>>0),j=()=>r()-.5,c=TL[t].c,add=(g,mx,hex)=>P.push([g,mx,hex]);
  const base=t.replace(/_.*$/,'');
  switch(base){
    case 'tree':case 'darktree':{const dk2=t==='darktree',s=.9+r()*.26,ry=r()*6.28,ox=j()*.16,oz=j()*.16,X=cx+ox,Z=cz+oz,lx=j()*.08,lz=j()*.08;
      const trunk=dk2?'#3e302e':'#6e4e34',c1=dk2?'#4a3c70':'#4f9a46',jit=(h,a)=>mix(h,r()<.5?'#10140c':'#f4ffd8',r()*a);
      add(W3G.tcone(.7,7),w3M4(X,.4*s,Z,ry,.11*s,.8*s,.11*s,lz,-lx),trunk);
      add(W3G.sph(1),w3M4(X+lx*4,1.08*s,Z+lz*4,ry,.54*s,.46*s,.54*s),jit(c1,.1));
      for(let k=0;k<3;k++){const a=ry+k/3*6.28+j()*.6,rr=(.3+r()*.1)*s,d=(.3+r()*.08)*s;
        add(W3G.sph(1),w3M4(X+lx*4+Math.cos(a)*d,(.88+r()*.28)*s,Z+lz*4+Math.sin(a)*d*.9,r()*6,rr*(.92+r()*.16),rr*(.8+r()*.15),rr*(.92+r()*.16)),jit(c1,.16))}
      add(W3G.sph(1),w3M4(X+lx*5,1.38*s,Z+lz*5,r()*6,.3*s,.25*s,.3*s),jit(c1,.08));
      if(dk2)for(let i=0;i<3;i++)add(W3G.sph(0),w3M4(X+j()*.8,.85+r()*.6,Z+.3+r()*.15,0,.04),'#c9b6ff');
      if(P.blobs)P.blobs.push([X,Z,.95*s]);
      return true}
    case 'pine':{const s=.9+r()*.25,X=cx+j()*.12,Z=cz+j()*.12,ry=r()*6.28;
      add(W3G.cyl(6),w3M4(X,.18*s,Z,0,.08*s,.36*s,.08*s),'#6b4a2a');
      [[.36,.6,.5],[.78,.48,.42],[1.14,.34,.34]].forEach(([yy,rr,hh],i)=>{add(W3G.cone(8),w3M4(X,(yy+hh/2)*s,Z,ry+i,rr*s,hh*s,rr*s),i%2?'#255a42':'#2f6b4f');
        add(W3G.cone(8),w3M4(X,(yy+hh*.82)*s,Z,ry+i,rr*.42*s,hh*.36*s,rr*.42*s),'#f4f9ff')});
      if(P.blobs)P.blobs.push([X,Z,.8*s]);
      return true}
    case 'palm':{const X=cx+j()*.1,Z=cz+j()*.1,lean=.18+r()*.12,ry=r()*6.28,dx=Math.cos(ry)*lean,dz=Math.sin(ry)*lean;let px2=X,pz2=Z;
      for(let i=0;i<4;i++){const k=i/4,yy=.16+i*.28;add(W3G.cyl(6),w3M4(X+dx*k*k,yy,Z+dz*k*k,0,.075-i*.008,.3,.075-i*.008,dz*.6,-dx*.6),i%2?'#8a5c32':'#9a6b3c');px2=X+dx*k*k;pz2=Z+dz*k*k}
      const ty=1.24;for(let i=0;i<6;i++){const a=i/6*6.28+r()*.3;add(W3G.box(),w3M4(px2+Math.cos(a)*.3,ty-.06,pz2+Math.sin(a)*.3,-a,.62,.035,.16,0,.42),i%2?'#3f9a4a':'#4fb25a')}
      for(let i=0;i<3;i++)add(W3G.sph(1),w3M4(px2+Math.cos(i*2.1)*.09,ty-.12,pz2+Math.sin(i*2.1)*.09,0,.07),'#6b4a2a');
      if(P.blobs)P.blobs.push([px2,pz2,.75]);return true}
    case 'boulder':case 'basalt':{const bas=base==='basalt',X=cx+j()*.1,Z=cz+j()*.1,s=.9+r()*.2,col=bas?'#3e3439':c;
      add(W3G.dode(),w3M4(X,.3*s,Z,r()*6.28,.46*s,.36*s,.42*s),col);
      add(W3G.dode(),w3M4(X+.3,.14,Z+.22,r()*6.28,.18,.14,.16),bas?'#2e2629':lt(col));
      if(bas){add(W3G.box(),w3M4(X-.05,.5*s,Z+.18,.4,.32,.035,.04,0,.3),'#ff7a2a');add(W3G.box(),w3M4(X+.12,.42*s,Z+.3,-.5,.22,.03,.035,0,-.4),'#ffb13d')}
      if(P.blobs)P.blobs.push([X,Z,.62*s]);return true}
    case 'crystal':{const cols=['#5bc0eb','#7fd8f0','#a9ecff'];[[-.22,.08,.55,.13],[.02,-.05,1,.17],[.24,.1,.7,.14]].forEach(([dx,dz,h,w],i)=>{const tx=j()*.25,tz=j()*.25;
        add(W3G.cyl(6),w3M4(cx+dx,h*.42,cz+dz,i,w,h*.84,w,tx,tz),cols[i]);add(W3G.cone(6),w3M4(cx+dx-tz*h*.4,h*.84+.09,cz+dz+tx*h*.4,i,w,.2,w,tx,tz),lt(cols[i]))});
      return true}
    case 'hedge':{for(const[dx,dz,rr,hh]of[[-.24,.03,.36,.42],[.24,-.02,.36,.44],[0,.04,.4,.48]])add(W3G.sph(1),w3M4(cx+dx,hh,cz+dz,r()*6.28,rr+.04,hh,rr+.02),mix('#3f8f3e',r()<.5?'#10140c':'#e8ffd0',r()*.12));
      for(let i=0;i<5;i++){const a=r()*6.28;add(W3G.sph(0),w3M4(cx+Math.cos(a)*.38,.35+r()*.5,cz+Math.sin(a)*.34,r()*6,.14,.12,.14),mix('#3f8f3e','#0e2a10',r()*.25))}
      for(let i=0;i<4;i++)add(W3G.sph(0),w3M4(cx+j()*.7,.6+r()*.3,cz+.32,0,.06),'#7fcf6a');
      if(P.blobs)P.blobs.push([cx,cz,.72]);return true}
    case 'fence':{for(const dx of[.12,.88])add(W3G.box(),w3M4(x+dx,.32,cz,0,.1,.64,.1),'#8a5a34');
      for(const yy of[.3,.5])add(W3G.box(),w3M4(cx,yy,cz,0,1,.08,.06),'#c08a54');
      return true}
    case 'fountain':{add(W3G.cyl(16),w3M4(cx,.16,cz,0,.48,.32,.48),'#a9b4c2');add(W3G.cyl(16),w3M4(cx,.31,cz,0,.4,.03,.4),'#6fd3e8');
      add(W3G.cyl(8),w3M4(cx,.55,cz,0,.07,.5,.07),'#c9d2dc');add(W3G.cyl(12),w3M4(cx,.8,cz,0,.17,.07,.17),'#c9d2dc');add(W3G.sph(1),w3M4(cx,.9,cz,0,.08),'#bff2fb');
      return true}
    /* the houses' furniture: beds in two halves (head and foot), and a little round table set for tea */
    case 'bedT':case 'bedB':{const head=base==='bedT',bl=['#4a7fe0','#c4554a','#66a95a','#9a7fe0'][(x*3)%4];
      add(W3G.box(),w3M4(cx,.16,cz+(head?.05:-.05),0,.86,.24,.9),'#8a5a34');
      add(W3G.box(),w3M4(cx,.33,head?cz+.24:cz-.06,0,.82,.1,head?.5:.84),bl);add(W3G.box(),w3M4(cx,.39,head?cz+.03:cz-.3,0,.83,.02,.06),lt(bl));
      if(head){add(W3G.box(),w3M4(cx,.42,y+.07,0,.88,.66,.08),'#6e4428');add(W3G.sph(1),w3M4(cx,.36,y+.3,0,.3,.09,.15),'#f4f1ea')}
      else add(W3G.box(),w3M4(cx,.3,y+.93,0,.88,.38,.08),'#6e4428');
      return true}
    case 'table':{add(W3G.cyl(16),w3M4(cx,.53,cz,0,.4,.06,.4),'#c08a54');add(W3G.cyl(8),w3M4(cx,.27,cz,0,.07,.5,.07),'#8a5a34');add(W3G.cyl(12),w3M4(cx,.03,cz,0,.22,.05,.22),'#8a5a34');
      add(W3G.cyl(12),w3M4(cx-.14,.57,cz-.06,0,.13,.015,.13),'#e8dcc4');add(W3G.cyl(8),w3M4(cx+.16,.61,cz+.05,0,.05,.09,.05),'#f4f1ea');
      if(P.blobs)P.blobs.push([cx,cz,.55]);return true}
    case 'plant':{add(W3G.tcone(.75,10),w3M4(cx,.15,cz,0,.17,.3,.17),'#c4683f');add(W3G.sph(1),w3M4(cx,.5,cz,0,.25,.23,.25),'#4caf50');
      add(W3G.sph(1),w3M4(cx-.16,.62,cz,0,.13),'#5bbf4e');add(W3G.sph(1),w3M4(cx+.15,.64,cz+.04,0,.12),'#5bbf4e');
      return true}
    case 'statue':{const e=t.slice(7),oc=HALL_C[e]||'#e0b84a';add(W3G.box(),w3M4(cx,.14,cz,0,.72,.28,.72),'#6b7180');add(W3G.box(),w3M4(cx,.55,cz,0,.42,.56,.42),'#8e95a3');
      add(W3G.sph(1),w3M4(cx,1.04,cz,0,.21),oc);return true}
    case 'pillar':case 'spillar':{const s2=base==='spillar',pc=s2?'#c8bce0':'#8e95a3',cc=s2?'#e8e0ff':'#a7adbb';
      add(W3G.box(),w3M4(cx,.08,cz,0,.62,.16,.62),cc);add(W3G.cyl(12),w3M4(cx,.95,cz,0,.25,1.6,.25),pc);add(W3G.box(),w3M4(cx,1.8,cz,0,.6,.14,.6),cc);
      if(s2)add(W3G.sph(1),w3M4(cx,1.95,cz,0,.13),'#ffd84a');return true}
    case 'saltar':{add(W3G.cyl(20),w3M4(cx,.17,cz,0,.48,.34,.48),'#6a5a90');add(W3G.cyl(20),w3M4(cx,.36,cz,0,.4,.06,.4),'#c8bce0');add(W3G.cyl(20),w3M4(cx,.4,cz,0,.28,.03,.28),'#ffd84a');return true}
    case 'cd':{const p2=t.slice(3),pc=CAVE_PAL[p2];
      if(p2==='magma'){[[-.2,.1,.8],[.15,-.1,1.1],[.3,.2,.5]].forEach(([dx,dz,h])=>{add(W3G.cone(7),w3M4(cx+dx,h/2,cz+dz,r()*6,.17,h,.17),pc.w2);add(W3G.cone(7),w3M4(cx+dx,h*.82,cz+dz,0,.06,h*.3,.06),'#ff8a3a')})}
      else [[-.22,.05,.6,.12],[.05,-.08,.95,.16],[.25,.12,.45,.1]].forEach(([dx,dz,h,w],i)=>{const tx=j()*.3,tz=j()*.3;add(W3G.cyl(6),w3M4(cx+dx,h*.42,cz+dz,i,w,h*.84,w,tx,tz),i%2?pc.deco:lt(pc.deco));add(W3G.cone(6),w3M4(cx+dx-tz*h*.4,h*.84+.08,cz+dz+tx*h*.4,i,w,.18,w,tx,tz),lt(pc.deco))});
      return true}
  }
  return false}
function w3rubble(t,x,y,P){const p2=t.slice(3),pc=CAVE_PAL[p2],r=mulberry(((x*7919)^(y*104729))>>>0);
  for(let i=0;i<4;i++){const s=.1+r()*.1;P.push([W3G.dode(),w3M4(x+.2+r()*.6,s*.7,y+.2+r()*.6,r()*6,s,s*.75,s),i%3?pc.rub:lt(pc.rub)])}
  if(p2!=='ice')P.push([W3G.sph(0),w3M4(x+.3+r()*.4,.1,y+.3+r()*.4,0,.04),pc.ru2])}

/* ---------- solid blocks: walls, cliffs, counters. One textured mesh per kind of block in a chunk ---------- */
const _w3xm=new Map();
function w3texMat(tex,fade=true,o={}){const k=tex.uuid+fade+JSON.stringify(o);if(_w3xm.has(k))return _w3xm.get(k);const m=new THREE.MeshLambertMaterial(Object.assign({map:tex},o));if(fade)w3fadeable(m);_w3xm.set(k,m);return m}
function w3blocks(m,list){/* list: [t,x,y,h] of one block kind. Three groups: sides, front faces, tops */
  const spec=w3block(list[0][0]),hAt=new Map(list.map(([t,x,y,h])=>[x+','+y,h]));
  const A=[[],[],[]],N=[[],[],[]],U=[[],[],[]];
  const quad=(g,p,n,uv)=>{const[a,b,c,d]=p;A[g].push(...a,...b,...c,...a,...c,...d);for(let i=0;i<6;i++)N[g].push(...n);const[ua,ub,uc,ud]=uv;U[g].push(...ua,...ub,...uc,...ua,...uc,...ud)};
  /* a face is hidden when the neighbour is a block at least as tall */
  const nbH=(x,y)=>{const k=hAt.get(x+','+y);if(k!=null)return k;const t=w3t(m,x,y);if(!t||w3kind(t)!=='block')return -1;return w3blockH(m,t,x,y)};
  for(const[t,x,y,h]of list){const x0=x,x1=x+1,z0=y,z1=y+1;
    quad(2,[[x0,h,z1],[x1,h,z1],[x1,h,z0],[x0,h,z0]],[0,1,0],[[0,0],[1,0],[1,1],[0,1]]);
    if(nbH(x,y+1)<h-.01)quad(spec.front?1:0,[[x0,0,z1],[x1,0,z1],[x1,h,z1],[x0,h,z1]],[0,0,1],[[0,0],[1,0],[1,h],[0,h]]);
    if(nbH(x,y-1)<h-.01)quad(0,[[x1,0,z0],[x0,0,z0],[x0,h,z0],[x1,h,z0]],[0,0,-1],[[0,0],[1,0],[1,h],[0,h]]);
    if(nbH(x+1,y)<h-.01)quad(0,[[x1,0,z1],[x1,0,z0],[x1,h,z0],[x1,h,z1]],[1,0,0],[[0,0],[1,0],[1,h],[0,h]]);
    if(nbH(x-1,y)<h-.01)quad(0,[[x0,0,z0],[x0,0,z1],[x0,h,z1],[x0,h,z0]],[-1,0,0],[[0,0],[1,0],[1,h],[0,h]])}
  const g=new THREE.BufferGeometry();let o=0;
  g.setAttribute('position',new THREE.Float32BufferAttribute([...A[0],...A[1],...A[2]],3));g.setAttribute('normal',new THREE.Float32BufferAttribute([...N[0],...N[1],...N[2]],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([...U[0],...U[1],...U[2]],2));
  for(let k=0;k<3;k++){const n=A[k].length/3;if(n)g.addGroup(o,n,k);o+=n}g.computeBoundingSphere();
  const t0=list[0][0],side=w3tileTex(spec.side||t0),front=spec.front?w3tileTex(spec.front):side,top=w3tileTex(spec.top||spec.side||t0);
  const mesh=new THREE.Mesh(g,[w3texMat(side,false),w3texMat(front,false,spec.gate?{emissive:new THREE.Color(TL[t0].c),emissiveIntensity:.35}:{}),w3texMat(top,false)]);
  mesh.castShadow=true;mesh.receiveShadow=true;return mesh}
/* how tall a block stands here: rough cave walls vary, and an interior's front wall is cut away so you can see in */
function w3blockH(m,t,x,y){const sp=w3block(t);let h=sp.h;
  if(sp.rough)h*=.82+.36*(((x*928371+y*12347)>>>0)%97)/97;
  if(m.interior&&y>=m.h-1)h=.22;
  return h}

/* ---------- tall grass: swaying tufts that part around you ---------- */
function w3grassGeo(t){return w3geo('gr'+t,()=>{const base=TL[t].c,P=[];
  for(let i=0;i<12;i++){const a=i/12*6.283+(i%3)*.4,h=.3+((i*37)%7)*.035,rr=i>=10?.02:.06+((i*13)%3)*.03;P.push([W3G.blade(),w3M4(Math.cos(a)*rr,h/2,Math.sin(a)*rr,a,.06,h,.06,Math.sin(a)*.3,-Math.cos(a)*.3),base])}
  const g=w3merge(P),pos=g.attributes.position,col=g.attributes.color,lo=new THREE.Color(mix(dk(base),base,.35)),hi=new THREE.Color(mix(base,'#fffbe0',.32)),c=new THREE.Color();
  for(let i=0;i<pos.count;i++){c.copy(lo).lerp(hi,clamp(pos.getY(i)/.5,0,1));col.setXYZ(i,c.r,c.g,c.b)}return g})}
function w3grassMat(){const k='grassmat';if(_w3m.has(k))return _w3m.get(k);const m=new THREE.MeshLambertMaterial({vertexColors:true});
  m.onBeforeCompile=sh=>{sh.uniforms.uPly=W3.U.uPly;sh.uniforms.uTime=W3.U.uTime;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform vec3 uPly;uniform float uTime;').replace('#include <project_vertex>',`vec4 wp=vec4(transformed,1.);
      #ifdef USE_INSTANCING
      wp=instanceMatrix*wp;
      #endif
      wp=modelMatrix*wp;float hh=clamp(position.y/.45,0.,1.);
      wp.x+=sin(uTime*1.7+wp.x*.8+wp.z*1.3)*.035*hh;wp.z+=cos(uTime*1.3+wp.x*1.1)*.02*hh;
      vec2 dd=wp.xz-uPly.xz;float rr=length(dd);if(rr<.85&&rr>.001)wp.xz+=dd/rr*(.85-rr)*.55*hh;
      vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;`)};
  m.customProgramCacheKey=()=>'w3grass';_w3m.set(k,m);return m}
function w3grass(t,cells){const g=w3grassGeo(t),im=new THREE.InstancedMesh(g,w3grassMat(),cells.length*4),mx=new THREE.Matrix4();let n=0;
  for(const[x,y]of cells){const r=mulberry(((x*48271)^(y*16807))>>>0);for(let i=0;i<4;i++){const s=.85+r()*.35;
    mx.compose(new THREE.Vector3(x+.25+(i%2)*.5+(r()-.5)*.16,0,y+.25+(i>>1)*.5+(r()-.5)*.16),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),r()*6.28),new THREE.Vector3(s,s*(.9+r()*.3),s));im.setMatrixAt(n++,mx)}}
  im.receiveShadow=true;im.castShadow=false;im.frustumCulled=false;im.renderOrder=6;return im}

/* ---------- houses: each block of roof and front-wall tiles becomes one building ---------- */
function w3buildings(m){if(m._w3b)return m._w3b;const seen=new Uint8Array(m.w*m.h),out=[];
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const t=mT(m,x,y);if(!t||seen[y*m.w+x]||!W3BLD.test(t))continue;
    const st=[[x,y]];seen[y*m.w+x]=1;let x0=x,x1=x,y0=y,y1=y;const cells=[];
    while(st.length){const[a,b]=st.pop();cells.push([a,b]);x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b);
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const c=a+dx,d=b+dy;if(c<0||d<0||c>=m.w||d>=m.h)continue;const i=d*m.w+c;if(seen[i])continue;const tt=mT(m,c,d);if(tt&&W3BLD.test(tt)){seen[i]=1;st.push([c,d])}}}
    out.push({x0,x1,y0,y1,cells})}
  return m._w3b=out}
function w3wallCol(t){if(!t)return'#efe2c8';if(t.startsWith('lwall_')||t.startsWith('lgate_'))return'#8a8578';if(t==='hfront'||t==='hdoor')return'#9aa0ae';return'#efe2c8'}
function w3house(m,b,own){
  const W=b.x1-b.x0+1,D=b.y1-b.y0+1,face=[];for(let x=b.x0;x<=b.x1;x++)face.push(mT(m,x,b.y1));
  const roofT=b.cells.map(([x,y])=>mT(m,x,y)).find(t=>/roof/.test(t))||'roofT',ft=face.find(t=>t&&!/roof/.test(t)),wc=w3wallCol(ft);
  const WH=D>3?2.1:1.7,RISE=.75+D*.12,OV=.18,zb=b.y0+.2,zf=b.y1+1,g=new THREE.Group();
  /* the front wall: the facade tiles stretched up to the wall's height */
  const cv=document.createElement('canvas'),fh=Math.round(WH*16);cv.width=W*16;cv.height=fh;const x2=cv.getContext('2d');x2.imageSmoothingEnabled=false;
  x2.fillStyle=wc;x2.fillRect(0,0,cv.width,fh);
  face.forEach((t,i)=>{if(t&&!/roof/.test(t))x2.drawImage(TIMG[t][0][0],0,0,16,16,i*16,fh-Math.round(16*1.55),16,Math.round(16*1.55))});
  x2.fillStyle='rgba(0,0,0,.12)';x2.fillRect(0,0,cv.width,2);
  const ftex=w3tex(cv),fm=new THREE.MeshLambertMaterial({map:ftex}),wm=w3lam(wc);
  own.push(ftex,fm);
  const bg=new THREE.BoxGeometry(W,WH,zf-zb);own.push(bg);
  const walls=new THREE.Mesh(bg,[wm,wm,wm,wm,fm,wm]);walls.position.set(b.x0+W/2,WH/2,(zb+zf)/2);walls.castShadow=walls.receiveShadow=true;g.add(walls);
  /* the roof: a gable over the whole house, painted with the roof tile */
  const x0=b.x0-OV,x1=b.x1+1+OV,f=zf+OV,k=zb-OV,zm=(f+k)/2,ye=WH-.04,yr=WH+RISE,sl=Math.hypot(RISE,(f-k)/2);
  const P2=[],U2=[];const q=(a,b2,c,d,ua,ub,uc,ud)=>{P2.push(...a,...b2,...c,...a,...c,...d);U2.push(...ua,...ub,...uc,...ua,...uc,...ud)};
  q([x0,ye,f],[x1,ye,f],[x1,yr,zm],[x0,yr,zm],[0,0],[x1-x0,0],[x1-x0,sl],[0,sl]);
  q([x1,ye,k],[x0,ye,k],[x0,yr,zm],[x1,yr,zm],[0,0],[x1-x0,0],[x1-x0,sl],[0,sl]);
  const nRoof=P2.length/3;
  P2.push(x0,ye,k,x0,ye,f,x0,yr,zm,x1,ye,f,x1,ye,k,x1,yr,zm);U2.push(0,0,1,0,.5,1,0,0,1,0,.5,1);
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(P2,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(U2,2));rg.computeVertexNormals();
  rg.addGroup(0,nRoof,0);rg.addGroup(nRoof,6,1);own.push(rg);
  const rtex=w3tileTex(roofT,0),rm=w3texMat(rtex,false);
  const roof=new THREE.Mesh(rg,[rm,wm]);roof.castShadow=roof.receiveShadow=true;g.add(roof);
  /* a chimney on red roofs, and a step in front of each door */
  if(roofT==='roofR'){const ch=new THREE.Mesh(W3G.box(),w3lam('#a8564a'));ch.castShadow=true;ch.scale.set(.32,.7,.32);ch.position.set(b.x0+W*.72,yr-.05,zm+.25);g.add(ch)}
  face.forEach((t,i)=>{if(t==='door'||t==='hdoor'||(t&&t.startsWith('lgate_'))){const st=new THREE.Mesh(W3G.box(),w3lam('#b4ab98'));st.receiveShadow=true;st.scale.set(.8,.08,.3);st.position.set(b.x0+i+.5,.04,zf+.15);st.castShadow=false;g.add(st)}});
  return g}

/* ---------- chunks: the world is built in strips of rows around you, and dropped again behind you ---------- */
function w3chunk(m,ci){
  const CH=W3K.CH,pad=w3pad(m),y0=ci*CH,ya=pad?y0:Math.max(0,y0),yb=pad?y0+CH:Math.min(m.h,y0+CH),xs=-pad,xe=m.w+pad;if(yb<=ya)return null;
  const grp=new THREE.Group(),Wd=xe-xs,Hh=yb-ya,own=[];
  const GS=W3K.gs,cv=document.createElement('canvas');cv.width=Wd*16*GS;cv.height=Hh*16*GS;const g2=cv.getContext('2d');g2.imageSmoothingEnabled=true;g2.imageSmoothingQuality='high';
  const anim=[],tiles=[],pieces=[],far=[],blocks=new Map(),grass=new Map(),cut=[],water=[];pieces.blobs=[];far.blobs=null;
  for(let y=ya;y<yb;y++)for(let x=xs;x<xe;x++){const t=w3t(m,x,y);tiles.push(t);if(!t)continue;const k=w3kind(t);const gt=k==='bld'?w3under(m,x,y):t;
    g2.drawImage(w3gimg(gt,vari(x,y),0),(x-xs)*16*GS,(y-ya)*16*GS,16*GS,16*GS);if(TL[gt].anim&&k!=='block')anim.push([x,y,gt]);
    const out=x<0||x>=m.w||y<0||y>=m.h;
    if(k==='obj'){if(!w3obj(t,x,y,out?far:pieces))cut.push([t,x,y])}
    else if(k==='block'){if(!blocks.has(t))blocks.set(t,[]);blocks.get(t).push([t,x,y,w3blockH(m,t,x,y)])}
    else if(k==='grass'){if(!grass.has(t))grass.set(t,[]);grass.get(t).push([x,y])}
    else if(k==='rubble')w3rubble(t,x,y,pieces);
    else if(k==='water')water.push([x,y,t])}
  if(!m.interior)w3mottle(g2,cv,ci,m.cave);
  const tex=w3tex(cv,{smooth:true}),gmat=new THREE.MeshLambertMaterial({map:tex}),pg=new THREE.PlaneGeometry(Wd,Hh);own.push(tex,gmat,pg);
  const gm=new THREE.Mesh(pg,gmat);gm.rotation.x=-Math.PI/2;gm.position.set(xs+Wd/2,0,ya+Hh/2);gm.receiveShadow=true;grp.add(gm);
  const st=w3mergedMesh(pieces,{ol:0});if(st){w3groundAO(st.geometry);own.push(st.geometry);grp.add(st)}
  if(pieces.blobs.length){const bl=w3blobs(pieces.blobs);own.push(bl);grp.add(bl)}
  const fs=w3mergedMesh(far,{ol:0,fade:false,shadow:false});if(fs){own.push(fs.geometry);grp.add(fs)}
  for(const list of blocks.values()){const bm=w3blocks(m,list);own.push(bm.geometry);grp.add(bm)}
  for(const[t,cells]of grass){const gi=w3grass(t,cells);own.push(gi);grp.add(gi)}
  if(water.length)grp.add(w3water(water,own));
  for(const[t,x,y]of cut){const im=TIMG_O[t][vari(x,y)%TIMG_O[t].length][0],tx2=w3tex(im,{mip:false}),mt=new THREE.MeshToonMaterial({map:tx2,gradientMap:w3grad(),alphaTest:.5,side:THREE.DoubleSide}),pl=new THREE.PlaneGeometry(1,1);pl.translate(0,.5,0);
    const cm=new THREE.Mesh(pl,mt);cm.position.set(x+.5,0,y+.62);cm.rotation.x=-W3K.pitch*.55;cm.castShadow=true;grp.add(cm);own.push(tx2,mt,pl)}
  for(const b of W3.bld)if(b.y0>=ya&&b.y0<yb&&b.y0>=0){const h=w3house(m,b,own);grp.add(h)}
  W3.world.add(grp);
  return{ci,grp,cv,tex,anim,tiles,ya,yb,xs,xe,own,fr:0}}
let _w3wt=null;
function w3waterTex(){if(_w3wt)return _w3wt;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='rgba(255,255,255,0)';g.fillRect(0,0,64,64);
  g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=2;g.lineCap='round';const r=mulberry(77);for(let i=0;i<9;i++){const x=r()*64,y=r()*64,l=5+r()*8;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+l/2,y-2,x+l,y);g.stroke()}
  _w3wt=new THREE.CanvasTexture(c);_w3wt.wrapS=_w3wt.wrapT=THREE.RepeatWrapping;_w3wt.colorSpace=THREE.SRGBColorSpace;return _w3wt}
function w3water(cells,own){const P2=[],U2=[];for(const[x,y,t]of cells){const h=t.startsWith('lava')?.03:.025;P2.push(x,h,y+1,x+1,h,y+1,x+1,h,y,x,h,y+1,x+1,h,y,x,h,y);U2.push(x/2,(y+1)/2,(x+1)/2,(y+1)/2,(x+1)/2,y/2,x/2,(y+1)/2,(x+1)/2,y/2,x/2,y/2)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P2,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U2,2));own.push(g);
  const m=new THREE.Mesh(g,w3geo('waterm',()=>new THREE.MeshBasicMaterial({map:w3waterTex(),transparent:true,opacity:.55,depthWrite:false})));m.renderOrder=1;return m}
/* soft light and shade across the ground, so it reads as one field rather than a grid of tiles */
function w3mottle(g2,cv,ci,cave){const r=mulberry((ci*2654435761)>>>0),n=Math.round(cv.width*cv.height/(32*32*W3K.gs*W3K.gs)/2.2);
  for(let i=0;i<n;i++){const x=r()*cv.width,y=r()*cv.height,rad=(18+r()*40)*W3K.gs,dark=r()<.6,gr=g2.createRadialGradient(x,y,0,x,y,rad);
    gr.addColorStop(0,dark?`rgba(10,16,8,${cave?.12:.09})`:'rgba(255,250,220,.06)');gr.addColorStop(1,'rgba(0,0,0,0)');g2.fillStyle=gr;g2.fillRect(x-rad,y-rad,rad*2,rad*2)}}
/* scenery gets darker toward the ground, like light blocked near the roots */
function w3groundAO(g){const p=g.attributes.position,c=g.attributes.color;for(let i=0;i<p.count;i++){const k=.62+.38*clamp(p.getY(i)/1.3,0,1);c.setXYZ(i,c.getX(i)*k,c.getY(i)*k,c.getZ(i)*k)}c.needsUpdate=true}
let _w3blob=null;
function w3blobTex(){if(_w3blob)return _w3blob;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(.55,'rgba(0,0,0,.25)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);_w3blob=new THREE.CanvasTexture(c);return _w3blob}
function w3blobs(list){const g=w3geo('blobpl',()=>new THREE.PlaneGeometry(2,2).rotateX(-Math.PI/2)),m=w3geo('blobmat',()=>new THREE.MeshBasicMaterial({map:w3blobTex(),transparent:true,depthWrite:false,color:'#000000',opacity:.6}));
  const im=new THREE.InstancedMesh(g,m,list.length),mx=new THREE.Matrix4();list.forEach(([x,z,r],i)=>{mx.compose(new THREE.Vector3(x,.012,z),new THREE.Quaternion(),new THREE.Vector3(r,1,r));im.setMatrixAt(i,mx)});im.renderOrder=1;im.frustumCulled=false;return im}
function w3dropChunk(c){W3.world.remove(c.grp);for(const o of c.own){if(o.isInstancedMesh){o.dispose();continue}if(o.dispose)o.dispose()}}
function w3tilesOf(m,c){const out=[];for(let y=c.ya;y<c.yb;y++)for(let x=c.xs;x<c.xe;x++)out.push(w3t(m,x,y));return out}
function w3chunksFor(m,pz,now){
  const CH=W3K.CH,pad=w3pad(m),cmin=Math.floor(-pad/CH),cmax=Math.floor((m.h-1+pad)/CH);
  const lo=Math.max(cmin,Math.floor((pz-W3K.ahead)/CH)),hi=Math.min(cmax,Math.floor((pz+W3K.behind)/CH));
  for(const[ci,c]of W3.chunks)if(ci<lo-1||ci>hi+1){w3dropChunk(c);W3.chunks.delete(ci)}
  let built=0;
  for(let ci=lo;ci<=hi;ci++)if(!W3.chunks.has(ci)&&built<2){const c=w3chunk(m,ci);if(c)W3.chunks.set(ci,c);built++}
  /* tiles that change while you play (a hall gate opening) rebuild their strip; animated tiles flip frames */
  const fr=Math.floor(now/550)%2,check=now-(W3.lastCheck||0)>300;if(check)W3.lastCheck=now;
  for(const[ci,c]of W3.chunks){
    if(check){const t2=w3tilesOf(m,c);if(t2.some((t,i)=>t!==c.tiles[i])){w3dropChunk(c);const n=w3chunk(m,ci);if(n)W3.chunks.set(ci,n);else W3.chunks.delete(ci);continue}}
    if(c.fr!==fr&&c.anim.length){c.fr=fr;const g2=c.cv.getContext('2d'),GS=W3K.gs;for(const[x,y,t]of c.anim)g2.drawImage(w3gimg(t,vari(x,y),fr),(x-c.xs)*16*GS,(y-c.ya)*16*GS,16*GS,16*GS);c.tex.needsUpdate=true}}}
function w3free(o){W3.actors.remove(o.root);const own=o.root.userData.own;if(own)for(const x of own)x.dispose()}
function w3clear(){for(const c of W3.chunks.values())w3dropChunk(c);W3.chunks.clear();for(const o of W3.ents.values())w3free(o);W3.ents.clear()}

/* ---------- chibi people: big heads, short bodies, toon-shaded, built from a palette ---------- */
let _w3face=null;
function w3faceTex(){if(_w3face)return _w3face;const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');
  for(const s of[-1,1]){const ex=128+s*44,ey=66;
    g.fillStyle='#2a1a2e';g.beginPath();g.ellipse(ex,ey,15,22,0,0,6.283);g.fill();
    g.fillStyle='#5a3a4e';g.beginPath();g.ellipse(ex,ey+8,10,12,0,0,6.283);g.fill();
    g.fillStyle='#ffffff';g.beginPath();g.ellipse(ex-s*5,ey-8,6,7,0,0,6.283);g.fill();g.beginPath();g.ellipse(ex+s*5,ey+9,3,3,0,0,6.283);g.fill();
    g.strokeStyle='#3a2a2a';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(ex-13,ey-33+s*2);g.lineTo(ex+13,ey-33-s*2);g.stroke();
    g.fillStyle='rgba(255,120,130,.38)';g.beginPath();g.ellipse(128+s*70,96,15,8,0,0,6.283);g.fill()}
  g.strokeStyle='#7a3030';g.lineWidth=4;g.beginPath();g.arc(128,92,9,.35,2.8);g.stroke();
  _w3face=w3tex(c,{mip:true});return _w3face}
const W3STYLE={prof:'short',healer:'long',clerk:'cap',guard:'cap',pia:'long',moss:'cap',teo:'short',vil1:'short',vil2:'long'};
function w3style(key,p){if(p.style)return p.style;if(W3STYLE[key])return W3STYLE[key];return['short','long','cap','hood','short'][hashStr(key)%5]}
const W3HR=.235;
function w3kidProto(key,p){
  const st=w3style(key,p),hair=p.hair||p.hood,skin=p.skin||'#f2c9a0',coat=p.coat,pants=p.pants||'#3b4a78',boots=p.boots||'#2a2340',OL=.013;
  const G=role=>{const g=new THREE.Group();if(role)g.userData.role=role;return g};
  const root=G('root'),hip=G('hip'),body=G('body'),head=G('head'),legs=[G('legL'),G('legR')],arms=[G('armL'),G('armR')];
  root.add(hip);hip.position.y=.25;
  /* legs and boots */
  legs.forEach((l,i)=>{const s=i?1:-1;l.position.set(s*.068,0,0);hip.add(l);
    l.add(w3at(w3part(new THREE.CapsuleGeometry(.054,.1,4,10),pants,{ol:OL}),0,-.1,0));
    l.add(w3at(w3part(W3G.ball(),boots,{ol:OL}),0,-.215,.02,0,0,0,[.068,.052,.094]))});
  /* the jacket, a little flared at the hem */
  hip.add(body);
  body.add(w3part(new THREE.LatheGeometry([[0,-.03],[.132,-.03],[.142,.03],[.13,.16],[.1,.23],[.05,.265],[0,.27]].map(([a,b])=>new THREE.Vector2(a,b)),22),coat,{ol:OL}));
  body.add(w3at(w3part(new THREE.CylinderGeometry(.128,.13,.05,20),pants,{ol:0}),0,-.035,0));
  body.add(w3at(new THREE.Mesh(W3G.box(),w3toon(dk(coat))),0,.12,.136,0,0,0,[.02,.2,.01]));
  body.add(w3at(w3part(new THREE.TorusGeometry(.085,.022,8,18),dk(coat),{ol:0}),0,.245,0,Math.PI/2,0,0));
  if(p.bag){const bg=w3at(w3part(new THREE.BoxGeometry(.2,.22,.1),p.bag,{ol:OL}),0,.13,-.16);body.add(bg);bg.add(w3at(w3part(new THREE.BoxGeometry(.205,.07,.11),lt(p.bag),{ol:0}),0,.09,0));
    for(const s of[-1,1])body.add(w3at(new THREE.Mesh(W3G.box(),w3toon(dk(p.bag))),s*.075,.16,.09,-.25,0,0,[.03,.2,.012]))}
  /* arms hang from the shoulders, hands at the ends */
  arms.forEach((a,i)=>{const s=i?1:-1;a.position.set(s*.155,.21,0);body.add(a);a.rotation.z=s*.1;
    a.add(w3at(w3part(new THREE.CapsuleGeometry(.045,.1,4,10),coat,{ol:OL}),0,-.08,0));
    a.add(w3at(w3part(W3G.ball(),skin,{ol:OL*.8}),0,-.175,.005,0,0,0,.048))});
  /* the head: big and round, with the face painted on */
  head.position.y=.49;body.add(head);
  head.add(w3at(w3part(new THREE.SphereGeometry(W3HR,26,18),skin,{ol:OL}),0,0,0,0,0,0,[1,.95,.97]));
  for(const s of[-1,1])head.add(w3at(w3part(W3G.ball(),skin,{ol:OL*.7}),s*W3HR*.97,-.02,0,0,0,0,[.04,.055,.045]));
  const face=new THREE.Mesh(new THREE.SphereGeometry(W3HR*1.006,24,12,Math.PI/2-.95,1.9,Math.PI*.34,Math.PI*.36),new THREE.MeshToonMaterial({map:w3faceTex(),gradientMap:w3grad(),alphaTest:.5,polygonOffset:true,polygonOffsetFactor:-2}));
  face.userData.noBake=1;face.scale.set(1,.95,.97);head.add(face);
  w3hair(head,st,hair,p.hood,OL);
  w3bake(root,new Set([root,hip,body,head,...legs,...arms]));
  root.traverse(o=>{if(o.isMesh&&!o.userData.outline)o.castShadow=true});
  return root}
function w3at(o,x,y,z,rx=0,ry=0,rz=0,s=null){o.position.set(x,y,z);o.rotation.set(rx,ry,rz);if(s!=null)Array.isArray(s)?o.scale.set(...s):o.scale.setScalar(s);return o}
/* a smooth hair shell over the head: from the crown down to a hairline that can dip into bangs at the front,
   sideburns at the sides and the nape at the back. d is the angle away from the front of the face (0 front, PI back) */
function w3shell(R,edge,{nf=56,nt=16,puff=.05}={}){const P2=[],idx=[];
  for(let i=0;i<=nt;i++)for(let j=0;j<=nf;j++){const ph=Math.PI/2+Math.PI+j/nf*Math.PI*2,d=Math.abs(Math.atan2(Math.sin(ph-Math.PI/2),Math.cos(ph-Math.PI/2))),th=edge(d)*i/nt,r=R*(1+puff*Math.cos(th));
    P2.push(-r*Math.cos(ph)*Math.sin(th),r*Math.cos(th),r*Math.sin(ph)*Math.sin(th))}
  for(let i=0;i<nt;i++)for(let j=0;j<nf;j++){const a=i*(nf+1)+j,b=a+nf+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P2,3));g.setIndex(idx);g.computeVertexNormals();return g}
const w3ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
/* the hairline: forehead with scalloped bangs, a sideburn by each ear, and the nape */
function w3hairline({front=.37,bang=.09,side=.5,burn=.08,back=.72,bangW=1.05,lobes=5}){const PI=Math.PI;
  return d=>{const a=d/PI;let t=front+(back-front)*w3ss(.18,.92,a)+(side-front-(back-front)*w3ss(.18,.92,.5))*Math.exp(-(((a-.5)/.16)**2));
    if(d<bangW){const k=1-d/bangW;t+=bang*Math.pow(Math.abs(Math.cos(d/bangW*PI*lobes/2)),1.4)*(.45+.55*k)}
    t+=burn*Math.exp(-(((a-.4)/.045)**2));return t*PI}}
function w3hair(head,st,hair,hood,OL){const R=W3HR,PI=Math.PI;
  const shell=(edge,col,r=R*1.075,o={})=>head.add(w3part(w3shell(r,edge,o),col,{ol:OL}));
  if(st==='hood'){
    /* the hood: a big soft shell with an oval face opening, a rim around it, and a little fringe peeking out */
    const RH=R*1.2,nt=18,nf=40,top=.3*PI,bot=.88*PI,P2=[],idx=[],rimL=[],rimR=[];
    for(let i=0;i<=nt;i++){const th=top+(bot-top)*i/nt,u=(th-top)/(bot-top),w=1.02*Math.pow(Math.sin(Math.min(1,u*1.25)*PI/2),.6)*(u>.82?1-(u-.82)*1.6:1);
      for(let j=0;j<=nf;j++){const ph=PI/2+w+(PI*2-2*w)*j/nf,r=RH*(1-.06*u*u);P2.push(-r*Math.cos(ph)*Math.sin(th),r*Math.cos(th)-u*.03,r*Math.sin(ph)*Math.sin(th))}
      const pl=P2.slice((i*(nf+1))*3,(i*(nf+1))*3+3),pr=P2.slice((i*(nf+1)+nf)*3,(i*(nf+1)+nf)*3+3);rimL.push(new THREE.Vector3(...pl));rimR.push(new THREE.Vector3(...pr))}
    for(let i=0;i<nt;i++)for(let j=0;j<nf;j++){const a=i*(nf+1)+j,b=a+nf+1;idx.push(a,b,a+1,b,b+1,a+1)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P2,3));g.setIndex(idx);g.computeVertexNormals();
    head.add(w3part(g,hood,{ol:OL}));
    head.add(w3part(new THREE.SphereGeometry(RH,40,10,0,PI*2,0,top),hood,{ol:OL}));
    const rim=new THREE.CatmullRomCurve3([...rimL.slice().reverse(),...rimR]);head.add(w3part(new THREE.TubeGeometry(rim,40,.026,8,false),dk(hood),{ol:0}));
    shell(w3hairline({front:.34,bang:.08,side:.46,burn:0,back:.5,bangW:.8,lobes:4}),hair,R*1.06);
    for(const sx of[-1,1])head.add(w3at(w3part(new THREE.CapsuleGeometry(.012,.08,3,6),'#f4f1ea',{ol:0}),sx*.07,-R*1.02,R*.7,.25,0,0));
    return}
  if(st==='cap'){
    shell(w3hairline({front:.42,bang:.06,side:.53,burn:.06,back:.72,lobes:4}),hair,R*1.05,{puff:0});
    /* the cap: a crown tilted back a little, a band, a curved brim out front and a button on top */
    const cap=new THREE.Group();cap.rotation.x=-.12;head.add(cap);
    cap.add(w3part(new THREE.SphereGeometry(R*1.14,36,14,0,PI*2,0,PI*.5),hood,{ol:OL}));
    const sh=new THREE.Shape(),N=24,Rb=R*1.1;for(let k=0;k<=N;k++){const u=PI*k/N,x=-Math.cos(u)*Rb,y=Math.sin(u)*(Rb*.62+.17);k?sh.lineTo(x,y):sh.moveTo(x,y)}
    for(let k=N;k>=0;k--){const u=PI*k/N;sh.lineTo(-Math.cos(u)*Rb*.98,Math.sin(u)*Rb*.6)}
    const bg=new THREE.ExtrudeGeometry(sh,{depth:.026,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:1,curveSegments:2});bg.rotateX(PI/2);
    cap.add(w3at(w3part(bg,dk(hood),{ol:OL*.8}),0,R*.38,0,.18,0,0));
    cap.add(w3at(w3part(W3G.ball(),dk(hood),{ol:0}),0,R*1.14,0,0,0,0,.03));
    return}
  if(st==='long'){
    shell(w3hairline({front:.36,bang:.1,side:.58,burn:.1,back:.8,lobes:5}),hair,R*1.08);
    /* soft hair falling down the back and two locks framing the face */
    head.add(w3at(w3part(W3G.ball(),hair,{ol:OL}),0,-R*.62,-R*.5,.25,0,0,[R*1.02,R*1.22,R*.62]));
    for(const sx of[-1,1])head.add(w3at(w3part(new THREE.CapsuleGeometry(.052,.2,4,10),hair,{ol:OL*.8}),sx*R*.9,-R*.72,R*.18,.1,0,sx*.12));
    return}
  /* short: a full head of hair with bangs, sideburns and a few tufts sweeping back */
  shell(w3hairline({front:.37,bang:.1,side:.5,burn:.09,back:.7,lobes:5}),hair);
  for(const[a,y,z,rx,rz,s]of[[.05,1.02,-.25,-1.1,-.3,1],[-.07,.94,-.45,-1.5,.35,.9],[.1,.82,-.62,-1.9,-.2,.8]])
    head.add(w3at(w3part(W3G.cone(7),hair,{ol:OL*.7}),a*R,y*R,z*R,rx,0,rz,[.05*s,.15*s,.05*s]));
  head.add(w3at(w3part(W3G.cone(6),hair,{ol:OL*.6}),.02,R*1.07,R*.12,.35,0,-.25,[.022,.09,.022]))}
/* merge each moving part's static pieces into one mesh (and one outline), so a crowd stays cheap to draw */
function w3bake(root,moving){root.updateMatrixWorld(true);
  for(const node of moving){const pieces=[],kill=[];const inv=new THREE.Matrix4().copy(node.matrixWorld).invert();
    const walk=o=>{for(const c of o.children){if(moving.has(c))continue;
      if(c.isMesh&&!c.userData.outline&&!c.userData.noBake&&c.material&&c.material.isMeshToonMaterial&&!c.material.map&&!c.material.transparent){pieces.push([c.geometry,new THREE.Matrix4().multiplyMatrices(inv,c.matrixWorld),'#'+c.material.color.getHexString()]);kill.push(c)}
      if(c.children.length)walk(c)}};
    walk(node);if(pieces.length<2)continue;
    const mm=w3mergedMesh(pieces,{ol:.009,fade:false,toon:true});for(const c of kill)c.removeFromParent();node.add(mm)}}
/* a person to place in the world: a copy of the cached figure for that palette, with its moving parts found */
const _w3kid=new Map();
function w3kid(key,p){const k=key+JSON.stringify(p);if(!_w3kid.has(k))_w3kid.set(k,w3kidProto(key,p));const root=_w3kid.get(k).clone(true);
  root.scale.setScalar(W3K.kid);const n={root,t:Math.random()*9,walk:0,run:0,ph:0,yaw:0};root.traverse(o=>{if(o.userData.role)n[o.userData.role]=o});
  const sh=new THREE.Mesh(w3geo('blob',()=>new THREE.CircleGeometry(.24,20).rotateX(-Math.PI/2)),w3geo('blobm',()=>new THREE.MeshBasicMaterial({color:'#0a0820',transparent:true,opacity:.22,depthWrite:false})));sh.position.y=.012;root.add(sh);
  root.traverse(o=>{if(o.isMesh)o.renderOrder=10});
  return n}
/* your silhouette: drawn only where something stands in front of you, as a dotted outline */
function w3silMat(){return w3geo('silm',()=>{const m=new THREE.MeshBasicMaterial({color:'#8fe6ff',depthWrite:false,depthFunc:THREE.GreaterDepth});
  m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('void main() {','void main() {\nif(mod(floor(gl_FragCoord.x)+floor(gl_FragCoord.y),2.)<1.)discard;')};m.customProgramCacheKey=()=>'w3sil';return m})}
function w3silhouette(n){const sil=n.root.clone(true),a=[],b=[];n.root.traverse(o=>a.push(o));sil.traverse(o=>b.push(o));
  for(const o of b){if(!o.isMesh)continue;if(o.userData.outline||o.userData.noBake||o.material.transparent||o.material.isShaderMaterial)o.visible=false;else{o.material=w3silMat();o.castShadow=false;o.renderOrder=5}}
  n.sil={root:sil,a,b};return sil}
function w3silSync(n){const{a,b,root}=n.sil;root.visible=n.root.visible;for(let i=0;i<a.length;i++){b[i].position.copy(a[i].position);b[i].quaternion.copy(a[i].quaternion);b[i].scale.copy(a[i].scale)}}
const W3YAW={down:0,up:Math.PI,right:Math.PI/2,left:-Math.PI/2};
/* walk/run/idle: legs and arms swing in step with the tiles, the body bobs and leans into a run */
function w3animKid(n,dt,moving,running,dir,pose){n.t+=dt;
  n.walk+=((moving?1:0)-n.walk)*Math.min(1,dt*14);n.run+=((moving&&running?1:0)-n.run)*Math.min(1,dt*10);
  n.ph+=dt*(moving?(running?36:21):8);const sw=Math.sin(n.ph)*n.walk,bob=Math.abs(Math.sin(n.ph))*n.walk,br=Math.sin(n.t*2.4)*.006;
  const want=W3YAW[dir]||0;let d=want-n.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));n.yaw+=d*Math.min(1,dt*16);n.root.rotation.y=n.yaw;
  n.hip.position.y=.25+bob*.035+br;n.body.rotation.x=n.walk*.05+n.run*.12;
  n.legL.rotation.x=sw*.8;n.legR.rotation.x=-sw*.8;
  n.armL.rotation.x=-sw*.7;n.armR.rotation.x=sw*.7;n.armL.rotation.z=-.1-br*3;n.armR.rotation.z=.1+br*3;
  if(pose==='wave'){n.armR.rotation.z=2.5+Math.sin(n.t*10)*.3;n.armR.rotation.x=0}
  if(pose==='sleep'){n.head.rotation.x=.5+Math.sin(n.t*1.3)*.07;n.body.rotation.x=.14;n.armL.rotation.x=n.armR.rotation.x=-.5}
  n.head.rotation.x=-n.body.rotation.x*.6+Math.sin(n.ph*2)*.02*n.walk;n.head.rotation.z=Math.sin(n.t*.7)*.03*(1-n.walk)}

/* ---------- the things people and puzzles are made of ---------- */
function w3static(pieces,ol=0){const mm=w3mergedMesh(pieces,{ol,fade:false});const g=new THREE.Group();g.add(mm);g.userData.own=[mm.geometry];return g}
function w3entObj(e){const S2=[],add=(g,mx,hex)=>S2.push([g,mx,hex]);
  switch(e.kind){
    case 'npc':{const n=w3kid(e.pal,PAL[e.pal]||PAL.vil1);n.kid=1;return n}
    case 'sign':add(W3G.box(),w3M4(0,.3,0,0,.08,.6,.08),'#7a5232');add(W3G.box(),w3M4(0,.6,.02,0,.62,.36,.06,-.12),'#c08a54');add(W3G.box(),w3M4(0,.6,.055,0,.5,.24,.01,-.12),'#e8d3a8');return{root:w3static(S2)};
    case 'stone':add(W3G.box(),w3M4(0,.06,0,0,.7,.12,.5),'#6b7180');add(W3G.box(),w3M4(0,.42,0,0,.52,.66,.22),'#8e95a3');add(W3G.box(),w3M4(0,.78,0,0,.42,.08,.18),'#a7adbb');return{root:w3static(S2)};
    case 'plaque':add(W3G.box(),w3M4(0,.25,0,0,.1,.5,.1),'#6b7180');add(W3G.box(),w3M4(0,.52,.02,0,.64,.34,.07,-.35),'#a7adbb');return{root:w3static(S2)};
    case 'boulder':{const g=new THREE.Group(),r=mulberry(hashStr(e.x+','+e.y)),rock=w3part(W3G.dode(),'#8a7f74',{ol:.02});rock.scale.set(.42,.36,.4);rock.position.y=.34;rock.rotation.y=r()*6;g.add(rock);
      const glow=new THREE.Mesh(W3G.dode(),new THREE.MeshBasicMaterial({color:'#ffd65a',wireframe:true,transparent:true,opacity:.9}));glow.scale.set(.43,.37,.41);glow.position.y=.34;glow.rotation.y=rock.rotation.y;g.add(glow);
      return{root:g,upd:(now,dt,e2)=>{glow.visible=!!e2.fixed}}}
    case 'chest':{const g=new THREE.Group(),base=w3part(W3G.box(),'#9a6b3c',{ol:.02});base.scale.set(.66,.36,.46);base.position.y=.18;g.add(base);
      const band=new THREE.Mesh(W3G.box(),w3toon('#6e4428'));band.scale.set(.68,.05,.48);band.position.y=.3;g.add(band);
      const lid=new THREE.Group();lid.position.set(0,.36,-.23);g.add(lid);const lm=w3part(W3G.box(),'#b07a4a',{ol:.02});lm.scale.set(.68,.14,.48);lm.position.set(0,.07,.23);lid.add(lm);
      const lock=new THREE.Mesh(W3G.box(),w3toon('#f1c66b'));lock.scale.set(.1,.12,.03);lock.position.set(0,.03,.47);lid.add(lock);
      return{root:g,upd:(now,dt,e2)=>{const want=S.flags[e2.id]?-1.9:0;lid.rotation.x+=(want-lid.rotation.x)*Math.min(1,dt*8)}}}
    case 'crystal':{const g=new THREE.Group(),mat=new THREE.MeshToonMaterial({color:new THREE.Color(e.c),gradientMap:w3grad(),emissive:new THREE.Color(e.c),emissiveIntensity:0});
      const cr=new THREE.Mesh(W3G.cyl(6),mat);cr.scale.set(.2,.7,.2);cr.position.y=.45;g.add(cr);const tip=new THREE.Mesh(W3G.cone(6),mat);tip.scale.set(.2,.22,.2);tip.position.y=.91;g.add(tip);
      const ped=w3part(W3G.box(),'#5e6372',{ol:.015});ped.scale.set(.5,.12,.5);ped.position.y=.06;g.add(ped);
      for(const o of[cr,tip]){const ol=new THREE.Mesh(o.geometry,w3ink(.03));o.add(ol)}
      return{root:g,upd:now=>{mat.emissiveIntensity=now<(e.glowT||0)?1.4:.08}}}
    case 'legend':{const g=new THREE.Group();let key='';const mat=new THREE.MeshBasicMaterial({transparent:true,alphaTest:.4,side:THREE.DoubleSide});
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),mat);pl.rotation.x=-W3K.pitch*.5;g.add(pl);
      const glow=new THREE.Mesh(new THREE.CircleGeometry(1,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#ffd84a',transparent:true,opacity:.3,depthWrite:false}));glow.position.y=.42;g.add(glow);
      return{root:g,upd:now=>{const id=S.flags.altarSp;pl.visible=glow.visible=!!(id&&SP[id]);if(!pl.visible)return;const k2=id+(S.flags.altarShiny?'*':'');
        if(k2!==key){key=k2;if(mat.map)mat.map.dispose();mat.map=w3tex(sprCanvas(id,true,!!S.flags.altarShiny),{mip:false});mat.needsUpdate=true}
        pl.position.y=1.75+Math.sin(now/420)*.1;glow.material.opacity=.22+.1*Math.sin(now/300)}}}
  }
  return null}
/* hall puzzles: lamps that light up, runes and pressure plates on the floor */
const _w3pz={};function w3pzTex(k){return _w3pz[k]||(_w3pz[k]=w3tex(pzImg(k),{mip:false}))}
function w3puzzles(m){const out=[];if(!m.puzzles)return out;
  for(const pz of m.puzzles){
    if(pz.type==='lamps')pz.lamps.forEach(([x,y],i)=>{const g=new THREE.Group(),S2=[];S2.push([W3G.cyl(10),w3M4(0,.06,0,0,.28,.12,.28),'#3a3e52'],[W3G.cyl(8),w3M4(0,.4,0,0,.05,.6,.05),'#4a4e5c']);g.add(w3static(S2));
      const bm=new THREE.MeshToonMaterial({color:new THREE.Color('#2a2d40'),gradientMap:w3grad(),emissive:new THREE.Color('#ffd65a'),emissiveIntensity:0}),bulb=new THREE.Mesh(W3G.ball(),bm);bulb.scale.setScalar(.15);bulb.position.y=.78;g.add(bulb);bulb.add(new THREE.Mesh(W3G.ball(),w3ink(.12)));
      const halo=new THREE.Mesh(new THREE.CircleGeometry(.62,20).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#ffd65a',transparent:true,opacity:0,depthWrite:false}));halo.position.y=.02;g.add(halo);
      g.position.set(x+.5,0,y+.5);out.push({root:g,upd:now=>{const on=pz.on[i];bm.color.set(on?'#fff3c4':'#2a2d40');bm.emissiveIntensity=on?1.2:0;halo.material.opacity=on?.28+.08*Math.sin(now/280+i):0}})});
    else if(pz.type==='runes')pz.runes.forEach((r,i)=>{const mt=new THREE.MeshToonMaterial({map:w3pzTex(`rune_${r.el}_0`),gradientMap:w3grad(),emissive:new THREE.Color(EL[r.el].c),emissiveIntensity:0});
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(.92,.92).rotateX(-Math.PI/2),mt);pl.position.set(r.x+.5,.015,r.y+.5);pl.receiveShadow=true;let was=null;
      out.push({root:pl,upd:now=>{const on=!!pz.lit[i];if(on!==was){was=on;mt.map=w3pzTex(`rune_${r.el}_${on?1:0}`);mt.needsUpdate=true}mt.emissiveIntensity=on?.45+.15*Math.sin(now/240+i):0}})});
    else if(pz.type==='boulder')pz.ps.forEach(([x,dy])=>{const mt=new THREE.MeshToonMaterial({map:w3pzTex('plate0'),gradientMap:w3grad()}),pl=new THREE.Mesh(new THREE.PlaneGeometry(.9,.9).rotateX(-Math.PI/2),mt);pl.position.set(x+.5,.015,pz.a+dy+.5);let was=null;
      out.push({root:pl,upd:()=>{const cov=pz.ents.some(b=>b.x===x&&b.y===pz.a+dy&&!b.anim);if(cov!==was){was=cov;mt.map=w3pzTex(cov?'plate1':'plate0');mt.needsUpdate=true}}})});
    /* the gate's flash when a puzzle is solved */
    const[gx,gy]=pz.gate,fl=new THREE.Mesh(W3G.box(),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false}));fl.scale.set(1.04,1.3,1.04);fl.position.set(gx+.5,.65,gy+.5);
    out.push({root:fl,upd:now=>{const k=pz.burstT?clamp(1-(now-pz.burstT)/700,0,1):0;fl.material.opacity=Math.max(pz.gateFx?.85:0,k*.8);fl.material.color.set(k>0?lt(HALL_C[pz.el]):'#ffffff')}})}
  return out}

/* ---------- each area's light: bright days on the road, dark caves lit only around you ---------- */
const W3ENV={
  home:{bg:'#cfe9f7',sky:'#fffaf0',gnd:'#6a7a5a',hi:1.5,sun:'#fff0d8',si:2.3},green:{bg:'#bfe6f7',sky:'#ffffff',gnd:'#5a7a4a',hi:1.45,sun:'#fff6e0',si:2.4},
  coral:{bg:'#aee3f5',sky:'#ffffff',gnd:'#6aa0b0',hi:1.55,sun:'#fffaf0',si:2.5},canyon:{bg:'#f6c8a0',sky:'#fff0e0',gnd:'#8a5a3a',hi:1.45,sun:'#ffe0b8',si:2.4},
  dusk:{bg:'#2e2848',sky:'#b8a8f0',gnd:'#3a3050',hi:1.6,sun:'#d0c4ff',si:1.6},sky:{bg:'#dcebff',sky:'#ffffff',gnd:'#8aa0b0',hi:1.6,sun:'#ffffff',si:2.3},
  storm:{bg:'#4e4c74',sky:'#c4bcf0',gnd:'#46405e',hi:1.55,sun:'#e0d8ff',si:1.6},cinder:{bg:'#4e2018',sky:'#ffc4a0',gnd:'#4a2418',hi:1.5,sun:'#ffb878',si:2},
  frost:{bg:'#e6f2fb',sky:'#ffffff',gnd:'#a8c0d8',hi:1.55,sun:'#f4f8ff',si:2},crown:{bg:'#5e4880',sky:'#f0d8ff',gnd:'#54446a',hi:1.5,sun:'#ffe4b8',si:2}};
function w3envFor(m,pz){
  if(m.cave){const c=CAVE_PAL[m.pal];return{bg:'#06070f',sky:mix(c.glow,'#ffffff',.3),gnd:c.wall,hi:1.05,sun:'#ffffff',si:.25,lamp:9,lc:'#ffe6c0',fog:[16,34]}}
  if(m.sanctum)return{bg:'#0e0a24',sky:'#b8a8ff',gnd:'#2a2450',hi:1.15,sun:'#ffe9b0',si:1.3,lamp:0,fog:[26,60]};
  if(m.hall){const w=wardOf(townById(m.town).ward),c=HALL_C[w.el||'crown'];return{bg:'#0b0e1e',sky:lt(c),gnd:'#2e2a40',hi:1.3,sun:'#fff4e0',si:1.7,lamp:0,fog:[30,70]}}
  if(m.interior)return{bg:'#0a1026',sky:'#fff2dc',gnd:'#8a6a4a',hi:1.55,sun:'#fff0d8',si:1.8,lamp:0,fog:[30,70]};
  const z=m.zones&&m.zones.length?zoneAt(m,Math.round(pz)):null,e=W3ENV[z?z.theme:'green']||W3ENV.green;return Object.assign({lamp:0,lc:'#ffd9a0',fog:[30,62]},e)}
function w3envStep(m,pz,dt,snap){const want=w3envFor(m,pz),E=W3.env;
  if(!E.c||snap){E.c={bg:new THREE.Color(want.bg),sky:new THREE.Color(want.sky),gnd:new THREE.Color(want.gnd),sun:new THREE.Color(want.sun),lc:new THREE.Color(want.lc||'#ffd9a0'),hi:want.hi,si:want.si,lamp:want.lamp,f0:want.fog[0],f1:want.fog[1]}}
  const c=E.c,k=snap?1:Math.min(1,dt*2.2),tc=new THREE.Color();
  for(const key of['bg','sky','gnd','sun','lc'])c[key].lerp(tc.set(want[key]||'#ffd9a0'),k);
  c.hi+=(want.hi-c.hi)*k;c.si+=(want.si-c.si)*k;c.lamp+=(want.lamp-c.lamp)*k;c.f0+=(want.fog[0]-c.f0)*k;c.f1+=(want.fog[1]-c.f1)*k;
  W3.sc.background.copy(c.bg);W3.sc.fog.color.copy(c.bg);W3.sc.fog.near=c.f0;W3.sc.fog.far=c.f1;
  W3.hemi.color.copy(c.sky);W3.hemi.groundColor.copy(c.gnd);W3.hemi.intensity=c.hi;W3.sun.color.copy(c.sun);W3.sun.intensity=c.si;W3.lamp.intensity=c.lamp;W3.lamp.color.copy(c.lc)}

/* ---------- the camera: behind you and above, looking down the road ahead ---------- */
function w3camera(m,px,pz,dt,snap){
  const asp=W3.aspect||1,tanh=Math.tan(W3K.fov*Math.PI/360),dist=clamp(W3K.viewW/(2*tanh*asp),16,25),halfW=dist*tanh*asp;
  let tx=px+.5,tz=pz+.5-.4;const pad=w3pad(m);
  if(m.w<=2*halfW-1.5)tx=m.w/2;else tx=clamp(tx,halfW-.5-pad*.35,m.w-halfW+.5+pad*.35);
  if(m.interior){const hz=dist*tanh*.9;tz=m.h<=2*hz?clamp(tz,m.h/2-1,m.h/2+.5):clamp(tz,hz-1.2,m.h-hz+1.6)}
  else tz=clamp(tz,3-pad*.5,m.h-3+pad*.5);
  const T=W3.camT||(W3.camT=new THREE.Vector3(tx,0,tz));if(snap)T.set(tx,0,tz);else{const k=1-Math.exp(-dt*14);T.x+=(tx-T.x)*k;T.z+=(tz-T.z)*k}
  const cam=W3.cam;cam.position.set(T.x,dist*Math.sin(W3K.pitch)+.4,T.z+dist*Math.cos(W3K.pitch));cam.lookAt(T.x,.4,T.z);
  const sun=W3.sun,sx=Math.round(T.x*4)/4,sz=Math.round(T.z*4)/4;sun.position.set(sx-7,16,sz+9);sun.target.position.set(sx,0,sz);sun.target.updateMatrixWorld()}

/* ---------- every frame ---------- */
function w3enter(m){w3clear();W3.m=m;W3.bld=m.interior||m.cave?w3buildings(m):w3buildings(m);if(W3.pzo)for(const o of W3.pzo)w3free(o);W3.pzo=w3puzzles(m);for(const o of W3.pzo)W3.actors.add(o.root);W3.snap=true}
function w3player(){const key=JSON.stringify(PAL.player);if(W3.ply&&W3.plyKey===key)return W3.ply;if(W3.ply)W3.actors.remove(W3.ply.root);
  _w3kid.forEach((v,k)=>{if(k.startsWith('player'))_w3kid.delete(k)});const n=w3kid('player',Object.assign({style:'hood'},PAL.player));W3.actors.add(n.root);W3.ply=n;W3.plyKey=key;
  if(W3.plySil)W3.actors.remove(W3.plySil);W3.plySil=w3silhouette(n);W3.actors.add(W3.plySil);
  const rip=new THREE.Mesh(new THREE.RingGeometry(.22,.3,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#e6fbff',transparent:true,opacity:0,depthWrite:false}));rip.position.y=.03;n.root.add(rip);n.rip=rip;return n}
function draw3D(now){
  const m=CM;if(!m)return;const dt=Math.min(.05,(now-(W3.lt||now))/1000)||.016;W3.lt=now;
  if(W3.m!==m)w3enter(m);
  const px=P.fx+(P.x-P.fx)*P.t,pz=P.fy+(P.y-P.fy)*P.t;
  w3chunksFor(m,pz,now);
  /* you */
  const n=w3player();if(P.moving)W3.lastMove=now;const moving=P.moving||now-(W3.lastMove||0)<70;
  n.root.position.set(px+.5,0,pz+.5);w3animKid(n,dt,moving,running&&moving,P.dir);w3silSync(n);
  const tx=P.t<.5?P.fx:P.x,ty=P.t<.5?P.fy:P.y,here=tAt(tx,ty);n.rip.material.opacity=here==='shallows'?.55+.2*Math.sin(now/180):0;n.rip.scale.setScalar(1+.12*Math.sin(now/240));
  /* everyone else */
  const alerts=[],sleepers=[],live=new Set(m.ents);
  /* anyone who has left the map (your rival walking off) leaves the scene too */
  for(const[e,o]of W3.ents)if(!live.has(e)){w3free(o);W3.ents.delete(e)}
  for(const e of m.ents){let ex=e.x,ey=e.y,k=1;if(e.anim){k=clamp((now-e.anim.t0)/e.anim.dur,0,1);ex=e.anim.fx+(e.x-e.anim.fx)*k;ey=e.anim.fy+(e.y-e.anim.fy)*k}
    if(Math.abs(ey-pz)>18){const o=W3.ents.get(e);if(o){w3free(o);W3.ents.delete(e)}continue}
    let o=W3.ents.get(e);if(!o){o=w3entObj(e);if(!o)continue;W3.ents.set(e,o);W3.actors.add(o.root)}
    const v=vis(e);o.root.visible=v;if(!v)continue;o.root.position.set(ex+.5,0,ey+.5);
    if(o.kid)w3animKid(o,dt,!!e.anim&&k<1,false,e.dir,e.sleep?'sleep':null);if(o.upd)o.upd(now,dt,e);if(e.alert)alerts.push(o.root);if(e.sleep)sleepers.push(o.root)}
  if(W3.pzo)for(const o of W3.pzo)o.upd(now,dt);
  /* camera, light, and the see-through hole around you */
  w3camera(m,px,pz,dt,W3.snap);w3envStep(m,pz,dt,W3.snap);W3.snap=false;
  W3.lamp.position.set(px+.5,1.6,pz+.9);
  W3.U.uPly.value.set(px+.5,.55,pz+.5);W3.U.uCam.value.copy(W3.cam.position);W3.U.uTime.value=now/1000;if(_w3wt){_w3wt.offset.set(now/9000,now/14000)}
  W3.r.render(W3.sc,W3.cam);
  /* the pixel canvas on top stays clear, apart from "!" over anyone who has spotted you */
  ctx.clearRect(0,0,W,H);
  const v3=new THREE.Vector3();for(const r of alerts){v3.copy(r.position);v3.y+=1.3;v3.project(W3.cam);drawAlert(Math.round((v3.x+1)/2*W)-8,Math.round((1-v3.y)/2*H)-12)}
  for(const r of sleepers){v3.copy(r.position);v3.y+=1.25;v3.x+=.15;v3.project(W3.cam);drawZzz(Math.round((v3.x+1)/2*W),Math.round((1-v3.y)/2*H),now)}}

/* ---------- the trainer editor on the title screen shows your 3D figure, turning slowly ---------- */
function w3look(now){const cv=$('#look3');if(!W3.ok||!cv)return false;
  if(!W3.lk){const r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true}),sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(26,1,.1,20);r.outputColorSpace=THREE.SRGBColorSpace;
    sc.add(new THREE.HemisphereLight('#ffffff','#5a6470',1.7));const d=new THREE.DirectionalLight('#fff3dc',2.3);d.position.set(-2,4,3);sc.add(d);
    cam.position.set(0,1.05,3.3);cam.lookAt(0,.55,0);W3.lk={r,sc,cam,key:'',kid:null}}
  const L2=W3.lk,w=cv.clientWidth||120,h=cv.clientHeight||140;if(L2.w!==w||L2.h!==h){L2.w=w;L2.h=h;L2.r.setPixelRatio(Math.min(2.5,window.devicePixelRatio||1));L2.r.setSize(w,h,false);L2.cam.aspect=w/h;L2.cam.updateProjectionMatrix()}
  const key=JSON.stringify(PAL.player);
  if(key!==L2.key){L2.key=key;if(L2.kid){L2.sc.remove(L2.kid.root);const keep=new Set(_w3g.values());L2.kid.root.traverse(o=>{if(o.isMesh&&!keep.has(o.geometry))o.geometry.dispose()})}
    const root=w3kidProto('player',Object.assign({style:'hood'},PAL.player)),n={root,t:0,walk:0,run:0,ph:0,yaw:0};root.traverse(o=>{if(o.userData.role)n[o.userData.role]=o});L2.kid=n;L2.sc.add(root)}
  const n=L2.kid,dt=Math.min(.05,(now-(L2.lt||now))/1000)||.016;L2.lt=now;
  w3animKid(n,dt,false,false,'down');n.yaw=0;n.root.rotation.y=Math.sin(now/1600)*.9+now/2600%(Math.PI*2)*0;n.root.rotation.y=(now/2200)%(Math.PI*2);
  L2.r.render(L2.sc,L2.cam);return true}

/* ---------- the opening cutscene: Prof. Wren under a spotlight, with a Lynty, then you, then your rival ---------- */
function w3intro(now){const I=INTRO;if(!I)return;const dt=Math.min(.05,(now-(W3.ilt||now))/1000)||.016;W3.ilt=now;
  if(!W3.ix){const sc=new THREE.Scene(),bg=document.createElement('canvas');bg.width=4;bg.height=256;const g=bg.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);
    gr.addColorStop(0,'#121c44');gr.addColorStop(.55,'#33579a');gr.addColorStop(1,'#86b2e2');g.fillStyle=gr;g.fillRect(0,0,4,256);const bt=new THREE.CanvasTexture(bg);bt.colorSpace=THREE.SRGBColorSpace;sc.background=bt;
    sc.add(new THREE.HemisphereLight('#ffffff','#46588a',1.7));const d=new THREE.DirectionalLight('#fff2dc',2.3);d.position.set(-2.5,6,4);d.castShadow=true;d.shadow.mapSize.set(1024,1024);
    const sh=d.shadow.camera;sh.left=-3;sh.right=3;sh.top=3;sh.bottom=-3;sh.near=1;sh.far=20;d.shadow.radius=3;d.shadow.bias=-.0008;sc.add(d);
    /* a soft spotlight on the floor */
    const fc=document.createElement('canvas');fc.width=fc.height=128;const f2=fc.getContext('2d'),fg=f2.createRadialGradient(64,64,0,64,64,64);fg.addColorStop(0,'rgba(255,248,226,1)');fg.addColorStop(.6,'rgba(236,226,200,.85)');fg.addColorStop(1,'rgba(236,226,200,0)');f2.fillStyle=fg;f2.fillRect(0,0,128,128);
    const ft=new THREE.CanvasTexture(fc);ft.colorSpace=THREE.SRGBColorSpace;const floor=new THREE.Mesh(new THREE.CircleGeometry(2.6,48).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:ft,transparent:true,depthWrite:false}));floor.receiveShadow=true;sc.add(floor);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.3,.36,32),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));sc.add(ring);
    W3.ix={sc,cam:new THREE.PerspectiveCamera(28,1,.1,60),ring,prof:null,right:null,key:''}}
  const X=W3.ix,asp=W3.aspect||1,tanh=Math.tan(14*Math.PI/180),dist=Math.max(4.8,2.9/(2*tanh*asp));
  if(X.cam.aspect!==asp){X.cam.aspect=asp;X.cam.updateProjectionMatrix()}X.cam.position.set(0,.4+dist*.2,dist);X.cam.lookAt(0,.32,0);
  if(!X.prof){X.prof=w3kid('prof',PAL.prof);X.prof.root.position.set(-.72,0,0);X.sc.add(X.prof.root)}
  const talking=!$('#dialog').hidden&&!!advanceFn;w3animKid(X.prof,dt,false,false,'down',null);X.prof.root.rotation.y=.42;X.prof.head.rotation.x+=talking?Math.sin(now/90)*.03:0;
  /* whoever stands beside him */
  const key=I.who+'|'+(I.who==='lyn'?I.lyn:I.who==='you'?JSON.stringify(PAL.player):'');
  if(key!==X.key){X.key=key;if(X.right){X.sc.remove(X.right.root);if(X.right.tex)X.right.tex.dispose()}X.right=null;
    if(I.who==='lyn'){const tx=w3tex(sprCanvas(I.lyn,true,false),{mip:false}),pl=new THREE.Mesh(new THREE.PlaneGeometry(1.35,1.35).translate(0,.675,0),new THREE.MeshLambertMaterial({map:tx,transparent:true,alphaTest:.45,side:THREE.DoubleSide}));
      pl.castShadow=true;const root=new THREE.Group();root.add(pl);X.right={root,tex:tx,lyn:pl}}
    else if(I.who==='you')X.right=w3kid('player',Object.assign({style:'hood'},PAL.player));
    else if(I.who==='rival')X.right=w3kid('rival',PAL.rival);
    if(X.right){X.right.root.position.set(.78,0,.05);X.sc.add(X.right.root)}}
  const k=clamp((now-I.t0)/380,0,1),pop=k<1?1+Math.sin(k*Math.PI)*.18-(1-k)*(1-k):1;
  if(X.right){const r=X.right;r.root.scale.setScalar((r.lyn?1:W3K.kid)*Math.max(.01,pop));
    if(r.lyn)r.lyn.position.y=(SP[I.lyn].fl?.2:0)+Math.sin(now/420)*.04;else{w3animKid(r,dt,false,false,'down',null);r.root.rotation.y=-.42}}
  X.ring.position.set(.78,.6,.1);X.ring.lookAt(X.cam.position);X.ring.scale.setScalar(1+k*3.2);X.ring.material.opacity=I.who==='lyn'&&k<1?(1-k)*.9:0;
  W3.r.render(X.sc,X.cam);ctx.clearRect(0,0,W,H)}
