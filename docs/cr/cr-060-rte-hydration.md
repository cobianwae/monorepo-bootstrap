# CR-060 — Hydration dan statistik awal RichTextEditor

**Status:** draft
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

- [ ] Test SSR/hydration value kosong dan nonkosong tanpa hydration warning.
- [ ] Uji metadata awal, edit/reset/loading/error dan toolbar/link/image.
- [ ] Pastikan gambar demo tersedia dan fallback bermakna.
- [ ] Verifikasi suite dan build showcase; pisahkan baseline flaky RTE.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Bukan sekadar keterlambatan screenshot | React melaporkan diff server/client eksplisit. |

## Design System Checks

- [ ] Token/kontras, a11y, API/export dan state konsisten; showcase diperbarui.
- [ ] Typecheck/lint/test diverifikasi; baseline dicatat.

## Eksekusi

Branch: `cr-060-rte-hydration`
Commit: `fix: stabilize rich text editor hydration [CR-060]`

- [ ] Disetujui user; branch dibuat; implementasi dan verifikasi.
- [ ] BACKLOG/STATUS/STATUS-LOG diperbarui; `check-status-log` hijau.
