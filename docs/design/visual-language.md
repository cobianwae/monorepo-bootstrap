# Visual Language

Status: **draft** — diisi dari praktik implementasi dominan di `apps/showcase/src/app/(docs)` dan
keputusan sesi `/design-language` 2026-11-22. Section bertanda ✔ sudah diputuskan; ○ belum dikunci
(tidak memblokir). Hanya user yang boleh menetapkan `approved`.
Dimuat otomatis oleh opencode lewat `opencode.json` → `instructions` (CR-034). Jaga tetap ringkas.

## Tujuan

Mendefinisikan bahasa visual showcase dan komponen: hierarki, tipografi, spacing, permukaan,
warna, motion, dan target styling komponen. Bukan pengganti design token; ini lapisan arah.

## Prinsip

- Token-driven: semua keputusan visual harus bisa dipetakan ke token.
- Light dan dark parity: tidak ada arah yang hanya bekerja di satu mode.
- Hierarki jelas: satu fokus utama per layar.
- Density terkendali: showcase boleh padat, tapi tidak boleh sesak.
- Gerak halus: animasi mendukung pemahaman, bukan dekorasi.
- Pakai komponen DS yang sudah ada sebelum menulis ulang dengan tangan (mis. `SegmentedControl`, `Banner`, `PageHeader`).

## Art Direction: Variable vs Invariant ✔

Art direction (`atelier`, `aurora`, `blueprint`; sumber: `packages/tokens/src/art-directions.ts`)
mengubah **kulit**, bukan **struktur**.

| Boleh beda antar art direction (variable) | Tidak boleh beda (invariant) |
|---|---|
| Font display, body, mono | Hierarki heading dan type scale |
| Motif latar (glow, gradient mesh, line graphic) | Spacing dan density |
| Tone palet (`pulse`…`graphite`) | Peran warna (lihat Color Roles) |
| Perlakuan gradient (teks, border) | Skala radius dan elevation |
| | Bentuk state (selected, hover, focus, disabled) |
| | Token motion (durasi, easing) |

Aturan uji: dalam **satu** art direction, dua halaman yang setara harus terlihat satu keluarga.

## Type Scale ✔

Sumber nilai: `TYPOGRAPHY_SCALE` di `packages/tokens/src/tokens.ts`. Tidak ada langkah baru.

| Peran | Langkah scale | Ukuran | Utility | Pemakaian |
|---|---|---|---|---|
| Display | Display | 2.5rem | ○ | Hero landing |
| Judul halaman | Heading 1 | 2rem | via `PageHeader` | Satu per halaman |
| Heading section | Heading 2 | 1.5rem | `text-2xl font-bold font-display` | Level 1 dalam halaman |
| Sub-section | Heading 3 | 1.25rem | `text-xl font-bold font-display` | Hanya bila ada ≥2 kelompok paralel (lihat Section Heading) |
| Lead | Body Large | 1.125rem | `text-lg` | Paragraf pembuka |
| Body | Body Default | 1rem | `text-base` | Isi |
| Deskripsi/UI padat | Body Small | 0.875rem | `text-sm` | Deskripsi kartu, tabel |
| Label/meta/badge | Caption / Meta | 0.75rem | `text-xs` | Label, badge, kode inline kecil |

Aturan:

- Dilarang `text-[Npx]`; teks terkecil adalah `text-xs` (0.75rem).
- `text-lg font-bold` bukan heading; `text-lg` adalah Body Large.
- Heading section dan sub-section memakai `font-display` agar art direction terlihat.
- Heading section ditulis lewat `SectionHeading`, bukan class manual.

Deviasi (diputuskan di CR-050; dokumen mengikuti implementasi, tidak ada perubahan kode):

- `PageHeader` h1 memakai `text-3xl sm:text-4xl` (1.875/2.25rem), bukan 2rem/2.5rem. Keputusan: nilai ini **berlaku** untuk h1 `PageHeader`. Mengubahnya berarti mengubah API publik `@ds/ui`, dan itu hanya dilakukan lewat CR baru bila user memintanya.
- Weight Heading 2/3 di docs = `font-bold` (700), bukan 600 dari token. Keputusan: docs memakai 700. Nilai token weight 600 tidak diubah; sinkronisasi token hanya lewat CR token terpisah.

## Section Heading & Callout (halaman docs) ✔

- Heading section: `SectionHeading` (`apps/showcase/src/components/section-heading.tsx`) — Heading 2, **tanpa ikon**; `actions` opsional di kanan. Hierarki sudah dibawa ukuran, bobot, dan `font-display`; ikon di tiap heading hanya saluran ganda, memutus garis kiri teks, dan (dari audit CR-037) 9 dari 15 ikon lama dekoratif/acak.
- Deskripsi satu kalimat (`text-sm text-muted-foreground`) **opsional**: isi hanya bila menambah informasi yang tidak ada di judul (cara membaca, kapan dipakai). Jangan mengulang judul.
- Ikon tempatnya di navigasi, callout/status, dan kartu fitur, bukan di heading section. Bila kelak ada ≥3 kasus ikon dengan makna tetap lintas halaman (mis. demo, kode, a11y, peringatan), tambahkan prop bertipe union (`kind`), bukan `icon` bebas (CR terpisah).
- Sub-section (Heading 3, `text-xl font-bold font-display`): hanya bila satu section punya ≥2 kelompok paralel yang perlu label dan lebih panjang dari satu layar. Jangan pernah h3 tunggal; kedalaman maksimal `PageHeader` h1 → h2 → h3. Belum ada helper (0 pemakaian; aturan 3x) — tulis `<h3>` manual bila perlu, jadikan helper setelah muncul tiga kali.
- Callout pesan singkat: `Banner variant="highlight"`.
- Panel berbingkai (mis. tester interaktif): `border-highlight/30 bg-highlight/5`, bukan `primary`.
- Helper berada di showcase, bukan `@ds/ui`, agar tidak menambah API publik.

## Spacing & Density ✔

Diturunkan dari praktik dominan (39 halaman memakai root yang sama; 99 section memakai ritme yang sama):

- Root halaman: `space-y-10 animate-in fade-in-50 duration-200`.
- Section: `<section id="…" className="space-y-4 scroll-mt-20">`.
- Grid kartu: `gap-4` untuk kartu kecil, `gap-6` untuk kartu besar.
- Border permukaan: `border-border`.
- Showcase scenario boleh memakai density lebih tinggi daripada docs.

## Layout Patterns ○

- Docs: shell dengan sidebar, konten maksimal, contoh interaktif.
- Scenario: app shell dengan header, sidebar, dan area kerja.
- Landing: hero, fitur, bukti sosial, CTA.

## Surfaces & Depth ○

- Permukaan: background, card, popover, overlay.
- Bayangan dan border mengikuti token; hindari nilai ad-hoc.
- Elevation harus konsisten antara dialog, sheet, dan popover.

## Color Roles ✔

| Token | Peran | Boleh untuk | Tidak boleh untuk |
|---|---|---|---|
| `primary` | Aksi | Button utama, link aksi, fokus | Dekorasi, callout, label meta |
| `highlight` | Aksen dan identitas | Eyebrow, ikon dalam callout/kartu, kartu/pilihan aktif (ring), badge identitas, callout | Aksi utama |
| `muted` | Sekunder | Teks bantu, disabled, permukaan tenang | — |
| `destructive` | Error dan aksi berbahaya | — | Dekorasi |
| `success`, `warning`, `info` | Status | Feedback status | Dekorasi |

Kontras `highlight` (dihitung dari `packages/tokens/src/themes.ts`, light mode): `highlight` di atas
`surface` hanya 3,05–5,19:1 (di bawah 4,5:1 pada 5 dari 8 tema); di atas tint `highlight/10–20` turun
ke 2,5–3,9:1. Aturan:

- Ikon, border, dan fill boleh `highlight` (butuh 3:1, semua tema lolos).
- Teks di bawah 18,5px bold / 24px (mis. `text-xs`, `text-sm`) **tidak** memakai `text-highlight`; pakai
  `text-foreground`. Aksen tetap lewat border/bg/ikon.
- Jangan mengganti `text-primary` menjadi `text-highlight` pada teks kecil hanya demi aturan peran warna.
- Pelanggaran lama yang diketahui (di luar CR-035, dicatat sebagai temuan): eyebrow `PageHeader`
  (`packages/ui`), badge hero `themes/page.tsx`, label/tabel `breakpoints/page.tsx` (nama bp dan z-index).

State terpilih:

- Kontrol segmented/toggle: **wajib** `SegmentedControl` dari `@ds/ui` (state `on` = permukaan `background` + bayangan `xs`); jangan menulis ulang dengan `<button>` dan fill `primary`.
- Item aktif dalam kumpulan pilihan visual (kartu tema, art direction): ring `highlight`.

## Component Styling Targets ○

| Komponen | Target |
|---|---|
| Button | Hierarki primary/secondary/ghost, focus ring jelas |
| Card | Permukaan tenang, border tipis, radius konsisten |
| Data Table | Header jelas, row hover, empty/loading state |
| Dialog/Sheet | Elevation, focus trap, close affordance |
| Form | Label, helper, error yang terbaca |

## Motion ✔

- Duration dan easing memakai token (`MOTION_TOKENS`: 150/250/400ms; `spring`, `smooth`). Sama di semua art direction.
- Demo yang membandingkan durasi memakai easing yang sama; demo yang membandingkan easing memakai durasi yang sama.
- Hormati `prefers-reduced-motion` (`motion-reduce:transition-none`).
- Hindari animasi yang menunda aksi utama.

## Pagar Otomatis

`apps/showcase/src/test/visual-language-guard.test.ts` menggagalkan `text-[Npx]` dan heading section manual
(`text-lg font-bold`, `text-2xl font-bold …`, `<h2>` dengan `flex items-center` = pola ikon+judul manual)
di `app/(docs)/foundations`. Larangan ikon di `SectionHeading` dijaga typecheck (prop `icon` tidak ada).
Cakupan diperluas bertahap ke `components/`, `patterns/`, dll. setelah halamannya dirapikan.

## Changelog

| Tanggal | Perubahan | Status |
|---|---|---|
| 2026-11-19 | Dokumen dibuat sebagai draft | draft |
| 2026-11-22 | Isi Art Direction, Type Scale, Section Heading & Callout, Color Roles dari keputusan sesi `/design-language` | draft |
| 2026-11-22 | Finalkan keputusan: motion invariant, state terpilih mengikuti `SegmentedControl`, spacing dari praktik dominan, deviasi `PageHeader`/weight dicatat (CR-034) | draft |
| 2026-11-22 | Koreksi keputusan: heading section **tanpa ikon**, deskripsi opsional, sub-section hanya bila ≥2 kelompok paralel (helper `level="sub"` dihapus, 0 pemakaian); dikunci user lewat pilihan A (CR-037) | draft |
