# 006-04 — Gambar M-010 + serializer markdown + slot mention

Status: done
PRD: `docs/prd/006-rich-text-editor.md`
Design: `docs/design/rich-text-editor.md`
FR: `FR-009`, `FR-015`, `FR-013`
Screens: `S-005.22`, `M-010`
Goal: Sisip gambar via URL (alt wajib) + util markdown round-trip + arsitektur siap mention tanpa refactor.

## Acceptance Criteria

### AC-01 — Sisip gambar via URL dengan alt wajib

**Given** kursor di dalam konten
**When** user membuka M-010, mengisi URL valid + alt non-kosong + pratinjau, menekan Sisipkan
**Then** gambar tersisip di kursor (`rounded-xl border`, alt terbaca SR); undo mengembalikan; alt kosong → tolak dengan pesan "alt wajib", dialog tetap terbuka (FR-009, S-005.22, M-010)

### AC-02 — Tolak URL invalid dan pratinjau gagal

**Given** dialog M-010 terbuka
**When** user mengisi URL tidak valid atau gambar gagal dimuat
**Then** pesan "URL tidak valid" / placeholder gagal + tombol Sisipkan disabled; tidak ada gambar rusak tersisip (FR-009, M-010)

### AC-03 — Serializer markdown round-trip inti

**Given** dokumen dengan H1–H3/paragraf/list/quote/code/link/bold/italic
**When** `htmlToMarkdown` lalu `markdownToHtml` dijalankan
**Then** struktur inti setara (test); di luar inti fallback HTML mentah; HTML tetap sumber kebenaran (FR-015, S-005.22)

### AC-04 — Slot mention tanpa refactor

**Given** konsumen menyuntik `extensions=[MentionExtension]`
**When** editor diinisialisasi dengan tambahan extension
**Then** FR-001/002 tidak rusak (test regresi toolbar); tidak ada UI mention v1; catatan arsitektur di story selesai (FR-013, S-005.22)

## Tasks

- [x] M-010: `dialog` URL + alt wajib + pratinjau + validasi; `setImage({src, alt})` di kursor; `data-testid=rte-image-dialog`
- [x] `onImageUpload?` opsional disiapkan (di luar v1, tanpa implementasi upload)
- [x] `form/rich-text-editor-serializer.ts`: `htmlToMarkdown`/`markdownToHtml` murni tanpa dep baru (cakupan inti saja)
- [x] Prop `extensions?: Extension[]` (append-only, tidak mengganti set inti D1)
- [x] Test: sisip/tolak gambar, pratinjau gagal, round-trip markdown inti, regresi toolbar dengan extension injeksi

## Dependencies

- Story/CR lain: 006-01 (fondasi), 006-03 (state/error pattern dipakai ulang untuk M-010)
- Package: `@tiptap/extension-image` — **disetujui user 2026-11-21** (satu-satunya paket baru, scope D8; FR-009 jalan di story ini)

## Notes

- Risiko: paket image menambah ukuran bundle — mitigasi: scoped ke dialog, dibahas di §10 spec
- Keputusan: upload callback hanya disiapkan; markdown tanpa `tiptap-markdown` v1 (D8, D13)
