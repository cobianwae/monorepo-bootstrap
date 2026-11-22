# CR-041 — Rapikan `<h2>` manual sisa di halaman docs non-foundations

**Status:** draft
**Sumber:** review / docs (lanjutan CR-039)
**Ref:** `docs/design/visual-language.md` (Section Heading & Callout), `docs/cr/cr-039-ikon-heading-components-patterns.md`

## Temuan

Setelah CR-039, 44 `<h2>` manual masih ada di 19 file `page.tsx` non-foundations (hitung 2026-11-22):

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | minor | `patterns/cascader-tree-select` (10), `components/overlays-menus` (11) | Dua file menyumbang separuh temuan. | Tinjau per file. |
| 2 | minor | `patterns/optimistic-updates` (2), `calendar` (2), `org-chart` (2), `org-chart-editor` (2), `results` (2), `data-table` (2), dan 1 di 13 file lain | Judul kartu/panel dengan `text-base`/`text-sm`/`text-lg font-semibold`. Bukan section heading. | Tentukan level dan gaya per kelompok (lihat Keputusan). |
| 3 | minor | `patterns/import-wizard`, `org-chart-studio` | Memakai `ref={headingRef}` atau `id` (dipakai fokus/aria). Migrasi harus mempertahankan itu. | Jangan diubah tanpa menjaga `ref`/`id`. |

Konteks: CR-039 hanya menangani heading yang memakai ikon. Sisa ini berbeda sifatnya: sebagian besar judul kartu, bukan section.

## Perubahan yang Diusulkan (menunggu keputusan)

- Section heading level halaman (judul bagian besar) → `SectionHeading` (dengan prop `id` bila perlu).
- Judul kartu/panel → bukan `SectionHeading`. Usulan: `<h3>` dengan gaya `text-base font-semibold` (Heading 3 sesuai visual-language bila ada ≥2 kelompok paralel; bila tunggal, cukup `<p>` atau `<div>` bila tidak perlu heading). Keputusan per file.
- Jaga `ref`, `id`, dan urutan heading (h1 → h2 → h3). Jangan ada h3 tunggal tanpa h2 di atasnya.

## Tasks (dikerjakan per file, setelah keputusan)

- [ ] Keputusan user: aturan per kelompok (lihat Keputusan).
- [ ] Per file: ubah heading, jaga `ref`/`id`, cek urutan heading.
- [ ] Screenshot dark (Atelier/Pulse) per file; light untuk sampel.
- [ ] Verifikasi: `pnpm --filter @ds/showcase test`, `lint`, `build:types`, guard hijau.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Belum ditetapkan: kartu/panel memakai `h3` atau dibiarkan `div` | Mengubah hierarki per kasus; perlu persetujuan user. |
| 2 | Migrasi per file, bukan sekaligus | Mengikuti aturan satu CR = satu cluster dan memudahkan verifikasi. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode.
- [ ] Urutan heading valid.
- [ ] `ref`/`id` yang dipakai fokus atau `aria-labelledby` tetap berfungsi.
- [ ] Guard `visual-language-guard` tetap hijau.

## Eksekusi

Branch: `visual-polish`
Commit: _belum dibuat_ (menunggu keputusan user)

- [ ] CR disetujui user.
- [ ] Perubahan diimplementasikan per file.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS-LOG.md` di-append dan `node scripts/check-status-log.mjs` hijau.
