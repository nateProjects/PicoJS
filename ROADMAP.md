# Roadmap

What's implemented, what's planned, and open ideas for picoJS. See [CHANGELOG.md](CHANGELOG.md) for what's already shipped and when.

## Implemented (partially) -

* _draw
* _update
* _init
* BTN / BTNP (i, [p]) — up to 4 local players; p omitted defaults to player 0
* CLS (with optional colour)
* COLOUR / COLOR
* SSPR
* SPR
* MAP (data-array, with image-backed fallback)
* MGET / MSET
* FGET / FSET
* PRINT (real PICO-8 bitmap font by default; picoJS-only "system"/custom-font options; cursor-aware, multi-line via \n)
* CURSOR
* RECT / RECTFILL (dither pattern via FILLP)
* LINE
* CIRC / CIRCFILL (dither pattern via FILLP)
* OVAL / OVALFILL (dither pattern via FILLP)
* PSET / PGET
* CAMERA
* ADD / DEL / DELI / FOREACH / ALL / COUNT
* FLR / SIN / COS / ATAN2 / RND
* MID / MIN / MAX / ABS / CEIL / SGN
* BAND / BOR / BXOR / BNOT / SHL / SHR / LSHR (integer-exact; not fixed-point-exact for fractional operands)
* SUB
* TOSTR / TONUM (no-flags path exact; tostr's hex/no-decimal flags are an approximation)
* PRINTH (console only — no file-output equivalent in a browser)
* TIME / T
* SGET / SSET (+ SGETC, a picoJS-only canvas-decoded variant — not a Pico-8 function)
* PAL / PALT (draw palette only — see roadmap for the screen palette, p=1)
* SRAND (reverse-engineered algorithm, verified against an independent implementation, not against real hardware)
* FILLP
* CHR / ORD
* CARTDATA / DGET / DSET (localStorage-backed)

## Roadmap / To Add -

* Pal(c0, c1, 1) — the "screen" palette (whole-framebuffer remap at flip time); a materially bigger feature than the draw palette (needs a whole-canvas read-back + a lossy RGB->index reverse lookup, or a parallel logical framebuffer threaded through every primitive) — deferred past 1.0
* Tline() — pseudo-3D/mode7-style textured lines — deferred past 1.0
* Music - just play exported?
* ? SFX - play exported?
* ? Clip
* ? MenuItem
* Players 2-3's keyboard defaults (IJKL/numpad) are a picoJS-only convenience — real Pico-8 has no keyboard default beyond player 1, gamepads only

## Other Ideas -

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

## Planned guides (not yet written)

Outline for documentation that doesn't exist yet.

### Game Creation With Pico-JS

This will cover -
* Displaying and moving a sprite with key presses
* Displaying a map / game level
* Setting unmovable areas
* Creating collectable items & scoring
* Creating NPCs & losing conditions
* Adding firing, being fired at mechanic
* Sprite & map creation via Pico-8 or other pixel & tile tools

### Pico-8 To JavaScript Conversion

This will cover -
* Exporting the necessary files
* Running the included conversion script 
* & any manual changes that may need to be made

## Example games to build

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
