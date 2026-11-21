# Status

## Milestone

Design System Foundation v1 — token, komponen inti, showcase, dan workflow kontribusi.

## Posisi Saat Ini

Struktur OpenCode terpasang (config root, docs-as-state, agents, commands, workflow skills); baseline `typecheck`, `lint`, dan `test` hijau. Skill set fullstack aktif (`shared-types`, `backend-nestjs`, `prisma-schema`, `api-testing`, `monorepo-ci`) dengan routing di `decision-framework`.
PRD 001–006, 010 (legacy), 011 `shipped` dan diarsipkan — seri story 001-01–001-02, 002-01–002-04, 003-01–003-05, 004-01–004-04, 005-01–005-06, 006-01–006-05, 007-01, 008-01/008-02, 010-01–010-04, 011-01–011-05 `done` ter-merge ke `dev`; CR-001–008, CR-010/011/014 `done`, CR-009 dihentikan diganti 011.
Aktif: PRD 012–019 (`approved`), spec RM-02/03/10 (`approved`); antrean story `approved` 009-01, 012-02–012-03, 013-01–013-03, 014-03, 015-01–015-03, 018-02–018-03; CR-015 (`approved`).
Working tree: story 018-01 `done` (PermissionMatrix fondasi, ter-merge ke `dev`); nav collapsed fix belum di-commit. Story 014-02 `review` (branch `014-02-shell-upload-mapping`): wizard langkah 1–2 di `/patterns/import-wizard`, tes halaman jsdom di showcase.
Story 012-01 (`done`, ter-merge ke `dev`) — fondasi `MindMap` di `packages/ui` canvas: normalisasi flat/nested kanonik (DFS dari root) + 4 invalid terstruktur tanpa throw, layout dua sisi seimbang split-rule K1 (greedy lebar subtree, tie→kanan) + root sentral (pill root 200×64, cabang 160×48, gap 32/24, stride daun 72), pill cva + expander 44px + badge +N + Tooltip Radix, edge bezier 1px token `--border` (inline style), controls zoom/reset/fit + keyboard `+ - 0 F` + panah pan + Ctrl/Cmd+wheel + minimap token; expand controlled/uncontrolled semantik studio; tanpa dependency baru, `styles.css` tidak berubah; 14 test hijau (total packages/ui 585); tanpa showcase (scope 012-03).

## Next

1. Eksekusi CR-015 (`approved`) — verifikasi baseline dev + bersihkan entri stale.
2. Antrean implementasi satu per sesi: 009-01, 012-02, 013-01, 014-01, 015-01, 018-02.
3. Sinkron sitemap: S-005.30/S-005.31 `planned` → `implemented` (007-01/008-01/02 live); S-005.41 `in-design` (018).
4. Story 012-01 Mind Map fondasi `done` (approved oleh user, ter-merge ke `dev`) — fondasi `MindMap` dua sisi + pill + pan/zoom, 14 test hijau — `012-01`. Target berikut: 012-02 (tambah inline + hapus M-011 + undo/redo).

## Known Issues

- Graphify bersifat per-machine; graph tidak di-commit.
- `apps/web` dan `apps/api` masih tipis; integration test belum aktif.
- Baseline `dev` terverifikasi hijau (typecheck/lint/test, 494 test) per 2026-11-21 — lihat CR-015.

## Aturan Update

- Maksimal ~10 baris; detail masuk `docs/STATUS-LOG.md`.
- Update setelah story/CR selesai atau keputusan arah berubah.
- Jangan menyalin isi BACKLOG ke sini; cukup ringkasan posisi dan next.
