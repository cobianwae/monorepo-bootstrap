# Spec Desain — File Manager (Composed Pattern)

Status: approved (gate 2)
PRD: `docs/prd/002-file-manager.md` (approved, gate 1)
Layar: `S-005.27` File Manager (`/patterns/file-manager`) + panel `S-005.27.01`/`S-005.27.02` + modal `M-001`/`M-002`/`M-003`
Flow: `docs/design/flows/file-manager.mmd`
Tanggal: 2026-11-20

## 1. Keputusan Desain

| # | Keputusan | Alasan |
|---|---|---|
| D1 | Pattern composed di `packages/ui` kategori `data-display` (tanpa folder baru); tidak ada komponen inti baru di v1. | OQ#4 (gate 1: kategori `data-display`); semua zona memakai komponen existing sebagai basis (FR-001). |
| D2 | Preview = panel samping `sheet` di desktop, dialog full-screen di mobile. | OQ#1 (gate 1); sheet menjaga konteks folder tetap terlihat di layar lebar, dialog memberi ruang maksimal di layar kecil. |
| D3 | Kontrak data deklaratif: props `folders` + `items` + handler per aksi; tanpa adapter `FileSource` di v1. | OQ#2 (gate 1); pattern tidak memilih transport/API (FR-010). |
| D4 | FR-015 (drag-drop move) ditunda ke iterasi berikut; v1 memakai context menu + bulk action. FR-014 (virtualisasi) ditunda sampai dependency `@tanstack/react-virtual` disetujui. | OQ#3 + constraints PRD; tanpa dependency baru untuk v1. |
| D5 | Preview media memakai elemen native: `img`, `video`, `audio`, PDF via `object`/`iframe` dengan `sandbox` tanpa script + tautan unduh sebagai fallback. Tipe tak didukung jatuh ke fallback generik. | Constraints PRD; aman tanpa dependency baru (FR-007). |
| D6 | Semua status warna via token semantik (`warning`, `destructive`, `success`, `primary`, `muted-foreground`); tidak ada hex literal. | Token-first; quota (FR-008) dan state (FR-009) konsisten light/dark. |

## 2. Shell / Anatomy (layer wireframe)

### 2.1 Shell tiga zona (desktop ≥ lg)

```text
S-005.27 File Manager (/patterns/file-manager)
├── Toolbar atas
│   ├── Breadcrumb (compose navigation/breadcrumb) — cermin folder aktif
│   ├── Search dalam folder aktif (FR cakupan: filter, bukan search global)
│   ├── Toggle view: list / grid (pilihan diingat selama sesi)
│   ├── Sortir (nama, ukuran, tanggal) + filter tipe file (mode list)
│   └── Aksi: [Upload] [Folder baru]
├── Zona A — Sidebar folder tree (S-005.27 bagian navigasi)
│   └── TreeView (compose dnd/tree-view): expand/collapse, highlight folder aktif
├── Zona B — Konten utama (S-005.27.01)
│   ├── Mode list: DataTable (basis data-display/data-table) + checkbox seleksi
│   ├── Mode grid: thumbnail + nama + meta ringkas (seleksi setara)
│   ├── BulkActionBar (muncul saat seleksi ≥ 1): download, move, delete
│   └── ContextMenu per item: open/preview, download, rename, move, delete, detail
└── Zona C — Panel konteks (S-005.27.02)
    ├── Upload queue (compose form/file-upload dari PRD 001)
    ├── Storage quota (basis base/progress + token warning/destructive)
    └── Detail item terpilih (nama, tipe, ukuran, tanggal, dimensi/durasi)
```

Modal (di atas shell):

- `M-001` File Preview — sheet (desktop) / dialog full-screen (mobile).
- `M-002` Rename / Folder baru — dialog kecil + validasi nama.
- `M-003` Konfirmasi hapus & pilih folder tujuan move — dialog.

### 2.2 Responsive breakpoint

| Breakpoint | Perilaku |
|---|---|
| Desktop (≥ lg) | Tiga zona berdampingan; preview sebagai sheet samping; fungsi penuh. |
| Tablet (< lg) | Zona C (panel konteks) menciut menjadi tab/sheet terpisah; toolbar tetap; list/grid tetap penuh. |
| Mobile (< sm) | Sidebar tree menjadi drawer; preview menjadi dialog full-screen; bulk action bar menjadi bar bawah; tidak ada fungsi inti yang hilang (FR-001). |

Fungsi inti yang tidak boleh hilang di breakpoint kecil: navigasi folder,
ganti view, seleksi + aksi massal, upload, preview, retry error.

## 3. API Publik (contract)

```ts
export interface FileFolder {
  id: string;
  name: string;
  parentId: string | null;
}

export type FileItemType = 'image' | 'pdf' | 'video' | 'audio' | 'other';

export interface FileItem {
  id: string;
  folderId: string;
  name: string;
  type: FileItemType;
  size: number;          // bytes
  updatedAt: string;     // ISO date
  dimensions?: string;   // image/video, bila tersedia
  duration?: number;     // detik, video/audio bila tersedia
  thumbnailUrl?: string;
  previewUrl?: string;
}

export type FileManagerView = 'list' | 'grid';

export interface FileManagerProps {
  folders: FileFolder[];
  items: FileItem[];
  activeFolderId: string;
  selectedIds?: string[];
  view?: FileManagerView;                    // default 'list'; pilihan diingat selama sesi
  quota?: { total: number; used: number };   // bila absen, indikator quota disembunyikan
  loading?: boolean;
  error?: string | null;
  onActiveFolderChange?: (folderId: string) => void;
  onSelectionChange?: (ids: string[]) => void;
  onViewChange?: (view: FileManagerView) => void;
  onPreview?: (item: FileItem) => void;
  onDownload?: (items: FileItem[]) => void;
  onMove?: (items: FileItem[], targetFolderId: string) => void;
  onDelete?: (items: FileItem[]) => void;
  onRename?: (item: FileItem, nextName: string) => void;
  onCreateFolder?: (parentId: string, name: string) => void;
  uploadHandler?: UploadHandler;              // diteruskan ke file-upload (FR-006)
  className?: string;
}
```

Aturan contract:

- Pattern murni presentasi + komposisi; fetch, storage, dan transport milik
  konsumen (FR-010). Story demo memakai data tiruan tanpa mengubah kode pattern.
- Navigasi dua arah: klik tree mengubah breadcrumb dan sebaliknya; keduanya
  memanggil `onActiveFolderChange` (FR-002).
- Seleksi tunggal sumber kebenaran di `selectedIds`; toggle view tidak me-reset
  seleksi maupun urutan (FR-003, FR-004).
- Setiap aksi menu/bar memanggil handler konsumen; pattern tidak menghapus atau
  memindah data sendiri (FR-004, FR-005).
- Validasi nama (rename/folder baru): kosong dan duplikat dalam folder yang sama
  ditolak dengan pesan; hasil langsung terlihat di tree dan list (FR-013).

## 4. Varian (`cva`)

Pattern bukan komponen `cva` baru; varian dinyatakan lewat komposisi:

| Varian | Perilaku |
|---|---|
| View `list` (default) | Tabel dengan header sortir (nama, ukuran, tanggal) + filter tipe; checkbox seleksi per baris. |
| View `grid` | Thumbnail + nama + meta ringkas; seleksi pointer + keyboard setara list. |
| Quota `normal` / `warning` / `full` | Warna `progress` mengikuti token: default/`primary`, `warning`, `destructive` + pesan teks. |

## 5. Preview & Quota (RM-05)

### Preview (`M-001`)

```text
M-001 File Preview
├── Media area: img / video / audio native; PDF via object/iframe sandbox; fallback generik + tombol unduh
├── Metadata: nama, tipe, ukuran, tanggal, dimensi/durasi bila tersedia
└── Aksi: [Download] [Tutup]; hapus/rename tetap lewat menu utama (non-goal editor)
```

- Empat tipe (image, PDF, video, audio) wajib terpreview di scenario; tipe lain
  jatuh ke fallback generik (FR-007).
- Fokus terjebak di dalam sheet/dialog saat terbuka; saat ditutup fokus kembali
  ke item pemicu (FR-011).

### Quota

- Menampilkan total, terpakai, sisa (angka + progress bar).
- Ambang: normal → `primary`; mendekati penuh → token `warning` + pesan;
  penuh → token `destructive` + pesan. Status tidak hanya warna: selalu ada
  teks/pesan (FR-008).

## 6. State Matrix (per zona)

| Zona | Loading | Empty | Error |
|---|---|---|---|
| Sidebar tree | Skeleton tree (3–5 baris) | Tree kosong + CTA "Folder baru" | Pesan + retry; `role="alert"` |
| Konten list/grid | Skeleton tabel/grid | Ilustrasi + "Folder kosong" + CTA Upload / Folder baru | Pesan + tombol Coba lagi; seleksi dibersihkan |
| Panel konteks (upload) | Ikuti state `file-upload` PRD 001 | Queue kosong + helper text | Error per file + Ulang (diwarisi PRD 001) |
| Quota | Skeleton bar | — (disembunyikan bila `quota` absen) | Pesan ringan; tidak memblokir konten |
| Preview `M-001` | Skeleton media + meta | — | Media gagal dimuat → fallback generik + tombol unduh |

Catatan a11y per state:

- Loading memakai `aria-busy="true"` + skeleton (bukan spinner saja).
- Empty selalu punya CTA yang terjangkau keyboard.
- Error selalu teks + aksi retry (tidak hanya warna); diumumkan via `role="status"`/`alert`.
- Light/dark parity: semua state memakai token semantik; diverifikasi di kedua mode.

## 7. A11y & Keyboard

- Tree sidebar memakai pola `treeview` (panah navigasi, Enter memilih, tipe-depan
  opsional mengikuti perilaku `tree-view` existing).
- Breadcrumb sebagai `nav[aria-label="Breadcrumb"]`; segmen berupa button/link fokus.
- List memakai tabel semantik dengan header sortir (`aria-sort`); grid memakai
  `role="grid"`/`listbox` setara dengan posisi item terbaca.
- Multi-select: checkbox + Shift/Ctrl-klik + Shift+Panah; `bulk-action-bar` muncul
  diumumkan via `aria-live="polite"` ("5 item dipilih").
- Context menu terbuka via klik kanan, tombol Menu, dan Shift+F10; semua aksi
  terjangkau keyboard dan memanggil handler yang sama dengan pointer (FR-005).
- Preview: focus trap + Esc menutup + fokus kembali ke pemicu; media punya label
  teks (`alt`/judul) dan kontrol native yang terjangkau.
- Tab order logis: toolbar → sidebar → konten → panel konteks → bulk bar
  (saat muncul) → modal (saat terbuka).
- Hormati `prefers-reduced-motion` untuk transisi view dan progress.

## 8. Token & Tema

- Warna hanya token semantik: `primary` (aktif/progress), `success` (selesai),
  `warning`/`destructive` (quota + error), `muted-foreground` (meta),
  `border`/`card` (permukaan).
- Light/dark parity otomatis via CSS variable; pasangan kontras yang dipakai
  sudah tercakup audit `packages/tokens`.
- Tidak ada token baru untuk v1; perubahan nilai mengikuti prosedur token
  (audit kontras light + dark).

## 9. FR Coverage

| FR | Cakupan di spec |
|---|---|
| FR-001 | Tiga zona + responsif — §2 shell dan breakpoint |
| FR-002 | Tree ↔ breadcrumb sinkron — §2, §3 `onActiveFolderChange`, flow navigasi |
| FR-003 | List/grid toggle + ingat sesi — §3 `view`/`onViewChange`, §4 varian |
| FR-004 | Multi-select + bulk-action-bar — §2, §3 `selectedIds`, flow navigasi |
| FR-005 | Context menu 6 aksi — §2, §3 handler, §7 keyboard |
| FR-006 | Upload compose `file-upload` — §2 zona C, §3 `uploadHandler`, flow upload |
| FR-007 | Preview 4 tipe + metadata + fallback — D2/D5, §5, flow preview, `M-001` |
| FR-008 | Quota 3 level + token — §4, §5 quota |
| FR-009 | State per zona — §6 matrix |
| FR-010 | Kontrak deklaratif — §3 aturan contract |
| FR-011 | Keyboard penuh + SR — §7 |
| FR-012 | Sortir + filter tipe (should) — §2 toolbar, §4 list |
| FR-013 | Rename/folder baru + validasi (should) — §3 aturan, `M-002` |
| FR-014 | Virtualisasi (could, ditunda) — D4; di luar v1, menunggu approval dependency |
| FR-015 | Drag-drop move (could, ditunda) — D4; v1 via menu + bulk action |

## 10. Rencana Scenario Showcase (S-005.27)

- Halaman `/patterns/file-manager` menampilkan tiga zona dengan data tiruan
  (folder bertingkat + campuran image/PDF/video/audio/other).
- Kontrol demo: toggle view, pemicu loading/error/empty per zona, quota
  normal/warning/penuh, dan pembuka preview per tipe media.
- Semua state matrix §6 teramati; light & dark; catatan a11y di halaman.
- Handler demo berupa mock (log/toast) tanpa mengubah kode pattern (FR-010).

## 11. Out of Scope (sesuai PRD)

- File editor, versioning, sharing/link publik, permission per file.
- Integrasi storage spesifik; pencarian global; sync/offline.
- Upload queue baru (dipakai ulang dari PRD 001).
- FR-014/FR-015 masuk iterasi berikut setelah approval dependency/keputusan.
