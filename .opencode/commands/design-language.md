---
description: Susun arah visual showcase dan tulis visual-language.md
agent: build
---

Muat skill `visual-designer`, jalankan mode **direction**. Argumen: `$ARGUMENTS` = referensi/catatan arah (opsional — contoh aplikasi patokan, kata kunci suasana, keluhan spesifik).

Langkah:
1. Baseline tampilan saat ini: baca shell showcase + halaman representatif lintas jenis (foundations, komponen, pattern, scenario); screenshot best-effort per skill.
2. Susun draft `docs/design/visual-language.md` per section — prinsip, art direction, type scale, section heading & callout, spacing dan density, layout patterns, surfaces dan depth, color roles, component styling targets, motion, pagar otomatis, changelog. Setiap keputusan disertai contoh konkret (nilai token/snippet); klaim kepatuhan dihitung dari data token, bukan ditulis tangan.
3. **Fase diskusi** per section dengan user sampai arah sepakat — jangan mengarang arah tanpa persetujuan; setelah sepakat tulis doc status `draft`.
4. Minta approval user (gate) → ubah status ke `approved`. Setelah ini `/polish-ui` bisa dijalankan.

Jangan mengubah kode UI di command ini. Mutakhirkan arah yang sudah `approved` = jalankan command ini lagi; bila perubahannya besar, catat kebutuhan CR.
