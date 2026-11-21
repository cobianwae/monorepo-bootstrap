# 012-03 — Keyboard + cari + states + showcase audit

Status: approved
PRD: `docs/prd/012-mind-map.md` (revisi OQ#2/OQ#3 2026-11-21)
Design: `docs/design/wireframes/mind-map.md` + `docs/design/flows/mind-map.mmd`
FR: `FR-005`, `FR-007`, `FR-008`, `FR-009`
Screens: `S-005.35`
Goal: Mind map layak-pakai — keyboard penuh + pohon SR, search auto-expand, state matrix 6 demo, showcase interaktif light/dark lolos audit + smoke.

## Acceptance Criteria

### AC-01 — Keyboard penuh + pohon SR

**Given** kanvas + node fokus dan tab pohon SR
**When** panah sibling/parent-child, Enter/F2 edit, Space lipat, Delete hapus, Ctrl+Z/Y, `+ - 0 F`
**Then** semua aksi 012-01–012-02 terjangkau tanpa mouse, order toolbar→cari→kanvas→node→controls→SR, pohon `role="tree"` roving tabindex semua operasi via tombol, ring `primary` 2px, reduced-motion durasi 0 (FR-005, S-005.35)

### AC-02 — Cari + auto-expand + live region

**Given** query cocok sebagian dan query tanpa hasil
**When** mengetik di pencarian
**Then** cocok → ring + badge "Cocok" non-warna-saja + path ancestor auto-expand (gabung via `onExpandedChange` tanpa menimpa toggle manual) + umumkan jumlah via live region; tanpa hasil → umumkan + diagram tetap; hapus query → sorotan hilang (FR-005, S-005.35)

### AC-03 — State matrix 6 demo

**Given** pemicu loading/empty/invalid/eksternal/berisi/contoh
**When** dibuka via panel demo
**Then** empty `role="status"` + CTA buat root→inline-edit; loading skeleton 6 pill `aria-busy`; invalid `role="alert"` penyebab + id pertama + salin detail; eksternal `alert` + diagram tetap; berisi + contoh "Peluncuran Q1" 3 level aktif (FR-007, S-005.35)

### AC-04 — Showcase + audit + smoke

**Given** route `/patterns/mind-map` dengan `ol` 6 langkah + panel demo + toggle light/dark + contoh 50 node
**When** `pnpm -C apps/showcase build` + `pnpm test:tokens`
**Then** build hijau, handler demo mock, teks ≥ 4.5:1 + grafis ≥ 3:1 light & dark (dot/controls/minimap/badge), tabel audit di story, sitemap `S-005.35` tetap `in-design` sampai implementasi selesai (FR-008, FR-009, S-005.35)

## Tasks

- [ ] Pohon SR internal `role="tree"` + keyboard map §5 + live region + focus-ring + reduced-motion
- [ ] Search presentasional (`highlightedIds` + reuse `getAncestors` + auto-expand via `onExpandedChange`)
- [ ] State matrix §4 (loading skeleton, empty CTA, invalid + salin detail, eksternal alert)
- [ ] Showcase `/patterns/mind-map` S-005.35: contoh Q1 + 50 node, `ol` 6 langkah, panel 6 state, resep integrasi 15 baris, papan keyboard + catatan a11y
- [ ] Audit kontras light & dark + smoke build; catat tabel audit
- [ ] Test co-located (keyboard map, SR roles, search expand, 6 states)

## Dependencies

- Story/CR lain: membutuhkan 012-01 (fondasi) + 012-02 (CRUD/undo) — showcase demo memakai keduanya
- Package: tanpa dependency/token baru; minimap sembunyi <md + toggle

## Notes

- Risiko: auto-expand search berkonflik dengan collapsed manual — mitigasi gabung path via `onExpandedChange` tanpa menimpa manual
- Keputusan: FR-010 tetap ditunda (K2/OQ#3 decided); sitemap `implemented` + BACKLOG arsip saat 012 shipped
