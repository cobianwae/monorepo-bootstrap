# 015 — Image Cropper

Status: approved
Owner: —
Tanggal: 2026-11-21
Sumber: roadmap RM-14 (`docs/discussions/component-roadmap.md`)

## Problem

Alur avatar/cover (upload → potong → simpan) butuh cropper standar. Hari ini
tidak ada komponen crop di `packages/ui` — konsumen memakai library pihak
ketiga yang gayanya tidak konsisten dengan DS atau melewatkan langkah crop
sehingga gambar tampil terdistorsi.

Bukti/konsekuensi:

- Tidak ada komponen crop di `packages/ui`; `FileUpload` (RM-01) punya preview
  thumbnail tetapi tanpa kemampuan potong.
- Cropper pihak ketiga umumnya membawa CSS sendiri yang menabrak token DS.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Crop avatar/cover standar | Alur upload→crop→simpan tanpa komponen custom | Scenario + test hijau |
| Interaksi presisi | Drag/resize/zoom menghasilkan output sesuai area | Dimensi output terverifikasi test |
| Aksesibilitas crop | Operasi setara via keyboard | Lolos audit WCAG 2.1 AA |
| Tanpa dependency baru | Canvas API browser saja | Dependency tercatat di constraints |

## Non-goals

- Editor foto penuh (filter, teks, stiker, hapus background).
- Upload ke server (output berupa blob/dataURL via callback — eksekusi milik konsumen).
- Crop video.
- Rotasi bebas presisi piksel di v1 (preset 90° — lihat FR-003).

## User & Use Case

Persona (ringkas):

1. **End-user** — mengatur avatar/cover; ingin hasil pas tanpa gambar gepeng.
2. **Developer konsumen DS** — butuh `value`/`onChange` berupa blob dengan aspek
   terkunci sesuai kebutuhan (1:1 avatar, 16:9 cover).

JTBD:

- "When saya mengunggah foto, I want menggeser dan memperbesar area yang pas,
  so I can avatar terlihat bagus."
- "When saya salah area, I want reset ke awal,
  so I can mengulang tanpa upload ulang."

Skenario utama:

1. Pilih foto → area crop 1:1 muncul → drag sudut untuk resize, drag kanvas untuk
   geser → pratinjau lingkaran (avatar) live.
2. Klik reset → kembali ke area awal; klik simpan → blob 512×512 via callback.
3. Keyboard: panah geser area, `+`/`-` zoom.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Area crop drag/resize dengan kunci aspek (preset 1:1, 16:9, 4:3, bebas). | must | Output berdimensi sesuai aspek terkunci (test). |
| FR-002 | Zoom (slider + tombol) dan geser gambar di dalam area. | must | Zoom min–maks dijaga; gambar tidak lepas dari area (test). |
| FR-003 | Rotasi preset 90° dan reset ke kondisi awal. | should | Rotasi + reset bekerja tanpa upload ulang. |
| FR-004 | Pratinjau live hasil (termasuk varian lingkaran untuk avatar). | must | Pratinjau berubah mengikuti area crop. |
| FR-005 | Output via callback (blob + dataURL) dengan dimensi target yang dikonfigurasi. | must | Blob hasil berdimensi sesuai konfigurasi (test). |
| FR-006 | Operasi keyboard penuh: panah geser, `+`/`-` zoom, `R` rotasi, `0` reset; kontrol berupa slider/button berlabel. | must | Audit a11y lolos; semua operasi tanpa mouse. |
| FR-007 | State matrix: loading (decode gambar), empty (belum ada gambar + CTA), error (format rusak/terlalu besar + penyebab). | must | Tiga state teramati di scenario showcase. |
| FR-008 | Dark mode dan kontras: overlay, gagang, kontrol memakai token dan lolos audit light & dark. | must | Scenario light & dark lolos audit kontras. |
| FR-009 | Showcase scenario crop avatar + cover dalam light & dark. | must | Route scenario tersedia dan lolos smoke build. |
| FR-010 | Koreksi orientasi EXIF otomatis. | could | Foto portrait HP tidak miring (test bila feasible). |

## Design Refs

- Screen: `S-005.38` Image Cropper (`/patterns/image-cropper`) — baru, diusulkan di PRD ini.
- Komponen terkait: `form/file-input.tsx` + pola `FileUpload` RM-01 (langkah
  pilih gambar), `form/slider.tsx` (zoom), `base/button.tsx` (rotasi/reset),
  `overlay/dialog.tsx` (varian modal crop), `feedback/empty-state.tsx`.
- Analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (tabel §4),
  roadmap RM-14.

## Constraints & Dependencies

- Dependency package: **tanpa dependency baru** — Canvas 2D API + `createImageBitmap`
  browser; tanpa library crop pihak ketiga.
- Teknis: komponen di `packages/ui` kategori `form`; util decode/resize co-located.
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA, light/dark parity, test
  Vitest + Testing Library co-located (mock canvas bila perlu), alur gate AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Dimensi output default avatar dan cover? | open — usulan: 512×512 avatar, 1280×720 cover |
| 2 | Batas ukuran file masukan default? | open — usulan: 10 MB dengan pesan jelas |
| 3 | Varian inline vs dialog — keduanya di v1? | open — usulan: inline dulu, dialog mengikuti pola `dialog` bila diminta gate 2 |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-21 | Draft awal dari roadmap RM-14 |
| 2026-11-21 | **Approved (gate 1)** — OQ dibawa ke gate 2 sebagai risiko/desain |
