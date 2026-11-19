# CR-001 — Keyboard access untuk clickable table row

**Status:** done
**Sumber:** audit
**Ref:** `packages/ui/src/components/data-display/data-table.tsx:481`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | blocker | `packages/ui/src/components/data-display/data-table.tsx:481` | Baris tabel clickable via `onClick` pada `<tr>` tanpa `tabIndex`, `onKeyDown`, atau role apa pun. Keyboard user tidak bisa mengaktifkan baris → pelanggaran WCAG 2.1.1 (Keyboard). | Tambahkan `tabIndex={0}` + handler Enter/Space, atau render aksi baris sebagai tombol/link di dalam sel. |

## Perubahan yang Diusulkan

- Pilih satu pola akses baris: (a) row-level activation dengan `tabIndex` + `onKeyDown` Enter/Space, atau (b) action button/link di dalam sel.
- Jika row-level: tambahkan `tabIndex`, handler keyboard, dan guard agar Enter/Space pada elemen interaktif di dalam sel tidak memicu klik baris dua kali.
- Tidak mengubah nama export atau props publik `DataTable`; kontrak `onRowClick` eksisting dipertahankan.

## Tasks (jalur small-fix)

- [x] Tentukan pola akses (row-level vs action button)
- [x] Implementasi `tabIndex` + Enter/Space pada row
- [x] Test keyboard activation
- [x] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test`

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Row-level activation: `tabIndex={0}`, `role="button"`, Enter/Space, guard double-trigger | Opsi (a) sesuai rekomendasi CR; kontrak `onRowClick` dan export `DataTable` tetap. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA.
- [x] Perilaku Radix/a11y tidak rusak.
- [x] API `cva` dan export tetap konsisten.
- [x] State loading, empty, dan error relevan tersedia.
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-001-table-row-keyboard`
Commit: `fix: add keyboard access to clickable data table rows [CR-001]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
