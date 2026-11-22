# CR-037 — Sederhanakan `SectionHeading`: tanpa ikon, tanpa level sub

**Status:** approved (disetujui user 2026-11-22; `done` menunggu user)
**Sumber:** review — pertanyaan user 2026-11-22 ("apakah sub heading selalu ada? apakah ikon di setiap halaman tidak berlebihan?") + audit kode
**Ref:** `apps/showcase/src/components/section-heading.tsx`, `apps/showcase/src/app/(docs)/foundations/*/page.tsx`, `docs/design/visual-language.md` (Section Heading & Callout)

> Prioritas MoSCoW: **should**. Mengoreksi keputusan CR-034 #2 (ikon `highlight` di heading section) atas pilihan eksplisit user (opsi **A. Polos dulu**). `approved`/`done` hak user.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | 7 halaman `foundations` | Ikon heading tidak seragam: dari 20 `SectionHeading`, 15 berikon dan 5 tidak (`colors` 2, `spacing` 3). Aturan hanya ada di dokumen; kode dan guard tidak memaksanya. Klaim "heading seragam + ikon" pada laporan CR-035 berlebihan. | Satu bentuk saja: tanpa ikon. |
| 2 | major | `breakpoints`, `iconography`, `motion`, `themes`, `typography` | Menurut penilaian audit, 9 dari 15 ikon dekoratif/acak. `Layers` dipakai untuk 4 konsep berbeda (Responsive Composition, Size Scale, Art Direction Library; hanya Z-Index yang masuk akal); `Sparkles` untuk "Reduced Motion". Makna ikon tidak konsisten dan tidak bisa dijaga guard. | Hapus ikon dari heading section. |
| 3 | minor | `SectionHeading` | Ikon `h-6 w-6` menggeser judul ±32px dari deskripsi di bawahnya sehingga garis kiri teks putus (terlihat di screenshot `breakpoints` vs `spacing`). Hierarki sudah dibawa ukuran, bobot, dan `font-display`; ikon menjadi saluran ganda. | Heading rata kiri. |
| 4 | minor | `SectionHeading level="sub"` | 0 pemakaian di seluruh `foundations`. Abstraksi spekulatif; melanggar aturan 3x. | Hapus prop `level`; peran Heading 3 tetap ada di scale. |

## Perubahan yang Diusulkan

- `SectionHeading`: hapus prop `icon` dan `level`; tetap `h2 text-2xl font-bold font-display` + deskripsi opsional + `actions`.
- 5 halaman: hapus 15 `icon=` dan import ikon yang tidak terpakai lagi.
- Guard: aturan baru `manual-heading-with-icon` (`<h2>` dengan `flex items-center`). Larangan `icon` di `SectionHeading` dijaga typecheck (prop tidak ada).
- `visual-language.md`: Section Heading & Callout, Type Scale (baris Sub-section), Color Roles (`highlight`), Pagar Otomatis, Changelog.
- Tidak ada perubahan token, `@ds/ui`, atau dependency.

## Tasks (jalur small-fix)

- [x] Sederhanakan `SectionHeading` (hapus `icon`, `level`).
- [x] Hapus 15 `icon=` dan import yang jadi tidak terpakai di 5 halaman.
- [x] Perketat guard (`manual-heading-with-icon`); terbukti memicu pada kode lama (motion 4, iconography 3, breakpoints 3 pola h2 manual berikon).
- [x] Perbarui `visual-language.md`.
- [x] Lint, `build:types` showcase, dan guard 3/3 hijau.
- [x] `next build` produksi lulus (76/76) dari salinan sementara `apps/.showcase-build` (dihapus). Build langsung `pnpm -C apps/showcase build` **tidak** dijalankan.
- [x] Verifikasi visual (Chrome headless, 1440×1800, Atelier / Pulse): breakpoints light, motion light, typography dark, iconography light, themes dark — heading rata kiri dengan deskripsi, hierarki tetap jelas.
- [x] Verifikasi visual colors/spacing dan art direction Aurora/Blueprint dilihat lewat screenshot (CR-052). CR ini tidak mengubah colors/spacing.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Opsi A: heading section tanpa ikon; hapus `icon` dan `level` | Dipilih user. Sederhana, konsisten otomatis, selaras aturan 3x. |
| 2 | Deskripsi opsional hanya sebagai **aturan** (isi bila menambah informasi di luar judul); teks deskripsi yang sudah ada tidak diubah | Di luar scope CR ini; 11 dari 20 heading punya deskripsi. |
| 3 | Ikon bervokabuler tertutup (prop `kind`: demo, kode, a11y, peringatan) ditunda | Dibangun hanya setelah ≥3 kasus nyata (aturan 3x); bila ada, lewat CR terpisah dan typecheck menjaga konsistensi. |
| 4 | Ikon kecil di dalam panel/kartu (mis. `Sliders` pada "Interactive Specimen Tester", `Check` pada kartu tema) tidak diubah | Itu judul panel/status, bukan heading section. |
| 5 | Halaman `components/*` dan `patterns/*` (±81 ikon `h-6 w-6 text-highlight` pola lama) tidak disentuh | Ditangani saat CR rapikan `components`/`patterns` (bersama ±98 `text-[10/11px]`). |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode baru.
- [x] Kontras: tidak ada warna yang berubah; justru berkurang penggunaan aksen `highlight`.
- [x] Perilaku Radix/a11y: ikon yang dihapus berstatus `aria-hidden` (dekoratif), tidak ada yang bermakna bagi pembaca layar.
- [x] API `cva`/export `@ds/ui` tidak berubah (`SectionHeading` hanya di showcase).
- [x] State loading/empty: tidak relevan (halaman statis).
- [x] Showcase/docs diperbarui.
- [x] `pnpm lint` hijau. `pnpm typecheck` hanya 12 error baseline `flow-editor.test.tsx` (`@ds/ui`). Test: tokens 10/10, showcase 77/77, ui 707/707 pada run ulang. **Catatan jujur:** satu run `pnpm test` penuh sebelumnya gagal 1 tes di `packages/ui` (smoke RichTextEditor `rte-link-save`, baseline di Known Issues, sensitif timing); tes itu juga gagal 3 dari 3 saat dijalankan terisolasi dengan load mesin tinggi (±14), lalu lulus pada run penuh berikutnya. `packages/ui` dan `packages/tokens` tidak punya diff terhadap `e57f7ea`, jadi kegagalan itu tidak berasal dari CR ini.

## Eksekusi

Branch: `visual-polish` (integrasi pekerjaan visual; belum push/PR)
Commit: `refactor: sederhanakan SectionHeading tanpa ikon dan level sub [CR-037]`

- [x] CR disetujui user (instruksi 2026-11-22: "setuju semua CR kecuali CR-012 dan CR-013").
- [x] Perubahan diimplementasikan.
- [x] Verifikasi targeted dijalankan.
- [x] `docs/BACKLOG.md`, `docs/STATUS.md`, `docs/STATUS-LOG.md` diperbarui.
