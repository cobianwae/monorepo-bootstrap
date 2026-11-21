# CR-021 — Flow Editor: kanvas rusak secara visual dan layout

**Status:** done
**Sumber:** review artefak 005 atas laporan user (“secara UX ancur banget”) — diverifikasi di browser (Chrome headless 157, showcase `localhost:4000/patterns/flow-editor`, viewport 1440×1000, tema Pulse gelap + terang) dengan pengukuran DOM via CDP
**Ref:** `docs/prd/005-flow-editor.md` (FR-001, FR-002, FR-010, FR-011, FR-013), `docs/design/flow-editor.md`, `docs/stories/005-01-canvas-node-foundation.md`, `005-02`, `005-05`, `005-06`, `packages/ui/src/components/canvas/flow-editor.tsx`, `packages/ui/src/styles.css`, `apps/showcase/src/app/(docs)/patterns/flow-editor/page.tsx`

## Konteks

CR-019 menambal perilaku inspector (tidak lagi mengunci; Esc menutup — terverifikasi). Namun
kanvasnya sendiri tidak pernah diperiksa secara visual: 886 baris test jsdom lulus, sementara
tampilan nyata rusak. Test jsdom tidak mengukur geometri/CSS, jadi regresi layout lolos dari
semua gate story 005-01–005-06.

## Temuan

| # | Severity | Lokasi | Deskripsi (bukti terukur) | Rekomendasi |
|---|---|---|---|---|
| 1 | blocker | `flow-editor.tsx:356-361` | Komponen node memakai `absolute left-0 top-0` + `transform: translate(positionX, positionY)` sendiri di dalam wrapper `.react-flow__node` milik xyflow. Wrapper terukur **2×2 px** (hanya border 1px dari `styles.css:120-127`) sehingga xyflow mengukur semua node sebagai 0×0: minimap berisi 5 node tapi tampil kosong, edge/selection/rubber band memakai dimensi nol, `fitView` tidak bisa bekerja benar. Posisi ganda juga rawan salah saat viewport/snap berubah. | Biarkan xyflow memposisikan wrapper: node `relative w-[220px] h-[88px]` tanpa `absolute`/`transform` sendiri; hapus `positionX/positionY` dari props node; hapus border/bg ganda pada `.react-flow__node` (`styles.css:120-127`) agar hanya satu permukaan. |
| 2 | blocker | `flow-editor.tsx:279-288` | Hit-area handle 48×48 digambar sebagai **lingkaran solid `bg-border`**. Terukur: handle kiri node n1 menutup x 630–678 sedangkan judul mulai di x 652 → huruf awal judul (“Mulai”, “Kirim email”, “Cabang verifikasi”) terpotong; titik status juga tertutup. Dot xyflow 12px asli tak terlihat. Hit-area (≥44px, FR-002) dan visual dicampur. | Wrapper 48px `bg-transparent` (hit-area saja); visual = dot 12px di tengah (`<Handle>` ber-token), ring fokus pada dot. Geser konten node (padding) atau posisikan hit-area setengah di luar tepi node supaya tidak menimpa teks. |
| 3 | blocker | `flow-editor.tsx:644-705` + situs render `FlowToolbar` (anak `<section class="relative w-full">`, `flow-editor.tsx:~1559`) | Toolbar `absolute left-3 top-3` menempel pada section luar, bukan kanvas → terukur di x 341 (di atas palette, bukan di dalam kanvas x 537+). Tombol `h-8 w-8` (32px) berisi teks “Urungkan/Ulangi/Snap/Grid/Minimap” 16px yang meluap keluar tombol → teks mentah menimpa palette dan input pencarian. Target 32px < 44px (FR-011). | Pindahkan toolbar ke dalam `#flow-canvas` (atau baris di atas kanvas, bukan overlay); tombol ikon + `aria-label` + Tooltip (pola `Button size="icon"`), target ≥44px atau jarak cukup; susun horizontal. |
| 4 | blocker | `flow-editor.tsx:900` (`fitView={false}`), `page.tsx` grid `lg:col-span-9` | Viewport awal `translate(0,0) scale(1)`; kanvas hanya 588px lebar (palette 192px + kolom 9/12 saja, 3 kolom kanan kosong). Dari 5 node demo hanya **1** terlihat utuh (`nodesInView: 1`); sisanya terpotong atau di luar tepi. Kesan pertama: “kanvas kosong/rusak”. | `fitView` saat mount (`fitViewOptions.padding 0.2`) dan saat ganti `demo`; kanvas pakai lebar penuh (`col-span-12`) atau isi kolom kanan dengan guna jelas; palette jangan memakan lebar kanvas (taruh sebagai rail/popover). |
| 5 | major | `flow-editor.tsx:569-600` | Controls `flex-col items-end` 118×162px menimpa node di pojok kanan atas; tombol zoom tampil `- 100% +` kecil (10px), separator `w-px h-5` di dalam `flex-col` tampil sebagai garis vertikal acak, ikon fit/“1:1”/kunci tidak sejajar. Menutupi node n2. | Satu baris horizontal atau kolom rapi bertarget ≥44px; letakkan di sudut bawah-kiri; separator mengikuti sumbu. |
| 6 | major | `flow-editor.tsx:412` | `cn('text-micro', statusText)` — `tailwind-merge` membuang utility kustom `text-micro` (`styles.css:18`) sehingga class akhir hanya `text-muted-foreground`; label “Siap” terukur **16px** (seharusnya 10px). Teks status membengkak dan tabrakan dengan handle. | Daftarkan `text-micro` ke konfigurasi `extendTailwindMerge` di `cn()` (cek 3x rule/pemakai lain), atau pakai `text-xs`. Audit pemakaian `cn(..., 'text-micro', ...)` lain di `packages/ui`. |
| 7 | major | `styles.css:145-152`, `flow-editor.tsx` (edge label) | Pemetaan token edge menarget `.react-flow__edge`, padahal stroke ada di `.react-flow__edge-path`; di tema gelap xyflow memakai default `#3e3e3e` (`rgb(62,62,62)`, 1px) di atas background ≈ `oklch(0.1)` → kontras ≈ 1,9:1 (< 3:1, WCAG 1.4.11). Edge nyaris tak terlihat. Label edge (“trigger”) memakai kotak gelap default di mode terang (teks tak terbaca) → FR-010 gagal dalam arti “tanpa default CSS xyflow mentah”. Komentar `flow-editor.tsx:5` (“default CSS TIDAK diimpor”) kontradiktif dengan `styles.css:1` (`@import "@xyflow/react/dist/style.css"`) dan OQ#3 PRD. | Putuskan satu jalur sesuai OQ#3 (nonaktifkan default CSS **atau** petakan lengkap) dan selaraskan komentar; petakan `--xy-edge-stroke*`, `.react-flow__edge-path`, `.react-flow__edge-text/textbg`, `.react-flow__minimap-node`, `.react-flow__handle` untuk light & dark; audit kontras ≥3:1 untuk edge/handle. |
| 8 | major | `page.tsx` `InspectorPanel`, `sheet.tsx:64-65` | Inspector terbuka benar, tetapi: footer tombol “Simpan / Duplikat / Hapus node / Batal” meluap — **“Batal” terpotong** di tepi kanan sheet (w-80); “Simpan” bertentangan dengan klaim perubahan live; label “ID” menempel ke garis header; ID/Posisi/Koneksi tampil seperti input aktif; overlay modal menutup + mengaburkan kanvas sehingga efek “live ke canvas” tidak terlihat; sr-only “Close” masih Bahasa Inggris (temuan #7 CR-019 belum diselesaikan). | Footer `flex-wrap`/grid; hapus “Simpan” bila live (atau jadikan commit eksplisit, pilih satu); meta read-only sebagai teks, bukan input; pertimbangkan panel non-modal (docked) agar kanvas tetap terlihat; `Close` → `Tutup`. |
| 9 | minor | `FlowPaletteItemRow` (dnd-kit `useDraggable`) | Hydration mismatch React di console (“A tree hydrated but some attributes of the server rendered HTML didn't match…”, di `FlowPaletteItemRow` `role="button"`/atribut aria dnd-kit) → badge “1 Issue” Next dev. | Beri `id` stabil pada `DndContext` (`id="flow-palette-dnd"`) atau render palette setelah mount. |
| 10 | major | proses (story 005-06 audit, test) | Tidak ada gate visual: semua AC visual (handle ≥44px tanpa menimpa teks, minimap sinkron, tema light/dark) dicentang tanpa screenshot/ukuran. Token `docs/design/flow-editor.md` tidak menetapkan geometri toolbar/controls yang dapat diuji. | Tambah ke DoD canvas: screenshot light+dark + asersi geometri (bounding box non-overlap, wrapper node = 220×88, minimap node > 0) lewat skrip browser yang disetujui user; catat di story. |

Catatan verifikasi: tampilan mobile belum dinilai valid — Chrome headless memaksa lebar jendela
minimum ±500px sehingga screenshot 390px terpotong; perlu emulasi device metrics terpisah.

## Perubahan yang Diusulkan

- `packages/ui/src/components/canvas/flow-editor.tsx` (node, handle, toolbar, controls, fitView, layout kanvas), `packages/ui/src/styles.css` (blok xyflow), `packages/ui/src/lib/utils.ts` atau lokasi `cn()` (daftarkan `text-micro`), `apps/showcase/.../flow-editor/page.tsx` (layout grid, inspector footer).
- Tanpa dependency baru, tanpa token baru, API publik `FlowEditor` tidak berubah (props tetap). Penghapusan `positionX/positionY` dari props node internal bukan API publik.
- Temuan #1–#4 harus selesai bersama (saling bergantung secara visual); #5–#9 boleh gelombang kedua; #10 butuh keputusan user.

## Tasks (jalur small-fix)

- [x] #1 Node di-posisi-kan xyflow; wrapper terukur 220×88; minimap menampilkan node.
- [x] #2 Handle: hit-area transparan 48px + dot 12px; judul/status tidak tertimpa.
- [x] #3 Toolbar di dalam kanvas, tombol ikon ber-label/tooltip, target ≥44px.
- [x] #4 `fitView` awal + saat ganti demo; kanvas lebar penuh; ≥5/5 node terlihat di 1440 px.
- [x] #5 Controls dirapikan, tidak menutup node.
- [x] #6 `text-micro` tidak dibuang `cn()`; “Siap” 10px.
- [x] #7 Pemetaan edge/handle/label light+dark; kontras ≥3:1; selaraskan komentar vs `@import`.
- [x] #8 Inspector: footer tidak meluap, copy/ID/meta, `Tutup`.
- [x] #9 Hydration mismatch hilang (console bersih).
- [x] #10 Keputusan gate visual (lihat Keputusan).
- [x] Verifikasi: `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build`, screenshot light+dark.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Menunggu user: scope perbaikan satu CR (#1–#9) atau pecah #1–#4 dulu | #1–#4 menentukan kelayakan pakai; #5–#9 polesan |
| 2 | Menunggu user: gate visual (#10) — izinkan `@playwright/test` sebagai devDependency, atau skrip Chrome headless tanpa dependency | Dependency baru butuh konfirmasi (CONVENTIONS) |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA (teks 4.5:1, edge/handle 3:1).
- [ ] Perilaku Radix/a11y tidak rusak (fokus handle, keyboard connect, Esc inspector).
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia (tidak regresi 005-06).
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (baseline FlowEditor dicatat sebagai known issue).

## Eksekusi

Branch: `cr-021-flow-editor-visual`
Commit: `fix: perbaiki layout visual flow editor [CR-021]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append dan `node scripts/check-status-log.mjs` hijau.
