# CR-039 — Hapus ikon heading manual di `components/` dan `patterns/`

**Status:** draft
**Sumber:** review / docs (lanjutan CR-037 untuk halaman di luar foundations)
**Ref:** `docs/design/visual-language.md` (Section Heading & Callout: heading tanpa ikon), `docs/cr/cr-037-sederhanakan-section-heading-tanpa-ikon.md`, `docs/cr/cr-038-text-xs-docs-non-foundations.md`

## Temuan

Inventaris (grep di `apps/showcase/src/app/(docs)`, di luar `foundations`, dihitung 2026-11-22):

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | minor | 11 file `page.tsx` di `components/` dan `patterns/` | 78 baris `h-6 w-6 text-highlight` (ikon di samping heading section). Sebagian ikon dekoratif/acak, sama seperti temuan audit CR-037. | Hapus ikon heading, pakai `SectionHeading` tanpa ikon, sesuai aturan visual. |
| 2 | minor | 122 pemakaian `<h2` di `(docs)` non-foundations | Sebagian heading masih ditulis manual (bukan `SectionHeading`). Tidak semua harus diubah dalam CR ini. | Migrasi bertahap; yang ditangani di CR ini hanya yang memakai ikon. |

Catatan: angka sebelumnya di CR-038 (±81 dan ±128) adalah estimasi. Angka hitung ulang: 78 dan 122.

## Perubahan yang Diusulkan

- Di setiap heading section yang memakai ikon `h-6 w-6 text-highlight`, hapus ikon dan ubah ke `SectionHeading` tanpa ikon (`apps/showcase/src/components/section-heading.tsx`).
- Hapus import ikon yang tak terpakai.
- Tidak mengubah konten teks heading, deskripsi, atau struktur kartu.
- Tidak mengubah `@ds/ui`.

## Tasks (jalur small-fix, dikerjakan per halaman)

- [ ] Persetujuan user untuk rencana ini (menghapus ikon mengubah tampilan semua halaman terkait).
- [ ] Daftar 11 file sebagai batch; kerjakan per halaman, bukan sekaligus.
- [ ] Untuk tiap halaman: ganti heading ke `SectionHeading`, hapus ikon, bersihkan import.
- [ ] Screenshot per halaman (dark Atelier/Pulse, lalu light) dan catat di CR ini.
- [ ] Verifikasi: `pnpm --filter @ds/showcase lint`, `build:types`, `visual-language-guard` hijau.
- [ ] Setelah semua selesai: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build` (dijalankan dari salinan bila dev server aktif).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Satu CR, dikerjakan per halaman | Mengikuti aturan satu CR = satu cluster; risiko visual per halaman rendah bila diverifikasi satu per satu. |
| 2 | Migrasi `<h2` yang tidak memakai ikon tidak masuk CR ini | Scope dijaga; 122 kasus terlalu besar untuk satu CR. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode.
- [ ] Hierarki heading tetap (h1 → h2) dan tidak ada h3 tunggal.
- [ ] Tidak ada regresi a11y (urutan heading, nama accessible).
- [ ] Guard `visual-language-guard` tetap hijau.

## Eksekusi

Branch: `visual-polish` (atau `cr-039-ikon-heading`) setelah disetujui
Commit: _belum dibuat_ (menunggu persetujuan user)

- [ ] CR disetujui user.
- [ ] Perubahan diimplementasikan per halaman.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS-LOG.md` di-append dan `node scripts/check-status-log.mjs` hijau.
