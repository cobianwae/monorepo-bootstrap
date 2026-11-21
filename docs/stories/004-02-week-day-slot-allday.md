# 004-02 — Time grid week/day + all-day + jam kerja + slot booking

Status: review
PRD: `docs/prd/004-calendar-scheduler.md`
Design: `docs/design/calendar-scheduler.md` (approved, gate 2)
FR: `FR-001` (week/day), `FR-006`, `FR-011`, `FR-012`
Screens: `S-005.04.02`, `S-005.04.03`
Goal: Memberikan inti scheduler — grid waktu minggu/hari dengan strip all-day, jam kerja terkonfigurasi, dan klik slot kosong menghasilkan rentang booking yang benar.

## Acceptance Criteria

### AC-01 — Grid week/day ter-render dari menit

**Given** event dengan jam mulai–selesai spesifik
**When** view week atau day aktif
**Then** blok event terposisi absolut dari menit (top/height proporsional); kolom jam mengikuti `workingHours` + `slotIntervalMinutes`; di luar jam kerja diarsir `muted` tapi tetap terlihat (FR-001, FR-012, S-005.04.02, S-005.04.03)

### AC-02 — Konfigurasi jam kerja mengubah grid

**Given** `workingHours {start:'09:00', end:'17:00'}` + `slotIntervalMinutes: 30`
**When** dipasang di scenario
**Then** grid menampilkan 09.00–17.00 dengan slot 30 menit (terverifikasi test); default tanpa config adalah 08–18/30 (FR-012, S-005.04.02)

### AC-03 — Klik slot kosong menghasilkan rentang benar

**Given** grid week/day dengan slot kosong
**When** user mengklik (atau Enter saat slot fokus) sel kosong
**Then** `onSelectSlot({start, end, allDay})` terpanggil tepat satu kali dengan rentang awal–akhir sesuai interval slot; slot sebagai `gridcell` fokusable dengan `aria-label` rentang ("Senin 09:00–09:30") (FR-006, S-005.04.02, S-005.04.03)

### AC-04 — All-day tampil di strip terpisah

**Given** event `allDay` (atau durasi 24 jam penuh hari)
**When** view week atau day aktif
**Then** event tampil di strip "Sepanjang hari" di atas grid jam (bukan di kolom jam); tetap bisa dipilih via klik/keyboard dan membuka detail (M-006, story 004-03); tidak bercampur blok timed (FR-011, S-005.04.02)

## Tasks

- [x] Time grid week (7 kolom) + day (1 kolom): kolom jam, blok absolut per menit, slot kosong `gridcell` interaktif
- [x] Strip all-day terpisah + pemisah event 24 jam penuh hari
- [x] `workingHours` + `slotIntervalMinutes` (default 08–18/30) + arsir luar jam `muted`
- [x] `onSelectSlot` klik + keyboard (Enter/Space) dengan presisi interval
- [x] Demo scenario: toggle week/day, kontrol jam kerja + interval, dataset all-day; panel demo di luar komponen
- [x] Test co-located: posisi blok dari menit, grid mengikuti config, `onSelectSlot` payload benar (klik + keyboard), all-day terpisah
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`

## Dependencies

- Story/CR lain: `004-01` (shell, toolbar, view/date controlled, tipe dasar)
- Package: primitif DS + `date-fns` existing; tanpa dependency baru

## Notes

- Risiko: perhitungan menit vs DST/locale — mitigasi: memakai `date-fns` murni, zona mengikuti locale browser/konsumen (non-goal konversi timezone).
- Keputusan: detail event (M-006) dan konflik overlap milik 004-03; story ini blok single tanpa tumpang sebagai prasyarat.
- Hasil: `packages/ui/src/components/data-display/event-calendar.tsx` + 5 test time grid (14/14 hijau) — grid penuh 00:00–24:00 dengan arsir `muted` di luar `workingHours`, slot `gridcell` + klik/Enter/Space, `CalendarSlot`/`WorkingHours`/`onSelectSlot`/`onSelectEvent` publik, strip "All day" untuk `allDay` dan durasi ≥24 jam, blok absolut per menit (clip per hari). Showcase `/patterns/calendar` menambah toggle jam kerja 08–18/09–17, interval 30/60, dataset 24 jam, dan log slot/event terpilih. Verifikasi: `typecheck`, `lint`, `test` (393 test @ds/ui), `pnpm -C apps/showcase build` hijau; tanpa dependency/token baru.
