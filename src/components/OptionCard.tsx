import type { Option } from '../../shared/types.ts';
import OptionArt from './OptionArt.tsx';

interface Props {
  option: Option;
  selected: boolean;
  onSelect: (id: string) => void;
}

export default function OptionCard({ option, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      aria-pressed={selected}
      className={`group relative flex flex-col overflow-hidden rounded border text-left transition-all duration-200
        ${
          selected
            ? 'border-primary shadow-[inset_0_0_20px_rgba(178,34,34,0.35),0_0_0_1px_#f2ca50]'
            : 'border-valyrian-steel/25 hover:border-valyrian-steel/60'
        }`}
    >
      <OptionArt
        option={option}
        imageUrl={option.imageUrl}
        className="aspect-[4/3] w-full"
        compact
      />

      <div className="flex flex-col gap-0.5 bg-charcoal-haze/80 px-3 py-2.5">
        <span className="font-serif text-[17px] font-semibold leading-tight text-on-surface">
          {option.name}
        </span>
        {option.subtitle && (
          <span className="line-clamp-2 text-[12px] leading-snug text-on-surface-variant/80">
            {option.subtitle}
          </span>
        )}
      </div>

      {selected && (
        <span className="material-symbols-outlined absolute right-2 top-2 rounded-full bg-primary text-[18px] text-on-primary">
          check
        </span>
      )}
      {option.spoilerLevel === 'major' && !selected && (
        <span className="absolute left-2 top-2 rounded-sm bg-targaryen-crimson/85 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface">
          spoiler
        </span>
      )}
    </button>
  );
}
