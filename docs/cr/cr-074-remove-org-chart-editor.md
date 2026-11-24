# CR-074 — Hapus OrgChartEditor (legacy PRD 010), pulihkan status OrgChart

**Status:** done (disetujui user 2026-11-24; ditetapkan done oleh user 2026-11-24)
**Catatan nomor:** memakai CR-074 karena CR-071–073 sudah dipakai rangkaian CR Dynamic Form.
**Sumber:** keputusan user 2026-11-24 — konsolidasi org chart: pertahankan OrgChart + OrgChartStudio, hapus OrgChartEditor
**Ref:** `docs/prd/010-org-chart-editor.md`, `docs/prd/011-org-chart-studio.md` (FR-001, FR-015), `packages/ui/src/components/canvas/org-chart-editor.tsx`, `apps/showcase/src/app/(docs)/patterns/org-chart-editor/page.tsx`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `packages/ui/src/components/canvas/org-chart-editor.tsx:1` | Dua kanvas org berdampingan (PRD 010 dan 011); Studio sudah `implemented` dan self-contained (FR-001/FR-015), editor tidak dipakai konsumen mana pun. | Hapus komponen, test, export, route, dan entri nav. |
| 2 | minor | `apps/showcase/src/app/(docs)/patterns/org-chart/page.tsx:143-151` | OrgChart ditandai deprecated "akan dihapus saat 011 shipped" padahal diputuskan dipertahankan. | Hapus banner deprecation; status jadi `implemented`. |
| 3 | minor | `docs/design/sitemap.md:73,80` | S-005.28 `deprecated`, S-005.33 masih merujuk route yang dihapus. | S-005.28 → `implemented`; S-005.33 → `deprecated (dihapus CR-074)`. |
| 4 | minor | `docs/design/object-model.md:40,47` | Inventaris menyebut `org-chart-editor` dan label `legacy` pada `org-chart`. | Hapus entri editor; hapus label legacy OrgChart. |
| 5 | minor | `docs/prd/010-org-chart-editor.md:3` | Status file `approved` sedangkan `docs/STATUS.md` menyebut "010 (legacy) shipped". | Catat superseded di bawah baris Status; **nilai status tidak diubah**. |
| 6 | minor | `docs/design/org-chart-editor.md:6` (+ wireframe, flow) | Dokumen hidup untuk komponen yang akan dihapus. | Hapus ketiga file. |

## Perubahan yang Diusulkan

**Kode (hapus):**

- `packages/ui/src/components/canvas/org-chart-editor.tsx` (1541 baris)
- `packages/ui/src/components/canvas/org-chart-editor.test.tsx` (563 baris, 34 test)
- `packages/ui/src/index.ts:52` — `export * from './components/canvas/org-chart-editor'`
- `apps/showcase/src/app/(docs)/patterns/org-chart-editor/page.tsx` (286 baris)
- `apps/showcase/src/components/showcase-nav-content.tsx:168` — entri nav "Org Chart Editor"

Dampak API publik `@ds/ui`: hilang `OrgChartEditor`, `getDescendantIds`, `validateReparentTarget`, `computeEditorPositions`, `toFlowNodes`, `toFlowEdges`, `UNDO_LIMIT`, serta tipe `OrgChartEditorProps/Accent/Node/Error`, `ReparentReason`, `ReparentValidation`, `EditorPosition`, `DragState`, `OrgFlowNodeData`, `OrgFlowNode`, `OrgFlowEdge`. Tidak ada konsumen di `apps/web`, `apps/api`, atau komponen lain.

**Tidak disentuh:** `@xyflow/react` (dipakai Studio, Flow Editor, Mind Map), `data-display/org-chart.tsx` (dipakai OrgChart + Mind Map), `canvas/org-chart-studio.tsx`.

**Docs (hapus dokumen hidup):**

- `docs/design/org-chart-editor.md`
- `docs/design/wireframes/org-chart-editor.md`
- `docs/design/flows/org-chart-editor.mmd`

**Docs (beri catatan "Removed — digantikan PRD 011 (CR-074)" di bawah baris Status):**

- `docs/prd/010-org-chart-editor.md`
- `docs/stories/010-01-canvas-foundation.md`
- `docs/stories/010-02-crud-inspector.md`
- `docs/stories/010-03-reparent-undo.md`
- `docs/stories/010-04-search-states-showcase.md`

**Indeks:**

- `docs/design/sitemap.md:73` — S-005.28 → `implemented`
- `docs/design/sitemap.md:80` — S-005.33 → `deprecated (dihapus CR-074)`
- `docs/design/object-model.md:40` — hapus label `(legacy PRD 003, diganti 011)` pada `org-chart`
- `docs/design/object-model.md:47` — hapus entri `org-chart-editor (legacy PRD 010, diganti 011)`
- `docs/BACKLOG.md` — baris CR-074
- `docs/STATUS.md` — posisi dan keputusan
- `docs/STATUS-LOG.md` — append `2026-11-24 — … — CR-074`

**Tidak disentuh (riwayat):** `docs/cr/cr-009-*`, `docs/cr/cr-010-*`, `docs/cr/cr-069-*`, `docs/reviews/*`, `docs/stories/011-01-*`, `docs/stories/011-05-*`, `docs/prd/011-org-chart-studio.md`, isi lama `docs/STATUS-LOG.md`, `docs/BACKLOG-ARCHIVE.md`.

**Uji dampak:** suite `@ds/ui` turun tepat 34 test. Tidak ada route/komponen lain yang mengimpor simbol editor (diverifikasi grep di `packages`, `apps`, `scripts`).

## Tasks

- [x] Hapus 5 titik kode (komponen, test, export, route, nav).
- [x] Hapus 3 dokumen hidup editor.
- [x] Beri catatan superseded pada PRD 010 + 4 story 010-xx.
- [x] Perbarui sitemap (S-005.28, S-005.33) dan object-model (2 baris).
- [x] Hapus banner deprecation OrgChart (`org-chart/page.tsx:143-151`).
- [x] Append `STATUS-LOG`, perbarui `BACKLOG` + `STATUS`, jalankan `node scripts/check-status-log.mjs`.
- [ ] Verifikasi: tidak ada import/export/pemakaian aktif `OrgChartEditor|org-chart-editor` di `packages apps`; tiga komentar historis di `org-chart-studio.tsx` dikecualikan sesuai keputusan user (Studio tetap utuh). `@ds/ui build:types` tetap 12 error baseline FlowEditor; suite ui turun tepat 34 test tanpa kegagalan baru; `@ds/showcase` test + lint hijau.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Dokumen hidup editor dihapus; PRD 010 + story 010-xx disimpan sebagai riwayat | ID imutabel, artefak `done`/`approved` tidak dihapus tanpa jejak; spec hidup menyesatkan. |
| 2 | OrgChart di-un-deprecate (banner dihapus, sitemap `implemented`) | Komponen tetap dipertahankan sebagai warga design system. |
| 3 | S-005.33 tetap di sitemap dengan `deprecated (dihapus CR-074)` | Hindari status baru di luar konvensi dan hindari penggunaan ulang ID. |
| 4 | Referensi historis di PRD 011 / story 011-05 tidak diedit | Merupakan catatan keputusan saat itu; pembalikan dicatat di CR ini, bukan dengan menulis ulang artefak done. |

## Design System Checks

- [x] Tidak relevan — tidak ada kode visual baru.
- [x] Tidak relevan — tidak ada perubahan warna/kontras.
- [x] Tidak relevan — komponen dihapus, bukan diubah.
- [x] API export konsisten: penghapusan eksplisit dan terdokumentasi.
- [x] State loading/empty/error tidak hilang dari DS: Studio menyediakan state matrix sendiri.
- [x] Showcase/docs diperbarui bila perlu — dikerjakan di Tasks.
- [x] Verifikasi dijalankan: `pnpm lint` hijau; `pnpm typecheck` tetap 12 error baseline FlowEditor; `pnpm test` UI 714/714 (turun 34 test editor). Test showcase dengan 2 worker dan timeout 30 detik: 90/94 lulus, empat FlowEditor gagal (`localStorage.getItem`); build showcase lulus.

## Eksekusi

Branch: `cr-074-remove-org-chart-editor`
Commit: `refactor: hapus OrgChartEditor legacy dan pulihkan OrgChart [CR-074]`

- [x] CR disetujui user (2026-11-24).
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan; kegagalan baseline/lingkungan dicatat, bukan diperbaiki di luar scope.
- [x] CR di-tick dan status `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui.
- [x] `docs/STATUS-LOG.md` di-append dan `check-status-log` hijau.
