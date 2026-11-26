---
description: Pecah PRD menjadi story dan minta gate 3
agent: build
---

Muat skill `story-writer` lalu baca PRD di: `$ARGUMENTS`

Pastikan dulu: PRD berstatus `approved` DAN design terkait sudah `approved` (gate 2). Jika belum, hentikan dan ingatkan user.

Langkah:
1. Identifikasi seluruh requirement (`NNN.FR-NNN` — qualified, FR hanya unik per PRD) dan screen (`S-NNN`, `S-NNN.MM`, `M-NNN`) dari PRD + design.
2. Pecah menjadi story berukuran satu sesi build, masing-masing vertical slice: token → ui → showcase → docs (sesuai scope); aturan pemecahan ada di skill `story-writer`. Simpan ke `docs/stories/NNN-MM-slug.md`.
3. Setiap story wajib punya acceptance criteria Given/When/Then yang merujuk `NNN.FR-NNN` dan `S-NNN`/`M-NNN`.
4. Daftarkan semua story baru di `docs/BACKLOG.md` dengan status `todo`.
5. Pastikan setiap FR di PRD ter-cover minimal satu story — tidak boleh ada FR tercecer.
6. Tampilkan ringkasan stories, urutan pengerjaan, dan dependency-nya untuk direview user (gate 3).

Jangan implementasi kode sebelum story `approved`.
