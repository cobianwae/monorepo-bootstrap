# CR-068 — Org Chart Studio: poles perilaku demo dan section keyboard

**Status:** approved
**Sumber:** audit `/improve-ui` pada `apps/showcase/src/app/(docs)/patterns/org-chart-studio/page.tsx`, tindak lanjut CR-067
**Ref:** `apps/showcase/src/app/(docs)/patterns/org-chart-studio/page.tsx` + `_components/*`, `docs/cr/cr-067-org-chart-studio-page-uplift.md`, `docs/design/visual-language.md`

## Temuan

### Cluster A — perilaku demo

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| A1 | major | `page.tsx` (`highlightedIds`, `searchStatus`), `_components/studio-demo-panel.tsx` (Input search) | `highlightedIds` dihitung dari `data`, bukan `visibleData`. Di state Empty, Loading, atau Invalid, status pencarian tetap menulis "N results. Ancestor paths open automatically." padahal kanvas kosong atau error. Feedback menyesatkan. | Nonaktifkan Input search saat `kind` bukan `populated` atau `large`; `highlightedIds` kosong pada state itu; `searchStatus` menjadi "Search is available in Populated and 40 people." |
| A2 | minor | `page.tsx` (`handleKindChange`) | Memilih "40 people" lalu kembali ke "Populated" tetap menampilkan 40 orang, tidak sesuai hint "Populated". | Saat kembali ke `populated` dari `large`, kembalikan `studioSeedData`, reset `query` dan `expandedIds`. |
| A3 | minor | `page.tsx` (`summary`, deskripsi "Try it") | "4 levels" dan "Six steps" ditulis tangan; melanggar aturan klaim dihitung dari data. | Hitung kedalaman dari data (`parentId` chain) atau hapus frasa; pakai `STUDIO_STEPS.length` atau hapus kata bilangan. |
| A4 | minor | `page.tsx` (`handleKindChange`, `next === 'loading'`) | Toast "Loading structure…" duplikat dengan hint `role="status"`; pembacaan ganda untuk screen reader dan noise visual. | Hapus toast Loading. Toast "Root created" dipertahankan (hasil aksi). |

### Cluster B — section Keyboard & accessibility

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| B1 | minor | `_components/studio-shortcuts.tsx` | Dua grid kartu mirip (9 shortcut, 4 catatan a11y) berurutan tanpa pembeda; memenuhi syarat sub-section di visual-language (≥2 kelompok paralel, section lebih panjang dari satu layar). | Dua `<h3 className="text-xl font-bold font-display text-foreground">`: "Keyboard shortcuts" dan "Accessibility notes". Tanpa helper (aturan 3x; ini pemakaian ke-1 di luar halaman lain yang menulis manual). |
| B2 | minor | `_components/studio-shortcuts.tsx` (`dt`) | Tombol ditulis sebagai teks mono biasa, bukan elemen keyboard. | Bungkus tiap tombol dengan `<kbd>` bertoken (`rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs`); pecah kombinasi majemuk ("Ctrl+Z / Ctrl+Y") menjadi beberapa `<kbd>` dengan pemisah teks. Tanpa dependency. |

## Di Luar Scope

- **C1** (scroll horizontal segmented di mobile), **C2** (`title` duplikat pada segmen), **C3** (layout shift Alert external error): tidak dikerjakan; C3 adalah perilaku yang didemokan. C1/C2 menunggu keputusan user.
- **C4** — copy internal `OrgChartStudio` di `packages/ui/src/components/canvas/org-chart-studio.tsx` masih Indonesia ("Perkecil", "Perbesar", "Urungkan bila salah.") sehingga halaman English menampilkan UI campur. Ini pertanyaan terbuka #1 CR-067 (opsi a). Perlu CR lokalisasi terpisah karena menyentuh `packages/ui` dan `org-chart-studio.test.tsx`. Belum dibuat; menunggu konfirmasi.

## Perubahan yang Diusulkan

Hanya `apps/showcase/src/app/(docs)/patterns/org-chart-studio/` (`page.tsx`, `_components/studio-demo-panel.tsx`, `_components/studio-shortcuts.tsx`). Tidak ada perubahan API publik `@ds/ui`, token, atau dependency. Prop baru pada `StudioDemoPanel` (mis. `searchDisabled`) hanya internal showcase.

Before/after A1:

```tsx
// Sebelum
<Input id="org-studio-search" type="search" value={query} onChange={...} />

// Sesudah
<Input id="org-studio-search" type="search" value={query} disabled={searchDisabled} onChange={...} />
```

## Tasks (jalur small-fix)

- [x] A1: nonaktifkan search di state non-data, kosongkan `highlightedIds`, ubah `searchStatus`.
- [x] A2: kembalikan seed data saat keluar dari "40 people" ke "Populated".
- [x] A3: hitung kedalaman level dari data; pakai `STUDIO_STEPS.length` pada deskripsi "Try it".
- [x] A4: hapus toast Loading.
- [x] B1: dua sub-heading h3 di `studio-shortcuts.tsx`.
- [x] B2: `<kbd>` untuk tombol shortcut.
- [x] Audit selector/test: grep `org-studio-` dan teks lama; id `org-studio-search` dipertahankan.
- [x] Verifikasi: `build:types` + lint showcase hijau, guard 5/5, build showcase hijau, `org-chart-studio.test.tsx` 56/56. Typecheck workspace tetap gagal pada baseline lama `flow-editor.test.tsx` (file tidak tersentuh CR ini); visual browser tidak dicek.
- [ ] Cek visual light/dark + mobile bila Playwright tersedia (best-effort).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | A1: nonaktifkan search (bukan hitung dari `visibleData`). | Search tanpa data tidak bermakna; hint menjelaskan alasannya. Perlu konfirmasi (lihat Pertanyaan Terbuka). |
| 2 | Scope A+B dalam satu CR. | Semua di folder halaman yang sama, risiko rendah. |
| 3 | Sub-heading ditulis manual, tanpa helper. | Aturan 3x di `docs/design/visual-language.md`. |

## Pertanyaan Terbuka

1. A1: nonaktifkan search (rekomendasi) atau tetap aktif dengan hitung dari `visibleData`?
2. C4: buka CR lokalisasi copy internal `OrgChartStudio` sekarang atau tunda?
3. C1/C2: ikut dikerjakan di CR ini atau dibiarkan?

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA (`<kbd>` memakai `text-foreground` di atas `bg-muted`).
- [x] Perilaku Radix/a11y tidak rusak (SegmentedControl single, label Input search tetap terhubung, status `role="status"`).
- [x] API `cva` dan export `@ds/ui` tidak berubah.
- [x] State loading, empty, invalid, dan external error tetap tersedia lewat kontrol demo.
- [x] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass — lint showcase, guard 5/5, build showcase, dan `org-chart-studio.test.tsx` 56/56 hijau; typecheck workspace terhalang baseline lama `flow-editor.test.tsx` (di luar scope).

## Eksekusi

Branch: `cr-068-org-chart-studio-demo-polish`
Commit: `refactor: poles demo dan section keyboard org chart studio [CR-068]`

- [x] CR disetujui user (dengan rekomendasi default: A1 nonaktifkan search, scope A+B).
- [x] Branch dibuat (`cr-068-org-chart-studio-demo-polish` dari `visual-polish`, worktree `arah-story`).
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan (lihat Tasks).
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui (status kini `approved`; `done` oleh user).
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
