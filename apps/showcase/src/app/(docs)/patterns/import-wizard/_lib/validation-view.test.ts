import { describe, it, expect } from 'vitest';
import { DEMO_FIELDS } from './demo-fields';
import { INVALID_TEXT, VALID_TEXT } from './demo-datasets';
import { parseCsv } from './parse-csv';
import { buildValidation, paginate, visibleRowNumbers } from './validation-view';
import type { Mapping } from './wizard-state';

const MAPPING: Mapping = {
  'Nama Lengkap': 'name',
  Email: 'email',
  'Tgl Lahir': 'dob',
  Telepon: 'phone',
};

describe('buildValidation', () => {
  it('dataset valid: tidak ada baris gagal', async () => {
    const parsed = await parseCsv(VALID_TEXT);
    const view = buildValidation(parsed.rows, MAPPING, DEMO_FIELDS);
    expect(view.validCount).toBe(200);
    expect(view.invalidCount).toBe(0);
    expect(view.invalidRowNumbers).toEqual([]);
  });

  it('dataset invalid: baris 3, 7 (email ganda) dan 9 (tanggal) gagal', async () => {
    const parsed = await parseCsv(INVALID_TEXT);
    const view = buildValidation(parsed.rows, MAPPING, DEMO_FIELDS);
    expect(view.validCount).toBe(200);
    expect(view.invalidRowNumbers).toEqual([3, 7, 9]);
    expect(view.errorsByColumn.email).toBe(2);
    expect(view.errorsByColumn.dob).toBe(1);
    expect(view.cellErrors.get('9\u0000dob')?.message).toBe('Tanggal tidak valid (YYYY-MM-DD)');
  });
});

describe('visibleRowNumbers', () => {
  it('filter error hanya menampilkan baris bermasalah', async () => {
    const parsed = await parseCsv(INVALID_TEXT);
    const view = buildValidation(parsed.rows, MAPPING, DEMO_FIELDS);
    expect(visibleRowNumbers(parsed.rows.length, view, 'error')).toEqual([3, 7, 9]);
    expect(visibleRowNumbers(parsed.rows.length, view, 'all')).toHaveLength(203);
  });
});

describe('paginate', () => {
  const rows = Array.from({ length: 60 }, (_, i) => i + 1);

  it('membagi per 25 baris dan memotong halaman terakhir', () => {
    const page = paginate(rows, 3);
    expect(page.pageCount).toBe(3);
    expect(page.rows).toEqual(rows.slice(50));
  });

  it('meng-clamp halaman di luar rentang', () => {
    expect(paginate(rows, 99).page).toBe(3);
    expect(paginate(rows, 0).page).toBe(1);
  });

  it('daftar kosong tetap satu halaman', () => {
    expect(paginate([], 1)).toEqual({ page: 1, pageCount: 1, rows: [] });
  });
});
