#!/usr/bin/env python3
"""Builds Lynties 3D from the regular Lynties: python3 build.py BASE.html OUT.html

The 3D version is the same game with a new world view. This script adds the hooks the 3D layer needs and pastes
src/w3d.js into the game's script, so the 3D branch can be rebuilt whenever the main game changes. The 3D layer
loads three.js from 3d/three.module.min.js next to the page (or, in the offline edition, from copies packed
inside the page) and falls back to the pixel-art view if that fails."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))


def main(base, out):
    s = open(base, encoding='utf-8').read()

    def rep(a, b, n=1):
        nonlocal s
        c = s.count(a)
        if c != n:
            sys.exit('patch target found %d times (wanted %d): %s' % (c, n, a[:90]))
        s = s.replace(a, b)

    # the 3D canvas sits under the pixel canvas, which stays on top for wipes, alerts and battles
    rep("#cv{display:block;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges}",
        "#cv{display:block;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges;position:relative;z-index:1}\n"
        "#cv3{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:0}")

    # keep each tile's ground layer and object layer apart, so the 3D world can lay the ground flat and stand objects up
    rep("const post=d.p(g,o,r,f);o.outline();g.over(o);if(typeof post==='function')post(g);fr.push(g.canvas(1))}TIMG[name].push(fr)}}}",
        "const post=d.p(g,o,r,f);const g0=new Buf(16,16);g0.d=g.d.slice();if(typeof post==='function')post(g0);o.outline();g.over(o);if(typeof post==='function')post(g);fr.push(g.canvas(1));"
        "gr.push(g0.canvas(1));if(o.d.some(v=>v!==null))ob.push(o.canvas(1))}TIMG[name].push(fr);TIMG_G[name].push(gr);if(ob.length)TIMG_O[name].push(ob)}}}")
    rep("function buildTiles(){for(const[name,d]of Object.entries(TL)){TIMG[name]=[];for(let v=0;v<4;v++){const fr=[];",
        "const TIMG_G={},TIMG_O={};\nfunction buildTiles(){for(const[name,d]of Object.entries(TL)){TIMG[name]=[];TIMG_G[name]=[];TIMG_O[name]=[];for(let v=0;v<4;v++){const fr=[],gr=[],ob=[];")

    # the screen draws the 3D world when it can
    rep("if(B&&B.shown){const sh=B.shake&&now-B.shake<260;ctx.save();if(sh)ctx.translate(Math.round((rnd()-.5)*5),Math.round((rnd()-.5)*4));drawBattle(now);ctx.restore()}else if(S&&S.flags.started)drawWorld(now);else{ctx.fillStyle='#0a1026';ctx.fillRect(0,0,W,H)}",
        "const w3on=W3.ok&&!(B&&B.shown)&&!!(S&&S.flags.started);show3D(w3on);\n"
        "  if(B&&B.shown){const sh=B.shake&&now-B.shake<260;ctx.save();if(sh)ctx.translate(Math.round((rnd()-.5)*5),Math.round((rnd()-.5)*4));drawBattle(now);ctx.restore()}else if(S&&S.flags.started){if(w3on)draw3D(now);else drawWorld(now)}else{ctx.fillStyle='#0a1026';ctx.fillRect(0,0,W,H)}")
    rep("if(cv.width!==240||cv.height!==H){cv.width=240;cv.height=H}ctx.imageSmoothingEnabled=false}",
        "if(cv.width!==240||cv.height!==H){cv.width=240;cv.height=H}ctx.imageSmoothingEnabled=false;size3D()}")

    # the trainer editor: a 3D figure beside the pixel battle pose
    rep('<canvas id="lookCv" width="160" height="88" aria-label="Your trainer"></canvas>',
        '<div class="look-stage"><canvas id="lookCv" width="160" height="88" aria-label="Your trainer"></canvas><canvas id="look3" aria-hidden="true"></canvas></div>')
    rep("#lookCv{width:320px;", ".look-stage{position:relative;width:320px;max-width:100%;margin:0 auto}#look3{position:absolute;right:3%;top:3%;width:40%;height:94%;pointer-events:none}\n#lookCv{display:block;width:320px;")
    rep("g.fillStyle='rgba(9,15,36,.3)';g.beginPath();g.ellipse(120,84,18,3,0,0,7);g.fill();\n  g.drawImage(personCanvas('player',d,fr===1?1:fr===3?2:0),96,32,48,48);lookRaf=requestAnimationFrame(lookTick)}",
        "g.fillStyle='rgba(9,15,36,.3)';g.beginPath();g.ellipse(120,84,18,3,0,0,7);g.fill();\n  if(!w3look(now))g.drawImage(personCanvas('player',d,fr===1?1:fr===3?2:0),96,32,48,48);lookRaf=requestAnimationFrame(lookTick)}")

    # the 3D layer itself, inside the game's script so it can read the maps, the player and the people
    w3d = open(os.path.join(HERE, 'src', 'w3d.js'), encoding='utf-8').read()
    rep("function loop(now){const dt=Math.min(50,now-lastT);lastT=now;", w3d + "\nfunction loop(now){const dt=Math.min(50,now-lastT);lastT=now;")

    # start loading three.js as soon as the tiles exist
    rep("buildTiles();", "buildTiles();load3D();")

    open(out, 'w', encoding='utf-8').write(s)
    print('built', out, len(s) // 1024, 'KB')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
