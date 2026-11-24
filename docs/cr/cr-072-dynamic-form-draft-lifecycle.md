# CR-072 — Siklus Draft, Reset, dan Submit Dynamic Form

**Status:** approved  
**Sumber:** audit `/improve-ui` — cluster B  
**Ref:** S-005.09, `apps/showcase/src/app/(docs)/patterns/dynamic-form/page.tsx`  
**Urutan usulan:** setelah CR-071; CR-073 menambahkan regresi role dan daftar anggota kosong terhadap kontrak draft ini.

## Temuan

Lokasi `page.tsx` di tabel merujuk pada route Dynamic Form sebelum perubahan.

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:101–127,177–186,241–255,582–594` | Browser menampilkan `Unsaved changes` dan `Draft saved` bersamaan. Saat write melempar `QuotaExceededError`, status tetap mengklaim tersimpan. | Gunakan satu status draft; nilai `isDirty` bukan bukti write berhasil atau gagal. |
| 2 | major | `page.tsx:188–209` | Reset langsung membuang draft tanpa konfirmasi dan meninggalkan timestamp. Submit berhasil menghapus draft, tetapi timer autosave menulisnya kembali. Toast menyatakan proyek dibuat padahal tidak ada backend. | Konfirmasi reset yang membuang perubahan, cancel timer setelah aksi berhasil, dan jelaskan submit sebagai simulasi. |
| 3 | major | `page.tsx:101–110,133–167` | Restore mengandalkan JSON cast; nilai tanggal yang sengaja dikosongkan dapat diganti seed. Draft tidak harus valid untuk bisa dilanjutkan. | Bedakan tidak ada draft dari draft parsial atau nilai kosong; pulihkan nilai yang aman tanpa mewajibkan valid untuk submit. |

## Perubahan yang Diusulkan

- **Sebelum → sesudah:** badge dan pesan footer yang tidak sinkron → satu status yang mencerminkan data terbaru: belum ada draft, menunggu autosave, tersimpan/dipulihkan di browser ini, atau gagal dibaca/disimpan/dihapus. Umumkan perubahan bermakna melalui status live yang tidak mengganggu input. Contoh: `Draft saved on this browser.` dan `Couldn't save this draft. Your changes are still in this tab.`
- Draft terbaru dipulihkan setelah reload, termasuk field kosong dan input belum valid yang formatnya masih aman. Data rusak/tidak dapat dibaca tidak membuat demo gagal render; tampilkan keadaan yang sesuai tanpa klaim bahwa draft berhasil dipulihkan. Pertahankan data contoh yang deterministik bila tidak ada draft.
- `Reset demo` memakai `AlertDialog` bila perubahan atau draft akan hilang. Cancel mempertahankan isi, draft, dan fokus kembali ke trigger; konfirmasi mengembalikan seed dan membersihkan status lama. Hilangkan jeda loading buatan.
- `Submit demo` memvalidasi input dan tidak membuat proyek atau mengirim notifikasi. Submit invalid tidak membuang draft. Setelah submit valid, batalkan write tertunda sebelum menghapus draft; draft tidak muncul ulang sampai ada edit baru. Bila penghapusan storage gagal, jangan klaim draft bersih.
- Scope: route Dynamic Form, tes co-located, dan komponen yang sudah tersedia (`AlertDialog`, `Button`, toast/status). Tidak ada backend, perubahan kontrak publik, dependency baru, atau navigation guard.

## Tasks

- [ ] Ikat debounce ke perubahan nilai; write terbaru saja yang boleh menandai status tersimpan. Batalkan write tertunda saat aksi reset/submit dikonfirmasi dan saat route unmount.
- [ ] Tangani hasil baca/tulis/hapus storage secara eksplisit. Bedakan nilai kosong dari fallback seed dan uji pemulihan field biasa serta tanggal yang dihapus. Penanganan `members: []` diuji di CR-073.
- [ ] Implementasikan satu status live, reset terkonfirmasi, dan copy submit Inggris yang menjelaskan simulasi serta batas penyimpanan.
- [ ] Tambahkan regresi debounce dan reload, kegagalan storage, batal/konfirmasi reset, submit invalid, serta submit valid sebelum debounce selesai. Verifikasi dialog dan status di browser.

## Keputusan

| # | Usulan | Alasan |
|---|---|---|
| 1 | Gunakan penyimpanan lokal dan debounce yang sudah ada; bedakan status form dari status penyimpanan. | Demo menunjukkan autosave tanpa menjanjikan sinkronisasi atau penyimpanan server. |
| 2 | Reset kembali ke seed; submit valid mempertahankan nilai di layar sampai ada edit baru atau reset. | Demo bisa diulang dan pengguna bisa melihat nilai yang baru disimulasikan tanpa draft langsung tercipta lagi. |

## Design System Checks

- [ ] Status pending/saved/error dapat dipahami tanpa warna; token teks lolos kontras AA di light/dark, tanpa warna literal.
- [ ] Dialog dapat dibuka, dibatalkan, dan dikonfirmasi dengan keyboard; fokus pulih setelah ditutup.
- [ ] Jalankan tes route, `pnpm typecheck`, `pnpm lint`, `pnpm test`, dan `pnpm -C apps/showcase build`; catat baseline terpisah. Gunakan salinan sementara bila dev server aktif.

## Eksekusi

Branch: `cr-072-dynamic-form-draft-lifecycle`  
Commit: `fix: make dynamic form draft lifecycle reliable [CR-072]`

- [ ] CR disetujui user dan branch dibuat.
- [ ] Implementasi dan verifikasi selesai; checklist CR dan status di `docs/BACKLOG.md` serta `docs/STATUS.md` diperbarui sesuai workflow.
- [ ] Append `docs/STATUS-LOG.md` (`YYYY-MM-DD — ringkasan — referensi`); jalankan `node scripts/check-status-log.mjs` sebelum commit.
