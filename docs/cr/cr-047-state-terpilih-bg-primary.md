# CR-047 — State terpilih dan fill ikon `bg-primary` di halaman docs/scenario

**Status:** approved (disetujui user 2026-11-22; `done` menunggu user). Cakupan: `app/(docs)` saja; `clinic`/`crm`/`scenarios` tidak disentuh (lanjutan terpisah).
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

- [x] Persetujuan user untuk pola state terpilih (disetujui 2026-11-22, rekomendasi).
- [x] Inventaris dan klasifikasi per baris (grep `bg-primary` di `app/(docs)`).
- [x] Ubah per kasus: 12 file (lihat Keputusan).
- [x] Guard: pola solid `bg-primary text-primary-foreground` kini dijaga aturan `solid-primary-fill` (CR-050) yang memindai seluruh src. Pola handmade segmented tetap di foundations.
- [~] Screenshot: `patterns/workspace` (light, Atelier/Pulse) sudah dilihat dan rapi. Halaman lain belum dilihat (stepper, master-data, transfer-list, data-display dark).
- [x] `pnpm --filter @ds/showcase lint` dan `build:types` hijau; `vitest src/test` 4/4 hijau.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Tombol segmented/toggle terpilih: `bg-primary text-primary-foreground` → `bg-background text-foreground shadow-xs` (state `on` SegmentedControl). Dipakai di workspace, dashboard, layout-navigation, data-display, overlays-menus, mention-emoji (`border-highlight bg-background`) | Sesuai visual-language (state on = permukaan `background` + `shadow-xs`); `primary` tidak lagi menandai state |
| 2 | Item pilihan (transfer-list, cascader): `bg-highlight/10 ring-1 ring-highlight` | Ring highlight untuk item pilihan visual |
| 3 | Callout dekoratif stepper dan master-data: `border-highlight/30 bg-gradient from-highlight/10`, ikon `bg-highlight text-highlight-foreground` | Dekorasi dan identitas = highlight; pasangan `highlight-foreground` sudah ada di token |
| 4 | Baris terpilih/aktif (master-detail, stepper card, data-display selectedIds) dan notifikasi unread → `highlight` | Konsisten dengan item pilihan |
| 5 | `clinic`, `crm`, dan `scenarios` (±20 kasus `bg-primary/5`, `bg-primary text-primary-foreground`) belum diubah | Di luar cakupan CR; lanjutan terpisah bila disetujui |

## Design System Checks

- [x] Kontras state terpilih: teks memakai text-foreground di atas highlight/10 (CR-046: 8,1–18,5:1 di 8 tema light/dark, lolos 4,5:1).
- [x] Tidak ada hex/RGB hardcode pada file yang diubah (grep bersih).

## Eksekusi

Belum dieksekusi. Status tetap `draft`.
