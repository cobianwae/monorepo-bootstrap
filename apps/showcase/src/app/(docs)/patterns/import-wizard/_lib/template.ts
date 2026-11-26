/**
 * Template CSV: header target + 1 baris contoh (FR-007).
 * Unduh via Blob_download adalah urusan UI (014-02); util ini hanya
 * menghasilkan isi CSV.
 */

import type { FieldType, TargetField } from './types';

function exampleFor(type: FieldType): string {
  switch (type) {
    case 'number':
      return '0';
    case 'date':
      return '1990-01-01';
    case 'email':
      return 'name@example.com';
    case 'string':
    default:
      return 'example';
  }
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

export function toTemplateCsv(fields: TargetField[]): string {
  const header = fields.map((f) => f.key).join(',');
  const sample = fields
    .map((f) => escapeCsv(f.example ?? exampleFor(f.type)))
    .join(',');
  return `${header}\n${sample}\n`;
}
