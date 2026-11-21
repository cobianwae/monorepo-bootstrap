# 013-03 — Showcase + audit kontras + smoke

Status: approved
PRD: `docs/prd/013-diff-viewer.md` (approved, gate 1)
Design: `docs/design/wireframes/diff-viewer.md` (approved, gate 2) + `docs/design/flows/diff-viewer.mmd`
FR: `FR-003`, `FR-009`
Screens: `S-005.36`
Goal: Route `/patterns/diff-viewer` interaktif dalam light & dark lolos audit kontras + smoke build — menutup PRD 013.

## Acceptance Criteria

### AC-01 — Route interaktif 5 langkah end-to-end

**Given** route `/patterns/diff-viewer` (S-005.36)
**When** dibuka
**Then** `ol` 5 langkah (buka 3 file → toggle mode → lipat/buka → navigasi keyboard → file besar), toolbar + daftar file aktif, handler demo mock (log/toast) — diverifikasi manual + smoke (FR-009, S-005.36)

### AC-02 — Panel demo semua state + slot komentar mock

**Given** pemicu demo: dataset 3-file / 2000-baris / invalid / kosong
**When** dipilih + toggle light/dark + slot komentar mock dipasang
**Then** loading/empty/error/besar/contoh tampil sesuai matrix §3; resep integrasi 15 baris tersalin; parity light/dark visual — diverifikasi manual (FR-008, FR-009, S-005.36)

### AC-03 — Audit kontras + smoke build hijau

**Given** light dan dark
**When** `pnpm test:tokens` + `pnpm -C apps/showcase build` dijalankan
**Then** pasangan teks ≥ 4.5:1 + grafis ≥ 3:1 (bg add/del, border-l, ring hunk, badge +/−, gutter) dengan tabel audit di story; build hijau (FR-003, FR-009, S-005.36)

## Tasks

- [ ] Showcase `/patterns/diff-viewer` S-005.36: contoh 3-file + 2000-baris + invalid + kosong, `ol` 5 langkah, panel demo semua state, resep `renderComment` 15 baris, papan keyboard + catatan a11y
- [ ] Audit kontras light & dark via `pnpm test:tokens`; tulis tabel audit di story
- [ ] Smoke `pnpm -C apps/showcase build`; test hooks `data-testid` (toolbar, toggle, hunk-nav, file-header, error, empty)
- [ ] Docs (saat implementasi selesai, bukan sekarang): sitemap S-005.36 `implemented`, BACKLOG + STATUS update + `check-status-log`

## Dependencies

- Story/CR lain: membutuhkan 013-01 (fondasi) + 013-02 (split/navigasi/slot) — demo memakai keduanya
- Package: tanpa dependency/token baru (`diff` sudah masuk di 013-01)

## Notes

- Risiko: merah/hijau dark mode gagal kontras (latar PRD) — mitigasi bg muted + teks `foreground` + prefix non-warna (§6); bila gagal, turunkan saturasi via token existing, bukan token baru
- Keputusan: K2/K3 dikunci gate 2; sitemap `implemented` + BACKLOG arsip saat 013 shipped
