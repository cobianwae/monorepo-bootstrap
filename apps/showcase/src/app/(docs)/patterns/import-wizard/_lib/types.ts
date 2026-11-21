/**
 * Kontrak util impor (pure logic, tanpa UI).
 * Kontrak ini meniru `docs/design/import-wizard.md` §2 (API Publik).
 */

export type FieldType = 'string' | 'number' | 'date' | 'email';

export interface TargetField {
  key: string; // mis. 'name'
  label: string; // mis. 'Nama lengkap'
  required: boolean;
  type: FieldType;
  pattern?: RegExp; // FR-006 pola
  unique?: boolean; // FR-003 unik dalam file
  example?: string; // FR-007 baris contoh
  validate?: (value: string, row: Record<string, string>) => string | null; // custom → pesan ID
}

export interface ImportResult {
  rows: Record<string, string>[]; // hanya baris valid (FR-004)
  skipped: number;
  failed: number;
}

export interface ImportWizardConfig {
  fields: TargetField[]; // deklaratif (FR-006)
  onComplete: (result: ImportResult) => void; // FR-004
  maxBytes?: number; // default 5_000_000 (OQ#1)
  maxRows?: number; // default 10_000 (OQ#1)
  delimiter?: string; // override; default auto-detect papaparse
  onError?: (message: string) => void;
  templateName?: string; // default 'template.csv' (FR-007)
}

export interface RowError {
  row: number; // 1-based
  column: string; // field key
  message: string; // Bahasa Indonesia
}

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
  warnings: string[];
  error?: string; // mis. 'v1 CSV saja' (FR-010)
}

export interface ParseCsvOptions {
  delimiter?: ',' | ';' | '\t' | '|' | 'auto';
  maxBytes?: number;
  maxRows?: number;
  onWarning?: (message: string) => void;
}

export const DEFAULT_MAX_BYTES = 5_000_000;
export const DEFAULT_MAX_ROWS = 10_000;
