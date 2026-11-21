# CR-015 — Verifikasi baseline dev (known issue flow-editor.test.tsx) + bersihkan entri stale

**Status:** draft
**Sumber:** bug / verifikasi baseline (known issue di `docs/STATUS.md`)
**Ref:** `docs/STATUS.md` (Known Issues), `packages/ui/src/components/canvas/flow-editor.test.tsx`, commit `883d742` (005-03), `docs/STATUS-LOG.md` (entri CR-008/CR-011)

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | minor | `docs/STATUS.md` (Known Issues) vs `packages/ui/src/components/canvas/flow-editor.test.tsx` | Known issue mengklaim baseline `dev` merah: `pnpm typecheck`/`lint` gagal oleh unused import `useReactFlow` di `flow-editor.test.tsx`. Verifikasi pada HEAD `979e6f7`: `useReactFlow` hanya muncul di dalam factory `vi.mock('@xyflow/react')` (baris 66), bukan import yang tidak terpakai. `pnpm typecheck`, `pnpm lint`, dan `pnpm test` semuanya hijau (48 file / 494 test; `flow-editor.test.tsx` 25 test lolos). Kemungkinan sudah diperbaiki saat 005-03 (`883d742`) menyentuh file test tersebut. | Tidak ada perubahan kode. Hapus entri Known Issues yang sudah tidak berlaku di `docs/STATUS.md` agar snapshot akurat. |

## Perubahan yang Diusulkan

- Tanpa perubahan kode — ini CR verifikasi + perapian docs.
- `docs/STATUS.md`: hapus dua entri Known Issues yang merujuk baseline merah `flow-editor.test.tsx` (sudah terverifikasi hijau).
- `docs/STATUS-LOG.md`: append entri verifikasi baseline + `node scripts/check-status-log.mjs` hijau.

## Tasks (jalur small-fix)

- [ ] Jalankan verifikasi penuh: `pnpm typecheck && pnpm lint && pnpm test` (hasil: hijau, 494 test).
- [ ] Konfirmasi tidak ada import tak terpakai di `flow-editor.test.tsx` (grep `useReactFlow` → hanya mock baris 66).
- [ ] Hapus entri Known Issues stale di `docs/STATUS.md`.
- [ ] Append `docs/STATUS-LOG.md` + jalankan `node scripts/check-status-log.mjs`.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Perlakukan sebagai CR docs/verifikasi, bukan perbaikan kode | Baseline terbukti hijau; tidak ada yang perlu diperbaiki di kode. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik (tanpa perubahan kode).
- [x] Kontras light dan dark lolos WCAG AA (tanpa perubahan).
- [x] Perilaku Radix/a11y tidak rusak (tanpa perubahan).
- [x] API `cva` dan export tetap konsisten (tanpa perubahan).
- [x] State loading, empty, dan error relevan tersedia (tanpa perubahan).
- [x] Showcase/docs diperbarui bila perlu (STATUS.md saja).
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (terverifikasi 2026-11-21, HEAD `979e6f7`).

## Eksekusi

Branch: `cr-015-baseline-flow-editor-test`
Commit: `docs: verifikasi baseline hijau dan bersihkan known issue stale [CR-015]`

- [ ] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan (edit `docs/STATUS.md` + append `STATUS-LOG.md`).
- [ ] Verifikasi dijalankan (`node scripts/check-status-log.mjs`).
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
