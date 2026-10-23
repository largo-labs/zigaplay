#!/usr/bin/env python3
"""Builds the offline edition of the ZigaPlay: every game, its cartridge art and a pixel font packed into one
page that needs no network at all.

    python3 build-offline.py SRC OUT [--lynties-saves DIR] [--seeds FILE]

SRC is a folder laid out like the published ZigaPlay artifact:
    index.html                  the console page, as published to the artifact or as a full page (the GitHub repo)
    games/<id>/index.html       each cartridge listed in CARTS, plus games/<id>/cart.png
    offline/zigafont.woff       pixel font (a Unifont subset) standing in for Pixelify Sans, VT323, Silkscreen and DotGothic16
    offline/icon-192.png, offline/icon-512.png, offline/apple-touch-icon.png

It writes into OUT:
    ZigaPlay.html               one self-contained file: open it on a computer, or in an iPhone app that runs HTML files
    ZigaPlay-offline/           the same page set up as an installable web app (index.html, sw.js,
                                manifest.webmanifest, icons, a how-to). Hosted on any https static host and
                                added to the Home Screen from Safari, it keeps working with no connection.
    ZigaPlay-offline.zip        that folder, zipped

Starting saves (optional) go in once, the first time the offline edition opens on a device that has no saves
for that game yet:
    --lynties-saves DIR   a folder of Lynties cloud save documents (slot<id>.json, as ArtifactData list writes them
                          with out_dir, from data/users/me/lynties/saves); the most recent one becomes the seed
    --seeds FILE          seeds already in the console's format: [{"prefix": "...", "items": [[key, value], ...]}]
"""
import argparse, base64, datetime, glob, hashlib, json, os, re, shutil, sys, zipfile

FONT_FAMILIES = ['Pixelify Sans', 'VT323', 'Silkscreen', 'DotGothic16']
FONT_LINK = re.compile(r'<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*', re.I)
MAIN_SCRIPT = '\n<script>\n(()=>{'


def b64(data):
    return base64.b64encode(data).decode('ascii')


def read(path, mode='r'):
    with open(path, mode, **({} if 'b' in mode else {'encoding': 'utf-8'})) as f:
        return f.read()


def write(path, data):
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    with open(path, 'wb' if isinstance(data, bytes) else 'w', **({} if isinstance(data, bytes) else {'encoding': 'utf-8'})) as f:
        f.write(data)


def carts_of(shell):
    m = re.search(r'const CARTS=\[(.*?)\n\];', shell, re.S)
    if not m:
        sys.exit('could not find "const CARTS=[ ... ];" in index.html')
    out = []
    for part in m.group(1).split('{id:')[1:]:
        f = lambda k: (re.search(k + r":'([^']*)'", part) or [None, None])[1]
        out.append({'id': re.match(r"'([^']+)'", part).group(1), 'file': f('file'), 'art': f('art')})
    return out


def lynties_seed(folder):
    """The newest Lynties cloud save, as the localStorage entries Lynties reads."""
    best = None
    for p in glob.glob(os.path.join(folder, '**', 'slot*.json'), recursive=True):
        doc = json.loads(read(p))
        doc = doc.get('data', doc) if isinstance(doc, dict) else doc
        sid = re.match(r'slot([A-Za-z0-9]+)\.json$', os.path.basename(p)).group(1)
        if not isinstance(doc, dict) or doc.get('deleted') or not isinstance(doc.get('json'), str):
            continue
        at = float(doc.get('savedAt') or 0)
        if best is None or at > best[0]:
            best = (at, sid, doc['json'])
    if not best:
        return None
    return {'prefix': 'lynties-slot-', 'items': [['lynties-slot-' + best[1], best[2]], ['lynties-last', best[1]]]}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src')
    ap.add_argument('out')
    ap.add_argument('--lynties-saves')
    ap.add_argument('--seeds')
    a = ap.parse_args()
    src, out = a.src, a.out

    shell = read(os.path.join(src, 'index.html'))
    if shell.lstrip().lower().startswith('<!doctype'):
        # a full page (as kept in the GitHub repo): use what sits between <title> and </body>, as the artifact publishes it
        i, j = shell.find('<title>'), shell.rfind('</body>')
        if i < 0 or j < 0:
            sys.exit('index.html: could not find <title> ... </body>')
        shell = shell[i:j]
    font = read(os.path.join(src, 'offline', 'zigafont.woff'), 'rb')
    icons = {n: read(os.path.join(src, 'offline', n), 'rb') for n in ('icon-192.png', 'icon-512.png', 'apple-touch-icon.png')}
    font_css = ''.join("@font-face{font-family:'%s';src:url(data:font/woff;base64,%s) format('woff')}" % (f, b64(font))
                       for f in FONT_FAMILIES)

    # the page's own head bits (title, metas) move into <head>; web fonts are replaced by the packed font
    shell = FONT_LINK.sub('', shell)
    title = (re.search(r'<title>(.*?)</title>', shell, re.S) or [None, 'ZigaPlay'])[1]
    shell = re.sub(r'<title>.*?</title>\s*', '', shell, count=1, flags=re.S)
    shell = re.sub(r'<meta name="claude:[^>]*>\s*', '', shell)

    # every cartridge, inline
    packed, report = [], []
    for c in carts_of(shell):
        html = FONT_LINK.sub('', read(os.path.join(src, c['file'])))
        for ref in re.findall(r'''(?:src|href)\s*=\s*["'](?!data:|https?:|#|blob:|javascript:|mailto:|about:)([^"'${}]+)["']''', html):
            print(f"warning: {c['id']} refers to {ref!r}, which the offline edition does not carry", file=sys.stderr)
        # a game drawn with three.js (Lynties 3D) carries its copy of three.js inside itself offline
        tdir = os.path.join(src, os.path.dirname(c['file']), '3d')
        if '3d/three.module.min.js' in html and os.path.exists(os.path.join(tdir, 'three.core.min.js')):
            core, mod = read(os.path.join(tdir, 'three.core.min.js')), read(os.path.join(tdir, 'three.module.min.js'))
            if '</script' in core or '</script' in mod:
                sys.exit('three.js contains </script and cannot be packed inline')
            k = html.rfind('</body>')
            html = (html[:k] if k >= 0 else html) + f'<script type="text/plain" id="three-core">{core}</script><script type="text/plain" id="three-mod">{mod}</script>' + (html[k:] if k >= 0 else '')
        packed.append(f'<script type="text/plain" id="cart-{c["id"]}">{b64(html.encode("utf-8"))}</script>')
        if c['art'] and not c['art'].startswith('data:'):
            art = read(os.path.join(src, c['art']), 'rb')
            shell = shell.replace(f"art:'{c['art']}'", f"art:'data:image/png;base64,{b64(art)}'", 1)
        report.append(f"{c['id']}: {len(html) // 1024} KB")
    if not packed:
        sys.exit('no cartridges found in CARTS')

    seeds = []
    if a.seeds:
        seeds += json.loads(read(a.seeds))
    if a.lynties_saves:
        s = lynties_seed(a.lynties_saves)
        if s:
            seeds.append(s)
            report.append('starting save: Lynties ' + s['items'][1][1])
    packed.append('<script type="text/plain" id="zp-game-head"><style>%s</style></script>' % font_css)
    packed.append('<script type="application/json" id="zp-seeds">%s</script>' % json.dumps(seeds).replace('<', '\\u003c'))

    # adding a game later means a new copy of this edition, so the ghost cartridge says so
    shell = shell.replace("its cartridge will appear on this shelf.'",
                          "its cartridge will appear on this shelf. On this offline ZigaPlay, get a fresh copy of the offline edition after that.'", 1)
    if shell.count(MAIN_SCRIPT) != 1:
        sys.exit('could not find the console\'s main <script> in index.html')
    shell = shell.replace(MAIN_SCRIPT, '\n' + '\n'.join(packed) + MAIN_SCRIPT, 1)

    built = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    base_css = (':root{color-scheme:dark;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
                'html{scroll-padding-top:env(safe-area-inset-top,0px);background:#0d1222}'
                'body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#0d1222;color:#e8ecff}'
                'img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}')

    def page(pwa):
        head = [
            '<!doctype html>', '<html lang="en"><head>', '<meta charset="utf-8">',
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
            f'<title>{title}</title>',
            f'<meta name="zigaplay-offline-build" content="{built}">',
            '<meta name="theme-color" content="#0d1222">',
            '<meta name="mobile-web-app-capable" content="yes">',
            '<meta name="apple-mobile-web-app-capable" content="yes">',
            '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
            '<meta name="apple-mobile-web-app-title" content="ZigaPlay">',
            f'<link rel="icon" type="image/png" href="data:image/png;base64,{b64(icons["icon-192.png"])}">',
            ('<link rel="apple-touch-icon" href="apple-touch-icon.png">\n<link rel="manifest" href="manifest.webmanifest">' if pwa else
             f'<link rel="apple-touch-icon" href="data:image/png;base64,{b64(icons["apple-touch-icon.png"])}">'),
            f'<style>{base_css}{font_css}</style>', '</head><body>']
        tail = []
        if pwa:
            tail.append("<script>if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))"
                        "addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))</script>")
        return '\n'.join(head) + '\n' + shell.strip() + '\n' + '\n'.join(tail) + '\n</body></html>\n'

    single, app = page(False), page(True)
    write(os.path.join(out, 'ZigaPlay.html'), single)

    pkg = os.path.join(out, 'ZigaPlay-offline')
    shutil.rmtree(pkg, ignore_errors=True)
    write(os.path.join(pkg, 'index.html'), app)
    for n, b in icons.items():
        write(os.path.join(pkg, n), b)
    write(os.path.join(pkg, 'manifest.webmanifest'), json.dumps({
        'name': 'ZigaPlay', 'short_name': 'ZigaPlay', 'description': 'A pocket console for the games made with Claude, offline.',
        'start_url': './', 'scope': './', 'display': 'standalone', 'orientation': 'any',
        'background_color': '#0d1222', 'theme_color': '#0d1222',
        'icons': [{'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
                  {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png'}]}, indent=1))
    ver = hashlib.sha256(app.encode('utf-8')).hexdigest()[:12]
    files = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png']
    write(os.path.join(pkg, 'sw.js'), """/* ZigaPlay offline: keeps the console and every game on this device, so it opens with no connection. */
const CACHE='zigaplay-%s';
const FILES=%s;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('zigaplay-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=(await c.match(r,{ignoreSearch:true}))||(r.mode==='navigate'?await c.match('./index.html'):undefined);
    if(hit)return hit;
    try{const res=await fetch(r);if(res.ok)c.put(r,res.clone());return res}catch(err){return Response.error()}}))});
""" % (ver, json.dumps(files)))
    write(os.path.join(pkg, 'HOW TO INSTALL.txt'), """ZigaPlay, offline edition (built %s)

Put everything in this folder on any website host that serves files over https. Netlify Drop
(app.netlify.com/drop) takes this zip exactly as it is; make a free account there so the site stays up.
GitHub Pages works too.
Open the address in Safari on your iPhone once while you are online, wait a few seconds,
then tap Share, then Add to Home Screen. From then on, the ZigaPlay icon opens with no WiFi or cell service.

Your saves live on that device, inside the Home Screen app. To move a Lynties game between this ZigaPlay
and another one, use Menu, then Save code in Lynties, and "Use a save code" on the other title screen.

ZigaPlay.html (sent next to this zip) is the same console in one file, for a computer or an app that opens HTML files.
""" % built)

    zpath = os.path.join(out, 'ZigaPlay-offline.zip')
    with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for n in sorted(os.listdir(pkg)):
            z.write(os.path.join(pkg, n), n)
    print('\n'.join(report))
    print(f'ZigaPlay.html {len(single) // 1024} KB, ZigaPlay-offline.zip {os.path.getsize(zpath) // 1024} KB, cache {ver}')


if __name__ == '__main__':
    main()
