import { load, save, type DB } from './db.ts';
import { categories, options, users } from './seed-data.ts';

/**
 * Idempotent MERGE — runs on every boot. Ensures the curated baseline exists
 * without destroying anything added by `npm run import` (hundreds of characters,
 * houses, dragons, battles, places) or the images it downloaded.
 *
 *  - categories: fully owned by seed (they are never imported)
 *  - options:    upsert seed options, PRESERVE `imageUrl` on any existing option,
 *                keep imported options
 *  - links:      curated option ids first (seed order), imported ids after
 *  - orphans:    options no longer referenced by any category are pruned
 *  - users:      upsert, keep uploaded photos
 */

const db: DB = load();
const seedCatSlugs = new Set(categories.map((c) => c.slug));

// 1. categories --------------------------------------------------------------
db.catalogue.categories = categories.map((c) => ({
  slug: c.slug,
  label: c.label,
  labelEs: c.labelEs,
  prompt: c.prompt,
  promptEs: c.promptEs,
  optionType: c.optionType,
  sortOrder: c.sortOrder,
}));

// 2. options (merge, preserving imageUrl) -----------------------------------
const byId = new Map(db.catalogue.options.map((o) => [o.id, o]));
for (const so of options) {
  const prev = byId.get(so.id);
  byId.set(so.id, { ...so, imageUrl: prev?.imageUrl ?? so.imageUrl });
}

// 3. category -> option links ---------------------------------------------------
const nextLinks: Record<string, string[]> = {};
for (const c of categories) {
  const existing = db.catalogue.categoryOptions[c.slug] ?? [];
  const seedIds = c.optionIds;
  const seedSet = new Set(seedIds);
  const extra = existing.filter((id) => !seedSet.has(id) && byId.has(id));
  nextLinks[c.slug] = [...seedIds, ...extra];
}
db.catalogue.categoryOptions = nextLinks;

// 4. prune options referenced by nobody --------------------------------------
const referenced = new Set(Object.values(nextLinks).flat());
db.catalogue.options = [...byId.values()].filter((o) => referenced.has(o.id));

// 5. users ------------------------------------------------------------------
for (const u of users) {
  const prev = db.users[u.slug];
  db.users[u.slug] = {
    slug: u.slug,
    // name & photo are user-owned once set — seed only provides the initial value
    displayName: prev?.displayName ?? u.displayName,
    house: u.house,
    photoUrl: prev?.photoUrl ?? null,
  };
}

// 6. drop choices pointing at an option not offered in that category ---------
//    (write-ins — customName set, optionId null — are always kept)
for (const [userSlug, byCat] of Object.entries(db.choices)) {
  for (const [catSlug, choice] of Object.entries(byCat)) {
    const ok =
      !!choice.customName ||
      (!!choice.optionId && !!nextLinks[catSlug]?.includes(choice.optionId));
    if (!ok) delete db.choices[userSlug][catSlug];
  }
}

save(db);

console.log('Seed (merge) complete:', {
  users: Object.keys(db.users).length,
  categories: db.catalogue.categories.length,
  options: db.catalogue.options.length,
  withImages: db.catalogue.options.filter((o) => o.imageUrl).length,
  imported: db.catalogue.options.filter((o) => o.source !== 'seed').length,
  extraCats: Object.keys(db.catalogue.categoryOptions).filter((s) => !seedCatSlugs.has(s)).length,
});
