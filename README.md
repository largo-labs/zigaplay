# ZigaPlay

A pocket console for the browser. Its games are cartridges: you choose one from the shelf, it slides in, and you play it with the console's D-pad (or control stick), A, B, SELECT and START. The console was built for iPhone first, and it also works on desktop.

| Cartridge | What it is | Controls |
|---|---|---|
| **Lynties** | A creature RPG in 3D: explore the Long Road, beat eight Wardens, keep up with your rival Remy, and bond with 166 Lynties, starting with a partner from one of three random charms in Prof. Wren's lab. | D-pad move · A talk/confirm · B back · START menu · SELECT map |
| **Chip City** | A casino with blackjack, roulette, slots, video poker, hi-lo, Rocket (cash out before it blows up), The Track (horse racing) and Texas Hold'em against three players, plus Downtown: 27 buildings to buy, from a hot dog cart to Planet Chip (a trillion chips a second), that earn chips while you're away. Every bet has a MAX step that bets your whole stack. After Big Sal (100,000) come six more loan sharks, each owed ten times more, up to The Chairman's 100 billion. Every win pays its winnings times a bonus multiplier that grows with the bet (2× at the smallest bet, 3× at 50, 4× at 500, 5× at 5,000, up to 10×); losing bets pay nothing back. Work pays 50 chips per 10 polishes and buildings earn three times what they used to, for 24 hours between visits. It uses play chips only. | D-pad choose · A press · START deal/spin · B back |
| **Hammer Fall** | A fast 2D platform fighter at night, played upright, one on one against the CPU: knock your rival off the stage. 50 fighters in three groups (gunners, sword fighters and brawlers), each with their own up and side specials; five A attacks, double jumps, blocking, parries, grabs and smooth combos. A title screen to change the controls, plus training and records. | A attack · B block, B + ▲ or ◀▶ specials · ▲ jump · ▼ block · START pause |
| **Drone Strike** | A strategy game about leading a small country's drone unit against an invasion. Choose which drones fly in each three-wave strike, research new ones, and outthink five enemy generals who adapt to your tactics. | D-pad choose · ◀ ▶ amounts · A confirm · B back |
| **Gridiron '88** | Arcade football with a full franchise mode: the real NFL (current rosters with their numbers, ages and career stats, ratings computed from those stats) or a classic league of original teams, an 18-game season with playoffs, free agency, contracts, the draft and a drag-and-drop card lineup. | Its own touch controls, full screen: joystick, drag back to throw, timed buttons |
| **Pitchfork Rising** | Lead a peasant revolt in twelve real-time battles, from the village tithe barn to the king's palace. Between battles you arm your folk, buy traps and pick a scheme; in battle you place your squads and traps, then fight on the field as Wat, their leader. Played sideways. | Stick move · A strike · B roll · SELECT orders · START pause |
| **Neon Rex** | A cyber-raptor races through a neon city at night: Rex runs right on his own, district after district, and keeps his speed up by dashing down onto the glitch goblins rushing at him. Levels never end. Played upright, on a tall screen. | B or A dash down · START pause |
| **Grim Ascent** | A Doodle Jump-style climb up a haunted tower as a little reaper in a black cloak and skull mask. Tilt the phone to steer; you bounce on the platforms by yourself. Slam into monsters with B and finish them with A combos; tougher monsters take two, three or four combos. Played upright. | Tilt steer · B slam · A attack · START pause |
| **Gray Squares** | Press the square to make a square, then buy things that make squares for you: an extra square, a small pile, a gray shelf, all the way up to gray everything. Everything is gray. It keeps going while you are away. | A press · ▲▼ choose · A buy · SELECT ×1/×10/max · START menu |
| **Haymaker** | A side-view arcade fighter in the style of Mortal Kombat 11: eight Port Ember boxers, each with three specials, a Fatal Haymaker and a knockout finisher. Versus any fighter in any of seven rings, or climb the Tower against all seven CPUs, Victor Sable last. | D-pad move (▲ jump, ▼ crouch, hold back to block), A jab, B cross, specials ↓→A ←→B ↓←A, A+B throw, START pause |

## Lynties in 3D

Lynties draws its world in 3D: a little diorama seen from behind and above, with smooth-lit trees, houses, cliffs, walls and swaying tall grass. You and everyone you meet are small chibi figures, and every house in every town can be entered, with people inside to talk to. A new game opens with a cutscene: Prof. Wren explains Lynties with one of his own beside him, then asks what you look like, your name and your rival's name. The Lynties themselves keep their pixel art, and so do battles, where your trainer steps in to throw each charm.

- **Choosing a partner:** after the cutscene you meet Wren in his lab, where three Bond Charms sit on his table. Each game rolls a different three from every Lynty line except the eight legends (first forms, three different elements). Face a charm to see who's inside; pressing A opens it, and that choice is final. Remy then bursts in and takes the charm strongest against yours, and Wren keeps the last one. You can't leave the lab until you've chosen.
- **Nicknames:** you're offered a nickname for your partner and for every Lynty you bond with, and each Lynty's page has a Nickname / Rename button ("No nickname" goes back to its own name). Battles, the team list and evolutions use the nickname; the team list shows the species beside it.
- **Your trainer's wardrobe** (title screen, Your trainer, and the start of a new game): 12 hairstyles in 15 colours; 16 things to wear on your head (hood, caps worn either way, beanie, bobble hat, bucket, beret, sun hat, cowboy hat, top hat, headband, bandana, wizard hat, flower crown, crown); 12 tops (jacket, hoodie, long coat, puffer, raincoat, T-shirt, sweater, vest and shirt, tracksuit, lab coat, overalls, cape); trousers, shorts or a skirt; 9 shoe colours; 6 kinds of bag or none; and extras (glasses, sunglasses, scarf, goggles, headphones, earrings). Hats, tops, bottoms and bags each take any of 25 colours, and Random look picks a whole outfit. Everything shows in the pixel sprites, in battle and on the 3D figure. Looks saved before the wardrobe grew carry over unchanged.
- **Sending out:** every time a Lynty of yours enters a battle, the box says "Go, <name>!" while your trainer throws its charm, and it bursts out in a flash.

- `games/lynties/3d/` holds three.js (r183, MIT). The offline edition packs it inside the page.
- The game itself lives in `tools/lynties-3d/lynties-2d.html`: maps, battles, menus, story and saves. That file also plays on its own as the classic pixel-art version.
- `tools/lynties-3d/src/w3d.js` is the 3D world. `tools/lynties-3d/build.py` adds it to the game to make the cartridge: `python3 tools/lynties-3d/build.py tools/lynties-3d/lynties-2d.html games/lynties/index.html`.
- If WebGL or three.js can't load, the cartridge falls back to the pixel-art world.
- Trainers on the roads and the three in each town (one beside each fence gap) turn to look in all four directions every few seconds. Step into one's line of sight and it challenges you; slip past while it looks away and you don't have to fight it.
- Wild Lynties jump out on about 1 in 10 steps through tall grass (it was 1 in 7), and never in the first 3 steps after the last one.
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

## Neon Rex

(It was Party Rex; the game id and files are still `partyrex`.) Rex is a cyber-raptor and the goblins are glitch goblins with antennas who run at him. Rex runs right by himself and the city scrolls past, one district per level: Neon Alley, the Night Market, the Arcade and the Rooftops, then round again. Synthwave music, rain and flickering neon signs.

The console stays upright for Neon Rex. The picture is 180 pixels wide and as tall as the screen allows (220 to 340 pixels), and Rex's bounces are scaled to that height, so the timing plays the same on every phone.

- **The one button:** B (or A, or ▼) dashes Rex straight down.
- **Speed is everything:** the meter at the top right is Rex's speed. Dashing onto a goblin kid bonks it, bounces Rex back up and adds speed, and bonks in a row build a combo for more points and more speed. Big kids give a bigger bounce.
- **Slowing down:** hitting the floor costs speed, and so does running into a kid from the side. Landing on a kid's head without dashing is just a small bounce, with no speed either way.
- **Losing:** when the speed runs out, Rex is out of steam and the party's over.
- **Endless:** the first seconds are free, then each level brings faster kids and new kinds (sprinters, kids who jump, big kids, kids arriving in pairs), misses cost a little more and bonks give a little less. The best score is kept in the browser (`partyrex-runbest`).
- SELECT turns the sound on or off. The game is the single file `games/partyrex/index.html`; it draws its own sprites and plays its own music in code.

## Grim Ascent

A little reaper (black cloak over everything, a skull mask with glowing eyes, a small sword) climbs a haunted tower that never ends. He bounces on every platform by himself, like Doodle Jump; the player steers by tilting the phone. The run ends when he falls off the bottom of the screen or loses his last heart.

- **Tilt:** the game reads the phone's orientation sensor (on the ZigaPlay, from the console page, where the touches are). Its cartridge sets `tilt:true`, so the console asks the phone for the sensor inside the player's taps (iPhone only asks inside a tap). A page shown inside another site's page, such as the published ZigaPlay inside the Claude app, is refused by the browser; the Home Screen (offline) edition can read it. Holding the left or right half of the screen also steers. Options set the steering (auto, tilt, D-pad), tilt sensitivity, and the centre (also SELECT during a climb). Where there is no tilt (a desktop browser, or a page that is not allowed to read the sensor), the D-pad steers instead; otherwise the D-pad is for the menus.
- **Combat:** B slams straight down (it homes in a little on a monster below). Slamming into a monster stuns it and starts a combo: press A up to four times (the fourth is a finisher), then you spring upward. A full combo (slam + four slashes) is one red pip of a monster's health: wisps and bone bats take one, ghouls and wraiths two, gargoyles three, bone golems four. A on its own is a quick slash; landing on a monster's head without slamming just bounces you off. Touching a monster from the side, or a gargoyle's fireball, costs a heart.
- **The climb:** stone platforms, moving rune platforms, crumbling ones that break after one bounce, and springs. Slamming onto a platform bounces you higher. Platforms get further apart and monsters come more often as you go up, through four stretches: Graveyard, Cathedral, Storm and Blood Moon.
- **Hearts and souls:** you start with three hearts (up to five). Monsters burst into souls; every 40 souls gives back a heart, and a heart floats in now and then. The best height is saved and drawn as a dashed line on the tower.
- Built from `tools/grim/src/` with `python3 tools/grim/build.py`, which writes `games/grim/index.html`. The sprites are drawn in code; the pixel font and sprite helpers are Neon Rex's.

## Gray Squares

A deliberately bland idle game. The screen is a number, a gray square and a list. Pressing the square makes squares; the things you buy make squares every second, and every 25 of the same thing doubles what each of them makes. Deadpan lines appear at milestones. Now and then the square turns slightly darker for six seconds, and pressing it then is worth a minute of everything. After enough squares in one run, START offers to begin again, slightly warmer: everything restarts, but makes 10% more for each warmth, and the gray turns a little more beige each time.

- Holding A keeps pressing (or buying), faster the longer you hold. B also presses the square, so two thumbs can take turns. SELECT switches buying between one, ten and as many as you can afford.
- It saves every few seconds and when the console is turned off, and on return it adds what the squares made while you were away (up to a day).
- Built from `tools/squares/src/` with `python3 tools/squares/build.py`, which writes `games/squares/index.html`.

## Saving (Gray Squares, Grim Ascent, Neon Rex, Strike at Night)

These save every second, both on the device (localStorage, prefixed with the game's id) and, on the published ZigaPlay, to the player's account through `ZIGAPLAY.cloud` (collection `data/users/<id>/<game>/saves`, document `progress`). The Claude app can clear a page's storage when it closes, so the account copy is what brings progress back; on start each game loads both and keeps the newer. They also save when the page is hidden or closed and when the console's power switch is used. Grim Ascent and Party Rex keep a run in progress (height, hearts, kills and souls; or level, score, speed and distance), and their title screens offer to carry on with it.

## Hammer Fall

(It was Strike at Night; the game id and files are still `strike`, so saves carry over.) A simple Smash-style fighter, played upright (the console stays vertical). You against the CPU on a narrow, tall night stage with platforms stacked above it; the last one with stocks left wins.

- **Three groups of fighters.** Long range (17): guns, bombs and energy blasts; their A attacks shoot. Medium range (17): swords with reach. Close range (16): fists and kicks, the fastest strings. Each fighter has their own speed, power, weight and look.
- **Controls (changeable on the title screen, CONTROLS):** ◀ ▶ run, ▲ jump and ▲ again in the air to double jump, A attack, B block, ▼ block. B with ▲ is the up special (the recovery), B with ◀ or ▶ the side special. In the air B alone dodges. Block + A grabs and throws, block + ◀ ▶ rolls, blocking just before a hit parries. ▼ in the air falls fast; ▼ twice drops through a platform.
- **A attacks:** neutral A (a three-hit string; gunners keep firing), forward A, back A (hold away from where you face; turning takes a few frames, so it comes out), up A and down A (both pop the foe up for follow-ups), and neutral, forward, back, up and down attacks in the air.
- **Combos:** any attack that lands can be cancelled straight into the next attack, a special or a jump, and the A string carries on by itself. Long strings wear off a little (each hit in a row stuns slightly less, the same attack twice much less), so they end.
- **Specials:** two per fighter, from 33 kinds by group: jetpacks, blast jumps, warps and hover boosts; rockets, grenades, beams, shotguns, orbs, sniper shots, bursts and sticky bombs; rising thrusts, spinning climbs, leaps and grapples; dash slashes, sword waves, counters, stab flurries, dive slams and blade whirls; uppercuts, flaming climbs, helicopter kicks; armored rushes, command grabs, hundred-fist flurries, flying kicks and palm blasts. No two fighters share the same pair.
- **Look and sound:** realistic body proportions with lit torsos, tapered limbs, hair and hats, outfits (jackets, long coats, armor with shoulder plates, gis, tank tops, robes, suits, vests) and extras (capes, scarves, boots), real-looking swords and guns, tracers, rocket smoke and explosions. A synth soundtrack: a slow title theme and a battle track for each stage (drums, bass, pads, arpeggios and a lead melody).
- **Matches:** damage builds up a percent, and the higher it is the farther hits send you. Fighters are solid: you can't walk, dash or roll through the other fighter (jump over them instead); only someone sent flying by a big hit sails past. Settings: 1 to 5 stocks, CPU level 1 to 9, an optional 2, 3 or 5 minute timer, game speed (70%, 85% or 100%; 85% by default, so the action is easy to follow), sound and vibration. Eight stages: Rooftop, Moon Bridge, Clock Tower (its clock shows the real time), Neon Docks, The Foundry, Sky Temple, Frozen Peak and Subway, each with its own battle track. The blast lines sit far out (390 to each side, 370 up), and getting hit gives back your double jump, dodge and specials, so there is time to get back. Training has a dummy and a combo counter. Records keep wins and losses for each fighter.
- **Saving:** settings, controls, records and a match in progress save every second (see Saving below); RESUME MATCH on the title picks the match back up.
- Built from `tools/strike/src/` with `python3 tools/strike/build.py`, which writes `games/strike/index.html` (opening it with `#sntest` adds a test hook, `window.SNT`). The fighters and stages are drawn in code.

## Haymaker

A side-view arcade fighter, MK11 style, against the CPU (`games/haymaker`, built from `tools/haymaker/src` with `python3 tools/haymaker/build.py`).

- **Look:** an Arcade Ink style (in the spirit of modern arcade fighters): heavy ink outlines, two-tone cel shading with a hard shadow and a bright rim light, paint-splash hits and comic lettering (Bangers, with system fallbacks offline). The fighters are posed skeletons (two-bone arms and legs) drawn in ring units scaled to the screen's real pixels; each ring's backdrop sits behind a side view of the ring.
- **Fighters:** Milo Brass (all-rounder: Ember Shot fireball, Blitz Rush, Sky Hook), Gus "Bucket" Mahoney (big and tough: Hook Toss, Wrecking Ball, Ground Pound), Tiny Vex (fast: Machine Gun Jabs, Dart Rush, Dive Bomb), Brother Halloran (counters: Shockwave, Battering Ram armor punch, Iron Parry), Sergei Volkov (zoner: Ice Spear, Avalanche, Deep Freeze), Lola Cadena (tricky: Smoke Step teleport, Fire Tornado, Matador Drop), Big Tide Baraka (grappler: Tidal Wave, Undertow command grab, Depth Charge) and Victor Sable (boss: Gold Coin, Shadow Step, Demon Uppercut). Each differs in speed, power and health.
- **Fighting:** ◀▶ walk, ▲ jump (a jump goes the way you were just walking, so a four-way D-pad works), ▼ crouch. Hold back to block highs, mids and overheads; crouching ducks highs and blocks lows (down-back on a keyboard also blocks mids). A jab, B cross, A A B string, ▼A low, ▼B uppercut that launches for juggles, →B overhead, A+B up close throws, A or B in the air. Specials are ↓→A, ←→B and ↓←A, and a normal that connects can be cancelled into its string or a special. Under 30% health, ▼+A+B is the **Fatal Haymaker** (a three-hit cinematic, used up once it lands); an uppercut that counter-hits is a **Crushing Blow** (once a match). Best of three rounds (1, 3 or 5 in settings), 60 seconds each (45, 60, 90 or no limit); then **FINISH THEM**: ↓→↓+B is the knockout finisher, which sends them into the lights, or any punch just ends it. A combo counter shows hits and damage.
- **Modes:** VERSUS (pick your fighter, a CPU opponent and the ring; SELECT picks at random), TOWER (the other seven in a row, Sable last, the CPU one level below your setting at the bottom and one above at the top), LOCKER ROOM (Milo's skin, hair, hair colour, facial hair, eyes, trunks, trim, gloves, tattoo and nickname; beating a fighter unlocks their gloves, clearing the Tower unlocks gold trunks and a crown tattoo), MOVES (every fighter's move list, also in the pause menu) and SETTINGS (CPU level 1 to 5, rounds, round time, sound, vibration).
- **Pace:** quick walking and jumps, short startup and recovery (a jab is out in 3 steps of 60 a second), strings that keep going even when a punch misses, a swish and a tick of vibration on every punch you throw, and short knockdowns and round breaks.
- **The CPU:** reacts to punches and projectiles, picks the right block more often at higher levels, punishes misses, keeps strings going, juggles, anti-airs, uses its Fatal Haymaker and sometimes its finisher.
- **Saving:** every second and when the game is hidden or turned off, on the device (`haymaker-save`) and in the ZigaPlay account doc `progress`: settings, look, unlocks, the Tower and a match in progress (CONTINUE MATCH on the title picks it back up at the start of the round, health kept).

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
tools/strike/               Hammer Fall: its source (src/*.js and the page shell) and build script
tools/grim/                 Grim Ascent: its source (src/*.js and the page shell) and build script
tools/squares/              Gray Squares: its page shell, script and build script
```

## How the console works

- **Cartridges:** each one is listed in `CARTS` near the top of the script in `index.html`. The console fetches the game's file and runs it in an iframe the size of the screen. Before the game's first script runs, the console gives it its own AudioContext, so presses on the console's buttons can start sound.
- **Input:** a game can take the buttons directly by defining `window.ZPCart = { input(btn, isDown) {…} }`. Otherwise it gets keyboard events: arrows, z, x, Enter and Shift.
- **Power switch:** `ZPCart.home()` lets a game save or ask before the power switch turns it off.
- **Game options in `CARTS`:**
  - `stick:true` puts a round control stick in place of the D-pad.
  - `wide:true` gives the game the console's sideways shape. If the phone is upright, the console turns itself a quarter turn.
  - `face4:true` gives the game four face buttons in a diamond (A, B, C, D).
  - `touch:true` is for a game with its own on-screen controls: it fills the whole phone screen with no D-pad or buttons, and a small power tab (left edge, or top edge with the phone upright) turns it off.
  - `skin:'<id>'` names the console skin the game wears when the player picks *Match the game*.
- **Home screen and Library:** the shelf shows the games on the home screen, then a STORE tile and a LIBRARY tile. Press EDIT (or START) on the home screen and choose a game to send it to the Library; in the Library, EDIT puts a game back. Games play from either place. A cart with `lib:true` starts out in the Library, and after that each player's own arrangement is kept (inside Claude it's also kept in their account, with the skin).
- **Store:** always just left of the Library tile, and it can't be put away. Every game is free and sorted by type: tabs along the top (ALL, ACTION, EXPLORE, RPG, IDLE, STRATEGY, SPORTS; ◀▶ switches), and ALL lists each game once under a heading for its main type. A on an uninstalled game installs it onto the home screen; A on an installed one (✓) uninstalls it after asking, taking it off the home screen and out of the Library. Saves stay on the console, so a reinstalled game picks up where it left off. Uninstalls are kept with the Library choices (`zigaplay-lib`, value `gone`), so inside Claude they follow the player to their other devices. A cart's `genre` (list, main type first) and `kind` (the line under its name) place it; a cart without them goes under MORE.
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

## Gridiron '88

`games/gridiron/index.html` is a single-file build of the Gridiron '88 game, which is developed in the `largo-labs/games` repo (`gridiron/`): `npm run build` there, then inline the CSS, JS and fonts into one page. It runs as a `touch:true` cartridge, so it plays exactly as it does on its own. Its NFL mode uses real team and player names (no logos); its ratings are its own formula from public career stats.

## Credits

Lynties' 3D world uses [three.js](https://threejs.org/) (MIT, see `games/lynties/3d/LICENSE`). The offline pixel font is a subset of GNU Unifont.

## Keyboard controls

On the ZigaPlay home screen, the **KEYS** button (or the K key) opens a list of every console button with two keys each. Pick a row, press A or Enter, then press the key you want. A key already in use moves over to the new button, Backspace clears a slot, and "Reset to defaults" brings the originals back. The choices are saved in the browser (`zigaplay-keys`) and apply to every game on the console. Games can read the current keys from `ZIGAPLAY.keys`.

