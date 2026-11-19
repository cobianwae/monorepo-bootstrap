---
description: Buat PRD dari diskusi dan minta gate 1
agent: build
---

Topik: `$ARGUMENTS`

## Langkah

1. Muat skill `prd-writer`.
2. Ringkas diskusi: masalah, tujuan, non-goals, user/use case.
3. Tanyakan open questions yang belum jelas. Jangan mengarang jawaban.
4. Tentukan nomor PRD berikutnya dari `docs/prd/` dan `docs/BACKLOG.md`.
5. Tulis `docs/prd/NNN-slug.md` sesuai template `prd-writer`:
   - problem,
   - goals & success metrics,
   - non-goals,
   - user & use case,
   - requirements `FR-NNN` dengan prioritas MoSCoW,
   - design refs,
   - constraints & dependencies,
   - open questions,
   - changelog.
6. Tambahkan baris `draft` di `docs/BACKLOG.md`.
7. Minta **gate 1**: user mereview dan menetapkan `approved`.

Jangan implementasi kode. Jangan membuat story sebelum PRD approved.
