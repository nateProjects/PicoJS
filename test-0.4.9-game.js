// test-0.4.9-game.js
// ==================
// Exercises the 0.4.9 addition: pal(c0, c1, [p]) / palt(c, t).
//
// Sprite 35 of tests/booty-sprites.png uses exactly 3 colours: 0 (background,
// transparent by default), 9 (orange), 10 (yellow) — a small, clear canvas
// for demonstrating both recolouring and transparency. A striped background
// makes "can you see through it" obvious at a glance.
//
//   * X cycles: default -> pal (recolour) -> palt (extra transparency) ->
//     both combined -> back to default.
//   * The bottom-left swatch shows the SAME colour index (9, orange) drawn
//     with rectfill(), proving pal() remaps primitives identically to
//     sprites — not just a sprite-specific hack.

var SPRITE = 35;
var states = ["default", "pal(9,12)", "palt(10,true)", "pal+palt combined"];
var stateIx = 0;

function applyState() {
    pal();  // reset to identity first, each cycle starts clean
    palt(); // reset to default (only 0 transparent)
    var s = states[stateIx];
    if (s === "pal(9,12)" || s === "pal+palt combined") {
        pal(9, 12); // orange -> blue
    }
    if (s === "palt(10,true)" || s === "pal+palt combined") {
        palt(10, true); // yellow also transparent, alongside the default 0
    }
    picoJS.log("state -> " + s);
}

function _init() {
    picoJS.log("picoJS " + picoJS.version);
    picoJS.log("pal()/palt() demo — sprite 35 (colours 0,9,10)");
    applyState();
}

function _update() {
    if (btnp(5)) {
        stateIx = (stateIx + 1) % states.length;
        applyState();
    }
    picoJS.debugText =
        "state: " + states[stateIx] + "\n" +
        "paletteReady: " + picoJS.paletteReady + "\n" +
        "(X to cycle)";
}

function stripes() {
    for (var i = 0; i < 16; i++) {
        rectfill(i * 8, 0, i * 8 + 7, 127, (i % 2 === 0) ? 1 : 2);
    }
}

function _draw() {
    cls();
    stripes();

    print("picoJS 0.4.9 - pal/palt", 2, 2, 7, "system");
    print(states[stateIx], 2, 12, 7, "system");

    // Several copies of the same sprite across the striped background —
    // wherever it's actually transparent, the stripe underneath shows
    // through instead of a solid colour.
    for (var i = 0; i < 8; i++) {
        spr(SPRITE, 8 + i * 14, 40, 2, 2);
    }

    // Primitives proof: rectfill() with colour index 9 (orange) sits right
    // next to a sprite copy — under "pal(9,12)" / "combined", both this
    // swatch AND the sprite's orange pixels turn blue together, proving
    // pal() remaps primitives the same way it remaps sprites.
    print("colour 9: rectfill vs sprite", 2, 80, 7, "system");
    rectfill(2, 90, 17, 105, 9);
    spr(SPRITE, 30, 88, 2, 2);

    rectfill(0, 118, 127, 127, 0);
    print("X cycles state", 2, 120, 6, "system");
}

picoJS.run({
    debug:  true,
    scale:  4,
    init:   _init,
    update: _update,
    draw:   _draw
});
