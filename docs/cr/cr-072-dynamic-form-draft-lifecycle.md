# CR-072 — Siklus Draft, Reset, dan Submit Dynamic Form

**Status:** done (disetujui user 2026-11-25)
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

- [x] Ikat debounce ke perubahan nilai; write terbaru saja yang boleh menandai status tersimpan. Batalkan write tertunda saat aksi reset/submit dikonfirmasi dan saat route unmount.
- [x] Tangani hasil baca/tulis/hapus storage secara eksplisit. Bedakan nilai kosong dari fallback seed dan uji pemulihan field biasa serta tanggal yang dihapus. Penanganan `members: []` diuji di CR-073.
- [x] Implementasikan satu status live, reset terkonfirmasi, dan copy submit Inggris yang menjelaskan simulasi serta batas penyimpanan.
- [x] Tambahkan regresi debounce dan reload, kegagalan storage, batal/konfirmasi reset, submit invalid, serta submit valid sebelum debounce selesai. Verifikasi dialog dan status di browser.

## Keputusan

| # | Usulan | Alasan |
|---|---|---|
| 1 | Gunakan penyimpanan lokal dan debounce yang sudah ada; bedakan status form dari status penyimpanan. | Demo menunjukkan autosave tanpa menjanjikan sinkronisasi atau penyimpanan server. |
| 2 | Reset kembali ke seed; submit valid mempertahankan nilai di layar sampai ada edit baru atau reset. | Demo bisa diulang dan pengguna bisa melihat nilai yang baru disimulasikan tanpa draft langsung tercipta lagi. |

## Design System Checks

- [x] Status pending/saved/error dapat dipahami tanpa warna; token teks lolos kontras AA di light/dark, tanpa warna literal.
- [x] Dialog dapat dibuka, dibatalkan, dan dikonfirmasi dengan keyboard; fokus pulih setelah ditutup.
- [x] Jalankan tes route, `pnpm typecheck`, `pnpm lint`, `pnpm test`, dan `pnpm -C apps/showcase build`; catat baseline terpisah. Gunakan salinan sementara bila dev server aktif.

## Eksekusi

Branch: `cr-072-dynamic-form-draft-lifecycle`  
Commit: `fix: make dynamic form draft lifecycle reliable [CR-072]`

- [x] CR disetujui user dan branch dibuat.
- [x] Implementasi dan verifikasi selesai; checklist CR dan status di `docs/BACKLOG.md` serta `docs/STATUS.md` diperbarui sesuai workflow.
- [x] Append `docs/STATUS-LOG.md` (`YYYY-MM-DD — ringkasan — referensi`); jalankan `node scripts/check-status-log.mjs` sebelum commit.

## Hasil Implementasi dan Verifikasi — 2026-11-25

- Implementasi `6c85ab3` disetujui user dan ditetapkan **done** pada 2026-11-25; user mengizinkan merge ke `visual-polish` dan push. Hasil verifikasi di bawah berasal dari branch implementasi.
- Debounce 1,2 detik mengikuti snapshot nilai, bukan `isDirty`; perubahan status/validasi tidak menjadwalkan write baru. Cleanup unmount, reset terkonfirmasi, dan submit valid membatalkan timer. Submit mempertahankan nilai tanpa membuat draft sampai edit berikutnya.
- Restore membaca storage setelah mount dan memvalidasi bentuk data dengan skema draft terpisah dari validasi submit. String kosong, email belum valid, dan tanggal kosong dipertahankan; kickoff memakai `null` agar React Hook Form tidak mengembalikan tanggal seed. JSON/bentuk/tanggal rusak memakai seed dan status gagal baca.
- Satu status `role="status"`/`aria-live="polite"`/`aria-atomic="true"` menjelaskan empty/pending/saved/restored/read-error/save-error/delete-error. Tidak ada klaim berhasil menyimpan/menghapus ketika operasi melempar error.
- Tes route **19/19** lulus tanpa flag Node: mencakup debounce terbaru, remount, partial/empty field dan tanggal (range `null` maupun endpoint kosong), data rusak, gagal baca/tulis/hapus, cancel/confirm reset + fokus, unmount, submit invalid, serta submit valid sebelum debounce (termasuk gagal hapus).
- `pnpm typecheck`: hanya **12 TS2339 baseline** di `packages/ui/src/components/canvas/flow-editor.test.tsx`; `pnpm -C apps/showcase build:types` lulus. `pnpm lint` lulus. Build showcase **76/76** lulus dari worktree terpisah; `.next` dev server root tidak disentuh.
- `pnpm test` tanpa flag: tokens **10/10**, ui **714/714**, showcase **108/112** (sebelum tiga tambahan kasus bentuk/tanggal rusak/range kosong); empat kegagalan FlowEditor CR-019 adalah baseline `localStorage.getItem is not a function` pada Node 25. Ulang final dengan `NODE_OPTIONS=--no-experimental-webstorage pnpm test`: tokens **10/10**, ui **714/714**, showcase **115/115**, termasuk **19/19** route ini. Tidak mengubah konfigurasi workspace.
- Chromium headless pada build worktree port 4072: edit→saved→reload/restored, dialog via Enter, Cancel via Escape, Tab→Enter untuk konfirmasi, fokus kembali ke reset, dan status polite lulus. Cancel diuji light/dark; teks status `text-foreground` berkontras **18,80:1 light / 16,74:1 dark** terhadap permukaan aktual. Viewport 390×844 tidak overflow horizontal. Bukti sementara: `/tmp/opencode/cr-072-browser.mjs` dan `/tmp/opencode/cr-072-browser.png`; pembaca layar bersuara native belum diuji.
- Scope tetap route + tes + dokumen tracking. Regresi `members: []`, role, dan audit field/a11y lanjutan tetap CR-073.
