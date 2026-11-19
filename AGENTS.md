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
1. Gunakan skill yang sesuai sebelum memulai fitur baru. Skills tersedia: `design-tokens`, `ui-component`, `ux-patterns`, `visual-design`, `accessibility`, `product-ux`, `ux-psychology`, `ux-research`, `decision-framework`.
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

## Conventions
- Naming: PascalCase classes/interfaces/components, camelCase variables/functions, kebab-case filenames.
- Barrel exports: setiap package & module punya `index.ts`.
- Error handling: custom exception classes, centralized filter.
- No `any` type. Gunakan `unknown` lalu narrow, atau generic.
- Destructure props di parameter, bukan di body function.

