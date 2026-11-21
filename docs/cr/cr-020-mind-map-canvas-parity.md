# CR-020 — Pulihkan perilaku kanvas Mind Map setara fondasi 011

**Status:** approved
**Sumber:** review / bug — user: "012 dia itu gak jalan deh canvasnya, coba deh check implementsi 011 yang secara fungsionalitas udah jalan"
**Ref:** `docs/prd/012-mind-map.md` (approved, FR-002/004/005/009), `docs/design/wireframes/mind-map.md` (approved), story `012-01`–`012-03` (done), `docs/cr/cr-014-studio-layak-pakai.md` (done), `packages/ui/src/components/canvas/org-chart-studio.tsx`

## Temuan

Review membandingkan MindMap 012 dengan **OrgChartStudio 011**, bukan
OrgChartEditor legacy. Bukti berbasis kode dan tes DOM; keluhan user belum
direproduksi di browser nyata dalam sesi ini. Tidak ada perubahan kode.

| # | Severity | Lensa | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|---|
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

- [ ] Teruskan target edit/fokus ke canvas dan pusatkan node setelah layout final; pertahankan zoom serta reduced-motion.
- [ ] Pastikan minimap bisa ditampilkan melalui toggle di mobile.
- [ ] Tambah tes regresi viewport nontrivial, bukan hanya callback mock.
- [ ] Walkthrough browser Q1 dan 50 node: konektor, tambah anak/saudara, input terlihat, edit, lipat, hapus/undo, fit/reset, drag pan, Ctrl/Cmd+wheel, dan keyboard.
- [ ] Verifikasi light/dark, mobile, zoom browser 200%, serta fokus dan alternatif pohon SR; catat hasil nyata, bukan asumsi dari DOM.
- [ ] Sinkronkan sitemap dan catatan implementasi setelah perbaikan terverifikasi.
- [ ] Jalankan typecheck → lint → test serta build showcase; catat baseline terpisah.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | CR disetujui user pada 2026-11-21 ("approve"). | Persetujuan dicatat; implementasi mengikuti scope CR ini. |
| 2 | Review tidak mengubah kode atau status artefak 011/012. | Scope permintaan adalah review dan draft CR. |
| 3 | Tidak membuka perbaikan reset atau resize otomatis sebagai bug terkonfirmasi. | Reset sama dengan pembanding 011; resize belum diverifikasi di browser. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass atau baseline dicatat.

## Verifikasi Review

- `pnpm --filter @ds/ui exec vitest run src/components/canvas/mind-map.test.tsx --maxWorkers=2 --testTimeout=30000`: **43/43 lulus**; warning `act(...)` saat penutupan dialog.
- `pnpm --filter @ds/showcase exec vitest run 'src/app/(docs)/patterns/mind-map/page.test.tsx' --maxWorkers=2 --testTimeout=30000`: **3/3 lulus**.
- Browser/SR nyata, full suite, dan build tidak dijalankan pada review ini.
- Graphify dicoba, tetapi hasil tidak memuat MindMap/OrgChartStudio yang relevan; fallback pembacaan kode targeted.

## Eksekusi

Branch: `cr-020-mind-map-canvas-parity`
Commit: `fix: restore mind map canvas behavior [CR-020]`

- [x] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append dan `node scripts/check-status-log.mjs` hijau.
