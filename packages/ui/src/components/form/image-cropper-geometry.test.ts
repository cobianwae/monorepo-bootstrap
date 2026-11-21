import { describe, it, expect } from 'vitest';
import {
  MIN_CROP_SIZE_PX,
  cornerPosition,
  defaultCropSize,
  resizeCropSize,
} from './image-cropper-geometry';

const container = { width: 400, height: 300 };
const center = { x: 200, y: 150 };

describe('defaultCropSize', () => {
  it('mengunci aspek 1:1 dan muat di dalam kontainer dengan margin 20%', () => {
    expect(defaultCropSize(container, 1)).toEqual({ width: 240, height: 240 });
  });

  it('mengunci aspek 16:9 dan membatasi tinggi sesuai kontainer', () => {
    const size = defaultCropSize(container, 16 / 9);
    expect(size.width / size.height).toBeCloseTo(16 / 9, 1);
    expect(size.width).toBeLessThanOrEqual(container.width * 0.8);
    expect(size.height).toBeLessThanOrEqual(container.height * 0.8);
  });
});

describe('resizeCropSize', () => {
  it('menjaga aspek 1:1 saat gagang sudut digeser', () => {
    const size = resizeCropSize({ x: 300, y: 250 }, center, 1, container);
    expect(size.width).toBe(size.height);
    expect(size.width).toBe(200);
  });

  it('menjaga aspek 16:9 saat gagang sudut digeser', () => {
    const size = resizeCropSize({ x: 300, y: 200 }, center, 16 / 9, container);
    expect(size.width / size.height).toBeCloseTo(16 / 9, 1);
  });

  it('tidak melewati ukuran kontainer', () => {
    const size = resizeCropSize({ x: 1000, y: 1000 }, center, 1, container);
    expect(size.width).toBeLessThanOrEqual(container.width);
    expect(size.height).toBeLessThanOrEqual(container.height);
    expect(size.width).toBe(size.height);
  });

  it('tidak turun di bawah ukuran minimum', () => {
    const size = resizeCropSize({ x: 201, y: 151 }, center, 1, container);
    expect(size.width).toBe(MIN_CROP_SIZE_PX);
    expect(size.height).toBe(MIN_CROP_SIZE_PX);
  });

  it('memakai dimensi yang menghasilkan area lebih besar saat ditarik secara diagonal', () => {
    const size = resizeCropSize({ x: 260, y: 150 }, center, 1, container);
    expect(size.width).toBe(120);
    expect(size.height).toBe(120);
  });
});

describe('cornerPosition', () => {
  it('menempatkan gagang di sudut area crop yang berpusat', () => {
    const cropSize = { width: 200, height: 200 };
    expect(cornerPosition('nw', cropSize, container)).toEqual({ x: 100, y: 50 });
    expect(cornerPosition('se', cropSize, container)).toEqual({ x: 300, y: 250 });
    expect(cornerPosition('ne', cropSize, container)).toEqual({ x: 300, y: 50 });
    expect(cornerPosition('sw', cropSize, container)).toEqual({ x: 100, y: 250 });
  });
});
