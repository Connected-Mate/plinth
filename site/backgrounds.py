#!/usr/bin/env python3
"""Web-optimise Alex's Plinth backgrounds for the site.

    uv run --with pillow python -I site/backgrounds.py [SRC]

SRC defaults to ~/Projects/plinth/design/backgrounds-src (one folder per family).
Writes docs/assets/bg/<id>.avif + .webp (each <= 250 KB), <id>-t.webp thumbnails
(160 px) and site/data/backgrounds.json (family, files, tone, average colour).
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageStat

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "Projects/plinth/design/backgrounds-src"
OUT = ROOT / "docs/assets/bg"
MAX_BYTES = 250 * 1024
MAX_W, MAX_H = 1600, 2400

FAMILIES = {  # folder → (key, FR label, EN label, inset crop to drop object edges)
    "Paper Texture": ("paper", "Papier", "Paper", 0.0),
    "Artisan Texture": ("artisan", "Artisan", "Artisan", 0.0),
    "Fabric Texture": ("fabric", "Tissu", "Fabric", 0.0),
    "Cutting Mat": ("mat", "Tapis de coupe", "Cutting mat", 0.07),
    "Liquid Glass textures": ("glass", "Verre liquide", "Liquid glass", 0.0),
}


def encode(im: Image.Image, path: Path, fmt: str) -> int:
    """Highest quality that fits MAX_BYTES; shrink the image if even q=30 is too big."""
    img = im
    while True:
        for q in (70, 60, 50, 42, 35, 30):
            if fmt == "AVIF":
                img.save(path, "AVIF", quality=q, speed=6)
            else:
                img.save(path, "WEBP", quality=q, method=6)
            size = path.stat().st_size
            if size <= MAX_BYTES:
                return size
        img = img.resize((int(img.width * 0.85), int(img.height * 0.85)), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    for folder, (key, fr, en, inset) in FAMILIES.items():
        files = sorted(p for p in (SRC / folder).glob("*") if re.search(r"\.(png|jpe?g)$", p.name, re.I))
        items = []
        for i, f in enumerate(files, 1):
            im = Image.open(f).convert("RGB")
            if inset:
                dx, dy = int(im.width * inset), int(im.height * inset)
                im = im.crop((dx, dy, im.width - dx, im.height - dy))
            im.thumbnail((MAX_W, MAX_H), Image.LANCZOS)
            bid = f"{key}-{i}"
            a = encode(im, OUT / f"{bid}.avif", "AVIF")
            w = encode(im, OUT / f"{bid}.webp", "WEBP")
            t = im.copy()
            t.thumbnail((160, 160), Image.LANCZOS)
            t.save(OUT / f"{bid}-t.webp", "WEBP", quality=70, method=6)
            small = im.resize((64, 64))
            r, g, b = (int(c) for c in ImageStat.Stat(small).mean[:3])
            lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
            items.append({"id": bid, "w": im.width, "h": im.height, "avg": f"#{r:02x}{g:02x}{b:02x}",
                          "tone": "dark" if lum < 140 else "light", "kb": [a // 1024, w // 1024]})
            print(f"{bid:10} {im.width}x{im.height} avif {a // 1024} KB webp {w // 1024} KB lum {lum:.0f}")
        if items:
            manifest.append({"key": key, "label": {"fr": fr, "en": en}, "items": items})
    (ROOT / "site/data/backgrounds.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
