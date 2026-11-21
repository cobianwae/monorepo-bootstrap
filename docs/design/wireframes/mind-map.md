# Wireframe — Mind Map (S-005.35)

Status: approved (gate 2 — selaras PRD revisi OQ#2/OQ#3 2026-11-21)
PRD: `docs/prd/012-mind-map.md` (approved, gate 1; revisi OQ#2/OQ#3 2026-11-21) · Flow: `docs/design/flows/mind-map.mmd`
Layar: `S-005.35` Mind Map (`/patterns/mind-map`) · Modal: `M-011` hapus
Komponen: `canvas/mind-map.tsx` (baru, PRD 012) — turunan ringan `OrgChartStudio`, wrapper `@xyflow/react` reuse

## Keputusan kunci gate 2

| # | Keputusan | Alasan |
|---|---|---|
| K1 | Layout default dua sisi seimbang: root sentral, anak genap/ganjil dibagi kanan-kiri proporsional lebar subtree | Decided OQ#2 PRD; deterministik, cocok 3 level + 50 node tanpa auto-layout umum |
| K2 | FR-010 drag-reparent `could` ditunda v1 — hanya catatan desain, tidak ada flow drag di v1 | Decided OQ#3 PRD; scope ringan; dialog M-011 + undo cukup untuk ideation v1 |
| K3 | Tanpa panel detail kanan (beda dari Studio S-005.34.01): semua edit via inline-edit di node | Ringan sesuai non-goals; 1-klik fokus ke ide bukan form |
| K4 | Node pill kompak (root `200×64`, cabang `160×48`), konektor `bezier` 1px token `border` | Beda dari kartu lega Studio `240×84`; ide singkat 1–2 baris |

## 1. Shell (desktop ≥ md)

Shell-first: toolbar atas, kanvas tengah penuh, strip status bawah. Tanpa panel kanan.

```text
S-005.35 Mind Map (/patterns/mind-map)
├── Toolbar atas (satu baris, wrap di mobile)
│   ├── Kiri: judul + meta ("12 ide · 3 level") + tombol [Muat contoh]
│   ├── Tengah: pencarian label (search-input) + live region "N hasil" (FR-005)
│   └── Kanan: [tambah anak root] [fit-view] [reset 100%] [undo] [redo]
├── Kanvas xyflow (role="application", min-height 480, token-mapped)
│   ├── Layer edge bezier 1px token border (di bawah node, FR-001)
│   ├── Layer node pill (lihat §2) + gagang + sisi (FR-002)
│   ├── Controls token kanan-atas: [−] [% aria-live] [+] [reset] + minimap kanan-bawah (FR-004)
│   └── Status strip bawah: level zoom + node terpilih + pesan undo/toast (FR-006)
├── M-011 dialog hapus (lihat §3; hanya bila node punya anak)
└── Pohon SR internal (tab kedua / visually-hidden): role="tree" reuse pola 003/011 (FR-005)
```

- Panel demo showcase (pemicu state matrix §4, ganti dataset, toggle light/dark) hidup di `DemoSection` — bukan bagian komponen.
- Nomor langkah end-to-end (FR-009): `ol` 1 buka → 2 tambah inline → 3 lipat/buka → 4 hapus/undo → 5 cari → 6 pan/zoom/reset.

## 2. Anatomy node pill + gagang tambah + inline-edit

Root lebih besar dari cabang agar hierarki radial terbaca sekilas.

```text
┌──────────────────────────────┐
│  Label ide max 2 baris  [n]  │  [n] = badge hitungan lipatan, mis. "5" (FR-003)
└──────────────────────────────┘
   └─ aksen dot 8px kiri (token semantik opsional per cabang level-1)
   ▸ expander bila punya anak (aria-expanded; klik lipat/buka)
   + gagang luar (tambah anak) + gagang sejajar (tambah saudara):
     muncul saat hover/fokus; hit-area ≥ 44px (FR-005/FR-008)
┌══════════════════════════════┐
║  ROOT "Peluncuran Q1"        ║  root 200×64, semibold 15, border 2px primary-soft
╚══════════════════════════════╝
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Root pill `200×64` | internal | `card`, radius penuh, 1–2 baris ellipsis + `title`/tooltip penuh |
| Cabang pill `160×48` | internal | 13–14 `foreground`, max 2 baris `line-clamp-2` |
| Badge hitungan | `base/badge` | tampil bila collapsed, mis. "+5"; `aria-label "5 ide tersembunyi"` |
| Expander | internal | `aria-label "Lipat/Buka <label>"`, visual 24px + hit-area ≥ 44px |
| Gagang `+` | internal xyflow handle custom | `aria-label "Tambah anak <label>"` / `"Tambah saudara <label>"`; keyboard Enter |
| Inline-edit | internal `input` di node | muncul saat node baru / Enter / F2; Enter simpan, Esc batal (FR-002) |
| Tooltip | Radix `Tooltip` (`overlay/tooltip`) | label penuh saat ellipsis |
| Menu konteks | Radix `ContextMenu` (`navigation/context-menu`) | tambah/edit/lipat/hapus — setara pointer (FR-005) |

Varian `cva` (ringan, tanpa API warna literal; merge via `cn()`):

| Varian | Nilai | Perilaku |
|---|---|---|
| `level` | `root` / `branch` | ukuran + ketegasan border |
| `accent` | `primary`/`success`/`warning`/`info`/`destructive` | dot 8px level-1 saja; default `primary` |
| state | `default`/`selected`/`highlighted`/`editing`/`collapsed`/`disabled` | lihat tabel di bawah |

State node:

| State | Tampilan | Trigger |
|---|---|---|
| Default | pill + border | — |
| Hover/fokus | border `primary` + gagang `+` muncul | pointer / Tab |
| Selected | ring `primary` 2px | klik / Enter (`aria-selected`) |
| Highlighted (cari) | ring `primary` + badge "Cocok" + garis putus | hasil pencarian (non-warna-saja) |
| Inline-edit | input di pill + hint "Enter simpan · Esc batal" | node baru / Enter / F2 |
| Collapsed | badge "+N" + expander ▸; subtree + edge tidak dirender | toggle manual (012-01); auto-expand search di 012-03 |
| Disabled | opacity turun; tidak fokus | `node.disabled` |

Konektor: `bezier` 1px token `border` (halus radial, bukan elbow kaku); satu edge per parent→child; layout dua sisi dihitung ulang memoized saat data/expand berubah (FR-001).

## 3. Dialog M-011 hapus

M-011 (Radix `AlertDialog`) hanya muncul bila node punya anak (FR-002). Daun dihapus langsung tanpa dialog + toast undo.

- Isi: judul "Hapus ide + N turunan?", menyebut label + `N` turunan, selalu hapus subtree penuh v1 (beda dari Studio M-008 yang punya reparent).
- Root: tombol hapus disabled + penjelasan "Root tidak bisa dihapus — hapus cabangnya dulu".
- Fokus terperangkap; Esc batal; konfirmasi → `onChange` sekali + undo + toast "Dihapus — Urungkan" ≤ 5 dtk.
- Validasi nama kosong ditolak inline (tetap edit, `aria-invalid`); siklus tidak relevan v1 karena tanpa drag (FR-010 ditunda).

## 4. State matrix (FR-007 — demo di showcase)

| State | Tampilan | Aksi | Catatan a11y |
|---|---|---|---|
| Empty | `empty-state` "Belum ada peta ide" + CTA [Buat peta] | buat root → node root langsung inline-edit, fokus ke input | `role="status"`; CTA keyboard-reachable |
| Loading | skeleton kanvas: 6 pill placeholder + konektor placeholder + teks SR "Memuat peta ide…" | — (toolbar disabled sementara) | `aria-busy="true"` pada kanvas; skeleton bukan spinner saja |
| Error invalid | panel di kanvas: penyebab spesifik (duplikat / parent hilang / siklus / root ≠ 1) + id pelanggar pertama + [Salin detail] | perbaiki data / [Muat contoh] | `role="alert"`; pesan teks + id, bukan warna saja |
| Error eksternal (`error` prop) | `alert` di atas kanvas; peta terakhir tetap bila ada | retry milik konsumen | `role="alert"` |
| Success berisi | kanvas + controls + minimap aktif; tambah/lipat/hapus/undo/cari aktif | lihat §2–§3 + §5 | `role="application"` kanvas + pohon SR `role="tree"`; live region |
| Success contoh | dataset "Peluncuran Q1": root + 3 cabang + 3 level (skenario utama PRD) + varian 50 node untuk pan/zoom | tombol [Muat contoh] 1 klik | sama + meta "12 ide · 3 level" |

Semua teramati di showcase S-005.35 via panel demo (di luar komponen).

## 5. Keyboard & fokus (FR-005)

Order: toolbar → pencarian → kanvas → node terpilih (gagang `+` ikut Tab saat node fokus) → controls → minimap (`tabIndex=-1` default) → pohon SR.

| Konteks | Tombol | Aksi |
|---|---|---|
| Kanvas fokus | Panah | pan 40px |
| Kanvas fokus | `+` / `-` / `0` | zoom in / out / reset 100% |
| Kanvas fokus | `F` | fit-view |
| Node fokus | `←→` | antar saudara (sisi sama); `↑` parent, `↓` anak pertama |
| Node fokus | `Enter` atau `F2` | inline-edit; Enter simpan, Esc batal |
| Node fokus | `Space` | expand/collapse manual |
| Node fokus | `Delete`/`Backspace` | hapus (M-011 bila punya anak) |
| Global | `Ctrl+Z` / `Ctrl+Y` | undo / redo |
| Gagang `+` fokus | `Enter`/`Space` | tambah anak/saudara → inline-edit |

Pohon SR internal: `role="tree"`/`treeitem`/`group` + `aria-level`/`aria-expanded`/`aria-selected`; roving tabindex; `↑↓→←`/`Home`/`End` reuse pola 003/011; semua operasi via tombol per baris.

Live region (`polite`; `assertive` hanya error): jumlah hasil cari, "Ide X ditambah ke Y", "Dihapus — Urungkan", "Perubahan dibatalkan/diulang", level zoom ("%").

Focus ring `primary` offset 2px light & dark. `prefers-reduced-motion`: durasi 0, pinch/animasi xyflow mati.

## 6. Responsive

| Breakpoint | Perilaku |
|---|---|
| ≥ lg | Toolbar satu baris; minimap tampil; kanvas min-height 480 |
| md–lg | Toolbar wrap dua baris; minimap kecil |
| < md | Minimap sembunyi (toggle); toolbar ikon + pencarian baris kedua; kanvas min-height 320; gagang `+` tetap ≥ 44px hit-area |

Fungsi yang tidak boleh hilang di kecil: tambah inline, edit, hapus (M-011), lipat, cari, pan/zoom, semua state §4.

## 7. Light/dark parity + token

Hanya token semantik: permukaan `card`/`background`, garis/edge `border`, teks `foreground`/`muted-foreground`, aksi/selected/highlight/fokus `primary`, aksen cabang `success/warning/info/destructive`, badge hitungan `muted`. Tanpa token baru (constraint PRD). Audit: tiap pasangan teks ≥ 4.5:1 + grafis ≥ 3:1 via validator `@ds/tokens` (`pnpm test:tokens`), tabel audit di story implementasi (FR-008). Dot aksen di atas `card` + controls + minimap diverifikasi ulang light & dark.

## 8. FR Coverage

| FR | Layar | Flow | Wireframe |
|---|---|---|---|
| FR-001 radial dua sisi deterministik | S-005.35 | diagram 1 render | §1–§2 layout K1 |
| FR-002 tambah/edit/hapus + M-011 | S-005.35 + M-011 | diagram 2 + 3 | §2–§3 |
| FR-003 lipat + hitungan | S-005.35 | diagram 1 | §2 badge +N |
| FR-004 pan/zoom + batas | S-005.35 | diagram 5 | §1 controls + §5 |
| FR-005 keyboard + tree SR | S-005.35 | diagram 4 | §5 penuh |
| FR-006 controlled + undo/redo | S-005.35 | diagram 2–3 | §1 strip + §5 |
| FR-007 state matrix | S-005.35 | diagram 1 | §4 6 state |
| FR-008 dark + kontras token | S-005.35 | — (audit) | §7 |
| FR-009 showcase interaktif | S-005.35 | semua (demo `ol`) | §1 + §4 |
| FR-010 drag-reparent could | — (ditunda v1) | catatan saja | K2 §3 |

OQ PRD: #1 answered (reuse xyflow); #2 decided dua sisi seimbang (K1, selaras PRD revisi 2026-11-21); #3 decided tunda FR-010 ke iterasi berikut (K2, selaras PRD revisi 2026-11-21).
