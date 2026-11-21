# 008-02 — Tree select compose tree-view + showcase

Status: review
Spec: `docs/design/spec-cascader-tree-select.md`
FR: `FR-007`, `FR-008`, `FR-009`, `FR-010`, `FR-011`
Screens: `S-005.31`
Goal: Komponen `TreeSelect` — trigger select membuka popover berisi `tree-view` existing, single + multiple (tag collapse +N) — plus bagian tree select di scenario S-005.31.

## Acceptance Criteria

### AC-01 — Pilih node mengisi dan menutup

**Given** popover terbuka berisi hierarki kategori 3 tingkat
**When** klik node "Elektronik · HP · Android"
**Then** nilai terisi dan popover tertutup (FR-007, S-005.31)

### AC-02 — Path auto-expand

**Given** nilai awal node dalam ("Android")
**When** popover dibuka
**Then** ancestors terlihat ter-expand sampai node terpilih (FR-008, S-005.31)

### AC-03 — Single dan multiple

**Given** dua varian trigger
**When** memilih 1 node (single) dan 5 node (multiple)
**Then** single menampilkan label; multiple memakai `tag-input` maks. 3 tag + collapse "+2" (FR-009, S-005.31)

### AC-04 — Clearable dan searchable

**Given** nilai terisi dan query "lap"
**When** clear ditekan dan filter diketik
**Then** clear mengosongkan nilai; filter menyaring node berdasar label (FR-010, S-005.31)

### AC-05 — State matrix + a11y setara cascader

**Given** scenario dibuka light dan dark
**When** state loading, empty (tanpa data), error dipicu + navigasi keyboard penuh
**Then** semua state teramati; audit a11y lolos (FR-011, S-005.31)

## Tasks

- [x] Buat `packages/ui/src/components/form/tree-select.tsx` + tipe (single/multiple, `value`/`onChange`)
- [x] Trigger select + popover berisi `tree-view` existing + pilih-menutup
- [x] Auto-expand ancestors + mode multiple via `tag-input` (maks 3 + "+N")
- [x] Clearable + searchable + state loading/empty/error
- [x] Keyboard + ARIA setara cascader + audit a11y
- [x] Barrel export + test co-located (pilih-menutup, auto-expand, +N collapse, filter, clear)
- [x] Scenario S-005.31 bagian tree select + smoke build
- [x] Update BACKLOG + STATUS-LOG; sitemap S-005.31 `planned` → `implemented` (bila 008-01 sudah)

## Dependencies

- Story/CR lain: 008-01 independen (urutan bebas); compose `select`/`popover`, `tree-view`, `tag-input`, `skeleton`, `empty-state` existing
- Package: tanpa dependency baru

## Notes

- Risiko: sinkronisasi expand `tree-view` di dalam popover — kelola via controlled expanded ids
- Keputusan: batas tag default 3 + "+N" (OQ#2 spec, answered)
