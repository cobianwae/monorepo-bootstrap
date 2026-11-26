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

vi.mock('@ds/ui', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  const React = await import('react');
  function MockImageCropper(props: { maxBytes?: number; accept?: string }) {
    return React.createElement('div', {
      'data-testid': 'mock-image-cropper',
      'data-max-bytes': String(props.maxBytes ?? ''),
      'data-accept': String(props.accept ?? ''),
    });
  }
  return { ...original, ImageCropper: MockImageCropper };
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
  it('merender h1, section di bawah demo, dan testid ic-result', () => {
    render(<ImageCropperPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Image Cropper' })).toBeTruthy();
    for (const name of ['The frame decides the file', 'Try to break it', 'Keyboard & screen readers', 'Drop it in']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy();
    }
    expect(screen.getByText('1280 × 720')).toBeTruthy();
    expect(screen.getByTestId('ic-result')).toBeTruthy();
    expect(screen.getByText('No crop saved yet.')).toBeTruthy();
  });

  it('beralih skenario ke Cover memilih opsi Cover', () => {
    render(<ImageCropperPage />);
    fireEvent.click(screen.getByRole('radio', { name: 'Cover' }));
    expect(screen.getByRole('radio', { name: 'Cover' }).getAttribute('aria-checked')).toBe('true');
  });

  it('State size-limit menetapkan maxBytes 1024 pada ImageCropper', () => {
    render(<ImageCropperPage />);
    expect(screen.getByTestId('mock-image-cropper').getAttribute('data-max-bytes')).toBe('');
    fireEvent.click(screen.getByRole('radio', { name: 'Size limit' }));
    expect(screen.getByTestId('mock-image-cropper').getAttribute('data-max-bytes')).toBe('1024');
  });

  it('State unsupported format menetapkan accept image/png pada ImageCropper', () => {
    render(<ImageCropperPage />);
    fireEvent.click(screen.getByRole('radio', { name: 'Unsupported format' }));
    expect(screen.getByTestId('mock-image-cropper').getAttribute('data-accept')).toBe('image/png');
  });

  it('resep Implementation tetap sinkron dengan RECIPE', () => {
    const lines = IMAGE_CROPPER_RECIPE.split('\n');
    expect(lines).toHaveLength(15);
    expect(lines[0]).toContain('onComplete');
    render(<ImageCropperPage />);
    expect(screen.getByText('ImageCropperDemo.tsx')).toBeTruthy();
  });
});
