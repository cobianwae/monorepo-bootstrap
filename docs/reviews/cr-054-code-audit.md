# UI/UX Audit Report — CR-054, seluruh halaman showcase (kode)

Tanggal: 2026-11-22. Audit **read-only implementasi**; satu-satunya artefak yang ditulis adalah laporan ini. Tidak mengubah CR-054, CR-012/013, kode, status, atau approval.

## Ringkasan

- **73 `page.tsx`** terinventori: **58 docs** (9 components, 37 patterns, 7 foundations, 5 halaman umum), **8 clinic**, **5 CRM**, **2 landing**.
- **✅ 7 pemeriksaan pass terbatas | ⚠️ 7 cluster warning | ❌ 11 cluster critical**. Angka adalah cluster masalah, bukan jumlah baris/halaman atau skor kepatuhan seluruh aplikasi.
- Scope diperluas dari 46 halaman pada `docs/cr/cr-054-audit-components-patterns.md:13` mengikuti instruksi audit seluruh `apps/showcase/src/app`. Inventori lengkap di bawah.
- Ini audit kode statis, **bukan** sertifikasi visual, WCAG, atau pengujian interaksi 73 route. Semua file halaman dipindai; kandidat ditriase dengan konteks dan beberapa implementasi komponen terkait. Tidak semua dependency transitif diperiksa. “Tidak ada temuan tambahan” tidak berarti halaman sudah lolos runtime.
- Bukti screenshot Banner berasal dari triase sesi induk/user, bukan pemeriksaan gambar oleh auditor ini. Browser/CDP `:9444` dan server `:4000` tidak disentuh.

## Metode dan batas bukti

1. Membaca `docs/STATUS.md`, CR-054, dan `docs/design/visual-language.md`; memakai panduan accessibility dan UX states.
2. Graphify dicoba dahulu: pencarian `apps/showcase/src/app` hanya mengembalikan konsep `apps_showcase_src_app_globals`; neighbors hanya relasi import stylesheet dari layout. Graph tersebut tidak menyediakan inventori/relasi route yang diperlukan; fallback ke glob, pencarian kode, dan baca rentang terarah. Delegasi eksplorasi tambahan ditolak tool karena batas kedalaman subagent; audit dilanjutkan lokal.
3. Memindai 73 halaman: warna/kelas, heading, event handlers, input, tabel/list/grid, cabang state, dan constraints lebar; membaca konteks kandidat. Komponen `Card`, `Input`, `Banner`, `HeroEyebrow`, `HeroBand`, `PageHeader`, stylesheet global, serta validator token dibaca untuk memeriksa temuan lintas halaman.
4. **Pasti statis** = kontrak/markup/kelas terbukti di sumber; **perlu runtime** = akibat layout, warna CSS aktual, focus/announcement akhir belum diukur. Severity critical mencakup a11y dan empty-state wajib; warning mencakup drift desain/UX nonblokir.
5. Validator aktual mengekspor `getContrastRatio` dan `checkWcagCompliance` (`packages/tokens/src/contrast.ts:66`, `:79`), **bukan `checkCompliance`**. Percobaan nama API dari panduan gagal TypeError; dilanjutkan memakai API aktual melalui transpile TypeScript di memori tanpa menulis output/build.

## Critical — harus ditangani melalui CR perbaikan setelah audit

### C01 — Teks kecil memakai highlight, termasuk kelas turunan dan hover

**Pasti melanggar aturan teks kecil** `docs/design/visual-language.md:112`; risiko kontras lintas tema, bukan sekadar semua kemunculan string `text-highlight`.

| Lokasi | Bukti / konteks |
|---|---|
| `apps/showcase/src/app/(docs)/components/forms/page.tsx:469` | Nilai pilihan `PRO` berasal dari selectedPlan, uppercase dalam container `text-xs`; bukan ikon. |
| `apps/showcase/src/app/(docs)/components/forms/page.tsx:559` | Link teks `S-005.22`, bukan SVG; gunakan warna link aksi yang kontras. |
| `apps/showcase/src/app/(docs)/components/forms/page.tsx:963` dan `:964` | Angka active chips/saved views memakai highlight. |
| `apps/showcase/src/app/(docs)/components/layout-navigation/page.tsx:512`–`:552` | Sembilan nama komponen dalam tabel `text-xs` (`:502`), bukan heading/ikon. |
| `apps/showcase/src/app/(docs)/components/data-display/page.tsx:1124` | Selected Node ID dalam paragraf `text-xs` (`:1123`). |
| `apps/showcase/src/app/(docs)/patterns/data-table/page.tsx:470` | Nama current saved view mewarisi `text-xs` dari `:465`. |
| `apps/showcase/src/app/(docs)/patterns/billing/page.tsx:388` dan `:403` | Nilai kuota dan persen near-limit `text-xs`, bukan ikon progress. |
| `apps/showcase/src/app/(docs)/patterns/comments/page.tsx:113`, `:533`, `:663` | Kelas warna avatar orang Sari dipakai untuk inisial teks, bukan SVG. |
| `apps/showcase/src/app/(docs)/foundations/breakpoints/page.tsx:68`, `:134` | Nama breakpoint dan nama layer z-index `text-xs`. |
| `apps/showcase/src/app/(docs)/foundations/themes/page.tsx:77`, `:130` | Eyebrow spotlight dan teks tombol outline memakai highlight; foreground-on-solid pasangan berbeda tidak disamakan. |
| `apps/showcase/src/app/(docs)/foundations/colors/page.tsx:63` | Label tombol outline memakai highlight sebelum hover; bukan hanya ikon. |
| `apps/showcase/src/app/(landing)/landing/page.tsx:42`, `:252` | Badge hero `text-xs`; nama `@ds/tokens` dalam teks body. Judul display highlight `:50` **tidak** dihitung sebagai teks kecil. |
| `apps/showcase/src/app/(clinic)/clinic/consultations/page.tsx:530` | Chip trigger aktif, `text-xs` (`:528`) di atas tint highlight/15. |
| `apps/showcase/src/app/(clinic)/clinic/reports/page.tsx:183` | Label cohort `text-xs` di atas tint highlight/10. |
| `apps/showcase/src/app/(crm)/crm/leads/page.tsx:586` | Angka skor `text-xs` (`:580`); Flame `:582` sendiri hanya ikon, tidak dihitung. |
| `apps/showcase/src/app/(docs)/components/marketing/page.tsx:87` → `packages/ui/src/components/marketing/hero.tsx:47` | HeroEyebrow menyuntikkan `text-xs sm:text-sm text-highlight` meski tidak tertulis pada halaman. |
| `apps/showcase/src/app/(docs)/page.tsx:436` → `packages/ui/src/components/marketing/hero-band.tsx:77`–`:80` | HeroBand tanpa accent eksplisit menghasilkan eyebrow highlight kecil. |

**Hover juga tetap perlu kontras**, tetapi dipisahkan dari default: `apps/showcase/src/app/(docs)/components/page.tsx:160`, `:168`, `:180`, serta `apps/showcase/src/app/(docs)/page.tsx:565`, `:576` memberi `group-hover:text-highlight` pada badge/title/chip kecil. Default tidak otomatis gagal; uji hover/focus sebagai state tersendiri.

Rekomendasi: foreground untuk teks kecil, highlight untuk ikon/border/tint; link/tombol aksi memakai pasangan semantik aksi yang kontras. Jangan mengganti semua highlight (ikon, display text, atau `text-highlight-foreground`) secara massal.

**Hasil validator model token**, highlightHex di atas surfaceHex:

| Tema | Light | AA normal | Dark | AA normal |
|---|---|---|---|---|
| pulse | 4.48:1 | gagal | 10.34:1 | lolos |
| sunset | 4.70:1 | lolos | 11.13:1 | lolos |
| botanic | 4.77:1 | lolos | 13.01:1 | lolos |
| midnight | 5.19:1 | lolos | 13.45:1 | lolos |
| nebula | 3.65:1 | gagal | 8.66:1 | lolos |
| lagoon | 3.52:1 | gagal | 9.59:1 | lolos |
| ink | 3.91:1 | gagal | 8.33:1 | lolos |
| graphite | 3.05:1 | gagal | 11.92:1 | lolos |

Sumber model: `packages/tokens/src/themes.ts:28` (contoh Pulse `:43`–`:53`). **Ini bukan pengukuran computed CSS**: swatch hex pendamping tidak boleh diasumsikan identik dengan render OKLCH/color-mix. Tint, background card, hover, gradient, dan glyph aktual wajib diukur runtime sebelum mengklaim rasio per elemen. Pasti: penggunaan kelas melanggar kontrak; model menunjukkan 5/8 tema light gagal AA normal, bukan semua tema/mode gagal.

### C02 — Demo Card interaktif tidak dapat dioperasikan keyboard

- ❌ `apps/showcase/src/app/(docs)/components/data-display/page.tsx:458`, `:486`–`:505`: Card interactive/selectable menerima onClick tanpa elemen button/radio, tabIndex, keyboard handler, atau semantic selected state.
- Bukti implementasi: `packages/ui/src/components/base/card.tsx:40`–`:47` hanya merender `<div>`; nama variant tidak menambah perilaku aksesibilitas.
- Rekomendasi: contoh interaction memakai button atau radio-group/card label yang benar; jangan sekadar menambah cursor/ring. Label visual Selected tidak menggantikan semantics kontrol.

### C03 — Pemilihan program registrasi hanya melalui pointer; checkbox kondisi tidak bernama

- ❌ `apps/showcase/src/app/(clinic)/clinic/registration/page.tsx:486`–`:511`: program berupa div onClick, tanpa keyboard/role/radio state. Aksi wajib langkah registrasi tidak dapat dipilih dengan Tab/Enter.
- ❌ `apps/showcase/src/app/(clinic)/clinic/registration/page.tsx:447`–`:457`: Checkbox controlled berdampingan span, tanpa label terkait/aria-label; teks dalam div bukan label. Jangan menganggap click bubbling sama dengan accessible naming.
- Rekomendasi: RadioGroup untuk program; label + Checkbox onCheckedChange dengan nama tiap kondisi.

### C04 — Lead detail memakai div klik, tanpa jalur keyboard setara pada elemen tersebut

- ❌ `apps/showcase/src/app/(crm)/crm/leads/page.tsx:466`–`:488`: HoverCardTrigger asChild membungkus div onClick pembuka detail; div tidak diberi tabIndex atau key handler.
- ❌ `apps/showcase/src/app/(crm)/crm/leads/page.tsx:934`–`:939`: kartu Kanban custom div onClick; tidak menyediakan kontrol bernama untuk membuka detail pada kartu itu.
- Rekomendasi: tombol/link detail eksplisit di dalam item; verifikasi juga perilaku DnD/context-menu dengan keyboard. Adanya menu alternatif tidak membenarkan contoh div-interaktif tanpa semantics.
- Bukan temuan pasti tambahan: wrapper checkbox `:437` tidak diberi onCheckedChange, tetapi event click dari Radix dapat bubble saat Space; **jangan** mengklaim keyboard checkbox rusak tanpa runtime.

### C05 — Field tanpa accessible label dan error tidak terkait

- ❌ `apps/showcase/src/app/(docs)/components/forms/page.tsx:685`–`:690`: Label tidak punya htmlFor; dua Input tidak punya id/aria-label/aria-labelledby. Placeholder bukan label.
- ❌ `apps/showcase/src/app/(docs)/components/forms/page.tsx:495`–`:501`: error flag dan paragraf terpisah tanpa aria-describedby; Input tidak otomatis mengatur aria-invalid untuk prop error (`packages/ui/src/components/base/input.tsx:43`–`:51`).
- ❌ `apps/showcase/src/app/(docs)/foundations/colors/page.tsx:88`, `:106`: native color picker tidak memiliki accessible name. Label customFg/customBg hanya terkait text input `:94`/`:112`.
- ❌ `apps/showcase/src/app/(docs)/foundations/themes/page.tsx:136`: input preview hanya placeholder/defaultValue, tanpa label.
- ❌ `apps/showcase/src/app/(docs)/patterns/master-data/page.tsx:310`–`:315`: search hanya placeholder, tanpa accessible label.
- ❌ `apps/showcase/src/app/(docs)/patterns/settings/page.tsx:649`–`:659`: input member-email hanya placeholder, tanpa label; error flag tidak mengaitkan pesan error.
- ❌ `apps/showcase/src/app/(docs)/patterns/flow-editor/page.tsx:490`–`:502`, `:534`–`:543`, `:574`–`:578`: label div/Label tidak terkait input; Judul memiliki aria-invalid tetapi pesan error tidak dihubungkan aria-describedby. Deskripsi `:505`–`:507` justru sudah terkait, jangan diubah massal.
- ❌ `apps/showcase/src/app/(clinic)/clinic/patients/page.tsx:173`, `apps/showcase/src/app/(clinic)/clinic/treatments/page.tsx:186`, `apps/showcase/src/app/(clinic)/clinic/pos/page.tsx:143`: input pencarian hanya placeholder.
- ❌ `apps/showcase/src/app/(clinic)/clinic/appointments/page.tsx:293`: filter tanggal tanpa label; SelectTrigger pasien `:343` tidak terhubung ke Label `:341` (tidak ada htmlFor/id atau aria-labelledby).
- Rekomendasi: label/id yang unik, error id + aria-describedby dan aria-invalid; pakai FormControl/FormMessage ketika relevan. Ini temuan contoh terbukti, bukan klaim daftar field bermasalah sudah exhaustif di seluruh dependency.

### C06 — Onboarding modal tidak memiliki focus management/Escape

- ❌ `apps/showcase/src/app/(docs)/patterns/onboarding/page.tsx:145`–`:155`: modal buatan div role=dialog aria-modal, bukan Dialog Radix. Seluruh sumber halaman tidak memiliki focus trap, focus awal/restore, penanganan Escape, atau inert background.
- Modal otomatis dibuka setelah 600ms (`:43`–`:50`), jadi background tetap dapat menerima keyboard sementara dinyatakan modal.
- Rekomendasi: Dialog DS dengan title, initial/return focus dan Escape. Pertahankan skip eksplisit; backdrop click bukan pengganti keyboard close.

### C07 — Selected/read state tidak tersedia sebagai state aksesibel

- ❌ `apps/showcase/src/app/(docs)/components/marketing/page.tsx:181`–`:205`: dua tombol billing berubah kelas, tanpa aria-pressed atau semantics radio/tab.
- ❌ `apps/showcase/src/app/(docs)/patterns/activity-feed/page.tsx:246`–`:256`: filter All/jenis berubah fill saja, tanpa pressed/selected state.
- ❌ `apps/showcase/src/app/(docs)/patterns/calendar/page.tsx:165`: kontrol view eksternal memilih month/week/day/agenda melalui variant tanpa pressed/radio state. Ini bukan klaim toolbar internal Calendar rusak.
- ❌ `apps/showcase/src/app/(docs)/patterns/notifications/page.tsx:166`–`:194`: tombol toggle read tidak memiliki aria-pressed/label status; pembeda unread berupa dot warna (`:184`) dan tint. Badge jenis bukan status read.
- Rekomendasi: SegmentedControl/ToggleGroup yang sesuai untuk pilihan; untuk read/unread beri nama aksi/status teks dan pressed state yang konsisten. Verifikasi announcement saat berubah.

### C08 — Empty result master-detail tidak memiliki next action

- ❌ `apps/showcase/src/app/(docs)/patterns/master-detail/page.tsx:359`–`:363`: hasil pencarian kosong hanya ikon + “No tickets match your search”, tanpa clear-search CTA. Juga div langsung di bawah ul (`:358`), bukan li.
- Rekomendasi: empty-state dengan pesan spesifik + tombol clear search, dibungkus list item atau dipindah di luar ul. Ini pelanggaran kontrak empty state, tidak disamakan dengan semua list kosong yang secara wajar menandakan selesai.

### C09 — Target kontrol ikon password terlalu kecil menurut baseline proyek

- ❌ `apps/showcase/src/app/(docs)/patterns/auth/page.tsx:201`–`:208`: tombol show/hide password hanya SVG 16×16, tanpa padding/min-size/area target diperbesar.
- Rekomendasi: hit area ≥44×44 dengan focus ring dan posisi tidak menutup input. Ini baseline touch proyek, **bukan klaim bahwa WCAG 2.1 AA mewajibkan 44px pada semua tombol**; pengecualian spacing/ukuran pada standar lain tidak diuji. Ukuran tepat bisa divalidasi getBoundingClientRect.

### C10 — Virtualized product table kehilangan relasi semantik tabel

- ❌ `apps/showcase/src/app/(docs)/patterns/virtualized-list/page.tsx:217`–`:224`, `:237`–`:254`: header dan seluruh row/cell berupa div/span tanpa table/grid/row/columnheader/cell semantics atau alternatif data nonvisual.
- Screen reader tidak memperoleh hubungan SKU/Product/Category/Price dengan nilai per baris; hanya window DOM yang tersedia tanpa indeks/jumlah total semantik.
- Rekomendasi: implementasi virtualized table/grid yang aksesibel, lengkap header association dan metadata total/index yang relevan; jangan menambah role=grid tanpa keyboard model. Cocokkan apakah plain semantic table lebih sederhana untuk demo.

### C11 — Banner flex dapat mendorong CTA/dismiss keluar background

- ❌ Akar bersama `packages/ui/src/components/feedback/banner.tsx:9`, `:85`–`:104`: outer flex tanpa wrap; content flex-1 tanpa min-w-0, span truncate, CTA shrink-0, dismiss sibling tanpa shrink-0/min-target. Min-content constraints content/CTA tidak diberi fallback lebar sempit; min-width auto content bisa mendorong dismiss/CTA melewati panel.
- Pemanggil cocok dengan kandidat sesi induk: `apps/showcase/src/app/(docs)/components/layout-navigation/page.tsx:147` (Explore Layouts), `apps/showcase/src/app/(docs)/components/overlays-menus/page.tsx:223` (Jump to Triggers), `apps/showcase/src/app/(docs)/components/states-feedback/page.tsx:118`, `:142`, `:145` (warning/info/highlight di dua kolom kartu).
- **Pasti:** constraints sumber konsisten dengan penyebab overflow. **Visual terkonfirmasi oleh triase sesi induk:** CTA keluar background/terpotong dan X keluar panel. Auditor ini tidak membuka screenshot/browser; geometri/viewport akhir harus dicatat dari batch visual induk. Critical untuk aksi yang terpotong/tidak terjangkau; bila runtime menunjukkan hanya background kosmetik sementara seluruh aksi tetap terjangkau, turunkan instance tersebut ke warning.
- Rekomendasi CR komponen bersama: content min-w-0 + truncate yang benar, CTA/dismiss tidak mengecil, fallback wrap/stack pada container sempit; jangan hanya overflow-hidden karena menyembunyikan aksi. Audit semua pemanggil, tidak patch halaman satu per satu.

## Warning — drift desain / UX yang sebaiknya diperbaiki

### W01 — Primary dipakai untuk dekorasi/meta, termasuk variant komponen

- ⚠️ `apps/showcase/src/app/(docs)/components/data-display/page.tsx:566` (avatar inisial); `apps/showcase/src/app/(docs)/components/layout-navigation/page.tsx:327` (avatar); `apps/showcase/src/app/(docs)/patterns/comments/page.tsx:97` (avatar); `apps/showcase/src/app/(docs)/patterns/master-data/page.tsx:484` (kode referensi nonaksi); `apps/showcase/src/app/(docs)/patterns/workspace/page.tsx:238`, `:243` (syntax preview) memakai primary untuk dekorasi/meta.
- ⚠️ `apps/showcase/src/app/(clinic)/clinic/consultations/page.tsx:631`, `:767`; `apps/showcase/src/app/(clinic)/clinic/pos/page.tsx:367`; `apps/showcase/src/app/(clinic)/clinic/registration/page.tsx:398`; `apps/showcase/src/app/(crm)/crm/ai/page.tsx:229`, `:249`, `:269`, `:289`: angka/hasil, bukan aksi.
- ⚠️ **Standard Plan ring benar masih primary**: `apps/showcase/src/app/(docs)/components/data-display/page.tsx:486`–`:489` mengaktifkan Card selectable; `packages/ui/src/components/base/card.tsx:14` menyuntikkan selected border/ring-primary dan bg-primary. Perbaiki kontrak variant via CR, bukan asumsi halaman sudah highlight karena menggunakan token.
- Rekomendasi: foreground untuk teks; highlight untuk aksen/pilihan visual; status semantik bila benar status. Jangan mengganti link/button/focus-primary yang sah.

### W02 — Heading section docs masih manual, bukan judul kartu

- ⚠️ `apps/showcase/src/app/(docs)/page.tsx:536`: “Showcase Catalog & Scenarios” mengawali grid katalog halaman, bukan judul kartu. Gunakan SectionHeading dan scale yang disepakati.
- ⚠️ `apps/showcase/src/app/(docs)/patterns/data-table/page.tsx:434`, `:478`: Saved Views dan Table Variants adalah heading section eksplisit dalam section, bukan h2 kecil pada Card. Gunakan SectionHeading.
- **Tidak dihitung pelanggaran otomatis**: `apps/showcase/src/app/(docs)/patterns/calendar/page.tsx:299`, `:349`; `apps/showcase/src/app/(docs)/patterns/org-chart/page.tsx:218`, `:229`; `apps/showcase/src/app/(docs)/patterns/cascader-tree-select/page.tsx:71` dan judul kartu sejenis adalah label panel/kartu kecil. Pengecualian CR-054 `:22`/`:105` berlaku; ikon pada label kartu tidak sama dengan ikon heading section.
- Hero preview tema `apps/showcase/src/app/(docs)/foundations/themes/page.tsx:83`, `:87` dan typography/editor contoh bukan otomatis heading dokumentasi yang harus diseragamkan.

### W03 — Kontrol pilihan menulis ulang SegmentedControl

- ⚠️ `apps/showcase/src/app/(docs)/components/marketing/page.tsx:180`–`:205`; `apps/showcase/src/app/(docs)/patterns/activity-feed/page.tsx:245`–`:256`; `apps/showcase/src/app/(docs)/patterns/calendar/page.tsx:163`–`:168` mengulang pilihan segmented dengan button manual. A11y state yang hilang dicatat critical C07, bukan diturunkan jadi warning.
- ⚠️ `apps/showcase/src/app/(docs)/patterns/flow-editor/page.tsx:519`–`:525` memang sudah aria-pressed, tetapi visual pilihan memakai default primary dibanding pola kontrol tersegmentasi DS. Evaluasi migrasi sesuai intent; pilihan kategori/filter chip tidak otomatis sama dengan segmented.
- Rekomendasi: gunakan DS SegmentedControl pada pilihan mutually exclusive yang memang segmented; jangan mengganti semua kumpulan button action.

### W04 — State tabel/data-grid belum lengkap pada skenario konsumen

- ⚠️ `apps/showcase/src/app/(clinic)/clinic/patients/page.tsx:229`–`:258` dan `apps/showcase/src/app/(clinic)/clinic/treatments/page.tsx:227`–`:256`: cabang hanya empty/success; tidak mendemonstrasikan skeleton loading + recoverable load-error. Empty dengan CTA **sudah ada**, jangan dilaporkan “no empty state”.
- ⚠️ `apps/showcase/src/app/(crm)/crm/leads/page.tsx:1032`–`:1043`: loading/skeleton dan pesan empty tersedia, tetapi caller tidak memasok error/retry atau CTA empty (hanya deskripsi mencoba clear filter). Error validasi create lead bukan error pemuatan tabel.
- ⚠️ `apps/showcase/src/app/(docs)/patterns/virtualized-list/page.tsx:198`–`:214`: hydration skeleton dan empty CTA sudah ada; error/retry data belum didemonstrasikan.
- Rekomendasi: matrix state showcase eksplisit. Data mock lokal bukan bukti request backend gagal; temuan ini gap dokumentasi UX, **bukan klaim ada request nyata gagal tanpa error handling**. Tabel referensi statis foundations tidak memerlukan simulasi fetch.

### W05 — Landing memakai warna palette literal, bukan semantic tokens

- ⚠️ `apps/showcase/src/app/(landing)/landing/page.tsx:178`–`:210`: panel CSS-first memakai border/bg/text-zinc, text-white, pink/blue/amber literal Tailwind. Art direction/theme tidak mengubah panel ini lewat token DS.
- Rekomendasi: peran semantik untuk panel/code; apabila intentional fixed-dark code panel, dokumentasikan pengecualian + pasangan contrast dan skin parity. Bukan “hardcoded hex komponen” hanya karena teks contoh menampilkan token/hex.

### W06 — Route scratch menambah ukuran display di luar scale

- ⚠️ `apps/showcase/src/app/(landing)/scratch/page.tsx:9`, `:17`: text-[6.5rem] (104px), bukan langkah typography scale. Ini **bukan** text-[Npx], jadi tidak diklaim melanggar guard regex px; tetap di luar scale visual yang disepakati.
- Rekomendasi: tentukan apakah route diagnostik perlu terekspos; gunakan scale/pengecualian dokumentasi. Jangan menghapus route tanpa approval.

### W07 — Highlight digunakan untuk CTA utama, kebalikan peran warna aksi

- ⚠️ `apps/showcase/src/app/(docs)/components/forms/page.tsx:376` Submit Application; `apps/showcase/src/app/(docs)/components/marketing/page.tsx:93` Explore Components dan `:366` CTA besar; `apps/showcase/src/app/(docs)/components/page.tsx:115` CTA katalog; `apps/showcase/src/app/(clinic)/clinic/treatments/page.tsx:175` Create treatment: variant highlight untuk aksi utama, bukan aksen/status.
- Rekomendasi: primary untuk aksi utama, highlight untuk identitas. Demo perbandingan varian Button `apps/showcase/src/app/(docs)/components/actions-inputs/page.tsx:88` sengaja berlabel Highlight dan **tidak** dianggap salah hanya karena menampilkan varian.

## Kandidat yang ditolak / dikoreksi setelah verifikasi kode

- ✅ **Eyebrow katalog primary tidak direproduksi pada kode sekarang**: `apps/showcase/src/app/(docs)/components/page.tsx:108` menggunakan PageHeader; implementasi `packages/ui/src/components/layout/page-header.tsx:90` adalah teks foreground + ikon highlight. Jangan membuat CR “ubah eyebrow primary” untuk elemen ini.
- Bila yang dimaksud home/catalog HeroBand `apps/showcase/src/app/(docs)/page.tsx:436`, default eyebrow sekarang highlight (`packages/ui/src/components/marketing/hero-band.tsx:51`, `:80`), bukan primary; ini masuk **C01**, bukan W01. Glow dekoratif primary masih ada pada HeroBand `:71` / PageHeader `:78`, tetapi itu bukan warna teks eyebrow.
- ✅ `apps/showcase/src/app/(docs)/patterns/virtualized-list/page.tsx:139`–`:150`: nilai stat **foreground** (`:152`); accent highlight dipakai hanya wrapper SVG. Lima hasil grep text-highlight di halaman ini tidak setara lima teks gagal.
- ✅ `apps/showcase/src/app/(docs)/patterns/settings/page.tsx:596`, `:877`, `:966`–`:1017`: kandidat highlight pada ikon/wrapper ikon bukan bukti teks kecil highlight. Tetap ada isu field member C05, bukan kontras berdasarkan hitungan grep.
- ✅ `apps/showcase/src/app/(docs)/patterns/notifications/page.tsx:176`–`:179`: highlight hanya ikon unread; masalah nyata state read terdapat pada C07.
- ✅ Link aksi primary `apps/showcase/src/app/(clinic)/clinic/page.tsx:167`, `:245`, password reset `apps/showcase/src/app/(docs)/patterns/auth/page.tsx:189`, dan fokus input `:354` sah sebagai aksi/focus; tidak dihitung primary dekoratif.

## Perlu runtime lanjutan — bukan failure terkonfirmasi oleh audit ini

1. **R01 — Reflow/mobile**: `apps/showcase/src/app/(clinic)/clinic/appointments/page.tsx:290`–`:312` menggabungkan w-40 + w-44 + gap tanpa wrap pada inner flex; `apps/showcase/src/app/(docs)/patterns/virtualized-list/page.tsx:217`, `:227`, `:244` header grid fixed-track berada di luar body scroller. Uji 320/375px dan zoom 200–400%; cek overflow viewport dan sinkronisasi kolom. Banner sudah C11 karena dilaporkan terpotong oleh triase visual induk.
2. **R02 — Kontras computed CSS**: seluruh C01 + hover katalog, card/panel tint, badge highlight-outline (`packages/ui/src/components/base/badge.tsx:12`). Hitung foreground terhadap background komposit aktual, bukan hex model saja; ukur 8 tema dan light/dark relevan. Judul large-text memakai ambang yang sesuai.
3. **R03 — Keyboard/focus/screen reader pada komponen impor**: overlay, canvas, calendar, DnD, virtual list dan konsumen dashboard perlu walkthrough terpisah. Contoh route `apps/showcase/src/app/(crm)/crm/page.tsx:1` mengomposisi fitur dashboard; tidak dinyatakan lulus seluruh komponennya dari halaman tipis. C06 adalah kegagalan statis spesifik, bukan generalisasi semua Dialog.

## Pass (terbatas pada bukti berikut)

1. ✅ Inventori filesystem mencakup semua 73 `page.tsx`, bukan hanya components/patterns (lihat tabel berikut).
2. ✅ Pembedaan heading section vs judul kartu diterapkan; contoh Card-title `apps/showcase/src/app/(docs)/patterns/calendar/page.tsx:299` tidak diberi temuan heading section.
3. ✅ Contoh RadioGroup plan pada forms memakai label htmlFor dan RadioGroupItem id (`apps/showcase/src/app/(docs)/components/forms/page.tsx:442`–`:458`), ring highlight (`:447`); berbeda dengan Card div di C02.
4. ✅ Empty-state pasien dan treatment punya reset CTA (`apps/showcase/src/app/(clinic)/clinic/patients/page.tsx:232`–`:240`, `apps/showcase/src/app/(clinic)/clinic/treatments/page.tsx:230`–`:238`).
5. ✅ Virtualized list punya skeleton dan empty+clear CTA (`apps/showcase/src/app/(docs)/patterns/virtualized-list/page.tsx:198`–`:211`); tidak dilaporkan “semua state hilang”.
6. ✅ Preferensi reduced-motion memiliki fallback global (`packages/ui/src/styles.css:51`–`:59`); marquee/float juga dimatikan (`apps/showcase/src/app/globals.css:38`–`:42`). Tidak adanya motion-reduce class pada setiap halaman **bukan** bukti animasi CSS mengabaikan preferensi. Animasi JS perlu pemeriksaan terpisah.
7. ✅ Chart dashboard menyediakan tabel ringkasan screen-reader dengan caption/header scope (`apps/showcase/src/app/(docs)/patterns/dashboard/page.tsx:272`–`:289`).

## Inventori lengkap route

Setiap row menunjuk file sumber `:1`. “S” = tersaring statis tanpa cluster tambahan yang dikonfirmasi; **bukan pass visual/a11y runtime**. C/W merujuk cluster di atas. Import subtree/komponen tidak otomatis ikut disertifikasi. Group route `(docs)/(clinic)/(crm)/(landing)` dihilangkan pada URL publik.

| # | Route | Sumber | Hasil triase kode |
|---|---|---|---|
| 1 | `/clinic/appointments` | `apps/showcase/src/app/(clinic)/clinic/appointments/page.tsx:1` | C05, R01 |
| 2 | `/clinic/consultations` | `apps/showcase/src/app/(clinic)/clinic/consultations/page.tsx:1` | C01, W01 |
| 3 | `/clinic` | `apps/showcase/src/app/(clinic)/clinic/page.tsx:1` | S; primary link aksi sah |
| 4 | `/clinic/patients` | `apps/showcase/src/app/(clinic)/clinic/patients/page.tsx:1` | C05, W04; row click punya tombol detail alternatif |
| 5 | `/clinic/pos` | `apps/showcase/src/app/(clinic)/clinic/pos/page.tsx:1` | C05, W01 |
| 6 | `/clinic/registration` | `apps/showcase/src/app/(clinic)/clinic/registration/page.tsx:1` | C03, W01 |
| 7 | `/clinic/reports` | `apps/showcase/src/app/(clinic)/clinic/reports/page.tsx:1` | C01 |
| 8 | `/clinic/treatments` | `apps/showcase/src/app/(clinic)/clinic/treatments/page.tsx:1` | C05, W04, W07 |
| 9 | `/crm/ai` | `apps/showcase/src/app/(crm)/crm/ai/page.tsx:1` | W01 |
| 10 | `/crm/campaigns` | `apps/showcase/src/app/(crm)/crm/campaigns/page.tsx:1` | S; search/filter punya aria-label |
| 11 | `/crm/contact-center` | `apps/showcase/src/app/(crm)/crm/contact-center/page.tsx:1` | S; option div punya role/tabIndex/Enter/Space |
| 12 | `/crm/leads` | `apps/showcase/src/app/(crm)/crm/leads/page.tsx:1` | C01, C04, W04; search berlabel |
| 13 | `/crm` | `apps/showcase/src/app/(crm)/crm/page.tsx:1` | S; halaman komposisi, dependency bukan certified pass |
| 14 | `/components/actions-inputs` | `apps/showcase/src/app/(docs)/components/actions-inputs/page.tsx:1` | S; demo varian highlight bukan otomatis CTA drift |
| 15 | `/components/charts` | `apps/showcase/src/app/(docs)/components/charts/page.tsx:1` | S; label panel bukan heading section |
| 16 | `/components/data-display` | `apps/showcase/src/app/(docs)/components/data-display/page.tsx:1` | C01, C02, W01 (ring selectable) |
| 17 | `/components/forms` | `apps/showcase/src/app/(docs)/components/forms/page.tsx:1` | C01, C05, W07; RadioGroup label/ring pass |
| 18 | `/components/layout-navigation` | `apps/showcase/src/app/(docs)/components/layout-navigation/page.tsx:1` | C01, C11, W01 |
| 19 | `/components/marketing` | `apps/showcase/src/app/(docs)/components/marketing/page.tsx:1` | C01 (HeroEyebrow), C07, W03, W07 |
| 20 | `/components/overlays-menus` | `apps/showcase/src/app/(docs)/components/overlays-menus/page.tsx:1` | C11; overlay impor perlu walkthrough |
| 21 | `/components` | `apps/showcase/src/app/(docs)/components/page.tsx:1` | C01 hover, W07; PageHeader eyebrow foreground |
| 22 | `/components/states-feedback` | `apps/showcase/src/app/(docs)/components/states-feedback/page.tsx:1` | C11; varian/status demo tidak diborong jadi drift |
| 23 | `/contribution` | `apps/showcase/src/app/(docs)/contribution/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 24 | `/foundations/breakpoints` | `apps/showcase/src/app/(docs)/foundations/breakpoints/page.tsx:1` | C01 |
| 25 | `/foundations/colors` | `apps/showcase/src/app/(docs)/foundations/colors/page.tsx:1` | C01, C05; hex input tester bukan hardcode skin |
| 26 | `/foundations/iconography` | `apps/showcase/src/app/(docs)/foundations/iconography/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 27 | `/foundations/motion` | `apps/showcase/src/app/(docs)/foundations/motion/page.tsx:1` | S; global reduced-motion tersedia, Play perlu runtime |
| 28 | `/foundations/spacing` | `apps/showcase/src/app/(docs)/foundations/spacing/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 29 | `/foundations/themes` | `apps/showcase/src/app/(docs)/foundations/themes/page.tsx:1` | C01, C05; hero preview dipisah dari heading docs |
| 30 | `/foundations/typography` | `apps/showcase/src/app/(docs)/foundations/typography/page.tsx:1` | S; heading contoh typography bukan otomatis drift |
| 31 | `/getting-started` | `apps/showcase/src/app/(docs)/getting-started/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 32 | `/guidelines` | `apps/showcase/src/app/(docs)/guidelines/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 33 | `/` | `apps/showcase/src/app/(docs)/page.tsx:1` | C01 (HeroBand/hover), W02; eyebrow primary ditolak |
| 34 | `/patterns/activity-feed` | `apps/showcase/src/app/(docs)/patterns/activity-feed/page.tsx:1` | C07, W03; search punya aria-label |
| 35 | `/patterns/auth` | `apps/showcase/src/app/(docs)/patterns/auth/page.tsx:1` | C09; tab min-width berada dalam scroller |
| 36 | `/patterns/billing` | `apps/showcase/src/app/(docs)/patterns/billing/page.tsx:1` | C01 |
| 37 | `/patterns/calendar` | `apps/showcase/src/app/(docs)/patterns/calendar/page.tsx:1` | C07, W03; judul kartu notes bukan section violation |
| 38 | `/patterns/cascader-tree-select` | `apps/showcase/src/app/(docs)/patterns/cascader-tree-select/page.tsx:1` | S; h2 kecil panel bukan otomatis section violation |
| 39 | `/patterns/command-palette` | `apps/showcase/src/app/(docs)/patterns/command-palette/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 40 | `/patterns/comments` | `apps/showcase/src/app/(docs)/patterns/comments/page.tsx:1` | C01 (inisial avatar), W01 |
| 41 | `/patterns/dashboard` | `apps/showcase/src/app/(docs)/patterns/dashboard/page.tsx:1` | S; tabel ringkasan chart tersedia |
| 42 | `/patterns/data-table` | `apps/showcase/src/app/(docs)/patterns/data-table/page.tsx:1` | C01, W02 |
| 43 | `/patterns/dynamic-form` | `apps/showcase/src/app/(docs)/patterns/dynamic-form/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 44 | `/patterns/file-manager` | `apps/showcase/src/app/(docs)/patterns/file-manager/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 45 | `/patterns/file-upload` | `apps/showcase/src/app/(docs)/patterns/file-upload/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 46 | `/patterns/flow-editor` | `apps/showcase/src/app/(docs)/patterns/flow-editor/page.tsx:1` | C05, W03; canvas impor perlu runtime |
| 47 | `/patterns/global-search` | `apps/showcase/src/app/(docs)/patterns/global-search/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 48 | `/patterns/import-wizard` | `apps/showcase/src/app/(docs)/patterns/import-wizard/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 49 | `/patterns/infinite-scroll` | `apps/showcase/src/app/(docs)/patterns/infinite-scroll/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 50 | `/patterns/kanban` | `apps/showcase/src/app/(docs)/patterns/kanban/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 51 | `/patterns/master-data` | `apps/showcase/src/app/(docs)/patterns/master-data/page.tsx:1` | C05, W01; skeleton dan empty CTA tersedia |
| 52 | `/patterns/master-detail` | `apps/showcase/src/app/(docs)/patterns/master-detail/page.tsx:1` | C08 |
| 53 | `/patterns/media-gallery` | `apps/showcase/src/app/(docs)/patterns/media-gallery/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 54 | `/patterns/mention-emoji` | `apps/showcase/src/app/(docs)/patterns/mention-emoji/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 55 | `/patterns/mind-map` | `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 56 | `/patterns/notifications` | `apps/showcase/src/app/(docs)/patterns/notifications/page.tsx:1` | C07; highlight wrapper hanya ikon |
| 57 | `/patterns/onboarding` | `apps/showcase/src/app/(docs)/patterns/onboarding/page.tsx:1` | C06 |
| 58 | `/patterns/optimistic-updates` | `apps/showcase/src/app/(docs)/patterns/optimistic-updates/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 59 | `/patterns/org-chart` | `apps/showcase/src/app/(docs)/patterns/org-chart/page.tsx:1` | S; label kartu notes bukan heading section |
| 60 | `/patterns/org-chart-editor` | `apps/showcase/src/app/(docs)/patterns/org-chart-editor/page.tsx:1` | S; label kartu notes bukan heading section |
| 61 | `/patterns/org-chart-studio` | `apps/showcase/src/app/(docs)/patterns/org-chart-studio/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 62 | `/patterns/permission-matrix` | `apps/showcase/src/app/(docs)/patterns/permission-matrix/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 63 | `/patterns/product-tour` | `apps/showcase/src/app/(docs)/patterns/product-tour/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 64 | `/patterns/results` | `apps/showcase/src/app/(docs)/patterns/results/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 65 | `/patterns/rich-text-editor` | `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 66 | `/patterns/settings` | `apps/showcase/src/app/(docs)/patterns/settings/page.tsx:1` | C05; highlight ikon bukan temuan teks kecil |
| 67 | `/patterns/stepper` | `apps/showcase/src/app/(docs)/patterns/stepper/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 68 | `/patterns/transfer-list` | `apps/showcase/src/app/(docs)/patterns/transfer-list/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 69 | `/patterns/virtualized-list` | `apps/showcase/src/app/(docs)/patterns/virtualized-list/page.tsx:1` | C10, W04, R01; stat highlight hanya ikon |
| 70 | `/patterns/workspace` | `apps/showcase/src/app/(docs)/patterns/workspace/page.tsx:1` | W01 |
| 71 | `/whats-new` | `apps/showcase/src/app/(docs)/whats-new/page.tsx:1` | S; kandidat warna/heading/interaksi/state disaring statis |
| 72 | `/landing` | `apps/showcase/src/app/(landing)/landing/page.tsx:1` | C01, W05 |
| 73 | `/scratch` | `apps/showcase/src/app/(landing)/scratch/page.tsx:1` | W06 |

## Temuan tambahan dari runtime (setelah audit statis)

**C14 — major, hydration RTE:** manifest capture terhidrasi `/patterns/rich-text-editor` mencatat React hydration mismatch: server merender `<p data-testid="rte-empty">`, client merender counter `<div>`. Akar terkonfirmasi `packages/ui/src/components/form/rich-text-editor.tsx:49`–`:53`: `stripHtmlToLength` mengembalikan 0 di server tetapi menghitung HTML lewat DOM di client; initializer state `:243` menghasilkan cabang empty (`:661`, `:897`) vs counter (`:902`) berbeda untuk konten awal nonkosong. Rekomendasi: initial render deterministik SSR/client, kemudian sinkronkan statistik; uji SSR/hydration dengan value nonkosong melalui CR perbaikan, bukan patch audit.

**V03 — minor, asset contoh rusak:** `/patterns/rich-text-editor` menampilkan gambar rusak; manifest mencatat `https://contoh.com/gambar.png` dengan `complete=true`, `naturalWidth=0`, alt “Contoh gambar”. Bukan lagi sekadar request pending. Gunakan asset demo yang tersedia/reliable dan uji fallback melalui CR perbaikan.

**C13 — major:** Single Tree Select kosong dengan clear button pada capture terhidrasi `/patterns/cascader-tree-select`. Source `apps/showcase/src/app/(docs)/patterns/cascader-tree-select/page.tsx:60`, `:151` memberi nilai awal `''`; `packages/ui/src/components/form/tree-select.tsx:116`–`:119` mengubahnya menjadi `['']`. Panjang seleksi 1 menekan placeholder (`:271`–`:273`) dan menampilkan clear (`:205`). Rekomendasi: normalisasi empty single value sebagai tanpa seleksi dan uji placeholder/clear/pilihan valid/multiple melalui CR perbaikan setelah audit selesai.

Pola yang sama menjelaskan Owner kosong di `/patterns/dynamic-form`: nilai awal `''` (`page.tsx:151`, `:202`) diteruskan ke Combobox (`:349`–`:354`). `packages/ui/src/components/form/combobox.tsx:108`–`:117` membentuk satu fallback option `{value:'',label:''}`; `:180` menganggap ada pilihan dan `:217` memakai label kosong (bukan nullish), sehingga placeholder “Assign owner...” hilang. Termasuk C13, bukan temuan terpisah.

| ID | Severity | Lokasi | Bukti | Rekomendasi |
|---|---|---|---|---|
| C12 | major | `apps/showcase/src/app/(clinic)/clinic/patients/page.tsx:183`, `:197` | Dua Select terkontrol tampil kosong saat awal; setelah dibuka trigger menjadi “All Programs”/“All Statuses”. Trigger tidak punya accessible name. | Render label terpilih sejak awal dan beri nama aksesibel; samakan placeholder “All Status” dengan item “All Statuses”. |
| V02 | major | `apps/showcase/src/app/(docs)/whats-new/page.tsx:32` → `packages/ui/src/components/feedback/banner.tsx:85` | scrollWidth 1470 vs 1440 desktop; 1012 vs 390 mobile. Baris konten Banner 948px pada mobile meski root 342px. | Manifestasi akar Banner yang sama dengan C11; perbaiki satu komponen lalu audit seluruh 17 pemakaian. |
| R01 | major | `apps/showcase/src/app/(docs)/patterns/virtualized-list/page.tsx:217`, `:227`, `:244`; `apps/showcase/src/app/(clinic)/clinic/appointments/page.tsx:290`–`:312` | Capture ulang terhidrasi 390px: root scrollWidth 731, header PRODUCT/CATEGORY bertumpuk, kolom kanan di luar viewport; manifest mencatat PRICE/STATUS/UPDATED hingga x=731. Header fixed-track berada di luar body scroller. Bukti 320px sebelumnya ambigu dan tidak dipakai mengatribusikan orb dekoratif. Toolbar appointments masih kandidat terpisah yang belum direproduksi. | Letakkan header/body dalam satu scroller dengan minimum grid width konsisten atau layout mobile alternatif; uji relasi kolom dan keyboard. Uji toolbar appointments terpisah. |

**C15 — major, reflow kontrol mobile:** capture `/patterns/transfer-list` pada 390px memperlihatkan panel Role members dan input terpotong; root scrollWidth 448. `packages/ui/src/components/form/transfer-list.tsx:224` panel flex tanpa `min-w-0` dan row dua panel `:352` tanpa adaptasi mobile merupakan kandidat penyebab; verifikasi ukuran minimum input saat perbaikan. `/clinic/registration` root 743/390 dengan step 3–5 di luar card/viewport, manifest mengidentifikasi step terakhir berakhir x=743; caller `apps/showcase/src/app/(clinic)/clinic/registration/page.tsx:241`–`:246` tidak menyediakan overflow/adaptasi untuk Stepper lima langkah. Rekomendasi: layout mobile/scroller lokal yang tidak memperlebar dokumen, semua label/kontrol tetap terjangkau.

Tambahan C15: `apps/showcase/src/app/(clinic)/clinic/consultations/page.tsx:215`–`:228` memaksa tiga tab berlabel panjang ke grid tiga kolom; capture 390px memperlihatkan label workspace saling menimpa. `apps/showcase/src/app/(crm)/crm/ai/page.tsx:190`–`:203` beralih menjadi satu kolom pada mobile tetapi tetap `h-10`; capture menunjukkan Draft Sandbox di luar bar dan tab ketiga tidak terlihat. Gunakan susunan/tinggi adaptif atau scroller tab lokal, lalu uji pointer dan fokus seluruh tab. Toolbar appointment `:290`–`:312` juga terlihat keluar card filter pada capture 390px; ini mendukung R01 terpisah dari board yang memang memiliki scroller lokal.

Kualifikasi C12: capture mobile pasien setelah readiness pada 2026-11-23 menampilkan All Programs/All Statuses dengan benar. Blank trigger sebelumnya terbukti pada fase awal, tetapi belum membuktikan kegagalan persisten setelah hidrasi; reproduksi cold-load perlu membedakan timing dari defect Select. Kekurangan accessible name tetap temuan tersendiri.

Probe reflow lanjutan 390px mengonfirmasi perluasan C15: header clinic (`apps/showcase/src/scenarios/clinic/components/clinic-header.tsx:76`) client 390/scroll 454; month calendar (`packages/ui/src/components/data-display/event-calendar.tsx:1375`–`:1400`) wrapper 342/706 dengan overflow visible/root 730; Stepper import (`apps/showcase/src/app/(docs)/patterns/import-wizard/page.tsx:210`) ol 292/551/root 600; grid notifications (`apps/showcase/src/app/(docs)/patterns/notifications/page.tsx:209`) 342/437/root 461. Semua memperlebar dokumen, berbeda dari tabel pasien yang memakai scroller lokal. Penyebab minimum content per child kalender/notifikasi masih perlu isolasi. Transfer-list row 294/399 memang meluber, tetapi empty toast viewport juga 448px; jangan mengatribusikan seluruh root 448px hanya ke panel transfer.

**C16 — major, katalog beranda tidak terungkap di mobile:** `apps/showcase/src/app/(docs)/page.tsx:532`–`:591` membungkus seluruh katalog dalam satu Reveal; `apps/showcase/src/hooks/use-reveal.ts:16`, `:32`–`:41` memakai threshold 0,15. Probe fokus pada 390×844 setelah hidrasi dan scroll ke dalam katalog mengukur tinggi target 9689px, root observer 804px, intersection ratio 0,08298, `isIntersecting=true`, tetapi `data-visible=false`/opacity 0. Target memasuki viewport dari luar tanpa pernah mencapai threshold 0,15, sehingga konten tetap tersembunyi. Gunakan pemicu yang dapat dicapai untuk section panjang (sentinel atau reveal per kelompok) dan uji masuk viewport dari atas/bawah pada mobile serta reduced motion. Bukti: `cr054-home-threshold.json`. Koreksi timing hero landing tidak berlaku pada bug katalog ini.

Koreksi penting: panel chart yang tampak kosong pada screenshot full-doc bukan defect. Runtime menunggu render menemukan 9 wrapper/85 path di `/components/charts`, 3 wrapper/25 path di `/clinic/reports`, dan 4 path di `/crm`; chart utama 494×209. Ini artefak timing capture. Serupa, hero `/landing` yang kosong pada capture awal adalah keterlambatan hydration/Reveal di dev, bukan kontrak UI final; jangan jadikan temuan tanpa bukti produksi.

**C17 — major, dua CommandPalette terbuka serentak:** graphify mengidentifikasi pemakai global dan demo. `apps/showcase/src/app/(docs)/layout.tsx:24` memasang GlobalCommandPalette, sementara `apps/showcase/src/app/(docs)/patterns/command-palette/page.tsx:119` memasang instance demo kedua. Setiap instance mendengarkan event global yang sama dan shortcut Cmd/Ctrl+K (`packages/ui/src/components/navigation/command-palette.tsx:72`–`:87`). Klik “Open command palette” pada 390px menghasilkan dua `[role=dialog]`; satu Escape masih menyisakan dialog. Jangan menilai probe fokus berdasarkan dialog pertama saja ketika ada dua portal. Perbaikan perlu memastikan satu pemilik aktivasi per konteks, lalu uji pemicu pointer/shortcut, pencarian, Arrow/Enter, Escape dan return focus pada halaman demo maupun global.

## Command verification

Bagian berikut merekam **fase statis awal saja**, bukan keseluruhan CR-054. Runtime/capture kemudian dijalankan dan dicatat pada temuan tambahan, laporan visual, serta `docs/reviews/cr-054-final-audit.md`.

- Inventori glob/scan Python **berhasil: 73 halaman**. Pencarian statis dan baca komponen berhasil; tidak menjalankan/merestart dev server.
- Validator token terarah **berhasil** via `getContrastRatio` + `checkWcagCompliance`; hasil model 8 tema × 2 mode di C01. Percobaan awal `checkCompliance` gagal karena nama API tidak ada; tidak ada file berubah akibatnya.
- `pnpm --filter @ds/ui lint`: **tidak dijalankan**, audit docs-only dan instruksi eksplisit tidak full tests/build.
- `pnpm --filter @ds/ui test`: **tidak dijalankan**, bukan pass/fail baru.
- `pnpm test:tokens`: **tidak dijalankan** sebagai suite; hanya kalkulasi validator terarah di memori.
- Build, CDP, browser, screenshot, port 4000/9444: **tidak diakses/tidak diganggu** oleh audit kode ini.
- Baseline workspace dari STATUS bukan hasil verifikasi baru dan tidak dipakai mengklaim hijau. Perubahan lain yang sudah ada pada working tree bukan milik audit ini.

## Pemetaan CR setelah konsolidasi

CR-055–064 telah dibuat sebagai **draft**, dengan pemetaan lengkap di `docs/reviews/cr-054-final-audit.md`. Tidak ada implementasi atau status approved/done yang ditetapkan.

Tambahan reproduksi akhir C05: `apps/showcase/src/app/(docs)/patterns/dynamic-form/page.tsx:271`–`:281` dan `:349`–`:359` menampilkan error summary saat Publish project dengan nama kosong/owner kosong, tetapi probe tidak menemukan field `aria-invalid=true`; pesan field berupa paragraf tanpa association. Shared Form primitive bukan akar klaim umum ini.

Probe akhir media-gallery membuka satu dialog dan ArrowRight mengganti item, delapan Tab tetap di dalam, Escape menutup tetapi fokus tidak kembali ke pemicu yang difokuskan. Investigasi return focus dimasukkan CR-059, tanpa menggeneralisasi semua Dialog. Probe Kanban menghasilkan announcement drop tetapi tidak mengubah urutan kolom; reorder keyboard belum dibuktikan, bukan pass.
