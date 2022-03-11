Screen (num, pal, resx, resy, effect)

if screen = 0 is custom
if palette = 0 is custom (will define as needed)
rex & resy are optional if num chosen

1 Pico-8                128x128                     default font & point
2 Pico-8 alternative    64x64 - can be overridden
3 Acorn / BBC           160x256
4 Amstrad CPC           160x200
5 Apple 2               280x192
6 CGA PC                160x100
7 Commodore 64          160x200
8 MSX                   256×192
9 TRS-80 ?              160x192?
10 ZX Spectrum           256×192 
11 Gameboy green        160x144
12 Master               256x192 - no palette
13 NES                  256x260 - no palette
14 Grey screen          ideally 16 colours so will work with almost all - not bright Amstrad tho
15 Green screen
16 Amber screen

Missing -
Atari 2600 / 400 / 800
See - https://dustinpfister.github.io/2020/04/10/canvas-example-game-kaboom-clone/

Why keep duplicates? - because easier to tie to palette & can later add system specific screen effects etc.

Can use one screen dimensions with palette of another, or custom one


Need to add Tic-80 or whatever open source console is chosen, maybe the JS based one too

Pico-8

Index	Color	Hex	RGB	    Name
0		#000000	0, 0, 0	    black
1		#1D2B53	29, 43, 83	dark-blue
2		#7E2553	126, 37, 83	dark-purple
3		#008751	0, 135, 81	dark-green
4		#AB5236	171, 82, 54	brown
5		#5F574F	95, 87, 79	dark-grey
6		#C2C3C7	194, 195, 199	light-grey
7		#FFF1E8	255, 241, 232	white
8		#FF004D	255, 0, 77	red
9		#FFA300	255, 163, 0	orange
10		#FFEC27	255, 236, 39	yellow
11		#00E436	0, 228, 54	green
12		#29ADFF	41, 173, 255	blue
13		#83769C	131, 118, 156	lavender
14		#FF77A8	255, 119, 168	pink
15		#FFCCAA	255, 204, 170	light-peach

Undocumented - (maybe use instead option)
Index	Color	Hex	RGB	    Name
128		#291814	41,24,20	brownish-black
129		#111D35	17,29,53	darker-blue
130		#422136	66,33,54	darker-purple
131		#125359	18,83,89	blue-green
132		#742F29	116,47,41	dark-brown
133		#49333B	73,51,59	darker-grey
134		#A28879	162,136,121	medium-grey
135		#F3EF7D	243,239,125	light-yellow
136		#BE1250	190,18,80	dark-red
137		#FF6C24	255,108,36	dark-orange
138		#A8E72E	168,231,46	lime-green
139		#00B543	0,181,67	medium-green
140		#065AB5	6,90,181	true-blue
141		#754665	117,70,101	mauve
142		#FF6E59	255,110,89	dark-peach
143		#FF9D81	255,157,129	peach

Double check if these are the color numbers from microcomputer basic

ZX Spectrum -

Colour number	Binary value	BRIGHT 0 (approximate RGB)	BRIGHT 1 (RGB)	Colour name
0	000	#000000	#000000	black
1	001	#0000ee	#0000FF	Blue
        #0000d8
2	010	#ee0000	#FF0000	Red
        #d80000
3	011	#ee00ee	#FF00FF	Magenta
        #d800d8
4	100	#00ee00	#00FF00	Green
        #00d800
5	101	#00eeee	#00FFFF	Cyan
        #00d8d8
6	110	#eeee00	#FFFF00	Yellow
        #d8d800
7	111	#eeeeee	#FFFFFF	White
        #d8d8d8

maybe put bright colours above normal ones

Commodore 64

Name of color	RGB Value	Web Colour
Black	0, 0, 0	#000000
White	255, 255, 255	#FFFFFF
Red	136, 0, 0	#880000
Cyan	170, 255, 238	#AAFFEE
Violet / purple	204, 68, 204	#CC44CC
Green	0, 204, 85	#00CC55
Blue	0, 0, 170	#0000AA
Yellow	238, 238, 119	#EEEE77
Orange	221, 136, 85	#DD8855
Brown	102, 68, 0	#664400
Light red	255, 119, 119	#FF7777
Dark grey / grey 1	51, 51, 51	#333333
Grey 2	119, 119, 119	#777777
Light green	170, 255, 102	#AAFF66
Light blue	0, 136, 255	#0088FF
Light grey / grey 3	187, 187, 187	#BBBBBB

Amstrad

Firmware Number	Colour Name	Hexadecimal 	RGB values 
0	Black 	#000000	0/0/0
1	Blue 	#000080	0/0/128
2	Bright Blue 	#0000FF 	0/0/255
3	Red 	#800000	128/0/0
4	Magenta 	#800080	128/0/128
5	Mauve 	#8000FF 	128/0/255
6	Bright Red 	#FF0000	255/0/0
7	Purple 	#FF0080	255/0/128
8	Bright Magenta 	#FF00FF	255/0/255
9	Green 	#008000	0/128/0
10	Cyan 	#008080	0/128/128
11	Sky Blue 	#0080FF	0/128/255
12	Yellow 	#808000	128/128/0
13	White 	#808080	128/128/128
14	Pastel Blue 	#8080FF	128/128/255
15	Orange 	#FF8000	255/128/0
16	Pink 	#FF8080	255/128/128
17	Pastel Magenta 	#FF80FF	255/128/255
18	Bright Green 	#00FF00 	0/255/0
19	Sea Green 	#00FF80	0/255/128
20	Bright Cyan 	#00FFFF 	0/255/255
21	Lime 	#80FF00	128/255/0
22	Pastel Green 	#80FF80	128/255/128
23	Pastel Cyan 	#80FFFF	128/255/255
24	Bright Yellow 	#FFFF00	255/255/0
25	Pastel Yellow 	#FFFF80	255/255/128
26	Bright White 	#FFFFFF	255/255/255

Apple 2

Number — name
0 — black
1 — magenta
2 — dark blue
3 — purple
4 — dark green
5 — grey #1
6 — medium blue
7 — light blue
8 — brown
9 — orange
10 — grey #2
11 — pink
12 — green
13 — yellow
14 — aqua
15 — white

TRS-80

2 x 4 colour palette - split

Acorn Electron / BBC Micro - Mode 2

Foreground  	Background  	Colour
0	128	Black
1	129	Red
2	130	Green
3	131	Yellow
4	132	Blue
5	133	Magenta
6	134	Cyan
7	135	White
8	136	Intensified Black (Grey)
9	137	Intensified Red
10	138	Intensified Green
11	139	Intensified Yellow
12	140	Intensified Blue
13	141	Intensified Magenta
14	142	Intensified Cyan
15	143	Intensified White

MSX

0	#000000	transparent	rgb(0,0,0)
1	#010101	black	rgb(1,1,1)
2	#3eb849	medium green	rgb(62,184,73)
3	#74d07d	light green	rgb(116,208,125)
4	#5955e0	dark blue	rgb(89,85,224)
5	#8076f1	light blue	rgb(128,118,241)
6	#b95e51	dark red	rgb(185,94,81)
7	#65dbef	cyan	rgb(101,219,239)
8	#db6559	medium red	rgb(219,101,89)
9	#ff897d	light red	rgb(255,137,125)
10	#ccc35e	dark yellow	rgb(204,195,94)
11	#ded087	light yellow	rgb(222,208,135)
12	#3aa241	dark green	rgb(58,162,65)
13	#b766b5	magenta	rgb(183,102,181)
14	#cccccc	gray	rgb(204,204,204)
15	#ffffff	white	rgb(255,255,255)

Gameboy B&W (green etc.)

https://www.color-hex.com/color-palette/45299

Color	Hex	RGB
#9bbc0f	(155,188,15)
#8bac0f	(139,172,15)
#306230	(48,98,48)
#0f380f	(15,56,15)
#0f380f	(15,56,15)

Need to test if someone references color number above colors in palette
Could have coor equivalency chart -
good = quickly switch between styles
bad = what about original color numbers? (may not matter if it knows how to intepret - this model with this other palette should use this color)

Maybe at least do for Amstrad bright colors & maybe grey/green/amber scale

OR

	Darkest Green
Hex: #0f380f
RGB: 15, 56, 15
    Dark Green
Hex: #306230
RGB: 48, 98, 48
    Light Green
Hex: #8bac0f
RGB: 139, 172, 15
    Lightest Green
Hex: #9bbc0f
RGB: 155, 188, 15

CGA

Green Screen -

maybe - https://icolorpalette.com/color/26fa03 (or sub-section)

See - https://retrocomputing.stackexchange.com/questions/12835/exactly-what-color-was-the-text-on-monochrome-terminals-with-green-on-black-and


Put all in an array - shift number relative to palette chosen

16x10 = 160