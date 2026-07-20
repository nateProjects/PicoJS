#!/usr/bin/env python3
"""
gfx-to-png.py
=============
One-off asset extractor for the PicoDiver port — NOT part of the official
tools/p8-to-js.js converter (that tool deliberately leaves __gfx__ alone;
this script is separate and doesn't touch it).

Decodes a Pico-8 cart's __gfx__ section (128 rows x 128 hex nibbles, one
nibble per pixel = a Pico-8 colour index 0-15) into a 128x128 spritesheet
PNG using the standard Pico-8 palette, so picoJS.run({ sprites: ... }) has
an actual image to load.

Pure stdlib (zlib for PNG compression/CRC) — no Pillow, no npm packages.

Usage:
    python3 gfx-to-png.py input.p8 output.png
"""
import struct
import sys
import zlib

PICO8_PALETTE = [
    (0x00, 0x00, 0x00),  # 0  black
    (0x1D, 0x2B, 0x53),  # 1  dark-blue
    (0x7E, 0x25, 0x53),  # 2  dark-purple
    (0x00, 0x87, 0x51),  # 3  dark-green
    (0xAB, 0x52, 0x36),  # 4  brown
    (0x5F, 0x57, 0x4F),  # 5  dark-grey
    (0xC2, 0xC3, 0xC7),  # 6  light-grey
    (0xFF, 0xF1, 0xE8),  # 7  white
    (0xFF, 0x00, 0x4D),  # 8  red
    (0xFF, 0xA3, 0x00),  # 9  orange
    (0xFF, 0xEC, 0x27),  # 10 yellow
    (0x00, 0xE4, 0x36),  # 11 green
    (0x29, 0xAD, 0xFF),  # 12 blue
    (0x83, 0x76, 0x9C),  # 13 lavender
    (0xFF, 0x77, 0xA8),  # 14 pink
    (0xFF, 0xCC, 0xAA),  # 15 light-peach
]


def split_sections(src):
    sections = {}
    cur = None
    buf = []
    for line in src.splitlines():
        if line.startswith("__") and line.endswith("__") and len(line) > 4:
            if cur is not None:
                sections[cur] = "\n".join(buf)
            cur = line.strip("_")
            buf = []
        elif cur is not None:
            buf.append(line)
    if cur is not None:
        sections[cur] = "\n".join(buf)
    return sections


def parse_gfx(body):
    """128 rows x 128 hex nibbles -> 128x128 list of colour indices (0-15)."""
    rows = [l for l in body.splitlines() if l]
    pixels = []
    for y in range(128):
        row = rows[y] if y < len(rows) else ""
        line = []
        for x in range(128):
            line.append(int(row[x], 16) if x < len(row) else 0)
        pixels.append(line)
    return pixels


def write_png(path, pixels):
    width = len(pixels[0])
    height = len(pixels)

    raw = bytearray()
    for row in pixels:
        raw.append(0)  # filter type 0 (none) for this scanline
        for idx in row:
            r, g, b = PICO8_PALETTE[idx & 0xF]
            raw += bytes((r, g, b))

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)  # 8-bit RGB
    idat = zlib.compress(bytes(raw), 9)

    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", ihdr))
        f.write(chunk(b"IDAT", idat))
        f.write(chunk(b"IEND", b""))


def main():
    if len(sys.argv) != 3:
        sys.stderr.write("Usage: python3 gfx-to-png.py input.p8 output.png\n")
        sys.exit(1)
    src = open(sys.argv[1], "r", encoding="utf-8").read()
    sections = split_sections(src)
    pixels = parse_gfx(sections.get("gfx", ""))
    write_png(sys.argv[2], pixels)
    sys.stderr.write("wrote %s (%dx%d)\n" % (sys.argv[2], len(pixels[0]), len(pixels)))


if __name__ == "__main__":
    main()
