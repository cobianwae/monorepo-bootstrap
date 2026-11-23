/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import DataDisplayPage from './page';

beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
  if (!globalThis.IntersectionObserver) {
    globalThis.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
  }
  // Embla (carousel) membaca matchMedia yang tidak tersedia di jsdom.
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
  }
});

describe('DataDisplayPage — kartu interaktif dapat diaktifkan keyboard', () => {
  it('kartu selectable adalah tombol berfokus dengan aria-pressed', () => {
    render(<DataDisplayPage />);
    const plan = screen.getByRole('button', { name: /Standard Plan/ });
    expect(plan.getAttribute('tabindex')).toBe('0');
    // card-1 adalah pilihan awal halaman, card-2 belum dipilih.
    expect(plan.getAttribute('aria-pressed')).toBe('true');
    const enterprise = screen.getByRole('button', { name: /Enterprise Pro/ });
    expect(enterprise.getAttribute('aria-pressed')).toBe('false');
  });

  it('Enter dan Space memilih kartu selectable', () => {
    render(<DataDisplayPage />);
    const plan = screen.getByRole('button', { name: /Standard Plan/ });
    fireEvent.keyDown(plan, { key: 'Enter' });
    expect(plan.getAttribute('aria-pressed')).toBe('true');

    const enterprise = screen.getByRole('button', { name: /Enterprise Pro/ });
    fireEvent.keyDown(enterprise, { key: ' ' });
    expect(enterprise.getAttribute('aria-pressed')).toBe('true');
    expect(plan.getAttribute('aria-pressed')).toBe('false');
  });
});
