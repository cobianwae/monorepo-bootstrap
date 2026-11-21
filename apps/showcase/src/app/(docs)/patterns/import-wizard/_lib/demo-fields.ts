import type { TargetField } from './types';

/** Field target contoh untuk showcase (entitas: anggota). */
export const DEMO_FIELDS: TargetField[] = [
  { key: 'name', label: 'Nama lengkap', required: true, type: 'string', example: 'Budi Santoso' },
  { key: 'email', label: 'Email', required: true, type: 'email', example: 'budi@contoh.id', unique: true },
  { key: 'dob', label: 'Tanggal lahir', required: false, type: 'date', example: '1990-01-01' },
  { key: 'phone', label: 'Telepon', required: false, type: 'string', example: '081234567890' },
];

export const DEMO_TEMPLATE_NAME = 'template-anggota.csv';
