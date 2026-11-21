/**
 * Parse CSV murni (wrapper papaparse) + deteksi batas ukuran/baris +
 * penolakan berkas non-CSV (XLSX → "v1 CSV saja", FR-010).
 *
 * Worker papaparse hanya di browser; di tes (node) diparses string sinkron
 * agar deterministik (lihat catatan risiko story 014-01).
 */

import Papa from 'papaparse';
import type { CsvParseResult, ParseCsvOptions } from './types';

const CSV_EXTENSIONS = ['.csv'];
const CSV_MIME = 'text/csv';

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return (bytes / 1_000_000).toFixed(1) + ' MB';
  if (bytes >= 1_000) return (bytes / 1_000).toFixed(1) + ' kB';
  return bytes + ' B';
}

function isCsvFile(input: File | { name?: string; type?: string; size?: number }): boolean {
  const name = String(input.name ?? '');
  const lower = name.toLowerCase();
  const hasExt = CSV_EXTENSIONS.some((ext) => lower.endsWith(ext));
  const hasMime = input.type === CSV_MIME;
  return hasExt || hasMime;
}

/**
 * Parse input (File | teks CSV) ke header + baris.
 * - File non-CSV (xlsx, dll.) → error 'v1 CSV saja' (FR-010), tidak melempar.
 * - >maxBytes / >maxRows → warning + tetap lanjut (warning, bukan blokir, OQ#1).
 * - Parsing gagal → error, tidak melempar.
 */
export function parseCsv(
  input: File | string,
  opts: ParseCsvOptions = {}
): Promise<CsvParseResult> {
  const delimiter = opts.delimiter ?? 'auto';
  const maxBytes = opts.maxBytes ?? 5_000_000;
  const maxRows = opts.maxRows ?? 10_000;
  const warnings: string[] = [];

  // Penolakan berkas non-CSV (XLSX) sebelum parsing.
  if (typeof input === 'object' && input !== null && !('length' in input)) {
    if (!isCsvFile(input as File)) {
      return Promise.resolve({
        headers: [],
        rows: [],
        rowCount: 0,
        warnings,
        error: 'v1 CSV saja',
      });
    }
    const file = input as File;
    if (file.size > maxBytes) {
      warnings.push(
        `File melebihi batas ${formatBytes(maxBytes)} — tetap diparses (warning, bukan blokir).`
      );
    }
  }

  return new Promise<CsvParseResult>((resolve) => {
    const config: Papa.ParseConfig = {
      header: true,
      skipEmptyLines: 'greedy',
      delimiter: delimiter === 'auto' ? undefined : delimiter,
      dynamicTyping: false, // selawi semua sebagai string
      complete: (results) => {
        const headers = (results.meta?.fields as string[]) ?? [];
        const rows = (results.data as Record<string, string>[]) ?? [];
        if (results.errors.length > 0) {
          resolve({
            headers,
            rows: [],
            rowCount: 0,
            warnings,
            error: 'Gagal membaca berkas CSV',
          });
          return;
        }
        if (maxRows && rows.length > maxRows) {
          warnings.push(
            `File melebihi batas ${maxRows.toLocaleString('id-ID')} baris — diparses penuh (warning).`
          );
        }
        resolve({ headers, rows, rowCount: rows.length, warnings });
      },
    };

    if (typeof input === 'string') {
      Papa.parse(input, config);
    } else if (typeof FileReader !== 'undefined') {
      const reader = new FileReader();
      reader.onload = () => Papa.parse(String(reader.result), config);
      reader.onerror = () => {
        resolve({ headers: [], rows: [], rowCount: 0, warnings, error: 'Gagal membaca berkas' });
      };
      reader.readAsText(input);
    } else {
      resolve({ headers: [], rows: [], rowCount: 0, warnings, error: 'Berkas tidak dapat dibaca di lingkungan uji' });
    }
  });
}
