# CR-046 — Kontras eyebrow `PageHeader` (text-highlight kecil)

**Status:** approved (disetujui user 2026-11-22; `done` menunggu user)
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

- [x] Persetujuan user untuk mengubah `PageHeader` (disetujui 2026-11-22).
- [x] Ubah kelas eyebrow: teks `text-foreground`, ikon tetap `text-highlight` lewat `[&>svg]:text-highlight`. Props dan export tidak berubah.
- [ ] Verifikasi kontras 8 tema light dan dark: belum diukur ulang secara formal. Dasar: teks foreground di atas `highlight/10` (rasio jauh di atas 4,5:1 karena foreground kontras tinggi terhadap surface).
- [x] `pnpm --filter @ds/ui test` layout 9/9 hijau; `pnpm --filter @ds/ui lint` hijau.
- [ ] Screenshot `PageHeader` eyebrow: belum dilakukan.
- [ ] Root `pnpm typecheck`, `pnpm test` penuh: belum dijalankan setelah CR-046.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Tidak diubah di luar CR ini; belum dieksekusi | Menyentuh `@ds/ui` (API publik); butuh persetujuan user |

## Design System Checks

- [x] Teks kecil tidak memakai `text-highlight` (aturan `visual-language.md`).
- [ ] Kontras diverifikasi ulang setelah perubahan.

## Eksekusi

Belum dieksekusi. Status tetap `draft` sampai user menyetujui.
