# Component Roadmap — Komponen Kompleks

Status: `approved` · Terakhir diperbarui: 2026-11-20
Sumber analisis: `docs/discussions/2026-11-20-component-landscape.md`
Penanda PRD: 001 (RM-01, `approved`), 002 (RM-04+RM-05, `approved`), 003 (RM-06, `approved`), 004 (RM-08, `approved`), 005 (RM-09, `approved`), 006 (RM-11, `approved`); spec ringkas RM-02/03/10 (`approved`, story 007-01, 008-01/008-02, 009-01)

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
| `@xyflow/react` 13.0.2 | RM-09 flow editor canvas | **Disetujui user** (2026-11-20); diformalisasi di PRD 005 gate 1 |
| `@dnd-kit/*` | Sortable, kanban, tree-view, palet flow, urutan upload | ✅ Sudah ada |
| Radix primitives | Base interaksi | ✅ Sudah ada |
| `react-day-picker` v10 | RM-08 calendar/scheduler | ✅ Sudah ada di `packages/ui` (via `form/date-picker.tsx`); scheduler dibangun di atasnya tanpa dependency baru |
| TipTap v3.30.1 | RM-11 rich text editor | ✅ Sudah ada di `apps/showcase` (S-005.22); keputusan = promosi ke `packages/ui` |

## Wave 1 — Quick Wins (frekuensi tinggi, tanpa dependency baru)

| ID | Item | Artefak gate | Catatan |
|---|---|---|---|
| RM-01 | Upload queue — komponen baru `FileUpload` compose `file-input`: progress/retry/cancel per file, preview thumbnail, error per file | PRD penuh (001, `approved`) + 2 story `done` | Komponen baru, bukan extend; `@dnd-kit` tersedia untuk reorder |
| RM-02 | Transfer list (dual listbox) — assign role/anggota/permission | Spec singkat (`approved`) + story 007-01 | Standar Ant/MUI X; a11y listbox pattern; screen S-005.30 |
| RM-03 | Cascader + tree select — alamat/kategori bertingkat | Spec singkat (`approved`) + story 008-01/008-02 | Cascader baru; tree select compose `tree-view` + `select`; screen S-005.31 |

## Wave 2 — File Management Cluster (diminta user)

| ID | Item | Artefak gate | Catatan |
|---|---|---|---|
| RM-04 | File manager composed pattern — sidebar folder tree (`tree-view`), list/grid view (`data-table`), breadcrumb, multi-select, context menu actions, storage quota | **PRD penuh** 002 (`approved`, pattern baru) | Semua bahan inti sudah ada; fokus di komposisi + state matrix; screen S-005.27 |
| RM-05 | File preview panel/modal — image/PDF/video/audio + metadata | **Dilebur ke PRD 002** (keputusan user 2026-11-20) | — |

## Wave 3 — Hierarki & Alur (diminta user)

| ID | Item | Artefak gate | Catatan |
|---|---|---|---|
| RM-06 | Org chart — hierarki node (avatar, title, subtitle, badge), collapse/expand, konektor ortogonal, styling per unit | **PRD penuh** 003 (`approved`, pattern baru) | Standalone SVG/CSS tanpa dependency; data `id`/`parentId`; screen S-005.28 |
| RM-07 | Mind map — turunan ringan canvas/connector org chart | Evaluate setelah RM-06/RM-09 | Bisa *could have* |
| RM-08 | Calendar/scheduler — bulan/minggu/hari, event, booking slot | **PRD penuh** 004 (`approved`) | Di atas `react-day-picker` v10 existing; posisi setelah RM-09 |
| RM-09 | Flow editor / node canvas — pan/zoom, palette drag-and-drop (`@dnd-kit`), custom node komponen, edge + handle, minimap, controls, node inspector (`sheet`/`form`), undo/redo | **PRD penuh** 005 (`approved`); dependency `@xyflow/react` 13.0.2 disetujui | Item terbesar; pecah jadi 4–6 story; auto-layout & runner = *could have*; screen S-005.29 |

## Wave 4 — Melengkapi Komponen Existing

| ID | Item | Artefak gate | Catatan |
|---|---|---|---|
| RM-10 | Mention input + emoji picker — compose `chat.tsx` | Spec singkat (`approved`) + story 009-01 | `ChatComposer` polos belum punya mention/emoji; screen S-005.32 |
| RM-11 | Rich text editor — toolbar a11y, heading/list/link/image, markdown shortcut | **PRD penuh** 006 (`approved`; TipTap v3.30.1) | Markdown jadi FR-015 `should`; upgrade S-005.22 |

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

- [ ] PRD approved (gate 1) — masalah, FR-NNN testable, non-goals. Untuk lightweight track: spec singkat `approved` (pengganti PRD, tetap wajib Screen ID + FR-NNN + OQ terjawab)
- [ ] Design approved (gate 2) — object model + sitemap + state matrix + scenario ID
- [ ] Stories approved (gate 3) — vertical slice, AC Given/When/Then
- [ ] Implementasi per story — 1 story = 1 branch = 1 PR
- [ ] Showcase scenario — loading/empty/error, light/dark, a11y note
- [ ] Update BACKLOG.md + STATUS.md
