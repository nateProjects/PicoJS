// picodiver.js
// ============
// Hand-port of picodiver2.p8 (Pico-8 Lua) to JavaScript, running on picoJS
// 0.4.9. Source: /Users/nathan.taylor/Code/Personal/pico-code/PicoDiver/picodiver2.p8
//
// Deliberately NOT ported (per current scope):
//   * sfx(n) — all 5 call sites skipped (score/hit/death cues). Silent.
//   * wait(a) / flip() — dead code in the original (never called), omitted.
//   * collider() — old AABB collision, explicitly marked "not used" in the
//     original source, omitted.
//
// Preserved as-is (probable original bug): the de-dupe pass inside
// gameupdate()'s collision loop calls `del(obj.thing)` in the Lua source —
// note the dot, not a comma — which looks like a typo for `del(obj, thing)`.
// Translated literally (see the comment at that call site) since picoJS's
// del() no-ops gracefully on the resulting undefined rather than throwing,
// matching what was presumably shipped and played.
//
// Table-index convention: `creat` and the per-instance `thing` arrays mirror
// Lua's 1-based indexing on purpose — index 0 is left unused — so every
// numeric field access (thing[1]..thing[9]) matches the original source and
// the field-position comments verbatim. Everything else (cab, oct) uses
// plain object properties, which need no reindexing at all.

// --- init --------------------------------------------------------------

function _init() { // move to gameinit?
    titleinit(); // menu
}

function gameinit() {
    mode = 1;
}

function titleinit() {
    cab = {}; // cabin boy
    cab.sp = 4;
    cab.ini = 5;
    cab.img = 5;
    cab.ani = 2;
    cab.x = 48;
    cab.y = 48;
    cab.w = 2;
    cab.h = 1;
    cab.dr = true;
    cab.mov = false;
    cab.score = 0; // cheat: 20 to win / 1000 in hard mode
    cab.life = 3;
    cab.oxy = 10;

    creat = [
        null, // creat[0] unused — Lua tables are 1-indexed
        [null, 1, 48, 65, 65, 66, 2, 1, 1, false], // 1 fish
        [null, 1, 48, 80, 80, 85, 3, 2, 1, false], // 2 eel
        [null, 1, 48, 96, 96, 104, 3, 3, 2, false], // 3 dolphin/shark
        [null, 1, 48, 105, 105, 108, 2, 2, 2, true], // 4 piranah
        [null, 1, 48, 73, 73, 76, 2, 2, 2, false] // 5 big fish
    ];
    // x, y, sprstr, sprcur, sprend, ani, wid, hi, face
    // 1, 2, 3,        4,        5,         6,   7,    8,  9

    oct = {};
    oct.x = 1;
    oct.t = 11;
    oct[1] = 1;
    oct[2] = 32;
    oct[7] = 1;
    oct[8] = 2;

    obj = [];
    newobj(1); // start with a fish
    backx = 1;
    sx = 1;
    hard = false;
    mode = 0;
    frame = 1;
    level = 1; // cheat: change up to 10
    easy = false; // cheat: infinite lives / no fish stolen
    octspeed = 5;
    bubblelimit = 10;
    fishnum = 45;
}

function _update() { // menu
    if (mode === 0) { // title screen mode
        titleupdate();
    } else if (mode === 9) {
        deathupdate();
    } else if (mode === 6) {
        winupdate();
    } else if (mode === 3) {
        hardupdate();
    } else {
        gameupdate();
    }
}

function titleupdate() {} // menu
function deathupdate() {}
function hardupdate() {}
function winupdate() {}

function _draw() { // menu
    if (mode === 0) { // title screen mode
        titledraw();
    } else if (mode === 9) {
        deathdraw();
    } else if (mode === 6) {
        windraw();
    } else if (mode === 3) {
        harddraw();
    } else {
        gamedraw();
    }
}

function back() {
    cls();
    map(0, 4, 0, 32, 16, 12);
    shipshow();
}

function titledraw() {
    back();
    color(7);
    centre_print("pico-diver", 2);
    color(10);
    centre_print("catch 20 goldfish to win", 36);
    centre_print("but don't run out of air", 52);
    centre_print("or collide with the big fish", 68);

    // Not part of the original Lua: pixel-perfect collision (sget) silently
    // returns 0 for everything if the canvas turned out tainted, which
    // happens when this page is opened via file:// instead of http(s)://.
    // Without this warning that looks exactly like "you can never catch a
    // fish", with nothing pointing at the actual cause.
    if (!picoJS.sgetReady) {
        color(8);
        centre_print("no collision: serve via http", 76);
    }

    color(8);
    centre_print("press x for easy mode", 84);
    if (btn(5)) {
        gameinit();
    }
    centre_print("press z for arcade mode", 92);
    if (btnp(4)) {
        mode = 3;
        harddraw();
    }
    color(7);
    centre_print("nct 2018 / jfc 1984", 108);
}

function harddraw() {
    back();
    color(7);
    centre_print("arcade mode", 2);
    color(10);
    centre_print("10 levels - each one faster", 36);
    centre_print("grey sharks kill", 52);
    centre_print("oxygen is reduced over time", 68);
    centre_print("try for a perfect score", 84);
    color(8);
    centre_print("press x to begin", 108);
    color(7);
    hard = true;
    if (btnp(5)) {
        gameinit();
    }
}

function gamedraw() {
    back();
    // score
    color(0);
    print("fish " + cab.score, 1, 121);
    if (hard === true) {
        if (level < 10) {
            print("level " + level, 100, 121);
        } else {
            print("level " + level, 96, 121);
        }
    }
    for (var l = 1; l <= cab.oxy; l++) { // oxygen
        spr(51, 0 + (l * 8) - 8, 0);
    }
    for (l = 1; l <= cab.life; l++) { // lives
        spr(32, 128 - (l * 8), 0); // was 96+
    }
    octshow();
    fishshow();
    cabshow();
    // fish and creatures appear randomly

    if (frame % fishnum === 0) { // was 45
        newobj(1); // small fish
    }
    if (frame % 60 === 0) {
        newobj(2 + flr(rnd(4))); // big fish
    }

    // if hard mode turn dolphin to shark
    if (hard === true) {
        pal(12, 6);
        // NOTE: preserved from the original Lua — there's no matching
        // pal(12,12) reset anywhere (titleinit()/windraw()/deathdraw() reset
        // `hard` but never the palette), so once hard mode has been entered
        // once, the dolphin stays grey even in a later easy-mode game. Ported
        // literally rather than silently added a reset the original didn't have.
    }
}

function windraw() {
    back();
    color(7);
    centre_print("you win", 2);
    color(10);
    centre_print("a perfect score!", 40);
    if (level === 11) {
        centre_print("1000 points, 200 fish", 60);
    } else {
        centre_print("100 points, 20 fish", 60);
    }
    color(8);
    centre_print("press x to restart", 88);
    if (btnp(5)) {
        titleinit();
    }
    centre_print("press z for hard mode", 96);
    if (btnp(4)) {
        mode = 3;
        harddraw();
    }
    color(7);
    hard = false;
}

function deathdraw() {
    back();
    color(7);
    centre_print("game over", 2);
    color(10);

    centre_print("your score was " + (cab.score * 5), 36);
    centre_print("you collected " + cab.score + " fish", 52);
    centre_print("you lost " + (3 - cab.life) + " lives", 68);
    if (hard === true) {
        centre_print("you reached level " + level, 84);
    }
    color(8);
    centre_print("press x to begin", 92);
    if (btnp(5)) {
        titleinit();
    }
    centre_print("press z for hard mode", 104);
    if (btnp(4)) {
        mode = 3;
        harddraw();
    }
    color(7);
    hard = false;
}

function centre_print(strtxt, py) { print(strtxt, 64 - (strtxt.length * 2), py); }

function gameupdate() {
    cab.mov = false;
    if (btn(0)) { // left
        cab.dr = false;
        cab.x -= 1;
        if (cab.x < 8) cab.x = 8; // if try to go too far left stop
        cabmove();
    }
    if (btn(1)) { // right
        cab.dr = true;
        cab.x += 1;
        if (cab.x > 108) cab.x = 108; // if try to go too far right stop
        cabmove();
    }
    if (btn(2)) { // up
        cab.y -= 1;
        if (cab.y < 32) cab.y = 32; // if try to go too far left stop
        cabmove();
    }
    if (btn(3)) { // down
        cab.y += 1;
        if (cab.y > 108) cab.y = 108; // if try to go too far right stop
        cabmove();
    }

    // collision with squid (pixel collision)
    if (pixel_collider_oct(cab, oct)) {
        if (frame % 20 === 0) {
            if (cab.score > 0 && easy === false) {
                cab.score -= 1;
                // sfx(0) skipped — audio not ported yet
            }
        }
    }

    // collision with fish/creature (pixel collision)
    for (var thing of all(obj)) {
        if (pixel_collider_obj(cab, thing)) {
            // score - if hits fish
            if (thing[3] <= 66) {
                cab.score += 1;
                // sfx(2) skipped — audio not ported yet
            }

            // if hits creature
            if (thing[3] >= 67) {
                if (cab.score >= 1 && easy === false) {
                    cab.score -= 1;
                    // sfx(0) skipped — audio not ported yet
                }
                // if a shark it kills!
                if (hard === true && (thing[3] < 105 && thing[3] > 95) && easy === false) {
                    cab.life -= 1;
                    // sfx(1) skipped — audio not ported yet
                }
            }

            del(obj, thing);
        }
        // remove from table if leaves screen
        if (thing[1] >= 128) {
            del(obj, thing);
        }

        // remove any overlapping
        for (var l = 0; l < obj.length; l++) {
            if (!(thing[4] === obj[l][4])) {
                if (thing[1] === obj[l][1]) {
                    del(obj.thing); // NOTE: preserved from the original Lua
                    // (`del(obj.thing)`, a dot not a comma — looks like a
                    // typo for `del(obj, thing)`). obj.thing is undefined,
                    // and picoJS's del() no-ops on that rather than
                    // throwing, so behaviour matches whatever the original
                    // cart actually did.
                }
            }
        }
    }

    // creature animation
    if (frame % 10 === 0) {
        for (var n = 0; n < obj.length; n++) {
            obj[n][4] += obj[n][7]; // what does this do?
            // obj[n][4] += 1
            if (obj[n][4] > obj[n][5]) { // current sprite > end sprite
                obj[n][4] = obj[n][3]; // current sprite = start sprite
            }
        }
    }

    if (frame % octspeed === 0) {
        octmove();
    }

    // hard level variable changes

    if (level >= 9) {
        octspeed = 1;
        bubblelimit = 6;
        fishnum = 65;
    } else if (level >= 7) {
        octspeed = 2;
        bubblelimit = 7;
        fishnum = 60;
    } else if (level >= 5) {
        octspeed = 3;
        bubblelimit = 8;
        fishnum = 55;
    } else if (level >= 3) {
        octspeed = 4;
        bubblelimit = 9;
        fishnum = 50;
    } else if (level >= 1) {
        octspeed = 5;
        bubblelimit = 10;
        fishnum = 45;
    }

    // win / lose
    if (cab.life === 0) mode = 9;

    // win with 20 fishes or reach next level if hard mode

    if (cab.score === 20) {
        if (hard === false) mode = 6;
        // advance to next level (hard mode)
        if (hard === true) {
            if (level < 11) {
                level += 1;
                cab.score = 0;
            }
            // complete hard mode
            if (level === 11) {
                mode = 6;
            }
        }
    }

    // oxygen
    if (cab.y === 32) {
        if (cab.oxy < bubblelimit) {
            if (frame % 20 === 1) cab.oxy += 1;
        }
    }
    if (cab.y > 32) {
        if (frame % 30 === 1) cab.oxy -= 1;
        if (cab.oxy === 0 && cab.life > 0 && easy === false) {
            cab.oxy = bubblelimit; // was 10
            cab.life -= 1;
            // sfx(1) skipped — audio not ported yet
        }
    }

    frame += 1;
}

function cabmove() {
    cab.mov = true;
    cab.img += 1;
    if (cab.img > cab.ini + cab.ani) {
        cab.img = cab.ini;
    }
}

function newobj(type) {
    var thing = [];
    thing[1] = 1; // x
    thing[2] = 48 + flr(rnd(56)); // y
    for (var l = 3; l <= 9; l++) {
        thing[l] = creat[type][l];
    }
    add(obj, thing);
}

function cabshow() {
    // cabin boy
    spr(cab.img, cab.x, cab.y, 1, cab.h, cab.dr);
    // if facing left
    if (cab.dr === true) {
        spr(cab.sp, cab.x + 8, cab.y, 1, cab.h, cab.dr);
    } else { // facing right
        spr(cab.sp, cab.x - 8, cab.y, 1, cab.h, cab.dr);
    }
}

function fishshow() {
    for (var n = 0; n < obj.length; n++) {
        objmove(n);
        spr(obj[n][4], obj[n][1], obj[n][2], obj[n][7], obj[n][8], obj[n][9]);
    }
}

function objmove(n) {
    // make objects move around the screen
    obj[n][1] += 1; // x += 1 (right)
    // add detection for going off screen and removing
}

function octshow() {
    spr(11, oct.x, 32);
    spr(oct.t, oct.x, 32 + 8);
}

function octmove() {
    if (oct.x < 128) {
        oct.x += 1;
    } else {
        oct.x = 1;
    }
    if (oct.t === 14) {
        oct.t = 12;
    } else {
        oct.t += 1;
    }
    oct[1] = oct.x;
}

function shipshow() {
    pal(2, 12); // "don't ask -)"
    map(0, 0, sx, 0, 16, 4);
    if (frame % 30 === 1) {
        sx += 1;
    }
    if (sx >= 128) {
        sx = 1;
    }
    map(0, 0, sx - 128, 0, 16, 4);
}

// --- pixel collision functions ------------------------------------------
// based on dw817's pixel collision method

// pixel collision for cabin boy vs octopus
function pixel_collider_oct(cab_obj, oct_obj) {
    // get cabin boy sprite info
    var coords = get_cab_sprite_coords(cab_obj);
    var cab_sprite_x = coords[0], cab_sprite_y = coords[1];
    var cab_w = 16, cab_h = 8; // cabin boy is 2x1 sprites (16x8 pixels)

    // get octopus sprite info (octopus is 2 sprites stacked)
    var oct_sprite_x = (11 % 16) * 8, oct_sprite_y = flr(11 / 16) * 8; // sprite 11
    var oct_w = 8, oct_h = 16; // octopus is 1x2 sprites (8x16 pixels)

    return pixel_collide(
        cab_sprite_x, cab_sprite_y, cab_w, cab_h, cab_obj.x, cab_obj.y,
        oct_sprite_x, oct_sprite_y, oct_w, oct_h, oct_obj.x, oct_obj[2]
    );
}

// pixel collision for cabin boy vs fish/creatures
function pixel_collider_obj(cab_obj, obj_thing) {
    // get cabin boy sprite info
    var coords = get_cab_sprite_coords(cab_obj);
    var cab_sprite_x = coords[0], cab_sprite_y = coords[1];
    var cab_w = 16, cab_h = 8; // cabin boy is 2x1 sprites

    // get object sprite info
    var obj_sprite_num = obj_thing[4]; // current sprite
    var obj_sprite_x = (obj_sprite_num % 16) * 8;
    var obj_sprite_y = flr(obj_sprite_num / 16) * 8;
    var obj_w = obj_thing[7] * 8; // width in pixels
    var obj_h = obj_thing[8] * 8; // height in pixels

    return pixel_collide(
        cab_sprite_x, cab_sprite_y, cab_w, cab_h, cab_obj.x, cab_obj.y,
        obj_sprite_x, obj_sprite_y, obj_w, obj_h, obj_thing[1], obj_thing[2]
    );
}

// helper function to get cabin boy sprite coordinates
function get_cab_sprite_coords(cab_obj) {
    var sprite_num = cab_obj.img;
    var sprite_x = (sprite_num % 16) * 8;
    var sprite_y = flr(sprite_num / 16) * 8;
    return [sprite_x, sprite_y];
}

// main pixel collision function
// adapted from dw817's collision routine
function pixel_collide(sh1, sv1, sx1, sy1, ph1, pv1, sh2, sv2, sx2, sy2, ph2, pv2) {
    var x, y;

    // optimize by checking smaller sprite against larger one
    if (sx1 * sy1 > sx2 * sy2) {
        var tmp = [sh2, sv2, sx2, sy2, ph2, pv2, sh1, sv1, sx1, sy1, ph1, pv1];
        sh1 = tmp[0]; sv1 = tmp[1]; sx1 = tmp[2]; sy1 = tmp[3]; ph1 = tmp[4]; pv1 = tmp[5];
        sh2 = tmp[6]; sv2 = tmp[7]; sx2 = tmp[8]; sy2 = tmp[9]; ph2 = tmp[10]; pv2 = tmp[11];
    }

    // check each pixel of the smaller sprite
    for (var i = 0; i <= sy1 - 1; i++) {
        for (var j = 0; j <= sx1 - 1; j++) {
            x = j + ph1 - ph2;
            y = i + pv1 - pv2;

            // check if pixel is within bounds and both pixels are non-transparent
            if (x >= 0 && x < sx2 && y >= 0 && y < sy2 &&
                sget(sh1 + j, sv1 + i) > 0 && sget(sh2 + x, sv2 + y) > 0) {
                return true;
            }
        }
    }

    return false;
}

// --- boot ----------------------------------------------------------------

picoJS.run({
    sprites:     "sprites.png",
    mapData:     mapData,
    spriteFlags: spriteFlags,
    spriteData:  spriteData, // feeds sget() directly — works even via file://
    fps:    30, // matches this cart's _update() (not _update60())
    scale:  4,  // render at native higher resolution instead of CSS-upscaling
    init:   _init,
    update: _update,
    draw:   _draw
});
