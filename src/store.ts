import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'asoiaf.player';
export type PlayerSlug = 'jugador-a' | 'jugador-b';

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function getPlayer(): PlayerSlug | null {
  const v = localStorage.getItem(KEY);
  return v === 'jugador-a' || v === 'jugador-b' ? v : null;
}

export function setPlayer(slug: PlayerSlug | null) {
  if (slug) localStorage.setItem(KEY, slug);
  else localStorage.removeItem(KEY);
  emit();
}

export function usePlayer(): [PlayerSlug | null, (s: PlayerSlug | null) => void] {
  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb);
    window.addEventListener('storage', cb);
    return () => {
      listeners.delete(cb);
      window.removeEventListener('storage', cb);
    };
  }, []);
  const player = useSyncExternalStore(subscribe, getPlayer, () => null);
  return [player, setPlayer];
}

export const otherPlayer = (s: PlayerSlug): PlayerSlug =>
  s === 'jugador-a' ? 'jugador-b' : 'jugador-a';
