# 003-01 — Fondasi OrgChart: normalisasi data, layout tidy-tree, render diagram + konektor

Status: done
PRD: `docs/prd/003-org-chart.md`
FR: `FR-001`, `FR-004`
Screens: `S-005.28`
Goal: Komponen inti `OrgChart` di `packages/ui` menerima data flat/nested, menormalisasi dan memvalidasi, menghitung layout tidy-tree deterministik, dan merender diagram node + konektor ortogonal dari token — tanpa dependency baru.

## Acceptance Criteria

### AC-01 — Input flat & nested menghasilkan render sama

**Given** dataset hierarki yang sama dalam dua bentuk: flat list `id`/`parentId` dan nested tree
**When** keduanya dipasang ke `OrgChart`
**Then** normalisasi menghasilkan struktur internal identik (urutan anak stabil mengikuti urutan masuk data) dan setiap node dirender pada depth/posisi yang sama — diverifikasi test, tanpa preprocessing oleh konsumen (FR-001, S-005.28)

### AC-02 — Data invalid ditolak dengan pesan jelas, tanpa throw

**Given** data dengan `id` duplikat, `parentId` tidak ditemukan, siklus, atau root ≠ 1
**When** dirender
**Then** komponen menghasilkan deskriptor error terstruktur (penyebab spesifik + id pelanggaran pertama) dan tidak melempar exception; ditest untuk tiap jenis pelanggaran (FR-001, S-005.28)

### AC-03 — Layout tidy-tree deterministik

**Given** tree dengan kedalaman ≥ 3 dan lebar subtree bervariasi
**When** layout dihitung
**Then** posisi node deterministik dari lebar subtree (slot node 200×72, gap 32, jarak tingkat 56; design §3), anak terurut stabil, dan hasil layout di-memo terhadap `data + expanded + orientation` (FR-004, S-005.28)

### AC-04 — Konektor ortogonal dari token

**Given** parent dengan ≥ 2 anak dalam keadaan terbuka
**When** diagram dirender
**Then** tiap parent punya satu path elbow pada layer SVG di bawah node (turun gap/2 → bus horizontal → turun ke tiap anak), stroke token `border` 2px, tanpa nilai warna literal (FR-004, S-005.28)

## Tasks

- [x] Buat `packages/ui/src/components/data-display/org-chart.tsx` + tipe publik inti (`OrgNodeFlat`, `OrgNodeNested`, `OrgChartInput`, `OrgNodeNormalized`, `OrgChartAccent`, `OrgChartProps`) sesuai design §2
- [x] Normalisasi + validasi memoized: flat ↔ nested, id duplikat, parent hilang, siklus (DFS dari root), root ≠ 1 → deskriptor error terstruktur (design D2)
- [x] Algoritma tidy-tree sederhana (post-order lebar subtree) + konstanta layout 200×72 / gap 32 / level 56
- [x] Render hanya node expanded + layer SVG konektor elbow per parent (stroke token `border`, design §3)
- [x] Barrel export di `packages/ui/src/index.ts`
- [x] Test co-located: flat = nested, tiap jenis data invalid, determinisme layout, path konektor per parent
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`

## Dependencies

- Story/CR lain: tidak ada (fondasi seri 003)
- Package: tanpa dependency baru (standalone SVG/CSS); tidak menyentuh `packages/tokens` (tanpa token baru)

## Notes

- Risiko: algoritma layout salah untuk subtree lebar — mitigasi test fixture kedalaman 4 dan cabang lebar.
- Keputusan: render hanya node expanded sejak awal (design §3.5) agar pohon 100+ node tetap ringan tanpa virtualisasi.
- Visual error state penuh (panel `role="alert"`, skeleton, empty) adalah scope `003-05` (FR-011); story ini memastikan logika validasi + pesan jelas (FR-001).
