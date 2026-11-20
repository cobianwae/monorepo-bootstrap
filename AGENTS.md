# Project: Design System + Fullstack Monorepo

## Overview

Monorepo ini adalah **design system + aplikasi konsumen**. UI/UX adalah identitas utama:
token, komponen, pattern, dan showcase harus konsisten, accessible, dan terdokumentasi.
Backend dan frontend konsumen melengkapi, bukan mendikte, arah design system.

Siklus fitur:

```text
diskusi → PRD (gate 1) → design (gate 2) → stories (gate 3) → implementasi → review
```

## Stack

- Design System: Tailwind CSS v4, Radix UI primitives, class-variance-authority (`cva`)
- Design Tokens: OKLCH color space, WCAG 2.1 AA/AAA contrast rules, CSS `@theme` directives
- Showcase App: Next.js 15+ App Router (TypeScript, interactive UX scenario patterns)
- Consumer Frontend: Next.js 15+ App Router (TypeScript, server components first)
- Backend: NestJS (TypeScript, modules pattern, DTO validation)
- ORM: Prisma (PostgreSQL)
- Testing: Vitest + Testing Library
- Package Manager: pnpm (workspace monorepo)

## Structure

```text
apps/
  showcase/     # Design System living documentation & UX scenario recipes
  web/          # Next.js consumer frontend
  api/          # NestJS backend
packages/
  tokens/       # OKLCH design tokens, CSS variables, contrast ratio validator
  ui/           # Reusable shadcn/ui components (Radix + cva + Tailwind v4)
  shared-types/ # Shared TypeScript types & DTOs
  config/       # Shared ESLint, TSConfig
libs/           # Shared business logic
```

## Docs Map

| File | Peran |
|---|---|
| `docs/ARCHITECTURE.md` | Prinsip, dependency, token pipeline, anatomy komponen (auto-loaded) |
| `docs/CONVENTIONS.md` | Naming, commit, verifikasi, larangan (auto-loaded) |
| `docs/STATUS.md` | Snapshot posisi proyek; dibaca di awal sesi |
| `docs/STATUS-LOG.md` | Detail historis; tidak dimuat penuh |
| `docs/BACKLOG.md` | Indeks PRD, story, CR aktif |
| `docs/BACKLOG-ARCHIVE.md` | Arsip; tidak dimuat penuh |
| `docs/TESTING.md` | Strategi dan perintah verifikasi |
| `docs/prd/` | PRD `NNN-slug.md` |
| `docs/design/` | Object model, sitemap, flow, wireframe, visual language |
| `docs/stories/` | Story `NNN-MM-slug.md` |
| `docs/cr/` | CR `CR-NNN-slug.md` + `TEMPLATE.md` |
| `docs/graphify-setup.md` | Setup graph kode dan MCP |

## Session Protocol

1. Baca `docs/STATUS.md` sebagai snapshot. Jangan memuat `STATUS-LOG.md` atau `BACKLOG-ARCHIVE.md` secara penuh.
2. Grep `docs/BACKLOG.md` hanya untuk baris aktif. Jika tidak ada target, tawarkan item dari bagian **Next** di STATUS.
3. `ARCHITECTURE.md` dan `CONVENTIONS.md` sudah auto-loaded lewat `opencode.json`.
4. Untuk pertanyaan struktural (dependency, blast radius, relasi komponen), coba **graphify MCP** lebih dulu (`get_node`, `get_neighbors`, `graph_stats`, `get_community`). Grep hanya untuk melengkapi.
5. Jika graphify tidak tersedia atau graph tidak relevan, catat alasannya dan fallback ke grep.
6. Baca file secara targeted (`offset`/`limit`). Jangan dump file >200 baris.
7. Eksplorasi luas didelegasikan ke subagent `explore`.
8. Satu sesi = satu story atau satu CR.

## Workflow & Gates

| Tahap | Artefak | Gate |
|---|---|---|
| Diskusi | Ringkasan masalah, tujuan, non-goals | — |
| PRD | `docs/prd/NNN-slug.md` | **Gate 1**: PRD approved |
| Design | `docs/design/*` | **Gate 2**: design approved |
| Story | `docs/stories/NNN-MM-slug.md` | **Gate 3**: story approved |
| Implementasi | Kode + test + docs | Story `review` |
| Review | Temuan + CR bila perlu | `done` oleh user |

Aturan:

- Tidak ada implementasi fitur tanpa story yang sudah `todo` atau lebih.
- Baca story, PRD, dan design sebelum coding. Story adalah source of truth.
- 1 story = 1 branch + 1 PR. Branch `NNN-MM-slug`.
- Setelah tasks selesai: tick checkbox story, append `docs/STATUS-LOG.md` (format `YYYY-MM-DD — ringkasan — referensi`), update `docs/BACKLOG.md` dan `docs/STATUS.md`. Urutan ini bagian dari definisi selesai — menjalankan `node scripts/check-status-log.mjs` sebelum commit adalah wajib.
- Temuan pada artefak approved/shipped atau story `review`/`done` harus menjadi CR, bukan edit langsung.
- Artefak draft boleh diedit dengan konfirmasi user.
- Hanya user yang boleh menetapkan `approved` dan `done`.

## Lightweight Track

Gunakan **CR** langsung, tanpa PRD/story, untuk:

- bug dan regresi,
- pelanggaran a11y,
- penyesuaian nilai token,
- perbaikan docs,
- varian kecil komponen,
- perbaikan microcopy.

Gunakan **design spec singkat + 1 story** untuk komponen baru tanpa pattern baru.

Gunakan **PRD penuh** untuk fitur/pattern baru, area app baru, perubahan lintas package, atau dependency baru.

## Scope Discipline

- Kerjakan hanya acceptance criteria dan tasks story/CR.
- Jangan menambah dependency, refactor besar, atau mengubah konvensi tanpa konfirmasi.
- Gunakan pola paling sederhana yang sesuai `CONVENTIONS.md`.
- 3x rule: abstraksi baru setelah pola muncul tiga kali.
- Jika kebutuhan di luar scope muncul: **STOP** dan minta konfirmasi.

## Token Discipline

- Targeted read; jangan dump file besar.
- Delegasikan eksplorasi luas ke `explore`.
- Graphify sebelum grep untuk pertanyaan struktural.
- Simpan analisis ke file, bukan hanya di percakapan.
- Verifikasi targeted saat iterasi; full suite di akhir.
- Jangan memuat arsip secara otomatis.

## ID Conventions

| Objek | Format | Contoh |
|---|---|---|
| PRD | `NNN` | `012` |
| Requirement | `FR-NNN` | `FR-003` |
| Requirement lintas PRD | `NNN.FR-NNN` | `012.FR-003` |
| Screen | `S-NNN` | `S-010` |
| Child panel/tab | `S-NNN.MM` | `S-003.01` |
| Modal | `M-NNN` | `M-001` |
| Story | `NNN-MM` | `012-01` |
| CR | `CR-NNN` | `CR-003` |

Komponen dirujuk dengan nama file/export, bukan ID terpisah.

## Rules

1. Gunakan skill yang sesuai sebelum memulai fitur baru. Skills tersedia: `design-tokens`, `ui-component`, `ux-patterns`, `visual-design`, `accessibility`, `product-ux`, `ux-psychology`, `ux-research`, `decision-framework`, `prd-writer`, `designer`, `story-writer`, `reviewer`, `ui-designer`, `visual-designer`, `shared-types`, `backend-nestjs`, `prisma-schema`, `api-testing`, `monorepo-ci`.
2. Setiap file baru HARUS mengikuti pola existing di direktori yang sama.
3. Framing bisnis (BA ringan): sebelum implementasi fitur, klasifikasikan requirement dengan MoSCoW (must/should/could/won't have), tulis user story, dan acceptance criteria (Given/When/Then) via skill `product-ux`. Identitas utama kerja adalah UI/UX — BA cukup untuk membingkai, jangan bertele-tele.
4. Design tokens: Wajib menggunakan OKLCH, selalu audit kontras WCAG AA (>= 4.5:1 untuk teks), dan sediakan light & dark mode parity (skill `design-tokens`).
5. Komponen UI: Gunakan Radix primitives untuk a11y, `cva` untuk varian visual, `cn()` untuk class merging, dan export via `index.ts` (skill `ui-component`).
6. UX Scenarios: Sediakan loading skeleton state dan empty state yang komprehensif pada setiap tabel/data grid (skill `ux-patterns`).
7. Backend: gunakan class-validator DTO, Proper exception filters, typed responses.
8. Frontend: server components default, client components hanya saat dibutuhkan (interactivity, hooks, browser API).
9. Prisma schema changes: ikuti pola existing di `apps/api/prisma` dan update migration dengan benar.
10. Shared types di `packages/shared-types/`, bukan duplikasi.
11. Testing: unit test untuk services/utils/tokens, integration test untuk API endpoints.
12. Import path gunakan alias `@ds/ui`, `@ds/tokens`, `@shared/types`, `@app/`, `@web/`.
13. Commit messages: conventional commits (feat/fix/refactor/chore).

## Commands

| Command | Fungsi |
|---|---|
| `/start` | Bootstrap sesi: STATUS, BACKLOG aktif, git log/status, next steps |
| `/prd [topik]` | Buat PRD dan minta gate 1 |
| `/design <file-prd>` | Buat spec desain dan minta gate 2 |
| `/story <file-prd>` | Pecah menjadi story dan minta gate 3 |
| `/implement <file-story\|file-cr>` | Eksekusi story/CR dengan approval rencana |
| `/review [artefak]` | Review artefak dan temuan |
| `/improve-ui [layar\|global]` | Audit dan poles kode UI |
| `/design-language [referensi]` | Susun arah visual showcase |
| `/polish-ui [layar\|global]` | Uplift visual berdasarkan visual language |
| `/audit [scope]` | Audit kode via subagent `ui-ux-auditor` |

## Status Cycle

| Artefak | Alur |
|---|---|
| PRD | `draft` → `approved` → `shipped` |
| Design | `draft` → `approved` |
| Story | `todo` → `in-progress` → `review` → `done` |
| CR | `draft` → `approved` → `done` |

Hanya user yang boleh menetapkan `approved` dan `done`.

## Review Gates

- **Gate 1 (PRD)**: masalah jelas, goals terukur, non-goals eksplisit, requirement `FR-NNN` testable, open questions terjawab.
- **Gate 2 (Design)**: object model dan sitemap diperbarui, semua layar terdaftar, flow dan state matrix lengkap, setiap FR tercakup.
- **Gate 3 (Story)**: satu story = satu sesi, vertical slice, AC Given/When/Then dengan FR + screen ID, dependencies jelas.
- **Review**: temuan diberi severity (`blocker`/`major`/`minor`), lokasi `file:line`, dan rekomendasi. Temuan pada artefak approved/shipped menjadi CR.

## Conventions

- Naming: PascalCase classes/interfaces/components, camelCase variables/functions, kebab-case filenames.
- Barrel exports: setiap package & module punya `index.ts`.
- Error handling: custom exception classes, centralized filter.
- No `any` type. Gunakan `unknown` lalu narrow, atau generic.
- Destructure props di parameter, bukan di body function.
- Bahasa: dokumen/artefak dalam Bahasa Indonesia; identifier, kode, dan nama file dalam Bahasa Inggris.
