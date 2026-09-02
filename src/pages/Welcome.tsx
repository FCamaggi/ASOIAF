import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../shared/types.ts';
import { api } from '../api.ts';
import { setPlayer, usePlayer, type PlayerSlug } from '../store.ts';
import { useT } from '../lib/i18n.ts';
import AppShell from '../components/AppShell.tsx';
import PlayerAvatar from '../components/PlayerAvatar.tsx';
import PhotoCrop from '../components/PhotoCrop.tsx';

export default function Welcome() {
  const [users, setUsers] = useState<User[]>([]);
  const [player] = usePlayer();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cropFor, setCropFor] = useState<{ slug: PlayerSlug; file: File } | null>(null);
  const t = useT();
  const navigate = useNavigate();

  useEffect(() => {
    api.users().then(setUsers).catch((e) => setError(String(e.message ?? e)));
  }, []);

  async function savePhoto(slug: PlayerSlug, dataUrl: string | null) {
    setBusy(slug);
    setError(null);
    try {
      const updated = await api.setPhoto(slug, dataUrl);
      setUsers((prev) => prev.map((u) => (u.slug === slug ? updated : u)));
    } catch (e: any) {
      setError(e.message ?? 'Upload failed');
    } finally {
      setBusy(null);
    }
  }

  async function saveName(slug: PlayerSlug, name: string) {
    const trimmed = name.trim().slice(0, 24);
    if (!trimmed) return;
    try {
      const updated = await api.setName(slug, trimmed);
      setUsers((prev) => prev.map((u) => (u.slug === slug ? updated : u)));
    } catch (e: any) {
      setError(e.message ?? 'Rename failed');
    }
  }

  async function reset() {
    if (!player || !window.confirm(t.resetConfirm)) return;
    setBusy(player);
    try {
      await api.resetChoices(player);
    } catch (e: any) {
      setError(e.message ?? 'Reset failed');
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
            onPickFile={(f) => setCropFor({ slug: u.slug as PlayerSlug, file: f })}
            onRename={(name) => saveName(u.slug as PlayerSlug, name)}
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

      {player && (
        <button
          type="button"
          onClick={reset}
          className="mx-auto mt-stack-md flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/50 hover:text-error"
        >
          <span className="material-symbols-outlined text-[14px]">restart_alt</span>
          {t.resetProgress}
        </button>
      )}

      {cropFor && (
        <PhotoCrop
          file={cropFor.file}
          labels={{
            title: t.cropTitle,
            hint: t.cropHint,
            cancel: t.cropCancel,
            use: t.cropUse,
          }}
          onCancel={() => setCropFor(null)}
          onDone={(dataUrl) => {
            const slug = cropFor.slug;
            setCropFor(null);
            savePhoto(slug, dataUrl);
          }}
        />
      )}
    </AppShell>
  );
}

function PlayerPick({
  user,
  active,
  busy,
  uploadLabel,
  onChoose,
  onPickFile,
  onRename,
}: {
  user: User;
  active: boolean;
  busy: boolean;
  uploadLabel: string;
  onChoose: () => void;
  onPickFile: (f: File) => void;
  onRename: (name: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(user.displayName);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== user.displayName) onRename(draft.trim());
    else setDraft(user.displayName);
  };

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
            if (f) onPickFile(f);
            e.target.value = '';
          }}
        />
      </div>

      <div className="w-full text-center" onClick={(e) => e.stopPropagation()}>
        {editing ? (
          <input
            autoFocus
            value={draft}
            maxLength={24}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                setDraft(user.displayName);
                setEditing(false);
              }
            }}
            className="w-full rounded border border-primary/50 bg-surface-container-low px-2 py-1 text-center font-serif text-[17px] font-semibold text-on-surface outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(user.displayName);
              setEditing(true);
            }}
            className="mx-auto flex items-center gap-1 font-serif text-[19px] font-semibold text-on-surface"
          >
            {user.displayName}
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50">edit</span>
          </button>
        )}
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/60">
          {uploadLabel}
        </p>
      </div>
    </div>
  );
}
