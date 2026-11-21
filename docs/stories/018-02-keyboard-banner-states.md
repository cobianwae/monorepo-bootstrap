# 018-02 — Keyboard + banner dirty + state matrix

Status: approved
PRD: `docs/prd/018-permission-matrix.md` (approved, gate 1)
Design: `docs/design/wireframes/permission-matrix.md` (approved, gate 2) + `docs/design/flows/permission-matrix.mmd` (diagram 3–4) + sitemap `S-005.41`
FR: `FR-003`, `FR-005`, `FR-006`, `FR-007`
Screens: `S-005.41`
Goal: Grid bisa dipakai penuh tanpa mouse: navigasi roving + shortcut massal, banner dirty + daftar + reset, state matrix loading/empty/error, sticky + scroll responsif — semua teruji.

## Acceptance Criteria

### AC-01 — Keyboard grid penuh tanpa mouse

**Given** grid fokus via `Tab` (satu `tabIndex=0`, sisanya roving `-1`)
**When** panah/`Home`/`End` bergerak + `Space` toggle sel + `Enter/Space` toggle header + coba toggle sel terkunci
**Then** fokus berpindah tanpa jebakan; toggle mengumumkan "menyala/mati/N dipilih"; terkunci ditolak + alasan diumumkan; `Tab` keluar ke banner — diverifikasi test + audit manual (FR-006, S-005.41)

### AC-02 — Banner dirty + daftar + reset

**Given** `value` diubah 3 sel dari awal
**When** banner muncul lalu [Lihat daftar] dibuka + [Reset baris ini] / [Reset] ditekan + [Simpan] ditekan (mock konsumen)
**Then** banner `role="status"` + badge "3" + daftar "Role × Resource: dari → ke" hanya saat dirty > 0; reset mengembalikan awal + live "dibatalkan" + fokus ke grid; simpan memanggil `onValueChange` batch milik konsumen — diverifikasi test (FR-003, FR-005, S-005.41)

### AC-03 — State matrix loading/empty/error

**Given** pemicu `loading`, `value` kosong (tanpa role/resource), data invalid (role ganda), dan edge semua-terkunci
**When** dibuka via props
**Then** loading = skeleton 5×8 + `aria-busy` + teks SR; empty = `empty-state` + CTA contoh `role="status"`; error = `alert` + penyebab + CTA `role="alert"` + fokus ke alert; semua-terkunci = grid + info teks (bukan warna saja) — diverifikasi test (FR-007, S-005.41)

### AC-04 — Sticky + responsif tanpa kolom hilang

**Given** grid 20 kolom (uji batas K3) dibuka `≥md` dan `<md`
**When** scroll horizontal + fokus keyboard ke sel jauh
**Then** header kolom sticky atas + kolom resource sticky kiri tetap terlihat; scrollIntoView menjaga fokus; `<md` banner stacked + semua toggle/keyboard/states tetap — diverifikasi test + cek manual (K3, FR-001, S-005.41)

## Tasks

- [ ] Tambah ke `permission-matrix.tsx`: roving tabindex + panah/`Home`/`End`/`Ctrl+Home/End` (§4), live region polite + assertive error, banner §2.4 (`badge` + collapsible daftar + Reset/Simpan slot konsumen), states §3 (`skeleton`, `empty-state`, `alert`), sticky CSS token (`muted/40` + `border`) + scroll-x + `density` compact/default
- [ ] Token §6 (banner `warning/10` + `warning`, error `destructive` + teks, fokus ring `primary`); tanpa token baru; `prefers-reduced-motion` mematikan transisi banner/tooltip
- [ ] Test co-located lanjutan: roving + toggle keyboard + tolak kunci, banner muncul/hilang + reset per-baris/penuh, 4 state + semua-terkunci, sticky class + scroll tanpa fokus hilang
- [ ] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test` untuk perubahan

## Dependencies

- Story/CR lain: menunggu 018-01 (fondasi grid/toggle/kunci); menjadi fondasi 018-03
- Package: tanpa dependency baru

## Notes

- Risiko: live region terlalu cerewet tiap toggle massal — mitigasi umumkan ringkas "N dipilih" + dirty "N perubahan", bukan per-sel
- Keputusan: K3 sticky + scroll (tanpa virtualisasi v1); K5 label "sebagian" dipakai ulang di live keyboard; showcase final + audit di 018-03
