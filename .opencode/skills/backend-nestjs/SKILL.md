---
name: backend-nestjs
description: Implementasi API di apps/api — pola module NestJS, controller/service, DTO class-validator, exception filter, typed response ApiResponse dari @shared/types
tags: [fullstack, backend, nestjs, api, dto, validation]
compatibility: [next, opencode, claude, cursor]
---

# Backend NestJS Implementation

## Kapan Pakai
WAJIB saat membuat atau mengubah endpoint, service, module, DTO, atau exception handling di `apps/api`. Gunakan bersama `shared-types` (kontrak response) dan `api-testing` (verifikasi endpoint).

## Lokasi & Struktur

Target struktur saat API bertumbuh:

```text
apps/api/src/
  main.ts                 # bootstrap, global pipe/filter
  app.module.ts           # root module
  modules/<domain>/
    <domain>.module.ts    # NestJS module
    <domain>.controller.ts
    <domain>.service.ts
    dto/<action>.dto.ts   # class-validator DTO
    <domain>.service.test.ts   # unit test co-located
  common/
    filters/              # exception filter terpusat
    exceptions/           # custom exception classes
    interceptors/
```

Status saat ini: `apps/api` masih bootstrap-only (`main.ts` berisi `AppService`/`AppController` polos, belum ada decorator NestJS). Saat memperkenalkan NestJS runtime/dependency pertama kali, **minta konfirmasi dulu** (aturan dependency baru). Jangan duplikasi logic visual di API.

## Pola Kode (WAJIB Ikuti)

- Arsitektur module: satu module per domain, controller tipis, service memegang logic.
- DTO pakai `class-validator` + `class-transformer`; validasi dijalankan global `ValidationPipe({ whitelist: true, transform: true })` di bootstrap.
- Response selalu typed dengan envelope dari `@shared/types`:

```ts
import type { ApiResponse, PaginatedResult } from '@shared/types';

@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string): ApiResponse<ItemDto> {
  return { success: true, data: this.service.findOne(id) };
}
```

- Error via custom exception (`NotFoundException`, `BadRequestException`, atau custom class) → satu `HttpExceptionFilter` terpusat yang mengubah error menjadi `ApiResponse` (`success: false`, `errors`, `statusCode`) — jangan try/catch manual per endpoint untuk mapping response.
- Dependency injection lewat constructor; props/deps di-destructure di parameter.
- No `any`; `unknown` + narrowing atau generic.
- Persistence hanya lewat service/Prisma service (lihat skill `prisma-schema`); controller tidak menyentuh DB.

## Kontrak

- Semua tipe request/response publik hidup di `packages/shared-types` (alias `@shared/types`), bukan didefinisikan ulang di API.
- Field DTO harus konsisten dengan tipe shared (nama + casing).
- Perubahan shape response yang sudah dipakai `apps/web` = perubahan kontrak → konfirmasi dulu.

## Verification Commands

```bash
pnpm --filter @app/api lint
pnpm --filter @app/api build:types
pnpm --filter @app/api test
pnpm typecheck          # saat tipe shared ikut berubah
```

## Anti-Patterns

- ✗ Response tanpa envelope `ApiResponse<T>` atau `PaginatedResult<T>`
- ✗ Validasi manual di controller; wajib DTO + `ValidationPipe`
- ✗ try/catch untuk mapping response per endpoint (pakai exception filter terpusat)
- ✗ Prisma/query DB langsung di controller
- ✗ Duplikasi tipe dari `@shared/types` di dalam `apps/api`
- ✗ Logic visual/rendering di API

## Integration with Other Skills

- **Sebelum**: `decision-framework` (routing), `shared-types` (definisikan/perbarui kontrak dulu)
- **Selama**: `prisma-schema` (persistence), `api-testing` (unit + integration)
- **Setelah**: `monorepo-ci` (verify workspace)

## Checklist

1. [ ] Struktur `modules/<domain>` mengikuti pola di atas
2. [ ] DTO class-validator + whitelist/transform global
3. [ ] Response typed `ApiResponse`/`PaginatedResult` dari `@shared/types`
4. [ ] Exception filter terpusat, tidak ada mapping manual
5. [ ] `lint`, `build:types`, `test` API hijau
