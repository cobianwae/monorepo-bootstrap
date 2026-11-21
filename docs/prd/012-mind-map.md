# 012 — Mind Map

Status: approved
Owner: —
Tanggal: 2026-11-21
Sumber: roadmap RM-07 (`docs/discussions/component-roadmap.md`)

## Problem

Brainstorming, pemetaan ide, dan breakdown topik butuh visualisasi radial (root
sentral, cabang menyebar). Hari ini pilihannya timpang: `OrgChart` vertikal tidak
cocok untuk ide non-hirarkis formal, sedangkan flow editor (`@xyflow/react`)
terlalu berat untuk sekadar memetakan ide.

Bukti/konsekuensi:

- Tidak ada komponen mind map di `packages/ui`; kebutuhan ideation hanya bisa
  dipenuhi flow editor yang overkill (palette, edge custom, inspector).
- Pola canvas sudah terbukti di `OrgChart`/`OrgChartStudio` (layout deterministik,
  pan/zoom, expand/collapse) — tinggal diturunkan ke varian radial ringan.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Mind map reusable untuk ideation | Screen konsumen memakai komponen langsung | ≥ 1 screen konsumen |
| Struktur radial terbaca | Root + 3 level cabang teramati di showcase | Semua tercover test + scenario |
| Aksesibilitas setara tree | Navigasi keyboard + ARIA | Lolos audit WCAG 2.1 AA |
| Satu dependency canvas | Reuse `@xyflow/react` yang sudah ada | Tanpa dependency di luar existing |

## Non-goals

- Mengganti `OrgChartStudio` atau flow editor — ini turunan ringan, bukan pengganti.
- Kolaborasi realtime (multi-user, CRDT).
- Auto-layout graf umum (ELK/dagre); layout radial deterministik milik sendiri.
- Export PDF / print layout.
- Runner/eksekusi node (milik flow editor).

## User & Use Case

Persona (ringkas):

1. **End-user produk** — memetakan ide saat brainstorming; butuh tambah/edit node
   cepat tanpa belajar tool diagram.
2. **Developer konsumen DS** — butuh komponen controlled dengan data hierarki
   sederhana dan callback perubahan.

JTBD:

- "When saya brainstorming, I want menambah cabang ide dalam 1 klik,
  so I can fokus ke ide, bukan ke tool."
- "When peta membesar, I want melipat cabang yang tidak relevan,
  so I can tetap melihat gambaran besar."

Skenario utama:

1. Root "Peluncuran Q1" + 3 cabang; klik gagang `+` pada cabang → node anak baru
   muncul dan langsung bisa diketik.
2. Klik badge cabang → subtree melipat; klik lagi → membuka.
3. Pan/zoom untuk menavigasi peta 50+ node; tombol reset mengembalikan pandangan.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Render mind map dari data hierarki (`id`/`parentId` atau nested): root sentral, cabang menyebar radial/dua sisi deterministik. | must | Struktur 3 level teramati di scenario; layout stabil antar render (test snapshot/layout). |
| FR-002 | Tambah/edit/hapus node: gagang `+`, inline-edit (Enter simpan/Esc batal), hapus dengan konfirmasi bila punya anak. | must | Alur tambah-edit-hapus bekerja via pointer dan keyboard (test). |
| FR-003 | Expand/collapse per cabang dengan indikator jumlah node tersembunyi. | must | Collapse menyembunyikan subtree + konektor; indikator hitungan tampil. |
| FR-004 | Pan/zoom (kontrol + / − / reset / fit) dengan batas zoom yang dijaga. | should | Navigasi peta 50 node tanpa kehilangan konteks; reset/fit bekerja. |
| FR-005 | Navigasi keyboard (panah antar sibling/parent-child, Enter edit, Delete hapus) + semantik tree untuk SR. | must | Audit a11y lolos; semua aksi terjangkau tanpa mouse. |
| FR-006 | Nilai controlled: `value`/`onChange` sekali per commit; undo/redo dasar. | should | Round-trip edit menghasilkan data setara (test). |
| FR-007 | State matrix: loading (skeleton), empty (CTA tambah root), error (data invalid + penyebab). | must | Tiga state teramati di scenario showcase. |
| FR-008 | Dark mode dan kontras: node, konektor, kontrol memakai token dan lolos audit light & dark. | must | Scenario light & dark lolos audit kontras. |
| FR-009 | Showcase scenario mind map interaktif (tambah/edit/lipat, pan/zoom) dalam light & dark. | must | Route scenario tersedia dan lolos smoke build. |
| FR-010 | Drag-reparent antar cabang dengan validasi anti-siklus. | could | Catatan desain di gate 2; tidak wajib di v1. |

## Design Refs

- Screen: `S-005.35` Mind Map (`/patterns/mind-map`) — baru, diusulkan di PRD ini.
- Komponen terkait: `canvas/org-chart-studio.tsx` (pola kartu + pan/zoom + tambah
  1-klik untuk dipakai ulang), `base/button.tsx`, `overlay/tooltip.tsx`,
  `feedback/empty-state.tsx` (pola state), `feedback/skeleton.tsx`.
- Analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (tabel §4),
  roadmap RM-07 (evaluate setelah RM-06/RM-09 — keduanya selesai).

## Constraints & Dependencies

- Dependency package: **`@xyflow/react` (reuse)** — sudah disetujui di PRD 005 dan
  dipakai `OrgChartStudio`; mind map reuse satu dependency canvas (node/edge,
  pan/zoom, minimap) dengan layout radial milik sendiri. Tanpa dependency baru
  di luar yang sudah ada.
- Teknis: komponen di `packages/ui` kategori `canvas`; data `id`/`parentId`
  konsisten dengan pola org chart.
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA, light/dark parity, test
  Vitest + Testing Library co-located, alur gate AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Implementasi: standalone vs di atas `@xyflow/react`? | answered — reuse `@xyflow/react` (satu dependency canvas; layout radial milik sendiri) |
| 2 | Layout default: dua sisi (kiri-kanan) vs radial penuh? | open — usulan: dua sisi seimbang sebagai default |
| 3 | Apakah FR-010 (drag-reparent) masuk v1 atau iterasi berikut? | open |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-21 | Draft awal dari roadmap RM-07 |
| 2026-11-21 | **Approved (gate 1)** — OQ dibawa ke gate 2 sebagai risiko/desain |
| 2026-11-21 | **Revisi dependency (gate 1)**: reuse `@xyflow/react` (sudah ada di PRD 005); OQ#1 answered |
