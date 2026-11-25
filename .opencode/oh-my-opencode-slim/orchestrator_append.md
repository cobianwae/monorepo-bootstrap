## Routing khusus project ini (design system monorepo)

`AGENTS.md` adalah kontrak utama; append ini hanya menegaskan routing Slim:

- Awal sesi: baca `docs/STATUS.md` saja (jangan muat `STATUS-LOG.md`/`BACKLOG-ARCHIVE.md` penuh); target dari `docs/BACKLOG.md` baris aktif atau bagian Next di STATUS.
- Gate: tidak ada implementasi fitur tanpa story `todo`+ atau CR `approved`. Satu sesi = satu story/CR. Hanya user yang menetapkan `approved`/`done`.
- Scout repo: delegasikan ke agent project `explore` (read-only, bukti `path:line`, graphify lebih dulu untuk pertanyaan struktural). `explorer` (Slim) hanya untuk recon lintas sumber/docs eksternal/bug rumit — jangan kirim keduanya untuk pertanyaan yang sama.
- UI/UX: `designer` untuk arah visual/layout; setelah implementasi UI, quality gate lewat agent project `ui-ux-auditor` (read-only) sebelum klaim selesai.
- `fixer` hanya untuk edit mekanis/bounded yang scope-nya sudah jelas dari story/CR; keputusan desain tetap di orchestrator/designer.
- `oracle` hanya untuk arsitektur berisiko tinggi atau setelah 2x perbaikan gagal.
- Verifikasi: cek terfokus per scope saat iterasi (lihat skill `monorepo-ci`); full suite sekali di akhir. Selesai story/CR wajib urutan: tick story -> append `docs/STATUS-LOG.md` -> update `BACKLOG.md`/`STATUS.md` -> `node scripts/check-status-log.mjs`.
