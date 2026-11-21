# 019 — Signature Pad

Status: approved
Owner: —
Tanggal: 2026-11-21
Sumber: roadmap RM-18 (`docs/discussions/component-roadmap.md`)

## Problem

Alur persetujuan (kontrak, consent clinic, serah terima) butuh tanda tangan
digital sederhana di dalam form. Hari ini tidak ada pad tanda tangan di
`packages/ui` — konsumen menempel canvas mentah tanpa smoothing, tanpa undo,
dan tanpa ekspor standar.

Bukti/konsekuensi:

- Tidak ada komponen signature di `packages/ui`; scenario clinic (consent,
  persetujuan tindakan) belum punya pad standar.
- Canvas mentah rakitan sendiri umumnya gagal di sentuh (scroll ikut bergerak)
  dan tidak punya alternatif keyboard.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Pad tanda tangan standar | Coret→undo→ekspor tanpa komponen custom | Scenario + test hijau |
| Goresan halus semua input | Pointer + sentuh dengan smoothing | Teramati di scenario desktop + mobile |
| Tetap bisa keyboard | Kontrol + fallback terlabel | Lolos audit WCAG 2.1 AA |
| Tanpa dependency baru | Canvas 2D API saja | Dependency tercatat di constraints |

## Non-goals

- Verifikasi identitas / sertifikat digital (tanda tangan di sini = goresan
  persetujuan, bukan TTE).
- Pengenalan tulisan tangan (OCR).
- Anotasi dokumen PDF (milik pola dokumen bila ada).
- Penyimpanan server (output via callback — milik konsumen).

## User & Use Case

Persona (ringkas):

1. **Pasien/klien** — menandatangani consent di tablet/HP; butuh area jelas +
   tombol Ulangi yang mudah ditemukan.
2. **Developer konsumen DS** — butuh field form terkontrol dengan nilai dataURL
   + validasi "wajib diisi".

JTBD:

- "When saya diminta tanda tangan, I want mencoret langsung dengan jari,
  so I can selesai dalam hitungan detik."
- "When coretan saya jelek, I want undo sapuan terakhir (bukan hapus semua),
  so I can perbaiki cepat."

Skenario utama:

1. Form consent → pad kosong berlabel + garis panduan → coret 2 sapuan →
   pratinjau mini tampil.
2. Undo → sapuan terakhir hilang; Hapus → konfirmasi bila sudah ada isi.
3. Submit tanpa isi → error validasi "Tanda tangan wajib diisi" terhubung ke pad.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Kanvas coret pointer + sentuh (touch-action dijaga agar scroll tidak ikut) dengan smoothing goresan. | must | Coretan tampil halus di mouse dan sentuh (test + scenario). |
| FR-002 | Undo sapuan terakhir + hapus semua (konfirmasi bila berisi). | must | Undo hanya menghapus sapuan terakhir; hapus meminta konfirmasi (test). |
| FR-003 | Ekspor PNG/SVG dataURL via `value`/`onChange`; kosong = `null` (bukan kanvas blank). | must | Round-trip nilai terverifikasi (test). |
| FR-004 | Opsi ketebalan + warna tinta (default adaptif light/dark). | should | Opsi terlihat dan memengaruhi goresan berikut. |
| FR-005 | Garis panduan + placeholder ("Tanda tangani di sini") yang hilang saat ada isi. | should | Placeholder teramati saat kosong. |
| FR-006 | A11y: pad berlabel (`role="img"` + nama), tombol undo/hapus terjangkau keyboard, error validasi terhubung, fallback ketik-nama sebagai alternatif. | must | Audit a11y lolos; submit keyboard-only memungkinkan. |
| FR-007 | State matrix: empty (placeholder + CTA), error (validasi wajib + beban kanvas gagal), disabled/readonly (tampilkan hasil). | must | Tiga state teramati di scenario showcase. |
| FR-008 | Dark mode dan kontras: tinta, panduan, kontrol memakai token dan lolos audit light & dark. | must | Scenario light & dark lolos audit kontras. |
| FR-009 | Showcase scenario + demo field di `S-004.03` Forms dalam light & dark. | must | Route scenario tersedia dan lolos smoke build. |

## Design Refs

- Screen: `S-005.42` Signature Pad (`/patterns/signature-pad`) — baru, diusulkan
  di PRD ini; demo field di `S-004.03` Forms.
- Komponen terkait: `form/field.tsx` (label + pesan error), `base/button.tsx`
  (undo/hapus), `overlay/dialog.tsx` (konfirmasi hapus bila diperlukan gate 2),
  `feedback/empty-state.tsx` (pola empty).
- Analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (tabel §4),
  roadmap RM-18.

## Constraints & Dependencies

- Dependency package: **tanpa dependency baru** — Canvas 2D API + Pointer Events
  browser.
- Teknis: komponen di `packages/ui` kategori `form`; peka DPI (devicePixelRatio)
  agar goresan tajam.
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA, light/dark parity, test
  Vitest + Testing Library co-located (mock canvas bila perlu), alur gate AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Format ekspor default: PNG vs SVG? | open — usulan: PNG (raster goresan) + SVG sebagai opsi |
| 2 | Fallback ketik-nama: wajib di v1 (FR-006) atau `could`? | open — usulan: `could` bila pad + tombol sudah lolos audit |
| 3 | Ukuran kanvas default (responsif penuh vs rasio tetap)? | open — usulan: rasio 3:1 responsif |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-21 | Draft awal dari roadmap RM-18 |
| 2026-11-21 | **Approved (gate 1)** — OQ dibawa ke gate 2 sebagai risiko/desain |
