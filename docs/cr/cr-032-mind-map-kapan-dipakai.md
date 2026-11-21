# CR-032 — Mind Map: section "Kapan dipakai" (opsional)

**Status:** done
**Sumber:** audit `/improve-ui` — perbandingan halaman `patterns/mind-map` dengan `components/data-display` (cluster D); berbasis kode, belum ada pengecekan visual di browser
**Ref:** `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx`, pembanding galeri kartu `apps/showcase/src/app/(docs)/components/data-display/page.tsx:453-465`

> Prioritas MoSCoW: **could**. Bergantung pada CR-029 (pola judul section) dan CR-031 (struktur halaman final). Boleh ditunda atau dibatalkan tanpa mengurangi CR-029–031.
> Catatan jujur: ini **konten baru**, bukan perbaikan tampilan. Halaman data-display terasa kaya salah satunya karena galeri contoh penggunaan; mind-map tidak punya padanan. Risiko: menambah kebisingan pada halaman yang sengaja ringkas (4 section).

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| D1 | minor | `page.tsx` (tidak ada section) | Halaman menjelaskan *cara memakai* (alur, keyboard, resep) tetapi tidak menjelaskan *kapan memakai* MindMap dan kapan memilih komponen lain. Pembaca baru tidak punya konteks keputusan. | Tambah section "Kapan dipakai" berisi grid 3 `Card` kecil (mis. Brainstorming, Struktur konten, Rencana proyek), masing-masing satu kalimat, memakai pola judul dari CR-029. |

## Perubahan yang Diusulkan

- Hanya `apps/showcase`. Tanpa dependency baru; `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` sudah dipakai di showcase.
- Tanpa perubahan `packages/ui`, token, atau API publik.
- Komponen/route terdampak: `/patterns/mind-map` (`page.tsx` atau berkas `_components/mind-map-use-cases.tsx` bila section > ±40 baris; ikuti pola `_components/` yang ada).
- Posisi: **setelah** "Demo interaktif" dan sebelum "Alur brainstorming" **atau** di akhir sebelum "Resep integrasi" — putuskan bersama user saat approval (lihat Keputusan 1). Menambah satu `h2` baru mengubah test urutan heading.
- Isi kartu (usulan, disetujui user sebelum implementasi karena ini copy produk):
  1. **Brainstorming** — "Kumpulkan ide tim lalu kelompokkan dalam satu peta."
  2. **Struktur konten** — "Rancang hierarki halaman atau dokumen sebelum menulis."
  3. **Rencana proyek** — "Pecah tujuan besar menjadi cabang yang bisa dikerjakan."
- Ikon section: `Lightbulb` (ada di `lucide-react` terpasang), `aria-hidden`. Ikon di dalam kartu: opsional; jangan menambah ikon bila tidak membantu.
- Tidak menambah klaim fitur yang belum ada di komponen; tiap kartu hanya skenario penggunaan.

### Before / After (sketsa)

```tsx
// Sesudah (section baru, mengikuti pola judul CR-029)
<section aria-labelledby="mind-usecases" className="space-y-4">
  <div className="space-y-1">
    <h2 id="mind-usecases" className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
      <Lightbulb aria-hidden="true" className="h-6 w-6 text-highlight" />
      <span>Kapan dipakai</span>
    </h2>
    <p className="text-sm text-muted-foreground">Tiga situasi umum ketika peta ide membantu.</p>
  </div>
  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
    {USE_CASES.map((item) => (
      <Card key={item.title}>
        <CardHeader>
          <CardTitle className="text-base">{item.title}</CardTitle>
          <CardDescription>{item.description}</CardDescription>
        </CardHeader>
      </Card>
    ))}
  </div>
</section>
```

## Tasks (jalur small-fix)

- [x] D1: posisi section dan copy tiga kartu ditetapkan (lihat Keputusan 1 dan 2).
- [x] D1: tambah section "Kapan dipakai" (grid 3 `Card`, ikon `Lightbulb` `aria-hidden`) di `_components/mind-map-use-cases.tsx`.
- [x] Perbarui `page.test.tsx:19-21` — urutan `h2` mencakup `Kapan dipakai` pada posisi yang diputuskan. Asersi isi kartu tidak ditambahkan (tidak wajib; isi statis).
- [x] Verifikasi: test showcase mind-map 9/9, tsc showcase, lint workspace, cek visual terang 390px (grid satu kolom, tanpa overflow) dan gelap 1440px (tanpa overflow). `pnpm -C apps/showcase build` ditunda.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Posisi section: tepat setelah Demo interaktif, sebelum Alur brainstorming. | User menyetujui semua CR ("approve smua") tanpa memilih posisi lain, sehingga rekomendasi dipakai. Konteks "kapan" muncul sebelum "bagaimana", demo tetap fokus pertama. Urutan `h2` baru: Demo interaktif, Kapan dipakai, Alur brainstorming, Papan keyboard, Resep integrasi. |
| 2 | Copy tiga kartu seperti pada "Perubahan yang Diusulkan" (Brainstorming, Struktur konten, Rencana proyek). | Disetujui bersama CR ("approve smua"); tetap dapat direvisi user saat review. |
| 3 | CR bersifat opsional (`could`). | Boleh dibatalkan tanpa mengubah CR-029–031. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik dan komponen `Card`.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak (`h2` baru ber-`id` + `aria-labelledby`; urutan heading tetap logis; ikon `aria-hidden`).
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia (tidak relevan untuk konten statis; tidak ada state baru).
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (catatan baseline FlowEditor/RTE; bukan scope).

- Cek light/dark: kartu dan judul section pada kedua tema global.
- Cek state: tidak ada state interaktif; grid 3 kolom (≥ md) dan 1 kolom (390px).
- Cek test: `page.test.tsx:19-21` harus diperbarui (urutan `h2` baru); test lain tidak boleh berubah.

## Eksekusi

Branch: `cr-032-mind-map-kapan-dipakai` (bertumpuk dari `cr-031-mind-map-komponen-ds-kbd-timeline-resep`)
Commit: `feat: tambah section kapan dipakai pada showcase mind map [CR-032]`

- [x] CR disetujui user (instruksi user: "approve smua", sesi /improve-ui).
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan (build showcase ditunda).
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan (ditunda, sama seperti CR-029–031).
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
