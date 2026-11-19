# CR-003 — `aria-sort` pada header tabel sortable

**Status:** done
**Sumber:** audit / a11y
**Ref:** `packages/ui/src/components/data-display/table.tsx:91-104`, `packages/ui/src/components/data-display/data-table.tsx:396-418`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `packages/ui/src/components/data-display/table.tsx:91-104`, `packages/ui/src/components/data-display/data-table.tsx:396-418` | Sorting tidak diekspos ke assistive tech: `SortableHeader` hanya `aria-label="Sort by {id}"` statis dan `TableHead` tidak pernah set `aria-sort`. Screen reader tidak tahu arah urutan → WCAG 1.3.1/4.1.2. | Set `aria-sort` (`ascending`/`descending`/`none`) pada `TableHead` dan sertakan arah di `aria-label`. |

## Perubahan yang Diusulkan

- Tambahkan jalur `sortDirection` (atau `aria-sort`) dari `SortableHeader` ke `TableHead`.
- Set `aria-sort="ascending" | "descending" | "none"` sesuai state sorting.
- Perbarui `aria-label` agar menyebut arah urutan saat aktif.
- Tidak mengubah nama export atau API `cva`; penambahan prop bersifat opsional additive.

## Tasks (jalur small-fix)

- [x] Tambahkan `aria-sort` pada `TableHead`
- [x] Sync `SortableHeader` dengan `aria-sort` dan label arah
- [x] Test a11y sorting
- [x] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test`

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Tambah prop opsional `sortDirection` pada `TableHead` dan `SortableHeader` | Backward compatible; tidak mengubah nama export atau API `cva`. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA.
- [x] Perilaku Radix/a11y tidak rusak.
- [x] API `cva` dan export tetap konsisten.
- [x] State loading, empty, dan error relevan tersedia.
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-003-table-aria-sort`
Commit: `fix: expose sort direction via aria-sort [CR-003]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
