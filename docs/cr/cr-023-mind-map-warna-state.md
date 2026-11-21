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

- [x] Audit + perkuat konektor edge (temuan 1) — normal `1.5px border`, edge ke node cocok `1.5px primary dashed` (paritas studio 011-04); `toMindFlowEdges` terima `highlightedIds` opsional.
- [x] Bedakan highlight pencarian vs node baru (temuan 2) — highlight `ring-2 ring-primary border-dashed border-primary` + badge `Cocok` (CR-022); baru `ring-2 ring-primary` solid.
- [x] Samakan bahasa error invalid vs eksternal (temuan 3) — invalid kini `border-destructive` (sebelum `border-border`), dua-duanya `role="alert"`.
- [x] Perbaiki skeleton meniru layout dua sisi (temuan 4) — 1 pill root `h-16 w-[200px]` sentral + kolom kiri 3 / kanan 2 pill cabang (total 6, test tidak berubah).
- [x] Audit minimap light/dark (temuan 5) — `maskColor` transparent → `color-mix(in oklch, var(--background) 70%, transparent)` (paritas editor/studio).
- [x] Verifikasi + `pnpm test:tokens`.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | CR disetujui user ("approve aja dulu"). | Persetujuan dicatat; implementasi mengikuti scope CR ini. |
| 2 | Edge normal 1.5px `border` (bukan `muted-foreground`), highlight primary dashed. | Selaras studio (`studio.tsx:563-565`); 1.5px cukup tanpa noise 49 edge `muted`. Highlight paritas 011-04. |
| 3 | Ring highlight dipertahankan (studio parity), pembeda = dash `border-primary` + badge. | Studio highlight juga ring+dash+chip; melepas ring menyimpang dari DS. |
| 4 | Branch dari `cr-022` (stacked) atas instruksi user. | Perubahan CR-023 menumpuk di atas commit CR-022 yang belum di-merge. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA.
- [x] Perilaku Radix/a11y tidak rusak.
- [x] API `cva` dan export tetap konsisten.
- [x] State loading, empty, dan error relevan tersedia.
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

- Cek light/dark: edge, ring, error, skeleton, minimap di kedua mode + `pnpm test:tokens`.
- Cek state: loading, empty, invalid, error eksternal, highlighted, isNew, collapsed.
- Cek test: `mind-map.test.tsx` (edge style, ring, error role), `page.test.tsx` (state demo `Loading/Invalid/Error eksternal`).

## Eksekusi

Branch: `cr-023-mind-map-warna-state`
Commit: `fix: perjelas warna dan state mind map [CR-023]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.

### Hasil implementasi

- `pnpm typecheck`: tidak ada error baru (hanya 12 baseline FlowEditor).
- `pnpm lint`: hijau.
- MindMap + integrasi: **48/48 lulus** (termasuk assert edge baru).
- Showcase page: **3/3 lulus**; `pnpm test:tokens` **8/8**; build showcase hijau.
- Menunggu user menetapkan `done`, lalu update BACKLOG/STATUS/STATUS-LOG + push/merge.
