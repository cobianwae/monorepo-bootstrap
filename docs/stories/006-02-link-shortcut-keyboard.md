# 006-02 — Link M-009 + markdown shortcut + keyboard penuh

Status: review
PRD: `docs/prd/006-rich-text-editor.md`
Design: `docs/design/rich-text-editor.md`
FR: `FR-003`, `FR-004`, `FR-006`
Screens: `S-005.22`, `M-009`
Goal: Sisip/edit/hapus link via popover accessible + shortcut markdown setara toolbar, semua via keyboard.

## Acceptance Criteria

### AC-01 — Sisip link baru via M-009

**Given** teks terblok tanpa link
**When** user membuka M-009 via tombol Link / `Ctrl/Cmd+K`, mengetik URL valid, `Enter`/Simpan
**Then** link tersimpan dengan mark aktif; fokus kembali ke seleksi asal; URL invalid → `aria-invalid` + pesan, Simpan disabled (FR-003, S-005.22, M-009)

### AC-02 — Edit/buka/hapus link existing

**Given** kursor di dalam link
**When** user klik link / `Ctrl/Cmd+K` (popover terisi URL lama) lalu Buka / Hapus / Simpan URL baru
**Then** Buka membuka tab baru; Hapus melepas mark jadi teks biasa (undo tersedia di 006-01); Simpan mengganti href; `Esc`/Batal menutup tanpa perubahan (FR-003, M-009)

### AC-03 — Markdown shortcut setara toolbar

**Given** baris kosong
**When** user mengetik `#␣` / `##␣` / `###␣` / `-␣` / `1.␣` / `>␣` / `**x**` / `` `x` ``
**Then** berubah menjadi heading/list/quote/bold/code identik dengan hasil klik toolbar (test membandingkan HTML) (FR-004, S-005.22)

### AC-04 — Keyboard + popover setara pointer

**Given** keyboard saja dan mobile <md
**When** user `Tab` ke tombol Link, `Enter` membuka M-009, `Esc` menutup; di mobile popover menjadi sheet
**Then** seluruh alur sisip-edit-hapus bisa tanpa mouse; fokus terkelola (buka→input, tutup→editor); tidak ada `window.prompt` tersisa (FR-006, FR-003, M-009)

## Tasks

- [x] M-009: `popover` (desktop anchor seleksi) / `dialog`-sheet (mobile) — input URL + label, pesan validasi, aksi Simpan/Buka/Hapus/Batal; `extendMarkRange` + `setLink/unsetLink`
- [x] Shortcut `Ctrl/Cmd+K` + klik-link-membuka-M-009 (`openOnClick:false`); validasi `https?://` atau `/path`
- [x] InputRules StarterKit aktif + test kesetaraan shortcut-vs-toolbar
- [x] Test: sisip/edit/hapus link via keyboard, tolak URL invalid/kosong, Esc fokus-kembali, tidak ada prompt
- [x] Showcase: hubungkan M-009 ke draf S-005.22 dari 006-01 (panel demo final di 006-05)

## Dependencies

- Story/CR lain: 006-01 (fondasi editor + toolbar + undo)
- Package: tidak ada tambahan (popover/dialog/input/button existing)

## Notes

- Risiko: anchor popover ke seleksi ProseMirror bergeser saat scroll — mitigasi: anchor ke toolbar saat seleksi collapse, ke range saat ada seleksi
- Keputusan: prompt baseline dihapus total; link di editor tidak navigasi langsung (D4)
