/* ================= the story: the people you meet and what they say ================= */
const NPC_LOOKS={
 hessa:{skin:'Tan',eyes:'Sharp',eyeC:'Brown',brows:'Thick',mouth:'Smirk',hair:'Bun',hairC:'Silver',top:'Apron Dress',topC1:'Chocolate',topC2:'Leather',bot:'Long Skirt',botC1:'Charcoal',shoes:'Boots',shoeC:'Black',glove:'Leather'},
 r1:{skin:'Peach',eyes:'Happy',eyeC:'Forest',hair:'Braid',hairC:'Ginger',hat:'Flower Crown',hatC1:'Pink',hatC2:'Lemon',top:'Dress',topC1:'Rose',topC2:'White',bot:'Long Skirt',botC1:'Cream',shoes:'Mary Janes',shoeC:'Maroon'},
 r2:{skin:'Fair',eyes:'Sleepy',eyeC:'Sea',brows:'Thick',mouth:'Calm',hair:'Bald',hairC:'White',hat:'Straw Hat',top:'Sweater',topC1:'Olive',topC2:'Tan',bot:'Pants',botC1:'Brown',shoes:'Boots',face:'Full Beard',faceC:'White'},
 guard:{skin:'Honey',eyes:'Sharp',hair:'Short Crop',hairC:'Black',hat:'Knight Helm',hatC1:'Steel',hatC2:'Crimson',top:'Chainmail',topC1:'Steel',topC2:'Crimson',bot:'Greaves',botC1:'Steel',shoes:'Sabatons',shoeC:'Steel'},
 r3:{skin:'Bronze',eyes:'Wide',hair:'Shaggy',hairC:'Brown',hat:'Beanie',hatC1:'Crimson',hatC2:'Cream',top:'Vest',topC1:'Crimson',topC2:'Black',bot:'Jeans',botC1:'Navy',shoes:'Boots',face:'Stubble',faceC:'Chocolate'},
 r4:{skin:'Tan',eyes:'Round',eyeC:'Sky',hair:'Ponytail',hairC:'Blonde',hat:'Bandana',hatC1:'Azure',hatC2:'White',top:'Striped Shirt',topC1:'Navy',topC2:'White',bot:'Shorts',botC1:'Tan',shoes:'Sandals',shoeC:'Leather'},
 r5:{skin:'Umber',eyes:'Sparkle',eyeC:'Amber',mouth:'Grin',hair:'Messy',hairC:'Black',hat:'Propeller Cap',top:'Tee',topC1:'Lime',topC2:'White',bot:'Shorts',botC1:'Royal',shoes:'Sneakers',shoeC:'Crimson'},
 r6:{skin:'Fair',eyes:'Sharp',eyeC:'Grey',mouth:'Frown',hair:'Short Crop',hairC:'Grey',hat:'Cap',hatC1:'Navy',hatC2:'Gold',top:'Long Coat',topC1:'Navy',topC2:'Gold',bot:'Pants',botC1:'Charcoal',shoes:'Boots',face:'Mustache',faceC:'Grey'},
 r7:{skin:'Porcelain',eyes:'Sleepy',eyeC:'Ice',mouth:'Calm',hair:'Very Long',hairC:'White',hat:'Circlet',hatC1:'Silver',hatC2:'Sky',top:'Priest Vestment',topC1:'Ice',topC2:'Silver',bot:'Long Skirt',botC1:'Navy',shoes:'Boots',shoeC:'Slate'},
 r8:{skin:'Honey',eyes:'Fierce',brows:'Thick',hair:'Wild Mane',hairC:'Rust',hat:'Ushanka',top:'Poncho',topC1:'Brown',topC2:'Cream',bot:'Cargo Pants',botC1:'Olive',shoes:'Tall Boots',face:'Full Beard',faceC:'Rust'},
 r9:{skin:'Peach',eyes:'Sleepy',eyeC:'Violet',brows:'Thick',mouth:'Calm',hair:'Long Straight',hairC:'Silver',hat:'Wizard Hat',hatC1:'Navy',hatC2:'Gold',top:'Mage Robe',topC1:'Navy',topC2:'Gold',bot:'Long Skirt',botC1:'Navy',shoes:'Curled Elf Shoes',shoeC:'Gold',face:'Full Beard',faceC:'Silver'},
 r10:{skin:'Fair',eyes:'Happy',eyeC:'Teal',mouth:'Grin',hair:'Twin Buns',hairC:'Pink',hat:'Goggles',hatC1:'Leather',hatC2:'Cyan',top:'Overalls',topC1:'Teal',topC2:'White',bot:'Pants',botC1:'Teal',shoes:'Sneakers',shoeC:'Orange',face:'Freckles',faceC:'Rust'},
};
const NPC_LOOK=ev=>ev.look==='bram'?CHARS.bram.look:NPC_LOOKS[ev.look||ev.id]||NPC_LOOKS.r2;
const HN=()=>hero().name,has=id=>owned(id),FL=k=>!!G.flags[k];
const joined=(n)=>()=>say('',`${n} joined the party!`);
/* ---------- talking ---------- */
const TALK={
 hessa:async()=>{if(FL('end'))return talk([['Hessa','You did it. All five Embers, burning where they belong.'],['Hessa','Now go shape something beautiful. That\'s what spellsteel is for.']]);
   if(!FL('flame'))return talk([['Hessa','Whisperwood is east of the gate. If you find what\'s eating the colour, don\'t try to talk it out of anything.'],['Hessa','Remember: press START for your menu. Wardrobe, Forge, the lot. Spellsteel takes any shape you want, any time.']]);
   if(!FL('tide'))return talk([['Hessa','The forest is green again! The whole village is out picking flowers.'],['Hessa','Saltmere is down the road past the den. Mind the sea air on that blade.']]);
   if(!FL('frost'))return talk([['Hessa','Two Embers! I can feel them in the coals, you know. The forge burns hotter every time.']]);
   return talk([['Hessa','Every time you bring an Ember home, this old forge sings. Keep going.'],['Hessa','And bring ore if you find it. A forge can reforge spellsteel into something much stronger.']])},
 gate1:()=>talk([['Gate Guard',FL('flame')?'Hear the birds? First time in a month. Whatever you did out there, thank you.':'Whisperwood is through here. Stay on the path, and run if you see anything big.']]),
 villager1:()=>talk([['Eve',FL('flame')?'Look at my flowers! Red as anything! I cried a little, honestly.':'My roses came up grey this morning. Grey! I didn\'t know that was even possible.']]),
 villager2:()=>talk([['Old Tom','When I was a boy, the Embers were just a story for bedtime. Now I\'d give my good knee to see one.'],['Old Tom','My advice? Dress for the adventure you want. The Wardrobe in your menu lets you change clothes any time. In my day we had one shirt.']]),
 woodcutter:()=>talk([['Lost Woodcutter',FL('flame')?'Everything\'s green again! I can finally tell which tree I already chopped.':'Came in to cut wood and every tree looked the same. Grey on grey. I\'ve been walking in circles since yesterday.'],['Lost Woodcutter','There\'s a den to the east. Something big breathes in there.']]),
 bram:async()=>{if(has('bram'))return;
   await talk([['Bram','You\'re the one from Emberwick? Word travels. Heard you\'re hunting Embers.'],['Bram','The harbor\'s been dead calm for weeks. No tide at all. The fish are dying in the nets.'],['Bram','Something in the Tide Grotto is holding the sea still. I\'ve been waiting for someone mad enough to go in there with me.']]);
   const r=await ask('Bram','Well? Want a wall with a hammer on your side?',['Come with us','Not yet']);
   if(r===0){join('bram');await talk([joined('Bram'),['Bram','Good. I go in front. I\'m the one with the big hammer. I can patch you up a bit, too.'],['Mira','He does have a very big hammer.']])}else await say('Bram','I\'ll be here. Don\'t take too long. The fish won\'t.')},
 sailor:()=>talk([['Sailor Ann',FL('tide')?'The tide\'s back! I\'m sailing out at dawn. Want to come? No? Your loss.':'No wind, no tide. My ship\'s sat in one spot so long there are barnacles on the inside.']]),
 kid:()=>talk([['Pip','Did you know you can carve words into your weapon? Any letters you want! I\'d write BIG STICK on mine.'],['Pip','Grimoires get words on the cover. Staffs get a big shiny gem. Anyone holding a staff can heal, you know! I want one when I grow up.']]),
 harbor:()=>talk([['Harbor Master',FL('tide')?'Ships coming in, ships going out. That\'s what a harbor\'s for. Thank you, truly.':'The Tide Grotto opens at the end of the docks. Folk who go in come back soggy. Or not at all.']]),
 elder:()=>talk([['Elder Rhosa',FL('frost')?'The river runs again. I heard it laughing under the ice this morning.':'The Colossus came down from the glacier when the Ember of Frost went dark. It doesn\'t kill. It only freezes. People. Birds. The river.'],['Elder Rhosa','The Glass Glacier lies beyond the town. Please. Bring the river home.']]),
 hunter:()=>talk([['Hunter Oleg',has('kit')?'So Kit went with you. Count yourself lucky. And keep her away from your rations.':'Kit\'s the best tracker on the mountain. Fox ears, bad manners. If she likes you, you\'ll know.']]),
 sage:()=>talk(FL('storm')?[['Sage Ilo','The sky is gold again over Stormwatch. Mira, I will be insufferable about this for years.'],['Sage Ilo','The Grey began in the wastes to the east. Go carefully.']]:
   [['Sage Ilo','Mira! You\'re alive. And you\'ve brought... a smith? Interesting.'],['Mira','Teacher, we have three Embers. Where is the fourth?'],['Sage Ilo','The Stormwing has nested at the crown of the Spire. It holds the Ember of the Sky. Every bolt of lightning you see out there is it screaming.'],['Sage Ilo','Ice will bring it down. And mind the clockwork guards. They were built to keep people out, and they still do.']]),
 tinker:()=>talk([['Tinker Bea','The tailor here sells the finest wings on the continent. Dragon wings! Jetpacks! I built a jetpack once.'],['Tinker Bea','It mostly works. Mostly.']]),
};
async function talkTo(ev){const f=TALK[ev.talk];if(f)await f(ev);else await say(ev.name,'...')}
/* ---------- scenes ---------- */
/* a character's own weapon, for scenes */
const charWeapon=id=>{const C=CHARS[id],w=newWeapon(C.weapon.kind);return Object.assign(w,C.weapon,{parts:Object.assign(w.parts,C.weapon.parts)})};
const STORY={
 intro:()=>talk([['Hessa',`There you are, ${HN()}. Up all night at the anvil again?`],['Hessa','Let me see it, then.'],['Hessa','Ha! It\'s yours, all right. Spellsteel always ends up looking like whoever shaped it.'],
   ['Hessa','Listen. The Grey reached Whisperwood last night. The birds stopped singing at dawn.'],['Hessa','Someone has to go and see what\'s eating the colour, and you\'re the only one here with a spellsteel weapon.'],
   ['Hessa','Press START for your menu. You can change your clothes, and reshape that weapon, any time you like. Spellsteel listens to its bearer.'],
   ['Hessa','A forge can do more: reforge it stronger with ore, and once you bring back an Ember, infuse it with that Ember\'s element.'],['Hessa','Buy some potions at the shop, then out the east gate. And come back in one piece.'],()=>{G.flags.hessa=1}]),
 mira_meet:async()=>{const x=WD.x;WD.actors=[{look:CHARS.mira.look,weapon:charWeapon('mira'),x:x+92,flip:true,pose:'guard'},{foe:'wolf',x:x+58},{foe:'wolf',x:x+128,flip:true}];await talk(['A girl with a heavy book is backed against a tree. Two Briar Wolves circle her, their fur the colour of ash.',['Girl','Don\'t just stand there! Grey-touched wolves don\'t stop, they just keep coming!']]);
   join('mira',Math.max(2,hero().lv));WD.actors=WD.actors.filter(a=>a.foe);await say('','The girl steps up beside you, book open.');
   await startFight(['wolf','wolf'],{theme:'forest',grey:isGrey(ZONES.wood1),noFlee:true});WD.actors=[];
   await talk([['Mira','Thank you. I\'m Mira, from the academy at Stormwatch. I study the Grey.'],['Mira','That weapon of yours, it\'s spellsteel, isn\'t it? It was humming the whole fight.'],
     ['Mira','The Grey in this forest is pouring out of a den to the east. I think something swallowed the Ember of Flame.'],['Mira','If we take it back, the colour should come back with it. Let me come with you. My spells hit hard, I promise.'],joined('Mira'),
     'Tip: in battle, each fighter\'s gauge fills over time. Time waits while you choose a command. When the pink LIMIT gauge fills, Attack becomes a Limit.'])},
 thorn_pre:()=>talk(['Something vast uncoils in the dark, wrapped in grey thorns. Deep inside it, a red light flickers.',['Mira','The Thornmaw! It\'s feeding on the Ember. Look at its belly, it\'s glowing!'],['Mira','It\'s a plant. It must hate fire. Fire, everyone!']]),
 thorn_post:()=>talk(['The Thornmaw crumbles into dry leaves. The Ember of Flame rises out of them and settles in your hands, warm as a hearth.','Red, then green. Colour floods back through Whisperwood.',
   ['Mira','Look at the trees! It\'s working!'],['Mira','And your weapon drank some of the Ember\'s light. Any forge can infuse spellsteel with Fire now.'],
   ['Mira','The other Embers must be held the same way. The tides at Saltmere went still this month. Let\'s start there.'],'Weapons can now be infused with Fire at a forge.']),
 tide_pre:()=>talk(['The water in the hall stands like glass. Something long and blue rises out of it.',['Bram','That\'s what stopped the sea. Mind the tail.'],['Mira','Water and lightning. Bolt will cut right through it!']]),
 tide_post:()=>talk(['The Tidecaller sinks. Far off, the sea gives a great sigh, and the tide begins to run again.',['Bram','Hear that? That\'s the harbor waking up.'],'Weapons can now be infused with Bolt at a forge.',
   ['Mira','Two Embers. The Ember of Frost must be up on Frostpeak. The pass has been snowed shut since spring.']]),
 kit_meet:async()=>{await talk(['Paw prints in the snow. Then a voice, from somewhere above you.',()=>{WD.actors=[{look:CHARS.kit.look,weapon:charWeapon('kit'),x:WD.x+64,flip:true}]},['???','Hold it right there. You\'re walking straight into a wolf den, you know.'],['Kit','Name\'s Kit. I track things on this mountain. Lately the things have been tracking me.'],'The snow bursts open!']);
   join('kit',Math.max(9,hero().lv));WD.actors=[];await startFight(['snowwolf','snowwolf','icebat'],{theme:'snow',grey:isGrey(ZONES.frost1),noFlee:true});
   await talk([['Kit','Not bad. You lot are after the Colossus? It\'s up on the glacier, sitting on a light so cold it burns.'],['Kit','I\'m in. Somebody has to stop you walking into dens.'],joined('Kit')])},
 col_pre:()=>talk(['A mountain of ice stands up. In its chest, a white light burns cold.',['Kit','There it is. Go for the cracks, and bring fire if you have it.']]),
 col_post:()=>talk(['The Colossus shatters into powder snow. The Ember of Frost drifts down like a flake that never melts.',['Kit','The glacier\'s singing. Hear it? Ice is supposed to sound like that.'],'Weapons can now be infused with Ice at a forge.',
   ['Mira','The Ember of the Sky. My teacher Ilo, in Stormwatch, will know where it is.']]),
 storm_pre:()=>talk(['At the crown of the Spire, the storm has a shape. Wings of thundercloud. Eyes like lightning.',['Mira','The Stormwing! It eats lightning and spits it back. Ice will ground it!']]),
 storm_post:()=>talk(['The Stormwing breaks apart into warm rain. Through the clouds, a golden Ember falls into your hands.','The sky clears. For the first time in a month, there is sun over Stormwatch.','Weapons can now be infused with Holy at a forge.',
   ['Mira','Four Embers. Ilo says the Grey began in the wastes to the east. The Hollow King\'s citadel.'],['Bram','Then that\'s where we go.']]),
 wastes_in:()=>talk(['Past the Spire, the world simply stops being coloured.',['Mira','Nothing grows here. Even the wind is grey.'],['Kit','Then we bring the colour with us.'],['Bram','Stay close. And stock up before that citadel.']]),
 warden_pre:async()=>{await talk([['Grey Warden','Turn back. The King has unmade pain. He has unmade grief. Why would you carry them back in?']]);
   const r=await ask(HN(),'',['Because they\'re ours.','Get out of the way.']);await say('Grey Warden',r===0?'Then you will lose them with everything else.':'Then be unmade.')},
 warden_post:()=>talk(['The Grey Warden falls to one knee. The Ember of Dusk slips from its gauntlet, a violet spark.',['Grey Warden','He only wanted it to stop hurting...'],'Weapons can now be infused with Shadow at a forge.',['Mira','Five Embers. The throne is just ahead.']]),
 king_pre:async()=>{await talk(['On a throne of grey glass sits a king with nothing in his face at all.',['The Hollow King','So. The smith\'s child, carrying my Embers like lanterns.'],
     ['The Hollow King','I took the colour out of the world so no one would ever ache again. No loss. No longing. No fear.'],['The Hollow King','And you would give it all back. Why?']]);
   const r=await ask(HN(),'',['Because feeling is worth it.','It was never yours to take.']);
   await talk([['The Hollow King',r===0?'Worth it. They all say that, until it hurts.':'Nothing is anyone\'s. That was the lesson.'],['The Hollow King','Very well. Show me what colour is worth.']])},
 king_post:async()=>{await talk(['The Hollow King\'s crown cracks. Light pours out of all five Embers at once.',['The Hollow King','Warm... I had forgotten warm.'],'The light rolls outward, across the citadel, the wastes, the whole world.']);
   for(const k of Object.keys(EMBERS))G.flags[k]=1;G.flags.end=1;await playEnding()},
};
async function runStory(id){const f=STORY[id];if(f)await f()}
