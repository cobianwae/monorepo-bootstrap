# Wireframe — Product Tour (S-005.20)

Status: approved (gate 2 — 2026-11-21)
PRD: `docs/prd/017-product-tour.md` (approved, gate 1) · Flow: `docs/design/flows/product-tour.mmd`
Layar: `S-005.20` Product Tour (`/patterns/product-tour`) — upgrade dari scenario implemented menjadi basis `overlay/tour` reusable
Komponen: `overlay/tour.tsx` (baru, PRD 017, wrapper `driver.js` token-first) + tipe `overlay/tour-types.ts` (co-located, langkah + status)

## Keputusan kunci gate 2

| # | Keputusan | Alasan |
|---|---|---|
| K1 | Wrapper `driver.js` token-first: mesin spotlight + popover + keyboard dasar milik library, gaya (overlay, popover, progress, tombol) + microcopy Bahasa Indonesia + reduced-motion milik DS via CSS override terisolasi | PRD constraints gate 1; standar industri tur agnostik; tanpa membangun ulang mesin sorot/scroll/penempatan; CSS pihak ketiga tidak menabrak token |
| K2 | OQ#2 decided: konfirmasi Lewati **hanya bila progres > 1 langkah** (sudah melihat ≥ 2 langkah); langkah 1 langsung lewati tanpa dialog; dialog memakai `feedback/alert-dialog` existing, tanpa `M-NNN` baru | PRD skenario §3 (Esc/Lewati → dialog singkat); gesekan minimal di awal, proteksi di tengah; preseden image-cropper "tanpa modal baru" — compose existing cukup |
| K3 | OQ#3 decided: coach mark tunggal **masuk v1 sebagai `could` murah**: `steps.length === 1` dirender sebagai sorotan tunggal, progress "1 dari 1" disembunyikan, tombol primer menjadi "Selesai" | Usulan PRD; path kode sama (tur 1 langkah + `onFinish` langsung); tanpa API tambahan |
| K4 | Resolusi target: `ref` prioritas, `string` selector fallback via driver.js; cek可见 tiap navigasi (`offsetParent` + `getBoundingClientRect` + `visibility`); hilang = lewati + status `skipped-missing` + pemberitahuan, bukan crash | OQ#1 answered gate 1 (ref + selector); PRD FR-003 "target disembunyikan kondisi UI"; layout berubah tidak boleh menghentikan tur |
| K5 | `prefers-reduced-motion`: matikan animasi spotlight + `scrollIntoView({behavior:"auto"})` + transisi popover instan; diumumkan sebagai varian, bukan prop | PRD FR-006; media query testable; konsistensi dengan motion token |
| K6 | Tanpa persistence internal: `open` controlled milik konsumen + `onFinish`/`onSkip` dengan status per langkah; penyimpanan (localStorage/API) milik konsumen | PRD non-goals analitik + constraints "hanya callback"; tur tetap stateless antar reload kecuali konsumen menyimpan |

## 1. Shell (desktop ≥ md)

Shell-first: header halaman, dashboard contoh (target tur), lapisan tur, panel demo showcase di bawah (bukan bagian pola).

```text
S-005.20 Product Tour (/patterns/product-tour)
├── PageHeader: judul "Product Tour" + deskripsi + badge [driver.js] + [5 langkah]
├── Card dashboard contoh (area target tur, bukan data produksi)
│   ├── Bar aksi: [Buat Proyek] (langkah 1) · [Cari] (langkah 2) · [Filter] (langkah 3, bisa disembunyikan demo)
│   ├── Panel statistik: kartu metrik (langkah 4) + tabel mini (langkah 5)
│   └── Lapisan tur (saat open): overlay redup + spotlight lubang di target + popover langkah
├── Popover langkah (satu tampil sesuai step aktif)
│   ├── Header: judul langkah + badge "Langkah N dari total" (disembunyikan bila 1 langkah, K3)
│   ├── Isi: deskripsi 1–2 kalimat + pemberitahuan "Langkah X dilewati: target tidak ditemukan" bila ada
│   ├── Progress: bar tipis + teks "N dari total" (bukan warna saja)
│   └── Footer: [Kembali] (disabled di langkah 1) + kanan [Lewati] [Lanjut/Selesai]
├── Dialog konfirmasi lewati (hanya progres > 1, K2): alert-dialog "Lewati tur?" + [Lanjut tur] [Ya, lewati]
├── Daftar keyboard SR (visually-hidden + rincian visible): Tab / Enter / Esc / panah popover (FR-005 §4)
└── Panel demo showcase (DemoSection, bukan pola): dataset 5 langkah + toggle sembunyi langkah 3 +
    pemicu empty/error, tombol Mulai/Ulangi, toggle light/dark, resep onFinish/onSkip 15 baris
```

- Nomor langkah end-to-end (FR-009): `ol` 1 klik Mulai tur → 2 Lanjut sampai langkah 3 disembunyikan (dilewati + pemberitahuan) → 3 Lanjut ke langkah 5 → 4 Selesai (onFinish) → 5 ulangi + Esc di langkah 3 (dialog konfirmasi K2) → 6 fokus kembali ke Mulai tur.

## 2. Anatomy

### 2.1 Spotlight + popover + progress (FR-001)

```text
┌────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  overlay redup (token)
│ ░░░┌──────────────┐░░░░░░░░░░░░░░░░░░░ │
│ ░░░│ [Buat Proyek]│ ← spotlight lubang │  target disorot + ring primary
│ ░░░└──────────────┘░░░░┌──────────────┐│
│ ░░░░░░░░░░░░░░░░░░░░░░░│ Langkah 2/5  ││  popover: judul + isi + progress
│ ░░░░░░░░░░░░░░░░░░░░░░░│ [Kembali] [Lanjut] │
│ ░░░░░░░░░░░░░░░░░░░░░░░└──────────────┘│
└────────────────────────────────────────┘
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Overlay + lubang spotlight | driver.js `overlay` + CSS wrapper token | overlay `background/80`; lubang padding 8px + radius `radius` token; garis sorot `primary` 2px agar terlihat light & dark |
| Popover langkah | `overlay/popover` compose (judul, isi, footer) | `role="dialog" aria-modal="false" aria-labelledby` judul + `aria-describedby` isi + progress; penempatan `auto` (lihat §2.2) |
| Judul + isi | teks `foreground` + `muted-foreground` | microcopy Bahasa Indonesia: "Langkah N dari total", "Lanjut", "Kembali", "Lewati", "Selesai", "Ya, lewati", "Lanjut tur" |
| Progress | `feedback/progress` + teks "N dari total" | bar `primary` + teks, bukan warna saja; disembunyikan bila 1 langkah (K3); `aria-label "Langkah N dari total"` |
| Target ref | `RefObject<HTMLElement>` prioritas | konsumen meneruskan ref tombol/kartu; stabil saat re-render; fallback selector di bawah |

Kontrak langkah (dari PRD FR-001 + K4):

```ts
export type TourTarget = React.RefObject<HTMLElement | null> | string; // ref prioritas, string = selector driver.js
export interface TourStep {
  id: string;
  target: TourTarget;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto'; // default 'auto'
}
export type TourStepResult = 'shown' | 'skipped-missing' | 'completed';
export interface TourStepStatus { id: string; index: number; result: TourStepResult }
export interface TourProps {
  steps: TourStep[];
  open: boolean;                       // controlled; empty = tidak dimulai (§3)
  initialStep?: number;                // default 0
  onFinish?: (status: TourStepStatus[]) => void;
  onSkip?: (status: TourStepStatus[], atIndex: number) => void;
  onStepChange?: (index: number, status: TourStepStatus[]) => void;
}
```

- `steps` kosong = empty, tur tidak dimulai (FR-007); wrapper tidak memanggil `drive()`.
- `id` stabil untuk status per langkah (FR-004); `index` untuk urutan.

### 2.2 Navigasi + scroll + penempatan adaptif (FR-002)

| Bagian | Sumber | Catatan |
|---|---|---|
| Tombol Lanjut/Kembali/Lewati | `base/button` (primer Lanjut/Selesai, ghost Kembali/Lewati) | Lanjut di terakhir = "Selesai" → `onFinish`; Kembali disabled di langkah 1; semua hit ≥ 44px |
| Scroll ke viewport | driver.js `scrollIntoView` + wrapper reduced-motion (K5) | target di bawah lipatan di-scroll halus (`auto` bila reduced-motion); fokus tidak dicuri scroll — popover yang menerima fokus (§4) |
| Penempatan adaptif | driver.js `position: auto` + flip | popover tidak terpotong: bila bawah sempit → atas; sempit kiri-kanan → bawah full-width di mobile (§5); diumumkan ulang saat flip (tidak diam-diam pindah) |
| Pemberitahuan lewati | teks dalam popover berikut + live region | "Langkah 3 dilewati: target tidak ditemukan" — teks, bukan warna/ikon saja (FR-003) |

### 2.3 Target hilang (FR-003)

| Kondisi | Perilaku |
|---|---|
| Satu target hilang (disembunyikan kondisi UI) | lewati langkah itu, `result="skipped-missing"`, lanjut ke berikut + pemberitahuan di popover berikut; tur tidak crash; `onStepChange` membawa status |
| Semua target hilang | error state (§3): "Semua target tidak ditemukan" + [Tutup tur]; `onSkip(status, atIndex)` dengan semua `skipped-missing`; fokus kembali ke pemicu |
| Target muncul kembali saat Kembali | tampil normal lagi; status langkah diperbarui (`shown` bila dikunjungi ulang) |

- Pengecekan tiap navigasi (Lanjut/Kembali/Mulai), bukan sekali di awal — layout responsif bisa menghilangkan target di tengah tur.

### 2.4 Callback persistence (FR-004)

```ts
// resep showcase 15 baris (konsumen menyalin)
const [open, setOpen] = useState(false);
<Tour steps={STEPS} open={open}
  onFinish={(s) => { localStorage.setItem('tour-done', JSON.stringify(s)); setOpen(false); }}
  onSkip={(s, at) => { localStorage.setItem('tour-skip', JSON.stringify({ at, s })); setOpen(false); }} />
```

- Komponen tidak menyentuh storage/fetch; hanya memanggil callback sekali per akhir (finish/skip/tutup-error).
- Status per langkah memungkinkan konsumen: "jangan ganggu lagi" (JTBD PRD) + resume dari indeks terakhir.

### 2.5 Varian `cva`

| Varian | Nilai | Perilaku |
|---|---|---|
| `spotlight` | `default` / `tight` | padding lubang 8px vs 4px (target padat); ring `primary` tetap 2px |
| `popover` | `default` / `compact` | lebar maks 320px vs 260px; compact untuk mobile (§5) |
| state | `empty` / `active` / `skipped` / `error` / `done` | matrix §3 |

## 3. State matrix (FR-007)

| State | Tampilan | Aksi | Catatan a11y |
|---|---|---|---|
| Empty (langkah kosong / belum mulai) | dashboard contoh tanpa lapisan + [Mulai tur] disabled bila `steps=[]` + teks "Belum ada langkah tur" | definisikan langkah / muat contoh 5 langkah | `role="status"`; CTA keyboard-reachable; tur tidak auto-start (tanpa gangguan) |
| Active (langkah tampil) | spotlight + popover §2.1 + progress "N dari total" | Lanjut/Kembali/Lewati/Esc | popover `role="dialog"` + fokus masuk (§4); progress teks + `aria-label`; live "Langkah N dari total: <judul>" |
| Skipped-step (satu target hilang) | popover berikut + baris info "Langkah X dilewati: target tidak ditemukan" | lanjut tur normal | live region polite; info teks + ikon, bukan warna saja |
| Loading antar-langkah (resolusi target + scroll) | spotlight skeleton singkat + popover `aria-busy="true"` + teks SR "Memuat langkah…" | — (kontrol disabled 150–300 ms) | `aria-busy` pada popover; bukan spinner saja; hormati reduced-motion (instan, K5) |
| Error (semua target hilang) | `alert destructive`: "Semua target tidak ditemukan" + penyebab ("3 dari 3 target hilang") + [Tutup tur] | tutup → `onSkip` semua `skipped-missing` | `role="alert"`; pesan teks + penyebab, bukan warna saja; fokus pindah ke alert lalu kembali ke pemicu saat tutup |
| Success (selesai / dilewati) | konfirmasi ringan "Tur selesai/dilewati" + [Mulai lagi] (demo) | mulai ulang / tutup | `role="status"`; fokus kembali ke [Mulai tur] (§4); tidak merebut fokus berulang |

Semua teramati di showcase S-005.20 via panel demo (di luar komponen): dataset 5 langkah valid, varian langkah-3-hilang, semua-hilang, kosong, serta pemicu loading singkat.

## 4. Keyboard & fokus (FR-005)

Order: [Mulai tur] → popover aktif ([Kembali][Lewati][Lanjut] + judul `tabindex=-1`) → dialog konfirmasi (bila K2) → kembali ke [Mulai tur] saat selesai/lewati/tutup-error.

| Konteks | Tombol | Aksi |
|---|---|---|
| Dashboard (tur tertutup) | `Tab` + `Enter` | fokus [Mulai tur] → buka tur; simpan `document.activeElement` sebagai pemicu kembali |
| Popover aktif | `Tab` | cycling di dalam footer popover (Kembali/Lewati/Lanjut); tidak jebak dashboard di belakang (inert via `aria-hidden` + `inert` pada konten belakang) |
| Popover aktif | `Enter` / `Space` | aktifkan tombol fokus (Lanjut/Kembali/Lewati) |
| Tur aktif | `Esc` | masuk alur lewati flow 3 (K2: dialog bila progres > 1, langsung bila langkah 1) |
| Dialog konfirmasi | `Esc` / `Tab` + `Enter` | Esc = kembali ke tur (batal lewati); [Lanjut tur] vs [Ya, lewati] jelas |
| Semua error | — | pesan teks + `role=alert/status`; error tidak warna-saja |

- Tiap ganti langkah: fokus pindah ke judul popover (`tabindex=-1`) + live region polite "Langkah N dari total: <judul> + <pemberitahuan lewati bila ada>"; SR tidak perlu menebak spotlight visual.
- Selesai/lewati/error-tutup: fokus **dikembalikan ke pemicu** ([Mulai tur]) — menutup PRD §skenario 3; test FR-005 memeriksa `activeElement`.
- Fokus ring `primary` 2px offset 2 light & dark. Touch: semua tombol ≥ 44px; spotlight lubang tidak memerlukan tap presisi (navigasi via tombol).

## 5. Responsive

| Breakpoint | Perilaku |
|---|---|
| `≥md` | Popover 320px di sisi target (`auto` + flip); spotlight padding 8px; footer satu baris [Kembali] kiri + [Lewati][Lanjut] kanan |
| `<md` | Popover full-width bawah (bottom-sheet style, maks 100vw − 32px); spotlight `tight` 4px agar target kecil tetap terlihat; footer stacked ([Lanjut] full-width + [Kembali][Lewati] sebaris) |

Fungsi yang tidak boleh hilang di kecil: semua 5 langkah + lewati anggun, semua tombol + Esc, dialog konfirmasi K2, semua state §3, semua keyboard §4, progress teks.

## 6. Light/dark parity + token

Hanya token semantik, tanpa token baru (K1 + K6):

| Elemen | Token |
|---|---|
| Overlay redup | `background/80` (mengikuti tema, bukan hitam hardcode) |
| Lubang spotlight ring | `primary` 2px (grafis ≥ 3:1 dua arah) |
| Popover permukaan + border | `card` + `border` |
| Teks judul/isi/progress | `foreground` / `muted-foreground` |
| Progress bar | `primary` isi + `muted` trek + teks hitung (bukan warna saja) |
| Tombol | token existing `button` (primer/ghost, tanpa override) |
| Info lewati | `warning` border + teks `foreground` + ikon (bukan warna saja) |
| Error semua hilang | `destructive` + ikon + teks |
| Fokus ring | `primary` 2px offset 2 |

Audit: tiap pasangan teks ≥ 4.5:1, grafis (ring spotlight, progress, ring fokus, ikon) ≥ 3:1 via validator `@ds/tokens` (`pnpm test:tokens`) light & dark saat implementasi; tabel audit di story (FR-008). Risiko overlay redup menipiskan kontras target dimitigasi lubang spotlight tanpa redup + ring `primary` solid.

## 7. FR Coverage

| FR | Layar | Flow | Wireframe |
|---|---|---|---|
| FR-001 langkah + target + spotlight + popover + progress | S-005.20 | diagram 1 (H) | §1 popover + §2.1 kontrak `TourStep` + progress |
| FR-002 Lanjut/Kembali/Lewati + scroll + penempatan adaptif | S-005.20 | diagram 2 (NX–H, PV) | §2.2 scroll + flip + footer |
| FR-003 target hilang dilewati anggun | S-005.20 | diagram 2 (M–Q–ERR) | §2.3 + §3 skipped/error |
| FR-004 onFinish/onSkip + status per langkah | S-005.20 | diagram 2 (F) + 3 (O) | §2.4 resep + `TourStepStatus` |
| FR-005 keyboard + Esc + fokus kembali + SR | S-005.20 | diagram 3 + 4 (D) | §4 penuh + pemicu kembali |
| FR-006 reduced-motion | S-005.20 | diagram 4 (E) | K5 + §3 loading instan + §6 |
| FR-007 empty + error (+ loading/success matrix) | S-005.20 | diagram 4 (B–C) | §3 matrix + dataset demo |
| FR-008 dark + kontras token | S-005.20 | diagram 4 (F) | §6 token + audit |
| FR-009 showcase upgrade S-005.20 light & dark | S-005.20 | diagram 4 (A–G) | §1 `ol` 6 langkah + panel demo |

OQ PRD: #1 answered gate 1 → K4 (ref + selector); #2 open → decided K2 (konfirmasi hanya progres > 1); #3 open → decided K3 (coach tunggal = 1 langkah).

## 8. Butuh konfirmasi

| # | Item | Rekomendasi |
|---|---|---|
| C1 | Dependency `driver.js` di `packages/ui` — konsep disetujui gate 1 via PRD constraint, tetapi penambahan `package.json` butuh approval eksplisit per CONVENTIONS | Setujui saat story implementasi; wrapper terisolasi token-first; bila ditolak, fallback mesin internal = scope membesar (butuh CR) |
| C2 | K2 (konfirmasi hanya progres > 1) + reuse `alert-dialog` tanpa `M-NNN` baru | Disetujui bersama gate 2 ini; perubahan = revisi desain |
| C3 | K3 (coach tunggal = tur 1 langkah, progress disembunyikan) | Disetujui bersama gate 2 ini sebagai `could`; bila dianggap scope creep, coret tanpa mengubah shell |
| C4 | Kontrak `TourStep`/`TourProps` controlled + `TourStepStatus` (K4 + §2.4) | Disetujui bersama gate 2 ini; perubahan = revisi desain |
