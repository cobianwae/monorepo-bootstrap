# CR-057 — Semantik kontrol dan tabel virtual

**Status:** draft
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

- [ ] Rekonsiliasi daftar lokasi dalam laporan kode; reproduksi dengan keyboard.
- [ ] Implementasikan role/state/aktivasi/fokus tanpa duplikasi kontrol.
- [ ] Uji Enter/Space/Tab, selected state, relasi header dan total/index virtual; screen reader best-effort.
- [ ] Regression tests dan verifikasi sesuai konvensi.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Tidak menambah role grid saja | Role tanpa model keyboard tidak menyelesaikan aksesibilitas. |

## Design System Checks

- [ ] Token/kontras, Radix/a11y, API/export dan state konsisten; showcase diperbarui.
- [ ] Typecheck/lint/test diverifikasi; baseline dicatat.

## Eksekusi

Branch: `cr-057-control-semantics`
Commit: `fix: expose control and table semantics [CR-057]`

- [ ] Disetujui user; branch dibuat; implementasi dan verifikasi.
- [ ] BACKLOG/STATUS/STATUS-LOG diperbarui; `check-status-log` hijau.
