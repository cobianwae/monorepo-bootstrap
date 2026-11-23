# CR-066 — Uplift halaman Org Chart Studio: struktur demo-first, kontrol segmented, dan copy English

**Status:** done
**Sumber:** visual uplift (`/polish-ui`), audit gap vs `docs/design/visual-language.md` (approved 2026-11-23)
**Ref:** `apps/showcase/src/app/(docs)/patterns/org-chart-studio/page.tsx` + `_components/*`, acuan pola `apps/showcase/src/app/(docs)/components/data-display/page.tsx`, preseden `docs/cr/cr-065-file-manager-page-uplift.md`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `_components/studio-demo-panel.tsx:58-68`, `:75-83` | Penanda state terpilih memakai `Button variant="default"` (fill `primary`) dan `secondary`. Melanggar Color Roles (`primary` hanya aksi) dan State terpilih (wajib `SegmentedControl`). | `SegmentedControl` untuk 6 state dan 3 jenis dataset invalid. |
| 2 | major | `page.tsx:121-181` urutan halaman | Sebelum kanvas ada: panel demo (±12 kontrol), daftar 6 langkah, tombol Reset (duplikat dengan panel), search + status. Komponen utama terdorong jauh ke bawah; "Reset demo" muncul dua kali, "Muat contoh" duplikat dengan state "Contoh 40". | Susun ulang demo-first: header → section "Interactive demo" (satu Card kontrol ringkas: state, search, opsi → kanvas langsung di bawahnya) → "Try it" (langkah) → "Integration recipe" → "Keyboard & accessibility". Hapus duplikasi (satu Reset, satu cara memuat contoh). |
| 3 | major | seluruh halaman + `_components/*` | Copy campur Indonesia/Inggris; judul `Org Chart Studio / Studio Organisasi`; deskripsi memuat ID internal (S-005.34.01, PRD 011, M-007/M-008, FR-012/013/014) dan jargon ("state matrix", "controlled"). | Semua copy English, ID internal dihapus dari prosa, judul `Org Chart Studio`, deskripsi 1–2 kalimat berorientasi pengguna. |
| 4 | minor | `page.tsx:140`, `studio-recipe.tsx:22`, `studio-shortcuts.tsx:16`, `studio-demo-panel.tsx:50` | Heading section manual (`h2 text-lg font-semibold` / `text-base`) bukan `SectionHeading`; tidak ber-`scroll-mt-20`, tidak memakai ritme `space-y-4`. | `SectionHeading` + `<section id className="space-y-4 scroll-mt-20">`. |
| 5 | minor | `studio-demo-panel.tsx:89-106` | Checkbox native `<input type="checkbox" accent-primary>` untuk Minimap/Dark mode; tidak konsisten dengan DS. | Minimap: `SegmentedControl` Off/On (atau `Switch` DS bila ada); Dark mode dihapus dari panel (sudah ada theme toggle global — dikonfirmasi di pertanyaan #2). |
| 6 | minor | `studio-recipe.tsx:29`, `:20-28` | `<pre>` polos + tombol "Salin" di luar bingkai; tidak seragam dengan `CodeBlock` (sudah dipakai di data-display). | Ganti ke `CodeBlock` DS (`filename`, `language="tsx"`, copy bawaan). Hapus logika salin manual. |
| 7 | minor | `studio-demo-data.ts`, `page.tsx` | Data dan toast berbahasa Indonesia (nama dept, "Unit baru", `Buat root`, dataset invalid "Ganda"/"Yatim", resep kode berkomentar ID). | English: label/toast/subtitle/komentar; nama orang tetap. Jenis invalid: `Duplicate ID`, `Missing parent`, `Cycle`. |
| 8 | minor | `studio-shortcuts.tsx` | Papan keyboard + 3 paragraf catatan a11y rapat (`text-xs`), berisi ID internal; tidak terkelompok. | Tabel ringkas shortcut (`dl` grid dipertahankan) + `SectionHeading` "Keyboard & accessibility"; catatan a11y jadi daftar 4 butir (Screen reader, Live regions, Focus, Motion & touch). |
| 9 | info (di luar scope) | `packages/ui/src/components/canvas/org-chart-studio*` | Copy internal komponen (tooltip, dialog, toast "Dihapus — Urungkan", dsb.) masih Indonesia; halaman English akan menampilkan UI campur. `org-chart-studio.test.tsx` meng-assert teks tersebut. | Lihat Pertanyaan Terbuka #1. Tidak dikerjakan di CR ini tanpa konfirmasi. |

## Perubahan yang Diusulkan

Hanya `apps/showcase/src/app/(docs)/patterns/org-chart-studio/` (page + 4 file `_components`). Tidak ada perubahan API publik `@ds/ui`, token, atau dependency.

Struktur baru (urutan terbaik untuk UX: lihat dulu, coba, lalu pelajari):

1. `PageHeader` — eyebrow `UX Recipe`, title `Org Chart Studio`, description: "Build and edit an org chart on a canvas — add, move, delete and undo, with search and a full keyboard path. Your page owns the data; the component never fetches or saves on its own."
2. Section `demo` — `SectionHeading title="Interactive demo"` + deskripsi singkat ("Switch states to see how the studio behaves, then edit the chart below.").
   - Satu `Card` "Simulate states": baris berlabel (`text-xs font-semibold uppercase tracking-wider text-muted-foreground`): **State** (`SegmentedControl`: Populated / 40 people / Loading / Empty / Invalid / External error), **Invalid data** (hanya saat Invalid: Duplicate ID / Missing parent / Cycle), **Minimap** (Off/On), **Search** (Input), dan satu tombol `Reset demo`.
   - Status line `role="status"` (meta jumlah orang/dept + hasil pencarian) di dalam Card.
   - Alert external error, lalu `OrgChartStudio` di bawahnya; satu paragraf bantu singkat.
3. Section `try-it` — `SectionHeading title="Try it"`: 6 langkah (Add, Move, Delete & undo, Search, Reset, …) diringkas, `ol` dipertahankan.
4. Section `recipe` — `SectionHeading title="Integration recipe"` + `CodeBlock` (resep English).
5. Section `keyboard-a11y` — `SectionHeading title="Keyboard & accessibility"`: grid shortcut + 4 butir catatan a11y.

Semua section memakai pola `space-y-4 scroll-mt-20`; root `animate-in fade-in-50 space-y-10 duration-200`.

## Tasks (jalur small-fix)

- [x] `studio-demo-panel.tsx`: ganti `Button` penanda terpilih dan checkbox dengan `SegmentedControl`; label English; hapus duplikasi tombol "Muat contoh"/Reset ganda.
- [x] `page.tsx`: susun ulang struktur demo-first, satu Card kontrol, pindah search + status ke Card; copy/toast/hero English; hapus ID internal dari prosa.
- [x] `studio-demo-data.ts`: terjemahkan label, subtitle, dept, resep, `STUDIO_STEPS`, dan jenis invalid ke English.
- [x] `studio-recipe.tsx`: pakai `CodeBlock`; `SectionHeading`.
- [x] `studio-shortcuts.tsx`: `SectionHeading`, copy English, catatan a11y jadi 4 butir.
- [x] Audit selector/test: pra-cek grep — tidak ada test/e2e yang mereferensi halaman ini (hanya `packages/ui/.../org-chart-studio.test.tsx` yang tidak terdampak). Ulangi grep (`org-studio-`, label lama) sebelum commit; id `org-studio-search` dipertahankan untuk tautan/label.
- [x] Verifikasi: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build`, guard `visual-language-guard.test.ts`.
- [ ] Cek visual light/dark + mobile bila Playwright tersedia (best-effort).

## Pertanyaan Terbuka

1. Copy internal `OrgChartStudio` (Indonesia, di `packages/ui`) — (a) biarkan, CR lokalisasi terpisah + update `org-chart-studio.test.tsx`; (b) sertakan di CR ini. Rekomendasi: (a), seperti CR-065.
2. Toggle "Dark mode" di panel demo: hapus (theme toggle global sudah ada) atau pertahankan sebagai `SegmentedControl` Light/Dark? Rekomendasi: hapus.
3. Pertahankan state "40 people" sebagai pilihan segmented dan hapus tombol "Muat contoh" terpisah? Rekomendasi: ya (satu cara, bukan dua).

## Keputusan Pertanyaan Terbuka

User menyetujui CR dengan rekomendasi default: copy internal `OrgChartStudio` tidak diubah (#1), toggle Dark mode dihapus (#2), "40 people" jadi pilihan segmented dan tombol "Muat contoh" dihapus (#3).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Kontrol dikelompokkan dalam satu Card tepat di atas kanvas; langkah dan resep dipindah di bawah kanvas. | Komponen terlihat tanpa scroll panjang; kontrol dekat dengan yang dipengaruhi. |
| 2 | `SegmentedControl` untuk state/toggle; `Button` hanya untuk aksi (Reset, Retry). | Color Roles + State terpilih. |
| 3 | Resep memakai `CodeBlock` DS. | Seragam dengan halaman lain (data-display), copy bawaan teruji. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA (tanpa `text-highlight` untuk teks kecil).
- [ ] Perilaku Radix/a11y tidak rusak (ToggleGroup single, aria-label per grup, fokus ring).
- [ ] API `cva` dan export tetap konsisten (tidak ada perubahan `@ds/ui`).
- [ ] State loading, empty, invalid, dan error eksternal tetap tersedia lewat kontrol demo.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-066-org-chart-studio-page-uplift`
Commit: `refactor: uplift halaman org chart studio [CR-066]`

- [x] CR disetujui user.
- [x] Branch dibuat (worktree `arah-story`, dari `visual-polish` `2b319be`).
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
