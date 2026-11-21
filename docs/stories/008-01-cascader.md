# 008-01 — Cascader alamat/kategori + showcase

Status: done
Spec: `docs/design/spec-cascader-tree-select.md`
FR: `FR-001`, `FR-002`, `FR-003`, `FR-004`, `FR-005`, `FR-006`
Screens: `S-005.31`
Goal: Komponen `Cascader` dropdown kolom bertingkat (3 tingkat, lazy load, clearable) dengan navigasi keyboard penuh — plus bagian cascader di scenario S-005.31 light & dark.

## Acceptance Criteria

### AC-01 — Alur kolom bertingkat 3 tingkat

**Given** data provinsi → kota → kecamatan
**When** memilih provinsi lalu kota lalu kecamatan (leaf)
**Then** kolom anak terbuka di sebelahnya tiap pilihan; memilih leaf menutup dropdown dan mengisi nilai path lengkap (FR-001, S-005.31)

### AC-02 — Dua mode tampilan nilai

**Given** path terpilih "ID · Jawa Barat · Bandung"
**When** mode penuh dan mode level-terakhir
**Then** trigger menampilkan path penuh atau hanya "Bandung" sesuai mode (FR-002, S-005.31)

### AC-03 — Lazy load + pencarian

**Given** node dengan anak belum dimuat dan kolom pencarian
**When** membuka node (fetch tiruan) dan mengetik query
**Then** kolom menampilkan loading saat fetch; hasil pencarian flat muncul dan memilihnya mengisi path lengkap (FR-003, FR-004, S-005.31)

### AC-04 — Clearable, disabled, error

**Given** tiga varian trigger
**When** dibuka di scenario
**Then** clear mengosongkan nilai; disabled tidak bisa dibuka; error menampilkan gaya + pesan konsisten pola form DS (FR-005, S-005.31)

### AC-05 — Keyboard + Escape + audit

**Given** dropdown terbuka
**When** panah antar kolom/opsi, Enter memilih, Escape menutup
**Then** seluruh alur tanpa mouse; ARIA benar; audit a11y lolos (FR-006, S-005.31)

## Tasks

- [x] Buat `packages/ui/src/components/form/cascader.tsx` + tipe (node `id`/`parentId`, `value` path, mode tampil)
- [x] Dropdown kolom bertingkat + leaf menutup + isi nilai
- [x] Lazy load per kolom (callback konsumen) + pencarian flat (FR-004 `could` masuk v1)
- [x] Clearable/disabled/error konsisten pola form
- [x] Navigasi keyboard + ARIA + audit a11y
- [x] Barrel export + test co-located (3 tingkat, 2 mode nilai, lazy, clear)
- [x] Scenario S-005.31 bagian cascader (`/patterns/cascader-tree-select`) + smoke build
- [x] Update BACKLOG + STATUS-LOG

## Dependencies

- Story/CR lain: 008-02 independen (boleh sesi terpisah, urutan bebas); compose `select`/`popover`, `skeleton`, `empty-state`, `scroll-area` existing
- Package: tanpa dependency baru

## Notes

- Risiko: manajemen fokus antar kolom dinamis — uji keyboard menyeluruh
- Keputusan: multi-select cascader di luar scope (non-goals spec); hanya pohon `id`/`parentId`
