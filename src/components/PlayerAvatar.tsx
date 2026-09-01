import type { User } from '../../shared/types.ts';
import { houseStyle, initials } from '../lib/houses.ts';

interface Props {
  user: Pick<User, 'displayName' | 'house' | 'photoUrl'>;
  size?: number;
  ring?: boolean;
}

export default function PlayerAvatar({ user, size = 64, ring = true }: Props) {
  const style = houseStyle(user.house);
  const s = `${size}px`;

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{
        width: s,
        height: s,
        boxShadow: ring ? `0 0 0 1px ${style.accent}` : undefined,
        background: `radial-gradient(circle at 30% 25%, ${style.deep}, #0e0e0e)`,
      }}
    >
      {user.photoUrl ? (
        <img
          src={user.photoUrl}
          alt={user.displayName}
          className="h-full w-full object-cover"
          crossOrigin="anonymous"
        />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center font-serif font-semibold"
          style={{ color: style.accent, fontSize: size * 0.4 }}
        >
          {initials(user.displayName)}
        </span>
      )}
    </div>
  );
}
