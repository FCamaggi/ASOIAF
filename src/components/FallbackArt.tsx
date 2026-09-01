import type { Option } from '../../shared/types.ts';
import { houseStyle, initials } from '../lib/houses.ts';

interface Props {
  option: Pick<Option, 'name' | 'house' | 'type'>;
  className?: string;
  compact?: boolean;
}

/**
 * Image-free stand-in for an option: a candlelit monogram tinted by house.
 * Deterministic, prints cleanly, and never leaves a broken <img>.
 */
export default function FallbackArt({ option, className = '', compact = false }: Props) {
  const style = houseStyle(option.house);
  const mono = initials(option.name);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(circle at 30% 20%, ${style.deep} 0%, #0e0e0e 100%)`,
      }}
    >
      {/* faint oversized glyph watermark */}
      <span
        aria-hidden
        className="absolute select-none leading-none"
        style={{
          fontSize: compact ? '7rem' : '13rem',
          color: style.accent,
          opacity: 0.1,
          transform: 'translateY(4%)',
        }}
      >
        {style.glyph}
      </span>

      <div className="relative flex flex-col items-center gap-1 px-2 text-center">
        <span
          className="font-serif font-semibold tracking-tight"
          style={{ fontSize: compact ? '1.6rem' : '2.4rem', color: style.accent }}
        >
          {mono}
        </span>
        {option.house && (
          <span className="font-mono uppercase tracking-[0.14em] text-[9px] text-on-surface-variant/70">
            {style.label}
          </span>
        )}
      </div>

      {/* vignette so it blends into the card */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian-black/70 via-transparent to-obsidian-black/20" />
    </div>
  );
}
