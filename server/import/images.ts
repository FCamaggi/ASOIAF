import { load, save } from '../db.ts';
import { slugToken, writeUploadBuffer } from '../uploads.ts';

/**
 * Attaches real images to catalogue options and downloads them into `uploads/`
 * (same-origin → the trend-card PNG export never taints the canvas):
 *   - characters  → ThronesAPI portraits (matched by name)
 *   - houses / places / dragons (curated only) → first Wikimedia Commons image
 * Anything without a match keeps the tinted-monogram fallback.
 */

const UA = 'asoiaf-trend-personal-app/0.1 (private two-player project)';
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

async function fetchImage(url: string): Promise<{ buf: Buffer; ext: string } | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.startsWith('image/')) return null;
    const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : 'jpg';
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 800 ? { buf, ext } : null;
  } catch {
    return null;
  }
}

async function thronesPortraits(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const res = await fetch('https://thronesapi.com/api/v2/Characters', {
      headers: { 'User-Agent': UA },
    });
    const list = (await res.json()) as { fullName?: string; imageUrl?: string }[];
    for (const c of list) {
      if (c.fullName && c.imageUrl) map.set(norm(c.fullName), c.imageUrl);
    }
  } catch {
    /* leave empty */
  }
  return map;
}

async function commonsImage(term: string): Promise<string | null> {
  try {
    const u = new URL('https://commons.wikimedia.org/w/api.php');
    u.searchParams.set('action', 'query');
    u.searchParams.set('format', 'json');
    u.searchParams.set('generator', 'search');
    u.searchParams.set('gsrsearch', `${term} filetype:bitmap`);
    u.searchParams.set('gsrnamespace', '6');
    u.searchParams.set('gsrlimit', '1');
    u.searchParams.set('prop', 'imageinfo');
    u.searchParams.set('iiprop', 'url');
    u.searchParams.set('iiurlwidth', '800');
    const res = await fetch(u, { headers: { 'User-Agent': UA } });
    const data = (await res.json()) as any;
    const pages = data?.query?.pages;
    if (!pages) return null;
    const first: any = Object.values(pages)[0];
    return first?.imageinfo?.[0]?.thumburl ?? first?.imageinfo?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

export async function importImages(): Promise<void> {
  const db = load();
  const portraits = await thronesPortraits();
  console.log(`ThronesAPI: ${portraits.size} portraits`);

  let attached = 0;
  for (const opt of db.catalogue.options) {
    if (opt.imageUrl) continue;

    let src: string | null = null;
    if (opt.type === 'character') {
      src = portraits.get(norm(opt.name)) ?? null;
    } else if (
      opt.source === 'seed' &&
      (opt.type === 'house' || opt.type === 'place' || opt.type === 'dragon')
    ) {
      const bare = opt.name.replace(/^House\s+/i, '');
      const term =
        opt.type === 'house'
          ? `${bare} sigil A Song of Ice and Fire`
          : opt.type === 'dragon'
            ? `${bare} dragon Game of Thrones`
            : `${bare} Game of Thrones`;
      src = await commonsImage(term);
    }
    if (!src) continue;

    const img = await fetchImage(src);
    if (!img) continue;
    opt.imageUrl = writeUploadBuffer(slugToken('opt', opt.id), img.buf, img.ext);
    attached++;
  }

  save(db);
  console.log(`Images: attached ${attached} / ${db.catalogue.options.length} options`);
}
