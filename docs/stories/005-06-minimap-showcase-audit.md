# 005-06 — Minimap + showcase end-to-end + audit

Status: approved
PRD: `docs/prd/005-flow-editor.md`
Design: `docs/design/flow-editor.md`
FR: `FR-008`, `FR-010`, `FR-014`, `FR-016`
Screens: `S-005.29`, `S-005.29.01`, `S-005.29.02`
Goal: Scenario showcase utuh (palette → edge → inspector → undo → minimap) light & dark, lolos smoke + audit kontras, status could tampil.

## Acceptance Criteria

### AC-01 — Minimap sinkron + pindah

**Given** canvas besar melebihi viewport, `minimap` default true
**When** node digeser / minimap diklik-diseret / layar < md
**Then** viewport minimap sinkron; klik/drag pindah viewport; < md sembunyi + toggle; `tabIndex=-1` + skip-link (FR-008, S-005.29)

### AC-02 — Scenario end-to-end 6 langkah

**Given** route `/patterns/flow-editor` dengan dataset 5 node + 4 edge berlabel
**When** `ol` 1 tarik → 2 sambung → 3 edit inspector → 4 hapus + urungkan → 5 minimap/snap → 6 atur ulang demo dijalankan
**Then** semua langkah Bahasa Indonesia bekerja + tombol [Muat contoh] [Atur ulang demo] + meta "N node · M edge" + panel demo (loading/empty/error, snap/grid/minimap, light/dark, invalid-edge) (FR-014, S-005.29)

### AC-03 — Status could + daftar SR penuh

**Given** node berstatus default/running/success/warning/error + tab Daftar
**When** status diubah di inspector + daftar dibaca SR
**Then** dot + badge teks token sesuai (tidak warna-saja); `ul` node ("nama, N koneksi") + `ul` edge ("A → B, label") + tombol [Fokus]/[Hapus] per baris (FR-016, FR-011, S-005.29)

### AC-04 — Audit kontras + smoke build
**Given** light & dark
**When** `pnpm test:tokens` + `pnpm -C apps/showcase build` + cek `data-testid` lengkap
**Then** teks ≥ 4.5:1, grafis ≥ 3:1 (tabel audit di story); build lolos; 11 testid hadir (FR-010, FR-014, S-005.29)

### AC-05 — Responsif + host toast

**Given** viewport < md dan ≥ lg
**When** palette dibuka sebagai drawer, inspector sebagai bottom-sheet overlay, minimap disembunyikan + toggle; toast "Dihapus — Urungkan" dipicu
**Then** semua fungsi (tambah/sambung/edit/hapus/undo/pan/zoom) tetap tersedia; canvas min-height 320 di kecil; `<Toaster>` dirender di route (FR-005, FR-006, FR-007, S-005.29, wireframe §5)

## Tasks

- [ ] Minimap token-mapped + toggle + responsif < md
- [ ] Route `/patterns/flow-editor`: dataset workflow + `ol` ID + panel demo + kotak resep 15 baris
- [ ] Status could `FlowStatus` + badge teks + daftar SR `ul` + tombol per baris
- [ ] Audit kontras light & dark (tabel) + `pnpm test:tokens` + smoke build
- [ ] Verifikasi FR-001–016 tercakup penuh lintas 005-01–06; catat gap bila ada
- [ ] `<Toaster>` (`feedback/toaster`) dirender di route — host tunggal semua toast 005-03/04/05
- [ ] Update docs (sitemap `implemented`/`documented` bila layak) + STATUS-LOG

## Dependencies

- Story/CR lain: 005-01–05 (semua fitur sebagai isi showcase)
- Package: tanpa dependency baru

## Notes

- Risiko: scope audit membesar — mitigasi: tabel audit hanya pasangan token yang dipakai (teks + grafis)
- Keputusan: minimap boleh dipotong terakhir bila scope meledak (OQ#2) — AC-01 turun ke could, AC-02–04 tetap must
