# Pico-JS Javascript Game library

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
* BTN
* CLS
* COLOUR / COLOR
* SSPR
* SPR
* MAP

### To Add -

* Mget - get sprite # @ x,y & MSet - set sprite # @ x,y - 0.4.x
* PGet - get pixel colour # @ x,y & PSet - set pixel colour # @ x,y - 0.5.x
* FGet - get sprite # flag & FSet - set sprite # flag - 0.6.x
* ? SGet & SSet
* Camera - if possible
* Pal / Palt -  if possible
* Tables vs arrays - emulate Lua table command in Javascript - if possible
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

