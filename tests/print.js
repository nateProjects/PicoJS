    // 512 is 128 x 4 scaling
    // should be multiplying x & y by scaling

    // create canvas in JS? nah, want to make it easy for someone to put where they want it

let canvas = document.getElementById("screen");
let screen = canvas.getContext("2d");

//printAt("hello",px,py);

for (var b = 24; b <= 512; b += 20) {
        for (var a = 4; a <= 512-14; a+= 14) {
            printAt("0", a, b);
        }
    };
// work out logic behind this

// font size = size 6 + padding 1
// presuming padding is all around - eg. 2
// if scaled multiply by scale

function printAt(words, px, py) {
    screen.font = "24px Courier New";
    // add padding?
    screen.fillStyle ="#808080";
    screen.fillText(words, px, py);
}
