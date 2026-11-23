# CR-064 — Skenario state data dan pemulihan empty

**Status:** done (disetujui user 2026-11-23)
**Sumber:** audit
**Ref:** CR-054 W04/C08; `docs/reviews/cr-054-code-audit.md:112`, `:157`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| W04 | major | `apps/showcase/src/app/(clinic)/clinic/patients/page.tsx:229`; daftar tabel pada laporan kode | Loading/error/recovery belum diperagakan lengkap pada sebagian tabel data konsumen. | Skenario demo deterministik yang relevan, bukan backend baru. |
| C08 | minor | `apps/showcase/src/app/(docs)/patterns/master-detail/page.tsx:358`–`:363` | Empty hasil filter tanpa clear CTA; struktur list perlu dirapikan. | Tindakan pemulihan dan markup list valid. |

## Perubahan yang Diusulkan

- Lengkapi patients/treatments/leads/virtualized-list sesuai kebutuhan skenario; jangan memaksakan fetch state ke tabel referensi statis.
- Data-table pattern sudah membuktikan error/retry dan empty/clear, gunakan sebagai referensi; tidak menulis backend nyata.

## Tasks (jalur small-fix)

- [x] Tetapkan matriks loaded/loading/empty/error/retry untuk tiap caller.
- [x] Implementasi state switch demo dan clear/retry; pisahkan skeleton dari empty.
- [x] Uji keyboard/status announcement/fokus pemulihan, serta struktur list.
- [x] Regression tests dan verifikasi sesuai konvensi.

Matriks per caller (implementasi):

| Caller | loading | error + retry | empty + CTA |
|---|---|---|---|
| `clinic/patients` | skeleton, `role="status"` | Alert + Retry | EmptyState "Clear Filters" (dipertahankan) |
| `clinic/treatments` | skeleton, `role="status"` | Alert + Retry | EmptyState "Reset Search" (dipertahankan) |
| `crm/leads` (table) | skeleton via `DataTable` | `DataTable` `error`/`onRetry` | empty "No leads match filters" (dipertahankan) |
| `(docs)/patterns/master-detail` | — | — | `li` berisi pesan + tombol "Clear search" |

Fokus pemulihan: tombol Reload/Retry memindahkan fokus ke region tabel (`tabIndex={-1}`) setelah loading selesai. Tombol "Test error" dan "Reload" adalah switch demo lokal; tidak ada backend.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | W04 gap showcase, bukan bukti backend gagal | Dataset demo tidak menyediakan request produksi. |

## Design System Checks

- [ ] Token/kontras, a11y, API/export dan state konsisten; showcase diperbarui.
- [ ] Typecheck/lint/test diverifikasi; baseline dicatat.

## Eksekusi

Branch: `cr-064-data-state-recovery`
Commit: `fix: demonstrate data state recovery [CR-064]`

- [x] Disetujui user (2026-11-23).
- [x] Branch dibuat (`cr-064-data-state-recovery`, dari `visual-polish` `b359291`); implementasi dan verifikasi.
- [x] BACKLOG/STATUS/STATUS-LOG diperbarui; `check-status-log` hijau.
- Verifikasi: typecheck showcase 0 error; lint lulus; showcase test 94/94 (22 file) dan build lulus. Satu kegagalan timeout mind-map 5000ms pada run paralel lulus 7/7 saat dijalankan sendiri (baseline timing).
- Belum diverifikasi di browser: keyboard dan announcement pada layar nyata. Status `done` atas persetujuan user 2026-11-23; batas verifikasi browser tetap tercatat.
