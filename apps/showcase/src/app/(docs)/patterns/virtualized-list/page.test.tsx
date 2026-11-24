/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import VirtualizedListPage from './page';

beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

describe('VirtualizedListPage — semantik tabel', () => {
  it('daftar produk diekspos sebagai tabel dengan header kolom dan jumlah baris total', async () => {
    render(<VirtualizedListPage />);
    // Data dimuat setelah timer 600ms (skeleton dulu).
    const table = await screen.findByRole('table', { name: 'Products' }, { timeout: 3000 });
    const headers = within(table).getAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual([
      'SKU',
      'Product',
      'Category',
      'Price',
      'Status',
      'Updated',
    ]);
    // aria-rowcount = total baris data + 1 header; nilai ini tidak boleh bergantung pada jendela render.
    const rowCount = Number(table.getAttribute('aria-rowcount'));
    expect(rowCount).toBeGreaterThan(1);
    expect(within(table).getAllByRole('row')[0].getAttribute('aria-rowindex')).toBe('1');
  });
});
