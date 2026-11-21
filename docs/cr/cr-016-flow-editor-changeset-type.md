# CR-016 — Flow Editor: perlakuan `NodeChangeset`/`EdgeChangeset` sebagai array (`changes.some is not a function`)

**Status:** done (ditutup 2026-11-22 atas instruksi user; fix sudah live di `dev` tanpa commit berlabel CR-016, verifikasi target 49/49 hijau)
**Sumber:** bug (review artefak 005)
**Ref:** `docs/prd/005-flow-editor.md` (FR-005, FR-007, FR-012), `docs/stories/005-01-canvas-node-foundation.md`, `docs/stories/005-04-seleksi-inspector-hapus.md`, `docs/stories/005-05-undo-redo-toolbar.md`, `docs/stories/005-06-minimap-showcase-audit.md`, `docs/design/flow-editor.md`

## Latar Belakang

`@xyflow/react` 13.0.2 mengirim `NodeChangeset<T>` dan `EdgeChangeset<T>` ke `onNodesChange` / `onEdgesChange`. Dari `@xyflow/system@1.0.0` (`dist/index.d.ts:1824`, `:1946`, `:1986`), keduanya adalah **class `Changeset`** dengan method `toArray()`, `getByType()`, `applyTo()`, dan `[Symbol.iterator]`. Keduanya **bukan `Array`**, sehingga `.some(...)` tidak tersedia.

Kode FlowEditor dan showcase memperlakukan nilai ini sebagai array dan menutupinya dengan `as unknown as`. Akibatnya `.some` gagal saat xyflow sendiri memicu perubahan (misalnya drag/select node, atau hapus node yang ikut memutus edge). Error yang dilaporkan: `changes.some is not a function`.

Test (`flow-editor.test.tsx:12`) me-mock `@xyflow/react` dan mengirim array biasa, sehingga bug ini tidak tertangkap.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | blocker | `packages/ui/src/components/canvas/flow-editor.tsx:1091` | `handleNodesChange` memanggil `.some` pada `NodeChangeset` (class, bukan array). Crash pada setiap perubahan node dari xyflow. | Normalisasi sekali di batas: `const list = changes.toArray();` lalu pakai `list` untuk `.some`/loop. |
| 2 | blocker | `packages/ui/src/components/canvas/flow-editor.tsx:1122` dan `:1133` | `handleEdgesChange` memanggil `.some` pada `EdgeChangeset` di jalur controlled dan uncontrolled. Crash saat xyflow memicu remove/add edge. | Sama dengan #1: `const list = changes.toArray();` di awal handler, lalu gunakan `list`. |
| 3 | major | `apps/showcase/src/app/(docs)/patterns/flow-editor/page.tsx:145` | `handleEdgesChange` di showcase memanggil `.some` pada `EdgeChangeParam` (`Changeset`). Crash yang sama di sisi konsumen. `:128` (loop `for...of`) berjalan karena iterable, tetapi tetap ditutupi cast. | Ganti dengan `changes.toArray()` lalu `.some`. Hapus `as unknown as` pada `:128`. |
| 4 | major | `flow-editor.tsx:1204–1234` (`computeNodeChanges`, `computeEdgeChanges`) | Undo/redo mengembalikan **array biasa** yang di-cast menjadi `NodeChangeset`/`EdgeChangeset`. Konsumen yang memanggil `changes.applyTo`, `toArray`, atau `getByType` (API publik xyflow) akan crash. | Putuskan kontrak `onNodesChange`/`onEdgesChange` (lihat Keputusan #1). Bangun instance `Changeset` asli atau ubah kontrak ke array, lalu terapkan konsisten. |
| 5 | major | `flow-editor.tsx:1293` dan `:1429` | Remove edge dari keyboard dan menu konteks mengirim `[{...}] as unknown as EdgeChangeset`. Bentuk ini sama dengan #4 dan tidak sesuai tipe. | Samakan dengan keputusan #4, gunakan helper pembangun changeset tunggal. |
| 6 | major | `packages/ui/src/components/canvas/flow-editor.test.tsx:12` | Mock `@xyflow/react` dan test controlled/undo hanya memakai array. Tidak ada test yang memakai `Changeset` asli, sehingga regresi #1–#2 lolos (suite hijau 32/32 pada 005-05). | Tambah test dengan `Changeset` asli (`@xyflow/system` / `NodeChangeset` dari `@xyflow/react`) untuk drag, select, delete node, dan delete edge. |
| 7 | major | `docs/stories/005-05-undo-redo-toolbar.md`, `docs/STATUS-LOG.md` (entri 2026-11-21 untuk 005-05) | Story `done` dan log menyatakan undo/redo lolos test, tetapi jalur perubahan dari xyflow tidak teruji. Klaim "lolos" tidak mencakup kondisi nyata. | Setelah fix, tambah catatan verifikasi di story; status `done` dibiarkan keputusan user. |

## Perubahan yang Diusulkan

- Fix #1–#3: normalisasi `Changeset` ke array di awal setiap handler (`toArray()`), hapus `as unknown as` pada tipe changes.
- Fix #4–#5: satu helper pembangun changeset di `flow-editor.tsx` untuk undo/redo dan remove edge; tidak ada cast ganda.
- Fix #6: tambah test dengan changeset asli untuk minimal drag node, select node, delete node (edge ikut terputus), delete edge.
- Dampak API publik: **bisa** mengubah tipe argumen `onNodesChange`/`onEdgesChange` yang dilihat konsumen. Perlu keputusan user (lihat Keputusan #1) sebelum implementasi.

## Tasks (jalur small-fix)

- [x] Keputusan #1 disetujui user.
- [ ] Reproduksi di showcase `/patterns/flow-editor`: drag node, klik node, hapus node → catat error. (dilakukan lewat test dengan `Changeset` asli; target 49/49 hijau 2026-11-22)
- [x] Fix handler `handleNodesChange` / `handleEdgesChange` (`flow-editor.tsx`) dan `page.tsx` showcase (`changes.toArray()`, cast ganda dihapus).
- [x] Fix pembangun undo/redo dan remove edge (`computeNodeChanges`, `computeEdgeChanges` → `new NodeChangeset/EdgeChangeset(...)`; remove keyboard dan menu konteks).
- [x] Test changeset asli ditambahkan di `flow-editor.test.tsx` (describe "FlowEditor changeset xyflow asli (CR-016)"; 3 test baru + assertion 005-03 disesuaikan ke `toArray()`).
- [x] Verifikasi target 2026-11-22: `flow-editor.test.tsx` 49/49 hijau. Belum: `pnpm test` penuh, build showcase, uji browser manual drag/select/delete (tindak lanjut).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Kontrak `onNodesChange`/`onEdgesChange`: tetap `Changeset` xyflow (rekomendasi) **atau** ubah ke `NodeChange[]`/`EdgeChange[]` (perubahan API publik) | Perubahan API publik butuh konfirmasi user (CONVENTIONS: "Butuh Konfirmasi"). Rekomendasi: tetap `Changeset` agar sejalan dengan xyflow 13. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik (tidak relevan untuk fix logika, tetap dicek).
- [ ] Kontras light dan dark lolos WCAG AA (tidak berubah).
- [ ] Perilaku Radix/a11y tidak rusak (live region dan toast Urungkan tetap).
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (catatan: baseline `flow-editor.test.tsx` per CR-015 bisa merah; catat terpisah).

## Eksekusi

Branch: `cr-016-flow-editor-changeset`
Commit: `fix: normalisasi changeset xyflow pada flow editor [CR-016]`

- [x] CR disetujui user (approved + instruksi tutup 2026-11-22).
- [ ] Branch dibuat. (dilewati — pekerjaan sudah live di `dev` tanpa branch berlabel; tidak dibuat retroaktif)
- [x] Perubahan diimplementasikan (terverifikasi live di `dev`: `toArray()` + `new NodeChangeset/EdgeChangeset` + test CR-016).
- [ ] Commit: tidak ada commit berlabel CR-016 (perubahan masuk lewat jalur lain).
- [x] Verifikasi dijalankan (target `flow-editor.test.tsx` 49/49 hijau 2026-11-22).
- [x] CR di-tick dan status diperbarui (langsung ke `docs/BACKLOG-ARCHIVE.md` sebagai done; tidak pernah tercatat di BACKLOG aktif).
- [x] `docs/STATUS.md` diperbarui.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
