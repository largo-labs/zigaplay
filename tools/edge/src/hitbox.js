/* ================= hitboxes that follow the body =================
   Each fighter carries a body-less copy of its skeleton, posed every frame exactly as it is drawn (seen side-on).
   Hurtboxes are capsules along its torso, head, arms and legs, so ducking, leaning and lying down really move them.
   An attack's hitboxes ride on the fist, foot, knee or blade that is swinging, with a smaller one on the limb behind it. */
const _hw=new THREE.Vector3();
const SIM_PTS=['hips','neck','headC','shL','elL','fistL','shR','elR','fistR','thL','knL','toeL','thR','knR','toeR'];
const EXT={fistL:'elL',fistR:'elR',toeL:'knL',toeR:'knR',tip:'blade',butt:'blade'};
const MIDOF={fistL:'elL',fistR:'elR',toeL:'knL',toeR:'knR'};
function simInit(f){f.sim=simRig(f.ch.look);f.simV={ph:0,tgt:new Float32Array(PK.length)};f.simAt=-1;f.P={};f.HB=calibrate(f)}
function simPose(f,pose,x,y,face){const R=f.sim;applyPose(R,pose);R.root.position.set(x,y,0);R.root.rotation.set(0,face*Math.PI/2,0);R.root.updateMatrixWorld(true)}
function simRead(f,P,names){for(const n of names){const o=f.sim.J[n];if(!o)continue;o.getWorldPosition(_hw);P[n]=[_hw.x,_hw.y]}return P}
function simUpdate(f){const key=G.frame*64+(f.mv?f.mv.f:f.t)%64;if(f.simAt===key&&f.simSt===f.st)return;f.simAt=key;f.simSt=f.st;
  targetPose(f,f.simV);simPose(f,f.simV.tgt,f.x,f.y,f.face);simRead(f,f.P,SIM_PTS);if(f.sim.J.tip)simRead(f,f.P,['tip','blade','butt'])}
/* the body you can hit */
function hurtCaps(f){simUpdate(f);const P=f.P,S=f.sim.S,b=f.sim.b,c=[];const cap=(a,e,r)=>c.push({ax:a[0],ay:a[1],bx:e[0],by:e[1],r:r*S});
  const hp=P.hips,nk=P.neck,dx=nk[0]-hp[0],dy=nk[1]-hp[1],l=Math.hypot(dx,dy)||1;
  cap([hp[0]-dx/l*.12*S,hp[1]-dy/l*.12*S],nk,.15*b.w**.8+.02);cap(P.headC,P.headC,.125);
  for(const s of['L','R']){cap(P['sh'+s],P['el'+s],.07*b.arm);cap(P['el'+s],P['fist'+s],.06*b.arm);cap(P['th'+s],P['kn'+s],.095*b.leg);cap(P['kn'+s],P['toe'+s],.07*b.leg)}
  return c}
function segDist(px,py,c){const vx=c.bx-c.ax,vy=c.by-c.ay,l2=vx*vx+vy*vy;let t=l2?((px-c.ax)*vx+(py-c.ay)*vy)/l2:0;t=t<0?0:t>1?1:t;return Math.hypot(px-c.ax-vx*t,py-c.ay-vy*t)}
/* which part of the body carries each hitbox: chosen once per fighter from the move's own animation */
function calibrate(f){const HB={},limbs=['fistL','fistR','toeL','toeR','knL','knR'],pose=new Float32Array(PK.length),S=f.sim.S;
  for(const k in f.N){const d=f.N[k];if(!d.hb)continue;const fr=d.s+Math.floor(((d.a||1)-1)/2);
    sampleMove({def:d,f:fr,len:d.len,air:d.air},pose);simPose(f,pose,0,0,1);const P=simRead(f,{},[...limbs,'elL','elR','tip','blade','butt']);
    const cy=1.0*S,list=[];
    for(const b of d.hb){if(b.grab){list.push({x:b.x,y:b.y,r:b.r});continue}
      const rx=b.x,ry=b.y-cy,dist=Math.hypot(rx,ry);
      if(dist<.42*S){b.bind=null;list.push({x:b.x,y:b.y,r:b.r});continue}
      const dir=[rx/dist,ry/dist],pts=d.weaponFx&&P.tip?['tip','blade',...(P.butt?['butt']:[])]:limbs;
      let best=pts[0],bs=-9;for(const n of pts){const p=P[n];const sc=p[0]*dir[0]+(p[1]-cy)*dir[1];if(sc>bs){bs=sc;best=n}}
      b.bind=[[best,.9]];if(MIDOF[best])b.bind.push([MIDOF[best],.6]);if(best==='tip')b.bind.push(['blade',.85]);
      for(const[n,kk]of b.bind){const[x,y]=extend(P,n,b.r);list.push({x,y,r:b.r*kk})}}
    HB[k]=list}
  return HB}
function extend(P,n,r){let[x,y]=P[n];const base=EXT[n]&&P[EXT[n]];if(base){const dx=x-base[0],dy=y-base[1],l=Math.hypot(dx,dy)||1;x+=dx/l*r*.3;y+=dy/l*r*.3}return[x,y]}
/* this frame's hitboxes for an A attack, placed on the body; a fast swing also fills the gap since last frame */
function liveBoxes(A,m,d,auth){if(!A.sim||d.kind!=='normal'||!auth.length)return auth;simUpdate(A);const P=A.P,out=[],now=[];
  for(const b of auth){if(!b.bind){out.push(b);continue}
    for(const[n,k]of b.bind){if(!P[n])continue;const[x,y]=extend(P,n,b.r),o=Object.assign({},b,{ax:x,ay:y,r:b.r*k});out.push(o);now.push(o)}}
  if(m.prevBoxes&&m.prevF===m.f-1&&m.prevBoxes.length===now.length)now.forEach((o,i)=>{const p=m.prevBoxes[i];if(Math.hypot(p.ax-o.ax,p.ay-o.ay)>o.r*.8)out.push(Object.assign({},o,{ax:(p.ax+o.ax)/2,ay:(p.ay+o.ay)/2}))});
  m.prevBoxes=now;m.prevF=m.f;return out}
