# 001-01 — Komponen FileUpload (inti upload queue)

Status: done
PRD: `docs/prd/001-upload-queue.md`
FR: `FR-001`, `FR-002`, `FR-003`, `FR-004`, `FR-005`, `FR-006`, `FR-007`, `FR-008`, `FR-009`, `FR-012`, `FR-015`
Screens: `S-004.03`, `S-005.10`
Goal: Komponen `FileUpload` di `packages/ui` dengan antrean upload per file — lima status, progres, batal, ulang, error terisolasi, validasi per file, batas konkurensi — lalu ganti simulasi inline di showcase dengan komponen ini.

## Acceptance Criteria

### AC-01 — Item antrean dengan lima status

**Given** `FileUpload` dipasang dengan `uploadHandler`
**When** user memilih atau men-drop file
**Then** setiap file tampil sebagai item antrean `ul > li` dengan status `queued` / `uploading` / `done` / `error` / `canceled` (FR-001, S-005.10)
**And** item `uploading` menampilkan progress bar, item `done` menampilkan tanda sukses, item `error` / `canceled` tanpa progress bar (design D1)

### AC-02 — Ringkasan agregat antrean

**Given** antrean berisi beberapa file
**When** status item berubah
**Then** baris ringkasan menampilkan agregat "x/y selesai · n gagal" (FR-002, S-005.10)
**And** ringkasan diumumkan lewat `aria-live="polite"` yang di-debounce, bukan per tick progres (design a11y)

### AC-03 — Batal per item via AbortSignal

**Given** ada item berstatus `uploading`
**When** user menekan tombol Batal pada item itu
**Then** `AbortSignal` item terpicu, item berstatus `canceled`, dan item lain tidak terpengaruh (FR-003, S-005.10)
**And** menghapus item yang sedang `uploading` membatalkan upload lebih dulu (design transisi)

### AC-04 — Ulang per item

**Given** ada item berstatus `error` atau `canceled`
**When** user menekan Ulang pada item itu
**Then** item kembali ke `queued` dengan `attempts` bertambah dan diupload ulang saat slot konkurensi bebas (FR-004, S-005.10)

### AC-05 — Error per file terisolasi

**Given** `uploadHandler` menolak satu file dengan pesan
**When** promise handler reject
**Then** hanya item itu berstatus `error` dengan pesan spesifik dari consumer (atau pesan generik bila kosong) (FR-005, S-005.10)
**And** item lain menyelesaikan upload normal; komponen tidak gagal keseluruhan

### AC-06 — Validasi batch per file dengan alasan

**Given** user men-drop batch campuran valid dan invalid (ukuran > `maxSize` atau tipe di luar `accept`)
**When** validasi berjalan
**Then** hanya file invalid yang ditolak dengan alasan spesifik menyebut nama file (FR-006, S-005.10)
**And** file valid tetap masuk antrean; tidak ada early-return pada file invalid pertama (beda dari `FileInput` saat ini)

### AC-07 — Transport upload dimiliki consumer

**Given** komponen menerima prop `uploadHandler(file, { onProgress, signal })`
**When** upload berjalan
**Then** komponen tidak melakukan fetch/XHR sendiri; ia hanya memanggil handler dan merender progres dari `onProgress` (FR-007, S-005.10)
**And** dokumentasi komponen menyatakan consumer wajib menghormati `AbortSignal` (design D2)

### AC-08 — Keyboard dan screen reader

**Given** pengguna hanya memakai keyboard
**When** berinteraksi dengan dropzone dan antrean
**Then** dropzone bisa diaktifkan dengan Enter/Space (mewarisi pola `FileInput`), semua tombol aksi per item terjangkau Tab dengan `aria-label` spesifik ("Batalkan upload rapport.pdf"), tiap item `uploading` punya `role="progressbar"` + `aria-valuenow`, dan fokus pindah ke item tetangga setelah item dihapus (FR-008, S-005.10)

### AC-09 — Thumbnail dan ikon generik

**Given** item berupa file gambar dan `showThumbnails` aktif
**When** item dirender
**Then** thumbnail dari object URL tampil, dan URL di-revoke saat item dihapus atau komponen unmount (FR-009, S-005.10)
**And** item non-gambar menampilkan ikon generik per tipe (design D5)

### AC-10 — Batas konkurensi dan maxFiles

**Given** `maxConcurrent = 2` dan 4 file diantrekan
**When** upload berjalan
**Then** maksimal 2 item berstatus `uploading` bersamaan dan sisa berstatus `queued` urut FIFO (FR-012, S-005.10)
**And** file yang melebihi `maxFiles` ditolak langsung dengan alasan, tidak dimasukkan ke antrean (design D3)

### AC-11 — Showcase memakai komponen, bukan simulasi

**Given** halaman pattern `/patterns/file-upload` (S-005.10) dan halaman `/components/forms` (S-004.03)
**When** halaman dibuka
**Then** S-005.10 memakai `FileUpload` dari `@ds/ui` dengan mock handler dan kontrol demo (gagalkan file, latensi, `maxConcurrent`), tanpa lagi logika antrean inline (FR-015, S-005.10)
**And** S-004.03 menampilkan demo `FileUpload` (FR-015, S-004.03)

### AC-12 — Token semantik, light/dark, dan verifikasi lolos

**Given** seluruh state komponen di showcase
**When** diperiksa visual dan dijalankan verifikasi
**Then** warna status hanya memakai token semantik `success` / `destructive` / `primary` / `muted-foreground` tanpa nilai literal (design D6, FR-015)
**And** light dan dark mode setara, serta `pnpm typecheck` + `pnpm lint` + `pnpm test` lolos

## Tasks

- [x] Scaffold `packages/ui/src/components/form/file-upload.tsx`: compose `FileInput` untuk dropzone, named export, `'use client'`, props di-destructure di parameter
- [x] Definisikan tipe `UploadQueueItem`, `UploadHandler`, `FileUploadProps` sesuai kontrak design (D1–D3)
- [x] Implementasikan state antrean + scheduler konkurensi FIFO (`maxConcurrent`, default 3) dengan transisi status sesuai design
- [x] `AbortController` per item; abort saat Batal atau hapus item `uploading`
- [x] Validasi per file (`maxSize`, `accept`, `maxFiles`) dengan pesan menyebut nama file
- [x] Retry per item: `error`/`canceled` → `queued`, `attempts` bertambah
- [x] Thumbnail object URL + revoke saat hapus/unmount; ikon generik per tipe
- [x] Summary bar agregat + `aria-live` debounced; `role="progressbar"` per item; `aria-label` aksi spesifik; fokus ke item tetangga saat hapus
- [x] Callback `onAllDone` dan `onItemError`
- [x] Test co-located `file-upload.test.tsx`: status & transisi, konkurensi, batal (abort), ulang, validasi batch, error terisolasi, thumbnail revoke, a11y dasar
- [x] Export lewat `packages/ui/src/index.ts`
- [x] Upgrade `apps/showcase` S-005.10: ganti simulasi inline dengan `FileUpload` + mock handler + kontrol demo
- [x] Tambah demo `FileUpload` di S-004.03 (`/components/forms`)
- [x] Update dokumentasi pattern file-upload: kontrak `uploadHandler` + kewajiban consumer menghormati `AbortSignal`
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`
- [x] Tick tasks story ini, update `docs/BACKLOG.md` dan `docs/STATUS.md`

## Dependencies

- Story/CR lain: tidak ada (story pertama PRD 001); `001-02` bergantung pada story ini
- Package: tanpa dependency baru; menyusun komponen existing `file-input`, `progress`, `button`, `badge`, `alert`

## Notes

- Risiko: scope inti besar — mitigasi dengan memisahkan fitur should/could ke `001-02` (aksi kolektif, sortable, auto-retry, varian compact).
- Keputusan: mengikuti design D1–D6; komponen baru `FileUpload` compose `FileInput` tanpa mengubah API publiknya (OQ #1); warna status via token semantik (D6, mengacu CR-006).
- Kontrak showcase: mock handler di S-005.10 harus menghormati `AbortSignal` supaya demo Batal realistis.
