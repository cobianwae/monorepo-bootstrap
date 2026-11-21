# 018 — Permission / Role Matrix

Status: approved
Owner: —
Tanggal: 2026-11-21
Sumber: roadmap RM-17 (`docs/discussions/component-roadmap.md`)

## Problem

Manajemen role × permission butuh grid matriks standar (baris resource × kolom
role, sel checkbox). Hari ini tidak ada komponen matriks di `packages/ui` —
konsumen merakit tabel + checkbox manual dengan risiko header tak berasosiasi,
state indeterminate hilang, dan aksi massal tidak konsisten.

Bukti/konsekuensi:

- Pola `S-005.23` Settings dan `S-005.14` Master Data menyentuh manajemen akses
  tanpa komponen matriks reusable.
- Transfer list (RM-02) menangani *assignment* anggota, bukan *authorization*
  per resource — keduanya komplemen, bukan duplikat.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Matriks role × resource standar | Grid 5×8 tanpa komponen custom | Scenario + test hijau |
| Aksi massal konsisten | Toggle baris/kolom + indeterminate benar | Semua tercover test + scenario |
| Grid accessible | Header terasosiasi + keyboard | Lolos audit WCAG 2.1 AA |
| Tanpa dependency baru | Compose pola tabel + checkbox existing | Dependency tercatat di constraints |

## Non-goals

- Sistem RBAC backend (definisi role, evaluasi izin milik konsumen/API).
- Assignment anggota ke role (milik transfer list RM-02).
- Riwayat perubahan/audit (konsumen via `onChange` diff).
- Sel selain boolean di v1 (level akses bertingkat — lihat FR-010).

## User & Use Case

Persona (ringkas):

1. **Admin keamanan** — mengatur izin 5 role atas 8 resource; butuh toggle
   se-kolom ("semua Editor bisa Publish") dan melihat ringkasan perubahan.
2. **Developer konsumen DS** — butuh grid controlled (`value`/`onChange`) dengan
   sel yang bisa dikunci.

JTBD:

- "When saya mengubah izin, I want toggle sebaris/sekolom sekaligus,
  so I can tidak mencentang 40 sel satu per satu."
- "When saya salah ubah, I want melihat apa yang berubah dan reset,
  so I can yakin sebelum menyimpan."

Skenario utama:

1. Grid 5 role × 8 resource; klik header kolom "Editor" → semua sel Editor
   menyala; header menunjukkan indeterminate bila sebagian.
2. Sel "Viewer × Hapus" dikunci (disabled + tooltip alasan).
3. Ubah 3 sel → banner "3 perubahan belum disimpan" + tombol Reset/Simpan
   (simpan memanggil `onChange` batch milik konsumen).

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Grid role × resource dengan sel checkbox boolean + header baris/kolom terasosiasi. | must | Grid 5×8 teramati; header memakai scope yang benar (test). |
| FR-002 | Toggle massal per baris/per kolom/semua dengan state indeterminate yang benar. | must | Indeterminate tampil saat sebagian terpilih; toggle membalik dengan benar (test). |
| FR-003 | Nilai controlled (`value`/`onChange`) + state dirty (daftar perubahan) + reset. | must | `onChange` dipanggil sekali per aksi dengan diff; reset mengembalikan awal (test). |
| FR-004 | Sel/baris/kolom disabled dengan alasan (tooltip) — mis. izin terkunci kebijakan. | should | Sel terkunci tidak bisa diubah via pointer maupun keyboard. |
| FR-005 | Ringkasan perubahan (hitung + daftar) dan slot aksi Simpan/Batal milik konsumen. | should | Banner ringkasan tampil hanya saat dirty. |
| FR-006 | Navigasi keyboard grid (panah antar sel, Space toggle, shortcut baris/kolom). | must | Audit a11y lolos; grid penuh tanpa mouse. |
| FR-007 | State matrix: loading (skeleton grid), empty (tanpa role/resource + CTA), error (data invalid + penyebab). | must | Tiga state teramati di scenario showcase. |
| FR-008 | Dark mode dan kontras: sel, header, indeterminate memakai token dan lolos audit light & dark. | must | Scenario light & dark lolos audit kontras. |
| FR-009 | Showcase scenario matriks interaktif (toggle massal, kunci, dirty) dalam light & dark. | must | Route scenario tersedia dan lolos smoke build. |
| FR-010 | Sel bertingkat (mis. Lihat/Ubah/Hapus per sel) sebagai select. | could | Catatan desain di gate 2; tidak wajib di v1. |

## Design Refs

- Screen: `S-005.41` Permission Matrix (`/patterns/permission-matrix`) — baru, diusulkan di PRD ini.
- Komponen terkait: `data-display/data-table.tsx` (referensi pola grid),
  `form/checkbox.tsx` (sel + indeterminate), `base/badge.tsx` (hitung dirty),
  `feedback/empty-state.tsx`, `overlay/tooltip.tsx` (alasan kunci).
- Analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (tabel §4),
  roadmap RM-17; komplemen spec RM-02 transfer list.

## Constraints & Dependencies

- Dependency package: **tanpa dependency baru** — compose `checkbox` + pola
  tabel existing.
- Teknis: komponen di `packages/ui` kategori `data-display`; API controlled
  sederhana (`value: Record<role, Record<resource, boolean>>` atau setara —
  final di gate 2).
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA, light/dark parity, test
  Vitest + Testing Library co-located, alur gate AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Bentuk `value`: nested record vs array grant `{role, resource}`? | open — usulan: nested record |
| 2 | Apakah FR-010 (sel bertingkat) masuk v1? | open — usulan: tidak, `could` |
| 3 | Batas ukuran grid wajar di v1 (sticky header untuk 20+ kolom)? | open — usulan: sticky header + scroll horizontal |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-21 | Draft awal dari roadmap RM-17 |
| 2026-11-21 | **Approved (gate 1)** — OQ dibawa ke gate 2 sebagai risiko/desain |
