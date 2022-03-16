window.onload = function() {
var canvas = document.getElementById("screen");
var screen = canvas.getContext("2d");

const systems = [
    [0,0,"Pico-8",128,128], // #,colours,name,w,h
    [1,1,"Pico-8 Alt",64,64],
    [2,3,"ZX Spectrum",256,192] // will actually be system 10
]
let sys = 0; // 0 = Pico
let w = systems[sys][3];
let h = systems[sys][4];
let curcol = systems[sys][0]; // current colour

const colours = [
    [
    [0,0,"#000000","black"], // Pico default colours
    [0,1,"#1D2B53","dark-blue"],
    [0,2,"#7E2553","dark-purple"],
    [0,3,"#008751","dark-green"],
    [0,4,"#AB5236","brown"],
    [0,5,"#5F574F","dark-grey"],
    [0,6,"#C2C3C7","light-grey"],
    [0,7,"#FFF1E8","white"],
    [0,8,"#FF004D","red"],
    [0,9,"#FFA300","orange"],
    [0,10,"#FFEC27","yellow"],
    [0,11,"#00E436","green"],
    [0,12,"#29ADFF","blue"],
    [0,13,"#83769C","lavender"],
    [0,14,"#FF77A8","pink"],
    [0,15,"#FFCCAA","light-peach"]
    ],
    [
    [1,128,"#291814","brownish-black"], // Pico Alt Colours
    [1,129,"#111D35","darker-blue"],
    [1,130,"#422136","darker-purple"],
    [1,131,"#125359","blue-green"],
    [1,132,"#742F29","dark-brown"],
    [1,133,"#49333B","darker-grey"],
    [1,134,"#A28879","medium-grey"],
    [1,135,"#F3EF7D","light-yellow"],
    [1,136,"#BE1250","dark-red"],
    [1,137,"#FF6C24","dark-orange"],
    [1,138,"#A8E72E","lime-green"],
    [1,139,"#00B543","medium-green"],
    [1,140,"#065AB5","true-blue"],
    [1,141,"#754665","mauve"],
    [1,142,"#FF6E59","dark-peach"],
    [1,143,"#FF9D81","peach"]
    ],
    [
    [10,0,"#000000","Black"], // ZX Spectrum
    [10,1,"#0000FF","Blue"],
    [10,2,"#FF0000","Red"],
    [10,3,"#FF00FF","Magenta"],
    [10,4,"#00FF00","Green"],
    [10,5,"#00FFFF","Cyan"],
    [10,6,"#FFFF00","Yellow"],
    [10,7,"#FFFFFF","White"],
    [10,8,"#0000d8","bright-blue"]
    [10,2,"#d80000","bright-ed"],
    [10,3,"#d800d8","bright-magenta"],
    [10,4,"#00d800","bright-green"],
    [10,5,"#00d8d8","bright-cyan"],
    [10,6,"#d8d800","bright-yellow"],
    [10,7,"#d8d8d8","bright-white"]
    ]
]

// default x & y
// default scaling

function print(words, px, py, col) { // change to print.at?
    // calculate relative px & py by font size + padding * scaling
    // make relative to canvas size - isn't that automatic?
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
    // colour not added
    // pick up from default / colour command
    screen.fillText(words, px, py);
}

function colour(col) {
    // change colour here
    curcol = col;
    screen.fillStyle = colours[sys][col][2];
    console.log("colour "+colours[sys][col][2])
    return (colours[sys][col][2]) // so we can look up what current colour value is
        // should this be number? (nstead of hex?)
}
function color(col) { // American spelling
    colour(col);
}


// _init section
var img = new Image();
img.onerror=function(){alert(img.src+' failed to load.');};
img.src = 'tests/booty-sprites.png';
img.onload = _draw;

/*
function _draw() {
    screen.drawImage(img, 105, 32, 7, 15, 0, 0, 15, 32);
}
*/

function _draw() {
    spr();
}
function spr() {
    screen.drawImage(img, 105, 32, 7, 15, 0, 0, 15, 32);

/*
drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

image = image url
sx & sy - source x & y
swidth & sheight - source width & height
dx & dy - destination x & y
dwidth & dheight - are these needed? don't they stretch? eg. scaling?

    #pico sprite
    spr(number,x,y,w,h,hflip,vflip) -- or do as spr
    #normal sprite
    sspr(xs,yx,xw,yh,px,py,hflip,vflip, stretchwidth,stretchheight)
*/
}

// This works but calling another function with the same content doesn't

}

/*

Change line 5 to let image = document.createElement("img");

When drawing images to a canvas you must provide an image element, created with document.createElement or stored in your index.html

*/
