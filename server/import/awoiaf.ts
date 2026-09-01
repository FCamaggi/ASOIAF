import type { Option, OptionType } from '../../shared/types.ts';

const API = 'https://awoiaf.westeros.org/api.php';
const UA = 'asoiaf-trend-personal-app/0.1 (private two-player project)';

interface CategoryMember {
  pageid: number;
  ns: number;
  title: string;
}

async function categoryMembers(category: string): Promise<string[]> {
  const titles: string[] = [];
  let cmcontinue: string | undefined;
  do {
    const url = new URL(API);
    url.searchParams.set('action', 'query');
    url.searchParams.set('format', 'json');
    url.searchParams.set('list', 'categorymembers');
    url.searchParams.set('cmtitle', `Category:${category}`);
    url.searchParams.set('cmlimit', '500');
    url.searchParams.set('cmtype', 'page');
    if (cmcontinue) url.searchParams.set('cmcontinue', cmcontinue);

    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`AWOIAF ${category}: ${res.status}`);
    const data = (await res.json()) as {
      query?: { categorymembers?: CategoryMember[] };
      continue?: { cmcontinue?: string };
    };
    for (const m of data.query?.categorymembers ?? []) {
      if (m.ns === 0) titles.push(m.title);
    }
    cmcontinue = data.continue?.cmcontinue;
  } while (cmcontinue);
  return titles;
}

const JUNK = /^(List of|Timeline|Category:|Template:|Portal:|Help:)/i;
const slugify = (t: string) =>
  t
    .toLowerCase()
    .replace(/[''´]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function toOptions(titles: string[], type: OptionType, tag: string, house: string | null): Option[] {
  const seen = new Set<string>();
  const out: Option[] = [];
  for (const title of titles) {
    if (JUNK.test(title)) continue;
    const slug = slugify(title);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({
      id: `awoiaf-${tag}-${slug}`,
      type,
      name: title,
      subtitle: null,
      house,
      medium: 'both',
      spoilerLevel: 'none',
      featured: false,
      source: 'awoiaf',
      imageUrl: null,
      meta: { wiki: `https://awoiaf.westeros.org/index.php/${encodeURIComponent(title.replace(/ /g, '_'))}` },
    });
  }
  return out;
}

export async function importDragons(): Promise<Option[]> {
  return toOptions(await categoryMembers('Dragons'), 'dragon', 'dragon', 'targaryen');
}

export async function importBattles(): Promise<Option[]> {
  const titles = [
    ...(await categoryMembers('Battles')),
    ...(await categoryMembers('Sieges')),
  ];
  return toOptions(titles, 'battle', 'battle', null);
}

export async function importPlaces(): Promise<Option[]> {
  const titles: string[] = [];
  for (const cat of ['Castles', 'Cities', 'Towns', 'Regions', 'Islands']) {
    titles.push(...(await categoryMembers(cat)));
  }
  return toOptions(titles, 'place', 'place', null);
}
