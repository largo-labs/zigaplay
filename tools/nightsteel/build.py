#!/usr/bin/env python3
"""Build Strike at Night (the Spellsteel edition): put every source file into the shell, in load order.
   python3 tools/nightsteel/build.py [out.html ...]   (default: games/nightsteel/index.html)"""
import os,sys
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.dirname(os.path.dirname(HERE))
ORDER=['buf','doll','weapons','data','foes','scenery','props','party','core','audio','ui','dress','battle','world','story','menus','quests','main']
shell=open(os.path.join(HERE,'src','shell.html'),encoding='utf8').read()
js='\n'.join(open(os.path.join(HERE,'src',n+'.js'),encoding='utf8').read() for n in ORDER)
assert '</script' not in js.lower()
html=shell.replace('/*SCRIPTS*/',js)
for o in sys.argv[1:] or [os.path.join(REPO,'games','nightsteel','index.html')]:
    os.makedirs(os.path.dirname(o),exist_ok=True)
    open(o,'w',encoding='utf8').write(html)
    print('wrote',o,len(html.encode()),'bytes')
