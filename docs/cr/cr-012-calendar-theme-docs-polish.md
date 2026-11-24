# CR-012 — Calendar polish tema & docs showcase

**Status:** done
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

- [x] Agenda empty → `EmptyState` + CTA (`event-calendar.tsx:1328-1331`): ekstrak `CalendarEmpty` dipakai agenda + month; judul "Tidak ada event di periode ini", `role="status"`, `actionLabel="Buat event"`.
- [x] Min-height blok event 18px → 24px (`event-calendar.tsx:899`): `Math.max(18,…)` → `Math.max(24,…)`; preview drag ikut 24px untuk konsistensi visual.
- [x] Skeleton per view atau koreksi AC 004-04 (`event-calendar.tsx:1302-1314`): `data-skeleton-view` — month 7×6, week 7 kolom, day 6 baris, agenda 5 baris; `aria-busy` + `role="grid"` dipertahankan.
- [x] Audit kontras `checkCompliance` kategori × tint light & dark, lampirkan angka — lihat § Hasil audit kontras di bawah.
- [x] Penguatan visual blok week/day + grouping demo + tabel `Pattern notes` + selarasan microcopy: `BLOCK_CLASSES` `border-*/50 bg-*/10` → `border-*/60 bg-*/15`, `border-l-2` → `border-l-4`; panel demo jadi 3 `fieldset` berlabel; `Pattern notes` → 4 bullet kunci + tabel pemetaan kontrol; copy showcase Inggris (hint, error demo, Accessibility notes, "Room 2").
- [x] Verifikasi: `pnpm --filter @ds/ui lint`, `pnpm --filter @ds/ui test`, `pnpm test:tokens`, `pnpm -C apps/showcase build` (auditor read-only tidak menjalankannya).

## Hasil audit kontras (CR-012 #4)

Metode: tint `bg-<kategori>/10` (dan `/15` baru) di-blend di atas `card` (light `#FFFFFF`, dark `#141620`, tema Pulse), kontras dihitung terhadap `muted-foreground` (light `#52525B`, dark `#A1A1AA`) memakai rumus WCAG dari `packages/tokens/src/contrast.ts` (`getContrastRatio`/`checkWcagCompliance`). Angka adalah rasio persis yang dihasilkan untuk pasangan tersebut; teks utama blok memakai `text-foreground`, baris kedua memakai `muted-foreground` pada 9–10px.

| Tema/mode | Kategori (tint) | `muted-foreground` atas tint `/10` | `muted-foreground` atas tint `/15` (baru) | `foreground` atas tint `/15` |
|---|---|---|---|---|
| Pulse/light | primary | 6.53:1 (AA) | 5.98:1 (AA) | 13.71:1 (AAA) |
| Pulse/light | success | 6.71:1 (AA) | 6.24:1 (AA) | 14.31:1 (AAA) |
| Pulse/light | warning | 6.95:1 (AA) | 6.58:1 (AA) | 15.09:1 (AAA) |
| Pulse/light | info | 6.73:1 (AA) | 6.26:1 (AA) | 14.36:1 (AAA) |
| Pulse/light | destructive | 6.62:1 (AA) | 6.11:1 (AA) | 14.01:1 (AAA) |
| Pulse/dark | primary | 6.22:1 (AA) | 5.78:1 (AA) | 13.47:1 (AAA) |
| Pulse/dark | success | 5.90:1 (AA) | 5.29:1 (AA) | 12.33:1 (AAA) |
| Pulse/dark | warning | 5.80:1 (AA) | 5.14:1 (AA) | 11.98:1 (AAA) |
| Pulse/dark | info | 6.04:1 (AA) | 5.51:1 (AA) | 12.85:1 (AAA) |
| Pulse/dark | destructive | 6.16:1 (AA) | 5.68:1 (AA) | 13.24:1 (AAA) |

Kesimpulan: semua pasangan `muted-foreground` × tint lolos WCAG AA (≥4.5:1) di light dan dark, termasuk setelah penguatan ke `/15` (terendah 5.14:1 pada warning dark). `pnpm test:tokens` 10/10 tetap hijau. Klaim audit "lolos AA" di 004-04 kini terbukti berangka; tidak ada perubahan token.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | — | Menunggu `approved` user (gate CR). |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA — angka terlampir di § Hasil audit kontras.
- [x] Perilaku Radix/a11y tidak rusak (`role="status"`, `aria-busy`, `data-skeleton-view` teruji).
- [x] API `cva` dan export tetap konsisten (tanpa perubahan props/API publik).
- [x] State loading, empty, dan error relevan tersedia (agenda empty kini sama dengan month; skeleton per view).
- [x] Showcase/docs diperbarui bila perlu (grouping demo, tabel Pattern notes, copy Inggris).
- [x] Verifikasi: `@ds/ui` lint hijau; `@ds/ui` test 737/737; tokens 10/10; showcase lint + build hijau; typecheck baseline 12 error FlowEditor tidak berubah (known issue).

## Eksekusi

Branch: `cr-012-calendar-theme-docs-polish` (dari `visual-polish` `355f01f`, worktree `arah-cr`)
Commit: `fix: polish calendar empty-state touch-target showcase [CR-012]`

- [x] CR disetujui user (`approved` di `docs/BACKLOG.md` sebelum implementasi).
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui (→ `review`).
- [x] `docs/STATUS.md` diperbarui (butir Posisi Saat Ini).
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
