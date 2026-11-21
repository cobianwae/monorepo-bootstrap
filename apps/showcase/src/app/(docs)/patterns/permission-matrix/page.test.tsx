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
    expect(screen.getByText(/Buka halaman/)).toBeTruthy();
    const grid = screen.getByRole('grid', { name: 'Matriks izin role dan resource' });
    expect(within(grid).getAllByRole('columnheader')).toHaveLength(1 + 5);
    expect(within(grid).getAllByRole('row')).toHaveLength(1 + 8);
  });

  it('toggle kolom Editor memunculkan banner dengan jumlah perubahan', () => {
    render(<PermissionMatrixPage />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Toggle kolom Editor/ }));
    // Editor belum punya Pengaturan dan Hapus → dua sel berubah.
    expect(screen.getByText('2 perubahan belum disimpan')).toBeTruthy();
  });

  it('sel terkunci Viewer × Hapus ditolak dan alasannya diumumkan', () => {
    const { container } = render(<PermissionMatrixPage />);
    const locked = screen.getByRole('checkbox', { name: /Viewer × Hapus/ });
    fireEvent.click(locked);
    expect(liveText(container)).toContain('Tidak diubah. Terkunci: Dikunci kebijakan');
    expect(screen.queryByText(/perubahan belum disimpan/)).toBeNull();
  });

  it('skenario dirty 3 sel menampilkan banner tiga perubahan', () => {
    render(<PermissionMatrixPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Dirty 3 sel' }));
    expect(screen.getByText('3 perubahan belum disimpan')).toBeTruthy();
  });

  it('skenario kosong menampilkan empty state', () => {
    render(<PermissionMatrixPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Kosong' }));
    expect(screen.getByText('Belum ada role atau resource')).toBeTruthy();
  });
});
