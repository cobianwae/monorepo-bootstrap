# CR-051 — PageHeader: status temuan dan keputusan API

**Status:** done (ditetapkan user 2026-11-23)
**Sumber:** audit visual-polish; `docs/design/visual-language.md` (Type Scale, Color Roles, Deviasi)
**Ref:** CR-046 (eyebrow kontras), `packages/ui/src/components/layout/page-header.tsx`

## Temuan

| # | Lokasi | Temuan | Status |
|---|---|---|---|
| 1 | `page-header.tsx:90` | Eyebrow memakai `text-highlight` kecil di atas `highlight/10` (rasio 3,05–5,19:1 di light) | **Sudah selesai** di CR-046: teks `text-foreground`, ikon `[&>svg]:text-highlight`. Diverifikasi bd54d89. |
| 2 | `page-header.tsx:143` | h1 memakai `text-3xl sm:text-4xl` (1.875/2.25rem), bukan Heading 1 2rem di scale | Deviasi tercatat. Keputusan (lihat di bawah). |
| 3 | `page-header.tsx:102` | Judul memakai `font-display font-bold` (700); token Heading 2/3 weight 600 | Deviasi tercatat, bukan bagian CR ini. |

## Keputusan (diambil di CR ini, tanpa perubahan kode)

- Temuan 1: selesai, tidak perlu tindakan.
- Temuan 2: **nilai `text-3xl sm:text-4xl` dipertahankan.** Mengubahnya adalah perubahan API publik `@ds/ui`
  (visual setiap pemakai `PageHeader`), jadi tidak dilakukan tanpa persetujuan user.
- Temuan 3: docs memakai `font-bold` (700), token 600 tidak diubah.

## Di luar CR ini

- Mengubah ukuran h1 `PageHeader` ke 2rem/2.5rem. Butuh CR baru bila user menginginkannya, karena menyentuh API publik.
- Sinkronisasi weight token 600 vs 700. Butuh CR token terpisah.

## Tasks

- [x] Verifikasi temuan 1 (kode dan kontras) lewat CR-046.
- [x] Catat keputusan temuan 2 dan 3 di `docs/design/visual-language.md` (bagian Deviasi).
- [x] CR disetujui user (instruksi 2026-11-22: "setuju semua CR kecuali CR-012 dan CR-013").
- [x] Keputusan tercatat di STATUS-LOG; rekonsiliasi 2026-11-23 memperbarui log dan memverifikasi `node scripts/check-status-log.mjs`. Tidak ada perubahan kode; done ditetapkan user 2026-11-23.

## Eksekusi

Tidak ada perubahan kode di CR ini. Branch: `visual-polish`.
