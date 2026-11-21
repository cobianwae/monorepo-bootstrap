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
| 010 | Org chart editor — editable v2 reuse xyflow (revisi PRD 003) | approved (legacy, diganti 011) | `docs/prd/010-org-chart-editor.md` |
| 011 | Org Chart Studio — bangun ulang profesional satu fitur (pengganti 003 + 010) | approved (gate 2) | `docs/prd/011-org-chart-studio.md` |
| 012 | Mind map — turunan ringan kanvas org chart (roadmap RM-07) | approved | `docs/prd/012-mind-map.md` |
| 013 | Diff viewer — code review & audit (roadmap RM-12) | approved | `docs/prd/013-diff-viewer.md` |
| 014 | Import wizard CSV — column mapping + validasi (roadmap RM-13) | approved | `docs/prd/014-import-wizard.md` |
| 015 | Image cropper — avatar/cover flow (roadmap RM-14) | approved | `docs/prd/015-image-cropper.md` |
| 016 | Lightbox/gallery — melengkapi preview (roadmap RM-15) | approved | `docs/prd/016-lightbox-gallery.md` |
| 017 | Tour/coach marks — onboarding reusable (roadmap RM-16) | approved | `docs/prd/017-product-tour.md` |
| 018 | Permission/role matrix — grid role × resource (roadmap RM-17) | approved | `docs/prd/018-permission-matrix.md` |
| 019 | Signature pad — persetujuan & consent (roadmap RM-18) | approved | `docs/prd/019-signature-pad.md` |

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
| 004-02 | Time grid week/day + all-day + jam kerja + slot booking | done | `docs/stories/004-02-week-day-slot-allday.md` |
| 004-03 | Multi-hari + konflik overlap + detail event + DnD | done | `docs/stories/004-03-multiday-overlap-detail-dnd.md` |
| 004-04 | Locale + agenda + state matrix + showcase final + a11y | done | `docs/stories/004-04-locale-agenda-states-showcase.md` |
| 011-01 | Studio fondasi kanvas + kartu lega + layout seimbang | done | `docs/stories/011-01-fondasi-kanvas-kartu-layout.md` |
| 011-02 | Studio tambah 1-klik inline-edit + panel detail on-demand | done | `docs/stories/011-02-tambah-inline-panel-detail.md` |
| 011-03 | Studio pindah drag/dialog + hapus + undo/redo | done | `docs/stories/011-03-pindah-hapus-undo.md` |
| 011-04 | Studio cari + keyboard + pohon SR + motion/sentuh | done | `docs/stories/011-04-cari-keyboard-pohon-sr.md` |
| 011-05 | Studio states + showcase + audit kontras + legacy deprecated | done | `docs/stories/011-05-states-showcase-audit-legacy.md` |
| 005-01 | Flow editor fondasi canvas + node custom DS | done | `docs/stories/005-01-canvas-node-foundation.md` |
| 005-02 | Flow editor palette drag + tambah keyboard + snap | done | `docs/stories/005-02-palette-drop-snap.md` |
| 005-03 | Flow editor edge sambung + validasi + label | done | `docs/stories/005-03-edge-validasi-label.md` |
| 005-04 | Flow editor seleksi + inspector on-demand + hapus | approved | `docs/stories/005-04-seleksi-inspector-hapus.md` |
| 005-05 | Flow editor undo/redo + toolbar pola | approved | `docs/stories/005-05-undo-redo-toolbar.md` |
| 005-06 | Flow editor minimap + showcase + audit | approved | `docs/stories/005-06-minimap-showcase-audit.md` |
| 006-01 | RTE fondasi controlled + toolbar inline/blok + undo | done | `docs/stories/006-01-fondasi-toolbar-controlled.md` |
| 006-02 | RTE link M-009 + shortcut + keyboard penuh | approved | `docs/stories/006-02-link-shortcut-keyboard.md` |
| 006-03 | RTE mode + counter + state matrix | approved | `docs/stories/006-03-mode-counter-states.md` |
| 006-04 | RTE gambar M-010 + serializer markdown + slot mention | approved | `docs/stories/006-04-gambar-markdown-mention.md` |
| 006-05 | RTE showcase final + audit kontras + smoke | approved | `docs/stories/006-05-showcase-audit-smoke.md` |
| 007-01 | Transfer list assign role + showcase | approved | `docs/stories/007-01-transfer-list.md` |
| 008-01 | Cascader alamat/kategori + showcase | approved | `docs/stories/008-01-cascader.md` |
| 008-02 | Tree select compose tree-view + showcase | approved | `docs/stories/008-02-tree-select.md` |
| 009-01 | Mention + emoji picker untuk chat + showcase | approved | `docs/stories/009-01-mention-emoji.md` |

## Change Requests

| ID | Judul | Status | File |
|---|---|---|---|
| CR-008 | Perapian dokumen PRD 001 & design upload-queue | done | `docs/cr/cr-008-prd001-cleanup.md` |
| CR-009 | OrgChartEditor layak total (DIHENTIKAN 2026-11-21, diganti 011) | dihentikan | `docs/cr/cr-009-org-chart-editor-layak.md` |
| CR-010 | Org Chart Studio gate-2 follow-up (tutup OQ + perapian approved) | done | `docs/cr/cr-010-org-chart-studio-gate2-followup.md` |
| CR-011 | Sitemap & rujukan docs Rich Text Editor (PRD 006) | done | `docs/cr/cr-011-sitemap-rich-text-editor.md` |
| CR-014 | Org Chart Studio layak-pakai (tambah terlihat + garis + tombol jelas) | done | `docs/cr/cr-014-studio-layak-pakai.md` |

## Catatan

- Nomor PRD 007–009 **sengaja tidak dipakai** — sudah direservasi sebagai ID seri
  story lightweight track (007-01, 008-01/008-02, 009-01, lihat registry di bawah).
  ID artefak bersifat imutabel; lubang penomoran tidak diisi ulang.
- Jangan memuat `BACKLOG-ARCHIVE.md` secara penuh saat sesi; grep hanya baris aktif.
- Setiap story/CR yang selesai di-tick di file, lalu status di tabel ini diperbarui.
- Jika pekerjaan keluar dari scope story/CR, berhenti dan minta konfirmasi.
