/**
 * Compresión client-side de imágenes antes de subirlas al admin.
 *
 * Toma un File (cualquier formato que el browser pueda decodear: JPG/PNG/
 * HEIC/WebP) y devuelve un nuevo File en WebP, redimensionado a un lado
 * máximo de MAX_DIMENSION px, con calidad ~82.
 *
 * Existe porque Azure App Service B1 no soporta Pillow en startup (el
 * container excede el timeout de 230s al instalar). Hacer la conversión
 * en el browser nos saca ese problema y reduce ~95% el tamaño de subida.
 *
 * Browser support: HTMLCanvasElement.toBlob('image/webp') está disponible
 * en Chrome 23+, Firefox 65+, Safari 14+ (iOS 14+), Edge 18+. Si por algún
 * motivo falla, devolvemos el archivo original sin tocar.
 */

const MAX_DIMENSION = 1200;
const QUALITY = 0.82;
const SKIP_THRESHOLD_BYTES = 300 * 1024;

export type OptimizeResult = {
  file: File;
  originalBytes: number;
  optimizedBytes: number;
  optimized: boolean;
  reason?: string;
};

export async function optimizeImage(input: File): Promise<OptimizeResult> {
  const originalBytes = input.size;

  // Si el archivo ya está chico, no vale la pena recodificar.
  if (originalBytes < SKIP_THRESHOLD_BYTES && input.type === 'image/webp') {
    return { file: input, originalBytes, optimizedBytes: originalBytes, optimized: false, reason: 'ya optimizada' };
  }

  try {
    const bitmap = await loadBitmap(input);
    const { width, height } = scaleDown(bitmap.width, bitmap.height, MAX_DIMENSION);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 2d unavailable');

    // PNG con transparencia → fondo blanco antes de WebP lossy.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', QUALITY),
    );
    if (!blob) throw new Error('toBlob returned null (browser sin soporte WebP)');

    // Si la "optimizada" pesa más que el original (raro pero pasa en
    // ilustraciones simples ya en WebP), devolvemos la original.
    if (blob.size >= originalBytes) {
      return { file: input, originalBytes, optimizedBytes: originalBytes, optimized: false, reason: 'optimización no reduce' };
    }

    const newName = input.name.replace(/\.[^.]+$/, '') + '.webp';
    const optimizedFile = new File([blob], newName, { type: 'image/webp' });
    return { file: optimizedFile, originalBytes, optimizedBytes: blob.size, optimized: true };
  } catch (err) {
    // Cualquier falla → devolvemos el original. No queremos romper el upload
    // por algo cosmético.
    console.warn('optimizeImage falló, subiendo original:', err);
    return { file: input, originalBytes, optimizedBytes: originalBytes, optimized: false, reason: String(err) };
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap es más rápido y soporta más formatos (incluido HEIC en iOS)
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // fallthrough a HTMLImageElement
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('img load failed'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function scaleDown(w: number, h: number, max: number): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w >= h ? max / w : max / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}
