import type { Category, Medium, Option, SpoilerLevel } from '../shared/types.ts';

/**
 * Hand-curated catalogue. No external API calls: every option below is a small,
 * self-contained record. Images are intentionally absent — the client renders a
 * sigil / initials fallback tinted by `house`.
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
  CH('jon-snow', 'Jon Snow', 'stark', 'Male', 'El bastardo de Invernalia · Lord Comandante'),
  CH('arya-stark', 'Arya Stark', 'stark', 'Female', 'Una chica sin nombre'),
  CH('sansa-stark', 'Sansa Stark', 'stark', 'Female', 'La loba del Norte'),
  CH('daenerys-targaryen', 'Daenerys Targaryen', 'targaryen', 'Female', 'Madre de Dragones · La que no arde'),
  CH('tyrion-lannister', 'Tyrion Lannister', 'lannister', 'Male', 'El Gnomo · Mano de la Reina'),
  CH('jaime-lannister', 'Jaime Lannister', 'lannister', 'Male', 'El Matarreyes'),
  CH('cersei-lannister', 'Cersei Lannister', 'lannister', 'Female', 'Reina Regente de los Siete Reinos'),
  CH('ned-stark', 'Eddard Stark', 'stark', 'Male', 'Guardián del Norte · Mano del Rey'),
  CH('catelyn-stark', 'Catelyn Tully', 'tully', 'Female', 'Señora de Invernalia'),
  CH('robb-stark', 'Robb Stark', 'stark', 'Male', 'El Joven Lobo · Rey en el Norte'),
  CH('bran-stark', 'Brandon Stark', 'stark', 'Male', 'El Cuervo de Tres Ojos'),
  CH('brienne-of-tarth', 'Brienne de Tarth', 'baratheon', 'Female', 'La Doncella de Tarth'),
  CH('sandor-clegane', 'Sandor Clegane', 'clegane', 'Male', 'El Perro'),
  CH('petyr-baelish', 'Petyr Baelish', 'baelish', 'Male', 'Meñique'),
  CH('varys', 'Varys', null, 'Male', 'La Araña · Consejero de los Rumores'),
  CH('theon-greyjoy', 'Theon Greyjoy', 'greyjoy', 'Male', 'Pupilo de Invernalia · Hediondo'),
  CH('samwell-tarly', 'Samwell Tarly', 'tarly', 'Male', 'Sam el Mortífero'),
  CH('davos-seaworth', 'Davos Seaworth', 'baratheon', 'Male', 'El Caballero de la Cebolla'),
  CH('stannis-baratheon', 'Stannis Baratheon', 'baratheon', 'Male', 'El legítimo rey · Rocadragón'),
  CH('joffrey-baratheon', 'Joffrey Baratheon', 'lannister', 'Male', 'Rey de los Siete Reinos'),
  CH('ramsay-bolton', 'Ramsay Bolton', 'bolton', 'Male', 'El Bastardo de Fuerte Terror'),
  CH('tywin-lannister', 'Tywin Lannister', 'lannister', 'Male', 'Señor de Roca Casterly'),
  CH('oberyn-martell', 'Oberyn Martell', 'martell', 'Male', 'La Víbora Roja de Dorne'),
  CH('ygritte', 'Ygritte', 'wildling', 'Female', "Mujer libre · 'No sabes nada'"),
  CH('melisandre', 'Melisandre', null, 'Female', 'La Mujer Roja de Asshai'),
  CH('margaery-tyrell', 'Margaery Tyrell', 'tyrell', 'Female', 'Futura reina de espinas'),
  CH('missandei', 'Missandei', null, 'Female', 'De Naath · Voz de la Reina'),
  CH('walder-frey', 'Walder Frey', 'frey', 'Male', 'Señor del Cruce'),
  CH('night-king', 'El Rey de la Noche', 'whitewalkers', 'Male', 'Comandante de los Otros'),
  CH('euron-greyjoy', 'Euron Greyjoy', 'greyjoy', 'Male', 'Ojo de Cuervo'),
  CH('gregor-clegane', 'Gregor Clegane', 'clegane', 'Male', 'La Montaña que Cabalga'),
];

const male = characters.filter((c) => (c.meta as any)?.gender === 'Male');
const female = characters.filter((c) => (c.meta as any)?.gender === 'Female');
const ids = (list: Seed[]) => list.map((c) => c.id);
const pick = (...slugs: string[]) => slugs;

// ---------------------------------------------------------------------------
// Houses
// ---------------------------------------------------------------------------
const houses: Seed[] = [
  o('house-stark', 'house', 'Casa Stark', 'Se acerca el invierno · El Norte', 'stark'),
  o('house-targaryen', 'house', 'Casa Targaryen', 'Fuego y Sangre · Rocadragón', 'targaryen'),
  o('house-lannister', 'house', 'Casa Lannister', '¡Oye mi rugido! · Roca Casterly', 'lannister'),
  o('house-baratheon', 'house', 'Casa Baratheon', 'Nuestra es la furia · Bastión de Tormentas', 'baratheon'),
  o('house-tyrell', 'house', 'Casa Tyrell', 'Crecer fuerte · Altojardín', 'tyrell'),
  o('house-martell', 'house', 'Casa Martell', 'Nunca doblegado, nunca roto · Dorne', 'martell'),
  o('house-greyjoy', 'house', 'Casa Greyjoy', 'Nosotros no sembramos · Pyke', 'greyjoy'),
  o('house-tully', 'house', 'Casa Tully', 'Familia, deber, honor · Aguasdulces', 'tully'),
  o('house-arryn', 'house', 'Casa Arryn', 'Tan alto como el honor · El Nido de Águilas', 'arryn'),
  o('house-bolton', 'house', 'Casa Bolton', 'Nuestras hojas están afiladas · Fuerte Terror', 'bolton'),
];

// ---------------------------------------------------------------------------
// Dragons
// ---------------------------------------------------------------------------
const dragons: Seed[] = [
  o('balerion', 'dragon', 'Balerion', 'El Terror Negro · montura de Aegon el Conquistador', 'targaryen'),
  o('drogon', 'dragon', 'Drogon', 'El dragón negro de Daenerys', 'targaryen'),
  o('rhaegal', 'dragon', 'Rhaegal', 'El dragón verde y bronce', 'targaryen'),
  o('viserion', 'dragon', 'Viserion', 'El dragón crema y oro', 'targaryen'),
  o('vhagar', 'dragon', 'Vhagar', 'El dragón más grande de la Danza', 'targaryen'),
  o('caraxes', 'dragon', 'Caraxes', 'La Serpiente Sangrienta · montura de Daemon', 'targaryen'),
  o('meraxes', 'dragon', 'Meraxes', 'Montura de Rhaenys la conquistadora', 'targaryen'),
  o('sunfyre', 'dragon', 'Sunfyre', 'El Dorado · el dragón más bello jamás visto', 'targaryen'),
  o('syrax', 'dragon', 'Syrax', 'Montura de Rhaenyra Targaryen', 'targaryen'),
];

// ---------------------------------------------------------------------------
// Battles
// ---------------------------------------------------------------------------
const battles: Seed[] = [
  o('battle-blackwater', 'battle', 'Batalla del Aguasnegras', 'Fuego valyrio sobre la bahía de Desembarco', 'lannister'),
  o('battle-bastards', 'battle', 'La Batalla de los Bastardos', 'Jon Snow contra Ramsay Bolton por Invernalia', 'stark', { spoilerLevel: MAJOR }),
  o('battle-whispering-wood', 'battle', 'El Bosque Susurrante', 'Robb Stark captura al Matarreyes', 'stark'),
  o('battle-hardhome', 'battle', 'La Masacre de Casa Austera', 'Los vivos contra el ejército de los muertos', 'wildling', { spoilerLevel: MAJOR }),
  o('battle-castle-black', 'battle', 'El asalto al Castillo Negro', 'La Guardia de la Noche contra el pueblo libre', null),
  o('battle-field-of-fire', 'battle', 'El Campo de Fuego', 'Aegon y sus tres dragones queman a 55.000 hombres', 'targaryen'),
  o('battle-tumbleton', 'battle', 'El Saqueo de Tumbleton', 'La traición de los Dos Traidores en la Danza', 'targaryen', { spoilerLevel: MAJOR }),
  o('battle-loot-train', 'battle', 'El ataque del convoy', 'Drogon y los dothraki contra el oro Lannister', 'targaryen', { spoilerLevel: MAJOR }),
];

// ---------------------------------------------------------------------------
// Places
// ---------------------------------------------------------------------------
const places: Seed[] = [
  o('winterfell', 'place', 'Invernalia', 'El corazón del Norte', 'stark'),
  o('kings-landing', 'place', 'Desembarco del Rey', 'El Trono de Hierro y la Fortaleza Roja', 'baratheon'),
  o('the-wall', 'place', 'El Muro', '213 metros de hielo antiguo', null),
  o('dragonstone', 'place', 'Rocadragón', 'Fortaleza de piedra volcánica', 'targaryen'),
  o('highgarden', 'place', 'Altojardín', 'Jardines y abundancia del Dominio', 'tyrell'),
  o('braavos', 'place', 'Braavos', 'El Titán y la Casa de Blanco y Negro', null),
  o('valyria', 'place', 'Valyria', 'Las ruinas humeantes del Feudo Franco', 'targaryen'),
  o('sunspear', 'place', 'Lanza del Sol', 'El calor y las serpientes de arena de Dorne', 'martell'),
  o('the-eyrie', 'place', 'El Nido de Águilas', 'La Puerta de la Luna', 'arryn'),
  o('pyke', 'place', 'Pyke', 'Torres sobre el mar de hierro', 'greyjoy'),
];

// ---------------------------------------------------------------------------
// Scenes (curated editorial moments — mostly major spoilers)
// ---------------------------------------------------------------------------
const scenes: Seed[] = [
  o('scene-red-wedding', 'scene', 'La Boda Roja', 'Los Frey rompen el derecho de huésped', 'frey', { spoilerLevel: MAJOR }),
  o('scene-bastards-charge', 'scene', 'La carga en solitario de Jon', 'Polvo, caballos y una espada desenvainada', 'stark', { spoilerLevel: MAJOR }),
  o('scene-hold-the-door', 'scene', "'Sostén la puerta'", 'El origen de Hodor', 'stark', { spoilerLevel: MAJOR }),
  o('scene-mountain-viper', 'scene', 'La Montaña y la Víbora', 'El juicio por combate de Tyrion en Dorne', 'martell', { spoilerLevel: MAJOR }),
  o('scene-dracarys-astapor', 'scene', "'Dracarys' en Astapor", 'Daenerys libera a los Inmaculados', 'targaryen', { spoilerLevel: MAJOR }),
  o('scene-ned-execution', 'scene', 'La ejecución de Ned Stark', 'El Septo de Baelor', 'stark', { spoilerLevel: MAJOR }),
  o('scene-light-of-the-seven', 'scene', "'Luz de los Siete'", 'El Septo de Baelor arde con fuego valyrio', 'lannister', { spoilerLevel: MAJOR }),
  o('scene-shame-walk', 'scene', 'El paseo de la vergüenza', "'Vergüenza. Vergüenza. Vergüenza.'", 'lannister', { spoilerLevel: MAJOR }),
  o('scene-tower-of-joy', 'scene', 'La Torre de la Alegría', 'La promesa que Ned le hizo a Lyanna', 'stark', { spoilerLevel: MAJOR }),
  o('scene-purple-wedding', 'scene', 'La Boda Púrpura', 'Un último brindis para el rey Joffrey', 'lannister', { spoilerLevel: MAJOR }),
];

// ---------------------------------------------------------------------------
// Deaths (shared pool for "más satisfactoria" y "más triste")
// ---------------------------------------------------------------------------
const deaths: Seed[] = [
  o('death-ned-stark', 'death', 'Muerte de Ned Stark', 'Decapitado por orden de Joffrey', 'stark', { spoilerLevel: MAJOR }),
  o('death-joffrey', 'death', 'Muerte de Joffrey Baratheon', 'Envenenado en su propia boda', 'lannister', { spoilerLevel: MAJOR }),
  o('death-tywin', 'death', 'Muerte de Tywin Lannister', 'En el retrete, a manos de su hijo Tyrion', 'lannister', { spoilerLevel: MAJOR }),
  o('death-ramsay', 'death', 'Muerte de Ramsay Bolton', 'Devorado por sus propios sabuesos', 'bolton', { spoilerLevel: MAJOR }),
  o('death-oberyn', 'death', 'Muerte de Oberyn Martell', 'Aplastado por la Montaña en pleno triunfo', 'martell', { spoilerLevel: MAJOR }),
  o('death-robb-catelyn', 'death', 'Muerte de Robb y Catelyn Stark', 'En la Boda Roja', 'stark', { spoilerLevel: MAJOR }),
  o('death-hodor', 'death', 'Muerte de Hodor', 'Sosteniendo la puerta hasta el final', 'stark', { spoilerLevel: MAJOR }),
  o('death-shireen', 'death', 'Muerte de Shireen Baratheon', 'Quemada en la hoguera por su propio padre', 'baratheon', { spoilerLevel: MAJOR }),
  o('death-viserys', 'death', 'Muerte de Viserys Targaryen', 'Una corona de oro fundido', 'targaryen', { spoilerLevel: MAJOR }),
  o('death-olenna', 'death', 'Muerte de Olenna Tyrell', "'Decidle que fui yo'", 'tyrell', { spoilerLevel: MAJOR }),
  o('death-littlefinger', 'death', 'Muerte de Petyr Baelish', 'Juzgado y ejecutado en Invernalia', 'baelish', { spoilerLevel: MAJOR }),
  o('death-lyanna-mormont', 'death', 'Muerte de Lyanna Mormont', 'Derriba a un gigante con ella', 'stark', { spoilerLevel: MAJOR }),
];

// ---------------------------------------------------------------------------
// Duos & couples (composed of two characters)
// ---------------------------------------------------------------------------
const duo = (id: string, name: string, subtitle: string, house: string | null, members: string[]) =>
  o(id, 'duo', name, subtitle, house, { meta: { members } });

const duos: Seed[] = [
  duo('duo-arya-hound', 'Arya Stark & Sandor Clegane', 'El viaje más improbable de Poniente', 'stark', ['arya-stark', 'sandor-clegane']),
  duo('duo-jaime-brienne', 'Jaime Lannister & Brienne de Tarth', 'Honor forjado a regañadientes', 'lannister', ['jaime-lannister', 'brienne-of-tarth']),
  duo('duo-tyrion-varys', 'Tyrion Lannister & Varys', 'Ingenio y susurros', 'lannister', ['tyrion-lannister', 'varys']),
  duo('duo-jon-sam', 'Jon Snow & Samwell Tarly', 'Hermanos juramentados de la Guardia', null, ['jon-snow', 'samwell-tarly']),
  duo('duo-brienne-pod', 'Brienne de Tarth & Podrick Payne', 'La caballero y su escudero', 'baratheon', ['brienne-of-tarth', 'petyr-baelish']),
  duo('duo-davos-shireen', 'Davos Seaworth & Shireen Baratheon', 'Lecciones de lectura junto al fuego', 'baratheon', ['davos-seaworth', 'stannis-baratheon']),
  duo('duo-dany-jorah', 'Daenerys Targaryen & Jorah Mormont', 'Lealtad hasta el último aliento', 'targaryen', ['daenerys-targaryen', 'missandei']),
  duo('duo-bronn-tyrion', 'Bronn & Tyrion Lannister', 'Oro por adelantado, espada después', 'lannister', ['tyrion-lannister', 'jaime-lannister']),
];

const couple = (id: string, name: string, subtitle: string, house: string | null, members: string[], spoiler: SpoilerLevel = NONE) =>
  o(id, 'couple', name, subtitle, house, { meta: { members }, spoilerLevel: spoiler });

const couples: Seed[] = [
  couple('couple-jon-ygritte', 'Jon Snow & Ygritte', "'No sabes nada, Jon Nieve'", 'wildling', ['jon-snow', 'ygritte']),
  couple('couple-robb-talisa', 'Robb Stark & Talisa', 'Un amor que costó un reino', 'stark', ['robb-stark', 'catelyn-stark'], MAJOR),
  couple('couple-sam-gilly', 'Samwell Tarly & Gilly', 'Ternura al norte del Muro', null, ['samwell-tarly', 'ygritte']),
  couple('couple-ned-catelyn', 'Ned & Catelyn Stark', 'Un deber que se volvió amor', 'stark', ['ned-stark', 'catelyn-stark']),
  couple('couple-dany-drogo', 'Daenerys Targaryen & Khal Drogo', 'Mi sol y estrellas', 'targaryen', ['daenerys-targaryen', 'jon-snow']),
  couple('couple-jaime-cersei', 'Jaime & Cersei Lannister', 'Lo que el oro y el orgullo unen', 'lannister', ['jaime-lannister', 'cersei-lannister'], MAJOR),
  couple('couple-arya-gendry', 'Arya Stark & Gendry', "'Podrías ser mi familia'", 'stark', ['arya-stark', 'robb-stark']),
  couple('couple-missandei-grey-worm', 'Missandei & Gusano Gris', 'Amor entre libres de Naath y Astapor', null, ['missandei', 'daenerys-targaryen']),
];

// ---------------------------------------------------------------------------
// Moments (uplifting / iconic beats)
// ---------------------------------------------------------------------------
const moments: Seed[] = [
  o('moment-king-in-the-north', 'moment', "'¡El Rey en el Norte!'", 'Los banderizos alzan a Jon Snow sobre sus hombros', 'stark', { spoilerLevel: MAJOR }),
  o('moment-dragons-fly', 'moment', 'El primer vuelo de Drogon', 'Daenerys surca el cielo del reñidero de Meereen', 'targaryen', { spoilerLevel: MAJOR }),
  o('moment-arya-list', 'moment', 'Arya tacha un nombre de su lista', 'La deuda de la Boda Roja, saldada', 'stark', { spoilerLevel: MAJOR }),
  o('moment-brienne-knighted', 'moment', 'Brienne es nombrada caballero', 'Junto al fuego, la víspera de la batalla', 'baratheon', { spoilerLevel: MAJOR }),
  o('moment-tyrion-trial', 'moment', 'El discurso de Tyrion en su juicio', "'Ojalá tuviera veneno para toda la sala'", 'lannister', { spoilerLevel: MAJOR }),
  o('moment-dany-astapor', 'moment', 'Daenerys toma Astapor', "'Un dragón no es un esclavo.'", 'targaryen', { spoilerLevel: MAJOR }),
  o('moment-hardhome-look', 'moment', 'La mirada final en Casa Austera', 'El Rey de la Noche levanta los brazos', null, { spoilerLevel: MAJOR }),
  o('moment-jaime-confession', 'moment', 'La confesión del Matarreyes', 'Jaime le cuenta a Brienne por qué mató al Rey Loco', 'lannister', { spoilerLevel: MAJOR }),
];

// ---------------------------------------------------------------------------
// Quotes
// ---------------------------------------------------------------------------
const quotes: Seed[] = [
  o('quote-winter-is-coming', 'quote', '"Se acerca el invierno."', 'Palabras de la Casa Stark', 'stark'),
  o('quote-lannister-debts', 'quote', '"Un Lannister siempre paga sus deudas."', 'Dicho de la Casa Lannister', 'lannister'),
  o('quote-know-nothing', 'quote', '"No sabes nada, Jon Nieve."', 'Ygritte', 'wildling'),
  o('quote-chaos-ladder', 'quote', '"El caos es una escalera."', 'Petyr Baelish', 'baelish'),
  o('quote-night-is-dark', 'quote', '"La noche es oscura y alberga horrores."', "Rezo de R'hllor", null),
  o('quote-valar-morghulis', 'quote', '"Valar morghulis." — Todos los hombres deben morir.', 'Alto valyrio', null),
  o('quote-not-today', 'quote', '"¿Qué le decimos al dios de la muerte? Hoy no."', 'Syrio Forel a Arya Stark', null),
  o('quote-i-drink-and-know', 'quote', '"Bebo y sé cosas."', 'Tyrion Lannister', 'lannister'),
  o('quote-power-belief', 'quote', '"El poder reside donde los hombres creen que reside."', 'Varys', null),
];

// ---------------------------------------------------------------------------
// Assemble every option, de-duplicated by id
// ---------------------------------------------------------------------------
const allSeeds: Seed[] = [
  ...characters,
  ...houses,
  ...dragons,
  ...battles,
  ...places,
  ...scenes,
  ...deaths,
  ...duos,
  ...couples,
  ...moments,
  ...quotes,
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
// Categories (17) + their option ordering
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

export const categories: CatSeed[] = [
  {
    slug: 'casa-favorita', label: 'Casa favorita', optionType: 'house', sortOrder: 1,
    prompt: 'Elige la casa noble a la que jurarías lealtad.',
    optionIds: ids(houses),
  },
  {
    slug: 'personaje-favorito-hombre', label: 'Personaje favorito (hombre)', optionType: 'character', sortOrder: 2,
    prompt: 'El personaje masculino que más te marcó.',
    optionIds: ids(male),
  },
  {
    slug: 'personaje-favorito-mujer', label: 'Personaje favorito (mujer)', optionType: 'character', sortOrder: 3,
    prompt: 'El personaje femenino que más te marcó.',
    optionIds: ids(female),
  },
  {
    slug: 'escena-favorita', label: 'Escena favorita', optionType: 'scene', sortOrder: 4,
    prompt: 'La escena que volverías a ver ahora mismo.',
    optionIds: ids(scenes),
  },
  {
    slug: 'personaje-mas-odiado', label: 'Personaje más odiado', optionType: 'character', sortOrder: 5,
    prompt: 'A quién te cuesta más perdonar.',
    optionIds: hatedCharacters,
  },
  {
    slug: 'batalla-favorita', label: 'Batalla favorita', optionType: 'battle', sortOrder: 6,
    prompt: 'El enfrentamiento que mejor está contado.',
    optionIds: ids(battles),
  },
  {
    slug: 'duo-favorito', label: 'Dúo favorito', optionType: 'duo', sortOrder: 7,
    prompt: 'La pareja de viaje (no romántica) que más disfrutas.',
    optionIds: ids(duos),
  },
  {
    slug: 'muerte-mas-satisfactoria', label: 'Muerte más satisfactoria', optionType: 'death', sortOrder: 8,
    prompt: 'La muerte que se sintió merecida.',
    optionIds: ids(deaths),
  },
  {
    slug: 'muerte-mas-triste', label: 'Muerte más triste', optionType: 'death', sortOrder: 9,
    prompt: 'La muerte que todavía te duele.',
    optionIds: ids(deaths),
  },
  {
    slug: 'pareja-favorita', label: 'Pareja favorita', optionType: 'couple', sortOrder: 10,
    prompt: 'La relación romántica por la que hiciste fuerza.',
    optionIds: ids(couples),
  },
  {
    slug: 'villano-favorito', label: 'Villano favorito', optionType: 'character', sortOrder: 11,
    prompt: 'El antagonista que más disfrutas odiar.',
    optionIds: villains,
  },
  {
    slug: 'mejor-momento', label: 'Mejor momento', optionType: 'moment', sortOrder: 12,
    prompt: 'El instante que te hizo levantarte del sillón.',
    optionIds: ids(moments),
  },
  {
    slug: 'mejor-desarrollo', label: 'Mejor desarrollo de personaje', optionType: 'character', sortOrder: 13,
    prompt: 'Quién cambió más — para bien o para mal.',
    optionIds: developmentArcs,
  },
  {
    slug: 'personaje-top-1', label: 'Personaje Top 1', optionType: 'character', sortOrder: 14,
    prompt: 'Si solo pudieras salvar a uno.',
    optionIds: featuredCharacters,
  },
  {
    slug: 'dragon-favorito', label: 'Dragón favorito', optionType: 'dragon', sortOrder: 15,
    prompt: 'El dragón que elegirías como montura.',
    optionIds: ids(dragons),
  },
  {
    slug: 'lugar-favorito', label: 'Lugar favorito', optionType: 'place', sortOrder: 16,
    prompt: 'Dónde te gustaría despertar en Poniente o Essos.',
    optionIds: ids(places),
  },
  {
    slug: 'frase-favorita', label: 'Frase favorita', optionType: 'quote', sortOrder: 17,
    prompt: 'La línea de diálogo que se te quedó grabada.',
    optionIds: ids(quotes),
  },
];

export const users = [
  { slug: 'jugador-a', displayName: 'Jugador A', house: 'stark' as string | null },
  { slug: 'jugador-b', displayName: 'Jugador B', house: 'targaryen' as string | null },
];
