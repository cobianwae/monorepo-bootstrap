# 004-04 — Locale + agenda + state matrix + showcase final + a11y

Status: done
PRD: `docs/prd/004-calendar-scheduler.md`
Design: `docs/design/calendar-scheduler.md` (approved, gate 2)
FR: `FR-008`, `FR-009`, `FR-010`, `FR-014` (could), `FR-015`
Screens: `S-005.04`, `S-005.04.04`
Goal: Menutup PRD — locale en/id, agenda kronologis, state matrix penuh, dan scenario showcase yang lolos smoke + audit a11y light & dark sebagai bukti penerimaan.

## Acceptance Criteria

### AC-01 — State matrix lengkap teramati

**Given** kontrol demo pemicu loading, empty (periode tanpa event), dan error + retry
**When** tiap state dipicu di scenario
**Then** loading → skeleton grid sesuai view (`aria-busy="true"`, navigasi disabled sementara); empty → `empty-state` "Tidak ada event di periode ini" + CTA konsumen (`role="status"`); error → `alert` + "Coba lagi" memanggil `onRetry` (`role="alert"`, teks bukan warna); success → grid aktif — semua teramati light & dark (FR-008, S-005.04)

### AC-02 — Keyboard + screen reader lolos audit

**Given** grid month/week/day + toolbar + M-006
**When** diaudit keyboard-only dan screen reader
**Then** semua fungsi tercapai tanpa mouse (navigasi periode, ganti view, pindah hari/slot panah, pilih slot/event Enter); grid `role="grid"` + `gridcell` + event tombol bernama; switcher `radiogroup`; perubahan periode/view diumumkan live region; fokus ring `primary` 2px terlihat light & dark; `prefers-reduced-motion` dihormati (FR-009, S-005.04)

### AC-03 — Locale en vs id berbeda benar

**Given** prop `locale` + `weekStartsOn`
**When** scenario diganti en ↔ id
**Then** nama hari/bulan dan awal pekan mengikuti locale yang diberikan (terverifikasi test + teramati di showcase) (FR-010, S-005.04)

### AC-04 — Agenda kronologis periode aktif (could)

**Given** view agenda aktif
**When** periode memiliki event
**Then** tampil list kronologis grup per hari (waktu, dot kategori, judul, lokasi); baris sebagai tombol memanggil `onSelectEvent` yang sama dengan blok grid; empty periode memakai matrix AC-01 (FR-014, S-005.04.04)

### AC-05 — Scenario showcase final + smoke

**Given** halaman `/patterns/calendar` dengan data realistis (konferensi 3 hari, 2 bentrok, all-day, agenda) + panel demo (state, locale, jam kerja 09–17/30, dataset, editable)
**When** dibuka light & dark dan `pnpm -C apps/showcase build` dijalankan
**Then** ketiga view + agenda teramati, semua kontrol demo berfungsi, catatan a11y ada di halaman, handler mock tanpa ubah kode komponen, dan smoke build lolos (FR-015, S-005.04–S-005.04.04)

## Tasks

- [x] `locale` (date-fns) + `weekStartsOn` + label periode per locale
- [x] View agenda: filter periode → urut `start` → grup per hari (baris tombol → `onSelectEvent`)
- [x] State matrix: `loading` skeleton per view, empty `empty-state`, `error` + `onRetry` (`role`/`aria` sesuai wireframe §4)
- [x] Showcase final: dataset realistis + panel demo lengkap + legenda kategori + catatan a11y; acuan konsumen `S-022` dicatat
- [x] Audit a11y + kontras kategori light/dark + `prefers-reduced-motion`
- [x] Update `docs/BACKLOG.md` + `docs/STATUS.md` + append `docs/STATUS-LOG.md`
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test` → `pnpm -C apps/showcase build`

## Dependencies

- Story/CR lain: `004-01`, `004-02`, `004-03` (integrasi akhir seluruh lapisan)
- Package: compose `base/skeleton`, `feedback/empty-state`, `feedback/alert`, `form/select` existing; tanpa dependency baru

## Notes

- Risiko: audit kontras kategori di atas permukaan grid gagal di satu mode — mitigasi: verifikasi tiap pasangan saat implementasi, sesuaikan pemetaan token sebelum merge.
- Keputusan: agenda adalah view presentasional keempat dalam komponen yang sama (bukan rute terpisah); form booking tetap milik konsumen.
