# 011-04 — Cari, keyboard penuh, pohon SR, dan motion/sentuh

Status: review
PRD: `docs/prd/011-org-chart-studio.md`
Design: `docs/design/org-chart-studio.md`
FR: `FR-010`, `FR-011`, `FR-016`
Screens: `S-005.34`, `S-005.34.01`
Goal: Pencarian presentasional + seluruh operasi bisa via keyboard dan screen reader, dengan reduced-motion dan target sentuh aman.

## Acceptance Criteria

### AC-01 — Cari sorot non-warna + auto-expand + live region

**Given** kanvas dengan cabang collapsed + query cocok 3 node (nama/jabatan)
**When** `highlightedIds` dipasang (via showcase) lalu query dihapus
**Then** cocok: ring `primary` + badge "Cocok" + garis putus (bukan warna saja), path ancestor auto-expand via `getAncestors` + `onExpandedChange`, live region "3 hasil", hapus query menghilangkan sorotan (FR-010, S-005.34)

### AC-02 — Keyboard penuh tanpa mouse

**Given** hanya keyboard, fokus dari toolbar
**When** Tab logis → kanvas (panah pan 40px, `+ - 0 F` zoom/fit) → kartu (`Enter` pilih, `F2`/`Ctrl+Enter` edit, `Space` expand, `Delete` → M-008) → gagang (`Enter` tambah) → panel/dialog → global `Ctrl+Z/Y`
**Then** tambah/pindah/hapus/edit/collapse/cari semua bisa tanpa mouse, fokus ring `primary` 2px terlihat light & dark (FR-011, S-005.34)

### AC-03 — Pohon SR internal setara visual

**Given** screen reader pada tab kedua / visually-hidden `role="tree"`
**When** navigasi `↑↓→←`/`Home`/`End` (roving tabindex, reuse pola 003) + tombol aksi per baris (tambah/pindah/hapus/edit)
**Then** hierarki terbaca (`aria-level`/`aria-expanded`/`aria-selected`), semua operasi visual tersedia via tombol, pengumuman mutasi + zoom + cari via live region (`assertive` hanya error) (FR-011, S-005.34.01)

### AC-04 — Reduced-motion + target sentuh

**Given** `prefers-reduced-motion` aktif dan layar sentuh < md
**When** animasi xyflow/pinch dijalankan dan semua aksi disentuh
**Then** durasi 0 + pinch mati, gagang/kartu/controls/minimap-toggle/panel minimal hit-area ≥ 44px, panel jadi bottom-sheet overlay dan minimap sembunyi + toggle tanpa menghilangkan fungsi (FR-016, S-005.34)

## Tasks

- [x] Wiring `highlightedIds` + `getAncestors` auto-expand + live region jumlah (komponen presentasional; query milik konsumen)
- [x] Keyboard map kanvas + kartu + gagang + global undo/redo; order fokus toolbar → search → kanvas → kartu/gagang → controls → panel → pohon SR
- [x] Pohon SR `role="tree"`/`treeitem`/`group` + tombol aksi per baris reuse pola 003
- [x] Reduced-motion (durasi 0, pinch mati) + audit hit-area ≥ 44px + responsif panel/minimap
- [x] Test: highlight + auto-expand + live region, keyboard tiap shortcut, pohon SR navigasi + aksi, reduced-motion + hit-area
- [x] Showcase: tambah pencarian + papan keyboard ke draf route (final di 011-05)

## Dependencies

- Story/CR lain: 011-01 (kanvas), 011-02 (inline-edit + panel), 011-03 (M-007/M-008 sebagai target keyboard/SR)
- Package: tanpa dependency baru

## Notes

- Risiko: `role="application"` kanvas memerangkap SR — mitigasi pohon SR sebagai jalur utama + skip-link minimap (`tabIndex=-1`)
- Keputusan: komponen tidak memegang query search (D9); badge "Cocok" + ring + garis putus agar non-warna-saja
