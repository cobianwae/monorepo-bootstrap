# CR-085 — Cascader & Tree Select: struktur dan hierarki halaman

**Status:** approved (ditetapkan user 2026-11-25; belum dikerjakan atas instruksi user)
**Sumber:** audit `/improve-ui` (skill `ui-designer`), 2026-11-25
**Ref:** `apps/showcase/src/app/(docs)/patterns/cascader-tree-select/page.tsx`, `docs/design/visual-language.md` (Spacing & Density, Section Heading, Color Roles)

## Komponen/Route yang Terpengaruh

- Route: `/patterns/cascader-tree-select` (`S-005.31`) — hanya file halaman ini.
- Tidak ada perubahan `packages/ui`, token, API publik, atau dependency.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:64` | Root memakai `flex flex-col gap-6 p-6`, menyimpang dari ritme dominan halaman docs `space-y-10 animate-in fade-in-50 duration-200` (39 halaman; visual-language § Spacing). Halaman terasa satu blok datar tanpa napas antar-kelompok. | Samakan root ke pola dominan; hormati `prefers-reduced-motion` bila pola halaman pembanding memakainya. |
| 2 | major | `page.tsx:71,103,119,123,127,148,164,182,186,190` | Sepuluh `<h2 className="text-sm font-semibold">` setara label kartu. Setelah `PageHeader` (h1) tidak ada Heading 2 nyata: hierarki terkompresi, halaman sulit dipindai, dan heading section tidak ditulis lewat `SectionHeading` sebagaimana diwajibkan visual-language. Guard saat ini tidak menangkap pola `text-sm` ini, jadi ini lolos pagar otomatis tetapi menyimpang dari aturan dokumen. | Kelompokkan menjadi dua section besar ber-`SectionHeading` — “Cascader” dan “Tree Select” — dengan `id` + `scroll-mt-20` + `aria-labelledby`; judul demo di dalam kelompok menjadi sub-judul yang konsisten (h3 hanya bila ada ≥2 kelompok paralel, sesuai aturan sub-section). |
| 3 | major | `page.tsx:72-88` | Toggle mode tampilan ditulis tangan dengan `<button>` + `aria-pressed` dan state terpilih `bg-highlight/10 ring-1 ring-highlight`. `docs/CONVENTIONS.md`: segmented/toggle wajib `SegmentedControl` dari `@ds/ui`. Target sentuh hasil render ±32px (`py-1.5 text-sm`). | Ganti ke `SegmentedControl`/`SegmentedControlItem` (`full`/`last`); state `on` mengikuti komponen (permukaan `background` + bayangan `xs`), bukan tint `highlight` buatan. |
| 4 | minor | `page.tsx:70,102,117,147,163,180` dan kartu berulang | Delapan permukaan kartu ditulis tangan berulang (`rounded-xl border border-border bg-card p-4`) tanpa `id`/jangkar section. Duplikasi markup membuat perubahan density/radius rawan tidak seragam. | Pertahankan permukaan `bg-card` (semantik benar), tetapi susun di bawah section berjangkar; evaluasi pemakaian komponen permukaan existing hanya bila pola halaman pembanding memakainya — jangan buat abstraksi baru (aturan 3x). |
| 5 | minor | `page.tsx:138-145,199-204` | Daftar langkah manual bernomor ganda (`<ol>` + teks `1.`–`10.`) terpisah jauh dari demo yang dijelaskan (langkah Cascader ditaruh setelah grid state; langkah Tree Select di dasar halaman). Pembaca harus memetakan sendiri langkah ke demo. | Gabung menjadi petunjuk per kelompok di bawah `SectionHeading` masing-masing (“Cara mencoba”), tanpa nomor manual di dalam `<li>`; langkah tetap berurutan 1–6 (Cascader) dan 1–4 (Tree Select) per kelompok. |

## Before/After (ringkas)

```tsx
// Before
<div className="flex flex-col gap-6 p-6">
  <section className="… bg-card p-4">
    <h2 className="text-sm font-semibold">Demo utama — alamat bertingkat</h2>
    {/* tombol toggle manual */}

// After (arah)
<div className="space-y-10 animate-in fade-in-50 duration-200">
  <section id="cascader" aria-labelledby="cascader-heading" className="space-y-4 scroll-mt-20">
    <SectionHeading id="cascader-heading" title="Cascader" description="…" />
    <SegmentedControl …>…</SegmentedControl>
```

## Perubahan yang Diusulkan

- Hanya `apps/showcase/src/app/(docs)/patterns/cascader-tree-select/page.tsx`.
- Root, pengelompokan section, `SectionHeading`, `SegmentedControl`, penempatan ulang daftar langkah.
- Tidak mengubah perilaku `Cascader`/`TreeSelect`, data demo, atau nilai awal (perilaku demo diatur CR-086).

## Tasks (jalur small-fix)

- [x] Samakan root halaman ke ritme `space-y-10 …` halaman docs.
- [x] Tambah dua section ber-`SectionHeading` (Cascader, Tree Select) dengan `id`/`scroll-mt-20`/`aria-labelledby`; sesuaikan level judul demo di dalamnya.
- [x] Ganti toggle mode tampilan manual ke `SegmentedControl` dari `@ds/ui`.
- [x] Pindah daftar langkah menjadi petunjuk per kelompok; hapus nomor manual di `<li>`.
- [x] Verifikasi: guard visual-language, test showcase terkait, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build`.
- [ ] Cek light/dark dan 320/390/1440 best-effort; cek tidak ada overflow horizontal baru.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Perbaikan dibatasi halaman; komponen `@ds/ui` tidak diubah di CR ini. | Temuan struktur adalah utang halaman; perubahan komponen punya blast radius sendiri (CR-087/088). |
| 2 | Bahasa copy tidak diubah di CR ini. | Copy diatur di CR-086/088; arahnya **English**, ditetapkan user 2026-11-25. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA (state terpilih mengikuti `SegmentedControl`).
- [x] Perilaku Radix/a11y tidak rusak; hierarki heading h1 → h2 → (h3 terbatas) utuh.
- [x] API `cva` dan export tetap konsisten (tanpa perubahan `@ds/ui`).
- [x] State loading, empty, dan error relevan tersedia (tidak diubah di CR ini).
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-085-cascader-tree-select-page-structure`
Commit: `fix: struktur halaman cascader tree select [CR-085]`

- [x] CR disetujui user (2026-11-25; implementasi ditunda atas instruksi user — “gak usah dikerjain”).
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
