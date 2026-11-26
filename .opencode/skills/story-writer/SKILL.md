---
name: story-writer
description: Pecah PRD/design menjadi story satu sesi — vertical slice, AC Given/When/Then dengan FR dan screen ID, dependencies, dan gate 3. Gunakan saat /story.
tags: [design-system, story, acceptance-criteria, workflow, gate-3]
compatibility: [next, opencode, claude, cursor]
---

# Story Writer

Filosofi: story adalah unit kerja yang selesai dalam satu sesi build, dan menjadi source of truth implementasi.

Dipakai saat `/story`, setelah PRD dan design `approved`.

## Aturan pemecahan PRD → stories

1. **1 story = 1 sesi build.** Kalau checklist task melebihi itu, pecah lagi. Tidak ada story "implement everything".
2. **Vertikal, bukan horizontal**: satu story mencakup token → ui → showcase → docs sesuai scope; JANGAN pisah per layer teknis ("story token", "story showcase").
3. **Setiap AC merujuk ID**: `NNN.FR-NNN` (qualified — FR hanya unik per PRD) untuk requirement, `S-NNN`/`S-NNN.MM`/`M-NNN` untuk screen/modal. Berlaku untuk artefak baru; artefak lama tidak di-retrofit.
4. **Coverage wajib**: setiap FR di PRD ter-cover minimal satu story. Setelah pecah, buat tabel mapping FR → story — tidak boleh ada FR tercecer.
5. Story boleh bergantung pada story lain — tulis eksplisit, dan tidak melingkar.
6. Status `approved` hanya ditetapkan user. Jangan mulai implementasi sebelum gate 3.

## Template

```md
# NNN-MM — Judul

Status: todo
PRD: `docs/prd/NNN-slug.md` (approved, gate 1)
Design: `docs/design/wireframes/<fitur>.md` (approved, gate 2) + `docs/design/flows/<fitur>.mmd`
FR: `NNN.FR-001`, `NNN.FR-003`
Screens: `S-NNN`, `S-NNN.MM`
Goal: —

## Acceptance Criteria

### AC-01 — Judul

**Given** kondisi awal
**When** aksi user
**Then** hasil yang bisa diverifikasi — diverifikasi test (NNN.FR-001, S-NNN)

## Tasks

- [ ] Task 1
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

- Gunakan Given/When/Then; AC menguji perilaku, bukan implementasi, dan bukan daftar task.
- Setiap AC diakhiri rujukan `NNN.FR-NNN` + screen ID, dan menyebut cara verifikasinya (test, audit manual).
- Sertakan state empty/loading/error, a11y, dan light/dark bila relevan.
- Jangan menulis AC yang tidak bisa diverifikasi.

## Mapping FR → story (wajib setelah memecah)

| FR | Story |
|---|---|
| `NNN.FR-001` | NNN-01 |
| `NNN.FR-002` | NNN-01, NNN-02 |

## Quality bar review (gate 3)

1. Setiap AC Given/When/Then dan merujuk FR + screen.
2. Setiap task bisa ditandai selesai secara objektif, dan berurutan.
3. Ukuran story satu sesi build — jika ragu, pecah.
4. Dependency jelas dan tidak melingkar.
5. Mapping FR → story lengkap (tidak ada FR yatim).

## Naming & Branch

- File: `docs/stories/NNN-MM-slug.md` — NNN = nomor PRD, MM = urutan story di PRD itu (01, 02, ...).
- Branch implementasi = `NNN-MM-slug` (sama dengan nama file tanpa ekstensi).
- Commit: `type: deskripsi [NNN-MM]`.
- Daftarkan di `docs/BACKLOG.md` dengan status `todo`.

## Format ringkasan untuk user

- Daftar story (ID + judul + FR + screen), urutan pengerjaan, dependency, dan tabel mapping FR → story.
- Minta gate 3. JANGAN mulai implementasi sebelum story `approved`.

Skill terkait: sebelum `prd-writer` (gate 1), `designer` (gate 2); sesudah `/implement`, `ui-component`, `design-tokens`, `ux-patterns`; review lewat `reviewer`.
