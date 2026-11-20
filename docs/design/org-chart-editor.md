# Spec Desain — Org Chart Editor (Composed Pattern)

Status: approved (gate 2)
PRD: `docs/prd/010-org-chart-editor.md` (approved, gate 1)
Layar: `S-005.33` Org Chart Editor (`/patterns/org-chart-editor`)
Flow: `docs/design/flows/org-chart-editor.mmd` · Wireframe: `docs/design/wireframes/org-chart-editor.md`
Tanggal: 2026-11-20

## 1. Keputusan Desain

| # | Keputusan | Alasan |
|---|---|---|
| D1 | Komponen baru `OrgChartEditor` di `packages/ui/src/components/canvas/org-chart-editor.tsx` (kategori baru `canvas`, mengikuti PRD 005 OQ#4); wrapper di atas `@xyflow/react` 13.0.2, bukan layout tulis-sendiri. | Satu stack canvas dengan flow editor; pan/zoom/minimap/controls/fit-view gratis; tanpa lib graph kedua. |
| D2 | Input reuse normalisasi PRD 003 (flat `id`/`parentId` atau nested, satu root, error terstruktur duplikat/missing-parent/cycle/root-count). Konversi internal flat → xyflow `nodes`/`edges` (edge = parent→child, `type: 'smoothstep'`). | Kompatibel v1; validasi konsisten; konsumen tidak migrasi data. |
| D3 | Layout hierarki reuse tidy-tree PRD 003 (slot `200×72`, gap `32`, level `56`) dihitung di luar xyflow lalu dipetakan ke `position: {x, y}`; tanpa `dagre` baru. Orientasi LR = swap sumbu. | Tanpa dependency tambahan (OQ#2); deterministik; konektor tetap rapi. |
| D4 | Interaksi edit = reparent langsung (bukan drag bebas): drag node menempel ke parent baru; drop valid → `onChange`; drop siklus/diri/descendant → ditolak + pesan + snap-back. Alternatif keyboard: dialog "Pindah ke" + tombol di inspector. | Hierarki selalu rapi tanpa tombol auto-layout (OQ#3); ada jalur non-mouse (FR-012). |
| D5 | CRUD via tiga jalur setara: (a) handle/tombol `+` di node (tambah child), (b) context-menu per node, (c) toolbar + inspector. Hapus parent → dialog pilih reparent anak ke grandparent atau hapus subtree; root proteksi hapus. | Discoverable + keyboard-first; tidak ada aksi pointer-only. |
| D6 | Inspector = `overlay/sheet.tsx` kanan: form title/subtitle/badge/avatarSrc/accent + meta parent/children + tombol Pindah/Hapus/Undo. Node panjang selalu terbaca penuh di sini + tooltip `title` di kanvas (FR-002). | Menyelesaikan truncation v1 tanpa mengubah ukuran node. |
| D7 | State deklaratif: `data` + `onChange(next: OrgChartInput)` (controlled penuh); uncontrolled internal untuk demo. Tanpa persistensi. Undo/redo internal stack ≤50 (tambah/hapus/pindah/edit), tombol toolbar + `Ctrl+Z/Y`. | Kontrak sama dengan PRD 005 FR-012; undo batas jelas. |
| D8 | Default CSS xyflow dimatikan/di-map ke token (mengikuti PRD 005 OQ#3): node custom `OrgNode` (avatar/badge/strip aksen), edge stroke `border`, minimap + controls pakai `button`/`card` DS. | Token-first OKLCH; light/dark parity; tanpa hex literal. |
| D9 | A11y dua lapis: (a) kanvas xyflow (`role="application"` + controls keyboard) + (b) daftar pohon alternatif `role="tree"` (reuse pola 003, visually-hidden atau tab "Daftar") untuk SR + operasi penuh via keyboard/inspector. | Canvas pointer-only tidak boleh jadi satu-satunya jalur (FR-012). |

## 2. API Publik (contract)

```ts
export type OrgChartEditorAccent = 'primary' | 'success' | 'warning' | 'info' | 'destructive';

export interface OrgChartEditorNode extends OrgNodeFlat {} // reuse tipe 003

export interface OrgChartEditorProps {
  data: OrgChartInput;                       // flat atau nested, satu root (FR-001)
  onChange?: (next: OrgNodeFlat[]) => void;  // controlled (FR-007)
  defaultExpandedIds?: string[];             // reuse 003
  expandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  orientation?: 'top-down' | 'left-right';   // default 'top-down'
  highlightedIds?: string[];                 // FR-010
  loading?: boolean;
  error?: string | null;
  onSelect?: (node: OrgNodeNormalized) => void;
  renderNodeExtra?: (node: OrgNodeNormalized) => React.ReactNode;
  ariaLabel?: string;                        // default 'Org chart editor'
  className?: string;
}

// Util reuse dari 003:
export function getAncestors(nodes: OrgNodeFlat[], id: string): string[];
```

Aturan contract:

- `onChange` menerima flat list penuh (single source of truth); xyflow `nodes/edges` adalah derivasi, bukan state primer.
- Undo/redo internal tidak menelan `onChange` — setiap commit (tambah/hapus/pindah/edit) memanggil `onChange` sekali.
- `expandedIds` controlled mengikuti pola `tree-view`/003; collapse menyembunyikan subtree + edge.
- Tidak ada fetch/persistensi/search internal; pencarian milik konsumen via `highlightedIds` + `getAncestors`.

## 3. Algoritma Layout & Edge (detail OQ#2)

1. Normalisasi reuse 003 → flat + `byId` + `childIds` + validasi (error → state matrix, bukan throw).
2. Tidy-tree reuse 003: post-order lebar subtree (slot), `x = offset + slot/2`, `y = depth`; LR swap sumbu.
3. Petakan ke xyflow: `node = { id, type: 'orgNode', position: {x, y}, data: {...flat, expanded, selected, highlighted} }`, `edge = { id: parent>child, source: parent, target: child, type: 'smoothstep' }`.
4. Collapse: node tidak expanded → subtree tidak di-emit sebagai xyflow nodes/edges; layout dihitung ulang memoized terhadap `data + expanded + orientation`.
5. Reparent: `parentId` baru → validasi (bukan diri/descendant, parent ada) → hitung ulang layout → `onChange` + push undo.

## 4. Varian

| Varian | Nilai | Perilaku |
|---|---|---|
| `orientation` | `top-down` / `left-right` | swap sumbu + edge arah mirror |
| `accent` per node | token semantik | strip 3px + badge (reuse audit 003) |
| Kontrol state | `loading` / `error` / data | matrix wireframe §4 |

Bukan `cva` baru; varian lewat props + token.

## 5. A11y & Keyboard (ringkas)

Detail penuh di wireframe §5. Inti:

- Kanvas: `role="application"`, Tab masuk controls → kanvas → inspector; panah = pan (saat kanvas fokus), `+`/`-`/`0` zoom/reset, `Delete` hapus seleksi (dengan konfirmasi), `Ctrl+Z/Y` undo/redo.
- Node: fokus via Tab; `Enter` buka inspector; tombol `+` di node = tambah child (fokus ke inspector form); context-menu keyboard (`Shift+F10`) setara drag.
- Pohon alternatif `role="tree"`/`treeitem` (reuse 003: roving tabindex, `↑↓→←`, `Home/End`) — semua operasi edit tersedia dari sini via tombol.
- Live region: jumlah hasil pencarian + status undo ("Node dipindah ke X") + error validasi; `role="alert"` untuk siklus ditolak.
- Focus ring `primary` offset 2px; `prefers-reduced-motion` mematikan animasi xyflow.

## 6. Token & Tema

- Permukaan: `card`/`background`; garis/edge: `border`; teks: `foreground`/`muted-foreground`; aksi/selected/highlight/focus: `primary`; aksen: `success/warning/info/destructive`.
- Minimap + controls dirender ulang dengan token (tanpa default CSS xyflow); pasangan kontras reuse audit `packages/tokens` + verifikasi strip aksen di atas `card` light & dark.
- Tanpa token baru di v1 editor.

## 7. FR Coverage

| FR | Cakupan di spec |
|---|---|
| FR-001 | D2 + §3 langkah 1; flow 1 |
| FR-002 | D6, wireframe §2–§3 (tooltip + inspector penuh) |
| FR-003 | D5 jalur (a/b/c); flow 2 |
| FR-004 | D4 reparent + validasi; flow 2 error path |
| FR-005 | D5 dialog hapus; flow 2 |
| FR-006 | D6 inspector form + validasi; flow 2 |
| FR-007 | D7 contract `data/onChange`; §2 aturan |
| FR-008 | D1+D3 + §3; flow 3 (minimap/fit/orientasi) |
| FR-009 | §2 `expandedIds`; reuse 003 |
| FR-010 | §2 `highlightedIds` + `getAncestors`; flow pencarian |
| FR-011 | D1 controls + wireframe §5 keyboard kanvas; flow 3 |
| FR-012 | D9 dua lapis + wireframe §5; semua aksi ada jalur keyboard |
| FR-013 | Wireframe §4 matrix |
| FR-014 | §6 token; audit light/dark |
| FR-015 | D7 undo stack; flow 2 |
| FR-016 | §8 scenario; smoke build |
| FR-017 | won't v1 — tidak ada kontrol auto-layout (reparent selalu rapi) |
| FR-018 | won't — tidak ada import massal |

## 8. Rencana Scenario Showcase (S-005.33)

- Halaman `/patterns/org-chart-editor`: data contoh ±40 orang (reuse generator 003), toolbar (tambah root/child, undo/redo, orientasi, fit-view), context-menu per node, inspector sheet, pencarian + live region, minimap + controls token, papan keyboard.
- Semua state matrix §4 teramati; light & dark; handler demo mock (log/toast); state dikelola di page (controlled) sebagai resep konsumen.
- Smoke: `pnpm -C apps/showcase build`.

## 9. Out of Scope (sesuai PRD non-goals)

- Execution engine, kolaborasi realtime, multi-root, export PNG/PDF, persistensi, mind map, import massal, menggantikan `tree-view`/003.

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-20 | Draft gate 2: D1–D9, contract, layout reuse tidy-tree, FR coverage, rencana S-005.33 |
| 2026-11-20 | **Approved (gate 2)** — D1–D9 dikunci (xyflow 13.0.2 + tidy-tree reuse + reparent langsung + kategori `canvas/`); OQ#1 PRD disetujui (formal install) |
