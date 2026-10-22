#!/usr/bin/env python3
"""Builds the ZigaPlay cartridge of Ketto from the game's repo.

    python3 build_cart.py REPO OUT_HTML

The cartridge is the repo's index.html with a ZigaPlay layer added. Everything new only runs inside the console
(when window.parent.ZIGAPLAY exists), so the file still plays exactly like the original on its own:
  - the console's D-pad, A, B, SELECT and START drive every screen (fights, menus, the Forge, the 3D story);
  - key hints show the console's buttons;
  - custom fighters keep their cloud copies in the ZigaPlay database, under data/users/<id>/ketto/fighters;
  - the custom fighters from the repo's fighters/ folder come built in;
  - the 3D story's modules (three.js and the toon world) travel inside the file and load from blob URLs,
    so Story works in the offline ZigaPlay too.
"""
import json, os, re, sys

REPO, OUT = sys.argv[1], sys.argv[2]
src = open(os.path.join(REPO, 'index.html'), encoding='utf-8').read()


def rep(old, new, count=1):
    global src
    n = src.count(old)
    if n != count:
        sys.exit(f'expected {count} of {old[:70]!r}, found {n}')
    src = src.replace(old, new)


# ---------- the 3D story's modules, in dependency order ----------
VENDOR = os.path.join(REPO, '3d', 'vendor', 'three')


def resolve(spec, frm):
    if spec == 'three':
        return os.path.join(VENDOR, 'three.module.min.js')
    if spec.startswith('three/addons/'):
        return os.path.join(VENDOR, 'addons', spec[len('three/addons/'):])
    if spec.startswith('.'):
        return os.path.normpath(os.path.join(os.path.dirname(frm), spec))
    sys.exit(f'cannot resolve {spec!r} from {frm}')


SPEC = re.compile(r'''(\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)(["'])([^"']+)\2''')
order, index, sources = [], {}, {}


def in_comment(text, at):
    line = text[text.rfind('\n', 0, at) + 1:at].lstrip()
    return line.startswith('*') or line.startswith('//') or line.startswith('/*')


def visit(path, stack=()):
    if path in index:
        return
    if path in stack:
        sys.exit('import cycle at ' + path)
    text = open(path, encoding='utf-8').read()
    deps = []
    for m in SPEC.finditer(text):
        if in_comment(text, m.start()):
            continue
        dep = resolve(m.group(3), path)
        deps.append(dep)
        visit(dep, stack + (path,))
    sources[path] = text
    index[path] = len(order)
    order.append(path)


entry = os.path.join(REPO, '3d', 'js', 'toon', 'adventure.js')
visit(entry)
mods = []
for path in order:
    text = SPEC.sub(lambda m: m.group(0) if in_comment(m.string, m.start()) else m.group(1) + '"__KMOD_%d__"' % index[resolve(m.group(3), path)], sources[path])
    if path == entry:
        # the world's help line shows the console's buttons
        old = 'WASD MOVE · SHIFT RUN · SPACE JUMP · E TALK / USE<br>TAB MENU · I ITEMS · J QUESTS · DRAG TO TURN · ESC PAUSE'
        if old not in text:
            sys.exit('the world help line has changed; update build_cart.py')
        text = text.replace(old, '✚ MOVE · HOLD B RUN · A TALK, USE OR JUMP<br>SELECT MENU · DRAG THE SCREEN TO TURN · START PAUSE')
    mods.append(text)
print('story modules:', ', '.join(os.path.relpath(p, REPO) for p in order), f'({sum(map(len, mods)) // 1024} KB)')

# ---------- the repo's custom fighters ----------
fighters = []
fdir = os.path.join(REPO, 'fighters')
for n in sorted(os.listdir(fdir)):
    if n.endswith('.json') and n != 'index.json':
        fighters.append(json.load(open(os.path.join(fdir, n), encoding='utf-8')))
print('built-in custom fighters:', len(fighters))


def js_json(v):
    return json.dumps(v, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


# ---------- the page ----------
rep('</script>\n</head>', '''</script>
<script>try{if(window.parent!==window&&window.parent.ZIGAPLAY)document.documentElement.classList.add('zp')}catch(e){}</script>
<style>
/* inside the ZigaPlay: the duel fills the console's screen, and the console's own buttons replace the touch pad */
html.zp body{padding:0;gap:0}
html.zp #stage{width:min(100%,calc(100vh * 16 / 9));min-width:0;box-shadow:none}
html.zp #touch,html.zp #trainHint,html.zp .spRow,html.zp .dfRow{display:none!important}
/* the duel fills the console's screen (see zpFit). The stage (and so every menu and the HUD, which are sized from its
   width) is never wider than 16:9, so they always fit top to bottom; on a wider screen the sides take the scene's colours */
html.zp body{justify-content:center;align-items:center}
html.zp #stage{width:min(100vw,calc(100vh * 16 / 9));height:100vh;aspect-ratio:auto;max-width:none}
html.zp #game{inset:auto;left:50%;top:50%;transform:translate(-50%,-50%)}
</style>
</head>''')

rep("<script>\n(()=>{\n'use strict';\nconst $=id=>document.getElementById(id);",
    '<script type="application/json" id="zp-fighters">' + js_json(fighters) + '</script>\n'
    '<script type="application/json" id="zp-mods">' + js_json(mods) + '</script>\n'
    "<script>\n(()=>{\n'use strict';\nconst $=id=>document.getElementById(id);\n"
    "const ZP=(()=>{try{return window.parent!==window&&window.parent.ZIGAPLAY||null}catch(e){return null}})();")

# touch: the console has its own buttons; 2 Player still needs a keyboard
rep("if(matchMedia('(pointer: coarse)').matches){\n  $('touch').hidden=false;",
    "if(matchMedia('(pointer: coarse)').matches||ZP){\n  if(!ZP)$('touch').hidden=false;")

# the console counts as a controller: menus show button hints and the Forge uses its highlight
rep('let padSeen=false,padList=[];', 'let padSeen=!!ZP,padList=[];')

# on the console there are no specials or deflects, for either fighter (the Moves gallery still demonstrates them)
rep('    if(inp.specialP)this.sbuf=8;else if(this.sbuf>0)this.sbuf--;\n    if(inp.deflectP)this.dbuf=6;else if(this.dbuf>0)this.dbuf--;',
    '    const zpOff=ZP&&!G.demo;\n    if(inp.specialP&&!zpOff)this.sbuf=8;else if(this.sbuf>0)this.sbuf--;\n    if(inp.deflectP&&!zpOff)this.dbuf=6;else if(this.dbuf>0)this.dbuf--;')
# ...and the CPU doesn't waste its turns reaching for them: it guards instead
rep('if(this.wantSpecial(me,op,dist)&&Math.random()<P.spec){', 'if(!(ZP&&!G.demo)&&this.wantSpecial(me,op,dist)&&Math.random()<P.spec){')
rep('&&Math.random()<(P.deflect||0)){out.deflectP=true;return out;}', '&&!(ZP&&!G.demo)&&Math.random()<(P.deflect||0)){out.deflectP=true;return out;}')
rep('if(!!pads.length!==padSeen){padSeen=!!pads.length;padUI();}', 'if(!ZP&&!!pads.length!==padSeen){padSeen=!!pads.length;padUI();}')

# cloud copies of custom fighters: this player's own folder in the ZigaPlay database
rep('let FDB=null;', "let FDB=null,FROOT='fighters';")
rep("FDB.doc('fighters/'+c.id)", "FDB.doc(FROOT+'/'+c.id)")
rep("FDB.doc('fighters/'+id)", "FDB.doc(FROOT+'/'+id)")
rep("  const cl=window.claude;if(!cl||typeof cl.use!=='function')return;\n  let db=null;try{db=await cl.use('db');}catch(e){}\n  if(!db)return;FDB=db;",
    "  const cl=ZP?ZP.claude:window.claude;if(!cl||typeof cl.use!=='function')return;\n  let db=null;try{db=await cl.use('db');}catch(e){}\n  if(!db)return;\n"
    "  if(ZP){let uid=null;try{const u=await cl.use('user');uid=await u.id();}catch(e){}if(!uid)return;FROOT=`data/users/${uid}/ketto/fighters`;}\n  FDB=db;")
rep("try{const snap=await db.collection('fighters').get();", "try{const snap=await db.collection(FROOT).get();")

# the repo's fighters come inside the cartridge
rep("async function repoInit(){\n  if(!/^https?:$/.test(location.protocol))return;",
    "async function repoInit(){\n  if(ZP){try{const el=$('zp-fighters');if(el)mergeFighters(JSON.parse(el.textContent));}catch(e){}return;}\n  if(!/^https?:$/.test(location.protocol))return;")

# the 3D story loads from the modules carried in the file
rep("  import('./3d/js/toon/adventure.js').then(m=>{",
    "  (ZP?zpWorld():import('./3d/js/toon/adventure.js')).then(m=>{")

# every frame, the console's buttons are turned into the keys this screen wants
rep('function frame(now){\n  pollPads();', 'function frame(now){\n  pollPads();if(ZP)zpSync();')
rep("addEventListener('blur',()=>keys.clear());", "addEventListener('blur',()=>{keys.clear();if(ZP)for(const k of zpKeys)keys.add(k);});")

ADAPTER = r'''
/* ================= ZIGAPLAY =================
   Inside the ZigaPlay console the game is played with its D-pad, A, B, SELECT and START. Each frame the buttons held
   are turned into the keys the current screen understands, the way a controller's are:
     fights  ◀ ▶ move · ▲ jump (held after the first light: launch) · ▼ guard · A light · B heavy · START pause
             (the console shows its round control stick for Kettō; specials and deflects are left out on the console,
             for the CPU too, so the fight stays fair; the Moves gallery still shows them)
     story   D-pad walk · A talk, use, or jump when nothing is near · hold B run · SELECT menu · START pause
     menus   D-pad move · A pick · B back · SELECT random fighter · START edit a custom fighter (or confirm)
     Forge   D-pad move · A press · B cancel · SELECT next tab · START save
   A button still held when the screen changes does nothing more until it is let go. */
const ZPB=new Set(),zpEat=new Set(),zpKeys=new Set(),zpHold={};let zpCtx0='',zpJump=false,zpAKey='KeyE';
const ZP_DIRS=new Set(['up','down','left','right']);
function zpCtx(){
  if(G.mode==='edit')return'edit';
  if(G.mode==='world'){const a=W3.adv;return a&&(a.menuOpen||a.shopOpen)?'wmenu':a&&a.paused?'wpause':'world';}
  if(G.mode==='fight'){if(G.paused)return'pause';if(G.demo)return'demo';if(G.phase==='vs'||G.phase==='talk')return'talk';return'fight';}
  return'menu:'+G.mode;
}
function zpWant(c){
  const w=new Set(),b=k=>ZPB.has(k)&&!zpEat.has(k),edit=c==='edit';
  if(b('up'))w.add(edit?'NavUp':'KeyW');if(b('down'))w.add(edit?'NavDown':'KeyS');
  if(b('left'))w.add(edit?'NavLeft':'KeyA');if(b('right'))w.add(edit?'NavRight':'KeyD');
  const A=b('a'),B=b('b'),SE=b('select'),ST=b('start');
  if(c==='fight'){if(b('up')&&zpJump)w.add('Space');if(A)w.add('KeyE');if(B)w.add('KeyC');if(ST)w.add('Escape');}
  else if(c==='demo'||c==='talk'||c==='pause'){if(A)w.add('KeyE');if(B||ST)w.add('Escape');}
  else if(edit){if(A)w.add('NavOK');if(B)w.add('NavBack');if(SE)w.add($('osk').hidden?'NavNextTab':'NavAlt');if(ST)w.add('Enter');}
  else if(c==='world'){if(A)w.add(zpAKey);if(B)w.add('ShiftLeft');if(SE)w.add('KeyR');if(ST)w.add('Escape');}
  else if(c==='wmenu'){if(A)w.add('KeyE');if(B)w.add('KeyC');if(SE)w.add('KeyF');if(ST)w.add('Escape');}
  else if(c==='wpause'){if(A||ST)w.add('Escape');if(B)w.add('KeyQ');if(SE)w.add('Tab');}
  else{if(A)w.add('KeyE');if(B)w.add('KeyC');if(SE)w.add('KeyR');if(ST)w.add(G.mode==='select'?'KeyF':'Enter');}
  return w;
}
function zpSync(){
  if(++zpTint%20===0)zpEdges();
  const c=zpCtx();
  if(c!==zpCtx0){zpCtx0=c;for(const k of ZPB)if(!ZP_DIRS.has(k))zpEat.add(k);}
  const w=zpWant(c),menu=c!=='fight'&&c!=='world';
  for(const k of[...zpKeys])if(!w.has(k)){zpKeys.delete(k);delete zpHold[k];keyUp(k);}
  for(const k of w){
    if(!zpKeys.has(k)){zpKeys.add(k);zpHold[k]=0;keyDown(k);}
    else if(menu&&REPEAT.has(k)&&++zpHold[k]>=18&&(zpHold[k]-18)%5===0){keys.delete(k);keyDown(k);}
  }
}
/* filling the screen: the duel is scaled to cover the console's screen, cropping at most 8.5% off each side;
   whatever is still left over above and below takes the colours of the sky and the ground at the duel's edges */
const ZP_CROP=0.085;let zpFitT=0,zpTint=0;
function zpFit(){const st=$('stage'),vw=st.clientWidth,vh=st.clientHeight,A=W/H;if(!vw||!vh)return;let w,h;
  if(vw/vh<A){w=Math.min(vh*A,vw/(1-2*ZP_CROP));h=w/A;}else{h=Math.min(vw/A,vh/(1-2*ZP_CROP));w=h*A;}
  cv.style.width=Math.round(w)+'px';cv.style.height=Math.round(h)+'px';}
function zpEdges(){if(G.mode==='world')return;try{const a=sctx.getImageData(cv.width>>1,1,1,1).data,b=sctx.getImageData(cv.width>>1,cv.height-2,1,1).data;
  $('stage').style.background=`linear-gradient(rgb(${a[0]},${a[1]},${a[2]}) 50%,rgb(${b[0]},${b[1]},${b[2]}) 50%)`;}catch(e){}}
/* key hints show the console's buttons */
const ZP_LABEL={X:'A',Y:'SELECT',B:'B',RB:'START',LB:'SELECT',STICK:'✚',UP:'▲',DOWN:'▼',LEFT:'◀',RIGHT:'▶',START:'START',
  WASD:'✚',W:'▲',S:'▼',A:'◀',D:'▶',E:'A',C:'B',R:'SELECT',F:'START',ESC:'START',ENTER:'START',TAB:'SELECT',Q:'B'};
function zpLabels(){for(const k of document.querySelectorAll('.kbd')){const t=k.textContent.trim();if(k.dataset.zp===t)continue;const n=ZP_LABEL[t];if(n){k.textContent=n;k.dataset.zp=n;}else k.dataset.zp=t;}}
/* the 3D story's modules come out of the file as blob URLs, dependencies first */
let zpWorldP=null;
function zpWorld(){
  if(!zpWorldP)zpWorldP=(async()=>{
    try{const mods=JSON.parse($('zp-mods').textContent),urls=[];
      for(const s of mods)urls.push(URL.createObjectURL(new Blob([s.replace(/__KMOD_(\d+)__/g,(_,i)=>urls[+i])],{type:'text/javascript'})));
      return await import(urls[urls.length-1]);}
    catch(e){console.warn('ZigaPlay: story modules from the file failed, trying the files',e);zpWorldP=null;return import('./3d/js/toon/adventure.js');}
  })();
  return zpWorldP;
}
if(ZP){
  $('pControls').innerHTML=
    '<div class="ctlCol"><h3>FIGHTS</h3><div class="ctlRows"><span>Move</span><b>◀ ▶</b><span>Jump</span><b>▲</b><span>Guard</span><b>hold ▼</b><span>Light slash</span><b>A</b><span>Heavy slash</span><b>B</b><span>Launch</span><b>A, then hold ▲ through the combo</b><span>Pause</span><b>START</b></div></div>'+
    '<div class="ctlCol"><h3>STORY</h3><div class="ctlRows"><span>Walk</span><b>✚</b><span>Run</span><b>hold B</b><span>Talk / use</span><b>A</b><span>Jump</span><b>A with nothing near</b><span>Menu</span><b>SELECT</b><span>Pause</span><b>START</b><span>Turn</span><b>drag the screen</b></div></div>'+
    '<div class="ctlCol"><h3>MENUS</h3><div class="ctlRows"><span>Move</span><b>✚</b><span>Pick</span><b>A</b><span>Back</span><b>B</b><span>Random</span><b>SELECT</b><span>Edit fighter</span><b>START</b><span>Forge</span><b>SELECT tabs · START save</b></div></div>';
  $('pauseHint').innerHTML='<span class="kbd">▲</span><span class="kbd">▼</span> choose · <span class="kbd">◀</span><span class="kbd">▶</span> tabs · <span class="kbd">A</span> select · <span class="kbd">B</span> resume';
  zpFit();addEventListener('resize',zpFit);new ResizeObserver(zpFit).observe($('stage'));
  zpLabels();new MutationObserver(zpLabels).observe(document.body,{subtree:true,childList:true,characterData:true});
  window.ZPCart={title:'Kettō',
    input(btn,down){initAudio();
      if(down){
        if(btn==='up')zpJump=!(G.p1&&(G.p1.state==='attack'||G.p1.state==='special'));
        if(btn==='a'){const a=W3.adv;let near=null;try{near=a&&(a.talk||a.nearestInteract())}catch(e){}zpAKey=G.mode!=='world'||near?'KeyE':'Space';}
        ZPB.add(btn);
      }else{ZPB.delete(btn);zpEat.delete(btn);}
      zpSync();},
    async home(){try{saveStory();saveCustoms();}catch(e){}
      if((G.mode==='fight'&&!G.demo)||G.mode==='world'||G.mode==='tour'||G.mode==='edit')return'ask';return true;},
    snapshot:()=>null};
  if(ZP.cartReady)ZP.cartReady(window.ZPCart);
}
goTitle();'''
rep('\ngoTitle();\nrequestAnimationFrame(frame);', ADAPTER + '\nrequestAnimationFrame(frame);')

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(src)
print(f'wrote {OUT} ({len(src.encode()) // 1024} KB)')
