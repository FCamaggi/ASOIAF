import type { Option } from '../../shared/types.ts';

const BASE = 'https://www.anapioficeandfire.com/api';
const UA = 'asoiaf-trend-personal-app/0.1 (private two-player project)';
const PAGE_SIZE = 50;

async function pagedGet<T>(resource: string): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${BASE}/${resource}?page=${page}&pageSize=${PAGE_SIZE}`, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`AIOIAF ${resource} page ${page}: ${res.status}`);
    const batch = (await res.json()) as T[];
    if (batch.length === 0) break;
    out.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return out;
}

const idFromUrl = (url: string) => url.split('/').pop() ?? url;
const clean = (s: string) => s.trim().replace(/\s+/g, ' ');

interface RawCharacter {
  url: string;
  name: string;
  gender: string;
  culture: string;
  titles: string[];
  aliases: string[];
}
interface RawHouse {
  url: string;
  name: string;
  region: string;
  words: string;
  coatOfArms: string;
}

export async function importCharacters(): Promise<Option[]> {
  const raw = await pagedGet<RawCharacter>('characters');
  return raw
    .filter((c) => clean(c.name).length > 0)
    .map((c): Option => {
      const subtitle =
        clean(c.titles.find(Boolean) ?? '') ||
        clean(c.aliases.find(Boolean) ?? '') ||
        clean(c.culture) ||
        null;
      return {
        id: `aioiaf-char-${idFromUrl(c.url)}`,
        type: 'character',
        name: clean(c.name),
        subtitle,
        house: null,
        medium: 'both',
        spoilerLevel: 'none',
        featured: false,
        source: 'an-api-of-ice-and-fire',
        imageUrl: null,
        meta: { gender: c.gender === 'Male' || c.gender === 'Female' ? c.gender : null },
      };
    });
}

export async function importHouses(): Promise<Option[]> {
  const raw = await pagedGet<RawHouse>('houses');
  return raw
    .filter((h) => clean(h.name).length > 0)
    .map((h): Option => ({
      id: `aioiaf-house-${idFromUrl(h.url)}`,
      type: 'house',
      name: clean(h.name).replace(/^House\s+/i, 'Casa '),
      subtitle: [clean(h.words), clean(h.region)].filter(Boolean).join(' · ') || null,
      house: null,
      medium: 'both',
      spoilerLevel: 'none',
      featured: false,
      source: 'an-api-of-ice-and-fire',
      imageUrl: null,
      meta: { coatOfArms: clean(h.coatOfArms) || null },
    }));
}
