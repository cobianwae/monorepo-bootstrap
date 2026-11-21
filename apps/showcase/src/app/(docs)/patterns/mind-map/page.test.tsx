/** @vitest-environment jsdom */
import { beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import MindMapPatternPage from './page';

beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

describe('MindMapPatternPage (012-03)', () => {
  it('enam langkah dan enam state demo, loading/empty/invalid/error tetap terjangkau', () => {
    const { container } = render(<MindMapPatternPage />);
    expect(container.querySelectorAll('ol > li')).toHaveLength(6);
    const panel = within(screen.getByRole('group', { name: 'Panel demo' }));
    fireEvent.click(panel.getByRole('button', { name: 'Loading' }));
    expect(screen.getAllByTestId('mind-map-skeleton')).toHaveLength(6);
    fireEvent.click(panel.getByRole('button', { name: 'Empty' }));
    expect(screen.getByRole('button', { name: 'Buat peta' })).toBeTruthy();
    fireEvent.click(panel.getByRole('button', { name: 'Invalid' }));
    expect(screen.getByRole('alert').textContent).toContain('ID duplikat');
    fireEvent.click(panel.getByRole('button', { name: 'Error eksternal' }));
    expect(screen.getByRole('alert').textContent).toContain('Perubahan belum tersimpan');
    expect(container.querySelector('[data-node-id="q1"]')).not.toBeNull();
    fireEvent.click(panel.getByRole('button', { name: 'Berisi' }));
    expect(container.querySelectorAll('[data-testid="mind-map-node"]')).toHaveLength(4);
    fireEvent.click(panel.getByRole('button', { name: 'Contoh Q1' }));
    expect(container.querySelectorAll('[data-testid="mind-map-node"]')).toHaveLength(12);
  });

  it('search membuka ancestor, mempertahankan toggle lain dan diagram tanpa hasil', () => {
    const { container } = render(<MindMapPatternPage />);
    fireEvent.click(screen.getByTestId('mind-map-expander-produk'));
    fireEvent.click(screen.getByTestId('mind-map-expander-riset'));
    const input = screen.getByRole('searchbox', { name: 'Cari ide' });
    fireEvent.change(input, { target: { value: 'wawancara' } });
    expect(screen.getByTestId('mind-search-results').textContent).toBe('1 hasil cocok');
    expect(container.querySelector('[data-node-id="wawancara"]')?.textContent).toContain('Cocok');
    expect(container.querySelector('[data-node-id="fitur"]')).toBeNull();
    fireEvent.click(screen.getByTestId('mind-map-expander-riset'));
    expect(container.querySelector('[data-node-id="wawancara"]')).toBeNull();
    fireEvent.change(input, { target: { value: 'zzzz' } });
    expect(screen.getByTestId('mind-search-results').textContent).toBe('Tidak ada hasil');
    expect(container.querySelector('[data-node-id="q1"]')).not.toBeNull();
    fireEvent.change(input, { target: { value: '' } });
    expect(container.querySelector('[data-testid="mind-map-node"]')?.textContent).not.toContain('Cocok');
  });

  it('50 node, tema lokal light/dark dan toggle minimap', () => {
    const { container } = render(<MindMapPatternPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Muat 50 node' }));
    expect(container.querySelectorAll('[data-testid="mind-map-node"]')).toHaveLength(50);
    fireEvent.click(screen.getByRole('button', { name: 'Mode gelap' }));
    expect(container.querySelector('[data-theme="pulse"]')?.className).toContain('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Peta mini' }));
    expect(screen.queryByTestId('mind-map-minimap')).toBeNull();
  });
});
