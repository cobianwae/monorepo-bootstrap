# 002-01 — Shell tiga zona + navigasi tree-breadcrumb

Status: review (gate 3)
PRD: `docs/prd/002-file-manager.md`
FR: `FR-001`, `FR-002`, `FR-010`
Screens: `S-005.27`
Goal: Pattern `FileManager` di `packages/ui` kategori `data-display` dengan shell tiga zona (sidebar tree, konten placeholder, panel konteks placeholder), navigasi folder dua arah tree ↔ breadcrumb, dan kontrak data deklaratif — lalu tampilkan di showcase `/patterns/file-manager` dengan data tiruan.

## Acceptance Criteria

### AC-01 — Shell tiga zona responsif

**Given** `FileManager` dipasang dengan `folders` + `items` tiruan
**When** halaman `/patterns/file-manager` dibuka di desktop (≥ lg), tablet (< lg), dan mobile (< sm)
**Then** tiga zona tampil berdampingan di desktop; panel konteks menciut menjadi tab/sheet di tablet; sidebar menjadi drawer dan fungsi inti (navigasi, ganti view placeholder, seleksi placeholder, upload placeholder, preview placeholder, retry) tetap tersedia di mobile tanpa fungsi hilang (FR-001, S-005.27)
**And** warna permukaan hanya token semantik (`border`, `card`, `muted-foreground`) tanpa hex literal, light & dark setara

### AC-02 — Navigasi tree ↔ breadcrumb sinkron

**Given** folder bertingkat (≥ 3 level) dan folder aktif `activeFolderId`
**When** user klik folder di tree ATAU klik segmen breadcrumb
**Then** folder aktif berubah, highlight tree mengikuti, breadcrumb mencerminkan path folder aktif, dan `onActiveFolderChange` dipanggil sekali dengan id benar (FR-002, S-005.27)
**And** tree memakai pola `treeview` existing (panah navigasi, Enter memilih); breadcrumb memakai `nav[aria-label="Breadcrumb"]` dengan segmen fokus (FR-011 parsial, S-005.27)

### AC-03 — Kontrak deklaratif tanpa transport

**Given** story demo memakai data tiruan (`folders`, `items`) dan handler mock (log/toast)
**When** aksi navigasi/seleksi dipicu
**Then** pattern hanya memanggil handler konsumen dan tidak melakukan fetch/storage sendiri; mengganti data tiruan tidak mengubah kode pattern (FR-010, S-005.27)

### AC-04 — State sidebar + tab order dasar

**Given** `loading` / `error` pada sidebar
**When** state dipicu dari kontrol demo
**Then** sidebar menampilkan skeleton tree (`aria-busy="true"`) saat loading dan pesan + tombol retry (`role="alert"`) saat error; empty menampilkan CTA "Folder baru" yang terjangkau keyboard (FR-009 parsial sidebar, S-005.27)
**And** tab order logis toolbar → sidebar → konten → panel konteks teramati via keyboard (FR-011 parsial, S-005.27)

### AC-05 — Verifikasi baseline

**Given** seluruh state di showcase
**When** dijalankan verifikasi
**Then** `pnpm typecheck` + `pnpm lint` + `pnpm test` lolos; test co-located mencakup sinkron tree-breadcrumb dan pemanggilan `onActiveFolderChange`

## Tasks

- [x] Scaffold `packages/ui/src/components/data-display/file-manager.tsx` + tipe `FileFolder`, `FileItem`, `FileManagerProps` sesuai §3 design (props di-destructure di parameter, named export, `'use client'`)
- [x] Compose `tree-view` existing untuk zona A + `breadcrumb` existing untuk toolbar; sinkron dua arah via `activeFolderId` / `onActiveFolderChange`
- [x] Shell tiga zona + toolbar (breadcrumb, search placeholder, tombol Upload/Folder baru placeholder) + breakpoint desktop/tablet/mobile sesuai §2.2
- [x] Panel konteks placeholder (slot upload/quota/detail diisi story 002-03) dan konten placeholder (diisi story 002-02)
- [x] State sidebar loading/empty/error sesuai §6 + `aria-busy` / `role="alert"`
- [x] Test co-located `file-manager.test.tsx`: render tiga zona, klik tree → breadcrumb berubah, klik breadcrumb → tree highlight + handler dipanggil, kontrak tidak fetch
- [x] Export lewat `packages/ui/src/index.ts`
- [x] Showcase `S-005.27` `/patterns/file-manager`: tiga zona dengan data tiruan bertingkat + kontrol demo folder aktif/loading/error sidebar + catatan a11y
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`

## Dependencies

- Story/CR lain: tidak ada (story pertama PRD 002); `002-02` dan `002-03` bergantung pada story ini
- Package: tanpa dependency baru; menyusun `tree-view`, `breadcrumb`, `skeleton`, `button` existing

## Notes

- Risiko: shell terlalu generik menyerupai Workspace S-005.26 — mitigasi dengan menempel kontrak folder/file + breadcrumb sinkron sebagai diferensiasi.
- Keputusan: mengikuti D1 (kategori `data-display`, tanpa komponen inti baru), D3 (props deklaratif tanpa adapter), D6 (token semantik); FR-014/FR-015 di luar v1 (D4).
