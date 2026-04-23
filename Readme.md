# Pico-JS Javascript Game library

**Current version: 0.4.0**

A simple JavaScript game library, which makes it easy to create canvas-based games playable through a web browser.

It is inspired by Pico-8, a Lua-based virtual game console and game creation IDE, and can be used to port Pico-8 games to JavaScript.

## Game Creation With Pico-JS

This will cover -
* Displaying and moving a sprite with key presses
* Displaying a map / game level
* Setting unmovable areas
* Creating collectable items & scoring
* Creating NPCs & losing conditions
* Adding firing, being fired at mechanic
* Sprite & map creation via Pico-8 or other pixel & tile tools

## Pico-8 To JavaScript Conversion

This will cover -
* Exporting the necessary files
* Running the included conversion script 
* & any manual changes that may need to be made

## TO DO

### Implemented (partially) -

* _draw
* _update
* _init
* BTN (0-5: arrows + O/X)
* CLS (with optional colour)
* COLOUR / COLOR
* SSPR
* SPR
* MAP (image-backed)
* PRINT
* RECT / RECTFILL
* LINE
* CIRC / CIRCFILL
* OVAL / OVALFILL
* PSET / PGET
* CAMERA

### Roadmap / To Add -

* Mget - get sprite # @ x,y & Mset - set sprite # @ x,y - 0.4.1 (stubs present in 0.4.0)
* Fget - get sprite # flag & Fset - set sprite # flag - 0.4.1 (stubs present in 0.4.0)
* Data-array map format (replaces image-backed map) - 0.4.1
* `.p8` → JS conversion tool - 0.4.2
* BTNP (just-pressed) - 0.4.3+
* Table helpers (add / del / foreach / all) - 0.4.3+
* Pico-8 math quirks (flr / sin / cos in turns / atan2 with swapped args / rnd) - 0.4.3+
* ? SGet & SSet
* Pal / Palt -  if possible
* Music - just play exported?
* ? SFX - play exported?
* ? Clip
* ? MenuItem

### Other Ideas -

* Should do collision - collide(obj1,obj2)
* Should be able to account for bigger spritesheet
* Should add scaling x2,x3,x4 - see systems, scale sprite auto too - 128,256,384,512 ... 1024 could just multiply then any conceivable
* Possible Tile map implementation
* Single non-spritesheet sprites - aspr
* Add jump command? gravity, trajectory
* Add bounds to moving sprites?
* Add speed to movement
* CSS Styles - based on Pico & Consoles
* Scaling - for Canvas, MAP & SPR
* Multiple Players (BTN) & SPR

### Examples -

* Character movement
* Character animation
* Catching game
* Shooting game
* Racing / Skiing game
* Bat & Ball game
* Snake game
* Platform game
* Flappy bird
* Continuous runner

## Changelog

### 0.4.0 — namespace refactor, drawing primitives & camera

Biggest structural change since the project started. The library is now exposed as a single `window.picoJS` namespace object and games boot through `picoJS.run({...})` instead of the library being a monolithic IIFE that owned the game loop.

Entry point:

```html
<script src="picoJS-0.4.0.js"></script>
<script src="mygame.js"></script>
```

```js
// mygame.js
function _init()   { /* ... */ }
function _update() { /* ... */ }
function _draw()   { cls(1); spr(0, 64, 64); }

picoJS.run({
    sprites: "tests/booty-sprites.png",
    map:     "tests/booty-demake-map.png",
    init:   _init,
    update: _update,
    draw:   _draw
});
```

`run()` calls `picoJS.installGlobals()` by default, which copies `cls`, `spr`, `sspr`, `map`, `rect`, `rectfill`, `line`, `circ`, `circfill`, `oval`, `ovalfill`, `pset`, `pget`, `camera`, `btn`, `colour`, `color`, `print`, `mget`, `mset`, `fget`, `fset` onto `window` so game code reads like Pico-8 Lua. Pass `globals: false` to opt out and call everything as `picoJS.cls(...)` etc.

New drawing primitives, all honouring the camera offset and accepting either a Pico-8 palette index or a CSS colour string:

* `rect(x0, y0, x1, y1, col)` / `rectfill(x0, y0, x1, y1, col)`
* `line(x0, y0, x1, y1, col)` — Bresenham, pixel-accurate
* `circ(cx, cy, r, col)` / `circfill(cx, cy, r, col)` — midpoint circle
* `oval(x0, y0, x1, y1, col)` / `ovalfill(x0, y0, x1, y1, col)`
* `pset(x, y, col)` / `pget(x, y)` — `pget` reverse-lookups the Pico-8 palette index from the canvas pixel, returning `-1` if the pixel doesn't match a palette entry
* `camera(x, y)` — logical translation applied to all subsequent draws until reset

`cls(col)` now accepts an optional colour index / CSS string (clears the canvas to that colour). Omitting the argument keeps the old behaviour (clear to transparent).

`btn()` reports buttons 4 (O) and 5 (X) in addition to 0–3. Z / C map to O, X / V map to X.

Robust asset loading: `run()` starts the game loop on `onload` OR `onerror` OR a 2-second safety timeout, so a missing spritesheet / map no longer freezes the game. Per-asset status is exposed in the debug panel. `_update` and `_draw` are each wrapped in `try/catch` at the loop level so a one-off error surfaces in the console (and the debug log) without killing the animation chain. `pget()` also catches the `SecurityError` a tainted canvas throws under `file://` and returns `-1` with a one-time console warning.

Debug panel: `picoJS.run({ debug: true })` injects a fixed-position `<pre id="picojs-debug">` in the bottom-left showing frame count, FPS, per-button state (`[L R U D O X]`), camera offset, and the live load status of the spritesheet and map image. Game code can drive custom output two ways:

* `picoJS.debugText = "..."` — replaces a dedicated block in the panel every frame. Useful for live values (player x/y, state machine, etc.).
* `picoJS.log("msg")` — appends to a 12-entry ring-buffered log shown below.

Style by targeting `#picojs-debug` in your own CSS, or pass `debugElement` to `run()` to supply your own container.

Test harness: `test-0.4.0.html` + `test-0.4.0-game.js` — the game file shows the new boot pattern, drives `picoJS.debugText` with live player state, and the HTML checklist walks through every primitive, the camera scroll, and the `pset`/`pget` round-trip. `picoJS-0.3.4.js` + `test-0.3.4.html` are untouched as the last monolithic version for anyone mid-port.

### 0.3.4 — bug-fix pass + retire obsolete harnesses

Harness cleanup: `test-0.3.2.html`, `testAll.html`, `picoJS-test.html`/`.js`, and `spr-anim-example01.html`/`.js` were all moved to `old/`. None of them exercised the current library API — some loaded versions that were already archived, others shipped their own inline copy of `spr()` with the broken `Math.round` row math. Replaced by a single new test: `test-0.3.4.html`, which loads `picoJS-0.3.4.js` and includes an on-page checklist for spot-checking each fix.

Asset paths are now overridable via `window.picoJS_spriteSrc` / `window.picoJS_mapSrc` (set them in a `<script>` tag before loading `picoJS-0.3.4.js`). Defaults are `tests/booty-sprites.png` and `tests/booty-demake-map.png`, which are the assets actually shipped in the repo.

Bug fixes:

* Moved colour / system state (`sys`, `curcol`, `colours`, `systems`) out of `_init()`'s local scope into the outer closure so `colour()` / `color()` actually work — previously they threw `ReferenceError` on the first call.
* Wrapped flip transforms in `save()` / `restore()` inside `sspr()`. `screen.scale(-1, 1)` was leaking into subsequent draws, leaving the whole canvas mirrored after the first flipped sprite.
* Switched `spr()` row-math from `Math.round(n / 16) - 8` to `Math.floor(n / 16)` in `picoJS.js`. The round-based formula placed sprites 0–7 at y = −8 (off-canvas) and sprites 16–23 at y = 0 (row 0 instead of row 1).
* Fixed a left/right label swap in the key handler (pressing ArrowLeft was setting `keyPressedRight = true`).
* Moved `addEventListener("keydown", …)` out of `_update()` — it was being registered every animation frame, adding hundreds of duplicate listeners per second.
* `btn()` now reads the per-direction booleans instead of comparing to a single `keyPressedNum`, so simultaneous presses work and diagonal movement is possible.
* Declared `spr()`'s locals (`dx`, `dy`, `sx`, `sy`, `sw`, `sh`, `dw`, `dh`) with `var` — they were leaking onto the global object.
* First `_draw()` now waits for the spritesheet's `onload`, avoiding a blank first frame.
* `tests/template.js` — fixed a syntax error where `printat` had a string literal as a parameter name.
* `picoJS-0.3.3.js` was pointing `maps.src` at the spritesheet; kept that version as-is (historical snapshot) but `picoJS-0.3.4.js` points at `resources/map.png`.
