# CR-055 — Kontras teks kecil lintas tema

**Status:** approved
**Sumber:** audit
**Ref:** CR-054 C01; `docs/reviews/cr-054-code-audit.md:23`, `docs/design/visual-language.md`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| C01 | major | `apps/showcase/src/app/(docs)/components/forms/page.tsx:469`; daftar lengkap pada laporan kode | Teks kecil memakai highlight; model token light gagal 4,5:1 pada lima dari delapan tema. | Ukur pasangan computed foreground/background, gunakan peran teks yang kontras. |

## Perubahan yang Diusulkan

- Perbaiki seluruh lokasi C01 termasuk inherited eyebrow, badge, hover, landing dan scenario; jangan mengganti semua string highlight secara buta.
- Tidak mengubah nilai/nama token atau API publik tanpa persetujuan terpisah.

## Tasks (jalur small-fix)

- [ ] Reproduksi lokasi C01 dan ukur kontras aktual delapan tema light/dark, termasuk tint/hover.
- [ ] Perbaiki kelas teks; pertahankan highlight untuk ikon/border yang sesuai.
- [ ] Tambah regression guard terarah dan screenshot; jalankan verifikasi sesuai konvensi.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Tidak mengubah token global | Masalah pemakaian peran warna; model token bukan bukti semua background aktual. |

## Design System Checks

- [ ] Token semantik dan kontras AA light/dark terukur.
- [ ] Perilaku/a11y, API/export dan state tetap konsisten; showcase diperbarui.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` dijalankan; baseline dipisahkan.

## Eksekusi

Branch: `cr-055-small-text-contrast`
Commit: `fix: correct small text contrast [CR-055]`

- [x] Disetujui user (2026-11-23).
- [ ] Branch dibuat; perubahan diimplementasikan.
- [ ] Verifikasi dan update BACKLOG/STATUS/STATUS-LOG; `check-status-log` hijau.
