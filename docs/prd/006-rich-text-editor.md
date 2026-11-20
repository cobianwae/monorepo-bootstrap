# 006 — Rich Text Editor

Status: approved
Owner: —
Tanggal: 2026-11-20
Sumber: roadmap RM-11 (`docs/discussions/component-roadmap.md`)

## Problem

Input teks kaya (bold/heading/list/link) dibutuhkan untuk komentar, deskripsi tugas,
artikel CMS, dan bio produk. Hari ini hanya ada `textarea` mentah — konsumen tidak punya
cara standar untuk formatting yang accessible dan konsisten dengan design system.

Bukti/konsekuensi:

- Tidak ada komponen editor di `packages/ui`; pattern `S-005.22` Rich Text Editor di
  showcase berdiri tanpa komponen reusable di belakangnya.
- `data-display/chat.tsx` sudah punya `ChatComposer` polos (teks + kirim), tetapi belum
  mendukung mention/emoji — kebutuhan input kaya belum terlayani.
- Membangun contentEditable sendiri berisiko besar (selection, paste, IME, a11y) —
  praktik industri (TipTap/Plate) memakai framework editor teruji.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Editor teks kaya reusable dengan identitas DS | Screen konsumen memakai komponen langsung | ≥ 1 screen konsumen |
| Formatting inti tercakup | Heading, list, bold/italic/underline/strike, link teramati di showcase | Semua tercover test + scenario |
| Aksesibilitas toolbar | Operability keyboard penuh + ARIA toolbar | Lolos audit WCAG 2.1 AA |
| Dependency jelas | TipTap sudah dipakai S-005.22 (v3.30.1); keputusan = promosi ke `packages/ui` | Dependency tercatat di OQ#1; tidak ada evaluasi greenfield |

## Non-goals

- Collaborative editing (multi-user realtime, CRDT).
- Editing tabel di dalam dokumen.
- Skema node kustom kompleks (embed interaktif, mention sebagai node khusus —
  integration point untuk spec RM-10 disiapkan, bukan diimplementasi di sini).
- Export PDF / print layout.
- Mengganti `textarea` existing — tetap ada untuk input polos.
- Markdown penuh sebagai mode input kedua — hanya *markdown shortcut* saat mengetik.

## User & Use Case

Persona (ringkas):

1. **Developer konsumen DS** — memasang komentar/deskripsi kaya; butuh komponen
   controlled dengan nilai ter-serialize (HTML/markdown) dan API sederhana.
2. **End-user** — menulis komentar/petunjuk dengan formatting dasar tanpa belajar
   markdown; ingin shortcut untuk yang hafal.
3. **Kontributor konten** — menulis artikel dengan heading dan list yang rapi.

JTBD:

- "When saya menulis komentar panjang, I want menekankan bagian penting (bold, list),
  so I can pembaca menangkap poin utama."
- "When saya salah format, I want undo dan melihat state toolbar aktif,
  so I can yakin hasil akhirnya."

Skenario utama:

1. Ketik teks, blok, klik Bold di toolbar; teks ter-format dan tombol toolbar
   menunjukkan state aktif.
2. Ketik `# ` di awal baris → berubah jadi heading (markdown shortcut); `- ` → bullet
   list.
3. Seleksi teks → klik Link → popover input URL → link tersimpan; klik link di editor
   membuka opsi edit/buka/hapus.
4. Melewati batas karakter (counter merah) → peringatan; mode readonly menonaktifkan
   toolbar.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Formatting inline: bold, italic, underline, strike dengan state toolbar aktif yang mengikuti seleksi. | must | Toolbar menandai format aktif saat kursor di dalam teks berformat (test + scenario). |
| FR-002 | Blok: heading H1–H3, paragraf, ordered/unordered list (termasuk nested satu tingkat), blockquote. | must | Semua jenis blok teramati di scenario; transformasi blok via toolbar bekerja. |
| FR-003 | Link: sisip/edit via popover URL dengan validasi dasar; link bisa dibuka, diubah, dihapus. | must | Alur sisip-edit-hapus link bekerja via keyboard dan pointer (test). |
| FR-004 | Markdown shortcut saat mengetik untuk heading, list, bold/italic/code (`# `, `- `, `**`, `*`, `` ` ``). | should | Shortcut menghasilkan format yang sama dengan toolbar (test). |
| FR-005 | Nilai controlled: `value`/`onChange` dengan serializer HTML; round-trip tidak merusak konten. | must | Serialize→parse HTML menghasilkan struktur setara (test). |
| FR-006 | Toolbar aksesibel: role toolbar, label tiap kontrol, operability keyboard penuh (shortcut + tab + aktivasi); shortcut standar (Ctrl/Cmd+B/I/U) berfungsi. | must | Audit a11y lolos; semua aksi toolbar terjangkau tanpa mouse. |
| FR-007 | Placeholder, disabled, dan readonly mode dengan gaya token. | must | Tiga mode teramati di showcase; readonly menonaktifkan editing tanpa menghilangkan konten. |
| FR-008 | Counter karakter/batas maksimal dengan umpan balik mendekati dan melewati batas. | should | Counter bertambah saat mengetik; melewati batas menampilkan state warning/destructive. |
| FR-009 | Sisip gambar via URL (upload melalui callback konsumen bila diperlukan); alt text wajib diisi. | should | Gambar tampil di editor; tanpa alt text, sisipan ditolak dengan pesan. |
| FR-010 | Riwayat undo/redo bawaan framework editor bekerja lintas aksi toolbar dan shortcut. | must | Undo mengembalikan aksi toolbar terakhir (test). |
| FR-011 | State matrix: loading (untuk konten asinkron), empty (placeholder), error (konten gagal dimuat/diserialisasi), disabled. | must | Empat state teramati di scenario showcase. |
| FR-012 | Dark mode dan kontras: konten, toolbar, popover link memakai token dan lolos audit light & dark. | must | Scenario light & dark lolos audit kontras. |
| FR-013 | Integration point untuk mention (spec RM-10): arsitektur editor memungkinkan menambah plugin mention tanpa refactor. | could | Catatan desain di gate 2; tidak diimplementasi di PRD ini. |
| FR-014 | Showcase scenario editor interaktif (formatting, link, shortcut, counter) dalam light & dark. | must | Route scenario tersedia dan lolos smoke build. |
| FR-015 | Serializer markdown di samping HTML untuk kebutuhan konten berbasis teks. | should | Round-trip markdown menghasilkan struktur setara untuk formatting inti (test). |

## Design Refs

- Screen: upgrade `S-005.22` Rich Text Editor (`/patterns/rich-text-editor`) — sudah
  implemented sebagai scenario; komponen reusable menjadi basis barunya. Demo komponen
  di `S-004.03` Forms.
- Komponen terkait: `base/tooltip.tsx` (label toolbar), `overlay/popover.tsx` (input
  link), `base/button.tsx` (toolbar button), `navigation/menubar.tsx` (referensi pola
  menu), `data-display/chat.tsx` (konsumen masa depan), `form/textarea.tsx` (fallback
  plain mode).
- Dokumen design: `docs/design/rich-text-editor.md` dibuat saat gate 2 (anatomi
  toolbar, mapping mark/blok ke token, state matrix, wireframe).
- Analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (tabel §4),
  roadmap RM-11.

## Constraints & Dependencies

- Dependency package: **TipTap** — sudah dipakai S-005.22 di `apps/showcase`
  (`@tiptap/react` + starter-kit/link/placeholder/underline/highlight v3.30.1).
  Keputusan gate 1: promosikan rangkaian paket yang sama ke `packages/ui`; evaluasi
  Plate hanya bila muncul blocker teknis. Approval dependency tetap dicatat di PRD ini
  (CONVENTIONS "Butuh Konfirmasi") dan disetujui user 2026-11-20.
- Teknis: komponen di `packages/ui` kategori `form`; extension dipilih terbatas
  (starter kit + link + placeholder); kontrak controlled dijaga sederhana.
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA, light/dark parity, test
  Vitest + Testing Library co-located, alur gate AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Dependency: TipTap vs Plate (atau alternatif lain)? Evaluasi + persetujuan user ditutup di gate 1 ini. | answered — TipTap (baseline 3.30.1 dari S-005.22) dipromosikan ke `packages/ui` |
| 2 | Serializer utama: HTML saja di v1, atau markdown ikut v1 (FR-005)? | answered — HTML `must` di v1; markdown menjadi FR-015 `should` |
| 3 | Apakah FR-009 (gambar via URL) masuk v1 atau iterasi berikut? | answered — masuk v1 sebagai `should` |
| 4 | Batas karakter default dan perilaku melewati batas (blokir vs peringatan saja)? | answered — default 10.000 karakter; peringatan, bukan blokir |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-20 | Draft awal dari roadmap RM-11 |
| 2026-11-20 | **Approved (gate 1)** — TipTap dipilih (baseline showcase 3.30.1); markdown jadi FR-015 `should`; OQ#1–#4 dijawab |
