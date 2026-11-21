# Wireframe — Flow Editor (S-005.29)

Status: draft (gate 2 — rerun pasca revisi PRD 2026-11-21)
Spec: `docs/design/flow-editor.md` · Flow: `docs/design/flows/flow-editor.mmd` · PRD: `docs/prd/005-flow-editor.md` (draft revisi)
Layar: `S-005.29` Flow Editor (`/patterns/flow-editor`) + child `S-005.29.01` palette, `S-005.29.02` inspector

## 1. Shell (desktop ≥ lg)

Shell-first: palette kiri, canvas tengah penuh, inspector kanan on-demand, toolbar atas, status strip bawah.

```text
S-005.29 Flow Editor (/patterns/flow-editor)
├── Toolbar atas milik pola (satu baris, wrap di mobile)
│   ├── Kiri: judul + meta ("N node · M edge") + tombol [Atur ulang demo]
│   └── Kanan: [urungkan] [ulangi] [snap toggle] [grid toggle] (zoom milik controls, bukan toolbar)
├── Zona kiri S-005.29.01 Palette (240px; drawer di <md)
│   ├── Search jenis node (filter lokal)
│   ├── Item palette: ikon + nama + deskripsi (drag via @dnd-kit; Enter/tombol [+] sebagai jalur keyboard) + `data-testid="flow-palette-item-<type>"`
│   └── Hint: "Seret ke canvas atau tekan [+] untuk tambah di tengah viewport"
├── Kanvas xyflow tengah (role="application", aria-label="Editor alur", min-height 480, token-mapped, data-testid="flow-canvas")
│   ├── Layer grid halus (dots/lines token border; toggle)
│   ├── Layer edge berlabel (lihat §2.2)
│   ├── Layer node custom DS (lihat §2.1; handle input kiri / output kanan)
│   ├── Controls token kiri-bawah atau kanan-atas: [− Perkecil] [% Tingkat zoom aria-live] [+ Perbesar] [bingkai Selaras tampilan] [1:1 Atur 100%] [gembok Kunci interaksi]
│   ├── Minimap kanan-bawah (klik untuk pindah; sembunyi di <md + toggle)
│   └── Status strip bawah: level zoom + seleksi ("2 terpilih") + pesan undo/toast
├── Zona kanan S-005.29.02 Inspector (sheet 320px; overlay/bottom-sheet di <md)
│   ├── Dibuka HANYA saat seleksi eksplisit (klik/Enter/tombol rincian/menu) — tambah node TIDAK otomatis membuka; tetap terbuka saat multi-seleksi (mode hitungan)
│   ├── Isi node: judul (input), jenis (badge read-only), deskripsi, status, form properti konsumen
│   ├── Isi edge: label (input), tombol [Hapus edge]
│   └── Aksi: [Duplikat] [Hapus…] [Tutup]; hapus langsung + toast "Dihapus — Urungkan" (tanpa dialog blokir)
└── Daftar alternatif SR (tab kedua / visually-hidden + toggle "Daftar"): ul node + ul edge
```

- Panel demo showcase (pemicu state matrix §4, dataset workflow 5 node, toggle snap/grid/minimap, toggle light/dark) hidup di `DemoSection` — bukan bagian komponen.
- Nomor langkah end-to-end (FR-014): `ol` 1 tarik node → 2 sambung edge → 3 edit inspector → 4 hapus + urungkan → 5 minimap/snap → 6 atur ulang demo.
- Menu konteks (`navigation/context-menu`): per node (rincian, duplikat, hapus), per edge (edit label, hapus), per canvas (tambah di sini, selaras tampilan, alih grid).

## 2. Anatomy

### 2.1 Node custom DS

Ukuran deterministik tunggal `220×88` v1 (tanpa varian compact). Radius `--radius`, permukaan `card`, border `border`.

```text
┌──────────────────────────────┐
│ [● status] Judul node   [≡]  │  ≡ = buka/fokus inspector (bukan auto-full)
│ Deskripsi 1–2 baris          │
│ [badge jenis] [badge status?]│  badge tidak truncate umum (wrap/max-w + tooltip)
└──────────────────────────────┘
 ◁ handle input (kiri)     handle output ▷ (kanan):
   target ≥ 12px visual + hit-area ≥ 44px (padding transparan); fokusable via keyboard; `data-testid="flow-node-<id>"` / `flow-handle-<id>-source|target`
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Judul | `node.data.label` (input di inspector) | 14 semibold `foreground`, 1 baris ellipsis + `title`/tooltip |
| Deskripsi | `node.data.description` | 12 `muted-foreground`, max 2 baris `line-clamp-2` |
| Badge jenis | `base/badge` | `primary/muted`; tidak pernah hilang saat judul panjang |
| Status dot + teks | token `success/warning/info/destructive` + teks (FR-016 could) | tidak warna-saja; teks status selalu ada |
| Handle | internal xyflow `Handle` custom | `aria-label "Output <judul>"` / `"Input <judul>"`; keyboard: fokus → Enter mulai sambung |
| Tooltip | `base/tooltip` | judul + deskripsi penuh saat ellipsis |
| Menu konteks | `navigation/context-menu` | edit/duplikat/hapus — setara drag (FR-005) |
| Selected ring | `primary` 2px + handle menonjol | `aria-selected` pada node |

State node:

| State | Tampilan | Trigger |
|---|---|---|
| Default | card + border | — |
| Hover/fokus | border `primary` + handle membesar | pointer / Tab |
| Selected | ring `primary` + inspector terbuka (hanya via seleksi eksplisit) | klik / Enter / rincian |
| Connecting | handle sumber aktif + target valid ring `success`, invalid redup | drag edge (FR-003) |
| Invalid-drop | pesan inline "Tidak bisa disambung" + edge bayangan `destructive` | hover target invalid |
| Disabled | opacity turun; tidak fokus/sambung | `node.disabled` (FR-016 could) |
| Status running/success/error | dot + badge teks token sesuai | `node.data.status` (FR-016 could) |

### 2.2 Edge berlabel

Garis `bezier`/`smoothstep` 1.5px token `muted-foreground`; terpilih `primary` 2px; invalid-preview `destructive` putus-putus + pesan teks.

```text
(node A) ────[ label chip ]────▷ (node B)
              chip: badge + tombol edit inline (Enter untuk edit)
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Garis | xyflow `BaseEdge` token-mapped | tanpa default CSS xyflow mentah |
| Label chip | `base/badge` + tombol edit | klik/Enter → fokus input label di inspector |
| Marker panah | SVG `marker-end` token `muted-foreground` | kontras grafis ≥ 3:1 light & dark |
| Menu konteks edge | `navigation/context-menu` | edit label / hapus |
| Hapus | `button` ghost + `Delete` | langsung + toast "Dihapus — Urungkan" |

### 2.3 Palette (S-005.29.01)

| Bagian | Sumber | Catatan |
|---|---|---|
| Search | `form/input` search | filter lokal; live region "N jenis" |
| Item | `dnd/sortable-list` pattern + `@dnd-kit/*` | drag pointer + tombol `[+] Tambah` untuk keyboard (FR-011) |
| Ikon jenis | inline SVG token | `aria-hidden`; nama jenis teks penuh |
| Drop preview | bayangan node di posisi `screenToFlowPosition` | snap ke grid bila aktif (FR-009) |

Keyboard palette: `Tab` ke item → `Enter`/`Space` tambah di tengah viewport → fokus pindah ke node baru → inspector TETAP TERTUTUP (on-demand via Enter/rincian). Drag pointer: seret → lepas di canvas → node di posisi drop (flow 2).

### 2.4 Inspector (S-005.29.02)

Sheet kanan 320px (desktop berdampingan; overlay di mobile). Bukan dialog blokir: canvas tetap interaktif saat inspector terbuka (mode non-modal) kecuali di <md.

Isi node terpilih tunggal:

- header: badge jenis + judul + tombol tutup,
- form: judul (input wajib), deskripsi (textarea), status (select could), + slot `children` form konsumen,
- meta: id, posisi x/y read-only, jumlah edge masuk/keluar,
- aksi: [Duplikat] [Hapus node + edge terkait] (langsung + Undo).

Multi-seleksi: judul "N terpilih (X node, Y edge)" + [Hapus semua] + [Batalkan seleksi]; form properti disembunyikan.

Edge terpilih: label (input), sumber → target read-only, [Hapus edge].

Validasi: judul kosong ditolak inline (`aria-invalid` + pesan); label edge boleh kosong (chip hilang, garis tetap).

### 2.5 Controls + minimap + grid

| Bagian | Sumber | Catatan |
|---|---|---|
| Controls | xyflow `Controls` token-mapped + `base/button` | tombol Perkecil / Tingkat zoom / Perbesar / Selaras tampilan / Atur 100% / Kunci interaksi; semua `aria-label` Indonesia |
| Minimap | xyflow `MiniMap` token-mapped | node `card`, viewport `primary`; klik/drag pindah; `tabIndex=-1` + skip-link (FR-008) |
| Grid | xyflow `Background` token-mapped | dots `border`; toggle + ukuran via props; snap `snapToGrid` (FR-009) |
| Toolbar undo/redo | `base/button` + internal history ≤ 50 | disabled saat kosong/penuh; `Ctrl+Z/Y`; live region |

## 3. State matrix (FR-013)

| State | Tampilan | Aksi | Catatan a11y |
|---|---|---|---|
| Empty | `empty-state` di atas canvas: "Canvas kosong — mulai dari palette" + CTA [Tambah node pertama] | CTA tambah node tengah + fokus ke node baru | `role="status"`; CTA keyboard-reachable; palette tetap aktif |
| Loading | skeleton canvas: 5 kartu placeholder + edge placeholder + palette skeleton + teks SR "Memuat flow…" | — (toolbar/palette disabled sementara) | `aria-busy="true"` pada canvas; skeleton bukan spinner saja |
| Error (gagal handler) | `alert` di atas canvas: pesan + [Coba lagi] | retry memanggil `onRetry` konsumen; graph terakhir tetap bila ada | `role="alert"`; pesan teks, bukan warna saja |
| Error invalid-edge | chip inline + pesan "Sambungan ditolak: …" + edge bayangan `destructive` | ubah target / batal; tidak merusak graph | `role="alert"` sementara + fokus kembali ke handle sumber |
| Success berisi | node + edge + controls + minimap aktif; palette/inspector/undo aktif | next step: sambung (flow 3), edit (flow 4) | canvas `role="application"` + daftar alternatif `role="list"`; live region |
| Success contoh workflow | dataset 5 node (trigger → kirim email → tunggu → cabang → selesai) + 4 edge berlabel | tombol [Muat contoh] + [Atur ulang demo] | sama + meta "5 node · 4 edge" |

Semua teramati di showcase S-005.29 via panel demo (di luar komponen).

## 4. Keyboard & fokus (FR-011)

Order: toolbar → palette (search → item → [+]) → canvas → node terpilih (handle ikut Tab saat node fokus) → edge terpilih → controls → inspector (bila terbuka) → daftar alternatif SR.

| Konteks | Tombol | Aksi |
|---|---|---|
| Canvas fokus | Panah | pan 40px |
| Canvas fokus | `+` / `-` / `0` | zoom in / out / atur 100% |
| Canvas fokus | `F` | selaras tampilan |
| Canvas fokus | `Ctrl+A` | pilih semua node+edge (lalu Delete massal) |
| Node fokus | `Enter` | pilih → buka inspector |
| Node fokus | `Tab` | masuk ke handle input/output |
| Handle fokus | `Enter` | mulai sambung; `Tab` ke handle target; `Enter` selesaikan, `Esc` batal |
| Node/edge fokus | `Delete`/`Backspace` | hapus + toast "Dihapus — Urungkan" (tanpa dialog) |
| Node fokus | `D` | duplikat node |
| Global | `Ctrl+Z` / `Ctrl+Shift+Z` | undo / redo (FR-007) |
| Palette item fokus | `Enter`/`Space` | tambah di tengah viewport |

Daftar alternatif: `ul` node ("Kirim email, 2 koneksi keluar") + `ul` edge ("Kirim email → Tunggu 1 hari, label: setelah dibuka"); tiap baris tombol [Fokus] [Hapus]; tabel ini yang dibaca SR penuh — canvas `aria-label` merujuk ke daftar via `aria-describedby`.

Live region (`polite`; `assertive` hanya error hapus/invalid): "Node X ditambah", "Edge X→Y tersambung", "Sambungan ditolak: handle penuh", "Dihapus — Urungkan", "Dibatalkan/diulang", level zoom ("%").

Focus ring `primary` offset 2px light & dark. `prefers-reduced-motion`: durasi 0, animasi zoom/pan xyflow mati. Touch: handle ≥ 44px hit-area (temuan #5); node drag 1 jari; pinch zoom; semua operasi inti ada tombol/menu setara (FR-011).

## 5. Responsive

| Breakpoint | Perilaku |
|---|---|
| ≥ lg | Palette 240px + canvas + inspector 320px berdampingan; minimap tampil; toolbar satu baris |
| md–lg | Palette 200px; inspector 280px; toolbar wrap dua baris |
| < md | Palette jadi drawer (tombol [Palette]); inspector jadi bottom-sheet overlay; minimap sembunyi (toggle); toolbar ikon + controls kompak; canvas min-height 320 |

Fungsi yang tidak boleh hilang di kecil: tambah via palette drawer/tombol, sambung edge, edit inspector, hapus + undo, pan/zoom, semua state §3.

## 6. Light/dark parity + token

Hanya token semantik: permukaan `card`/`background`, garis halus/grid `border`, garis edge `muted-foreground`, teks `foreground`/`muted-foreground`, aksi/selected/highlight/fokus `primary`, valid/invalid `success`/`destructive`, status could `warning`/`info`, grid `border` redup. Tanpa token baru (FR non-goals; mapping CSS xyflow ke variable existing — `border-strong` tidak dipakai karena tidak ada di token).

Audit: tiap pasangan teks ≥ 4.5:1 + grafis (edge/handle/minimap/controls) ≥ 3:1 via validator `@ds/tokens` (`pnpm test:tokens`), tabel audit di story implementasi (FR-010). Edge `muted-foreground` di atas `background` + label chip `card` diverifikasi ulang light & dark. Invalid tidak pernah warna-saja (selalu teks + garis putus).
