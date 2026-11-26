---
name: prd-writer
description: Template dan quality bar PRD design system — problem-first, requirement FR-NNN, non-goals, dan gate 1. Gunakan saat /prd atau sebelum menulis docs/prd/NNN-slug.md.
tags: [design-system, prd, product, requirements, workflow, gate-1]
compatibility: [next, opencode, claude, cursor]
---

# PRD Writer

Filosofi: PRD menjawab **masalah apa yang diselesaikan**, bukan komponen apa yang dibuat. Problem-first, testable, dan batas scope yang jelas; detail solusi ada di fase design/story.

Dipakai saat `/prd`, atau sebelum menulis `docs/prd/NNN-slug.md`.

## Aturan dasar

- **Problem-first** — mulai dari masalah user/tim dan buktinya, bukan solusi. Objeknya token, komponen, pattern, atau scenario design system.
- **Testable** — setiap requirement harus bisa diverifikasi objektif. Kata ambigu seperti "cepat", "mudah", "user-friendly" DILARANG; pakai angka atau kondisi terukur.
- **Non-goals sama penting dengan goals** — di sinilah scope creep mati.
- **Tanpa solutioning berlebih** — detail implementasi komponen masuk design/story; jangan mengunci implementasi lebih dari yang perlu.
- PRD tidak boleh naik ke `approved` selama masih ada open question tanpa keputusan. Status `approved` hanya ditetapkan user.
- FR ditulis polos `FR-NNN` hanya di dalam file PRD-nya; di artefak lain (design, story, review) wajib qualified `NNN.FR-NNN`. Berlaku untuk artefak baru; artefak lama tidak di-retrofit.

## Template

```md
# NNN — Judul

Status: draft
Owner: —
Tanggal: YYYY-MM-DD

## Problem

Masalah yang dialami user atau tim. Sertakan bukti bila ada.

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| — | — | — |

## Non-goals

- [Hal yang secara eksplisit TIDAK dikerjakan + alasannya — minimal 2 item]

## User & Use Case

- Persona/segmen:
- Job-to-be-done:
- Skenario utama:

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | — | must | — |
| FR-002 | — | should | — |

## Design Refs

- Screen: `S-NNN`
- Pattern/komponen terkait:
- Dokumen design:

## Constraints & Dependencies

- Teknis:
- Dependency package:
- Batasan waktu/lingkungan:

## Open Questions

| # | Pertanyaan | Keputusan | Tanggal |
|---|---|---|---|
| 1 | — | — | — |

## Changelog

| Tanggal | Perubahan |
|---|---|
| YYYY-MM-DD | Draft awal |
```

## Requirement Rules

- ID `FR-NNN` berurutan dalam satu PRD, urut sesuai prioritas.
- Priority memakai MoSCoW: `must`, `should`, `could`, `won't`. Jangan membuat semua requirement `must`.
- Satu requirement = satu perilaku yang bisa diuji.
- Setiap requirement punya acceptance signal (cara tahu requirement terpenuhi).
- Referensikan screen ID bila sudah diketahui.
- Jangan menulis detail implementasi komponen di PRD.
- Requirement lintas PRD memakai format `NNN.FR-NNN`.

## File Naming

- File: `docs/prd/NNN-slug.md`
- Nomor berikutnya: cek `docs/prd/` dan `docs/BACKLOG.md`.
- Slug: kebab-case, singkat, bahasa Inggris.
- Daftarkan di `docs/BACKLOG.md` dengan status `draft`.

## Quality bar review (gate 1)

Sebelum meminta user review, cek:

1. Setiap FR punya ID unik, testable (tanpa kata ambigu), priority, dan acceptance signal.
2. Setiap goal punya metric, setiap metric terukur (ada target).
3. Non-goals terisi — minimal 2 item.
4. Semua open questions terjawab, atau terdaftar dengan keputusan dan tanggal.
5. Design refs dan dependencies dicatat.
6. Tidak ada detail solusi/UX yang mengunci implementasi lebih dari yang diperlukan.

## Format ringkasan untuk user

- File PRD, jumlah FR per prioritas, non-goals, dan open question yang masih menunggu keputusan user.
- Minta gate 1. JANGAN menulis story sebelum PRD `approved`.

Skill terkait: sebelum `product-ux` (framing, persona, JTBD, MoSCoW); sesudah `designer` (object model, sitemap, flow, wireframe); review lewat `reviewer`.
