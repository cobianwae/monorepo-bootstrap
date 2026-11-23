# CR-057 — Semantik kontrol dan tabel virtual

**Status:** done
**Sumber:** audit
**Ref:** CR-054 C02–C04/C07/C10; `docs/reviews/cr-054-code-audit.md:66`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| C02–04 | major | `apps/showcase/src/app/(docs)/components/data-display/page.tsx:458`, `:486`–`:505`; `apps/showcase/src/app/(clinic)/clinic/registration/page.tsx:447`–`:511`; `apps/showcase/src/app/(crm)/crm/leads/page.tsx:466`–`:488`, `:934`–`:939` | Card/program/lead memakai div klik tanpa jalur keyboard setara; checkbox kondisi tidak bernama. | Gunakan kontrol semantik dengan aktivasi dan fokus yang sesuai. |
| C07 | major | `apps/showcase/src/app/(docs)/patterns/notifications/page.tsx:166`–`:194`; daftar lain pada laporan | Selected/read state tidak tersedia sebagai state aksesibel. | Ekspresikan state sesuai pola kontrol, bukan hanya warna. |
| C10 | major | `apps/showcase/src/app/(docs)/patterns/virtualized-list/page.tsx:217`–`:254` | Grid visual tidak memiliki relasi header/cell atau indeks total virtual. | Pilih tabel semantik atau grid dengan keyboard model lengkap. |

## Perubahan yang Diusulkan

- Perbaiki lokasi C02–04/C07/C10; jangan mengklaim semua DnD pointer-only.
- Koordinasikan tabel virtual dengan CR-061 agar semantik dan scroller memakai struktur yang sama. Perubahan API publik memerlukan konfirmasi.

## Tasks (jalur small-fix)

- [x] Rekonsiliasi daftar lokasi dalam laporan kode; reproduksi dengan keyboard.
- [x] Implementasikan role/state/aktivasi/fokus tanpa duplikasi kontrol.
- [x] Uji Enter/Space/Tab, selected state, relasi header dan total/index virtual; screen reader best-effort.
- [x] Regression tests dan verifikasi sesuai konvensi.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Tidak menambah role grid saja | Role tanpa model keyboard tidak menyelesaikan aksesibilitas. |
| 2 | C10 memakai pola ARIA table (`role="table"`, `rowgroup`, `row`, `columnheader`, `cell`, `aria-rowcount`/`aria-rowindex`) di atas div, bukan `<table>` native | Baris virtual diposisikan absolut; `<table>` native tidak cocok dengan jendela render. Tanpa roving focus, sehingga tidak mengklaim model grid. |
| 3 | Kartu selectable/interaktif dan lead memakai `role="button"` + `tabIndex={0}` + Enter/Space; kartu selectable memakai `aria-pressed` | Perubahan hanya di halaman showcase; API `Card` tidak diubah (props HTML diteruskan). |
| 4 | Checkbox komorbiditas dibungkus `<label>` dengan `onCheckedChange` | Nama checkbox berasal dari label; klik label dan checkbox tidak dobel-toggle. |
| 5 | Status read/unread di notifikasi sebagai teks `sr-only` (tanpa `aria-pressed`) | Label tombol tetap stabil; state tidak hanya warna. |

Catatan: `apps/showcase/src/app/(clinic)/clinic/registration/page.tsx` tidak bisa dimuat di Vitest karena alias `@/` tidak ada di `vitest.config.ts` (ada di `tsconfig.json`). Test registration dibatalkan; perubahan checkbox diverifikasi lewat typecheck/lint/build. Menambah alias ke konfigurasi test butuh konfirmasi.

## Design System Checks

- [x] Token/kontras, Radix/a11y, API/export dan state konsisten; showcase diperbarui. Tidak ada perubahan `packages/ui`.
- [x] Typecheck/lint/test diverifikasi; baseline dicatat: 12 error FlowEditor (`packages/ui/src/components/canvas/flow-editor.test.tsx`), showcase `tsc` 0 error, lint hijau, showcase test 90/90 (20 file), build showcase sukses.

## Eksekusi

Branch: `cr-057-control-semantics` (worktree `arah-story`, dari `visual-polish` `4cc9f3e`)
Commit: `fix: expose control and table semantics [CR-057]`

- [x] Disetujui user (2026-11-23).
- [x] Branch dibuat; implementasi dan verifikasi.
- [x] Test baru: `virtualized-list/page.test.tsx`, `notifications/page.test.tsx`, `components/data-display/page.test.tsx`.
- [x] Status `done` ditetapkan user (2026-11-23).
