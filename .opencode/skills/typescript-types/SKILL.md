---
name: typescript-types
description: Mendefinisikan shared types, DTOs, interfaces, dan type guards yang digunakan lintas backend dan frontend
tags: [typescript, types, dto, shared, interface]
compatibility: [typescript, opencode, claude, cursor]
---

# TypeScript Shared Types

## Kapan Pakai
Saat diminta membuat type, interface, enum, DTO, atau type guard yang dipakai oleh lebih dari satu package, atau saat perlu mendefinisikan kontrak API (request/response shapes).

## Aturan Utama
1. **Shared types di `packages/shared-types/`**. Jangan duplikasi.
2. **Backend DTO** untuk validation (class-validator). **Shared types** untuk type safety lintas boundary.
3. **Frontend** import dari `@shared/...`, bukan define ulang.
4. **Tidak boleh `any`**. Gunakan `unknown` + type guard, atau generic.

## Struktur

```
packages/shared-types/src/
  index.ts                  # barrel export semua
  api/
    <resource>.types.ts     # request/response shapes
  domain/
    <entity>.types.ts       # domain model types
  enums/
    <enum>.types.ts         # shared enums
  guards/
    <name>.guard.ts         # type guards + assertion functions
```

## Pola Wajib

### Response Shape
```typescript
// packages/shared-types/src/api/pagination.types.ts
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

### Domain Entity Type
```typescript
// packages/shared-types/src/domain/user.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export type UserCreateInput = Omit<User, 'id' | 'createdAt'>;
export type UserUpdateInput = Partial<UserCreateInput>;
```

### Shared Enum
```typescript
// packages/shared-types/src/enums/role.types.ts
export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.MEMBER]: 'Member',
  [UserRole.GUEST]: 'Guest',
};
```

### Type Guard
```typescript
// packages/shared-types/src/guards/api-error.guard.ts
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error
  );
}
```

### Branded Types (untuk ID yang typed)
```typescript
export type UserId = string & { readonly __brand: 'UserId' };
export type OrderId = string & { readonly __brand: 'OrderId' };

export function toUserId(id: string): UserId {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new TypeError(`Invalid UserId: ${id}`);
  }
  return id as UserId;
}
```

## Checklist
1. [ ] Type ditempatkan di `packages/shared-types/` jika dipakai >1 package
2. [ ] Setiap file punya barrel export
3. [ ] Tidak ada `any` (gunakan `unknown` + guard)
4. [ ] Enum punya label map untuk UI display
5. [ ] Type guard untuk setiap discriminated union atau unknown input

## Yang TIDAK BOLEH
- Tidak boleh import dari `@app/` atau `@web/` di shared-types
- Tidak boleh class-validator decorator di shared-types (itu domain NestJS)
- Tidak boleh `export default` (gunakan named exports)
- Tidak boleh types yang hanya dipakai satu tempat di shared-types
