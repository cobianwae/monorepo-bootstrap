# 015-01 — Fondasi wrapper + aspek + output blob

Status: approved
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

- [ ] Tambah dependency `react-easy-crop` (+ `@types` bila perlu) ke `packages/ui` — butuh approval eksplisit per CONVENTIONS (konsep approved gate 1, K1/C1); isolasi CSS di wrapper
- [ ] Buat `packages/ui/src/components/form/image-cropper.tsx` (named export, props §2.4 wireframe) + `image-cropper-utils.ts` (decode/resize/EXIF/`getCroppedBlob`) + `index` barrel; tanpa token baru
- [ ] Implementasi viewport + overlay token (`background/80`, garis `primary`), gagang hit ≥44px, clamp zoom + `restrictPosition`, preset aspek + `cropShape rect/round`
- [ ] Tulis test co-located (mock canvas/`createImageBitmap`): aspek 4 preset, clamp zoom + tidak-lepas, output dimensi avatar/cover + rotasi, tolak non-gambar/besar, EXIF bila feasible
- [ ] Verifikasi `pnpm typecheck`, `lint`, `test` untuk file baru; catat OQ/K2–K3 default di story

## Dependencies

- Story/CR lain: tidak menunggu story lain; menjadi fondasi 015-02
- Package: `react-easy-crop` (baru, C1 — setujui di gate 3 ini)

## Notes

- Risiko: CSS library menabrak token — mitigasi override terisolasi di wrapper + audit visual
- Keputusan: K1 wrapper token-first; K2 output default 512×512/1280×720; K3 10 MB; K5 EXIF tanpa dep baru; K4 inline v1 (dialog = compose konsumen, bukan scope story ini)
