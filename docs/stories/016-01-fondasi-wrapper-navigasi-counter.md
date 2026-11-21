# 016-01 — Fondasi wrapper + navigasi + counter

Status: todo
PRD: `docs/prd/016-lightbox-gallery.md` (approved, gate 1)
Design: `docs/design/wireframes/lightbox-gallery.md` (approved, gate 2, K1/K2/K4/K5/K7 + §2.1/§2.2) + `docs/design/flows/lightbox-gallery.mmd` (diagram 1–2) + sitemap `S-005.16` / `M-012`
FR: `FR-001`, `FR-004`
Screens: `S-005.16`, `M-012`
Goal: Komponen `Lightbox` controlled berdiri tanpa showcase final: wrapper `yet-another-react-lightbox` token-first dengan overlay fullscreen + navigasi prev/next + counter, strip thumbnail sinkron + slot caption, dan API `openIndex`/`onOpenChange` + preload 1+1 — semua teruji unit.

## Acceptance Criteria

### AC-01 — Navigasi multi-item + counter ujung-ke-ujung

**Given** 12 item dan lightbox dibuka di index 2 (`openIndex={2}`)
**When** user maju/mundur lewat tombol Sebelum/Berikut sampai kedua ujung
**Then** tiap item tampil + counter "N / 12" benar di semua posisi; di ujung tombol arah yang relevan disabled + diumumkan "Gambar pertama/terakhir" (tanpa navigasi melingkar, C3) — diverifikasi test (FR-001, M-012)

### AC-02 — Strip thumbnail + counter + caption sinkron

**Given** lightbox terbuka dengan item bercaption dan bermeta
**When** user melompat via klik thumbnail strip, lalu via panah keyboard
**Then** strip menandai aktif (`aria-current`) + counter + caption/`meta`/`renderCaption` ikut berubah dalam langkah yang sama; tanpa caption bar bawah hanya strip tanpa ruang kosong raksasa — diverifikasi test (FR-004, M-012)

### AC-03 — API terkontrol + preload 1+1

**Given** `items` 12 dan `openIndex={null}` lalu `{5}`
**When** konsumen membuka, menutup, dan memberi index di luar rentang
**Then** `null` = tertutup tanpa render overlay; index valid dibuka tepat; di luar rentang di-clamp + peringatan dev tanpa crash; item N+1/N−1 di-preload, item di luar jendela tidak di-fetch (K2) — diverifikasi test (FR-001, K5, M-012)

## Tasks

- [ ] Tambah dependency `yet-another-react-lightbox` ke `packages/ui` — butuh approval eksplisit per CONVENTIONS (konsep approved gate 1, K1/C1); isolasi CSS wrapper agar tidak menabrak token
- [ ] Buat `packages/ui/src/components/overlay/lightbox-types.ts` (`LightboxItem/LightboxProps` §2.1 wireframe, `alt` wajib, `openIndex: number | null`, `renderCaption` + `actions` slot K3) + `lightbox.tsx` (named export, `overlay/dialog` sebagai basis trap fokus) + barrel export; tanpa token baru
- [ ] Implementasi overlay fullscreen + tombol Sebelum/Berikut/Tutup berlabel ID + counter badge "N / total" (`aria-live` polite) + strip thumbnail sinkron + caption slot + microcopy Bahasa Indonesia (§2.1–§2.2)
- [ ] Tulis test co-located (mock YARL bila perlu di jsdom): navigasi 12 item ujung-ke-ujung, counter benar, ujung disabled, strip sinkron dua arah, caption slot, controlled open/close + clamp, preload 1+1
- [ ] Verifikasi `pnpm typecheck`, `lint`, `test` untuk file baru; catat default K1/K2/K4/K5/K7 di story

## Dependencies

- Story/CR lain: tidak menunggu story lain; menjadi fondasi 016-02
- Package: `yet-another-react-lightbox` (baru, C1 — setujui di gate 3 ini)

## Notes

- Risiko: CSS library menabrak token — mitigasi override terisolasi di wrapper + audit visual di 016-03; jsdom tanpa layout — mitigasi mock + uji integrasi ringan di showcase 016-03
- Keputusan: K1 wrapper token-first; K2 preload 1+1; K4 kategori `overlay`; K5 controlled `openIndex/null`; K7 tanpa ganti `M-001`; C3 tidak melingkar; zoom/video/keyboard/states di 016-02
