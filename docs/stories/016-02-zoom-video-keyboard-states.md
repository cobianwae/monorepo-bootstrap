# 016-02 — Zoom + video + keyboard + states

Status: done
PRD: `docs/prd/016-lightbox-gallery.md` (approved, gate 1)
Design: `docs/design/wireframes/lightbox-gallery.md` (approved, gate 2, K2/K3 + §2.3/§2.4/§2.5/§3/§4) + `docs/design/flows/lightbox-gallery.mmd` (diagram 2–3)
FR: `FR-002`, `FR-003`, `FR-005`, `FR-006`, `FR-007`, `FR-008`
Screens: `S-005.16`, `M-012`
Goal: Lightbox robust dan aksesibel tanpa showcase final: zoom 1–4x + geser + reset, video dasar terkontrol, keyboard penuh + trap + fokus kembali + SR, swipe + reduced-motion, dan state matrix empty/loading/error/success di dalam komponen.

## Acceptance Criteria

### AC-01 — Keyboard penuh + trap + fokus kembali

**Given** fokus di thumbnail pemicu (disimpan saat buka) dan lightbox terbuka
**When** user navigasi penuh hanya keyboard: Tab cycling di dalam overlay, `←`/`→` pindah item, `+`/`-` zoom, `Esc` tutup
**Then** fokus tidak lolos ke belakang (`inert` + `aria-hidden`); tiap pindah live "Gambar N dari total: <alt>"; `Esc` → `onOpenChange(null)` + fokus kembali tepat ke thumbnail pemicu (index terakhir bila sempat navigasi) — diverifikasi audit keyboard + SR (FR-002, M-012)

### AC-02 — Playback video dasar per item

**Given** daftar berisi 1 item `type: 'video'` di antara gambar
**When** user memutar video lalu navigasi ke item berikut
**Then** video memakai kontrol native tanpa autoplay bersuara; saat navigasi menjauh playback item lama berhenti (`paused === true`) dan audio tidak bocor — diverifikasi test (FR-003, M-012)

### AC-03 — Zoom 1x–4x + geser + reset saat pindah

**Given** item gambar aktif pada zoom 1x
**When** user zoom via tombol `[+]`/`[−]` dan keyboard `+`/`-` hingga 4x, drag geser, lalu pindah item
**Then** skala dijaga 1–4x dan diumumkan throttled ("Zoom 200 persen"); drag hanya menggeser saat zoom > 1x; pindah item mereset ke pas + diumumkan "Zoom diatur ulang" — diverifikasi test (FR-005, M-012)

### AC-04 — Swipe + reduced-motion

**Given** lightbox terbuka di perangkat sentuh, lalu dengan `prefers-reduced-motion: reduce` aktif
**When** user swipe horizontal, dan berpindah item / zoom dalam mode reduce
**Then** swipe ≥ ambang menavigasi setara tombol panah + diumumkan posisi (scroll vertikal tidak dicuri); mode reduce mematikan transisi geser dan animasi zoom (ganti instan) — diverifikasi test media query (FR-006, FR-007, M-012)

### AC-05 — State matrix komponen teramati

**Given** komponen dengan `items=[]`, saat item dimuat, dengan item rusak, dan item berhasil tampil
**When** dibuka di host uji
**Then** empty (`role=status`, lightbox tidak dibuka), loading (skeleton + teks SR + `aria-busy`, navigasi antre), error (`role=alert` + penyebab + [Coba lagi][Lewati ke berikut] + fokus ke Coba lagi), success (live posisi + caption) — diverifikasi test (FR-008, S-005.16/M-012)

## Tasks

- [x] Implementasi zoom §2.3 (plugin YARL `Zoom`, `maxZoomPixelRatio={4}`, tombol + keyboard, drag-geser > 1x, reset + umumkan tiap `onViewChange`) + slot aksi opsional K3 (render tanpa tombol bawaan)
- [x] Implementasi video §2.4 (`<video controls preload="metadata">`, larang autoplay bersuara, `pause()` saat navigasi menjauh, `poster` + `alt` sebagai label)
- [x] Implementasi keyboard + fokus §4 (simpan pemicu, trap cycling, `inert` belakang, `Esc`/panah/`+`/`-`, fokus kembali tepat, live region throttled 300 ms, ring `primary`)
- [x] Implementasi swipe §2.5 + reduced-motion (animasi 0 via media query, tanpa prop tambahan)
- [x] Implementasi state matrix §3 (empty/loading skeleton/`aria-busy`/error `alert` + fokus/success live) + test co-located tiap AC + peran ARIA; tanpa dependency/token baru

## Dependencies

- Story/CR lain: menunggu 016-01 (wrapper + navigasi + counter)
- Package: tanpa dependency baru (YARL dari 016-01)

## Notes

- Risiko: live region cerewet saat zoom drag — mitigasi umumkan throttled; kontrol video native merebut panah saat fokus di slider volume — mitigasi catat edge case, navigasi panah prioritas di level overlay
- Keputusan: C3 tidak melingkar tetap; K3 slot aksi tanpa tombol bawaan; showcase penuh + audit kontras di 016-03

- Implementasi (2026-11-25, branch `016-02-zoom-video-keyboard-states`, worktree `arah-prd`, dari `visual-polish` `dbbaab8`): plugin YARL `Zoom` (`maxZoomPixelRatio={4}`, tombol Perbesar/Perkecil DS ring `primary`, reset + umumkan tiap `onViewChange`, live zoom throttled 300 ms) + plugin `Video` (slide `type:'video'`, `controls`/`preload="metadata"`, tanpa autoplay bersuara, `pause()` saat navigasi, `poster`+`alt`); fokus kembali ke pemicu via `document.activeElement` saat buka, live posisi kini "Gambar N dari total: <alt>"; swipe bawaan YARL + `prefers-reduced-motion` mematikan animasi swipe/zoom; state matrix: empty `role=status` tanpa overlay, `loading` skeleton + `aria-busy`, `error` `role=alert` + penyebab + [Coba lagi][Lewati ke berikut] + fokus ke Coba lagi (prop opsional `loading`/`error`/`onRetry` aditif, `width`/`height` opsional pada item; tanpa dependency/token baru). Trap/inert + panah/`+`/`-`/`Esc` milik YARL bawaan (terverifikasi via mock + test fokus-kembali); cek visual browser light/dark di 016-03.
- Verifikasi: typecheck + lint workspace hijau (4 warning eslint-disable mock yang sudah ada); UI 734/734 (lightbox 20/20), tokens 10/10; showcase 111/115 dengan 4 gagal baseline `localStorage.getItem` FlowEditor (terdokumentasi, di luar scope).
- Ditetapkan `done` atas persetujuan user 2026-11-25.
