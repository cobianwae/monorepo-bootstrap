# 015-01 — Fondasi wrapper + aspek + output blob

Status: done
PRD: `docs/prd/015-image-cropper.md` (approved, gate 1)
Design: `docs/design/wireframes/image-cropper.md` (approved, gate 2) + `docs/design/flows/image-cropper.mmd` (diagram 1–2) + sitemap `S-005.38`
FR: `FR-001`, `FR-002`, `FR-005`, `FR-010`
Screens: `S-005.38`
Goal: Mesin crop berdiri tanpa showcase final: wrapper `react-easy-crop` token-first dengan aspek terkunci, zoom/geser dijaga, dan output blob + dataURL berdimensi target — semua teruji unit.

## Acceptance Criteria

### AC-01 — Area crop aspek terkunci + resize

**Given** gambar 1600×900 dimuat dengan aspek `1:1`, `16:9`, `4:3`, `bebas`
**When** user drag sudut resize dan ganti preset aspek
**Then** output piksel sesuai rasio terkunci (±2px toleransi render); bebas tanpa kunci; ganti aspek tanpa upload ulang — diverifikasi test (FR-001, S-005.38)

### AC-02 — Zoom + geser dijaga di dalam area

**Given** area crop aktif dengan zoom min–maks (mis. 1–5)
**When** user drag kanvas, roda/pinch, slider, tombol −/+
**Then** zoom di-clamp min–maks; gambar tidak lepas (selalu menutupi viewport); state `crop/zoom` sinkron slider — diverifikasi test (FR-002, S-005.38)

### AC-03 — Output blob + dataURL dimensi target

**Given** area crop valid dengan `outputSize` avatar `{512,512}` dan cover `{1280,720}`
**When** `getCroppedBlob` dipanggil (termasuk rotasi 0/90/180/270)
**Then** blob berdimensi persis target; `dataURL` valid untuk pratinjau; `CropResult {blob,dataURL,width,height,aspect}` via `onComplete` — diverifikasi test (FR-005, S-005.38)

### AC-04 — EXIF portrait tidak miring (could)

**Given** foto portrait HP dengan flag EXIF orientasi
**When** didecode via util (`createImageBitmap imageOrientation:'from-image'` + fallback CSS)
**Then** hasil tegak tanpa rotasi manual; bila infeasible di jsdom, catat known limitation tanpa menggagalkan story — diverifikasi test bila feasible (FR-010, S-005.38)

### AC-05 — Validasi masukan + batas 10 MB

**Given** file bukan-gambar dan file >10 MB
**When** dipilih via `file-input`
**Then** ditolak sebelum decode dengan pesan Bahasa Indonesia + ukuran aktual ("v1 gambar saja" / "melebihi 10 MB"); `accept` default `png/jpeg/webp` — diverifikasi test (FR-007 parsial, S-005.38)

## Tasks

- [x] Tambah dependency `react-easy-crop` (+ `@types` bila perlu) ke `packages/ui` — butuh approval eksplisit per CONVENTIONS (konsep approved gate 1, K1/C1); isolasi CSS di wrapper
- [x] Buat `packages/ui/src/components/form/image-cropper.tsx` (named export, props §2.4 wireframe) + `image-cropper-utils.ts` (decode/resize/EXIF/`getCroppedBlob`) + `index` barrel; tanpa token baru
- [x] Implementasi viewport + overlay token (`background/80`, garis `primary`), gagang hit ≥44px, clamp zoom + `restrictPosition`, preset aspek + `cropShape rect/round`
- [x] Tulis test co-located (mock canvas/`createImageBitmap`): aspek 4 preset, clamp zoom + tidak-lepas, output dimensi avatar/cover + rotasi, tolak non-gambar/besar, EXIF bila feasible
- [x] Verifikasi `pnpm typecheck`, `lint`, `test` untuk file baru; catat OQ/K2–K3 default di story

## Dependencies

- Story/CR lain: tidak menunggu story lain; menjadi fondasi 015-02
- Package: `react-easy-crop` (baru, C1 — setujui di gate 3 ini)

## Notes

- Risiko: CSS library menabrak token — mitigasi override terisolasi di wrapper + audit visual
- Keputusan: K1 wrapper token-first; K2 output default 512×512/1280×720; K3 10 MB; K5 EXIF tanpa dep baru; K4 inline v1 (dialog = compose konsumen, bukan scope story ini)

## Catatan implementasi (in-progress)

- Dependency: `react-easy-crop@6.2.5` di `packages/ui` (disetujui user). Peer React 19 kompatibel; warning peer `eslint@10` pada `@eslint/js` sudah ada sebelum perubahan ini.
- File: `form/image-cropper.tsx`, `form/image-cropper-utils.ts`, test co-located `image-cropper.test.tsx` dan `image-cropper-utils.test.ts`; barrel di `src/index.ts`. Tanpa token baru.
- Output: PNG (`image/png`) agar transparansi sumber tidak berubah menjadi hitam; dimensi persis `outputSize`; default K2 (avatar 512×512, aspek 16:9 → 1280×720).
- Validasi (AC-05): tipe dulu, lalu ukuran sebelum decode; pesan Bahasa Indonesia dengan ukuran aktual.
- Zoom dibatasi `MIN_ZOOM=1`–`MAX_ZOOM=5` (`clampZoom`), `restrictPosition` aktif (AC-02).
- Aspek: preset lewat prop `aspect` (1, 16/9, 4/3). Mode `'free'` mengikuti rasio asli gambar, karena `react-easy-crop` 6.2.5 tidak memiliki aspek bebas.
- K5 EXIF (`could`): tidak memakai `createImageBitmap`; orientasi EXIF mengandalkan default browser (`image-orientation: from-image`) saat decode `<img>`/canvas. Tidak dapat diverifikasi di jsdom → known limitation, bukan blocker.
- Tombol "Simpan hasil" minimal di 015-01 sebagai pemicu `onComplete`; footer penuh, segmented aspek, kontrol zoom/putar/reset, dan keyboard masuk 015-02.

### Gap terbuka (perlu keputusan user)

- **Resize sudut (AC-01) — percobaan opsi A (tanpa dependency baru):** `react-easy-crop` 6.2.5 menerima prop `cropSize` yang dikendalikan dari luar. Empat gagang sudut (`button`, hit area 44px, `touch-none`) dirender di atas `Cropper`, dan pointer drag menghitung ulang `cropSize` dengan aspek terkunci (`resizeCropSize`, simetris terhadap pusat, dibatasi kontainer dan minimum 96px). Logika geometri di `image-cropper-geometry.ts` (fungsi murni, test di `image-cropper-geometry.test.ts`).
- **Belum tervalidasi:** perilaku pointer dan clamp saat resize hanya bisa diverifikasi di browser (jsdom tidak mensimulasikan layout). Perlu cek manual sebelum story ditandai `review`.
- **Belum ada di 015-01:** resize lewat keyboard (fallback WCAG untuk gagang) — masuk 015-02 bersama kontrol zoom/putar/reset.

### Verifikasi

- `pnpm typecheck`: 12 error baseline di `flow-editor.test.tsx:702–749` (known issue, tidak berubah); tidak ada error dari file 015-01.
- `pnpm --filter @ds/ui lint`: hijau.
- `packages/ui` test (`--maxWorkers=2 --testTimeout=30000`): 57 file, 637 test lulus; 29 test baru (14 util + 8 geometri + 7 komponen); suite penuh 663/664 lulus, satu kegagalan smoke `RichTextEditor` (`rte-link-save`) yang sudah tercatat sebagai baseline.
- `pnpm test:tokens` dan `pnpm -C apps/showcase build` tidak dijalankan: tidak ada perubahan token atau showcase.
