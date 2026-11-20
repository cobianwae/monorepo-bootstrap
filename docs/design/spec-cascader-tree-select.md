# Spec Singkat — Cascader & Tree Select (RM-03)

Status: approved
Tanggal: 2026-11-20
Screen: `S-005.31` Cascader & Tree Select (`/patterns/cascader-tree-select`)
Track: lightweight — spec singkat + 1–2 story (menggantikan PRD penuh)
Sumber: roadmap RM-03 (`docs/discussions/component-roadmap.md`)

## Masalah

Pemilihan nilai bertingkat (alamat provinsi→kota→kecamatan, kategori produk) tidak
terlayani: `select` existing hanya satu tingkat datar, dan membuka `tree-view` penuh
untuk satu input form terlalu berat. Praktik standar (Ant): **cascader** (dropdown
kolom bertingkat) dan **tree select** (select yang membuka hierarki). Keduanya belum
ada di `packages/ui`.

## Cakupan & Non-goals

Cakupan: dua komponen baru di `packages/ui` kategori `form` — `Cascader` dan
`TreeSelect` (compose `tree-view` + `select`/`popover`). Tanpa dependency baru.

Non-goals:

- Multi-tingkat bebas dengan data siklik/graf (hanya pohon `id`/`parentId`).
- Cascader dengan checkable multi-select bertingkat penuh (multi hanya leaf di v1).
- Pencarian lintas server — filter di data yang diberikan konsumen.

## Requirements — Cascader

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Dropdown kolom bertingkat: memilih opsi membuka kolom anak di sebelahnya; pilihan leaf menutup dan mengisi nilai. | must | Alur 3 tingkat teramati di scenario (test). |
| FR-002 | Nilai bertingkat tampil di trigger (mis. "ID · Jawa Barat · Bandung") dengan opsi tampil penuh atau level terakhir. | must | Kedua mode tampilan nilai terverifikasi test. |
| FR-003 | Lazy load anak (callback konsumen) dengan state loading per kolom. | should | Kolom menampilkan loading saat fetch anak tiruan. |
| FR-004 | Pencarian/jump ke opsi (filter flat hasilnya). | could | Ketik memunculkan hasil flat; memilih hasil mengisi path lengkap. |
| FR-005 | Clearable, disabled, dan error state konsisten dengan pola form DS. | must | Ketiga state teramati di showcase. |
| FR-006 | Aksesibilitas: navigasi panah antar kolom/opsi, ARIA terbenar, Escape menutup. | must | Audit a11y lolos. |

## Requirements — Tree Select

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-007 | Trigger bergaya select membuka popover berisi `tree-view` existing; memilih node mengisi nilai dan menutup. | must | Pilih node mengubah nilai; popover tertutup (test). |
| FR-008 | Path ke node terpilih otomatis ter-expand saat popover dibuka. | must | Buka popover pada node dalam → ancestors terlihat ter-expand. |
| FR-009 | Mode single dan multiple (multiple memakai `tag-input` sebagai tampilan nilai). | must | Kedua mode terverifikasi test. |
| FR-010 | Clearable dan searchable (filter node berdasar label). | should | Filter menyaring node; clear mengosongkan nilai. |
| FR-011 | State matrix: loading, empty (tanpa data), error; aksesibilitas setara cascader. | must | State + audit a11y lolos di scenario. |

## Basis Compose

- `form/select.tsx` + `overlay/popover.tsx` (trigger & panel), `dnd/tree-view.tsx`
  (isi TreeSelect), `form/tag-input.tsx` (nilai multiple), `base/skeleton.tsx`,
  `feedback/empty-state.tsx`, `base/scroll-area.tsx`.

## Rencana Story

- Story 1: `008-01` — `Cascader` (FR-001–FR-006).
- Story 2: `008-02` — `TreeSelect` (FR-007–FR-011).
- Bila perlu dipadatkan, TreeSelect boleh menyusul di sesi terpisah — keduanya
  independen.
- Nomor `008` dipakai sebagai seri lightweight track (tidak menunjuk PRD penuh); dicatat di `docs/BACKLOG.md`.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | FR-004 (searchable cascader) masuk v1? | answered — masuk v1 sebagai `could` |
| 2 | TreeSelect multiple: batas jumlah tag + collapse "+N" perlu default? | answered — maks. 3 tag ditampilkan, sisanya collapse "+N" |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-20 | Draft awal dari roadmap RM-03 |
| 2026-11-20 | **Approved** — screen S-005.31, story 008-01/008-02, OQ#1-#2 dijawab |
