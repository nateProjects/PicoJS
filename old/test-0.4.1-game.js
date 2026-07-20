// test-0.4.1-game.js
// ==================
// Demonstrates the 0.4.1 additions:
//   * Data-array map (no map PNG loaded)
//   * mget / mset round-trip — Z stamps a coin at the current tile
//   * fget-backed collision — bit 0 = solid, player bounces off walls
//   * fget-backed pickup — bit 1 = collectible, score bumps and tile clears
//   * map() layer filter — hold X to pass mlayer=1, wall-only render

// 16x16 tile map. Sprite indices:
//   0 = empty (transparent in map)
//   1 = wall         (flag bit 0 set — solid)
//   2 = coin/pickup  (flag bit 1 set — collectible)
var demoMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,2,2,0,0,0,0,0,0,0,0,2,2,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,2,2,0,0,0,0,0,0,0,0,2,2,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Flag byte per sprite number. Index = sprite #, value = flag byte.
// Only the low indices we use here need values — the rest default to 0.
// bit 0 (0x01) = solid
// bit 1 (0x02) = collectible
var demoFlags = [];
demoFlags[0] = 0x00; // empty
demoFlags[1] = 0x01; // wall -> solid
demoFlags[2] = 0x02; // coin -> collectible

// --- Player + game state ---------------------------------------------------
var pchar = 6, pstart = 6, pend = 9;
var pflip = false;
var px = 16, py = 24, ps = 1;    // start inside the room on a clear tile
var frameCount = 0;
var score = 0;
var zHeld = false;               // edge-detect for single-press mset stamp
var lastStampTile = null;        // diagnostic

// Collision helper — a tile is solid iff fget(sprite, 0).
function solidTile(tx, ty) {
    return fget(mget(tx, ty), 0);
}

// The player sprite is 8px wide, 16px tall. We check two points: the middle
// of the head region and the middle of the feet region. A move is allowed
// only if both are non-solid.
function canMoveTo(nx, ny) {
    var headX = Math.floor((nx + 4) / 8);
    var headY = Math.floor((ny + 4) / 8);
    var feetX = Math.floor((nx + 4) / 8);
    var feetY = Math.floor((ny + 12) / 8);
    return !solidTile(headX, headY) && !solidTile(feetX, feetY);
}

function _init() {
    picoJS.log("map " + picoJS.mapWidth + "x" + picoJS.mapHeight);
    picoJS.log("flags: wall=0x" + fget(1).toString(16) +
               " coin=0x" + fget(2).toString(16));
}

function _update() {
    var moving = false;

    if (btn(0)) {
        var nx = px - ps;
        if (nx >= 0 && canMoveTo(nx, py)) { px = nx; pflip = true; moving = true; }
    }
    if (btn(1)) {
        var nx2 = px + ps;
        if (nx2 <= picoJS.canvas.width - 8 && canMoveTo(nx2, py)) { px = nx2; pflip = false; moving = true; }
    }
    if (btn(2)) {
        var ny = py - ps;
        if (ny >= 0 && canMoveTo(px, ny)) { py = ny; moving = true; }
    }
    if (btn(3)) {
        var ny2 = py + ps;
        if (ny2 <= picoJS.canvas.height - 16 && canMoveTo(px, ny2)) { py = ny2; moving = true; }
    }

    // Pickup — any tile the player's body overlaps that has flag bit 1 set
    // gets cleared, score goes up.
    var footX = Math.floor((px + 4) / 8);
    var footY = Math.floor((py + 12) / 8);
    if (fget(mget(footX, footY), 1)) {
        mset(footX, footY, 0);
        score++;
        picoJS.log("picked up (" + footX + "," + footY + ") score=" + score);
    }

    // Z = stamp a coin at the player's current tile (mset demo). Edge-
    // detected so one press = one stamp (btnp is a 0.4.3 item).
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

    // Live state in the debug panel.
    var currentN = mget(footX, footY);
    picoJS.debugText =
        "px " + px + "   py " + py + "\n" +
        "tile " + footX + "," + footY + " -> n=" + currentN +
            " flags=0x" + fget(currentN).toString(16) + "\n" +
        "  solid=" + fget(currentN, 0) + "  coin=" + fget(currentN, 1) + "\n" +
        "score " + score + "   layer " + (btn(5) ? "walls-only (mlayer=1)" : "all") + "\n" +
        "last stamp " + (lastStampTile || "-");
}

function _draw() {
    cls(1); // Pico-8 dark-blue background

    // Data-array map render. Hold X to pass mlayer=1 (only tiles whose flag
    // byte has bit 0 set — i.e. the walls — draw).
    if (btn(5)) map(0, 0, 0, 0, 16, 16, 1);
    else        map(0, 0, 0, 0, 16, 16);

    // Player sprite on top.
    spr(pchar, px, py, 1, 2, pflip);

    // HUD
    rectfill(0, 0, 127, 7, 0);
    print("picoJS 0.4.1", 2, 6, 7);
    print("score " + score, 90, 6, 10);
}

picoJS.run({
    sprites:      "../tests/booty-sprites.png",
    mapData:      demoMap,
    spriteFlags:  demoFlags,
    debug:        true,
    init:   _init,
    update: _update,
    draw:   _draw
});
