# 006-03 — Mode + counter + state matrix

Status: review
PRD: `docs/prd/006-rich-text-editor.md`
Design: `docs/design/rich-text-editor.md`
FR: `FR-007`, `FR-008`, `FR-011`
Screens: `S-005.22`
Goal: Placeholder/disabled/readonly + counter 10.000 (peringatan) + matrix loading/empty/error hidup via props.

## Acceptance Criteria

### AC-01 — Placeholder, disabled, readonly

**Given** tiga instance: kosong, `mode=disabled`, `mode=readonly` dengan konten
**When** showcase merender ketiganya
**Then** empty menampilkan placeholder; disabled menonaktifkan toolbar+konten tanpa menghilangkan nilai; readonly menyembunyikan/mematikan toolbar tetapi konten tetap dibaca SR penuh (FR-007, S-005.22)

### AC-02 — Counter mendekati dan melewati batas

**Given** `maxLength=10000` default, `showCounter`
**When** user mengetik hingga 90% lalu melewati 100% (teks polos `getText()`)
**Then** 90% = gaya `warning` + teks "mendekati batas"; >100% = `destructive` + pesan "melewati batas N karakter" + `role=alert` sekali; mengetik tetap boleh (peringatan, bukan blokir) (FR-008, S-005.22)

### AC-03 — State matrix loading/empty/error

**Given** props `loading` / `value=""` / `error + onRetry` via panel demo
**When** showcase memicu tiap state
**Then** loading = skeleton toolbar+konten + `aria-busy` + teks SR "Memuat editor…"; empty = placeholder + hint; error = `alert` + [Coba lagi] memanggil `onRetry`; tanpa warna-saja (FR-011, S-005.22)

### AC-04 — Counter a11y + mode keyboard

**Given** keyboard + SR
**When** user menavigasi mode disabled/readonly dan counter berubah
**Then** konten `aria-describedby` counter; perubahan counter `role=status` polite; disabled dilewati fokus secara benar; readonly tetap dibaca (FR-007, FR-008, S-005.22)

## Tasks

- [x] Props `mode/placeholder/loading/error/onRetry/maxLength/showCounter`; hitung counter dari `getText()` di `onUpdate` (tanpa `character-count` baru)
- [x] Skeleton + `alert` + empty placeholder; `data-testid=rte-counter/rte-error/rte-empty`
- [x] Ambang 90%/100% + gaya `warning`/`destructive` + pesan teks; over-limit tidak memblokir ketik/simpan
- [x] Test: tiga mode, ambang counter, matrix loading/empty/error + retry, `aria-busy/describedby`
- [x] Showcase: sambungkan pemicu state ke draf S-005.22 (panel demo final di 006-05)

## Dependencies

- Story/CR lain: 006-01 (fondasi controlled)
- Package: tidak ada tambahan

## Notes

- Risiko: `getText()` vs HTML entity membuat selisih 1–2 char — mitigasi: definisikan counter = teks polos, dokumentasikan di showcase
- Keputusan: tanpa dep `character-count`; batas = peringatan (OQ#4, D7)
