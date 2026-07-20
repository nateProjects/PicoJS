// test-0.4.4-game.js
// ==================
// Exercises the 0.4.4 addition: sget(x, y).
//
// Reproduces the exact technique PicoDiver's pixel_collide() needs: reading
// raw Pico-8 colour indices back off the loaded spritesheet to tell whether
// two sprites' *opaque pixels* actually overlap, not just their bounding
// boxes. Move the player sprite (arrows) over the static target sprite —
// the HUD reports bbox overlap and true pixel collision separately, so you
// can see them disagree near the sprite's transparent corners.

// Any single non-blank 8x8 cell works here — swap SPRITE_ID if your own
// spritesheet differs. Sprite 0 (top-left cell of booty-sprites.png) has
// visible non-black content with transparent corners, which is exactly the
// shape that makes bbox-overlap and pixel-overlap disagree.
var SPRITE_ID = 0;

var player = { x: 20, y: 60 };
var target = { x: 60, y: 60 };

function bboxOverlap(ax, ay, bx, by) {
    return ax < bx + 8 && ax + 8 > bx && ay < by + 8 && ay + 8 > by;
}

// Pixel-perfect collision between two same-size (8x8), non-flipped sprites —
// a same-shape, same-size simplification of PicoDiver's dw817-derived
// pixel_collide(), which handles arbitrary sprite sizes.
function pixelCollide(ax, ay, sa, bx, by, sb) {
    var sax = (sa % 16) * 8, say = Math.floor(sa / 16) * 8;
    var sbx = (sb % 16) * 8, sby = Math.floor(sb / 16) * 8;
    for (var j = 0; j < 8; j++) {
        for (var i = 0; i < 8; i++) {
            var qx = (ax + i) - bx;
            var qy = (ay + j) - by;
            if (qx < 0 || qx >= 8 || qy < 0 || qy >= 8) continue;
            if (sget(sax + i, say + j) > 0 && sget(sbx + qx, sby + qy) > 0) return true;
        }
    }
    return false;
}

function _init() {
    picoJS.log("picoJS " + picoJS.version);
    picoJS.log("sget(x,y) — spritesheet pixel readback");
}

function _update() {
    if (btn(0)) player.x -= 1;
    if (btn(1)) player.x += 1;
    if (btn(2)) player.y -= 1;
    if (btn(3)) player.y += 1;
    player.x = Math.max(0, Math.min(120, player.x));
    player.y = Math.max(0, Math.min(112, player.y));

    var bbox  = bboxOverlap(player.x, player.y, target.x, target.y);
    var pixel = bbox && pixelCollide(player.x, player.y, SPRITE_ID, target.x, target.y, SPRITE_ID);

    picoJS.debugText =
        "player  " + player.x + "," + player.y + "\n" +
        "target  " + target.x + "," + target.y + "\n" +
        "bbox    " + (bbox ? "OVERLAP" : "clear") + "\n" +
        "pixel   " + (pixel ? "HIT" : "clear") + "\n" +
        "sget(0,0)=" + sget(0, 0) + "  sget(4,4)=" + sget(4, 4);
}

function _draw() {
    cls(pixelCollideNow() ? 2 : 1);

    spr(SPRITE_ID, target.x, target.y);
    spr(SPRITE_ID, player.x, player.y);

    if (bboxOverlap(player.x, player.y, target.x, target.y)) {
        rect(
            Math.max(player.x, target.x), Math.max(player.y, target.y),
            Math.min(player.x, target.x) + 7, Math.min(player.y, target.y) + 7,
            10
        );
    }

    rectfill(0, 120, 127, 127, 0);
    print("arrows move  sget demo", 2, 126, 6);
}

function pixelCollideNow() {
    if (!bboxOverlap(player.x, player.y, target.x, target.y)) return false;
    return pixelCollide(player.x, player.y, SPRITE_ID, target.x, target.y, SPRITE_ID);
}

picoJS.run({
    debug:  true,
    init:   _init,
    update: _update,
    draw:   _draw
});
