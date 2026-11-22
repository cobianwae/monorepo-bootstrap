# CR-052 — Perluas guard heading ke seluruh app/(docs)

**Status:** approved (hanya user yang menetapkan `approved` dan `done`)
**Sumber:** audit visual-polish setelah CR-039/CR-041/CR-050; pertanyaan user "perluas guard heading (ini butuh cr atau gimana?)"
**Ref:** `apps/showcase/src/test/visual-language-guard.test.ts`, CR-041 (h2 manual sisa), CR-045 (guard src)

## Temuan audit (grep, 2026-11-22)

| Pola | Sebelum | Sesudah |
|---|---|---|
| `<h2 className="text-2xl font-bold` di app/(docs) non-foundations | 0 | 0 |
| `<h[23] className="text-lg font-bold` di app/(docs) non-foundations | 1 (`guidelines/page.tsx:133`) | 0 |
| `<h2 className="[^"]*flex items-center` (judul kartu `text-sm`) | 4 (`calendar` 2, `org-chart` 1, `org-chart`/lain) | 4, **tidak diubah** |

Empat hit `flex items-center` berupa judul kartu kecil (`text-sm font-semibold`), bukan heading section.
Aturan `manual-heading-with-icon` tetap berlaku hanya di foundations. Memperluasnya akan memaksa
judul kartu menjadi `SectionHeading`, padahal CR-041 sudah memutuskan judul kartu tidak perlu diubah.

## Perubahan

1. `app/(docs)/guidelines/page.tsx`: heading "Visual Do's & Don'ts" memakai `<SectionHeading title=… />`
   (impor relatif `../../../components/section-heading`, karena vitest tidak punya alias `@/`).
2. `visual-language-guard.test.ts`:
   - Aturan `manual-heading-lg-bold` diberi `root: DOCS` (seluruh `app/(docs)`).
   - Tes baru: `seluruh app/(docs) tidak memakai text-lg font-bold sebagai heading`. Total tes 5/5.

## Keputusan

- Cakupan heading diperluas ke **pola yang pasti heading** (`text-lg font-bold` pada h2/h3, dan
  `text-2xl font-bold` pada h2 yang sudah nol). Pola judul kartu kecil tidak diperluas.
- Perluasan `manual-heading-with-icon` ke docs ditunda sampai ada keputusan terpisah untuk judul kartu.

## Tasks

- [x] Audit pola heading di app/(docs) dan components/.
- [x] Ganti sisa `text-lg font-bold` (guidelines) ke `SectionHeading`.
- [x] Perluas aturan `manual-heading-lg-bold` ke `DOCS` dan tambah tes.
- [x] `pnpm --filter @ds/showcase exec vitest run src/test/visual-language-guard.test.ts`: 5/5 hijau.
- [x] `pnpm --filter @ds/showcase lint`: hijau.
- [x] `pnpm --filter @ds/showcase build:types`: hijau.
- [x] Screenshot `guidelines` light Atelier/Pulse dilihat: heading seragam dengan section lain (dark: /tmp/cr052-shots/guidelines-dark-atelier-pulse.png).
- [x] `docs/STATUS-LOG.md` di-append dan `node scripts/check-status-log.mjs` hijau.

## Eksekusi

Dicommit di branch `visual-polish` (lihat STATUS-LOG).
