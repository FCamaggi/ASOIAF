import type { Category, Medium, Option, SpoilerLevel } from '../shared/types.ts';

/**
 * Hand-curated catalogue. No external API calls: every option below is a small,
 * self-contained record. Option text is English (the canon language, and what
 * the AIOIAF/AWOIAF/ThronesAPI imports return). Only category labels/prompts are
 * bilingual, for the EN/ES switch. Images are attached later by
 * `npm run import:images` (ThronesAPI + Wikimedia Commons) into `uploads/`.
 */

type Seed = Omit<Option, 'meta'> & { meta?: Record<string, unknown> };

const B: Medium = 'both';
const MAJOR: SpoilerLevel = 'major';
const NONE: SpoilerLevel = 'none';

function o(
  id: string,
  type: Option['type'],
  name: string,
  subtitle: string,
  house: string | null,
  extra: Partial<Seed> = {},
): Seed {
  return {
    id,
    type,
    name,
    subtitle,
    house,
    medium: B,
    spoilerLevel: NONE,
    featured: true,
    source: 'seed',
    imageUrl: null,
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// Characters (shared pool, reused across several categories)
// ---------------------------------------------------------------------------
const CH = (
  id: string,
  name: string,
  house: string | null,
  gender: 'Male' | 'Female',
  subtitle: string,
): Seed => o(id, 'character', name, subtitle, house, { meta: { gender } });

const characters: Seed[] = [
  CH('jon-snow', 'Jon Snow', 'stark', 'Male', 'The bastard of Winterfell · Lord Commander'),
  CH('arya-stark', 'Arya Stark', 'stark', 'Female', 'A girl has no name'),
  CH('sansa-stark', 'Sansa Stark', 'stark', 'Female', 'The Lady of Winterfell'),
  CH('daenerys-targaryen', 'Daenerys Targaryen', 'targaryen', 'Female', 'Mother of Dragons · The Unburnt'),
  CH('tyrion-lannister', 'Tyrion Lannister', 'lannister', 'Male', 'The Imp · Hand of the Queen'),
  CH('jaime-lannister', 'Jaime Lannister', 'lannister', 'Male', 'The Kingslayer'),
  CH('cersei-lannister', 'Cersei Lannister', 'lannister', 'Female', 'Queen Regent of the Seven Kingdoms'),
  CH('ned-stark', 'Eddard Stark', 'stark', 'Male', 'Warden of the North · Hand of the King'),
  CH('catelyn-stark', 'Catelyn Tully', 'tully', 'Female', 'Lady of Winterfell'),
  CH('robb-stark', 'Robb Stark', 'stark', 'Male', 'The Young Wolf · King in the North'),
  CH('bran-stark', 'Brandon Stark', 'stark', 'Male', 'The Three-Eyed Raven'),
  CH('brienne-of-tarth', 'Brienne of Tarth', 'baratheon', 'Female', 'The Maid of Tarth'),
  CH('sandor-clegane', 'Sandor Clegane', 'clegane', 'Male', 'The Hound'),
  CH('petyr-baelish', 'Petyr Baelish', 'baelish', 'Male', 'Littlefinger'),
  CH('varys', 'Varys', null, 'Male', 'The Spider · Master of Whisperers'),
  CH('theon-greyjoy', 'Theon Greyjoy', 'greyjoy', 'Male', 'Ward of Winterfell · Reek'),
  CH('samwell-tarly', 'Samwell Tarly', 'tarly', 'Male', 'Sam the Slayer'),
  CH('davos-seaworth', 'Davos Seaworth', 'baratheon', 'Male', 'The Onion Knight'),
  CH('stannis-baratheon', 'Stannis Baratheon', 'baratheon', 'Male', 'The rightful king · Lord of Dragonstone'),
  CH('joffrey-baratheon', 'Joffrey Baratheon', 'lannister', 'Male', 'King of the Seven Kingdoms'),
  CH('ramsay-bolton', 'Ramsay Bolton', 'bolton', 'Male', 'The Bastard of the Dreadfort'),
  CH('tywin-lannister', 'Tywin Lannister', 'lannister', 'Male', 'Lord of Casterly Rock'),
  CH('oberyn-martell', 'Oberyn Martell', 'martell', 'Male', 'The Red Viper of Dorne'),
  CH('ygritte', 'Ygritte', 'wildling', 'Female', "Free folk · 'You know nothing'"),
  CH('melisandre', 'Melisandre', null, 'Female', 'The Red Woman of Asshai'),
  CH('margaery-tyrell', 'Margaery Tyrell', 'tyrell', 'Female', 'Queen in waiting'),
  CH('missandei', 'Missandei', null, 'Female', "Of Naath · the Queen's voice"),
  CH('walder-frey', 'Walder Frey', 'frey', 'Male', 'Lord of the Crossing'),
  CH('night-king', 'The Night King', 'whitewalkers', 'Male', 'Commander of the White Walkers'),
  CH('euron-greyjoy', 'Euron Greyjoy', 'greyjoy', 'Male', "Crow's Eye"),
  CH('gregor-clegane', 'Gregor Clegane', 'clegane', 'Male', 'The Mountain That Rides'),
];

const male = characters.filter((c) => (c.meta as any)?.gender === 'Male');
const female = characters.filter((c) => (c.meta as any)?.gender === 'Female');
const ids = (list: Seed[]) => list.map((c) => c.id);
const pick = (...slugs: string[]) => slugs;

// ---------------------------------------------------------------------------
// Houses
// ---------------------------------------------------------------------------
const houses: Seed[] = [
  o('house-stark', 'house', 'House Stark', 'Winter is Coming · The North', 'stark'),
  o('house-targaryen', 'house', 'House Targaryen', 'Fire and Blood · Dragonstone', 'targaryen'),
  o('house-lannister', 'house', 'House Lannister', 'Hear Me Roar! · Casterly Rock', 'lannister'),
  o('house-baratheon', 'house', 'House Baratheon', "Ours is the Fury · Storm's End", 'baratheon'),
  o('house-tyrell', 'house', 'House Tyrell', 'Growing Strong · Highgarden', 'tyrell'),
  o('house-martell', 'house', 'House Martell', 'Unbowed, Unbent, Unbroken · Dorne', 'martell'),
  o('house-greyjoy', 'house', 'House Greyjoy', 'We Do Not Sow · Pyke', 'greyjoy'),
  o('house-tully', 'house', 'House Tully', 'Family, Duty, Honor · Riverrun', 'tully'),
  o('house-arryn', 'house', 'House Arryn', 'As High as Honor · The Eyrie', 'arryn'),
  o('house-bolton', 'house', 'House Bolton', 'Our Blades Are Sharp · The Dreadfort', 'bolton'),
];

// ---------------------------------------------------------------------------
// Dragons
// ---------------------------------------------------------------------------
const dragons: Seed[] = [
  o('balerion', 'dragon', 'Balerion', "The Black Dread · Aegon the Conqueror's mount", 'targaryen'),
  o('drogon', 'dragon', 'Drogon', "Daenerys' black dragon", 'targaryen'),
  o('rhaegal', 'dragon', 'Rhaegal', 'The green-and-bronze dragon', 'targaryen'),
  o('viserion', 'dragon', 'Viserion', 'The cream-and-gold dragon', 'targaryen'),
  o('vhagar', 'dragon', 'Vhagar', 'The largest dragon of the Dance', 'targaryen'),
  o('caraxes', 'dragon', 'Caraxes', "The Blood Wyrm · Daemon's mount", 'targaryen'),
  o('meraxes', 'dragon', 'Meraxes', "Rhaenys the Conqueror's mount", 'targaryen'),
  o('sunfyre', 'dragon', 'Sunfyre', 'The Golden · the most beautiful dragon ever seen', 'targaryen'),
  o('syrax', 'dragon', 'Syrax', "Rhaenyra Targaryen's mount", 'targaryen'),
];

// ---------------------------------------------------------------------------
// Battles
// ---------------------------------------------------------------------------
const battles: Seed[] = [
  o('battle-blackwater', 'battle', 'Battle of the Blackwater', 'Wildfire over Blackwater Bay', 'lannister'),
  o('battle-bastards', 'battle', 'Battle of the Bastards', 'Jon Snow against Ramsay Bolton for Winterfell', 'stark', { spoilerLevel: MAJOR }),
  o('battle-whispering-wood', 'battle', 'The Whispering Wood', 'Robb Stark captures the Kingslayer', 'stark'),
  o('battle-hardhome', 'battle', 'The Massacre at Hardhome', 'The living against the army of the dead', 'wildling', { spoilerLevel: MAJOR }),
  o('battle-castle-black', 'battle', 'The Battle of Castle Black', "The Night's Watch against the free folk", null),
  o('battle-field-of-fire', 'battle', 'The Field of Fire', 'Aegon and three dragons burn 55,000 men', 'targaryen'),
  o('battle-tumbleton', 'battle', 'The First Battle of Tumbleton', 'The Two Betrayers turn cloak in the Dance', 'targaryen', { spoilerLevel: MAJOR }),
  o('battle-loot-train', 'battle', 'The Loot Train Attack', 'Drogon and the Dothraki against the Lannister gold', 'targaryen', { spoilerLevel: MAJOR }),
];

// ---------------------------------------------------------------------------
// Places
// ---------------------------------------------------------------------------
const places: Seed[] = [
  o('winterfell', 'place', 'Winterfell', 'The heart of the North', 'stark'),
  o('kings-landing', 'place', "King's Landing", 'The Iron Throne and the Red Keep', 'baratheon'),
  o('the-wall', 'place', 'The Wall', '700 feet of ancient ice', null),
  o('dragonstone', 'place', 'Dragonstone', 'Fortress of volcanic stone', 'targaryen'),
  o('highgarden', 'place', 'Highgarden', 'Gardens and plenty of the Reach', 'tyrell'),
  o('braavos', 'place', 'Braavos', 'The Titan and the House of Black and White', null),
  o('valyria', 'place', 'Valyria', 'The smoking ruins of the Freehold', 'targaryen'),
  o('sunspear', 'place', 'Sunspear', 'The heat and sand snakes of Dorne', 'martell'),
  o('the-eyrie', 'place', 'The Eyrie', 'The Moon Door', 'arryn'),
  o('pyke', 'place', 'Pyke', 'Towers above the iron sea', 'greyjoy'),
];

// ---------------------------------------------------------------------------
// Scenes (curated editorial moments — mostly major spoilers)
// ---------------------------------------------------------------------------
const scenes: Seed[] = [
  o('scene-red-wedding', 'scene', 'The Red Wedding', 'The Freys break guest right', 'frey', { spoilerLevel: MAJOR }),
  o('scene-bastards-charge', 'scene', "Jon's lone charge", 'Dust, horses and a drawn sword', 'stark', { spoilerLevel: MAJOR }),
  o('scene-hold-the-door', 'scene', "'Hold the door'", 'The origin of Hodor', 'stark', { spoilerLevel: MAJOR }),
  o('scene-mountain-viper', 'scene', 'The Mountain and the Viper', "Tyrion's trial by combat in Dorne", 'martell', { spoilerLevel: MAJOR }),
  o('scene-dracarys-astapor', 'scene', "'Dracarys' at Astapor", 'Daenerys frees the Unsullied', 'targaryen', { spoilerLevel: MAJOR }),
  o('scene-ned-execution', 'scene', "Ned Stark's execution", 'The Sept of Baelor', 'stark', { spoilerLevel: MAJOR }),
  o('scene-light-of-the-seven', 'scene', "'Light of the Seven'", 'The Sept of Baelor burns with wildfire', 'lannister', { spoilerLevel: MAJOR }),
  o('scene-shame-walk', 'scene', 'The walk of shame', "'Shame. Shame. Shame.'", 'lannister', { spoilerLevel: MAJOR }),
  o('scene-tower-of-joy', 'scene', 'The Tower of Joy', 'The promise Ned made to Lyanna', 'stark', { spoilerLevel: MAJOR }),
  o('scene-purple-wedding', 'scene', 'The Purple Wedding', 'One last toast for King Joffrey', 'lannister', { spoilerLevel: MAJOR }),
];

// ---------------------------------------------------------------------------
// Deaths (shared pool for "most satisfying" and "saddest")
// ---------------------------------------------------------------------------
const deaths: Seed[] = [
  o('death-ned-stark', 'death', 'Death of Ned Stark', "Beheaded on Joffrey's order", 'stark', { spoilerLevel: MAJOR }),
  o('death-joffrey', 'death', 'Death of Joffrey Baratheon', 'Poisoned at his own wedding', 'lannister', { spoilerLevel: MAJOR }),
  o('death-tywin', 'death', 'Death of Tywin Lannister', "On the privy, at his son Tyrion's hand", 'lannister', { spoilerLevel: MAJOR }),
  o('death-ramsay', 'death', 'Death of Ramsay Bolton', 'Eaten by his own hounds', 'bolton', { spoilerLevel: MAJOR }),
  o('death-oberyn', 'death', 'Death of Oberyn Martell', 'Crushed by the Mountain at the moment of triumph', 'martell', { spoilerLevel: MAJOR }),
  o('death-robb-catelyn', 'death', 'Death of Robb and Catelyn Stark', 'At the Red Wedding', 'stark', { spoilerLevel: MAJOR }),
  o('death-hodor', 'death', 'Death of Hodor', 'Holding the door to the end', 'stark', { spoilerLevel: MAJOR }),
  o('death-shireen', 'death', 'Death of Shireen Baratheon', 'Burned at the stake by her own father', 'baratheon', { spoilerLevel: MAJOR }),
  o('death-viserys', 'death', 'Death of Viserys Targaryen', 'A crown of molten gold', 'targaryen', { spoilerLevel: MAJOR }),
  o('death-olenna', 'death', 'Death of Olenna Tyrell', "'Tell Cersei it was me'", 'tyrell', { spoilerLevel: MAJOR }),
  o('death-littlefinger', 'death', 'Death of Petyr Baelish', 'Tried and executed at Winterfell', 'baelish', { spoilerLevel: MAJOR }),
  o('death-lyanna-mormont', 'death', 'Death of Lyanna Mormont', 'Takes a giant down with her', 'stark', { spoilerLevel: MAJOR }),
];

// ---------------------------------------------------------------------------
// Duos & couples (composed of two characters)
// ---------------------------------------------------------------------------
const duo = (id: string, name: string, subtitle: string, house: string | null, members: string[]) =>
  o(id, 'duo', name, subtitle, house, { meta: { members } });

const duos: Seed[] = [
  duo('duo-arya-hound', 'Arya Stark & Sandor Clegane', 'The unlikeliest road trip in Westeros', 'stark', ['arya-stark', 'sandor-clegane']),
  duo('duo-jaime-brienne', 'Jaime Lannister & Brienne of Tarth', 'Honor forged reluctantly', 'lannister', ['jaime-lannister', 'brienne-of-tarth']),
  duo('duo-tyrion-varys', 'Tyrion Lannister & Varys', 'Wit and whispers', 'lannister', ['tyrion-lannister', 'varys']),
  duo('duo-jon-sam', 'Jon Snow & Samwell Tarly', 'Sworn brothers of the Watch', null, ['jon-snow', 'samwell-tarly']),
  duo('duo-brienne-pod', 'Brienne of Tarth & Podrick Payne', 'The knight and her squire', 'baratheon', ['brienne-of-tarth', 'petyr-baelish']),
  duo('duo-davos-shireen', 'Davos Seaworth & Shireen Baratheon', 'Reading lessons by the fire', 'baratheon', ['davos-seaworth', 'stannis-baratheon']),
  duo('duo-dany-jorah', 'Daenerys Targaryen & Jorah Mormont', 'Loyalty to the last breath', 'targaryen', ['daenerys-targaryen', 'missandei']),
  duo('duo-bronn-tyrion', 'Bronn & Tyrion Lannister', 'Gold up front, sword after', 'lannister', ['tyrion-lannister', 'jaime-lannister']),
];

const couple = (id: string, name: string, subtitle: string, house: string | null, members: string[], spoiler: SpoilerLevel = NONE) =>
  o(id, 'couple', name, subtitle, house, { meta: { members }, spoilerLevel: spoiler });

const couples: Seed[] = [
  couple('couple-jon-ygritte', 'Jon Snow & Ygritte', "'You know nothing, Jon Snow'", 'wildling', ['jon-snow', 'ygritte']),
  couple('couple-robb-talisa', 'Robb Stark & Talisa', 'A love that cost a kingdom', 'stark', ['robb-stark', 'catelyn-stark'], MAJOR),
  couple('couple-sam-gilly', 'Samwell Tarly & Gilly', 'Tenderness north of the Wall', null, ['samwell-tarly', 'ygritte']),
  couple('couple-ned-catelyn', 'Ned & Catelyn Stark', 'A duty that became love', 'stark', ['ned-stark', 'catelyn-stark']),
  couple('couple-dany-drogo', 'Daenerys Targaryen & Khal Drogo', 'My sun and stars', 'targaryen', ['daenerys-targaryen', 'jon-snow']),
  couple('couple-jaime-cersei', 'Jaime & Cersei Lannister', 'What gold and pride bind', 'lannister', ['jaime-lannister', 'cersei-lannister'], MAJOR),
  couple('couple-arya-gendry', 'Arya Stark & Gendry', "'You could be my family'", 'stark', ['arya-stark', 'robb-stark']),
  couple('couple-missandei-grey-worm', 'Missandei & Grey Worm', 'Love between the free of Naath and Astapor', null, ['missandei', 'daenerys-targaryen']),
];

// ---------------------------------------------------------------------------
// Moments (uplifting / iconic beats)
// ---------------------------------------------------------------------------
const moments: Seed[] = [
  o('moment-king-in-the-north', 'moment', "'The King in the North!'", 'The bannermen raise Jon Snow on their shoulders', 'stark', { spoilerLevel: MAJOR }),
  o('moment-dragons-fly', 'moment', "Drogon's first flight", 'Daenerys soars over the Meereen fighting pit', 'targaryen', { spoilerLevel: MAJOR }),
  o('moment-arya-list', 'moment', 'Arya crosses a name off her list', 'The Red Wedding debt, paid', 'stark', { spoilerLevel: MAJOR }),
  o('moment-brienne-knighted', 'moment', 'Brienne is knighted', 'By the fire, the eve of battle', 'baratheon', { spoilerLevel: MAJOR }),
  o('moment-tyrion-trial', 'moment', "Tyrion's speech at his trial", "'I wish I had enough poison for the whole pack'", 'lannister', { spoilerLevel: MAJOR }),
  o('moment-dany-astapor', 'moment', 'Daenerys takes Astapor', "'A dragon is not a slave.'", 'targaryen', { spoilerLevel: MAJOR }),
  o('moment-hardhome-look', 'moment', 'The final look at Hardhome', 'The Night King raises his arms', null, { spoilerLevel: MAJOR }),
  o('moment-jaime-confession', 'moment', "The Kingslayer's confession", 'Jaime tells Brienne why he killed the Mad King', 'lannister', { spoilerLevel: MAJOR }),
];

// ---------------------------------------------------------------------------
// Quotes
// ---------------------------------------------------------------------------
const quotes: Seed[] = [
  o('quote-winter-is-coming', 'quote', '"Winter is coming."', 'Words of House Stark', 'stark'),
  o('quote-lannister-debts', 'quote', '"A Lannister always pays his debts."', 'Saying of House Lannister', 'lannister'),
  o('quote-know-nothing', 'quote', '"You know nothing, Jon Snow."', 'Ygritte', 'wildling'),
  o('quote-chaos-ladder', 'quote', '"Chaos is a ladder."', 'Petyr Baelish', 'baelish'),
  o('quote-night-is-dark', 'quote', '"The night is dark and full of terrors."', "Prayer to R'hllor", null),
  o('quote-valar-morghulis', 'quote', '"Valar morghulis." — All men must die.', 'High Valyrian', null),
  o('quote-not-today', 'quote', '"What do we say to the god of death? Not today."', 'Syrio Forel to Arya Stark', null),
  o('quote-i-drink-and-know', 'quote', '"I drink and I know things."', 'Tyrion Lannister', 'lannister'),
  o('quote-power-belief', 'quote', '"Power resides where men believe it resides."', 'Varys', null),
];

// ---------------------------------------------------------------------------
// Assemble every option, de-duplicated by id
// ---------------------------------------------------------------------------
const allSeeds: Seed[] = [
  ...characters, ...houses, ...dragons, ...battles, ...places,
  ...scenes, ...deaths, ...duos, ...couples, ...moments, ...quotes,
];

const byId = new Map<string, Seed>();
for (const s of allSeeds) byId.set(s.id, s);

export const options: Option[] = [...byId.values()].map((s) => ({
  id: s.id,
  type: s.type,
  name: s.name,
  subtitle: s.subtitle ?? null,
  house: s.house ?? null,
  medium: s.medium ?? B,
  spoilerLevel: s.spoilerLevel ?? NONE,
  featured: s.featured ?? true,
  source: s.source ?? 'seed',
  imageUrl: s.imageUrl ?? null,
  meta: s.meta ?? {},
}));

// ---------------------------------------------------------------------------
// Categories (17) — bilingual label/prompt + option ordering
// ---------------------------------------------------------------------------
interface CatSeed extends Category {
  optionIds: string[];
}

const developmentArcs = pick(
  'jaime-lannister', 'theon-greyjoy', 'sansa-stark', 'arya-stark', 'sandor-clegane',
  'daenerys-targaryen', 'cersei-lannister', 'samwell-tarly',
);
const villains = pick(
  'joffrey-baratheon', 'ramsay-bolton', 'cersei-lannister', 'tywin-lannister',
  'petyr-baelish', 'walder-frey', 'night-king', 'euron-greyjoy', 'gregor-clegane',
);
const featuredCharacters = pick(
  'jon-snow', 'arya-stark', 'daenerys-targaryen', 'tyrion-lannister', 'jaime-lannister',
  'sansa-stark', 'ned-stark', 'cersei-lannister', 'brienne-of-tarth', 'samwell-tarly',
  'sandor-clegane', 'bran-stark',
);
const hatedCharacters = pick(
  'joffrey-baratheon', 'ramsay-bolton', 'cersei-lannister', 'walder-frey', 'petyr-baelish',
  'theon-greyjoy', 'euron-greyjoy', 'stannis-baratheon', 'melisandre', 'gregor-clegane',
);

const cat = (
  slug: string,
  optionType: Category['optionType'],
  sortOrder: number,
  label: string,
  labelEs: string,
  prompt: string,
  promptEs: string,
  optionIds: string[],
): CatSeed => ({ slug, optionType, sortOrder, label, labelEs, prompt, promptEs, optionIds });

export const categories: CatSeed[] = [
  cat('casa-favorita', 'house', 1,
    'Favorite house', 'Casa favorita',
    "Choose the noble house you'd swear your sword to.", 'Elegí la casa noble a la que jurarías lealtad.',
    ids(houses)),
  cat('personaje-favorito-hombre', 'character', 2,
    'Favorite character (male)', 'Personaje favorito (hombre)',
    'The male character that marked you most.', 'El personaje masculino que más te marcó.',
    ids(male)),
  cat('personaje-favorito-mujer', 'character', 3,
    'Favorite character (female)', 'Personaje favorito (mujer)',
    'The female character that marked you most.', 'El personaje femenino que más te marcó.',
    ids(female)),
  cat('escena-favorita', 'scene', 4,
    'Favorite scene', 'Escena favorita',
    "The scene you'd rewatch right now.", 'La escena que volverías a ver ahora mismo.',
    ids(scenes)),
  cat('personaje-mas-odiado', 'character', 5,
    'Most hated character', 'Personaje más odiado',
    'The one you find hardest to forgive.', 'A quién te cuesta más perdonar.',
    hatedCharacters),
  cat('batalla-favorita', 'battle', 6,
    'Favorite battle', 'Batalla favorita',
    'The best-told clash.', 'El enfrentamiento mejor contado.',
    ids(battles)),
  cat('duo-favorito', 'duo', 7,
    'Favorite duo', 'Dúo favorito',
    'The non-romantic pairing you enjoy most.', 'La dupla (no romántica) que más disfrutás.',
    ids(duos)),
  cat('muerte-mas-satisfactoria', 'death', 8,
    'Most satisfying death', 'Muerte más satisfactoria',
    'The death that felt deserved.', 'La muerte que se sintió merecida.',
    ids(deaths)),
  cat('muerte-mas-triste', 'death', 9,
    'Saddest death', 'Muerte más triste',
    'The death that still hurts.', 'La muerte que todavía te duele.',
    ids(deaths)),
  cat('pareja-favorita', 'couple', 10,
    'Favorite couple', 'Pareja favorita',
    'The romance you rooted for.', 'La relación romántica por la que hiciste fuerza.',
    ids(couples)),
  cat('villano-favorito', 'character', 11,
    'Favorite villain', 'Villano favorito',
    'The antagonist you love to hate.', 'El antagonista que más disfrutás odiar.',
    villains),
  cat('mejor-momento', 'moment', 12,
    'Best moment', 'Mejor momento',
    'The beat that got you out of your seat.', 'El instante que te hizo levantarte del sillón.',
    ids(moments)),
  cat('mejor-desarrollo', 'character', 13,
    'Best character development', 'Mejor desarrollo de personaje',
    'Who changed the most — for better or worse.', 'Quién cambió más, para bien o para mal.',
    developmentArcs),
  cat('personaje-top-1', 'character', 14,
    'Top 1 character', 'Personaje Top 1',
    'If you could only save one.', 'Si solo pudieras salvar a uno.',
    featuredCharacters),
  cat('dragon-favorito', 'dragon', 15,
    'Favorite dragon', 'Dragón favorito',
    "The dragon you'd pick as your mount.", 'El dragón que elegirías como montura.',
    ids(dragons)),
  cat('lugar-favorito', 'place', 16,
    'Favorite place', 'Lugar favorito',
    "Where you'd like to wake up in Westeros or Essos.", 'Dónde te gustaría despertar en Poniente o Essos.',
    ids(places)),
  cat('frase-favorita', 'quote', 17,
    'Favorite quote', 'Frase favorita',
    'The line of dialogue that stuck with you.', 'La línea de diálogo que se te quedó grabada.',
    ids(quotes)),
];

export const users = [
  { slug: 'jugador-a', displayName: 'Player A', house: 'stark' as string | null },
  { slug: 'jugador-b', displayName: 'Player B', house: 'targaryen' as string | null },
];
