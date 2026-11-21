# 014-02 — Shell stepper + upload + mapping

Status: review
PRD: `docs/prd/014-import-wizard.md` (approved, gate 1)
Design: `docs/design/import-wizard.md` (approved, gate 2) + `docs/design/flows/import-wizard.mmd` (flow 1–2) + `docs/design/wireframes/import-wizard.md` (§2.1–2.2, §4)
FR: `FR-001`, `FR-002`, `FR-005`, `FR-007`, `FR-008`, `FR-009`
Screens: `S-005.37`, `S-005.37.01`, `S-005.37.02`
Goal: Kerangka wizard 4 langkah berdiri dengan langkah 1–2 fungsional: unggah/tempel CSV, unduh template, petakan kolom dengan gate wajib — state terjaga dan keyboard-penuh.

## Acceptance Criteria

### AC-01 — Upload file, tempel, dan template

**Given** wizard langkah 1 tanpa file
**When** user drag-drop / pilih `.csv` / tempel isi CSV / tekan Unduh template
**Then** file valid lanjut ke mapping dengan header terdeteksi; tempel bekerja setara file (file menang bila keduanya ada + pesan); template mengunduh `template-<entitas>.csv`; XLSX ditolak "v1 CSV saja" — diverifikasi test + scenario (FR-001, FR-007, FR-010, S-005.37.01)

### AC-02 — Loading, empty, dan error upload teramati

**Given** file besar, file kosong, dan file encoding rusak
**When** dibuka di langkah 1
**Then** besar = `progress` + teks "Memparsing N baris…" + navigasi disabled; kosong = `empty-state` + CTA pilih lain; rusak = `alert` + penyebab + aksi delimiter manual/unggah ulang — diverifikasi scenario (FR-008, S-005.37.01)

### AC-03 — Mapping suggest + gate wajib

**Given** header terdeteksi dengan suggest terisi
**When** user mengganti target / memilih Abaikan / membuat duplikat target
**Then** suggest tampil "disarankan" dan bisa ditimpa; duplikat non-abaikan ditolak dengan pesan; Lanjut disabled + daftar wajib hilang sampai semua `required` terpetakan; coba lanjut via keyboard memindahkan fokus ke pesan — diverifikasi test + scenario (FR-002, S-005.37.02)

### AC-04 — Mundur tidak menghilangkan state + fokus terkelola

**Given** user di langkah 2 mapping terisi lalu (nanti) kembali dari validasi
**When** menekan Kembali / mengklik stepper langkah selesai
**Then** file + mapping tampil utuh; file baru me-reset validasi tapi mempertahankan mapping bila header cocok; tiap ganti langkah fokus ke `h2` + live region "Langkah N dari 4" — diverifikasi test + audit keyboard (FR-005, FR-009, S-005.37)

### AC-05 — Keyboard dan stepper bermakna

**Given** wizard dengan keyboard saja
**When** menavigasi stepper + dropzone + select mapping + footer
**Then** semua reachable/operable; stepper depan `aria-disabled` + alasan; select native penuh; fokus ring `primary` 2px light & dark — diverifikasi audit (FR-009, S-005.37)

## Tasks

- [x] Buat route `/patterns/import-wizard` draf: `PageHeader` + card wizard + `Stepper` 4 langkah + `h2 tabindex=-1` + live region + footer [Kembali][Lanjut] + status strip (wireframe §1)
- [x] Implementasi langkah 1 (§2.1): dropzone + `file-input`, `textarea` tempel, radio delimiter auto/manual, tombol template (Blob dari 014-01), state empty/loading(`progress`)/error(`alert`) + `data-testid` `iw-*`
- [x] Implementasi langkah 2 (§2.2): tabel mapping + `select` per header + badge wajib + pesan duplikat + gate Lanjut + fokus-ke-pesan
- [x] Store satu (`file → mapping`) terjaga saat mundur; wiring util 014-01 (tanpa duplikasi logika)
- [x] Test co-located/showcase: gate wajib, duplikat ditolak, state terjaga, fokus `h2` + live region; tanpa token baru, audit `test:tokens` awal

## Dependencies

- Story/CR lain: menunggu 014-01 (util parse/suggest/template)
- Package: `papaparse` dari 014-01; tanpa dependency baru tambahan

## Notes

- Risiko: drag-only tidak keyboard — mitigasi tombol Pilih file selalu ada; paste vs file prioritas didokumentasikan
- Keputusan: D1 composed existing primitives; validasi penuh di 014-03; delimiter manual + template di langkah 1 per flow 1

## Catatan Implementasi (2026-11-21)

- Task 5 (test): logika gate, state mundur, dan penolakan duplikat teruji di `_lib/wizard-state.test.ts`; alur halaman (gate → fokus pesan, fokus `h2` + live region saat ganti langkah, state tempel terjaga saat mundur) teruji di `page.test.tsx` dengan jsdom. Showcase: 35 test hijau.
- Dependency (disetujui user): devDependencies `@testing-library/react@^16.3.2`, `@testing-library/dom@^10.4.1` (peer wajib), dan `jsdom@^30.0.1` di `apps/showcase`. `vitest.config.ts` showcase menambah `esbuild.jsx: 'automatic'`, sama dengan `packages/ui`.
- Tes penolakan duplikat via UI (Radix Select) belum diuji otomatis; logikanya teruji di `wizard-state.test.ts`.
- Deviasi disetujui user: loading parsing tanpa persentase (`progressbar` indeterminate + "Memparsing berkas…").
- Belum sesuai AC-05: langkah depan stepper tidak memiliki `aria-disabled` per langkah karena `Stepper` di `packages/ui` tidak menerima prop itu; diganti teks "Langkah 3–4 belum tersedia". Mengubah API `Stepper` butuh approval.
- Belum sesuai AC-02: state file kosong belum punya tombol CTA "Pilih file lain" (hanya teks).
- Temuan (CR, bukan edit langsung karena 014-01 `done`): `_lib/mapping.ts` kamus `SYNONYM` memuat `sulam: 'email'`, seharusnya `surel` (design §3 langkah 3). Header "Surel" tidak tersaran.
- Known issue di luar scope: typecheck `packages/ui` gagal di `flow-editor.test.tsx` (CR-015). Tes `FlowEditor undo/redo … batas stack 50` timeout 5000 ms dan flaky.
- `pnpm test:tokens` tidak dijalankan: tidak ada perubahan token.
