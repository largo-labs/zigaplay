/* ================= the CPU =================
   It plays the jab duel through the same taps as you. The level (1-5) sets how often it blocks a jab in time
   (less often against a quick jab),
   how often it blocks too early and gets stunned, how fast it jabs into an opening, and how quickly it presses B
   and the four A punches after a jab lands. */
function aiTick(f){const o=other(f),L=M.lvl,ai=f.ai;f.pad={tap:{}};const p=f.pad.tap;if(M.ph!=='fight')return;
  if(M.tr&&M.tr.dummy!=='cpu'){dummyTick(f);return}
  /* a jab coming: decide once whether (and when) to block it */
  if(o.st==='lunge'){if(ai.seen!==o.jabId+'/'+o.i){ai.seen=o.jabId+'/'+o.i;ai.blockAt=rnd()<clamp(.3+.13*L+(o.W-48)*.006,.1,.97)?Math.round(o.W*(.3+rnd()*(.62-.07*L))):-1}
    if(ai.blockAt>=0&&o.t>=ai.blockAt&&f.st==='idle'){p.block=true;ai.blockAt=-1}}
  /* now and then a nervous block with nothing coming (more at low levels) */
  else if(f.st==='idle'&&o.st==='idle'&&rnd()<.0016*(5-L)/4)p.block=true;
  /* jab: straight away into an opening, otherwise every so often */
  if(f.st==='idle'&&f.cool<=0&&!p.block){
    if(o.stunT>0&&o.st==='stun'||o.cool>0&&o.st==='idle'&&rnd()<.03+.025*L)p.jab=true;
    else if(--ai.t<=0){ai.t=Math.round(36+rnd()*(120-L*14));if(['idle','back','stun'].includes(o.st))p.jab=true}}
  /* a jab landed: B, then the four punches */
  if(f.st==='jabbed'){if(ai.bAt==null)ai.bAt=rnd()<.55+.09*L?Math.round(5+rnd()*(40-L*6)):999;if(f.t>=ai.bAt){p.b=true;ai.bAt=null}}else ai.bAt=null;
  if(f.st==='combo'){const iv=ai.iv||(ai.iv=Math.max(8,Math.round(22-L*2.6+rnd()*4)));if(f.t>=4&&(f.t-4)%iv===0)p.a=true}else ai.iv=0}
/* the training dummy: stands still, blocks every jab, keeps jabbing at you, or fights back as the CPU */
function dummyTick(f){const o=other(f),D=M.tr.dummy,p=f.pad.tap,ai=f.ai;
  if(D==='block'&&o.st==='lunge'&&f.st==='idle'&&o.t>=Math.round(o.W*.5))p.block=true;
  if(D==='jab'){if(f.st==='idle'&&f.cool<=0&&--ai.t<=0){ai.t=80;p.jab=true}if(f.st==='jabbed'&&f.t===14)p.b=true;if(f.st==='combo'&&f.t%13===4)p.a=true}}
