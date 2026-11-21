# 018-03 — Showcase + audit kontras + smoke

Status: approved
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

- [ ] Buat route `apps/showcase` `/patterns/permission-matrix` (`page.tsx` + `_components/` bila perlu): `PageHeader` + `ol` 5 langkah + grid live + banner + legenda + daftar keyboard + panel demo 6 state + toggle light/dark + resep `onComplete` 15 baris (DemoSection, bukan pola)
- [ ] Isi tabel audit kontras light/dark (§6 wireframe) via `pnpm test:tokens`; catat pasangan teks/grafis + risiko strip dark
- [ ] Test showcase smoke: route render + 1 toggle massal + 1 tolak kunci + banner muncul (Testing Library atau e2e ringan sesuai `docs/TESTING.md`)
- [ ] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:tokens`, `pnpm -C apps/showcase build`; update sitemap hanya saat merge (tetap `in-design` di story ini)

## Dependencies

- Story/CR lain: menunggu 018-01 + 018-02 (komponen lengkap); tidak menambah API publik
- Package: tanpa dependency baru

## Notes

- Risiko: dataset 20 kolom untuk uji K3 memperberat demo — mitigasi dataset default 5×8 + toggle "uji 20 kolom" opsional
- Keputusan: FR-010 tetap ditunda (K2, slot `renderCell` saja); perubahan API/kolom raksasa = CR terpisah, bukan scope story ini
