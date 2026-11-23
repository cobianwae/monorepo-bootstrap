# CR-063 — Konsistensi peran warna dan hierarki

**Status:** done
**Sumber:** audit
**Ref:** CR-054 W01–W03/W05–W07; `docs/reviews/cr-054-code-audit.md:135`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| W01–03 | minor | `packages/ui/src/components/base/card.tsx:14`; `apps/showcase/src/app/(docs)/page.tsx:536`; daftar laporan kode | Primary dekoratif/selected, heading section manual dan segmented kustom. | Gunakan peran highlight, SectionHeading dan SegmentedControl dengan kontras benar. |
| W05–07 | minor | `apps/showcase/src/app/(landing)/landing/page.tsx`; `apps/showcase/src/app/(landing)/scratch/page.tsx`; lokasi rinci laporan kode | Palette literal, specimen arbitrary dan highlight sebagai CTA. | Ikuti token/scale; primary untuk aksi. |

## Perubahan yang Diusulkan

- Hanya lokasi W01–03/W05–07; judul kartu manual bukan otomatis pelanggaran.
- Jangan membatalkan deviasi PageHeader/weight yang telah diputuskan. Perubahan Card/API publik perlu konfirmasi.
- Teks kecil hasil perubahan wajib lolos CR-055, bukan diganti ke highlight secara membabi buta.

## Tasks (jalur small-fix)

- [ ] Validasi peran setiap instance, termasuk variant komponen yang menyuntikkan kelas.
- [ ] Implementasi targeted, token light/dark, hierarchy/selected/focus tetap jelas.
- [ ] Perluas guard sesuai scope dan screenshot art direction; verifikasi sesuai konvensi.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Scratch nonproduksi tetap dicatat terpisah | Temuan kosmetik tidak dinaikkan menjadi defect fungsional. |

## Design System Checks

- [x] Token/kontras, Radix/a11y, API/export dan state konsisten; showcase diperbarui.
- [x] Typecheck/lint/test diverifikasi; baseline dicatat.

## Eksekusi

Branch: `cr-063-visual-consistency`
Commit: `fix: align showcase visual roles [CR-063]`

- [x] Disetujui user (2026-11-23).
- [x] Branch dibuat; implementasi dan verifikasi.
- [x] BACKLOG/STATUS/STATUS-LOG diperbarui; `check-status-log` hijau.
