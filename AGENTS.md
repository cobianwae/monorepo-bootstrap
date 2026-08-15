# Project: Design System + Fullstack Monorepo

## Stack
- Design System: Tailwind CSS v4, Radix UI primitives, class-variance-authority (`cva`)
- Design Tokens: OKLCH color space, WCAG 2.1 AA/AAA contrast rules, CSS @theme directives
- Showcase App: Next.js 15+ App Router (TypeScript, interactive UX scenario patterns)
- Consumer Frontend: Next.js 15+ App Router (TypeScript, server components first)
- Backend: NestJS (TypeScript, modules pattern, DTO validation)
- ORM: Prisma (PostgreSQL)
- Testing: Vitest + Testing Library
- Package Manager: pnpm (workspace monorepo)

## Structure
```
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

## Rules
1. Gunakan skill yang sesuai sebelum memulai fitur baru (`design-tokens`, `ui-component`, `ux-patterns`, `visual-design`, `accessibility`).
2. Setiap file baru HARUS mengikuti pola existing di direktori yang sama.
3. Design tokens: Wajib menggunakan OKLCH, selalu audit kontras WCAG AA (>= 4.5:1 untuk teks), dan sediakan light & dark mode parity.
4. Komponen UI: Gunakan Radix primitives untuk a11y, `cva` untuk varian visual, `cn()` untuk class merging, dan export via `index.ts`.
5. UX Scenarios: Sediakan loading skeleton state dan empty state yang komprehensif pada setiap tabel/data grid.
6. Backend: gunakan class-validator DTO, Proper exception filters, typed responses.
7. Frontend: server components default, client components hanya saat dibutuhkan (interactivity, hooks, browser API).
8. Prisma schema changes wajib via `prisma-schema` skill.
9. Shared types di `packages/shared-types/`, bukan duplikasi.
10. Testing: unit test untuk services/utils/tokens, integration test untuk API endpoints.
11. Import path gunakan alias `@ds/ui`, `@ds/tokens`, `@shared/types`, `@app/`, `@web/`.
12. Commit messages: conventional commits (feat/fix/refactor/chore).

## Conventions
- Naming: PascalCase classes/interfaces/components, camelCase variables/functions, kebab-case filenames.
- Barrel exports: setiap package & module punya `index.ts`.
- Error handling: custom exception classes, centralized filter.
- No `any` type. Gunakan `unknown` lalu narrow, atau generic.
- Destructure props di parameter, bukan di body function.

