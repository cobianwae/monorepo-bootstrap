import { describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { PermissionMatrix } from './permission-matrix';
import type { PermissionValue } from './permission-matrix-types';

const roles = [
  { id: 'admin', label: 'Admin' },
  { id: 'editor', label: 'Editor' },
  { id: 'viewer', label: 'Viewer' },
  { id: 'auditor', label: 'Auditor' },
  { id: 'owner', label: 'Owner' },
];

const resources = [
  { id: 'publikasi', label: 'Publikasi' },
  { id: 'artikel', label: 'Artikel' },
  { id: 'hapus', label: 'Hapus' },
  { id: 'komentar', label: 'Komentar' },
  { id: 'media', label: 'Media' },
  { id: 'pengaturan', label: 'Pengaturan' },
  { id: 'pengguna', label: 'Pengguna' },
  { id: 'laporan', label: 'Laporan' },
];

function makeValue(fill: boolean): PermissionValue {
  const v: PermissionValue = {};
  for (const r of roles) {
    v[r.id] = {};
    for (const res of resources) v[r.id][res.id] = fill;
  }
  return v;
}

describe('PermissionMatrix', () => {
  it('renders 5x8 grid with associated scope headers and labeled cells', () => {
    render(<PermissionMatrix roles={roles} resources={resources} value={makeValue(false)} />);
    expect(screen.getByRole('grid', { name: /matriks izin/i })).toBeDefined();

    const colHeaders = screen.getAllByRole('columnheader');
    expect(colHeaders.length).toBeGreaterThanOrEqual(6);
    for (const h of colHeaders) expect(h.getAttribute('scope')).toBe('col');

    const rowHeaders = screen.getAllByRole('rowheader');
    expect(rowHeaders).toHaveLength(8);
    for (const h of rowHeaders) expect(h.getAttribute('scope')).toBe('row');

    expect(screen.getAllByRole('gridcell')).toHaveLength(40);
    expect(screen.getByLabelText('Editor × Hapus, mati')).toBeDefined();
  });

  it('shows full / partial / empty header states via aria-checked', () => {
    const value = makeValue(false);
    for (const res of resources) value.admin[res.id] = true; // penuh
    value.editor[resources[0].id] = true; // sebagian 1/8
    render(<PermissionMatrix roles={roles} resources={resources} value={value} />);

    expect(screen.getByLabelText(/toggle kolom admin/i).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByLabelText(/toggle kolom editor/i).getAttribute('aria-checked')).toBe('mixed');
    expect(screen.getByLabelText(/toggle kolom owner/i).getAttribute('aria-checked')).toBe('false');
    expect(screen.getAllByText('sebagian').length).toBeGreaterThan(0);
  });

  it('toggles single cell with exactly one onValueChange(diff 1)', () => {
    const onValueChange = vi.fn();
    render(
      <PermissionMatrix roles={roles} resources={resources} value={makeValue(false)} onValueChange={onValueChange} />
    );
    fireEvent.click(screen.getByLabelText('Editor × Hapus, mati'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const [next, diff] = onValueChange.mock.calls[0] as [PermissionValue, Array<{ role: string; resource: string; from: boolean; to: boolean }>];
    expect(diff).toHaveLength(1);
    expect(diff[0]).toEqual({ role: 'editor', resource: 'hapus', from: false, to: true });
    expect(next.editor.hapus).toBe(true);
  });

  it('toggles a column with one call and 8 diffs', () => {
    const onValueChange = vi.fn();
    render(
      <PermissionMatrix roles={roles} resources={resources} value={makeValue(false)} onValueChange={onValueChange} />
    );
    fireEvent.click(screen.getByLabelText(/toggle kolom editor/i));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const [, diff] = onValueChange.mock.calls[0] as [PermissionValue, unknown[]];
    expect(diff).toHaveLength(8);
  });

  it('toggles all with one call and 40 diffs', () => {
    const onValueChange = vi.fn();
    render(
      <PermissionMatrix roles={roles} resources={resources} value={makeValue(false)} onValueChange={onValueChange} />
    );
    fireEvent.click(screen.getByLabelText(/pilih semua izin/i));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const [, diff] = onValueChange.mock.calls[0] as [PermissionValue, unknown[]];
    expect(diff).toHaveLength(40);
  });

  it('rejects locked cell via pointer and keyboard, keeps reason in label', () => {
    const onValueChange = vi.fn();
    const locked = (role: string, resource: string) =>
      role === 'viewer' && resource === 'hapus' ? 'Dikunci kebijakan: Viewer tidak boleh Hapus' : null;
    render(
      <PermissionMatrix roles={roles} resources={resources} value={makeValue(false)} onValueChange={onValueChange} locked={locked} />
    );
    const cell = screen.getByLabelText(/viewer × hapus, terkunci/i);
    expect(cell.getAttribute('aria-label')).toContain('Dikunci kebijakan');
    fireEvent.click(cell);
    fireEvent.keyDown(cell, { key: ' ' });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByText(/Tidak diubah. Terkunci:/).textContent).toContain('Viewer tidak boleh Hapus');
  });

  it('excludes locked cells from denominator and skips them in bulk toggle', () => {
    const onValueChange = vi.fn();
    const locked = (role: string, resource: string) =>
      role === 'editor' && resource === 'hapus' ? 'Dikunci kebijakan' : null;
    const value = makeValue(false);
    for (const res of resources) {
      if (res.id !== 'hapus') value.editor[res.id] = true;
    }
    render(
      <PermissionMatrix roles={roles} resources={resources} value={value} onValueChange={onValueChange} locked={locked} />
    );
    // 7/7 unlocked on → header penuh, bukan mixed
    expect(screen.getByLabelText(/toggle kolom editor/i).getAttribute('aria-checked')).toBe('true');

    fireEvent.click(screen.getByLabelText(/toggle kolom editor/i));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const [next, diff] = onValueChange.mock.calls[0] as [PermissionValue, Array<{ resource: string; to: boolean }> ];
    expect(diff).toHaveLength(7);
    expect(next.editor.hapus).toBe(false);
    expect(diff.every((d) => d.resource !== 'hapus')).toBe(true);
  });

  it('supports roving keyboard navigation and toggles focused cells with Space', () => {
    const onValueChange = vi.fn();
    render(<PermissionMatrix roles={roles} resources={resources} value={makeValue(false)} onValueChange={onValueChange} />);
    const first = screen.getByLabelText('Pilih semua izin');
    expect(first.getAttribute('tabindex')).toBe('0');
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    const admin = screen.getByLabelText(/toggle kolom admin/i);
    expect(document.activeElement).toBe(admin);
    fireEvent.keyDown(admin, { key: 'ArrowDown' });
    const cell = screen.getByLabelText('Admin × Publikasi, mati');
    expect(document.activeElement).toBe(cell);
    fireEvent.keyDown(cell, { key: ' ' });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(fireEvent.keyDown(cell, { key: 'Tab' })).toBe(true);
    expect(fireEvent.keyDown(cell, { key: 'Tab', shiftKey: true })).toBe(true);
  });

  it('shows dirty changes, resets a changed cell to baseline, and calls save', () => {
    const onValueChange = vi.fn();
    const onSave = vi.fn();
    const initialValue = makeValue(false);
    const current = makeValue(false);
    current.admin.publikasi = true;
    render(<PermissionMatrix roles={roles} resources={resources} value={current} initialValue={initialValue} onValueChange={onValueChange} onSave={onSave} />);
    expect(screen.getByText('1 perubahan belum disimpan')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Lihat daftar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset baris ini' }));
    expect(onValueChange).toHaveBeenCalledWith(initialValue, [{ role: 'admin', resource: 'publikasi', from: true, to: false }]);
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('renders loading, empty, duplicate-id error, and all-locked states', () => {
    const { rerender } = render(<PermissionMatrix roles={roles} resources={resources} value={makeValue(false)} loading />);
    expect(screen.getByText('Memuat izin…')).toBeDefined();
    expect(screen.getByText('Memuat izin…').parentElement?.getAttribute('aria-busy')).toBe('true');

    rerender(<PermissionMatrix roles={[]} resources={resources} value={{}} />);
    expect(screen.getByRole('status')).toBeDefined();

    rerender(<PermissionMatrix roles={[roles[0], roles[0]]} resources={resources} value={makeValue(false)} />);
    expect(screen.getByRole('alert').textContent).toContain('ID role atau resource duplikat');
    expect(document.activeElement).toBe(screen.getByRole('alert'));

    rerender(<PermissionMatrix roles={roles} resources={resources} value={makeValue(false)} locked={() => 'Terkunci kebijakan'} />);
    expect(screen.getByText('Semua sel dikunci kebijakan.')).toBeDefined();
  });

  it('keeps locked cells reachable, announces refusal, and preserves row/column boundaries', () => {
    const onValueChange = vi.fn();
    render(<PermissionMatrix roles={roles} resources={resources} value={makeValue(false)} onValueChange={onValueChange} locked={() => 'Kebijakan organisasi'} />);
    const first = screen.getByLabelText(/pilih semua izin/i);
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    const row = screen.getByLabelText(/toggle semua izin publikasi/i);
    expect(document.activeElement).toBe(row);
    fireEvent.keyDown(row, { key: 'ArrowRight' });
    const cell = screen.getByLabelText(/Admin × Publikasi, terkunci/);
    expect(document.activeElement).toBe(cell);
    fireEvent.keyDown(cell, { key: ' ' });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByText('Tidak diubah. Terkunci: Kebijakan organisasi')).toBeDefined();
    fireEvent.keyDown(cell, { key: 'End' });
    const lastInRow = screen.getByLabelText(/Owner × Publikasi, terkunci/);
    expect(document.activeElement).toBe(lastInRow);
    fireEvent.keyDown(lastInRow, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(lastInRow);
    fireEvent.keyDown(lastInRow, { key: 'Home' });
    expect(document.activeElement).toBe(row);
    fireEvent.keyDown(row, { key: 'Home', ctrlKey: true });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: 'End', ctrlKey: true });
    const last = screen.getByLabelText(/Owner × Laporan, terkunci/);
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(last);
    expect(within(screen.getByRole('grid')).getAllByRole('checkbox').filter((item) => item.tabIndex === 0)).toHaveLength(1);
  });

  it('tracks three controlled changes, resets one/all, returns focus, and clears the banner on save', () => {
    const initialValue = makeValue(false);
    const onSave = vi.fn();
    function Consumer() {
      const [value, setValue] = React.useState(initialValue);
      const [baseline, setBaseline] = React.useState(initialValue);
      return <PermissionMatrix roles={roles} resources={resources} value={value} initialValue={baseline} onValueChange={setValue} onSave={() => { onSave(value); setBaseline(value); }} />;
    }
    render(<Consumer />);
    for (const label of ['Admin × Publikasi', 'Editor × Artikel', 'Viewer × Media']) {
      fireEvent.click(screen.getByLabelText(`${label}, mati`));
    }
    const banner = screen.getByRole('status');
    expect(within(banner).getByText('3')).toBeDefined();
    expect(screen.getByRole('grid').compareDocumentPosition(banner) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Lihat daftar' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    fireEvent.click(screen.getAllByRole('button', { name: 'Reset baris ini' })[0]);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(document.activeElement).toBe(screen.getByLabelText(/pilih semua izin/i));
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Perubahan dibatalkan')).toBeDefined();
    expect(document.activeElement).toBe(screen.getByLabelText(/pilih semua izin/i));
    fireEvent.click(screen.getByLabelText('Editor × Artikel, mati'));
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0].editor.artikel).toBe(true);
    expect(screen.queryByRole('status')).toBeNull();
    expect(document.activeElement).toBe(screen.getByLabelText(/pilih semua izin/i));
  });

  it('captures the ready baseline by default and emits exactly one batch per keyboard header action', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<PermissionMatrix roles={roles} resources={resources} value={makeValue(false)} onValueChange={onValueChange} />);
    const header = screen.getByLabelText(/toggle kolom admin/i);
    fireEvent.keyDown(header, { key: 'Enter' });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const [next, diff] = onValueChange.mock.calls[0];
    expect(diff).toHaveLength(8);
    expect(screen.getByText(/8 dipilih/)).toBeDefined();
    rerender(<PermissionMatrix roles={roles} resources={resources} value={next} onValueChange={onValueChange} />);
    expect(screen.getByText('8 perubahan belum disimpan')).toBeDefined();
  });

  it('exposes loading placeholders and functional empty/error recovery actions', () => {
    const onLoadExample = vi.fn();
    const { rerender } = render(<PermissionMatrix roles={roles} resources={resources} value={{}} loading />);
    const grid = screen.getByRole('grid');
    expect(grid.querySelectorAll('.animate-pulse')).toHaveLength(40);
    expect(grid.querySelectorAll('.motion-reduce\\:animate-none')).toHaveLength(40);
    expect(within(grid).queryAllByRole('checkbox')).toHaveLength(0);
    rerender(<PermissionMatrix roles={[]} resources={[]} value={{}} onLoadExample={onLoadExample} />);
    fireEvent.click(screen.getByRole('button', { name: 'Muat contoh 5×8' }));
    expect(onLoadExample).toHaveBeenCalledTimes(1);
    rerender(<PermissionMatrix roles={roles} resources={resources} value={{}} error="Sumber data tidak tersedia" onLoadExample={onLoadExample} />);
    expect(document.activeElement).toBe(screen.getByRole('alert'));
    expect(screen.getByRole('alert').textContent).toContain('Sumber data tidak tersedia');
    fireEvent.click(screen.getByRole('button', { name: 'Muat contoh' }));
    expect(onLoadExample).toHaveBeenCalledTimes(2);
  });

  it('retains all 20 columns with sticky headers and scrolls keyboard focus into view', () => {
    const manyRoles = Array.from({ length: 20 }, (_, index) => ({ id: `role-${index}`, label: `Role ${index}` }));
    const { container } = render(<PermissionMatrix roles={manyRoles} resources={resources} value={{}} density="compact" />);
    expect(screen.getAllByRole('gridcell')).toHaveLength(160);
    expect(screen.getAllByRole('columnheader').every((header) => header.classList.contains('sticky') && header.classList.contains('top-0'))).toBe(true);
    expect(screen.getAllByRole('rowheader').every((header) => header.classList.contains('sticky') && header.classList.contains('left-0'))).toBe(true);
    expect(container.querySelector('.overflow-auto')).not.toBeNull();
    const last = screen.getByLabelText('Role 19 × Laporan, mati');
    const scrollIntoView = vi.spyOn(last, 'scrollIntoView');
    fireEvent.keyDown(screen.getByLabelText(/pilih semua izin/i), { key: 'End', ctrlKey: true });
    expect(document.activeElement).toBe(last);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
  });
});
