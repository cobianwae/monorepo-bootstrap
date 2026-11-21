# CR-011 — Sitemap & rujukan docs Rich Text Editor (PRD 006)

**Status:** approved
**Sumber:** review
**Ref:** `docs/design/sitemap.md:65`, `docs/design/sitemap.md:102-114`, `docs/prd/006-rich-text-editor.md:99-100`, `docs/design/rich-text-editor.md` §8, `docs/stories/006-05-showcase-audit-smoke.md:52`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `docs/design/sitemap.md:65` | S-005.22 tercatat `implemented`, padahal spec §8 dan story 006-05 menyatakan `in-design` hingga 006-05 `done` (komponen reusable `form/rich-text-editor` belum ada; yang ada baru baseline showcase ad-hoc). | Ubah status S-005.22 menjadi `in-design`. |
| 2 | major | `docs/design/sitemap.md:102-114` | Modal Registry berhenti di M-008; M-009 (link editor) dan M-010 (gambar via URL) yang dirujuk spec, wireframe, dan story 006-02/006-04 tidak terdaftar sehingga ID tidak tertelusur. | Tambah baris M-009 dan M-010 dengan status `in-design` dan pemakaian S-005.22. |
| 3 | minor | `docs/prd/006-rich-text-editor.md:99-100` | Rujukan design masih berbunyi "dibuat saat gate 2", padahal `docs/design/rich-text-editor.md` sudah `approved` (gate 2, 2026-11-21) beserta wireframe dan flows. | Perbarui rujukan ke artefak design yang sudah approved. |

## Perubahan yang Diusulkan

- `docs/design/sitemap.md`: status S-005.22 → `in-design`; tambah M-009/M-010 di Modal Registry (`in-design`, dipakai di S-005.22).
- `docs/prd/006-rich-text-editor.md`: perbarui § Design Refs ke spec/wireframe/flows yang sudah approved.
- Tidak mengubah API publik komponen, token, atau dependency. Murni perapian docs.

## Tasks (jalur small-fix)

- [ ] Ubah status S-005.22 menjadi `in-design` di `sitemap.md`
- [ ] Tambah entri M-009 dan M-010 di Modal Registry `sitemap.md`
- [ ] Perbarui § Design Refs di PRD 006
- [ ] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (docs-only, smoke)

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Disetujui user 2026-11-21 | Scope docs-only; eksekusi (branch + implementasi) menyusul |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-011-sitemap-rich-text-editor`
Commit: `docs: rapikan sitemap dan rujukan RTE 006 [CR-011]`

- [x] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
