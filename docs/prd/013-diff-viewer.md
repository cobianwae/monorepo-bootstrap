# 013 — Diff Viewer

Status: approved
Owner: —
Tanggal: 2026-11-21
Sumber: roadmap RM-12 (`docs/discussions/component-roadmap.md`)

## Problem

Code review, audit log, dan perbandingan revisi dokumen butuh tampilan diff
standar (tambah/hapus per baris). Hari ini tidak ada komponen diff di
`packages/ui` — konsumen merakit sendiri dengan risiko inkonsistensi warna,
nomor baris, dan a11y.

Bukti/konsekuensi:

- Tidak ada komponen diff di `packages/ui`; pola review hanya ada sebagai
  scenario tanpa komponen reusable di belakangnya.
- Warna diff yang dirakit ad-hoc rawan gagal kontras (terutama merah/hijau di
  dark mode) — perlu token semantik + audit.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Diff viewer reusable untuk review/audit | Screen konsumen memakai komponen langsung | ≥ 1 screen konsumen |
| Dua mode tampil tercakup | Unified + split teramati di showcase | Semua tercover test + scenario |
| Aksesibilitas diff | Navigasi hunk via keyboard + label SR | Lolos audit WCAG 2.1 AA |
| Parsing standar | `diff` (jsdiff) + render token-first sendiri | Dependency tercatat di constraints |

## Non-goals

- Syntax highlighting penuh per bahasa (butuh dependency; ditunda — lihat FR-003).
- Editor dua arah / merge conflict resolution (read-only di v1).
- Fetch dari git provider (GitHub/GitLab API milik konsumen).
- Komentar inline sebagai sistem (hanya slot integration point — FR-006).
- Virtualisasi file raksasa di v1 (collapse hunk sebagai mitigasi — FR-007).

## User & Use Case

Persona (ringkas):

1. **Reviewer kode** — memindai perubahan antar revisi; butuh mode split untuk
   file lebar dan unified untuk patch kecil.
2. **Auditor/admin** — melihat perubahan konfigurasi/kebijakan antar versi.

JTBD:

- "When saya mereview PR, I want melihat baris tambah/hapus berdampingan,
  so I can menilai dampak dengan cepat."
- "When diff panjang, I want melipat bagian konteks,
  so I can fokus ke hunk yang berubah."

Skenario utama:

1. Buka diff 3 file → header per file (nama, +/- count) → hunk terlipat kecuali
   yang berubah.
2. Toggle unified/split; nomor baris lama/baru selalu sejajar.
3. Keyboard `n`/`p` (atau panah) pindah antar hunk yang berubah.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Mode unified dan split yang bisa diganti; pewarnaan tambah/hapus via token semantik (`success`/`destructive` muted). | must | Kedua mode teramati di scenario; toggle bekerja (test). |
| FR-002 | Nomor baris lama & baru sejajar per baris; gutter tidak bergeser antar mode. | must | Baris tambah/hapus/konteks bernomor benar di kedua mode (test). |
| FR-003 | Pewarnaan baris via token; syntax highlighting penuh per bahasa eksplisit ditunda (tanpa dependency baru). | should | Kontras pasangan add/del lolos audit light & dark; label bahasa tampil bila diketahui. |
| FR-004 | Header per file (nama, ringkasan +/-) + collapse/expand hunk dan file. | must | Hunk konteks terlipat default; expand bekerja via pointer + keyboard (test). |
| FR-005 | Navigasi hunk via keyboard + daftar hunk untuk SR (live region posisi). | must | Audit a11y lolos; posisi "hunk 2 dari 5" terumumkan. |
| FR-006 | Slot komentar per baris (render prop) sebagai integration point; tanpa sistem komentar bawaan. | could | Slot ter-render di scenario; tidak ada state komentar internal. |
| FR-007 | Mitigasi file besar: collapse default + batas baris render dengan tombol "muat lebih banyak". | should | File 2000+ baris tidak macet; tombol perluasan bekerja. |
| FR-008 | State matrix: loading (skeleton baris), empty (tidak ada perubahan), error (patch invalid + penyebab). | must | Tiga state teramati di scenario showcase. |
| FR-009 | Showcase scenario diff interaktif (toggle mode, collapse, navigasi hunk) dalam light & dark. | must | Route scenario tersedia dan lolos smoke build. |

## Design Refs

- Screen: `S-005.36` Diff Viewer (`/patterns/diff-viewer`) — baru, diusulkan di PRD ini.
- Komponen terkait: `data-display/data-table.tsx` (referensi pola baris),
  `base/badge.tsx` (hitung +/-), `navigation/tabs.tsx` atau segmented (toggle
  mode), `feedback/empty-state.tsx`, `feedback/skeleton.tsx`.
- Analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (tabel §4),
  roadmap RM-12.

## Constraints & Dependencies

- Dependency package: **`diff` (jsdiff)** — standar industri parsing unified-diff;
  render unified/split milik sendiri agar token-first dan kontras terkontrol.
  Syntax highlighting penuh tetap ditunda (FR-003).
- Teknis: komponen di `packages/ui` kategori `data-display`; input berupa struktur
  hunk ternormalisasi (parser disediakan sebagai util co-located).
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA, light/dark parity, test
  Vitest + Testing Library co-located, alur gate AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Format input: struktur hunk JSON vs string unified-diff mentah? | answered — terima keduanya; string di-parse via `diff`, normalisasi di util co-located |
| 2 | Apakah syntax highlighting ringan (regex kata kunci, tanpa dep) masuk v1? | open |
| 3 | Batas baris render default sebelum "muat lebih banyak"? | open — usulan: 500 baris |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-21 | Draft awal dari roadmap RM-12 |
| 2026-11-21 | **Approved (gate 1)** — OQ dibawa ke gate 2 sebagai risiko/desain |
| 2026-11-21 | **Revisi dependency (gate 1)**: `diff` (jsdiff) untuk parsing, render token-first sendiri; OQ#1 answered |
