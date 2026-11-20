# 010 — Org Chart Editor

Status: approved
Owner: —
Tanggal: 2026-11-20
Sumber: keluhan UX terhadap PRD 003 v1 read-only (node kepotong, tidak jelas, tidak bisa tambah/pindah node)

## Problem

`OrgChart` v1 (PRD 003, `S-005.28`) read-only: visualisasi rapi untuk 40 orang tapi gagal sebagai alat kerja struktur organisasi.

Bukti/konsekuensi:

- Node fixed `200×72` + `truncate` (`packages/ui/.../org-chart.tsx`) memotong nama/jabatan/badge panjang tanpa tooltip, wrap, atau panel detail — informasi hilang.
- Tidak ada cara tambah/pindah/hapus node dari kanvas; semua perubahan harus lewat kode/data. User yang berharap org chart "proper" (tambah anak, drag pindah atasan) mentok.
- Navigasi pohon besar tanpa minimap/fit-view/detail inspector membuat user nyasar — keluhan "gak jelas".
- Konsumen akhirnya kembali ke chart library umum di luar token → inkonsistensi DS, a11y, dan dark mode terulang (masalah yang sama dengan yang diselesaikan PRD 005 untuk flow editor).

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Struktur bisa diedit dari kanvas tanpa keluar DS | Scenario tambah/rename/pindah/hapus node end-to-end | Alur lengkap teramati di showcase, tercover test |
| Informasi tidak kepotong lagi | Node panjang tetap terbaca penuh via tooltip + inspector | Audit konten panjang (40+ karakter) lolos tanpa ellipsis buta |
| Pohon besar tetap jelas | Navigasi 100+ node dengan collapse + minimap + fit-view | Temu node target < 30 detik di scenario; tanpa layout jank |
| Satu stack canvas dengan flow editor | Tidak ada dependency graph kedua | Hanya `@xyflow/react` yang sudah disetujui prinsip di PRD 005 |

## Non-goals

- Execution engine / runner workflow — ranah PRD 005, tidak masuk sini.
- Mind map / konektor bebas/kurva — jalur RM-07, dievaluasi setelah RM-06/RM-09.
- Multi-root campuran ad-hoc — v1 tetap satu root (kompatibel PRD 003); multi-root ditunda.
- Export gambar/PDF dari diagram.
- Kolaborasi realtime (multi-kursor, CRDT).
- Persistensi graph — state dikontrol konsumen via callback.
- Menggantikan `tree-view` atau `OrgChart` v1 — ketiganya hidup berdampingan (diagram read-only vs editor vs list).

## User & Use Case

Persona:

1. **Developer konsumen DS** — memasang halaman struktur dari data HR (`id`/`parentId`); butuh editor tanpa setup chart library sendiri.
2. **HR admin / manajer** — menyusun ulang tim: tambah bawahan, pindahkan orang ke atasan baru, ubah jabatan; butuh konfirmasi aman dan undo.

JTBD:

- "When struktur tim berubah, I want tambah/pindahkan node langsung di diagram, so I can update organisasi tanpa edit JSON."
- "When nama/jabatan panjang, I want melihat info penuh tanpa kepotong, so I can paham siapa membawahi siapa."
- "When pohon besar, I want mencari orang dan langsung diantar ke posisinya, so I can paham konteks pelaporannya."

Skenario utama:

1. Tambah bawahan "QA Engineer" di bawah "Engineering Lead" via tombol `+` di node → node muncul, edge tersambung, undo mengembalikan.
2. Drag "Designer" dari "Product" ke "Engineering" → parent berubah, siklus ditolak (tidak bisa jadi bawahan diri sendiri).
3. Klik node dengan nama panjang → inspector (sheet) menampilkan nama/jabatan/departemen penuh + form edit; simpan → node terupdate live.
4. Cari "Sari" → hasil highlight + ancestor auto-expand + fit-view ke node; live region mengumumkan "3 hasil".

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Hierarki dirender dari flat `id`/`parentId` atau nested, satu root; validasi reuse PRD 003 (duplikat, parent hilang, siklus, multi-root) dengan pesan + id pelanggar. | must | Flat dan nested render sama; data invalid ditolak dengan pesan jelas (test). |
| FR-002 | Node tidak memotong informasi: ellipsis hanya visual + `title`/tooltip penuh + inspector menampilkan semua field penuh. | must | String 40+ karakter terbaca penuh via tooltip/inspector di light & dark (audit). |
| FR-003 | Tambah node (child/sibling) via aksi node (+), toolbar, atau context-menu; id baru unik, posisi otomatis di bawah parent. | must | Tambah child/sibling dari scenario muncul di kanvas + state `onChange` terpanggil (test). |
| FR-004 | Pindah node (reparent) via drag antar node dan via dialog/move keyboard; siklus dan drop ke diri/descendant ditolak dengan feedback visual. | must | Drag valid mengubah `parentId`; drop siklus ditolak + pesan; operasi keyboard non-mouse tersedia (test). |
| FR-005 | Hapus node via keyboard Delete + context-menu dengan konfirmasi; hapus parent menawarkan pindah anak (reparent ke grandparent) atau hapus subtree; root tidak bisa dihapus. | must | Hapus + konfirmasi + undo mengembalikan subtree persis (test). |
| FR-006 | Edit properti node (title, subtitle, badge, avatar, accent) via inspector sheet; validasi nama tak boleh kosong. | must | Ubah di inspector → label node live update; validasi kosong ditolak (test). |
| FR-007 | Kontrak state deklaratif: `data` + `onChange(next)` (controlled) atau uncontrolled internal; tanpa persistensi internal. | must | Story demo mengelola state di luar komponen tanpa API tambahan. |
| FR-008 | Layout hierarki otomatis rapi (reuse tidy-tree PRD 003 atau dagre — diputuskan di gate 2), orientasi top-down/left-right, fit-view + minimap + controls zoom. | must | Toggle orientasi + fit-view + minimap sinkron di showcase tanpa konektor rusak. |
| FR-009 | Collapse/expand per node (reuse perilaku PRD 003) tetap bekerja dalam mode edit. | must | Collapse menyembunyikan subtree + konektor; state controlled/uncontrolled sama bekerja. |
| FR-010 | Pencarian/penyorotan: `highlightedIds` + auto-expand path (reuse `getAncestors`) + live region jumlah hasil milik konsumen. | should | Query menyorot target + ancestor auto-expand + pengumuman live region. |
| FR-011 | Pan/zoom batas wajar + controls keyboard; scroll halaman tidak terganggu. | must | Zoom/pan via tombol + keyboard berfungsi; wheel polos tidak mencegat scroll. |
| FR-012 | A11y: semua operasi inti (tambah/pindah/hapus/edit/collapse/search) bisa tanpa mouse; representasi pohon alternatif untuk SR; fokus jelas; `prefers-reduced-motion` dihormati. | must | Audit keyboard + SR lolos; tidak ada aksi pointer-only tanpa jalur alternatif. |
| FR-013 | State matrix: loading skeleton canvas, empty (CTA tambah root/node pertama), error invalid + error eksternal dengan retry. | must | Tiga state teramati di showcase. |
| FR-014 | Token-first: node/edge/minimap/controls hanya token semantik; lolos kontras light & dark. | must | Audit kontras light & dark lolos tanpa hex literal. |
| FR-015 | Undo/redo operasi struktural (tambah/hapus/pindah/edit) dengan batas riwayat. | should | Rangkaian aksi + undo berulang mengembalikan state persis (test). |
| FR-016 | Showcase scenario editor end-to-end (browse → tambah → pindah → edit → hapus → undo → search) dalam light & dark. | must | Route scenario tersedia dan lolos smoke build. |
| FR-017 | Auto-layout satu klik untuk merapikan ulang setelah drag bebas (bila drag bebas didukung). | could | Tidak wajib v1 — bila ada, lewat kontrol terpisah. |
| FR-018 | Import CSV/JSON massal. | won't | Didokumentasikan sebagai won't; lewat jalur integrasi HR terpisah. |

## Design Refs

- Screen: baru — diusulkan `S-005.33` Org Chart Editor (`/patterns/org-chart-editor`), didaftarkan resmi di gate 2. Terkait: `S-005.28` Org Chart (read-only), `S-005.29` Flow Editor.
- Komponen terkait: `data-display/org-chart.tsx` (normalisasi + validasi + tidy-tree, reuse), `overlay/sheet.tsx` (inspector), `navigation/context-menu.tsx`, `base/tooltip.tsx`, `form/*` (form inspector), `feedback/empty-state.tsx`, `base/skeleton.tsx`.
- Dokumen design: `docs/design/org-chart-editor.md` dibuat saat gate 2 (mapping xyflow ↔ token, anatomi node editable, aturan reparent, state matrix, flow, wireframe).
- Analisis awal: PRD 003 (v1 read-only), PRD 005 (pola canvas xyflow + inspector + undo).

## Constraints & Dependencies

- Teknis: reuse **`@xyflow/react` 13.0.2** (MIT) — prinsip sudah disetujui user di PRD 005 OQ#1; tinggal formalisasi install di `packages/ui` (butuh approval eksplisit karena tambah dependency, sesuai `CONVENTIONS.md`). Default CSS xyflow tidak dipakai mentah; dipetakan ke token.
- Layout: putuskan di gate 2 — reuse tidy-tree PRD 003 (tanpa dep baru) vs `dagre` (dep tambahan + approval sendiri). Rekomendasi awal: reuse tidy-tree agar tanpa dep baru.
- Kategori folder: putuskan di gate 2 — `components/canvas/` (mengikuti PRD 005 OQ#4) vs `data-display/`; rekomendasi: `canvas/` agar satu stack dengan flow editor.
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA dengan catatan canvas (FR-012), light/dark parity, test Vitest + Testing Library, alur gate AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Reuse `@xyflow/react` 13.0.2 yang sudah disetujui prinsip di PRD 005 — setuju diformalisasi install untuk editor ini (satu stack canvas, tanpa lib kedua)? | open — butuh approval eksplisit user |
| 2 | Layout: reuse tidy-tree PRD 003 vs tambah `dagre`? | open — diusulkan reuse tidy-tree, diputuskan di gate 2 |
| 3 | Drag node: reparent langsung vs drag bebas + tombol auto-layout? | open — usulan: reparent langsung (hierarki selalu rapi), diputuskan di gate 2 |
| 4 | Undo/redo masuk v1 atau story terakhir yang boleh dipotong (seperti PRD 005 FR-008)? | open — usulan: masuk v1 sebagai story terakhir yang boleh dipotong |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-20 | Draft awal dari keluhan UX PRD 003 v1; pilihan terbaik reuse `@xyflow/react` (sudah disetujui prinsip di PRD 005) |
| 2026-11-20 | **Approved (gate 1)** — OQ#1–#4 disepakati sebagai risiko gate 2; reuse xyflow + tidy-tree + reparent langsung sebagai usulan awal |
