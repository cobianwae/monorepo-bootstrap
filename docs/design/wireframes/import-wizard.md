# Wireframe — Import Wizard CSV (S-005.37)

Status: approved (gate 2 — 2026-11-21)
Spec: `docs/design/import-wizard.md` · Flow: `docs/design/flows/import-wizard.mmd` · PRD: `docs/prd/014-import-wizard.md` (approved gate 1)
Layar: `S-005.37` Import Wizard (`/patterns/import-wizard`) + child `S-005.37.01–.04` (4 langkah)

## 1. Shell (desktop ≥ md)

Shell-first: stepper atas, area langkah, footer navigasi. Panel demo showcase di bawah (bukan bagian pola).

```text
S-005.37 Import Wizard (/patterns/import-wizard)
├── PageHeader: judul "Import Wizard" + deskripsi + badge [papaparse] + [template CSV]
├── Card wizard
│   ├── Stepper (S-005.24 compose): [1 Upload] → [2 Mapping] → [3 Validasi] → [4 Konfirmasi]
│   │   └── langkah selesai = centang; aktif = aria-current=step; depan = non-klik
│   ├── Judul langkah (h2 tabindex=-1, fokus pindah tiap ganti langkah)
│   │   └── + live region "Langkah N dari 4: <nama>"
│   ├── Area langkah (satu tampil sesuai step)
│   │   ├── S-005.37.01 Upload: dropzone + [Pilih file] + textarea tempel + delimiter override + [Unduh template]
│   │   ├── S-005.37.02 Mapping: tabel kolom CSV → dropdown target + badge wajib + pesan duplikat
│   │   ├── S-005.37.03 Validasi: filter [Semua|Hanya error] + tabel pratinjau + sel error + pesan per sel
│   │   └── S-005.37.04 Konfirmasi: stat valid/gagal/dilewati + radio lewati/gagalkan + [Impor N baris]
│   ├── Footer navigasi: [Kembali] kiri + kanan [Lanjut]/[Impor N baris]; Lanjut disabled + alasan bila gate belum lolos
│   └── Status strip (demo): file aktif + delimiter + jumlah baris + opsi saat ini
├── Panel demo showcase (DemoSection, bukan pola): dataset valid/invalid/kosong/besar,
│   pemicu loading/parsing-error/encoding-error, toggle light/dark, resep onComplete 15 baris
└── Catatan implementasi (3 kolom): papaparse worker/streaming / validasi deklaratif / fokus + live region
```

- Nomor langkah end-to-end (FR-011): `ol` 1 unggah `anggota.csv` → 2 petakan "Nama Lengkap" → `name` → 3 perbaiki 2 baris merah → 4 konfirmasi (200 valid, 2 dilewati) → submit.
- Template contoh + file contoh valid/invalid hidup di panel demo; bukan bagian pola.

## 2. Anatomy

### 2.1 S-005.37.01 Upload (FR-001 + FR-007 + FR-010)

```text
┌────────────────────────────────────────────┐
│ Unggah file CSV                      [ⓘ]  │  h2 + deskripsi format/ukuran
│ ┌────────────────────────────────────────┐ │
│ │   Seret file ke sini atau              │ │  dropzone: input file + drag state
│ │   [Pilih file .csv]                    │ │  accept=.csv,text/csv; keyboard = tombol biasa
│ └────────────────────────────────────────┘ │
│ atau Tempel isi CSV:                       │
│ ┌────────────────────────────────────────┐ │
│ │ nama,email⏎ Budi,budi@…                │ │  textarea mono 6 baris (alternatif paste)
│ └────────────────────────────────────────┘ │
│ Delimiter: (•) Otomatis  ( ) ,  ( ) ;  ( ) tab│  radio override; default auto-detect
│ Batas: maks 5 MB / 10.000 baris (peringatan)│  teks + link template
│ [Unduh template CSV]                       │  header + 1 baris contoh (FR-007)
│ pesan error/empty/loading di sini (§4)     │
└────────────────────────────────────────────┘
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Dropzone + tombol | compose `form/file-input` + `base/button` | validasi ekstensi + ukuran + baca header dulu; tolak `.xlsx` dengan pesan "v1 CSV saja" (FR-010) |
| Tempel CSV | `base/textarea` mono | alternatif paste; prioritas bila file + tempel = file menang + pesan |
| Delimiter override | `base/radio-group` | bawaan papaparse auto-detect; manual bila gagal (OQ#3 answered) |
| Template | `base/button` outline + Blob | nama `template-<entitas>.csv`; isi = header target + 1 contoh (FR-007) |
| Batas file | teks + `feedback/alert` warning | >5 MB / >10k baris = warning + lanjut streaming; bukan blokir keras (OQ#1) |

### 2.2 S-005.37.02 Mapping (FR-002 + FR-006)

```text
Kolom CSV              → Target field        Wajib
─────────────────────────────────────────────────────
"Nama Lengkap"         → [name        ▾]     ● wajib ✓
"Email"                → [email       ▾]     ● wajib ✓
"Tgl Lahir"            → [dob         ▾]     ○ opsional
"Telepon"              → [Abaikan     ▾]     ○
─────────────────────────────────────────────────────
⚠ "No. Anggota" belum terpetakan ke field wajib `memberId`
[Lanjut ke validasi] (disabled sampai wajib lengkap)
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Baris mapping | `table` 3 kolom + `form/select` (atau combobox bila >20 field) | satu baris per header CSV; target = field deklaratif konsumen |
| Auto-suggest | util normalisasi + kamus sinonim | `lower→trim→hapus _/-` + kamus (`nama→name`, `surel/e-mail→email`, `tgl lahir→dob`); skor tampil sebagai "disarankan" |
| Badge wajib | `base/badge` + teks | wajib = dot `destructive` + teks "wajib"; bukan warna saja |
| Duplikat target | pesan inline | dua kolom → target sama = tolak + pesan "sudah dipakai"; abaikan boleh ganda |
| Gate lanjut | footer + pesan | Lanjut disabled + daftar wajib hilang; coba lanjut via keyboard → fokus pindah ke pesan (FR-002) |

Kontrak field target (dari spec §2):

```text
field = { key, label, required, type, pattern?, unique?, example? }
aturan custom konsumen = fn(value, row) → pesan | null (FR-006)
```

### 2.3 S-005.37.03 Validasi (FR-003 + FR-006)

```text
Filter: (•) Semua (124)  ( ) Hanya error (2)        [Unduh template] [Unggah ulang]
┌───┬──────────────┬──────────────────┬────────────┐
│ # │ Nama (name)  │ Email (email)    │ Tgl (dob)  │
├───┼──────────────┼──────────────────┼────────────┤
│ 3 │ Budi         │ budi@x ✗duplikat │ 1990-01-01 │
│   │              │ "Email ganda di  │            │
│   │              │  baris 3 & 7"    │            │
│ 5 │ Sari         │ sari@…           │ 32/13 ✗    │
│   │              │                  │ "Tanggal tidak valid (YYYY-MM-DD)" │
└───┴──────────────┴──────────────────┴────────────┘
[Kembali ke mapping]              [Lanjut ke konfirmasi]
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Tabel pratinjau | compose `data-display/data-table` (read-only v1, paginasi 25/baris) | sel error = border + ikon `destructive` + teks pesan di bawah nilai |
| Pesan error | teks Bahasa Indonesia per sel | tipe/wajib/unik/format/pola/custom; `aria-describedby` sel → id pesan (FR-009) |
| Filter error | `segmented-control` atau radio | default Semua; Hanya error membantu 100-an baris (skenario PRD) |
| Aksi perbaiki | tombol kembali + unggah ulang | kembali ke mapping (state terjaga) atau file baru (mapping dipertahankan bila header cocok) |
| Opsi baris gagal | radio di konfirmasi (§2.4) | default lewati; gagalkan = blokir submit (OQ#2) |

Aturan validasi dievaluasi berurutan per sel: wajib → tipe → pola → unik-dalam-file → custom. Satu sel tampilkan pelanggaran pertama + hitungan total di header kolom ("2 error di kolom ini").

### 2.4 S-005.37.04 Konfirmasi (FR-004)

```text
Ringkasan impor
┌─────────┬──────────┬───────────┐
│ ✓ 200   │ ✗ 2 gagal│ ⊘ 0 lewati│  stat-card 3 kolom + teks (bukan warna saja)
│ valid   │          │           │
└─────────┴──────────┴───────────┘
Baris gagal akan: (•) Dilewati  ( ) Gagalkan seluruh impor   ← default lewati (OQ#2)
[ ] Sertakan ringkasan sebagai teks (opsional demo)
[Kembali perbaiki]                    [Impor 200 baris]
→ onComplete(rowsValid) + layar sukses "200 baris siap diproses" + [Mulai ulang]
```

| Bagian | Sumber | Catatan |
|---|---|---|
| Stat ringkasan | `data-display/stat-card` atau 3 `card` | angka + label + ikon; kontras light & dark |
| Opsi gagal | `base/radio-group` | lewati default; gagalkan = submit disabled bila ada error |
| Submit | `base/button` highlight | label hitungan dinamis "Impor N baris"; panggil `onComplete` hanya baris valid |
| Sukses | `feedback/empty-state` sukses + tombol | bukan modal v1; konfirmasi destruktif milik konsumen via `dialog` existing bila perlu |

## 3. State multi-langkah

State global wizard: `file → mapping → validation → option → result`. Mundur tidak menghilangkan state (FR-005); file baru me-reset validasi tapi mencoba mempertahankan mapping.

## 4. State matrix (FR-008)

| State | Tampilan | Aksi | Catatan a11y |
|---|---|---|---|
| Empty upload (belum ada file) | dropzone ilustrasi + "Belum ada file" + CTA Pilih/tempel | pilih file / tempel / unduh template | `role="status"`; CTA keyboard-reachable |
| Empty file (0 baris) | `empty-state` "File kosong — hanya header tanpa baris" + CTA pilih lain | pilih file lain / tempel ulang | `role="status"` |
| Loading parsing | `progress` % + skeleton tabel mapping + teks SR "Memparsing N baris…" | — (navigasi disabled; Batal parsing bila worker) | `aria-busy="true"` + `role="progressbar"`; bukan spinner saja |
| Error format/ukuran | `alert destructive`: "Bukan CSV / melebihi batas" + penyebab | ganti file / ubah delimiter manual | `role="alert"`; pesan teks |
| Error encoding/delimiter | `alert`: "Tidak terbaca — coba delimiter manual atau simpan UTF-8" + tombol delimiter | pilih delimiter manual / unggah ulang UTF-8 | `role="alert"` + fokus ke kontrol delimiter |
| Mapping belum lengkap | pesan wajib + Lanjut disabled | lengkapi mapping | fokus ke pesan saat coba lanjut; `aria-disabled` + alasan |
| Validasi ada error | tabel + sel merah + pesan per sel + filter Hanya error | kembali mapping / unggah ulang / lewati | sel `aria-invalid` + `aria-describedby`; error tidak warna-saja |
| Success siap submit | ringkasan 3 stat + submit hitungan | Impor → `onComplete` | live region "N baris valid siap diimpor" |
| Success selesai | konfirmasi + tombol Mulai ulang | mulai ulang / impor file lain | `role="status"`; fokus ke judul sukses |

## 5. Keyboard & fokus (FR-009)

Order: stepper (klik hanya langkah selesai; panah opsional) → judul langkah `h2 tabindex=-1` → kontrol langkah → footer [Kembali][Lanjut] → panel demo.

| Konteks | Tombol | Aksi |
|---|---|---|
| Global langkah | ganti langkah | fokus pindah ke `h2` + live region "Langkah N dari 4: nama" |
| Stepper | `Tab` + `Enter` | hanya langkah selesai bisa diklik; depan disabled (`aria-disabled` + alasan) |
| Upload | `Tab` ke dropzone/tombol | `Enter/Space` buka picker; drag disertai tombol (tanpa drag-only) |
| Mapping | `Tab` antar select | select native keyboard penuh; `Esc` tutup; duplikat diumumkan live |
| Validasi tabel | `Tab` antar sel/filter | sel error bernama "Baris 3 Email: Email ganda…"; filter radio panah |
| Konfirmasi | `Tab` ke radio/submit | radio panah; submit `Enter`; sukses fokus ke judul |
| Semua error | — | pesan selalu teks + `role=alert/status`; tidak warna-saja |

Fokus ring `primary` 2px offset 2 light & dark. `prefers-reduced-motion`: transisi stepper/progress mati. Touch: dropzone ≥ 48px, select ≥ 44px, tombol footer full-width di mobile.

Screen reader: stepper `nav aria-label="Langkah impor"` + `ol` + `aria-current="step"`; tabel mapping/validasi `table` + `th scope`; sel error `aria-invalid="true"`; perubahan progres via `role="progressbar"` + teks; hasil validasi via live region polite ("2 dari 124 baris error").

## 6. Responsive

| Breakpoint | Perilaku |
|---|---|
| ≥ md | Stepper horizontal 4; mapping tabel 3 kolom; validasi tabel penuh + paginasi; konfirmasi 3 stat sejajar |
| < md | Stepper vertikal ringkas (nomor + judul aktif saja); mapping jadi kartu per kolom (label + select stacked); validasi tabel scroll-x + filter sticky; footer tombol stacked full-width |

Fungsi yang tidak boleh hilang di kecil: unggah/tempel/template, mapping semua kolom, filter error + pesan per sel, ringkasan + submit, semua state §4.

## 7. Light/dark parity + token

Hanya token semantik, tanpa token baru:

| Elemen | Token |
|---|---|
| Permukaan card/dropzone | `card`, `background`, `muted/40` |
| Garis tabel/dropzone | `border`; drag-aktif `primary` + teks |
| Teks | `foreground` / `muted-foreground` |
| Langkah aktif/selesai | `primary` + `primary-foreground`; depan `muted` |
| Error sel/pesan | `destructive` + ikon + teks (bukan warna saja) |
| Sukses stat | `success` + ikon + teks |
| Warning batas | `warning` + teks |
| Fokus ring | `primary` 2px |

Audit: tiap pasangan teks ≥ 4.5:1, grafis (ring, border error, ikon) ≥ 3:1 via validator `@ds/tokens` (`pnpm test:tokens`) light & dark saat implementasi; tabel audit di story.
