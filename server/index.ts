import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { load, save } from './db.ts';
import {
  UPLOAD_DIR,
  UPLOAD_ROUTE,
  ensureUploadDir,
  removeByPrefix,
  slugToken,
  writeUpload,
} from './uploads.ts';
import type {
  CategoryWithOptions,
  Choice,
  Comparison,
  ComparisonRow,
  Option,
  PreviewRow,
} from '../shared/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT ?? 3001);
const USER_SLUGS = ['jugador-a', 'jugador-b'] as const;
type UserSlug = (typeof USER_SLUGS)[number];
const isUser = (s: string): s is UserSlug => (USER_SLUGS as readonly string[]).includes(s);

const app = Fastify({ logger: true, bodyLimit: 8 * 1024 * 1024 });
await app.register(cors, { origin: true });

ensureUploadDir();
await app.register(fastifyStatic, {
  root: UPLOAD_DIR,
  prefix: `${UPLOAD_ROUTE}/`,
  decorateReply: false,
});

const db = load();
if (db.catalogue.categories.length === 0) {
  app.log.warn('Catálogo vacío — corré `npm run seed` (y opcionalmente `npm run import`).');
}

const optionById = () => new Map(db.catalogue.options.map((o) => [o.id, o]));
const sortedCategories = () =>
  [...db.catalogue.categories].sort((a, b) => a.sortOrder - b.sortOrder);

const validDataUrl = (v: unknown): v is string =>
  typeof v === 'string' && /^data:image\/(png|jpe?g|webp);base64,/.test(v);

// ---------------------------------------------------------------------------
app.get('/api/health', async () => ({ ok: true, seeded: db.catalogue.categories.length > 0 }));

app.get('/api/users', async () => USER_SLUGS.map((s) => db.users[s]).filter(Boolean));

app.post('/api/users/:slug/photo', async (req, reply) => {
  const { slug } = req.params as { slug: string };
  if (!isUser(slug) || !db.users[slug]) return reply.code(404).send({ error: 'unknown user' });
  const { dataUrl = null } = (req.body ?? {}) as { dataUrl?: string | null };

  if (dataUrl === null) {
    removeByPrefix(slugToken('avatar', slug));
    db.users[slug].photoUrl = null;
  } else {
    if (!validDataUrl(dataUrl)) return reply.code(400).send({ error: 'invalid image data URL' });
    const url = writeUpload(slugToken('avatar', slug), dataUrl);
    if (!url) return reply.code(400).send({ error: 'unsupported image type' });
    db.users[slug].photoUrl = url;
  }
  save(db);
  return db.users[slug];
});

app.get('/api/categories', async () => {
  const opts = optionById();
  return sortedCategories().map((c): CategoryWithOptions => ({
    ...c,
    options: (db.catalogue.categoryOptions[c.slug] ?? [])
      .map((id) => opts.get(id))
      .filter((o): o is Option => Boolean(o)),
  }));
});

app.get('/api/users/:slug/choices', async (req, reply) => {
  const { slug } = req.params as { slug: string };
  if (!isUser(slug)) return reply.code(404).send({ error: 'unknown user' });
  const byCat = db.choices[slug] ?? {};
  return Object.entries(byCat).map(
    ([categorySlug, c]): Choice => ({
      categorySlug,
      optionId: c.optionId ?? null,
      customName: c.customName ?? null,
      updatedAt: c.updatedAt,
      imageUrl: c.imageUrl ?? null,
    }),
  );
});

app.put('/api/users/:slug/choices/:categorySlug', async (req, reply) => {
  const { slug, categorySlug } = req.params as { slug: string; categorySlug: string };
  if (!isUser(slug)) return reply.code(404).send({ error: 'unknown user' });
  const allowed = db.catalogue.categoryOptions[categorySlug];
  if (!allowed) return reply.code(404).send({ error: 'unknown category' });

  const body = (req.body ?? {}) as { optionId?: string; customName?: string };
  const customName = typeof body.customName === 'string' ? body.customName.trim().slice(0, 80) : '';
  const optionId = body.optionId;

  if (!customName && !optionId) {
    return reply.code(400).send({ error: 'optionId or customName required' });
  }
  if (!customName && optionId && !allowed.includes(optionId)) {
    return reply.code(422).send({ error: 'option does not belong to this category' });
  }

  const prev = db.choices[slug]?.[categorySlug];
  const sameTarget =
    prev &&
    prev.optionId === (customName ? null : optionId ?? null) &&
    prev.customName === (customName || null);
  if (prev && !sameTarget && prev.imageUrl) {
    removeByPrefix(slugToken('pick', slug, categorySlug));
  }
  (db.choices[slug] ??= {})[categorySlug] = {
    optionId: customName ? null : optionId ?? null,
    customName: customName || null,
    updatedAt: new Date().toISOString(),
    imageUrl: sameTarget ? prev!.imageUrl : null,
  };
  save(db);
  return {
    categorySlug,
    optionId: customName ? null : optionId ?? null,
    customName: customName || null,
  };
});

app.post('/api/users/:slug/choices/:categorySlug/image', async (req, reply) => {
  const { slug, categorySlug } = req.params as { slug: string; categorySlug: string };
  if (!isUser(slug)) return reply.code(404).send({ error: 'unknown user' });
  const choice = db.choices[slug]?.[categorySlug];
  if (!choice) return reply.code(409).send({ error: 'choose an option first' });
  const { dataUrl = null } = (req.body ?? {}) as { dataUrl?: string | null };
  const token = slugToken('pick', slug, categorySlug);

  if (dataUrl === null) {
    removeByPrefix(token);
    choice.imageUrl = null;
  } else {
    if (!validDataUrl(dataUrl)) return reply.code(400).send({ error: 'invalid image data URL' });
    const url = writeUpload(token, dataUrl);
    if (!url) return reply.code(400).send({ error: 'unsupported image type' });
    choice.imageUrl = url;
  }
  save(db);
  return { categorySlug, imageUrl: choice.imageUrl };
});

const getOptById = (id: string | null | undefined): Option | null =>
  (id && optionById().get(id)) || null;
const resolveName = (c: StoredChoiceLike | undefined, o: Option | null): string | null =>
  c?.customName ?? o?.name ?? null;
const resolveImg = (c: StoredChoiceLike | undefined, o: Option | null): string | null =>
  c?.imageUrl ?? o?.imageUrl ?? null;
type StoredChoiceLike = { optionId: string | null; customName: string | null; imageUrl: string | null };

app.get('/api/comparison', async () => {
  const cats = sortedCategories();
  const aC = db.choices['jugador-a'] ?? {};
  const bC = db.choices['jugador-b'] ?? {};

  const rows: ComparisonRow[] = cats.map((category) => {
    const ca = aC[category.slug];
    const cb = bC[category.slug];
    const a = getOptById(ca?.optionId);
    const b = getOptById(cb?.optionId);
    const aName = resolveName(ca, a);
    const bName = resolveName(cb, b);
    const match =
      !!aName && !!bName && aName.toLowerCase().trim() === bName.toLowerCase().trim();
    return {
      category,
      a,
      b,
      aName,
      bName,
      aImageUrl: resolveImg(ca, a),
      bImageUrl: resolveImg(cb, b),
      match,
    };
  });

  const total = cats.length;
  const aComplete = total > 0 && cats.every((c) => aC[c.slug]);
  const bComplete = total > 0 && cats.every((c) => bC[c.slug]);

  const result: Comparison = {
    users: { a: db.users['jugador-a'], b: db.users['jugador-b'] },
    aComplete,
    bComplete,
    bothComplete: aComplete && bComplete,
    total,
    rows,
  };
  return result;
});

// One player's own picks — the solo preview (no opponent data).
app.get('/api/users/:slug/preview', async (req, reply) => {
  const { slug } = req.params as { slug: string };
  if (!isUser(slug)) return reply.code(404).send({ error: 'unknown user' });
  const mine = db.choices[slug] ?? {};
  const rows: PreviewRow[] = sortedCategories().map((category) => {
    const c = mine[category.slug];
    const option = getOptById(c?.optionId);
    return {
      category,
      option,
      name: resolveName(c, option),
      imageUrl: resolveImg(c, option),
      custom: !!c?.customName,
    };
  });
  return {
    user: db.users[slug],
    total: rows.length,
    answered: rows.filter((r) => r.name).length,
    rows,
  };
});

// ---------------------------------------------------------------------------
if (existsSync(DIST)) {
  await app.register(fastifyStatic, { root: DIST });
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api') || req.url.startsWith(UPLOAD_ROUTE)) {
      return reply.code(404).send({ error: 'not found' });
    }
    return reply.sendFile('index.html');
  });
}

app
  .listen({ host: '0.0.0.0', port: PORT })
  .then(() => app.log.info(`ASOIAF Trend API on :${PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
