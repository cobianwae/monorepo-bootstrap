# 011-01 — Fondasi kanvas, kartu lega, dan layout seimbang

Status: done
PRD: `docs/prd/011-org-chart-studio.md`
Design: `docs/design/org-chart-studio.md`
FR: `FR-001`, `FR-002`, `FR-003`, `FR-004`, `FR-013`, `FR-017`
Screens: `S-005.34`
Goal: Komponen `OrgChartStudio` berdiri di atas `@xyflow/react` dengan satu layout, kartu lega 240×84, konektor halus, dan pan/zoom token — tanpa tambah/pindah/hapus dulu.

## Acceptance Criteria

### AC-01 — Satu viewport, normalisasi flat/nested identik

**Given** dataset sama dalam bentuk flat dan nested + 4 dataset invalid (duplikat, parent hilang, siklus, root ≠ 1)
**When** dipasang ke `OrgChartStudio`
**Then** flat = nested identik (urutan anak stabil), tiap invalid menghasilkan error terstruktur (penyebab + id pertama) tanpa throw, dan tidak ada kode kanvas ganda dari `OrgChart`/`OrgChartEditor` — diverifikasi test (FR-001, S-005.34)

### AC-02 — Layout seimbang deterministik 1–100 node

**Given** tree 40 node / 4 tingkat dan tree kecil 1–3 node
**When** layout balanced-tidy dihitung ulang (memo terhadap `data + expanded`)
**Then** posisi deterministik (slot 240×84, gap 32, level 64, parent center di atas anak, design §3), tidak ada kolom kosong raksasa, snapshot test hijau (FR-003, S-005.34)

### AC-03 — Kartu lega + konektor halus + hover/selected jelas

**Given** kanvas berisi node dengan avatar, jabatan panjang, badge departemen umum ("Engineering")
**When** dibuka light dan dark
**Then** nama 1 baris ellipsis + tooltip penuh, jabatan max 2 baris, badge tidak truncate umum, strip aksen 3px token semantik, edge `smoothstep` 1px token `border`, hover/selected ring `primary` jelas (FR-002, FR-017, S-005.34)

### AC-04 — Pan/zoom/reset/fit + expand controlled

**Given** kanvas fokus dengan cabang collapsed
**When** tombol [+]/[−]/[reset 100%]/[fit-view], Ctrl/Cmd+wheel, keyboard `+ - 0 F`, drag pan, klik minimap, dan toggle expander (controlled + uncontrolled)
**Then** zoom clamp wajar + live region level, fit-view menampilkan semua node, wheel polos tidak mencegat scroll halaman, controls/minimap token-mapped (tanpa default CSS xyflow mentah), collapse menyembunyikan subtree + edge dan `expandedIds`/`onExpandedChange` konsisten (FR-004, FR-013, S-005.34)

## Tasks

- [x] Buat `packages/ui/src/components/canvas/org-chart-studio.tsx` + tipe `OrgStudioNodeFlat/Nested`, `OrgChartStudioProps`, util `getAncestors` (design §2)
- [x] Normalisasi + validasi terstruktur reuse pola 003/010 (bukan throw); konversi flat → xyflow `nodes`/`edges`
- [x] Implementasi balanced-tidy post-order (§3 langkah 3) + mapping xyflow langkah 4; memo layout
- [x] Node custom `StudioNode` 240×84: avatar 32, nama, jabatan, badge, strip aksen, expander, tooltip; edge `smoothstep` 1px
- [x] Controls + minimap + toolbar dasar (reset/fit) token-mapped; `role="application"`, `ariaLabel` default
- [x] Barrel export + test co-located (flat=nested, 4 invalid, determinisme layout, expand controlled/uncontrolled, reset/fit dipanggil)
- [x] Docs: catat slot/gap/level + keputusan tunda `d3-hierarchy` di story; siapkan draf seksi showcase (tanpa halaman penuh — scope 011-05)

## Dependencies

- Story/CR lain: reuse pola `org-chart.tsx` (003) dan `org-chart-editor.tsx` (010); tidak menunggu story 011 lain
- Package: tanpa dependency baru (`@xyflow/react` sudah ada; `d3-hierarchy` ditunda per D3)

## Notes

- Risiko: balanced-tidy tulisan-sendiri tidak seimbang di 100 node — mitigasi screenshot 40-node + jalur migrasi `d3-hierarchy` via CR bila audit gagal
- Keputusan: orientasi v1 `top-down` saja (LR ditunda, design §9); CRUD/search/showcase penuh di 011-02–011-05
