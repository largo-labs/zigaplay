# ZigaPlay

A pocket console for the browser. Its games are cartridges: you choose one from the shelf, it slides in, and you play it with the console's D-pad (or control stick), A, B, SELECT and START. The console was built for iPhone first, and it also works on desktop.

| Cartridge | What it is | Controls |
|---|---|---|
| **Lynties** | A creature RPG in 3D: explore the Long Road, beat eight Wardens, keep up with your rival Remy, and bond with 166 Lynties, starting with Embrit, Shellby or Budrake. | D-pad move · A talk/confirm · B back · START menu · SELECT map |
| **Chip City** | A casino with blackjack, roulette, slots, video poker, hi-lo, Rocket (cash out before it blows up) and The Track (horse racing), plus Downtown: buildings to buy that earn chips while you're away. It uses play chips only. | D-pad choose · A press · START deal/spin · B back |
| **Gearfist** | A robot beat 'em up: four stages, four bosses, and four robots to buy. Every blow slides you in to meet the robot in front, and a launch can be chased into the air. | Stick: move, ▲ jump, ▼ guard · A light · B heavy · SELECT burst · START pause |
| **Strike at Night** | A 16-bit style RPG. Lift was a tech worker in 2026 until a car hit him; he wakes up as a farm boy in Larkfield, is framed for his new parents' murder, and lives as a bandit with a price on his head. Beat strong foes to take their power as new forms. Prologue and two chapters. | D-pad move · A talk/confirm · B back · START menu · SELECT change form |
| **Drone Strike** | A strategy game about leading a small country's drone unit against an invasion. Choose which drones fly in each three-wave strike, research new ones, and outthink five enemy generals who adapt to your tactics. | D-pad choose · ◀ ▶ amounts · A confirm · B back |
| **Pitchfork Rising** | Lead a peasant revolt in twelve real-time battles, from the village tithe barn to the king's palace. Between battles you arm your folk, buy traps and pick a scheme; in battle you place your squads and traps, then fight on the field as Wat, their leader. Played sideways. | Stick move · A strike · B roll · SELECT orders · START pause |
| **Spellsteel** | A 32-bit style RPG with active-time battles in the old Final Fantasy way. The Grey is draining the world's colour; win back five Embers with Mira, Bram, Kit and the friends you wish for. Your hero wears any of 200+ pieces in 52 dyes and carries one of 10 weapon kinds shaped part by part. Played sideways. | D-pad move · A talk/confirm · B back (hold to run) · START menu · SELECT pose |

## Lynties in 3D

Lynties draws its world in 3D: a little diorama seen from behind and above, with smooth-lit trees, houses, cliffs, walls and swaying tall grass. You and everyone you meet are small chibi figures, and every house in every town can be entered, with people inside to talk to. A new game opens with a cutscene: Prof. Wren explains Lynties with one of his own beside him, then asks what you look like, your name and your rival's name. The Lynties themselves keep their pixel art, and so do battles, where your trainer steps in to throw each charm.

- `games/lynties/3d/` holds three.js (r183, MIT). The offline edition packs it inside the page.
- The game itself lives in `tools/lynties-3d/lynties-2d.html`: maps, battles, menus, story and saves. That file also plays on its own as the classic pixel-art version.
- `tools/lynties-3d/src/w3d.js` is the 3D world. `tools/lynties-3d/build.py` adds it to the game to make the cartridge: `python3 tools/lynties-3d/build.py tools/lynties-3d/lynties-2d.html games/lynties/index.html`.
- If WebGL or three.js can't load, the cartridge falls back to the pixel-art world.
- Every Warden Hall sits behind a labyrinth with three trainers standing right on the way through, so each one has to be beaten; a beaten trainer steps into the nook beside it.
- Lynties #147 to #166 are the newer ones: six lines (otters, frogs, hedgehogs, penguins, moths and raccoons) and two loners that never evolve (Chestle, found only in caves, and Moonhare).

## Strike at Night

The cartridge with the id `drownedmoon` now holds *Strike at Night*, built on the same engine that used to run *Tides of the Drowned Moon*.

- **The story.** October 2026: Lift walks out of the office at 11:48 PM and steps into a crosswalk. He wakes up in Larkfield as a sixteen-year-old farm boy who is also called Lift, and the hero creator is the face he sees in a basin of water. After one quiet day with his new family, a hooded man kills his parents, says "So you made it", and leaves the knife at his feet. Three months later Lift lives with the Crows, a bandit gang in the Thornwood.
  - *Prologue:* the city street, the day in Larkfield, the night of the knife and the escape.
  - *Chapter 1, Wanted:* the Crows, Jun the thief, the Baron's tax wagon, and Garrick the Hound.
  - *Chapter 2, Greyford:* Moss the woodcutter, the Baron's road, a scent only Hound Form can follow, the tollhouse and Sir Kell.
- **Forms.** When Lift beats a strong enemy he takes its power as a form, which changes his clothes, his special, his Limit ult and which way his stats lean: Drifter (Whirlwind, *Hard Reset*), Hound Form (Hunt, *Pack Run*) and Iron Form (Iron Wall, *Anvil*). Change forms from the Forms menu or with SELECT on the map, never in battle. A form is also a disguise: the Greyford gate guard knows your face.
- **The bounty.** The Wanted Poster in Items shows Lift's face and his bounty, which climbs from 300 to 3,000 coins with a new line for each thing he's wanted for.
- **Battles** are turn-based for up to three: a base attack earns 1 CP for the party, each hero's special costs 2 CP, and tapping a full Limit bar unleashes that hero's ult. Losing offers *Try again* at full health.
- Saves made in the older stories still load and play those stories; they're marked *Old story* in the save list.
- The game is built from `tools/drownedmoon/src/` (art, maps, story and battle, all in code; the new story's files start with `r_`): `python3 tools/drownedmoon/build.py` writes `games/drownedmoon/index.html`. `tools/drownedmoon/make-cart.js` redraws its label from the game's own art.
- Played on its own on a phone, the game shows its own touch buttons.

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

## Spellsteel

The Grey is draining the colour out of the world, Ember by Ember. You are an apprentice smith from Emberwick with a first weapon of spellsteel, the metal that takes whatever shape its bearer wills. Five bosses hold the five Embers; each one you win back brings a region's colour back.

- **Your hero:** 38 hairstyles, 48 hats, 36 tops, 20 bottoms, 16 shoes, 19 things for the back and 25 face extras, plus skin, eyes, brows, mouth, ears and gloves, each in 52 dyes. Their weapon is any of sword, greatsword, katana, dual katana, great axe, warhammer, bow, fists, staff or grimoire, with every part, colour and engraving chosen by you (a staff's gem, a grimoire's cover symbol, words along a blade). The Style menu restyles your own character; everyone else keeps their look.
- **Battle:** each fighter's gauge fills with speed and time waits while you choose. The team shares CP (up to 6): a plain Attack earns 1, a Special costs 2. Each fighter's Ult charges as they fight and take hits. Commands open beside whoever's turn it is, fighters dash across the field to strike, the camera leans in for Specials and Ults, and each foe shows its health underneath.
- **Elements and reactions:** every character fights as Pyro, Cryo, Electro, Dendro or Geo. A hit leaves its element on a foe, and a different element landing next sets off a reaction (Melt, Overload, Burning, Superconduct, Shatter, Quicken, Crystallize, Petrify and more).
- **Party and wishes:** three fight at a time (front, middle, back; the front draws the most attacks). A Tank, a Healer and a DPS together get a bonus, and named pairs share bonds. Defeating foes and finishing quests earns gems; every 100 gems is a wish for one of 19 heroes (★5 6% of the time, certain within 30 wishes; a repeat gives 50 gems back). Wish → Best heroes ranks every Tank, Healer and DPS from S to B.
- **Quests** (in the START menu): the story's five Embers, finding your companions, bounties on each kind of foe, and deeds like reactions, wishes, battles won, chests and reforging, each paying gems.
- Built from `tools/spellsteel/src/` with `python3 tools/spellsteel/build.py`, which writes `games/spellsteel/index.html`.

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
tools/drownedmoon/          Strike at Night's source (src/*.js), its build script and label maker
tools/dronestrike/          Drone Strike's source (src/*.js), its build script and label maker
tools/pitchfork/            Pitchfork Rising's source (src/*.js), its build script and label maker
tools/spellsteel/           Spellsteel's source (src/*.js and the page shell), its build script, and sprite-sheet helpers
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

