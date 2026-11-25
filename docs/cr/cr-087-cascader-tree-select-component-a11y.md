# CR-087 — Cascader & TreeSelect: aksesibilitas label, error, dan kontrol bersarang

**Status:** done (ditetapkan user 2026-11-25; diimplementasikan di branch `cr-087-cascader-tree-select-component-a11y`, di-merge dan di-push ke `visual-polish` atas izin eksplisit; cek browser keyboard/light-dark manual tidak dilakukan)
**Sumber:** audit `/improve-ui` (skill `ui-designer`), 2026-11-25
**Ref:** `packages/ui/src/components/form/cascader.tsx`, `packages/ui/src/components/form/tree-select.tsx`

## Komponen/Route yang Terpengaruh

- `packages/ui`: `Cascader`, `TreeSelect` (+ test co-located keduanya).
- Konsumen yang diketahui: route showcase `/patterns/cascader-tree-select`; grep konsumen lain wajib sebelum eksekusi.
- Tidak mengubah nama export atau signature props. Perilaku fokus/keyboard kontrol clear/tag disentuh — wajib regresi test.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `cascader.tsx:276,280-292,443-446` | `errorId` statis `'cascader-error'`: dua `Cascader` ber-error dalam satu halaman menghasilkan id duplikat dan `aria-describedby` ambigu. Label dirender sebagai `<label>` tanpa `htmlFor`, dan trigger tanpa `id` — asosiasi label hanya jatuh ke `aria-label` pada trigger. | Pakai `React.useId()` untuk trigger dan error (pola `TreeSelect` `triggerId` di `tree-select.tsx:209,215,222`); hubungkan `htmlFor`/`id`/`aria-describedby` secara konsisten dan tambah test dua instance. |
| 2 | major | `tree-select.tsx:221-228,373-377` | Trigger `TreeSelect` tidak punya `aria-invalid`/`aria-describedby` saat `error`, dan `<p role="alert">` error tidak ber-`id`. Bandingkan `Cascader` yang sudah memasang keduanya (`cascader.tsx:291-292`). Selain itu error yang sama juga dirender di dalam popover (`tree-select.tsx:340-343`) dan disembunyikan di luar saat popover terbuka (`!open`), sehingga pengumuman error bergantung state buka/tutup. | Samakan kontrak error dengan `Cascader`: `aria-invalid`, error ber-id + `aria-describedby`; putuskan satu tempat pengumuman error (di bawah field) dan jadikan isi popover status non-duplikat, atau sebaliknya — satu sumber kebenaran. |
| 3 | major | `cascader.tsx:307-329`, `tree-select.tsx:241-257,282-299` | Kontrol clear dan hapus-tag adalah `<span role="button" tabIndex={0}>` di dalam `<button>` trigger: elemen interaktif bersarang di dalam button — tidak valid, membingungkan pembaca layar, dan urutan Tab masuk ke dalam trigger. Target sentuhnya kecil (`p-0.5`, ikon 14–16px ≈ 20px). | Restrukturisasi agar clear/hapus-tag bukan keturunan `<button>` (mis. trigger dan aksi bersaudara dalam wrapper relatif), dengan target ≥24px minimum dan idealnya mengikuti target sentuh halaman lain; pertahankan keyboard Enter/Space, `stopPropagation`, dan kembalikan fokus ke trigger setelah clear. Ini perubahan struktur DOM — cek selector/test konsumen dulu. |
| 4 | minor | `cascader.tsx:340-348` vs `tree-select.tsx:314-329` | Kolom pencarian Cascader tanpa label terprogram selain `aria-label` dari placeholder dan tanpa border/fokus terlihat setara TreeSelect yang memakai `<label className="sr-only">` + `id`. Konsistensi a11y antar-dua komponen di layar yang sama tidak rata. | Samakan pola pencarian (label `sr-only` terhubung atau `aria-label` yang disengaja di keduanya) dan gaya fokus yang setara. |
| 5 | minor | `cascader.tsx:285-294`, `tree-select.tsx:221-228` | Trigger setinggi `h-9`/`min-h-9` (36px). Halaman showcase lain menegakkan target ≥44px untuk kontrol sentuh (CR-056/CR-066/CR-084), tetapi menaikkan tinggi trigger form adalah perubahan visual/API lintas konsumen. | Jangan ubah di CR ini secara diam-diam: ukur dan catat; bila user ingin 44px, jadikan keputusan eksplisit (token/kelas varian) karena berdampak ke seluruh form. Dicatat sebagai open question, bukan task wajib. |

## Perubahan yang Diusulkan

- `cascader.tsx`, `tree-select.tsx`, dan test co-located: id unik, asosiasi label/error, restrukturisasi kontrol clear/tag, penyamaan pola pencarian.
- Tidak ada perubahan nama props/export. Perubahan struktur DOM trigger dicatat sebagai risiko regresi selector.

## Tasks (jalur small-fix)

- [x] Grep seluruh konsumen `Cascader`/`TreeSelect` dan selector/test yang menyentuh trigger/clear/tag sebelum mengubah DOM.
- [x] `Cascader`: `useId` untuk trigger/error; hubungkan label–trigger–error; test dua instance ber-error.
- [x] `TreeSelect`: tambah `aria-invalid` + error ber-id/`aria-describedby`; putuskan pengumuman error tunggal.
- [x] Keluarkan kontrol clear/hapus-tag dari dalam `<button>`; jaga keyboard, fokus, dan target sentuh; update test interaksi clear/tag.
- [x] Samakan pola label & fokus kolom pencarian kedua komponen.
- [x] Verifikasi: `pnpm -F @ds/ui test` (atau filter paket yang berlaku), `pnpm typecheck`, `pnpm lint`, `pnpm test`, build showcase; cek keyboard + light/dark manual pada route pola **belum dilakukan di browser** (verifikasi otomatis lulus; lihat Eksekusi).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Perbaikan a11y komponen dipisah dari CR halaman (085/086). | Blast radius `packages/ui` lintas konsumen; butuh test regresi sendiri dan satu CR = satu sesi. |
| 2 | Ketinggian trigger 44px tidak diasumsikan masuk scope. | Mengubah tinggi kontrol form global adalah keputusan API/visual publik; menunggu jawaban user. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA.
- [x] Perilaku Radix/a11y tidak rusak; tidak ada elemen interaktif bersarang di dalam `<button>`.
- [x] API `cva` dan export tetap konsisten.
- [x] State loading, empty, dan error relevan tersedia.
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-087-cascader-tree-select-component-a11y`
Commit: `fix: a11y label dan error cascader tree select [CR-087]`

- [x] CR disetujui user (2026-11-25; implementasi ditunda atas instruksi user — “gak usah dikerjain”).
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
- [x] Cek keyboard + light/dark manual di browser pada route `/patterns/cascader-tree-select` — tidak dilakukan; user menetapkan `done` tanpa cek browser ini (dicatat di STATUS-LOG).
