# CR-010 — Org Chart Studio gate-2 follow-up (tutup OQ + perapian approved)

**Status:** approved (2026-11-21, oleh user)
**Sumber:** review artefak `011` (skill `reviewer`)
**Ref:** `docs/prd/011-org-chart-studio.md`, `docs/design/org-chart-studio.md`, `docs/design/wireframes/org-chart-studio.md`, `docs/stories/011-02-tambah-inline-panel-detail.md`, `docs/stories/011-04-cari-keyboard-pohon-sr.md`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `docs/prd/011-org-chart-studio.md:90-95` + `docs/design/org-chart-studio.md:152-158` | OQ#1 (`d3-hierarchy`), OQ#2 (drag vs dialog), OQ#3 (paralel vs breaking) masih `open / butuh approval`, padahal changelog design mengklaim gate 2 mengunci balanced-tidy tanpa dep baru + paralel-deprecated. Keputusan dependency (butuh eksplisit per CONVENTIONS) ambigu dan memblokir kepastian story 011-01 | Tutup OQ eksplisit: OQ#1 = tunda `d3-hierarchy` (balanced-tidy default v1, jalur migrasi via CR bila audit 100-node gagal); OQ#2 = keduanya (drag + dialog M-007 setara keyboard); OQ#3 = paralel-deprecated → hapus saat 011 shipped |
| 2 | major | `docs/design/wireframes/org-chart-studio.md:60` | Expander ditetapkan `≥ 32px`, bertentangan dengan FR-016 (`≥ 44px`) dan AC 011-04 (semua aksi `≥ 44px`) | Samakan dengan pola gagang: visual boleh 24–32px tetapi hit-area `≥ 44px`; ubah baris Expander + tambah catatan hit-area |
| 3 | major | `docs/design/org-chart-studio.md:44` + `docs/design/wireframes/org-chart-studio.md:24,107-120` + `docs/stories/011-02-tambah-inline-panel-detail.md:26` | Pemicu panel `S-005.34.01` tidak konsisten ("Enter ganda / klik avatar" vs "tombol detail / double-click / Enter khusus") dan peta keyboard §5 tidak memuat shortcut buka panel (`Enter` = pilih, `F2` = edit). Jalur keyboard-only ke panel inti tidak jelas | Kunci satu set pemicu: tombol detail `[≡]` per kartu (fokus via Tab) + double-click + klik avatar; keyboard: fokus kartu → `Tab` ke `[≡]` → `Enter`, atau `Shift+Enter` langsung. Sinkronkan D6 + wireframe §1/§5 + AC 011-02/011-04 |
| 4 | minor | `docs/prd/011-org-chart-studio.md:78-79` | Design Refs masih tentatif `S-011.01–.03`; final terkunci `S-005.34` series karena `S-011` dipakai CRM Leads (`docs/design/sitemap.md:85`) | Tambahkan adendum satu baris di PRD (status approved, hanya via CR ini): ID final mengikuti sitemap `S-005.34`/`S-005.34.01`/`M-007`/`M-008` |
| 5 | minor | `docs/stories/011-02-tambah-inline-panel-detail.md:18-22` + `docs/design/flows/org-chart-studio.mmd:31-35` | Perilaku blur-dengan-nama-valid tidak dispesifikasi (hanya Enter/Esc/blur-kosong) | Kunci: blur dengan nama valid menyimpan seperti Enter; perbarui AC-02 011-02 + flow 2 (sudah diterapkan sebagai klarifikasi draft, menunggu konfirmasi) |

## Perubahan yang Diusulkan

- `docs/design/org-chart-studio.md` §10: OQ#1–3 → `decided` sesuai rekomendasi (tanpa ubah D1–D12).
- `docs/design/wireframes/org-chart-studio.md` §2: baris Expander → hit-area `≥ 44px`; §5: tambah shortcut buka panel (`Tab` ke `[≡]` + `Shift+Enter`); §1: samakan daftar pemicu panel.
- `docs/prd/011-org-chart-studio.md`: adendum ID final `S-005.34` series (tanpa ubah requirement).
- `docs/stories/011-02-tambah-inline-panel-detail.md` AC-02 + flow 2: blur-valid menyimpan (klarifikasi sudah diterapkan, tinggal konfirmasi).
- Tidak ada perubahan kode, token, dependency, atau API publik. Dampak implementasi: story 011-01–05 menjadi tanpa ambiguitas sebelum gate 3.

## Tasks (jalur small-fix, docs-only)

- [x] Tutup OQ#1–3 di design §10 + sinkronkan D3/D7/D12 bila perlu (tanpa ubah keputusan teknis).
- [x] Perbaiki baris Expander + shortcut panel di wireframe §1/§2/§5.
- [x] Adendum ID di PRD §Design Refs.
- [x] Verifikasi: grep `S-011.01\|OQ#\|open — butuh\|≥ 32px` bersih dari artefak 011; `node scripts/check-status-log.mjs` hijau (bila STATUS-LOG disentuh).

## Keputusan (diputuskan user 2026-11-21)

| # | Keputusan | Alasan |
|---|---|---|
| 1 | OQ#1 = tunda `d3-hierarchy` (balanced-tidy default v1) | Approved user; tambah dependency butuh eksplisit |
| 2 | OQ#2 = drag + dialog M-007 keduanya | Approved user; tidak ada aksi pointer-only |
| 3 | OQ#3 = paralel-deprecated → hapus saat 011 shipped | Approved user; hindari breaking langsung |
| 4 | CR-009 diselesaikan-dulu, 010 diarsipkan saat 011 shipped | Keputusan user; cegah kerja terbuang / konflik merge |
| 5 | Blur-valid = simpan seperti Enter | Dikonfirmasi user |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (docs-only: tidak terdampak, verifikasi via grep + review diff).

## Eksekusi

Branch: `cr-010-org-chart-studio-gate2-followup`
Commit: `docs: tutup OQ 011 + perapian gate-2 approved [CR-010]`

- [x] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
