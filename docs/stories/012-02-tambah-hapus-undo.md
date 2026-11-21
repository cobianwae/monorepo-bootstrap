# 012-02 — Tambah inline + hapus M-011 + undo/redo

Status: approved
PRD: `docs/prd/012-mind-map.md` (revisi OQ#2/OQ#3 2026-11-21)
Design: `docs/design/wireframes/mind-map.md` + `docs/design/flows/mind-map.mmd`
FR: `FR-002`, `FR-006`
Screens: `S-005.35`, `M-011`
Goal: Ideation 1-klik — tambah anak/saudara via gagang, inline-edit validasi, hapus daun langsung + cabang via M-011, controlled `value`/`onChange` + undo/redo.

## Acceptance Criteria

### AC-01 — Tambah 1-klik inline-edit

**Given** node pill fokus/hover dengan gagang luar + sejajar terlihat
**When** klik gagang atau Enter saat gagang fokus (pointer + keyboard)
**Then** node baru muncul tersorot di posisi layout benar, mode inline-edit aktif, fokus ke input — diverifikasi pointer + keyboard (FR-002, S-005.35)

### AC-02 — Edit inline validasi

**Given** node baru atau node fokus dalam mode edit
**When** Enter/blur valid, Esc, atau blur kosong
**Then** Enter simpan → `onChange` sekali + undo-push + toast; Esc buang node baru/fokus kembali parent; kosong ditolak inline (`aria-invalid` + pesan, tetap edit) (FR-002, FR-006, S-005.35)

### AC-03 — Hapus daun vs cabang + proteksi root

**Given** node daun, node cabang (+N turunan), dan root
**When** Delete/Backspace atau menu hapus
**Then** daun hapus langsung + toast undo; cabang buka M-011 (Radix `AlertDialog`) sebut label + N turunan (selalu hapus subtree v1), konfirmasi → `onChange` + undo; root ditolak + penjelasan (FR-002, S-005.35, M-011)

### AC-04 — Controlled sekali-per-commit + undo/redo

**Given** mutasi tambah/edit/hapus berurutan
**When** tiap commit dan toolbar `Ctrl+Z/Y`
**Then** tiap mutasi = satu `onChange(flat penuh)` + satu push undo (batas 50), undo/redo memanggil `onChange`, live region umumkan status, toast "Dihapus/Ditambah — Urungkan" ≤ 5 dtk (FR-006, S-005.35)

## Tasks

- [ ] Gagang `+` luar/sejajar custom handle (hit-area ≥ 44px, `aria-label`), muncul hover/fokus
- [ ] Inline-edit di pill via `cva` + `cn()` (Enter/Esc/blur validasi kosong `aria-invalid`)
- [ ] M-011 via Radix `AlertDialog` (label + N turunan, proteksi root, fokus-trap, Esc batal)
- [ ] `data`/`onChange` controlled + uncontrolled internal demo; undo/redo stack 50 + toolbar + shortcut + live region + toast
- [ ] Radix `ContextMenu` tambah/edit/lipat/hapus + Radix `Tooltip` setara pointer
- [ ] Barrel export + test co-located (tambah pointer+keyboard, tolak kosong, hapus daun/cabang/root, onChange sekali, undo/redo)

## Dependencies

- Story/CR lain: membutuhkan 012-01 (fondasi `mind-map.tsx` + layout + expand)
- Package: tanpa dependency baru; tanpa drag-reparent (FR-010 ditunda K2/OQ#3 decided)

## Notes

- Risiko: fokus hilang setelah tambah/hapus — mitigasi fokus ke node baru/parent + live region
- Keputusan: K2 FR-010 tunda v1 (tanpa drag); K3 tanpa panel (edit hanya inline, beda dari Studio M-007/M-008)
