import type { Option } from '../../shared/types.ts';
import FallbackArt from './FallbackArt.tsx';

interface Props {
  option: Pick<Option, 'name' | 'house' | 'type'>;
  imageUrl?: string | null;
  className?: string;
  compact?: boolean;
}

/** Real image when we have one, tinted monogram otherwise. */
export default function OptionArt({ option, imageUrl, className = '', compact }: Props) {
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={imageUrl}
          alt={option.name}
          crossOrigin="anonymous"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian-black/70 via-transparent to-obsidian-black/10" />
      </div>
    );
  }
  return <FallbackArt option={option} className={className} compact={compact} />;
}
