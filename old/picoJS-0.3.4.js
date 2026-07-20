// 0.3.4 - Bug-fix pass over 0.3.3:
//   * Fixed silent-comma bug in ZX Spectrum palette (was corrupting entries 8+)
//   * Corrected "bright-ed" -> "bright-red" and gave bright-* entries indices 9..15
//   * Moved colour state (sys, curcol, colours, systems) out of _init() scope
//     so colour() / color() actually work
//   * Wrapped flip transforms in save()/restore() so sspr() no longer leaves the
//     canvas permanently mirrored
//   * Fixed the left/right key-label swap in keyDownHandler
//   * btn() now reads the per-direction booleans so multiple keys can be held
//     at once (diagonal movement works)
//   * Declared locals in spr() to stop leaking globals
//   * Restored the map image path to its own asset (no longer aliasing the
//     spritesheet as the map)

window.onload = function () {
    // ignore this part if you want to focus on game coding
    // it sets up the canvas & key detection in the browser
    var canvas = document.createElement("canvas");
    var screen = canvas.getContext("2d");
    canvas.width = 128;
    canvas.height = 128;
    canvas.style.left = "30px";
    canvas.style.top = "30px";
    canvas.style.position = "absolute";
    document.body.appendChild(canvas);

    // Input state
    var keyPressedNum = 7; // default non-key, always returns false (kept for compatibility)
    var keyPressedLeft = false;
    var keyPressedRight = false;
    var keyPressedUp = false;
    var keyPressedDown = false;

    // System / colour state — must live in the outer closure so colour()
    // can read it. Previously these were declared inside _init() and
    // colour() threw ReferenceError on first call.
    var systems = [
        [0, 0, "Pico-8", 128, 128], // #,colours,name,w,h
        [1, 1, "Pico-8 Alt", 64, 64],
        [2, 3, "ZX Spectrum", 256, 192] // will actually be system 10
    ];
    var sys = 0;
    var w = 128;
    var h = 128;
    var curcol = 0;
    var colours = [];

    var mapgrid = 16; // may potentially be larger, maybe expand later for different x & y
    var sprsize = 8; // currently 8-bit, adapt for potential 16 bit etc.

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    // Asset paths — override before window.onload by setting
    // window.picoJS_spriteSrc / window.picoJS_mapSrc if you need different ones.
    var img = new Image();
    img.src = (typeof window !== "undefined" && window.picoJS_spriteSrc) || '../tests/booty-sprites.png';
    img.onerror = function () { console.error(img.src + ' failed to load.'); };

    var maps = new Image();
    maps.src = (typeof window !== "undefined" && window.picoJS_mapSrc) || '../tests/booty-demake-map.png';
    maps.onerror = function () { console.error(maps.src + ' failed to load.'); };

// Regular Pico-8-like code starts here

var pchar = 6;
var pstart = 6;
var pflip = false;
var pend = 9;
var px = 40;        // player x
var py = 40;        // player y
var ps = 1;         // player speed
var frameCount = 0; // used to slow the walk-cycle down

function _draw() {
    cls();
    map(0, 0, 0, 0, 16, 16);
    // Decorative sprite from row 1+ of the spritesheet — exercises the
    // Math.floor fix in spr(). n >= 16 would have rendered at the wrong
    // y-offset under the old Math.round(n/16) - 8 formula.
    spr(16, 8, 8, 1, 1);
    // Player sprite with flip and walk-cycle
    spr(pchar, px, py, 1, 2, pflip);
    // Text via print() — exercises colour() (now that its state is in
    // the right scope) and confirms the font colour lookup works.
    print("x:" + px + " y:" + py, 2, canvas.height - 2, 7);
}

function _update() {
    var moving = false;
    if (btn(0) && px > 0) {                       // left
        px -= ps; pflip = true; moving = true;
    }
    if (btn(1) && px < canvas.width - 8) {        // right
        px += ps; pflip = false; moving = true;
    }
    if (btn(2) && py > 0) {                       // up
        py -= ps; moving = true;
    }
    if (btn(3) && py < canvas.height - 16) {      // down
        py += ps; moving = true;
    }
    // Advance the walk-cycle every 6 frames while moving, so diagonal
    // movement (btn(0) + btn(2) etc.) doesn't flicker the animation.
    frameCount++;
    if (moving && frameCount % 6 === 0) move();
}

function move() {
    pchar += 1;
    if (pchar >= pend) { pchar = pstart; }
}

// Regular Pico-8-like code ends here
// More System & Keyboard setup follows

    function _init() {
        systems = [
            [0, 0, "Pico-8", 128, 128],
            [1, 1, "Pico-8 Alt", 64, 64],
            [2, 3, "ZX Spectrum", 256, 192]
        ];
        sys = 0;
        w = systems[sys][3];
        h = systems[sys][4];
        curcol = systems[sys][0];

        colours = [
            [
                [0, 0, "#000000", "black"], // Pico default colours
                [0, 1, "#1D2B53", "dark-blue"],
                [0, 2, "#7E2553", "dark-purple"],
                [0, 3, "#008751", "dark-green"],
                [0, 4, "#AB5236", "brown"],
                [0, 5, "#5F574F", "dark-grey"],
                [0, 6, "#C2C3C7", "light-grey"],
                [0, 7, "#FFF1E8", "white"],
                [0, 8, "#FF004D", "red"],
                [0, 9, "#FFA300", "orange"],
                [0, 10, "#FFEC27", "yellow"],
                [0, 11, "#00E436", "green"],
                [0, 12, "#29ADFF", "blue"],
                [0, 13, "#83769C", "lavender"],
                [0, 14, "#FF77A8", "pink"],
                [0, 15, "#FFCCAA", "light-peach"]
            ],
            [
                [1, 128, "#291814", "brownish-black"], // Pico Alt Colours
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
                [10, 0,  "#000000", "black"],        // ZX Spectrum
                [10, 1,  "#0000FF", "blue"],
                [10, 2,  "#FF0000", "red"],
                [10, 3,  "#FF00FF", "magenta"],
                [10, 4,  "#00FF00", "green"],
                [10, 5,  "#00FFFF", "cyan"],
                [10, 6,  "#FFFF00", "yellow"],
                [10, 7,  "#FFFFFF", "white"],
                [10, 8,  "#0000D8", "bright-blue"],  // comma fixed
                [10, 9,  "#D80000", "bright-red"],   // typo fixed, index corrected
                [10, 10, "#D800D8", "bright-magenta"],
                [10, 11, "#00D800", "bright-green"],
                [10, 12, "#00D8D8", "bright-cyan"],
                [10, 13, "#D8D800", "bright-yellow"],
                [10, 14, "#D8D8D8", "bright-white"]
            ]
        ];
    }

    function keyDownHandler(e) {
        if (e.code == "ArrowLeft") {
            keyPressedLeft = true;
            keyPressedNum = 0;
        } else if (e.code == "ArrowRight") {
            keyPressedRight = true;
            keyPressedNum = 1;
        } else if (e.code == "ArrowUp") {
            keyPressedUp = true;
            keyPressedNum = 2;
        } else if (e.code == "ArrowDown") {
            keyPressedDown = true;
            keyPressedNum = 3;
        }
    }

    function keyUpHandler(e) {
        if (e.code == "ArrowLeft") {
            keyPressedLeft = false;
        } else if (e.code == "ArrowRight") {
            keyPressedRight = false;
        } else if (e.code == "ArrowUp") {
            keyPressedUp = false;
        } else if (e.code == "ArrowDown") {
            keyPressedDown = false;
        }
        // Only clear the "last key" sentinel when nothing is held, so the
        // boolean-based btn() reading below can still report multi-key state.
        if (!keyPressedLeft && !keyPressedRight && !keyPressedUp && !keyPressedDown) {
            keyPressedNum = 7;
        }
    }

    function cls() {
        screen.clearRect(0, 0, canvas.width, canvas.height);
    }

// Standard Pico-8-like functions

    function print(words, px, py, col) {
        // col can be either a Pico-8 palette index (number) or a CSS colour string
        screen.font = "6px monospace";
        screen.fillStyle = (typeof col === "number") ? colours[sys][col][2] : (col || "#FFF1E8");
        screen.fillText(words, px, py);
    }

    function colour(col) {
        curcol = col;
        screen.fillStyle = colours[sys][col][2];
        return colours[sys][col][2];
    }

    function color(col) { // American spelling
        return colour(col);
    }

    function sspr(img, sx, sy, sw, sh, dx, dy, dw, dh, flip_x, flip_y) {
        // Save the transform so the mirror/flip doesn't leak into later draws.
        screen.save();

        var fx = flip_x === true ? -1 : 1;
        var fy = flip_y === true ? -1 : 1;

        // Translate to the draw position, then scale around it.
        screen.translate(dx + (fx === -1 ? dw : 0), dy + (fy === -1 ? dh : 0));
        screen.scale(fx, fy);

        screen.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

        screen.restore();
    }

    function spr(n, x, y, w, h, flip_x, flip_y) {
        var dx = x;
        var dy = y;
        var sprcellx = n % mapgrid;                  // find sprite cell x
        var sprcelly = Math.floor(n / mapgrid);      // find sprite cell y (was Math.round in <=0.3.1 — off by half row)
        var sx = sprcellx * sprsize;
        var sy = sprcelly * sprsize;
        var sw = w * sprsize;
        var sh = h * sprsize;
        var dw = w * sprsize;
        var dh = h * sprsize;
        sspr(img, sx, sy, sw, sh, dx, dy, dw, dh, flip_x, flip_y);
    }

    function map(mcelx, mcely, msx, msy, mcelw, mcelh, mlayer) {
        screen.drawImage(maps,
            mcelx * 8, mcely * 8, mcelw * 8, mcelh * 8,
            msx, msy, mcelw * 8, mcelh * 8
        );
    }

    // btn(i): true while direction i is held. Using the per-direction
    // booleans so multiple directions can read true simultaneously
    // (diagonal movement). Previous versions compared against a single
    // keyPressedNum, which forced one-key-at-a-time.
    function btn(checkNum) {
        switch (checkNum) {
            case 0: return keyPressedLeft;
            case 1: return keyPressedRight;
            case 2: return keyPressedUp;
            case 3: return keyPressedDown;
            default: return false;
        }
    }

    function mget(mx, my) {
        // TODO: implement in 0.4.x
    }

    function mset(mx, my, v) {
        // TODO: implement in 0.4.x
    }

    _init();

    function loop() {
        _update();
        _draw();
        requestAnimationFrame(loop);
    }

    // Wait for the spritesheet before first draw — avoids the blank first
    // frame if the browser hasn't loaded it yet.
    if (img.complete) {
        loop();
    } else {
        img.onload = loop;
    }
};
