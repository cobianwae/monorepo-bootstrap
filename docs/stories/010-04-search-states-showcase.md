# 010-04 — Search + states + showcase + a11y penuh

Status: todo
PRD: `docs/prd/010-org-chart-editor.md`
Design: `docs/design/org-chart-editor.md`
FR: `FR-010`, `FR-012`, `FR-013`, `FR-014`, `FR-016`
Screens: `S-005.33`
Goal: Showcase `/patterns/org-chart-editor` end-to-end (browse → tambah → pindah → edit → hapus → undo → search) dengan state matrix, pohon alternatif SR, audit keyboard + kontras light/dark, dan smoke build hijau.

## Acceptance Criteria

### AC-01 — Search highlight + auto-expand + live region

**Given** kanvas dengan cabang collapsed + query cocok 3 node
**When** mengetik di pencarian showcase
**Then** `highlightedIds` ring `primary` + ancestor auto-expand via `getAncestors` + fit-view opsional + live region "3 hasil" (konsumen via resep), hapus query menghilangkan sorotan (FR-010, S-005.33)

### AC-02 — State matrix teramati

**Given** kontrol demo loading/empty/error
**When** tiap pemicu diaktifkan
**Then** loading skeleton `aria-busy`, empty `role="status"` + CTA buat root, error invalid `role="alert"` + id + salin detail, error eksternal di atas diagram tetap tampil (FR-013, S-005.33)

### AC-03 — Operasi penuh tanpa mouse + pohon SR

**Given** hanya keyboard + screen reader
**When** Tab dari toolbar → kanvas → node → inspector → pohon alternatif `role="tree"`
**Then** tambah/pindah/hapus/edit/collapse/search semua bisa tanpa mouse (reuse pola 003: roving tabindex, `↑↓→←`, `Home/End`, `Enter`), pohon alternatif terbaca sebagai hierarki, fokus ring `primary` 2px terlihat, `motion-safe` dihormati (FR-012, S-005.33)

### AC-04 — Showcase + audit + smoke hijau

**Given** halaman `/patterns/org-chart-editor` ±40 orang + toolbar + inspector + minimap + papan keyboard + catatan a11y
**When** dibuka light dan dark + `pnpm -C apps/showcase build` + audit kontras
**Then** alur end-to-end teramati, teks ≥4.5:1 dan non-teks ≥3:1 (edge, ring, strip, controls, minimap), tanpa hex literal, build lolos (FR-014, FR-016, S-005.33)

## Tasks

- [ ] Showcase controlled page: state di page (`data` + `onChange`), toolbar (tambah/undo/redo/orientasi/fit), pencarian + live region, pemicu state, papan keyboard, catatan a11y
- [ ] Pohon alternatif `role="tree"` (reuse 003) sebagai tab kedua / visually-hidden + tombol aksi per baris
- [ ] Audit: keyboard penuh, SR (tree + live region), kontras light/dark (teks + edge + ring + minimap), `prefers-reduced-motion`
- [ ] Test: highlight + auto-expand, live region, state matrix 4 kondisi, pohon alternatif ada + fokusable
- [ ] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test` → `pnpm -C apps/showcase build`

## Dependencies

- Story/CR lain: 010-01, 010-02, 010-03 (showcase merangkum semuanya; kerjakan terakhir)
- Package: tanpa dependency baru

## Notes

- Risiko: showcase terlalu besar satu file — mitigasi pecah ke `_components/` di route.
- Keputusan: state showcase controlled sebagai resep konsumen (design §8); handler demo mock log/toast.
