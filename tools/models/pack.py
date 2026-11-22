#!/usr/bin/env python3
"""Packs the Blender-built models and their textures into one script the game reads:

    python3 tools/models/pack.py

reads  tools/models/out/hero.json (blender -b --python tools/models/build_hero.py -- tools/models/out/hero.json)
       tools/models/out/hero_head.png, hero_head_shut.png, hero_body.png (python3 tools/models/textures.py)
writes tools/kit-games/src/hollowmere.data.js, which tools/kit-games/build.py puts into the game ahead of its code.
"""
import base64
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
DST = os.path.join(HERE, '..', 'kit-games', 'src', 'hollowmere.data.js')


def png(name):
    with open(os.path.join(OUT, name), 'rb') as f:
        return 'data:image/png;base64,' + base64.b64encode(f.read()).decode()


def main():
    with open(os.path.join(OUT, 'hero.json')) as f:
        parts = json.load(f)
    models = {'hero': {'tex': {'head': png('hero_head.png'), 'shut': png('hero_head_shut.png'), 'body': png('hero_body.png')}, 'parts': parts}}
    js = ('/* models made in Blender (tools/models/build_hero.py) with painted textures (tools/models/textures.py), packed by\n'
          '   tools/models/pack.py. Each part: t texture, p positions (float32), n normals (int8), u uvs (uint16, u halved when uh),\n'
          '   i indices (uint16), all base64. */\n'
          'const MODELS=' + json.dumps(models, separators=(',', ':')) + ';\n')
    with open(DST, 'w') as f:
        f.write(js)
    print(f'{os.path.relpath(DST)}: {len(js) // 1024} KB')


main()
