---
name: nestjs-api
description: Membuat fitur API baru di NestJS - controller, service, module, DTO, dan test stubs
tags: [nest, backend, api, rest]
compatibility: [nest, opencode, claude, cursor]
---

# NestJS API Feature

## Kapan Pakai
Saat diminta membuat endpoint API baru, menambahkan route, controller, service, guard, interceptor, atau modul NestJS.

## Konvensi yang WAJIB Diikuti

### Struktur File
```
apps/api/src/modules/<feature>/
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.module.ts
  dto/
    create-<feature>.dto.ts
    update-<feature>.dto.ts
    <feature>-response.dto.ts
  <feature>.spec.ts
  index.ts                    # barrel export
```

### Controller Pattern
```typescript
import { Controller, Get, Post, Body, Param, Patch, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFooDto } from './dto/create-foo.dto';
import { UpdateFooDto } from './dto/update-foo.dto';
import { FooResponseDto } from './dto/foo-response.dto';

@ApiTags('Foo')
@Controller('foos')
export class FooController {
  constructor(private readonly fooService: FooService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new foo' })
  @ApiResponse({ status: 201, type: FooResponseDto })
  async create(@Body() dto: CreateFooDto): Promise<FooResponseDto> {
    return this.fooService.create(dto);
  }
}
```

### DTO Pattern (class-validator)
```typescript
import { IsString, IsOptional, IsUUID, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFooDto {
  @ApiProperty({ example: 'My Foo', minLength: 1, maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
```

### Service Pattern
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/prisma';

@Injectable()
export class FooService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFooDto): Promise<FooResponseDto> {
    const entity = await this.prisma.foo.create({ data: dto });
    return this.toResponseDto(entity);
  }

  private toResponseDto(entity: any): FooResponseDto {
    // Map entity ke response DTO
  }
}
```

### Module Registration
```typescript
import { Module } from '@nestjs/common';
import { FooController } from './foo.controller';
import { FooService } from './foo.service';

@Module({
  controllers: [FooController],
  providers: [FooService],
  exports: [FooService],
})
export class FooModule {}
```

## Checklist Saat Membuat API
1. [ ] Buat DTO dengan class-validator decorators + Swagger annotations
2. [ ] Buat Service dengan Prisma calls (injeksi PrismaService)
3. [ ] Buat Controller dengan proper HTTP method decorators + Swagger
4. [ ] Buat Module yang mendaftarkan controller & service
5. [ ] Register module di `AppModule` atau parent module
6. [ ] Tambahkan barrel export di `index.ts`
7. [ ] Buat spec file stub
8. [ ] Pastikan response DTO tidak expose internal fields (id UUID, password hash, dll)
9. [ ] Gunakan ParseUUIDPipe untuk parameter UUID
10. [ ] Return typed response (bukan raw Prisma entity)

## Yang TIDAK BOLEH
- Tidak boleh ada business logic di Controller
- Tidak boleh query Prisma langsung di Controller
- Tidak boleh `process.env` di Service (pakai ConfigModule)
- Tidak boleh throw `new Error()` generic (pakai `HttpException` atau custom exception)
- Tidak boleh `any` type di DTO atau response
