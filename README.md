# SonoLite
### A fork of [sevenc-nanashi](https://github.com/sevenc-nanashi)'s [PotatoFarm](https://github.com/sevenc-nanashi/PotatoFarm).
---
#### Disclaimer
My code is very messy, contains some unoptimized things, and probably contains some quirky bugs.  I'm still working on this project a lot and I'll try to fix as many things as possible.  If you find/fix something please make a pull request (is that what it's called?  I don't know GitHub very well xD).
#### About
SonoLite is a TypeScript web server for the Sonolus rhythm game.  If you use Sonolus to test custom charts, consider using SonoLite.  This project aims to create a user-friendly chart database that can easily run on your personal computer with no extensive setup needed, all for free.
#### Features
SonoLite contains (most) features included in the server linked above, plus many more very vital ones.  The complete feature list is shown below:
 - Server configuration (missing: skins, backgrounds, SFX, particles, and engines)
    - Server configuration also includes a (really bad) "authentication" method to prevent other users on your network from adding/editing/deleting anything.
 - A comprehensive chart list with filtering, pagination, and more.
 - An easy-to-use interface to add your own chart, based on [SweetPotato](https://potato.purplepalette.net)'s layout
 - The ability to edit scores (currently, you can't edit the jacket/bgm/chart data.)
 - [PaletteWorks Editor](https://paletteworks.mkpo.li/edit) embededded directly into the server for quick editing - with a fullscreen option (I'm still working on improving this)
 - [In the app] A somewhat complete level search function
 - [In the app] Using [sevenc-nanashi](https://github.com/sevenc-nanashi)'s [frpt-pjsekai.extended](https://fp.sevenc7c.com/sonolus/engines/frpt-pjsekai.extended) engine

I may have forgotten some; I'll add them ASAP.
#### Running
To run this server for yourself, simply download this repo as a ZIP or clone it.  Also, install the latest version of [Node.js](https://nodejs.org) if you haven't already.  Once this is done, simply run `npm run start` in the directory in which your project resides and it should start.