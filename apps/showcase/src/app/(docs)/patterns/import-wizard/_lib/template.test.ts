import { describe, expect, it } from 'vitest';
import { toTemplateCsv } from './template';
import type { TargetField } from './types';

const FIELDS: TargetField[] = [
  { key: 'name', label: 'Nama', required: true, type: 'string', example: 'Budi' },
  { key: 'email', label: 'Email', required: true, type: 'email' },
  { key: 'dob', label: 'Tgl Lahir', required: false, type: 'date' },
];

describe('toTemplateCsv', () => {
  it('AC-05 menghasilkan header key + 1 baris contoh', () => {
    const csv = toTemplateCsv(FIELDS);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('name,email,dob');
    expect(lines[1]).toBe('Budi,nama@contoh.id,1990-01-01');
    expect(lines.length).toBe(3); // header + contoh + trailing newline → ['header','contoh','']
  });

  it('contoh pakai generator per tipe bila example tidak ada', () => {
    const fields: TargetField[] = [
      { key: 'name', label: 'Nama', required: true, type: 'string' },
      { key: 'count', label: 'Jumlah', required: false, type: 'number' },
      { key: 'email', label: 'Email', required: true, type: 'email' },
    ];
    const csv = toTemplateCsv(fields);

    expect(csv).toContain('name,count,email');
    expect(csv).toContain('contoh,0,nama@contoh.id');
  });

  it('nilai contoh dengan koma di-escape dengan benar', () => {
    const fields: TargetField[] = [
      { key: 'note', label: 'Catatan', required: false, type: 'string', example: 'ini, "contoh"' },
    ];
    const csv = toTemplateCsv(fields);

    expect(csv.split('\n')[1]).toBe('"ini, ""contoh"""');
  });
});
