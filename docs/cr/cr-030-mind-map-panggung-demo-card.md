# CR-030 — Mind Map: panggung demo dalam Card (kurangi bingkai bersarang)

**Status:** approved
**Sumber:** audit `/improve-ui` — perbandingan halaman `patterns/mind-map` dengan `components/data-display` (cluster B); berbasis kode, belum ada pengecekan visual di browser
**Ref:** `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx:95-133`, `_components/mind-map-demo-panel.tsx`, `packages/ui/src/components/canvas/mind-map.tsx:1211`, `docs/cr/cr-027-mind-map-showcase-polish.md` (Known Issue tema campuran)

> Prioritas MoSCoW: **must**. Bergantung pada urutan eksekusi CR-033 → CR-029 → CR-030 (branch bertumpuk).
> **Bergantung pada CR-033.** Akar warna campuran/dark mode kanvas tidak bekerja ada di token (`--color-*` tidak di-resolve ulang pada scope bersarang), bukan di penempatan scope. Tanpa CR-033, B2 di bawah **tidak** membuat kanvas gelap dengan benar. CR ini hanya memastikan scope lokal dipasang di tempat yang tepat (kanvas), bukan memperbaiki mekanismenya.
> Koreksi draft awal: versi pertama CR ini menyebut "memitigasi sebagian" Known Issue CR-027 dan menduga panel kontrol ikut terbalik warnanya. Pengukuran browser (lihat CR-033) menunjukkan utilitas Tailwind di scope lokal tidak berubah sama sekali; itu klaim yang salah dan sudah dihapus.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| B1 | major | `page.tsx:95-100`, `mind-map-demo-panel.tsx:36`, `mind-map.tsx:1211` | Tiga border bersarang: section demo (`rounded-lg border bg-background p-4`) → panel (`divide-y rounded-md border`) → kanvas (`rounded-md border bg-background`). Data-display memakai satu `Card` per blok. Demo (fokus halaman) tampak seperti kotak dalam kotak. | Bungkus demo dengan `Card` + `CardHeader` (`CardTitle` = judul h2, `CardDescription` = kalimat deskripsi) + `CardContent`. Hapus bingkai section lama. |
| B2 | major | `page.tsx:97-99` | `data-theme="pulse"` + class `dark`/`light` + `colorScheme` dipasang pada seluruh section (judul, deskripsi, panel, kanvas). Setelah CR-033 membuat scope lokal bekerja penuh, tombol "Mode gelap" akan membalik warna **panel kontrol dan judul** juga, bukan hanya kanvas, dan bertabrakan dengan tema halaman. (Saat ini hampir tidak ada utilitas yang berubah karena bug token, lihat CR-033.) | Pasang `data-theme`, class `dark`/`light`, dan `colorScheme` hanya pada elemen "panggung" yang membungkus `MindMap`. Panel dan judul mengikuti tema halaman global. |
| B3 | minor | `mind-map-demo-panel.tsx:60-75` vs `:77-103` | Baris "Aksi" (`role="group" aria-label="Aksi demo"`) hanya berisi satu tombol "Muat 50 node". Panel tiga baris untuk 9 tombol terasa berat. | Gabungkan tombol "Muat 50 node" ke baris "Tampilan" (bersama "Mode gelap" dan "Peta mini"); panel jadi 2 baris: **Status data** (6 tombol) dan **Tampilan & beban** (3 tombol). Label grup tetap mempertahankan nama aksesibel. |

## Perubahan yang Diusulkan

- Hanya `apps/showcase` (route mind-map + `_components/mind-map-demo-panel.tsx`). Tanpa dependency baru; `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` sudah diekspor `@ds/ui` dan dipakai data-display.
- Tanpa perubahan `packages/ui` (termasuk `mind-map.tsx:1211`), token, atau API publik.
- Komponen/route terdampak: `/patterns/mind-map` (`page.tsx`, `mind-map-demo-panel.tsx`).
- `Card` `padding`: pakai `padding="none"` pada kartu + `CardHeader`/`CardContent` agar panel `divide-y` dan kanvas rata dengan tepi kartu, atau `CardContent` default `p-6 pt-0`; pilih satu setelah cek visual (jangan menambah bingkai baru).
- Judul h2 dari CR-029 (`font-display text-2xl`) tetap; di dalam `CardTitle` gunakan `asChild`/elemen `h2` yang sudah ada **jangan** mengubah level heading (test mengecek `h2`). Bila `CardTitle` merender `h3`, pertahankan `h2` terpisah di luar kartu atau beri `id` pada `CardTitle` dengan level yang benar — putuskan saat eksekusi dan jelaskan di Keputusan.

### Before / After (sketsa)

```tsx
// Sebelum: section[data-theme=pulse.dark/light] > h2 + deskripsi + panel + MindMap
<section aria-labelledby="mind-demo" data-theme="pulse" className={`${dark ? 'dark' : 'light'} space-y-3 rounded-lg border border-border bg-background p-4 text-foreground`} style={{ colorScheme }}>
  …
</section>

// Sesudah: Card (tema halaman) > header + panel > panggung bertema lokal > MindMap
<section aria-labelledby="mind-demo">
  <Card>
    <CardHeader>…judul h2 id="mind-demo" + CardDescription…</CardHeader>
    <CardContent className="space-y-3">
      <MindDemoPanel … />
      <div
        data-theme="pulse"
        className={dark ? 'dark' : 'light'}
        style={{ colorScheme: dark ? 'dark' : 'light' }}
      >
        <MindMap … />
      </div>
    </CardContent>
  </Card>
</section>
```

```tsx
// Panel 2 baris
// Baris 1 "Status data": 6 tombol (tidak berubah)
// Baris 2 "Tampilan": [Mode gelap] [Peta mini] [Muat 50 node]
```

## Tasks (jalur small-fix)

- [ ] B1: ganti section demo dengan `Card` + `CardHeader` + `CardContent`; hilangkan bingkai bersarang.
- [ ] B2: pindahkan `data-theme="pulse"`, class `dark`/`light`, dan `colorScheme` ke panggung yang hanya membungkus `MindMap`.
- [ ] B3: gabungkan baris "Aksi" ke baris "Tampilan"; hapus grup "Aksi demo" atau pindahkan tombolnya tanpa kehilangan nama aksesibel tombol "Muat contoh 50 node".
- [ ] Perbarui test `page.test.tsx` (lihat Cek test).
- [ ] Verifikasi: test showcase mind-map, eslint, tsc showcase, `pnpm -C apps/showcase build`, cek visual light/dark (termasuk tema global dark + toggle "Mode gelap").

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Tema lokal hanya di panggung `MindMap`; panel mengikuti tema halaman. | Tombol "Mode gelap" seharusnya mengontrol preview, bukan memutar warna kontrolnya sendiri. Berlaku efektif **setelah** CR-033; tidak memperbaiki Known Issue CR-027 dengan sendirinya. |
| 2 | `packages/ui` (`mind-map.tsx`) tidak diubah. | Tiga border sebagian berasal dari kanvas komponen; mengubah komponen = API/perilaku visual publik, butuh konfirmasi dan CR terpisah. Di showcase cukup menghapus dua dari tiga bingkai. |
| 3 | Level heading `h2` tidak berubah. | Test `page.test.tsx:19-21` dan struktur dokumen bergantung pada `h2`. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik dan komponen `Card`.
- [ ] Kontras light dan dark lolos WCAG AA (cek panel di tema global light/dark, serta kanvas pada toggle "Mode gelap" dengan CR-033 sudah diterapkan; ukur warna efektif node, edge, dan minimap, bukan hanya class).
- [ ] Perilaku Radix/a11y tidak rusak (`aria-pressed` tombol, grup beretiket, `aria-labelledby` section).
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia (enam status tetap terjangkau lewat panel).
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (catatan baseline FlowEditor/RTE; bukan scope).

- Cek light/dark: panel, kartu, panggung kanvas pada kombinasi global light/dark × lokal light/dark.
- Cek state: Loading, Empty, Invalid, Error eksternal, Berisi, Contoh Q1; "Muat 50 node"; viewport 390px (tombol membungkus).
- Cek test: `page.test.tsx:22-24` (panel `role="group"` nama `Panel demo`, className mengandung `divide-y` dan **tidak** `bg-card`) — pertahankan panel tanpa `bg-card`; `:25-29` grup `Status demo` 6 tombol dengan `svg[aria-hidden=true]`; `:69-77` `container.querySelector('[data-theme="pulse"]')` harus tunggal dan berkelas `dark` saat "Mode gelap" ditekan (elemen panggung memenuhi syarat); tombol "Muat contoh 50 node" → 50 node; toggle "Peta mini". Bila grup `Aksi demo` dihapus, perbarui asersi yang menyebutnya.

## Eksekusi

Branch: `cr-030-mind-map-panggung-demo-card` (bertumpuk dari `cr-029-mind-map-hierarki-header-section`, yang bertumpuk dari `cr-033-token-scope-tema-bersarang`)
Commit: `refactor: panggung demo mind map dalam Card [CR-030]`

- [x] CR disetujui user (instruksi user: "approve smua", sesi /improve-ui).
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
