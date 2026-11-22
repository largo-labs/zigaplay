#!/usr/bin/env python3
"""Paints the textures for the Blender-built hero (tools/models/build_hero.py):

    python3 tools/models/textures.py tools/models/out

  hero_head.png       512 x 256, wrapped round the head by direction: the face at the middle (u = .5), the crown at the
                      top. Big eyes with a coloured iris, a plain dark upper lid, heavy brows set low and angled in, a
                      firm mouth, and complexion: the face lit in the middle and darker round the sides and under the jaw.
  hero_head_shut.png  the same with the eyes shut (blinking)
  hero_body.png       256 x 256 atlas of swatches: coat (the green tunic), scarf, leather, boot, trousers, skin, hair, glove, brass, hood, sole
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
HAIR = (222, 178, 86)
IRIS = (61, 111, 181)
LID = (42, 24, 16)
BROW = (150, 108, 44)


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


# the hairline (build_hero.py HAIRLINE): latitude in radians by azimuth from the middle of the face
HAIRLINE = [(0.0, 0.66), (0.3, 0.5), (0.6, 0.42), (0.9, 0.36), (1.3, 0.25), (1.57, 0.2), (1.85, 0.06), (2.25, -0.27), (2.7, -0.42), (math.pi, -0.46)]


def hairline_deg(az):
    a = math.radians(abs(az))
    for (a0, l0), (a1, l1) in zip(HAIRLINE, HAIRLINE[1:]):
        if a <= a1:
            f = (a - a0) / (a1 - a0)
            f = f * f * (3 - 2 * f)
            return math.degrees(l0 + (l1 - l0) * f)
    return math.degrees(HAIRLINE[-1][1])


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

    # hair painted a little below the edge of the cap, a shade darker, so no skin shows under it and the hairline is soft
    for x in range(0, W * SS, SS):
        az = (x / (W * SS) - 0.5) * 360.0
        y = lat_y(hairline_deg(az) - 2.0 - 1.5 * min(1.0, abs(az) / 90.0)) * SS
        d.line((x, 0, x, y), fill=mul(HAIR, 0.86) + (255,), width=SS)
    # the nose: a soft shadow along one side and under it, and two small nostrils
    d.polygon([P(3, 2), P(7, -15), P(2.5, -19.5), P(0.5, -4)], fill=(120, 60, 40, 50))
    ell(0, -19.5, 7.5, 3, fill=(110, 50, 35, 75))
    for s in (-1, 1):
        ell(s * 3.3, -19, 1.7, 1.2, fill=(80, 34, 24, 155))
    # eyes: big, a rounded almond, white with a coloured iris that fills most of the height, a pupil, one light; a strong
    # dark line along the top lid and a fine one along the bottom; no lashes
    for s in (-1, 1):
        cx, cy = s * 18.0, 6.5
        if shut:
            pts = [P(cx - 8, cy - 0.5), P(cx - 3, cy - 2.5), P(cx + 3, cy - 2.5), P(cx + 8, cy - 0.5)]
            d.line(pts, fill=LID + (255,), width=int(2.6 * SS), joint='curve')
            continue
        eye = [P(cx - 9.4, cy - 0.7), P(cx - 7, cy + 3.6), P(cx - 2.5, cy + 5.4), P(cx + 2.8, cy + 5.5), P(cx + 7.4, cy + 3.8), P(cx + 9.4, cy + 0.2),
               P(cx + 7.4, cy - 4.0), P(cx + 2.2, cy - 5.7), P(cx - 3.4, cy - 5.5), P(cx - 8, cy - 3.4)]
        d.polygon(eye, fill=(250, 246, 238, 255))
        mask = Image.new('L', big.size, 0)
        ImageDraw.Draw(mask).polygon(eye, fill=255)
        iris = Image.new('RGBA', big.size, (0, 0, 0, 0))
        di = ImageDraw.Draw(iris)
        ix = cx - s * 1.3
        x0, y0 = P(ix - 6.0, cy + 6.0)
        x1, y1 = P(ix + 6.0, cy - 6.0)
        di.ellipse((x0, y0, x1, y1), fill=IRIS + (255,))
        di.chord((x0, y0, x1, y1), 180, 360, fill=mul(IRIS, 0.55) + (255,))
        x0, y0 = P(ix - 2.8, cy + 2.9)
        x1, y1 = P(ix + 2.8, cy - 2.9)
        di.ellipse((x0, y0, x1, y1), fill=(10, 8, 6, 255))
        x0, y0 = P(ix - 4.1, cy + 3.9)
        x1, y1 = P(ix - 1.9, cy + 1.7)
        di.ellipse((x0, y0, x1, y1), fill=(255, 255, 255, 235))
        # the upper lid's shadow over the top of the iris: a steady, serious look
        x0, y0 = P(cx - 9.4, cy + 6.5)
        x1, y1 = P(cx + 9.4, cy + 2.6)
        di.rectangle((x0, y0, x1, y1), fill=(70, 40, 28, 120))
        big.paste(iris, (0, 0), Image.composite(iris, Image.new('RGBA', big.size, (0, 0, 0, 0)), mask))
        d = ImageDraw.Draw(big, 'RGBA')
        top = [P(cx - 9.4, cy - 0.7), P(cx - 8, cy + 2.8), P(cx - 3.4, cy + 4.6), P(cx + 2.4, cy + 4.8), P(cx + 7.4, cy + 3.6), P(cx + 9.4, cy + 0.2)]
        d.line(top, fill=LID + (255,), width=int(2.6 * SS), joint='curve')
        bot = [P(cx - 8, cy - 3.4), P(cx - 3.4, cy - 5.5), P(cx + 2.2, cy - 5.7), P(cx + 7.4, cy - 4.0)]
        d.line(bot, fill=(90, 50, 35, 150), width=int(0.9 * SS), joint='curve')
    # brows: heavy, set low, lower at the inside: a determined look
    for s in (-1, 1):
        d.polygon([P(s * 8.5, 15.0), P(s * 28.5, 20.8), P(s * 28.5, 18.1), P(s * 8.5, 12.0)], fill=BROW + (255,))
    # a firm mouth, the corners turned a touch down, and the shadow under the lower lip
    d.line([P(-9, -28.2), P(-4, -27.5), P(4, -27.5), P(9, -28.2)], fill=(118, 58, 44, 255), width=int(2.6 * SS), joint='curve')
    ell(0, -31.5, 7.5, 2, fill=(120, 60, 40, 60))
    ell(0, -47, 9, 4, fill=(110, 55, 38, 40))
    img = big.resize((W, H), Image.LANCZOS)
    return img


# ------------------------------------------------------------------------------------------------ the body atlas
REG = {'coat': (0, 0, 128, 128), 'scarf': (128, 0, 64, 64), 'leather': (192, 0, 64, 64), 'boot': (128, 64, 64, 64),
       'trousers': (192, 64, 64, 64), 'skin': (0, 128, 64, 64), 'hair': (64, 128, 64, 64), 'glove': (128, 128, 64, 64),
       'brass': (192, 128, 64, 64), 'hood': (0, 192, 64, 64), 'sole': (64, 192, 64, 64), 'hair2': (128, 192, 64, 64)}


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
    x, y, w, h = fill('coat', hexc('#3f7a3c'), 5)
    for i in range(0, w, 32):
        d.line((x + i + 15, y, x + i + 15, y + h), fill=hexc('#336631'))
    d.rectangle((x, y + h - 6, x + w, y + h), fill=hexc('#356b33'))
    x, y, w, h = fill('scarf', hexc('#d8742a'), 6)
    for j in range(0, h, 16):
        d.rectangle((x, y + j + 10, x + w, y + j + 13), fill=hexc('#b65a1c'))
    x, y, w, h = fill('leather', hexc('#5e3d25'), 7)
    for i in range(2, w, 6):
        d.point((x + i, y + 4), fill=hexc('#c8a070'))
        d.point((x + i, y + h - 5), fill=hexc('#c8a070'))
    x, y, w, h = fill('boot', hexc('#6e4628'), 6)
    d.rectangle((x, y, x + w, y + 18), fill=hexc('#7d5332'))
    for j in (28, 38, 46):
        d.line((x, y + j, x + w, y + j + 2), fill=hexc('#4e3018'))
    fill('trousers', hexc('#ebe7de'), 4)
    fill('skin', SKIN, 2)
    # the locks: u runs across a lock, v along it (its root at the top of the swatch). Broad soft strands, lighter down the
    # middle of the lock and darker at its edges and toward the root, so each lock reads on its own
    x, y, w, h = REG['hair']
    for j in range(h):
        v = 1 - (j + 0.5) / h
        for i in range(w):
            u = (i + 0.5) / w
            k = 0.78 + 0.27 * math.sin(math.pi * u) ** 0.7
            k *= 1 + 0.045 * math.sin(u * 29 + 1.3) + 0.03 * math.sin(u * 61 + 0.4)
            for uc in (0.31, 0.5, 0.69):
                k *= 1 - 0.1 * math.exp(-((u - uc) / 0.03) ** 2)
            k *= 0.88 + 0.16 * (1 - v) ** 0.8
            img.putpixel((x + i, y + j), mul(HAIR, k))
    # the cap: u runs round the head (the middle of the face at the middle), v up to the crown. Smooth, darker toward the
    # hairline, and the part: a dark line down the middle, the hair catching the light each side of it
    x, y, w, h = REG['hair2']
    for j in range(h):
        v = 1 - (j + 0.5) / h
        for i in range(w):
            u = (i + 0.5) / w
            k = 0.95 + 0.03 * math.sin(u * 151) + 0.02 * math.sin(u * 83 + 2)
            k *= 0.86 + 0.14 * min(1.0, v / 0.3)
            du = abs(u - 0.5) * w
            if du < 1.1:
                k *= 0.56
            elif du < 3.2:
                k *= 1.07
            img.putpixel((x + i, y + j), mul(HAIR, k))
    x, y, w, h = fill('glove', hexc('#4e3220'), 6)
    d.rectangle((x, y, x + w, y + 8), fill=hexc('#5e3e28'))
    x, y, w, h = REG['brass']
    for j in range(h):
        k = 0.75 + 0.45 * math.sin(j / h * math.pi)
        d.line((x, y + j, x + w, y + j), fill=mul(hexc('#d8b060'), k))
    fill('hood', hexc('#2e5a2d'), 5)
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
