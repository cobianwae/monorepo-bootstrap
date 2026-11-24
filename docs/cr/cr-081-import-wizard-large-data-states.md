# CR-081 — Import Wizard: Responsivitas Data Besar dan Cakupan State

**Status:** approved (2026-11-25; implementasi belum dimulai)  
**Sumber:** audit UI/UX `/improve-ui` Import Wizard, 2026-11-25 — cluster performa/state  
**Ref:** `docs/prd/014-import-wizard.md` (FR-001/008/011), `docs/design/import-wizard.md` (D2/D8, §3), S-005.37.01–.04  
**Urutan usulan:** setelah lifecycle stabil pada CR-076; bukan izin menambah dependency atau mengubah konfigurasi build.

## Temuan

Lokasi relatif berada dalam `apps/showcase/src/app/(docs)/patterns/import-wizard/`.

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `_lib/parse-csv.ts:69,95` | FileReader membaca penuh lalu Papa.parse string di main thread; worker/streaming desain belum diterapkan. Ini risiko source, belum hasil benchmark freeze. | Pulihkan pemrosesan bertahap/nonblocking sesuai desain dengan PapaParse existing dan lifecycle pembatalan yang benar. |
| 2 | major | `page.tsx:190–193` | Validasi seluruh dataset dihitung ulang setiap render, termasuk perubahan filter/pagination/policy. | Memo berdasarkan data/mapping/fields; perubahan presentasi tidak memvalidasi ulang seluruh sumber. |
| 3 | minor | `_components/upload-step.tsx:147–153` | Progress ada, skeleton yang dijanjikan D8 belum ada. | Sediakan placeholder loading yang sesuai anatomy dan announcement progres jujur. |
| 4 | minor | `_components/demo-panel.tsx:8–15`, `_lib/demo-datasets.ts:90–95` | Dataset parse-error tidak diekspos; test belum mencakup lifecycle request besar/stale. | Tambah demo parse-error yang deterministik dan regression request/cancel. |

## Perubahan yang Diusulkan

- **Sebelum → sesudah:** render presentasional mengulang validasi penuh → memo validasi bergantung hanya pada input relevan; perubahan mapping/sumber tetap menghitung ulang.
- Parse file besar bertahap/off-main-thread memakai PapaParse yang sudah terpasang; pertahankan auto/manual delimiter, skip-empty, hasil identik, dan soft warning5MB/10k. Validasi dataset besar harus memberi kesempatan UI merespons, bukan hanya memindahkan parsing lalu memblokir di validasi.
- Ukur baseline dan hasil pada dataset1k/10k serta >10k yang melewati threshold; catat perangkat/browser, waktu, dan respons interaksi. Target desain <100ms untuk interaksi preview sekitar1k baris; jangan mengklaim tercapai tanpa bukti.
- Request lama tidak boleh menimpa sumber baru setelah reupload, demo baru, delimiter berubah atau restart; batalkan resource parser/worker bila relevan dan bersihkan saat unmount.
- Progres berbasis data nyata bila tersedia; gunakan status indeterminate jika jumlah belum diketahui. Skeleton tidak menggeser layout besar dan tidak beranimasi bila reduced motion.
- Scope: page, util parse/validate, upload/demo state, dataset dan test lokal. Tanpa dependency baru, root build config, API publik shared, hard limit baru atau transformasi domain tambahan.
- Jika worker membutuhkan konfigurasi build/dependency baru atau strategi tidak muat satu sesi, **berhenti dan minta konfirmasi pemecahan CR/rencana**, bukan fallback diam-diam yang tetap memblokir atau mengubah desain approved.

## Acceptance Criteria

- Given dataset tetap, when filter/page/policy berubah, then validasi penuh tidak diulang; perubahan mapping/sumber tetap memperbarui hasil dengan benar.
- Given pemrosesan besar sedang berlangsung, when sumber diganti/restart, then hasil request lama tidak muncul dan UI tetap memberi feedback.
- Given sumber >10k baris, when selesai, then warning tampil, tidak ada truncation diam-diam, hasil validasi konsisten dengan fixture pembanding, dan bukti responsivitas dicatat.
- Given demo slow/parse-error/empty, when dipilih, then loading+progres/skeleton, error+recovery, dan empty state dapat diamati dengan keyboard serta light/dark.

## Tasks

- [ ] Ukur baseline; pilih rencana worker/chunk memakai dependency existing dan konfirmasi bila menyentuh pagar scope.
- [ ] Memo validasi; tambah test bahwa filter/pagination/policy tidak memicu recompute dan mapping baru menginvalidasi cache.
- [ ] Implement pemrosesan bertahap, pembatalan dan stale-result protection; uji equivalence hasil, warning threshold, pergantian delimiter dan unmount.
- [ ] Tambah skeleton serta demo parse-error; uji semua state dan reduced motion.
- [ ] Catat benchmark sebelum/sesudah dan keterbatasan; verifikasi1k/10k/>10k tanpa kehilangan baris.

## Keputusan

| # | Usulan | Alasan |
|---|---|---|
| 1 | Pulihkan perilaku desain, bukan mengubah soft limit menjadi hard block. | Menghindari perbaikan performa dengan mengurangi kapabilitas tanpa persetujuan. |
| 2 | Pisahkan bukti source, benchmark, dan coverage state. | Audit awal tidak membuktikan freeze atau jaminan target performa. |

## Design System Checks

- [ ] Loading/empty/error/success dan progres aksesibel; keyboard/fokus dan reduced motion terjaga.
- [ ] Token existing serta light/dark/kontras terverifikasi.
- [ ] Hasil mapping/validasi/ImportResult tetap kompatibel; tanpa dependency atau perubahan build baru.
- [ ] Test util/route targeted, lalu `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build`; baseline dicatat terpisah.

## Eksekusi

Branch: `cr-081-import-wizard-large-data-states`  
Commit: `fix: improve import wizard large data responsiveness [CR-081]`

- [ ] CR dan rencana teknis disetujui user; branch dibuat.
- [ ] Implementasi/verifikasi selesai; checklist dan BACKLOG/STATUS diperbarui; hanya user menetapkan done.
- [ ] Append STATUS-LOG; `node scripts/check-status-log.mjs` hijau sebelum commit.
