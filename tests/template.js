// picoJS 0.4.3 starter template
// Reference: https://github.com/your-repo/picoJS

picoJS.run({
    // spriteSheet: 'sprites.png',   // path to sprite sheet image
    // mapData: mapData,             // from p8-to-js output
    // spriteFlags: spriteFlags,     // from p8-to-js output
    // systemIndex: 0,               // 0 = Pico-8 128x128, 1 = Pico-8 64x64, 2 = ZX Spectrum
    // debug: true,                  // show debug panel
    // globals: true,                // install functions on window (default true)
});

// ─── Game lifecycle ───────────────────────────────────────────────────────────

function _init() {

}

function _update() {

}

function _draw() {

}

// ─── Screen ───────────────────────────────────────────────────────────────────

// cls(col)                     clear screen to colour index
// colour(col) / color(col)     set current draw colour
// camera(x, y)                 offset all subsequent draws by -x, -y
// print(words, x, y, col)      draw text at position

// ─── Drawing primitives ───────────────────────────────────────────────────────

// pset(x, y, col)              set pixel
// pget(x, y)                   get pixel colour index
// rect(x0, y0, x1, y1, col)    hollow rectangle
// rectfill(x0, y0, x1, y1, col) filled rectangle
// line(x0, y0, x1, y1, col)   draw line
// circ(cx, cy, r, col)         hollow circle
// circfill(cx, cy, r, col)     filled circle
// oval(x0, y0, x1, y1, col)    hollow oval (bounding box corners)
// ovalfill(x0, y0, x1, y1, col) filled oval

// ─── Sprites ─────────────────────────────────────────────────────────────────

// spr(n, x, y, w, h, flip_x, flip_y)                 draw sprite n from sheet
// sspr(img, sx, sy, sw, sh, dx, dy, dw, dh, flip_x, flip_y)  sub-sprite blit

// ─── Map & flags ──────────────────────────────────────────────────────────────

// map(mcelx, mcely, msx, msy, mcelw, mcelh, mlayer)  draw tile region to screen
// mget(x, y)              get tile sprite number at map cell
// mset(x, y, v)           set tile sprite number at map cell
// fget(n [, f])           get all flags byte, or single bit f (0-7) of sprite n
// fset(n [, f], v)        set all flags byte, or single bit f (0-7) of sprite n

// ─── Input ────────────────────────────────────────────────────────────────────

// btn(i)   current button state  — 0 left, 1 right, 2 up, 3 down, 4 O (Z/C), 5 X (X/V)
// btnp(i)  just-pressed + Pico-8 auto-repeat (fires on press, 15-frame delay, then every 4 frames)

// ─── Math ─────────────────────────────────────────────────────────────────────

// flr(x)          Math.floor
// sin(x)          sine in turns (0..1 = full circle), y-down inverted
// cos(x)          cosine in turns
// atan2(dx, dy)   angle in turns [0,1) — note: arg order differs from Math.atan2
// rnd()           random [0,1); rnd(n) → [0,n); rnd(arr) → random element

// ─── Table helpers (Lua-style, 1-based) ───────────────────────────────────────

// add(t, v [, i])  append v, or insert at 1-based index i
// del(t, v)        remove first element equal to v
// deli(t [, i])    remove by 1-based index (default: last)
// foreach(t, f)    call f(v) for each non-nil element
// all(t)           return shallow copy (safe for foreach + del)
// count(t [, v])   length, or count of elements equal to v
