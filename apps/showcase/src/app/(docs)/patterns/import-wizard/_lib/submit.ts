/**
 * Konfirmasi dan submit impor (pure logic, tanpa UI) — story 014-03.
 *
 * Policy baris gagal (OQ#2): `skip` (default) → baris error dilewati, `onComplete`
 * hanya menerima baris valid. `fail` → submit ditolak selama masih ada baris error.
 */

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
      reason: `Masih ada ${invalidCount} baris error. Perbaiki di langkah validasi atau pilih "Dilewati".`,
    };
  }
  if (validCount === 0) {
    return {
      valid: 0,
      failedRows: invalidCount,
      skipped: policy === 'skip' ? invalidCount : 0,
      canSubmit: false,
      reason: 'Tidak ada baris valid untuk diimpor.',
    };
  }
  return {
    valid: validCount,
    failedRows: invalidCount,
    skipped: policy === 'skip' ? invalidCount : 0,
    canSubmit: true,
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
  if (!plan.canSubmit) return { ok: false, reason: plan.reason ?? 'Submit ditolak.' };

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

/** Label tombol submit: "Impor N baris" (N = baris valid). */
export function submitLabel(plan: SubmitPlan): string {
  return `Impor ${plan.valid} baris`;
}
