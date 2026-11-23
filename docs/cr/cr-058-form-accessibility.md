# CR-058 — Label, error dan empty value form

**Status:** review
**Sumber:** audit
**Ref:** CR-054 C05/C09/C12/C13; `docs/reviews/cr-054-code-audit.md`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| C05 | major | `apps/showcase/src/app/(docs)/patterns/dynamic-form/page.tsx:271`–`:281`; daftar C05 pada laporan kode | Submit menampilkan error summary tetapi field tidak memiliki aria-invalid/error association. Sebagian field lain tidak bernama. | Hubungkan label, invalid state dan pesan ke field. |
| C09 | minor | `docs/reviews/cr-054-code-audit.md:117`–`:120` | Target password toggle terlalu kecil terhadap baseline proyek. | Perbesar hit area tanpa menutup input; bukan klaim WCAG 2.1 mewajibkan 44px universal. |
| C12 | major | `apps/showcase/src/app/(clinic)/clinic/patients/page.tsx:183`, `:197` | Filter tidak punya accessible name; blank awal tidak terbukti persisten setelah readiness. | Beri nama; uji cold-load sebelum menyimpulkan bug Select. |
| C13 | major | `packages/ui/src/components/form/tree-select.tsx:116`–`:119`; `combobox.tsx:108`–`:117` | Empty string menjadi satu selection sehingga placeholder hilang. | Normalisasi tanpa seleksi secara konsisten. |

## Perubahan yang Diusulkan

- Pertahankan kontrak single/multiple; normalisasi empty value dan perbaiki caller yang terdaftar.
- Selidiki rows-per-page kosong secara terpisah sebelum menganggapnya akar C13.

## Tasks (jalur small-fix)

- [x] Reproduksi seluruh lokasi C05 serta cold-load filter/rows-per-page.
- [x] Uji undefined/empty/valid/multiple, placeholder, clear dan pemilihan keyboard.
- [x] Uji submit invalid, relasi pesan, label dan fokus; test target password.
- [x] Verifikasi targeted lalu suite sesuai konvensi.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Tidak menggeneralisasi semua Select | C13 terkonfirmasi pada TreeSelect/Combobox; Select belum sama penyebabnya. |

## Design System Checks

- [x] Token/kontras, a11y, API/export dan state konsisten; showcase diperbarui.
- [x] Typecheck/lint/test diverifikasi; baseline dicatat.

## Eksekusi

Branch: `cr-058-form-accessibility`
Commit: `fix: connect form errors and normalize empty values [CR-058]`

- [x] Disetujui user (2026-11-23).
- [x] Branch dibuat; implementasi dan verifikasi.
- [x] BACKLOG/STATUS/STATUS-LOG diperbarui; `check-status-log` hijau.
