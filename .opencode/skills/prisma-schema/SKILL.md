---
name: prisma-schema
description: Schema dan migration Prisma di apps/api — model, relation, index, konvensi migration snake_case, seed, dan verifikasi prisma validate/migrate
tags: [fullstack, backend, prisma, database, migration, schema]
compatibility: [next, opencode, claude, cursor]
---

# Prisma Schema & Migration

## Kapan Pakai
WAJIB saat membuat/mengubah `apps/api/prisma/schema.prisma`, menambah migration, atau mengubah seed. Gunakan bersama `backend-nestjs` (service yang memakai model) dan `shared-types` (tipe kontrak yang mencerminkan model).

## Lokasi & Struktur

```text
apps/api/prisma/
  schema.prisma
  migrations/<timestamp>_<snake_case_name>/migration.sql
  seed.ts
```

Status saat ini: folder `prisma` belum ada di `apps/api` (dependency Prisma juga belum terpasang). Saat memperkenalkan Prisma pertama kali, **minta konfirmasi dulu** (dependency baru), lalu ikuti konvensi di bawah secara konsisten sejak file pertama.

## Pola Schema (WAJIB Ikuti)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      UserRole @default(viewer)
  status    UserStatus @default(pending)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
  @@map("users")
}

enum UserRole {
  admin
  editor
  viewer
  @@map("user_role")
}
```

**Checklist schema:**
- [ ] Model PascalCase, field camelCase, tabel/kolom fisik di-`@@map`/`@map` ke snake_case
- [ ] Enum Prisma mengikuti union type di `@shared/types` (nilai sama persis)
- [ ] `id` uuid + `createdAt`/`updatedAt` di setiap model domain
- [ ] Relation eksplisit dua arah dengan `onDelete` yang disengaja
- [ ] Index untuk FK dan kolom yang sering di-filter/sort (mis. `status`, `createdAt`)
- [ ] Tidak ada model duplikat dengan entitas yang sudah ada — cek schema dulu

## Migration

- Selalu via CLI, jangan edit folder migration lama:

```bash
pnpm --filter @app/api exec prisma migrate dev --name add_users_table
```

- Nama migration snake_case dan deskriptif: `add_users_table`, `add_status_index_master_data`.
- Migration generated TIDAK diedit manual; perubahan tambahan = migration baru.
- Breaking change (hapus kolom/rename) → konfirmasi dulu + catat di story/CR.

## Seed

- Seed idempotent (pakai `upsert`), deterministik, tanpa data produksi asli.
- Seed hanya untuk development/staging; jangan menaruh secret.

## Sinkron dengan shared-types

- Setelah perubahan model, cek apakah tipe di `packages/shared-types` perlu menyesuaikan (field baru → optional/`unknown` dulu bila belum dipakai consumer).
- Jangan generate tipe Prisma langsung ke consumer app; kontrak tetap lewat `@shared/types`.

## Verification Commands

```bash
pnpm --filter @app/api exec prisma validate
pnpm --filter @app/api exec prisma migrate dev --name <nama>
pnpm --filter @app/api build:types
pnpm typecheck
```

## Anti-Patterns

- ✗ Edit file migration yang sudah di-apply
- ✗ `prisma db push` di lingkungan bersama (pakai migration)
- ✗ Enum Prisma yang tidak sinkron dengan union type di `@shared/types`
- ✗ Kolom tanpa index yang jadi filter utama query
- ✗ Menambah dependency Prisma/engine tanpa konfirmasi

## Decision Points (ditentukan PRD/design — bukan di sini)

| Decision Point | Opsi umum | Kapan pilih mana |
|---|---|---|
| Soft delete vs hard delete | `deletedAt` vs hapus fisik | regulasi/audit vs kesederhanaan (PRD) |
| Optimistic locking | `version` field vs last-write-wins | frekuensi concurrent edit per entitas |
| Cascade strategy | `Cascade` vs `SetNull` vs `Restrict` per relation | ekspektasi lifecycle data di PRD |
| Generator ID | uuid vs cuid vs ulid | sortability & ukuran index |
| Archival/partition | tabel panas vs arsip | volume data jangka panjang (bisa nanti, 3x rule) |

## Edge Cases Umum (kandidat AC story)

- [ ] Unique constraint race (dua register email sama bersamaan)
- [ ] Lost update (dua edit bersamaan, satu tertimpa diam-diam)
- [ ] Cascade delete yang tidak disengaja (hapus parent menghapus data penting)
- [ ] Migration di tabel besar → lock/downtime; butuh strategi batch
- [ ] Enum Prisma drift dengan union type di `@shared/types`

## Integration with Other Skills

- **Sebelum**: `decision-framework`, konfirmasi dependency saat first-time setup
- **Selama**: `backend-nestjs` (service akses DB), `shared-types` (sinkron enum/shape)
- **Setelah**: `api-testing` (test service/endpoint), `monorepo-ci`

## Checklist

1. [ ] `prisma validate` hijau
2. [ ] Migration baru dibuat via CLI dengan nama snake_case
3. [ ] Schema konsisten dengan tipe di `@shared/types`
4. [ ] Index & relation lengkap
5. [ ] `build:types` dan `pnpm typecheck` hijau
