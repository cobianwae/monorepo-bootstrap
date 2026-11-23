# Rekonsiliasi CR sebelum CR-054

Tanggal: 2026-11-23. Review dokumentasi dan riwayat commit; tidak mengubah kode. Penutupan status di bawah ditetapkan user setelah membaca hasil rekonsiliasi.

## Cakupan dan keputusan

- Inventori CR-017–053: 37 CR; sebelum keputusan penutupan ini, 24 CR sudah done.
- User menetapkan sepuluh CR tambahan done: **CR-034/035/037/038/042/047/050–053**. Kini 34 CR done; **CR-017/018/036 tetap approved dan terbuka**. Batas verifikasi dan tindak lanjut CR-055–064 tidak dihapus oleh penutupan.
- CR-017/018 tetap terbuka: checklist implementasi/verifikasi belum memberikan bukti penyelesaian yang cukup. Jangan menutup berdasarkan status approved saja.
- CR-012/013 tidak diperiksa atau diubah; CR-054 dan turunannya tidak termasuk penilaian status lama ini.
- Suite kode/browser tidak dijalankan ulang. Angka tes di bawah adalah bukti historis, bukan baseline hijau baru. Arsip dan STATUS-LOG tidak dimuat penuh.

## Bukti penutupan dan pengecualian

Semua baris di bawah sudah done atas keputusan user, **kecuali CR-036**. Rekomendasi “siap keputusan done” dalam kolom batas adalah hasil review sebelum keputusan penutupan tersebut.

| CR | Bukti implementasi/keputusan | Batas dan rekomendasi |
|---|---|---|
| CR-034 | `59e2410`: aturan visual, wiring instruksi dan guard | Implementasi tercatat; visual-language tetap draft sesuai status dokumennya sendiri, bukan otomatis approved oleh penutupan CR. |
| CR-035 | `8294a05`: tujuh foundations diseragamkan | Verifikasi historis light/dark dan sampel Aurora/Blueprint; bukan seluruh palet/state. Siap keputusan done dalam cakupan ini. |
| CR-036 | `8294a05`: bug konten diperbaiki | Checklist hitung AA seluruh tone di browser masih `[~]`; pertahankan sebagai verifikasi terbuka. Jangan mengklaim semua tone sudah lolos atau menutup tanpa keputusan atas batas ini. |
| CR-037 | `8f65c10`: SectionHeading tanpa ikon/level sub | Implementasi dan verifikasi tercatat; siap keputusan done. |
| CR-038 | `0ded210`, koreksi workspace `eaf5fcf` | Catatan “commit belum dibuat” diperbaiki; sampel visual/guard sudah tercatat, bukan seluruh state. |
| CR-042 | `9852631`, verifikasi `14a7fc1` | Kontras Alert destructive diperbaiki; kegagalan flaky historis tidak boleh ditulis sebagai full suite bersih. |
| CR-047 | `3e14b2b`: state/callout docs diubah | Catatan “belum dieksekusi/draft” salah dan diperbaiki. Clinic/CRM/scenarios diteruskan ke CR-049, sisa state/semantik ke CR-057/063. |
| CR-050 | `e99d423`: primary dekoratif, guard dan keputusan deviasi | Deviasi PageHeader dipertahankan, bukan bug yang menunggu perubahan kode. Sisa visual ditemukan di CR-054 → CR-055/063. |
| CR-051 | Keputusan tanpa perubahan kode; eyebrow selesai di CR-046 (`bd54d89`) | h1/weight dipertahankan. Checklist log disinkronkan pada rekonsiliasi; siap keputusan done. |
| CR-052 | `e7d5cd5`: guidelines dan cakupan guard heading | Judul kartu sengaja bukan target guard. Implementasi tercatat; siap keputusan done. |
| CR-053 | `0a7e936`, verifikasi lanjutan `8737e64`, timeout tes `d6b09f3` | Dokumen belum mencatat retry dark, sampel palet lain, tes dan build lanjutan; sudah disinkronkan. Sisa temuan diteruskan ke CR-055–064, bukan klaim semua halaman patuh. |

## Koreksi pada CR yang sudah done

- CR-043: commit `c848b84`; screenshot tiga halaman yang dahulu tertunda kini dirujuk ke pemeriksaan CR-054.
- CR-044: commit `293a36c`; screenshot lanjutan dirujuk ke CR-054. Klaim “primary boleh untuk state terpilih” dibatasi sebagai keputusan scope historis, bukan aturan desain saat ini.
- Kandidat kontras angka virtualized-list pada CR-044 dikoreksi: audit kode CR-054 menemukan nilai foreground, aksen pada wrapper SVG. Sisa teks kecil yang nyata ditangani CR-055.
- Pemeriksaan visual CR-054 bukan sertifikasi semua state/palet; home tersembunyi dan reflow/semantik yang ditemukan tetap menjadi pekerjaan CR turunan.

## Yang masih terbuka

| CR | Bukti dokumen | Tindakan |
|---|---|---|
| CR-017 | `docs/cr/cr-017-tour-dialog-backdrop.md`: tasks backdrop/inert/fokus dan regresi belum tercatat selesai | Reproduksi dan cocokkan kode/test sebelum implementasi atau keputusan penutupan; temuan a11y tidak dianggap selesai tanpa bukti. |
| CR-018 | `docs/cr/cr-018-tour-varian-responsif-docs.md`: tasks cva/responsif/sinkronisasi belum tercatat selesai | Konfirmasi keputusan kontrak/desain yang tersisa, kemudian verifikasi scope; jangan tercampur dengan penutupan CR visual. |

## Sumber

- `docs/BACKLOG.md` bagian CR aktif; header/checklist tiap CR di atas.
- `docs/STATUS-LOG.md`: entri CR-047 eksekusi dan verifikasi lanjutan CR-053 pada 2026-11-22.
- `docs/reviews/cr-054-final-audit.md`, `docs/reviews/cr-054-code-audit.md`, `docs/reviews/cr-054-visual-audit.md`.
- Riwayat git pada `visual-polish`. Commit adalah bukti perubahan, bukan bukti tunggal seluruh acceptance criteria selesai.
