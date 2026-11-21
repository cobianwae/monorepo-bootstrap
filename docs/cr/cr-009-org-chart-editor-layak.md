# CR-009 — OrgChartEditor layak total (fondasi + visual + a11y + showcase)

**Status:** approved
**Sumber:** audit ui-ux-auditor + keluhan user "PRD 10 hasilnya sampah"
**Ref:** `docs/prd/010-org-chart-editor.md`, `docs/design/org-chart-editor.md`, `docs/stories/010-01-canvas-foundation.md`, `docs/stories/010-02-crud-inspector.md`, `docs/stories/010-03-reparent-undo.md`, `docs/stories/010-04-search-states-showcase.md`, `packages/ui/src/components/canvas/org-chart-editor.tsx`, `apps/showcase/src/app/(docs)/patterns/org-chart-editor/page.tsx`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| B1 | blocker | `packages/ui/src/components/canvas/org-chart-editor.tsx:626` | Tombol "Reset zoom" memanggil `zoomOut()` (duplikat Zoom out). User tidak pernah kembali ke 100%. Ikon `Maximize` dipakai ganda untuk Reset vs Fit view. | Pakai `setViewport({zoom:1})` / `zoomTo(1)` untuk reset; bedakan ikon (Fit=`Maximize`, Reset=`LocateFixed`); test klik reset. |
| B2 | blocker | `org-chart-editor.tsx:488-496` | Node adalah `div onClick tabIndex=0` tanpa role; `Space` mati; SR umumkan "generic" tanpa nama/level/expanded. `Enter` langsung buka inspector, tidak ada "pilih saja" via keyboard. | Jadikan kartu tombol pilih (`<button>` atau `role=treeitem` + `aria-selected/expanded/label=fullTitle`); `Enter`=pilih, `Enter` ganda/`Ctrl+Enter`=inspector, `Space`=expand; tombol `+`/collapse tetap terpisah. |
| B3 | blocker | `org-chart-editor.tsx:1121-1122` | Guard `event.target !== event.currentTarget` mematikan `Delete/Backspace`, `Ctrl+Z/Y`, `F` saat fokus di node/tombol (kasus 99%). Klaim wireframe §5 mati. | Hapus guard; hanya abaikan saat target `input,textarea,select,[contenteditable]`; test fokus di `[data-node-id]` + `Delete` → dialog hapus. |
| B4 | blocker | `org-chart-editor.tsx:1213`, `page.tsx:219-238` | Tidak ada pohon alternatif `role=tree` di dalam komponen (spec D9). Alternatif hanya toggle showcase `OrgChart` terpisah; konsumen `<OrgChartEditor/>` saja memberi SR kanvas pointer-only (FR-012 dilanggar). | Render `ul role=tree` visually-hidden/tab internal dari `normalized+expandedSet` (reuse pola 003); tiap baris ada aksi Tambah/Pindah/Hapus/Edit via keyboard. |
| B5 | blocker | `org-chart-editor.tsx:543,579,611` | Semua kontrol node & canvas `h-8 w-8` (32px) < 44px WCAG 2.5.8; miss-tap tinggi di node 72px. | Naikkan ke `h-11 w-11` atau `h-10 w-10` + hit-area `before:-inset-2`; sembunyikan `+` sampai `hover/focus-within` + selalu visible saat selected. |
| B6 | blocker | `org-chart-editor.tsx:506-507` | `isSelected \|\| isHighlighted` memakai gaya identik (`border-primary ring-2`); klaim "bukan hanya warna" tidak terbukti; gagal WCAG 1.4.1. | Bedakan: selected=`ring+border-primary`, highlighted=`outline dashed + badge "cocok"`; tambah gaya `.org-editor-highlighted`. |
| B7 | blocker | `org-chart-editor.tsx:1049-1051` | Semantik `defaultExpandedIds` terbalik (`filter !includes` = collapsed). Showcase lolos hanya karena akal-akalan `filter id !== eng-head`. Konsumen baru pasti salah pakai. | Betulkan ke `defaultExpandedIds.length ? defaultExpandedIds : parentIds` (breaking, butuh approval); migrasi showcase; test controlled/uncontrolled. |
| B8 | blocker | `org-chart-editor.tsx:1317` | `SheetContent aria-describedby={undefined}` membunuh deskripsi SR; user SR tidak dengar "node baru di bawah X". | Hapus override; biarkan Radix auto-link ke `SheetDescription` atau beri `aria-label` eksplisit. |
| M1 | major | `org-chart-editor.tsx:504,535-582` | Node 200×72 overcrowded (collapse+avatar+2 baris+badge 72px+tombol +); lebar teks efektif minus → selalu truncate; badge "Engineering" jadi "Engin…". | Naikkan ke `240×84` (update `SLOT_WIDTH/LEVEL_HEIGHT`); badge pindah baris kedua / `max-w-none` + wrap; ukur ulang layout. |
| M2 | major | `org-chart-editor.tsx:561-565,494,574` | `truncate` untuk title/subtitle/badge + `title` ganda (wrapper + tombol +) → tooltip dobel, SR bising, touch/keyboard tidak dapat; wireframe janji `Tooltip` DS tidak dipakai. | Satu `Tooltip` DS per node; title 1 baris ellipsis, subtitle `line-clamp-2 break-words`, badge full tanpa truncate. |
| M3 | major | `org-chart-editor.tsx:1251-1304` | Toolbar 7 tombol `outline sm` datar tanpa grup/hierarki, wrap berantakan di mobile; tidak ada `role=toolbar`, tidak sesuai wireframe §1. | Grup `role=toolbar`: `[+ Bawahan primary][Edit] | [Pindah][Undo][Redo] | [Hapus destructive]`; sibling ke menu "..."; tambah `aria-keyshortcuts`. |
| M4 | major | `org-chart-editor.tsx:520-521` | Chip drag `text-[10px]` tidak terbaca, menempel `-top-2` rawan kepotong `overflow-hidden` kanvas. | Naikkan ke `text-xs font-medium px-1.5 py-0.5` + ikon ✓/✕; validasi kontras via `@ds/tokens`. |
| M5 | major | `org-chart-editor.tsx:741-743` | Minimap pakai `!important` + `maskColor color-mix` + `nodeColor var(--primary)`; indikasi default CSS xyflow bocor (D8 dilanggar sebagian). | Override via CSS variable di `styles.css`, tanpa `!`; `tabIndex=-1` + `aria-hidden` bila non-esensial; verifikasi keyboard minimap. |
| M6 | major | `org-chart-editor.tsx:724-728` | `prefers-reduced-motion` hanya di tombol; pan/zoom/fit-view xyflow tetap animasi. | `useReducedMotion` → `fitViewOptions duration 0`, matikan `zoomOnPinch` saat reduce + CSS `.react-flow__viewport {transition:none}`. |
| M7 | major | `org-chart-editor.tsx:716,1317` | Kanvas `h-[480px]` fixed; minimap selalu tampil; sheet selalu `side=right` (tidak jadi bottom di mobile); langgar wireframe §6 responsif. | `h-[320px] md:h-[480px]`; minimap `hidden md:block`; sheet `bottom` di mobile via breakpoint hook. |
| M8 | major | `org-chart-editor.tsx:800` | Undo reset pakai `JSON.stringify` tiap `data` berubah (O(n), rapuh urutan key). | Bandingkan referensi + hash ringan (`length+checksum id/parentId`) atau flag `isCommitting` ref. |
| M9 | major | `org-chart-editor.tsx:1035-1041` | Focus-return via `querySelector([data-node-id])`; gagal saat collapse/filter; dialog hapus batal kehilangan fokus. | Peta `nodeRefs Map<string,HTMLElement>` via callback ref; fallback ke toolbar `button:not(:disabled)`; test tambah→tutup→fokus kembali. |
| m3 | minor | `org-chart-editor.tsx:911-914` | `confirmMove` diam saat validasi gagal (klik tanpa feedback). | Pesan inline + `role=alert`. |
| m4 | minor | `org-chart-editor.tsx:898` | `deleteMode` default tidak sebut jumlah anak terdampak. | Tambah hitungan "Pindahkan N anak ke Atasan (nama)". |
| m5 | minor | `org-chart-editor.tsx:1152-1166` | Skeleton 8 kotak tidak cerminkan 40-node; `aria-hidden` tanpa teks SR. | Tambah `<span sr-only>Memuat struktur…</span>`. |
| m6 | minor | `org-chart-editor.tsx:1176-1193` | Error invalid hanya "Salin detail", tanpa CTA recover. | Tambah `onReset` opsional / "Muat contoh". |
| S1 | major | `apps/showcase/.../org-chart-editor/page.tsx:144-157,191-193,208` | Recipe tanpa langkah bernomor end-to-end; label state teknis mentah; `emptyAction` dead-end (root tanpa anak); toast mock tanpa panduan persistensi (FR-007/FR-016 lemah). | Tambah `ol` "Coba sekarang", tombol Reset demo + "Muat contoh 40 orang", seksi "Resep integrasi" 15 baris (fetch HRIS → `onChange persistDebounced`, search server + `getAncestors`). |

## Perubahan yang Diusulkan

- Perbaiki 8 blocker tanpa ubah kontrak selain B7 (breaking `defaultExpandedIds` diperbaiki + migrasi showcase).
- Node `240×84` + `Tooltip` DS tunggal + beda gaya selected/highlighted + touch 44px.
- Toolbar grup `role=toolbar` + kanvas keyboard tanpa guard + pohon SR internal + focus-ref map + undo tanpa stringify + reduced-motion + responsif + minimap token.
- Showcase: langkah end-to-end bernomor, Reset demo, CTA "Muat contoh 40 orang", seksi resep integrasi HRIS.
- Pecah `org-chart-editor.tsx` bila melewati ±600 baris per modul (misal `editor-normalize.ts`, `editor-layout.ts`, `editor-node.tsx`) dengan pola existing `data-display/org-chart.tsx`; tanpa dependency baru; tanpa token baru (audit kontras light/dark ikut).
- File utama: `packages/ui/src/components/canvas/org-chart-editor.tsx` (+ modul pecahan bila perlu), `*.test.tsx`, `apps/showcase/.../patterns/org-chart-editor/page.tsx`, `docs/design/org-chart-editor.md` (catat ukuran baru + toolbar + tree internal bila berubah dari D1–D9).

## Tasks

- [x] B1 controls: reset `zoomTo(1)` + ikon beda + test.
- [x] B2+B5+M1+M2+M4 node: button/treeitem + a11y + `240×84` + Tooltip tunggal + 44px + chip `text-xs` + kontras.
- [x] B3+M6+M9 kanvas: hapus guard + filter input + reduced-motion + focus-ref map + test Delete/Ctrl+Z dari node.
- [x] B4 pohon SR internal + semua aksi keyboard-setara + live region + test.
- [x] B6 selected vs highlighted beda visual non-warna + test.
- [x] B7 perbaiki `defaultExpandedIds` + migrasi showcase + test controlled/uncontrolled.
- [x] B8 sheet `aria-describedby` + inspector/dialog pesan (m3/m4) + validasi.
- [x] M3 toolbar grup + M7 responsif + M5 minimap token + M8 undo tanpa stringify.
- [~] S1+m5+m6 showcase: langkah `ol`, skeleton SR, hitungan hapus; BELUM: Reset demo, Muat contoh 40 orang, resep integrasi HRIS, error CTA onReset.
- [x] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test` (fokus `org-chart-editor.test.tsx`), `pnpm test:tokens`, `pnpm -C apps/showcase build`.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | B7 breaking diperbaiki sekarang (bukan alias) | Nama prop menipu; menunda hanya menumpuk konsumen salah pakai; showcase dimigrasi sejalan |
| 2 | Node jadi `240×84`, bukan variasikan ukuran per konten | Deterministik untuk tidy-tree; pecah badge ke baris kedua agar anti-truncate tanpa ukur teks dinamis |
| 3 | Pohon SR jadi bagian komponen, bukan showcase | FR-012/D9 mewajibkan dua lapis di komponen; showcase hanya resep controlled |
| 4 | Pecah file bila >±600 baris/modul | 1542 baris satu file tidak maintainable; pola reuse 003 tetap dijaga |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-009-org-chart-editor-layak`
Commit: `fix: layakkan total OrgChartEditor visual, a11y, dan showcase [CR-009]`

- [ ] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
