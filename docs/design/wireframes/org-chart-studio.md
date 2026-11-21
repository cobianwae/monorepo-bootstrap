# Wireframe — Org Chart Studio (S-005.34)

Status: approved (gate 2)
Spec: `docs/design/org-chart-studio.md` · Flow: `docs/design/flows/org-chart-studio.mmd` · PRD: `docs/prd/011-org-chart-studio.md`
Layar: `S-005.34` Org Chart Studio (`/patterns/org-chart-studio`) + child `S-005.34.01` panel detail, modal `M-007` pindah, `M-008` hapus
Legacy diganti: `S-005.28` Org Chart + `S-005.33` Org Chart Editor → `deprecated` (dihapus saat 011 shipped, FR-015)

## 1. Shell (desktop ≥ md)

Shell-first: toolbar atas, kanvas tengah penuh, panel detail kanan on-demand (bukan tiap tambah), status strip bawah.

```text
S-005.34 Org Chart Studio (/patterns/org-chart-studio)
├── Toolbar atas (satu baris, wrap di mobile)
│   ├── Kiri: judul + meta ("40 orang · 4 departemen") + tombol [Muat contoh] (FR-018 could)
│   ├── Tengah: pencarian nama/jabatan (search-input) + live region "N hasil" (FR-010)
│   └── Kanan: [tambah bawahan root] [orientasi TD] [fit-view] [reset 100%] [undo] [redo]
├── Kanvas xyflow (role="application", min-height 480, token-mapped)
│   ├── Layer edge smoothstep 1px token border (di bawah node, FR-002)
│   ├── Layer kartu lega OrgStudioNode 240×84 (lihat §2) + gagang + bawah/samping (FR-005)
│   ├── Controls token kanan-atas: [−] [% aria-live] [+] [reset] + minimap kanan-bawah (FR-004)
│   └── Status strip bawah: level zoom + node terpilih + pesan undo/toast (FR-009, FR-019)
├── S-005.34.01 Panel detail kanan (sheet 320px; overlay/bottom-sheet di <md)
│   ├── Dibuka hanya bila diminta: tombol [≡] / double-click / klik avatar (FR-006); keyboard: Tab ke [≡] → Enter atau Shift+Enter
│   ├── TIDAK terbuka saat tambah 1-klik (tambah = inline-edit di kartu, bukan form)
│   ├── Isi: avatar besar + nama + jabatan + badge + path breadcrumb + meta atasan/anak
│   └── Aksi: [tambah bawahan] [tambah sejawat] [pindahkan… M-007] [hapus… M-008]
└── Pohon SR internal (tab kedua / visually-hidden): role="tree" reuse pola 003 (FR-011)
```

- Panel demo showcase (pemicu 6 state matrix, ganti dataset, toggle locale tidak ada — search lokal) hidup di atas `DemoSection` — bukan bagian komponen.
- Nomor langkah end-to-end (FR-014): `ol` 1 buka → 2 tambah inline → 3 pindah → 4 hapus/undo → 5 cari → 6 reset demo.
- Modal: `M-007` pilih atasan baru, `M-008` konfirmasi hapus (lihat §3).

## 2. Anatomy kartu lega + gagang tambah + inline-edit

Ukuran seragam `240×84` (naik dari `200×72` legacy agar tidak sesak; tetap deterministik untuk layout §3 spec). Radius `--radius`, permukaan `card`, border `border`.

```text
┌──────────────────────────────────────┐
│ ┌────┐  Nama Tegas 1 baris      [≡]  │  ≡ = tombol detail → S-005.34.01 (bukan auto)
│ │avatar│ Jabatan max 2 baris         │
│ │ 32 │  [badge dept rapi] [Cocok?]   │  badge tidak pernah truncate umum (wrap/max-w + tooltip)
│ └────┘                               │
└──────────────────────────────────────┘
   └─ strip aksen 3px tepi kiri (token semantik)
   ▸ expander kiri-bawah bila punya anak (reuse 003, aria-expanded)
   + gagang bawah (tambah bawahan) + gagang samping (tambah sejawat):
     muncul saat hover/fokus kartu; target ≥ 44px area (FR-016);
     visual 24px + hit-area diperluas
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Avatar 32 | compose `base/avatar` | fallback inisial; kontras pasangan token |
| Nama | `node.title` | 14 semibold `foreground`, 1 baris ellipsis + `title`/tooltip penuh |
| Jabatan | `node.subtitle` | 12 `muted-foreground`, max 2 baris `line-clamp-2`, tidak memotong badge |
| Badge | `base/badge` + aksen | `max-w` + tooltip; badge umum ("Engineering") wajib tampil penuh di 240px |
| Strip aksen | `node.accent` → token semantik | `primary/success/warning/info/destructive` 3px |
| Expander | internal | `aria-label "Perluas/Collapse <nama>"`, visual 24–32px + hit-area ≥ 44px (seperti gagang, FR-016) |
| Gagang `+` | internal xyflow handle custom | `aria-label "Tambah bawahan <nama>"` / `"Tambah sejawat <nama>"`; keyboard: fokus → Enter |
| Inline-edit | internal `input` di kartu | muncul saat kartu baru / F2 / Ctrl+Enter; Enter simpan, Esc batal (FR-005) |
| Tooltip | `base/tooltip` | nama + jabatan penuh saat ellipsis |
| Menu konteks | `navigation/context-menu` | tambah/pindah/hapus/expand — setara drag (FR-007) |

State kartu:

| State | Tampilan | Trigger |
|---|---|---|
| Default | card + border | — |
| Hover/fokus | border `primary` + gagang `+` muncul | pointer / Tab |
| Selected | border + ring `primary` | klik / Enter (`aria-selected`) |
| Highlighted (cari) | ring `primary` + badge "Cocok" + garis putus | hasil pencarian (FR-010, non-warna-saja) |
| Inline-edit | input di kartu + hint "Enter simpan · Esc batal" | kartu baru / F2 (FR-005) |
| Collapsed | expander ▸; subtree + edge tidak dirender | toggle |
| Drag-target valid | ring `success` + label "Lepas untuk pindah" + preview path | drag (FR-007) |
| Drag-target invalid | ring `destructive` + pesan siklus/diri | drag invalid |
| Disabled | opacity turun; tidak fokus | `node.disabled` |

Konektor: `smoothstep` 1px token `border` (FR-002 "halus"); satu edge per parent→child; dirender ulang dari layout seimbang; tidak ada garis kaku 2px elbow legacy.

## 3. Panel detail (S-005.34.01) + dialog M-007/M-008

S-005.34.01 dibuka hanya bila diminta (FR-006). Isi tanpa truncate: nama, jabatan, departemen, id, atasan (breadcrumb `CEO / VP / Lead`), jumlah bawahan langsung/total, tombol aksi. Edit penuh (title/subtitle/badge/avatarSrc/accent) tetap di panel ini dengan validasi nama wajib (`aria-invalid` + pesan inline).

M-007 Pindah (setara keyboard untuk drag, FR-007): dialog + select atasan (kecuali diri/descendant — disable + alasan) + preview path baru + tombol konfirmasi/batal. Fokus terperangkap; Esc batal; sukses → `onChange` + undo + toast.

M-008 Hapus (FR-008): dialog menyebut `N` turunan by name count ("Menghapus X + N bawahan?"); radio [pindahkan anak ke kakek] vs [hapus subtree]; root: tombol hapus disabled + penjelasan "Root tidak bisa dihapus". Konfirmasi → `onChange` + undo + toast "Dihapus — Urungkan".

Toast undo (FR-019 could): `toaster` bawah-kanan, ≤ 5 dtk, aksi [Urungkan] memanggil undo + live region.

## 4. State matrix (FR-012 — 6 demo di showcase)

| State | Tampilan | Aksi | Catatan a11y |
|---|---|---|---|
| Empty | `empty-state` "Belum ada struktur" + CTA [Buat root] | buat root → kartu root langsung inline-edit, fokus ke input | `role="status"`; CTA keyboard-reachable |
| Loading | skeleton kanvas: 8 kartu placeholder + konektor placeholder + teks SR "Memuat struktur…" | — (toolbar disabled sementara) | `aria-busy="true"` pada kanvas; skeleton bukan spinner saja |
| Error invalid | panel di kanvas: penyebab spesifik (duplikat / parent hilang / siklus / root ≠ 1) + id pelanggar pertama + [Salin detail] | perbaiki data / [Muat contoh] | `role="alert"`; pesan teks + id, bukan warna saja |
| Error eksternal (`error` prop) | `alert` di atas kanvas; diagram terakhir tetap bila ada | retry milik konsumen | `role="alert"` |
| Success berisi | kanvas + controls + minimap aktif; tambah/pindah/hapus/undo/cari aktif | lihat §2–§3 + §5 | `role="application"` kanvas + pohon SR `role="tree"`; live region |
| Success contoh 40 orang | dataset 40 orang / 4 tingkat / 4 departemen (FR-018) | tombol [Muat contoh] 1 klik | sama + meta "40 orang · 4 departemen" |

Semua 6 teramati di showcase S-005.34 via panel demo (di luar komponen).

## 5. Keyboard & fokus (FR-011)

Order: toolbar → pencarian → kanvas → kartu terpilih (gagang `+` ikut urutan Tab saat kartu fokus) → controls → minimap (`tabIndex=-1` default, skip-link) → panel detail (bila terbuka) → pohon SR.

| Konteks | Tombol | Aksi |
|---|---|---|
| Kanvas fokus | Panah | pan 40px |
| Kanvas fokus | `+` / `-` / `0` | zoom in / out / reset 100% |
| Kanvas fokus | `F` | fit-view |
| Kartu fokus | `Enter` | pilih → `onSelect` + sorot |
| Kartu fokus | `F2` / `Ctrl+Enter` | inline-edit (FR-005); Enter simpan, Esc batal |
| Kartu fokus | `Shift+Enter` | buka panel detail S-005.34.01 (alternatif: Tab ke tombol [≡] → Enter) |
| Kartu fokus | `Space` | expand/collapse |
| Kartu fokus | `Delete`/`Backspace` | buka M-008 |
| Global | `Ctrl+Z` / `Ctrl+Y` (`Ctrl+Shift+Z`) | undo / redo (FR-009) |
| Gagang `+` fokus | `Enter`/`Space` | tambah bawahan/sejawat → inline-edit |

Pohon SR internal: `role="tree"`/`treeitem`/`group` + `aria-level`/`aria-expanded`/`aria-selected`; roving tabindex; `↑↓→←`/`Home`/`End` reuse pola 003; semua operasi (tambah/pindah/hapus) tersedia via tombol per baris — jalur SR lengkap, bukan duplikat visual saja.

Pengumuman live region (`polite`; `assertive` hanya error hapus/invalid): jumlah hasil cari, "Node X dipindah ke Y", "Ditambah — Urungkan", "Perubahan dibatalkan/diulang", error siklus, level zoom ("%").

Focus ring `primary` offset 2px terlihat light & dark. `prefers-reduced-motion`: durasi 0, pinch/animasi xyflow mati (FR-016).

## 6. Responsive

| Breakpoint | Perilaku |
|---|---|
| ≥ lg | Kanvas + panel 320px berdampingan; minimap tampil; toolbar satu baris |
| md–lg | Panel 280px; toolbar wrap dua baris |
| < md | Panel jadi bottom-sheet overlay; minimap sembunyi (toggle); toolbar ikon + pencarian pindah baris; kanvas min-height 320; gagang `+` tetap ≥ 44px hit-area (FR-016) |

Fungsi yang tidak boleh hilang di kecil: tambah inline, edit, hapus/pindah (via panel/dialog), cari, collapse, pan/zoom, semua state §4.

## 7. Light/dark parity + token

Hanya token semantik: permukaan `card`/`background`, garis/edge `border`, teks `foreground`/`muted-foreground`, aksi/selected/highlight/fokus `primary`, aksen `success/warning/info/destructive`, drag valid/invalid `success`/`destructive` selalu + teks (bukan warna saja). Tanpa token baru (FR non-goals). Audit: tiap pasangan teks ≥ 4.5:1 + grafis ≥ 3:1 via validator `@ds/tokens` (`pnpm test:tokens`), tabel audit di story implementasi (FR-017). Strip aksen di atas `card` + badge + controls + minimap diverifikasi ulang light & dark.
