#!/usr/bin/env python3
"""Builds the Pitchfork Rising cartridge: joins src/*.js into src/shell.html.
    python3 tools/pitchfork/build.py [OUT]   (default: games/pitchfork/index.html)"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ORDER = ['audio.js', 'data.js', 'art.js', 'map.js', 'battle.js', 'deploy.js', 'icons.js', 'ui.js', 'main.js']
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..', 'games', 'pitchfork', 'index.html')
shell = open(os.path.join(HERE, 'src', 'shell.html'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(HERE, 'src', f), encoding='utf-8').read() for f in ORDER)
assert shell.count('/*@@SCRIPTS@@*/') == 1
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(shell.replace('/*@@SCRIPTS@@*/', js))
print('wrote', os.path.relpath(out), len(js) // 1024, 'KB of script')
