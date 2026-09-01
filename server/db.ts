import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { Category, Option } from '../shared/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || join(__dirname, '..', 'data');
export const DB_PATH = join(DATA_DIR, 'db.json');

export interface StoredCatalogue {
  categories: Category[];
  options: Option[];
  /** category slug -> ordered option ids */
  categoryOptions: Record<string, string[]>;
}

export interface StoredUser {
  slug: string;
  displayName: string;
  house: string | null;
  photoUrl: string | null;
}

export interface StoredChoice {
  optionId: string | null;
  customName: string | null;
  updatedAt: string;
  imageUrl: string | null;
}

export interface DB {
  catalogue: StoredCatalogue;
  users: Record<string, StoredUser>;
  /** user slug -> category slug -> choice */
  choices: Record<string, Record<string, StoredChoice>>;
}

const EMPTY: DB = {
  catalogue: { categories: [], options: [], categoryOptions: {} },
  users: {},
  choices: {},
};

let cache: DB | null = null;

export function load(): DB {
  if (cache) return cache;
  if (!existsSync(DB_PATH)) {
    cache = structuredClone(EMPTY);
    return cache;
  }
  try {
    const parsed = JSON.parse(readFileSync(DB_PATH, 'utf8')) as Partial<DB>;
    cache = {
      catalogue: parsed.catalogue ?? structuredClone(EMPTY.catalogue),
      users: parsed.users ?? {},
      choices: parsed.choices ?? {},
    };
  } catch {
    cache = structuredClone(EMPTY);
  }
  return cache;
}

export function save(db: DB): void {
  cache = db;
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
