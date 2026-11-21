# CR-029 — Mind Map: hierarki header dan judul section (setara data-display)

**Status:** approved
**Sumber:** audit `/improve-ui` — perbandingan halaman `patterns/mind-map` dengan `components/data-display` (cluster A); berbasis kode, belum ada pengecekan visual di browser
**Ref:** `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx`, `_components/mind-map-shortcuts.tsx`, `_components/mind-map-recipe.tsx`, pembanding `apps/showcase/src/app/(docs)/components/data-display/page.tsx:399-414,444`

> Prioritas MoSCoW: **must**. Urutan eksekusi: CR-033 → CR-029 → CR-030 → CR-031 → CR-032 (branch bertumpuk dari CR sebelumnya, seperti CR-026 → 027 → 028). CR-033 (token scope tema bersarang) lebih dulu agar dark mode kanvas benar sebelum polish visual.
> Catatan jujur: ini perbaikan hierarki dan konsistensi, bukan temuan a11y/kontras. Halaman terasa "kurang" karena semua judul section berbobot `text-lg` tanpa ikon, sehingga demo (fokus utama) setara dengan catatan kaki.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| A1 | major | `page.tsx:102`, `page.tsx:137`, `_components/mind-map-shortcuts.tsx:15`, `_components/mind-map-recipe.tsx:32` | Empat `h2` identik: `text-lg font-semibold text-foreground` tanpa ikon. Demo interaktif tidak menonjol dibanding Alur/Keyboard/Resep. Data-display memakai `text-2xl font-bold font-display` + ikon `h-6 w-6 text-highlight` (`data-display/page.tsx:444-447`). | Samakan pola judul: `flex items-center gap-2 font-display text-2xl font-bold text-foreground` + ikon `aria-hidden="true"` `h-6 w-6 text-highlight` (Network / ListOrdered / Keyboard / Code2). Teks `h2` tidak berubah. |
| A2 | minor | `page.tsx:88-93` | `PageHeader` tidak punya `actions`; data-display menampilkan `Badge` fakta komponen (`data-display/page.tsx:404-413`). Header terasa polos. | Isi `actions` dengan 2–3 `Badge` fakta yang benar dan dapat diverifikasi, mis. `6 state demo` (`variant="highlight"`), `Pohon pembaca layar` dan `Navigasi keyboard` (`variant="outline"`), semuanya `font-mono text-xs`. Fakta wajib dicek terhadap kode/tes saat eksekusi; buang yang tidak terbukti. |
| A3 | minor | `page.tsx:87` | Ritme spacing `space-y-10` sudah sama dengan data-display, tetapi tidak ada jeda visual antar section karena bobot judul rendah. | Tidak ada perubahan spacing; cukup A1. Cek visual setelah A1 sebelum menambah apa pun. |

## Perubahan yang Diusulkan

- Hanya `apps/showcase` (route mind-map + `_components/`). Tanpa dependency baru (`lucide-react` dan `Badge` sudah dipakai).
- Tanpa perubahan `packages/ui`, token, atau API publik.
- Komponen/route terdampak: `/patterns/mind-map` (`page.tsx`, `mind-map-shortcuts.tsx`, `mind-map-recipe.tsx`).
- Ikon: `Network` (sudah diimpor), `ListOrdered`, `Keyboard`, `Code2` — semuanya ada di `lucide-react` terpasang (`Code2` sudah dipakai di showcase; alternatif `Code`). Semua `aria-hidden`.
- Bukan cakupan: jump nav sticky dan `Banner` data-display (tidak cocok untuk 4 section). Pola `text-lg` identik di `org-chart-studio` (`page.tsx:140`, `_components/studio-shortcuts.tsx:16`, `_components/studio-recipe.tsx:22`) **tidak disentuh** — dicatat sebagai tindak lanjut.

### Before / After (sketsa)

```tsx
// Sebelum
<h2 id="mind-demo" className="text-lg font-semibold text-foreground">
  Demo interaktif
</h2>

// Sesudah
<h2 id="mind-demo" className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
  <Network aria-hidden="true" className="h-6 w-6 text-highlight" />
  <span>Demo interaktif</span>
</h2>
```

```tsx
// PageHeader
<PageHeader
  eyebrow="UX Recipe Scenario"
  eyebrowIcon={Network}
  title="Mind Map"
  description="…"
  actions={
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="highlight" className="font-mono text-xs">6 state demo</Badge>
      <Badge variant="outline" className="font-mono text-xs">Pohon pembaca layar</Badge>
    </div>
  }
/>
```

## Tasks (jalur small-fix)

- [x] A1: samakan pola judul `h2` (ukuran, `font-display`, ikon `aria-hidden`) pada demo, alur, keyboard, dan resep.
- [x] A2: isi `actions` `PageHeader` dengan `Badge` fakta yang terverifikasi (`6 state demo`: 6 tombol status di panel; `Pohon pembaca layar`: `role="tree"` di `packages/ui/src/components/canvas/mind-map.tsx:1049`).
- [x] A3: tinjau visual setelah A1; tidak mengubah spacing.
- [x] Perbarui test bila perlu: tidak perlu, asersi urutan h2 (textContent) tetap valid.
- [x] Verifikasi: test mind-map 9/9, `build:types` showcase hijau, `pnpm lint` workspace bersih, dev server `/patterns/mind-map` HTTP 200 dengan markup baru.
- [ ] Belum dikerjakan: `pnpm -C apps/showcase build` (ditunda, dev server :4000 memakai `.next`) dan cek screenshot light/dark + 390px. Cek markup saja, belum cek visual piksel.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Cakupan mind-map saja; `org-chart-studio` tidak disentuh. | Jawaban user pada sesi `/improve-ui`; kesenjangan serupa dicatat sebagai tindak lanjut. |
| 2 | Empat CR terpisah per cluster (029 A, 030 B, 031 C, 032 D). | Jawaban user; sesuai protokol "implement per cluster, bukan sekaligus". |
| 3 | Tidak meniru jump nav sticky dan `Banner`. | Empat section tidak butuh navigasi lompat; jump nav menambah kebisingan. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik (`text-foreground`, `text-highlight`).
- [ ] Kontras light dan dark lolos WCAG AA (judul besar `text-foreground`; ikon dekoratif `text-highlight`, `aria-hidden`).
- [ ] Perilaku Radix/a11y tidak rusak (`h2` tetap level 2, `aria-labelledby` tetap menunjuk id yang sama, ikon tidak masuk nama aksesibel).
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia (tidak berubah; enam status demo tetap terjangkau).
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (catatan baseline: typecheck workspace punya 12 error `flow-editor.test.tsx` dan test RTE `rte-link-save` kadang gagal; bukan scope CR ini).

- Cek light/dark: judul display, ikon `text-highlight`, `Badge` header pada kedua tema global.
- Cek state: tidak ada state baru; pastikan header tidak membungkus aneh pada 390px (`flex-wrap`).
- Cek test: `page.test.tsx:19-21` — urutan `h2` level 2 persis `['Demo interaktif','Alur brainstorming','Papan keyboard','Resep integrasi']`; ikon `aria-hidden` dan `<span>` tidak mengubah `textContent`. Test lain (`ol > li` = 6, panel, pencarian, resep) tidak boleh berubah.

## Eksekusi

Branch: `cr-029-mind-map-hierarki-header-section` (bertumpuk dari `cr-033-token-scope-tema-bersarang`)
Commit: `feat: hierarki header dan judul section mind map [CR-029]`

- [x] CR disetujui user (instruksi user: "approve smua", sesi /improve-ui).
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan (lihat Tasks di atas).
- [x] CR di-tick. Status tetap `approved` sampai user menetapkan `done`.
- [ ] `docs/STATUS.md` diperbarui bila relevan (tidak diperbarui di CR ini; dilakukan di akhir rantai).
- [x] `docs/STATUS-LOG.md` di-append dan `node scripts/check-status-log.mjs` dijalankan.
