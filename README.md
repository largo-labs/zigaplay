# ZigaPlay

A pocket console for the browser. Its games are cartridges: you choose one from the shelf, it slides in, and you play it with the console's D-pad (or control stick), A, B, SELECT and START. The console was built for iPhone first, and it also works on desktop.

| Cartridge | What it is | Controls |
|---|---|---|
| **Lynties** | A creature RPG: explore the Long Road, beat eight Wardens, and bond with 146 Lynties, starting with Embrit, Shellby or Budrake. | D-pad move · A talk/confirm · B back · START menu · SELECT map |
| **Chip City** | A casino with blackjack, roulette, slots, video poker and hi-lo. It uses play chips only. | D-pad choose · A press · START deal/spin · B back |
| **Gearfist** | A robot beat 'em up: four stages, four bosses, and four robots to buy. | Stick: move, ▲ jump, ▼ guard · A light · B heavy · SELECT burst · START pause |
| **Kettō** | Pixel samurai duels, tournaments, a Fighter Forge and a 20-chapter 3D story. It plays sideways. | Stick: move, ▲ jump, ▼ guard · A light · B heavy · START pause |

Kettō's own source lives in [largo-labs/ketto](https://github.com/largo-labs/ketto). The cartridge here is built from it (see [Updating Kettō](#updating-ketto)).

## This branch: Lynties in 3D

On `lynties-3d`, Lynties draws its world in 3D. It's a toy-like diorama seen from behind and above, with toon-shaded trees, houses, walls and swaying tall grass. You and everyone you meet are small chibi figures, and your trainer wears the look you pick on the title screen. The game itself is unchanged: maps, battles, menus and saves all work as on `main`, and battles keep their pixel art.

- `games/lynties/3d/` holds three.js (r183, MIT). The offline edition packs it inside the page.
- `tools/lynties-3d/` builds the 3D cartridge from the regular game: `python3 tools/lynties-3d/build.py <regular lynties index.html> games/lynties/index.html`. The 3D layer lives in `tools/lynties-3d/src/w3d.js`.
- If WebGL or three.js can't load, the game falls back to its pixel-art world.

## Playing it

There are two ways to play from this repo:

- **The console, online:** serve the repo root over http(s), for example with GitHub Pages, and open `index.html`. Games load from `games/<id>/index.html`, and saves stay in that browser.
  To run it locally, use `python3 -m http.server` in the repo folder. Opening `index.html` straight from disk won't work, because the console fetches each game from the same origin.
- **The offline app:** `app/` is the same console with every game packed into one page, plus a service worker. Host it on any https site, for example GitHub Pages at `…/app/`. Open it once in Safari, then choose Share → Add to Home Screen. After that it opens with no WiFi or cell service. `app/HOW TO INSTALL.txt` has the steps.

The original lives as a Claude artifact. There it also keeps cloud saves, which aren't available when it's hosted elsewhere.

## Layout

```
index.html                  the console (shell, shelf, buttons, input routing, the cartridge contract in a comment above CARTS)
games/<id>/index.html       each cartridge: a full, self-contained HTML document
games/<id>/cart.png         its label art (3:2)
games/ketto/3d/…            three.js and Kettō's 3D story modules. The cartridge carries these inside itself;
                            these copies are only a fallback for the online console.
offline/                    the pixel font that stands in for the web fonts offline, and the Home Screen icons
app/                        the built offline edition (made by tools/build-offline.py)
tools/build-offline.py      builds the offline edition: python3 tools/build-offline.py . OUT
tools/make-icons.py         redraws the Home Screen icons (needs Pillow)
tools/ketto-cart.py         builds games/ketto/index.html from a checkout of largo-labs/ketto
```

## How the console works

- **Cartridges:** each one is listed in `CARTS` near the top of the script in `index.html`. The console fetches the game's file and runs it in an iframe the size of the screen. Before the game's first script runs, the console gives it its own AudioContext, so presses on the console's buttons can start sound.
- **Input:** a game can take the buttons directly by defining `window.ZPCart = { input(btn, isDown) {…} }`. Otherwise it gets keyboard events: arrows, z, x, Enter and Shift.
- **Power switch:** `ZPCart.home()` lets a game save or ask before the power switch turns it off.
- **Game options in `CARTS`:**
  - `stick:true` puts a round control stick in place of the D-pad.
  - `wide:true` gives the game the console's sideways shape. If the phone is upright, the console turns itself a quarter turn.
- **Inside the console:** games detect it with `window.parent.ZIGAPLAY`, and each one still runs fine on its own. Every game prefixes its `localStorage` keys with its own id, because they all share one origin.

The full contract is the comment above `CARTS` in `index.html`.

## Adding a game

1. Put the game in `games/<id>/index.html` as one self-contained HTML file, and add a 3:2 `cart.png` label.
2. Add its entry to `CARTS`, then rebuild the offline edition:

```
python3 tools/build-offline.py . /tmp/out
rm -rf app && cp -r /tmp/out/ZigaPlay-offline app
```

## Updating Kettō

Run this from a checkout of largo-labs/ketto, then rebuild `app/` as above:

```
python3 tools/ketto-cart.py ../ketto games/ketto/index.html
```

The script adds the console layer (button mapping, button hints, sizing, the 3D story packed inside), and that layer only switches on inside the console. It leaves out specials and deflects on the console, for both fighters.

## Credits

Kettō's 3D story uses [three.js](https://threejs.org/) (MIT, see `games/ketto/3d/vendor/three/LICENSE`). The offline pixel font is a subset of GNU Unifont.
