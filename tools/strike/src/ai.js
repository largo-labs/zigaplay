/* ================= the computer player =================
   Levels 1-9: higher levels react sooner, block more, combo and recover better. Level 0 is the training dummy. */
const PROJ_KINDS={fireball:1,boomerang:1,triple:1,beam:1,arc:1,whip:1};
function aiTick(f){const P=f.pad,A=f.ai,L=f.lvl;P.pressed={};P.held.jump=true;P.held.attack=P.held.special=false;
  if(!L){P.x=0;P.up=P.down=false;P.held.block=false;return}
  const o=FT.find(g=>g!==f),M=STAGE.main;if(!o)return;
  const press=(a,x=0,up=false,down=false)=>{P.pressed[a]=true;P.x=x;P.up=up;P.down=down;A.cool=Math.max(3,Math.round(26-L*2.4+rnd()*8))};
  const dx=o.x-f.x,adx=Math.abs(dx),dy=(o.y)-(f.y),sx=sgn(dx)||f.face,skill=L/9;
  if(A.cool>0)A.cool--;if(A.projT>0)A.projT--;
  if(A.wait==null)A.wait=Math.round(24+rnd()*30);if(A.wait>0){A.wait--;P.x=0;P.up=P.down=false;return}
  P.held.block=false;
  if(f.st==='ko'||f.st==='held'||f.st==='hit'||f.st==='stun'||f.st==='dizzy'){P.x=0;P.up=P.down=false;return}
  if(f.st==='spawn'){if(rnd()<.03)P.x=sx;return}
  if(f.st==='ledge'){P.x=0;P.up=P.down=false;if(f.t>8+Math.round((9-L)*4)&&rnd()<.25){const r=rnd();if(r<.4)press('jump');else if(r<.7)P.x=-f.lx.side;else press('attack')}return}
  /* getting back to the stage */
  const off=f.x<M.x1-2||f.x>M.x2+2;
  if(off&&!f.gr){const ex=f.x<0?M.x1:M.x2,tx=sgn(ex-f.x)||1;P.x=tx;P.up=P.down=false;
    if(f.st==='help'||f.st==='sp')return;
    const far=Math.abs(ex-f.x);
    if(f.jumps>0&&f.vy>-1&&(f.y>-30||far>90)){press('jump',tx);return}
    if(f.jumps===0&&f.vy>0&&far>100&&!f.sideUsed&&f.y<10&&{dash:1,charge:1,drill:1,roll:1}[f.c.side.kind]&&rnd()<.5){press('special',tx);return}
    if(f.jumps===0&&f.vy>0&&(f.y>-10||far>40)&&!f.upUsed){press('special',far>40?tx:0,true);return}
    return}
  /* stay on the stage */
  const nearEdge=f.gr&&((f.x<M.x1+24&&P.x<0)||(f.x>M.x2-24&&P.x>0));
  /* blocking */
  if(A.shT>0){A.shT--;P.held.block=true;P.x=0;P.up=P.down=false;
    if(o.st!=='atk'&&o.st!=='sp'&&adx<30&&rnd()<skill*.5){A.shT=0;P.held.block=true;press('attack');}return}
  if(f.gr&&(o.st==='atk'||o.st==='sp')&&adx<50&&Math.abs(dy)<40&&A.cool<=0&&rnd()<skill*.18){A.shT=8+Math.round(rnd()*10);P.held.block=true;return}
  /* falling through platforms toward the foe */
  if(f.gr&&f.gr.soft&&dy>24&&adx<80){A.drop=(A.drop||0)+1;P.down=A.drop%6<3;P.x=0;return}A.drop=0;
  if(A.cool>0){/* keep moving while waiting */if(adx>30)P.x=sx;else P.x=rnd()<.2?-sx:0;if(nearEdge)P.x=0;P.up=false;P.down=!f.gr&&f.vy>0&&dy>20;return}
  if(rnd()>.35+skill*.65){P.x=adx>30?sx:0;return}
  const reach=26+(WEAP[f.c.weapon]||WEAP.none).reach;
  if(f.gr){
    if(adx>reach+4){
      if(PROJ_KINDS[f.c.side.kind]&&!(A.projT>0)&&adx>70&&adx<200&&Math.abs(dy)<40&&rnd()<.03+skill*.05){f.face=sx;A.projT=Math.round(80+rnd()*80-L*4);press('special',sx);return}
      if(dy<-50&&adx<60&&rnd()<.4){press('jump',sx);return}
      P.x=sx;P.up=P.down=false;if(nearEdge)P.x=0;
      if(adx<90&&rnd()<.04)press('jump',sx);return}
    f.face=sx;
    if(dy<-34){press('attack',0,true);return}
    if(dy<-14&&!o.gr){press('jump',sx);return}
    const r=rnd();
    if(o.st==='shield'&&r<.5){P.held.block=true;press('attack');return}
    if(r<.22)press('attack');else if(r<.44)press('attack',sx);else if(r<.56)press('attack',0,false,true);
    else if(r<.68&&!(A.projT>0&&PROJ_KINDS[f.c.side.kind])){A.projT=60;press('special',sx)}else if(r<.78)press('special',0,false,true);else if(r<.88)press('jump',sx);else press('attack',0,true);
    return}
  /* in the air */
  P.x=adx>8?sx:0;P.down=f.vy>0&&dy>30&&adx<40;
  if(adx<reach+6&&Math.abs(dy)<44){
    if(dy<-18)press('attack',0,true);else if(dy>18)press('attack',0,false,true);else if(rnd()<.8)press('attack',sx);else press('attack');
    return}
  if(f.jumps>0&&dy<-30&&f.vy>-2&&rnd()<.3)press('jump',sx)}
