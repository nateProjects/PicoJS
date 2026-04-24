// test-0.4.2-game.js
// ==================
// Same player mechanics as the 0.4.1 demo (walls block, coins pick up, Z
// stamps, X layer-filter) but the map + flags come from a converted .p8:
//
//   tests/sample.p8 --[ tools/p8-to-js.js ]--> tests/sample-mapdata.js
//
// The generated file sets `var mapData` / `var spriteFlags` as globals when
// loaded via <script>, which is exactly what we hand to picoJS.run().

var pchar = 6, pstart = 6, pend = 9;
var pflip = false;
var px = 16, py = 24, ps = 1;
var frameCount = 0;
var score = 0;
var zHeld = false;
var lastStampTile = null;

function solidTile(tx, ty) { return fget(mget(tx, ty), 0); }
function canMoveTo(nx, ny) {
    var headX = Math.floor((nx + 4) / 8);
    var headY = Math.floor((ny + 4) / 8);
    var feetX = Math.floor((nx + 4) / 8);
    var feetY = Math.floor((ny + 12) / 8);
    return !solidTile(headX, headY) && !solidTile(feetX, feetY);
}

function _init() {
    picoJS.log("picoJS " + picoJS.version);
    picoJS.log("map " + picoJS.mapWidth + "x" + picoJS.mapHeight + " (from sample.p8)");
    picoJS.log("flags: wall=0x" + fget(1).toString(16) +
               " coin=0x" + fget(2).toString(16));
}

function _update() {
    var moving = false;
    if (btn(0)) { var nx = px - ps;  if (nx >= 0 && canMoveTo(nx, py)) { px = nx; pflip = true;  moving = true; } }
    if (btn(1)) { var nx2 = px + ps; if (nx2 <= picoJS.canvas.width  - 8  && canMoveTo(nx2, py)) { px = nx2; pflip = false; moving = true; } }
    if (btn(2)) { var ny = py - ps;  if (ny >= 0 && canMoveTo(px, ny)) { py = ny; moving = true; } }
    if (btn(3)) { var ny2 = py + ps; if (ny2 <= picoJS.canvas.height - 16 && canMoveTo(px, ny2)) { py = ny2; moving = true; } }

    var footX = Math.floor((px + 4) / 8);
    var footY = Math.floor((py + 12) / 8);
    if (fget(mget(footX, footY), 1)) {
        mset(footX, footY, 0);
        score++;
        picoJS.log("picked up (" + footX + "," + footY + ") score=" + score);
    }

    if (btn(4) && !zHeld) {
        zHeld = true;
        mset(footX, footY, 2);
        lastStampTile = footX + "," + footY;
        picoJS.log("stamp coin at " + lastStampTile);
    }
    if (!btn(4)) zHeld = false;

    frameCount++;
    if (moving && frameCount % 6 === 0) {
        pchar += 1;
        if (pchar >= pend) pchar = pstart;
    }

    var n = mget(footX, footY);
    picoJS.debugText =
        "source   sample.p8 -> sample-mapdata.js\n" +
        "px " + px + "   py " + py + "\n" +
        "tile " + footX + "," + footY + "  n=" + n +
            "  flags=0x" + fget(n).toString(16) + "\n" +
        "  solid=" + fget(n, 0) + "  coin=" + fget(n, 1) + "\n" +
        "score " + score + "   layer " + (btn(5) ? "walls-only" : "all") + "\n" +
        "last stamp " + (lastStampTile || "-");
}

function _draw() {
    cls(1);
    if (btn(5)) map(0, 0, 0, 0, 16, 16, 1);
    else        map(0, 0, 0, 0, 16, 16);
    spr(pchar, px, py, 1, 2, pflip);
    rectfill(0, 0, 127, 7, 0);
    print("picoJS 0.4.2", 2, 6, 7);
    print("score " + score, 90, 6, 10);
}

// `mapData` and `spriteFlags` are defined as globals by sample-mapdata.js
// (which is loaded via <script> before this file). Hand them straight to run().
picoJS.run({
    sprites:     "tests/booty-sprites.png",
    mapData:     mapData,
    spriteFlags: spriteFlags,
    debug:       true,
    init:   _init,
    update: _update,
    draw:   _draw
});
