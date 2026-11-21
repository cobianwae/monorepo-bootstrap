# CR-018 — Tour: varian cva + responsif di komponen + sinkron docs

**Status:** approved
**Sumber:** review artefak 017 (lensa koherensi dokumen + implementation drift)
**Ref:** `docs/design/wireframes/product-tour.md` (§2.5, §5, K2/K3), `docs/prd/017-product-tour.md`, `docs/stories/017-01-fondasi-wrapper-navigasi-callback.md`, `packages/ui/src/components/overlay/tour.tsx`, `packages/ui/src/components/overlay/tour-types.ts`, `apps/showcase/src/app/(docs)/patterns/product-tour/page.tsx:327-330`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `packages/ui/src/components/overlay/tour.tsx` (keseluruhan, tanpa `cva`) + `packages/ui/src/components/overlay/tour-types.ts` vs wireframe §2.5 | Varian `cva` yang dispec-kan (§2.5: `spotlight` default/tight, `popover` default/compact, state empty/active/skipped/error/done) **tidak diimplementasikan** — tidak ada `cva` maupun prop varian. Kontrak desain ≠ kode; melanggar disiplin DS (varian visual via `cva`). | Tambah `cva` + prop varian pada `Tour`, atau putuskan via CR ini untuk merevisi desain (hapus §2.5) bila varian dinilai tidak perlu. |
| 2 | major | `apps/showcase/src/app/(docs)/patterns/product-tour/page.tsx:327-330` vs `packages/ui/src/components/overlay/tour.css` | Perilaku responsif `<md` (§5: popover bottom-sheet full-width, footer stacked, spotlight `tight`) hanya hidup sebagai `<style>` inline di page showcase, **bukan** di komponen/`tour.css` → konsumen yang memakai `Tour` tidak mendapat perilaku responsif. Implementation drift. | Pindahkan rule responsif ke `tour.css`/komponen, atau nyatakan eksplisit di desain bahwa responsif milik showcase (dengan konsekuensi konsumen menanggung sendiri). |
| 3 | minor | `docs/prd/017-product-tour.md:98-102` vs wireframe K2/K3 | OQ #2/#3 masih berstatus `open` di PRD, padahal sudah diputuskan di gate 2 (K2: konfirmasi hanya progres > 1; K3: coach tunggal masuk v1). | Sinkron status OQ PRD → answered/decided merujuk K2/K3. |
| 4 | minor | `docs/BACKLOG.md:26` + `docs/prd/017-product-tour.md:1` | PRD 017 masih `approved` padahal 017-01/017-02/017-03 sudah `done`; story 017-03 mensyaratkan sitemap S-005.20 → `implemented` setelah merge. | Setelah merge 017-03: tetapkan PRD 017 `shipped` dan pastikan sitemap S-005.20 `implemented`; sinkron STATUS bila relevan. |

## Perubahan yang Diusulkan

- Putuskan nasib §2.5 (implementasi `cva` vs revisi desain) — bila implementasi, tambah `cva` + prop varian dengan persetujuan API (per CONVENTIONS, perubahan API publik butuh eksplisit).
- Pindahkan CSS responsif `<md` dari page showcase ke `tour.css` (atau dokumentasikan sebagai milik showcase).
- Edit docs saja untuk temuan #3–#4 (sinkron OQ, status PRD/sitemap) — boleh dalam CR ini karena PRD/done-status tidak diubah strukturnya, hanya sinkronisasi yang sudah diputuskan.
- File utama: `tour.tsx`, `tour-types.ts`, `tour.css`, `page.tsx` (bersihkan `<style>` bila dipindah), `docs/prd/017-product-tour.md`, `docs/BACKLOG.md`.

## Tasks

- [ ] Putuskan: implementasi `cva` (§2.5) atau revisi desain hapus §2.5 — minta persetujuan user (menyentuh API publik).
- [ ] Bila implementasi: tambah varian + prop + test; jaga backward-compat default.
- [ ] Pindahkan rule responsif `<md` ke `tour.css`; hapus `<style>` inline showcase; uji viewport mobile.
- [ ] Sinkron OQ #2/#3 di PRD dan status PRD/sitemap setelah merge 017-03.
- [ ] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test` (file terkait) + smoke showcase.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Implementasi `cva` vs hapus §2.5 — menunggu persetujuan user | Menyentuh API publik komponen |
| 2 | Responsif milik komponen (bukan showcase) sebagai default | §5 mensyaratkan fungsi tidak hilang di kecil untuk semua konsumen |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten (bila §2.5 diimplementasikan).
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-018-tour-varian-responsif-docs`
Commit: `refactor: selaraskan varian dan responsif tour dengan desain [CR-018]`

- [ ] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
