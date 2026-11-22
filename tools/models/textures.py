#!/usr/bin/env python3
"""Paints the textures for the Blender-built hero (tools/models/build_hero.py):

    python3 tools/models/textures.py tools/models/out

  hero_head.png       512 x 256, wrapped round the head by direction: the face at the middle (u = .5), the crown at the
                      top. Big eyes with a coloured iris, a plain dark upper lid, heavy brows set low and angled in, a
                      firm mouth, and complexion: the face lit in the middle and darker round the sides and under the jaw.
  hero_head_shut.png  the same with the eyes shut (blinking)
  hero_body.png       256 x 256 atlas of swatches: coat, scarf, leather, boot, trousers, skin, hair, glove, brass, hood, sole
                      (the regions are REG in build_hero.py)

Everything is drawn four times larger and scaled down, so edges are smooth.
"""
import math
import os
import random
import sys

from PIL import Image, ImageDraw, ImageFilter

OUT = sys.argv[1] if len(sys.argv) > 1 else 'tools/models/out'
SS = 4  # supersampling

SKIN = (239, 194, 155)
HAIR = (74, 46, 26)
IRIS = (61, 111, 181)
LID = (42, 24, 16)
BROW = (66, 40, 22)


def hexc(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mul(c, k):
    return tuple(max(0, min(255, round(v * k))) for v in c)


# ------------------------------------------------------------------------------------------------ the head
W, H = 512, 256


def az_x(az):
    """azimuth in degrees (0 = the middle of the face, + to the side of +x) to x in pixels"""
    return (0.5 + az / 360.0) * W


def lat_y(lat):
    return (90.0 - lat) / 180.0 * H


def head(shut):
    img = Image.new('RGB', (W, H), SKIN)
    px = img.load()
    # complexion: lit in the middle of the face, darker toward the sides and the back, darker under the jaw, a little
    # light on the forehead and cheekbones
    for y in range(H):
        lat = 90.0 - y / H * 180.0
        for x in range(W):
            az = (x / W - 0.5) * 360.0
            a = abs(az)
            k = 1.0 - 0.22 * min(1.0, max(0.0, (a - 35) / 85.0))
            if lat < -38:
                k *= 1.0 - 0.28 * min(1.0, (-38 - lat) / 25.0)
            if 12 < lat < 40 and a < 30:
                k *= 1.0 + 0.05 * (1 - a / 30.0)
            cheek = math.exp(-(((a - 26) / 9.0) ** 2 + ((lat + 12) / 8.0) ** 2))
            r, g, b = SKIN
            px[x, y] = (min(255, round(r * k + 10 * cheek)), min(255, round(g * k - 4 * cheek)), min(255, round(b * k - 6 * cheek)))
    big = img.resize((W * SS, H * SS), Image.BICUBIC)
    d = ImageDraw.Draw(big, 'RGBA')

    def P(az, lat):
        return (az_x(az) * SS, lat_y(lat) * SS)

    def ell(az, lat, raz, rlat, fill=None, outline=None, width=1):
        x0, y0 = P(az - raz, lat + rlat)
        x1, y1 = P(az + raz, lat - rlat)
        d.ellipse((x0, y0, x1, y1), fill=fill, outline=outline, width=width * SS)

    # hair at the hairline and over the back, so no skin shows under the cap
    for x in range(0, W * SS, SS):
        az = (x / (W * SS) - 0.5) * 360.0
        hl = 30 - (abs(az) / 180.0) * 70
        y = lat_y(hl) * SS
        d.line((x, 0, x, y), fill=HAIR + (255,), width=SS)
    # the nose: a soft shadow along one side and under it, and two small nostrils
    d.polygon([P(2.5, 2), P(5.5, -14), P(2, -17), P(0.5, -4)], fill=(120, 60, 40, 46))
    ell(0, -18.5, 6, 2.6, fill=(110, 50, 35, 70))
    for s in (-1, 1):
        ell(s * 2.6, -18, 1.4, 1.0, fill=(80, 34, 24, 150))
    # eyes: big, a rounded almond, white with a coloured iris that fills most of the height, a pupil, one light; a strong
    # dark line along the top lid and a fine one along the bottom; no lashes
    for s in (-1, 1):
        cx, cy = s * 18.0, 6.5
        if shut:
            pts = [P(cx - 8, cy - 0.5), P(cx - 3, cy - 2.5), P(cx + 3, cy - 2.5), P(cx + 8, cy - 0.5)]
            d.line(pts, fill=LID + (255,), width=int(2.6 * SS), joint='curve')
            continue
        eye = [P(cx - 8.2, cy - 0.6), P(cx - 6, cy + 3.8), P(cx - 2, cy + 5.6), P(cx + 2.5, cy + 5.6), P(cx + 6.5, cy + 3.6), P(cx + 8.2, cy + 0.2),
               P(cx + 6.5, cy - 3.6), P(cx + 2, cy - 5.0), P(cx - 3, cy - 4.8), P(cx - 7, cy - 3.0)]
        d.polygon(eye, fill=(250, 246, 238, 255))
        mask = Image.new('L', big.size, 0)
        ImageDraw.Draw(mask).polygon(eye, fill=255)
        iris = Image.new('RGBA', big.size, (0, 0, 0, 0))
        di = ImageDraw.Draw(iris)
        ix = cx - s * 1.2
        x0, y0 = P(ix - 5.2, cy + 5.4)
        x1, y1 = P(ix + 5.2, cy - 5.4)
        di.ellipse((x0, y0, x1, y1), fill=IRIS + (255,))
        di.chord((x0, y0, x1, y1), 180, 360, fill=mul(IRIS, 0.55) + (255,))
        x0, y0 = P(ix - 2.4, cy + 2.6)
        x1, y1 = P(ix + 2.4, cy - 2.6)
        di.ellipse((x0, y0, x1, y1), fill=(10, 8, 6, 255))
        x0, y0 = P(ix - 3.6, cy + 3.4)
        x1, y1 = P(ix - 1.6, cy + 1.4)
        di.ellipse((x0, y0, x1, y1), fill=(255, 255, 255, 235))
        big.paste(iris, (0, 0), Image.composite(iris, Image.new('RGBA', big.size, (0, 0, 0, 0)), mask))
        d = ImageDraw.Draw(big, 'RGBA')
        # shadow of the lid across the top of the eye
        top = [P(cx - 8.2, cy - 0.6), P(cx - 7, cy + 3.0), P(cx - 3, cy + 4.8), P(cx + 2, cy + 5.0), P(cx + 6.5, cy + 3.6), P(cx + 8.2, cy + 0.2)]
        d.line(top, fill=LID + (255,), width=int(2.4 * SS), joint='curve')
        bot = [P(cx - 7, cy - 3.0), P(cx - 3, cy - 4.8), P(cx + 2, cy - 5.0), P(cx + 6.5, cy - 3.6)]
        d.line(bot, fill=(90, 50, 35, 150), width=int(0.9 * SS), joint='curve')
    # brows: heavy, set low, lower at the inside: a determined look
    for s in (-1, 1):
        d.polygon([P(s * 9.5, 14.5), P(s * 27.5, 18.5), P(s * 27.5, 16.2), P(s * 9.5, 11.2)], fill=BROW + (255,))
    # a firm mouth, the corners turned a touch down, and the shadow under the lower lip
    d.line([P(-7, -27.5), P(-3, -27.0), P(3, -27.0), P(7, -27.5)], fill=(118, 58, 44, 255), width=int(2.1 * SS), joint='curve')
    ell(0, -30.5, 6, 1.6, fill=(120, 60, 40, 55))
    ell(0, -47, 9, 4, fill=(110, 55, 38, 40))
    img = big.resize((W, H), Image.LANCZOS)
    return img


# ------------------------------------------------------------------------------------------------ the body atlas
REG = {'coat': (0, 0, 128, 128), 'scarf': (128, 0, 64, 64), 'leather': (192, 0, 64, 64), 'boot': (128, 64, 64, 64),
       'trousers': (192, 64, 64, 64), 'skin': (0, 128, 64, 64), 'hair': (64, 128, 64, 64), 'glove': (128, 128, 64, 64),
       'brass': (192, 128, 64, 64), 'hood': (0, 192, 64, 64), 'sole': (64, 192, 64, 64)}


def body():
    R = random.Random(7)
    img = Image.new('RGB', (256, 256), (128, 128, 128))
    d = ImageDraw.Draw(img)

    def fill(name, col, noise=6):
        x, y, w, h = REG[name]
        for j in range(h):
            for i in range(w):
                n = R.randint(-noise, noise)
                img.putpixel((x + i, y + j), tuple(max(0, min(255, c + n)) for c in col))
        return x, y, w, h
    x, y, w, h = fill('coat', hexc('#3f4d6a'), 5)
    for i in range(0, w, 32):
        d.line((x + i + 15, y, x + i + 15, y + h), fill=hexc('#34405a'))
    d.rectangle((x, y + h - 6, x + w, y + h), fill=hexc('#36435e'))
    x, y, w, h = fill('scarf', hexc('#d8742a'), 6)
    for j in range(0, h, 16):
        d.rectangle((x, y + j + 10, x + w, y + j + 13), fill=hexc('#b65a1c'))
    x, y, w, h = fill('leather', hexc('#5e3d25'), 7)
    for i in range(2, w, 6):
        d.point((x + i, y + 4), fill=hexc('#c8a070'))
        d.point((x + i, y + h - 5), fill=hexc('#c8a070'))
    x, y, w, h = fill('boot', hexc('#3c2a1b'), 6)
    d.rectangle((x, y, x + w, y + 18), fill=hexc('#4c3624'))
    for j in (28, 38, 46):
        d.line((x, y + j, x + w, y + j + 2), fill=hexc('#2c1e12'))
    fill('trousers', hexc('#5a4c3e'), 8)
    fill('skin', SKIN, 2)
    x, y, w, h = fill('hair', HAIR, 4)
    for i in range(0, w, 3):
        d.line((x + i, y, x + i + R.randint(-2, 2), y + h), fill=hexc('#5e3c22') if i % 2 else hexc('#3e2614'))
    x, y, w, h = fill('glove', hexc('#4e3220'), 6)
    d.rectangle((x, y, x + w, y + 8), fill=hexc('#5e3e28'))
    x, y, w, h = REG['brass']
    for j in range(h):
        k = 0.75 + 0.45 * math.sin(j / h * math.pi)
        d.line((x, y + j, x + w, y + j), fill=mul(hexc('#d8b060'), k))
    fill('hood', hexc('#344058'), 5)
    fill('sole', hexc('#1e1612'), 3)
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    head(False).save(os.path.join(OUT, 'hero_head.png'), optimize=True)
    head(True).save(os.path.join(OUT, 'hero_head_shut.png'), optimize=True)
    body().save(os.path.join(OUT, 'hero_body.png'), optimize=True)
    for n in ('hero_head.png', 'hero_head_shut.png', 'hero_body.png'):
        print(n, os.path.getsize(os.path.join(OUT, n)) // 1024, 'KB')


main()
