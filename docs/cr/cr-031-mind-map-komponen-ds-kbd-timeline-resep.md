# CR-031 — Mind Map: pakai komponen DS (Kbd, Timeline) dan restyle resep

**Status:** done
**Sumber:** audit `/improve-ui` — perbandingan halaman `patterns/mind-map` dengan `components/data-display` (cluster C); berbasis kode, belum ada pengecekan visual di browser
**Ref:** `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx:135-156`, `_components/mind-map-shortcuts.tsx`, `_components/mind-map-recipe.tsx`, `packages/ui/src/components/base/kbd.tsx`, `packages/ui/src/components/data-display/timeline.tsx`, `packages/ui/src/components/data-display/code-block.tsx`, `docs/cr/cr-024-mind-map-microcopy-a11y.md`, `docs/cr/cr-025-mind-map-audit-followup.md`, `docs/cr/cr-027-mind-map-showcase-polish.md`

> Prioritas MoSCoW: **should**. Bergantung pada CR-029 dan CR-030 (branch bertumpuk).
> Catatan jujur: halaman memakai markup buatan sendiri untuk hal yang sudah punya komponen DS. Ini temuan konsistensi, bukan bug. Resep **tidak** ditukar ke `CodeBlock` mentah karena `CodeBlock` menelan error clipboard (`code-block.tsx:43-45`, `catch` kosong) dan akan menghilangkan fallback a11y CR-024/025.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| C1 | major | `_components/mind-map-shortcuts.tsx:22-33` | `<kbd>` buatan (`rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs`) dan `<div>` kartu per pintasan. Pintasan gabungan ditulis satu string (`Enter / F2`, `← ↑ ↓ →`, `Home / End`, `+ − 0 F`). Komponen `Kbd` (`variant` default/outline/subtle, `size` sm/default/lg) tidak dipakai. | Pakai `Kbd` dan pecah per tombol (`Enter` + `F2`, dst.) dengan pemisah teks "atau"/spasi yang tidak dibaca ganda; pertahankan `dl/dt/dd` dan paragraf catatan kaki (`:34-37`). |
| C2 | major | `page.tsx:144-155` | Langkah brainstorming: `<ol>` buatan dengan lingkaran angka `bg-muted` `aria-hidden`. Data-display punya `Timeline` untuk urutan langkah. | Ganti dengan `Timeline` (`items` dari `STEPS`; `{ id, title, description }`, opsional `icon`/`status`). `Timeline` merender `<ol><li>` sehingga `ol > li` tetap 6. |
| C3 | minor | `_components/mind-map-recipe.tsx:35-58` | Resep: `<pre>` polos `rounded-lg border bg-muted/40 p-4` + tombol "Salin resep" di luar bingkai; tidak seragam dengan `CodeBlock` (bingkai `rounded-xl border bg-card shadow-xs`, header bar nama bahasa + tombol salin). | **Restyle saja** (keputusan user): pertahankan logika salin, fallback, live region, dan tombol; bungkus dalam bingkai ala `CodeBlock` dengan header bar. Tanpa API baru `CodeBlock`. |

## Perubahan yang Diusulkan

- Hanya `apps/showcase`. Tanpa dependency baru; `Kbd` dan `Timeline` sudah diekspor `@ds/ui`.
- Tanpa perubahan `packages/ui` (termasuk `CodeBlock`), token, atau API publik.
- Komponen/route terdampak: `/patterns/mind-map` (`page.tsx`, `mind-map-shortcuts.tsx`, `mind-map-recipe.tsx`, `mind-map-demo-data.ts` bila perlu memetakan `STEPS` ke item Timeline).
- **Restyle resep (C3)** — hanya presentasi:
  - Bingkai luar: `overflow-hidden rounded-xl border border-border bg-card shadow-xs`.
  - Header bar: `flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2 text-xs` dengan label bahasa/nama berkas (mis. `tsx` atau `mind-map-example.tsx`) di kiri dan tombol "Salin resep" di kanan.
  - Tombol tetap `Button variant="outline" size="sm" className="min-h-11"`, ikon `Check`/`Copy`, perilaku salin tidak berubah.
  - `<pre tabIndex={0} aria-label="Contoh kode integrasi MindMap">` tetap fokusable dan ber-label; pindah `border` ke bingkai luar agar tidak ganda.
  - `<p role="status">` tetap ter-mount (kelas persis `sr-only` saat kosong; tampil saat terisi/gagal) dan tidak remount.
- `STEPS` → `Timeline`: ikon opsional per langkah hanya bila bermakna (jangan menambah bahasa visual baru); `status` default.

### Before / After (sketsa)

```tsx
// Sebelum
<dt><kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">Enter / F2</kbd></dt>

// Sesudah
<dt className="flex flex-wrap items-center gap-1">
  <Kbd size="sm">Enter</Kbd><span aria-hidden="true">/</span><Kbd size="sm">F2</Kbd>
</dt>
```

```tsx
// Sebelum: <ol className="space-y-3">…lingkaran angka…</ol>
// Sesudah
<Timeline
  items={STEPS.map((step, index) => ({ id: `step-${index}`, title: step.title, description: step.detail }))}
/>
```

```tsx
// Resep: bingkai + header bar ala CodeBlock, logika salin tetap
<div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
  <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2 text-xs">
    <span className="font-mono text-muted-foreground">tsx</span>
    <Button variant="outline" size="sm" className="min-h-11" onClick={copyRecipe}>…</Button>
  </div>
  <pre tabIndex={0} aria-label="Contoh kode integrasi MindMap" className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground"><code>{RECIPE}</code></pre>
</div>
<p role="status" className={copied ? 'mt-2 text-sm text-muted-foreground' : 'sr-only'}>…</p>
```

## Tasks (jalur small-fix)

- [x] C1: ganti `<kbd>` buatan dengan `Kbd`, pecah per tombol; pertahankan `dl/dt/dd` dan catatan kaki.
- [x] C2: ganti `<ol>` langkah dengan `Timeline`; pastikan `ol > li` = 6 dan urutan langkah terbaca benar.
- [x] C3: restyle bingkai + header bar resep; logika salin/fallback/live region tidak berubah.
- [ ] Perbarui test bila perlu (lihat Cek test).
- [ ] Verifikasi: test showcase mind-map (`page.test.tsx` + `mind-map-recipe.test.tsx`), eslint, tsc showcase, `pnpm -C apps/showcase build`, cek visual light/dark.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Resep: **restyle saja**, tidak memakai `CodeBlock` sebagai pengganti. | Jawaban user. `CodeBlock` menelan error clipboard sehingga fallback a11y CR-024/025 hilang; mengubahnya = perubahan API publik komponen, butuh konfirmasi terpisah. |
| 2 | `Kbd` dipecah per tombol dengan pemisah dekoratif `aria-hidden`. | Pembaca layar membaca tiap tombol sebagai satu unit; pemisah "/" tidak dibaca berulang. |
| 3 | `Timeline` dipakai tanpa `timestamp`/`badges`. | Langkah bukan peristiwa waktu; hindari data palsu. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik dan komponen DS.
- [ ] Kontras light dan dark lolos WCAG AA (bingkai/header resep, `Kbd`, teks `Timeline`).
- [ ] Perilaku Radix/a11y tidak rusak (`pre` fokusable dan ber-label; live region resep stabil; target tombol salin ≥ 44px).
- [ ] API `cva` dan export tetap konsisten (tanpa perubahan `packages/ui`).
- [ ] State loading, empty, dan error relevan tersedia (state salin: sukses, reset 2 detik, gagal clipboard).
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (catatan baseline FlowEditor/RTE; bukan scope).

- Cek light/dark: `Kbd`, `Timeline` (garis/penanda), header bar dan bingkai resep.
- Cek state: salin sukses → ikon `Check` lalu kembali `Copy` setelah 2 detik; salin gagal → pesan tampil; viewport 390px (`Kbd` membungkus, `pre` scroll horizontal).
- Cek test:
  - `page.test.tsx:34` — `container.querySelectorAll('ol > li')` = 6 (Timeline merender `ol > li`; verifikasi sebelum klaim), `:106-113` tombol "Salin resep" `className` mengandung `min-h-11` dan teks "Resep disalin".
  - `_components/mind-map-recipe.test.tsx` — `getByRole('status')` className persis `'sr-only'` saat kosong dan elemen tidak remount; `.lucide-check` setelah sukses dan `.lucide-copy` setelah 2 detik (fake timers); cleanup timer saat unmount (`vi.getTimerCount()` = 0); pesan gagal "Tidak dapat menyalin. Pilih teks resep secara manual." terlihat dan status bukan `sr-only`.
  - Bila ada test yang mengquery `kbd` atau struktur `dl`, perbarui sesuai pecahan `Kbd`.

## Eksekusi

Branch: `cr-031-mind-map-komponen-ds-kbd-timeline-resep` (bertumpuk dari `cr-030-mind-map-panggung-demo-card`)
Commit: `refactor: pakai Kbd, Timeline, dan restyle resep mind map [CR-031]`

- [x] CR disetujui user (instruksi user: "approve smua", sesi /improve-ui).
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan (mind-map test 9/9, `build:types` hijau, `pnpm lint` workspace bersih; build showcase ditunda).
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
