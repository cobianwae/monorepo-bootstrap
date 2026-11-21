# 016 — Lightbox / Gallery

Status: approved
Owner: —
Tanggal: 2026-11-21
Sumber: roadmap RM-15 (`docs/discussions/component-roadmap.md`)

## Problem

Preview file (RM-05, modal `M-001`) menangani satu item + metadata, tetapi tidak
ada overlay galeri standar untuk menjelajah banyak media (prev/next, thumbnail,
zoom). Konsumen merakit lightbox sendiri — hasilnya trap fokus dan label SR
tidak konsisten.

Bukti/konsekuensi:

- Pola `S-005.16` Media Gallery ada sebagai scenario tanpa komponen lightbox
  reusable di belakangnya.
- Preview `M-001` (file manager) butuh komplemen galeri — bukan pengganti.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Lightbox galeri standar | Navigasi multi-item tanpa komponen custom | Scenario + test hijau |
| Navigasi semua input | Keyboard, pointer, dan swipe dasar | Semua tercover test + scenario |
| Dialog accessible | Trap fokus + pengumuman posisi | Lolos audit WCAG 2.1 AA |
| Tanpa dependency baru | Di atas `dialog` + pola existing | Dependency tercatat di constraints |

## Non-goals

- Mengganti preview `M-001` — lightbox adalah komplemen galeri.
- Editor/annotasi gambar.
- Slideshow autoplay dengan audio (autoplay dibatasi reduced-motion — lihat FR-007).
- Manajemen album (tambah/hapus/susun milik konsumen).
- Video playlist kompleks (playback dasar per item — FR-003).

## User & Use Case

Persona (ringkas):

1. **End-user** — melihat foto produk/galeri; ingin geser antar foto tanpa tutup-buka.
2. **Developer konsumen DS** — butuh overlay terkontrol (`openIndex`/`onOpenChange`)
   dengan slot caption.

JTBD:

- "When saya melihat galeri, I want geser ke foto berikut tanpa menutup overlay,
  so I can membandingkan dengan cepat."
- "When saya memakai keyboard, I want Esc menutup dan panah berpindah,
  so I can navigasi tanpa mouse."

Skenario utama:

1. Klik thumbnail ke-3 dari 12 → lightbox terbuka di item 3, counter "3 / 12".
2. Panah kanan → item 4 dengan preload; `Esc` → fokus kembali ke thumbnail ke-4.
3. Klik kaca pembesar → zoom 2x, drag untuk geser; klik lagi → kembali pas.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Overlay fullscreen untuk daftar item (gambar + video dasar) dengan navigasi prev/next + counter posisi. | must | Navigasi 12 item ujung-ke-ujung bekerja (test). |
| FR-002 | Keyboard penuh: `Esc` tutup, panah navigasi, `+`/`-` zoom; trap fokus + kembalikan fokus ke pemicu. | must | Audit a11y lolos; fokus kembali tepat (test). |
| FR-003 | Playback video dasar per item (play/pause native terkontrol). | should | Video tidak autoplay dengan suara; navigasi menghentikan playback item lama. |
| FR-004 | Strip thumbnail + counter + slot caption/metadata per item. | should | Strip sinkron dengan item aktif; caption teramati. |
| FR-005 | Zoom (tombol + keyboard, 1x–4x) dengan geser saat diperbesar. | should | Zoom kembali pas saat pindah item. |
| FR-006 | Swipe horizontal dasar di layar sentuh. | could | Navigasi swipe bekerja di scenario mobile. |
| FR-007 | Hormati `prefers-reduced-motion` (tanpa transisi geser). | must | Terverifikasi via media query (test). |
| FR-008 | State matrix: loading (skeleton saat item dimuat), empty (daftar kosong — tidak dibuka), error (item gagal dimuat + tombol coba lagi/c artworks dilewati). | must | State loading/error teramati di scenario. |
| FR-009 | Showcase scenario galeri → lightbox (upgrade `S-005.16`) dalam light & dark. | must | Route scenario tersedia dan lolos smoke build. |

## Design Refs

- Screen: `S-005.39` Lightbox (`/patterns/lightbox`) — baru, diusulkan di PRD ini;
  berhubungan dengan `S-005.16` Media Gallery (upgrade scenario galeri).
- Komponen terkait: `overlay/dialog.tsx` (basis overlay + trap fokus),
  `base/button.tsx` (kontrol), `data-display/badge.tsx` (counter),
  preview `M-001` file manager (komplemen, bukan duplikat),
  `feedback/skeleton.tsx` (loading item).
- Analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (tabel §4),
  roadmap RM-15.

## Constraints & Dependencies

- Dependency package: **tanpa dependency baru** — di atas Radix `dialog`
  existing + pola media existing.
- Teknis: komponen di `packages/ui` kategori `overlay` (atau `data-display`
  bila diputuskan gate 2); API terkontrol `openIndex`/`onOpenChange`.
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA, light/dark parity, test
  Vitest + Testing Library co-located, alur gate AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Kategori folder: `overlay` vs `data-display`? | open — usulan: `overlay` (basis dialog) |
| 2 | Preload strategi: berapa item ke depan? | open — usulan: 1 ke depan + 1 ke belakang |
| 3 | Apakah unduh/share per item masuk v1? | open — usulan: slot aksi opsional milik konsumen |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-21 | Draft awal dari roadmap RM-15 |
| 2026-11-21 | **Approved (gate 1)** — OQ dibawa ke gate 2 sebagai risiko/desain |
