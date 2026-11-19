# Spec Desain — Upload Queue (`FileUpload`)

Status: approved
PRD: `docs/prd/001-upload-queue.md` (approved, gate 1)
Layar: `S-005.10` File Upload (`/patterns/file-upload`) + demo komponen di `S-004.03` Forms
Flow: `docs/design/flows/upload-queue.mmd`
Tanggal: 2026-11-20

## 1. Keputusan Desain

| # | Keputusan | Alasan |
|---|---|---|
| D1 | Komponen baru `FileUpload` di kategori `form`, meng-compose `FileInput` sebagai dropzone. | Keputusan user di gate 1; API `FileInput` tidak berubah (tanpa breaking change); sesuai prinsip compose-first roadmap RM-01. |
| D2 | Transport upload **milik konsumen**: konsumen menyediakan satu fungsi `UploadHandler` yang menerima `onProgress` callback dan `AbortSignal`. Komponen tidak pernah fetch/XHR sendiri. | FR-007; mendukung XHR, fetch + stream, atau SDK apa pun tanpa mengikat komponen pada satu transport. (menjawab OQ#2) |
| D3 | Default `maxConcurrent = 3`. File yang melewati `maxFiles` **ditolak langsung** dengan alasan per file, bukan diantrikan. | FR-012; perilaku tolak konsisten dengan validasi existing `FileInput`. (menjawab OQ#3) |
| D4 | Reorder queue masuk v1 sebagai prop opsional `sortable` (default `false`), memakai `@dnd-kit` + keyboard sensor yang sudah ada. Dipotong bila story membengkak — keputusan final di gate 3. | FR-011 `should`; OQ#4. |
| D5 | Thumbnail memakai object URL native, direvoke saat item dihapus/komponen unmount. Non-image mendapat ikon generik per tipe. | FR-009; tanpa dependency baru. |
| D6 | Semua state status (badge, ikon, teks %) hidup di token semantik (`success`, `destructive`, `primary`, `muted-foreground`); tidak ada hex/palette literal. | Token-first; CR-06. |

## 2. Anatomy

```text
FileUpload
├── Dropzone (compose FileInput — klik, drag & drop, fokus keyboard)
├── Summary bar (muncul saat queue ≥ 1 item)
│   ├── Ringkasan agregat: "3/5 selesai · 1 gagal"
│   └── Aksi kolektif: [Ulang semua gagal] [Batalkan semua] — tampil bila relevan
├── Queue list (ul > li per file)
│   └── QueueItem
│       ├── Thumbnail image / ikon generik per tipe
│       ├── Nama file + ukuran
│       ├── Badge status + ikon status (Progress bila uploading/done)
│       ├── Progress bar (0–100%) — disembunyikan untuk status error/canceled
│       ├── Pesan error spesifik (bila gagal/invalid)
│       └── Aksi per item: Batal | Ulang | Hapus (Button icon, aria-label jelas)
└── Success alert (semua item done — pola existing S-005.10)
```

## 3. API Publik (contract)

```ts
export type UploadItemStatus = 'queued' | 'uploading' | 'done' | 'error' | 'canceled';

export interface UploadQueueItem {
  id: string;
  file: File;
  status: UploadItemStatus;
  progress: number;        // 0–100
  error?: string;          // alasan spesifik: validasi ATAU kegagalan upload
  previewUrl?: string;     // object URL untuk image (D5)
  attempts: number;
}

export type UploadHandler = (
  file: File,
  context: { onProgress: (percent: number) => void; signal: AbortSignal }
) => Promise<void>;

export interface FileUploadProps {
  uploadHandler: UploadHandler;
  value?: UploadQueueItem[];              // controlled opsional
  onChange?: (items: UploadQueueItem[]) => void;
  maxFiles?: number;
  maxSize?: number;                        // bytes
  accept?: string;
  maxConcurrent?: number;                  // default 3 (D3)
  maxRetries?: number;                     // default 0; > 0 = auto-retry (FR-013)
  sortable?: boolean;                      // default false (D4)
  showThumbnails?: boolean;                // default true (FR-009)
  variant?: 'dropzone' | 'compact';        // default 'dropzone' (FR-014)
  disabled?: boolean;
  onAllDone?: (items: UploadQueueItem[]) => void;
  onItemError?: (item: UploadQueueItem) => void;
  helperText?: string;
  className?: string;
}
```

Aturan contract:

- Komponen mengelola transisi status; konsumen hanya menyediakan `UploadHandler`
  dan (opsional) membaca/mengendalikan lewat `value`/`onChange`.
- Kegagalan validasi (tipe, ukuran, jumlah) menghasilkan status `error` dengan
  `error` berisi alasan per file — item invalid **tidak** mencegah item valid masuk (FR-006).
- `onProgress` dari konsumen hanya boleh memajukan nilai progres komponen (0–100, clamp).

## 4. Varian (`cva`)

| Varian | Perilaku |
|---|---|
| `dropzone` (default) | Area drop penuh (compose `FileInput` variant `dropzone`) + queue di bawahnya. |
| `compact` | Baris ringkas (compose `FileInput` variant `compact`); queue item memakai padding dan thumbnail lebih kecil; kontras & touch target ≥ 24px tetap terjaga. |

## 5. State Matrix

### Per item

| State | Tampilan | Aksi tersedia | Catatan a11y |
|---|---|---|---|
| Empty (queue kosong) | Dropzone + helper text (format, ukuran maks) | Browse / drag & drop | Dropzone fokus keyboard; instruksi di `aria-label` |
| `queued` | Ikon/thumbnail, badge "Menunggu", progress 0% | Hapus; (naik/turun urutan bila `sortable`) | Posisi dalam list diumumkan saat reorder |
| `uploading` | Progress bar + `%`, spinner | **Batal** | `role="progressbar"` + `aria-valuenow`; perubahan status diumumkan via `aria-live` ringkasan (bukan tiap tick) |
| `done` | Centang, badge "Selesai", progress 100% | Hapus | Ikon + teks, bukan warna saja |
| `error` | Ikon error, **pesan alasan spesifik**, progress disembunyikan | **Ulang**, Hapus | Pesan error dalam teks (`role="status"`); tidak hanya warna |
| `canceled` | Badge "Dibatalkan", progress disembunyikan | **Ulang** (kembali ke `queued`), Hapus | Status diumumkan via `aria-live` ringkasan |

### Tingkat queue

| State | Tampilan |
|---|---|
| Semua selesai | Success alert (pola existing S-005.10) + `onAllDone` |
| Ada gagal | Summary bar menampilkan hitungan gagal + aksi "Ulang semua gagal" |
| Ada yang berjalan | Summary bar menampilkan "x/y selesai" + aksi "Batalkan semua" |

### Transisi (sumber kebenaran)

- `queued → uploading` saat slot `maxConcurrent` tersedia (FIFO).
- `uploading → done` saat `UploadHandler` resolve.
- `uploading → error` saat reject/throw; `error` = pesan dari konsumen atau pesan generik.
- `uploading → canceled` saat aksi batal: `AbortController.abort()` dipanggil; konsumen
  wajib menghormati `signal` (tertulis di docs komponen).
- `error`/`canceled → queued` via ulang; `attempts` bertambah.
- Auto-retry (bila `maxRetries > 0`): `error → queued` otomatis sampai batas, lalu gagal permanen.
- Hapus item `uploading` = batal dulu, baru keluar dari queue.

## 6. A11y & Keyboard

- Queue = `ul/li` semantik; setiap aksi item = `Button` dengan `aria-label`
  spesifik (`"Batalkan upload rapport.pdf"`, bukan "Batalkan" generik).
- Region `aria-live="polite"` (debounced) mengumumkan perubahan penting: item selesai,
  gagal, dibatalkan, dan ringkasan "x/y selesai". Tick progres **tidak** diumumkan.
- `progressbar` per item: `aria-valuemin/max/now` + label file.
- Fokus: setelah item dihapus, fokus pindah ke item tetangga; aksi batal/ulang tidak
  memindahkan fokus dari tombol.
- Dropzone mewarisi pola keyboard `FileInput` (Enter/Space membuka file picker).
- `sortable`: sensor pointer + keyboard `@dnd-kit`; alternatif non-pointer wajib ada (FR-011).
- Error state tidak hanya warna: ikon + teks alasan (FR-005).

## 7. Token & Tema

- Semua warna via token semantik: `primary` (progress/aktif), `success` (done),
  `destructive` (error), `muted-foreground` (meta teks), `border`/`card` (permukaan).
- Light/dark parity otomatis via CSS variable; tidak ada nilai literal.
- Kontras pasangan yang dipakai sudah tercakup audit `packages/tokens` (success/destructive/primary).

## 8. FR Coverage

| FR | Cakupan di spec |
|---|---|
| FR-001 | Status 5 state — §5 state matrix + transisi |
| FR-002 | Progres per item + summary bar — §2 anatomy, §5 |
| FR-003 | Batal per item (AbortSignal) — §3 contract, §5 transisi |
| FR-004 | Ulang per item — §5 transisi |
| FR-005 | Error per file spesifik — §3 aturan contract, §5, §6 |
| FR-006 | Validasi per file batch campur — §3 aturan contract |
| FR-007 | `UploadHandler` milik konsumen — D2, §3 |
| FR-008 | Keyboard + screen reader — §6 |
| FR-009 | Thumbnail image / ikon generik — D5, §2 |
| FR-010 | Ulang semua gagal / batal semua — §2 summary bar, §5 |
| FR-011 | Reorder `sortable` + keyboard — D4, §6 |
| FR-012 | `maxConcurrent` — D3, §5 transisi |
| FR-013 | Auto-retry `maxRetries` — §5 transisi |
| FR-014 | Variant `compact` — §4 |
| FR-015 | Scenario showcase — §9 |

## 9. Rencana Scenario Showcase (S-005.10)

- Ganti seluruh logika simulasi inline di halaman dengan komponen `FileUpload` +
  handler mock (simulasi progres, kegagalan acak/kontrol, abort).
- Kontrol demo: toggle gagal pada file tertentu, latensi, dan `maxConcurrent` —
  agar semua state matrix bisa didemokan.
- Sertakan state empty, berjalan, gagal, selesai; light & dark; catatan a11y.
- Update docs komponen: kontrak `UploadHandler` + kewajiban menghormati `AbortSignal`.

## 10. Out of Scope (sesuai PRD)

- Chunked/resumable upload, integrasi storage provider, persist antar reload.
- Preview panel penuh (RM-05), file manager (RM-04).
