# 010-03 — Reparent drag + move dialog + undo/redo

Status: done
PRD: `docs/prd/010-org-chart-editor.md`
Design: `docs/design/org-chart-editor.md`
FR: `FR-004`, `FR-012`, `FR-015`
Screens: `S-005.33`, `M-005`
Goal: Pindah node via drag reparent tervalidasi dan dialog keyboard-setara, siklus ditolak dengan feedback, semua mutasi bisa undo/redo — tanpa jalur pointer-only.

## Acceptance Criteria

### AC-01 — Drag reparent valid mengubah parent

**Given** node A di bawah parent P1
**When** A di-drag ke parent P2 yang valid + dilepas
**Then** `parentId` berubah, layout dihitung ulang, edge tersambung ke P2, `onChange` sekali + push undo, diumumkan "Dipindah ke P2" (FR-004, S-005.33)

### AC-02 — Drop siklus ditolak dengan feedback

**Given** node parent P dengan descendant D
**When** P di-drag ke D (atau ke diri sendiri)
**Then** target menampilkan ring `destructive` + pesan "Tidak bisa menjadi bawahan turunan sendiri", drop snap-back tanpa `onChange`, diumumkan via `role="alert"` (FR-004, S-005.33)

### AC-03 — Pindah via dialog setara keyboard

**Given** fokus keyboard di node (tanpa mouse)
**When** buka M-005 "Pilih atasan baru", pilih atasan valid (diri/descendant disabled + alasan), preview path, konfirmasi
**Then** hasil sama dengan drag valid + `onChange` + undo (FR-004, FR-012, S-005.33, M-005)

### AC-04 — Undo/redo mengembalikan persis

**Given** rangkaian tambah → pindah → edit → hapus
**When** undo berulang lalu redo berulang (tombol + `Ctrl+Z/Y`)
**Then** state kembali persis tiap langkah (banding deep-equal flat), stack ≤50, tombol disabled di ujung, diumumkan (FR-015, S-005.33)

## Tasks

- [x] Drag reparent xyflow: `onNodeDragStop` → hitung parent target (nearest / drop-on) → validasi (ada, bukan diri/descendant) → commit atau snap-back + pesan
- [x] Dialog M-005: select atasan (filter + disable invalid) + preview path + konfirmasi
- [x] Undo stack internal (tambah/hapus/pindah/edit) ≤50 + toolbar + shortcut + live region
- [x] State drag-target valid (`success` ring) vs invalid (`destructive` + teks, bukan warna saja)
- [x] Test: reparent valid, siklus ke descendant/diri ditolak, dialog keyboard, undo/redo round-trip, stack limit
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`

## Dependencies

- Story/CR lain: 010-01 (fondasi), 010-02 (CRUD inspector — undo mencakup mutasinya)
- Package: tanpa dependency baru

## Notes

- Risiko: hit-testing drop-on xyflow tidak presisi — mitigasi pakai proximity + dialog sebagai fallback presisi.
- Keputusan: reparent langsung, tanpa drag bebas + auto-layout (OQ#3 usulan) — hierarki selalu rapi.
