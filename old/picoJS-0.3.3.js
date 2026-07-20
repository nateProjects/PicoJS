// 0.3.2 - SPR drawing fix, animation test
window.onload = function () {
    // ignore this part if you want to focus on game coding
    // it sets up the canvas & key detection in the browser
    var canvas = document.createElement("canvas");
    var screen = canvas.getContext("2d");
    canvas.width = 128; // Set the canvas width
    canvas.height = 128; // Set the canvas height
    canvas.style.left = "30px"; // consider centering / styles
    canvas.style.top = "30px";
    canvas.style.position = "absolute";
    document.body.appendChild(canvas);
    var keyPressedNum = 7; // default non-key, always returns false
    var keyPressed = false;

    var keyPressedLeft = false;
    var keyPressedRight = false;
    var keyPressedUp = false;
    var keyPressedDown = false;
    var scaleX = 1;
    var scaleY = 1;
    let fx = 1;
    let fy = 1;

/*
    let keys = {
        ArrowLeft: false,
        ArrowRight: false,
        ArrowUp: false,
        ArrowDown: false
    };
*/
    var mapgrid = 16 // may potentially be larger, maybe expand later for different x & y
    var sprsize = 8 // currently 8-bit, adapt for potential 16 bit etc.
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    var img = new Image();
    img.src = '../resources/spritesheet.png';
    img.onerror = function () { alert(img.src + ' failed to load.'); };
    var maps = new Image();
    maps.src = '../resources/spritesheet.png'; 
    maps.onerror = function () { alert(maps.src + ' failed to load.'); };   

// Regular Pico-8-like code starts here

var pchar = 6
var pstart = 6
var pflip = false
var pend = 9
var px = 40; // player x
var py = 40;
var ps = 1; // player speed

function _draw() {
    cls();
    map(0,0,0,0,16,16);
    console.log(pflip);
    spr(pchar, px, py, 1, 2, pflip);
}

function _update() {
    if (btn(0) && px > 0) { // left + screen boundaries 
        px -= ps; // need to account for multiple players - had ps here
        pflip = true;
        move();
    }
    if (btn(1) && px < canvas.width) { // right - need to account for sprite width
        px += ps;
        pflip = false;
        move();
    }
    if (btn(2) && py >= 0) { // up
        py -= ps;
    }
    if (btn(3) && py <= canvas.height) { // down - need to account for sprite height
        py += ps;
    }
/*
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - sprsize) {
        player.x += player.speed;
    }
    if (keys.ArrowUp && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y < canvas.height - sprsize) {
        player.y += player.speed;
    }
*/
    if (keyPressedNum != 7) {
    }
}

function move() {
    pchar += 1 // sprite cycle 
    if (pchar >= pend) { pchar = pstart; }
}

// Regular Pico-8-like code ends here
// More System & Keyboard setup follows

    function _init() {
        // Initialization code
        const systems = [
            [0, 0, "Pico-8", 128, 128], // #,colours,name,w,h
            [1, 1, "Pico-8 Alt", 64, 64],
            [2, 3, "ZX Spectrum", 256, 192] // will actually be system 10
        ]
        let sys = 0; // 0 = Pico
        let w = systems[sys][3];
        let h = systems[sys][4];
        let curcol = systems[sys][0]; // current colour
        const colours = [
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
                [10, 0, "#000000", "Black"], // ZX Spectrum
                [10, 1, "#0000FF", "Blue"],
                [10, 2, "#FF0000", "Red"],
                [10, 3, "#FF00FF", "Magenta"],
                [10, 4, "#00FF00", "Green"],
                [10, 5, "#00FFFF", "Cyan"],
                [10, 6, "#FFFF00", "Yellow"],
                [10, 7, "#FFFFFF", "White"],
                [10, 8, "#0000d8", "bright-blue"]
                [10, 2, "#d80000", "bright-ed"],
                [10, 3, "#d800d8", "bright-magenta"],
                [10, 4, "#00d800", "bright-green"],
                [10, 5, "#00d8d8", "bright-cyan"],
                [10, 6, "#d8d800", "bright-yellow"],
                [10, 7, "#d8d8d8", "bright-white"]
            ]
        ]
    }

    function keyDownHandler(e) {
        if (e.code == "ArrowLeft") {
            keyPressedRight = true;
            keyPressedNum = 0;
        } else if (e.code == "ArrowRight") {
            keyPressedLeft = true;
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
        keyPressedNum = 7; // default non-key, always returns false
        if (e.code == "ArrowLeft") {
            keyPressedRight = false;
        } else if (e.code == "ArrowRight") {
            keyPressedLeft = false;
        } else if (e.code == "ArrowUp") {
            keyPressedUp = false;
        } else if (e.code == "ArrowDown") {
            keyPressedDown = false;
        }
    }

/*
// Functions to handle key events
    function keyDownHandler(e) {
        keys[e.code] = true;
        keysPressedNum = ?
    }

    function keyUpHandler(e) {
        keys[e.code] = false;
    }
*/
    function cls() {
        screen.clearRect(0, 0, canvas.width, canvas.height);
    }

// Standard Pico-8-like functions

    function colour(col) {
        // change colour here
        curcol = col;
        screen.fillStyle = colours[sys][col][2];
//        console.log("colour " + colours[sys][col][2])
        return (colours[sys][col][2]) // so we can look up what current colour value is
        // should this be number? (instead of hex?)
    }

    function color(col) { // American spelling
        colour(col);
    }

    function sspr(img, sx, sy, sw, sh, dx, dy, dw, dh, flip_x, flip_y) {
//        console.log("sspr called");
        // Set flip & position
        if (flip_x === true) {
            // fx = -1; // + dw?
            scaleX = -1;
            dx *= -1; // + dh?
        } // else scaleX = 1;

        if (flip_y === true) {
            fy = -1;
            dy *= -1;
        }
        //screen.scale(fx, fy);  //This does your mirroring/flipping
        // -1, 1 is flipped horizontally / 1, -1 is flipped vertically

        // Determine flip
        //let scaleX = (flip_x) ? 1 : -1;
        //let scaleY = (flip_y) ? -1 : 1;

        // Flip the context if needed
        screen.scale(scaleX, scaleY);

        // draw ssprite
        screen.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        screen.scale(1, 1);
    }

    function spr(n, x, y, w, h, flip_x, flip_y) {
//        console.log("spr called");
        dx = x;
        dy = y;
        sprcellx = (n) % mapgrid; // find sprite cell x
        sprcelly = Math.floor((n) / mapgrid);
        sx = sprcellx * sprsize;  // find sprite pixel x
        sy = sprcelly * sprsize;
        // w,h
        sw = w * 8; // sw = width - w*8 (7+1) - is this one too high?
        sh = h * 8; // sh = height - h*8 (7+1) - is this one too high?
        // scale - presume unscaled
        dw = 1; // could just do dw = sw
        dh = 1; // could just do dh = sh
        // change width and height as per request
        dw = w * 8; // could just do dw = sw
        dh = h * 8; // could just do dh = sh
        sspr(img, sx, sy, sw, sh, dx, dy, dw, dh, flip_x, flip_y);
        // console.log(img, sx, sy, sw, sh, dx, dy, dw, dh, flip_x, flip_y)
    }

    function map(mcelx, mcely, msx, msy, mcelw, mcelh, mlayer) {
        screen.drawImage(maps, (mcelx*8), (mcely*8), (mcelw*8), (mcelh*8), msx, msy, (mcelw*8), (mcelh*8)); // mcelw, mcelh
        //      screen.drawImage('tests/booty-demake-map.png', 0, 0, 128, 128, x, y, x+128, y+128)
        //      next screen map(16,0,0,0,16,16) would be screen.drawImage(maps,128,0,128,128,0,0,128,128);
    }

    function btn(checkNum) {
        return checkNum === keyPressedNum;
    }

    function mget(mx,my) {

    }

    function mset(mx,my) {

    }

    _init();

    function loop() {
        _update();
        _draw();
        requestAnimationFrame(loop);
    }

    loop();

}
