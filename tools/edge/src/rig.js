/* ================= the fighters' bodies =================
   A fighter is a skeleton of bones wearing one smooth skinned body: the torso, arms and legs are single meshes that
   bend at the joints with no seams. Clothes are made the same way, a little larger, over the body; the head, hands,
   feet and gear are rigid pieces held by the bones. The model faces +Z with +Y up, about 1.8 units (metres) tall,
   feet at y = 0. It is posed by joint angles. */
const MATS=new Map();
function mat(color,o={}){const key=color+JSON.stringify(o);let m=MATS.get(key);if(m)return m;
  m=new THREE.MeshStandardMaterial(Object.assign({color,roughness:.75,metalness:0},o));MATS.set(key,m);return m}
const SKINM=c=>mat(c,{roughness:.5});
const G_SPH=new THREE.SphereGeometry(1,28,20),G_SPH_LO=new THREE.SphereGeometry(1,14,10),G_CYL=new THREE.CylinderGeometry(1,1,1,18,1),G_BOX=new THREE.BoxGeometry(1,1,1),G_CONE=new THREE.ConeGeometry(1,1,14);
const CAPS=new Map();function capG(r,len){const k=r.toFixed(3)+'/'+len.toFixed(3);let g=CAPS.get(k);if(!g){g=new THREE.CapsuleGeometry(r,Math.max(.001,len),8,16);CAPS.set(k,g)}return g}
function mesh(geo,m,parent,pos=[0,0,0],scale=[1,1,1],rot=[0,0,0]){const o=new THREE.Mesh(geo,m);o.position.set(...pos);o.scale.set(...scale);o.rotation.set(...rot);o.castShadow=true;o.receiveShadow=false;parent.add(o);return o}
function joint(parent,name,pos,J){const j=new THREE.Bone();j.name=name;j.position.set(...pos);parent.add(j);J[name]=j;return j}
function mixc(a,b,t){const A=new THREE.Color(a),B=new THREE.Color(b);return'#'+A.lerp(B,t).getHexString()}
/* ---------- skinned tubes ----------
   Every part hangs straight at rest, so it is a stack of rings round a vertical axis. Its shape is a list of keys
   [u, radius across, radius front-to-back, forward offset], joined by a smooth curve; u runs along the part (for a
   limb 0 = top joint, 1 = middle joint, 2 = end joint). Each ring is weighted between the bones either side of it. */
const cr=(a,b,c,d,t)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
function profAt(K,u){const n=K.length;if(u<=K[0][0])return[K[0][1],K[0][2],K[0][3]||0];if(u>=K[n-1][0])return[K[n-1][1],K[n-1][2],K[n-1][3]||0];
  let i=1;while(u>K[i][0])i++;const a=K[Math.max(0,i-2)],b=K[i-1],c=K[i],d=K[Math.min(n-1,i+1)],t=(u-b[0])/(c[0]-b[0]);
  return[1,2,3].map(k=>Math.max(.004,cr(a[k]||0,b[k]||0,c[k]||0,d[k]||0,t)))}
const sstep=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
function boneW(P,u){const B=P.bones,w=P.blend;let k=0;for(let i=0;i<B.length;i++)if(u>=B[i][0])k=i;
  if(k+1<B.length&&u>B[k+1][0]-w){const t=sstep((u-B[k+1][0]+w)/(2*w));return[B[k][1],B[k+1][1],1-t,t]}
  if(k>0&&u<B[k][0]+w){const t=sstep((u-B[k][0]+w)/(2*w));return[B[k-1][1],B[k][1],1-t,t]}
  return[B[k][1],0,1,0]}
/* o: from, to (u range), grow (extra radius), flare(u) (more radius), lip (close an open end back to the body) */
function tubeGeo(P,o){const M=18,N=o.rings||26,pos=[],si=[],sw=[],idx=[],from=o.from,to=o.to,g=o.grow||0;
  const ring=(u,extra,shrink)=>{const[rx,rz,cz]=profAt(P.keys,u),f=o.flare?o.flare(u):0,y=P.y(u),[b0,b1,w0,w1]=boneW(P,u),base=pos.length/3;
    const ax=shrink?rx-.002:rx*P.sx+g+f,az=shrink?rz-.002:rz*P.sz+g+f;
    for(let j=0;j<M;j++){const a=j/M*Math.PI*2;pos.push(P.x+Math.sin(a)*(shrink?rx*P.sx-.002:ax),y,P.z+cz+Math.cos(a)*(shrink?rz*P.sz-.002:az));si.push(b0,b1,0,0);sw.push(w0,w1,0,0)}return base};
  const rings=[];if(o.lip0)rings.push(ring(from,0,1));
  for(let i=0;i<=N;i++)rings.push(ring(from+(to-from)*i/N));
  if(o.lip1)rings.push(ring(to,0,1));
  for(let r=0;r<rings.length-1;r++){const a=rings[r],b=rings[r+1];for(let j=0;j<M;j++){const j2=(j+1)%M;idx.push(a+j,b+j,a+j2,a+j2,b+j,b+j2)}}
  const cap=(u,first)=>{const[rx,rz,cz]=profAt(P.keys,u),y=P.y(u),dir=Math.sign(P.y(u)-P.y(u+(first?.01:-.01)))||1,[b0,b1,w0,w1]=boneW(P,u),c=pos.length/3;
    pos.push(P.x,y+dir*Math.min(rx,rz)*.35,P.z+cz);si.push(b0,b1,0,0);sw.push(w0,w1,0,0);const rr=first?rings[0]:rings[rings.length-1];
    for(let j=0;j<M;j++){const j2=(j+1)%M;if(first)idx.push(c,rr+j,rr+j2);else idx.push(c,rr+j2,rr+j)}};
  if(o.cap0&&!o.lip0)cap(from,true);if(o.cap1&&!o.lip1)cap(to,false);
  /* a part that runs upward (the torso) turns the other way round, so flip its triangles to face outward */
  if(P.y(to)>P.y(from))for(let i=0;i<idx.length;i+=3){const t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));
  G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));G.setIndex(idx);G.computeVertexNormals();return G}
/* the body's shapes (radii in metres before the build widens them) */
const TORSO=[[-.178,.02,.02],[-.162,.075,.065],[-.12,.135,.1,-.005],[-.06,.158,.112,-.01],[0,.152,.106,-.006],[.08,.134,.095],[.16,.14,.098,.006],[.26,.158,.108,.012],
  [.34,.177,.117,.014],[.42,.19,.112,.008],[.47,.186,.098],[.51,.135,.082,-.006],[.545,.068,.06],[.6,.057,.055,.006],[.66,.055,.054,.012],[.7,.03,.03,.012]];
const LEG=[[-.17,.04,.04],[-.1,.084,.084],[0,.096,.092],[.3,.088,.086,.004],[.7,.07,.068,.006],[.95,.058,.058,.01],[1.05,.057,.056],[1.25,.064,.06,-.013],
  [1.55,.052,.049,-.006],[1.85,.041,.039],[2,.039,.037],[2.07,.018,.018]];
const ARM=[[-.24,.02,.02],[-.16,.054,.052],[-.05,.07,.066],[.15,.064,.06],[.5,.057,.055,.004],[.88,.046,.046],[1,.045,.045],[1.2,.052,.048],[1.6,.043,.038],[1.95,.034,.03],[2.06,.018,.018]];
const BUILD={slim:{w:.92,arm:.9,leg:.94},normal:{w:1,arm:1,leg:1},athletic:{w:1.04,arm:1.08,leg:1.04},heavy:{w:1.22,arm:1.2,leg:1.15},huge:{w:1.32,arm:1.32,leg:1.22}};
const BONES=['hips','thL','knL','ftL','thR','knR','ftR','spine','chest','neck','head','shL','elL','hdL','shR','elR','hdR'];const BI=Object.fromEntries(BONES.map((b,i)=>[b,i]));
function makeSkeleton(body,J,b){const hips=joint(body,'hips',[0,.95,0],J);
  for(const[s,x]of[['L',1],['R',-1]]){const th=joint(hips,'th'+s,[x*.095*b.w,-.06,0],J),kn=joint(th,'kn'+s,[0,-.42,0],J);joint(kn,'ft'+s,[0,-.4,0],J)}
  const spine=joint(hips,'spine',[0,.08,0],J),chest=joint(spine,'chest',[0,.2,0],J),neck=joint(chest,'neck',[0,.27,0],J);joint(neck,'head',[0,.09,0],J);
  for(const[s,x]of[['L',1],['R',-1]]){const sh=joint(chest,'sh'+s,[x*.2*b.w,.2,0],J),el=joint(sh,'el'+s,[0,-.3*b.arm**.3,0],J);joint(el,'hd'+s,[0,-.27,0],J)}}
/* the same skeleton with no body: the game uses it to know where fists, feet and blades really are */
function simRig(L){const J={},root=new THREE.Group(),b=BUILD[L.build||'normal'],S=L.h||1,body=new THREE.Group();body.scale.setScalar(S);root.add(body);makeSkeleton(body,J,b);
  const pt=(parent,name,p)=>{const o=new THREE.Object3D();o.position.set(...p);parent.add(o);J[name]=o};
  pt(J.head,'headC',[0,.11,0]);for(const s of['L','R']){pt(J['hd'+s],'fist'+s,[0,-.06,.012]);pt(J['ft'+s],'toe'+s,[0,-.045,.085])}
  if(L.weapon){const w=new THREE.Object3D();w.position.set(0,-.07,.01);J.hdR.add(w);const tip={sword:.95,greatsword:1.35,staff:.97}[L.weapon]||.9;
    pt(w,'tip',[0,0,tip]);pt(w,'blade',[0,0,tip*.62]);if(L.weapon==='staff')pt(w,'butt',[0,0,-.7])}
  return{root,J,body,S,b}}
function buildRig(L){const J={},root=new THREE.Group(),b=BUILD[L.build||'normal'],S=L.h||1;
  const skin=SKINM(L.skin),top=mat(L.top,{roughness:L.topRough??.85}),top2=mat(L.top2||L.top,{roughness:.8}),pants=mat(L.pants,{roughness:.88}),shoes=mat(L.shoes||'#2a2a30',{roughness:.55}),
    hair=mat(L.hair||'#1a1410',{roughness:.6}),glove=L.gloves?mat(L.gloves,{roughness:.55}):skin,belt=mat(L.belt||'#2a1a10',{roughness:.6}),
    metal=mat('#c8ccd6',{roughness:.28,metalness:.85}),dark=mat('#16141c',{roughness:.5}),white=mat('#f4f2ec',{roughness:.35});
  const body=new THREE.Group();body.scale.setScalar(S);root.add(body);
  /* the skeleton */
  makeSkeleton(body,J,b);const{hips,spine,chest,neck,head}=J;
  root.updateMatrixWorld(true);const skel=new THREE.Skeleton(BONES.map(n=>J[n]));
  const skinned=(geo,m)=>{const o=new THREE.SkinnedMesh(geo,m);body.add(o);o.bind(skel,o.matrixWorld);o.castShadow=true;o.frustumCulled=false;return o};
  /* the parts, in body space at rest */
  const parts={torso:{x:0,z:0,y:u=>.95+u,keys:TORSO,sx:b.w,sz:b.w**.8,bones:[[-9,BI.hips],[.08,BI.spine],[.28,BI.chest],[.55,BI.neck],[.64,BI.head]],blend:.05}};
  for(const[s,x]of[['L',1],['R',-1]]){const hy=.89,kl=.42,sl=.4;
    parts['leg'+s]={x:x*.095*b.w,z:0,y:u=>hy-(u<=1?u*kl:kl+(u-1)*sl),keys:LEG,sx:b.leg,sz:b.leg,bones:[[-9,BI.hips],[-.06,BI['th'+s]],[1,BI['kn'+s]],[2.03,BI['ft'+s]]],blend:.09};
    const sy=.95+.08+.2+.2,ul=.3*b.arm**.3,fl=.27;
    parts['arm'+s]={x:x*.2*b.w,z:0,y:u=>sy-(u<=1?u*ul:ul+(u-1)*fl),keys:ARM,sx:b.arm,sz:b.arm,bones:[[-9,BI.chest],[-.07,BI['sh'+s]],[1,BI['el'+s]],[2.02,BI['hd'+s]]],blend:.07}}
  const T=parts.torso,rxAt=y=>profAt(TORSO,y)[0]*b.w,rzAt=y=>profAt(TORSO,y)[1]*b.w**.8;
  /* the body itself */
  skinned(tubeGeo(T,{from:-.178,to:.7,rings:40,cap0:1,cap1:1}),skin);
  for(const s of['L','R']){skinned(tubeGeo(parts['leg'+s],{from:-.17,to:2.07,rings:34,cap0:1,cap1:1}),skin);skinned(tubeGeo(parts['arm'+s],{from:-.24,to:2.06,rings:32,cap0:1,cap1:1}),skin)}
  /* clothes over it */
  const bare=L.bare||L.sports||L.tank;
  skinned(tubeGeo(T,{from:-.178,to:L.gi||L.coat?-.02:.035,grow:.009,cap0:1,lip1:1,rings:12}),pants);
  if(L.sports)skinned(tubeGeo(T,{from:.2,to:.4,grow:.008,lip0:1,lip1:1,rings:8}),top);
  else if(L.tank)skinned(tubeGeo(T,{from:-.02,to:.455,grow:.01,lip0:1,lip1:1,rings:18}),top);
  else if(!L.bare)skinned(tubeGeo(T,{from:L.gi||L.coat?-.13:-.02,to:.53,grow:.012,flare:u=>u<0?-u*.18:0,lip0:1,lip1:1,rings:22}),top);
  for(const s of['L','R']){const leg=parts['leg'+s],arm=parts['arm'+s];
    if(L.shorts)skinned(tubeGeo(leg,{from:-.17,to:.42,grow:.011,flare:u=>Math.max(0,u)*.012,cap0:1,lip1:1,rings:10}),pants);
    else skinned(tubeGeo(leg,{from:-.17,to:L.boots?1.5:1.96,grow:.01,flare:L.gi?u=>Math.max(0,u-.4)*.022:null,cap0:1,lip1:1,rings:28}),pants);
    if(L.boots)skinned(tubeGeo(leg,{from:1.32,to:2.07,grow:.016,lip0:1,cap1:1,rings:12}),shoes);
    if(L.legwraps)skinned(tubeGeo(leg,{from:1.62,to:1.98,grow:.007,lip0:1,lip1:1,rings:6}),mat(L.legwraps,{roughness:.9}));
    if(!bare){const end=L.longSleeves?1.9:L.gi?1.42:.52;skinned(tubeGeo(arm,{from:-.19,to:end,grow:.011,flare:L.gi?u=>Math.max(0,u-.6)*.035:null,cap0:1,lip1:1,rings:Math.round(8+end*10)}),top)}
    if(L.wraps)skinned(tubeGeo(arm,{from:1.68,to:2,grow:.006,lip0:1,lip1:1,rings:6}),mat(L.wraps,{roughness:.9}));
    if(L.gauntlets)skinned(tubeGeo(arm,{from:1.25,to:2.03,grow:.014,flare:u=>Math.max(0,1.5-u)*.02,lip0:1,cap1:1,rings:10}),mat(L.gauntlets,{roughness:.3,metalness:.8}))}
  /* belt, lapels, skirts and gear over the torso */
  if(L.belt!==null){const r=rxAt(.03)+.012;mesh(new THREE.TorusGeometry(1,.016/r,8,32),belt,hips,[0,.03,-.003],[r,r,(rzAt(.03)+.012)],[Math.PI/2,0,0])}
  if(L.coat)mesh(new THREE.CylinderGeometry(.17*b.w,.24*b.w,.42,24,1,true),mat(L.top,{roughness:.85,side:THREE.DoubleSide}),hips,[0,-.22,-.005],[1,1,.74]);
  if(L.tank)for(const x of[-1,1])mesh(capG(.018,.2),top,chest,[x*.09*b.w,.2,0],[1,1,.45],[Math.PI/2,0,x*.18]);
  if(L.pecs&&L.bare)for(const x of[-1,1])mesh(G_SPH,skin,chest,[x*.075*b.w,.13,.07*b.w],[.075*b.w,.05,.045]);
  if(L.armor){const am=mat(L.armor,{roughness:.3,metalness:.8});mesh(G_SPH,am,chest,[0,.09,.015],[.2*b.w,.21,.135*b.w]);mesh(G_SPH,am,spine,[0,.05,.008],[.16*b.w,.13,.118*b.w]);
    for(const x of[-1,1])mesh(G_SPH,am,J['sh'+(x>0?'L':'R')],[x*.012,.0,0],[.095*b.arm,.075*b.arm,.095*b.arm]);mesh(new THREE.CylinderGeometry(.17*b.w,.2*b.w,.16,24,1,true),mat(L.armor,{roughness:.3,metalness:.8,side:THREE.DoubleSide}),hips,[0,-.07,0],[1,1,.74])}
  if(L.vest)mesh(G_SPH,mat(L.vest,{roughness:.7}),chest,[0,.08,.01],[.19*b.w,.19,.128*b.w]);
  if(L.scarf){const sm=mat(L.scarf,{roughness:.9});mesh(new THREE.TorusGeometry(.075,.032,10,24),sm,neck,[0,0,.005],[1,1,.95],[Math.PI/2,0,0]);mesh(capG(.03,.16),sm,chest,[.05,.17,-.1],[1,1,.35],[.3,0,.2])}
  /* the head */
  const nw=Math.min(1.25,b.w);
  mesh(G_SPH,skin,head,[0,.11,0],[.098,.12,.11]);
  mesh(G_SPH,skin,head,[0,.058,.016],[.074,.066,.082]);
  mesh(G_SPH,skin,head,[0,.025,.05],[.04,.03,.04]);
  mesh(capG(.012,.03),skin,head,[0,.088,.108],[1,1,1.1],[.25,0,0]);mesh(G_SPH_LO,skin,head,[0,.075,.112],[.017,.012,.014]);
  for(const x of[-1,1]){mesh(G_SPH_LO,skin,head,[x*.098,.1,-.004],[.016,.028,.02]);
    mesh(G_SPH_LO,white,head,[x*.037,.114,.091],[.019,.012,.01]);mesh(G_SPH_LO,mat(L.eyes||'#3a2618',{roughness:.15}),head,[x*.037,.114,.098],[.0085,.0085,.005]);
    mesh(capG(.006,.03),hair,head,[x*.039,.137,.1],[1,1,.8],[0,0,Math.PI/2+x*.12])}
  mesh(capG(.006,.022),mat(mixc(L.skin,'#8a3a3a',.4),{roughness:.45}),head,[0,.048,.104],[1,1,.8],[0,0,Math.PI/2]);
  hairStyle(L,head,hair,mat,skin);
  if(L.beard){mesh(G_SPH,hair,head,[0,.04,.045],[.086,.068,.08]);mesh(capG(.008,.04),hair,head,[0,.062,.108],[1,1,.8],[0,0,Math.PI/2])}
  if(L.mask)mesh(G_SPH,mat(L.mask,{roughness:.8}),head,[0,.058,.028],[.102,.062,.1]);
  if(L.headband){const hbm=mat(L.headband,{roughness:.85});mesh(new THREE.TorusGeometry(.106,.013,8,32),hbm,head,[0,.148,-.004],[1,1.06,1.04],[Math.PI/2+.12,0,0]);mesh(capG(.01,.1),hbm,head,[.02,.11,-.12],[1.4,1,.4],[.5,0,.3]);mesh(capG(.01,.12),hbm,head,[-.02,.1,-.125],[1.4,1,.4],[.6,0,-.2])}
  /* hands: a closed fist with a thumb, or boxing gloves */
  for(const[s,x]of[['L',1],['R',-1]]){const hd=J['hd'+s];
    if(L.boxing){mesh(G_SPH,mat(L.boxing,{roughness:.32}),hd,[0,-.065,.012],[.072,.085,.078]);mesh(G_SPH,mat(L.boxing,{roughness:.32}),hd,[x*-.045,-.05,.04],[.03,.04,.03]);mesh(G_CYL,white,hd,[0,-.005,0],[.046,.05,.046])}
    else{const gm=L.gloves?glove:skin;mesh(capG(.036,.02),gm,hd,[0,-.05,.006],[1.05,1,.85]);mesh(capG(.02,.05),gm,hd,[0,-.085,.022],[1,1,1],[0,0,Math.PI/2]);
      mesh(capG(.013,.025),gm,hd,[x*-.034,-.045,.026],[1,1,1],[.4,0,x*.5])}}
  /* feet: shoes with soles, or bare feet */
  for(const s of['L','R']){const ft=J['ft'+s];
    if(L.barefoot){mesh(capG(.036,.11),skin,ft,[0,-.04,.05],[1.05,.7,1],[Math.PI/2,0,0]);mesh(G_SPH_LO,skin,ft,[0,-.03,-.005],[.04,.045,.045])}
    else{mesh(capG(.044,.12),shoes,ft,[0,-.04,.052],[1.08,.78,1],[Math.PI/2,0,0]);mesh(capG(.046,.13),dark,ft,[0,-.068,.05],[1.1,.28,1],[Math.PI/2,0,0])}}
  if(L.kneepads)for(const s of['L','R'])mesh(G_SPH,mat(L.kneepads,{roughness:.5}),J['kn'+s],[0,-.02,.06],[.06,.07,.035]);
  /* weapons, held in the right hand */
  if(L.weapon)J.weapon=buildWeapon(L.weapon,J.hdR,metal,mat);
  root.traverse(o=>{if(o.isMesh)o.castShadow=true});
  return{root,J,body,S}}
function hairStyle(L,head,hair,mat,skin){const st=L.hairStyle||'short';
  if(st==='bald')return;
  if(st==='buzz'){mesh(G_SPH,hair,head,[0,.13,-.006],[.104,.1,.112]);return}
  if(st!=='none')mesh(G_SPH,hair,head,[0,.142,-.012],[.108,.1,.118]);
  if(st==='short'){mesh(G_SPH,hair,head,[0,.1,-.03],[.106,.09,.1])}
  if(st==='spiky'){for(let i=0;i<7;i++){const a=(i/6-.5)*2.2;mesh(G_CONE,hair,head,[Math.sin(a)*.07,.21+Math.cos(a)*.01,-.02-Math.abs(a)*.01],[.03,.09,.03],[-.5,0,-a*.6])}mesh(G_SPH,hair,head,[0,.1,-.03],[.106,.09,.1])}
  if(st==='ponytail'){mesh(G_SPH,hair,head,[0,.1,-.03],[.108,.1,.1]);const p=mesh(capG(.035,.22),hair,head,[0,.04,-.15],[1,1,1],[.45,0,0])}
  if(st==='long'){mesh(G_SPH,hair,head,[0,.04,-.05],[.115,.2,.09])}
  if(st==='bun'){mesh(G_SPH,hair,head,[0,.1,-.03],[.106,.09,.1]);mesh(G_SPH,hair,head,[0,.22,-.07],[.05,.05,.05])}
  if(st==='braids'){mesh(G_SPH,hair,head,[0,.1,-.03],[.108,.1,.1]);for(const x of[-1,1])mesh(capG(.022,.26),hair,head,[x*.07,-.02,-.08],[1,1,1],[.15,0,x*.12])}
  if(st==='mohawk'){mesh(G_BOX,hair,head,[0,.22,-.02],[.03,.07,.2])}
  if(st==='slick'){mesh(G_SPH,hair,head,[0,.1,-.035],[.108,.095,.1])}}
function buildWeapon(kind,hand,metal,mat){const w=new THREE.Group();hand.add(w);w.position.set(0,-.07,.01);let tip=.9;
  const grip=mat('#3a2418',{roughness:.7}),gold=mat('#d8a840',{roughness:.3,metalness:.8});
  if(kind==='sword'){mesh(G_CYL,grip,w,[0,0,0],[.016,.16,.016],[Math.PI/2,0,0]);mesh(G_BOX,gold,w,[0,0,.08],[.16,.025,.025]);mesh(G_BOX,metal,w,[0,0,.5],[.05,.012,.82]);mesh(G_CONE,metal,w,[0,0,.93],[.025,.06,.006],[Math.PI/2,0,0]);tip=.95}
  if(kind==='greatsword'){mesh(G_CYL,grip,w,[0,0,0],[.02,.26,.02],[Math.PI/2,0,0]);mesh(G_BOX,gold,w,[0,0,.13],[.24,.04,.04]);mesh(G_BOX,metal,w,[0,0,.72],[.11,.022,1.14]);mesh(G_CONE,metal,w,[0,0,1.33],[.055,.1,.011],[Math.PI/2,0,0]);tip=1.35}
  if(kind==='staff'){mesh(G_CYL,mat('#7a4a22',{roughness:.6}),w,[0,0,.12],[.022,1.7,.022],[Math.PI/2,0,0]);for(const z of[-.72,.96])mesh(G_CYL,gold,w,[0,0,z],[.026,.06,.026],[Math.PI/2,0,0]);tip=.97}
  w.userData.tip=tip;w.userData.kind=kind;return w}
/* ---------- posing ----------
   A pose names joint angles in degrees, in plain terms:
   arm{L,R}: [forward, out to the side, twist]   elbow{L,R}: bend   leg{L,R}: [forward, out]   knee{L,R}: bend
   foot{L,R}: tip    hips/spine/chest/neck/head: [lean forward, turn, tilt]    y: lift of the whole body
   Anything left out is 0. */
const PK=['y','hips0','hips1','hips2','spine0','spine1','spine2','chest0','chest1','chest2','neck0','neck1','neck2','head0','head1','head2',
  'armL0','armL1','armL2','elbowL','armR0','armR1','armR2','elbowR','legL0','legL1','kneeL','footL','legR0','legR1','kneeR','footR','handL','handR'];
function P(o){const a=new Float32Array(PK.length);for(const k in o){const v=o[k];if(Array.isArray(v))v.forEach((x,i)=>{const n=PK.indexOf(k+i);if(n>=0)a[n]=x});else{const n=PK.indexOf(k);if(n>=0)a[n]=v}}return a}
function mixPose(a,b,t,out){out=out||new Float32Array(PK.length);for(let i=0;i<PK.length;i++)out[i]=a[i]+(b[i]-a[i])*t;return out}
const IX=Object.fromEntries(PK.map((k,i)=>[k,i]));
function applyPose(R,p){const J=R.J,d=D2R;
  J.hips.position.y=.95+p[IX.y];J.hips.rotation.set(p[IX.hips0]*d,p[IX.hips1]*d,p[IX.hips2]*d);
  J.spine.rotation.set(p[IX.spine0]*d,p[IX.spine1]*d,p[IX.spine2]*d);J.chest.rotation.set(p[IX.chest0]*d,p[IX.chest1]*d,p[IX.chest2]*d);
  J.neck.rotation.set(p[IX.neck0]*d,p[IX.neck1]*d,p[IX.neck2]*d);J.head.rotation.set(p[IX.head0]*d,p[IX.head1]*d,p[IX.head2]*d);
  J.shL.rotation.set(-p[IX.armL0]*d,p[IX.armL2]*d,(6+p[IX.armL1])*d);J.elL.rotation.set(-p[IX.elbowL]*d,0,0);J.hdL.rotation.set(-p[IX.handL]*d,0,0);
  J.shR.rotation.set(-p[IX.armR0]*d,-p[IX.armR2]*d,-(6+p[IX.armR1])*d);J.elR.rotation.set(-p[IX.elbowR]*d,0,0);J.hdR.rotation.set(-p[IX.handR]*d,0,0);
  J.thL.rotation.set(-p[IX.legL0]*d,0,p[IX.legL1]*d);J.knL.rotation.set(p[IX.kneeL]*d,0,0);J.ftL.rotation.set(p[IX.footL]*d,0,0);
  J.thR.rotation.set(-p[IX.legR0]*d,0,-p[IX.legR1]*d);J.knR.rotation.set(p[IX.kneeR]*d,0,0);J.ftR.rotation.set(p[IX.footR]*d,0,0)}
