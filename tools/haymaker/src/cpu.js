/* ================= the CPU =================
   It plays through the same pad as you (held directions and taps), plus starting moves directly. The level (1-5)
   sets how fast it reacts, how often it picks the right block, keeps a string going, juggles and anti-airs. */
/* which specials suit which moment */
const ROLE={combo:['dash','rise','multi','flurry','freeze','proj','armor','barrage','drain','slide','beam'],juggle:['dash','rise','multi','barrage','beam'],
  far:['proj','beam','rain','pull','trap'],approach:['dash','tele','leap','slam','slide','roll','pull','barrage'],
  close:['grab','multi','freeze','flurry','armor','counter','dash','barrage','drain','quake','slide'],punish:['dash','rise','grab','multi','flurry','barrage','drain','slide']};
/* the training dummy: stands, crouches, jumps or blocks as you set it, or fights back as the CPU */
function dummyTick(f){const o=other(f),bk=o.x>f.x?'l':'r',D=M.tr.dummy;
  if(D==='crouch'||D==='blocklow')f.pad.held.d=true;else if(D==='block')f.pad.held[bk]=true;
  else if(D==='jump'){if(f.st==='idle'&&f.y>=0&&M.t%30===0)f.pad.tap.u=true}
  else if(D==='random'){if((M.t/40|0)%2)f.pad.held.d=true;else f.pad.held[bk]=true}}
function aiTick(f){const o=other(f),L=M.lvl,dx=o.x-f.x,d=Math.abs(dx),ai=f.ai,fw=dx>0?'r':'l',bk=dx>0?'l':'r';f.pad={held:{},tap:{}};
  if(M.ph!=='fight'||ai.off)return;
  if(M.tr&&M.tr.dummy!=='cpu'){dummyTick(f);return}
  if(ai.hold>0){ai.hold--;Object.assign(f.pad.held,ai.held||{})}
  /* keep a string going, once per move */
  if(f.st==='atk'){const m=f.mv;if(m&&f.hit&&!m.sp&&!m.air&&!m.fatal&&f.mf>=m.s&&ai.dec!==m){ai.dec=m;if(rnd()<.2+L*.14){
      if(m.key==='cross'&&rnd()<.55){f.pad.held.d=true;f.pad.tap.b=true}
      else if(rnd()<.35&&doSpecialAI(f,ROLE.combo))return;
      else if(m.chain){const ks=Object.keys(m.chain).filter(k=>k!=='d');if(ks.length)f.pad.tap[pick(ks)]=true}}}return}
  /* juggle someone in the air */
  if(o.st==='air'&&canAct(f)&&f.y>=0&&d<64&&rnd()<.08+L*.07){if(o.y<-30&&d<40)startMove(f,'upper');else if(!doSpecialAI(f,ROLE.juggle))startMove(f,'cross');return}
  /* see a punch or a projectile coming: block it, the right way more often at higher levels */
  const pr=M.proj.find(p=>p.o===o&&Math.abs(p.x-f.x)<90&&sgn(p.vx)===sgn(f.x-p.x));
  const threat=(o.st==='atk'&&o.mv&&o.mv.hx&&o.mf<=o.mv.s+o.mv.a&&d<74)||!!pr;
  /* a projectile on its way: send it back, roll through it or step behind */
  if(pr&&canAct(f)&&f.y>=0&&!ai.pr&&Math.abs(pr.x-f.x)<70){ai.pr=1;if(rnd()<.1+L*.12&&doSpecialAI(f,['reflect','roll','tele','shield']))return}
  if(!pr)ai.pr=0;
  if(threat&&ai.react==null&&canAct(f)&&f.y>=0)ai.react=Math.max(1,Math.round(10-L*2+rnd()*5));
  if(ai.react!=null&&--ai.react<=0){ai.react=null;const h=o.st==='atk'&&o.mv?o.mv.h:pr?pr.h:'mid';
    if(rnd()<.18+L*.15){ai.held=h==='low'?{d:true}:h==='high'&&rnd()<.4?{d:true}:{[bk]:true};ai.hold=16+L*2;Object.assign(f.pad.held,ai.held);return}
    if(rnd()<.35){ai.held=rnd()<.5?{d:true}:{[bk]:true};ai.hold=14;Object.assign(f.pad.held,ai.held);return}}
  /* jumped at: anti-air */
  const oJump=o.y<-12&&(o.vx===0||sgn(o.vx)===sgn(f.x-o.x))&&d<84;
  if(oJump&&canAct(f)&&f.y>=0&&!ai.aa){ai.aa=1;if(rnd()<.05+L*.13){if(f.ch.sp.some(s=>s.k==='rise')&&rnd()<.6)doSpecialAI(f,['rise']);else{f.pad.held.d=true;startMove(f,'upper')}return}}
  if(o.y>=0)ai.aa=0;
  /* punish a punch that missed or was blocked, while it's still coming back */
  const oRec=o.st==='atk'&&o.mv&&!o.mv.air&&o.mf>(o.mv.s||0)+(o.mv.a||0);
  if(oRec&&d<54&&canAct(f)&&f.y>=0&&!ai.pun){ai.pun=1;if(rnd()<.1+L*.17){ai.hold=0;ai.held=null;const r=rnd();
    if(r<.4)startMove(f,'jab');else if(r<.65){f.pad.held.d=true;startMove(f,'upper')}else if(!doSpecialAI(f,ROLE.punish))startMove(f,'cross');return}}
  if(!oRec)ai.pun=0;
  if(ai.hold>0||!canAct(f))return;
  if(f.y<0){if(d<46&&!ai.air&&rnd()<.25+L*.08){ai.air=1;startMove(f,rnd()<.5?'jA':'jB')}return}ai.air=0;
  if(--ai.t>0)return;
  ai.t=Math.max(3,Math.round((d<56?15:20)-L*2.9+rnd()*9));
  const r=rnd();
  if(f.hp<=f.max*.3&&!f.fatalUsed&&d<50&&o.y>=0&&r<.15+L*.06){f.pad.held.d=true;if(tryFatal(f))return}
  if(['down','getup','thrown'].includes(o.st)){if(d>70&&r<.4&&doSpecialAI(f,['trap','buff','shield','heal']))return;ai.held={[fw]:true};ai.hold=8;return}
  if(d>90&&f.hp<f.max*.6&&r<.12&&doSpecialAI(f,['heal']))return;
  if(d>80&&!f.buff&&!f.shield&&r<.1&&doSpecialAI(f,['buff','shield']))return;
  if(d>95){if(r<.3&&doSpecialAI(f,ROLE.far))return;if(r<.4&&doSpecialAI(f,ROLE.approach))return;if(r<.48){f.pad.tap.u=true;f.pad.held[fw]=true;return}
    ai.held={[fw]:true};ai.hold=14+(rnd()*20|0);return}
  if(d>52){if(r<.25&&doSpecialAI(f,ROLE.approach.concat(['proj','beam','quake'])))return;if(r<.33){startMove(f,'over');return}if(r<.4){f.pad.tap.u=true;f.pad.held[fw]=true;return}
    if(r<.5){ai.held={[bk]:true};ai.hold=10;return}ai.held={[fw]:true};ai.hold=10+(rnd()*14|0);return}
  if(d<32&&r<.12){f.pad.tap.a=f.pad.tap.b=true;return}
  if(r<.3){startMove(f,'jab');return}if(r<.42){startMove(f,'low');return}if(r<.52){startMove(f,'cross');return}if(r<.58){startMove(f,'upper');return}
  if(r<.7&&doSpecialAI(f,ROLE.close))return;
  if(r<.85){ai.held=rnd()<.5?{d:true}:{[bk]:true};ai.hold=12+L*3;return}ai.held={[bk]:true};ai.hold=10}
function doSpecialAI(f,kinds){if(f.y<0)return false;const list=f.ch.sp.map((s,i)=>[s,i]).filter(([s])=>!kinds||kinds.includes(s.k));if(!list.length||!canAct(f)&&f.st!=='atk')return false;
  const[s,i]=pick(list);if((s.k==='proj'||s.k==='pull')&&M.proj.some(p=>p.o===f&&!p.rain))return false;if(s.k==='trap'&&M.traps.some(t=>t.o===f))return false;if(s.k==='heal'&&f.hp>f.max*.8)return false;f.st='idle';return startMove(f,'sp'+i,s)}
