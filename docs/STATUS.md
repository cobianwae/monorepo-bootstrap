# Status

## Milestone

Design System Foundation v1 — token, komponen inti, showcase, dan workflow kontribusi.

## Posisi Saat Ini

- **Branch kerja: `visual-polish`** (dari `dev` `e57f7ea`) — branch integrasi pekerjaan visual, diperlakukan seperti `dev`: CR/story visual di-merge ke sini. `dev` tidak diubah; push/PR menunggu keputusan user.
- PRD 001–006, 010 (legacy), 011 `shipped` dan diarsipkan. PRD 012–019 dan spec ringkas RM-02/03/10 `approved`. Seluruh story `done` kecuali 013-01, 013-02, 013-03.
- CR-017–092 `done` (kecuali CR-079–081); riwayat merge/push per CR ada di `docs/STATUS-LOG.md` (rekonsiliasi CR sebelum 054: `docs/reviews/cr-before-054-status-reconciliation.md`).
- CR `approved` yang belum selesai: CR-079, CR-080, CR-081 (seri Import Wizard).
- Config OpenCode (CR-089–CR-092, `done` 2026-11-26): `nim-coder` dipakai hanya untuk `explore` (pin `general` dilepas karena uji 2–3× lebih lambat dari model sesi), proteksi DCP `docs/stories/**` dan `docs/cr/**` terverifikasi 2026-11-26, `max_bytes` 24576, `compaction.buffer` 25%, `snapshots` aktif; `visual-language.md` auto-loaded.

## Next

1. CR-079, lalu CR-080 dan CR-081 — hanya atas instruksi user, satu CR per sesi. Supersession bahasa (CR-079) dan API aditif FileInput (CR-078) disetujui sebagaimana tertulis.
2. Story 013-01, 013-02, 013-03 (Diff viewer). 013-01 membuka S-005.36 (`in-design`); S-005.30/S-005.31 `implemented`; S-005.41 tetap `in-design` sampai PRD 018 diimplementasi.
3. Verifikasi yang tertunda: cek browser (keyboard, light/dark, positioning, kontras numerik) untuk CR-013, CR-070, CR-077, CR-083–088.

Catatan: jangan membuka ulang temuan yang sudah ditangani — eyebrow `PageHeader` (CR-046), Directional Motion (CR-048), deviasi h1/weight (CR-051), guard heading docs (CR-052), teks kecil (CR-055). Batas CSS consumer/overflow non-Banner tercatat di CR-056. Audit CR-054 bukan sertifikasi exhaustive (`docs/reviews/cr-054-final-audit.md`).

## Known Issues

- Suite UI: tanpa flag `NODE_OPTIONS=--no-experimental-webstorage`, 4 smoke FlowEditor gagal (`localStorage.getItem is not a function`; lihat STATUS-LOG CR-072/073). `rte-link-save` flaky baseline pada run penuh. Typecheck workspace hijau sejak CR-075.
- Pembaca layar bersuara native belum diuji.
- Graphify per-machine; graph tidak di-commit.
- `apps/web` dan `apps/api` masih tipis; integration test belum aktif.
- `--font-*`/art direction bersarang punya jebakan serupa dengan scope tema (diperbaiki untuk `--color-*` di CR-033); di luar scope.
- `next build` showcase menimpa `.next` dev server (tanpa `distDir`); saat dev server aktif, build dari salinan sementara.
- Agent `explore` memakai `nim-coder` lewat proxy lokal `localhost:4101` (dijalankan manual dari `~/Documents/proxy`); bila proxy mati, `explore` gagal — fallback: telusuri sendiri dengan grep (`AGENTS.md` Session Protocol #4).

## Aturan Update

- Maksimal ~10 baris; detail masuk `docs/STATUS-LOG.md`.
- Update setelah story/CR selesai atau keputusan arah berubah.
- Jangan menyalin isi BACKLOG ke sini; cukup ringkasan posisi dan next.
