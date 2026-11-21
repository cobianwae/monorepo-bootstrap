# 016-03 — Showcase + audit + smoke

Status: todo
PRD: `docs/prd/016-lightbox-gallery.md` (approved, gate 1)
Design: `docs/design/wireframes/lightbox-gallery.md` (approved, gate 2, §1/`ol` 6 langkah + §6) + `docs/design/flows/lightbox-gallery.mmd` (diagram 4)
FR: `FR-009` (verifikasi penuh `FR-001`–`FR-008` di showcase)
Screens: `S-005.16`, `M-012`
Goal: Route `/patterns/media-gallery` terupgrade memakai `overlay/lightbox` reusable: grid thumbnail → `M-012` terkontrol, panel demo semua state light & dark, audit kontras token, dan smoke build hijau.

## Acceptance Criteria

### AC-01 — Galeri → lightbox end-to-end di showcase

**Given** route `/patterns/media-gallery` dengan 12 gambar + 1 video + 1 item rusak
**When** user menjalankan `ol` 6 langkah (§1 wireframe): klik thumbnail ke-3 → counter "3 / 12" → panah kanan ke item 4 → zoom 2x + drag → pindah item (zoom reset) → `Esc`
**Then** semua langkah bekerja tanpa komponen rakitan lama (Dialog DIY diganti `Lightbox`); fokus kembali ke thumbnail pemicu; scenario lolos smoke build — diverifikasi uji manual + build (FR-009, FR-001, S-005.16/M-012)

### AC-02 — Panel demo semua state + light/dark

**Given** panel demo showcase dengan pemicu state dan toggle tema
**When** user memicu loading (throttle mock), empty (filter hingga kosong), error (item rusak + Coba lagi/Lewati), success, lalu beralih light ↔ dark
**Then** tiap state tampil sesuai matrix §3 + strip/counter/caption sinkron dua tema; tidak ada teks di atas backdrop transparan (item di permukaan `card` solid); resep `openIndex`/`onOpenChange` 15 baris bisa disalin — diverifikasi uji manual (FR-008, FR-009, S-005.16)

### AC-03 — Audit kontras + token + keyboard penuh

**Given** komponen dan showcase dari 016-01/016-02
**When** validator `@ds/tokens` dijalankan light & dark + audit keyboard/SR diulang di route final
**Then** teks ≥ 4.5:1, grafis (ring strip, tombol melayang, ring fokus, ikon) ≥ 3:1 (`pnpm test:tokens`); hanya token semantik tanpa token baru; keyboard §4 + swipe + reduced-motion terkonfirmasi di route; sitemap `S-005.16` → `implemented` setelah merge — diverifikasi laporan audit di story (FR-002, FR-006, FR-007, S-005.16)

## Tasks

- [ ] Upgrade `apps/showcase/src/app/(docs)/patterns/media-gallery/page.tsx`: ganti Dialog rakitan dengan `overlay/lightbox` (`openIndex`/`onOpenChange`), pertahankan filter kategori + grid + bulk action; tambah 1 item video + 1 item rusak untuk demo
- [ ] Tambah panel demo (DemoSection): dataset + pemicu loading/empty/error/success + toggle light/dark + resep controlled 15 baris (§1 wireframe)
- [ ] Audit kontras light & dark via `pnpm test:tokens` + audit keyboard/SR/swipe/reduced-motion di route; tulis tabel audit di story
- [ ] Verifikasi `pnpm typecheck`, `lint`, `test`, `pnpm -C apps/showcase build`; update sitemap `S-005.16` + `M-012` → `implemented` setelah merge; tanpa dependency/token baru

## Dependencies

- Story/CR lain: menunggu 016-01 dan 016-02 (komponen lengkap + teruji)
- Package: tanpa dependency baru

## Notes

- Risiko: CSS YARL menabrak token di route nyata — mitigasi override terisolasi dari 016-01 + audit visual §AC-03; backdrop `background/80` menipiskan kontras — mitigasi item di atas `card` solid (sudah di desain §6)
- Keputusan: Dialog DIY lama dihapus (diganti reusable, K7 membedakan dari `M-001` yang tetap milik file manager); C1 dependency disetujui di 016-01
