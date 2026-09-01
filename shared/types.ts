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
  label: string; // English (default)
  labelEs: string | null; // Spanish override
  prompt: string;
  promptEs: string | null;
  optionType: OptionType;
  sortOrder: number;
}

export type Lang = 'en' | 'es';

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
  optionId: string | null; // null when the pick is a write-in
  customName: string | null; // write-in option name
  updatedAt: string;
  /** user-supplied override image for this pick (/uploads/...) */
  imageUrl: string | null;
}

/** One player's own pick for a category — used by the solo preview. */
export interface PreviewRow {
  category: Category;
  option: Option | null; // catalogue option, if any
  name: string | null; // resolved display name (catalogue or write-in)
  imageUrl: string | null; // resolved image (override → option image → none)
  custom: boolean;
}

export interface ComparisonRow {
  category: Category;
  a: Option | null;
  b: Option | null;
  /** resolved display name (catalogue option or write-in) */
  aName: string | null;
  bName: string | null;
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
