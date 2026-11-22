# CR-047 — State terpilih dan fill ikon `bg-primary` di halaman docs/scenario

**Status:** draft
**Sumber:** audit halaman tidak koheren (2026-11-22), temuan terbuka dari CR-044
**Ref:** `docs/design/visual-language.md` (Color Roles: `primary` = aksi, fokus; state terpilih: kontrol segmented wajib `SegmentedControl`; item aktif kumpulan pilihan visual memakai ring `highlight`)

## Temuan

Pemakaian `bg-primary` / `text-primary` sebagai **state terpilih** (bukan aksi) dan **fill solid ikon kotak** masih tersisa setelah CR-044. CR-044 sengaja tidak mengubahnya karena itu perubahan pola interaksi, bukan dekorasi.

| # | Severity | Lokasi (contoh) | Pola | Rekomendasi |
|---|---|---|---|---|
| 1 | minor | `patterns/workspace:69`, `components/cascader-tree-select:81`, `components/transfer-list:52`, `components/overlays-menus:272`, `components/data-display:424`, `patterns/dashboard:182`, `patterns/stepper:317`, `patterns/master-detail:376`, `patterns/notifications:176` | State terpilih/aktif memakai fill `primary` | Kontrol segmented/toggle → `SegmentedControl`; item pilihan lain → ring `highlight` atau state `bg-accent` sesuai pola komponen terkait |
| 2 | minor | `patterns/master-data:283`, `patterns/stepper:152` | Kotak ikon solid `bg-primary text-primary-foreground` (dekoratif) | `bg-highlight/10 text-highlight` (atau `bg-highlight text-highlight-foreground` bila harus solid; cek kontras dulu) |

## Mengapa CR terpisah

Mengubah state terpilih mengubah cara pengguna membaca pilihan aktif. Itu keputusan interaksi (butuh persetujuan), dan beberapa item adalah kontrol yang seharusnya memakai komponen DS (`SegmentedControl`), bukan kelas manual.

## Perubahan (usulan)

1. Inventaris ulang dengan grep per baris, lalu klasifikasikan tiap kasus: aksi (tetap), state terpilih (ubah), dekorasi (ubah ke `highlight`).
2. Ganti state terpilih per kasus; pakai `SegmentedControl` bila kontrol segmented.
3. Ganti kotak ikon solid dekoratif ke tint `highlight`.

## Tasks

- [ ] Persetujuan user untuk pola state terpilih (SegmentedControl vs ring vs bg-accent).
- [ ] Inventaris dan klasifikasi per baris (tabel di atas bisa berubah).
- [ ] Ubah per kasus.
- [ ] Guard: tambah aturan `handmade-segmented-selected` untuk pola `bg-primary` pada item terpilih bila pola stabil.
- [ ] Screenshot per halaman (dark & light).
- [ ] `pnpm --filter @ds/showcase lint`, `build:types`, guard test.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Belum dieksekusi; menunggu persetujuan | Mengubah pola interaksi; perlu keputusan user |

## Design System Checks

- [ ] Kontras state terpilih dicek di 8 tema light/dark.
- [ ] Tidak ada hex/RGB hardcode.

## Eksekusi

Belum dieksekusi. Status tetap `draft`.
