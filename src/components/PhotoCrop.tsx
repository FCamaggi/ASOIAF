import { useEffect, useRef, useState } from 'react';

interface Props {
  file: File;
  /** width / height of the output crop */
  aspect?: number;
  onDone: (dataUrl: string) => void;
  onCancel: () => void;
  labels: { title: string; cancel: string; use: string; hint: string };
}

const FRAME_W = 260;

/**
 * Lightweight pan + zoom crop (no deps). The frame is `aspect`; the exported
 * image keeps that ratio so it looks right both full-bleed (trend card) and
 * center-cropped into the circular avatar.
 */
export default function PhotoCrop({ file, aspect = 4 / 5, onDone, onCancel, labels }: Props) {
  const frameH = Math.round(FRAME_W / aspect);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const baseRef = useRef(1);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const base = Math.max(FRAME_W / im.naturalWidth, frameH / im.naturalHeight);
      baseRef.current = base;
      setImg(im);
      setScale(1);
      setOffset({
        x: (FRAME_W - im.naturalWidth * base) / 2,
        y: (frameH - im.naturalHeight * base) / 2,
      });
    };
    im.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file, frameH]);

  const ds = img ? baseRef.current * scale : 1;

  function clamp(o: { x: number; y: number }) {
    if (!img) return o;
    const w = img.naturalWidth * ds;
    const h = img.naturalHeight * ds;
    return {
      x: Math.min(0, Math.max(FRAME_W - w, o.x)),
      y: Math.min(0, Math.max(frameH - h, o.y)),
    };
  }

  useEffect(() => setOffset((o) => clamp(o)), [scale]); // eslint-disable-line

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    setOffset(
      clamp({
        x: drag.current.ox + (e.clientX - drag.current.x),
        y: drag.current.oy + (e.clientY - drag.current.y),
      }),
    );
  }
  function onPointerUp() {
    drag.current = null;
  }

  function confirm() {
    if (!img) return;
    const OUT_W = 720;
    const OUT_H = Math.round(OUT_W / aspect);
    const canvas = document.createElement('canvas');
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext('2d')!;
    const sx = -offset.x / ds;
    const sy = -offset.y / ds;
    ctx.drawImage(img, sx, sy, FRAME_W / ds, frameH / ds, 0, 0, OUT_W, OUT_H);
    onDone(canvas.toDataURL('image/jpeg', 0.85));
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian-black/80 p-6 backdrop-blur-sm">
      <div className="w-full max-w-[320px] rounded-xl border border-valyrian-steel/25 bg-charcoal-haze p-4">
        <h2 className="mb-3 text-center font-serif text-[18px] text-dragon-gold">{labels.title}</h2>

        <div
          className="relative mx-auto touch-none overflow-hidden rounded border border-primary/40 bg-obsidian-black"
          style={{ width: FRAME_W, height: frameH }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {img && (
            <img
              src={img.src}
              alt=""
              draggable={false}
              className="absolute left-0 top-0 max-w-none select-none"
              style={{
                width: img.naturalWidth * ds,
                height: img.naturalHeight * ds,
                transform: `translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          )}
          {/* circle guide */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-on-surface/40" />
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.02}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="mt-3 w-full accent-primary"
        />
        <p className="mt-1 text-center text-[11px] text-on-surface-variant/60">{labels.hint}</p>

        <div className="mt-4 flex gap-2">
          <button type="button" className="btn-outline flex-1" onClick={onCancel}>
            {labels.cancel}
          </button>
          <button type="button" className="btn-solid-gold flex-1" onClick={confirm}>
            {labels.use}
          </button>
        </div>
      </div>
    </div>
  );
}
