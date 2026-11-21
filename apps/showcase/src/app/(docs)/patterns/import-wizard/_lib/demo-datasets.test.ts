import { describe, it, expect } from 'vitest';
import {
  DEMO_DATASETS,
  DEMO_HEADER,
  EMPTY_TEXT,
  INVALID_TEXT,
  LARGE_ROW_COUNT,
  VALID_TEXT,
  toDemoFile,
} from './demo-datasets';

const lines = (text: string) => text.split('\n').filter((line) => line.length > 0);

describe('demo datasets', () => {
  it('valid: header + 200 baris', () => {
    expect(lines(VALID_TEXT)).toHaveLength(201);
    expect(lines(VALID_TEXT)[0]).toBe(DEMO_HEADER);
  });

  it('invalid: 203 baris data, baris 3 & 7 email ganda, baris 9 tanggal salah', () => {
    const data = lines(INVALID_TEXT).slice(1);
    expect(data).toHaveLength(203);
    expect(data[2]).toContain('dup@contoh.id');
    expect(data[6]).toContain('dup@contoh.id');
    expect(data[8]).toContain('32/13/1990');
  });

  it('kosong: hanya header', () => {
    expect(lines(EMPTY_TEXT)).toEqual([DEMO_HEADER]);
  });

  it('besar: 10.000 baris data', () => {
    expect(LARGE_ROW_COUNT).toBe(10_000);
    expect(lines(DEMO_DATASETS.large.text)).toHaveLength(LARGE_ROW_COUNT + 1);
  });

  it('toDemoFile membawa nama dan mime dataset', () => {
    const file = toDemoFile(DEMO_DATASETS.format);
    expect(file.name).toBe('anggota.xlsx');
    expect(file.type).toBe(DEMO_DATASETS.format.mime);
  });
});
