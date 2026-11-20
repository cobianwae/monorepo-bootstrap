# Wireframe — Org Chart Editor (S-005.33)

Status: approved (gate 2)
Spec: `docs/design/org-chart-editor.md` · Flow: `docs/design/flows/org-chart-editor.mmd` · PRD: `docs/prd/010-org-chart-editor.md`
Layar: `S-005.33` Org Chart Editor (`/patterns/org-chart-editor`)

## 1. Shell (desktop ≥ md)

Shell tiga zona: toolbar atas, kanvas tengah + inspector kanan (sheet overlay di mobile).

```text
S-005.33 Org Chart Editor (/patterns/org-chart-editor)
├── Toolbar atas (satu baris, wrap di mobile)
│   ├── Kiri: judul + meta ("40 orang · 4 departemen · edited?")
│   ├── Tengah: pencarian (search-input) + live region "3 hasil"
│   ├── Kanan: [tambah child] [orientasi TD/LR] [fit-view] [undo] [redo]
├── Kanvas xyflow (role="application", min-height 480)
│   ├── Layer edge smoothstep token border (di bawah node)
│   ├── Layer node OrgNode (lihat §2) + tombol + di node punya anak
│   ├── Controls token kanan-atas: [−] [%] [+] [reset] + minimap kanan-bawah
│   └── Status strip bawah: zoom level + node terpilih + pesan undo
├── Inspector kanan (sheet, 320px; overlay di <md)
│   ├── Header: avatar besar + nama penuh + jabatan + badge (tanpa truncate)
│   ├── Form: title/subtitle/badge/avatarSrc/accent (FR-006, validasi wajib)
│   ├── Meta: atasan (select pindah) + jumlah bawahan langsung/total
│   └── Aksi: [tambah bawahan] [tambah sejawat] [pindahkan...] [hapus] [undo]
└── Pohon alternatif (tab kedua / visually-hidden): role="tree" reuse 003
```

- Panel demo scenario (pemicu loading/empty/error, ganti dataset) di atas `DemoSection` — bukan bagian komponen.
- Modal: M-004 konfirmasi hapus + M-005 pilih atasan baru (dialog + select + validasi siklus).

## 2. Anatomy node editable

Ukuran seragam `200×72` (reuse 003 agar layout deterministik); konten tengah boleh ellipsis tapi selalu ada tooltip.

```text
┌──────────────────────────────────┐
│ ▸ ┌──┐  Nama Lengkap        [+]  │  ▸ = expander (reuse 003)
│   │avatar│ Jabatan            │  + = tambah child cepat (icon-button 32px)
│   └──┘  [badge]                 │  klik node = pilih + buka inspector (Enter)
└──────────────────────────────────┘  klik kanan / Shift+F10 = context-menu
    └─ strip aksen 3px (token, FR-014)
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Avatar | compose `base/avatar` | fallback inisial |
| Title/subtitle | `node.title`/`subtitle` | ellipsis visual + `title` attr penuh |
| Badge | `base/badge` + aksen | `max-w` + tooltip |
| Expander | internal | reuse 003 (`aria-expanded`) |
| Tombol `+` | internal | `aria-label "Tambah bawahan <nama>"` → fokus ke inspector |
| Menu konteks | `navigation/context-menu` | tambah/pindah/hapus/expand — setara drag |
| Tooltip | `base/tooltip` | nama + jabatan penuh (FR-002) |

State node: default / hover (`primary` lembut) / selected + highlighted (ring `primary`) / collapsed / disabled / drag-target valid (ring `success`) / drag-target invalid (ring `destructive` + pesan).

## 3. Inspector (penyelesai truncation)

- Menampilkan semua field tanpa truncate: nama, jabatan, departemen, id, atasan, path (`CEO / VP / Lead`) via breadcrumb.
- Form edit live: simpan → `onChange` + node update + toast "Disimpan"; validasi kosong → error inline + `aria-invalid`.
- Pindah: select atasan (kecuali diri/descendant, disable + alasan); preview path baru sebelum konfirmasi.
- Hapus: radio [pindahkan anak ke kakek] vs [hapus subtree]; root: tombol hapus disabled + penjelasan.

## 4. State matrix (FR-013)

| State | Tampilan | Aksi | Catatan a11y |
|---|---|---|---|
| Empty | `empty-state` "Belum ada struktur" + CTA [Buat node pertama] | buat root → fokus inspector | `role="status"` |
| Loading | skeleton kanvas + inspector skeleton | — | `aria-busy="true"` |
| Error invalid | panel: penyebab + id pelanggar + [salin detail] | perbaiki data / muat contoh | `role="alert"` |
| Error eksternal | `alert` di atas kanvas; diagram terakhir tetap | retry milik konsumen | `role="alert"` |
| Success | kanvas + inspector + minimap aktif | lihat §1–§3, §5 | tree alternatif + live region |

## 5. Keyboard & fokus

- Order: toolbar → pencarian → kanvas → node terpilih → controls → minimap (opsional, `tabIndex=-1` default) → inspector → pohon alternatif.
- Kanvas fokus: panah = pan, `+`/`-`/`0` zoom/reset, `Delete` = hapus seleksi (konfirmasi M-004), `Ctrl+Z`/`Ctrl+Shift+Z` undo/redo, `F` = fit-view, `Enter` pada node = buka inspector.
- Pohon alternatif reuse 003 penuh (`↑↓→←`, `Home/End`, `Enter` select, `Space` toggle) + tombol aksi per baris (tambah/pindah/hapus) — jalur SR lengkap.
- Pengumuman: hasil pencarian, "Node X dipindah ke Y", "Perubahan dibatalkan", error siklus — via live region `polite` (assertive hanya untuk error hapus/invalid).
- Focus ring `primary` 2px; `motion-safe` untuk animasi edge/node; minimap non-esensial bisa di-skip via `skip-link`.

## 6. Responsive

| Breakpoint | Perilaku |
|---|---|
| ≥ lg | Kanvas + inspector berdampingan; minimap tampil. |
| md–lg | Inspector 280px; toolbar wrap dua baris. |
| < md | Inspector jadi sheet bottom overlay; minimap disembunyikan (toggle); toolbar ikon + pencarian pindah baris; kanvas min-height 320. |

Fungsi yang tidak boleh hilang di kecil: tambah/edit/hapus/pindah (via inspector), pencarian, collapse, pan/zoom.

## 7. Light/dark parity

- Semua via token §6 spec; edge `border` 2px terlihat di kedua mode; drag-target valid/invalid memakai `success`/`destructive` dengan teks pendamping (bukan warna saja).
- Verifikasi: strip aksen di atas `card` + badge + controls + minimap lolos ≥3:1 (non-teks) dan teks ≥4.5:1.
