#!/usr/bin/env python3
"""Builds the three cartridges that share one small kit: Drift Critters, Pipsqueak and Fourfall.

    python3 tools/kit-games/build.py

Each game is src/<id>.js, src/<id>.css and src/<id>.body.html. src/kit.js and src/kit.css go into all three: the hookup to
the console (buttons, the second screen, saves), a little sound engine and the menus. The script writes
games/<id>/index.html, one self-contained page per game.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
GAMES = [('driftcritters', 'Drift Critters'), ('pipsqueak', 'Pipsqueak'), ('fourfall', 'Fourfall')]
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&family=VT323&display=swap">\n')


def read(name):
    with open(os.path.join(HERE, 'src', name), encoding='utf-8') as f:
        return f.read()


def build(gid, title):
    html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
{FONTS}<style>
{read('kit.css')}{read(gid + '.css')}</style></head><body>
{read(gid + '.body.html')}
<script>
(()=>{{
'use strict';
{read('kit.js')}
{read(gid + '.js')}
}})();
</script>
</body></html>
'''
    out = os.path.join(ROOT, 'games', gid, 'index.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'{gid}: {len(html) // 1024} KB')


if __name__ == '__main__':
    for gid, title in GAMES:
        build(gid, title)
