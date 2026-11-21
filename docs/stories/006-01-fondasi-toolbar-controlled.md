# 006-01 — Fondasi controlled + toolbar inline/blok + undo

Status: done
PRD: `docs/prd/006-rich-text-editor.md`
Design: `docs/design/rich-text-editor.md`
FR: `FR-001`, `FR-002`, `FR-005`, `FR-010`, `FR-006`
Screens: `S-005.22`
Goal: `RichTextEditor` controlled hidup di `packages/ui` dengan toolbar inline/blok + undo/redo dan round-trip HTML, siap dipakai story 006-02–05.

## Acceptance Criteria

### AC-01 — Formatting inline mengikuti seleksi

**Given** editor dengan konten berformat bold/italic/underline/strike
**When** kursor pindah ke dalam teks berformat
**Then** tombol toolbar terkait `aria-pressed=true`; klik tombol toggle format pada seleksi (FR-001, S-005.22)

### AC-02 — Blok heading/list/quote via toolbar

**Given** baris kosong dan baris teks biasa
**When** user klik H1/H2/H3, bullet, ordered, blockquote
**Then** blok berubah jenisnya; nested list maksimal satu tingkat, lebih dalam diratakan; transformasi terlihat di konten Prose (FR-002, S-005.22)

### AC-03 — Controlled HTML round-trip

**Given** konsumen controlled dengan `value` HTML + `onChange`
**When** user mengetik/format lalu `value` di-set ulang dari luar
**Then** konten ter-update tanpa merusak seleksi bila tidak berubah; serialize→parse menghasilkan struktur setara (test) (FR-005, S-005.22)

### AC-04 — Undo/redo bawaan lintas toolbar

**Given** aksi toolbar (bold, heading) berurutan
**When** user menekan tombol Urungkan / `Ctrl/Cmd+Z` lalu Ulangi / `Ctrl/Cmd+Shift+Z`
**Then** aksi terakhir dibatalkan lalu dikembalikan; tombol disabled saat history kosong/penuh; live region mengumumkan (FR-010, S-005.22)

### AC-05 — Toolbar keyboard dasar + SSR-safe

**Given** keyboard saja, light & dark
**When** user `Tab` ke toolbar, aktifkan via `Enter`/`Space`, pakai `Ctrl/Cmd+B/I/U`
**Then** semua aksi inline/blok/undo terjangkau tanpa mouse; tidak ada hydration mismatch (`immediatelyRender:false`); fokus ring `primary` terlihat di kedua tema (FR-006, S-005.22)

## Tasks

- [x] `RichTextEditor` di `packages/ui/src/components/form/rich-text-editor.tsx` + export `index.ts` (named): TipTap 3.30.1 (`StarterKit` heading 1–3 + `Underline` + `Link(openOnClick:false)` + `Placeholder`), tanpa `Highlight` v1
- [x] Toolbar milik komponen: `role=toolbar`, grup inline/blok/undo, `button` + `tooltip` + `separator`, `aria-pressed` live, `data-testid=rte-toolbar/rte-button-*/rte-content`
- [x] Kontrak `value/onChange/onTextChange/ariaLabel/className`; `useEditor` + `EditorContent`; sync luar→dalam hanya bila berbeda
- [x] Test: toggle inline aktif, transformasi blok, round-trip HTML, undo/redo, Tab + shortcut Ctrl+B/I/U, render SSR-safe
- [x] Showcase draf `/patterns/rich-text-editor` (final di 006-05): render komponen baru dengan dataset Prose minimal

## Dependencies

- Story/CR lain: tidak ada (fondasi pertama)
- Package: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-underline`, `@tiptap/pm` 3.30.1 — promosi dari showcase ke `packages/ui` (disetujui gate 1, bukan baru)

## Notes

- Risiko: CSS/default TipTap bocor — mitigasi: mapping Prose ke token existing, tanpa import CSS mentah di luar token
- Keputusan: `Highlight` keluar v1 (D1); sanitasi milik konsumen, bukan komponen (D2)
