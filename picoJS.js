// picoJS — current stable (0.3.4)
// See picoJS-0.3.4.js for the versioned copy & the bug-fix changelog.

window.onload = function () {
    var canvas = document.getElementById("screen");
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.id = "screen";
        canvas.width = 128;
        canvas.height = 128;
        canvas.style.left = "30px";
        canvas.style.top = "30px";
        canvas.style.position = "absolute";
        document.body.appendChild(canvas);
    }
    var screen = canvas.getContext("2d");

    // Input state
    var keyPressedNum = 7;
    var keyPressedLeft = false;
    var keyPressedRight = false;
    var keyPressedUp = false;
    var keyPressedDown = false;

    // System / colour state in the outer closure so colour() can see it.
    var systems = [
        [0, 0, "Pico-8", 128, 128],
        [1, 1, "Pico-8 Alt", 64, 64],
        [2, 3, "ZX Spectrum", 256, 192]
    ];
    var sys = 0;
    var w = 128;
    var h = 128;
    var curcol = 0;
    var colours = [];

    var mapgrid = 16;
    var sprsize = 8;

    // Register listeners ONCE, not inside _update().
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    var img = new Image();
    img.src = 'tests/booty-sprites.png';
    img.onerror = function () { console.error(img.src + ' failed to load.'); };

    // Example user code — kept minimal; picoJS-0.3.4.js has the full demo.
    var px = 40;

    function _draw() {
        cls();
        spr(77, px, 40, 1, 2);
    }

    function _update() {
        if (btn(1)) px++;
    }

    function _init() {
        sys = 0;
        w = systems[sys][3];
        h = systems[sys][4];
        curcol = systems[sys][0];

        colours = [
            [
                [0, 0, "#000000", "black"],
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

    function print(words, px, py, col) {
        screen.font = "24px VT323";
        screen.fillStyle = (typeof col === "number") ? colours[sys][col][2] : col;
        screen.fillText(words, px, py);
    }

    function colour(col) {
        curcol = col;
        screen.fillStyle = colours[sys][col][2];
        return colours[sys][col][2];
    }

    function color(col) {
        return colour(col);
    }

    function cls() {
        screen.clearRect(0, 0, canvas.width, canvas.height);
    }

    function sspr(img, sx, sy, sw, sh, dx, dy, dw, dh, flip_x, flip_y) {
        screen.save();
        var fx = flip_x === true ? -1 : 1;
        var fy = flip_y === true ? -1 : 1;
        screen.translate(dx + (fx === -1 ? dw : 0), dy + (fy === -1 ? dh : 0));
        screen.scale(fx, fy);
        screen.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
        screen.restore();
    }

    function spr(n, x, y, w, h, flip_x, flip_y) {
        var dx = x;
        var dy = y;
        var sprcellx = n % mapgrid;
        var sprcelly = Math.floor(n / mapgrid); // was Math.round - 8 (off by half a row)
        var sx = sprcellx * sprsize;
        var sy = sprcelly * sprsize;
        var sw = w * sprsize;
        var sh = h * sprsize;
        var dw = w * sprsize;
        var dh = h * sprsize;
        sspr(img, sx, sy, sw, sh, dx, dy, dw, dh, flip_x, flip_y);
    }

    function btn(checkNum) {
        switch (checkNum) {
            case 0: return keyPressedLeft;
            case 1: return keyPressedRight;
            case 2: return keyPressedUp;
            case 3: return keyPressedDown;
            default: return false;
        }
    }

    function keyDownHandler(e) {
        if (e.code == "ArrowLeft")       { keyPressedLeft  = true; keyPressedNum = 0; }
        else if (e.code == "ArrowRight") { keyPressedRight = true; keyPressedNum = 1; }
        else if (e.code == "ArrowUp")    { keyPressedUp    = true; keyPressedNum = 2; }
        else if (e.code == "ArrowDown")  { keyPressedDown  = true; keyPressedNum = 3; }
    }

    function keyUpHandler(e) {
        if (e.code == "ArrowLeft")       keyPressedLeft  = false;
        else if (e.code == "ArrowRight") keyPressedRight = false;
        else if (e.code == "ArrowUp")    keyPressedUp    = false;
        else if (e.code == "ArrowDown")  keyPressedDown  = false;
        if (!keyPressedLeft && !keyPressedRight && !keyPressedUp && !keyPressedDown) {
            keyPressedNum = 7;
        }
    }

    _init();

    function loop() {
        _update();
        _draw();
        requestAnimationFrame(loop);
    }

    if (img.complete) {
        loop();
    } else {
        img.onload = loop;
    }
};
