# 013-01 — Parser + render unified + header + state matrix

Status: approved
PRD: `docs/prd/013-diff-viewer.md` (approved, gate 1)
Design: `docs/design/wireframes/diff-viewer.md` (approved, gate 2) + `docs/design/flows/diff-viewer.mmd`
FR: `FR-001` (unified), `FR-002`, `FR-004`, `FR-007`, `FR-008`
Screens: `S-005.36`
Goal: Fondasi `DiffViewer` — util normalisasi hunk via `diff` (approved), render unified dengan gutter sejajar, header file + collapse, batas 500 baris, dan state matrix — semua teruji sebelum split/navigasi dibangun.

## Acceptance Criteria

### AC-01 — Parse string + JSON identik, patch rusak tanpa throw

**Given** patch unified-diff 2 file + struktur hunk JSON setara + patch rusak (header hunk cacat)
**When** `parseDiff` dijalankan atas ketiganya
**Then** string dan JSON ternormalisasi identik; rusak menghasilkan error terstruktur (penyebab + baris N) tanpa throw — diverifikasi test (FR-008, S-005.36)

### AC-02 — Render unified dengan gutter sejajar

**Given** hunk berisi baris konteks, tambah, dan hapus
**When** `mode="unified"` dibuka light dan dark
**Then** dua kolom nomor lama/baru selalu tampil (tambah = lama `–`, hapus = baru `–`); prefix `+`/`−`/spasi + label SR per baris; gutter tidak bergeser — diverifikasi test (FR-001, FR-002, S-005.36)

### AC-03 — Header file + collapse hunk dan file

**Given** diff 3 file dengan hitungan +/- dan label bahasa
**When** dibuka lalu header dilipat/dibuka via pointer dan `Enter`/`Space`
**Then** header menampilkan nama mono + badge bahasa + `+N`/`−M` (angka, bukan warna saja); hunk konteks terlipat default + [Tampilkan]; fokus tetap di header — diverifikasi test (FR-004, S-005.36)

### AC-04 — Batas 500 baris + muat bertahap

**Given** file 2000+ baris
**When** dibuka lalu tombol muat ditekan
**Then** 500 pertama ter-render + tombol "Muat 500 lagi (N tersisa)"; tiap penambahan tidak menghilangkan fokus + live region jumlah ter-render — diverifikasi test (FR-007, S-005.36)

### AC-05 — State matrix loading/empty/error

**Given** pemicu `loading`, patch kosong (0 perubahan), patch invalid
**When** dibuka via props/demo
**Then** loading = skeleton header + 8 baris + `aria-busy`; empty = `empty-state` "Tidak ada perubahan" `role="status"`; error = `alert` + penyebab + [Salin detail] `role="alert"` — diverifikasi test (FR-008, S-005.36)

## Tasks

- [ ] Tambah dependency `diff` (approved user 2026-11-21, design C1) ke `packages/ui`
- [ ] Buat `packages/ui/src/components/data-display/diff-viewer-parser.ts`: tipe `DiffFile/DiffHunk/DiffLine`, `parseDiff(input: string | DiffFile[])` + error terstruktur (design K1)
- [ ] Buat `data-display/diff-viewer.tsx`: props input ganda, `mode="unified"` default, `maxLines=500` (K3), `loading/error/onRetry`; render unified + header file + collapse (wireframe §2.1–§2.2, §2.5)
- [ ] Token §6 (bg `success/10` + `destructive/10`, teks `foreground`, prefix non-warna); tanpa token baru
- [ ] Test co-located: string=JSON, 3 input rusak, gutter sejajar, collapse default + toggle, batas 500 + muat lagi, 3 state
- [ ] Barrel export via `index.ts`; catat kontrak tipe + batas default di story

## Dependencies

- Story/CR lain: tidak menunggu story lain; menjadi fondasi 013-02
- Package: `diff` (baru, approved C1/gate 2)

## Notes

- Risiko: tipe bawaan `diff` vs `@types/diff` — mitigasi cek saat install, tambah types bila perlu (tanpa approval baru, scoped)
- Keputusan: K1 input ganda; K3 batas 500; K4–K5 + split + navigasi + slot komentar di 013-02
