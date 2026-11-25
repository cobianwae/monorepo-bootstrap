# 016-03 — Showcase + audit + smoke

Status: review
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

- [x] Upgrade `apps/showcase/src/app/(docs)/patterns/media-gallery/page.tsx`: ganti Dialog rakitan dengan `overlay/lightbox` (`openIndex`/`onOpenChange`), pertahankan filter kategori + grid + bulk action; tambah 1 item video + 1 item rusak untuk demo
- [x] Tambah panel demo (DemoSection): dataset + pemicu loading/empty/error/success + toggle light/dark + resep controlled 15 baris (§1 wireframe)
- [x] Audit kontras light & dark via `pnpm test:tokens` + audit keyboard/SR/swipe/reduced-motion di route; tulis tabel audit di story
- [ ] Verifikasi `pnpm typecheck`, `lint`, `test`, `pnpm -C apps/showcase build` (selesai, lihat audit); update sitemap `S-005.16` + `M-012` → `implemented` setelah merge; tanpa dependency/token baru

## Laporan Audit (2026-11-26)

Implementasi: grid utama tetap 12 gambar (counter `3 / 12` sesuai AC-01); panel demo memakai dataset terpisah 12 gambar + 1 video lokal (`apps/showcase/public/examples/media-gallery/demo-video.mp4`, 37 KB, dibuat lokal via AVFoundation) + 1 item rusak (`missing-image.png` → 404 lokal). Gambar memakai placeholder SVG data-URI lokal dari palet gradien — tanpa URL eksternal, tanpa dependency/token baru. Dialog DIY dihapus; dua instance `Lightbox` controlled (`openIndex`/`onOpenChange`): grid dan panel demo. Test halaman baru: `page.test.tsx` (3 test: counter 3/12, video 13/14 + error 14/14 + empty, resep tampil).

| Area | Metode | Hasil |
|---|---|---|
| Kontras token light & dark | `pnpm test:tokens` (10 test) + `auditThemeTokenPairs()` | 160 pasangan (8 tema × 10 pasangan × 2 mode) semua ≥ 4,5:1; minimum 4,64:1. Tema Pulse: body text 17,11 (light) / 17,52 (dark); card content 17,72 / 16,39; muted caption 7,47 / 7,51; destructive 4,83 / 6,96; highlight accent (grafis) 4,64 / 10,34 ≥ 3:1 |
| Teks di atas backdrop | Inspeksi komponen + halaman | Caption, bar atas, dan state error memakai permukaan `card` solid; tidak ada teks di atas backdrop `background/80` transparan |
| Keyboard + fokus kembali | Test komponen 016-02 (`lightbox.test.tsx`, 20 test) + `ol` 6 langkah di halaman | Panah/zoom/Esc dan pengembalian fokus ke thumbnail pemicu teruji di komponen; langkah manual 6 langkah tercantum di route untuk verifikasi reviewer |
| Screen reader | Test komponen 016-02 | Status live region (`Memuat media`/`Media dimuat`) dan label tombol teruji |
| Swipe + reduced-motion | Library YARL (built-in) + komponen 016-02 | Swipe bawaan library; `prefers-reduced-motion` mematikan transisi/animasi (komponen + kelas `motion-reduce:` showcase); tidak terotomasi di jsdom — verifikasi manual reviewer |
| State demo | `page.test.tsx` | Loading (mock 1,6 dtk), empty (filter ke kosong), error (Coba lagi/Lewati), success (item 3), video, toggle light/dark via `SegmentedControl` + `useTheme` |
| Verifikasi repo | `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build` | Typecheck hijau; lint 0 error (4 warning lama di `packages/ui`); test hijau (tokens 10, ui 742, showcase 135); build showcase hijau. Catatan: 1 test rich-text-editor flaky pada lari paralel pertama, lolos terisolasi (33/33) dan pada lari ulang penuh |

Sisa setelah merge: sitemap `S-005.16` + `M-012` → `implemented` (task ke-4 ditick saat itu).

## Dependencies

- Story/CR lain: menunggu 016-01 dan 016-02 (komponen lengkap + teruji)
- Package: tanpa dependency baru

## Notes

- Risiko: CSS YARL menabrak token di route nyata — mitigasi override terisolasi dari 016-01 + audit visual §AC-03; backdrop `background/80` menipiskan kontras — mitigasi item di atas `card` solid (sudah di desain §6)
- Keputusan: Dialog DIY lama dihapus (diganti reusable, K7 membedakan dari `M-001` yang tetap milik file manager); C1 dependency disetujui di 016-01
