# CR-012 — Calendar polish tema & docs showcase

**Status:** draft
**Sumber:** audit read-only `ui-ux-auditor` scope 004 (2026-11-21)
**Ref:** `docs/prd/004-calendar-scheduler.md`, `docs/design/calendar-scheduler.md`, `docs/stories/004-01-foundation-month-navigation.md`, `docs/stories/004-02-week-day-slot-allday.md`, `docs/stories/004-03-multiday-overlap-detail-dnd.md`, `docs/stories/004-04-locale-agenda-states-showcase.md`

Konteks pertanyaan user: "004 ini gak sesuai gak sih ama tema? terus secara tampilan penjelasan di docs jga flat gask sih?"

Jawaban audit: implementasi 004 **patuh tema/token** (nol hardcode warna, parity light/dark via CSS variable). Kesan "tidak sesuai tema" berasal dari blok week/day yang pastel (`bg-*/10` + teks 10px). Penjelasan markdown (PRD/design/wireframe) hierarkinya cukup; yang flat adalah **kartu showcase** (`Pattern notes` + `Catatan aksesibilitas`) dan **panel demo** satu Card raksasa.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | blocker | `packages/ui/src/components/data-display/event-calendar.tsx:1328-1331` | Agenda view kosong hanya render `<p>` polos "Tidak ada event pada periode ini" — tanpa `EmptyState`, tanpa `role="status"`, tanpa CTA. Month/week empty memakai `EmptyState` + `actionLabel="Buat event"` (:1367-1372). Melanggar `ux-patterns` dan wireframe §4. | Pakai `<EmptyState role="status" title="Tidak ada event di periode ini" actionLabel="Buat event">` yang sama, atau ekstrak `CalendarEmpty` dipakai kedua cabang. |
| 2 | blocker | `packages/ui/src/components/data-display/event-calendar.tsx:899` | Tinggi minimum blok event time-grid `Math.max(18, …)` = 18px untuk `<button>` interaktif — di bawah minimum WCAG 2.2 AA 24×24 dan jauh dari target 44px repo. | Naikkan ke `Math.max(24, …)`; pastikan `slotHeight` (MIN_SLOT_HEIGHT = 24, :119/:731) tidak menghasilkan target < 24px. |
| 3 | major | `packages/ui/src/components/data-display/event-calendar.tsx:1302-1314` | Loading generik (1 Skeleton lingkaran + 1 baris) untuk semua view, padahal AC 004-04 + wireframe §4 mensyaratkan skeleton grid sesuai view (bulan 7×6, week/day kolom jam, agenda baris). `aria-busy` sudah benar. | Render skeleton per `activeView`, atau koreksi AC/story bila disengaja. |
| 4 | major | `packages/ui/src/components/data-display/event-calendar.tsx:135-141,891,1354` | Teks 9–10px `text-muted-foreground` di atas tint `bg-*/10` (BLOCK_CLASSES, badge konflik :891, pill agenda :1354). Klaim "audit kontras light/dark" di 004-04 tanpa angka. Lolos 4.5:1 belum terbukti. | Jalankan `checkCompliance` dari `@ds/tokens` untuk pasangan (muted-foreground × primary/10, success/10, warning/10, info/10, destructive/10) light & dark, lampirkan angka. |
| 5 | minor | `packages/ui/src/components/data-display/event-calendar.tsx:135-141` vs `badge.tsx:17,19,21` | Inkonsistensi kategori: month chips + legenda solid `Badge` (pop), blok week/day `border-*/50 bg-*/10` pucat — sumber kesan flat/pastel. Bukan pelanggaran token. | Samakan bahasa visual: pertahankan `border-l-4` atau pakai varian `*-outline` Badge existing. |
| 6 | minor | `apps/showcase/src/app/(docs)/patterns/calendar/page.tsx:148-275` | Panel demo = satu `<CardContent flex flex-wrap>` raksasa 7 grup kontrol tanpa `fieldset`/subheading (view, working hours, locale, interval, 3 switch, status, hint). Fungsional tapi sulit di-scan. | Pecah jadi 2–3 grup berlabel (`Tampilan`, `Data & state`, `Status`) atau tiru pola toolbar org-chart. |
| 7 | minor | `apps/showcase/src/app/(docs)/patterns/calendar/page.tsx:297-362` | Dua kartu penjelasan (`Pattern notes` 12 bullet, `Catatan aksesibilitas` 6 bullet) = dinding bullet `text-sm text-muted-foreground` tanpa tabel state matrix / contoh visual. | Ubah `Pattern notes` jadi tabel ringkas + 3–4 bullet kunci; tambah baris state matrix (switch demo → tampilan). |
| 8 | minor | `packages/ui/src/components/data-display/event-calendar.tsx:1251,509,529,1431` + `apps/showcase/.../calendar/page.tsx:145` | Microcopy EN↔ID campur: `aria-label` Inggris ("Previous period", "Move day", "Event detail") + `PageHeader` Inggris di tengah UI demo Indonesia. | Selaraskan satu bahasa per locale demo (minimal dalam satu halaman). |

## Perubahan yang Diusulkan

- `packages/ui/src/components/data-display/event-calendar.tsx`: agenda empty → `EmptyState` + CTA; `Math.max(18,…)` → `Math.max(24,…)`; skeleton per view; penguatan visual blok week/day (`border-l-4` / Badge outline).
- `apps/showcase/src/app/(docs)/patterns/calendar/page.tsx`: grouping panel demo (`fieldset`/subheading); `Pattern notes` → tabel + bullet kunci + state matrix.
- Microcopy: selaraskan `aria-label` dan `PageHeader` per locale demo.
- Audit kontras: lampirkan hasil `checkCompliance` kategori × tint light & dark.
- Tanpa dependency baru; tanpa perubahan API publik (prop opsional bila perlu); tanpa ubah token.

## Tasks (jalur small-fix)

- [ ] Agenda empty → `EmptyState` + CTA (`event-calendar.tsx:1328-1331`).
- [ ] Min-height blok event 18px → 24px (`event-calendar.tsx:899`).
- [ ] Skeleton per view atau koreksi AC 004-04 (`event-calendar.tsx:1302-1314`).
- [ ] Audit kontras `checkCompliance` kategori × tint light & dark, lampirkan angka.
- [ ] Penguatan visual blok week/day + grouping demo + tabel `Pattern notes` + selarasan microcopy.
- [ ] Verifikasi: `pnpm --filter @ds/ui lint`, `pnpm --filter @ds/ui test`, `pnpm test:tokens`, `pnpm -C apps/showcase build` (auditor read-only tidak menjalankannya).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | — | Menunggu `approved` user (gate CR). |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-012-calendar-theme-docs-polish`
Commit: `fix: polish calendar empty-state touch-target showcase [CR-012]`

- [ ] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
