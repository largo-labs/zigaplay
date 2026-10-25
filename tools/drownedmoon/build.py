#!/usr/bin/env python3
"""Builds the Drowned Moon cartridge: joins src/*.js into src/shell.html.
    python3 tools/drownedmoon/build.py [OUT]   (default: games/drownedmoon/index.html)"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ORDER = ['audio.js', 'art.js', 'r_art.js', 'data.js', 'r_data.js', 'maps.js', 'r_maps.js', 'core.js', 'ui.js', 'battle.js', 'story.js', 'r_story.js', 'main.js']
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..', 'games', 'drownedmoon', 'index.html')
shell = open(os.path.join(HERE, 'src', 'shell.html'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(HERE, 'src', f), encoding='utf-8').read() for f in ORDER if os.path.exists(os.path.join(HERE, 'src', f)))
assert shell.count('/*@@SCRIPTS@@*/') == 1
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(shell.replace('/*@@SCRIPTS@@*/', js))
print('wrote', os.path.relpath(out), len(js) // 1024, 'KB of script')
