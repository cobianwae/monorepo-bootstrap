# 005-03 — Edge sambung + validasi + label

Status: review
PRD: `docs/prd/005-flow-editor.md`
Design: `docs/design/flow-editor.md`
FR: `FR-003`, `FR-011`
Screens: `S-005.29`
Goal: Sambung antar-handle via pointer dan keyboard, invalid ditolak dengan pesan teks, label chip bisa diedit.

## Acceptance Criteria

### AC-01 — Sambung valid via drag

**Given** dua node dengan handle bebas
**When** handle sumber diseret ke handle target valid
**Then** edge terbentuk + terpilih + `onConnect` + push via kontrak history 005-01 (di-mock; mesin penuh di 005-05) + live region "Edge X→Y tersambung" (FR-003, S-005.29)

### AC-02 — Sambung via keyboard (Enter-Tab-Enter)

**Given** hanya keyboard, fokus pada handle sumber
**When** `Enter` mulai → `Tab` ke handle target → `Enter` selesai (`Esc` batal)
**Then** hasil identik dengan drag; target tidak valid → penolakan + fokus kembali ke handle sumber (FR-003, FR-011, S-005.29)

### AC-03 — Invalid ditolak + teks (bukan warna saja)

**Given** pasangan self-loop / duplikat / handle penuh / arah salah
**When** koneksi dicoba
**Then** edge tidak terbentuk; pesan menyebut alasan ("Sambungan ditolak: handle penuh") + edge bayangan `destructive` + `role="alert"` sementara; graph tidak rusak (FR-003, S-005.29)

### AC-04 — `isValidConnection` hanya mengencangkan

**Given** konsumen memberi `isValidConnection` custom
**When** aturan default lolos tapi custom menolak (dan sebaliknya)
**Then** hasil akhir = default AND custom; custom tidak bisa melonggarkan aturan arah (FR-003, S-005.29)

### AC-05 — Label chip edit via inspector

**Given** edge terpilih
**When** label diketik di inspector lalu dikosongkan
**Then** chip tampil/sembunyi (garis tetap), `onEdgesChange` satu commit + push history via kontrak 005-01 (mock) (FR-003, S-005.29.02)

### AC-06 — Hapus edge + toast

**Given** edge terpilih
**When** `Delete`/menu konteks
**Then** edge hilang + toast "Dihapus — Urungkan" (FR-003, S-005.29)

## Tasks

- [x] Validasi default (self-loop/duplikat/handle-penuh/arah) + AND custom
- [x] Keyboard connect Enter-Tab-Enter + Esc + focus-return
- [x] Label chip `badge` + tombol edit + marker panah token `muted-foreground`
- [x] Hapus edge + toast wiring (host toast final di 005-05, API disiapkan di sini)
- [x] Test: valid drag + keyboard + 4 kasus invalid + custom rule + label + hapus
- [ ] Showcase: dataset 2 node untuk latihan sambung (final di 005-06)

## Dependencies

- Story/CR lain: 005-01 (canvas + handle), 005-02 (node lahir untuk disambung)
- Package: tanpa dependency baru

## Notes

- Risiko: model keyboard invented ulang (temuan #5) — mitigasi: patuhi Enter-Tab-Enter sesuai spec §5
- Keputusan: garis edge `muted-foreground`, bukan `border-strong` (tidak ada di token)
