export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropOutputSize {
  width: number;
  height: number;
}

export interface CropResult {
  blob: Blob;
  dataURL: string;
  width: number;
  height: number;
  aspect: number;
}

export type ImageValidationResult = { ok: true } | { ok: false; message: string };

/** K2: default output avatar 512×512, cover 1280×720. */
export const AVATAR_OUTPUT_SIZE: CropOutputSize = { width: 512, height: 512 };
export const COVER_OUTPUT_SIZE: CropOutputSize = { width: 1280, height: 720 };

/** K3: batas masukan default 10 MB. */
export const DEFAULT_MAX_BYTES = 10_000_000;
export const DEFAULT_ACCEPT = 'image/png,image/jpeg,image/webp';

/** Preset aspek FR-001: 1:1, 16:9, 4:3, bebas. */
export const ASPECT_PRESETS = {
  square: 1,
  wide: 16 / 9,
  standard: 4 / 3,
  free: 'free',
} as const;

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 5;

/** Output selalu PNG agar transparansi sumber tidak berubah menjadi hitam. */
export const OUTPUT_MIME = 'image/png';

export function clampZoom(zoom: number, min: number = MIN_ZOOM, max: number = MAX_ZOOM): number {
  if (Number.isNaN(zoom)) return min;
  return Math.min(max, Math.max(min, zoom));
}

export function formatMegabytes(bytes: number): string {
  const mb = bytes / 1_000_000;
  return Number.isInteger(mb) ? `${mb} MB` : `${mb.toFixed(1)} MB`;
}

/** Validasi sebelum decode: tipe dulu, lalu ukuran (AC-05). */
export function validateImageFile(
  file: Pick<File, 'type' | 'size'>,
  options: { maxBytes?: number; accept?: string } = {}
): ImageValidationResult {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const allowed = (options.accept ?? DEFAULT_ACCEPT)
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean);

  if (!allowed.includes(file.type.toLowerCase())) {
    return {
      ok: false,
      message: 'Format tidak didukung. Pilih gambar PNG, JPG, atau WebP.',
    };
  }

  if (file.size > maxBytes) {
    return {
      ok: false,
      message: `File melebihi ${formatMegabytes(maxBytes)} (ukuran aktual ${formatMegabytes(file.size)}).`,
    };
  }

  return { ok: true };
}

/** Normalisasi rotasi ke kelipatan 90° (0, 90, 180, 270). */
export function normalizeRotation(rotation: number): 0 | 90 | 180 | 270 {
  const quarter = Math.round(rotation / 90) * 90;
  return (((quarter % 360) + 360) % 360) as 0 | 90 | 180 | 270;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Gambar tidak terbaca'));
    image.src = src;
  });
}

/**
 * Menggambar area crop (koordinat piksel gambar hasil rotasi) ke canvas berdimensi target.
 * Orientasi EXIF ditangani browser saat gambar di-decode (image-orientation: from-image).
 */
export async function drawCroppedCanvas(
  imageSrc: string,
  area: CropArea,
  rotation: number,
  outputSize: CropOutputSize
): Promise<HTMLCanvasElement> {
  const image = await loadImage(imageSrc);
  const turn = normalizeRotation(rotation);
  const swapped = turn === 90 || turn === 270;
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;

  const rotated = document.createElement('canvas');
  rotated.width = swapped ? sourceHeight : sourceWidth;
  rotated.height = swapped ? sourceWidth : sourceHeight;
  const rotatedContext = rotated.getContext('2d');
  if (!rotatedContext) throw new Error('Canvas tidak tersedia');
  rotatedContext.translate(rotated.width / 2, rotated.height / 2);
  rotatedContext.rotate((turn * Math.PI) / 180);
  rotatedContext.drawImage(image, -sourceWidth / 2, -sourceHeight / 2);

  const output = document.createElement('canvas');
  output.width = outputSize.width;
  output.height = outputSize.height;
  const outputContext = output.getContext('2d');
  if (!outputContext) throw new Error('Canvas tidak tersedia');
  outputContext.imageSmoothingQuality = 'high';
  outputContext.drawImage(
    rotated,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    outputSize.width,
    outputSize.height
  );

  return output;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Gagal membuat hasil crop'));
    }, OUTPUT_MIME);
  });
}

export async function getCroppedBlob(
  imageSrc: string,
  area: CropArea,
  rotation: number,
  outputSize: CropOutputSize
): Promise<Blob> {
  const canvas = await drawCroppedCanvas(imageSrc, area, rotation, outputSize);
  return canvasToBlob(canvas);
}

export async function createCropResult(
  imageSrc: string,
  area: CropArea,
  rotation: number,
  outputSize: CropOutputSize
): Promise<CropResult> {
  const canvas = await drawCroppedCanvas(imageSrc, area, rotation, outputSize);
  const blob = await canvasToBlob(canvas);
  return {
    blob,
    dataURL: canvas.toDataURL(OUTPUT_MIME),
    width: outputSize.width,
    height: outputSize.height,
    aspect: outputSize.width / outputSize.height,
  };
}
