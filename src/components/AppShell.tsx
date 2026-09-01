import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { usePlayer } from '../store.ts';
import { useLang, useT } from '../lib/i18n.ts';

interface Props {
  title: string;
  children: ReactNode;
  /** hide the bottom nav during the linear voting flow */
  bare?: boolean;
}

export default function AppShell({ title, children, bare = false }: Props) {
  const [player, setPlayer] = usePlayer();
  const [lang, setLang] = useLang();
  const t = useT();
  const navigate = useNavigate();

  return (
    <>
      <div className="atmospheric-bg" />

      <header className="fixed top-0 z-50 w-full border-b border-outline-variant/40 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-story items-center justify-between px-margin-mobile">
          <div className="flex items-center gap-stack-sm">
            <span className="material-symbols-outlined text-[22px] text-primary">shield</span>
            <span className="font-serif text-[20px] font-semibold uppercase tracking-tight text-dragon-gold">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="rounded-full border border-valyrian-steel/30 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-on-surface-variant/80"
              aria-label="language"
            >
              {lang === 'en' ? 'EN' : 'ES'}
            </button>
            {player && (
              <button
                type="button"
                onClick={() => {
                  setPlayer(null);
                  navigate('/');
                }}
                className="flex items-center gap-1.5 rounded-full border border-primary/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-primary"
              >
                {player === 'jugador-a' ? 'Player A' : 'Player B'}
                <span className="material-symbols-outlined text-[14px]">logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-screen w-full max-w-story px-margin-mobile pb-28 pt-24">
        {children}
      </main>

      {!bare && (
        <nav className="fixed bottom-0 z-50 w-full border-t border-outline-variant/40 bg-surface/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-story items-stretch justify-around px-margin-mobile py-2 pb-[max(env(safe-area-inset-bottom),8px)]">
            <Tab to="/" icon="home" label={t.navHome} end />
            <Tab to="/results" icon="swords" label={t.navVerdict} />
          </div>
        </nav>
      )}
    </>
  );
}

function Tab({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: string;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 rounded px-6 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
          isActive ? 'text-primary' : 'text-on-surface-variant/60'
        }`
      }
    >
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
      {label}
    </NavLink>
  );
}
