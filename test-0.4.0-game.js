// test-0.4.0-game.js
// Sample game using the 0.4.0 picoJS.run({...}) entry point.
// installGlobals() is called by run() by default, so _init / _update / _draw
// can use the flat Pico-8-like API (cls, spr, btn, rectfill, circ, ...).

var pchar = 6, pstart = 6, pend = 9;
var pflip = false;
var px = 40, py = 40, ps = 1;
var frameCount = 0;
var shots = [];      // rolling list of pset dots for the pget round-trip demo
var scroll = 0;      // camera offset for the map scroll demo

function _init() {
    picoJS.log("init complete");
}

function _update() {
    var moving = false;
    if (btn(0) && px > 0)                         { px -= ps; pflip = true;  moving = true; }
    if (btn(1) && px < picoJS.canvas.width  - 8)  { px += ps; pflip = false; moving = true; }
    if (btn(2) && py > 0)                         { py -= ps;                moving = true; }
    if (btn(3) && py < picoJS.canvas.height - 16) { py += ps;                moving = true; }

    // Z / C = fire a dot at the player. Demonstrates pset + pget round-trip.
    if (btn(4)) {
        shots.push({ x: px + 4, y: py, col: 10 });
        if (shots.length > 64) shots.shift();
    }

    // X / V = pan the camera horizontally. Demonstrates camera() across all draws.
    if (btn(5)) scroll = (scroll + 1) % 64;

    frameCount++;
    if (moving && frameCount % 6 === 0) {
        pchar += 1;
        if (pchar >= pend) pchar = pstart;
    }

    // Feed live state to the debug panel.
    picoJS.debugText =
        "px " + px + "   py " + py + "\n" +
        "pchar " + pchar + "  pflip " + pflip + "\n" +
        "scroll " + scroll + "  shots " + shots.length + "\n" +
        "moving " + moving;
}

function _draw() {
    // Clear to Pico-8 dark-blue to show cls(col) works.
    cls(1);

    // Scrolling camera — everything that uses world-space coords will shift.
    camera(scroll, 0);

    // Underlying map (in world space, so it scrolls with the camera).
    map(0, 0, 0, 0, 16, 16);

    // Decorative sprite from row 1+ — proves Math.floor row-math still good.
    spr(16, 8, 8, 1, 1);

    // Player sprite (world space, scrolls with camera).
    spr(pchar, px, py, 1, 2, pflip);

    // Plot / re-plot any "shots" — they live in world space too.
    for (var i = 0; i < shots.length; i++) {
        pset(shots[i].x, shots[i].y, shots[i].col);
    }

    // --- Screen-space HUD ------------------------------------------------
    // Park the camera at (0, 0) so HUD elements are always pinned.
    camera(0, 0);

    // Top bar background.
    rectfill(0, 0, 127, 7, 0);          // black strip
    rect    (0, 0, 127, 7, 5);          // dark-grey outline

    // Title text.
    print("picoJS 0.4.0", 2, 6, 7);

    // Bottom coordinates strip.
    rectfill(0, 120, 127, 127, 0);
    print("x:" + px + " y:" + py + " cam:" + scroll, 2, 126, 7);

    // Health "bar" using line + rectfill.
    line    (2, 112, 50, 112, 5);
    rectfill(2, 110, 2 + (px % 50), 110, 11); // green bar proportional to px

    // Score halo: circ ring + filled circ.
    circ    (110, 114, 5, 9);
    circfill(110, 114, 2, 10);

    // Oval feature.
    oval    (60, 109, 80, 117, 14);
    ovalfill(85, 110, 95, 116, 8);

    // pget round-trip probe — read the bar colour at (4, 110) and echo it.
    var sampled = pget(4, 110);
    print("pget@(4,110)=" + sampled, 54, 6, 6);
}

// Boot. run() installs globals automatically. debug: true attaches a live
// DOM panel at bottom-left showing frame, fps, btn state, cam, asset load
// status, picoJS.debugText and picoJS.log() lines.
picoJS.run({
    sprites: "tests/booty-sprites.png",
    map:     "tests/booty-demake-map.png",
    debug:   true,
    init:   _init,
    update: _update,
    draw:   _draw
});
