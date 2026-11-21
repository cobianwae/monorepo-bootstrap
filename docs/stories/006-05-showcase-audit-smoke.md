# 006-05 — Showcase final + audit kontras + smoke

Status: approved
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

- [ ] Upgrade `/patterns/rich-text-editor`: komponen baru + `ol` 6 langkah + [Muat contoh][Atur ulang demo] + `DemoSection` (pemicu state, toggle tema/mode, dataset)
- [ ] Demo ringkas S-004.03 Forms + kotak resep controlled 15 baris di S-005.22
- [ ] Tabel audit kontras light/dark (pasangan teks + grafis) + `pnpm test:tokens`
- [ ] Test: smoke scenario interaktif (format, link, gambar, counter) + hooks `data-testid`
- [ ] Verifikasi penuh FR-001–FR-015 terdistribusi di 006-01–05

## Dependencies

- Story/CR lain: 006-01, 006-02, 006-03, 006-04 (penerimaan akhir)
- Package: tidak ada tambahan

## Notes

- Risiko: baseline S-005.22 (prompt + highlight) tertinggal — mitigasi: hapus `window.prompt`, keluarkan `Highlight` dari path utama saat upgrade
- Keputusan: handler demo mock (log/toast); status S-005.22 tetap `in-design` hingga story ini `done`
