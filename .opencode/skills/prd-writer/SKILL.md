---
name: prd-writer
description: Template dan quality bar PRD design system — problem-first, requirement FR-NNN, non-goals, dan gate 1. Gunakan saat /prd atau sebelum menulis docs/prd/NNN-slug.md.
tags: [design-system, prd, product, requirements, workflow, gate-1]
compatibility: [next, opencode, claude, cursor]
---

# PRD Writer

## Kapan Pakai

Saat `/prd`, atau sebelum menulis `docs/prd/NNN-slug.md`.
PRD menjawab **masalah apa yang diselesaikan**, bukan komponen apa yang dibuat.

## Prinsip

- **Problem-first** — mulai dari masalah user/bisnis, bukan solusi.
- **Testable** — setiap requirement harus bisa diverifikasi.
- **Non-goals eksplisit** — batas scope harus jelas.
- **Tanpa solutioning berlebihan** — detail implementasi masuk design/story.
- **Design-system framing** — objeknya token, komponen, pattern, atau scenario; bukan entity bisnis CRM.

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

- Hal yang secara eksplisit tidak dikerjakan.

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

| # | Pertanyaan | Status |
|---|---|---|
| 1 | — | open |

## Changelog

| Tanggal | Perubahan |
|---|---|
| YYYY-MM-DD | Draft awal |
```

## Requirement Rules

- ID `FR-NNN` berurutan dalam satu PRD.
- Priority memakai MoSCoW: `must`, `should`, `could`, `won't`.
- Satu requirement = satu perilaku yang bisa diuji.
- Referensikan screen ID bila sudah diketahui.
- Jangan menulis detail implementasi komponen di PRD.
- Requirement lintas PRD memakai format `NNN.FR-NNN`.

## Gate 1 Checklist

- [ ] Masalah jelas dan punya bukti/konsekuensi.
- [ ] Goals punya metrik yang bisa diukur.
- [ ] Non-goals eksplisit.
- [ ] Semua requirement punya `FR-NNN`, priority, dan acceptance signal.
- [ ] Open questions terjawab atau disepakati sebagai risiko.
- [ ] Design refs dan dependencies dicatat.
- [ ] User menetapkan status `approved`.

## File Naming

- File: `docs/prd/NNN-slug.md`
- Nomor berikutnya: cek `docs/prd/` dan `docs/BACKLOG.md`.
- Slug: kebab-case, singkat, bahasa Inggris.

## Anti-Patterns

- ✗ PRD berisi solusi teknis detail.
- ✗ Requirement tanpa cara verifikasi.
- ✗ Semua requirement `must`.
- ✗ Tidak ada non-goals.
- ✗ Menulis story sebelum PRD approved.

## Integration

- **Sebelum**: `product-ux` untuk framing, persona, JTBD, MoSCoW.
- **Sesudah**: `designer` untuk object model, sitemap, flow, wireframe.
- **Gate**: hanya user yang boleh `approved`.
