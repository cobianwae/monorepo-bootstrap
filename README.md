# Design System Monorepo

Design system reusabel berbasis **Tailwind CSS v4**, **Radix UI**, dan **OKLCH design tokens**, dibungkus sebagai pnpm workspace. Satu-satunya sumber komponen ada di `packages/ui`; aplikasi (`showcase`, `web`, `api`) hanyalah consumer.

## Struktur

```
apps/
  showcase/     # Living documentation: docs, UX patterns, dan scenario apps (CRM & Clinic)
  web/          # Contoh consumer frontend (marketing site)
  api/          # NestJS backend
packages/
  tokens/       # OKLCH design tokens, CSS variables, WCAG AA/AAA contrast validator
  ui/           # Seluruh komponen reusabel (Radix + cva + Tailwind v4)
  shared-types/ # TypeScript types & DTOs bersama
  config/       # Shared ESLint, TSConfig
```

## Mulai project baru

1. Tambahkan workspace deps:

   ```json
   "dependencies": {
     "@ds/ui": "workspace:*",
     "@ds/tokens": "workspace:*"
   }
   ```

2. `globals.css` minimal:

   ```css
   @import "tailwindcss";
   @import "tw-animate-css";
   @import "@ds/ui/styles.css";
   ```

   `@ds/ui/styles.css` sudah berisi token OKLCH, base layer, utility `glass-card`/`gradient-border`/`no-scrollbar`, styling calendar, dan `@custom-variant dark`.

3. Tambahkan `@source`/`paths` di `tsconfig.json`:

   ```json
   {
     "paths": {
       "@ds/ui": ["../../packages/ui/src/index.ts"],
       "@ds/tokens": ["../../packages/tokens/src/index.ts"]
     }
   }
   ```

4. Aktifkan tema & art direction (opsional) — pakai `ThemeProvider` + `PaletteSwitcher` dari `@ds/ui`.

Contoh full reference ada di `apps/showcase` dan `apps/web`.

## Komponen

`packages/ui` menyediakan 3 lapisan:

1. **Primitives** — Radix/shadcn-style: `button`, `input`, `select`, `dialog`, `sheet`, `dropdown-menu`, `tabs`, `table`, dll.
2. **Composites** — pola UI tingkat tinggi: `data-table`, `kanban`, `filter-builder`, `sidebar`, `app-shell`, `command-palette`, `chat`, `chart`, marketing blocks (`hero`, `pricing`, `faq`, ...), feedback (`toast`, `notification`, `banner`, `alert`).
3. **Shells** — kerangka aplikasi siap pakai: `AppTopBar`, `SidebarNav`, `ScenarioShell`, `ThemeProvider`.

Ekspor penuh via `packages/ui/src/index.ts`.

## Design Tokens

- Seluruh warna **OKLCH**, teruji **WCAG 2.1 AA** (≥ 4.5:1 teks) lewat `packages/tokens/src/contrast.ts`.
- **8 tema** × light/dark, dialihkan via atribut `data-theme` dan class `.dark`.
- **3 art direction** (`atelier`, `aurora`, `blueprint`) via `data-art-direction`.
- Utility audit: `auditSemanticTokenPairs()`, `auditThemeTokenPairs()`, `checkWcagCompliance()`.

## Skrip

```bash
pnpm -C packages/ui test          # unit test komponen
pnpm -C packages/tokens test      # test kontras
pnpm -C apps/showcase build       # build showcase
pnpm -C apps/web build            # build consumer site
```

## Konvensi

Lihat `AGENTS.md`. Ringkasnya: komponen baru harus masuk `packages/ui`, tidak ada `any`, gunakan `cva` + `cn()`, barrel `index.ts` di setiap modul, dan commit message mengikuti conventional commits.

## License

Terbuka untuk dipakai dan dimodifikasi.