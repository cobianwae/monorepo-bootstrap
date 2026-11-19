# Backlog

Backlog adalah indeks aktif. Detail artefak hidup di file masing-masing.
Item selesai dipindahkan ke `docs/BACKLOG-ARCHIVE.md`.

## Status

| Artefak | Alur |
|---|---|
| PRD | `draft` → `approved` → `shipped` |
| Design | `draft` → `approved` |
| Story | `todo` → `in-progress` → `review` → `done` |
| CR | `draft` → `approved` → `done` |

Hanya user yang boleh menetapkan `approved` dan `done`.

## PRD

| ID | Judul | Status | File |
|---|---|---|---|
| 001 | Upload queue (roadmap RM-01) | approved | `docs/prd/001-upload-queue.md` |

## Stories

| ID | Judul | PRD | Status | File |
|---|---|---|---|---|
| 001-01 | Komponen FileUpload (inti upload queue) | 001 | done | `docs/stories/001-01-upload-queue.md` |
| 001-02 | FileUpload: aksi kolektif, sortable, auto-retry, varian compact | 001 | approved | `docs/stories/001-02-upload-queue-enhancements.md` |

## Change Requests

| ID | Judul | Sumber | Status | File |
|---|---|---|---|---|
| CR-001 | Keyboard access clickable table row | audit | done | `docs/cr/cr-001-table-row-keyboard.md` |
| CR-002 | Touch target di bawah 24px | audit | done | `docs/cr/cr-002-touch-targets.md` |
| CR-003 | `aria-sort` pada header tabel sortable | audit | done | `docs/cr/cr-003-table-aria-sort.md` |
| CR-004 | Error state dan CTA empty state DataTable | audit | done | `docs/cr/cr-004-data-table-error-state.md` |
| CR-005 | Indikator fokus NavbarLink dan kontras highlight/accent | audit | done | `docs/cr/cr-005-navbar-focus-contrast.md` |
| CR-006 | Eliminasi palette literal | audit | done | `docs/cr/cr-006-semantic-palette.md` |

## Catatan

- Jangan memuat `BACKLOG-ARCHIVE.md` secara penuh saat sesi; grep hanya baris aktif.
- Setiap story/CR yang selesai di-tick di file, lalu status di tabel ini diperbarui.
- Jika pekerjaan keluar dari scope story/CR, berhenti dan minta konfirmasi.
