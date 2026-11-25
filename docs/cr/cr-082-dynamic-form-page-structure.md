# CR-082 — Uplift halaman Dynamic Form: struktur demo dan accessibility notes

**Status:** done
**Sumber:** visual uplift (`/polish-ui`), audit gap vs `docs/design/visual-language.md` (approved 2026-11-23), 2026-11-25
**Ref:** `apps/showcase/src/app/(docs)/patterns/dynamic-form/page.tsx`, acuan pola `apps/showcase/src/app/(docs)/patterns/file-manager/page.tsx:196-294` (hasil CR-065/066)

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:236-257` | `PageHeader` title memuat daftar fitur ("Dynamic Form: Field Arrays, Autosave & Dirty Guard") dan description satu paragraf panjang berisi 6 klaim fitur. Peer yang sudah di-uplift (File Manager, Org Chart Studio) memakai title nama pattern saja dan description 1–2 kalimat. | Title `Dynamic Form`; description ringkas berorientasi pembaca (field arrays, autosave draft, dirty state). Badge status di header dipertahankan. |
| 2 | major | `page.tsx:266-608` | Halaman tidak punya struktur section showcase: tidak ada `<section id>` + `SectionHeading`, tidak ada pemisahan demo vs penjelasan. Seluruh isi adalah satu `<form>` dalam 5 `FormSection` (h3 `text-sm` dari `@ds/ui`), sehingga halaman tidak sejajar pola halaman pattern lain dan tidak bisa di-deep-link per section. | Bungkus form sebagai section `demo` ("Interactive demo", `scroll-mt-20`) lewat `SectionHeading` dari `apps/showcase/src/components/section-heading.tsx`; tambah section `accessibility` ("Accessibility notes") di bawah form. Jangan mengubah `FormSection` di `@ds/ui`. |
| 3 | minor | Seluruh halaman | Tidak ada catatan a11y/pattern-notes padahal halaman memuat pola kaya risiko: error summary + inline error, conditional reveal, autosave, field array. Peer File Manager menutup halaman dengan Accessibility notes terkelompok. | Section `accessibility` dengan ≥2 kelompok paralel (h3 sah): misalnya Errors & validation, Conditional & dynamic rows, Autosave & status. Isi dari perilaku nyata kode (label/`aria-describedby`, fokus, live region), bukan klaim baru. |

## Perubahan yang Diusulkan

Hanya `apps/showcase/src/app/(docs)/patterns/dynamic-form/page.tsx`. Tidak ada perubahan API publik `@ds/ui`, token, dependency, logika form, schema Zod, atau `DRAFT_KEY` localStorage.

Struktur baru:

1. `PageHeader` — eyebrow `UX Recipe Scenario` dipertahankan, title `Dynamic Form`, description dipersingkat; `actions` (badge Unsaved/Draft saved) tidak berubah.
2. Section `demo` — `SectionHeading title="Interactive demo"` + deskripsi satu kalimat cara membaca; `<form>` yang ada dipindah utuh ke dalam section ini tanpa mengubah `id`, `htmlFor`, `aria-describedby`, atau urutan field.
3. Section `accessibility` — `SectionHeading title="Accessibility notes"`, kelompok h3 sesuai temuan #3.

## Audit Selector

- Test halaman `page.test.tsx` memakai `getByLabelText` (`Project name`, `Description`, `Owner`, `Sectors targeted`, `Budget allocation`, `Headcount`, `Email for member 1`, `Role for member 1`) dan `getByRole('button', { name: /Publish project/i })` — semua harus tetap lolos tanpa edit test.
- Tidak ada selector e2e/`*.spec.ts` yang mereferensi halaman ini (grep `dynamic-form` di `apps/showcase`: hanya nav, landing, dan halaman ini).
- Guard `visual-language-guard.test.ts` sudah memindai halaman ini pada aturan docs (`manual-heading-*`, `small-text-highlight`, `manual-section-heading`); struktur baru tidak boleh memicu aturan tersebut.

## Tasks (jalur small-fix)

- [x] Persingkat title/description `PageHeader` (badge status tidak berubah). Title sudah `Dynamic Form` (CR-071); description dipersingkat 2 kalimat dengan kalimat wajib test dipertahankan.
- [x] Bungkus form dalam section `demo` dengan `SectionHeading`; pola section `space-y-4 scroll-mt-20`. Section demo + `Try it` sudah ada (CR-071); ditambahkan `description` satu kalimat cara membaca pada `Interactive demo`.
- [x] Tambah section `accessibility` (≥2 kelompok h3, isi dari perilaku nyata). 3 grup: Errors & validation, Conditional & dynamic rows, Autosave & status.
- [x] Verifikasi: test halaman lolos (ekspektasi heading disesuaikan 1 test), guard hijau, `pnpm typecheck`, `pnpm lint`, `pnpm test`, build showcase hijau.
- [x] Cek visual light/dark + mobile best-effort bila Playwright tersedia. Playwright tidak tersedia di worktree; pola class identik dengan peer File Manager (`space-y-4 scroll-mt-20`, h3 `text-xl font-bold font-display`).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | `FormSection` `@ds/ui` tidak diubah; penambahan struktur hanya di halaman showcase. | Mengubah heading `FormSection` = API publik komponen, butuh CR tersendiri. |
| 2 | Tidak menambah CodeBlock resep di CR ini. | Halaman ini sendiri adalah resep interaktif penuh; resep kode adalah lingkup terpisah bila diminta. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA. Teks notes `text-muted-foreground`/`text-foreground` — pola yang sama dengan peer File Manager; hitungan AA numerik tidak dilakukan di CR ini.
- [x] Perilaku Radix/a11y tidak rusak. Tidak ada sentuhan komponen; test a11y halaman lolos.
- [x] API `cva` dan export tetap konsisten. Tanpa perubahan `@ds/ui`.
- [x] State loading, empty, dan error relevan tersedia. Notes mendokumentasikan status draft + error summary yang sudah ada.
- [x] Showcase/docs diperbarui bila perlu. Halaman + test + dokumen ini.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass. Typecheck/lint hijau; test showcase 129/129 (targeted halaman 26/26 + guard 5/5); build showcase hijau.

## Eksekusi

Branch: `cr-082-dynamic-form-page-structure`
Commit: `refactor: uplift struktur halaman dynamic form [CR-082]`

- [x] CR disetujui user (2026-11-25).
- [x] Branch dibuat (`cr-082-dynamic-form-page-structure` dari `visual-polish` `ad91fb0`, worktree `arah-prd`).
- [x] Perubahan diimplementasikan (page.tsx + ekspektasi heading di page.test.tsx).
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui. Status tetap `approved` (hanya user boleh menetapkan `done`); baris BACKLOG tidak diubah. Ditetapkan `done` oleh user 2026-11-25 setelah review; di-merge ke `visual-polish` dan di-push.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
