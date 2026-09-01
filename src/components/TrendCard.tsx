import { forwardRef } from 'react';
import type { ComparisonRow, User } from '../../shared/types.ts';
import OptionArt from './OptionArt.tsx';
import PlayerAvatar from './PlayerAvatar.tsx';

interface Props {
  row: ComparisonRow;
  a: User;
  b: User;
  index: number;
  total: number;
  categoryLabel: string;
  /** hide this side (solo preview) */
  sealedSide?: 'a' | 'b';
  sealedText?: string;
}

/**
 * The shareable "trend image" for one category:
 *   ┌───────────────┬───────────────┐
 *   │  player A     │  player B     │   ← who
 *   ├───────────────┼───────────────┤
 *   │  choice A     │  choice B     │   ← what they picked
 *   └───────────────┴───────────────┘
 * with the category label pinned to the centre and a crimson frame on a match.
 */
const TrendCard = forwardRef<HTMLDivElement, Props>(
  ({ row, a, b, index, total, categoryLabel, sealedSide, sealedText = 'Sealed' }, ref) => {
    const { a: aOpt, b: bOpt, match } = row;
    const sealA = sealedSide === 'a';
    const sealB = sealedSide === 'b';

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-xl border bg-charcoal-haze"
      style={{
        aspectRatio: '4 / 5',
        borderColor: match ? '#B22222' : 'rgba(168,168,168,0.25)',
        boxShadow: match
          ? '0 0 0 1px #B22222, 0 8px 40px rgba(178,34,34,0.25)'
          : '0 8px 32px rgba(0,0,0,0.8)',
      }}
    >
      <div className="grid h-full grid-cols-2 grid-rows-2">
        {/* Row 1 — the players */}
        <PlayerCell user={a} side="A" sealed={sealA} sealedText={sealedText} />
        <PlayerCell user={b} side="B" sealed={sealB} sealedText={sealedText} />

        {/* Row 2 — their picks */}
        {sealA ? (
          <SealedCell text={sealedText} />
        ) : (
          <ChoiceCell name={row.aName ?? '—'} sub={aOpt?.subtitle ?? null} art={aOpt} imageUrl={row.aImageUrl} />
        )}
        {sealB ? (
          <SealedCell text={sealedText} />
        ) : (
          <ChoiceCell name={row.bName ?? '—'} sub={bOpt?.subtitle ?? null} art={bOpt} imageUrl={row.bImageUrl} />
        )}
      </div>

      {/* centre category chip */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="rounded border border-primary/70 bg-obsidian-black/85 px-3 py-1.5 text-center backdrop-blur-sm">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* header watermark */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-3 pt-2">
        <span className="font-serif text-[11px] uppercase tracking-[0.2em] text-on-surface-variant/70">
          A Song of Ice &amp; Fire
        </span>
        <span className="font-mono text-[10px] text-on-surface-variant/60">
          {String(index + 1).padStart(2, '0')} / {total}
        </span>
      </div>

        {match && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-targaryen-crimson px-3 py-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface">
              ♥ Match
            </span>
          </div>
        )}
      </div>
    );
  },
);

TrendCard.displayName = 'TrendCard';
export default TrendCard;

function PlayerCell({
  user,
  side,
  sealed,
  sealedText,
}: {
  user: User;
  side: 'A' | 'B';
  sealed?: boolean;
  sealedText?: string;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-2 border-b border-valyrian-steel/15 bg-surface-container-low/60 p-3">
      <PlayerAvatar user={user} size={68} />
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-primary/80">
        Player {side}
      </span>
      <span className="text-center font-serif text-[14px] leading-tight text-on-surface">
        {sealed ? sealedText : user.displayName}
      </span>
    </div>
  );
}

function SealedCell({ text }: { text: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-2 border-t border-valyrian-steel/15 bg-surface-container-low">
      <span className="material-symbols-outlined text-[26px] text-on-surface-variant/40">lock</span>
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-on-surface-variant/50">
        {text}
      </span>
    </div>
  );
}

function ChoiceCell({
  name,
  sub,
  art,
  imageUrl,
}: {
  name: string;
  sub: string | null;
  art: { name: string; house: string | null; type: any } | null;
  imageUrl: string | null;
}) {
  return (
    <div className="relative overflow-hidden border-t border-valyrian-steel/15">
      {art ? (
        <OptionArt
          option={art}
          imageUrl={imageUrl}
          className="absolute inset-0 h-full w-full"
          compact
        />
      ) : (
        <div className="absolute inset-0 bg-surface-container-low" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian-black/90 to-transparent p-3">
        <p className="font-serif text-[15px] font-semibold leading-tight text-on-surface">{name}</p>
        {sub && (
          <p className="line-clamp-1 text-[10px] text-on-surface-variant/75">{sub}</p>
        )}
      </div>
    </div>
  );
}
