/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ImageCropperPage from './page';
import { IMAGE_CROPPER_RECIPE } from './_lib/recipe';

vi.mock('react-easy-crop', async () => {
  const React = await import('react');
  function MockCropper() {
    return React.createElement('div', { 'data-testid': 'mock-cropper' });
  }
  return { default: MockCropper };
});

beforeAll(() => {
  // Radix dan react-easy-crop memakai ResizeObserver yang tidak tersedia di jsdom.
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
  if (!globalThis.URL.createObjectURL) {
    globalThis.URL.createObjectURL = () => 'blob:mock';
    globalThis.URL.revokeObjectURL = () => {};
  }
});

describe('ImageCropperPage', () => {
  it('merender judul, 6 langkah, dan testid ic-* pada skenario utama', () => {
    render(<ImageCropperPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Image Cropper' })).toBeTruthy();
    expect(screen.getByText(/Pilih foto avatar/)).toBeTruthy();
    expect(screen.getByText(/Ulangi untuk cover/)).toBeTruthy();
    expect(screen.getByTestId('ic-theme-scope')).toBeTruthy();
    expect(screen.getByTestId('ic-result')).toBeTruthy();
    expect(screen.getByText('Avatar 1:1 · lingkaran · 512×512')).toBeTruthy();
  });

  it('beralih skenario ke cover mengubah label konfigurasi', () => {
    render(<ImageCropperPage />);
    fireEvent.click(screen.getByRole('radio', { name: 'Cover' }));
    expect(screen.getByText('Cover 16:9 · persegi · 1280×720')).toBeTruthy();
  });

  it('toggle tema gelap menambahkan kelas dark pada scope', () => {
    render(<ImageCropperPage />);
    const scope = screen.getByTestId('ic-theme-scope');
    expect(scope.classList.contains('dark')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Tema: terang' }));
    expect(screen.getByTestId('ic-theme-scope').classList.contains('dark')).toBe(true);
  });

  it('panel demo menampilkan tiga dataset dengan petunjuk state', () => {
    render(<ImageCropperPage />);
    expect(screen.getByText('Valid — PNG/JPG/WebP ≤ 10 MB')).toBeTruthy();
    expect(screen.getByText('Rusak — format tidak diterima')).toBeTruthy();
    expect(screen.getByText('Raksasa — melebihi batas ukuran')).toBeTruthy();
    expect(screen.getByText(/mock ukuran tercatat/)).toBeTruthy();
  });

  it('resep onComplete tepat 15 baris', () => {
    const lines = IMAGE_CROPPER_RECIPE.split('\n');
    expect(lines).toHaveLength(15);
    expect(lines[0]).toContain('onComplete');
  });
});
