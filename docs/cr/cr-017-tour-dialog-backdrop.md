# CR-017 — Tour: dialog konfirmasi tertutup backdrop + inert + focus ring

**Status:** approved
**Sumber:** review artefak 017 (laporan user: "kayak ada backdrop yang menghalangi")
**Ref:** `docs/prd/017-product-tour.md` (FR-005), `docs/design/wireframes/product-tour.md` (§1, §4, §6, K2), `docs/stories/017-02-target-hilang-keyboard-motion-states.md` (AC-02), `docs/stories/017-03-showcase-audit-smoke.md` (AC-01), `packages/ui/src/components/overlay/tour.tsx`, `packages/ui/src/components/overlay/tour.css`, `apps/showcase/src/app/(docs)/patterns/product-tour/page.tsx`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | blocker | `packages/ui/src/components/overlay/tour.tsx:389-407,498-520` + `apps/showcase/src/app/(docs)/patterns/product-tour/page.tsx:191-209` | Dialog konfirmasi "Lewati tur?" (Radix `AlertDialog`, DOM reguler di dalam page) tampil **di bawah** backdrop driver.js. driver.js 1.14 me-render `div.driver-layer` (`popover=manual` + `showPopover()`, TopLayer) berisi overlay SVG (`fill: var(--background)`, opacity 0.8, `pointer-events: auto`) — TopLayer selalu ter-cetak di atas dialog Radix yang bukan TopLayer. Saat `confirmOpen=true` driver tetap aktif, sehingga dialog tampak redup / tidak bisa diklik. Alur lewati K2 (FR-005; AC-02 017-02; langkah 5–6 `ol` 017-03) rusak. Test lolos karena `driver.js` di-mock — stacking asli tidak ter-cover. | Saat dialog konfirmasi terbuka, sembunyikan/nonaktifkan sementara overlay driver (atau pindahkan dialog ke TopLayer). Verifikasi manual light/dark: dialog selalu di atas backdrop dan bisa diklik; tambah test regresi. |
| 2 | major | `packages/ui/src/components/overlay/tour.tsx:70-96` | `LAYER_SELECTORS` memuat `#driver-overlay` / `#driver-page-overlay` yang **tidak ada** di driver.js 1.14 (node nyata: `.driver-layer`, SVG `.driver-overlay`, `#driver-popover-content`). Selain itu `data-tour-layer` berada jauh di dalam root app sehingga ancestor yang memuatnya selalu lolos dari `setBackgroundInert` → konten belakang tidak benar-benar `inert` di showcase (klaim §4 tak terpenuhi), dan node driver berisiko malah kena `inert`. | Selaraskan selector ke DOM nyata driver 1.14; perbaiki logika `inert` (targetkan saudara konten, bukan ancestor yang memuat lapisan tur); tambah test integrasi. |
| 3 | major | `packages/ui/src/components/overlay/tour.css:38-52` | Tombol popover driver (base `all:unset`) hanya di-override `min-height` + warna; tanpa rule `:focus-visible` ring `primary` 2px offset 2 (§4/§6) → fokus keyboard tidak terlihat. Pelanggaran a11y. | Tambah rule `:focus-visible` (`outline: 2px solid var(--primary); outline-offset: 2px`) untuk tombol popover; verifikasi light/dark. |
| 4 | minor | `packages/ui/src/components/overlay/tour.tsx:390-391` + `packages/ui/src/components/overlay/tour.css:8-10` | Potensi redup ganda: `overlayColor: var(--background)` + `overlayOpacity: 0.8` dipadu override CSS `color-mix 80%` → backdrop terasa "menghalangi" dan target di belakang ikut redup berat. | Audit visual light/dark; pertimbangkan opacity lebih rendah; pastikan lubang spotlight tanpa redup + ring `primary` solid tetap menjamin target terbaca. |

## Perubahan yang Diusulkan

- Sembunyikan overlay driver selama dialog konfirmasi `Lewati tur?` terbuka (atau pindahkan dialog ke TopLayer) — tanpa mengubah API publik `TourProps`.
- Perbaiki `LAYER_SELECTORS` + logika `setBackgroundInert` mengikuti DOM nyata driver.js 1.14.
- Tambah style `:focus-visible` tombol popover sesuai token fokus DS.
- Audit visual opacity backdrop light/dark.
- File utama: `tour.tsx`, `tour.css`, `tour.test.tsx` (regresi); tanpa token/dependency baru.

## Tasks

- [ ] Reproduksi manual di `/patterns/product-tour`: buka tur → Esc/Lewati di progres > 1 → pastikan dialog di atas backdrop dan bisa diklik.
- [ ] Implementasi perbaikan stacking dialog vs overlay driver.
- [ ] Perbaiki selector + logika `inert`; verifikasi konten belakang benar-benar inert saat tur aktif dan pulih saat tutup.
- [ ] Tambah `:focus-visible` ring tombol popover; uji keyboard penuh + SR.
- [ ] Audit visual backdrop light/dark; sesuaikan opacity bila perlu.
- [ ] Tambah/ubah test regresi (dialog di atas overlay, inert, fokus).
- [ ] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test` (file terkait) + smoke showcase bila menyentuh route.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Pendekatan stacking (sembunyikan overlay vs dialog ke TopLayer) diputuskan saat implementasi | Keduanya memenuhi K2; pilih yang paling kecil risikonya terhadap mesin driver |
| 2 | Tanpa perubahan API publik `TourProps` | Perbaikan perilaku, bukan kontrak |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak (dialog di atas backdrop, fokus kembali ke pemicu).
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia (tak tersentuh CR ini).
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-017-tour-dialog-backdrop`
Commit: `fix: dialog lewati tur di atas backdrop overlay [CR-017]`

- [ ] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
