#!/usr/bin/env python3
"""Builds the Haymaker cartridge: joins the scripts in src/ (in ORDER) into src/shell.html inside the
standard page skeleton.
    python3 tools/haymaker/build.py [OUT]   (default: games/haymaker/index.html)"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ORDER = ['core', 'music', 'data', 'look', 'art', 'scene', 'fight', 'map', 'ui', 'main']
SKEL = ('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">'
  '<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
  'html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}'
  'img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n')
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..', 'games', 'haymaker', 'index.html')
shell = open(os.path.join(HERE, 'src', 'shell.html'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(HERE, 'src', n + '.js'), encoding='utf-8').read() for n in ORDER)
assert shell.count('/*@@SCRIPTS@@*/') == 1
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(SKEL + shell.replace('/*@@SCRIPTS@@*/', js) + '\n</body></html>')
print('wrote', os.path.relpath(out), len(js) // 1024, 'KB of script')
