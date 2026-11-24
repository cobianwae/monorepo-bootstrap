# CR-071 — Hierarki, Layout, dan Copy Dynamic Form

**Status:** approved  
**Sumber:** audit `/improve-ui` — cluster A  
**Ref:** `docs/design/sitemap.md` (S-005.09), `docs/design/visual-language.md`, `apps/showcase/src/app/(docs)/patterns/dynamic-form/page.tsx`

## Temuan

Lokasi `page.tsx` di tabel merujuk pada route Dynamic Form sebelum perubahan.

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:323–390,582–605` | Pada 320 px, kontrol jadwal melewati viewport dan sisi kanan tombol `Publish project` mencapai sekitar 336 px. Pada 1440 px, form selebar 1.072 px termasuk field teks pendek. | Batasi lebar area kerja di desktop, izinkan isi grid menyusut, dan susun aksi secara vertikal saat ruang sempit. |
| 2 | major | `page.tsx:234–270,323–514` | Dokumen melompat dari `h1` ke lima `h3`; judul kelompok hampir sama dengan label input. Pengguna belum mendapat petunjuk untuk mencoba pola. | Jadikan demo fokus utama, pakai `SectionHeading` untuk `Interactive demo` dan `Try it`, lalu gunakan heading tingkat tiga untuk lima kelompok field. |
| 3 | minor | `page.tsx:235–240,417–452` | Header mengklaim *production-grade*, *real-time validation*, dan *dirty guard* yang tidak direpresentasikan dengan benar. Toggle memberi kesan mengirim email; badge sektor mengulang isi combobox. | Pakai copy Inggris yang menjelaskan perilaku nyata; bedakan simulasi dari pengiriman email; hapus daftar sektor duplikat. |

## Perubahan yang Diusulkan

- **Sebelum → sesudah:** judul teknis panjang dan form lebar → `Dynamic Form` dengan pengantar satu kalimat, area `Interactive demo` yang terukur, lima kelompok berlabel jelas, lalu `Try it` dengan langkah singkat untuk mencoba sektor, notifikasi, anggota, dan validasi. Panduan yang mengandalkan draft stabil diselaraskan di CR-072.
- Ikuti struktur `PageHeader` dan `SectionHeading` dari Overlays & Menus serta Data Display. Jangan menyalin navigasi sticky untuk satu form. Gunakan komponen dan token yang sudah ada; satu aksi utama di footer, aksi reset tetap sekunder.
- Scope: route Dynamic Form dan tes co-located `page.test.tsx`. Halaman pembanding, shell docs, katalog, paket token, dan API `@ds/ui` tidak diubah. Perilaku draft/reset/submit milik CR-072; state anggota, error, dan fokus milik CR-073.

## Tasks

- [x] Rapikan struktur heading, ritme spacing, dan lebar baca tanpa mengubah API `FormSection`. Catatan deviasi: ukuran judul kelompok (h3) tetap `text-sm font-semibold` dari `FormSection` di `packages/ui`; mengubahnya berarti menyentuh `@ds/ui` di luar scope CR ini dan belum dilakukan.
- [x] Rapikan grid jadwal dan footer (`min-w-0` pada grid, aksi footer `flex-col` lalu `sm:flex-row`, form `max-w-3xl`). Uji clipping/scroll horizontal di browser belum dilakukan.
- [x] Ringkas copy Inggris pada pengantar, heading, dan panduan. Demo ditegaskan tidak mengirim email; badge sektor yang berulang dihapus; klaim navigation guard dihapus.
- [x] Tambahkan tes hierarki heading dan copy (`page.test.tsx`, 5/5 lulus). Uji browser pada 320, 390, dan 1440 px, light/dark belum dilakukan.

## Keputusan

| # | Usulan | Alasan |
|---|---|---|
| 1 | Terapkan urutan CR-071 → CR-072 → CR-073 dengan satu CR per sesi. | Ketiganya menyentuh route yang sama; struktur dulu, lalu perbaiki perilaku dan state. |
| 2 | Tetap satu form dengan satu alur, tanpa stepper atau navigasi tambahan. | Pengguna bisa mencoba kontrol tanpa harus menuntaskan tahap lain. |

## Design System Checks

- [ ] Heading, spacing, radius, serta warna mengikuti visual language; `primary` hanya untuk aksi. Tidak ada warna literal atau perubahan API publik.
- [ ] Light/dark tetap terbaca, termasuk callout bersyarat; fokus keyboard dan perilaku Radix tetap berfungsi.
- [ ] Reflow diuji pada data contoh dan state dengan isi panjang; aksi utama tetap utuh dan dapat digunakan.
- [ ] Jalankan `pnpm typecheck`, `pnpm lint`, `pnpm test`, dan `pnpm -C apps/showcase build`; catat baseline terpisah. Gunakan salinan sementara untuk build bila dev server aktif.
  - Hasil: lint hijau; showcase `tsc --noEmit` exit 0; build showcase exit 0; `pnpm typecheck` gagal di `packages/ui` pada 12 error baseline `flow-editor.test.tsx` (sudah tercatat). Dynamic Form test 5/5 lulus.
  - `pnpm test`: `packages/ui` 750/752 saat paralel (2 timeout MindMap undo dan OrgChartEditor undo; keduanya lulus 84/84 saat dijalankan sendiri). Showcase: 4 gagal di `patterns/flow-editor/page.test.tsx` (CR-019 inspector on-demand), gagal sama di `visual-polish` tanpa perubahan CR ini — baseline lama, belum dicatat di STATUS. Dynamic Form tidak ikut gagal.
  - Uji browser (Chromium headless, dev server, 320/390/1440 × light/dark): semula overflow horizontal 3 px pada 320 px karena grid jadwal tanpa `grid-cols-1` mengikuti lebar tombol nowrap. Diperbaiki dengan `grid-cols-1` pada tiga grid form; setelah itu `scrollWidth` = lebar viewport di keenam kombinasi, dan tombol `Reset & clear draft` serta `Publish project` berada di dalam viewport. Screenshot 320 px light diperiksa visual: rapi. Catatan: nilai date picker di `Kickoff date` dan `Engagement window` terpotong ellipsis pada 320 px (perilaku trigger, belum diubah).

## Eksekusi

Branch: `cr-071-dynamic-form-layout-and-copy`  
Commit: `fix: improve dynamic form layout and copy [CR-071]`

- [ ] CR disetujui user dan branch dibuat.
- [ ] Implementasi dan verifikasi selesai; checklist CR dan status di `docs/BACKLOG.md` serta `docs/STATUS.md` diperbarui sesuai workflow.
- [ ] Append `docs/STATUS-LOG.md` (`YYYY-MM-DD — ringkasan — referensi`); jalankan `node scripts/check-status-log.mjs` sebelum commit.
