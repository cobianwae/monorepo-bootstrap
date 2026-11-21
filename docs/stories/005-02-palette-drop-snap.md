# 005-02 — Palette drag + tambah keyboard + snap grid

Status: review
PRD: `docs/prd/005-flow-editor.md`
Design: `docs/design/flow-editor.md`
FR: `FR-004`, `FR-009`, `FR-011`
Screens: `S-005.29`, `S-005.29.01`
Goal: Node baru lahir dari palette via drag maupun keyboard, di posisi benar (drop/snap/tengah), fokus pindah ke node baru tanpa auto-buka sheet.

## Acceptance Criteria

### AC-01 — Drag dari palette ke posisi drop

**Given** palette dengan jenis aksi + penunda + search
**When** item diseret dan dilepas di dalam canvas
**Then** node muncul di `screenToFlowPosition` (snap bila aktif); di luar canvas → batal, fokus tetap di palette; satu `onAddFromPalette` + push via kontrak history 005-01 (di-mock pada test story ini; mesin penuh di 005-05) + live region "Node X ditambah" (FR-004, S-005.29.01)

### AC-02 — Jalur keyboard setara (tombol [+])

**Given** hanya keyboard, fokus pada item palette
**When** `Enter`/`Space` pada tombol [+]
**Then** node tambah di tengah viewport + fokus pindah ke node baru + inspector TETAP TERTUTUP (on-demand via Enter/rincian — temuan #3) (FR-004, FR-011, S-005.29.01)

### AC-03 — Search + live region

**Given** N jenis di palette
**When** query diketik
**Then** filter lokal + live region "N jenis" (FR-004, S-005.29.01)

### AC-04 — Snap to grid milik konsumen

**Given** `snapToGrid` + `gridSize` 16 (default off/16)
**When** drop/geser dengan snap aktif vs mati
**Then** aktif → posisi jatuh ke kelipatan grid; mati → presisi piksel; grid dots token `border` + toggle (FR-009, S-005.29)

## Tasks

- [x] `FlowPalette` (`S-005.29.01`): search, item drag `@dnd-kit/*`, tombol [+]
- [x] Drop: `screenToFlowPosition` + snap + `onAddFromPalette` + fokus ke node baru
- [x] Grid `BackgroundVariant.Dots` token + props `snapToGrid`/`gridSize`
- [x] Test: drop posisi + batal-luar-canvas + keyboard tambah + fokus + search + snap on/off
- [x] Showcase: palette tampil di draf route (final di 005-06)

## Dependencies

- Story/CR lain: 005-01 (canvas + node sebagai target drop)
- Package: `@dnd-kit/*` (sudah ada) — tanpa dependency baru

## Notes

- Risiko: koordinat drop vs scroll/zoom — mitigasi: selalu via `screenToFlowPosition`, bukan client mentah
- Keputusan: tambah tidak membuka sheet penuh (pelajaran 011, temuan #3)
