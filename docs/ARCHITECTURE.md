# Architecture

## Identitas

Monorepo ini adalah **design system + aplikasi konsumen**. UI/UX adalah produk utama:
token, komponen, pattern, dan showcase harus konsisten, accessible, dan terdokumentasi.
Backend dan frontend konsumen melengkapi, bukan mendikte, arah design system.

## Prinsip

1. **Token-first** — warna, spacing, radius, tipografi, motion, dan z-index selalu lewat token.
2. **Komponen reusable** — logika visual tinggal di `packages/ui`, bukan di app.
3. **Server components default** — client component hanya untuk interaktivitas, hooks, atau browser API.
4. **Batas package jelas** — dependency mengalir satu arah; tidak ada import melingkar.
5. **3x rule** — pola yang muncul tiga kali baru dijadikan abstraksi.
6. **Dependency dan API publik butuh konfirmasi** — jangan menambah dependency atau mengubah kontrak komponen tanpa persetujuan.
7. **Docs adalah state** — keputusan hidup di `docs/`, bukan hanya di percakapan.

## Stack

| Area | Teknologi |
|---|---|
| Design system | Tailwind CSS v4, Radix UI primitives, `class-variance-authority` |
| Token | OKLCH, CSS variables, `@theme`, WCAG 2.1 AA/AAA |
| Showcase | Next.js 15+ App Router, TypeScript |
| Consumer frontend | Next.js 15+ App Router, TypeScript |
| Backend | NestJS, `class-validator`, exception filter |
| ORM | Prisma + PostgreSQL |
| Testing | Vitest + Testing Library |
| Package manager | pnpm workspace |

## Struktur & Arah Dependency

```text
packages/tokens ──► packages/ui ──► apps/showcase
                                  └► apps/web
packages/shared-types ──► apps/api, apps/web, apps/showcase
packages/config ──► semua package
libs/ ──► apps (business logic bersama)
```

Aturan:

- `packages/tokens` tidak boleh import `packages/ui` atau app.
- `packages/ui` tidak boleh import app.
- `packages/shared-types` tidak boleh import UI.
- App boleh import package; package tidak boleh import app.
- Import memakai alias `@ds/ui`, `@ds/tokens`, `@shared/types`, `@app/`, `@web/`.

## Token Pipeline

1. `packages/tokens/src/tokens.css` — mapping `@theme` ke CSS variable.
2. `packages/tokens/src/themes.ts` — definisi tema dan pasangan kontras.
3. `packages/tokens/src/contrast.ts` — validator WCAG (`contrastRatio`, `checkCompliance`).
4. `packages/ui/src/styles.css` — konsumsi token oleh komponen.
5. Komponen memakai kelas semantik (`bg-primary`, `text-muted-foreground`), bukan hex/RGB.

Tema yang tersedia: `pulse`, `sunset`, `botanic`, `midnight`, `nebula`, `lagoon`, `ink`, `graphite`.
Setiap tema wajib punya perilaku light dan dark yang kontrasnya lolos audit.

## Anatomy Komponen

- Primitive Radix untuk perilaku dan a11y.
- `cva` untuk varian visual.
- `cn()` untuk merge class.
- Props di-destructure di parameter.
- `forwardRef`/`asChild` bila kontrak komponen membutuhkan.
- Named export, bukan default export.
- Test co-located: `<nama>.test.tsx`.
- Barrel export di `packages/ui/src/index.ts`.

## Batas App

| App | Tanggung jawab | Tidak boleh |
|---|---|---|
| `apps/showcase` | Living documentation, scenario interaktif, showcase state | Business logic produksi |
| `apps/web` | Frontend konsumen | Duplikasi komponen design system |
| `apps/api` | API NestJS, DTO, persistence | Logika visual |
| `packages/shared-types` | DTO dan tipe bersama | Implementasi UI |

## Testing

| Layer | Cakupan | Tool |
|---|---|---|
| Unit | token, util, validator kontras | Vitest |
| Component | render, interaksi, a11y dasar | Vitest + Testing Library |
| Integration | endpoint API | Vitest/Supertest (saat aktif) |
| Showcase smoke | build dan render route utama | `next build` |

Detail perintah ada di `docs/TESTING.md`.

## ADR-lite

| Keputusan | Alasan | Konsekuensi |
|---|---|---|
| Tailwind v4 + `@theme` | Token dan utility menyatu | Perlu disiplin token semantik |
| OKLCH | Persepsi warna lebih merata | Perlu validator kontras |
| Radix primitives | a11y dan perilaku teruji | Bundle sedikit lebih besar |
| `cva` | Varian eksplisit dan type-safe | API komponen harus dijaga |
| pnpm workspace | Instalasi cepat, workspace ketat | Tidak kompatibel dengan npm workspace |
| Vitest | Cepat, cocok untuk TS/React | Setup jsdom untuk komponen |

## Dokumen Terkait

- `docs/CONVENTIONS.md` — aturan kode dan commit.
- `docs/TESTING.md` — strategi verifikasi.
- `docs/design/object-model.md` — model token, komponen, pattern, scenario.
- `docs/design/sitemap.md` — inventaris route dan screen ID.
- `AGENTS.md` — operating contract untuk sesi agent.
