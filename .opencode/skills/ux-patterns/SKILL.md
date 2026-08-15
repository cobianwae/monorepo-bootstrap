---
name: ux-patterns
description: Resep implementasi skenario UX tingkat lanjut dan pola interaksi umum — Stepper, Split Layout, Data Table, CRUD, Feedback, Loading, Error, dan Form
tags: [design-system, ux, patterns, wizard, datatable, workspace, crud, feedback, loading, forms]
compatibility: [next, react, opencode, claude, cursor]
---

# UX Patterns & Recipes

## Kapan Pakai
Saat membuat skenario UX multi-langkah, interaksi halaman yang kompleks, atau membangun pola interaksi umum (form, loading state, empty state, error, konfirmasi, table, dll) pada aplikasi showcase atau consumer app.

## Prinsip Umum
1. **Jangan biarkan user menunggu tanpa feedback** — selalu ada skeleton screen atau spinner sesuai konteks.
2. **Jangan biarkan user bingung tanpa jalan keluar** — selalu ada CTA atau navigasi di empty/error state.
3. **Jangan biarkan user kehilangan data tanpa peringatan** — selalu konfirmasi destructive action.
4. **Jangan biarkan user salah tanpa tahu kenapa** — error message harus spesifik, actionable, dan inline.
5. **Mobile-first, desktop-enhanced** — desain untuk 375px dulu, enhance untuk 1280px+.

## Daftar Pola Standar

### 1. Stepper / Multi-Step Wizard
- **State Management**: Simpan state seluruh step terpusat; validasi per-step sebelum memperbolehkan lanjut ke step berikutnya.
- **Progress Clarity**: Tampilkan nomor step, judul, status (selesai / aktif / mendatang), dan step review sebelum commit akhir.
- **Reversibility**: Sediakan tombol 'Previous' yang jelas tanpa menghapus input yang telah dimasukkan.

### 2. Workspace & IDE Split Layout
- **Spatial Ergonomics**: Gunakan collapsible sidebar untuk navigasi modul, breadcrumbs di topbar, dan split panels untuk konten kerja utama.
- **Global Search**: Sediakan input search terintegrasi dengan shortcut keyboard (`⌘K` / `Ctrl+K`).
- **Status Visibility**: Tempatkan status bar / log drawer di bagian bawah dengan indikator live connection.

### 3. Advanced Data Table & Filtering
- **Filtering Suite**: Sediakan fuzzy text search (debounced 300ms) digabung dengan dropdown select filter dan active filter chips.
- **Sorting & Selection**: Header kolom dapat diklik untuk sorting dengan indikator arah; baris memiliki checkbox untuk bulk actions.
- **Feedback States**: Sediakan tampilan loading skeleton yang mencerminkan struktur tabel asli, serta empty state dengan aksi reset filter.
- **Pagination & Scroll**: Sticky header pada scroll, pagination di footer dengan info total data.

### 4. Master Data & Reference CRUD
- **Unique Code Identifier**: Input kode master data wajib diformat uppercase / slug dan divalidasi keunikannya terhadap data existing.
- **Context Preservation**: Gunakan slide-over drawer (`Sheet`) untuk form pembuatan dan pengeditan tanpa meninggalkan konteks halaman tabel.
- **Audit Traceability**: Sediakan drawer riwayat perubahan (siapa, kapan, dan field apa yang diubah).

### 5. Overlays & Action Feedback
- **Destructive Actions**: Operasi yang tidak dapat dibatalkan (delete, reset) WAJIB dialog konfirmasi dengan destructive variant dan penjelasan dampak.
- **Non-blocking Toasts**: Toast sukses auto-dismiss (5 detik); toast error **tidak** auto-dismiss; sertakan tombol 'Undo' untuk aksi yang relevan.

## Pola Feedback & Interaksi Dasar

### 1. Loading State
- **Skeleton Screen**: Gunakan untuk konten halaman (`loading.tsx` / Suspense fallback) dengan layout dan posisi yang sama dengan konten final.
- **Inline Spinner**: Gunakan untuk aksi dalam tombol (submit/save) dengan button tetap dalam status disabled.
- Loading > 3 detik wajib menampilkan progress indicator.

### 2. Empty State
- Jelaskan **kenapa kosong** dan **apa yang bisa dilakukan**.
- Sediakan icon relevan dan CTA utama (Tambah Data / Reset Filter).

### 3. Error State
- **Inline Field Error**: Tampilkan langsung di bawah field form terkait.
- **Error Banner**: Untuk error non-blocking setingkat komponen/section dengan tombol 'Coba Lagi' dan dismiss.
- **Full Page Error (`error.tsx`)**: Error boundary dengan tombol 'Coba Lagi' (reset) dan 'Ke Beranda'.

### 4. Form & Validation
- Validasi real-time (on blur / on change, bukan hanya on submit).
- Error message jelas di bawah input; hint text ditampilkan saat tidak ada error.
- Tombol submit tetap terlihat saat loading dengan state disabled + loading spinner.

### 5. Responsive Navigation
- Desktop: Sidebar collapsible atau top navigation bar.
- Mobile (< 1024px): Hamburger menu membuka slide-over drawer (`Sheet`).
- Active link di-highlight; sertakan breadcrumbs untuk hierarki halaman dalam.

### 6. Onboarding & First Visit
- Deteksi via `localStorage` atau user flag di backend; tampilkan banner atau modal singkat (maks 3–4 step).
- Selalu sediakan tombol dismiss / skip yang terlihat jelas.

### 7. Optimistic Update
- Perbarui UI secara instan; lakukan rollback dan tampilkan toast error jika API gagal.
- Tampilkan subtle syncing indicator jika proses memakan waktu.

### 8. Infinite Scroll / Load More
- Gunakan `IntersectionObserver` pada trigger element di bawah list (bukan scroll event listener).
- Tampilkan subtle loading spinner di footer saat fetch halaman baru dan hentikan jika seluruh data sudah termuat.

## Quick Reference: Pemilihan Pola

| Kondisi / Skenario | Pola yang Digunakan |
|---|---|
| Halaman pertama load / navigasi | Skeleton Screen (`loading.tsx` / Suspense) |
| Tidak ada data / hasil pencarian nihil | Empty State + CTA (Tambah / Reset) |
| API / Runtime error | Error Banner (inline) atau `error.tsx` (full page) |
| Aksi destruktif (delete, reset) | Confirmation Dialog (destructive variant) |
| Form input & form multi-langkah | FormField + real-time validation / Stepper Wizard |
| Kumpulan data terstruktur | Advanced Data Table + SortableHeader + Pagination |
| Pencarian & filter data | SearchBar (debounced 300ms) + FilterChips |
| Feedback operasi CRUD | Toast (auto-dismiss sukses / persistent error / Undo) |
| Navigasi mobile | Slide-over Drawer (`Sheet`) |
| Pengguna pertama kali | Welcome Banner / Onboarding flow (dismissible) |
| Toggle / quick inline action | Optimistic Update + auto-rollback on failure |
| Stream data panjang | Infinite Scroll (`IntersectionObserver`) |

## Checklist & Anti-Patterns
- [ ] Skenario menangani status loading (skeleton), empty, dan error secara konsisten
- [ ] Formulir memiliki validasi real-time dan error feedback inline
- [ ] Aksi destruktif memerlukan konfirmasi eksplisit dengan visual warning yang jelas
- [ ] Seluruh skenario responsif (mobile drawer + responsive layout)
- [ ] Toast error tidak auto-dismiss dan menyertakan aksi perbaikan jika relevan
- [ ] **Anti-Pattern**: Menampilkan halaman kosong tanpa loading indicator / skeleton
- [ ] **Anti-Pattern**: Memberikan pesan error generik tanpa aksi keluar (retry / reset)
- [ ] **Anti-Pattern**: Mematikan (disable) tombol tanpa penjelasan atau indikator kenapa
- [ ] **Anti-Pattern**: Menggunakan infinite scroll tanpa exit condition / batas akhir data
