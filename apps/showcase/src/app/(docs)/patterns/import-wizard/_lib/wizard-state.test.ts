import { describe, it, expect } from 'vitest';
import { DEMO_FIELDS } from './demo-fields';
import { parseCsv } from './parse-csv';
import {
  applyParsed,
  canContinue,
  goToStep,
  initialWizardState,
  mergeMapping,
  missingRequired,
  setSource,
  setTarget,
  type WizardState,
} from './wizard-state';

const CSV_NAMA = 'Nama Lengkap,Email,Tgl Lahir\nBudi,budi@contoh.id,1990-01-01\n';
const CSV_LAIN = 'Nama Lengkap,E-mail\nSari,sari@contoh.id\n';

async function parsedState(csv: string): Promise<WizardState> {
  const parsed = await parseCsv(csv);
  const base = setSource(initialWizardState(), { kind: 'paste', text: csv });
  return applyParsed(base, parsed, DEMO_FIELDS);
}

describe('mergeMapping', () => {
  it('menyarankan kolom yang cocok dan tidak menggandakan target', () => {
    const { mapping, suggested } = mergeMapping(
      ['Nama Lengkap', 'nama', 'Email'],
      {},
      DEMO_FIELDS
    );
    expect(mapping['Nama Lengkap']).toBe('name');
    expect(mapping['nama']).toBeNull();
    expect(mapping['Email']).toBe('email');
    expect(suggested).toEqual(['Nama Lengkap', 'Email']);
  });

  it('mempertahankan mapping lama untuk header yang sama', () => {
    const { mapping } = mergeMapping(
      ['Nama Lengkap', 'Email'],
      { 'Nama Lengkap': null, Email: 'email' },
      DEMO_FIELDS
    );
    expect(mapping['Nama Lengkap']).toBeNull();
    expect(mapping.Email).toBe('email');
  });
});

describe('setTarget', () => {
  it('menolak target yang sudah dipakai kolom lain', async () => {
    const state = await parsedState(CSV_NAMA);
    const result = setTarget(state, 'Tgl Lahir', 'name', DEMO_FIELDS);
    expect(result.error).toContain('sudah dipakai');
    expect(result.state.mapping).toEqual(state.mapping);
  });

  it('membolehkan Abaikan berulang dan menghapus status saran', async () => {
    const state = await parsedState(CSV_NAMA);
    const first = setTarget(state, 'Tgl Lahir', null, DEMO_FIELDS);
    const second = setTarget(first.state, 'Email', null, DEMO_FIELDS);
    expect(second.error).toBeUndefined();
    const changed = setTarget(second.state, 'Nama Lengkap', null, DEMO_FIELDS);
    expect(changed.state.suggested).not.toContain('Nama Lengkap');
  });
});

describe('gate langkah', () => {
  it('gate mapping (langkah 2) terkunci sampai semua wajib terpetakan', async () => {
    const onMapping = goToStep(await parsedState(CSV_NAMA), 2, DEMO_FIELDS);
    expect(canContinue(onMapping, DEMO_FIELDS).ok).toBe(true);
    const withoutEmail = setTarget(onMapping, 'Email', null, DEMO_FIELDS).state;
    expect(missingRequired(withoutEmail.mapping, DEMO_FIELDS).map((f) => f.key)).toEqual(['email']);
    const gate = canContinue(withoutEmail, DEMO_FIELDS);
    expect(gate.ok).toBe(false);
    expect(gate.reason).toContain('Email');
  });

  it('lanjut ke mapping hanya saat ada baris data dan tanpa error', async () => {
    const empty = await parsedState('Nama Lengkap,Email\n');
    expect(canContinue(empty, DEMO_FIELDS).ok).toBe(false);
    const ok = await parsedState(CSV_NAMA);
    expect(canContinue(ok, DEMO_FIELDS).ok).toBe(true);
  });

  it('goToStep tidak maju bila gate lolos tapi langkah belum tersedia', async () => {
    const state = await parsedState(CSV_NAMA);
    expect(goToStep(state, 2, DEMO_FIELDS).step).toBe(2);
    expect(goToStep(state, 3, DEMO_FIELDS).step).toBe(1);
  });

  it('goToStep tidak maju dari mapping bila wajib belum lengkap', async () => {
    const onMapping = goToStep(await parsedState(CSV_NAMA), 2, DEMO_FIELDS);
    const blocked = setTarget(onMapping, 'Email', null, DEMO_FIELDS).state;
    expect(goToStep(blocked, 1, DEMO_FIELDS).step).toBe(1);
    expect(goToStep(blocked, 2, DEMO_FIELDS).step).toBe(2);
  });
});

describe('mundur tidak menghilangkan state', () => {
  it('file dan mapping tetap utuh saat kembali ke langkah 1', async () => {
    const state = await parsedState(CSV_NAMA);
    const onMapping = goToStep(state, 2, DEMO_FIELDS);
    const back = goToStep(onMapping, 1, DEMO_FIELDS);
    expect(back.step).toBe(1);
    expect(back.parsed).toBe(state.parsed);
    expect(back.mapping).toEqual(state.mapping);
  });

  it('file baru me-reset parse tetapi mempertahankan mapping header yang cocok', async () => {
    const state = await parsedState(CSV_NAMA);
    const mapped = setTarget(state, 'Email', null, DEMO_FIELDS).state;
    const reset = setSource(mapped, { kind: 'paste', text: CSV_LAIN });
    expect(reset.parsed).toBeNull();
    const next = applyParsed(reset, await parseCsv(CSV_LAIN), DEMO_FIELDS);
    expect(next.mapping['Nama Lengkap']).toBe('name');
    expect(next.mapping['E-mail']).toBe('email');
  });

  it('file error tidak menyisakan mapping', async () => {
    const state = await parsedState(CSV_NAMA);
    const failed = applyParsed(state, { headers: [], rows: [], rowCount: 0, warnings: [], error: 'Gagal membaca berkas CSV' }, DEMO_FIELDS);
    expect(failed.mapping).toEqual({});
    expect(canContinue(failed, DEMO_FIELDS).ok).toBe(false);
  });
});
