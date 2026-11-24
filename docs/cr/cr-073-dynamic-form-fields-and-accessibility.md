# CR-073 — Field Dinamis, Validasi, dan Aksesibilitas Dynamic Form

**Status:** approved  
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

- [ ] Hubungkan Select role ke nilai/handler form; tambah tes role-only change, autosave, reload, dan daftar kosong yang tetap kosong. Uji juga penambahan kembali dari empty state.
- [ ] Tambahkan label terlihat dan pengelolaan fokus setelah add/remove; pastikan tombol hapus 44×44 px tanpa overflow pada 320 px.
- [ ] Hubungkan summary ke field native dan trigger komposit; uji dua email invalid, klik/Enter pada tautan summary, validasi setelah blur, form baru tanpa error, serta hubungan helper/error.
- [ ] Verifikasi keyboard, focus ring, reduced motion, dan contrast untuk summary/inline error pada light/dark. Ukur kontras lagi pada permukaan aktual setelah perubahan, untuk delapan tema.

## Keputusan

| # | Usulan | Alasan |
|---|---|---|
| 1 | Rinci error dengan identitas field dan target fokus; singkirkan indikator hitungan yang redundan. | Pengguna bisa langsung menemukan field yang perlu diperbaiki, termasuk bila beberapa baris punya pesan sama. |
| 2 | Jangan mengubah `FormErrorSummary` global. | Perubahan navigasi dan kontras summary dibatasi pada Dynamic Form; caller lain tidak terdampak. |

## Design System Checks

- [ ] Teks normal mencapai ≥4,5:1 pada light/dark; error tidak hanya dibedakan dengan warna; gunakan token semantik, tanpa warna literal.
- [ ] State kosong, invalid, dan fokus keyboard berfungsi; asosiasi label/error yang sudah ada tidak regresi; tidak ada perubahan API publik.
- [ ] Jalankan tes route, `pnpm typecheck`, `pnpm lint`, `pnpm test`, dan `pnpm -C apps/showcase build`; catat baseline terpisah. Gunakan salinan sementara bila dev server aktif.

## Eksekusi

Branch: `cr-073-dynamic-form-fields-and-accessibility`  
Commit: `fix: improve dynamic form fields and accessibility [CR-073]`

- [ ] CR disetujui user dan branch dibuat.
- [ ] Implementasi dan verifikasi selesai; checklist CR dan status di `docs/BACKLOG.md` serta `docs/STATUS.md` diperbarui sesuai workflow.
- [ ] Append `docs/STATUS-LOG.md` (`YYYY-MM-DD — ringkasan — referensi`); jalankan `node scripts/check-status-log.mjs` sebelum commit.
