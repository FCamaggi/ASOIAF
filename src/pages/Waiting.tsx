import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Comparison } from '../../shared/types.ts';
import { api } from '../api.ts';
import { usePlayer } from '../store.ts';
import AppShell from '../components/AppShell.tsx';
import PlayerAvatar from '../components/PlayerAvatar.tsx';
import Raven from '../components/Raven.tsx';

export default function Waiting() {
  const [player] = usePlayer();
  const [cmp, setCmp] = useState<Comparison | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    const tick = () =>
      api
        .comparison()
        .then((c) => {
          if (!alive) return;
          setCmp(c);
          if (c.bothComplete) navigate('/results', { replace: true });
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
      <AppShell title="Trend" bare>
        <Raven />
      </AppShell>
    );
  }

  const me = player === 'jugador-a' ? cmp.users.a : cmp.users.b;
  const foe = player === 'jugador-a' ? cmp.users.b : cmp.users.a;
  const meDone = player === 'jugador-a' ? cmp.aComplete : cmp.bComplete;
  const foeDone = player === 'jugador-a' ? cmp.bComplete : cmp.aComplete;

  return (
    <AppShell title="Trend" bare>
      <Raven label="Esperando a los cuervos…" />

      <div className="mt-stack-md flex flex-col gap-3">
        <StatusRow
          user={me}
          label="Tú"
          done={meDone}
          doneText="Veredicto sellado"
          pendingText="Aún eligiendo…"
        />
        <StatusRow
          user={foe}
          label="Oponente"
          done={foeDone}
          doneText="Veredicto sellado"
          pendingText="Pensando…"
        />
      </div>

      <div className="mt-stack-lg flex flex-col items-center gap-2 text-center">
        <span className="material-symbols-outlined text-targaryen-crimson">hourglass_empty</span>
        <p className="max-w-[20rem] text-[13px] text-on-surface-variant/70">
          El veredicto se revelará cuando ambos hayan terminado.
        </p>
        {!meDone && (
          <button
            type="button"
            onClick={() => navigate('/vote')}
            className="btn-outline mt-2"
          >
            Volver a mis elecciones
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
