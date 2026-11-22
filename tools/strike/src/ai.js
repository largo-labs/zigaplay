/* ================= the computer player =================
   Levels 1-9: higher levels react sooner, block more, chain combos and recover better. Level 0 is the training dummy.
   Long-range fighters keep their distance and shoot; sword fighters fight at blade's length; brawlers rush in. */
const PROJ_KINDS={rocket:1,grenade:1,beam:1,shotgun:1,orb:1,snipe:1,burst:1,sticky:1,wave:1};
function aiTick(f){const P=f.pad,A=f.ai,L=f.lvl;P.pressed={};P.held.jump=true;P.held.attack=P.held.special=false;
  if(!L){P.x=0;P.up=P.down=false;P.held.block=false;return}
  const o=FT.find(g=>g!==f),M=STAGE.main;if(!o)return;
  const skill=L/9,press=(a,x=0,up=false,down=false)=>{P.pressed[a]=true;P.x=x;P.up=up;P.down=down;A.cool=Math.max(3,Math.round(24-L*2.2+rnd()*8))};
  const dx=o.x-f.x,adx=Math.abs(dx),dy=o.y-f.y,sx=sgn(dx)||f.face,g=f.c.grp;
  if(A.cool>0)A.cool--;if(A.projT>0)A.projT--;
  if(A.wait==null)A.wait=Math.round(24+rnd()*30);if(A.wait>0){A.wait--;P.x=0;P.up=P.down=false;return}
  P.held.block=false;
  if(f.st==='ko'||f.st==='held'||f.st==='hit'||f.st==='stun'||f.st==='dizzy'){P.x=0;P.up=P.down=false;return}
  if(f.st==='spawn'){if(rnd()<.03)P.x=sx;return}
  if(f.st==='ledge'){P.x=0;P.up=P.down=false;if(f.t>8+Math.round((9-L)*4)&&rnd()<.25){const r=rnd();if(r<.4)press('jump');else if(r<.7)P.x=-f.lx.side;else press('attack')}return}
  /* keep a combo going: when an attack just landed, follow up quickly */
  if(f.st==='atk'&&f.mv&&f.mv.hitAny&&rnd()<.25+skill*.6){const m=f.mv.k;
    if(m==='up'||m==='uair'){press('jump',sx);A.chase=12;return}
    if(o.st==='hit'&&adx<46){if(dy<-20)press('attack',0,true);else if(f.gr&&rnd()<.5)press('attack',sx);else press('attack');A.cool=3;return}}
  if(A.chase>0){A.chase--;P.x=sx;if(!f.gr&&adx<34&&dy<-6){press('attack',0,true);A.chase=0}return}
  /* getting back to the stage */
  const off=f.x<M.x1-2||f.x>M.x2+2;
  if(off&&!f.gr){const ex=f.x<0?M.x1:M.x2,tx=sgn(ex-f.x)||1;P.x=tx;P.up=P.down=false;
    if(f.st==='help'||f.st==='sp')return;
    const far=Math.abs(ex-f.x);
    if(f.jumps>0&&f.vy>-1&&(f.y>-30||far>90)){press('jump',tx);return}
    if(f.jumps===0&&f.vy>0&&far>100&&!f.sideUsed&&f.y<10&&SIDE_ONCE[f.c.side.kind]&&f.c.side.kind!=='grab'&&rnd()<.5){press('special',tx);return}
    if(f.jumps===0&&f.vy>0&&(f.y>-10||far>40)&&!f.upUsed){press('special',far>40?tx:0,true);return}
    return}
  const nearEdge=f.gr&&((f.x<M.x1+24&&P.x<0)||(f.x>M.x2-24&&P.x>0));
  /* blocking */
  if(A.shT>0){A.shT--;P.held.block=true;P.x=0;P.up=P.down=false;
    if(o.st!=='atk'&&o.st!=='sp'&&adx<30&&rnd()<skill*.5){A.shT=0;P.held.block=true;press('attack')}return}
  if(f.gr&&(o.st==='atk'||o.st==='sp')&&adx<(g==='L'?40:55)&&Math.abs(dy)<40&&A.cool<=0&&rnd()<skill*.16){A.shT=8+Math.round(rnd()*10);P.held.block=true;return}
  /* falling through platforms toward the foe */
  if(f.gr&&f.gr.soft&&dy>24&&adx<80){A.drop=(A.drop||0)+1;P.down=A.drop%6<3;P.x=0;return}A.drop=0;
  /* how far each group likes to be */
  const want=g==='L'?110:g==='M'?30:18,reach=g==='L'?160:g==='M'?40:26;
  if(A.cool>0){let x=adx>want+20?sx:adx<want-20&&g==='L'?-sx:0;if(nearEdge)x=0;P.x=x;P.up=false;P.down=!f.gr&&f.vy>0&&dy>20;return}
  if(rnd()>.35+skill*.65){P.x=adx>want?sx:0;return}
  if(f.gr){
    if(g==='L'){
      if(adx<34){const r=rnd();if(r<.3)press('jump',-sx);else if(r<.6){f.face=sx;press('attack',-f.face)}else press('attack',0,false,true);return}
      f.face=sx;
      if(Math.abs(dy)<34&&adx<220){const r=rnd();
        if(!(A.projT>0)&&r<.18+skill*.1){A.projT=Math.round(70+rnd()*80-L*4);press('special',sx);return}
        if(r<.55)press('attack');else if(r<.75)press('attack',sx);else P.x=adx<want?-sx:sx;return}
      if(dy<-40&&adx<60){press('attack',0,true);return}
      P.x=adx>want?sx:-sx;if(nearEdge)P.x=0;if(rnd()<.03)press('jump',sx);return}
    if(adx>reach+4){
      if(PROJ_KINDS[f.c.side.kind]&&!(A.projT>0)&&adx>60&&adx<200&&Math.abs(dy)<40&&rnd()<.03+skill*.05){f.face=sx;A.projT=Math.round(80+rnd()*80-L*4);press('special',sx);return}
      if(dy<-50&&adx<60&&rnd()<.4){press('jump',sx);return}
      P.x=sx;P.up=P.down=false;if(nearEdge)P.x=0;
      if(adx<90&&rnd()<.04)press('jump',sx);return}
    if(dy<-34){f.face=sx;press('attack',0,true);return}
    if(dy<-14&&!o.gr){press('jump',sx);return}
    const r=rnd(),behind=sx!==f.face;
    if(o.st==='shield'&&r<.5){P.held.block=true;press('attack');return}
    if(behind&&r<.5){press('attack',sx);return}
    f.face=sx;
    if(r<.28)press('attack');else if(r<.48)press('attack',sx);else if(r<.6)press('attack',0,false,true);else if(r<.72)press('attack',0,true);
    else if(r<.82&&!nearEdge&&Math.abs(f.x)<(M.x2-M.x1)*.35&&!(A.projT>0&&PROJ_KINDS[f.c.side.kind])){A.projT=60;press('special',sx)}else if(r<.9)press('jump',sx);else press('attack');
    return}
  /* in the air */
  P.x=adx>8?(g==='L'&&adx<want?-sx:sx):0;P.down=f.vy>0&&dy>30&&adx<40;
  if(g==='L'&&Math.abs(dy)<26&&adx<200&&f.face===sx&&rnd()<.3){press('attack',sx);return}
  if(g==='L'&&adx<60&&dy>30&&rnd()<.3){press('attack',0,false,true);return}
  if(adx<reach+8&&Math.abs(dy)<48){
    if(dy<-18)press('attack',0,true);else if(dy>18)press('attack',0,false,true);else if(rnd()<.8)press('attack',sx);else press('attack');
    return}
  if(f.jumps>0&&dy<-30&&f.vy>-2&&rnd()<.3)press('jump',sx)}
