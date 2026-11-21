# 014-01 — Util parsing, mapping, validasi + template

Status: approved
PRD: `docs/prd/014-import-wizard.md` (approved, gate 1)
Design: `docs/design/import-wizard.md` (approved, gate 2) + `docs/design/flows/import-wizard.mmd` + `docs/design/wireframes/import-wizard.md`
FR: `FR-001`, `FR-002`, `FR-006`, `FR-007`, `FR-010`
Screens: `S-005.37.01`, `S-005.37.02`
Goal: Logika murni impor berdiri tanpa UI: parse CSV via papaparse, auto-suggest mapping, validasi deklaratif per sel, generator template — semua teruji unit sebelum UI dibangun.

## Acceptance Criteria

### AC-01 — Parse CSV valid + penolakan non-CSV

**Given** file `anggota.csv` (header + 5 baris, delimiter koma) dan file `data.xlsx`
**When** util parse dipanggil (worker/streaming, `header:true`, auto-detect)
**Then** CSV menghasilkan header + 5 baris tanpa throw; XLSX ditolak dengan pesan "v1 CSV saja" — diverifikasi test (FR-001, FR-010, S-005.37.01)

### AC-02 — Batas ukuran dan file kosong sebagai state

**Given** file >5 MB / >10.000 baris dan file header-saja (0 baris)
**When** diparse dengan default `maxBytes/maxRows`
**Then** file besar = warning + tetap lanjut (bukan blokir) dengan info batas; file kosong = hasil kosong bertanda empty — diverifikasi test (FR-001, FR-008, S-005.37.01)

### AC-03 — Auto-suggest mapping header Indonesia

**Given** header `["Nama Lengkap", "Email", "Tgl Lahir", "Telepon"]` dan fields `name/email/dob/phone/memberId(required)`
**When** `suggestMapping` dijalankan
**Then** terpetakan `name/email/dob` bertanda disarankan, `Telepon → phone`, `memberId → null` (wajib hilang terdeteksi); skor <70 menjadi Abaikan — diverifikasi test (FR-002, S-005.37.02)

### AC-04 — Validasi berurutan per sel Bahasa Indonesia

**Given** 5 baris dengan 1 email duplikat, 1 tanggal `32/13`, 1 wajib kosong, 1 pola salah, 1 custom invalid
**When** `validateRows` dijalankan
**Then** tiap sel menampilkan pelanggaran pertama Bahasa Indonesia ("Wajib diisi", "Email tidak valid", "Tanggal tidak valid (YYYY-MM-DD)", "Ganda di file (baris …)", pesan custom); `validCount` benar; tidak throw untuk data invalid — diverifikasi test (FR-003, FR-006, S-005.37.03)

### AC-05 — Template CSV terunduh sesuai field

**Given** fields target dengan `example` dan tanpa `example`
**When** `toTemplateCsv` dipanggil
**Then** menghasilkan header `key` + 1 baris contoh (example atau generator per tipe) yang bisa diunduh sebagai `template-<entitas>.csv` — diverifikasi test (FR-007, S-005.37.01)

## Tasks

- [ ] Tambah dependency `papaparse` + `@types/papaparse` (approved user 2026-11-21, D2) ke `apps/showcase` (scope showcase dulu, bukan `packages/ui`)
- [ ] Buat util showcase `_lib` berdampingan route: `parseCsv` (wrapper Papa + delimiter auto/manual + batas), `suggestMapping` + kamus sinonim (§3 langkah 3), `validateRows` (urutan wajib→tipe→pola→unik→custom), `toTemplateCsv` (§3 langkah 7)
- [ ] Tulis unit test co-located: parse valid/xlsx/besar/kosong, suggest skor + wajib hilang, validasi tiap aturan + pesan ID, template header + contoh
- [ ] Docs: catat batas default, kamus sinonim, dan pesan error di story; siapkan contoh `anggota-valid/invalid` untuk 014-02

## Dependencies

- Story/CR lain: tidak menunggu story lain; menjadi fondasi 014-02
- Package: `papaparse` (baru, approved) — tanpa komponen `packages/ui` baru v1 per D1

## Notes

- Risiko: worker papaparse di test jsdom — mitigasi pakai parse string sinkron di test, worker hanya di browser
- Keputusan: D1 composed (tanpa `form/import-wizard.tsx`); D2 papaparse; OQ#1 warning-bukan-blokir; OQ#3 auto + override
