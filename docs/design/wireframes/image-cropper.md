# Wireframe — Image Cropper (S-005.38)

Status: approved (gate 2 — 2026-11-21)
PRD: `docs/prd/015-image-cropper.md` (approved, gate 1) · Flow: `docs/design/flows/image-cropper.mmd`
Layar: `S-005.38` Image Cropper (`/patterns/image-cropper`) + child `S-005.38.01` avatar + `S-005.38.02` cover
Komponen: `form/image-cropper.tsx` (baru, PRD 015, wrapper `react-easy-crop` token-first) + util `form/image-cropper-utils.ts` (decode/resize/EXIF co-located)

## Keputusan kunci gate 2

| # | Keputusan | Alasan |
|---|---|---|
| K1 | Wrapper `react-easy-crop` token-first: interaksi (drag/resize/zoom/rotasi/aspek) milik library, gaya (overlay, gagang, grid, kontrol) milik DS via token semantik + CSS override terisolasi | PRD constraints gate 1; crop presisi tanpa membangun ulang mesin crop; CSS pihak ketiga tidak menabrak token |
| K2 | OQ#1 decided: output default avatar `512×512`, cover `1280×720`; configurable via `outputSize` | Usulan PRD; avatar persegi cocok thumbnail retina, cover 720p cukup tanpa blob raksasa |
| K3 | OQ#2 decided: batas masukan default `10 MB`; lewat = error + penyebab + CTA, bukan blokir diam-diam | Usulan PRD; decode 10 MB+ rawan OOM mobile; pesan jelas FR-007 |
| K4 | OQ#3 decided: **inline v1**; varian dialog = resep compose `overlay/dialog` existing milik konsumen, bukan modal baru (tanpa `M-NNN` baru) | Scope最小; preseden import-wizard "bukan modal v1"; dialog crop bila diminta tetap token-first tanpa komponen tambahan |
| K5 | EXIF (FR-010 `could`): decode via `createImageBitmap` dengan `imageOrientation: 'from-image'` + fallback `image-orientation: from-image`; bila infeasible di test, catat sebagai known limitation di story | Foto portrait HP tidak miring tanpa dep EXIF tambahan; tanpa `exifr` baru v1 |
| K6 | Dependency `react-easy-crop` butuh approval eksplisit per CONVENTIONS (lihat §8) | Konsep disetujui gate 1 via PRD, tetapi penambahan `package.json` tidak otomatis |

## 1. Shell (desktop ≥ md)

Shell-first: header halaman, area crop + panel pratinjau, bar kontrol, aksi simpan. Panel demo showcase di bawah (bukan bagian pola).

```text
S-005.38 Image Cropper (/patterns/image-cropper)
├── PageHeader: judul "Image Cropper" + deskripsi + badge [react-easy-crop] + segmented aspek [1:1|16:9|4:3|Bebas]
├── Card crop (grid 2 kolom ≥md)
│   ├── Kiri: area crop (S-005.38.01 / .02 sesuai scenario)
│   │   ├── Empty → ilustrasi + "Belum ada gambar" + [Pilih foto] + batas 10 MB (§4)
│   │   ├── Loading → skeleton area + teks SR "Memuat gambar…" (§4)
│   │   └── Aktif → kanvas crop + overlay redup + grid sepertiga + gagang sudut + live region posisi
│   ├── Kanan: panel pratinjau + kontrol
│   │   ├── Pratinjau live: lingkaran (avatar) + persegi (cover) + label dimensi target (§2.3)
│   │   ├── Kontrol zoom: [−] + slider berlabel + [+] + nilai % (§2.2)
│   │   ├── Bar aksi cepat: [Putar 90°] [Atur ulang] (§2.2)
│   │   └── Footer simpan: [Pilih foto lain] + [Simpan hasil] (§2.4)
├── Daftar keyboard SR (visually-hidden + rincian visible): panah geser, +/− zoom, R putar, 0 reset (FR-006 §5)
└── Panel demo showcase (DemoSection, bukan pola): dataset avatar/cover/rusak/raksasa,
    pemicu loading/empty/error, toggle aspek + light/dark, resep onComplete 15 baris
```

- Nomor langkah end-to-end (FR-009): `ol` 1 pilih foto avatar → 2 drag geser + slider zoom → 3 putar + reset → 4 cek pratinjau lingkaran → 5 simpan (blob 512×512) → 6 ulangi untuk cover 16:9 (1280×720).

## 2. Anatomy

### 2.1 Area crop (FR-001 + FR-002)

```text
┌──────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  overlay redup (token, bukan hitam hardcode)
│ ░░┌─────────────────────┐░░░░░░░░ │
│ ░░│                     │░░░░░░░░ │  viewport crop: aspek terkunci
│ ░░│    foto (geser)     │░░░░░░░░ │  drag kanvas = geser; roda/pinch = zoom (dijaga)
│ ░░│                     │░░░░░░░░ │
│ ░░└────●───────────●────┘░░░░░░░░ │  ● = gagang sudut (hit ≥44px, visual ≥24px)
│ ░░░░░░░░░ grid ⅓ ░░░░░░░░░░░░░░░░ │
└──────────────────────────────────┘
  fokus ring primary saat area fokus (keyboard §5)
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Viewport + overlay | wrapper `react-easy-crop` + CSS token | overlay `background/80` (bukan `black/60` hardcode); garis viewport `primary` 2px; grid `primary-foreground/40` tipis |
| Gagang resize | override handle library via token | visual `primary` + border `primary-foreground`; hit area ≥ 44px (a11y sentuh); `bebas` = 4 sudut bebas, terkunci = jaga rasio |
| Gambar dalam area | `crop={{x,y}}` + `zoom` state wrapper | zoom min–maks dijaga (mis. 1–5); gambar tidak lepas: `restrictPosition` + clamp kanvas agar menutupi viewport (FR-002 test) |
| Aspek preset | `form/segmented-control` atau radio di header | `1:1 / 16:9 / 4:3 / bebas`; ganti aspek = hitung ulang crop tanpa upload ulang; diumumkan live region |

Kontrak aspek (dari PRD FR-001):

```text
aspect = 1/1 | 16/9 | 4/3 | number | 'free'
avatar default: 1/1 + cropShape 'round' (viewport lingkaran opsional)
cover default: 16/9 + cropShape 'rect'
```

### 2.2 Kontrol zoom, putar, reset (FR-002 + FR-003 + FR-006)

```text
Zoom: [−] ━━━━━●━━━━━━ [+]  150%
      [Putar 90° (R)]  [Atur ulang (0)]
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Slider zoom | `form/slider.tsx` berlabel | `aria-label "Zoom"` + nilai `%` teks; min–maks sama dengan state crop; keyboard slider native |
| Tombol −/+ | `base/button` outline, `aria-label "Perkecil / Perbesar"` | setara slider untuk SR + sentuh; tahan = repeat opsional (tidak wajib v1) |
| Putar 90° | `base/button` + `kbd R` hint | rotasipreset kelipatan 90° saja (non-goal rotasi bebas); `R` global saat area fokus; diumumkan "Diputar 90 derajat" |
| Atur ulang | `base/button` ghost + `kbd 0` | kembali ke `crop={x:0,y:0} + zoom=1 + rotation=0` awal file ini; tanpa upload ulang (JTBD PRD); fokus tetap di tombol + live "Diaturn ulang" |

### 2.3 Pratinjau live (FR-004)

```text
Pratinjau
○ lingkaran 128px   ┌──────────┐
  (avatar)          │ persegi  │  (cover 16:9 mini)
                    └──────────┘
512×512 • diperbarui live
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Pratinjau persegi | `canvas` mini / `img dataURL` throttled | render dari `croppedAreaPixels` diskala ke ~160px; update tiap `onCropComplete` (bukan tiap frame agar hemat) |
| Pratinjau lingkaran | `base/avatar` + `border-radius full` | hanya scenario avatar (S-005.38.01); label "Pratinjau avatar" + dimensi target teks |
| Label dimensi | teks `muted-foreground` | "512×512" / "1280×720" sesuai `outputSize`; bukan warna saja |

### 2.4 Output + pemicu file (FR-005 + FR-007)

```ts
export interface CropOutputSize { width: number; height: number }
export interface CropResult { blob: Blob; dataURL: string; width: number; height: number; aspect: number }

export interface ImageCropperProps {
  aspect?: 1 | number | 'free';      // default 1 (avatar) atau 16/9 (cover)
  cropShape?: 'rect' | 'round';     // avatar 'round', cover 'rect'
  outputSize?: CropOutputSize;      // default K2: {512,512} / {1280,720}
  maxBytes?: number;                // default 10_000_000 (K3)
  accept?: string;                  // default 'image/png,image/jpeg,image/webp'
  onComplete?: (result: CropResult) => void;
  onError?: (message: string) => void;
}
```

- Render output di util co-located (`image-cropper-utils.ts`): `getCroppedBlob(imageSrc, croppedAreaPixels, rotation, outputSize)` via `canvas` + `toBlob`; `dataURL` via `toDataURL` untuk pratinjau langsung; dimensi hasil = `outputSize` persis (FR-005 test).
- Pemicu file: compose `form/file-input` + `base/button [Pilih foto]`; `accept` gambar saja; validasi ekstensi + ukuran sebelum decode (FR-007).
- Tanpa fetch/persist: hasil via `onComplete` saja; upload milik konsumen (non-goal PRD).

### 2.5 Varian `cva`

| Varian | Nilai | Perilaku |
|---|---|---|
| `aspect` | `square` / `wide` / `standard` / `free` | rasio viewport 1:1, 16:9, 4:3, bebas (§2.1) |
| `shape` | `rect` / `round` | viewport persegi vs lingkaran (avatar) |
| state | `empty` / `loading` / `error` / `ready` / `success` | matrix §4 |

State visual:

| State | Tampilan | Trigger |
|---|---|---|
| Empty | ilustrasi + CTA (tanpa kanvas crop) | `src == null` |
| Loading | skeleton area + `aria-busy` | decode berlangsung |
| Error | `alert destructive` + CTA ganti | format/ukuran/render gagal |
| Ready | kanvas + kontrol aktif | decode berhasil |
| Success | pratinjau akhir + dimensi + CTA ulang | `onComplete` terpanggil |

## 3. State matrix (FR-007 + FR-008)

| State | Tampilan | Aksi | Catatan a11y |
|---|---|---|---|
| Empty (belum ada gambar) | ilustrasi + "Belum ada gambar" + [Pilih foto] + batas "Maks 10 MB • PNG/JPG/WebP" | pilih file | `role="status"`; CTA keyboard-reachable; drag disertai tombol (tanpa drag-only) |
| Loading (decode gambar) | skeleton area crop + skeleton pratinjau + teks SR "Memuat gambar…" | — (kontrol disabled) | `aria-busy="true"` pada region crop; `role="progressbar"` bila progres diketahui; bukan spinner saja |
| Error format rusak | `alert destructive`: "Gambar tidak terbaca" + penyebab (baris alasan: header rusak / bukan gambar) + [Pilih foto lain] | ganti file | `role="alert"`; pesan teks + penyebab, bukan warna saja; fokus pindah ke alert |
| Error terlalu besar | `alert destructive`: "File terlalu besar (N MB > 10 MB)" + [Pilih foto lain] | ganti file / kompres di luar | `role="alert"` + info batas; ukuran aktual disebut |
| Success siap simpan | pratinjau live + dimensi target + [Simpan hasil] aktif | simpan → `onComplete(blob+dataURL)` | live region polite "Pratinjau diperbarui" (throttled, bukan tiap piksel) |
| Success selesai | konfirmasi + pratinjau akhir + "512×512 tersimpan" + [Pilih foto lain] | ulang tanpa upload / file baru | `role="status"`; fokus ke judul sukses |

Semua teramati di showcase S-005.38 via panel demo (di luar komponen): dataset avatar-valid, cover-valid, rusak (header invalid), raksasa (>10 MB mock).

## 4. Keyboard & fokus (FR-006)

Order: [Pilih foto] → segmented aspek → area crop → slider zoom → [−][+] → [Putar] [Atur ulang] → pratinjau (non-fokus, `aria-live`) → [Simpan hasil] → panel demo.

| Konteks | Tombol | Aksi |
|---|---|---|
| Area crop fokus | `← → ↑ ↓` | geser crop 10px (`Shift` = 1px presisi); diumumkan "Area x, y" throttled |
| Area crop fokus | `+` / `-` (dan `=`/`_`) | zoom ±0.1 dalam min–maks; slider sinkron + live "%" |
| Area crop fokus | `R` (`Shift+R` putar balik) | rotasi +90° (preset); live "Diputar N derajat" |
| Area crop fokus | `0` | reset ke awal file ini; live "Diaturn ulang" |
| Slider | `Tab` + panah native | zoom penuh tanpa mouse; tombol −/+ setara pointer |
| Header aspek | `Tab` + panah radio | ganti aspek tanpa mouse; fokus tetap di kontrol |
| Semua error | — | pesan teks + `role=alert`; error tidak warna-saja |

- Area crop = `role="application" aria-roledescription="pemotong gambar" aria-label "Area crop. Panah geser, tambah kurang zoom, R putar, nol reset."` + `tabIndex=0`; alternatif penuh via slider/tombol di bawah (tanpa jebakan fokus).
- Kontrol selalu berupa `slider`/`button` berlabel Bahasa Indonesia (FR-006): "Zoom", "Perkecil", "Perbesar", "Putar 90 derajat", "Atur ulang", "Simpan hasil", "Pilih foto".
- Fokus ring `primary` 2px offset 2 light & dark. `prefers-reduced-motion`: transisi overlay/zoom mati; rotasi instan. Touch: gagang hit ≥ 44px, tombol ≥ 44px, slider ≥ 48px tinggi sentuh.
- Screen reader: viewport `aria-describedby` ke dimensi target ("Hasil 512×512"); pratinjau `aria-live="polite"` + `aria-label "Pratinjau hasil"`; perubahan crop padat di-throttle (umumkan tiap 300 ms, bukan tiap frame).

## 5. Responsive

| Breakpoint | Perilaku |
|---|---|
| `≥md` | Grid 2 kolom: kiri area crop (aspek penuh), kanan pratinjau + kontrol sticky; toolbar aspek satu baris |
| `<md` | Stacked: area crop penuh → pratinjau horizontal (lingkaran + persegi mini) → kontrol wrap; footer [Pilih][Simpan] full-width stacked |

Fungsi yang tidak boleh hilang di kecil: pilih/ganti foto, semua aspek, zoom slider + tombol, putar + reset, pratinjau lingkaran, simpan + dimensi, semua state §3, semua keyboard §4.

## 6. Light/dark parity + token

Hanya token semantik, tanpa token baru:

| Elemen | Token |
|---|---|
| Permukaan card/panel | `card`, `background` |
| Overlay redup | `background/80` (opasitas di atas token, bukan hex) |
| Garis viewport/grid | `primary` (viewport 2px) / `primary-foreground/40` (grid tipis) |
| Gagang | `primary` isi + border `primary-foreground` + ring fokus `primary` |
| Teks/label/dimensi | `foreground` / `muted-foreground` |
| Error | `destructive` + ikon + teks (bukan warna saja) |
| Sukses/dimensi | `success` + ikon + teks |
| Warning batas 10 MB | teks `muted-foreground` + ikon; error saat lewat = `destructive` |
| Fokus ring | `primary` 2px offset 2 |
| Kontrol/slider/button | token existing `slider`/`button` (tanpa override warna) |

Audit: tiap pasangan teks ≥ 4.5:1, grafis (garis viewport, gagang, ring, ikon) ≥ 3:1 via validator `@ds/tokens` (`pnpm test:tokens`) light & dark saat implementasi; tabel audit di story (FR-008). Risiko overlay gelap light/dark dimitigasi `background/80` yang mengikuti tema + garis `primary` kontras dua arah.

## 7. FR Coverage

| FR | Layar | Flow | Wireframe |
|---|---|---|---|
| FR-001 aspek terkunci 1:1/16:9/4:3/bebas | S-005.38 + segmented header | diagram 2 | §1 shell + §2.1 viewport + §2.5 varian |
| FR-002 zoom + geser dijaga | S-005.38 | diagram 2 | §2.1 clamp + §2.2 slider/tombol |
| FR-003 rotasi 90° + reset | S-005.38 | diagram 2 (G, RS) | §2.2 bar aksi + live |
| FR-004 pratinjau live + lingkaran | S-005.38.01 avatar, S-005.38.02 cover | diagram 3 | §2.3 lingkaran/persegi + label dimensi |
| FR-005 output blob+dataURL dimensi target | S-005.38 | diagram 3 (E–O) | §2.4 kontrak `CropResult` + `outputSize` |
| FR-006 keyboard penuh + kontrol berlabel | S-005.38 | diagram 2 (K) | §4 penuh + label ID |
| FR-007 loading/empty/error | S-005.38 | diagram 1 | §3 matrix + dataset demo |
| FR-008 dark + kontras token | S-005.38 | diagram 4 | §6 token + audit |
| FR-009 scenario avatar + cover light & dark | S-005.38.01 + S-005.38.02 | diagram 4 (demo) | §1 `ol` 6 langkah + panel demo |
| FR-010 EXIF otomatis (`could`) | S-005.38 | diagram 1 (P) | K5 + §2.4 util |

OQ PRD: #1 decided K2 (512×512 / 1280×720); #2 decided K3 (10 MB); #3 decided K4 (inline v1, dialog = compose existing).

## 8. Butuh konfirmasi

| # | Item | Rekomendasi |
|---|---|---|
| C1 | Dependency `react-easy-crop` di `packages/ui` — konsep disetujui gate 1 via PRD constraint, tetapi penambahan `package.json` butuh approval eksplisit per CONVENTIONS | Setujui saat story implementasi; CSS diisolasi wrapper token-first; fallback knop internal hanya bila ditolak (scope membesar — butuh CR) |
| C2 | Batas 10 MB (K3) + output default K2 + inline v1 K4 | Disetujui bersama gate 2 ini; perubahan = revisi desain, bukan edit diam-diam |
| C3 | EXIF via `createImageBitmap imageOrientation` tanpa dep baru (K5) | Disetujui sebagai `could`; bila test tunjukkan infeasible, catat known limitation di story tanpa blokir gate |
