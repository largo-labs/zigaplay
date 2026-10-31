# ZigaPlay

A pocket console for the browser. Its games are cartridges: you choose one from the shelf, it slides in, and you play it with the console's D-pad (or control stick), A, B, SELECT and START. The console was built for iPhone first, and it also works on desktop.

| Cartridge | What it is | Controls |
|---|---|---|
| **Lynties** | A creature RPG in 3D: explore the Long Road, beat eight Wardens, keep up with your rival Remy, and bond with 166 Lynties, starting with Embrit, Shellby or Budrake. | D-pad move · A talk/confirm · B back · START menu · SELECT map |
| **Chip City** | A casino with blackjack, roulette, slots, video poker, hi-lo, Rocket (cash out before it blows up) and The Track (horse racing), plus Downtown: buildings to buy that earn chips while you're away. It uses play chips only. | D-pad choose · A press · START deal/spin · B back |
| **Gearfist** | A robot beat 'em up: four stages, four bosses, and four robots to buy. Every blow slides you in to meet the robot in front, and a launch can be chased into the air. | Stick: move, ▲ jump, ▼ guard · A light · B heavy · SELECT burst · START pause |
| **Strike at Night** | Strike at Night's story played in Spellsteel's engine. Lift dies in 2026 and wakes as a farm boy in Larkfield, framed for his new parents' murder. The hooded man's knife turns out to be spellsteel, so you reshape it at any anvil; beating Garrick and Sir Kell gives Lift their powers as new Specials. Shared-CP battles, wishes for 19 more heroes, quests, 200+ outfits. Chapters 1 and 2. Played sideways. | D-pad move · A talk/confirm · B back (hold to run) · START menu |
| **Drone Strike** | A strategy game about leading a small country's drone unit against an invasion. Choose which drones fly in each three-wave strike, research new ones, and outthink five enemy generals who adapt to your tactics. | D-pad choose · ◀ ▶ amounts · A confirm · B back |
| **Pitchfork Rising** | Lead a peasant revolt in twelve real-time battles, from the village tithe barn to the king's palace. Between battles you arm your folk, buy traps and pick a scheme; in battle you place your squads and traps, then fight on the field as Wat, their leader. Played sideways. | Stick move · A strike · B roll · SELECT orders · START pause |

## Lynties in 3D

Lynties draws its world in 3D: a little diorama seen from behind and above, with smooth-lit trees, houses, cliffs, walls and swaying tall grass. You and everyone you meet are small chibi figures, and every house in every town can be entered, with people inside to talk to. A new game opens with a cutscene: Prof. Wren explains Lynties with one of his own beside him, then asks what you look like, your name and your rival's name. The Lynties themselves keep their pixel art, and so do battles, where your trainer steps in to throw each charm.

- `games/lynties/3d/` holds three.js (r183, MIT). The offline edition packs it inside the page.
- The game itself lives in `tools/lynties-3d/lynties-2d.html`: maps, battles, menus, story and saves. That file also plays on its own as the classic pixel-art version.
- `tools/lynties-3d/src/w3d.js` is the 3D world. `tools/lynties-3d/build.py` adds it to the game to make the cartridge: `python3 tools/lynties-3d/build.py tools/lynties-3d/lynties-2d.html games/lynties/index.html`.
- If WebGL or three.js can't load, the cartridge falls back to the pixel-art world.
- Every Warden Hall sits behind a labyrinth with three trainers standing right on the way through, so each one has to be beaten; a beaten trainer steps into the nook beside it.
- Lynties #147 to #166 are the newer ones: six lines (otters, frogs, hedgehogs, penguins, moths and raccoons) and two loners that never evolve (Chestle, found only in caves, and Moonhare).

## Drone Strike

The Dominion of Korgath has invaded the small Republic of Varna. You name and command Varna's drone unit through five fronts, each against a different enemy general.

- **A battle** starts with a briefing (targets, air defense, jamming, enemy drones), then a loadout limited by launch slots and your drone stock. The strike flies in up to three waves. Before each one you choose how many of each drone to send, the order the groups fly in, and what to aim at first. Each group then crosses the map from left to right: decoys draw fire, recon reveals hidden units, and strikers dive onto their targets. A report after each wave waits for you to continue.
- **The first mission is a hands-on tutorial**: short prompts show you what to press as you go.
- **Eleven drones**, from cheap FPVs to the Heavy UCAV, each strong against different targets: troops, armor, artillery, supply lines, buildings, air defense, jammers and ships. Some are one-way; others come home if they survive.
- **Funds** buy drones and research; **prestige** raises your rank, which opens research tiers and foreign aid. Enemy generals adapt when you lean too hard on one drone.
- The game is built from `tools/dronestrike/src/`: `python3 tools/dronestrike/build.py` writes `games/dronestrike/index.html`, and `tools/dronestrike/make-cart.js` redraws its label.

## Pitchfork Rising

A corrupt lord is emptying Ashby's tithe barn, and Wat Tyler picks up a cudgel. Twelve battles in four acts take the revolt from the village manor, past the Earl's sheriff and the Earl himself, to the king's palace yard, and then you choose what replaces the crown.

- **Learning by playing:** there is no manual. The first battle starts within seconds, and short tips appear one at a time as each thing becomes useful (move, strike, shout orders, roll, light the hay). New weapons, traps and plans arrive one or two at a time after each victory, each on its own card, and camp grows a new button when there is something new to use.
- **Before each battle (camp):** spend plunder to arm unarmed folk (pitchforks, slings, scythes, flails, bows, firebrands, pikes, crossbows), buy traps (stake pits, snares, caltrops, hay & pitch, beehives, deadfalls, barricades), pick one scheme (spike the ale, ring the bell, spread rumours, night attack and more) and improve Wat.
- **Deployment:** squads start in the green area; traps can go anywhere that isn't right on top of the enemy. Everything is placed for you to start with, so START is always ready.
- **Battle:** you play Wat on the field. A strikes, B rolls, SELECT shouts HOLD / CHARGE / FOLLOW ME to every squad. Folk hidden in wheat or brush strike for double damage; folk near Wat hit harder and never run; fire spreads through wheat; pikes break cavalry charges; nobles only really fear Wat's own blade.
- **Winning and losing:** each battle has its own goal (rout them, survive till dawn, defeat the boss, burn the tax rolls, escort a cart). You lose if Wat falls, if your whole band falls, or if what you protect is destroyed, and then you try that battle again from camp.
- Built from `tools/pitchfork/src/` with `python3 tools/pitchfork/build.py`, which writes `games/pitchfork/index.html`. `tools/pitchfork/make-cart.js` redraws its label.

## Strike at Night

Strike at Night's story, rebuilt on Spellsteel's engine. It starts on a city street in October 2026: Lift walks home from a late shift and never sees the car. He wakes up in Larkfield as a sixteen-year-old farm boy, spends one quiet day there, and that night a hooded man leaves his parents dead and a knife at his feet. Chapter 1 is three months later, with the Crows (Rook, Jun, Moss) and the Baron's tax wagon; Chapter 2 is the road to Greyford and its tollhouse.

- **One body, yours to dress:** the wash basin on the first morning opens the full Spellsteel wardrobe (the face in the water is whoever you make it). After that it is in the START menu under Style.
- **The knife is spellsteel:** Wick, the Crows' fence, spots it at the camp anvil. From then on it reshapes into any of the ten weapon kinds, part by part, and anvils reforge it with ore and infuse it with the elements Lift has learned (Electro, Dendro, Pyro, Geo, Cryo, one per story beat).
- **Taking powers:** beating Garrick the Hound gives Lift his speed and the Hunt special; beating Sir Kell gives him Kell's weight and Iron Wall. Garrick's nose also finds the hooded man's trail in Greyford.
- **A different face:** Greyford's gate guard knows the face from the posters. Put on a hood, a helm or a mask and he waves you through.
- **Spellsteel's systems:** shared CP, Ults, elements and reactions, a party of three, gems from foes and quests, wishes for 19 heroes, the best-heroes list, charms and the tailors.
- **Night:** Larkfield at sundown and by night, the camp, and Hangman's Bend are drawn dark, with firelight, lit windows and lanterns; fights at night happen under the same sky.
- Built from `tools/nightsteel/src/` with `python3 tools/nightsteel/build.py`, which writes `games/nightsteel/index.html`.

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
tools/dronestrike/          Drone Strike's source (src/*.js), its build script and label maker
tools/pitchfork/            Pitchfork Rising's source (src/*.js), its build script and label maker
tools/nightsteel/           Strike at Night: its source (src/*.js and the page shell, on Spellsteel's engine), build script and label maker
```

## How the console works

- **Cartridges:** each one is listed in `CARTS` near the top of the script in `index.html`. The console fetches the game's file and runs it in an iframe the size of the screen. Before the game's first script runs, the console gives it its own AudioContext, so presses on the console's buttons can start sound.
- **Input:** a game can take the buttons directly by defining `window.ZPCart = { input(btn, isDown) {…} }`. Otherwise it gets keyboard events: arrows, z, x, Enter and Shift.
- **Power switch:** `ZPCart.home()` lets a game save or ask before the power switch turns it off.
- **Game options in `CARTS`:**
  - `stick:true` puts a round control stick in place of the D-pad.
  - `wide:true` gives the game the console's sideways shape. If the phone is upright, the console turns itself a quarter turn.
  - `face4:true` gives the game four face buttons in a diamond (A, B, C, D).
  - `skin:'<id>'` names the console skin the game wears when the player picks *Match the game*.
- **Home screen and Library:** the shelf shows the games on the home screen, then a LIBRARY tile. Press EDIT (or START) on the home screen and choose a game to send it to the Library; in the Library, EDIT puts a game back. Games play from either place. A cart with `lib:true` starts out in the Library, and after that each player's own arrangement is kept (inside Claude it's also kept in their account, with the skin).
- **Skins:** SELECT on the shelf opens the skin picker. Some skins move (aurora, galaxy and others), and each game can bring its own.
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

## Keyboard controls

On the ZigaPlay home screen, the **KEYS** button (or the K key) opens a list of every console button with two keys each. Pick a row, press A or Enter, then press the key you want. A key already in use moves over to the new button, Backspace clears a slot, and "Reset to defaults" brings the originals back. The choices are saved in the browser (`zigaplay-keys`) and apply to every game on the console. Games can read the current keys from `ZIGAPLAY.keys`; Gearfist's PC controls screen does.

