# 012-02 — Tambah inline + hapus M-011 + undo/redo

Status: review
PRD: `docs/prd/012-mind-map.md` (revisi OQ#2/OQ#3 2026-11-21)
Design: `docs/design/wireframes/mind-map.md` + `docs/design/flows/mind-map.mmd`
FR: `FR-002`, `FR-006`
Screens: `S-005.35`, `M-011`
Goal: Ideation 1-klik — tambah anak/saudara via gagang, inline-edit validasi, hapus daun langsung + cabang via M-011, controlled `value`/`onChange` + undo/redo.

## Acceptance Criteria

### AC-01 — Tambah 1-klik inline-edit

**Given** node pill fokus/hover dengan gagang luar + sejajar terlihat
**When** klik gagang atau Enter saat gagang fokus (pointer + keyboard)
**Then** node baru muncul tersorot di posisi layout benar, mode inline-edit aktif, fokus ke input — diverifikasi pointer + keyboard (FR-002, S-005.35)

### AC-02 — Edit inline validasi

**Given** node baru atau node fokus dalam mode edit
**When** Enter/blur valid, Esc, atau blur kosong
**Then** Enter simpan → `onChange` sekali + undo-push + toast; Esc buang node baru/fokus kembali parent; kosong ditolak inline (`aria-invalid` + pesan, tetap edit) (FR-002, FR-006, S-005.35)

### AC-03 — Hapus daun vs cabang + proteksi root

**Given** node daun, node cabang (+N turunan), dan root
**When** Delete/Backspace atau menu hapus
**Then** daun hapus langsung + toast undo; cabang buka M-011 (Radix `AlertDialog`) sebut label + N turunan (selalu hapus subtree v1), konfirmasi → `onChange` + undo; root ditolak + penjelasan (FR-002, S-005.35, M-011)

### AC-04 — Controlled sekali-per-commit + undo/redo

**Given** mutasi tambah/edit/hapus berurutan
**When** tiap commit dan toolbar `Ctrl+Z/Y`
**Then** tiap mutasi = satu `onChange(flat penuh)` + satu push undo (batas 50), undo/redo memanggil `onChange`, live region umumkan status, toast "Dihapus/Ditambah — Urungkan" ≤ 5 dtk (FR-006, S-005.35)

## Tasks

- [x] Gagang `+` luar/sejajar custom handle (hit-area ≥ 44px, `aria-label`), muncul hover/fokus
- [x] Inline-edit di pill via `cva` + `cn()` (Enter/Esc/blur validasi kosong `aria-invalid`)
- [x] M-011 via Radix `AlertDialog` (label + N turunan, proteksi root, fokus-trap, Esc batal)
- [x] `data`/`onChange` controlled + uncontrolled internal demo; undo/redo stack 50 + toolbar + shortcut + live region + toast
- [x] Radix `ContextMenu` tambah/edit/lipat/hapus + Radix `Tooltip` setara pointer
- [x] Barrel export + test co-located (tambah pointer+keyboard, tolak kosong, hapus daun/cabang/root, onChange sekali, undo/redo)

## Dependencies

- Story/CR lain: membutuhkan 012-01 (fondasi `mind-map.tsx` + layout + expand)
- Package: tanpa dependency baru; tanpa drag-reparent (FR-010 ditunda K2/OQ#3 decided)

## Notes

- Risiko: fokus hilang setelah tambah/hapus — mitigasi fokus ke node baru/parent + live region
- Keputusan: K2 FR-010 tunda v1 (tanpa drag); K3 tanpa panel (edit hanya inline, beda dari Studio M-007/M-008)

## Implementasi dan verifikasi — 2026-11-21

- Branch `012-02-tambah-hapus-undo` di worktree `arah-cr`, disinkronkan fast-forward ke `origin/dev` `31a2687` sebelum verifikasi akhir.
- Kontrak additive `onChange(flat: MindNodeFlat[])`; argumen lama `toMindFlowNodes(..., onToggle)` tetap didukung. Draft tambah belum memanggil `onChange`; commit valid menghasilkan satu snapshot dan satu callback.
- Undo/redo dibatasi 50; draft dibuang dari snapshot redo. Toast memakai host `Toaster` konsumen, sesuai pola Studio, dengan aksi Urungkan dan durasi 5000 ms.
- Fokus input baru/edit menunggu menu Radix selesai ditutup; hapus via menu juga menunggu penutupan menu. M-011 mengembalikan fokus ke cabang saat batal atau parent saat konfirmasi.
- Audit a11y berbasis kode/jsdom: target gagang 44px, label input, error `aria-invalid`/`aria-describedby`, live region, fokus input/pill, trap dan Esc dialog. Uji browser/screen reader manual belum dilakukan; showcase dan audit visual/kontras menyeluruh tetap scope 012-03.
- Graphify belum memuat node MindMap pasca 012-01; fallback penelusuran import menunjukkan belum ada konsumen aplikasi. Tidak mengubah token, dependency, atau showcase.
- `pnpm typecheck`: terblokir 12 error baseline `flow-editor.test.tsx:702–749` (`HTMLElement.disabled`, CR-015); tidak ada error MindMap.
- `pnpm lint` dan `pnpm test`: hijau (635 UI termasuk 33 MindMap, 56 showcase, 8 token). Run awal mengalami timeout FlowEditor dan history MindMap; run akhir default hijau sesudah optimasi tes history. Tidak menjalankan build showcase karena tidak ada perubahan showcase; tidak ada perubahan token.
- Tes batas history dioptimalkan memakai 51 edit satu node, bukan menumbuhkan 60 pill; timeout lokal 20 detik tanpa perubahan konfigurasi global.
