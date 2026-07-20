// test-0.4.3-game.js
// ==================
// Exercises the 0.4.3 additions:
//
//   * btnp (Pico-8 auto-repeat) — left/right on the menu step one item per
//     press, then auto-repeat kicks in after 15 frames held, then every 4.
//   * Table helpers — add/del/foreach/all/count track live "sparkle"
//     particles, demonstrating safe del() during `for v of all(t)`.
//   * Math quirks — rnd spawns sparkles at random positions with random
//     velocities. sin/cos on a per-particle phase drive a little orbital
//     motion. atan2 aims the arrow at the cursor-like marker.
//
// Minimal rendering: no sprites required. Everything is primitives so the
// demo stands on its own without a spritesheet.

// ---------------------------------------------------------------------------
// Menu — shows btnp auto-repeat timing.
// ---------------------------------------------------------------------------
var menuItems = ["new game", "continue", "options", "credits", "quit"];
var menuIx    = 0;

// ---------------------------------------------------------------------------
// Sparkle particles — exercise table helpers.
// ---------------------------------------------------------------------------
// A sparkle is { x, y, vx, vy, life, phase, col }.
var sparkles = [];

function spawnSparkle(x, y) {
    add(sparkles, {
        x: x, y: y,
        vx: rnd(2) - 1,
        vy: rnd(2) - 1,
        life: 30 + flr(rnd(30)),
        phase: rnd(1),          // 0..1 turn
        col: rnd([8, 9, 10, 11, 12, 14])
    });
}

// ---------------------------------------------------------------------------
// A small marker that drifts in a circle — driven by sin/cos on a turn.
// The arrow points at it using atan2.
// ---------------------------------------------------------------------------
var t = 0;                       // turn counter (0..1 loops)
var markerCx = 64, markerCy = 72, markerR = 20;

// Arrow origin (fixed near bottom-left).
var arrowX = 24, arrowY = 96;

function _init() {
    picoJS.log("picoJS " + picoJS.version);
    picoJS.log("btnp delay=15 period=4");
    // Seed a few sparkles so the list isn't empty at frame 0.
    for (var i = 0; i < 5; i++) spawnSparkle(rnd(128), rnd(64));
}

function _update() {
    // --- menu nav ---
    if (btnp(0) && menuIx > 0)                    menuIx--;
    if (btnp(1) && menuIx < menuItems.length - 1) menuIx++;
    if (btnp(2) && menuIx > 0)                    menuIx--;
    if (btnp(3) && menuIx < menuItems.length - 1) menuIx++;

    // Z spawns a burst of sparkles at the menu row (demonstrates add() +
    // rnd(array) picking a colour).
    if (btnp(4)) {
        for (var i = 0; i < 12; i++) {
            spawnSparkle(64 + rnd(8) - 4, 20 + menuIx * 8 + 4);
        }
        picoJS.log("burst at item " + menuIx + " (total=" + count(sparkles) + ")");
    }

    // --- sparkle update — del during iteration is safe via all() ---
    foreach(all(sparkles), function (s) {
        s.x += s.vx;
        s.y += s.vy;
        s.life--;
        if (s.life <= 0) del(sparkles, s);
    });

    // --- marker orbit (sin/cos in turns, y inverted) ---
    t = (t + 0.005) % 1;   // one full turn every 200 frames

    // Live debug output.
    picoJS.debugText =
        "menu [" + menuItems[menuIx] + "]  ix=" + menuIx + "\n" +
        "sparkles count=" + count(sparkles) + "\n" +
        "t " + t.toFixed(3) + "  sin=" + sin(t).toFixed(2) +
            "  cos=" + cos(t).toFixed(2) + "\n" +
        "atan2(dx,dy) aim -> marker";
}

function _draw() {
    cls(1);

    // --- menu ---
    print("picoJS 0.4.3", 2, 2, 7);
    print("btnp + tables + math", 2, 10, 6);
    for (var i = 0; i < menuItems.length; i++) {
        var y = 20 + i * 8;
        var active = (i === menuIx);
        if (active) rectfill(0, y - 1, 127, y + 6, 2);
        print((active ? ">" : " ") + menuItems[i], 12, y + 5, active ? 10 : 6);
    }

    // --- sparkles ---
    foreach(sparkles, function (s) {
        pset(flr(s.x), flr(s.y), s.col);
    });

    // --- marker orbit ---
    var mx = markerCx + cos(t) * markerR;
    var my = markerCy + sin(t) * markerR;   // sin is flipped; y-down agrees
    circfill(flr(mx), flr(my), 2, 11);

    // --- arrow aiming at marker via atan2 ---
    var dx = mx - arrowX;
    var dy = my - arrowY;
    var ang = atan2(dx, dy);                // turns, east=0, south=0.25
    var tipX = arrowX + cos(ang) * 8;
    var tipY = arrowY + sin(ang) * 8;
    line(flr(arrowX), flr(arrowY), flr(tipX), flr(tipY), 10);
    circfill(flr(arrowX), flr(arrowY), 1, 10);

    // HUD
    rectfill(0, 120, 127, 127, 0);
    print("Z burst  arrows menu", 2, 126, 6);
}

picoJS.run({
    debug:  true,
    sprites: "../tests/booty-sprites.png", // archived in old/ — path adjusted from the root-level default
    map: "../tests/booty-demake-map.png", // ditto — avoids a 404 for the unused default map image
    init:   _init,
    update: _update,
    draw:   _draw
});
