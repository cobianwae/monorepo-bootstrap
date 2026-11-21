# 005-01 — Fondasi canvas + node custom DS

Status: approved
PRD: `docs/prd/005-flow-editor.md`
Design: `docs/design/flow-editor.md`
FR: `FR-001`, `FR-002`, `FR-010`, `FR-012`, `FR-013`
Screens: `S-005.29`
Goal: Canvas xyflow token-mapped hidup dengan controls Indonesia, 2 jenis node DS 220×88 + handle ≥44px, dan state matrix loading/empty/error.

## Acceptance Criteria

### AC-01 — Canvas render + pan/zoom batas wajar

**Given** page showcase dengan `nodes`/`edges` contoh via `defaultNodes`/`defaultEdges`
**When** user drag background, klik controls, `Ctrl+scroll`, tombol `+`/`-`/`0`/`F`
**Then** viewport berubah; zoom terjepit 0.25–2; `0` = atur 100% (`zoomTo(1)`), `F` = selaras tampilan (ikon bingkai, beda dari 1:1); wheel polos tidak mencuri scroll halaman; level zoom diumumkan live region (FR-001, S-005.29)

### AC-02 — Dua jenis node DS deterministik + kontrak a11y

**Given** `nodeTypes` aksi + penunda dari komponen DS
**When** node dirender dengan judul 40+ karakter, deskripsi 2 baris, badge jenis + status
**Then** ukuran tetap 220×88 (tanpa compact); judul 1 baris ellipsis + tooltip; badge tidak truncate; node forward ref + `role="button"` + `aria-selected` + `aria-label` "Node \<judul\>" (FR-002, S-005.29)

### AC-03 — Handle ≥44px + fokus keyboard

**Given** fokus keyboard pada node
**When** `Tab` ke handle input/output
**Then** handle terfokus terlihat (ring `primary`), hit-area ≥ 44px (visual ≥ 12px + padding transparan), `aria-label` "Input/Output \<judul\>" (FR-002, FR-011, S-005.29)

### AC-04 — State matrix loading/empty/error

**Given** props `loading` / `nodes=[]` / `error + onRetry`
**When** showcase memicu tiap state via panel demo
**Then** skeleton + `aria-busy` + teks SR "Memuat flow…"; empty `role="status"` + CTA [Tambah node pertama]; error `role="alert"` + [Coba lagi] memanggil `onRetry`; tanpa warna-saja (FR-013, S-005.29)

### AC-05 — Kontrak controlled + uncontrolled demo

**Given** konsumen controlled (`nodes`/`edges` + handler) dan demo uncontrolled
**When** viewport digeser / node diklik tanpa mutasi struktural
**Then** tidak ada fetch/persist internal; demo `defaultNodes`/`defaultEdges` bekerja; mutasi struktural menunda ke story 005-03/04/05 (FR-012, S-005.29)

### AC-06 — Token + dark mode + cek cepat edge (audit penuh di 005-06)

**Given** light & dark
**When** cek cepat pasangan `muted-foreground` (garis edge) di atas `background` + inspeksi tanpa default CSS xyflow
**Then** edge ≥ 3:1 grafis pada kedua tema (gagal → ganti token sebelum 005-03); teks ≥ 4.5:1; tanpa token baru; tabel audit penuh dikerjakan di 005-06 AC-04 (FR-010, S-005.29)

### AC-07 — Kontrak history untuk story berikutnya

**Given** story 005-02–04 butuh "push undo" sebelum mesin history ada
**When** story ini selesai
**Then** tersedia kontrak `useFlowHistory` (push saat commit pengguna, apply undo/redo tanpa push-balik, batas `historyLimit`, klon struktural bukan `JSON.stringify`) sebagai antarmuka yang diimplementasi penuh di 005-05; test 005-02–04 boleh mock kontrak ini (FR-007, FR-012, S-005.29)

## Tasks

- [ ] `FlowEditor` di `packages/ui/src/components/canvas/flow-editor.tsx` + `index.ts` export (named)
- [ ] Token-mapping `.xyflow__*` di `packages/ui/src/styles.css` (variable existing; tanpa `border-strong`)
- [ ] Controls token + `aria-label` Indonesia (Perkecil/Tingkat zoom/Perbesar/Selaras tampilan/Atur 100%/Kunci interaksi)
- [ ] `FlowNode`/`FlowNodeData` + 2 `nodeTypes` demo + kontrak a11y D4 + `data-testid` (temuan #10)
- [ ] State matrix: skeleton, empty + CTA, error + retry
- [ ] Test: render + zoom limits + reset-vs-fit + handle focus + state matrix + cek cepat kontras edge
- [ ] Kontrak `useFlowHistory` (tipe + stub/mock) untuk dipakai 005-02–04; implementasi penuh di 005-05
- [ ] Showcase draf route `/patterns/flow-editor` (final di 005-06)

## Dependencies

- Story/CR lain: tidak ada (fondasi pertama)
- Package: `@xyflow/react` 13.0.2 (sudah disetujui, bukan baru); `@ds/tokens`

## Notes

- Risiko: default CSS xyflow bocor — mitigasi: verifikasi tidak ada import `xyflow/dist/style.css`
- Keputusan: single size 220×88 v1; compact ditolak (temuan #4)
