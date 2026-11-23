# CR-066 — File Manager: poles halaman demo, copy English komponen, target sentuh segmented

**Status:** approved
**Sumber:** `/improve-ui` (audit `ui-designer`) atas `apps/showcase/src/app/(docs)/patterns/file-manager/page.tsx`
**Ref:** `docs/cr/cr-065-file-manager-page-uplift.md` (done), `docs/design/file-manager.md`, `docs/stories/002-*`, `packages/ui/src/components/data-display/file-manager.tsx`, `packages/ui/src/components/form/segmented-control.tsx`

Tiga cluster digabung atas permintaan user; dikerjakan berurutan A → B → C dengan commit terpisah per cluster dalam satu branch.

## Temuan

### Cluster A — Halaman showcase

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| A1 | major | `page.tsx:158-166` (`openPreviewFor`) | Mencari `tr`; di view grid (listbox, tanpa `tr`) atau saat content `loading`/`empty`/`error`, tombol "Open preview" tidak berbuat apa-apa dan tanpa feedback. | Set `view='list'` dan `contentState='normal'` (dan `sidebarState='normal'`, `treeEmpty` off) sebelum memicu preview. |
| A2 | minor | `page.tsx:171-175`, `:278` | Toast "Folder changed" dan "Opened" duplikat dengan perubahan UI yang sudah terlihat (breadcrumb/sidebar/dialog). | Hapus kedua toast; toast hanya untuk aksi yang mengubah data (rename, move, delete, create, download). |
| A3 | minor | `page.tsx:221-228` | Quota memakai 3 kontrol (level, loading, error) yang saling tumpang tindih. | Satu segmented `Quota`: `normal / warning / full / loading / error`. |
| A4 | minor | `page.tsx:224` | "Empty folder tree" ambigu terhadap "Content: empty". | Gabungkan ke kontrol `Sidebar`: `normal / loading / error / empty`. |

Hasil A: 6 kontrol segmented menjadi 4 (Sidebar, Content, Quota) + baris Open preview.

### Cluster B — Copy komponen `FileManager`

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| B1 | major | `file-manager.tsx:538, 628–1311` | Seluruh microcopy dan `aria-label` komponen masih Indonesia (Unduh, Pindah, Hapus, Ganti nama, Folder baru, Coba lagi, Semua tipe, Kuota penyimpanan, Cari di folder ini, Mode tampilan, dst.) sehingga halaman English tampil campur. | Terjemahkan ke English: string tampil, `aria-label`, empty/error state, dialog M-001/M-002/M-003. Tanpa prop `labels` baru (aturan 3x belum terpenuhi). |

### Cluster C — Target sentuh `SegmentedControlItem`

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| C1 | minor | `segmented-control.tsx:36` | Item `py-1.5 text-sm` ≈ 32px, di bawah target 44px aturan proyek; berdampak ke semua pemakai. | Tambah `pointer-coarse:min-h-11` (hanya perangkat sentuh) agar tampilan desktop tidak berubah. Tanpa perubahan props/export. |

## Perubahan yang Diusulkan

- A: hanya `apps/showcase/.../patterns/file-manager/page.tsx`.
- B: `packages/ui/.../file-manager.tsx` (string saja), `file-manager.test.tsx` (selector/teks), `docs/design/file-manager.md` dan `docs/stories/002-0{1..4}-*.md` bila menyebut label lama. **Dampak API publik:** teks tampil dan `aria-label` berubah; props/export tidak berubah.
- C: `packages/ui/.../segmented-control.tsx` (satu class), cek test snapshot/class yang terdampak.

## Tasks (jalur small-fix)

- [x] A1: `openPreviewFor` mereset view/state demo sebelum fokus ke baris.
- [x] A2: hapus toast `Folder changed` dan `Opened`.
- [x] A3/A4: gabungkan kontrol Quota dan Sidebar; sesuaikan turunan state (`quotaLoading`, `quotaError`, `treeEmpty`).
- [x] B1: terjemahkan copy `file-manager.tsx` ke English (string + `aria-label`).
- [x] B1: perbarui `file-manager.test.tsx`; grep `Unduh|Pindah|Hapus|Ganti nama|Folder baru|Coba lagi|Kuota` di `apps/` dan `docs/` untuk selector/rujukan lain.
- [x] B1: perbarui `docs/design/file-manager.md` dan story 002-* yang menyebut label lama.
- [x] C1: tambah `pointer-coarse:min-h-11` pada `SegmentedControlItem`; cek test terkait.
- [x] Audit selector e2e/test yang terdampak (showcase page tests, `file-manager.test.tsx`, test segmented).
- [x] Verifikasi: `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build`; `pnpm typecheck` (baseline 12 error lama FlowEditor dicatat, bukan regresi).
- [ ] Cek browser light/dark, mobile (preview dari view grid, state error/loading) bila memungkinkan.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Tiga cluster dalam satu CR, tiga commit terpisah. | Permintaan user; tetap bisa di-revert per cluster. |
| 2 | Copy komponen English tanpa prop `labels`. | Hindari API baru; i18n penuh butuh PRD tersendiri. |
| 3 | C1 hanya untuk pointer kasar. | Menjaga density desktop; memenuhi target sentuh di mobile. |
| 4 | A5 (catatan a11y ditulis tangan) tidak dikerjakan. | Tidak melanggar aturan; dicatat saja. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak (ToggleGroup, dialog focus trap, aria-label tetap ada dan bermakna).
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error tetap tersedia lewat kontrol demo.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (kecuali baseline tercatat).

## Eksekusi

Branch: `cr-066-file-manager-polish-and-copy`
Commit: `refactor: <deskripsi cluster> [CR-066]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.

## Hasil

Commit: A `refactor: poles kontrol demo dan preview halaman file manager`, B `refactor: terjemahkan copy FileManager ke English`, C `refactor: target sentuh SegmentedControlItem`. Verifikasi: lint lulus; tes tokens 10, ui 737, showcase 94 lulus; build showcase lulus; typecheck 12 error lama FlowEditor (baseline, bukan regresi). Story 002-* tidak diubah (artefak approved; label tampil hanya dikutip dalam prosa). Cek browser light/dark/mobile belum dijalankan.
