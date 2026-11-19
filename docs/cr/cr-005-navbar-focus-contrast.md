# CR-005 — Indikator fokus NavbarLink dan kontras `highlight`/`accent`

**Status:** done
**Sumber:** audit / a11y
**Ref:** `packages/ui/src/components/navigation/navbar.tsx:105-108`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `packages/ui/src/components/navigation/navbar.tsx:105` | `NavbarLink` memakai `focus:outline-none focus:bg-accent` tanpa ring; indikator fokus hanya perubahan background halus, dan `focus` (bukan `focus-visible`) juga muncul saat klik mouse. | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` konsisten dengan komponen lain. |
| 2 | major | `packages/ui/src/components/navigation/navbar.tsx:107` | `text-highlight` di atas `bg-accent/70` bukan pasangan foreground–background terdefinisi di token; nilai berubah per 8 tema sehingga kontras belum terjamin. | Verifikasi dengan `checkCompliance` untuk 8 tema light+dark, atau gunakan pasangan terdefinisi (`text-foreground` + indikator aktif non-warna). |

## Perubahan yang Diusulkan

- Ganti `focus:` menjadi `focus-visible:` dengan `ring-2 ring-ring` pada `NavbarLink`.
- Audit kontras `text-highlight` di atas `bg-accent/70` untuk seluruh 8 tema light dan dark via `checkCompliance`; ganti pasangan bila gagal.
- Pertahankan indikator aktif yang tidak hanya mengandalkan warna.
- Tidak mengubah nama export atau API `cva`; jika ada penambahan varian visual, dokumentasikan.

## Tasks (jalur small-fix)

- [x] Ganti focus ring ke `focus-visible:ring-ring`
- [x] Audit kontras `highlight`/`accent` 8 tema light+dark — light gagal (2.58–3.37:1), dark lolos; `text-highlight` dihapus
- [x] Ganti pasangan warna bila gagal kontras — aktif kini `text-foreground` + `font-semibold`
- [x] Test fokus keyboard — `focus-visible:ring-ring`, tanpa `text-highlight`, `font-semibold`
- [x] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:tokens`

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Hapus `text-highlight` di atas `bg-accent/70`; aktif kini `text-foreground` + `font-semibold` | Audit 8 tema light+dark: light gagal (2.58–3.37:1), dark lolos; pasangan bukan token terdefinisi. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA.
- [x] Perilaku Radix/a11y tidak rusak.
- [x] API `cva` dan export tetap konsisten.
- [x] State loading, empty, dan error relevan tersedia.
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-005-navbar-focus-contrast`
Commit: `fix: navbar focus ring and contrast audit [CR-005]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
