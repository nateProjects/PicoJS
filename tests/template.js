function _init() {

}

// gameloop

function _update() {

}

function _draw() {

}

// Internal Pico functions

// need to function for number of arguments - if there is just 1 it may not be the first

// eg. for print - If there is only one additional argument, it is assumed to be the color argument - instead of x

// maybe fix later, but then won't be like-for-like replacement

function scr(n, p, x, y, col, bordw, bordc, effect) {

// num, pal, resx, resy, border width?, border colour?, effect - crt etc.
// may need separate command to change border or affect dynamically?
// or could do "bordw=" which I think works

//    1 Pico-8                128x128
//    2 Pico-8 alternative    64x64 - can be overridden
//    3 Acorn / BBC           160x256
//    4 Amstrad CPC           160x200
//    5 Apple 2               280x192
//    6 CGA PC                160x100
//    7 Commodore 64          160x200
//    8 MSX                   256×192
//    9 TRS-80 ?              160x192?
//    10 ZX Spectrum           256×192 
//    11 Gameboy green        160x144
//    12 Master               256x192 - no palette
//    13 NES                  256x260 - no palette
//    20 Grey screen
//    21 Green screen
//    22 Amber screen
}

function cls() {

}

function spr(n, x, y, w, h, flip_x, flip_y) {

}

function sspr(sx, sy, sw, sh, dx, dy, dw, dh, flip_x, flip_y) {
// add support for multiple sprite sheets
}

function map(map_x, map_y, screen_x, screen_y, width, height, layer) {
// add support for multiple maps
}

function colour(col) { // maybe add color alias
    // is colour inherited by default unless another is specified - so current-colour
    // allow for different palettes - esp. 8 & 16 bit ones

/*

example

let sys = 0;
let colourTable=[[1,2,3,4],
[5,6,7,8]
]

console.log(colour(3));

function colour(col) { // maybe add color alias

    // change colour here
    return colourTable[sys][col] // so we can look up what current colour value is

    ctx.fillStyle ="#808080"; -- maybe set elsewhere

}

*/

}

//  Index	Color	Hex	RGB	    Name
//  0		#000000	0, 0, 0	    black
//  1		#1D2B53	29, 43, 83	dark-blue
//  2		#7E2553	126, 37, 83	dark-purple
//  3		#008751	0, 135, 81	dark-green
//  4		#AB5236	171, 82, 54	brown
//  5		#5F574F	95, 87, 79	dark-grey
//  6		#C2C3C7	194, 195, 199	light-grey
//  7		#FFF1E8	255, 241, 232	white
//  8		#FF004D	255, 0, 77	red
//  9		#FFA300	255, 163, 0	orange
//  10		#FFEC27	255, 236, 39	yellow
//  11		#00E436	0, 228, 54	green
//  12		#29ADFF	41, 173, 255	blue
//  13		#83769C	131, 118, 156	lavender
//  14		#FF77A8	255, 119, 168	pink
//  15		#FFCCAA	255, 204, 170	light-peach

// Undocumented -
// Index	Color	Hex	RGB	    Name
//  128		#291814	41,24,20	brownish-black
//  129		#111D35	17,29,53	darker-blue
//  130		#422136	66,33,54	darker-purple
//  131		#125359	18,83,89	blue-green
//  132		#742F29	116,47,41	dark-brown
//  133		#49333B	73,51,59	darker-grey
//  134		#A28879	162,136,121	medium-grey
//  135		#F3EF7D	243,239,125	light-yellow
//  136		#BE1250	190,18,80	dark-red
//  137		#FF6C24	255,108,36	dark-orange
//  138		#A8E72E	168,231,46	lime-green
//  139		#00B543	0,181,67	medium-green
//  140		#065AB5	6,90,181	true-blue
//  141		#754665	117,70,101	mauve
//  142		#FF6E59	255,110,89	dark-peach
//  143		#FF9D81	255,157,129	peach
}

function btn(i, p, x) { // also btnp - x
    // Player 1: ⬅︎⬆︎⬇︎➡︎ Z,Y,X / C,V / N,M 
    // Player 2: ASDF, LSHIFT, A / Tab / Q
    // Pause: P / Enter
}

function printat("text", x, y, color, font, size) {
    // add font - https://www.w3schools.com/css/css3_fonts.asp

// need to use montype font & divide into 8 (or have option to change cell size)

}

function rect(x0, y0, x1, y1, col, fill) { // included rectfill could do alias

}

function line(x0, y0, x1, y1, col) {

}

// implement later

function camera(x, y) { 

}

function circ(x, y, r, col, fill) { // included circfill could do alias

}

function clip(x, y, w, h) {

}

function _update60() {

}

function mget(x, y) {

}

function mset(x, y, v) {

}

function pset(x, y, c) {

}

function pget(x, y) {

}

function sget(x, y) {

}

function sset(x, y, col) {

}

function fget(n, f) { // may need special version for sspr sprites

}

function fset(n, f, v) { // may need special version for sspr sprites

}

function sfx() {

}

function music() {

}

function printh() {
    // print to console
}
