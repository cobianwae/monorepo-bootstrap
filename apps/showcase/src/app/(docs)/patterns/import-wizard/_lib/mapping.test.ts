import { describe, expect, it } from 'vitest';
import { DEMO_FIELDS } from './demo-fields';
import { suggestMapping } from './mapping';
import type { TargetField } from './types';

const FIELDS: TargetField[] = [
  { key: 'name', label: 'Nama Lengkap', required: true, type: 'string' },
  { key: 'email', label: 'Email', required: true, type: 'email' },
  { key: 'dob', label: 'Tanggal Lahir', required: false, type: 'date' },
  { key: 'phone', label: 'Telepon', required: false, type: 'string' },
  { key: 'memberId', label: 'ID Anggota', required: true, type: 'string' },
];

describe('suggestMapping', () => {
  it('AC-03 memetakan name/email/dob/phone dari header Indonesia', () => {
    const mapping = suggestMapping(
      ['Nama Lengkap', 'Email', 'Tgl Lahir', 'Telepon'],
      FIELDS
    );

    expect(mapping['Nama Lengkap']).toBe('name');
    expect(mapping['Email']).toBe('email');
    expect(mapping['Tgl Lahir']).toBe('dob');
    expect(mapping['Telepon']).toBe('phone');
  });

  it('AC-03 field wajib belum terpetakan = null (wajib hilang terdeteksi)', () => {
    const mapping = suggestMapping(['Nama Lengkap', 'Email'], FIELDS);

    expect(Object.values(mapping)).not.toContain('memberId');
    expect(mapping['Nama Lengkap']).toBe('name');
    expect(mapping['Email']).toBe('email');
  });

  it('AC-03 skor <70 menjadi Abaikan (null)', () => {
    const mapping = suggestMapping(['Kode Acak', 'Lainnya Lain'], FIELDS);

    expect(mapping['Kode Acak']).toBeNull();
    expect(mapping['Lainnya Lain']).toBeNull();
  });

  it('sinonim Indonesia (e-mail, tgl lahir, telepon)', () => {
    const mapping = suggestMapping(['e-mail', 'tgl lahir', 'telepon'], FIELDS);

    expect(mapping['e-mail']).toBe('email');
    expect(mapping['tgl lahir']).toBe('dob');
    expect(mapping['telepon']).toBe('phone');
  });

  it('label exact match (Nama Lengkap → name) menang atas sinonim', () => {
    const mapping = suggestMapping(['Nama Lengkap'], FIELDS);

    expect(mapping['Nama Lengkap']).toBe('name');
  });
});

describe('suggestMapping dengan field demo berlabel English (CR-079)', () => {
  it('memetakan header English', () => {
    expect(suggestMapping(['Full name', 'Email', 'Date of birth', 'Phone'], DEMO_FIELDS)).toEqual({
      'Full name': 'name',
      Email: 'email',
      'Date of birth': 'dob',
      Phone: 'phone',
    });
  });

  it('tetap memetakan header Indonesia, termasuk surel', () => {
    expect(suggestMapping(['Nama Lengkap', 'Surel', 'Tanggal Lahir', 'Telepon'], DEMO_FIELDS)).toEqual({
      'Nama Lengkap': 'name',
      Surel: 'email',
      'Tanggal Lahir': 'dob',
      Telepon: 'phone',
    });
  });

  it('mempertahankan pencocokan substring Indonesia', () => {
    expect(suggestMapping(['Telepon Rumah'], DEMO_FIELDS)['Telepon Rumah']).toBe('phone');
    expect(suggestMapping(['Lengkap'], DEMO_FIELDS)['Lengkap']).toBe('name');
    expect(suggestMapping(['Lahir'], DEMO_FIELDS)['Lahir']).toBe('dob');
  });
});
