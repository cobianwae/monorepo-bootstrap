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
| 010 | Org chart editor — editable v2 reuse xyflow (revisi PRD 003) | approved | `docs/prd/010-org-chart-editor.md` |

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

| ID | Judul | Status | File |
|---|---|---|---|
| 002-01 | Shell tiga zona + navigasi tree-breadcrumb | done | `docs/stories/002-01-shell-navigation.md` |
| 002-02 | Konten list/grid + seleksi massal + context menu | done | `docs/stories/002-02-content-selection.md` |
| 002-03 | Preview media + quota + upload compose | done | `docs/stories/002-03-preview-quota-upload.md` |
| 002-04 | State matrix penuh + rename/kelola + audit keyboard | done | `docs/stories/002-04-states-manage-a11y.md` |
| 003-01 | Fondasi OrgChart: normalisasi + layout tidy-tree + konektor | done | `docs/stories/003-01-foundation-normalize-layout.md` |
| 003-02 | Node kaya + aksen + expand/collapse + select | done | `docs/stories/003-02-rich-node-expand-select.md` |
| 003-03 | A11y penuh: role tree + navigasi keyboard | done | `docs/stories/003-03-a11y-tree-keyboard.md` |
| 003-04 | Pan/zoom kanvas + kontrol zoom + orientasi | done | `docs/stories/003-04-pan-zoom-orientation.md` |
| 003-05 | State matrix + highlight pencarian + scenario showcase | done | `docs/stories/003-05-states-search-showcase.md` |
| 010-01 | Org editor fondasi canvas xyflow + layout + node token | done | `docs/stories/010-01-canvas-foundation.md` |
| 010-02 | Org editor CRUD inspector tambah/edit/hapus anti-truncate | done | `docs/stories/010-02-crud-inspector.md` |
| 010-03 | Org editor reparent drag + move dialog + undo/redo | done | `docs/stories/010-03-reparent-undo.md` |
| 010-04 | Org editor search + states + showcase + a11y penuh | done | `docs/stories/010-04-search-states-showcase.md` |
| 004-01 | EventCalendar fondasi + month view + navigasi | done | `docs/stories/004-01-foundation-month-navigation.md` |
| 004-02 | Time grid week/day + all-day + jam kerja + slot booking | todo | `docs/stories/004-02-week-day-slot-allday.md` |
| 004-03 | Multi-hari + konflik overlap + detail event + DnD | todo | `docs/stories/004-03-multiday-overlap-detail-dnd.md` |
| 004-04 | Locale + agenda + state matrix + showcase final + a11y | todo | `docs/stories/004-04-locale-agenda-states-showcase.md` |

## Change Requests

| ID | Judul | Status | File |
|---|---|---|---|
| CR-008 | Perapian dokumen PRD 001 & design upload-queue | approved | `docs/cr/cr-008-prd001-cleanup.md` |

## Catatan

- Jangan memuat `BACKLOG-ARCHIVE.md` secara penuh saat sesi; grep hanya baris aktif.
- Setiap story/CR yang selesai di-tick di file, lalu status di tabel ini diperbarui.
- Jika pekerjaan keluar dari scope story/CR, berhenti dan minta konfirmasi.
