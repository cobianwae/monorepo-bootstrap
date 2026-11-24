---
description: Eksekusi story atau CR dengan approval rencana
agent: build
---

Target: `$ARGUMENTS`

## Langkah

1. Tentukan jenis target:
   - **Story**: harus sudah lolos Gate 3 (disetujui user, status `todo`) dan belum `done`; branch `NNN-MM-slug`. Jika story masih draft atau belum disetujui, berhenti.
   - **CR**: harus berstatus `approved`; branch `cr-NNN-slug`; commit trailer `[CR-NNN]`.
2. Baca story/CR, PRD, dan design terkait. Story/CR adalah source of truth.
3. Buat todo list task.
4. Susun rencana teknis:
   - file yang akan diubah,
   - risiko dan API publik yang terdampak,
   - blast radius via graphify (`get_neighbors`, `graph_stats`) bila relevan.
5. **Minta approval user sebelum menulis kode.**
6. Buat branch dan implement task per task.
7. Verifikasi:
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm test`
   - `pnpm test:tokens` bila token berubah
   - `pnpm -C apps/showcase build` bila showcase berubah
8. Tick checkbox, ubah status story menjadi `review`, append `docs/STATUS-LOG.md` (`YYYY-MM-DD — ringkasan — referensi`), update `docs/BACKLOG.md` dan `docs/STATUS.md`, lalu jalankan `node scripts/check-status-log.mjs` (harus hijau sebelum commit).
9. Commit dengan format `type: deskripsi [NNN-MM]` atau `[CR-NNN]`.
10. Jangan push atau membuat PR tanpa izin eksplisit.

Jika menemukan kebutuhan di luar scope: berhenti dan minta konfirmasi.
