/** Downscale a picked image file to a JPEG data URL for storage. */
export async function fileToDataUrl(file: File, max = 512, quality = 0.85): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  return canvas.toDataURL('image/jpeg', quality);
}

/** Square-ish avatar. */
export const fileToAvatarDataUrl = (file: File) => fileToDataUrl(file, 512, 0.85);

/** Larger art for a trend-card option image. */
export const fileToOptionImageDataUrl = (file: File) => fileToDataUrl(file, 900, 0.82);
