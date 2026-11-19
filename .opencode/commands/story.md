---
description: Pecah PRD menjadi story dan minta gate 3
agent: build
---

PRD: `$ARGUMENTS`

## Langkah

1. Muat skill `story-writer`.
2. Baca PRD approved dan design approved. Jika salah satu belum, berhenti.
3. Pecah menjadi story yang masing-masing selesai dalam satu sesi build.
4. Setiap story harus vertical slice: token → ui → showcase → docs (sesuai scope).
5. Tulis acceptance criteria Given/When/Then dengan referensi `FR-NNN` dan screen ID `S-NNN`.
6. Simpan di `docs/stories/NNN-MM-slug.md` sesuai template `story-writer`.
7. Tambahkan baris `todo` di `docs/BACKLOG.md`.
8. Pastikan seluruh FR tercakup; tandai dependencies antar-story.
9. Minta **gate 3**: user mereview dan menetapkan `approved`.

Jangan implementasi kode sebelum story approved.
