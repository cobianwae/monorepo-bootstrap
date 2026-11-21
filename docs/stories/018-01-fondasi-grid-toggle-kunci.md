# 018-01 — Fondasi grid + toggle massal + kunci

Status: done
PRD: `docs/prd/018-permission-matrix.md` (approved, gate 1)
Design: `docs/design/wireframes/permission-matrix.md` (approved, gate 2) + `docs/design/flows/permission-matrix.mmd` (diagram 1–2) + sitemap `S-005.41`
FR: `FR-001`, `FR-002`, `FR-003`, `FR-004`
Screens: `S-005.41`
Goal: Komponen `PermissionMatrix` controlled berdiri tanpa showcase final: grid 5×8 terasosiasi, toggle massal + indeterminate benar, diff sekali per aksi, sel terkunci beralasan — semua teruji unit.

## Acceptance Criteria

### AC-01 — Grid terasosiasi 5×8

**Given** 5 role × 8 resource + `value` awal
**When** grid dibuka light dan dark
**Then** header baris `scope="row"` + header kolom `scope="col"` + `role="grid/row/columnheader/rowheader/gridcell"` benar; tiap sel `aria-label "<Role> × <Resource>"` + status — diverifikasi test (FR-001, S-005.41)

### AC-02 — Toggle massal + indeterminate benar

**Given** grid dengan sebagian sel menyala (di luar kunci)
**When** header baris/kolom/semua di-toggle via pointer
**Then** sel tidak terkunci terbali sekaligus; header induk = penuh/kosong/`mixed` + strip `◐` + label SR "sebagian"; denominator = sel tidak terkunci saja — diverifikasi test (FR-002, S-005.41)

### AC-03 — Controlled + diff sekali per aksi

**Given** `value` controlled + `initialValue` pembanding
**When** sel tunggal / header baris / header kolom / semua di-toggle
**Then** `onValueChange(next, diff)` dipanggil tepat sekali dengan `diff: {role, resource, from, to}[]` lengkap (toggle 8 baris = 8 diff di luar kunci); tanpa state nilai internal — diverifikasi test (FR-003, S-005.41)

### AC-04 — Kunci + tooltip ditolak pointer dan keyboard

**Given** `locked("Viewer","Hapus") = "Dikunci kebijakan: …"`
**When** sel terkunci dicoba via klik dan via keyboard
**Then** nilai tidak berubah; tooltip menampilkan alasan; `aria-disabled` + `aria-label` mencakup alasan; toggle massal melewati sel terkunci — diverifikasi test (FR-004, S-005.41)

## Tasks

- [x] Buat `packages/ui/src/components/data-display/permission-matrix-types.ts`: `RoleId/ResourceId/PermissionValue/PermissionDiff/PermissionMatrixProps` (nested record K1, `locked()`, `renderCell` slot future FR-010)
- [x] Buat `packages/ui/src/components/data-display/permission-matrix.tsx` (named export): grid §2.1 + toggle §2.2 + kunci §2.3 + varian `cva` (`cell on/off/locked`, `headerState checked/unchecked/mixed`); compose `base/checkbox` (`checked="indeterminate"`), `overlay/tooltip`, `base/badge` legenda; tanpa token baru, token §6 wireframe
- [x] Test co-located `permission-matrix.test.tsx`: scope header, indeterminate penuh/sebagian/kosong, diff sekali per aksi (1/8/40), kunci ditolak pointer+keyboard, denominator tanpa kunci
- [x] Barrel export via `packages/ui/src/index.ts`; catat kontrak `value/diff/locked` di story
- [x] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test` untuk file baru

## Dependencies

- Story/CR lain: tidak menunggu story lain; menjadi fondasi 018-02
- Package: tanpa dependency baru (K4, disengaja)

## Notes

- Risiko: `aria-checked="mixed"` Radix vs `checked="indeterminate"` — mitigasi pakai API Radix + test `mixed` eksplisit (K5)
- Keputusan: K1 nested record; K2 FR-010 ditunda (`renderCell` slot saja); K3 sticky + K4 tanpa dep + K5 indeterminate di story ini; keyboard/banner/states/showcase di 018-02/018-03
- Kontrak terimplementasi (branch `018-01-fondasi-grid-toggle-kunci`, commit `ec3438c`): `value: Record<RoleId, Record<ResourceId, boolean>>` controlled penuh; `onValueChange(next, diff)` tepat sekali per aksi (`diff: {role, resource, from, to}[]`, hanya sel berubah); `locked(role, resource): string | null` — sel terkunci disabled + tooltip + ikon gembok, dilewati toggle massal dan dikecualikan dari denominator header; `renderCell` slot future FR-010; `density: 'default' | 'compact'`.
