# Diskusi: Component Landscape — Komponen Kompleks yang Sering Digunakan

Tanggal: 2026-11-20 · Status: `draft` (tahap diskusi, belum PRD)
Rencana eksekusi: lihat `docs/discussions/component-roadmap.md`

## Masalah

Design system sudah punya 110+ komponen di 9 kategori (base, form, data-display, feedback, navigation, overlay, layout, marketing, dnd). Namun kategori **komponen kompleks/produktivitas** yang sering dibutuhkan aplikasi produk nyata belum tercakup: file management, org chart, workflow editor, rich text, dsb. Diskusi ini memetakan gap dan prioritas.

## Temuan Riset

Riset mengacu pada praktik design system besar (Ant Design, MUI X, Carbon, Fluent, Mantine, Chakra, ekosistem shadcn, xyflow/React Flow, AG Charts):

### 1. File Management (yang diminta user)

- **Dropzone** — sudah ada dasarnya di `form/file-input.tsx` (drag & drop, maxFiles, maxSize). Gap: tidak ada upload queue (progress per file, retry, cancel), preview thumbnail, error per file.
- **File manager/explorer** — pola umum: sidebar folder tree, list & grid view, breadcrumb, multi-select, context menu, preview panel, storage quota. Riset: SVAR File Manager, Carbon file uploader, reui/shadcnblocks file upload.
- **File preview** — modal/panel preview image/PDF/video/audio dengan metadata.
- **Composable**: bahan inti sudah ada (`tree-view`, `data-table`, `context-menu`, `breadcrumb`, `bulk-action-bar`, `dialog`) → file manager cocok jadi *composed pattern*, bukan monolith.

### 2. Org Chart (yang diminta user)

- Hierarki node dengan avatar, title, subtitle, badge department; collapse/expand; konektor ortogonal; penataan otomatis.
- Riset: AG Charts organization series (idKey/parentIdKey, expander, item styler per department).
- Opsi implementasi: standalone (SVG/CSS connectors, tanpa dependency) vs dibangun di atas flow canvas.

### 3. Node/Workflow Editor (yang diminta user)

- Pola standar (xyflow/React Flow): canvas pan/zoom, drag node dari palette, custom node sebagai komponen, edge dengan handle, selection, minimap, controls, node inspector (panel property), auto-layout (ELKjs), undo/redo, dark mode, runner.
- Use case: workflow automation, chatbot builder, data pipeline, mind map.
- **Butuh dependency baru** (`@xyflow/react`) → wajib konfirmasi per CONVENTIONS "Butuh Konfirmasi".

### 4. Komponen kompleks lain yang sering digunakan (riset tambahan)

| Komponen | Frekuensi kebutuhan | Catatan |
|---|---|---|
| Rich text editor | Sangat sering | CMS, komentar, deskripsi; opsi TipTap/Plate; butuh dependency |
| Transfer list (dual listbox) | Sering | Manajemen role/permission/anggota; ada di Ant & MUI X |
| Cascader | Sering | Alamat bertingkat, kategori; ada di Ant |
| Tree select | Sering | Select dengan hierarki; compose tree-view + select |
| Calendar/scheduler | Sering | Booking, agenda; butuh dependency (mis. React Aria/DayPicker) |
| Mention input + emoji picker | Sering | Melengkapi `chat.tsx` yang belum punya mention/emoji |
| Diff viewer | Sedang-serring | Code review, audit log |
| Import wizard (CSV + column mapping) | Sering di admin tool | Multi-step + validasi |
| Image cropper | Sering | Avatar/cover upload flow |
| Lightbox/gallery | Sedang | Melengkapi preview file |
| Tour/coach marks | Sedang | Onboarding produk |
| Permission/role matrix | Sedang | Grid checkbox role × resource |
| Signature pad | Jarang-sedang | Kontrak, persetujuan |
| Color picker | Sedang | Tools, tema |
| Gantt chart | Jarang | Manajemen proyek; berat |

## Usulan Tier (MoSCoW ringan)

- **Tier 1 (must, high frequency × high value)**: upgrade upload queue di atas file-input, transfer list, cascader, tree select, calendar, mention+emoji (compose chat).
- **Tier 2 (diminta eksplisit user)**: file manager (composed pattern), org chart, flow editor (butuh konfirmasi dependency `@xyflow/react`).
- **Tier 3 (should/could, niche)**: rich text editor (dependency), diff viewer, import wizard, image cropper, lightbox, tour, permission matrix, signature pad.

## Non-Goals (usulan)

- Gantt chart, map/location picker, QR scanner — berat/bergantung layanan eksternal; tunda.
- Mengganti komponen existing — semua komponen baru bersifat menambah.

## Open Questions

1. Prioritas tier mana yang masuk PRD pertama?
2. Flow editor: setuju menambah dependency `@xyflow/react`, atau tunda?
3. Org chart: standalone (tanpa dependency) atau di atas flow canvas?
4. Kategori folder baru untuk komponen ini: `packages/ui/src/components/canvas/`, `files/`, atau masuk kategori existing?
