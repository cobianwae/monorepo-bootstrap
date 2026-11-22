# CR-046 — Kontras eyebrow `PageHeader` (text-highlight kecil)

**Status:** draft
**Sumber:** audit halaman tidak koheren (2026-11-22), temuan terbuka
**Ref:** `docs/design/visual-language.md` (Color Roles; aturan teks kecil tidak memakai `text-highlight`; daftar pelanggaran lama)

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | minor | `packages/ui/src/components/layout/page-header.tsx:90` | Eyebrow `text-xs` memakai `text-highlight` di atas `bg-highlight/10`. Kontras `highlight` vs surface light: pulse 4,48; sunset 4,70; botanic 4,77; midnight 5,19; nebula 3,65; lagoon 3,52; ink 3,91; graphite 3,05 (di bawah 4,5:1 untuk teks kecil). | Ganti warna teks eyebrow ke `text-foreground` (atau `text-muted-foreground`); tint `highlight/10` tetap sebagai aksen. |

## Mengapa CR terpisah

`PageHeader` berada di `packages/ui` dan merupakan API publik `@ds/ui`. Perubahan ini hanya mengubah warna internal (tanpa mengubah props atau nama export), tetapi tetap menyentuh komponen publik, sehingga menunggu persetujuan user (AGENTS.md: API publik butuh konfirmasi).

## Perubahan (usulan)

- Ubah kelas warna teks eyebrow di `page-header.tsx:90` ke `text-foreground`. Props dan export tidak berubah.
- Tambah tes di `packages/ui` bila komponen belum punya tes kelas warna (opsional; jangan menambah pola baru tanpa alasan).

## Tasks

- [ ] Persetujuan user untuk mengubah `PageHeader` (API publik internal style).
- [ ] Ubah kelas eyebrow.
- [ ] Verifikasi kontras 8 tema light dan dark (`packages/tokens`).
- [ ] Screenshot `components/layout-navigation`, `patterns/*` yang memakai `PageHeader`.
- [ ] `pnpm --filter @ds/ui test`, `pnpm --filter @ds/ui lint`, `pnpm --filter @ds/ui typecheck` (atau root `pnpm typecheck`; baseline 12 error FlowEditor).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Tidak diubah di luar CR ini; belum dieksekusi | Menyentuh `@ds/ui` (API publik); butuh persetujuan user |

## Design System Checks

- [x] Teks kecil tidak memakai `text-highlight` (aturan `visual-language.md`).
- [ ] Kontras diverifikasi ulang setelah perubahan.

## Eksekusi

Belum dieksekusi. Status tetap `draft` sampai user menyetujui.
