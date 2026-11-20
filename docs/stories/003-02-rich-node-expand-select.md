# 003-02 — Node kaya, aksen departemen, expand/collapse, select

Status: done
PRD: `docs/prd/003-org-chart.md`
FR: `FR-002`, `FR-003`, `FR-005`, `FR-007`
Screens: `S-005.28`
Goal: Anatomy node lengkap (avatar, title, subtitle, badge, strip aksen), konten custom via `renderNode`, expand/collapse uncontrolled & controlled, dan `onSelect` — dengan aksen departemen dari token semantik yang lolos kontras light & dark.

## Acceptance Criteria

### AC-01 — Node kaya default

**Given** node dengan `avatarSrc`, `title`, `subtitle`, `badge`, dan `accent`
**When** dirender
**Then** kartu 200×72 (radius `--radius`, permukaan `card`, border `border`) menampilkan avatar compose dengan fallback inisial, title `foreground` 1 baris ellipsis, subtitle `muted-foreground`, badge departemen beraksen, dan strip aksen 3px di tepi kiri; expander icon-button ≥ 32×32 hanya muncul bila node punya anak (FR-002, S-005.28)

### AC-02 — Konten custom via renderNode tetap dalam token

**Given** konsumen menyediakan `renderNode`
**When** node dirender
**Then** isi tengah diganti render prop; expander dan strip aksen tetap milik komponen (wireframe §2); konten custom memakai pasangan token yang lolos audit kontras light & dark (FR-002, S-005.28)

### AC-03 — Expand/collapse uncontrolled & controlled sama bekerja

**Given** dataset dengan subtree; skenario uncontrolled (`defaultCollapsedIds`) ATAU controlled (`expandedIds` + `onExpandedChange`)
**When** expander diklik
**Then** subtree beserta konektor anaknya hilang dari render dan kembali saat expand; kedua mode menghasilkan perilaku identik; `onExpandedChange` terpanggil dengan ids terbaru — diverifikasi test (FR-003, FR-004, S-005.28)

### AC-04 — onSelect dipanggil dengan data node

**Given** node dalam keadaan aktif
**When** node diklik
**Then** `onSelect` terpanggil dengan `OrgNodeNormalized` node tersebut; `selectedId` menampilkan state selected (border + ring `primary`, `aria-selected`); node `disabled` tidak bisa dipilih (FR-005, S-005.28)

### AC-05 — Aksen departemen kontras light & dark

**Given** dua departemen dengan `accent` berbeda (mis. `success` dan `info`)
**When** dirender di light dan dark
**Then** strip + badge memakai token semantik (`primary/success/warning/info/destructive`), tanpa hex literal; pasangan aksen di atas permukaan `card` diverifikasi ulang di kedua mode (FR-007, S-005.28)

## Tasks

- [x] Anatomy node sesuai wireframe §2: avatar/title/subtitle/badge/strip aksen/expander (compose `base/avatar`, `base/badge`)
- [x] Slot `renderNode` + area aksi sekunder kosong (slot konsumen, v1 default kosong)
- [x] Expand/collapse: `defaultCollapsedIds` (uncontrolled, default terbuka, tanpa auto-collapse) & `expandedIds` + `onExpandedChange` (controlled); collapse menyembunyikan subtree + konektor anak (design D4)
- [x] `onSelect` klik + state `selectedId` (border + ring `primary`); node `disabled` skip interaksi
- [x] Aksen token semantik per node; verifikasi ulang kontras strip aksen di atas `card` light & dark (test/catatan audit)
- [x] Test co-located: anatomy node, fallback avatar, controlled vs uncontrolled, payload onSelect, konektor ikut hilang saat collapse
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`

## Dependencies

- Story/CR lain: `003-01` (fondasi normalisasi + layout + konektor)
- Package: compose `base/avatar`, `base/badge` existing; tanpa dependency baru

## Notes

- Risiko: strip aksen di atas permukaan `card` berpotensi gagal kontras di salah satu mode — mitigasi verifikasi ulang eksplisit (design §6).
- Audit kontras strip aksen di atas `card` (tema default pulse, konversi OKLCH→sRGB via `@csstools/color-helpers`): light primary 7.78, success 6.51, warning 4.03, info 5.09, destructive 5.43; dark primary 6.37, success 6.97, warning 8.25, info 6.81, destructive 4.64 — semua > 3:1 (WCAG grafis non-teks); test mengunci kelas token semantik tanpa hex literal.
- Keputusan: `Enter` keyboard select masuk scope `003-03` bersama navigasi keyboard (FR-010); story ini mengunci perilaku pointer.
