import { useCallback, useSyncExternalStore } from 'react';
import type { Category, Lang } from '../../shared/types.ts';

const KEY = 'asoiaf.lang';
const listeners = new Set<() => void>();

function read(): Lang {
  const v = localStorage.getItem(KEY);
  return v === 'es' ? 'es' : 'en';
}
export function setLang(l: Lang) {
  localStorage.setItem(KEY, l);
  listeners.forEach((fn) => fn());
}
export function useLang(): [Lang, (l: Lang) => void] {
  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb);
    window.addEventListener('storage', cb);
    return () => {
      listeners.delete(cb);
      window.removeEventListener('storage', cb);
    };
  }, []);
  return [useSyncExternalStore(subscribe, read, () => 'en' as Lang), setLang];
}

export const catLabel = (c: Pick<Category, 'label' | 'labelEs'>, lang: Lang) =>
  lang === 'es' && c.labelEs ? c.labelEs : c.label;
export const catPrompt = (c: Pick<Category, 'prompt' | 'promptEs'>, lang: Lang) =>
  lang === 'es' && c.promptEs ? c.promptEs : c.prompt;

type Dict = {
  navHome: string;
  navVerdict: string;
  hdrHome: string;
  hdrTrend: string;
  hdrVerdict: string;
  whoAreYou: string;
  chooseBanner: string;
  secretNote: string;
  begin: string;
  uploadPhoto: string;
  changePhoto: string;
  categoryOf: (i: number, n: number) => string;
  sealed: (n: number, total: number) => string;
  searchIn: (label: string) => string;
  back: string;
  next: string;
  sealVerdict: string;
  nLeft: (n: number) => string;
  saving: string;
  choiceSaved: string;
  notChosen: string;
  moreFromCanon: (n: number) => string;
  loadingScroll: string;
  nothingMatches: (q: string) => string;
  noOptions: string;
  wakingRavens: string;
  waitingRavens: string;
  you: string;
  opponent: string;
  verdictSealed: string;
  stillChoosing: string;
  thinking: string;
  revealWhenBoth: string;
  backToChoices: string;
  theVerdict: string;
  gatheringRavens: string;
  stillSealed: string;
  goVote: string;
  someoneFinished: (who: string) => string;
  missingOther: (who: string, total: number) => string;
  sharedLoyalties: (n: number, total: number) => string;
  noSharedLoyalty: string;
  downloadThis: string;
  downloadAll: (n: number) => string;
  generating: string;
  fullScroll: string;
  imageFor: (name: string) => string;
  upload: string;
  change: string;
  remove: string;
  imageReplacesNote: string;
  match: string;
  errorImage: string;
  writeOwn: string;
  writeOwnPlaceholder: string;
  useThis: string;
  customBadge: string;
  previewMine: string;
  previewTitle: string;
  previewSubtitleWaiting: string;
  opponentSealed: string;
  downloadMine: string;
  cropTitle: string;
  cropHint: string;
  cropCancel: string;
  cropUse: string;
  resetProgress: string;
  resetConfirm: string;
};

export const TXT: Record<Lang, Dict> = {
  en: {
    navHome: 'Home',
    navVerdict: 'Verdict',
    hdrHome: 'Home',
    hdrTrend: 'Trend',
    hdrVerdict: 'Verdict',
    whoAreYou: 'Who are you?',
    chooseBanner: 'Choose your banner. Loyalty is forged before the battle.',
    secretNote: 'Your votes stay secret until you both finish.',
    begin: 'Begin my journey',
    uploadPhoto: 'Upload photo',
    changePhoto: 'Change photo',
    categoryOf: (i, n) => `Category ${i} of ${n}`,
    sealed: (n, total) => `${n}/${total} sealed`,
    searchIn: (label) => `Search ${label.toLowerCase()}…`,
    back: 'Back',
    next: 'Next',
    sealVerdict: 'Seal verdict',
    nLeft: (n) => `${n} left`,
    saving: 'saving…',
    choiceSaved: 'choice saved',
    notChosen: 'not chosen',
    moreFromCanon: (n) => `+ ${n} more from the canon — search by name to find them.`,
    loadingScroll: 'Loading the scroll…',
    nothingMatches: (q) => `Nothing matches “${q}”.`,
    noOptions: 'No options in this category.',
    wakingRavens: 'Waking the ravens…',
    waitingRavens: 'Waiting for the ravens…',
    you: 'You',
    opponent: 'Opponent',
    verdictSealed: 'Verdict sealed',
    stillChoosing: 'Still choosing…',
    thinking: 'Thinking…',
    revealWhenBoth: 'The verdict is revealed when you both finish.',
    backToChoices: 'Back to my choices',
    theVerdict: 'The Verdict',
    gatheringRavens: 'Gathering the ravens…',
    stillSealed: 'The verdict is still sealed',
    goVote: 'Go vote',
    someoneFinished: (who) => `${who} is done.`,
    missingOther: (who, total) => `Waiting for ${who} to complete the ${total} categories.`,
    sharedLoyalties: (n, total) => `${n} of ${total} shared loyalties.`,
    noSharedLoyalty: 'Two paths, no shared loyalty.',
    downloadThis: 'Download this category',
    downloadAll: (n) => `Download all ${n}`,
    generating: 'Generating…',
    fullScroll: 'Full scroll',
    imageFor: (name) => `Image · ${name}`,
    upload: 'Upload',
    change: 'Change',
    remove: 'Remove',
    imageReplacesNote: "The image replaces the monogram on this category's card",
    match: 'Match',
    errorImage: 'Could not update the image',
    writeOwn: 'Write my own',
    writeOwnPlaceholder: 'Type your pick…',
    useThis: 'Use this',
    customBadge: 'custom',
    previewMine: 'Preview my trend',
    previewTitle: 'My Trend (preview)',
    previewSubtitleWaiting: "Only your picks. The opponent's stay sealed.",
    opponentSealed: 'Sealed',
    downloadMine: 'Download my side',
    cropTitle: 'Frame your photo',
    cropHint: 'Drag to move · slider to zoom',
    cropCancel: 'Cancel',
    cropUse: 'Use photo',
    resetProgress: 'Reset my progress',
    resetConfirm: 'Delete all your picks and images? This cannot be undone.',
  },
  es: {
    navHome: 'Inicio',
    navVerdict: 'Veredicto',
    hdrHome: 'Inicio',
    hdrTrend: 'Trend',
    hdrVerdict: 'Resultados',
    whoAreYou: '¿Quién eres?',
    chooseBanner: 'Elegí tu estandarte. La lealtad se forja antes de la batalla.',
    secretNote: 'Tus votos se mantienen en secreto hasta que ambos terminen.',
    begin: 'Empezar mi camino',
    uploadPhoto: 'Subir foto',
    changePhoto: 'Cambiar foto',
    categoryOf: (i, n) => `Categoría ${i} de ${n}`,
    sealed: (n, total) => `${n}/${total} sellados`,
    searchIn: (label) => `Buscar en ${label.toLowerCase()}…`,
    back: 'Anterior',
    next: 'Siguiente',
    sealVerdict: 'Sellar veredicto',
    nLeft: (n) => `Faltan ${n}`,
    saving: 'guardando…',
    choiceSaved: 'elección guardada',
    notChosen: 'sin elegir',
    moreFromCanon: (n) => `+ ${n} opciones más del canon — buscá por nombre para encontrarlas.`,
    loadingScroll: 'Cargando el pergamino…',
    nothingMatches: (q) => `Nada coincide con «${q}».`,
    noOptions: 'Sin opciones en esta categoría.',
    wakingRavens: 'Despertando a los cuervos…',
    waitingRavens: 'Esperando a los cuervos…',
    you: 'Tú',
    opponent: 'Oponente',
    verdictSealed: 'Veredicto sellado',
    stillChoosing: 'Aún eligiendo…',
    thinking: 'Pensando…',
    revealWhenBoth: 'El veredicto se revela cuando ambos terminan.',
    backToChoices: 'Volver a mis elecciones',
    theVerdict: 'El Veredicto',
    gatheringRavens: 'Reuniendo los cuervos…',
    stillSealed: 'El veredicto sigue sellado',
    goVote: 'Ir a elegir',
    someoneFinished: (who) => `${who} ya terminó.`,
    missingOther: (who, total) => `Falta que ${who} complete las ${total} categorías.`,
    sharedLoyalties: (n, total) => `${n} de ${total} lealtades compartidas.`,
    noSharedLoyalty: 'Dos caminos, ninguna lealtad compartida.',
    downloadThis: 'Descargar esta categoría',
    downloadAll: (n) => `Descargar las ${n}`,
    generating: 'Generando…',
    fullScroll: 'Pergamino completo',
    imageFor: (name) => `Imagen · ${name}`,
    upload: 'Subir',
    change: 'Cambiar',
    remove: 'Quitar',
    imageReplacesNote: 'La imagen reemplaza el monograma en la tarjeta de esta categoría',
    match: 'Match',
    errorImage: 'No se pudo actualizar la imagen',
    writeOwn: 'Escribir la mía',
    writeOwnPlaceholder: 'Escribí tu elección…',
    useThis: 'Usar esta',
    customBadge: 'propia',
    previewMine: 'Ver mi trend',
    previewTitle: 'Mi Trend (preview)',
    previewSubtitleWaiting: 'Solo tus elecciones. Las del otro quedan selladas.',
    opponentSealed: 'Sellado',
    downloadMine: 'Descargar mi lado',
    cropTitle: 'Encuadrá tu foto',
    cropHint: 'Arrastrá para mover · slider para zoom',
    cropCancel: 'Cancelar',
    cropUse: 'Usar foto',
    resetProgress: 'Reiniciar mi progreso',
    resetConfirm: '¿Borrar todas tus elecciones e imágenes? No se puede deshacer.',
  },
};

export function useT(): Dict {
  const [lang] = useLang();
  return TXT[lang];
}
