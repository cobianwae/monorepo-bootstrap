# CR-023 — Mind Map: warna semantik dan state feedback

**Status:** approved
**Sumber:** audit ui-designer `/improve-ui` scope `patterns/mind-map`
**Ref:** `docs/prd/012-mind-map.md` (FR-003/FR-007/FR-008), `packages/ui/src/components/canvas/mind-map.tsx`, `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `packages/ui/src/components/canvas/mind-map.tsx:532`, `:1729` | Edge `strokeWidth: 1, stroke: var(--border)` + skeleton connector `bg-border`. Di atas `bg-background`, konektor 1px sangat tipis; pada 50 node dan mode terang, alur cabang sulit diikuti. | Naikkan keterbacaan tanpa token baru: `strokeWidth` 1.5–2 atau pakai `muted-foreground` dengan opacity terjaga; audit kontras light/dark. Jaga bezier `default` tetap. |
| 2 | major | `packages/ui/src/components/canvas/mind-map.tsx:724-725` | `isNew` (`ring-2 ring-primary`) vs `highlighted` (`ring-2 ring-primary border-dashed`) hampir identik. User tidak bisa bedakan node baru vs hasil pencarian. | Bedakan eksplisit: mis. baru = `ring-primary solid`, cocok = `outline/dashed + Badge Cocok` saja tanpa ring ganda, atau sebaliknya. Verifikasi di kedua mode. |
| 3 | minor | `packages/ui/src/components/canvas/mind-map.tsx:1738-1766` vs `:1799` | Error invalid (data) memakai `border-border bg-card`, error eksternal memakai `border-destructive`. Severity sama-sama menghalangi, tetapi bahasa border berbeda. | Samakan pola error: invalid pakai `border-destructive` (atau aksen warning bila non-blocking) + `role="alert"` tetap; bedakan hanya copy (detail vs aksi konsumen). |
| 4 | minor | `packages/ui/src/components/canvas/mind-map.tsx:1722-1736` | Loading 6 skeleton `rounded-full h-12 w-40` dalam `grid-cols-2` tidak meniru layout dua sisi (root sentral + cabang). User tidak mendapat gambaran bentuk akhir. | Ubah skeleton meniru anatomi: 1 pill root tengah + 2–4 pill cabang kiri/kanan dengan garis konektor; tetap `aria-busy` + sr-only status. |
| 5 | minor | `packages/ui/src/components/canvas/mind-map.tsx:1228-1241` | Minimap `nodeColor="var(--primary)" maskStrokeColor="var(--primary)" maskColor="transparent"`. Di dark mode, dot primary di atas `bg-card` bisa terlalu dominan/menyala; mask transparan membuat batas viewport kabur. | Audit minimap light/dark; sesuaikan opacity/mask (`maskColor` dengan alpha token) agar batas viewport terbaca tanpa menyilaukan. Tanpa token baru. |

## Perubahan yang Diusulkan

- Hanya `mind-map.tsx` (edge, ring, error, skeleton, minimap).
- Tanpa dependency, token, atau API publik baru.
- Komponen/route terpengaruh: `MindMap`, `MindCanvas`, `MiniMap` wrapper, state loading/error, route `/patterns/mind-map`.

### Before / After (sketsa)

```tsx
// Sebelum — edge 1px border
style: { strokeWidth: 1, stroke: 'var(--border)' }

// Sesudah — keterbacaan dijaga
style: { strokeWidth: 1.5, stroke: 'var(--muted-foreground)' }
```

```tsx
// Sebelum — ring identik
isNew && 'ring-2 ring-primary'
data.highlighted && 'ring-2 ring-primary border-dashed'

// Sesudah — bedakan peran
isNew && 'ring-2 ring-primary'
data.highlighted && 'border-dashed border-primary' // tanpa ring ganda, plus Badge Cocok
```

## Tasks (jalur small-fix)

- [ ] Audit + perkuat konektor edge (temuan 1).
- [ ] Bedakan highlight pencarian vs node baru (temuan 2).
- [ ] Samakan bahasa error invalid vs eksternal (temuan 3).
- [ ] Perbaiki skeleton meniru layout dua sisi (temuan 4).
- [ ] Audit minimap light/dark (temuan 5).
- [ ] Verifikasi + `pnpm test:tokens` bila warna disentuh.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | — | Menunggu diskusi user. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

- Cek light/dark: edge, ring, error, skeleton, minimap di kedua mode + `pnpm test:tokens`.
- Cek state: loading, empty, invalid, error eksternal, highlighted, isNew, collapsed.
- Cek test: `mind-map.test.tsx` (edge style, ring, error role), `page.test.tsx` (state demo `Loading/Invalid/Error eksternal`).

## Eksekusi

Branch: `cr-023-mind-map-warna-state`
Commit: `fix: perjelas warna dan state mind map [CR-023]`

- [ ] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
