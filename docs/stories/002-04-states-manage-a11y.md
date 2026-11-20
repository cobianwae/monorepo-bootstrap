# 002-04 — State matrix penuh + rename/kelola + audit keyboard

Status: review
PRD: `docs/prd/002-file-manager.md`
FR: `FR-009`, `FR-011`, `FR-013`
Screens: `S-005.27`, `S-005.27.01`, `S-005.27.02`, `M-002`, `M-003`
Goal: Lengkapi state matrix semua zona, dialog kelola (rename/folder baru + konfirmasi hapus/pilih folder move), dan operability keyboard + screen reader penuh — lalu kunci scenario showcase sebagai bukti audit (light/dark, reduced-motion, tab order).

## Acceptance Criteria

### AC-01 — State matrix penuh per zona teramati

**Given** kontrol demo loading/empty/error per zona (sidebar, konten, panel upload, quota, preview)
**When** setiap state dipicu
**Then** tampilan sesuai §6: skeleton tree/tabel/grid/quota/media (`aria-busy`), empty dengan CTA terjangkau keyboard, error dengan teks + tombol retry (`role="status"`/`alert`); error konten membersihkan seleksi; error quota tidak memblokir konten; media gagal → fallback + unduh (FR-009, S-005.27 / S-005.27.01 / S-005.27.02 / M-001)

### AC-02 — Rename + folder baru dengan validasi

**Given** `M-002` dialog rename / folder baru di folder dengan nama existing
**When** user mengirim nama kosong atau duplikat dalam folder yang sama, lalu nama valid
**Then** nama kosong/duplikat ditolak dengan pesan inline; nama valid memanggil `onRename` / `onCreateFolder` dan hasilnya langsung terlihat di tree dan list/grid (FR-013, M-002 / S-005.27)

### AC-03 — Konfirmasi hapus + pilih folder move

**Given** ≥ 1 item terpilih (bulk bar atau context menu → move/delete)
**When** user memilih delete atau move
**Then** `M-003` meminta konfirmasi hapus ATAU pilihan folder tujuan; lanjut memanggil `onDelete` / `onMove(items, targetFolderId)`; batal menutup dialog tanpa efek; konten dan tree diperbarui dan seleksi dibersihkan setelah aksi (FR-004/FR-005 penguat via dialog, M-003 / S-005.27)

### AC-04 — Keyboard penuh + screen reader + motion

**Given** pengguna hanya memakai keyboard + screen reader
**When** menavigasi toolbar → sidebar → konten → panel → bulk bar → modal
**Then** semua alur (navigasi folder, seleksi Shift/Ctrl + Shift+Panah, buka menu via Menu/Shift+F10, buka/tutup preview via Enter/Esc, retry error, dialog kelola) bisa dijalankan tanpa mouse; tab order logis; `aria-sort`, `aria-live` seleksi, `role="alert"`/`status` error, label media, dan focus trap + fokus kembali preview terverifikasi; `prefers-reduced-motion` menonaktifkan transisi view/progress (FR-011 penuh, S-005.27 / M-001 / M-002 / M-003)
**And** audit light & dark parity lolos; `pnpm typecheck` + `pnpm lint` + `pnpm test` lolos

## Tasks

- [x] Audit dan lengkapi state matrix §6 di semua zona + scenario showcase (kontrol per zona) + test tiap state
- [x] `M-002` rename/folder baru: dialog + validasi kosong/duplikat + pesan inline + update tree + list/grid
- [x] `M-003` konfirmasi hapus + pilih folder tujuan move; wiring ke `onDelete`/`onMove`; batal tanpa efek
- [x] Polish keyboard/SR: treeview panah + Enter, breadcrumb nav, tabel `aria-sort`, grid posisi item, bulk `aria-live`, menu Shift+F10, preview focus trap + Esc + fokus kembali, tab order, `prefers-reduced-motion`
- [x] Test co-located: state per zona, validasi rename/duplikat, konfirmasi hapus/move + batal, tab order + focus trap + live region
- [x] Showcase final: semua state §6 teramati + catatan a11y + light/dark; handler mock tanpa mengubah kode pattern (FR-010)
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test` (+ `pnpm -C apps/showcase build` karena menyentuh route)
- [x] Tick tasks story, update `docs/BACKLOG.md` dan `docs/STATUS.md` sesuai definisi selesai

## Dependencies

- Story/CR lain: bergantung pada `002-01`, `002-02`, `002-03` (memoles hasil ketiga story); tidak ada story lanjutan di v1
- Package: tanpa dependency baru; FR-014 (virtualisasi, butuh `@tanstack/react-virtual`) dan FR-015 (drag-drop) eksplisit ditunda ke iterasi berikut (D4)

## Notes

- Risiko: dialog move/delete mengubah data bila pattern ikut mutasi — mitigasi dengan pattern murni memanggil handler konsumen (§3 aturan contract).
- Keputusan: FR-014/FR-015 tetap `could` ditunda; v1 memakai menu + bulk action; cakupan FR must (`FR-001`–`FR-011`) + should (`FR-012`–`FR-013`) selesai di story ini.
