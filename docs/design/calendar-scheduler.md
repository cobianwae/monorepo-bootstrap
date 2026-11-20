# Spec Desain — Calendar & Scheduler

Status: approved (gate 2)
PRD: `docs/prd/004-calendar-scheduler.md` (approved, gate 1)
Layar: `S-005.04` Calendar (`/patterns/calendar`) + child `S-005.04.01–.04`, modal `M-006`
Flow: `docs/design/flows/calendar-scheduler.mmd` · Wireframe: `docs/design/wireframes/calendar-scheduler.md`
Tanggal: 2026-11-20

## 1. Keputusan Desain

| # | Keputusan | Alasan |
|---|---|---|
| D1 | Komponen baru `EventCalendar` di `packages/ui/src/components/data-display/event-calendar.tsx`, pattern composed kategori `data-display` (mengikuti presedent file-manager/org-chart); grid bulan memakai `Calendar`/DayPicker existing, view minggu/hari dibangun di atas `date-fns` + primitif DS; **tanpa dependency baru**. | Constraints PRD + OQ#1 (react-day-picker v10 existing); OQ#2 (3 view v1). |
| D2 | Data deklaratif penuh: konsumen memasok `events: CalendarEvent[]` + handler; komponen tidak fetch. Event = `{id, title, start: Date, end: Date, allDay?, category?, location?, description?}` + `renderEvent`/`onAction` untuk konten dan aksi sekunder. | FR-005, FR-007; demo memakai data tiruan tanpa ubah kode komponen. |
| D3 | Tiga view + agenda dalam satu komponen via `view: 'month' \| 'week' \| 'day' \| 'agenda'` (controlled/uncontrolled lewat `defaultView` + `onViewChange`); konteks tanggal dipertahankan lintas view (klik hari di bulan → day view hari itu; switch week↔day memakai hari aktif). | FR-001 (ganti view tanpa kehilangan konteks); skenario PRD §1. |
| D4 | Navigasi terpusat: `currentDate` controlled/uncontrolled (`defaultDate` + `onDateChange`); toolbar prev/today/next + label periode per view. Navigasi murni presentasi — fetch milik konsumen via `onDateChange`/`onViewChange`. | FR-002; konsisten pola controlled `tree-view`/`org-chart` (D4 003). |
| D5 | Multi-hari dipecah per hari kalender dengan penanda lanjutan `▸/◂` + teks (bukan warna saja); klik segmen mana pun mengirim payload event utuh ke `onSelectEvent`. | FR-003 + skenario konferensi 3 hari. |
| D6 | Konflik: algoritma interval-column — event tumpang satu slot dibagi kolom sama lebar + header "n bentrok"; tiap blok tetap tombol fokusable yang membuka M-006. | FR-004 (bertumpuk rapi + keyboard). |
| D7 | Slot kosong adalah `gridcell` interaktif: klik/Enter → `onSelectSlot({start, end, allDay})`; presisi dari `slotIntervalMinutes`; form booking milik konsumen. | FR-006; skenario booking PRD §2. |
| D8 | All-day strip terpisah di atas grid week/day (`allDay` event + event 24 jam); tetap bisa dipilih dan membuka M-006; tidak bercampur kolom jam. | FR-011 (should). |
| D9 | Jam kerja terkonfigurasi: `workingHours: {start, end}` + `slotIntervalMinutes` (default 08–18/30); di luar jam diarsir `muted` tapi tetap bisa diklik (konsumen memvalidasi). | FR-012 (should). |
| D10 | Locale via `locale: Locale` (date-fns) + `weekStartsOn`; nama hari/bulan dan awal pekan mengikuti locale; demo en vs id. | FR-010 (should). |
| D11 | DnD (could) disiapkan tanpa dependency baru di v1: `onEventDrop({id, start, end})` + `editable` gate; implementasi drag memakai Pointer Events internal; operasi setara via menu "Pindah…" (dialog pilih slot). Bila evaluasi implementasi butuh `@dnd-kit/*`, approval terpisah wajib. | FR-013 (could) + constraint tanpa dependency baru. |
| D12 | A11y: grid `role="grid"` + `gridcell` + event sebagai tombol bernama; toolbar switcher `radiogroup`; live region periode/view; fokus ring kontras light & dark; reduced-motion dihormati. Detail wireframe §5. | FR-009. |

## 2. API Publik (contract)

```ts
import type { Locale } from 'date-fns';

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';
export type EventCategory =
  | 'primary' | 'success' | 'warning' | 'info' | 'destructive';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  category?: EventCategory;   // warna token (FR-003)
  location?: string;
  description?: string;
}

export interface CalendarSlot {
  start: Date;
  end: Date;
  allDay: boolean;
}

export interface WorkingHours {
  start: string;              // 'HH:mm', mis. '09:00'
  end: string;                // 'HH:mm', mis. '17:00'
}

export interface EventCalendarProps {
  events: CalendarEvent[];                    // deklaratif (FR-007)
  view?: CalendarView;                        // controlled
  defaultView?: CalendarView;                 // default 'month'
  onViewChange?: (view: CalendarView) => void;
  currentDate?: Date;                         // controlled
  defaultDate?: Date;                         // default today
  onDateChange?: (date: Date) => void;        // navigasi (FR-002)
  locale?: Locale;                            // FR-010
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  workingHours?: WorkingHours;                // default 08:00–18:00 (FR-012)
  slotIntervalMinutes?: number;               // default 30 (FR-012)
  loading?: boolean;                          // FR-008
  error?: string | null;                      // FR-008
  onRetry?: () => void;                       // FR-008
  onSelectEvent?: (event: CalendarEvent) => void;  // FR-005
  onSelectSlot?: (slot: CalendarSlot) => void;     // FR-006
  onEventDrop?: (info: { id: string; start: Date; end: Date }) => void; // FR-013 could
  editable?: boolean;                         // gate drag + aksi sekunder
  renderEvent?: (event: CalendarEvent) => React.ReactNode;  // FR-005 konten custom
  onAction?: (action: 'edit' | 'delete', event: CalendarEvent) => void; // FR-005 aksi sekunder
  ariaLabel?: string;                         // default 'Event calendar'
  className?: string;
}
```

Aturan contract:

- Murni presentasi; fetch, validasi booking, dan form milik konsumen.
  `loading`/`error`/`onRetry` hanya visual — retry memanggil callback konsumen.
- Controlled penuh mengikuti pola `tree-view`: bila `view`/`currentDate` diberikan,
  wajib disertai `onViewChange`/`onDateChange`; bila absen, state internal dari
  `defaultView`/`defaultDate`.
- `renderEvent`/`onAction` tidak boleh keluar dari token; warna kategori tetap
  lewat `category` token semantik.
- `onEventDrop` hanya dipanggil bila `editable`; tanpa itu drag nonaktif dan menu
  pindah disembunyikan.

## 3. Algoritma Grid & Layout

1. Normalisasi: clamp `end >= start`; pisahkan `allDay` (atau durasi ≥ 24 jam
   penuh hari) ke strip atas; sisanya ke grid jam.
2. Month (S-005.04.01): rentang 6 pekan dari `startOfMonth` + `weekStartsOn`;
   tiap event multi-hari dipecah per hari; per sel tampil ≤ 3 chip + overflow
   "+n" → popover hari itu.
3. Week/Day (S-005.04.02/.03): kolom jam dari `workingHours` per
   `slotIntervalMinutes`; posisi blok `top = (start - dayStart)/menit`,
   `height = durasi/menit`; konflik = cluster interval tumpang → kolom sama lebar.
4. Agenda (S-005.04.04): filter periode aktif → urut `start` → grup per hari.
5. Memo terhadap `events + view + currentDate + workingHours + slotInterval +
   locale`; target interaksi < 100 ms untuk ±500 event tanpa virtualisasi
   (virtualisasi ditunda, evaluasi saat implementasi).

## 4. Varian (`cva`)

Komponen inti bukan `cva` baru yang besar; varian lewat props:

| Varian | Nilai | Perilaku |
|---|---|---|
| `view` | `month` (default) / `week` / `day` / `agenda` | FR-001, FR-014; label toolbar + layout §3 |
| `category` per event | token semantik | chip/blok/dot + legenda (FR-003) |
| Kontrol state | `loading` / `error` / data | matrix wireframe §4 (FR-008) |

## 5. A11y & Keyboard (ringkas)

Detail penuh ada di `docs/design/wireframes/calendar-scheduler.md` §5. Inti:

- Grid `role="grid"`, sel `gridcell` roving tabindex, event tombol bernama
  ("judul, hari jam–jam, n bentrok"); toolbar switcher `radiogroup` (FR-009).
- Bulan: `←→↑↓` pindah hari, `Enter` pilih hari → day view; `Tab` ke chip,
  `Enter` → `onSelectEvent` + M-006.
- Minggu/hari: `←→` ganti hari, `↑↓` ganti slot; `Enter` slot → `onSelectSlot`,
  `Enter` event → detail; konflik urutan Tab logis.
- Live region mengumumkan periode/view ("Kalender minggu, 17–23 November 2026");
  fokus ring `primary` 2px light & dark; `prefers-reduced-motion` mematikan
  animasi; pembeda tidak pernah warna saja.

## 6. Token & Tema

- Hanya token semantik: `background`/`card` (permukaan), `border` (grid),
  `foreground`/`muted-foreground` (teks/jam), `primary` (hari ini/fokus/selected),
  kategori `primary/success/warning/info/destructive`, garis sekarang `destructive`.
- Tanpa token baru di v1 — pasangan kontras existing tercakup audit
  `packages/tokens`; chip kategori di atas permukaan grid diverifikasi ulang
  light & dark saat implementasi (FR-003).

## 7. FR Coverage

| FR | Cakupan di spec |
|---|---|
| FR-001 | D3, §2 `view/defaultView/onViewChange`, §4; flow 1; wireframe §1–2 |
| FR-002 | D4, §2 `currentDate/onDateChange`; toolbar wireframe §1; flow 1 |
| FR-003 | D5, §2 `category`, §3 langkah 2–3; wireframe §2–3; §6 audit kontras |
| FR-004 | D6, §3 langkah 3; wireframe §2.2 + §3; keyboard §5 |
| FR-005 | D2, §2 `onSelectEvent/renderEvent/onAction`; M-006 wireframe §2.4; flow 3 |
| FR-006 | D7, §2 `onSelectSlot/WorkingHours/slotInterval`; flow 2; wireframe §2.2 |
| FR-007 | D2; scenario §8 data tiruan |
| FR-008 | §2 `loading/error/onRetry`; wireframe §4 matrix; flow 1; scenario §8 |
| FR-009 | D12 + §5; wireframe §5–7; live region + ring |
| FR-010 | D10, §2 `locale/weekStartsOn`; scenario en vs id |
| FR-011 | D8, §3 langkah 1; wireframe §1–2 strip all-day |
| FR-012 | D9, §2 `workingHours/slotIntervalMinutes`, §3 langkah 3; scenario 09–17/30 |
| FR-013 | D11, §2 `onEventDrop/editable`; flow 3; wireframe §3 |
| FR-014 | D3, §3 langkah 4, §4 `agenda`; wireframe §2.3 |
| FR-015 | §8 rencana scenario; smoke `pnpm -C apps/showcase build` |

## 8. Rencana Scenario Showcase (S-005.04)

- Halaman `/patterns/calendar` di-upgrade (status `in-design`): toolbar + switcher
  view + strip all-day + grid + M-006, dengan data contoh realistis: konferensi
  3 hari (multi-hari), 2 event bentrok sejam, event all-day, agenda kronologis.
- Kontrol demo (panel showcase, di luar komponen): pemicu loading/empty/error +
  retry, dataset konferensi/konflik, toggle locale en/id + awal pekan, jam kerja
  09–17/30 mnt, toggle agenda & editable/DnD.
- Semua state matrix wireframe §4 teramati; light & dark; catatan a11y di halaman;
  handler demo mock (log/toast) tanpa mengubah kode komponen.
- Konsumen acuan: `S-022` Appointments memakai `EventCalendar` langsung
  (goal metrik ≥ 1 screen konsumen) — di luar scope spec ini, dicatat sebagai
  penerimaan.
- Smoke: `pnpm -C apps/showcase build`.

## 9. Out of Scope (sesuai PRD non-goals)

- Multi-calendar resource view (kolom per orang/ruang).
- RRULE engine — hanya render instans yang diberikan konsumen.
- Konversi timezone lintas region (mengikuti locale browser/konsumen).
- Sync provider eksternal (Google/Outlook).
- Mengganti `date-picker`/`time-picker` — keduanya tetap untuk memilih nilai form.

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-20 | Draft gate 2: keputusan D1–D12, contract, algoritma grid, wireframe, flow, FR coverage |
