/* ================= the locker room: make Milo yours =================
   Every choice is free. Winning a fight unlocks that fighter's gloves; finishing the story unlocks a crown tattoo
   and gold trunks. The look is saved with the game and shows in the ring (from behind), on the map and in the story. */
const LOOK_DEF={skin:'#8a5536',hair:'curly',hairCol:'#1c130f',facial:'none',eye:'#2a1a10',trunks:'#1f3a7a',trim:'#f2c14e',gloves:'#d8322b',tattoo:'none',outCol:'#35507a',nick:'THE BELL'};
const NAMES={curly:'CURLY TOP',fade:'HIGH FADE',cornrows:'CORNROWS',mohawk:'MOHAWK',buzz:'BUZZ CUT',afro:'AFRO',locs:'LOCS',bald:'BALD',none:'CLEAN',stubble:'STUBBLE',mustache:'MUSTACHE',goatee:'GOATEE',beard:'FULL BEARD',
  anchor:'ANCHOR',bell:'BRASS BELL',wings:'WINGS',tiger:'TIGER STRIPES',stars:'STARS',EMBER:'"EMBER"',crown:'CROWN ★'};
const LOOK_OPTS=[
  ['skin','SKIN',()=>['#f1c8a5','#e0a982','#c98c62','#a86e48','#8a5536','#6e4130','#55321f','#3d2417']],
  ['hair','HAIR',()=>['curly','fade','cornrows','mohawk','buzz','afro','locs','bald']],
  ['hairCol','HAIR COLOUR',()=>['#1c130f','#3a2416','#6a3d1e','#b8862e','#d8d0c0','#c8342c','#2a5ac8','#7a3ab0']],
  ['facial','FACE',()=>['none','stubble','mustache','goatee','beard']],
  ['eye','EYES',()=>['#2a1a10','#3a5a2a','#2a4a8a','#6a4a2a','#6a6a7a']],
  ['trunks','TRUNKS',()=>['#1f3a7a','#c8263a','#141018','#2f6b2a','#f4f1ea','#6a2c96','#e8662a','#2bb3a6',...(SAVE.done?['#e5bd4f']:[])]],
  ['trim','TRIM',()=>['#f2c14e','#f4f1ea','#141018','#c8263a','#3ee8ff','#ff3ea5']],
  ['gloves','GLOVES',()=>['#d8322b','#141018','#f4f1ea','#2a5ac8',...OPP.filter(o=>SAVE.beaten[o.id]).map(o=>PEOPLE[o.p].gloves)]],
  ['tattoo','BACK TATTOO',()=>['none','anchor','bell','wings','tiger','stars','EMBER',...(SAVE.done?['crown']:[])]],
  ['outCol','HOODIE',()=>['#35507a','#c8263a','#2a2a30','#2f6b2a','#e8662a','#6a2c96','#d8d0c0','#e5bd4f']],
  ['nick','NICKNAME',()=>['THE BELL','KID BRASS','ANCHOR','HAYMAKER','DOCKSIDE','IRON','THE TIDE','RUSTY']]];
function applyLook(){SAVE.look=Object.assign({},LOOK_DEF,SAVE.look||{});const m=PEOPLE.milo;Object.assign(m,SAVE.look);m.stubble=null}
applyLook();
const nick=()=>(SAVE.look&&SAVE.look.nick)||'THE BELL';
/* a second small canvas for Milo seen from behind */
const BV=document.createElement('canvas');BV.width=360;BV.height=300;const bvx=BV.getContext('2d');
function backView(x,y,w,h,t){G=bvx;bvx.setTransform(1,0,0,1,0,0);bvx.clearRect(0,0,360,300);bvx.setTransform(3,0,0,3,0,0);
  const g=bvx.createLinearGradient(0,0,0,100);g.addColorStop(0,'#2a1a3a');g.addColorStop(1,'#5a2a3a');bvx.fillStyle=g;bvx.fillRect(0,0,120,100);
  G.globalAlpha=.2;for(let i=-100;i<120;i+=9)LN(i,100,i+100,0,3,'#ff9a5a');G.globalAlpha=1;
  drawPlayer({x:0,y:Math.sin(t*3)*1,rot:0,s:.92,gl:{x:-28,y:-40,r:13},gr:{x:28,y:-40,r:13}},60,62);G=bx;
  ctx.imageSmoothingEnabled=true;ctx.drawImage(BV,x,y,w,h)}
let LK={row:0,back:'title'};
function openLocker(back){LK={row:0,back};go('locker')}
function lockerTick(){const n=LOOK_OPTS.length+1,d=menuDir();
  if(d==='up'){LK.row=(LK.row+n-1)%n;SFX.move()}else if(d==='down'){LK.row=(LK.row+1)%n;SFX.move()}
  else if((d==='left'||d==='right')&&LK.row<LOOK_OPTS.length){const[k,,f]=LOOK_OPTS[LK.row],list=f();let i=list.indexOf(SAVE.look[k]);i=(i<0?0:i+(d==='right'?1:-1)+list.length)%list.length;SAVE.look[k]=list[i];applyLook();SFX.pick();RUMBLE.dodge()}
  if(TAP('b')||TAP('start')||(TAP('a')&&LK.row===LOOK_OPTS.length)){SFX.back();saveNow();leaveLocker()}}
function leaveLocker(){const b=LK.back;if(b==='newstory'){toast('PORT EMBER AWAITS');enterMap(true)}else if(b==='map')go('map');else if(b==='gym')go('gymmenu');else go('title',titleIdx('lock'))}
function lockerDraw(){ctx.setTransform(DPR,0,0,DPR,0,0);const g=ctx.createLinearGradient(0,0,0,SH);g.addColorStop(0,'#1a1028');g.addColorStop(1,'#3a1830');ctx.fillStyle=g;ctx.fillRect(0,0,SW,SH);
  ctx.globalAlpha=.08;ctx.strokeStyle='#ffd84a';ctx.lineWidth=10*U;for(let i=-SH;i<SW;i+=34*U){ctx.beginPath();ctx.moveTo(i,SH);ctx.lineTo(i+SH,0);ctx.stroke()}ctx.globalAlpha=1;
  text('LOCKER ROOM',SW/2,8*U,20,'#ffd84a','center','#0e0a14');textB(LK.back==='newstory'?'Make Milo yours. You can change this any time at the gym.':'Change your look. It saves by itself.',SW/2,34*U,8,'#e8d8f0','center');
  const top=48*U,pw=Math.min((SW-28*U)/2.2,SH*.3),bw=pw*1.2,lx=(SW-pw-6*U-bw)/2,bx2=lx+pw+6*U;rrect(lx,top,pw,pw,10*U);ctx.fillStyle='#0e0a14';ctx.fill();portrait('milo','grin',lx+2*U,top+2*U,pw-4*U,'#e8662a');
  backView(bx2,top,bw,pw,TT);rrect(bx2,top,bw,pw,10*U);ctx.lineWidth=3*U;ctx.strokeStyle='#0e0a14';ctx.stroke();
  text('FRONT',lx+pw/2,top+pw+3*U,8,'#c8b8e0','center');text('IN THE RING',bx2+bw/2,top+pw+3*U,8,'#c8b8e0','center');
  const y0=top+pw+18*U,rh=Math.min(21*U,(SH-y0-28*U)/(LOOK_OPTS.length+1));
  LOOK_OPTS.forEach(([k,lab,f],i)=>{const y=y0+i*rh,on=i===LK.row,v=SAVE.look[k],list=f(),idx=list.indexOf(v);
    if(on){panel(10*U,y-1*U,SW-20*U,rh-1*U,'rgba(255,216,74,.16)','#ffd84a',6)}
    text(lab,18*U,y+rh*.5-7*U,10,on?'#ffd84a':'#e8e2d0','left','#0e0a14');
    const vx=SW-20*U,vc=vx-50*U;if(/^#/.test(v)){rrect(vc-20*U,y+rh*.5-6.5*U,40*U,13*U,4*U);ctx.fillStyle=v;ctx.fill();ctx.lineWidth=2*U;ctx.strokeStyle='#0e0a14';ctx.stroke()}
    else text(k==='nick'?'"'+v+'"':NAMES[v]||v,vc,y+rh*.5-6.5*U,9,'#fff','center','#0e0a14');
    if(on){text('◀',vc-50*U,y+rh*.5-7*U,10,'#ffd84a','center','#0e0a14');text('▶',vx,y+rh*.5-7*U,10,'#ffd84a','center','#0e0a14')}
    if(k==='gloves'&&idx>=4&&on){const o=OPP.find(o=>PEOPLE[o.p].gloves===v);if(o)textB('won from '+PEOPLE[o.p].name,vc,y+rh-1*U,6,'#7dff9a','center')}});
  const dy=y0+LOOK_OPTS.length*rh,on=LK.row===LOOK_OPTS.length;text((on?'▸ ':'')+'DONE',SW/2,dy+2*U,12,on?'#ffd84a':'#e8e2d0','center','#0e0a14');
  textB('▲▼ choose · ◀▶ change · B done',SW/2,SH-12*U,8,'rgba(255,255,255,.7)','center')}
