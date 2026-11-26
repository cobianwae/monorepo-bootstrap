---
name: reviewer
description: Review artefak design system dengan 4 lensa — koherensi dokumen, kepatuhan design system, UX/UI, dan implementation drift. Menghasilkan temuan severity dan CR.
tags: [design-system, review, audit, findings, cr, quality]
compatibility: [next, opencode, claude, cursor]
---

# Reviewer

Filosofi: review dikerjakan dengan sudut pandang pemeriksa — bukan penulis. Skill authoring (`prd-writer`, `designer`, `story-writer`) adalah baseline kualitas per artefak; review menumpuk di atasnya dengan empat lensa. Reviewer menilai **artefak dan hasil kerja**; audit kode mendalam (lint/test, read-only) milik subagent `ui-ux-auditor`.

## Aturan dasar

1. Reviewer TIDAK mengubah artefak yang direview. Output review = laporan temuan (+ daftar CR yang diusulkan).
2. Temuan pada artefak `approved`/`shipped` atau story `review`/`done` → wajib menjadi CR (template `docs/cr/TEMPLATE.md`). JANGAN menulis ulang artefak yang sudah approved.
3. Temuan pada artefak `draft` → boleh disarankan sebagai edit langsung (eksekusi hanya setelah konfirmasi user).
4. Tidak menaikkan status artefak apa pun — keputusan selalu milik user.
5. Pelanggaran a11y selalu `blocker` atau `major`, bukan `minor`.
6. `/review` berjalan read-only (agent `plan`): draft CR ditulis di sesi terpisah (agent `build`) setelah user meminta.
7. Temuan dinilai dari prinsip (token, `docs/design/visual-language.md`, AC), bukan selera pribadi; jangan menganggap semua temuan `blocker`.

## Empat lensa review

### Lensa 1 — Koherensi dokumen (selalu dijalankan)

Baseline per artefak — jalankan checklist yang sudah ada di skill authoring, jangan duplikasi:

- PRD → quality bar gate 1 di `prd-writer`.
- Design → checklist gate 2 di `designer`.
- Story → quality bar gate 3 di `story-writer`.

Pemeriksaan silang antar-artefak (inti lensa ini):

1. **Integritas ID**: semua FR di luar file PRD-nya qualified `NNN.FR-NNN` (artefak baru); semua screen/modal terdaftar di `docs/design/sitemap.md`; setiap story merujuk FR + screen yang benar.
2. **Coverage dua arah**: setiap FR ter-cover minimal satu screen/flow DAN minimal satu story; sebaliknya tidak ada story yang mengerjakan hal di luar FR mana pun.
3. **Sinkron sitemap ↔ wireframe ↔ flow**: tidak ada screen terdaftar tanpa wireframe/flow; tidak ada flow melewati screen yang tak terdaftar.
4. **Flow end-to-end**: setiap alur punya trigger dan outcome; state error/empty masuk sebagai cabang bermakna.
5. **Kontrak antar-PRD**: perubahan kontrak (mis. `005.FR-011`) tercatat di changelog PRD yang kontraknya berubah.
6. **Konsistensi status**: status di file artefak = status di `docs/BACKLOG.md` = klaim di `docs/STATUS.md`.

### Lensa 2 — Kepatuhan design system (selalu dijalankan untuk artefak yang menyentuh UI)

1. **Token semantik**: komponen memakai kelas semantik (`bg-primary`, `text-muted-foreground`), tidak ada hex/RGB hardcode.
2. **Warna**: OKLCH; setiap foreground punya pasangan background yang lolos kontras; light/dark parity (`pnpm test:tokens`).
3. **Anatomi komponen**: Radix untuk perilaku/a11y, `cva` untuk varian, `cn()` untuk merge; named export + barrel `packages/ui/src/index.ts`.
4. **Tanpa duplikasi**: app tidak menulis ulang komponen/pattern `@ds/ui`; patuhi `docs/design/visual-language.md` (peran warna, heading lewat `SectionHeading`, tanpa `text-[Npx]`, toggle lewat `SegmentedControl`).
5. **State**: setiap tabel/data grid punya loading skeleton dan empty state; state error tersedia.
6. **A11y**: keyboard, `focus-visible`, label, kontras — pelanggaran = `blocker`/`major`.

### Lensa 3 — UX/UI (bila artefak menyangkut screen/flow)

1. **State matrix**: setiap panel/screen punya empty/loading/error/success yang relevan — bukan hanya happy path.
2. **Dead-end**: tidak ada alur yang berhenti tanpa umpan balik atau jalan keluar (termasuk setelah aksi gagal).
3. **Istilah & microcopy**: bahasa Indonesia konsisten antar halaman/komponen — konsep sama, kata sama; pesan error membantu (menyebut sebab/solusi).
4. **Pola interaksi seragam**: aksi destruktif selalu pakai konfirmasi; feedback sukses memakai pola yang sama; list + toolbar + filter mengikuti pola halaman sejenis.
5. **Hierarki & beban kognitif**: satu fokus utama per layar; informasi penting tidak terkubur; form panjang terkelompok jelas; proses async punya tempat untuk melihat status/hasil.
6. **Responsif dan keyboard-friendly**; tidak ada dark pattern.

### Lensa 4 — Drift implementasi (bila menyangkut yang sudah dibangun)

Untuk story `done`/`review` atau fitur yang sudah live:

1. Baca AC story satu per satu → verifikasi di kode: `packages/ui/src/components/`, `apps/showcase/src/`, `packages/tokens/src/`, dan test yang menyertainya.
2. Petakan blast radius tiap perbedaan via graphify (`get_neighbors` dari simbol yang berubah; `shortest_path` bila menyentuh kontrak `packages/shared-types` atau API publik `@ds/ui`) — bedakan drift lokal vs yang merambat ke modul lain.
3. Bandingkan wireframe/anatomy yang terdokumentasi dengan perilaku aktual (termasuk label/istilah yang tampil).
4. Showcase mencerminkan komponen sebenarnya (bukan salinan); test menutup perilaku penting; docs diperbarui.
5. Tidak ada dependency atau perubahan API publik di luar scope.
6. Setiap perbedaan = temuan drift → wajib jadi CR (story sudah done, tidak diedit).

## Skala severity

| Severity | Arti | Contoh |
|---|---|---|
| `blocker` | Kontradiksi, FR tidak terpenuhi/tidak ter-cover, pelanggaran a11y, atau merusak data | FR must tanpa screen; story menutup FR yang tak ada di PRD; fokus keyboard terjebak |
| `major` | Gap berarti pada UX/coverage/drift atau menyimpang dari spec/AC | State error tidak didefinisikan; AC tidak ada jejaknya di kode; warna hardcode |
| `minor` | Konsistensi/penamaan/kelengkapan kecil | Istilah tidak seragam; status BACKLOG telat |

`blocker` wajib diperbaiki; `major` diperbaiki sebelum `done`; `minor` boleh menyusul via CR.

## Format output review

```md
# Review — <artefak>

## Ringkasan
- Blocker: N | Major: N | Minor: N
- Status: layak / perlu perbaikan / perlu CR

## Temuan
| # | Severity | Lensa | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|---|

## CR yang Diusulkan
- `CR-NNN` — judul (klaster temuan #…)
```

- `Lokasi` wajib `path:line` atau ID artefak. Deskripsi spesifik, bukan opini umum; rekomendasi bisa dieksekusi.
- Klasterkan temuan yang berhubungan → **satu masalah satu CR** (jangan CR raksasa).
- Temuan pada artefak `draft` → sarankan edit langsung, tunggu konfirmasi user.
- Bila berjalan di sesi `build` dan user meminta: tulis draft CR per klaster di `docs/cr/cr-NNN-slug.md` (cek nomor urut folder `docs/cr/`), index di `docs/BACKLOG.md` status `draft`, lalu minta user review: setuju / revisi / tolak.

## Definisi selesai

- Semua lensa relevan dijalankan (drift hanya bila menyangkut implementasi yang ada).
- Setiap temuan punya severity + lokasi + rekomendasi, dan terklaster ke CR yang diusulkan.
- Tidak ada artefak approved yang diedit; status artefak hanya diubah oleh user.
