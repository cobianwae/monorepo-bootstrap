# 007-01 — Transfer list assign role + showcase

Status: done
Spec: `docs/design/spec-transfer-list.md`
FR: `FR-001`, `FR-002`, `FR-003`, `FR-004`, `FR-005`, `FR-006`, `FR-007`, `FR-009`
Screens: `S-005.30`
Goal: Komponen `TransferList` dual-listbox controlled untuk assign role/anggota — pindah tiga cara, filter per panel, a11y listbox penuh — plus scenario showcase assign role light & dark.

## Acceptance Criteria

### AC-01 — Dua panel dengan counter sinkron

**Given** 12 item available dan 3 item selected
**When** komponen dirender
**Then** header tiap panel menampilkan counter benar (12 dan 3), area list scroll independen, dan counter terupdate setiap aksi pindah — diverifikasi test (FR-001, S-005.30)

### AC-02 — Tiga cara memindah item

**Given** item terpilih di panel available
**When** klik tombol pindah (→), double-click item, dan "pindah semua yang tampil"
**Then** ketiga cara mengubah isi panel + counter dengan benar; pindah-semua hanya memindah item yang tampil (terfilter) (FR-002, S-005.30)

### AC-03 — Multi-select sebagai dasar pindah

**Given** panel dengan 8 item
**When** klik + shift/ctrl untuk seleksi ganda (dan checkbox bila tersedia)
**Then** satu aksi pindah memindahkan semua item terpilih sekaligus (FR-003, S-005.30)

### AC-04 — Filter tidak merusak nilai

**Given** nilai terkontrol berisi 4 item
**When** mengetik filter "dev" di panel available
**Then** tampilan menyaring tanpa mengubah `value`; menghapus filter mengembalikan semua item (FR-004, FR-005, S-005.30)

### AC-05 — Keyboard + screen reader penuh

**Given** fokus di panel available
**When** navigasi panah, seleksi via keyboard, pindah via tombol terjangkau keyboard
**Then** seluruh alur selesai tanpa mouse; pola dua listbox terlabel; fokus berpindah logis setelah aksi; audit a11y lolos (FR-006, S-005.30)

### AC-06 — State matrix + showcase smoke

**Given** scenario S-005.30 (assign role) dibuka light dan dark
**When** state loading (skeleton dua panel), empty per panel, dan error dipicu
**Then** ketiga state teramati; route lolos smoke build (FR-007, FR-009, S-005.30)

## Tasks

- [x] Buat `packages/ui/src/components/form/transfer-list.tsx` + tipe (`TransferItem`, `TransferListProps` controlled `value`/`onChange`)
- [x] Dua panel + counter + tombol pindah + pindah-semua + double-click
- [x] Multi-select (klik/shift/ctrl) + filter per panel (tampilan saja)
- [x] ARIA dua listbox + focus management + audit a11y
- [x] State matrix: skeleton, empty per panel, error
- [x] Barrel export + test co-located (counter, 3 cara pindah, multiselect, filter-vs-value)
- [x] Scenario showcase S-005.30 (`/patterns/transfer-list`) + smoke build
- [x] Update BACKLOG + STATUS-LOG; sitemap S-005.30 `planned` → `implemented`

## Dependencies

- Story/CR lain: tidak ada; compose `button`, `checkbox`, `input`/`search-input`, `skeleton`, `empty-state`, `badge` existing
- Package: tanpa dependency baru (reorder FR-008 `could` resmi ditunda ke iterasi berikut)

## Notes

- Risiko: pola listbox ARIA ganda rumit — ikuti praktik Ant/MUI X + verifikasi SR
- Keputusan: v1 tanpa reorder; item shape minimal `{id, label, disabled}`
