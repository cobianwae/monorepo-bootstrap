# CR-054 — Audit menyeluruh seluruh halaman showcase

**Status:** done
**Sumber:** audit
**Ref:** `docs/design/visual-language.md`, `docs/cr/cr-053-audit-visual-components-patterns.md`, `/tmp/cr054/static.json` (hasil `/tmp/cr054/static-audit.mjs`)

## Tujuan

Memeriksa seluruh halaman showcase secara terstruktur (kode + visual) terhadap `docs/design/visual-language.md`. Audit ini hanya menemukan dan mencatat temuan. Perbaikan dibuat sebagai CR terpisah per temuan atau per cluster, setelah audit selesai. Instruksi user “semua halaman” tidak dibatasi pada `components/` dan `patterns/`.

## Cakupan

- Seluruh **73 file `page.tsx`** di `apps/showcase/src/app`: 58 docs (9 components, 37 patterns, 7 foundations, 5 umum), 8 clinic, 5 CRM, 2 landing/scratch. Inventori source/route lengkap: `docs/reviews/cr-054-code-audit.md`.
- Matriks 46 halaman di bawah adalah inventori kandidat awal, bukan status penyelesaian audit atau keseluruhan showcase.
- Pemeriksaan kode statis: aturan dari visual-language (px arbitrer, highlight pada teks kecil, primary dekoratif, solid primary fill, heading manual, ikon di heading, penggunaan SectionHeading).
- Bukti awal: screenshot viewport 1440x1800 dark/light Atelier/Pulse (92 gambar, `/tmp/cr054-shots`).
- Seluruh **73 route** diperiksa visual desktop light setidaknya sebagian. Capture full-document light mencakup 30 route (8 clinic, 5 CRM, 8 components, 7 foundations, contribution, getting-started), lima route umum, serta seluruh **37 patterns** pada batch pemulihan; semuanya sudah dibaca. Batas konten dinamis dan panel scroll internal dicatat di laporan visual.
- Seluruh **146 konfigurasi** desktop dark 1440px dan mobile light 390px (73 route × 2) tersimpan, tervalidasi URL/mode, dan dibaca. Capture tidak membuktikan semua state/interaksi berfungsi.
- Sweep runtime 73 route × 3 konfigurasi lama timeout tanpa JSON tersimpan; progres 150/219 tidak dihitung sebagai bukti kelulusan. Pemulihan 2026-11-23 memakai batch berurutan dengan checkpoint per route/konfigurasi dan verifikasi URL/hidrasi/tema. Screenshot lama dibatasi 24000px, batch pemulihan 30000px; tinggi aktual dicatat per gambar. Panel scroll internal tetap perlu diperiksa terpisah.
- Konsolidasi final dan pemetaan CR turunan: `docs/reviews/cr-054-final-audit.md`; detail visual/runtime: `docs/reviews/cr-054-visual-audit.md`; audit kode dan inventori seluruh halaman: `docs/reviews/cr-054-code-audit.md`.

## Keterbatasan bukti (bukan pengecualian halaman)

- Palet dan art direction selain Atelier/Pulse; belum dicek per halaman.
- Screenshot awal hanya viewport pertama dan bukan bukti cakupan final. Batch pemulihan menambah full-document dark/mobile seluruh route dan light seluruh patterns; halaman dinamis, modal yang menutupi konten, dan scroller internal tetap memiliki batas yang dijelaskan di laporan.
- Probe terarah mencakup Banner, onboarding, RTE, filter pasien, chart, Reveal home, command palette, akhir infinite-scroll, data-table error/retry/empty/clear, lightbox dan validasi form. Seluruh permutasi hover/state/Play/dropdown/DnD/keyboard belum diuji; ini batas audit yang diteruskan ke verifikasi CR turunan, bukan task audit tanpa batas.
- Judul kartu h2 manual (`text-sm/base`) sengaja tidak dihitung sebagai pelanggaran, sesuai CR-041 dan CR-052.

## Hasil audit statis

Hitungan kandidat per halaman, bukan jumlah pelanggaran. `highlight kandidat` menghitung semua baris `text-highlight` (termasuk ikon/hover, tidak membuktikan ukuran teks). `primary kandidat` menghitung baris `text|bg|border-primary` (termasuk aksi sah). `solid primary` hanya pola persis `bg-primary text-primary-foreground`; nilai nol tidak membuktikan seluruh penggunaan primary benar. `h2 berikon` hanya kandidat `<h2` dengan `flex items-center`.

Seluruh 46 pasangan screenshot viewport awal **sudah dibaca**. Matriks berikut mempertahankan snapshot scan awal, bukan penilaian pass/fail atau status audit terkini. **“Belum” pada kolom terakhir berarti capture viewport awal saja belum mencukupi saat itu; bukan halaman yang belum diaudit sekarang.** Posisi final: seluruh 73 route sudah ditriase, termasuk media-gallery loaded dan canvas Studio light loaded pada batch lanjutan. Hasil final ada di laporan konsolidasi; batas interaksi ada di laporan visual.

| # | Halaman | px | highlight kandidat | primary kandidat | solid primary | h2 manual | h3 manual | lg bold | h2 berikon | SectionHeading | Bukti awal mencukupi? (historis, bukan status final) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `components/actions-inputs` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 11 | belum |
| 2 | `components/charts` | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | belum |
| 3 | `components/data-display` | 0 | 8 | 3 | 0 | 0 | 1 | 0 | 0 | 15 | belum |
| 4 | `components/forms` | 0 | 5 | 1 | 0 | 0 | 0 | 0 | 0 | 11 | belum |
| 5 | `components/layout-navigation` | 0 | 22 | 1 | 0 | 0 | 1 | 0 | 0 | 12 | belum |
| 6 | `components/marketing` | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 7 | belum |
| 7 | `components/overlays-menus` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 11 | belum |
| 8 | `components` | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | belum |
| 9 | `components/states-feedback` | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 7 | belum |
| 10 | `patterns/activity-feed` | 0 | 3 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | belum |
| 11 | `patterns/auth` | 0 | 1 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | belum |
| 12 | `patterns/billing` | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | belum |
| 13 | `patterns/calendar` | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 2 | 0 | belum |
| 14 | `patterns/cascader-tree-select` | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | belum |
| 15 | `patterns/command-palette` | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | belum |
| 16 | `patterns/comments` | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 2 | belum |
| 17 | `patterns/dashboard` | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | belum |
| 18 | `patterns/data-table` | 0 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | belum |
| 19 | `patterns/dynamic-form` | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | belum |
| 20 | `patterns/file-manager` | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | belum |
| 21 | `patterns/file-upload` | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | belum |
| 22 | `patterns/flow-editor` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | belum |
| 23 | `patterns/global-search` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | belum |
| 24 | `patterns/import-wizard` | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | belum |
| 25 | `patterns/infinite-scroll` | 0 | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | belum |
| 26 | `patterns/kanban` | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | belum |
| 27 | `patterns/master-data` | 0 | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | belum |
| 28 | `patterns/master-detail` | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | belum |
| 29 | `patterns/media-gallery` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | belum |
| 30 | `patterns/mention-emoji` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | belum |
| 31 | `patterns/mind-map` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | belum |
| 32 | `patterns/notifications` | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | belum |
| 33 | `patterns/onboarding` | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | belum |
| 34 | `patterns/optimistic-updates` | 0 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | belum |
| 35 | `patterns/org-chart-editor` | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 1 | 0 | belum |
| 36 | `patterns/org-chart-studio` | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | belum |
| 37 | `patterns/org-chart` | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 1 | 0 | belum |
| 38 | `patterns/permission-matrix` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | belum |
| 39 | `patterns/product-tour` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | belum |
| 40 | `patterns/results` | 0 | 1 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | belum |
| 41 | `patterns/rich-text-editor` | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | belum |
| 42 | `patterns/settings` | 0 | 6 | 1 | 0 | 0 | 0 | 0 | 0 | 5 | belum |
| 43 | `patterns/stepper` | 0 | 1 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | belum |
| 44 | `patterns/transfer-list` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | belum |
| 45 | `patterns/virtualized-list` | 0 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | belum |
| 46 | `patterns/workspace` | 0 | 1 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | belum |

Ringkasan subset awal: `text-[Npx]` = 0 pada 46 halaman yang dipindai. Kandidat `text-highlight` terbanyak di `layout-navigation` (22), `data-display` (8), `settings` (6), `virtualized-list` (5), `forms` (5). `h2` manual terbanyak di `cascader-tree-select` (10). Seluruh kandidat memerlukan triase konteks sebelum menjadi temuan.

## Temuan

Tabel merangkum cluster dengan severity proyek. ID C/W bukan severity; a11y yang terbukti diberi major, bukan minor. Rasio computed yang belum diukur tidak diklaim pasti dari screenshot. Pemetaan final, koreksi runtime dan batas bukti tersedia di `docs/reviews/cr-054-final-audit.md`.

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| C01 | major | `apps/showcase/src/app/(docs)/components/forms/page.tsx:469`; daftar lintas route di laporan kode | Teks kecil memakai highlight, melanggar aturan visual-language; rasio per elemen belum diukur runtime. | Pertahankan ikon/border highlight; gunakan foreground/warna aksi yang sesuai pada teks. |
| C02–04 | major | `apps/showcase/src/app/(docs)/components/data-display/page.tsx:486`; `(clinic)/clinic/registration/page.tsx:486`; `(crm)/crm/leads/page.tsx:466` | Card/program/lead memakai div klik tanpa semantik dan jalur keyboard pada kontrol tersebut. | Gunakan kontrol native/Radix dengan selected state dan akses keyboard; verifikasi jalur alternatif. |
| C05 | major | `apps/showcase/src/app/(docs)/components/forms/page.tsx:685`; daftar field di laporan kode | Sebagian label/error tidak terhubung ke field, atau field tidak memiliki accessible name. | Hubungkan id/htmlFor, aria-invalid/describedby, dan nama kontrol. |
| C06 | major | `apps/showcase/src/app/(docs)/patterns/onboarding/page.tsx:145` | Modal custom mengklaim aria-modal; runtime dialog terbuka meninggalkan fokus pada body, Tab menuju logo di luar dialog, Escape tidak menutup. Restore belum diuji. | Gunakan Dialog Radix atau perilaku setara; verifikasi initial/trap/restore focus dan Escape. |
| C07 | major | `apps/showcase/src/app/(docs)/patterns/activity-feed/page.tsx:246`; `patterns/notifications/page.tsx:166` | Pilihan/toggle kehilangan semantik state terpilih; indikator unread perlu informasi nonwarna. | SegmentedControl atau kontrol bernama dengan state programatik. |
| C08 | minor | `apps/showcase/src/app/(docs)/patterns/master-detail/page.tsx:359` | No-results belum memiliki CTA pemulihan; struktur child ul perlu diperbaiki. | Tambah clear/reset dan markup list valid dalam CR turunan. |
| C09 | minor | `apps/showcase/src/app/(docs)/patterns/auth/page.tsx:201` | Toggle password tampak hanya sebesar ikon; ukuran sentuh aktual belum diukur. | Ukur target; ikuti target proyek 44px, bukan mengklaim semua target kecil melanggar WCAG 2.1 AA. |
| C10 | major | `apps/showcase/src/app/(docs)/patterns/virtualized-list/page.tsx:217` | Header dan sel virtual berupa div/span tanpa semantik tabel/alternatif setara. | Tentukan model tabel/list yang tepat; jangan menambah role grid tanpa model keyboard. |
| C11 | major | `packages/ui/src/components/feedback/banner.tsx:85` | Runtime tiga halaman membuktikan CTA/dismiss keluar Banner; overlays desktop bahkan melewati viewport 1440px. Capture mobile juga membuktikan Banner keluar viewport pada contribution (852/390), breakpoints (778/390), motion (858/390); root width dapat dipengaruhi elemen lain sehingga atribusi tiap piksel belum diklaim. | Perbaiki layout responsif konten/aksi/dismiss melalui CR turunan; pertahankan akses kontrol di desktop/mobile dan audit seluruh pemakaian. |
| V01 | minor | `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.tsx:33` | Konten awal berisi 44 token kata berdasarkan whitespace, tetapi badge tetap “0 kata”; state awal belum tersinkron. | Sinkronkan statistik saat inisialisasi dan pemuatan contoh; uji tanpa edit terlebih dahulu. |
| C14 | major | `packages/ui/src/components/form/rich-text-editor.tsx:49`–`:53`, `:243`, `:661`, `:897`, `:902` | Runtime mencatat hydration mismatch empty paragraph server vs counter client. Initializer chars mengembalikan 0 tanpa document di SSR tetapi menghitung konten di client. | Initial render SSR/client harus deterministik; uji hydration dengan value nonkosong. |
| C16 | major | `apps/showcase/src/app/(docs)/page.tsx:532`–`:591`; `apps/showcase/src/hooks/use-reveal.ts:16`, `:32`–`:41` | Katalog mobile tetap opacity 0 setelah scroll: target 9689px, observer root 804px, ratio maksimum sekitar 0,083 tidak mencapai threshold 0,15. | Reveal per kelompok atau sentinel dengan threshold terjangkau; uji scroll mobile dari dua arah dan reduced motion. |
| C17 | major | `apps/showcase/src/app/(docs)/layout.tsx:24`; `apps/showcase/src/app/(docs)/patterns/command-palette/page.tsx:119`; `packages/ui/src/components/navigation/command-palette.tsx:72`–`:87` | Aktivasi demo membuka dua dialog karena instance global dan lokal mendengarkan event yang sama. Satu Escape masih menyisakan dialog. | Tetapkan satu pemilik aktivasi per konteks; uji pointer/shortcut dan seluruh siklus keyboard/fokus. |
| V03 | minor | `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.tsx:16` | Gambar contoh `https://contoh.com/gambar.png` terlihat rusak; manifest memastikan complete=true dan naturalWidth=0. | Gunakan asset demo reliable dan verifikasi fallback. |
| C15 | major | `packages/ui/src/components/form/transfer-list.tsx:224`, `:352`; `apps/showcase/src/app/(clinic)/clinic/registration/page.tsx:241`–`:246`; `apps/showcase/src/app/(clinic)/clinic/consultations/page.tsx:215`–`:228`; `apps/showcase/src/app/(crm)/crm/ai/page.tsx:190`–`:203` | Capture terhidrasi 390px: transfer-list root 448px dan panel kanan terpotong; registration root 743px, step 3–5 melewati viewport; label tab consultations bertumpuk dan tabs CRM AI satu kolom terikat tinggi 40px. | Sediakan layout mobile, tinggi adaptif atau overflow lokal tanpa memperlebar dokumen; verifikasi semua kontrol/label dapat dijangkau pointer dan keyboard. |
| C12 | major | `apps/showcase/src/app/(clinic)/clinic/patients/page.tsx:183`, `:197` | Filter tidak punya accessible name. Blank trigger teramati pada probe awal, tetapi capture setelah readiness menampilkan All Programs/All Statuses; kegagalan label persisten belum terbukti. | Beri label/aria-label; reproduksi cold-load sebelum menyimpulkan bug rendering Select. |
| C13 | major | `packages/ui/src/components/form/tree-select.tsx:116`–`:119`, `:205`, `:271`–`:273`; `combobox.tsx:108`–`:117`, `:180`, `:217`; showcase cascader-tree-select `:60`, `:151` dan dynamic-form `:151`, `:349` | Nilai awal single `''` dinormalisasi menjadi `['']`; panjang seleksi 1 menyembunyikan placeholder. TreeSelect menampilkan clear; Combobox memakai fallback label kosong. Screenshot setelah hidrasi memperlihatkan kedua trigger kosong. | Normalisasi empty single value sebagai tanpa seleksi; uji placeholder, clear, pilihan valid dan multiple tanpa mengubah kode selama audit. |
| V02 | major | `apps/showcase/src/app/(docs)/whats-new/page.tsx` | Overflow horizontal terukur: scrollWidth 1470 vs 1440 pada desktop dan 1012 vs 390 pada emulasi mobile. | Identifikasi dan perbaiki baris banner/CTA yang tidak wrap; uji mobile 390px. |
| W01–03, W05–07 | minor | Lokasi lengkap di `docs/reviews/cr-054-code-audit.md` | Drift peran primary/highlight, heading section, segmented manual, literal warna dan skala diagnostik. | Pisahkan per cluster; contoh varian dan judul kartu yang sah tidak ikut diganti. |
| W04 | major | `apps/showcase/src/app/(clinic)/clinic/patients/page.tsx:229`; lokasi lain di laporan kode | Sebagian showcase tabel belum memperagakan loading/error/recovery secara lengkap. | Lengkapi skenario yang relevan; jangan memaksakan fetch-state pada tabel referensi statis. |

## Perubahan yang Diusulkan

Tidak ada perubahan kode di CR ini. Konsolidasi selesai di `docs/reviews/cr-054-final-audit.md`; CR-055–064 dibuat per cluster. CR-054 dan CR-055–064 disetujui user pada 2026-11-23. User mengonfirmasi CR-054 done pada tanggal yang sama karena pekerjaan audit sudah selesai; CR-055–064 tetap approved dan implementasinya belum dimulai.

## Tasks

- [x] Audit statis 46 halaman (grep, `/tmp/cr054/static-audit.mjs`).
- [x] Screenshot viewport awal 46 halaman dark dan light Atelier/Pulse (`/tmp/cr054-shots`).
- [x] Rekonsiliasi inventori seluruh 73 route showcase.
- [x] Audit kode statis seluruh halaman dan triase kandidat warna/heading/semantik (laporan kode; dependency transitif belum seluruhnya diperiksa).
- [x] Baca seluruh 92 screenshot viewport awal; catat observasi dan bukti yang tidak memadai.
- [x] Screenshot full-document desktop dark dan mobile light seluruh 73 route serta validasi manifest; 37 patterns full-document light tambahan. Desktop light route lain tetap memiliki batas capture yang dicatat pada laporan.
- [x] Triase visual seluruh route; hasil final di laporan visual/konsolidasi, bukan kolom kecukupan bukti awal pada matriks historis.
- [x] Triase kode kandidat primary/highlight (bedakan ikon, aksi, hover, display, teks kecil dan dekorasi); pengukuran computed contrast per elemen yang belum dilakukan diteruskan ke CR-055, bukan diklaim lolos.
- [x] Susun temuan dan pecah menjadi CR-055–064 (draft) per cluster.
- [x] Verifikasi dokumentasi: `node scripts/check-status-log.mjs` hijau (90 artefak done); `git diff --check` bersih. Bukan verifikasi ulang suite kode.

### Pemulihan eksekusi runtime

Capture/sweep lama sempat terhenti, termasuk sweep tanpa JSON yang tidak dipakai sebagai bukti lulus. Pemulihan ber-checkpoint menghasilkan 146/146 dark/mobile tersimpan dan dibaca serta 37 patterns full-document light. Probe terarah menutup triase risiko utama, termasuk C16 Reveal home, C17 dua command palette, akhir infinite-scroll, table error/retry/empty/clear dan validasi form. Audit selesai dalam cakupan inventori/visual/triase tersebut, bukan seluruh permutasi state atau sertifikasi WCAG. Batas pembaca layar, zoom, seluruh palet dan operasi canvas/DnD tercantum di konsolidasi final dan CR turunan.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Audit dulu, perbaikan nanti per CR | Permintaan user: selesaikan audit dulu, lalu buat CR satu per satu |
| 2 | Judul kartu h2 manual tidak dihitung pelanggaran | Konsisten dengan CR-041 dan CR-052 |
| 3 | Baseline per halaman Atelier/Pulse; kombinasi lain belum diperiksa | Batas bukti, bukan klaim parity semua tema |
| 4 | Cakupan seluruh showcase; matriks 46 halaman merupakan subset awal | Memenuhi instruksi user “semua halaman”; mengoreksi pembatasan sebelumnya |

## Design System Checks

Checklist berikut adalah kriteria verifikasi **implementasi perbaikan**, bukan task audit yang tertinggal. Tidak dinilai sebagai kelulusan oleh CR audit-only ini; temuan dan verifikasinya diteruskan ke CR-055–064. Checkbox tidak dicentang karena tidak ada perubahan kode atau suite kode baru yang dijalankan.

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA (untuk temuan yang menyentuh teks).
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (audit tidak mengubah kode).

## Eksekusi

Branch: `visual-polish` (audit di-commit langsung di branch ini sesuai instruksi user)
Commit hasil audit: `edd5bea` — `docs: complete showcase audit [CR-054]` (sudah di-push ke `origin/visual-polish`; perapihan dokumen berikutnya dicatat terpisah).

- [x] CR dibuat (draft).
- [x] CR disetujui user (2026-11-23).
- [x] Audit dijalankan dengan batas bukti tercatat.
- [x] Temuan dicatat dan CR turunan dibuat (draft).
- [x] Tasks di-tick dan indeks `docs/BACKLOG.md` diperbarui; status done sesuai konfirmasi user (2026-11-23).
- [x] `docs/STATUS-LOG.md` di-append dan `node scripts/check-status-log.mjs` hijau.
