# Wireframe — Rich Text Editor (S-005.22)

Status: approved (gate 2 — 2026-11-21)
Spec: `docs/design/rich-text-editor.md` · Flow: `docs/design/flows/rich-text-editor.mmd` · PRD: `docs/prd/006-rich-text-editor.md` (approved gate 1)
Layar: `S-005.22` Rich Text Editor (`/patterns/rich-text-editor`) + demo komponen di `S-004.03` Forms · Modal: `M-009` link editor, `M-010` gambar via URL

## 1. Shell (desktop ≥ lg)

Shell-first: header dokumen, toolbar format, area konten Prose, strip counter + hint shortcut.

```text
S-005.22 Rich Text Editor (/patterns/rich-text-editor)
├── PageHeader: judul + deskripsi + badge [@tiptap/react] + badge [N kata]
├── Card dokumen
│   ├── CardHeader: [icon] Judul dokumen + aksi [Preview/Edit toggle] [Simpan]
│   ├── Toolbar (role=toolbar, aria-label=Format teks) — sticky, wrap di mobile
│   │   ├── Grup inline: [B][I][U][S][Kode] (FR-001; toggle + aria-pressed)
│   │   ├── Grup blok: [H1][H2][H3][•List][1.List][Quote][Divider] (FR-002)
│   │   ├── Grup sisip: [Link M-009][Gambar M-010] (FR-003/FR-009)
│   │   └── Kanan: [Urungkan][Ulangi] (FR-010; disabled saat tidak tersedia)
│   ├── Area konten (EditorContent; role=textbox aria-multiline)
│   │   ├── Placeholder "Tulis sesuatu…" saat kosong (FR-007/FR-011)
│   │   ├── Konten Prose: heading/list/quote/link/gambar (FR-001/002/003/009)
│   │   └── M-009 popover link (anchor ke seleksi): input URL + [Simpan][Buka][Hapus][Batal] + pesan validasi
│   ├── M-010 dialog gambar (terpisah dari toolbar): input URL + input alt wajib + pratinjau + [Sisipkan][Batal]
│   └── Strip bawah: [kbd Ctrl+B Bold] [kbd Ctrl+K Link] ... [counter N/10.000] [catatan sanitasi + Prose]
├── Panel demo showcase (DemoSection, bukan bagian komponen): pemicu loading/empty/error + retry,
│   toggle disabled/readonly, toggle light/dark, dataset contoh Prose, kotak resep controlled 15 baris
└── Catatan implementasi (3 kolom): TipTap+StarterKit / SSR-safe / output Prose
```

- Demo komponen di `S-004.03` Forms: satu instance kecil (placeholder + toolbar ringkas + counter) sebagai contoh pemakaian form — tanpa panel demo penuh.
- Nomor langkah end-to-end (FR-014): `ol` 1 format toolbar → 2 shortcut `#`/`-`/`**` → 3 link via M-009 → 4 gambar via M-010 + alt → 5 counter melewati batas → 6 atur ulang demo.
- Menu konteks bukan bagian v1 (out — hanya toolbar + shortcut + keyboard standar).

## 2. Anatomy

### 2.1 Toolbar format

Satu baris wrap (grup dipisah `separator` vertikal). Sumber: `base/button` (ghost/icon) + `base/tooltip` (label) + `base/kbd` (hint di strip bawah).

```text
[B][I][U][S][</>] | [H1][H2] | [•][1.][❝][―] | [🔗][🖼] || [↩][↪]
active = bg-highlight + aria-pressed=true + tooltip "Bold (Ctrl+B)"
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Tombol inline | `base/button` ghost icon + `tooltip` | `aria-pressed` mengikuti seleksi live (FR-001); shortcut Ctrl/Cmd+B/I/U (FR-006) |
| Tombol blok | sama | H1–H3/paragraf/list 1 tingkat/quote; transformasi blok via toolbar setara shortcut (FR-002) |
| Tombol link/gambar | sama | membuka M-009/M-010; fokus pindah ke input dialog, Esc kembali (FR-003/009) |
| Undo/redo | sama, kanan | `disabled` saat `can().undo/redo` false; Ctrl+Z / Ctrl+Shift+Z (FR-010) |
| Tooltip | `base/tooltip` | nama + shortcut; tidak mengandalkan hover saja (fokus keyboard menampilkan) |
| Overflow mobile | wrap dua baris | tidak ada menu "..." v1; semua tombol tetap reachable via scroll vertikal toolbar |

State tombol:

| State | Tampilan | Trigger |
|---|---|---|
| Default | `muted-foreground`, hover `foreground` + `muted/40` | — |
| Aktif | `bg-highlight text-highlight-foreground` + `aria-pressed=true` | kursor di dalam mark/blok tersebut |
| Disabled | opacity 40, tidak fokus-aksi | undo/redo kosong; seluruh toolbar saat `disabled`/loading |
| Fokus | ring `primary` 2px offset 2 | Tab/SR; urutan = grup inline → blok → sisip → undo (FR-006) |

### 2.2 Area konten Prose

Kontainer `min-h-[320px]`, kelas Prose sama dengan output render (pengalaman tulis = hasil terbit). Mapping mark/blok → token ada di spec §6.

```text
┌─────────────────────────────────────────┐
│ Ship interfaces you're proud of (H2)    │
│ Paragraf muted-foreground, strong       │
│ foreground, link highlight+underline    │
│ ❝ quote border-l highlight + italic    │
│ • bullet list  • nested 1 tingkat       │
│ [gambar + caption alt sebagai teks]     │
│ placeholder abu saat kosong             │
└─────────────────────────────────────────┘
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Heading H1–H3 | StarterKit, level dibatasi 1–3 | skala display `font-display`; H2 ada `border-b` halus (bukan warna saja) |
| List | StarterKit bullet/ordered + nested 1 tingkat | indent `pl-6`, marker token; nested >1 diratakan ke 1 (non-goal v1) |
| Blockquote | StarterKit | border-l `highlight` + italic + teks `muted-foreground` |
| Inline code / pre | StarterKit code/codeBlock | chip `border` + `muted/50` mono; blok pre scroll-x |
| Link | `extension-link` | `highlight` + underline offset; klik di editor membuka M-009 (bukan navigasi langsung; `openOnClick:false`) |
| Gambar | `extension-image` via M-010 | block, `rounded-xl border`; alt wajib dibaca SR; caption = alt |
| Placeholder | `extension-placeholder` | teks "Tulis sesuatu…", `muted-foreground/60`, hilang saat ada konten |
| Mention | slot kosong (FR-013 could) | tidak dirender v1; arsitektur siap tambah node tanpa refactor (catatan §7 spec) |

### 2.3 M-009 link editor (popover desktop / dialog-sheet mobile)

Anchor ke seleksi teks (desktop) atau bottom-sheet (mobile <md). Bukan `window.prompt` baseline — diganti komponen accessible.

```text
M-009 (anchor: teks terseleksi / ikon link di toolbar)
┌─────────────────────────────────┐
│ Tautan                    [×]   │
│ URL [https://…            ]     │
│ pesan validasi / "Buka pratinjau"│
│ [Buka ↗] [Hapus]    [Batal][Simpan]│
└─────────────────────────────────┘
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Input URL | `form/input` + label "URL tautan" | validasi: `https?://` atau `/path`; invalid → `aria-invalid` + pesan teks (FR-003) |
| Aksi simpan | `base/button` highlight | disabled sampai valid; Enter = simpan, Esc = batal + fokus kembali |
| Aksi buka/hapus | `button` outline/ghost | Buka hanya saat edit link existing; Hapus melepas mark jadi teks biasa |
| Fokus | trap ringan di dialog mobile | buka → fokus input; tutup → fokus kembali ke editor/teks asal (FR-006) |

### 2.4 M-010 gambar via URL (dialog)

```text
M-010 Sisip gambar
┌─────────────────────────────────┐
│ URL gambar [https://…/a.png]    │
│ Teks alt   [Deskripsi gambar*]  │  *wajib
│ Pratinjau: [thumb / placeholder]│
│ pesan: "Alt wajib untuk SR"     │
│               [Batal][Sisipkan] │
└─────────────────────────────────┘
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Input URL + alt | `form/input` + label | URL validasi sama dengan M-009 + cek ekstensi longgar; alt kosong → tolak + pesan (FR-009) |
| Pratinjau | `img` thumb `rounded border` | gagal muat → placeholder + pesan, tombol Sisipkan disabled |
| Sisipkan | `button` highlight | sisip di kursor; undo tersedia (FR-010) |

### 2.5 Counter + strip bawah

Counter dihitung dari teks polos (`editor.getText()`), bukan HTML — konsisten dengan batas 10.000 (OQ#4). Default 10.000, prop `maxLength`.

```text
[kbd Ctrl+B Bold] [kbd Ctrl+K Link] ... [✨ sanitasi+Prose] ... [counter: 8.412/10.000]
```

| Kondisi | Tampilan | Catatan a11y |
|---|---|---|
| Normal <90% | `muted-foreground` biasa | `aria-describedby` ke area konten; `role=status` polite |
| Mendekati ≥90% | `warning` + teks "mendekati batas" | tidak warna-saja (teks tambahan) |
| Melewati >100% | `destructive` + teks "melewati batas N karakter" | `role=alert` sekali saat transisi; mengetik tetap boleh (peringatan, bukan blokir — OQ#4) |

## 3. State matrix (FR-007 + FR-011)

Semua teramati di showcase S-005.22 via panel demo (di luar komponen). Komponen hanya menerima `loading`/`error`/`onRetry` + derivasi empty.

| State | Tampilan | Aksi | Catatan a11y |
|---|---|---|---|
| Empty | placeholder "Tulis sesuatu…" di konten kosong + hint shortcut di bawah | ketik langsung / pilih format (heading otomatis dari `# `) | placeholder `aria-hidden` dari konten? Placeholder bukan label — label via `aria-label="Rich text editor"` (FR-006) |
| Loading | skeleton: baris toolbar placeholder + 4 baris teks + blok 160px + teks SR "Memuat editor…" | toolbar + konten disabled sementara | `aria-busy=true` pada card; skeleton + teks SR (bukan spinner saja) |
| Error | `alert` di atas konten: "Konten gagal dimuat" + detail parse + [Coba lagi] | retry → `onRetry` konsumen; konten terakhir tetap bila ada | `role=alert`; pesan teks, bukan warna saja |
| Disabled | toolbar mati + konten `muted` non-editable, nilai tetap terlihat | tidak ada editing; fokus dilewati | `aria-disabled=true`; kontras teks tetap ≥ 4.5:1 |
| Readonly | toolbar disembunyikan/disabled + konten terbaca + link/gambar tetap bisa dibuka | navigasi baca + buka link; tanpa editing | konten `readonly`, bukan `disabled` (SR tetap baca penuh) |
| Over-limit | counter destructive + pesan + border konten `destructive` halus | perbaiki teks / tetap simpan (peringatan) | `role=alert` + `aria-describedby` counter |
| Success berisi | toolbar aktif + konten Prose + counter netral + [Simpan] | next: format (flow 2), link (flow 3), gambar (flow 4) | live region kata/karakter polite |

## 4. Keyboard & fokus (FR-006 + FR-010)

Order: header aksi [Preview][Simpan] → toolbar grup (inline → blok → sisip → undo) → area konten → link/gambar di dalam konten (Tab) → M-009/M-010 saat terbuka → strip counter (read-only, dilewati) → panel demo.

| Konteks | Tombol | Aksi |
|---|---|---|
| Toolbar | `Tab` / `Shift+Tab` | pindah antar tombol; `Enter`/`Space` aktifkan |
| Toolbar inline | `Ctrl/Cmd+B`, `I`, `U` | bold / italic / underline (FR-006) |
| Editor | `Ctrl/Cmd+K` | buka M-009 link (FR-003) |
| Editor | `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z` | undo / redo (FR-010) |
| Editor ketik | `#␣`, `##␣`, `###␣`, `-␣`, `1.␣`, `**x**`, `` `x` ``, `>␣` | shortcut heading/list/bold/code/quote (FR-004) |
| M-009/M-010 | `Enter` / `Esc` | simpan / batal + fokus kembali ke editor |
| Konten link fokus | `Enter` | buka M-009 edit (bukan navigasi langsung) |
| Global | `Tab` keluar editor | fokus ke strip/counter dilewati → ke panel demo |

Live region (`polite`; `assertive` hanya error/over-limit): "Bold aktif", "Heading 2 diterapkan", "Tautan disimpan", "Tautan dihapus", "Gambar disisipkan", "Dibatalkan/diulang", "Mendekati/melewati batas N karakter". Focus ring `primary` 2px offset 2 light & dark. `prefers-reduced-motion`: transisi toolbar/tooltip mati. Touch: tombol ≥ 40px hit-area (padding), popover jadi sheet, semua operasi ada tombol setara (tanpa hover).

## 5. Responsive

| Breakpoint | Perilaku |
|---|---|
| ≥ lg | Toolbar satu baris + konten `min-h-320` + strip satu baris; M-009 popover anchor; M-010 dialog tengah |
| md–lg | Toolbar wrap dua baris; konten sama; M-009 popover; M-010 dialog |
| < md | Toolbar wrap + scroll-x aman (tidak crop); konten `min-h-240`; M-009 jadi bottom-sheet; M-010 full-screen sheet; counter ringkas "8,4k/10k" + pesan lengkap di SR |

Fungsi yang tidak boleh hilang di kecil: semua format toolbar, shortcut hardware keyboard, link sisip/edit/hapus, gambar + alt, undo/redo, counter + over-limit, semua state §3.

## 6. Light/dark parity + token

Hanya token semantik (tanpa token baru): permukaan `card`/`background`/`muted`, garis `border`, teks `foreground`/`muted-foreground`, aksi/aktif/fokus `primary` + `highlight` (pasangan existing dari S-005.22 yang sudah lolos), valid/invalid `success`/`warning`/`destructive`, code chip `muted`. Prose area memakai mapping yang sama dengan `layout/prose` agar tulis = terbit. Audit: tiap pasangan teks ≥ 4.5:1 + grafis (fokus ring, border invalid, chip) ≥ 3:1 via validator `@ds/tokens` (`pnpm test:tokens`), tabel audit di story implementasi (FR-012). Invalid/over-limit tidak pernah warna-saja (selalu teks + ikon + border).
