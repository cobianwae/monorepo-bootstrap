# 005-04 — Seleksi + inspector on-demand + hapus atomik

Status: approved
PRD: `docs/prd/005-flow-editor.md`
Design: `docs/design/flow-editor.md`
FR: `FR-005`, `FR-006`
Screens: `S-005.29`, `S-005.29.02`
Goal: Seleksi tunggal/multi terobservasi, inspector sheet hanya on-demand, hapus node mengikutkan edge + toast.

## Acceptance Criteria

### AC-01 — Seleksi tunggal via klik/Enter membuka inspector

**Given** canvas berisi node + edge
**When** node diklik / `Enter` / tombol rincian
**Then** ring `primary` + `aria-selected` + `onSelectionChange({nodes:[1],edges:[]})` → konsumen membuka `<Sheet>`; perubahan judul live ke canvas (FR-005, FR-006, S-005.29.02)

### AC-02 — Multi-seleksi mode hitungan

**Given** Shift-klik / rubber-band / `Ctrl+A`
**When** N node + M edge terpilih
**Then** judul inspector "N terpilih (X node, Y edge)" + [Hapus semua] + [Batalkan seleksi]; form properti disembunyikan; live region "N terpilih" (FR-005, S-005.29.02)

### AC-03 — Isi inspector minimal + validasi

**Given** node terpilih tunggal
**When** judul dikosongkan / deskripsi diisi / status dipilih / [Duplikat]
**Then** judul kosong ditolak inline (`aria-invalid` + pesan); deskripsi/status/duplikat commit + push history via kontrak 005-01 (mock); meta id/posisi/koneksi read-only tampil (FR-006, S-005.29.02)

### AC-04 — Hapus atomik + toast tanpa dialog

**Given** node dengan edge terkait terpilih
**When** `Delete`/menu konteks/[Hapus…]
**Then** node + semua edge menyentuhnya hilang dalam satu commit; toast "Dihapus — Urungkan"; tanpa dialog blokir (FR-005, S-005.29)

### AC-05 — Edge terpilih di inspector

**Given** edge terpilih
**When** inspector dibuka
**Then** label input + sumber → target read-only + [Hapus edge] (FR-006, S-005.29.02)

## Tasks

- [ ] `onSelectionChange` wiring + live region hitungan
- [ ] Sheet komposisi showcase (`overlay/sheet` + `form/*`): isi minimal + mode multi + validasi judul
- [ ] Hapus atomik node+edge + toast (tanpa dialog)
- [ ] Menu konteks per node/edge/canvas (label Indonesia)
- [ ] Test: tunggal/multi + on-demand (tambah tidak buka) + validasi + hapus atomik + undo-restore (mock)
- [ ] Showcase: inspector tampil di draf route (final di 005-06)

## Dependencies

- Story/CR lain: 005-01 (canvas/seleksi milik xyflow), 005-03 (edge untuk inspector edge + hapus atomik)
- Package: `overlay/sheet`, `form/*`, `navigation/context-menu` — tanpa dependency baru

## Notes

- Risiko: sheet auto-buka saat tambah (temuan #3) — mitigasi: buka hanya dari `onSelectionChange` eksplisit, tambah memanggil seleksi programatik tanpa flag buka
- Keputusan: hapus tanpa dialog blokir agar loop cepat (toast + undo sebagai pengaman)
