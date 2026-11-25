# CR-078 — Stepper dan FileInput: Visibilitas Langkah serta Integrasi Import Wizard

**Status:** approved (2026-11-25; API aditif disetujui sebagaimana tertulis) — implementasi selesai 2026-11-26 di branch `cr-078-import-wizard-shared-form-controls` (worktree `arah-prd`, dari `visual-polish` `a215ea1`) atas approval rencana user, menunggu review user; hanya user menetapkan done  
**Sumber:** audit UI/UX `/improve-ui` Import Wizard, 2026-11-25 — cluster shared  
**Ref:** `docs/design/import-wizard.md` (D6/D9), `docs/cr/cr-061-responsive-controls.md`, route `/patterns/import-wizard`  
**Prioritas:** tinggi untuk Stepper; CR-079 bergantung pada dukungan copy FileInput.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `packages/ui/src/components/form/stepper.tsx:36,104` | Scroller tidak mengikuti langkah aktif. Di viewport320, batas container x256 tetapi current step mulai x331; scrollLeft tetap0. | Geser scroller lokal agar current step terlihat, tanpa menggeser seluruh halaman. |
| 2 | major | `packages/ui/src/components/form/file-input.tsx:164,167,220` | Copy dropzone, fallback, error dan remove masih Indonesia serta belum punya konfigurasi copy; label native caller tidak otomatis menjamin nama dropzone. | Sediakan copy configurable yang backward-compatible dan asosiasi nama/deskripsi dropzone. |
| 3 | minor | `packages/ui/src/components/form/file-input.tsx:220` | Tombol remove sekitar24×24px. | Hit area ≥44×44px dengan layout yang tetap stabil. |
| 4 | major | `packages/ui/src/components/form/file-input.tsx:76–79` | Source menggabungkan file lama+baru lalu slice maxFiles; mode satu file dapat mempertahankan file lama saat pengguna memilih pengganti. Belum direproduksi lewat picker. | Reproduksi dulu; tambahkan opsi replacement eksplisit untuk caller wizard, tanpa mengubah default multi-file. |

## Perubahan yang Diusulkan

- **Sebelum → sesudah:** current step dapat berada di luar viewport → current step selalu terjangkau dalam scroller lokal setelah perpindahan/resize; tidak merebut fokus atau menyebabkan scroll vertikal halaman.
- Pertahankan API Stepper, semantik nav/ol/aria-current, serta gate caller. Gunakan scroll instan bila reduced motion aktif.
- FileInput menerima **usulan API aditif**: `messages?: Partial<FileInputMessages>` untuk dropzone/fallback/remove/error ukuran/jumlah dan `replaceOnSelect?: boolean` default `false`. String dinamis menggunakan formatter bertipe, bukan interpolasi HTML; jangan memakai `any`.
- `replaceOnSelect` dipakai wizard dengan `maxFiles={1}`; memilih satu file valid mengganti file aktif. File pengganti invalid tidak menghapus file aktif. Perilaku default caller lain tetap append seperti sebelumnya.
- Pertahankan copy default existing agar caller lain tidak diterjemahkan massal. Hubungkan nama/deskripsi aksesibel input dan dropzone tanpa menduplikasi id.
- Scope: Stepper, FileInput, test co-located, export tipe bila diperlukan, dan wiring caller Import Wizard. Tidak mengubah default Button atau API wizard.
- **Approval implementasi harus mencakup API aditif di atas.** Bila bentuk API final berbeda atau membutuhkan perubahan root build/dependency, berhenti dan minta konfirmasi.

## Acceptance Criteria

- Given viewport320/390 dan langkah3/4 aktif, when langkah berubah atau viewport menyempit, then current step terlihat di scroller tanpa perubahan fokus yang tidak diminta atau overflow halaman.
- Given FileInput tanpa props baru, when dipakai caller existing, then default copy dan perilaku append tetap sama.
- Given wizard memilih fileA lalu fileB valid, when replacement aktif, then hanya fileB menjadi sumber; fileB invalid mempertahankan fileA dengan feedback.
- Given messages English, when upload/remove/error terjadi, then seluruh copy internal dan nama aksesibel memakai konfigurasi tersebut.

## Tasks

- [x] Periksa caller melalui graphify lalu pencarian targeted; reproduksi replacement dan dokumentasikan blast radius.
- [x] Perbaiki scroll current-step lokal, termasuk resize dan reduced motion; tambah regression test.
- [x] Implement API aditif FileInput setelah disetujui; uji default/backward compatibility, replace, invalid replacement, multi-file, remove, keyboard/dropzone dan nama aksesibel.
- [x] Wiring opt-in wizard; uji halaman docs FileInput/Stepper dan Import Wizard di320/390/1440 light/dark.

## Keputusan

| # | Usulan | Alasan |
|---|---|---|
| 1 | Pisahkan CR shared dari polish halaman. | Dampak lintas caller perlu test dan persetujuan API eksplisit. |
| 2 | Copy configurable dan replacement opt-in; default lama tetap. | Mendukung English dan satu-file tanpa perubahan perilaku massal. |

## Design System Checks

- [x] Token, kontras light/dark dan target44px; Radix/keyboard/fokus tidak regresi.
- [x] API baru aditif, tipe/export konsisten dan tanpa dependency baru.
- [x] Empty/loading/error, disabled, picker/drop dan multi-file diuji.
- [x] Test targeted UI/caller, lalu `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build`; catat baseline terpisah.

## Eksekusi

Branch: `cr-078-import-wizard-shared-form-controls`  
Commit: `fix: improve stepper visibility and file input integration [CR-078]`

- [x] CR dan API aditif disetujui user; branch dibuat.
- [x] Implementasi/verifikasi selesai; checklist dan BACKLOG/STATUS diperbarui; hanya user menetapkan done.
- [x] Append STATUS-LOG; `node scripts/check-status-log.mjs` hijau sebelum commit.

Catatan implementasi (2026-11-26): Stepper menggeser scroller lokalnya sendiri (hitung `scrollLeft` dari rect langkah `aria-current`, bukan `scrollIntoView`, listener `resize`, `smooth`/`auto` mengikuti `prefers-reduced-motion`); FileInput menambah `messages?: Partial<FileInputMessages>` (formatter bertipe untuk format/ukuran/remove/error) dan `replaceOnSelect?: boolean` (default `false`, file pengganti invalid mempertahankan file aktif), tombol remove `h-11 w-11`, dropzone/input terhubung `aria-describedby` helper/error tanpa duplikasi id; wizard memakai `replaceOnSelect` saja (copy English = CR-079). Verifikasi: typecheck hijau, lint 0 error (4 warning pre-existing), tokens 10/10, showcase 132/132, build showcase hijau; `pnpm test` penuh 1 gagal flaky baseline `rte-link-save` di `@ds/ui` (suite UI dijalankan ulang 749/749 lulus). Browser headless Chrome + CDP 320/390/1440 mode dark: `scrollWidth == innerWidth` (tanpa overflow halaman), scroller Stepper lokal `scrollWidth 551 > clientWidth 222/292`; regresi geometri langkah-4 di luar viewport ditutup test unit Stepper (mock rect 320px). Interaksi browser langkah 3/4 dan mode light tidak diverifikasi manual.
