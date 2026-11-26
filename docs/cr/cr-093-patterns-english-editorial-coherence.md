# CR-093 — Patterns: English copy dan koherensi editorial

**Status:** draft
**Sumber:** audit uplift + diskusi user 2026-11-26
**Ref:** `docs/design/visual-language.md`, `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.tsx:76`, CR-094, CR-095

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.tsx:80` | Pengantar berupa laporan implementasi Indonesia dengan ID screen/modal, sementara halaman lain menjelaskan kegunaan dalam English. | Pengantar English berbasis tugas pengguna; metadata teknis dipindah ke detail implementasi. |
| 2 | major | `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.tsx:95–114` | Instruksi, tombol, dan counter menggunakan istilah/bahasa berbeda dari pattern lain. | Selaraskan istilah, kata kerja, helper, feedback, dan accessible name. |
| 3 | minor | `apps/showcase/src/app/(docs)/patterns/settings/page.tsx:398`, `patterns/data-table/page.tsx:325` (di direktori docs yang sama) | Klaim “polished”/“Production” dan daftar fitur teknis mendominasi pengantar. | Nyatakan kegunaan konkret dan batas demo secara jujur. |

## Perubahan yang Diusulkan

- Semua copy yang ditampilkan oleh halaman Patterns menjadi **English**, termasuk heading, deskripsi, bullet, card, tombol, tooltip, toast, error, empty state, instruksi, serta label pembaca layar. Dokumen CR tetap Bahasa Indonesia sesuai konvensi.
- Deskripsi pembuka: kegunaan dan konteks pemakaian, singkat; tanpa pujian diri, daftar fitur panjang, atau ID implementasi. Deskripsi section hanya bila menambah informasi.
- Istilah bersama: `Interactive demo`, `Try it`, `Implementation`, `Accessibility notes`, `Reset demo`, `Load example`; gunakan hanya ketika perannya sesuai. Label aksi memakai kata kerja yang jelas.
- Contoh RTE: “Compose formatted content with links and images. Try editing, read-only mode, and validation feedback.”; `44 kata` → `44 words`; `Atur ulang demo` → `Reset demo`.
- Detail kontrak, keterbatasan, dan ID screen tetap dapat ditemukan di area pendukung; jangan menghilangkan informasi penting demi mempersingkat copy.
- File utama: `apps/showcase/src/app/(docs)/patterns/*/page.tsx` dan helper/data lokal yang menghasilkan copy. Default shared component ditelusuri saat eksekusi; gunakan konfigurasi existing bila tersedia. Perubahan default/API publik `@ds/ui` memerlukan usulan dan persetujuan eksplisit sebelum edit.

### Cakupan seri CR-093–095

Ketiga CR mengevaluasi 37 route berikut; tiap route dicatat hasilnya sebagai diubah atau sudah sesuai beserta alasan, bukan diasumsikan semuanya bermasalah.

| Kelompok kerja | Route `/patterns/…` |
|---|---|
| Form dan alur | auth, cascader-tree-select, dynamic-form, file-upload, image-cropper, import-wizard, onboarding, product-tour, settings, stepper, transfer-list |
| Data dan workspace | activity-feed, billing, calendar, dashboard, data-table, file-manager, infinite-scroll, kanban, master-data, master-detail, notifications, permission-matrix, virtualized-list, workspace |
| Search, komunikasi, dan state | command-palette, comments, global-search, mention-emoji, optimistic-updates, results |
| Editor dan canvas | flow-editor, media-gallery, mind-map, org-chart, org-chart-studio, rich-text-editor |

## Tasks (jalur small-fix)

- [ ] Inventaris copy per route pada tabel cakupan; tetapkan istilah English yang konsisten tanpa mengubah fungsi demo.
- [ ] Perbarui copy lokal, helper/data, accessible name, dan contoh resep yang tampil; pertahankan identifier teknis serta contoh data yang memang bermakna.
- [ ] Catat before/after representatif dan hasil evaluasi seluruh route di CR ini sebelum PR.
- [ ] Sesuaikan assertion teks/role pada test terdampak; jalankan verifikasi di bawah.

### Audit test terdampak

- Bukti langsung: `rich-text-editor/page.test.tsx:9–18` mengassert `44 kata`, fallback gambar, reset, dan muat contoh; `permission-matrix/page.test.tsx:26–57` mengassert instruksi, nama grid, checkbox, dirty/empty state dalam Indonesia; `flow-editor/page.test.tsx:89–124` memakai label Indonesia, termasuk label mock yang harus dibedakan dari copy live.
- Inventaris aktual: 11 route memiliki `page.test.tsx`: dynamic-form, master-detail, notifications, image-cropper, permission-matrix, rich-text-editor, media-gallery, flow-editor, mind-map, virtualized-list, import-wizard. Path relatif terhadap direktori Patterns.
- Tambahan: `import-wizard/page-copy.test.tsx`, `page-flow.test.tsx`, `_components/accessibility.test.tsx`; `mind-map/_components/mind-map-recipe.test.tsx`.
- Audit ulang assertion saat eksekusi; ubah ekspektasi bahasa tanpa melemahkan pemeriksaan perilaku. Tidak menambah test di setiap route hanya untuk mencerminkan prosa.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | User menyetujui arah dan pembuatan beberapa draft CR; semua copy showcase Patterns English. | Permintaan 2026-11-26: “ok buat crsnya boleh beberapa, semua english donk”. Ini bukan approval eksekusi CR. |
| 2 | Seri ini menerapkan visual-language approved, bukan mengubahnya. | Masalah utama koherensi isi antarhalaman, bukan redesign sidebar. |
| 3 | Pertahankan hasil CR-066/069/071/079/086/088; evaluasi hanya delta yang masih nyata. | Tidak membuka ulang perbaikan lama hanya karena variasi implementasi. |
| 4 | Import Wizard memakai CR-079 done sebagai baseline; sinkronkan dengan CR-080/081 sebelum menyentuh area yang sama. | Menghindari duplikasi dan konflik pekerjaan aktif. |

## Design System Checks

- [ ] Token semantik, kontras light/dark, dan accessible name tetap sesuai.
- [ ] Perilaku Radix, API `cva`, export, serta state loading/empty/error tetap terjaga.
- [ ] Showcase copy dan test sesuai; `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-093-patterns-english-editorial-coherence`
Commit: `fix: unify patterns English copy [CR-093]`

- [ ] CR disetujui user.
- [ ] Branch dibuat; perubahan diimplementasikan.
- [ ] Verifikasi targeted lalu typecheck → lint → test; build showcase memakai salinan sementara jika dev server aktif.
- [ ] Preview copy desktop/mobile bersama user; CR dimutakhirkan ke file:line final sebelum PR.
- [ ] CR di-tick, STATUS-LOG di-append, BACKLOG dan STATUS diperbarui; `node scripts/check-status-log.mjs` hijau.
