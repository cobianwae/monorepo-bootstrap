---
name: ux-patterns
description: Pola interaksi dan state UX — loading skeleton, empty state, error state, pola per kategori komponen, dan dokumentasi scenario di apps/showcase
tags: [design-system, ux, patterns, loading, empty-state, error-state, interactions, showcase]
compatibility: [next, opencode, claude, cursor]
---

# UX Interaction & State Patterns

## Kapan Pakai
Saat mendesain flow interaksi, menambah komponen, atau membuat data grid/table. Menentukan pola state (loading/empty/error) dan interaksi mana yang dipakai. Dipanggil setelah `product-ux` dan sebelum `ui-component`.

## State yang WAJIB Ada (Per Rule 5 AGENTS.md)

Setiap data grid/table WAJIB punya 3 state lengkap:

### 1. Loading State (Skeleton)
- Gunakan `PageSkeleton` dari `layout/page-skeleton.tsx` untuk loading halaman penuh (`cards`, `columns`, `showHeader` props)
- Untuk tabel/card list: skeleton baris dengan `Skeleton` (`base/skeleton.tsx`) — konsisten dengan lebar kolom asli
- JANGAN pakai spinner besar untuk konten utama; spinner hanya untuk aksi inline (submit, refresh)

### 2. Empty State
- Gunakan `EmptyState` dari `feedback/empty-state.tsx`
- Komponen wajib: ikon yang relevan, judul menjelaskan **apa yang kosong**, deskripsi, dan **CTA** (primary action untuk mengisi)
- Anti-pattern: kosong tanpa pesan, pesan generik "No data", tanpa next step

### 3. Error State
- Gunakan `ErrorPage` dari `feedback/error-page.tsx` untuk error fatal/404
- Untuk error partial/inline: `Alert` (`feedback/alert.tsx`) dengan variant `destructive`
- Sertakan pesan yang bisa ditindaklanjuti user, bukan stack trace

## Pola Loading per Jenis Data

| Konten | Pola |
|--------|------|
| Halaman penuh | `PageSkeleton` (header + card grid) |
| Tabel/data grid | Skeleton baris per kolom, header tetap |
| Form submit | Button loading (`Loader2` spin + `disabled`) |
| Fetch on scroll | Skeleton blok kecil + spinner inline di footer |
| Optimistic update | Update UI dulu, tampilkan status pending subtle |

## Pola Interaksi Per Kategori

### Form
- Validasi inline real-time (bukan hanya on submit)
- Error message dekat field, warna `text-destructive`, ikon jelas
- Success feedback subtle setelah submit (toast/check)
- Gunakan komponen `form/*`: `combobox`, `date-picker`, `tag-input`, `filter-builder`, `stepper`, `time-picker`

### Data Display
- Table: sort/filter/pagination konsisten — pakai `data-table.tsx` / `table.tsx`
- Sediakan `BulkActionBar` untuk seleksi multi-row
- Angka besar: `StatCard`; tren: `chart.tsx`

### Overlay & Feedback
- Destructive action: konfirmasi via `AlertDialog`, bukan `window.confirm`
- Toast untuk feedback non-blocking via `toaster.tsx` + `use-toast`
- Modal complex → `Sheet` (untuk panel samping), `Dialog` (centered)

### Navigation
- Current state selalu terlihat (active item)
- Breadcrumb untuk hierarchy; `MegaMenu` untuk banyak kategori
- `SkipLink` untuk a11y jump

## Konvensi Kognitif

- Satu primary CTA per screen — lainnya secondary/ghost
- Komponen yang bisa di-sort/ketik: selalu beri affordance jelas (ikon + tooltip)
- Consistency: pola yang sama untuk hal yang sama di seluruh app
- Hindari surprise: destructive selalu butuh confirm, undo untuk aksi berat (via toast action)

## Dokumentasi di apps/showcase

`apps/showcase` adalah living documentation. Setiap pattern baru/berubah WAJIB didokumentasikan di sana agar konsumen (`apps/web`) bisa melihat pola resmi. Tambahkan demo scenario per pola state + interaksi.

## Anti-Patterns

- ✗ Tabel tanpa loading/empty/error state
- ✗ Spinner untuk konten halaman utama (pakai skeleton)
- ✗ Empty state tanpa CTA
- ✗ Error raw/stack trace ke user
- ✗ `window.confirm` untuk destructive
- ✗ Banyak CTA primary dalam satu screen

## Integration with Other Skills

- **Sebelum**: `product-ux` (framing fitur & user flow), `ux-psychology` (cognitive load)
- **Selama**: `ui-component` (implementasi), `visual-design` (hierarchy)
- **Setelah**: `accessibility` (audit), `ux-research` (usability check)

## Checklist

1. [ ] Loading state (skeleton) ada untuk semua data fetch
2. [ ] Empty state ada dengan ikon + judul + deskripsi + CTA
3. [ ] Error state ada (fatal & inline)
4. [ ] Pola interaksi konsisten per kategori
5. [ ] Pattern didokumentasikan di showcase
6. [ ] A11y tidak dikorbankan untuk pola baru