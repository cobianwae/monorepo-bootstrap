# Wireframe — Diff Viewer (S-005.36)

Status: approved (gate 2 — 2026-11-21)
PRD: `docs/prd/013-diff-viewer.md` (approved, gate 1) · Flow: `docs/design/flows/diff-viewer.mmd`
Layar: `S-005.36` Diff Viewer (`/patterns/diff-viewer`)
Komponen: `data-display/diff-viewer.tsx` (baru, PRD 013) + util `data-display/diff-viewer-parser.ts` (normalisasi hunk via `diff`)

## Keputusan kunci gate 2

| # | Keputusan | Alasan |
|---|---|---|
| K1 | Input ganda: string unified-diff mentah + struktur hunk JSON; normalisasi di util co-located via `diff` (jsdiff), render milik sendiri | OQ#1 answered gate 1; render sendiri agar token-first dan kontras terkontrol |
| K2 | Tanpa syntax highlighting v1 — hanya badge label bahasa bila diketahui (mis. `ts`, `css`) | Decided OQ#2; regex ad-hoc rawan kontras + melebar scope; FR-003 `should` |
| K3 | Batas render default 500 baris + tombol "Muat 500 baris lagi (N tersisa)"; hunk konteks terlipat default | Decided OQ#3 (usulan PRD 500); FR-007 mitigasi file besar |
| K4 | Split di `≥md` berdampingan; `<md` fallback otomatis ke stacked-unified (satu kolom + badge Lama/Baru per baris) | Keterbacaan mobile; dua kolom sempit merusak gutter sejajar |
| K5 | Dependency `diff` (jsdiff) hanya untuk parsing; bila approval ditolak, fallback parser minimal internal (risiko edge-case dicatat di story) | Butuh konfirmasi eksplisit per CONVENTIONS — lihat §8 |

## 1. Shell (desktop ≥ md)

Shell-first: header halaman, toolbar diff, daftar file, daftar hunk SR. Panel demo showcase di bawah (bukan bagian pola).

```text
S-005.36 Diff Viewer (/patterns/diff-viewer)
├── PageHeader: judul "Diff Viewer" + deskripsi + badge [3 file] [+120 −45]
├── Toolbar diff (satu baris, wrap di mobile)
│   ├── Kiri: segmented [Unified|Split] + info "3 file · 5 hunk"
│   └── Kanan: [Hunk ◀ 2/5 ▶] + [Lipat semua] [Buka semua]
├── Daftar file (satu card per file)
│   ├── Header file: [▸] path mono + badge bahasa + [+N] [−M] (FR-004, §2.1)
│   └── Daftar hunk: baris unified/split + header hunk collapsed (§2.2–§2.3)
├── Daftar hunk SR (visually-hidden `ol` + live region posisi, FR-005 §4)
└── Panel demo showcase (DemoSection, bukan pola): dataset 3-file/besar/invalid/kosong,
    pemicu loading/empty/error, toggle light/dark, resep slot komentar 15 baris
```

- Nomor langkah end-to-end (FR-009): `ol` 1 buka 3 file → 2 toggle unified/split → 3 lipat/buka hunk → 4 navigasi hunk keyboard → 5 uji file besar "muat lebih banyak".

## 2. Anatomy

### 2.1 Header file (FR-004)

```text
┌──────────────────────────────────────────────────┐
│ ▸ src/auth/middleware.ts        [ts] [+120] [−45]│  ▸ = lipat/buka file (aria-expanded)
└──────────────────────────────────────────────────┘
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Tombol lipat | `button` ghost + `aria-expanded` | pointer + `Enter`/`Space`; fokus tetap di header |
| Nama file | teks mono truncated + `title` penuh | path relatif; bukan URL git provider (non-goal PRD) |
| Label bahasa | `base/badge` mono | tampil bila diketahui; tanpa pewarnaan sintaks (K2) |
| Ringkasan +/- | `base/badge` `success`/`destructive` + angka | angka selalu tampil — bukan warna saja |
| Aksi file | tombol lipat/buka semua hunk file ini | `aria-label "Lipat semua hunk <file>"` |

### 2.2 Baris unified (FR-001 + FR-002)

```text
 lama baru │ konten
 ─── ─── ──┼────────────────────────────────
  12   12 │   konteks tidak berubah
  13    – │ − baris dihapus (bg destructive muted + prefix −)
   –   14 │ + baris ditambah (bg success muted + prefix +)
 ─── ─── ──┼────────────────────────────────
   @@ hunk 2/5 · 8 baris konteks dilipat · [Tampilkan]   │  header hunk collapsed
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Gutter ganda | internal | `lama` + `baru` selalu dua kolom; tambah = lama `–`, hapus = baru `–`; tidak bergeser antar mode (FR-002) |
| Prefix `+`/`−`/spasi | teks, bukan warna saja | SR: "Baris 14 ditambah: …" / "Baris 13 dihapus: …" (§4) |
| Header hunk collapsed | `button` full-row ≥ 44px | `aria-expanded="false"` + hitungan; konteks terlipat default (FR-004) |
| Baris fokus hunk aktif | ring `primary` pada hunk hasil navigasi `n`/`p` | lihat §4 |

### 2.3 Baris split (FR-001 + FR-002)

Dua kolom berdampingan; kiri = lama (hapus/konteks), kanan = baru (tambah/konteks). Pasangan baris sejajar tinggi sama (`align-items: stretch`); tiap kolom punya gutter bernomor sendiri; sel kosong (blank) untuk sisi tanpa baris.

```text
┌─ LAMA ────────┬─ BARU ─────────┐
│ 13 − dihapus  │   (kosong)     │  del kiri, blank kanan
│ (kosong)      │ 14 + ditambah  │  blank kiri, add kanan
│ 12  konteks   │ 12  konteks    │  konteks dua sisi
└───────────────┴────────────────┘
```

Di `<md` otomatis stacked-unified: satu kolom + badge kecil `Lama`/`Baru` per baris (K4). Toggle segmented tetap tampil — user tahu mode dipilih, layout yang menyesuaikan.

### 2.4 Slot komentar (FR-006 `could`)

```ts
renderComment?: (loc: { file: string; hunkId: string; lineKey: string; type: 'add' | 'del' | 'context' }) => ReactNode;
```

- Dirender di bawah baris terkait (unified: full-row; split: di bawah kolom pemilik sisi).
- Tanpa state komentar internal — murni integration point; sistem komentar milik konsumen (non-goal PRD).
- Baris dengan slot = focusable (`Tab` mencapai slot); baris tanpa slot = tidak focusable (roving tidak perlu).
- Scenario showcase menyuntik box komentar mock 15 baris (FR-009).

### 2.5 Varian `cva`

| Varian | Nilai | Perilaku |
|---|---|---|
| `mode` | `unified` / `split` | satu kolom vs dua kolom (§2.2–§2.3) |
| `lineType` | `context` / `add` / `del` / `hunk-header` / `blank` | warna + prefix + label SR |
| state | `default` / `active-hunk` / `collapsed` | ring hunk aktif; header collapsed |

State baris:

| State | Tampilan | Trigger |
|---|---|---|
| Context | `background`, gutter `muted-foreground` | `type=context` |
| Add | bg `success/10` + border-l `success` 2px + prefix `+` | `type=add` |
| Del | bg `destructive/10` + border-l `destructive` 2px + prefix `−` | `type=del` |
| Active hunk | ring `primary` 1px pada hunk hasil navigasi | `n`/`p` atau tombol ◀ ▶ |
| Collapsed | header `muted/40` + "N baris dilipat" + [Tampilkan] | default konteks; toggle manual |

## 3. State matrix (FR-008)

| State | Tampilan | Aksi | Catatan a11y |
|---|---|---|---|
| Empty (tidak ada perubahan) | `empty-state` "Tidak ada perubahan" + meta "3 file identik" | pilih revisi lain (konsumen) / [Muat contoh] | `role="status"` |
| Loading | skeleton: header file + 8 baris placeholder + teks SR "Memuat diff…" | — (toolbar disabled sementara) | `aria-busy="true"` pada region diff; bukan spinner saja |
| Error patch invalid | `alert destructive`: "Patch tidak valid" + penyebab (baris N + alasan) + [Salin detail] | perbaiki input / [Muat contoh] | `role="alert"`; pesan teks + lokasi, bukan warna saja |
| Success multi-file | header + hunk expanded/collapsed + toggle aktif | lihat §2 + §4 | label SR per baris (§4) |
| File besar (2000+ baris) | render 500 pertama + tombol "Muat 500 lagi (N tersisa)" + hunk terlipat | muat bertahap; fokus tidak hilang | live region polite jumlah ter-render ("500 dari 2000 baris") |

Semua teramati di showcase S-005.36 via panel demo (di luar komponen).

## 4. Keyboard & fokus (FR-005)

Order: segmented mode → navigasi hunk [◀ ▶] → lipat/buka semua → header file → header hunk → slot komentar → panel demo.

| Konteks | Tombol | Aksi |
|---|---|---|
| Global diff | `n` / `p` | hunk berikut/sebelumnya + live "Hunk 2 dari 5: `<file>`" |
| Header hunk/file | `Enter` / `Space` | lipat/buka; fokus tetap di header |
| Segmented mode | `Tab` + panah | ganti unified/split; fokus tetap di kontrol |
| Baris berkomentar | `Tab` | fokus masuk slot `renderComment` |
| Tombol ◀ ▶ | `Tab` + `Enter` | setara `p`/`n` untuk pointer/SR |

- Live region `polite` untuk posisi hunk dan jumlah baris; `assertive` hanya error parse.
- Baris add/del bernama SR: `aria-label "Baris 14 ditambah: <konten>"` / `"Baris 13 dihapus: <konten>"`; konteks: `"Baris 12: <konten>"`.
- Daftar hunk SR: `ol` visually-hidden, tiap item tombol "Hunk N: `<file>` +A −D" — setara non-visual navigasi `n`/`p`.
- Fokus ring `primary` 2px offset 2 light & dark. `prefers-reduced-motion`: transisi lipat mati. Touch: header hunk/file ≥ 44px; tombol ◀ ▶ ≥ 44px.
- Error tidak hanya warna: prefix + label + ikon selalu menyertai bg add/del.

## 5. Responsive

| Breakpoint | Perilaku |
|---|---|
| `≥md` | Split dua kolom berdampingan; unified satu kolom penuh; toolbar satu baris |
| `<md` | Split → stacked-unified otomatis; toolbar wrap dua baris; header file stacked (nama + badge baris kedua); tombol ◀ ▶ tetap ≥ 44px |

Fungsi yang tidak boleh hilang di kecil: toggle mode, lipat/buka file+hunk, navigasi hunk + live region, slot komentar, semua state §3.

## 6. Light/dark parity + token

Hanya token semantik, tanpa token baru:

| Elemen | Token |
|---|---|
| Permukaan card/baris | `card`, `background` |
| Garis/gutter | `border`; teks gutter `muted-foreground` |
| Teks konten | `foreground` (add/del memakai teks normal di atas bg muted — bukan teks berwarna — agar kontras aman) |
| Add | bg `success/10` + border-l `success` + prefix/ikon `success` + teks |
| Del | bg `destructive/10` + border-l `destructive` + prefix/ikon `destructive` + teks |
| Hunk collapsed | `muted/40` + teks `muted-foreground` |
| Hunk aktif/fokus ring | `primary` |
| Badge +/−/bahasa | `success` / `destructive` / `muted` + angka (bukan warna saja) |

Audit: tiap pasangan teks ≥ 4.5:1, grafis (border add/del, ring, ikon prefix) ≥ 3:1 via validator `@ds/tokens` (`pnpm test:tokens`) light & dark saat implementasi; tabel audit di story (FR-003). Risiko merah/hijau dark mode (latar PRD) dimitigasi bg muted + teks `foreground` + prefix non-warna.

## 7. FR Coverage

| FR | Layar | Flow | Wireframe |
|---|---|---|---|
| FR-001 unified + split toggle | S-005.36 | diagram 2 | §1–§2.2–§2.3 |
| FR-002 nomor lama & baru sejajar | S-005.36 | diagram 2 | §2.2–§2.3 gutter ganda/sejajar |
| FR-003 token + tunda highlight | S-005.36 | — (audit implementasi) | K2 + §6 |
| FR-004 header file + collapse hunk/file | S-005.36 | diagram 1–2 | §2.1 + collapsed §2.5 |
| FR-005 keyboard hunk + live region | S-005.36 | diagram 3 | §4 penuh |
| FR-006 slot komentar render prop | S-005.36 | diagram 3 | §2.4 |
| FR-007 file besar: collapse + batas + muat lagi | S-005.36 | diagram 1 + 2 | K3 + §3 baris terakhir |
| FR-008 loading/empty/error | S-005.36 | diagram 1 | §3 matrix |
| FR-009 showcase interaktif light & dark | S-005.36 | diagram 4 (demo) | §1 + §3 + `ol` 5 langkah |

OQ PRD: #1 answered gate 1 (K1); #2 decided tunda highlight ringan v1 (K2); #3 decided batas 500 baris (K3).

## 8. Butuh konfirmasi

| # | Item | Rekomendasi |
|---|---|---|
| C1 | Dependency `diff` (jsdiff) di `packages/ui` — konsep disetujui gate 1 via PRD constraint, tetapi penambahan `package.json` butuh approval eksplisit per CONVENTIONS | Setujui saat story implementasi; fallback parser minimal internal bila ditolak |
| C2 | Batas 500 baris (K3) + tanpa highlight v1 (K2) | Disetujui bersama gate 2 ini; perubahan = revisi desain, bukan edit diam-diam |
