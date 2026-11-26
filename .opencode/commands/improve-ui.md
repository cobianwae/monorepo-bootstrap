---
description: Audit dan poles kode UI yang sudah terimplementasi
agent: build
---

Muat skill `ui-designer` lalu audit: `$ARGUMENTS` (layar/screen ID `S-NNN`, route, path file komponen, atau kata kunci `global` untuk audit lintas komponen).

Langkah:
1. Temukan kode terkait (`packages/ui/src/components/`, `apps/showcase/src/`) beserta wireframe/story asalnya sebagai konteks perilaku. Mode `global`: inventory pola lintas komponen/halaman dulu.
2. Audit per dimensi di skill `ui-designer`; periksa kondisi nyata (`pnpm -C apps/showcase dev`, port 4000) bila perlu melihat state empty/loading/error.
3. **Fase diskusi**: presentasikan temuan + arah perbaikan + snippet kunci → diskusikan dengan user sampai arah sepakat. JANGAN menulis CR sebelum arah disetujui.
4. Tulis draft CR ringkas per klaster temuan di `docs/cr/cr-NNN-slug.md` (template: `docs/cr/TEMPLATE.md`) + index di `docs/BACKLOG.md` status `draft`. JANGAN edit kode komponen/halaman live sebelum CR `approved`.
5. Setelah CR `approved` dan dieksekusi di branch `cr-NNN-slug` via `/implement`: iterasi bolak-balik dengan user (preview via `pnpm dev`), lalu mutakhirkan CR ke kondisi final sebelum PR.

Bedakan dengan `/design-language` (arah visual), `/polish-ui` (uplift visual terhadap arah), dan `/audit` (audit kode read-only).
