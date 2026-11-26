---
description: Buat spec desain dari PRD dan minta gate 2
agent: build
---

Muat skill `designer` lalu baca PRD di: `$ARGUMENTS`

Langkah:
1. Pastikan PRD berstatus `approved`. Jika masih `draft`, hentikan dan ingatkan user untuk review PRD dulu (gate 1).
2. Update `docs/design/object-model.md` — token, komponen, pattern, atau scenario baru yang dibutuhkan fitur ini.
3. Update `docs/design/sitemap.md` — daftarkan SEMUA layar/panel/modal SEBELUM menggambar wireframe. Halaman multi-tab = satu shell `S-NNN` + panel anak `S-NNN.MM`; modal `M-NNN`.
4. Buat task flow (mermaid) di `docs/design/flows/` untuk setiap alur user yang melintasi layar; setiap flow punya trigger dan outcome.
5. Buat wireframe/anatomy + state matrix shell-first di `docs/design/wireframes/<fitur>.md`: empty, loading, error, success; light/dark parity; catatan a11y.
6. Verifikasi coverage: setiap FR di PRD ter-cover minimal satu layar atau flow — di artefak design (sitemap, wireframe, flow) referensi FR wajib qualified `NNN.FR-NNN`.
7. Tampilkan ringkasan perubahan + checklist review design (lihat skill `designer`), lalu minta user review (gate 2).

Jangan implementasi kode. Jangan membuat story sebelum design `approved`.
