# CR-004 — Error state dan CTA empty state untuk DataTable

**Status:** approved
**Sumber:** audit / ux
**Ref:** `packages/ui/src/components/data-display/data-table.tsx:85-101,430-493`, `packages/ui/src/components/data-display/data-table.tsx:464-468`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `packages/ui/src/components/data-display/data-table.tsx:85-101,430-493` | `DataTable` hanya punya state `loading` (skeleton) dan empty state; tidak ada state error (`error`/`onRetry` tidak ada). Melanggar rule 6 AGENTS.md — setiap data grid wajib loading + empty + error state. | Tambahkan prop `error?: boolean` dan `onRetry?: () => void`, render `EmptyState` varian error dengan CTA "Coba lagi". |
| 2 | minor | `packages/ui/src/components/data-display/data-table.tsx:464-468` | Empty state bawaan tidak menyertakan CTA; next step hanya teks deskripsi "Try adjusting your search or filters." | Sediakan CTA bawaan "Clear filters" yang memanggil `table.resetColumnFilters()`. |

## Perubahan yang Diusulkan

- Tambah prop opsional `error?: boolean` dan `onRetry?: () => void` pada `DataTable` (additive, tidak memecah kontrak).
- Render `EmptyState` varian error saat `error` true, dengan CTA retry bila `onRetry` tersedia.
- Tambah CTA opsional pada empty state default untuk mereset filter kolom.
- Pastikan urutan prioritas state: loading → error → empty → data.

## Tasks (jalur small-fix)

- [x] Tambah prop `error` dan `onRetry`
- [x] Render error state dengan CTA retry
- [x] Tambah CTA "Clear filters" pada empty state
- [x] Test state matrix (loading/error/empty/data)
- [x] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test`

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Tambah prop `variant?: 'default' \| 'error'` pada `EmptyState` (destructive token, ikuti pola `alertVariants`) | CR menyebut "EmptyState varian error"; EmptyState belum punya variant. Disetujui user saat approval rencana. |
| 2 | Microcopy error English ("Something went wrong", "Try again", "Clear filters") | Konsisten dengan microcopy existing DataTable ('No results', 'Reset filters'). |
| 3 | CTA "Clear filters" hanya tampil bila ada column filters aktif | Menghindari CTA tanpa aksi; sesuai "CTA opsional" di CR. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA (palet `destructive` existing, tanpa token baru).
- [x] Perilaku Radix/a11y tidak rusak.
- [x] API `cva` dan export tetap konsisten (`emptyStateVariants` mengikuti pola `alertVariants`).
- [x] State loading, empty, dan error relevan tersedia (urutan loading → error → empty → data).
- [x] Showcase/docs diperbarui bila perlu (showcase `/patterns/data-table` sudah punya error UX sendiri; docs CR/BACKLOG/STATUS diperbarui).
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-004-data-table-error-state`
Commit: `feat: add error state to data table [CR-004]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
