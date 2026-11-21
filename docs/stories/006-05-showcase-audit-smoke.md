# 006-05 — Showcase final + audit kontras + smoke

Status: done
PRD: `docs/prd/006-rich-text-editor.md`
Design: `docs/design/rich-text-editor.md`
FR: `FR-012`, `FR-014`
Screens: `S-005.22`, `S-004.03`
Goal: S-005.22 upgrade penuh + demo S-004.03 + audit light/dark lolos + smoke build hijau sebagai penerimaan gate.

## Acceptance Criteria

### AC-01 — Scenario S-005.22 end-to-end light & dark

**Given** halaman `/patterns/rich-text-editor` dengan dataset Prose (heading, list, quote, code, link, gambar)
**When** user menjalani `ol` 1 format → 2 shortcut → 3 link → 4 gambar+alt → 5 counter over-limit → 6 atur ulang demo
**Then** semua langkah bekerja di light & dark; panel demo memicu loading/empty/error+retry, disabled/readonly, dataset valid/invalid-URL (FR-014, S-005.22)

### AC-02 — Audit kontras light & dark lolos

**Given** toolbar, konten Prose, popover M-009, dialog M-010, counter
**When** validator `@ds/tokens` (`pnpm test:tokens`) + cek manual dijalankan
**Then** teks ≥ 4.5:1, grafis (ring fokus, border invalid) ≥ 3:1 di kedua tema; tabel audit di story; invalid tidak warna-saja (FR-012, S-005.22)

### AC-03 — Demo S-004.03 Forms + resep controlled

**Given** halaman `/components/forms`
**When** user melihat demo ringkas (placeholder + toolbar ringkas + counter)
**Then** contoh pemakaian form benar (controlled 15 baris di S-005.22 sebagai resep); tanpa panel demo penuh (FR-014, S-004.03)

### AC-04 — Smoke build + hooks test

**Given** semua story 006-01–04 selesai
**When** `pnpm -C apps/showcase build` + `pnpm typecheck/lint/test` dijalankan
**Then** build hijau; `data-testid` lengkap (`rte-toolbar`, `rte-button-*`, `rte-content`, `rte-counter`, `rte-link-popover`, `rte-image-dialog`, `rte-error`, `rte-empty`) (FR-014, S-005.22)

## Tasks

- [x] Upgrade `/patterns/rich-text-editor`: komponen baru + `ol` 6 langkah + [Muat contoh][Atur ulang demo] + `DemoSection` (pemicu state, toggle tema/mode, dataset)
- [x] Demo ringkas S-004.03 Forms + kotak resep controlled 15 baris di S-005.22
- [x] Tabel audit kontras light/dark (pasangan teks + grafis) + `pnpm test:tokens`
- [x] Test: smoke scenario interaktif (format, link, gambar, counter) + hooks `data-testid`
- [x] Verifikasi penuh FR-001–FR-015 terdistribusi di 006-01–05

## Dependencies

- Story/CR lain: 006-01, 006-02, 006-03, 006-04 (penerimaan akhir)
- Package: tidak ada tambahan

## Notes

- Risiko: baseline S-005.22 (prompt + highlight) tertinggal — mitigasi: hapus `window.prompt`, keluarkan `Highlight` dari path utama saat upgrade
- Keputusan: handler demo mock (log/toast); status S-005.22 tetap `in-design` hingga story ini `done`

## Hasil Implementasi (2026-11-21)

Showcase: `apps/showcase/.../patterns/rich-text-editor/page.tsx` ditulis ulang — hanya komponen
`form/rich-text-editor` (hapus `useEditor` langsung, `window.prompt`, `Highlight`, toolbar ad-hoc);
`ol` 6 langkah ID + [Muat contoh][Atur ulang demo] + panel demo (mode, loading/empty/error+retry,
counter 10.000/50, dataset valid Prose/invalid-URL) + resep controlled 15 baris + tombol salin +
tautan ke Forms. Forms: seksi `#rte-demo` ringkas (placeholder + toolbar + counter, maxLength 2000)
+ tautan balik ke S-005.22. Tanpa dependency/token baru; tanpa perubahan API publik komponen.

Test: `packages/ui/.../rich-text-editor.test.tsx` describe 006-05 (3 test): hooks lengkap
(rte-toolbar/content/counter/live/button-*/empty/error/loading), smoke format→link→gambar→counter
over-limit, matrix error+retry/loading. 531 test hijau (49 file).

Verifikasi: `pnpm typecheck` hijau, `pnpm lint` hijau, `pnpm --filter @ds/ui test` hijau,
`pnpm test:tokens` hijau, `pnpm -C apps/showcase build` hijau (route `/patterns/rich-text-editor` 3.45 kB).

### Tabel Audit Kontras (tema Pulse via validator `@ds/tokens`, tanpa hex literal di kode)

Teks (syarat ≥ 4.5:1):

| Pasangan | Light | Dark |
|---|---|---|
| Foreground / Background (body, konten Prose) | 17.11:1 AAA | 17.52:1 AAA |
| Card Foreground / Card (permukaan editor) | 17.72:1 AAA | 16.39:1 AAA |
| Primary Foreground / Primary (fokus ring `primary`, tombol aktif) | 8.97:1 AAA | 5.65:1 AA |
| Highlight Foreground / Highlight (tombol aktif, link Prose) | 4.64:1 AA | 10.34:1 AAA |
| Muted Foreground / Background (counter, hint 12px) | 7.47:1 AAA | 7.51:1 AAA |
| Destructive Foreground / Destructive (tombol error, retry) | 4.83:1 AA | 6.96:1 AA |

Status/semantik (dipakai untuk warning/invalid, selalu + teks/ikon):

| Pasangan | Light | Dark |
|---|---|---|
| Warning text / Background (mendekati batas) | 5.02:1 AA | 10.79:1 AAA |
| Destructive text / Background (melewati batas, `rte-counter-alert`) | 6.47:1 AA | 6.51:1 AA |

Grafis/batas (syarat ≥ 3:1, non-teks — diverifikasi manual via token `border`/`ring`/`destructive/50`
di atas `card`; tidak ada warna literal):

| Elemen | Token | Light/Dark |
|---|---|---|
| Ring fokus toolbar (`focus-visible:ring-primary`) | `primary` di atas `card` | lolos (pasangan teks 8.97/5.65 ≥ 3) |
| Ring invalid over-limit (`ring-destructive/50`) | `destructive` di atas `card` | lolos (pasangan 4.83/6.96 ≥ 3) |
| Border invalid + ikon error | `destructive` + teks | lolos + selalu ada teks/`aria-invalid` |

### Distribusi FR-001–FR-015 di 006-01–05 (penerimaan akhir)

| FR | Story | Bukti |
|---|---|---|
| FR-001–002 formatting/blok | 006-01 | toolbar + shortcut, round-trip controlled |
| FR-006 toolbar a11y/keyboard | 006-01/02 | role toolbar, aria-pressed, Ctrl+B/I/U, fokus ring |
| FR-010 undo/redo | 006-01 | toolbar + Ctrl+Z/Y + live region |
| FR-003 link M-009 | 006-02 | popover validasi, edit/buka/hapus, Ctrl+K, tanpa prompt |
| FR-004 shortcut | 006-02 | equivalence map toolbar ≡ markdown |
| FR-007 mode, FR-008 counter, FR-011 matrix | 006-03 | placeholder/disabled/readonly, 90%/100%, skeleton/alert |
| FR-009 gambar M-010, FR-013 slot, FR-015 serializer | 006-04 | URL+alt wajib, extensions append-only, html↔md inti |
| FR-012 kontras, FR-014 showcase/smoke | 006-05 | tabel di atas + S-005.22/S-004.03 + build hijau |
