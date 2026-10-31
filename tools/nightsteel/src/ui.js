/* ================= windows: lists with the pointing hand, dialogue, the letter board, the dye grid ================= */
const px=n=>`calc(var(--u)*${n})`;
function place(e,b){for(const[k,p]of[['x','left'],['y','top'],['w','width'],['h','height'],['r','right'],['b','bottom']])if(b[k]!=null)e.style[p]=px(b[k]);return e}
function winEl(cls,box,parent=UI){const e=el('div','win '+(cls||''));if(box)place(e,box);parent.appendChild(e);return e}
/* ---------- a list: rows of {html|label, r, off, sw}; cursor with the D-pad ---------- */
class ListWin{
  constructor(o){this.o=o;this.rows=o.rows||[];this.i=clamp(o.sel||0,0,Math.max(0,this.rows.length-1));this.top=0;this.cols=o.cols||1;this.vis=o.vis||8;
    this.el=o.el||winEl(o.cls,o.box);this.el.classList.add('lw');
    if(o.title){this.tt=el('div','ttl',o.title);this.el.appendChild(this.tt)}
    this.body=el('div','list'+(this.cols>1?' cols':''));if(this.cols>1)this.body.style.cssText=`display:grid;grid-template-columns:repeat(${this.cols},1fr);gap:${px(.5)} ${px(4)}`;this.el.appendChild(this.body);
    this.more=el('div','more2');this.el.appendChild(this.more);
    if(o.foot){this.ft=el('div','foot small dim',o.foot);this.el.appendChild(this.ft)}
    this.render()}
  get row(){return this.rows[this.i]}
  set(rows,sel){this.rows=rows;if(sel!=null)this.i=sel;this.i=clamp(this.i,0,Math.max(0,rows.length-1));this.render()}
  input(b,rep){const n=this.rows.length,c=this.cols;
    if(b==='up'||b==='down'){if(!n)return;let j=this.i+(b==='up'?-c:c);
      if(j<0||j>=n){if(rep||this.o.noWrap)return;j=b==='up'?(c>1?Math.min(n-1,this.i%c+Math.floor((n-1)/c)*c):n-1):this.i%c}
      if(j>=n)j=n-1;this.move(j)}
    else if(b==='left'||b==='right'){const d=b==='left'?-1:1;
      if(c>1){const j=this.i+d;if(Math.floor(j/c)===Math.floor(this.i/c)&&j>=0&&j<n)this.move(j);else if(this.o.lr)this.o.lr(d,this.row,this.i,rep)}
      else if(this.o.lr)this.o.lr(d,this.row,this.i,rep)}
    else if(b==='a'){const r=this.row;if(!r)return;if(r.off&&!this.o.pickOff){SND.fx('no');return}if(!this.o.quiet)SND.fx('ok');this.o.pick&&this.o.pick(r,this.i)}
    else if(b==='b'){if(this.o.back){SND.fx('back');this.o.back()}}
    else if(this.o.key)this.o.key(b,this.row,this.i)}
  move(j){if(j===this.i)return;this.i=j;SND.fx('cur');this.render();this.o.move&&this.o.move(this.row,this.i)}
  render(){const c=this.cols,line=Math.floor(this.i/c),lines=Math.ceil(this.rows.length/c);
    if(line<this.top)this.top=line;if(line>=this.top+this.vis)this.top=line-this.vis+1;this.top=clamp(this.top,0,Math.max(0,lines-this.vis));
    const from=this.top*c,to=Math.min(this.rows.length,(this.top+this.vis)*c);let h='';
    for(let k=from;k<to;k++){const r=this.rows[k];h+=`<div class="row${k===this.i?(this.dim?' sel dimsel':' sel'):''}${r.off?' off':''}">${r.sw?`<span class="sw" style="background:${r.sw}"></span>`:''}${r.html!=null?r.html:`<span>${esc(r.label)}</span>`}${r.r!=null?`<span class="r">${r.r}</span>`:''}</div>`}
    if(!this.rows.length&&this.o.empty)h=`<div class="row off">${esc(this.o.empty)}</div>`;
    this.body.innerHTML=h;this.more.innerHTML=(this.top>0?'<b class="up">▲</b>':'')+(this.top+this.vis<lines?'<b class="dn">▼</b>':'');
    if(this.o.render)this.o.render(this.row,this.i)}
  close(){}
}
/* a list as a promise: resolves with the picked row's index, or -1 for B */
function pick(o){return new Promise(res=>{let lw;const done=v=>{popModal(lw);res(v)};
  lw=new ListWin(Object.assign({},o,{pick:(r,i)=>{if(o.pickFn&&o.pickFn(r,i,lw)===false)return;done(i)},back:o.noBack?null:()=>done(-1)}));pushModal(lw)})}
/* a yes / no */
async function confirmBox(text,yes='Yes',no='No'){const e=winEl('pop',{x:W/2-80,y:52,w:160});e.innerHTML=`<p>${text}</p>`;const lw={};
  const r=await pick({el:e,rows:[{label:yes},{label:no}],sel:0,vis:2});e.remove();return r===0}
/* ---------- little messages ---------- */
function toast(msg,ms=1700){const e=winEl('toast pop');e.innerHTML=msg;setTimeout(()=>{e.style.transition='opacity .3s';e.style.opacity=0;setTimeout(()=>e.remove(),320)},ms)}
/* ---------- dialogue ---------- */
let DLG_FAST=false;
/* on the field dialogue sits at the bottom, under the hero, unless he stands low on the screen (near the bottom of a map) */
const dlgLow=()=>typeof WD!=='undefined'&&S_SCENE===WORLD_SCENE&&!!WD.m&&(WD.dlg?WD.dlg==='low':heroScreenY()<H*.62);
function say(who,text,o={}){return new Promise(res=>{const e=winEl('dlg pop'+(dlgLow()?' low':''));const tb=el('div','txt');e.appendChild(tb);
    if(who){const w=el('div','win who',esc(who));e.appendChild(w)}
    const more=el('div','more','▼');more.style.display='none';e.appendChild(more);
    const full=String(text);let n=0,acc=0,done=false;const shown=()=>{tb.innerHTML=esc(full.slice(0,Math.floor(n))).replace(/\n/g,'<br>')+'<span style="opacity:0">'+esc(full.slice(Math.floor(n))).replace(/\n/g,'<br>')+'</span>'};
    const m={el:e,tick(dt){if(done)return;const before=Math.floor(n);n=Math.min(full.length,n+dt*TEXTSPD[SET.text]*(DLG_FAST?4:1));if(Math.floor(n)>before&&Math.floor(n)%2===0)SND.fx('type');shown();if(n>=full.length){done=true;more.style.display=''}},
      input(b){if(b!=='a'&&b!=='b')return;if(!done){n=full.length;done=true;shown();more.style.display='';return}popModal(m);res()}};
    shown();pushModal(m)})}
/* a question with choices at the end of a line */
async function ask(who,text,opts){const low=dlgLow(),e=winEl('dlg'+(low?' low':''));if(who)e.appendChild(el('div','win who',esc(who)));e.appendChild(el('div','txt',esc(text).replace(/\n/g,'<br>')));
  const n=opts.length,box=winEl('pop',{r:8,y:low?Math.max(4,H-70-opts.length*15):62,w:Math.min(180,Math.max(70,...opts.map(s=>s.length*4.7+30)))});
  const r=await pick({el:box,rows:opts.map(s=>({label:s})),vis:n,noBack:true});box.remove();e.remove();return r}
/* a script: lines are [who, text] or async functions */
async function talk(lines){for(const l of lines){if(typeof l==='function'){await l();continue}if(typeof l==='string'){await say('',l);continue}await say(l[0],l[1])}}
/* ---------- the letter board ---------- */
const BOARD=['ABCDEFGHIJKLM','NOPQRSTUVWXYZ','0123456789!?.',",-':&+*#/♥★~>"];
function letters(title,init,max,o={}){return new Promise(res=>{let s=String(init||'').slice(0,max),lower=false,cx=0,cy=0;const upper=!!o.upper;
    const e=winEl('pop letters',{x:Math.round(W/2-128),y:16,w:256});
    const keys=()=>{let h='';for(let y=0;y<4;y++)for(let x=0;x<13;x++){let ch=BOARD[y][x]||' ';if(lower&&y<2)ch=ch.toLowerCase();h+=`<i class="${cx===x&&cy===y?'sel':''}">${esc(ch)}</i>`}
      const sp=[['Space',3],[upper?'':'a / A',3],['Del',3],['OK',4]];let x0=0;sp.forEach(([n,w],i)=>{h+=`<i class="wide${cy===4&&cx===i?' sel':''}" style="grid-column:span ${w}">${n||'&nbsp;'}</i>`});return h};
    const draw=()=>{e.innerHTML=`<div class="ttl">${esc(title)}</div><div class="entry">${esc(s)}<b>_</b><span class="r dim small" style="float:right">${s.length}/${max}</span></div><div class="keys">${keys()}</div>${o.note?`<div class="tiny dim" style="margin-top:${px(3)}">${o.note}</div>`:''}<div class="tiny dim" style="margin-top:${px(2)}"><i class="k a">A</i>type <i class="k b">B</i>delete <i class="k">START</i>done</div>`};
    const type=ch=>{if(s.length>=max){SND.fx('no');return}if(upper)ch=ch.toUpperCase();if(o.allowed&&!o.allowed(ch)){SND.fx('no');return}s+=ch;SND.fx('type');draw();o.live&&o.live(s)};
    const del=()=>{if(!s.length){finish(null);return}s=s.slice(0,-1);SND.fx('back');draw();o.live&&o.live(s)};
    const finish=v=>{TEXT_HOOK=null;popModal(m);e.remove();res(v)};
    const m={el:e,input(b,rep){if(b==='up'){cy=(cy+4)%5;if(cy===4)cx=Math.min(cx,3);SND.fx('cur')}else if(b==='down'){cy=(cy+1)%5;if(cy===4)cx=Math.min(3,Math.floor(cx/3.3));SND.fx('cur')}
        else if(b==='left'){cx=cy===4?(cx+3)%4:(cx+12)%13;SND.fx('cur')}else if(b==='right'){cx=cy===4?(cx+1)%4:(cx+1)%13;SND.fx('cur')}
        else if(b==='a'){if(cy<4){let ch=BOARD[cy][cx];if(lower&&cy<2)ch=ch.toLowerCase();type(ch);return}if(cx===0)type(' ');else if(cx===1){if(!upper){lower=!lower;SND.fx('cur')}}else if(cx===2)del();else finish(s.trim())}
        else if(b==='b')del();else if(b==='start'){SND.fx('ok');finish(s.trim())}draw()}};
    TEXT_HOOK=ev=>{if(ev.metaKey||ev.ctrlKey||ev.altKey)return false;if(ev.key==='Enter'){ev.preventDefault();finish(s.trim());return true}if(ev.key==='Backspace'){ev.preventDefault();del();return true}
      if(ev.key==='Escape'){ev.preventDefault();finish(null);return true}if(ev.key.length===1&&!ev.key.startsWith('Arrow')){ev.preventDefault();if(ev.repeat)return true;type(ev.key);return true}return false};
    draw();pushModal(m)})}
/* ---------- the dye grid ---------- */
function dyeGrid(title,cur,live,o={}){return new Promise(res=>{const list=o.none?[['None','']].concat(DYES):DYES,cols=9;let i=Math.max(0,list.findIndex(d=>d[0]===cur));
    const e=winEl('pop',Object.assign({x:W-160,y:6,w:154},o.box||{}));
    const draw=()=>{let h=`<div class="ttl">${esc(title)}</div><div class="grid" style="grid-template-columns:repeat(${cols},1fr)">`;
      list.forEach(([n,c],k)=>{h+=`<span class="c${k===i?' sel':''}${n===cur?' cur':''}" style="background:${c||'repeating-linear-gradient(45deg,#334,#334 2px,#556 2px,#556 4px)'}"></span>`});
      e.innerHTML=h+`</div><div class="small" style="margin-top:${px(3)}">${esc(list[i][0])}</div>`};
    const m={el:e,input(b){const n=list.length;if(b==='left')i=(i+n-1)%n;else if(b==='right')i=(i+1)%n;else if(b==='up')i=(i-cols+n*cols)%n;else if(b==='down')i=(i+cols)%n;
        else if(b==='a'){SND.fx('ok');popModal(m);e.remove();res(list[i][0]);return}else if(b==='b'){SND.fx('back');popModal(m);e.remove();live&&live(cur);res(null);return}else return;
        SND.fx('cur');draw();live&&live(list[i][0])}};
    draw();pushModal(m)})}
/* ---------- a picture of a character for a window ---------- */
function previewCanvas(parent,w,h,box){const c=el('canvas','preview');c.width=w;c.height=h;place(c,Object.assign({w,h},box||{}));parent.appendChild(c);const g=c.getContext('2d');g.imageSmoothingEnabled=false;return[c,g]}
/* draw a member, cropped around them, at a whole-number scale */
function paintDoll(g,look,w,pose,crop=[24,4,56,76],k=2,flip=false){g.clearRect(0,0,g.canvas.width,g.canvas.height);const c=heroSprite(look,w,pose,flip);g.imageSmoothingEnabled=false;
  g.drawImage(c,crop[0],crop[1],crop[2],crop[3],0,0,crop[2]*k,crop[3]*k)}
/* a small portrait (head and shoulders) as html */
function portraitHTML(m,scale=1){const c=heroSprite(m.look,null,'idle',false),k=document.createElement('canvas');k.width=28;k.height=26;const g=k.getContext('2d');g.drawImage(c,DOLL_FX-16,DOLL_FY-58,28,26,0,0,28,26);
  return`<img src="${k.toDataURL()}" style="width:${px(28*scale)};height:${px(26*scale)};image-rendering:pixelated;flex:0 0 auto">`}
/* a bar */
const barHTML=(v,max,cls='',w=30)=>`<span class="bar ${cls}" style="display:inline-block;width:${px(w)}"><i style="width:${max?clamp(v/max*100,0,100):0}%"></i></span>`;
/* a fade over the whole screen */
function fadeOut(ms=260){return new Promise(r=>{let f=$('#fader');if(!f){f=el('div','');f.id='fader';UI.appendChild(f)}f.style.transition=`opacity ${ms}ms`;f.style.opacity=1;setTimeout(r,ms+20)})}
function fadeIn(ms=260){return new Promise(r=>{const f=$('#fader');if(!f){r();return}f.style.transition=`opacity ${ms}ms`;f.style.opacity=0;setTimeout(r,ms+20)})}
