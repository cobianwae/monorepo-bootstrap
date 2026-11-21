# CR-026 — Mind Map: tata letak, hierarki, dan ikonografi halaman showcase

**Status:** done

User menetapkan `done` dan mengizinkan push CR-022–028 serta merge/push `dev` (2026-11-22); penutupan bersama dicatat di branch CR-028.
**Sumber:** masukan user (halaman showcase `/patterns/mind-map` terasa ngasal: demo interaktif tidak jelas, flat tanpa ikon, tipografi dan spacing tidak konsisten) + perbandingan dengan `/patterns/org-chart-studio`
**Ref:** `docs/prd/012-mind-map.md`, `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx`, pola acuan `apps/showcase/src/app/(docs)/patterns/org-chart-studio/page.tsx` + `_components/*`

> Catatan: CR-022 s.d. CR-025 hanya mengaudit token, microcopy, dan a11y komponen. Tidak ada yang menilai komposisi halaman. Ini celah audit, bukan regresi.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:87` | Root `flex flex-col gap-6 p-6` menambah padding di atas `main p-6 md:p-10` dari `ScenarioShell` (`scenario-shell.tsx:37`) sehingga gutter ganda. Halaman acuan memakai `space-y-10` + `animate-in fade-in-50`. Jarak antar-section (24px) terlalu rapat untuk 5 blok berbeda. | Ganti ke `animate-in fade-in-50 space-y-10 duration-200` tanpa `p-6`. |
| 2 | major | `page.tsx:88` | `PageHeader` tanpa `eyebrow`/`eyebrowIcon`, berbeda dengan halaman pattern lain. Identitas halaman lemah. | Tambah `eyebrow="UX Recipe Scenario"` + `eyebrowIcon` (mis. `Network`). |
| 3 | major | `page.tsx:100-127` | Panel demo tidak punya permukaan (bukan card), mencampur tiga hal setara tanpa label: pemicu status data (6 tombol), aksi (`Muat contoh 50 node`), dan toggle tampilan (`Mode gelap`, `Peta mini`). Pencarian terselip lewat `searchSlot` di antara toolbar komponen dan kanvas tanpa pembeda dari kontrol demo. Pengguna tidak tahu mana kontrol demo dan mana fitur komponen. | Bungkus kontrol demo dalam card bertajuk "Panel demo" dengan tiga baris berlabel: **Status data**, **Aksi**, **Tampilan**. Pencarian tetap di `searchSlot` (bagian resep) tetapi satu baris: label + input berikon + status di sebelah kanan. |
| 4 | minor | `page.tsx:107-114`, `:121-126`, `:143` | Tidak ada ikon sama sekali: tombol status, aksi, toggle, input cari, dan tombol salin semuanya teks polos. Halaman terasa flat dan sulit dipindai. | Ikon `lucide-react` (sudah dipakai di org-chart-studio, bukan dependency baru): `Search` pada input, `Moon`/`Sun` mode gelap, `Map` peta mini, `Upload`/`Network` muat 50 node, `RotateCcw` reset, `Copy`/`Check` salin resep. Semua `aria-hidden`. |
| 5 | minor | `page.tsx:89-99` | Daftar langkah `ol` polos: marker default, tanpa penekanan judul langkah, enam baris teks abu-abu. Tidak ada hierarki antara aksi dan penjelasan. | Samakan pola acuan: `marker:font-medium marker:text-foreground`, judul langkah `font-medium text-foreground` + detail muted. |
| 6 | minor | `page.tsx:129-139` | Section keyboard berupa `ul` dengan `kbd` yang di-inline panjang berulang (`className="rounded border border-border bg-muted px-1"` ×9). Sulit dipindai, class diulang. | Pecah ke komponen `MindMapShortcuts` berbentuk `dl` grid kartu seperti `studio-shortcuts.tsx`, satu `kbd` kecil di sana. |
| 7 | minor | `page.tsx:140-150` | Resep: `pre` tanpa `font-mono`, tanpa border, tombol salin di bawah (jauh dari judul), status salin `role=status` di bawahnya tanpa ikon. | Header baris: judul kiri, tombol salin kanan; `pre` `border border-border bg-muted/40 font-mono text-xs leading-relaxed`; ikon `Copy`/`Check`. Pertahankan `tabIndex`/`aria-label` dari CR-025. |
| 8 | minor | `page.tsx` (1 file ±150 baris) | Semua section dalam satu file; halaman acuan memakai `_components/` per blok. | Ekstrak `_components/mind-map-demo-panel.tsx`, `mind-map-shortcuts.tsx`, `mind-map-recipe.tsx`, `mind-map-demo-data.ts` mengikuti pola direktori tetangga. Bukan abstraksi baru: pola sudah ada di org-chart-studio. |

## Perubahan yang Diusulkan

Urutan section akhir (mengikuti halaman acuan, dengan demo di atas karena itu tujuan utama):

1. `PageHeader` dengan eyebrow + ikon.
2. **Panel demo** (card): Status data (segmented, tombol aktif `default`) → Aksi (`Muat contoh 50 node`, `Reset demo`) → Tampilan (`Mode gelap`, `Peta mini` sebagai toggle berikon `aria-pressed`) + hint status aktif.
3. **Demo interaktif**: kanvas MindMap + `searchSlot` satu baris berikon.
4. **Alur brainstorming** (langkah bernomor dengan judul tebal).
5. **Papan keyboard** (kartu `dl`).
6. **Resep integrasi** (header + salin berikon).

- Hanya `apps/showcase` (route mind-map + `_components/` baru). Tanpa perubahan `packages/ui`, token, atau API publik.
- Tanpa dependency baru: `lucide-react` sudah dipakai `org-chart-studio/page.tsx`.
- Tetap dipertahankan: wrapper tema lokal `data-theme="pulse"` + `dark` (test `page.test.tsx` meng-assert ini; berbeda dari org-chart-studio yang memakai `useTheme` global), seluruh perilaku demo, `id="mind-search-status"`, `min-h-11`, `tabIndex` pada resep.
- Komponen/route terpengaruh: `/patterns/mind-map` saja.

### Before / After (sketsa)

```tsx
// Sebelum
<div className="flex flex-col gap-6 p-6">
  <PageHeader title="Mind Map" description="..." />
  <section>…6 tombol status + Muat 50 node digabung…</section>
  <Button variant="outline">Mode gelap</Button>
  <Button variant="outline">Peta mini</Button>

// Sesudah
<div className="animate-in fade-in-50 space-y-10 duration-200">
  <PageHeader eyebrow="UX Recipe Scenario" eyebrowIcon={Network} title="Mind Map" description="..." />
  <MindMapDemoPanel … />   {/* card: Status data / Aksi / Tampilan */}
```

```tsx
// Pencarian (searchSlot)
<div className="mb-3 flex flex-wrap items-end gap-x-4 gap-y-2">
  <div className="min-w-64 flex-1 space-y-1 sm:max-w-sm">
    <Label htmlFor="mind-search">Cari ide</Label>
    <div className="relative">
      <Search aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input id="mind-search" className="pl-9" … />
    </div>
  </div>
  <p role="status" id="mind-search-status" data-testid="mind-search-results" className="text-sm text-muted-foreground">…</p>
</div>
```

## Tasks (jalur small-fix)

- [x] Root wrapper + `PageHeader` eyebrow/ikon (temuan 1, 2).
- [x] Ekstrak `_components/` dan data (temuan 8).
- [x] Panel demo card tiga baris berlabel + ikon (temuan 3, 4).
- [x] Pencarian satu baris berikon (temuan 3, 4).
- [x] Langkah bernomor berhierarki (temuan 5).
- [x] Papan keyboard kartu `dl` (temuan 6).
- [x] Resep: header + salin berikon + `pre` font-mono (temuan 7).
- [x] Update `page.test.tsx` bila query berubah; tambah assert grup berlabel. (Tidak perlu: query test tetap valid, tidak ada assert baru.)
- [x] Verifikasi: test showcase mind-map 6/6, eslint, tsc, `pnpm -C apps/showcase build` exit 0. Cek visual light/dark di browser belum dilakukan.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Approved user; branch dari cr-025. | Urutan eksekusi sesuai permintaan. |
| 2 | Toggle `Mode gelap`/`Peta mini` tetap `Button` + `aria-pressed` (bukan checkbox seperti studio). | Menjaga query test dan target 44px; ikon membedakan toggle dari pemicu status. |
| 3 | Mode gelap tetap wrapper lokal, bukan `useTheme` global. | Demo menunjukkan komponen di kedua mode tanpa mengubah tema showcase. |
| 4 | Kode dipecah ke `_components/` (`mind-map-demo-data.ts`, `mind-map-demo-panel.tsx`, `mind-map-shortcuts.tsx`, `mind-map-recipe.tsx`). | Pola sama dengan `org-chart-studio/_components/`. |
| 5 | Keyboard memakai `dl` berkartu; daftar shortcut dipangkas dari 9 baris ke 7. | Lebih mudah dipindai. Dipangkas: `Backspace` (sinonim Delete), `Ctrl+Y`/`Cmd+Shift+Z` (ulangi). Ulangi tetap berfungsi di komponen; hanya tidak ditampilkan di papan keyboard, dan perlu dikembalikan bila user ingin daftar lengkap. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

- Cek light/dark: card panel demo, toggle aktif, kbd, `pre` resep.
- Cek state: keenam status demo tetap terjangkau; salin sukses/gagal; viewport sempit (panel wrap, tidak overflow).
- Cek test: `page.test.tsx` (6 test) tetap hijau.

## Eksekusi

Branch: `cr-026-mind-map-showcase-layout`
Commit: `fix: rapikan tata letak halaman showcase mind map [CR-026]`

- [ ] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
