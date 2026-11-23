# CR-065 — Uplift halaman File Manager: struktur, kontrol demo, dan copy English

**Status:** draft
**Sumber:** visual uplift (`/polish-ui`), audit gap vs `docs/design/visual-language.md` (approved 2026-11-23)
**Ref:** `apps/showcase/src/app/(docs)/patterns/file-manager/page.tsx`, acuan pola `apps/showcase/src/app/(docs)/components/data-display/page.tsx`, `docs/design/file-manager.md`, temuan terkait `docs/cr/cr-053-audit-visual-components-patterns.md:44`, `docs/reviews/cr-054-visual-audit.md:255`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx` kontrol state (4 baris `Button`) | Penanda terpilih memakai `Button variant="default"` (fill `primary`). Melanggar Color Roles (`primary` hanya aksi) dan State terpilih (wajib `SegmentedControl`). | Ganti dengan `SegmentedControl` + `SegmentedControlItem` (`type="single"`, guard `if (v)`), toggle boolean sebagai segmented Off/On. |
| 2 | major | `page.tsx` urutan halaman | 4 baris kontrol (±14 tombol) muncul sebelum komponen; hero demo terdorong ke bawah, kontrol tidak berlabel grup. | Susun ulang: header → section demo (kontrol ringkas dalam satu Card, lalu `FileManager`) → section accessibility. |
| 3 | major | `page.tsx` hero + label | Copy campur Indonesia/Inggris; judul `File Manager / Panel Konteks, Preview & Quota` dan deskripsi memuat ID internal (S-005.27.02, M-001). | Semua copy halaman English, ID internal dihapus dari prosa, judul `File Manager`, deskripsi satu-dua kalimat berorientasi pengguna. |
| 4 | minor | `page.tsx:241` | Heading a11y ditulis manual (`h2 text-sm font-semibold`), 13 butir datar, panjang. Melanggar Section Heading. | `SectionHeading` + `<section id className="space-y-4 scroll-mt-20">`; kelompokkan ke 4 sub-kelompok paralel (h3 sah karena ≥2 kelompok): Keyboard, Screen reader, Dialogs & preview, Responsive & motion; ringkas tiap butir. |
| 5 | minor | `page.tsx` root + section | Root belum memakai ritme section (`space-y-4 scroll-mt-20`) dan `animate-in fade-in-50 duration-200` ada tetapi tanpa section ber-`id`. | Terapkan pola root/section standar. |
| 6 | minor | `page.tsx` data & toast | Nama folder/file, toast, error, judul toast berbahasa Indonesia (`Dokumen`, `laporan-q4.pdf`, `Folder aktif berubah`, `Gagal memuat folder…`). | English: `Documents`, `q4-report.pdf`, dst.; toast ringkas ("Moved 2 items to Archive"). |
| 7 | minor | `page.tsx` `openPreviewFor` | Query `tr` global + `textContent` untuk memicu preview; rapuh. | Dipertahankan (sudah mensimulasikan jalur keyboard); hanya ganti label tombol "Open preview" + nama tipe. Tidak refactor. |
| 8 | info (di luar scope) | `packages/ui/.../file-manager.tsx:628–1086` | Copy internal komponen masih Indonesia (`Unduh`, `Pindah`, `Hapus`, `Ganti nama`, `Folder baru`, `Coba lagi`, `Pratinjau…`). Halaman English akan menampilkan UI campur. | Lihat Pertanyaan Terbuka #1. Tidak dikerjakan di CR ini tanpa konfirmasi. |

## Perubahan yang Diusulkan

Hanya `apps/showcase/src/app/(docs)/patterns/file-manager/page.tsx`. Tidak ada perubahan API publik `@ds/ui`, token, atau dependency.

Struktur baru:

1. `PageHeader` — eyebrow `UX Recipe`, title `File Manager`, description English singkat (browse folders, bulk actions, preview, upload queue and quota).
2. Section `demo` — `SectionHeading title="Interactive demo"` + satu deskripsi (cara membaca: "Use the controls to simulate each state, then interact with the manager below.").
   - Card "Simulate states" berisi baris berlabel (label `text-xs font-semibold uppercase tracking-wider text-muted-foreground`, 2 kolom di ≥`md`): Sidebar (normal/loading/error), Content (normal/loading/empty/error), Folder tree (Populated/Empty), Quota (normal/warning/full + Loading Off/On + Error Off/On), Open preview (image/pdf/video/audio/other — `Button variant="outline"` karena aksi).
   - `FileManager` langsung di bawahnya.
3. Section `accessibility` — `SectionHeading title="Accessibility notes"`, 4 kelompok h3, ±3 butir ringkas per kelompok.

Copy: semua string halaman English (data, toast, error, label). Komponen `FileManager` tidak diubah.

## Tasks (jalur small-fix)

- [ ] Ganti 4 baris kontrol `Button` dengan `SegmentedControl` berlabel dalam satu Card (aria-label per grup).
- [ ] Susun ulang struktur: header → demo → accessibility; pola root/section standar.
- [ ] Terjemahkan seluruh copy halaman ke English (data, toast, error, hero, label).
- [ ] Rapikan accessibility notes dengan `SectionHeading` dan 4 sub-kelompok ringkas.
- [ ] Audit selector e2e: grep `file-manager`/label lama di `apps/showcase` e2e dan `*.spec.ts`; sesuaikan bila ada (pra-cek: tidak ada test yang mereferensi halaman ini, hanya `packages/ui/.../file-manager.test.tsx` yang tidak terdampak).
- [ ] Verifikasi: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build`, cek guard `visual-language-guard.test.ts`.
- [ ] Cek visual light/dark + mobile bila Playwright tersedia (best-effort).

## Pertanyaan Terbuka

1. Copy internal `FileManager` (Indonesia) — (a) biarkan, CR terpisah untuk lokalisasi komponen + update `file-manager.test.tsx`; (b) sertakan di CR ini. Rekomendasi: (a), karena mengubah string di `packages/ui` menyentuh test dan perilaku publik.
2. Perluas `visual-language-guard.test.ts` ke `patterns/file-manager`? Rekomendasi: tidak di CR ini (cakupan guard diperluas bertahap lewat CR terpisah).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Kontrol demo dikelompokkan dalam satu Card di atas `FileManager`, bukan dipindah ke bawah. | Kontrol dekat dengan komponen yang dipengaruhi; hero tetap terlihat tanpa scroll panjang. |
| 2 | `SegmentedControl` untuk pilihan state; `Button outline` hanya untuk aksi "Open preview". | Sesuai Color Roles dan State terpilih. |
| 3 | Kelompok h3 di accessibility notes. | ≥2 kelompok paralel, lebih panjang dari satu layar → sah menurut Section Heading. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA (tanpa `text-highlight` untuk teks kecil).
- [ ] Perilaku Radix/a11y tidak rusak (ToggleGroup single, aria-label, fokus ring).
- [ ] API `cva` dan export tetap konsisten (tidak ada perubahan `@ds/ui`).
- [ ] State loading, empty, dan error tetap tersedia lewat kontrol demo.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-065-file-manager-page-uplift`
Commit: `refactor: uplift halaman file manager [CR-065]`

- [ ] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
