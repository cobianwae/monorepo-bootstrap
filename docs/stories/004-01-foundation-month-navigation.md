# 004-01 — Fondasi EventCalendar + month view + navigasi

Status: review
PRD: `docs/prd/004-calendar-scheduler.md`
Design: `docs/design/calendar-scheduler.md` (approved, gate 2)
FR: `FR-001` (month), `FR-002`, `FR-003` (dasar), `FR-007`
Screens: `S-005.04`, `S-005.04.01`
Goal: Menyediakan kerangka `EventCalendar` yang bisa dipasang konsumen (data deklaratif + navigasi + switcher view) dengan month view berfungsi penuh sebagai bukti vertikal pertama.

## Acceptance Criteria

### AC-01 — Data deklaratif dirender di month view

**Given** `events: CalendarEvent[]` tiruan dipasang di scenario (tanpa mengubah kode komponen)
**When** halaman `/patterns/calendar` dibuka dengan view month
**Then** tiap event tampil sebagai chip (jam + judul) di sel hari yang benar; judul, rentang waktu, dan warna kategori token teramati; tanpa fetch internal komponen (FR-001, FR-003, FR-007, S-005.04.01)

### AC-02 — Navigasi periode konsisten di semua view

**Given** toolbar prev / hari ini / next dan label periode
**When** user menekan sebelumnya / berikutnya / hari ini
**Then** periode bergeser sesuai view aktif dan tanggal aktif konsisten; `onDateChange` terpanggil dengan tanggal baru; controlled (`currentDate` + `onDateChange`) dan uncontrolled (`defaultDate`) sama-sama bekerja (FR-002, S-005.04)

### AC-03 — Ganti view tanpa kehilangan konteks tanggal

**Given** tanggal konteks aktif (mis. 21 Nov 2026) di month view
**When** user mengganti view via switcher (segmented-control `radiogroup`)
**Then** tanggal konteks dipertahankan (week menampilkan pekan berisi tanggal itu); `onViewChange` terpanggil; `defaultView` + controlled `view` sama-sama bekerja (FR-001, S-005.04)

### AC-04 — Kategori warna token lolos kontras

**Given** event dengan tiap `category` (`primary/success/warning/info/destructive`)
**When** dirender di light dan dark
**Then** chip memakai token semantik (tanpa hex literal) dan pasangan foreground/background lolos audit kontras; legenda toolbar memakai token yang sama (FR-003, S-005.04.01)

## Tasks

- [x] Tipe publik + contract §2 (subset 004-01): `CalendarEvent`, `CalendarView`, `EventCalendarProps` (view/date controlled-uncontrolled, `onViewChange`/`onDateChange`, `locale` opsional passthrough)
- [x] Shell `EventCalendar`: toolbar (label periode + prev/today/next + switcher view) + grid month di atas `Calendar`/DayPicker existing + sel custom (≤3 chip + overflow "+n" popover)
- [x] Demo scenario `/patterns/calendar` view month: data tiruan realistis, kontrol demo ganti view + navigasi (di panel demo, bukan komponen)
- [x] Test co-located: render chip di sel benar, navigasi memanggil `onDateChange`, ganti view mempertahankan konteks + memanggil `onViewChange`, kategori memakai token
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`

## Dependencies

- Story/CR lain: —
- Package: compose `form/Calendar` (DayPicker v10 existing), `base/badge`, `overlay/popover`, `base/button`; tanpa dependency baru

## Notes

- Risiko: sel custom DayPicker menabrak styling existing — mitigasi: sel event sebagai lapisan di atas `day_button`, token semantik saja.
- Keputusan: fetch, form booking, dan state loading/error milik story 004-04; story ini hanya success berisi + empty alami (sel tanpa event).
- Hasil: `packages/ui/src/components/data-display/event-calendar.tsx` + test co-located 9/9 hijau; week view sebagai shell 7 kolom; day/agenda sebagai period shell minimal (full layout di 004-02/004-04). Verifikasi: lint bersih; typecheck/test/build/showcase hanya gagal pada baseline lama `@xyflow/react` (org-chart-editor) yang sudah ada sebelum story ini; semua 350 test yang dikumpulkan hijau termasuk 9 test baru.
