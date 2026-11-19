---
description: Audit dan poles kode UI yang sudah terimplementasi
agent: build
---

Scope: `$ARGUMENTS` (layar atau `global`)

## Langkah

1. Muat skill `ui-designer`.
2. Cari kode terkait di:
   - `packages/ui/src/components/`
   - `apps/showcase/src/`
3. Audit dimensi:
   - hierarki visual,
   - spacing dan tipografi,
   - warna semantik,
   - konsistensi komponen,
   - state dan feedback,
   - microcopy,
   - a11y dasar.
4. Diskusikan temuan sebelum membuat CR.
5. Draft CR per cluster dan index di `docs/BACKLOG.md`.
6. **Jangan edit kode sebelum CR approved.**
7. Setelah approved: eksekusi, verifikasi, update status.

Bedakan dengan `/design-language` (arah visual) dan `/audit` (audit kode read-only).
