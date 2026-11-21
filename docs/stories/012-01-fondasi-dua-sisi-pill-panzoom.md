# 012-01 — Fondasi kanvas dua sisi + node pill + pan/zoom

Status: approved
PRD: `docs/prd/012-mind-map.md` (revisi OQ#2/OQ#3 2026-11-21)
Design: `docs/design/wireframes/mind-map.md` + `docs/design/flows/mind-map.mmd`
FR: `FR-001`, `FR-003`, `FR-004`, `FR-008`
Screens: `S-005.35`
Goal: Komponen `MindMap` berdiri di atas `@xyflow/react` reuse dengan layout dua sisi seimbang deterministik, node pill kompak, konektor bezier token, dan pan/zoom — tanpa tambah/hapus dulu.

## Acceptance Criteria

### AC-01 — Satu data, normalisasi flat/nested identik

**Given** dataset sama bentuk flat dan nested + 4 dataset invalid (duplikat, parent hilang, siklus, root ≠ 1)
**When** dipasang ke `MindMap`
**Then** flat = nested identik (urutan anak stabil), tiap invalid menghasilkan error terstruktur (penyebab + id pertama) tanpa throw — diverifikasi test (FR-001, S-005.35)

### AC-02 — Layout dua sisi seimbang deterministik

**Given** tree contoh "Peluncuran Q1" root + 3 cabang + 3 level dan tree 50 node
**When** layout dua sisi dihitung ulang (memo terhadap `data + expanded`)
**Then** root sentral, anak dibagi kanan-kiri proporsional lebar subtree (design K1, decided OQ#2), posisi deterministik (root 200×64, cabang 160×48), snapshot test hijau (FR-001, S-005.35)

### AC-03 — Node pill + konektor token + lipat manual dasar

**Given** kanvas berisi root + cabang dengan label panjang
**When** dibuka light dan dark
**Then** label max 2 baris ellipsis + tooltip penuh, dot aksen 8px level-1 token semantik, edge `bezier` 1px token `border`, expander toggle manual menyembunyikan subtree + edge + badge "+N" muncul (FR-001, FR-003, FR-008, S-005.35)

### AC-04 — Pan/zoom/reset/fit + expand controlled

**Given** kanvas fokus dengan cabang collapsed
**When** tombol [+]/[−]/[reset 100%]/[fit-view], Ctrl/Cmd+wheel, keyboard `+ - 0 F`, drag pan, klik minimap
**Then** zoom clamp wajar + live region level, fit-view menampilkan semua node, wheel polos tidak mencegat scroll halaman, controls/minimap token-mapped tanpa default CSS xyflow mentah, `expandedIds`/`onExpandedChange` konsisten untuk toggle manual (auto-expand search di 012-03) (FR-003, FR-004, S-005.35)

## Tasks

- [ ] Buat `packages/ui/src/components/canvas/mind-map.tsx` + tipe `MindNodeFlat/Nested`, `MindMapProps`, reuse `getAncestors` bila kontrak sama (bila beda, dokumentasikan satu baris bedanya) (wireframe §2)
- [ ] Normalisasi + validasi terstruktur reuse pola 003/011 (bukan throw); konversi flat → xyflow `nodes`/`edges`
- [ ] Implementasi layout dua sisi K1 + mapping xyflow; memo layout
- [ ] Node custom pill root/cabang via `cva` + `cn()` + expander + badge +N + Radix `Tooltip`; edge `bezier` 1px
- [ ] Controls + minimap + toolbar dasar (reset/fit) token-mapped; `role="application"`, `ariaLabel` default
- [ ] Barrel export via `index.ts` + test co-located (flat=nested, 4 invalid, determinisme layout, expand controlled/uncontrolled)
- [ ] Docs: catat slot/gap/split-rule dua sisi di story; siapkan draf seksi showcase (tanpa halaman penuh — scope 012-03)

## Dependencies

- Story/CR lain: reuse pola `org-chart-studio.tsx` (011); tidak menunggu story 012 lain
- Package: tanpa dependency baru (`@xyflow/react` sudah ada; FR-010 ditunda per K2/OQ#3 decided)

## Notes

- Risiko: split kanan-kiri tidak seimbang di 50 node — mitigasi contoh 50-node + aturan proporsional lebar subtree
- Keputusan: K1 dua sisi seimbang decided OQ#2; K3 tanpa panel detail; CRUD/search/showcase penuh di 012-02–012-03
