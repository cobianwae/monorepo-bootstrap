---
name: visual-designer
description: Arah visual dan uplift showcase — menyusun docs/design/visual-language.md, audit gap, screenshot best-effort, CR per cluster, dan selector audit. Gunakan saat /design-language atau /polish-ui.
tags: [design-system, visual, direction, uplift, showcase, cr]
compatibility: [next, opencode, claude, cursor]
---

# Visual Designer

## Kapan Pakai

- `/design-language` — menyusun arah visual.
- `/polish-ui` — menerapkan arah visual yang sudah approved.

## Mode 1 — Direction

Tujuan: menghasilkan `docs/design/visual-language.md` yang disetujui.

### Langkah

1. Baseline: shell showcase dan beberapa layar representatif (docs, CRM, clinic).
2. Identifikasi karakter visual saat ini: hierarki, density, tipografi, warna, permukaan.
3. Susun draft per section:
   - prinsip,
   - type scale,
   - spacing dan density,
   - layout patterns,
   - surfaces dan depth,
   - color roles,
   - component styling targets,
   - motion,
   - changelog.
4. Diskusikan per section; jangan mengarang arah tanpa persetujuan.
5. Tulis draft.
6. Minta approval user.

### Aturan

- Arah harus bisa dipetakan ke token existing atau token baru yang disetujui.
- Light/dark parity wajib.
- Jangan menetapkan arah yang hanya bekerja di satu scenario.
- Jangan mengubah kode di mode ini.

## Mode 2 — Uplift

Tujuan: menutup gap antara tampilan saat ini dan arah visual approved.

### Langkah

1. Pastikan `docs/design/visual-language.md` `approved`. Jika belum, arahkan ke `/design-language`.
2. Audit gap per layar/komponen:
   - hierarki,
   - tipografi,
   - spacing/density,
   - warna,
   - surface/depth,
   - motion,
   - konsistensi.
3. Ambil screenshot best-effort bila dev server/Playwright tersedia. Jika tidak, catat dan gunakan deskripsi.
4. Diskusikan temuan dan prioritas.
5. Draft CR per cluster.
6. Audit selector e2e yang mungkin terdampak.
7. Eksekusi setelah CR approved.
8. Verifikasi dan update status.

### Aturan

- Satu CR = satu cluster visual yang koheren.
- Jangan mencampur uplift visual dengan refactor komponen besar.
- Jangan mengubah arah visual di mode uplift; arah hanya lewat direction.
- Hormati `prefers-reduced-motion`.

## Boundaries

- **`visual-design`** — prinsip dan referensi visual.
- **`visual-designer`** — workflow arah dan uplift.
- **`ui-designer`** — perbaikan kode UI level komponen/halaman.
- **`designer`** — spec desain fitur baru.
- **`design-tokens`** — implementasi token dan kontras.

## Anti-Patterns

- ✗ Uplift tanpa visual language approved.
- ✗ Mengubah banyak layar sekaligus tanpa CR.
- ✗ Mengejar estetika dengan mengorbankan a11y.
- ✗ Hardcode warna/ukuran.
- ✗ Screenshot dianggap bukti tanpa verifikasi kode.
- ✗ Mencampur arah visual dengan implementasi.

## Integration

- **Sebelum**: `visual-design`, `design-tokens`, `ux-patterns`.
- **Sesudah**: `ui-designer`, `reviewer`, `/audit`.
