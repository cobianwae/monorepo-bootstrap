# CR-035 — Seragamkan halaman `foundations` (heading, teks mikro, warna aksen, kontrol)

**Status:** draft
**Sumber:** review — `/improve-ui` tidak formal; temuan dari pertanyaan user 2026-11-22
**Ref:** `apps/showcase/src/app/(docs)/foundations/*/page.tsx`, `apps/showcase/src/components/section-heading.tsx`, `docs/design/visual-language.md`

> Prioritas MoSCoW: **must**. Bergantung pada CR-034 (aturan). Dieksekusi atas instruksi eksplisit user; `approved`/`done` hak user.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `typography/page.tsx`, `spacing/page.tsx`, `colors/page.tsx` | Heading section `text-lg font-bold` tanpa `font-display`; motion/iconography/breakpoints memakai `text-2xl font-display`; themes dialek ketiga. | `SectionHeading` di semua. |
| 2 | major | 7 halaman | `text-[9px]`/`[10px]`/`[11px]` di luar type scale. | Gabung ke `text-xs`. |
| 3 | minor | typography, colors, spacing, breakpoints, motion | `primary` dipakai dekoratif (panel, ikon, bar, demo). | `highlight`. |
| 4 | minor | `typography/page.tsx` | Segmented control tulisan tangan (`bg-primary` terpilih). | `SegmentedControl` dari `@ds/ui`. |
| 5 | major | `breakpoints:73`, `motion:171`, `spacing:54`, `typography:352` | **Regresi dari CR ini sendiri**: konversi `primary` → `highlight` ikut mengubah `text-primary` menjadi `text-highlight` pada teks `text-xs`. Dihitung dari `themes.ts` (light): `highlight` di atas tint `highlight/20` hanya 2,48–3,93:1 di semua 8 tema (AA butuh 4,5:1). | Teks kecil kembali ke `text-foreground`; aksen tetap lewat border/bg/ikon. **Sudah diperbaiki.** |

## Perubahan yang Diusulkan

- Komponen baru `SectionHeading` di `apps/showcase/src/components/` (bukan `@ds/ui`; tidak menambah API publik). Pola sama muncul 15+ kali (3x rule terpenuhi).
- 7 halaman `foundations`: heading → `SectionHeading`; `text-[Npx]` → `text-xs`; `primary` dekoratif → `highlight`; segmented → `SegmentedControl`.
- Tidak ada perubahan token, `@ds/ui`, atau dependency.

## Tasks (jalur small-fix)

- [x] Buat `SectionHeading`.
- [x] Terapkan di 7 halaman (typography, motion, themes oleh sesi utama; colors, spacing, iconography, breakpoints oleh subagent).
- [x] Guard test lulus; lint dan `build:types` showcase hijau.
- [x] Perbaiki grid ikon iconography (9 → 6 kolom di `lg`, `title` pada label) setelah screenshot menunjukkan nama ikon terpotong.
- [x] Perbaiki regresi kontras teks `text-highlight` (temuan 5) di 4 lokasi; hitung rasio per tema dari `packages/tokens/src/themes.ts`.
- [x] Verifikasi visual browser (Chrome headless, 1440×1800): **dark dan light, Atelier / Pulse, ketujuh halaman**; typography dan motion juga di **Aurora / Nebula** (dark) dan **Blueprint / Ink** (light). Setelah perbaikan temuan 5 diambil ulang: breakpoints light, spacing light, colors light dan dark. Perubahan `motion:171` (label kotak demo, tersembunyi sampai Play) dan `typography:352` (meta pairing) **tidak tampak di viewport** screenshot; keduanya diverifikasi lewat kode, guard, lint, dan typecheck, bukan screenshot.
- [x] `next build` produksi lulus (76/76 halaman statis, lint + typecheck Next hijau) dari **salinan sementara** `apps/.showcase-build` (sudah dihapus), karena `next.config.mjs` tanpa `distDir` dan build di `apps/showcase` akan menimpa `.next` dev server. Dijalankan dua kali: sebelum dan sesudah perbaikan temuan 5. Build langsung `pnpm -C apps/showcase build` di direktori asli **tidak** dijalankan.
- [ ] Belum diverifikasi visual: halaman themes/iconography/colors/spacing/breakpoints di Aurora dan Blueprint; semua halaman di palet selain Pulse (Nebula/Ink hanya typography dan motion).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Bar skala spasi dan kotak radius di `spacing` → `highlight` | Visualisasi dekoratif, bukan peragaan token `primary`. |
| 2 | Swatch/pasangan kontras `primary` di colors/themes tidak diubah | Itu memperagakan token itu sendiri. |
| 3 | Hero `h2 text-2xl sm:text-3xl` di themes tidak diubah | Judul hero, bukan heading section; tidak cocok pola guard. |
| 4 | `text-[9px]` iconography → `text-xs` | Verifikasi pagar menuntut nol `text-[Npx]`; risiko label terpotong perlu dicek visual. |
| 5 | Grid ikon `lg:grid-cols-9` → `lg:grid-cols-6`, base `grid-cols-2` | Screenshot: nama 12–13 karakter (`ShoppingCart`, `TriangleAlert`) terpotong di 9 kolom. Di 6 kolom semua nama terbaca utuh; `title` tetap ada sebagai cadangan. |
| 6 | Teks `text-xs` di atas tint `highlight` → `text-foreground` | Rasio `text-highlight` di atas tint 2,48–3,93:1 (light, 8 tema). Ikon/border/fill `highlight` tetap: butuh 3:1, semua tema lolos (min 3,05:1 di graphite). Aturan dikunci di `visual-language.md` → Color Roles. |

## Temuan di luar scope (tidak diubah)

- `motion` → "Directional Motion": tiga kotak demo kosong sampai tombol Play ditekan (state awal `opacity-0`). Perilaku bawaan, bukan akibat CR ini. Bila dianggap masalah UX, jadikan CR terpisah (state awal terlihat, Play memutar ulang).
- **Kontras `text-highlight` pada teks kecil, pra-ada** (light mode; `highlight` vs `surface`: pulse 4,48, nebula 3,65, lagoon 3,52, ink 3,91, graphite 3,05 — di bawah 4,5:1): eyebrow `PageHeader` (`packages/ui/src/components/layout/page-header.tsx:90`, teks `text-xs` di atas `highlight/10`), badge hero `themes/page.tsx:79`, nama breakpoint `breakpoints/page.tsx:69` dan kolom token z-index `breakpoints/page.tsx:137`. Pola yang sama juga muncul di halaman lain (`components/layout-navigation`, scenarios). Mengubah `PageHeader` = komponen `@ds/ui` (a11y) → **CR terpisah** bila disetujui; tidak disentuh di sini.
- Weight scale Heading 2/3 = 600 vs praktik `font-bold` (700) dan `PageHeader` h1 `text-3xl sm:text-4xl` vs Heading 1 2rem: dicatat sebagai deviasi di `visual-language.md`.

## Design System Checks

- [x] Tidak ada hex/RGB hardcode baru; memakai token semantik.
- [x] Kontras: tidak ada nilai token yang berubah. Konversi `primary` → `highlight` sempat menurunkan kontras teks kecil (temuan 5); sudah dikoreksi. Ikon/border/fill `highlight` ≥ 3:1 di semua tema light. Rasio dihitung dari hex `themes.ts` (surface dan tint `highlight/20` dicampur manual; mengabaikan lapisan `muted/60` di bawah bar breakpoints, sehingga nilai tint adalah batas atas optimistis).
- [x] Perilaku Radix/a11y: segmented memakai Radix ToggleGroup, `aria-label` ditambahkan.
- [x] API `cva`/export tidak berubah.
- [x] State loading/empty: tidak relevan (halaman statis).
- [x] Showcase diperbarui.
- [x] `pnpm test` penuh: tokens 10, ui 707, showcase 77 — hijau. `pnpm lint` hijau. `pnpm typecheck` hanya gagal di 12 error baseline `flow-editor.test.tsx` (`@ds/ui`); `@ds/showcase build:types` hijau.

## Eksekusi

Branch: `visual-polish` (integrasi pekerjaan visual, dari `dev` `e57f7ea`; belum push/PR)
Commit: `refactor: seragamkan halaman foundations dan perbaiki bug konten [CR-035] [CR-036]` (satu commit bersama CR-036; file halaman yang sama)

- [ ] CR disetujui user.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi targeted dijalankan.
- [x] `docs/BACKLOG.md`, `docs/STATUS.md`, `docs/STATUS-LOG.md` diperbarui.
