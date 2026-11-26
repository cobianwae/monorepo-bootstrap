/**
 * Konfirmasi dan submit impor (pure logic, tanpa UI) — story 014-03.
 *
 * Policy baris gagal (OQ#2): `skip` (default) → baris error dilewati, `onComplete`
 * hanya menerima baris valid. `fail` → submit ditolak selama masih ada baris error.
 */

import { plural } from './plural';
import type { ImportResult, RowError } from './types';
import type { Mapping } from './wizard-state';

export type FailPolicy = 'skip' | 'fail';

export interface SubmitPlan {
  valid: number;
  /** Baris gagal (ada error) — ditampilkan sebagai "Gagal". */
  failedRows: number;
  /** Baris yang dilewati karena policy `skip`. */
  skipped: number;
  canSubmit: boolean;
  reason?: string;
}

export function planSubmit(validCount: number, invalidCount: number, policy: FailPolicy): SubmitPlan {
  if (policy === 'fail' && invalidCount > 0) {
    return {
      valid: validCount,
      failedRows: invalidCount,
      skipped: 0,
      canSubmit: false,
      reason: `${plural(invalidCount, 'row')} with errors. Fix them in the validation step or choose "Skip failed rows".`,
    };
  }
  if (validCount === 0) {
    return {
      valid: 0,
      failedRows: invalidCount,
      skipped: policy === 'skip' ? invalidCount : 0,
      canSubmit: false,
      reason: 'There are no valid rows to import.',
    };
  }
  return {
    valid: validCount,
    failedRows: invalidCount,
    skipped: policy === 'skip' ? invalidCount : 0,
    canSubmit: true,
  };
}

export interface SummaryBuckets {
  valid: number;
  /** Baris error yang dilewati (policy `skip`). */
  skipped: number;
  /** Baris error yang memblokir impor (policy `fail`). */
  failed: number;
}

/**
 * Kelompok untuk ringkasan konfirmasi. Setiap baris tidak valid hanya masuk satu
 * kelompok sesuai policy, sehingga tidak dihitung ganda sebagai dilewati dan gagal.
 * `ImportResult` tidak berubah; ini hanya tampilan ringkasan.
 */
export function summaryBuckets(plan: SubmitPlan, policy: FailPolicy): SummaryBuckets {
  return {
    valid: plan.valid,
    skipped: policy === 'skip' ? plan.failedRows : 0,
    failed: policy === 'fail' ? plan.failedRows : 0,
  };
}

export type BuildResult = { ok: true; result: ImportResult } | { ok: false; reason: string };

/**
 * Bangun `ImportResult` hanya dari baris valid, dengan key = key field target.
 * Kolom yang di-Abaikan tidak ikut.
 */
export function buildImportResult(
  rows: Record<string, string>[],
  mapping: Mapping,
  rowErrors: RowError[],
  policy: FailPolicy
): BuildResult {
  const invalidRows = new Set(rowErrors.map((e) => e.row));
  const plan = planSubmit(rows.length - invalidRows.size, invalidRows.size, policy);
  if (!plan.canSubmit) return { ok: false, reason: plan.reason ?? 'Submit rejected.' };

  const out: Record<string, string>[] = [];
  rows.forEach((row, index) => {
    if (invalidRows.has(index + 1)) return;
    const mapped: Record<string, string> = {};
    for (const [header, key] of Object.entries(mapping)) {
      if (key === null) continue;
      mapped[key] = row[header] ?? '';
    }
    out.push(mapped);
  });

  return {
    ok: true,
    result: { rows: out, skipped: plan.skipped, failed: plan.failedRows },
  };
}

/**
 * Label tombol submit. Saat submit diblokir, label tidak boleh menjanjikan impor
 * (CR-076): tombol menyebut alasan yang harus diselesaikan.
 */
export function submitLabel(plan: SubmitPlan): string {
  if (!plan.canSubmit) {
    return plan.valid === 0 ? 'No rows to import' : 'Fix errors to import';
  }
  return `Prepare import (${plural(plan.valid, 'row')})`;
}
