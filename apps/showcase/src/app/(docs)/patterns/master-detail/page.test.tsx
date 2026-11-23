/** @vitest-environment jsdom */
import { beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import MasterDetailPatternPage from './page';

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

describe('MasterDetailPatternPage (CR-064 C08)', () => {
  it('hasil filter kosong berada di dalam list dan menyediakan clear search', () => {
    const { container } = render(<MasterDetailPatternPage />);
    const search = screen.getByRole('textbox', { name: 'Search tickets' });
    const list = container.querySelector('ul.divide-y');
    expect(list).toBeTruthy();
    const itemsBefore = within(list as HTMLElement).getAllByRole('listitem').length;
    expect(itemsBefore).toBeGreaterThan(0);

    fireEvent.change(search, { target: { value: 'zzz-tidak-ada' } });

    const emptyItem = within(list as HTMLElement).getByText(/No tickets match/);
    expect(emptyItem.closest('li')).toBeTruthy();
    for (const child of Array.from((list as HTMLElement).children)) {
      expect(child.tagName).toBe('LI');
    }

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    expect((search as HTMLInputElement).value).toBe('');
    expect(within(list as HTMLElement).getAllByRole('listitem')).toHaveLength(itemsBefore);
    expect(screen.queryByText(/No tickets match/)).toBeNull();
  });
});
