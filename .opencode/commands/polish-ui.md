---
description: Uplift visual berdasarkan visual language yang approved
agent: build
---

Scope: `$ARGUMENTS` (layar atau `global`)

## Langkah

1. Muat skill `visual-designer` mode **uplift**.
2. Wajib `docs/design/visual-language.md` berstatus approved. Jika belum, arahkan ke `/design-language`.
3. Audit gap antara tampilan saat ini dan arah visual.
4. Diskusikan temuan dan prioritas.
5. Draft CR per cluster, termasuk audit selector e2e bila ada.
6. Eksekusi setelah CR approved.
7. Verifikasi dan update `docs/BACKLOG.md` serta `docs/STATUS.md`.

Jangan mengubah arah visual di command ini; arah hanya lewat `/design-language`.
