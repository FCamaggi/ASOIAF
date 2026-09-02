import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import type { Comparison } from '../../shared/types.ts';
import { api } from '../api.ts';
import { fileToOptionImageDataUrl } from '../lib/image.ts';
import { catLabel, useLang, useT } from '../lib/i18n.ts';
import AppShell from '../components/AppShell.tsx';
import TrendCard from '../components/TrendCard.tsx';
import Raven from '../components/Raven.tsx';

export default function Results() {
  const [cmp, setCmp] = useState<Comparison | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [imgBusy, setImgBusy] = useState<string | null>(null);
  const [lang] = useLang();
  const t = useT();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const refresh = () => api.comparison().then(setCmp);

  useEffect(() => {
    refresh().catch((e) => setErr(String(e.message ?? e)));
  }, []);

  async function replaceImage(side: 'a' | 'b', categorySlug: string, file: File | null) {
    const slug = side === 'a' ? 'jugador-a' : 'jugador-b';
    setImgBusy(`${side}:${categorySlug}`);
    try {
      const dataUrl = file ? await fileToOptionImageDataUrl(file) : null;
      await api.setChoiceImage(slug, categorySlug, dataUrl);
      await refresh();
    } catch (e: any) {
      setErr(e.message ?? t.errorImage);
    } finally {
      setImgBusy(null);
    }
  }

  const matches = useMemo(
    () => (cmp ? cmp.rows.filter((r) => r.match).length : 0),
    [cmp],
  );

  if (err) {
    return (
      <AppShell title={t.hdrVerdict}>
        <p className="pt-stack-lg text-center text-error">{err}</p>
      </AppShell>
    );
  }
  if (!cmp) {
    return (
      <AppShell title={t.hdrVerdict}>
        <Raven label={t.gatheringRavens} />
      </AppShell>
    );
  }

  if (!cmp.revealed) {
    const doneWho = cmp.aComplete ? 'Player A' : 'Player B';
    const missingWho = cmp.aComplete ? 'Player B' : 'Player A';
    return (
      <AppShell title={t.hdrVerdict}>
        <div className="flex flex-col items-center gap-stack-md pt-stack-lg text-center">
          <span className="material-symbols-outlined text-[40px] text-primary">lock</span>
          <h1 className="font-serif text-[28px] font-bold text-dragon-gold">{t.stillSealed}</h1>
          {cmp.bothComplete ? (
            <>
              <p className="max-w-[22rem] text-[14px] text-on-surface-variant">{t.revealPending}</p>
              <Link to="/preview" className="btn-ghost-gold">
                {t.goToPreview}
              </Link>
            </>
          ) : (
            <>
              <p className="max-w-[22rem] text-[14px] text-on-surface-variant">
                {t.someoneFinished(doneWho)}{' '}
                {cmp.aComplete && cmp.bComplete ? '' : t.missingOther(missingWho, cmp.total)}
              </p>
              <Link to="/vote" className="btn-ghost-gold">
                {t.goVote}
              </Link>
            </>
          )}
        </div>
      </AppShell>
    );
  }

  const row = cmp.rows[i];

  async function download(index: number) {
    const node = cardRefs.current[index];
    if (!node) return;
    const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: '#1A1A1A', cacheBust: true });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `asoiaf-${String(index + 1).padStart(2, '0')}-${cmp!.rows[index].category.slug}.png`;
    a.click();
  }

  async function downloadAll() {
    setDownloading(true);
    try {
      for (let k = 0; k < cmp!.rows.length; k++) {
        await download(k);
        await new Promise((r) => setTimeout(r, 350));
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <AppShell title={t.hdrVerdict}>
      <header className="text-center">
        <h1 className="font-serif text-[38px] font-bold uppercase leading-none text-dragon-gold drop-shadow-[0_2px_10px_rgba(255,215,0,0.25)]">
          {t.theVerdict}
        </h1>
        <p className="mt-stack-sm text-[14px] text-on-surface-variant">
          {matches === 0 ? t.noSharedLoyalty : t.sharedLoyalties(matches, cmp.total)}
        </p>
      </header>

      <div className="mt-stack-md flex items-center justify-between">
        <button
          type="button"
          className="btn-outline"
          disabled={i === 0}
          onClick={() => setI((v) => Math.max(0, v - 1))}
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-on-surface-variant/60">
          {i + 1} / {cmp.total}
        </span>
        <button
          type="button"
          className="btn-outline"
          disabled={i === cmp.total - 1}
          onClick={() => setI((v) => Math.min(cmp.total - 1, v + 1))}
        >
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

      <div className="mt-stack-md">
        <TrendCard
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          row={row}
          a={cmp.users.a}
          b={cmp.users.b}
          index={i}
          total={cmp.total}
          categoryLabel={catLabel(row.category, lang)}
        />
      </div>

      <div className="mt-stack-md flex flex-col gap-2">
        <button
          type="button"
          className="btn-solid-gold flex items-center justify-center gap-2"
          onClick={() => download(i)}
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          {t.downloadThis}
        </button>
        <button
          type="button"
          className="btn-ghost-gold flex items-center justify-center gap-2"
          disabled={downloading}
          onClick={downloadAll}
        >
          <span className="material-symbols-outlined text-[16px]">photo_library</span>
          {downloading ? t.generating : t.downloadAll(cmp.total)}
        </button>
      </div>

      <div className="mt-stack-md grid grid-cols-2 gap-gutter">
        <ImageEditor
          label={cmp.users.a?.displayName ?? 'Player A'}
          has={!!row.aImageUrl}
          busy={imgBusy === `a:${row.category.slug}`}
          disabled={!row.aName}
          t={t}
          onPick={(f) => replaceImage('a', row.category.slug, f)}
        />
        <ImageEditor
          label={cmp.users.b?.displayName ?? 'Player B'}
          has={!!row.bImageUrl}
          busy={imgBusy === `b:${row.category.slug}`}
          disabled={!row.bName}
          t={t}
          onPick={(f) => replaceImage('b', row.category.slug, f)}
        />
      </div>

      <div className="pointer-events-none fixed left-[-9999px] top-0" aria-hidden>
        {cmp.rows.map((r, k) =>
          k === i ? null : (
            <TrendCard
              key={r.category.slug}
              ref={(el) => {
                cardRefs.current[k] = el;
              }}
              row={r}
              a={cmp.users.a}
              b={cmp.users.b}
              index={k}
              total={cmp.total}
              categoryLabel={catLabel(r.category, lang)}
            />
          ),
        )}
      </div>

      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-on-surface-variant/40">
        {t.imageReplacesNote}
      </p>

      <div className="mt-stack-lg">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant/60">
          {t.fullScroll}
        </h2>
        <ul className="mt-2 divide-y divide-outline-variant/30">
          {cmp.rows.map((r, k) => (
            <li key={r.category.slug}>
              <button
                type="button"
                onClick={() => setI(k)}
                className="flex w-full items-center gap-3 py-2.5 text-left"
              >
                <span className="w-6 font-mono text-[10px] text-on-surface-variant/40">
                  {String(k + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">
                  <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-on-surface-variant/50">
                    {catLabel(r.category, lang)}
                  </span>
                  <span className="block text-[13px] text-on-surface">
                    {r.aName ?? '—'}
                    <span className="text-on-surface-variant/40"> · </span>
                    {r.bName ?? '—'}
                  </span>
                </span>
                {r.match && (
                  <span className="rounded-full bg-targaryen-crimson px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]">
                    {t.match}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}

function ImageEditor({
  label,
  has,
  busy,
  disabled,
  t,
  onPick,
}: {
  label: string;
  has: boolean;
  busy: boolean;
  disabled: boolean;
  t: ReturnType<typeof useT>;
  onPick: (file: File | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded border border-valyrian-steel/20 p-2.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-on-surface-variant/60">
        {t.imageFor(label)}
      </span>
      <label
        className={`btn-outline flex cursor-pointer items-center justify-center gap-1.5 !py-2 ${
          disabled ? 'pointer-events-none opacity-30' : ''
        }`}
      >
        <span className="material-symbols-outlined text-[15px]">
          {busy ? 'hourglass_top' : 'image'}
        </span>
        {busy ? '…' : has ? t.change : t.upload}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={disabled || busy}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            if (f) onPick(f);
            e.target.value = '';
          }}
        />
      </label>
      {has && (
        <button
          type="button"
          className="font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant/50 hover:text-error"
          onClick={() => onPick(null)}
        >
          {t.remove}
        </button>
      )}
    </div>
  );
}
