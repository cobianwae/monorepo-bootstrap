import { describe, expect, it } from 'vitest';
import { validateRows } from './validate';
import type { TargetField } from './types';

const FIELDS: TargetField[] = [
  { key: 'name', label: 'Nama', required: true, type: 'string' },
  { key: 'email', label: 'Email', required: true, type: 'email', unique: true },
  { key: 'dob', label: 'Tgl Lahir', required: false, type: 'date' },
  {
    key: 'phone',
    label: 'Telepon',
    required: false,
    type: 'string',
    pattern: /^\d+$/,
  },
  {
    key: 'memberId',
    label: 'ID',
    required: true,
    type: 'string',
    validate: (value) => (value.startsWith('M') ? null : 'ID harus diawali M'),
  },
];

const MAPPING = {
  Nama: 'name',
  Email: 'email',
  'Tgl Lahir': 'dob',
  Telepon: 'phone',
  ID: 'memberId',
};

describe('validateRows', () => {
  it('AC-04 pelanggaran per sel dengan pesan Bahasa Indonesia + validCount', () => {
    const rows = [
      { Nama: 'Budi', Email: 'unique@x.com', 'Tgl Lahir': '1990-01-01', Telepon: '0812', ID: 'M001' }, // valid
      { Nama: 'Sari', Email: 'dup@x.com', 'Tgl Lahir': '1991-02-02', Telepon: '0813', ID: 'M002' }, // email ganda
      { Nama: 'Dedi', Email: 'dedi@x.com', 'Tgl Lahir': '32/13', Telepon: '0814', ID: 'M003' }, // tanggal invalid
      { Nama: '', Email: 'andi@x.com', 'Tgl Lahir': '1992-03-03', Telepon: '0815', ID: 'M004' }, // wajib kosong
      { Nama: 'Eka', Email: 'eka@x.com', 'Tgl Lahir': '1993-04-04', Telepon: 'abc', ID: 'M005' }, // pola salah
      { Nama: 'Lia', Email: 'dup@x.com', 'Tgl Lahir': '1994-05-05', Telepon: '0816', ID: 'M006' }, // email ganda
    ];

    const { rowErrors, validCount } = validateRows(rows, MAPPING, FIELDS);

    expect(validCount).toBe(1); // hanya baris 1
    expect(rowErrors).toHaveLength(5); // baris 2,3,4,5,6

    const errRow = (row: number) => rowErrors.find((e) => e.row === row)!;
    expect(errRow(2).message).toBe('Ganda di file (baris 2 & 6)');
    expect(errRow(3).message).toBe('Tanggal tidak valid (YYYY-MM-DD)');
    expect(errRow(4).message).toBe('Wajib diisi');
    expect(errRow(5).message).toBe('Format tidak sesuai');
    expect(errRow(6).message).toBe('Ganda di file (baris 2 & 6)');
  });

  it('tidak throw untuk data invalid (hanya struktur error)', () => {
    const rows = [
      { Nama: '', Email: 'invalid', 'Tgl Lahir': '32/13', Telepon: 'abc', ID: 'X' },
    ];

    expect(() => validateRows(rows, MAPPING, FIELDS)).not.toThrow();
    const { rowErrors, validCount } = validateRows(rows, MAPPING, FIELDS);
    expect(validCount).toBe(0);
    expect(rowErrors.length).toBeGreaterThan(0);
  });

  it('melampaui baris tanpa kolom terpetakan (null = Abaikan)', () => {
    const rows = [{ Nama: 'Budi', Email: 'budi@x.com', KolomLain: 'x' }];
    const mapping = { Nama: 'name', Email: null };

    const { validCount } = validateRows(rows, mapping, FIELDS);
    expect(validCount).toBe(1);
  });

  it('melempar bila field target tidak dikenal (kesalahan programmer)', () => {
    const rows = [{ Nama: 'Budi' }];
    const mapping = { Nama: 'tidakAdaField' };

    expect(() => validateRows(rows, mapping, FIELDS)).toThrow(/tidak dikenal/);
  });

  it('custom validate konsumen menghasilkan pesan ID', () => {
    const rows = [
      { Nama: 'Budi', Email: 'b@x.com', ID: 'X001' }, // custom invalid
      { Nama: 'Sari', Email: 's@x.com', ID: 'M002' }, // valid
    ];

    const { rowErrors, validCount } = validateRows(rows, MAPPING, FIELDS);
    expect(validCount).toBe(1);
    expect(rowErrors[0].message).toBe('ID harus diawali M');
    expect(rowErrors[0].column).toBe('memberId');
    expect(rowErrors[0].row).toBe(1);
  });
});
