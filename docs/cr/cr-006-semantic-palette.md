# CR-006 — Eliminasi palette literal (bypass token semantik)

**Status:** approved
**Sumber:** audit / token
**Ref:** `packages/ui/src/components/data-display/timeline.tsx:29`, `packages/ui/src/components/marketing/cta-band.tsx:14`, `packages/ui/src/components/layout/section.tsx:20`, `packages/ui/src/components/navigation/footer.tsx:13`, `packages/ui/src/components/navigation/navbar.tsx:20`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | minor | `packages/ui/src/components/data-display/timeline.tsx:29` | Palette literal `bg-amber-500/20 text-amber-600 dark:text-amber-400` untuk status warning, padahal token `warning` tersedia dan status lain sudah pakai token. Kontras `amber-600` di background terang ≈ 3.1:1. | Ganti ke `bg-warning/20 text-warning` dan audit kontras via `checkCompliance`. |
| 2 | minor | `packages/ui/src/components/marketing/cta-band.tsx:14` | Palette literal (`bg-zinc-950 text-zinc-100 border-zinc-800`) mem-bypass token; blok tampil sama di 8 tema dan merusak dark/light parity. | Map ke `bg-background`, `text-foreground`, `border-border` atau buat varian token tersendiri. |
| 3 | minor | `packages/ui/src/components/layout/section.tsx:20` | Palette literal zinc mem-bypass token semantik. | Map ke token semantik (`bg-background`, `text-foreground`, `border-border`). |
| 4 | minor | `packages/ui/src/components/navigation/footer.tsx:13` | Palette literal zinc mem-bypass token semantik. | Map ke token semantik (`bg-background`, `text-foreground`, `border-border`). |
| 5 | minor | `packages/ui/src/components/navigation/navbar.tsx:20` | `border-white/10 dark:border-white/5` — literal `white`, bukan token. | `border-border/10` atau token khusus. |

## Perubahan yang Diusulkan

- Ganti seluruh palette literal di daftar temuan dengan token semantik yang tersedia.
- Audit kontras pasangan foreground/background yang berubah pada 8 tema light dan dark.
- Jika ada tampilan yang memang butuh blok gelap tetap, buat token/varian eksplisit, jangan literal.
- Tidak mengubah nama export atau props publik.

## Tasks (jalur small-fix)

- [x] Ganti palette `timeline` ke token `warning`
- [x] Ganti palette `cta-band`, `section`, `footer` ke token semantik
- [x] Ganti border literal `navbar`
- [x] Audit kontras 8 tema light+dark
- [x] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:tokens`

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Varian `dark` (`cta-band`, `section`, `footer`) memakai token `inverse` baru (`--inverse`, `--inverse-foreground`, `--inverse-border`), bukan `bg-background`. Token fixed (identik light/dark, semua 8 tema) di `tokens.css` + registry `tokens.ts`; kontras 18.10:1 (AAA), diuji di `contrast.test.ts`. | Map ke `bg-background` membuat varian `dark` identik `default` dan menghapus blok gelap yang disengaja; CR mengizinkan "varian token tersendiri". Dipilih user saat approval. |
| 2 | `timeline` warning memakai `text-warning-text`, bukan `text-warning` seperti rekomendasi awal CR. | Audit: `warning` #D97706 di atas tint terang = 3.19:1 (gagal AA); `warning-text` #B45309 = 5.02:1 (lolos AA) dan memang token untuk teks di permukaan tinted (preseden `badge` `warning-outline`). |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA.
- [x] Perilaku Radix/a11y tidak rusak.
- [x] API `cva` dan export tetap konsisten.
- [x] State loading, empty, dan error relevan tersedia.
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-006-semantic-palette`
Commit: `fix: replace literal palettes with semantic tokens [CR-006]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
