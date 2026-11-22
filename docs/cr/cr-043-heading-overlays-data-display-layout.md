# CR-043 — Heading manual dan ikon di `overlays-menus`, `data-display`, `layout-navigation`

**Status:** done (ditetapkan user 2026-11-22)
**Sumber:** audit halaman tidak koheren (2026-11-22), usulan urutan 1 dari audit
**Ref:** `docs/design/visual-language.md` (Section Heading & Callout: heading tanpa ikon; Type Scale: Heading 3 = `text-xl font-bold font-display`), `docs/cr/cr-039-ikon-heading-components-patterns.md`, `docs/cr/cr-041-h2-manual-docs-non-foundations.md`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `components/overlays-menus/page.tsx` (11 `<h2>`) | Heading section memakai ikon `h-6 w-6 text-primary` (dekoratif dan memakai warna aksi). CR-039 tidak mencakup halaman ini. | Ganti ke `SectionHeading` tanpa ikon. |
| 2 | minor | `components/data-display/page.tsx:622` | `<h3 className="text-lg font-bold font-display">` manual (judul kartu demo). `text-lg` bukan skala heading. | `text-xl font-bold font-display` (Heading 3). |
| 3 | minor | `components/layout-navigation/page.tsx:349` | Sama seperti #2, judul panel demo. | `text-xl font-bold font-display`. |

## Perubahan

- `overlays-menus`: 11 blok `<h2 … flex items-center gap-2><Ikon … text-primary /><span>Judul</span></h2>` diganti `<SectionHeading title="Judul" />`. Import `lucide-react` yang tak terpakai dihapus (`MessageSquare`, `UserRound`, `MousePointer2`, `HelpCircle`). Import `SectionHeading` memakai jalur relatif `../../../../components/section-heading` (sama dengan CR-039, `vitest.config.ts` tidak punya alias `@/`).
- Paragraf deskripsi yang mengikuti heading tetap di tempatnya; tidak diubah.
- `data-display` dan `layout-navigation`: `text-lg` → `text-xl` pada `<h3>` manual. Hanya ukuran; teks, struktur, dan kelas lain tidak berubah.
- Tidak mengubah `@ds/ui`, tidak mengubah teks judul.

## Tasks

- [x] Ganti 11 heading di `overlays-menus` ke `SectionHeading`; hapus ikon dan import yang tak terpakai.
- [x] Ubah dua `<h3>` manual ke `text-xl`.
- [x] `pnpm --filter @ds/showcase lint` hijau (exit 0).
- [x] `pnpm --filter @ds/showcase build:types` hijau (exit 0).
- [x] `visual-language-guard` hijau 4/4.
- [ ] Screenshot dark dan light `overlays-menus`, `data-display`, `layout-navigation` (belum dilakukan dalam sesi ini).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Heading `overlays-menus` tanpa ikon | Sama dengan CR-037 dan CR-039: ikon heading dekoratif, dan `primary` dipakai bukan untuk aksi. |
| 2 | `text-lg` → `text-xl` pada h3 demo | `visual-language.md` menyatakan `text-lg font-bold` bukan heading; Heading 3 adalah `text-xl`. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode.
- [x] Hierarki heading: h2 section, h3 judul kartu demo.
- [x] Guard `visual-language-guard` hijau.
- [ ] Verifikasi visual belum dilakukan (lihat tasks).

## Eksekusi

Branch: `visual-polish`
Commit: `refactor: heading section tanpa ikon di overlays-menus, data-display, layout-navigation [CR-043]` (dibuat setelah verifikasi).
