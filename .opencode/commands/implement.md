---
description: Eksekusi story atau CR dengan approval rencana
agent: build
---

Baca dan implementasikan target di: `$ARGUMENTS`

Langkah:
1. Tentukan jenis target:
   - **Story**: harus lolos Gate 3 (disetujui user, status `todo`) dan belum `done`; branch `NNN-MM-slug`. Jika story masih draft atau belum disetujui, berhenti.
   - **CR** (`docs/cr/cr-NNN-slug.md`): harus berstatus `approved` — CR menjadi source of truth; branch `cr-NNN-slug`; commit trailer `[CR-NNN]`. Setelah selesai: centang checkbox CR + perbarui barisnya di `docs/BACKLOG.md`. Untuk CR besar (Tasks kosong / dipecah jadi story), arahkan user ke `/story` saja.
2. Baca story/CR beserta PRD dan design yang dirujuk. Story/CR adalah source of truth — jangan kerjakan di luar lingkupnya. Patuhi `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md`, dan `docs/design/visual-language.md` (termuat otomatis) — jangan menawarkan alternatif stack.
3. Buat todo list dari checklist task di story/CR.
4. Susun rencana teknis ringkas: file yang akan diubah/dibuat, pendekatan, API publik yang terdampak, dan risiko. Sebelum menulis rencana: cek dampak via graphify (`get_neighbors`/`shortest_path` dari simbol yang disentuh) — cantumkan blast radius di bagian risiko. MINTA APPROVAL USER SEBELUM menulis kode.
5. Setelah disetujui: buat branch dari nama story/CR, lalu implementasikan task satu per task.
6. Verifikasi setiap task sesuai urutan di CONVENTIONS, dan pastikan acceptance criteria terpenuhi:
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm test`
   - `pnpm test:tokens` bila token berubah
   - `pnpm -C apps/showcase build` bila showcase berubah
7. Setelah semua task selesai:
   - Centang semua checkbox, ubah status story ke `review`
   - Perbarui baris story/CR di `docs/BACKLOG.md`
   - Perbarui `docs/STATUS.md` sebagai snapshot ringkas (milestone, posisi sekarang, next, known issues) tanpa menumbuhkannya — detail panjang sesi masuk `docs/STATUS-LOG.md` (append di akhir file)
   - Jalankan `node scripts/check-status-log.mjs` — harus hijau sebelum commit
   - Commit dengan format `type: deskripsi [NNN-MM]` atau `[CR-NNN]`
8. Ingatkan user untuk review dan pembuatan PR. Jangan push atau membuat PR tanpa diminta.

Jika menemukan kebutuhan di luar scope: berhenti dan minta konfirmasi.
