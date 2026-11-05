#!/usr/bin/env python3
"""Builds the Over the Edge cartridge: joins src/*.js into src/shell.html.
    python3 tools/edge/build.py [OUT]   (default: games/edge/index.html)
The game loads three.js from 3d/ next to it (games/edge/3d/), like Lynties; the offline builder packs it inside."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ORDER = ['core.js', 'three.js', 'rig.js', 'anims.js', 'roster.js', 'moves.js', 'fighter.js', 'combat.js', 'hitbox.js', 'ai.js', 'stages.js', 'scene.js', 'ui.js', 'select.js', 'hud.js', 'main.js']
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..', 'games', 'edge', 'index.html')
files = [f for f in ORDER if os.path.exists(os.path.join(HERE, 'src', f))]
shell = open(os.path.join(HERE, 'src', 'shell.html'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(HERE, 'src', f), encoding='utf-8').read() for f in files)
extra = os.environ.get('EDGE_EXTRA')
if extra: js += '\n' + open(extra, encoding='utf-8').read()
assert shell.count('/*@@SCRIPTS@@*/') == 1
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(shell.replace('/*@@SCRIPTS@@*/', js))
print('wrote', os.path.relpath(out), len(js) // 1024, 'KB of script from', ', '.join(files))
