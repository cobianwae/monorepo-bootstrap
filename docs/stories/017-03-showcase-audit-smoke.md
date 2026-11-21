# 017-03 — Showcase + audit + smoke

Status: review
PRD: `docs/prd/017-product-tour.md` (approved, gate 1)
Design: `docs/design/wireframes/product-tour.md` (approved, gate 2, §1, §5–§7) + `docs/design/flows/product-tour.mmd` (diagram 4) + sitemap `S-005.20`
FR: `FR-007`, `FR-008`, `FR-009`
Screens: `S-005.20`
Goal: Scenario showcase final membuktikan tur 5 langkah ujung-ke-ujung di light & dark: `ol` end-to-end hijau, panel demo semua state + keyboard + reduced-motion, audit kontras + a11y, smoke build lolos, sitemap siap `implemented`.

## Acceptance Criteria

### AC-01 — End-to-end 5 langkah + lewati + selesai

**Given** route `/patterns/product-tour` dengan dashboard contoh 5 target
**When** user menjalankan `ol` 6 langkah (mulai → lanjut lewati langkah-3-hilang → selesai via `onFinish` → ulangi + Esc di langkah 3 → dialog K2 → fokus kembali)
**Then** tur selesai tanpa crash, status per langkah benar (1 `skipped-missing`), fokus kembali ke [Mulai tur]; tanpa error — diverifikasi scenario (FR-009, S-005.20)

### AC-02 — Panel demo semua state

**Given** panel demo dengan dataset 5 valid + varian langkah-3-hilang + semua-hilang + kosong + pemicu loading singkat + toggle light/dark
**When** dibuka satu per satu
**Then** tiap state §3 teramati (empty/active/skipped/loading/error/success); resep `onFinish`/`onSkip` 15 baris tersalin; toggle sembunyi langkah 3 tanpa reload — diverifikasi scenario (FR-007, FR-009, S-005.20)

### AC-03 — Keyboard + SR + motion di showcase

**Given** alur penuh hanya keyboard + SR di light dan dark dengan reduced-motion diuji
**When** menjalankan mulai → lanjut/kembali → lewati/Esc → selesai
**Then** order fokus §4 terjaga (pemicu → popover → dialog → pemicu); tiap langkah diumumkan + progress teks; reduced-motion instan; error selalu teks — diverifikasi audit (FR-005/FR-006 parsial showcase, S-005.20)

### AC-04 — Parity light/dark + audit kontras

**Given** showcase di light dan dark
**When** diaudit via validator `@ds/tokens`
**Then** teks ≥4.5:1, grafis (ring spotlight, progress, ring fokus, ikon) ≥3:1; overlay `background/80` terbaca dua tema; tabel audit dicatat di story implementasi — diverifikasi `pnpm test:tokens` (FR-008, S-005.20)

### AC-05 — Smoke build + sitemap implemented

**Given** showcase final dengan `data-testid` lengkap
**When** dijalankan `pnpm -C apps/showcase build`
**Then** build hijau termasuk route `/patterns/product-tour`; sitemap S-005.20 siap ke `implemented` setelah merge — diverifikasi build (FR-009, S-005.20)

## Tasks

- [x] Buat route `/patterns/product-tour` final: `PageHeader` + card dashboard contoh (bar aksi + metrik + tabel mini) + lapisan tur + popover + dialog K2 + `ol` 6 langkah + panel demo (wireframe §1) + responsif <md (§5: popover bottom-sheet, footer stacked)
- [x] Wiring komponen 017-01/017-02: scenario 5 langkah + toggle sembunyi langkah 3 + varian kosong/semua-hilang/loading + resep callback 15 baris tersalin + `data-testid` (`tour-start`, `tour-popover`, `tour-next`, `tour-back`, `tour-skip`, `tour-progress`, `tour-confirm`)
- [x] Audit: keyboard penuh, SR live, fokus ring `primary` 2px offset 2, `prefers-reduced-motion`, sentuh ≥44px; `test:tokens` light & dark + tabel audit
- [x] Smoke `pnpm -C apps/showcase build`; tanpa token/dependency baru
- [x] Update `sitemap.md` S-005.20 → `implemented` + catat `STATUS-LOG.md` setelah merge per AGENTS.md

## Dependencies

- Story/CR lain: menunggu 017-01 dan 017-02 (komponen + robustness lengkap)
- Package: tanpa dependency baru

## Notes

- Risiko: contoh dashboard terlalu mirip produksi — mitigasi label jelas "contoh" + bukan data nyata; flaky scroll di CI — mitigasi mock + toleransi viewport
- Keputusan: K1–K6 tampil di demo (badge driver.js, info lewati, dialog K2, coach tunggal diuji via 1 langkah opsional); sitemap `implemented` hanya setelah story ini merge

## Hasil audit kontras (tema pulse, validator `@ds/tokens`)

| Elemen | Pasangan | Light | Dark | Ambang | Status |
|---|---|---|---|---|---|
| Judul/isi popover + card | foreground / card | 17,72 | 16,39 | ≥ 4,5 | lolos |
| Teks muted + progress | muted-foreground / background | 7,47 | 7,51 | ≥ 4,5 | lolos |
| Tombol primer + Selesai | primary-foreground / primary | 8,97 | 5,65 | ≥ 4,5 | lolos |
| Ring spotlight + ring fokus | primary / card | 8,97 | 5,29 | ≥ 3,0 | lolos |
| Bar progress vs trek | primary / muted | 8,16 | 4,37 | ≥ 3,0 | lolos |

Overlay `background/80` mengikuti tema; lubang spotlight tanpa redup + ring `primary` solid sehingga target tetap terbaca dua tema.
