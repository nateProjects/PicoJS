// picoJS 0.4.10
// =============
// New in this milestone:
//   * Math helpers — mid, min, max, abs, ceil, sgn, and the bitwise-op
//     functions (band, bor, bxor, bnot, shl, shr, lshr) that Pico-8's Lua
//     calls as functions rather than operators (its dialect predates native
//     bitwise operators). All installed as globals alongside flr/sin/cos/
//     atan2/rnd. sgn(0) is 1, not 0 — a real Pico-8 quirk (unlike
//     Math.sign). Bitwise ops treat operands as plain 32-bit integers via
//     |0 — exact for whole-number operands (the common case: flags,
//     bit-packing) but not fixed-point-exact for fractional inputs, since
//     picoJS doesn't model Pico-8's 16.16 fixed-point number system
//     anywhere else either.
//
// Carried forward (0.4.9):
//   * pal(c0, c1, [p]) / palt(c, t) — draw-time colour remap and sprite
//     transparency, applied to every drawing primitive AND sprites/map()
//     alike (matching real Pico-8: pal() affects the whole draw pipeline,
//     not just spr()). Only the default draw palette (p=0) is implemented —
//     p=1 (the "screen" palette, a whole-framebuffer remap applied at flip
//     time) is a bigger, different mechanism and is explicitly out of scope
//     for now; calling pal(c0, c1, 1) logs a one-time warning and no-ops.
//   * Side effect, found necessary to make palt() meaningful at all: sprites
//     now actually support transparency. Previously spr()/sspr()/map() drew
//     straight from the loaded PNG via drawImage() with no alpha channel at
//     all — every sprite rendered as a fully opaque rectangle, colour 0
//     included. Real Pico-8 always treats colour 0 as transparent by
//     default; this is a default-behaviour change for every existing game
//     using picoJS (sprites now composite correctly over whatever's behind
//     them, instead of drawing a solid box).
//   * Mechanism: primitives (rect, circ, line, pset, print, cls, colour())
//     already funnel every colour argument through resolveColour() — that
//     now checks the draw-palette remap first. Sprites can't be remapped
//     that way (drawImage() has no per-pixel recolour hook), so instead the
//     whole spritesheet gets recomposited into an offscreen canvas — using
//     the SAME indexed pixel data sget()/sgetc() already extract (0.4.6/
//     0.4.7) — applying the current pal() remap and palt() transparency
//     per pixel, rebuilt lazily whenever either changes. spr()/map() draw
//     from that composited canvas instead of the raw image; sspr() called
//     directly with an explicit image argument is untouched (it draws
//     arbitrary caller-supplied images, not necessarily indexed sprite
//     data, so there's nothing to remap). Degrades the same way sget()
//     already does: falls back to the old raw/opaque rendering (with a
//     one-time warning) if no indexed data is available at all — no
//     opts.spriteData AND a tainted canvas.
//   * picoJS.paletteReady mirrors sgetReady/sgetcReady for this path.
//
// Carried forward (0.4.8):
//   * print() now renders with an actual bitmap font by default — the real
//     PICO-8 4x6 pixel font (sourced from althonos/embedded-picofont, itself
//     derived from Lexaloffle's own font asset under CC-0), not the canvas's
//     anti-aliased system font. Fixes the "text still looks blurry" gap left
//     open by 0.4.5's opts.scale note: higher render resolution made the old
//     canvas font less blurry, but it was never going to be pixel-identical
//     to Pico-8, because browsers always anti-alias fillText() glyphs
//     regardless of size. Drawing pre-authored pixel data instead sidesteps
//     that entirely.
//   * print(words, x, y, col, "system") — explicit opt-out back to the old
//     canvas-font rendering, for text the bitmap font can't cover (anything
//     outside printable ASCII 32-126 falls back to '?' in the bitmap font,
//     matching the upstream reference implementation's own fallback).
//   * picoJS.registerFont(name, { cellW, cellH, firstCode, glyphs }) — install
//     an additional bitmap font (yours or someone else's), and
//     picoJS.setFont(name) to make it the default for subsequent print()
//     calls, or pass the name as print()'s 5th argument for a one-off. Glyph
//     data is a flat hex string, cellH hex-nibble-groups per character
//     (ceil(cellW / 4) hex chars per row, MSB-first), starting at firstCode
//     — the same encoding the built-in "pico8" font uses internally.
//     picoJS.fontInfo(name) returns { cellW, cellH } for games that want to
//     do their own text-width math against a specific font.
//
// Carried forward (0.4.7):
//   * sgetc(x, y) — a second, independent read of the spritesheet: always
//     the canvas-decoded pixels (the 0.4.4/0.4.5 getImageData() technique),
//     regardless of whether opts.spriteData was also supplied. Previously,
//     supplying opts.spriteData made picoJS skip the canvas decode entirely,
//     so there was no way to get *both* views — e.g. to sanity-check that a
//     hand-edited spritesheet PNG still matches the cart's original
//     __gfx__-derived data, or to read back a spritesheet that's been
//     redrawn at runtime. sget(x, y)'s own behaviour is unchanged: prefers
//     opts.spriteData if supplied, falls back to the canvas decode
//     otherwise. sgetc() degrades the same way the old sget() canvas path
//     always did — returns 0 and logs a one-time warning if the canvas
//     turns out tainted (e.g. under file://); that warning now distinguishes
//     whether sget() itself is also affected or just sgetc(). New
//     picoJS.sgetcReady getter mirrors picoJS.sgetReady for this path.
//
// Carried forward (0.4.6):
//   * opts.spriteData — feed sget() plain pixel data directly (a 2D array of
//     Pico-8 colour indices, e.g. from tools/p8-to-js.js's new __gfx__
//     parsing) instead of always decoding it from the loaded spritesheet via
//     an offscreen canvas + getImageData(). That canvas read-back is exactly
//     what a tainted canvas blocks (SecurityError under file://), which is
//     why pixel-perfect collision previously only worked when served over
//     http(s)://. With opts.spriteData supplied, sget() never touches a
//     canvas at all, so it works unconditionally — file:// included. The
//     spritesheet image (opts.sprites) is still required for spr()/sspr() to
//     actually draw with; only the *reading pixels back* step is bypassed.
//
// Carried forward (0.4.5, both found while porting a real cart, PicoDiver):
//   * Frame-rate throttling — opts.fps (default 30, matching vanilla Pico-8's
//     _update()/_draw() rate) decouples game-logic speed from the browser's
//     display refresh rate. Previously the loop ran _update/_draw once per
//     requestAnimationFrame with no throttling at all, so a 60Hz/120Hz/144Hz
//     monitor made every ported game run 2-4x too fast — frame-counted
//     timers (animation, spawn timers, oxygen depletion, ...) all fired that
//     much sooner in wall-clock time. Pass opts.fps: 60 for carts that
//     define _update60() instead of _update().
//   * opts.scale — optional internal render-resolution multiplier. Sets the
//     canvas's actual backing size to (logical size * scale) and applies a
//     matching context scale + imageSmoothingEnabled = false, so text and
//     primitives are drawn at real higher resolution instead of being
//     CSS-upscaled after the fact. print()'s canvas-font text in particular
//     looks visibly less blurry at scale 3-4 than doing the same visual
//     enlargement via a CSS transform, since CSS scaling just blows up
//     already-anti-aliased low-res pixels rather than rendering the glyphs
//     at the higher resolution in the first place. pget() accounts for the
//     scale factor internally; game code keeps using the same logical (e.g.
//     128x128) coordinate space regardless of opts.scale.
//   * picoJS.sgetReady — boolean getter so game code can detect a tainted
//     canvas (sget() silently returning 0 for everything, e.g. under
//     file://) and show its own on-screen warning instead of collision just
//     mysteriously not working.
//
// Carried forward:
//   * 0.4.4: sget(x, y), colourIndexFromRGB() shared palette reverse-lookup.
//   * 0.4.3: btnp auto-repeat, table helpers, math quirks.
//   * 0.4.2: no library API changes (converter tool only).
//   * 0.4.1: data-array map, mget/mset/fget/fset, map() mlayer filter.
//   * 0.4.0: namespace + run(), drawing primitives, camera, debug panel,
//     robust asset loading, pget SecurityError guard.

(function (global) {
    "use strict";

    var picoJS = {};

    // --- Module-level state (set by picoJS.run) -----------------------------

    var canvas = null;
    var screen = null; // 2d context

    var sprSheet = null;
    var mapImage = null; // back-compat: used only if opts.map is supplied

    // Indexed spritesheet pixel data (0.4.4), built once when sprSheet loads.
    // spriteDataArr[y * sheetW + x] = Pico-8 colour index (0-15), or -1 if the
    // pixel didn't match any palette entry. Powers sget(). null until built
    // (or if the canvas is tainted and extraction failed). Sourced from
    // opts.spriteData directly (0.4.6) if supplied, else backfilled from the
    // canvas decode below once the spritesheet image loads.
    var spriteDataArr = null;
    var sheetW = 0;
    var sheetH = 0;

    // Canvas-decoded spritesheet pixel data (0.4.7) — always built from the
    // loaded image via getImageData() when possible, independently of
    // whether opts.spriteData was also supplied. Powers sgetc(). Same shape
    // as spriteDataArr/sheetW/sheetH above, just a separate, always-canvas-
    // sourced copy so both are available at once.
    var canvasSpriteDataArr = null;
    var canvasSheetW = 0;
    var canvasSheetH = 0;

    var sgetWarned = false;

    // Palette state (0.4.9). drawPal/spritePalt are sparse maps keyed by
    // source colour index — {} means identity / nothing remapped. drawPal
    // affects every primitive (via resolveColour()) and, composited into
    // effSpriteCanvas below, sprites too. spritePalt controls which sprite
    // colour indices draw as fully transparent (default: {0: true}, matching
    // Pico-8's "colour 0 is transparent" convention).
    var drawPal = {};
    var spritePalt = { 0: true };

    // Composited spritesheet: spriteDataArr's indices run through drawPal +
    // spritePalt into actual RGBA pixels, rebuilt (lazily, only when dirty)
    // whenever pal()/palt() changes. spr()/map() draw from this instead of
    // the raw sprSheet image; sspr() called directly with an explicit image
    // argument is unaffected. Falls back to raw/opaque rendering (sprSheet
    // itself) if spriteDataArr isn't available at all.
    var effSpriteCanvas = null;
    var effSpriteCtx = null;
    var effSpriteDirty = true;
    var palWarned = false;

    var sys = 0;
    var curcol = 7;
    var systems = [];
    var colours = [];

    var cam_x = 0;
    var cam_y = 0;

    var mapgrid = 16; // sprites per row on the spritesheet
    var sprsize = 8;  // sprite edge in pixels

    // Render-resolution multiplier (0.4.5). 1 = off (canvas backing size
    // equals the logical system size, same as pre-0.4.5 behaviour). Set via
    // opts.scale; affects canvas.width/height + a matching context scale.
    // pget() has to translate logical -> device-pixel coordinates using this;
    // sget() is unaffected since it reads a separate, natural-resolution
    // offscreen canvas built straight from the sprite image.
    var renderScaleN = 1;

    // Frame-rate throttling (0.4.5). targetFps defaults to 30 to match
    // vanilla Pico-8's _update()/_draw() rate; nextTickAt is the
    // performance.now()-space timestamp the next tick is due.
    var targetFps = 30;
    var tickIntervalMs = 1000 / targetFps;
    var nextTickAt = 0;

    // Data-backed map (0.4.1)
    var mapDataArr = null;  // 2D internal form: mapDataArr[y][x] = sprite#
    var mapWidthN  = 0;
    var mapHeightN = 0;
    // 256-entry flag byte table. Always allocated (zeros by default) so
    // fget/fset work even if the game didn't pass spriteFlags to run().
    var spriteFlagsArr = new Uint8Array(256);

    var keyPressedLeft  = false;
    var keyPressedRight = false;
    var keyPressedUp    = false;
    var keyPressedDown  = false;
    var keyPressedO     = false; // Pico-8 O button (Z / C)
    var keyPressedX     = false; // Pico-8 X button (X / V)

    // btnp (just-pressed) support. Per-button counter of consecutive frames
    // the button has been held; 0 means released. tickBtnp() is called once
    // per frame from loop() before _update runs, so btnp() inside _update
    // sees the current-frame value.
    var btnHoldFrames = [0, 0, 0, 0, 0, 0];
    // Pico-8 auto-repeat timings: first repeat fires 15 frames after the
    // initial press, then every 4 frames while held. So btnp fires on
    // frames 1, 16, 20, 24, 28, ...
    var BTNP_REPEAT_DELAY  = 15;
    var BTNP_REPEAT_PERIOD = 4;

    // Debug / diagnostics state
    var debugEnabled = false;
    var debugEl      = null;
    var debugLines   = [];
    var frameCountDbg = 0;
    var fpsFrames   = 0;
    var fpsLast     = 0;
    var fpsValue    = 0;
    var sprStatus   = "pending";
    var mapStatus   = "pending";
    var sprPixelStatus    = "pending"; // sget() data-extraction status
    var canvasPixelStatus = "pending"; // sgetc() canvas-decode status

    // --- Palettes -----------------------------------------------------------

    function buildSystems() {
        return [
            [0, 0, "Pico-8", 128, 128],
            [1, 1, "Pico-8 Alt", 64, 64],
            [2, 3, "ZX Spectrum", 256, 192]
        ];
    }

    function buildColours() {
        return [
            [
                [0, 0,  "#000000", "black"],
                [0, 1,  "#1D2B53", "dark-blue"],
                [0, 2,  "#7E2553", "dark-purple"],
                [0, 3,  "#008751", "dark-green"],
                [0, 4,  "#AB5236", "brown"],
                [0, 5,  "#5F574F", "dark-grey"],
                [0, 6,  "#C2C3C7", "light-grey"],
                [0, 7,  "#FFF1E8", "white"],
                [0, 8,  "#FF004D", "red"],
                [0, 9,  "#FFA300", "orange"],
                [0, 10, "#FFEC27", "yellow"],
                [0, 11, "#00E436", "green"],
                [0, 12, "#29ADFF", "blue"],
                [0, 13, "#83769C", "lavender"],
                [0, 14, "#FF77A8", "pink"],
                [0, 15, "#FFCCAA", "light-peach"]
            ],
            [
                [1, 128, "#291814", "brownish-black"],
                [1, 129, "#111D35", "darker-blue"],
                [1, 130, "#422136", "darker-purple"],
                [1, 131, "#125359", "blue-green"],
                [1, 132, "#742F29", "dark-brown"],
                [1, 133, "#49333B", "darker-grey"],
                [1, 134, "#A28879", "medium-grey"],
                [1, 135, "#F3EF7D", "light-yellow"],
                [1, 136, "#BE1250", "dark-red"],
                [1, 137, "#FF6C24", "dark-orange"],
                [1, 138, "#A8E72E", "lime-green"],
                [1, 139, "#00B543", "medium-green"],
                [1, 140, "#065AB5", "true-blue"],
                [1, 141, "#754665", "mauve"],
                [1, 142, "#FF6E59", "dark-peach"],
                [1, 143, "#FF9D81", "peach"]
            ],
            [
                [10, 0,  "#000000", "black"],
                [10, 1,  "#0000FF", "blue"],
                [10, 2,  "#FF0000", "red"],
                [10, 3,  "#FF00FF", "magenta"],
                [10, 4,  "#00FF00", "green"],
                [10, 5,  "#00FFFF", "cyan"],
                [10, 6,  "#FFFF00", "yellow"],
                [10, 7,  "#FFFFFF", "white"],
                [10, 8,  "#0000D8", "bright-blue"],
                [10, 9,  "#D80000", "bright-red"],
                [10, 10, "#D800D8", "bright-magenta"],
                [10, 11, "#00D800", "bright-green"],
                [10, 12, "#00D8D8", "bright-cyan"],
                [10, 13, "#D8D800", "bright-yellow"],
                [10, 14, "#D8D8D8", "bright-white"]
            ]
        ];
    }

    // Draw-palette remap (0.4.9) — c stays untouched if pal() hasn't
    // remapped it. Shared by resolveColour() (primitives) and
    // rebuildEffectiveSprites() (sprites), so pal() affects both the same way.
    function palMap(c) {
        return drawPal.hasOwnProperty(c) ? drawPal[c] : c;
    }

    function resolveColour(col) {
        if (col === undefined || col === null) col = curcol;
        if (typeof col === "number") return colours[sys][palMap(col)][2];
        return col;
    }

    // Reverse lookup: RGB byte triple -> Pico-8 palette index, or -1 if the
    // colour doesn't match any entry in the active system's palette. Shared
    // by pget() (reads the on-screen canvas) and buildSpriteData() (reads the
    // spritesheet, for sget()).
    function colourIndexFromRGB(r, g, b) {
        var hex = "#" + [r, g, b].map(function (c) {
            var s = c.toString(16).toUpperCase();
            return s.length < 2 ? "0" + s : s;
        }).join("");
        var palette = colours[sys];
        for (var i = 0; i < palette.length; i++) {
            if (palette[i][2].toUpperCase() === hex) return palette[i][1];
        }
        return -1;
    }

    // --- Bitmap fonts (0.4.8) ------------------------------------------------
    //
    // The real PICO-8 4x6 pixel font, printable ASCII 32-126 ('?' at 63 used
    // as the fallback glyph for anything outside that range — matching the
    // upstream reference implementation's own convention). Extracted from
    // althonos/embedded-picofont's font.png (itself sourced from Lexaloffle's
    // own PICO-8 font asset, released under CC-0), 4x6 cells, 1 hex nibble
    // per row (cellW <= 4 bits). Glyphs are stored back to back, cellH hex
    // chars each, in printable-ASCII order starting at firstCode.
    var PICO8_FONT_HEX =
        "000000444040aa0000aeaea0ec6e40a248a0cccae0480000488840422240a4e4a004e40000048000e000000040244480" +
        "eaaae0c444e0e2e8e0e262e0aae220e8e2e088eae0e22220eaeae0eae2200404000404802484200e0e00842480e260404" +
        "aa860eaeaa0eacae0688860caaae0e8c8e0e8c880688ae0aaeaa0e444e0e444c0aacaa08888e0eeaaa0caaaa06aaac0eae" +
        "8804aac60eacaa068e2c0e44440aaaa60aaae40aaaee0aa4aa0aae2e0e248e0c888c084442062226" +
        "04a00000000e04200000eaea00ccae00e88e00caac00ec8e00ec8800e8ae00aaea00e44e00e44c00acaa00888e00eeaa0" +
        "0caaa006aac00eae8004ac600eaca00682c00e44400aaa600aae400aaee00a4aa00ae2e00e28e064c460444440c464c00" +
        "2e800";

    // name -> { cellW, cellH, firstCode, glyphs }. "pico8" is always
    // registered; picoJS.registerFont() adds more, picoJS.setFont() switches
    // print()'s default.
    var fonts = {
        pico8: { cellW: 4, cellH: 6, firstCode: 32, glyphs: PICO8_FONT_HEX }
    };
    var activeFontName = "pico8";

    picoJS.registerFont = function (name, def) {
        if (!def || typeof def.glyphs !== "string" || !def.cellW || !def.cellH) {
            console.error("picoJS: registerFont(\"" + name + "\") — invalid font definition; need { cellW, cellH, firstCode, glyphs }.");
            return;
        }
        fonts[name] = {
            cellW: def.cellW | 0,
            cellH: def.cellH | 0,
            firstCode: (typeof def.firstCode === "number") ? def.firstCode | 0 : 32,
            glyphs: def.glyphs
        };
    };

    picoJS.setFont = function (name) {
        if (fonts[name]) activeFontName = name;
        else console.error("picoJS: setFont(\"" + name + "\") — no such registered font.");
    };

    picoJS.fontInfo = function (name) {
        var f = fonts[(typeof name === "string") ? name : activeFontName];
        return f ? { cellW: f.cellW, cellH: f.cellH } : null;
    };

    function drawBitmapFont(fontDef, words, x, y, col) {
        screen.fillStyle = resolveColour(col !== undefined ? col : curcol);
        var cellW = fontDef.cellW;
        var cellH = fontDef.cellH;
        var hexPerRow = Math.ceil(cellW / 4);
        var glyphLen = cellH * hexPerRow;
        var rowBitWidth = hexPerRow * 4;
        var qmarkIdx = ("?".charCodeAt(0) - fontDef.firstCode) * glyphLen;
        var px = (x | 0) - cam_x;
        var py = (y | 0) - cam_y;
        for (var i = 0; i < words.length; i++) {
            var idx = (words.charCodeAt(i) - fontDef.firstCode) * glyphLen;
            if (idx < 0 || idx + glyphLen > fontDef.glyphs.length) idx = qmarkIdx;
            if (idx >= 0 && idx + glyphLen <= fontDef.glyphs.length) {
                for (var row = 0; row < cellH; row++) {
                    var rowHex = fontDef.glyphs.substr(idx + row * hexPerRow, hexPerRow);
                    var bits = parseInt(rowHex, 16) | 0;
                    for (var bcol = 0; bcol < cellW; bcol++) {
                        if ((bits >> (rowBitWidth - 1 - bcol)) & 1) {
                            screen.fillRect(px + bcol, py + row, 1, 1);
                        }
                    }
                }
            }
            px += cellW;
        }
    }

    function drawSystemFont(words, x, y, col) {
        screen.font = "6px monospace";
        screen.fillStyle = resolveColour(col !== undefined ? col : curcol);
        screen.fillText(words, (x | 0) - cam_x, (y | 0) - cam_y);
    }

    // --- Screen state -------------------------------------------------------

    picoJS.cls = function (col) {
        if (col !== undefined && col !== null) {
            screen.fillStyle = resolveColour(col);
            screen.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            screen.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    picoJS.colour = function (col) {
        curcol = col;
        screen.fillStyle = resolveColour(col);
        return colours[sys][palMap(col)][2];
    };
    picoJS.color = picoJS.colour;

    picoJS.camera = function (x, y) {
        cam_x = (x | 0) || 0;
        cam_y = (y | 0) || 0;
    };

    // print(words, x, y, col, font) — font is a picoJS-only 5th argument:
    //   omitted        -> the active bitmap font (picoJS.setFont(), default "pico8")
    //   "system"       -> the old canvas-font fillText() rendering
    //   a font name    -> that registered bitmap font for this call only
    picoJS.print = function (words, x, y, col, font) {
        words = String(words);
        if (font === "system") {
            drawSystemFont(words, x, y, col);
            return;
        }
        var fontName = (typeof font === "string") ? font : activeFontName;
        var fontDef = fonts[fontName];
        if (!fontDef) {
            console.error("picoJS: print() — no such registered font \"" + fontName + "\"; falling back to \"system\".");
            drawSystemFont(words, x, y, col);
            return;
        }
        drawBitmapFont(fontDef, words, x, y, col);
    };

    // --- Drawing primitives -------------------------------------------------

    picoJS.pset = function (x, y, col) {
        screen.fillStyle = resolveColour(col !== undefined ? col : curcol);
        screen.fillRect((x | 0) - cam_x, (y | 0) - cam_y, 1, 1);
    };

    var pgetWarned = false;
    picoJS.pget = function (x, y) {
        var data;
        try {
            // getImageData reads device pixels, ignoring the context's
            // current transform — so with opts.scale in effect we have to
            // convert the logical (x, y) to device coordinates ourselves.
            data = screen.getImageData(
                ((x | 0) - cam_x) * renderScaleN,
                ((y | 0) - cam_y) * renderScaleN,
                1, 1
            ).data;
        } catch (e) {
            if (!pgetWarned) {
                pgetWarned = true;
                console.warn("picoJS: pget() disabled — canvas is tainted (" + (e && e.name) + "). Serve via http(s):// to enable.");
            }
            return -1;
        }
        return colourIndexFromRGB(data[0], data[1], data[2]);
    };

    picoJS.rectfill = function (x0, y0, x1, y1, col) {
        if (x1 < x0) { var tx = x0; x0 = x1; x1 = tx; }
        if (y1 < y0) { var ty = y0; y0 = y1; y1 = ty; }
        screen.fillStyle = resolveColour(col !== undefined ? col : curcol);
        screen.fillRect(
            (x0 | 0) - cam_x,
            (y0 | 0) - cam_y,
            (x1 | 0) - (x0 | 0) + 1,
            (y1 | 0) - (y0 | 0) + 1
        );
    };

    picoJS.rect = function (x0, y0, x1, y1, col) {
        if (x1 < x0) { var tx = x0; x0 = x1; x1 = tx; }
        if (y1 < y0) { var ty = y0; y0 = y1; y1 = ty; }
        screen.fillStyle = resolveColour(col !== undefined ? col : curcol);
        var dx = (x0 | 0) - cam_x;
        var dy = (y0 | 0) - cam_y;
        var w  = (x1 | 0) - (x0 | 0) + 1;
        var h  = (y1 | 0) - (y0 | 0) + 1;
        screen.fillRect(dx, dy, w, 1);
        screen.fillRect(dx, dy + h - 1, w, 1);
        screen.fillRect(dx, dy, 1, h);
        screen.fillRect(dx + w - 1, dy, 1, h);
    };

    picoJS.line = function (x0, y0, x1, y1, col) {
        screen.fillStyle = resolveColour(col !== undefined ? col : curcol);
        x0 = x0 | 0; y0 = y0 | 0; x1 = x1 | 0; y1 = y1 | 0;
        var dx = Math.abs(x1 - x0);
        var dy = Math.abs(y1 - y0);
        var sx = x0 < x1 ? 1 : -1;
        var sy = y0 < y1 ? 1 : -1;
        var err = dx - dy;
        /* eslint-disable no-constant-condition */
        while (true) {
            screen.fillRect(x0 - cam_x, y0 - cam_y, 1, 1);
            if (x0 === x1 && y0 === y1) break;
            var e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 <  dx) { err += dx; y0 += sy; }
        }
    };

    function plotCircle(cxIn, cyIn, rIn, fill, col) {
        var cx = cxIn | 0;
        var cy = cyIn | 0;
        var r  = rIn  | 0;
        if (r < 0) return;
        screen.fillStyle = resolveColour(col !== undefined ? col : curcol);
        var x = r;
        var y = 0;
        var d = 1 - r;
        while (x >= y) {
            if (fill) {
                fillRow(cx, cy + y, x);
                fillRow(cx, cy - y, x);
                fillRow(cx, cy + x, y);
                fillRow(cx, cy - x, y);
            } else {
                plotPx(cx + x, cy + y);
                plotPx(cx - x, cy + y);
                plotPx(cx + x, cy - y);
                plotPx(cx - x, cy - y);
                plotPx(cx + y, cy + x);
                plotPx(cx - y, cy + x);
                plotPx(cx + y, cy - x);
                plotPx(cx - y, cy - x);
            }
            y++;
            if (d <= 0) { d += 2 * y + 1; }
            else { x--; d += 2 * (y - x) + 1; }
        }
        function plotPx(px, py) { screen.fillRect(px - cam_x, py - cam_y, 1, 1); }
        function fillRow(cxi, py, halfW) {
            screen.fillRect(cxi - halfW - cam_x, py - cam_y, 2 * halfW + 1, 1);
        }
    }

    picoJS.circ     = function (cx, cy, r, col) { plotCircle(cx, cy, r, false, col); };
    picoJS.circfill = function (cx, cy, r, col) { plotCircle(cx, cy, r, true,  col); };

    function plotOval(x0, y0, x1, y1, fill, col) {
        if (x1 < x0) { var tx = x0; x0 = x1; x1 = tx; }
        if (y1 < y0) { var ty = y0; y0 = y1; y1 = ty; }
        x0 = x0 | 0; y0 = y0 | 0; x1 = x1 | 0; y1 = y1 | 0;
        screen.fillStyle = resolveColour(col !== undefined ? col : curcol);
        var a = (x1 - x0) / 2;
        var b = (y1 - y0) / 2;
        var cx = x0 + a;
        var cy = y0 + b;
        if (a <= 0 || b <= 0) {
            screen.fillRect(x0 - cam_x, y0 - cam_y, (x1 - x0) + 1, (y1 - y0) + 1);
            return;
        }
        if (fill) {
            for (var iy = y0; iy <= y1; iy++) {
                var dyN = (iy - cy) / b;
                var inside = 1 - dyN * dyN;
                if (inside < 0) continue;
                var dxN = Math.floor(a * Math.sqrt(inside));
                screen.fillRect(Math.round(cx - dxN) - cam_x, iy - cam_y, 2 * dxN + 1, 1);
            }
        } else {
            var steps = Math.max(16, Math.ceil(Math.max(a, b) * 8));
            for (var j = 0; j < steps; j++) {
                var t = (j / steps) * 2 * Math.PI;
                var px = Math.round(cx + a * Math.cos(t));
                var py = Math.round(cy + b * Math.sin(t));
                screen.fillRect(px - cam_x, py - cam_y, 1, 1);
            }
        }
    }

    picoJS.oval     = function (x0, y0, x1, y1, col) { plotOval(x0, y0, x1, y1, false, col); };
    picoJS.ovalfill = function (x0, y0, x1, y1, col) { plotOval(x0, y0, x1, y1, true,  col); };

    // --- Sprites ------------------------------------------------------------

    picoJS.sspr = function (img, sx, sy, sw, sh, dx, dy, dw, dh, flip_x, flip_y) {
        screen.save();
        var fx = flip_x === true ? -1 : 1;
        var fy = flip_y === true ? -1 : 1;
        screen.translate(
            dx - cam_x + (fx === -1 ? dw : 0),
            dy - cam_y + (fy === -1 ? dh : 0)
        );
        screen.scale(fx, fy);
        screen.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
        screen.restore();
    };

    picoJS.spr = function (n, x, y, w, h, flip_x, flip_y) {
        w = w || 1;
        h = h || 1;
        var sprcellx = n % mapgrid;
        var sprcelly = Math.floor(n / mapgrid);
        var sx = sprcellx * sprsize;
        var sy = sprcelly * sprsize;
        var sw = w * sprsize;
        var sh = h * sprsize;
        picoJS.sspr(currentSpriteSource(), sx, sy, sw, sh, x, y, sw, sh, flip_x, flip_y);
    };

    // Recomposite the whole spritesheet into effSpriteCanvas: each pixel's
    // stored colour index (from spriteDataArr — the same data sget() uses)
    // goes through the current palt() transparency check, then the current
    // pal() draw-palette remap, becoming an actual RGBA pixel. Rebuilt only
    // when pal()/palt() have actually changed something (effSpriteDirty).
    function rebuildEffectiveSprites() {
        effSpriteDirty = false;
        if (!spriteDataArr || !sheetW || !sheetH) {
            effSpriteCanvas = null; // no indexed data — nothing to composite
            return;
        }
        if (!effSpriteCanvas) {
            effSpriteCanvas = document.createElement("canvas");
            effSpriteCanvas.width = sheetW;
            effSpriteCanvas.height = sheetH;
            effSpriteCtx = effSpriteCanvas.getContext("2d");
        }
        var imgData = effSpriteCtx.createImageData(sheetW, sheetH);
        var d = imgData.data;
        var palette = colours[sys];
        for (var i = 0; i < sheetW * sheetH; i++) {
            var idx = spriteDataArr[i];
            if (idx < 0) idx = 0;
            var o = i * 4;
            if (spritePalt.hasOwnProperty(idx) ? spritePalt[idx] : false) {
                continue; // alpha already 0 from createImageData()
            }
            var entry = palette[palMap(idx)] || palette[idx];
            var hex = entry[2];
            d[o]     = parseInt(hex.substr(1, 2), 16);
            d[o + 1] = parseInt(hex.substr(3, 2), 16);
            d[o + 2] = parseInt(hex.substr(5, 2), 16);
            d[o + 3] = 255;
        }
        effSpriteCtx.putImageData(imgData, 0, 0);
    }

    // What spr()/map() should actually draw from: the pal()/palt()-composited
    // spritesheet if indexed data is available, else the raw loaded image
    // (pre-0.4.9 behaviour — opaque, unrecoloured).
    function currentSpriteSource() {
        if (effSpriteDirty) rebuildEffectiveSprites();
        return effSpriteCanvas || sprSheet;
    }

    // pal(c0, c1, [p]) — remap draw colour c0 to c1. p=1 (the "screen"
    // palette, a whole-framebuffer remap at flip time) isn't implemented —
    // only the default draw palette (p=0) is. pal() with no arguments resets
    // to identity.
    picoJS.pal = function (c0, c1, p) {
        if (c0 === undefined) {
            if (Object.keys(drawPal).length > 0) effSpriteDirty = true;
            drawPal = {};
            return;
        }
        if (p === 1) {
            console.warn("picoJS: pal(c0, c1, 1) — the screen palette (p=1) isn't supported, only the default draw palette (p=0) is. Ignored.");
            return;
        }
        c0 = c0 | 0; c1 = c1 | 0;
        if (!spriteDataArr && !palWarned) {
            palWarned = true;
            console.warn("picoJS: pal()/palt() won't affect sprites — no indexed sprite data available (supply opts.spriteData, or serve over http(s):// so the spritesheet canvas isn't tainted). Primitives are unaffected by this and will still remap correctly.");
        }
        if (drawPal[c0] !== c1) {
            drawPal[c0] = c1;
            effSpriteDirty = true;
        }
    };

    // palt(c, t) — mark sprite colour index c as transparent (t truthy) or
    // opaque (t falsy). Default: only index 0 is transparent. palt() with no
    // arguments resets to that default.
    picoJS.palt = function (c, t) {
        if (c === undefined) {
            effSpriteDirty = true;
            spritePalt = { 0: true };
            return;
        }
        c = c | 0;
        if (!spriteDataArr && !palWarned) {
            palWarned = true;
            console.warn("picoJS: pal()/palt() won't affect sprites — no indexed sprite data available (supply opts.spriteData, or serve over http(s):// so the spritesheet canvas isn't tainted). Primitives are unaffected by this and will still remap correctly.");
        }
        var truthy = !!t;
        if (Boolean(spritePalt[c]) !== truthy) {
            spritePalt[c] = truthy;
            effSpriteDirty = true;
        }
    };

    // Extract the whole spritesheet into an indexed pixel array via an
    // offscreen canvas + getImageData(), powering sgetc() — and, if the game
    // didn't supply opts.spriteData, backfilling sget() too (0.4.4/0.4.5
    // behaviour, preserved as the fallback). Runs once, right after sprSheet
    // finishes loading (both the async onload path and the already-cached
    // path in run() call this) — always, regardless of whether opts.spriteData
    // was also supplied, so sgetc() is available independently either way.
    function buildSpriteData() {
        try {
            var off = document.createElement("canvas");
            off.width  = sprSheet.naturalWidth;
            off.height = sprSheet.naturalHeight;
            var octx = off.getContext("2d");
            octx.drawImage(sprSheet, 0, 0);
            var data = octx.getImageData(0, 0, off.width, off.height).data;
            canvasSheetW = off.width;
            canvasSheetH = off.height;
            canvasSpriteDataArr = new Int16Array(canvasSheetW * canvasSheetH);
            for (var p = 0; p < canvasSheetW * canvasSheetH; p++) {
                canvasSpriteDataArr[p] = colourIndexFromRGB(data[p * 4], data[p * 4 + 1], data[p * 4 + 2]);
            }
            canvasPixelStatus = "ok " + canvasSheetW + "x" + canvasSheetH;
            if (!spriteDataArr) {
                spriteDataArr = canvasSpriteDataArr;
                sheetW = canvasSheetW;
                sheetH = canvasSheetH;
                sprPixelStatus = "ok (canvas) " + sheetW + "x" + sheetH;
            }
        } catch (e) {
            if (!sgetWarned) {
                sgetWarned = true;
                var impact = spriteDataArr
                    ? "sgetc() will return 0 for everything; sget() is unaffected (using opts.spriteData)."
                    : "sget()/sgetc() will return 0 for everything. Serve via http(s):// to enable, or supply opts.spriteData to bypass this entirely.";
                console.warn("picoJS: spritesheet canvas is tainted (" + (e && e.name) + ") — " + impact);
            }
            canvasSpriteDataArr = null;
            canvasPixelStatus = "disabled (tainted canvas)";
            if (!spriteDataArr) sprPixelStatus = "disabled (tainted canvas)";
        }
    }

    // Accept sprite pixel data supplied directly by the game (0.4.6) — e.g.
    // tools/p8-to-js.js's spriteData, a 2D array of Pico-8 colour indices
    // parsed straight from the cart's __gfx__ text. No canvas or image is
    // involved, so this can't be blocked by canvas tainting the way
    // buildSpriteData()'s getImageData() read-back can. Returns null if src
    // isn't a usable 2D array.
    function normalizeSpriteData(src) {
        if (!src || !Array.isArray(src) || src.length === 0 || !Array.isArray(src[0])) return null;
        var h = src.length;
        var w = src[0].length;
        var flat = new Int16Array(w * h);
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                flat[y * w + x] = src[y][x] | 0;
            }
        }
        return { data: flat, width: w, height: h };
    }

    // sget(x, y) — Pico-8 colour index (0-15) at spritesheet pixel (x, y).
    // Returns 0 for out-of-bounds coordinates or if the sheet hasn't been
    // extracted yet (matches Pico-8's own out-of-bounds behaviour); a pixel
    // that didn't match any palette entry also reads as 0 rather than -1,
    // since real sget() never returns a negative colour.
    picoJS.sget = function (x, y) {
        x = x | 0; y = y | 0;
        if (!spriteDataArr) return 0;
        if (x < 0 || y < 0 || x >= sheetW || y >= sheetH) return 0;
        var v = spriteDataArr[y * sheetW + x];
        return v < 0 ? 0 : v;
    };

    // sgetc(x, y) — same contract as sget(), but always reads the
    // canvas-decoded copy specifically (0.4.7), regardless of whether
    // opts.spriteData is also in use for sget() itself. Useful to compare
    // the loaded spritesheet PNG's actual pixels against authored data (e.g.
    // catching an image that's drifted out of sync with the cart), or to
    // read back a spritesheet redrawn at runtime. Degrades the same way
    // sget()'s old canvas path always did: 0 for everything if the canvas
    // turned out tainted.
    picoJS.sgetc = function (x, y) {
        x = x | 0; y = y | 0;
        if (!canvasSpriteDataArr) return 0;
        if (x < 0 || y < 0 || x >= canvasSheetW || y >= canvasSheetH) return 0;
        var v = canvasSpriteDataArr[y * canvasSheetW + x];
        return v < 0 ? 0 : v;
    };

    // --- Map (data-driven) + mget / mset ------------------------------------

    // Internal helper: normalise whatever the user passed as mapData (2D
    // nested array, flat typed array, or plain flat array + mapWidth) into
    // the internal 2D nested form. Called by run() and by setMapData().
    function normalizeMapData(src, widthHint) {
        if (!src) return null;
        // 2D nested?
        if (Array.isArray(src) && src.length > 0 &&
            (Array.isArray(src[0]) || ArrayBuffer.isView(src[0]))) {
            var h = src.length;
            var w = src[0].length;
            var out = new Array(h);
            for (var y = 0; y < h; y++) {
                var row = new Array(w);
                for (var x = 0; x < w; x++) {
                    row[x] = (src[y][x] | 0) & 0xFF;
                }
                out[y] = row;
            }
            return { data: out, width: w, height: h };
        }
        // Flat — need widthHint
        if (!widthHint || widthHint <= 0) {
            console.error("picoJS: flat mapData supplied without mapWidth — ignoring.");
            return null;
        }
        var wFlat = widthHint | 0;
        var hFlat = Math.floor(src.length / wFlat);
        var out2 = new Array(hFlat);
        for (var yy = 0; yy < hFlat; yy++) {
            var rr = new Array(wFlat);
            for (var xx = 0; xx < wFlat; xx++) {
                rr[xx] = (src[yy * wFlat + xx] | 0) & 0xFF;
            }
            out2[yy] = rr;
        }
        return { data: out2, width: wFlat, height: hFlat };
    }

    // Public — swap in a new map at runtime.
    picoJS.setMapData = function (src, widthHint) {
        var n = normalizeMapData(src, widthHint);
        if (!n) {
            mapDataArr = null; mapWidthN = 0; mapHeightN = 0; return;
        }
        mapDataArr = n.data;
        mapWidthN  = n.width;
        mapHeightN = n.height;
    };

    picoJS.mget = function (x, y) {
        if (!mapDataArr) return 0;
        x = x | 0; y = y | 0;
        if (x < 0 || y < 0 || x >= mapWidthN || y >= mapHeightN) return 0;
        return mapDataArr[y][x] | 0;
    };

    picoJS.mset = function (x, y, v) {
        if (!mapDataArr) return;
        x = x | 0; y = y | 0;
        if (x < 0 || y < 0 || x >= mapWidthN || y >= mapHeightN) return;
        mapDataArr[y][x] = (v | 0) & 0xFF;
    };

    // fget(n)       -> full flag byte (0..255)
    // fget(n, f)    -> boolean for bit f (0..7)
    picoJS.fget = function (n, f) {
        n = n | 0;
        if (n < 0 || n > 255) return (f === undefined) ? 0 : false;
        var b = spriteFlagsArr[n];
        if (f === undefined) return b;
        return (b & (1 << (f | 0))) !== 0;
    };

    // fset(n, v)       -> set full flag byte
    // fset(n, f, v)    -> set / clear bit f by truthiness of v
    picoJS.fset = function (n, f, v) {
        n = n | 0;
        if (n < 0 || n > 255) return;
        if (v === undefined) {
            spriteFlagsArr[n] = (f | 0) & 0xFF;
            return;
        }
        var mask = 1 << (f | 0);
        if (v) spriteFlagsArr[n] |= mask;
        else   spriteFlagsArr[n] &= ~mask;
    };

    // map(mcelx, mcely, msx, msy, mcelw, mcelh, mlayer)
    // With mapData: iterate the tile rect and spr() each non-zero sprite. If
    // mlayer is supplied, only tiles whose flags AND mlayer is non-zero draw.
    // Without mapData: fall back to drawImage on the loaded map PNG.
    picoJS.map = function (mcelx, mcely, msx, msy, mcelw, mcelh, mlayer) {
        mcelx = mcelx | 0; mcely = mcely | 0;
        msx = msx | 0; msy = msy | 0;
        mcelw = mcelw | 0; mcelh = mcelh | 0;

        if (mapDataArr) {
            var layerFilter = (mlayer !== undefined && mlayer !== null);
            var layerMask = layerFilter ? (mlayer | 0) : 0;
            var mapSpriteSrc = currentSpriteSource();
            for (var dy = 0; dy < mcelh; dy++) {
                var ty = mcely + dy;
                if (ty < 0 || ty >= mapHeightN) continue;
                var row = mapDataArr[ty];
                for (var dx = 0; dx < mcelw; dx++) {
                    var tx = mcelx + dx;
                    if (tx < 0 || tx >= mapWidthN) continue;
                    var n = row[tx] | 0;
                    if (n === 0) continue;  // Pico-8: sprite 0 is empty in maps
                    if (layerFilter && (spriteFlagsArr[n] & layerMask) === 0) continue;
                    var sprcellx = n % mapgrid;
                    var sprcelly = Math.floor(n / mapgrid);
                    picoJS.sspr(
                        mapSpriteSrc,
                        sprcellx * sprsize, sprcelly * sprsize, sprsize, sprsize,
                        msx + dx * sprsize, msy + dy * sprsize, sprsize, sprsize
                    );
                }
            }
        } else if (mapImage) {
            // Back-compat: image-based map (0.4.0 behaviour)
            screen.drawImage(mapImage,
                mcelx * 8, mcely * 8, mcelw * 8, mcelh * 8,
                (msx | 0) - cam_x, (msy | 0) - cam_y, mcelw * 8, mcelh * 8
            );
        }
    };

    // --- Input --------------------------------------------------------------

    picoJS.btn = function (i) {
        switch (i) {
            case 0: return keyPressedLeft;
            case 1: return keyPressedRight;
            case 2: return keyPressedUp;
            case 3: return keyPressedDown;
            case 4: return keyPressedO;
            case 5: return keyPressedX;
            default: return false;
        }
    };

    // btnp — just-pressed / auto-repeat. Fires on frame 1 of a hold, then
    // on frames (1 + BTNP_REPEAT_DELAY + k * BTNP_REPEAT_PERIOD) for k >= 0.
    // With the Pico-8 defaults (delay=15, period=4) that's frames 1, 16, 20,
    // 24, 28, ...
    picoJS.btnp = function (i) {
        if (i < 0 || i > 5) return false;
        var n = btnHoldFrames[i];
        if (n === 1) return true;
        // First repeat fires BTNP_REPEAT_DELAY frames after the initial press,
        // i.e. when n === BTNP_REPEAT_DELAY + 1. Then every BTNP_REPEAT_PERIOD.
        if (n >= BTNP_REPEAT_DELAY + 1) {
            return ((n - (BTNP_REPEAT_DELAY + 1)) % BTNP_REPEAT_PERIOD) === 0;
        }
        return false;
    };

    // Called once per frame before _update runs.
    function tickBtnp() {
        for (var i = 0; i < 6; i++) {
            if (picoJS.btn(i)) btnHoldFrames[i]++;
            else               btnHoldFrames[i] = 0;
        }
    }

    function keyDownHandler(e) {
        switch (e.code) {
            case "ArrowLeft":  keyPressedLeft  = true; break;
            case "ArrowRight": keyPressedRight = true; break;
            case "ArrowUp":    keyPressedUp    = true; break;
            case "ArrowDown":  keyPressedDown  = true; break;
            case "KeyZ": case "KeyC": keyPressedO = true; break;
            case "KeyX": case "KeyV": keyPressedX = true; break;
        }
    }

    function keyUpHandler(e) {
        switch (e.code) {
            case "ArrowLeft":  keyPressedLeft  = false; break;
            case "ArrowRight": keyPressedRight = false; break;
            case "ArrowUp":    keyPressedUp    = false; break;
            case "ArrowDown":  keyPressedDown  = false; break;
            case "KeyZ": case "KeyC": keyPressedO = false; break;
            case "KeyX": case "KeyV": keyPressedX = false; break;
        }
    }

    // --- Table helpers (Lua-style, JS-array-backed) ------------------------
    //
    // Pico-8 tables map cleanly onto JS arrays; these helpers keep the
    // familiar names so ports don't need rewriting. Pico-8's 1-based index
    // convention is honoured in add(t, v, i) and deli(t, i). `all(t)` returns
    // a *copy* of the array so `del()` during iteration is safe — the same
    // forgiving semantics Lua's `for v in all(t)` gives you.

    picoJS.add = function (t, v, i) {
        if (!t) return v;
        if (i === undefined || i === null) t.push(v);
        else t.splice(i - 1, 0, v);   // 1-based
        return v;
    };

    picoJS.del = function (t, v) {
        if (!t) return null;
        for (var i = 0; i < t.length; i++) {
            if (t[i] === v) {
                t.splice(i, 1);
                return v;
            }
        }
        return null;
    };

    picoJS.deli = function (t, i) {
        if (!t || t.length === 0) return null;
        if (i === undefined || i === null) i = t.length;   // default: last
        if (i < 1 || i > t.length) return null;
        return t.splice(i - 1, 1)[0];
    };

    picoJS.foreach = function (t, f) {
        if (!t) return;
        for (var i = 0; i < t.length; i++) {
            var v = t[i];
            if (v !== null && v !== undefined) f(v);
        }
    };

    picoJS.all = function (t) {
        return (t || []).slice();
    };

    picoJS.count = function (t, v) {
        if (!t) return 0;
        if (v === undefined) return t.length;
        var c = 0;
        for (var i = 0; i < t.length; i++) if (t[i] === v) c++;
        return c;
    };

    // --- Math quirks (Pico-8 flavours) --------------------------------------
    //
    // Pico-8 uses turns (0..1 = full circle) for trig, and its coordinate
    // system has y pointing down, which flips sin (but not cos). atan2 has
    // its arguments swapped vs JS and also returns turns. rnd is overloaded
    // on the argument type.

    picoJS.flr = Math.floor;

    picoJS.sin = function (x) { return -Math.sin(x * 2 * Math.PI); };
    picoJS.cos = function (x) { return  Math.cos(x * 2 * Math.PI); };

    // atan2(dx, dy) — Pico-8 order (east = 0, south = 0.25, west = 0.5,
    // north = 0.75). Returns a turn in [0, 1).
    picoJS.atan2 = function (dx, dy) {
        var t = Math.atan2(dy, dx) / (2 * Math.PI);
        return (t + 1) % 1;
    };

    // rnd():       [0, 1)
    // rnd(n):      [0, n) for number
    // rnd([a,b,]): random element of array-like
    picoJS.rnd = function (x) {
        if (x === undefined || x === null) return Math.random();
        if (typeof x === "number") return Math.random() * x;
        if (x && typeof x.length === "number" && x.length > 0) {
            return x[Math.floor(Math.random() * x.length)];
        }
        return Math.random();
    };

    picoJS.ceil = Math.ceil;
    picoJS.abs  = Math.abs;
    picoJS.min  = function (a, b) { return Math.min(a, b); };
    picoJS.max  = function (a, b) { return Math.max(a, b); };
    // mid(a,b,c) — the median of three values (classic branchless formula,
    // not a sort — this is what real carts use constantly for clamping,
    // e.g. mid(0, x, 127)).
    picoJS.mid  = function (a, b, c) {
        return Math.max(Math.min(a, b), Math.min(Math.max(a, b), c));
    };
    // sgn(x) — Pico-8 quirk: sgn(0) is 1, not 0 (unlike Math.sign). Only
    // negative numbers return -1.
    picoJS.sgn  = function (x) { return x < 0 ? -1 : 1; };

    // Bitwise ops (0.4.10) — Pico-8 Lua predates native bitwise operators, so
    // these are called as functions. Pico-8 numbers are 16.16 fixed-point and
    // these operate on the raw 32-bit representation; picoJS instead treats
    // operands as plain 32-bit integers via |0, which matches real Pico-8
    // exactly for whole-number operands (the overwhelming majority of real
    // usage — flags, bit-packing) but won't be fixed-point-exact for
    // fractional inputs. shr is arithmetic (sign-preserving, matches >>),
    // lshr is logical (zero-fill, matches >>>).
    picoJS.band = function (a, b) { return (a | 0) & (b | 0); };
    picoJS.bor  = function (a, b) { return (a | 0) | (b | 0); };
    picoJS.bxor = function (a, b) { return (a | 0) ^ (b | 0); };
    picoJS.bnot = function (a)    { return ~(a | 0); };
    picoJS.shl  = function (a, b) { return (a | 0) << (b | 0); };
    picoJS.shr  = function (a, b) { return (a | 0) >> (b | 0); };
    picoJS.lshr = function (a, b) { return (a | 0) >>> (b | 0); };

    // --- Lifecycle ----------------------------------------------------------

    picoJS.run = function (opts) {
        opts = opts || {};

        systems = buildSystems();
        colours = buildColours();
        sys = (typeof opts.systemIndex === "number") ? opts.systemIndex : 0;
        curcol = 7;
        cam_x = 0;
        cam_y = 0;
        activeFontName = "pico8"; // registerFont()-added fonts persist; only the active choice resets

        // Reset map / flag state for repeat run() calls during development.
        mapDataArr = null; mapWidthN = 0; mapHeightN = 0;
        spriteFlagsArr = new Uint8Array(256);
        spriteDataArr = null; sheetW = 0; sheetH = 0; sprPixelStatus = "pending";
        canvasSpriteDataArr = null; canvasSheetW = 0; canvasSheetH = 0; canvasPixelStatus = "pending";
        drawPal = {}; spritePalt = { 0: true };
        effSpriteCanvas = null; effSpriteCtx = null; effSpriteDirty = true;

        // Frame-rate throttling (0.4.5): defaults to Pico-8's real default of
        // 30fps. Pass opts.fps: 60 for a cart that defines _update60().
        targetFps = (typeof opts.fps === "number" && opts.fps > 0) ? opts.fps : 30;
        tickIntervalMs = 1000 / targetFps;
        nextTickAt = 0;

        // Render-resolution multiplier (0.4.5): 1 = off, matches pre-0.4.5
        // canvas sizing exactly.
        renderScaleN = (typeof opts.scale === "number" && opts.scale > 0) ? opts.scale : 1;

        var sysDef = systems[sys];
        var logicalW = opts.width  || sysDef[3];
        var logicalH = opts.height || sysDef[4];

        canvas = opts.canvas || document.createElement("canvas");
        canvas.width  = logicalW * renderScaleN;
        canvas.height = logicalH * renderScaleN;
        if (!opts.canvas) {
            canvas.style.left = "30px";
            canvas.style.top = "30px";
            canvas.style.position = "absolute";
            document.body.appendChild(canvas);
        }
        screen = canvas.getContext("2d");
        screen.imageSmoothingEnabled = false; // keep sprites crisp when scaled
        if (renderScaleN !== 1) screen.scale(renderScaleN, renderScaleN);

        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup",   keyUpHandler,   false);

        if (opts.globals !== false) picoJS.installGlobals();

        // Debug panel
        debugEnabled = !!opts.debug;
        if (debugEnabled) {
            if (opts.debugElement) {
                debugEl = opts.debugElement;
            } else {
                debugEl = document.createElement("pre");
                debugEl.id = "picojs-debug";
                debugEl.style.cssText = [
                    "position: fixed",
                    "left: 16px",
                    "bottom: 16px",
                    "width: 360px",
                    "max-height: 60vh",
                    "overflow: auto",
                    "margin: 0",
                    "padding: 10px 14px",
                    "background: rgba(0,0,0,0.55)",
                    "border: 1px solid #FFA300",
                    "color: #FFF1E8",
                    "font: 14px ui-monospace, 'SF Mono', Menlo, monospace",
                    "white-space: pre-wrap",
                    "z-index: 9999"
                ].join(";");
                (canvas.parentNode || document.body).appendChild(debugEl);
            }
        }

        // Absorb data map / sprite flags if supplied.
        if (opts.mapData) {
            var norm = normalizeMapData(opts.mapData, opts.mapWidth);
            if (norm) {
                mapDataArr = norm.data;
                mapWidthN  = norm.width;
                mapHeightN = norm.height;
                mapStatus  = "data " + mapWidthN + "x" + mapHeightN;
            }
        }
        if (opts.spriteFlags) {
            for (var i = 0; i < Math.min(opts.spriteFlags.length, 256); i++) {
                spriteFlagsArr[i] = (opts.spriteFlags[i] | 0) & 0xFF;
            }
        }
        // Sprite pixel data supplied directly (0.4.6) — skips the
        // canvas-based extraction in buildSpriteData() entirely, so sget()
        // works even if the spritesheet image can't be read back (tainted
        // canvas under file://, etc.). Checked again below before falling
        // back to the canvas path once the image loads.
        if (opts.spriteData) {
            var sdNorm = normalizeSpriteData(opts.spriteData);
            if (sdNorm) {
                spriteDataArr = sdNorm.data;
                sheetW = sdNorm.width;
                sheetH = sdNorm.height;
                sprPixelStatus = "ok (data) " + sheetW + "x" + sheetH;
            }
        }

        var spriteSrc = opts.sprites
            || (typeof global.picoJS_spriteSrc === "string" && global.picoJS_spriteSrc)
            || "tests/booty-sprites.png";

        // opts.map is only used when mapData isn't supplied. This keeps the
        // 0.4.0 image-map behaviour available for anyone mid-migration.
        var mapSrc = (!mapDataArr)
            ? (opts.map
                || (typeof global.picoJS_mapSrc === "string" && global.picoJS_mapSrc)
                || "tests/booty-demake-map.png")
            : null;

        sprStatus = "loading " + spriteSrc;
        if (mapSrc) mapStatus = "loading " + mapSrc;

        var started = false;
        function startOnce() {
            if (started) return;
            started = true;
            if (typeof opts.init === "function") {
                try { opts.init(); }
                catch (e) { console.error("picoJS: _init threw —", e); }
            }
            requestAnimationFrame(loop);
        }

        function loop() {
            requestAnimationFrame(loop);

            var now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();

            // Frame-rate throttling (0.4.5): rAF fires at the display's own
            // refresh rate (60Hz, 120Hz, ...); only actually run a game tick
            // once every tickIntervalMs. If we've fallen far behind (tab was
            // backgrounded, a GC pause, etc.) resync to now rather than
            // firing a burst of catch-up ticks — Pico-8 drops frames under
            // load, it doesn't fast-forward.
            if (now < nextTickAt) return;
            if (nextTickAt === 0 || now - nextTickAt > tickIntervalMs * 4) {
                nextTickAt = now + tickIntervalMs;
            } else {
                nextTickAt += tickIntervalMs;
            }

            frameCountDbg++;
            fpsFrames++;
            if (!fpsLast) fpsLast = now;
            if (now - fpsLast > 500) {
                fpsValue = Math.round(fpsFrames * 1000 / (now - fpsLast));
                fpsLast = now;
                fpsFrames = 0;
            }
            tickBtnp();
            try {
                if (typeof opts.update === "function") opts.update();
            } catch (e) {
                console.error("picoJS: _update threw —", e);
                picoJS.log("update ERR: " + (e && e.message || e));
            }
            try {
                if (typeof opts.draw === "function") opts.draw();
            } catch (e) {
                console.error("picoJS: _draw threw —", e);
                picoJS.log("draw ERR: " + (e && e.message || e));
            }
            if (debugEnabled) renderDebug();
        }

        sprSheet = new Image();
        sprSheet.onload = function () {
            sprStatus = "ok " + sprSheet.naturalWidth + "x" + sprSheet.naturalHeight;
            buildSpriteData(); // always runs (0.4.7) — feeds sgetc(), backfills sget() if needed
            startOnce();
        };
        sprSheet.onerror = function () {
            sprStatus = "ERROR " + sprSheet.src;
            if (!spriteDataArr) sprPixelStatus = "n/a (load error)";
            canvasPixelStatus = "n/a (load error)";
            console.error("picoJS: spritesheet failed to load — " + sprSheet.src);
            startOnce();
        };
        sprSheet.src = spriteSrc;
        if (sprSheet.complete && sprSheet.naturalWidth > 0) {
            sprStatus = "ok (cached) " + sprSheet.naturalWidth + "x" + sprSheet.naturalHeight;
            buildSpriteData();
            startOnce();
        }

        if (mapSrc) {
            mapImage = new Image();
            mapImage.onload = function () {
                mapStatus = "img ok " + mapImage.naturalWidth + "x" + mapImage.naturalHeight;
            };
            mapImage.onerror = function () {
                mapStatus = "img ERROR " + mapImage.src;
                console.error("picoJS: map image failed to load — " + mapImage.src);
            };
            mapImage.src = mapSrc;
        } else {
            mapImage = null;
        }

        setTimeout(function () {
            if (!started) {
                sprStatus = "timeout — starting anyway";
                console.warn("picoJS: sprsheet load timeout; starting loop without it.");
                startOnce();
            }
        }, 2000);

        return picoJS;
    };

    function renderDebug() {
        if (!debugEl) return;
        var btnGlyphs = ["<", ">", "^", "v", "O", "X"];
        var btnLine = "";
        for (var i = 0; i < 6; i++) {
            btnLine += picoJS.btn(i) ? btnGlyphs[i] : ".";
        }
        var lines = [
            "picoJS " + picoJS.version,
            "frame  " + frameCountDbg + "   fps " + fpsValue + " / target " + targetFps,
            "btn    [" + btnLine + "]  (L R U D O X)",
            "camera " + cam_x + ", " + cam_y,
            "spr    " + sprStatus,
            "sget   " + sprPixelStatus,
            "sgetc  " + canvasPixelStatus,
            "map    " + mapStatus
        ];
        if (picoJS.debugText) {
            lines.push("", String(picoJS.debugText));
        }
        if (debugLines.length) {
            lines.push("", "log:");
            for (var j = 0; j < debugLines.length; j++) {
                lines.push("  " + debugLines[j]);
            }
        }
        debugEl.textContent = lines.join("\n");
    }

    picoJS.log = function (msg) {
        debugLines.push(String(msg));
        if (debugLines.length > 12) debugLines.shift();
    };

    picoJS.debugText = "";

    Object.defineProperty(picoJS, "canvas", { get: function () { return canvas; } });
    Object.defineProperty(picoJS, "ctx",    { get: function () { return screen; } });
    Object.defineProperty(picoJS, "mapWidth",  { get: function () { return mapWidthN; } });
    Object.defineProperty(picoJS, "mapHeight", { get: function () { return mapHeightN; } });
    // True once the spritesheet has been decoded into sget()'s pixel array.
    // False if extraction hasn't run yet OR the canvas turned out to be
    // tainted (e.g. opened via file:// instead of http(s)://) — in that case
    // sget() silently returns 0 for every pixel, so any pixel-collision code
    // will never register a hit. Game code can check this to show its own
    // warning instead of collision just mysteriously not working.
    Object.defineProperty(picoJS, "sgetReady", { get: function () { return !!spriteDataArr; } });
    // True once sgetc()'s canvas-decoded copy is available (0.4.7). Independent
    // of sgetReady — e.g. with opts.spriteData supplied, sgetReady can be true
    // while sgetcReady is false (canvas tainted) or true (canvas readable too).
    Object.defineProperty(picoJS, "sgetcReady", { get: function () { return !!canvasSpriteDataArr; } });
    // True once pal()/palt() can actually affect sprites (0.4.9) — i.e. once
    // spriteDataArr is available, the same precondition sgetReady checks.
    Object.defineProperty(picoJS, "paletteReady", { get: function () { return !!spriteDataArr; } });

    picoJS.installGlobals = function (target) {
        target = target || global;
        [
            "cls", "spr", "sspr", "map",
            "rect", "rectfill", "line",
            "circ", "circfill", "oval", "ovalfill",
            "pset", "pget", "camera",
            "btn", "btnp",
            "colour", "color", "print",
            "mget", "mset", "fget", "fset",
            // Table helpers (0.4.3)
            "add", "del", "deli", "foreach", "all", "count",
            // Math quirks (0.4.3)
            "flr", "sin", "cos", "atan2", "rnd",
            // Sprite pixel data (0.4.4)
            "sget",
            // Canvas-decoded spritesheet read (0.4.7)
            "sgetc",
            // Bitmap fonts (0.4.8)
            "registerFont", "setFont", "fontInfo",
            // Palette (0.4.9)
            "pal", "palt",
            // Math helpers (0.4.10)
            "ceil", "abs", "min", "max", "mid", "sgn",
            "band", "bor", "bxor", "bnot", "shl", "shr", "lshr"
        ].forEach(function (n) { target[n] = picoJS[n]; });
    };

    picoJS.version = "0.4.10";

    global.picoJS = picoJS;
}(typeof window !== "undefined" ? window : this));
