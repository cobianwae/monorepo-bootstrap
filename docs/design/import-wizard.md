# Spec Desain — Import Wizard CSV

Status: approved (gate 2 — 2026-11-21)
PRD: `docs/prd/014-import-wizard.md` (approved, gate 1)
Layar: `S-005.37` Import Wizard (`/patterns/import-wizard`) + child `S-005.37.01–.04` (4 langkah)
Flow: `docs/design/flows/import-wizard.mmd` · Wireframe: `docs/design/wireframes/import-wizard.md`
Tanggal: 2026-11-21

## 1. Keputusan Desain

| # | Keputusan | Alasan |
|---|---|---|
| D1 | **Composed pattern, tanpa komponen baru `packages/ui` v1.** UI dirakit di showcase dari existing: `form/stepper` + `form/file-input` (+ compose `file-upload` RM-01) + `form/select` + `data-display/data-table` + `feedback/alert` + `base/badge,button,progress,skeleton` + `layout/demo-section`. Logika murni (parse/mapping/validasi/template) sebagai util showcase `_lib` berdampingan dengan route. Promosi ke `packages/ui` hanya bila pola dipakai 3x (3x rule). | Constraints PRD ("komponen bantu sesuai kebutuhan gate 2") + AGENTS.md pola paling sederhana; API wizard sangat domain-spesifik (field beda per konsumen); preseden file-manager/calendar yang naik kelas setelah terbukti. |
| D2 | Parsing via **`papaparse`** (worker + streaming untuk file besar, `header:true`, `skipEmptyLines:'greedy'`, auto-detect delimiter + override manual). Validasi dan UI milik sendiri. Batas default **5 MB / 10.000 baris**: lewat = warning + lanjut streaming, bukan blokir. File kosong (header saja) = empty state. | FR-001, FR-008, FR-010; OQ#1 (batasan) terjawab sebagai peringatan; OQ#3 answered (auto-detect + override). **Butuh approval dependency baru** (§10). |
| D3 | Kontrak deklaratif konsumen: `fields: TargetField[]` + `onComplete(rowsValid)` + `templateName?`. Komponen/pola tidak fetch, tidak persist, tidak transformasi kompleks — hasil akhir via callback; eksekusi milik konsumen (non-goals PRD). | FR-004, FR-006; skenario admin + developer konsumen PRD §User. |
| D4 | Mapping auto-suggest: normalisasi (`lowercase→trim→hapus spasi/_/-`) + kamus sinonim ID (`nama/surel/e-mail/tgl lahir/telepon` → `name/email/dob/phone`) + skor kecocokan; tampil sebagai "disarankan", bisa ditimpa; target duplikat ditolak kecuali "Abaikan". Field wajib belum terpetakan = gate Lanjut terkunci. | FR-002; skenario "Nama Lengkap → name" PRD. |
| D5 | Validasi berurutan per sel: wajib → tipe (`string/number/date/email`) → pola (`pattern`) → unik-dalam-file → custom `validate?`. Satu sel tampilkan pelanggaran pertama Bahasa Indonesia + hitungan per kolom. Baris gagal default **dilewati** (OQ#2); opsi gagalkan = blokir submit bila ada error. | FR-003, FR-006; OQ#2 terjawab (lewati default + ringkasan). |
| D6 | Navigasi stepper 4 langkah; state tiap langkah terjaga saat mundur (file/mapping/validasi/opsi di satu store); file baru me-reset validasi tapi mencoba mempertahankan mapping bila header cocok. Maju dijaga gate per langkah (mapping lengkap → validasi dihitung → konfirmasi). | FR-005; flow 1–4. |
| D7 | Template CSV = `header target + 1 baris contoh` via Blob download (`template-<entitas>.csv`); contoh memakai `field.example` atau generator per tipe. Tombol tersedia di langkah 1 dan panel demo. | FR-007. |
| D8 | State matrix milik pola (bukan komponen): loading parsing (`progress` + skeleton), empty (belum ada / 0 baris), error (format/ukuran/encoding + penyebab + aksi), success (ringkasan + submit). Semua teramati di showcase. | FR-008; wireframe §4. |
| D9 | Aksesibilitas: stepper `nav+ol` + `aria-current=step`; ganti langkah = fokus ke `h2` + live region; sel error `aria-invalid` + `aria-describedby` pesan; tabel `th scope`; progres `progressbar`; error tidak pernah warna-saja. | FR-009; wireframe §5. |
| D10 | Tanpa token baru; hanya semantik (`background/card/border/foreground/muted/primary/destructive/success/warning`). Audit light & dark via `pnpm test:tokens` saat implementasi. | Constraint token-first + FR-011 parity. |
| D11 | Showcase `/patterns/import-wizard` (status `in-design`): `ol` end-to-end + panel demo 6 state + dataset contoh valid/invalid/kosong/besar + resep `onComplete` 15 baris + toggle light/dark. Smoke `pnpm -C apps/showcase build`. | FR-011. |

## 2. API Publik (contract)

Pola composed — contract adalah tipe util + props halaman showcase (bukan API komponen `packages/ui`):

```ts
export type FieldType = 'string' | 'number' | 'date' | 'email';

export interface TargetField {
  key: string;                          // mis. 'name'
  label: string;                        // mis. 'Nama lengkap'
  required: boolean;
  type: FieldType;
  pattern?: RegExp;                     // FR-006 pola
  unique?: boolean;                     // FR-003 unik dalam file
  example?: string;                     // FR-007 baris contoh
  validate?: (value: string, row: Record<string, string>) => string | null; // custom → pesan ID
}

export interface ImportResult {
  rows: Record<string, string>[];       // hanya baris valid (FR-004)
  skipped: number;
  failed: number;
}

export interface ImportWizardConfig {
  fields: TargetField[];                // deklaratif (FR-006)
  onComplete: (result: ImportResult) => void; // FR-004
  maxBytes?: number;                    // default 5_000_000 (OQ#1)
  maxRows?: number;                     // default 10_000 (OQ#1)
  delimiter?: string;                   // override; default auto-detect papaparse
  onError?: (message: string) => void;
  templateName?: string;                // default 'template.csv' (FR-007)
}

// Util murni showcase `_lib` (tanpa UI)
export function suggestMapping(headers: string[], fields: TargetField[]): Record<string, string | null>;
export function validateRows(
  rows: Record<string, string>[],
  mapping: Record<string, string | null>,
  fields: TargetField[],
): { rowErrors: RowError[]; validCount: number };
export function toTemplateCsv(fields: TargetField[]): string;
```

Aturan contract:

- Murni presentasi + komposisi; fetch/persist/eksekusi milik konsumen. `onComplete` hanya baris valid sesuai opsi lewati/gagalkan.
- `validateRows` tidak melempar untuk data invalid — kembalikan struktur error; throw hanya untuk kesalahan programmer (field tak dikenal).
- XLSX ditolak dengan pesan "v1 CSV saja" (FR-010 won't).
- Semua teks pengguna Bahasa Indonesia; pesan error per sel terhubung via `aria-describedby`.

Contoh pesan error (ID):

- wajib: `"Wajib diisi"`
- tipe: `"Bukan angka"` / `"Email tidak valid"` / `"Tanggal tidak valid (YYYY-MM-DD)"`
- pola: `"Format tidak sesuai"`
- unik: `"Ganda di file (baris 3 & 7)"`
- custom: dari `validate?` konsumen.

## 3. Algoritma Parse, Mapping & Validasi

1. Parse: `Papa.parse(file|text, { header:true, skipEmptyLines:'greedy', worker:true, step/stream bila >maxRows, encoding UTF-8 })`; deteksi delimiter otomatis; bila gagal → tawarkan override manual (`, ; tab |`).
2. Header: trim; kolom kosong tanpa nama → `"kolom-N"` + warning; duplikat header → sufiks `#2` + pesan.
3. Suggest: normalisasi header dan `key/label` field (`lower/trim/hapus [\s_\-]`); cocok persis = 100; cocok kamus sinonim = 90; substring = 70; ambil skor tertinggi ≥ 70, sisanya `null` (Abaikan). Tandai "disarankan".
4. Gate mapping: semua `required` field punya ≥1 kolom → boleh Lanjut; duplikat target non-abaikan ditolak.
5. Validasi per baris × kolom terpetakan, urutan wajib→tipe→pola→unik→custom; unik dihitung via peta nilai→baris terlebih dahulu agar pesan menyebut nomor baris lain.
6. Opsi gagal: `skip` (default) → `rows` = valid saja; `fail` → submit disabled bila `failed>0`.
7. Template: header = `fields.map(f=>f.key)`; contoh = `f.example ?? generator(tipe)`; unduh via `Blob('text/csv')`.
8. Memo terhadap `file + mapping + fields + delimiter + option`; target interaksi < 100 ms untuk ±1.000 baris pratinjau (paginasi 25); file >10k baris = streaming + progres + validasi per chunk.

## 4. Varian

Bukan `cva` baru; varian lewat state pola:

| Varian | Nilai | Perilaku |
|---|---|---|
| Langkah | `upload / mapping / validasi / konfirmasi` | stepper + `h2` + footer gate (§2 wireframe) |
| Kontrol state | `loading / empty / error / data` | matrix wireframe §4 (FR-008) |
| Opsi gagal | `skip` (default) / `fail` | konfirmasi §2.4; submit gate (FR-004, OQ#2) |
| Delimiter | `auto` (default) / manual | upload §2.1 (FR-001, OQ#3) |

## 5. A11y & Keyboard (ringkas)

Detail penuh `docs/design/wireframes/import-wizard.md` §5. Inti:

- Stepper `nav aria-label="Langkah impor"` + `ol` + `aria-current="step"`; langkah depan `aria-disabled` + alasan; ganti langkah → fokus `h2 tabindex=-1` + live region "Langkah N dari 4".
- Tabel mapping/validasi `table` + `th scope`; select native keyboard; sel error `aria-invalid` + `aria-describedby` id pesan; pesan teks + ikon, bukan warna saja.
- Progres parsing `role="progressbar"` + teks "Memparsing N baris…"; hasil via live region polite.
- Fokus ring `primary` 2px light & dark; `prefers-reduced-motion` mematikan transisi; touch ≥ 44px, dropzone ≥ 48px, footer stacked di mobile.

## 6. Token & Tema

| Elemen | Token |
|---|---|
| Permukaan card/dropzone | `card`, `background`, `muted/40` |
| Garis tabel/dropzone | `border`; aktif `primary` + teks |
| Teks | `foreground` / `muted-foreground` |
| Langkah aktif/selesai | `primary` / `primary-foreground` |
| Error | `destructive` + ikon + teks |
| Sukses | `success` + ikon + teks |
| Warning batas | `warning` + teks |
| Fokus ring | `primary` |

Tanpa token baru. Pasangan teks ≥ 4.5:1, grafis ≥ 3:1, diverifikasi light & dark saat implementasi (FR-011) via `pnpm test:tokens`.

## 7. FR Coverage

| FR | Cakupan di spec |
|---|---|
| FR-001 | D2, §2 `maxBytes/delimiter`, §3 langkah 1; flow 1; wireframe §2.1 + §4 |
| FR-002 | D4, §2 `suggestMapping`, §3 langkah 3–4; flow 2; wireframe §2.2 + gate |
| FR-003 | D5, §2 `validateRows` + pesan ID; flow 3; wireframe §2.3 |
| FR-004 | D3 + D6, §2 `ImportResult/onComplete` + opsi; flow 4; wireframe §2.4 |
| FR-005 | D6; flow 1–4 jalur kembali; wireframe §3 state terjaga |
| FR-006 | D3 + D5, §2 `TargetField.validate/pattern/unique`; flow 2–3; wireframe §2.2–2.3 |
| FR-007 | D7, §2 `toTemplateCsv/templateName`, §3 langkah 7; flow 1 + 4; wireframe §2.1 |
| FR-008 | D8; flow 1; wireframe §4 matrix |
| FR-009 | D9 + §5; flow 1–4 fokus/live; wireframe §5 |
| FR-010 | §2 aturan tolak XLSX; flow 1; wireframe §2.1 pesan "v1 CSV saja" |
| FR-011 | D11 + §8 scenario S-005.37 + `ol` + smoke build |

## 8. Rencana Scenario Showcase (S-005.37)

- Halaman `/patterns/import-wizard` baru (status `in-design`): card wizard 4 langkah + footer + status strip, dengan dataset contoh: `anggota-valid.csv` (200 baris), `anggota-invalid.csv` (2 baris merah: email duplikat + tanggal invalid), `kosong.csv` (header saja), sampel besar untuk progres.
- Kontrol demo (panel showcase, di luar pola): pemicu loading/parsing-error/encoding-error/empty, dataset valid/invalid, toggle delimiter auto/manual, radio lewati/gagalkan, toggle light/dark, kotak resep `onComplete` 15 baris tersalin.
- `data-testid`: `iw-stepper`, `iw-dropzone`, `iw-paste`, `iw-template`, `iw-mapping-row-<header>`, `iw-validation-table`, `iw-filter-all|error`, `iw-summary`, `iw-submit`, `iw-success`.
- Smoke: `pnpm -C apps/showcase build`. Light & dark parity; handler demo mock (log/toast) tanpa mengubah util pola.

## 9. Out of Scope (sesuai PRD non-goals)

- Parsing XLSX (FR-010 won't) — iterasi berikut.
- Import langsung ke DB/API — hasil via `onComplete`; eksekusi milik konsumen.
- Transformasi kompleks (formula, join antar file).
- Penjadwalan impor berulang (one-shot v1).
- Mengganti `FileUpload` — dipakai sebagai compose langkah upload.

## 10. Open Questions & Butuh Konfirmasi

| # PRD | Rekomendasi design | Butuh |
|---|---|---|
| OQ#1 batas 5 MB / 10.000 baris | Warning + lanjut streaming, bukan blokir; file besar = progres + chunk | none — dibawa ke gate 2 sebagai risiko; konfirmasi saat review story bila batas diubah |
| OQ#2 lewati vs gagalkan | Default **lewati** + ringkasan; opsi gagalkan memblokir submit | none — dibawa ke gate 2 sebagai risiko |
| OQ#3 delimiter | Answered gate 1: auto-detect + override manual | none |
| Dep baru | **`papaparse`** untuk FR-001: standar industri CSV (worker + streaming + quote/delimiter); validasi + UI tetap milik sendiri | **approved user 2026-11-21**: setujui `papaparse` per CONVENTIONS |
| Komponen baru | Tidak ada `packages/ui` baru v1 (D1 composed); promosi hanya bila 3x reuse | none — dicatat agar story tidak melebar ke `form/import-wizard.tsx` tanpa approval |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-21 | Draft gate 2: D1–D11, contract util + showcase, algoritma parse/mapping/validasi, 4 flow, wireframe S-005.37.01–.04 + state matrix, FR-001–FR-011 coverage, rencana S-005.37 |
