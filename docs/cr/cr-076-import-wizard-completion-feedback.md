# CR-076 — Import Wizard: Lifecycle Selesai dan Feedback Konfirmasi

**Status:** approved (2026-11-25; implementasi belum dimulai)  
**Sumber:** audit UI/UX `/improve-ui` Import Wizard, 2026-11-25 — cluster flow  
**Ref:** `docs/prd/014-import-wizard.md` (FR-004/005/008/009), `docs/design/import-wizard.md`, story 014-03, S-005.37.04  
**Prioritas:** tinggi; dapat dikerjakan sebelum CR-077–081.

## Temuan

Lokasi relatif di bawah berada dalam `apps/showcase/src/app/(docs)/patterns/import-wizard/`.

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:188,214` | Setelah submit sukses, klik Upload membuka form awal tetapi judul/live region tetap selesai dan Back tetap disabled. Terverifikasi di browser. | Jadikan completion state terminal dengan aksi restart eksplisit. |
| 2 | major | `page.tsx:283`, `_components/confirm-step.tsx:82` | Setelah fail-policy ditolak, pindah ke skip-policy mengaktifkan Submit tetapi pesan penolakan lama tetap tampil. Terverifikasi di browser. | Hapus penolakan ketika input pembentuk rencana berubah; tampilkan alasan aktual. |
| 3 | major | `_components/confirm-step.tsx:60`, `_lib/submit.ts:23` | Baris invalid dapat dihitung pada skipped sekaligus failed; label “akan diimpor” muncul walau submit diblokir. | Bedakan valid/invalid dari hasil kebijakan, tanpa mengubah kontrak ImportResult. |

## Perubahan yang Diusulkan

- **Sebelum → sesudah:** stepper masih dapat mengubah langkah sesudah sukses → selesai bersifat terminal; stepper hanya menunjukkan posisi terakhir dan tidak menyediakan navigasi edit. `Start another import` mengembalikan wizard ke awal dan membersihkan hasil aktif/penolakan.
- Sebelum selesai, navigasi mundur tetap mempertahankan mapping dan opsi sesuai D6; jangan menyamakan Back dengan restart.
- Penolakan submit tidak boleh bertahan setelah perubahan policy, mapping, atau sumber membuat alasan lama tidak relevan. Pesan gate tetap menjelaskan alasan pemblokiran.
- Ringkasan menjelaskan jumlah valid, invalid, dan tindakan kebijakan. Jangan menjumlahkan skipped dan failed sebagai dua kelompok berbeda bila menunjuk baris yang sama. Pertahankan tipe dan makna keluaran `ImportResult`.
- Scope: route, `_components/confirm-step.tsx`, helper rencana bila perlu, serta test co-located. Tidak menambah backend/callback produksi atau mengubah komponen Stepper shared.
- Klaim simulasi/recipe dan seluruh penerjemahan ditangani CR-079; layout dan ikon ringkasan ditangani CR-080.

## Acceptance Criteria

- Given hasil valid sudah selesai, when pengguna mencoba stepper, then form lama tidak terbuka dan heading/live region tetap konsisten dengan completion.
- Given completion, when `Start another import` dipilih, then langkah Upload aktif tanpa hasil/penolakan lama dan fokus menuju heading awal.
- Given penolakan fail-policy dengan baris invalid, when policy diubah menjadi skip, then penolakan lama hilang, ringkasan sesuai rencana baru, dan submit hanya menghasilkan baris valid.
- Given navigasi mundur sebelum submit, when kembali ke mapping, then mapping dan opsi tidak hilang.

## Tasks

- [x] Lindungi navigasi sesudah completion dan definisikan reset hasil aktif; pertahankan histori demo hanya bila diberi label sebagai histori.
- [x] Sinkronkan rejection dengan perubahan sumber/mapping/policy; perjelas hitungan dan kondisi submit.
- [x] Tambah regression test success → stepper, success → restart, fail → skip, revisi mapping, zero-valid, dan backward-state preservation.
- [ ] Verifikasi focus/live region dan semua state di light/dark, termasuk invalid-skip dan invalid-fail. (Belum diverifikasi di browser; test jsdom saja.)

## Keputusan

| # | Usulan | Alasan |
|---|---|---|
| 1 | Completion terminal sampai restart eksplisit. | Mencegah status sukses melekat pada data yang kembali diedit. |
| 2 | Pertahankan kontrak ImportResult dan default skip. | Perbaikan feedback bukan perubahan kontrak domain. |

## Design System Checks

- [ ] Token semantik; kontras teks light/dark ≥4,5:1; feedback tidak hanya warna.
- [ ] Fokus, live region, loading/empty/error/success dan gate tidak regresi.
- [ ] API publik/ekspor shared tidak berubah.
- [ ] Test targeted, lalu `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build`; catat baseline terpisah dan build dari salinan bila dev server aktif.

## Eksekusi

Branch: `cr-076-import-wizard-completion-feedback`  
Commit: `fix: align import wizard completion and feedback [CR-076]`

- [x] CR disetujui user dan branch dibuat.
- [ ] Implementasi/verifikasi selesai; checklist dan BACKLOG/STATUS diperbarui; hanya user menetapkan done. (Implementasi dan test sudah; verifikasi browser light/dark belum.)
- [x] Append STATUS-LOG (`YYYY-MM-DD — ringkasan — referensi`); `node scripts/check-status-log.mjs` hijau sebelum commit.
