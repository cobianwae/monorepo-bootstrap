# Skill Plan Fullstack Enterprise

Status: `implemented` — 5 skill fullstack aktif di `.opencode/skills/`, routing terdaftar di `decision-framework`.

## Tujuan
Menambah skill set OpenCode untuk mendukung area enterprise `apps/api`, `packages/shared-types`, Prisma, testing, dan CI monorepo tanpa mengorbankan disiplin design system yang sudah ada.

## Prinsip
* Skill granular, single responsibility.
* Re-use workflow PRD → Design → Story → Implement → Review yang ada.
* Token efisien: deskripsi ringkas, contoh kode di docs bukan di skill, gunakan `explore` subagent untuk scan luas.
* Decision routing via `decision-framework`.
* 3x rule untuk abstraksi baru.

## Gap Saat Ini
Skill yang ada 100% design system:
design-tokens, ui-component, ux-patterns, accessibility, visual-design*, designer, reviewer, prd-writer, story-writer, decision-framework, product-ux, ux-psychology, ux-research

Tidak ada skill untuk:
* NestJS backend module, DTO, exception filter
* Prisma schema & migration
* Shared types contract
* API integration testing
* Monorepo CI/verification

## Skill Taxonomy Usulan

### Core Fullstack
1. **shared-types**
   Trigger: edit `packages/shared-types/**` atau import tipe dari package ini.
   Scope: kontrak tipe DTO/domain, zero UI import.
   Do: export via index.ts, jalankan `pnpm typecheck` workspace-wide.
   Don't: duplikasi tipe di app.

2. **backend-nestjs**
   Trigger: `apps/api/src/modules/**`
   Scope: module pattern, controller/service, class-validator DTO, exception filter, typed response.
   Integration: wajib referensi `shared-types`.

3. **prisma-schema**
   Trigger: `apps/api/prisma/schema.prisma`
   Scope: schema, relation, index, migration naming.
   Verifikasi: `prisma migrate dev`, `pnpm typecheck`.

4. **api-testing**
   Trigger: test integration endpoint/service.
   Scope: Vitest + Supertest, DTO validation test.
   Verifikasi: `pnpm test:api`.

5. **monorepo-ci**
   Trigger: perubahan config build/lint/tsconfig.
   Scope: `pnpm typecheck`, `pnpm lint`, `pnpm test` workspace.

### Opsional Phase 2
* `web-server-components` untuk disiplin server-first di `apps/web`
* `observability-logging` untuk NestJS logger & metrics
* `deployment-monorepo` untuk release script

## Alur Integrasi Workflow
* PRD tetap via `product-ux` + `prd-writer`.
* Design untuk API menambah `docs/design/api-spec.md` kecil: FR-NNN → endpoint + tipe shared.
* Story AC Given/When/Then dengan FR + endpoint ID.
* Implementasi dibatasi acceptance criteria story/CR.

## Token Efisiensi
* Deskripsi skill ≤300 kata.
* Gunakan file pattern & commands baku.
* Graphify MCP untuk pertanyaan struktural sebelum grep.
* Compaction auto 12k token tetap aktif.
* Delegasikan explore luas ke subagent `explore`.

## Roadmap
1. Audit cepat gap skill vs backlog aktif.
2. Buat skill `shared-types`, `backend-nestjs`, `prisma-schema`, `api-testing`.
3. Uji routing dengan `decision-framework`.
4. Dokumentasikan contoh trigger dan verifikasi.
5. Revisi setelah 3x penggunaan nyata.

## Definisi Selesai
* Skill terdaftar dan terdokumentasi di docs.
* Contoh trigger dan verifikasi berhasil diuji.
* Tidak ada overlap konteks dengan skill design system.
