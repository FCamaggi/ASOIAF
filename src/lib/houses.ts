// House → visual identity for the sigil/initials fallback art.
// (No real sigil images in this build; a tinted monogram stands in.)

export interface HouseStyle {
  label: string;
  accent: string; // primary tint
  deep: string; // darker companion for the radial gradient
  glyph: string; // single-char emblem used in the monogram badge
}

const HOUSES: Record<string, HouseStyle> = {
  stark: { label: 'Stark', accent: '#C9CDD2', deep: '#1c1f22', glyph: '❈' },
  targaryen: { label: 'Targaryen', accent: '#B22222', deep: '#2a0d0d', glyph: '✹' },
  lannister: { label: 'Lannister', accent: '#C79A3B', deep: '#241c08', glyph: '⚜' },
  baratheon: { label: 'Baratheon', accent: '#E7C15A', deep: '#241d06', glyph: '♜' },
  tyrell: { label: 'Tyrell', accent: '#4E9B3A', deep: '#122c10', glyph: '❀' },
  martell: { label: 'Martell', accent: '#E07B39', deep: '#2c1608', glyph: '☀' },
  greyjoy: { label: 'Greyjoy', accent: '#7FA8B8', deep: '#141f24', glyph: '⟡' },
  tully: { label: 'Tully', accent: '#4E86C6', deep: '#0f1d2c', glyph: '⚶' },
  arryn: { label: 'Arryn', accent: '#8FC0EA', deep: '#12202c', glyph: '☾' },
  bolton: { label: 'Bolton', accent: '#B24444', deep: '#241010', glyph: '✜' },
  frey: { label: 'Frey', accent: '#8C93A0', deep: '#1a1c20', glyph: '⛨' },
  whitewalkers: { label: 'White Walkers', accent: '#7FD8E8', deep: '#0e2226', glyph: '❄' },
  wildling: { label: 'Free Folk', accent: '#A7B0B8', deep: '#1a1d1f', glyph: '⤬' },
  clegane: { label: 'Clegane', accent: '#B98A5E', deep: '#211810', glyph: '☗' },
  baelish: { label: 'Baelish', accent: '#86B49A', deep: '#132019', glyph: '⌘' },
  tarly: { label: 'Tarly', accent: '#9C6B3F', deep: '#20140b', glyph: '✣' },
};

export const NEUTRAL: HouseStyle = {
  label: 'Westeros',
  accent: '#99907c',
  deep: '#1a1a1a',
  glyph: '✦',
};

export function houseStyle(house: string | null | undefined): HouseStyle {
  if (!house) return NEUTRAL;
  return HOUSES[house] ?? NEUTRAL;
}

export function initials(name: string): string {
  const words = name
    .replace(/["'“”‘’.,—–-]/g, ' ')
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 1 &&
        !['de', 'la', 'el', 'y', 'del', 'of', 'the', 'and', 'house'].includes(w.toLowerCase()),
    );
  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
