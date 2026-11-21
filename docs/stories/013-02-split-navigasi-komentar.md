# 013-02 — Mode split + navigasi hunk + slot komentar

Status: approved
PRD: `docs/prd/013-diff-viewer.md` (approved, gate 1)
Design: `docs/design/wireframes/diff-viewer.md` (approved, gate 2) + `docs/design/flows/diff-viewer.mmd`
FR: `FR-001` (split), `FR-005`, `FR-006`
Screens: `S-005.36`
Goal: `DiffViewer` layak-review — toggle unified/split dengan gutter sejajar, navigasi hunk via keyboard + live region + daftar SR, dan slot komentar render prop tanpa state internal.

## Acceptance Criteria

### AC-01 — Toggle unified/split satu kontrol

**Given** diff 2 file dalam mode unified
**When** segmented diganti ke Split lalu kembali
**Then** unified = satu kolom gutter ganda; split = dua kolom pasangan sejajar tinggi sama; fokus tetap di kontrol — diverifikasi test (FR-001, S-005.36)

### AC-02 — Split sejajar + fallback stacked di mobile

**Given** baris tambah/hapus/konteks dalam mode split
**When** dibuka `≥md` dan `<md`
**Then** tiap kolom punya gutter bernomor sendiri + sel blank sisi kosong; `<md` otomatis stacked-unified + badge Lama/Baru per baris; toggle tetap tampil — diverifikasi test (FR-001, FR-002, S-005.36)

### AC-03 — Navigasi hunk keyboard + tombol + live region

**Given** diff 5 hunk lintas 2 file
**When** `n`/`p` atau tombol [Hunk ◀ 2/5 ▶] ditekan
**Then** hunk aktif berpindah + ring `primary`; live region polite "Hunk 2 dari 5: `<file>`"; `Enter`/`Space` di header melipat/membuka — diverifikasi test (FR-005, S-005.36)

### AC-04 — Daftar hunk SR + label baris non-warna-saja

**Given** screen reader tanpa pointer
**When** daftar hunk dan baris diff dibaca
**Then** `ol` visually-hidden berisi tombol per hunk ("Hunk N: `<file>` +A −D"); baris bernama `aria-label` ("Baris 14 ditambah: …" / "Baris 13 dihapus: …"); `assertive` hanya error parse — diverifikasi test (FR-005, S-005.36)

### AC-05 — Slot komentar render prop tanpa state internal

**Given** `renderComment` mock yang mengembalikan box komentar
**When** baris tambah/konteks dirender (unified + split)
**Then** slot tampil di bawah baris (split: kolom pemilik sisi); `Tab` mencapai slot; baris tanpa slot tidak focusable; tidak ada state komentar di dalam komponen — diverifikasi test (FR-006, S-005.36)

## Tasks

- [ ] Varian `mode="split"`: layout dua kolom + blank cell + stacked `<md` (wireframe §2.3, K4)
- [ ] Toolbar: segmented toggle + tombol [Hunk ◀ N/M ▶] + [Lipat semua]/[Buka semua] (wireframe §1)
- [ ] Keyboard `n`/`p` + live region posisi + daftar SR `ol` + `aria-label` baris (wireframe §4)
- [ ] Prop `renderComment({ file, hunkId, lineKey, type })` + contract loc (wireframe §2.4)
- [ ] Test co-located: toggle mode, sejajar split + stacked, keyboard map + live, SR roles, slot tanpa state
- [ ] Docs: catat kontrak `renderComment` + perilaku `<md` di story

## Dependencies

- Story/CR lain: membutuhkan 013-01 (fondasi parser + unified + collapse)
- Package: tanpa dependency/token baru

## Notes

- Risiko: pasangan split tidak sejajar saat konten panjang — mitigasi `stretch` + wrap + test snapshot tinggi
- Keputusan: K4 stacked mobile; K2 tanpa highlight tetap (badge bahasa saja); showcase + audit di 013-03
