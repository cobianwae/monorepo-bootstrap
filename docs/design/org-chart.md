# Spec Desain — Org Chart (Composed Pattern)

Status: approved (gate 2)
PRD: `docs/prd/003-org-chart.md` (approved, gate 1)
Layar: `S-005.28` Org Chart (`/patterns/org-chart`)
Flow: `docs/design/flows/org-chart.mmd` · Wireframe: `docs/design/wireframes/org-chart.md`
Tanggal: 2026-11-20

## 1. Keputusan Desain

| # | Keputusan | Alasan |
|---|---|---|
| D1 | Komponen `OrgChart` baru di `packages/ui/src/components/data-display/org-chart.tsx`, pattern composed kategori `data-display` (mengikuti presedent file-manager); implementasi SVG/CSS standalone **tanpa dependency baru**. | Constraints PRD + OQ#3 (standalone); chart library umum ditolak di problem statement. |
| D2 | Input data menerima flat list `id`/`parentId` **atau** nested tree; komponen menormalisasi dan memvalidasi. Data invalid (id duplikat, parent tidak ditemukan, siklus, multi-root) dirender sebagai error state dengan pesan spesifik + id pelanggaran pertama — tidak throw. | FR-001 (tanpa preprocessing oleh konsumen), OQ#4 (v1 satu root), FR-011. |
| D3 | Layout tidy-tree sederhana tulis sendiri (OQ#3, answered): ukuran node seragam `200×72`, gap `32`, jarak tingkat `56`; posisi deterministik dari lebar subtree. Konektor ortogonal (elbow) satu layer SVG di bawah node, stroke token `border`, dirender ulang dari hasil layout. | FR-004 (konektor rapi saat toggle & viewport kecil); constraint "ukuran node seragam agar layout deterministik". |
| D4 | Expand/collapse: uncontrolled via `defaultCollapsedIds` (OQ#2: default semua terbuka, tanpa auto-collapse); controlled via `expandedIds` + `onExpandedChange` (naming mengikuti `dnd/tree-view`). Collapse menyembunyikan subtree **beserta konektor anaknya**. | FR-003 (kontrolled & tak terkontrol sama bekerja), OQ#2. |
| D5 | Pan/zoom: kanvas wrapper `overflow-hidden` + `transform: translate() scale()`; kontrol `[−][%][+][reset]` mengambang; zoom via tombol, Ctrl/Cmd+wheel (wheel polos tidak dicegat), dan keyboard saat kanvas fokus; batas default `0.5–2`, step `0.25`; drag pan + pan keyboard. | FR-006 (kontrol terjangkau keyboard, scroll halaman aman, batas wajar). |
| D6 | Node kaya: avatar, title, subtitle, badge opsional + strip aksen; konten custom via `renderNode` tanpa keluar dari token. Aksen unit: prop `accent` bertipe token semantik (`primary/success/warning/info/destructive`). | FR-002, FR-007; audit kontras light & dark tercakup pasangan token. |
| D7 | `onSelect(node)` dipanggil dari klik dan Enter; aksi sekunder (menu/inline) diserahkan konsumen lewat slot `renderNode`/node actions — tanpa mode edit (v1 read-only). | FR-005, OQ#1 (answered: read-only). |
| D8 | Pencarian (could) tetap presentasional: komponen menyediakan prop `highlightedIds` (ring, bukan hanya warna) + util export `getAncestors(flatNodes, id)`; logika match & buka path milik konsumen (resep didokumentasikan di scenario). | FR-009; komponen tidak memegang state pencarian sendiri. |
| D9 | A11y: kanvas `role="tree"` dengan node `role="treeitem"` + `aria-level`/`aria-expanded`/`aria-selected` (single source of truth — tanpa duplikat pohon tersembunyi); navigasi node mengikuti pola `dnd/tree-view` (roving tabindex, panah, Enter); dua mode fokus terpisah (kanvas = pan/zoom, node = navigasi). | FR-010; konsisten dengan komponen pohon existing. |

## 2. API Publik (contract)

```ts
export type OrgChartAccent =
  | 'primary' | 'success' | 'warning' | 'info' | 'destructive';

export interface OrgNodeFlat {
  id: string;
  parentId: string | null;     // null = root (tepat satu)
  title: string;               // nama / nama unit
  subtitle?: string;           // jabatan
  badge?: string;              // departemen
  avatarSrc?: string;
  accent?: OrgChartAccent;     // strip + badge aksen (FR-007)
  disabled?: boolean;
}

export interface OrgNodeNested extends Omit<OrgNodeFlat, 'parentId'> {
  children?: OrgNodeNested[];
}

export type OrgChartInput = OrgNodeFlat[] | OrgNodeNested;

export interface OrgNodeNormalized extends OrgNodeFlat {
  depth: number;
  childIds: string[];
  hasChildren: boolean;
}

export type OrgChartOrientation = 'top-down' | 'left-right';

export interface OrgChartProps {
  data: OrgChartInput;
  orientation?: OrgChartOrientation;                  // default 'top-down' (OQ#2)
  defaultCollapsedIds?: string[];                     // uncontrolled (OQ#2)
  expandedIds?: string[];                             // controlled (penuh, pola tree-view)
  onExpandedChange?: (ids: string[]) => void;
  selectedId?: string | null;
  highlightedIds?: string[];                          // FR-009 (visual)
  loading?: boolean;
  error?: string | null;                              // error eksternal (mis. gagal fetch)
  zoomRange?: { min?: number; max?: number; step?: number }; // default 0.5–2, step 0.25
  renderNode?: (node: OrgNodeNormalized) => React.ReactNode;   // FR-002
  onSelect?: (node: OrgNodeNormalized) => void;                 // FR-005
  ariaLabel?: string;                                 // default 'Org chart'
  className?: string;
}

// Util pendukung pencarian (FR-009)
export function getAncestors(nodes: OrgNodeFlat[], id: string): string[];
```

Aturan contract:

- Pattern murni presentasi; sumber data, fetch, dan pencarian milik konsumen.
  Demo scenario memakai data tiruan tanpa mengubah kode pattern.
- Normalisasi + validasi berjalan memoized; hasil invalid menghasilkan
  deskripsi error terstruktur (penyebab + id pertama) yang dirender §4 state
  matrix wireframe — bukan exception.
- State zoom/pan internal (uncontrolled) di v1; reset mengembalikan 100% +
  posisi awal. Tidak ada prop zoom terkontrol (ditunda; belum diminta PRD).
- `expandedIds` controlled wajib disertai `onExpandedChange`; bila absen,
  komponen memakai state internal dari `defaultCollapsedIds` (FR-003).

## 3. Algoritma Layout & Konektor (detail OQ#3)

1. Normalisasi input → flat list + peta `parentId`; urutkan anak stabil
   (urutan masuk data).
2. Validasi: `id` duplikat → error; `parentId` tidak ditemukan → error; siklus
   (DFS dari root) → error; root ≠ 1 → error (multi-root ditunda, OQ#4).
3. Tidy layout: post-order hitung `width(subtree)` dalam slot; `x = offset
   subtree + slot/2`, `y = depth`; node slot tetap `200×72`, gap `32`,
   jarak tingkat `56`. Orientasi LR menukar sumbu.
4. Konektor: satu layer SVG `absolute inset-0` di bawah node; per parent satu
   path elbow (turun `gap/2` → bus horizontal → turun ke tiap anak); stroke
   `var(--border)` `2px`; LR mirror arahnya.
5. Render hanya node expanded — pohon 100+ node tetap ringan; layout
   di-memo terhadap `data + expanded + orientation` (goal metrik interaksi
   < 100 ms tanpa virtualisasi).

## 4. Varian (`cva`)

Komponen inti bukan `cva` baru; varian lewat props:

| Varian | Nilai | Perilaku |
|---|---|---|
| `orientation` | `top-down` (default) / `left-right` | FR-008; konektor mirror, layout swap sumbu |
| `accent` per node | token semantik | strip + badge aksen (FR-007) |
| Kontrol state | `loading` / `error` / data | matrix di wireframe §4 (FR-011) |

## 5. A11y & Keyboard (ringkas)

Detail penuh (dua mode fokus, peta tombol, live region, reduced motion) ada di
`docs/design/wireframes/org-chart.md` §5. Inti:

- Kanvas `role="tree"` + `treeitem`/`group`/`aria-expanded`/`aria-level`
  (FR-010); expander icon-button ≥ 32×32 dengan `aria-label` berubah
  ("Perluas <nama>" / "Collapse <nama>").
- Node: roving tabindex, `↑↓` antar node visible, `→` expand, `←` collapse/ke
  parent, `Enter` select (FR-005, FR-010).
- Kanvas background: `role="region"`, panah pan, `+`/`-`/`0` zoom (FR-006).
- Hasil pencarian diumumkan konsumen via live region di luar komponen
  (pola direkomendasikan di scenario).
- Fokus ring kontras di light & dark; `prefers-reduced-motion` dihormati.

## 6. Token & Tema

- Hanya token semantik: `card`/`background` (permukaan), `border` (konektor +
  garis node), `foreground`/`muted-foreground` (teks), `primary`
  (selected/highlight/focus), aksen departemen `success/warning/info/destructive`
  (FR-007).
- Tanpa token baru di v1 — pasangan kontras existing tercakup audit
  `packages/tokens`; strip aksen di atas permukaan `card` diverifikasi ulang
  light & dark saat implementasi.

## 7. FR Coverage

| FR | Cakupan di spec |
|---|---|
| FR-001 | D2 (input flat/nested + validasi + pesan), §3 langkah 2; flow 1 |
| FR-002 | D6, §2 `renderNode` + anatomy node (wireframe §2); audit kontras |
| FR-003 | D4, §2 `defaultCollapsedIds`/`expandedIds`; wireframe §2 state collapsed |
| FR-004 | D3 + §3 (elbow, token `border`, render ulang); wireframe §3 |
| FR-005 | D7, §2 `onSelect`; keyboard Enter (wireframe §5) |
| FR-006 | D5, §2 `zoomRange`; wireframe §5 mode kanvas; flow 3 |
| FR-007 | D6, §6 aksen token + audit; wireframe §7 |
| FR-008 | §4 varian `orientation`; scenario toggle; flow 3 (konektor tetap) |
| FR-009 | D8, §2 `highlightedIds` + `getAncestors`; flow 2; scenario pencarian |
| FR-010 | D9 + §5; wireframe §5–7 (role tree, keyboard, fokus ring) |
| FR-011 | Wireframe §4 state matrix (loading/empty/error/success) |
| FR-012 | §8 rencana scenario; smoke build `pnpm -C apps/showcase build` |

## 8. Rencana Scenario Showcase (S-005.28)

- Halaman `/patterns/org-chart` dengan data contoh realistis: ±40 orang,
  kedalaman 4 tingkat, 4 departemen beda aksen (FR-012, FR-007).
- Kontrol demo (di panel demo, di luar komponen): pemicu loading/empty/error
  (termasuk data invalid: siklus & parent hilang), toggle orientasi,
  `defaultCollapsedIds` cabang engineering, input pencarian (search-input) →
  `highlightedIds` + path `getAncestors`, dan papan zoom/pan keyboard.
- Semua state matrix wireframe §4 teramati; light & dark; catatan a11y di
  halaman; handler demo mock (log/toast) tanpa mengubah kode pattern.
- Smoke: `pnpm -C apps/showcase build`.

## 9. Out of Scope (sesuai PRD non-goals)

- Editing struktur via canvas (drag add/reorder) — v1 read-only.
- Mind map / konektor bebas (jalur RM-07).
- Auto-layout non-hierarki & multi-root campuran; multi-root ditunda (OQ#4).
- Export gambar/PDF.
- Menggantikan `tree-view` — keduanya hidup berdampingan (list vs diagram).
- Virtualisasi & zoom terkontrol — dievaluasi bila metrik interaksi melewati
  target; bukan bagian v1.

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-20 | Draft gate 2: keputusan D1–D9, contract, layout tidy-tree, wireframe, flow, FR coverage |
