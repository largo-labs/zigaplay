#!/usr/bin/env python3
"""Paints the textures for the Blender-built hero (tools/models/build_hero.py):

    python3 tools/models/textures.py tools/models/out

  hero_head.png       1024 x 512, wrapped round the head by direction: the face at the middle (u = .5), the crown at the
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
HAIR = (228, 162, 52)
IRIS_RING = (28, 48, 122)
IRIS_TOP = (42, 78, 186)
IRIS_BOT = (110, 162, 238)
LID = (40, 22, 14)
BROW = (116, 74, 30)


def hexc(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mul(c, k):
    return tuple(max(0, min(255, round(v * k))) for v in c)


# ------------------------------------------------------------------------------------------------ the head
W, H = 1024, 512
PXD = W / 360.0     # pixels per degree


def az_x(az):
    """azimuth in degrees (0 = the middle of the face, + to the side of +x) to x in pixels"""
    return (0.5 + az / 360.0) * W


def lat_y(lat):
    return (90.0 - lat) / 180.0 * H


# the hairline (build_hero.py HAIRLINE): latitude in radians by azimuth from the middle of the face. Under the cap at the
# front, so the forehead shows right up to it; below the cap's edge behind the ears and at the nape, where short hair shows
HAIRLINE = [(0.0, 0.74), (0.5, 0.7), (1.1, 0.5), (1.57, 0.36), (1.85, 0.16), (2.25, -0.27), (2.7, -0.42), (math.pi, -0.46)]


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
    # complexion: lit in the middle of the face, darker toward the sides and the back and under the jaw, a little light on
    # the forehead, a little warmth over the cheekbones
    for y in range(H):
        lat = 90.0 - (y + 0.5) / H * 180.0
        for x in range(W):
            az = ((x + 0.5) / W - 0.5) * 360.0
            a = abs(az)
            k = 1.0 - 0.2 * min(1.0, max(0.0, (a - 38) / 85.0))
            # under the jaw: below the chin at the front, higher toward the sides
            lo = -64 + 22 * min(1.0, a / 70.0)
            if lat < lo:
                k *= 1.0 - 0.26 * min(1.0, (lo - lat) / 18.0)
            if 12 < lat < 40 and a < 30:
                k *= 1.0 + 0.04 * (1 - a / 30.0)
            cheek = math.exp(-(((a - 27) / 9.0) ** 2 + ((lat + 14) / 8.0) ** 2))
            r, g, b = SKIN
            px[x, y] = (min(255, round(r * k + 7 * cheek)), min(255, round(g * k - 3 * cheek)), min(255, round(b * k - 5 * cheek)))
    big = img.resize((W * SS, H * SS), Image.BICUBIC)
    d = ImageDraw.Draw(big, 'RGBA')

    def P(az, lat):
        return (az_x(az) * SS, lat_y(lat) * SS)

    def lw(deg):
        return max(1, int(deg * PXD * SS))

    def box(az, lat, raz, rlat):
        x0, y0 = P(az - raz, lat + rlat)
        x1, y1 = P(az + raz, lat - rlat)
        return (x0, y0, x1, y1)

    def ell(az, lat, raz, rlat, fill):
        d.ellipse(box(az, lat, raz, rlat), fill=fill)

    # hair painted a little below the edge of the cap, a shade darker, so no skin shows under it and the hairline is soft
    for x in range(0, W * SS, SS):
        az = (x / (W * SS) - 0.5) * 360.0
        y = lat_y(hairline_deg(az) - 2.0 - 1.5 * min(1.0, abs(az) / 90.0)) * SS
        d.line((x, 0, x, y), fill=mul(HAIR, 0.86) + (255,), width=SS)
    # a small nose: light on its tip, a soft shadow down one side and under it, two small nostrils
    d.polygon([P(1.5, -8), P(4.6, -16.0), P(1.5, -18.6), P(0.2, -12)], fill=(120, 60, 40, 52))
    ell(0, -18.8, 5.0, 1.8, (110, 50, 35, 82))
    for sd in (-1, 1):
        ell(sd * 2.0, -18.0, 1.0, 0.7, (80, 34, 24, 140))
    ell(-0.6, -14.0, 1.6, 1.8, (255, 240, 225, 45))
    # eyes: big and round, the inner corner a little pointed; white, with a big iris: a dark ring, deep blue at the top
    # shading to light blue at the bottom, a black pupil and a big catch-light; a thick dark upper lid, a fine lower one
    for sd in (-1, 1):
        cx, cy = sd * 20.0, 1.5

        def E(dx, dy):
            """a point of this eye: dx > 0 toward the outside of the face"""
            return P(cx + sd * dx, cy + dy)
        if shut:
            d.line([E(-10.5, 0.5), E(-5, -1.8), E(1, -2.4), E(6, -1.6), E(11, 0.4)], fill=LID + (255,), width=lw(2.0), joint='curve')
            continue
        top = [E(-10.5, 1.2), E(-8, 5.4), E(-3, 8.0), E(2.5, 8.4), E(7.5, 6.6), E(11, 2.0)]
        bot = [E(11, 2.0), E(10.2, -2.8), E(7, -6.2), E(1.5, -7.6), E(-4, -7.0), E(-8.4, -4.2), E(-10.5, 1.2)]
        eye = top + bot[1:-1]
        d.polygon(eye, fill=(250, 248, 242, 255))
        mask = Image.new('L', big.size, 0)
        ImageDraw.Draw(mask).polygon(eye, fill=255)
        iris = Image.new('RGBA', big.size, (0, 0, 0, 0))
        di = ImageDraw.Draw(iris)
        ix, iy = cx - sd * 0.3, cy + 0.1
        di.ellipse(box(ix, iy, 7.6, 8.1), fill=IRIS_RING + (255,))
        inner = Image.new('L', big.size, 0)
        ImageDraw.Draw(inner).ellipse(box(ix, iy, 6.7, 7.2), fill=255)
        grad = Image.new('RGBA', big.size, (0, 0, 0, 0))
        dg = ImageDraw.Draw(grad)
        ya, yb = P(0, iy + 7.2)[1], P(0, iy - 7.2)[1]
        xa, xb = P(ix - 8, 0)[0], P(ix + 8, 0)[0]
        for yy in range(int(ya), int(yb) + 1):
            t = max(0.0, min(1.0, (yy - ya) / max(1.0, yb - ya))) ** 1.2
            dg.line((xa, yy, xb, yy), fill=tuple(round(IRIS_TOP[i] + (IRIS_BOT[i] - IRIS_TOP[i]) * t) for i in range(3)) + (255,))
        iris.paste(grad, (0, 0), inner)
        di.ellipse(box(ix, iy - 0.2, 2.5, 2.7), fill=(12, 10, 22, 255))
        di.ellipse(box(ix - 2.6, iy + 2.9, 2.0, 2.1), fill=(255, 255, 255, 245))
        di.ellipse(box(ix + 2.4, iy - 2.9, 0.9, 0.95), fill=(255, 255, 255, 190))
        # the upper lid's shadow over the top of the eye: a steady look
        di.polygon(top + [E(11, 4.6), E(2.5, 5.7), E(-3, 5.3), E(-8, 3.2)], fill=(60, 34, 24, 70))
        big.paste(iris, (0, 0), Image.composite(iris, Image.new('RGBA', big.size, (0, 0, 0, 0)), mask))
        d = ImageDraw.Draw(big, 'RGBA')
        d.line(top + [E(11.9, 0.8)], fill=LID + (255,), width=lw(2.0), joint='curve')
        d.line(bot, fill=(110, 64, 44, 150), width=lw(0.55), joint='curve')
    # brows: thick and dark, square at the inside and thinning outward, set close over the eyes and angled down toward the
    # nose: determined
    for sd in (-1, 1):
        d.polygon([P(sd * 7.5, 7.4), P(sd * 7.5, 12.4), P(sd * 17, 17.2), P(sd * 33.5, 19.6), P(sd * 34, 17.2), P(sd * 17, 13.4)],
                  fill=BROW + (255,))
    # a small mouth set in a frown, the lower lip catching a little light, the shadow under it
    d.line([P(-7.4, -32.6), P(-4.4, -31.0), P(-1.5, -30.3), P(1.5, -30.3), P(4.4, -31.0), P(7.4, -32.6)], fill=(112, 54, 42, 255), width=lw(1.3), joint='curve')
    ell(0, -33.0, 4.4, 1.2, (255, 225, 205, 42))
    ell(0, -34.6, 5.0, 1.3, (120, 60, 40, 50))
    # the soft dip between the lower lip and the chin, and a little light on the chin
    ell(0, -38.5, 6, 2.0, (120, 60, 40, 30))
    ell(0, -48, 6, 4, (255, 236, 214, 30))
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
