# CR-015 — Verifikasi baseline dev (known issue flow-editor.test.tsx) + bersihkan entri stale

**Status:** approved
**Sumber:** bug / verifikasi baseline (known issue di `docs/STATUS.md`)
**Ref:** `docs/STATUS.md` (Known Issues), `packages/ui/src/components/canvas/flow-editor.test.tsx`, commit `883d742` (005-03), `docs/STATUS-LOG.md` (entri CR-008/CR-011)

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | minor | `docs/STATUS.md` (Known Issues) vs `packages/ui/src/components/canvas/flow-editor.test.tsx` | Known issue mengklaim baseline `dev` merah: `pnpm typecheck`/`lint` gagal oleh unused import `useReactFlow` di `flow-editor.test.tsx`. Verifikasi pada HEAD `233fc90`: `useReactFlow` hanya muncul di dalam factory `vi.mock('@xyflow/react')` (baris 66), bukan import yang tidak terpakai. `pnpm typecheck`, `pnpm lint`, dan `pnpm test` semuanya hijau (48 file / 494 test; `flow-editor.test.tsx` 25 test lolos). Kemungkinan sudah diperbaiki saat 005-03 (`883d742`) menyentuh file test tersebut. | Tidak ada perubahan kode. Hapus entri Known Issues yang sudah tidak berlaku di `docs/STATUS.md` agar snapshot akurat. |

## Perubahan yang Diusulkan

- Tanpa perubahan kode — ini CR verifikasi + perapian docs.
- `docs/STATUS.md`: bersihkan entri Known Issues terkait baseline merah.
- `docs/STATUS-LOG.md`: append entri verifikasi baseline.

## Tasks

- [x] Verifikasi `pnpm typecheck && pnpm lint && pnpm test` hijau.
- [x] Konfirmasi tidak ada import tak terpakai di `flow-editor.test.tsx`.
- [x] Hapus entri Known Issues stale di `docs/STATUS.md`.
- [x] Append `docs/STATUS-LOG.md` + jalankan `node scripts/check-status-log.mjs`.

## Design System Checks

- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-015-baseline-flow-editor-test`
Commit: `docs: verifikasi baseline hijau dan bersihkan known issue stale [CR-015]`

- [x] CR disetujui user.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
