#!/usr/bin/env node
/**
 * check-status-log.mjs — kepatuhan CR-007.
 *
 * Gagal bila ada artefak berstatus `done` di docs/BACKLOG.md
 * atau docs/BACKLOG-ARCHIVE.md yang tidak memiliki baris di
 * docs/STATUS-LOG.md. Node murni, tanpa dependency.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const backlog = [
  readFileSync(join(root, 'docs', 'BACKLOG.md'), 'utf8'),
  readFileSync(join(root, 'docs', 'BACKLOG-ARCHIVE.md'), 'utf8'),
].join('\n');
const log = readFileSync(join(root, 'docs', 'STATUS-LOG.md'), 'utf8');

const doneIds = [];
for (const line of backlog.split('\n')) {
  const cells = line.split('|').map((c) => c.trim());
  // Baris tabel: ['', ID, judul, ..., 'done', file, '']
  const id = cells[1];
  if (!id || id === 'ID' || id === 'Artefak') continue;
  if (!/^CR-\d{3}$|^\d{3}-\d{2}$/.test(id)) continue;
  if (cells.includes('done')) doneIds.push(id);
}

const missing = doneIds.filter((id) => !log.includes(id));
if (missing.length > 0) {
  console.error(
    `FAIL: ${missing.length} artefak done tanpa baris di docs/STATUS-LOG.md: ${missing.join(', ')}`
  );
  console.error('Format log: `YYYY-MM-DD — ringkasan — referensi` (append-only).');
  process.exit(1);
}

console.log(`OK: ${doneIds.length} artefak done terverifikasi di docs/STATUS-LOG.md`);
