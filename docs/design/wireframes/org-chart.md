# Wireframe — Org Chart (S-005.28)

Status: approved (gate 2)
Spec: `docs/design/org-chart.md` · Flow: `docs/design/flows/org-chart.mmd` · PRD: `docs/prd/003-org-chart.md`
Layar: `S-005.28` Org Chart (`/patterns/org-chart`)

## 1. Shell (desktop ≥ md)

Shell-first: toolbar di atas, satu kanvas penuh di bawah. Tidak ada panel samping —
diagram adalah konten utamanya (beda dengan File Manager yang tiga zona).

```text
S-005.28 Org Chart (/patterns/org-chart)
├── Toolbar atas (satu baris, wrap di layar kecil)
│   ├── Kiri: judul + ringkas meta ("40 orang · 4 departemen")
│   ├── Tengah: pencarian node (compose form/search-input, FR-009)
│   │   └── hasil diumumkan via live region "3 hasil" (di luar kanvas)
│   └── Kanan: toggle orientasi top-down / left-right (FR-008, segmented-control)
├── Kanvas diagram (role="tree")
│   ├── Layer konektor SVG (di bawah node, token `border`)
│   ├── Layer node (roving tabindex, expander per node)
│   └── Kontrol zoom mengambang kanan-atas kanvas: [−] [100%] [+] [reset] (FR-006)
└── Status strip bawah kanvas (opsional, demo): level zoom + node terpilih
```

- Kontrol demo scenario (pemicu loading/empty/error, ganti dataset) hidup di
  panel demo showcase di atas `DemoSection` — bukan bagian komponen.
- Tidak ada modal di v1 (read-only; detail unit dibuka aplikasi konsumen via `onSelect`).

## 2. Anatomy node

Ukuran node seragam agar layout deterministik (constraint PRD): `200×72 px`,
radius `--radius`, permukaan `card`, border `border`.

```text
┌──────────────────────────────────┐
│ ▸ ┌──┐  Nama Lengkap        [≡]  │  ▸ = expander (icon-button ≥32×32, hanya
│   │avatar│ Jabatan            │       bila punya anak; berputar saat terbuka)
│   └──┘  [badge departemen]      │  ≡ = area aksi sekunder (slot konsumen,
└──────────────────────────────────┘       opsional; v1 default kosong)
   └─ strip aksen departemen 3px di tepi kiri (token aksen, FR-007)
```

Bagian dan perannya:

| Bagian | Sumber | Catatan |
|---|---|---|
| Avatar | compose `base/avatar` | fallback inisial; kontras pasangan token |
| Title | `node.title` | teks `foreground`, 1 baris ellipsis |
| Subtitle | `node.subtitle` (jabatan) | `muted-foreground` |
| Badge | `node.badge` (departemen) | compose `base/badge`; aksen token (FR-002) |
| Expander | internal | `aria-expanded`, `aria-label "Perluas/Collapse <nama>"` |
| Strip aksen | `node.accent` → token semantik | `primary/success/warning/info/destructive` |
| Custom content | `renderNode` (FR-002) | mengganti isi tengah; expander & strip tetap milik komponen |

State node:

| State | Tampilan | Trigger |
|---|---|---|
| Default | card + border | — |
| Hover | border `primary` lembut | pointer |
| Selected | border + ring `primary` | klik / Enter (`aria-selected`) |
| Highlighted | ring `primary` + `data-highlighted` | hasil pencarian (FR-009) |
| Collapsed | expander ▸; anak + konektor tidak dirender | toggle |
| Disabled | opacity turun; tidak fokus, tidak select | `node.disabled` |

## 3. Anatomy konektor & layout

- Layout tidy-tree sederhana, deterministik: anak terurut stabil, lebar subtree
  dihitung rekursif dalam satuan slot node; posisi = depth × baris (TD) atau
  kolom (LR). Gap antar node `32 px`; jarak antar tingkat `56 px`.
- Konektor ortogonal satu path per parent: turun dari bawah parent `gap/2`,
  bus horizontal ke x tiap anak, turun ke atas anak (mirror untuk LR).
- Stroke = token `border`; `2px`; sudut siku tanpa lengkung (bukan mind map).
- Konektor dirender ulang dari hasil layout — selalu rapi sebelum/sesudah
  toggle (FR-004) dan saat zoom berubah (transform skalai seluruh kanvas).

## 4. State matrix komponen (FR-011)

| State | Tampilan | Aksi | Catatan a11y |
|---|---|---|---|
| Empty | `empty-state` "Belum ada data organisasi" + petunjuk format data | CTA konsumen (opsional) | CTA terjangkau keyboard; `role="status"` |
| Loading | skeleton diagram: ±8 kotak node + garis konektor placeholder | — | `aria-busy="true"` pada kanvas; skeleton, bukan spinner saja |
| Error data invalid | panel di area kanvas: penyebab spesifik (siklus / parent tidak ditemukan / id duplikat / multi-root) + id pelanggaran pertama | — (perbaikan di sisi data) | `role="alert"`; pesan teks, bukan hanya warna |
| Error eksternal (`error` prop) | `alert` di atas kanvas; diagram terakhir tetap bila ada | retry milik konsumen | `role="alert"` |
| Success | diagram dirender penuh; expand/collapse, select, pan/zoom aktif | lihat §2, §5 | `role="tree"`/`treeitem`; `aria-expanded` |

## 5. Keyboard & fokus

Dua mode fokus yang jelas:

1. **Kanvas (background)** — `tabindex=0`, `role="region"` `aria-label`.
   Panah = pan 40 px; `+`/`-` = zoom; `0` = reset; Tab = masuk ke node.
2. **Node** (roving tabindex, pola `dnd/tree-view`): `↑↓` node visible
   berikut/sebelumnya (DFS); `→` expand / masuk anak; `←` collapse / ke parent;
   `Home`/`End`; `Enter`/`Space` = select → `onSelect`.

- Kontrol zoom di toolbar kanvas — terjangkau via Tab tanpa masuk diagram;
  tombol persen `aria-live="polite"` saat level berubah.
- Focus ring terlihat di light & dark (`ring` token `primary`, offset `2px`).
- `prefers-reduced-motion`: transisi transform dan expander dimatikan.
- Wheel tanpa modifier **tidak** dicegat — scroll halaman aman (FR-006);
  zoom wheel hanya dengan Ctrl/Cmd.

## 6. Responsive

| Breakpoint | Perilaku |
|---|---|
| ≥ md | Toolbar satu baris; kanvas min-height `480 px`; zoom mengambang kanan-atas. |
| < md | Toolbar wrap (pencarian pindah baris); kanvas min-height `320 px`; pan/zoom tetap; orientasi LR tetap tersedia via pan horizontal. |

Fungsi inti yang tidak boleh hilang di layar kecil: browse, expand/collapse,
select, pan/zoom, dan semua state §4.

## 7. Light/dark parity

- Semua warna via token semantik: `card`/`background` (permukaan), `border`
  (konektor + garis), `foreground`/`muted-foreground` (teks), `primary`
  (selected/highlight/focus), aksen departemen dari set token semantik.
- Tidak ada hex/nilai literal; pasangan kontras tiap aksen sudah tercakup
  audit `packages/tokens` di kedua mode — diverifikasi ulang untuk strip aksen
  di atas permukaan `card` (FR-007).
