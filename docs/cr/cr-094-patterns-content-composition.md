# CR-094 — Patterns: susunan konten dan hierarki demo

**Status:** approved (ditetapkan user 2026-11-26; di-amend atas persetujuan user 2026-11-26 — Keputusan 6)
**Sumber:** audit uplift + diskusi user 2026-11-26; review CR-094 2026-11-26
**Ref:** `docs/design/visual-language.md`, CR-093 (cakupan 37 route dan copy English), CR-095, CR-041/CR-052 (judul kartu kecil)

## Temuan

Path pada Temuan #5–#10 relatif terhadap `apps/showcase/src/app/(docs)/patterns/`.

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.tsx:93–134` | Enam langkah instruksi mendahului editor; Studio mendahulukan demo. Perpindahan halaman mengubah urutan memahami/mencoba. | Demo sebagai fokus pertama setelah pengantar; panduan panjang sesudahnya. |
| 2 | major | `apps/showcase/src/app/(docs)/patterns/dashboard/page.tsx:166–210` | Filter periode, reload, dan Export aplikasi berada di PageHeader docs. | Kelompokkan aksi aplikasi dekat isi demo; header docs menjelaskan pattern. |
| 3 | major | `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.tsx:81–89,144–183` | Counter masuk header; simulasi mode/state bercampur sebagai deretan tombol di bawah editor. | Pisahkan identitas halaman, kontrol simulasi, toolbar aplikasi, dan status lokal. |
| 4 | major | `apps/showcase/src/app/(docs)/patterns/settings/page.tsx:401–458`, `org-chart-studio/page.tsx:146–205` (direktori sama) | Settings langsung menjadi aplikasi, Studio memiliki section demo dan panduan. Peran lapisan dokumentasi belum konsisten. Review 2026-11-26: 37 route terbagi tiga bentuk — 12 route dengan section docs `SectionHeading`, 3 route dengan `<section>` tanpa helper, 22 route tanpa `<section>`; heading “Interactive demo” sebagai h2 hanya ada di 5 route (dynamic-form, file-manager, image-cropper, mind-map, org-chart-studio). | Aturan komposisi per bentuk halaman dan kriteria heading docs vs label aplikasi (lihat Perubahan yang Diusulkan). |
| 5 | minor | `dashboard/page.tsx:166–206`, `activity-feed/page.tsx:216–233`, `rich-text-editor/page.tsx:81–90`, `virtualized-list/page.tsx:124–133`, `mind-map/page.tsx:108–113`, `media-gallery/page.tsx:315`, `product-tour/page.tsx:110–115` | `actions` PageHeader dipakai 7 route dengan peran berbeda: aksi aplikasi, status/counter, dan metadata. Temuan #2 hanya menyebut Dashboard. | Kelompokkan kontrol menurut peran dengan lokasi baku per peran, bukan menurut halaman. |
| 6 | major | `rich-text-editor/page.tsx:95,121,193`, `mind-map/_components/mind-map-recipe.tsx:32–33`, `mind-map-shortcuts.tsx:21–23`, `mind-map-use-cases.tsx:14–15`, `onboarding/page.tsx:167`, `settings/page.tsx:446` | Judul area docs yang berperan sama tampil pada level dan gaya berbeda: h2 `SectionHeading` (Studio, dynamic-form, file-manager, image-cropper) vs h3 `CardTitle` `text-sm` (RTE, permission-matrix, product-tour, mention-emoji) vs h2 berikon manual `text-2xl` (mind-map). `SectionHeading` juga dipakai sebagai judul dialog demo (onboarding) dan judul grup tab aplikasi (Settings). | Catat keputusan level per route (docs vs aplikasi) di inventaris Task 1; perubahan gaya heading dieksekusi di CR-095. |
| 7 | minor | `product-tour/page.tsx:118–125` | Enam langkah instruksi dengan nomor diketik manual di `<li>` mendahului demo — sejenis Temuan #1, tidak tercakup. | Demo lebih dulu; langkah percobaan setelah demo memakai `<ol>` asli. |
| 8 | minor | `settings/page.tsx:375,398`, `data-table/page.tsx:325` | Pengantar berupa klaim (“polished”, “Production”) dan daftar fitur — Temuan #3 CR-093 belum dikerjakan, tetapi `cr-093:62` mencatat kedua route “sudah sesuai”. | Pengantar task-led tanpa klaim; selesaikan di CR ini. |
| 9 | minor | `results/page.tsx:127`, `workspace/page.tsx:113`, `auth/page.tsx:137`, `master-data/page.tsx:277`, `comments/page.tsx:936`, `dashboard/page.tsx:165` | Pengantar berupa daftar fitur, sejenis Temuan #8. | Evaluasi di inventaris Task 1; ubah hanya yang terbukti didominasi daftar fitur. |
| 10 | minor | `cascader-tree-select/page.tsx:99`, `calendar/page.tsx:145`, `rich-text-editor/page.tsx:84`, `org-chart/page.tsx:216`, `transfer-list/page.tsx:75`, `product-tour/page.tsx:137` | ID screen/modal tampil di judul, deskripsi pembuka, atau header. Eyebrow PageHeader 4 varian: “UX Recipe Scenario” (28 route), “UX Recipe” (file-manager, org-chart-studio), “Pattern” (image-cropper, import-wizard, permission-matrix), tanpa eyebrow (cascader-tree-select, mention-emoji, transfer-list, flow-editor). | ID pindah ke detail implementasi; satu label eyebrow (Keputusan 7). |

## Perubahan yang Diusulkan

- Cakupan route dan helper lokal mengikuti matriks CR-093. CR-093 sudah terintegrasi (`42436a4`); rincian kata tetap mengikuti aturan CR-093.
- **Kriteria heading (semua bentuk halaman).** `SectionHeading` (h2) hanya untuk judul struktur halaman docs — demo, varian/fitur yang didemokan, Try it, Implementation, Accessibility notes — dan hanya bila section mempunyai isi. Label milik demo (judul board, form, kartu, grup tab aplikasi) tetap bergaya aplikasi dan tidak diangkat menjadi heading docs. Section tidak dibuat hanya untuk memenuhi urutan.
- **Aturan komposisi per bentuk halaman.** Bentuk dibaca dari struktur route aktual, bukan dari nama pattern:

| Bentuk | Route `/patterns/…` | Aturan |
|---|---|---|
| Section docs (12) | billing, cascader-tree-select, comments, data-table, dynamic-form, file-manager, image-cropper, import-wizard, media-gallery, mind-map, org-chart-studio, settings | Urutan **pengantar → Interactive demo → Try it → detail pendukung**. Section opsional; tidak membuat konten kosong atau memaksakan section pada demo sederhana. |
| `<section>` tanpa `SectionHeading` (3) | calendar, flow-editor, org-chart | Calendar dan org-chart sudah demo-first (demo di `calendar/page.tsx:299`, `org-chart/page.tsx:177`; catatan setelahnya). Flow-editor menaruh kartu “How to use the demo” (`flow-editor/page.tsx:300`) sebelum section canvas (`:315`) — dievaluasi di Task 1. Tidak menambah section; penempatan area docs mengikuti kriteria heading. |
| Tanpa `<section>` (22) | activity-feed, auth, command-palette, dashboard, file-upload, global-search, infinite-scroll, kanban, master-data, master-detail, mention-emoji, notifications, onboarding, optimistic-updates, permission-matrix, product-tour, results, rich-text-editor, stepper, transfer-list, virtualized-list, workspace | Halaman = demo; tidak menambah heading “Interactive demo” bila demo adalah satu-satunya isi. Yang diatur: lokasi kontrol menurut peran, dan area docs yang sudah ada ditempatkan setelah demo. |

- Klasifikasi adalah titik awal dari pembacaan kode; Task 1 mengonfirmasi per route dan memilah kelompok 22 route (aplikasi penuh vs demo dengan area docs ber-Card).
- Settings secara struktur masuk bentuk pertama, tetapi section-nya adalah grup tab aplikasi (`settings/page.tsx:446` dst.): berlaku aturan aplikasi penuh — tanpa heading atau section docs baru. Task 1 memeriksa section bernama konten di route lain (mis. billing, data-table): tetap `SectionHeading` bila judul docs, tidak diubah bila label aplikasi.
- Paragraph untuk penjelasan; bullet untuk poin sejajar; numbered list hanya untuk urutan langkah; card untuk unit mandiri/pilihan yang dibandingkan; callout untuk batasan atau informasi penting.
- Deskripsi section tidak mengulang judul. Hindari kumpulan cards/bullets sekadar membuat halaman “penuh”.
- Detail implementasi, recipe, shortcut, dan aksesibilitas tetap tersedia setelah demo bila relevan. Informasi kritis sebelum tindakan tetap dekat kontrol terkait.
- Susunan ulang memakai komponen existing dan markup lokal. Tidak menambah fitur, tab navigasi baru, dependency, atau API publik. Jangan membuat satu template kaku untuk semua jenis pattern.

- **Lokasi kontrol menurut peran.** Default berikut; pengecualian dicatat di inventaris Task 1 beserta alasannya. PageHeader hanya membawa eyebrow, judul, dan kegunaan singkat.

| Peran | Contoh | Lokasi baku |
|---|---|---|
| Aksi aplikasi | filter periode, reload, Export (`dashboard/page.tsx:168–204`) | toolbar demo |
| Kontrol simulasi | mode/state/dataset (`rich-text-editor/page.tsx:144–183`) | satu kelompok di atas demo, tetap di dalam section demo |
| Status/counter lokal | word count (`rich-text-editor/page.tsx:86–88`) | di dalam demo, dekat konten yang dihitung |
| Metadata halaman | ID screen/modal, dependensi, jumlah state/step | detail implementasi |

```text
Bentuk section docs:
PageHeader: judul + kegunaan singkat
Interactive demo
  Kontrol simulasi (bila ada)
  Demo: toolbar aplikasi + konten + feedback lokal
Try it (bila dibutuhkan)
Implementation / Accessibility notes (sesuai konten)

Bentuk tanpa <section> — aplikasi penuh (Dashboard, Settings):
PageHeader: judul + kegunaan singkat          ← tanpa aksi, counter, metadata
Demo (halaman itu sendiri)
  Toolbar aplikasi: filter, reload, Export    ← pindah dari actions PageHeader
  Konten + feedback lokal
Area docs yang sudah ada, setelah demo (bila ada)
```

Snippet berikut hanya untuk bentuk section docs (pola `file-manager/page.tsx:205–208`); tidak diterapkan pada halaman aplikasi penuh.

```tsx
<section id="demo" aria-labelledby="demo-heading" className="space-y-4 scroll-mt-20">
  <SectionHeading id="demo-heading" title="Interactive demo" />
  {/* Kontrol simulasi dan demo existing, tanpa duplikasi toolbar */}
</section>
```

## Tasks (jalur small-fix)

- [ ] Petakan 37 route ke bentuk halaman; catat per route: bentuk, urutan section, fungsi deskripsi/list/card/callout, peran tiap kontrol, level setiap judul (docs vs label aplikasi), eyebrow, dan pengantar; tandai yang sudah sesuai.
- [ ] Susun ulang demo-first dan letakkan kontrol menurut perannya. Pilot satu per bentuk halaman untuk preview user sebelum meluas: Dashboard (tanpa `<section>`), RTE (tanpa `<section>`, dengan area docs), Settings (hanya pengantar; tanpa heading/section docs baru), satu route bentuk section docs yang terbukti perlu ubah menurut Task 1, plus satu pembanding tanpa perubahan (dynamic-form atau org-chart-studio). Preview mencakup light/dark dan mobile.
- [ ] Pertahankan state lokal, event handler, recovery, dirty-state guard, anchor, dan hubungan label/description ketika memindah markup.
- [ ] Rapikan paragraf/bullet/steps/cards menurut fungsi; rincian kata mengikuti CR-093. Pengantar task-led tanpa klaim atau daftar fitur (Temuan #8–#9); ID screen/modal pindah ke detail implementasi dan eyebrow diseragamkan (Temuan #10, Keputusan 7).
- [ ] Audit test, preview before/after, lalu catat hasil per route dan file:line final; teruskan instans gaya heading, presentasi resep, dan ritme root ke CR-095 sebagai input (Keputusan 8).

### Audit test terdampak

- `dynamic-form/page.test.tsx:79–105`: jumlah/level heading dan klaim copy; pertahankan hierarki bermakna, jangan sekadar mengganti hitungan untuk meloloskan test.
- `rich-text-editor/page.test.tsx`: counter, reset, load example, fallback gambar harus tetap bekerja setelah reposisi.
- `permission-matrix/page.test.tsx`: instruksi dan grid harus tetap ditemukan; `master-detail/page.test.tsx`: empty state tetap di dalam list beserta recovery.
- `media-gallery/page.test.tsx`: panel demo/recipe; `mind-map/_components/mind-map-recipe.test.tsx`: resep; import-wizard `page.test.tsx`, `page-copy.test.tsx`, `page-flow.test.tsx`, `_components/accessibility.test.tsx`: alur dan label.
- `import-wizard/page-visual.test.tsx:38`: urutan heading h1 → section h2 → langkah h3 (CR-080); jalankan ulang bila markup Import Wizard digeser.
- Regresi route lain mengikuti inventaris 11 route di CR-093. Dashboard/Settings/Studio belum memiliki `page.test.tsx`; verifikasi browser targeted untuk komposisi, keyboard, responsive. Tambahkan test hanya jika ada risiko perilaku nyata.
- Guard bersama: `apps/showcase/src/test/visual-language-guard.test.ts`; guard bukan bukti kualitas komposisi.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Koherensi isi antarhalaman adalah target; sidebar global bukan scope. | Koreksi user atas interpretasi awal “navigasi beda dunia”. |
| 2 | Semua teks hasil penyusunan ulang English; dokumen kerja Indonesia. | Keputusan bahasa user pada CR-093. |
| 3 | Variasi isi sesuai tugas tetap diperbolehkan. | Calendar, editor, dan form tidak harus punya grid atau jumlah card sama. |
| 4 | CR-080 sudah merged (`72fd85f`), sehingga hierarki Import Wizard adalah baseline; CR-081 (state/data besar) belum dieksekusi. | Evaluasi delta Import Wizard terhadap hasil CR-080 tanpa menduplikasi tasks; area CR-081 tidak disentuh. |
| 5 | Dua lokasi PageHeader Settings adalah cabang loading dan ready, bukan dua h1 simultan. | Pembacaan kode mengoreksi dugaan awal scout; tidak dijadikan temuan. |
| 6 | CR-094 di-amend atas persetujuan user 2026-11-26: satu urutan baku dan snippet diganti aturan per bentuk halaman serta kriteria heading; pilot per bentuk; Temuan #4 naik jadi major; Temuan #5–#10 dari review ditambahkan; tindak lanjut CR-093 (pengantar, eyebrow, ID) digabung ke CR ini, bukan CR terpisah. | Review 2026-11-26 mengonfirmasi koreksi user: “kayak lo gak bisa generalisasi misal dashboard page ama setting semua section dikasih header”. Dashboard dan Settings tidak mempunyai isi docs untuk diberi heading. Preseden amendemen: CR-020. |
| 7 | Satu label eyebrow untuk semua route Patterns; default `UX Recipe Scenario` (28 route; CR-026, CR-029, CR-082), dikonfirmasi user sebelum Task 4. | CR-065/CR-067 memakai `UX Recipe`, tiga route memakai `Pattern`; CR-026 menilai halaman tanpa eyebrow sebagai identitas lemah. CR-046 (kontras eyebrow) tidak dibuka ulang. |
| 8 | Gaya heading (h2 berikon manual, `CardTitle` `text-sm` untuk judul docs), presentasi resep, dan ritme root bukan scope CR ini; instans dicatat di inventaris sebagai input CR-095. | Satu masalah satu CR; CR-095:17 sudah mencakup audit 37 route. Judul kartu kecil `text-sm` di calendar/org-chart tetap sesuai keputusan CR-041/CR-052. |

### Input untuk CR-095 (bukan scope CR ini)

- Heading docs tanpa `SectionHeading`: `mind-map/_components/mind-map-recipe.tsx:32–33`, `mind-map-shortcuts.tsx:21–23`, `mind-map-use-cases.tsx:14–15` (h2 berikon manual; aturan ikon guard masih foundations — CR-052); `rich-text-editor/page.tsx:95,121,193` (h3 `CardTitle` `text-sm`).
- Resep ditampilkan dengan `<pre>` manual: `rich-text-editor/page.tsx:196`, `image-cropper/page.tsx:233`, `permission-matrix/page.tsx:199`, `product-tour/page.tsx:274`, `mind-map/_components/mind-map-recipe.tsx:54`.
- Ritme root bukan `space-y-10`: `product-tour/page.tsx:104`, `transfer-list/page.tsx:38`.

## Design System Checks

- [ ] Heading/section, spacing, token warna, contrast light/dark sesuai arah approved.
- [ ] Perilaku Radix, fokus, urutan keyboard, state loading/empty/error, dan API publik terjaga.
- [ ] Tidak ada pembungkus/card ganda tanpa fungsi; mobile tetap dapat dibaca dan digunakan.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass; smoke build showcase sesuai kondisi server.

## Eksekusi

Branch: `cr-094-patterns-content-composition`
Commit: `fix: align patterns content composition [CR-094]`

- [x] CR disetujui user (2026-11-26); amendemen atas persetujuan user 2026-11-26.
- [x] CR-093 diintegrasikan (`42436a4`).
- [ ] Branch `cr-094-patterns-content-composition` di-fast-forward ke `pattern-polish` (branch yang ada masih di `42436a4`); perubahan diimplementasikan.
- [ ] Preview `pnpm -C apps/showcase dev`, pilot per bentuk halaman + pembanding, screenshot dibaca sebagai image, iterasi bersama user.
- [ ] Verifikasi targeted lalu typecheck → lint → test; build dari salinan sementara bila server user aktif.
- [ ] CR dimutakhirkan sebelum PR; tick → append STATUS-LOG → update BACKLOG/STATUS; check-status-log hijau.
