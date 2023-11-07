Pico-JS Javacscript Game library

For migrating Pico-8 games to JavaScript

To Do

Implemented (partially) -

* _draw
* _update
* _init
* BTN
* CLS
* COLOUR / COLOR
* SSPR
* SPR
* MAP

To Add -

* Mget - get sprite # @ x,y
* MSet - set sprite # @ x,y
* PGet - get pixel colour # @ x,y
* PSet - set pixel colour # @ x,y
* FGet - get sprite # flag
* FSet - set sprite # flag
* ? SGet 
* ? SSet
* Camera - really should implement if possible
* Pal / Palt - really should implement if possible
* Tables vs arrays - emulate Lua table command in Javascript - really should implement if possible
* Music - just play exported
* ? SFX - play exported (able to export?)
* ? Clip
* ? MenuItem

Other Ideas -

* Should do collision - collide(obj1,obj2)
* Should be able to account for bigger spritesheet
* Should add scaling x2,x3,x4 - see systems, scale sprite auto too - 128,256,384,512 ... 1024 could just multiply then any conceivable - but what if wanted to stretch?
* Possible Tile implementation
* Single non-spritesheet sprites - aspr
* Add jump command? gravity, trajectory
* Add bounds to moving sprites?
* Add speed to movement
* CSS Styles - based on Pico & Consoles
