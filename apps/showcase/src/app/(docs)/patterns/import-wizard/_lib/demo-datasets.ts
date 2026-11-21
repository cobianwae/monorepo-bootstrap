/**
 * Dataset contoh showcase (story 014-03, S-005.37): valid, invalid, kosong, besar,
 * serta pemicu error format dan error parse. Dibangkitkan di memori, tanpa berkas statis.
 */

export const DEMO_HEADER = 'Nama Lengkap,Email,Tgl Lahir,Telepon';

export type DemoDatasetId = 'valid' | 'invalid' | 'empty' | 'large' | 'format' | 'parse';

export interface DemoDataset {
  id: DemoDatasetId;
  label: string;
  fileName: string;
  mime: string;
  text: string;
}

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

function validRow(i: number, email = `anggota${i}@contoh.id`, dob?: string): string {
  const birth = dob ?? `${1960 + (i % 50)}-${pad((i % 12) + 1)}-${pad((i % 28) + 1)}`;
  return `Anggota ${i},${email},${birth},0812${pad(100000000 + i, 9)}`;
}

function buildRows(count: number, overrides: Record<number, string> = {}): string {
  const lines = [DEMO_HEADER];
  for (let i = 1; i <= count; i++) {
    lines.push(overrides[i] ?? validRow(i));
  }
  return lines.join('\n') + '\n';
}

/** 200 baris valid. */
export const VALID_TEXT = buildRows(200);

/**
 * 203 baris: 200 valid + 3 gagal.
 * - baris 3 & 7: email ganda (`dup@contoh.id`)
 * - baris 9: tanggal tidak valid (`32/13/1990`)
 */
export const INVALID_TEXT = buildRows(203, {
  3: validRow(3, 'dup@contoh.id'),
  7: validRow(7, 'dup@contoh.id'),
  9: validRow(9, undefined, '32/13/1990'),
});

/** Hanya header — memicu empty state (FR-008). */
export const EMPTY_TEXT = `${DEMO_HEADER}\n`;

/** 10.000 baris untuk uji progres dan paginasi. */
export const LARGE_ROW_COUNT = 10_000;

export const DEMO_DATASETS: Record<DemoDatasetId, DemoDataset> = {
  valid: {
    id: 'valid',
    label: 'Valid (200 baris)',
    fileName: 'anggota-valid.csv',
    mime: 'text/csv',
    text: VALID_TEXT,
  },
  invalid: {
    id: 'invalid',
    label: 'Invalid (3 baris gagal)',
    fileName: 'anggota-invalid.csv',
    mime: 'text/csv',
    text: INVALID_TEXT,
  },
  empty: {
    id: 'empty',
    label: 'Kosong (header saja)',
    fileName: 'kosong.csv',
    mime: 'text/csv',
    text: EMPTY_TEXT,
  },
  large: {
    id: 'large',
    label: 'Besar (10.000 baris)',
    fileName: 'anggota-besar.csv',
    mime: 'text/csv',
    text: buildRows(LARGE_ROW_COUNT),
  },
  format: {
    id: 'format',
    label: 'Error format (XLSX)',
    fileName: 'anggota.xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    text: 'PK\u0003\u0004 bukan CSV',
  },
  parse: {
    id: 'parse',
    label: 'Error parse (kutip rusak)',
    fileName: 'rusak.csv',
    mime: 'text/csv',
    // Kutip tidak ditutup → papaparse melaporkan error → "Gagal membaca berkas CSV".
    text: `Nama Lengkap,Email\n"Budi,budi@contoh.id\n`,
  },
};

/** Berkas siap-unggah untuk dataset demo (dipakai lewat jalur file yang sama). */
export function toDemoFile(dataset: DemoDataset): File {
  return new File([dataset.text], dataset.fileName, { type: dataset.mime });
}
