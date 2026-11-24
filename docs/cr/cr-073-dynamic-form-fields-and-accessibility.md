# CR-073 — Field Dinamis, Validasi, dan Aksesibilitas Dynamic Form

**Status:** done (disetujui user 2026-11-25)  
**Sumber:** audit `/improve-ui` — cluster C  
**Ref:** S-005.09, `apps/showcase/src/app/(docs)/patterns/dynamic-form/page.tsx`, `docs/cr/cr-058-form-accessibility.md`  
**Urutan usulan:** setelah CR-071 dan CR-072 agar layout dan kontrak autosave sudah stabil.

## Temuan

Lokasi `page.tsx` di tabel merujuk pada route Dynamic Form sebelum perubahan.

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:161–166,517–559` | Memilih `Viewer` tetap menampilkan `Admin` dan tidak memicu autosave; edit lain kemudian menyimpan `viewer`. Setelah nol anggota disimpan, reload mengembalikan dua anggota contoh. | Kontrol role dari nilai form aktif; `members: []` tetap kosong saat restore, dengan CTA `Add member`. |
| 2 | major | `page.tsx:46–81,212–232,259–263`; `packages/ui/src/components/form/form.tsx:219–233` | Summary tanpa identitas field atau tautan; dua email invalid jadi pesan identik, sedangkan hitungan dapat ikut menghitung indeks kosong. Teks daftar summary diukur 3,94–4,11:1 terhadap latarnya pada delapan tema di light dan dark. | Gunakan summary lokal berisi nama field dan target fokus unik; pakai token dengan kontras AA. Pertahankan asosiasi error inline yang sudah ditangani CR-058. |
| 3 | major | `page.tsx:417–442,508–577` | Setelah penghapusan terakhir, fokus jatuh ke `body`; tombol hapus 36×36 px, label anggota hanya terbaca lewat ARIA, dan helper switch tidak terkait. | Tambahkan label terlihat, target 44×44 px, fokus deterministik, serta helper switch yang terhubung. |
| 4 | minor | `page.tsx:235,245,433` | Animasi route, status, atau panel bersyarat masih dapat berjalan saat reduced motion aktif. | Hilangkan pulsa status dan nonaktifkan animasi route/panel saat pengguna meminta reduced motion. |

## Perubahan yang Diusulkan

- **Sebelum → sesudah:** baris tanpa label terlihat → baris dengan `Email` dan `Role`, nama aksesibel yang membedakan anggota, nilai role langsung tersinkron, dan empty state ringkas dengan `Add member`. Nol anggota tetap valid. Setelah add, fokus ke email baru; setelah remove, ke email pada baris berikutnya, atau `Add member` bila tidak ada baris berikutnya.
- **Sebelum → sesudah:** daftar pesan generik → summary Inggris berisi field yang harus diperbaiki, termasuk nomor anggota bila relevan, dengan tautan yang memindahkan fokus ke kontrol terkait. Saat submit invalid, arahkan fokus ke summary. Jangan mengulang hitungan error yang tidak akurat. Pertahankan `aria-invalid`, asosiasi label/error, dan focus ring.
- Beri petunjuk required/optional dan batas sebelum submit, lalu validasi field yang sudah disentuh tanpa menandai form baru sebagai invalid. Selaraskan pesan batas dengan schema: deskripsi maksimal 200 karakter, rentang tanggal menerima hari yang sama, dan batas angka ditulis dengan angka serta satuan yang jelas. Hubungkan helper `Email notifications` ke switch.
- Scope: route Dynamic Form dan tes co-located. Gunakan pola/komponen DS yang sudah ada dan markup summary lokal bila dibutuhkan untuk navigasi error. Tidak mengubah API `FormErrorSummary`, validator global, token, atau halaman lain.

## Tasks

- [x] Hubungkan Select role ke nilai/handler form; tambah tes role-only change, autosave, reload, dan daftar kosong yang tetap kosong. Uji juga penambahan kembali dari empty state.
- [x] Tambahkan label terlihat dan pengelolaan fokus setelah add/remove; pastikan tombol hapus 44×44 px tanpa overflow pada 320 px.
- [x] Hubungkan summary ke field native dan trigger komposit; uji dua email invalid, klik/Enter pada tautan summary, validasi setelah blur, form baru tanpa error, serta hubungan helper/error.
- [x] Verifikasi keyboard, focus ring, reduced motion, dan contrast untuk summary/inline error pada light/dark. Ukur kontras lagi pada permukaan aktual setelah perubahan, untuk delapan tema.

## Keputusan

| # | Usulan | Alasan |
|---|---|---|
| 1 | Rinci error dengan identitas field dan target fokus; singkirkan indikator hitungan yang redundan. | Pengguna bisa langsung menemukan field yang perlu diperbaiki, termasuk bila beberapa baris punya pesan sama. |
| 2 | Jangan mengubah `FormErrorSummary` global. | Perubahan navigasi dan kontras summary dibatasi pada Dynamic Form; caller lain tidak terdampak. |

## Design System Checks

- [x] Teks normal mencapai ≥4,5:1 pada light/dark; error tidak hanya dibedakan dengan warna; gunakan token semantik, tanpa warna literal.
- [x] State kosong, invalid, dan fokus keyboard berfungsi; asosiasi label/error yang sudah ada tidak regresi; tidak ada perubahan API publik.
- [x] Jalankan tes route, `pnpm typecheck`, `pnpm lint`, `pnpm test`, dan `pnpm -C apps/showcase build`; catat baseline terpisah. Gunakan salinan sementara bila dev server aktif.

## Eksekusi

Branch: `cr-073-dynamic-form-fields-and-accessibility`  
Commit: `fix: improve dynamic form fields and accessibility [CR-073]`

- [x] CR disetujui user dan branch dibuat.
- [x] Implementasi dan verifikasi selesai; checklist CR dan status di `docs/BACKLOG.md` serta `docs/STATUS.md` diperbarui sesuai workflow.
- [x] Append `docs/STATUS-LOG.md` (`YYYY-MM-DD — ringkasan — referensi`); jalankan `node scripts/check-status-log.mjs` sebelum commit.

## Hasil Implementasi dan Verifikasi — 2026-11-25

- Rencana disetujui user; branch dibuat dari `visual-polish` `32a245e` dalam worktree `arah-story`. Implementasi `83c8234` disetujui dan ditetapkan **done** oleh user pada 2026-11-25, dengan izin merge ke `visual-polish` dan push.
- Blast radius: Graphify `graph_stats` dan `get_neighbors(DynamicFormPage)` menunjukkan pemanggilan komponen DS serta tes route. Graph pada `80a6a92` tertinggal dari base; temuan dicocokkan ke kode aktual. Perubahan hanya route, tes co-located, dan tracking; tanpa perubahan API publik, dependency, validator global, token, atau halaman lain.
- Role memakai `Controller` dengan nilai aktif dan `onChange` RHF sehingga perubahan role saja memicu autosave. Restore `members: []` sudah benar sejak CR-072 (`??`); dipertahankan dan diberi regresi autosave/remount serta add kembali.
- Label Email/Role terlihat, nama aksesibel unik, tombol hapus 44×44 px. Add memfokuskan email baru; remove memfokuskan email berikutnya pada indeks yang sama, atau Add member bila tidak ada baris berikutnya.
- Summary lokal memakai label field, nomor anggota, tautan fragmen dengan fokus eksplisit, serta permukaan `bg-card` dan `text-foreground`. Submit invalid memfokuskan summary tanpa mengambil alih fokus saat blur. Hitungan error berbasis panjang array dihapus. Pesan inline tetap terasosiasi, memakai `text-foreground` di atas permukaan aktual.
- Validasi `onTouched` untuk input; blur capture lokal pada trigger tanggal/Combobox menandai touched dan memvalidasi tanpa memperluas API shared. Batas/required/optional dijelaskan sebelum field; pesan deskripsi menerima tepat 200 karakter, tanggal menerima hari yang sama, angka menyebut nilai dan satuan. Helper switch terhubung; animasi route/panel mematuhi reduced motion; status tidak memakai pulsa.
- Tes route **26/26** lulus: termasuk role-only autosave/reload, nol anggota, fokus add/remove, blur/revalidation, summary unik/klik/native+composite, asosiasi helper, deskripsi 200 karakter, tanggal sama, dan guard reduced motion.
- Chromium pada build worktree port 4073: submit via Enter → fokus summary → Tab/Enter → trigger Owner; tautan email via Enter → fokus input; focus ring terlihat. Remove/add via Enter memulihkan fokus sesuai aturan; viewport 320/390/1440 tidak overflow, tombol hapus terukur 44×44 px. Emulasi reduced motion menghasilkan `animation-name: none` pada route dan panel. Pembaca layar bersuara native belum diuji.
- Kontras dihitung dari warna computed browser dengan komposit latar ancestor pada permukaan aktual (summary `card`, inline pada form), bukan hanya pasangan token teoritis. Seluruh 16 kombinasi lolos AA; angka berikut dibulatkan dua desimal.

| Tema | Summary light | Inline light | Summary dark | Inline dark |
|---|---:|---:|---:|---:|
| pulse | 18,80 | 18,27 | 16,74 | 17,77 |
| sunset | 18,87 | 18,03 | 16,46 | 17,75 |
| botanic | 18,67 | 17,91 | 16,74 | 17,92 |
| midnight | 19,44 | 18,63 | 18,11 | 18,78 |
| nebula | 20,16 | 19,57 | 17,83 | 18,66 |
| lagoon | 20,12 | 19,54 | 17,79 | 18,70 |
| ink | 20,62 | 20,06 | 18,41 | 19,21 |
| graphite | 20,62 | 20,10 | 18,54 | 19,09 |

- `pnpm typecheck` dan `pnpm lint` workspace lulus; `pnpm test:tokens` 10/10; showcase build lulus. Tidak ada dev server pada worktree ini saat build; `.next` dev server root tidak disentuh.
- `pnpm test` awal berhenti pada timeout FileUpload (713/714 UI). Pengulangan paralel bersamaan build dengan flag Web Storage menghasilkan lima kegagalan UI (timeout FlowEditor/MindMap/PermissionMatrix dan assertion status FileUpload). File UI tidak diubah. Showcase sendiri tanpa flag: 118/122, empat gagal baseline FlowEditor (`localStorage.getItem is not a function`). Hasil run terkontrol di bawah memisahkan kegagalan environment/timing tersebut; tidak mengubah konfigurasi repo.
- Run final `NODE_OPTIONS=--no-experimental-webstorage pnpm -r test --maxWorkers=1` lulus: tokens **10/10**, UI **714/714**, showcase **122/122** (termasuk route **26/26**). Flag/worker hanya parameter verifikasi untuk mengisolasi baseline Web Storage Node dan timing paralel; tidak ada perubahan konfigurasi repo. Build menghasilkan **76/76** halaman.
- `node scripts/check-status-log.mjs` hijau saat implementasi: 127 artefak done terverifikasi. Penetapan done berikutnya berdasarkan instruksi eksplisit user.
- Bukti sementara: `/tmp/opencode/cr-073-browser.mjs`, `/tmp/opencode/cr-073-browser-results.json`, `/tmp/opencode/cr-073-{route,typecheck,lint,test,test-retry,showcase-test,controlled-test,tokens,build}.log`.
