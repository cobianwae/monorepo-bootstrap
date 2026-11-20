---
name: api-testing
description: Testing API di apps/api — unit test service, integration test endpoint dengan Vitest + Supertest, validasi DTO, dan fixture dari @shared/types
tags: [fullstack, backend, testing, vitest, supertest, api]
compatibility: [next, opencode, claude, cursor]
---

# API Testing

## Kapan Pakai
WAJIB saat membuat/mengubah endpoint, service, DTO, atau exception filter di `apps/api`. Test men-verify perilaku penting, bukan coverage kosmetik. Gunakan bersama `backend-nestjs`.

## Lokasi & Struktur

```text
apps/api/src/
  modules/<domain>/
    <domain>.service.test.ts        # unit test service (co-located)
    <domain>.controller.test.ts     # integration test endpoint bila perlu
  common/
    filters/http-exception.filter.test.ts
```

Status saat ini: script `test` di `apps/api` masih placeholder (`echo`). Saat memperkenalkan Vitest + Supertest pertama kali, **minta konfirmasi dulu** (dependency baru), lalu ikuti pola test repo (Vitest, gaya `packages/ui`).

## Pola Test (WAJIB Ikuti)

- Runner: Vitest (satu runner untuk seluruh monorepo).
- Unit test service: mock dependency (repository/Prisma) via constructor injection — tidak sentuh DB nyata.
- Integration test endpoint: Supertest terhadap app instance yang di-bootstrap tanpa listen port publik.
- Fixture/request body mengikuti tipe `@shared/types` — tidak ada objek ad-hoc yang melanggar kontrak.

```ts
import { describe, expect, it } from 'vitest';
import { AppController, AppService } from './main';

describe('AppController.getHealth', () => {
  it('mengembalikan ApiResponse success dengan data status', () => {
    const controller = new AppController(new AppService());
    const res = controller.getHealth();

    expect(res.success).toBe(true);
    expect(res.data?.status).toBe('healthy');
  });
});
```

**Checklist test:**
- [ ] Nama test Bahasa Indonesia deskriptif (perilaku, bukan nama method)
- [ ] Happy path + minimal 1 error/validation path untuk endpoint publik
- [ ] DTO validation: payload invalid → 400 dengan envelope `success: false`
- [ ] Exception filter: error tak terduga → `ApiResponse` ter-format, bukan stack leak
- [ ] No `any`; pakai tipe shared atau `unknown` + narrowing
- [ ] Deterministik: tanpa sleep nyata, waktu di-mock bila perlu

## Yang Di-test per Layer

| Layer | Cakupan |
|---|---|
| Service | logic bisnis, mapping error, pagination |
| Controller | wiring, status code, envelope response |
| DTO | whitelist/transform, pesan error |
| Exception filter | bentuk error response konsisten |

## Verification Commands

```bash
pnpm --filter @app/api test
pnpm --filter @app/api lint
pnpm --filter @app/api build:types
```

## Anti-Patterns

- ✗ Test tanpa assertion (harness kosong / placeholder permanen)
- ✗ Men-assert struktur internal/private; assert perilaku publik
- ✗ DB nyata di unit test; mock repository/service
- ✗ Duplikasi tipe fixture yang sudah ada di `@shared/types`
- ✗ Menunda test "nanti" untuk endpoint baru — test ikut di story yang sama

## Decision Points (ditentukan PRD/design — bukan di sini)

| Decision Point | Opsi umum | Kapan pilih mana |
|---|---|---|
| Integration strategy | app instance in-memory vs HTTP server penuh | kecepatan vs realisme (design) |
| Data layer test | mock repository vs test database | isolasi vs confidence endpoint |
| Fixture strategy | static fixture vs factory | variasi data yang dibutuhkan AC |
| Coverage boundary | unit service vs integration endpoint | logika bisnis vs wiring — jangan double test |

## Edge Cases Umum (kandidat AC story)

- [ ] Auth path: endpoint tanpa auth (401) vs auth tanpa hak (403)
- [ ] Validation path per field, bukan cuma satu payload invalid
- [ ] Pagination di batas: halaman terakhir, `hasNextPage` false, result kosong
- [ ] Duplicate/concurrent request ke endpoint mutating
- [ ] Error tak terduga → filter tetap hasilkan envelope, tanpa leak stack
- [ ] Empty state: collection kosong menghasilkan `data: []` + meta benar

## Integration with Other Skills

- **Sebelum**: `backend-nestjs` (implementasi), `shared-types` (shape fixture)
- **Selama**: `prisma-schema` (mock/seed data test)
- **Setelah**: `monorepo-ci` (`pnpm test` workspace)

## Checklist

1. [ ] Test co-located dengan unit yang di-test
2. [ ] Happy path + validation/error path
3. [ ] Fixture mengikuti `@shared/types`
4. [ ] `pnpm --filter @app/api test` hijau
