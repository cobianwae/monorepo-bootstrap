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

- [ ] T1: tambah blok pemetaan ulang 39 `--color-*` pada `[data-theme], .dark` di `tokens.css`.
- [ ] Guard drift: test baru `packages/tokens/src/tokens-css.test.ts` yang membaca `tokens.css`, mengambil pasangan `--color-X: var(--X)` dari `@theme` dan dari blok scope, lalu menegaskan himpunan dan pemetaannya sama (mencegah kedua daftar tidak sinkron).
- [ ] Verifikasi browser (Chrome headless, build/dev showcase) pada `/patterns/mind-map`: empat kombinasi global terang/gelap × lokal terang/gelap; periksa kartu node, edge, minimap, kontrol zoom, dan panel; ukur warna efektif bukan hanya class.
- [ ] Verifikasi regresi visual ringan: satu halaman showcase lain di tema terang dan gelap tidak berubah (sampel, mis. `components/data-display`).
- [ ] Perbarui Known Issue di `docs/STATUS.md` (preview lokal light di tema global dark) sesuai hasil verifikasi; jangan klaim fix penuh jika kombinasi tertentu masih bermasalah.
- [ ] Verifikasi: `pnpm test:tokens`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build` (dan build `apps/web` bila skrip tersedia).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Jalur token (deklarasi ulang di scope), bukan perubahan showcase saja. | Pilihan user pada sesi `/improve-ui`. Memperbaiki akar masalah dan memberi konsumen DS scope tema bersarang yang bekerja. |
| 2 | Additive di `tokens.css`; `@theme` tidak diubah dan bukan `@theme inline`. | `var(--color-*)` dipakai langsung di banyak tempat; `inline` berisiko menghilangkan variabelnya. |
| 3 | Selector `[data-theme], .dark`. | Scope tema memakai salah satu atau keduanya (`tokens.css:125,207-209`); `:root` sudah dilayani `@theme`. |
| 4 | `mind-map.tsx` tidak diubah. | Pencampuran edge/node murni akibat T1; komponen sudah benar memakai token. |
| 5 | `--font-*`/art direction bersarang di luar scope (T4). | Bukan keluhan user; butuh keputusan terpisah. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik (tidak ada nilai baru).
- [ ] Kontras light dan dark lolos WCAG AA (nilai tidak berubah; `contrast.test.ts` tetap hijau; kontras efektif kanvas lokal dicek sampel di browser).
- [ ] Perilaku Radix/a11y tidak rusak (tidak ada perubahan markup).
- [ ] API `cva` dan export tetap konsisten (tidak ada perubahan `packages/ui`).
- [ ] State loading, empty, dan error relevan tersedia (state demo mind-map tetap terjangkau; dicek di mode terang/gelap).
- [ ] Showcase/docs diperbarui bila perlu (`docs/STATUS.md` Known Issue; `docs/ARCHITECTURE.md` bagian Token Pipeline bila perlu satu kalimat tentang scope bersarang).
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (catatan baseline: 12 error `flow-editor.test.tsx` pada typecheck dan test RTE `rte-link-save` kadang gagal; bukan scope).

- Cek light/dark: empat kombinasi global × lokal pada halaman mind-map; satu halaman pembanding di kedua tema global.
- Cek state: Loading, Empty, Invalid, Error eksternal, Berisi, Contoh Q1 pada mode lokal gelap.
- Cek test: `packages/tokens` (guard baru + `contrast.test.ts`); `page.test.tsx:74` tidak berubah di CR ini (class tetap `dark`).

## Eksekusi

Branch: `cr-033-token-scope-tema-bersarang`
Commit: `fix: pemetaan ulang variabel warna pada scope tema bersarang [CR-033]`

- [x] CR disetujui user (instruksi user: "approve smua", sesi /improve-ui).
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
