# CR-083 — Dynamic Form: peran warna status dan reduced motion

**Status:** done
**Sumber:** visual uplift (`/polish-ui`), audit gap vs `docs/design/visual-language.md` (approved 2026-11-23), 2026-11-25
**Ref:** `apps/showcase/src/app/(docs)/patterns/dynamic-form/page.tsx`, Color Roles dan Motion di `docs/design/visual-language.md`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:588` | State "semua tersimpan" memakai ikon `ShieldCheck text-highlight`. Menurut Color Roles, status memakai token status (`success`/`warning`/`info`); `highlight` adalah aksen/identitas, bukan status berhasil. Pasangan dirty di baris yang sama sudah benar memakai `text-warning-text` (`page.tsx:586`). | Ikon saved → `text-success` (tokens.css hanya memetakan `--color-success`/`--color-success-foreground` dan `--color-warning-text`; tidak ada `--color-success-text`). Jangan memakai `text-highlight` untuk makna status. |
| 2 | major | `page.tsx:245` | Titik status "Unsaved changes" memakai `animate-pulse` tanpa `motion-reduce:`; animasi berdenyut berjalan terus selama form dirty. Visual language mewajibkan hormat `prefers-reduced-motion`. | Tambah `motion-reduce:animate-none` pada titik pulse. |
| 3 | minor | `page.tsx:433` | Conditional reveal memakai `animate-in slide-in-from-top-1 fade-in duration-200` tanpa varian reduced-motion dan durasi di luar token motion (150/250/400ms). | Tambah `motion-reduce:animate-none` (atau setara yang dipakai halaman peer); samakan durasi ke langkah token terdekat bila tidak mengubah rasa gerak secara material. |
| 4 | minor | `page.tsx:241-255` vs `582-606` | Status dirty/saved tampil dua kali: Badge di `PageHeader actions` dan Card status di kaki form, dengan ikon dan wording berbeda. Hierarki status ganda membingungkan fokus utama (aksi Publish). | Selaraskan ikon/warna kedua tempat (sumber makna sama); pertahankan dua lokasi (header = ringkasan, kaki form = konteks aksi) tapi jangan tampil beda makna. Penghapusan salah satu lokasi hanya bila user meminta. |

## Perubahan yang Diusulkan

Hanya `apps/showcase/src/app/(docs)/patterns/dynamic-form/page.tsx`. Tidak ada perubahan API publik `@ds/ui`, token baru, dependency, atau logika autosave/submit.

## Audit Selector

- Test halaman memilih lewat label dan role tombol `Publish project`; perubahan class ikon/warna tidak menyentuh selector.
- Tidak ada selector e2e yang mereferensi badge status halaman ini.

## Tasks (jalur small-fix)

- [x] Ganti warna ikon status saved ke token status; verifikasi kontras ikon light/dark (≥3:1 untuk ikon) di tema default. — **Sudah teratasi oleh CR-072**: tidak ada ikon status (grep `ShieldCheck` nihil; status teks `text-foreground` di `page.tsx:654`), sehingga kontras ikon tidak relevan; tidak ada `text-highlight` untuk makna status.
- [x] Tambah reduced-motion pada `animate-pulse` (baris 245) dan conditional reveal (baris 433). — `animate-pulse` sudah tidak ada (dihapus CR-072); conditional reveal kini `page.tsx:504` dan sudah memakai `motion-reduce:animate-none`; durasi diselaraskan `duration-200` → `duration-150` (langkah token motion 150/250/400, pilihan user). Root `page.tsx:297` dipertahankan sesuai Keputusan #2.
- [x] Selaraskan ikon/warna status antara header badge dan Card kaki form. — **Sudah teratasi**: status hanya di satu lokasi (Card kaki form, `page.tsx:654`, `role="status"`); `PageHeader` tidak lagi membawa badge/actions.
- [x] Verifikasi: test halaman, guard, `pnpm typecheck`, `pnpm lint`, `pnpm test`.
- [x] Cek visual light/dark + `prefers-reduced-motion` best-effort bila Playwright tersedia. — Playwright tidak tersedia di mesin ini; cek browser dilewati. Perubahan hanya kelas durasi; perilaku reduced-motion sudah ada di kode.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Definisi token CSS tidak diubah; hanya konsumsi di halaman. | Temuan adalah salah pakai peran warna di halaman, bukan definisi token. Terverifikasi: `--color-success` tersedia, `--color-success-text` tidak ada — ikon memakai `text-success` dan kontrasnya dihitung saat eksekusi; jangan menambah token tanpa konfirmasi. |
| 2 | Animasi root `animate-in fade-in-50 duration-200` (`page.tsx:235`) dipertahankan. | Pola root standar showcase yang sudah approved; bukan temuan. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA. (Tidak ada perubahan warna/teks; status memakai `text-foreground` yang sudah ada.)
- [x] Perilaku Radix/a11y tidak rusak.
- [x] API `cva` dan export tetap konsisten. (Tidak ada perubahan `@ds/ui`.)
- [x] State loading, empty, dan error relevan tersedia. (Status draft `empty`/`pending`/`saved`/error tidak berubah.)
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass. (Satu kegagalan baseline `rte-link-save` di `@ds/ui` terbukti ada pada base `visual-polish` tanpa perubahan ini; lihat Eksekusi.)

## Eksekusi

Branch: `cr-083-dynamic-form-status-motion`
Commit: `fix: selaraskan status dan motion dynamic form [CR-083]`

- [x] CR disetujui user (2026-11-25).
- [x] Branch dibuat (`cr-083-dynamic-form-status-motion` dari `visual-polish` `3f33c3d`, worktree `arah-prd`).
- [x] Perubahan diimplementasikan: hanya `page.tsx:504` `duration-200` → `duration-150`. Temuan #1/#2/#4 terbukti sudah teratasi oleh CR-072 di kode saat ini (verifikasi grep + baca kode); pilihan eksekusi dan langkah 150ms disetujui user.
- [x] Verifikasi dijalankan: typecheck hijau; lint 0 error (4 warning pre-existing `@ds/ui`); test targeted halaman 26/26; tokens 10/10, showcase 129/129, api ok; `@ds/ui` 733/734 — 1 gagal `rte-link-save` (`rich-text-editor.test.tsx:587`) terbukti baseline (gagal identik pada base bersih via `git stash`); build showcase hijau. Cek browser dilewati (Playwright tidak tersedia).
- [x] CR di-tick. Status di `docs/BACKLOG.md` tetap `approved` (hanya user yang boleh menetapkan `done`).
- [x] `docs/STATUS.md` diperbarui.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
