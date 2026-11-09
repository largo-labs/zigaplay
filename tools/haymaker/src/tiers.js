/* ================= the tier list =================
   TIER_DATA comes from a round robin of CPU-vs-CPU matches at level 5 (tools/haymaker/tiers.js runs it):
   each fighter's win rate, and the tier it lands in. S is the top tenth or so, D the bottom. */
const TIER_DATA=/*@@TIERS@@*/{"games":2352,"rate":{"milo":0.479,"gus":0.396,"vex":0.25,"hal":0.656,"volk":0.531,"lola":0.313,"tide":0.635,"sable":0.646,"rook":0.74,"pip":0.469,"zora":0.281,"toro":0.281,"mika":0.354,"brick":0.479,"saint":0.625,"viper":0.344,"blaze":0.667,"echo":0.385,"rusty":0.719,"juno":0.427,"gideon":0.552,"kai":0.417,"dolly":0.375,"hex":0.396,"ace":0.354,"bones":0.604,"nyx":0.385,"duke":0.344,"tank":0.531,"lulu":0.323,"moose":0.313,"quill":0.667,"zed":0.719,"mama":0.781,"coil":0.427,"sumo":0.406,"volt":0.438,"cleo":0.438,"grit":0.729,"rocco":0.583,"sky":0.646,"mags":0.333,"otis":0.76,"rina":0.563,"dez":0.427,"hugo":0.646,"wren":0.354,"gator":0.677,"orbit":0.635},"tier":{"mama":"S","otis":"S","rook":"S","grit":"S","rusty":"S","zed":"A","gator":"A","blaze":"A","quill":"A","hal":"A","sable":"A","sky":"A","hugo":"A","tide":"A","orbit":"A","saint":"B","bones":"B","rocco":"B","rina":"B","gideon":"B","volk":"B","tank":"B","milo":"B","brick":"B","pip":"B","volt":"B","cleo":"B","juno":"B","coil":"B","dez":"B","kai":"C","sumo":"C","gus":"C","hex":"C","echo":"C","nyx":"C","dolly":"C","mika":"C","ace":"C","wren":"C","viper":"C","duke":"C","mags":"D","lulu":"D","lola":"D","moose":"D","zora":"D","toro":"D","vex":"D"}}/*@@END@@*/;
const TIER_ROWS=['S','A','B','C','D'];
const tierOf=id=>TIER_DATA.tier[id]||null;
const tierRank=id=>TIER_DATA.rate[id]!=null?TIER_DATA.rate[id]:.5;
let TL={i:0,scroll:0,pos:[]};
function tierList(){return TIER_ROWS.map(t=>({t,ids:ROSTER.map(f=>f.id).filter(id=>(tierOf(id)||'C')===t).sort((a,b)=>tierRank(b)-tierRank(a))}))}
function openTiers(){TL={i:0,scroll:0,pos:[]};go('tiers')}
function tiersTick(){const d=menuDir(),P=TL.pos;if(!P.length)return;const cur=P[TL.i]||P[0];
  if(d==='left'){TL.i=(TL.i+P.length-1)%P.length;SFX.move()}else if(d==='right'){TL.i=(TL.i+1)%P.length;SFX.move()}
  else if(d==='up'||d==='down'){const lines=[...new Set(P.map(p=>p.y))].sort((a,b)=>a-b),li=lines.indexOf(cur.y),ny=lines[clamp(li+(d==='up'?-1:1),0,lines.length-1)];
    let best=TL.i,bd=1e9;P.forEach((p,k)=>{if(p.y===ny&&Math.abs(p.x-cur.x)<bd){bd=Math.abs(p.x-cur.x);best=k}});if(best!==TL.i){TL.i=best;SFX.move()}}
  if(TAP('a')){SFX.pick();openMoves(P[TL.i].id,'tiers')}else if(TAP('b')||TAP('start')){SFX.back();go('title',titleIdx('tiers'))}}
function tiersDraw(){drawStage('crown',[],{dim:.7});blit();ctx.setTransform(DPR,0,0,DPR,0,0);
  text('TIER LIST',SW/2,8*U,18,'#ffd84a','center','#0e0a14',700);
  textB(TIER_DATA.games?'From '+TIER_DATA.games.toLocaleString()+' CPU matches at level 5':'Estimated from stats',SW/2,30*U,8,'#c8c0e0','center');
  const top=44*U,infoH=58*U,bottom=SH-infoH-22*U,lab=24*U,C=PORT?(SW<330?6:7):clamp(Math.floor((SW-lab-24*U)/(44*U)),8,16),ts=Math.min((SW-lab-24*U)/C-3*U,48*U);
  /* lay out every row, then scroll so the cursor shows */
  const P=[];let y=0;const rowsY=[];
  for(const r of tierList()){rowsY.push({t:r.t,y,h:Math.max(1,Math.ceil(r.ids.length/C))*(ts+3*U)});r.ids.forEach((id,k)=>P.push({id,t:r.t,x:16*U+lab+(k%C)*(ts+3*U),y:y+Math.floor(k/C)*(ts+3*U)}));y+=Math.max(1,Math.ceil(r.ids.length/C))*(ts+3*U)+5*U}
  TL.pos=P;TL.i=clamp(TL.i,0,P.length-1);const cur=P[TL.i],viewH=bottom-top;
  if(cur){if(cur.y<TL.scroll)TL.scroll=cur.y;if(cur.y+ts>TL.scroll+viewH)TL.scroll=cur.y+ts-viewH}TL.scroll=clamp(TL.scroll,0,Math.max(0,y-viewH));
  ctx.save();ctx.beginPath();ctx.rect(0,top-2*U,SW,viewH+4*U);ctx.clip();
  for(const r of rowsY){const yy=top+r.y-TL.scroll;rrect(10*U,yy,lab,r.h-3*U,5*U);ctx.fillStyle=TIERC[r.t];ctx.fill();ctx.lineWidth=2*U;ctx.strokeStyle='#0e0a14';ctx.stroke();text(r.t,10*U+lab/2,yy+r.h/2-11*U,16,'#0e0a14','center',null,700)}
  P.forEach((p,k)=>{const yy=top+p.y-TL.scroll;if(yy>bottom||yy+ts<top-2*U)return;rrect(p.x,yy,ts,ts,4*U);ctx.fillStyle='#0e0a14';ctx.fill();
    portraitC(p.id,k===TL.i?'angry':'guard',p.x+1.5*U,yy+1.5*U,ts-3*U,shade(PEOPLE[p.id].gloves,-.35));
    if(k===TL.i){rrect(p.x-1*U,yy-1*U,ts+2*U,ts+2*U,5*U);ctx.lineWidth=3*U;ctx.strokeStyle='#fff';ctx.stroke()}});
  ctx.restore();
  if(cur){const f=ROSTER[RIX[cur.id]],iy=SH-infoH-20*U;panel(8*U,iy,SW-16*U,infoH,'rgba(14,10,24,.92)',TIERC[cur.t],8);
    text(fname(f.id),16*U,iy+7*U,11,'#fff','left','#0e0a14',700);textB('"'+(f.id==='milo'?nick():f.nick)+'" · '+f.style,16*U,iy+22*U,8,'#c8c0e0','left');
    textB(f.sp.map((s,i)=>SPIN[i]+' '+s.n).join('   '),16*U,iy+36*U,7,'#e8e2d0','left');
    const r=TIER_DATA.rate[f.id];if(r!=null)text(Math.round(r*100)+'% WINS',SW-16*U,iy+7*U,10,TIERC[cur.t],'right','#0e0a14',700)}
  help('D-PAD CHOOSE · A MOVES · B BACK')}
