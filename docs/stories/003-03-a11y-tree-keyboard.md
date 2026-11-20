# 003-03 — A11y penuh: role tree, navigasi keyboard node, dua mode fokus

Status: approved (gate 3)
PRD: `docs/prd/003-org-chart.md`
FR: `FR-010` (penguat `FR-005`, `FR-003`)
Screens: `S-005.28`
Goal: Diagram dapat dibaca screen reader sebagai pohon (`role="tree"`/`treeitem`), navigasi antar node via keyboard mengikuti pola `dnd/tree-view`, expander terjangkau keyboard, dan fokus terlihat jelas di light & dark.

## Acceptance Criteria

### AC-01 — Struktur ARIA pohon tanpa duplikat

**Given** diagram dirender dari hierarki valid
**When** struktur DOM diperiksa
**Then** kanvas punya `role="tree"` + `aria-label` (default 'Org chart'), node `role="treeitem"` dengan `aria-level`, `aria-expanded` (bila punya anak), `aria-selected`; tanpa duplikat pohon tersembunyi — single source of truth (design D9, FR-010, S-005.28)

### AC-02 — Navigasi keyboard node lengkap

**Given** fokus berada pada sebuah node (roving tabindex)
**When** user menekan `↑`/`↓` (node visible berikut/sebelumnya, urutan DFS), `→` (expand / masuk anak), `←` (collapse / ke parent), `Home`/`End`, atau `Enter`/`Space`
**Then** semua aksi berjalan tanpa mouse sesuai wireframe §5; `Enter`/`Space` memanggil `onSelect`; navigasi mengikuti pola `dnd/tree-view` — diverifikasi test interaksi (FR-010, FR-005, FR-003, S-005.28)

### AC-03 — Expander keyboard & fokus terlihat

**Given** expander icon-button ≥ 32×32 pada node beranak
**When** dicapai dan diaktifkan via keyboard
**Then** expander toggle expand/collapse dengan `aria-label` berubah "Perluas <nama>" / "Collapse <nama>"; focus ring token `primary` (offset 2px) terlihat jelas di light & dark; node `disabled` dilewati fokus dan tidak bisa select (FR-010, FR-003, S-005.28)

### AC-04 — Reduced motion dihormati

**Given** `prefers-reduced-motion` aktif
**When** expander berputar atau transisi state berjalan
**Then** transisi transform dan expander dimatikan (wireframe §5, FR-010, S-005.28)

## Tasks

- [ ] Roving tabindex + peta tombol node (`↑↓`, `→←`, Home/End, Enter/Space) mengikuti pola `dnd/tree-view`
- [ ] ARIA: `role="tree"` + `aria-label` kanvas, `treeitem`/`group`, `aria-level`/`aria-expanded`/`aria-selected`
- [ ] Expander keyboard: `aria-label` dinamis, target ≥ 32×32, rotasi ikon saat terbuka
- [ ] Focus ring kontras light & dark (`ring` token `primary`, offset 2px); skip node `disabled`
- [ ] `prefers-reduced-motion`: matikan transisi transform + expander
- [ ] Test co-located: navigasi panah DFS, expand/collapse + Enter/Space select, atribut ARIA, disabled skip, reduced motion
- [ ] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`

## Dependencies

- Story/CR lain: `003-02` (node + expander + select pointer sudah ada)
- Package: tanpa dependency baru; referensi pola `dnd/tree-view.tsx` (bukan basis visual)

## Notes

- Risiko: dua mode fokus (kanvas pan/zoom vs node navigasi) bisa saling mengganggu — mode kanvas pan/zoom keyboard adalah scope `003-04`; story ini hanya mengunci mode node agar tab order dasar tetap benar.
- Keputusan: keyboard Enter dihitung sebagai jalur `onSelect` (FR-005) sekaligus bukti FR-010, bukan scope baru.
