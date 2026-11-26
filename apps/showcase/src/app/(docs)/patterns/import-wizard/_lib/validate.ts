/**
 * Validasi deklaratif per sel; pesan bawaan English (CR-079).
 *
 * Urutan per sel: wajib → tipe → pola → unik-dalam-file → custom.
 * Satu sel menampilkan pelanggaran pertama saja. Tidak melempar untuk data
 * invalid (hanya kesalahan programmer, mis. field target tidak dikenal).
 *
 * Menurut design spec §3 langkah 5 + contoh pesan §2.
 */

import type { FieldType, RowError, TargetField } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === '';
}

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

function isValidNumber(value: string): boolean {
  const n = Number(value);
  return !isNaN(n) && isFinite(n);
}

function isValidDate(value: string): boolean {
  const m = DATE_REGEX.exec(value);
  if (!m) return false;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  return (
    date.getFullYear() === Number(y) &&
    date.getMonth() === Number(mo) - 1 &&
    date.getDate() === Number(d)
  );
}

type TypeRule = { check: (value: string) => boolean; message: string };

const TYPE_RULES: Record<Exclude<FieldType, 'string'>, TypeRule> = {
  email: { check: isValidEmail, message: 'Invalid email' },
  number: { check: isValidNumber, message: 'Not a number' },
  date: { check: isValidDate, message: 'Invalid date (YYYY-MM-DD)' },
};

export function validateRows(
  rows: Record<string, string>[],
  mapping: Record<string, string | null>,
  fields: TargetField[]
): { rowErrors: RowError[]; validCount: number } {
  const fieldByKey = new Map(fields.map((f) => [f.key, f]));

  // Precompute unik: (fieldKey, value) -> nomor baris (1-based) yang sama.
  const uniqueMap = new Map<string, number[]>();
  for (const field of fields) {
    if (!field.unique) continue;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (const [header, key] of Object.entries(mapping)) {
        if (key !== field.key) continue;
        const value = row[header];
        if (isEmpty(value)) continue;
        const k = `${field.key}\u0000${value}`;
        const arr = uniqueMap.get(k) ?? [];
        arr.push(i + 1);
        uniqueMap.set(k, arr);
      }
    }
  }

  const rowErrors: RowError[] = [];
  let validCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 1;
    let rowHasError = false;

    for (const [header, key] of Object.entries(mapping)) {
      if (key === null) continue; // Abaikan
      const field = fieldByKey.get(key);
      if (!field) {
        // Kesalahan programmer: field target tidak dikenal.
        throw new Error(`Unknown target field: ${key}`);
      }
      const value = row[header] ?? '';
      const message = validateCell(value, row, field, uniqueMap);
      if (message) {
        rowErrors.push({ row: rowNumber, column: key, message });
        rowHasError = true;
      }
    }

    if (!rowHasError) validCount++;
  }

  return { rowErrors, validCount };
}

function validateCell(
  value: string,
  row: Record<string, string>,
  field: TargetField,
  uniqueMap: Map<string, number[]>
): string | null {
  // 1. Wajib
  if (field.required && isEmpty(value)) return 'Required';
  if (isEmpty(value)) return null; // kosong & bukan wajib → lolos sisa aturan

  // 2. Tipe
  if (field.type !== 'string') {
    const rule = TYPE_RULES[field.type];
    if (rule && !rule.check(value)) return rule.message;
  }

  // 3. Pola
  if (field.pattern && !field.pattern.test(value)) return 'Invalid format';

  // 4. Unik dalam file
  if (field.unique) {
    const k = `${field.key}\u0000${value}`;
    const rowsWith = uniqueMap.get(k);
    if (rowsWith && rowsWith.length > 1) {
      return `Duplicate in file (rows ${rowsWith.join(' & ')})`;
    }
  }

  // 5. Custom (konsumen)
  if (field.validate) {
    const custom = field.validate(value, row);
    if (custom) return custom;
  }

  return null;
}
