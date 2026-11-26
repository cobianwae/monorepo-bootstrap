import type { TargetField } from './types';

/** Field target contoh untuk showcase (entitas: member). */
export const DEMO_FIELDS: TargetField[] = [
  { key: 'name', label: 'Full name', required: true, type: 'string', example: 'Budi Santoso' },
  { key: 'email', label: 'Email', required: true, type: 'email', example: 'budi@example.com', unique: true },
  { key: 'dob', label: 'Date of birth', required: false, type: 'date', example: '1990-01-01' },
  { key: 'phone', label: 'Phone', required: false, type: 'string', example: '081234567890' },
];

export const DEMO_TEMPLATE_NAME = 'members-template.csv';
