# CR-069 — OrgChartStudio: seluruh copy runtime berbahasa Inggris

**Status:** done
**Sumber:** permintaan user pada `/improve-ui` (`org-chart-studio/page.tsx`): "semua copy dalam bahasa inggris"; menutup C4 di CR-068 dan Pertanyaan Terbuka #1 CR-067
**Ref:** `packages/ui/src/components/canvas/org-chart-studio.tsx`, `packages/ui/src/components/canvas/org-chart-studio.test.tsx`, `docs/cr/cr-067-org-chart-studio-page-uplift.md`, `docs/cr/cr-068-org-chart-studio-demo-polish.md`

## Keputusan User

| # | Keputusan |
|---|---|
| 1 | Scope hanya `OrgChartStudio`. `OrgChartEditor`, `MindMap`, `FlowEditor` tidak disentuh. |
| 2 | Default `emptyActionLabel` berubah dari `Buat root` ke `Create root`. Wajib English. |
| 3 | Pesan validasi dan pengumuman live region ikut diterjemahkan. |
| 4 | Dokumen approved/shipped (PRD/story 011) tidak diedit; hanya dicatat di CR ini. (Belum dijawab eksplisit; asumsi default, dapat dikoreksi saat approval.) |

## Temuan

Semua lokasi di `packages/ui/src/components/canvas/org-chart-studio.tsx` (nomor baris perkiraan dari audit; daftar final dikonfirmasi lewat grep saat eksekusi).

### Cluster A — label kontrol, tombol, dan aksesibilitas

| # | Severity | Lokasi | Sekarang → Usulan |
|---|---|---|---|
| A1 | major | `:971`, `:977`, `:992` | `Perkecil` / `Perbesar` / `Paskan tampilan` → `Zoom out` / `Zoom in` / `Fit view` (aria-label dan title) |
| A2 | major | `:838`, `:1653` | `Perluas X` → `Expand X`; `Ciutkan X` → `Collapse X` (`Collapse X` di `:838` sudah English; samakan) |
| A3 | major | `:933`, `:941`, `:1666`, `:1679` | `Tambah bawahan untuk X` / `Tambah sejawat untuk X` → `Add report for X` / `Add sibling for X` |
| A4 | major | `:855`, `:1194`, `:1729` | `Detail X` → `Details for X`; `SheetTitle` fallback `Detail` → `Details` |
| A5 | major | `:1692`, `:1705`, `:1716`, `:1739`, `:1673`–`:1723` | `Ubah` / `Pindah` / `Hapus` / `Anak X` / `Tambah bawahan` / `Tambah sejawat` → `Edit` / `Move` / `Delete` / `Children of X` / `Add report` / `Add sibling`; akhiran `(pohon aksesibel)` → `(accessible tree)` |
| A6 | minor | `:817`, `:907`, `:910` | `Lepas untuk pindah` / `Target tidak valid` / `Enter simpan · Esc batal` → `Drop to move` / `Invalid target` / `Enter to save · Esc to cancel` |
| A7 | minor | `:554` | Badge `Cocok` → `Match` (halaman sudah menyebut badge "Match") |

### Cluster B — panel, dialog, toast

| # | Severity | Lokasi | Sekarang → Usulan |
|---|---|---|---|
| B1 | major | `:1195`, `:1257`, `:1305`, `:1324`, `:1328`, `:1332` | `Panel detail on-demand. Tambah tidak pernah membuka panel ini.` → `On-demand details panel. Adding never opens it.`; `Nama tidak boleh kosong.` → `Name can't be empty.`; `Simpan` → `Save`; `Hapus` → `Delete`; `Root tidak dapat dihapus` → `The root can't be deleted`; `Root diproteksi — tidak dapat dihapus.` → `The root is protected and can't be deleted.` |
| B2 | major | `:1381`–`:1484` | `Pindah node` → `Move node`; `Node itu sendiri` / `Turunan node ini` → `The node itself` / `Descendant of this node`; deskripsi dialog pindah; `Batal` → `Cancel`; `Hapus node` → `Delete node`; `Hapus subtree (node beserta semua anak)` → `Delete subtree (node and all its children)` |
| B3 | major | `:1932`, `:1935`, `:1936` | `Urungkan bila salah.` → `Undo if this was a mistake.`; `Urungkan` (altText dan label) → `Undo`; judul toast mutasi (Ditambah/Dipindah/Dihapus, dll.) → `Added` / `Moved` / `Deleted` / padanannya |

### Cluster C — pesan validasi, live region, status

| # | Severity | Lokasi | Sekarang → Usulan |
|---|---|---|---|
| C1 | major | `:2097`, `:2117`, `:2404`–`:2413` | Pengumuman `Node X dipindah ke Y.` / `Node X dihapus (anak dipindah ke atasan / subtree dihapus).` / pesan status drag → English (dibaca screen reader) |
| C2 | minor | `:161`, `:195`, `:246`, `:353`–`:358` | `ID duplikat…`, `Parent "…" dari node "…" tidak ditemukan.`, `Siklus terdeteksi…`, `Node tidak ditemukan.`, `Tidak dapat memindahkan ke diri sendiri.`, `…ke turunannya (siklus).`, `Sudah berada di atasan ini.` → `Duplicate ID…`, `Parent "…" of node "…" was not found.`, `Cycle detected at node "…".`, `Node not found.`, `Can't move a node onto itself.`, `Can't move a node under its own descendant (cycle).`, `Already under this parent.` |
| C3 | minor | `:2296`, `:2319`, `:2323` | `Memuat struktur organisasi…` → `Loading org structure…`; `Node terkait: X` → `Related node: X`; format `(node: X)` tetap |
| C4 | minor | `:95`, `:1778` | Default `emptyActionLabel='Buat root'` → `'Create root'`; komentar tipe diperbarui |

### Cluster D — test

| # | Severity | Lokasi | Deskripsi |
|---|---|---|---|
| D1 | major | `org-chart-studio.test.tsx` | Test meng-assert teks Indonesia (`getByRole('button', { name: … })`, `getByText`, `findByText`); semua query diperbarui ke teks English. Tidak ada perubahan perilaku yang diuji. |

## Di Luar Scope

- Komentar kode berbahasa Indonesia (konvensi: komentar produk Indonesia).
- `OrgChartEditor`, `MindMap`, `FlowEditor` dan showcase masing-masing (mis. `org-chart-editor/page.tsx:226` `Buat root pertama`).
- PRD/story/wireframe 011 yang mengutip toast Indonesia (artefak approved/shipped; catatan saja).
- Pengenalan i18n (prop `labels` / locale). Ide terpisah; butuh API publik baru dan konfirmasi.

## Perubahan yang Diusulkan

Hanya `packages/ui/src/components/canvas/org-chart-studio.tsx` dan `org-chart-studio.test.tsx`. Hanya string, tanpa perubahan struktur, varian `cva`, atau nama export. Satu efek API: nilai default `emptyActionLabel` (keputusan #2). Tanpa dependency, tanpa perubahan token.

Contoh before/after:

```tsx
// Sebelum
<button type="button" aria-label="Perkecil" title="Perkecil" ...>
// Sesudah
<button type="button" aria-label="Zoom out" title="Zoom out" ...>
```

## Tasks (jalur small-fix)

- [x] A: label kontrol, tombol, aria-label (A1–A7).
- [x] B: panel detail, dialog, toast (B1–B3).
- [x] C: validasi, live region, status, default `emptyActionLabel` (C1–C4).
- [x] D: perbarui `org-chart-studio.test.tsx`.
- [x] Audit sisa: `grep` kata Indonesia (`Tambah|Hapus|Ubah|Simpan|Batal|Urung|Pindah|Perluas|Ciutkan|tidak|dengan|yang`) di file non-komentar; cek konsumen `OrgChartStudio` yang bergantung pada default label.
- [x] Verifikasi: `org-chart-studio.test.tsx` 56/56, eslint file tersentuh hijau, guard showcase 5/5, `next build` showcase hijau. `tsc` packages/ui tetap gagal pada baseline lama `flow-editor.test.tsx` (di luar scope).
- [ ] Cek visual (best-effort): label tidak meluap di zoom controls dan handle `+` (teks English umumnya lebih pendek).

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; hanya string berubah.
- [ ] Panjang label English tidak merusak layout (kartu 240×84, toolbar, dialog).
- [x] Perilaku Radix/a11y tidak rusak (aria-label tetap bermakna; live region tetap `polite`/`alert` sesuai semula).
- [x] API `cva` dan export `@ds/ui` tidak berubah (selain default `emptyActionLabel`).
- [x] State loading, empty, invalid, error tetap tersedia.

## Pertanyaan Terbuka

1. Keputusan #4 (docs approved dibiarkan): belum dikonfirmasi eksplisit; diterapkan sebagai default.

## Eksekusi

Branch: `cr-069-org-chart-studio-english-copy` (worktree `arah-prd`, dari `visual-polish`)
Commit: `refactor: terjemahkan copy runtime org chart studio ke English [CR-069]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append dan `node scripts/check-status-log.mjs` hijau.
