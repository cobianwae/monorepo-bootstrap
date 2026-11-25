# CR-088 — Cascader & TreeSelect: konsistensi microcopy dan teks default komponen

**Status:** done (ditetapkan user 2026-11-25; diimplementasikan di branch `cr-088-cascader-tree-select-copy-defaults`, di-merge dan di-push ke `visual-polish` atas izin eksplisit; cek browser light/dark manual tidak dilakukan)
**Sumber:** audit `/improve-ui` (skill `ui-designer`), 2026-11-25
**Ref:** `packages/ui/src/components/form/cascader.tsx:63-65,299,311`, `packages/ui/src/components/form/tree-select.tsx:90-92,286,345-367`
**Keputusan bahasa:** English — ditetapkan user 2026-11-25.

## Komponen/Route yang Terpengaruh

- `packages/ui`: teks default dan `aria-label` bawaan `Cascader`/`TreeSelect` (+ test yang menegaskan teks tersebut).
- Halaman pola Cascader & Tree Select sebagai konsumen penegas; grep konsumen lain wajib sebelum eksekusi.
- Mengubah teks default adalah perubahan perilaku yang terlihat konsumen — bukan perubahan signature props.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | minor | `cascader.tsx:63-65,299,311` vs `tree-select.tsx:90-92,286` | Default kedua komponen tidak satu bahasa/satu gaya: Cascader Inggris (“Select option...”, “Search...”, “No options available.”, “Loading...”, aria “Clear selection”), TreeSelect Inggris untuk placeholder tetapi Indonesia untuk aria clear (“Bersihkan pilihan”) dan hitungan (“{n} dipilih”, `tree-select.tsx:365-368`). Di halaman pola yang berbahasa Indonesia, hasilnya campur dalam satu layar. | Tetapkan satu bahasa default per keputusan user, lalu samakan placeholder, teks loading/empty, aria clear, dan hitungan terpilih di kedua komponen; perbarui test yang menegaskan teks lama. |
| 2 | minor | `tree-select.tsx:345-349` vs `cascader.tsx:353,380,399` | Empty state tidak konsisten: TreeSelect memakai `EmptyState` berjudul tetap “Tidak ada data” + `emptyText`, Cascader memakai paragraf polos dengan `emptyText` yang sama untuk “tidak ada opsi” dan “pencarian kosong”. User tidak bisa membedakan kosong-awal vs tanpa-hasil-pencarian. | Bedakan copy kosong-awal dan tanpa-hasil (minimal lewat `emptyText` yang diteruskan halaman + judul EmptyState yang tidak bertabrakan); samakan perlakuan visual empty kedua komponen sejauh kontrak props memungkinkan. |
| 3 | minor | `page.tsx:103,147,163` (konsumen penegas) | Judul demo di halaman menegaskan istilah komponen yang tidak konsisten dengan copy di dalam komponen (“Tree Select” dua kata di judul halaman vs satu kata di nama komponen/ekspor `TreeSelect`). | Samakan penyebutan nama komponen antara judul halaman, label, dan dokumentasi setelah bahasa ditetapkan; lakukan di CR-086 untuk sisi halaman dan di CR ini untuk sisi komponen. |

## Perubahan yang Diusulkan

- Samakan teks default + aria kedua komponen mengikuti bahasa yang diputuskan user.
- Bedakan copy empty-awal vs tanpa-hasil-pencarian.
- Update test komponen yang menegaskan teks default; tidak ada perubahan signature props atau token.

## Tasks (jalur small-fix)

- [x] Catat keputusan bahasa user di tabel Keputusan CR ini sebelum mulai. (English, 2026-11-25)
- [x] Grep konsumen dan test yang menegaskan teks default lama.
- [x] Samakan placeholder/search/loading/empty/aria-clear/hitungan di `Cascader` dan `TreeSelect`.
- [x] Bedakan copy kosong-awal vs tanpa-hasil; sesuaikan pemakaian `EmptyState`.
- [x] Verifikasi: test `@ds/ui` terkait, `pnpm typecheck`, `pnpm lint`, `pnpm test`, build showcase; cek halaman pola light/dark **belum dilakukan di browser** (verifikasi otomatis lulus; lihat Eksekusi).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Bahasa default komponen dan copy halaman terkait: **English**. | Ditetapkan user 2026-11-25; mengikuti tren CR halaman terbaru (CR-071/079/082). Keputusan ini juga berlaku untuk microcopy halaman di CR-086. |
| 2 | CR ini hanya teks default, bukan lokalisasi/i18n. | Tidak ada sistem i18n di repo; menambahkannya di luar scope dan butuh konfirmasi dependency/arsitektur. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA (tidak ada pasangan warna baru).
- [x] Perilaku Radix/a11y tidak rusak; aria-label tetap deskriptif setelah pergantian bahasa.
- [x] API `cva` dan export tetap konsisten.
- [x] State loading, empty, dan error relevan tersedia dengan copy yang dapat dibedakan.
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-088-cascader-tree-select-copy-defaults`
Commit: `fix: samakan microcopy cascader tree select [CR-088]`

- [x] Keputusan bahasa ditetapkan user (Keputusan #1: English, 2026-11-25).
- [x] CR disetujui user (2026-11-25; implementasi ditunda atas instruksi user — “gak usah dikerjain”).
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
- [x] Cek light/dark manual di browser pada route `/patterns/cascader-tree-select` — tidak dilakukan; user menetapkan `done` tanpa cek browser ini (dicatat di STATUS-LOG).
