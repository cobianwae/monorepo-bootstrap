# 010-01 — Fondasi canvas editable: xyflow + layout + node token

Status: done
PRD: `docs/prd/010-org-chart-editor.md`
Design: `docs/design/org-chart-editor.md`
FR: `FR-001`, `FR-007`, `FR-008`, `FR-009`, `FR-011`, `FR-014`
Screens: `S-005.33`
Goal: Komponen `OrgChartEditor` di `packages/ui/components/canvas` berdiri di atas `@xyflow/react` dengan normalisasi reuse 003, layout tidy-tree deterministik, node custom token, collapse/expand, orientasi, pan/zoom + minimap + fit-view — tanpa CRUD dulu.

## Acceptance Criteria

### AC-01 — Flat dan nested render sama, invalid ditolak jelas

**Given** dataset sama dalam bentuk flat dan nested + 4 dataset invalid (duplikat, parent hilang, siklus, multi-root)
**When** dipasang ke `OrgChartEditor`
**Then** flat = nested identik (urutan stabil) dan tiap invalid menghasilkan pesan + id pelanggar tanpa throw — diverifikasi test (FR-001, S-005.33)

### AC-02 — Layout tidy reuse 003 dipetakan ke xyflow

**Given** tree kedalaman ≥3 cabang lebar
**When** layout dihitung + orientasi diganti TD/LR
**Then** posisi deterministik (slot 200×72/gap 32/level 56, design §3), LR swap sumbu, edge `smoothstep` per parent, memo terhadap `data + expanded + orientation` (FR-008, S-005.33)

### AC-03 — Collapse/expand + controlled state bekerja

**Given** cabang dengan anak
**When** expander diklik (controlled dan uncontrolled)
**Then** subtree + edge hilang/muncul, `expandedIds`/`onExpandedChange` terpanggil konsisten reuse pola 003 (FR-009, S-005.33)

### AC-04 — Pan/zoom/minimap/fit token, scroll aman

**Given** kanvas fokus
**When** tombol +/−/reset, Ctrl/Cmd+wheel, keyboard `+ - 0 F`, drag pan, klik minimap
**Then** zoom clamp wajar, fit-view menampilkan semua node, wheel polos tidak mencegat scroll halaman, controls/minimap pakai token tanpa default CSS xyflow mentah (FR-011, FR-014, S-005.33)

## Tasks

- [x] Install formal `@xyflow/react` 13.0.2 di `packages/ui` (butuh approval OQ#1 — jangan install sebelum user setuju) + matikan/map default CSS ke token
- [x] Buat `components/canvas/org-chart-editor.tsx` + tipe `OrgChartEditorProps` (design §2) + konversi flat → `nodes`/`edges` xyflow
- [x] Reuse normalisasi + validasi 003 + `getAncestors`; layout tidy reuse + mapping posisi
- [x] Node custom `OrgNode`: avatar/badge/strip aksen + expander + tooltip `title` (tanpa CRUD di story ini)
- [x] Controls + minimap token-mapped, `ariaLabel` default, `role="application"`
- [x] Barrel export + test co-located (flat=nested, invalid 4 jenis, layout deterministik, toggle expand, fit-view dipanggil)
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`

## Dependencies

- Story/CR lain: PRD 005 (pola xyflow token-mapping sebagai referensi, bukan blokir); reuse kode `org-chart.tsx` 003
- Package: `@xyflow/react` 13.0.2 (tambah dependency — approval OQ#1 wajib)

## Notes

- Risiko: versi xyflow vs React 19 peer — mitigasi cek install + build типы.
- Keputusan: tanpa `dagre` (OQ#2 usulan reuse tidy-tree); drag bebas tidak didukung — reparent di 010-03.
- CRUD/inspector/search/showcase adalah scope 010-02–010-04, bukan di sini.
