# CR-044 — `primary` dekoratif ke `highlight` (ikon kartu dan callout informatif)

**Status:** draft
**Sumber:** audit halaman tidak koheren (2026-11-22), usulan urutan 2
**Ref:** `docs/design/visual-language.md` (Color Roles: `primary` = aksi, `highlight` = aksen dan identitas; dekorasi dilarang untuk `primary`), `docs/cr/cr-035-seragamkan-halaman-foundations.md`

## Temuan

Pemakaian `primary` sebagai dekorasi (ikon kartu, ikon fitur, callout informatif, identitas), di `app/(docs)` non-foundations. Inventaris dari grep (2026-11-22):

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | minor | `getting-started` (5 ikon kartu), `guidelines` (3 ikon) | Ikon fitur/kartu `text-primary` (dekoratif). | `text-highlight` |
| 2 | minor | `patterns/command-palette` (2), `notifications` (1), `optimistic-updates` (1), `results` (1), `infinite-scroll` (1), `workspace` (1) | Ikon dekoratif di header/kartu contoh. | `text-highlight` |
| 3 | minor | `patterns/dynamic-form:417–419, 560` | Callout informatif `border-primary/30 bg-primary/5` dan ikon `Info`/`ShieldCheck` `text-primary`. | `border-highlight/30 bg-highlight/5`, ikon `text-highlight` |
| 4 | minor | `patterns/master-detail:243–244` | Panel identitas "You (Support)" memakai `bg-primary/5` dan teks `text-primary`. | `highlight` (identitas) |
| 5 | minor | `page.tsx` (beranda docs) baris 500 | Kotak ikon fitur `bg-primary/10 text-primary`; sebelahnya (baris 483) sudah `highlight`. | `bg-highlight/10 text-highlight` (konsisten dalam satu halaman) |
| 6 | minor | `patterns/virtualized-list:140` | Accent metrik "DOM nodes mounted" `text-primary` (metrik sejenis "Total records" sudah `text-highlight`). | `text-highlight` |
| 7 | minor | `components/data-display` (`Layers`, `Sparkles`, avatar fallback ikon) dan `components/forms:92` (ikon opsi select) | Ikon dekoratif. | `text-highlight` |

## Perubahan

- Ganti 25 kemunculan di 14 file sesuai tabel di atas. Skrip mengganti pola literal dan memverifikasi jumlah kemunculan tiap pola sebelum menulis (tidak ada ketidakcocokan).
- Tidak mengubah `@ds/ui`, tidak mengubah teks, tidak mengubah struktur.

## Yang sengaja TIDAK diubah (tetap `primary`)

Aturan batas: `primary` tetap untuk aksi, fokus, dan state terpilih; `highlight` untuk aksen dan identitas.

- Tombol dan aksi (mis. `onboarding`, `master-data`, `stepper` kotak ikon `bg-primary text-primary-foreground` dan callout dengan tombol aksi).
- State terpilih: `workspace:69`, `cascader-tree-select:81`, `transfer-list:52`, `activity-feed:251` (`bg-highlight` sudah), `overlays-menus:272`, `data-display:424`, `dashboard:182`, `stepper:317`, `master-detail:376`, `notifications:176` (indikator belum dibaca), `command-palette`. Ini state yang sebaiknya memakai `SegmentedControl` atau pola state terpisah (CR terpisah bila disetujui).
- Status: `Loader2` spinner (`infinite-scroll:185`), `CheckCircle2` selesai (`forms:723`).
- Pola warna token: `themes` (perbandingan `primary` vs `highlight`, `431`), `colors` (swatch), `dashboard` data `color: 'text-primary'` (`134`).
- Solid fill ikon kotak `bg-primary text-primary-foreground` yang bukan callout (mis. `master-data:283`, `stepper:152`, `kanban` memakai `bg-highlight`). Dicatat sebagai pola yang perlu diputuskan lewat CR terpisah bila user ingin seragam.

## Tasks

- [x] Ganti 25 kemunculan di 14 file (lihat tabel).
- [x] `pnpm --filter @ds/showcase lint` hijau (exit 0).
- [x] `pnpm --filter @ds/showcase build:types` hijau (exit 0).
- [x] `visual-language-guard` hijau 4/4.
- [ ] Screenshot dark dan light halaman yang berubah (`getting-started`, `guidelines`, `patterns/dynamic-form`, `patterns/master-detail`, beranda docs) belum dilakukan dalam sesi ini.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Ikon dekoratif dan callout informatif → `highlight` | Sesuai Color Roles; kontras ikon (non-teks) 3:1 sudah dicek lewat audit tema sebelumnya (highlight vs surface light 3,05–5,19:1, tepi tipis di graphite/lagoon). Ikon non-teks harus 3:1; graphite 3,05 lolos tipis. |
| 2 | Elemen state terpilih dan aksi tidak diubah di CR ini | Itu perubahan pola interaksi, bukan dekorasi; butuh keputusan terpisah. |

## Catatan risiko

- Teks `text-highlight` tidak dipakai (hanya ikon, border, dan bg). Aturan `visual-language.md` tentang teks kecil tetap terpenuhi.
- Pada `patterns/virtualized-list:140` accent dipakai sebagai warna angka metrik. Angka tersebut `text-highlight` dengan ukuran besar; kontras teks ukuran itu perlu dicek untuk tema ber-highlight rendah (lihat audit kontras). Ini belum dibuktikan.

## Design System Checks

- [x] Tidak ada hex/RGB hardcode.
- [x] Guard `visual-language-guard` hijau.
- [ ] Kontras metrik `text-highlight` di tema rendah belum diukur ulang.

## Eksekusi

Branch: `visual-polish`
Commit: `refactor: primary dekoratif ke highlight di halaman docs [CR-044]` (dibuat setelah verifikasi).
