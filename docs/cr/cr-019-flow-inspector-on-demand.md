# CR-019 — Flow Editor inspector on-demand tidak mengunci

**Status:** done
**Sumber:** review artefak 005 + laporan bug user (“tiba-tiba muncul drawer inspector, nggak bisa diclose, nggak bisa ngapa-ngapain, nggak jelas isinya”)
**Ref:** `docs/prd/005-flow-editor.md` (FR-006), `docs/design/flow-editor.md` (D7), `docs/stories/005-04-seleksi-inspector-hapus.md` (AC-01–AC-05), `docs/stories/005-06-minimap-showcase-audit.md` (AC-05), `apps/showcase/src/app/(docs)/patterns/flow-editor/page.tsx`, `packages/ui/src/components/overlay/sheet.tsx`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | blocker | `apps/showcase/src/app/(docs)/patterns/flow-editor/page.tsx:300` | `Sheet open={!!selected}` tanpa `onOpenChange`. State `selected` tidak pernah di-clear saat user klik X / Esc / backdrop, sehingga `DialogPrimitive.Close` di `SheetContent` tidak menutup. Modal + overlay `z-50` nge-trap fokus → canvas tidak bisa disentuh. Kontrak Radix controlled dialog rusak. | Tambah `onOpenChange={(open) => { if (!open) handleCancel(); }}`. Verifikasi: buka inspector → X, Esc, klik overlay → `selected===null` + fokus kembali ke canvas. |
| 2 | blocker | `apps/showcase/src/app/(docs)/patterns/flow-editor/page.tsx:163-168,300-307` | Tambah node auto-buka sheet penuh. `handleSelectionChange` memanggil `setSelected` untuk semua seleksi termasuk seleksi programatik pasca palette-add. Melanggar PRD FR-006 + design D7 + catatan 005-04: tambah tidak otomatis membuka sheet penuh (node baru terseleksi + fokus + judul inline siap rename). | Bedakan seleksi eksplisit (klik/`Enter`/tombol rincian/menu) vs programatik (tambah). Jangan `setSelected` dari path tambah; hanya fokus ke node baru. Test: tambah via drag + `[+]` → sheet tetap tertutup; klik/`Enter` → sheet terbuka. |
| 3 | blocker | `apps/showcase/src/app/(docs)/patterns/flow-editor/page.tsx:325` | `<SheetClose />` kosong tanpa child/label → `<button>` tanpa nama aksesibel. Duplikat dari tombol X bawaan `SheetContent` (`sheet.tsx:63-66`). Gagal audit a11y. | Hapus `<SheetClose />` telanjang, atau beri child + `aria-label="Tutup inspector"`. Sisakan satu tombol close yang jelas. |
| 4 | major | `apps/showcase/src/app/(docs)/patterns/flow-editor/page.tsx:370-495` | Isi inspector tidak sesuai 005-04 AC-03/AC-05 + spec §4. Mode single-edge hanya `Input readOnly` ID/sumber/label tanpa `[Hapus edge]` dan tanpa input label editable. Mode single-node hanya Judul/ID/Posisi/Koneksi — hilang deskripsi/status/[Duplikat]/meta lengkap. | Kembalikan isi minimal spec: single-node (judul + validasi inline + deskripsi + status + duplikat + hapus + meta id/posisi/koneksi read-only), single-edge (label input + sumber→target read-only + `[Hapus edge]`), multi (hitungan + `[Hapus semua]` + `[Batalkan seleksi]`). Perubahan judul tetap live ke canvas. |
| 5 | major | `apps/showcase/src/app/(docs)/patterns/flow-editor/page.tsx:289-294,300-312` | Duplikasi inspector: `CardFooter InspectorSummary` + `Sheet InspectorPanel` render bersamaan dari `selected` yang sama. Dua panel tumpang tindih → “nggak jelas isinya”. | Pilih satu sumber kebenaran visual. Usulan: saat `Sheet` terbuka, sembunyikan `CardFooter` ringkasan (jadikan live-region hitungan saja, bukan panel kedua). |
| 6 | major | `docs/prd/005-flow-editor.md:3` vs `docs/BACKLOG-ARCHIVE.md:14` + `apps/showcase/src/app/(docs)/patterns/flow-editor/page.tsx:5,48` | Status tidak konsisten: file PRD tulis `approved`, arsip tulis `shipped`. Story 005-06 AC-05 minta `<Toaster>` di route, tapi page sengaja tidak render dengan alasan host tunggal di root layout — task tetap di-tick. | Sinkronkan status PRD (`shipped` bila benar) + putuskan lokasi `<Toaster>` (route vs root) dan catat di CR ini. Jangan biarkan AC ticked tapi kode berkomentar sebaliknya. |
| 7 | minor | `packages/ui/src/components/overlay/sheet.tsx:64-65` | Microcopy close `“Close”` Bahasa Inggris, melanggar konvensi microcopy Indonesia. | Ganti `sr-only` jadi `“Tutup”` / `“Tutup inspector”`. Jika dianggap di luar scope showcase, pindahkan ke CR terpisah. |

## Perubahan yang Diusulkan

- Hanya `apps/showcase/src/app/(docs)/patterns/flow-editor/page.tsx` (logika `selected`/`Sheet` + panel inspector) dan sinkron docs (`BACKLOG.md`, `STATUS.md` bila relevan, `STATUS-LOG.md`).
- Opsional satu baris microcopy di `packages/ui/src/components/overlay/sheet.tsx:65` (`Close` → `Tutup`) bila disetujui — tanpa ubah API/varian.
- Tanpa dependency baru, tanpa token baru, tanpa ubah API publik `FlowEditor` (`nodes/edges/onNodesChange/onEdgesChange/onConnect/onSelectionChange` tetap).

## Tasks (jalur small-fix)

- [x] Tambah `onOpenChange` pada `Sheet` → tutup via X/Esc/overlay meng-clear `selected` + kembalikan fokus ke canvas.
- [x] Pisahkan path tambah vs seleksi eksplisit → tambah dari palette/`[+]` tidak membuka sheet; klik/`Enter`/rincian/menu membuka sheet.
- [x] Perbaiki `<SheetClose />` kosong (hapus atau beri label `Tutup inspector`).
- [x] Lengkapi `InspectorPanel` sesuai AC-03/AC-05 (edge: label input + hapus; node: deskripsi/status/duplikat/meta).
- [x] Hilangkan duplikasi `InspectorSummary` vs `Sheet` saat sheet terbuka.
- [ ] Sinkron docs: status PRD 005 + lokasi `<Toaster>`.
- [ ] Verifikasi: `pnpm lint`, tambah-tidak-buka + tutup-X/Esc/overlay + hapus-edge manual, SR baca hitungan seleksi.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Scope hanya showcase (+ satu baris microcopy bila disetujui), bukan komponen `FlowEditor`/`Sheet` inti | Akar masalah ada di pemakaian controlled `Sheet` di page, bukan di primitive Radix/`cva` |
| 2 | Hapus tanpa dialog blokir tetap dipertahankan (toast + Urungkan sebagai pengaman) | Sesuai keputusan 005-04: loop cepat, konsisten dengan AC-04 |
| 3 | Microcopy Indonesia (`Tutup`, `Hapus semua`, `Batalkan seleksi`) | Konvensi repo + temuan #8 design 005 |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak (Esc/overlay/fokus kembali jalan).
- [ ] API `cva` dan export tetap konsisten (tanpa ubah `sheetVariants`/export).
- [ ] State loading, empty, dan error relevan tersedia (tidak regresi matrix 005-06).
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-019-flow-inspector-on-demand`
Commit: `fix: inspector flow-editor on-demand tidak mengunci [CR-019]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan (lint, test showcase 68/68, tsc, build; browser/SR manual belum).
- [x] CR di-tick. Status di `docs/BACKLOG.md` tetap `approved` (tidak diubah; `done` menunggu user).
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
