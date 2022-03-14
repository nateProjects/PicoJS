let canvas = document.getElementById("screen");
let screen = canvas.getContext("2d");

// default x & y
// default scaling
// default colour
let col = "#808080"

// Add colour next - start with just basic

function printAt(words, px, py, col) {
    // calculate relative px & py by font size + padding * scaling
        // font size = size 6 + padding 1
        // presuming padding is all around - eg. 2
        // if scaled multiply by scale
    // call colour function to match colour number

//    screen.font = "24px Courier New";
    screen.font = "24px VT323"
// one of these - https://fonts.google.com/?category=Monospace or Courier New
    // change font size to be relative to scaling
    // add padding?
    screen.fillStyle = col;
    // pick up from default / colour command
    screen.fillText(words, px, py);
}
