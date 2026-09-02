import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Comparison } from '../../shared/types.ts';
import { api } from '../api.ts';
import { usePlayer } from '../store.ts';
import { useT } from '../lib/i18n.ts';
import AppShell from '../components/AppShell.tsx';
import PlayerAvatar from '../components/PlayerAvatar.tsx';
import Raven from '../components/Raven.tsx';

export default function Waiting() {
  const [player] = usePlayer();
  const [cmp, setCmp] = useState<Comparison | null>(null);
  const t = useT();
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    const tick = () =>
      api
        .comparison()
        .then((c) => {
          if (!alive) return;
          setCmp(c);
          if (c.revealed) navigate('/results', { replace: true });
          else if (c.bothComplete) navigate('/preview', { replace: true });
        })
        .catch(() => {});
    tick();
    const id = setInterval(tick, 4000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [navigate]);

  if (!cmp || !player) {
    return (
      <AppShell title={t.hdrTrend} bare>
        <Raven label={t.wakingRavens} />
      </AppShell>
    );
  }

  const me = player === 'jugador-a' ? cmp.users.a : cmp.users.b;
  const foe = player === 'jugador-a' ? cmp.users.b : cmp.users.a;
  const meDone = player === 'jugador-a' ? cmp.aComplete : cmp.bComplete;
  const foeDone = player === 'jugador-a' ? cmp.bComplete : cmp.aComplete;

  return (
    <AppShell title={t.hdrTrend} bare>
      <Raven label={t.waitingRavens} />

      <div className="mt-stack-md flex flex-col gap-3">
        <StatusRow
          user={me}
          label={t.you}
          done={meDone}
          doneText={t.verdictSealed}
          pendingText={t.stillChoosing}
        />
        <StatusRow
          user={foe}
          label={t.opponent}
          done={foeDone}
          doneText={t.verdictSealed}
          pendingText={t.thinking}
        />
      </div>

      <div className="mt-stack-lg flex flex-col items-center gap-2 text-center">
        <span className="material-symbols-outlined text-targaryen-crimson">hourglass_empty</span>
        <p className="max-w-[20rem] text-[13px] text-on-surface-variant/70">{t.revealWhenBoth}</p>
        {!meDone && (
          <button type="button" onClick={() => navigate('/vote')} className="btn-outline mt-2">
            {t.backToChoices}
          </button>
        )}
      </div>
    </AppShell>
  );
}

function StatusRow({
  user,
  label,
  done,
  doneText,
  pendingText,
}: {
  user: { displayName: string; house: string | null; photoUrl: string | null };
  label: string;
  done: boolean;
  doneText: string;
  pendingText: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded border-l-2 px-3 py-3 ${
        done
          ? 'border-primary bg-surface-container-low'
          : 'border-valyrian-steel/20 bg-surface-container-low/50 opacity-70'
      }`}
    >
      <PlayerAvatar user={user} size={44} ring={done} />
      <div className="flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/60">
          {label}
        </p>
        <p className="font-serif text-[16px] text-on-surface">{done ? doneText : pendingText}</p>
      </div>
      <span
        className={`material-symbols-outlined ${
          done ? 'rounded-full bg-primary text-on-primary' : 'text-on-surface-variant/50'
        } text-[20px]`}
      >
        {done ? 'check' : 'more_horiz'}
      </span>
    </div>
  );
}
