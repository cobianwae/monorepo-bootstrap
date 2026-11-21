# 015-03 — Showcase avatar + cover + audit + smoke

Status: approved
PRD: `docs/prd/015-image-cropper.md` (approved, gate 1)
Design: `docs/design/wireframes/image-cropper.md` (approved, gate 2, §1, §5–§7) + `docs/design/flows/image-cropper.mmd` (diagram 4) + sitemap `S-005.38.01/.02`
FR: `FR-007`, `FR-008`, `FR-009`
Screens: `S-005.38`, `S-005.38.01`, `S-005.38.02`
Goal: Scenario showcase final membuktikan alur avatar/cover ujung-ke-ujung di light & dark: `ol` end-to-end hijau, panel demo semua state, audit kontras + a11y, smoke build lolos.

## Acceptance Criteria

### AC-01 — End-to-end avatar + cover

**Given** route `/patterns/image-cropper` dengan dataset avatar-valid dan cover-valid
**When** user menjalankan `ol` 6 langkah (pilih → geser/zoom → putar/reset → cek lingkaran → simpan → ulangi cover)
**Then** avatar menghasilkan blob 512×512 dan cover 1280×720 via `onComplete`; pratinjau lingkaran tampil di avatar; tanpa error — diverifikasi scenario (FR-009, S-005.38.01/.02)

### AC-02 — Panel demo semua state + aspek

**Given** panel demo dengan dataset valid/rusak/raksasa + pemicu loading/empty/error + toggle aspek + toggle light/dark
**When** dibuka satu per satu
**Then** tiap state §3 teramati (empty/loading/error format/error besar/success); ganti aspek 1:1/16:9/4:3/bebas tanpa upload ulang; resep `onComplete` 15 baris tersalin — diverifikasi scenario (FR-007, FR-009, S-005.38)

### AC-03 — Keyboard + SR penuh di showcase

**Given** alur penuh hanya keyboard + screen reader di light dan dark
**When** menjalankan pilih → aspek → crop → zoom → putar → reset → simpan
**Then** order fokus §4 terjaga (pilih → aspek → area → slider → tombol → pratinjau live → simpan); tiap ganti fokus/zoom/rotasi diumumkan; error selalu teks — diverifikasi audit (FR-006 parsial showcase, S-005.38)

### AC-04 — Parity light/dark + audit kontras

**Given** showcase di light dan dark
**When** diaudit via validator `@ds/tokens`
**Then** teks ≥4.5:1, grafis (garis viewport, gagang, ring) ≥3:1; overlay `background/80` terbaca dua tema; tabel audit dicatat di story implementasi — diverifikasi `pnpm test:tokens` (FR-008, S-005.38)

### AC-05 — Smoke build + sitemap implemented

**Given** showcase final dengan `data-testid` lengkap
**When** dijalankan `pnpm -C apps/showcase build`
**Then** build hijau termasuk route `/patterns/image-cropper`; sitemap S-005.38 series siap ke `implemented` setelah merge — diverifikasi build (FR-009, S-005.38.01/.02)

## Tasks

- [ ] Buat route `/patterns/image-cropper` final: `PageHeader` + card crop 2 kolom (≥md) / stacked (<md) + panel pratinjau + bar kontrol + footer [Pilih][Simpan] + `ol` 6 langkah + panel demo (wireframe §1)
- [ ] Wiring komponen 015-01/015-02: scenario avatar (1:1 + round + 512) dan cover (16:9 + rect + 1280) + dataset valid/rusak/raksasa + resep `onComplete` 15 baris tersalin + `data-testid` (`ic-dropzone`, `ic-area`, `ic-zoom`, `ic-rotate`, `ic-reset`, `ic-preview`, `ic-save`)
- [ ] Audit: keyboard penuh, SR live, fokus ring, `prefers-reduced-motion`, sentuh ≥44px; `test:tokens` light & dark + tabel audit
- [ ] Smoke `pnpm -C apps/showcase build`; tanpa token/dependency baru; responsif <md terverifikasi (fungsi §5 tidak hilang)
- [ ] Update `sitemap.md` S-005.38 series → `implemented` + catat `STATUS-LOG.md` setelah merge per AGENTS.md

## Dependencies

- Story/CR lain: menunggu 015-01 dan 015-02 (komponen + kontrol lengkap)
- Package: tanpa dependency baru

## Notes

- Risiko: file contoh besar memperlambat CI — mitigasi mock raksasa via ukuran tercatat, bukan file biner 10 MB
- Keputusan: K4 dialog = resep compose `dialog` existing (bukan scope story ini); K2/K3 default tampil di demo; K5 limitation dicatat bila ada dari 015-01
