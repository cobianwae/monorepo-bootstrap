/**
 * State wizard impor (pure logic, tanpa UI) — story 014-02.
 *
 * Satu store menyimpan `source → parsed → mapping`. Mundur tidak menghilangkan
 * state (FR-005). Ganti sumber (file/tempel) me-reset hasil parse, tetapi
 * mapping dipertahankan untuk header yang sama. Gate Lanjut dihitung di sini
 * agar UI dan test memakai aturan yang sama.
 */

import { suggestMapping } from './mapping';
import type { CsvParseResult, TargetField } from './types';

export const TOTAL_STEPS = 4;
/** Langkah yang fungsional di story 014-02 (1 Upload, 2 Mapping). */
export const MAX_FUNCTIONAL_STEP = 2;

/** Mapping: header CSV → key field target; `null` = Abaikan. */
export type Mapping = Record<string, string | null>;

export type WizardSource = { kind: 'file'; file: File } | { kind: 'paste'; text: string };

export interface WizardState {
  step: number;
  source: WizardSource | null;
  parsed: CsvParseResult | null;
  mapping: Mapping;
  /** Header yang mappingnya berasal dari saran dan belum diubah pengguna. */
  suggested: string[];
}

export interface GateResult {
  ok: boolean;
  reason?: string;
}

export function initialWizardState(): WizardState {
  return { step: 1, source: null, parsed: null, mapping: {}, suggested: [] };
}

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/** Field wajib yang belum punya kolom CSV terpetakan. */
export function missingRequired(mapping: Mapping, fields: TargetField[]): TargetField[] {
  const used = new Set(Object.values(mapping));
  return fields.filter((field) => field.required && !used.has(field.key));
}

/**
 * Gabungkan mapping lama dan saran baru untuk daftar header.
 * - Header yang sudah ada di mapping lama: pertahankan nilainya (termasuk Abaikan).
 * - Header baru: pakai saran bila target belum dipakai; selain itu Abaikan.
 */
export function mergeMapping(
  headers: string[],
  previous: Mapping,
  fields: TargetField[]
): { mapping: Mapping; suggested: string[] } {
  const mapping: Mapping = {};
  const suggested: string[] = [];
  const used = new Set<string>();

  for (const header of headers) {
    if (hasOwn(previous, header)) {
      const kept = previous[header] ?? null;
      mapping[header] = kept;
      if (kept) used.add(kept);
    }
  }

  const proposal = suggestMapping(headers, fields);
  for (const header of headers) {
    if (hasOwn(mapping, header)) continue;
    const key = proposal[header] ?? null;
    if (key && !used.has(key)) {
      mapping[header] = key;
      used.add(key);
      suggested.push(header);
    } else {
      mapping[header] = null;
    }
  }

  return { mapping, suggested };
}

/** Pilih sumber baru: reset parse, sisakan step dan mapping untuk dipakai ulang. */
export function setSource(state: WizardState, source: WizardSource): WizardState {
  return { ...state, source, parsed: null };
}

/** Terapkan hasil parse; mapping dihitung ulang dengan mempertahankan header yang cocok. */
export function applyParsed(
  state: WizardState,
  parsed: CsvParseResult,
  fields: TargetField[]
): WizardState {
  if (parsed.error || parsed.headers.length === 0) {
    return { ...state, parsed, mapping: {}, suggested: [] };
  }
  const { mapping, suggested } = mergeMapping(parsed.headers, state.mapping, fields);
  return { ...state, parsed, mapping, suggested };
}

export interface SetTargetResult {
  state: WizardState;
  error?: string;
}

/**
 * Ubah target satu kolom. Target non-Abaikan yang sudah dipakai kolom lain ditolak
 * (state tidak berubah) dengan pesan Bahasa Indonesia.
 */
export function setTarget(
  state: WizardState,
  header: string,
  key: string | null,
  fields: TargetField[]
): SetTargetResult {
  if (key !== null) {
    const other = Object.keys(state.mapping).find(
      (h) => h !== header && state.mapping[h] === key
    );
    if (other !== undefined) {
      const label = fields.find((f) => f.key === key)?.label ?? key;
      return {
        state,
        error: `Target "${label}" sudah dipakai kolom "${other}". Pilih target lain atau Abaikan.`,
      };
    }
  }
  return {
    state: {
      ...state,
      mapping: { ...state.mapping, [header]: key },
      suggested: state.suggested.filter((h) => h !== header),
    },
  };
}

/** Apakah langkah saat ini boleh dilewati ke langkah berikutnya. */
export function canContinue(state: WizardState, fields: TargetField[]): GateResult {
  if (state.step === 1) {
    if (!state.parsed) return { ok: false, reason: 'Pilih berkas atau tempel isi CSV dulu.' };
    if (state.parsed.error) return { ok: false, reason: state.parsed.error };
    if (state.parsed.rowCount === 0) return { ok: false, reason: 'File tidak memiliki baris data.' };
    return { ok: true };
  }
  if (state.step === 2) {
    const missing = missingRequired(state.mapping, fields);
    if (missing.length > 0) {
      return {
        ok: false,
        reason: `Wajib belum terpetakan: ${missing.map((f) => f.label).join(', ')}.`,
      };
    }
    return { ok: true };
  }
  return { ok: false, reason: 'Langkah ini belum tersedia.' };
}

/**
 * Pindah langkah. Mundur (atau tetap) selalu boleh dan tidak menghapus state.
 * Maju hanya satu langkah dan hanya bila gate langkah saat ini lolos.
 */
export function goToStep(state: WizardState, target: number, fields: TargetField[]): WizardState {
  if (target < 1 || target > MAX_FUNCTIONAL_STEP) return state;
  if (target <= state.step) return { ...state, step: target };
  if (target === state.step + 1 && canContinue(state, fields).ok) {
    return { ...state, step: target };
  }
  return state;
}
