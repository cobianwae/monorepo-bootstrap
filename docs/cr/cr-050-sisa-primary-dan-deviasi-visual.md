# CR-050 — Sisa `primary` dekoratif, guard solid fill, dan penutupan deviasi visual

**Status:** approved (hanya user yang menetapkan `approved` dan `done`)
**Sumber:** permintaan user "bereskan skaligus, jangan tanya-tanya" atas daftar sisa dari audit halaman showcase
**Ref:** `docs/design/visual-language.md` (Color Roles, Deviasi), `docs/cr/cr-047-state-terpilih-bg-primary.md`, `docs/cr/cr-049-primary-state-dan-ikon-clinic-crm-scenarios.md`

## Temuan dan keputusan

| # | Lokasi | Pola | Tindakan |
|---|---|---|---|
| 1 | `app/(docs)/patterns/onboarding/page.tsx:113-114` | Banner dan ikon kotak `bg-primary/10` / `bg-primary` | `bg-highlight/10 border-highlight/30`; ikon `bg-highlight text-highlight-foreground` |
| 2 | `app/(docs)/components/layout-navigation/page.tsx:395` | Item navigasi aktif `bg-primary text-primary-foreground` (solid fill) | `border-highlight bg-highlight/10 text-foreground ring-1 ring-highlight` (pola CR-047) |
| 3 | `app/(clinic)/clinic/consultations/page.tsx:629` | Panel KPI kalori `bg-primary/5 border-primary/20` | `bg-highlight/5 border-highlight/30` |
| 4 | `app/(clinic)/clinic/reports/page.tsx:200-201` | Panel protokol `bg-primary/10`, label `text-primary` | `bg-highlight/10 border-highlight/30`, label `text-foreground` (teks kecil tidak memakai `text-highlight`) |
| 5 | `app/(docs)/patterns/auth/page.tsx:330` | Lingkaran ikon 2FA `bg-primary/10 text-primary` | `bg-highlight/10 text-highlight` |

## Sengaja TIDAK diubah (tetap `primary`)

- Avatar dan dot status (`bg-primary` pada notifikasi belum dibaca): identitas dan status, bukan aksi dekoratif.
- Teks angka dan label kecil `text-primary` pada data (mis. `master-data:484`): keputusan kontras, lihat CR-046.
- Sumber data warna: `themes/page.tsx`, `colors/page.tsx`, `data-display` swatch, `settings` swatch. Halaman ini memperagakan token.
- `crm/ai:459` (kursor ketik `bg-primary`): indikator aksi.
- Tombol `Button` dan `variant="default"`.

## Guard

- Ditambah aturan `solid-primary-fill` pada `apps/showcase/src/test/visual-language-guard.test.ts`: melarang `bg-primary text-primary-foreground` di seluruh `src` non-test. Fill solid primary hanya boleh di komponen `Button` dari `@ds/ui`.
- Hasil: 4/4 tes hijau.

## Deviasi visual (ditutup sebagai keputusan dokumen)

- h1 `PageHeader` memakai `text-3xl sm:text-4xl`: keputusan **berlaku**. Mengubahnya berarti mengubah API publik `@ds/ui` dan hanya lewat CR baru bila user memintanya.
- Weight heading 2/3 di docs = `font-bold` (700), bukan 600 dari token. Keputusan: docs memakai 700. Token tidak diubah.
- `visual-language.md` sudah diperbarui sesuai dua keputusan di atas.

## Tasks

- [x] Pindahkan lima pemakaian `primary` dekoratif ke `highlight` (tabel di atas).
- [x] Tambah aturan guard `solid-primary-fill`.
- [x] Perbaiki timeout `waitFor` di `file-upload.test.tsx` (flaky di suite penuh).
- [x] Tutup deviasi h1 PageHeader dan weight 700 di `visual-language.md`.
- [x] Screenshot Atelier/Pulse dark dan light: stepper, master-data, onboarding, layout-navigation (`/tmp/cr050-shots/`).
- [x] Screenshot sampel art direction: stepper Aurora/Nebula (dark), onboarding Blueprint/Ink (light). Keduanya rapi.
- [x] Guard `visual-language-guard` 4/4, `pnpm --filter @ds/showcase lint` dan `build:types` hijau.
- [x] `pnpm typecheck` root: hanya 12 error baseline `flow-editor.test.tsx` (TS2339 `disabled`).
- [x] `pnpm --filter @ds/ui test` (dengan `--maxWorkers=2 --testTimeout=30000`): 706/707. Satu gagal `rich-text-editor` smoke `rte-link-save`, sudah tercatat sebagai baseline di Known Issues.
- [x] `pnpm -C apps/showcase build` dijalankan dari salinan sementara `apps/.showcase-build` (dev server memakai `.next` yang sama): 76/76 halaman lulus. Salinan sudah dihapus.
- [x] `pnpm --filter @ds/showcase test`: 15 file, 78/78 tes lulus.
- [x] Screenshot light Atelier/Pulse: `clinic/consultations`, `clinic/reports`, `patterns/auth` (`/tmp/cr050-shots/`). Rapi, tidak ada teks terpotong.
- [x] CR disetujui user (instruksi 2026-11-22: "setuju semua CR kecuali CR-012 dan CR-013").

## Eksekusi

- **Branch:** `visual-polish`
- **Commit:** lihat `git log` branch `visual-polish` (commit `refactor: sisa primary dekoratif dan guard solid fill [CR-050]`)
