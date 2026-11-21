# Spec Desain — Flow Editor / Node Canvas

Status: approved (gate 2 — 2026-11-21)
PRD: `docs/prd/005-flow-editor.md` (approved gate 1 ulang 2026-11-21)
Layar: `S-005.29` Flow Editor (`/patterns/flow-editor`) + child `S-005.29.01` palette, `S-005.29.02` inspector
Flow: `docs/design/flows/flow-editor.mmd` · Wireframe: `docs/design/wireframes/flow-editor.md`
Tanggal: 2026-11-21

## 1. Keputusan Desain

| # | Keputusan | Alasan |
|---|---|---|
| D1 | Komponen baru `FlowEditor` di `packages/ui/src/components/canvas/flow-editor.tsx` (kategori `canvas`), wrapper di atas `@xyflow/react` **13.0.2** (sudah disetujui prinsip user 2026-11-20, bukan dependency baru). Default CSS xyflow **dimatikan** dan dirender ulang dengan token (node/edge/controls/minimap/background hanya kelas semantik). | FR-001, FR-010; OQ#1 (versi+lisensi+ukuran tercatat) + OQ#3 (strategi styling); constraint token-first. |
| D2 | Palette terpisah `FlowPalette` di file yang sama/folder `canvas/` memakai `@dnd-kit/*` (sudah ada) untuk drag; drop dikonversi via `screenToFlowPosition` xyflow menjadi posisi flow; tambah keyboard via tombol `[+]` per item (tambah di tengah viewport). | FR-004 + OQ reuse dnd; FR-011 jalur non-pointer. |
| D3 | Kontrak deklaratif penuh: `nodes`/`edges` + `onNodesChange`/`onEdgesChange`/`onConnect` controlled + `onSelectionChange` untuk inspector (uncontrolled via `defaultNodes`/`defaultEdges` untuk demo); komponen tidak fetch/persist (FR-012). Satu commit mutasi = satu callback + satu push undo. Toolbar (milik pola, di showcase) memegang undo/redo/snap/grid toggle/reset demo; Controls xyflow (di canvas) hanya zoom/fit/lock. | FR-012; konsisten pola controlled `tree-view`/`org-chart-studio` D8; ownership toolbar vs controls eksplisit (temuan #1/#6). |
| D4 | Custom node milik konsumen via `nodeTypes: Record<string, ComponentType>` dengan kontrak a11y wajib (forward ref, `role="button"`, `aria-selected`, `aria-label` "Node \<judul\>"); demo mendefinisikan 2 jenis (aksi + penunda) dari komponen DS (`card`, `badge`, `button`, `tooltip`). Satu ukuran deterministik `220×88` v1 (tanpa varian compact; judul 1 baris + deskripsi maks 2 baris + badge tanpa truncate ganda); handle `Handle` kiri-input / kanan-output dengan hit-area ≥ 44px (visual ≥ 12px + padding transparan). | FR-002; komposisi DS tanpa styling luar token; pelajaran 011 (temuan #2/#4/#5). |
| D5 | Edge xyflow `defaultEdgeOptions={{ type: 'default', animated: false }}` + label chip `badge`; garis 1.5px token `muted-foreground` (token existing terverifikasi; `border-strong` TIDAK dipakai karena tidak ada di `@ds/tokens`), terpilih `primary` 2px; validasi default tolak self-loop, duplikat pasangan handle, dan arah terbalik bila `targetHandle` penuh; invalid = edge bayangan `destructive` + pesan teks (bukan warna saja) + `role="alert"` sementara. `isValidConnection` konsumen boleh mengencangkan, tidak boleh melonggarkan aturan arah. | FR-003; visual invalid teruji (temuan #7). |
| D6 | Seleksi tunggal + multi (Shift-klik / rubber-band / `Ctrl+A`) milik xyflow dan diobservasi via `onSelectionChange` (temuan #1); jumlah diumumkan live region. Aksi hapus via `Delete`/`Backspace` + `context-menu` (node: rincian/duplikat/hapus; edge: edit label/hapus; canvas: tambah di sini/selaras tampilan/alih grid). Hapus node = hapus edge terkait atomik + toast "Dihapus — Urungkan" (tanpa dialog blokir agar loop cepat). | FR-005; standar React Flow + a11y setara keyboard. |
| D7 | Inspector `S-005.29.02` = pola komposisi `overlay/sheet` + `form/*` (bukan komponen baru): konsumen merender `<Sheet>` dari `onSelectionChange` hanya saat user memilih eksplisit (klik/Enter/rincian/menu); TAMBAH node tidak otomatis membuka sheet penuh (pelajaran 011, temuan #3) — node baru terseleksi + fokus + judul inline siap rename. Spec mengunci isi minimal (judul/deskripsi/status + meta id/posisi/koneksi + aksi duplikat/hapus) dan mode multi-seleksi (hitungan + hapus semua). Perubahan judul live ke canvas. | FR-006; reuse sheet/form; tanpa API visual baru. |
| D8 | Undo/redo internal bounded (default `historyLimit: 50`) mencakup tambah/hapus/geser node + tambah/hapus/label edge; toolbar + `Ctrl+Z`/`Ctrl+Shift+Z` + live region; toast "… — Urungkan" memanggil undo. Snapshot via klon struktural ringan (bukan `JSON.stringify` — temuan #9: hindari gagal pada data non-serialisable + biaya stringify). Redo-stack dibersihkan saat cabang baru. | FR-007; pola sama dengan studio D8. |
| D9 | Navigasi: pan (drag background/panah/klik-minimap) + zoom (controls/`Ctrl+scroll`/pinch/`+-`) + `fitView` (ikon bingkai, label "Selaras tampilan") + reset 100% (ikon "1:1", label "Atur 100%" — BERBEDA dari fit; temuan #6) + batas `minZoom/maxZoom` (default `0.25–2`); scroll halaman tidak dicuri (hanya `Ctrl+scroll` zoom di dalam canvas). | FR-001; interaksi tidak mengganggu scroll halaman. |
| D10 | Minimap (FR-008 should) `minimap: boolean` default true (sembunyi <md + toggle); klik/drag pindah viewport; token-mapped. Grid halus + `snapToGrid`/`gridSize` (default 16) milik konsumen via props (FR-009 should). | FR-008, FR-009; masuk v1, boleh dipotong terakhir bila scope meledak (OQ#2). |
| D11 | A11y dua lapis: (a) canvas `role="application"` + node/handle/edge fokusable (handle hit-area ≥ 44px, model keyboard: fokus handle sumber → `Enter` mulai → `Tab` ke handle target → `Enter` selesaikan → `Esc` batal; temuan #5) + semua operasi via tombol/menu/keyboard, (b) daftar alternatif `ul` node+edge (visually-hidden + toggle terlihat) dengan tombol [Fokus]/[Hapus] per baris — dibaca SR penuh. Reduced-motion matikan animasi; touch semua operasi ada jalur tombol. | FR-011; catatan khusus canvas PRD constraints. |
| D12 | State matrix milik komponen via props `loading`/`error`/`onRetry` + empty derivasi (`nodes.length === 0`); skeleton canvas, empty + CTA, alert + retry (wireframe §3). Tanpa token baru; audit kontras light & dark via `pnpm test:tokens`. | FR-010, FR-013. |

## 2. API Publik (contract)

```ts
import type { ComponentType } from 'react';
import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';

export type FlowStatus = 'default' | 'running' | 'success' | 'warning' | 'error';

export interface FlowNodeData extends Record<string, unknown> {
  label: string;          // judul — wajib non-kosong
  description?: string;   // maks 2 baris di node
  kind?: string;          // nama jenis dari palette
  status?: FlowStatus;    // FR-016 could
  disabled?: boolean;     // FR-016 could
}

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge & { label?: string };

export interface FlowSelection {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowPaletteItem {
  type: string;           // kunci nodeTypes
  title: string;          // mis. 'Kirim email'
  description?: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface FlowEditorProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange?: OnNodesChange<FlowNode>;
  onEdgesChange?: OnEdgesChange<FlowEdge>;
  onConnect?: OnConnect;
  onSelectionChange?: (selection: FlowSelection) => void;  // wajib untuk inspector (temuan #1)
  defaultNodes?: FlowNode[];    // uncontrolled demo
  defaultEdges?: FlowEdge[];    // uncontrolled demo
  nodeTypes?: Record<string, ComponentType<{ data: FlowNodeData; selected?: boolean }>>; // kontrak a11y D4 wajib
  paletteItems?: FlowPaletteItem[];   // bila diisi, FlowPalette dirender di S-005.29.01
  onAddFromPalette?: (item: FlowPaletteItem, position: { x: number; y: number }) => void;
  isValidConnection?: (connection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }) => boolean;
  minimap?: boolean;                  // default true (FR-008)
  snapToGrid?: boolean;               // default false (FR-009)
  gridSize?: number;                  // default 16
  loading?: boolean;                  // FR-013
  error?: string | null;              // FR-013 eksternal
  onRetry?: () => void;               // FR-013
  emptyActionLabel?: string;          // default 'Tambah node pertama'
  onEmptyAction?: () => void;
  historyLimit?: number;              // default 50 (FR-007)
  ariaLabel?: string;                 // default 'Editor alur'
  className?: string;
}
```

Aturan contract:

- Murni presentasi + komposisi; fetch, validasi bisnis, dan form milik konsumen/showcase. `loading`/`error`/`onRetry` hanya visual.
- Controlled penuh: bila `nodes`/`edges` diberikan wajib disertai handler; demo uncontrolled memakai `defaultNodes`/`defaultEdges` (pola `tree-view`). `onSelectionChange` sumber tunggal inspector (temuan #1).
- Setiap mutasi struktural = satu pasang callback + satu push undo; undo/redo sendiri memanggil `onNodesChange`/`onEdgesChange`/`onConnect`-equivalent sehingga state konsumen tetap single source (FR-007, FR-012).
- Snapshot undo = klon struktural ringan (spread per node/edge, bukan `JSON.stringify`); judul node kosong ditolak inline (`aria-invalid`); koneksi invalid ditolak + pesan + `role="alert"` sementara; tidak ada throw.
- Tidak ada warna literal; `status` hanya token semantik; default CSS xyflow tidak diimpor.
- Inspector bukan bagian `FlowEditor`: konsumen mengontrol `<Sheet>` dari `onSelectionChange` HANYA saat seleksi eksplisit (klik/`Enter`/tombol rincian/menu). Tambah node tidak membuka sheet (temuan #3). Spec §4 wireframe mengunci isi minimal agar konsisten.

## 3. Algoritma Koneksi & Layout

1. Palette drop: `onDragEnd(active, over)` → bila `over.id === 'canvas'` ambil `clientX/Y` → `screenToFlowPosition({x, y})` → snap (`round(pos/grid)*grid` bila aktif) → `onAddFromPalette(item, pos)` → konsumen menambah node terseleksi + fokus ke node baru; inspector TIDAK otomatis terbuka (on-demand, temuan #3). Jalur keyboard: tombol [+] per item → tambah di tengah viewport → fokus ke node baru.
2. Validasi koneksi default: tolak bila `source === target` (self-loop), pasangan `(source,sourceHandle,target,targetHandle)` sudah ada (duplikat), atau `targetHandle` sudah terisi dengan `maxConnections: 1` (handle penuh). `isValidConnection` konsumen hanya boleh menambah penolakan (AND), hasil akhir = default && custom. Pesan tolak menyebut alasan (arah/handle penuh/duplikat/self-loop) + `role="alert"`.
3. Edge label: `Edge.label` string; kosong = chip disembunyikan, garis tetap; edit via inspector input → `onEdgesChange` satu commit + undo.
4. Hapus atomik: hapus node terpilih → filter `edges` yang menyentuh id tersebut dalam commit yang sama; toast "Dihapus — Urungkan" mengembalikan keduanya (skenario PRD §3).
5. Undo model: stack snapshot `{nodes, edges}` ≤ `historyLimit` via klon struktural ringan (bukan `JSON.stringify`); push saat commit pengguna (bukan saat undo/redo); undo = pop → terapkan → dorong ke redo; cabang baru membersihkan redo. Deterministik untuk test interaksi.
6. Viewport: `minZoom 0.25 / maxZoom 2 / fitViewPadding 0.2`; reset 100% (`zoomTo(1)`, ikon "1:1") BERBEDA dari fit-view (ikon bingkai); minimap `pannable + zoomable`; grid `BackgroundVariant.Dots` token `border`.

## 4. Varian

Bukan `cva` baru yang besar; varian lewat props + `nodeTypes` (satu ukuran deterministik — tanpa varian compact v1):

| Varian | Nilai | Perilaku |
|---|---|---|
| `nodeTypes` per jenis | komponen konsumen (kontrak a11y D4) | demo 2 jenis: aksi + penunda (FR-002) |
| ukuran node | `220×88` tunggal | judul 1 baris + deskripsi maks 2 + badge (FR-002) |
| `status` per node | token semantik (could) | dot + badge teks (FR-016) |
| Kontrol state | `loading` / `error` / empty / data | matrix wireframe §3 (FR-013) |
| `minimap` / `snapToGrid` | boolean | §2 props + wireframe §2.5 (FR-008/009) |

## 5. A11y & Keyboard (ringkas)

Detail penuh wireframe §4. Inti: order toolbar → palette → canvas → node/handle → edge → controls → inspector → daftar SR; `Delete` hapus, `D` duplikat, `Ctrl+Z`/`Ctrl+Shift+Z` undo/redo, `Ctrl+A` pilih semua, panah pan, `+`/`-` zoom, `0` reset 100%, `F` selaras tampilan, `Enter` pilih/sambung (handle: `Enter` mulai → `Tab` ke target → `Enter` selesai, `Esc` batal), daftar `ul` node+edge semua operasi via tombol; live region jumlah + status + zoom; ring `primary` 2px; reduced-motion durasi 0 (FR-011).

## 6. Token & Tema

Permukaan `card`/`background`; garis halus/grid `border`; garis edge `muted-foreground` (ganti `border-strong` yang tidak ada di token — temuan #7); teks `foreground`/`muted-foreground`; aksi/selected/highlight/fokus `primary`; valid/invalid `success`/`destructive`; status could `warning`/`info`. Tanpa token baru. Default CSS xyflow dimatikan; kelas `.xyflow__*` di-map ke variable existing di `packages/ui/src/styles.css`. Audit kontras light & dark via `pnpm test:tokens` + tabel audit implementasi (FR-010); edge/handle/minimap/controls ≥ 3:1 grafis, teks ≥ 4.5:1.

## 7. FR Coverage

| FR | Cakupan di spec |
|---|---|
| FR-001 | D1 + D9 + §3 langkah 6; flow 5; wireframe §1–2.5 |
| FR-002 | D4 + §2 `nodeTypes`/`FlowNodeData`; flow 2; wireframe §2.1 |
| FR-003 | D5 + §3 langkah 2–3; flow 3; wireframe §2.2 |
| FR-004 | D2 + §3 langkah 1; flow 2; wireframe §2.3 (`screenToFlowPosition`) |
| FR-005 | D6; flow 4; wireframe §1 menu + §4 keyboard |
| FR-006 | D7; flow 4; wireframe §2.4 (S-005.29.02) |
| FR-007 | D8 + §3 langkah 5; flow 4; wireframe §1 toolbar |
| FR-008 | D10 `minimap`; flow 5; wireframe §2.5 |
| FR-009 | D10 `snapToGrid/gridSize`; flow 2 + 5; wireframe §2.5 |
| FR-010 | D1 + D12 + §6 token; wireframe §6 audit light/dark |
| FR-011 | D11 + §5; flow 2–4 jalur keyboard; wireframe §4 daftar alternatif |
| FR-012 | D3 + §2 aturan controlled; flow 4 undo memanggil callback |
| FR-013 | D12 + §2 `loading/error/onRetry`; flow 1; wireframe §3 matrix |
| FR-014 | §8 rencana scenario S-005.29 end-to-end + smoke build |
| FR-015 | §9 out — tidak dirancang; tanpa kontrol auto-layout di showcase |
| FR-016 | D4/D11 `status/disabled` could; wireframe §2.1 badge + teks |

## 8. Rencana Scenario Showcase (S-005.29)

- Halaman `/patterns/flow-editor`: dataset workflow 5 node (trigger → kirim email → tunggu 1 hari → cabang → selesai) + 4 edge berlabel; `ol` langkah 1–6 Bahasa Indonesia + tombol [Muat contoh] [Atur ulang demo]; palette S-005.29.01 + inspector S-005.29.02 + controls (`aria-label` Indonesia: "Perkecil", "Tingkat zoom", "Perbesar", "Selaras tampilan", "Kunci interaksi") + minimap token + menu konteks + toast "Dihapus — Urungkan" + tab daftar SR.
- Panel demo (di luar komponen): pemicu loading/empty/error + retry, toggle snap/grid/minimap, toggle light/dark, dataset valid/invalid-edge.
- State dikelola di page (controlled) sebagai resep konsumen + kotak resep 15 baris (`nodes/edges` → `onChange` → POST).
- Test hooks wajib (temuan #10): `data-testid` = `flow-canvas`, `flow-node-<id>`, `flow-handle-<id>-<source|target>`, `flow-edge-<id>`, `flow-palette-item-<type>`, `flow-inspector`, `flow-toolbar`, `flow-controls`, `flow-minimap`, `flow-empty`, `flow-toast-undo`. Rencana test: drop palette, sambung valid/invalid, hapus+undo, inspector on-demand, keyboard connect, a11y daftar SR.
- Smoke: `pnpm -C apps/showcase build`. Light & dark parity; handler demo mock (log/toast).

## 9. Out of Scope (sesuai PRD non-goals)

Execution engine/runner; kolaborasi realtime; auto-layout ELK/dagre (FR-015 could — CR dependency terpisah bila diambil); code generation; persistensi internal; mind map mode (jalur RM-07).

## 10. Open Questions (rekomendasi gate 2)

| # PRD | Rekomendasi design | Butuh |
|---|---|---|
| OQ#1–#4 | Sudah answered di gate 1 (13.0.2 MIT, minimap masuk v1, nonaktifkan CSS → token, kategori `canvas`); tidak ada OQ baru di gate 2 | none — kunci dan lanjut story 4–6 bagian (canvas+node, palette+dnd, edge, inspector, undo/redo, minimap+polish) |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-21 | Draft gate 2: D1–D12, contract, algoritma koneksi, wireframe, 5 flow, FR-001–FR-016 coverage, rencana S-005.29 |
| 2026-11-21 | Rerun pasca revisi PRD: onSelectionChange + defaultNodes/defaultEdges (temuan #1), kontrak a11y nodeTypes (#2), tambah tanpa auto-buka sheet (#3), ukuran tunggal 220×88 (#4), handle ≥44px + keyboard Enter-Tab-Enter (#5), toolbar vs controls + reset-vs-fit (#6), hapus border-strong (#7), microcopy ID (#8), larangan stringify (#9), data-testid + rencana test (#10) |
