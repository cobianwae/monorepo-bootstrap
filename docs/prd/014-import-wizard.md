# 014 — Import Wizard CSV

Status: approved
Owner: —
Tanggal: 2026-11-21
Sumber: roadmap RM-13 (`docs/discussions/component-roadmap.md`)

## Problem

Admin tool dan onboarding data massal butuh impor CSV (upload → petakan kolom →
validasi → konfirmasi). Hari ini tidak ada pola impor standar — konsumen merakit
stepper + tabel mapping + pesan error sendiri, hasilnya validasi tidak konsisten
dan error per baris sulit dibaca.

Bukti/konsekuensi:

- Tidak ada komponen/pola impor di `packages/ui`; `FileUpload` (RM-01) hanya
  menangani antrean upload, bukan pemetaan dan validasi isi.
- Pola `S-005.24` Stepper dan `S-005.14` Master Data ada sebagai scenario tanpa
  pola impor reusable di belakangnya.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Impor CSV ujung-ke-ujung standar | Alur 4 langkah selesai tanpa komponen custom | Scenario + test hijau |
| Error data mudah diperbaiki | Error per sel/baris teramati + bisa kembali ke mapping | Semua tercover test + scenario |
| Aksesibilitas wizard | Stepper + focus management antar langkah | Lolos audit WCAG 2.1 AA |
| Parsing standar | papaparse + validasi/UI sendiri | Dependency tercatat di constraints |

## Non-goals

- Parsing XLSX di v1 (CSV dulu; lihat FR-010).
- Import langsung ke database/API (hasil berupa data tervalidasi via callback —
  eksekusi milik konsumen).
- Transformasi data kompleks (formula, join antar file).
- Penjadwalan impor berulang (one-shot di v1).
- Mengganti `FileUpload` — dipakai sebagai langkah upload (compose).

## User & Use Case

Persona (ringkas):

1. **Admin/operator** — mengimpor ratusan baris anggota/produk; butuh tahu baris
   mana yang gagal dan kenapa, tanpa mengulang dari awal.
2. **Developer konsumen DS** — mendefinisikan field target + aturan validasi;
   menerima data bersih via callback.

JTBD:

- "When saya mengimpor CSV, I want memetakan kolom sekali lalu melihat pratinjau
  error, so I can memperbaiki sebelum data masuk sistem."
- "When ada baris gagal, I want tahu persis sel penyebabnya,
  so I can perbaiki file tanpa menebak."

Skenario utama:

1. Upload `anggota.csv` → kolom terdeteksi → petakan "Nama Lengkap" → `name`.
2. Pratinjau 5 baris: 2 baris merah (email duplikat, tanggal invalid) dengan pesan
   per sel; kembali ke mapping, perbaiki, lanjut.
3. Konfirmasi ringkasan (200 valid, 2 dilewati) → submit → data via `onComplete`.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Langkah upload: compose upload file (drag & drop + pilih file) dengan validasi format/ukuran; dukung paste isi CSV sebagai alternatif. | must | File valid lanjut ke mapping; file salah ditolak dengan pesan (test). |
| FR-002 | Langkah mapping: petakan kolom CSV ke field target (wajib/opsional), auto-suggest berdasar nama header, tandai field wajib yang belum terpetakan. | must | Lanjut diblokir sampai field wajib terpetakan (test). |
| FR-003 | Langkah validasi: pratinjau baris + error per sel/baris (tipe, wajib, unik, format) dengan pesan Bahasa Indonesia. | must | Setiap aturan yang dilanggar menampilkan pesan di sel penyebab (test). |
| FR-004 | Langkah konfirmasi: ringkasan (valid/gagal/dilewati) + submit menghasilkan data tervalidasi via callback. | must | Data `onComplete` hanya berisi baris valid sesuai opsi lewati/gagalkan (test). |
| FR-005 | Navigasi stepper 4 langkah (kembali/lanjut), state tiap langkah terjaga saat mundur. | must | Mundur ke mapping tidak menghilangkan pemetaan (test). |
| FR-006 | Aturan validasi deklaratif per field (wajib, tipe, pola, unik dalam file). | should | Aturan custom konsumen ikut dievaluasi dan pesannya tampil. |
| FR-007 | Template CSV contoh yang bisa diunduh (header + 1 baris contoh). | should | Tombol unduh menghasilkan CSV sesuai field target. |
| FR-008 | State matrix: loading (parsing file besar), empty (file kosong), error (encoding/delimiter tak terbaca + penyebab). | must | Tiga state teramati di scenario showcase. |
| FR-009 | A11y wizard: stepper berlabel, fokus pindah ke judul langkah, error terhubung ke sel via deskripsi. | must | Audit a11y lolos; alur penuh bisa keyboard. |
| FR-010 | Dukungan XLSX. | won't | Tercatat sebagai iterasi berikut; v1 CSV saja. |
| FR-011 | Showcase scenario impor ujung-ke-ujung (file contoh valid + invalid) dalam light & dark. | must | Route scenario tersedia dan lolos smoke build. |

## Design Refs

- Screen: `S-005.37` Import Wizard (`/patterns/import-wizard`) — baru, diusulkan di PRD ini.
- Komponen terkait: `form/file-input.tsx` + pola `FileUpload` RM-01 (langkah
  upload), `S-005.24` Stepper (navigasi langkah), `data-display/data-table.tsx`
  (pratinjau + error), `feedback/alert.tsx` (ringkasan error),
  `overlay/dialog.tsx` (konfirmasi submit bila destruktif di sisi konsumen).
- Analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (tabel §4),
  roadmap RM-13.

## Constraints & Dependencies

- Dependency package: **`papaparse`** — standar industri parsing CSV
  (delimiter/quote/encoding, worker + streaming untuk file besar); validasi
  dan UI wizard milik sendiri.
- Teknis: pola di `apps/showcase` + komponen bantu di `packages/ui` kategori
  `form`/`data-display` sesuai kebutuhan gate 2; hasil akhir via `onComplete`.
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA, light/dark parity, test
  Vitest + Testing Library co-located, alur gate AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Batas ukuran file/baris default di v1? | open — usulan: 5 MB / 10.000 baris dengan peringatan |
| 2 | Opsi baris gagal: lewati vs gagalkan seluruh impor — default mana? | open — usulan: lewati dengan ringkasan |
| 3 | Delimiter selain koma (titik-koma/tab) — auto-detect di v1? | answered — ya, auto-detect + override manual (bawaan papaparse) |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-21 | Draft awal dari roadmap RM-13 |
| 2026-11-21 | **Approved (gate 1)** — OQ dibawa ke gate 2 sebagai risiko/desain |
| 2026-11-21 | **Revisi dependency (gate 1)**: papaparse untuk parsing CSV; OQ#3 answered (auto-detect + override) |
