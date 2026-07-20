// test-0.4.8-game.js
// ==================
// Exercises the 0.4.8 addition: bitmap fonts for print().
//
//   * Default rendering now uses the real PICO-8 4x6 pixel font instead of
//     the canvas's anti-aliased system font.
//   * print(..., "system") opts back into the old canvas-font rendering,
//     for comparison / anything outside printable ASCII.
//   * picoJS.registerFont() + picoJS.setFont() add and switch to additional
//     bitmap fonts. This demo registers "big", an 8x8 custom font (proving
//     the mechanism isn't hardcoded to the built-in font's 4x6 cell size),
//     covering just enough characters to spell "BIG FONT".
//
// No spritesheet needed — everything here is text + primitives.

// ---------------------------------------------------------------------------
// A small custom 8x8 font, covering only the characters needed to spell
// "BIG FONT" — proves picoJS.registerFont() works with a cell size other
// than the built-in font's 4x6, and that unused codes in the covered range
// safely fall back to blank glyphs.
// ---------------------------------------------------------------------------
var BIG_GLYPHS = {
    " ": ["00", "00", "00", "00", "00", "00", "00", "00"],
    "B": ["f8", "cc", "cc", "f8", "cc", "cc", "f8", "00"],
    "I": ["78", "30", "30", "30", "30", "30", "78", "00"],
    "G": ["7c", "c0", "c0", "ce", "c6", "c6", "7c", "00"],
    "F": ["fe", "c0", "c0", "fc", "c0", "c0", "c0", "00"],
    "O": ["7c", "c6", "c6", "c6", "c6", "c6", "7c", "00"],
    "N": ["c6", "e6", "f6", "de", "ce", "c6", "c6", "00"],
    "T": ["fe", "30", "30", "30", "30", "30", "30", "00"]
};

function buildFontHex(glyphMap, cellH, firstCode, lastCode) {
    var blankRow = "00";
    var out = "";
    for (var c = firstCode; c <= lastCode; c++) {
        var rows = glyphMap[String.fromCharCode(c)];
        for (var r = 0; r < cellH; r++) {
            out += (rows && rows[r] !== undefined) ? rows[r] : blankRow;
        }
    }
    return out;
}

var fontCycle = ["pico8", "system", "big"];
var fontIx = 0;

function _init() {
    picoJS.registerFont("big", {
        cellW: 8,
        cellH: 8,
        firstCode: 32,   // space
        glyphs: buildFontHex(BIG_GLYPHS, 8, 32, 84) // covers space (32) through 'T' (84)
    });
    picoJS.log("picoJS " + picoJS.version);
    picoJS.log("registerFont(\"big\") — 8x8 custom font");
}

function _update() {
    if (btnp(5)) { // X — cycle the active default font
        fontIx = (fontIx + 1) % fontCycle.length;
        picoJS.setFont(fontCycle[fontIx] === "system" ? "pico8" : fontCycle[fontIx]);
        // (setFont only accepts registered bitmap fonts; "system" is handled
        // per-call below via the explicit font argument instead.)
        picoJS.log("cycled to: " + fontCycle[fontIx]);
    }
    picoJS.debugText = "active default: " + fontCycle[fontIx] + "  (X to cycle)";
}

function _draw() {
    cls(1);
    print("picoJS 0.4.8 - bitmap fonts", 2, 2, 7, "system"); // header, always system font

    // --- the default font, whatever picoJS.setFont() last selected ---
    // (falls back to per-call "system" override below when the cycle is
    // sitting on "system", since setFont() only switches bitmap fonts. The
    // sample string switches to "BIG FONT" for the "big" state, since that
    // custom font only covers the handful of characters needed to spell it —
    // the full "Hello, Pico-8!..." string would render blank, correctly
    // falling back per unmapped character, but that's a confusing thing to
    // stare at in a demo.)
    var label = "default (" + fontCycle[fontIx] + "):";
    print(label, 2, 16, 6, "system");
    var sample = (fontCycle[fontIx] === "big") ? "BIG FONT" : "Hello, Pico-8! 0123456789 !?.";
    if (fontCycle[fontIx] === "system") {
        print(sample, 2, 26, 10, "system");
    } else {
        print(sample, 2, 26, 10); // no 5th arg -> active default
    }

    // --- explicit per-call overrides, always rendered the same regardless
    // --- of the active default (proves the 5th-arg override coexists with
    // --- picoJS.setFont()) ---
    print("always pico8:", 2, 40, 6, "system");
    print("Hello, Pico-8! 0123456789 !?.", 2, 50, 11, "pico8");

    print("always system:", 2, 62, 6, "system");
    print("Hello, Pico-8! 0123456789 !?.", 2, 72, 12, "system");

    print("always big (8x8 custom):", 2, 86, 6, "system");
    print("BIG FONT", 2, 96, 14, "big");

    rectfill(0, 120, 127, 127, 0);
    print("X cycles default font", 2, 126, 6, "system");
}

picoJS.run({
    debug:  true,
    scale:  4, // render at native higher resolution — no CSS transform needed
               // (CSS transform: scale() + image-rendering: pixelated is an
               // inconsistent combination across browsers; this sidesteps it)
    init:   _init,
    update: _update,
    draw:   _draw
});
