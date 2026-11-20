# 003 — Org Chart

Status: approved
Owner: —
Tanggal: 2026-11-20
Sumber: roadmap RM-06 (`docs/discussions/component-roadmap.md`)

## Problem

Visualisasi struktur organisasi (siaran luas, departemen, unit) dibutuhkan halaman
"tentang kami", profil perusahaan, dan admin panel. Hari ini konsumen memakai chart
library umum atau menggambar manual — hasilnya tidak konsisten dengan design system,
tidak accessible, dan tidak punya perilaku collapse/expand baku.

Bukti/konsekuensi:

- Tidak ada komponen hierarki node di `packages/ui`; `tree-view` yang ada berbentuk
  list, bukan diagram dengan konektor visual.
- Kebutuhan node kaya (avatar, nama, jabatan, badge departemen) memaksa konsumen
  membangun markup sendiri setiap kali.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Standar tunggal visualisasi org chart | Screen konsumen memakai komponen ini tanpa custom renderer | ≥ 1 screen konsumen |
| Hierarki besar tetap terbaca | 100+ node dengan collapse/expand tetap responsif | Interaksi < 100 ms; tanpa layout jank terlihat |
| Aksesibilitas diagram | Alternatif representasi pohon untuk screen reader | Lolos audit WCAG 2.1 AA + keyboard |
| Tanpa dependency baru | Implementasi SVG/CSS standalone | `package.json` `packages/ui` tidak bertambah |

## Non-goals

- Editing struktur lewat canvas (drag menambah/menyusun ulang node) — v1 read-only;
  aksi per node cukup via callback klik.
- Mind map mode (konektor bebas/kurva) — jalur terpisah RM-07, dievaluasi setelah
  RM-06/RM-09.
- Auto-layout untuk data non-hierarki atau multi-root campuran ad-hoc.
- Export gambar/PDF dari diagram.
- Menggantikan `tree-view` — keduanya hidup berdampingan (list vs diagram).

## User & Use Case

Persona (ringkas):

1. **Developer konsumen DS** — memasang halaman struktur organisasi dari data HR
   (`id`/`parentId`); butuh komponen tanpa setup chart library.
2. **End-user** — mencari orang/posisi dalam organisasi, memahami garis pelaporan,
   membuka detail satu unit.

JTBD:

- "When saya melihat struktur perusahaan, I want membuka/melipat cabang,
  so I can fokus ke unit yang saya cari."
- "When saya mencari satu orang, I want menemukan posisinya di hierarki dengan cepat,
  so I can paham konteks pelaporannya."

Skenario utama:

1. Org chart 40 orang: cabang engineering dilipat, sisanya terbaca; klik expand
   membuka subtree dengan konektor rapi.
2. Node dengan avatar, nama, jabatan, badge departemen; departemen beda berbeda
   aksen warna (token, lolos kontras light & dark).
3. Keyboard: navigasi antar node, expand/collapse dengan Enter/panah; screen reader
   membaca hierarki sebagai pohon.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Hierarki dirender dari data `id`/`parentId` (flat list atau nested) tanpa preprocessing rumit oleh konsumen. | must | Story demo memasang flat list; hasil render sama dengan nested; siklus/parent hilang ditolak dengan pesan jelas. |
| FR-002 | Node menampilkan konten kaya: avatar, title, subtitle, badge opsional; konten dapat di-custom lewat render prop tanpa keluar dari token. | must | Scenario menampilkan keempat elemen; custom node lolos audit kontras light & dark. |
| FR-003 | Cabang dapat di-collapse/expand per node; default terbuka/kontrol awal dapat diatur konsumen. | must | Klik expander menyembunyikan subtree; konektor anak ikut hilang; state terkontrol & tak terkontrol sama bekerjanya. |
| FR-004 | Konektor antar node ortogonal (garis siku) yang tetap rapi saat expand/collapse dan pada viewport kecil, memakai token (`border`/`muted-foreground`). | must | Konektor konsisten sebelum & sesudah toggle di light & dark; warna berasal dari token, bukan nilai literal. |
| FR-005 | Aksi per node: klik memanggil callback onSelect; opsi aksi sekunder (menu/inline) diserahkan konsumen. | must | onSelect terpanggil dengan data node (terverifikasi test). |
| FR-006 | Diagram dapat di-pan dan di-zoom pada container dengan batas zoom yang wajar; tersedia kontrol zoom (+/−/reset) yang terjangkau keyboard dan pan via keyboard saat kanvas fokus; scroll halaman tidak ikut terganggu. | must | Zoom in/out/reset via kontrol dan pan via keyboard berfungsi di scenario; zoom ekstrem dibatasi. |
| FR-007 | Styling per unit/departemen (aksen warna/badge) memakai token semantik dan lolos kontras di light & dark. | should | Dua departemen beda aksen; keduanya lolos audit kontras. |
| FR-008 | Orientasi layout top-down dan left-right dapat dipilih. | should | Kedua orientasi teramati di showcase tanpa merusak konektor. |
| FR-009 | Pencarian/penyorotan node berdasarkan nama/jabatan; hasil menyorot node dan membuka path ke sana. | could | Query menyorot node target; ancestor-nya otomatis ter-expand. |
| FR-010 | Aksesibilitas: diagram punya representasi pohon yang bisa dibaca screen reader; navigasi antar node via keyboard; expander mencapai via keyboard; fokus terlihat jelas di light & dark. | must | Audit ARIA (role tree/treeitem) + operability keyboard lolos; indikator fokus kontras terverifikasi. |
| FR-011 | State matrix: loading (skeleton placeholder diagram), empty (tanpa data), error (data invalid dengan pesan). | must | Tiga state teramati di scenario showcase. |
| FR-012 | Showcase scenario org chart interaktif dalam light & dark dengan data contoh realistis. | must | Route scenario tersedia dan lolos smoke build. |

## Design Refs

- Screen: baru — diusulkan `S-005.28` Org Chart (`/patterns/org-chart`), didaftarkan
  resmi di gate 2. Terkait: `S-004.04` Data Display.
- Komponen terkait: `dnd/tree-view.tsx` (referensi pola pohon, bukan basis visual),
  `base/avatar.tsx`, `base/badge.tsx`, `base/skeleton.tsx`, `feedback/empty-state.tsx`,
  `navigation/context-menu.tsx` (opsi aksi sekunder).
- Dokumen design: `docs/design/org-chart.md` dibuat saat gate 2 (anatomi node,
  algoritma layout & konektor, state matrix, wireframe).
- Analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (§2), roadmap RM-06.

## Constraints & Dependencies

- Teknis: standalone SVG/CSS **tanpa dependency** (keputusan roadmap); data
  `id`/`parentId`; ukuran node seragam agar layout deterministik.
- Dependency package: tidak ada yang baru.
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA, light/dark parity, test
  Vitest + Testing Library, alur gate sesuai AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | v1 read-only dengan aksi via callback — apakah cukup, atau butuh mode edit dasar (add/remove node)? Usulan: read-only. | answered — read-only v1; aksi via callback |
| 2 | Orientasi default (top-down vs left-right) dan perilaku auto-collapse untuk pohon dalam (>3 tingkat)? | answered — default top-down; tanpa auto-collapse, konsumen mengatur lewat `defaultCollapsedIds` |
| 3 | Algoritma layout: tidy-tree sederhana tulis sendiri vs pendekatan grid CSS — diputuskan di gate 2. | answered — tidy-tree sederhana tanpa dependency; detail di gate 2 |
| 4 | Multi-root (beberapa pohon dalam satu diagram) didukung v1? | answered — v1 satu root; multi-root ditunda |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-20 | Draft awal dari roadmap RM-06 |
| 2026-11-20 | **Approved (gate 1)** — OQ#1–#4 dijawab; kontrol zoom/pan keyboard dan token konektor masuk requirement |
