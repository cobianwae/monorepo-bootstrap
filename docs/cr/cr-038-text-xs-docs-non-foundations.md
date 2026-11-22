# CR-038 — Ganti `text-[Npx]` di `app/(docs)` non-foundations dengan `text-xs`

**Status:** approved (disetujui user 2026-11-22; `done` menunggu user)
**Sumber:** audit lanjutan CR-035/037 — 99 pemakaian `text-[10px]`/`text-[11px]`/`text-[9px]` di halaman docs di luar foundations
**Ref:** `docs/design/visual-language.md` (Type Scale: teks terkecil `text-xs`), `apps/showcase/src/test/visual-language-guard.test.ts`

> Prioritas MoSCoW: **should**. Lightweight track (perbaikan nilai token/pola kecil). `approved`/`done` hak user.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | 29 file `apps/showcase/src/app/(docs)/**/page.tsx` di luar `foundations` | 99 `text-[Npx]` (51× `10px`, 47× `11px`, 1× `9px`) melanggar aturan "dilarang `text-[Npx]`" di visual-language.md. | Ganti ke `text-xs` (0.75rem). |
| 2 | minor | `visual-language-guard.test.ts` | Aturan `arbitrary-px-text` hanya berlaku di `foundations`, sehingga pelanggaran di halaman lain tidak terdeteksi. | Perluas aturan ini ke seluruh `app/(docs)`; aturan heading/callout tetap di `foundations`. |

## Perubahan

- `sed` terarah: `text-[(9|10|11)px]` → `text-xs` di 29 file (di luar `foundations`). Tidak ada perubahan selain kelas tersebut.
- Guard: aturan `arbitrary-px-text` punya field `root`; untuk `app/(docs)` seluruhnya. Tes baru "seluruh app/(docs) tidak memakai text-[Npx]".
- Tidak ada perubahan token, `@ds/ui`, atau dependency.

## Tasks

- [x] Ganti 99 `text-[9/10/11px]` → `text-xs` di 29 file docs non-foundations (verifikasi: 0 sisa di `app/(docs)`).
- [x] Perluas guard ke seluruh `app/(docs)` untuk aturan px-only.
- [x] `pnpm --filter @ds/showcase exec vitest run src/test/visual-language-guard.test.ts` hijau 4/4.
- [x] `pnpm --filter @ds/showcase lint` dan `build:types` hijau.
- [x] Verifikasi visual (dark, Atelier/Pulse, dev server :4000, Chrome headless `--screenshot` 1440px): `components/layout-navigation`, `components/data-display`, `patterns/data-table`, `patterns/master-data`, `patterns/workspace`, `components/states-feedback`, `components/forms`. Tidak ada label `text-xs` yang terpotong atau tumpang tindih.
  - Catatan terbuka (belum dibandingkan dengan HEAD sebelumnya): teks di banner info biru `states-feedback` ("Scheduled maintenance window…" dan banner baris atas) tampak redup di atas latar biru. Bukan perubahan ukuran; perlu cek kontras terpisah.
  - Indikator "1 Issue" di pojok kiri bawah saat `/components/forms` adalah overlay dev Next.js, bukan bagian halaman.
- [x] Verifikasi visual light mode (Atelier/Pulse) pada 7 halaman yang sama. Tidak ada label `text-xs` terpotong atau tumpang tindih.
  - Regresi yang ditemukan dan diperbaiki (commit `eaf5fcf`): `patterns/workspace` nama file dan ukuran file menempel (ukuran naik dari 10px ke 12px). Diperbaiki dengan `truncate`, `shrink-0 pl-2`.
  - Kontras banner info (`text-info-foreground` di atas `info/15`) pudar di light dan dark, bukan akibat CR ini. Dicatat sebagai CR-040 (draft).
- [ ] Sampel art direction dan palet selain Atelier/Pulse: belum diverifikasi untuk CR ini (Aurora/Nebula, Blueprint/Ink belum dibuka untuk halaman ini).
- [ ] `pnpm test` penuh, `pnpm typecheck`, `pnpm -C apps/showcase build` dijalankan ulang untuk kondisi terakhir. Belum: lihat catatan verifikasi di STATUS-LOG.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Satu pengganti: `text-xs` untuk semua 9/10/11px | Sesuai aturan type scale; tanpa token baru. |
| 2 | Tidak menyentuh heading/ikon di `components/` dan `patterns/` | Itu CR-039 (risiko visual lebih tinggi, perlu screenshot per halaman). |
| 3 | Tidak menyentuh `(clinic)` dan `scenarios/` | Di luar `app/(docs)`; scope showcase docs saja. |

## Design System Checks

- [x] Tidak ada hex/RGB baru; tidak ada token baru.
- [x] Kontras: `text-xs` memakai `text-foreground`/warna yang sudah ada; tidak ada perubahan warna, hanya ukuran.
- [x] Layout: diverifikasi lewat screenshot dark dan light (Atelier/Pulse) untuk halaman sampel.
- [x] Guard dan dokumen aturan konsisten.

## Eksekusi

Branch: `visual-polish`
Commit: _belum dibuat_ (menunggu verifikasi visual atau keputusan user)
