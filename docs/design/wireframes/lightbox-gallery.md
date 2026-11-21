# Wireframe — Lightbox / Gallery (S-005.16 + M-012)

Status: approved (gate 2 — 2026-11-21)
PRD: `docs/prd/016-lightbox-gallery.md` (approved, gate 1) · Flow: `docs/design/flows/lightbox-gallery.mmd`
Layar: `S-005.16` Media Gallery (`/patterns/media-gallery`, upgrade) + modal `M-012` Lightbox Gallery (overlay fullscreen)
Komponen: `overlay/lightbox.tsx` (baru, PRD 016, wrapper `yet-another-react-lightbox` token-first) + tipe `overlay/lightbox-types.ts` (co-located, item + props)

## Keputusan kunci gate 2

| # | Keputusan | Alasan |
|---|---|---|
| K1 | Wrapper `yet-another-react-lightbox` token-first: mesin navigasi + zoom + thumbnail + swipe + preload milik library, gaya (overlay, tombol, strip, counter, caption) + microcopy Bahasa Indonesia + trap fokus dan live region milik DS via CSS override terisolasi | PRD constraints gate 1; standar modern lightbox tanpa membangun ulang mesin geser/zoom; CSS pihak ketiga tidak menabrak token |
| K2 | OQ#2 decided: preload **1 ke depan + 1 ke belakang**; item di luar jendela tidak di-fetch | Usulan PRD; navigasi 12 item terasa instan tanpa membanjiri jaringan mobile |
| K3 | OQ#3 decided: **slot aksi opsional** milik konsumen (`renderActions` / `actions`) untuk unduh/share; v1 tanpa tombol bawaan selain navigasi + zoom + tutup | Usulan PRD; unduh/share bukan core galeri; slot menjaga API stabil bila konsumen butuh |
| K4 | Kategori `overlay` confirmed (OQ#1 answered gate 1): `overlay/lightbox.tsx` memakai basis `overlay/dialog` untuk trap fokus + `aria-modal` | Preseden tour di `overlay`; lightbox adalah lapisan di atas konten, bukan renderer data |
| K5 | API terkontrol `openIndex: number | null` + `onOpenChange`: `null` = tertutup; tanpa state internal ganda | PRD §persona developer; pola controlled konsisten dengan `Tour open`; test fokus-kembali deterministik |
| K6 | Dependency `yet-another-react-lightbox` butuh approval eksplisit per CONVENTIONS (lihat §8) | Konsep disetujui gate 1 via PRD constraint, tetapi penambahan `package.json` tidak otomatis |
| K7 | `M-001` File Preview tidak diganti: lightbox = komplemen galeri multi-item; preview satu item + metadata tetap milik file manager | PRD non-goals; menghindari duplikat overlay preview |

## 1. Shell (desktop ≥ md)

Shell-first: grid galeri tetap milik halaman; lightbox `M-012` adalah overlay fullscreen di atasnya. Panel demo showcase di bawah (bukan bagian pola).

```text
S-005.16 Media Gallery (/patterns/media-gallery)
├── PageHeader: judul "Media Gallery" + deskripsi + badge [yet-another-react-lightbox] + filter kategori [Semua|Screenshot|Diagram|Mockup]
├── Grid thumbnail (existing, dipertahankan): kartu gradien + nama file + badge kategori + tombol Expand
│   ├── Empty (filter tanpa hasil) → empty-state + [Atur ulang filter] (§4)
│   └── Pilih (klik / Enter) → buka M-012 di index N (§2.1)
├── M-012 Lightbox Gallery (overlay fullscreen, saat openIndex != null)
│   ├── Bar atas: [Tutup ×] + counter "3 / 12" (badge) + slot aksi opsional K3
│   ├── Area utama: item aktif (gambar / video §2.4) + tombol ‹ Sebelum › Berikut melayang
│   ├── Bar bawah: strip thumbnail (sinkron, aria-current) + caption/metadata slot (§2.3)
│   └── State item: skeleton saat muat / error + Coba lagi + Lewati (§4)
├── Daftar keyboard SR (visually-hidden + rincian visible): Esc tutup, panah navigasi, +/− zoom (§5)
└── Panel demo showcase (DemoSection, bukan pola): dataset 12 gambar + 1 video + 1 rusak,
    pemicu loading/empty/error, toggle light/dark, resep openIndex 15 baris
```

- Nomor langkah end-to-end (FR-009): `ol` 1 klik thumbnail ke-3 dari 12 → 2 counter "3 / 12" → 3 panah kanan ke item 4 (preload) → 4 zoom 2x + drag → 5 pindah item (zoom reset) → 6 Esc (fokus kembali ke thumbnail pemicu).

## 2. Anatomy

### 2.1 Overlay + API terkontrol (FR-001)

```text
┌──────────────────────────────────────────────┐
│ × Tutup        3 / 12        [slot aksi]     │  bar atas (token card)
│                                              │
│  ‹                                    ›     │  tombol melayang kiri/kanan
│           ┌──────────────────┐               │
│           │                  │               │  item aktif: gambar pas / video
│           │   item ke-3      │               │  skeleton saat muat (§4)
│           │                  │               │
│           └──────────────────┘               │
│  ▓▓░░ ●○○○○○  caption: "Dashboard…"         │  strip + caption bar bawah
└──────────────────────────────────────────────┘
  fokus trap di dalam overlay; backdrop klik = tutup (opsional, default ya)
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Overlay + backdrop | YARL `Lightbox` + CSS wrapper token | backdrop `background/80`; permukaan `card`; radius `radius` token; `role="dialog" aria-modal="true" aria-label "Galeri gambar"` |
| Counter posisi | `data-display/badge` | teks "N / total" selalu terlihat, bukan warna saja; `aria-live="polite"` diumumkan tiap pindah ("Gambar 4 dari 12") |
| Tombol Sebelum/Berikut/Tutup | `base/button` icon | `aria-label` Bahasa Indonesia: "Gambar sebelumnya", "Gambar berikut", "Tutup galeri"; hit ≥ 44px; disabled melingkar? **tidak melingkar** — di ujung tombol disabled + diumumkan "Gambar pertama/terakhir" |
| Backdrop klik | YARL `closeOnBackdropClick` | default tutup; tidak menutup saat zoom ≥ 2x drag (mencegah tutup tak sengaja) |

Kontrak item + props (dari PRD FR-001 + FR-004 + K3 + K5):

```ts
export type LightboxItemType = 'image' | 'video';

export interface LightboxItem {
  id: string;
  src: string;
  alt: string;                 // wajib; tanpa alt ditolak dengan pesan dev (a11y)
  type?: LightboxItemType;    // default 'image'
  poster?: string;            // thumbnail video
  caption?: string;           // slot caption per item
  meta?: string;              // metadata kecil (mis. "PNG • 2 MB")
}

export interface LightboxProps {
  items: LightboxItem[];
  openIndex: number | null;              // controlled; null = tertutup (K5)
  onOpenChange: (index: number | null) => void;
  renderCaption?: (item: LightboxItem, index: number) => React.ReactNode; // slot caption
  actions?: React.ReactNode;             // slot aksi opsional K3 (unduh/share milik konsumen)
  closeOnBackdropClick?: boolean;        // default true
}
```

- `items=[]` = empty: lightbox tidak dibuka; grid menampilkan empty-state (§4, FR-008).
- `openIndex` di luar rentang = di-clamp + peringatan dev; tidak crash.

### 2.2 Strip thumbnail + caption (FR-004)

| Bagian | Sumber | Catatan |
|---|---|---|
| Strip thumbnail | plugin YARL `Thumbnails` + CSS token | thumbnail 64px, gap 8px; aktif = ring `primary` 2px + `aria-current="true"`; non-aktif tetap ≥ 3:1 border; keyboard: Tab ke strip → panah pindah |
| Counter | badge "N / total" bar atas | sinkron dua arah: klik strip / panah / swipe memperbarui keduanya dalam frame yang sama |
| Caption slot | `renderCaption` atau `caption` + `meta` teks | judul `foreground`, meta `muted-foreground`; tanpa caption = bar bawah hanya strip (tidak ada ruang kosong raksasa) |

### 2.3 Zoom 1x–4x + geser (FR-005)

| Bagian | Sumber | Catatan |
|---|---|---|
| Mesin zoom | plugin YARL `Zoom` (`maxZoomPixelRatio={4}`) | tombol [+] / [−] + keyboard `+`/`-` + cubit; skala diumumkan live region throttled ("Zoom 200 persen") |
| Geser saat diperbesar | drag / pan library | hanya aktif saat zoom > 1x; di 1x drag = swipe navigasi (§2.5), bukan geser kosong |
| Reset saat pindah | wrapper `onViewChange` | tiap ganti index zoom kembali pas (1x); diumumkan "Zoom diatur ulang"; test FR-005 memeriksa skala |

### 2.4 Video dasar (FR-003)

| Bagian | Sumber | Catatan |
|---|---|---|
| Render video | `<video controls preload="metadata">` per item `type: 'video'` | kontrol native (play/pause/volume/fullscreen); **tanpa autoplay bersuara** (`autoplay` dilarang; `muted` preview opsional milik konsumen) |
| Hentikan saat navigasi | wrapper effect | pindah item = `pause()` + `currentTime` tetap (tidak reset paksa); audio tidak bocor ke item berikut — test FR-003 memeriksa `paused === true` |
| Poster + alt | `poster` + `alt` sebagai `aria-label` | video tanpa poster = thumbnail gradien + ikon play + durasi teks bila diketahui |

### 2.5 Swipe + reduced-motion (FR-006 + FR-007)

| Bagian | Sumber | Catatan |
|---|---|---|
| Swipe horizontal | YARL swipe bawaan | ambang ~50px; hanya sumbu horizontal (scroll vertikal halaman tidak dicuri); setara tombol panah + diumumkan posisi |
| Reduced-motion | media query + prop YARL `animation={{ swipe: 0, zoom: 0 }}` saat `prefers-reduced-motion` | transisi geser mati, ganti instan; zoom tanpa animasi; test via `matchMedia` mock |

### 2.6 Varian `cva`

| Varian | Nilai | Perilaku |
|---|---|---|
| `size` | `fullscreen` (default, satu-satunya v1) | overlay menutup viewport; tanpa varian inline kecil v1 |
| `thumbnails` | `show` / `hide` | strip bawah tampil vs hanya counter (galeri 1 item otomatis `hide`) |
| state | `empty` / `loading` / `error` / `ready` | matrix §4 |

## 3. State matrix (FR-008)

| State | Tampilan | Aksi | Catatan a11y |
|---|---|---|---|
| Empty (daftar kosong — tidak dibuka) | grid `empty-state`: ilustrasi + "Tidak ada media" + [Atur ulang filter] | atur ulang / tambah data milik konsumen | `role="status"`; lightbox tidak dibuka (`openIndex=null`); CTA keyboard-reachable |
| Loading (item dimuat) | skeleton area utama rasio item + teks SR "Memuat gambar…" + strip skeleton | — (navigasi antre, tidak hilang) | `aria-busy="true"` pada region item; bukan spinner saja |
| Error (item gagal dimuat) | `alert` inline di area: "Gambar gagal dimuat" + penyebab + [Coba lagi] [Lewati ke berikut] | coba lagi = muat ulang src; lewati = ke berikut yang bisa dimuat | `role="alert"`; pesan teks + penyebab, bukan warna saja; fokus pindah ke tombol Coba lagi |
| Success (item tampil) | gambar/video + counter + caption + strip sinkron | navigasi / zoom / tutup / slot aksi | live region polite "Gambar N dari total: <alt>" tiap pindah |

Semua teramati di showcase S-005.16 via panel demo (di luar komponen): dataset 12 valid + 1 rusak (error) + filter hingga kosong (empty) + throttle jaringan mock (loading).

## 4. Keyboard & fokus (FR-002)

Order: thumbnail pemicu → [Tutup] → [Sebelum][Berikut] → area item (video kontrol bila video) → strip thumbnail → caption (non-fokus) → slot aksi → cycling di dalam overlay.

| Konteks | Tombol | Aksi |
|---|---|---|
| Grid (lightbox tertutup) | `Enter` / `Space` pada thumbnail | buka di index itu; simpan `document.activeElement` sebagai pemicu kembali |
| Lightbox terbuka | `Esc` | tutup → `onOpenChange(null)` → fokus kembali ke thumbnail pemicu (tepat ke index terakhir bila sempat navigasi) |
| Lightbox terbuka | `←` / `→` | sebelum / berikut; zoom reset; live posisi; di ujung = disabled + umumkan batas |
| Lightbox terbuka | `+` / `-` (dan `=`/`_`) | zoom ±0.5 dalam 1–4; diumumkan throttled; setara tombol [+]/[−] |
| Strip fokus | `Tab` + `← →` | pindah thumbnail aktif tanpa mouse; `aria-current` mengikuti |
| Video aktif | `Tab` + `Space` / `K` opsional | kontrol native play/pause; tidak merebut panah navigasi saat fokus di slider volume (edge case dicatat di story) |
| Semua error | — | pesan teks + `role=alert`; error tidak warna-saja |

- Trap fokus: cycling di dalam `M-012` selama terbuka (basis dialog + verifikasi YARL tidak bocor); konten belakang `inert` + `aria-hidden`.
- Fokus ring `primary` 2px offset 2 light & dark. Touch: semua tombol ≥ 44px; strip thumbnail hit ≥ 44px.
- Screen reader: overlay `aria-label "Galeri gambar"`; counter + posisi `aria-live="polite"`; zoom `aria-live` throttled 300 ms; caption `aria-describedby` ke item.

## 5. Responsive

| Breakpoint | Perilaku |
|---|---|
| `≥md` | Bar atas satu baris (tutup + counter + aksi); tombol ‹ › melayang di sisi area; strip + caption bar bawah horizontal |
| `<md` | Bar atas kompak (tutup + counter; aksi ke overflow bila ada); tombol ‹ › tetap melayang tapi 48px; strip horizontal scroll-snap di bawah caption; caption maks 2 baris + ellipsis |

Fungsi yang tidak boleh hilang di kecil: semua navigasi + counter + Esc, strip sinkron, caption, zoom tombol + keyboard, video kontrol, semua state §3, swipe FR-006.

## 6. Light/dark parity + token

Hanya token semantik, tanpa token baru (K1):

| Elemen | Token |
|---|---|
| Backdrop overlay | `background/80` (mengikuti tema, bukan hitam hardcode) |
| Permukaan bar atas/bawah | `card` + `border` |
| Teks judul/counter/caption/meta | `foreground` / `muted-foreground` |
| Tombol nav/tutup/zoom | token existing `button` (tanpa override warna) |
| Strip aktif ring | `primary` 2px; strip non-aktif border `border` |
| Skeleton loading | token existing `skeleton` |
| Error | `destructive` + ikon + teks (bukan warna saja) |
| Fokus ring | `primary` 2px offset 2 |

Audit: tiap pasangan teks ≥ 4.5:1, grafis (ring strip, tombol melayang, ring fokus, ikon) ≥ 3:1 via validator `@ds/tokens` (`pnpm test:tokens`) light & dark saat implementasi; tabel audit di story (FR-009). Risiko backdrop menipiskan kontras item dimitigasi item di atas permukaan `card` solid + ring `primary` — bukan teks di atas backdrop transparan.

## 7. FR Coverage

| FR | Layar | Flow | Wireframe |
|---|---|---|---|
| FR-001 overlay + prev/next + counter | S-005.16 + M-012 | diagram 1 (D) + 2 (H, NX) | §1 shell + §2.1 kontrak `LightboxItem/Props` |
| FR-002 keyboard + trap + fokus kembali | M-012 | diagram 2 (T) | §4 penuh + pemicu kembali |
| FR-003 video dasar per item | M-012 | diagram 3 (V–VS) | §2.4 tanpa autoplay + henti saat navigasi |
| FR-004 strip + counter + caption slot | M-012 | diagram 2 (H, J) | §2.2 sinkron + `renderCaption` |
| FR-005 zoom 1–4x + geser + reset | M-012 | diagram 3 (Z–ZR) | §2.3 `maxZoomPixelRatio=4` + reset |
| FR-006 swipe horizontal | M-012 | diagram 3 (S) | §2.5 ambang + setara panah |
| FR-007 reduced-motion | M-012 | diagram 3 (RM) | §2.5 animasi 0 + §4 |
| FR-008 loading/empty/error | S-005.16 + M-012 | diagram 1 (E) + 2 (L, ERR) | §3 matrix + dataset demo |
| FR-009 scenario galeri → lightbox light & dark | S-005.16 | diagram 4 (A–F) | §1 `ol` 6 langkah + panel demo |

OQ PRD: #1 answered gate 1 → K4 (`overlay`); #2 open → decided K2 (1+1); #3 open → decided K3 (slot aksi opsional).

## 8. Butuh konfirmasi

| # | Item | Rekomendasi |
|---|---|---|
| C1 | Dependency `yet-another-react-lightbox` (+ plugin Zoom/Thumbnails bawaan paket) di `packages/ui` — konsep disetujui gate 1, tetapi penambahan `package.json` butuh approval eksplisit per CONVENTIONS | Setujui saat story implementasi; wrapper terisolasi token-first; bila ditolak, fallback mesin internal = scope membesar (butuh CR) |
| C2 | K2 (preload 1+1) + K3 (slot aksi, tanpa tombol unduh bawaan) + K5 (controlled `openIndex/null`) | Disetujui bersama gate 2 ini; perubahan = revisi desain |
| C3 | Navigasi tidak melingkar (ujung disabled + umumkan batas) | Disetujui bersama gate 2; bila diinginkan loop, catat sebagai varian `could` di story |
