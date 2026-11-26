---
description: Uplift visual berdasarkan visual language yang approved
agent: build
---

Muat skill `visual-designer`, jalankan mode **uplift**. Argumen: `$ARGUMENTS` (layar/screen ID `S-NNN`, route, path file komponen, atau kata kunci `global` untuk klaster pola lintas halaman).

Langkah:
1. Pastikan `docs/design/visual-language.md` ada dan status `approved`; bila belum/tidak ada → hentikan, arahkan user ke `/design-language` dulu.
2. Audit kondisi nyata per skill (screenshot best-effort, baca sebagai image; fallback baca kode + wireframe). Jangan matikan dev server milik user.
3. Audit per dimensi visual di skill TERHADAP arah → daftar gap "sekarang vs arah": area layar, before/after deskriptif, snippet kunci.
4. **Fase diskusi** dengan user sampai arah perbaikan sepakat. JANGAN menulis CR sebelum arah disetujui.
5. Tulis draft CR ringkas per klaster di `docs/cr/cr-NNN-slug.md` (template: `docs/cr/TEMPLATE.md`) + index di `docs/BACKLOG.md` status `draft`; sertakan audit test co-located (`*.test.tsx`) yang terdampak. JANGAN edit kode live sebelum CR `approved`.
6. Setelah `approved` dan dieksekusi di branch `cr-NNN-slug` via `/implement`: iterasi bolak-balik dengan user (preview via `pnpm dev`, screenshot before/after bila memungkinkan), lalu mutakhirkan CR ke kondisi final sebelum PR.

Jangan mengubah arah visual di command ini; arah hanya lewat `/design-language`.
