import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { CategoryWithOptions, Choice } from '../../shared/types.ts';
import { api } from '../api.ts';
import { usePlayer } from '../store.ts';
import AppShell from '../components/AppShell.tsx';
import OptionCard from '../components/OptionCard.tsx';

export default function Vote() {
  const [player] = usePlayer();
  const [cats, setCats] = useState<CategoryWithOptions[]>([]);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const i = Math.max(0, Math.min(cats.length - 1, Number(params.get('i') ?? 0) || 0));
  const category = cats[i];

  useEffect(() => {
    if (!player) return;
    Promise.all([api.categories(), api.choices(player)])
      .then(([c, ch]) => {
        setCats(c);
        setChoices(Object.fromEntries(ch.map((x: Choice) => [x.categorySlug, x.optionId])));
      })
      .catch((e) => setLoadError(String(e.message ?? e)));
  }, [player]);

  useEffect(() => {
    setQuery('');
    window.scrollTo(0, 0);
  }, [i]);

  const answeredCount = useMemo(
    () => cats.filter((c) => choices[c.slug]).length,
    [cats, choices],
  );
  const allAnswered = cats.length > 0 && answeredCount === cats.length;

  const { list, hidden } = useMemo((): { list: CategoryWithOptions['options']; hidden: number } => {
    if (!category) return { list: [], hidden: 0 };
    const q = query.trim().toLowerCase();
    if (q) {
      const matched = category.options.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          (o.subtitle ?? '').toLowerCase().includes(q),
      );
      return { list: matched, hidden: 0 };
    }
    const featured = category.options.filter((o) => o.featured);
    const base = featured.length > 0 ? featured : category.options;
    return { list: base, hidden: category.options.length - base.length };
  }, [category, query]);

  async function select(optionId: string) {
    if (!player || !category) return;
    const prev = choices[category.slug];
    setChoices((c) => ({ ...c, [category.slug]: optionId }));
    setSaving(true);
    try {
      await api.choose(player, category.slug, optionId);
    } catch {
      setChoices((c) => ({ ...c, [category.slug]: prev }));
    } finally {
      setSaving(false);
    }
  }

  const go = (next: number) => setParams({ i: String(next) }, { replace: true });

  if (loadError) {
    return (
      <AppShell title="Home" bare>
        <p className="pt-stack-lg text-center text-error">{loadError}</p>
      </AppShell>
    );
  }
  if (!category) {
    return (
      <AppShell title="Home" bare>
        <p className="pt-stack-lg text-center text-on-surface-variant">Cargando el pergamino…</p>
      </AppShell>
    );
  }

  const isLast = i === cats.length - 1;

  return (
    <AppShell title="Home" bare>
      {/* progress */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant/60">
          Categoría {i + 1} de {cats.length}
        </span>
        <span className="font-mono text-[11px] text-primary/80">
          {answeredCount}/{cats.length} sellado{answeredCount === 1 ? '' : 's'}
        </span>
      </div>
      <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-surface-container-high">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((i + 1) / cats.length) * 100}%` }}
        />
      </div>

      <header className="mt-stack-md text-center">
        <h1 className="font-serif text-[32px] font-bold uppercase leading-tight text-dragon-gold">
          {category.label}
        </h1>
        <hr className="tapered-rule mx-auto my-3 w-24" />
        <p className="text-[15px] text-on-surface-variant">{category.prompt}</p>
      </header>

      <label className="mt-stack-md flex items-center gap-2 rounded border border-valyrian-steel/25 bg-surface-container-low px-3 py-2.5 focus-within:border-primary/60">
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant/60">search</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Buscar en ${category.label.toLowerCase()}…`}
          className="w-full bg-transparent text-[14px] text-on-surface outline-none placeholder:text-on-surface-variant/40"
        />
      </label>

      <div className="mt-stack-md grid grid-cols-2 gap-gutter">
        {list.map((o) => (
          <OptionCard
            key={o.id}
            option={o}
            selected={choices[category.slug] === o.id}
            onSelect={select}
          />
        ))}
        {list.length === 0 && (
          <p className="col-span-2 py-stack-md text-center text-[13px] text-on-surface-variant/60">
            {query ? `Nada coincide con «${query}».` : 'Sin opciones en esta categoría.'}
          </p>
        )}
      </div>
      {hidden > 0 && !query && (
        <p className="mt-3 text-center text-[12px] text-on-surface-variant/50">
          + {hidden} opciones más del canon — buscá por nombre para encontrarlas.
        </p>
      )}

      <div className="mt-stack-lg flex items-center justify-between gap-3">
        <button
          type="button"
          className="btn-outline flex items-center gap-2"
          disabled={i === 0}
          onClick={() => go(i - 1)}
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          Anterior
        </button>

        {isLast ? (
          <button
            type="button"
            className="btn-solid-gold flex items-center gap-2"
            disabled={!allAnswered}
            onClick={() => navigate('/waiting')}
          >
            {allAnswered ? 'Sellar veredicto' : `Faltan ${cats.length - answeredCount}`}
            <span className="material-symbols-outlined text-[16px]">verified</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn-ghost-gold flex items-center gap-2"
            onClick={() => go(i + 1)}
          >
            Siguiente
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        )}
      </div>

      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/40">
        {saving ? 'guardando…' : choices[category.slug] ? 'elección guardada' : 'sin elegir'}
      </p>
    </AppShell>
  );
}
