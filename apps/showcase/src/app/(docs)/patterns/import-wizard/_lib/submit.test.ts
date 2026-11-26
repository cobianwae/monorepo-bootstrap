import { describe, it, expect } from 'vitest';
import { DEMO_FIELDS } from './demo-fields';
import { INVALID_TEXT } from './demo-datasets';
import { parseCsv } from './parse-csv';
import { buildValidation } from './validation-view';
import { buildImportResult, planSubmit, submitLabel, summaryBuckets } from './submit';
import type { Mapping } from './wizard-state';

const MAPPING: Mapping = {
  'Full name': 'name',
  Email: 'email',
  'Date of birth': 'dob',
  Phone: 'phone',
};

describe('planSubmit', () => {
  it('policy skip: baris gagal dilewati dan submit tetap bisa', () => {
    const plan = planSubmit(200, 3, 'skip');
    expect(plan).toMatchObject({ valid: 200, failedRows: 3, skipped: 3, canSubmit: true });
    expect(submitLabel(plan)).toBe('Prepare import (200 rows)');
  });

  it('policy fail: submit ditolak selama masih ada error', () => {
    const plan = planSubmit(200, 3, 'fail');
    expect(plan.canSubmit).toBe(false);
    expect(plan.skipped).toBe(0);
    expect(plan.reason).toBe(
      '3 rows with errors. Fix them in the validation step or choose "Skip failed rows".'
    );
  });

  it('submit diblokir: label tidak menjanjikan impor', () => {
    expect(submitLabel(planSubmit(200, 3, 'fail'))).toBe('Fix errors to import');
    expect(submitLabel(planSubmit(0, 2, 'skip'))).toBe('No rows to import');
  });

  it('policy fail tanpa error: submit boleh', () => {
    expect(planSubmit(5, 0, 'fail').canSubmit).toBe(true);
  });

  it('tanpa baris valid: submit ditolak', () => {
    expect(planSubmit(0, 2, 'skip').canSubmit).toBe(false);
  });
});

describe('summaryBuckets', () => {
  it('policy skip: baris error hanya masuk Lewati, tidak dihitung ganda sebagai Gagal', () => {
    const plan = planSubmit(200, 3, 'skip');
    expect(summaryBuckets(plan, 'skip')).toEqual({ valid: 200, skipped: 3, failed: 0 });
  });

  it('policy fail: baris error masuk Gagal dan tidak ada Lewati', () => {
    const plan = planSubmit(200, 3, 'fail');
    expect(summaryBuckets(plan, 'fail')).toEqual({ valid: 200, skipped: 0, failed: 3 });
  });

  it('tanpa baris valid (skip): hitungan tetap satu kelompok per baris', () => {
    const plan = planSubmit(0, 2, 'skip');
    expect(summaryBuckets(plan, 'skip')).toEqual({ valid: 0, skipped: 2, failed: 0 });
    expect(plan.canSubmit).toBe(false);
  });
});

describe('buildImportResult', () => {
  it('policy skip: hanya baris valid ikut, key = field target', async () => {
    const parsed = await parseCsv(INVALID_TEXT);
    const view = buildValidation(parsed.rows, MAPPING, DEMO_FIELDS);
    const built = buildImportResult(parsed.rows, MAPPING, view.rowErrors, 'skip');
    if (!built.ok) throw new Error(built.reason);
    expect(built.result.rows).toHaveLength(200);
    expect(built.result.skipped).toBe(3);
    expect(built.result.failed).toBe(3);
    expect(built.result.rows.some((r) => r.email === 'dup@example.com')).toBe(false);
    expect(Object.keys(built.result.rows[0] ?? {}).sort()).toEqual(['dob', 'email', 'name', 'phone']);
  });

  it('policy fail dengan error tersisa: ditolak', async () => {
    const parsed = await parseCsv(INVALID_TEXT);
    const view = buildValidation(parsed.rows, MAPPING, DEMO_FIELDS);
    const built = buildImportResult(parsed.rows, MAPPING, view.rowErrors, 'fail');
    expect(built.ok).toBe(false);
  });

  it('kolom Abaikan tidak ikut hasil', async () => {
    const parsed = await parseCsv('Nama Lengkap,Email,Catatan\nBudi,budi@contoh.id,xx\n');
    const mapping: Mapping = { 'Nama Lengkap': 'name', Email: 'email', Catatan: null };
    const built = buildImportResult(parsed.rows, mapping, [], 'skip');
    if (!built.ok) throw new Error(built.reason);
    expect(built.result.rows[0]).toEqual({ name: 'Budi', email: 'budi@contoh.id' });
  });
});
