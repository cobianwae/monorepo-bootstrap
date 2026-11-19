# Component Roadmap — Komponen Kompleks

Status: `draft` · Terakhir diperbarui: 2026-11-20
Sumber analisis: `docs/discussions/2026-11-20-component-landscape.md`

## Tujuan

Melengkapi design system dengan komponen kompleks/produktivitas yang sering dibutuhkan
aplikasi produk (file management, org chart, workflow editor, dan komponen berfrekuensi
tinggi lainnya). Eksekusi satu per satu, dimulai dari PRD (gate 1).

## Prinsip

- Compose dulu sebelum build baru — maksimalkan komponen existing (`tree-view`,
  `data-table`, `context-menu`, `breadcrumb`, `bulk-action-bar`, `chat`, `file-input`).
- Dependency hanya kalau mempermudah hidup, sering dipakai, dan performa OK
  (keputusan user, 2026-11-20).
- Satu item roadmap = satu PRD (atau spec singkat + story untuk komponen tanpa pattern baru).
- Setiap komponen wajib: token-first, a11y (WCAG AA), light/dark parity, state matrix
  lengkap (loading/empty/error), showcase scenario.

## Keputusan Dependency

| Dependency | Kebutuhan | Status |
|---|---|---|
| `@xyflow/react` | RM-09 flow editor canvas | **Disetujui user** (2026-11-20); formalisasi saat PRD RM-09 gate 1 |
| `@dnd-kit/*` | Sortable, kanban, tree-view, palet flow, urutan upload | ✅ Sudah ada |
| Radix primitives | Base interaksi | ✅ Sudah ada |
| `react-day-picker` (atau setara) | RM-08 calendar/scheduler | Perlu evaluasi + approval saat PRD RM-08 |
| TipTap (atau Plate) | RM-11 rich text editor | Perlu evaluasi + approval saat PRD RM-11 |

## Wave 1 — Quick Wins (frekuensi tinggi, tanpa dependency baru)

| ID | Item | Artefak gate | Catatan |
|---|---|---|---|
| RM-01 | Upload queue — upgrade `file-input`: progress/retry/cancel per file, preview thumbnail, error per file | Spec singkat + 1 story | Extend komponen existing, `@dnd-kit` tersedia untuk reorder |
| RM-02 | Transfer list (dual listbox) — assign role/anggota/permission | Spec singkat + 1 story | Standar Ant/MUI X; a11y listbox pattern |
| RM-03 | Cascader + tree select — alamat/kategori bertingkat | Spec singkat + 1–2 story | Cascader baru; tree select compose `tree-view` + `select` |

## Wave 2 — File Management Cluster (diminta user)

| ID | Item | Artefak gate | Catatan |
|---|---|---|---|
| RM-04 | File manager composed pattern — sidebar folder tree (`tree-view`), list/grid view (`data-table`), breadcrumb, multi-select, context menu actions, storage quota | **PRD penuh** (pattern baru) | Semua bahan inti sudah ada; fokus di komposisi + state matrix |
| RM-05 | File preview panel/modal — image/PDF/video/audio + metadata | Bagian PRD RM-04 atau spec singkat | Putuskan saat gate 2 RM-04 |

## Wave 3 — Hierarki & Alur (diminta user)

| ID | Item | Artefak gate | Catatan |
|---|---|---|---|
| RM-06 | Org chart — hierarki node (avatar, title, subtitle, badge), collapse/expand, konektor ortogonal, styling per unit | **PRD penuh** (pattern baru) | Standalone SVG/CSS tanpa dependency; data `id`/`parentId` |
| RM-07 | Mind map — turunan ringan canvas/connector org chart | Evaluate setelah RM-06/RM-09 | Bisa *could have* |
| RM-08 | Calendar/scheduler — bulan/minggu/hari, event, booking slot | **PRD penuh** | Evaluasi `react-day-picker`; posisi fleksibel antar wave |
| RM-09 | Flow editor / node canvas — pan/zoom, palette drag-and-drop (`@dnd-kit`), custom node komponen, edge + handle, minimap, controls, node inspector (`sheet`/`form`), undo/redo | **PRD penuh**; dependency `@xyflow/react` sudah disetujui | Item terbesar; pecah jadi 4–6 story; auto-layout & runner = *could have* |

## Wave 4 — Melengkapi Komponen Existing

| ID | Item | Artefak gate | Catatan |
|---|---|---|---|
| RM-10 | Mention input + emoji picker — compose `chat.tsx` | Spec singkat + 1 story | `chat.tsx` belum punya mention/emoji |
| RM-11 | Rich text editor — toolbar a11y, heading/list/link/image, markdown shortcut | **PRD penuh** (dependency TipTap) | Approval dependency saat gate 1 |

## Wave 5 — Tier 3 (prioritas saat dibutuhkan)

| ID | Item | Catatan |
|---|---|---|
| RM-12 | Diff viewer — code review, audit | Sedang |
| RM-13 | Import wizard CSV — column mapping + validasi multi-step | Sering di admin tool |
| RM-14 | Image cropper — avatar/cover flow | Sering |
| RM-15 | Lightbox/gallery — melengkapi preview | Sedang |
| RM-16 | Tour/coach marks — onboarding | Sedang |
| RM-17 | Permission/role matrix — grid role × resource | Sedang |
| RM-18 | Signature pad | Jarang-sedang |

## Non-Goals

- Gantt chart, map/location picker, QR scanner — berat / bergantung layanan eksternal.

## Urutan Eksekusi

1. Mulai dari **RM-01** (upload queue) — value cepat, extend existing, tanpa dependency baru.
2. Lanjut RM-02 → RM-03 (selesaikan Wave 1).
3. **RM-04** file manager (jawab kebutuhan user), lalu RM-06 org chart, lalu RM-09 flow editor.
4. RM-08, RM-10, RM-11 menyusul; Wave 5 diprioritaskan saat ada kebutuhan nyata.

Urutan ini usulan — bisa diubah saat sesi eksekusi dengan konfirmasi.

## Checklist Per Item (saat masuk eksekusi)

- [ ] PRD approved (gate 1) — masalah, FR-NNN testable, non-goals
- [ ] Design approved (gate 2) — object model + sitemap + state matrix + scenario ID
- [ ] Stories approved (gate 3) — vertical slice, AC Given/When/Then
- [ ] Implementasi per story — 1 story = 1 branch = 1 PR
- [ ] Showcase scenario — loading/empty/error, light/dark, a11y note
- [ ] Update BACKLOG.md + STATUS.md
