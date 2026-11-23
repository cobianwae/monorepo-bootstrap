# CR-060 — Hydration dan statistik awal RichTextEditor

**Status:** done
**Sumber:** audit
**Ref:** CR-054 C14/V01/V03; `docs/reviews/cr-054-code-audit.md:286`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| C14 | major | `packages/ui/src/components/form/rich-text-editor.tsx:49`–`:53`, `:243`, `:897`–`:902` | Hitungan awal server 0/client nonzero membuat cabang empty/counter berbeda; runtime hydration mismatch eksplisit. | Initial render SSR/client deterministik. |
| V01/V03 | minor | `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.tsx:16` | Konten awal 44 kata diberi badge 0 kata; gambar contoh complete tetapi naturalWidth 0. | Sinkronkan statistik awal; asset demo andal tanpa dependency baru. |

## Perubahan yang Diusulkan

- Perbaiki statistik SSR/hydration tanpa menonaktifkan SSR sebagai workaround luas.
- Pertahankan API/editor behavior; asset lokal mengikuti pola existing.

## Tasks (jalur small-fix)

- [x] Test SSR/hydration value kosong dan nonkosong tanpa hydration warning.
- [x] Uji metadata awal, edit/reset/loading/error dan toolbar/link/image.
- [x] Pastikan gambar demo tersedia dan fallback bermakna.
- [x] Verifikasi suite dan build showcase; pisahkan baseline flaky RTE.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Bukan sekadar keterlambatan screenshot | React melaporkan diff server/client eksplisit. |

## Design System Checks

- [x] Token/kontras, a11y, API/export dan state konsisten; showcase diperbarui.
- [x] Typecheck/lint/test diverifikasi; baseline dicatat.

## Eksekusi

Branch: `cr-060-rte-hydration`
Commit: `b35d0a2` (`fix: stabilize rich text editor hydration [CR-060]`)
Merge: `visual-polish` (setelah commit dokumentasi done)

- [x] Disetujui user (2026-11-23).
- [x] Branch dibuat; implementasi dan verifikasi.
- [x] BACKLOG/STATUS/STATUS-LOG diperbarui; `check-status-log` hijau.
- [x] Review user dan penetapan done (2026-11-23); di-merge ke `visual-polish` dan di-push.

### Hasil implementasi

- Branch `cr-060-rte-hydration` dibuat dari `visual-polish` `7c48c5c`; selama sesi terjadi fast-forward eksternal ke `9a70de2` (merge CR-059), dipertahankan tanpa perubahan di luar scope.
- Statistik awal tidak lagi memakai DOM di initializer. SSR/client pertama sama-sama menampilkan counter pending; `getText()` menyinkronkan statistik saat create/update/perubahan controlled value, tanpa memancarkan `onChange` untuk inisialisasi/reset eksternal.
- Badge menunggu statistik lalu menampilkan 44 kata untuk contoh awal; reset menjadi 0 kata. Gambar memakai `/examples/rich-text-document.svg` dengan alt deskriptif dan fallback teks bila gagal.
- Props/export, dependency, token serta perilaku editing tetap. Callback `onTextChange` kini juga menyinkronkan metadata saat inisialisasi dan pergantian nilai eksternal sesuai tujuan CR.
- Regresi hydration memakai HTML server tanpa `document`, dilanjutkan `hydrateRoot` di DOM client; kosong/nonkosong tanpa recoverable error atau warning hydration. Tes RTE 33/33 dan tes showcase awal/reset/muat ulang/fallback lulus.
- `pnpm typecheck`: tetap gagal pada 12 error baseline `flow-editor.test.tsx:706–753`; tidak ada error baru pada RTE. `pnpm lint`, typecheck showcase, token 10/10 dan build showcase 76/76 lulus.
- `pnpm test` default: UI 708/710, gagal pada OrgChartEditor `stack undo dibatasi 50` dan FileUpload `retries all failed items collectively` (baseline timing). RTE 33/33 lulus termasuk smoke link yang sebelumnya flaky. Suite showcase terpisah 80/80 lulus.
- Ulang suite UI `--maxWorkers=2 --testTimeout=30000`: 709/710; OrgChartEditor/FileUpload lulus, baseline smoke RTE `rte-link-save` gagal lagi (`rich-text-editor.test.tsx:587`). Ulang file RTE terisolasi 32/33 dengan kegagalan sama; tes hydration/metadata baru tetap lulus. Tidak mengubah flow link atau melonggarkan tes untuk menyembunyikan baseline.
- Smoke HTTP build produksi: `/patterns/rich-text-editor`, `/components/forms`, dan aset SVG lokal masing-masing 200; server smoke dihentikan setelah pengecekan. Hydration diuji di jsdom, bukan browser native; tidak mengklaim audit visual seluruh tema/screen reader.
- Review user 2026-11-23: CR ditetapkan **done**, di-merge ke `visual-polish`, dan di-push bersama branch CR.
