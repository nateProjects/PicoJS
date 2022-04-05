Pico-JS Javacscript Game library

For migrating Pico-8 games to JavaScript

PicoJS
    template.html
    picoJS.js
    testAll.html
    tests/
        print

To Do -

Gameloop
    xNeed to implement CLS - done? test
    xIs it looping? 
        Why is it calling draw twice?
    Check placement - repeat switching between flips
    Check movement

_init called
loop called
_update called
?    false
_draw called
spr called
sspr called
_draw called
spr called
sspr called

Not working -

    loop();

    function loop() {
        console.log("loop called");
        _update();
        _draw();

        // requestAnimationFrame(loop);
    }

Working -

    function init() {
        // Initialise the game!
    }

    function main() {
        // Here's where we handle all the input, logic and drawing to the screen per frame.

        // call itself by requesting the next animation frame, and so begin the endless loop
        requestAnimationFrame(main);
    }

    // Initialise
    init();

    // Start the loop!
    requestAnimationFrame(main);

BTN - not working yet - loop issue?
Map
Fix variable parameters - resolution etc.

Animation example
Implement rotate
Implement collide

Rect & Line
xset & xget

Basic CSS

xBasic print
xAdd colour
xBasic sprite
xImplement flip
xSprites - sspr + spr
    Need to test different widths & heights
    Need to fix placement after flip