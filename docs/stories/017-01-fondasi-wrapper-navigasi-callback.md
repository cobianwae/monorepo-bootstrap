# 017-01 — Fondasi wrapper + navigasi + callback

Status: review
PRD: `docs/prd/017-product-tour.md` (approved, gate 1)
Design: `docs/design/wireframes/product-tour.md` (approved, gate 2, K1/K3/K4/K6 + §2.1/§2.2/§2.4) + `docs/design/flows/product-tour.mmd` (diagram 1–2) + sitemap `S-005.20`
FR: `FR-001`, `FR-002`, `FR-004`
Screens: `S-005.20`
Goal: Komponen `Tour` controlled berdiri tanpa showcase final: wrapper `driver.js` token-first dengan spotlight + popover + progress, navigasi Lanjut/Kembali/Lewati + scroll + penempatan adaptif, dan callback `onFinish`/`onSkip` berstatus per langkah — semua teruji unit.

## Acceptance Criteria

### AC-01 — Langkah berurutan + spotlight + popover + progress

**Given** 5 langkah (`target` ref/selector + judul + isi) dan tur `open=true`
**When** tur dimulai dan user maju langkah 1→5
**Then** tiap langkah menampilkan spotlight lubang di target + popover judul/isi + badge dan bar "N dari total"; coach tunggal (`steps.length===1`) menyembunyikan progress dan tombol primer menjadi "Selesai" (K3) — diverifikasi test (FR-001, S-005.20)

### AC-02 — Navigasi + scroll + penempatan adaptif

**Given** tur aktif dengan satu target di bawah lipatan dan ruang popover sempit
**When** user menekan Lanjut/Kembali/Lewati
**Then** target di-scroll ke viewport (halus, `auto` bila reduced-motion K5), spotlight pindah, popover flip agar tidak terpotong, Kembali disabled di langkah 1, microcopy Bahasa Indonesia — diverifikasi test (FR-002, S-005.20)

### AC-03 — Callback finish/skip + status per langkah

**Given** tur 5 langkah dengan `open` controlled
**When** user Selesai di langkah terakhir atau Lewati di tengah
**Then** `onFinish(status)` / `onSkip(status, atIndex)` dipanggil tepat sekali dengan `status: {id, index, result}[]`; tanpa storage/fetch internal; konsumen bisa persist via resep 15 baris — diverifikasi test (FR-004, S-005.20)

## Tasks

- [x] Tambah dependency `driver.js` ke `packages/ui` — butuh approval eksplisit per CONVENTIONS (konsep approved gate 1, K1/C1); isolasi CSS wrapper agar tidak menabrak token
- [x] Buat `packages/ui/src/components/overlay/tour-types.ts` (`TourTarget/TourStep/TourStepStatus/TourProps` §2.1 wireframe, `id` stabil, `ref` prioritas + selector fallback K4) + `tour.tsx` (named export, `open` controlled, `initialStep` default 0) + barrel export; tanpa token baru
- [x] Implementasi spotlight + popover (`overlay/popover` compose, `role=dialog` + progress `feedback/progress` + teks "N dari total") + footer `[Kembali][Lewati][Lanjut/Selesai]` + scroll + `position:auto` flip + microcopy ID (§2.1–§2.2)
- [x] Tulis test co-located (mock `driver.js` bila perlu di jsdom): 5 langkah ujung-ke-ujung, progress benar, Kembali disabled langkah 1, scroll/flip dipanggil, callback sekali dengan status lengkap, coach tunggal tanpa progress
- [x] Verifikasi `pnpm typecheck`, `lint`, `test` untuk file baru; catat default K1/K3/K4/K6 di story

## Dependencies

- Story/CR lain: tidak menunggu story lain; menjadi fondasi 017-02
- Package: `driver.js` (baru, C1 — setujui di gate 3 ini)

## Notes

- Risiko: CSS library menabrak token — mitigasi override terisolasi di wrapper + audit visual di 017-03; jsdom tanpa layout — mitigasi mock `getBoundingClientRect`/`scrollIntoView` + uji integrasi ringan di showcase 017-03
- Keputusan: K1 wrapper token-first; K3 coach tunggal murah; K4 ref+selector; K6 tanpa persistence; K2/K5 + target-hilang/keyboard/states di 017-02
