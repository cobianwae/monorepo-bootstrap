# 011-03 — Pindah (drag + dialog), hapus, dan undo/redo

Status: done
PRD: `docs/prd/011-org-chart-studio.md`
Design: `docs/design/org-chart-studio.md`
FR: `FR-007`, `FR-008`, `FR-009`, `FR-013`, `FR-019`
Screens: `S-005.34`, `M-007`, `M-008`
Goal: Pindah dua jalur setara (drag + dialog M-007), hapus aman via M-008, dan semua mutasi bisa di-undo/redo.

## Acceptance Criteria

### AC-01 — Drag-pindah dengan validasi terlihat

**Given** kanvas dengan dua tim + satu pasangan siklus (parent → descendant)
**When** kartu diseret ke target valid lalu ke target invalid (diri/descendant)
**Then** target valid: ring `success` + teks "Lepas untuk pindah" + preview path; target invalid: ring `destructive` + pesan + snap-back + `role="alert"`; lepas valid → satu `onChange` + push undo + toast (FR-007, S-005.34)

### AC-02 — Dialog pindah M-007 setara keyboard

**Given** hanya keyboard, fokus pada kartu yang ingin dipindah
**When** M-007 dibuka → pilih atasan baru (diri/descendant disabled + alasan) → preview path → konfirmasi
**Then** hasil identik dengan drag (validasi + `onChange` + undo + toast), fokus terperangkap, Esc batal, sukses mengumumkan "Node X dipindah ke Y" via live region (FR-007, M-007)

### AC-03 — Hapus aman via M-008 + proteksi root

**Given** node dengan N turunan dan node root
**When** Delete/menu konteks → M-008 → pilih [pindahkan anak ke kakek] vs [hapus subtree] → konfirmasi; dan coba hapus root
**Then** dialog menyebut N turunan by name count, konfirmasi → satu `onChange` + undo + toast "Dihapus — Urungkan", root: tombol hapus disabled + penjelasan (FR-008, M-008)

### AC-04 — Undo/redo mencakup semua mutasi ≤ 50

**Given** riwayat tambah → edit → pindah → hapus
**When** toolbar [undo]/[redo], `Ctrl+Z`/`Ctrl+Y` (`Ctrl+Shift+Z`), dan tombol toast [Urungkan]
**Then** tiap langkah round-trip persis (data kembali sama), stack dibatasi 50, tiap undo/redo memanggil `onChange` + live region "Perubahan dibatalkan/diulang" (FR-009, FR-013, FR-019, S-005.34)

## Tasks

- [x] Drag antar kartu: deteksi target terdekat, ring + teks valid/invalid, preview path, snap-back, penolakan siklus/diri
- [x] Dialog `M-007`: select atasan + preview + validasi; fokus-trap + Esc
- [x] Dialog `M-008`: hitungan `descendantCount`, radio reparent-ke-kakek vs hapus-subtree, proteksi root
- [x] Undo/redo internal ≤ 50 + toolbar + shortcut + live region + toast wiring untuk semua mutasi
- [x] Test: drag valid/invalid, M-007 setara drag, M-008 kedua mode + root, round-trip undo semua mutasi + batas 50
- [x] Showcase: tambah pemicu pindah/hapus/undo ke draf route (final di 011-05)

## Dependencies

- Story/CR lain: 011-01 (kanvas + layout), 011-02 (commit + panel sebagai host tombol pindah/hapus)
- Package: `overlay/dialog`, `form/select`, `overlay/toaster` — tanpa dependency baru

## Notes

- Risiko: drag xyflow bentrok dengan pan — mitigasi drag-pindah hanya dari badan kartu, pan dari background kanvas
- Keputusan: kedua jalur pindah wajib (rekomendasi OQ#2); menu konteks tambah/pindah/hapus sebagai pelengkap pointer
