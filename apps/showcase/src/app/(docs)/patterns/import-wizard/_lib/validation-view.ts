/**
 * Tampilan validasi (pure logic, tanpa UI) — story 014-03.
 *
 * Mengubah hasil `validateRows` menjadi data siap tampil: indeks baris bermasalah,
 * hitungan per kolom, filter Semua/Hanya error, dan paginasi (25 baris/halaman).
 */

import { validateRows } from './validate';
import type { RowError, TargetField } from './types';
import type { Mapping } from './wizard-state';

export const PAGE_SIZE = 25;

export type ValidationFilter = 'all' | 'error';

export interface ValidationView {
  rowErrors: RowError[];
  /** Nomor baris (1-based) yang punya minimal satu error. */
  invalidRowNumbers: number[];
  validCount: number;
  invalidCount: number;
  /** Jumlah sel error per key field. */
  errorsByColumn: Record<string, number>;
  /** Kunci: `${row}\u0000${column}` → error sel. */
  cellErrors: Map<string, RowError>;
}

export function cellKey(row: number, column: string): string {
  return `${row}\u0000${column}`;
}

/** Hitung seluruh status validasi untuk satu dataset + mapping. */
export function buildValidation(
  rows: Record<string, string>[],
  mapping: Mapping,
  fields: TargetField[]
): ValidationView {
  const { rowErrors, validCount } = validateRows(rows, mapping, fields);

  const invalid = new Set<number>();
  const errorsByColumn: Record<string, number> = {};
  const cellErrors = new Map<string, RowError>();

  for (const error of rowErrors) {
    invalid.add(error.row);
    errorsByColumn[error.column] = (errorsByColumn[error.column] ?? 0) + 1;
    cellErrors.set(cellKey(error.row, error.column), error);
  }

  return {
    rowErrors,
    invalidRowNumbers: [...invalid].sort((a, b) => a - b),
    validCount,
    invalidCount: invalid.size,
    errorsByColumn,
    cellErrors,
  };
}

/** Nomor baris (1-based) yang tampil untuk filter aktif, urut naik. */
export function visibleRowNumbers(
  totalRows: number,
  view: ValidationView,
  filter: ValidationFilter
): number[] {
  if (filter === 'error') return view.invalidRowNumbers;
  return Array.from({ length: totalRows }, (_, i) => i + 1);
}

export interface PageSlice {
  page: number; // 1-based, sudah di-clamp
  pageCount: number;
  rows: number[]; // nomor baris 1-based pada halaman ini
}

/** Ambil satu halaman dari daftar nomor baris; `page` di-clamp ke rentang valid. */
export function paginate(rowNumbers: number[], page: number, pageSize = PAGE_SIZE): PageSlice {
  const pageCount = Math.max(1, Math.ceil(rowNumbers.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    pageCount,
    rows: rowNumbers.slice(start, start + pageSize),
  };
}
