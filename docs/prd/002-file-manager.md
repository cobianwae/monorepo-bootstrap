# 002 — File Manager (Composed Pattern)

Status: approved
Owner: —
Tanggal: 2026-11-20
Sumber: roadmap RM-04 + RM-05 (`docs/discussions/component-roadmap.md`)

## Problem

Aplikasi produk nyata hampir selalu butuh file explorer: browse folder, cari file,
upload, preview, dan kelola (rename/move/delete). Hari ini setiap screen konsumen
membangun komposisinya sendiri dari potongan komponen — hasilnya inkonsisten dan
berulang.

Bukti/konsekuensi:

- Bahan inti sudah lengkap di `packages/ui` (`tree-view`, `data-table`, `breadcrumb`,
  `context-menu`, `bulk-action-bar`, `file-upload`, `dialog`, `progress`) tetapi tidak
  ada pattern komposisi baku → tiap konsumen menyusun ulang dan mengambil keputusan
  state (loading/empty/error) berbeda-beda.
- Preview file (image/PDF/video/audio + metadata) tidak ada standarnya (RM-05);
  konsumen menulis modal sendiri per tipe file.
- Storage quota indikator tidak ada pola baku.

Diferensiasi pattern (tidak menduplikasi yang ada):

- `S-005.26` Workspace — shell multi-panel generik; tidak tahu konsep folder/file.
- `S-005.15` Master Detail — list + panel detail generik; tanpa hierarki folder dan aksi file.
- `S-005.16` Media Gallery — grid aset visual; tanpa tree folder, quota, atau aksi file.
- File Manager — hierarki folder + aksi file + quota + preview; meng-compose ketiganya
  sebagai bahan, bukan menggantikan atau menyalinnya.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Konsumen tidak menyusun file explorer sendiri | Screen konsumen memakai pattern ini langsung tanpa wrapper | ≥ 1 screen konsumen; sampai app konsumen tersedia, S-005.27 menjadi bukti leading |
| Komposisi komponen existing maksimal | Rasio kode pattern vs kode komposisi; komponen inti dipakai ulang, bukan ditiru | Semua zona memakai komponen existing sebagai basis |
| State matrix lengkap dan seragam | Loading/empty/error terdefinisi per zona dan teramati di showcase | 3 state × zona utama teramati di scenario |
| Aksesibilitas setara standar DS | Audit WCAG 2.1 AA + operability keyboard | Lolos audit, light & dark parity |

## Non-goals

- File editor (mengedit isi file di dalam preview).
- Versioning, sharing/link publik, dan manajemen permission per file.
- Integrasi storage spesifik (S3, GCS) — sumber data tetap milik konsumen.
- Search global lintas akun/unit; hanya pencarian dalam folder aktif.
- Sync engine / offline mode.
- Upload queue baru — sudah selesai di PRD 001 (`FileUpload`), di sini cukup compose.

## User & Use Case

Persona (ringkas):

1. **Developer konsumen DS** — memasang halaman dokumen/aset; butuh pattern siap pakai
   dengan kontrak data jelas.
2. **End-user aplikasi** — mencari dokumen, melihat pratinjau sebelum membuka, mengunduh
   atau memindahkan banyak file sekaligus.

JTBD:

- "When saya mengelola banyak dokumen, I want browse, preview, dan aksi massal dalam
  satu layar, so I can tidak pindah-pindah alat."
- "When saya ragu file yang benar, I want lihat preview cepat beserta metadatanya,
  so I can yakin sebelum download/membagikan."

Skenario utama:

1. Buka folder bertingkat lewat sidebar tree; breadcrumb ikut berubah; pilih 5 file →
   bulk action bar muncul → move ke folder lain.
2. Klik image/PDF → preview terbuka dengan metadata (nama, ukuran, dimensi/jumlah
   halaman, tanggal); tutup, lanjut browse.
3. Upload 3 dokumen lewat pattern → queue `FileUpload` tampil di panel; selesai →
   list folder aktif diperbarui.
4. Folder kosong → empty state; API gagal → error state dengan retry.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Pattern tersusun dari tiga zona: sidebar folder tree, area konten utama, panel konteks (upload/quota/detail) dengan layout responsif yang terdefinisi. | must | Scenario showcase menampilkan tiga zona; breakpoint kecil menyusun ulang tanpa kehilangan fungsi inti. |
| FR-002 | Navigasi folder memakai `tree-view` existing; folder aktif tercermin di `breadcrumb` existing dan sebaliknya. | must | Klik folder mengubah breadcrumb; klik breadcrumb segment mengubah folder aktif dan highlight tree. |
| FR-003 | Konten folder tampil dalam dua mode: list (tabel, basis `data-table`) dan grid (thumbnail); mode dapat ditukar dan pilihan diingat selama sesi. | must | Toggle view mengubah render tanpa reload data; urutan & seleksi konsisten antar mode. |
| FR-004 | Multi-select item (pointer + keyboard) memunculkan `bulk-action-bar` existing dengan aksi massal (download, move, delete). | must | Seleksi ganda menampilkan bar; aksi massal diterapkan ke semua item terpilih (terverifikasi test). |
| FR-005 | Context menu per item (`context-menu` existing) menyediakan aksi: open/preview, download, rename, move, delete, detail. | must | Menu terbuka via klik kanan dan keyboard; setiap aksi memanggil callback konsumen. |
| FR-006 | Upload berlangsung di dalam pattern memakai `file-upload` (PRD 001); file baru masuk ke folder aktif dan konten diperbarui. | must | Upload selesai memunculkan item baru di list/grid folder aktif. |
| FR-007 | Preview file (RM-05): image, PDF, video, audio tampil dalam preview (modal/panel — diputuskan gate 2) beserta metadata: nama, tipe, ukuran, tanggal, dimensi/durasi bila tersedia. | must | Empat tipe media terpreview di scenario; metadata terbaca; tipe tak didukung jatuh ke fallback generik. |
| FR-008 | Indikator storage quota: total, terpakai, sisa; mendekati/penuh memakai token `warning`/`destructive` (basis `progress`). | must | Scenario quota normal/warning/penuh menampilkan warna dan pesan sesuai token. |
| FR-009 | Setiap zona punya state loading (skeleton), empty (folder kosong), dan error (gagal memuat, dengan retry) memakai pola DS existing. | must | Tiga state per zona teramati di scenario dan tercover test. |
| FR-010 | Kontrak sumber data deklaratif: konsumen menyediakan data folder/item dan handler aksi; pattern tidak memilih transport/API sendiri. | must | Story demo memasang sumber data tiruan tanpa mengubah kode pattern. |
| FR-011 | Operability keyboard penuh: navigasi folder, seleksi, buka menu konteks, dan preview semuanya bisa dijalankan tanpa mouse; struktur terbaca screen reader. | must | Audit keyboard + ARIA lolos; tab order logis antar zona. |
| FR-012 | Sortir kolom dasar (nama, ukuran, tanggal) dan filter tipe file di mode list. | should | Klik header mengubah urutan; filter tipe menyaring item tanpa fetch ulang. |
| FR-013 | Rename dan buat folder baru dilakukan inline/modal dengan validasi nama. | should | Nama kosong/duplikat ditolak dengan pesan; hasil langsung terlihat di tree dan list. |
| FR-014 | Virtualisasi konten untuk folder berisi ratusan item (basis pattern virtualized list). Prioritas ditunda sampai dependency disetujui. | could | Folder 500 item tetap responsif; jumlah node ter-render terbatas; fokus item aktif dipertahankan dan `aria-rowcount`/posisi item terbaca. |
| FR-015 | Drag-drop memindah file antar folder di tree (basis `@dnd-kit/*` yang sudah ada). | could | Drop file pada folder memanggil handler move; folder target menandai state hover. |

## Design Refs

- Screen: baru — diusulkan `S-005.27` File Manager (`/patterns/file-manager`),
  didaftarkan resmi di gate 2. Terkait: `S-005.10` File Upload, `S-005.16` Media
  Gallery, `S-005.25` Virtualized List, `S-005.26` Workspace.
- Komponen basis: `dnd/tree-view.tsx`, `data-display/data-table.tsx`,
  `data-display/bulk-action-bar.tsx`, `navigation/breadcrumb.tsx`,
  `navigation/context-menu.tsx`, `form/file-upload.tsx`, `feedback/dialog.tsx`,
  `overlay/sheet.tsx`, `base/progress.tsx`, `base/skeleton.tsx`,
  `feedback/empty-state.tsx`.
- Dokumen design: `docs/design/file-manager.md` dibuat saat gate 2 (object model,
  state matrix per zona, flow, wireframe).
- Analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (§1),
  roadmap RM-04/RM-05.

## Constraints & Dependencies

- Teknis: pattern composed di `packages/ui` (kategori `data-display` atau folder baru —
  diputuskan gate 2); token-first; WCAG 2.1 AA; light/dark parity; test Vitest +
  Testing Library co-located.
- Dependency package: **tidak ada dependency baru untuk v1**. Drag-drop (FR-015)
  memakai `@dnd-kit/*` yang sudah ada; preview media memakai elemen native (img/video/
  audio, PDF via `object`/`iframe` dengan `sandbox` tanpa script, plus tautan unduh
  sebagai fallback). FR-014 (virtualisasi) ditunda: bila diambil, butuh approval
  dependency `@tanstack/react-virtual` karena `packages/ui` belum memilikinya.
- Komponen `file-upload` hasil PRD 001 dipakai ulang, bukan ditiru.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Preview sebagai modal atau panel samping (sheet)? Roadmap menugaskan keputusan ini di gate 2 RM-04. | answered — panel samping `sheet` di desktop, dialog full-screen di mobile; detail visual di gate 2 |
| 2 | Bentuk kontrak sumber data (props + handler per aksi vs satu adapter `FileSource`)? Disesepakati di gate 1. | answered — props deklaratif (`folders`, `items`) + handler per aksi; tanpa adapter `FileSource` di v1 |
| 3 | Apakah FR-015 (drag-drop move) masuk v1 atau ditunda? | answered — ditunda ke iterasi berikut (tetap `could`); v1 memakai context menu + bulk action |
| 4 | Kategori folder untuk pattern (existing vs baru)? Disesepakati gate 2 bersama object model. | answered — kategori `data-display` (pattern composed), tanpa folder baru |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-20 | Draft awal dari roadmap RM-04; RM-05 (preview) dilebur ke PRD ini (keputusan user, 2026-11-20) |
| 2026-11-20 | **Approved (gate 1)** — OQ#1–#4 dijawab; FR-014 ditunda (dependency), diferensiasi pattern dan sandbox preview dicatat |
