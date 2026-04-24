# Pico-JS Javascript Game library

**Current version: 0.4.3**

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
* BTNP (with Pico-8 auto-repeat)
* CLS (with optional colour)
* COLOUR / COLOR
* SSPR
* SPR
* MAP (data-array, with image-backed fallback)
* MGET / MSET
* FGET / FSET
* PRINT
* RECT / RECTFILL
* LINE
* CIRC / CIRCFILL
* OVAL / OVALFILL
* PSET / PGET
* CAMERA
* ADD / DEL / DELI / FOREACH / ALL / COUNT
* FLR / SIN / COS / ATAN2 / RND

### Roadmap / To Add -

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

### 0.4.3 — btnp + table helpers + Pico-8 math quirks

New input primitive, a set of Lua-style table helpers, and Pico-8's idiosyncratic trig/random functions — all installed as globals alongside the existing set.

```js
// btnp with Pico-8 auto-repeat
if (btnp(0)) menuIx--;   // fires on press, then after 15 frames held,
if (btnp(1)) menuIx++;   // then every 4 frames while still held

// Lua-style tables over JS arrays
var particles = [];
add(particles, { x: 10, y: 20 });   // returns the value added
foreach(all(particles), function (p) {
    p.y += 1;
    if (p.y > 128) del(particles, p);   // del during all() iteration is safe
});

// Math quirks
var r = rnd(100);             // number in [0, 100)
var c = rnd([8, 9, 10, 11]);  // random element from array
var x = 64 + cos(t) * 20;     // t in turns, 0..1 = full circle
var y = 64 + sin(t) * 20;     // sin is flipped for Pico-8's y-down
var a = atan2(dx, dy);        // args swapped vs JS, returns turn
```

`btnp(i)` returns `true` on the first frame a button is held, then again 15 frames later, then every 4 frames while still held. Matches Pico-8's timing for menu navigation and held-key behaviours. Per-button counters reset to 0 on release, so a quick tap always fires only once.

Table helpers — thin JS wrappers over arrays so ported code reads the same. `add(t, v)` pushes and returns `v`; `add(t, v, i)` inserts at Pico-8's 1-based index. `del(t, v)` removes the first match and returns it (or `null` if missing). `deli(t, i)` removes by 1-based index; `deli(t)` with no index removes the last. `foreach(t, f)` skips `null` / `undefined`. `all(t)` returns a defensive copy so `del()` during `for v of all(t)` can't skip entries. `count(t)` returns length; `count(t, v)` returns occurrences.

Math quirks keep the Pico-8 muscle memory intact. `flr` is `Math.floor`. `sin(x)` takes turns and is inverted — `sin(0.25) = -1` — matching Pico-8's y-down screen convention; `cos(x)` takes turns but isn't flipped. `atan2(dx, dy)` uses Pico-8's argument order and returns a turn in `[0, 1)` with east=0, south=0.25, west=0.5, north=0.75. `rnd()` returns `[0, 1)`; `rnd(n)` returns `[0, n)`; `rnd(arr)` returns a random element.

Test harness: `test-0.4.3.html` + `test-0.4.3-game.js` — a menu whose left/right navigation demonstrates the btnp auto-repeat timing (tap once = step one; hold = pause then auto-scroll), a sparkle particle list exercising `add`/`del`/`foreach`/`all`/`count` with safe mid-iteration deletion, and an orbiting marker driven by `sin`/`cos` on a turn counter with an arrow aiming at it via `atan2`. All drawn with primitives so no spritesheet is required.

### 0.4.2 — `.p8` → JS data module converter

No library API changes. `picoJS-0.4.2.js` is a straight version bump of `picoJS-0.4.1.js` so demos and tooling can target a stable string. The real deliverable is a new CLI at `tools/p8-to-js.js` that parses a Pico-8 cart and emits a JS module containing `mapData` + `spriteFlags` for `picoJS.run()`.

```sh
node tools/p8-to-js.js mygame.p8 mygame-data.js
```

The emitted file works in two ways: loaded as a `<script>` tag it defines `mapData` / `spriteFlags` as globals, or `require()`d from Node it exposes them via `module.exports`. Include it next to `picoJS-0.4.2.js` and hand both straight to `run()`:

```html
<script src="picoJS-0.4.2.js"></script>
<script src="mygame-data.js"></script>
<script src="mygame.js"></script>
```

```js
picoJS.run({
    sprites:     "sprites.png",
    mapData:     mapData,       // from mygame-data.js
    spriteFlags: spriteFlags,   // ditto
    init: _init, update: _update, draw: _draw
});
```

What the converter parses:

* `__map__` — 32 rows × 256 hex chars. Output is a full 128×32 nested array (rows shorter than 256 chars, or the section missing entirely, are zero-padded).
* `__gff__` — up to 2 rows × 256 hex chars = 256 flag bytes. Output is a flat 256-element array.

What it doesn't touch: `__gfx__`, `__sfx__`, `__music__`, `__lua__`. Keep authoring your spritesheet PNG yourself (same convention as the 0.4.1 demo).

Dependencies: none — pure Node, stdlib only. Runs as `node tools/p8-to-js.js input.p8 [output.js]`; with no output argument it writes to stdout.

Test harness: `test-0.4.2.html` + `test-0.4.2-game.js` drive the same bordered-room-with-coins gameplay as 0.4.1, but the map + flags now come from `tests/sample-mapdata.js`, which is generated from `tests/sample.p8` by the converter. Re-run the CLI any time you edit the `.p8` and the page picks up the change on reload.

### 0.4.1 — data-array maps + sprite flags (mget/mset/fget/fset)

Maps now live as a JavaScript array of sprite indices instead of a decoded PNG. Supply `mapData` to `picoJS.run()` as either a 2D nested array (`mapData[y][x]`) or a flat typed / plain array plus `mapWidth`. Image-based maps still work as a fallback when `mapData` isn't provided — existing 0.4.0 games keep running unchanged.

Sprite flags are a 256-entry byte table. Authored up front via `opts.spriteFlags: [..]` or at runtime with `fset(n, f, v)`. Used by `map()`'s new layer filter and by game logic via `fget()`.

```js
picoJS.run({
    sprites:     "sprites.png",
    mapData:     [[1,1,1],[1,0,1],[1,1,1]],   // tiny 3x3 map
    spriteFlags: [0x00, 0x01, 0x02],          // sprite 1 solid, sprite 2 pickup
    init: _init, update: _update, draw: _draw
});
```

New functions — all installed as globals alongside the existing set:

* `mget(x, y)` — sprite number at tile (x, y). Returns `0` for out-of-bounds.
* `mset(x, y, v)` — write a sprite number into a tile. Out-of-bounds silently no-op.
* `fget(n)` — full flag byte (0..255) for sprite n.
* `fget(n, f)` — boolean for bit f (0..7).
* `fset(n, v)` — replace the whole flag byte.
* `fset(n, f, v)` — set or clear bit f.
* `picoJS.setMapData(src, widthHint)` — swap the map at runtime (same accepted shapes as `mapData`).
* `picoJS.mapWidth` / `picoJS.mapHeight` — read-only tile dimensions.

`map()` was rewritten to be data-driven: it iterates the requested tile rect and draws each non-zero sprite individually. Sprite `0` is treated as empty (Pico-8 behaviour — sprite 0 never renders inside a map). When the optional `mlayer` bitmask argument is supplied, a tile is drawn only if `(fget(n) & mlayer) !== 0`, so a single data map cleanly supports multiple render layers (e.g. `map(0,0,0,0,16,16,1)` for walls only, `map(0,0,0,0,16,16,2)` for pickups only). Leaving `mlayer` out draws everything. The old image-based fallback still kicks in when no `mapData` is present and `opts.map: "path.png"` is supplied — gives anyone mid-migration a chance to catch up.

Test harness: `test-0.4.1.html` + `test-0.4.1-game.js` — a 16×16 hand-authored map with wall tiles (flag bit 0 = solid) and coins (flag bit 1 = collectible). Player movement uses `fget(mget(...), 0)` for collision, walking onto a coin clears it via `mset`, `Z` stamps a coin at the current tile, `X` toggles the wall-only layer render. `picoJS-0.4.0.js` + `test-0.4.0.html` remain untouched for anyone mid-port.

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
