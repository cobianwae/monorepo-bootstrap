# CR-002 — Touch target di bawah minimum 24px

**Status:** done
**Sumber:** audit / a11y
**Ref:** `packages/ui/src/components/base/checkbox.tsx:15`, `packages/ui/src/components/base/switch.tsx:13`, `packages/ui/src/components/data-display/data-table.tsx:296`, `packages/ui/src/components/feedback/dialog.tsx:43`, `packages/ui/src/components/overlay/sheet.tsx:63`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | blocker | `packages/ui/src/components/base/checkbox.tsx:15` | Visual box `h-4 w-4` (16×16px), di bawah minimum WCAG 2.5.8 AA (24×24px) dan jauh di bawah standar proyek (44px). | Pertahankan visual 16px, perluas hit-area via pseudo-element (`before:absolute before:-inset-2.5`) atau padding wrapper. |
| 2 | blocker | `packages/ui/src/components/base/switch.tsx:13` | Track `h-5 w-9` (36×20px); tinggi 20px < 24px minimum. | Naikkan ke minimal `h-6` (24px), idealnya area sentuh 44px dengan visual tetap ramping. |
| 3 | blocker | `packages/ui/src/components/data-display/data-table.tsx:296` | Tombol hapus filter `h-5 w-5` (20×20px) < 24px minimum. | Minimal `h-8 w-8` dengan hit-area extension bila perlu kecil secara visual. |
| 4 | blocker | `packages/ui/src/components/feedback/dialog.tsx:43` | Tombol close (`DialogPrimitive.Close`) tanpa ukuran eksplisit; hit-area efektif hanya ikon 16×16px. | `h-8 w-8` (atau `h-11 w-11` di mobile), tetap `absolute right-4 top-4`. |
| 5 | blocker | `packages/ui/src/components/overlay/sheet.tsx:63` | Tombol close tanpa ukuran eksplisit; hit-area efektif hanya ikon 16×16px. | `h-8 w-8` (atau `h-11 w-11` di mobile), tetap `absolute right-4 top-4`. |

## Perubahan yang Diusulkan

- Terapkan strategi hit-area konsisten: pertahankan visual kecil, perluas area sentuh via pseudo-element atau padding wrapper.
- Target minimum 24×24px (WCAG 2.5.8); pertimbangkan 44px pada `@media (pointer: coarse)`.
- Pastikan focus ring tetap terlihat dan tidak terpotong oleh perluasan hit-area.
- Tidak mengubah nama export atau props publik komponen.

## Tasks (jalur small-fix)

- [x] Terapkan hit-area `checkbox`
- [x] Terapkan hit-area `switch`
- [x] Perbesar tombol hapus filter `data-table`
- [x] Perbesar tombol close `dialog` dan `sheet`
- [x] Test a11y dan keyboard
- [x] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test`

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Checkbox memakai hit-area 44×44px via pseudo-element; visual tetap 16×16px | `docs/TESTING.md` menetapkan target 44px; pseudo-element tidak menggeser layout |
| 2 | Switch memakai visual 24×44px (`h-6 w-11`) plus hit-area vertikal 44px | Memenuhi minimum WCAG 24px sekaligus standar proyek 44px |
| 3 | Tombol close dan hapus filter memakai visual 32×32px plus hit-area 44px | Menjaga kepadatan UI tanpa mengorbankan target sentuh |
| 4 | Status `done` ditetapkan setelah approval user | Hanya user yang boleh menetapkan `done` |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA.
- [x] Perilaku Radix/a11y tidak rusak.
- [x] API `cva` dan export tetap konsisten.
- [x] State loading, empty, dan error relevan tersedia. (N/A — CR hanya mengubah ukuran target)
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-002-touch-targets`
Commit: `fix: enlarge touch targets to wcag minimum [CR-002]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan (`typecheck`, `lint`, `test`, `apps/showcase build`).
- [x] CR di-tick dan status `BACKLOG.md` diperbarui menjadi `done`.
- [x] `docs/STATUS.md` diperbarui bila relevan.
