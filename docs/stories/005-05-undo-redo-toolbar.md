# 005-05 — Undo/redo + toolbar pola

Status: review
PRD: `docs/prd/005-flow-editor.md`
Design: `docs/design/flow-editor.md`
FR: `FR-007`
Screens: `S-005.29`
Goal: Semua mutasi struktural bisa dibatalkan/diulang via toolbar, shortcut, dan toast — round-trip persis.

## Acceptance Criteria

### AC-01 — Round-trip semua mutasi

**Given** riwayat tambah node → sambung edge → edit judul → edit label → geser node → hapus
**When** [urungkan] ditekan berulang lalu [ulangi] berulang
**Then** tiap langkah state kembali persis (nodes + edges); tiap undo/redo memanggil `onNodesChange`/`onEdgesChange` sehingga state konsumen single source (FR-007, S-005.29)

### AC-02 — Batas 50 + cabang baru

**Given** 55 mutasi berturut-turut lalu 1 mutasi baru setelah undo
**When** stack diperiksa
**Then** stack ≤ 50 (`historyLimit` default, prop dapat diubah); cabang baru membersihkan redo (FR-007, S-005.29)

### AC-03 — Tiga jalur setara ID

**Given** ada riwayat
**When** toolbar [urungkan]/[ulangi] vs `Ctrl+Z`/`Ctrl+Shift+Z` vs tombol toast [Urungkan]
**Then** ketiganya memicu aksi sama + live region "Perubahan dibatalkan/diulang"; tombol disabled saat stack kosong/penuh; `Ctrl+Y` didukung sebagai alias redo (selaras PRD FR-007 tanpa mengubah artefak approved) (FR-007, S-005.29)

### AC-05 — Toggle snap/grid di toolbar

**Given** toolbar pola dengan toggle snap + grid
**When** toggle diubah lalu node baru ditambah/digeser
**Then** perilaku snap mengikuti toggle (detail perilaku: 005-02 AC-04); controls tetap bebas zoom (temuan #6) (FR-007, FR-009, S-005.29)

### AC-04 — Klon struktural (larangan stringify)

**Given** node berisi `data` non-serialisable (fungsi/icon)
**When** push undo + undo + redo
**Then** tidak ada crash/kehilangan referensi fungsi; snapshot via klon struktural ringan, bukan `JSON.stringify` (temuan #9) (FR-007, S-005.29)

## Tasks

- [x] History internal bounded (`historyLimit` default 50) + push saat commit pengguna saja
- [x] Toolbar pola: [urungkan] [ulangi] [snap] [grid] (zoom milik controls — temuan #6)
- [x] Shortcut + live region + disabled state + toast wiring final
- [x] Test: round-trip 6 jenis mutasi + batas 50 + cabang + 3 jalur + data non-serialisable
- [x] Showcase: toolbar tampil di draf route (final di 005-06)

## Dependencies

- Story/CR lain: 005-01 (commit model + kontrak `useFlowHistory` — diimplementasi penuh di sini), 005-02/03/04 (sumber mutasi: tambah/sambung/edit/hapus)
- Package: `base/button`, `feedback/toaster` — tanpa dependency baru

## Notes

- Risiko: undo memicu push baru (loop) — mitigasi: flag internal saat apply undo/redo
- Keputusan: `Ctrl+Shift+Z` sebagai redo utama (`Ctrl+Y` sebagai alias bila tersedia)
