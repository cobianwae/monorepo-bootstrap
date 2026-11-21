# 014-03 — Validasi + konfirmasi + showcase final

Status: review
PRD: `docs/prd/014-import-wizard.md` (approved, gate 1)
Design: `docs/design/import-wizard.md` (approved, gate 2) + `docs/design/flows/import-wizard.mmd` (flow 3–4) + `docs/design/wireframes/import-wizard.md` (§2.3–2.4, §4–7)
FR: `FR-003`, `FR-004`, `FR-005`, `FR-006`, `FR-008`, `FR-009`, `FR-011`
Screens: `S-005.37`, `S-005.37.03`, `S-005.37.04`
Goal: Wizard selesai ujung-ke-ujung: pratinjau error per sel yang bisa diperbaiki, konfirmasi ringkasan + submit via `onComplete`, showcase final lolos smoke + a11y + light/dark.

## Acceptance Criteria

### AC-01 — Error per sel terbaca dan bisa difilter

**Given** file contoh invalid (email duplikat + tanggal invalid, skenario PRD)
**When** dibuka di langkah 3 validasi
**Then** sel penyebab bertanda (border + ikon + pesan Bahasa Indonesia) dengan `aria-invalid` + `aria-describedby`; filter Semua/Hanya error bekerja; hitungan per kolom tampil — diverifikasi test + scenario (FR-003, FR-006, S-005.37.03)

### AC-02 — Perbaiki tanpa mengulang dari awal

**Given** 2 baris error di langkah 3
**When** user Kembali ke mapping (ganti kolom) / unggah ulang file / tandai dilewati
**Then** mapping lama tidak hilang; validasi dihitung ulang; baris dilewati tidak ikut hasil; opsi default lewati, opsi gagalkan memblokir submit bila error tersisa — diverifikasi test + scenario (FR-003, FR-004, FR-005, S-005.37.03)

### AC-03 — Konfirmasi dan submit hanya baris valid

**Given** 200 valid + 2 gagal (contoh PRD)
**When** user di langkah 4 memilih lewati/gagalkan lalu menekan "Impor N baris"
**Then** ringkasan 3 stat tampil (teks + ikon, bukan warna saja); lewati → `onComplete` hanya baris valid; gagalkan + error tersisa → submit ditolak + fokus ke ringkasan; sukses → layar "N baris siap" + Mulai ulang — diverifikasi test (FR-004, S-005.37.04)

### AC-04 — State matrix penuh + showcase final

**Given** route `/patterns/import-wizard` dengan panel demo
**When** dibuka dengan dataset valid/invalid/kosong/besar + pemicu loading/error + toggle light/dark
**Then** semua state §4 teramati (`ol` 6 langkah end-to-end hijau); resep `onComplete` 15 baris tersalin; smoke `pnpm -C apps/showcase build` hijau — diverifikasi scenario (FR-008, FR-011, S-005.37)

### AC-05 — A11y penuh dan parity light/dark

**Given** alur penuh hanya keyboard + screen reader
**When** menjalankan upload → mapping → validasi → konfirmasi di light dan dark
**Then** fokus ke `h2` tiap langkah + live region; tabel `th scope`; progres `progressbar`; error selalu teks; kontras teks ≥ 4.5:1 + grafis ≥ 3:1 via `test:tokens` — diverifikasi audit (FR-009, FR-011, S-005.37)

## Tasks

- [x] Implementasi langkah 3 (§2.3): tabel pratinjau paginasi 25 + filter Semua/Hanya error + sel error + pesan + aksi kembali/unggah-ulang/lewati (wiring `validateRows` 014-01)
- [x] Implementasi langkah 4 (§2.4): 3 stat + radio lewati/gagalkan + submit hitungan + sukses + Mulai ulang; `onComplete` hanya valid
- [x] Finalisasi showcase S-005.37: `ol` end-to-end, panel demo 6 state, dataset valid/invalid/kosong/besar, resep 15 baris, toggle delimiter + light/dark, `data-testid` `iw-*` lengkap
- [x] Audit: keyboard penuh, SR live region, fokus ring, `test:tokens` light & dark + tabel audit di story; smoke showcase build (lihat tabel audit di bawah)
- [ ] Update `sitemap.md` S-005.37 series → `implemented` + catat `STATUS-LOG.md` setelah merge per AGENTS.md

## Dependencies

- Story/CR lain: menunggu 014-02 (shell + upload + mapping)
- Package: tanpa dependency baru (papaparse dari 014-01)

## Notes

- Risiko: 10.000 baris memperlambat pratinjau — mitigasi paginasi + memo + chunk/streaming per §3 langkah 8
- Keputusan: OQ#2 lewati default; tanpa modal baru v1 (destruktif milik konsumen via `dialog` existing bila perlu)
- Keputusan implementasi: stat "Lewati" = jumlah baris dilewati saat policy `skip` (0 bila `fail`); stat "Gagal" = baris error. Sukses memakai heading "Impor siap diproses".
- Deviasi minor dari §5: `aria-invalid` + `aria-describedby` diletakkan pada `<td>` sel error (bukan pada kontrol), karena sel tabel pratinjau tidak interaktif.
- Carry-over 014-02 tetap di luar scope (tidak dikerjakan di 014-03): `aria-disabled` per langkah Stepper (perlu ubah API `packages/ui`), CTA "Pilih file lain" pada state file kosong, typo kamus `sulam: 'email'` di `_lib/mapping.ts` (seharusnya `surel`; jadi CR).
- Streaming/chunk validasi 10.000 baris DITUNDA; mitigasi memakai paginasi 25 + memo (`validation-view.ts`).

## Tabel Audit (014-03)

| Area | Cara verifikasi | Hasil |
|---|---|---|
| Keyboard | Stepper klik hanya langkah terbuka; Next/Back native `Button`; filter `SegmentedControl`; policy `RadioGroup`; paginasi `nav` dengan tombol | Lulus (review kode + `page.test.tsx`, `page-flow.test.tsx`). Tidak ada keyboard trap; tombol bertanda `aria-disabled` tetap fokusable dan diberi alasan via `aria-describedby`. |
| Fokus ke h2 tiap langkah | `headingRef` + effect deps `[state.step, completed]`, `tabIndex -1` | Lulus (test `page-flow`). |
| SR live region | `p[role=status][aria-live=polite][data-testid=iw-live]` berisi "Langkah N dari 4: ..."; `aria-live` juga di info paginasi | Lulus (kode). Verifikasi pembacaan oleh screen reader nyata belum dilakukan (manual, di luar lingkungan ini). |
| Tabel `th scope` | `TableHead scope="col"` di tabel mapping dan validasi | Lulus (kode). |
| Progres | `Progress` dengan `aria-label` "Memparsing berkas" + `aria-busy` pada area upload | Lulus (kode). |
| Error selalu teks | Setiap sel error punya teks `span#id` + `aria-describedby`; badge `Gagal` ada teks + ikon | Lulus (kode). |
| Fokus ring | `focus-visible:ring-2 focus-visible:ring-ring` pada heading, footer hint, summary | Lulus (kode). |
| Kontras teks light | `text-destructive` (#B91C1C) di atas `bg-destructive/10` di atas #FFFFFF = 5.54:1 | ≥ 4.5:1 — test `contrast.test.ts` (baru) |
| Kontras teks dark | `#F87171` di atas tint 10% di atas #141620 = 5.71:1 | ≥ 4.5:1 — test `contrast.test.ts` (baru) |
| Kontras grafis error | `#DC2626` di atas #FFFFFF = 4.83:1; `#F87171` di atas #141620 = 6.51:1 | ≥ 3:1 — test `contrast.test.ts` (baru) |
| Smoke build | `pnpm -C apps/showcase build` | Exit 0 |
| Token & kontras | `pnpm test:tokens` | 8/8 hijau (termasuk test baru) |

Catatan: audit keyboard dan SR di atas berbasis review kode serta test jsdom; pengujian manual dengan browser + screen reader belum dilakukan dan perlu dijalankan user sebelum status `done`.
