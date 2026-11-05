/* ================= animation =================
   Poses in plain terms (see P in rig.js). Moves name two or three poses: wind (the anticipation), hit (the strike)
   and sometimes end (the follow-through); the fighter blends between them in time with the move's frames. */
const POSE={
  /* standing and moving */
  stance:P({y:-.05,hips:[0,18],chest:[8,-14],head:[-6,-4],armL:[46,14,-20],elbowL:112,armR:[34,12,10],elbowR:118,handR:10,legL:[16,7],kneeL:20,footL:-8,legR:[-12,8],kneeR:24,footR:6}),
  stance2:P({y:-.065,hips:[0,18],chest:[10,-14],head:[-8,-4],armL:[48,14,-20],elbowL:116,armR:[36,12,10],elbowR:122,handR:10,legL:[17,7],kneeL:24,footL:-8,legR:[-12,8],kneeR:28,footR:6}),
  stanceW:P({y:-.06,hips:[0,20],chest:[8,-16],head:[-6,-4],armL:[30,20,-20],elbowL:80,armR:[40,8,0],elbowR:50,handR:-30,legL:[18,7],kneeL:22,footL:-8,legR:[-12,8],kneeR:26,footR:6}),
  stanceW2:P({y:-.075,hips:[0,20],chest:[10,-16],head:[-8,-4],armL:[32,20,-20],elbowL:84,armR:[42,8,0],elbowR:52,handR:-34,legL:[19,7],kneeL:26,footL:-8,legR:[-12,8],kneeR:30,footR:6}),
  crouch:P({y:-.38,hips:[10,10],chest:[22,-10],head:[-18],armL:[40,20],elbowL:100,armR:[30,20],elbowR:100,legL:[70,8],kneeL:120,footL:-50,legR:[30,10],kneeR:130,footR:-10}),
  jsq:P({y:-.22,hips:[8],chest:[16],head:[-10],armL:[-20,20],elbowL:30,armR:[-20,20],elbowR:30,legL:[40,6],kneeL:70,footL:-30,legR:[30,6],kneeR:70,footR:-30}),
  jump:P({y:.02,chest:[-6],head:[-4],armL:[30,40],elbowL:40,armR:[20,40],elbowR:40,legL:[50,6],kneeL:80,footL:20,legR:[-8,6],kneeR:50,footR:30}),
  fall:P({y:0,chest:[4],head:[4],armL:[20,55],elbowL:30,armR:[20,55],elbowR:30,legL:[20,8],kneeL:30,footL:20,legR:[-10,8],kneeR:40,footR:30}),
  land:P({y:-.3,hips:[10],chest:[24],head:[-14],armL:[20,30],elbowL:40,armR:[20,30],elbowR:40,legL:[50,10],kneeL:90,footL:-40,legR:[40,10],kneeR:90,footR:-40}),
  /* defending */
  shield:P({y:-.14,hips:[4,20],chest:[14,-20],head:[-10],armL:[70,20],elbowL:120,armR:[70,10],elbowR:125,legL:[25,10],kneeL:40,footL:-15,legR:[-10,10],kneeR:40,footR:5}),
  dodge:P({y:-.25,hips:[-10],chest:[-24,30],head:[10],armL:[40,30],elbowL:90,armR:[50,30],elbowR:100,legL:[20,14],kneeL:50,legR:[-20,14],kneeR:50}),
  roll:P({y:-.35,hips:[40],chest:[40],head:[30],armL:[60,10],elbowL:120,armR:[60,10],elbowR:120,legL:[100,4],kneeL:140,legR:[90,4],kneeR:140}),
  adodge:P({y:0,hips:[20],chest:[24],head:[10],armL:[70,10],elbowL:120,armR:[70,10],elbowR:120,legL:[70,4],kneeL:120,legR:[60,4],kneeR:120}),
  /* getting hit */
  hurt:P({y:-.04,hips:[-14],chest:[-22,10],head:[-26],armL:[40,60],elbowL:40,armR:[-30,50],elbowR:50,legL:[20,10],kneeL:30,legR:[-25,10],kneeR:40}),
  hurt2:P({y:-.08,hips:[18],chest:[28,-10],head:[24],armL:[-20,40],elbowL:60,armR:[-30,30],elbowR:40,legL:[-10,10],kneeL:40,legR:[30,10],kneeR:50}),
  tumble:P({y:0,hips:[-10],chest:[-20],head:[-30],armL:[150,40],elbowL:20,armR:[130,60],elbowR:30,legL:[40,20],kneeL:50,legR:[-30,20],kneeR:20}),
  helpless:P({y:0,chest:[-10],head:[-20],armL:[160,30],elbowL:20,armR:[150,30],elbowR:20,legL:[10,10],kneeL:20,legR:[-10,10],kneeR:30,footL:30,footR:30}),
  dizzy:P({y:-.1,hips:[6],chest:[18,0,10],head:[20,0,14],armL:[-10,20],elbowL:20,armR:[-10,20],elbowR:20,legL:[5,10],kneeL:20,legR:[-5,10],kneeR:20}),
  lie:P({y:-.78,hips:[-88],chest:[-4],head:[-10],armL:[160,30],elbowL:20,armR:[160,30],elbowR:20,legL:[0,10],kneeL:10,legR:[0,10],kneeR:30}),
  /* ledges and grabs */
  hang:P({y:-.12,chest:[-6],head:[-30],armL:[175,10],elbowL:10,armR:[175,-4],elbowR:10,legL:[10,8],kneeL:30,footL:30,legR:[-6,8],kneeR:40,footR:30}),
  climb:P({y:-.2,hips:[30],chest:[30],head:[-10],armL:[60,20],elbowL:60,armR:[60,20],elbowR:60,legL:[90,6],kneeL:110,legR:[-10,6],kneeR:60}),
  grab:P({y:-.06,hips:[6,10],chest:[22,-10],head:[-14],armL:[85,10],elbowL:20,armR:[85,10],elbowR:20,legL:[30,8],kneeL:30,legR:[-20,8],kneeR:30}),
  hold:P({y:-.08,hips:[4,10],chest:[14,-6],head:[-8],armL:[70,0],elbowL:70,armR:[75,0],elbowR:60,legL:[24,10],kneeL:30,legR:[-16,10],kneeR:30}),
  held:P({y:-.04,hips:[-10],chest:[-14],head:[-20],armL:[20,30],elbowL:40,armR:[20,30],elbowR:40,legL:[10,8],kneeL:20,legR:[-10,8],kneeR:20}),
  /* the end of a match */
  win:P({y:0,chest:[-8],head:[-14],armL:[170,20],elbowL:10,armR:[60,10],elbowR:120,legL:[10,10],legR:[-6,10],kneeR:10}),
  win2:P({y:0,hips:[0,20],chest:[0,-20],head:[-6],armL:[40,10],elbowL:140,armR:[80,10],elbowR:20,handR:40,legL:[14,12],kneeL:20,legR:[-14,12],kneeR:20}),
  clap:P({y:0,chest:[6],head:[6],armL:[60,-10],elbowL:80,armR:[60,-10],elbowR:80,legL:[4,8],legR:[-4,8]}),
  /* the A attacks */
  jabW:P({y:-.06,hips:[0,26],chest:[8,-30],head:[-6],armL:[46,14],elbowL:110,armR:[30,10],elbowR:130,legL:[18,7],kneeL:24,legR:[-14,8],kneeR:26}),
  jab1:P({y:-.06,hips:[0,6],chest:[10,10],head:[-8,-6],armL:[50,12],elbowL:110,armR:[88,4,0],elbowR:4,legL:[20,7],kneeL:24,legR:[-14,8],kneeR:24}),
  jab2:P({y:-.06,hips:[0,30],chest:[10,-34],head:[-8,6],armL:[88,4],elbowL:4,armR:[40,12],elbowR:120,legL:[20,7],kneeL:24,legR:[-14,8],kneeR:24}),
  jab3W:P({y:-.04,hips:[0,30],chest:[-4,-10],head:[-4],armL:[40,30],elbowL:80,armR:[20,30],elbowR:90,legL:[-10,6],kneeL:30,legR:[60,4],kneeR:110,footR:20}),
  jab3:P({y:.02,hips:[-6,40],chest:[-12,-20],head:[0,-10],armL:[30,40],elbowL:70,armR:[-10,40],elbowR:60,legL:[-6,6],kneeL:14,footL:20,legR:[96,4],kneeR:4,footR:40}),
  ftiltW:P({y:-.08,hips:[0,30],chest:[6,-34],head:[-8],armL:[60,10],elbowL:90,armR:[-30,20],elbowR:80,legL:[24,7],kneeL:30,legR:[-20,8],kneeR:30}),
  ftilt:P({y:-.1,hips:[4,-10],chest:[16,24],head:[-10,-10],armL:[-10,30],elbowL:60,armR:[90,0],elbowR:4,handR:30,legL:[40,7],kneeL:40,footL:-20,legR:[-30,8],kneeR:20}),
  utiltW:P({y:-.18,hips:[8],chest:[14,-20],head:[-6],armL:[30,20],elbowL:80,armR:[-10,20],elbowR:100,legL:[30,8],kneeL:60,legR:[-10,8],kneeR:60}),
  utilt:P({y:.02,hips:[-8],chest:[-16,10],head:[-28],armL:[20,30],elbowL:60,armR:[172,4],elbowR:10,handR:20,legL:[10,8],kneeL:10,footL:20,legR:[-10,8],kneeR:10,footR:30}),
  dtiltW:P({y:-.34,hips:[16,20],chest:[24,-16],head:[-16],armL:[40,30],elbowL:80,armR:[30,30],elbowR:80,legL:[50,10],kneeL:120,legR:[20,14],kneeR:120}),
  dtilt:P({y:-.46,hips:[30,10],chest:[30,-10],head:[-30],armL:[-20,60],elbowL:30,armR:[40,30],elbowR:60,legL:[100,4],kneeL:20,footL:30,legR:[10,20],kneeR:150}),
  dashA:P({y:-.12,hips:[20],chest:[30],head:[-26],armL:[-40,30],elbowL:60,armR:[110,0],elbowR:4,handR:30,legL:[80,4],kneeL:30,legR:[-40,6],kneeR:40}),
  fsmashW:P({y:-.14,hips:[-6,40],chest:[-10,-50],head:[-6,20],armL:[60,20],elbowL:90,armR:[-60,30],elbowR:60,legL:[30,10],kneeL:40,legR:[-30,10],kneeR:40}),
  fsmash:P({y:-.16,hips:[10,-30],chest:[24,40],head:[-14,-20],armL:[-30,30],elbowL:50,armR:[92,0],elbowR:0,handR:30,legL:[50,10],kneeL:50,footL:-20,legR:[-40,10],kneeR:10}),
  usmashW:P({y:-.36,hips:[14],chest:[30],head:[-10],armL:[-20,30],elbowL:60,armR:[-30,30],elbowR:60,legL:[50,10],kneeL:110,legR:[40,10],kneeR:110}),
  usmash:P({y:.12,hips:[-10],chest:[-20],head:[-36],armL:[165,20],elbowL:10,armR:[170,10],elbowR:5,legL:[0,6],kneeL:0,footL:40,legR:[0,6],kneeR:0,footR:40}),
  dsmashW:P({y:-.3,hips:[10,-30],chest:[20,30],head:[-10],armL:[50,40],elbowL:60,armR:[50,40],elbowR:60,legL:[40,14],kneeL:100,legR:[30,14],kneeR:100}),
  dsmash:P({y:-.5,hips:[20,60],chest:[30,-40],head:[-20],armL:[0,80],elbowL:10,armR:[0,80],elbowR:10,legL:[90,40],kneeL:10,legR:[-80,40],kneeR:10}),
  nair:P({y:0,hips:[10],chest:[10],head:[-10],armL:[40,70],elbowL:20,armR:[40,70],elbowR:20,legL:[80,20],kneeL:10,footL:30,legR:[-50,20],kneeR:20}),
  fair:P({y:0,hips:[-10],chest:[-10],head:[-10],armL:[40,30],elbowL:60,armR:[60,30],elbowR:60,legL:[10,6],kneeL:60,legR:[100,4],kneeR:0,footR:40}),
  fairW:P({y:0,hips:[10],chest:[10],armL:[40,30],elbowL:60,armR:[30,30],elbowR:60,legL:[50,6],kneeL:90,legR:[60,4],kneeR:120}),
  bair:P({y:0,hips:[30],chest:[30,10],head:[-30,-30],armL:[60,40],elbowL:40,armR:[60,40],elbowR:40,legL:[60,6],kneeL:100,legR:[-90,6],kneeR:0,footR:-30}),
  uairW:P({y:0,hips:[-20],chest:[20],head:[10],armL:[20,40],elbowL:60,armR:[20,40],elbowR:60,legL:[90,6],kneeL:120,legR:[80,6],kneeR:120}),
  uair:P({y:0,hips:[-50],chest:[-40],head:[-40],armL:[120,40],elbowL:20,armR:[120,40],elbowR:20,legL:[160,4],kneeL:0,footL:40,legR:[40,6],kneeR:80}),
  dairW:P({y:0,hips:[-10],chest:[-10],head:[20],armL:[120,40],elbowL:30,armR:[120,40],elbowR:30,legL:[80,6],kneeL:140,legR:[70,6],kneeR:140}),
  dair:P({y:0,hips:[10],chest:[14],head:[30],armL:[140,40],elbowL:20,armR:[140,40],elbowR:20,legL:[10,4],kneeL:0,footL:60,legR:[-6,4],kneeR:0,footR:60}),
  /* weapon swings (the blade sits in the right hand) */
  slashW:P({y:-.1,hips:[0,30],chest:[-6,-40],head:[-8,16],armL:[40,20],elbowL:90,armR:[150,30],elbowR:40,handR:40,legL:[26,8],kneeL:30,legR:[-20,8],kneeR:30}),
  slash:P({y:-.14,hips:[8,-20],chest:[22,30],head:[-12,-14],armL:[-20,30],elbowL:50,armR:[40,10],elbowR:4,handR:-40,legL:[44,8],kneeL:46,footL:-20,legR:[-34,8],kneeR:16}),
  thrust:P({y:-.14,hips:[6,-20],chest:[16,26],head:[-10,-14],armL:[-40,30],elbowL:40,armR:[92,0],elbowR:0,handR:-88,legL:[50,8],kneeL:50,footL:-20,legR:[-40,8],kneeR:10}),
  upslash:P({y:.04,hips:[-8],chest:[-16,10],head:[-28],armL:[20,30],elbowL:60,armR:[176,6],elbowR:0,handR:-90,legL:[10,8],kneeL:10,legR:[-10,8],kneeR:10}),
  lowslash:P({y:-.42,hips:[24,0],chest:[30,10],head:[-26],armL:[20,40],elbowL:60,armR:[50,30],elbowR:0,handR:-70,legL:[80,8],kneeL:100,legR:[-10,14],kneeR:140}),
  /* specials */
  cast:P({y:-.1,hips:[0,10],chest:[10,-6],head:[-10],armL:[86,6],elbowL:6,handL:-60,armR:[86,4],elbowR:6,handR:-60,legL:[30,8],kneeL:30,legR:[-24,8],kneeR:30}),
  castW:P({y:-.14,hips:[0,40],chest:[0,-50],head:[-6,30],armL:[20,10],elbowL:120,armR:[-40,30],elbowR:120,handR:-40,legL:[26,8],kneeL:40,legR:[-20,8],kneeR:40}),
  chargeW:P({y:-.2,hips:[-4,50],chest:[-10,-60],head:[-8,40],armL:[60,10],elbowL:100,armR:[-70,40],elbowR:90,legL:[34,10],kneeL:50,legR:[-30,10],kneeR:50}),
  punch:P({y:-.18,hips:[14,-30],chest:[30,40],head:[-24,-30],armL:[-50,30],elbowL:40,armR:[90,-4],elbowR:0,legL:[60,8],kneeL:50,footL:-30,legR:[-50,8],kneeR:10}),
  rise:P({y:.05,hips:[-12],chest:[-16,20],head:[-34],armL:[30,40],elbowL:70,armR:[175,4],elbowR:0,legL:[60,6],kneeL:90,legR:[-10,6],kneeR:30,footR:40}),
  spinkick:P({y:0,hips:[-8,0],chest:[-6],head:[-6],armL:[20,80],elbowL:20,armR:[20,80],elbowR:20,legL:[-8,6],kneeL:30,legR:[90,10],kneeR:0,footR:40}),
  knee:P({y:0,hips:[10],chest:[14],head:[-12],armL:[60,20],elbowL:110,armR:[70,20],elbowR:110,legL:[110,4],kneeL:150,footL:40,legR:[-30,6],kneeR:30}),
  flipkick:P({y:0,hips:[-30],chest:[-30],head:[-40],armL:[150,40],elbowL:20,armR:[150,40],elbowR:20,legL:[160,4],kneeL:0,footL:40,legR:[60,6],kneeR:90}),
  slam:P({y:-.4,hips:[24],chest:[34],head:[-10],armL:[60,40],elbowL:30,armR:[60,40],elbowR:30,legL:[60,20],kneeL:110,legR:[40,20],kneeR:110}),
  splash:P({y:0,hips:[60],chest:[30],head:[-30],armL:[90,70],elbowL:10,armR:[90,70],elbowR:10,legL:[-10,20],kneeL:20,legR:[-10,20],kneeR:20}),
  counter:P({y:-.12,hips:[-4,30],chest:[0,-36],head:[-8,10],armL:[100,10],elbowL:70,armR:[60,30],elbowR:100,legL:[20,8],kneeL:30,legR:[-20,8],kneeR:30}),
  palm:P({y:-.16,hips:[6,-20],chest:[14,30],head:[-10,-10],armL:[-20,30],elbowL:60,armR:[90,0],elbowR:0,handR:-80,legL:[44,8],kneeL:40,legR:[-30,8],kneeR:20}),
  throwF:P({y:-.1,hips:[10,-30],chest:[20,40],head:[-14,-20],armL:[90,0],elbowL:10,armR:[90,0],elbowR:10,legL:[40,8],kneeL:40,legR:[-30,8],kneeR:20}),
  throwU:P({y:.02,hips:[-10],chest:[-20],head:[-30],armL:[170,10],elbowL:10,armR:[170,10],elbowR:10,legL:[6,8],kneeL:10,legR:[-6,8],kneeR:10}),
  throwB:P({y:-.1,hips:[-20,80],chest:[-30,80],head:[-20,40],armL:[100,30],elbowL:20,armR:[100,30],elbowR:20,legL:[20,8],kneeL:30,legR:[-30,8],kneeR:30}),
  throwD:P({y:-.3,hips:[30],chest:[40],head:[20],armL:[40,10],elbowL:20,armR:[40,10],elbowR:20,legL:[50,10],kneeL:90,legR:[30,10],kneeR:90}),
  staffspin:P({y:-.06,hips:[0,10],chest:[6,-10],head:[-8],armL:[80,10],elbowL:40,armR:[80,-6],elbowR:40,handR:-90,legL:[24,8],kneeL:26,legR:[-18,8],kneeR:26}),
};
/* walking and running are drawn from a phase that advances with the distance travelled */
function cyclePose(ph,run,out){const s=Math.sin(ph),c=Math.cos(ph),a=run?1:.55,o=out||new Float32Array(PK.length);o.fill(0);
  const set=(k,v)=>{o[IX[k]]=v};
  set('y',(run?-.06:-.02)-Math.abs(c)*.04*a);set('hips1',s*8*a);set('chest0',run?18:6);set('chest1',-s*10*a);set('head0',run?-12:-4);
  set('legL0',s*38*a);set('legR0',-s*38*a);set('kneeL',(run?26:12)+Math.max(0,-c)*60*a+(s<0?20*a:0));set('kneeR',(run?26:12)+Math.max(0,c)*60*a+(s>0?20*a:0));
  set('footL',s>0?-10:20*a);set('footR',s<0?-10:20*a);
  set('armL0',-s*(run?50:22));set('armR0',s*(run?50:22));set('armL1',10);set('armR1',10);set('elbowL',run?90:30);set('elbowR',run?90:30);
  return o}
/* the pose a fighter is in this frame (before blending) */
const _tmp=new Float32Array(PK.length),_tmp2=new Float32Array(PK.length);
function sampleMove(m,out){const d=m.def,a=d.anim||{},f=m.f,s=d.s??6,ac=d.a??3,len=m.len||d.len||(s+ac+(d.r??12));
  const W=POSE[a.wind]||POSE.stance,Hh=POSE[a.hit]||POSE.stance,E=POSE[a.end||a.hit]||Hh,B=POSE.stance;
  if(a.fn)return a.fn(m,out);
  if(f<s){const t=f/Math.max(1,s);return t<.65?mixPose(B,W,ease(t/.65),out):mixPose(W,Hh,ease((t-.65)/.35),out)}
  if(f<s+ac){return mixPose(Hh,E,(f-s)/Math.max(1,ac),out)}
  const t=clamp((f-s-ac)/Math.max(1,len-s-ac),0,1);return mixPose(E,m.air?POSE.fall:B,ease(t),out)}
