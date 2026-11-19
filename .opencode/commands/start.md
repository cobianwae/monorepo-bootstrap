---
description: Bootstrap sesi dengan membaca STATUS, BACKLOG aktif, dan kondisi git
agent: build
---

Bootstrap sesi kerja.

## Langkah

1. Baca `docs/STATUS.md` sebagai snapshot.
2. Grep `docs/BACKLOG.md` hanya untuk baris aktif (status selain `done`/`shipped`).
3. Jalankan:
   - `git log --oneline -10`
   - `git status --short`
   - `git branch --show-current`
4. Ringkas:
   - milestone dan posisi saat ini,
   - branch aktif,
   - 2–3 next steps dari bagian **Next**.
5. Jika tidak ada target aktif, tawarkan item dari **Next**.
6. Jangan edit file. Akhiri dengan pertanyaan arah kerja.
