# CR-054 — Catatan triase visual

Tanggal: 2026-11-22–23. Status: pengumpulan dan triase audit selesai dengan batas bukti; bukan persetujuan/done. Konsolidasi final: `docs/reviews/cr-054-final-audit.md`.

## Metode dan batas bukti

Penutupan: 73 source route diperiksa, seluruh 146 konfigurasi desktop dark/mobile light tersimpan dan dibaca, 37 patterns full-document light dibaca. Observasi “belum diuji” pada tabel adalah batas state saat capture, bukan task audit yang diklaim pass. Temuan dipetakan ke CR-055–064 (draft).

Probe interaksi akhir (`cr054-final-interactions.json`) mengonfirmasi data-table error/retry/recovered serta empty/clear. Media lightbox membuka satu dialog dengan fokus di dalam, ArrowRight mengganti item, delapan Tab tetap di dalam, Escape menutup; return focus ke pemicu belum benar pada probe dan dicakup investigasi CR-059. Kanban keyboard hanya membuktikan handle/announcement, bukan reorder karena urutan kolom tidak berubah. Dynamic-form menampilkan summary invalid tetapi tidak menandai field aria-invalid (C05). Crop mobile forms/data-display tidak menghasilkan layout defect tambahan.

- Screenshot awal: `/tmp/cr054-shots/<route>-<mode>-atelier-pulse.png`, desktop 1440×1800, viewport pertama.
- “Dibaca” berarti gambar benar-benar diperiksa; bukan sekadar file tersedia.
- Baseline baru parsial tersimpan di `/private/var/folders/88/r6r62nl52qscq62k_d4vxm980000gn/T/opencode/cr054-evidence`; `inventory.json` dan `manifest.json` memuat route, source, konfigurasi, validasi tema dan kandidat overflow. Capture awal dihentikan setelah dev server tidak merespons; job capture lama tidak berjalan lagi.
- Sweep runtime 73 route × 3 konfigurasi sebelumnya terhenti pada batas waktu proses (log terakhir 150/219 percobaan). Script lama hanya menyimpan di akhir sehingga **tidak ada JSON hasil sweep yang tersimpan**; log progres bukan bukti kelulusan. Timeout navigasi ketika server dev melakukan kompilasi berat dicatat sebagai batas bukti, bukan defect aplikasi.
- Pemulihan 2026-11-23: server direstart sesuai izin sebelumnya; capture dijalankan berurutan dalam batch kecil dengan checkpoint setiap route/konfigurasi di `cr054-resumed/manifest.json` pada direktori sementara sesi. Sebelum capture, script memeriksa URL aktual, keberadaan `main`, props React pada tombol sebagai indikator hidrasi, dan mode light/dark; indikator ini bukan bukti seluruh interaksi bekerja. Screenshot yang disimpan masih harus dibaca sebelum dihitung sebagai inspeksi visual.
- Overflow DOM adalah kandidat, bukan otomatis bug (carousel, canvas, offscreen dan panel scroll dapat sah).
- Tidak ada klaim lolos WCAG dari screenshot. Kontras perlu nilai computed/token; keyboard dan interaksi perlu pemeriksaan runtime.
- Bukti sementara berada di luar git. Temuan dan status pemeriksaan dicatat di dokumen ini agar tetap dapat dilacak.

## Pemulihan 2026-11-23 — full-document desktop light

37 capture berikut telah **dibaca**, bukan hanya disimpan. Mode Atelier/Pulse light, lebar 1440px; URL dan indikator hidrasi/tema diverifikasi sebelum capture. Seluruh capture memiliki `scrollWidth=clientWidth=1440`. File: `cr054-resumed/_patterns_<slug>-1440-light.png`; hasil probe di manifest direktori yang sama. Capture infinite-scroll belum mencakup seluruh feed yang tumbuh dinamis; modal onboarding menutupi halaman di belakangnya. Ini bukan bukti seluruh state/interaksi sudah diuji.

| Route | Tinggi capture | Observasi dan batas pemeriksaan |
|---|---:|---|
| `/patterns/activity-feed` | 1432px | 12 event Today tampil hingga footer “Scroll for more…”, badge 24 events. Filter aktif teal sesuai kandidat C07/W03. Tidak mengklaim seluruh feed termuat: tahap infinite-scroll berikutnya masih perlu diuji. |
| `/patterns/auth` | 1000px | Form Sign In lengkap, email/password/remember/aksi tersedia. Tab Register, OTP, Reset dan simulasi error belum dibuka. |
| `/patterns/billing` | 2027px | Bagian bawah invoice (6 baris), dua metode pembayaran, dan seluruh form billing details tampil tanpa overlap. Teks usage teal dan CTA upgrade tetap kandidat C01/peran warna; aksi save/download belum diuji. |
| `/patterns/calendar` | 2077px | Seluruh month grid, event, panel Pattern notes dan Catatan aksesibilitas tampil. Kontrol demo primary berbeda dari segmented kalender (kandidat W03). Keterangan keyboard bukan bukti walkthrough; mode lain dan detail event masih terbuka. |
| `/patterns/cascader-tree-select` | 1797px | Nilai alamat bertingkat, loading/empty/error dan multiple tags/+2 terlihat. Single Tree Select kosong dengan clear button: source mengonfirmasi nilai awal `''` dinormalisasi menjadi `['']`, menekan placeholder (C13). |
| `/patterns/command-palette` | 1000px | Trigger serta kartu keyboard/search tampil utuh. Overlay tertutup; shortcut/fokus/hasil masih harus diuji. |
| `/patterns/comments` | 1801px | Composer, tiga thread/enam balasan tampil tanpa overlap. Mention, edit dan aksi belum diuji. |
| `/patterns/dashboard` | 1056px | Empat KPI, chart tujuh bar dan empat aktivitas tampil. Label revenue terellipsis; bukan chart kosong. |
| `/patterns/data-table` | 1923px | Lima baris, pagination, saved views dan tabel varian/density tampil. Trigger rows-per-page kosong meski page 1 of 7; kandidat perlu probe seperti C12. Loading/error belum diuji. |
| `/patterns/dynamic-form` | 1929px | Enam kelompok dan footer publish tampil. Owner kosong dikonfirmasi C13: Combobox fallback label `''` menekan placeholder; role Admin/Editor tampil. Validasi/autosave/dirty guard belum diuji. |
| `/patterns/file-manager` | 1626px | Kontrol state, shell tiga panel, quota dan catatan a11y tampil; satu file pedoman.docx. Grid/preview/modal/error belum dibuka. |
| `/patterns/file-upload` | 1267px | Empty dropzone, kontrol demo, slider dan toggle tampil. Upload/error/cancel/reorder belum diuji. |
| `/patterns/flow-editor` | 1272px | Lima node/empat edge, palette, toolbar dan minimap tampil. Clip canvas internal bukan bukti overflow halaman; operasi/keyboard belum diuji. |
| `/patterns/global-search` | 1000px | Input kosong dan enam suggestion tampil; hasil pencarian belum diuji. |
| `/patterns/import-wizard` | 1747px | Tahap Upload, continue disabled, kontrol demo dan recipe callback lengkap. Parse/mapping/validation belum diuji. |
| `/patterns/infinite-scroll` | 1612px | Snapshot menunjukkan 24/40; feed bertambah setelah tinggi diukur sehingga gambar berakhir di tengah feed. Batas capture, bukan defect; perlu inspeksi end state. |
| `/patterns/kanban` | 1000px | Empat kolom/enam kartu dan dropzone Done kosong tampil. Dev indicator “1 Issue” perlu ditelusuri console sebelum menyimpulkan defect; DnD belum diuji. |
| `/patterns/master-data` | 1000px | Lima baris, kategori dan aksi tampil. Drawer/edit/delete belum diuji. |
| `/patterns/master-detail` | 1000px | Lima tiket dan detail belum dipilih tampil. Seleksi, mobile dan filter empty belum diuji. |
| `/patterns/media-gallery` | 1470px | Seluruh 12 tile dan panel lightbox/keyboard terlihat; loaded gallery terwakili. Dialog, filter dan bulk selection belum diuji. |
| `/patterns/mention-emoji` | 1025px | Dua pesan, composer dan kontrol state terlihat. Mention/emoji popover dan pengiriman belum diuji. |
| `/patterns/mind-map` | 2948px | Canvas terisi, minimap, panel pohon tertutup, use case, flow, panduan keyboard dan recipe tampil hingga bawah. Canvas clip bukan overflow halaman; walkthrough keyboard belum dilakukan. |
| `/patterns/notifications` | 1104px | Enam item inbox, dua preferensi dan empat aktivitas tampil. Selected/read semantics tetap C07; toggle/tab belum diuji. |
| `/patterns/onboarding` | 1000px | Modal checklist empat item, 0%, skip/later/close terlihat; halaman di belakang tertutup. C06 tetap berlaku; dismiss lalu inspeksi halaman belum dilakukan. |
| `/patterns/optimistic-updates` | 1000px | Empat switch, empat starred files dan reset terlihat; success/rollback belum diuji. |
| `/patterns/org-chart-editor` | 1645px | Callout deprecated, kontrol state, canvas terisi pada 50%, minimap dan petunjuk lengkap. Clip internal canvas bukan root overflow; operasi belum diuji. |
| `/patterns/org-chart-studio` | 2504px | Canvas loaded enam node, kontrol/minimap pada 126%, recipe dan panduan keyboard tampil lengkap. Operasi belum diuji. |
| `/patterns/org-chart` | 1515px | Callout deprecated, diagram 40 node pada 100% dan petunjuk tampil; pan/fit/search belum diuji. |
| `/patterns/permission-matrix` | 1924px | Lima resource × lima role tampak, panduan keyboard, state panel dan recipe lengkap. Copy “5×8” perlu dicocokkan dataset; bukan temuan final. |
| `/patterns/product-tour` | 2330px | Target dashboard, seluruh kontrol demo/recipe/panduan keyboard tampil; spotlight tertutup, walkthrough belum diuji. |
| `/patterns/results` | 1000px | Empty state, Clear search dan tiga kartu penjelasan terlihat; 403/error belum dibuka. |
| `/patterns/rich-text-editor` | 2096px | Toolbar lengkap, dokumen awal dan recipe tampil. Badge 0 kata tetap V01; gambar contoh rusak V03. Manifest mencatat hydration mismatch eksplisit pada empty/counter (C14), berbeda dari delay Reveal. |
| `/patterns/settings` | 1000px | Profile beserta footer lengkap; empat tab lain belum dibuka. |
| `/patterns/stepper` | 1000px | Tahap Organization, empat step dan continue terlihat; tahap berikut/validasi belum diuji. |
| `/patterns/transfer-list` | 1000px | Badge 12 available (enam tampak dalam scroller), tiga selected, filter dan petunjuk terlihat; transfer/scroll/keyboard belum diuji. |
| `/patterns/virtualized-list` | 1273px | Badge 21 mounted, sembilan row tampak, footer dan Why windowing lengkap; scroll 10k/search/mobile belum diuji. C10 tetap berlaku. |
| `/patterns/workspace` | 1000px | Explorer empat file, code/terminal dan status container terlihat; drawer mobile/commands/build belum diuji. |

## Pemulihan 2026-11-23 — dark/mobile

**Checkpoint terbaru:** seluruh **146/146** konfigurasi tersimpan dan dibaca (73 route × dark desktop/mobile light); bukan angka kelulusan. Gambar dokumen sangat tinggi hanya cukup untuk inspeksi susunan keseluruhan, bukan verifikasi detail teks kecil. Bagian bawah `/` mobile tetap tersembunyi setelah probe scroll lambat; feed dinamis dan panel scroll internal belum lengkap.

### Penutupan pembacaan desktop dark dan probe reflow

Tambahan 34 gambar dark telah dibaca: data-table, dynamic-form, file-manager, file-upload, flow-editor, global-search, import-wizard, infinite-scroll, kanban, master-data, master-detail, media-gallery, mention-emoji, mind-map, notifications, onboarding, optimistic-updates, org-chart-editor, org-chart-studio, org-chart, permission-matrix, product-tour, results, rich-text-editor, settings, stepper, transfer-list, virtualized-list, workspace, getting-started, guidelines, home, whats-new, dan landing.

- Data table: lima row, saved views, semua variant/density terlihat; Rows per page tetap blank, kandidat belum didiagnosis. Owner dynamic-form blank sesuai C13.
- File manager: tiga pane, satu dokumen, quota dan panduan lengkap. Upload: dropzone kosong, slider/toggle dan panduan lengkap. Flow editor: lima node/empat edge, palette/minimap dan toolbar terlihat; batas kanvas bukan root overflow.
- Global search: enam saran awal; import: seluruh form Upload, empat langkah dan recipe terlihat. Infinite scroll: capture 24/40 terpotong akibat pertumbuhan feed; akhir feed belum diperiksa.
- Kanban: empat kolom/enam kartu dan empty Done terlihat; dev “1 Issue” belum didiagnosis. Master data: lima row lengkap; master-detail: lima tiket dan detail belum dipilih. Media gallery: 12 tile loaded dan trigger lightbox tertutup.
- Mention: dua pesan/composer terlihat. Mind map: 12 ide dalam canvas light bersarang di shell dark, panduan/recipe lengkap; bukan otomatis kegagalan tema. Notifications: enam item, preferensi dan timeline muat desktop.
- Onboarding: modal empat checklist menghalangi halaman dasar; C06 tetap berlaku. Optimistic: empat toggle/empat file terlihat. Ketiga org chart: canvas terisi, state controls dan panduan lengkap; node di luar viewport kanvas perlu pan/fit, bukan otomatis defect dokumen.
- Permission matrix: lima resource/lima role terlihat, teks skenario menyebut 5×8 masih perlu rekonsiliasi. Product tour: dashboard target/state panel/recipe lengkap, spotlight belum dibuka. Results: empty state dan tiga kartu penjelas lengkap.
- RTE: toolbar/document/recipe lengkap, V01/V03 tetap terlihat. Settings hanya Profile; stepper hanya Organization. Transfer list dua panel lengkap pada desktop; virtualized list 21 mounted/row awal dan panduan terlihat; workspace explorer/editor/terminal lengkap.
- Getting started/guidelines: semua panel lengkap; code block lokal perlu uji scroll/copy. Home dark: katalog terlihat sampai akhir. Whats-new: Banner keluar panel (C11/V02). Landing: hero sampai footer terlihat; teks kecil perlu crop/numeric contrast, bukan klaim lolos dari gambar.

Probe runtime 390px (`cr054-reflow-detail.json`) membedakan overflow dokumen dari scroller lokal:

| Route | Bukti ukuran | Interpretasi terbatas |
|---|---|---|
| `/clinic/patients` | Header client 390, scroll 454; tabel client 340, scroll 1040 dengan `overflow-x:auto` | Overflow shell berasal dari header yang tidak menampung isi; tabel memiliki scroller lokal dan bukan bukti bug tersendiri. Source `scenarios/clinic/components/clinic-header.tsx:76`. |
| `/patterns/calendar` | Root 730/390; `rdp-root` dan wrapper month client 342, scroll 706, overflow visible | Month calendar memperlebar dokumen; penyebab ukuran sel perlu isolasi, bukan time-grid scroller. |
| `/patterns/import-wizard` | Root 600/390; Stepper `ol` client 292, scroll 551, overflow visible | Stepper meluber; code `pre` memakai scroller lokal, jangan disamakan. Caller `page.tsx:210`. |
| `/patterns/notifications` | Root 461/390; grid client 342, scroll 437, overflow visible | Grid/card minimum content memperlebar dokumen; isolasi child diperlukan. Caller `page.tsx:209`. |
| `/patterns/transfer-list` | Root 448/390; row dua panel client 294, scroll 399; empty toast viewport juga selebar 448 | C15 terkonfirmasi, tetapi seluruh 448px tidak boleh diatribusikan ke row saja; periksa viewport toast terpisah. |
| `/` | Root 390/390; sesudah scroll lambat Reveal pertama true, katalog false/opacity 0 | C16 terkonfirmasi dengan observer: target 9689px, root 804px, ratio 0,08298 meski intersecting. Threshold 0,15 tidak tercapai; katalog tetap tersembunyi, bukan timing capture. |

Pembacaan ini hanya mencakup state yang tampak. Operasi, alternatif tab/modal, akhir feed, detail teks kecil dan keyboard walkthrough yang belum diuji tetap terbuka.

Delapan dark patterns tambahan dibaca: activity-feed (12 event dan footer), auth (Sign In), billing (plan, enam invoice, dua metode dan form), calendar (month grid/event dan kedua catatan), cascader-tree-select (seluruh state; C13 tetap), command-palette (trigger/petunjuk, overlay tertutup), comments (composer, tiga thread/enam reply), dashboard (empat KPI, tujuh bar dan empat aktivitas). Seluruh susunan awal lengkap tanpa overlap halaman desktop baru; operasi dan state alternatif belum diuji. Dashboard dark menampilkan bar, sehingga capture mobile tanpa bar tetap kandidat timing.

Tambahan inspeksi yang menutup seluruh route mobile:

| Route mobile | Observasi dan batas |
|---|---|
| `/patterns/kanban` | Kolom pertama berisi tiga kartu, kolom berikut sebagian di scroller lokal; DnD/keyboard belum diuji. |
| `/patterns/master-data` | Lima row tampil, kolom kode/nama sangat sempit; tab dan aksi kanan perlu scroll lokal. Drawer belum diuji. |
| `/patterns/master-detail` | Lima tiket dan pencarian tampil; sheet detail belum dibuka. |
| `/patterns/media-gallery` | Dua kolom, 12 tile loaded dan petunjuk lightbox lengkap; dialog belum dibuka. |
| `/patterns/mention-emoji` | Dua pesan, composer dan kontrol lengkap; picker belum dibuka. |
| `/patterns/mind-map` | Canvas 12 ide pada 50%, toolbar, seluruh recipe dan panduan terlihat; pohon alternatif masih tertutup. |
| `/patterns/notifications` | Root 461/390; aksi atas, teks dan toggle preferensi keluar batas kanan. Atribusi source/scroll masih perlu probe; kandidat reflow, bukan penyebab final. |
| `/scratch` (juga dark) | Dua specimen Aa dan Control h3 muat; route nonproduksi. |
| `/patterns/onboarding` | Checklist empat item dan footer muat; modal menutupi halaman dasar. C06 tetap berlaku. |
| `/patterns/optimistic-updates` | Empat switch, empat file dan reset lengkap; rollback/success belum diuji. |
| `/patterns/org-chart-editor` | Kontrol membungkus, canvas pada 50%, panduan lengkap; clip node internal bukan root overflow. |
| `/patterns/org-chart-studio` | Canvas, kontrol, recipe dan keyboard guide terlihat; operasi belum diuji. |
| `/patterns/org-chart` | Diagram 40 node pada viewport awal dan seluruh petunjuk terlihat; pan/fit belum diuji. |
| `/patterns/product-tour` | Kontrol, dashboard target, state panel dan recipe lengkap; spotlight belum dibuka. |
| `/patterns/results` | Empty state dan tiga penjelasan lengkap; 403/error belum dibuka. |
| `/patterns/settings` | Pemilih Profile, seluruh field dan footer lengkap; tab lain belum diuji. |
| `/components/actions-inputs`, `/components/forms`, `/components/data-display`, `/components/layout-navigation`, `/components/marketing`, `/components/overlays-menus`, `/components/states-feedback` | Seluruh susunan section hingga bawah terlihat pada gambar tinggi; Banner tetap terpotong (C11), beberapa tabel/menu memakai scroll lokal. Detail teks kecil memerlukan crop; overlay dan kontrol belum seluruhnya diuji. |
| `/components/charts` | Sparkline, bar, line dan donut tampil; area/stacked tampak belum terisi saat capture, tetap kandidat timing seperti bukti runtime sebelumnya. |
| `/patterns/infinite-scroll` | 16/40 dan loading more terlihat; end-of-feed belum tercakup, bukan defect pemotongan. |
| `/foundations/colors`, `/foundations/themes`, `/foundations/typography` | Checker/katalog, pilihan art direction/tone/matriks, dan specimen/scale/prose tersusun sampai bawah. Matriks padat dan code perlu uji scroll/crop, tidak membuktikan kontras numerik. |
| `/` | Hero dan tiga kartu atas terlihat; bagian bawah tetap kosong karena Reveal pada capture. Perlu scroll lambat dan inspeksi ulang, belum dihitung sebagai bagian bawah yang lulus. |
| `/landing` | Hero, tiga voice, craft, recipe, dua app, stats dan footer tampil lengkap; operasi belum diuji. |
| `/whats-new` | Changelog lengkap, Banner tetap keluar viewport (V02/C11); root 1012/390. |

Probe interaksi tambahan (`cr054-states.json`, 2026-11-23):

- Data table: klik Reload menghasilkan 36 elemen skeleton, lalu jumlah row seluruh dokumen kembali 26 (mencakup tabel contoh lain). Pemicu error menghasilkan tombol Retry Request, tetapi pencocokan teks global “Error States” bukan bukti pesan error spesifik; retry dan empty masih perlu diperiksa.
- RTE: 14 tombol toolbar bernama aksesibel tampil. Badge tetap 0 kata, counter 328/10000 (V01). Gambar masih pending pada probe ini; bukti complete/naturalWidth=0 sebelumnya tetap V03.
- Dialog Edit Security Permissions: benar-benar terbuka, fokus awal di input dalam dialog; satu Tab tetap di dalam. Escape menutup dan mengembalikan fokus ke pemicu. Ini pass terbatas, **bukan** pembuktian seluruh siklus focus trap atau semua overlay.

Pada batch awal, satu capture `/clinic/appointments` desktop dark (1440×1808) sudah dibaca: sembilan kartu appointment tampil, filter All Disciplines terlihat; kolom kelima berada di scroller horizontal, bukan root overflow (`scrollWidth=clientWidth=1440`). Operasi board dan jangkauan scroll belum diuji. Capture mobile awal gagal readiness; hasil ulang yang valid dicatat di bawah.

Batch tersebut kemudian selesai dengan **42/146 konfigurasi dark/mobile tersimpan, 104 gagal** (angka “79 saved” pada stdout termasuk 37 desktop-light sebelumnya). Koneksi server sempat putus, lalu pulih; capture gagal tidak dihitung sebagai inspeksi. Pengulangan dibatasi 20 percobaan per batch dan berhenti setelah tiga error koneksi berturut-turut.

Lima screenshot mobile tambahan telah dibaca:

| Route | Observasi |
|---|---|
| `/patterns/virtualized-list` | Root 731/390, header PRODUCT/CATEGORY bertumpuk, kolom kanan melewati viewport. R01 kini terkonfirmasi pada 390px, bukan atribusi orb pada probe lama 320px. |
| `/patterns/transfer-list` | Root 448/390; panel Role members/input kanan terpotong. C15. |
| `/clinic/registration` | Root 743/390; lima langkah tidak menyesuaikan card, langkah 3–5 keluar viewport. Form awal terbaca; langkah berikut belum dibuka. C15. |
| `/clinic/patients` | Form filter dan delapan row terlihat; tabel memiliki scroller lokal, bukan otomatis bug karena kolom di luar viewport. Root 454/390 masih perlu atribusi shell/header. Label kedua Select sudah tampil setelah readiness; kualifikasi timing C12 dicatat pada audit kode. |
| `/crm/contact-center` | Daftar conversation dan filter tampil pada mobile, panel detail tidak tampak pada state awal. Root 392/390; seleksi conversation dan akses composer belum diuji. |

Empat screenshot mobile berikut juga telah dibaca: `/patterns/permission-matrix` menampilkan grid dalam scroller lokal, seluruh state panel/recipe terlihat (navigasi kolom belum diuji); `/patterns/rich-text-editor` toolbar wrap dan konten lengkap, V01/V03 tetap terlihat, dialog gambar/link belum diuji; `/patterns/workspace` explorer menjadi trigger drawer, editor/terminal terlihat, drawer belum dibuka; `/patterns/stepper` memakai susunan langkah vertikal yang muat 390px, form Organization/footer lengkap, tahap lanjut belum diuji. Tidak ditemukan root overflow pada keempat konfigurasi ini.

Batch ulang pertama selesai: **20/20 percobaan berhasil**, sehingga **62/146 konfigurasi dark/mobile tersimpan** (99 termasuk 37 light patterns). Batch berikut dibatasi 20 percobaan lagi. Tersimpan tidak berarti sudah dibaca atau lulus.

Sepuluh capture mobile berikut juga sudah dibaca:

| Route | Observasi |
|---|---|
| `/clinic` | Empat KPI, spotlight pasien, dua grafik, schedule dan audit feed terlihat sampai bawah. Header kanan terpotong; root 454/390 perlu atribusi shell. |
| `/clinic/consultations` | Kartu pasien dan SOAP form/riwayat lengkap; tiga label tab workspace bertumpuk pada satu baris (C15). Form dan penyimpanan belum diuji. |
| `/clinic/pos` | Delapan produk dan invoice kosong/tender/footer lengkap; add/payment belum diuji. Root 454/390 dan header kanan terpotong, seperti shell clinic lain. |
| `/clinic/reports` | Seluruh KPI, tiga grafik dan outcome highlights terlihat. Teks outcome kecil tetap kandidat C01; export belum diuji. |
| `/clinic/treatments` | Enam row dan filter terlihat, kolom kanan tabel di scroller lokal; tidak otomatis defect. Shell root 454/390 tetap terbuka. |
| `/clinic/appointments` | Lima kartu kolom Scheduled terlihat sampai bawah; kolom lain di scroller board. Select discipline keluar card filter pada 390px, menguatkan kandidat reflow toolbar R01. Dev indicator “1 Issue” bukan diagnosis; manifest tidak mencatat exception. |
| `/crm/ai` | Empat KPI, slider scoring dan calculated score lengkap; TabsList satu kolom tetap `h-10`, label Draft Sandbox turun di luar bar dan tab ketiga tidak tampak pada capture (C15). Perlu uji fokus semua tab. |
| `/crm/campaigns` | Enam kartu, filter dan semua aksi awal terlihat sampai bawah; operasi create/pause/delete belum diuji. |
| `/crm/leads` | Dua kartu New Inbound terlihat, kolom lain di scroller lokal. Filter dan switch Kanban/Table terlihat; operasi dan detail belum diuji. |
| `/crm` | Revenue chart, funnel, radar, omnichannel dan live activity tampil sampai footer. Root 392/390; selisih kecil belum diatribusikan. |

Delapan capture desktop dark tambahan sudah dibaca: `/clinic`, `/clinic/consultations`, `/clinic/patients`, `/clinic/pos`, `/clinic/registration`, `/clinic/reports`, `/clinic/treatments`, dan `/crm/ai`. KPI, form, tabel dan canvas awal tampil tanpa overlap halaman; label filter pasien dan tab desktop tampil. Lima step registration muat pada desktop. Pada reports, sumbu/legenda tampil tetapi bar/donut belum terlihat pada capture ini; karena render chart pernah terbukti lewat runtime, ini tetap kandidat timing, bukan defect baru. Operasi interaktif belum diuji. Total pemulihan yang sudah dibaca: 19 mobile dan sembilan desktop dark.

Batch kedua juga berhasil **20/20**, sehingga **82/146 konfigurasi dark/mobile tersimpan**; batch berikut dibatasi 20 percobaan. Dua belas capture tambahan sudah dibaca (total pemulihan: **25 mobile dan 15 dark**):

| Konfigurasi / route | Observasi |
|---|---|
| Dark: `/crm/campaigns` | Empat KPI, filter dan enam kartu lengkap; pause/launch/delete belum diuji. |
| Dark: `/crm/contact-center` | Tiga panel, conversation terpilih, saran respons dan composer terlihat. Riwayat chat berada dalam scroller; resize/send belum diuji. |
| Dark: `/crm/leads` | Empat kolom awal board terlihat; kolom lain di scroller lokal. Table/detail/drag belum diuji. |
| Dark: `/crm` | Revenue chart, funnel, radar, omnichannel dan activity lengkap. Badge hotspot menyisakan label stage sangat pendek; kandidat density/ellipsis, belum defect final. |
| Mobile: `/components` | Seluruh delapan kartu katalog dan hero/CTA lengkap; tanpa overlap halaman. CTA highlight tetap W07. |
| Mobile: `/contribution` | Kartu konvensi dan checklist lengkap; Banner keluar viewport, root 852/390, manifestasi C11. |
| Mobile: `/foundations/breakpoints` | Scale, tiga recipe dan z-index lengkap; Banner keluar viewport, root 778/390, C11. Code recipe terpotong dalam panel perlu uji scroll lokal. |
| Mobile: `/foundations/motion` | Duration/easing/directional/reduced-motion lengkap; Banner keluar viewport, root 858/390, C11. Badge kepatuhan juga terpotong; kontribusi terhadap overflow perlu dipisahkan saat perbaikan. Play belum diuji. |
| Mobile: `/foundations/spacing` | Delapan spacing, enam radius dan empat elevation tampil sampai bawah; root 390/390. |
| Mobile: `/foundations/iconography` | Empat size, 54 ikon dan kedua contoh a11y tampil lengkap; root 390/390. |
| Dark: `/contribution` | Banner, empat kartu dan checklist lengkap; tidak ada overlap halaman pada desktop. |
| Dark: `/components` | Hero, dua CTA dan delapan kartu lengkap; tidak ada overlap halaman. |

Batch ketiga berhasil 20/20, sehingga 102/146 konfigurasi dark/mobile tersimpan sebelum batch berikut dilanjutkan. Sebelas capture mobile tambahan telah dibaca (total pemulihan: **36 mobile dan 15 dark**); angka tersimpan bukan angka lulus:

| Route mobile | Observasi |
|---|---|
| `/patterns/calendar` | Root 730/390; month grid melewati viewport, kolom kanan tidak terlihat pada capture. Toolbar dan panel catatan lengkap. Caller `patterns/calendar/page.tsx:276`, month grid `event-calendar.tsx:1375–1400`; perilaku scroll dan penyebab ukuran perlu probe, bukan disimpulkan dari gambar saja. |
| `/patterns/auth` | Form Sign In lengkap; reset tab berada di luar bagian awal bar horizontal. Scroll/tab lain dan error belum diuji. |
| `/patterns/billing` | Plan, usage, enam invoice, payment cards dan form lengkap; aksi tabel berada dalam panel horizontal, scroll belum diuji. |
| `/patterns/activity-feed` | Dua belas event Today terlihat; kolom teks sempit karena badge di kanan, tanpa overlap. Pagination/filter belum diuji. |
| `/getting-started` | Lima guide, code blocks dan callout lengkap; scroll lokal code belum diuji. |
| `/guidelines` | Empat principle cards dan do/don't lengkap, tanpa overlap halaman. |
| `/patterns/cascader-tree-select` | Seluruh contoh dan petunjuk lengkap; single TreeSelect tetap kosong dengan clear (C13), state loading/empty/error terlihat. Popover dan keyboard belum diuji. |
| `/patterns/command-palette` | Trigger dan dua panel petunjuk lengkap; dialog masih tertutup, shortcut/fokus belum diuji. |
| `/patterns/comments` | Composer, tiga thread dan enam reply lengkap; operasi optimistic/mention/edit belum diuji. |
| `/patterns/data-table` | Lima row, saved views dan seluruh variant/density terlihat; kolom utama memakai panel horizontal. Rows per page masih kosong, perlu probe tersendiri; loading/error/pagination belum diuji. |
| `/patterns/dashboard` | Empat KPI dan empat activity lengkap; sumbu chart terlihat tetapi bar belum muncul pada capture, kandidat timing yang perlu reprobe, bukan defect final. |

Ketujuh halaman foundations desktop dark juga sudah dibaca seluruh dokumennya: colors (checker, pasangan kontras, katalog), themes (tiga art direction, empat tone Atelier, matriks dan recipe), typography (specimen, delapan scale, pairing, prose), spacing (delapan spacing, enam radius, empat elevation), motion (duration/easing/directional/reduced-motion), breakpoints (scale, tiga recipe, z-index), dan iconography (empat size, 54 ikon, dua contoh a11y). Tidak terlihat overlap halaman pada konfigurasi desktop ini. Perubahan tema, checker, copy dan Play belum diuji; gambar tidak membuktikan kontras numerik. Total pemulihan yang sudah dibaca: **36 mobile dan 22 desktop dark**.

Tambahan dua mobile dan delapan desktop dark telah dibaca, sehingga total inspeksi pemulihan menjadi **38 mobile dan 30 desktop dark**:

| Route / konfigurasi | Hasil visual dan batas pemeriksaan |
|---|---|
| `/patterns/dynamic-form` mobile | Seluruh kelompok form, dua anggota, dan footer publish terlihat. Owner tetap kosong (C13); submit, autosave, validasi, dan dirty guard belum diuji. |
| `/patterns/file-manager` mobile | Kontrol state membungkus, toolbar dan satu baris dokumen terlihat; kolom kanan berada di area tabel terpotong. Drawer/sidebar, scroll tabel, preview, dan pemulihan error belum diuji. |
| `/components/actions-inputs` dark | Seluruh section sampai OTP terlihat, termasuk radio, slider, segmented dan number input. Interaksi dan state validasi belum diuji. |
| `/components/charts` dark | Sparklines, area, bar, line, donut dan stacked chart terlihat lengkap. Capture ini tidak menunjukkan panel kosong; tooltip dan pergantian seri belum diuji. |
| `/components/data-display` dark | Seluruh section sampai copilot terlihat: kartu, carousel, timeline, tabel, tree dan sortable list. Dev indicator “1 Issue” bukan diagnosis; interaksi/internal scroller belum diuji. |
| `/components/forms` dark | Form, error summary, RTE, upload, combobox, date/time, OTP dan filter builder terlihat. Dev indicator “1 Issue” perlu dikorelasikan dengan error runtime; bukan temuan tambahan tanpa bukti. |
| `/components/layout-navigation` dark | Semua section sampai aspect ratio/skip link terlihat. Panel AppShell kosong adalah kontainer contoh, bukan kehilangan data; menu/drawer/resize belum diuji. |
| `/components/marketing` dark | Hero, fitur, statistik, pricing, testimonial, logo, statement, CTA dan FAQ terlihat. W07 penggunaan highlight pada CTA tetap temuan kode; toggle billing/FAQ belum diuji. |
| `/components/overlays-menus` dark | Semua section dan pemicu overlay terlihat, tetapi overlay tertutup. Banner atas keluar batas kanan (C11); focus trap/Escape belum diuji pada capture ini. |
| `/components/states-feedback` dark | Alert, notification, spinner, skeleton, progress, empty dan contoh error tampil. Dismiss Banner keluar panel (C11); retry/notification actions belum diuji. |

Batch keempat selesai dengan 19/20 sukses (satu kegagalan navigasi file-upload dark, bukan bukti defect aplikasi): total **121/146** dark/mobile tersimpan. Sisa 25 konfigurasi sedang dicoba ulang. Empat mobile tambahan dibaca, sehingga total pemulihan **42 mobile dan 30 desktop dark**:

| Route mobile | Hasil visual dan batas pemeriksaan |
|---|---|
| `/patterns/file-upload` | Empty dropzone, slider, toggle dan instruksi lengkap. Upload nyata, pembatalan, retry dan reorder belum diuji. |
| `/patterns/flow-editor` | Palet, toolbar membungkus, lima node/empat edge, minimap/zoom dan tombol daftar alternatif terlihat. Batas node di canvas bukan overflow halaman; pan, inspector dan keyboard belum diuji. |
| `/patterns/global-search` | Input dan enam suggested searches terlihat. Hasil pencarian, shortcut dan state loading/error belum diuji. |
| `/patterns/import-wizard` | Root 600/390; langkah ketiga/keempat keluar kanan pada header stepper. Upload/paste/delimiter/footer dan panel demo terlihat. Kandidat tambahan reflow C15, perlu atribusi komponen dan uji akses lewat scroll; parse/mapping belum diuji. |

## Probe lanjutan — beranda, akhir feed dan command palette

- **C16:** home mobile 390×844 tetap menyembunyikan katalog setelah masuk viewport. Observer terukur: target 9689px, root 804px, ratio 0,08298, intersecting true; threshold 0,15 tidak tercapai. Bukti `cr054-home-threshold.json`, source `use-reveal.ts:16` dan home `page.tsx:532`.
- Infinite-scroll mobile berhasil melewati loading dan mencapai “You're all caught up — end of feed.” setelah tiga scroll lanjutan; tinggi akhir 3444px. Screenshot viewport akhir `cr054-feed-end-mobile.png` **dibaca**, pesan akhir dan entri terakhir tampil utuh. Ini menutup batas capture feed awal yang tumbuh, bukan pengujian reset/error/pembaca layar.
- **C17:** klik pemicu demo command palette membuka dua dialog; satu Escape masih menyisakan dialog. Probe selector option tidak cocok dengan implementasi tombol sehingga angka nol option **bukan** bukti daftar kosong. Fokus INPUT ada, tetapi keanggotaan dialog pertama tidak boleh digunakan sebagai klaim focus trap gagal ketika ada dua instance. Source menunjukkan demo dan global sama-sama mendengarkan event aktivasi. Bukti `cr054-feed-command.json`.

## Batch 1 — viewport pertama desktop

| Route | Light | Dark | Observasi | Tindak lanjut |
|---|---|---|---|---|
| `/components/actions-inputs` | dibaca | dibaca | Judul, section, tombol, badge dan rating tampil; tidak terlihat overlap pada area yang difoto. Konten masih berlanjut setelah toggle. | Periksa bagian bawah dan mobile; kontras badge outline bukan dinilai dari gambar. |
| `/components/charts` | dibaca | dibaca | Grafik dan KPI tampil di kedua mode. “Performance overview” jauh lebih kecil daripada heading section halaman komponen lain. | Cocokkan fungsi heading dengan aturan SectionHeading. Kotak kosong kecil di grafik stacked perlu konfirmasi ulang runtime sebelum dianggap bug. |
| `/components/data-display` | dibaca | dibaca | Demo Standard Plan terpilih memakai ring biru/primary, berbeda dari ring highlight pada pilihan visual menurut visual-language. | Telusuri sumber komponen Card; kandidat temuan, bukan perubahan langsung. Jump navigation horizontal terpotong perlu diuji dapat digulir/diakses. |
| `/components/forms` | dibaca | dibaca | Form dan plan selector tampil. Ring plan highlight, tetapi label kecil “PRO” berwarna highlight. Tombol Submit memakai highlight. | Verifikasi kelas/nilai computed untuk kontras PRO dan semantik tombol utama; bagian bawah/mobile belum diperiksa. |
| `/components/layout-navigation` | dibaca | dibaca | CTA “Explore Layouts” terlihat melewati sisi kanan permukaan Banner; demo navigasi dan sidebar tampil. | Ukur batas Banner/CTA runtime; periksa horizontal jump navigation dengan keyboard. |
| `/components/marketing` | dibaca | dibaca | Hero dan grid fitur tampil; CTA memakai warna highlight dan badge hero memakai teks aksen kecil. | Verifikasi peran warna dan kontras; konten di bawah viewport belum dinilai. |
| `/components/overlays-menus` | dibaca | dibaca | CTA Banner “Jump to…” terpotong pada sisi kanan gambar. Trigger overlay tampil. | Ukur overflow; buka dialog/sheet/menu untuk audit fokus dan state. |
| `/components` | dibaca | dibaca | Hero dan katalog tampil; eyebrow biru dan CTA teal perlu dicocokkan dengan peran warna. | Verifikasi kelas; ellipsis kartu tidak otomatis bug. |
| `/components/states-feedback` | dibaca | dibaca | Beberapa tombol dismiss Banner terlihat berada di luar permukaan berwarna. Alert dan feed tampil. | Konfirmasi ukuran flex dan batas parent; ukur kontras status, bukan menilai dari gambar. |
| `/patterns/activity-feed` | dibaca | dibaca | Feed dan pencarian tampil; filter aktif teal, berbeda dari segmented permukaan netral. | Verifikasi implementasi filter; detail audit, infinite scroll dan empty state belum dijalankan. |
| `/patterns/auth` | dibaca | dibaca | Sign In rapi pada viewport; tautan, field dan tombol tampil di kedua mode. | Register, OTP, reset dan simulasi kegagalan belum dijalankan. |
| `/patterns/billing` | dibaca | dibaca | Plan, invoice dan metode pembayaran tampil. Tombol upgrade teal dan teks usage kecil teal merupakan kandidat peran/kontras. | Verifikasi kelas dan nilai computed; form bawah viewport dan aksi invoice belum diuji. |
| `/patterns/calendar` | dibaca | dibaca | Kalender month, event dan catatan tampil. Kontrol demo pilihan memakai fill primary, sementara kontrol kalender memakai permukaan netral. | Verifikasi aturan segmented; event truncation bukan otomatis bug. Uji week/day/agenda, loading/error, detail dan keyboard. |

| `/patterns/cascader-tree-select` | dibaca | dibaca | Single Tree Select tampak kosong meski tombol clear muncul; contoh multiple, disabled/error/loading tampil. | Konfirmasi nilai/placeholder setelah hidrasi; buka pilihan dan uji keyboard. |
| `/patterns/command-palette` | dibaca | dibaca | Trigger dan petunjuk shortcut tampil. | Overlay belum dibuka; fokus dan navigasi hasil belum dinilai. |
| `/patterns/comments` | dibaca | dibaca | Thread/reply dan composer tampil. Teks avatar berwarna tampak redup pada dark. | Ukur kontras avatar dan aksi hapus; tombol disabled tidak diperlakukan sebagai pelanggaran kontras. |
| `/patterns/dashboard` | dibaca | dibaca | KPI, grafik dan aktivitas tampil; label KPI memakai ellipsis. | Verifikasi aksen primary dekoratif dan teks teal kecil; ellipsis sendiri bukan bug. |
| `/patterns/data-table` | dibaca | dibaca | Tabel tampil; pilihan Rows per page tampak kosong. | Konfirmasi setelah hidrasi; uji filter, sort, selection, pagination dan state data. |
| `/patterns/dynamic-form` | dibaca | dibaca | Field dan anggota tampil; Owner tampak kosong. | Periksa placeholder/nilai, validasi, autosave dan dirty guard. |
| `/patterns/file-manager` | dibaca | dibaca | Tree, tabel, kuota dan kontrol tampil; pilihan demo memakai primary. | Verifikasi segmented, preview, state dan scroll panel/mobile. |
| `/patterns/file-upload` | dibaca | dibaca | Dropzone tampil; thumb slider tidak terlihat pada gambar light tetapi terlihat pada dark. | Konfirmasi ulang runtime sebelum menjadi temuan; uji unggahan simulasi, cancel/error/retry. |
| `/patterns/flow-editor` | dibaca | dibaca | Canvas dan edges tampil pada zoom 71%; label peringatan tampak gelap pada dark. | Ukur kontras; clipping canvas dapat disengaja. Uji alternatif list dan keyboard, bukan menyimpulkan dari gambar. |

## Batch 2 — lanjutan viewport pertama desktop

Kedua mode setiap route di bawah benar-benar dibaca. Semua tetap perlu mobile, bagian bawah, dan pemeriksaan state interaktif.

| Route | Observasi light/dark | Audit lanjutan |
|---|---|---|
| `/patterns/global-search` | Input dan suggestion chips tampil; belum ada query. | Results, loading, no-results dan keyboard. |
| `/patterns/import-wizard` | Upload step dan kontrol demo tampil. | Mapping, validasi, preview, commit dan kegagalan. |
| `/patterns/infinite-scroll` | Screenshot tidak sebanding: light 32/40, dark 8/40 dengan loading. | Ambil ulang state stabil; jangan simpulkan parity dari pasangan ini. |
| `/patterns/kanban` | Empat kolom dan drop target Done kosong tampil. | Keyboard drag/drop, tambah kartu; peran warna CTA Open CRM Leads. |
| `/patterns/master-data` | Tabel dan kategori tampil; kode referensi memakai primary. | Create/edit, audit panel, filter/empty/error. |
| `/patterns/master-detail` | Daftar tiket dan prompt belum memilih item tampil. | Pilih detail, no-results/recovery, mobile sheet. Ellipsis judul tidak otomatis bug. |
| `/patterns/media-gallery` | Kedua gambar hanya skeleton “Loading media…”. | Bukti belum mencakup gallery loaded/lightbox; ambil ulang setelah aplikasi selesai memuat. |
| `/patterns/mention-emoji` | Composer dan contoh pesan tampil. | Buka mention/emoji, keyboard, state demo. |
| `/patterns/mind-map` | Dark shell tetapi canvas tetap terang; label Cari ide dan pohon alternatif tampak gelap di atas panel gelap. | Verifikasi tema bersarang/warna computed; canvas clipping dapat sah karena pan. |
| `/patterns/notifications` | Inbox dan preferences tampil; unread ditandai dot warna. | Semantik read state, toggle/bulk clear/filter dan empty. |
| `/patterns/onboarding` | Checklist modal terbuka di kedua mode. | Fokus awal/trap/restore, Escape, tahap dua dan underlying page saat modal ditutup. |
| `/patterns/optimistic-updates` | Feature switches dan starred files tampil. | Pending, rollback, retry dan race interaksi. |
| `/patterns/org-chart-editor` | Diagram 50% tampil sangat kecil; banner deprecated tampil. | Fit/zoom, pencarian, inspector dan alternatif daftar. Ukur kontras warning light. |
| `/patterns/org-chart-studio` | Light canvas kosong, dark canvas berisi node; pasangan tidak sebanding. | Ambil ulang setelah layout stabil; jangan laporkan blank canvas permanen tanpa reproduksi. |
| `/patterns/org-chart` | Sebagian diagram terlihat, root di luar area foto; banner deprecated tampil. | Fit/zoom dan fokus/search; pan clipping tidak otomatis bug. |
| `/patterns/permission-matrix` | Grid dan instruksi tampil; area foto hanya lima resource meskipun instruksi menyebut delapan. | Scroll internal, locked cell, keyboard, dirty/save/reset dan state demo. |
| `/patterns/product-tour` | Dashboard contoh dan kontrol tampil; spotlight belum dibuka. | Tur lengkap, target hilang, skip/Escape, fokus dan motion. |
| `/patterns/results` | Empty state lengkap dengan CTA Clear search tampil. | Forbidden/error/retry belum dibuka. Ikon primary perlu cocokkan aturan peran. |
| `/patterns/rich-text-editor` | Konten Prose tampil tetapi gambar “Contoh gambar” tidak terlihat dimuat di kedua mode; probe berikutnya masih menunjukkan request pending, bukan bukti error final. Metadata “0 kata” perlu diperiksa; counter 328/10000 menghitung karakter, sehingga keduanya tidak bisa dibandingkan langsung. | Reproduksi asset dan hitung kata aktual setelah stabil; link/image modal dan validasi. |
| `/patterns/settings` | Tab Profile dan form tampil. | Tab lain, invalid/save/pending, avatar dan danger confirmation. |
| `/patterns/stepper` | Tahap Organization tampil. | Validasi, tahap 2–4, persist, summary dan submit/error. |
| `/patterns/transfer-list` | Dua panel dan tombol transfer tampil. | Panel scroll, selection/range, transfer keyboard, empty/loading/error. |
| `/patterns/virtualized-list` | Baris virtual dan statistik tampil. | Semantik tabel, filter empty, scroll ke akhir, density dan mobile. |
| `/patterns/workspace` | Explorer/editor/terminal tampil; syntax memakai primary. | File switch, panel collapse/resize, command palette dan mobile drawer. |

## Koreksi kandidat awal

- Eyebrow biru pada screenshot katalog **tidak terkonfirmasi pada kode saat ini**: PageHeader memakai foreground. Tidak menjadi temuan fix tanpa reproduksi.
- Pasangan screenshot dengan loading/layout berbeda tidak membuktikan kegagalan parity.
- Screenshot awal bukan bukti versi build yang terikat commit. Temuan perlu diverifikasi kembali pada runtime saat ini.

## Status keseluruhan

Seluruh 46 route components/patterns / 92 gambar viewport awal sudah dibaca. Tambahan 30 screenshot full-document light (8 clinic, 5 CRM, 8 components, 7 foundations, contribution, getting-started) dan 15 capture untuk lima route umum (`/`, `/guidelines`, `/whats-new`, `/landing`, `/scratch`) membuat **seluruh 73 route memiliki setidaknya satu pemeriksaan visual desktop light**. **Ini belum berarti audit selesai:** 46 route components/patterns baru diperiksa pada viewport pertama (1800px), bukan seluruh halaman; bagian bawah 27 route patterns, dark/mobile, interaksi, dan tema lain masih terbuka. Bahkan pada subset 46, gallery loaded dan canvas Studio light belum terwakili bukti yang cukup. Temuan direkonsiliasi dengan audit kode dan runtime sebelum CR turunan.

## Bukti tambahan parsial dan blocker runtime

- Rekonsiliasi manifest setelah job berhenti: 51 konfigurasi tercatat, 30 berhasil dengan tema terverifikasi, 21 gagal. Semua yang berhasil adalah desktop 1440px **light**; belum ada hasil dark/mobile dari job tambahan ini. Target 219 konfigurasi belum tercapai.
- Hasil berhasil meliputi delapan halaman clinic, lima CRM, delapan components (kecuali overlays-menus), contribution, tujuh foundations, dan getting-started. Dari 30 gambar tambahan, tiga sudah dibaca (clinic, appointments, consultations); 27 sisanya belum.
- Probe awal geometri Banner, fokus/Escape onboarding, dan RTE gagal pada navigasi pertama (timeout 40 detik). Hasil probe ulang setelah pemulihan dicatat di bawah.
- Request `http://localhost:4000/components/layout-navigation` juga timeout setelah 10 detik (HTTP 000). Penyebab server belum dipastikan; tidak disimpulkan sebagai bug halaman.
- Proses capture milik audit dihentikan (SIGTERM, exit 143) untuk tidak menambah request timeout. Setelah user mengizinkan, dev server direstart tanpa menghapus cache atau mengubah kode; request kembali HTTP 200. Batch capture penuh belum dilanjutkan.

## Batch tambahan — clinic, full-document light

| Route | Observasi | Belum diperiksa |
|---|---|---|
| `/clinic` | Dashboard, jadwal dan feed tampil. Area plot grafik tampak kosong meski sumbu/legend tampil; mungkin capture sebelum animasi stabil. | Tunggu grafik stabil sebelum menyimpulkan bug; dark/mobile dan interaksi. |
| `/clinic/appointments` | Empat kolom kanban dan sembilan kartu tampil. | Booking, filter, DnD/keyboard, status dan kontras label Check-in. |
| `/clinic/consultations` | Tab Doctors/SOAP menampilkan form, vital, pasien dan history. | Dua role/tab lain, validasi/save, dark/mobile. |

## Batch tambahan — CRM, clinic lanjutan, foundations

| Route | Observasi | Belum diperiksa |
|---|---|---|
| `/crm` | Dashboard, funnel, radar, activity feed tampil. Panel Revenue Trajectory kosong meski sumbu dan legend tampil. | Apakah kosong karena animasi/capture; dark/mobile; interaksi. |
| `/crm/leads` | Kanban tertangkap dalam state skeleton loading (tiga kolom). Search, filter, dan tombol Add Lead tampil. | State loaded, tabel, drag/keyboard, empty/error. |
| `/crm/campaigns` | Enam kartu kampanye dengan status dan metrik tampil; aksi pause/launch/delete tersedia. | Aksi, filter, form create, dark/mobile. |
| `/crm/ai` | Skor prediktif, slider parameter, segmented tab, dan CTA tampil. | Perhitungan slider, tab lain, streaming, dark/mobile. |
| `/crm/contact-center` | Tiga panel, conversation terpilih, AI suggestion, profil, dan composer tampil. | Kirim pesan, simulate inbound, resize, empty/error. |
| `/clinic/patients` | Tabel delapan pasien tampil dengan badge status. Dua select filter di kanan tampak kosong tanpa placeholder/label. | Verifikasi kode select; filter, sorting, pagination, mobile. |
| `/clinic/pos` | Katalog produk, invoice kosong dengan empty state jelas, tender segmented, tombol complete disabled. | Tambah item, diskon, pajak, pembayaran, mobile. |
| `/clinic/registration` | Stepper lima langkah dan form step 1 tampil; Next disabled saat wajib kosong. | Validasi, langkah 2–5, submit, dark/mobile. |
| `/clinic/reports` | Tiga panel grafik kosong; kartu outcome tampil. Label kecil teal pada kartu outcome adalah kandidat kontras. | Chart render, kontras terukur, export, dark/mobile. |
| `/clinic/treatments` | Tabel protokol dengan badge kategori/status dan aksi ikon tampil; nama panjang ter-truncate. | Create/edit/delete, filter, mobile scroll. |
| `/foundations/breakpoints` | Skala breakpoint, demo komposisi, dan tabel z-index tampil. Label token teal kecil sudah tercatat sebagai pelanggaran lama. | Dark/mobile; widget tema pada screenshot full-doc adalah elemen fixed, bukan overlap nyata. |

## Batch tambahan — foundations sisa, komponen, halaman umum

| Route | Observasi | Belum diperiksa |
|---|---|---|
| `/foundations/typography` | Specimen, tester, hierarchy, pairings, dan long-form tampil. Metadata Heading 2 memakai weight 600, sementara docs memakai 700 (deviasi lama tercatat). | Dark/mobile; interaksi tester. |
| `/foundations/themes` | Art direction library, tone cards, tabel kontras, dan contoh kode tampil. | Dark/mobile; aktivasi arah/tone. |
| `/getting-started` | Kartu instruksi dan code block tampil; code block terpotong horizontal dengan scroll. | Dark/mobile; copy action. |
| `/contribution` | Kartu konvensi, banner, dan checklist tampil. | Dark/mobile. |
| `/components/actions-inputs` | Seluruh section full-doc tampil; varian tombol, badge, rating, toggle, slider, segmented, OTP render. | Interaksi keyboard/state, dark/mobile. |
| `/components/charts` | Panel chart tampak kosong di screenshot full-doc. Runtime setelah tunggu: 9 wrapper, 18 surface, 85 path; chart utama 494×209. Ini artefak timing capture, bukan chart rusak. | Tooltip/legend, dark/mobile, resize. |
| `/components/data-display` | Section bawah (timeline, bulk bar, sortable table, chart accessibility, tree, DnD, chat) tampil. Bar chart aksesibilitas berbasis HTML render. | Interaksi DnD/sort/chat, dark/mobile. |
| `/components/forms` | Semua section form tampil. Toolbar Rich Text Description tampak kosong di full-doc; perlu probe runtime. | Toolbar RTE, validasi, date/time, combobox, file upload, dark/mobile. |
| `/components/layout-navigation` | Seluruh section navigasi tampil; Banner CTA overflow sudah terukur. | Interaksi menu/tab/resize, dark/mobile. |
| `/components/marketing` | Hero, fitur, stats, pricing, testimoni, CTA, FAQ tampil. | Dark/mobile; interaksi accordion/toggle. |
| `/components/states-feedback` | Alert, notifikasi, spinner, skeleton, progress, empty/error tampil; Banner dismissible memuat overflow C11. | Announcement/loading state, dark/mobile. |
| `/` | Hero dan tiga kartu atas tampil; section bawah tidak terlihat pada full-doc karena `Reveal`/IntersectionObserver belum dipicu. Perlu probe scroll. | Scroll reveal, dark/mobile, CTA. |
| `/guidelines` | Seluruh kartu prinsip visual/a11y dan do/don't tampil. | Dark/mobile. |
| `/whats-new` | Konten changelog tampil. **Overflow horizontal terukur: scrollWidth 1470 vs 1440 desktop dan 1012 vs 390 mobile.** Penyebab terukur: baris konten Banner selebar 1102px (min-width auto) + CTA `shrink-0` + dismiss keluar panel; lihat C11. | Verifikasi perbaikan Banner; dark/mobile detail. |
| `/landing` | Shell marketing mandiri; section craft, recipes, apps, stats, footer tampil. Hero above-fold tidak terlihat pada full-doc karena `Reveal` belum ter-hydrate; probe runtime setelah 7 dtk menunjukkan 2 Reveal hero visible, jadi artefak timing capture, bukan defect. 20 elemen overflow tetapi scrollWidth tetap 1440 (marquee/orb dekoratif). Badge/tagline kecil memakai `text-highlight` (kandidat kontras/peran). | Dark/mobile; verifikasi overflow dekoratif vs nyata. |
| `/scratch` | Hanya dua specimen "Aa" dan label; halaman scratch non-produksi. | Tidak ada; catat sebagai scratch. |

## Pengukuran runtime setelah restart

Bukti JSON di direktori temp audit: `cr054-runtime.json` dan `cr054-focus.json`. Probe menggunakan tab CDP terpisah; tidak mengubah kode.

| ID | Konfigurasi | Hasil aktual | Kesimpulan |
|---|---|---|---|
| C11 | Desktop light 1440px, layout-navigation | Batas kanan Banner 1400px; CTA 1415,86px dan dismiss 1463,86px. | Overflow kontrol keluar permukaan terkonfirmasi. |
| C11 | Desktop light 1440px, overlays-menus | Batas kanan Banner 1400px; CTA 1503,72px dan dismiss 1551,72px. | Kontrol juga melewati lebar viewport desktop yang dikonfigurasi. |
| C11 | Desktop light 1440px, states-feedback | Dismiss warning 872,08px > batas Banner 831px; info 1418,69px > 1375px; highlight 1400,27px > 1375px. | Overflow bukan hanya artefak screenshot. |
| C11 | Emulasi mobile light 390px, tiga halaman | Banner utama berbatas kanan 366px, tetapi CTA/dismiss masing-masing mencapai 958,73/1006,73px (layout), 1034,06/1082,06px (overlays), 778,98/826,98px (states). | Overflow parent terkonfirmasi; innerWidth layout viewport dapat membesar. Jangan menyamakan innerWidth dengan visual viewport 390px atau mengklaim hasil sentuh nyata tanpa uji tambahan. |
| C06 | Onboarding desktop, dialog benar-benar terbuka | Fokus awal body; setelah Tab fokus tautan logo di luar dialog; setelah Escape dialog tetap terbuka. | Tidak ada initial focus/trap dan Escape dismiss pada jalur ini, sesuai temuan kode. |
| V01 | RTE desktop light, konten awal tersedia | Teks aktual memuat 44 token kata berdasarkan whitespace; badge tetap “0 kata”. | Metadata awal tidak tersinkron; bukan perbandingan kata dengan counter karakter 328/10000. |
| V02 | `/whats-new` desktop 1440 dan emulasi 390 | `scrollWidth` 1470 vs 1440; pada emulasi 390 `docScrollWidth` 1012. Baris konten Banner 1102px (desktop) / 948px (mobile), span `min-width:auto`, CTA 157px `shrink-0`, dismiss keluar. | Overflow nyata; akar bersama C11 pada Banner, bukan hanya halaman. |
| kandidat reveal | `/landing` setelah hidrasi | Sempat 0/10 `Reveal` visible; setelah 7 dtk 2 Reveal hero visible. | Landing merupakan artefak timing capture; home mobile berbeda, bug threshold C16 terkonfirmasi. |
| kandidat asset | RTE desktop light | Image `https://contoh.com/gambar.png`: `complete=false`, `naturalWidth=0` saat probe. | Masih pending; belum membuktikan error final jaringan atau gambar rusak permanen. |

Sisa pekerjaan: ulangi konfigurasi gagal/belum dijalankan, tunggu state aplikasi stabil, lanjutkan visual/runtime seluruh route dan konsolidasi final. CR perbaikan belum dibuat.
