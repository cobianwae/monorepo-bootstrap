# CR-053 — Audit visual components/ dan patterns/ (docs showcase)

**Status:** approved (disetujui user 2026-11-22; `done` belum ditetapkan)
**Sumber:** pertanyaan user 2026-11-22 "buat cr buat periksa patterns/ components/ atau ini udah ada cr nya?". Belum ada CR khusus; CR-039 hanya menghapus ikon heading.
**Ref:** `docs/design/visual-language.md` (Section Heading, Color Roles, Type Scale), `apps/showcase/src/test/visual-language-guard.test.ts`, CR-039, CR-041, CR-049, CR-052

## Tujuan

Memetakan sisa pelanggaran visual di 46 halaman `components/` dan `patterns/` (plus `guidelines/`, `getting-started/`, `contribution/`, dan root docs yang relevan), menentukan mana yang perlu diubah, lalu memutuskan perluasan guard. CR ini hanya audit. Perubahan kode dibuat di CR turunan setelah daftar ini disetujui.

## Temuan inventori (grep, 2026-11-22)

Angka mentah. Sebagian hasil adalah false positive (hover, ikon kotak, dan teks dalam string). Klasifikasi dilakukan di bagian Rencana.

| Pola | Jumlah baris | Catatan |
|---|---|---|
| `text-highlight` pada teks `text-xs`/`text-sm` | 14 | Kandidat pelanggaran aturan "teks kecil tidak `text-highlight`" (kontras, lihat visual-language.md) |
| `text-primary` / `bg-primary` / `border-primary` | 23 | Sebagian aksi dan identitas (sah), sebagian dekoratif |
| `<h2` manual | 31 baris di 16 file | 12 file sudah memakai `SectionHeading`; sisanya judul kartu atau sub-blok |
| `<h3` manual | 9 baris | Lihat daftar |
| `text-lg font-bold` / `text-2xl font-bold` manual | 4 baris | `onboarding:167`, `stepper:200`, `stepper:325` (angka harga, bukan heading), `auth:354` (input OTP) |
| `text-[Npx]` | 0 | Sudah bersih (CR-038, CR-045) |

### Daftar kandidat (file:line)

**A. `text-highlight` pada teks kecil**
- `components/forms/page.tsx:460` — teks `text-xs font-bold font-mono text-highlight`
- `components/data-display/page.tsx:684` — `text-xs font-semibold text-highlight`
- `patterns/master-detail/page.tsx:244` — `text-xs font-semibold text-highlight` ("You (Support)")
- `components/page.tsx:161`, `:181`, `page.tsx:565` — hover `group-hover:text-highlight` pada `text-xs` (kemungkinan sah sebagai state hover; perlu keputusan)
- `components/layout-navigation/page.tsx:1194`, `:1197`, `:1200` — tautan `text-sm hover:text-highlight` (perlu keputusan, bandingkan CR-049 yang membiarkan tautan hover)
- Bukan teks (ikon kotak `bg-highlight text-highlight-foreground`): `layout-navigation` `:242`, `:389`, `:451`, `:683`; `patterns/settings:820` — tidak termasuk pelanggaran teks, dikonfirmasi saat audit.

**B. Heading manual (bukan SectionHeading)**
- `components/page.tsx:132` — `text-xl font-bold font-display` (judul kartu/blok; perlu keputusan apakah ini heading section)
- `patterns/onboarding/page.tsx:167` — `h2 text-lg font-bold` (kandidat kuat ke `SectionHeading`/`h2` dengan kelas standar)
- `patterns/org-chart-studio/page.tsx:140` — `h2 text-lg font-semibold`
- `patterns/results/page.tsx:57`, `:94` — `h2 text-xl font-semibold`
- `patterns/data-table/page.tsx:434`, `:478` — `h2 text-xl font-semibold`
- `patterns/import-wizard/page.tsx:222` — `h2` multi-baris (periksa)
- `patterns/calendar/page.tsx:299`, `:349`; `patterns/org-chart/page.tsx:218`; `patterns/org-chart-editor/page.tsx:263` — `h2 flex items-center gap-2 text-sm font-semibold` (pola ikon manual; cek apakah ada ikon)
- `patterns/cascader-tree-select/page.tsx` — 11 `h2 text-sm font-semibold` (judul demo; kandidat terbesar)
- `patterns/optimistic-updates/page.tsx:222`, `:266`; `patterns/kanban/page.tsx:131`; `patterns/file-upload/page.tsx:91`; `components/charts/page.tsx:99` — `h2 text-sm`/`text-base font-semibold` (judul kartu)
- Catatan aksesibilitas `h2 text-sm font-semibold`: `patterns/org-chart/page.tsx:229`, `patterns/file-manager/page.tsx:241`, `patterns/org-chart-editor/page.tsx:275`

**C. h3 manual**
- `components/layout-navigation/page.tsx:349` — `text-xl font-bold font-display` (sudah sesuai Heading 3 setelah CR-043; tidak diubah lagi)
- `components/data-display/page.tsx:622` — `text-xl font-bold font-display` (sama)
- `components/marketing/page.tsx:322`, `:330` — `text-2xl font-extrabold font-display` (weight 800; di luar scale)
- `patterns/stepper/page.tsx:200` — `text-2xl font-bold tracking-tight` (heading manual; ukuran 2xl di luar Heading 2 standar)
- `patterns/stepper/page.tsx:322` — judul kartu harga `font-semibold` (judul kartu, sah)
- `patterns/results/page.tsx:173` — judul item `text-sm` (judul kartu, sah)
- `patterns/activity-feed/page.tsx:316` — label `text-xs uppercase` sebagai h3 (perlu periksa: label, bukan heading)
- `patterns/master-detail/page.tsx:224` — `text-lg font-semibold` (judul panel detail)

**D. Lainnya**
- `patterns/auth/page.tsx:354` — input OTP `text-lg font-bold font-mono` (kontrol, sah)
- `patterns/stepper/page.tsx:325` — harga `text-2xl font-bold` (data, sah)

## Rencana (usulan, perlu persetujuan)

1. **Kelompok 1 (aman, kode saja):** ubah teks kecil `text-highlight` menjadi `text-foreground` untuk item di A yang bukan hover dan bukan ikon (`forms:460`, `data-display:684`, `master-detail:244`). Setara dengan aturan CR-046 dan visual-language.md.
2. **Kelompok 2 (heading section):** `onboarding:167` ke `SectionHeading`. Judul demo `cascader-tree-select` dan kartu lain di B tetap `h2` manual, karena judul kartu bukan heading section (keputusan CR-041 dan keputusan judul kartu CR-052). Tandai eksplisit di CR turunan.
3. **Kelompok 3 (keputusan user):** hover `text-highlight` (A), `text-2xl font-extrabold` marketing (C), `text-2xl font-bold tracking-tight` stepper (C), dan `text-xl font-bold` di `components/page.tsx:132`. Perlu user memutuskan: boleh dibiarkan sebagai pengecualian terdokumentasi atau dikonversi.
4. **Guard:** perluas `manual-heading-lg-bold` dan `manual-section-heading` ke `components/` dan `patterns/` **hanya setelah** Kelompok 2 selesai. Ketika itu, judul kartu (`text-sm`) tidak diatur. Aturan baru `text-highlight` pada teks `text-xs`/`text-sm` diuji sebagai aturan terpisah, dengan pengecualian untuk hover.
5. **Verifikasi:** screenshot dark dan light Atelier/Pulse per halaman yang berubah. Palet dan art direction lain dicatat sebagai batas, bukan diklaim.

## Tasks (jalur small-fix, per kelompok)

- [x] CR disetujui user (2026-11-22).
- [x] Kelompok 1: ubah teks kecil `text-highlight` (3 item) ke `text-foreground`; screenshot.
- [x] Kelompok 2: `onboarding` heading ke `SectionHeading`; cek urutan heading.
- [x] Kelompok 3: keputusan user dicatat di tabel Keputusan.
- [x] Guard: perluas aturan sesuai keputusan; `pnpm --filter @ds/showcase exec vitest run src/test/visual-language-guard.test.ts` hijau.
- [x] Verifikasi: `pnpm --filter @ds/showcase lint`, `build:types`, guard hijau. Typecheck root dan test penuh mengikuti baseline yang tercatat.
- [x] Screenshot dark dan light Atelier/Pulse untuk halaman yang berubah.
- [x] `docs/BACKLOG.md` dan `docs/STATUS-LOG.md` diperbarui; `node scripts/check-status-log.mjs` hijau.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Audit dulu, belum ada perubahan kode | Inventori mentah berisi false positive; perubahan butuh klasifikasi |
| 2 | Judul kartu `text-sm`/`text-base` tidak diubah ke `SectionHeading` | Konsisten dengan CR-041 dan CR-052; judul kartu bukan heading section |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode.
- [x] Hierarki heading tetap (h1 → h2 → h3) dan tidak ada h3 tunggal.
- [x] Teks kecil tidak memakai `text-highlight` (kontras, lihat visual-language.md).
- [x] Light dan dark parity dicek lewat screenshot.
- [x] Guard `visual-language-guard` tetap hijau.

## Eksekusi

- Branch: `visual-polish` (digabung di branch ini sesuai instruksi user).
- Commit: belum.

## Keputusan (eksekusi)

| Item | Keputusan | Alasan |
|---|---|---|
| (a) teks kecil `text-highlight` statis | Ganti ke `text-foreground`: forms (harga), data-display ("Explore docs"), master-detail ("You (Support)") | Aturan `visual-language.md` Color Roles: teks kecil tidak memakai `text-highlight` |
| (b) hover `text-highlight` pada tautan | Dibiarkan (components/page.tsx, layout-navigation) | Feedback state hover, bukan teks statis |
| (c) ikon kotak `bg-highlight text-highlight-foreground` | Tidak diubah | Aksen identitas, sesuai peran `highlight` |
| (d) marketing h3 `font-extrabold` | Ganti ke `font-bold` (2 kemunculan) | Normalisasi weight heading ke 700 (praktik docs) |
| (e) stepper "Workspace Ready!" h3 | Dibiarkan | Heading state sukses, pengecualian |
| (f) onboarding h2 modal | Diganti `<SectionHeading id="onboarding-title" />` | Heading section seragam; kicker tetap di atas |
| (g) components "Browse by Category" | Diganti `SectionHeading` dengan `description` dan `actions` (count), tetap di wrapper `border-b` | Heading section seragam |
| Judul kartu h2 `text-sm`/`text-base` | Dibiarkan | Judul kartu, bukan heading section (CR-041/CR-052) |
| h3 master-detail:224, activity-feed:316 | Dibiarkan | Judul panel/label |

## Eksekusi

- File diubah: `components/forms/page.tsx`, `components/data-display/page.tsx`, `components/marketing/page.tsx`, `components/page.tsx`, `patterns/master-detail/page.tsx`, `patterns/onboarding/page.tsx`.
- Verifikasi: guard `visual-language-guard.test.ts` 5/5 hijau; `@ds/showcase lint` exit 0; `@ds/showcase build:types` exit 0.
- Screenshot (Chrome headless, Atelier/Pulse, `/tmp/cr053-shots/`): `components` light dan dark, `patterns/onboarding` light (modal), `components/forms` light dan dark, `patterns/master-detail` dark, `components/marketing` light: heading seragam dan tidak ada teks terpotong. `components/data-display` dark tertangkap dalam light (kegagalan probe tema, bukan regresi kode) dan belum diambil ulang.
- Belum dicakup: palet/art direction selain Atelier/Pulse untuk halaman components/patterns; `pnpm test` penuh dan build produksi tidak dijalankan ulang untuk CR-053.
- Status: approved oleh user 2026-11-22. `done` menunggu penetapan user.
