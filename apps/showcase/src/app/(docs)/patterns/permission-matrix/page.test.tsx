/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import PermissionMatrixPage from './page';

beforeAll(() => {
  // Radix (Checkbox/Tooltip) memakai ResizeObserver yang tidak tersedia di jsdom.
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

function liveText(container: HTMLElement): string {
  return container.querySelector('[aria-live="polite"]')?.textContent ?? '';
}

describe('PermissionMatrixPage', () => {
  it('merender judul, langkah skenario, dan grid 5×8', () => {
    render(<PermissionMatrixPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Permission Matrix' })).toBeTruthy();
    expect(screen.getByText(/Open "View changes"/)).toBeTruthy();
    const grid = screen.getByRole('grid', { name: 'Role and resource permission matrix' });
    expect(within(grid).getAllByRole('columnheader')).toHaveLength(1 + 5);
    expect(within(grid).getAllByRole('row')).toHaveLength(1 + 8);
  });

  it('toggle kolom Editor memunculkan banner dengan jumlah perubahan', () => {
    render(<PermissionMatrixPage />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Toggle Editor column/ }));
    // Editor lacks Settings and Delete → two cells change.
    expect(screen.getByText('2 unsaved changes')).toBeTruthy();
  });

  it('sel terkunci Viewer × Hapus ditolak dan alasannya diumumkan', () => {
    const { container } = render(<PermissionMatrixPage />);
    const locked = screen.getByRole('checkbox', { name: /Viewer × Delete/ });
    fireEvent.click(locked);
    expect(liveText(container)).toContain('Unchanged. Locked: Locked by policy');
    expect(screen.getAllByText(/^\d+ unsaved changes$/)).toHaveLength(1); // scenario button only; no banner
  });

  it('skenario dirty 3 sel menampilkan banner tiga perubahan', () => {
    render(<PermissionMatrixPage />);
    fireEvent.click(screen.getByRole('button', { name: '3 unsaved changes' }));
    expect(screen.getAllByText('3 unsaved changes').length).toBeGreaterThan(0);
  });

  it('skenario kosong menampilkan empty state', () => {
    render(<PermissionMatrixPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Empty' }));
    expect(screen.getByText('No roles or resources yet')).toBeTruthy();
  });
});
