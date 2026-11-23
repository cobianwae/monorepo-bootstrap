# Wireframe — Calendar & Scheduler (S-005.04)

Status: approved (gate 2)
Spec: `docs/design/calendar-scheduler.md` · Flow: `docs/design/flows/calendar-scheduler.mmd` · PRD: `docs/prd/004-calendar-scheduler.md`
Layar: `S-005.04` Calendar (`/patterns/calendar`) + child `S-005.04.01–.04`, modal `M-006`

## 1. Shell (desktop ≥ md)

Shell-first: toolbar satu baris, strip all-day (week/day), grid konten, detail sebagai popover (M-006).

```text
S-005.04 Calendar (/patterns/calendar)
├── Toolbar atas (satu baris, wrap di layar kecil)
│   ├── Kiri: judul periode + tombol [‹] [Hari ini] [›] (FR-002)
│   │   └── label periode mengikuti view: "November 2026" / "17–23 Nov 2026" / "Jumat, 21 Nov 2026"
│   ├── Tengah: switcher view bulan / minggu / hari / agenda (segmented-control, FR-001, FR-014)
│   └── Kanan: locale + awal-pekan (select, FR-010) dan legenda kategori warna
├── Strip all-day (hanya week/day, FR-011)
│   └── "Sepanjang hari" + chip event all-day; terpisah dari grid jam; bisa dipilih via keyboard
├── Grid konten per view
│   ├── S-005.04.01 Month: grid 7×6 di atas `Calendar`/DayPicker existing; sel = nomor + ≤3 chip + "+n lainnya"
│   ├── S-005.04.02 Week: kolom jam kiri + 7 kolom hari; event absolut per menit; konflik tampil berdampingan
│   ├── S-005.04.03 Day: 1 kolom hari + agenda pendamping (list kronologis hari itu)
│   └── S-005.04.04 Agenda (could): list kronologis periode aktif, grup per hari
├── Detail event M-006: popover di desktop (judul, waktu, lokasi, aksi konsumen), dialog/sheet di mobile
└── Status strip bawah grid (demo scenario): rentang terpilih terakhir + view aktif
```

- Kontrol demo scenario (pemicu loading/empty/error, dataset konferensi 3 hari, toggle locale
  en/id, jam kerja 09–17/30 mnt, dataset konflik) hidup di panel demo showcase —
  bukan bagian komponen.
- Form booking bukan bagian komponen: klik slot kosong hanya memanggil `onSelectSlot`;
  form milik konsumen (slot → form → event baru, lihat flow 2).

## 2. Anatomy

### 2.1 Sel bulan (S-005.04.01)

```text
┌──────────────────┐
│ 21          [+n] │  header sel: nomor tanggal + tombol "+n lainnya" (popover daftar hari itu)
│ [chip 09:00 Rapat]│  chip: jam + judul ellipsis; warna kategori token; badge lanjutan "▸" bila multi-hari
│ [chip ▸ Konf day2]│  multi-hari: chip berlanjut di tiap sel berurutan (FR-003); awal/akhir bertanda
│ [·· Hari ini ··]  │  hari ini: ring/border `primary`, bukan hanya warna
└──────────────────┘
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Grid | compose `form/Calendar` (DayPicker v10) + sel custom | tanpa dependency baru (constraint PRD) |
| Chip event | compose `base/badge` | `renderEvent` konsumen boleh ganti isi; warna tetap token |
| Overflow "+n" | internal + `overlay/popover` | popover daftar penuh hari itu; terjangkau keyboard |
| Hari ini / weekend | token `primary` / `muted` | tidak mengandalkan warna saja (teks/ring tambahan) |

### 2.2 Grid minggu/hari (S-005.04.02/.03)

```text
        │ Sen 17 │ Sel 18 │ ... │ Min 23
────────┼────────┼────────┼─────┼────────
09:00   │ [Rapat A] [Rapat B berdampingan] │  konflik: kolom terbagi rata + label "2 bentrok" (FR-004)
10:00   │ [▓ slot kosong — klik untuk booking] │  slot kosong: target klik/keyboard ≥ 24px tinggi per interval
...     │ [Konferensi ▸ berlanjut]            │  multi-hari/menit: blok absolut top/height dari menit
All-day │ [Libur — sepanjang hari]            │  strip atas terpisah (FR-011)
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Kolom jam | internal, konfigurasi `workingHours` + `slotIntervalMinutes` (FR-012) | default 08–18/30 mnt; di luar jam kerja diarsir `muted` |
| Blok event | internal + `base/badge` | posisi absolut dari menit; konflik = kolom terbagi (algoritma §3 spec) |
| Slot kosong | internal gridcell | klik/Enter → `onSelectSlot({start,end,allDay})`; `aria-label` rentang ("Senin 09:00–09:30") |
| Sekarang | garis `destructive` + label jam | `aria-hidden`, tidak mengganggu SR |

### 2.3 Agenda (S-005.04.04, could)

List kronologis grup per hari: header hari (tanggal + jumlah event) → baris event
(waktu, dot kategori, judul, lokasi). Baris adalah tombol yang memanggil
`onSelectEvent` sama seperti blok grid. Empty per hari disembunyikan; empty
periode memakai matrix §4.

### 2.4 Detail event M-006

Popover (desktop) / dialog (mobile): judul, rentang waktu + zona locale konsumen,
lokasi, kategori, deskripsi, tombol aksi sekunder milik konsumen (edit/hapus via
`onAction` atau `renderEventActions`). Fokus terperangkap di dialog mobile;
popover menutup via Esc dan mengembalikan fokus ke event asal.

**Addendum CR-013 (kontrak positioning):** grid dan agenda membuka M-006 dengan anchor
event yang terhubung dan terukur. Dari overflow, anchor adalah trigger `+n` yang tetap
mounted; daftar overflow menutup tanpa memulihkan fokus ke trigger sebelum detail siap.
Desktop: `bottom`/`start`, collision avoidance aktif, padding 8px, `sticky="partial"`;
flip ke atas bila ruang bawah tidak cukup. Anchor null, detached, atau rect tanpa ukuran
memakai Dialog Radix terpusat; pelepasan anchor saat terbuka juga beralih ke dialog.
Mobile tetap Sheet. Bukan popover tanpa acuan di `0,0`.

## 3. State multi-hari & konflik

- Multi-hari (FR-003): event `start < end` beda hari dipecah per hari kalender;
  tiap segmen chip/blok bertanda "lanjutan" (ikon `▸`/`◂` + teks, bukan warna saja);
  klik segmen mana pun → `onSelectEvent` payload event utuh.
- Konflik (FR-004): dua+ event tumpang dalam satu slot → kolom berdampingan sama
  lebar + indikator "n bentrok" di header slot; tiap blok tetap fokusable dan
  membuka M-006 sendiri; tidak ada event yang tertutup penuh.
- Drag (FR-013, could): seret blok → preview bayangan di slot target; lepas →
  `onEventDrop`; operasi setara via menu "Pindah…" (dialog pilih hari + jam) agar
  setara keyboard.

## 4. State matrix komponen (FR-008)

| State | Tampilan | Aksi | Catatan a11y |
|---|---|---|---|
| Empty (periode tanpa event) | `empty-state` "Tidak ada event di periode ini" + ilustrasi + CTA "Buat event" (konsumen) | CTA buka form konsumen; ganti view/periode tetap aktif | `role="status"`; CTA terjangkau keyboard |
| Loading | skeleton grid sesuai view (bulan: 7×6 sel; minggu/hari: kolom jam + blok placeholder; agenda: baris placeholder) | — (navigasi disabled sementara) | `aria-busy="true"` pada grid; bukan spinner saja |
| Error (gagal memuat) | `alert` di area grid: pesan + tombol "Coba lagi" | retry memanggil ulang fetch konsumen (komponen murni: prop `error` + `onRetry`) | `role="alert"`; pesan teks, bukan hanya warna |
| Success berisi | grid + all-day + agenda ter-render; navigasi, select slot/event aktif | next step: booking (flow 2), detail (M-006) | grid `role="grid"`, sel `gridcell`, event tombol bernama |
| Success multi-hari | konferensi 3 hari tampil di 3 sel/blok berurutan + badge lanjutan | klik segmen → detail utuh | label "berlanjut" terbaca SR |

## 5. Keyboard & fokus

- Addendum CR-013: tombol event grid/agenda dan item overflow dapat diaktifkan lewat
  klik/Enter/Space. Escape menutup M-006; fokus kembali ke event asal yang terhubung,
  atau trigger `+n` pada jalur overflow, atau container kalender bila anchor sudah dilepas.
  Peralihan popover → dialog tidak mengembalikan fokus ke luar detail.

- Toolbar: semua kontrol Tab-reachable; switcher view = `radiogroup` panah kiri/kanan;
  tombol periode punya `aria-label` ("Bulan sebelumnya", "Hari ini").
- Grid bulan: sel hari roving tabindex; `←→↑↓` pindah hari; `Enter/Space` pada hari
  → pilih hari (pindah ke day view, skenario PRD §1); `Tab` masuk ke chip event,
  `Enter` → `onSelectEvent` + buka M-006.
- Grid minggu/hari: slot kosong = `gridcell` fokusable; `←→` ganti hari, `↑↓` ganti
  slot interval; `Enter` → `onSelectSlot`; event = tombol di dalam slot, `Enter` →
  detail; konflik tetap urutan Tab logis (waktu, lalu kolom).
- Fokus ring `primary` 2px terlihat di light & dark; `prefers-reduced-motion`
  mematikan animasi drag/preview; garis "sekarang" dan strip aksen tidak pernah
  satu-satunya pembeda (selalu ada teks/label).
- Screen reader: grid `aria-label` mencakup view + periode ("Kalender minggu,
  17–23 November 2026"); perubahan periode/view diumumkan via live region;
  chip event bernama "Rapat A, Senin 09:00–10:00, 2 bentrok".

## 6. Responsive

| Breakpoint | Perilaku |
|---|---|
| ≥ md | Toolbar satu baris; week 7 kolom; day + agenda pendamping dua kolom; popover M-006. |
| < md | Toolbar wrap (switcher pindah baris); month tetap 7 kolom mini (chip jadi dot + jumlah); week menjadi day-swipe (1–3 hari + tombol hari); M-006 jadi dialog/sheet full. |

Fungsi inti yang tidak boleh hilang di layar kecil: ganti view, navigasi periode,
pilih slot/event, semua state §4.

## 7. Light/dark parity

- Hanya token semantik: permukaan `background`/`card`, teks
  `foreground`/`muted-foreground`, garis `border`, aksen kategori
  `primary/success/warning/info/destructive` (FR-003), garis sekarang `destructive`.
- Tidak ada hex literal; tiap pasangan kategori-di-atas-permukaan diverifikasi
  kontras WCAG AA (≥ 4.5:1 teks, ≥ 3:1 grafis besar) di light & dark saat
  implementasi. Strip/dot kategori selalu ditemani label teks kategori.
- Legenda kategori di toolbar memakai token yang sama dengan chip sehingga
  parity terjaga otomatis.
