# ZigaPlay

A pocket console for the browser. Its games are cartridges: you choose one from the shelf, it slides in, and you play it with the console's D-pad (or control stick), A, B, SELECT and START. The console was built for iPhone first, and it also works on desktop.

| Cartridge | What it is | Controls |
|---|---|---|
| **Lynties** | A creature RPG in 3D: explore the Long Road, beat eight Wardens, keep up with your rival Remy, and bond with 146 Lynties, starting with Embrit, Shellby or Budrake. | D-pad move · A talk/confirm · B back · START menu · SELECT map |
| **Chip City** | A casino with blackjack, roulette, slots, video poker and hi-lo. It uses play chips only. | D-pad choose · A press · START deal/spin · B back |
| **Gearfist** | A robot beat 'em up: four stages, four bosses, and four robots to buy. | Stick: move, ▲ jump, ▼ guard · A light · B heavy · SELECT burst · START pause |
| **Drowned Moon** | *Tides of the Drowned Moon*, a 16-bit style RPG. The moon fell into the sea; Marin can pull the tide out and let it back in, to sail, walk the seabed and solve dungeons. A party of three, turn-based battles, four dungeons and six bosses. | D-pad move · A talk/confirm · B back · START menu · SELECT turn the tide |
| **Pitchfork Rising** | Lead a peasant revolt in twelve real-time battles, from the village tithe barn to the king's palace. Between battles you arm your folk, buy traps and pick a scheme; in battle you place your squads and traps, then fight on the field as Wat, their leader. Played sideways. | Stick move · A strike · B roll · SELECT orders · START pause |

## Lynties in 3D

Lynties draws its world in 3D: a little diorama seen from behind and above, with smooth-lit trees, houses, cliffs, walls and swaying tall grass. You and everyone you meet are small chibi figures, and every house in every town can be entered, with people inside to talk to. A new game opens with a cutscene: Prof. Wren explains Lynties with one of his own beside him, then asks what you look like, your name and your rival's name. The Lynties themselves keep their pixel art, and so do battles, where your trainer steps in to throw each charm.

- `games/lynties/3d/` holds three.js (r183, MIT). The offline edition packs it inside the page.
- The game itself lives in `tools/lynties-3d/lynties-2d.html`: maps, battles, menus, story and saves. That file also plays on its own as the classic pixel-art version.
- `tools/lynties-3d/src/w3d.js` is the 3D world. `tools/lynties-3d/build.py` adds it to the game to make the cartridge: `python3 tools/lynties-3d/build.py tools/lynties-3d/lynties-2d.html games/lynties/index.html`.
- If WebGL or three.js can't load, the cartridge falls back to the pixel-art world.

## Drowned Moon

*Tides of the Drowned Moon*: seven years ago the moon fell into the sea and split the world. The islanders and the Drowned on the seabed each think the others are ghosts. Marin's lantern holds a shard of the moon, so she can turn the tide.

- **The tide is the main mechanic.** At Flood you sail and drift logs float into bridges. At Ebb the shallows and tidal pools are dry ground, and sunken places open. SELECT turns it, on the map and in dungeons.
- **Battles are turn-based, for a party of three** (Marin, Pell the harpooner, Ysolde the moon-singer). The battle tide turns every three rounds, and Marin's *Turn Tide* flips it: water skills hit harder at Flood, moon skills at Ebb, and drowned foes lose their armor at Ebb.
- Towns with shops and inns, gear for each hero, three save slots (in this browser), chiptune music and an ending.
- The game is built from `tools/drownedmoon/src/` (art, maps, story, battle and so on, all in code): `python3 tools/drownedmoon/build.py` writes `games/drownedmoon/index.html`. `tools/drownedmoon/make-cart.js` redraws its label.
- Played on its own on a phone, the game shows its own touch buttons.

## Pitchfork Rising

A corrupt lord is emptying Ashby's tithe barn, and Wat Tyler picks up a cudgel. Twelve battles in four acts take the revolt from the village manor, past the Earl's sheriff and the Earl himself, to the king's palace yard, and then you choose what replaces the crown.

- **Learning by playing:** there is no manual. The first battle starts within seconds, and short tips appear one at a time as each thing becomes useful (move, strike, shout orders, roll, light the hay). New weapons, traps and plans arrive one or two at a time after each victory, each on its own card, and camp grows a new button when there is something new to use.
- **Before each battle (camp):** spend plunder to arm unarmed folk (pitchforks, slings, scythes, flails, bows, firebrands, pikes, crossbows), buy traps (stake pits, snares, caltrops, hay & pitch, beehives, deadfalls, barricades), pick one scheme (spike the ale, ring the bell, spread rumours, night attack and more) and improve Wat.
- **Deployment:** squads start in the green area; traps can go anywhere that isn't right on top of the enemy. Everything is placed for you to start with, so START is always ready.
- **Battle:** you play Wat on the field. A strikes, B rolls, SELECT shouts HOLD / CHARGE / FOLLOW ME to every squad. Folk hidden in wheat or brush strike for double damage; folk near Wat hit harder and never run; fire spreads through wheat; pikes break cavalry charges; nobles only really fear Wat's own blade.
- **Winning and losing:** each battle has its own goal (rout them, survive till dawn, defeat the boss, burn the tax rolls, escort a cart). You lose if Wat falls, if your whole band falls, or if what you protect is destroyed, and then you try that battle again from camp.
- Built from `tools/pitchfork/src/` with `python3 tools/pitchfork/build.py`, which writes `games/pitchfork/index.html`. `tools/pitchfork/make-cart.js` redraws its label.

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
games/lynties/3d/           three.js for Lynties' 3D world (the offline edition packs it inside the page)
offline/                    the pixel font that stands in for the web fonts offline, and the Home Screen icons
app/                        the built offline edition (made by tools/build-offline.py)
tools/build-offline.py      builds the offline edition: python3 tools/build-offline.py . OUT
tools/make-icons.py         redraws the Home Screen icons (needs Pillow)
tools/lynties-3d/           the Lynties game, its 3D world and the script that builds the cartridge
tools/drownedmoon/          Drowned Moon's source (src/*.js) and its build script
tools/pitchfork/            Pitchfork Rising's source (src/*.js), its build script and label maker
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

## Updating Lynties

Edit the game in `tools/lynties-3d/lynties-2d.html`, or the 3D world in `tools/lynties-3d/src/w3d.js`. Then rebuild the cartridge with the command above and rebuild `app/`.

## Adding a game

1. Put the game in `games/<id>/index.html` as one self-contained HTML file, and add a 3:2 `cart.png` label.
2. Add its entry to `CARTS`, then rebuild the offline edition:

```
python3 tools/build-offline.py . /tmp/out
rm -rf app && cp -r /tmp/out/ZigaPlay-offline app
```

## Credits

Lynties' 3D world uses [three.js](https://threejs.org/) (MIT, see `games/lynties/3d/LICENSE`). The offline pixel font is a subset of GNU Unifont.
