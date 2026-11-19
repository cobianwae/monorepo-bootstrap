# CR-NNN — Judul

**Status:** draft
**Sumber:** review / audit / bug / a11y / token / docs
**Ref:** `docs/prd/...`, `docs/stories/...`, `docs/design/...`, atau `file:line`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | blocker/major/minor | `path:line` | — | — |

## Perubahan yang Diusulkan

- Ringkas perubahan yang akan dilakukan.
- Sebutkan file utama dan dampaknya ke API publik komponen.

## Tasks (jalur small-fix)

- [ ] Task 1
- [ ] Task 2
- [ ] Verifikasi

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | — | — |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-NNN-slug`
Commit: `type: deskripsi [CR-NNN]`

- [ ] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
