# 015-03 — Showcase avatar + cover + audit + smoke

Status: review
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

- [x] Buat route `/patterns/image-cropper` final: `PageHeader` + card crop 2 kolom (≥md) / stacked (<md) + panel pratinjau + bar kontrol + footer [Pilih][Simpan] + `ol` 6 langkah + panel demo (wireframe §1)
- [x] Wiring komponen 015-01/015-02: scenario avatar (1:1 + round + 512) dan cover (16:9 + rect + 1280) + dataset valid/rusak/raksasa + resep `onComplete` 15 baris tersalin + `data-testid` (`ic-dropzone`, `ic-area`, `ic-zoom`, `ic-rotate`, `ic-reset`, `ic-preview`, `ic-save`)
- [x] Audit: keyboard penuh, SR live, fokus ring, `prefers-reduced-motion`, sentuh ≥44px; `test:tokens` light & dark + tabel audit
- [x] Smoke `pnpm -C apps/showcase build`; tanpa token/dependency baru; responsif <md terverifikasi (fungsi §5 tidak hilang)
- [x] Update `sitemap.md` S-005.38 series → `implemented` + catat `STATUS-LOG.md` setelah merge per AGENTS.md

## Hasil implementasi (2026-11-24)

- Route `apps/showcase/src/app/(docs)/patterns/image-cropper/` (`page.tsx` + `_lib/demo-data.ts` + `_lib/recipe.ts` + `page.test.tsx` 5 test).
- `data-testid` `ic-*` ditambah di `packages/ui/src/components/form/image-cropper.tsx` (aditif, tanpa perubahan props); test existing diperbarui `crop-preview` → `ic-preview`.
- Dataset demo: valid (default), rusak (`accept="image/png"`), raksasa (`maxBytes={1024}` mock ukuran tercatat, bukan file biner).
- Nav: `Image Cropper` di grup Forms & Flows (`Crop` icon). Sitemap: S-005.38/.01/.02 → `implemented`.
- Audit kontras (validator `@ds/tokens`, `auditSemanticTokenPairs`, pulse light/dark): teks utama 17,11/17,52:1; muted 7,47/7,51:1; tombol primary 8,97/5,65:1; destructive 4,83/6,96:1 — semua ≥4,5:1. Grafis primary (garis viewport/gagang/ring) memakai hue yang sama dengan pasangan tombol ≥5,65:1 (≥3:1). Overlay `background/80` tergantung foto sumber; mengikuti tema + garis `primary`, bukan diukur statis.
- Verifikasi: ui image-cropper 34/34; showcase page 5/5; lint hijau; showcase build:types hijau; build hijau (route terdaftar 16,9 kB); tokens 10/10. Baseline di luar scope: typecheck 12 error FlowEditor; ui 751/752 (timeout OrgChartEditor lulus 38/38 saat suite sendiri); showcase 95/99 (4 gagal flow-editor, sama di baseline `visual-polish`).

## Dependencies

- Story/CR lain: menunggu 015-01 dan 015-02 (komponen + kontrol lengkap)
- Package: tanpa dependency baru

## Notes

- Risiko: file contoh besar memperlambat CI — mitigasi mock raksasa via ukuran tercatat, bukan file biner 10 MB
- Keputusan: K4 dialog = resep compose `dialog` existing (bukan scope story ini); K2/K3 default tampil di demo; K5 limitation dicatat bila ada dari 015-01
