---
name: story-writer
description: Pecah PRD/design menjadi story satu sesi — vertical slice, AC Given/When/Then dengan FR dan screen ID, dependencies, dan gate 3. Gunakan saat /story.
tags: [design-system, story, acceptance-criteria, workflow, gate-3]
compatibility: [next, opencode, claude, cursor]
---

# Story Writer

## Kapan Pakai

Saat `/story`, setelah PRD dan design `approved`.
Menghasilkan unit kerja yang bisa diselesaikan dalam satu sesi build.

## Splitting Rules

- **1 story = 1 sesi build** — tidak lebih dari satu fokus utama.
- **Vertical slice** — mencakup token → ui → showcase → docs sesuai scope, bukan hanya satu layer.
- **Independen** — tidak menunggu story lain kecuali dependency eksplisit.
- **Testable** — setiap AC bisa diverifikasi.
- **FR coverage** — seluruh `FR-NNN` PRD terdistribusi ke story.
- **Tidak ada story "implement everything"**.

## Template

```md
# NNN-MM — Judul

Status: todo
PRD: `docs/prd/NNN-slug.md`
FR: `FR-001`, `FR-002`
Screens: `S-NNN`, `S-NNN.MM`
Goal: —

## Acceptance Criteria

### AC-01 — Judul

**Given** kondisi awal
**When** aksi user
**Then** hasil yang bisa diverifikasi

## Tasks

- [ ] Task 1
- [ ] Task 2
- [ ] Test
- [ ] Update docs/showcase

## Dependencies

- Story/CR lain:
- Package:

## Notes

- Risiko:
- Keputusan:
```

## AC Rules

- Gunakan Given/When/Then.
- Sertakan `FR-NNN` dan screen ID yang relevan.
- AC harus menguji perilaku, bukan implementasi.
- Sertakan state empty/loading/error bila relevan.
- Sertakan a11y dan light/dark bila relevan.
- Jangan menulis AC yang tidak bisa diverifikasi.

## Gate 3 Checklist

- [ ] PRD dan design `approved`.
- [ ] Setiap story selesai dalam satu sesi.
- [ ] Semua `FR-NNN` tercakup.
- [ ] AC memakai Given/When/Then + FR + screen ID.
- [ ] Tasks jelas dan berurutan.
- [ ] Dependencies dicatat.
- [ ] User menetapkan story `approved`.

## Naming & Branch

- File: `docs/stories/NNN-MM-slug.md`
- Branch: `NNN-MM-slug`
- Commit: `type: deskripsi [NNN-MM]`

## Anti-Patterns

- ✗ Story terlalu besar.
- ✗ AC berupa daftar task.
- ✗ FR tidak tercakup.
- ✗ Dependency tersembunyi.
- ✗ Implementasi dimulai sebelum gate 3.

## Integration

- **Sebelum**: `designer` (gate 2), `prd-writer` (gate 1).
- **Sesudah**: `/implement`, `ui-component`, `design-tokens`, `ux-patterns`.
- **Review**: `reviewer` memeriksa AC dan coverage.
