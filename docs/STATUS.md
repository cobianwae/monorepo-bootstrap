# Status

## Milestone

Design System Foundation v1 — token, komponen inti, showcase, dan workflow kontribusi.

## Posisi Saat Ini

Struktur OpenCode terpasang (config root, docs-as-state, agents, commands, workflow skills); baseline `typecheck`, `lint`, dan `test` hijau.
CR-001–CR-007 selesai (`done`, ter-merge ke `dev`); kepatuhan `STATUS-LOG` dikunci via CR-007 (backfill + aturan append + `scripts/check-status-log.mjs`).
Story 001-01 dan 001-02 (upload queue) selesai (`done`, ter-merge ke `dev`).

## Next

1. PRD 001 (upload queue) masih `approved` — kedua story selesai `done`; tetapkan `shipped` bila sudah sesuai keputusan user, lalu arsipkan dari `BACKLOG.md`.
2. Validasi command `/start`, `/prd`, `/review`, dan `/audit` di sesi baru.
3. Lengkapi `docs/design/object-model.md` dan `sitemap.md` dengan inventaris aktual.
4. Tidak ada CR tertunda; pilih target berikutnya (PRD/story) atau CR baru dari audit.

## Known Issues

- Graphify bersifat per-machine; graph tidak di-commit.
- `apps/web` dan `apps/api` masih tipis; integration test belum aktif.

## Aturan Update

- Maksimal ~10 baris; detail masuk `docs/STATUS-LOG.md`.
- Update setelah story/CR selesai atau keputusan arah berubah.
- Jangan menyalin isi BACKLOG ke sini; cukup ringkasan posisi dan next.
