import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AVATAR_OUTPUT_SIZE,
  COVER_OUTPUT_SIZE,
  DEFAULT_MAX_BYTES,
  MAX_ZOOM,
  MIN_ZOOM,
  clampZoom,
  createCropResult,
  getCroppedBlob,
  normalizeRotation,
  validateImageFile,
} from './image-cropper-utils';

const SOURCE = { naturalWidth: 1600, naturalHeight: 900 };

interface DrawContext {
  translate: ReturnType<typeof vi.fn>;
  rotate: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  imageSmoothingQuality: string;
}

let contexts: DrawContext[] = [];
let outputSizes: Array<{ width: number; height: number }> = [];

beforeEach(() => {
  contexts = [];
  outputSizes = [];

  vi.stubGlobal(
    'Image',
    class {
      naturalWidth = SOURCE.naturalWidth;
      naturalHeight = SOURCE.naturalHeight;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
  );

  HTMLCanvasElement.prototype.getContext = vi.fn(function (this: HTMLCanvasElement) {
    const ctx: DrawContext = {
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
      imageSmoothingQuality: '',
    };
    contexts.push(ctx);
    return ctx;
  }) as unknown as HTMLCanvasElement['getContext'];

  HTMLCanvasElement.prototype.toBlob = function (this: HTMLCanvasElement, callback: BlobCallback) {
    outputSizes.push({ width: this.width, height: this.height });
    callback(new Blob(['png'], { type: 'image/png' }));
  };

  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,AAAA');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeFile(type: string, size: number): File {
  const file = new File(['x'], 'foto', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('validateImageFile', () => {
  it('menerima PNG, JPG, dan WebP dalam batas 10 MB', () => {
    expect(validateImageFile(makeFile('image/png', 1_000))).toEqual({ ok: true });
    expect(validateImageFile(makeFile('image/jpeg', 1_000))).toEqual({ ok: true });
    expect(validateImageFile(makeFile('image/webp', DEFAULT_MAX_BYTES))).toEqual({ ok: true });
  });

  it('menolak file bukan gambar dengan pesan Bahasa Indonesia', () => {
    const result = validateImageFile(makeFile('application/pdf', 1_000));
    expect(result).toEqual({
      ok: false,
      message: 'Format tidak didukung. Pilih gambar PNG, JPG, atau WebP.',
    });
  });

  it('menolak file di atas 10 MB dan menyebut ukuran aktual', () => {
    const result = validateImageFile(makeFile('image/png', 12_300_000));
    expect(result).toEqual({
      ok: false,
      message: 'File melebihi 10 MB (ukuran aktual 12.3 MB).',
    });
  });

  it('memakai accept kustom bila diberikan', () => {
    expect(validateImageFile(makeFile('image/gif', 1_000), { accept: 'image/gif' })).toEqual({
      ok: true,
    });
  });
});

describe('clampZoom', () => {
  it('menjaga zoom di rentang min–maks', () => {
    expect(clampZoom(0.2)).toBe(MIN_ZOOM);
    expect(clampZoom(7)).toBe(MAX_ZOOM);
    expect(clampZoom(2.5)).toBe(2.5);
  });
});

describe('normalizeRotation', () => {
  it('membulatkan rotasi ke kelipatan 90° di 0–270', () => {
    expect(normalizeRotation(0)).toBe(0);
    expect(normalizeRotation(90)).toBe(90);
    expect(normalizeRotation(180)).toBe(180);
    expect(normalizeRotation(270)).toBe(270);
    expect(normalizeRotation(-90)).toBe(270);
    expect(normalizeRotation(450)).toBe(90);
  });
});

describe('getCroppedBlob / createCropResult', () => {
  const area = { x: 100, y: 50, width: 800, height: 800 };

  it('menghasilkan blob berdimensi persis avatar 512×512', async () => {
    const blob = await getCroppedBlob('blob:src', area, 0, AVATAR_OUTPUT_SIZE);
    expect(blob.type).toBe('image/png');
    expect(outputSizes.at(-1)).toEqual({ width: 512, height: 512 });
  });

  it('menghasilkan blob berdimensi persis cover 1280×720', async () => {
    await getCroppedBlob('blob:src', { x: 0, y: 0, width: 1600, height: 900 }, 0, COVER_OUTPUT_SIZE);
    expect(outputSizes.at(-1)).toEqual({ width: 1280, height: 720 });
  });

  it('createCropResult mengembalikan blob, dataURL, dimensi, dan aspek', async () => {
    const result = await createCropResult('blob:src', area, 0, COVER_OUTPUT_SIZE);
    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.dataURL).toMatch(/^data:image\/png;base64,/);
    expect(result).toMatchObject({ width: 1280, height: 720, aspect: 1280 / 720 });
  });

  it.each([
    [0, 0],
    [90, Math.PI / 2],
    [180, Math.PI],
    [270, (3 * Math.PI) / 2],
  ])('menerapkan rotasi %i° ke konteks canvas', async (rotation, radians) => {
    await getCroppedBlob('blob:src', area, rotation, AVATAR_OUTPUT_SIZE);
    const rotated = contexts[0];
    expect(rotated.rotate).toHaveBeenCalledTimes(1);
    expect(rotated.rotate.mock.calls[0][0]).toBeCloseTo(radians, 6);
  });

  it('memotong area crop dari canvas rotasi ke ukuran output', async () => {
    await getCroppedBlob('blob:src', area, 0, AVATAR_OUTPUT_SIZE);
    const output = contexts[1];
    expect(output.drawImage).toHaveBeenCalledWith(
      expect.anything(),
      100,
      50,
      800,
      800,
      0,
      0,
      512,
      512
    );
  });
});
