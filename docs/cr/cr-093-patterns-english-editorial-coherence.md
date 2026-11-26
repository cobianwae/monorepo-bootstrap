# CR-093 — Patterns: English copy dan koherensi editorial

**Status:** done (ditetapkan user 2026-11-26)
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

- [x] Inventaris copy per route pada tabel cakupan; tetapkan istilah English yang konsisten tanpa mengubah fungsi demo.
- [x] Perbarui copy lokal, helper/data, accessible name, dan contoh resep yang tampil; pertahankan identifier teknis serta contoh data yang memang bermakna.
- [x] Catat before/after representatif dan hasil evaluasi seluruh route di CR ini sebelum PR.
- [x] Sesuaikan assertion teks/role pada test terdampak; jalankan verifikasi di bawah.

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

## Hasil eksekusi (2026-11-26)

**Diubah (11 route):** calendar (`Buat event`→`Create event`), file-upload, flow-editor, image-cropper, mention-emoji, mind-map, org-chart, permission-matrix, product-tour, rich-text-editor, transfer-list. Termasuk helper lokal (`_lib/demo-data.ts`, `_components/*`) dan resep yang ditampilkan.

**Sudah sesuai (26 route):** auth, cascader-tree-select, dynamic-form, import-wizard, onboarding, settings, stepper, activity-feed, billing, dashboard, data-table, file-manager, infinite-scroll, kanban, master-data, master-detail, notifications, virtualized-list, workspace, command-palette, comments, global-search, optimistic-updates, results, media-gallery, org-chart-studio. Runtime sudah English; sisa kata Indonesia hanya di komentar kode (diizinkan konvensi) atau identifier internal (mis. id dataset `rusak`, resource `hapus`) yang tidak ditampilkan.

**Shared `@ds/ui` yang copy default-nya menjadi English (persetujuan “ya gas”):** `rich-text-editor`, `file-upload`, `file-input`, `image-cropper`, `flow-editor`, `mind-map`, `org-chart`, `permission-matrix`, `chat-composer-tools`, `code-block`, `event-calendar`, `tour`, `lightbox`, `error-page`, `notification`. Tanpa perubahan API/props/varian.

**Before/after representatif:**

| Area | Before | After |
|---|---|---|
| RTE pengantar | Laporan implementasi Indonesia + ID screen/modal | “Compose formatted content with links and images…” (ID di detail implementasi) |
| RTE counter | `44 kata` (klaim CR; hitungan nyata sample English 47) | `47 words` (test dikunci ke 47) |
| RTE | `Atur ulang demo` / `Tebal` / `Simpan`/`Batal` | `Reset demo` / `Bold` / `Save`/`Cancel` |
| Permission Matrix | `Dirty 3 sel` / `Kosong` / `Dikunci kebijakan…` | `3 unsaved changes` / `Empty` / `Locked by policy…` |
| Flow Editor | `Muat contoh` / `tunda` / `Perubahan dibatalkan` | `Load example` / `wait` / `Change undone` |
| Mind Map | `Berisi` / `Contoh Q1` / id `ide-N` | `Populated` / `Q1 example` / id `idea-N` |
| Image Cropper | `persegi` / `Raksasa — melebihi batas ukuran` / `Tema: terang` | `rectangle` / `File size limit` / `Theme: light` |
| File Upload | `selesai` / `gagal` | `done` / `failed` |
| Event Calendar | `Buat event` / `Tidak ada event di periode ini` | `Create event` / `No events in this period` |
| Org Chart / Mind Map | `Siklus terdeteksi pada node…` | `Cycle detected at node…` |

**Verifikasi targeted:** semua test pola showcase 135/135 hijau; semua test shared tersentuh hijau kecuali satu smoke interaktif `rich-text-editor` yang **terbukti pre-existing** (dibuktikan dengan stash perubahan RTE dan menjalankan test di baseline — gagal identik) — dicatat sebagai known issue, bukan regresi CR ini.

**Verifikasi penuh (2026-11-26, setelah perbaikan 10 assertion tersisa di `extended-components`, `chat-mention-emoji`, `scenario-primitives`, `mind-map.integration` + aria-label `Mention candidates` yang terlewat):**
- `pnpm typecheck`: PASS (7 proyek).
- `pnpm lint`: PASS 0 errors; 4 warnings pre-existing — unused eslint-disable `react-hooks/rules-of-hooks` di `packages/ui/src/components/overlay/lightbox.test.tsx:48–59`, identik di HEAD.
- `pnpm test` (dengan `NODE_OPTIONS=--no-experimental-webstorage`): tokens 10/10, packages/ui 749/750, showcase 147/147, api done. Satu-satunya failure = smoke interaktif RTE yang flaky pre-existing di atas (lolos pada run terisolasi; baseline juga intermiten).
- `pnpm -C apps/showcase build`: PASS; semua 37 route Patterns terprerender statis.

## Design System Checks

### Temuan batas scope saat eksekusi

- Rencana teknis disetujui user (“gas”, 2026-11-26).
- `packages/ui/src/components/form/rich-text-editor.tsx:49–66` hanya menyediakan override `placeholder` dan `ariaLabel`, bukan label toolbar/dialog. Copy Indonesia hardcoded mencakup `Simpan`/`Batal` (206–209), `Tebal`/`Miring` (579–586), serta label dialog gambar (747–759). Target semua copy runtime English tidak dapat dituntaskan lewat halaman lokal saja.
- User menyetujui perluasan scope default copy shared `@ds/ui` ke English (“ya gas”, 2026-11-26), termasuk dampaknya bagi konsumen di luar Patterns. Gunakan default English tanpa menambah API label; audit assertion konsumen yang terdampak.

- [ ] Token semantik, kontras light/dark, dan accessible name tetap sesuai.
- [ ] Perilaku Radix, API `cva`, export, serta state loading/empty/error tetap terjaga.
- [ ] Showcase copy dan test sesuai; `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-093-patterns-english-editorial-coherence`
Commit: `fix: unify patterns English copy [CR-093]`

- [x] CR disetujui user.
- [x] Branch `cr-093-patterns-english-editorial-coherence` dibuat dari `pattern-polish` di worktree `arah-prd`.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi targeted lalu typecheck → lint → test; build showcase memakai salinan sementara jika dev server aktif.
- [ ] Preview copy desktop/mobile bersama user; CR dimutakhirkan ke file:line final sebelum PR.
- [x] CR di-tick, STATUS-LOG di-append, BACKLOG dan STATUS diperbarui; `node scripts/check-status-log.mjs` hijau.
