import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR || join(__dirname, '..', 'uploads');
export const UPLOAD_ROUTE = '/uploads';

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
};

export function ensureUploadDir(): void {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
}

/** Parse a base64 image data URL. Returns null if it isn't one. */
export function parseDataUrl(dataUrl: string): { ext: string; buffer: Buffer } | null {
  const m = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl);
  if (!m) return null;
  const ext = EXT[m[1].toLowerCase()];
  if (!ext) return null;
  return { ext, buffer: Buffer.from(m[2], 'base64') };
}

/**
 * Persist a data URL under `uploads/<prefix>-<timestamp>.<ext>` and return the
 * public path. Any older file whose name starts with `<prefix>-` is removed.
 */
export function writeUpload(prefix: string, dataUrl: string): string | null {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return null;
  ensureUploadDir();
  removeByPrefix(prefix);
  const name = `${prefix}-${Date.now()}.${parsed.ext}`;
  writeFileSync(join(UPLOAD_DIR, name), parsed.buffer);
  return `${UPLOAD_ROUTE}/${name}`;
}

/** Persist an already-fetched image buffer (used by the image importer). */
export function writeUploadBuffer(prefix: string, buffer: Buffer, ext: string): string {
  ensureUploadDir();
  removeByPrefix(prefix);
  const name = `${prefix}-${Date.now()}.${ext}`;
  writeFileSync(join(UPLOAD_DIR, name), buffer);
  return `${UPLOAD_ROUTE}/${name}`;
}

export function removeByPrefix(prefix: string): void {
  if (!existsSync(UPLOAD_DIR)) return;
  for (const f of readdirSync(UPLOAD_DIR)) {
    if (f.startsWith(`${prefix}-`)) {
      try {
        unlinkSync(join(UPLOAD_DIR, f));
      } catch {
        /* ignore */
      }
    }
  }
}

/** Turn "/uploads/foo.png" back into a filename prefix-safe token. */
export function slugToken(...parts: string[]): string {
  return parts.join('__').replace(/[^a-z0-9_-]/gi, '');
}
