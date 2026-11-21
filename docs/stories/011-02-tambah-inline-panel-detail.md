# 011-02 — Tambah 1-klik inline-edit + panel detail on-demand

Status: todo
PRD: `docs/prd/011-org-chart-studio.md`
Design: `docs/design/org-chart-studio.md`
FR: `FR-005`, `FR-006`, `FR-013`, `FR-016`, `FR-019`
Screens: `S-005.34`, `S-005.34.01`
Goal: Tambah bawahan/sejawat ≤ 3 klik via gagang `+` langsung inline-edit di kartu, dan panel detail hanya dibuka bila diminta.

## Acceptance Criteria

### AC-01 — Tambah 1-klik tanpa buka form

**Given** kartu fokus/hover dengan gagang bawah (bawahan) dan samping (sejawat) terlihat
**When** gagang diklik (atau Enter saat gagang fokus) → ketik nama → Enter
**Then** kartu baru muncul tersorot di posisi benar + mode inline-edit aktif, seluruh alur ≤ 3 klik tanpa membuka panel/form, fokus pindah ke kartu baru (FR-005, S-005.34)

### AC-02 — Inline-edit aman: Enter/Esc/kosong

**Given** kartu baru dalam mode inline-edit
**When** Enter dengan nama valid / Esc / blur dengan nama kosong
**Then** Enter atau blur dengan nama valid menyimpan (satu `onChange` + push undo + toast), Esc membuang kartu dan fokus kembali ke parent, nama kosong ditolak inline (`aria-invalid` + pesan, tetap edit) (FR-005, FR-013, S-005.34)

### AC-03 — Panel detail tidak auto-buka, lengkap bila diminta

**Given** alur tambah selesai dan kartu existing dipilih
**When** tambah committed / tombol `[≡]` / double-click / klik avatar / `Shift+Enter` pada kartu existing
**Then** tambah tidak pernah membuka `S-005.34.01`; panel hanya terbuka bila diminta (tombol `[≡]` / double-click / klik avatar; keyboard `Shift+Enter` atau `Tab` ke `[≡]`) dan berisi avatar besar, badge, breadcrumb path, meta atasan/anak, form edit (title/subtitle/badge/accent) + tombol pindah/hapus (FR-006, S-005.34.01)

### AC-04 — Commit sekali + hit-area gagang

**Given** tambah dan edit panel
**When** tiap commit + inspeksi sentuh
**Then** tiap mutasi tepat satu `onChange(flat)` (controlled demo terverifikasi), toast "Ditambah — Urungkan" ≤ 5 dtk memanggil undo, dan hit-area gagang ≥ 44px walau visual 24px (FR-013, FR-019, FR-016, S-005.34)

## Tasks

- [ ] Gagang `+` bawah/samping: muncul saat hover/fokus, `aria-label` per parent, keyboard Enter/Space, hit-area 44px
- [ ] Inline-edit di kartu (`input` + hint "Enter simpan · Esc batal"); validasi nama wajib; sorotan kartu baru
- [ ] Panel `S-005.34.01` sheet kanan 320px (overlay di mobile): breadcrumb, meta, form edit + tombol pindah/hapus (dialog di 011-03)
- [ ] Wiring `data` + `onChange` sekali-per-commit + undo-push pertama (stack penuh di 011-03); toast Urungkan
- [ ] Test: tambah bawahan/sejawat ≤3 klik, Enter/Esc/kosong, panel tidak auto-buka, `onChange` sekali, hit-area
- [ ] Showcase: tambah seksi draf di route studio (scope penuh di 011-05)

## Dependencies

- Story/CR lain: 011-01 (fondasi kanvas + layout + kartu)
- Package: `base/avatar`, `base/badge`, `base/tooltip`, `overlay/sheet`, `overlay/toaster` — tanpa dependency baru

## Notes

- Risiko: gagang kecil sulit dipencet di mobile — mitigasi hit-area diperluas + tetap tersedia via panel/menu konteks
- Keputusan: edit penuh tetap di panel (FR-006); inline-edit hanya untuk nama cepat + F2/Ctrl+Enter di kartu existing (keyboard penuh di 011-04)
