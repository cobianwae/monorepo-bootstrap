# Wireframe — Permission Matrix (S-005.41)

Status: approved (gate 2 — 2026-11-21)
PRD: `docs/prd/018-permission-matrix.md` (approved, gate 1) · Flow: `docs/design/flows/permission-matrix.mmd`
Layar: `S-005.41` Permission Matrix (`/patterns/permission-matrix`)
Komponen: `data-display/permission-matrix.tsx` (baru, PRD 018) + tipe `data-display/permission-matrix-types.ts` (co-located, nested record + diff)

## Keputusan kunci gate 2

| # | Keputusan | Alasan |
|---|---|---|
| K1 | OQ#1 decided: `value` = nested record `Record<RoleId, Record<ResourceId, boolean>>`; diff = daftar `{role, resource, from, to}`; `onValueChange(next, diff)` dipanggil sekali per aksi | Usulan PRD; akses sel `value[role][resource]` O(1) tanpa scan array; diff eksplisit untuk banner + reset; alternatif array grant ditolak agar toggle massal tidak perlu filter tiap render |
| K2 | OQ#2 decided: FR-010 sel bertingkat (Lihat/Ubah/Hapus per sel) **tidak masuk v1**; desain mencatat slot `renderCell` sebagai integration point + catatan upgrade ke `select` tanpa mengubah grid | PRD `could`; sel boolean + checkbox menjaga scope + keyboard grid sederhana; bila dibutuhkan, story lanjutan memakai pola yang sama tanpa revisi shell |
| K3 | OQ#3 decided: grid scroll horizontal + header sticky (header kolom sticky atas, kolom resource sticky kiri); batas wajar v1 = 5×8 demo, teruji sampai 20 kolom tanpa kolom hilang | Usulan PRD; sticky menjaga asosiasi header saat scroll; tanpa virtualisasi v1 (di luar scope; bila 50+ kolom, CR terpisah) |
| K4 | Tanpa dependency baru (disengaja): compose `base/checkbox` (Radix, `checked="indeterminate"`), `base/badge`, `feedback/empty-state`, `feedback/alert`, `overlay/tooltip`, `base/button`, `base/skeleton` | PRD constraints gate 1; tidak ada standar industri matriks otorisasi; tidak butuh approval dependency per CONVENTIONS |
| K5 | Header massal memakai checkbox indeterminate sungguhan (bukan tombol biasa): `aria-checked="mixed"` + strip visual + label SR "sebagian" | FR-002 acceptance "indeterminate benar"; Radix mendukung `mixed`; error/indikasi tidak hanya warna (strip + label) |

## 1. Shell (desktop ≥ md)

Shell-first: header halaman, banner dirty, grid matriks, legenda kunci. Panel demo showcase di bawah (bukan bagian pola).

```text
S-005.41 Permission Matrix (/patterns/permission-matrix)
├── PageHeader: judul "Permission Matrix" + deskripsi + badge [5 role · 8 resource]
├── Banner dirty (hanya saat dirty, FR-005 §2.4)
│   └── [badge N] "N perubahan belum disimpan" + [Lihat daftar] + kanan [Reset] [Simpan]
├── Card grid (role=grid, aria-label "Matriks izin role dan resource")
│   ├── Header kolom sticky: [☐ semua] | [☐ Admin] [◐ Editor] [☐ Viewer] …   ← ☐/☑/◐ = kosong/penuh/indeterminate
│   ├── Baris per resource: [☐ Publikasi] | [☑][☑][🔒] …   ← 🔒 = terkunci + tooltip alasan
│   │   └── sel = checkbox; header baris/kolom = checkbox massal
│   └── Footer grid: "40 sel · 3 terkunci" + legenda [◐ = sebagian] [🔒 = terkunci kebijakan]
├── Daftar perubahan (collapsible di bawah banner, bukan modal): tiap item "Editor × Hapus: mati → menyala" + [Reset baris ini]
├── Daftar keyboard SR (visually-hidden + rincian visible): panah / Space / Enter header / shortcut baris-kolom (FR-006 §5)
└── Panel demo showcase (DemoSection, bukan pola): dataset 5×8 + kunci "Viewer × Hapus" + dirty 3 sel,
    pemicu loading/empty/error, toggle light/dark, resep controlled 15 baris
```

- Nomor langkah end-to-end (FR-009): `ol` 1 buka 5×8 → 2 klik header "Editor" (semua menyala) → 3 coba toggle "Viewer × Hapus" terkunci (ditolak + tooltip) → 4 ubah 3 sel → 5 tinjau banner + reset/simpan.

## 2. Anatomy

### 2.1 Grid + header terasosiasi (FR-001)

```text
                │ ☐ semua │ ☑ Admin │ ◐ Editor │ ☐ Viewer │ …
────────────────┼─────────┼─────────┼──────────┼──────────┼───
☐ Publikasi     │   ☑     │   ☑     │    ☑     │    ☐     │
◐ Artikel       │   ☑     │   ☑     │    ☐     │    🔒     │  🔒 = disabled + "Dikunci kebijakan X"
☐ Hapus         │   ☐     │   ☐     │    ☐     │    🔒     │
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Grid | `role="grid"` + `aria-label` + `aria-busy` saat loading | baris `role="row"`; header kolom `role="columnheader"` + `scope="col"`; header baris `role="rowheader"` + `scope="row"`; sel `role="gridcell"` berisi checkbox (FR-001 test: scope benar) |
| Header kolom/baris | `base/checkbox` dengan `checked` boolean + `"indeterminate"` | klik/Enter/Space = toggle massal baris/kolom; `aria-checked="mixed"` + label SR "sebagian dipilih" saat indeterminate (K5) |
| Header pojok "semua" | checkbox massal seluruh grid | `aria-label "Pilih semua izin"`; indeterminate bila sebagian grid menyala |
| Sel | `base/checkbox` boolean per `value[role][resource]` | `aria-label "<Role> × <Resource>"` + status ("menyala/mati/terkunci: <alasan>"); prefix visual ☑/☐ + label SR, bukan warna saja |
| Sticky | header kolom sticky atas, kolom resource sticky kiri, scroll-x | K3; header tetap terlihat sampai 20 kolom; fokus keyboard tidak hilang saat scroll (scrollIntoView pada sel fokus) |

Kontrak nilai (K1):

```ts
export type RoleId = string;
export type ResourceId = string;
export type PermissionValue = Record<RoleId, Record<ResourceId, boolean>>;
export interface PermissionDiff { role: RoleId; resource: ResourceId; from: boolean; to: boolean }
export interface PermissionMatrixProps {
  roles: { id: RoleId; label: string }[];
  resources: { id: ResourceId; label: string }[];
  value: PermissionValue;                                   // controlled
  onValueChange?: (next: PermissionValue, diff: PermissionDiff[]) => void;
  locked?: (role: RoleId, resource: ResourceId) => string | null; // alasan kunci atau null
  renderCell?: (info: { role: RoleId; resource: ResourceId; checked: boolean; lockedReason: string | null }) => ReactNode; // FR-010 future slot
}
```

- Tanpa state internal nilai: dirty = bandingkan `value` vs `initialValue` (prop atau ref showcase); komponen murni controlled (FR-003 test: `onChange` sekali per aksi + reset milik konsumen via `value` awal).
- `locked` default `() => null`; sel terkunci = `disabled` + tooltip alasan (FR-004); tidak bisa diubah via pointer maupun keyboard (§5).
- `renderCell` v1 tidak dipakai (FR-010 ditunda K2); dicatat agar upgrade select tidak mengubah grid/shell.

### 2.2 Toggle massal + indeterminate (FR-002)

| Aksi | Perilaku |
|---|---|
| Toggle sel | balik satu boolean; lewati bila terkunci (umumkan alasan); hitung ulang header baris + kolom + semua |
| Toggle header baris | bila semua menyala (di luar kunci) → matikan semua yang tidak terkunci; bila sebagian/kosong → nyalakan semua yang tidak terkunci; terkunci tidak berubah |
| Toggle header kolom | sama dengan baris, arah kolom |
| Toggle semua | sama, seluruh grid di luar kunci |
| Indeterminate | tampil bila sebagian (di luar kunci) menyala: visual strip `◐` + `aria-checked="mixed"` + teks SR "sebagian"; bukan warna saja (K5) |

- Satu aksi = satu `onValueChange(next, diff)` dengan diff lengkap (mis. toggle kolom 8 baris = 8 diff di luar kunci); test FR-002/FR-003 memeriksa indeterminate + diff.
- Header tidak ikut dihitung sebagai sel: denominator = sel tidak terkunci saja agar "semua menyala" tidak mustahil saat ada kunci.

### 2.3 Sel terkunci + tooltip (FR-004)

| Bagian | Sumber | Catatan |
|---|---|---|
| Sel terkunci | `base/checkbox` `disabled` + ikon gembok + `overlay/tooltip` | tooltip isi alasan dari `locked()` (mis. "Dikunci kebijakan: Viewer tidak boleh Hapus"); pointer + keyboard ditolak; `aria-disabled="true"` + `aria-label` mencakup alasan |
| Header dengan kunci di anggotanya | tetap aktif; toggle hanya menyentuh sel tidak terkunci | label header mencakup hitungan kunci ("Editor, 1 terkunci") agar ekspektasi jelas |
| Legenda | teks + ikon | "🔒 = terkunci kebijakan" — ikon + teks, bukan warna saja |

### 2.4 Banner dirty + ringkasan + slot aksi (FR-003 + FR-005)

```text
┌──────────────────────────────────────────────────────┐
│ [badge 3] 3 perubahan belum disimpan   [Lihat daftar] │ [Reset] [Simpan] │
└──────────────────────────────────────────────────────┘
▸ Daftar: Editor × Publikasi: mati → menyala   [Reset baris ini]
          Viewer × Artikel: menyala → mati      [Reset baris ini]
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Badge hitung | `base/badge` + angka | tampil hanya saat dirty > 0 (FR-005); angka selalu teks, bukan warna saja |
| Daftar perubahan | collapsible `button` + list | tiap item "Role × Resource: dari → ke" + tombol reset per baris (opsional showcase; reset utama = kembalikan `value` awal) |
| Slot aksi | `base/button` Reset (ghost) + Simpan (highlight) milik konsumen | komponen hanya memanggil `onValueChange`; persist milik konsumen/API (non-goal PRD); banner `role="status"` + live "N perubahan" |
| Reset | kembalikan `value` ke awal; banner hilang; fokus ke grid + live "Perubahan dibatalkan" | test FR-003: reset mengembalikan awal |

### 2.5 Varian `cva`

| Varian | Nilai | Perilaku |
|---|---|---|
| `density` | `default` / `compact` | tinggi baris 44px vs 36px (compact tetap ≥ 36px + sel checkbox hit ≥ 44px via padding; sentuh §5) |
| `cell` | `on` / `off` / `locked` | ☑ `primary`/teks + label; ☐ `muted`; 🔒 `muted` + ikon + tooltip (§2.3) |
| `headerState` | `checked` / `unchecked` / `mixed` | penuh/kosong/indeterminate strip + `aria-checked` (K5) |
| state | `ready` / `loading` / `empty` / `error` | matrix §3 |

## 3. State matrix (FR-007)

| State | Tampilan | Aksi | Catatan a11y |
|---|---|---|---|
| Empty (tanpa role/resource) | `empty-state` "Belum ada role atau resource" + CTA [Muat contoh 5×8] | muat contoh / tambah (konsumen) | `role="status"`; CTA keyboard-reachable |
| Loading | skeleton grid 5×8 (header + sel placeholder) + teks SR "Memuat izin…" | — (grid `aria-busy="true"`, kontrol disabled) | `aria-busy` pada `role=grid`; bukan spinner saja |
| Error (data invalid) | `alert destructive`: "Data izin tidak valid" + penyebab (mis. "role ganda: editor") + [Muat contoh] | perbaiki input / muat contoh | `role="alert"`; pesan teks + penyebab, bukan warna saja; fokus pindah ke alert |
| Success (grid siap) | grid §2.1 + header massal + legenda | toggle §2.2 + keyboard §5 | header scope + label SR per sel (§2.1) |
| Dirty (ada perubahan) | banner §2.4 + badge hitung + daftar | Reset / Simpan (konsumen) | `role="status"`; live "N perubahan belum disimpan"; banner tidak merebut fokus tiap ketik (hanya muncul/hilang) |
| Terkunci semua (edge) | grid tampil + banner info "Semua sel dikunci kebijakan" | tidak ada toggle; keyboard navigasi tetap (§5) | informasi teks, bukan warna saja; sel tetap terasosiasi SR |

Semua teramati di showcase S-005.41 via panel demo (di luar komponen): dataset 5×8, kunci, dirty-3, kosong, invalid, loading.

## 4. Keyboard & fokus (FR-006)

Order: header "semua" → header kolom → header baris → sel baris-per-baris → banner [Lihat][Reset][Simpan] → panel demo.

| Konteks | Tombol | Aksi |
|---|---|---|
| Sel / header fokus | `← → ↑ ↓` | pindah sel/header (roving `tabIndex`; satu Tab masuk grid, panah bergerak di dalam) |
| Sel fokus | `Space` | toggle sel; umumkan "menyala/mati"; terkunci → tolak + umumkan alasan |
| Header baris/kolom/seluruh fokus | `Enter` / `Space` | toggle massal (§2.2); fokus tetap di header; umumkan "N dipilih" |
| Grid | `Home` / `End` | awal/akhir baris; `Ctrl+Home/End` sudut grid |
| Banner | `Tab` + `Enter` | [Lihat daftar] buka/tutup; [Reset]/[Simpan] aksi; sukses fokus kembali ke grid |
| Semua error | — | pesan teks + `role=alert/status`; error tidak warna-saja |

- Grid mengikuti pola `role=grid` APG: roving tabindex (satu sel `tabIndex=0`, sisanya `-1`); panah memindahkan fokus + `tabIndex`; `Tab` keluar grid ke banner (tanpa jebakan fokus).
- Header massal bernama SR: `"Toggle semua izin Publikasi"` / `"Toggle kolom Editor, sebagian dipilih"`; sel terkunci: `"Viewer × Hapus, terkunci: <alasan>"`.
- Live region `polite` untuk toggle + dirty ("3 perubahan belum disimpan"); `assertive` hanya error validasi.
- Fokus ring `primary` 2px offset 2 light & dark. `prefers-reduced-motion`: transisi banner/tooltip mati. Touch: sel + header hit ≥ 44px (compact memakai padding, bukan sel kecil).

## 5. Responsive

| Breakpoint | Perilaku |
|---|---|
| `≥md` | Grid penuh 5×8 tanpa scroll; banner satu baris; legenda sejajar footer |
| `<md` | Scroll-x + header sticky (K3); kolom resource sticky kiri; banner stacked (teks + [Lihat] baris 1, [Reset][Simpan] full-width baris 2); daftar perubahan full-width |

Fungsi yang tidak boleh hilang di kecil: semua toggle massal, semua sel + kunci + tooltip, banner + daftar + reset/simpan, semua state §3, semua keyboard §4.

## 6. Light/dark parity + token

Hanya token semantik, tanpa token baru (K4):

| Elemen | Token |
|---|---|
| Permukaan card/grid | `card`, `background` |
| Garis grid/header sticky | `border`; header sticky `muted/40` + `border` |
| Teks/label/legenda | `foreground` / `muted-foreground` |
| Centang sel/header | `primary` + `primary-foreground` (checkbox existing, tanpa override) |
| Indeterminate strip | `primary` + label SR "sebagian" (bukan warna saja, K5) |
| Terkunci | `muted` + ikon + teks alasan via `tooltip` |
| Banner dirty | `warning/10` bg + border `warning` + teks `foreground` + badge hitung |
| Error | `destructive` + ikon + teks (bukan warna saja) |
| Fokus ring | `primary` 2px offset 2 |

Audit: tiap pasangan teks ≥ 4.5:1, grafis (checkbox, strip indeterminate, ring, ikon kunci) ≥ 3:1 via validator `@ds/tokens` (`pnpm test:tokens`) light & dark saat implementasi; tabel audit di story (FR-008). Risiko strip indeterminate samar di dark dimitigasi `primary` solid + label "sebagian" teks.

## 7. FR Coverage

| FR | Layar | Flow | Wireframe |
|---|---|---|---|
| FR-001 grid + header terasosiasi | S-005.41 | diagram 1 (H) | §1 shell + §2.1 scope + label |
| FR-002 toggle massal + indeterminate | S-005.41 | diagram 2 | §2.2 penuh + K5 |
| FR-003 controlled + dirty + reset | S-005.41 | diagram 4 (A–SV) | §2.1 kontrak + §2.4 banner/reset |
| FR-004 kunci + tooltip | S-005.41 | diagram 2 (K–L) + 3 (K) | §2.3 + legenda |
| FR-005 ringkasan + slot Simpan/Batal | S-005.41 | diagram 4 (B–C) | §2.4 banner + daftar |
| FR-006 keyboard grid | S-005.41 | diagram 3 | §4 penuh |
| FR-007 loading/empty/error | S-005.41 | diagram 1 (B–EMP–ERR) | §3 matrix + dataset demo |
| FR-008 dark + kontras token | S-005.41 | diagram 4 (DK) | §6 token + audit |
| FR-009 scenario interaktif light & dark | S-005.41 | diagram 4 (DM–SM) | §1 `ol` 5 langkah + panel demo |
| FR-010 sel bertingkat select (`could`) | — (ditunda) | — | K2 + `renderCell` slot §2.1 |

OQ PRD: #1 decided K1 (nested record); #2 decided K2 (FR-010 tidak v1); #3 decided K3 (sticky + scroll-x).

## 8. Butuh konfirmasi

| # | Item | Rekomendasi |
|---|---|---|
| C1 | Kontrak `PermissionValue` nested record + `locked()` + `renderCell` slot (K1–K2) | Disetujui bersama gate 2 ini; perubahan = revisi desain |
| C2 | Sticky header + scroll-x tanpa virtualisasi v1; batas uji 20 kolom (K3) | Disetujui bersama gate 2 ini; grid raksasa = CR terpisah |
| C3 | Tanpa dependency baru (K4) — tidak ada approval package | Tidak butuh konfirmasi dependency; catat sebagai keputusan sadar |
