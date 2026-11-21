import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
});
