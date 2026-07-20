#!/usr/bin/env node
// p8-to-js.js
// ===========
// Convert a Pico-8 cart (.p8) into a plain JavaScript module that picoJS can
// load as map data + sprite flags + sprite pixel data. No dependencies; just
// node.
//
// Usage:
//   node p8-to-js.js input.p8 [output.js]
//
// If output.js is omitted the JS is printed to stdout.
//
// Emits three top-level variables:
//   var mapData     = [[...128 entries...], ...32 rows...];
//   var spriteFlags = [256 bytes];
//   var spriteData  = [[...128 colour indices...], ...128 rows...];
//
// The file is written so it works in two environments:
//   - As a <script> tag: picks up `var mapData` / `var spriteFlags` /
//     `var spriteData` as globals.
//   - As a CommonJS require: `module.exports = { mapData, spriteFlags, spriteData }`.
//
// What it parses:
//   - `__map__` section: 32 rows of up to 256 hex chars (128 tile bytes per
//     row). Short / missing rows are padded with zeros.
//   - `__gff__` section: up to 2 rows of 256 hex chars (128 flag bytes each,
//     256 total). Short / missing rows are padded with zeros.
//   - `__gfx__` section: 128 rows of up to 128 hex chars (1 nibble = 1 pixel,
//     a Pico-8 colour index 0-15). Short / missing rows are padded with zeros.
//
// `spriteData` is for picoJS.run({ spriteData: ... }) — it feeds sget()
// directly as plain data, so pixel-perfect collision works without ever
// reading pixels back from a canvas (the getImageData() round-trip that
// requires the page to be served over http(s):// rather than file://, since
// browsers taint a canvas drawn from a file:// image). It is NOT an image —
// you still need an actual spritesheet PNG for spr()/sspr() to draw with;
// this tool doesn't produce one (see games/picodiver/gfx-to-png.py for a
// standalone, pure-stdlib-Python __gfx__ -> PNG extractor, kept separate
// since emitting binary image assets is a different concern from emitting a
// JS data module).
//
// It does NOT touch __sfx__ / __music__ / __lua__.

"use strict";

const fs   = require("fs");
const path = require("path");

// --- Section splitter ------------------------------------------------------

function splitSections(src) {
    // Split on lines that look like `__name__`. Keep the section name and the
    // body that follows it (up to the next `__name__` line or EOF).
    const lines = src.split(/\r?\n/);
    const out = {};
    let cur = null;
    let buf = [];

    for (const line of lines) {
        const m = /^__([a-z]+)__\s*$/.exec(line);
        if (m) {
            if (cur !== null) out[cur] = buf.join("\n");
            cur = m[1];
            buf = [];
        } else if (cur !== null) {
            buf.push(line);
        }
    }
    if (cur !== null) out[cur] = buf.join("\n");
    return out;
}

// --- Parsers ---------------------------------------------------------------

// __map__: 32 rows × 256 hex chars per row. Each pair of hex chars = one tile.
// Returns a 32 × 128 nested array of ints.
function parseMap(body) {
    const rows = (body || "").split(/\r?\n/).filter(l => l.length > 0);
    const result = [];
    for (let y = 0; y < 32; y++) {
        const row = rows[y] || "";
        const tiles = new Array(128);
        for (let x = 0; x < 128; x++) {
            const hex = row.substr(x * 2, 2);
            tiles[x] = hex.length === 2 ? parseInt(hex, 16) : 0;
            if (isNaN(tiles[x])) tiles[x] = 0;
        }
        result.push(tiles);
    }
    return result;
}

// __gff__: up to 2 rows × 256 hex chars (128 bytes each). Returns a 256-byte
// flat array.
function parseFlags(body) {
    const rows = (body || "").split(/\r?\n/).filter(l => l.length > 0);
    const flags = new Array(256).fill(0);
    for (let r = 0; r < 2; r++) {
        const row = rows[r] || "";
        for (let i = 0; i < 128; i++) {
            const hex = row.substr(i * 2, 2);
            const v = hex.length === 2 ? parseInt(hex, 16) : 0;
            flags[r * 128 + i] = isNaN(v) ? 0 : v;
        }
    }
    return flags;
}

// __gfx__: 128 rows × 128 hex chars per row. Each hex char is one pixel (a
// Pico-8 colour index, 0-15) — unlike __map__/__gff__, one nibble per pixel,
// not one byte. Returns a 128 × 128 nested array of ints.
function parseGfx(body) {
    const rows = (body || "").split(/\r?\n/).filter(l => l.length > 0);
    const result = [];
    for (let y = 0; y < 128; y++) {
        const row = rows[y] || "";
        const pixels = new Array(128);
        for (let x = 0; x < 128; x++) {
            const hex = row.substr(x, 1);
            pixels[x] = hex.length === 1 ? parseInt(hex, 16) : 0;
            if (isNaN(pixels[x])) pixels[x] = 0;
        }
        result.push(pixels);
    }
    return result;
}

// --- Map trim helpers ------------------------------------------------------

// Find the bounding box of non-zero tiles. Returns { w, h } of the used area.
// We don't actually trim the output (kept full-size for coordinate stability),
// but this is useful for a comment at the top so humans know how much of the
// map is populated.
function usedBounds(map) {
    let maxX = -1, maxY = -1;
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] !== 0) {
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }
        }
    }
    return { w: maxX + 1, h: maxY + 1 };
}

// --- Emitter ---------------------------------------------------------------

function emit(mapData, spriteFlags, spriteData, opts) {
    opts = opts || {};
    const bounds = usedBounds(mapData);
    const header =
        "// Generated by p8-to-js.js\n" +
        "// Source: " + (opts.source || "(stdin)") + "\n" +
        "// Map: 128x32 (used: " + bounds.w + "x" + bounds.h + ")\n" +
        "// Sprite flags: 256 bytes\n" +
        "// Sprite data: 128x128 colour indices (0-15), from __gfx__\n" +
        "//\n" +
        "// Works as both a <script> include (sets globals) and a CommonJS\n" +
        "// module (module.exports). Pass to picoJS.run as:\n" +
        "//   picoJS.run({ mapData: mapData, spriteFlags: spriteFlags,\n" +
        "//                spriteData: spriteData, sprites: \"sprites.png\", ... })\n" +
        "// spriteData feeds sget() directly — no canvas pixel read-back needed,\n" +
        "// so pixel-perfect collision works even opened via file://. You still\n" +
        "// need the actual spritesheet PNG (this tool doesn't emit one) for\n" +
        "// spr()/sspr() to draw with.\n\n";

    // Render mapData as a nested array, one row per line, zeros compacted for
    // readability (still valid JS).
    const mapLines = mapData.map(row => "    [" + row.join(",") + "]");
    const mapBody = "var mapData = [\n" + mapLines.join(",\n") + "\n];\n\n";

    // Render spriteFlags as a flat list, 16 per line.
    const flagChunks = [];
    for (let i = 0; i < spriteFlags.length; i += 16) {
        flagChunks.push("    " + spriteFlags.slice(i, i + 16)
            .map(v => "0x" + v.toString(16).padStart(2, "0")).join(", "));
    }
    const flagBody = "var spriteFlags = [\n" + flagChunks.join(",\n") + "\n];\n\n";

    // Render spriteData as a nested array, one row per line (same shape as
    // mapData, just 128x128 instead of 128x32).
    const gfxLines = spriteData.map(row => "    [" + row.join(",") + "]");
    const gfxBody = "var spriteData = [\n" + gfxLines.join(",\n") + "\n];\n\n";

    const footer =
        "if (typeof module !== \"undefined\" && module.exports) {\n" +
        "    module.exports = { mapData: mapData, spriteFlags: spriteFlags, spriteData: spriteData };\n" +
        "}\n";

    return header + mapBody + flagBody + gfxBody + footer;
}

// --- CLI -------------------------------------------------------------------

function main() {
    const args = process.argv.slice(2);
    if (args.length < 1 || args[0] === "-h" || args[0] === "--help") {
        process.stderr.write("Usage: node p8-to-js.js input.p8 [output.js]\n");
        process.exit(args.length < 1 ? 1 : 0);
    }

    const inPath  = args[0];
    const outPath = args[1];

    const src = fs.readFileSync(inPath, "utf8");
    const sections = splitSections(src);

    const map   = parseMap(sections.map || "");
    const flags = parseFlags(sections.gff || "");
    const gfx   = parseGfx(sections.gfx || "");

    const js = emit(map, flags, gfx, { source: path.basename(inPath) });

    if (outPath) {
        fs.writeFileSync(outPath, js);
        process.stderr.write("wrote " + outPath + "\n");
    } else {
        process.stdout.write(js);
    }
}

// Only run when invoked directly, not when required (so tests can import the
// parsers).
if (require.main === module) {
    main();
}

module.exports = { splitSections, parseMap, parseFlags, parseGfx, emit, usedBounds };
