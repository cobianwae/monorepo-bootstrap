# CR-033 — Token: scope tema bersarang tidak me-resolve ulang `--color-*` (dark mode kanvas mind-map)

**Status:** approved
**Sumber:** bug — laporan user pada sesi `/improve-ui` ("dark modenya juga gak jalan… block itemnya aneh"); akar masalah dibuktikan dengan Chrome headless terhadap CSS dev server (2026-11-22)
**Ref:** `packages/tokens/src/tokens.css:1-40`, `packages/ui/src/components/canvas/mind-map.tsx:538-539,1242-1245`, `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx:95-100`, `page.test.tsx:74`, `docs/cr/cr-027-mind-map-showcase-polish.md` (Known Issue tema campuran), `docs/cr/cr-030-mind-map-panggung-demo-card.md`

> Prioritas MoSCoW: **must** (bug; tombol "Mode gelap" demo tidak melakukan apa yang dijanjikan).
> Urutan eksekusi: **CR-033 → CR-029 → CR-030 → CR-031 → CR-032** (branch bertumpuk). CR-033 dikerjakan lebih dulu karena CR-030 perlu mekanisme tema lokal yang benar-benar bekerja.
> Perlu persetujuan eksplisit user karena menyentuh `packages/tokens` (CONVENTIONS: perubahan token wajib audit kontras). Tidak ada **nilai** warna yang berubah.
> Catatan jujur: penjelasan Known Issue di CR-027 ("warna campuran") benar sebagai gejala tetapi tidak menyebut mekanisme. Draft awal CR-030 (B2) juga salah menduga mekanismenya; sudah dikoreksi.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| T1 | major | `tokens.css:1-40` | `@theme { --color-background: var(--background); … }` (tanpa `inline`). Tailwind v4 mengeluarkan `--color-*` di `:root` dan `var(--background)` di-resolve **di `:root`**, lalu nilainya diwariskan. Scope bersarang `data-theme="pulse" class="dark"` hanya mengubah `--background`, bukan `--color-background`, sehingga utilitas `bg-background`, `bg-card`, `text-foreground`, `border-border`, dst. tetap memakai warna tema global. | Deklarasikan ulang pemetaan `--color-*` pada scope tema (`[data-theme], .dark`) agar di-resolve di scope tersebut. Additive; `@theme` tidak berubah. |
| T2 | major | `mind-map.tsx:538-539`, `:1242-1245` | Edge dan minimap memakai `var(--border)`, `var(--primary)`, `var(--background)` mentah → **ikut berubah** di scope lokal, sedangkan blok node (utilitas) tidak. Hasilnya campuran yang terlihat "aneh". | Tidak mengubah komponen. Setelah T1, kedua jalur konsisten. |
| T3 | minor | `page.test.tsx:74` | Test hanya mengecek `className` berisi `dark`; jsdom tidak memuat CSS sehingga bug warna efektif tidak pernah tertangkap. | Tambah guard drift di `packages/tokens` (lihat Tasks) dan verifikasi warna efektif di browser; catat batasan jsdom. |
| T4 | minor | `tokens.css:53-55` | `--font-*` memakai `var(--ad-*)` yang juga di-resolve di `:root`; scope `data-art-direction` bersarang punya jebakan serupa. | **Di luar scope**; dicatat sebagai tindak lanjut. |

### Bukti (Chrome headless, CSS dev server `:4000`, 2026-11-22)

Elemen `data-theme="pulse" class="dark"` di dalam dokumen `data-theme="pulse"` (terang):

| Pengukuran | Nilai |
|---|---|
| `--background` pada scope | `oklch(0.14 0.015 260)` (gelap, benar) |
| `--color-background` pada scope | `oklch(0.99 0.002 240)` (**terang, basi**) |
| `background-color` `.bg-background` pada scope | `oklch(0.99 0.002 240)` (terang) |
| `background-color` `.bg-card` di dalam scope | `oklch(1 0 0)` (terang) |
| `background` `var(--background)` mentah | `oklch(0.14 0.015 260)` (gelap) |

Prototipe perbaikan (hanya di halaman uji, bukan di repo): menambah `[data-theme] { --color-background: var(--background); … }`:

| Skenario | Container | Kartu node (`bg-card`) |
|---|---|---|
| Scope lokal `dark` di global terang | `oklch(0.14 0.015 260)` | `oklch(0.18 0.018 260)` |
| Scope lokal `light` di global `dark` (Known Issue CR-027) | `oklch(0.99 0.002 240)` | `oklch(1 0 0)` |

Keduanya benar setelah prototipe. Ini bukti mekanisme, bukan pengganti verifikasi pada halaman sebenarnya (lihat Tasks).

## Perubahan yang Diusulkan

- `packages/tokens/src/tokens.css`: tambah blok plain CSS tepat setelah `@theme`, memetakan ulang **39 variabel warna** (daftar identik dengan `@theme` baris 2–40, `--color-background` … `--color-chart-5`) pada selector `[data-theme], .dark`:

```css
/* Scope tema bersarang: --color-* di @theme di-resolve di :root, jadi harus
   dipetakan ulang pada scope agar utilitas Tailwind mengikuti tema lokal (CR-033). */
[data-theme],
.dark {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* … sisanya sama persis dengan @theme (39 baris) … */
  --color-chart-5: var(--chart-5);
}
```

- Tanpa perubahan nilai token, `themes.ts`, `contrast.ts`, `packages/ui`, `mind-map.tsx`, atau API publik komponen.
- Dampak: dokumen satu-tema (semua app saat ini, termasuk `<html data-theme>` dan `ThemeProvider` yang memasang `.dark` di root) menerima deklarasi dengan nilai yang sama → tidak ada perubahan visual. Satu-satunya scope bersarang di repo adalah `patterns/mind-map/page.tsx:95-100`; perilakunya berubah dari "campuran" menjadi benar.
- Alternatif yang **ditolak**: mengganti `@theme` → `@theme inline`. Banyak kode memakai `var(--color-*)` langsung (chart di `scenarios/clinic|crm`, `art-background.tsx`, `hero-canvas.tsx`, `tokens.css:106-107`); variabel itu bisa tidak lagi dikeluarkan di `:root`.
- Komponen/route terdampak: semua yang memakai utilitas warna (tidak berubah tampilannya di dokumen satu-tema) dan `/patterns/mind-map` (berubah, ini tujuan CR).

## Tasks (jalur small-fix)

- [x] T1: tambah blok pemetaan ulang 39 `--color-*` pada `[data-theme], .dark` di `tokens.css`.
- [x] Guard drift: test baru `packages/tokens/src/tokens-css.test.ts` yang membaca `tokens.css`, mengambil pasangan `--color-X: var(--X)` dari `@theme` dan dari blok scope, lalu menegaskan himpunan dan pemetaannya sama (mencegah kedua daftar tidak sinkron).
- [x] Verifikasi browser (Chrome headless, build/dev showcase) pada `/patterns/mind-map`: empat kombinasi global terang/gelap × lokal terang/gelap; periksa kartu node, edge, minimap, kontrol zoom, dan panel; ukur warna efektif bukan hanya class.
- [x] Verifikasi regresi visual ringan: satu halaman showcase lain di tema terang dan gelap tidak berubah (sampel, mis. `components/data-display`).
- [x] Perbarui Known Issue di `docs/STATUS.md` (preview lokal light di tema global dark) sesuai hasil verifikasi; jangan klaim fix penuh jika kombinasi tertentu masih bermasalah.
- [x] Verifikasi targeted: `pnpm test:tokens`, tsc tokens dan showcase, `pnpm lint`, test showcase (hasil di bawah).
- [ ] Verifikasi akhir rantai CR-033 → 032: `pnpm test` penuh dan `pnpm -C apps/showcase build` (ditunda; lihat Hasil verifikasi, butir "Tidak dijalankan").

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Jalur token (deklarasi ulang di scope), bukan perubahan showcase saja. | Pilihan user pada sesi `/improve-ui`. Memperbaiki akar masalah dan memberi konsumen DS scope tema bersarang yang bekerja. |
| 2 | Additive di `tokens.css`; `@theme` tidak diubah dan bukan `@theme inline`. | `var(--color-*)` dipakai langsung di banyak tempat; `inline` berisiko menghilangkan variabelnya. |
| 3 | Selector `[data-theme], .dark`. | Scope tema memakai salah satu atau keduanya (`tokens.css:125,207-209`); `:root` sudah dilayani `@theme`. |
| 4 | `mind-map.tsx` tidak diubah. | Pencampuran edge/node murni akibat T1; komponen sudah benar memakai token. |
| 5 | `--font-*`/art direction bersarang di luar scope (T4). | Bukan keluhan user; butuh keputusan terpisah. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik (tidak ada nilai baru).
- [x] Kontras light dan dark lolos WCAG AA (nilai tidak berubah; `contrast.test.ts` tetap hijau; kontras efektif kanvas lokal dicek sampel di browser).
- [x] Perilaku Radix/a11y tidak rusak (tidak ada perubahan markup).
- [x] API `cva` dan export tetap konsisten (tidak ada perubahan `packages/ui`).
- [ ] State loading, empty, dan error relevan tersedia (state demo tetap terjangkau; di browser hanya state default "Contoh Q1" yang diukur pada mode terang/gelap, state lain belum).
- [x] Showcase/docs diperbarui bila perlu (`docs/STATUS.md` Known Issue; `docs/ARCHITECTURE.md` bagian Token Pipeline bila perlu satu kalimat tentang scope bersarang).
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (typecheck: hanya 12 error baseline; `pnpm test` penuh ditunda; catatan baseline: 12 error `flow-editor.test.tsx` pada typecheck dan test RTE `rte-link-save` kadang gagal; bukan scope).

- Cek light/dark: empat kombinasi global × lokal pada halaman mind-map; satu halaman pembanding di kedua tema global.
- Cek state: Loading, Empty, Invalid, Error eksternal, Berisi, Contoh Q1 pada mode lokal gelap.
- Cek test: `packages/tokens` (guard baru + `contrast.test.ts`); `page.test.tsx:74` tidak berubah di CR ini (class tetap `dark`).

### Hasil verifikasi — 2026-11-22

Halaman asli `/patterns/mind-map`, Chrome headless (CDP) terhadap dev server `:4000`; tombol "Mode gelap" ditekan dan class `dark` pada `<html>` di-toggle. Diukur pada elemen label node "Fitur inti" (latar buram terdekat + warna teks). Kondisi "sebelum" memakai `tokens.css` dari `HEAD`, "sesudah" memakai perubahan CR ini.

| Global / lokal | Sebelum (latar node / teks) | Sesudah (latar node / teks) |
|---|---|---|
| terang / terang | `oklch(1 0 0)` / `oklch(0.18 0.02 260)` | sama |
| terang / **gelap** | `oklch(1 0 0)` / `oklch(0.18 0.02 260)` — node **tetap terang** di kanvas gelap | `oklch(0.18 0.018 260)` / `oklch(0.96 0.005 260)` |
| gelap / gelap | `oklch(0.18 0.018 260)` / `oklch(0.96 0.005 260)` | sama |
| gelap / **terang** | `oklch(0.18 0.018 260)` / `oklch(0.96 0.005 260)` — node **tetap gelap** di kanvas terang | `oklch(1 0 0)` / `oklch(0.18 0.02 260)` |

- Latar kanvas dan stroke edge sudah mengikuti scope lokal sebelum perbaikan (memakai `var(--…)` mentah); yang tertinggal adalah node (utilitas `--color-*`). Itu gejala yang dilaporkan: kanvas berubah, blok node tidak.
- Screenshot ditinjau untuk terang/gelap dan gelap/terang: sesudah perbaikan node, minimap, dan kanvas konsisten. Berkas lokal tidak di-commit: `/tmp/cr033/before-*.png`, `/tmp/cr033/after-*.png`.
- Regresi: `/components/data-display` (1915 elemen) diukur pada `<html>` terang dan gelap (color, background, border, outline, fill, stroke): **0 perbedaan** antara CSS lama dan baru.
- `pnpm test:tokens`: 10/10 (2 test baru + 8 kontras). Uji mutasi: menghapus satu baris dari blok scope membuat guard drift gagal; file dikembalikan.
- tsc `packages/tokens` dan `apps/showcase` hijau; `pnpm lint` workspace bersih; `pnpm typecheck` hanya menampilkan 12 error baseline `flow-editor.test.tsx` di `packages/ui` (runner berhenti di sana); test showcase 74/74.
- Catatan jujur: pengukuran awal yang mengambil "turunan buram pertama" node salah membaca pembungkus; angka di tabel berasal dari pengukuran ulang per elemen label.
- Tidak dijalankan: (1) `pnpm test` penuh, karena `packages/ui` dan komponen tidak diubah; akan dijalankan di akhir rantai. (2) `pnpm -C apps/showcase build`, karena `next build` menimpa `.next` yang sedang dipakai dev server `:4000`; kompilasi Tailwind sudah terbukti lewat dev server yang menyajikan blok baru. (3) build `apps/web`.
- Batasan: hanya state default "Contoh Q1" yang diukur; panel kontrol dan judul section masih ikut membalik saat "Mode gelap" ditekan sampai CR-030 membatasi scope lokal ke kanvas. SR bersuara native tidak diuji.

## Eksekusi

Branch: `cr-033-token-scope-tema-bersarang`
Commit: `fix: pemetaan ulang variabel warna pada scope tema bersarang [CR-033]`

- [x] CR disetujui user (instruksi user: "approve smua", sesi /improve-ui).
- [x] Branch dibuat (`cr-033-token-scope-tema-bersarang` dari `dev`).
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan (targeted; sisanya ditunda, lihat Hasil verifikasi).
- [x] CR di-tick; status di `docs/BACKLOG.md` tetap `approved` (hanya user yang menetapkan `done`).
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
