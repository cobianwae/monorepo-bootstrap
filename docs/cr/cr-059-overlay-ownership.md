# CR-059 — Fokus modal dan aktivasi command palette

**Status:** draft
**Sumber:** audit
**Ref:** CR-054 C06/C17; `docs/reviews/cr-054-code-audit.md`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| C06 | major | `apps/showcase/src/app/(docs)/patterns/onboarding/page.tsx:148` | Modal kustom membiarkan fokus keluar dan Escape tidak menutup. | Gunakan Dialog Radix dan return focus yang teruji. |
| C17 | major | `packages/ui/src/components/navigation/command-palette.tsx:72`–`:87`; `apps/showcase/src/app/(docs)/patterns/command-palette/page.tsx:119` | Instance global dan demo mendengar aktivasi sama; klik membuka dua dialog, Escape menyisakan satu. | Satu pemilik aktivasi per konteks. |

## Perubahan yang Diusulkan

- Perbaiki onboarding dan koordinasi global/demo tanpa mengubah tujuan aksi.
- Konfirmasi desain kepemilikan aktivasi sebelum mengubah API publik.

## Tasks (jalur small-fix)

- [ ] Reproduksi pointer/shortcut global dan demo, termasuk route overlays-menus bila memasang instance.
- [ ] Pastikan satu dialog, initial focus, siklus Tab/Shift+Tab, Escape dan return focus.
- [ ] Uji search/Arrow/Enter command; pertahankan shortcut di halaman tanpa demo.
- [ ] Selidiki return focus lightbox media: probe Escape menutup tetapi tidak kembali ke pemicu yang sudah difokuskan; belum ditetapkan akar masalah.
- [ ] Regression tests dan verifikasi sesuai konvensi.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Fokus dinilai setelah jumlah portal benar | Dua dialog membuat pemeriksaan dialog pertama menyesatkan. |

## Design System Checks

- [ ] Token/kontras, Radix/a11y, API/export dan state konsisten; showcase diperbarui.
- [ ] Typecheck/lint/test diverifikasi; baseline dicatat.

## Eksekusi

Branch: `cr-059-overlay-ownership`
Commit: `fix: coordinate overlays and command activation [CR-059]`

- [ ] Disetujui user; branch dibuat; implementasi dan verifikasi.
- [ ] BACKLOG/STATUS/STATUS-LOG diperbarui; `check-status-log` hijau.
