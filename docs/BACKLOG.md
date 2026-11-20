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
| 002 | File manager composed pattern + preview RM-05 (roadmap RM-04) | approved | `docs/prd/002-file-manager.md` |
| 003 | Org chart (roadmap RM-06) | approved | `docs/prd/003-org-chart.md` |
| 004 | Calendar & scheduler (roadmap RM-08) | approved | `docs/prd/004-calendar-scheduler.md` |
| 005 | Flow editor / node canvas (roadmap RM-09) | approved | `docs/prd/005-flow-editor.md` |
| 006 | Rich text editor (roadmap RM-11) | approved | `docs/prd/006-rich-text-editor.md` |

## Specs (lightweight track)

Spec singkat + 1 story untuk komponen tanpa pattern baru; menggantikan PRD penuh.

| RM | Judul | Status | File |
|---|---|---|---|
| RM-02 | Transfer list | approved | `docs/design/spec-transfer-list.md` |
| RM-03 | Cascader & tree select | approved | `docs/design/spec-cascader-tree-select.md` |
| RM-10 | Mention input & emoji picker (compose chat) | approved | `docs/design/spec-mention-emoji.md` |

## Story ID Registry (lightweight track)

| Seri | RM | Artefak | Story |
|---|---|---|---|
| 007 | RM-02 | `docs/design/spec-transfer-list.md` | `007-01` |
| 008 | RM-03 | `docs/design/spec-cascader-tree-select.md` | `008-01`, `008-02` |
| 009 | RM-10 | `docs/design/spec-mention-emoji.md` | `009-01` |

## Stories

Tidak ada story aktif; yang selesai diarsipkan ke `docs/BACKLOG-ARCHIVE.md`.

## Change Requests

| ID | Judul | Status | File |
|---|---|---|---|
| CR-008 | Perapian dokumen PRD 001 & design upload-queue | approved | `docs/cr/cr-008-prd001-cleanup.md` |

## Catatan

- Jangan memuat `BACKLOG-ARCHIVE.md` secara penuh saat sesi; grep hanya baris aktif.
- Setiap story/CR yang selesai di-tick di file, lalu status di tabel ini diperbarui.
- Jika pekerjaan keluar dari scope story/CR, berhenti dan minta konfirmasi.
