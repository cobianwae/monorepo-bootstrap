---
name: prisma-schema
description: Mendesain dan memodifikasi Prisma schema, membuat migration, dan mengelola relasi database
tags: [prisma, database, schema, migration, sql]
compatibility: [prisma, opencode, claude, cursor]
---

# Prisma Schema

## Kapan Pakai
Saat diminta membuat model baru, mengubah schema, menambahkan relasi, membuat migration, atau query Prisma yang kompleks.

## Aturan Utama
1. **Semua perubahan schema wajib lewat file** `apps/api/prisma/schema.prisma`.
2. **Selalu buat migration** setelah mengubah schema: `pnpm prisma migrate dev --name descriptive-name`.
3. **Jangan edit migration files manual**. Edit schema, lalu regenerate.
4. **Gunakan Prisma Client typed**. Tidak boleh `prisma.$queryRaw` kecuali benar-benar perlu.

## Konvensi Schema

### Naming
- Model: **PascalCase** tunggal (`User`, bukan `Users`)
- Field: **camelCase**
- Table (auto): snake_case (Prisma handle via `@@map`)
- Enum: **PascalCase**, values **SCREAMING_SNAKE_CASE**

### Template Model
```prisma
model Example {
  id        String   @id @default(uuid()) @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id])

  @@map("examples")
}
```

### Field Rules
- ID selalu `String @id @default(uuid()) @db.Uuid` kecuali ada alasan khusus.
- Timestamp wajib: `createdAt`, `updatedAt`.
- Soft delete: tambah `deletedAt DateTime? @map("deleted_at")`.
- Nullable field gunakan `?`, bukan `@default(null)`.
- String field wajib punya constraint: `@db.VarChar(255)` atau `@db.Text`.

### Relasi
```prisma
// One-to-Many
model Post {
  id     String @id @default(uuid())
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id])
}

// Many-to-Many (implicit join table)
model Tag {
  id    String @id @default(uuid())
  posts Post[]
}

// Many-to-Many (explicit - preferred untuk metadata)
model PostTag {
  postId String @map("post_id")
  tagId  String @map("tag_id")
  post   Post   @relation(fields: [postId], references: [id])
  tag    Tag    @relation(fields: [tagId], references: [id])

  @@id([postId, tagId])
  @@map("post_tags")
}
```

### Enum
```prisma
enum Role {
  ADMIN   @map("admin")
  MEMBER  @map("member")
  GUEST   @map("guest")
}
```

## Query Patterns

### Create with relation
```typescript
await this.prisma.order.create({
  data: {
    items: {
      create: dto.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    },
  },
  include: { items: { include: { product: true } } },
});
```

### Pagination
```typescript
const [data, total] = await Promise.all([
  this.prisma.item.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  }),
  this.prisma.item.count(),
]);
```

## Checklist
1. [ ] Model mengikuti template (id, createdAt, updatedAt, @@map)
2. [ ] Field punya tipe yang spesifik dan constraint
3. [ ] Relasi didefinisikan dua arah (kecuali self-relation)
4. [ ] Enum values pakai SCREAMING_SNAKE_CASE dengan @map
5. [ ] Migration di-generate dan di-review
6. [ ] Tidak ada `@default(dbgenerated())` tanpa migration SQL custom

## Yang TIDAK BOLEH
- Tidak boleh hapus migration yang sudah ada (bikin migration baru untuk revert)
- Tidak boleh edit file migration manual
- Tidak boleh `prisma.$queryRawUnsafe`
- Tidak boleh relasi tanpa `onDelete` jika ada foreign key concern
- Tidak boleh `@default(now())` di field yang bukan timestamp