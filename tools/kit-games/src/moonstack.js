/* =====================================================================================================
   MOONSTACK: you are a monkey in a hard hat building a tower ten thousand floors high, to reach the moon.
   Every floor is one you describe. Press A, type what the floor has on it, and Claude draws it: a room full of
   things built from shapes, most of which do something when you touch them. Mention an earlier floor ("add on
   to floor 29 so its cat can be roommates with the dog here") and the two floors are joined: the cat can live
   in either, and touching it sends it across. B switches between building and looking at all your floors;
   looking at a floor, A changes it. Ask for a game ("a little clicker game I can play") and Claude writes one: tap
   its machine and the screen becomes that game.

   Everything is drawn at the screen's full sharpness. A room is 200 x 100 units, the floor of the room at
   y = 100; things are drawn from their own top-left corner. When the page cannot reach Claude, a small
   built-in builder makes the floor from the words it knows.
   ===================================================================================================== */
const GOAL=10000,TAU=Math.PI*2,CH=25;
const cv=$('#cv'),g=cv.getContext('2d'),stage=$('#stage'),hud=$('#hud'),typer=$('#typer'),tin=$('#tin'),cap=$('#cap'),toastEl=$('#toast');

/* ---------- the tower and what you have done to it ---------- */
let floors=[];                 /* floor k is floors[k-1]: {title,story,text,wall,floor,things:[...]} */
let meta={v:2,sound:2,tier:'default',st:{},won:0,n:0,savedAt:0};   /* st: what each thing is doing, by "floor:id" */
const strip=f=>f.game?Object.assign({},f,{game:{title:f.game.title,idea:f.game.idea}}):f;
const SAVE=(()=>{const KEY='moonstack-v2',ZC=ZP&&ZP.cloud&&typeof ZP.cloud.save==='function'&&typeof ZP.cloud.list==='function'?ZP.cloud:null;let cloud=false,t=0,lt=0;const dirty=new Set(),dirtyG=new Set();
  const local=()=>{try{localStorage.setItem(KEY,JSON.stringify({meta,floors}))}catch(e){try{localStorage.setItem(KEY,JSON.stringify({meta,floors:floors.map(strip)}))}catch(e2){}}};
  const push=()=>{if(!cloud)return;for(const c of dirty)try{ZC.save('moonstack',JSON.stringify(floors.slice(c*CH,c*CH+CH).map(strip)),{},'c'+c)}catch(e){}dirty.clear();
    for(const i of dirtyG){const f=floors[i];try{ZC.save('moonstack',JSON.stringify(f&&f.game?{html:f.game.html,save:f.game.save==null?null:f.game.save}:null),{},'g'+i)}catch(e){}}dirtyG.clear();
    try{ZC.save('moonstack',JSON.stringify(meta),{},'main')}catch(e){}};
  const all=()=>{for(let c=0;c*CH<floors.length;c++)dirty.add(c);floors.forEach((f,i)=>{if(f.game)dirtyG.add(i)})};
  const O={
    load(){try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&o.meta&&Array.isArray(o.floors)){meta=Object.assign(meta,o.meta);floors=o.floors}}catch(e){}
      if(!floors.length)try{const o=JSON.parse(localStorage.getItem('moonstack-save'));if(o&&Array.isArray(o.segs))floors=migrate(o.segs)}catch(e){}},
    touch(fi){if(fi!=null&&fi>=0)dirty.add(Math.floor(fi/CH));meta.savedAt=Date.now();meta.n=floors.length;local();if(cloud){clearTimeout(t);t=setTimeout(push,1500)}},
    /* a game saving its own progress: often, so the phone's copy is written at most every few seconds */
    touchGame(fi,quiet){dirtyG.add(fi);if(!quiet)return O.touch(fi);meta.savedAt=Date.now();clearTimeout(lt);lt=setTimeout(local,2500);if(cloud){clearTimeout(t);t=setTimeout(push,1500)}},
    async init(onLoad){if(!ZC)return;for(let a=0;a<4;a++){let r=null;try{r=await ZC.list('moonstack')}catch(e){}
        if(r&&r.ok){cloud=true;const D={};for(const d of r.docs)D[d.id]=d;let cm=null;try{cm=D.main?JSON.parse(D.main.json):null}catch(e){}
          if(cm&&cm.v===2&&(+cm.savedAt||0)>(+meta.savedAt||0)){const fl=[];let ok=true;for(let c=0;c*CH<(cm.n||0);c++){try{fl.push(...JSON.parse(D['c'+c].json))}catch(e){ok=false;break}}
            if(ok){fl.forEach((f,i)=>{if(f.game){let gd=null;try{gd=D['g'+i]?JSON.parse(D['g'+i].json):null}catch(e){}if(gd&&gd.html){f.game.html=gd.html;f.game.save=gd.save}else{const lf=floors[i];if(lf&&lf.game&&lf.game.html){f.game.html=lf.game.html;f.game.save=lf.game.save}}}});
              const snd=meta.sound,tier=meta.tier;meta=Object.assign(meta,cm);meta.sound=snd;meta.tier=tier;floors=fl.slice(0,cm.n);local();if(onLoad)onLoad()}}
          else if(cm&&cm.v!==2&&Array.isArray(cm.segs)&&!floors.length){floors=migrate(cm.segs);if(floors.length){all();meta.savedAt=Date.now();meta.n=floors.length;local();push();if(onLoad)onLoad()}}
          else if(meta.savedAt){all();push()}
          return}
        await sleep(9000)}},
    async flush(){clearTimeout(lt);local();if(!cloud)return;clearTimeout(t);push();try{await ZC.flush('moonstack')}catch(e){}}};
  return O})();
/* floors from the first version of the game (plain shapes in a 120 x 40 room) become things in the new room */
function migrate(segs){const k=200/120;return segs.filter(s=>s&&s.t==='c'&&Array.isArray(s.items)).map(s=>({title:s.title||'FLOOR',story:s.story||'',text:s.text||'',wall:s.wall||'#3a4a6a',floor:s.floor||'#8a8a9a',
  things:s.items.map((i,n)=>{const w=i.w*k,h=i.h*k,sh=i.s==='tri'?{s:'poly',pts:[[0,h],[w/2,0],[w,h]],c:i.c}:i.s==='line'?{s:'line',pts:[[0,0],[w,h]],c:i.c,lw:2}:i.s==='text'?{s:'text',x:0,y:0,t:i.t||'',size:9,c:i.c}:{s:i.s==='oval'?'oval':'rect',x:0,y:0,w,h,c:i.c};
    return{id:'t'+n,name:'thing',x:i.x*k,y:100-(40-i.y)*k,anim:{move:'drive',bob:'bob',spin:'spin',blink:'blink'}[i.a]||'',tap:[{do:'jump'}],shapes:[sh]}})})).filter(f=>f.things.length)}

/* ---------- what a floor may hold: everything Claude sends is checked and trimmed ---------- */
const HEX=/^#[0-9a-f]{6}$/i,num=(v,a,b,d)=>{v=+v;return isFinite(v)?clamp(Math.round(v*10)/10,a,b):d};
const ANIMS=['','bob','walk','drive','spin','blink','sway'],DOS=['say','sound','jump','spin','grow','flip','shake','move','toggle','swap','go','color','play'];
const SOUNDS=['meow','bark','moo','quack','roar','ding','boing','honk','pop','splash','music','whoosh','squeak','beep','laugh','vroom'];
function cleanShape(s){if(!s||typeof s!=='object')return null;const t=['rect','oval','poly','line','text'].includes(s.s)?s.s:'rect',o={s:t,c:HEX.test(s.c)?s.c:'#ffffff'};if(s.o===false)o.o=false;
  if(t==='poly'||t==='line'){o.pts=(Array.isArray(s.pts)?s.pts:[]).slice(0,16).filter(Array.isArray).map(p=>[num(p[0],-60,260,0),num(p[1],-60,160,0)]);if(o.pts.length<2)return null;if(t==='line')o.lw=num(s.lw,.5,14,2)}
  else{o.x=num(s.x,-60,260,0);o.y=num(s.y,-60,160,0);if(t==='text'){o.t=String(s.t||'').slice(0,20);o.size=num(s.size,4,30,8);if(!o.t)return null}else{o.w=num(s.w,.3,260,10);o.h=num(s.h,.3,160,10);if(t==='rect'&&s.r)o.r=num(s.r,0,80,0);if(s.rot)o.rot=num(s.rot,-360,360,0)}}
  return o}
function cleanAction(a){if(!a||!DOS.includes(a.do))return null;const o={do:a.do};
  if(a.do==='say'){o.text=String(a.text||'').slice(0,48);if(!o.text)return null}if(a.do==='sound')o.s=SOUNDS.includes(a.s)?a.s:'pop';
  if(a.do==='move'){o.to=(Array.isArray(a.to)?a.to:[]).slice(0,6).filter(Array.isArray).map(p=>[num(p[0],-30,200,0),num(p[1],-30,100,0)]);if(!o.to.length)return null}
  if(a.do==='toggle'){o.id=String(a.id||'');if(!o.id)return null}if(a.do==='go'){o.floor=Math.round(num(a.floor,1,GOAL,1))}
  if(a.do==='color'){o.c=(Array.isArray(a.c)?a.c:[]).filter(c=>HEX.test(c)).slice(0,6);if(!o.c.length)return null}
  return o}
let shapeBudget=0;
function cleanThing(t,i){if(!t||typeof t!=='object')return null;const shapes=(Array.isArray(t.shapes)?t.shapes:[]).slice(0,40).map(cleanShape).filter(Boolean).slice(0,Math.max(0,shapeBudget));if(!shapes.length)return null;shapeBudget-=shapes.length;
  return{id:String(t.id||'t'+i).replace(/[^a-z0-9_-]/gi,'').slice(0,20)||'t'+i,name:String(t.name||t.id||'thing').slice(0,28),x:num(t.x,-40,200,0),y:num(t.y,-40,100,0),anim:ANIMS.includes(t.anim)?t.anim:'',hidden:t.hidden===true,
    tap:(Array.isArray(t.tap)?t.tap:t.tap?[t.tap]:[]).slice(0,5).map(cleanAction).filter(Boolean),shapes}}
function uniq(things,taken){for(const t of things){let id=t.id,k=2;while(taken.has(id))id=t.id+k++;t.id=id;taken.add(id)}}
function cleanGameReq(q){if(!q||typeof q!=='object')return null;if(q.remove===true)return{remove:true};if(q.change)return{change:String(q.change).slice(0,800)};
  if(q.idea)return{title:String(q.title||'GAME').slice(0,30),idea:String(q.idea).slice(0,1400)};return null}
function cleanFloor(o,text,n){if(!o||typeof o!=='object')throw{code:'bad'};shapeBudget=240;
  const things=(Array.isArray(o.things)?o.things:[]).slice(0,26).map(cleanThing).filter(Boolean);if(!things.length)throw{code:'bad'};uniq(things,new Set());
  const ok=k=>k>=1&&k<=floors.length&&k!==n;
  const links=(Array.isArray(o.links)?o.links:[]).slice(0,4).filter(l=>l&&typeof l==='object').map(l=>({floor:Math.round(num(l.floor,0,GOAL,0)),id:String(l.id||''),x:num(l.x,-20,200,80),y:num(l.y,-20,100,60)})).filter(l=>ok(l.floor)&&l.id);
  const addTo=(Array.isArray(o.addTo)?o.addTo:[]).slice(0,3).filter(a=>a&&typeof a==='object').map(a=>({floor:Math.round(num(a.floor,0,GOAL,0)),things:(Array.isArray(a.things)?a.things:[]).slice(0,10).map(cleanThing).filter(Boolean)})).filter(a=>ok(a.floor)&&a.things.length);
  return{text:String(text).slice(0,160),title:String(o.title||text).slice(0,26),story:String(o.story||'').slice(0,360),wall:HEX.test(o.wall)?o.wall:'#3a4a6a',floor:HEX.test(o.floor)?o.floor:'#8a8a9a',things,links,addTo,game:cleanGameReq(o.game)}}

/* ---------- where things are: a thing can belong to one floor and stand on another ---------- */
const keyOf=(k,t)=>k+':'+t.id,stOf=(k,t)=>meta.st[keyOf(k,t)]||(meta.st[keyOf(k,t)]={});
const spotOf=(k,t)=>{if(!t.spots||!t.spots.length)return{f:k,x:t.x,y:t.y};const s=meta.st[keyOf(k,t)];return t.spots[clamp((s&&s.sp)||0,0,t.spots.length-1)]};
let travellers=[];
function reindex(){travellers=[];floors.forEach((f,i)=>{for(const t of f.things)if(t.spots&&t.spots.length>1)travellers.push({k:i+1,t})})}
function thingsOn(k){const f=floors[k-1];if(!f)return[];const out=[];for(const t of f.things)if(!t.spots||spotOf(k,t).f===k)out.push({k,t});for(const v of travellers)if(v.k!==k&&spotOf(v.k,v.t).f===k)out.push(v);return out}
const BOX=new WeakMap();
function bounds(t){let b=BOX.get(t);if(b)return b;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const add=(x,y)=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)};
  for(const s of t.shapes){if(s.pts)for(const p of s.pts)add(p[0],p[1]);else if(s.s==='text'){add(s.x,s.y);add(s.x+s.t.length*s.size*.6,s.y+s.size)}else{add(s.x,s.y);add(s.x+s.w,s.y+s.h)}}
  b={x0,y0,x1,y1,w:x1-x0,h:y1-y0};BOX.set(t,b);return b}

/* ---------- putting a new floor on the tower, and joining it to the floors it mentions ---------- */
const ARCADE=[{s:'rect',x:0,y:8,w:36,h:54,c:'#6a3ad0',r:3},{s:'rect',x:-2,y:0,w:40,h:11,c:'#ffd23f',r:2},{s:'text',x:5,y:2,t:'PLAY',size:7,c:'#2a1a04',o:false},{s:'rect',x:5,y:16,w:26,h:19,c:'#14142a',r:2},
  {s:'rect',x:8,y:19,w:20,h:13,c:'#2ad0a0',o:false},{s:'oval',x:12,y:22,w:5,h:5,c:'#ffd23f',o:false},{s:'rect',x:3,y:38,w:30,h:9,c:'#4a2aa0'},{s:'line',pts:[[10,42],[10,37]],c:'#2a2a33',lw:2},{s:'oval',x:8,y:34,w:5,h:5,c:'#e8443a'},{s:'oval',x:20,y:40,w:4,h:4,c:'#e8443a'},{s:'oval',x:26,y:40,w:4,h:4,c:'#3a8ae8'}];
function ensurePlay(f){if(f.game&&!f.things.some(t=>t.tap.some(a=>a.do==='play'))){const th={id:'arcade',name:'arcade machine',x:158,y:38,anim:'',hidden:false,tap:[{do:'play'},{do:'sound',s:'ding'}],shapes:JSON.parse(JSON.stringify(ARCADE))};uniq([th],new Set(f.things.map(t=>t.id)));f.things.push(th)}}
/* links (a thing from another floor may live here too) and things added onto other floors */
function applyExtras(fl,n){const notes=[];
  for(const L of fl.links){const src=floors[L.floor-1];if(!src)continue;const want=L.id.toLowerCase();const th=src.things.find(t=>t.id===L.id)||src.things.find(t=>t.id.toLowerCase()===want||t.name.toLowerCase()===want)||src.things.find(t=>t.name.toLowerCase().includes(want));if(!th)continue;
    if(!th.spots||!th.spots.length)th.spots=[{f:L.floor,x:th.x,y:th.y}];if(th.spots.some(s=>s.f===n))continue;th.spots.push({f:n,x:L.x,y:L.y});if(!th.tap.some(a=>a.do==='swap'))th.tap.unshift({do:'swap'});
    stOf(L.floor,th).sp=th.spots.length-1;SAVE.touch(L.floor-1);notes.push(th.name)}
  for(const A of fl.addTo){const dst=floors[A.floor-1];if(!dst)continue;uniq(A.things,new Set(dst.things.map(t=>t.id)));dst.things.push(...A.things);SAVE.touch(A.floor-1)}
  return notes}
function applyFloor(fl){const n=floors.length+1,f={title:fl.title,story:fl.story,text:fl.text,wall:fl.wall,floor:fl.floor,things:fl.things};if(fl.game&&fl.game.html)f.game={title:fl.game.title,idea:fl.game.idea,html:fl.game.html,save:null};
  ensurePlay(f);floors.push(f);SAVE.touch(n-1);if(f.game)SAVE.touchGame(n-1);const notes=applyExtras(fl,n);reindex();return notes}
function replaceFloor(k,fl,game){const old=floors[k-1],keep={};for(const t of old.things)keep[t.id]=t;
  for(const t of fl.things){const o=keep[t.id];if(o&&o.spots&&o.spots.length>1){t.spots=o.spots;if(!t.tap.some(a=>a.do==='swap'))t.tap.unshift({do:'swap'})}}
  for(const id in keep)if(!fl.things.some(t=>t.id===id))delete meta.st[k+':'+id];
  const f={title:fl.title,story:fl.story,text:old.text,wall:fl.wall,floor:fl.floor,things:fl.things};if(game&&game.html)f.game=game;ensurePlay(f);floors[k-1]=f;
  for(const key in RT)if(key.startsWith(k+':'))delete RT[key];const notes=applyExtras(fl,k);SAVE.touch(k-1);if(f.game||old.game)SAVE.touchGame(k-1);reindex();return notes}

/* ---------- asking Claude for a floor ---------- */
function refsIn(text){const out=[];for(const m of text.matchAll(/floor\s*(?:#|no\.?|number)?\s*(\d{1,5})/gi)){const k=+m[1];if(k>=1&&k<=floors.length&&!out.includes(k))out.push(k)}return out.slice(0,3)}
const brief=k=>{const f=floors[k-1];return{floor:k,title:f.title,things:f.things.map(t=>{const b=bounds(t),s=spotOf(k,t);return{id:t.id,name:t.name,x:Math.round(s.x),y:Math.round(s.y),w:Math.round(b.x1),h:Math.round(b.y1)}})}};
function spec(n,edit,hasGame){return `Draw the floor as a side view of one room, 200 wide and 100 tall. x goes right, y goes down, the floor of the room is at y = 100, so something standing on the floor has y + its height = 100.
Make it polished and clearly defined: build each object (a "thing") from several shapes - bodies, heads, eyes with small white shines, noses, wheels, windows, leaves, stripes - in bold, harmonious colours that stand out from the wall. Every shape gets a dark outline automatically; give tiny details such as eye shines "o": false. Characters should be cute and expressive and face right. Add a few details that make it feel like a real room (a rug, a picture, a lamp...) when they fit.
Make it fun to touch: most things get a "tap" reaction that suits them.

Reply with JSON only, in exactly this shape:
{"title": "short floor name, at most 24 characters",
 "story": "1 to 3 short sentences in the second person, present tense, about you (the monkey) ${edit?'making this change':'finishing this floor'} and what happens on it. Friendly and funny.",
 "wall": "#rrggbb", "floor": "#rrggbb",
 "things": [{"id": "short-id", "name": "what it is", "x": left, "y": top, "anim": "" | "bob" | "walk" | "drive" | "spin" | "blink" | "sway", "hidden": false,
   "tap": [actions], "shapes": [shapes, positioned from the thing's own top-left corner]}],
 "links": [], "addTo": []${hasGame||!edit?', "game": only when needed, see below':''}}
Shapes: {"s":"rect","x":0,"y":0,"w":10,"h":10,"c":"#rrggbb","r":corner radius,"rot":degrees} {"s":"oval","x":0,"y":0,"w":10,"h":10,"c":"#rrggbb"} {"s":"poly","pts":[[x,y],[x,y],[x,y]],"c":"#rrggbb"} {"s":"line","pts":[[x,y],[x,y]],"c":"#rrggbb","lw":2} {"s":"text","x":0,"y":0,"t":"at most 16 characters","size":8,"c":"#rrggbb"}. Later shapes are drawn on top.
Animations: walk paces back and forth, drive rolls across the room and wraps round, bob floats, spin turns, sway rocks, blink flashes.
Tap actions (a list; all of them run together): {"do":"say","text":"Hi!"} {"do":"sound","s":"meow|bark|moo|quack|roar|ding|boing|honk|pop|splash|music|whoosh|squeak|beep|laugh|vroom"} {"do":"jump"} {"do":"spin"} {"do":"grow"} {"do":"flip"} {"do":"shake"} {"do":"move","to":[[x,y],[x,y]]} (each tap sends it to the next place in this room, then back) {"do":"toggle","id":"another thing's id"} (shows or hides another thing in this room, e.g. a light beam or an open door: start that one with "hidden": true) {"do":"color","c":["#rrggbb","#rrggbb"]} (changes the thing's main colour) ${floors.length>1?`{"do":"go","floor":N} (a lift or door that takes the player to another floor, 1 to ${floors.length})`:''} {"do":"play"} (starts this floor's game; only if the floor has one)
"links": brings a thing from another floor into this room so it can live on either floor: {"floor": its floor number, "id": its id, "x": where it stands here, "y": ...}. It starts here; tapping it sends it back and forth between the two floors. Use it whenever the player wants something from another floor to come here, visit, move in, be roommates, and so on.
"addTo": adds new things to another floor: {"floor": number, "things": [things in the same format]}. Use it only when the player asks to change that floor.
"game": ${edit&&hasGame?`this floor has a game the player can play. If the player wants the game changed, add "game": {"change": "exactly what to change in the game"}. For a different game, "game": {"title": "...", "idea": "..."} as below. To take the game away, "game": {"remove": true}. Otherwise leave "game" out, and keep the thing that starts it (its tap has {"do":"play"}).`:`only if the player asks for something they can actually play - a game, a mini-game, an arcade machine, a puzzle to play - add "game": {"title": "the game's name", "idea": "a clear description of a small, original game in that spirit: what you do, how you score or progress, what you can unlock or upgrade, how it looks"}, and add a thing the player taps to start it, whose tap includes {"do":"play"} - an arcade cabinet, a big screen, a game table. If the player names an existing game, describe an original game in the same style with its own name and look. Otherwise leave "game" out.`}
Use 4 to 14 things and 20 to 160 shapes in all. Keep everything inside the room.`}
function prompt(text,n){const refs=refsIn(text);return `You are drawing floor ${n} of a cartoon tower that a monkey (the player) is building up to the moon, 10,000 floors high.
The player typed what this floor has on it:
\"\"\"${text}\"\"\"
${refs.length?`The player mentions earlier floors. This is what is on them (ids, names, where they stand, their size):\n${JSON.stringify(refs.map(brief))}\n`:''}
${spec(n,false,false)}`}
function editPrompt(k,text){const f=floors[k-1],cur={title:f.title,story:f.story,wall:f.wall,floor:f.floor,things:f.things.map(t=>{const o=Object.assign({},t);delete o.spots;return o})};if(f.game)cur.game={title:f.game.title,idea:f.game.idea};
  const refs=refsIn(text).filter(r=>r!==k);return `You are changing floor ${k} of a cartoon tower that a monkey (the player) is building up to the moon.
This is floor ${k} as it is now:
${JSON.stringify(cur)}
${refs.length?`The player mentions other floors. This is what is on them (ids, names, where they stand, their size):\n${JSON.stringify(refs.map(brief))}\n`:''}
The player wants to change it:
\"\"\"${text}\"\"\"
Reply with the whole floor after the change. Keep the ids of things that stay, so they keep working; keep everything the player did not ask to change; change, add or remove things as asked. Write a new "story" about the change.
${spec(k,true,!!f.game)}`}
/* a whole little game, written by Claude as one web page; it runs walled off in its own frame */
function gamePrompt(q,text,old){const rules=`Rules:
- One self-contained HTML document with inline <style> and <script> only. No external files, images, fonts or libraries (emoji are fine). Draw with canvas, CSS or emoji.
- It runs inside a small handheld console screen, usually about 320 x 390 pixels and portrait, but any size is possible: fill the whole window, never scroll, scale everything from window.innerWidth/innerHeight and handle resize.
- Make it polished and fun straight away: a clear goal, score or progress shown big, satisfying feedback (animation, particles, little sounds with the Web Audio API once the player has touched the screen), and things to unlock or growing challenge. Big readable text, high contrast, large touch targets.
- Touch or click on the screen must be enough to play. Also respond to the console's buttons, which arrive as messages: window.addEventListener('message', e => { const m = e.data; if (m && m.zp === 'btn') { /* m.b is 'up','down','left','right','a','b' or 'select'; m.down is true when pressed and false when released */ } }). The console's START button leaves the game, so don't use it.
- Saving: localStorage and cookies are not available. The game's saved data from last time is in window.ZP_SAVE (null the first time). Save with parent.postMessage({zp:'save', data: anObject}, '*') (plain JSON, under 20 KB) when progress changes, at most every two seconds, and save straight away when a message {zp:'leave'} arrives (the game is about to close).
- If the player named an existing game, make an original game in that style, with its own name, look and characters; don't copy names, characters or art from existing games.
- Keep it under about 30 KB.
Reply with only the HTML document, starting with <!doctype html>.`;
  if(old)return `Here is a small web game that runs on a handheld console screen:\n\n${old}\n\nThe player asked for this change: \"\"\"${text}\"\"\"\nWhat to change: ${q.change}\n\nRewrite the whole game with the change made, keeping everything else working the same way and keeping the same save format where you can.\n${rules}`;
  return `Write a small, complete, original game as a single web page.\nThe game: ${q.title}. ${q.idea}\nThe player asked for: \"\"\"${text}\"\"\"\n${rules}`}
function pullHtml(s){s=String(s||'');const a=s.search(/<!doctype html|<html/i);if(a<0)return null;const b=s.toLowerCase().lastIndexOf('</html>');if(b<a)return null;const h=s.slice(a,b+7);return /<script/i.test(h)&&h.length<150000?h:null}
/* the game made when Claude cannot write one: a clicker with upgrades */
function tplGame(title){const t=String(title||'Clicker').replace(/[<>&"'`$\\]/g,'').slice(0,24)||'Clicker';return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
html,body{margin:0;height:100%;overflow:hidden;background:#1c1442;color:#fff;font-family:system-ui,sans-serif;user-select:none;-webkit-user-select:none;touch-action:manipulation}
#w{height:100%;display:flex;flex-direction:column;align-items:center;padding:10px;box-sizing:border-box;gap:6px}
h1{margin:0;font-size:17px;color:#ffd23f}#n{font-size:32px;font-weight:800}#r{font-size:12px;opacity:.8}
#big{width:42vmin;height:42vmin;max-width:180px;max-height:180px;border-radius:50%;border:5px solid #fff;background:radial-gradient(circle at 35% 30%,#fff6a0,#ffb020 60%,#c86a10);box-shadow:0 7px 0 #0008;font-size:19vmin;display:flex;align-items:center;justify-content:center;transition:transform .06s;cursor:pointer}
#big.p{transform:scale(.9)}#ups{width:100%;display:flex;flex-direction:column;gap:5px;overflow:auto;flex:1}
.u{display:flex;justify-content:space-between;align-items:center;padding:7px 10px;border-radius:10px;background:#2e2466;border:2px solid #5a4a9a;font-size:13px;cursor:pointer}.u.s{border-color:#ffd23f}.u.no{opacity:.45}.u b{color:#ffd23f}
.f{position:absolute;pointer-events:none;font-weight:800;color:#ffd23f;animation:f .8s ease-out forwards}@keyframes f{to{transform:translateY(-60px);opacity:0}}
</style></head><body><div id="w"><h1>${t}</h1><div id="n">0</div><div id="r"></div><div id="big">⭐</div><div id="ups"></div></div><script>
var U=[{n:'Bigger taps',c:15,k:'tap',v:1},{n:'Helper monkey',c:50,k:'auto',v:1},{n:'Banana engine',c:400,k:'auto',v:8},{n:'Golden touch',c:1500,k:'tap',v:10},{n:'Moon factory',c:8000,k:'auto',v:60}];
var S=Object.assign({p:0,tap:1,auto:0,own:[0,0,0,0,0]},window.ZP_SAVE||{}),sel=0,ac=null,last=0,rows=[];
function q(s){return document.querySelector(s)}function fmt(x){return Math.floor(x).toLocaleString()}
function beep(f){try{ac=ac||new AudioContext();var o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.setValueAtTime(.07,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.12);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.13)}catch(e){}}
function cost(i){return Math.ceil(U[i].c*Math.pow(1.35,S.own[i]))}
U.forEach(function(u,i){var d=document.createElement('div');d.className='u';d.innerHTML='<span></span><b></b>';d.onclick=function(){sel=i;buy()};q('#ups').append(d);rows.push(d)});
function draw(){q('#n').textContent=fmt(S.p);q('#r').textContent=fmt(S.auto)+' per second · '+fmt(S.tap)+' per tap';rows.forEach(function(d,i){d.className='u'+(i===sel?' s':'')+(S.p<cost(i)?' no':'');d.firstChild.textContent=U[i].n+' x'+S.own[i];d.lastChild.textContent=fmt(cost(i))})}
function tap(x,y){S.p+=S.tap;beep(660+Math.random()*200);var b=q('#big');b.classList.add('p');setTimeout(function(){b.classList.remove('p')},70);var f=document.createElement('div'),r=b.getBoundingClientRect();f.className='f';f.textContent='+'+fmt(S.tap);f.style.left=(x==null?r.left+r.width/2:x)+'px';f.style.top=(y==null?r.top+r.height/3:y)+'px';document.body.append(f);setTimeout(function(){f.remove()},800);draw();save()}
function buy(){var c=cost(sel);if(S.p<c){beep(200);return}S.p-=c;S.own[sel]++;S[U[sel].k]+=U[sel].v;beep(990);draw();save(true)}
var st=0;function save(now){var t=Date.now();clearTimeout(st);if(now||t-last>2000){last=t;parent.postMessage({zp:'save',data:S},'*')}else st=setTimeout(function(){save(true)},2000-(t-last))}
q('#big').addEventListener('pointerdown',function(e){e.preventDefault();tap(e.clientX,e.clientY)});
addEventListener('message',function(e){var m=e.data;if(m&&m.zp==='leave'){save(true);return}if(!m||m.zp!=='btn'||!m.down)return;if(m.b==='a')tap();else if(m.b==='up'){sel=(sel+U.length-1)%U.length;draw()}else if(m.b==='down'){sel=(sel+1)%U.length;draw()}else if(m.b==='b')buy()});
setInterval(function(){if(S.auto){S.p+=S.auto/10;draw();save()}},100);draw();
<\/script></body></html>`}
const wantsGame=t=>/\b(game|games|mini-?game|arcade|playable|clicker|i can play|to play)\b/i.test(t);

/* ---------- the builder used when Claude cannot be reached ---------- */
const hash=s=>{let h=7;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return h};
const eye=(x,y,r)=>[{s:'oval',x,y,w:r*2,h:r*2,c:'#ffffff'},{s:'oval',x:x+r*.6,y:y+r*.5,w:r,h:r*1.1,c:'#1a1424'},{s:'oval',x:x+r*.7,y:y+r*.5,w:r*.4,h:r*.4,c:'#ffffff',o:false}];
const KIT={
  cat:c=>({name:'cat',anim:'',tap:[{do:'say',text:'Meow!'},{do:'sound',s:'meow'},{do:'jump'}],shapes:[{s:'line',pts:[[4,20],[0,8]],c:c||'#f49a3a',lw:3},{s:'oval',x:2,y:12,w:24,h:14,c:c||'#f49a3a'},{s:'oval',x:16,y:2,w:16,h:14,c:c||'#f49a3a'},{s:'poly',pts:[[17,6],[18,-2],[23,4]],c:c||'#f49a3a'},{s:'poly',pts:[[26,4],[31,-2],[31,7]],c:c||'#f49a3a'},...eye(20,6,2),...eye(26,6,2),{s:'oval',x:24,y:11,w:2.5,h:2,c:'#ff7aa0',o:false}]}),
  dog:c=>({name:'dog',anim:'walk',tap:[{do:'say',text:'Woof!'},{do:'sound',s:'bark'},{do:'jump'}],shapes:[{s:'line',pts:[[2,10],[0,4]],c:c||'#b07a42',lw:3},{s:'oval',x:2,y:10,w:28,h:16,c:c||'#b07a42'},{s:'rect',x:6,y:22,w:4,h:6,c:c||'#b07a42'},{s:'rect',x:22,y:22,w:4,h:6,c:c||'#b07a42'},{s:'oval',x:20,y:0,w:18,h:16,c:c||'#b07a42'},{s:'oval',x:19,y:2,w:6,h:12,c:'#6a4220'},...eye(28,4,2),{s:'oval',x:34,y:9,w:4,h:3,c:'#1a1424'}]}),
  car:(c,ban)=>ban?{name:'banana car',anim:'drive',tap:[{do:'sound',s:'vroom'},{do:'say',text:'Zoom!'}],shapes:[{s:'poly',pts:[[0,8],[8,16],[30,16],[42,6],[44,2],[40,6],[28,10],[10,10]],c:'#ffd23f'},{s:'rect',x:40,y:0,w:4,h:4,c:'#6a4a1a'},{s:'oval',x:6,y:13,w:9,h:9,c:'#2a2a33'},{s:'oval',x:28,y:13,w:9,h:9,c:'#2a2a33'},{s:'oval',x:9,y:16,w:3,h:3,c:'#c8c8d0',o:false},{s:'oval',x:31,y:16,w:3,h:3,c:'#c8c8d0',o:false}]}
    :{name:'car',anim:'drive',tap:[{do:'sound',s:'honk'},{do:'color',c:['#3a8ae8','#3ad08a','#ffd23f']}],shapes:[{s:'rect',x:0,y:8,w:40,h:10,c:c||'#e8443a',r:3},{s:'rect',x:9,y:1,w:20,h:9,c:c||'#e8443a',r:3},{s:'rect',x:12,y:3,w:6,h:5,c:'#bfe8ff'},{s:'rect',x:20,y:3,w:6,h:5,c:'#bfe8ff'},{s:'oval',x:5,y:14,w:9,h:9,c:'#2a2a33'},{s:'oval',x:26,y:14,w:9,h:9,c:'#2a2a33'}]},
  tree:()=>({name:'tree',anim:'sway',tap:[{do:'shake'},{do:'say',text:'Rustle rustle'}],shapes:[{s:'rect',x:13,y:28,w:8,h:22,c:'#7a4a22'},{s:'oval',x:0,y:8,w:34,h:26,c:'#3aa84a'},{s:'oval',x:6,y:0,w:22,h:20,c:'#4ac05a'},{s:'oval',x:22,y:14,w:5,h:5,c:'#e8443a'},{s:'oval',x:8,y:18,w:5,h:5,c:'#e8443a'}]}),
  fish:()=>({name:'fish',anim:'drive',tap:[{do:'sound',s:'splash'},{do:'jump'}],shapes:[{s:'poly',pts:[[0,0],[6,5],[0,10]],c:'#ff8a3a'},{s:'oval',x:4,y:0,w:16,h:10,c:'#ff8a3a'},...eye(13,2,1.6)]}),
  pool:()=>({name:'pool',anim:'',tap:[{do:'sound',s:'splash'},{do:'say',text:'Splash!'}],shapes:[{s:'rect',x:0,y:0,w:90,h:22,c:'#e8e8f0',r:3},{s:'rect',x:4,y:3,w:82,h:17,c:'#3aa0e8',r:2},{s:'line',pts:[[10,8],[24,8]],c:'#bfe8ff',lw:1.5},{s:'line',pts:[[40,13],[56,13]],c:'#bfe8ff',lw:1.5}]}),
  cake:()=>({name:'cake',anim:'',tap:[{do:'say',text:'Happy birthday!'},{do:'sound',s:'music'}],shapes:[{s:'rect',x:0,y:18,w:44,h:18,c:'#ffb0c8',r:3},{s:'rect',x:6,y:6,w:32,h:14,c:'#fff0f4',r:3},{s:'rect',x:0,y:18,w:44,h:4,c:'#ffffff',o:false},...[10,20,30].flatMap(x=>[{s:'rect',x,y:-2,w:3,h:8,c:'#3ab8ff'},{s:'oval',x:x-.5,y:-7,w:4,h:6,c:'#ffd23f'}])]}),
  robot:()=>({name:'robot',anim:'walk',tap:[{do:'sound',s:'beep'},{do:'spin'},{do:'say',text:'BEEP BOOP'}],shapes:[{s:'line',pts:[[12,6],[12,0]],c:'#8a98a8',lw:1.5},{s:'oval',x:10,y:-3,w:4,h:4,c:'#ff4a4a'},{s:'rect',x:2,y:6,w:20,h:14,c:'#b8c8d8',r:3},{s:'rect',x:5,y:10,w:5,h:4,c:'#3ae8ff'},{s:'rect',x:14,y:10,w:5,h:4,c:'#3ae8ff'},{s:'rect',x:0,y:20,w:24,h:18,c:'#a8b8c8',r:2},{s:'rect',x:7,y:24,w:10,h:6,c:'#ffd23f'},{s:'rect',x:3,y:38,w:6,h:8,c:'#8a98a8'},{s:'rect',x:15,y:38,w:6,h:8,c:'#8a98a8'}]}),
  lamp:()=>({name:'lamp',anim:'',tap:[{do:'toggle',id:'light'},{do:'sound',s:'ding'}],shapes:[{s:'rect',x:8,y:12,w:3,h:34,c:'#5a5a6a'},{s:'rect',x:2,y:44,w:15,h:4,c:'#5a5a6a',r:2},{s:'poly',pts:[[0,14],[4,0],[15,0],[19,14]],c:'#ffd23f'}]}),
  ball:()=>({name:'ball',anim:'bob',tap:[{do:'jump'},{do:'sound',s:'boing'}],shapes:[{s:'oval',x:0,y:0,w:16,h:16,c:'#e8443a'},{s:'line',pts:[[1,8],[15,8]],c:'#ffffff',lw:2},{s:'oval',x:3,y:3,w:4,h:3,c:'#ffffff',o:false}]}),
  duck:()=>({name:'duck',anim:'walk',tap:[{do:'sound',s:'quack'},{do:'say',text:'Quack!'}],shapes:[{s:'oval',x:0,y:8,w:22,h:14,c:'#ffd23f'},{s:'oval',x:12,y:0,w:12,h:11,c:'#ffd23f'},{s:'poly',pts:[[23,5],[29,7],[23,9]],c:'#ff8a1a'},...eye(17,3,1.6)]}),
  ghost:()=>({name:'ghost',anim:'bob',tap:[{do:'say',text:'Boo!'},{do:'sound',s:'whoosh'},{do:'grow'}],shapes:[{s:'poly',pts:[[0,30],[0,10],[4,2],[12,0],[20,2],[24,10],[24,30],[20,26],[16,30],[12,26],[8,30],[4,26]],c:'#f4f4ff'},...eye(6,9,2),...eye(13,9,2)]}),
  star:()=>({name:'star',anim:'blink',tap:[{do:'spin'},{do:'sound',s:'ding'}],shapes:[{s:'poly',pts:[[8,0],[10,6],[16,6],[11,10],[13,16],[8,12],[3,16],[5,10],[0,6],[6,6]],c:'#ffd23f'}]}),
  house:()=>({name:'house',anim:'',tap:[{do:'toggle',id:'light'},{do:'sound',s:'ding'}],shapes:[{s:'rect',x:4,y:20,w:44,h:30,c:'#e8d8b0'},{s:'poly',pts:[[0,22],[26,2],[52,22]],c:'#c8443a'},{s:'rect',x:21,y:34,w:10,h:16,c:'#7a4a22'},{s:'rect',x:8,y:26,w:9,h:8,c:'#bfe8ff'},{s:'rect',x:35,y:26,w:9,h:8,c:'#bfe8ff'}]})};
const ALIAS={kitten:'cat',kitty:'cat',puppy:'dog',cars:'car',racetrack:'car',race:'car',racing:'car',truck:'car',trees:'tree',forest:'tree',jungle:'tree',fish:'fish',pool:'pool',water:'pool',ocean:'pool',lake:'pool',cake:'cake',party:'cake',birthday:'cake',robot:'robot',robots:'robot',lamp:'lamp',light:'lamp',ball:'ball',duck:'duck',ghost:'ghost',stars:'star',star:'star',house:'house',home:'house',cat:'cat',dog:'dog',car:'car',tree:'tree'};
function localFloor(text,n){const t=text.toLowerCase(),ban=/banana/.test(t),things=[],refs=refsIn(text),links=[];
  /* things named after an earlier floor ("the cat in floor 3") come over from it instead of being made again */
  const borrowed=new Set();for(const k of refs)for(const th of floors[k-1].things){const nm=th.name.toLowerCase();if(nm.length>2&&t.includes(nm)&&!borrowed.has(nm)){borrowed.add(nm);links.push({floor:k,id:th.id,x:20+links.length*60,y:100-bounds(th).y1})}}
  const kinds=[];for(const w of t.match(/[a-z]+/g)||[]){const k=ALIAS[w]||ALIAS[w.replace(/s$/,'')];if(k&&!kinds.includes(k)&&!borrowed.has(k))kinds.push(k)}
  const slots=[[8],[8,108],[6,72,138],[4,52,100,150]][Math.min(3,Math.max(0,kinds.length+links.length-1))]||[8];let si=links.length;links.forEach((l,i)=>{l.x=slots[i]||10});
  for(const k of kinds.slice(0,4-links.length)){const d=KIT[k](null,ban),b=bounds({shapes:d.shapes});const x=k==='car'||k==='fish'?(slots[si]||0):slots[si]||10;si++;
    const y=k==='fish'?70:k==='star'||k==='ghost'?16:100-b.y1;things.push({id:k+things.length,x,y,hidden:false,...d});if(k==='car')for(let i=1;i<3;i++)things.push({id:'car'+i+things.length,x:x+i*70,y,hidden:false,...KIT.car(['#3a8ae8','#3ad08a'][i-1],ban)});
    if(k==='pool')things.push({id:'fish'+things.length,x:x+10,y:84,hidden:false,...KIT.fish()});if(k==='lamp'||k==='house')things.push({id:'light',name:'light',x:x-8,y:k==='lamp'?62:72,anim:'',hidden:true,tap:[],shapes:[{s:'oval',x:0,y:0,w:36,h:30,c:'#fff6a0',o:false}]})}
  if(k0(things)&&!links.length){const w=text.slice(0,16).toUpperCase();things.push({id:'sign',name:'sign',x:60,y:40,anim:'',hidden:false,tap:[{do:'say',text:text.slice(0,40)}],shapes:[{s:'rect',x:38,y:30,w:4,h:30,c:'#7a4a22'},{s:'rect',x:0,y:0,w:80,h:32,c:'#f4e8c8',r:3},{s:'text',x:6,y:11,t:w,size:8,c:'#3a2a1a'}]})}
  things.unshift({id:'rug',name:'rug',x:30,y:96,anim:'',hidden:false,tap:[],shapes:[{s:'rect',x:0,y:0,w:140,h:4,c:'#'+((hash(t)&0x7f7f7f)|0x404040).toString(16).padStart(6,'0'),r:2}]});
  const what=text.replace(/^\s*(the\s+)?(floor|this floor|it)\s+(has|with|is|contains)\s+/i,'').replace(/^\s*(a\s+)?floor\s+(with|of)\s+/i,'').replace(/[.!\s]+$/,'');
  const walls=['#3a5a8a','#6a4a7a','#3a7a6a','#7a5a3a','#4a4a6a','#8a4a5a','#3a6a8a','#5a6a3a'];
  return cleanFloor({title:what.slice(0,24).toUpperCase()||'FLOOR '+n,story:`You hammer the last beam into floor ${n} and step back to look. It has ${what}.`+(links.length?` Something from an earlier floor moves in: tap it to send it home and back.`:` You grin and dust off your hat.`),
    wall:walls[hash(t)%walls.length],floor:'#a8a8b8',things,links,addTo:[]},text,n)}
const k0=a=>a.length===0;
function localEdit(f,text,k){const add=localFloor(text,k).things.filter(t=>t.id!=='rug'&&t.id!=='sign'),things=JSON.parse(JSON.stringify(f.things));uniq(add,new Set(things.map(t=>t.id)));
  return{title:f.title,story:`You roll up your sleeves and change floor ${k}: ${text.replace(/[.!\s]+$/,'')}.`,wall:f.wall,floor:f.floor,things:things.concat(add),links:[],addTo:[],game:null}}

/* ---------- sound ---------- */
const SFX={meow(){SND.tone(760,.28,{to:520,vol:.06,type:'triangle'})},bark(){SND.noise(.08,{lp:1200,vol:.12});SND.tone(260,.1,{to:180,vol:.08,type:'square'})},moo(){SND.tone(180,.6,{to:140,vol:.06,type:'sawtooth'})},
  quack(){SND.tone(520,.08,{vol:.06,type:'square',to:420});SND.tone(520,.08,{vol:.06,type:'square',to:420,at:.12})},roar(){SND.noise(.5,{lp:600,vol:.16});SND.tone(90,.5,{to:60,vol:.08,type:'sawtooth'})},ding(){SND.tone(1320,.35,{vol:.07,type:'sine'})},
  boing(){SND.tone(200,.3,{to:640,vol:.07,type:'triangle'})},honk(){SND.tone(330,.12,{vol:.07,type:'square'});SND.tone(330,.16,{vol:.07,type:'square',at:.16})},pop(){SND.tone(900,.06,{to:300,vol:.08})},splash(){SND.noise(.35,{hp:900,vol:.1})},
  music(){[523,659,784,1047].forEach((f,i)=>SND.tone(f,.16,{vol:.06,type:'triangle',at:i*.12}))},whoosh(){SND.noise(.4,{hp:400,vol:.08})},squeak(){SND.tone(1500,.1,{to:2100,vol:.05})},beep(){SND.tone(880,.08,{vol:.05,type:'square'});SND.tone(660,.08,{vol:.05,type:'square',at:.1})},
  laugh(){[620,520,620,520].forEach((f,i)=>SND.tone(f,.07,{vol:.05,type:'triangle',at:i*.1}))},vroom(){SND.tone(80,.5,{to:220,vol:.07,type:'sawtooth'})},
  hit(){SND.noise(.05,{hp:900,vol:.08});SND.tone(220,.05,{vol:.05,type:'triangle'})},build(){[523,659,784,1047].forEach((f,i)=>SND.tone(f,.12,{vol:.06,type:'triangle',at:i*.08}))},
  poof(){SND.noise(.2,{hp:1500,vol:.07});SND.tone(500,.15,{to:1200,vol:.04})},tick(){SND.tone(1200,.03,{vol:.03})},win(){[523,659,784,1047,1319,1568,2093].forEach((f,i)=>SND.tone(f,.2,{vol:.08,at:i*.11}))}};
const SONG={bpm:96,ch:[SND.seq('triangle',.045,'C5 . E5 . G5 . E5 . F5 . A5 . G5 - . . C5 . E5 . G5 . C6 . B4 . D5 . G5 - . .'),SND.seq('square',.022,'C3 . . . C3 . . . F2 . . . G2 . . . C3 . . . A2 . . . G2 . . . G2 . . .'),SND.seq('drum',.03,'k . h . s . h . k . h . s . h h k . h . s . h . k k h . s . h .')]};

/* ---------- drawing helpers ---------- */
const rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]};
const shade=(h,a)=>{const c=rgb(h).map(v=>Math.round(a<0?v*(1+a):v+(255-v)*a));return`rgb(${c[0]},${c[1]},${c[2]})`};
function rr(c,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function drawShape(s,u,col){const c=g,fill=col||s.c,small=s.w!=null&&Math.min(s.w,s.h)<3.2,ol=s.o!==false&&!small&&s.s!=='line';c.fillStyle=fill;c.strokeStyle=shade(fill,-.55);c.lineWidth=Math.max(1,u*.9);c.lineJoin='round';c.lineCap='round';
  if(s.s==='line'){c.strokeStyle=fill;c.lineWidth=s.lw*u;c.beginPath();s.pts.forEach((p,i)=>i?c.lineTo(p[0]*u,p[1]*u):c.moveTo(p[0]*u,p[1]*u));c.stroke();return}
  if(s.s==='text'){c.font=`700 ${s.size*u}px system-ui,-apple-system,sans-serif`;c.textBaseline='top';c.lineWidth=Math.max(1,u*1.2);c.strokeStyle=shade(fill,-.7);if(s.o!==false)c.strokeText(s.t,s.x*u,s.y*u);c.fillText(s.t,s.x*u,s.y*u);return}
  c.beginPath();if(s.s==='poly')s.pts.forEach((p,i)=>i?c.lineTo(p[0]*u,p[1]*u):c.moveTo(p[0]*u,p[1]*u)),c.closePath();
  else{const x=s.x*u,y=s.y*u,w=s.w*u,h=s.h*u;if(s.rot){c.save();c.translate(x+w/2,y+h/2);c.rotate(s.rot*Math.PI/180);c.translate(-x-w/2,-y-h/2)}
    if(s.s==='oval')c.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,TAU);else if(s.r)rr(c,x,y,w,h,s.r*u);else c.rect(x,y,w,h);if(s.rot){c.fill();if(ol)c.stroke();c.restore();return}}
  c.fill();if(ol)c.stroke()}

/* the monkey: round brown head, light face, big eyes, a yellow hard hat, a curly tail and a hammer */
function monkey(x,y,sz,swing,mood){const c=g;c.save();c.translate(x,y);c.scale(sz,sz);const O='#3a2010',F='#7a4a22',L='#f0cc96';c.lineWidth=1.3/sz*sz;c.strokeStyle=O;c.lineJoin='round';
  const E=(cx,cy,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,TAU);c.fill();c.stroke()};
  c.lineWidth=2.2;c.strokeStyle=F;c.beginPath();c.moveTo(-6,-4);c.bezierCurveTo(-18,-4,-18,-20,-11,-20);c.stroke();c.lineWidth=1.3;c.strokeStyle=O;
  E(-4,-1,3,4,F);E(4,-1,3,4,F);E(0,-9,8,8,F);E(0,-8,5,5.5,L);
  E(-11,-24,4,4,F);E(11,-24,4,4,F);c.fillStyle=L;c.beginPath();c.arc(-11,-24,2,0,TAU);c.arc(11,-24,2,0,TAU);c.fill();E(0,-24,10,9,F);
  c.fillStyle=L;c.beginPath();c.moveTo(0,-26);c.bezierCurveTo(-9,-31,-10,-17,-5,-17.5);c.lineTo(5,-17.5);c.bezierCurveTo(10,-17,9,-31,0,-26);c.fill();c.stroke();
  const blink=Math.floor(T*.7)%7===0&&(T%1.4)<.12;for(const ex of[-3.6,3.6]){if(blink){c.beginPath();c.moveTo(ex-2,-24);c.lineTo(ex+2,-24);c.stroke()}else{E(ex,-24,2.2,2.8,'#ffffff');c.fillStyle='#1a1020';c.beginPath();c.arc(ex+.4,-23.6,1.4,0,TAU);c.fill();c.fillStyle='#fff';c.fillRect(ex+.6,-24.8,.8,.8)}}
  c.beginPath();if(mood==='yay')c.arc(0,-20.5,2.6,0,Math.PI);else{c.moveTo(-2.4,-20);c.quadraticCurveTo(0,-18.4,2.4,-20)}c.stroke();
  c.fillStyle='#ffd23f';c.beginPath();c.ellipse(0,-30,10.5,7,0,Math.PI,0);c.fill();c.stroke();c.beginPath();rr(c,-13,-31,26,3.2,1.6);c.fill();c.stroke();c.fillStyle='#ffe98a';c.fillRect(-1.2,-36.5,2.4,5);
  c.save();c.translate(7,-10);c.rotate(-1.1+swing*1.6);c.fillStyle='#9a6a3a';c.beginPath();rr(c,-1.3,-15,2.6,15,1);c.fill();c.stroke();c.fillStyle='#9aa0b0';c.beginPath();rr(c,-5,-18,10,5,1.2);c.fill();c.stroke();c.restore();
  E(7,-9,2.6,2.6,F);E(-7,-9,2.6,2.6,F);c.restore()}

/* ---------- the screen ---------- */
let W=300,Hs=400,DPR=1,ub=1,zoom=1,u=1,FH=100,SL=10,RWp=200,RHp=100,RX=0,PIL=8;
let dropK=0,undo=null,gf=null,gameK=0;
let state='title',mode='build',camF=0,viewF=1,T=0,swing=0,busy=null,parts=[],toastT=0,capHide=false,capT=0,capFor=0,drop=0,cel=0,clouds=[],stars=[],rep=0,drag=null,hudKey='';
const RT={};const rtOf=k=>RT[k]||(RT[k]={x:null,y:null,sc:1,jump:0,spin:0,shake:0,say:null,al:1,ph:(hash(k)%628)/100,box:null});
function resize(){W=innerWidth||300;Hs=innerHeight||400;DPR=Math.min(3,Math.max(1,window.devicePixelRatio||1));cv.width=Math.round(W*DPR);cv.height=Math.round(Hs*DPR);
  stage.style.width=W+'px';stage.style.height=Hs+'px';stage.style.setProperty('--s',Math.max(1,Math.min(W/168,Hs/200)).toFixed(3));
  ub=Math.max(.8,Math.min((W-34)/216,Hs*.6/110));setU();
  clouds=Array.from({length:6},(_,i)=>({x:(i*97)%W,y:30+((i*71)%5)*FH*.45,s:.6+(i%3)*.3}));stars=Array.from({length:90},(_,i)=>({x:(i*73)%W,y:(i*151)%Hs,b:i%4}))}
/* building, the tower is close up; looking at all your floors, it steps back so you see several at once */
function setU(){u=ub*zoom;RWp=200*u;RHp=100*u;SL=10*u;FH=RHp+SL;PIL=8*u;RX=Math.round((W-RWp)/2)}
const wy=f=>Hs/2-(f-camF)*FH;                                     /* a height on the tower (in floors) to a place on the screen */
const SKY=[[0,'#6ec0ff','#d8f0ff'],[.2,'#4a8ae0','#a8d0f8'],[.5,'#2a2a7a','#6a4aa0'],[.8,'#0a0a2a','#24184a'],[1,'#03030c','#0c0820']];
const mix=(a,b,t)=>{const A=rgb(a),B=rgb(b);return`rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`};
function skyAt(f){for(let i=1;i<SKY.length;i++)if(f<=SKY[i][0]){const a=SKY[i-1],b=SKY[i],t=(f-a[0])/(b[0]-a[0]);return[mix(a[1],b[1],t),mix(a[2],b[2],t)]}return[SKY[4][1],SKY[4][2]]}

function drawThing(v,k,X,Y){const t=v.t,key=keyOf(v.k,t),st=meta.st[key]||{},rt=rtOf(key),b=bounds(t),sp=spotOf(v.k,t);
  const vis=st.vis!=null?st.vis:!t.hidden;rt.al+=((vis?1:0)-rt.al)*Math.min(1,dt*10);if(rt.al<.02){rt.box=null;return}
  let tx=sp.x,ty=sp.y;const mv=t.tap.find(a=>a.do==='move');if(mv&&st.pi)[tx,ty]=mv.to[(st.pi-1)%mv.to.length];
  if(rt.x==null||rt.k!==k){rt.x=tx;rt.y=ty;rt.k=k}rt.x+=(tx-rt.x)*Math.min(1,dt*7);rt.y+=(ty-rt.y)*Math.min(1,dt*7);
  let x=rt.x,y=rt.y,rot=0,face=st.fl?-1:1,al=rt.al;
  if(t.anim==='walk'){const r=Math.min(36,Math.max(8,(200-b.w)/4)),a=T*.55+rt.ph;x+=Math.sin(a)*r;if(Math.cos(a)<0)face=-face}
  else if(t.anim==='drive'){const span=200+b.w+10;x=((x+T*30+rt.ph*40)%span+span)%span-b.w-5}
  else if(t.anim==='bob')y+=Math.sin(T*2.4+rt.ph)*2.5;else if(t.anim==='spin')rot=T*2;else if(t.anim==='sway')rot=Math.sin(T*1.8+rt.ph)*.08;else if(t.anim==='blink')al*=Math.floor(T*2+rt.ph)%2?.35:1;
  if(rt.jump>0){rt.jump-=dt;y-=Math.sin(Math.PI*clamp(1-rt.jump/.5,0,1))*16}if(rt.spin>0){rt.spin-=dt;rot+=TAU*clamp(1-rt.spin/.6,0,1)}if(rt.shake>0){rt.shake-=dt;x+=Math.sin(T*70)*2}
  rt.sc+=((st.g?1.35:1)-rt.sc)*Math.min(1,dt*8);const sc=rt.sc,cx=(b.x0+b.x1)/2,cy=b.y1;
  /* a shadow under anything standing near the floor */
  if(y+b.y1>92&&t.anim!=='bob'&&b.h<90){g.globalAlpha=.18*al;g.fillStyle='#000';g.beginPath();g.ellipse(X+(x+cx)*u,Y+99*u,b.w*.42*sc*u,2.4*u,0,0,TAU);g.fill()}
  g.globalAlpha=al;g.save();g.translate(X+(x+cx)*u,Y+(y+cy)*u);if(rot)g.translate(0,-b.h/2*u*sc),g.rotate(rot),g.translate(0,b.h/2*u*sc);g.scale(sc*face,sc);g.translate(-cx*u,-cy*u);
  const cc=t.tap.find(a=>a.do==='color'),recol=cc&&st.ci?cc.c[(st.ci-1)%cc.c.length]:null,main=t.shapes[0].c;
  for(const s of t.shapes)drawShape(s,u,recol&&s.c===main?recol:null);g.restore();g.globalAlpha=1;
  rt.box={k,x0:x+cx-(cx-b.x0)*sc,x1:x+cx+(b.x1-cx)*sc,y0:y+cy-(cy-b.y0)*sc,y1:y+cy,cx:x+cx,top:y+cy-b.h*sc}}
let dt=0;
function drawFloor(k){const f=floors[k-1],top=wy(k),X=RX,bot=top+RHp;if(bot<-FH||top>Hs+FH)return;
  /* the tower's own walls either side, and the slab under the room */
  const tw=['#c8b8a0','#b8a890'];g.fillStyle=tw[k%2];g.fillRect(X-PIL,top,PIL,RHp);g.fillRect(X+RWp,top,PIL,RHp);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(X-PIL,top,2*u,RHp);g.fillRect(X+RWp+PIL-2*u,top,2*u,RHp);
  g.fillStyle=f.floor;g.fillRect(X-PIL-2*u,bot,RWp+2*PIL+4*u,SL);g.fillStyle=shade(f.floor,.35);g.fillRect(X-PIL-2*u,bot,RWp+2*PIL+4*u,1.5*u);g.fillStyle=shade(f.floor,-.35);g.fillRect(X-PIL-2*u,bot+SL-1.5*u,RWp+2*PIL+4*u,1.5*u);
  g.save();g.beginPath();g.rect(X,top,RWp,RHp);g.clip();const gr=g.createLinearGradient(0,top,0,bot);gr.addColorStop(0,shade(f.wall,.18));gr.addColorStop(1,shade(f.wall,-.12));g.fillStyle=gr;g.fillRect(X,top,RWp,RHp);
  g.fillStyle=shade(f.wall,-.28);g.fillRect(X,bot-5*u,RWp,5*u);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(X,top,RWp,3*u);
  const list=thingsOn(k);for(const v of list)drawThing(v,k,X,top);
  if(busy&&busy.kind==='edit'&&busy.k===k){g.fillStyle='rgba(12,8,32,.62)';g.fillRect(X,top,RWp,RHp);g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.font=`700 ${Math.round(9*u)}px system-ui,sans-serif`;
    g.fillText(busy.phase==='game'?'WRITING THE GAME…':'CHANGING FLOOR '+k+'…',X+RWp/2,top+RHp*.36);const bw=RWp*.6;g.fillStyle='rgba(255,255,255,.2)';rr(g,X+RWp/2-bw/2,top+RHp*.5,bw,6*u,3*u);g.fill();g.fillStyle='#ffd23f';rr(g,X+RWp/2-bw/2,top+RHp*.5,Math.max(6*u,bw*(busy.p||0)),6*u,3*u);g.fill();g.textAlign='left'}
  if((drop>0&&k===floors.length&&dropK===0)||(drop>0&&dropK===k)){g.fillStyle=`rgba(255,255,255,${(drop*1.2).toFixed(2)})`;g.fillRect(X,top,RWp,RHp)}g.restore();
  g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;g.strokeRect(X-.5,top-.5,RWp+1,RHp+1);
  /* the floor number on a plate */
  const lb=String(k);g.font=`700 ${Math.round(8.5*u)}px system-ui,sans-serif`;const tw2=g.measureText(lb).width+7*u,px=X-PIL-tw2+3*u,py=top+6*u;g.fillStyle='#24184a';rr(g,px,py,tw2,12*u,3*u);g.fill();g.strokeStyle='#ffd23f';g.lineWidth=1;g.stroke();
  g.fillStyle='#ffd23f';g.textBaseline='middle';g.fillText(lb,px+3.5*u,py+6.4*u);
  if(f.game){const gy=py+15*u,gw=12*u;g.fillStyle='#ffd23f';rr(g,X-PIL-gw+3*u,gy,gw,12*u,3*u);g.fill();g.fillStyle='#24184a';g.beginPath();g.moveTo(X-PIL-gw+7*u,gy+3*u);g.lineTo(X-PIL-gw+12*u,gy+6*u);g.lineTo(X-PIL-gw+7*u,gy+9*u);g.fill()}}
function bubbles(){for(const k in RT){const rt=RT[k];if(!rt.say)continue;rt.say.t-=dt;if(rt.say.t<=0||!rt.box){rt.say=null;continue}const b=rt.box,fy=wy(b.k),X=RX+b.cx*u,Y=fy+b.top*u-4*u;
  g.font=`700 ${Math.round(7.5*u)}px system-ui,sans-serif`;const w=Math.min(W-12,g.measureText(rt.say.text).width+10*u),h=12*u,bx=clamp(X-w/2,6,W-6-w),by=Math.max(4,Y-h-4*u);
  g.globalAlpha=Math.min(1,rt.say.t*4);g.fillStyle='#ffffff';g.strokeStyle='#24184a';g.lineWidth=Math.max(1,u*.8);rr(g,bx,by,w,h,4*u);g.fill();g.stroke();g.beginPath();g.moveTo(clamp(X,bx+6,bx+w-6)-3*u,by+h-.5);g.lineTo(clamp(X,bx+6,bx+w-6),by+h+4*u);g.lineTo(clamp(X,bx+6,bx+w-6)+3*u,by+h-.5);g.fill();
  g.fillStyle='#24184a';g.textBaseline='middle';g.textAlign='center';g.fillText(rt.say.text,bx+w/2,by+h/2+.5,w-8*u);g.textAlign='left';g.globalAlpha=1}}

function draw(){g.setTransform(DPR,0,0,DPR,0,0);const n=floors.length,alt=clamp(camF/GOAL,0,1),[s1,s2]=skyAt(alt),gr=g.createLinearGradient(0,0,0,Hs);gr.addColorStop(0,s1);gr.addColorStop(1,s2);g.fillStyle=gr;g.fillRect(0,0,W,Hs);
  if(alt>.25){g.globalAlpha=clamp((alt-.25)*2.5,0,1);g.fillStyle='#fff';for(const s of stars){const z=s.b===0&&Math.floor(T*2+s.x)%3===0?2:1;g.fillRect(s.x,((s.y+camF*FH*.04)%Hs+Hs)%Hs,z,z)}g.globalAlpha=1}
  if(alt<.6){g.globalAlpha=1-alt/.6;for(const c of clouds){const x=((c.x+T*6*c.s)%(W+80))-40,y=((c.y+camF*FH*.3)%(Hs+80)+Hs+80)%(Hs+80)-40;g.fillStyle='#ffffff';g.beginPath();g.ellipse(x,y,22*c.s,8*c.s,0,0,TAU);g.ellipse(x+12*c.s,y-5*c.s,14*c.s,9*c.s,0,0,TAU);g.ellipse(x-12*c.s,y-2*c.s,11*c.s,7*c.s,0,0,TAU);g.fill()}g.globalAlpha=1}
  {const pr=n/GOAL,r=10+Math.sqrt(pr)*70,mx=W-r*.55-14,my=r*.55+30;g.fillStyle='rgba(255,246,208,.25)';g.beginPath();g.arc(mx,my,r*1.25,0,TAU);g.fill();g.fillStyle='#fff6d0';g.beginPath();g.arc(mx,my,r,0,TAU);g.fill();g.fillStyle='#e8dca8';for(const[a,b2,c]of[[.3,.2,.22],[-.3,.35,.15],[.1,-.35,.18]]){g.beginPath();g.arc(mx+a*r,my+b2*r,c*r,0,TAU);g.fill()}}
  /* the ground and the building site */
  const gy=wy(0);if(gy<Hs){g.fillStyle='#4ab84a';g.fillRect(0,gy,W,Hs-gy);g.fillStyle='#3a9a3a';g.fillRect(0,gy,W,3*u);g.fillStyle='#8a5a2a';g.fillRect(0,gy+14*u,W,Hs);g.fillStyle='#7a4a22';for(let x=0;x<W;x+=18)g.fillRect(x+(x*7%11),gy+20*u+(x*13%9),5,3);
    g.fillStyle='#2f8a3a';for(const bx of[RX-30*u,RX+RWp+18*u]){g.beginPath();g.ellipse(bx,gy,12*u,8*u,0,Math.PI,0);g.fill()}}
  const k0=Math.max(1,Math.floor(camF-Hs/2/FH)-1),k1=Math.min(n,Math.ceil(camF+Hs/2/FH)+1);for(let k=k0;k<=k1;k++)drawFloor(k);
  /* the roof, and above it the frame of the next floor with you on the roof */
  const rt=wy(n);if(rt>-FH&&rt<Hs+FH&&n<GOAL){const rx=RX-PIL-3*u,rw=RWp+2*PIL+6*u;g.fillStyle='#5a5a6a';g.fillRect(rx,rt-3*u,rw,4*u);g.fillStyle='#7a7a8a';g.fillRect(rx,rt-3*u,rw,1.2*u);
    if(mode==='build'&&state==='play'||busy&&busy.kind==='build'){g.save();g.setLineDash([5*u,4*u]);g.strokeStyle=busy?'rgba(255,210,63,.95)':'rgba(255,255,255,.75)';g.lineWidth=Math.max(1,1.2*u);g.strokeRect(RX,wy(n+1)+SL,RWp,RHp);g.restore();
      for(const sx of[RX-PIL,RX+RWp]){g.fillStyle='rgba(255,210,63,.55)';g.fillRect(sx,wy(n+1)+SL,PIL*.5,RHp)}
      g.font=`700 ${Math.round(9*u)}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(255,255,255,.95)';g.strokeStyle='rgba(20,14,50,.6)';g.lineWidth=3;
      const msg=busy&&busy.kind==='build'?(busy.phase==='game'?'WRITING THE GAME…':`BUILDING FLOOR ${n+1}…`):`FLOOR ${n+1}: PRESS A TO BUILD`;g.strokeText(msg,W/2,wy(n+1)+SL+RHp*.32);g.fillText(msg,W/2,wy(n+1)+SL+RHp*.32);
      if(busy&&busy.kind==='build'){const p=busy.p||0,bw=RWp*.6;g.fillStyle='rgba(20,14,50,.6)';rr(g,W/2-bw/2,wy(n+1)+SL+RHp*.45,bw,6*u,3*u);g.fill();g.fillStyle='#ffd23f';rr(g,W/2-bw/2,wy(n+1)+SL+RHp*.45,Math.max(6*u,bw*p),6*u,3*u);g.fill();
        g.font=`600 ${Math.round(7*u)}px system-ui,sans-serif`;g.fillStyle='#fff';g.fillText(busy.phase==='game'?'this can take a minute or two':busy.p?'drawing…':'thinking…',W/2,wy(n+1)+SL+RHp*.62)}
      g.textAlign='left'}
    monkey(RX+RWp*.7,rt-3*u,u*.95,swing,cel>0?'yay':'')}
  for(const p of parts){g.globalAlpha=clamp(p.l*3,0,1);g.fillStyle=p.c;const s=p.z*u;g.fillRect(p.x-s/2,wy(p.f)-s/2,s,s)}g.globalAlpha=1;
  bubbles();
  if(n>=GOAL){g.fillStyle='rgba(3,3,12,.5)';g.fillRect(0,0,W,Hs);const r=Math.min(W,Hs)*.28,cy=Hs*.42;g.fillStyle='#fff6d0';g.beginPath();g.arc(W/2,cy,r,0,TAU);g.fill();monkey(W/2,cy-r+2*u,u*1.3,Math.sin(T*6)*.3,'yay')}}

/* ---------- touching things ---------- */
const toFloor=py=>camF+(Hs/2-py)/FH;
function thingAt(px,py){const f=toFloor(py),k=Math.ceil(f);if(k<1||k>floors.length)return null;const top=wy(k),ux=(px-RX)/u,uy=(py-top)/u;if(ux<-4||ux>204||uy<-30||uy>104)return null;
  const list=thingsOn(k);for(let i=list.length-1;i>=0;i--){const v=list[i],rt=RT[keyOf(v.k,v.t)];if(!rt||!rt.box||rt.al<.5||!v.t.tap.length)continue;const b=rt.box,p=Math.max(3,8-(b.x1-b.x0)/4);if(ux>=b.x0-p&&ux<=b.x1+p&&uy>=b.y0-p&&uy<=b.y1+p)return{v,k}}return null}
function tapThing(hit){const{v,k}=hit,t=v.t,key=keyOf(v.k,t),st=stOf(v.k,t),rt=rtOf(key);let changed=false;
  for(const a of t.tap){if(a.do==='say')rt.say={text:a.text,t:2.6};else if(a.do==='sound'){if(SFX[a.s])SFX[a.s]()}else if(a.do==='jump')rt.jump=.5;else if(a.do==='spin')rt.spin=.6;else if(a.do==='shake')rt.shake=.4;
    else if(a.do==='grow'){st.g=!st.g;changed=true}else if(a.do==='flip'){st.fl=!st.fl;changed=true}else if(a.do==='move'){st.pi=((st.pi||0)+1)%(a.to.length+1);changed=true}
    else if(a.do==='color'){st.ci=((st.ci||0)+1)%(a.c.length+1);changed=true}
    else if(a.do==='toggle'){const o=thingsOn(k).find(w=>w.t.id===a.id)||(floors[v.k-1].things.find(w=>w.id===a.id)&&{k:v.k,t:floors[v.k-1].things.find(w=>w.id===a.id)});if(o){const os=stOf(o.k,o.t),vis=os.vis!=null?os.vis:!o.t.hidden;os.vis=!vis;changed=true}}
    else if(a.do==='play'){const gk=v.k;setTimeout(()=>enterGame(gk),180)}
    else if(a.do==='go'&&a.floor<=floors.length){mode='view';viewF=a.floor;toast('Off to floor '+a.floor+'!');SFX.whoosh();capFor=0}
    else if(a.do==='swap'&&t.spots&&t.spots.length>1){const b=rt.box;if(b)poof(k,b.cx,(b.y0+b.y1)/2);st.sp=((st.sp||0)+1)%t.spots.length;const to=t.spots[st.sp].f;rt.x=null;SFX.poof();toast(cap1(t.name)+' went to floor '+to);changed=true;
      setTimeout(()=>{const s2=t.spots[st.sp];const b2=bounds(t);poof(to,s2.x+b2.w/2,s2.y+b2.h/2)},120)}}
  if(!t.tap.some(a=>a.do==='sound'||a.do==='swap'))SFX.pop();if(changed)SAVE.touch(null)}
const cap1=s=>s.charAt(0).toUpperCase()+s.slice(1);
function poof(k,ux,uy){for(let i=0;i<16;i++){const a=rnd()*TAU,s=30+rnd()*60;parts.push({x:RX+ux*u,f:k-1+(SL+(100-uy)*u)/FH,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.5,c:pick(['#ffffff','#ffd23f','#ffb0e0']),z:2.4})}}
function toast(t){toastEl.textContent=t;toastEl.hidden=false;toastT=2.4}

/* ---------- building a floor ---------- */
const OFF=['not_granted','sampling_disabled','unavailable','not_declared','capability_disabled','capability_removed'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function openTyper(kind,k,keep){if(state!=='play')return;if(busy){toast(busy.kind==='edit'?'Still changing floor '+busy.k+'…':'Still building floor '+(floors.length+1)+'…');return}
  if(kind!=='edit'&&floors.length>=GOAL)return;const f=kind==='edit'&&floors[k-1];if(kind==='edit'&&!f)return;state='type';typer.hidden=false;typer.dataset.kind=kind==='edit'?'edit':'build';typer.dataset.k=k||'';
  $('#tlab').textContent=f?'Change floor '+fmt(k)+' ('+f.title+'): what should be different?':'Floor '+fmt(floors.length+1)+': what does it have on it?';
  tin.placeholder=f?(f.game?'make the game harder, add a fish tank, paint the walls blue…':'make the sofa blue, add a fish tank, take out the lamp…'):'a racetrack where all the cars are bananas';
  $('#ttip').textContent=f?'Tip: you can ask for a game to play here too, like "put a little clicker game on this floor".':floors.length?'Tip: join floors ("add on to floor '+floors.length+' so its cat can visit"), or ask for a game ("build a little clicker game I can play on this floor").':'Tip: say what is on it and what it does, or ask for a game you can play.';
  $('#tmsg').textContent='';$('#tsimple').hidden=true;$('#tundo').hidden=!(f&&undo&&undo.k===k);$('#tgo').textContent=f?'CHANGE IT':'BUILD IT';
  if(!keep)tin.value='';setTimeout(()=>tin.focus(),30)}
function closeTyper(){typer.hidden=true;tin.blur();if(state==='type')state='play'}
function submit(simple){if(typer.dataset.kind==='edit')editFloor(+typer.dataset.k,simple);else build(simple)}
function failMsg(c){return c==='rate_limited'?'Claude is busy right now. Wait a little and try again.':c==='refused'?"Claude won't make that one. Try describing it another way.":c==='session_expired'?'You need to sign in to Claude again.':"That didn't come out right. Try again, or make a simple version."}
function failBack(kind,k,text,c){busy=null;openTyper(kind,k,true);tin.value=text;$('#tmsg').textContent=failMsg(c);$('#tsimple').hidden=false;$('#tgo').textContent='TRY AGAIN'}
const askFloor=p=>ZP.ask(p,{modelTier:meta.tier==='quick'?'quick':'default',onText:({text:s})=>{if(busy)busy.p=clamp((s||'').length/6500,.04,.97)}});
async function makeGame(q,text,old){busy.phase='game';busy.p=0;if(!ZP||typeof ZP.askText!=='function')throw{code:'unavailable'};
  const r=await ZP.askText(gamePrompt(q,text,old),{modelTier:'default',onText:({text:s})=>{if(busy)busy.p=clamp((s||'').length/(old?old.length*1.1:16000),.03,.97)}});
  const h=pullHtml(r&&r.text);if(!h)throw{code:r&&r.truncated?'too_big':'bad'};return h}
async function build(simple){const text=tin.value.trim();if(!text){$('#tmsg').textContent='Type what this floor has on it.';return}
  closeTyper();const n=floors.length+1;mode='build';busy={kind:'build',k:n,text,p:0,t:0,phase:'floor'};hideCap();let fl=null,note='';
  if(!simple)try{if(!ZP||typeof ZP.ask!=='function')throw{code:'unavailable'};fl=cleanFloor(await askFloor(prompt(text,n)),text,n);
      if(fl.game&&fl.game.idea){try{fl.game.html=await makeGame(fl.game,text,null)}catch(e){fl.game.html=tplGame(fl.game.title);note=" (The game didn't come out right this time, so it's a simple clicker for now. Change the floor to try again.)"}}else fl.game=null}
    catch(e){const c=e&&e.code;if(OFF.includes(c)){fl=null;note=c==='unavailable'?'':" (Claude isn't switched on for this page, so this is a simple version.)"}else return failBack('build',0,text,c)}
  if(!fl){fl=localFloor(text,n);if(wantsGame(text)){fl.things=fl.things.filter(t=>t.id!=='sign');fl.title='ARCADE FLOOR';fl.story='You bolt an arcade machine to the floor and plug it in. It hums and lights up: Star Clicker!'+note;note='';fl.game={title:'Star Clicker',idea:text,html:tplGame('Star Clicker')}}}
  busy=null;if(floors.length+1!==n)return;
  const moved=applyFloor(fl);SFX.build();drop=.6;dropK=0;cel=1.6;for(let i=0;i<26;i++)parts.push({x:RX+rnd()*RWp,f:n-.1,vx:(rnd()-.5)*90,vy:30+rnd()*80,l:.8,c:pick(['#ffd23f','#ffffff','#7df9d2','#ffb0e0']),z:2.6});
  const f=floors[n-1];showCap(f.title,f.story+(moved.length?' ('+moved.map(cap1).join(', ')+' moved in: tap '+(moved.length>1?'them':'it')+' to send '+(moved.length>1?'them':'it')+' back and forth.)':'')+(f.game?' Tap the '+(f.things.find(t=>t.tap.some(a=>a.do==='play'))||{name:'machine'}).name+' to play '+f.game.title+'.':'')+note,12);capFor=n;hudKey='';hudText();
  if(floors.length>=GOAL)win()}
async function editFloor(k,simple){const text=tin.value.trim(),f=floors[k-1];if(!f)return;if(!text){$('#tmsg').textContent='Type what should be different.';return}
  closeTyper();mode='view';viewF=k;busy={kind:'edit',k,text,p:0,t:0,phase:'floor'};hideCap();let fl=null,note='',game=f.game?Object.assign({},f.game):null;
  if(!simple)try{if(!ZP||typeof ZP.ask!=='function')throw{code:'unavailable'};fl=cleanFloor(await askFloor(editPrompt(k,text)),f.text,k);const q=fl.game;
      if(q&&q.remove)game=null;
      else if(q&&q.idea){try{game={title:q.title,idea:q.idea,html:await makeGame(q,text,null),save:null}}catch(e){game={title:q.title,idea:q.idea,html:tplGame(q.title),save:null};note=" (The game didn't come out right this time, so it's a simple clicker for now.)"}}
      else if(q&&q.change&&game&&game.html){try{game=Object.assign({},game,{html:await makeGame(Object.assign({},game,q),text,game.html)})}catch(e){note=" (The game couldn't be changed this time. Try again.)"}}}
    catch(e){const c=e&&e.code;if(OFF.includes(c)){fl=null;note=c==='unavailable'?'':" (Claude isn't switched on for this page, so this is a simple version.)"}else return failBack('edit',k,text,c)}
  if(!fl){fl=localEdit(f,text,k);if(wantsGame(text)&&!game)game={title:'Star Clicker',idea:text,html:tplGame('Star Clicker'),save:null}}
  busy=null;if(!floors[k-1])return;const keySt={};for(const key in meta.st)if(key.startsWith(k+':'))keySt[key]=meta.st[key];undo={k,floor:JSON.parse(JSON.stringify(f)),st:JSON.parse(JSON.stringify(keySt))};
  const moved=replaceFloor(k,fl,game);SFX.build();drop=.6;dropK=k;for(let i=0;i<20;i++)parts.push({x:RX+rnd()*RWp,f:k-.4,vx:(rnd()-.5)*90,vy:20+rnd()*70,l:.7,c:pick(['#ffd23f','#ffffff','#7df9d2']),z:2.4});
  const nf=floors[k-1];capFor=k;showCap('FLOOR '+k+' · '+nf.title,nf.story+(moved.length?' ('+moved.map(cap1).join(', ')+' moved in: tap to send back and forth.)':'')+note,12);hudKey='';hudText()}
function undoEdit(){if(!undo||!floors[undo.k-1])return;const k=undo.k;for(const key in meta.st)if(key.startsWith(k+':'))delete meta.st[key];Object.assign(meta.st,undo.st);floors[k-1]=undo.floor;for(const key in RT)if(key.startsWith(k+':'))delete RT[key];
  SAVE.touch(k-1);SAVE.touchGame(k-1);reindex();undo=null;closeTyper();toast('Floor '+k+' is back how it was');capFor=0;hudKey='';hudText()}
/* ---------- playing a floor's game: the screen becomes the game ---------- */
const gameEl=$('#game');
function withSave(html,save){const inj='<script>window.ZP_SAVE='+JSON.stringify(save==null?null:save).replace(/</g,'\\u003c')+';<\/script>',m=/<head[^>]*>/i.exec(html);return m?html.slice(0,m.index+m[0].length)+inj+html.slice(m.index+m[0].length):inj+html}
function enterGame(k){const f=floors[k-1];if(state!=='play'||M)return;if(!f||!f.game||!f.game.html){toast('There is no game on this floor yet.');return}
  state='game';gameK=k;mode='view';viewF=k;hud.hidden=true;hideCap();SND.stop();gameEl.hidden=false;gameEl.classList.remove('in');void gameEl.offsetWidth;gameEl.classList.add('in');$('#gtitle').textContent=f.game.title;
  gf=document.createElement('iframe');gf.setAttribute('sandbox','allow-scripts');gf.setAttribute('allow','autoplay');gf.title=f.game.title;gf.srcdoc=withSave(f.game.html,f.game.save);$('#gbox').append(gf);
  setTimeout(()=>{try{gf&&gf.focus()}catch(e){}},400);hudKey='';hudText()}
let leaving=null;
function exitGame(){if(state!=='game')return;if(gf){const f=gf;leaving=f;gf=null;try{f.contentWindow.postMessage({zp:'leave'},'*')}catch(e){}setTimeout(()=>{f.remove();if(leaving===f)leaving=null},300)}gameEl.hidden=true;state='play';hud.hidden=false;capFor=0;SND.play(SONG);SAVE.touchGame(gameK-1);hudKey='';hudText();try{window.focus()}catch(e){}}
addEventListener('message',e=>{const fr=gf||leaving;if(!fr||e.source!==fr.contentWindow)return;const m=e.data;if(!m||typeof m!=='object')return;
  if(m.zp==='save'){let s;try{s=JSON.stringify(m.data)}catch(x){return}const f=floors[gameK-1];if(s&&s.length<=24000&&f&&f.game){f.game.save=JSON.parse(s);SAVE.touchGame(gameK-1,true)}}else if(m.zp==='exit')exitGame()});
function showCap(t,b,secs){if(capHide)return;cap.hidden=false;cap.innerHTML='<b></b><span></span>';$('b',cap).textContent=t;$('span',cap).textContent=b;capT=secs||1e9}
function hideCap(){cap.hidden=true;capT=0}
function win(){meta.won=1;SAVE.touch(null);SND.stop();SFX.win();showCap('THE MOON!','You hammer floor 10,000 into place, reach up and grab the edge of the moon. You pull yourself onto the soft grey dust, plant your hammer like a flag, and look down at every floor you dreamed up.',1e9)}

/* ---------- the second screen ---------- */
let pcv=null;
function hudText(){const n=floors.length,view=mode==='view'&&(state==='play'||state==='game');$('#hF').textContent=view?'FLOOR '+fmt(viewF)+' OF '+fmt(n):fmt(n)+' / '+fmt(GOAL)+' FLOORS';
  $('#hMode').textContent=view?'LOOKING':'BUILDING';$('#hMode').className=view?'look':'';$('#hB').textContent=view?'B · BUILD MODE':'B · SEE ALL FLOORS';hud.classList.toggle('view',view);
  const vf=floors[viewF-1];$('#hA').textContent=view&&vf?(vf.game?'A · PLAY / CHANGE':'A · CHANGE FLOOR '+viewF):'A · BUILD';
  if(!PANEL)return;const k=hudKey;const key=[mode,viewF,n,state].join();if(key===k)return;hudKey=key;
  if(state==='game'&&floors[gameK-1]){PANEL.rows([['PLAYING',floors[gameK-1].game.title],['ON FLOOR',fmt(gameK)],['LEAVE','START']]);return}
  PANEL.rows(view&&floors[viewF-1]?[['FLOOR',fmt(viewF)],['NAME',floors[viewF-1].title],['THINGS',thingsOn(viewF).length],['GAME',floors[viewF-1].game?floors[viewF-1].game.title:'none']]:[['FLOORS',fmt(n)],['TO THE MOON',fmt(GOAL-n)],['NEXT','FLOOR '+fmt(n+1)],['MODE','BUILDING']]);
  if(!pcv)pcv=PANEL.canvas(92,26,'YOUR TOWER');if(!pcv)return;const x=pcv.getContext('2d');x.fillStyle='#0c0820';x.fillRect(0,0,92,26);x.fillStyle='#3a9a3a';x.fillRect(0,22,92,4);
  const per=Math.max(1,Math.ceil(n/84));for(let i=0;i*per<n;i++){const f=floors[i*per];x.fillStyle=f.wall;x.fillRect(4+i,4,1,18)}x.fillStyle='#fff6d0';x.beginPath();x.arc(88,5,3.5,0,TAU);x.fill();
  if(view){x.fillStyle='#ffd23f';x.fillRect(3+Math.floor((viewF-1)/per),1,3,24)}}

/* ---------- menus and buttons ---------- */
const soundItem=()=>({t:'SOUND',v:()=>SOUND_NAMES[meta.sound],adj:d=>{meta.sound=(meta.sound+d+3)%3;SND.mode=meta.sound;SAVE.touch(null)}});
const tierItem=()=>({t:'DRAWING',v:()=>meta.tier==='quick'?'QUICK':'DETAILED',adj:()=>{meta.tier=meta.tier==='quick'?'default':'quick';SAVE.touch(null)}});
function title(){state='title';hud.hidden=true;hideCap();closeTyper();SND.stop();camF=Math.max(.6,floors.length*.5);
  menu({cls:'title',html:'<h1 class="logo">MOON<br>STACK</h1><p>You are a monkey with a hammer. Dream up ten thousand floors and climb onto the moon.</p>',
    items:[{t:floors.length?'KEEP BUILDING':'START BUILDING',fn:play},tierItem(),soundItem(),{t:'HOW TO PLAY',fn:how},...(floors.length?[{t:'START OVER',fn:()=>menu({html:'<h2>START OVER?</h2><p>Your tower of '+fmt(floors.length)+' floors will be knocked down.</p>',items:[{t:'NO, KEEP IT',fn:title},{t:'YES, START OVER',fn:()=>{floors=[];meta.st={};meta.won=0;reindex();SAVE.touch(0);title()}}],back:title})}]:[])],foot:'A BUILD A FLOOR · B SEE ALL FLOORS'})}
function how(){menu({html:'<h2>HOW TO PLAY</h2><p class="keys"><b>A</b>: build the next floor. Type what it has on it, like <i>a racetrack where all the cars are bananas</i>.<br><b>B</b>: switch between building and looking at all your floors. <b>▲ ▼</b> go up and down (<b>◀ ▶</b> ten at a time), or drag the tower. Looking at a floor, <b>A</b> changes it.<br><b>Tap things</b> to play with them. Ask for a game (<i>a little clicker game I can play</i>) and tap its machine to play it; <b>START</b> leaves the game.<br>Mention another floor to join them: <i>add on to floor 29 so its cat can be roommates with the dog here</i>.<br><b>SELECT</b> hides the stories · <b>START</b> pauses.</p>',items:[{t:'BACK',fn:()=>state==='pause'?pause():title()}],back:()=>state==='pause'?pause():title()})}
function play(){closeMenu();state='play';hud.hidden=false;if(floors.length>=GOAL)win();hudKey='';hudText();SND.play(SONG)}
function pause(){state='pause';menu({html:'<h2>PAUSED</h2><p>'+fmt(floors.length)+' floors built</p>',items:[{t:'BACK TO THE TOWER',fn:play},tierItem(),soundItem(),{t:'HOW TO PLAY',fn:how},{t:'TITLE',fn:title}],back:play})}
function actA(){if(state!=='play')return;if(mode==='view'&&floors.length){const k=viewF,f=floors[k-1];if(!f)return;
    if(f.game)menu({html:'<h2>FLOOR '+k+'</h2><p>'+esc(f.title)+'</p>',items:[{t:'PLAY '+esc(f.game.title.toUpperCase().slice(0,20)),fn:()=>{closeMenu();enterGame(k)}},{t:'CHANGE THIS FLOOR',fn:()=>{closeMenu();openTyper('edit',k)}},{t:'CANCEL',fn:closeMenu}],back:closeMenu});else openTyper('edit',k)}
  else openTyper('build')}
function setMode(m){mode=m;if(m==='view'){viewF=clamp(Math.round(camF-.55)+1,1,Math.max(1,floors.length));capFor=0;SFX.tick()}else{hideCap();SFX.tick()}hudKey='';hudText()}
function stepView(d){if(!floors.length)return;const v=clamp(viewF+d,1,floors.length);if(v!==viewF){viewF=v;SFX.tick();hudText()}}
onBtn=(b,d)=>{if(state==='game'){if(b==='start'){if(d)exitGame();return}try{gf&&gf.contentWindow&&gf.contentWindow.postMessage({zp:'btn',b,down:!!d},'*')}catch(e){}return}if(state==='type')return;if(M){if(d)menuInput(b);return}if(!d){if(b==='up'||b==='down'||b==='left'||b==='right')rep=0;return}if(state!=='play')return;
  if(b==='a')actA();else if(b==='b'){if(busy&&mode==='build'&&!floors.length)return;setMode(mode==='build'?'view':'build')}else if(b==='start')pause();
  else if(b==='select'){capHide=!capHide;if(capHide)hideCap();else capFor=0;toast(capHide?'Stories hidden':'Stories shown')}
  else if(b==='up'||b==='down'||b==='left'||b==='right'){if(mode==='build'){if(!floors.length)return;setMode('view')}stepView(b==='up'?1:b==='down'?-1:b==='right'?10:-10);rep=.38}};
stage.addEventListener('pointerdown',e=>{if(M||state!=='play'||e.target.closest('#typer,#hud button,#cap'))return;SND.unlock();const r=stage.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top,hit=thingAt(px,py);
  if(hit){tapThing(hit);e.preventDefault();return}if(floors.length)drag={y:py,f:camF,moved:false,id:e.pointerId};e.preventDefault()});
stage.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const r=stage.getBoundingClientRect(),py=e.clientY-r.top;if(Math.abs(py-drag.y)>6)drag.moved=true;if(drag.moved){if(mode!=='view')setMode('view');camF=clamp(drag.f+(py-drag.y)/FH,.4,floors.length+.6)}});
for(const ev of['pointerup','pointercancel'])stage.addEventListener(ev,()=>{if(drag&&drag.moved){viewF=clamp(Math.round(camF-.55)+1,1,floors.length);hudText()}drag=null});
/* typing must not move the monkey: keep the keys inside the box */
for(const ev of['keydown','keyup'])tin.addEventListener(ev,e=>{e.stopPropagation();if(ev==='keydown'&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit(false)}else if(ev==='keydown'&&e.key==='Escape')closeTyper()});
$('#tgo').addEventListener('click',()=>submit(false));$('#tsimple').addEventListener('click',()=>submit(true));$('#tundo').addEventListener('click',undoEdit);$('#gx').addEventListener('click',exitGame);$('#tno').addEventListener('click',closeTyper);
$('#hA').addEventListener('click',e=>{e.stopPropagation();SND.unlock();actA()});$('#hB').addEventListener('click',e=>{e.stopPropagation();SND.unlock();if(state==='play')setMode(mode==='build'?'view':'build')});
for(const id of['#hA','#hB'])$(id).addEventListener('pointerdown',e=>e.stopPropagation());

let lastT=performance.now();
function frame(now){dt=Math.max(0,Math.min(.05,(now-lastT)/1000));lastT=now;T+=dt;swing=Math.max(0,swing-dt*4);if(cel>0)cel-=dt;if(drop>0)drop=Math.max(0,drop-dt);
  {const zt=state==='title'||mode==='view'?.6:1;if(Math.abs(zt-zoom)>.002){zoom+=(zt-zoom)*Math.min(1,dt*7);setU()}}
  if(busy){busy.t+=dt;if(Math.floor(busy.t*3)!==Math.floor((busy.t-dt)*3)){swing=1;SFX.hit();parts.push({x:RX+RWp*.7+8*u,f:floors.length+.02,vx:(rnd()-.5)*50,vy:40+rnd()*40,l:.4,c:'#ffe98a',z:2})}}
  if(state==='play'&&mode==='view'&&rep>0&&(held.up||held.down||held.left||held.right)){rep-=dt;if(rep<=0){stepView(held.up?1:held.down?-1:held.right?10:-10);rep=.08}}
  const tgt=state==='title'?Math.max(.6,floors.length*.5+Math.sin(T*.2)*Math.max(0,floors.length*.4)):mode==='view'&&floors.length?viewF-1+.56:floors.length+.15;if(!drag)camF+=(tgt-camF)*Math.min(1,dt*(Math.abs(tgt-camF)>8?10:6));
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.l-=dt;if(p.l<=0){parts.splice(i,1);continue}p.x+=p.vx*dt;p.f+=p.vy*dt/FH;p.vy-=220*dt}
  if(toastT>0){toastT-=dt;if(toastT<=0)toastEl.hidden=true}if(capT>0&&capT<1e8){capT-=dt;if(capT<=0)hideCap()}
  /* looking at a floor: its name and story */
  if(state==='play'&&mode==='view'&&floors.length&&capFor!==viewF&&Math.abs(camF-(viewF-1+.56))<.3){capFor=viewF;const f=floors[viewF-1];showCap(f.title,f.story||f.text,1e9)}
  draw();requestAnimationFrame(frame)}
addEventListener('resize',()=>{resize();draw()});
SAVE.load();reindex();SND.mode=meta.sound;
hookConsole('moonstack','Moonstack',SAVE);
resize();title();requestAnimationFrame(frame);
SAVE.init(()=>{reindex();SND.mode=meta.sound;if(state==='title')title();hudKey='';hudText()});
window.__ms={enterGame,exitGame,editFloor,replaceFloor,undoEdit,actA,tplGame,get gf(){return gf},get gameK(){return gameK},get state(){return state},get mode(){return mode},get floors(){return floors},get meta(){return meta},get viewF(){return viewF},get camF(){return camF},get busy(){return busy},RT,localFloor,cleanFloor,applyFloor,thingsOn,thingAt,tapThing,openTyper,build,title,play,setMode,draw,btnSet,tin,refsIn,prompt,wy,get u(){return u},get RX(){return RX},spotOf,keyOf};
