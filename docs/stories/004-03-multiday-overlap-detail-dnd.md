# 004-03 — Multi-hari + konflik overlap + detail event + DnD

Status: done
PRD: `docs/prd/004-calendar-scheduler.md`
Design: `docs/design/calendar-scheduler.md` (approved, gate 2)
FR: `FR-003` (multi-hari), `FR-004`, `FR-005`, `FR-013` (could)
Screens: `S-005.04`, `M-006`
Goal: Menyelesaikan interaksi event — konferensi 3 hari berlanjut antar sel, bentrok sejam tampil berdampingan dan tetap terjangkau keyboard, klik event membuka detail dengan aksi milik konsumen, plus pindah via drag yang setara keyboard.

## Acceptance Criteria

### AC-01 — Event multi-hari berlanjut antar hari

**Given** event 3 hari (mis. konferensi) melewati batas hari
**When** dirender di month, week, dan day
**Then** tampil di tiap sel/blok berurutan dengan penanda lanjutan (`▸/◂` + teks, bukan warna saja); klik segmen mana pun memanggil `onSelectEvent` dengan payload event utuh (FR-003, S-005.04)

### AC-02 — Konflik tampil berdampingan dan terjangkau

**Given** dua event tumpang di jam yang sama
**When** dirender di week/day
**Then** blok tampil berdampingan sama lebar + indikator "2 bentrok" di header slot; keduanya terjangkau via Tab dan keyboard, masing-masing membuka detail sendiri; tidak ada event tertutup penuh (FR-004, S-005.04.02)

### AC-03 — Detail event + aksi sekunder milik konsumen

**Given** event fokus di grid atau agenda
**When** user klik / Enter / Space
**Then** `onSelectEvent(event)` terpanggil dan detail M-006 tampil (popover desktop, dialog/sheet mobile: judul, waktu, lokasi, kategori, deskripsi); aksi edit/hapus diserahkan konsumen via `onAction`/`renderEventActions`; Esc menutup dan fokus kembali ke event asal (FR-005, M-006)

### AC-04 — Drag-and-drop setara keyboard (could)

**Given** `editable` aktif dengan event yang bisa dipindah
**When** user menyeret blok ke slot lain (atau memakai menu "Pindah…" via keyboard)
**Then** `onEventDrop({id, start, end})` terpanggil dengan rentang baru; preview bayangan terlihat saat drag; operasi keyboard menghasilkan hasil identik (terverifikasi test); tanpa `editable`, drag nonaktif (FR-013, S-005.04.02)

## Tasks

- [x] Segmen multi-hari per hari kalender + penanda lanjutan (month chip, week/day blok absolut)
- [x] Algoritma interval-column konflik + indikator "n bentrok" + urutan Tab logis
- [x] M-006: popover desktop / dialog-sheet mobile + `renderEvent` + `onAction('edit'|'delete')` + focus-return
- [x] DnD internal (Pointer Events, gate `editable`) + menu "Pindah…" (dialog pilih hari + jam) + `onEventDrop`
- [x] Demo scenario: dataset konferensi 3 hari + 2 bentrok, toggle editable, mock handler log/toast
- [x] Test co-located: segmen multi-hari + payload utuh, overlap berdampingan + keduanya fokusable, `onSelectEvent`/`onAction`, `onEventDrop` drag + keyboard
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`

## Dependencies

- Story/CR lain: `004-01` (shell + month), `004-02` (time grid + slot)
- Package: compose `overlay/popover`, `base/badge`, `feedback/dialog`, `layout/sheet` existing; `editable` gate; tanpa dependency baru (bila butuh `@dnd-kit/*`, approval terpisah wajib)

## Notes

- Risiko: DnD internal vs `@dnd-kit/*` — mitigasi: Pointer Events minimal dulu (preview + drop); evaluasi kebutuhan library saat implementasi dengan approval.
- Keputusan: konten custom tidak boleh keluar dari token; warna kategori tetap lewat `category` semantik.
