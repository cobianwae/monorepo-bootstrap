# CR-008 — Perapian dokumen PRD 001 & design upload-queue

Status: done
Sumber: review
Refness: `docs/prd/001-upload-queue.md:81-82`, `docs/design/upload-queue.md:18`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | minor | `docs/prd/001-upload-queue.md:81-82` | FR-015 disisipkan antara FR-008 dan FR-009, melanggar urutan FR monoton. | Renumber FR-015 → FR-009 (dan sesuaikan nomor FR-009–FR-014 berikutnya) atau pindahkan baris ke akhir tabel; update semua rujukan FR di `docs/stories/001-01-*`, `docs/stories/001-02-*`, `docs/design/upload-queue.md`. |
| 2 | minor | `docs/design/upload-queue.md:18` | Rujukan "CR-06" seharusnya `CR-006` (format ID CR yang benar). | Perbaiki menjadi `CR-006`. |

## Perubahan yang Diusulkan

- Renumber FR pada tabel Requirements PRD 001 agar monoton, tanpa mengubah isi requirement.
- Perbaiki rujukan `CR-06` → `CR-006` di design upload-queue.
- Perbarui semua rujukan FR di story 001-01/001-02 dan design (tidak mengubah AC yang sudah `done` kecuali penyebutan FR).

## Tasks (jalur small-fix)

- [x] Pindahkan FR-015 ke akhir tabel PRD 001 (urutan monoton FR-001–FR-015, tanpa renumber — keputusan user).
- [x] Perbaiki rujukan `CR-06` → `CR-006` di design upload-queue.
- [x] Perbarui rujukan FR di story 001-01/001-02 dan design bila terdampak.
- [x] Verifikasi `node scripts/check-status-log.mjs` hijau dan `pnpm verify` (atau setidaknya typecheck/lint/test) hijau.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Ubah hanya nomor FR dan rujukan, bukan isi requirement | Artefak PRD 001 `approved` dan story `done` — perubahan isi butuh CR terpisah |
| 2 | Perbaiki rujukan CR | Format ID `CR-NNN` wajib konsisten (AGENTS.md) |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-008-prd001-cleanup`
Commit: `docs: perapian dokumen PRD 001 dan design upload-queue [CR-008]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
