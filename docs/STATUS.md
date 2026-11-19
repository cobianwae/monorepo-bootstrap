# Status

## Milestone

Design System Foundation v1 — token, komponen inti, showcase, dan workflow kontribusi.

## Posisi Saat Ini

Struktur OpenCode sudah terpasang: config root, docs-as-state, agents, commands, dan workflow skills.
Validasi baseline `typecheck`, `lint`, dan `test` sudah hijau.
CR-001 (keyboard access clickable table row) selesai (`done`).
CR-002 (touch target ≥44px) selesai (`done`).
CR-003 (`aria-sort` header tabel sortable) selesai (`done`).
CR-004 (error state dan CTA empty state DataTable) selesai (`done`).

## Next

1. Validasi command `/start`, `/prd`, `/review`, dan `/audit` di sesi baru.
2. Lengkapi `docs/design/object-model.md` dan `sitemap.md` dengan inventaris aktual.
3. Lanjutkan CR berikutnya (CR-006 dst.) ke branch `dev`.

## Known Issues

- Graphify bersifat per-machine; graph tidak di-commit.
- `apps/web` dan `apps/api` masih tipis; integration test belum aktif.
- Sebagian route showcase belum punya screen ID di sitemap.

## Aturan Update

- Maksimal ~10 baris; detail masuk `docs/STATUS-LOG.md`.
- Update setelah story/CR selesai atau keputusan arah berubah.
- Jangan menyalin isi BACKLOG ke sini; cukup ringkasan posisi dan next.
