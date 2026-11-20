# 002-02 — Konten list/grid + seleksi massal + context menu

Status: done
PRD: `docs/prd/002-file-manager.md`
FR: `FR-003`, `FR-004`, `FR-005`, `FR-012`
Screens: `S-005.27`, `S-005.27.01`
Goal: Zona konten utama `S-005.27.01` dengan mode list (basis `data-table`) dan grid (thumbnail) yang bisa ditukar tanpa reset seleksi, multi-select memunculkan `bulk-action-bar`, context menu 6 aksi per item, plus sortir dan filter tipe di mode list — lalu lengkapi scenario showcase dengan kontrol demo.

## Acceptance Criteria

### AC-01 — Toggle list/grid tanpa reset

**Given** folder aktif berisi campuran image/PDF/video/audio/other dengan beberapa item terpilih
**When** user menukar view list ↔ grid via toggle
**Then** render berubah tanpa reload data, urutan dan `selectedIds` konsisten antar mode, dan pilihan view diingat selama sesi via `view` / `onViewChange` (FR-003, S-005.27.01)
**And** grid memakai `role="grid"`/`listbox` setara list dengan posisi item terbaca screen reader

### AC-02 — Multi-select memunculkan bulk bar

**Given** konten dalam mode list dan grid
**When** user memilih ≥ 1 item via checkbox, Ctrl/Cmd-klik, Shift-klik, atau Shift+Panah
**Then** `bulk-action-bar` muncul dengan aksi download, move, delete; pengumuman `aria-live="polite"` ("n item dipilih"); setiap aksi memanggil handler konsumen (`onDownload`/`onMove`/`onDelete`) dengan semua item terpilih tanpa mengubah data sendiri (FR-004, S-005.27.01)

### AC-03 — Context menu 6 aksi via pointer + keyboard

**Given** fokus pada satu item
**When** user membuka menu via klik kanan, tombol Menu, atau Shift+F10
**Then** menu menampilkan open/preview, download, rename, move, delete, detail; setiap aksi memanggil callback konsumen yang sama untuk pointer maupun keyboard (`onPreview`, `onDownload`, `onRename`, `onMove`, `onDelete`) (FR-005, S-005.27.01)

### AC-04 — Sortir + filter tipe mode list

**Given** mode list dengan kolom nama, ukuran, tanggal
**When** user klik header kolom atau memilih filter tipe file
**Then** urutan berubah sesuai kolom (`aria-sort` terupdate) dan filter menyaring item tanpa fetch ulang; toggle ke grid mempertahankan urutan hasil sortir/filter (FR-012, S-005.27.01)

### AC-05 — State konten + verifikasi

**Given** kontrol demo empty/loading/error untuk zona konten
**When** state dipicu
**Then** loading menampilkan skeleton tabel/grid (`aria-busy`), empty menampilkan ilustrasi + "Folder kosong" + CTA Upload/Folder baru, error menampilkan pesan + tombol Coba lagi dan membersihkan seleksi (FR-009 parsial konten, S-005.27.01)
**And** `pnpm typecheck` + `pnpm lint` + `pnpm test` lolos; test mencakup toggle persist, bulk handler, context handler, sortir/filter

## Tasks

- [x] Implementasi zona konten `S-005.27.01` di `file-manager.tsx`: mode list basis `data-table` (header sortir + checkbox) + mode grid thumbnail (nama + meta ringkas, seleksi setara)
- [x] State `selectedIds` sebagai sumber kebenaran; toggle view tidak me-reset seleksi/urutan; ingat pilihan selama sesi
- [x] Compose `bulk-action-bar` existing (download, move, delete) + `aria-live` pengumuman seleksi
- [x] Compose `context-menu` existing per item dengan 6 aksi; buka via klik kanan + keyboard (Menu/Shift+F10)
- [x] Sortir kolom (nama, ukuran, tanggal) + `aria-sort` + filter tipe file mode list
- [x] State konten loading/empty/error sesuai §6
- [x] Test co-located: toggle persist seleksi, bulk bar muncul + handler, context menu keyboard + handler, sortir/filter tanpa fetch
- [x] Showcase `S-005.27.01`: kontrol demo toggle view, seleksi, sortir/filter, pemicu loading/empty/error konten
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`

## Dependencies

- Story/CR lain: bergantung pada `002-01` (shell + kontrak `folders`/`items`/`selectedIds`); `002-04` bergantung pada story ini untuk polish keyboard lanjutan
- Package: tanpa dependency baru; menyusun `data-table`, `bulk-action-bar`, `context-menu`, `checkbox`, `empty-state`, `skeleton` existing

## Notes

- Risiko: seleksi dua mode divergen — mitigasi dengan satu `selectedIds` + test toggle persist.
- Keputusan: mengikuti §4 varian (pattern bukan `cva` baru); FR-015 drag-drop tetap ditunda, v1 via menu + bulk action (D4).
