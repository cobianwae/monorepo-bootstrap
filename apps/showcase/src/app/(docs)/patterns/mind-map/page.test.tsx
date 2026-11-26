/** @vitest-environment jsdom */
import { beforeAll, describe, expect, it, vi } from 'vitest';
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
  it('menempatkan demo sebelum panduan dan menjaga label status saat memakai ikon', () => {
    render(<MindMapPatternPage />);
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Interactive demo', 'When to use it', 'Try it', 'Keyboard', 'Implementation',
    ]);
    const panel = screen.getByRole('group', { name: 'Demo panel' });
    expect(panel.className).toContain('divide-y');
    expect(panel.className).not.toContain('bg-card');
    const states = within(screen.getByRole('group', { name: 'Demo status' })).getAllByRole('button');
    expect(states).toHaveLength(6);
    for (const button of states) {
      expect(button.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('enam langkah dan enam state demo, loading/empty/invalid/error tetap terjangkau', () => {
    const { container } = render(<MindMapPatternPage />);
    expect(container.querySelectorAll('ol > li')).toHaveLength(6);
    const panel = within(screen.getByRole('group', { name: 'Demo panel' }));
    fireEvent.click(panel.getByRole('button', { name: 'Loading' }));
    expect(screen.getAllByTestId('mind-map-skeleton')).toHaveLength(6);
    fireEvent.click(panel.getByRole('button', { name: 'Empty' }));
    expect(screen.getByRole('button', { name: 'Create map' })).toBeTruthy();
    fireEvent.click(panel.getByRole('button', { name: 'Invalid' }));
    expect(screen.getByRole('alert').textContent).toContain('Duplicate ID');
    fireEvent.click(panel.getByRole('button', { name: 'External error' }));
    expect(screen.getByRole('alert').textContent).toContain('Changes have not been saved');
    expect(container.querySelector('[data-node-id="q1"]')).not.toBeNull();
    fireEvent.click(panel.getByRole('button', { name: 'Populated' }));
    expect(container.querySelectorAll('[data-testid="mind-map-node"]')).toHaveLength(4);
    fireEvent.click(panel.getByRole('button', { name: 'Q1 example' }));
    expect(container.querySelectorAll('[data-testid="mind-map-node"]')).toHaveLength(12);
  });

  it('search membuka ancestor, mempertahankan toggle lain dan diagram tanpa hasil', () => {
    const { container } = render(<MindMapPatternPage />);
    fireEvent.click(screen.getByTestId('mind-map-expander-produk'));
    fireEvent.click(screen.getByTestId('mind-map-expander-riset'));
    const input = screen.getByRole('searchbox', { name: 'Search ideas' });
    fireEvent.change(input, { target: { value: 'interviews' } });
    expect(screen.getByTestId('mind-search-results').textContent).toBe('1 matching results');
    expect(container.querySelector('[data-node-id="wawancara"]')?.textContent).toContain('Match');
    expect(container.querySelector('[data-node-id="fitur"]')).toBeNull();
    fireEvent.click(screen.getByTestId('mind-map-expander-riset'));
    expect(container.querySelector('[data-node-id="wawancara"]')).toBeNull();
    fireEvent.change(input, { target: { value: 'zzzz' } });
    expect(screen.getByTestId('mind-search-results').textContent).toBe('No results');
    expect(container.querySelector('[data-node-id="q1"]')).not.toBeNull();
    fireEvent.change(input, { target: { value: '' } });
    expect(container.querySelector('[data-testid="mind-map-node"]')?.textContent).not.toContain('Match');
  });

  it('50 node, tema lokal light/dark dan toggle minimap', () => {
    const { container } = render(<MindMapPatternPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Load 50-node example' }));
    expect(container.querySelectorAll('[data-testid="mind-map-node"]')).toHaveLength(50);
    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
    expect(container.querySelector('[data-theme="pulse"]')?.className).toContain('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Minimap' }));
    expect(screen.queryByTestId('mind-map-minimap')).toBeNull();
  });

  it('input cari punya placeholder contoh dan terhubung ke status hasil', () => {
    render(<MindMapPatternPage />);
    const input = screen.getByRole('searchbox', { name: 'Search ideas' });
    expect(input.getAttribute('placeholder')).toBe('E.g. Market research');
    expect(input.getAttribute('aria-describedby')).toBe('mind-search-status');
    expect(screen.getByTestId('mind-search-results').id).toBe('mind-search-status');
    const actions = screen.getByRole('button', { name: 'Add branch to the central idea' }).parentElement!;
    expect(actions.parentElement!.contains(input)).toBe(true);
    expect(input.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByTestId('mind-search-results').parentElement!.className).not.toContain('mb-3');
  });

  it('input cari hanya tampil saat peta siap (unmount saat Loading/Invalid)', () => {
    // Perilaku komponen: loading/invalid/empty adalah early return tanpa searchSlot,
    // sehingga input unmount alih-alih disabled. Prop disabled tetap sebagai pengaman.
    render(<MindMapPatternPage />);
    const panel = within(screen.getByRole('group', { name: 'Demo panel' }));
    expect(screen.getByRole('searchbox', { name: 'Search ideas' })).toBeTruthy();
    fireEvent.click(panel.getByRole('button', { name: 'Invalid' }));
    expect(screen.queryByRole('searchbox', { name: 'Search ideas' })).toBeNull();
    fireEvent.click(panel.getByRole('button', { name: 'Loading' }));
    expect(screen.queryByRole('searchbox', { name: 'Search ideas' })).toBeNull();
    fireEvent.click(panel.getByRole('button', { name: 'Populated' }));
    const input = screen.getByRole('searchbox', { name: 'Search ideas' }) as HTMLInputElement;
    expect(input.disabled).toBe(false);
  });

  it('salin resep memenuhi target sentuh dan memberi umpan balik', async () => {
    render(<MindMapPatternPage />);
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const button = screen.getByRole('button', { name: 'Copy recipe' });
    expect(button.className).toContain('min-h-11');
    fireEvent.click(button);
    await screen.findByText('Recipe copied');
  });
});
