# 017 — Tour / Coach Marks

Status: approved
Owner: —
Tanggal: 2026-11-21
Sumber: roadmap RM-16 (`docs/discussions/component-roadmap.md`)

## Problem

Onboarding produk butuh panduan langkah interaktif (sorot elemen + popover
penjelasan). Hari ini pola `S-005.20` Product Tour ada sebagai scenario tanpa
komponen tur reusable di belakangnya — setiap tim onboarding merakit spotlight +
popover + state langkah sendiri.

Bukti/konsekuensi:

- `S-005.20` Product Tour berstatus `implemented` sebagai scenario, tetapi tidak
  ada komponen `tour` di `packages/ui` yang bisa dipakai ulang konsumen.
- Tur rakitan ad-hoc rawan: target hilang saat layout berubah, fokus tidak
  dikembalikan, dan animasi mengabaikan `reduced-motion`.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Komponen tur reusable | Alur 5 langkah tanpa komponen custom | Scenario + test hijau |
| Robust terhadap layout | Target hilang ditangani anggun | Error state tercover test |
| Aksesibilitas tur | Keyboard + SR + reduced-motion | Lolos audit WCAG 2.1 AA |
| Tur pro | driver.js + wrapper DS | Dependency tercatat di constraints |

## Non-goals

- Analitik tur (impresi/konversi milik produk analis milik konsumen).
- Percabangan logika kompleks (branching bersyarat — iterasi berikut).
- Tur multi-halaman dengan state server (scope v1: satu alur SPA).
- Mengganti konten onboarding `S-005.18` — tur adalah pemandu di atas UI existing.
- Autoplay video di dalam langkah.

## User & Use Case

Persona (ringkas):

1. **User baru produk** — butuh dipandu 5 langkah fitur inti tanpa membaca manual.
2. **Developer konsumen DS** — mendefinisikan langkah (target + konten) dan
   menerima callback selesai/dilewati.

JTBD:

- "When saya pertama kali membuka dashboard, I want dipandu ke tombol penting
  satu per satu, so I can mulai bekerja tanpa bingung."
- "When saya melewati tur, I want tidak diganggu lagi,
  so I can langsung bekerja."

Skenario utama:

1. Tur 5 langkah dimulai → spotlight pada tombol "Buat Proyek" + popover
   "Langkah 1 dari 5" → Lanjut → scroll otomatis ke target berikut.
2. Target langkah 3 disembunyikan oleh kondisi UI → langkah dilewati anggun
   dengan catatan, tur lanjut ke langkah 4.
3. `Esc`/Lewati → dialog konfirmasi singkat → fokus kembali ke tombol pemicu.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Langkah berurutan: target (ref/selector) + spotlight + popover (judul, isi, progress "n dari N"). | must | Tur 5 langkah berjalan ujung-ke-ujung (test). |
| FR-002 | Navigasi Lanjut/Kembali/Lewati + scroll target ke viewport + penempatan popover adaptif. | must | Target di bawah lipatan tetap tercapai; popover tidak terpotong. |
| FR-003 | Target hilang: lewati langkah dengan pemberitahuan + lanjutkan tur tanpa crash. | must | Langkah bertarget hilang tidak menghentikan tur (test). |
| FR-004 | Callback `onFinish`/`onSkip` (+ status per langkah) untuk persistence milik konsumen. | should | Konsumen bisa menyimpan status selesai via callback. |
| FR-005 | Keyboard penuh + `Esc` keluar + fokus dikembalikan ke pemicu; langkah terumumkan ke SR. | must | Audit a11y lolos; alur tanpa mouse. |
| FR-006 | Hormati `prefers-reduced-motion` (tanpa animasi spotlight/scroll halus). | must | Terverifikasi via media query (test). |
| FR-007 | State matrix: empty (daftar langkah kosong — tidak dimulai), error (semua target hilang + pesan). | must | Kedua state teramati di scenario. |
| FR-008 | Dark mode dan kontras: spotlight, popover, progress memakai token dan lolos audit light & dark. | must | Scenario light & dark lolos audit kontras. |
| FR-009 | Showcase scenario upgrade `S-005.20` Product Tour dalam light & dark. | must | Route scenario tersedia dan lolos smoke build. |

## Design Refs

- Screen: upgrade `S-005.20` Product Tour (`/patterns/product-tour`) — sudah
  implemented sebagai scenario; komponen reusable menjadi basis barunya.
- Komponen terkait: `overlay/popover.tsx` (basis popover langkah),
  `base/button.tsx` (kontrol), `feedback/progress.tsx` (progress langkah),
  `overlay/dialog.tsx` (konfirmasi lewati bila diperlukan gate 2).
- Analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (tabel §4),
  roadmap RM-16.

## Constraints & Dependencies

- Dependency package: **`driver.js`** — standar agnostik tur/coach marks
  (spotlight, popover, keyboard, API ringan); dibungkus wrapper DS
  (token-first, microcopy Bahasa Indonesia, reduced-motion).
- Teknis: komponen di `packages/ui` kategori `overlay`; storage persistence
  milik konsumen (hanya callback).
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA, light/dark parity, test
  Vitest + Testing Library co-located, alur gate AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Penargetan: ref React saja, atau dukung selector string juga? | answered — keduanya; ref prioritas, selector via driver.js |
| 2 | Konfirmasi saat Lewati — selalu, atau hanya bila progres > 1 langkah? | open |
| 3 | Apakah mode "coach mark tunggal" (satu sorotan tanpa alur) masuk v1? | open — usulan: ya sebagai `could` bila murah |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-21 | Draft awal dari roadmap RM-16 |
| 2026-11-21 | **Approved (gate 1)** — OQ dibawa ke gate 2 sebagai risiko/desain |
| 2026-11-21 | **Revisi dependency (gate 1)**: driver.js + wrapper DS; OQ#1 answered (ref + selector) |
