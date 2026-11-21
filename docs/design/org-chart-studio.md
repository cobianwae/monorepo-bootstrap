# Spec Desain — Org Chart Studio (pengganti profesional 003 + 010)

Status: approved (gate 2)
PRD: `docs/prd/011-org-chart-studio.md` (approved, gate 1)
Layar: `S-005.34` Org Chart Studio (`/patterns/org-chart-studio`) + child `S-005.34.01` panel detail, modal `M-007` pindah, `M-008` hapus
Flow: `docs/design/flows/org-chart-studio.mmd` · Wireframe: `docs/design/wireframes/org-chart-studio.md`
Tanggal: 2026-11-21

> Catatan ID: PRD §Design Refs mengusulkan tentatif `S-011.01–.03`; `S-011` sudah dipakai CRM Leads.
> Final di fase design mengikuti konvensi sitemap: pola = `S-005.34` series, dialog = `M-007`/`M-008`.
> `S-005.28` + `S-005.33` ditandai `deprecated` (FR-015), dihapus saat 011 shipped.

## 1. Keputusan Desain

| # | Keputusan | Alasan |
|---|---|---|
| D1 | Satu komponen baru `OrgChartStudio` di `packages/ui/src/components/canvas/org-chart-studio.tsx` (kategori `canvas`), wrapper di atas `@xyflow/react` (sudah ada — bukan dependency baru). Menggantikan `OrgChart` + `OrgChartEditor`; tidak ada kode kanvas ganda. | FR-001 (satu layout, satu viewport); keluhan arsitektur ganda PRD §Problem; constraint "tanpa dependency baru tanpa approval". |
| D2 | Input reuse kontrak 003/010: flat `id`/`parentId` atau nested, tepat satu root; normalisasi + validasi terstruktur (duplikat / parent hilang / siklus / root-count) → error state (bukan throw). Konversi internal flat → xyflow `nodes`/`edges` (`smoothstep` 1px). | FR-001, FR-012; kompatibel data konsumen lama; error teruji. |
| D3 | Layout seimbang tulis-sendiri "balanced-tidy" (tanpa dependency baru): post-order lebar subtree proporsional, parent center di atas anak, gap adaptif agar tidak ada ruang kosong raksasa untuk 1–100 node; slot seragam `240×84`, gap `32`, level `64`. Orientasi v1 `top-down` saja (LR ditunda agar scope terkunci). OQ#1 (`d3-hierarchy`) diputuskan di gate 2: rekomendasi **tunda** — tambah hanya bila audit 100-node gagal; jalur migrasi didokumentasikan. | FR-003; constraint tanpa dep baru; screenshot 40-node seimbang + posisi deterministik. |
| D4 | Kartu lega `240×84` (naik dari `200×72` sesak): avatar 32 + nama tegas 1 baris + jabatan max 2 baris + badge rapi tidak truncate umum + strip aksen 3px + tooltip penuh. Konektor `smoothstep` 1px token `border` (bukan elbow kaku 2px). Hover/selected ring `primary` jelas. | FR-002; bukti "visual sampah… truncate" PRD; review visual gate 2. |
| D5 | Tambah 1-klik via gagang `+` bawah (bawahan) / samping (sejawat), muncul saat hover/fokus, hit-area ≥ 44px; node baru langsung inline-edit di kartu (`input`; Enter simpan, Esc batal, kosong ditolak). Tambah **tidak pernah** membuka panel. | FR-005 (≤ 3 klik tanpa form) + FR-006 + FR-016; menyelesaikan "Sheet 5 field untuk aksi 1 detik" + "tombol + 32px". |
| D6 | Panel detail S-005.34.01 on-demand (sheet kanan 320px; overlay di mobile): foto, badge, aksen, breadcrumb path, meta atasan/anak, form edit + tombol pindah/hapus. Dibuka via tombol detail `[≡]` / double-click / klik avatar — bukan tiap tambah; keyboard via `Tab` ke `[≡]` + `Enter` atau `Shift+Enter`. | FR-006; info penuh tanpa mengganggu alur cepat. |
| D7 | Pindah dua jalur setara: (a) drag antar kartu (ring `success`/`destructive` + teks + preview path; siklus/diri ditolak + snap-back), (b) dialog M-007 (select atasan + preview + validasi). Hapus via Delete/menu → M-008 (sebut N turunan; reparent-ke-kakek vs hapus-subtree; root diproteksi). | FR-007 + FR-008; tidak ada aksi pointer-only. |
| D8 | State deklaratif `data` + `onChange(next: flat)` sekali per commit (controlled penuh; uncontrolled internal untuk demo). Undo/redo internal stack ≤ 50 mencakup tambah/edit/hapus/pindah; toolbar + `Ctrl+Z/Y` + live region. Toast "… — Urungkan" (could) memanggil undo. | FR-009 + FR-013 + FR-019; kontrak sama dengan 010 D7. |
| D9 | Pencarian presentasional milik konsumen via `highlightedIds` + util `getAncestors` + auto-expand path; komponen mengumumkan jumlah via live region; sorot non-warna-saja (ring + badge "Cocok" + garis putus). | FR-010; komponen tidak memegang query. |
| D10 | A11y dua lapis: (a) kanvas `role="application"` + kartu fokusable + gagang keyboard, (b) pohon SR internal `role="tree"` (reuse pola 003, tab kedua/visually-hidden) dengan semua operasi via tombol. Reduced-motion: durasi 0 + pinch mati. Touch target aksi ≥ 44px. | FR-011 + FR-016; audit 0 blocker. |
| D11 | Default CSS xyflow dimatikan/dipetakan ke token (ikuti 010 D8): node/edge/controls/minimap hanya token semantik; light/dark parity; tanpa token baru. | FR-017 + non-goals "tanpa token baru". |
| D12 | Legacy paralel-deprecated: `S-005.28`/`S-005.33` + komponen lama tetap ada dengan banner deprecated + tautan migrasi; dihapus + BACKLOG diarsip saat 011 shipped; rekomendasi OQ#3 = paralel (bukan breaking langsung). | FR-015 + OQ#3. |

## 2. API Publik (contract)

```ts
export type OrgStudioAccent =
  | 'primary' | 'success' | 'warning' | 'info' | 'destructive';

export interface OrgStudioNodeFlat {
  id: string;
  parentId: string | null;      // null = root (tepat satu)
  title: string;                // nama — wajib non-kosong
  subtitle?: string;            // jabatan
  badge?: string;               // departemen
  avatarSrc?: string;
  accent?: OrgStudioAccent;
  disabled?: boolean;
}

export interface OrgStudioNodeNested extends Omit<OrgStudioNodeFlat, 'parentId'> {
  children?: OrgStudioNodeNested[];
}

export type OrgStudioInput = OrgStudioNodeFlat[] | OrgStudioNodeNested;

export interface OrgStudioNodeNormalized extends OrgStudioNodeFlat {
  depth: number;
  childIds: string[];
  hasChildren: boolean;
  descendantCount: number;      // untuk M-008 "N turunan"
}

export interface OrgChartStudioProps {
  data: OrgStudioInput;                       // satu root (FR-001)
  onChange?: (next: OrgStudioNodeFlat[]) => void; // sekali per commit (FR-013)
  defaultExpandedIds?: string[];              // uncontrolled awal
  expandedIds?: string[];                      // controlled penuh
  onExpandedChange?: (ids: string[]) => void;
  highlightedIds?: string[];                   // FR-010
  loading?: boolean;                           // FR-012
  error?: string | null;                       // FR-012 eksternal
  onSelect?: (node: OrgStudioNodeNormalized) => void;
  emptyActionLabel?: string;                   // default 'Buat root'
  onEmptyAction?: () => void;
  minimap?: boolean;                           // default true (≥md)
  ariaLabel?: string;                          // default 'Org chart studio'
  className?: string;
}

// Util reuse pola 003/010:
export function getAncestors(nodes: OrgStudioNodeFlat[], id: string): string[];
```

Aturan contract:

- `onChange` menerima flat list penuh (single source of truth); xyflow `nodes`/`edges` derivasi memoized — tidak ada state kanvas ganda (FR-001).
- Setiap mutasi (tambah/edit/hapus/pindah) = satu `onChange` + satu push undo; undo/redo sendiri memanggil `onChange` (FR-009, FR-013).
- `expandedIds` controlled wajib + `onExpandedChange`; collapse menyembunyikan subtree + edge; search auto-expand menggabungkan path via `onExpandedChange` (FR-010, FR-013).
- Validasi nama kosong ditolak inline (tetap edit, `aria-invalid`); siklus/diri/descendant ditolak + pesan + `role="alert"` (FR-005, FR-007).
- Tidak ada fetch/persistensi/search internal; pencarian, contoh 40 orang, dan resep integrasi milik showcase/konsumen (FR-014, non-goals HRIS).
- Tidak ada prop warna literal; `accent` hanya token semantik (FR-017).

## 3. Algoritma Layout & Edge

1. Normalisasi → flat + `byId` + `childIds` + `descendantCount`; urutan anak stabil (urutan masuk).
2. Validasi: duplikat → parent hilang → siklus (DFS dari root) → root ≠ 1; gagal → state error terstruktur (penyebab + id pertama + salin detail), bukan throw.
3. Balanced-tidy: post-order `width(sub) = max(1, Σ width(anak) + gap*(n-1)*k)` dalam slot; `x = offset + width/2`, `y = depth * (84 + 64)`; parent di-center di atas rentang anak; subtree kecil dipadatkan agar tidak ada kolom kosong raksasa. Deterministik untuk snapshot test.
4. Petakan ke xyflow: `node = { id, type: 'studioNode', position: {x, y}, data: {...flat, expanded, selected, highlighted} }`, `edge = { source: parent, target: child, type: 'smoothstep', strokeWidth: 1 }`.
5. Collapse: subtree tidak di-emit; layout dihitung ulang memoized terhadap `data + expanded`.
6. Reparent/inline-add/delete: mutasi flat → validasi → layout ulang → `onChange` + undo. Jalur migrasi `d3-hierarchy`: ganti langkah 3 dengan `d3.tree().nodeSize()` bila disetujui — interface langkah 4 tidak berubah.

## 4. Varian

Bukan `cva` baru besar; varian lewat props + token:

| Varian | Nilai | Perilaku |
|---|---|---|
| `accent` per node | token semantik | strip 3px + badge (FR-002; audit §7 wireframe) |
| Kontrol state | `loading` / `error` / empty / data | matrix 6 demo wireframe §4 (FR-012) |
| `minimap` | `true` (default ≥md) / `false` | sembunyi di <md + toggle (FR-004) |

## 5. A11y & Keyboard (ringkas)

Detail penuh wireframe §5. Inti: order toolbar → search → kanvas → kartu/gagang → controls → minimap(skip) → panel → pohon SR; `Enter` pilih, `F2`/`Ctrl+Enter` edit, `Space` expand, `Delete` hapus (M-008), `Ctrl+Z/Y` undo/redo; pohon SR `role="tree"` semua operasi via tombol; live region jumlah cari + status mutasi + level zoom; ring `primary` 2px; reduced-motion durasi 0 (FR-011, FR-016).

## 6. Token & Tema

Permukaan `card`/`background`; garis/edge `border` 1px; teks `foreground`/`muted-foreground`; aksi/selected/highlight/fokus `primary`; aksen `success/warning/info/destructive`; drag valid/invalid `success`/`destructive` + teks. Tanpa token baru. Audit kontras light & dark via `pnpm test:tokens` + tabel audit implementasi (FR-017); strip di atas `card` + badge + controls + minimap diverifikasi ≥3:1 grafis / ≥4.5:1 teks.

## 7. FR Coverage

| FR | Cakupan di spec |
|---|---|
| FR-001 | D1 + D2 + §2 contract + §3 langkah 4; flow 1 |
| FR-002 | D4 + wireframe §2 (kartu 240×84, badge, smoothstep 1px); review visual gate 2 |
| FR-003 | D3 + §3 balanced-tidy; flow 1; screenshot 40-node + test deterministik |
| FR-004 | D1 controls/minimap/fit-view + wireframe §1; flow 5 |
| FR-005 | D5 gagang + inline-edit; flow 2; wireframe §2 |
| FR-006 | D6 panel on-demand S-005.34.01; flow 2 (tidak auto-buka); wireframe §3 |
| FR-007 | D7 drag + M-007; flow 3; wireframe §2–§3 |
| FR-008 | D7 M-008 + proteksi root + hitungan; flow 3 |
| FR-009 | D8 undo ≤50 + toolbar/shortcut/live region; flow 3 |
| FR-010 | D9 search + auto-expand + live region; flow 4; wireframe §2 badge Cocok |
| FR-011 | D10 dua lapis + wireframe §5; audit 0 blocker |
| FR-012 | Wireframe §4 matrix 6 demo; flow 1; §2 loading/error |
| FR-013 | §2 `data/onChange/expandedIds` sekali-per-commit; flow 2–3 |
| FR-014 | §8 showcase `ol` + reset + resep 15 baris |
| FR-015 | D12 paralel-deprecated; sitemap `deprecated`; BACKLOG arsip saat ship |
| FR-016 | D5 hit-area 44px + D10 reduced-motion + wireframe §5–§6 |
| FR-017 | §6 token + `pnpm test:tokens` + tabel audit |
| FR-018 | §8 [Muat contoh] 1 klik (could) |
| FR-019 | D8 toast Urungkan ≤5 dtk (could); flow 2–3 |
| FR-020 | won't — §9, tidak dirancang |

## 8. Rencana Scenario Showcase (S-005.34)

- Halaman `/patterns/org-chart-studio`: data contoh 40 orang / 4 tingkat / 4 departemen (tombol [Muat contoh] 1 klik, FR-018); `ol` langkah bernomor 1–6 + tombol [Reset demo] (FR-014); toolbar + pencarian + live region + controls + minimap token + panel S-005.34.01 + M-007/M-008 + toast; tab kedua pohon SR; papan keyboard + catatan a11y; state dikelola di page (controlled) sebagai resep konsumen + kotak resep integrasi 15 baris (fetch → `data`, `onChange` → POST).
- Panel demo (di luar komponen): 6 pemicu state matrix §4 + dataset valid/invalid + toggle minimap + toggle light/dark.
- Smoke: `pnpm -C apps/showcase build`. Light & dark parity; handler demo mock (log/toast).

## 9. Out of Scope (sesuai PRD non-goals)

Sinkronisasi HRIS/fetch server (resep saja); multi-root/forest/matrix-report; kolaborasi realtime/komentar/approval; import/export CSV/PNG/PDF + print; field kustom di luar kontrak; token warna baru; orientasi left-right (ditunda v1 agar layout terkunci) — bila diminta jadi CR follow-up.

## 10. Open Questions (rekomendasi gate 2)

| # PRD | Rekomendasi design | Butuh |
|---|---|---|
| 1 `d3-hierarchy`? | Tunda; balanced-tidy tanpa dep baru sebagai default v1; tambah via CR hanya bila audit 100-node gagal | decided (CR-010 approved 2026-11-21) |
| 2 Drag vs dialog? | Keduanya; dialog M-007 setara keyboard wajib | decided (CR-010 approved 2026-11-21) |
| 3 Legacy paralel vs breaking? | Paralel deprecated → hapus saat ship (D12) | decided (CR-010 approved 2026-11-21) |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-21 | Draft gate 2: D1–D12, contract, balanced-tidy, wireframe, 5 flow, FR-001–FR-020 coverage, rencana S-005.34 |
| 2026-11-21 | **Approved (gate 2)** — user menyetujui via gate review; kunci S-005.34 series, gagang + inline-edit, balanced-tidy tanpa dep baru |
