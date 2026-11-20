# 010-02 — CRUD inspector: tambah/edit/hapus anti-truncate

Status: done
PRD: `docs/prd/010-org-chart-editor.md`
Design: `docs/design/org-chart-editor.md`
FR: `FR-002`, `FR-003`, `FR-005`, `FR-006`, `FR-007`
Screens: `S-005.33`, `M-004`
Goal: Jalur CRUD lengkap via tombol `+` node, context-menu, toolbar, dan inspector sheet — informasi panjang selalu terbaca penuh, setiap mutasi memanggil `onChange` sekali.

## Acceptance Criteria

### AC-01 — Informasi panjang tidak kepotong

**Given** node dengan title/subtitle/badge 40+ karakter
**When** dirender di kanvas dan inspector dibuka
**Then** kanvas ellipsis + `title`/tooltip penuh, inspector menampilkan semua field + path breadcrumb tanpa truncate (FR-002, S-005.33)

### AC-02 — Tambah child/sibling memanggil onChange

**Given** node terpilih
**When** tambah via tombol `+` / context-menu / toolbar + isi form inspector + simpan
**Then** node baru muncul di bawah parent yang benar dengan id unik, `onChange(flat)` terpanggil sekali, fokus pindah ke form lalu ke node baru (FR-003, FR-007, S-005.33)

### AC-03 — Edit properti live + validasi

**Given** inspector terbuka
**When** title/subtitle/badge/avatarSrc/accent diubah + simpan
**Then** label node update live, nama kosong ditolak inline (`aria-invalid`) tanpa `onChange`, accent strip + badge ikut ganti token (FR-006, S-005.33)

### AC-04 — Hapus aman dengan konfirmasi

**Given** node daun, node parent, dan root
**When** hapus via `Delete`/context-menu/inspector
**Then** dialog M-004 muncul (parent: pilih reparent ke kakek vs hapus subtree), root tidak bisa dihapus (disabled + alasan), konfirmasi memanggil `onChange` + push undo (FR-005, S-005.33, M-004)

## Tasks

- [x] Node custom: tombol `+` (`aria-label "Tambah bawahan <nama>"`) + context-menu (tambah/pindah/hapus/expand) + tooltip penuh
- [x] Inspector sheet: header penuh + form (title wajib, subtitle, badge, avatarSrc, accent) + meta atasan/anak/path + aksi tambah/pindah/hapus
- [x] Dialog M-004 hapus (radio reparent vs subtree) + proteksi root
- [x] Kontrak `data` + `onChange(flat)` sekali per commit; uncontrolled internal untuk demo
- [x] Test: truncate vs tooltip, tambah child/sibling, edit live + validasi kosong, hapus daun/parent/root, `onChange` payload
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`

## Dependencies

- Story/CR lain: 010-01 (fondasi canvas; kembangkan di branch yang sama atau rebase setelah 010-01 review)
- Package: tanpa dependency baru (pakai `sheet`, `context-menu`, `tooltip`, `form`, `badge`, `avatar` existing)

## Notes

- Risiko: fokus trap sheet vs kanvas — mitigasi return-focus ke node pemicu setelah tutup.
- Keputusan: id baru `nanoid`-lite (`crypto.randomUUID` slice) tanpa dep baru; unlock di implementasi.
- Reparent drag + undo/redo penuh adalah scope 010-03.
