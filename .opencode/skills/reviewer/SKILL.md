---
name: reviewer
description: Review artefak design system dengan 4 lensa — koherensi dokumen, kepatuhan design system, UX/UI, dan implementation drift. Menghasilkan temuan severity dan CR.
tags: [design-system, review, audit, findings, cr, quality]
compatibility: [next, opencode, claude, cursor]
---

# Reviewer

## Kapan Pakai

Saat `/review`, setelah implementasi, atau sebelum artefak dinaikkan status.
Reviewer menilai **artefak dan hasil kerja**, bukan melakukan audit kode mendalam.

## 4 Lensa

### 1. Koherensi Dokumen

- PRD, design, story, dan CR saling konsisten.
- Semua `FR-NNN` tercakup.
- Screen ID dan requirement ID valid.
- Tidak ada keputusan yang hilang atau bertentangan.
- Status artefak sesuai siklus.

### 2. Kepatuhan Design System

- Token semantik; tidak ada hex/RGB hardcode.
- OKLCH dan light/dark parity.
- Radix untuk perilaku/a11y.
- `cva` untuk varian; `cn()` untuk merge.
- Named export dan barrel export.
- Tidak ada duplikasi komponen/pattern.
- State loading, empty, dan error tersedia.

### 3. UX/UI

- Hierarki visual jelas.
- Spacing dan tipografi konsisten.
- Microcopy jelas dan tidak generik.
- Responsif dan keyboard-friendly.
- Tidak ada dark pattern.

### 4. Implementation Drift

- Kode sesuai spec dan AC.
- Showcase mencerminkan komponen sebenarnya.
- Test menutup perilaku penting.
- Docs diperbarui.
- Tidak ada dependency atau perubahan API di luar scope.

## Severity

| Severity | Arti | Tindakan |
|---|---|---|
| `blocker` | Melanggar a11y, merusak data, atau tidak bisa merge | Wajib diperbaiki |
| `major` | Menyimpang dari spec/AC atau menimbulkan risiko | Perbaiki sebelum `done` |
| `minor` | Kosmetik, konsistensi kecil, docs | Boleh menyusul via CR |

A11y violation selalu `blocker` atau `major`, bukan `minor`.

## Findings Table

```text
# | severity | lensa | lokasi | deskripsi | rekomendasi
```

- `lokasi` wajib `path:line` atau ID artefak.
- Deskripsi harus spesifik, bukan opini umum.
- Rekomendasi harus bisa dieksekusi.

## CR Rules

- Temuan pada artefak `approved`/`shipped` atau story `review`/`done` → **draft CR**, bukan edit langsung.
- Artefak `draft` boleh diedit hanya dengan konfirmasi user.
- Satu CR untuk satu cluster temuan yang koheren.
- CR mengikuti `docs/cr/TEMPLATE.md`.

## Output Format

```md
# Review — <artefak>

## Ringkasan
- Blocker: N | Major: N | Minor: N
- Status: layak / perlu perbaikan / perlu CR

## Temuan
| # | Severity | Lensa | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|---|

## CR yang Diusulkan
- `CR-NNN` — judul

## Keputusan
- —
```

## Done Definition

- Tidak ada `blocker`.
- `major` sudah diperbaiki atau dipindahkan ke CR approved.
- `minor` terdokumentasi.
- Status artefak diperbarui oleh user.

## Boundaries

- **`reviewer`** — review artefak dan koherensi.
- **`ui-ux-auditor`** — audit kode mendalam, menjalankan lint/test, read-only.
- **`designer`** — membuat spec desain, bukan menilai.
- **`ui-designer`** — memperbaiki tampilan, bukan menilai artefak.

## Anti-Patterns

- ✗ Menilai selera pribadi tanpa prinsip.
- ✗ Temuan tanpa `file:line`.
- ✗ Mengedit artefak approved tanpa CR.
- ✗ Mencampur audit kode dan review dokumen.
- ✗ Semua temuan dianggap blocker.

## Integration

- **Sebelum**: `prd-writer`, `designer`, `story-writer`.
- **Sesudah**: CR, `/implement`, `ui-ux-auditor`.
