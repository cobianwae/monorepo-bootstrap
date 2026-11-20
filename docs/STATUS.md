# Status

## Milestone

Design System Foundation v1 — token, komponen inti, showcase, dan workflow kontribusi.

## Posisi Saat Ini

Struktur OpenCode terpasang (config root, docs-as-state, agents, commands, workflow skills); baseline `typecheck`, `lint`, dan `test` hijau. Skill set fullstack aktif (`shared-types`, `backend-nestjs`, `prisma-schema`, `api-testing`, `monorepo-ci`) dengan routing di `decision-framework`.
CR-001–CR-007 selesai (`done`, ter-merge ke `dev`); kepatuhan `STATUS-LOG` dikunci via CR-007 (backfill + aturan append + `scripts/check-status-log.mjs`).
Story 001-01 dan 001-02 (upload queue) selesai (`done`, ter-merge ke `dev`).
PRD 002–006 (`approved`, gate 1) dan spec RM-02/03/10 (`approved`, story 007-01, 008-01/008-02, 009-01) selesai review dan disetujui user; CR-008 (`draft`) mengajukan perapian dokumen PRD 001.
Story 002-01 (`review`) — pattern `FileManager` shell tiga zona + navigasi tree-breadcrumb di `packages/ui` data-display + showcase `/patterns/file-manager` (S-005.27).

## Next

1. Eksekusi CR-008 (perapian FR PRD 001 + rujukan `CR-006`) — butuh `approved` user.
2. Mulai gate 2 PRD 002 (file manager) atau eksekusi story lightweight (007-01/008-01/008-02/009-01) — pilih target satu sesi sesuai BACKLOG.
3. PRD 001 masih `approved` — tetapkan `shipped` bila sudah sesuai keputusan user, lalu arsipkan dari `BACKLOG.md`.
4. Lengkapi `docs/design/object-model.md` (tambah kategori `canvas` + entri komponen baru) dan `sitemap.md` (S-005.27–S-005.32 sudah terdaftar `planned`).

## Known Issues

- Graphify bersifat per-machine; graph tidak di-commit.
- `apps/web` dan `apps/api` masih tipis; integration test belum aktif.

## Aturan Update

- Maksimal ~10 baris; detail masuk `docs/STATUS-LOG.md`.
- Update setelah story/CR selesai atau keputusan arah berubah.
- Jangan menyalin isi BACKLOG ke sini; cukup ringkasan posisi dan next.
