import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import type { Comparison } from '../../shared/types.ts';
import { api } from '../api.ts';
import { fileToOptionImageDataUrl } from '../lib/image.ts';
import { catLabel, useLang, useT } from '../lib/i18n.ts';
import { usePlayer } from '../store.ts';
import AppShell from '../components/AppShell.tsx';
import TrendCard from '../components/TrendCard.tsx';
import Raven from '../components/Raven.tsx';

export default function Preview() {
  const [player] = usePlayer();
  const [cmp, setCmp] = useState<Comparison | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [imgBusy, setImgBusy] = useState(false);
  const [lang] = useLang();
  const t = useT();
  const cardRef = useRef<HTMLDivElement | null>(null);

  const me: 'a' | 'b' = player === 'jugador-b' ? 'b' : 'a';
  const sealed: 'a' | 'b' = me === 'a' ? 'b' : 'a';

  const refresh = () => api.comparison().then(setCmp);
  useEffect(() => {
    refresh().catch((e) => setErr(String(e.message ?? e)));
  }, []);

  if (err) {
    return (
      <AppShell title={t.hdrTrend}>
        <p className="pt-stack-lg text-center text-error">{err}</p>
      </AppShell>
    );
  }
  if (!cmp || !player) {
    return (
      <AppShell title={t.hdrTrend}>
        <Raven label={t.gatheringRavens} />
      </AppShell>
    );
  }

  const row = cmp.rows[i];
  const myName = me === 'a' ? row.aName : row.bName;
  const myImg = me === 'a' ? row.aImageUrl : row.bImageUrl;

  async function setImage(file: File | null) {
    setImgBusy(true);
    try {
      const dataUrl = file ? await fileToOptionImageDataUrl(file) : null;
      await api.setChoiceImage(player!, row.category.slug, dataUrl);
      await refresh();
    } catch (e: any) {
      setErr(e.message ?? t.errorImage);
    } finally {
      setImgBusy(false);
    }
  }

  async function download() {
    if (!cardRef.current) return;
    const url = await toPng(cardRef.current, {
      pixelRatio: 2,
      backgroundColor: '#1A1A1A',
      cacheBust: true,
    });
    const a = document.createElement('a');
    a.href = url;
    a.download = `asoiaf-mine-${String(i + 1).padStart(2, '0')}-${row.category.slug}.png`;
    a.click();
  }

  return (
    <AppShell title={t.hdrTrend}>
      <header className="text-center">
        <h1 className="font-serif text-[30px] font-bold uppercase leading-none text-dragon-gold">
          {t.previewTitle}
        </h1>
        <p className="mt-stack-sm text-[13px] text-on-surface-variant">{t.previewSubtitleWaiting}</p>
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
          ref={cardRef}
          row={row}
          a={cmp.users.a}
          b={cmp.users.b}
          index={i}
          total={cmp.total}
          categoryLabel={catLabel(row.category, lang)}
          sealedSide={sealed}
          sealedText={t.opponentSealed}
        />
      </div>

      <div className="mt-stack-md flex flex-col gap-2">
        <label
          className={`btn-outline flex cursor-pointer items-center justify-center gap-2 ${
            !myName ? 'pointer-events-none opacity-30' : ''
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {imgBusy ? 'hourglass_top' : 'image'}
          </span>
          {imgBusy ? '…' : myImg ? t.change : t.upload}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={imgBusy || !myName}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f) setImage(f);
              e.target.value = '';
            }}
          />
        </label>
        {myImg && (
          <button
            type="button"
            className="text-center font-mono text-[10px] uppercase tracking-[0.1em] text-on-surface-variant/50 hover:text-error"
            onClick={() => setImage(null)}
          >
            {t.remove}
          </button>
        )}
        <button
          type="button"
          className="btn-solid-gold flex items-center justify-center gap-2"
          onClick={download}
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          {t.downloadMine}
        </button>
        <Link to="/vote" className="btn-ghost-gold text-center">
          {t.backToChoices}
        </Link>
      </div>
    </AppShell>
  );
}
