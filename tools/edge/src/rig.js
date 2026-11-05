/* ================= the fighters' bodies =================
   A fighter is a jointed skeleton (Object3D joints) dressed in smooth shapes: muscles, clothes, hair, face, gear.
   The model faces +Z with +Y up, about 1.8 units (metres) tall, feet at y = 0. It is posed by joint angles. */
const MATS=new Map();
function mat(color,o={}){const key=color+JSON.stringify(o);let m=MATS.get(key);if(m)return m;
  m=new THREE.MeshStandardMaterial(Object.assign({color,roughness:.75,metalness:0},o));MATS.set(key,m);return m}
const SKINM=c=>mat(c,{roughness:.55});
const G_SPH=new THREE.SphereGeometry(1,28,20),G_SPH_LO=new THREE.SphereGeometry(1,14,10),G_CYL=new THREE.CylinderGeometry(1,1,1,18,1),G_BOX=new THREE.BoxGeometry(1,1,1),G_CONE=new THREE.ConeGeometry(1,1,14);
const CAPS=new Map();function capG(r,len){const k=r.toFixed(3)+'/'+len.toFixed(3);let g=CAPS.get(k);if(!g){g=new THREE.CapsuleGeometry(r,Math.max(.001,len),6,16);CAPS.set(k,g)}return g}
function mesh(geo,m,parent,pos=[0,0,0],scale=[1,1,1],rot=[0,0,0]){const o=new THREE.Mesh(geo,m);o.position.set(...pos);o.scale.set(...scale);o.rotation.set(...rot);o.castShadow=true;o.receiveShadow=false;parent.add(o);return o}
function joint(parent,name,pos,J){const j=new THREE.Object3D();j.name=name;j.position.set(...pos);parent.add(j);J[name]=j;return j}
/* a limb segment hanging down from a joint: a capsule from the joint to len below it, tapering by scale */
function limb(j,r,len,m,taper=1){const g=capG(r,len-r*2);const o=mesh(g,m,j,[0,-len/2,0],[1,1,1]);if(taper!==1){o.scale.set(taper,1,taper)}return o}
/* smooth body parts: a profile of [radius, height] points turned round the y axis, then squashed front to back */
const LATHES=new Map();function lathe(key,prof){let g=LATHES.get(key);if(!g){g=new THREE.LatheGeometry(prof.map(([r,y])=>new THREE.Vector2(r,y)),28);LATHES.set(key,g)}return g}
const PROF={
  pelvis:[[.001,-.13],[.09,-.12],[.145,-.06],[.16,0],[.15,.06],[.135,.1],[.001,.11]],
  abdomen:[[.001,-.06],[.135,-.05],[.13,.04],[.135,.12],[.15,.2],[.001,.21]],
  chest:[[.001,-.05],[.14,-.04],[.16,.04],[.18,.13],[.19,.2],[.18,.25],[.14,.29],[.08,.31],[.001,.315]],
  shoulders:[[.001,.17],[.18,.18],[.19,.21],[.18,.25],[.14,.29],[.08,.31],[.001,.315]],
  band:[[.001,.03],[.162,.04],[.18,.12],[.188,.19],[.001,.195]]};
const BUILD={slim:{w:.92,arm:.9,leg:.94},normal:{w:1,arm:1,leg:1},athletic:{w:1.04,arm:1.08,leg:1.04},heavy:{w:1.22,arm:1.2,leg:1.15},huge:{w:1.32,arm:1.32,leg:1.22}};
function buildRig(L){const J={},root=new THREE.Group(),b=BUILD[L.build||'normal'],S=L.h||1;
  const skin=SKINM(L.skin),top=mat(L.top,{roughness:L.topRough??.85}),top2=mat(L.top2||L.top,{roughness:.8}),pants=mat(L.pants,{roughness:.88}),shoes=mat(L.shoes||'#2a2a30',{roughness:.6}),
    hair=mat(L.hair||'#1a1410',{roughness:.62}),glove=L.gloves?mat(L.gloves,{roughness:.55}):skin,belt=mat(L.belt||'#2a1a10',{roughness:.6}),
    metal=mat('#c8ccd6',{roughness:.28,metalness:.85}),dark=mat('#16141c',{roughness:.5}),white=mat('#f4f2ec',{roughness:.4});
  const body=new THREE.Group();body.scale.setScalar(S);root.add(body);
  const hips=joint(body,'hips',[0,.95,0],J);
  /* pelvis and legs */
  mesh(lathe('pelvis',PROF.pelvis),pants,hips,[0,0,0],[1.08*b.w,1,.74*b.w]);
  if(L.belt!==null)mesh(new THREE.TorusGeometry(.155*b.w,.022,8,24),belt,hips,[0,.05,0],[1,1,.74],[Math.PI/2,0,0]);
  const legs=[['L',1],['R',-1]];
  for(const[s,x]of legs){const th=joint(hips,'th'+s,[x*.095*b.w,-.06,0],J),kn=joint(th,'kn'+s,[0,-.42,0],J),ft=joint(kn,'ft'+s,[0,-.4,0],J);
    const pm=L.shorts?skin:pants;
    if(L.shorts){mesh(G_SPH,pants,th,[0,-.1,0],[.088*b.leg,.14,.088*b.leg]);limb(th,.072*b.leg,.42,skin,1)}else limb(th,.083*b.leg,.44,pants);
    mesh(G_SPH,pm,kn,[0,0,0],[.066*b.leg,.068,.066*b.leg]);
    const boot=L.boots;limb(kn,.06*b.leg,.41,boot?shoes:pm);if(boot)mesh(G_CYL,shoes,kn,[0,-.22,0],[.066*b.leg,.2,.068*b.leg]);
    if(L.kneepads)mesh(G_SPH,mat(L.kneepads,{roughness:.5}),kn,[0,-.02,.06],[.06,.07,.035]);
    if(L.barefoot){mesh(G_SPH,skin,ft,[0,-.035,.05],[.05,.04,.12])}else{mesh(G_SPH,shoes,ft,[0,-.04,.055],[.06,.05,.135]);mesh(G_SPH,dark,ft,[0,-.072,.052],[.058,.014,.13])}
    if(L.legwraps)mesh(G_CYL,mat(L.legwraps,{roughness:.9}),kn,[0,-.33,0],[.058,.1,.058])}
  /* torso */
  const spine=joint(hips,'spine',[0,.08,0],J),chest=joint(spine,'chest',[0,.2,0],J);
  const tw=[1.12*b.w,1,.72*b.w];
  mesh(lathe('abdomen',PROF.abdomen),L.sports||L.bare?skin:top,spine,[0,0,0],tw);
  if(L.sports){mesh(lathe('band',PROF.band),top,chest,[0,0,.003],[tw[0]*1.02,1,tw[2]*1.06]);mesh(lathe('chest',PROF.chest),skin,chest,[0,0,0],tw)}
  else if(L.tank){mesh(lathe('chest',PROF.chest),skin,chest,[0,0,0],tw);mesh(lathe('band',PROF.band),top,chest,[0,-.045,.002],[tw[0]*1.025,1.08,tw[2]*1.07]);for(const x of[-1,1])mesh(G_BOX,top,chest,[x*.09*b.w,.24,0],[.035,.08,.2*b.w],[0,0,x*-.25])}
  else mesh(lathe('chest',PROF.chest),L.bare?skin:top,chest,[0,0,0],tw);
  if(L.pecs&&L.bare)for(const x of[-1,1])mesh(G_SPH,skin,chest,[x*.078*b.w,.15,.1*b.w],[.08*b.w,.055,.04]);
  if(L.gi){/* a martial-arts jacket: lapels and a skirt of cloth over the hips */mesh(G_BOX,top2,chest,[.03,.08,.118*b.w],[.03,.26,.012],[0,0,-.35]);mesh(G_BOX,top2,chest,[-.03,.08,.118*b.w],[.03,.26,.012],[0,0,.35]);
    mesh(G_CYL,top,hips,[0,-.03,0],[.18*b.w,.18,.13*b.w])}
  if(L.coat)mesh(G_CYL,top,hips,[0,-.13,0],[.19*b.w,.32,.14*b.w]);
  if(L.armor){const am=mat(L.armor,{roughness:.3,metalness:.8});mesh(G_SPH,am,chest,[0,.1,.02],[.2*b.w,.2,.135*b.w]);mesh(G_SPH,am,spine,[0,.06,.01],[.155*b.w,.13,.115*b.w]);
    for(const x of[-1,1])mesh(G_SPH,am,chest,[x*.2*b.w,.21,0],[.1,.07,.1]);mesh(G_CYL,am,hips,[0,-.08,0],[.18*b.w,.16,.13*b.w])}
  if(L.vest)mesh(G_SPH,mat(L.vest,{roughness:.7}),chest,[0,.08,.01],[.19*b.w,.19,.128*b.w]).scale.set(.19*b.w,.19,.128*b.w);
  if(L.scarf){const sm=mat(L.scarf,{roughness:.9});mesh(new THREE.TorusGeometry(.09,.035,8,20),sm,chest,[0,.28,0],[1,1,1],[Math.PI/2,0,0]);mesh(G_BOX,sm,chest,[.05,.2,-.1],[.08,.22,.02],[.3,0,.2])}
  /* neck and head */
  const neck=joint(chest,'neck',[0,.27,0],J),head=joint(neck,'head',[0,.09,0],J);
  mesh(G_CYL,skin,neck,[0,.02,0],[.058*Math.min(1.25,b.w),.12,.058*Math.min(1.25,b.w)]);
  mesh(G_SPH,skin,head,[0,.11,0],[.1,.122,.112]);
  mesh(G_SPH,skin,head,[0,.052,.018],[.076,.064,.08]);
  mesh(G_SPH,skin,head,[0,.085,.112],[.016,.024,.02]);
  for(const x of[-1,1]){mesh(G_SPH_LO,skin,head,[x*.1,.1,0],[.018,.03,.02]);
    mesh(G_SPH_LO,white,head,[x*.038,.115,.093],[.019,.013,.01]);mesh(G_SPH_LO,mat(L.eyes||'#3a2618',{roughness:.2}),head,[x*.038,.115,.1],[.009,.009,.006]);
    mesh(G_BOX,hair,head,[x*.04,.142,.1],[.04,.008,.012],[0,0,x*-.12])}
  mesh(G_BOX,mat(mixc(L.skin,'#7a2a2a',.45),{roughness:.5}),head,[0,.05,.107],[.04,.008,.01]);
  hairStyle(L,head,hair,mat,skin);
  if(L.beard)mesh(G_SPH,hair,head,[0,.03,.05],[.088,.075,.08]);
  if(L.mask)mesh(G_SPH,mat(L.mask,{roughness:.8}),head,[0,.06,.03],[.103,.06,.1]);
  if(L.headband){const hb=mat(L.headband,{roughness:.85});mesh(new THREE.TorusGeometry(.108,.014,8,28),hb,head,[0,.15,0],[1,1.05,1],[Math.PI/2+.12,0,0]);mesh(G_BOX,hb,head,[.02,.12,-.12],[.03,.1,.008],[.5,0,.3]);mesh(G_BOX,hb,head,[-.02,.11,-.125],[.03,.12,.008],[.6,0,-.2])}
  /* arms */
  const arms=[['L',1],['R',-1]];J.handTip={};
  for(const[s,x]of arms){const sh=joint(chest,'sh'+s,[x*.2*b.w,.2,0],J),el=joint(sh,'el'+s,[0,-.3*b.arm**.3,0],J),hd=joint(el,'hd'+s,[0,-.27,0],J);
    const sleeve=L.tank||L.sports||L.bare?skin:top,fore=L.longSleeves?top:skin;
    mesh(G_SPH,sleeve,sh,[x*.01,-.02,0],[.068*b.arm,.068*b.arm,.066*b.arm]);
    limb(sh,.058*b.arm,.31,sleeve);mesh(G_SPH,L.longSleeves?top:sleeve,el,[0,0,0],[.05*b.arm,.05*b.arm,.05*b.arm]);limb(el,.047*b.arm,.27,fore);
    if(L.wraps)mesh(G_CYL,mat(L.wraps,{roughness:.9}),el,[0,-.2,0],[.052,.1,.052]);
    if(L.gloves==='boxing'||L.boxing){mesh(G_SPH,mat(L.boxing||'#c8202a',{roughness:.35}),hd,[0,-.06,.01],[.075,.085,.08]);mesh(G_CYL,white,hd,[0,.0,0],[.05,.05,.05])}
    else{const gm=L.gloves?glove:skin;mesh(G_SPH,gm,hd,[0,-.05,.008],[.045,.06,.034]);mesh(G_SPH_LO,gm,hd,[x*-.03,-.03,.02],[.015,.03,.015],[0,0,x*.5])}
    if(L.gauntlets)mesh(G_CYL,mat(L.gauntlets,{roughness:.3,metalness:.8}),el,[0,-.17,0],[.058,.17,.058])}
  /* weapons, held in the right hand */
  if(L.weapon)J.weapon=buildWeapon(L.weapon,J.hdR,metal,mat);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true}});
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
function mixc(a,b,t){const A=new THREE.Color(a),B=new THREE.Color(b);return'#'+A.lerp(B,t).getHexString()}
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
