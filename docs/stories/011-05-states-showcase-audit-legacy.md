# 011-05 — State matrix, showcase final, audit kontras, dan legacy

Status: todo
PRD: `docs/prd/011-org-chart-studio.md`
Design: `docs/design/org-chart-studio.md`
FR: `FR-012`, `FR-014`, `FR-015`, `FR-017`, `FR-018`
Screens: `S-005.34`, `S-005.34.01`, `M-007`, `M-008`
Goal: Showcase `/patterns/org-chart-studio` end-to-end + 6 demo state + audit kontras hijau + legacy 003/010 deprecated bersih.

## Acceptance Criteria

### AC-01 — 6 state matrix teramati di showcase

**Given** panel demo dengan pemicu loading/empty/invalid/eksternal/success/contoh
**When** tiap pemicu diaktifkan
**Then** loading: skeleton 8 kartu + `aria-busy` + teks SR; empty: `role="status"` + CTA [Buat root] → root langsung inline-edit; invalid: `role="alert"` + penyebab + id pertama + [Salin detail]; eksternal: `alert` di atas diagram terakhir tetap tampil (FR-012, S-005.34)

### AC-02 — Showcase end-to-end + contoh 1 klik

**Given** halaman `/patterns/org-chart-studio` dengan data controlled di page
**When** diikuti `ol` 1 buka → 2 tambah inline → 3 pindah → 4 hapus/undo → 5 cari → 6 [Reset demo], plus [Muat contoh 40 orang] dan kotak resep integrasi 15 baris (fetch → `data`, `onChange` → POST)
**Then** semua langkah teramati, reset mengembalikan dataset awal, contoh memuat 40 orang/4 tingkat/4 departemen 1 klik, resep tersalin (FR-014, FR-018, S-005.34)

### AC-03 — Kontras light & dark lolos AA

**Given** halaman dibuka light dan dark
**When** `pnpm test:tokens` + inspeksi pasangan teks/grafis (foreground, muted, primary, strip aksen di atas card, badge, controls, minimap, ring valid/invalid)
**Then** teks ≥ 4.5:1, grafis ≥ 3:1, tanpa hex literal, tabel audit dilampirkan di story, `pnpm typecheck/lint/test` + `pnpm -C apps/showcase build` hijau (FR-017, S-005.34)

### AC-04 — Legacy deprecated tanpa sisa import

**Given** komponen lama `OrgChart` + `OrgChartEditor` dan route `S-005.28`/`S-005.33`
**When** banner deprecated + tautan migrasi dipasang, sitemap + BACKLOG diperbarui
**Then** tidak ada import ke komponen lama dari kode baru/showcase baru (grep bersih), sitemap `S-005.28`/`S-005.33` = `deprecated`, penghapusan dijadwalkan saat 011 shipped (FR-015)

## Tasks

- [ ] Halaman `/patterns/org-chart-studio`: toolbar + pencarian + live region + controls + minimap + panel + M-007/M-008 + toast + tab pohon SR + papan keyboard + catatan a11y
- [ ] Panel demo: 6 pemicu state + dataset valid/invalid + toggle minimap + toggle light/dark + [Muat contoh] + [Reset demo] + `ol` + resep 15 baris
- [ ] Banner deprecated di `S-005.28`/`S-005.33` + tautan migrasi; update `sitemap.md` bila perlu
- [ ] Audit kontras light/dark via validator `@ds/tokens` + tabel audit; test state matrix + showcase smoke
- [ ] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test` → `pnpm test:tokens` → `pnpm -C apps/showcase build`; grep sisa import legacy
- [ ] Update docs: `object-model.md` kategori `canvas` + entri `OrgChartStudio` bila belum ada

## Dependencies

- Story/CR lain: 011-01, 011-02, 011-03, 011-04 (showcase merangkum semuanya; kerjakan terakhir)
- Package: tanpa dependency baru; contoh 40 orang milik showcase (bukan komponen)

## Notes

- Risiko: halaman showcase terlalu besar satu file — mitigasi pecah ke `_components/` di route
- Keputusan: legacy paralel-deprecated (D12, OQ#3), bukan breaking langsung; hapus + arsip BACKLOG saat 011 shipped
