# CR-094 — Patterns: susunan konten dan hierarki demo

**Status:** draft
**Sumber:** audit uplift + diskusi user 2026-11-26
**Ref:** `docs/design/visual-language.md`, CR-093 (cakupan 37 route dan copy English), CR-095

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.tsx:93–134` | Enam langkah instruksi mendahului editor; Studio mendahulukan demo. Perpindahan halaman mengubah urutan memahami/mencoba. | Demo sebagai fokus pertama setelah pengantar; panduan panjang sesudahnya. |
| 2 | major | `apps/showcase/src/app/(docs)/patterns/dashboard/page.tsx:166–210` | Filter periode, reload, dan Export aplikasi berada di PageHeader docs. | Kelompokkan aksi aplikasi dekat isi demo; header docs menjelaskan pattern. |
| 3 | major | `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.tsx:81–89,144–183` | Counter masuk header; simulasi mode/state bercampur sebagai deretan tombol di bawah editor. | Pisahkan identitas halaman, kontrol simulasi, toolbar aplikasi, dan status lokal. |
| 4 | minor | `apps/showcase/src/app/(docs)/patterns/settings/page.tsx:401–458`, `org-chart-studio/page.tsx:146–205` (direktori sama) | Settings langsung menjadi aplikasi, Studio memiliki section demo dan panduan. Peran lapisan dokumentasi belum konsisten. | Terapkan tata penyajian yang familiar dengan bentuk demo sesuai tugas. |

## Perubahan yang Diusulkan

- Cakupan route dan helper lokal mengikuti matriks CR-093. Eksekusi setelah CR-093 agar copy dan label stabil.
- Urutan dasar: **pengantar → Interactive demo → Try it → detail pendukung**. Section opsional; tidak membuat konten kosong atau memaksakan section pada demo sederhana.
- Paragraph untuk penjelasan; bullet untuk poin sejajar; numbered list hanya untuk urutan langkah; card untuk unit mandiri/pilihan yang dibandingkan; callout untuk batasan atau informasi penting.
- Deskripsi section tidak mengulang judul. Hindari kumpulan cards/bullets sekadar membuat halaman “penuh”.
- Detail implementasi, recipe, shortcut, dan aksesibilitas tetap tersedia setelah demo bila relevan. Informasi kritis sebelum tindakan tetap dekat kontrol terkait.
- Susunan ulang memakai komponen existing dan markup lokal. Tidak menambah fitur, tab navigasi baru, dependency, atau API publik. Jangan membuat satu template kaku untuk semua jenis pattern.

```text
PageHeader: judul + kegunaan singkat
Interactive demo
  Kontrol simulasi existing (bila ada)
  Demo: toolbar aplikasi + konten + feedback lokal
Try it (bila dibutuhkan)
Implementation / Accessibility notes (sesuai konten)
```

```tsx
<section id="demo" aria-labelledby="demo-heading" className="space-y-4 scroll-mt-20">
  <SectionHeading id="demo-heading" title="Interactive demo" />
  {/* Kontrol simulasi dan demo existing, tanpa duplikasi toolbar */}
</section>
```

## Tasks (jalur small-fix)

- [ ] Petakan urutan section, fungsi deskripsi/list/card/callout, dan kepemilikan kontrol seluruh 37 route; catat yang sudah sesuai.
- [ ] Susun ulang demo-first dan letakkan kontrol pada konteksnya; gunakan RTE, Dashboard, Settings sebagai pilot untuk preview user sebelum meluas.
- [ ] Pertahankan state lokal, event handler, recovery, dirty-state guard, anchor, dan hubungan label/description ketika memindah markup.
- [ ] Rapikan paragraf/bullet/steps/cards menurut fungsi; rincian kata mengikuti CR-093.
- [ ] Audit test, preview before/after, lalu catat hasil per route dan file:line final.

### Audit test terdampak

- `dynamic-form/page.test.tsx:79–105`: jumlah/level heading dan klaim copy; pertahankan hierarki bermakna, jangan sekadar mengganti hitungan untuk meloloskan test.
- `rich-text-editor/page.test.tsx`: counter, reset, load example, fallback gambar harus tetap bekerja setelah reposisi.
- `permission-matrix/page.test.tsx`: instruksi dan grid harus tetap ditemukan; `master-detail/page.test.tsx`: empty state tetap di dalam list beserta recovery.
- `media-gallery/page.test.tsx`: panel demo/recipe; `mind-map/_components/mind-map-recipe.test.tsx`: resep; import-wizard `page.test.tsx`, `page-copy.test.tsx`, `page-flow.test.tsx`, `_components/accessibility.test.tsx`: alur dan label.
- Regresi route lain mengikuti inventaris 11 route di CR-093. Dashboard/Settings/Studio belum memiliki `page.test.tsx`; verifikasi browser targeted untuk komposisi, keyboard, responsive. Tambahkan test hanya jika ada risiko perilaku nyata.
- Guard bersama: `apps/showcase/src/test/visual-language-guard.test.ts`; guard bukan bukti kualitas komposisi.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Koherensi isi antarhalaman adalah target; sidebar global bukan scope. | Koreksi user atas interpretasi awal “navigasi beda dunia”. |
| 2 | Semua teks hasil penyusunan ulang English; dokumen kerja Indonesia. | Keputusan bahasa user pada CR-093. |
| 3 | Variasi isi sesuai tugas tetap diperbolehkan. | Calendar, editor, dan form tidak harus punya grid atau jumlah card sama. |
| 4 | CR-080 memiliki hierarki Import Wizard; CR-081 memiliki state/data besar. | Tunggu integrasi atau evaluasi delta tanpa menduplikasi tasks kedua CR tersebut. |
| 5 | Dua lokasi PageHeader Settings adalah cabang loading dan ready, bukan dua h1 simultan. | Pembacaan kode mengoreksi dugaan awal scout; tidak dijadikan temuan. |

## Design System Checks

- [ ] Heading/section, spacing, token warna, contrast light/dark sesuai arah approved.
- [ ] Perilaku Radix, fokus, urutan keyboard, state loading/empty/error, dan API publik terjaga.
- [ ] Tidak ada pembungkus/card ganda tanpa fungsi; mobile tetap dapat dibaca dan digunakan.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass; smoke build showcase sesuai kondisi server.

## Eksekusi

Branch: `cr-094-patterns-content-composition`
Commit: `fix: align patterns content composition [CR-094]`

- [ ] CR disetujui user; CR-093 diintegrasikan.
- [ ] Branch dibuat; perubahan diimplementasikan.
- [ ] Preview `pnpm -C apps/showcase dev`, screenshot dibaca sebagai image, iterasi bersama user.
- [ ] Verifikasi targeted lalu typecheck → lint → test; build dari salinan sementara bila server user aktif.
- [ ] CR dimutakhirkan sebelum PR; tick → append STATUS-LOG → update BACKLOG/STATUS; check-status-log hijau.
