# Diskusi — Uplift UI halaman Patterns, satu CR per halaman

Status: `draft` · Tanggal: 2026-11-26
Tujuan file: titik masuk setiap sesi CR halaman Patterns, tanpa membaca ulang percakapan.

## Cara memakai di sesi berikutnya

1. Baca bagian **Kesepakatan** dan **Rubrik ringkas**.
2. Ambil satu route dari **Antrean halaman**.
3. Lihat screenshot route itu saja (dan file temuannya bila ada); verifikasi ke kode.
4. Sepakati arah dengan user → tulis satu CR draft → approval → eksekusi di branch CR.

Satu sesi = satu halaman. Tidak ada audit massal lagi.

## Kronologi singkat

1. Review CR-094 (komposisi, 37 route): satu urutan baku dan satu snippet dipaksakan ke halaman yang bentuknya berbeda.
2. CR-094 di-amend (aturan per bentuk halaman), commit `38f3abe` di `pattern-polish`, sudah di-push.
3. Pilot eksekusi pada Dashboard, Rich Text Editor, Image Cropper, Settings. User menerima Dashboard dan menolak sisanya secara desain.
4. Audit visual terhadap prinsip desain: 141 screenshot untuk 37 route. Audit massal dihentikan atas perintah user karena terlalu besar; 13 halaman sempat dinilai.
5. Keputusan: pecah menjadi CR per halaman. CR-096 (Rich Text Editor) ditulis sebagai draft pertama.

## Kesepakatan (dari user)

| # | Kesepakatan | Kutipan |
|---|---|---|
| 1 | Pahami konteks visual tiap halaman; jangan menggeneralisasi. | “gak bisa generalisasi misal dashboard page ama setting semua section dikasih header” |
| 2 | Satu CR per halaman, dimulai dari halaman pilot. | “harus bikin cr perpage sih dimulai dari pilot ini” |
| 3 | Tidak ada halaman acuan atau template, termasuk Dashboard. Nilai terhadap prinsip desain (skill visual/UX) dan `visual-language.md`. | “kalau gw bilang itu jadi acuan ntar lo bener2 ngikutin kayak page itu” |
| 4 | Dua cacat yang paling disorot: heading berlapis untuk satu informasi, dan spacing tanpa ritme. | “informasi cuma satu tapi heading berlapis2”, “spacing … gak dipake ilmunya” |
| 5 | Screenshot yang sudah diambil tetap dipakai; pekerjaan wajib dipecah. | “ini wajib dipecah” |
| 6 | Koheren bukan berarti sama. Yang diseragamkan: art direction, tipografi, style, komponen design system. Susunan mengikuti karakter halaman; referensi boleh dari luar. | “koheren itu bukan berarti sama … bisa berkarya lah” |

Implikasi kerja: tunjukkan usulan desain yang konkret (sketsa, before/after), bukan deretan pertanyaan proses.

## Keputusan yang sudah berlaku

- CR-094 (komposisi) dan CR-095 (visual) menjadi **payung**; tidak dieksekusi sebagai rollout 37 route (CR-094 Keputusan 9). Status keduanya tetap `approved`.
- Eyebrow seluruh route Patterns: `UX Recipe Scenario` (dikonfirmasi user; CR-094 Keputusan 7).
- Copy tetap English (CR-093); dokumen Bahasa Indonesia.
- Kontrol segmented memakai `SegmentedControl` `@ds/ui`; judul section docs memakai `SectionHeading`.
- Sudah diputuskan, jangan dibuka lagi: judul kartu kecil di calendar/org-chart (CR-041, CR-052), kontras eyebrow (CR-046), deviasi h1/weight (CR-051).

## Rubrik ringkas

Versi lengkap: `~/Projects/monorepo-bootstrap-audit/patterns/audit/rubrik.md`.

| Dimensi | Yang dicek |
|---|---|
| D1 Komposisi & density | demo dominan dan muncul lebih dulu; alignment; kartu berlapis; panjang baris (paragraf 45–75, list ≤90 karakter) |
| D2 Hierarki & fokus | satu ide utama; heading benar-benar mempartisi isi; kontras antarlevel; aksi tidak tampak sama dengan state |
| D3 Tipografi | type scale, terkecil `text-xs`; bobot; docs vs demo |
| D4 Warna | aksen terkendali; peran warna; kontras |
| D5 Depth | jumlah lapisan permukaan; card hanya untuk kelompok nyata; pemisah |
| D6 Detail craft | whitespace mikro; kontrol seragam; ikon; angka; dark; mobile; state |

Severity: `blocker` = a11y nyata; `major` = kegagalan hierarki, fokus, komposisi, atau spacing di level halaman; `minor` = lokal.

## Pola lintas halaman (dari 13 halaman)

Dipakai sebagai daftar periksa, bukan resep seragam.

1. Panel atau kartu kontrol simulasi bergaya form menumpuk di sekitar demo dan mendorong demo ke bawah.
2. Teks untuk engineer tampil di halaman (readout debug, identifier mentah, anotasi langkah).
3. Hierarki datar: tanpa h2, beberapa kartu `CardTitle text-sm` setara.
4. Tiga gaya label atau lebih dalam satu halaman.
5. Segmented buatan sendiri bercampur dengan `SegmentedControl`.
6. Teks docs selebar kontainer (±140–150 karakter per baris).
7. Demo terbuka dalam keadaan kosong atau nyaris kosong.
8. Spacing: kode Patterns memakai 11 nilai `space-y` berbeda dan sekitar 11% langkah setengah.

## Antrean halaman

Urutan di bawah adalah usulan; user yang menentukan. Nomor CR diambil saat CR dibuat (berikutnya CR-099).

### Gelombang 1 — halaman pilot

| Route | Status | Inti masalah | Sumber audit |
|---|---|---|---|
| `rich-text-editor` | **CR-096 `done`** | instruksi sebelum demo; tiga kartu setara; 10 tombol kontrol bercampur | `notes-pilot.md`, CR-096 |
| `image-cropper` | **CR-097 `done`** | demo tunggal + simulator State; 5 judul kartu ganda dihapus; tabel audit token keluar; preload + copy Indonesia → CR komponen | `notes-pilot.md`, CR-097 |
| `settings` | **CR-098 menunggu review** | tiga heading untuk satu kelompok isi; dua kartu sama berat; state inti (dirty, invalid, danger) tak punya titik masuk; footer tombol menempel tepi kartu (verifikasi kode) | `notes-pilot.md` |
| `dashboard` | edit disetujui user, **belum di-commit** | aksi aplikasi sudah dipindah dari PageHeader ke toolbar. Sisa minor: toolbar mengambang kanan, label kartu terpotong, ruang kosong kartu feed | `notes-pilot.md` |

### Gelombang 2 — sudah punya file temuan, verdict `buruk`

| Route | Major/minor | Inti masalah |
|---|---|---|
| `permission-matrix` | 5/2 | instruksi sebelum matriks; kontrol state jauh di bawah matriks; empat kartu setara; tiga lapis border |
| `product-tour` | 5/2 | enam langkah bernomor manual sebelum demo; tombol Start tour ganda dan melayang; anotasi di mock |
| `calendar` | 6/2 | panel kontrol dan readout debug ±570px sebelum kalender; view switcher ganda |
| `org-chart-studio` | 5/3 | nama node terpotong; minimap menimpa kartu; panel kontrol form; 13 kartu kecil untuk referensi |
| `flow-editor` | 4/3 | toolbar halaman penuh aksi dan duplikat tema; kartu instruksi sebelum kanvas; label node ±9–10px |
| `org-chart` | 4/3 | nama node tak terbaca di zoom default; mobile hanya satu node; kontrol melayang berlabel identifier |

### Gelombang 3 — sudah dinilai, lebih ringan

| Route | Nilai | Inti masalah |
|---|---|---|
| `dynamic-form` | 3 major (catatan pilot, tanpa verdict) | paragraf pengantar demo tidak sejajar heading; kartu di dalam kartu; 12 heading |
| `file-manager` | `perlu poles` 2/5 | data demo nyaris kosong; kartu Simulate states menumpuk di atas demo |
| `transfer-list` | `perlu poles` 1/3 | chip state lowercase; langkah tanpa judul; ritme root 24px |

File temuan: `~/Projects/monorepo-bootstrap-audit/patterns/audit/findings/<route>.md`.

### Gelombang 4 — belum diaudit (24 route; screenshot sudah ada)

- Form dan alur: `auth`, `cascader-tree-select`, `file-upload`, `import-wizard`, `onboarding`, `stepper`
- Data dan workspace: `activity-feed`, `billing`, `data-table`, `infinite-scroll`, `kanban`, `master-data`, `master-detail`, `notifications`, `virtualized-list`, `workspace`
- Search, komunikasi, state: `command-palette`, `comments`, `global-search`, `mention-emoji`, `optimistic-updates`, `results`
- Editor: `media-gallery`, `mind-map`

Tidak semua halaman harus mendapat CR: bila audit menyatakan `layak`, cukup dicatat di tabel ini.

Catatan: `import-wizard` bersinggungan dengan CR-081 (`approved`, belum dieksekusi).

## CR non-halaman (dipisah dari CR halaman)

### Komponen `packages/ui`

| Masalah | Lokasi | Halaman terdampak |
|---|---|---|
| Nama/jabatan node terpotong; mobile tanpa fit-to-view | `data-display/org-chart.tsx:775–818`, `canvas/org-chart-studio.tsx:777–925` | org-chart, org-chart-studio |
| Teks di bawah 12px (a11y/type scale) | event-calendar, flow-editor, command-palette, notification, kanban, dan lainnya | calendar, flow-editor, dll. |
| `SegmentedControl` terpotong saat lebih lebar dari kontainer | `form/segmented-control.tsx:36` | file-manager, org-chart-studio |
| Format ukuran file hanya KB/MB dengan satu desimal | `data-display/file-manager.tsx:147–150` | file-manager |
| Toolbar editor membungkus tiga baris di mobile | `form/rich-text-editor.tsx` (toolbar) | rich-text-editor |

### Copy Indonesia yang tersisa di `@ds/ui`

CR-093 `done`, tetapi default beberapa komponen masih Indonesia (image-cropper, file-upload, lightbox, flow-editor, org-chart, permission-matrix, notification, sheet, tour, dan lainnya). Inventaris: `~/Projects/monorepo-bootstrap-audit/patterns/cr-093-leftover.md`. Perlu CR sendiri.

## Aset

Folder `~/Projects/monorepo-bootstrap-audit/` (di luar repo dan git, hanya ada di mesin ini); indeksnya di `README.md` folder itu.

- Screenshot: `patterns/audit/shots/patterns_<route>__<light-1440|dark-1440|light-390>__<i>of<n>.png`
- Alat capture ulang untuk before/after: `tools/shot2.mjs <outDir> /patterns/<route>`
- Patch edit Dashboard (cadangan): `patterns/pilot/patches/dashboard-approved.patch`

Keterbatasan screenshot: grafik beranimasi bisa kosong; halaman dengan scroll internal hanya 900px pertama; modal dan popover tidak terbuka.

## Catatan teknis sesi

- Dev server user berjalan di port 4000: jangan dihentikan; `next build` dari salinan sementara.
- Test showcase: `NODE_OPTIONS=--no-experimental-webstorage pnpm -C apps/showcase exec vitest run <filter>`.
- Satu smoke interaktif Rich Text Editor di `packages/ui` flaky sejak sebelum seri ini.
- Auditor paralel (subagent) gagal berulang karena rate limit; tidak dipakai untuk seri ini.

## Belum diputuskan

1. Kapan Dashboard diberi CR kecil dan di-commit.
2. Urutan setelah gelombang 1.
3. Kapan CR komponen dan CR copy dikerjakan relatif terhadap CR halaman (beberapa halaman bergantung padanya).
