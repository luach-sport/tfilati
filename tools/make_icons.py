"""Generates the app icons (launcher, adaptive foreground, web icon) for תפילתי.

Run: python3 tools/make_icons.py   (needs Pillow)
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(ROOT, 'android-res')
BG = (11, 16, 38, 255)
GOLD = (242, 193, 78, 255)
GOLD_TRACK = (54, 46, 20, 255)
SKY = (127, 178, 255, 255)
SKY_TRACK = (24, 40, 72, 255)
SS = 4  # supersampling


def rings(size, diameter_ratio, transparent_bg=True, shape=None):
    S = size * SS
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0) if transparent_bg else BG)
    d = ImageDraw.Draw(img)
    if shape == 'square':
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=BG)
    elif shape == 'circle':
        d.ellipse([0, 0, S - 1, S - 1], fill=BG)
    cx = cy = S / 2
    outer_r = S * diameter_ratio / 2
    w = outer_r * 0.2
    inner_r = outer_r - w * 1.45

    def arc(r, start, end, color, width):
        box = [cx - r, cy - r, cx + r, cy + r]
        d.arc(box, start, end, fill=color, width=int(width))

    def cap(r, ang, color, width):
        import math
        rr = r - width / 2
        x = cx + rr * math.cos(math.radians(ang))
        y = cy + rr * math.sin(math.radians(ang))
        d.ellipse([x - width / 2, y - width / 2, x + width / 2, y + width / 2], fill=color)

    # tracks
    arc(outer_r, 0, 360, GOLD_TRACK, w)
    arc(inner_r, 0, 360, SKY_TRACK, w)
    # progress arcs (start at 12 o'clock, clockwise)
    arc(outer_r, -90, 180, GOLD, w)
    cap(outer_r, -90, GOLD, w)
    cap(outer_r, 180, GOLD, w)
    arc(inner_r, -90, 120, SKY, w)
    cap(inner_r, -90, SKY, w)
    cap(inner_r, 120, SKY, w)
    # small gold Magen David in the centre (two overlapping triangles)
    import math
    star_r = inner_r * 0.4
    for base in (-90, 90):
        pts = [(cx + star_r * math.cos(math.radians(base + k * 120)), cy + star_r * math.sin(math.radians(base + k * 120))) for k in range(3)]
        d.polygon(pts, fill=GOLD)
    return img.resize((size, size), Image.LANCZOS)


def save(img, *parts):
    path = os.path.join(*parts)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)


DENS = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
for name, f in DENS.items():
    legacy = int(48 * f)
    save(rings(legacy, 0.64, shape='square'), RES, 'mipmap-' + name, 'ic_launcher.png')
    save(rings(legacy, 0.62, shape='circle'), RES, 'mipmap-' + name, 'ic_launcher_round.png')
    fg = int(108 * f)
    save(rings(fg, 0.56), RES, 'mipmap-' + name, 'ic_launcher_foreground.png')

save(rings(192, 0.64, shape='square'), ROOT, 'www', 'icon.png')
save(rings(512, 0.64, shape='square'), ROOT, 'assets', 'icon-512.png')
print('icons written')
