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

Branch: `visual-polish`
Commit: `refactor: hapus ikon heading manual di components dan patterns [CR-039]` (dibuat setelah verifikasi di bawah)

Verifikasi:
- Hasil: 78 baris `h-6 w-6 text-highlight` dihapus di 11 file; import lucide yang tak terpakai dibersihkan; 0 sisa.
- Diff: 4 baris ditambah, 123 dihapus (kelas `flex items-center gap-2` di h2 dihapus; h2 tetap manual).
- `pnpm --filter @ds/showcase build:types`, `lint`, `visual-language-guard` (4/4): hijau.
- Screenshot dark Atelier/Pulse: `components/states-feedback`, `patterns/settings` tampak rapi; `patterns/mind-map` belum terkonfirmasi dark (probe tidak menerapkan dark).
- Migrasi lanjutan: 78 `<h2>` di 11 halaman diganti `SectionHeading` (prop `id` ditambahkan ke `SectionHeading` untuk `aria-labelledby`). h2 tersisa di 11 halaman: 0. Verifikasi: build:types, lint, guard hijau; screenshot dark forms dan data-display rapi.
- Belum: 44 `<h2` manual di halaman docs non-foundations lain; light mode untuk 11 halaman belum diverifikasi.
- Impor `SectionHeading` di 11 halaman memakai jalur relatif (`../../../../components/section-heading`), karena `vitest.config.ts` tidak punya alias `@/` dan tes `mind-map/page.test.tsx` gagal resolve. Tidak mengubah konfigurasi test.
- Verifikasi akhir: `pnpm --filter @ds/showcase test` 78/78; `lint` dan `build:types` hijau; `pnpm typecheck` root hanya 12 error baseline `flow-editor.test.tsx`; `pnpm test` penuh: tokens 10/10, ui 706/707 (AC-02 flow-editor batas stack undo 50 gagal di run penuh, lulus 49/49 saat file dijalankan sendiri; diduga flaky di bawah beban, belum dibuktikan berulang); `pnpm -C apps/showcase build` dijalankan dari salinan sementara `apps/.showcase-build` (76/76 halaman statis, lulus); salinan sudah dihapus.
- Light mode terverifikasi (Atelier/Pulse): `components/states-feedback`, `components/forms`, `components/data-display`. `patterns/settings` light tertangkap saat skeleton (belum sah). `patterns/mind-map` light sudah diambil tapi belum dilihat.
- Keputusan tertunda: 44 `<h2>` manual sisa di halaman docs non-foundations (optimistic-updates, calendar, org-chart, results, cascader-tree-select 10, overlays-menus 11, dll.) BUKAN section heading: sebagian besar judul kartu/panel dengan `text-base`/`text-sm`/`text-lg`, dan beberapa punya `ref`/`id` khusus. Mengubahnya ke `SectionHeading` mengubah hierarki per kasus, jadi perlu keputusan user dan CR terpisah (mis. CR-041), bukan migrasi mekanis.
- Catatan proses: pertama kali skrip menghapus koma import dan import yang masih dipakai; keduanya sudah diperbaiki sebelum commit.

- [ ] CR disetujui user.
- [ ] Perubahan diimplementasikan per halaman.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS-LOG.md` di-append dan `node scripts/check-status-log.mjs` hijau.
