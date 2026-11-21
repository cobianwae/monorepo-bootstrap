# 011 — Org Chart Studio (pengganti profesional 003 + 010)

Status: approved
Owner: —
Tanggal: 2026-11-21

## Problem

Editor organisasi saat ini dibangun dua lapis yang tidak menyatu: `OrgChart` data-display (layout tidy-tree buatan sendiri, node 200×72 sesak, pan/zoom manual) ditumpuk `OrgChartEditor` di atas `@xyflow/react`. Hasilnya:

- Visual tidak profesional: kartu sesak selalu truncate ("Engin…"), ruang kosong lebar, garis konektor kaku, zoom/pan terasa ganjil.
- UX tambah node "geli": tiap tambah anak membuka Sheet besar isi 5 field + Simpan untuk aksi 1 detik; tombol `+` kecil 32px mudah salah pencet; node baru muncul tiba-tiba tanpa sorotan.
- Bukti: keluhan user "visual sampah, ux sampah nggak jelas… dari dasar org chart sebelum edit udah aneh… malah ditambah-tambah keanehannya", audit CR-009 (8 blocker + 9 major).

Dampak: user menolak pakai; menambal (CR-009) hanya merapikan permukaan tanpa menyembuhkan arsitektur ganda.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Kartu dan kanvas terlihat profesional | Review user "layak" + tidak ada blocker visual | approved gate 2 tanpa revisi visual mayor |
| Tambah node mudah (< 5 detik) | Uji manual: hover → klik `+` → ketik → Enter | ≤ 3 klik, tanpa buka form |
| Edit aman dan bisa dibatalkan | Semua mutasi (tambah/edit/hapus/pindah) masuk undo + live region | 100% mutasi ter-undo, test hijau |
| Bisa dipakai keyboard + screen reader | Audit a11y mandiri | 0 blocker, pohon SR internal ada |
| Menggantikan yang lama bersih | `003` + `010` berstatus legacy → dihapus saat 011 ship | tidak ada import ke komponen lama tersisa |

## Non-goals

- Sinkronisasi HRIS / fetch server (konsumen tetap pegang data + `onChange`; resep integrasi hanya contoh di showcase).
- Multi-root, forest, atau matrix-report (tetap satu root).
- Kolaborasi realtime, komentar, approval workflow.
- Import/export CSV/PNG/PDF, print layout.
- Field kustom di luar kontrak (title, subtitle, badge, avatar, accent).
- Token warna baru (pakai token semantik existing; audit kontras ikut).

## User & Use Case

- Persona/segmen:
  - Admin HR / People Ops: menyusun struktur org 20–100 orang.
  - Team lead: menambah tim baru, memindahkan anggota antar tim.
- Job-to-be-done:
  - "Tambah bawahan dalam 1 klik tanpa buka form."
  - "Pindahkan orang antar tim dengan drag, bisa di-undo."
  - "Cari orang dan langsung terlihat posisinya."
- Skenario utama:
  1. Buka kanvas → struktur rapi langsung terbaca (root atas, anak menyebar seimbang).
  2. Hover kartu CEO → tombol `+` bawah → klik → kartu baru inline-edit → ketik "Staff Baru" → Enter.
  3. Drag kartu ke tim lain → garis hijau + preview path → lepas → toast "Dipindah — Urungkan".
  4. Cari "engineer" → hasil bergaris putus + badge Cocok → klik hasil → fokus ke node.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Satu komponen `OrgChartStudio` menggantikan `OrgChart` + `OrgChartEditor` (satu layout, satu viewport) | must | tidak ada kode kanvas ganda; test render 40 node |
| FR-002 | Kartu profesional lega (avatar, nama tegas 1 baris, jabatan max 2 baris, badge rapi) + konektor halus 1px + hover/selected jelas | must | review visual gate 2 lolos; tidak ada truncate badge umum |
| FR-003 | Layout otomatis seimbang untuk 1–100 node (lebar subtree proporsional, tidak ada ruang kosong raksasa) | must | screenshot 40-node seimbang; test posisi deterministik |
| FR-004 | Pan/zoom halus (tombol, wheel, pinch, keyboard) + reset 100% + fit view + minimap tidak mengganggu | must | uji manual + test klik reset |
| FR-005 | Tambah bawahan/sibling 1 klik via gagang `+` bawah/samping saat hover/fokus; node baru langsung inline-edit (Enter simpan, Esc batal) | must | tambah ≤ 3 klik tanpa buka form; test e2e |
| FR-006 | Detail lengkap (foto, badge, aksen) di panel samping, dibuka hanya bila perlu (bukan tiap tambah) | must | tambah tidak pernah buka panel; test |
| FR-007 | Pindah via drag (garis valid/invalid + preview) dan via dialog (setara keyboard) | must | kedua jalur ada; siklus/diri ditolak + pesan |
| FR-008 | Hapus dengan konfirmasi + hitungan turunan + proteksi root + undo | must | dialog sebut N turunan; test hapus→undo |
| FR-009 | Undo/redo mencakup tambah/edit/hapus/pindah (batas 50) via toolbar + Ctrl+Z/Y + live region | must | test round-trip persis |
| FR-010 | Cari nama/jabatan → sorot non-warna-saja + auto-expand path + live region jumlah hasil | must | test search + expand |
| FR-011 | Keyboard penuh (Tab logis, Enter pilih, F2/Ctrl+Enter edit, Space expand, Delete hapus, Ctrl+Z/Y) + pohon SR internal (`role=tree`) | must | audit 0 blocker; test keyboard |
| FR-012 | State matrix: loading skeleton + teks SR, empty + CTA buat root, error invalid (id + salin) + error eksternal di atas diagram | must | 6 demo di showcase |
| FR-013 | Controlled data (`data` + `onChange` sekali per commit) + `expandedIds`/`onExpandedChange` dengan semantik benar | must | test controlled/uncontrolled |
| FR-014 | Showcase `/patterns/org-chart-studio` berisi langkah end-to-end bernomor + Reset demo + resep integrasi 15 baris | should | ada `ol` + tombol reset |
| FR-015 | Legacy: `003`/`010` + showcase lama ditandai deprecated saat 011 approved, dihapus saat 011 shipped | must | tidak ada import tersisa; BACKLOG diarsip |
| FR-016 | Reduced-motion dihormati (durasi 0, pinch mati) + touch target ≥ 44px | must | uji manual + audit |
| FR-017 | Kontras light & dark lolos AA untuk semua pasangan teks (validator `@ds/tokens`) | must | `pnpm test:tokens` hijau + tabel audit |
| FR-018 | Muat contoh 40 orang 1 klik di showcase | could | tombol "Muat contoh" ada |
| FR-019 | Toast undo tiap mutasi ("Ditambah — Urungkan") | could | toast muncul ≤ 5 dtk |
| FR-020 | Kolaborasi realtime | won't | tidak dikerjakan |

## Design Refs

- Screen: `S-011.01` kanvas studio, `S-011.02` panel detail, `S-011.03` dialog pindah/hapus (final di fase design; `S-005.33` lama jadi legacy).
- Adendum (CR-010, approved 2026-11-21): ID final mengikuti sitemap — `S-005.34` + `S-005.34.01` + `M-007`/`M-008`; usulan tentatif `S-011.01–.03` batal karena `S-011` dipakai CRM Leads.
- Pattern/komponen terkait: `OrgChart` (legacy), `OrgChartEditor` + CR-009 (legacy), `data-display` patterns.
- Dokumen design: dibuat di fase design (`docs/design/org-chart-studio.md` + wireframe + flow).

## Constraints & Dependencies

- Teknis: Next.js 15 + TS; Radix untuk perilaku/a11y; `cva` varian; `cn()` merge; token semantik OKLCH; no `any`.
- Dependency package: layout hierarki butuh keputusan — (a) tambah `d3-hierarchy` (butuh approval user), atau (b) tulis layout seimbang sendiri tanpa dependency baru. Rekomendasi: (a).
- `@xyflow/react` tetap sebagai viewport (sudah ada) — bukan dependency baru.
- Batasan waktu/lingkungan: satu sesi satu PRD; implementasi dipecah story setelah gate 2; tidak ada merge tanpa approval.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Tambah `d3-hierarchy` untuk layout? (rekomendasi: ya) | open — butuh approval user |
| 2 | Drag-pindah dipertahankan atau dialog saja? (rekomendasi: keduanya, dialog setara keyboard) | open |
| 3 | Legacy langsung diganti total (breaking) atau paralel deprecated dulu? (rekomendasi: paralel deprecated → hapus saat ship) | open |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-21 | Draft awal: bangun ulang profesional sebagai satu fitur; 003 + 010 jadi legacy |
| 2026-11-21 | Adendum CR-010 (approved): ID final S-005.34 series; OQ#1–3 decided (tunda d3 / drag+dialog / paralel); CR-009 diputuskan diselesaikan-dulu |
