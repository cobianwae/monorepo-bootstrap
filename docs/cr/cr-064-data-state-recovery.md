# CR-064 — Skenario state data dan pemulihan empty

**Status:** approved
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

- [ ] Tetapkan matriks loaded/loading/empty/error/retry untuk tiap caller.
- [ ] Implementasi state switch demo dan clear/retry; pisahkan skeleton dari empty.
- [ ] Uji keyboard/status announcement/fokus pemulihan, serta struktur list.
- [ ] Regression tests dan verifikasi sesuai konvensi.

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
- [ ] Branch dibuat; implementasi dan verifikasi.
- [ ] BACKLOG/STATUS/STATUS-LOG diperbarui; `check-status-log` hijau.
