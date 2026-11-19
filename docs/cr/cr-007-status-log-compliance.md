# CR-007 — Agent tidak patuh mengisi STATUS-LOG

**Status:** done
**Sumber:** review
**Ref:** `docs/STATUS.md:31-35`, `docs/STATUS-LOG.md:1-6`, `AGENTS.md:80-88`, `.opencode/commands/implement.md:27`, `opencode.json:3`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `docs/STATUS-LOG.md:1-6` | Log masih berisi 2 entri bootstrap `2026-11-19`; 8 penutupan (CR-001–CR-006, 001-01, 001-02) tidak pernah dicatat walau semuanya `done`. Histori di `STATUS.md` sendiri pun masih memuat ringkasan 6 CR lama tanpa pernah diarsipkan. | Backfill entri yang hilang dari tanggal commit `done`/merge, lalu jadikan append sebagai bagian definisi selesai. |
| 2 | major | `AGENTS.md:85` | Aturan workflow hanya mewajibkan "tick checkbox story, update `BACKLOG.md` dan `STATUS.md`" — `STATUS-LOG.md` tidak disebut, sehingga agent yang patuh pada `AGENTS.md` akan tetap melewatkan log. | Samakan instruksi: tambahkan kewajiban append `STATUS-LOG.md` di `AGENTS.md` dan `.opencode/commands/implement.md` langkah 8. |
| 3 | minor | `docs/STATUS.md:33`, `opencode.json:3` | Instruksi log hanya hidup di `STATUS.md` yang tidak di-auto-load (instructions hanya `ARCHITECTURE.md` + `CONVENTIONS.md`), dan tanpa hook/CI check apa pun yang gagal bila log tidak disentuh. | Tambahkan check ringan tanpa dependency baru (`scripts/check-status-log.mjs`) yang memverifikasi setiap artefak `done` punya baris log; jalankan di akhir story/CR. |
| 4 | minor | `docs/cr/TEMPLATE.md:50` | Checklist `Eksekusi` hanya menyebut "`docs/STATUS.md` diperbarui bila relevan", tidak menyebut append log. | Tambahkan item checklist log ke template CR (dan story mengikuti langkah yang sama). |

## Perubahan yang Diusulkan

- Backfill `docs/STATUS-LOG.md` dengan 8 entri yang hilang (tanggal dari commit penanda `done`/merge), format `YYYY-MM-DD — ringkasan — referensi`.
- Samakan aturan: `AGENTS.md` workflow dan `implement.md` langkah 8 mewajibkan append `STATUS-LOG.md` bersama update `BACKLOG.md`/`STATUS.md`.
- Tambahkan `scripts/check-status-log.mjs` (Node murni, tanpa dependency) yang gagal bila artefak `done` di `BACKLOG.md` tidak memiliki baris log; dijalankan sebagai `node scripts/check-status-log.mjs` di akhir story/CR (tanpa mengubah script `verify` root — itu butuh konfirmasi terpisah).
- Tambahkan item checklist log pada `docs/cr/TEMPLATE.md`.
- Tidak mengubah API publik komponen, token, atau dependency.

## Tasks (jalur small-fix)

- [x] Backfill `docs/STATUS-LOG.md` untuk CR-001–CR-006, 001-01, 001-02
- [x] Samakan kewajiban append log di `AGENTS.md` dan `.opencode/commands/implement.md`
- [x] Tambah `scripts/check-status-log.mjs` + item checklist di `docs/cr/TEMPLATE.md`
- [x] Verifikasi: script hijau pada repo saat ini, dan `pnpm typecheck` `pnpm lint` `pnpm test` tetap hijau

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Check tidak di-wire ke `verify` root / husky. | Mengubah konfigurasi build/hook butuh persetujuan terpisah per `CONVENTIONS.md`; script standalone + kewajiban di checklist sudah menutup celah tanpa dependency baru. |
| 2 | Backfill memakai tanggal commit penanda `done`. | Tanggal paling dekat dengan momen penutupan; format `STATUS-LOG.md` hanya butuh ringkasan + referensi. |

## Design System Checks

- [x] Tidak ada perubahan UI — check N/A.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-007-status-log-compliance`
Commit: `docs: kunci kepatuhan STATUS-LOG [CR-007]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append.
