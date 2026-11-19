# 001-02 — FileUpload: aksi kolektif, sortable, auto-retry, varian compact

Status: approved
PRD: `docs/prd/001-upload-queue.md`
FR: `FR-010`, `FR-011`, `FR-013`, `FR-014`
Screens: `S-004.03`, `S-005.10`
Goal: Melengkapi `FileUpload` dengan fitur should/could PRD 001 — retry semua gagal dan batal semua, urutkan antrean opsional, auto-retry, dan varian compact — tanpa mengubah perilaku inti dari `001-01`.

## Acceptance Criteria

### AC-01 — Ulang semua yang gagal dan Batal semua

**Given** antrean berisi minimal satu item `error`
**When** user menekan "Ulang semua yang gagal"
**Then** semua item `error` kembali ke `queued` dan masuk ulang sesuai slot konkurensi (FR-010, S-005.10)

**Given** antrean berisi minimal satu item `queued` atau `uploading`
**When** user menekan "Batal semua"
**Then** semua item `uploading` di-abort menjadi `canceled` dan item `queued` menjadi `canceled` (FR-010, S-005.10)
**And** kedua tombol hanya tampil saat relevan (ada item yang bisa diulang / dibatalkan)

### AC-02 — Urutkan antrean (sortable opsional)

**Given** `sortable = true`
**When** user menyusun ulang item dengan drag atau keyboard
**Then** urutan antrean berubah, urutan baru dipertahankan saat item baru masuk, dan jalur keyboard tersedia via sensor keyboard dnd-kit (FR-011, S-005.10)

**Given** `sortable` tidak diset (default `false`)
**When** komponen dirender
**Then** antrean statis tanpa behavior drag dan tanpa beban dnd-kit tambahan

### AC-03 — Auto-retry hingga maxRetries

**Given** `maxRetries = 2` dan `uploadHandler` selalu gagal
**When** upload item gagal
**Then** item otomatis mencoba ulang hingga `attempts` mencapai batas sebelum final berstatus `error` (FR-013, S-005.10)

**Given** `maxRetries = 0` (default)
**When** upload gagal
**Then** item langsung `error` tanpa percobaan ulang otomatis

### AC-04 — Varian compact

**Given** `variant = "compact"`
**When** komponen dirender
**Then** antrean tampil ringkas (tanpa thumbnail secara default) namun tetap memuat status, progres, error, dan aksi per item yang aksesibel (FR-014, S-004.03)

### AC-05 — Tanpa regresi dan verifikasi lolos

**Given** seluruh test dan scenario dari `001-01`
**When** fitur baru ditambahkan
**Then** perilaku inti (status, konkurensi, batal, ulang, validasi) tidak berubah dan semua test tetap hijau
**And** `pnpm typecheck` + `pnpm lint` + `pnpm test` lolos; showcase S-005.10 menampilkan demo fitur baru dalam light dan dark

## Tasks

- [ ] Tambah tombol "Ulang semua yang gagal" dan "Batal semua" di summary bar, muncul kondisional, dengan `aria-label` jelas
- [ ] Implementasikan `sortable` (default `false`) via dnd-kit (dependency sudah ada di `packages/ui`) + sensor keyboard
- [ ] Implementasikan auto-retry memakai counter `attempts` yang sudah ada dari `001-01`
- [ ] Tambah varian `compact` pada cva + layout ringkas tanpa thumbnail default
- [ ] Test: aksi kolektif, reorder + jalur keyboard, auto-retry stop di `maxRetries`, varian compact
- [ ] Perluas demo S-005.10 dengan kontrol fitur baru (toggle sortable, set `maxRetries`, varian compact)
- [ ] Tambah contoh varian compact di S-004.03
- [ ] Update dokumentasi pattern file-upload (aksi kolektif, sortable, auto-retry)
- [ ] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`
- [ ] Tick tasks story ini, update `docs/BACKLOG.md` dan `docs/STATUS.md`

## Dependencies

- Story/CR lain: `001-01-upload-queue` (komponen inti harus sudah `review`/`done`)
- Package: tanpa dependency baru; `@dnd-kit/core` + `@dnd-kit/sortable` sudah ada di `packages/ui`

## Notes

- Risiko: sortable paling berisiko menambah kompleksitas — sesuai D4, fitur ini boleh dipotong dari v1 jika story membengkak, dengan mencatat keputusan di story.
- Keputusan: auto-retry memakai `attempts` dari inti (D2/D4); varian compact mengikuti pola cva `fileInputVariants` yang sudah ada.
