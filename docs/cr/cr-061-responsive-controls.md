# CR-061 — Reflow kontrol dan workspace mobile

**Status:** approved
**Sumber:** audit
**Ref:** CR-054 C15/R01; `docs/reviews/cr-054-code-audit.md:298`–`:306`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| R01 | major | `apps/showcase/src/app/(docs)/patterns/virtualized-list/page.tsx:217`, `:227`, `:244` | Root 731/390, header bertumpuk dan terpisah dari scroller body. | Struktur scroll/header konsisten dengan CR-057. |
| C15 | major | `packages/ui/src/components/form/transfer-list.tsx:224`, `:352`; daftar lengkap pada laporan kode | Panel transfer, stepper registration/import, tabs consultation/CRM AI, header clinic, month calendar dan notifications memperlebar/menimpa kontrol mobile. | Adaptasi minimum width, tinggi, wrap atau scroller lokal yang terjangkau. |

## Perubahan yang Diusulkan

- Reproduksi dan isolasi tiap sumber overflow; jangan sekadar memasang overflow-hidden pada root.
- Scope caller: clinic header/appointments/registration/consultations, CRM AI, calendar, import-wizard, notifications, transfer-list, virtualized-list.
- Pecah eksekusi menjadi CR lanjutan bila isolasi menunjukkan perubahan kontrak/dependency atau scope tidak muat satu sesi; jangan refactor lintas package tanpa persetujuan.

## Tasks (jalur small-fix)

- [ ] Ukur child minimum kalender/notifikasi dan kontribusi empty toast viewport 448px.
- [ ] Perbaiki kontrol; semua label, tindakan dan fokus tetap dapat dijangkau.
- [ ] Uji 320/390/1440, zoom 200–400%, scroll lokal, keyboard, light/dark.
- [ ] Pastikan tabel pasien/board/canvas dengan scroller sah tidak diubah sebagai false positive.
- [ ] Regression tests dan verifikasi sesuai konvensi.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Bounds overflow bukan otomatis akar | Clipped orb dan tabel scroller bukan defect root yang sama. |

## Design System Checks

- [ ] Token/kontras, a11y, API/export dan state konsisten; showcase diperbarui.
- [ ] Typecheck/lint/test diverifikasi; baseline dicatat.

## Eksekusi

Branch: `cr-061-responsive-controls`
Commit: `fix: contain responsive showcase controls [CR-061]`

- [x] Disetujui user (2026-11-23).
- [ ] Branch dibuat; implementasi dan verifikasi.
- [ ] BACKLOG/STATUS/STATUS-LOG diperbarui; `check-status-log` hijau.
