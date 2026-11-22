# CR-040 — Kontras teks varian `info` pada Banner

**Status:** draft
**Sumber:** a11y / bug
**Ref:** `packages/ui/src/components/feedback/banner.tsx:18`, `apps/showcase/src/app/(docs)/components/states-feedback/page.tsx:149`, `docs/design/visual-language.md` (Color Roles, aturan kontras teks)

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `packages/ui/src/components/feedback/banner.tsx:18` | Varian `info` memakai `bg-info/15 text-info-foreground`. `info-foreground` dirancang untuk fill solid `info`, bukan tint 15%. Teks menjadi hampir sama warnanya dengan latar. | Ubah teks ke `text-foreground` (atau `text-info` bila perlu aksen). |

Hasil hitung kontras (OKLCH dari `packages/tokens/src/tokens.css`; tint = `info` 15% di atas `background`/surface, pendekatan):

| Mode | `info-foreground` di atas tint | `info` sebagai teks di atas surface | `foreground` di atas tint (usulan) |
|---|---|---|---|
| Light (Pulse) | ≈ 1,20:1 (gagal) | ≈ 5,09:1 (lolos) | perlu diukur (≥ 4,5 diharapkan) |
| Dark (Pulse) | ≈ 1,25:1 (gagal) | ≈ 7,10:1 (lolos) | perlu diukur |

Catatan: angka di atas adalah pendekatan (satu tema, satu surface). Audit per tema (8 tema × light/dark) belum dilakukan.

Pemakaian varian `info` di showcase: `states-feedback/page.tsx:149` (teks "Scheduled maintenance window…") dan banner di baris atas halaman yang sama. Sudah terbukti pudar pada screenshot dark dan light (Atelier/Pulse).

## Perubahan yang Diusulkan

- `banner.tsx`: ganti `text-info-foreground` pada varian `info` menjadi warna teks yang lolos AA di atas tint.
- Tidak mengubah props, nama export, atau struktur varian. Hanya nilai kelas warna untuk satu varian, sehingga tetap perlu persetujuan user karena menyentuh perilaku varian (CONVENTIONS: "Butuh Konfirmasi").
- Tidak menambah token baru.
- Varian `success`, `warning`, `destructive` juga memakai pola tint (`/15`) dengan `*-foreground`. Belum diukur; masuk audit tahap 2 bila terbukti sama.

## Tasks (jalur small-fix)

- [ ] Persetujuan user untuk mengubah kelas varian `info` di `packages/ui`.
- [ ] Hitung rasio final `foreground` (dan `info`) di atas tint 15% untuk 8 tema, light dan dark, lewat `packages/tokens/src/contrast.ts` atau skrip, lalu catat di tabel.
- [ ] Ubah `banner.tsx:18`.
- [ ] Tambah tes unit (Banner `info`) bila perlu, atau verifikasi lewat `pnpm test` ui.
- [ ] Screenshot `components/states-feedback` (light & dark) untuk banner info.
- [ ] Audit varian `success`, `warning`, `destructive` dengan pola yang sama (tercatat, bukan bagian CR ini kecuali disetujui).
- [ ] Verifikasi: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm --filter @ds/showcase exec vitest run src/test/visual-language-guard.test.ts`.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Teks varian `info` memakai `text-foreground` (usulan) | Tint 15% tidak boleh membawa teks berwarna `*-foreground`; `foreground` sudah lolos pada tint lain. Belum diukur. |
| 2 | Tidak menambah token | Cukup memakai token yang ada. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA (≥ 4,5:1 untuk teks) pada tint.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] Showcase/docs diperbarui bila perlu.

## Eksekusi

Branch: `visual-polish`
Commit: `fix: kontras teks varian info pada Banner [CR-040]` (dibuat setelah verifikasi di bawah)

Verifikasi:
- Perubahan: `packages/ui/src/components/feedback/banner.tsx:18` `text-info-foreground` → `text-foreground`.
- Hitung kontras (Pulse, pendekatan): sebelum ≈1,20:1 light / 1,33:1 dark; sesudah ≈15,24:1 light / 13,58:1 dark.
- `pnpm --filter @ds/ui exec vitest run src/components/feedback`: 10/10 lulus.
- Screenshot dark Atelier/Pulse `components/states-feedback`: teks "Scheduled maintenance window…" terbaca.
- Belum: audit 8 tema penuh; varian success/warning/destructive belum diukur.

- [ ] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS-LOG.md` di-append dan `node scripts/check-status-log.mjs` hijau.
