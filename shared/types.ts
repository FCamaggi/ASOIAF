// Shared contract between the Fastify API and the React client.

export type OptionType =
  | 'house'
  | 'character'
  | 'dragon'
  | 'battle'
  | 'place'
  | 'scene'
  | 'death'
  | 'duo'
  | 'couple'
  | 'moment'
  | 'quote';

export type Medium =
  | 'books'
  | 'game-of-thrones'
  | 'house-of-the-dragon'
  | 'both'
  | 'general';

export type SpoilerLevel = 'none' | 'minor' | 'major';

export interface User {
  slug: string; // 'jugador-a' | 'jugador-b'
  displayName: string;
  house: string | null; // drives the fallback avatar accent
  photoUrl: string | null;
}

export interface Category {
  slug: string;
  label: string;
  prompt: string;
  optionType: OptionType;
  sortOrder: number;
}

export interface Option {
  id: string; // slug, unique
  type: OptionType;
  name: string;
  subtitle: string | null; // house words, region, "died at ...", etc.
  house: string | null; // for fallback art tinting: 'stark' | 'targaryen' | ...
  medium: Medium;
  spoilerLevel: SpoilerLevel;
  /** curated options are featured (shown by default); bulk-imported ones are search-only */
  featured: boolean;
  /** provenance: 'seed' | 'an-api-of-ice-and-fire' | 'awoiaf' */
  source: string;
  /** verified-reusable image URL, if any (e.g. Wikimedia Commons) */
  imageUrl: string | null;
  meta: Record<string, unknown>;
}

export interface CategoryWithOptions extends Category {
  options: Option[];
}

export interface Choice {
  categorySlug: string;
  optionId: string;
  updatedAt: string;
  /** user-supplied override image for this pick (/uploads/...) */
  imageUrl: string | null;
}

export interface ComparisonRow {
  category: Category;
  a: Option | null;
  b: Option | null;
  /** per-choice override images, fall back to option.imageUrl then to generated art */
  aImageUrl: string | null;
  bImageUrl: string | null;
  match: boolean;
}

export interface Comparison {
  users: { a: User; b: User };
  aComplete: boolean;
  bComplete: boolean;
  bothComplete: boolean;
  total: number;
  rows: ComparisonRow[];
}
