# CR-013 — Anchor popover detail event EventCalendar (M-006) kadang jatuh ke pojok kiri atas

**Status:** approved
**Sumber:** review (laporan user: popup detail event 004 kadang muncul di pojok kiri atas, bukan di atas/bawah event)
**Ref:** `docs/prd/004-calendar-scheduler.md`, `docs/design/calendar-scheduler.md`, `docs/stories/004-03-multiday-overlap-detail-dnd.md`, `packages/ui/src/components/data-display/event-calendar.tsx`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `packages/ui/src/components/data-display/event-calendar.tsx:1237-1240` + `1427-1429` | Detail M-006 memakai `PopoverAnchor virtualRef={virtualAnchor}` di mana `virtualAnchor = { current: anchorEl }` dibuat baru setiap `anchorEl` berubah dan boleh `null`. Bila anchor `null` (atau ref belum terukur saat popover mount), Radix/floating-ui tidak punya rect acuan sehingga konten jatuh ke posisi fallback `0,0` = pojok kiri atas. Tidak ada guard: popover dirender selama `selectedEvent` non-null meski `anchorEl` null. | Stabilkan anchor: satu `ref` objek yang di-update via effect, atau render `PopoverContent` hanya bila `anchorEl` non-null dan masih terhubung ke DOM (`anchorEl.isConnected`); fallback bila null: buka sebagai `Dialog`/`Sheet` tengah layar, jangan popover tanpa anchor. |
| 2 | major | `packages/ui/src/components/data-display/event-calendar.tsx:637-640` | Jalur overflow month (`DayOverflow`, tombol "+n"): `setOpen(false)` menutup popover overflow lalu langsung `onOpen(event, currentTarget)` dengan `currentTarget` yang hidup di dalam konten popover yang sedang di-unmount. Anchor yang detached mengembalikan rect nol → popover detail M-006 terposisi di pojok kiri atas. Ini menjelaskan sifat "kadang": hanya terjadi lewat jalur "+n". | Urutkan: tutup overflow dulu, buka detail setelah unmount selesai (mis. `requestAnimationFrame`/`setTimeout 0`), atau jangkar ke trigger "+n" yang tetap mounted; verifikasi rect anchor non-nol sebelum membuka popover. |
| 3 | major | `packages/ui/src/components/data-display/event-calendar.tsx:1339-1344` vs `docs/stories/004-03-multiday-overlap-detail-dnd.md:24-28` (AC-03) | AC-03 mensyaratkan klik/Enter pada event "di grid atau agenda" membuka detail M-006, tetapi tombol event di view agenda hanya memanggil `onSelectEvent?.(event)` tanpa `openDetail` — di agenda tidak ada popup sama sekali. Inkonsisten spec vs implementasi; bila konsumen membuka popup sendiri dari `onSelectEvent` tanpa anchor, hasilnya juga popover tanpa acuan (pojok kiri atas). | Samakan perilaku: panggil `openDetail(event, currentTarget)` di agenda (jadikan tombol anchor popover), atau ubah AC-03/design secara eksplisit bila agenda memang tanpa popup. |
| 4 | minor | `packages/ui/src/components/data-display/event-calendar.tsx:1429-1434` + `packages/ui/src/components/overlay/popover.tsx:11-28` | `PopoverContent` detail hanya menetapkan `align="start"` tanpa `side`, `collisionPadding`, `avoidCollisions`, atau `sticky`. Di tepi viewport (event paling atas/bawah — persis keluhan "diatasnya atau dibawahnya") perilaku flip/clip diserahkan ke default dan tidak terkontrak di spec. | Tetapkan props positioning eksplisit (`side="bottom"`, `avoidCollisions`, `collisionPadding`, `sticky`) sesuai kontrak baru di design; catat perilaku flip di wireframe M-006. |
| 5 | minor | `packages/ui/src/components/data-display/event-calendar.tsx:1054-1059` | `closeDetail` mengembalikan fokus ke `anchorRef.current` tanpa memeriksa `isConnected`. Pada jalur overflow (temuan #2) anchor sudah detached sehingga fokus hilang diam-diam — melemahkan klaim "Esc menutup dan fokus kembali ke event asal" (AC-03). | Guard `anchor.isConnected` sebelum `.focus()`; bila detached, fallback ke container grid terdekat atau heading periode. |
| 6 | minor | `docs/design/calendar-scheduler.md` §2.4/M-006 + `docs/design/wireframes/calendar-scheduler.md` §5 | Spec tidak mendefinisikan kontrak positioning popover (side default, flip saat mepet tepi, anchor fallback, perilaku keyboard). Perilaku kini implementation-defined sehingga regresi seperti ini lolos review gate 2/3. | Tambahkan satu paragraf kontrak positioning M-006 ke design (tanpa mengubah status `approved` — via CR ini sebagai addendum). |

## Perubahan yang Diusulkan

- `packages/ui/src/components/data-display/event-calendar.tsx`:
  - Stabilkan `virtualAnchor` (ref stabil + guard `anchorEl?.isConnected`), atau ganti ke pola `PopoverTrigger asChild` bila memungkinkan.
  - Perbaiki urutan tutup-overflow → buka-detail agar anchor selalu mounted dan terukur.
  - Samakan jalur agenda dengan grid (buka M-006 dengan anchor) atau dokumentasikan pengecualian.
  - Tambahkan props positioning eksplisit pada `PopoverContent` detail + guard focus-return.
- `docs/design/wireframes/calendar-scheduler.md` § M-006: catat kontrak positioning (side/flip/fallback) sebagai addendum via CR ini.
- Tanpa dependency baru; tanpa perubahan API publik (`EventCalendarProps` tetap).

## Tasks (jalur small-fix)

- [ ] Reproduksi: tulis test/skenario yang membuka detail via tombol "+n" overflow dan via keyboard; asertasikan anchor terhubung dan popover tidak berposisi `0,0`.
- [ ] Perbaiki anchor virtual (stabil + guard `isConnected` + fallback dialog bila null).
- [ ] Perbaiki urutan tutup-overflow → buka-detail.
- [ ] Samakan jalur agenda dengan AC-03 (atau ajukan pengecualian eksplisit di CR ini).
- [ ] Tambahkan props positioning eksplisit + guard focus-return.
- [ ] Addendum kontrak positioning M-006 di wireframe/design.
- [ ] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test` (+ `test:tokens` bila token tersentuh; showcase build bila showcase tersentuh).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Satu CR untuk cluster anchor/positioning M-006, bukan per temuan | Keenam temuan satu akar: popover tanpa anchor valid |
| 2 | Nomor CR-013 (CR-011 dan CR-012 sudah terpakai) | Hindari tabrakan ID |
| 3 | Agenda disamakan ke AC-03 sebagai default | AC-03 tertulis "grid atau agenda"; pengecualian butuh justifikasi |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-013-popover-anchor-event-calendar`
Commit: `fix: stabilkan anchor popover detail EventCalendar [CR-013]`

- [ ] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
