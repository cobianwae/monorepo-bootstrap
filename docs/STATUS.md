# Status

## Milestone

Design System Foundation v1 — token, komponen inti, showcase, dan workflow kontribusi.

## Posisi Saat Ini

Struktur OpenCode terpasang (config root, docs-as-state, agents, commands, workflow skills); baseline `typecheck`, `lint`, dan `test` hijau. Skill set fullstack aktif (`shared-types`, `backend-nestjs`, `prisma-schema`, `api-testing`, `monorepo-ci`) dengan routing di `decision-framework`.
CR-001–CR-007 selesai (`done`, ter-merge ke `dev`); kepatuhan `STATUS-LOG` dikunci via CR-007 (backfill + aturan append + `scripts/check-status-log.mjs`).
Story 001-01 dan 001-02 (upload queue) selesai (`done`, ter-merge ke `dev`).
PRD 002–006 (`approved`, gate 1) dan spec RM-02/03/10 (`approved`, story 007-01, 008-01/008-02, 009-01) selesai review dan disetujui user; CR-008 (`draft`) mengajukan perapian dokumen PRD 001. Spec desain PRD 003 org chart (`approved`, gate 2) — komponen `OrgChart` data-display standalone, artefak `docs/design/org-chart.md` + wireframes + flows.
Story 002-01 (`done`, ter-merge ke `dev`) — pattern `FileManager` shell tiga zona + navigasi tree-breadcrumb di `packages/ui` data-display + showcase `/patterns/file-manager` (S-005.27).
Story 002-02 (`done`, ter-merge ke `dev`) — zona konten list/grid + seleksi massal + context menu di `file-manager.tsx` + showcase S-005.27.01.
Story 002-03 (`done`, ter-merge ke `dev`) — panel konteks S-005.27.02 (upload compose + quota 3 level + detail item) + preview M-001 (sheet/dialog) di `file-manager.tsx` + showcase S-005.27.02; tambah prop opsional `quotaLoading`/`quotaError` dan `indicatorClassName` pada `Progress`.
Story 002-04 (`done`, ter-merge ke `dev`) — dialog kelola M-002/M-003 + audit state matrix §6 + polish keyboard/SR di `file-manager.tsx` + showcase final S-005.27. Seri File Manager PRD 002 (002-01–002-04) selesai.
Story 003-01 (`review`) — fondasi `OrgChart` di `packages/ui` data-display: normalisasi flat/nested + validasi error terstruktur, layout tidy-tree deterministik (200×72/gap 32/level 56), konektor elbow token `border`; tanpa dependency/token baru, tanpa showcase (scope 003-05).

## Next

1. Eksekusi CR-008 (perapian FR PRD 001 + rujukan `CR-006`) — butuh `approved` user.
2. Seri File Manager PRD 002 selesai; pilih target berikutnya: story lightweight (007-01/008-01/008-02/009-01), gate 3 PRD 003 (design `approved`), atau gate 2 PRD 004–006 — satu target per sesi sesuai BACKLOG.
3. PRD 001 masih `approved` — tetapkan `shipped` bila sudah sesuai keputusan user, lalu arsipkan dari `BACKLOG.md`.
4. Lengkapi `docs/design/object-model.md` (kategori `canvas` bila perlu + entri komponen baru) dan `sitemap.md` (S-005.29–S-005.32 masih `planned`).

## Known Issues

- Graphify bersifat per-machine; graph tidak di-commit.
- `apps/web` dan `apps/api` masih tipis; integration test belum aktif.

## Aturan Update

- Maksimal ~10 baris; detail masuk `docs/STATUS-LOG.md`.
- Update setelah story/CR selesai atau keputusan arah berubah.
- Jangan menyalin isi BACKLOG ke sini; cukup ringkasan posisi dan next.
