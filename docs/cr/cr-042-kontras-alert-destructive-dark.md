# CR-042 — Kontras teks varian `destructive` pada Alert (dark)

**Status:** draft
**Sumber:** a11y
**Ref:** `packages/ui/src/components/feedback/alert.tsx`, `docs/cr/cr-040-kontras-banner-info.md`, `docs/design/visual-language.md` (Color Roles)

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `packages/ui/src/components/feedback/alert.tsx` (varian `destructive`) | Teks `text-destructive` di atas `bg-destructive/10` berkontras 4,17–4,58:1 di dark (gagal tipis di 6 dari 8 tema: sunset 4,17; botanic 4,34; pulse 4,32; nebula 4,47; lagoon 4,49; ink 4,50). Light lolos 4,58:1 di semua tema. | Teks memakai `text-foreground`; ikon (`[&>svg]`) dan border tetap `destructive`. Pola sama dengan CR-040. |

Hitungan: `/tmp/vl-calc/audit3.mjs` (OKLCH dari `packages/tokens/src/tokens.css`). Semantik dari blok Pulse; permukaan dari tiap tema.

## Perubahan

- `alert.tsx` varian `destructive`: `text-destructive` → `text-foreground`. Props, nama export, dan API varian tidak berubah.
- Dampak visual: judul/teks Alert destructive di light menjadi netral (sebelumnya merah). Ikon dan border tetap merah, sehingga status tetap terbaca.

## Tasks

- [x] Ubah `alert.tsx`.
- [x] `pnpm --filter @ds/ui exec vitest run src/components/feedback`: 10/10 lulus.
- [x] `pnpm --filter @ds/ui lint`: hijau.
- [ ] Screenshot dark dan light `components/states-feedback` (Alert destructive) untuk konfirmasi visual.
- [ ] `pnpm typecheck`, `pnpm test` penuh, `pnpm -C apps/showcase build`.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Teks netral, bukan token baru | Pola sama dengan CR-040; tidak menambah token. |
| 2 | Warna status tetap di ikon dan border | Status tetap terbaca tanpa mengandalkan teks merah. |

## Design System Checks

- [x] Tidak ada hex/RGB baru.
- [x] Kontras teks ≥ 4,5:1 di light dan dark untuk semua tema (dengan `foreground`).
- [ ] Screenshot visual belum dijalankan.

## Eksekusi

Branch: `visual-polish`
Commit: `fix: teks Alert destructive memakai foreground agar kontras dark lolos [CR-042]`

- [ ] CR disetujui user.
- [x] Perubahan diimplementasikan.
- [ ] Verifikasi penuh dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS-LOG.md` di-append dan `node scripts/check-status-log.mjs` hijau.
