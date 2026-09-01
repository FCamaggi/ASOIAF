import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../shared/types.ts';
import { api } from '../api.ts';
import { setPlayer, usePlayer, type PlayerSlug } from '../store.ts';
import { useT } from '../lib/i18n.ts';
import AppShell from '../components/AppShell.tsx';
import PlayerAvatar from '../components/PlayerAvatar.tsx';
import { fileToAvatarDataUrl } from '../lib/image.ts';

export default function Welcome() {
  const [users, setUsers] = useState<User[]>([]);
  const [player] = usePlayer();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useT();
  const navigate = useNavigate();

  useEffect(() => {
    api.users().then(setUsers).catch((e) => setError(String(e.message ?? e)));
  }, []);

  async function upload(slug: PlayerSlug, file: File) {
    setBusy(slug);
    setError(null);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      const updated = await api.setPhoto(slug, dataUrl);
      setUsers((prev) => prev.map((u) => (u.slug === slug ? updated : u)));
    } catch (e: any) {
      setError(e.message ?? 'Upload failed');
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell title={t.hdrHome}>
      <section className="flex flex-col items-center text-center">
        <h1 className="font-serif text-[40px] font-bold leading-tight text-dragon-gold">
          {t.whoAreYou}
        </h1>
        <p className="mt-stack-sm max-w-[22rem] text-[15px] text-on-surface-variant">
          {t.chooseBanner}
        </p>
      </section>

      <div className="mt-stack-lg grid grid-cols-2 gap-gutter">
        {users.map((u) => (
          <PlayerPick
            key={u.slug}
            user={u}
            active={player === u.slug}
            busy={busy === u.slug}
            uploadLabel={u.photoUrl ? t.changePhoto : t.uploadPhoto}
            onChoose={() => setPlayer(u.slug as PlayerSlug)}
            onUpload={(f) => upload(u.slug as PlayerSlug, f)}
          />
        ))}
      </div>

      {error && <p className="mt-stack-md text-center text-[13px] text-error">{error}</p>}

      <div className="mt-stack-lg flex flex-col items-center gap-2 text-center">
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant/70">lock</span>
        <p className="max-w-[20rem] text-[13px] text-on-surface-variant/70">{t.secretNote}</p>
      </div>

      <button
        type="button"
        disabled={!player}
        onClick={() => navigate('/vote')}
        className="btn-ghost-gold mt-stack-lg flex w-full items-center justify-center gap-2"
      >
        {t.begin}
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
      </button>
    </AppShell>
  );
}

function PlayerPick({
  user,
  active,
  busy,
  uploadLabel,
  onChoose,
  onUpload,
}: {
  user: User;
  active: boolean;
  busy: boolean;
  uploadLabel: string;
  onChoose: () => void;
  onUpload: (f: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={onChoose}
      className={`flex cursor-pointer flex-col items-center gap-3 rounded border p-4 transition-all ${
        active
          ? 'border-primary shadow-[inset_0_0_18px_rgba(178,34,34,0.28)]'
          : 'border-valyrian-steel/25 hover:border-valyrian-steel/60'
      }`}
    >
      <div className="relative">
        <PlayerAvatar user={user} size={96} ring={active} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileRef.current?.click();
          }}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-primary/60 bg-obsidian-black text-primary"
        >
          <span className="material-symbols-outlined text-[16px]">
            {busy ? 'hourglass_top' : user.photoUrl ? 'edit' : 'add'}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = '';
          }}
        />
      </div>

      <div className="text-center">
        <p className="font-serif text-[19px] font-semibold text-on-surface">{user.displayName}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/60">
          {uploadLabel}
        </p>
      </div>
    </div>
  );
}
