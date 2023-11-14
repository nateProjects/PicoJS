// PicoJS JavaScript
window.onload = function () {

    var canvas = document.createElement("canvas");
    var screen = canvas.getContext("2d");
    canvas.width = 128; // Set the canvas width
    canvas.height = 128; // Set the canvas height
    canvas.style.left = "30px"; // consider centering / styles
    canvas.style.top = "30px";
    canvas.style.position = "absolute";
    document.body.appendChild(canvas);

    sprite = 1 // find later on grid, variable sizes
    x = 8
    y = 59
    var frameDelay = 40; // delay - lower = faster

    _init();

    var img = new Image();
    img.src = 'tests/spritesheet.png';
    img.onerror = function () { alert(img.src + ' failed to load.'); };

	loop() // can i call this in _init? put at end?

    function loop() {
    
        setTimeout(function () { // this sort of works
            _update();
            _draw();
            requestAnimationFrame(loop);
        }, frameDelay);
    }

    function _draw() {
        cls()
        spr(sprite, x, y, 1, 1)
    }

    function _update() {

        //animate
        sprite += 1 // timing 

        if (sprite >= 5) { sprite = 1; }

        //move
        x += 1
        if (x > 127) { x = 8; }
    }

    function _init() {
        // Initialization code
        console.log("_init called");
        const systems = [
            [0, 0, "Pico-8", 128, 128], // #,colours,name,w,h
            [1, 1, "Pico-8 Alt", 64, 64],
            [2, 3, "ZX Spectrum", 256, 192] // will actually be system 10
        ]
        let sys = 0; // 0 = Pico
        let w = systems[sys][3];
        let h = systems[sys][4];

    }

    function cls() {
        screen.clearRect(0, 0, canvas.width, canvas.height);
    }

    function sspr(img, sx, sy, sw, sh, dx, dy, dw, dh, flip_x, flip_y) {
        console.log("sspr called");
//        screen.translate(dx + dx, dy + dy);  //location on the canvas - if called more than once it adds to existing
        // double check need the +

        // Set flip & position
        let fx = 1;
        let fy = 1;
        if (flip_x === true) {
            fx = -1; // + dw?
            dx *= -1; // + dh?
        }
        if (flip_y === true) {
            fy = -1;
            dy *= -1;
        }

        screen.scale(fx, fy);  //This does your mirroring/flipping
        // -1, 1 is flipped horizontally
        // 1, -1 is flipped vertically

        // draw ssprite
        screen.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    }

    function spr(n, x, y, w, h, flip_x, flip_y) {
        console.log("spr called");
        // x,y
        dx = x;
        dy = y;

        sx = 8 * (n % 16);
        sy = 8 * Math.round(n / 16); // bloody hell - this actually worked
                                    // had -8 at the end, can't remember why, but broke example
        // w,h
        sw = w * 8; // sw = width - w*8 (7+1) - is this one too high?
        sh = h * 8; // sh = height - h*8 (7+1) - is this one too high?

        // scale - presume unscaled
        dw = w * 8; // could just do dw = sw
        dh = h * 8; // could just do dh = sh

        sspr(img, sx, sy, sw, sh, dx, dy, dw, dh, flip_x, flip_y);
        console.log(img, sx, sy, sw, sh, dx, dy, dw, dh, flip_x, flip_y)
    }

}
