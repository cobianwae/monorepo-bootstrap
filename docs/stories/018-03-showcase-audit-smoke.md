# 018-03 — Showcase + audit kontras + smoke

Status: review
PRD: `docs/prd/018-permission-matrix.md` (approved, gate 1)
Design: `docs/design/wireframes/permission-matrix.md` (approved, gate 2) + `docs/design/flows/permission-matrix.mmd` (diagram 4) + sitemap `S-005.41`
FR: `FR-008`, `FR-009` (regresi `FR-001`–`FR-007`)
Screens: `S-005.41`
Goal: Scenario `/patterns/permission-matrix` hidup light & dark: `ol` 5 langkah end-to-end + panel demo 6 state + resep 15 baris, audit kontras lolos, smoke build hijau.

## Acceptance Criteria

### AC-01 — Scenario interaktif 5 langkah

**Given** route `/patterns/permission-matrix` dibuka
**When** `ol` diikuti: 1 buka 5×8 → 2 toggle header "Editor" → 3 coba kunci "Viewer × Hapus" → 4 ubah 3 sel → 5 tinjau banner + reset/simpan
**Then** tiap langkah teramati + panel demo (dataset 5×8, kunci, dirty-3, kosong, invalid, loading) + toggle light/dark + resep controlled 15 baris tersalin — diverifikasi manual + smoke (FR-009, S-005.41)

### AC-02 — Audit kontras light & dark

**Given** sel/header/indeterminate/banner/error di kedua tema
**When** validator `@ds/tokens` (`pnpm test:tokens`) dijalankan + tabel audit diisi di story
**Then** teks ≥ 4.5:1, grafis (checkbox, strip `◐`, ring, ikon kunci) ≥ 3:1; strip dark tidak samar (solid `primary` + label "sebagian") — diverifikasi tabel audit (FR-008, S-005.41)

### AC-03 — Smoke + regresi tanpa kolom hilang

**Given** showcase + komponen final
**When** `pnpm -C apps/showcase build` + ulang toggle massal/keyboard/banner/states di kedua tema
**Then** build hijau; tidak ada state §3 wireframe yang hilang di kecil; sitemap `S-005.41` tetap `in-design` sampai implementasi di-merge — diverifikasi build log (FR-001–FR-009, S-005.41)

## Tasks

- [x] Buat route `apps/showcase` `/patterns/permission-matrix` (`page.tsx` + `_components/` bila perlu): `PageHeader` + `ol` 5 langkah + grid live + banner + legenda + daftar keyboard + panel demo 6 state + toggle light/dark + resep `onComplete` 15 baris (DemoSection, bukan pola)
- [x] Isi tabel audit kontras light/dark (§6 wireframe) via `pnpm test:tokens`; catat pasangan teks/grafis + risiko strip dark
- [x] Test showcase smoke: route render + 1 toggle massal + 1 tolak kunci + banner muncul (Testing Library atau e2e ringan sesuai `docs/TESTING.md`)
- [x] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:tokens`, `pnpm -C apps/showcase build`; update sitemap hanya saat merge (tetap `in-design` di story ini)

## Dependencies

- Story/CR lain: menunggu 018-01 + 018-02 (komponen lengkap); tidak menambah API publik
- Package: tanpa dependency baru

## Notes

- Risiko: dataset 20 kolom untuk uji K3 memperberat demo — mitigasi dataset default 5×8 + toggle "uji 20 kolom" opsional
- Keputusan: FR-010 tetap ditunda (K2, slot `renderCell` saja); perubahan API/kolom raksasa = CR terpisah, bukan scope story ini

## Hasil implementasi dan verifikasi — 2026-11-21

- Branch `018-03-showcase-audit-smoke` di worktree `arah-story`, dari `dev` `3ec4a80`; tanpa dependency baru, tanpa token baru, tanpa perubahan `packages/ui` atau `packages/tokens`.
- File baru: `apps/showcase/src/app/(docs)/patterns/permission-matrix/` (`page.tsx`, `page.test.tsx`, `_lib/demo-data.ts`, `_lib/recipe.ts`). Halaman hanya mengonsumsi `PermissionMatrix` dan tipenya; tidak ada API publik baru.
- Panel demo: dataset 5 role × 8 resource dengan kunci "Viewer × Hapus", dirty-3, kosong, invalid (role ganda), loading, error. Toggle "Uji 20 kolom" (K3) memakai 20 role × 8 resource. Toggle tema light/dark memakai kelas `.dark` pada pembungkus lokal.
- Resep controlled 15 baris ditampilkan dan dapat disalin (`navigator.clipboard`, dengan status hasil).
- Sitemap `S-005.41` tetap `in-design` sampai merge.

| Cakupan | Hasil |
|---|---|
| AC-01 | `page.test.tsx`: judul, langkah `ol`, grid 5×8 (6 columnheader, 9 row); toggle kolom Editor → "2 perubahan belum disimpan"; sel "Viewer × Hapus" ditolak dan alasan diumumkan; dirty-3 → "3 perubahan belum disimpan"; kosong → empty state. 5/5 lulus. |
| AC-02 | Audit kontras tema Pulse (lihat tabel di bawah). Semua pasangan lulus light dan dark. |
| AC-03 | `pnpm -C apps/showcase build` hijau; route `/patterns/permission-matrix` ter-build. Tidak ada state wireframe §3 yang dihapus dari komponen; cek kecil manual belum dilakukan (lihat batas). |
| `pnpm lint` | Lulus seluruh workspace (setelah perbaikan 2 `react/no-unescaped-entities` di `page.tsx`). |
| `pnpm typecheck` (root) | Terblokir baseline `packages/ui` `flow-editor.test.tsx:702–749` (12 error TS2339), sama seperti 018-02. `@ds/showcase` `tsc --noEmit` lulus. |
| `pnpm -C apps/showcase test` | 40/40 lulus (7 file, termasuk 5 test permission matrix). |
| `pnpm -C packages/ui test -- --maxWorkers=2 --testTimeout=30000` | 55 file / 616 test lulus. Dijalankan dengan flag baseline yang sama seperti 018-02. |
| `pnpm test:tokens` | 7/7 lulus. |

### Audit kontras (AC-02, tema Pulse)

Nilai hex dari `packages/tokens/src/tokens.ts` (`lightHex`/`darkHex`) dan `packages/tokens/src/themes.ts` (`Default Body Text`, `Card Content`, `Primary Action Button`, `Caption`) dihitung dengan `getContrastRatio`. Banner dihitung sebagai komposit `warning` 10% di atas `background` (sRGB). Pengukuran ini dilakukan dengan skrip vitest sementara yang sudah dihapus dari worktree.

| Pasangan | Jenis | Min | Light (fg/bg → rasio) | Dark (fg/bg → rasio) | Status |
|---|---|---|---|---|---|
| teks body: foreground / background | teks | 4.5 | #18181B/#FAFBFD → 17.11 | #F4F4F5/#0D0E15 → 17.52 | PASS |
| teks card: foreground / card | teks | 4.5 | #18181B/#FFFFFF → 17.72 | #F4F4F5/#141620 → 16.39 | PASS |
| legenda & label: muted-foreground / card | teks | 4.5 | #52525B/#FFFFFF → 7.73 | #A1A1AA/#141620 → 7.03 | PASS |
| header sticky: muted-foreground / muted (proxy muted/40) | teks | 4.5 | #52525B/#EFF0F4 → 6.79 | #A1A1AA/#1E202C → 6.31 | PASS |
| banner dirty: foreground / warning 10% di atas background | teks | 4.5 | #18181B/#F7EEE4 → 15.44 | #F4F4F5/#252017 → 14.72 | PASS |
| error alert: destructive / background | teks | 4.5 | #DC2626/#FAFBFD → 4.66 | #F87171/#0D0E15 → 6.96 | PASS |
| centang: primary-foreground / primary | grafis | 3 | #FFFFFF/#3D34B3 → 8.97 | #0D0E15/#8479FF → 5.65 | PASS |
| kotak kosong (`border-primary`) / card | grafis | 3 | #3D34B3/#FFFFFF → 8.97 | #8479FF/#141620 → 5.29 | PASS |
| strip indeterminate & label: primary / card | grafis | 3 | #3D34B3/#FFFFFF → 8.97 | #8479FF/#141620 → 5.29 | PASS |
| ikon kunci: muted-foreground / card | grafis | 3 | #52525B/#FFFFFF → 7.73 | #A1A1AA/#141620 → 7.03 | PASS |
| ring fokus: primary / background | grafis | 3 | #3D34B3/#FAFBFD → 8.67 | #8479FF/#0D0E15 → 5.65 | PASS |
| border banner: warning / background | grafis | 3 | #D97706/#FAFBFD → 3.08 | #FBBF24/#0D0E15 → 11.53 | PASS |

- Risiko strip dark (wireframe §6) tidak terjadi: strip memakai `primary` solid (#8479FF di atas #141620 = 5.29) dan label teks "sebagian" tetap ada.
- Catatan: `border` token (`--border`, light #D5D7E1 terhadap card 1.43) tidak dipakai untuk kotak checkbox. Checkbox memakai `border-primary`, sehingga tidak ada pelanggaran di kontrol. Bila `--border` dipakai sebagai batas kontrol di masa depan, rasionya tidak memenuhi 3:1.
- Cakupan audit: hanya tema Pulse. Enam tema lain tidak diaudit di story ini.

### Batas audit sebelum `done`

- Browser automation tidak tersedia di sesi ini (tidak ada tool browser atau Playwright/Puppeteer). Belum diverifikasi secara visual: walkthrough Tab nyata, screen reader, sticky saat scroll, tampilan mobile (`<md`), dan tampilan light/dark di browser, termasuk tooltip sel terkunci. Tooltip Radix dirender di portal `body`, sehingga berada di luar pembungkus `.dark` lokal; efeknya perlu dicek manual.
- Test jsdom bukan pengganti verifikasi tersebut. Cek manual ini menjadi catatan review.
- Kegagalan baseline (typecheck `packages/ui`) tidak diperbaiki di story ini.
