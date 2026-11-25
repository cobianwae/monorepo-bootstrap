# CR-084 — Dynamic Form: target sentuh baris member dan state kosong

**Status:** approved
**Sumber:** visual uplift (`/polish-ui`), audit gap vs `docs/design/visual-language.md` (approved 2026-11-23), 2026-11-25
**Ref:** `apps/showcase/src/app/(docs)/patterns/dynamic-form/page.tsx:516-579`, preseden target sentuh CR-056/CR-066

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:550-559`, grid `page.tsx:522` | Tombol hapus member `Button size="icon"` = `h-9 w-9` (36px, `packages/ui/src/components/base/button.tsx:28`) dan kolom grid dialokasikan `36px`. Di bawah target sentuh 44px yang ditegakkan CR-056/CR-066 pada halaman lain. | Naikkan area hapus ke ≥44px di halaman ini (kelas ukuran pada tombol/kolom grid), tanpa mengubah varian `icon` di `@ds/ui` (API publik). Pastikan baris tetap sejajar di `md` dan menumpuk rapi di mobile. |
| 2 | minor | `page.tsx:516-578` | Saat `members.fields` kosong, section hanya mengganti description dan menyisakan tombol Add member — tidak ada empty state yang menjelaskan keadaan, padahal pola showcase mewajibkan empty state komprehensif untuk koleksi dinamis. | Tampilkan `EmptyState` dari `@ds/ui` (judul + deskripsi + aksi Add member) saat 0 member; tombol Add di bawah daftar hanya tampil bila daftar tidak kosong, atau dipertahankan sebagai aksi empty state saja — pilih satu, jangan ganda. |
| 3 | minor | `page.tsx:563-577` | Baris aksi Add member memakai `Button size="sm"`; tinggi di bawah target sentuh nyaman di mobile (pola CR-061 mereflow kontrol mobile). | Evaluasi tinggi efektif di 320/390px; naikkan hanya elemen aksi baris ini bila terbukti <44px di mobile, tanpa mengubah ukuran tombol form lain (Reset/Publish tetap di CR terpisah bila perlu). |

## Perubahan yang Diusulkan

Hanya `apps/showcase/src/app/(docs)/patterns/dynamic-form/page.tsx`. Tidak ada perubahan API publik `@ds/ui` (`Button size="icon"` tidak diubah), token, dependency, atau logika `useFieldArray`.

## Audit Selector

- Test halaman memakai `getByLabelText('Email for member 1')`, `getByLabelText('Role for member 1')`, dan role `Publish project` — tidak memilih tombol hapus/Add member; perilaku append/remove tidak boleh berubah.
- Tidak ada selector e2e yang mereferensi halaman ini.

## Tasks (jalur small-fix)

- [x] Naikkan target hapus member ke ≥44px (tombol + kolom grid) dan cek perataan baris `md`/mobile. **Terbukti sudah teratasi sejak CR-073** (`page.tsx:610` kolom `44px`, `page.tsx:651` `h-11 w-11`); tidak ada perubahan, hanya diverifikasi ulang.
- [x] Tambah `EmptyState` untuk 0 member dengan aksi Add member; hindari aksi ganda.
- [x] Cek tinggi aksi Add member di viewport 320/390px; sesuaikan bila <44px.
- [x] Verifikasi manual/test: tambah–hapus member, error email per baris (`err-member-*-email`) tetap terhubung.
- [x] Verifikasi: test halaman, guard, `pnpm typecheck`, `pnpm lint`, `pnpm test`, build showcase.
- [x] Cek visual 320/390/1440 light/dark best-effort bila Playwright tersedia. **Playwright tidak tersedia, tidak dilakukan.**

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Ukuran diperbaiki di halaman, bukan di varian `icon` `@ds/ui`. | Mengubah `h-9 w-9` global = perubahan API publik yang berdampak ke semua konsumen; butuh CR komponen tersendiri. |
| 2 | Empty state memakai `EmptyState` existing. | Konsisten pola showcase; tidak menulis markup kosong ad-hoc baru. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA (EmptyState `default` memakai `border-border`/`text-muted-foreground` yang sudah diaudit; tidak ada pasangan warna baru).
- [x] Perilaku Radix/a11y tidak rusak (tombol tetap `<button>`, fokus Add member dipertahankan via `addMemberRef`; EmptyState `h3` tidak memecah hierarki saat member ada).
- [x] API `cva` dan export tetap konsisten (tanpa perubahan `@ds/ui`).
- [x] State loading, empty, dan error relevan tersedia (empty diperkuat; error per baris tidak berubah).
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-084-dynamic-form-touch-mobile`
Commit: `fix: target sentuh dan empty state dynamic form [CR-084]`

- [x] CR disetujui user (2026-11-25).
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
