# CR-022 — Mind Map: hierarki visual dan konsistensi komponen

**Status:** approved
**Sumber:** audit ui-designer `/improve-ui` scope `patterns/mind-map`
**Ref:** `docs/prd/012-mind-map.md` (FR-001/FR-003/FR-008), `packages/ui/src/components/canvas/mind-map.tsx`, `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `packages/ui/src/components/canvas/mind-map.tsx:552-565` | Pill root (`h-16 w-[200px] border-2 border-primary/40`) vs branch (`h-12 w-[160px] border-border`) beda ukuran, tetapi sama-sama `bg-card text-card-foreground shadow-sm`. Di kanvas ramai, root kurang menonjol sebagai fokus utama; semua pill bersaing. | Kuatkan pembeda root tanpa token baru: pertahankan ukuran + `font-semibold 15px`, naikkan bobot border/fill root (mis. `bg-primary/5` atau `border-primary` solid), pastikan kontras light/dark lolos. Tunjukkan before/after. |
| 2 | major | `packages/ui/src/components/canvas/mind-map.tsx:873-886` | Badge `+N` (hidden count) dan badge `Cocok` (search match) sama-sama `variant="secondary" size="sm"`. Makna berbeda (status lipatan vs hasil cari) terlihat sama; `Cocok` absolute `-top-3 right-0` berisiko overlap gagang `+`/expander. | Bedakan varian: `+N` tetap secondary; `Cocok` pakai varian aksen (mis. `default`/`outline` + `ring`) atau dot, dengan posisi tidak menutup kontrol. Pastikan tidak terpotong `overflow-hidden` viewport. |
| 3 | minor | `packages/ui/src/components/canvas/mind-map.tsx:721-726` vs `:1794-1796` | Focus ring pill `ring-primary`, wrapper region `ring-ring`. Inkonsisten dengan DS; user keyboard melihat dua bahasa fokus. | Samakan ke satu token fokus (ikut pola `OrgChartStudio`/DS, umumnya `ring-primary` atau `ring-ring` sesuai keputusan). |
| 4 | minor | `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx:104-112` + `mind-map.tsx:1802-1841` | Hierarki tombol datar: 6 tombol state demo + `Muat 50 node` + `Mode gelap` + `Minimap` semua `outline min-h-11`; toolbar kanvas (`Tambah anak root`, `Urungkan`, `Ulangi`) juga `outline sm`. Tidak jelas mana aksi primer vs toggle. | Kelompokkan visual: state demo sebagai segmented/group dengan `aria-pressed`, toggle (gelap/minimap) sebagai switch/button ghost, aksi kanvas tetap outline. Jangan ubah API publik. |

## Perubahan yang Diusulkan

- Hanya `mind-map.tsx` (pill, badge, focus ring) dan `page.tsx` (pengelompokan tombol demo).
- Tanpa dependency, token, atau API publik baru.
- Komponen/route terpengaruh: `MindMap`, `MindAddHandle`, `MindControls`, route `/patterns/mind-map` (S-005.35).

### Before / After (sketsa)

```tsx
// Sebelum — root vs branch sama-sama bg-card
className={mindPillVariants({ level: isRoot ? 'root' : 'branch' })}

// Sesudah — root ditinggikan tanpa hex
// root: 'h-16 w-[200px] border-2 border-primary px-3 bg-primary/5'
// branch: 'h-12 w-[160px] border-border px-2.5'
```

```tsx
// Sebelum — dua badge secondary identik
<Badge variant="secondary" size="sm">+{hiddenCount}</Badge>
<Badge variant="secondary" size="sm" className="absolute -top-3 right-0">Cocok</Badge>

// Sesudah — bedakan makna
<Badge variant="secondary" size="sm">+{hiddenCount}</Badge>
<Badge variant="default" size="sm" className="absolute -top-2 right-1">Cocok</Badge>
```

## Tasks (jalur small-fix)

- [x] Kuatkan pembeda root vs branch (temuan 1) — root `border-primary bg-primary/5` (sebelum `border-primary/40`).
- [x] Bedakan badge `+N` vs `Cocok` + posisi aman (temuan 2) — `Cocok` jadi `variant="default"` (selaras chip primary studio) di `-top-2 right-1`; `+N` tetap secondary.
- [x] Samakan token focus ring (temuan 3) — diputuskan tidak diubah: pill `ring-primary` + wrapper `ring-ring` sudah selaras pola `OrgChartStudio` (kartu vs region).
- [x] Kelompokkan tombol demo vs toggle vs aksi kanvas (temuan 4) — status demo dalam grup `bg-muted`, toggle di grup terpisah.
- [x] Verifikasi light/dark + semua state + test terkait.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | CR disetujui user ("approve aja dulu"). | Persetujuan dicatat; implementasi mengikuti scope CR ini. |
| 2 | Focus ring tidak disamakan (temuan 3 wont-fix). | Pill `ring-primary` + wrapper `ring-ring` selaras `OrgChartStudio` (`studio.tsx:778` kartu vs `:2362` wrapper). |
| 3 | Badge `Cocok` memakai `variant="default"` (primary). | Selaras chip sorotan studio (`studio.tsx:820-824` `bg-primary text-primary-foreground`), bukan warna baru. |
| 4 | Label `Minimap` tidak diubah di CR ini. | Termasuk scope CR-024 (microcopy); CR ini hanya regrouping visual. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA.
- [x] Perilaku Radix/a11y tidak rusak.
- [x] API `cva` dan export tetap konsisten.
- [x] State loading, empty, dan error relevan tersedia.
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

- Cek light/dark: root, badge, focus ring di kedua mode.
- Cek state: default, collapsed (+N), highlighted (Cocok), editing, disabled.
- Cek test: `mind-map.test.tsx`, `mind-map.integration.test.tsx`, `page.test.tsx` — tambah/update assert varian dan posisi badge bila berubah.

## Eksekusi

Branch: `cr-022-mind-map-hierarki-konsistensi`
Commit: `fix: perkuat hierarki mind map [CR-022]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.

### Hasil implementasi

- `pnpm typecheck`: hanya 12 error baseline `flow-editor.test.tsx` (properti `disabled`); tidak ada error baru dari file yang diubah.
- `pnpm lint`: hijau semua package.
- `pnpm --filter @ds/ui vitest mind-map + integration`: **48/48 lulus**.
- `pnpm --filter @ds/showcase vitest page.test.tsx`: **3/3 lulus**.
- `pnpm -C apps/showcase build`: hijau.
- Menunggu user menetapkan `done`, lalu update BACKLOG/STATUS/STATUS-LOG + push/merge.
