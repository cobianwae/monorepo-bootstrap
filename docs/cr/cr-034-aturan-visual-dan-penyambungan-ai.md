# CR-034 — Aturan visual docs showcase + penyambungan ke AI (opencode)

**Status:** draft
**Sumber:** review — pertanyaan user pada sesi 2026-11-22: halaman `foundations/typography`, `motion`, `themes` tidak koheren; "gimana agar ai itu konsisten juga"
**Ref:** `docs/design/visual-language.md`, `opencode.json:3`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md`, `apps/showcase/src/test/visual-language-guard.test.ts`

> Prioritas MoSCoW: **must** (akar drift CR-035/CR-036).
> Dieksekusi atas instruksi eksplisit user ("jalankan sesuai rekomendasi hingga solving the problem. from a to z, saya kasih kamu kebebasan, asal based on current implementation"). Status `approved` dan `done` tetap hak user.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `visual-language.md:3` | Dokumen masih draft kosong ("arah visual belum dikunci") dan tidak dimuat otomatis; hanya `/polish-ui` dan `/design-language` yang merujuknya. AI yang menulis halaman baru tidak melihat aturan apa pun. | Isi dari praktik dominan, muat otomatis lewat `instructions`. |
| 2 | major | `ARCHITECTURE.md` | Lapisan art direction (`atelier`/`aurora`/`blueprint`) hanya ada di kode; tidak ada aturan apa yang variable vs invariant. | Tambah section Art Direction. |
| 3 | minor | `packages/config/eslint.base.mjs:27-31` | Tidak ada pagar mekanis untuk `text-[Npx]` atau heading manual. | Test guard di showcase (preseden: `tokens-css.test.ts`). |

## Perubahan yang Diusulkan

- `docs/design/visual-language.md`: isi Art Direction (variable/invariant), Type Scale (dipetakan ke `TYPOGRAPHY_SCALE`, tanpa token baru), Section Heading & Callout, Spacing (praktik dominan), Color Roles, Motion; deviasi `PageHeader`/weight dicatat. Status tetap `draft`.
- `opencode.json`: tambah `docs/design/visual-language.md` ke `instructions`.
- `AGENTS.md`: baris Docs Map, Session Protocol #3, Rule 14.
- `docs/ARCHITECTURE.md`: section Art Direction. `docs/CONVENTIONS.md`: section Visual.
- `apps/showcase/src/test/visual-language-guard.test.ts`: pagar untuk `app/(docs)/foundations`.
- Tidak ada perubahan API publik komponen, token, atau dependency.

## Tasks (jalur small-fix)

- [x] Isi `visual-language.md` dari praktik dominan + keputusan user.
- [x] Sambungkan ke opencode (`instructions`, AGENTS.md, ARCHITECTURE, CONVENTIONS).
- [x] Tulis test guard dan buktikan menangkap kode lama (HEAD memicu di 7/7 halaman).
- [x] Verifikasi: lint dan `build:types` showcase hijau; guard 3/3 lulus.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | `primary` = aksi; `highlight` = aksen/identitas | Praktik dominan: `text-highlight` 168 vs `text-primary` 70 di docs. Dipilih user. |
| 2 | Heading section = Heading 2 `text-2xl font-bold font-display` + ikon `highlight`; sub = `text-xl` (**ikon dan helper `level="sub"` dicabut di CR-037**) | 97 pemakaian vs 9; sesuai langkah scale. Dipilih user. |
| 3 | Teks mikro digabung ke `text-xs` | Caption/Meta 0.75rem sudah ada; tanpa token baru. Dipilih user. |
| 4 | Motion invariant antar art direction | Sederhana; tidak ada dasar membedakan. |
| 5 | State terpilih segmented = komponen `SegmentedControl` | Komponen DS sudah ada; draft awal salah menduga fill `primary`. |
| 6 | Deviasi `PageHeader` h1 dan weight 600 vs 700 dicatat, tidak diubah | Mengubahnya = API publik/nilai token; di luar scope. |
| 7 | Dokumen tetap `draft`; guard hanya `foundations` | Hanya user yang menetapkan `approved`; halaman lain belum dirapikan. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark: tidak ada nilai warna yang berubah.
- [x] Perilaku Radix/a11y tidak rusak.
- [x] API `cva` dan export tidak berubah.
- [x] Showcase/docs diperbarui.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` penuh dijalankan (lihat CR-035).

## Eksekusi

Branch: `visual-polish` (integrasi pekerjaan visual, dari `dev` `e57f7ea`; belum push/PR)
Commit: `docs: aturan visual dan penyambungan AI [CR-034]`

- [ ] CR disetujui user.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan (targeted).
- [x] `docs/BACKLOG.md`, `docs/STATUS.md`, `docs/STATUS-LOG.md` diperbarui.
