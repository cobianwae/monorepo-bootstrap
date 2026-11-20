# Spec Singkat — Transfer List (RM-02)

Status: approved
Tanggal: 2026-11-20
Screen: `S-005.30` Transfer List (`/patterns/transfer-list`)
Track: lightweight — spec singkat + 1 story (menggantikan PRD penuh)
Sumber: roadmap RM-02 (`docs/discussions/component-roadmap.md`)

## Masalah

Pemilihan banyak item antar dua kumpulan (assign role, anggota tim, permission) adalah
kebutuhan berfrekuensi tinggi di admin tool. Praktik standar Ant Design / MUI X adalah
*transfer list* (dual listbox). Konsumen DS hari ini menyusun dua panel + tombol pindah
sendiri — tanpa pola a11y listbox yang benar dan tanpa konsistensi visual.

## Cakupan & Non-goals

Cakupan: komponen `TransferList` baru di `packages/ui` (kategori `form`), controlled,
tanpa dependency baru.

Non-goals:

- Drag-and-drop antar panel (reorder dalam panel selected saja yang dievaluasi).
- Nested/tree item di dalam panel (butuh hierarki → jalur RM-03 tree select).
- Paginasi server-side bawaan — konsumen mengelola sumber datanya.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Dua panel (available / selected) dengan header, counter item, dan area list yang dapat di-scroll. | must | Counter mengikuti jumlah item tiap panel (test). |
| FR-002 | Memindah item: tombol pindah (→ / ←), double-click/double-tap, dan pemindahan semua (pindah semua yang tampil). | must | Ketiga cara mengubah isi panel dan counter (test). |
| FR-003 | Multi-select per panel (klik + shift/ctrl, checkbox opsional) sebagai dasar aksi pindah. | must | Seleksi ganda memindah semua item terpilih (test). |
| FR-004 | Pencarian/filter per panel memfilter tampilan tanpa mengubah nilai terkontrol. | should | Filter hanya menyembunyikan item; nilai tetap utuh. |
| FR-005 | API controlled: `value` (array item terpilih) + `onChange`; item didefinisikan konsumen (id, label, disabled). | must | Story demo mengelola state di luar komponen. |
| FR-006 | Aksesibilitas: pola ARIA dua listbox, pindah via keyboard, label panel terbaca screen reader, fokus berpindah logis setelah aksi. | must | Audit a11y lolos; seluruh alur terjangkau tanpa mouse. |
| FR-007 | State matrix: loading (skeleton dua panel), empty per panel, error. | must | Tiga state teramati di scenario showcase. |
| FR-008 | Reorder item di panel selected (basis `@dnd-kit/*`, alternatif keyboard). | could | Reorder mengubah urutan `value`; jalur keyboard tetap tersedia. |
| FR-009 | Showcase scenario (assign role) dengan state lengkap, light & dark. | must | Route scenario tersedia, lolos smoke build. |

## Basis Compose

- `base/button.tsx` (aksi pindah), `base/checkbox.tsx` (seleksi), `base/input.tsx`
  atau `form/search-input.tsx` (filter), `dnd/sortable-list.tsx` (reorder, FR-008),
  `base/skeleton.tsx` + `feedback/empty-state.tsx` (state), `base/badge.tsx` (counter).

## Rencana Story

- 1 story: `007-01` — implementasi komponen + test + demo form + scenario showcase.
- Nomor `007` dipakai sebagai seri lightweight track (tidak menunjuk PRD penuh); dicatat di `docs/BACKLOG.md`.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | FR-008 (reorder) masuk v1 atau iterasi berikut? | answered — ditunda ke iterasi berikut (tetap `could`); v1 tanpa reorder |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-20 | Draft awal dari roadmap RM-02 |
| 2026-11-20 | **Approved** — screen S-005.30, story 007-01, FR-008 ditunda |
