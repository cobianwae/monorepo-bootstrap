# 004 — Calendar & Scheduler

Status: approved
Owner: —
Tanggal: 2026-11-20
Sumber: roadmap RM-08 (`docs/discussions/component-roadmap.md`)

## Problem

Booking, agenda, dan penjadwalan adalah kebutuhan berfrekuensi tinggi (app klinik,
CRM activity, booking internal). `date-picker` existing hanya **memilih tanggal** —
tidak ada komponen untuk **menampilkan waktu**: event bulanan/mingguan/harian, slot
booking, dan agenda hari ini. Konsumen memakai library eksternal langsung di app,
di luar kontrol token dan a11y design system.

Bukti/konsekuensi:

- Belum ada komponen event/scheduler di `packages/ui`; `Calendar` existing (wrapper
  `react-day-picker` v10) hanya grid pemilih tanggal, tanpa event. Pattern `S-005.04`
  menampilkan konsep tanpa komponen reusable di belakangnya.
- Setiap kebutuhan agenda memaksa konsumen memilih dan men-styling library sendiri
  (fullcalendar, dsb.) → theme parity light/dark dan kontras tidak terjamin.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Komponen calendar reusable untuk tampilan event | Screen konsumen memakai komponen langsung | ≥ 1 screen konsumen (mis. S-022 Appointments) |
| Tiga tingkat view tercakup | Bulan, minggu, hari teramati di showcase | 3 view lolos smoke + test |
| Aksesibilitas setara standar DS | Navigasi keyboard antar hari/event + ARIA | Lolos audit WCAG 2.1 AA, light & dark |
| Dependency jelas | `react-day-picker` v10 sudah dipakai `date-picker`; scheduler dibangun di atas primitif existing | Tidak ada entri dependency baru di `packages/ui/package.json` (kecuali disetujui terpisah) |

## Non-goals

- Multi-calendar resource view (kolom per orang/ruang) ala Google Calendar lanjutan.
- Recurrence rule penuh (RRULE engine) — event berulang hanya derajat dasar bila
  konsumen menyediakan instansnya.
- Konversi timezone lintas region (mengikuti locale browser/konsumen).
- Integrasi provider kalender eksternal (Google/Outlook sync).
- Mengganti `date-picker`/`time-picker` existing — keduanya tetap untuk memilih nilai
  di form; calendar ini untuk menampilkan dan berinteraksi dengan event.

## User & Use Case

Persona (ringkas):

1. **Developer konsumen DS** — memasang agenda appointment/booking; butuh komponen
   dengan view bulan/minggu/hari dan kontrak event jelas.
2. **Front-office / end-user** — melihat jadwal minggu ini, mencari slot kosong,
   memesan slot untuk pasien/klien.
3. **Pengguna umum** — mengecek agenda hari ini dan detail satu event.

JTBD:

- "When saya mengatur jadwal mingguan, I want melihat event dalam konteks minggu,
  so I can menemukan slot kosong dengan cepat."
- "When saya memesan slot, I want klik slot kosong dan mengisi detailnya,
  so I can booking tanpa keluar dari kalender."

Skenario utama:

1. View bulan menampilkan event multi-hari (mis. konferensi 3 hari) dengan badge
   lanjutan; klik hari memindah fokus ke view hari.
2. View minggu: slot kosong diklik → callback onSelectSlot untuk form booking.
3. Event panjang di pekan yang sama tampil utuh; konflik jam tampil bertumpuk rapi.
4. Data event gagal dimuat → state error dengan retry; hari tanpa event → empty state.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Komponen calendar menampilkan event dalam tiga view: bulan, minggu, hari; view dapat diganti dan dipilih konsumen sebagai default. | must | Ketiga view teramati di showcase; pergantian view tanpa kehilangan konteks tanggal. |
| FR-002 | Navigasi antar periode (sebelumnya/berikutnya/hari ini) tersedia untuk semua view. | must | Tombol navigasi memindah periode; tanggal aktif konsisten dengan view. |
| FR-003 | Event tampil dengan judul, rentang waktu, dan warna kategori (token); event multi-hari tampil berlanjut antar hari. | must | Event 3 hari ter-render di 3 sel berurutan; warna memakai token dan lolos kontras light & dark. |
| FR-004 | Event yang berbenturan dalam satu slot tampil bertumpuk dengan indikasi jumlah, tetap dapat diakses keyboard. | must | Dua event sejam tampil bertumpuk; keduanya terjangkau via keyboard dan pop-over detail. |
| FR-005 | Klik event memanggil onSelectEvent dengan data event; aksi sekunder (edit/hapus) diserahkan konsumen via callback/render prop. | must | onSelectEvent terpanggil dengan payload event (terverifikasi test). |
| FR-006 | Klik slot kosong memanggil onSelectSlot (rentang waktu terpilih) untuk kebutuhan booking. | must | Klik sel/slot kosong menghasilkan rentang awal–akhir yang benar (test). |
| FR-007 | Data event deklaratif dari konsumen (array event + handler); komponen tidak memanggil API sendiri. | must | Story demo memasang data tiruan tanpa mengubah kode komponen. |
| FR-008 | State matrix: loading (skeleton grid), empty (periode tanpa event), error (gagal memuat + retry). | must | Tiga state teramati di scenario showcase. |
| FR-009 | Navigasi keyboard antar hari/event (panah) dan operability screen reader; fokus terlihat jelas pada light & dark. | must | Audit a11y lolos; sel dan event terjangkau tanpa mouse. |
| FR-010 | Internasionalisasi dasar: nama hari/bulan dan awal pekan mengikuti locale yang diberikan. | should | Locale en dan id menampilkan hasil berbeda yang benar. |
| FR-011 | Event all-day tampil di area khusus atas grid. | should | Event all-day terpisah dari grid jam dan tetap bisa dipilih. |
| FR-012 | Jam kerja/kolom jam dapat dikonfigurasi (mulai–akhir, interval slot). | should | Konfigurasi 09.00–17.00 per 30 menit mengubah grid sesuai (test). |
| FR-013 | Drag-and-drop memindah event antar slot (basis `@dnd-kit/*` yang sudah ada). | could | Drag event ke slot lain memanggil onEventDrop; operasi setara tersedia via menu untuk aksesibilitas. |
| FR-014 | View agenda (list) sebagai representasi alternatif yang ringan. | could | View agenda menampilkan event kronologis periode aktif. |
| FR-015 | Showcase scenario calendar dengan state lengkap (loading/empty/error/berisi) dalam light & dark. | must | Route scenario tersedia dan lolos smoke build. |

## Design Refs

- Screen: upgrade `S-005.04` Calendar (`/patterns/calendar`) — sudah implemented,
  komponen reusable menjadi basis barunya; demo komponen di `S-004.03` Forms bila
  relevan.
- Komponen terkait: `form/date-picker.tsx`, `form/time-picker.tsx` (prinsip pemilihan
  tanggal/jam), `base/skeleton.tsx`, `feedback/empty-state.tsx`, `base/badge.tsx`,
  `overlay/popover.tsx` (detail event), `navigation/pagination.tsx` (referensi pola
  navigasi).
- Dokumen design: `docs/design/calendar-scheduler.md` dibuat saat gate 2 (anatomi
  grid, state matrix, flow booking, wireframe).
- Analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (tabel §4),
  roadmap RM-08.

## Constraints & Dependencies

- Teknis: grid kalender dan layout event adalah bagian terberat; grid bulan memakai
  `Calendar`/`date-picker` existing, view minggu/hari dibangun di atas `date-fns`
  (sudah ada) dan primitif DS.
- Dependency package: **tidak ada dependency baru** — `react-day-picker` v10 sudah
  menjadi dependency `packages/ui` lewat `form/date-picker.tsx`. Bila evaluasi gate 2
  menyimpulkan library tambahan diperlukan, approval terpisah tetap wajib.
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA, light/dark parity, test
  Vitest + Testing Library co-located, alur gate sesuai AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Compose dengan `react-day-picker` (atau setara) vs build mandiri di atas primitif existing? Dependency butuh approval user di gate 1 ini. | answered — `react-day-picker` v10 sudah dependency `packages/ui`; tidak ada dependency baru |
| 2 | Cakupan v1: apakah tiga view (bulan/minggu/hari) sekaligus, atau bertahap bulan → minggu → hari per story? | answered — ketiga view masuk v1, dipecah bertahap bulan → minggu → hari per story |
| 3 | Perilaku event berulang (seri) di v1: render instans saja vs dukungan edit seri? | answered — render instans saja; edit seri non-goal |
| 4 | Posisi di roadmap: RM-08 bisa dieksekusi antar wave — diprioritaskan kapan relatif terhadap RM-09? | answered — setelah RM-09, bersama RM-10/RM-11 |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-20 | Draft awal dari roadmap RM-08 |
| 2026-11-20 | **Approved (gate 1)** — OQ#1–#4 dijawab; `react-day-picker` tercatat sebagai dependency existing, bukan dependency baru |
