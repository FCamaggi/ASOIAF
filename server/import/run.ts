import { load, save, type DB } from '../db.ts';
import type { Option } from '../../shared/types.ts';
import { importCharacters, importHouses } from './aioiaf.ts';
import { importBattles, importDragons, importPlaces } from './awoiaf.ts';

/**
 * Enriches the curated catalogue with encyclopedic entities pulled once from
 * external sources (per docs/Investigacion-de-desarrollo.md: import, don't
 * proxy). Curated `seed` options keep their spot at the front of each category;
 * imported ones are appended as `featured: false` (search-only in the UI).
 *
 * Run order:  npm run seed   →   npm run import
 */

const db: DB = load();

if (db.catalogue.categories.length === 0) {
  console.error('El catálogo está vacío. Corré `npm run seed` primero.');
  process.exit(1);
}

function upsertOptions(incoming: Option[]) {
  const byId = new Map(db.catalogue.options.map((o) => [o.id, o]));
  let added = 0;
  for (const o of incoming) {
    if (byId.has(o.id)) {
      // refresh text but never demote a curated option
      const existing = byId.get(o.id)!;
      if (existing.source !== 'seed') Object.assign(existing, o);
    } else {
      db.catalogue.options.push(o);
      byId.set(o.id, o);
      added++;
    }
  }
  return added;
}

function appendToCategory(categorySlug: string, optionIds: string[]) {
  const list = (db.catalogue.categoryOptions[categorySlug] ??= []);
  const have = new Set(list);
  for (const id of optionIds) {
    if (!have.has(id)) {
      list.push(id);
      have.add(id);
    }
  }
}

const [characters, houses, dragons, battles, places] = await Promise.all([
  importCharacters(),
  importHouses(),
  importDragons(),
  importBattles(),
  importPlaces(),
]);

const male = characters.filter((c) => (c.meta as any).gender === 'Male').map((c) => c.id);
const female = characters.filter((c) => (c.meta as any).gender === 'Female').map((c) => c.id);
const allChars = characters.map((c) => c.id);

const addedOptions =
  upsertOptions(characters) +
  upsertOptions(houses) +
  upsertOptions(dragons) +
  upsertOptions(battles) +
  upsertOptions(places);

appendToCategory('casa-favorita', houses.map((h) => h.id));
appendToCategory('personaje-favorito-hombre', male);
appendToCategory('personaje-favorito-mujer', female);
appendToCategory('personaje-mas-odiado', allChars);
appendToCategory('villano-favorito', allChars);
appendToCategory('mejor-desarrollo', allChars);
appendToCategory('personaje-top-1', allChars);
appendToCategory('dragon-favorito', dragons.map((d) => d.id));
appendToCategory('batalla-favorita', battles.map((b) => b.id));
appendToCategory('lugar-favorito', places.map((p) => p.id));

save(db);

console.log('Import complete:', {
  charactersFetched: characters.length,
  housesFetched: houses.length,
  dragonsFetched: dragons.length,
  battlesFetched: battles.length,
  placesFetched: places.length,
  newOptionsAdded: addedOptions,
  totalOptions: db.catalogue.options.length,
});
