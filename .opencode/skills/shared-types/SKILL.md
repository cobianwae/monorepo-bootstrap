---
name: shared-types
description: Kontrak tipe bersama di packages/shared-types — DTO dan domain types untuk api/web/showcase, barrel export, type guards, dan larangan import UI
tags: [fullstack, types, dto, contract, shared-types, monorepo]
compatibility: [next, opencode, claude, cursor]
---

# Shared Types Contract

## Kapan Pakai
WAJIB saat membuat atau mengubah file di `packages/shared-types/**`, atau saat mengubah tipe yang di-import `apps/api`, `apps/web`, atau `apps/showcase` lewat alias `@shared/types`. Perubahan tipe publik = perubahan kontrak lintas app; konfirmasi dulu bila mengubah shape yang sudah dipakai consumer.

## Lokasi & Struktur

```text
packages/shared-types/
  src/index.ts        # satu-satunya entry point publik (barrel)
  package.json        # name: @shared/types, main/types -> ./src/index.ts
```

- Semua tipe, const label map, dan type guard diekspor dari `src/index.ts`.
- Tidak ada file terpisah dulu (monolith kecil); pecah ke `src/<domain>.ts` + re-export hanya setelah file membesar (3x rule).
- Package ini TIDAK BOLEH meng-import `packages/ui`, `packages/tokens`, React, NestJS, atau Prisma. Tipe murni + guard saja.

## Pola Kode (WAJIB Ikuti)

Tiru pola existing di `src/index.ts`:

```ts
// 1. Union type untuk enum-like
export type UserRole = 'admin' | 'editor' | 'viewer';

// 2. Label map berdampingan dengan union-nya
export const ROLE_LABELS: Record<UserRole, string> = { ... };

// 3. Interface PascalCase, properti camelCase, optional pakai `?:`
export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

// 4. Generic untuk envelope dan paginasi
export interface ApiResponse<T = unknown> { success: boolean; data?: T; }
export interface PaginatedResult<T> { data: T[]; meta: PaginationMeta; }

// 5. Type guard dari unknown, bukan `any`
export function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'role' in obj;
}
```

**Checklist kode:**
- [ ] Tipe domain (entity) dan tipe transport (`ApiResponse`, `PaginatedResult`) dipisah konsepnya
- [ ] Tanggal sebagai `string` (ISO) di kontrak transport, bukan `Date`
- [ ] No `any` — `unknown` + narrowing, atau generic
- [ ] Type guard untuk shape yang divalidasi runtime
- [ ] Konsisten dengan DTO `apps/api` (field sama, casing sama)

## Kontrak Antar App

| Consumer | Alias | Boleh |
|----------|-------|-------|
| `apps/api` | `@shared/types` | tipe response/request |
| `apps/web` | `@shared/types` | tipe fetch + render |
| `apps/showcase` | `@shared/types` | tipe scenario/mock |

- `packages/shared-types` tidak boleh import app atau package lain (arah dependency satu arah: shared-types → apps).
- Mengubah/hapus field publik yang sudah dipakai consumer = butuh konfirmasi; tambah field optional aman.

## Verification Commands

```bash
pnpm --filter @shared/types build:types
pnpm --filter @shared/types lint
pnpm typecheck          # wajib saat consumer ikut berubah
```

## Anti-Patterns

- ✗ Duplikasi tipe di `apps/*` padahal sudah ada di shared-types
- ✗ Import React/`@ds/ui`/NestJS/Prisma di package ini
- ✗ Default export; pakai named export via barrel
- ✗ Logika runtime berat (validator class, ORM client) — hanya tipe, const, dan guard murni
- ✗ Mengubah shape publik tanpa cek consumer (`grep` alias `@shared/types` dulu)

## Integration with Other Skills

- **Sebelum**: `decision-framework` (routing perubahan fullstack)
- **Selama**: `backend-nestjs` (DTO mengikuti tipe ini), `api-testing` (fixture mengikuti shape)
- **Setelah**: `monorepo-ci` (typecheck workspace) bila consumer ikut berubah

## Checklist

1. [ ] Barrel `src/index.ts` diperbarui
2. [ ] Tidak ada import UI/NestJS/Prisma
3. [ ] No `any`, guard pakai `unknown`
4. [ ] Consumer yang terdampak sudah dicek/diubah
5. [ ] `build:types` + `lint` package hijau, `pnpm typecheck` workspace hijau
