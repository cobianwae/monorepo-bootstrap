# 012-03 — Keyboard + cari + states + showcase audit

Status: done
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

- [x] Pohon SR internal `role="tree"` + keyboard map §5 + live region + focus-ring + reduced-motion
- [x] Search presentasional (`highlightedIds` + reuse `getAncestors` + auto-expand via `onExpandedChange`)
- [x] State matrix §4 (loading skeleton, empty CTA, invalid + salin detail, eksternal alert)
- [x] Showcase `/patterns/mind-map` S-005.35: contoh Q1 + 50 node, `ol` 6 langkah, panel 6 state, resep integrasi 15 baris, papan keyboard + catatan a11y
- [x] Audit kontras light & dark + smoke build; catat tabel audit
- [x] Test co-located (keyboard map, SR roles, search expand, 6 states)

## Dependencies

- Story/CR lain: membutuhkan 012-01 (fondasi) + 012-02 (CRUD/undo) — showcase demo memakai keduanya
- Package: tanpa dependency/token baru; minimap sembunyi <md + toggle

## Notes

- Rencana implementasi disetujui user; branch `012-03-keyboard-cari-showcase-audit` dari `origin/dev` `c9a88b1` di worktree `arah-cr`.
- Tambahan API `searchSlot?: React.ReactNode` disetujui user untuk urutan toolbar → search → canvas, tanpa memindahkan logika pencarian ke komponen.
- Framing: sebagai pengguna keyboard/SR, saya ingin menemukan dan mengelola ide tanpa mouse sehingga brainstorming tetap lancar. Must: AC-01–04 (keyboard/SR, search, states, showcase/audit); should: contoh 50 node; could/won't: drag-reparent ditunda. AC Given/When/Then di atas menjadi kontrak pengujian.
- Blast radius: graphify dicoba (`graph_stats`, `get_neighbors`); graph dibangun pada `1568661`, stale dan tidak memuat MindMap. Fallback referensi kode: komponen + test/barrel UI, route baru + navigasi showcase; belum ada konsumen MindMap di app.

- Risiko: auto-expand search berkonflik dengan collapsed manual — mitigasi gabung path via `onExpandedChange` tanpa menimpa manual
- Keputusan: FR-010 tetap ditunda (K2/OQ#3 decided); sitemap `implemented` + BACKLOG arsip saat 012 shipped

## Audit aksesibilitas

Audit berbasis kode dan test DOM, tema demo Pulse. Rasio dari `getContrastRatio`
di `@ds/tokens`; nilai warna mengikuti definisi tema, bukan warna inline komponen.

| Elemen / pasangan token | Light | Dark | Batas | Hasil |
|---|---:|---:|---:|---|
| Label pill / card (`foreground`) | 17.72 | 16.39 | 4.5 | Lulus |
| Caption & ikon controls / card (`muted-foreground`) | 7.73 | 7.03 | 4.5 | Lulus |
| Badge Cocok / secondary (`secondary-foreground`) | 14.90 | 13.84 | 4.5 | Lulus |
| Ring fokus / sorotan / pill card (`primary`) | 8.97 | 5.29 | 3 | Lulus |
| Minimap / viewport kanvas (`primary` / background) | 8.67 | 5.65 | 3 | Lulus |
| Dot success / card | 5.48 | 9.37 | 3 | Lulus |
| Dot warning / card | 3.19 | 10.79 | 3 | Lulus |
| Dot info / card | 5.17 | 7.09 | 3 | Lulus |

- Minimap tanpa mask tint yang menurunkan kontras dot; outline viewport `primary` 2px. Border edge dekoratif bukan satu-satunya pembawa relasi: pohon aksesibel menyajikan parent/child.
- Urutan DOM toolbar → `searchSlot` → kanvas → node roving → controls → panel pohon diuji; gagang, expander, toolbar, dan controls berukuran 44px. Pohon memiliki `tree`/`group`/`treeitem`, `aria-level`/`expanded`/`selected`, roving tabindex dan aksi tombol.
- Ring fokus utama 2px offset 2px. Keyboard pan 40px; reduced-motion memberi durasi zoom 0 dan mematikan animasi skeleton. Input edit mempertahankan shortcut native.
- Pencarian gabung ancestor ke expanded controlled, mempertahankan toggle cabang lain, tidak memaksa cabang terbuka kembali setelah toggle manual. Hit-count/no-results memakai live region, sorotan memakai ring + badge teks + border dashed.
- Walkthrough browser, zoom 200%, viewport mobile, dan pembaca layar nyata belum dijalankan; jangan menganggap test DOM sebagai validasi visual/SR manual.

## Verifikasi

- `pnpm typecheck`: terblokir 12 error baseline `flow-editor.test.tsx:702–749` (`HTMLElement.disabled`); tidak ada error baru MindMap. `pnpm --filter @ds/showcase build:types` hijau.
- `pnpm lint`: hijau.
- `pnpm test`: default paralel menghasilkan 7 timeout (FlowEditor, OrgChartEditor, FileManager, PermissionMatrix) + satu timeout RPC worker. Tanpa perubahan konfigurasi, `pnpm --filter @ds/ui exec vitest run --maxWorkers=2 --testTimeout=30000` hijau **674/674** termasuk **43 MindMap**; batas undo MindMap juga lulus ulang (2.16 detik). Smoke RTE yang sebelumnya tercatat gagal kini lulus pada run ini, tidak diubah.
- `pnpm --filter @ds/showcase exec vitest run --maxWorkers=2 --testTimeout=30000`: **64/64**, termasuk tiga scenario MindMap (six states, pencarian/ekspansi/toggle, 50 node/mode/minimap).
- `pnpm test:tokens`: **8/8** hijau. Audit Pulse juga diuji co-located pada test MindMap.
- `pnpm -C apps/showcase build`: run awal terblokir error `next/font` Google loader (`Cannot read properties of null (reading '1')`, `loader.js:122`) pada IBM Plex di layout yang tidak disentuh. Run ulang setelah sinkron dengan `origin/dev` `3e4a2a7` **hijau**, 76 halaman termasuk `/patterns/mind-map`. Tanpa mengganti font/config/dependency; task audit/smoke sudah lengkap.
- Warning test non-fatal: `act(...)` saat penutupan dialog MindMap/RTE, ukuran chart jsdom nol, posisi ContextMenu sebelum interaksi.
- Status `done` atas approval user (2026-11-21), termasuk izin push branch, merge ke `dev`, dan push `dev`. Smoke build lulus ulang; validasi browser/SR tetap catatan review, bukan diklaim lulus. Sitemap tetap `in-design`, PRD tidak diubah menjadi shipped.
- Verifikasi integrasi `origin/dev` `3e4a2a7`: lint hijau; root typecheck tetap 12 error FlowEditor (lokasi bergeser ke 706–753). Suite UI dua worker: **695/696** termasuk **43 MindMap** lulus; smoke RTE `rte-link-save` baris 543 kembali gagal (known issue, file RTE tidak disentuh). Showcase **64/64** lulus. Konflik hanya docs status/log, kedua riwayat dipertahankan.
