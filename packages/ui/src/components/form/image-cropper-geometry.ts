export interface CropSizePx {
  width: number;
  height: number;
}

export interface PointPx {
  x: number;
  y: number;
}

/** Ukuran minimum area crop (px) agar gagang sudut tetap bisa diraih. */
export const MIN_CROP_SIZE_PX = 96;

/** Area hit gagang sudut, mengikuti target sentuh minimum 44px (WCAG 2.5.5). */
export const HANDLE_HIT_PX = 44;

/**
 * Ukuran awal area crop: bagian terbesar dengan aspek terkunci yang
 * muat di dalam kontainer, dikurangi margin agar gagang sudut tetap terlihat.
 */
export function defaultCropSize(container: CropSizePx, aspect: number, fill = 0.8): CropSizePx {
  const maxWidth = container.width * fill;
  const maxHeight = container.height * fill;
  const width = Math.min(maxWidth, maxHeight * aspect);
  return { width: Math.round(width), height: Math.round(width / aspect) };
}

/**
 * Ukuran baru saat gagang sudut digeser. Area crop tetap berpusat di kontainer
 * (simetris), sehingga aspek selalu terkunci dan tidak perlu menghitung offset.
 * Hasil dibatasi oleh ukuran kontainer dan `MIN_CROP_SIZE_PX`.
 */
export function resizeCropSize(
  pointer: PointPx,
  center: PointPx,
  aspect: number,
  container: CropSizePx
): CropSizePx {
  const halfWidth = Math.abs(pointer.x - center.x);
  const halfHeight = Math.abs(pointer.y - center.y);

  // Ambil dimensi yang menghasilkan area lebih besar, agar gerakan di sudut terasa natural.
  let width = Math.max(halfWidth * 2, halfHeight * 2 * aspect);
  let height = width / aspect;

  if (width > container.width) {
    width = container.width;
    height = width / aspect;
  }
  if (height > container.height) {
    height = container.height;
    width = height * aspect;
  }

  if (width < MIN_CROP_SIZE_PX) {
    width = MIN_CROP_SIZE_PX;
    height = width / aspect;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

/** Posisi pusat gagang sudut relatif ke kontainer, untuk `corner` tertentu. */
export function cornerPosition(
  corner: 'nw' | 'ne' | 'sw' | 'se',
  cropSize: CropSizePx,
  container: CropSizePx
): PointPx {
  const left = (container.width - cropSize.width) / 2;
  const top = (container.height - cropSize.height) / 2;
  const x = corner.endsWith('w') ? left : left + cropSize.width;
  const y = corner.startsWith('n') ? top : top + cropSize.height;
  return { x, y };
}
