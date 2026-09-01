import { load, save, type DB } from './db.ts';
import { categories, options, users } from './seed-data.ts';

const db: DB = load();

// Rebuild the catalogue from seed-data; keep user photos and still-valid choices.
db.catalogue = {
  categories: categories.map((c) => ({
    slug: c.slug,
    label: c.label,
    prompt: c.prompt,
    optionType: c.optionType,
    sortOrder: c.sortOrder,
  })),
  options,
  categoryOptions: Object.fromEntries(categories.map((c) => [c.slug, c.optionIds])),
};

for (const u of users) {
  const existing = db.users[u.slug];
  db.users[u.slug] = {
    slug: u.slug,
    displayName: u.displayName,
    house: u.house,
    photoUrl: existing?.photoUrl ?? null,
  };
}

// Drop choices pointing at an option no longer offered in that category.
for (const [userSlug, byCat] of Object.entries(db.choices)) {
  for (const [catSlug, choice] of Object.entries(byCat)) {
    const valid = db.catalogue.categoryOptions[catSlug]?.includes(choice.optionId);
    if (!valid) delete db.choices[userSlug][catSlug];
  }
}

save(db);

console.log('Seed complete:', {
  users: Object.keys(db.users).length,
  categories: db.catalogue.categories.length,
  options: db.catalogue.options.length,
  links: Object.values(db.catalogue.categoryOptions).reduce((n, a) => n + a.length, 0),
});
