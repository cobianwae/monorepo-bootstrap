# CR-020 — Pulihkan perilaku kanvas Mind Map setara fondasi 011

**Status:** approved
**Sumber:** review / bug — user: "012 dia itu gak jalan deh canvasnya, coba deh check implementsi 011 yang secara fungsionalitas udah jalan"
**Ref:** `docs/prd/012-mind-map.md` (approved, FR-002/004/005/009), `docs/design/wireframes/mind-map.md` (approved), story `012-01`–`012-03` (done), `docs/cr/cr-014-studio-layak-pakai.md` (done), `packages/ui/src/components/canvas/org-chart-studio.tsx`

## Temuan

Review membandingkan MindMap 012 dengan **OrgChartStudio 011**, bukan
OrgChartEditor legacy. Bukti berbasis kode dan tes DOM; keluhan user belum
direproduksi di browser nyata dalam sesi ini. Tidak ada perubahan kode.

**Amendment 2026-11-21 (persetujuan user: "Amend CR-020"):** investigasi
lanjutan menemukan akar keluhan "canvas tidak jalan" — temuan 0 (blocker) di
bawah. Direproduksi di jsdom dengan ReactFlow asli (tanpa mock), bukan browser.

| # | Severity | Lensa | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|---|
| 0 | blocker | UX/UI / implementation drift | `packages/ui/src/components/canvas/mind-map.tsx:1195`, `packages/ui/src/components/canvas/mind-map.tsx:1197`, `packages/ui/src/components/canvas/mind-map.tsx:487`, pembanding `packages/ui/src/components/canvas/org-chart-studio.tsx:1116` | Di `@xyflow/react` 13.0.2 wrapper node mendapat `pointer-events: all` hanya bila node selectable, draggable, atau punya handler klik/hover; selain itu `none`. MindMap memakai `nodesDraggable={false}` + `elementsSelectable={false}` tanpa handler, sehingga semua `.react-flow__node` ber-`pointer-events: none` dan anak-anaknya mewarisi. Akibatnya tombol `+` (hover/focus), expander, klik, dan double-click pill tidak menerima pointer di browser; hanya pan/zoom kanvas yang jalan. 011 aman karena `elementsSelectable` true. Probe: render MindMap asli → `style.pointerEvents` node `['none','none']`; Studio → `['all','all']`. Tes 43/43 lolos karena memakai `fireEvent` (mengabaikan `pointer-events`) dan `useReactFlow` dimock. | Pulihkan pointer pada node: pilih yang paling sederhana — set `pointerEvents: 'all'` per node di builder node (`:487`), atau `elementsSelectable` true bila tidak bentrok dengan roving-tabindex/`nodesFocusable={false}`. Tambah tes regresi permanen yang merender ReactFlow asli dan meng-assert `pointer-events` node bukan `none`. Ini harus dikerjakan sebelum temuan 1–3 diverifikasi di browser. |
| 1 | major | UX/UI / implementation drift | `packages/ui/src/components/canvas/mind-map.tsx:1455`, `packages/ui/src/components/canvas/mind-map.tsx:1672`, `packages/ui/src/components/canvas/mind-map.tsx:1805` | Tambah mengaktifkan `editingId`, tetapi canvas tidak menerima target pemusatan dan efek fokus hanya memanggil DOM `.focus()`. Tidak ada pemindahan viewport ke node baru/edit/fokus, berbeda dari 011 yang meneruskan `centerNodeId={editingId ?? focusNodeId}` dan memanggil `setCenter`. Node di luar area terlihat berisiko membuat aksi terasa tidak berjalan (FR-002/005/009). | Turunkan pola pemusatan 011/CR-014 ke MindMap dengan ukuran root/cabang yang benar; jaga zoom dan reduced-motion. Pastikan input baru dan target fokus terlihat, bukan sekadar aktif di DOM. |
| 2 | major | UX/UI / implementation drift | `packages/ui/src/components/canvas/mind-map.tsx:1211`, `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx:111` | Minimap selalu `hidden md:block`; toggle demo hanya mount/unmount, tidak dapat menampilkan minimap di mobile. Bertentangan dengan wireframe §6: sembunyi dengan toggle, bukan hilang permanen. | Sediakan jalur toggle internal yang benar-benar dapat menampilkan minimap pada viewport kecil, tanpa perubahan API publik yang tidak disetujui. |
| 3 | major | Implementation drift / test | `packages/ui/src/components/canvas/mind-map.test.tsx:33`, `packages/ui/src/components/canvas/mind-map.test.tsx:142`, `apps/showcase/src/app/(docs)/patterns/mind-map/page.test.tsx:54` | `useReactFlow` dimock (viewport tetap 0,0,1); tes reset menerima translasi nol dan tes 50 node hanya menghitung elemen DOM. Tidak menguji apakah node/input terlihat, viewport bergerak, atau konektor terhubung di browser. | Pertahankan unit test; tambahkan kasus viewport nontrivial dan walkthrough browser Q1/50 node untuk fit/reset, tambah/edit, pan/zoom, konektor, mobile, light/dark. Jangan mengklaim smoke build sebagai validasi interaksi. |
| 4 | minor | Koherensi dokumen | `docs/design/sitemap.md:83`, `docs/design/sitemap.md:124`, `docs/stories/012-03-keyboard-cari-showcase-audit.md:91` | Route S-005.35 dan M-011 sudah diimplementasikan, tetapi masih `in-design`; catatan story mengaitkan pembaruan dengan shipped. Status implementasi layar tidak sinkron dengan story done. | Setelah pemulihan terverifikasi dan CR approved, sinkronkan inventaris layar/modal; jangan mengubah approval atau menetapkan shipped/done tanpa user. |

## Perubahan yang Diusulkan

- Perbaikan ditargetkan pada `packages/ui/src/components/canvas/mind-map.tsx`,
  test co-located, dan scenario/test `/patterns/mind-map`.
- Gunakan perilaku viewport 011 dan pelajaran CR-014 sebagai pembanding;
  layout dua sisi tetap milik MindMap, tanpa drag-reparent v1.
- Pertahankan token semantik, `cva`, Radix Tooltip/ContextMenu/AlertDialog,
  state loading/empty/error, dan named/barrel export yang sudah ada.
- Tidak menambah dependency, token, atau mengubah API publik tanpa konfirmasi.

### Pembanding 011 dan batas kepastian

- `packages/ui/src/components/canvas/org-chart-studio.tsx:1026` memusatkan
  viewport ke posisi node melalui `setCenter`; target diberikan pada baris 2445.
  Mekanisme ini tidak diturunkan ke MindMap.
- Gagang MindMap sudah memakai `nodrag nopan` dan stopPropagation
  (`mind-map.tsx:592`), serta Handle konektor (`:732` dan seterusnya).
  Base CSS xyflow juga sudah diimpor (`packages/ui/src/styles.css:1`).
  Jangan mengulang diagnosis lama 011 seolah perbaikan ini belum ada.
- Reset dengan translasi tetap dan minimap `hidden md:block` juga ada di 011;
  reset bukan pembeda utama keluhan 012. Temuan minimap tetap valid terhadap
  wireframe 012 §6, bukan bukti penyebab utama keluhan.
- Re-fit setelah perubahan ukuran/dataset perlu diperiksa di browser;
  tidak adanya re-fit otomatis saja belum membuktikan defek.

## Tasks (jalur small-fix)

- [x] Pulihkan `pointer-events` node MindMap (temuan 0) dan tambah tes regresi dengan ReactFlow asli (assert style node ≠ `none`; hover/klik `+` dan expander tidak diblokir). Kerjakan lebih dulu.
- [x] Teruskan target edit/fokus ke canvas dan pusatkan node setelah layout final; pertahankan zoom serta reduced-motion.
- [x] Pastikan minimap bisa ditampilkan melalui toggle di mobile.
- [x] Tambah tes regresi viewport nontrivial, bukan hanya callback mock.
- [x] Walkthrough browser Q1 dan 50 node: konektor, tambah anak/saudara, input terlihat, edit, lipat, hapus/undo, fit/reset, drag pan, Ctrl/Cmd+wheel, dan keyboard.
- [x] Verifikasi light/dark, mobile, zoom browser 200%, serta fokus dan alternatif pohon SR; catat hasil nyata, bukan asumsi dari DOM.
- [x] Sinkronkan sitemap dan catatan implementasi setelah perbaikan terverifikasi.
- [x] Jalankan typecheck → lint → test serta build showcase; catat baseline terpisah.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | CR disetujui user pada 2026-11-21 ("approve"). | Persetujuan dicatat; implementasi mengikuti scope CR ini. |
| 2 | Review tidak mengubah kode atau status artefak 011/012. | Scope permintaan adalah review dan draft CR. |
| 3 | Tidak membuka perbaikan reset atau resize otomatis sebagai bug terkonfirmasi. | Reset sama dengan pembanding 011; resize belum diverifikasi di browser. |
| 4 | Temuan 0 (pointer-events node `none`) ditambahkan ke CR-020 lewat amendment atas persetujuan user, bukan CR terpisah. | Satu cluster koheren (keluhan canvas 012 tidak jalan); blocker dikerjakan lebih dulu. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA.
- [x] Perilaku Radix/a11y tidak rusak.
- [x] API `cva` dan export tetap konsisten.
- [x] State loading, empty, dan error relevan tersedia.
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass atau baseline dicatat.

## Verifikasi Review

- `pnpm --filter @ds/ui exec vitest run src/components/canvas/mind-map.test.tsx --maxWorkers=2 --testTimeout=30000`: **43/43 lulus**; warning `act(...)` saat penutupan dialog.
- `pnpm --filter @ds/showcase exec vitest run 'src/app/(docs)/patterns/mind-map/page.test.tsx' --maxWorkers=2 --testTimeout=30000`: **3/3 lulus**.
- Probe sekali pakai (jsdom, ReactFlow asli, file sudah dihapus): `.react-flow__node` `style.pointerEvents` MindMap `none`, OrgChartStudio `all`. Source xyflow 13.0.2: `pointerEvents = (selectable || draggable || onClick || onMouseEnter || onMouseMove || onMouseLeave) ? 'all' : 'none'`.
- Browser/SR nyata, full suite, dan build tidak dijalankan pada review ini.
- Graphify dicoba, tetapi hasil tidak memuat MindMap/OrgChartStudio yang relevan; fallback pembacaan kode targeted.

## Eksekusi

Branch: `cr-020-mind-map-canvas-parity`
Commit: `fix: restore mind map canvas behavior [CR-020]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append dan `node scripts/check-status-log.mjs` hijau.

### Hasil implementasi — 2026-11-22

- Base: `origin/dev` `6871ce8` (fetch terbaru saat mulai; tidak ada perubahan user yang ditimpa).
- Node builder memakai `style.pointerEvents: 'all'` tanpa mengaktifkan selectable/draggable. Tes permanen ReactFlow asli ditambahkan setelah terbukti merah (`none` vs `all`) sebelum perbaikan.
- Target `editingId ?? focusNodeId` diteruskan ke canvas. `setCenter` memakai pusat root 200×64/cabang 160×48 setelah layout final, zoom saat ini, serta durasi 0 untuk reduced-motion. Guard target/posisi/mode edit mencegah rerender biasa mengganggu pan manual, tetapi edit ulang node yang sama setelah pan tetap memulihkan input. Kasus terakhir diuji ulang pada kedua dataset di production build final.
- Toggle internal mobile bertarget 44px, `aria-pressed`, `nodrag nopan`; `minimap={false}` tetap meniadakan minimap dan toggle. Tidak ada perubahan API publik, dependency, token, atau OrgChartStudio.
- Graphify dicoba pada perencanaan, tetapi graph dibangun dari `1568661` dan tidak memuat node MindMap; fallback pembacaan targeted.

### Verifikasi implementasi

- `pnpm typecheck`: **baseline tetap 12 error** `HTMLElement.disabled` di `flow-editor.test.tsx:706–753`. Error baru unused import pada test integrasi sempat ditemukan, dibersihkan; run final hanya baseline tersebut.
- `pnpm lint`: **hijau**.
- `pnpm test`: run awal **hijau** (705 UI + 68 showcase + 8 token). Setelah tambahan satu test reduced-motion/fokus, run final **705/706 UI**, seluruh **48 MindMap lulus**; satu kegagalan baseline smoke RichTextEditor `rte-link-save` muncul kembali dan gagal juga saat diulang terisolasi. Tidak memperbaiki file RTE di luar scope.
- `pnpm --filter @ds/showcase test`: **68/68**, termasuk tiga scenario MindMap, dijalankan terpisah karena run root final berhenti pada UI.
- `pnpm --filter @ds/ui exec vitest run src/components/canvas/mind-map.test.tsx src/components/canvas/mind-map.integration.test.tsx --maxWorkers=2 --testTimeout=30000`: **48/48** (45 unit + 3 integrasi). Hook viewport asli, pan lalu edit dengan zoom tetap, wrapper pointer, toggle minimap/prop false, pusat root/cabang, fokus keyboard/reduced-motion dan guard pan tercakup.
- `pnpm test:tokens`: **8/8**, termasuk audit AA seluruh tema light/dark; tidak ada token diubah. `pnpm -C apps/showcase build`: **hijau**, 76 halaman termasuk MindMap.
- Chrome headless melalui CDP pada production build, viewport 1440×1000: Q1 (12 node/11 path edge) dan dataset 50 node/49 path edge; computed pointer `all`; pointer/keyboard nyata untuk tambah anak/saudara, input baru fokus dan berada dalam bounds canvas, edit F2 menjaga zoom, lipat/buka, hapus daun/undo/redo, drag pan, Ctrl+wheel, keyboard pan/zoom, fit dan reset 100%. Tidak menganggap double-click sebagai jalur edit yang sudah didukung.
- Light/dark: global showcase dipilih terang, lalu toggle gelap lokal diuji untuk kedua dataset. Minimap tampil/sembunyi pada lebar CSS 390px; tombol dan pohon tetap dapat dijangkau. Reflow 720px juga diuji.
- Zoom browser Chrome asli **200%**, bukan hanya page-scale CSS: profil sementara melalui `chrome.settingsPrivate.setDefaultZoom(2)`, terkonfirmasi `innerWidth=720`/DPR 2 pada viewport 1440. Edit root F2 memusatkan input fokus di dalam canvas, minimap dapat ditoggle; zoom profil dikembalikan ke 1.
- Pohon aksesibel dibuka; Chrome accessibility tree mengekspos `tree`/`treeitem`. **Suara pembaca layar native belum diuji**; AX tree bukan klaim validasi pengumuman suara.
- Screenshot dan runner CDP sekali pakai disimpan di direktori temp sesi `.../T/opencode/cr-020-*`, tanpa dependency browser baru atau artefak besar di repo. Dev server sempat gagal menulis cache (`ENOSPC`); hanya cache webpack hasil sesi ini dibersihkan, lalu production build dan walkthrough lulus.
- S-005.35 dan M-011 menjadi `implemented`; approval PRD/story tidak diubah. CR tetap `approved` untuk review user; belum push/PR/merge.
