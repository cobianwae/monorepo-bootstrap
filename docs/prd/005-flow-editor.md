# 005 — Flow Editor / Node Canvas

Status: approved
Owner: —
Tanggal: 2026-11-20
Sumber: roadmap RM-09 (`docs/discussions/component-roadmap.md`)

## Problem

Editor berbasis node/canvas dibutuhkan untuk workflow automation, chatbot builder,
dan pipeline data. Tidak ada komponen atau pattern canvas di design system, sehingga
kebutuhan ini selama ini tidak bisa dilayani atau dibangun konsumen dengan library
mentah di luar token.

Bukti/konsekuensi:

- Praktik industri (xyflow/React Flow) menunjukkan pola baku: canvas pan/zoom,
  palette drag-and-drop, custom node, edge + handle, minimap, controls, inspector.
  Semua ini perlu dibungkus agar konsisten dengan token dan a11y DS.
- Tanpa bingkai DS, tiap app memilih library dan styling sendiri → dark mode,
  kontras, dan perilaku keyboard tidak seragam.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Editor node siap pakai dengan identitas DS | Scenario showcase end-to-end (drag node → sambung edge → edit properti di inspector) | Alur lengkap teramati di showcase |
| Komposisi dengan komponen DS | Node dan inspector memakai komponen existing (`sheet`, form, `badge`, `button`) | Tanpa styling di luar token |
| Productivity loop utuh | Undo/redo + delete + reconnect bekerja pada scenario | Tercover test interaksi |
| Dependency resmi & terukur | `@xyflow/react` diformalisasi dengan versi + ukuran bundle dicatat | Versi 13.0.2 (MIT, unpacked ~1,32 MB) tercatat di OQ#1 |

## Non-goals

- Execution engine / runner workflow (menjalankan graph) — *could have* terpisah,
  tidak masuk v1.
- Kolaborasi realtime (multi-kursor, CRDT).
- Auto-layout graph (ELK/dagre) — *could have*; bila diambil butuh dependency
  tambahan + approval sendiri.
- Code generation dari graph.
- Persistensi graph — state dikontrol konsumen via callback.
- Mind map mode — jalur RM-07, dievaluasi setelah RM-06/RM-09.

## User & Use Case

Persona (ringkas):

1. **Developer konsumen DS** — membangun editor workflow/chatbot; butuh kanvas siap
   pakai dengan custom node dari komponen DS.
2. **Power user / admin** — menyusun alur proses (approval chain, automation):
   tarik node dari palette, sambungkan, atur properti per node di inspector.

JTBD:

- "When saya menyusun alur proses, I want menarik node dari palette dan menyambungnya,
  so I can merancang workflow tanpa coding."
- "When alur saya kompleks, I want minimap dan undo/redo,
  so I can bernavigasi dan bereksperimen dengan aman."

Skenario utama:

1. Tarik node "Kirim email" dari palette ke canvas → muncul dengan handle; sambungkan
   ke node "Tunggu 1 hari" dengan edge berlabel.
2. Pilih node → inspector (sheet) membuka form properti; ubah judul → label node ikut
   berubah.
3. Hapus node terpilih via keyboard Delete → edge terkait ikut terputus; undo
   mengembalikan node dan edge-nya.
4. Canvas besar: minimap menunjukkan posisi viewport; controls zoom in/out/fit.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Canvas dengan pan dan zoom yang halus, batas zoom wajar, dan controls (zoom in/out, fit view). | must | Scenario menunjukkan pan/zoom + controls; interaksi tidak mengganggu scroll halaman. |
| FR-002 | Custom node dapat didefinisikan konsumen memakai komponen DS (konten bebas, tinggi/lebar terukur); node punya handle input/output yang dapat disambung. | must | Story demo mendefinisikan 2 jenis node; sambungan antar handle terbentuk valid (test). |
| FR-003 | Edge menghubungkan handle, dapat berlabel, dan dapat dihapus; edge invalid (arah salah, handle penuh) ditolak dengan umpan balik visual. | must | Sambungan valid terbentuk; sambungan invalid ditolak dengan state visual yang jelas. |
| FR-004 | Palette node: daftar jenis node di sisi kiri; drag memakai `@dnd-kit/*` (sudah ada) dan drop dikonversi ke koordinat kanvas xyflow (`screenToFlowPosition`) untuk menambah node. | must | Drag dari palette menghasilkan node baru di posisi drop (test interaksi). |
| FR-005 | Seleksi node/edge tunggal dan multi (shift/rubber band), dengan aksi delete via keyboard dan menu konteks. | must | Seleksi ganda + delete menghapus elemen terpilih dan edge terkait (test). |
| FR-006 | Node inspector: memilih node membuka panel (basis `overlay/sheet.tsx`) berisi form properti yang disediakan konsumen. | must | Pilih node → sheet terbuka; perubahan form memperbarui node secara live. |
| FR-007 | Undo/redo operasi struktural (tambah/hapus/pindah node, tambah/hapus edge) dengan batas riwayat. | must | Rangkaian aksi + undo berulang mengembalikan state persis (test). |
| FR-008 | Minimap yang menunjukkan posisi node dan viewport, dapat diklik untuk berpindah. | should | Minimap sinkron dengan canvas; klik minimap memindah viewport. |
| FR-009 | Grid halus + snapping ke grid dapat diaktifkan konsumen. | should | Snap aktif → posisi node jatuh ke kelipatan grid (test). |
| FR-010 | Dark mode: canvas, node, edge, minimap memakai token dan lolos kontras light & dark tanpa styling khusus konsumen. | must | Screenshot scenario light & dark lolos audit kontras. |
| FR-011 | Aksesibilitas dasar: controls dan inspector terjangkau keyboard; graph punya representasi alternatif (daftar node+edge) yang terbaca screen reader; fitur pointer-only punya jalur alternatif (menu/keyboard) untuk operasi inti. | must | Audit a11y: semua operasi inti bisa dilakukan tanpa mouse; daftar alternatif terbaca. |
| FR-012 | Kontrak state deklaratif: nodes/edges/posisi dikontrol konsumen (controlled atau onChange), tanpa persistensi internal. | must | Story demo mengelola state di luar komponen tanpa API tambahan. |
| FR-013 | State matrix: loading (skeleton canvas), empty (canvas kosong dengan petunjuk mulai), error (handler gagal, pesan retry). | must | Tiga state teramati di scenario showcase. |
| FR-014 | Showcase scenario flow editor end-to-end (palette → canvas → edge → inspector → undo/redo) dalam light & dark. | must | Route scenario tersedia dan lolos smoke build. |
| FR-015 | Auto-layout graph satu klik (memerlukan library layout — dependency tambahan). | could | Tidak termasuk v1 — tidak ada kontrol auto-layout di showcase; penambahan lewat CR dependency terpisah. |
| FR-016 | Node disabled/running/success/error sebagai status visual bawaan untuk workflow. | could | Node berstatus menampilkan indikator token yang sesuai. |

## Design Refs

- Screen: baru — diusulkan `S-005.29` Flow Editor (`/patterns/flow-editor`),
  didaftarkan resmi di gate 2. Terkait: `S-005.13` Kanban (dnd pattern), `S-004.07`
  Overlays & Menus.
- Komponen terkait: `dnd/sortable-list.tsx` & `@dnd-kit/*` (palette), `overlay/sheet.tsx`
  (inspector), `form/*` (form properti), `base/badge.tsx`, `base/tooltip.tsx`,
  `navigation/context-menu.tsx`, `base/button.tsx` (controls).
- Dokumen design: `docs/design/flow-editor.md` dibuat saat gate 2 (anatomi node/edge,
  mapping xyflow ↔ token, state matrix, flow, wireframe); pecah menjadi **4–6 story**
  saat gate 3 (usulan roadmap: canvas+node, palette+dnd, edge, inspector, undo/redo,
  minimap+polish).
- Analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (§3), roadmap RM-09.

## Constraints & Dependencies

- Dependency package: **`@xyflow/react` 13.0.2** (MIT, unpacked ~1,32 MB, peer React
  ≥18) — prinsip disetujui user 2026-11-20, formalisasi ditutup di OQ#1. Default CSS
  xyflow tidak dipakai mentah; dipetakan ke token.
- Teknis: wrapper di `packages/ui` (kategori `canvas` baru atau existing — OQ#4);
  default CSS xyflow harus dipetakan ke token, bukan dipakai mentah.
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA dengan catatan khusus canvas
  (FR-011), light/dark parity, test Vitest + Testing Library, alur gate AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Formalisasi `@xyflow/react`: versi terkini, ukuran bundle, lisensi, dan opsi menonaktifkan default styling. Prinsipnya sudah disetujui user 2026-11-20. | answered — versi 13.0.2, MIT, unpacked ~1,32 MB; default CSS dimatikan/di-map ke token |
| 2 | Cakupan v1: apakah minimap (FR-008) masuk v1 atau story terakhir yang boleh terpotong? | answered — masuk v1 sebagai story terakhir yang boleh dipotong |
| 3 | Strategi styling: override CSS xyflow dengan token vs menonaktifkan default CSS dan render ulang bagian visual. | answered — nonaktifkan default CSS, render ulang visual dengan token |
| 4 | Kategori folder baru `components/canvas/` vs masuk kategori existing? (Melanjutkan OQ#4 diskusi landscape.) | answered — kategori baru `components/canvas/` |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-20 | Draft awal dari roadmap RM-09; dependency `@xyflow/react` tercatat sudah disetujui prinsip user (2026-11-20) |
| 2026-11-20 | **Approved (gate 1)** — OQ#1–#4 dijawab; dependency 13.0.2 (MIT), kategori `canvas`, styling token |
