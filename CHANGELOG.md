# Changelog

### 1.0.0 — file consolidation, and calling it done

The version number is really the only thing that changed here — every feature in this release shipped incrementally as 0.4.0 through 0.4.16 below, each verified as it landed (many directly against `games/picodiver/`, a complete hand-port of a real, previously-shipped Pico-8 cart, rather than only synthetic test harnesses). 1.0 just marks the point where that felt sufficiently complete and stable to call a release, and does the housekeeping that comes with saying so:

* **Single canonical `picoJS.js`.** Every 0.4.x version used to ship as its own coexisting full-file copy (`picoJS-0.4.1.js` through `picoJS-0.4.16.js`, 14 parallel files sitting in the repo). As of this release there's just `picoJS.js`, continuously updated in place — version history lives here and in git tags, not as parallel files. If you need an old version's exact behaviour, check it out via git.
* **Docs split up.** This changelog and [ROADMAP.md](ROADMAP.md) (implemented/planned/open ideas) used to live inline in Readme.md, which had grown into one very long scroll. They're separate files now; Readme.md is just the landing page.
* **Test harnesses archived.** `test-0.4.3/4/8/9.html` (+ their `-game.js` pairs) moved into `old/` alongside the rest of the project's historical test harnesses, since they were pinned to specific now-deleted version files. `games/picodiver/` remains the actively-maintained example and the thing to check when verifying a change against a real port.

Not attempted for 1.0, deliberately: `pal(c0, c1, 1)` (the screen palette — a materially bigger feature, see the 0.4.9 entry below) and `tline()`. Both remain on [ROADMAP.md](ROADMAP.md). `clip()` was considered and left out too — genuinely useful for UI polish, but secondary to gameplay logic, and nothing currently in the project needs it.

### 0.4.16 — sset, chr/ord, and real persistence via cartdata/dget/dset

Three more items off the "what's left before 1.0" list.

**`sset(x, y, [col])`** completes the `sget`/`sset` pair — `sget` has existed since 0.4.4 but had no write side until now. Writes straight into the same `spriteDataArr` that `sget()` and `spr()`/`map()`'s `pal()`/`palt()` composite read, marking that composite dirty so an edit shows up on the next draw. Deliberately does *not* touch `sgetc()`'s separate canvas-decoded data — `sgetc()` exists specifically to show what the loaded image's actual pixels are, so an in-memory-only edit correctly stays invisible to it. Verified directly: `sset(1,0,3)` changes exactly that pixel's `sget()` reading, leaves neighbouring pixels untouched, and `sgetc()` at the same coordinate stays unaffected.

**`chr(num, ...)` / `ord(str, [index])`** — trivial character/code conversion, `chr()` variadic (concatenates each argument, matching newer Pico-8 versions).

**`cartdata(id)` + `dget(index)` / `dset(index, value)`** — 64 slots of persistent 32-bit signed integers, `localStorage`-backed and namespaced by `id`, the same per-cart-save-file convention Pico-8 itself uses. This is the highest-value item of the three — it's what actually makes a ported game *shippable* (a persistent high score survives a reload, rather than resetting every time). `dget()`/`dset()` always work against an in-memory copy regardless of whether `cartdata()` was ever called — never a silent no-op if a game forgets to call it — but nothing persists across a reload until `cartdata(id)` has actually run and confirmed `localStorage` is genuinely usable, reflected in the new `picoJS.cartdataReady`. Matching real Pico-8, only one `cartdata()` call is honoured per run; a second call is rejected with a warning rather than silently switching save slots underneath already-loaded data.

Verified end-to-end, including the part that actually matters: called `cartdata()`, wrote a value via `dset()`, reloaded the page (a real navigation, not just resetting in-memory state), called `cartdata()` again, and confirmed the value came back from `localStorage` rather than resetting to 0.

Explicitly deferred (see roadmap): `pal(c0, c1, 1)` (the screen palette) and `tline()` — both bigger, more speculative features kept out of the 1.0 push in favor of these three higher-value, lower-risk additions. `clip()` remains an open call — genuinely useful for UI polish (wipes, minimaps, health-bar masking) but secondary to gameplay logic, so it's still on the table for 1.0 but not committed yet.

### 0.4.15 — fillp(pattern): dither fill patterns

The last of a four-stage "medium effort" batch (0.4.12-0.4.15) — see those entries below for `srand`, multiplayer `btn`/`btnp`, and `cursor()`/`print()`.

```js
fillp(0b1010010110100101)          // a 4x4 dither pattern
rectfill(0, 0, 20, 20, 0x1c)       // low nibble (0xc) = "off" colour, high nibble (0x1) = "on" colour
rectfill(0, 0, 20, 20, 8)          // colour <= 15: "on" pixels are just transparent (a simple stipple)
fillp(pattern + 0.5)               // Pico-8's own 0x0.8 flag: "on" pixels always transparent, secondary colour or not
fillp()                            // back to a solid fill
```

Applies to `rectfill()`/`circfill()`/`ovalfill()` only — never the outline forms (`rect`/`circ`/`oval`), since dithering is inherently a fill concept. Bit layout matches the PICO-8 manual precisely: bit 15 is the tile's top-left pixel, bit 0 is bottom-right, raster order — verified pixel-exactly (not just visually) with a single-bit pattern (`0x8000`) and checking that exactly the expected pixels across multiple repeated 4x4 tiles read as background rather than fill colour.

Canvas has no built-in per-pixel alternating-colour fill, so a non-zero pattern switches the three fill routines over to a per-pixel loop checking each pixel's `(x mod 4, y mod 4)` tile cell instead of a single `fillRect()`; `fillPattern === 0` (the default) keeps the original single-`fillRect` fast path untouched, so existing code not using `fillp()` pays no cost for this existing.

Verified directly: the solid-fill case is pixel-identical to before (regression check), the single-bit pattern correctly tiles every 4 pixels in both directions, the two-colour encoding (`0x1c` → dark-blue/blue) resolves both nibbles correctly, the transparency flag correctly overrides a given secondary colour, and `circfill()`/`ovalfill()` both show the same dithering behaviour as `rectfill()` (checked via colour-population counts inside their bounding boxes, before/after enabling the pattern).

### 0.4.14 — cursor(x, y, [col]) + print() argument-count overloading

`print()` previously only branched on `undefined`, which doesn't match how real Pico-8 actually overloads it — `print(str, col)` (2 arguments) is colour-only, still cursor-positioned, distinct from `print(str, x, y)` (3 arguments, position with the current colour). Implemented by checking `arguments.length` directly rather than inspecting which arguments are `undefined`:

```js
cursor(10, 20)     // set the position (and, optionally, colour) print() will use next
print("score:")    // cursor-positioned — draws at (10, 20)
print(score)       // draws right below it — every print() call advances the cursor
print("a\nb\nc", 40, 40, 7)   // embedded \n splits into 3 lines, each one line-height apart
```

Every `print()` call — cursor-positioned or fully explicit — now advances the cursor to just below whatever it drew, matching real Pico-8's console-like "keeps writing where it left off" behaviour, so an explicitly-positioned `print()` followed by a bare `print(str)` continues directly underneath. Embedded `"\n"` breaks a single `print()` call into multiple lines, each advancing by the active font's line height (`fontDef.cellH`, or a flat 6 for the `"system"` fallback font) and resetting back to that call's own starting x — not the cursor's x, so a `\n`-containing string passed to an explicitly-positioned call behaves correctly too.

This only changes behaviour for 1-2 argument `print()` calls, which previously just drew at `(undefined, undefined)` (effectively broken/unused) — existing `print(str, x, y, [col], [font])` calls (3+ arguments) are unaffected. Verified pixel-exactly in a real browser: cursor advancement between successive bare `print()` calls, the 2-arg colour form landing at the cursor position, three-line `\n` splitting at the correct y-offsets, and an explicitly-positioned call correctly advancing the cursor for a following bare call.

### 0.4.13 — btn(i, p) / btnp(i, p): up to 4 local players

```js
btn(1)      // player 0's right button (unchanged — p defaults to 0)
btn(1, 1)   // player 1's right button
btn()       // bitfield of every button player 0 is holding (now correctly implemented — see below)
```

Players 0-1 use real Pico-8's own documented keyboard defaults (P0: arrow keys, Z/C/N for O, X/V/M for X; P1: S/F/E/D for direction, shift for O, tab for X). Players 2-3 have no real Pico-8 keyboard default at all — real Pico-8 requires an actual gamepad for players beyond index 1 — so picoJS invents a reasonable convenience default for them instead (P2: IJKL + comma/period; P3: a numpad cluster), clearly flagged as picoJS-only. Every player's bindings are remappable via the new `picoJS.setPlayerKeys(p, { left, right, up, down, o, x })`, which accepts either a single key or an array of aliases per action and only touches the actions you actually pass.

`btn()`/`btnp()` called with no button index now correctly return a bitfield of every currently-held button for that player, matching real Pico-8's own no-args form — previously this just fell through to `false`, a pre-existing gap fixed in passing while this code was already being restructured for multiplayer. Existing single-argument `btn(i)`/`btnp(i)` calls are completely unaffected, since `p` simply defaults to 0 — the same player the old single-player implementation always drove.

Verified directly in a browser: simultaneous, independent key state across all 4 players (pressing player 0 and player 2's controls at once and confirming no cross-talk), `btnp()`'s just-pressed edge firing independently per player, the bitfield form's bit values, and `setPlayerKeys()` correctly replacing one binding while leaving a player's other bindings untouched.

### 0.4.12 — srand(seed): a real, seedable, replayable RNG

`rnd()` could never be made deterministic before this — `Math.random()` can't be seeded. `srand(seed)` switches `rnd()` over to a from-scratch seeded generator instead:

```js
srand(12345)   // rnd() is now deterministic and replayable from here
print(rnd(10)) // same seed -> same sequence, every time
```

Real Pico-8's actual RNG algorithm isn't officially documented by Lexaloffle. This implements a community-reverse-engineered version — two 32-bit fixed-point state words (`hi`/`lo`), rotated and added on every call, reduced mod `n` — sourced from a PICO-8-in-PICO-8 reimplementation posted on the Lexaloffle BBS (found by reading the raw forum HTML directly rather than trusting an AI-paraphrased summary of it, after an initial paraphrase turned out to have gotten a constant wrong). All arithmetic runs on raw ×65536 fixed-point 32-bit integers (via `|0`), since the algorithm's bitwise steps only produce the right answer operating on Pico-8's actual fixed-point representation, not on plain JS floats — including a Lua-style modulo helper, since Lua's `%` (sign follows the divisor) disagrees with JS's native `%` (sign follows the dividend) whenever the dividend is negative, which happens constantly in this algorithm.

Cross-checked against an independent Python port of the same formula — identical output sequences for every seed/`n` combination tried. **Not** verified against a real running Pico-8, since none was available to check against here — so this should be read as "closely replicates the documented reverse-engineered algorithm," not "guaranteed bit-identical to the real thing."

`rnd()` only switches to the seeded generator once `srand()` has actually been called — until then it's untouched (`Math.random()`, exactly as before), so no existing game's randomness changes underneath it just by upgrading.

### 0.4.11 — sub / tostr / tonum / printh / time+t

The second "trivial but commonly hit" batch — strings and misc, following straight on from 0.4.10's math helpers.

```js
sub("hello", 1, 3)     // "hel" — 1-based, inclusive, clamped (not Lua's negative-from-end indexing)
tostr(score)           // "42" — the common no-flags path
tonum("42")            // 42; tonum("nope") -> undefined (this library's nil)
printh("debug: " .. x) // -> console.log
t()                    // real seconds elapsed since picoJS.run() started
```

* **`sub(str, i, [j])`** — 1-based and inclusive on both ends, matching Pico-8's own `sub()` (not Lua's `string.sub`, which supports negative indices counting from the end — Pico-8's doesn't either, so neither does this). Out-of-range `i`/`j` are clamped rather than erroring; `j` defaults to the end of the string.
* **`tostr(val, [flags])` / `tonum(val)`** — the common no-flags path (numbers/strings/booleans → string, and back) is exact and is what score/HUD code actually uses. `tostr`'s flags (`0x1` hex, `0x2` drop the fractional part) are a reasonable approximation of Pico-8's real 16.16 fixed-point formatting, not byte-identical to it — consistent with this library's existing stance elsewhere (`flr` is plain `Math.floor`, the bitwise ops in 0.4.10 aren't fixed-point-exact either). `tonum()` returns `undefined` — this library's stand-in for Lua `nil` — for anything that doesn't parse, and leans on JS's `Number()` already handling hex/decimal/negative forms natively.
* **`printh(str)`** — straight to the devtools console. Pico-8's file-output arguments (desktop-only) have no browser equivalent and are ignored rather than approximated.
* **`time()` / `t()`** — real wall-clock seconds since `picoJS.run()` started (a `startTimeMs` reference point captured at the top of `run()`), not a frame-count derivation — matches Pico-8's own "seconds since the cart booted" semantics, including continuing to advance correctly even if `_update`/`_draw` ticks get throttled or dropped.

Verified with 23 direct assertions for `sub`/`tostr`/`tonum`/`printh`, plus a real-browser check for `time()`/`t()` specifically (the one function here that depends on `run()`'s lifecycle rather than being pure): measured `t()` immediately after `run()` and again after a real ~1.5s wait — the delta matched to within 30ms, confirming it tracks actual elapsed time rather than frame count.

### 0.4.10 — math helpers: mid/min/max/abs/ceil/sgn + bitwise ops

None of these existed as globals before — real carts call them bare constantly (`mid()` especially, for clamping: `x = mid(0, x, 127)`), and Pico-8's Lua dialect predates native bitwise operators, so `band`/`bor`/`bxor`/`bnot`/`shl`/`shr`/`lshr` are ordinary function calls rather than `&`/`|`/`^`/`~`/`<<`/`>>`.

```js
x = mid(0, x, 127);   // clamp — the single most common use of any of these
band(flags, 0x04)     // flag check
```

Two things worth knowing, both are deliberate, bounded approximations rather than oversights:

* **`sgn(0)` is `1`, not `0`** — a genuine Pico-8 quirk (unlike `Math.sign`, which returns `0` for zero). Only negative numbers return `-1`.
* **Bitwise ops treat operands as plain 32-bit integers** (via `|0`), not Pico-8's actual 16.16 fixed-point representation. This is exact for whole-number operands — the overwhelming majority of real usage (flags, bit-packing) — but won't be fixed-point-exact for fractional inputs. Consistent with the rest of picoJS not modelling Pico-8's fixed-point number system anywhere else either (`flr` is plain `Math.floor`, etc.).

`mid(a, b, c)` uses the classic branchless median formula (`max(min(a,b), min(max(a,b), c))`), not a sort. `shr` is arithmetic (sign-preserving, matches JS `>>`); `lshr` is logical (zero-fill, matches JS `>>>`). All installed as globals alongside `flr`/`sin`/`cos`/`atan2`/`rnd`.

Verified with direct assertions (21 cases covering every function, including the `sgn(0)` quirk, negative-number `ceil`/`shr`, and an `lshr(-1, 28) === 15` unsigned-shift check) rather than a browser harness — pure math with no canvas/DOM involvement, so a fast, exhaustive check made more sense than a visual test page for this one.

### 0.4.9 — pal(c0, c1, [p]) / palt(c, t), plus real sprite transparency

Draw-time colour remapping and sprite transparency, applied consistently across every drawing primitive and sprites/`map()` alike — matching real Pico-8, where `pal()` affects the whole draw pipeline, not just `spr()`. Only the default draw palette (`p` omitted or `0`) is implemented; `pal(c0, c1, 1)` (the "screen" palette, a whole-framebuffer remap applied at flip time — a materially different mechanism) logs a one-time warning and no-ops, left on the roadmap.

```js
pal(2, 12);      // remap colour 2 -> 12 for every subsequent draw (primitives AND sprites)
palt(10, true);  // colour 10 also draws as transparent on sprites, alongside the default (colour 0)
pal();           // reset the draw palette to identity
palt();          // reset transparency to just colour 0
```

**Side effect this made necessary, and a real default-behaviour change:** sprites now actually support transparency. Before 0.4.9, `spr()`/`sspr()`/`map()` drew straight from the loaded spritesheet PNG via `drawImage()` — no alpha channel anywhere, so every sprite rendered as a fully opaque rectangle, background colour included. `palt()` has nothing to control without transparency existing at all, so this version adds real Pico-8 default behaviour: colour 0 is transparent on sprites unless `palt()` says otherwise. Any existing picoJS game gets this automatically — sprites now composite correctly over whatever's drawn behind them instead of drawing a solid box. Confirmed directly against `games/picodiver/`: the ocean/ship graphics were previously a solid opaque block; sprites now show their actual silhouettes.

**Mechanism.** Primitives (`rect`, `circ`, `line`, `pset`, `print`, `cls`, `colour()`) already funnel every numeric colour argument through the internal `resolveColour()` — that now checks the draw-palette remap first, so `pal()` covers them for free. Sprites can't be remapped that way (`drawImage()` has no per-pixel recolour hook), so instead the whole spritesheet gets recomposited into an offscreen canvas whenever `pal()`/`palt()` actually change something — reusing the same indexed pixel data `sget()`/`sgetc()` already extract (0.4.6/0.4.7), so no new decoding work was needed, just a new consumer of data already being maintained. `spr()`/`map()` draw from that composited canvas instead of the raw image; `sspr()` called directly with an explicit image argument is untouched, since it draws arbitrary caller-supplied images, not necessarily indexed sprite data. Degrades the same way `sget()` already does: falls back to the pre-0.4.9 raw/opaque rendering (with a one-time warning) if no indexed data is available at all — no `opts.spriteData` and a tainted canvas. `picoJS.paletteReady` mirrors `sgetReady`/`sgetcReady` for this path.

Verified pixel-exactly, not just visually: sampled `getImageData()` before/after `pal(9,12)` on a 3-colour test sprite and confirmed exactly the original orange pixel count reappeared as blue with the yellow pixel count untouched; same for `palt(10,true)` revealing exactly the expected count of background pixels; combined and reset states matched precisely too. Then confirmed against the real cart: `games/picodiver/`'s title-screen `pal(2,12)` turns the placeholder dark-purple ocean tiles genuinely blue, and forcing a dolphin/shark to spawn in arcade (hard) mode and sampling its rendered pixels confirmed `pal(12,6)`'s grey-shark recolour is actually present on screen, not just theoretically wired up.

Test harness: `test-0.4.9.html` + `test-0.4.9-game.js` — a 3-colour sprite (colours 0/9/10 only) drawn over a striped background so transparency is obvious at a glance, cycling through default → `pal(9,12)` → `palt(10,true)` → both combined → back to default, with a `rectfill()` swatch of the same colour index sitting alongside the sprite to prove primitives and sprites remap identically.

`games/picodiver/` re-enables both `pal()` call sites that 0.4.5 had originally shipped as skipped comments — no other game-logic changes were needed. One faithfully-preserved original-cart quirk, flagged rather than silently fixed: the Lua never resets the hard-mode `pal(12,6)` recolour (no matching `pal(12,12)` anywhere, even though `hard` itself gets reset to `false`), so once arcade mode has been played once, the dolphin stays grey even in a later easy-mode game.

### 0.4.8 — real PICO-8 bitmap font for print(), plus custom fonts

`print()` renders with an actual bitmap font by default now — the real PICO-8 4x6 pixel font — instead of the canvas's own anti-aliased system font. This closes the gap 0.4.5 explicitly left open: rendering at a higher resolution (`opts.scale`) made the old canvas-font text less blurry, but it was never going to be pixel-identical to Pico-8, because browsers always anti-alias `fillText()` glyphs at the rasterizer level regardless of size. Drawing pre-authored pixel data instead of asking the browser to rasterize a font sidesteps the problem entirely — verified side by side in `test-0.4.8.html`, where the same string in the bitmap font is visibly crisp block pixels next to the old system font's visibly softer edges.

Font data source: [althonos/embedded-picofont](https://github.com/althonos/embedded-picofont)'s `font.png`, itself derived from Lexaloffle's own PICO-8 font asset released under CC-0. Extracted the 4x6 glyph bitmaps for printable ASCII 32-126 directly from the pixel data (cross-checked by hand against known glyph shapes) and baked them into the library as a compact hex string — no runtime dependency, no image asset needed for the font itself.

```js
print("Hello, Pico-8!", 10, 10, 7)             // default — real PICO-8 pixel font
print("Hello, Pico-8!", 10, 10, 7, "system")   // picoJS-only: opt back into the old canvas font
```

Two picoJS-only extensions beyond Pico-8's own `print()` signature, both purely additive (a 5th argument, so nothing already calling `print()` with 4 args changes behaviour):

* `print(words, x, y, col, "system")` — for anything the bitmap font can't cover. Characters outside printable ASCII 32-126 fall back to `?` in the bitmap font (matching the reference implementation's own convention), so `"system"` is the escape hatch for wider character support.
* `picoJS.registerFont(name, { cellW, cellH, firstCode, glyphs })` + `picoJS.setFont(name)` — install and switch to additional bitmap fonts, yours or someone else's. `glyphs` is a flat hex string, `cellH` rows per character starting at `firstCode`, each row `ceil(cellW / 4)` hex characters (MSB-first) — the same encoding the built-in `"pico8"` font uses internally, so it isn't a special case. `setFont()` changes the default for subsequent `print()` calls; passing a font name as `print()`'s 5th argument overrides it for one call without disturbing the default (`test-0.4.8.html` demonstrates both at once — cycling the default with a button while three explicit-override lines stay fixed). `picoJS.fontInfo(name)` returns `{ cellW, cellH }` for games doing their own text-width math. A custom font only needs glyphs for the characters it'll actually be asked to print — anything else in its registered range renders blank rather than garbage.

Test harness: `test-0.4.8.html` + `test-0.4.8-game.js` — no spritesheet needed, pure text/primitives. Registers an 8x8 custom `"big"` font (proving the mechanism isn't hardcoded to the built-in font's 4x6 cell size) covering just the handful of characters needed to spell "BIG FONT", and a button cycles the active default through `pico8` / `system` / `big` while three fixed-font lines demonstrate the per-call override staying independent of whatever the default is doing.

Not yet covered: PICO-8's extended/"wide" glyph range (128-255, used for icons and CJK-style wide characters) — only printable ASCII 32-126 is in the built-in font for now.

### 0.4.7 — sgetc(x, y): the canvas-decoded spritesheet read, always available

0.4.6 made `sget()` prefer `opts.spriteData` when supplied, falling back to the canvas decode only when it wasn't — meaning once you supplied `spriteData`, there was no way left to ask "what does the actual loaded spritesheet PNG look like right now?" `sgetc(x, y)` is that other read, always available: the canvas-decoded copy (the `getImageData()` technique 0.4.4's `sget()` originally used), built independently every time regardless of whether `opts.spriteData` is also in use.

```js
sget(0, 0)   // Pico-8 colour index from opts.spriteData if supplied, else canvas decode — unchanged from 0.4.6
sgetc(0, 0)  // always the canvas-decoded pixel, regardless of opts.spriteData
```

Why both: with `opts.spriteData` supplied, `sget()` is now guaranteed reliable (no canvas involved, works under `file://`), but it's reading the cart's *authored* data — not necessarily what's actually in the PNG you shipped. `sgetc()` lets you compare the two (catching art that's drifted out of sync with the source cart) or read back a spritesheet that's been redrawn at runtime, neither of which was possible once `spriteData` took over `sget()` entirely.

`sgetc()` degrades exactly the way `sget()`'s canvas path always did: returns `0` for every pixel if the canvas turns out tainted, logging a one-time warning — reworded in this version to say precisely what's affected (`sgetc()` only, vs. both, depending on whether `opts.spriteData` is covering `sget()`). New `picoJS.sgetcReady` getter mirrors `picoJS.sgetReady` for this path; the debug panel gained an `sgetc` status line alongside the existing `sget` one.

Internally, `buildSpriteData()` (the canvas-decode routine) now always runs once the spritesheet image loads, rather than being skipped when `spriteData` was already supplied — the decode is cheap (one `getImageData()` over a ~128×128 image, done once at load), so there's no real cost to keeping both reads available.

### 0.4.6 — opts.spriteData: sget() without a canvas round-trip

`tools/p8-to-js.js` now also parses `__gfx__` (128 rows × 128 hex chars, one nibble per pixel = a Pico-8 colour index) into a `spriteData` array, the same shape and convention as the existing `mapData` — and `picoJS.run()` accepts it directly:

```js
picoJS.run({
    sprites:     "sprites.png",   // still needed — spr()/sspr() draw with it
    mapData:     mapData,
    spriteFlags: spriteFlags,
    spriteData:  spriteData,      // new — feeds sget() directly
    ...
});
```

This closes the real gap behind 0.4.4/0.4.5's `sgetReady`/tainted-canvas warning rather than just working around it. `sget()`'s only previous data source was `buildSpriteData()`: load the spritesheet PNG into an `<img>`, draw it to an offscreen canvas, `getImageData()` it, reverse-map RGB back to a palette index. That `getImageData()` call is exactly what a browser blocks ("taints") when the image came from a bare `file://` page — so pixel-perfect collision only ever worked when the game was served over `http(s)://`. `spriteData` sidesteps the problem instead of accommodating it: since it's parsed straight from the cart's text into a plain array, no image or canvas is ever involved for that path, so `sget()` now works unconditionally — `file://` included.

Wiring: `opts.spriteData` is normalised and installed before the spritesheet image even starts loading; `buildSpriteData()`'s canvas-decode path only runs as a fallback if `spriteData` wasn't supplied (existing 0.4.4/0.4.5 games — image only, no data — are unaffected either way). `sprPixelStatus` in the debug panel reads `ok (data) WxH` when sourced this way, vs. plain `ok WxH` for the canvas-decode path.

Verified against `games/picodiver/`, which now passes its converter-generated `spriteData` — `picoJS.sgetReady` reads `true` and fish-pickup collision works correctly even when the page is opened directly via `file://`, with no server involved at all.

Note `p8-to-js.js` still doesn't emit an actual spritesheet *image* — `spriteData` is pixel-value data for `sget()`, not a drawable asset. `spr()`/`sspr()` still need a real PNG; see `games/picodiver/gfx-to-png.py` for a standalone, pure-stdlib-Python `__gfx__` → PNG extractor (kept separate from this tool since emitting binary image assets is a different job from emitting a JS data module).

### 0.4.5 — frame-rate throttling + render-scale, found while porting PicoDiver

Two fixes that surfaced from actually porting a full cart (see `games/picodiver/`) rather than a synthetic test harness — both change default behaviour, so anything built against `picoJS-0.4.4.js` or earlier is unaffected (those files are untouched; only new work targeting `0.4.5` gets the new defaults).

**Frame-rate throttling.** Every previous version ran `_update`/`_draw` once per `requestAnimationFrame` callback with no throttling — meaning game speed silently tracked the display's refresh rate. On a 60Hz monitor that happened to look plausible; on a 120Hz+ monitor (or a headless browser, which can free-run past 100fps with nothing to sync to) every frame-counted timer — animation, spawn timers, oxygen depletion, movement — fired 2-4x too fast. Vanilla Pico-8 runs `_update()`/`_draw()` at a fixed 30fps unless the cart defines `_update60()` instead; `opts.fps` now defaults to `30` to match, decoupling game logic from the display's actual refresh rate:

```js
picoJS.run({ ...,  fps: 60 });  // for a cart using _update60()
```

Internally, `requestAnimationFrame` still fires every display refresh (so input latency stays low), but a tick (`tickBtnp` + `_update` + `_draw`) only actually runs once `tickIntervalMs` has elapsed. If the browser falls far behind (backgrounded tab, GC pause), the schedule resyncs to *now* instead of firing a burst of catch-up ticks — matching real Pico-8's behaviour of dropping frames under load rather than fast-forwarding. The debug panel's `frame`/`fps` line now also shows the configured target (`fps 30 / target 30`).

**`opts.scale`.** An optional render-resolution multiplier. The canvas's actual backing size becomes `logical size * scale`, with a matching `context.scale(scale, scale)` and `imageSmoothingEnabled = false`, so `print()`'s canvas-font text and every primitive draw at genuine higher resolution instead of being magnified after the fact by a CSS `transform: scale(...)`. CSS scaling just blows up already-anti-aliased low-res pixels — this renders the glyphs at the bigger size in the first place, which looks visibly crisper (though still not identical to Pico-8's bespoke bitmap font — see the "Known limitations" note below). Game code is unaffected either way — it keeps calling `spr(n, 64, 64)` etc. in the same logical 128×128 coordinate space regardless of `opts.scale`; `pget()` internally accounts for the scale factor when translating to device-pixel coordinates. `sget()` needs no such adjustment — it reads a separate, natural-resolution offscreen canvas built directly from the sprite image, independent of the on-screen canvas's scale.

Use `opts.scale` for display upscaling, not a CSS `transform: scale(...)` on the canvas element — `image-rendering: pixelated` reliably keeps a *layout*-size change (width/height, or no scaling at all) crisp, but its interaction with a CSS *transform* is inconsistent enough across browsers that a transform-scaled canvas can still come out blurry even with `pixelated` set. Found the hard way: `test-0.4.8.html` originally used a CSS transform to display its font demo at 4x and looked blurry despite the bitmap font underneath being pixel-correct (confirmed via `getImageData` — the actual canvas contents had exactly two flat colour values, zero blended ones); switching that harness to `opts.scale: 4` and dropping the CSS transform fixed it. `games/picodiver/` was already using `opts.scale` since 0.4.5 and never had this problem.

**`picoJS.sgetReady`.** A boolean getter — `true` once the spritesheet has been decoded into `sget()`'s pixel array, `false` if that hasn't happened yet or the canvas turned out tainted (the classic case: the page was opened via `file://` instead of being served over `http(s)://`). Without this, a tainted canvas makes `sget()` silently return `0` for every pixel forever, so any pixel-perfect collision check just never registers a hit — with no error, no warning, nothing pointing at the cause. Game code can check `picoJS.sgetReady` and put its own message on screen (PicoDiver's title screen now does exactly this) instead of leaving "collision doesn't work" as a silent mystery.

**Known limitation, not fixed here:** `print()`'s text still isn't pixel-identical to Pico-8's actual font — it's the canvas's own small monospace font, which any browser anti-aliases at the glyph level regardless of resolution. `opts.scale` makes it look meaningfully crisper (higher-resolution anti-aliasing reads as sharper) but a truly identical look would need a hand-drawn bitmap font blitted like a sprite instead of `fillText`. Flagged as a real roadmap item, not attempted in this pass.

Test harness: none added standalone for this version — verified directly against the real port in `games/picodiver/`, which exercises both the throttling (visually correct movement speed) and `opts.scale` (crisp HUD text) simultaneously.

### 0.4.4 — sget(x, y)

One new function: per-pixel readback of the loaded spritesheet, needed by any port that does Pico-8-style pixel-perfect collision (e.g. the classic dw817 routine) instead of bounding-box checks.

```js
// dw817-style pixel collision, ported straight from Pico-8 Lua:
if (sget(sh1 + j, sv1 + i) > 0 && sget(sh2 + x, sv2 + y) > 0) {
    return true; // opaque pixels overlap
}
```

`sget(x, y)` returns the Pico-8 colour index (0-15) of spritesheet pixel `(x, y)` in sheet-pixel coordinates (not sprite-number + cell — same coordinate space `sspr()`'s `sx, sy` use). Returns `0` for out-of-bounds coordinates, matching Pico-8.

Implementation: the whole spritesheet is decoded once, right after it loads, via an offscreen canvas + a reverse palette lookup (RGB → Pico-8 index) — the same technique `pget()` already used against the on-screen canvas, now factored into a shared `colourIndexFromRGB()` helper. Every `sget()` call afterward is a plain typed-array read, not a canvas read, so it's cheap to call in a per-pixel double loop. Like `pget()`, extraction is skipped (with a one-time console warning) if the canvas is tainted — serve over `http(s)://` rather than `file://` to enable it. The debug panel's `sget` line reports extraction status (`ok WxH`, `pending`, or `disabled (tainted canvas)`).

Test harness: `test-0.4.4.html` + `test-0.4.4-game.js` — move a player sprite (arrows) onto a static target sprite built from `tests/booty-sprites.png`; the HUD reports bounding-box overlap and true pixel collision separately so you can see them disagree near the sprite's transparent corners, exactly the case pixel-perfect collision exists to handle.

Not yet done: `sset(x, y, c)` (the write-side companion) remains on the roadmap — nothing in the motivating port needed it yet.

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
