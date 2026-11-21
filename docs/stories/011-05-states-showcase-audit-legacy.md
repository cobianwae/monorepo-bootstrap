# 011-05 — State matrix, showcase final, audit kontras, dan legacy

Status: review
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

- [x] Halaman `/patterns/org-chart-studio`: toolbar + pencarian + live region + controls + minimap + panel + M-007/M-008 + toast + tab pohon SR + papan keyboard + catatan a11y
- [x] Panel demo: 6 pemicu state + dataset valid/invalid + toggle minimap + toggle light/dark + [Muat contoh] + [Reset demo] + `ol` + resep 15 baris
- [x] Banner deprecated di `S-005.28`/`S-005.33` + tautan migrasi; update `sitemap.md` bila perlu
- [x] Audit kontras light/dark via validator `@ds/tokens` + tabel audit; test state matrix + showcase smoke
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test` → `pnpm test:tokens` → `pnpm -C apps/showcase build`; grep sisa import legacy
- [x] Update docs: `object-model.md` kategori `canvas` + entri `OrgChartStudio` bila belum ada

## Dependencies

- Story/CR lain: 011-01, 011-02, 011-03, 011-04 (showcase merangkum semuanya; kerjakan terakhir)
- Package: tanpa dependency baru; contoh 40 orang milik showcase (bukan komponen)

## Notes

- Risiko: halaman showcase terlalu besar satu file — mitigasi pecah ke `_components/` di route
- Keputusan: legacy paralel-deprecated (D12, OQ#3), bukan breaking langsung; hapus + arsip BACKLOG saat 011 shipped

## Hasil Implementasi (2026-11-21)

Showcase: `page.tsx` + `_components/` (`studio-demo-data.ts`, `studio-demo-panel.tsx`,
`studio-recipe.tsx`, `studio-shortcuts.tsx`). Data contoh 40 orang / 4 tingkat / 4 departemen
deterministik (1 root + 3 VP + 9 manajer + 27 staf). Eksternal memakai banner page
`role="alert"` di atas kanvas agar diagram terakhir tetap tampil; invalid memakai validasi
terstruktur komponen. Perubahan komponen: 1 baris teks SR "Memuat struktur organisasi…" di
cabang loading (tanpa API publik baru, tanpa dependency/token baru). Legacy S-005.28/S-005.33:
`Alert warning` + tautan migrasi; sitemap S-005.34/S-005.34.01/M-007/M-008 `in-design` →
`implemented` (S-005.28/S-005.33 sudah `deprecated`; object-model kategori `canvas` + entri
`OrgChartStudio` sudah ada — tanpa perubahan). Test baru 6 (describe 011-05): loading 8
skeleton + SR, empty CTA, invalid duplikat/parent/siklus, error eksternal, success + 40 node.
Grep import legacy dari kode baru/showcase baru bersih (hanya komentar kode).

### Tabel Audit Kontras (tema Pulse via validator `@ds/tokens`, tanpa hex literal di kode)

Teks (syarat ≥ 4.5:1):

| Pasangan | Light | Dark |
|---|---|---|
| Foreground / Background (nama, body) | 17.11:1 AAA | 17.52:1 AAA |
| Card Foreground / Card (teks kartu) | 17.72:1 AAA | 16.39:1 AAA |
| Primary Foreground / Primary (badge dept, chip) | 8.97:1 AAA | 5.65:1 AA |
| Muted Foreground / Background (jabatan 12px, meta) | 7.47:1 AAA | 7.51:1 AAA |
| Muted Foreground / Card (jabatan di kartu) | 7.73:1 AAA | 7.03:1 AAA |
| Success Foreground / Success (hint valid) | 5.48:1 AA | 10.01:1 AAA |
| Warning Foreground / Warning | 5.56:1 AA | 10.61:1 AAA |
| Info Foreground / Info (badge Engineering) | 5.17:1 AA | 7.57:1 AAA |
| Destructive Foreground / Destructive (hint invalid) | 4.83:1 AA | 6.96:1 AA |

Grafis (syarat ≥ 3:1) — strip aksen 3px / ring / badge / chip di atas card:

| Elemen | Light | Dark |
|---|---|---|
| Strip primary / card | 8.97:1 | 5.29:1 |
| Strip success / card | 5.48:1 | 9.37:1 |
| Strip warning / card | 3.19:1 | 10.79:1 |
| Strip info / card | 5.17:1 | 7.09:1 |
| Strip destructive / card | 4.83:1 | 6.51:1 |
| Ring primary (selected/highlight/fokus) / card | 8.97:1 | 5.29:1 |

Catatan: `border` 1px (kartu, konektor smoothstep) vs kanvas ≈ 1.4:1 light & dark — di bawah
3:1, diterima sebagai batas dekoratif: makna tidak pernah dibawa garis saja (selected pakai
ring primary + label, highlight pakai ring + badge "Cocok" + garis putus, drag pakai ring
success/destructive + teks). Margin tertipis: strip warning light 3.19:1 — pantau bila palet
berubah. Verifikasi: `typecheck` hijau, `lint` hijau, `test` 473 hijau (48 file), `test:tokens`
7 hijau, `showcase build` hijau (`/patterns/org-chart-studio` 6.45 kB).
