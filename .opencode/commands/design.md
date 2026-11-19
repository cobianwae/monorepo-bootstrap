---
description: Buat spec desain dari PRD dan minta gate 2
agent: build
---

PRD: `$ARGUMENTS`

## Langkah

1. Muat skill `designer`.
2. Baca PRD dan pastikan statusnya `approved`. Jika belum, berhenti dan minta approval.
3. Update `docs/design/object-model.md` bila ada token, komponen, pattern, atau scenario baru.
4. Daftarkan **semua layar** di `docs/design/sitemap.md` sebelum membuat wireframe.
5. Buat flow mermaid di `docs/design/flows/`.
6. Buat wireframe/anatomy + state matrix di `docs/design/wireframes/`:
   - empty, loading, error, success,
   - light/dark parity,
   - catatan a11y.
7. Verifikasi setiap `FR-NNN` di PRD tercakup oleh layar/flow.
8. Minta **gate 2**: user mereview dan menetapkan `approved`.

Jangan implementasi kode. Jangan membuat story sebelum design approved.
