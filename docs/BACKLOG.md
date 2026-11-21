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
| 009-01 | Mention + emoji picker untuk chat + showcase | approved | `docs/stories/009-01-mention-emoji.md` |
| 012-01 | Mind map fondasi dua sisi + pill + pan/zoom | done | `docs/stories/012-01-fondasi-dua-sisi-pill-panzoom.md` |
| 012-02 | Mind map tambah inline + hapus M-011 + undo/redo | approved | `docs/stories/012-02-tambah-hapus-undo.md` |
| 012-03 | Mind map keyboard + cari + states + showcase audit | approved | `docs/stories/012-03-keyboard-cari-showcase-audit.md` |
| 013-01 | Diff viewer parser + unified + header + states | approved | `docs/stories/013-01-parser-unified-header-states.md` |
| 013-02 | Diff viewer split + navigasi hunk + slot komentar | approved | `docs/stories/013-02-split-navigasi-komentar.md` |
| 013-03 | Diff viewer showcase + audit kontras + smoke | approved | `docs/stories/013-03-showcase-audit-smoke.md` |
| 014-01 | Import wizard util parse/mapping/validasi + template | done | `docs/stories/014-01-util-parse-mapping-validasi.md` |
| 014-02 | Import wizard shell stepper + upload + mapping | approved | `docs/stories/014-02-shell-upload-mapping.md` |
| 014-03 | Import wizard validasi + konfirmasi + showcase final | approved | `docs/stories/014-03-validasi-konfirmasi-showcase.md` |
| 015-01 | Image cropper fondasi wrapper + aspek + output blob | approved | `docs/stories/015-01-fondasi-wrapper-output.md` |
| 015-02 | Image cropper kontrol + pratinjau + keyboard + states | approved | `docs/stories/015-02-kontrol-pratinjau-keyboard-states.md` |
| 015-03 | Image cropper showcase avatar + cover + audit + smoke | approved | `docs/stories/015-03-showcase-audit-smoke.md` |
| 017-01 | Product tour fondasi wrapper + navigasi + callback | approved | `docs/stories/017-01-fondasi-wrapper-navigasi-callback.md` |
| 017-02 | Product tour target hilang + keyboard + motion + states | approved | `docs/stories/017-02-target-hilang-keyboard-motion-states.md` |
| 017-03 | Product tour showcase + audit + smoke | approved | `docs/stories/017-03-showcase-audit-smoke.md` |
| 018-01 | Permission matrix fondasi grid + toggle + kunci | done | `docs/stories/018-01-fondasi-grid-toggle-kunci.md` |
| 018-02 | Permission matrix keyboard + banner + states | approved | `docs/stories/018-02-keyboard-banner-states.md` |
| 018-03 | Permission matrix showcase + audit + smoke | approved | `docs/stories/018-03-showcase-audit-smoke.md` |

## Change Requests

| ID | Judul | Status | File |
|---|---|---|---|
| CR-015 | Verifikasi baseline dev (known issue flow-editor.test.tsx) + bersihkan entri stale | approved | `docs/cr/cr-015-baseline-flow-editor-test.md` |

## Catatan

- Nomor PRD 007–009 **sengaja tidak dipakai** — sudah direservasi sebagai ID seri
  story lightweight track (007-01, 008-01/008-02, 009-01, lihat registry di bawah).
  ID artefak bersifat imutabel; lubang penomoran tidak diisi ulang.
- Jangan memuat `BACKLOG-ARCHIVE.md` secara penuh saat sesi; grep hanya baris aktif.
- Setiap story/CR yang selesai di-tick di file, lalu status di tabel ini diperbarui.
- Jika pekerjaan keluar dari scope story/CR, berhenti dan minta konfirmasi.
