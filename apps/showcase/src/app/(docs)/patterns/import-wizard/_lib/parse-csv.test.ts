import { describe, expect, it } from 'vitest';
import { UNSUPPORTED_FORMAT_ERROR, parseCsv } from './parse-csv';

const HEADER = 'Nama Lengkap,Email';
const FIVE_ROWS = [
  'Budi,budi@contoh.id',
  'Sari,sari@contoh.id',
  'Dedi,dedi@contoh.id',
  'Andi,andi@contoh.id',
  'Eka,eka@contoh.id',
].join('\n');

describe('parseCsv', () => {
  it('AC-01 memarse CSV valid menjadi header + 5 baris tanpa throw', async () => {
    const result = await parseCsv(`${HEADER}\n${FIVE_ROWS}`);

    expect(result.error).toBeUndefined();
    expect(result.headers).toEqual(['Nama Lengkap', 'Email']);
    expect(result.rows).toHaveLength(5);
    expect(result.rowCount).toBe(5);
    expect(result.rows[0]).toEqual({ 'Nama Lengkap': 'Budi', Email: 'budi@contoh.id' });
  });

  it('AC-01 menolak berkas non-CSV (XLSX) dengan pesan recovery English', async () => {
    const xlsx = { name: 'data.xlsx', type: '', size: 0 } as File;
    const result = await parseCsv(xlsx);

    expect(result.error).toBe(UNSUPPORTED_FORMAT_ERROR);
    expect(result.rows).toHaveLength(0);
  });

  it('AC-01 mendeteksi delimiter otomatis (titik koma)', async () => {
    const result = await parseCsv('Nama;Email\nBudi;budi@contoh.id');

    expect(result.error).toBeUndefined();
    expect(result.headers).toEqual(['Nama', 'Email']);
    expect(result.rows).toHaveLength(1);
  });

  it('AC-01 menghormati delimiter manual override', async () => {
    const result = await parseCsv('Nama;Email\nBudi;budi@contoh.id', { delimiter: ';' });

    expect(result.headers).toEqual(['Nama', 'Email']);
    expect(result.rows[0]).toEqual({ Nama: 'Budi', Email: 'budi@contoh.id' });
  });

  it('AC-02 memberi warning + tetap lanjut saat baris melebihi batas', async () => {
    const rows = Array.from({ length: 10_001 }, (_, i) => `Budi${i},budi${i}@contoh.id`).join('\n');
    const result = await parseCsv(`${HEADER}\n${rows}`, { maxRows: 10_000 });

    expect(result.error).toBeUndefined();
    expect(result.rowCount).toBe(10_001);
    expect(result.warnings.join(' ')).toContain('Recommended up to 10,000 rows. Larger files are still processed.');
    expect(result.rowCount).toBe(10_001);
  });

  it('AC-02 memberi warning + tetap lanjut saat ukuran melebihi batas', async () => {
    const file = { name: 'besar.csv', type: 'text/csv', size: 6_000_000 } as File;
    const result = await parseCsv(file, { maxBytes: 5_000_000 });

    expect(result.warnings.join(' ')).toContain('Recommended up to 5.0 MB. Larger files are still processed.');
    expect(result.error).toBe('The file cannot be read in this test environment');
  });

  it('AC-02 menghasilkan hasil kosong bertanda empty untuk file header-saja', async () => {
    const result = await parseCsv(HEADER);

    expect(result.error).toBeUndefined();
    expect(result.headers).toEqual(['Nama Lengkap', 'Email']);
    expect(result.rows).toHaveLength(0);
    expect(result.rowCount).toBe(0);
  });
});
