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
- [x] Verifikasi kontras 8 tema light dan dark: `foreground` di atas `highlight/10` (dihitung dari OKLCH `packages/tokens/src/tokens.css`, `/tmp/vl-calc/cr046.mjs`). Light 16,4–18,5:1; dark 8,1–9,6:1; terendah pulse dark 8,13:1. Semua lolos 4,5:1.
- [x] `pnpm --filter @ds/ui test` layout 9/9 hijau; `pnpm --filter @ds/ui lint` hijau.
- [x] Screenshot `PageHeader` eyebrow: terlihat di screenshot verifikasi CR-049 (clinic dan crm, dark dan light), teks terbaca.
- [x] Root `pnpm typecheck`: hanya 12 error baseline `flow-editor.test.tsx`. `pnpm test`: tokens 10/10; ui 707/707 pada run kedua (run pertama 1 tes `FileUpload` drag handles gagal, lulus 18/18 saat dijalankan sendiri, flaky).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Tidak diubah di luar CR ini; belum dieksekusi | Menyentuh `@ds/ui` (API publik); butuh persetujuan user |

## Design System Checks

- [x] Teks kecil tidak memakai `text-highlight` (aturan `visual-language.md`).
- [x] Kontras diverifikasi ulang setelah perubahan (16 kombinasi tema × mode, lihat di atas).

## Eksekusi

Belum dieksekusi. Status tetap `draft` sampai user menyetujui.
